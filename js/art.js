/* ============================================================
   art.js — векторный ровер и его скины.
   Всё рисуется на месте, без картинок: скин = набор параметров.
   ============================================================ */

let _uid = 0;
const uid = () => 'g' + (++_uid);

/* Палитры скинов. lid — верхняя крышка, body — корпус,
   glass — панель «лица», eye — цвет глаз. */
const SKIN_ART = {
  classic: { lid: '#FFFFFF', lid2: '#ECEAE6', body: '#2E2D2B', glass: '#141315', eye: '#FFFFFF', wheel: '#232221' },
  courier: { lid: '#FFDB4D', lid2: '#F5C000', body: '#21201F', glass: '#141315', eye: '#FFE873', wheel: '#181716' },
  neon:    { lid: '#20204A', lid2: '#12122E', body: '#0E0E22', glass: '#07070F', eye: '#5BF3FF', wheel: '#0A0A16', glow: '#B14BFF' },
  winter:  { lid: '#EAF4FF', lid2: '#CFE4F7', body: '#3C4B5E', glass: '#141a22', eye: '#D8F1FF', wheel: '#26313D' },
  tropic:  { lid: '#19C69B', lid2: '#0FA07C', body: '#154E44', glass: '#0C1C19', eye: '#FFF3B0', wheel: '#123A33' },
  cosmo:   { lid: '#DDE3EC', lid2: '#B9C2D0', body: '#474D58', glass: '#0F1218', eye: '#9FE6FF', wheel: '#2C313A' },
  pixel:   { lid: '#FFD34D', lid2: '#E8A400', body: '#2B2540', glass: '#100E1C', eye: '#7CFF6B', wheel: '#1D1930' },
  royal:   { lid: '#F7D774', lid2: '#C89B26', body: '#2A2418', glass: '#15110A', eye: '#FFF0BE', wheel: '#1C1810' },
  coffee:  { lid: '#8A5A3B', lid2: '#63402A', body: '#352419', glass: '#140E09', eye: '#F2D9B8', wheel: '#241810' },
  rescue:  { lid: '#FF5436', lid2: '#D6371C', body: '#262524', glass: '#121111', eye: '#FFD5CC', wheel: '#181716' }
};

