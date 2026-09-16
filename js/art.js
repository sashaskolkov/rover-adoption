/* ============================================================
   art.js — векторный ровер и его скины.
   Всё рисуется на месте, без картинок: скин = набор параметров.
   ============================================================ */

let _uid = 0;
const uid = () => 'g' + (++_uid);

/* Палитры скинов.
   Ровер нарисован по настоящему: спереди — чёрный сенсорный блок
   с вертикальными фарами, сзади — грузовой контейнер, сверху штанга
   с красным флажком. Скин перекрашивает контейнер и флаг, чёрный
   блок с датчиками остаётся — по нему ровер и узнаётся.

   lid   — контейнер, lid2 — его тень
   body  — сенсорный блок
   glass — передняя панель с фарами
   eye   — свет фар
   flag  — флажок на штанге */
const SKIN_ART = {
  // чистый белый сливался с белым кружком маркера — держим светло-серый
  classic: { lid: '#DEDBD4', lid2: '#B9B5AC', body: '#1C1B1D', glass: '#0E0E10', eye: '#EAF4FF', wheel: '#1A1A1A', flag: '#F5372B' },
  courier: { lid: '#FFDB4D', lid2: '#EDB800', body: '#1C1B1D', glass: '#0E0E10', eye: '#FFF4C2', wheel: '#181716', flag: '#F5372B' },
  neon:    { lid: '#241B4D', lid2: '#140F2E', body: '#0E0C1A', glass: '#07070F', eye: '#5BF3FF', wheel: '#0A0A16', flag: '#B14BFF', glow: '#B14BFF' },
  winter:  { lid: '#CFE2F5', lid2: '#A5C2DE', body: '#232A33', glass: '#10151C', eye: '#D8F1FF', wheel: '#1E242C', flag: '#E8453C' },
  tropic:  { lid: '#19C69B', lid2: '#0E8F6F', body: '#16292A', glass: '#0A1516', eye: '#FFF3B0', wheel: '#14282A', flag: '#FF8FA3' },
  cosmo:   { lid: '#C4CCDA', lid2: '#9AA5B8', body: '#2B303A', glass: '#0F1218', eye: '#9FE6FF', wheel: '#232830', flag: '#4C7DFF' },
  pixel:   { lid: '#FFD34D', lid2: '#E09400', body: '#241E38', glass: '#100E1C', eye: '#7CFF6B', wheel: '#1D1930', flag: '#6BE86B' },
  royal:   { lid: '#F7D774', lid2: '#C08F14', body: '#241E12', glass: '#14110A', eye: '#FFF0BE', wheel: '#1C1810', flag: '#F7D774' },
  coffee:  { lid: '#8A5A3B', lid2: '#5E3B25', body: '#241811', glass: '#120C08', eye: '#F2D9B8', wheel: '#1E140E', flag: '#C08552' },
  rescue:  { lid: '#FF5436', lid2: '#D13519', body: '#1F1E1E', glass: '#0F0F0F', eye: '#FFE9E4', wheel: '#161515', flag: '#FFD54D' }
};

/* Передняя панель: у настоящего ровера нет глаз — две вертикальные
   светодиодные фары и камера между ними. Параметр kind лишь слегка
   меняет их «настроение». */
function facePath(kind, c) {
  const e = c.eye;
  const dim = kind === 'sleepy' ? .45 : 1;
  const h = kind === 'happy' ? 30 : 26;
  const y = 92 + (26 - h) / 2;
  return `
    <rect x="58" y="${y}" width="9" height="${h}" rx="4.5" fill="${e}" opacity="${dim}"/>
    <rect x="58" y="${y}" width="9" height="${h}" rx="4.5" fill="#fff" opacity="${.35 * dim}"/>
    <rect x="83" y="${y}" width="9" height="${h}" rx="4.5" fill="${e}" opacity="${dim}"/>
    <rect x="83" y="${y}" width="9" height="${h}" rx="4.5" fill="#fff" opacity="${.35 * dim}"/>
    <circle cx="75" cy="105" r="5.2" fill="#3A3A3E"/>
    <circle cx="75" cy="105" r="2.4" fill="#0B0B0D"/>
    <circle cx="73.6" cy="103.6" r="1" fill="#8D8D95"/>
    <circle cx="61" cy="122" r="2.6" fill="#33333A"/>
    <circle cx="89" cy="122" r="2.6" fill="#33333A"/>`;
}

