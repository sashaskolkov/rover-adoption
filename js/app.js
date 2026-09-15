/* ============================================================
   app.js — логика прототипа
   ============================================================ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- состояние ---------- */
const DEFAULT_STATE = {
  skin: 'classic',
  owned: ['classic'],
  coins: 1240,
  photoDate: null,
  photoIdx: 0,
  pushSeen: false
};
let S = load();

function load() {
  try {
    const raw = localStorage.getItem('rover.v1');
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch { return { ...DEFAULT_STATE }; }
}
function save() { try { localStorage.setItem('rover.v1', JSON.stringify(S)); } catch {} }

const me = () => ROVERS.find(r => r.mine);
const byId = id => ROVERS.find(r => r.id === id);
let selectedId = 'semen';
let selectedSkin = S.skin;
let skinCat = 'all';

/* ---------- утилиты ---------- */
function toast(msg, ms = 2400) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), ms);
}
function haptic(pattern = 12) { if (navigator.vibrate) try { navigator.vibrate(pattern); } catch {} }
function fmtNum(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* расстояние между координатами, м */
function distM(a, b) {
  const R = 6371000, toR = d => d * Math.PI / 180;
  const dLat = toR(b[0] - a[0]), dLon = toR(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/* короткий «бип» ровера */
let audioCtx;
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t0 = audioCtx.currentTime;
    [880, 1320].forEach((f, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + i * 0.16);
      g.gain.exponentialRampToValueAtTime(0.09, t0 + i * 0.16 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.16 + 0.14);
      o.connect(g).connect(audioCtx.destination);
      o.start(t0 + i * 0.16); o.stop(t0 + i * 0.16 + 0.16);
    });
  } catch {}
}

/* ---------- часы в статус-баре ---------- */
function tickClock() {
  const d = new Date();
  $('#sbTime').textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
}
tickClock(); setInterval(tickClock, 20000);

/* ============================================================
   КАРТА
   ============================================================ */
let map, markers = {}, meMarker;

function initMap() {
  map = L.map('map', {
    center: [55.7345, 37.5895], zoom: 16, zoomControl: false,
    attributionControl: true, minZoom: 14, maxZoom: 18
  });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19, className: 'tiles'
  }).addTo(map);

  meMarker = L.marker(HOME, {
    icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [20, 20], iconAnchor: [10, 10] })
  }).addTo(map);

  ROVERS.forEach(r => {
    r.route = ROUTES[r.id];
    r.seg = Math.floor(r.t * (r.route.length));
    r.f = 0;
    r.pos = r.route[r.seg].slice();
    const m = L.marker(r.pos, {
      icon: roverIcon(r), zIndexOffset: r.mine ? 1000 : 0
    }).addTo(map);
    m.on('click', () => selectRover(r.id));
    markers[r.id] = m;
  });

  requestAnimationFrame(loop);
  setTimeout(() => focusRover(me(), false), 300);
}

/* центрируем ровера так, чтобы он не уехал под шторку */
function focusRover(r, animate = true) {
  if (!r || !r.pos) return;
  const z = map.getZoom();
  const p = map.project(r.pos, z);
  p.y += 92;
  map.panTo(map.unproject(p, z), { animate, duration: .5 });
}

function roverIcon(r) {
  return L.divIcon({
    className: '',
    html: `<div class="rv-marker ${r.mine ? 'mine' : ''}" data-rv="${r.id}">
             <div class="rv-ring"></div>
             <div class="rv-bubble">${roverPin(r.mine ? S.skin : r.skin)}</div>
             <div class="rv-label">${r.name}</div>
           </div>`,
    iconSize: [70, 76], iconAnchor: [35, 38]
  });
}

