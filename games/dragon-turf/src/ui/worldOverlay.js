import { INK } from '../render/style.js';

// World-space overlay drawn last: POI markers, interaction ring, aim reticle.
const ICON_COL = { contact: '#ffd23a', safehouse: '#2fd07a', shop_gun: '#ff8a2a', hospital: '#ff5a5a', spray: '#c26bff', chop: '#7fd8ff', police: '#4a7cff', eatery: '#ffcc66', airfield: '#37e6ff', depot: '#9acd32', marina: '#5fd0e0' };

export function drawWorldOverlay(g, cam, game) {
  const p = game.player, world = game.world, t = game.time;
  if (!p) return;
  g.save();
  for (const poi of world.pois) {
    const d = Math.hypot(poi.x - p.x, poi.y - p.y); if (d > 170 || (poi.type === 'eatery' && d > 90)) continue;
    const a = Math.min(1, (170 - d) / 60), bob = Math.sin(t * 3 + poi.id) * 2;
    g.globalAlpha = a; g.save(); g.translate(poi.x, poi.y - 28 + bob);
    g.beginPath(); g.arc(0, 0, 10, 0, 6.283); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(0, 0, 8.4, 0, 6.283); g.fillStyle = ICON_COL[poi.type] || '#fff'; g.fill();
    g.font = '11px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#111'; g.fillText(poi.icon || '•', 0, 1);
    g.beginPath(); g.moveTo(-4, 9); g.lineTo(0, 15); g.lineTo(4, 9); g.fillStyle = INK; g.fill();
    g.restore();
  }
  g.globalAlpha = 1;
  const cur = game.interact.current;
  if (cur && cur.ref && cur.ref.x !== undefined) {
    const r = cur.kind === 'vehicle' ? cur.ref.def.len * 0.62 : 22, pulse = 1 + Math.sin(t * 8) * 0.06;
    g.strokeStyle = '#ffe28a'; g.lineWidth = 2.2; g.setLineDash([6, 5]); g.lineDashOffset = -t * 14; g.beginPath(); g.arc(cur.ref.x, cur.ref.y, r * pulse, 0, 6.283); g.stroke(); g.setLineDash([]);
  }
  if (game.missions) game.missions.drawWorld(g, cam);
  g.restore();
  // screen-space reticle
  if (game.state === 'play' && !p.dead) {
    g.save(); g.setTransform(cam.dpr, 0, 0, cam.dpr, 0, 0);
    const m = game.input.mouse, w = game.player.weaponDef, spread = w.type === 'gun' ? 6 + w.spread * 120 : 7, hot = p.cooldown > 0;
    g.translate(m.x, m.y); g.strokeStyle = 'rgba(0,0,0,0.65)'; g.lineWidth = 4;
    for (const pass of [0, 1]) { g.strokeStyle = pass ? (hot ? '#ff7a5a' : '#ffffff') : 'rgba(0,0,0,0.65)'; g.lineWidth = pass ? 1.8 : 4; g.beginPath(); g.arc(0, 0, spread, 0, 6.283); for (const a of [0, 1.5708, 3.1416, 4.7124]) { g.moveTo(Math.cos(a) * (spread + 2), Math.sin(a) * (spread + 2)); g.lineTo(Math.cos(a) * (spread + 7), Math.sin(a) * (spread + 7)); } g.stroke(); }
    g.restore();
  }
}
