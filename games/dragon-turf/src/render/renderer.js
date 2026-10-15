import { TILE, VIEW } from '../config.js';
import { Camera } from './camera.js';
import { GroundLayer } from './ground.js';
import { Water } from './water.js';
import { BuildingSprites } from './buildingSprites.js';
import { Lighting } from './lighting.js';
import { PROP_DRAW, drawPaifang, drawLanternLine } from './propSprites.js';
import { damp, clamp } from '../core/math.js';
import { makeCanvas } from './style.js';

// Owns the main canvas and composes a frame:
//   water → baked ground → depth-sorted (buildings, props, entities) → overhead
//   layer (gates, lanterns) → fx → night light-map → emissive glow → world markers.
export class Renderer {
  constructor(canvas, world, clock) {
    this.canvas = canvas; this.g = canvas.getContext('2d'); this.world = world; this.clock = clock;
    this.cam = new Camera(); this.ground = new GroundLayer(world); this.water = new Water();
    this.buildings = new BuildingSprites(); this.light = new Lighting();
    this.time = 0; this.frame = 0; this.items = []; this.stats = { items: 0, lights: 0, chunks: 0 };
    this.hooks = { drawables: null, overlay: null, lights: null, emissive: null, fxBelow: null, fxAbove: null };
    this.resize(); addEventListener('resize', () => this.resize());
  }
  resize() {
    const dpr = Math.max(0.75, Math.min(window.devicePixelRatio || 1, VIEW.maxDpr) * (this.quality ?? 1)), w = window.innerWidth, h = window.innerHeight;
    this.canvas.width = Math.floor(w * dpr); this.canvas.height = Math.floor(h * dpr); this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.cam.resize(w, h, dpr); this._vig = null;
  }

  // Adaptive resolution: if frames run long, render fewer pixels; recover when there is headroom.
  adapt(dt) {
    if (!(dt > 0) || dt > 0.2) return;
    this._ft = this._ft === undefined ? dt : this._ft * 0.95 + dt * 0.05; this._adT = (this._adT || 0) + dt;
    if (this._adT < 2) return;
    const q = this.quality ?? 1;
    if (this._ft > 1 / 50 && q > 0.55) { this.quality = Math.max(0.55, q - 0.15); this._adT = 0; this.resize(); }
    else if (this._ft < 1 / 58 && q < 1) { this.quality = Math.min(1, q + 0.1); this._adT = -4; this.resize(); }
  }

  render(dt, focus) {
    const g = this.g, cam = this.cam, world = this.world; this.time += dt;
    const amb = this.clock.ambient(), night = this.clock.dark;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#123f60'; g.fillRect(0, 0, this.canvas.width, this.canvas.height);
    cam.apply(g);
    this.water.draw(g, this.ground.wetRects(cam), this.time, night);
    this.ground.draw(g, cam);
    if (this.hooks.fxBelow) this.hooks.fxBelow(g, cam);

    // ---- collect depth-sorted drawables ----
    const items = this.items; items.length = 0; this.lean = VIEW.persp * cam.zoom;
    const b = cam.bounds(40);
    const frame = ++this.frame;
    for (const bd of world.buildings) {
      const G = this._geo(bd, cam);
      if (G.hx1 + 20 < b.x0 || G.hx0 - 20 > b.x1 || G.y1 + 20 < b.y0 || G.hy0 - 20 > b.y1) continue;
      G.frame = frame;
      // equal base lines: shorter first, so taller walls overlap lower roofs
      items.push({ y: G.y1 - 0.5 + bd.H * 0.003, t: 0, ref: bd });
    }
    for (const p of world.props) {
      const mg = p.len ? p.len / 2 + 40 : 40;
      if (p.dead || p.x < b.x0 - mg || p.x > b.x1 + mg || p.y < b.y0 - 40 - (p.len ? 70 : 0) || p.y > b.y1 + 60 + (p.len ? 70 : 0)) continue;
      if (p.type === 'paifang') continue;
      items.push({ y: p.y + (p.type === 'tree' ? 6 : 0), t: 1, ref: p });
    }
    if (this.hooks.drawables) this.hooks.drawables(items, b);
    items.sort((a, c) => a.y - c.y);
    this.stats.items = items.length;

    for (const it of items) {
      if (it.t === 0) this._drawBuilding(g, it.ref, focus, dt);
      else if (it.t === 1 && it.ref.type === 'tree') { const p = it.ref; p.lx = (p.x - cam.x) * this.lean; p.ly = (p.y - cam.y) * this.lean; g.save(); g.translate(p.x, p.y); PROP_DRAW.tree(g, p, this.time); g.restore(); }
      else if (it.t === 1) { const p = it.ref; g.save(); g.translate(p.x, p.y); (PROP_DRAW[p.type] || (() => {}))(g, p, this.time); g.restore(); }
      else it.draw(g, this.time, cam);
    }

    // ---- overhead layer ----
    for (const gate of world.gates || []) if (Math.abs(gate.x - cam.x) < 600 && Math.abs(gate.y - cam.y) < 500) drawPaifang(g, gate, this.time);
    for (const l of world.lanterns) { if (l.x0 < b.x0 - 80 || l.x0 > b.x1 + 80 || l.y0 < b.y0 - 80 || l.y0 > b.y1 + 80) continue; drawLanternLine(g, l, this.time); }
    if (this.hooks.fxAbove) this.hooks.fxAbove(g, cam);

    // ---- night lighting ----
    if (night > 0.04) this._lighting(g, cam, amb, night, focus);
    this._emissive(g, cam, amb, night, b);
    if (this.hooks.emissive) this.hooks.emissive(g, cam, night);
    if (night > 0.25) this._bloom(g, night);
    if (this.hooks.overlay) this.hooks.overlay(g, cam);
    this._grade(g, cam, night);
  }

