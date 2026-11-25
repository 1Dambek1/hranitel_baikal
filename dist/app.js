const rooms = [
  { id: 'family', name: 'Семейный', weekday: 6100, weekend: 6500, base: 3, max: 6, extra: 1500,
    facts: ['35 м²', 'До 6 гостей', 'Лес'],
    note: 'Две комнаты, три кровати 140 × 200 см, без балкона',
    amenities: 'Халаты, тапочки, полотенца, гигиенические принадлежности, телевизор, чайник, чайные пары и питьевая вода',
    images: ['family-beds.webp', 'family-rooms.webp', 'family-interior.webp'] },
  { id: 'family-comfort', name: 'Семейный комфорт', weekday: 8100, weekend: 8800,
    base: 3, max: 6, extra: 1500, facts: ['40 м²', 'До 6 гостей', 'Балкон'],
    note: 'Вид на Байкал и лес, большая ванна, обеденный стол на четверых',
    amenities: 'Халаты, тапочки, полотенца, гигиенические принадлежности и чайные пары',
    images: ['spacious-bedroom.webp', 'seating-bedroom.webp', 'large-bath.webp'], illustrative: true },
  { id: 'comfort', name: 'Комфорт+', weekday: 8100, weekend: 8800, base: 2, max: 3,
    facts: ['40 м²', 'До 3 гостей', 'Балкон'],
    note: 'Просторный собственный балкон с видом на Байкал и лес',
    amenities: 'Халаты, тапочки, полотенца, гигиенические принадлежности, телевизор, чайник и чайные пары',
    images: ['sunlit-bedroom.webp', 'window-seats.webp', 'balcony-lounge.webp'], illustrative: true },
  { id: 'suite', name: 'Люкс', weekday: 8950, weekend: 9500, base: 2, max: 3,
    facts: ['40 м²', 'Две комнаты', '5 окон на Байкал'],
    note: 'Спальня и гостиная, два выхода на балкон, варианты с джакузи или душевой',
    amenities: 'Халаты, тапочки, полотенца, гигиенические принадлежности, телевизор, чайник и чайные пары',
    images: ['suite-bed.webp', 'suite-lounge.webp', 'suite-bath.webp'], illustrative: true },
  { id: 'presidential', name: 'Президентский', weekday: 17400, weekend: 18900, base: 2, max: 4, floor: 5,
    facts: ['46 м²', 'До 4 гостей', '5 этаж'],
    note: 'Пять панорамных окон, большой балкон, джакузи и отдельная душевая',
    description: 'В гостиной кожаный диван, кресло, обеденный стол на четверых и туалетный столик. Есть отдельная прихожая и шкаф',
    amenities: 'Мини-бар, халаты, тапочки, полотенца, гигиенические принадлежности, телевизор, чайник и чайные пары',
    images: ['presidential-bed.webp', 'presidential-view.webp', 'presidential-lounge.webp', 'presidential-bath.webp'] },
];

const photos = [
  ['exterior.webp', 'Отель у Байкала'],
  ['lake-terrace.webp', 'Байкал с балкона'],
  ['presidential-bed.webp', 'Президентский · спальня'],
  ['lobby-staircase.webp', 'Лестница в холле'],
  ['lake-window.webp', 'Байкал из номера'],
  ['presidential-view.webp', 'Президентский · вид'],
  ['dining.webp', 'Гастродом'],
  ['lobby.webp', 'Ресепшен'],
  ['presidential-lounge.webp', 'Президентский · гостиная'],
  ['presidential-bath.webp', 'Президентский · ванная'],
  ['roof-balcony.webp', 'Вид с балкона'],
  ['family-rooms.webp', 'Семейные интерьеры'],
  ['family-beds.webp', 'Семейные интерьеры'],
  ['family-interior.webp', 'Семейные интерьеры'],
  ['suite-bed.webp', 'Спальня'],
  ['suite-lounge.webp', 'Зона отдыха'],
  ['suite-bath.webp', 'Ванная комната'],
  ['sunlit-bedroom.webp', 'Спальня'],
  ['window-seats.webp', 'У окна'],
  ['balcony-lounge.webp', 'Вид из номера'],
  ['white-bath.webp', 'Ванная комната'],
  ['spacious-bedroom.webp', 'Интерьер номера'],
  ['seating-bedroom.webp', 'Жилая зона'],
  ['tea-table.webp', 'Чайный столик'],
  ['large-bath.webp', 'Ванная комната'],
  ['conference-room.webp', 'Конференц-зал'],
  ['winter.webp', 'Отель зимой'],
  ['reception.webp', 'Ресепшен'],
  ['bedroom.webp', 'Спальня'],
  ['window.webp', 'Байкал из окна'],
  ['balcony.webp', 'Выход на балкон'],
  ['lounge.webp', 'Зона отдыха'],
  ['bathroom.webp', 'Ванная комната'],
  ['wardrobe.webp', 'Гардероб'],
];

