// Paints one die face onto a canvas: material ground, drilled pips, seal for the mark.
// Used as a three.js texture and as a 2D image (fallback, die nets, previews).
import { MARKS } from '../../core/dice';
import type { Face, Material } from '../../core/types';

export const FACE_PX = 256;

const PALETTE: Record<Material, { ground: string; edge: string; grain: string; pip: string; pipHi: string }> = {
  wood: { ground: '#F1E3C2', edge: '#C9AE7E', grain: 'rgba(140,100,50,0.13)', pip: '#231510', pipHi: 'rgba(255,235,200,0.35)' },
  ivory: { ground: '#FBF4E3', edge: '#DCCDAA', grain: 'rgba(170,150,110,0.08)', pip: '#2A1A12', pipHi: 'rgba(255,255,255,0.5)' },
  ebony: { ground: '#2C1D16', edge: '#120A07', grain: 'rgba(120,80,50,0.25)', pip: '#F1E3C2', pipHi: 'rgba(0,0,0,0.4)' },
  lacquer: { ground: '#C9952E', edge: '#7A5212', grain: 'rgba(255,230,150,0.18)', pip: '#2A1407', pipHi: 'rgba(255,240,190,0.5)' },
};

const RED = '#C2272D';
const G = [0.27, 0.5, 0.73];
const P: Record<string, [number, number]> = {
  tl: [G[0], G[0]], tc: [G[1], G[0]], tr: [G[2], G[0]],
  ml: [G[0], G[1]], c: [G[1], G[1]], mr: [G[2], G[1]],
  bl: [G[0], G[2]], bc: [G[1], G[2]], br: [G[2], G[2]],
};
export const PIP_LAYOUT: Record<number, string[]> = {
  1: ['c'],
  2: ['tl', 'br'],
  3: ['tl', 'c', 'br'],
  4: ['tl', 'tr', 'bl', 'br'],
  5: ['tl', 'tr', 'c', 'bl', 'br'],
  6: ['tl', 'tr', 'ml', 'mr', 'bl', 'br'],
  7: ['tl', 'tr', 'ml', 'c', 'mr', 'bl', 'br'],
  8: ['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'],
  9: ['tl', 'tc', 'tr', 'ml', 'c', 'mr', 'bl', 'bc', 'br'],
};

const MARK_COLOR: Partial<Record<NonNullable<Face['mark']>, string>> = {
  jade: '#2F8A63',
  iron: '#4A5560',
  gold: '#B8862B',
  glass: '#3E8DB5',
  ink: '#1C1915',
  mirror: '#5B6E9A',
};

let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

