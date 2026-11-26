const overnight = 86_400_000;
const dateInListvyanka = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Irkutsk', dateStyle: 'short' });

function parseCalendar(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return NaN;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN;
}

function normalizeCategory(value) {
  return String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru');
}

function ecviSettings(env, external = false) {
  const hotelId = env.ECVI_HOTEL_ID?.trim();
  const prefix = external ? 'ECVI_EXT_PMS' : 'ECVI_PMS';
  const baseUrl = env[prefix + '_BASE_URL'];
  if (!hotelId || !baseUrl) return null;
  try {
    const base = new URL(baseUrl);
    const apiPath = external ? '/extpmsapi' : '/pmsapi';
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash ||
        !base.pathname.replace(/\/+$/, '').endsWith(apiPath)) return null;
    base.pathname = base.pathname.replace(/\/+$/, '') + '/';
    const token = (external ? env.ECVI_EXT_PMS_HOTEL_TOKEN : env.ECVI_HOTEL_TOKEN)?.trim();
    if (token) return { base, hotelId, external, authorization: { 'Hotel-Token': token } };
    const username = env[prefix + '_USERNAME'];
    const password = env[prefix + '_PASSWORD'];
    if (!username || username.includes(':') || !password) return null;
    const credentials = new TextEncoder().encode(username + ':' + password);
    const basic = btoa(Array.from(credentials, byte => String.fromCharCode(byte)).join(''));
    return { base, hotelId, external, authorization: { Authorization: 'Basic ' + basic } };
  } catch {
    return null;
  }
}

function ecviAvailabilitySettings(env) {
  return ecviSettings(env) ?? ecviSettings(env, true);
}

async function requestEcvi(path, filter, settings, signal) {
  const url = new URL(path, settings.base);
  url.search = new URLSearchParams({ HotelID: settings.hotelId, ...filter });
  const response = await fetch(url, {
    headers: { ...settings.authorization, Accept: 'application/json' },
    signal,
    redirect: 'manual',
  });
  if (!response.ok) {
    await response.body?.cancel();
    return { status: response.status };
  }
  return { status: response.status, data: await response.json() };
}

async function readEcvi(path, filter, settings, signal) {
  const { data } = await requestEcvi(path, filter, settings, signal);
  return Array.isArray(data) ? data : null;
}

function ecviStayFilter(segment, arrival, departure) {
  return { SegmentID: segment, CheckIn: arrival + ' 14:00:00', CheckOut: departure + ' 12:00:00' };
}

function configuredRoomType(room, env) {
  if (!env.ECVI_ROOM_TYPE_IDS) return;
  const mapping = JSON.parse(env.ECVI_ROOM_TYPE_IDS);
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) throw new Error('Invalid room types');
  if (!Object.hasOwn(mapping, room.id)) return;
  const id = mapping[room.id];
  if (typeof id !== 'string' || !id.trim()) throw new Error('Invalid room type');
  return id.trim();
}

function ecviRoomQuote(rows, adults, env) {
  if (!adults || !env.ECVI_TARIFF_ID || !env.ECVI_DIET_ID) return;
  const matching = rows.filter(row => String(row.TariffID) === env.ECVI_TARIFF_ID &&
    String(row.DietID) === env.ECVI_DIET_ID && Number(row.FreeRoomsCount) > 0);
  if (matching.length !== 1) return;
  const price = matching[0]['TotalRoomPrice' + adults + 'Adult'];
  if (typeof price === 'number' && Number.isFinite(price) && price > 0) return { amount: price, adults };
}

function ecviRoomAvailability(room, typeId, levels, adults, env) {
  const rows = levels.filter(item => String(item?.ResourceTypeID) === typeId);
  if (!rows.length) return null;
  const counts = rows.map(item => {
    const count = item.FreeRoomsCount;
    return typeof count === 'number' || /^\d+$/.test(count ?? '') ? Number(count) : NaN;
  });
  if (counts.some(count => !Number.isSafeInteger(count) || count < 0)) return { invalid: true };
  const quote = ecviRoomQuote(rows, adults <= room.base ? adults : 0, env);
  return { available: counts.reduce((highest, count) => Math.max(highest, count), 0), ...(quote && { quote }) };
}

function matchEcviRoomType(room, types) {
  const matching = types.filter(item => normalizeCategory(item?.Name) === normalizeCategory(room.name));
  return matching.length === 1 && matching[0]?.ResourceTypeID ? String(matching[0].ResourceTypeID) : null;
}

function ecviJsonResponder(env, origin) {
  const headers = { 'Cache-Control': 'no-store', Vary: 'Origin' };
  try {
    const client = new URL(env.MINI_APP_ORIGIN);
    if (client.protocol === 'https:' && !client.username && !client.password &&
        client.pathname === '/' && !client.search && !client.hash && origin === client.origin) {
      headers['Access-Control-Allow-Origin'] = client.origin;
    }
  } catch {
    // Same-origin availability works without a separate mini-app origin.
  }
  return (status, extra = {}, httpStatus = 200) =>
    Response.json({ status, ...extra }, { status: httpStatus, headers });
}

