const miniApp = 'https://max.ru/id3812997183_bot?startapp';
const hotelPhone = '+7 995 323-58-78';
const hotelAddress = 'Листвянка, ул. Партизанская, 1';
const gastroMenu = 'https://hranitelbaikala.myresto.online/ru/category/zakuski';
const routeUrl = 'https://yandex.ru/maps/?rtext=~' + encodeURIComponent(hotelAddress);
const dayMs = 86_400_000;
const dayAtHotel = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Irkutsk', dateStyle: 'short' });
const shortDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

const key = (text, payload) => ({ type: 'callback', text, payload });
const link = (text, url) => ({ type: 'link', text, url });
const homeRow = [key('Главное меню', 'menu')];
const appRow = [link('Мини-приложение', miniApp)];

function card(text, buttons, photo) {
  const attachments = [{ type: 'inline_keyboard', payload: { buttons } }];
  if (photo) attachments.unshift({ type: 'image', payload: { url: photo } });
  return { text, format: 'markdown', attachments };
}

function mainMenu() {
  return card('**Хранитель Байкала**\nОтель в Листвянке. Что хотите посмотреть?', [
    [key('Номера', 'rooms'), key('Демо брони', 'book')],
    [key('Фото', 'photos'), key('Маршрут', 'map')],
    [key('Гастродом', 'gastro'), key('Конференции', 'hall')],
    appRow,
  ]);
}

function listRooms(forBooking) {
  const action = forBooking ? 'book' : 'room';
  const buttons = rooms.map(room => [key(room.name, action + ':' + room.id)]);
  return card(forBooking ? '**Демо бронирования**\nВыберите категорию номера.' : '**Номера отеля**\nВыберите категорию, чтобы посмотреть цены и условия.', [...buttons, homeRow]);
}

function showRoom(room) {
  const rate = room.extra ? 'Дополнительное место — ' + money.format(room.extra) + '/сутки' : ageBasedExtraGuestRates;
  return card(
    '**' + room.name + '**\n' + room.facts.join(' · ') + '\n\nВ будни — ' + money.format(room.weekday) +
    ' за сутки\nВ выходные — ' + money.format(room.weekend) + ' за сутки\n\n' + room.note +
    '\n\nТариф на ' + room.base + ' гостей · до ' + room.max + ' гостей в номере\n' + rate + '\nЗавтрак — 500 ₽ за гостя',
    [[key('Выбрать даты', 'book:' + room.id)], [key('Все номера', 'rooms')], appRow, homeRow]
  );
}

function isoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function book(room, date, nightsValue, guestsValue, today) {
  const prefix = 'book:' + room.id;
  if (!date) {
    const saturday = (6 - new Date(today).getUTCDay() + 7) % 7;
    const choices = [...new Set([0, 1, saturday, 2, 3])].slice(0, 4);
    return card('**' + room.name + ' · демо**\nНа какую дату планируете заезд?', [
      ...choices.map(offset => {
        const arrival = today + offset * dayMs;
        return [key(shortDate.format(arrival), prefix + ':' + isoDate(arrival))];
      }),
      appRow,
      [key('Другой номер', 'book')],
      homeRow,
    ]);
  }
  const arrival = Date.parse(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(arrival) || arrival < today || arrival > today + 365 * dayMs || isoDate(arrival) !== date) {
    return card('Выберите актуальную дату заезда.', [[key('Выбрать дату', prefix)], homeRow]);
  }
  const dated = prefix + ':' + date;
  if (!nightsValue) {
    return card('Заезд **' + shortDate.format(arrival) + '**. На сколько ночей?', [
      ['1 ночь', '2 ночи', '3 ночи'].map((label, index) => key(label, dated + ':' + (index + 1))),
      [key('Другая дата', prefix)], homeRow,
    ]);
  }
  const nights = Number(nightsValue);
  if (![1, 2, 3].includes(nights)) return listRooms(true);
  const limit = room.max ?? room.base ?? 2;
  const stayed = dated + ':' + nights;
  if (!guestsValue) {
    const guests = Array.from({ length: limit }, (_, i) => key(String(i + 1), stayed + ':' + (i + 1)));
    return card('Сколько гостей будет в номере?', [guests.slice(0, 3), ...(guests.length > 3 ? [guests.slice(3)] : []), [key('Изменить даты', prefix)], homeRow]);
  }
  const guests = Number(guestsValue);
  if (!Number.isInteger(guests) || guests < 1 || guests > limit) return listRooms(true);
  let price = 0;
  for (let offset = 0; offset < nights; offset++) {
    const weekDay = new Date(arrival + dayMs * offset).getUTCDay();
    price += weekDay === 0 || weekDay === 6 ? room.weekend : room.weekday;
  }
  const extra = room.base == null || guests > room.base ? '\nРазмещение и доплату подскажет администратор.' : '';
  return card(
    '**Демо · ' + room.name + '**\n' + shortDate.format(arrival) + ' — ' + shortDate.format(arrival + nights * dayMs) +
    ' · гостей: ' + guests + '\n\n**' + money.format(price) + '** по базовому тарифу. Завтрак и допместа оплачиваются отдельно.' +
    extra + '\n\nНаличие номеров уточняйте в отеле: ' + hotelPhone,
    [[key('Другие даты', prefix)], homeRow]
  );
}