const equipment = [
  ['Мультимедиа проектор', '4 000 ₽/день'],
  ['Подвесной экран', '1 000 ₽/день'],
  ['Акустическая система', '2 000 ₽/день'],
  ['Радиомикрофон', '500 ₽/день'],
  ['Флипчарт (20 листов и маркеры)', '1 500 ₽/день'],
  ['Ноутбук', '1 000 ₽/день'],
  ['Магнитно-маркерная доска', '1 500 ₽/день'],
  ['Блокнот и ручка', '250 ₽/шт.'],
  ['Вода в бутылке', '50 ₽/шт.'],
  ['Настройка и удалённое сопровождение', '3 000 ₽/день'],
  ['Присутствие системного администратора', '6 000 ₽/день'],
];

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 2,
});
const formatPrice = (value) => currency.format(value);
const roomOptions = document.querySelector('#room-options');
const roomDetail = document.querySelector('#room-detail');
const booking = document.querySelector('#booking');
const form = document.querySelector('#booking-form');
const { arrival, departure, room: bookingRoom, guests } = form.elements;
const extraFields = document.querySelector('#extra-guest-fields');
const estimate = document.querySelector('#estimate');
const availabilityUrl = document.querySelector('meta[name="baikal-availability-url"]').content;
const bookingSubmit = document.querySelector('#booking-submit');
const bookingAll = document.querySelector('#booking-all');
if (availabilityUrl) {
  bookingSubmit.firstChild.nodeValue = 'Проверить даты ';
  bookingAll.hidden = false;
}
const photoViewer = document.querySelector('#photo-viewer');
const receptionLink = document.querySelector('#hotel-reception');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const icon = (name) => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
let selectedRoom = rooms[0];
let photoIndex = 0;
let roomPhotoIndex = 0;
let viewedPhotos = photos;

roomOptions.innerHTML = rooms.map((room) =>
  '<button class="room-option" type="button" data-room="' + room.id + '" aria-pressed="false">' +
  room.name + '</button>'
).join('');
bookingRoom.replaceChildren(...rooms.map((room) => new Option(room.name, room.id)));