/* Аксессуары. Контейнер занимает x 92…180 / y 56…132,
   сенсорный блок — x 44…104 / y 62…132, лидар сидит на нём. */
function accessory(skin, id) {
  switch (skin) {
    case 'winter': return `
      <path d="M50 58c0-15 10-24 24-24s24 9 24 24z" fill="#E8453C"/>
      <rect x="44" y="52" width="60" height="12" rx="6" fill="#F4F1EC"/>
      <circle cx="74" cy="30" r="9" fill="#F4F1EC"/>`;
    case 'tropic': return `
      <g transform="translate(150 46)">
        <circle r="6" fill="#FF5E7A"/><circle cx="9" cy="-5" r="6" fill="#FF8FA3"/>
        <circle cx="9" cy="6" r="6" fill="#FF8FA3"/><circle cx="-7" cy="7" r="6" fill="#FF8FA3"/>
        <circle cx="-7" cy="-7" r="6" fill="#FF8FA3"/><circle r="3.6" fill="#FFD84D"/>
      </g>
      <rect x="48" y="88" width="52" height="11" rx="5.5" fill="#141315"/>
      <rect x="51" y="90" width="20" height="7" rx="3" fill="#33333B"/>
      <rect x="77" y="90" width="20" height="7" rx="3" fill="#33333B"/>`;
    case 'cosmo': return `
      <path d="M40 66a34 30 0 0 1 68 0z" fill="#BFE6FF" opacity=".4"/>
      <path d="M40 66a34 30 0 0 1 68 0" fill="none" stroke="#fff" stroke-width="3"/>
      <path d="M54 50q9-12 22-13" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".75"/>`;
    case 'royal': return `
      <path d="M98 54 103 30l12 13 11-18 11 18 12-13 5 24z" fill="url(#${id}gold)"/>
      <rect x="96" y="52" width="82" height="10" rx="5" fill="url(#${id}gold)"/>
      <circle cx="115" cy="44" r="3.4" fill="#E8453C"/><circle cx="148" cy="44" r="3.4" fill="#3C7FE8"/>`;
    case 'coffee': return `
      <g transform="translate(136 30)">
        <path d="M-14 4h28v14a7 7 0 0 1-7 7h-14a7 7 0 0 1-7-7z" fill="#fff"/>
        <rect x="-17" y="-2" width="34" height="7" rx="3" fill="#E7E2DA"/>
        <path d="M-5 -8q5-5 0-11M5 -8q5-5 0-11" stroke="#CBBFB2" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      </g>`;
    case 'rescue': return `
      <ellipse cx="136" cy="40" rx="24" ry="13" fill="#FF3B2F" opacity=".2"/>
      <rect x="122" y="32" width="28" height="14" rx="5" fill="#FF3B2F"/>
      <rect x="118" y="44" width="36" height="7" rx="3.5" fill="#1B1B1B"/>`;
    case 'pixel': return `
      <g fill="#6BE86B"><rect x="112" y="38" width="9" height="9"/><rect x="121" y="29" width="9" height="9"/>
      <rect x="130" y="38" width="9" height="9"/><rect x="139" y="29" width="9" height="9"/>
      <rect x="148" y="38" width="9" height="9"/><rect x="104" y="47" width="62" height="9"/></g>`;
    case 'neon': return `
      <rect x="96" y="120" width="80" height="5" rx="2.5" fill="#B14BFF"/>
      <ellipse cx="104" cy="152" rx="76" ry="13" fill="url(#${id}under)"/>`;
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
  const face = o.eyes || (skin === 'tropic' ? 'sleepy' : 'normal');
  const plate = o.plate || '';
  const w = o.size || 200;

  return `<svg viewBox="0 0 200 172" width="${w}" height="${w * 0.86}" class="rover-svg" aria-hidden="true">
  <defs>
    <linearGradient id="${id}lid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.lid}"/><stop offset="1" stop-color="${c.lid2}"/>
    </linearGradient>
    <linearGradient id="${id}blk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.body}"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>
    </linearGradient>
    <linearGradient id="${id}gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#C89B26"/>
    </linearGradient>
    <radialGradient id="${id}under"><stop offset="0" stop-color="${c.glow || '#fff'}" stop-opacity=".75"/><stop offset="1" stop-color="${c.glow || '#fff'}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  ${o.flat ? '' : `<ellipse cx="102" cy="158" rx="68" ry="8" fill="#000" opacity=".13"/>`}

  <!-- штанга с флажком: самая узнаваемая деталь силуэта -->
  <rect x="61.4" y="18" width="2.2" height="66" rx="1.1" fill="#26262A"/>
  <path d="M63 19h26v17H63z" fill="${c.flag || '#F5372B'}"/>
  <path d="M63 19h26v5H63z" fill="#fff" opacity=".22"/>

  <!-- колёса: три пары, вынесены за габарит корпуса -->
  <g>
    <circle cx="58" cy="136" r="17" fill="${c.wheel}"/><circle cx="58" cy="136" r="7" fill="#57575C"/><circle cx="58" cy="136" r="3" fill="#2A2A2E"/>
    <circle cx="106" cy="139" r="17" fill="${c.wheel}"/><circle cx="106" cy="139" r="7" fill="#57575C"/><circle cx="106" cy="139" r="3" fill="#2A2A2E"/>
    <circle cx="152" cy="139" r="17" fill="${c.wheel}"/><circle cx="152" cy="139" r="7" fill="#57575C"/><circle cx="152" cy="139" r="3" fill="#2A2A2E"/>
  </g>

  <!-- грузовой контейнер -->
  <rect x="92" y="56" width="88" height="76" rx="14" fill="url(#${id}lid)"/>
  <rect x="92" y="56" width="88" height="10" rx="5" fill="#000" opacity=".07"/>
  <rect x="94" y="118" width="84" height="4" rx="2" fill="${c.eye}" opacity=".5"/>
  ${plate ? `<text x="136" y="100" font-size="13" font-weight="800" text-anchor="middle"
      fill="#000" opacity=".5" font-family="Helvetica,Arial" letter-spacing="-.3">${plate}</text>`
    : `<circle cx="136" cy="96" r="12" fill="#F5372B" opacity=".92"/>
       <path d="M133 90h4.6c3.4 0 5.4 2 5.4 5s-2 5.2-5.4 5.2H136v2.4h-3z" fill="#fff"/>`}

  <!-- сенсорный блок -->
  <rect x="44" y="62" width="60" height="70" rx="15" fill="${c.body}"/>
  <rect x="44" y="62" width="60" height="70" rx="15" fill="url(#${id}sheen)"/>
  <rect x="50" y="86" width="48" height="44" rx="11" fill="${c.glass}"/>
  ${facePath(face, c)}

  <!-- лидар -->
  <rect x="62" y="44" width="22" height="20" rx="5" fill="#2B2B2F"/>
  <ellipse cx="73" cy="44" rx="11" ry="4.6" fill="#6E6E76"/>
  <ellipse cx="73" cy="43" rx="7" ry="2.8" fill="#9A9AA4"/>

  ${accessory(skin, id)}
</svg>`;
}

/* Маленький ровер для маркера на карте: важен силуэт — флажок,
   белый контейнер и чёрный нос читаются даже в 36 пикселях */
function roverPin(skin) {
  const c = SKIN_ART[skin] || SKIN_ART.classic;
  return `<svg viewBox="0 0 60 60" width="40" height="40" aria-hidden="true">
    <rect x="17.2" y="8" width="1.6" height="16" rx=".8" fill="#26262A"/>
    <path d="M18.5 8.5h9v6h-9z" fill="${c.flag || '#F5372B'}"/>
    <circle cx="20" cy="44" r="5.4" fill="${c.wheel}"/><circle cx="20" cy="44" r="2.1" fill="#5D5D63"/>
    <circle cx="40" cy="44" r="5.4" fill="${c.wheel}"/><circle cx="40" cy="44" r="2.1" fill="#5D5D63"/>
    <rect x="28" y="20" width="24" height="24" rx="5" fill="${c.lid}"
      stroke="rgba(0,0,0,.22)" stroke-width="1.2"/>
    <rect x="10" y="23" width="20" height="21" rx="5" fill="${c.body}"/>
    <rect x="13" y="30" width="14" height="13" rx="3.5" fill="${c.glass}"/>
    <rect x="15" y="32.5" width="3" height="8" rx="1.5" fill="${c.eye}"/>
    <rect x="22" y="32.5" width="3" height="8" rx="1.5" fill="${c.eye}"/>
    <rect x="16" y="17" width="8" height="7" rx="2" fill="#2B2B2F"/>
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
