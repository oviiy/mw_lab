import { TILE } from '../config.js';
import { T } from '../world/tiles.js';
import { DISTRICTS, DISTRICT_LIST } from '../world/districts.js';
import { INK, SUN, makeCanvas, hash2, grain } from './style.js';
import { shade, rgba } from '../core/color.js';

// Ground is baked into cached chunk canvases (roads, paving, markings, shadows,
// persistent decals). Water tiles stay transparent: an animated water layer is
// drawn underneath every frame.
export const CHUNK = 12;                       // tiles per chunk edge
const CPX = CHUNK * TILE;                      // chunk size in world px
const BAKE_SCALE = 1.5;                        // canvas px per world px
const MAX_CHUNKS = 54;
const N4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];

export class GroundLayer {
  constructor(world) {
    this.world = world; this.chunks = new Map(); this.tick = 0; this.bakesThisFrame = 0;
    this.cw = Math.ceil(world.W / CHUNK); this.ch = Math.ceil(world.H / CHUNK);
    this.pal = DISTRICT_LIST.map((k) => DISTRICTS[k]);
    this._prepareMarkings();
    // which chunks contain any water (the animated water layer is drawn only there)
    this.wet = new Uint8Array(this.cw * this.ch);
    for (let ty = 0; ty < world.H; ty++) for (let tx = 0; tx < world.W; tx++) if (world.ground[ty * world.W + tx] === T.WATER) this.wet[Math.floor(ty / CHUNK) * this.cw + Math.floor(tx / CHUNK)] = 1;
    this._wetRects = [];
  }
  wetRects(cam) {
    const out = this._wetRects; out.length = 0; const b = cam.bounds(8);
    const c0x = Math.max(0, Math.floor(b.x0 / CPX)), c1x = Math.min(this.cw - 1, Math.floor(b.x1 / CPX));
    const c0y = Math.max(0, Math.floor(b.y0 / CPX)), c1y = Math.min(this.ch - 1, Math.floor(b.y1 / CPX));
    for (let cy = c0y; cy <= c1y; cy++) for (let cx = c0x; cx <= c1x; cx++) if (this.wet[cy * this.cw + cx]) out.push({ x: cx * CPX, y: cy * CPX, w: CPX, h: CPX });
    // outside the map is open sea
    if (b.x0 < 0) out.push({ x: b.x0, y: b.y0, w: -b.x0, h: b.y1 - b.y0 });
    if (b.y0 < 0) out.push({ x: b.x0, y: b.y0, w: b.x1 - b.x0, h: -b.y0 });
    const W = this.world.W * TILE, Hh = this.world.H * TILE;
    if (b.x1 > W) out.push({ x: W, y: b.y0, w: b.x1 - W, h: b.y1 - b.y0 });
    if (b.y1 > Hh) out.push({ x: b.x0, y: Hh, w: b.x1 - b.x0, h: b.y1 - Hh });
    return out;
  }

  /* ---------- markings are derived once from the road graph ---------- */
  _prepareMarkings() {
    const w = this.world, half = new Map();
    for (const n of w.nodes) half.set(n.id, n.edges.reduce((m, e) => Math.max(m, e.w), 0) * TILE / 2);
    this.lines = []; this.cross = [];
    for (const n of w.nodes) {
      for (const e of n.edges) {
        const m = w.nodes[e.to];
        if (n.id < m.id) {
          const ha = half.get(n.id) + 8, hb = half.get(m.id) + 8;
          if (e.len > ha + hb + 20) this.lines.push({ x0: n.x + e.dx * ha, y0: n.y + e.dy * ha, x1: m.x - e.dx * hb, y1: m.y - e.dy * hb, w: e.w, level: e.level, dx: e.dx, dy: e.dy });
        }
        // crosswalk across this arm, just outside the crossing road
        let cross = 0;
        for (const o of n.edges) if (Math.abs(o.dx * e.dx + o.dy * e.dy) < 0.5) cross = Math.max(cross, o.w * TILE / 2);
        if (!cross) cross = e.w * TILE / 2;
        const d = cross + 10;
        if (e.len > d + 30) this.cross.push({ x: n.x + e.dx * d, y: n.y + e.dy * d, a: Math.atan2(e.dy, e.dx), w: e.w * TILE });
      }
    }
  }

