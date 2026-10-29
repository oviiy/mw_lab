// Pure simulation: no DOM, no three. Runs at a fixed 60 steps a second and reports what
// happened through g.events, which the renderer, UI and audio drain each frame.
// Plane coordinates: x to the right, y "up the screen" (the renderer maps y to -z).
import { AUGMENTS, STAT_UPGRADES, ENEMY_NAMES, SHOUTS, Q, WAVES, LEVEL_BONUS, PICKUPS, ELITE_AFFIX, STREAKS } from './config.js';

export const HZ = 60;
export const AW = 12.5, AH = 12.5; // half-size of the courtyard
export const OBSTACLES = [{ x: -6.2, y: 5.2, r: 1.05, kind: 'tree' }, { x: 6.4, y: -5.6, r: 0.85, kind: 'well' }];
const MAX_ENEMIES = 140;

export const DEF = {
  durian: { r: 0.45, hp: 6, sp: 0.042, dmg: 1, xp: 1 },
  orange: { r: 0.4, hp: 6, sp: 0.1, dmg: 1, xp: 1 },
  ginger: { r: 0.42, hp: 5, sp: 0.08, dmg: 1, xp: 1 },
  caesar: { r: 0.5, hp: 22, sp: 0.035, dmg: 2, xp: 3 },
  chenwei: { r: 0.45, hp: 14, sp: 0.04, dmg: 1, xp: 3 },
  dingding: { r: 0.55, hp: 18, sp: 0.034, dmg: 2, xp: 3 },
  oyster: { r: 0.62, hp: 16, sp: 0.026, dmg: 2, xp: 2, spit: 210 },
  goat: { r: 0.5, hp: 11, sp: 0.036, dmg: 2, xp: 2, charge: true },
  jia: { r: 0.45, hp: 9, sp: 0.04, dmg: 1, xp: 2, ranged: true },
  yi: { r: 0.45, hp: 9, sp: 0.04, dmg: 1, xp: 2, ranged: true },
  guo: { r: 0.45, hp: 9, sp: 0.04, dmg: 1, xp: 2, lob: true },
  thief: { r: 0.55, hp: 16, sp: 0.085, dmg: 0, xp: 3, thief: true },
  mao: { r: 0.8, hp: 40, sp: 0.032, dmg: 2, xp: 5, split: 4 },
  maoqiu: { r: 0.32, hp: 4, sp: 0.08, dmg: 1, xp: 0.5 },
  bigmao: { r: 1.6, hp: 500, sp: 0.03, dmg: 2, xp: 40, split: 6, boss: true },
  judge: { r: 1.35, hp: 1700, sp: 0.028, dmg: 3, xp: 0, boss: true },
};

const POOLS = [
  null,
  { durian: 4, ginger: 3, orange: 2 },
  { durian: 3, orange: 2, goat: 2, dingding: 1, ginger: 5 },
  { durian: 3, orange: 2, goat: 2, dingding: 1, ginger: 4, jia: 1, yi: 1, oyster: 1, chenwei: 1 },
  { durian: 3, orange: 2, goat: 2, dingding: 1, ginger: 4, jia: 1, yi: 1, oyster: 1, chenwei: 1, guo: 1, thief: 1, mao: 1, caesar: 1 },
  { durian: 3, orange: 2, ginger: 5, maoqiu: 2 },
  { durian: 3, orange: 2, goat: 2, dingding: 2, ginger: 5, jia: 2, yi: 2, oyster: 2, guo: 1, thief: 1, mao: 1, caesar: 2, chenwei: 2 },
  { durian: 2, orange: 3, goat: 3, dingding: 2, ginger: 6, jia: 2, yi: 2, oyster: 2, guo: 2, thief: 1, mao: 2, caesar: 2, chenwei: 2 },
  { durian: 2, orange: 3, goat: 3, dingding: 3, ginger: 6, jia: 3, yi: 3, oyster: 2, guo: 2, thief: 1, mao: 2, caesar: 2, chenwei: 2 },
  { durian: 2, orange: 3, goat: 3, dingding: 3, ginger: 6, jia: 3, yi: 3, oyster: 3, guo: 3, thief: 2, mao: 3, caesar: 2, chenwei: 2 },
  { durian: 3, orange: 2, ginger: 5, jia: 1, yi: 1 },
];
// The timer stops new arrivals; the player clears the remaining enemies before picking an augment.
const WAVE_SECONDS = [0, 28, 32, 36, 40, 0, 44, 48, 52, 56, 0]; // 0 = boss wave, ends when the boss falls
// elites per wave, spread across the wave; boss waves bring their own
const ELITES = [0, 0, 0, 1, 1, 1, 2, 2, 3, 4, 2];
const BOSS_OF = { 5: 'bigmao', 10: 'judge' };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function baseStats() {
  return { maxhp: 15, hp: 15, speed: 0.115, dmg: 5, rate: 2, range: 7.5, count: 1, pierce: 0, spread: 0.12, crit: 0.05, pickup: 2.2, regen: 0, armor: 0, dodge: 0, xpMul: 1, voice: 0, bomb: 0, hubby: 0, shield: 0, aegis: 0, bull: 0, wind: 0, orbit: 0, chief: 0, meteor: 0, horse: 0, tide: 0, bike: 0 };
}

export function createGame({ rng = Math.random } = {}) {
  return { rng, state: 'title', t: 0, st: 0, events: [], uid: 1, wave: 0, hero: null, enemies: [], bullets: [], ebullets: [], gems: [], spawns: [], zones: [], bombs: [], picks: 0, offer: null };
}

const R = (g) => g.rng();
const rnd = (g, a, b) => a + R(g) * (b - a);
const pick = (g, a) => a[Math.floor(R(g) * a.length)];
const emit = (g, type, data = {}) => g.events.push({ type, ...data });
const sfx = (g, name) => emit(g, 'sfx', { name });
const pop = (g, x, y, text, cls = '') => emit(g, 'pop', { x, y, text, cls });
const burst = (g, x, y, kind, n = 12) => emit(g, 'burst', { x, y, kind, n });

export function say(g, text, dur = 150) {
  const h = g.hero;
  if (!h) return;
  h.say = text; h.sayT = dur;
  emit(g, 'voice', { text });
}

export function startGame(g) {
  g.hero = {
    x: 0, y: 0, r: 0.5, vx: 0, vy: 0, face: 0, inv: 60, s: baseStats(), xp: 0, lvl: 1, cd: 30,
    say: '', sayT: 0, idleT: 400, afk: 0, ult: 0, shields: 0, bless: 0, lowSaid: false, timers: { voice: 0, bomb: 0, hubby: 0, shield: 0, regen: 0, meteor: 0, horse: 0, tide: 0, bike: 0 }, augs: [], statUps: [], moving: false, ride: 0, mount: 'horse',
  };
  g.wave = 0; g.kills = 0; g.hitsTotal = 0; g.shots = 0; g.recentKills = []; g.missStreak = 0;
  g.enemies = []; g.bullets = []; g.ebullets = []; g.gems = []; g.spawns = []; g.zones = []; g.bombs = []; g.meteors = [];
  g.bull = null; g.hubbyRun = null; g.rerolls = 2; g.picks = 0; g.pickPhase = null; g.offer = null; g.saidBomb = false; g.saidWind = false;
  g.time = 0; g.score = 0; g.combo = 0; g.comboT = 0; g.bestCombo = 0; g.streakIdx = 0;
  g.pickups = []; g.pickT = 420; g.stampede = null; g.tides = [];
  nextWave(g);
}

export function xpNeed(lvl) { return 6 + lvl * 4; }

