import { TILE, TIME } from '../config.js';
import { Ped } from '../entities/ped.js';
import { gangLook, bossLook } from '../entities/pedLooks.js';
import { gangBrain } from './ai/gangBrain.js';
import { FACTIONS, FACTION_IDS } from '../data/factions.js';
import { dist, fmtMoney } from '../core/math.js';
import { rand } from '../core/rng.js';

// Home turf of the story contacts: never raided, so Uncle Wei's teahouse stays safe.
const PROTECTED = new Set(['Jade Teahouse Row']);

// Gang member factory shared by turf defenders, wars and missions.
export function makeGangMember(game, faction, x, y, o = {}) {
  const f = FACTIONS[faction], rank = o.rank ?? 0, friendly = faction === 'jade';
  const pool = rank >= 2 ? [f.weapon === 'pistol' ? 'rifle' : f.weapon, 'rifle'] : rank === 1 ? [f.weapon, 'smg'] : [f.weapon, 'pistol', 'pistol', 'cleaver', 'fists'];
  const p = new Ped({ x, y, role: o.boss ? 'boss' : friendly ? 'ally' : 'gang', faction, look: o.boss ? bossLook(faction) : gangLook(faction), hp: 56 + rank * 36, armor: rank * 28, walk: 66, run: 156, weapon: o.weapon || rand.pick(pool), brain: gangBrain, cash: rand.int(15, 90) + rank * 60, boss: !!o.boss, scale: o.boss ? 1.15 : 1 });
  p.data.dmgMul = 0.5 + rank * 0.12; p.data.anchor = o.anchor || { x, y }; p.data.leash = o.leash ?? 110; p.data.accuracy = Math.max(0.6, 1.6 - rank * 0.35); p.data.sway = Math.max(0.06, 0.17 - rank * 0.04); p.data.sight = o.sight ?? 270; p.data.reaction = Math.max(0.25, 0.55 - rank * 0.1);
  p.state = 'idle'; p.data.idleFor = rand.range(0.4, 3); p.hostileToPlayer = !friendly; p.turf = o.turf ?? null; p.maxHp = p.hp;
  game.entities.add(p); return p;
}

// Territory control: who owns what, defenders, wars, raids and passive income.
export class TurfSystem {
  constructor(game) {
    this.game = game; this.world = game.world; this.turfs = game.world.turfs; this.stash = 0; this.hourAcc = 0; this.defenders = new Map(); this.war = null; this.raidT = 140; this.worldT = 300; this.news = [];
    this.recomputeIncome();
    game.events.on('pedDied', (e) => this.onDeath(e));
  }

  owned() { return this.turfs.filter((t) => t.owner === 'jade'); }
  recomputeIncome() { for (const t of this.turfs) t.income = t.hideout == null ? 0 : 45 + (t.district === 0 ? 40 : t.district === 3 ? 30 : 15) + (t.id % 3) * 10; }
  income() { return this.owned().reduce((s, t) => s + t.income, 0); }
  respect() { return this.owned().length; }

  setOwner(turf, owner, why) {
    if (owner !== turf.owner) turf.guarded = false;
    turf.owner = owner; turf.underAttack = null; this.removeDefenders(turf); this.game.hud.mini.turfDirty = true;
    this.game.events.emit('turfChanged', { turf, owner, why });
  }

  /* ---------- hideout interaction ---------- */
  hideoutLabel(poi) { const t = this.turfs[poi.turf]; return t.owner === 'jade' ? `${t.name} hideout (yours)` : t.owner === 'none' ? `Claim ${t.name} (unclaimed, free)` : `Raid ${t.name} hideout (${FACTIONS[t.owner].name}, 3 waves)`; }
  useHideout(poi) {
    const g = this.game, t = this.turfs[poi.turf];
    if (t.owner === 'jade') { g.hud.toast(`${t.name}: +${fmtMoney(t.income)}/hour. Collect at the safehouse.`); return; }
    if (this.war) { g.hud.toast('A turf war is already underway', 2200, 'bad'); return; }
    if (t.owner === 'none') { this.setOwner(t, 'jade', 'claim'); g.hud.banner('TURF CLAIMED', t.name, FACTIONS.jade.color); g.hud.toast(`${t.name} is yours.`, 3000, 'good'); g.stats.turfsTaken++; return; }
    this.startWar(t);
  }

  /* ---------- defenders ---------- */
  spawnDefenders(turf) {
    const owner = turf.owner; if (owner === 'none' || turf.hideout == null) return;
    const list = []; const base = owner === 'jade' ? 4 : 5 + Math.floor(turf.id % 3);
    for (let i = 0; i < base; i++) { const a = turf.anchors[i % turf.anchors.length]; const p = makeGangMember(this.game, owner, a.x + rand.range(-14, 14), a.y + rand.range(-14, 14), { rank: i === 0 && owner !== 'jade' ? 1 : 0, anchor: a, turf: turf.id, leash: 120 }); list.push(p); }
    this.defenders.set(turf.id, list);
  }
  removeDefenders(turf) { const l = this.defenders.get(turf.id); if (l) for (const p of l) if (!p.dead) p.removed = true; this.defenders.delete(turf.id); }

