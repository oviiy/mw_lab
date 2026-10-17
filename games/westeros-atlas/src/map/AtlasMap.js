// AtlasMap — the 2D "illustrated atlas": Canvas2D, pan/zoom/pinch/keyboard, zoom-dependent labels with decluttering.
import { WORLD, SEAS, CONTINENTS } from '../data/regions.js';
import { RIVERS, LAKES, ROADS, WALL, SEA_LANES, FEATURES } from './geo.js';
import { buildLandPaths, buildBasemap, roughen, placeGlyphs, OFF } from './basemap.js';
import { buildSprites, SPRITE_H } from './sprites.js';
import { rng, smoothPath, noise2, clamp, pointAlong, polyLength } from '../kit/util.js';

const INK = '#3a2616', PAPER = 'rgba(240,226,190,0.9)', GOLD = '#e8c26a', RED = '#7d2a1b';
const FONT = (px, w = 600, it = false) => `${it ? 'italic ' : ''}${w} ${px}px "Cormorant Garamond","Iowan Old Style","Palatino Linotype",Palatino,"Songti SC","STSong","Noto Serif SC",Georgia,serif`;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const LABEL_MIN = { 5: 0, 4: 1.3, 3: 1.9, 2: 3.2, 1: 5.2 };   // min zoom (x fit) at which a rank's LABEL may show
const MARKER_MIN = { 5: 0, 4: 0, 3: 1.25, 2: 2.3, 1: 3.8 };   // …and its MARKER
const NATURE_MIN = { 5: 0, 4: 1.0, 3: 1.8, 2: 3.0, 1: 4.6 };   // nature labels
const DOT_ALWAYS = true;
const PORTRAIT_X = 420;                                         // world x the portrait (phone) view centres on: Westeros
const COMPASS = [196, 1690];                                    // compass rose: open Sunset Sea, south-west of the Arbor
const FEATURE_MIN = { range: 1.25, desert: 1.25, plain: 1.7, swamp: 1.9, forest: 1.9, island: 2.4, lake: 2.6, cape: 2.8, peak: 3.4, river: 3.2 };   // geo.js FEATURES fallback labels

