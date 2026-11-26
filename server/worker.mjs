const contentType = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  webp: 'image/webp',
  png: 'image/png',
  woff2: 'font/woff2',
  txt: 'text/plain; charset=utf-8',
};

function adminContact(env) {
  try {
    const url = new URL(env.MAX_ADMIN_CHAT_URL);
    if (url.origin === 'https://max.ru' && !url.username && !url.password && url.pathname !== '/') return url.href;
  } catch {
    return null;
  }
  return null;
}

export default {
  async fetch(request, env, context) {
    const requestUrl = new URL(request.url);
    const { pathname } = requestUrl;
    if (pathname === '/max/webhook') return acceptWebhook(request, env, context);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    if (pathname === '/api/availability' && request.method === 'GET') {
      return checkEcviAvailability(requestUrl, env, request.headers.get('Origin'));
    }
    if (pathname === '/api/calendar' && request.method === 'GET') {
      return checkEcviCalendar(requestUrl, env, request.headers.get('Origin'));
    }
    if (pathname === '/hotel-contact.json') {
      const phone = /^\+7\d{10}$/.test(env.MAX_ADMIN_PHONE ?? '') ? env.MAX_ADMIN_PHONE : '+79953235878';
      return Response.json({ chatUrl: adminContact(env), phone, hotelBookingUrl: env.BAIKAL_HOTEL_BOOKING_URL,
        gastroBookingUrl: env.BAIKAL_GASTRO_BOOKING_URL }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const path = pathname === '/' ? '/index.html' : pathname;
    if (!Object.hasOwn(embeddedFiles, path)) return new Response('Not found', { status: 404 });
    const headers = {
      'Content-Type': contentType[path.split('.').at(-1)],
      'Cache-Control': path.startsWith('/photos/') ? 'public, max-age=86400' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    };
    let body = request.method === 'HEAD' ? null : Uint8Array.from(atob(embeddedFiles[path]), char => char.charCodeAt(0));
    if (path === '/index.html' && body && ecviAvailabilitySettings(env)) {
      body = new TextDecoder().decode(body).replace(
        'name="baikal-availability-url" content=""',
        'name="baikal-availability-url" content="./api/availability"',
      );
    }
    return new Response(body, { headers });
  },
};
