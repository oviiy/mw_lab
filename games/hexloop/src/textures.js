import * as THREE from 'three';

function canvas(w, h = w) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function hexPath(ctx, cx, cy, rad) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (90 + 60 * i); ctx.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a)); }
  ctx.closePath();
}
const tex = (c, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

// Tile top albedo: brushed dark slate with a recessed inner rim. UVs map shape coords [-1,1] → [0,1].
export function tileTexture() {
  const S = 256, [c, x] = canvas(S), h = S / 2;
  const g = x.createRadialGradient(h, h * 0.8, 10, h, h, h);
  g.addColorStop(0, '#2a3348'); g.addColorStop(1, '#151a26');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  const img = x.getImageData(0, 0, S, S), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n * 1.2; }
  x.putImageData(img, 0, 0);
  x.lineWidth = 3; x.strokeStyle = 'rgba(70,90,130,0.55)'; hexPath(x, h, h, h * 0.8); x.stroke();
  x.lineWidth = 1.5; x.strokeStyle = 'rgba(0,0,0,0.5)'; hexPath(x, h, h, h * 0.76); x.stroke();
  return tex(c);
}
// Emissive mask: bright rim + soft inner fill, so glowing tiles read as lit panels.
export function tileEmissive() {
  const S = 256, [c, x] = canvas(S), h = S / 2;
  x.fillStyle = '#000'; x.fillRect(0, 0, S, S);
  const g = x.createRadialGradient(h, h, h * 0.1, h, h, h * 0.85);
  g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0.42)');
  hexPath(x, h, h, h * 0.84); x.fillStyle = g; x.fill();
  x.shadowColor = '#fff'; x.shadowBlur = 14; x.lineWidth = 7; x.strokeStyle = '#fff'; hexPath(x, h, h, h * 0.84); x.stroke();
  return tex(c);
}
// Diagonal hazard stripes (alpha), tiled across danger tiles.
export function stripeTexture() {
  const S = 128, [c, x] = canvas(S);
  x.clearRect(0, 0, S, S);
  x.fillStyle = '#fff';
  for (let i = -S; i < S * 2; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 9, 0); x.lineTo(i + 9 - S, S); x.lineTo(i - S, S); x.closePath(); x.fill(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// Hex-shaped alpha mask used for overlays (hazard, preview).
export function hexMask(fill = true, line = 0) {
  const S = 256, [c, x] = canvas(S), h = S / 2;
  hexPath(x, h, h, h * 0.86);
  if (fill) { x.fillStyle = '#fff'; x.fill(); }
  if (line) { x.lineWidth = line; x.strokeStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 10; x.stroke(); }
  return tex(c);
}
export function glowTexture() {
  const S = 128, [c, x] = canvas(S), h = S / 2;
  const g = x.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  return tex(c);
}
// Big soft floor under the board: cool radial glow + faint concentric hex rings.
export function floorTexture() {
  const S = 1024, [c, x] = canvas(S), h = S / 2;
  const g = x.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0, 'rgba(40,70,120,0.55)'); g.addColorStop(0.45, 'rgba(18,28,52,0.35)'); g.addColorStop(1, 'rgba(7,9,15,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  x.strokeStyle = 'rgba(80,120,190,0.045)'; x.lineWidth = 2;
  for (let r = 60; r < h; r += 60) { hexPath(x, h, h, r); x.stroke(); }
  return tex(c);
}
export function textTexture(text, { size = 64, color = '#fff', font = '800 52px ui-rounded, system-ui, sans-serif' } = {}) {
  const [c, x] = canvas(size * 2, size);
  x.font = font; x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.shadowColor = color; x.shadowBlur = 8; x.fillText(text, size, size / 2 + 2);
  return tex(c);
}
