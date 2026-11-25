const ecviBase = 'https://demo2.ecvi.ru/pmsapi';
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

async function readEcvi(path, filter, env, signal) {
  const url = new URL(ecviBase + path);
  url.search = new URLSearchParams({ HotelID: env.ECVI_HOTEL_ID, ...filter }).toString();
  const response = await fetch(url, {
    headers: { 'Hotel-Token': env.ECVI_HOTEL_TOKEN, Accept: 'application/json' },
    signal,
    redirect: 'manual',
  });
  if (!response.ok) {
    await response.body?.cancel();
    return { status: response.status };
  }
  const data = await response.json();
  return Array.isArray(data) ? { data } : { status: 502 };
}

async function checkEcviAvailability(requestUrl, env) {
  const respond = (status, extra = {}, httpStatus = 200) =>
    Response.json({ status, ...extra }, { status: httpStatus, headers: { 'Cache-Control': 'no-store' } });
  const query = requestUrl.searchParams;
  const room = rooms.find(item => item.id === query.get('room'));
  const arrival = query.get('arrival');
  const departure = query.get('departure');
  const start = parseCalendar(arrival);
  const nights = (parseCalendar(departure) - start) / overnight;
  if (!room || !Number.isInteger(nights) || nights < 1 || nights > 365 ||
      start < parseCalendar(dateInListvyanka.format(new Date()))) {
    return respond('invalid_dates_or_category', {}, 400);
  }
  if (!env.ECVI_HOTEL_ID || !env.ECVI_HOTEL_TOKEN) return respond('not_configured');

  const signal = AbortSignal.timeout(6500);
  try {
    let segment = env.ECVI_SEGMENT_ID;
    if (!segment) {
      const segments = await readEcvi('/segments', {}, env, signal);
      if (!segments.data) return respond('source_unavailable');
      if (segments.data.length !== 1 || !segments.data[0]?.SegmentID) return respond('segment_unmapped');
      segment = String(segments.data[0].SegmentID);
    }
    const types = await readEcvi('/resourcetypes', { SegmentID: segment }, env, signal);
    if (!types.data) return respond('source_unavailable');
    const names = types.data.filter(item => normalizeCategory(item.Name) === normalizeCategory(room.name));
    if (names.length !== 1 || !names[0]?.ResourceTypeID) return respond('category_unmapped');
    const typeID = String(names[0].ResourceTypeID);
    const levels = await readEcvi('/avaliable_resourcetypes', {
      SegmentID: segment,
      CheckIn: arrival + ' 14:00:00',
      CheckOut: departure + ' 12:00:00',
    }, env, signal);
    if (!levels.data) return respond('source_unavailable');
    const counts = levels.data.filter(item => String(item.ResourceTypeID) === typeID)
      .map(item => Number(item.FreeRoomsCount));
    if (counts.some(count => !Number.isSafeInteger(count) || count < 0)) return respond('source_unavailable');
    return respond('live', { available: Math.max(0, ...counts) });
  } catch {
    return respond('source_unavailable');
  }
}
