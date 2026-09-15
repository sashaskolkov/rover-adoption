/* Забирает реальную геометрию тротуаров и дорожек Хамовников из OSRM
   (пешеходный профиль) и собирает из неё замкнутые маршруты роверов.
   Запуск: node tools/fetch-routes.js  →  перезаписывает js/routes.js

   Гоняем один раз на этапе сборки: в рантайме прототип остаётся статикой
   и в сеть за маршрутами не ходит. */

const fs = require('fs');
const path = require('path');

const API = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/';
const HOME = [55.73390, 37.58870];

/* Опорные точки района — офис на Льва Толстого и всё вокруг него */
const P = {
  office:  [55.7339, 37.5887],
  frunze:  [55.7357, 37.5878],
  zubov:   [55.7368, 37.5912],
  park:    [55.7350, 37.5935],
  pirogov: [55.7330, 37.5915],
  komsomol:[55.7322, 37.5872],
  truzh:   [55.7345, 37.5845],
  plyush:  [55.7368, 37.5847],
  efremov: [55.7311, 37.5842],
  hamovval:[55.7302, 37.5893],
  smolensk:[55.7379, 37.5889],
  frunzen: [55.7314, 37.5948]
};

const LOOPS = {
  semen:   ['office', 'frunze', 'zubov', 'park', 'pirogov', 'office'],
  pika:    ['truzh', 'plyush', 'smolensk', 'frunze', 'truzh'],
  kipelov: ['pirogov', 'frunzen', 'hamovval', 'komsomol', 'pirogov'],
  r2d2:    ['komsomol', 'efremov', 'hamovval', 'pirogov', 'komsomol'],
  bublik:  ['frunze', 'zubov', 'smolensk', 'plyush', 'frunze'],
  shurup:  ['truzh', 'office', 'komsomol', 'efremov', 'truzh'],
  valera:  ['park', 'frunzen', 'pirogov', 'office', 'park'],
  zefirka: ['office', 'truzh', 'plyush', 'frunze', 'office']
};

const distM = (a, b) => {
  const R = 6371000, toR = d => d * Math.PI / 180;
  const dLat = toR(b[0] - a[0]), dLon = toR(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/* выкидываем точки, которые стоят ближе 5 м — на карте разницы не видно */
function thin(pts, minGap = 5) {
  const out = [pts[0]];
  for (const p of pts.slice(1, -1)) if (distM(out[out.length - 1], p) >= minGap) out.push(p);
  return out;
}

async function route(names) {
  const coords = names.map(n => `${P[n][1]},${P[n][0]}`).join(';');
  const url = `${API}${coords}?overview=full&geometries=geojson&continue_straight=true`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.code !== 'Ok') throw new Error(`${j.code}: ${j.message || ''}`);
  const pts = j.routes[0].geometry.coordinates.map(([lon, lat]) => [+lat.toFixed(6), +lon.toFixed(6)]);
  return { pts: thin(pts), distance: j.routes[0].distance };
}

(async () => {
  const out = {};
  const report = [];
  for (const [id, names] of Object.entries(LOOPS)) {
    const { pts, distance } = await route(names);
    // замыкаем петлю строго, иначе на стыке круга ровер дёргается
    const last = pts[pts.length - 1];
    if (last[0] !== pts[0][0] || last[1] !== pts[0][1]) pts.push(pts[0]);
    out[id] = pts;
    const far = Math.max(...pts.map(p => distM(HOME, p)));
    report.push(`${id.padEnd(8)} ${pts.length.toString().padStart(4)} точек  ${Math.round(distance)} м круг  макс. ${Math.round(far)} м от дома`);
    await new Promise(r => setTimeout(r, 900)); // вежливо к публичному серверу
  }

  const body = `/* ============================================================
   routes.js — маршруты роверов.

   Это НЕ нарисованные от руки линии: геометрия выгружена из
   OpenStreetMap пешеходным роутером (tools/fetch-routes.js),
   поэтому роверы едут по настоящим тротуарам и дорожкам Хамовников.
   Перегенерировать: node tools/fetch-routes.js
   ============================================================ */

const ROUTES = ${JSON.stringify(out).replace(/\],\[/g, '],\n    [').replace(/:\[\[/g, ': [\n    [').replace(/\]\],/g, ']\n  ],\n  ').replace(/^\{/, '{\n  ').replace(/\]\]\}$/, ']\n  ]\n}')};
`;
  fs.writeFileSync(path.join(__dirname, '..', 'js', 'routes.js'), body);
  console.log(report.join('\n'));
  console.log('\n→ js/routes.js записан');
})();
