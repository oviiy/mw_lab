import { TILE } from '../config.js';
import { T } from '../world/tiles.js';
import { DISTRICT_LIST, DISTRICTS } from '../world/districts.js';
import { FACTIONS } from '../data/factions.js';
import { makeCanvas } from '../render/style.js';
import { findPath, nearestNode } from '../world/roadnet.js';

// Circular radar + a full-map renderer for the PDA. Base map is baked once; turf tint is a cached layer.
const BASE = 0.24;                      // px per world px for the baked map
// roads are the brightest thing on the radar (Chinatown Wars style); blocks stay dark
const COL = { [T.WATER]: '#0d3a5c', [T.ROAD]: '#a9a39a', [T.SIDEWALK]: '#3a3640', [T.PLAZA]: '#4a3a40', [T.PARK]: '#2f5a32', [T.LOT]: '#5a5a62', [T.ALLEY]: '#34303a', [T.PIER]: '#6a5236', [T.BUILDING]: '#16121c', [T.COURT]: '#4a4436', [T.DOCK]: '#4a4c52' };

export class Minimap {
  constructor(game) { this.game = game; this.base = null; this.turf = null; this.turfDirty = true; this.build(); }

  build() {
    const w = this.game.world, S = BASE * TILE;
    const cv = this.base = makeCanvas(w.W * S, w.H * S), g = cv.getContext('2d');
    for (let y = 0; y < w.H; y++) for (let x = 0; x < w.W; x++) { g.fillStyle = COL[w.ground[y * w.W + x]] || '#000'; g.fillRect(x * S, y * S, Math.ceil(S), Math.ceil(S)); }
    for (const b of w.buildings) { g.fillStyle = b.roof; g.globalAlpha = 0.45; g.fillRect(b.x * S, b.y * S, b.w * S, b.d * S); } g.globalAlpha = 1;
    this.scale = BASE;
  }