function nextWave(g) {
  g.wave++;
  g.waveT = WAVE_SECONDS[g.wave] * HZ;
  g.bossWave = !g.waveT;
  g.spawnT = 50; g.boss = null;
  const before = new Set(POOLS.slice(1, g.wave).flatMap((p) => Object.keys(p)));
  g.intro = Object.keys(POOLS[g.wave]).filter((k) => !before.has(k));
  g.state = 'play'; g.st = 0;
  g.enemies = []; g.ebullets = []; g.zones = []; g.spawns = []; g.pickups = []; g.pickT = 360;
  g.waveClock = 0; g.ws = { kills: 0, dmg: 0, best: 0 }; g.tides = []; g.tideT = 360; g.tideSaid = false;
  const len = g.waveT || 60 * HZ, ne = ELITES[g.wave];
  g.eliteAt = Array.from({ length: ne }, (_, i) => Math.floor(len * (0.18 + 0.62 * (ne === 1 ? 0.5 : i / (ne - 1)))));
  emit(g, 'wave', { n: g.wave, boss: g.bossWave });
  const hs = g.hero.s;
  if (hs.chief && g.wave > 1) { hs.hp = hs.maxhp; pop(g, g.hero.x, g.hero.y, '女酋长的祝福', 'heal'); burst(g, g.hero.x, g.hero.y, 'gold', 30); }
  if (g.bossWave) {
    const type = BOSS_OF[g.wave];
    g.spawns.push({ x: 0, y: g.hero.y > 0 ? -7 : 7, type, t: 110 });
    say(g, pick(g, type === 'judge' ? Q.boss : Q.bigmao), 200);
  } else if (g.wave > 1) say(g, pick(g, Q.waveStart), 120);
}

function mkEnemy(g, type, x, y, elite = null) {
  const d = DEF[type];
  // later waves hit harder, move faster and take more to bring down
  const scale = d.boss ? 1 : 1 + 0.2 * (g.wave - 1) + 0.025 * (g.wave - 1) ** 2;
  const spd = d.boss ? 1 : 1 + 0.03 * (g.wave - 1);
  const dmg = d.dmg + (!d.boss && g.wave >= 7 ? 1 : 0);
  const e = { id: g.uid++, type, name: ENEMY_NAMES[type], x, y, r: d.r, hp: d.hp * scale, max: d.hp * scale, sp: d.sp * spd * rnd(g, 0.9, 1.1), dmg, xp: d.xp, t: Math.floor(rnd(g, 0, 200)), flash: 0, stun: 0, web: 0, kx: 0, ky: 0, mode: 'walk', modeT: 0, carry: 0, cd: rnd(g, 60, 160), hitBy: {} };
  if (d.boss) { g.boss = e; e.cd = 140; }
  if (elite) {
    e.elite = elite;
    e.name = '精英·' + ELITE_AFFIX[elite] + e.name;
    e.r *= 1.35; e.xp *= 5; e.dmg += 1;
    e.hp = e.max = e.max * (elite === 'tough' ? 9 : 5);
    if (elite === 'frenzy') e.sp *= 1.6;
  }
  return e;
}

function rollPool(g) {
  const pool = POOLS[g.wave];
  const total = Object.values(pool).reduce((a, b) => a + b, 0);
  let r = R(g) * total;
  for (const [k, w] of Object.entries(pool)) { if ((r -= w) < 0) return k; }
  return 'durian';
}

function queueSpawns(g) {
  const h = g.hero;
  const n = 1 + Math.floor(R(g) * (1 + g.wave / 2.5));
  let cx, cy, tries = 0;
  do { cx = rnd(g, -AW + 1.5, AW - 1.5); cy = rnd(g, -AH + 1.5, AH - 1.5); } while (Math.hypot(cx - h.x, cy - h.y) < 5.5 && ++tries < 20);
  const type = g.intro && g.intro.length ? g.intro.shift() : rollPool(g);
  for (let i = 0; i < n; i++) g.spawns.push({ x: clamp(cx + rnd(g, -1.2, 1.2), -AW + 1, AW - 1), y: clamp(cy + rnd(g, -1.2, 1.2), -AH + 1, AH - 1), type: R(g) < 0.75 ? type : rollPool(g), t: 55 });
}

// ---------- augments ----------
const STACK_CAP = { aegis: 2, notified: 2, ranked: 2, armor: 4 };
export function rollOffer(g, forceTier) {
  const w = g.wave;
  const prism = w >= 3 ? Math.min(0.45, 0.05 * w) : 0;
  const gold = 0.25 + 0.05 * w;
  const r = R(g);
  const tier = forceTier || (r < prism ? 'prism' : r < prism + gold ? 'gold' : 'silver');
  const count = (id) => g.hero.augs.filter((a) => a === id).length;
  const pool = AUGMENTS.filter((a) => a.tier === tier && count(a.id) < (STACK_CAP[a.id] ?? 99));
  const out = [];
  while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(R(g) * pool.length), 1)[0]);
  g.offer = { kind: 'hex', tier, list: out.map((a) => a.id) };
  return g.offer;
}

export function rollStatOffer(g) {
  if (g.wave === 1 && g.hero.statUps.length === 0) {
    g.offer = { kind: 'stat', list: ['shots', 'damage', 'health'] };
    return g.offer;
  }
  const pool = STAT_UPGRADES.filter((a) => !a.available || a.available(g.hero.s));
  const out = [];
  while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(R(g) * pool.length), 1)[0]);
  g.offer = { kind: 'stat', list: out.map((a) => a.id) };
  return g.offer;
}

export function applyStatUpgrade(g, id) {
  const a = STAT_UPGRADES.find((item) => item.id === id);
  if (!a || (a.available && !a.available(g.hero.s))) return false;
  a.apply(g.hero.s);
  g.hero.statUps.push(id);
  emit(g, 'statUp', { text: a.name });
  return true;
}

export function applyAugment(g, id) {
  const a = AUGMENTS.find((x) => x.id === id);
  const h = g.hero;
  a.apply(h.s);
  h.augs.push(id);
  if (id === 'bull' && !g.bull) g.bull = { x: h.x - 1, y: h.y, vx: 0, vy: 0, mode: 'follow', t: 0, target: null };
  emit(g, 'augment', { id });
}

function endWave(g) {
  const h = g.hero;
  for (const gem of g.gems) gainXp(g, gem.v);
  g.gems = [];
  for (const e of g.enemies) burst(g, e.x, e.y, 'poof', 6);
  g.enemies = []; g.ebullets = []; g.zones = []; g.spawns = []; g.bombs = []; g.meteors = []; g.hubbyRun = null; g.hero.ride = 0; g.pickups = []; g.stampede = null; g.hero.bless = 0;
  g.combo = 0; g.comboT = 0;
  h.s.hp = Math.min(h.s.maxhp, h.s.hp + 2);
  sfx(g, 'waveEnd');
  if (g.wave >= WAVES) { g.state = 'win'; g.st = 0; sfx(g, 'win'); return; }
  // One stat choice, then one 海克斯 choice, after each completed wave.
  g.picks = 2; g.pickPhase = 'stat';
  if (g.bossWave) g.rerolls += 1;
  const ws = g.ws;
  const rating = ws.dmg === 0 ? 'S' : ws.dmg < 3 ? 'A' : ws.dmg < 6 ? 'B' : 'C';
  const bonus = { S: 600, A: 300, B: 100, C: 0 }[rating];
  g.score += bonus;
  if (rating === 'S') g.rerolls += 1;
  g.lastWave = { n: g.wave, kills: ws.kills, best: ws.best, rating, bonus, reroll: rating === 'S' };
  g.state = 'pick'; g.st = 0;
  rollStatOffer(g);
  say(g, pick(g, Q.waveClear), 120);
  emit(g, 'waveEnd', { ...g.lastWave });
}

function gainXp(g, v) {
  const h = g.hero;
  h.xp += v * h.s.xpMul;
  while (h.xp >= xpNeed(h.lvl)) {
    h.xp -= xpNeed(h.lvl); h.lvl++;
    const b = pick(g, LEVEL_BONUS);
    b.apply(h.s);
    h.s.hp = Math.min(h.s.maxhp, h.s.hp + 2);
    emit(g, 'levelup', { lvl: h.lvl, text: b.text });
    sfx(g, 'levelup');
  }
}

// ---------- damage ----------
function hitEnemy(g, e, dmg, opts = {}) {
  if (e.dead) return;
  const h = g.hero;
  let crit = false;
  if (opts.canCrit && R(g) < h.s.crit) { crit = true; dmg *= 2; }
  if (h.bless > 0) dmg *= 1.5;
  e.hp -= dmg; e.flash = 6;
  if (opts.kx) { const k = e.type === 'judge' || e.type === 'bigmao' ? 0.15 : 1; e.kx += opts.kx * k; e.ky += opts.ky * k; }
  emit(g, 'dmg', { x: e.x, y: e.y, n: Math.round(dmg), crit });
  if (e.hp <= 0) killEnemy(g, e); else if (opts.sfx !== false) sfx(g, 'hit');
}