  key(cx, cy) { return cy * 1024 + cx; }

  get(cx, cy, bake = true) {
    if (cx < 0 || cy < 0 || cx >= this.cw || cy >= this.ch) return null;
    const k = this.key(cx, cy); let c = this.chunks.get(k);
    if (!c) {
      if (!bake || this.bakesThisFrame >= 3) return null;
      c = { canvas: this.bake(cx, cy), used: this.tick }; this.chunks.set(k, c); this.bakesThisFrame++;
      if (this.chunks.size > MAX_CHUNKS) this._evict();
    }
    c.used = this.tick; return c.canvas;
  }
  _evict() {
    let oldK = null, oldT = Infinity;
    for (const [k, c] of this.chunks) if (c.used < oldT) { oldT = c.used; oldK = k; }
    if (oldK !== null && oldT < this.tick - 2) this.chunks.delete(oldK);
  }

  draw(g, cam) {
    this.tick++; this.bakesThisFrame = 0;
    const b = cam.bounds(8);
    const c0x = Math.max(0, Math.floor(b.x0 / CPX)), c1x = Math.min(this.cw - 1, Math.floor(b.x1 / CPX));
    const c0y = Math.max(0, Math.floor(b.y0 / CPX)), c1y = Math.min(this.ch - 1, Math.floor(b.y1 / CPX));
    for (let cy = c0y; cy <= c1y; cy++) for (let cx = c0x; cx <= c1x; cx++) {
      const c = this.get(cx, cy); if (c) g.drawImage(c, cx * CPX, cy * CPX, CPX, CPX);
    }
  }
  prebake(x, y, radius = 2) {
    const cx0 = Math.floor(x / CPX), cy0 = Math.floor(y / CPX);
    for (let cy = cy0 - radius; cy <= cy0 + radius; cy++) for (let cx = cx0 - radius; cx <= cx0 + radius; cx++) { this.bakesThisFrame = 0; this.get(cx, cy); }
  }

  // Persistent decal: fn(g) is called with world coordinates, in every baked chunk overlapping (x,y,r).
  stamp(x, y, r, fn) {
    const c0x = Math.floor((x - r) / CPX), c1x = Math.floor((x + r) / CPX), c0y = Math.floor((y - r) / CPX), c1y = Math.floor((y + r) / CPX);
    for (let cy = c0y; cy <= c1y; cy++) for (let cx = c0x; cx <= c1x; cx++) {
      const c = this.chunks.get(this.key(cx, cy)); if (!c) continue;
      const g = c.canvas.getContext('2d'); g.save(); g.setTransform(BAKE_SCALE, 0, 0, BAKE_SCALE, -cx * CPX * BAKE_SCALE, -cy * CPX * BAKE_SCALE); fn(g); g.restore();
    }
  }

  /* ---------- baking ---------- */
  bake(cx, cy) {
    const w = this.world, cv = makeCanvas(CPX * BAKE_SCALE, CPX * BAKE_SCALE), g = cv.getContext('2d');
    g.setTransform(BAKE_SCALE, 0, 0, BAKE_SCALE, -cx * CPX * BAKE_SCALE, -cy * CPX * BAKE_SCALE);
    const tx0 = cx * CHUNK, ty0 = cy * CHUNK, tx1 = Math.min(w.W, tx0 + CHUNK), ty1 = Math.min(w.H, ty0 + CHUNK);
    for (let ty = ty0; ty < ty1; ty++) for (let tx = tx0; tx < tx1; tx++) this._tile(g, tx, ty);
    const rect = { x0: cx * CPX, y0: cy * CPX, x1: cx * CPX + CPX, y1: cy * CPX + CPX };
    this._markings(g, rect);
    this._sites(g, rect);
    for (let ty = ty0; ty < ty1; ty++) for (let tx = tx0; tx < tx1; tx++) this._edges(g, tx, ty);
    this._shadows(g, rect);
    for (let ty = ty0; ty < ty1; ty++) for (let tx = tx0; tx < tx1; tx++) this._decals(g, tx, ty);
    // material grain over the whole chunk (water stays transparent)
    g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.38; g.fillStyle = g.createPattern(grain(), 'repeat'); g.fillRect(rect.x0, rect.y0, CPX, CPX); g.restore();
    return cv;
  }