  rebuildTurf() {
    const w = this.game.world, S = BASE * TILE;
    const cv = this.turf = this.turf || makeCanvas(this.base.width, this.base.height), g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height);
    for (let y = 0; y < w.H; y += 2) for (let x = 0; x < w.W; x += 2) {
      const id = w.turfMap[y * w.W + x]; if (id < 0) continue; const t = w.turfs[id]; if (!t || t.owner === 'none') continue;
      g.fillStyle = FACTIONS[t.owner].color; g.globalAlpha = 0.2; g.fillRect(x * S, y * S, S * 2 + 0.5, S * 2 + 0.5);
    }
    g.globalAlpha = 1; this.turfDirty = false;
  }

  // Route to the active target, recomputed at most twice a second.
  target() {
    const g = this.game, m = g.missions && g.missions.markers().find((q) => !q.small);
    return m ? { x: m.x, y: m.y } : g.waypoint ? { x: g.waypoint.x, y: g.waypoint.y } : null;
  }
  route() {
    const g = this.game, p = g.player, t = this.target(); if (!t || !p || (p.vehicle && p.vehicle.isAir)) return [];
    if (Math.hypot(t.x - p.x, t.y - p.y) < 220) return [];
    this._rt = (this._rt || 0) - 1; const moved = !this._last || Math.hypot(this._last.x - p.x, this._last.y - p.y) > 60 || Math.hypot(this._last.tx - t.x, this._last.ty - t.y) > 30;
    if (this._rt > 0 && !moved && this._path) return this._path;
    this._rt = 30; const w = g.world, a = nearestNode(w, p.x, p.y), b = nearestNode(w, t.x, t.y); if (!a || !b) return [];
    const ids = findPath(w, a.id, b.id); this._path = [{ x: p.x, y: p.y }, ...ids.map((i) => w.nodes[i]), { x: t.x, y: t.y }]; this._last = { x: p.x, y: p.y, tx: t.x, ty: t.y };
    return this._path;
  }

  // Radar draw: north-up circle centred on the player.
  drawRadar(g, size) {
    const game = this.game, p = game.player, c = size / 2; if (!p) return;
    const view = 470, k = size / (view * 2), S = this.scale;
    g.save(); g.clearRect(0, 0, size, size); g.beginPath(); g.arc(c, c, c - 2, 0, 6.283); g.clip();
    g.fillStyle = '#0a0d14'; g.fillRect(0, 0, size, size);
    const sx = (p.x - view) * S, sy = (p.y - view) * S, sw = view * 2 * S;
    g.drawImage(this.base, sx, sy, sw, sw, 0, 0, size, size);
    if (this.turfDirty) this.rebuildTurf();
    if (this.turf) g.drawImage(this.turf, sx, sy, sw, sw, 0, 0, size, size);
    const toR = (x, y) => [c + (x - p.x) * k, c + (y - p.y) * k];
    const dot = (x, y, col, r) => { const [rx, ry] = toR(x, y); if (Math.hypot(rx - c, ry - c) > c - 4) return; g.fillStyle = col; g.beginPath(); g.arc(rx, ry, r, 0, 6.283); g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,0.7)'; g.stroke(); };
    const edge = (x, y, col) => { let [rx, ry] = toR(x, y); const dx = rx - c, dy = ry - c, d = Math.hypot(dx, dy), lim = c - 9; if (d > lim) { rx = c + dx / d * lim; ry = c + dy / d * lim; } g.fillStyle = col; g.beginPath(); g.arc(rx, ry, 5.5, 0, 6.283); g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#000'; g.stroke(); };
    const flash = Math.floor(game.time * 6) & 1;
    // GPS: route along the road graph to the waypoint / current mission target
    const route = this.route(); if (route.length > 1) { g.beginPath(); route.forEach((q, i) => { const [rx, ry] = toR(q.x, q.y); if (i) g.lineTo(rx, ry); else g.moveTo(rx, ry); }); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#ff3dbb'; g.lineWidth = 3.4; g.stroke(); }
    for (const q of game.entities.peds) {
      if (q.dead || q.removed || q === p) continue;
      if (q.role === 'cop' || q.role === 'swat') dot(q.x, q.y, flash ? '#ff4040' : '#4a7cff', 2.8);
      else if (q.role === 'gang' || q.role === 'boss') { if (Math.hypot(q.x - p.x, q.y - p.y) < view * 0.85) dot(q.x, q.y, FACTIONS[q.faction].color, 2.6); }
      else if (q.role === 'dealer') dot(q.x, q.y, '#ffd23a', 3);
    }
    for (const v of game.entities.vehicles) { if (v.removed || v.dead) continue; if ((v.type === 'police' || v.type === 'swat' || v.type === 'armored') && v.driver) dot(v.x, v.y, flash ? '#ff4040' : '#4a7cff', 3.4); else if (v.tag === 'mission') dot(v.x, v.y, '#ffd23a', 3.6); }
    for (const poi of game.world.pois) { if (poi.type === 'eatery') continue; dot(poi.x, poi.y, poi.type === 'contact' ? '#ffd23a' : poi.type === 'safehouse' ? '#2fd07a' : '#e8e4d8', 2.6); }
    if (game.progress) for (const m of game.progress.radar()) if (Math.hypot(m.x - p.x, m.y - p.y) < view) dot(m.x, m.y, m.color, 3.4);
    if (game.missions) for (const m of game.missions.markers()) edge(m.x, m.y, m.color || '#ffd23a');
    // where the police last saw you: a pulsing search circle while you're out of sight
    const W = game.wanted; if (game.wantedLevel > 0 && W && !W.seen && W.lastKnown) { const [sx, sy] = toR(W.lastKnown.x, W.lastKnown.y), pr = (60 + Math.sin(game.time * 4) * 8) * k * 3; g.strokeStyle = flash ? 'rgba(255,70,70,0.9)' : 'rgba(80,120,255,0.9)'; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.arc(sx, sy, pr, 0, 6.283); g.stroke(); g.setLineDash([]); }
    g.restore();
    // player arrow
    g.save(); g.translate(c, c); g.rotate((p.vehicle ? p.vehicle.angle : p.angle)); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(8, 0); g.lineTo(-6, -5.5); g.lineTo(-3, 0); g.lineTo(-6, 5.5); g.closePath(); g.fill(); g.stroke(); g.restore();
  }

  // Full-city map for the PDA. Returns the transform so the UI can convert clicks.
  drawFull(g, w, h, focus) {
    const world = this.game.world, S = Math.min(w / (world.pxW), h / (world.pxH)) * 0.98, ox = (w - world.pxW * S) / 2, oy = (h - world.pxH * S) / 2;
    g.fillStyle = '#070a10'; g.fillRect(0, 0, w, h); g.imageSmoothingEnabled = true;
    g.drawImage(this.base, ox, oy, world.pxW * S, world.pxH * S);
    if (this.turfDirty) this.rebuildTurf(); g.drawImage(this.turf, ox, oy, world.pxW * S, world.pxH * S);
    const tx = (x) => ox + x * S, ty = (y) => oy + y * S;
    // turf outlines + names
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const t of world.turfs) {
      const f = FACTIONS[t.owner]; g.font = '900 12px "Arial Black", Impact, sans-serif'; g.lineWidth = 3.5; g.strokeStyle = '#0a0610'; g.strokeText(t.name.toUpperCase(), tx(t.cx), ty(t.cy) - 10); g.fillStyle = '#fff'; g.fillText(t.name.toUpperCase(), tx(t.cx), ty(t.cy) - 10);
      g.font = '700 10px Arial'; g.fillStyle = f.color; g.strokeText(f.name, tx(t.cx), ty(t.cy) + 4); g.fillText(f.name, tx(t.cx), ty(t.cy) + 4);
      if (t.underAttack) { g.fillStyle = '#ff4040'; g.beginPath(); g.arc(tx(t.cx), ty(t.cy) + 18, 5 + Math.sin(this.game.time * 8) * 1.5, 0, 6.283); g.fill(); }
    }
    for (const poi of world.pois) { if (poi.type === 'eatery') continue; g.fillStyle = poi.type === 'contact' ? '#ffd23a' : poi.type === 'safehouse' ? '#2fd07a' : '#e8e4d8'; g.beginPath(); g.arc(tx(poi.x), ty(poi.y), 3.4, 0, 6.283); g.fill(); g.lineWidth = 1.2; g.strokeStyle = '#000'; g.stroke(); }
    const p = this.game.player; if (p) { g.save(); g.translate(tx(p.x), ty(p.y)); g.rotate(p.vehicle ? p.vehicle.angle : p.angle); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.moveTo(9, 0); g.lineTo(-7, -6); g.lineTo(-3, 0); g.lineTo(-7, 6); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    void focus; void DISTRICTS; void DISTRICT_LIST;
    return { S, ox, oy };
  }
}
