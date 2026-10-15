import { TILE, WANTED } from '../config.js';
import { T } from '../world/tiles.js';
import { FACTIONS } from '../data/factions.js';
import { WEAPONS } from '../data/weapons.js';
import { makeGangMember } from './turf.js';
import { dist, clamp } from '../core/math.js';
import { rand, Rng } from '../core/rng.js';
import { INK } from '../render/style.js';

// Long-term hooks: gang rank (respect XP + perks), kill streaks, hidden jade
// statues, stunt-jump ramps, rampages, and "wreck the cops to shed a star".
// Everything persists through save().

export const RANKS = [
  { n: 'Street Rat', xp: 0 }, { n: 'Runner', xp: 150, perk: '+10 max health' }, { n: 'Lookout', xp: 400, perk: 'Wreck 1 fewer cop car to lose a star' },
  { n: 'Enforcer', xp: 800, perk: 'Free armour at the safehouse' }, { n: 'Red Pole', xp: 1400, perk: '+25 max health' }, { n: 'Incense Master', xp: 2200, perk: 'Press B: call 2 Jade gunmen (90 s cooldown)' },
  { n: 'Vanguard', xp: 3300, perk: 'Turf income +25%' }, { n: 'White Paper Fan', xp: 4700, perk: '10% off at the arms dealer' }, { n: 'Straw Sandal', xp: 6500, perk: '+25 max health' },
  { n: 'Deputy Mountain Master', xp: 8800, perk: 'Backup squad grows to 4' }, { n: 'Dragon Head', xp: 11600, perk: 'Wanted stars fade twice as fast' }, { n: 'Mountain Master', xp: 15000, perk: 'Infinite pistol ammo' },
];
const STREAK_NAMES = ['', '', 'DOUBLE', 'TRIPLE', 'QUAD', 'MASSACRE', 'UNSTOPPABLE'];

export class ProgressSystem {
  constructor(game) {
    this.game = game; this.reset();
    this.statues = placeStatues(game.world); this.ramps = placeRamps(game.world); this.skulls = placeRampages(game.world);
    const ev = game.events;
    ev.on('playerKill', (e) => this.onKill(e));
    ev.on('missionPassed', () => this.xp(250, 'Mission'));
    ev.on('turfWon', () => this.xp(150, 'Turf taken'));
    ev.on('vehicleDestroyed', (e) => this.onWreck(e));
    ev.on('pedDied', (e) => { if (e.ped === game.player) { this.streak = 0; if (this.rampage) this.endRampage(false); } });
  }
  reset() {
    this.XP = 0; this.rank = 0; this.streak = 0; this.streakT = 0; this.found = new Set(); this.jumps = new Set(); this.rampsDone = new Set();
    this.copWrecks = 0; this.rampage = null; this.jump = null; this.backupT = 0; this.bestStreak = 0;
  }

  /* ---------- XP / rank ---------- */
  xp(n, why) {
    const g = this.game; this.XP += n;   // respect shows on the rank bar; no per-kill text spam
    while (this.rank < RANKS.length - 1 && this.XP >= RANKS[this.rank + 1].xp) {
      this.rank++; const r = RANKS[this.rank];
      g.hud.banner('RANK UP', `${r.n}${r.perk ? ' · ' + r.perk : ''}`, '#7dff6a', 4200); g.audio.gong && g.audio.gong(); this.applyPerks(true);
    }
    void why;
  }
  applyPerks(heal) {
    const p = this.game.player; if (!p) return;
    const hp = 100 + (this.rank >= 1 ? 10 : 0) + (this.rank >= 4 ? 25 : 0) + (this.rank >= 8 ? 25 : 0) + (this.found.size >= 20 ? 25 : 0);
    p.maxHp = hp; if (heal) p.hp = hp;
    p.infiniteAmmoPistol = this.rank >= 11;
  }
  get rankName() { return RANKS[this.rank].n; }
  get nextXP() { return RANKS[Math.min(RANKS.length - 1, this.rank + 1)].xp; }
  get incomeMul() { return this.rank >= 6 ? 1.25 : 1; }
  get shopMul() { return this.rank >= 7 ? 0.9 : 1; }
  get wreckNeed() { return Math.max(1, (this.game.wantedLevel || 1) - (this.rank >= 2 ? 1 : 0)); }