function showRoom(room) {
  selectedRoom = room;
  roomPhotoIndex = 0;
  for (const option of roomOptions.children) {
    const active = option.dataset.room === room.id;
    option.setAttribute('aria-pressed', String(active));
    if (active) roomOptions.scrollTo?.({ left: option.offsetLeft - roomOptions.firstElementChild.offsetLeft,
      behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  const rate = room.extra ? 'Дополнительное место — 1 500 ₽/сутки' :
    'До 7 лет на кровати с родителями — бесплатно · 7–14 лет — 1 500 ₽/сутки · старше 14 лет — 2 500 ₽/сутки';
  roomDetail.innerHTML =
    '<div class="room-card"><div class="room-visual">' +
    '<button class="room-image" type="button" data-room-photo aria-label="Увеличить фото номера"></button>' +
    '<div class="room-photo-controls"><span class="photo-count">' + icon('image') + '<span id="room-photo-count" aria-live="polite"></span></span>' +
    '<div><button type="button" class="icon-button" data-room-step="-1" aria-label="Предыдущее фото номера">' +
    icon('back') + '</button><button type="button" class="icon-button" data-room-step="1" aria-label="Следующее фото номера">' +
    icon('next') + '</button></div></div></div>' +
    '<div class="room-card-text"><h3>' + room.name + '</h3>' +
    '<ul class="room-facts">' + room.facts.map((fact) => '<li>' + fact + '</li>').join('') + '</ul>' +
    '<p class="room-note">' + room.note + '</p>' +
    '<dl class="room-prices"><div><dt>В будни</dt><dd>' + formatPrice(room.weekday) + '</dd></div>' +
    '<div><dt>В выходные</dt><dd>' + formatPrice(room.weekend) + '</dd></div></dl>' +
    '<details><summary>Что в номере и доплаты</summary>' + (room.description ? '<p>' + room.description + '</p>' : '') +
    (room.illustrative ? '<p>В галерее показаны интерьеры отеля. Фото конкретного номера подскажет администратор</p>' : '') +
    '<p>' + room.amenities + '</p><p>Тариф на ' +
    room.base + ' гостей · ' + rate + '</p></details><button type="button" class="button primary" data-book>' +
    'Выбрать даты' + icon('arrow') + '</button></div></div>';
  showRoomPhoto(0);
}

async function showRoomPhoto(index) {
  const room = selectedRoom;
  const files = room.images;
  roomPhotoIndex = (index + files.length) % files.length;
  const next = roomPhotoIndex;
  const file = files[next];
  const frame = roomDetail.querySelector('[data-room-photo]');
  const image = new Image();
  image.alt = photos.find(([candidate]) => candidate === file)?.[1] ?? room.name;
  image.loading = frame.firstElementChild ? 'eager' : 'lazy';
  image.decoding = 'async';
  image.src = 'photos/' + file;
  if (frame.firstElementChild && typeof image.decode === 'function') {
    try {
      await image.decode();
    } catch {
      return;
    }
  }
  if (room !== selectedRoom || next !== roomPhotoIndex || !frame.isConnected) return;
  frame.replaceChildren(image);
  roomDetail.querySelector('#room-photo-count').textContent = (next + 1) + ' / ' + files.length;
}

roomOptions.addEventListener('click', (event) => {
  const option = event.target.closest('[data-room]');
  if (option) showRoom(rooms.find((room) => room.id === option.dataset.room));
});
showRoom(selectedRoom);

const floors = document.querySelector('#floor-tabs');
const floorSelection = document.querySelector('#floor-selection');
const roomNumbers = { 3: [3, 4, 5, 6, 7], 4: [8] };
const floorTabs = [...floors.children];
let activeFloor = 0;

function selectFloor(tab) {
  const nextFloor = floorTabs.indexOf(tab);
  if (nextFloor === activeFloor) return;
  const direction = nextFloor > activeFloor ? 1 : -1;
  activeFloor = nextFloor;
  const value = tab.dataset.floor;
  floors.style.setProperty('--active-floor', activeFloor);
  for (const t of floorTabs) t.setAttribute('aria-pressed', String(t === tab));
  floorSelection.hidden = value === 'all';
  if (floorSelection.hidden) return;
  const room = rooms.find(room => room.floor === Number(value));
  const numbers = roomNumbers[value] || [];
  const admin = (label, ariaLabel = label) =>
    '<a class="floor-chip" data-reception href="' + receptionLink.href +
    '" target="_blank" rel="noopener" aria-label="' + ariaLabel + '">' + label + '</a>';
  floorSelection.innerHTML = room
    ? '<button type="button" class="floor-feature" data-floor-room="' + room.id +
      '"><img src="photos/' + room.images[0] + '" alt="" width="75" height="55" decoding="async">' +
      '<span><strong>' + room.name + '</strong><small>от ' + formatPrice(room.weekday) + ' за ночь</small></span>' + icon('next') + '</button>'
    : '<div class="floor-options"><p>' + (numbers.length ? 'Спросить о номере на ' + value + '-м этаже' :
      'Номера ' + value + '-го этажа уточнит администратор') + '</p><div>' +
      (numbers.length ? numbers.map(number => admin('№ ' + number, 'Спросить про номер № ' + number)).join('') : admin('Написать')) +
      '<button type="button" class="floor-chip" data-room-catalog>Все категории</button></div></div>';
  if (!reducedMotion.matches) {
    floorSelection.firstElementChild.animate?.([
      { opacity: .45, transform: 'translateX(' + direction * 15 + 'px)' },
      { opacity: 1, transform: 'translateX(0)' },
    ], { duration: 280, easing: 'cubic-bezier(.2,.75,.22,1)' });
  }
}
floors.addEventListener('click', event => {
  const tab = event.target.closest('[data-floor]');
  if (tab) selectFloor(tab);
});
floors.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  const index = floorTabs.indexOf(event.target);
  if (index < 0) return;
  event.preventDefault();
  const tab = floorTabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + floorTabs.length) % floorTabs.length];
  tab.focus();
  selectFloor(tab);
});
floorSelection.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (button?.dataset.floorRoom) showRoom(rooms.find(room => room.id === button.dataset.floorRoom));
  if (button && (button.hasAttribute('data-room-catalog') || button.dataset.floorRoom)) {
    document.querySelector('#rooms').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
});

