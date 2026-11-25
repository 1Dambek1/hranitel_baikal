(() => {
  const chat = document.querySelector('#help');
  const form = document.querySelector('#chat-compose');
  const draft = document.querySelector('#guest-message');
  const send = form.querySelector('[type="submit"]');
  const status = document.querySelector('#chat-status');
  const direct = document.querySelector('#direct-max');
  const fallback = document.querySelector('#share-fallback');
  const topics = document.querySelector('#chat-topics');
  const answer = document.querySelector('#topic-answer');
  const answerText = answer.querySelector('p');
  const answerAction = answer.querySelector('button');
  const canned = {
    dates: { title: 'Свободные даты', reply: 'Выберите даты и гостей. Посчитаем стоимость, а наличие уточнит администратор', action: 'Выбрать даты' },
    rooms: { title: 'Номера', reply: 'Есть семейные номера, Комфорт+, Люкс и Президентский. Фото и цены — в каталоге', destination: 'rooms', action: 'Посмотреть номера' },
    map: { title: 'Как добраться', reply: 'Мы у озера, в Листвянке на Партизанской, 1', destination: 'map', action: 'Открыть карту' },
    gastro: { title: 'Завтрак', reply: 'Завтрак стоит 500 ₽ за гостя. Гастродом открыт с 10:00 до 22:00', destination: 'gastro', action: 'Посмотреть гастродом' },
  };
  let directUrl = '';
  let contactRequest;

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
      if (/^https:\/\/max\.ru\/u\/[A-Za-z0-9_-]+\/?$/.test(contact.chatUrl ?? '')) {
        directUrl = contact.chatUrl;
        direct.href = directUrl;
        direct.hidden = false;
      }
      if (/^\+7\d{10}$/.test(contact.phone ?? '')) {
        document.querySelector('#reception-phone').href = 'tel:' + contact.phone;
      }
    } catch {
      contactRequest = undefined;
    }
  }

  function openInMax(url) {
    if (window.WebApp?.platform && typeof window.WebApp.openMaxLink === 'function') {
      try {
        window.WebApp.openMaxLink(url);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  direct.addEventListener('click', event => {
    if (directUrl && openInMax(directUrl)) event.preventDefault();
  });
  fallback.addEventListener('click', event => {
    if (openInMax(fallback.href)) event.preventDefault();
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
    const active = chip.getAttribute('aria-pressed') === 'true';
    for (const button of topics.children) button.setAttribute('aria-pressed', String(button === chip && !active));
    answer.hidden = active;
    if (active) return;
    answerText.textContent = topic.reply;
    answerAction.textContent = topic.action;
    answerAction.onclick = () => {
      chat.close();
      if (topic.destination) go(topic.destination);
      else openBooking();
    };
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-help]');
    if (!button) return;
    if (button.closest('#booking')) document.querySelector('#booking').close();
    if (button.dataset.help) draft.value = button.dataset.help;
    status.textContent = '';
    fallback.hidden = true;
    chat.showModal();
    contactRequest ??= loadContact();
  });

  draft.addEventListener('input', () => {
    status.textContent = '';
    fallback.hidden = true;
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text = draft.value.trim();
    if (!text) {
      status.textContent = 'Напишите сообщение';
      draft.focus();
      return;
    }
    const bridge = window.WebApp;
    const shareUrl = new URL('https://max.ru/:share');
    shareUrl.searchParams.set('text', text);
    fallback.href = shareUrl.href;
    fallback.hidden = true;
    status.textContent = 'Выберите чат администратора в MAX';
    if (!bridge?.platform || typeof bridge.shareMaxContent !== 'function') {
      if (!openInMax(shareUrl.href)) window.open(shareUrl.href, '_blank', 'noopener');
      fallback.hidden = false;
      return;
    }

    send.disabled = true;
    try {
      const result = await bridge.shareMaxContent({ text });
      if (result?.status === 'shared') {
        if (draft.value.trim() === text) draft.value = '';
        status.textContent = 'Сообщение отправлено в выбранный чат';
        if (directUrl) openInMax(directUrl);
      } else if (result?.status === 'cancelled') {
        status.textContent = 'Текст остался в черновике';
      } else {
        fallback.hidden = false;
      }
    } catch {
      fallback.hidden = false;
      status.textContent = 'Откройте отправку в MAX по ссылке ниже';
    } finally {
      send.disabled = false;
    }
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
      else if (/^room-[1-8]$/.test(target)) {
        const roomNumber = Number(target.slice(5));
        if (roomNumber >= 3) document.querySelector('[data-floor="' + (roomNumber === 8 ? '4' : '3') + '"]').click();
        go('floor-title', true);
      } else if (target === 'arrival') go('map', true);
      else if (Object.hasOwn(canned, target) && canned[target].destination) go(canned[target].destination, true);
    });
  }
  window.addEventListener('max-bridge-ready', openInitialDestination, { once: true });
  openInitialDestination();
})();