// Feedback layer outside the scaled stage: particles on a canvas, floating brush numbers,
// seal stamps, and shakes. Targets are `data-fx` keys or client-space points.
import { layoutRef } from './Stage';

type Kind = 'ink' | 'chip' | 'spark';
type Anchor = string | { x: number; y: number } | null;

let canvas: HTMLCanvasElement | null = null;
let g: CanvasRenderingContext2D | null = null;
let layer: HTMLDivElement | null = null;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  color: string;
  kind: Kind;
  rot: number;
  vr: number;
}
const parts: Particle[] = [];

const scale = () => layoutRef.current.scale;

export function mountFx() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  layer = document.createElement('div');
  layer.className = 'fx-layer';
  document.body.append(canvas, layer);
  g = canvas.getContext('2d');
  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas!.width = innerWidth * dpr;
    canvas!.height = innerHeight * dpr;
    g!.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);
  requestAnimationFrame(tick);
}

let last = performance.now();
function tick(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (g) {
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      if (p.life >= p.max) {
        parts.splice(i, 1);
        continue;
      }
      p.vy += (p.kind === 'spark' ? 260 : 900) * dt * scale();
      p.vx *= 0.98;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const k = 1 - p.life / p.max;
      g.globalAlpha = Math.min(1, k * 1.8);
      g.fillStyle = p.color;
      if (p.kind === 'chip') {
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.fillRect(-p.r, -p.r * 0.35, p.r * 2, p.r * 0.7);
        g.restore();
      } else if (p.kind === 'spark') {
        g.globalCompositeOperation = 'lighter';
        g.beginPath();
        g.arc(p.x, p.y, p.r * (0.4 + k * 0.6), 0, Math.PI * 2);
        g.fill();
        g.globalCompositeOperation = 'source-over';
      } else {
        g.beginPath();
        g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.globalAlpha = 1;
  }
  requestAnimationFrame(tick);
}

function rectOf(a: Anchor): { x: number; y: number; w: number; h: number } | null {
  if (!a) return null;
  if (typeof a !== 'string') return { x: a.x, y: a.y, w: 40 * scale(), h: 40 * scale() };
  const e = document.querySelector(`[data-fx="${a}"]`);
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
}

export function splatter(a: Anchor, color: string, count: number, kind: Kind = 'ink') {
  const c = rectOf(a);
  if (!c) return;
  if (reduced) count = Math.ceil(count / 3);
  const s = scale();
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = (kind === 'spark' ? 180 + Math.random() * 520 : 120 + Math.random() * 380) * s;
    parts.push({
      x: c.x + (Math.random() - 0.5) * c.w * 0.3,
      y: c.y + (Math.random() - 0.5) * c.h * 0.3,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - (kind === 'spark' ? 200 : 260) * s,
      r: (kind === 'chip' ? 3 + Math.random() * 4 : kind === 'spark' ? 2 + Math.random() * 3 : 1.5 + Math.random() * 4) * s,
      life: 0,
      max: 0.5 + Math.random() * 0.6,
      color: kind === 'spark' ? (Math.random() < 0.5 ? '#FFD27A' : '#FF8A3A') : color,
      kind,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 20,
    });
  }
}

function float(c: { x: number; y: number; h: number }, text: string, cls: string) {
  if (!layer) return;
  const d = document.createElement('div');
  d.className = `fx-float ${cls}`;
  d.textContent = text;
  const base = cls.includes('fx-big') ? 64 : cls.includes('fx-rule') ? 24 : 30;
  d.style.fontSize = `${Math.round(base * scale())}px`;
  d.style.left = `${c.x}px`;
  d.style.top = `${c.y - c.h * 0.3}px`;
  layer.append(d);
  const drift = (Math.random() - 0.5) * 30 * scale();
  d.animate(
    [
      { transform: 'translate(-50%,-50%) scale(0.4)', opacity: 0 },
      { transform: 'translate(-50%,-90%) scale(1.15)', opacity: 1, offset: 0.14 },
      { transform: `translate(calc(-50% + ${drift}px),-150%) scale(1)`, opacity: 1, offset: 0.7 },
      { transform: `translate(calc(-50% + ${drift}px),-190%) scale(0.95)`, opacity: 0 },
    ],
    { duration: reduced ? 600 : 1000, easing: 'cubic-bezier(.2,.8,.3,1)' },
  ).onfinish = () => d.remove();
}

export function floatText(key: string, text: string, cls: string) {
  const c = rectOf(key);
  if (c) float(c, text, cls);
}

export function floatAt(p: { x: number; y: number } | null, text: string, cls: string) {
  if (p) float({ x: p.x, y: p.y, h: 30 * scale() }, text, cls);
}

/** A cinnabar seal slammed onto an element. */
export function stamp(a: Anchor, glyph: string, size = 64) {
  const c = rectOf(a);
  if (!c || !layer) return;
  const d = document.createElement('div');
  d.className = 'fx-stamp';
  d.textContent = glyph;
  const px = size * scale();
  d.style.width = d.style.height = `${px}px`;
  d.style.fontSize = `${px * 0.62}px`;
  d.style.left = `${c.x}px`;
  d.style.top = `${c.y}px`;
  const rot = (Math.random() - 0.5) * 18;
  layer.append(d);
  d.animate(
    [
      { transform: `translate(-50%,-50%) rotate(${rot}deg) scale(2.4)`, opacity: 0 },
      { transform: `translate(-50%,-50%) rotate(${rot}deg) scale(0.92)`, opacity: 1, offset: 0.18 },
      { transform: `translate(-50%,-50%) rotate(${rot}deg) scale(1)`, opacity: 1, offset: 0.26 },
      { transform: `translate(-50%,-50%) rotate(${rot}deg) scale(1)`, opacity: 1, offset: 0.8 },
      { transform: `translate(-50%,-50%) rotate(${rot}deg) scale(1.04)`, opacity: 0 },
    ],
    { duration: 1300, easing: 'cubic-bezier(.3,1.4,.5,1)' },
  ).onfinish = () => d.remove();
}

export function pulse(key: string) {
  const e = document.querySelector(`[data-fx="${key}"]`) as HTMLElement | null;
  if (!e || reduced) return;
  e.animate([{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.12) rotate(-3deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 240, easing: 'ease-out' });
}

export function screenShake(strength = 1) {
  const e = document.querySelector('.stage') as HTMLElement | null;
  if (!e || reduced) return;
  const s = 4 * strength;
  const base = e.style.transform;
  e.animate(
    [
      { transform: base },
      { transform: `${base} translate(${s}px, ${-s}px)` },
      { transform: `${base} translate(${-s}px, ${s * 0.6}px)` },
      { transform: `${base} translate(${s * 0.5}px, 0)` },
      { transform: base },
    ],
    { duration: 280 },
  );
}