const gallery = document.querySelector('#gallery-grid');
const galleryFilters = document.querySelector('#gallery-filters');
const morePhotos = document.querySelector('#gallery-more');
const hotelPhotos = new Set(['exterior.webp', 'lobby.webp', 'lobby-staircase.webp', 'dining.webp', 'roof-balcony.webp',
  'conference-room.webp', 'winter.webp', 'reception.webp']);
let galleryPhotos = photos;

function showMorePhotos() {
  const start = gallery.childElementCount;
  gallery.insertAdjacentHTML('beforeend', galleryPhotos.slice(start, start + 7).map(([file, caption], index) =>
    '<button class="gallery-item" type="button" data-photo="' + (start + index) + '" aria-label="Открыть фото: ' +
    caption + '"><img src="photos/' + file + '" alt="" loading="lazy" decoding="async"></button>'
  ).join(''));
  if (start > 0 && gallery.childElementCount > start) gallery.children[start].focus({ preventScroll: true });
  morePhotos.hidden = gallery.childElementCount === galleryPhotos.length;
}
galleryFilters.addEventListener('click', event => {
  const button = event.target.closest('[data-gallery]');
  if (!button || button.getAttribute('aria-pressed') === 'true') return;
  for (const filter of galleryFilters.children) filter.setAttribute('aria-pressed', String(filter === button));
  const value = button.dataset.gallery;
  galleryPhotos = value === 'all' ? photos : photos.filter(([file]) => hotelPhotos.has(file) === (value === 'hotel'));
  gallery.replaceChildren();
  showMorePhotos();
});
morePhotos.addEventListener('click', showMorePhotos);
showMorePhotos();

function openViewer(collection, index) {
  viewedPhotos = collection;
  photoIndex = index;
  showPhoto(index);
  photoViewer.showModal();
}

function showPhoto(index) {
  const direction = index < photoIndex ? '-12px' : '12px';
  photoIndex = (index + viewedPhotos.length) % viewedPhotos.length;
  const [file, caption] = viewedPhotos[photoIndex];
  const image = document.querySelector('#viewer-image');
  image.src = 'photos/' + file;
  image.alt = caption;
  document.querySelector('#viewer-count').textContent = (photoIndex + 1) + ' / ' + viewedPhotos.length;
  const frame = photoViewer.querySelector('figure');
  frame.style.setProperty('--photo-enter', direction);
  frame.classList.remove('is-switching');
  requestAnimationFrame(() => requestAnimationFrame(() => frame.classList.add('is-switching')));
}

