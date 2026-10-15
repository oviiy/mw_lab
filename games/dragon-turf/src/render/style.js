// Shared art-direction constants: heavy ink outlines, warm paper highlights.
export const INK = '#1a1020';
export const INK_SOFT = 'rgba(26,16,32,0.55)';
export const OUTLINE = 1.6;
export const SUN = { x: 0.62, y: 0.78 };        // shadow direction (screen space), light comes from the NW
export const NEON = ['#ff3d6e', '#37e6ff', '#ffd23a', '#7dff6a', '#c26bff', '#ff8a2a'];

export function makeCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c;
}

export function rr(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// Fill + ink-stroke a rounded rect in one go.
export function inkRect(g, x, y, w, h, fill, r = 2, lw = OUTLINE) {
  rr(g, x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); }
  g.lineWidth = lw; g.strokeStyle = INK; g.stroke();
}
export function inkCircle(g, x, y, r, fill, lw = OUTLINE) {
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } g.lineWidth = lw; g.strokeStyle = INK; g.stroke();
}
export function vgrad(g, y0, y1, c0, c1) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; }
export function hgrad(g, x0, x1, c0, c1) { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; }

// Deterministic hash → [0,1)
export function hash2(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177; h = h ^ (h >>> 16);
  return ((h >>> 0) % 100000) / 100000;
}

// Shared 128px value-noise tile used to give baked surfaces some material grain.
let GRAIN = null;
export function grain() {
  if (GRAIN) return GRAIN;
  const S = 128, cv = makeCanvas(S, S), g = cv.getContext('2d'), img = g.createImageData(S, S); let seed = 1234567;
  // dark and light specks as alpha, so it can be laid on with 'source-atop' without greying anything
  for (let i = 0; i < S * S; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; const r = ((seed >> 8) % 1000) / 1000, dark = r < 0.5; const v = dark ? 0 : 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = Math.round(Math.abs(r - 0.5) * 2 * (dark ? 70 : 40)); }
  g.putImageData(img, 0, 0); GRAIN = cv; return cv;
}