  /* ---------- wars ---------- */
  startWar(turf) {
    const g = this.game; this.war = { turf, wave: 0, total: 3, enemies: [], t: 0, gap: 2.5, far: 0 };
    turf.underAttack = turf.underAttack || null; g.hud.banner('TURF WAR', `${FACTIONS[turf.owner].name} · ${turf.name}`, FACTIONS[turf.owner].color, 3600);
    g.audio.gong(); g.hud.setObjective(`Turf war: defeat the ${FACTIONS[turf.owner].name}`);
    // the existing defenders join in
    for (const p of this.defenders.get(turf.id) || []) if (!p.dead) { p.state = 'fight'; p.data.target = g.player; p.data.engaged = 0; }
  }
  spawnWave(war) {
    const g = this.game, t = war.turf, f = t.owner, n = 4 + war.wave, list = [];
    for (let i = 0; i < n; i++) { const a = t.anchors[i % t.anchors.length]; const rank = i === 0 && war.wave >= 1 ? 1 : 0; list.push(makeGangMember(g, f, a.x + rand.range(-30, 30), a.y + 30 + rand.range(-20, 30), { rank, anchor: a, turf: t.id, leash: 200 })); }
    if (war.wave === 2) list.push(makeGangMember(g, f, t.hx, t.hy - 10, { rank: 2, boss: false, anchor: { x: t.hx, y: t.hy }, turf: t.id }));
    for (const p of list) { p.state = 'fight'; p.data.target = g.player; p.data.engaged = 0; p.data.sight = 520; }
    war.enemies = list; war.wave++; g.hud.toast(`Wave ${war.wave} of ${war.total}`, 2200, 'bad');
  }
  endWar(won) {
    const g = this.game, w = this.war; if (!w) return; const t = w.turf; this.war = null; g.hud.setObjective('');
    if (won) {
      const old = t.owner; this.setOwner(t, 'jade', 'war'); g.stats.turfsTaken++; g.economy.addCash(500 + t.income * 4, true);
      g.hud.banner('TURF CAPTURED', t.name, FACTIONS.jade.color, 4200); g.audio.sting('win'); g.hud.toast(`${t.name} taken from the ${FACTIONS[old].name}. +${fmtMoney(500 + t.income * 4)}`, 4000, 'good');
      g.events.emit('turfWon', { turf: t, from: old });
    } else { g.hud.toast('Turf war abandoned', 2600, 'bad'); for (const p of w.enemies) if (!p.dead) { p.state = 'guard'; p.data.target = null; } }
  }

  /* ---------- background game ---------- */
  update(dt) {
    const g = this.game, p = g.player; if (!p) return;
    // passive income (banked into the safehouse stash)
    this.hourAcc += dt; const hour = TIME.secondsPerHour;
    if (this.hourAcc >= hour) { this.hourAcc -= hour; const inc = Math.round(this.income() * (g.progress ? g.progress.incomeMul : 1)); if (inc) { const first = this.stash === 0; this.stash += inc; if (first) g.hud.toast(`Protection money is piling up at your safehouse (${fmtMoney(this.stash)})`, 3000, 'mini'); } }
    // defenders follow the player's proximity
    for (const t of this.turfs) {
      if (t.hideout == null) continue; const d = dist(p.x, p.y, t.hx, t.hy), have = this.defenders.has(t.id);
      if (!have && d < 850 && t.owner !== 'none') this.spawnDefenders(t);
      else if (have && d > 1500 && !(this.war && this.war.turf === t)) { this.pruneFar(t); }
      const cur = this.defenders.get(t.id); if (cur) this.defenders.set(t.id, cur.filter((q) => !q.removed && !q.dead));
    }
    if (this.war) this.updateWar(dt);
    this.updateRaids(dt); this.updateWorld(dt);
  }
  pruneFar(t) { const l = this.defenders.get(t.id); if (l) for (const q of l) if (!q.dead && dist(q.x, q.y, this.game.player.x, this.game.player.y) > 1200) q.removed = true; this.defenders.delete(t.id); }

  updateWar(dt) {
    const g = this.game, w = this.war, p = g.player; w.t += dt;
    if (p.dead) { this.endWar(false); return; }
    if (dist(p.x, p.y, w.turf.hx, w.turf.hy) > 1000) { w.far += dt; if (w.far > 25) { this.endWar(false); return; } } else w.far = 0;
    if (w.enemies.length === 0 || w.enemies.every((q) => q.dead || q.removed)) {
      if (w.wave >= w.total) { this.endWar(true); return; }
      w.gap -= dt; if (w.gap <= 0) { w.gap = 3; this.spawnWave(w); }
    }
    const left = w.enemies.filter((q) => !q.dead && !q.removed).length; g.hud.setObjective(`Turf war · wave ${Math.max(1, w.wave)}/${w.total} · ${left} left`);
  }