gallery.addEventListener('click', (event) => {
  const item = event.target.closest('[data-photo]');
  if (item) openViewer(galleryPhotos, Number(item.dataset.photo));
});
roomDetail.addEventListener('click', event => {
  const step = event.target.closest('[data-room-step]');
  if (step) showRoomPhoto(roomPhotoIndex + Number(step.dataset.roomStep));
  if (event.target.closest('[data-room-photo]')) {
    const collection = selectedRoom.images.map(file => photos.find(([candidate]) => candidate === file));
    openViewer(collection, roomPhotoIndex);
  }
});

photoViewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showPhoto(photoIndex - 1);
  if (event.key === 'ArrowRight') showPhoto(photoIndex + 1);
});

function onHorizontalSwipe(element, gesture) {
  let start;
  element.addEventListener('touchstart', event => {
    if (event.target.closest('.icon-button, .hero-copy, .scene-tabs')) return;
    start = event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });
  element.addEventListener('touchcancel', () => { start = null; }, { passive: true });
  element.addEventListener('touchend', event => {
    if (!start) return;
    const { clientX, clientY } = event.changedTouches[0];
    const distance = clientX - start.clientX;
    const vertical = Math.abs(clientY - start.clientY);
    start = null;
    if (Math.abs(distance) > Math.max(45, vertical * 1.5)) gesture(distance < 0 ? 1 : -1);
  }, { passive: true });
}
onHorizontalSwipe(photoViewer, direction => showPhoto(photoIndex + direction));
onHorizontalSwipe(roomDetail, direction => showRoomPhoto(roomPhotoIndex + direction));

const sceneTabs = document.querySelector('#scene-tabs');
const sceneMedia = document.querySelector('#hero-media');
const scenes = [
  { image: sceneMedia.firstElementChild },
  { alt: 'Байкал и горы с балкона отеля', file: 'roof-balcony.webp', position: '47%' },
  { alt: 'Ресепшен отеля с лестницей и панорамными окнами', file: 'lobby.webp', position: '44%' },
];
let currentScene = 0;
let requestedScene = 0;
async function showScene(index) {
  requestedScene = index;
  if (currentScene === index) return;
  const scene = scenes[index];
  if (!scene.image) {
    const image = new Image();
    image.className = 'hero-photo';
    image.alt = scene.alt;
    image.style.setProperty('--photo-y', scene.position);
    image.src = 'photos/' + scene.file;
    scene.image = image;
    sceneMedia.append(image);
  }
  try {
    await scene.image.decode();
  } catch {
    return;
  }
  if (requestedScene !== index) return;
  scenes[currentScene].image.classList.remove('is-active');
  scene.image.classList.add('is-active');
  currentScene = index;
  for (const tab of sceneTabs.children) tab.setAttribute('aria-pressed', String(Number(tab.dataset.scene) === index));
}
sceneTabs.addEventListener('click', event => {
  const tab = event.target.closest('[data-scene]');
  if (tab) void showScene(Number(tab.dataset.scene));
});
onHorizontalSwipe(document.querySelector('.hero'), direction =>
  void showScene((requestedScene + direction + scenes.length) % scenes.length));

document.querySelector('#equipment').innerHTML = equipment.map(([item, price]) =>
  '<div><dt>' + item + '</dt><dd>' + price + '</dd></div>'
).join('');

const oneDay = 86400000;
const localHotelDay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Irkutsk', dateStyle: 'short' });

function updateDates() {
  arrival.min = localHotelDay.format(new Date());
  const start = Math.max(Date.parse(arrival.min), Date.parse(arrival.value) || 0);
  departure.min = new Date(start + oneDay).toISOString().slice(0, 10);
  if (departure.value && departure.value < departure.min) departure.value = '';
}

function updateGuests() {
  const room = rooms.find((item) => item.id === bookingRoom.value);
  const previousCount = Number(guests.value) || 2;
  const limit = room?.max ?? 6;
  guests.replaceChildren(...Array.from({ length: limit }, (_, index) => new Option(index + 1, index + 1)));
  guests.value = Math.min(previousCount, limit);
  updateExtraGuests();
}

