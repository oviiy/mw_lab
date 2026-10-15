import { makeCanvas, INK } from '../render/style.js';
import { rand } from '../core/rng.js';

// Particles, floating text, light flashes and persistent ground decals.
function softSprite(color, size = 64) {
  const c = makeCanvas(size, size), g = c.getContext('2d'), r = size / 2;
  const gr = g.createRadialGradient(r, r, 0, r, r, r); gr.addColorStop(0, color.replace('A', '1')); gr.addColorStop(0.5, color.replace('A', '0.5')); gr.addColorStop(1, color.replace('A', '0'));
  g.fillStyle = gr; g.fillRect(0, 0, size, size); return c;
}

export class FxSystem {
  constructor(game) {
    this.game = game; this.parts = []; this.floaters = []; this.flashes = []; this.rings = []; this.time = 0;
    this.sprSmokeW = softSprite('rgba(235,235,240,A)'); this.sprSmokeD = softSprite('rgba(30,28,34,A)'); this.sprFire = softSprite('rgba(255,170,60,A)'); this.sprGlow = softSprite('rgba(255,240,200,A)');
  }

  /* ---------- emitters ---------- */
  smoke(x, y, dark = 0.4, life = 1.6) { this.parts.push({ t: 'smoke', x, y, vx: rand.range(-8, 8), vy: rand.range(-26, -8), life, max: life, s0: 8, s1: 26 + rand.range(0, 10), a: 0.55, dark }); }
  fire(x, y, size = 1) { this.parts.push({ t: 'fire', x: x + rand.range(-3, 3), y: y + rand.range(-3, 3), vx: rand.range(-10, 10), vy: rand.range(-40, -14), life: rand.range(0.35, 0.7), max: 0.7, s0: 16 * size, s1: 4, a: 0.9 }); }
  spark(x, y, ang, n = 5, spread = 1.2, speed = 220) { for (let i = 0; i < n; i++) { const a = ang + rand.range(-spread, spread), s = rand.range(0.4, 1) * speed; this.parts.push({ t: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand.range(0.15, 0.35), max: 0.35, a: 1 }); } }
  blood(x, y, ang, n = 6) {
    for (let i = 0; i < n; i++) { const a = ang + rand.range(-0.9, 0.9), s = rand.range(40, 190); this.parts.push({ t: 'blood', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand.range(0.25, 0.5), max: 0.5, a: 1 }); }
    if (Math.random() < 0.6) this.stainBlood(x + Math.cos(ang) * 6, y + Math.sin(ang) * 6, rand.range(2, 4.5));
  }
  dust(x, y, n = 3) { for (let i = 0; i < n; i++) this.parts.push({ t: 'dust', x: x + rand.range(-4, 4), y: y + rand.range(-4, 4), vx: rand.range(-30, 30), vy: rand.range(-30, 30), life: 0.6, max: 0.6, s0: 4, s1: 14, a: 0.35 }); }
  debris(x, y, color, n = 6) { for (let i = 0; i < n; i++) { const a = rand.range(0, 6.28), s = rand.range(40, 200); this.parts.push({ t: 'debris', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand.range(0.4, 0.9), max: 0.9, color, rot: rand.range(0, 6), a: 1 }); } }
  casing(x, y, ang) { const a = ang + Math.PI / 2 + rand.range(-0.4, 0.4); this.parts.push({ t: 'casing', x, y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, life: 0.6, max: 0.6, rot: rand.range(0, 6), a: 1 }); }
  flash(x, y, r = 80, color = '#ffd9a0', life = 0.08, intensity = 1) { this.flashes.push({ x, y, r, color, life, max: life, i: intensity }); }
  ring(x, y, r = 90, color = 'rgba(255,220,160,') { this.rings.push({ x, y, r, life: 0.4, max: 0.4, color }); }
  wake(x, y, ang, k = 1) { for (const sd of [-1, 1]) { const a = ang + Math.PI + sd * 0.55; this.parts.push({ t: 'wake', x, y, vx: Math.cos(a) * 46 * k, vy: Math.sin(a) * 46 * k, life: 1.1, max: 1.1, s0: 3, s1: 11 + k * 8, a: 0.5 * k }); } }
  floater(x, y, text, color = '#ffe28a', big = false) { this.floaters.push({ x, y, text, color, life: 1.4, max: 1.4, big }); }
  explosion(x, y, r = 80) {
    this.game.camera.addTrauma(Math.min(0.9, r / 140));
    for (let i = 0; i < 22; i++) { const a = rand.range(0, 6.28), s = rand.range(20, r * 2.2); this.parts.push({ t: 'fire', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand.range(0.4, 0.9), max: 0.9, s0: r * 0.35, s1: r * 0.12, a: 1 }); }
    for (let i = 0; i < 14; i++) { const a = rand.range(0, 6.28), s = rand.range(10, r); this.parts.push({ t: 'smoke', x, y, vx: Math.cos(a) * s * 0.4, vy: Math.sin(a) * s * 0.4 - 12, life: rand.range(1.2, 2.4), max: 2.4, s0: r * 0.3, s1: r * 0.8, a: 0.65, dark: 0.12 }); }
    this.spark(x, y, 0, 18, 3.2, r * 3.5); this.debris(x, y, '#3a3036', 10);
    this.flash(x, y, r * 3, '#ffb060', 0.5, 1.4); this.ring(x, y, r * 1.5);
    this.stainScorch(x, y, r * 0.9);
  }

