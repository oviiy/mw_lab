// Small colour toolkit — everything works on '#rrggbb' strings.
export function hexToRgb(h) {
  if (h[0] === '#') h = h.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
export function shade(hex, k) { // k in [-1,1]: negative darkens toward black, positive lightens toward white
  const [r, g, b] = hexToRgb(hex);
  if (k < 0) return rgbToHex(r * (1 + k), g * (1 + k), b * (1 + k));
  return rgbToHex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k);
}
export function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}
export function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6;
  }
  return [h, s, l];
}
export function hslToHex(h, s, l) {
  const f = (n) => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))); };
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}
export function jitter(hex, rng, hAmt = 0.02, sAmt = 0.06, lAmt = 0.06) {
  const [r, g, b] = hexToRgb(hex), [h, s, l] = rgbToHsl(r, g, b);
  return hslToHex((h + rng.range(-hAmt, hAmt) + 1) % 1, Math.max(0, Math.min(1, s + rng.range(-sAmt, sAmt))), Math.max(0.05, Math.min(0.95, l + rng.range(-lAmt, lAmt))));
}
