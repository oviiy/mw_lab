import { dist } from '../core/math.js';
import { WANTED } from '../config.js';

// Keeps the airbase / tank yard / marina stocked: each spawn slot holds one parked
// vehicle near the player, refilled a while after it is taken or destroyed.
// Stealing military hardware brings instant heat.
export class SiteSystem {
  constructor(game) {
    this.game = game; this.slots = []; this.t = 0;
    game.events.on('enterVehicle', (e) => this.onEnter(e));
  }
  reset() { this.slots = (this.game.world.vehicleSpawns || []).map((s) => ({ ...s, v: null, cool: 0 })); }
  update(dt) {
    const g = this.game, p = g.player; if (!p) return;
    if (this.slots.length !== (g.world.vehicleSpawns || []).length) this.reset();
    this.t -= dt; if (this.t > 0) return; this.t = 0.5;
    for (const s of this.slots) {
      const v = s.v;
      if (v && (v.removed || v.dead || (v.owner === 'player' && dist(v.x, v.y, s.x, s.y) > 300))) { s.v = null; s.cool = 60; }
      if (s.v) continue;
      s.cool -= 0.5; if (s.cool > 0) continue;
      const d = dist(p.x, p.y, s.x, s.y); if (d > 1700 || d < 260) continue;
      if (g.entities.nearest(s.x, s.y, 50, (q) => q.kind === 'vehicle' && !q.removed)) continue;
      s.v = g.vehicles.spawn(s.type, s.x, s.y, s.angle, { parked: true, locked: false, tag: 'site', color: s.color });
      s.v.site = s;
    }
  }
  onEnter(e) {
    const v = e.vehicle, s = v.site; if (!s || v.siteStolen || e.ped.role !== 'player') return;
    v.siteStolen = true; v.tag = null;
    const g = this.game;
    if (s.heat) { const need = WANTED.starPoints[s.heat]; if (g.wanted.heat < need) g.wanted.addHeat(need - g.wanted.heat + 0.01, 'military theft'); }
    g.hud.toast(v.cls === 'tank' ? 'You stole a TANK. The army is coming.' : v.cls === 'plane' ? 'Plane stolen. W to roll, take off above 250 km/h' : v.cls === 'heli' ? 'Helicopter stolen. WASD fly, mouse aims' : v.def.name, 3600, s.heat ? 'bad' : '');
  }
}
