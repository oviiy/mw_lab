import { WANTED, ECON } from '../config.js';
import { Ped } from '../entities/ped.js';
import { Heli } from '../entities/heli.js';
import { copLook } from '../entities/pedLooks.js';
import { copBrain } from './ai/copBrain.js';
import { RoadDriver } from './traffic.js';
import { dist, clamp } from '../core/math.js';
import { rand } from '../core/rng.js';

// Crime → heat → stars → a police response that escalates:
//   1★ patrol cars   2★ more units, guns   3★ roadblocks   4★ helicopter + SWAT   5★ armoured Enforcer.
// Cops only react to what they (or a phoning witness) actually saw.
const CARS = [0, 2, 3, 4, 5, 6];

export class WantedSystem {
  constructor(game) {
    this.game = game; this.heat = 0; this.level = 0; this.seen = false; this.evadeT = 0; this.lastKnown = null; this.spawnT = 0; this.blockT = 20;
    this.heli = null; this.roadblocks = []; this.playerShot = false; this.rate = {}; this.patrolT = 4; this.flash = 0;
    const ev = game.events;
    ev.on('pedHurt', (e) => this.onPedHurt(e)); ev.on('pedDied', (e) => this.onPedDied(e)); ev.on('carjack', (e) => this.onCarjack(e));
    ev.on('vehicleDestroyed', (e) => this.onVehicleDestroyed(e)); ev.on('explosion', (e) => this.onExplosion(e));
    ev.on('noise', (e) => this.onNoise(e)); ev.on('witnessReport', (e) => this.onReport(e));
  }

  get isPlayer() { return (e) => e && (e.role === 'player' || (e.driver && e.driver.role === 'player')); }

  /* ---------- crime intake ---------- */
  limit(key, sec) { const t = this.game.time; if (this.rate[key] && t - this.rate[key] < sec) return false; this.rate[key] = t; return true; }

  crime(type, sev, x, y, perp) {
    const game = this.game; if (!perp || perp.role !== 'player') return;
    // cops that can see it respond instantly; civilians phone it in
    let cop = false;
    for (const q of game.entities.near(x, y, 420, [], (e) => e.kind === 'ped' && !e.dead && (e.role === 'cop' || e.role === 'swat'))) if (game.world.lineClear(q.x, q.y, x, y)) { cop = true; break; }
    if (!cop) for (const v of game.entities.vehicles) if ((v.type === 'police' || v.type === 'swat') && v.driver && !v.dead && dist(v.x, v.y, x, y) < 380) { cop = true; break; }
    if (!cop && this.heli && dist(this.heli.x, this.heli.y, x, y) < 420) cop = true;
    // a crime committed in front of the police is always at least one star
    if (cop) { const one = WANTED.starPoints[1] + 0.01; this.addHeat(sev >= 0.4 && this.heat < one ? Math.max(sev, one - this.heat) : sev, type); return; }
    // nobody official saw it: only serious crimes get phoned in at all
    if (sev < 1) return;
    let called = 0;
    for (const w of game.entities.near(x, y, 280, [], (e) => e.kind === 'ped' && e.role === 'civ' && !e.dead && !e.vehicle && e.state !== 'phone')) {
      if (!game.world.lineClear(w.x, w.y, x, y) || called >= 2) continue;
      if (w.data.brave || rand.chance(0.55)) { w.state = 'phone'; w.stateT = 0; w.data.phoneT = rand.range(2.4, 4); w.data.crime = { type, sev }; called++; }
    }
  }
  // A phone call can get the police looking for you (1★) but never escalates past that on its own.
  onReport(e) { if (e.witness.dead || e.witness.removed) return; const cap = WANTED.starPoints[1] + 0.01; if (this.heat < cap) this.addHeat(Math.min(e.crime.sev, cap - this.heat), e.crime.type); else this.seen = true; }