function killEnemy(g, e) {
  if (e.dead) return;
  e.dead = true;
  const h = g.hero;
  g.kills++; g.ws.kills++;
  h.ult = Math.min(100, h.ult + (DEF[e.type].boss ? 40 : e.elite ? 25 : 4));
  // combo: kills inside a short window chain, and the chain multiplies points
  g.combo++; g.comboT = 150;
  if (g.combo > g.bestCombo) g.bestCombo = g.combo;
  if (g.combo > g.ws.best) g.ws.best = g.combo;
  const base = DEF[e.type].boss ? 2000 : e.elite ? 250 : Math.max(5, Math.round(e.xp * 10));
  g.score += Math.round(base * (1 + Math.floor(g.combo / 10) * 0.25));
  while (g.streakIdx < STREAKS.length && g.combo >= STREAKS[g.streakIdx][0]) { emit(g, 'streak', { text: STREAKS[g.streakIdx][1], n: g.combo, tier: g.streakIdx }); sfx(g, 'streak'); g.streakIdx++; }
  if (e.elite) {
    emit(g, 'eliteDown', { x: e.x, y: e.y }); emit(g, 'shake', { amt: 0.6 }); emit(g, 'hitstop', { frames: 6 });
    g.pickups.push(mkPickup(g, 'chest', e.x, e.y));
    if (e.elite === 'split' && g.enemies.length < MAX_ENEMIES) for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const c = mkEnemy(g, e.type === 'thief' ? 'durian' : e.type, e.x + Math.cos(a) * 0.8, e.y + Math.sin(a) * 0.8); c.kx = Math.cos(a) * 0.25; c.ky = Math.sin(a) * 0.25; g.enemies.push(c); }
    if (e.elite === 'boom') g.zones.push({ id: g.uid++, x: e.x, y: e.y, r: 2.4, t: 45, T: 45, dmg: 2, kind: 'boom' });
  }
  burst(g, e.x, e.y, e.type === 'mao' || e.type === 'maoqiu' || e.type === 'bigmao' ? 'fluff' : 'kill', DEF[e.type].boss ? 70 : 14);
  sfx(g, DEF[e.type].boss ? 'bossdown' : 'kill');
  const drops = Math.max(0, Math.round(e.xp)) + Math.floor(e.carry * 1.5);
  for (let i = 0; i < drops; i++) g.gems.push({ id: g.uid++, x: e.x + rnd(g, -0.4, 0.4), y: e.y + rnd(g, -0.4, 0.4), v: 1, mag: false, vx: 0, vy: 0 });
  if (e.xp < 1 && R(g) < e.xp) g.gems.push({ id: g.uid++, x: e.x, y: e.y, v: 1, mag: false, vx: 0, vy: 0 });
  const split = DEF[e.type].split;
  if (split && g.enemies.length < MAX_ENEMIES) {
    const child = e.type === 'bigmao' ? 'mao' : 'maoqiu';
    for (let i = 0; i < split; i++) {
      const a = (i / split) * Math.PI * 2;
      const c = mkEnemy(g, child, e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r);
      c.kx = Math.cos(a) * 0.2; c.ky = Math.sin(a) * 0.2;
      g.enemies.push(c);
    }
  }
  if (e.type === 'thief') pop(g, e.x, e.y, '吴浩然：我还会回来的', 'small');
  if (e === g.boss) {
    g.boss = null;
    emit(g, 'shake', { amt: 1 });
    if (e.type === 'judge') { pop(g, e.x, e.y, '退庭！', 'big'); say(g, '沉毅羊法官？就这？', 200); }
    else { pop(g, e.x, e.y, '雪菜……', 'big'); say(g, '大毛，你还挺软乎', 160); }
  }
  g.recentKills.push(g.t);
  g.recentKills = g.recentKills.filter((t) => g.t - t < 80);
  if (g.recentKills.length >= 6 && h.sayT < 40) { say(g, pick(g, Q.multi), 120); g.recentKills = []; }
}

export function hurtHero(g, dmg, sx, sy) {
  const h = g.hero;
  if (h.inv > 0 || h.bless > 0 || g.state !== 'play') return false;
  if (R(g) < h.s.dodge) { h.inv = 20; pop(g, h.x, h.y, pick(g, Q.dodge), 'dodge'); sfx(g, 'dodge'); return false; }
  if (h.shields > 0) {
    h.shields--; h.inv = 40;
    if (h.sayT <= 0) say(g, pick(g, Q.shield), 110);
    emit(g, 'shieldBreak', {}); sfx(g, 'shield');
    return false;
  }
  h.s.hp -= dmg * (1 - h.s.armor);
  g.ws.dmg += dmg;
  h.inv = 45;
  if (h.s.hp > 0 && h.s.hp <= h.s.maxhp * 0.3 && !h.lowSaid) { h.lowSaid = true; say(g, pick(g, Q.lowhp), 140); }
  if (h.s.hp > h.s.maxhp * 0.5) h.lowSaid = false;
  const d = Math.hypot(h.x - sx, h.y - sy) || 1;
  h.vx += (h.x - sx) / d * 0.12; h.vy += (h.y - sy) / d * 0.12;
  emit(g, 'hurt', {}); emit(g, 'shake', { amt: 0.35 }); sfx(g, 'hurt');
  if (h.sayT <= 0 && R(g) < 0.5) say(g, pick(g, Q.hurt), 100);
  if (h.s.hp <= 0) {
    if (h.s.aegis > 0) {
      h.s.aegis--; h.s.hp = h.s.maxhp; h.inv = 150;
      say(g, '不朽盾！买活了！', 160); burst(g, h.x, h.y, 'gold', 40); sfx(g, 'aegis');
    } else { h.s.hp = 0; g.state = 'over'; g.st = 0; g.overQuote = pick(g, Q.dead); sfx(g, 'over'); }
  }
  return true;
}