  // Final colour grade: soft vignette only (no warm wash — it flattened contrast),
  // from one cached screen-sized overlay (a per-frame radial gradient over the whole canvas is costly).
  _grade(g, cam, night) {
    const W = this.canvas.width, H = this.canvas.height;
    if (!this._vig) {
      const v = this._vig = makeCanvas(256, Math.max(64, Math.round(256 * H / W))), q = v.getContext('2d'), w = v.width, h = v.height;
      const gr = q.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.hypot(w, h) * 0.62); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(4,2,12,0.5)');
      q.fillStyle = gr; q.fillRect(0, 0, w, h);
    }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    if (night <= 0.04) g.drawImage(this._vig, 0, 0, W, H);   // at night the vignette rides in the light map
    g.restore(); void cam;
  }

  // Box projection: the roof is displaced up by the wall height (camera pitch) and
  // away from the screen centre in proportion to height (perspective), so walls
  // facing the camera appear and the city gains parallax as you move.
  _geo(bd, cam) {
    const G = bd._geo || (bd._geo = {}), H = bd.H, k = this.lean;
    const x0 = bd.x * TILE, y0 = bd.y * TILE, x1 = x0 + bd.w * TILE, y1 = y0 + bd.d * TILE;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    G.x0 = x0; G.y0 = y0; G.x1 = x1; G.y1 = y1;
    G.ox = clamp((cx - cam.x) * k, -0.95, 0.95) * H;
    G.oy = -clamp(VIEW.tilt - (cy - cam.y) * k * 0.8, 0.32, 1.35) * H;
    G.hx0 = Math.min(x0, x0 + G.ox); G.hx1 = Math.max(x1, x1 + G.ox); G.hy0 = y0 + G.oy - 10;
    return G;
  }

  _drawBuilding(g, bd, focus, dt) {
    const s = this.buildings.get(bd), G = bd._geo, H = bd.H, P = s.P;
    // fade the building when the player stands "behind" it on screen
    let target = 1;
    if (focus && focus.x > G.hx0 - 10 && focus.x < G.hx1 + 10 && focus.y < G.y1 - 4 && focus.y > G.hy0) target = 0.3;
    bd._a = bd._a === undefined ? 1 : damp(bd._a, target, 10, dt);
    if (bd._a < 0.999) g.globalAlpha = bd._a;
    const { x0, y0, x1, y1, ox, oy } = G, kx = -ox / H, ky = -oy / H;
    // side wall facing the camera
    if (Math.abs(ox) > 0.8) {
      const ex = ox > 0 ? x0 : x1, D = y1 - y0;
      g.save(); g.transform(0, 1, kx, ky, ex + ox, y0 + oy);
      g.drawImage(s.side, -P, -P);
      g.fillStyle = ox > 0 ? 'rgba(255,230,190,0.05)' : 'rgba(12,6,28,0.32)'; g.fillRect(0, 0, D, H);
      g.restore();
    }
    // south facade
    g.save(); g.transform(1, 0, kx, ky, x0 + ox, y1 + oy); g.drawImage(s.facade, -P, -P);
    g.fillStyle = 'rgba(12,6,28,0.1)'; g.fillRect(0, 0, x1 - x0, H); g.restore();
    // roof
    g.drawImage(s.roof, x0 + ox - P, y0 + oy - P);
    g.globalAlpha = 1;
  }

  _lighting(g, cam, amb, night, focus) {
    const L = this.light; L.begin(cam, amb);
    const world = this.world, b = cam.bounds(160), t = this.time;
    for (const p of world.props) {
      if ((p.type !== 'lamp' && p.type !== 'lantern_post') || p.dead) continue;
      if (p.x < b.x0 || p.x > b.x1 || p.y < b.y0 || p.y > b.y1) continue;
      L.add(p.x, p.y, p.type === 'lamp' ? 120 : 90, p.type === 'lamp' ? '#ffb86a' : '#ff7a4a', 0.95);
    }
    for (const l of world.lanterns) {
      const mx = (l.x0 + l.x1) / 2, my = (l.y0 + l.y1) / 2; if (mx < b.x0 || mx > b.x1 || my < b.y0 || my > b.y1) continue;
      for (let i = 1; i < l.n; i += 2) { const tt = i / l.n; L.add(l.x0 + (l.x1 - l.x0) * tt, l.y0 + (l.y1 - l.y0) * tt, 52, l.color, 0.75); }
    }
    for (const bd of world.buildings) {
      if (!bd.neon) continue;
      const x = (bd.x + bd.w / 2) * TILE, y = (bd.y + bd.d) * TILE; if (x < b.x0 || x > b.x1 || y < b.y0 || y > b.y1 + 60) continue;
      L.add(x, y + 14, 70 + bd.w * 4, bd.neon, 0.7);
      L.add(x, y + 40, 180, bd.neon, 0.45);          // wide neon wash over the street
    }
    for (const gate of world.gates || []) L.add(gate.x, gate.y, 110, '#ff6a3a', 0.6);
    if (focus) L.add(focus.x, focus.y, 110, '#9fb4ff', 0.28);   // keeps the player readable in the dark
    if (this.hooks.lights) this.hooks.lights(L, cam, night, t);
    L.finish(g, cam, this._vigMul());
    this.stats.lights = L.count;
    cam.apply(g);
  }

  _emissive(g, cam, amb, night, b) {
    const world = this.world, neon = amb.neon;
    if (neon < 0.04) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const bd of world.buildings) {
      const G = bd._geo; if (!G || G.frame !== this.frame) continue;
      const s = this.buildings.get(bd); if (!s.glowF && !s.glowS) continue;
      const H = bd.H, P = s.P, { x0, y0, x1, y1, ox, oy } = G, kx = -ox / H, ky = -oy / H;
      g.globalAlpha = neon * (bd._a ?? 1) * (bd.neon ? 0.94 + Math.sin(this.time * 3 + bd.id) * 0.06 : 0.9);
      if (s.glowF) { g.save(); g.transform(1, 0, kx, ky, x0 + ox, y1 + oy); g.drawImage(s.glowF, -P, -P); g.restore(); }
      if (s.glowS && Math.abs(ox) > 0.8) { g.save(); g.transform(0, 1, kx, ky, (ox > 0 ? x0 : x1) + ox, y0 + oy); g.drawImage(s.glowS, -P, -P); g.restore(); }
      // wet-street reflection: a soft vertical smear of the neon colour on the pavement
      if (bd.neon && s.glowF) {
        const w = Math.min(x1 - x0, 140) * 0.8, cx = (x0 + x1) / 2 + ox * 0.15;
        g.globalAlpha = 0.2 * neon * (bd._a ?? 1); g.drawImage(this.light.reflect(bd.neon), cx - w / 2, y1 + 2, w, 78);
      }
    }
    g.globalAlpha = 1;
    // street lamps & lantern bulbs
    for (const p of world.props) {
      if (p.type !== 'lamp' || p.dead || p.x < b.x0 || p.x > b.x1 || p.y < b.y0 || p.y > b.y1) continue;
      const dx = Math.cos(p.dir || 0) * -5, dy = Math.sin(p.dir || 0) * -5 - 11;
      g.globalAlpha = 0.8 * neon; g.drawImage(this._bulb(), p.x + dx - 14, p.y + dy - 14, 28, 28);
    }
    g.restore();
  }
  // Night bloom: a low-res, contrast-crushed, blurred copy of the frame added back on top,
  // so neon, lamps and headlights glow instead of sitting flat on the image.
  _bloom(g, night) {
    const W = this.canvas.width, H = this.canvas.height, bw = Math.max(1, Math.round(W / 6)), bh = Math.max(1, Math.round(H / 6));
    if (!this._bl || this._bl.width !== bw || this._bl.height !== bh) { this._bl = makeCanvas(bw, bh); this._bl2 = makeCanvas(bw, bh); }
    const a = this._bl.getContext('2d'), b = this._bl2.getContext('2d');
    a.globalCompositeOperation = 'copy'; a.filter = 'brightness(0.55) contrast(3.2) saturate(1.4)'; a.drawImage(this.canvas, 0, 0, bw, bh); a.filter = 'none';
    b.globalCompositeOperation = 'copy'; b.filter = 'blur(3px)'; b.drawImage(this._bl, 0, 0); b.filter = 'none';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(0.75, (night - 0.25) * 1.4); g.imageSmoothingEnabled = true;
    g.drawImage(this._bl2, 0, 0, W, H); g.restore();
  }
  _vigMul() {
    if (!this._vigM) { const c = this._vigM = makeCanvas(128, 96), q = c.getContext('2d'), gr = q.createRadialGradient(64, 48, 40, 64, 48, 100); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#7c7a86'); q.fillStyle = gr; q.fillRect(0, 0, 128, 96); }
    return this._vigM;
  }
  _bulb() {
    if (!this._bulbCv) { const c = this._bulbCv = makeCanvas(32, 32), q = c.getContext('2d'), gr = q.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,230,170,1)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); q.fillStyle = gr; q.fillRect(0, 0, 32, 32); }
    return this._bulbCv;
  }
}