export class AtlasMap {
  constructor(canvas, { locations, regions, onSelect, onHover, onView, onRegion }) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.locs = locations; this.regions = regions; this.cb = { onSelect, onHover, onView, onRegion };
    this.cam = { x: WORLD.w / 2, y: WORLD.h / 2, s: 0.5 };
    this.fit = 0.5; this.dpr = 1; this.w = 0; this.h = 0;
    this.lang = 'en'; this.kinds = null; this.selected = null; this.hover = null; this.focusIdx = -1;
    this.query = null; this.routes = null; this.showRoutes = false;
    this.pointers = new Map(); this.vel = { x: 0, y: 0 }; this.anim = null; this.time = 0; this.running = false; this.dirty = true;
    this.measure = new Map(); this.labelRects = []; this.regionRects = [];
    this.reduced = false; this.dim = false; this.interactive = true;
    this._bindEvents();
  }

  async init() {
    const { polys, path } = buildLandPaths(); this.landPolys = polys; this.landPath = path;
    const base = await buildBasemap(path); this.base = base.canvas; this.heightAt = base.heightAt; this.isLand = base.isLand;
    this.sprites = buildSprites(); this.glyphs = placeGlyphs(base.heightAt, base.isLand);
    this.seaPath = new Path2D(); this.seaPath.rect(-OFF, -OFF, WORLD.w + OFF * 2, WORLD.h + OFF * 2); this.seaPath.addPath(path);
    this._prepareGlyphs(); this._prepareGrain();
    this.resize(); this.cam.s = this.fit; this.goWorld(true); this.ready = true; this.dirty = true;
  }

  /* ---------- static glyph preparation ---------- */
  _prepareGlyphs() {
    const r = rng(77);
    const r0 = r;
    this.rivers = RIVERS.map((rv) => ({ ...rv, pts: smoothPath(rv.pts, 8).map(([x, y], i) => [x + (noise2(i * 0.7, x, 4) - 0.5) * 1.6, y + (noise2(i * 0.7, y, 5) - 0.5) * 1.6]) }));
    this.roads = ROADS.filter((x) => !x.skip).map((rd) => ({ ...rd, pts: smoothPath(rd.pts, 8) }));
    this.lanes = SEA_LANES.map((l) => smoothPath(l, 10));
    this.ships = this.lanes.map((l, i) => ({ lane: i, u: r(), v: r.range(0.004, 0.009) * (r() < 0.5 ? -1 : 1), len: polyLength(l) }));
    this.clouds = Array.from({ length: 9 }, () => ({ x: r.range(0, WORLD.w), y: r.range(0, WORLD.h), rx: r.range(140, 320), ry: r.range(50, 110), v: r.range(2, 6) }));
    this.waves = []; for (let i = 0; i < 2600 && this.waves.length < 420; i++) { const x = r.range(-200, WORLD.w + 200), y = r.range(-200, WORLD.h + 200); if (!this.isLand(x, y)) this.waves.push({ x, y, l: r.range(6, 13), ph: r() * 6.28 }); }
  }
  _prepareGrain() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const img = g.createImageData(256, 256), d = img.data;
    for (let i = 0; i < 256 * 256; i++) { const v = 128 + (noise2((i % 256) * 0.7, Math.floor(i / 256) * 0.7, 3) - 0.5) * 70 + (Math.random() - 0.5) * 26; d[i * 4] = Math.min(255, v + 90); d[i * 4 + 1] = Math.min(255, v + 82); d[i * 4 + 2] = Math.min(255, v + 62); d[i * 4 + 3] = 255; }
    g.putImageData(img, 0, 0); this.grain = this.ctx.createPattern(c, 'repeat');
  }

  /* ---------- sizing / camera ---------- */
  resize() {
    const p = this.canvas.parentElement; const w = p.clientWidth, h = p.clientHeight; if (!w || !h) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * this.dpr); this.canvas.height = Math.round(h * this.dpr); this.w = w; this.h = h;
    const topPad = w < 760 ? 100 : 108, full = Math.min(w / WORLD.w, (h - topPad) / WORLD.h), portrait = w / (h - topPad) < 0.8, f = portrait ? (h - topPad) / WORLD.h : full; this.topPad = topPad; this.portrait = portrait; this.fullFit = full;
    const wasFit = Math.abs(this.cam.s - this.fit) < 1e-6; this.fit = f; this.minS = Math.max(full * 0.9, h / (WORLD.h + OFF * 2 - 60), w / (WORLD.w + OFF * 2 - 60)); this.maxS = Math.max(f * 28, 12);
    if (wasFit) { this.cam.s = f; this.cam.x = this.portrait ? PORTRAIT_X : WORLD.w / 2; this.cam.y = WORLD.h / 2 - topPad / 2 / f; } this._clamp(); this.dirty = true;
  }
  _clamp() {
    const c = this.cam; c.s = clamp(c.s, this.minS, this.maxS);
    const hw = this.w / 2 / c.s, hh = this.h / 2 / c.s, E = OFF - 24;   // never look beyond the painted raster
    const minX = -E + hw, maxX = WORLD.w + E - hw, minY = -E + hh, maxY = WORLD.h + E - hh;
    c.x = minX > maxX ? WORLD.w / 2 : clamp(c.x, minX, maxX); c.y = minY > maxY ? WORLD.h / 2 : clamp(c.y, minY, maxY);
  }
  toScreen(x, y) { return [(x - this.cam.x) * this.cam.s + this.w / 2, (y - this.cam.y) * this.cam.s + this.h / 2]; }
  toWorld(px, py) { return [(px - this.w / 2) / this.cam.s + this.cam.x, (py - this.h / 2) / this.cam.s + this.cam.y]; }
  get zoomRel() { return this.cam.s / this.fit; }
  get level() { const z = this.zoomRel; return z < 1.9 ? 'world' : z < 5.5 ? 'region' : 'location'; }
  regionAtCenter() { const { x, y } = this.cam; let best = null, bd = 1e9; for (const r of this.regions) { const [a, b, c, d] = r.bounds; if (x >= a && x <= c && y >= b && y <= d) { const dd = Math.hypot(x - (a + c) / 2, y - (b + d) / 2); if (dd < bd) { bd = dd; best = r; } } } return best; }

  flyTo(x, y, s, { dur, instant = false } = {}) {
    s = clamp(s, this.minS, this.maxS);
    if (instant || this.reduced) { this.cam.x = x; this.cam.y = y; this.cam.s = s; this._clamp(); this._stopAnim(); this.dirty = true; this._emitView(); return Promise.resolve(); }
    const c = this.cam; const dist = Math.hypot((x - c.x) * c.s, (y - c.y) * c.s);
    const d = dur ?? clamp(0.7 + dist / 1800 + Math.abs(Math.log(s / c.s)) * 0.28, 0.8, 2.4);
    return new Promise((res) => { this._stopAnim(); this.anim = { x0: c.x, y0: c.y, ls0: Math.log(c.s), x1: x, y1: y, ls1: Math.log(s), t: 0, d, res }; this.vel.x = this.vel.y = 0; });
  }
  /** Stop any camera flight; its promise still resolves so nothing awaiting it can hang. */
  _stopAnim() { const a = this.anim; this.anim = null; if (a) a.res(); }
  goWorld(instant = false) { return this.flyTo(this.portrait ? PORTRAIT_X : WORLD.w / 2, this.portrait ? WORLD.h / 2 - (this.topPad || 0) / 2 / this.fit : WORLD.h / 2 - (this.topPad || 0) / 2 / this.fit, this.fit, { instant }); }
  flyToLocation(id, { zoom = 6.2, instant = false, dur, shift = [0, 0] } = {}) { const l = this.locs.find((q) => q.id === id); if (!l) return Promise.resolve(); const s = this.fit * zoom; return this.flyTo(l.at[0] - shift[0] / s, l.at[1] - shift[1] / s, s, { instant, dur }); }
  flyToRegion(id, opts = {}) {
    const r = this.regions.find((q) => q.id === id); if (!r) return Promise.resolve(); const [a, b, c, d] = r.bounds;
    const s = Math.min(this.w / ((c - a) * 1.35), this.h / ((d - b) * 1.35)); return this.flyTo((a + c) / 2, (b + d) / 2, s, opts);
  }
  zoomBy(f, px = this.w / 2, py = this.h / 2) {
    const [wx, wy] = this.toWorld(px, py); this.cam.s = clamp(this.cam.s * f, this.minS, this.maxS);
    this.cam.x = wx - (px - this.w / 2) / this.cam.s; this.cam.y = wy - (py - this.h / 2) / this.cam.s; this._clamp(); this.dirty = true; this._emitView();
  }
  panBy(dx, dy) { this.cam.x += dx / this.cam.s; this.cam.y += dy / this.cam.s; this._clamp(); this.dirty = true; this._emitView(); }

  /* ---------- state setters ---------- */
  setLang(l) { this.lang = l; this.measure.clear(); this.dirty = true; }
  setFilter(kinds) { this.kinds = kinds; this.dirty = true; }
  setQuery(ids) { this.query = ids; this.dirty = true; }
  setSelected(id) { this.selected = id; this.dirty = true; }
  setRoutes(routes, show) { this.routes = routes; this.showRoutes = show; this.dirty = true; }
  _visible(l) { return (!this.only3d || l.explorable) && (!this.kinds || this.kinds.has(l.kind)) && (!this.query || this.query.has(l.id)); }
  setOnly3d(on) { this.only3d = on; this.dirty = true; }
  _emitView() { this.cb.onView?.({ cam: { ...this.cam }, level: this.level, zoomRel: this.zoomRel, region: this.regionAtCenter()?.id || null, unitPx: this.cam.s }); }

  /* ---------- input ---------- */
  _bindEvents() {
    const c = this.canvas; c.tabIndex = 0; c.style.touchAction = 'none';
    const pos = (e) => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    c.addEventListener('pointerdown', (e) => {
      c.setPointerCapture(e.pointerId); const [x, y] = pos(e); this.pointers.set(e.pointerId, { x, y, sx: x, sy: y, t: performance.now() });
      this._stopAnim(); this.vel.x = this.vel.y = 0; this.moved = false; c.classList.add('grab');
      if (this.pointers.size === 2) { const [a, b] = [...this.pointers.values()]; this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: this.cam.s }; this.moved = true; }
    });
    c.addEventListener('pointermove', (e) => {
      const [x, y] = pos(e); const p = this.pointers.get(e.pointerId);
      if (!p) { this._hoverAt(x, y, e); return; }
      const dx = x - p.x, dy = y - p.y;
      if (this.pointers.size === 1) { if (Math.hypot(x - p.sx, y - p.sy) > 4) this.moved = true; if (this.moved) { this.cam.x -= dx / this.cam.s; this.cam.y -= dy / this.cam.s; this.vel.x = -dx / this.cam.s; this.vel.y = -dy / this.cam.s; this._clamp(); this.dirty = true; this._emitView(); } }
      else if (this.pointers.size === 2 && this.pinch) {
        p.x = x; p.y = y; const [a, b] = [...this.pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const target = this.pinch.s * (d / this.pinch.d); this.zoomBy(target / this.cam.s, mx, my); this.cam.x -= (dx / 2) / this.cam.s; this.cam.y -= (dy / 2) / this.cam.s; this._clamp(); return;
      }
      p.x = x; p.y = y;
    });
    const up = (e) => {
      const p = this.pointers.get(e.pointerId); this.pointers.delete(e.pointerId); if (this.pointers.size < 2) this.pinch = null;
      if (!this.pointers.size) c.classList.remove('grab');
      if (p && !this.moved && this.pointers.size === 0) this._click(p.x, p.y, e);
    };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    c.addEventListener('pointerleave', () => { if (this.hover) { this.hover = null; this.cb.onHover?.(null); this.dirty = true; } });
    c.addEventListener('wheel', (e) => { e.preventDefault(); const [x, y] = pos(e); const k = Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : (e.deltaMode ? 0.05 : 0.0016))); this._stopAnim(); this.zoomBy(k, x, y); }, { passive: false });
    c.addEventListener('dblclick', (e) => { const [x, y] = pos(e); const hl = this._hit(x, y); if (hl) { this.cb.onSelect?.(hl.id, 'enter'); return; } const [wx, wy] = this.toWorld(x, y); this.flyTo(wx, wy, this.cam.s * 2.2, { dur: 0.7 }); });
    c.addEventListener('keydown', (e) => {
      const st = 60; let used = true;
      if (e.key === 'ArrowLeft') this.panBy(-st, 0); else if (e.key === 'ArrowRight') this.panBy(st, 0); else if (e.key === 'ArrowUp') this.panBy(0, -st); else if (e.key === 'ArrowDown') this.panBy(0, st);
      else if (e.key === '+' || e.key === '=') this.zoomBy(1.35); else if (e.key === '-' || e.key === '_') this.zoomBy(1 / 1.35); else if (e.key === 'Home' || e.key === '0') this.goWorld();
      else if (e.key === ']' || e.key === '[') this._cycleFocus(e.key === ']' ? 1 : -1);
      else if (e.key === 'Enter' && this.focusIdx >= 0 && this._focusList) { const l = this._focusList[this.focusIdx]; if (l) this.cb.onSelect?.(l.id, 'enter'); }
      else used = false;
      if (used) e.preventDefault();
    });
    c.addEventListener('blur', () => { this.focusIdx = -1; this.dirty = true; });
    window.addEventListener('resize', () => this.resize());
    new ResizeObserver(() => this.resize()).observe(c.parentElement);
  }
  _cycleFocus(d) {
    const list = this.locs.filter((l) => this._visible(l)).sort((a, b) => a.at[0] - b.at[0]); this._focusList = list; if (!list.length) return;
    this.focusIdx = (this.focusIdx + d + list.length) % list.length; const l = list[this.focusIdx]; this.hover = l.id; this.cb.onHover?.(l.id, this.toScreen(l.at[0], l.at[1]));
    const [px, py] = this.toScreen(...l.at); if (px < 80 || px > this.w - 80 || py < 80 || py > this.h - 80) this.flyTo(l.at[0], l.at[1], Math.max(this.cam.s, this.fit * 2.2), { dur: 0.7 }); this.dirty = true;
  }
  _hit(px, py, r = 16) {
    let best = null, bd = r * r;
    for (const { l, sx, sy } of this.drawnMarkers || []) { const d = (sx - px) ** 2 + (sy - py) ** 2; if (d < bd) { bd = d; best = l; } }
    if (!best) for (const r of this.natRects || []) if (px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1) return this.locs.find((l) => l.id === r.id);
    return best;
  }
  _regionHit(px, py) { for (const r of this.regionRects) if (px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1) return r.id; return null; }
  _hoverAt(x, y, e) {
    const touch = e?.pointerType === 'touch'; const l = this._hit(x, y, touch ? 26 : 16); const id = l?.id || null;
    const rg = !id ? this._regionHit(x, y) : null; this.canvas.style.cursor = id || rg ? 'pointer' : '';
    if (id !== this.hover) { this.hover = id; this.cb.onHover?.(id, id ? this.toScreen(l.at[0], l.at[1]) : null); this.dirty = true; }
  }
  _click(x, y, e) {
    const l = this._hit(x, y, e.pointerType === 'touch' ? 28 : 18);
    if (l) { this.cb.onSelect?.(l.id, 'click'); return; }
    const rg = this._regionHit(x, y); if (rg) { this.cb.onRegion?.(rg); return; }
    if (this.selected) this.cb.onSelect?.(null, 'click');
  }

  /* ---------- loop ---------- */
  start() { if (this.running) return; this.running = true; this.last = performance.now(); const loop = (now) => { if (!this.running) return; requestAnimationFrame(loop); this._tick(now); }; requestAnimationFrame(loop); }
  stop() { this.running = false; }
  _tick(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.time += dt;
    if (this.anim) {
      const a = this.anim; a.t = Math.min(1, a.t + dt / a.d); const k = ease(a.t);
      this.cam.x = a.x0 + (a.x1 - a.x0) * k; this.cam.y = a.y0 + (a.y1 - a.y0) * k; this.cam.s = Math.exp(a.ls0 + (a.ls1 - a.ls0) * k); this._clamp(); this._emitView();
      if (a.t >= 1) { this.anim = null; a.res(); }
    } else if (!this.pointers.size && (Math.abs(this.vel.x) > 0.02 || Math.abs(this.vel.y) > 0.02)) {
      this.cam.x += this.vel.x; this.cam.y += this.vel.y; this.vel.x *= 0.9; this.vel.y *= 0.9; this._clamp(); this._emitView();
    }
    if (!this.ready || document.hidden || this.paused) return;
    this.render();
  }

  /* ---------- rendering ---------- */
  render() {
    const ctx = this.ctx, { w, h, dpr } = this, cam = this.cam, s = cam.s, t = this.time, px = 1 / s;
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (w / 2 - cam.x * s), dpr * (h / 2 - cam.y * s));
    ctx.imageSmoothingQuality = 'high'; ctx.drawImage(this.base, -OFF, -OFF, WORLD.w + OFF * 2, WORLD.h + OFF * 2);
    const x0 = cam.x - w / 2 / s, x1 = cam.x + w / 2 / s, y0 = cam.y - h / 2 / s, y1 = cam.y + h / 2 / s, zr = s / this.fit;
    // hand-drawn wave marks (sea only) that gently shimmer
    ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(54,86,98,0.42)'; ctx.lineWidth = Math.max(0.35, 1 * px); ctx.beginPath();
    for (const wv of this.waves) { if (wv.x < x0 || wv.x > x1 || wv.y < y0 || wv.y > y1) continue; const o = Math.sin(t * 0.5 + wv.ph) * 0.6; ctx.moveTo(wv.x - wv.l / 2, wv.y + o); ctx.quadraticCurveTo(wv.x - wv.l / 4, wv.y + o - 1.4, wv.x, wv.y + o); ctx.quadraticCurveTo(wv.x + wv.l / 4, wv.y + o + 1.4, wv.x + wv.l / 2, wv.y + o); }
    ctx.stroke();
    // soft shelf wash just offshore (clipped to the sea)
    ctx.save(); ctx.clip(this.seaPath, 'evenodd'); ctx.lineJoin = 'round';
    for (const [wd, a] of [[22, 0.07], [12, 0.09], [5, 0.12]]) { ctx.strokeStyle = `rgba(236,228,196,${a})`; ctx.lineWidth = wd * px; ctx.stroke(this.landPath); }
    ctx.restore();
    // sea lanes (dotted)
    if (zr > 1.1) { ctx.setLineDash([1.5 * px, 6 * px]); ctx.strokeStyle = 'rgba(70,48,26,0.4)'; ctx.lineWidth = 1.3 * px; ctx.beginPath(); for (const l of this.lanes) { ctx.moveTo(l[0][0], l[0][1]); for (const p of l) ctx.lineTo(p[0], p[1]); } ctx.stroke(); ctx.setLineDash([]); }
    // lakes & rivers (thin, slightly irregular blue-sepia ink)
    ctx.fillStyle = 'rgba(150,186,190,0.95)'; ctx.strokeStyle = 'rgba(58,60,50,0.85)'; ctx.lineWidth = Math.max(0.4, 0.9 * px);
    for (const L of LAKES) { ctx.beginPath(); ctx.ellipse(L.c[0], L.c[1], L.rx, L.ry, L.rot || 0, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = 'rgba(214,200,150,0.95)'; for (const L of LAKES) if (L.isle) { const q = L.isle; ctx.beginPath(); ctx.ellipse(q.c[0], q.c[1], q.rx, q.ry, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(62,104,122,0.95)'; ctx.lineJoin = 'round';
    for (const rv of this.rivers) { ctx.lineWidth = Math.max(0.35 + rv.w * 0.15, (0.8 + rv.w * 0.32) * px); ctx.beginPath(); rv.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); }
    // roads / trails: dotted sepia
    if (zr > 1.5) { ctx.fillStyle = 'rgba(86,54,26,0.7)'; ctx.strokeStyle = 'rgba(86,54,26,0.62)'; ctx.lineCap = 'round'; for (const rd of this.roads) { ctx.setLineDash(rd.style === 'trail' ? [0.1, 4.5 * px] : [0.1, 3 * px]); ctx.lineWidth = (rd.style === 'trail' ? 1.6 : 2) * px; ctx.beginPath(); rd.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); } ctx.setLineDash([]); }
    // coast: layered, slightly misregistered sepia ink (hand-inked feel)
    ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(62,40,20,0.16)'; ctx.lineWidth = 3.4 * px; ctx.stroke(this.landPath);
    ctx.strokeStyle = 'rgba(58,36,18,0.82)'; ctx.lineWidth = Math.max(0.4, 1.05 * px); ctx.stroke(this.landPath);
    ctx.save(); ctx.translate(0.35 * px, 0.3 * px); ctx.strokeStyle = 'rgba(58,36,18,0.3)'; ctx.lineWidth = Math.max(0.3, 0.8 * px); ctx.stroke(this.landPath); ctx.restore();
    this._drawCompass(ctx, px, zr);
    this._drawGlyphs(ctx, zr, x0, x1, y0, y1);
    this._drawWall(ctx, px, s);
    if (this.showRoutes && this.routes) this._drawRoutes(ctx, px, t);
    for (const sh of this.ships) { sh.u = (sh.u + sh.v * 0.016 + 1) % 1; const p = pointAlong(this.lanes[sh.lane], sh.u * sh.len); this._ship(ctx, p.x, p.z, px, t, zr); }
    // screen space
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5; ctx.fillStyle = this.grain; ctx.fillRect(0, 0, w, h); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.45; ctx.translate(37, 91); ctx.scale(2.1, 2.1); ctx.fillStyle = this.grain; ctx.fillRect(-40, -100, w, h); ctx.restore();
    this._drawLabels(ctx);
    this._drawFrame(ctx);
  }
  /** Antique compass rose with rhumb lines, drawn in the Summer Sea (world units). */
  _drawCompass(ctx, px, zr) {
    const [cx, cy] = COMPASS, R = 92, a = clamp(1.5 - zr * 0.22, 0.25, 1);
    ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
    // rhumb lines
    for (let i = 0; i < 32; i++) {
      const ang = (i / 32) * Math.PI * 2, main = i % 4 === 0;
      ctx.strokeStyle = main ? 'rgba(70,46,24,0.2)' : 'rgba(70,46,24,0.1)'; ctx.lineWidth = (main ? 1.1 : 0.7) * px;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * R * 0.95, cy + Math.sin(ang) * R * 0.95); ctx.lineTo(cx + Math.cos(ang) * 1900, cy + Math.sin(ang) * 1900); ctx.stroke();
    }
    // rings + ticks
    ctx.strokeStyle = 'rgba(60,38,18,0.75)'; ctx.lineWidth = 1.2 * px;
    for (const r of [R * 0.98, R * 0.9, R * 0.36]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); }
    ctx.lineWidth = 0.8 * px; ctx.beginPath();
    for (let i = 0; i < 64; i++) { const ang = (i / 64) * Math.PI * 2, l = i % 4 === 0 ? 0.08 : 0.04; ctx.moveTo(cx + Math.cos(ang) * R * 0.9, cy + Math.sin(ang) * R * 0.9); ctx.lineTo(cx + Math.cos(ang) * R * (0.9 + l), cy + Math.sin(ang) * R * (0.9 + l)); }
    ctx.stroke();
    // star points: 8 minor, 4 diagonal, 4 cardinal (drawn back to front), each split light/dark
    const pt = (ang, len, wdt, dark, light) => {
      const tx = cx + Math.cos(ang) * len, ty = cy + Math.sin(ang) * len, lx = cx + Math.cos(ang - Math.PI / 2) * wdt, ly = cy + Math.sin(ang - Math.PI / 2) * wdt, rx = cx + Math.cos(ang + Math.PI / 2) * wdt, ry = cy + Math.sin(ang + Math.PI / 2) * wdt;
      ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(lx, ly); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
      ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx, ry); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(52,32,14,0.85)'; ctx.lineWidth = 0.9 * px; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); ctx.lineTo(rx, ry); ctx.stroke();
    };
    for (let i = 0; i < 8; i++) pt((i / 8) * Math.PI * 2 + Math.PI / 8 - Math.PI / 2, R * 0.5, R * 0.07, '#8a6a42', '#efe3c4');
    for (let i = 0; i < 4; i++) pt((i / 4) * Math.PI * 2 + Math.PI / 4 - Math.PI / 2, R * 0.7, R * 0.1, '#5e3b1e', '#e8d7ad');
    for (let i = 0; i < 4; i++) pt((i / 4) * Math.PI * 2 - Math.PI / 2, R * 1.08, R * 0.13, i === 0 ? '#7d2a1b' : '#3c2614', i === 0 ? '#c0573f' : '#f1e6c8');
    ctx.fillStyle = '#7d2a1b'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.05, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(52,32,14,0.9)'; ctx.font = FONT(R * 0.2, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.lang === 'zh' ? '北' : 'N', cx, cy - R * 1.24);
    ctx.restore();
  }
  _drawGlyphs(ctx, zr, x0, x1, y0, y1) {
    // glyphs keep a roughly constant ON-SCREEN size (like drawn atlas symbols) and grow only sub-linearly with zoom
    const S = this.sprites, sc = this.fit * 1.55 * clamp(Math.pow(zr, 0.5), 0.9, 2.6) / this.cam.s, pad = 40 / this.cam.s;
    for (const g of this.glyphs) {
      if (g.x < x0 - pad || g.x > x1 + pad || g.y < y0 - pad || g.y > y1 + pad) continue;
      const t = g.t; if ((t === 'pine' || t === 'oak' || t === 'palm') && zr < 1.05) continue; if ((t === 'reeds' || t === 'dune') && zr < 1.4) continue;
      const arr = S[t], img = arr[g.v % arr.length], hh = SPRITE_H[t] * g.s * sc, ww = hh * img.width / img.height;
      ctx.drawImage(img, g.x - ww / 2, g.y - hh * 0.94, ww, hh);
    }
  }
  _drawWall(ctx, px, s) {
    const [a, b] = WALL; ctx.lineCap = 'butt';
    ctx.strokeStyle = 'rgba(52,40,34,0.9)'; ctx.lineWidth = 4.2 * px + 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.strokeStyle = '#f2f6f6'; ctx.lineWidth = 2.6 * px + 0.7; ctx.stroke();
    ctx.strokeStyle = 'rgba(120,150,170,0.9)'; ctx.lineWidth = 0.9 * px + 0.2; ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'round';
  }
  _drawRoutes(ctx, px, t) {
    for (const r of this.routes) {
      const pts = r.pts; if (!pts || pts.length < 2) continue;
      ctx.strokeStyle = r.color; ctx.lineWidth = 2.2 * px; ctx.globalAlpha = 0.9; ctx.setLineDash([7 * px, 5 * px]); ctx.lineDashOffset = -t * 14 * px;
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      const L = polyLength(pts), q = pointAlong(pts, ((t * 0.05) % 1) * L); ctx.fillStyle = r.color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2 * px; ctx.beginPath(); ctx.arc(q.x, q.z, 3.2 * px, 0, 7); ctx.fill(); ctx.stroke();
    }
  }
  _ship(ctx, x, y, px, t, zr) { const k = clamp(zr, 0.9, 3) * 7; ctx.drawImage(this.sprites.galleon, x - k / 2, y - k * 0.8 + Math.sin(t * 1.3 + x) * 0.25, k, k * 56 / 60); }

  /* ---- markers + decluttered labels (screen space) ---- */
  _textW(txt, font) { const key = font + '|' + txt; let v = this.measure.get(key); if (v === undefined) { this.ctx.font = font; v = this.ctx.measureText(txt).width; this.measure.set(key, v); } return v; }
  _drawLabels(ctx) {
    const { w, h } = this, zr = this.zoomRel, lang = this.lang;
    this.regionRects = []; const placed = [];
    const overlap = (r) => placed.some((p) => r.x0 < p.x1 && r.x1 > p.x0 && r.y0 < p.y1 && r.y1 > p.y0);
    ctx.textBaseline = 'middle';
    // sea names
    const seaBig = clamp(1.4 - zr * 0.28, 0, 1), seaSmall = clamp((zr - 1.25) / 0.4, 0, 1) * clamp((7 - zr) / 2, 0, 1);
    for (const sea of SEAS) {
      if ((this._placeNameSet ||= new Set(this.locs.map((l) => l.names.en.toLowerCase().replace(/^the\s+/, '')))).has(sea.names.en.toLowerCase().replace(/^the\s+/, ''))) continue; // a gazetteer place with this name draws its own label
      const seaA = sea.size >= 18 ? seaBig : seaSmall; if (seaA < 0.02) continue;
      const [sx, sy] = this.toScreen(sea.at[0], sea.at[1]); if (sx < -200 || sx > w + 200 || sy < -100 || sy > h + 100) continue;
      const px = Math.max(10, sea.size * this.cam.s * 0.9 * 0.55 + sea.size * 0.2), txt = sea.names[lang]; ctx.save(); ctx.translate(sx, sy); ctx.rotate(sea.rot); ctx.font = FONT(Math.min(px, 34), 500, true); ctx.fillStyle = `rgba(40,70,86,${0.78 * seaA})`; ctx.textAlign = 'center';
      if (lang === 'en') ctx.letterSpacing = `${Math.round(px * 0.22)}px`; else ctx.letterSpacing = `${Math.round(px * 0.5)}px`; ctx.fillText(txt, 0, 0); ctx.restore();
    }
    ctx.letterSpacing = '0px';
    // region names (fade as you zoom into locations)
    const ca = clamp((1.65 - zr) / 0.45, 0, 1);
    if (ca > 0.02) for (const c of CONTINENTS) {
      const [sx, sy] = this.toScreen(c.at[0], c.at[1]), px = c.size * this.cam.s * 0.9; ctx.save(); ctx.translate(sx, sy); ctx.rotate(c.rot || 0); ctx.font = FONT(px, 700); ctx.textAlign = 'center'; ctx.letterSpacing = `${Math.round(px * 0.3)}px`;
      const txt = lang === 'zh' ? c.names.zh : c.names.en.toUpperCase(); const onSea = !!c.rot; ctx.fillStyle = onSea ? `rgba(40,70,86,${0.6 * ca})` : `rgba(100,58,30,${0.55 * ca})`; ctx.fillText(txt, 0, 0); ctx.restore();
    }
    ctx.letterSpacing = '0px';
    const regA = (zr < 3.2 ? 1 : clamp(1 - (zr - 3.2) / 2.2, 0, 1)) * clamp((zr - 1.25) / 0.5, 0, 1);
    const BIG = new Set(['north', 'free-cities', 'dothraki-sea', 'far-east', 'reach', 'dorne']);
    if (regA > 0.03) for (const r of this.regions) {
      if (zr < 1.9 && !BIG.has(r.id)) continue;
      const [sx, sy] = this.toScreen(r.label[0], r.label[1]); if (sx < -200 || sx > w + 200 || sy < -80 || sy > h + 80) continue;
      const px = clamp(r.size * Math.sqrt(this.cam.s / this.fit) * 0.62, 9, 30), txt = lang === 'zh' ? r.names.zh : r.names.en.toUpperCase();
      ctx.font = FONT(px, 600); ctx.letterSpacing = lang === 'zh' ? `${Math.round(px * 0.35)}px` : `${Math.round(px * 0.16)}px`; const tw = ctx.measureText(txt).width;
      ctx.textAlign = 'center'; ctx.lineWidth = 3.2; ctx.strokeStyle = `rgba(238,224,188,${0.75 * regA})`; ctx.strokeText(txt, sx, sy); ctx.fillStyle = `rgba(112,42,24,${0.9 * regA})`; ctx.fillText(txt, sx, sy);
      this.regionRects.push({ id: r.id, x0: sx - tw / 2, x1: sx + tw / 2, y0: sy - px / 2, y1: sy + px / 2 }); placed.push({ x0: sx - tw / 2, x1: sx + tw / 2, y0: sy - px / 2, y1: sy + px / 2 });
    }
    ctx.letterSpacing = '0px';
    // nature labels (rivers, mountains, forests, islands, lakes…) — italic map lettering, no marker
    this.natRects = []; this.drawnMarkers = [];
    const NAT = { river: 'rgba(36,82,104,', lake: 'rgba(36,82,104,', bay: 'rgba(36,70,90,', island: 'rgba(52,34,18,', mountain: 'rgba(96,58,30,', pass: 'rgba(96,58,30,', forest: 'rgba(42,74,40,', swamp: 'rgba(52,78,56,', desert: 'rgba(120,70,30,' };
    const items = [], nat = [];
    for (const l of this.locs) {
      if (!this._visible(l)) continue; const [sx, sy] = this.toScreen(l.at[0], l.at[1]); if (sx < -80 || sx > w + 80 || sy < -40 || sy > h + 40) continue;
      (NAT[l.kind] ? nat : items).push({ l, sx, sy });
    }
    nat.sort((a, b) => b.l.rank - a.l.rank);
    for (const { l, sx, sy } of nat) {
      const sel = l.id === this.selected, hov = l.id === this.hover;
      if (!(this.debugAll || sel || hov || zr >= (NATURE_MIN[l.rank] ?? 5))) continue;
      const px = l.rank >= 4 ? 14 : l.rank === 3 ? 12.5 : 11.5, txt = lang === 'zh' ? l.names.zh : (l.kind === 'mountain' || l.kind === 'desert' ? l.names.en.toUpperCase() : l.names.en);
      const font = FONT(px, l.kind === 'mountain' ? 600 : 500, l.kind !== 'mountain' && l.kind !== 'desert'); ctx.font = font; ctx.letterSpacing = l.kind === 'mountain' || l.kind === 'desert' ? '2px' : '0.5px';
      const tw = ctx.measureText(txt).width, rect = { x0: sx - tw / 2 - 2, x1: sx + tw / 2 + 2, y0: sy - px * 0.6, y1: sy + px * 0.6 };
      if (!this.debugAll && !sel && !hov && overlap(rect)) { ctx.letterSpacing = '0px'; continue; }
      placed.push(rect); this.natRects.push({ id: l.id, ...rect });
      ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(236,224,190,0.7)'; ctx.strokeText(txt, sx, sy);
      ctx.fillStyle = (NAT[l.kind] || 'rgba(52,34,18,') + (sel || hov ? '1)' : '0.88)'); ctx.fillText(txt, sx, sy);
      if (sel || hov) { ctx.strokeStyle = 'rgba(125,42,27,0.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(rect.x0, rect.y1 + 1); ctx.lineTo(rect.x1, rect.y1 + 1); ctx.stroke(); }
      ctx.letterSpacing = '0px';
    }
    // settlement markers (+ labels by priority, decluttered)
    items.sort((a, b) => (b.l.explorable ? 1 : 0) - (a.l.explorable ? 1 : 0) || b.l.rank - a.l.rank || (a.l.id === this.selected ? -1 : 0));
    for (const it of items) {
      const { l, sx, sy } = it, sel = l.id === this.selected, hov = l.id === this.hover;
      if (!(this.debugAll || sel || hov || l.explorable || zr >= (MARKER_MIN[l.rank] ?? 4) || (this.query && this.query.has(l.id)))) continue;
      const r = (l.rank >= 5 ? 8.5 : l.rank === 4 ? 7 : l.rank === 3 ? 5.8 : l.rank === 2 ? 4.8 : 4);
      const dimmed = this.dim && !sel;
      this._marker(ctx, l.kind, sx, sy, r, sel, hov, l.id === this.focusLabel, dimmed);
      if (l.explorable) this._badge3d(ctx, sx, sy, r);
      this.drawnMarkers.push({ l, sx, sy });
      placed.push({ x0: sx - r, x1: sx + r, y0: sy - r, y1: sy + r });
      const labelOk = this.debugAll || sel || hov || (l.explorable && (this.only3d || zr >= 1.6)) || zr >= (LABEL_MIN[l.rank] ?? 4) || (this.query && this.query.has(l.id));
      if (!labelOk) continue;
      const px = l.rank >= 5 ? 16 : l.rank === 4 ? 14.5 : l.rank === 3 ? 13 : 12, font = FONT(px, l.rank >= 4 ? 700 : 600), txt = l.names[lang]; const tw = this._textW(txt, font);
      const spots = [[r + 5, 0, 'left'], [-r - 5, 0, 'right'], [0, -r - 9, 'center'], [0, r + 10, 'center']];
      let ok = null;
      for (const [dx, dy, al] of spots) { const x0 = al === 'left' ? sx + dx : al === 'right' ? sx + dx - tw : sx - tw / 2, rect = { x0: x0 - 2, x1: x0 + tw + 2, y0: sy + dy - px * 0.6, y1: sy + dy + px * 0.6 }; if (this.debugAll || sel || hov || !overlap(rect)) { ok = { rect, dx, dy, al }; break; } }
      if (!ok) continue;
      placed.push(ok.rect); ctx.font = font; ctx.textAlign = ok.al;
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(240,226,190,0.9)'; ctx.lineJoin = 'round'; ctx.strokeText(txt, sx + ok.dx, sy + ok.dy);
      ctx.fillStyle = sel ? '#7d1f10' : INK; if (dimmed) ctx.globalAlpha = 0.5; ctx.fillText(txt, sx + ok.dx, sy + ok.dy); ctx.globalAlpha = 1;
    }
    this._drawFeatureLabels(ctx, placed, overlap);
  }
  /** Fallback labels for named geography in geo.js FEATURES that no place record covers yet (same id or same English name → skipped).
   *  Faint italic, drawn last and only where nothing else is. */
  _drawFeatureLabels(ctx, placed, overlap) {
    const { w, h } = this, zr = this.zoomRel, lang = this.lang; if (zr < 1.2) return;
    if (this._featLocs !== this.locs) { this._featLocs = this.locs; const ids = new Set(), en = new Set(); for (const l of this.locs) { ids.add(l.id); en.add(String(l.names?.en || '').toLowerCase().replace(/^the /, '')); } this._features = FEATURES.filter((f) => !ids.has(f.id) && !en.has(f.names.en.toLowerCase().replace(/^the /, ''))); }
    for (const f of this._features) {
      const min = FEATURE_MIN[f.kind] ?? 3; if (zr < min || !f.at) continue;
      const a = clamp((zr - min) / 0.4, 0, 1) * (f.kind === 'range' || f.kind === 'desert' ? clamp((9 - zr) / 3, 0, 1) : 1); if (a < 0.05) continue;
      const [sx, sy] = this.toScreen(f.at[0], f.at[1]); if (sx < -100 || sx > w + 100 || sy < -40 || sy > h + 40) continue;
      const water = f.kind === 'river' || f.kind === 'lake', big = f.kind === 'range' || f.kind === 'desert', px = big ? 12.5 : 11;
      const txt = lang === 'zh' ? f.names.zh : big ? f.names.en.toUpperCase() : f.names.en;
      ctx.font = FONT(px, 600, !big); ctx.letterSpacing = big ? '2px' : '0.5px'; const tw = ctx.measureText(txt).width;
      const rect = { x0: sx - tw / 2 - 2, x1: sx + tw / 2 + 2, y0: sy - px * 0.6, y1: sy + px * 0.6 }; if (overlap(rect)) { ctx.letterSpacing = '0px'; continue; } placed.push(rect);
      ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = `rgba(238,226,192,${0.6 * a})`; ctx.strokeText(txt, sx, sy);
      ctx.fillStyle = water ? `rgba(36,78,100,${0.85 * a})` : `rgba(92,60,30,${0.8 * a})`; ctx.fillText(txt, sx, sy); ctx.letterSpacing = '0px';
    }
  }
  /** Gold '3D' tab on markers of places that open an explorable 3D scene. */
  _badge3d(ctx, x, y, r) {
    const bx = x + r * 0.55, by = y - r - 9, w = 19, h = 12;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 3;
    ctx.fillStyle = '#e8c26a'; ctx.strokeStyle = '#3a2616'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(bx, by, w, h, 3); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke();
    ctx.fillStyle = '#2b1b0c'; ctx.font = '700 9px -apple-system, "Segoe UI", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('3D', bx + w / 2, by + h / 2 + 0.5);
    ctx.restore(); ctx.textBaseline = 'middle';
  }
  _marker(ctx, kind, x, y, r, sel, hov, focus, dim) {
    const t = this.time;
    if (sel) { const pr = r + 7 + Math.sin(t * 3) * 2; const g = ctx.createRadialGradient(x, y, r, x, y, pr + 10); g.addColorStop(0, 'rgba(255,214,120,0.75)'); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, pr + 10, 0, 7); ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, pr, 0, 7); ctx.stroke(); }
    if (hov || focus) { ctx.strokeStyle = 'rgba(255,230,160,0.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 7); ctx.stroke(); }
    ctx.globalAlpha = dim ? 0.55 : 1; ctx.lineJoin = 'round'; ctx.lineWidth = 1.5; ctx.strokeStyle = INK;
    const fill = sel ? '#ffe39a' : '#f3e6c2';
    if (kind === 'city') { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, 7); ctx.fillStyle = RED; ctx.fill(); ctx.strokeStyle = 'rgba(58,44,27,0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r + 2.6, 0, 7); ctx.stroke(); }
    else if (kind === 'castle') { const k = r * 0.95; ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x - k, y + k); ctx.lineTo(x - k, y - k * 0.35); ctx.lineTo(x - k * 0.55, y - k * 0.35); ctx.lineTo(x - k * 0.55, y - k); ctx.lineTo(x - k * 0.2, y - k); ctx.lineTo(x - k * 0.2, y - k * 0.35); ctx.lineTo(x + k * 0.2, y - k * 0.35); ctx.lineTo(x + k * 0.2, y - k); ctx.lineTo(x + k * 0.55, y - k); ctx.lineTo(x + k * 0.55, y - k * 0.35); ctx.lineTo(x + k, y - k * 0.35); ctx.lineTo(x + k, y + k); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (kind === 'ruin') { const k = r * 0.9; ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x - k, y + k); ctx.lineTo(x - k, y - k * 0.2); ctx.lineTo(x - k * 0.3, y - k); ctx.lineTo(x, y - k * 0.2); ctx.lineTo(x + k * 0.45, y - k * 0.7); ctx.lineTo(x + k, y - k * 0.1); ctx.lineTo(x + k, y + k); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (kind === 'sacred') { ctx.fillStyle = fill; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283 - 1.57, rr = i % 2 ? r * 0.55 : r * 1.12; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (kind === 'village') { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, 7); ctx.fill(); }
    else if (kind === 'inn') { const k = r * 0.7; ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x - k, y + k); ctx.lineTo(x - k, y - k * 0.1); ctx.lineTo(x, y - k); ctx.lineTo(x + k, y - k * 0.1); ctx.lineTo(x + k, y + k); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (kind === 'landmark') { const k = r * 0.9; ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x - k * 0.4, y + k); ctx.lineTo(x - k * 0.22, y - k * 0.7); ctx.lineTo(x, y - k); ctx.lineTo(x + k * 0.22, y - k * 0.7); ctx.lineTo(x + k * 0.4, y + k); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (kind === 'battle') { const k = r * 0.8; ctx.strokeStyle = RED; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - k, y - k); ctx.lineTo(x + k, y + k); ctx.moveTo(x + k, y - k); ctx.lineTo(x - k, y + k); ctx.stroke(); }
    else { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r * 0.78, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  _drawFrame(ctx) {
    const { w, h } = this, m = 10;
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.8); vg.addColorStop(0, 'rgba(60,34,12,0)'); vg.addColorStop(1, 'rgba(60,34,12,0.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(52,32,14,0.9)'; ctx.lineWidth = 2; ctx.strokeRect(m + 0.5, m + 0.5, w - 2 * m, h - 2 * m); ctx.strokeStyle = 'rgba(52,32,14,0.6)'; ctx.lineWidth = 1; ctx.strokeRect(m + 5.5, m + 5.5, w - 2 * m - 10, h - 2 * m - 10);
    ctx.strokeStyle = 'rgba(52,32,14,0.55)'; ctx.beginPath(); const step = 24; for (let x = m + step; x < w - m; x += step) { const len = ((x - m) / step) % 5 === 0 ? 5 : 3; ctx.moveTo(x, m + 1); ctx.lineTo(x, m + 1 + len); ctx.moveTo(x, h - m - 1); ctx.lineTo(x, h - m - 1 - len); } for (let y = m + step; y < h - m; y += step) { const len = ((y - m) / step) % 5 === 0 ? 5 : 3; ctx.moveTo(m + 1, y); ctx.lineTo(m + 1 + len, y); ctx.moveTo(w - m - 1, y); ctx.lineTo(w - m - 1 - len, y); } ctx.stroke();
    for (const [cx, cy, sx, sy] of [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]]) { ctx.strokeStyle = 'rgba(110,40,22,0.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx, cy + sy * 24); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * 24, cy); ctx.stroke(); ctx.fillStyle = 'rgba(110,40,22,0.9)'; ctx.beginPath(); ctx.arc(cx + sx * 6, cy + sy * 6, 2, 0, 7); ctx.fill(); }
  }
}