// ---------- step ----------
// inp: { mx, my } movement in [-1, 1], pressed: { ult, pause, start, pick, reroll }
export function step(g, inp) {
  g.t++;
  const pr = inp.pressed || {};
  if (g.state === 'title') { if (pr.start) startGame(g); return; }
  if (g.state === 'over' || g.state === 'win') { if (++g.st > 60 && pr.start) startGame(g); return; }
  if (g.state === 'pause') { if (pr.pause || pr.start) g.state = 'play'; return; }
  if (g.state === 'pick') {
    g.st++;
    if (pr.reroll && g.pickPhase === 'hex' && g.rerolls > 0) { g.rerolls--; rollOffer(g, g.offer.tier); sfx(g, 'reroll'); }
    if (pr.pick != null && g.offer && g.offer.list[pr.pick] && g.st > 20) {
      if (g.pickPhase === 'stat') applyStatUpgrade(g, g.offer.list[pr.pick]);
      else applyAugment(g, g.offer.list[pr.pick]);
      g.picks--; g.st = 0;
      if (g.picks > 0) { g.pickPhase = 'hex'; rollOffer(g); }
      else { g.offer = null; g.pickPhase = null; nextWave(g); }
    }
    return;
  }
  if (pr.pause) { g.state = 'pause'; return; }

  g.time++;
  const h = g.hero, s = h.s;

  // Movement
  let mx = inp.mx || 0, my = inp.my || 0;
  const m = Math.hypot(mx, my);
  if (m > 1) { mx /= m; my /= m; }
  h.moving = m > 0.15;
  const sp = s.speed * (h.ride > 0 ? (h.mount === 'bike' ? 1.9 : 1.7) : 1);
  h.vx += (mx * sp - h.vx) * 0.35;
  h.vy += (my * sp - h.vy) * 0.35;
  h.x = clamp(h.x + h.vx, -AW + h.r, AW - h.r);
  h.y = clamp(h.y + h.vy, -AH + h.r, AH - h.r);
  pushOut(h);
  if (h.moving) h.face = Math.atan2(my, mx);
  if (h.inv > 0) h.inv--;
  if (h.sayT > 0) h.sayT--;

  if (m > 0.15 || pr.ult) { if (h.afk > 420) say(g, pick(g, Q.afk), 160); h.afk = 0; } else h.afk++;
  if (--h.idleT <= 0) { if (h.sayT <= 0) say(g, pick(g, Q.idle), 150); h.idleT = rnd(g, 600, 900); }

  // Waves
  let bossActive = false;
  if (!g.bossWave) {
    const timerEnded = g.waveT === 1;
    g.waveT = Math.max(0, g.waveT - 1);
    if (g.waveT === 0 && g.enemies.length === 0 && g.spawns.length === 0) { endWave(g); return; }
    if (timerEnded) emit(g, 'cleanup');
  }
  else {
    bossActive = !!g.boss || g.spawns.some((sp) => DEF[sp.type].boss);
    if (!bossActive && g.enemies.length === 0 && g.spawns.length === 0) { endWave(g); return; }
  }
  g.waveClock++;
  while (g.eliteAt.length && g.waveClock >= g.eliteAt[0]) { g.eliteAt.shift(); spawnElite(g); }
  if (g.comboT > 0 && --g.comboT === 0) { g.combo = 0; g.streakIdx = 0; }
  if (h.bless > 0) h.bless--;
  updatePickups(g);
  updateTides(g);
  if ((g.bossWave ? bossActive : g.waveT > 0) && --g.spawnT <= 0 && g.enemies.length < MAX_ENEMIES) {
    queueSpawns(g);
    g.spawnT = Math.max(14, 66 - g.wave * 6) * (g.bossWave ? 2.6 : 1) * rnd(g, 0.8, 1.2);
  }
  for (const sp of g.spawns) {
    if (--sp.t > 0) continue;
    sp.done = true;
    if (Math.hypot(sp.x - h.x, sp.y - h.y) < 1.2 && !DEF[sp.type].boss && !sp.elite) continue; // you stood on it: it fizzles
    g.enemies.push(mkEnemy(g, sp.type, sp.x, sp.y, sp.elite));
    if (sp.elite) { emit(g, 'elite', { name: g.enemies[g.enemies.length - 1].name }); if (h.sayT <= 0) say(g, pick(g, Q.elite), 120); sfx(g, 'elite'); }
    burst(g, sp.x, sp.y, DEF[sp.type].boss ? 'gold' : 'spawn', DEF[sp.type].boss ? 40 : 6);
    if (DEF[sp.type].boss) { emit(g, 'boss', { type: sp.type }); emit(g, 'shake', { amt: 0.8 }); sfx(g, 'slam'); }
  }
  g.spawns = g.spawns.filter((sp) => !sp.done);

  autoFire(g);
  abilities(g);
  if (pr.ult) ult(g);
  updateEnemies(g);
  updateBullets(g);
  updateZones(g);
  updateGems(g);
  g.enemies = g.enemies.filter((e) => !e.dead);
}

function pushOut(b) {
  for (const o of OBSTACLES) {
    const dx = b.x - o.x, dy = b.y - o.y, d = Math.hypot(dx, dy), min = o.r + b.r;
    if (d < min && d > 0.0001) { b.x = o.x + dx / d * min; b.y = o.y + dy / d * min; }
  }
}