export function paintFace(ctx: CanvasRenderingContext2D, face: Face, material: Material, hidden = false) {
  const S = FACE_PX;
  const pal = PALETTE[material];
  seed = 7 + face.v * 31 + (face.mark?.length ?? 0) * 7;
  ctx.save();
  ctx.clearRect(0, 0, S, S);
  // Ground with a soft dome of light.
  const g = ctx.createRadialGradient(S * 0.38, S * 0.32, S * 0.05, S * 0.5, S * 0.5, S * 0.75);
  g.addColorStop(0, material === 'ebony' ? '#46302A' : '#FFFFFF');
  g.addColorStop(0.35, pal.ground);
  g.addColorStop(1, pal.edge);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  // Grain.
  ctx.strokeStyle = pal.grain;
  for (let i = 0; i < 18; i++) {
    ctx.lineWidth = 0.8 + rnd() * 1.6;
    ctx.beginPath();
    const x0 = rnd() * S;
    for (let y = -4; y <= S + 4; y += 6) {
      const x = x0 + Math.sin(y * 0.03 + i) * 6;
      if (y < 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  if (material === 'lacquer') {
    // Gold leaf flecks.
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255,236,170,${0.15 + rnd() * 0.35})`;
      ctx.fillRect(rnd() * S, rnd() * S, 2 + rnd() * 5, 1 + rnd() * 3);
    }
  }

  if (hidden) {
    ctx.fillStyle = 'rgba(30,18,12,0.85)';
    ctx.font = `${S * 0.5}px "Ma Shan Zheng", "STKaiti", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('？', S / 2, S * 0.54);
    ctx.restore();
    return;
  }

  // Mark watermark behind the pips.
  if (face.mark) {
    const col = face.mark === 'cinnabar' ? RED : MARK_COLOR[face.mark] ?? RED;
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = col;
    ctx.font = `${S * 0.78}px "Ma Shan Zheng", "STKaiti", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(MARKS[face.mark].glyph, S / 2, S * 0.54);
    ctx.globalAlpha = 1;
  }

  const v = face.v;
  if (v === 0) {
    // A cracked blank face.
    ctx.strokeStyle = pal.pip;
    ctx.lineWidth = S * 0.025;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(S * 0.3, S * 0.12);
    ctx.lineTo(S * 0.45, S * 0.4);
    ctx.lineTo(S * 0.36, S * 0.55);
    ctx.lineTo(S * 0.58, S * 0.72);
    ctx.lineTo(S * 0.52, S * 0.9);
    ctx.stroke();
    ctx.lineWidth = S * 0.012;
    ctx.beginPath();
    ctx.moveTo(S * 0.45, S * 0.4);
    ctx.lineTo(S * 0.66, S * 0.34);
    ctx.moveTo(S * 0.58, S * 0.72);
    ctx.lineTo(S * 0.78, S * 0.76);
    ctx.stroke();
  } else {
    const red = v === 1 || v === 4 || face.mark === 'cinnabar';
    const r = (v === 1 ? 0.13 : v >= 7 ? 0.075 : 0.088) * S;
    for (const k of PIP_LAYOUT[Math.min(9, v)] ?? []) {
      const [px, py] = P[k];
      const cx = px * S;
      const cy = py * S;
      // Drilled hole: darker toward the upper-left wall, lit lip at lower-right.
      const hg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
      const base = red ? RED : pal.pip;
      hg.addColorStop(0, material === 'ebony' && !red ? '#FFF6E0' : shade(base, -0.35));
      hg.addColorStop(1, base);
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pal.pipHi;
      ctx.lineWidth = S * 0.012;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.92, Math.PI * 0.05, Math.PI * 0.75);
      ctx.stroke();
    }
  }

  if (face.mark === 'glass') {
    ctx.fillStyle = 'rgba(120,190,230,0.22)';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = S * 0.03;
    ctx.beginPath();
    ctx.moveTo(S * 0.12, S * 0.42);
    ctx.lineTo(S * 0.42, S * 0.12);
    ctx.moveTo(S * 0.16, S * 0.56);
    ctx.lineTo(S * 0.56, S * 0.16);
    ctx.stroke();
  }

  // Corner seal.
  if (face.mark) {
    const col = face.mark === 'cinnabar' ? RED : MARK_COLOR[face.mark] ?? RED;
    const s = S * 0.2;
    const x = S - s - S * 0.05;
    const y = S * 0.05;
    ctx.fillStyle = col;
    roundRect(ctx, x, y, s, s, s * 0.18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,215,0.85)';
    ctx.lineWidth = S * 0.01;
    roundRect(ctx, x + s * 0.1, y + s * 0.1, s * 0.8, s * 0.8, s * 0.12);
    ctx.stroke();
    ctx.fillStyle = '#FFF3DC';
    ctx.font = `${s * 0.72}px "Ma Shan Zheng", "STKaiti", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(MARKS[face.mark].glyph, x + s / 2, y + s * 0.56);
  }
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + c * amt)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

export function faceKey(face: Face, material: Material, hidden = false) {
  return `${face.v}|${face.mark ?? ''}|${material}|${hidden ? 1 : 0}`;
}

const imgCache = new Map<string, string>();

/** Data URL of a face, for DOM use. */
export function faceImage(face: Face, material: Material, hidden = false): string {
  const key = faceKey(face, material, hidden);
  let url = imgCache.get(key);
  if (!url) {
    const c = document.createElement('canvas');
    c.width = c.height = FACE_PX;
    paintFace(c.getContext('2d')!, face, material, hidden);
    url = c.toDataURL('image/png');
    imgCache.set(key, url);
  }
  return url;
}

/** Fonts load late; repaint caches once they arrive. */
export function clearFaceCache() {
  imgCache.clear();
}