  /* ---------- streaks ---------- */
  onKill(e) {
    const g = this.game, ped = e.ped, gang = ped.role === 'gang' || ped.role === 'cop' || ped.role === 'swat';
    this.xp(ped.role === 'civ' ? 2 : ped.role === 'gang' ? (ped.boss ? 120 : 10) : 15, 'kill');
    this.streak = this.streakT > 0 ? this.streak + 1 : 1; this.streakT = 3.5; this.bestStreak = Math.max(this.bestStreak, this.streak);
    if (this.streak >= 3) {
      const bonus = gang ? 25 * this.streak : 0, name = STREAK_NAMES[Math.min(this.streak, STREAK_NAMES.length - 1)];
      g.fx.floater(ped.x, ped.y - 26, `${name} ×${this.streak}${bonus ? '  +$' + bonus : ''}`, '#ffd23a', true);
      if (bonus) g.economy.addCash(bonus, true);
      if (this.streak >= 5) { g.timeScale = 0.4; clearTimeout(this._slow); this._slow = setTimeout(() => { if (!g.down) g.timeScale = 1; }, 500); }
    }
    if (this.rampage && ped.faction === this.rampage.faction) { this.rampage.kills++; if (this.rampage.kills >= this.rampage.need) this.endRampage(true); }
  }

  /* ---------- cops: wreck cruisers to shed a star ---------- */
  onWreck(e) {
    const g = this.game, v = e.vehicle, by = e.src;
    if (!by || by.role !== 'player' || !g.wantedLevel) return;
    if (v.type !== 'police' && v.type !== 'swat' && v.type !== 'armored') return;
    this.copWrecks++; this.xp(25, 'cop wreck');
    const need = this.wreckNeed;
    if (this.copWrecks >= need) {
      this.copWrecks = 0; const w = g.wanted, pts = WANTED.starPoints;
      w.heat = Math.max(0, pts[Math.max(0, g.wantedLevel - 1)] - 0.01 + (g.wantedLevel - 1 > 0 ? 0.02 : 0)); w.recompute();
      g.fx.floater(v.x, v.y - 30, 'STAR SHAKEN!', '#7fd8ff', true); g.hud.toast(`Cop car wrecked: wanted level down to ${g.wantedLevel}`, 2600, 'good');
      if (!g.wantedLevel) w.clear();
    } else g.fx.floater(v.x, v.y - 30, `COP WRECKED ${this.copWrecks}/${need}`, '#7fd8ff');
  }

  /* ---------- main update ---------- */
  update(dt) {
    const g = this.game, p = g.player; if (!p || g.state !== 'play') return;
    this.streakT = Math.max(0, this.streakT - dt); if (this.streakT === 0) this.streak = 0;
    this.hints(dt);
    this.backupT = Math.max(0, this.backupT - dt);
    if (this.rank >= 5 && g.input.pressed('backup')) this.callBackup();
    if (this.rank >= 3 && !this._armour && dist(p.x, p.y, g.world.spawn.x, g.world.spawn.y) < 60 && p.armor < 50) { p.armor = 100; this._armour = true; g.hud.toast('Safehouse armour: topped up', 1800, 'good'); setTimeout(() => (this._armour = false), 60000); }
    if (p.infiniteAmmoPistol && p.weapon === 'pistol') p.ammo.pistol = Math.max(p.ammo.pistol || 0, 99);
    // statues
    for (const s of this.statues) if (!this.found.has(s.id) && Math.abs(s.x - p.x) < 22 && Math.abs(s.y - p.y) < 22 && !p.vehicle) this.collectStatue(s);
    // rampages
    if (!this.rampage && !g.missions.active && !p.vehicle) for (const s of this.skulls) if (!this.rampsDone.has(s.id) && dist(s.x, s.y, p.x, p.y) < 20) this.startRampage(s);
    if (this.rampage) this.updateRampage(dt);
    // stunt ramps
    const v = p.vehicle;
    if (this.jump) this.updateJump(dt);
    else if (v && v.cls === 'car' && !v.dead) for (const r of this.ramps) {
      const dx = v.x - r.x, dy = v.y - r.y; if (dx * dx + dy * dy > 34 * 34) continue;
      const along = v.vx * r.dx + v.vy * r.dy; if (along > 260) { this.startJump(v, r, along); break; }
    }
  }