function updateExtraGuests() {
  const room = rooms.find(item => item.id === bookingRoom.value);
  const extra = Math.max(0, Number(guests.value) - room.base);
  extraFields.replaceChildren();
  if (room.extra) return;
  for (let i = 0; i < extra; i++) {
    const label = document.createElement('label');
    label.textContent = 'Возраст гостя ' + (room.base + i + 1);
    const select = document.createElement('select');
    select.name = 'extraGuest';
    select.required = true;
    select.append(new Option('Выберите возраст', ''), new Option('До 7 лет · с родителями', '0'),
      new Option('7–14 лет', '1500'), new Option('Старше 14 лет', '2500'));
    label.append(select);
    extraFields.append(label);
  }
}

let availabilityRequest;
function openBooking() {
  bookingRoom.value = selectedRoom.id;
  updateGuests();
  updateDates();
  estimate.hidden = true;
  booking.showModal();
}

form.addEventListener('input', () => {
  availabilityRequest?.abort();
  estimate.hidden = true;
});
arrival.addEventListener('change', updateDates);
bookingRoom.addEventListener('change', updateGuests);
guests.addEventListener('change', updateExtraGuests);
booking.addEventListener('close', () => availabilityRequest?.abort());

async function fetchAvailability(query, request) {
  try {
    const url = new URL(availabilityUrl, location.href);
    url.search = query.toString();
    const signal = typeof AbortSignal.any === 'function'
      ? AbortSignal.any([request.signal, AbortSignal.timeout(7500)]) : request.signal;
    const response = await fetch(url, { signal, credentials: 'omit', redirect: 'error' });
    if (response.ok) return await response.json();
  } catch {
    // An unavailable PMS leaves the local estimate and reception link usable.
  }
}