function screen(payload, today, siteOrigin) {
  const [action, item, date, nights, guests] = payload.split(':');
  const room = rooms.find(candidate => candidate.id === item);
  switch (action) {
    case 'rooms': return listRooms(false);
    case 'room': return room ? showRoom(room) : listRooms(false);
    case 'book': return room ? book(room, date, nights, guests, today) : listRooms(true);
    case 'map': return card('**Как добраться**\n' + hotelAddress + '\nРесепшен: ' + hotelPhone, [[link('Яндекс Карты', routeUrl)], homeRow]);
    case 'gastro': return card('**Гастродом**\n10:00–22:00 · до 50 гостей\nСтолики, банкеты и свадьбы. Бронирование и банкетное меню: +7 995 165-28-78.', [[link('Открыть меню', gastroMenu)], homeRow]);
    case 'hall': return card('**Конференц-зал**\n40 мест · 1 500 ₽/час\nПанорамная веранда, оборудование и сопровождение. Свободное время: ' + hotelPhone, [[link('Цены оборудования', siteOrigin ? siteOrigin + '/#conference' : miniApp)], homeRow]);
    case 'photos': return card('**Хранитель Байкала зимой**\nБольше фото отеля и номеров в галерее', [[link('Фотогалерея', siteOrigin ? siteOrigin + '/#gallery' : miniApp)], homeRow], siteOrigin ? siteOrigin + '/photos/winter.webp' : null);
    case 'bye': return card('До встречи на Байкале!', [homeRow]);
    default: return mainMenu();
  }
}

async function maxRequest(env, endpoint, query, body) {
  if (env.maxTransport) return env.maxTransport(endpoint, query, body);
  const maxOrigin = env.MAX_BOT_API_ORIGIN === 'https://platform-api.max.ru' ?
    'https://platform-api.max.ru' : 'https://platform-api2.max.ru';
  const url = new URL(endpoint, maxOrigin);
  for (const [name, value] of Object.entries(query)) url.searchParams.set(name, String(value));
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: env.MAX_BOT_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    redirect: 'manual',
    signal: AbortSignal.timeout(4500),
  });
  if (!response.ok) {
    const details = await response.json().catch(() => null);
    const apiCode = typeof details?.code === 'string' && /^[\w.:-]+$/.test(details.code) ? details.code : '';
    throw new Error('MAX ' + endpoint + ' HTTP ' + response.status + ' ' + apiCode);
  }
  await response.body?.cancel();
}

function isDirect(message) {
  return message?.recipient?.chat_type === 'dialog';
}

export async function handleUpdate(update, env) {
  const today = Date.parse(dayAtHotel.format(new Date()));
  let siteOrigin;
  try {
    const configured = new URL(env.SITE_ORIGIN);
    if (configured.protocol === 'https:' && !configured.username && !configured.password) siteOrigin = configured.origin;
  } catch {
    // Buttons can use the MAX mini app link until a public asset origin is configured.
  }
  if (update.update_type === 'message_callback') {
    if (!isDirect(update.message) || typeof update.callback?.payload !== 'string' || !update.callback.callback_id) return;
    const message = screen(update.callback.payload, today, siteOrigin);
    const query = { callback_id: update.callback.callback_id };
    try {
      await maxRequest(env, '/answers', query, { message });
    } catch (error) {
      if (!update.callback.user?.user_id) throw error;
      const recipient = { user_id: update.callback.user.user_id };
      try {
        await maxRequest(env, '/messages', recipient, message);
      } catch (sendError) {
        if (message.attachments[0].type !== 'image') throw sendError;
        await maxRequest(env, '/messages', recipient, { ...message, attachments: message.attachments.slice(1) });
      }
    }
    return;
  }

  if (update.update_type === 'bot_started' && update.user?.user_id && !update.user.is_bot) {
    await maxRequest(env, '/messages', { user_id: update.user.user_id }, mainMenu());
    return;
  }

  const message = update.message;
  const sender = message?.sender;
  if (update.update_type !== 'message_created' || !isDirect(message) || !sender?.user_id || sender.is_bot) return;
  const input = message.body?.text?.trim().toLowerCase().split(/\s+/)[0] ?? '';
  const commands = { '/start': 'menu', '/menu': 'menu', 'меню': 'menu', 'привет': 'menu', 'пока': 'bye', 'номера': 'rooms', 'бронь': 'book', 'карта': 'map', 'фото': 'photos' };
  await maxRequest(env, '/messages', { user_id: sender.user_id }, screen(Object.hasOwn(commands, input) ? commands[input] : 'menu', today, siteOrigin));
}

function hasWebhookSecret(request, expected) {
  const actual = request.headers.get('X-Max-Bot-Api-Secret') ?? '';
  if (!expected || expected.length !== actual.length) return false;
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  return difference === 0;
}

async function acceptWebhook(request, env, context) {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  if (!hasWebhookSecret(request, env.MAX_WEBHOOK_SECRET)) return new Response(null, { status: 401 });
  const update = await request.json().catch(() => null);
  if (!update || typeof update !== 'object' || typeof update.update_type !== 'string') return new Response(null, { status: 400 });
  context.waitUntil(handleUpdate(update, env).catch(error => {
    console.error(error instanceof Error ? error.message : 'MAX update failed');
  }));
  return new Response('ok');
}
