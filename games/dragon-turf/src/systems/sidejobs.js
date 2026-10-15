import { MissionPoint } from './missions/steps.js';
import { civilianLook } from '../entities/pedLooks.js';
import { Ped } from '../entities/ped.js';
import { roadSpotNear, freeSpotNear } from './missions/resolve.js';
import { dist, fmtMoney } from '../core/math.js';
import { rand } from '../core/rng.js';
import { civBrain } from './ai/civBrain.js';
import { RoadDriver } from './traffic.js';
import { gangLook } from '../entities/pedLooks.js';
import { gangBrain } from './ai/gangBrain.js';
import { FACTIONS } from '../data/factions.js';

// Repeatable freelance work: taxi fares (any taxi) and vigilante (any police cruiser). Press N.
export class SideJobSystem {
  constructor(game) { this.game = game; this.vig = null; this.vigBest = 0; this.taxi = null; this.hinted = new WeakSet(); this.t = 0; this.fares = 0; }

  update(dt) {
    const g = this.game, p = g.player, v = p.vehicle;
    if (this.taxi) return this.updateTaxi(dt);
    if (this.vig) return this.updateVig(dt);
    if (v && v.type === 'police' && !g.missions.active && !this.hinted.has(v)) { this.hinted.add(v); g.hud.toast('Police cruiser! Press N for VIGILANTE: hunt gang cars for cash', 4200, 'good'); }
    if (v && v.type === 'police' && !g.missions.active && g.input.keyHit('KeyN')) { this.vig = { v, level: 0, earned: 0 }; this.nextVig(); return; }
    if (v && v.type === 'taxi' && !g.missions.active && !this.hinted.has(v)) { this.hinted.add(v); g.hud.toast('Taxi! Press N to start picking up fares', 4200, 'good'); }
    if (v && v.type === 'taxi' && !g.missions.active && g.input.keyHit('KeyN') && g.wantedLevel === 0) this.startTaxi(v);
  }

  startTaxi(v) {
    const g = this.game, p = g.player; this.taxi = { v, stage: 'find', t: 0, fares: 0, earned: 0 }; g.hud.toast('On the clock. Find a passenger.', 2800, 'good'); this.nextFare();
    void p;
  }
  stopTaxi(msg) { const g = this.game, t = this.taxi; this.taxi = null; if (t && t.pass && !t.pass.removed) t.pass.removed = true; if (t && t.pt) t.pt.removed = true; g.hud.setObjective(''); if (msg) g.hud.toast(msg, 3000); if (t && t.fares) g.hud.toast(`Shift over: ${t.fares} fare${t.fares > 1 ? 's' : ''}, ${fmtMoney(t.earned)}`, 4000, 'good'); }

  nextFare() {
    const g = this.game, t = this.taxi, p = g.player, a = rand.range(0, 6.28), d = rand.range(260, 640);
    const spot = freeSpotNear(g, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 60, true);
    const road = roadSpotNear(g, spot.x, spot.y, 260) || { x: spot.x, y: spot.y };
    const ped = new Ped({ x: spot.x, y: spot.y, role: 'civ', look: civilianLook('biz'), hp: 40, brain: civBrain }); ped.persistent = true; ped.state = 'idle'; ped.data.idleFor = 999; ped.data.taxi = true;
    g.entities.add(ped); t.pass = ped; t.stage = 'pickup'; t.pickup = { x: road.x, y: road.y }; t.t = 0;
    t.pt = { x: road.x, y: road.y };
    g.hud.setObjective('Pick up the passenger'); g.hud.toast('Passenger waiting nearby', 2200);
  }

