import { makeGangMember } from './turf.js';
import { civilianLook } from '../entities/pedLooks.js';
import { Ped } from '../entities/ped.js';
import { civBrain } from './ai/civBrain.js';
import { freeSpotNear, roadSpotNear } from './missions/resolve.js';
import { RoadDriver } from './traffic.js';
import { gangLook } from '../entities/pedLooks.js';
import { gangBrain } from './ai/gangBrain.js';
import { FACTIONS, FACTION_IDS } from '../data/factions.js';
import { dist } from '../core/math.js';
import { rand } from '../core/rng.js';

// Ambient street events that keep the city feeling alive between jobs:
// muggings you can break up, rival gangs brawling, drive-bys when you trespass.
export class AmbientEvents {
  constructor(game) { this.game = game; this.timer = rand.range(75, 110); this.active = []; this.trespassT = 0; }

  update(dt) {
    const g = this.game, p = g.player; if (!p || p.dead || g.state !== 'play') return;
    this.timer -= dt;
    for (let i = this.active.length - 1; i >= 0; i--) { const e = this.active[i]; if (e.update(dt, g)) { e.cleanup(g); this.active.splice(i, 1); } }
    // drive-by when lingering in hostile turf
    const tid = g.world.turfAtPx(p.x, p.y), t = tid >= 0 ? g.world.turfs[tid] : null;
    if (t && t.owner !== 'jade' && t.owner !== 'none' && !g.turf.war && !g.missions.active && g.wantedLevel < 3) this.trespassT += dt; else this.trespassT = Math.max(0, this.trespassT - dt * 2);
    if (this.trespassT > 45) { this.trespassT = 20; this.driveBy(t.owner); }
    if (this.timer <= 0) {
      this.timer = rand.range(55, 95);
      if (g.missions.active || g.wantedLevel > 0 || this.active.length >= 2) return;
      (rand.chance(0.55) ? this.mugging : this.skirmish).call(this);
    }
  }

  spot(min, max) {
    const g = this.game, p = g.player;
    for (let i = 0; i < 12; i++) { const a = rand.range(0, 6.28), d = rand.range(min, max), s = freeSpotNear(g, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 40, true); if (g.world.districtAtPx(s.x, s.y) >= 0 && ![0, 8, 10].includes(g.world.tileAtPx(s.x, s.y)) && g.world.tileAtPx(s.x, s.y) !== 1) return s; }
    return null;
  }

  mugging() {
    const g = this.game, s = this.spot(380, 700); if (!s) return;
    const victim = new Ped({ x: s.x, y: s.y, role: 'civ', look: civilianLook('biz'), hp: 40, brain: civBrain, cash: 0 }); victim.persistent = true; victim.state = 'flee'; victim.data.fleeFrom = { x: s.x - 30, y: s.y }; g.entities.add(victim);
    const thugs = [];
    for (let i = 0; i < 2; i++) { const t = makeGangMember(g, 'none', s.x - 28 + i * 14, s.y + 8 * i, { rank: 0, weapon: i ? 'cleaver' : 'pistol', anchor: { x: s.x, y: s.y }, leash: 160 }); t.role = 'gang'; t.look = gangLook('dragon'); t.data.enemy = victim; t.data.sight = 380; t.hostileToPlayer = false; t.persistent = true; thugs.push(t); }
    g.hud.toast('Mugging in progress nearby!', 3600, 'bad');
    const ev = { t: 0, thugs, victim, update: (dt) => { ev.t += dt; if (thugs.every((q) => q.dead || q.removed)) { if (!victim.dead && !victim.removed) { g.pickups.drop(victim.x, victim.y, 'cash', 160, { life: 40 }); g.hud.toast('“Thank you! Take this.”', 2800, 'good'); } return true; } return ev.t > 100 || dist(g.player.x, g.player.y, s.x, s.y) > 1300; }, cleanup: () => { for (const q of thugs) { q.persistent = false; if (!q.dead && dist(q.x, q.y, g.player.x, g.player.y) > 500) q.removed = true; } victim.persistent = false; }, markers: () => [{ x: s.x, y: s.y, color: '#ff6a5a', r: 0, small: true }] };
    this.active.push(ev);
  }

  skirmish() {
    const g = this.game, s = this.spot(420, 760); if (!s) return;
    const ids = rand.shuffle([...FACTION_IDS.filter((f) => f !== 'jade')]), a = ids[0], b = ids[1], ents = [];
    for (let i = 0; i < 3; i++) for (const [f, dx] of [[a, -46], [b, 46]]) { const q = makeGangMember(g, f, s.x + dx + rand.range(-14, 14), s.y + rand.range(-30, 30), { rank: rand.chance(0.2) ? 1 : 0, anchor: { x: s.x, y: s.y }, leash: 140, sight: 360 }); q.persistent = true; ents.push(q); }
    g.hud.toast(`${FACTIONS[a].name} and ${FACTIONS[b].name} are fighting nearby`, 3600);
    const ev = { t: 0, ents, update: (dt) => { ev.t += dt; const alive = ents.filter((q) => !q.dead && !q.removed); if (!alive.length) return true; if (new Set(alive.map((q) => q.faction)).size < 2 && ev.t > 20) return true; return ev.t > 120 || dist(g.player.x, g.player.y, s.x, s.y) > 1300; }, cleanup: () => { for (const q of ents) { q.persistent = false; if (!q.dead && dist(q.x, q.y, g.player.x, g.player.y) > 500) q.removed = true; } }, markers: () => [{ x: s.x, y: s.y, color: '#ffa93a', r: 0, small: true }] };
    this.active.push(ev);
  }

  driveBy(faction) {
    const g = this.game, p = g.player, pick = g.traffic.pickEdge(p.x, p.y, g.viewRadius() + 80, 800); if (!pick) return;
    const drv = new RoadDriver(g.world, pick.n, pick.e); drv.mode = 'chase'; drv.target = p; drv.aggressive = 0.9; drv.reckless = true;
    const v = g.vehicles.spawn('sedan', pick.x, pick.y, Math.atan2(pick.e.dy, pick.e.dx), { ai: drv, speed: 170, color: FACTIONS[faction].dark });
    const d = g.vehicles.seatNew(v, { role: 'gang', faction, look: gangLook(faction), hp: 60, weapon: 'smg', hostile: true, brain: gangBrain }); d.data.accuracy = 1.7; d.data.sight = 420;
    v.tag = 'raid'; setTimeout(() => { if (!v.removed) v.tag = null; }, 25000);
    g.hud.toast(`${FACTIONS[faction].name} drive-by! Keep moving!`, 3200, 'bad');
  }

  markers() { return this.active.flatMap((e) => (e.markers ? e.markers() : [])); }
}
void roadSpotNear;