  addHeat(n, why) {
    const game = this.game; const old = this.level;
    if (game.cheats && game.cheats.on.noWanted && why !== 'cheat') return;
    this.heat = clamp(this.heat + n, 0, 20); this.recompute();
    this.seen = true; this.evadeT = 0; this.lastKnown = { x: game.player.x, y: game.player.y };
    if (this.level > old) { game.hud.toast(this.level === 1 ? 'Wanted: the police are after you' : `Wanted level ${this.level}`, 2400, 'bad'); game.audio.ui('bad'); if (old === 0) this.dispatchNow(); }
    void why;
  }
  recompute() { let l = 0; for (let i = 1; i < WANTED.starPoints.length; i++) if (this.heat >= WANTED.starPoints[i]) l = i; this.level = l; this.game.wantedLevel = l; }
  clear(msg) { this.playerShot = false; this.heat = 0; this.level = 0; this.game.wantedLevel = 0; this.seen = false; this.evadeT = 0; this.stand(); if (msg) this.game.hud.toast(msg, 2600, 'good'); }

  /* ---------- event adapters ---------- */
  onPedHurt(e) {
    const p = e.ped, src = e.src; if (!src) return; const by = src.role === 'player' ? src : src.driver && src.driver.role === 'player' ? src.driver : null; if (!by) return;
    if (p.role === 'civ' && this.limit('assault', 1.5)) this.crime('assault', 0.35, p.x, p.y, by);
    else if ((p.role === 'cop' || p.role === 'swat') && this.limit('copHit', 0.8)) { this.addHeat(p.role === 'swat' ? 2.5 : 2.1, 'cop_attack'); this.playerShot = true; }
    // gangsters fighting gangsters is not police business unless a cop is watching
  }
  onPedDied(e) {
    const p = e.ped, by = e.src && (e.src.role === 'player' ? e.src : e.src.driver && e.src.driver.role === 'player' ? e.src.driver : null); if (!by) return;
    if (p.role === 'civ') this.crime('murder', 1.4, p.x, p.y, by);
    else if (p.role === 'cop' || p.role === 'swat') { this.addHeat(4.2, 'cop_kill'); this.game.stats.copKills++; }
    else if ((p.role === 'gang' || p.role === 'boss') && this.limit('gangKill', 4)) this.crime('gang_kill', 0.5, p.x, p.y, by);
  }
  onCarjack(e) { const cop = e.victim && e.victim.role === 'cop'; this.crime('carjack', cop ? 2.5 : 0.6, e.vehicle.x, e.vehicle.y, e.player); this.game.stats.carjacks++; }
  onVehicleDestroyed(e) { const by = e.src; if (by && by.role === 'player' && e.vehicle.owner !== 'player' && this.limit('veh', 2)) this.crime('property', 0.6, e.vehicle.x, e.vehicle.y, by); }
  onExplosion(e) { const s = e.src; if (s && s.role === 'player' && this.limit('boom', 2)) this.crime('explosion', 1.1, e.x, e.y, s); }
  onNoise(e) { if (e.kind === 'gunshot' && e.src && e.src.role === 'player') { if (this.limit('shot', 3)) this.crime('gunfire', 0.4, e.x, e.y, e.src); } }

  /* ---------- per-frame ---------- */
  update(dt) {
    if (this.heat > 0 && this.heat < WANTED.starPoints[1] && !this.seen) { this.heat = Math.max(0, this.heat - dt * 0.08); }
    const game = this.game, p = game.player; if (!p) return;
    this.flash += dt;
    const level = this.level;
    game.nav.wanted = level > 0;
    // sirens follow the star level
    for (const v of game.entities.vehicles) if (v.type === 'police' || v.type === 'swat' || v.type === 'armored') v.siren = level > 0 && !v.dead && !!v.driver;
    if (level === 0) { this.heat = Math.max(0, this.heat - dt * 0.03); this.patrol(dt); this.stand(true); return; }
    if (p.dead) return;
    // can anybody see the player?
    let seen = false, nearest = 1e9;
    for (const e of game.entities.peds) if (!e.dead && (e.role === 'cop' || e.role === 'swat')) { const d = dist(e.x, e.y, p.x, p.y); nearest = Math.min(nearest, d); if (d < 380 && game.world.lineClear(e.x, e.y, p.x, p.y)) seen = true; }
    for (const v of game.entities.vehicles) if ((v.type === 'police' || v.type === 'swat' || v.type === 'armored') && !v.dead && v.driver) { const d = dist(v.x, v.y, p.x, p.y); nearest = Math.min(nearest, d); if (d < 340 && game.world.lineClear(v.x, v.y, p.x, p.y)) seen = true; }
    if (this.heli && !this.heli.dead && dist(this.heli.x, this.heli.y, p.x, p.y) < 360) seen = true;
    this.seen = seen;
    if (seen) { this.evadeT = 0; this.lastKnown = { x: p.x, y: p.y }; }
    else {
      this.evadeT += dt * (nearest > 520 ? 1.4 : 1) * (game.progress && game.progress.rank >= 10 ? 2 : 1);
      if (this.evadeT > WANTED.decaySeconds) { this.evadeT = 0; this.heat = level > 1 ? WANTED.starPoints[level - 1] + 0.01 : 0; this.recompute(); game.hud.toast(this.level ? 'Wanted level dropped' : 'You lost the cops', 2400, 'good'); if (!this.level) { this.playerShot = false; this.stand(); } }
    }
    this.dispatch(dt); this.ejectOfficers(dt); this.manageHeli(dt); this.manageRoadblocks(dt);
  }