/* Глаза: разные выражения */
function eyesPath(kind, c) {
  const e = c.eye;
  switch (kind) {
    case 'happy':
      return `<path d="M72 106q9-11 18 0" stroke="${e}" stroke-width="7" stroke-linecap="round" fill="none"/>
              <path d="M110 106q9-11 18 0" stroke="${e}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    case 'square':
      return `<rect x="74" y="94" width="16" height="16" fill="${e}"/><rect x="110" y="94" width="16" height="16" fill="${e}"/>`;
    case 'sleepy':
      return `<path d="M72 104h18M110 104h18" stroke="${e}" stroke-width="7" stroke-linecap="round"/>`;
    case 'star':
      return `<path d="M81 90l4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L81 113.6 71.7 118.5l1.8-10.3-7.5-7.3 10.4-1.5z" fill="${e}"/>
              <path d="M119 90l4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L119 113.6l-9.3 4.9 1.8-10.3-7.5-7.3 10.4-1.5z" fill="${e}"/>`;
    default:
      return `<rect x="73" y="92" width="17" height="22" rx="8.5" fill="${e}"/>
              <rect x="110" y="92" width="17" height="22" rx="8.5" fill="${e}"/>`;
  }
}

/* Аксессуары поверх крышки */
function accessory(skin, id) {
  switch (skin) {
    case 'winter': return `
      <path d="M52 44c0-16 21-27 48-27s48 11 48 27z" fill="#E8453C"/>
      <rect x="46" y="38" width="108" height="14" rx="7" fill="#fff"/>
      <circle cx="100" cy="12" r="11" fill="#fff"/>`;
    case 'tropic': return `
      <g transform="translate(140 26)">
        <circle r="7" fill="#FF5E7A"/><circle cx="11" cy="-6" r="7" fill="#FF8FA3"/>
        <circle cx="11" cy="7" r="7" fill="#FF8FA3"/><circle cx="-8" cy="8" r="7" fill="#FF8FA3"/>
        <circle cx="-8" cy="-8" r="7" fill="#FF8FA3"/><circle r="4.5" fill="#FFD84D"/>
      </g>
      <rect x="60" y="86" width="80" height="16" rx="8" fill="#141315"/>
      <path d="M62 90h30v10H62zM108 90h30v10h-30z" fill="#2B2B33"/>`;
    case 'cosmo': return `
      <path d="M44 62a56 44 0 0 1 112 0z" fill="#BFE6FF" opacity=".42"/>
      <path d="M44 62a56 44 0 0 1 112 0" fill="none" stroke="#fff" stroke-width="3"/>
      <path d="M62 40q14-18 34-19" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8"/>`;
    case 'royal': return `
      <path d="M62 40 68 8l16 18 16-24 16 24 16-18 6 32z" fill="url(#${id}gold)"/>
      <rect x="60" y="38" width="80" height="11" rx="5.5" fill="url(#${id}gold)"/>
      <circle cx="84" cy="30" r="4" fill="#E8453C"/><circle cx="116" cy="30" r="4" fill="#3C7FE8"/>`;
    case 'coffee': return `
      <g transform="translate(100 18)">
        <path d="M-18 6h32v16a8 8 0 0 1-8 8h-16a8 8 0 0 1-8-8z" fill="#fff"/>
        <rect x="-21" y="0" width="38" height="8" rx="3" fill="#E7E2DA"/>
        <path d="M-6 -6q6-6 0-12M6 -6q6-6 0-12" stroke="#CBBFB2" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>`;
    case 'rescue': return `
      <rect x="84" y="14" width="32" height="16" rx="6" fill="#FF3B2F"/>
      <rect x="80" y="28" width="40" height="7" rx="3.5" fill="#1B1B1B"/>
      <ellipse cx="100" cy="20" rx="26" ry="14" fill="#FF3B2F" opacity=".22"/>`;
    case 'pixel': return `
      <g fill="#6BE86B"><rect x="76" y="20" width="10" height="10"/><rect x="86" y="10" width="10" height="10"/>
      <rect x="96" y="20" width="10" height="10"/><rect x="106" y="10" width="10" height="10"/>
      <rect x="116" y="20" width="10" height="10"/><rect x="66" y="30" width="70" height="10"/></g>`;
    case 'neon': return `
      <rect x="66" y="30" width="68" height="8" rx="4" fill="#B14BFF"/>
      <ellipse cx="100" cy="150" rx="74" ry="14" fill="url(#${id}under)"/>`;
    case 'courier': return `
      <circle cx="44" cy="64" r="12" fill="#E8453C"/>
      <text x="44" y="71" font-size="17" font-weight="800" text-anchor="middle" fill="#fff" font-family="Helvetica,Arial">Я</text>`;
    default: return '';
  }
}

/**
 * Рисует ровера.
 * @param {string} skin   ключ из SKIN_ART
 * @param {object} o      {eyes, plate, size, flat}
 */