  updateTaxi(dt) {
    const g = this.game, t = this.taxi, p = g.player, v = p.vehicle; t.t += dt;
    if (!v || v !== t.v || v.dead) { this.stopTaxi(v === null ? 'You left the cab' : null); return; }
    if (g.input.keyHit('KeyN')) { this.stopTaxi('Shift ended'); return; }
    if (g.wantedLevel > 0) { this.stopTaxi('Cops on you. Fare cancelled.'); return; }
    if (t.stage === 'pickup') {
      const q = t.pickup; g.hud.setObjective(`Pick up the passenger · ${Math.round(dist(v.x, v.y, q.x, q.y) / 32)} blocks`);
      if (dist(v.x, v.y, q.x, q.y) < 70 && Math.abs(v.fw) < 90) {
        t.pass.removed = true; t.pass = null; t.stage = 'drop'; t.t = 0; const a = rand.range(0, 6.28), d = rand.range(900, 2100);
        let dest = roadSpotNear(g, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 400); if (!dest) dest = { x: p.x + 800, y: p.y };
        t.dest = dest; t.start = { x: v.x, y: v.y }; t.fare = Math.round(40 + dist(v.x, v.y, dest.x, dest.y) * 0.16); t.limit = dist(v.x, v.y, dest.x, dest.y) / 150 + 22;
        g.audio.ui('ok'); g.hud.toast(`“${rand.pick(['Step on it!', 'Take the scenic route, I do not care.', 'Do you know a shortcut?', 'Is that a gun on your seat?'])}”`, 2800);
      }
    } else if (t.stage === 'drop') {
      const q = t.dest, left = t.limit - t.t; g.hud.setObjective(`Drop off the passenger · ${Math.ceil(left)}s · ${fmtMoney(t.fare)}`);
      if (left <= 0) { this.stopTaxi('Too slow — the passenger bailed.'); return; }
      if (dist(v.x, v.y, q.x, q.y) < 75 && Math.abs(v.fw) < 100) {
        const streak = Math.min(0.5, t.fares * 0.1), tip = Math.round(t.fare * Math.max(0, left / t.limit) * 0.6), pay = Math.round((t.fare + tip) * (1 + streak)); g.economy.addCash(pay, true); g.fx.floater(v.x, v.y - 24, '+' + fmtMoney(pay), '#7ed957', true); g.audio.pickup('cash');
        t.fares++; t.earned += pay; g.hud.toast(`Fare ${fmtMoney(t.fare)} + tip ${fmtMoney(tip)}${streak ? ` · streak +${Math.round(streak * 100)}%` : ''}`, 2600, 'good'); this.nextFare();
      }
    }
  }

  /* ---------- vigilante ---------- */
  nextVig() {
    const g = this.game, s = this.vig, p = g.player; s.level++; s.t = 75 + s.level * 6; s.cars = [];
    const enemy = ['dragon', 'lotus', 'tiger'][(Math.random() * 3) | 0], n = 1 + Math.floor((s.level - 1) / 3);
    for (let i = 0; i < n; i++) {
      const pick = g.traffic.pickEdge(p.x, p.y, 520, 900); if (!pick) continue;
      const drv = new RoadDriver(g.world, pick.n, pick.e); drv.mode = 'flee'; drv.fleeT = 999; drv.cruise = 200 + s.level * 8;
      const v = g.vehicles.spawn(s.level > 6 ? 'sports' : 'sedan', pick.x, pick.y, Math.atan2(pick.e.dy, pick.e.dx), { ai: drv, speed: 160, color: FACTIONS[enemy].dark }); v.tag = 'vigilante';
      const d = g.vehicles.seatNew(v, { role: 'gang', faction: enemy, look: gangLook(enemy), hp: 50, weapon: s.level > 4 ? 'smg' : 'pistol', hostile: true, brain: gangBrain }); d.data.sight = 300;
      s.cars.push(v);
    }
    g.hud.toast(`VIGILANTE level ${s.level}: stop the ${FACTIONS[enemy].name} (${s.cars.length} car${s.cars.length > 1 ? 's' : ''})`, 3000, 'bad');
  }
  stopVig(msg) { const g = this.game, s = this.vig; this.vig = null; g.hud.setObjective(''); for (const v of s.cars) if (!v.dead) { v.tag = null; } this.vigBest = Math.max(this.vigBest, s.level - 1); g.hud.toast(`${msg} · vigilante reached level ${s.level - 1}, earned ${fmtMoney(s.earned)}`, 4000); }
  updateVig(dt) {
    const g = this.game, s = this.vig, p = g.player, v = p.vehicle;
    if (!v || v !== s.v || v.dead) return this.stopVig('Out of the cruiser');
    if (g.input.keyHit('KeyN')) return this.stopVig('Off duty');
    s.t -= dt; if (s.t <= 0) return this.stopVig('They got away');
    const left = s.cars.filter((c) => !c.dead && !c.removed && c.driver && !c.driver.dead);
    g.hud.setObjective(`VIGILANTE lvl ${s.level} · ${left.length} left · ${Math.ceil(s.t)}s`);
    if (!left.length) {
      const pay = 150 * s.level; g.economy.addCash(pay, true); s.earned += pay; g.fx.floater(v.x, v.y - 24, '+' + fmtMoney(pay), '#7ed957', true); g.audio.pickup('cash');
      if (g.progress) g.progress.xp(20 + s.level * 5, 'vigilante');
      if (s.level === 12) { g.hud.banner('VIGILANTE MASTER', 'Body armour now goes to 150', '#7fd8ff', 4200); p.maxArmor = 150; }
      this.nextVig();
    }
  }

  markers() { if (this.vig) return this.vig.cars.filter((c) => !c.dead && !c.removed).map((c) => ({ x: c.x, y: c.y, color: '#ff4a4a', r: 0 })); const t = this.taxi; if (!t) return []; if (t.stage === 'pickup') return [{ x: t.pickup.x, y: t.pickup.y, color: '#ffd23a', r: 70 }]; if (t.stage === 'drop') return [{ x: t.dest.x, y: t.dest.y, color: '#37e6ff', r: 75 }]; return []; }
}
void MissionPoint;