/* движение по маршруту */
let last = 0;
function loop(ts) {
  const dt = Math.min(64, ts - last || 16); last = ts;
  ROVERS.forEach(r => {
    const route = r.route;
    const a = route[r.seg % route.length];
    const b = route[(r.seg + 1) % route.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    r.f += (r.speed * dt / 16) / len;
    while (r.f >= 1) { r.f -= 1; r.seg = (r.seg + 1) % route.length; }
    const a2 = route[r.seg % route.length], b2 = route[(r.seg + 1) % route.length];
    r.pos = [a2[0] + (b2[0] - a2[0]) * r.f, a2[1] + (b2[1] - a2[1]) * r.f];
    markers[r.id].setLatLng(r.pos);
  });
  if (++loop.n % 30 === 0) refreshSheetMeta();
  requestAnimationFrame(loop);
}
loop.n = 0;

function repaintMarker(id) {
  const r = byId(id);
  markers[id].setIcon(roverIcon(r));
}

/* ============================================================
   ЧИПСЫ + ШТОРКА
   ============================================================ */
function renderChips() {
  $('#chips').innerHTML = ROVERS.map(r => `
    <button class="chip ${r.mine ? 'mine' : ''} ${r.id === selectedId ? 'is-on' : ''}" data-rv="${r.id}">
      ${roverPin(r.mine ? S.skin : r.skin)}
    </button>`).join('');
}

function selectRover(id) {
  selectedId = id;
  haptic(8);
  renderChips();
  renderSheet();
  focusRover(byId(id));
  $('#answer').hidden = true;
}

function renderSheet() {
  const r = byId(selectedId);
  const skin = r.mine ? S.skin : r.skin;
  $('#sheetAva').innerHTML = roverSVG(skin, { size: 62, flat: true });
  $('#sheetName').textContent = r.name;
  $('#mapTitleName').textContent = r.mine ? r.name : `${r.name} · ${r.owner}`;
  $('#mapTitleName').previousElementSibling.textContent = r.mine ? 'Мой ровер' : 'Чужой ровер';

  const mine = r.mine;
  $('#btnHow').disabled = !mine;
  $('#btnSignal').disabled = !mine;
  $('#btnPhoto').disabled = !mine;
  $('#promoWardrobe').style.display = mine ? '' : 'none';

  $('#stOrders').textContent = mine ? 37 : 12 + (r.name.length * 3);
  $('#stKm').textContent = mine ? '18,4' : (6 + r.name.length).toFixed(1).replace('.', ',');
  $('#stDays').textContent = mine ? 126 : 40 + r.name.length * 7;
  $$('.stat span')[2].textContent = mine ? 'дней с вами' : `дней с ${r.owner}`;

  $('#promoArt').innerHTML = roverSVG(S.skin, { size: 78, flat: true });
  $('#promoWardrobe').querySelector('span').textContent =
    `${SKINS.length - S.owned.length} скинов ждут · у вас ${fmtNum(S.coins)} ⚙️`;

  renderNearby();
  refreshSheetMeta();
}

function refreshSheetMeta() {
  const r = byId(selectedId);
  if (!r || !r.pos) return;
  const d = distM(HOME, r.pos);
  const dTxt = d > 950 ? (d / 1000).toFixed(1).replace('.', ',') + ' км' : d + ' м';
  $('#sheetSub').textContent = `${r.plate} · ${r.mine ? 'в пути' : 'опекун: ' + r.owner} · ${dTxt} от вас`;
  const batt = 55 + Math.round(35 * Math.abs(Math.sin(r.seg + r.f)));
  $('#sheetMood').querySelector('.mood-val').textContent = batt + '%';

  // пуш, когда мой ровер подъехал близко
  if (r.mine && !S.pushSeen && d < 260 && $('.screen.is-active').dataset.screen === 'map') {
    S.pushSeen = true; save();
    setTimeout(() => showPush(0), 800);
  }
}

function renderNearby() {
  const r = byId(selectedId);
  const others = ROVERS.filter(x => x.id !== r.id)
    .map(x => ({ x, d: distM(r.pos || HOME, x.pos || HOME) }))
    .sort((a, b) => a.d - b.d).slice(0, 5);
  $('#nearby').innerHTML = others.map(({ x, d }) => `
    <button class="nb" data-rv="${x.id}">
      ${roverPin(x.mine ? S.skin : x.skin)}
      <b>${x.name}</b>
      <span>${d > 950 ? (d / 1000).toFixed(1).replace('.', ',') + ' км' : d + ' м'}</span>
    </button>`).join('');
}

/* шторка: тап по «ручке» и свайп */
const sheet = $('#sheet');
function setSheet(expanded) {
  sheet.classList.toggle('expanded', expanded);
  const h = expanded ? 648 : 258;
  $('#viewport').style.setProperty('--sheet-h', h + 'px');
  $('#chips').classList.toggle('hide', expanded);
  $('.map-side').classList.toggle('hide', expanded);
}
setSheet(false);

(function sheetDrag() {
  let y0 = null;
  const grab = $('#sheetGrab');
  const start = e => { y0 = (e.touches ? e.touches[0] : e).clientY; };
  const end = e => {
    if (y0 === null) return;
    const y1 = (e.changedTouches ? e.changedTouches[0] : e).clientY;
    const dy = y1 - y0;
    if (Math.abs(dy) < 8) setSheet(!sheet.classList.contains('expanded'));
    else setSheet(dy < 0);
    y0 = null;
  };
  grab.addEventListener('mousedown', start); grab.addEventListener('mouseup', end);
  grab.addEventListener('touchstart', start, { passive: true });
  grab.addEventListener('touchend', end);
  $('#sheet').addEventListener('click', e => {
    if (e.target.closest('.sheet-head') && !sheet.classList.contains('expanded')) setSheet(true);
  });
})();

/* ============================================================
   ДЕЙСТВИЯ С РОВЕРОМ
   ============================================================ */
$('#btnHow').onclick = () => {
  haptic(10);
  setSheet(true);
  const a = $('#answer');
  a.hidden = false;
  $('#answerText').textContent = pick(STATUSES);
  a.style.animation = 'none'; void a.offsetWidth; a.style.animation = '';
  $('.sheet-scroll').scrollTop = 0;
};

$('#btnSignal').onclick = () => {
  haptic([18, 60, 18]);
  beep();
  const el = document.querySelector(`.rv-marker[data-rv="${selectedId}"]`);
  if (el) { el.classList.remove('signal'); void el.offsetWidth; el.classList.add('signal'); }
  focusRover(byId(selectedId));
  toast(`${byId(selectedId).name} моргнул фарами и сказал «бип»`);
};

$('#btnPhoto').onclick = openPhoto;
$('#btnPhotoShortcut').onclick = openPhoto;

function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }

function openPhoto() {
  const used = S.photoDate === todayKey();
  if (used) {
    const d = new Date(); d.setHours(24, 0, 0, 0);
    const left = d - new Date();
    const h = Math.floor(left / 3600000), m = Math.floor(left % 3600000 / 60000);
    modal(`
      <div class="mc-art">${roverSVG(S.skin, { size: 180, eyes: 'sleepy' })}</div>
      <h3 class="mc-title">Кадр на сегодня уже сделан</h3>
      <p class="mc-sub">Семён снимает один кадр в сутки — чтобы не расходовать батарею на позёрство.
        Следующий через ${h} ч ${m} мин.</p>
      <div class="mc-row">
        <button class="btn-primary ghost" data-close>Понятно</button>
        <button class="btn-primary" id="seeLast">Показать вчерашний</button>
      </div>`);
    $('#seeLast').onclick = () => showShot(S.photoIdx);
    return;
  }
  const idx = Math.floor(Math.random() * EYE_SCENES.length);
  S.photoDate = todayKey(); S.photoIdx = idx; save();
  updatePhotoBadge();
  haptic([10, 40, 10]);
  showShot(idx, true);
}

function showShot(idx, fresh) {
  const now = new Date();
  const stamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} · A-1856`;
  modal(`
    <h3 class="mc-title">${fresh ? 'Кадр дня' : 'Последний кадр'}</h3>
    <p class="mc-sub">Снято камерой Семёна, ${now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
    <div class="shot">${eyeShotSVG(idx, stamp)}</div>
    <p class="shot-cap">«${EYE_SCENES[idx % EYE_SCENES.length].cap}»</p>
    <div class="mc-row">
      <button class="btn-primary ghost" data-close>Закрыть</button>
      <button class="btn-primary" id="shotShare">Поделиться</button>
    </div>`);
  $('#shotShare').onclick = () => { closeModal(); toast('В прототипе шеринг выключен — но кадр сохранён в дневник'); };
}

function updatePhotoBadge() {
  const b = $('#photoBadge');
  const avail = S.photoDate !== todayKey();
  b.hidden = !avail;
  $('#btnPhoto .q-lbl').textContent = avail ? 'Фото дня' : 'Кадр снят';
}

/* ============================================================
   МОДАЛКА
   ============================================================ */
function modal(html) {
  $('#modalCard').innerHTML = html;
  $('#modal').classList.add('show');
}
function closeModal() { $('#modal').classList.remove('show'); }
$('#modal').addEventListener('click', e => {
  if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal();
});

/* ============================================================
   ГАРДЕРОБ
   ============================================================ */
function renderWardrobe() {
  $('#skinTabs').innerHTML = SKIN_CATS.map(c =>
    `<button class="st ${c.id === skinCat ? 'is-on' : ''}" data-cat="${c.id}">${c.name}</button>`).join('');

  const list = SKINS.filter(s => skinCat === 'all' || s.cat === skinCat);
  $('#skins').innerHTML = list.map(s => {
    const own = S.owned.includes(s.id);
    const on = S.skin === s.id;
    return `<button class="skin ${selectedSkin === s.id ? 'is-sel' : ''} ${on ? 'is-on' : ''}" data-skin="${s.id}">
      ${on ? '<i class="flag">Надет</i>' : ''}
      ${!own ? '<i class="lock">🔒</i>' : ''}
      <div class="skin-art">${roverSVG(s.id, { size: 104, flat: true })}</div>
      <b>${s.name}</b>
      <span class="p ${own ? 'own' : ''}">${own ? (on ? 'на ровере' : 'куплен') : fmtNum(s.price) + ' ⚙️'}</span>
    </button>`;
  }).join('');

  const sk = SKINS.find(s => s.id === selectedSkin);
  $('#previewArt').innerHTML = roverSVG(selectedSkin, { size: 216, plate: 'A-1856' });
  $('#previewName').textContent = sk.name;
  $('#previewArt').nextElementSibling.nextElementSibling.textContent = sk.desc;

  const own = S.owned.includes(selectedSkin);
  const btn = $('#btnEquip');
  if (S.skin === selectedSkin) { btn.textContent = 'Уже на Семёне'; btn.disabled = true; }
  else if (own) { btn.textContent = 'Надеть на Семёна'; btn.disabled = false; }
  else { btn.textContent = `Купить за ${fmtNum(sk.price)} ⚙️`; btn.disabled = false; }

  $('#walletVal').textContent = fmtNum(S.coins);
  $('#walletVal2').textContent = fmtNum(S.coins);
}

$('#skins').addEventListener('click', e => {
  const b = e.target.closest('[data-skin]'); if (!b) return;
  selectedSkin = b.dataset.skin; haptic(6); renderWardrobe();
});
$('#skinTabs').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if (!b) return;
  skinCat = b.dataset.cat; renderWardrobe();
});

$('#btnEquip').onclick = () => {
  const sk = SKINS.find(s => s.id === selectedSkin);
  if (S.owned.includes(sk.id)) { equip(sk); return; }
  if (S.coins < sk.price) {
    modal(`<h3 class="mc-title">Не хватает ⚙️</h3>
      <p class="mc-sub">Нужно ещё ${fmtNum(sk.price - S.coins)} болтов. Их начисляют за заказы Семёна,
      серии дней и достижения.</p>
      <div class="mc-row"><button class="btn-primary" data-close>Ладно, накоплю</button></div>`);
    return;
  }
  modal(`
    <div class="mc-art">${roverSVG(sk.id, { size: 180, plate: 'A-1856' })}</div>
    <h3 class="mc-title">${sk.name}</h3>
    <p class="mc-sub">${sk.desc} Скин увидят все, кто смотрит на карту.</p>
    <div class="price-big">${fmtNum(sk.price)} ⚙️ <small>у вас ${fmtNum(S.coins)}</small></div>
    <div class="mc-row">
      <button class="btn-primary ghost" data-close>Отмена</button>
      <button class="btn-primary" id="doBuy">Купить и надеть</button>
    </div>`);
  $('#doBuy').onclick = () => {
    S.coins -= sk.price; S.owned.push(sk.id); save();
    closeModal(); equip(sk, true);
  };
};

function equip(sk, bought) {
  S.skin = sk.id; save();
  haptic([12, 50, 12]);
  renderWardrobe(); renderChips(); repaintMarker('semen'); renderSheet(); renderProfile();
  toast(bought ? `«${sk.name}» куплен и надет на Семёна` : `Семён переоделся в «${sk.name}»`);
}

/* ============================================================
   ПОДКАСТ
   ============================================================ */
let playing = null, playTimer = null, playPos = 0;

function renderPodcast() {
  $('#podCover').innerHTML = roverSVG('neon', { size: 118, flat: true, eyes: 'happy' });
  $('#episodes').innerHTML = EPISODES.map(e => `
    <button class="ep ${playing && playing.n === e.n ? 'playing' : ''}" data-ep="${e.n}">
      <div class="ep-num">${e.n}</div>
      <div class="ep-body">
        <b>${e.title}</b>
        <p>${e.desc}</p>
        <div class="ep-meta"><span>${e.date}</span><span>·</span><span>${e.dur}</span>
          ${e.hot ? '<span class="ep-hot">новый</span>' : ''}</div>
      </div>
    </button>`).join('');
}

function durSec(d) { const [m, s] = d.split(':').map(Number); return m * 60 + s; }
function fmtSec(s) { return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'); }

function play(ep) {
  playing = ep; playPos = 0;
  $('#player').hidden = false;
  $('#plArt').innerHTML = roverSVG('neon', { size: 44, flat: true, eyes: 'happy' });
  $('#plTitle').textContent = ep.title;
  $('#plDur').textContent = ep.dur;
  renderPodcast();
  startTimer();
}
const ICO_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="5.5" height="18" rx="2"/><rect x="13.5" y="3" width="5.5" height="18" rx="2"/></svg>';
const ICO_PLAY  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3.7c0-1.3 1.4-2.1 2.5-1.4l12 8.3a1.7 1.7 0 0 1 0 2.8l-12 8.3C7.4 22.4 6 21.6 6 20.3V3.7Z"/></svg>';

function startTimer() {
  clearInterval(playTimer);
  $('#plToggle').innerHTML = ICO_PAUSE;
  const total = durSec(playing.dur);
  playTimer = setInterval(() => {
    playPos += 1.6;                       // ускоренная «перемотка» для демо
    if (playPos >= total) { playPos = 0; }
    $('#plProgress').style.width = (playPos / total * 100) + '%';
    $('#plCur').textContent = fmtSec(playPos);
  }, 90);
}
$('#plToggle').onclick = () => {
  if (playTimer) { clearInterval(playTimer); playTimer = null; $('#plToggle').innerHTML = ICO_PLAY; }
  else startTimer();
};
$('#episodes').addEventListener('click', e => {
  const b = e.target.closest('[data-ep]'); if (!b) return;
  haptic(8);
  play(EPISODES.find(x => x.n === +b.dataset.ep));
});
$('#btnPodPlay').onclick = () => { haptic(8); play(EPISODES[0]); };
$('#promoPodcast').onclick = () => { go('podcast'); setTimeout(() => play(EPISODES[0]), 350); };
$('#promoWardrobe').onclick = () => go('wardrobe');

/* ============================================================
   ПРОФИЛЬ
   ============================================================ */
function renderProfile() {
  $('#profArt').innerHTML = roverSVG(S.skin, { size: 104, flat: true, eyes: 'happy' });
  $('#achis').innerHTML = ACHIS.map(a => `
    <div class="achi ${a.got ? '' : 'off'}">
      <span class="i">${a.ico}</span><b>${a.name}</b><span>${a.hint}</span>
    </div>`).join('');
  $('#diary').innerHTML = DIARY.map(d => `<div class="di"><b>${d.t}</b><p>${d.txt}</p></div>`).join('');
  $('#walletVal2').textContent = fmtNum(S.coins);
  const pct = Math.min(100, Math.round(S.coins / 2000 * 100));
  $('.xp-bar i').style.width = pct + '%';
  $('.xp-head b').textContent = `${fmtNum(S.coins)} / 2 000 ⚙️`;
}

$('#demoPush').onclick = () => { go('map'); setTimeout(() => showPush(Math.floor(Math.random() * PUSHES.length)), 450); };
$('#demoPhotoReset').onclick = () => { S.photoDate = null; save(); updatePhotoBadge(); toast('Фото дня снова доступно'); };
$('#demoCoins').onclick = () => { S.coins += 1000; save(); renderProfile(); renderWardrobe(); renderSheet(); toast('+1 000 ⚙️ начислено'); };
$('#demoReset').onclick = () => {
  modal(`<h3 class="mc-title">Сбросить прогресс?</h3>
    <p class="mc-sub">Скины, болты и кадр дня вернутся к исходным значениям прототипа.</p>
    <div class="mc-row"><button class="btn-primary ghost" data-close>Отмена</button>
    <button class="btn-primary" id="doReset">Сбросить</button></div>`);
  $('#doReset').onclick = () => { localStorage.removeItem('rover.v1'); location.reload(); };
};

/* ============================================================
   ПУШ
   ============================================================ */
function showPush(i) {
  const p = PUSHES[i % PUSHES.length];
  const r = me();
  $('#pushIco').innerHTML = roverPin(S.skin);
  $('#pushTitle').textContent = p.title.replace('{name}', r.name);
  $('#pushText').textContent = p.text;
  $('#pushTime').textContent = 'сейчас';
  const el = $('#push');
  el.classList.add('show');
  haptic([8, 40, 8]);
  $('#tabDot').hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 6000);
}
$('#push').onclick = () => {
  $('#push').classList.remove('show');
  go('map'); selectRover('semen'); setSheet(true);
};
$('#btnBell').onclick = () => showPush(Math.floor(Math.random() * PUSHES.length));

/* ============================================================
   НАВИГАЦИЯ
   ============================================================ */
function go(name) {
  $$('.screen').forEach(s => s.classList.toggle('is-active', s.dataset.screen === name));
  $$('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.goto === name));
  $('#tabbar').classList.toggle('dark', name === 'podcast');
  document.body.classList.toggle('dark-status', name === 'podcast');
  $('#tabbar').style.display = '';
  if (name === 'wardrobe') { selectedSkin = S.skin; renderWardrobe(); }
  if (name === 'podcast') renderPodcast();
  if (name === 'profile') { renderProfile(); $('#tabDot').hidden = true; }
  if (name === 'map') setTimeout(() => map.invalidateSize(), 320);
  $$('.scroll').forEach(s => s.scrollTop = 0);
  haptic(6);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-goto]'); if (b) go(b.dataset.goto);
  const c = e.target.closest('[data-rv]'); if (c && c.dataset.rv) selectRover(c.dataset.rv);
});
$('#btnLocate').onclick = () => { map.panTo(HOME, { animate: true }); toast('Вы здесь'); };
$('#btnLayers').onclick = () => toast('В прототипе один слой карты');

/* ============================================================
   СТАРТ
   ============================================================ */
initMap();
renderChips();
renderSheet();
renderWardrobe();
renderProfile();
updatePhotoBadge();

/* приветственный экран при первом запуске */
if (!localStorage.getItem('rover.seen')) {
  localStorage.setItem('rover.seen', '1');
  setTimeout(() => modal(`
    <div class="mc-art">${roverSVG(S.skin, { size: 180, eyes: 'happy', plate: 'A-1856' })}</div>
    <h3 class="mc-title">Знакомьтесь — Семён</h3>
    <p class="mc-sub">Ровер A-1856 закреплён за вами. Он настоящий и прямо сейчас развозит заказы
      в Хамовниках. Следите за ним на карте, спрашивайте как дела, переодевайте и подавайте сигнал —
      он правда моргнёт фарами.</p>
    <div class="mc-row"><button class="btn-primary" data-close>Поехали</button></div>`), 700);
}