  hints(dt) {
    const g = this.game, p = g.player; this._ht = (this._ht || 0) - dt; if (this._ht > 0) return; this._ht = 0.5;
    if (p.vehicle) {
      const v = p.vehicle;
      if (v.cls === 'car' && Math.abs(v.fw) > 220) g.tipOnce('drift', 'Hold <kbd>Space</kbd> in a turn to drift');
      if (g.wantedLevel && v.cls === 'car') g.tipOnce('ram', 'Wreck police cars to shake off a wanted star');
      return;
    }
    const near = g.entities.nearest(p.x, p.y, 300, (q) => q.kind === 'ped' && !q.dead && (q.role === 'gang' || q.role === 'cop') && q.state === 'fight');
    if (near) g.tipOnce('shoot', '<kbd>LMB</kbd> shoot · <kbd>RMB</kbd> melee · <kbd>Space</kbd> roll');
    if (p.hp < p.maxHp * 0.45) g.tipOnce('heal', 'Hurt? Eat at a noodle bar or visit a clinic (✚)');
    const car = g.entities.nearest(p.x, p.y, 90, (q) => q.kind === 'vehicle' && !q.dead && !q.driver);
    if (car) g.tipOnce('car', 'Walk up to any car and press <kbd>E</kbd> to take it');
    for (const s of this.skulls) if (!this.rampsDone.has(s.id) && dist(s.x, s.y, p.x, p.y) < 260) { g.tipOnce('skull', 'A red skull starts a RAMPAGE. Step on it when you are ready'); break; }
  }

  collectStatue(s) {
    const g = this.game; this.found.add(s.id); const n = this.found.size;
    g.audio.ui && g.audio.ui('good'); g.fx.ring(s.x, s.y, 60, 'rgba(120,255,170,'); g.fx.floater(s.x, s.y - 30, `JADE DRAGON ${n}/${this.statues.length}`, '#7dff6a', true);
    g.economy.addCash(250, true); this.xp(40, 'statue');
    const reward = { 10: ['Katana unlocked at the arms dealer, free', () => { g.economy.weapons.add('katana'); }], 20: ['+25 max health', () => this.applyPerks(true)], 30: ['$25,000 and the golden Dragon GT at your safehouse', () => { g.economy.addCash(25000); this.goldCar = true; }] }[n];
    if (reward) { reward[1](); g.hud.banner(`${n} JADE DRAGONS`, reward[0], '#7dff6a', 4600); }
    else g.hud.toast(`Jade Dragon ${n}/${this.statues.length} · +$250`, 2200, 'good');
  }

  /* ---------- stunt jumps ---------- */
  startJump(v, r, sp) {
    const g = this.game; this.jump = { v, r, t: 0, dur: clamp(sp / 420, 0.75, 1.25), sp, spin: 0 }; v.jumping = true;
    g.timeScale = 0.45; g.camera.addTrauma(0.15); g.audio.swing && g.audio.swing(false, v.x, v.y);
  }
  updateJump(dt) {
    const g = this.game, j = this.jump, v = j.v; j.t += dt / Math.max(0.2, g.timeScale);
    const k = j.t / j.dur; v.alt = Math.sin(Math.min(1, k) * Math.PI) * 0.55;
    if (k >= 1 || v.dead || v.removed || v.driver !== g.player) {
      v.alt = 0; v.jumping = false; g.timeScale = 1; this.jump = null; g.camera.addTrauma(0.35); g.fx.dust(v.x, v.y, 8); g.audio.crash && g.audio.crash(v.x, v.y, 200);
      if (v.dead || v.driver !== g.player) return;
      const first = !this.jumps.has(j.r.id); this.jumps.add(j.r.id);
      const pay = first ? 250 + Math.round(j.sp) : 40;
      g.economy.addCash(pay, true); this.xp(first ? 60 : 5, 'jump');
      g.hud.banner(first ? 'UNIQUE STUNT BONUS' : 'STUNT', `+$${pay}${first ? `  ·  ${this.jumps.size}/${this.ramps.length} jumps` : ''}`, '#ffd23a', 2400, !first);
      if (first && this.jumps.size === this.ramps.length) { g.economy.addCash(10000); g.hud.banner('ALL STUNT JUMPS', '+$10,000', '#ffd23a', 4600); }
    }
  }