  /* ---------- persistent ground decals ---------- */
  stainBlood(x, y, r) { const g = this.game; g.renderer.ground.stamp(x, y, r + 2, (c) => { c.fillStyle = `rgba(${100 + rand.range(0, 40) | 0},8,12,${rand.range(0.5, 0.85)})`; c.beginPath(); c.ellipse(x, y, r, r * rand.range(0.6, 1), rand.range(0, 3), 0, 6.3); c.fill(); }); }
  bloodPool(x, y) { this.stainBlood(x, y, 9); this.stainBlood(x + 3, y - 2, 6); this.stainBlood(x - 4, y + 3, 5); }
  stainScorch(x, y, r) { this.game.renderer.ground.stamp(x, y, r + 4, (c) => { const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(10,6,12,0.75)'); gr.addColorStop(1, 'rgba(10,6,12,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2); }); }
  skid(v) {
    const ca = Math.cos(v.angle), sa = Math.sin(v.angle), d = v.def, g = this.game;
    for (const sx of [-1, 1]) {
      const bx = v.x - ca * d.len * 0.28 - sa * sx * (d.wid / 2 - 3), by = v.y - sa * d.len * 0.28 + ca * sx * (d.wid / 2 - 3);
      g.renderer.ground.stamp(bx, by, 4, (c) => { c.fillStyle = 'rgba(8,6,10,0.28)'; c.beginPath(); c.arc(bx, by, 2.1, 0, 6.3); c.fill(); });
    }
  }

