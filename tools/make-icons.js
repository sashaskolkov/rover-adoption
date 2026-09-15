/* Генерирует PNG-иконки приложения без внешних зависимостей.
   Запуск: node tools/make-icons.js */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const SS = 3; // суперсэмплинг для сглаживания

function canvas(w, h) { return { w, h, px: new Uint8ClampedArray(w * h * 4) }; }
function set(c, x, y, [r, g, b, a = 255]) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4, sa = a / 255, da = c.px[i + 3] / 255;
  const oa = sa + da * (1 - sa);
  c.px[i]     = (r * sa + c.px[i]     * da * (1 - sa)) / (oa || 1);
  c.px[i + 1] = (g * sa + c.px[i + 1] * da * (1 - sa)) / (oa || 1);
  c.px[i + 2] = (b * sa + c.px[i + 2] * da * (1 - sa)) / (oa || 1);
  c.px[i + 3] = oa * 255;
}
function rrect(c, x, y, w, h, r, col) {
  for (let py = Math.floor(y); py < y + h; py++)
    for (let px = Math.floor(x); px < x + w; px++) {
      const dx = Math.max(x + r - px - .5, 0, px + .5 - (x + w - r));
      const dy = Math.max(y + r - py - .5, 0, py + .5 - (y + h - r));
      if (dx * dx + dy * dy <= r * r) set(c, px, py, col);
    }
}
function circle(c, cx, cy, r, col) {
  for (let py = Math.floor(cy - r); py <= cy + r; py++)
    for (let px = Math.floor(cx - r); px <= cx + r; px++)
      if ((px + .5 - cx) ** 2 + (py + .5 - cy) ** 2 <= r * r) set(c, px, py, col);
}
function downsample(c, f) {
  const o = canvas(c.w / f, c.h / f);
  for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
    let s = [0, 0, 0, 0];
    for (let j = 0; j < f; j++) for (let i = 0; i < f; i++) {
      const k = ((y * f + j) * c.w + (x * f + i)) * 4;
      s[0] += c.px[k]; s[1] += c.px[k + 1]; s[2] += c.px[k + 2]; s[3] += c.px[k + 3];
    }
    const k = (y * o.w + x) * 4, n = f * f;
    o.px[k] = s[0] / n; o.px[k + 1] = s[1] / n; o.px[k + 2] = s[2] / n; o.px[k + 3] = s[3] / n;
  }
  return o;
}

/* --- PNG --- */
const CRC = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xFFFFFFFF; for (const b of buf) c = CRC[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(c) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.w, 0); ihdr.writeUInt32BE(c.h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((c.w * 4 + 1) * c.h);
  for (let y = 0; y < c.h; y++) {
    raw[y * (c.w * 4 + 1)] = 0;
    Buffer.from(c.px.buffer, y * c.w * 4, c.w * 4).copy(raw, y * (c.w * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
  ]);
}

/* --- рисуем иконку --- */
function icon(size) {
  const S = size * SS, c = canvas(S, S), u = S / 64;
  const Y = [255, 219, 77], D = [46, 45, 43], K = [20, 19, 21], W = [255, 255, 255];
  rrect(c, 0, 0, S, S, 14 * u, Y);
  circle(c, 18 * u, 49 * u, 5.2 * u, [33, 32, 31]);
  circle(c, 46 * u, 49 * u, 5.2 * u, [33, 32, 31]);
  rrect(c, 9 * u, 26 * u, 46 * u, 21 * u, 7 * u, D);
  rrect(c, 7 * u, 17 * u, 50 * u, 12 * u, 5.5 * u, W);
  rrect(c, 28 * u, 7 * u, 8 * u, 9 * u, 2.5 * u, D);
  rrect(c, 21 * u, 31 * u, 22 * u, 12 * u, 5 * u, K);
  rrect(c, 25 * u, 34 * u, 5 * u, 7 * u, 2.5 * u, W);
  rrect(c, 34 * u, 34 * u, 5 * u, 7 * u, 2.5 * u, W);
  return png(downsample(c, SS));
}

const out = path.join(__dirname, '..', 'assets');
[[180, 'icon-180.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]
  .forEach(([s, n]) => { fs.writeFileSync(path.join(out, n), icon(s)); console.log('✓', n); });