  /* ---------- dispatching ---------- */
  patrol(dt) {
    const game = this.game; this.patrolT -= dt; if (this.patrolT > 0) return; this.patrolT = 5;
    let n = 0; for (const v of game.entities.vehicles) if (v.type === 'police' && !v.dead && !v.tag) n++;
    if (n < 2) this.spawnCar('police', false);
  }
  copCount() { let c = 0; for (const v of this.game.entities.vehicles) if ((v.type === 'police' || v.type === 'swat' || v.type === 'armored') && !v.dead && v.driver) c++; return c; }
  dispatchNow() { for (let i = 0; i < 2; i++) this.spawnCar('police', true, 380, 700); }
  dispatch(dt) {
    this.spawnT -= dt; if (this.spawnT > 0) return; this.spawnT = 1.5;
    const level = this.level; if (this.copCount() >= CARS[level]) return;
    let type = 'police'; if (level >= 4 && rand.chance(0.35)) type = 'swat'; if (level >= 5 && rand.chance(0.3)) type = 'armored';
    this.spawnCar(type, true);
  }
  spawnCar(type, hunting, min = 520, max = 980) {
    const game = this.game, p = game.player, pick = game.traffic.pickEdge(p.x, p.y, Math.max(min, game.viewRadius() + 60), max); if (!pick) return null;
    const drv = new RoadDriver(game.world, pick.n, pick.e); if (hunting) { drv.mode = 'chase'; drv.target = p; drv.aggressive = type === 'armored' ? 0.7 : 0.88; drv.reckless = type !== 'police'; }
    const v = game.vehicles.spawn(type, pick.x, pick.y, Math.atan2(pick.e.dy, pick.e.dx), { ai: drv, speed: 140 }); v.tag = hunting ? 'cop' : null;
    const sw = type !== 'police';
    const dr = game.vehicles.seatNew(v, { role: sw ? 'swat' : 'cop', look: copLook(sw ? 'swat' : 'cop'), hp: sw ? 120 : 70, weapon: sw ? (type === 'armored' ? 'rifle' : 'smg') : (this.level >= 3 ? 'smg' : 'pistol'), brain: copBrain }); dr.data.dmgMul = sw ? 0.6 : 0.42;
    v.siren = hunting; return v;
  }
  makeOfficer(x, y, swat, weapon) {
    const game = this.game, p = new Ped({ x, y, role: swat ? 'swat' : 'cop', look: copLook(swat ? 'swat' : 'cop'), hp: swat ? 120 : 70, walk: 70, run: swat ? 150 : 162, weapon: weapon || (swat ? 'smg' : 'pistol'), brain: copBrain, cash: rand.int(0, 40) });
    p.data.accuracy = swat ? 0.8 : 1.2; p.data.dmgMul = swat ? 0.6 : 0.42; game.entities.add(p); return p;
  }
  ejectOfficers(dt) {
    const game = this.game, p = game.player; let foot = 0;
    for (const e of game.entities.peds) if ((e.role === 'cop' || e.role === 'swat') && !e.dead && !e.vehicle) foot++;
    const cap = 3 + this.level * 2;
    for (const v of game.entities.vehicles) {
      if (v.dead || !v.driver || !(v.type === 'police' || v.type === 'swat' || v.type === 'armored') || foot >= cap) continue;
      const d = dist(v.x, v.y, p.x, p.y);
      if (d < 230 && Math.abs(v.fw) < 120 && (!p.vehicle || Math.abs(p.vehicle.fw) < 90 || d < 120) && rand.chance(dt * 2)) {
        const drv = v.driver, swat = v.type !== 'police'; game.vehicles.eject(drv); drv.state = 'hunt'; foot++;
        const extra = this.makeOfficer(v.x + Math.cos(v.angle + 1.57) * 26, v.y + Math.sin(v.angle + 1.57) * 26, swat, swat ? 'smg' : undefined); extra.state = 'hunt'; foot++;
        v.ai = null; v.controls.brake = 1; v.siren = true;
      }
    }
  }
  manageHeli(dt) {
    const game = this.game, p = game.player;
    if (this.level >= 4 && !this.heli) { const a = rand.range(0, 6.28); this.heli = new Heli(p.x + Math.cos(a) * 900, p.y + Math.sin(a) * 900); game.entities.add(this.heli); game.hud.toast('Police helicopter inbound', 2800, 'bad'); }
    if (this.heli && (this.level < 4 || this.heli.removed)) { if (this.heli.removed) this.heli = null; else if (this.level < 4) { this.heli.removed = true; this.heli = null; } }
  }
  onHeliDown() { this.game.economy.addCash(600); this.game.hud.toast('Helicopter downed  +$600', 3000, 'good'); this.heli = null; }