function nearestEnemy(g, x, y, range, preferBig = false) {
  let best = null, bd = range;
  for (const e of g.enemies) {
    if (e.dead) continue;
    // bosses and elites count as a little closer, so the turtle works on them between minions
    const d = Math.hypot(e.x - x, e.y - y) - e.r - (preferBig && (DEF[e.type].boss || e.elite) ? 2.5 : 0);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function autoFire(g) {
  const h = g.hero, s = h.s;
  if (--h.cd > 0) return;
  const tgt = nearestEnemy(g, h.x, h.y, s.range, true);
  if (!tgt) { h.cd = 4; return; }
  h.cd = HZ / s.rate;
  const base = Math.atan2(tgt.y - h.y, tgt.x - h.x);
  h.aim = base;
  for (let i = 0; i < s.count; i++) {
    const a = base + (i - (s.count - 1) / 2) * 0.16 + rnd(g, -s.spread, s.spread);
    const sp = 0.32;
    g.bullets.push({ id: g.uid++, x: h.x + Math.cos(a) * 0.6, y: h.y + Math.sin(a) * 0.6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: s.range / sp + 4, pierce: s.pierce, hit: new Set() });
  }
  g.shots++;
  emit(g, 'fire', { a: base });
  sfx(g, 'shoot');
}

function abilities(g) {
  const h = g.hero, s = h.s, T = h.timers, dm = s.dmg / 5;
  if (s.regen && ++T.regen >= 360) { T.regen = 0; if (s.hp < s.maxhp) { s.hp = Math.min(s.maxhp, s.hp + s.regen); pop(g, h.x, h.y, '+' + s.regen + ' ♥', 'heal'); } }
  if (s.shield && h.shields < s.shield && ++T.shield >= 600) { T.shield = 0; h.shields++; sfx(g, 'shieldUp'); }
  if (s.voice && ++T.voice >= 300) {
    T.voice = 0;
    const r = 3 + 0.5 * s.voice;
    emit(g, 'ring', { x: h.x, y: h.y, r, kind: 'voice' });
    sfx(g, 'sweet');
    if (h.sayT <= 0 && R(g) < 0.35) say(g, pick(g, Q.voice), 90);
    for (const e of g.enemies) if (dist(e, h) < r + e.r) { e.stun = Math.max(e.stun, DEF[e.type].boss ? 30 : 90); hitEnemy(g, e, 6 * s.voice * dm, { sfx: false }); }
    g.ebullets = g.ebullets.filter((b) => Math.hypot(b.x - h.x, b.y - h.y) > r);
  }
  if (s.bomb && ++T.bomb >= 240) {
    T.bomb = 0;
    g.bombs.push({ id: g.uid++, x: h.x, y: h.y, t: 80, r: 2.3 + 0.2 * s.bomb, dmg: 16 * s.bomb * dm });
    if (!g.saidBomb) { g.saidBomb = true; say(g, Q.bomb[0], 140); }
    sfx(g, 'plant');
  }
  for (const b of g.bombs) {
    if (--b.t > 0) continue;
    b.done = true;
    emit(g, 'ring', { x: b.x, y: b.y, r: b.r, kind: 'boom' }); emit(g, 'shake', { amt: 0.4 }); burst(g, b.x, b.y, 'boom', 26); sfx(g, 'boom');
    for (const e of g.enemies) if (Math.hypot(e.x - b.x, e.y - b.y) < b.r + e.r) { const d = Math.hypot(e.x - b.x, e.y - b.y) || 1; hitEnemy(g, e, b.dmg, { kx: (e.x - b.x) / d * 0.3, ky: (e.y - b.y) / d * 0.3, sfx: false }); }
  }
  g.bombs = g.bombs.filter((b) => !b.done);

  if (s.hubby && ++T.hubby >= 900) {
    T.hubby = 0;
    const dir = h.x > 0 ? -1 : 1;
    g.hubbyRun = { x: -dir * (AW + 2), y: h.y, dir, hit: new Set(), dmg: 40 * s.hubby * dm };
    say(g, pick(g, Q.hubby), 120); sfx(g, 'hubby'); emit(g, 'hubby', {});
  }
  if (g.hubbyRun) {
    const run = g.hubbyRun;
    run.x += run.dir * 0.42;
    for (const e of g.enemies) if (!run.hit.has(e.id) && Math.abs(e.y - run.y) < 1.3 + e.r && Math.abs(e.x - run.x) < 0.9 + e.r) { run.hit.add(e.id); hitEnemy(g, e, run.dmg, { kx: run.dir * 0.4, ky: 0, sfx: false }); }
    if (Math.abs(run.x) > AW + 3) g.hubbyRun = null;
  }

  // 米拉娜的流星风暴: stars fall on the nearest enemies
  if (s.meteor && ++T.meteor >= Math.max(200, 360 - 50 * (s.meteor - 1))) {
    T.meteor = 0;
    const near = g.enemies.filter((e) => dist(e, h) < 9).sort((a, b) => dist(a, h) - dist(b, h)).slice(0, 2 + s.meteor);
    for (const [i, e] of near.entries()) { const m = { x: e.x, y: e.y, t: 30 + i * 6, r: 1.6, dmg: 20 * s.meteor * dm }; g.meteors.push(m); emit(g, 'meteor', { x: m.x, y: m.y, t: m.t }); }
    if (near.length && h.sayT <= 0 && R(g) < 0.4) say(g, Q.meteor[0], 90);
  }
  for (const m of g.meteors) {
    if (--m.t > 0) continue;
    m.done = true;
    emit(g, 'ring', { x: m.x, y: m.y, r: m.r, kind: 'star' }); burst(g, m.x, m.y, 'gold', 16); emit(g, 'shake', { amt: 0.15 }); sfx(g, 'star');
    for (const e of g.enemies) if (Math.hypot(e.x - m.x, e.y - m.y) < m.r + e.r) hitEnemy(g, e, m.dmg, { sfx: false });
  }
  g.meteors = g.meteors.filter((m) => !m.done);

  // 马背上的民族: every so often she sets off on a horse and tramples through
  if (s.horse && h.ride <= 0 && ++T.horse >= 600) { T.horse = 0; mount(g, 'horse', 240 + 30 * (s.horse - 1)); }
  if (s.bike && h.ride <= 0 && ++T.bike >= 720) { T.bike = 0; mount(g, 'bike', 300 + 30 * (s.bike - 1)); }
  if (h.ride > 0) {
    if (--h.ride === 0) burst(g, h.x, h.y, 'dust', 10);
    for (const e of g.enemies) {
      if (dist(e, h) > h.r + e.r + 0.35 || (e.hitBy.horse || 0) > g.time) continue;
      e.hitBy.horse = g.time + 20;
      const d = dist(e, h) || 1;
      hitEnemy(g, e, 8 * Math.max(1, s.horse) * dm, { kx: (e.x - h.x) / d * 0.35, ky: (e.y - h.y) / d * 0.35, sfx: false });
    }
  }

  // Tornadoes and 大红 orbiting the turtle
  g.orbiters = [];
  const nw = s.wind ? s.wind + 1 : 0;
  for (let i = 0; i < nw; i++) { const a = g.time * 0.045 + (i / nw) * Math.PI * 2; g.orbiters.push({ kind: 'wind', x: h.x + Math.cos(a) * 2.6, y: h.y + Math.sin(a) * 2.6, r: 0.75, dmg: 3 * s.wind * dm, tick: 15 }); }
  for (let i = 0; i < s.orbit; i++) { const a = -g.time * 0.07 + (i / s.orbit) * Math.PI * 2; g.orbiters.push({ kind: 'dahong', x: h.x + Math.cos(a) * 1.55, y: h.y + Math.sin(a) * 1.55, r: 0.4, dmg: 4 * dm, tick: 20 }); }
  if (nw && !g.saidWind) { g.saidWind = true; say(g, Q.wind[0], 160); }
  for (const o of g.orbiters) for (const e of g.enemies) {
    if (Math.hypot(e.x - o.x, e.y - o.y) > o.r + e.r) continue;
    const key = o.kind;
    if ((e.hitBy[key] || 0) > g.time) continue;
    e.hitBy[key] = g.time + o.tick;
    hitEnemy(g, e, o.dmg, { sfx: false });
  }

  // 白牛 companion: charges the thickest knot of enemies, then trots back
  const b = g.bull;
  if (b) {
    b.t++;
    if (b.mode === 'follow') {
      const tx = h.x - Math.cos(h.face) * 1.4, ty = h.y - Math.sin(h.face) * 1.4;
      b.vx += ((tx - b.x) * 0.08 - b.vx) * 0.2; b.vy += ((ty - b.y) * 0.08 - b.vy) * 0.2;
      if (b.t > 90 - s.bull * 15) {
        const tgt = nearestEnemy(g, h.x, h.y, 9);
        if (tgt) { const d = Math.hypot(tgt.x - b.x, tgt.y - b.y) || 1; b.vx = (tgt.x - b.x) / d * 0.26; b.vy = (tgt.y - b.y) / d * 0.26; b.mode = 'charge'; b.t = 0; sfx(g, 'moo'); if (h.sayT <= 0 && R(g) < 0.3) say(g, pick(g, Q.bull), 110); }
      }
    } else if (b.t > 40) { b.mode = 'follow'; b.t = 0; }
    b.x = clamp(b.x + b.vx, -AW + 0.6, AW - 0.6); b.y = clamp(b.y + b.vy, -AH + 0.6, AH - 0.6);
    if (b.mode === 'charge') for (const e of g.enemies) {
      if (Math.hypot(e.x - b.x, e.y - b.y) > 0.8 + e.r || (e.hitBy.bull || 0) > g.time) continue;
      e.hitBy.bull = g.time + 30;
      hitEnemy(g, e, 12 * s.bull * dm, { kx: b.vx * 1.2, ky: b.vy * 1.2, sfx: false });
      burst(g, e.x, e.y, 'dust', 5);
    }
  }
}

function ult(g) {
  const h = g.hero;
  if (h.ult < 100) { if (h.sayT <= 0) say(g, '超级蜘蛛还没充好', 70); return; }
  h.ult = 0;
  say(g, pick(g, Q.ult), 150);
  emit(g, 'ult', { x: h.x, y: h.y }); emit(g, 'shake', { amt: 0.7 }); sfx(g, 'ult');
  for (const e of g.enemies) if (dist(e, h) < 12) e.web = DEF[e.type].boss ? 100 : 260;
  g.ebullets = [];
}

function updateEnemies(g) {
  const h = g.hero, es = g.enemies;
  // gentle separation so crowds spread into a ring instead of a single pile
  for (let i = 0; i < es.length; i++) {
    const a = es[i];
    for (let j = i + 1; j < es.length; j++) {
      const b = es[j], dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r;
      if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
      const d = Math.hypot(dx, dy);
      if (d >= min || d < 1e-4) continue;
      const push = (min - d) * 0.25, ux = dx / d, uy = dy / d;
      const wa = b.r / min, wb = a.r / min;
      a.x -= ux * push * wa; a.y -= uy * push * wa; b.x += ux * push * wb; b.y += uy * push * wb;
    }
  }
  for (const e of es) {
    if (e.dead) continue;
    e.t++;
    if (e.flash > 0) e.flash--;
    // webbed enemies take damage over time and stay put
    if (e.web > 0) {
      e.web--;
      if (e.web % 20 === 0) hitEnemy(g, e, 4 * (h.s.dmg / 5), { sfx: false });
    }
    e.x += e.kx; e.y += e.ky; e.kx *= 0.82; e.ky *= 0.82;
    const dx = h.x - e.x, dy = h.y - e.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const frozen = e.stun > 0 || e.web > 0;
    if (e.stun > 0) e.stun--;
    if (!frozen) behave(g, e, d, ux, uy);
    e.x = clamp(e.x, -AW + e.r, AW - e.r); e.y = clamp(e.y, -AH + e.r, AH - e.r);
    pushOut(e);
    if (!frozen && e.dmg && d < e.r + h.r) hurtHero(g, e.dmg, e.x, e.y);
  }
}

function behave(g, e, d, ux, uy) {
  const h = g.hero;
  const walk = (k = 1) => { e.x += ux * e.sp * k; e.y += uy * e.sp * k; e.face = Math.atan2(uy, ux); };
  switch (e.type) {
    case 'goat':
      if (e.mode === 'walk') { walk(); if (d < 6.5 && --e.cd <= 0) { e.mode = 'wind'; e.modeT = 40; e.cx = ux; e.cy = uy; e.face = Math.atan2(uy, ux); } }
      else if (e.mode === 'wind') { if (--e.modeT <= 0) { e.mode = 'dash'; e.modeT = 24; sfx(g, 'baa'); } }
      else if (e.mode === 'dash') {
        e.x += e.cx * 0.24; e.y += e.cy * 0.24;
        if (--e.modeT <= 0) {
          e.mode = 'walk'; e.cd = rnd(g, 120, 180);
          // 腊肠攻击: a sausage thrown after every charge
          g.ebullets.push({ id: g.uid++, x: e.x, y: e.y, vx: ux * 0.13, vy: uy * 0.13, r: 0.2, life: 200, dmg: 1, kind: 'sausage', spin: 0 });
          pop(g, e.x, e.y, pick(g, SHOUTS.goat), 'shout');
          if (h.sayT <= 0 && d < 9 && R(g) < 0.6) say(g, pick(g, Q.life), 120);
          sfx(g, 'throw');
        }
      }
      break;
    case 'jia': case 'yi': case 'guo': {
      const want = e.type === 'guo' ? 7 : 6;
      if (d > want + 0.6) walk(); else if (d < want - 1.5) walk(-0.8);
      else { e.x += -uy * e.sp * 0.5 * (e.id % 2 ? 1 : -1); e.y += ux * e.sp * 0.5 * (e.id % 2 ? 1 : -1); e.face = Math.atan2(uy, ux); }
      if (--e.cd <= 0 && d < 11) {
        e.cd = rnd(g, 150, 210);
        if (e.type === 'guo') g.zones.push({ id: g.uid++, x: h.x + h.vx * 30, y: h.y + h.vy * 30, r: 1.3, t: 70, T: 70, dmg: 2, kind: 'ping' });
        else g.ebullets.push({ id: g.uid++, x: e.x + ux * 0.5, y: e.y + uy * 0.5, vx: ux * 0.11, vy: uy * 0.11, r: 0.18, life: 220, dmg: 1, kind: 'bolt' });
        sfx(g, e.type === 'guo' ? 'ping' : 'eshoot');
        if (R(g) < 0.3) { pop(g, e.x, e.y, pick(g, SHOUTS[e.type]), 'shout'); if (R(g) < 0.3 && h.sayT <= 0) say(g, pick(g, Q.voice), 90); }
      }
      break;
    }
    case 'orange': {
      // 橘子 rolls in a straight line and bounces off the walls, re-aiming now and then
      if (e.dx == null || --e.cd <= 0) { e.dx = ux; e.dy = uy; e.cd = rnd(g, 150, 220); if (R(g) < 0.25) pop(g, e.x, e.y, pick(g, SHOUTS.orange), 'shout'); }
      e.x += e.dx * e.sp; e.y += e.dy * e.sp;
      if (Math.abs(e.x) > AW - e.r - 0.05) e.dx = -Math.sign(e.x) * Math.abs(e.dx);
      if (Math.abs(e.y) > AH - e.r - 0.05) e.dy = -Math.sign(e.y) * Math.abs(e.dy);
      for (const o of OBSTACLES) { const ox = e.x - o.x, oy = e.y - o.y, od = Math.hypot(ox, oy); if (od < o.r + e.r + 0.05) { const nx = ox / od, ny = oy / od, dot = e.dx * nx + e.dy * ny; if (dot < 0) { e.dx -= 2 * dot * nx; e.dy -= 2 * dot * ny; } } }
      e.face = Math.atan2(e.dy, e.dx);
      e.roll = (e.roll || 0) + e.sp / e.r;
      break;
    }
    case 'dingding':
      // 丁丁 waddles over, then hops in for a hug
      if (e.mode === 'walk') {
        walk();
        if (d < 5.5 && --e.cd <= 0) { e.mode = 'leap'; e.modeT = 40; e.sx = e.x; e.sy = e.y; e.tx = h.x; e.ty = h.y; g.zones.push({ id: g.uid++, x: h.x, y: h.y, r: 1.1, t: 40, T: 40, dmg: 2, kind: 'slam' }); if (R(g) < 0.5) pop(g, e.x, e.y, pick(g, SHOUTS.dingding), 'shout'); }
      } else {
        const k = 1 - e.modeT / 40;
        e.x = e.sx + (e.tx - e.sx) * k; e.y = e.sy + (e.ty - e.sy) * k; e.hop = Math.sin(k * Math.PI) * 1.6;
        if (--e.modeT <= 0) { e.mode = 'walk'; e.hop = 0; e.cd = rnd(g, 140, 200); burst(g, e.x, e.y, 'dust', 10); }
      }
      break;
    case 'caesar':
      // Caesar keeps a little distance and throws a pilum
      if (d > 5.5) walk(); else if (d < 3.5) walk(-0.6); else walk(0.2);
      if (--e.cd <= 0 && d < 9) {
        e.cd = rnd(g, 150, 200); e.throwT = 18;
        g.ebullets.push({ id: g.uid++, x: e.x + ux * 0.5, y: e.y + uy * 0.5, vx: ux * 0.16, vy: uy * 0.16, r: 0.18, life: 140, dmg: 2, kind: 'spear' });
        if (R(g) < 0.35) pop(g, e.x, e.y, pick(g, SHOUTS.caesar), 'shout');
        sfx(g, 'throw');
      }
      if (e.throwT > 0) e.throwT--;
      break;
    case 'chenwei':
      // 陈伟 (CT): stops to aim, fires a three-round burst, and sometimes a flashbang
      if (e.mode === 'walk') {
        if (d > 8.5) walk(); else if (d < 5) walk(-0.8); else { e.x += -uy * e.sp * 0.4; e.y += ux * e.sp * 0.4; e.face = Math.atan2(uy, ux); }
        if (--e.cd <= 0 && d < 12) {
          if (R(g) < 0.3) { g.zones.push({ id: g.uid++, x: h.x + h.vx * 25, y: h.y + h.vy * 25, r: 3.2, t: 55, T: 55, dmg: 0, kind: 'flash' }); pop(g, e.x, e.y, 'Fire in the hole!', 'shout'); e.cd = rnd(g, 160, 220); }
          else { e.mode = 'aim'; e.modeT = 50; e.aimX = h.x; e.aimY = h.y; }
        }
      } else if (e.mode === 'aim') {
        e.aimX += (h.x - e.aimX) * 0.05; e.aimY += (h.y - e.aimY) * 0.05;
        e.face = Math.atan2(e.aimY - e.y, e.aimX - e.x);
        if (--e.modeT <= 0) { e.mode = 'burst'; e.modeT = 18; }
      } else if (e.mode === 'burst') {
        if (e.modeT % 6 === 0) {
          const a = Math.atan2(e.aimY - e.y, e.aimX - e.x) + rnd(g, -0.05, 0.05);
          g.ebullets.push({ id: g.uid++, x: e.x + Math.cos(a) * 0.5, y: e.y + Math.sin(a) * 0.5, vx: Math.cos(a) * 0.24, vy: Math.sin(a) * 0.24, r: 0.12, life: 90, dmg: 1, kind: 'bolt' });
          sfx(g, 'rifle');
        }
        if (--e.modeT <= 0) { e.mode = 'walk'; e.cd = rnd(g, 130, 190); if (R(g) < 0.25) pop(g, e.x, e.y, pick(g, SHOUTS.chenwei), 'shout'); }
      }
      break;
    case 'ginger': {
      // 姜饼人 zig-zags in so it is hard to pin down
      if (--e.cd <= 0) { e.side = (e.side || 1) * -1; e.cd = rnd(g, 26, 46); if (R(g) < 0.12) pop(g, e.x, e.y, pick(g, SHOUTS.ginger), 'shout'); }
      const k = d < 2.2 ? 0.2 : 0.85;
      e.x += (ux + -uy * (e.side || 1) * k) * e.sp; e.y += (uy + ux * (e.side || 1) * k) * e.sp;
      e.face = Math.atan2(uy + ux * (e.side || 1) * k, ux - uy * (e.side || 1) * k);
      break;
    }
    case 'oyster':
      walk();
      if (e.t % 400 === 0 && R(g) < 0.3) pop(g, e.x, e.y, pick(g, SHOUTS.oyster), 'shout');
      if (--e.cd <= 0 && d < 9) {
        e.cd = DEF.oyster.spit; e.open = 20;
        const a0 = Math.atan2(uy, ux);
        for (let k = -1; k <= 1; k++) g.ebullets.push({ id: g.uid++, x: e.x, y: e.y, vx: Math.cos(a0 + k * 0.28) * 0.09, vy: Math.sin(a0 + k * 0.28) * 0.09, r: 0.16, life: 200, dmg: 1, kind: 'pearl' });
        sfx(g, 'spit');
      }
      if (e.open > 0) e.open--;
      break;
    case 'thief': {
      // 吴浩然 goes for the candy on the floor, and now and then names his bride price
      if (e.skill == null) e.skill = rnd(g, 120, 200);
      if (d < 7.5 && --e.skill <= 0) {
        e.skill = rnd(g, 240, 320);
        const a0 = Math.atan2(uy, ux);
        for (let k = -1; k <= 1; k++) g.ebullets.push({ id: g.uid++, x: e.x, y: e.y, vx: Math.cos(a0 + k * 0.32) * 0.1, vy: Math.sin(a0 + k * 0.32) * 0.1, r: 0.2, life: 220, dmg: 1, kind: 'hongbao' });
        pop(g, e.x, e.y, pick(g, SHOUTS.caili), 'shout');
        sfx(g, 'throw');
      }
      let best = null, bd = 1e9;
      for (const gem of g.gems) { const dd = Math.hypot(gem.x - e.x, gem.y - e.y); if (dd < bd) { bd = dd; best = gem; } }
      if (d < 3.5) { walk(-1.1); if (e.t % 300 === 1 && R(g) < 0.5) pop(g, e.x, e.y, pick(g, SHOUTS.thief), 'shout'); }
      else if (best) {
        const ddx = best.x - e.x, ddy = best.y - e.y, dd = Math.hypot(ddx, ddy) || 1;
        e.x += ddx / dd * e.sp; e.y += ddy / dd * e.sp; e.face = Math.atan2(ddy, ddx);
        if (dd < 0.5) { best.gone = true; e.carry++; if (e.carry === 3) pop(g, e.x, e.y, pick(g, SHOUTS.thief), 'shout'); }
      } else walk(0.6);
      g.gems = g.gems.filter((x) => !x.gone);
      break;
    }
    case 'bigmao':
      if (e.mode === 'walk') { walk(); if (--e.cd <= 0) { pop(g, e.x, e.y, pick(g, SHOUTS.mao), 'shout'); e.mode = 'leap'; e.modeT = 60; e.tx = h.x; e.ty = h.y; e.sx = e.x; e.sy = e.y; g.zones.push({ id: g.uid++, x: h.x, y: h.y, r: 2.4, t: 60, T: 60, dmg: 2, kind: 'slam' }); } }
      else if (e.mode === 'leap') {
        const k = 1 - e.modeT / 60;
        e.x = e.sx + (e.tx - e.sx) * k; e.y = e.sy + (e.ty - e.sy) * k; e.hop = Math.sin(k * Math.PI) * 4;
        if (--e.modeT <= 0) { e.mode = 'walk'; e.hop = 0; e.cd = rnd(g, 200, 260); emit(g, 'shake', { amt: 0.6 }); burst(g, e.x, e.y, 'fluff', 30); sfx(g, 'slam'); if (g.enemies.length < MAX_ENEMIES) for (let i = 0; i < 2; i++) g.enemies.push(mkEnemy(g, 'maoqiu', e.x + rnd(g, -1, 1), e.y + rnd(g, -1, 1))); }
      }
      break;
    case 'judge': {
      const angry = e.hp < e.max / 2;
      if (e.mode === 'walk') {
        walk(angry ? 1.4 : 1);
        if (--e.cd <= 0) {
          const moves = ['slam', 'papers', 'gavel'];
          e.mode = moves[(e.moveIdx = ((e.moveIdx ?? -1) + 1) % 3)];
          e.modeT = 50;
          if (R(g) < 0.6) pop(g, e.x, e.y, pick(g, SHOUTS.judge), 'shout');
          if (e.mode === 'slam') g.zones.push({ id: g.uid++, x: e.x, y: e.y, r: 4, t: 50, T: 50, dmg: 3, kind: 'slam', follow: e.id });
          if (e.mode === 'gavel') for (let i = 0; i < (angry ? 7 : 5); i++) { const a = rnd(g, 0, Math.PI * 2), rr = i === 0 ? 0 : rnd(g, 1.5, 4); g.zones.push({ id: g.uid++, x: h.x + Math.cos(a) * rr, y: h.y + Math.sin(a) * rr, r: 1.2, t: 55 + i * 6, T: 55 + i * 6, dmg: 2, kind: 'gavel' }); }
        }
      } else if (--e.modeT <= 0) {
        if (e.mode === 'papers') {
          const n = angry ? 18 : 12, off = rnd(g, 0, 1);
          for (let i = 0; i < n; i++) { const a = (i + off) / n * Math.PI * 2; g.ebullets.push({ id: g.uid++, x: e.x, y: e.y, vx: Math.cos(a) * 0.1, vy: Math.sin(a) * 0.1, r: 0.25, life: 260, dmg: 1, kind: 'paper', spin: rnd(g, 0, 6) }); }
          sfx(g, 'throw');
        }
        if (angry && R(g) < 0.5 && g.enemies.length < MAX_ENEMIES) for (let i = 0; i < 2; i++) g.spawns.push({ x: clamp(e.x + rnd(g, -3, 3), -AW + 1, AW - 1), y: clamp(e.y + rnd(g, -3, 3), -AH + 1, AH - 1), type: R(g) < 0.5 ? 'jia' : 'yi', t: 50 });
        e.mode = 'walk'; e.cd = angry ? 110 : 160;
      }
      break;
    }
    case 'mao': case 'maoqiu':
      walk();
      if (e.type === 'mao' && e.t % 300 === 0 && R(g) < 0.4) pop(g, e.x, e.y, pick(g, SHOUTS.mao), 'shout');
      break;
    default: walk();
  }
}

function updateBullets(g) {
  const h = g.hero, s = h.s;
  for (const b of g.bullets) {
    b.x += b.vx; b.y += b.vy;
    if (--b.life <= 0 || Math.abs(b.x) > AW || Math.abs(b.y) > AH) { b.dead = true; g.missStreak++; continue; }
    for (const e of g.enemies) {
      if (e.dead || b.hit.has(e.id)) continue;
      if (Math.hypot(e.x - b.x, e.y - b.y) > e.r + 0.15) continue;
      b.hit.add(e.id);
      g.hitsTotal++;
      if (g.missStreak >= 4 && h.sayT <= 0) say(g, pick(g, Q.hit), 100);
      g.missStreak = 0;
      const sp = Math.hypot(b.vx, b.vy);
      hitEnemy(g, e, s.dmg, { canCrit: true, kx: b.vx / sp * 0.06, ky: b.vy / sp * 0.06 });
      burst(g, b.x, b.y, 'spark', 4);
      if (b.pierce-- <= 0) { b.dead = true; break; }
    }
  }
  g.bullets = g.bullets.filter((b) => !b.dead);
  for (const b of g.ebullets) {
    b.x += b.vx; b.y += b.vy;
    if (--b.life <= 0 || Math.abs(b.x) > AW + 1 || Math.abs(b.y) > AH + 1) { b.dead = true; continue; }
    if (Math.hypot(h.x - b.x, h.y - b.y) < h.r + b.r) { b.dead = true; if (hurtHero(g, b.dmg, b.x, b.y) && b.kind === 'hongbao') pop(g, h.x, h.y, '彩礼 -38.8W', 'shout'); }
  }
  g.ebullets = g.ebullets.filter((b) => !b.dead);
}

function updateZones(g) {
  const h = g.hero;
  for (const z of g.zones) {
    if (z.follow) { const e = g.enemies.find((x) => x.id === z.follow); if (e) { z.x = e.x; z.y = e.y; } }
    if (--z.t > 0) continue;
    z.done = true;
    if (z.kind === 'flash') { emit(g, 'ring', { x: z.x, y: z.y, r: z.r, kind: 'flash' }); sfx(g, 'flash'); if (Math.hypot(h.x - z.x, h.y - z.y) < z.r) { emit(g, 'flashbang', {}); if (h.sayT <= 0) say(g, pick(g, Q.flash), 110); } continue; }
    emit(g, 'ring', { x: z.x, y: z.y, r: z.r, kind: z.kind });
    burst(g, z.x, z.y, z.kind === 'ping' ? 'ping' : 'dust', 14);
    sfx(g, z.kind === 'ping' ? 'pingland' : 'slam');
    if (z.kind !== 'ping') emit(g, 'shake', { amt: 0.25 });
    if (Math.hypot(h.x - z.x, h.y - z.y) < z.r + h.r * 0.5) hurtHero(g, z.dmg, z.x, z.y);
  }
  g.zones = g.zones.filter((z) => !z.done);
}

function updateGems(g) {
  const h = g.hero, R2 = h.s.pickup;
  for (const gem of g.gems) {
    const dx = h.x - gem.x, dy = h.y - gem.y, d = Math.hypot(dx, dy);
    if (d < R2) gem.mag = true;
    if (gem.mag) {
      gem.vx += dx / (d || 1) * 0.03; gem.vy += dy / (d || 1) * 0.03;
      gem.vx *= 0.9; gem.vy *= 0.9;
      gem.x += gem.vx; gem.y += gem.vy;
      if (d < 0.45) { gem.got = true; gainXp(g, gem.v); sfx(g, 'gem'); }
    }
  }
  g.gems = g.gems.filter((x) => !x.got);
}

// ---------- elites and pickups ----------
function spawnElite(g) {
  const h = g.hero;
  const pool = Object.keys(POOLS[g.wave]).filter((k) => k !== 'maoqiu');
  const type = pool[Math.floor(R(g) * pool.length)];
  const affix = pick(g, Object.keys(ELITE_AFFIX));
  let x, y, tries = 0;
  do { x = rnd(g, -AW + 2, AW - 2); y = rnd(g, -AH + 2, AH - 2); } while (Math.hypot(x - h.x, y - h.y) < 6 && ++tries < 20);
  g.spawns.push({ x, y, type, t: 80, elite: affix });
}

export function mkPickup(g, kind, x, y) {
  return { id: g.uid++, kind, x: clamp(x, -AW + 1, AW - 1), y: clamp(y, -AH + 1, AH - 1), t: kind === 'chest' ? 20 * HZ : 14 * HZ, born: g.t };
}

function rollPickup(g) {
  const kinds = Object.entries(PICKUPS).filter(([, p]) => p.w > 0);
  const total = kinds.reduce((a, [, p]) => a + p.w, 0);
  let r = R(g) * total;
  for (const [k, p] of kinds) if ((r -= p.w) < 0) return k;
  return 'douzhi';
}

function updatePickups(g) {
  const h = g.hero;
  if (--g.pickT <= 0) {
    g.pickT = rnd(g, 540, 780);
    const a = rnd(g, 0, Math.PI * 2), d = rnd(g, 3, 7);
    g.pickups.push(mkPickup(g, rollPickup(g), h.x + Math.cos(a) * d, h.y + Math.sin(a) * d));
    sfx(g, 'pickupSpawn');
  }
  for (const p of g.pickups) {
    if (--p.t <= 0) { p.gone = true; continue; }
    if (Math.hypot(p.x - h.x, p.y - h.y) < 1) { p.gone = true; usePickup(g, p); }
  }
  g.pickups = g.pickups.filter((p) => !p.gone);
  if (g.stampede) {
    const st = g.stampede;
    st.x += st.dir * 0.36;
    for (const b of st.bulls) for (const e of g.enemies) {
      if (st.hit.has(e.id) || Math.abs(e.y - (st.y + b)) > 1 + e.r || Math.abs(e.x - st.x) > 1 + e.r) continue;
      st.hit.add(e.id);
      hitEnemy(g, e, st.dmg, { kx: st.dir * 0.5, ky: 0, sfx: false });
    }
    if (Math.abs(st.x) > AW + 4) g.stampede = null;
  }
}

function meteorShower(g, n, dmg) {
  const h = g.hero;
  const targets = g.enemies.slice().sort((a, b) => dist(a, h) - dist(b, h)).slice(0, n);
  for (let i = 0; i < n; i++) {
    const e = targets[i];
    const m = e ? { x: e.x, y: e.y } : { x: h.x + rnd(g, -6, 6), y: h.y + rnd(g, -5, 5) };
    Object.assign(m, { t: 20 + i * 5, r: 1.8, dmg });
    g.meteors.push(m);
    emit(g, 'meteor', { x: m.x, y: m.y, t: m.t });
  }
}

function stampede(g, n, dmg) {
  const h = g.hero;
  const dir = h.x > 0 ? -1 : 1;
  const rows = n === 3 ? [-1.4, 0, 1.4] : [-2.8, -1.4, 0, 1.4, 2.8];
  g.stampede = { x: -dir * (AW + 3), y: h.y, dir, bulls: rows, hit: new Set(), dmg };
  emit(g, 'stampede', {}); sfx(g, 'moo'); sfx(g, 'gallop');
}

function usePickup(g, p) {
  const h = g.hero, s = h.s, dm = s.dmg / 5;
  const info = PICKUPS[p.kind];
  let text = info.name;
  switch (p.kind) {
    case 'horse': mount(g, 'horse', 360); break;
    case 'bike': mount(g, 'bike', 360); break;
    case 'bull': stampede(g, 3, 30 * dm); break;
    case 'meteor': meteorShower(g, 8, 25 * dm); break;
    case 'chief': h.bless = 480; burst(g, h.x, h.y, 'gold', 40); break;
    case 'spider': h.ult = Math.min(100, h.ult + 50); break;
    case 'douzhi': s.hp = Math.min(s.maxhp, s.hp + s.maxhp * 0.4); break;
    case 'magnet': for (const gem of g.gems) gem.mag = true; break;
    case 'chest': {
      g.score += 500;
      const r = Math.floor(R(g) * 4);
      if (r === 0) { meteorShower(g, 16, 30 * dm); text = '大红宝箱 · 流星雨'; }
      else if (r === 1) { stampede(g, 5, 40 * dm); text = '大红宝箱 · 白牛群'; }
      else if (r === 2) { s.hp = s.maxhp; h.shields = Math.max(h.shields, 1) + 1; text = '大红宝箱 · 满血加护盾'; }
      else { h.ult = 100; text = '大红宝箱 · 超级蜘蛛充满'; }
      burst(g, p.x, p.y, 'gold', 50);
      break;
    }
  }
  if (p.kind !== 'horse' && p.kind !== 'bike') say(g, p.kind === 'chest' ? pick(g, Q.chest) : info.line, 130);
  emit(g, 'pickup', { kind: p.kind, x: p.x, y: p.y, text });
  sfx(g, p.kind === 'chest' ? 'chest' : 'pickup');
  burst(g, p.x, p.y, 'sugar', 18);
}

// ---------- 潮汐监狱: tides sweep the yard in the late waves ----------
function updateTides(g) {
  const h = g.hero, s = h.s;
  if (g.wave >= 7 && g.wave <= 9 && --g.tideT <= 0) {
    g.tideT = rnd(g, 720, 900);
    const dir = R(g) < 0.5 ? 1 : -1;
    g.tides.push({ id: g.uid++, x: -dir * (AW + 2), dir, warn: 90, friendly: false, hit: new Set() });
    emit(g, 'tideWarn', { dir });
    if (!g.tideSaid) { g.tideSaid = true; say(g, pick(g, Q.tide), 160); }
  }
  if (s.tide && ++h.timers.tide >= Math.max(480, 720 - 90 * (s.tide - 1))) {
    h.timers.tide = 0;
    const dir = h.x > 0 ? -1 : 1;
    g.tides.push({ id: g.uid++, x: -dir * (AW + 2), dir, warn: 0, friendly: true, hit: new Set(), dmg: 15 * s.tide * (s.dmg / 5) });
    sfx(g, 'tide');
  }
  for (const t of g.tides) {
    if (t.warn > 0) { if (--t.warn === 0) sfx(g, 'tide'); continue; }
    t.x += t.dir * 0.3;
    const inBand = (b) => Math.abs(b.x - t.x) < 1.4;
    if (!t.friendly && inBand(h)) { h.vx += t.dir * 0.04; h.x = clamp(h.x + t.dir * 0.12, -AW + h.r, AW - h.r); }
    for (const e of g.enemies) {
      if (!inBand(e)) continue;
      e.kx += t.dir * (t.friendly ? 0.06 : 0.03);
      if (t.friendly && !t.hit.has(e.id)) { t.hit.add(e.id); hitEnemy(g, e, t.dmg, { sfx: false }); }
    }
    if (Math.abs(t.x) > AW + 3 && Math.sign(t.x) === t.dir) t.done = true;
  }
  g.tides = g.tides.filter((t) => !t.done);
}

// 马背上的民族 / 北京骑行夫妇: she shouts it every time she sets off
function mount(g, kind, frames) {
  const h = g.hero;
  h.ride = frames; h.mount = kind;
  say(g, pick(g, kind === 'bike' ? Q.bike : Q.horse), 130);
  emit(g, 'horse', { kind });
  sfx(g, kind === 'bike' ? 'bell' : 'gallop');
}