function renderAvailableCategories(availability, guestsCount) {
  const message = document.createElement('p');
  const list = document.createElement('ul');
  list.className = 'available-categories';
  const eligible = rooms.filter(room => guestsCount <= room.max);
  const offers = availability?.status === 'live' && Array.isArray(availability.categories) ? availability.categories : [];
  let confirmed = 0;
  for (const room of eligible) {
    const offer = offers.find(item => item?.room === room.id);
    if (!Number.isSafeInteger(offer?.available) || offer.available < 0) continue;
    confirmed++;
    if (offer.available === 0) continue;
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = room.name;
    const note = document.createElement('small');
    note.textContent = 'Свободных номеров: ' + offer.available;
    if (offer.quote?.adults === guestsCount && Number.isFinite(offer.quote.amount) && offer.quote.amount > 0) {
      note.textContent += ' · ' + formatPrice(offer.quote.amount) + ' за проживание';
    }
    button.append(note);
    button.addEventListener('click', () => {
      bookingRoom.value = room.id;
      updateGuests();
      if (form.reportValidity()) form.requestSubmit(bookingSubmit);
      else estimate.hidden = true;
    });
    row.append(button);
    list.append(row);
  }
  if (list.childElementCount) {
    message.textContent = confirmed < eligible.length
      ? 'Доступные варианты по данным ECVI · по остальным уточнит отель'
      : 'Доступные варианты по данным ECVI';
    estimate.replaceChildren(message, list);
  } else {
    message.textContent = confirmed && confirmed === eligible.length
      ? 'На эти даты нет свободных номеров для выбранного числа гостей'
      : 'Наличие номеров на эти даты уточнит отель';
    estimate.replaceChildren(message);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const all = availabilityUrl && event.submitter === bookingAll;
  if (all ? ![arrival, departure, guests].every(field => field.reportValidity()) : !form.reportValidity()) return;
  const room = rooms.find((item) => item.id === bookingRoom.value);
  const nights = (Date.parse(departure.value) - Date.parse(arrival.value)) / oneDay;
  const guestsCount = Number(guests.value);
  availabilityRequest?.abort();
  estimate.hidden = false;
  if (!room || !Number.isInteger(nights) || nights < 1 || nights > 365) {
    estimate.textContent = 'Выберите период от 1 до 365 ночей';
    return;
  }
  const query = new URLSearchParams({ room: all ? 'all' : room.id, arrival: arrival.value, departure: departure.value });
  if (all) {
    if (guestsCount <= 3) query.set('adults', guestsCount);
    estimate.textContent = 'Проверяем все категории';
    const request = new AbortController();
    availabilityRequest = request;
    const availability = await fetchAvailability(query, request);
    if (!request.signal.aborted) renderAvailableCategories(availability, guestsCount);
    return;
  }
  if (guestsCount <= room.base) query.set('adults', guestsCount);
  const extraDaily = room.extra ? Math.max(0, guestsCount - room.base) * room.extra :
    [...extraFields.querySelectorAll('select')].reduce((sum, input) => sum + Number(input.value), 0);
  let lodging = 0;
  for (let offset = 0; offset < nights; offset++) {
    const day = new Date(Date.parse(query.get('arrival')) + offset * oneDay).getUTCDay();
    lodging += day === 0 || day === 6 ? room.weekend : room.weekday;
  }
  const price = document.createElement('strong');
  price.textContent = formatPrice(lodging + extraDaily * nights) + ' · ночей: ' + nights;
  const text = document.createElement('p');
  const preliminary = 'Предварительная стоимость' + (extraDaily ? ' с доплатой за гостей' : '');
  const fallback = preliminary + ' · наличие уточнит отель';
  text.textContent = availabilityUrl ? preliminary + ' · проверяем наличие' : fallback;
  estimate.replaceChildren(price, text);
  if (!availabilityUrl) return;

  const request = new AbortController();
  availabilityRequest = request;
  const availability = await fetchAvailability(query, request);
  if (request.signal.aborted) return;
  if (availability?.status !== 'live' || !Number.isSafeInteger(availability.available) || availability.available < 0) {
    text.textContent = fallback;
    return;
  }
  if (availability.available === 0) {
    price.hidden = true;
    text.textContent = 'На эти даты нет свободных номеров этой категории';
    return;
  }
  const quote = availability.quote;
  const available = 'Свободных номеров по данным ECVI: ' + availability.available;
  if (quote?.adults === guestsCount && typeof quote.amount === 'number' && Number.isFinite(quote.amount) && quote.amount > 0) {
    price.textContent = formatPrice(quote.amount) + ' · ночей: ' + nights;
    text.textContent = available + ' · тариф за проживание взрослых';
  } else {
    text.textContent = available + ' · стоимость предварительная';
  }
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button?.hasAttribute('data-book')) openBooking();
  if (button?.hasAttribute('data-close')) button.closest('dialog').close();
  if (button?.hasAttribute('data-photo-step')) showPhoto(photoIndex + Number(button.dataset.photoStep));
  const routeLink = event.target.closest('[data-route]');
  if (routeLink && window.WebApp?.platform && typeof window.WebApp.openLink === 'function') {
    event.preventDefault();
    window.WebApp.openLink(routeLink.href);
  }
});

for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}

const fullscreen = document.querySelector('#fullscreen');
if (document.fullscreenEnabled && typeof document.documentElement.requestFullscreen === 'function') {
  fullscreen.hidden = false;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // The MAX container can reserve full-screen actions for its own UI.
    }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreen.setAttribute('aria-label', document.fullscreenElement ? 'Выйти из полноэкранного режима' : 'На весь экран');
  });
}

const navLinks = document.querySelectorAll('.bottom-nav a');
for (const link of navLinks) link.addEventListener('click', () => {
  for (const item of navLinks) item.removeAttribute('aria-current');
  link.setAttribute('aria-current', 'location');
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: .12 });
  for (const section of document.querySelectorAll('.reveal')) {
    if (section.getBoundingClientRect().top >= window.innerHeight) section.classList.add('will-reveal');
    observer.observe(section);
  }
}

function activateMaxBridge() {
  if (typeof window.WebApp?.ready !== 'function') return;
  window.WebApp.ready();
  window.dispatchEvent(new Event('max-bridge-ready'));
}
if (window.WebApp) activateMaxBridge();
else document.querySelector('script[src="https://st.max.ru/js/max-web-app.js"]').addEventListener('load', activateMaxBridge, { once: true });
