(() => {
  const bot = 'https://max.ru/id3812997183_bot';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const zones = [
    { name: 'Спальня', image: 'suite-bed.webp', mark: [2.15, 4.55], floor: '#e2ba9d' },
    { name: 'Зона отдыха', image: 'suite-lounge.webp', mark: [6.25, 4.75], floor: '#b8ccae' },
    { name: 'Вид и балкон', image: 'roof-balcony.webp', mark: [6.75, 1.05], floor: '#a0c4c3' },
    { name: 'Ванная', image: 'suite-bath.webp', mark: [1.2, 1.2], floor: '#edcf96' },
  ];
  const stage = document.querySelector('#walk-stage');
  const frames = document.querySelector('#walk-frames');
  const menu = document.querySelector('#zone-menu');
  const model = document.querySelector('#room-model');
  const caption = document.querySelector('#walk-caption');
  let zoneIndex = 0;
  let touchOrigin;

  function p(x, y, z = 0) {
    return [160 + 22 * (x - y), 37 + 12 * (x + y) - 20 * z];
  }

  function face(points, fill, stroke = '#675d497f') {
    return '<polygon points="' + points.map(q => p(...q).join(',')).join(' ') + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.2" stroke-linejoin="round"/>';
  }

  function box(x, y, w, d, h, palette, base = 0) {
    const top = h + base;
    return face([[x+w,y,base],[x+w,y+d,base],[x+w,y+d,top],[x+w,y,top]], palette[2]) +
      face([[x,y+d,base],[x+w,y+d,base],[x+w,y+d,top],[x,y+d,top]], palette[1]) +
      face([[x,y,top],[x+w,y,top],[x+w,y+d,top],[x,y+d,top]], palette[0]);
  }

  const floorAreas = [[0,2.75,4,3.25],[4,2.75,4,3.25],[4,0,4,2.75],[0,0,4,2.75]];
  const geometry = [
    box(.5,3.12,2.2,1.75,.33,['#f4e8d5','#b58569','#9c735b']) +
      box(.6,3.26,.66,.51,.092,['#fff9e9','#dec6ab','#c9b29b'],.33) +
      box(1.32,3.26,.66,.51,.092,['#fff9e9','#dec6ab','#c9b29b'],.33) +
      box(2.92,3.12,.5,.72,.5,['#f3cb9d','#b87d5f','#9d6f52']),
    box(4.36,3.08,2.07,.68,.55,['#9cb795','#6d8c6e','#536e55']) +
      box(4.44,3.22,1.91,.45,.1,['#dce5c5','#8eac8d','#678164'],.55) +
      box(6.04,4.25,1,.66,.3,['#f0ca94','#b78052','#9f6e4b']),
    box(4.7,.35,2.4,.1,1.42,['#effbf4','#527b75','#406d66']) +
      face([[4.78,.37,.13],[6.99,.37,.13],[6.99,.37,1.26],[4.78,.37,1.26]], '#b5dbe0','#52877e') +
      box(6.49,1.74,.65,.51,.34,['#f7e7c3','#ae936c','#887958']),
    box(.48,.47,1.55,.76,.45,['#fff9ee','#c1aa7b','#a48f63']) +
      face([[.66,.58,.46],[1.85,.58,.46],[1.85,1.06,.46],[.66,1.06,.46]], '#e0ece3','#acbcaa') +
      box(2.8,.56,.5,.54,.58,['#f7efd5','#c1a575','#9f875c']),
  ];
  const boundary = box(0,0,8,6,.14,['#f9edd5','#bb9b78','#a28765'],-.14);
  const walls = face([[0,0],[8,0],[8,0,1.65],[0,0,1.65]], '#e9dac1') +
    face([[0,0],[0,6],[0,6,1.2],[0,0,1.65]], '#eadfc7');
  const zoneSvg = (i) => {
    const [x,y,w,d] = floorAreas[i];
    const [cx,cy] = p(...zones[i].mark, .38);
    return '<g class="model-zone" role="button" tabindex="0" aria-label="' + zones[i].name + '" data-zone="' + i + '">' +
      face([[x,y],[x+w,y],[x+w,y+d],[x,y+d]], zones[i].floor) + geometry[i] +
      '<circle class="zone-dot" cx="' + cx + '" cy="' + cy + '" r="11"/><path d="M' + (cx-4) + ' ' + cy + 'h8m-4-4v8" stroke="white" stroke-width="1.8" pointer-events="none"/></g>';
  };
  model.innerHTML = '<svg viewBox="10 0 336 228" role="group" aria-label="Интерактивный объёмный эскиз номера">' +
    boundary + walls + [3,2,0,1].map(zoneSvg).join('') + '</svg>';
  frames.innerHTML = zones.map((zone,i) => '<img class="walk-frame" src="photos/' + zone.image +
    '" alt="' + zone.name + '" loading="lazy" decoding="async" data-zone-image="' + i + '">').join('');
  menu.innerHTML = zones.map((zone,i) => '<button type="button" data-zone="' + i + '">' + zone.name + '</button>').join('');

  function showZone(index, direction = index >= zoneIndex ? 1 : -1) {
    zoneIndex = (index + zones.length) % zones.length;
    stage.style.setProperty('--direction', String(direction));
    for (const [i, frame] of [...frames.children].entries()) {
      frame.classList.toggle('active', i === zoneIndex);
      frame.setAttribute('aria-hidden', String(i !== zoneIndex));
    }
    for (const zone of document.querySelectorAll('[data-zone]')) {
      const active = Number(zone.dataset.zone) === zoneIndex;
      zone.classList.toggle('hot', active);
      zone.setAttribute('aria-pressed', String(active));
    }
    caption.textContent = zones[zoneIndex].name;
  }

  function chooseZone(event) {
    const target = event.target.closest('[data-zone]');
    if (target) showZone(Number(target.dataset.zone));
  }
  model.addEventListener('click', chooseZone);
  menu.addEventListener('click', chooseZone);
  model.addEventListener('keydown', event => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    if (!event.target.closest('[data-zone]')) return;
    event.preventDefault();
    chooseZone(event);
  });
  stage.addEventListener('click', event => {
    const control = event.target.closest('[data-walk-step]');
    if (control) {
      const direction = Number(control.dataset.walkStep);
      showZone(zoneIndex + direction,direction);
    }
  });
  stage.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;
    touchOrigin = { x: event.clientX, y: event.clientY };
    stage.setPointerCapture?.(event.pointerId);
  });
  stage.addEventListener('pointercancel', () => { touchOrigin = null; });
  stage.addEventListener('pointerup', event => {
    if (!touchOrigin) return;
    const dx = event.clientX - touchOrigin.x;
    const dy = event.clientY - touchOrigin.y;
    touchOrigin = null;
    if (Math.abs(dx) < 42 || Math.abs(dy) > Math.abs(dx)) return;
    const direction = dx < 0 ? 1 : -1;
    showZone(zoneIndex + direction,direction);
  });
  showZone(0);

  const chat = document.querySelector('#help');
  const chatLog = document.querySelector('#chat-messages');
  const chips = document.querySelector('#chat-topics');
  const compose = document.querySelector('#chat-compose');
  const draft = document.querySelector('#guest-message');
  const status = document.querySelector('#chat-status');
  const fallback = document.querySelector('#share-fallback');
  const copyPhone = document.querySelector('#copy-admin-phone');
  const copyDraft = document.querySelector('#copy-draft');
  const direct = document.querySelector('#direct-max');
  let contact = {};
  let contactRequested = false;
  const topics = {
    dates: ['Свободные даты', 'Укажите заезд и выезд, чтобы проверить номера на эти даты', null, 'Выбрать даты'],
    rooms: ['Какие номера есть?', 'В отеле пять категорий, от семейной до президентской', 'rooms', 'Посмотреть номера'],
    arrival: ['Как добраться?', 'Мы в Листвянке, улица Партизанская, 1', 'map', 'Построить маршрут'],
    gastro: ['Завтрак', 'Завтрак стоит 500 ₽ за гостя, время уточнит администратор', 'gastro', 'О гастродоме'],
  };

  function addBubble(text, outgoing) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + (outgoing ? 'outgoing' : 'incoming');
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    bubble.append(paragraph);
    chatLog.append(bubble);
    return bubble;
  }

  function scrollChat() {
    chatLog.scrollTo?.({ top: chatLog.scrollHeight, behavior: reduced.matches ? 'instant' : 'smooth' });
  }

  function go(id, scrollBehavior = 'smooth') {
    const destination = document.getElementById(id);
    if (!destination) return;
    if (destination.tagName === 'DETAILS') destination.open = true;
    destination.scrollIntoView({ behavior: reduced.matches ? 'instant' : scrollBehavior });
  }

  function selectTopic(key) {
    const [question, answer, destination, action] = topics[key];
    addBubble(question, true);
    const bubble = addBubble(answer, false);
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'mini-link';
    next.textContent = action;
    next.addEventListener('click', () => {
      chat.close();
      if (destination) go(destination);
      else openBooking();
    });
    bubble.append(next);
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'mini-link';
    copy.textContent = 'Скопировать ссылку';
    copy.addEventListener('click', async () => {
      const url = bot + '?startapp=' + key;
      try {
        await navigator.clipboard.writeText(url);
        status.textContent = 'Ссылка скопирована';
      } catch {
        status.textContent = url;
      }
    });
    bubble.append(copy);
    scrollChat();
  }

  async function loadContact() {
    try {
      const response = await fetch('./hotel-contact.json');
      if (!response.ok) return;
      contact = await response.json();
      copyPhone.hidden = !/^\+7\d{10}$/.test(contact.phone ?? '');
      if (isDirectMax(contact.chatUrl)) {
        direct.href = contact.chatUrl;
        direct.hidden = false;
        copyPhone.hidden = true;
      }
    } catch {
      // The MAX share dialog is still available when the contact cannot be loaded.
    }
  }

  function isDirectMax(value) {
    return /^https:\/\/max\.ru\/u\/[A-Za-z0-9_-]+\/?$/.test(value ?? '');
  }

  function openDirect(url) {
    if (window.WebApp?.platform && typeof window.WebApp.openMaxLink === 'function') {
      try {
        window.WebApp.openMaxLink(url);
        return;
      } catch { /* Use the regular profile link */ }
    }
    window.open(url, '_blank', 'noopener');
  }

  async function copyChatDraft() {
    const text = draft.value.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Текст скопирован · вставьте его в чат MAX';
    } catch {
      status.textContent = 'Удерживайте поле сообщения, чтобы скопировать текст';
    }
  }

  direct.addEventListener('click', event => {
    if (!isDirectMax(contact.chatUrl)) return;
    event.preventDefault();
    openDirect(contact.chatUrl);
  });
  copyDraft.addEventListener('click', copyChatDraft);
  draft.addEventListener('input', () => { copyDraft.hidden = !draft.value.trim(); });
  window.addEventListener('max-bridge-ready', openInitialDestination, { once: true });

  chips.innerHTML = Object.entries(topics).map(([id,t]) => '<button type="button" data-topic="' + id + '">' + t[0] + '</button>').join('');
  chips.addEventListener('click', event => {
    const button = event.target.closest('[data-topic]');
    if (button) selectTopic(button.dataset.topic);
  });

  function openChat(prefill) {
    if (prefill) draft.value = prefill;
    copyDraft.hidden = !draft.value.trim();
    chat.showModal();
    if (!contactRequested) {
      contactRequested = true;
      loadContact();
    }
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-help]');
    if (!target) return;
    if (target.closest('#booking')) document.querySelector('#booking').close();
    openChat(target.dataset.help);
  });

  compose.addEventListener('submit', async event => {
    event.preventDefault();
    const text = draft.value.trim();
    if (!text) {
      if (isDirectMax(contact.chatUrl)) {
        openDirect(contact.chatUrl);
        return;
      }
      status.textContent = 'Введите сообщение';
      draft.focus();
      return;
    }
    if (isDirectMax(contact.chatUrl)) {
      void copyChatDraft();
      openDirect(contact.chatUrl);
      return;
    }
    status.textContent = 'Выберите чат администратора в MAX и отправьте сообщение';
    const shareUrl = 'https://max.ru/:share?text=' + encodeURIComponent(text);
    fallback.href = shareUrl;
    fallback.hidden = true;
    const bridge = window.WebApp;
    if (bridge?.platform && typeof bridge.shareMaxContent === 'function') {
      try {
        const result = await bridge.shareMaxContent({ text });
        if (result?.status === 'shared') {
          addBubble(text, true);
          if (draft.value.trim() === text) draft.value = '';
          status.textContent = 'Сообщение передано в выбранный чат MAX';
          scrollChat();
          return;
        }
        if (result?.status === 'cancelled') {
          status.textContent = 'Сообщение осталось в поле';
          return;
        }
      } catch {
        status.textContent = 'Выберите чат администратора после открытия MAX';
      }
      fallback.hidden = false;
      return;
    }
    fallback.hidden = false;
    if (!bridge?.platform) window.open(shareUrl, '_blank', 'noopener');
  });

  copyPhone.addEventListener('click', async () => {
    if (!contact.phone) return;
    try {
      await navigator.clipboard.writeText(contact.phone);
      status.textContent = 'Номер скопирован · найдите администратора по номеру в MAX';
    } catch {
      status.textContent = contact.phone;
    }
  });

  let openedInitial = false;
  function openInitialDestination() {
    const target = window.WebApp?.initDataUnsafe?.start_param || new URLSearchParams(location.search).get('open');
    if (!target || openedInitial) return;
    openedInitial = true;
    requestAnimationFrame(() => {
      if (target === 'dates') openBooking();
      else if (target === 'floor' || target === 'walk' || /^room-[1-8]$/.test(target)) go('walk','instant');
      else if (Object.hasOwn(topics,target) && topics[target][2]) go(topics[target][2],'instant');
    });
  }
  openInitialDestination();
})();
