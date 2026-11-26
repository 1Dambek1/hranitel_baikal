const setViewerActions = (() => {
  const unit = document.querySelector('#room-unit');
  const unitPhotos = document.querySelector('#unit-photos');
  const unitActions = document.querySelector('#unit-actions');
  const viewerActions = document.querySelector('#viewer-room-actions');
  const actionTemplate = document.querySelector('#room-actions-template');
  const calendar = document.querySelector('#room-calendar');
  const calendarDays = document.querySelector('#calendar-days');
  const calendarStatus = document.querySelector('#calendar-status');
  const calendarApply = document.querySelector('#calendar-apply');
  const monthLabel = document.querySelector('#calendar-month-label');
  const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const fullDate = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'full', timeZone: 'UTC' });
  const shortDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const statuses = { free: 'свободно', busy: 'недоступно', unknown: 'не проверено' };
  let unitNumber;
  let calendarContext;
  let currentMonth;
  let firstNight;
  let lastDay;
  let dayStart;
  let dayEnd;
  let monthRequest;
  const verifiedMonths = new Map();

  const roomFloor = number => Object.keys(roomNumbers).find(floor => roomNumbers[floor].includes(number));
  const isoDay = timestamp => new Date(timestamp).toISOString().slice(0, 10);
  const monthStart = timestamp => Date.parse(isoDay(timestamp).slice(0, 7) + '-01');

  async function loadRoomDirectory() {
    try {
      const response = await fetch('./room-directory.json');
      if (!response.ok) return;
      const metadata = await response.json();
      if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return;
      for (const [key, info] of Object.entries(metadata)) {
        const number = Number(key);
        if (!roomFloor(number) || String(number) !== key || !info || typeof info !== 'object') continue;
        const roomId = rooms.some(room => room.id === info.roomId) ? info.roomId : null;
        const images = Array.isArray(info.photos)
          ? [...new Set(info.photos.filter(file => typeof file === 'string' && /^[a-z0-9_-]+\.webp$/i.test(file)))].slice(0, 3)
          : [];
        roomDirectory.set(number, { roomId, images });
      }
      updateFloorRoomCategories();
      if (unit.open) populateRoom(unitNumber);
    } catch {
      // Numbered rooms remain navigable when their catalog is unavailable.
    }
  }

  function fillActions(container, context) {
    container.replaceChildren();
    container.hidden = !context;
    if (!context) return;
    container.append(actionTemplate.content.cloneNode(true));
    const parent = container.closest('dialog');
    container.onclick = event => {
      const action = event.target.closest('[data-unit-action]')?.dataset.unitAction;
      if (!action) return;
      parent.close();
      if (action === 'book') openBooking(context);
      if (action === 'calendar') openCalendar(context);
      if (action === 'hold') document.querySelector('#room-hold').showModal();
      if (action === 'qr') document.querySelector('#room-qr').showModal();
    };
  }

  function populateRoom(number) {
    const details = roomDirectory.get(number);
    const category = rooms.find(room => room.id === details?.roomId);
    document.querySelector('#unit-title').textContent = 'Номер № ' + number;
    document.querySelector('#unit-context').textContent = roomFloor(number) + ' этаж · ' +
      (category?.name ?? 'Категория уточняется');
    unitPhotos.replaceChildren();
    const collection = (details?.images ?? []).map((file, index) => [file, 'Номер № ' + number + ' · фото ' + (index + 1)]);
    const context = { number, roomId: category?.id };
    if (collection.length) {
      for (const [index, [file, description]] of collection.entries()) {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', description);
        const photo = new Image();
        photo.src = 'photos/' + file;
        photo.alt = '';
        photo.decoding = 'async';
        button.append(photo);
        button.addEventListener('click', () => {
          unit.close();
          openViewer(collection, index, context);
        });
        unitPhotos.append(button);
      }
    } else {
      const label = document.createElement('p');
      label.className = 'unit-context';
      label.textContent = 'Фото этого номера ещё не добавлены';
      unitPhotos.append(label);
    }
    fillActions(unitActions, context);
  }

  floorSelection.addEventListener('click', event => {
    const number = Number(event.target.closest('[data-unit]')?.dataset.unit);
    if (!roomFloor(number)) return;
    unitNumber = number;
    populateRoom(number);
    unit.showModal();
  });
  void loadRoomDirectory();

  function readNight(time) {
    const key = isoDay(time);
    return verifiedMonths.get(key.slice(0, 7))?.[key] ?? 'unknown';
  }

  function blockedStay(start, end) {
    if (!start || !end || end <= start || end - start > 365 * oneDay) return false;
    for (let day = start; day < end; day += oneDay) {
      if (readNight(day) === 'busy') return true;
    }
    return false;
  }

  function updateApply() {
    calendarApply.disabled = !dayStart || !dayEnd || blockedStay(dayStart, dayEnd);
    calendarApply.textContent = dayStart && dayEnd
      ? 'Выбрать ' + shortDate.format(dayStart) + ' — ' + shortDate.format(dayEnd)
      : 'Выбрать даты';
  }

  function showMonth() {
    monthLabel.textContent = monthName.format(currentMonth);
    calendar.querySelector('[data-month-step="-1"]').disabled = currentMonth <= monthStart(firstNight);
    calendar.querySelector('[data-month-step="1"]').disabled = currentMonth >= monthStart(lastDay);
    const date = new Date(currentMonth);
    const offset = (date.getUTCDay() + 6) % 7;
    const end = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
    const contents = document.createDocumentFragment();
    for (let i = 0; i < offset; i++) contents.append(document.createElement('span'));
    for (let time = currentMonth; time < end; time += oneDay) {
      const day = document.createElement('button');
      const state = readNight(time);
      day.type = 'button';
      day.dataset.day = String(time);
      day.dataset.night = state;
      day.textContent = new Date(time).getUTCDate();
      const selected = time === dayStart || time === dayEnd;
      day.setAttribute('aria-pressed', String(selected));
      day.setAttribute('aria-label', fullDate.format(time) + ', ' + statuses[state] +
        (time === dayStart ? ', заезд' : time === dayEnd ? ', выезд' : ''));
      day.disabled = time < firstNight || time > lastDay || (time === lastDay && (!dayStart || dayEnd)) ||
        (state === 'busy' && (!dayStart || dayEnd || time <= dayStart));
      if (dayStart && dayEnd && time > dayStart && time < dayEnd) day.classList.add('calendar-in-range');
      contents.append(day);
    }
    const focus = calendarDays.contains(document.activeElement) ? document.activeElement.dataset.day : null;
    calendarDays.replaceChildren(contents);
    if (focus) calendarDays.querySelector('[data-day="' + focus + '"]:not(:disabled)')?.focus({ preventScroll: true });
    updateApply();
  }

  function selectionMessage() {
    if (dayStart && dayEnd) return 'Заезд ' + shortDate.format(dayStart) + ' · выезд ' + shortDate.format(dayEnd);
    return dayStart ? 'Выберите день выезда' : 'Выберите день заезда';
  }

  async function loadMonth() {
    monthRequest?.abort();
    const month = isoDay(currentMonth).slice(0, 7);
    if (!availabilityUrl || !calendarContext.number) {
      calendarStatus.textContent = selectionMessage() + ' · наличие уточнит администратор';
      return;
    }
    if (verifiedMonths.has(month)) {
      calendarStatus.textContent = selectionMessage();
      return;
    }
    calendarStatus.textContent = 'Сверяем даты с ECVI';
    const request = new AbortController();
    monthRequest = request;
    try {
      const url = new URL('./calendar', new URL(availabilityUrl, location.href));
      url.searchParams.set('room', calendarContext.number);
      url.searchParams.set('month', month);
      const signal = typeof AbortSignal.any === 'function'
        ? AbortSignal.any([request.signal, AbortSignal.timeout(25000)]) : request.signal;
      const response = await fetch(url, { signal, credentials: 'omit', redirect: 'error' });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (request.signal.aborted) return;
      if (data?.status !== 'live' || !data.nights || typeof data.nights !== 'object') throw new Error();
      const nights = Object.fromEntries(Object.entries(data.nights).filter(([key, value]) =>
        key.startsWith(month + '-') && /^\d{4}-\d{2}-\d{2}$/.test(key) && (value === 'free' || value === 'busy')));
      verifiedMonths.set(month, nights);
      if (dayStart && (readNight(dayStart) === 'busy' || blockedStay(dayStart, dayEnd))) {
        dayStart = dayEnd = null;
        calendarStatus.textContent = 'Выбранные даты недоступны, укажите другой период';
      } else {
        calendarStatus.textContent = selectionMessage();
      }
      showMonth();
    } catch {
      if (!request.signal.aborted) calendarStatus.textContent = selectionMessage() + ' · наличие уточнит администратор';
    }
  }

  function openCalendar(context, dates = {}) {
    calendarContext = context;
    firstNight = Date.parse(localHotelDay.format(new Date()));
    lastDay = firstNight + 365 * oneDay;
    const requestedStart = Date.parse(dates.arrival);
    const requestedEnd = Date.parse(dates.departure);
    dayStart = requestedStart >= firstNight && requestedStart < lastDay ? requestedStart : null;
    dayEnd = dayStart && requestedEnd > dayStart && requestedEnd <= lastDay ? requestedEnd : null;
    currentMonth = monthStart(dayStart ?? firstNight);
    verifiedMonths.clear();
    const room = rooms.find(item => item.id === context.roomId);
    document.querySelector('#calendar-context').textContent = context.number ? 'Номер № ' + context.number : (room?.name ?? '');
    showMonth();
    calendar.showModal();
    void loadMonth();
  }

  calendar.addEventListener('click', event => {
    const step = event.target.closest('[data-month-step]');
    if (step) {
      const date = new Date(currentMonth);
      currentMonth = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + Number(step.dataset.monthStep), 1);
      showMonth();
      void loadMonth();
    }
    const day = event.target.closest('[data-day]');
    if (!day || day.disabled) return;
    const time = Number(day.dataset.day);
    if (!dayStart || dayEnd || time <= dayStart) {
      if (readNight(time) === 'busy' || time === lastDay) return;
      dayStart = time;
      dayEnd = null;
    } else {
      if (blockedStay(dayStart, time)) {
        calendarStatus.textContent = 'В этом периоде есть недоступная ночь, выберите другой выезд';
        return;
      }
      dayEnd = time;
    }
    calendarStatus.textContent = selectionMessage() + (verifiedMonths.has(isoDay(currentMonth).slice(0, 7))
      ? '' : ' · наличие уточнит администратор');
    showMonth();
  });

  calendarApply.addEventListener('click', () => {
    if (!dayStart || !dayEnd || blockedStay(dayStart, dayEnd)) return;
    calendar.close();
    openBooking(calendarContext, { arrival: isoDay(dayStart), departure: isoDay(dayEnd) });
  });
  calendar.addEventListener('close', () => monthRequest?.abort());

  document.querySelector('#booking-calendar').addEventListener('click', () => {
    if (!bookingUnit) return;
    booking.close();
    openCalendar({ number: bookingUnit, roomId: bookingRoom.value || undefined }, { arrival: arrival.value, departure: departure.value });
  });

  return context => fillActions(viewerActions, context);
})();