  /* ---------- simulation ---------- */
  update(dt) {
    this.time += dt; this.emitSteam(dt);
    const ps = this.parts;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]; p.life -= dt; if (p.life <= 0) { ps[i] = ps[ps.length - 1]; ps.pop(); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.t === 'smoke' || p.t === 'dust') { p.vx *= 1 - dt * 1.2; p.vy *= 1 - dt * 0.8; }
      else if (p.t === 'fire') { p.vx *= 1 - dt * 2; p.vy *= 1 - dt * 1.5; }
      else { p.vx *= 1 - dt * 2.4; p.vy *= 1 - dt * 2.4; }
    }
    for (let i = this.floaters.length - 1; i >= 0; i--) { const f = this.floaters[i]; f.life -= dt; f.y -= 22 * dt; if (f.life <= 0) this.floaters.splice(i, 1); }
    for (let i = this.flashes.length - 1; i >= 0; i--) { this.flashes[i].life -= dt; if (this.flashes[i].life <= 0) this.flashes.splice(i, 1); }
    for (let i = this.rings.length - 1; i >= 0; i--) { this.rings[i].life -= dt; if (this.rings[i].life <= 0) this.rings.splice(i, 1); }
    if (ps.length > 1800) ps.splice(0, ps.length - 1800);
  }

  emitSteam(dt) {
    const p = this.game.player; if (!p) return; this.steamT = (this.steamT || 0) - dt; if (this.steamT > 0) return; this.steamT = 0.12;
    for (const s of this.game.world.steam) { if (Math.abs(s.x - p.x) > 640 || Math.abs(s.y - p.y) > 420) continue; if (Math.random() < (s.cart ? 0.45 : 0.28)) this.parts.push({ t: 'smoke', x: s.x + (Math.random() - 0.5) * 4, y: s.y, vx: (Math.random() - 0.5) * 10 + 6, vy: -14 - Math.random() * 14, life: 1.5, max: 1.5, s0: 4, s1: 15, a: s.cart ? 0.28 : 0.34, dark: 0 }); }
  }

  /* ---------- drawing ---------- */
  drawParticles(g) {
    for (const p of this.parts) {
      const k = p.life / p.max, inv = 1 - k;
      switch (p.t) {
        case 'smoke': { const s = p.s0 + (p.s1 - p.s0) * inv, spr = p.dark > 0.2 ? this.sprSmokeD : this.sprSmokeW; g.globalAlpha = p.a * k * (p.dark < 0.2 && p.dark > 0 ? 0.8 : 1); g.drawImage(spr, p.x - s, p.y - s, s * 2, s * 2); break; }
        case 'wake': { const s = p.s0 + (p.s1 - p.s0) * inv; g.globalAlpha = p.a * k; g.strokeStyle = '#eaf6ff'; g.lineWidth = 2; g.beginPath(); g.arc(p.x, p.y, s, 0, 6.3); g.stroke(); break; }
        case 'dust': { const s = p.s0 + (p.s1 - p.s0) * inv; g.globalAlpha = p.a * k; g.drawImage(this.sprSmokeW, p.x - s, p.y - s, s * 2, s * 2); break; }
        case 'blood': g.globalAlpha = k; g.fillStyle = '#b0121c'; g.beginPath(); g.arc(p.x, p.y, 1.6 + k, 0, 6.3); g.fill(); break;
        case 'spark': g.globalAlpha = k; g.strokeStyle = '#ffd84a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); g.stroke(); break;
        case 'debris': g.globalAlpha = k; g.save(); g.translate(p.x, p.y); g.rotate(p.rot + inv * 8); g.fillStyle = p.color; g.fillRect(-2, -1.4, 4, 2.8); g.restore(); break;
        case 'casing': g.globalAlpha = k; g.save(); g.translate(p.x, p.y); g.rotate(p.rot + inv * 14); g.fillStyle = '#e0b94a'; g.fillRect(-1.6, -0.7, 3.2, 1.4); g.restore(); break;
        default: break;
      }
    }
    g.globalAlpha = 1;
    // additive layer (fire, rings)
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const p of this.parts) if (p.t === 'fire') { const k = p.life / p.max, s = p.s1 + (p.s0 - p.s1) * k; g.globalAlpha = p.a * Math.min(1, k * 1.4); g.drawImage(this.sprFire, p.x - s, p.y - s, s * 2, s * 2); }
    for (const f of this.flashes) { const k = f.life / f.max, s = f.r * 0.5; g.globalAlpha = k * Math.min(1, f.i) * 0.8; g.drawImage(this.sprGlow, f.x - s, f.y - s, s * 2, s * 2); }
    for (const r of this.rings) { const k = r.life / r.max, rad = r.r * (1 - k); g.globalAlpha = k * 0.7; g.strokeStyle = r.color + '1)'; g.lineWidth = 3 + k * 5; g.beginPath(); g.arc(r.x, r.y, rad, 0, 6.3); g.stroke(); }
    g.restore(); g.globalAlpha = 1;
  }
  drawFloaters(g) {
    g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const f of this.floaters) { const k = f.life / f.max; g.globalAlpha = Math.min(1, k * 2); g.font = `900 ${f.big ? 17 : 12}px "Arial Black", Impact, sans-serif`; g.lineWidth = 3.5; g.strokeStyle = INK; g.strokeText(f.text, f.x, f.y); g.fillStyle = f.color; g.fillText(f.text, f.x, f.y); }
    g.restore(); g.globalAlpha = 1;
  }
  lights(L) {
    for (const f of this.flashes) L.add(f.x, f.y, f.r, f.color, (f.life / f.max) * f.i);
    for (const p of this.parts) if (p.t === 'fire' && Math.random() < 0.35) L.add(p.x, p.y, 54, '#ff8a3a', 0.5 * (p.life / p.max));
  }
}