  /* ---------- rampages ---------- */
  startRampage(s) {
    const g = this.game, p = g.player;
    this.rampage = { s, t: s.time, kills: 0, need: s.need, faction: s.faction, weapon: s.weapon, prevWeapon: p.weapon, spawnT: 0, list: [] };
    p.weapon = s.weapon; p.infiniteAmmo = true;
    g.hud.banner('RAMPAGE!', `Kill ${s.need} ${FACTIONS[s.faction].name} in ${s.time}s with the ${WEAPONS[s.weapon].name}`, '#ff4a3a', 3400);
    g.audio.gong && g.audio.gong();
  }
  updateRampage(dt) {
    const g = this.game, r = this.rampage, p = g.player; r.t -= dt; r.spawnT -= dt;
    g.hud.setObjective(`RAMPAGE  ${r.kills}/${r.need}  ·  ${Math.ceil(r.t)}s`);
    r.list = r.list.filter((q) => !q.dead && !q.removed);
    if (r.spawnT <= 0 && r.list.length < 7) {
      r.spawnT = 1.1;
      for (let k = 0; k < 2; k++) { const a = rand.range(0, 6.28), d = rand.range(230, 340), x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d; if (g.world.isSolidPx(x, y) || g.world.tileAtPx(x, y) === T.WATER) continue;
        const q = makeGangMember(g, r.faction, x, y, { rank: rand.chance(0.15) ? 1 : 0, anchor: { x: p.x, y: p.y }, leash: 600 }); q.state = 'fight'; q.data.target = p; q.data.sight = 600; r.list.push(q); }
    }
    if (r.t <= 0) this.endRampage(false);
  }
  endRampage(won) {
    const g = this.game, r = this.rampage, p = g.player; if (!r) return; this.rampage = null;
    p.infiniteAmmo = false; p.weapon = g.economy.owned(r.prevWeapon) ? r.prevWeapon : 'fists'; g.hud.setObjective('');
    for (const q of r.list) if (!q.dead) { q.state = 'idle'; q.persistent = false; }
    if (won) { this.rampsDone.add(r.s.id); g.economy.addCash(1000, true); this.xp(200, 'rampage'); g.hud.banner('RAMPAGE COMPLETE', `+$1,000  ·  ${this.rampsDone.size}/${this.skulls.length}`, '#ffd23a', 3600); }
    else g.hud.banner('RAMPAGE FAILED', 'The skull will wait for you', '#ff4a3a', 2600);
  }

  /* ---------- backup ---------- */
  callBackup() {
    const g = this.game, p = g.player; if (this.backupT > 0) { g.hud.toast(`Backup ready in ${Math.ceil(this.backupT)}s`, 1400); return; }
    this.backupT = 90; const n = this.rank >= 9 ? 4 : 2;
    for (let i = 0; i < n; i++) { const a = (i / n) * 6.28, q = makeGangMember(g, 'jade', p.x + Math.cos(a) * 40, p.y + Math.sin(a) * 40, { rank: 1, anchor: p, leash: 140, follow: p }); q.role = 'ally'; q.data.follow = p; q.persistent = true; setTimeout(() => { q.persistent = false; }, 120000); }
    g.hud.toast('Jade backup has arrived', 2000, 'good');
  }

