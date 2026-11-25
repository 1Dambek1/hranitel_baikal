(() => {
  const chat = document.querySelector('#help');
  const form = document.querySelector('#chat-compose');
  const draft = document.querySelector('#guest-message');
  const direct = document.querySelector('#direct-max');
  const topics = document.querySelector('#chat-topics');
  const thread = document.querySelector('#chat-thread');
  const canned = {
    dates: { title: 'Даты и цены', question: 'Как узнать стоимость на мои даты?',
      reply: 'Выберите даты и гостей, чтобы рассчитать стоимость. Наличие номера подтвердит администратор',
      action: 'Выбрать даты', match: /стоимост|цен[аыуе]|свободн.{0,8}(дат|номер)|как забронироват/ },
    rooms: { title: 'Номера', question: 'Какие есть номера?',
      reply: 'Есть Семейный, Семейный комфорт, Комфорт+, Люкс и Президентский',
      destination: 'rooms', action: 'Посмотреть номера', match: /какие.{0,22}номер|категори|фото номер|^номера$/ },
    map: { title: 'Как добраться', question: 'Как до вас добраться?',
      reply: 'Мы у озера, на Партизанской, 1 в Листвянке',
      destination: 'map', action: 'Открыть карту', match: /адрес|добрат|маршрут|где.{0,18}(вы|отель|находит)|карт[аеуы]/ },
    breakfast: { title: 'Завтрак', question: 'Сколько стоит завтрак?',
      reply: 'Завтрак стоит 500 ₽ за гостя', destination: 'gastro', action: 'Посмотреть гастродом',
      match: /^(?:сколько стоит |какая цена |сколько за |есть ли |есть |платный |входит ли )?завтрак(?: у вас| в стоимость| платный)?[?! .]*$/ },
    gastro: { title: 'Гастродом', question: 'Когда открыт гастродом?',
      reply: 'Гастродом открыт с 10:00 до 22:00',
      destination: 'gastro', action: 'Посмотреть гастродом', match: /^(?:(?:когда |во сколько |со скольки |до скольки |как )?(?:открыт |работает )?)?(?:гастродом|ресторан)(?: работает| открыт)?[?! .]*$/ },
  };
  const profileUrl = /^https:\/\/max\.ru\/u\/[A-Za-z0-9_-]+\/?$/;

  function go(id, instant = false) {
    const destination = document.getElementById(id);
    if (!destination) return;
    if (destination.tagName === 'DETAILS') destination.open = true;
    destination.scrollIntoView({ behavior: instant || reducedMotion.matches ? 'instant' : 'smooth' });
  }

  async function loadContact() {
    try {
      const response = await fetch('./hotel-contact.json');
      if (!response.ok) return;
      const contact = await response.json();
      const url = profileUrl.test(contact.chatUrl ?? '') ? contact.chatUrl
        : /^\+7\d{10}$/.test(contact.phone ?? '') ? 'tel:' + contact.phone : '';
      if (url && (!profileUrl.test(receptionLink.href) || profileUrl.test(url))) {
        for (const link of document.querySelectorAll('[data-reception]')) link.href = url;
      }
      for (const [id, value] of [['hotel-booking', contact.hotelBookingUrl], ['gastro-booking', contact.gastroBookingUrl]]) {
        if (!value) continue;
        try {
          const page = new URL(value);
          if (page.protocol !== 'https:' || page.username || page.password) continue;
          const link = document.getElementById(id);
          link.href = page.href;
          link.hidden = false;
        } catch {
          // Keep the existing reception or phone action for this section.
        }
      }
    } catch {
      // The contact embedded in the page remains available.
    }
  }

  void loadContact();
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-reception]');
    if (!link || !profileUrl.test(link.href) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const bridge = window.WebApp;
    if (bridge?.platform === 'web' || document.referrer.startsWith('https://web.max.ru/')) {
      const webChat = new URL(link.href);
      webChat.hostname = 'web.max.ru';
      window.open(webChat.href, '_blank', 'noopener');
      event.preventDefault();
      return;
    }
    if (!bridge?.platform || typeof bridge.openMaxLink !== 'function') return;
    try {
      bridge.openMaxLink(link.href);
      event.preventDefault();
    } catch {
      // The link can still be opened by the browser.
    }
  });

  function appendMessage(text, own = false) {
    const bubble = document.createElement('div');
    bubble.className = own ? 'chat-bubble chat-bubble--guest' : 'chat-bubble';
    const content = document.createElement('p');
    content.textContent = text;
    bubble.append(content);
    thread.append(bubble);
    return bubble;
  }

  function reply(question, topic) {
    appendMessage(question, true);
    const response = appendMessage(topic?.reply ?? 'С этим поможет администратор. Открываю чат в MAX');
    if (topic?.action) {
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'text-link';
      action.textContent = topic.action;
      action.addEventListener('click', () => {
        chat.close();
        if (topic.destination) go(topic.destination);
        else openBooking();
      });
      response.append(action);
    }
    if (typeof thread.scrollTo === 'function') thread.scrollTo({ top: thread.scrollHeight, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    else thread.scrollTop = thread.scrollHeight;
    if (!topic) direct.click();
  }

  for (const [key, topic] of Object.entries(canned)) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.dataset.topic = key;
    chip.textContent = topic.title;
    topics.append(chip);
  }

  topics.addEventListener('click', event => {
    const chip = event.target.closest('[data-topic]');
    if (!chip) return;
    const topic = canned[chip.dataset.topic];
    reply(topic.question, topic);
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-help]');
    if (button) chat.showModal();
  });

  function findTopic(question) {
    const text = question.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е');
    if (text.length > 80 || /\d|аллерг|питом|собак|оплат|возврат|отмен|перенос|перенес|ранний|поздн|ребен|дет[иея]|скид|уже|с моей|мой заказ|сколько человек|вдвоем|втроем|на двоих|[?].+/.test(text)) return;
    if (canned.breakfast.match.test(text)) return canned.breakfast;
    if (canned.gastro.match.test(text)) return canned.gastro;
    const matches = [canned.dates, canned.rooms, canned.map].filter(topic => topic.match.test(text));
    if (matches.length === 1) return matches[0];
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const question = draft.value.trim();
    if (!question) return;
    draft.value = '';
    reply(question, findTopic(question));
  });

  let openedInitial = false;
  function openInitialDestination() {
    const target = window.WebApp?.initDataUnsafe?.start_param || new URLSearchParams(location.search).get('open');
    if (typeof target !== 'string' || openedInitial) return;
    openedInitial = true;
    requestAnimationFrame(() => {
      if (target === 'dates') openBooking();
      else if (target === 'floor') go('floor-title', true);
      else if (target === 'walk') go('gallery', true);
      else if (/^room-\d{1,2}$/.test(target)) {
        const roomNumber = Number(target.slice(5));
        const floor = Object.keys(roomNumbers).find(key => roomNumbers[key].includes(roomNumber));
        if (floor) selectFloor(floorTabs.find(tab => tab.dataset.floor === floor));
        go('floor-title', true);
      } else if (target === 'arrival') go('map', true);
      else if (Object.hasOwn(canned, target) && canned[target].destination) go(canned[target].destination, true);
    });
  }
  window.addEventListener('max-bridge-ready', openInitialDestination, { once: true });
  openInitialDestination();
})();
