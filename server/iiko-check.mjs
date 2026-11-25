const localTime = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Irkutsk', dateStyle: 'short', timeStyle: 'medium',
});

export async function checkIikoAccess(env, request = fetch) {
  const token = env.IIKO_HOTEL_TOKEN?.trim();
  let base;
  try {
    base = new URL(env.IIKO_BASE_URL);
    if (!token || base.protocol !== 'https:' || base.username || base.password || base.search || base.hash ||
        !base.pathname.replace(/\/+$/, '').endsWith('/iikoapi')) return 'not_configured';
  } catch {
    return 'not_configured';
  }
  base.pathname = base.pathname.replace(/\/+$/, '') + '/';
  const url = new URL('persons', base);
  url.searchParams.set('Data', localTime.format(new Date()));
  try {
    const response = await request(url, {
      headers: { 'Hotel-Token': token, Accept: 'application/json' },
      signal: AbortSignal.timeout(6500),
      redirect: 'manual',
    });
    if (!response.ok) {
      await response.body?.cancel();
      return response.status === 401 || response.status === 403 ? 'access_denied' : 'unavailable';
    }
    const payload = await response.json();
    if (Array.isArray(payload)) return 'connected';
    return payload?.success === 0 ? 'access_denied' : 'unavailable';
  } catch {
    return 'unavailable';
  }
}

if (process.argv[2] === '--check') {
  const status = await checkIikoAccess(process.env);
  console.log('ECVI/iiko: ' + status);
  if (status !== 'connected') process.exitCode = 1;
}
