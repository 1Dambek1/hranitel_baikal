const ecviCalendarCache = new WeakMap();
const ecviCalendarDate = timestamp => new Date(timestamp).toISOString().slice(0, 10);

async function loadEcviCalendar(env, settings, from, until) {
  const inventory = new Map();
  const signal = AbortSignal.timeout(20000);
  let segment = env.ECVI_SEGMENT_ID?.trim();
  try {
    if (!segment) {
      const segments = await readEcvi('segments', {}, settings, signal);
      if (segments?.length !== 1 || !segments[0]?.SegmentID) return inventory;
      segment = String(segments[0].SegmentID);
    }
  } catch {
    return inventory;
  }
  async function readNight(timestamp) {
    try {
      const arrival = ecviCalendarDate(timestamp);
      const departure = ecviCalendarDate(timestamp + overnight);
      const result = await readEcvi('avaliable_resources', ecviStayFilter(segment, arrival, departure), settings, signal);
      if (!result || result.some(item => {
        const id = item?.ResourceID;
        return !(typeof id === 'string' && id.trim()) && !Number.isSafeInteger(id);
      })) return false;
      inventory.set(arrival, new Set(result.map(item => String(item.ResourceID).trim())));
      return true;
    } catch {
      return false;
    }
  }

  // Check the first night before fan-out so bad credentials do not generate a month of failed requests.
  if (!await readNight(from)) return inventory;
  let nextNight = from + overnight;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (nextNight < until && !signal.aborted) {
      const timestamp = nextNight;
      nextNight += overnight;
      await readNight(timestamp);
    }
  }));
  return inventory;
}

function ecviCalendarInventory(env, settings, month, from, until) {
  let cache = ecviCalendarCache.get(env);
  if (!cache) {
    cache = new Map();
    ecviCalendarCache.set(env, cache);
  }
  const cacheKey = month + ':' + from;
  const saved = cache.get(cacheKey);
  if (saved && saved.expiresAt > Date.now()) return saved.inventory;
  if ([...cache.values()].filter(entry => entry.expiresAt === Infinity).length >= 2) {
    return new Map();
  }
  if (cache.size >= 16) cache.delete(cache.keys().next().value);
  const entry = { expiresAt: Infinity };
  entry.inventory = loadEcviCalendar(env, settings, from, until).then(inventory => {
    entry.expiresAt = Date.now() + (inventory.size ? 60_000 : 10_000);
    return inventory;
  });
  cache.set(cacheKey, entry);
  return entry.inventory;
}

async function checkEcviCalendar(requestUrl, env, origin) {
  const respond = ecviJsonResponder(env, origin);
  const room = requestUrl.searchParams.get('room');
  const month = requestUrl.searchParams.get('month');
  if (!/^(?:[1-9]|1[0-7])$/.test(room ?? '') || !/^\d{4}-\d{2}$/.test(month ?? '')) {
    return respond('invalid_room_or_month', {}, 400);
  }
  const monthStart = parseCalendar(month + '-01');
  const today = parseCalendar(dateInListvyanka.format(new Date()));
  const limit = today + 365 * overnight;
  if (!Number.isFinite(monthStart) || monthStart > limit) return respond('invalid_room_or_month', {}, 400);
  const first = new Date(monthStart);
  const from = Math.max(monthStart, today);
  const until = Math.min(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 1), limit);
  if (until <= from) return respond('invalid_room_or_month', {}, 400);

  const settings = ecviSettings(env);
  if (!settings) return respond('not_configured');
  let resourceId;
  try {
    const mapping = JSON.parse(env.ECVI_ROOM_RESOURCE_IDS ?? '{}');
    resourceId = mapping && Object.hasOwn(mapping, room) ? mapping[room] : null;
  } catch {
    return respond('room_unmapped');
  }
  if (typeof resourceId !== 'string' || !resourceId.trim()) return respond('room_unmapped');
  const inventory = await ecviCalendarInventory(env, settings, month, from, until);
  if (!inventory.size) return respond('source_unavailable');
  const nights = Object.fromEntries([...inventory].map(([date, resourceIds]) =>
    [date, resourceIds.has(resourceId.trim()) ? 'free' : 'busy']));
  return respond('live', { room, month, nights });
}