  updateRaids(dt) {
    const g = this.game, p = g.player; this.raidT -= dt;
    for (const t of this.turfs) {
      const a = t.underAttack; if (!a) continue;
      a.t -= dt;
      if (!a.spawned && dist(p.x, p.y, t.hx, t.hy) < 900) { a.spawned = true; a.raiders = []; for (let i = 0; i < 5; i++) { const an = t.anchors[i % t.anchors.length]; const r = makeGangMember(g, a.by, an.x + rand.range(-20, 20), an.y + 40, { rank: i === 0 ? 1 : 0, anchor: an, turf: t.id, leash: 170 }); r.state = 'fight'; r.data.target = p; r.data.sight = 420; a.raiders.push(r); } }
      if (a.spawned && a.raiders.every((q) => q.dead || q.removed)) { t.underAttack = null; g.economy.addCash(250, true); g.hud.toast(`You held ${t.name}. +$250`, 3200, 'good'); g.hud.banner('TURF DEFENDED', t.name, FACTIONS.jade.color, 3000); continue; }
      if (a.t <= 0) { const by = a.by; this.removeRaiders(a); this.setOwner(t, by, 'raid'); g.hud.toast(`${t.name} fell to the ${FACTIONS[by].name}!`, 4200, 'bad'); g.hud.banner('TURF LOST', t.name, FACTIONS[by].color, 3600); }
    }
    // rivals only start raiding once the story has introduced turf, and never mid-mission
    if (!g.missions.done.has('protection') || g.missions.active) this.raidT = Math.max(this.raidT, 30);
    if (this.raidT <= 0) {
      this.raidT = rand.range(150, 230);
      const mine = this.owned().filter((t) => !t.underAttack && !(this.war && this.war.turf === t) && !PROTECTED.has(t.name));
      if (mine.length && rand.chance(0.35 + mine.length * 0.07)) {
        const t = rand.pick(mine), by = rand.pick(FACTION_IDS.filter((f) => f !== 'jade'));
        if (t.guarded && rand.chance(0.6)) { g.hud.toast(`${FACTIONS[by].name} hit ${t.name}. Your Serpent guards drove them off.`, 4200, 'good'); return; }
        t.underAttack = { by, t: 130, spawned: false, raiders: [] }; g.hud.toast(`${FACTIONS[by].name} are attacking ${t.name}! Get there!`, 5000, 'bad'); g.hud.banner('TURF UNDER ATTACK', `${t.name} · ${FACTIONS[by].name}`, FACTIONS[by].color, 3600); g.audio.ui('bad');
        g.hud.mini.turfDirty = true;
      }
    }
  }
  removeRaiders(a) { for (const r of a.raiders || []) if (!r.dead) r.removed = true; }

  // The other crews fight each other too.
  updateWorld(dt) {
    this.worldT -= dt; if (this.worldT > 0) return; this.worldT = rand.range(280, 420);
    const g = this.game, cand = this.turfs.filter((t) => t.owner !== 'jade' && !(this.war && this.war.turf === t) && t.hideout != null); if (cand.length < 2) return;
    const t = rand.pick(cand), by = rand.pick(FACTION_IDS.filter((f) => f !== 'jade' && f !== t.owner)), from = t.owner;
    this.setOwner(t, by, 'world'); g.hud.toast(`${FACTIONS[by].name} seized ${t.name}${from !== 'none' ? ' from the ' + FACTIONS[from].name : ''}`, 3600);
  }

  onDeath(e) {
    const p = e.ped; if (!(p.role === 'gang' || p.role === 'boss' || p.role === 'ally')) return;
    const g = this.game; if (e.src && e.src.role === 'player' && p.role !== 'ally') { g.stats.gangKills = (g.stats.gangKills || 0) + 1; if (Math.random() < 0.3) g.pickups.drop(p.x, p.y, 'ammo', 0, { ammoType: p.weapon === 'fists' || p.weapon === 'cleaver' ? 'pistol' : p.weapon }); }
  }

  serialize() { return { owners: this.turfs.map((t) => t.owner), guarded: this.turfs.map((t) => !!t.guarded), stash: this.stash }; }
  restore(d) { if (!d) return; d.owners.forEach((o, i) => { if (this.turfs[i]) { this.turfs[i].owner = o; this.turfs[i].guarded = !!(d.guarded && d.guarded[i]); } }); this.stash = d.stash || 0; this.game.hud.mini.turfDirty = true; }
  collect() { const n = Math.floor(this.stash); this.stash = 0; return n; }
}
void TILE;