  /* ---------- drawing (world space, called from the overlay hook) ---------- */
  draw(g, cam, t) {
    const p = this.game.player; if (!p) return;
    const rev = this.game.cheats && this.game.cheats.on.reveal;
    for (const s of this.statues) { if (this.found.has(s.id) || (!rev && (Math.abs(s.x - p.x) > 320 || Math.abs(s.y - p.y) > 260))) continue; drawStatue(g, s.x, s.y, t); }
    for (const s of this.skulls) { if (this.rampsDone.has(s.id) || Math.abs(s.x - p.x) > 700 || Math.abs(s.y - p.y) > 500) continue; drawSkull(g, s.x, s.y, t, FACTIONS[s.faction].color); }
  }
  drawRamps(g, cam) {
    const b = cam.bounds(60);
    for (const r of this.ramps) { if (r.x < b.x0 || r.x > b.x1 || r.y < b.y0 || r.y > b.y1) continue; drawRamp(g, r, this.jumps.has(r.id)); }
  }
  radar() {
    const out = this.skulls.filter((s) => !this.rampsDone.has(s.id)).map((s) => ({ x: s.x, y: s.y, color: '#ff4a3a' }));
    if (this.game.cheats && this.game.cheats.on.reveal) { for (const s of this.statues) if (!this.found.has(s.id)) out.push({ x: s.x, y: s.y, color: '#2fd07a' }); for (const r of this.ramps) if (!this.jumps.has(r.id)) out.push({ x: r.x, y: r.y, color: '#ffd23a' }); }
    return out;
  }

  serialize() { return { XP: this.XP, rank: this.rank, found: [...this.found], jumps: [...this.jumps], ramps: [...this.rampsDone], goldCar: !!this.goldCar, bestStreak: this.bestStreak }; }
  restore(d) { this.reset(); if (!d) return; this.XP = d.XP || 0; this.rank = d.rank || 0; this.found = new Set(d.found || []); this.jumps = new Set(d.jumps || []); this.rampsDone = new Set(d.ramps || []); this.goldCar = d.goldCar; this.bestStreak = d.bestStreak || 0; this.applyPerks(false); }
  completion() {
    const g = this.game, parts = [[g.missions.done.size, 14], [g.turf.owned().length, g.world.turfs.length], [this.found.size, this.statues.length], [this.jumps.size, this.ramps.length], [this.rampsDone.size, this.skulls.length], [this.rank, RANKS.length - 1]];
    return Math.round(parts.reduce((s, [a, b]) => s + Math.min(1, a / Math.max(1, b)), 0) / parts.length * 100);
  }
}

/* ============ placement (deterministic per world) ============ */
function spread(cands, n, minD, rng) {
  rng.shuffle(cands); const out = [];
  for (const c of cands) { if (out.length >= n) break; if (out.every((o) => Math.hypot(o.x - c.x, o.y - c.y) > minD)) out.push(c); }
  return out;
}
function placeStatues(world) {
  const rng = new Rng(world.seed * 7 + 3), c = [];
  for (let y = 2; y < world.H - 2; y++) for (let x = 2; x < world.W - 2; x++) {
    const t = world.ground[y * world.W + x]; if (t !== T.ALLEY && t !== T.PARK && t !== T.PIER && t !== T.COURT) continue;
    if (world.solid[y * world.W + x]) continue; c.push({ x: (x + 0.5) * TILE, y: (y + 0.5) * TILE });
  }
  return spread(c, 30, 380, rng).map((s, i) => ({ ...s, id: i }));
}
function placeRamps(world) {
  const rng = new Rng(world.seed * 11 + 5), c = [];
  for (const n of world.nodes) for (const e of n.edges) {
    const m = world.nodes[e.to]; if (n.id > m.id || e.len < 420) continue;
    const dir = rng.chance(0.5) ? 1 : -1, t = 0.45;
    const x = n.x + (m.x - n.x) * t + (-e.dy) * e.w * TILE * 0.25 * dir, y = n.y + (m.y - n.y) * t + e.dx * e.w * TILE * 0.25 * dir;
    c.push({ x, y, dx: e.dx * dir, dy: e.dy * dir });
  }
  return spread(c, 12, 700, rng).map((s, i) => ({ ...s, id: i }));
}
function placeRampages(world) {
  const rng = new Rng(world.seed * 13 + 9), c = [];
  const W = [['smg', 18], ['shotgun', 14], ['cleaver', 10], ['rifle', 22], ['grenade', 12], ['katana', 12], ['flamer', 16], ['pistol', 12]];
  for (let y = 2; y < world.H - 2; y++) for (let x = 2; x < world.W - 2; x++) {
    const t = world.ground[y * world.W + x]; if (t !== T.ALLEY && t !== T.LOT && t !== T.PLAZA) continue; if (world.solid[y * world.W + x]) continue;
    const tid = world.turfMap[y * world.W + x]; if (tid < 0) continue; const turf = world.turfs[tid]; if (!turf || turf.startOwner === 'jade' || turf.startOwner === 'none') continue;
    c.push({ x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, faction: turf.startOwner });
  }
  return spread(c, 12, 650, rng).map((s, i) => { const [weapon, need] = W[i % W.length]; return { ...s, id: i, weapon, need, time: 75 }; });
}

