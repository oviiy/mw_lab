// Renders the app icon (an ivory die on red lacquer with a gold rim) to PNGs without dependencies.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function png(size, draw) {
  const SS = 4; // supersampling
  const px = new Float64Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++) {
          const c = draw((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size);
          r += c[0]; g += c[1]; b += c[2]; a += c[3];
        }
      const n = SS * SS, i = (y * size + x) * 4;
      px[i] = r / n; px[i + 1] = g / n; px[i + 2] = b / n; px[i + 3] = a / n;
    }
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size * 4; x++) raw[y * (size * 4 + 1) + 1 + x] = Math.round(Math.max(0, Math.min(255, px[y * size * 4 + x])));
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const T = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
function crc32(buf) { let c = -1; for (const b of buf) c = T[(c ^ b) & 255] ^ (c >>> 8); return c ^ -1; }

const rr = (x, y, cx, cy, hw, hh, r) => {
  const dx = Math.max(Math.abs(x - cx) - hw + r, 0), dy = Math.max(Math.abs(y - cy) - hh + r, 0);
  return Math.hypot(dx, dy) - r;
};

function icon(maskable) {
  return (x, y) => {
    const pad = maskable ? 0 : 0.02;
    const bg = rr(x, y, 0.5, 0.5, 0.5 - pad, 0.5 - pad, maskable ? 0 : 0.2);
    if (bg > 0) return [0, 0, 0, 0];
    // lacquer with a soft light
    const l = 1 - Math.hypot(x - 0.4, y - 0.35) * 0.9;
    let col = [120 + 70 * l, 18 + 12 * l, 12 + 8 * l, 255];
    if (!maskable && bg > -0.035) col = [226, 177, 60, 255]; // gold rim
    const s = maskable ? 0.27 : 0.3;
    const d = rr(x, y, 0.5, 0.52, s, s, 0.07);
    if (d < 0) {
      const shade = 1 - Math.max(0, (x - 0.3) + (y - 0.3)) * 0.18;
      col = [244 * shade, 230 * shade, 200 * shade, 255];
      const pips = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      for (const [px, py] of pips) if (Math.hypot(x - (0.5 + px * s * 0.52), y - (0.52 + py * s * 0.52)) < s * 0.15) col = [30, 18, 12, 255];
      if (Math.hypot(x - 0.5, y - 0.52) < s * 0.2) col = [194, 39, 45, 255];
    } else if (rr(x, y, 0.515, 0.55, s, s, 0.07) < 0) col = col.map((c, i) => (i < 3 ? c * 0.55 : c));
    return col;
  };
}

writeFileSync('public/icon-192.png', png(192, icon(false)));
writeFileSync('public/icon-512.png', png(512, icon(false)));
writeFileSync('public/icon-maskable-512.png', png(512, icon(true)));
writeFileSync('public/apple-touch-icon.png', png(180, icon(true)));
console.log('icons written');