function roverSVG(skin, o = {}) {
  const c = SKIN_ART[skin] || SKIN_ART.classic;
  const id = uid();
  const eyes = o.eyes || (skin === 'pixel' ? 'square' : skin === 'tropic' ? 'sleepy' : 'normal');
  const plate = o.plate || '';
  const w = o.size || 200;

  return `<svg viewBox="0 0 200 172" width="${w}" height="${w * 0.86}" class="rover-svg" aria-hidden="true">
  <defs>
    <linearGradient id="${id}lid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.lid}"/><stop offset="1" stop-color="${c.lid2}"/>
    </linearGradient>
    <linearGradient id="${id}gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#C89B26"/>
    </linearGradient>
    <radialGradient id="${id}under"><stop offset="0" stop-color="${c.glow || '#fff'}" stop-opacity=".75"/><stop offset="1" stop-color="${c.glow || '#fff'}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  ${o.flat ? '' : `<ellipse cx="100" cy="160" rx="66" ry="8" fill="#000" opacity=".13"/>`}

  <!-- колёса -->
  <g>
    <circle cx="48" cy="138" r="16" fill="${c.wheel}"/><circle cx="48" cy="138" r="6" fill="#8B8B8B"/>
    <circle cx="100" cy="141" r="16" fill="${c.wheel}"/><circle cx="100" cy="141" r="6" fill="#8B8B8B"/>
    <circle cx="152" cy="138" r="16" fill="${c.wheel}"/><circle cx="152" cy="138" r="6" fill="#8B8B8B"/>
  </g>

  <!-- лидар -->
  <rect x="90" y="30" width="20" height="22" rx="6" fill="${c.wheel}"/>
  <ellipse cx="100" cy="31" rx="11" ry="5" fill="#4A4A4A"/>
  <circle cx="100" cy="31" r="3" fill="#FF4B3E"/>

  <!-- корпус -->
  <rect x="26" y="70" width="148" height="66" rx="22" fill="${c.body}"/>
  <rect x="26" y="70" width="148" height="66" rx="22" fill="url(#${id}sheen)"/>

  <!-- крышка -->
  <rect x="22" y="46" width="156" height="36" rx="17" fill="url(#${id}lid)"/>
  <rect x="34" y="55" width="132" height="4" rx="2" fill="#000" opacity=".08"/>

  <!-- панель лица -->
  <rect x="56" y="84" width="88" height="40" rx="16" fill="${c.glass}"/>
  ${eyesPath(eyes, c)}

  <!-- номерной знак -->
  ${plate ? `<rect x="72" y="126" width="56" height="13" rx="4" fill="#F2F0EC"/>
    <text x="100" y="136" font-size="10" font-weight="700" text-anchor="middle" fill="#2B2A28"
      font-family="ui-monospace,Menlo,monospace" letter-spacing=".5">${plate}</text>` : ''}

  ${accessory(skin, id)}
</svg>`;
}

/* Маленький ровер для маркера на карте */
function roverPin(skin) {
  const c = SKIN_ART[skin] || SKIN_ART.classic;
  return `<svg viewBox="0 0 60 60" width="40" height="40" aria-hidden="true">
    <circle cx="30" cy="30" r="17" fill="${c.body}"/>
    <rect x="15" y="20" width="30" height="9" rx="4" fill="${c.lid}"/>
    <rect x="21" y="31" width="18" height="11" rx="5" fill="${c.glass}"/>
    <rect x="24" y="34" width="4" height="6" rx="2" fill="${c.eye}"/>
    <rect x="32" y="34" width="4" height="6" rx="2" fill="${c.eye}"/>
    <rect x="27" y="12" width="6" height="7" rx="2" fill="${c.wheel}"/>
  </svg>`;
}

/* ============================================================
   Кадры «из глаз ровера» — плоские векторные сцены 4:3
   ============================================================ */
