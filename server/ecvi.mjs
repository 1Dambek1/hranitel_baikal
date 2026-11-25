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

function ecviSettings(env) {
  if (!env.ECVI_HOTEL_ID?.trim() || !env.ECVI_HOTEL_TOKEN?.trim() || !env.ECVI_PMS_BASE_URL) return null;
  try {
    const base = new URL(env.ECVI_PMS_BASE_URL);
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash ||
        !base.pathname.replace(/\/+$/, '').endsWith('/pmsapi')) return null;
    base.pathname = base.pathname.replace(/\/+$/, '') + '/';
    return { base, hotelId: env.ECVI_HOTEL_ID.trim(), token: env.ECVI_HOTEL_TOKEN.trim() };
  } catch {
    return null;
  }
}

async function readEcvi(path, filter, settings, signal) {
  const url = new URL(path, settings.base);
  url.search = new URLSearchParams({ HotelID: settings.hotelId, ...filter });
  const response = await fetch(url, {
    headers: { 'Hotel-Token': settings.token, Accept: 'application/json' },
    signal,
    redirect: 'manual',
  });
  if (!response.ok) {
    await response.body?.cancel();
    return null;
  }
  const data = await response.json();
  return Array.isArray(data) ? data : null;
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

async function checkEcviAvailability(requestUrl, env, origin) {
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
  const respond = (status, extra = {}, httpStatus = 200) =>
    Response.json({ status, ...extra }, { status: httpStatus, headers });
  const query = requestUrl.searchParams;
  const room = rooms.find(item => item.id === query.get('room'));
  const arrival = query.get('arrival');
  const departure = query.get('departure');
  const start = parseCalendar(arrival);
  const nights = (parseCalendar(departure) - start) / overnight;
  const adults = query.has('adults') ? Number(query.get('adults')) : 0;
  if (!room || !Number.isInteger(nights) || nights < 1 || nights > 365 ||
      start < parseCalendar(dateInListvyanka.format(new Date())) ||
      (query.has('adults') && (!Number.isInteger(adults) || adults < 1 || adults > room.base))) {
    return respond('invalid_dates_or_category', {}, 400);
  }
  const settings = ecviSettings(env);
  if (!settings) return respond('not_configured');

  const signal = AbortSignal.timeout(6500);
  try {
    let segment = env.ECVI_SEGMENT_ID?.trim();
    if (!segment) {
      const segments = await readEcvi('segments', {}, settings, signal);
      if (!segments) return respond('source_unavailable');
      if (segments.length !== 1 || !segments[0]?.SegmentID) return respond('segment_unmapped');
      segment = String(segments[0].SegmentID);
    }
    let typeId = configuredRoomType(room, env);
    if (!typeId) {
      const types = await readEcvi('resourcetypes', { SegmentID: segment }, settings, signal);
      if (!types) return respond('source_unavailable');
      const matching = types.filter(item => normalizeCategory(item?.Name) === normalizeCategory(room.name));
      if (matching.length !== 1 || !matching[0]?.ResourceTypeID) return respond('category_unmapped');
      typeId = String(matching[0].ResourceTypeID);
    }
    const levels = await readEcvi('avaliable_resourcetypes', {
      SegmentID: segment,
      CheckIn: arrival + ' 14:00:00',
      CheckOut: departure + ' 12:00:00',
    }, settings, signal);
    if (!levels) return respond('source_unavailable');
    const rows = levels.filter(item => String(item?.ResourceTypeID) === typeId);
    if (!rows.length) return respond('no_offer');
    const counts = rows.map(item => {
      const count = item.FreeRoomsCount;
      return typeof count === 'number' || /^\d+$/.test(count ?? '') ? Number(count) : NaN;
    });
    if (counts.some(count => !Number.isSafeInteger(count) || count < 0)) return respond('source_unavailable');
    const quote = ecviRoomQuote(rows, adults, env);
    return respond('live', { available: Math.max(...counts), ...(quote && { quote }) });
  } catch {
    return respond('source_unavailable');
  }
}