  _tile(g, tx, ty) {
    const w = this.world, t = w.ground[ty * w.W + tx], px = tx * TILE, py = ty * TILE, pal = this.pal[w.district[ty * w.W + tx]];
    const h = (s) => hash2(tx, ty, s);
    switch (t) {
      case T.WATER: return;
      case T.ROAD: {
        g.fillStyle = pal.asphalt; g.fillRect(px, py, TILE, TILE);
        for (let i = 0; i < 6; i++) { g.fillStyle = h(i) < 0.5 ? 'rgba(200,210,255,0.04)' : 'rgba(0,0,0,0.16)'; g.fillRect(px + h(i + 9) * 30, py + h(i + 17) * 30, 1 + h(i + 3) * 2.2, 1 + h(i + 5) * 2); }
        if (h(40) < 0.18) { g.fillStyle = 'rgba(255,255,255,0.025)'; g.fillRect(px, py + h(41) * 26, TILE, 4 + h(42) * 5); }
        if (pal === this.pal[0] || pal === this.pal[2]) { // old-city streets: stone pavers
          g.fillStyle = 'rgba(110,60,70,0.08)'; g.fillRect(px, py, TILE, TILE);
          g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 1;
          for (let r = 0; r < 4; r++) { const y = py + r * 8; g.beginPath(); g.moveTo(px, y + 0.5); g.lineTo(px + TILE, y + 0.5); g.stroke(); for (let x = px + ((r & 1) ? 8 : 0); x < px + TILE; x += 16) { g.beginPath(); g.moveTo(x + 0.5, y); g.lineTo(x + 0.5, y + 8); g.stroke(); } }
          for (let i = 0; i < 4; i++) { g.fillStyle = h(i + 50) < 0.5 ? 'rgba(255,230,200,0.05)' : 'rgba(0,0,0,0.06)'; g.fillRect(px + h(i + 60) * 24, py + h(i + 70) * 24, 7, 7); }
        }
        break;
      }
      case T.SIDEWALK: {
        g.fillStyle = (tx + ty) & 1 ? pal.sidewalk : shade(pal.sidewalk, -0.035); g.fillRect(px, py, TILE, TILE);
        g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(px, py, TILE, 1.5); g.fillRect(px, py, 1.5, TILE);
        g.fillStyle = 'rgba(40,30,20,0.2)'; g.fillRect(px, py + TILE - 1.5, TILE, 1.5); g.fillRect(px + TILE - 1.5, py, 1.5, TILE);
        if (h(1) < 0.2) { g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(px + 3, py + 3, TILE - 6, TILE - 6); }
        break;
      }
      case T.PLAZA: {
        g.fillStyle = pal.plaza; g.fillRect(px, py, TILE, TILE);
        const off = (ty & 1) ? 8 : 0;
        g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 1;
        for (let r = 0; r < 4; r++) { const y = py + r * 8; g.beginPath(); g.moveTo(px, y + 0.5); g.lineTo(px + TILE, y + 0.5); g.stroke(); for (let x = px + ((r & 1) ? off : 8 - off) % 16; x < px + TILE; x += 16) { g.beginPath(); g.moveTo(x + 0.5, y); g.lineTo(x + 0.5, y + 8); g.stroke(); } }
        for (let i = 0; i < 5; i++) { g.fillStyle = h(i) < 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)'; g.fillRect(px + h(i + 4) * 28, py + h(i + 8) * 28, 7, 7); }
        break;
      }
      case T.PARK: {
        g.fillStyle = (tx + ty) & 1 ? '#4c8a46' : '#468240'; g.fillRect(px, py, TILE, TILE);
        for (let i = 0; i < 9; i++) { g.strokeStyle = h(i) < 0.5 ? 'rgba(160,220,110,0.45)' : 'rgba(20,70,30,0.35)'; g.lineWidth = 1.2; const x = px + h(i + 3) * 30, y = py + h(i + 6) * 28; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + (h(i + 20) - 0.5) * 3, y); g.stroke(); }
        if (h(60) < 0.07) { g.fillStyle = 'rgba(255,220,240,0.8)'; g.fillRect(px + h(61) * 28, py + h(62) * 28, 2, 2); }
        break;
      }
      case T.ALLEY: {
        g.fillStyle = '#6a6159'; g.fillRect(px, py, TILE, TILE);
        for (let i = 0; i < 8; i++) { g.fillStyle = h(i) < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.16)'; g.fillRect(px + h(i + 9) * 30, py + h(i + 13) * 30, 2 + h(i + 5) * 5, 2 + h(i + 7) * 4); }
        g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1; if (h(70) < 0.35) { g.beginPath(); g.moveTo(px + h(71) * 32, py); g.lineTo(px + h(72) * 32, py + 32); g.stroke(); }
        if (h(80) < 0.12) { g.fillStyle = 'rgba(70,100,130,0.4)'; g.beginPath(); g.ellipse(px + 16, py + 17, 8 + h(81) * 6, 5 + h(82) * 3, h(83), 0, 6.3); g.fill(); }
        break;
      }
      case T.COURT: {
        g.fillStyle = (tx + ty) & 1 ? '#cdbd90' : '#c3b384'; g.fillRect(px, py, TILE, TILE);
        g.strokeStyle = 'rgba(80,60,30,0.28)'; g.lineWidth = 1.2; g.strokeRect(px + 0.6, py + 0.6, TILE - 1.2, TILE - 1.2);
        g.fillStyle = 'rgba(160,60,40,0.16)'; if ((tx + ty) % 3 === 0) g.fillRect(px + 12, py + 12, 8, 8);
        break;
      }
      case T.LOT: {
        g.fillStyle = pal.asphalt; g.fillRect(px, py, TILE, TILE);
        g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(px, py, TILE, 1);
        if (tx % 3 === 1) { g.fillStyle = 'rgba(235,235,225,0.55)'; g.fillRect(px + 14, py + (ty & 1 ? 0 : 6), 2, 26); }
        for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(px + h(i + 9) * 30, py + h(i + 17) * 30, 2, 2); }
        break;
      }
      case T.PIER: {
        g.fillStyle = '#8a6a44'; g.fillRect(px, py, TILE, TILE);
        for (let r = 0; r < 4; r++) { g.fillStyle = r & 1 ? 'rgba(255,220,160,0.08)' : 'rgba(0,0,0,0.1)'; g.fillRect(px, py + r * 8, TILE, 8); g.fillStyle = 'rgba(30,15,5,0.55)'; g.fillRect(px, py + r * 8, TILE, 1.2); g.fillRect(px + h(r + 30) * 28, py + r * 8 + 3, 1.6, 1.6); }
        break;
      }
      case T.DOCK: {
        g.fillStyle = (tx + ty) & 1 ? '#8e9094' : '#878a8f'; g.fillRect(px, py, TILE, TILE);
        g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(px, py + TILE - 1.5, TILE, 1.5); g.fillRect(px + TILE - 1.5, py, 1.5, TILE);
        if (h(5) < 0.2) { g.fillStyle = 'rgba(40,30,20,0.18)'; g.beginPath(); g.ellipse(px + 16, py + 16, 8, 5, h(6), 0, 6.3); g.fill(); }
        break;
      }
      case T.BUILDING: g.fillStyle = '#241a2a'; g.fillRect(px, py, TILE, TILE); break;
      default: break;
    }
  }

  _markings(g, r) {
    const pad = 40, vis = (x0, y0, x1, y1) => Math.max(x0, x1) > r.x0 - pad && Math.min(x0, x1) < r.x1 + pad && Math.max(y0, y1) > r.y0 - pad && Math.min(y0, y1) < r.y1 + pad;
    g.lineCap = 'butt';
    for (const l of this.lines) {
      if (!vis(l.x0, l.y0, l.x1, l.y1)) continue;
      const nx = -l.dy, ny = l.dx;
      if (l.w >= 5) { // double yellow + white lane edges
        g.strokeStyle = '#ffd23a'; g.lineWidth = 2.2;
        for (const o of [-2.2, 2.2]) { g.beginPath(); g.moveTo(l.x0 + nx * o, l.y0 + ny * o); g.lineTo(l.x1 + nx * o, l.y1 + ny * o); g.stroke(); }
        g.strokeStyle = '#f4f4f4'; g.lineWidth = 1.8;
        const e = l.w * TILE / 2 - 6;
        for (const o of [-e, e]) { g.beginPath(); g.moveTo(l.x0 + nx * o, l.y0 + ny * o); g.lineTo(l.x1 + nx * o, l.y1 + ny * o); g.stroke(); }
      } else if (l.w === 4) { g.strokeStyle = '#ffd23a'; g.lineWidth = 2.2; g.setLineDash([16, 14]); g.beginPath(); g.moveTo(l.x0, l.y0); g.lineTo(l.x1, l.y1); g.stroke(); g.setLineDash([]); }
      else { g.strokeStyle = '#f4f4f4'; g.lineWidth = 2; g.setLineDash([10, 16]); g.beginPath(); g.moveTo(l.x0, l.y0); g.lineTo(l.x1, l.y1); g.stroke(); g.setLineDash([]); }
    }
    for (const c of this.cross) {
      if (c.x < r.x0 - 60 || c.x > r.x1 + 60 || c.y < r.y0 - 60 || c.y > r.y1 + 60) continue;
      g.save(); g.translate(c.x, c.y); g.rotate(c.a);
      g.fillStyle = '#f4f4f4';
      const span = c.w - 10;
      for (let l = -span / 2 + 2; l < span / 2 - 2; l += 9) g.fillRect(-7, l, 14, 5);
      g.fillRect(14, -span / 2, 2.4, span);
      g.restore();
    }
  }

  _edges(g, tx, ty) {
    const w = this.world, t = w.ground[ty * w.W + tx];
    if (t === T.WATER || t === T.BUILDING) return;
    const px = tx * TILE, py = ty * TILE;
    for (let i = 0; i < 4; i++) {
      const nt = w.tileAt(tx + N4[i][0], ty + N4[i][1]);
      const e = (fn) => { g.save(); g.translate(px + TILE / 2, py + TILE / 2); g.rotate(i * Math.PI / 2); fn(); g.restore(); };
      // after rotation the top edge (y = -16) faces direction i
      if (nt === T.ROAD && (t === T.SIDEWALK || t === T.PLAZA || t === T.COURT || t === T.DOCK || t === T.LOT || t === T.PARK)) {
        e(() => { g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(-16, -19, TILE, 3); g.fillStyle = INK; g.globalAlpha = 0.9; g.fillRect(-16, -16, TILE, 2.2); g.globalAlpha = 1; g.fillStyle = 'rgba(255,252,240,0.7)'; g.fillRect(-16, -13.8, TILE, 2.6); g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(-16, -11.2, TILE, 1.5); });
      } else if (nt === T.WATER && t !== T.PIER) {
        e(() => { g.fillStyle = '#2a2f3a'; g.fillRect(-16, -16, TILE, 4); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(-16, -12, TILE, 1.2); g.fillStyle = 'rgba(190,235,255,0.35)'; g.fillRect(-16, -22, TILE, 6); });
      } else if (nt === T.WATER && t === T.PIER) {
        e(() => { g.fillStyle = '#4a3320'; g.fillRect(-16, -16, TILE, 3); g.fillStyle = 'rgba(190,235,255,0.3)'; g.fillRect(-16, -21, TILE, 5); });
      }
    }
  }

  // Airbase runway, helipads and the tank yard.
  _sites(g, r) {
    for (const s of this.world.sites || []) {
      if (s.rect) { const q = s.rect; if (q.x > r.x1 || q.x + q.w < r.x0 || q.y > r.y1 || q.y + q.h < r.y0) continue;
        g.fillStyle = '#5a5d5a'; g.fillRect(q.x, q.y, q.w, q.h);
        g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 1; for (let x = q.x; x < q.x + q.w; x += 64) { g.beginPath(); g.moveTo(x, q.y); g.lineTo(x, q.y + q.h); g.stroke(); } for (let y = q.y; y < q.y + q.h; y += 64) { g.beginPath(); g.moveTo(q.x, y); g.lineTo(q.x + q.w, y); g.stroke(); }
        g.strokeStyle = '#d6c23a'; g.lineWidth = 3; g.setLineDash([14, 10]); g.strokeRect(q.x + 4, q.y + 4, q.w - 8, q.h - 8); g.setLineDash([]);
      }
      if (s.runway) {
        const w = s.runway, h = w.horiz; g.fillStyle = '#2b2a30'; g.fillRect(w.x, w.y, w.w, w.h);
        g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 40; i++) g.fillRect(w.x + hash2(i, 3) * w.w, w.y + hash2(i, 9) * w.h, 6, 2);
        g.fillStyle = '#f4f4f4';
        if (h) { for (let x = w.x + 90; x < w.x + w.w - 90; x += 56) g.fillRect(x, w.y + w.h / 2 - 2, 30, 4); for (const ex of [w.x + 10, w.x + w.w - 40]) for (let k = 0; k < 6; k++) g.fillRect(ex, w.y + 12 + k * ((w.h - 24) / 5) - 2, 30, 5); g.fillRect(w.x, w.y + 3, w.w, 2); g.fillRect(w.x, w.y + w.h - 5, w.w, 2); }
        else { for (let y = w.y + 90; y < w.y + w.h - 90; y += 56) g.fillRect(w.x + w.w / 2 - 2, y, 4, 30); for (const ey of [w.y + 10, w.y + w.h - 40]) for (let k = 0; k < 6; k++) g.fillRect(w.x + 12 + k * ((w.w - 24) / 5) - 2, ey, 5, 30); g.fillRect(w.x + 3, w.y, 2, w.h); g.fillRect(w.x + w.w - 5, w.y, 2, w.h); }
        g.fillStyle = '#ffd23a'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; if (h) g.fillText('09', w.x + 70, w.y + w.h / 2); else g.fillText('18', w.x + w.w / 2, w.y + 70);
      }
      const pad = s.kind === 'depot' ? null : s.pad;
      if (pad && (s.kind === 'airfield' || s.kind === 'helipad')) { if (pad.x < r.x0 - 60 || pad.x > r.x1 + 60 || pad.y < r.y0 - 60 || pad.y > r.y1 + 60) continue;
        g.beginPath(); g.arc(pad.x, pad.y, 46, 0, 6.3); g.fillStyle = '#3a3c44'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#ffd23a'; g.stroke();
        g.fillStyle = '#f4f4f4'; g.font = 'bold 40px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', pad.x, pad.y + 2); }
      if (s.kind === 'depot') { const p = s.pad; if (p.x < r.x0 - 120 || p.x > r.x1 + 120 || p.y < r.y0 - 120 || p.y > r.y1 + 120) continue;
        g.save(); g.beginPath(); g.rect(p.x - 90, p.y - 50, 260, 100); g.clip(); g.fillStyle = '#4a4d3e'; g.fillRect(p.x - 90, p.y - 50, 260, 100);
        g.strokeStyle = '#e0b02a'; g.lineWidth = 8; for (let x = -100; x < 280; x += 24) { g.beginPath(); g.moveTo(p.x - 90 + x, p.y - 50); g.lineTo(p.x - 90 + x + 20, p.y - 30); g.stroke(); }
        g.restore(); g.fillStyle = '#e0b02a'; g.font = 'bold 22px sans-serif'; g.textAlign = 'center'; g.fillText('★ ARMY ★', p.x + 40, p.y + 38); }
    }
  }

  _shadows(g, r) {
    const w = this.world;
    g.save(); g.filter = 'blur(5px)'; g.fillStyle = 'rgba(12,8,30,0.34)';
    g.beginPath();
    for (const b of w.buildings) {
      const x0 = b.x * TILE, y0 = b.y * TILE, x1 = (b.x + b.w) * TILE, y1 = (b.y + b.d) * TILE, len = b.H * 0.78;
      const ox = SUN.x * len, oy = SUN.y * len;
      if (x1 + ox + 20 < r.x0 || x0 - 20 > r.x1 || y1 + oy + 20 < r.y0 || y0 - 20 > r.y1) continue;
      const hull = convexHull([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0 + ox, y0 + oy], [x1 + ox, y0 + oy], [x1 + ox, y1 + oy], [x0 + ox, y1 + oy]]);
      hull.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath();
    }
    g.fill();
    // contact occlusion: a tight dark halo where walls meet the street
    g.filter = 'blur(3px)'; g.strokeStyle = 'rgba(10,6,24,0.42)'; g.lineWidth = 7; g.beginPath();
    for (const b of w.buildings) { const x0 = b.x * TILE, y0 = b.y * TILE, W = b.w * TILE, D = b.d * TILE; if (x0 + W + 10 < r.x0 || x0 - 10 > r.x1 || y0 + D + 10 < r.y0 || y0 - 10 > r.y1) continue; g.rect(x0, y0, W, D); }
    g.stroke(); g.restore();
  }

  _decals(g, tx, ty) {
    const w = this.world, t = w.ground[ty * w.W + tx], px = tx * TILE, py = ty * TILE, h = (s) => hash2(tx, ty, s + 100);
    if (t === T.ROAD) {
      if (h(1) < 0.012) { g.fillStyle = 'rgba(15,12,18,0.55)'; g.beginPath(); g.arc(px + 16, py + 16, 7, 0, 6.3); g.fill(); g.strokeStyle = 'rgba(120,120,130,0.5)'; g.lineWidth = 1.2; g.stroke(); g.beginPath(); g.moveTo(px + 11, py + 16); g.lineTo(px + 21, py + 16); g.moveTo(px + 16, py + 11); g.lineTo(px + 16, py + 21); g.stroke(); }
      else if (h(2) < 0.03) { g.fillStyle = 'rgba(8,8,12,0.28)'; g.beginPath(); g.ellipse(px + h(3) * 30, py + h(4) * 30, 6 + h(5) * 8, 3 + h(6) * 5, h(7) * 3, 0, 6.3); g.fill(); }
      else if (w.districtAt(tx, ty) === 0 && h(8) < 0.03) { g.fillStyle = 'rgba(230,60,50,0.55)'; for (let i = 0; i < 5; i++) g.fillRect(px + h(9 + i) * 30, py + h(14 + i) * 30, 3, 1.6); }
    } else if (t === T.SIDEWALK && h(10) < 0.04) {
      g.fillStyle = h(11) < 0.5 ? 'rgba(240,240,230,0.5)' : 'rgba(40,30,20,0.35)'; g.fillRect(px + h(12) * 28, py + h(13) * 28, 3, 2);
    }
  }
}

function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
function convexHull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const lower = []; for (const pt of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pt) <= 0) lower.pop(); lower.push(pt); }
  const upper = []; for (let i = p.length - 1; i >= 0; i--) { const pt = p[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pt) <= 0) upper.pop(); upper.push(pt); }
  lower.pop(); upper.pop(); return lower.concat(upper);
}
void rgba;