  manageRoadblocks(dt) {
    const game = this.game, p = game.player; this.blockT -= dt;
    for (let i = this.roadblocks.length - 1; i >= 0; i--) { const rb = this.roadblocks[i]; rb.t -= dt; if (rb.t <= 0 || dist(rb.x, rb.y, p.x, p.y) > 1300) { for (const e of rb.ents) if (!e.removed && !e.dead) e.removed = true; this.roadblocks.splice(i, 1); } }
    if (this.level < 3 || this.blockT > 0 || this.roadblocks.length >= 2) return;
    this.blockT = 28;
    const v = p.vehicle || p, sp = Math.hypot(v.vx || 0, v.vy || 0), ax = sp > 60 ? (v.vx / sp) : Math.cos(p.angle), ay = sp > 60 ? (v.vy / sp) : Math.sin(p.angle);
    const pick = game.traffic.pickEdge(p.x + ax * 620, p.y + ay * 620, 80, 380); if (!pick) return;
    const a = Math.atan2(pick.e.dy, pick.e.dx) + Math.PI / 2, ents = [], cx = pick.x - -pick.e.dy * pick.e.w * 8, cy = pick.y - pick.e.dx * pick.e.w * 8;
    for (const off of [-30, 30]) { const car = game.vehicles.spawn('police', cx + Math.cos(a) * off, cy + Math.sin(a) * off, a, { parked: true, locked: true }); car.siren = true; car.tag = 'cop'; ents.push(car); }
    for (const off of [-16, 16]) { const o = this.makeOfficer(cx + Math.cos(a + 1.57) * 30 + Math.cos(a) * off, cy + Math.sin(a + 1.57) * 30 + Math.sin(a) * off, this.level >= 4); o.state = 'hunt'; ents.push(o); }
    this.roadblocks.push({ x: cx, y: cy, t: 50, ents });
  }

  // Cops stand down (ambient) once the heat is off.
  stand(soft = false) {
    const game = this.game; if (this.heli) { this.heli.removed = true; this.heli = null; }
    for (const e of game.entities.peds) if ((e.role === 'cop' || e.role === 'swat') && !e.dead) { if (e.vehicle) continue; if (!soft || e.state === 'hunt') { e.state = 'idle'; e.stateT = 0; e.data.goal = null; e.intent.fire = false; } }
    for (const v of game.entities.vehicles) if ((v.type === 'police' || v.type === 'swat' || v.type === 'armored') && v.ai instanceof RoadDriver && v.ai.mode === 'chase' && !soft) { v.ai.mode = 'cruise'; v.ai.target = null; v.tag = null; v.siren = false; }
    if (!soft) for (const rb of this.roadblocks) rb.t = Math.min(rb.t, 6);
  }

  // Cuffed. Lose some cash and wake up outside the nearest police station.
  bust() {
    const game = this.game; if (game.state !== 'play' || game.player.dead) return;
    game.playerDown('busted');
  }
}
void ECON;
