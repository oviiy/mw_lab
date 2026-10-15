import { dist } from '../core/math.js';

// Finds the best thing to use right now and runs it when E is pressed.
export class InteractSystem {
  constructor(game) { this.game = game; this.current = null; this.handlers = {}; }
  register(type, fn) { this.handlers[type] = fn; }

  update() {
    const g = this.game, p = g.player; this.current = null;
    if (!p || p.dead || g.state !== 'play') return;
    if (p.vehicle) { const v = p.vehicle; this.current = { kind: 'exit', label: v.airborne ? 'Bail out (parachute)' : v.cls === 'boat' ? 'Step ashore' : 'Exit vehicle' }; return; }
    let best = null, bd = 1e9;
    const consider = (c, d) => { if (d < bd) { bd = d; best = c; } };
    for (const v of g.entities.vehicles) {
      if (v.removed || v.dead) continue; const reach = v.def.len / 2 + 22, d = dist(v.x, v.y, p.x, p.y); if (d > reach) continue;
      const label = v.driver ? (v.driver.role === 'civ' ? `Carjack ${v.def.name}` : null) : v.locked ? `Hotwire ${v.def.name}` : `Enter ${v.def.name}`;
      if (label) consider({ kind: 'vehicle', label, ref: v }, d + 6);
    }
    for (const poi of g.world.pois) { const d = dist(poi.x, poi.y, p.x, p.y); if (d < 44 && this.handlers[poi.type]) consider({ kind: 'poi', label: this.labelFor(poi), ref: poi }, d); }
    for (const e of g.entities.peds) if (e.interact && !e.dead && !e.removed) { const d = dist(e.x, e.y, p.x, p.y); if (d < 42) consider({ kind: 'entity', label: e.interact, ref: e }, d); }
    for (const e of g.entities.misc) if (e.interact && !e.removed) { const d = dist(e.x, e.y, p.x, p.y); if (d < (e.reach || 36)) consider({ kind: 'entity', label: e.interact, ref: e }, d); }
    this.current = best;
  }
  labelFor(poi) {
    if (poi.type === 'hideout') return this.game.turf.hideoutLabel(poi);
    const L = { safehouse: 'Enter Safehouse', contact: `Talk to ${poi.label}`, shop_gun: 'Browse Arms', hospital: 'See the Doctor', spray: 'Respray (clears heat)', eatery: 'Order Noodles', chop: 'Chop Shop', police: 'Police Station' };
    return L[poi.type] || poi.label;
  }

  activate() {
    const g = this.game, p = g.player, c = this.current; if (!c) return;
    if (c.kind === 'exit') {
      const v = p.vehicle;
      if (v.airborne) { g.vehicles.eject(p); p.parachute = 1.6; p.invuln = 1.6; g.audio.swing(false, p.x, p.y); g.hud.toast('Geronimo!', 1400); return; }
      if (v.cls === 'boat') { const land = g.vehicles.shoreNear(v); if (!land) { g.hud.toast('Pull up to a pier or the shore first'); return; } g.vehicles.eject(p); p.x = land.x; p.y = land.y; return; }
      if (Math.abs(v.fw) < (v.cls === 'plane' ? 140 : 260)) g.vehicles.eject(p); else g.hud.toast('Slow down first'); return;
    }
    if (c.kind === 'vehicle') {
      const v = c.ref;
      if (v.driver) { g.vehicles.carjack(p, v); return; }
      if (v.locked && g.minigames) { g.minigames.hotwire(v); return; }
      g.vehicles.enter(p, v); return;
    }
    if (c.kind === 'poi') { const h = this.handlers[c.ref.type]; if (h) h(c.ref, g); return; }
    if (c.kind === 'entity' && c.ref.onInteract) c.ref.onInteract(g);
  }
}
