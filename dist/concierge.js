(() => {
  const chat = document.querySelector('#help');
  const topics = document.querySelector('#faq-topics');
  const answer = document.querySelector('#faq-answer');
  const canned = {
    dates: { title: 'Даты и цены',
      reply: 'Выберите даты и гостей, чтобы рассчитать стоимость. Наличие номера подтвердит администратор',
      action: 'Выбрать даты' },
    rooms: { title: 'Номера',
      reply: 'Есть Семейный, Семейный комфорт, Комфорт+, Люкс и Президентский',
      destination: 'rooms', action: 'Посмотреть номера' },
    map: { title: 'Как добраться',
      reply: 'Мы у озера, на Партизанской, 1 в Листвянке',
      destination: 'map', action: 'Открыть карту' },
    breakfast: { title: 'Завтрак',
      reply: 'Завтрак стоит 500 ₽ за гостя', destination: 'gastro', action: 'Посмотреть гастродом' },
    gastro: { title: 'Гастродом',
      reply: 'Гастродом открыт с 10:00 до 22:00',
      destination: 'gastro', action: 'Посмотреть гастродом' },
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

  for (const [key, topic] of Object.entries(canned)) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.dataset.topic = key;
    chip.setAttribute('aria-pressed', 'false');
    chip.textContent = topic.title;
    topics.append(chip);
  }

  topics.addEventListener('click', event => {
    const chip = event.target.closest('[data-topic]');
    if (!chip) return;
    const topic = canned[chip.dataset.topic];
    for (const button of topics.children) button.setAttribute('aria-pressed', String(chip === button));
    const message = document.createElement('p');
    message.textContent = topic.reply;
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'text-link';
    action.textContent = topic.action;
    action.addEventListener('click', () => {
      chat.close();
      if (topic.destination) go(topic.destination);
      else openBooking();
    });
    answer.replaceChildren(message, action);
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-help]');
    if (button) chat.showModal();
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