/* ============ art ============ */
function drawStatue(g, x, y, t) {
  const bob = Math.sin(t * 3 + x) * 2;
  g.save(); g.translate(x, y);
  g.globalCompositeOperation = 'lighter'; const a = 0.25 + Math.sin(t * 4 + y) * 0.1; g.fillStyle = `rgba(80,255,160,${a})`; g.beginPath(); g.arc(0, -8 + bob, 16, 0, 6.3); g.fill(); g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgba(10,6,24,0.3)'; g.beginPath(); g.ellipse(2, 3, 7, 3.5, 0, 0, 6.3); g.fill();
  g.translate(0, -10 + bob);
  g.fillStyle = '#2fd07a'; g.strokeStyle = INK; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-7, 6); g.quadraticCurveTo(-9, -4, -2, -8); g.quadraticCurveTo(6, -10, 6, -3); g.quadraticCurveTo(3, 0, 6, 6); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#b8ffd6'; g.beginPath(); g.arc(2, -5, 1.6, 0, 6.3); g.fill();
  g.fillStyle = '#f1c64a'; g.fillRect(-8, 6, 16, 3); g.strokeRect(-8, 6, 16, 3);
  g.restore();
}
function drawSkull(g, x, y, t, color) {
  const bob = Math.sin(t * 4 + x) * 2.5, s = 1 + Math.sin(t * 6) * 0.06;
  g.save(); g.translate(x, y);
  g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,60,40,0.3)'; g.beginPath(); g.arc(0, -12 + bob, 20, 0, 6.3); g.fill(); g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgba(10,6,24,0.3)'; g.beginPath(); g.ellipse(2, 3, 9, 4, 0, 0, 6.3); g.fill();
  g.translate(0, -14 + bob); g.scale(s, s);
  g.fillStyle = '#f4efe2'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(0, -2, 9, Math.PI * 0.9, Math.PI * 2.1); g.lineTo(5, 8); g.lineTo(-5, 8); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(-3.5, -1, 2.6, 0, 6.3); g.arc(3.5, -1, 2.6, 0, 6.3); g.fill(); g.fillRect(-0.8, 3, 1.6, 2.4);
  g.fillStyle = color; g.fillRect(-9, -11, 18, 3);
  g.restore();
}
function drawRamp(g, r, done) {
  const a = Math.atan2(r.dy, r.dx);
  g.save(); g.translate(r.x, r.y); g.rotate(a);
  g.fillStyle = 'rgba(10,6,24,0.35)'; g.fillRect(-16, -15, 40, 34);
  const gr = g.createLinearGradient(-18, 0, 18, 0); gr.addColorStop(0, '#5a5560'); gr.addColorStop(1, '#a8a2ae'); g.fillStyle = gr; g.fillRect(-18, -16, 36, 32);
  g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(-18, -16, 36, 32);
  g.fillStyle = done ? '#7dff6a' : '#ffd23a'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-10 + i * 9, -9); g.lineTo(-4 + i * 9, 0); g.lineTo(-10 + i * 9, 9); g.lineTo(-7 + i * 9, 0); g.closePath(); g.fill(); }
  g.fillStyle = '#e8e4d8'; g.fillRect(16, -16, 3, 32);
  g.restore();
}
void dist; void clamp;