async function checkEcviAvailability(requestUrl, env, origin) {
  const respond = ecviJsonResponder(env, origin);
  const query = requestUrl.searchParams;
  const roomId = query.get('room');
  const all = roomId === 'all';
  const room = rooms.find(item => item.id === roomId);
  const arrival = query.get('arrival');
  const departure = query.get('departure');
  const start = parseCalendar(arrival);
  const nights = (parseCalendar(departure) - start) / overnight;
  const adults = query.has('adults') ? Number(query.get('adults')) : 0;
  if ((!room && !all) || !Number.isInteger(nights) || nights < 1 || nights > 365 ||
      start < parseCalendar(dateInListvyanka.format(new Date())) ||
      (query.has('adults') && (!Number.isInteger(adults) || adults < 1 || adults > (all ? 3 : room.base)))) {
    return respond('invalid_dates_or_category', {}, 400);
  }
  const settings = ecviAvailabilitySettings(env);
  if (!settings) return respond('not_configured');

  const signal = AbortSignal.timeout(6500);
  try {
    let segment = env.ECVI_SEGMENT_ID?.trim();
    if (!segment) {
      if (settings.external) return respond('segment_unmapped');
      const segments = await readEcvi('segments', {}, settings, signal);
      if (!segments) return respond('source_unavailable');
      if (segments.length !== 1 || !segments[0]?.SegmentID) return respond('segment_unmapped');
      segment = String(segments[0].SegmentID);
    }
    const categories = (all ? rooms : [room]).map(item => ({ item, typeId: configuredRoomType(item, env) }));
    if (!settings.external && categories.some(category => !category.typeId)) {
      const types = await readEcvi('resourcetypes', { SegmentID: segment }, settings, signal);
      if (!types) return respond('source_unavailable');
      for (const category of categories) category.typeId ||= matchEcviRoomType(category.item, types);
    }
    if (categories.every(category => !category.typeId)) return respond('category_unmapped');
    const levels = await readEcvi('avaliable_resourcetypes', ecviStayFilter(segment, arrival, departure), settings, signal);
    if (!levels) return respond('source_unavailable');
    let malformed = false;
    const offers = categories.flatMap(({ item, typeId }) => {
      const offer = typeId && ecviRoomAvailability(item, typeId, levels, adults, env);
      if (offer?.invalid) {
        malformed = true;
        return [];
      }
      return offer ? [{ room: item.id, ...offer }] : [];
    });
    if (!offers.length) return respond(malformed ? 'source_unavailable' : 'no_offer');
    if (all) return respond('live', { categories: offers });
    const { available, quote } = offers[0];
    return respond('live', { available, ...(quote && { quote }) });
  } catch {
    return respond('source_unavailable');
  }
}

export async function diagnoseEcvi(env, dates = [], external = false) {
  const settings = external ? ecviSettings(env, true) : ecviAvailabilitySettings(env);
  if (!settings) return { status: 'not_configured' };
  const today = parseCalendar(dateInListvyanka.format(new Date()));
  const arrival = dates[0] ?? new Date(today + overnight).toISOString().slice(0, 10);
  const start = parseCalendar(arrival);
  if (!Number.isFinite(start) || start < today) return { status: 'invalid_dates' };
  const departure = dates[1] ?? new Date(start + overnight).toISOString().slice(0, 10);
  const stay = (parseCalendar(departure) - start) / overnight;
  if (!Number.isInteger(stay) || stay < 1 || stay > 365) return { status: 'invalid_dates' };
  const checks = {};
  async function inspect(path, filter, getList = data => data) {
    try {
      const { status, data } = await requestEcvi(path, filter, settings, AbortSignal.timeout(6500));
      const list = getList(data);
      checks[path] = { http: status, ...(Array.isArray(list) && { count: list.length }) };
      return Array.isArray(list) ? list : null;
    } catch {
      checks[path] = { status: 'unavailable' };
      return null;
    }
  }

  const segments = settings.external ? null : await inspect('segments', {});
  const segment = env.ECVI_SEGMENT_ID?.trim() || (segments?.length === 1 && segments[0]?.SegmentID);
  if (!segment) return { status: segments || settings.external ? 'segment_unmapped' : 'source_unavailable', checks };
  const filter = ecviStayFilter(String(segment), arrival, departure);
  if (settings.external) {
    const offers = await inspect('avaliable_resourcetypes', filter);
    const offeredTypes = [...new Set((offers ?? []).flatMap(row => {
      const id = row?.ResourceTypeID;
      const numericString = typeof id === 'string' && /^\d+$/.test(id);
      return numericString || Number.isSafeInteger(id) ? [String(id)] : [];
    }))];
    const mapping = Object.fromEntries(rooms.map(room => [room.id, configuredRoomType(room, env) ?? null]));
    return { status: offers ? 'connected' : 'source_unavailable', api: 'extpmsapi', arrival, departure,
      segment: String(segment), mapping, offeredTypes, checks };
  }
  const [types, offers, specificRooms, services] = await Promise.all([
    inspect('resourcetypes', { SegmentID: filter.SegmentID }),
    inspect('avaliable_resourcetypes', filter),
    inspect('avaliable_resources', filter),
    inspect('additional_service_list', {}, data => data?.Items),
  ]);
  const mapping = Object.fromEntries(rooms.map(room => [
    room.id, configuredRoomType(room, env) ?? (types && matchEcviRoomType(room, types)) ?? null,
  ]));
  return { status: types && offers && specificRooms && services ? 'connected' : 'partial',
    arrival, departure, segment: String(segment), mapping, checks };
}