const EYE_SCENES = [
  {
    cap: 'Двор на Льва Толстого. Голуби не уступили дорогу.',
    svg: `<rect width="320" height="240" fill="#BFD8E8"/>
      <rect y="150" width="320" height="90" fill="#9AA0A6"/>
      <rect y="150" width="320" height="6" fill="#C9CDD2"/>
      <rect x="20" y="40" width="70" height="112" fill="#D9CFC2"/><rect x="100" y="20" width="60" height="132" fill="#C7BCAE"/>
      <rect x="170" y="55" width="80" height="97" fill="#E0D7CB"/><rect x="258" y="35" width="50" height="117" fill="#CDC2B4"/>
      <g fill="#8E9AA5"><rect x="30" y="55" width="14" height="18"/><rect x="58" y="55" width="14" height="18"/><rect x="30" y="88" width="14" height="18"/><rect x="58" y="88" width="14" height="18"/>
      <rect x="112" y="40" width="14" height="18"/><rect x="136" y="40" width="14" height="18"/><rect x="112" y="75" width="14" height="18"/><rect x="136" y="75" width="14" height="18"/>
      <rect x="185" y="72" width="16" height="20"/><rect x="215" y="72" width="16" height="20"/><rect x="185" y="105" width="16" height="20"/><rect x="215" y="105" width="16" height="20"/></g>
      <g fill="#4A4F55"><ellipse cx="90" cy="196" rx="15" ry="9"/><circle cx="102" cy="186" r="7"/><ellipse cx="150" cy="212" rx="17" ry="10"/><circle cx="164" cy="201" r="8"/><ellipse cx="228" cy="190" rx="13" ry="8"/><circle cx="238" cy="182" r="6"/></g>
      <g fill="#F5A623"><path d="M108 186l6 3-6 3z"/><path d="M171 201l6 3-6 3z"/><path d="M243 182l5 3-5 3z"/></g>`
  },
  {
    cap: 'Пешеходный переход. Ждал зелёного 41 секунду.',
    svg: `<rect width="320" height="240" fill="#D7E3EC"/>
      <rect y="130" width="320" height="110" fill="#5C6169"/>
      <g fill="#EFEFEF"><rect x="10" y="165" width="42" height="14"/><rect x="72" y="165" width="42" height="14"/><rect x="134" y="165" width="42" height="14"/><rect x="196" y="165" width="42" height="14"/><rect x="258" y="165" width="42" height="14"/>
      <rect x="0" y="205" width="46" height="16"/><rect x="66" y="205" width="46" height="16"/><rect x="132" y="205" width="46" height="16"/><rect x="198" y="205" width="46" height="16"/><rect x="264" y="205" width="46" height="16"/></g>
      <rect y="112" width="320" height="18" fill="#8B929B"/>
      <rect x="30" y="30" width="110" height="82" fill="#CBD3DA"/><rect x="160" y="14" width="130" height="98" fill="#B9C2CB"/>
      <rect x="248" y="34" width="10" height="70" fill="#3A3E44"/><rect x="238" y="16" width="30" height="24" rx="6" fill="#26292E"/>
      <circle cx="253" cy="23" r="4" fill="#3A3E44"/><circle cx="253" cy="33" r="4.5" fill="#4CD964"/>
      <rect x="50" y="118" width="46" height="28" rx="7" fill="#FFDB4D"/><rect x="56" y="112" width="34" height="10" rx="4" fill="#fff"/>
      <circle cx="62" cy="148" r="6" fill="#26292E"/><circle cx="86" cy="148" r="6" fill="#26292E"/>`
  },
  {
    cap: 'Снег. Колёса держат, настроение — нет.',
    svg: `<rect width="320" height="240" fill="#E6EEF5"/>
      <rect y="150" width="320" height="90" fill="#F4F8FB"/>
      <path d="M0 150q80-16 160 0t160 0v14H0z" fill="#fff"/>
      <rect x="18" y="52" width="66" height="98" fill="#C3CEDA"/><rect x="96" y="34" width="72" height="116" fill="#AFBCCA"/><rect x="180" y="62" width="60" height="88" fill="#C8D3DE"/><rect x="252" y="42" width="56" height="108" fill="#B6C3D1"/>
      <g fill="#EAF2F8"><rect x="18" y="48" width="66" height="7"/><rect x="96" y="30" width="72" height="7"/><rect x="180" y="58" width="60" height="7"/><rect x="252" y="38" width="56" height="7"/></g>
      <g fill="#8FA3B5" opacity=".8"><rect x="30" y="70" width="12" height="16"/><rect x="56" y="70" width="12" height="16"/><rect x="110" y="55" width="12" height="16"/><rect x="138" y="55" width="12" height="16"/><rect x="194" y="82" width="12" height="16"/><rect x="266" y="62" width="12" height="16"/></g>
      <g fill="#fff"><circle cx="42" cy="36" r="4"/><circle cx="126" cy="96" r="3"/><circle cx="214" cy="40" r="4.5"/><circle cx="286" cy="120" r="3.5"/><circle cx="76" cy="132" r="3"/><circle cx="168" cy="22" r="3"/><circle cx="250" cy="170" r="4"/><circle cx="104" cy="190" r="3"/></g>`
  },
  {
    cap: 'Ночная смена. Город выглядит лучше без людей.',
    svg: `<rect width="320" height="240" fill="#10162B"/>
      <rect y="160" width="320" height="80" fill="#1B2440"/>
      <g fill="#0B1122"><rect x="12" y="46" width="60" height="114"/><rect x="84" y="24" width="70" height="136"/><rect x="166" y="60" width="56" height="100"/><rect x="234" y="34" width="72" height="126"/></g>
      <g fill="#FFD75E"><rect x="24" y="62" width="10" height="13"/><rect x="48" y="62" width="10" height="13"/><rect x="24" y="92" width="10" height="13"/><rect x="96" y="40" width="10" height="13"/><rect x="128" y="40" width="10" height="13"/><rect x="96" y="76" width="10" height="13"/><rect x="128" y="112" width="10" height="13"/><rect x="178" y="80" width="10" height="13"/><rect x="202" y="118" width="10" height="13"/><rect x="248" y="52" width="10" height="13"/><rect x="278" y="52" width="10" height="13"/><rect x="248" y="96" width="10" height="13"/><rect x="278" y="130" width="10" height="13"/></g>
      <ellipse cx="160" cy="205" rx="120" ry="34" fill="#FFE07A" opacity=".13"/>
      <rect x="150" y="150" width="6" height="14" fill="#2A3556"/>
      <g stroke="#3D4A72" stroke-width="2"><path d="M0 186h320M0 214h320"/></g>
      <circle cx="268" cy="42" r="13" fill="#F5F0D8" opacity=".9"/>`
  },
  {
    cap: 'Эта собака идёт за мной третий квартал.',
    svg: `<rect width="320" height="240" fill="#CFE0D2"/>
      <rect y="156" width="320" height="84" fill="#A9B8A6"/>
      <path d="M0 156h320v10H0z" fill="#C2CFBE"/>
      <g fill="#6E8C6A"><circle cx="46" cy="96" r="38"/><circle cx="92" cy="112" r="28"/><circle cx="262" cy="86" r="42"/><circle cx="216" cy="110" r="26"/></g>
      <g fill="#7B5B3A"><rect x="42" y="128" width="9" height="34"/><rect x="258" y="122" width="10" height="40"/><rect x="212" y="132" width="8" height="30"/></g>
      <rect x="120" y="40" width="80" height="116" fill="#D8D2C6"/><g fill="#93A0A8"><rect x="132" y="58" width="16" height="20"/><rect x="164" y="58" width="16" height="20"/><rect x="132" y="96" width="16" height="20"/><rect x="164" y="96" width="16" height="20"/></g>
      <g transform="translate(150 178)"><ellipse rx="30" ry="17" fill="#C99A5B"/><circle cx="28" cy="-12" r="14" fill="#C99A5B"/><path d="M20 -22q-6-14 4-12" stroke="#A97F45" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="33" cy="-14" r="2.6" fill="#2B2118"/><circle cx="40" cy="-9" r="3" fill="#2B2118"/><path d="M-28 4q-12 6-10 14" stroke="#C99A5B" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="-18" y="14" width="7" height="14" rx="3" fill="#A97F45"/><rect x="10" y="14" width="7" height="14" rx="3" fill="#A97F45"/></g>`
  },
  {
    cap: 'Очередь на зарядку. Обсуждаем, у кого тяжелее заказ.',
    svg: `<rect width="320" height="240" fill="#E9E4DA"/>
      <rect y="140" width="320" height="100" fill="#BDB6AA"/>
      <rect y="140" width="320" height="8" fill="#D2CCC1"/>
      <rect x="0" y="20" width="320" height="120" fill="#F1ECE3"/>
      <rect x="20" y="40" width="280" height="8" rx="4" fill="#FFDB4D"/>
      <g fill="#CFC7B9"><rect x="30" y="64" width="60" height="70" rx="6"/><rect x="118" y="64" width="60" height="70" rx="6"/><rect x="206" y="64" width="60" height="70" rx="6"/></g>
      <g transform="translate(60 168) scale(.55)">
        <ellipse cy="46" rx="52" ry="7" fill="#000" opacity=".12"/><circle cx="-30" cy="30" r="14" fill="#232221"/><circle cx="30" cy="30" r="14" fill="#232221"/>
        <rect x="-52" y="-18" width="104" height="52" rx="18" fill="#2E2D2B"/><rect x="-56" y="-40" width="112" height="28" rx="13" fill="#fff"/>
        <rect x="-26" y="-6" width="52" height="30" rx="12" fill="#141315"/><rect x="-16" y="1" width="11" height="15" rx="5" fill="#fff"/><rect x="5" y="1" width="11" height="15" rx="5" fill="#fff"/>
      </g>
      <g transform="translate(160 176) scale(.6)">
        <ellipse cy="46" rx="52" ry="7" fill="#000" opacity=".12"/><circle cx="-30" cy="30" r="14" fill="#181716"/><circle cx="30" cy="30" r="14" fill="#181716"/>
        <rect x="-52" y="-18" width="104" height="52" rx="18" fill="#21201F"/><rect x="-56" y="-40" width="112" height="28" rx="13" fill="#FFDB4D"/>
        <rect x="-26" y="-6" width="52" height="30" rx="12" fill="#141315"/><rect x="-16" y="1" width="11" height="15" rx="5" fill="#FFE873"/><rect x="5" y="1" width="11" height="15" rx="5" fill="#FFE873"/>
      </g>
      <g transform="translate(262 170) scale(.5)">
        <ellipse cy="46" rx="52" ry="7" fill="#000" opacity=".12"/><circle cx="-30" cy="30" r="14" fill="#26313D"/><circle cx="30" cy="30" r="14" fill="#26313D"/>
        <rect x="-52" y="-18" width="104" height="52" rx="18" fill="#3C4B5E"/><rect x="-56" y="-40" width="112" height="28" rx="13" fill="#EAF4FF"/>
        <rect x="-26" y="-6" width="52" height="30" rx="12" fill="#141a22"/><rect x="-16" y="1" width="11" height="15" rx="5" fill="#D8F1FF"/><rect x="5" y="1" width="11" height="15" rx="5" fill="#D8F1FF"/>
      </g>`
  }
];

/* Кадр с HUD «ровер-кам» */
function eyeShotSVG(i, stamp) {
  const s = EYE_SCENES[i % EYE_SCENES.length];
  return `<svg viewBox="0 0 320 240" class="shot-svg" preserveAspectRatio="xMidYMid slice">
    ${s.svg}
    <g fill="none" stroke="#fff" stroke-width="2" opacity=".55">
      <path d="M14 14h20M14 14v20M306 14h-20M306 14v20M14 226h20M14 226v-20M306 226h-20M306 226v-20"/>
      <circle cx="160" cy="120" r="14" stroke-dasharray="4 6"/>
    </g>
    <circle cx="26" cy="222" r="4" fill="#FF3B30"/>
    <text x="36" y="226" font-size="11" fill="#fff" font-family="ui-monospace,Menlo,monospace" opacity=".9">REC</text>
    <text x="306" y="226" font-size="11" fill="#fff" text-anchor="end" font-family="ui-monospace,Menlo,monospace" opacity=".9">${stamp}</text>
    <rect width="320" height="240" fill="url(#vig)"/>
    <defs><radialGradient id="vig"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>
  </svg>`;
}
