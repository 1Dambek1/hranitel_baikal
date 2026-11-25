const rooms = [
  { id: 'family', name: 'Семейный', weekday: 6100, weekend: 6500, base: 3, max: 6,
    facts: ['35 м²', '3–6 гостей', 'Вид на лес', 'Без балкона'],
    note: 'Базовый тариф на троих. До трёх дополнительных гостей можно разместить за отдельную плату' },
  { id: 'family-comfort', name: 'Семейный комфорт', weekday: 8100, weekend: 8800,
    facts: ['Частичный вид на Байкал', 'Большая ванна'],
    note: 'Вместимость и условия дополнительных мест уточняются у администратора' },
  { id: 'comfort', name: 'Комфорт+', weekday: 8100, weekend: 8800, base: 2,
    facts: ['40 м²', '2 гостя по базовому тарифу', 'Частичный вид на Байкал', 'Балкон'],
    note: 'Дополнительное размещение и его стоимость можно уточнить у администратора' },
  { id: 'suite', name: 'Люкс', weekday: 8950, weekend: 9500, base: 2, max: 3,
    facts: ['40 м²', '2 гостя по базовому тарифу', 'Пять окон с видом на Байкал', 'Балкон'],
    note: 'Можно разместить одного гостя на дополнительном месте за отдельную плату' },
  { id: 'presidential', name: 'Президентский', weekday: 17400, weekend: 18900, base: 2,
    facts: ['40 м²', '2 гостя', 'Дополнительный диван'],
    note: 'Условия размещения на дополнительном диване уточняются у администратора' },
];

const photos = [
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
  style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
});
const formatPrice = (value) => currency.format(value);
const roomOptions = document.querySelector('#room-options');
const roomDetail = document.querySelector('#room-detail');
const booking = document.querySelector('#booking');
const form = document.querySelector('#booking-form');
const { arrival, departure, room: bookingRoom, guests } = form.elements;
const estimate = document.querySelector('#estimate');
const photoViewer = document.querySelector('#photo-viewer');
let selectedRoom = rooms[0];
let photoIndex = 0;

roomOptions.innerHTML = rooms.map((room) =>
  '<button class="room-option" type="button" data-room="' + room.id + '" aria-pressed="false">' +
  '<strong>' + room.name + '</strong><span>от ' + formatPrice(room.weekday) + '</span></button>'
).join('');
bookingRoom.replaceChildren(...rooms.map((room) => new Option(room.name, room.id)));

function showRoom(room) {
  selectedRoom = room;
  for (const option of roomOptions.children) {
    option.setAttribute('aria-pressed', String(option.dataset.room === room.id));
  }
  roomDetail.innerHTML =
    '<div><h3>' + room.name + '</h3><ul class="room-facts">' +
    room.facts.map((fact) => '<li>' + fact + '</li>').join('') + '</ul>' +
    '<dl class="room-prices"><div><dt>В будни</dt><dd>' + formatPrice(room.weekday) + '</dd></div>' +
    '<div><dt>В выходные</dt><dd>' + formatPrice(room.weekend) + '</dd></div></dl>' +
    '<p>' + room.note + '</p><div class="actions"><button type="button" class="button primary" data-book>' +
    'Выбрать даты</button><a href="#gallery" class="text-link">Фотогалерея отеля</a></div></div>';
}

roomOptions.addEventListener('click', (event) => {
  const option = event.target.closest('[data-room]');
  if (option) showRoom(rooms.find((room) => room.id === option.dataset.room));
});
showRoom(selectedRoom);

const gallery = document.querySelector('#gallery-grid');
gallery.innerHTML = photos.map(([file, caption], index) =>
  '<button class="gallery-item" type="button" data-photo="' + index + '" aria-label="Открыть фото: ' +
  caption + '"><img src="photos/' + file + '" alt="" loading="lazy"><span>' + caption + '</span></button>'
).join('');

function showPhoto(index) {
  const direction = index < photoIndex ? '-12px' : '12px';
  photoIndex = (index + photos.length) % photos.length;
  const [file, caption] = photos[photoIndex];
  const image = document.querySelector('#viewer-image');
  image.src = 'photos/' + file;
  image.alt = caption;
  document.querySelector('#viewer-caption').textContent = caption;
  document.querySelector('#viewer-count').textContent = (photoIndex + 1) + ' / ' + photos.length;
  const frame = photoViewer.querySelector('figure');
  frame.style.setProperty('--photo-enter', direction);
  frame.classList.remove('is-switching');
  requestAnimationFrame(() => requestAnimationFrame(() => frame.classList.add('is-switching')));
}

gallery.addEventListener('click', (event) => {
  const item = event.target.closest('[data-photo]');
  if (!item) return;
  showPhoto(Number(item.dataset.photo));
  photoViewer.showModal();
});

photoViewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showPhoto(photoIndex - 1);
  if (event.key === 'ArrowRight') showPhoto(photoIndex + 1);
});

let photoTouchStart = null;
photoViewer.addEventListener('touchstart', (event) => {
  photoTouchStart = event.touches[0].clientX;
}, { passive: true });
photoViewer.addEventListener('touchend', (event) => {
  if (photoTouchStart === null) return;
  const distance = event.changedTouches[0].clientX - photoTouchStart;
  photoTouchStart = null;
  if (Math.abs(distance) > 50) showPhoto(photoIndex + (distance < 0 ? 1 : -1));
}, { passive: true });

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

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const room = rooms.find((item) => item.id === bookingRoom.value);
  const nights = (Date.parse(departure.value) - Date.parse(arrival.value)) / oneDay;
  const guestsCount = Number(guests.value);
  availabilityRequest?.abort();
  estimate.hidden = false;
  if (!room || !Number.isInteger(nights) || nights < 1 || nights > 365) {
    estimate.textContent = 'Выберите период от 1 до 365 ночей';
    return;
  }
  const query = new URLSearchParams({ room: room.id, arrival: arrival.value, departure: departure.value });
  const request = new AbortController();
  availabilityRequest = request;
  estimate.textContent = 'Проверяем даты';
  let availability;
  try {
    const response = await fetch('./api/availability?' + query, { signal: request.signal });
    if (response.ok) availability = await response.json();
  } catch {
    if (request.signal.aborted) return;
  }
  if (request.signal.aborted) return;
  let lodging = 0;
  for (let offset = 0; offset < nights; offset++) {
    const day = new Date(Date.parse(query.get('arrival')) + offset * oneDay).getUTCDay();
    lodging += day === 0 || day === 6 ? room.weekend : room.weekday;
  }
  const price = document.createElement('strong');
  price.textContent = formatPrice(lodging) + ' · ночей: ' + nights;
  const text = document.createElement('p');
  if (availability?.status === 'live' && Number.isInteger(availability.available)) {
    text.textContent = availability.available === 0 ? 'На эти даты нет свободных номеров этой категории' :
      'Свободных номеров этой категории: ' + availability.available + ' · условия размещения подтвердит отель';
  } else {
    text.textContent = 'Ориентир по базовому тарифу · наличие уточнит отель';
  }
  const write = document.createElement('button');
  write.className = 'mini-link';
  write.type = 'button';
  write.textContent = 'Написать о брони';
  write.dataset.help = 'Здравствуйте! Интересует номер «' + room.name + '» с ' + query.get('arrival') +
    ' по ' + query.get('departure') + ', гостей: ' + guestsCount;
  estimate.replaceChildren(price, text, write);
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

window.WebApp?.ready?.();
