// HEXLOOP rules. Pure data + functions, no DOM / Three.js, so it runs headless in tests.
// Turn order: you move → loops resolve → red hexes hurt you → lancers fire / bombers blast → enemies act → new telegraphs.
import { DIRS, K, P, hd, makeGrid, hashStr } from './hex.js';
import { TUTORIAL, SECTOR1 } from './levels.js';
import { MODS, TIER, CORES, ENEMY_INFO, BOSSES, isBoss, ACTS, actOf, actInfo, HEAT } from './content.js';
export { MODS, TIER, CORES, ENEMY_INFO, BOSSES, isBoss, ACTS, actOf, actInfo, HEAT };

export const FINAL = 9;
export const BOSS_EVERY = 3;
export const LANCER_RANGE = 3;
export const DAZE_AFTER = 12; // turns without a capture before enemies get dazed (stall safety net)
const WALKERS = ['drone', 'brute', 'eater', 'mite', 'splitter', 'bomber', 'colossus'];
const LUNGERS = ['drone', 'brute', 'splitter', 'colossus'];
const BOSS_HP = { hive: 3, warden: 4, colossus: 5 };

export const coreOf = (id) => CORES.find((c) => c.id === id) || CORES[0];
export const S = { run: null, meta: null, grid: null, walls: new Set(), lava: new Set(), hedge: new Set(), events: [] };
const ev = (t, o = {}) => S.events.push(Object.assign({ t }, o));
export function takeEvents() { const e = S.events; S.events = []; return e; }

export function defMeta() {
  return { v: 3, shards: 0, unlocked: ['spark'], core: 'spark', best: 0, bestSector: 0, bestEndless: 0, runs: 0, wins: 0, daily: null,
    streak: { date: null, n: 0 }, seen: [], seenMods: [], tutorialDone: false, muted: false, music: true, heat: 0, heatSel: 0 };
}
export function setRun(run) {
  S.run = run;
  if (run) { S.grid = makeGrid(run.rad); S.walls = new Set(run.walls); S.lava = new Set(run.lava || []); S.hedge = new Set(run.hedge || []); }
}
export const utcDate = (d = new Date()) => d.toISOString().slice(0, 10);
const prevDate = (s) => utcDate(new Date(Date.parse(s + 'T00:00:00Z') - 864e5));

// ---------- rng: state lives in the run so reloads / undo can't reroll
function rnd() { const r = S.run; r.rng = (r.rng + 0x6D2B79F5) | 0; let t = r.rng; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const ri = (n) => Math.floor(rnd() * n);
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = ri(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- helpers
export const pk = () => K(S.run.player[0], S.run.player[1]);
export function occ() { const m = new Map(); for (const e of S.run.enemies) m.set(K(e.q, e.r), e); return m; }
const has = (id) => S.run.mods[id] || 0;
export const tailLen = () => S.run.tailLen || coreOf(S.run.core).tail + 3 * has('tail') + 6 * has('infinity');
export const lancerRange = () => Math.max(2, LANCER_RANGE - has('steady'));
const isEdge = (k) => { const [q, r] = P(k); return hd(q, r, 0, 0) === S.grid.rad; };
// Enemies stay off the rim, off lava/hedges and away from rocks & lava, so every enemy always has a clear ring around it.
const enemyOk = (k) => !isEdge(k) && !S.lava.has(k) && !S.hedge.has(k) && !S.grid.nb[k].some((n) => S.walls.has(n) || S.lava.has(n));
export const bossOf = () => S.run.enemies.find((e) => isBoss(e.type));
const heat = () => S.run.heat || 0;

function baseRun(mode, coreId) {
  const core = coreOf(mode === 'run' ? coreId : 'spark'), date = utcDate(), h = mode === 'run' ? Math.min(S.meta.heatSel || 0, S.meta.heat || 0) : 0;
  const hp = Math.max(1, core.hp - (h >= 5 ? 1 : 0));
  return { v: 3, mode, date, core: core.id, heat: h, endless: false, rng: mode === 'daily' ? hashStr('hexloop2:' + date) : (Math.random() * 2 ** 31) | 0,
    sector: 0, tut: -1, score: 0, kills: 0, shardsRun: 0, hp, maxHp: hp, mods: Object.assign({}, core.mods), dash: core.mods.overclock ? 1 : 0,
    turn: 0, combo: 0, lastCap: -99, rad: 4, walls: [], lava: [], hedge: [], tail: [], tailLen: null, player: [0, 0], enemies: [], nextId: 1, pickups: {},
    spawns: [], quota: 0, spawned: 0, nextSpawn: 0, spawnEvery: 6, boss: false, bossType: null, phase: 'play', choices: null, choiceTier: null, log: [],
    undo: null, undoLeft: 1, shieldUsed: false, swUsed: false, strikeUsed: false, phoenixUsed: false, hint: '', ghost: null, goal: null, title: '', idle: 0, dazed: false };
}
export function startRun(mode = 'run') {
  const run = baseRun(mode, S.meta.core);
  if (mode !== 'tutorial') S.meta.runs++;
  if (mode === 'daily') S.meta.daily = { date: run.date, done: false, score: 0, sector: 0, log: [] };
  setRun(run);
  for (const id of Object.keys(run.mods)) noteMod(id);
  if (mode === 'tutorial') nextTutorial(); else nextSector();
}
// turrets keep 5+ hexes apart so their lasers never cover each other's ring
function safeType(type, q, r) {
  if (type === 'lancer' && S.run.mode !== 'tutorial' && S.run.enemies.some((e) => e.type === 'lancer' && hd(e.q, e.r, q, r) < 5)) return 'drone';
  return type;
}
export function addEnemy(type, q, r, sleep) {
  type = safeType(type, q, r);
  const hp = type === 'brute' ? 2 : isBoss(type) ? BOSS_HP[type] + 2 * Math.floor((S.run.sector - 1) / 9) : 1;
  const e = { id: S.run.nextId++, type, q, r, hp, maxHp: hp, aim: -1, cd: type === 'lancer' ? 1 : type === 'colossus' ? 2 : 0, tg: null, sleep: !!sleep };
  if (type === 'bomber') e.fuse = 4;
  S.run.enemies.push(e);
  return e;
}
function resetBoard(rad) {
  Object.assign(S.run, { rad, walls: [], lava: [], hedge: [], tail: [], player: [0, 0], enemies: [], pickups: {}, spawns: [], turn: 0, combo: 0, lastCap: -99,
    shieldUsed: false, swUsed: false, strikeUsed: false, phase: 'play', choices: null, hint: '', ghost: null, goal: null, tailLen: null, idle: 0, dazed: false,
    undo: null, undoLeft: 1 + has('rewind'), title: '' });
  setRun(S.run);
}
function loadLevel(L) {
  const r = S.run;
  resetBoard(L.rad);
  Object.assign(r, { walls: L.walls.slice(), lava: (L.lava || []).slice(), hedge: (L.hedge || []).slice(), player: L.player.slice(), hint: L.hint || '',
    ghost: L.ghost ? L.ghost.slice() : null, goal: L.goal || null, tailLen: L.tail || null, title: L.title || '' });
  setRun(r);
  for (const e of L.enemies) addEnemy(e.type, e.q, e.r, e.sleep);
  for (const k of L.shards || []) r.pickups[k] = 'shard';
}
export function nextTutorial() {
  const r = S.run;
  r.tut++;
  if (r.tut >= TUTORIAL.length) { S.meta.tutorialDone = true; r.phase = 'tutdone'; ev('tutdone'); return; }
  loadLevel(TUTORIAL[r.tut]);
  r.hp = r.maxHp = 3; r.quota = 0; r.spawned = 0; r.nextSpawn = 1e9;
  computeIntents(); noteNewEnemies(); ev('level');
}
export function retryTutorial() { S.run.tut--; nextTutorial(); }

function reachableAll(block, rad) {
  const g = makeGrid(rad), bar = new Set(block); bar.add('0,0');
  const reach = new Set(), st = [];
  for (const k of g.keys) { const [q, r] = P(k); if (!bar.has(k) && hd(q, r, 0, 0) === rad) { reach.add(k); st.push(k); } }
  while (st.length) { const c = st.pop(); for (const n of g.nb[c]) if (!bar.has(n) && !reach.has(n)) { reach.add(n); st.push(n); } }
  return g.keys.every((k) => bar.has(k) || reach.has(k));
}
function randFree(pred, spaced = true, strict = false) {
  const r = S.run, o = occ(), p = pk(), sp = new Set(r.spawns.map((s) => K(s.q, s.r))), tail = new Set(r.tail);
  const near = new Set(); if (spaced) for (const k of [...o.keys(), ...sp]) for (const n of S.grid.nb[k]) near.add(n);
  const c = S.grid.keys.filter((k) => !S.walls.has(k) && !S.lava.has(k) && !o.has(k) && !r.pickups[k] && k !== p && !sp.has(k) && !tail.has(k) && !near.has(k) && (!pred || pred(P(k))));
  if (!c.length) return strict ? null : pred ? randFree(null, spaced) : spaced ? randFree(null, false) : null;
  return P(c[ri(c.length)]);
}
function randEnemy(pred) {
  const ok = ([q, r]) => enemyOk(K(q, r));
  return randFree(([q, r]) => ok([q, r]) && (!pred || pred([q, r])), true, true)
    || randFree(ok, true, true); // never a rim / rock-side / lava hex, never touching another enemy
}
function pickType() {
  const r = S.run, s = r.sector, x = rnd(), h = heat();
  const lancers = r.enemies.filter((e) => e.type === 'lancer').length + r.spawns.filter((w) => w.ty === 'lancer').length;
  const elite = h >= 3 ? 0.12 : 0;
  if (s >= 7 && x < 0.12) return 'mite';
  if (s >= 5 && x < 0.22) return 'eater';
  if (s >= 4 && x < 0.34 + elite) return 'bomber';
  if (s >= 4 && x < 0.46 + elite * 2) return 'brute';
  if (s >= 5 && x < 0.58 + elite * 2) return 'splitter';
  if (s >= 2 && x < 0.72 + elite * 2 && lancers < (s >= 6 ? 2 : 1)) return 'lancer';
  return 'drone';
}
function genTerrain(act) {
  const r = S.run;
  for (let t = 0; t < 150; t++) {
    const n = 3 + ri(4), ws = new Set(), cand = shuffle(S.grid.keys.filter((k) => { const [q, rr] = P(k); return hd(q, rr, 0, 0) >= 2; }));
    for (const k of cand) {
      if (ws.size >= n) break;
      ws.add(k);
      if (rnd() < 0.5 && ws.size < n) { const [q, rr] = P(k), [dq, dr] = DIRS[ri(6)], k2 = K(q + dq, rr + dr); if (S.grid.nb[k].includes(k2) && hd(q + dq, rr + dr, 0, 0) >= 2) ws.add(k2); }
    }
    if (!reachableAll([...ws], 4)) continue;
    const free = shuffle(S.grid.keys.filter((k) => !ws.has(k) && hd(...P(k), 0, 0) >= 2));
    const lava = free.slice(0, act.lava), hedge = free.slice(act.lava, act.lava + act.hedge);
    r.walls = [...ws]; r.lava = lava; r.hedge = hedge; setRun(r);
    // need enough clear ground for enemies to stand on
    if (S.grid.keys.filter((k) => enemyOk(k) && !S.walls.has(k)).length >= 14) return;
  }
  r.walls = []; r.lava = []; r.hedge = []; setRun(r);
}
export function nextSector() {
  const r = S.run;
  r.sector++;
  const s = r.sector, act = actInfo(s);
  r.boss = s % BOSS_EVERY === 0;
  r.bossType = r.boss ? act.boss : null;
  if (s === 1 && r.mode === 'run') {
    loadLevel(SECTOR1);
    r.quota = SECTOR1.quota + (heat() >= 1 ? 1 : 0); r.spawned = SECTOR1.enemies.length; r.spawnEvery = SECTOR1.spawnEvery - (heat() >= 2 ? 1 : 0); r.nextSpawn = r.spawnEvery;
  } else {
    resetBoard(4);
    genTerrain(act);
    const far = ([q, rr]) => hd(q, rr, 0, 0) === 3;
    r.spawnEvery = Math.max(3, 6 - Math.floor(Math.min(s, 12) / 3) - (heat() >= 2 ? 1 : 0));
    if (r.boss) {
      const h = randEnemy(([q, rr]) => hd(q, rr, 0, 0) === 2) || randEnemy(null);
      addEnemy(r.bossType, h[0], h[1]);
      r.quota = 0; r.spawned = 0; r.nextSpawn = 3; r.spawnEvery = 4;
      const d = randEnemy(far); if (d) addEnemy('drone', d[0], d[1]);
      if (s >= 6) { const b0 = bossOf(), l = randEnemy(([q, rr]) => far([q, rr]) && hd(q, rr, b0.q, b0.r) >= 4); if (l) addEnemy('lancer', l[0], l[1]); }
    } else {
      r.quota = Math.min(14, 3 + s) + (heat() >= 1 ? 1 : 0);
      const init = Math.min(r.quota, 2 + Math.floor(Math.min(s, 10) / 2) + (heat() >= 1 ? 1 : 0));
      for (let i = 0; i < init; i++) { const h = randEnemy(far); if (h) addEnemy(i === 0 ? 'drone' : pickType(), h[0], h[1]); }
      r.spawned = init; r.nextSpawn = r.spawnEvery;
    }
    const ns = 2 + ri(2);
    for (let i = 0; i < ns; i++) { const h = randFree(([q, rr]) => hd(q, rr, 0, 0) >= 2); if (h) r.pickups[K(h[0], h[1])] = 'shard'; }
    if (rnd() < (r.hp < r.maxHp ? 0.55 : 0.12) + (has('midas') ? 0.35 : 0)) { const h = randFree(([q, rr]) => hd(q, rr, 0, 0) >= 2); if (h) r.pickups[K(h[0], h[1])] = 'heart'; }
    if (rnd() < act.shrine) { const h = randFree(([q, rr]) => hd(q, rr, 0, 0) >= 2); if (h) r.pickups[K(h[0], h[1])] = 'shrine'; }
    const boss = bossOf();
    r.hint = r.boss ? `Boss! Loop the ${ENEMY_INFO[r.bossType].n} ${boss.hp} times.` : `${act.n}: destroy ${r.quota} enemies.`;
  }
  computeIntents(); noteNewEnemies(); ev('level');
}
function noteNewEnemies() {
  const types = new Set(S.run.enemies.map((e) => e.type));
  for (const s of S.run.spawns) types.add(s.ty);
  for (const t of types) if (!S.meta.seen.includes(t)) { S.meta.seen.push(t); ev('newEnemy', { type: t }); }
}
function noteMod(id) { if (S.meta && !S.meta.seenMods.includes(id)) S.meta.seenMods.push(id); }

// ---------- telegraphs
export function beam(e, d) {
  const out = []; let q = e.q, r = e.r; const [dq, dr] = DIRS[d];
  for (let i = 0; i < lancerRange(); i++) { q += dq; r += dr; const k = K(q, r); if (!S.grid.nb[k] || S.walls.has(k)) break; out.push(k); }
  return out;
}
function alignDir(e) {
  const [pq, pr] = S.run.player;
  for (let d = 0; d < 6; d++) {
    const [dq, dr] = DIRS[d]; let q = e.q, r = e.r;
    for (let k = 1; k <= lancerRange(); k++) { q += dq; r += dr; const kk = K(q, r); if (!S.grid.nb[kk] || S.walls.has(kk)) break; if (q === pq && r === pr) return d; }
  }
  return -1;
}
export function computeIntents() {
  const p = pk();
  for (const e of S.run.enemies) {
    if (e.sleep) { e.aim = -1; e.tg = null; continue; }
    if (e.type === 'lancer') e.aim = e.cd === 0 ? alignDir(e) : -1;
    else if (LUNGERS.includes(e.type)) e.tg = S.grid.nb[K(e.q, e.r)].includes(p) ? p : bfsStep(e, new Set(S.grid.nb[p]));
  }
}
const LAVA = { id: -2, type: 'lava' };
export function threatMap() {
  const m = new Map(), add = (k, e) => { if (!m.has(k)) m.set(k, []); m.get(k).push(e); };
  for (const k of S.lava) add(k, LAVA);
  for (const e of S.run.enemies) {
    if (e.sleep) continue;
    if (LUNGERS.includes(e.type)) { if (e.tg) add(e.tg, e); }
    else if (e.type === 'lancer' && e.aim >= 0) for (const h of beam(e, e.aim)) add(h, e);
    else if (e.type === 'bomber' && e.fuse === 1) for (const n of S.grid.nb[K(e.q, e.r)]) add(n, e);
  }
  return m;
}

// ---------- moves
export function moves() {
  const r = S.run, o = occ(), [pq, pr] = r.player, res = [];
  const open = (q, rr) => { const k = K(q, rr); return !!S.grid.nb[k] && !S.walls.has(k) && !o.has(k); };
  for (let d = 0; d < 6; d++) {
    const [dq, dr] = DIRS[d], q = pq + dq, rr = pr + dr, k = K(q, rr);
    if (open(q, rr)) { res.push({ q, r: rr, d }); if (r.dash > 0 && open(q + dq, rr + dr)) res.push({ q: q + dq, r: rr + dr, via: k, dash: 1, d }); }
    else if (has('strike') && !r.strikeUsed && o.has(k) && !isBoss(o.get(k).type)) res.push({ q, r: rr, strike: 1, d });
  }
  return res;
}
function applyTail(tail, from, m, wait) {
  const t = tail.slice(), to = K(m.q, m.r), dropped = [];
  if (!wait) { t.push(from); if (m.via) t.push(m.via); const i = t.indexOf(to); if (i >= 0) t.splice(i, 1); }
  else if (t.length && !has('infinity')) dropped.push(t.shift());
  while (t.length > tailLen()) dropped.push(t.shift());
  return { t, dropped };
}

// A hex is inside when it can't reach the board rim without crossing tail, head or rock.
export function findInside(tail, head) {
  const bar = new Set(S.run.walls); for (const k of tail) bar.add(k); bar.add(head);
  const { keys, nb } = S.grid, reach = new Set(), st = [];
  for (const k of keys) if (!bar.has(k) && isEdge(k)) { reach.add(k); st.push(k); }
  while (st.length) { const c = st.pop(); for (const n of nb[c]) if (!bar.has(n) && !reach.has(n)) { reach.add(n); st.push(n); } }
  return keys.filter((k) => !bar.has(k) && !reach.has(k));
}
export function preview(m) {
  const r = S.run, wait = m.q === r.player[0] && m.r === r.player[1];
  const { t } = applyTail(r.tail, pk(), m, wait);
  const inside = findInside(t, K(m.q, m.r)), set = new Set(inside);
  const o = occ(), struck = m.strike ? o.get(K(m.q, m.r)) : null;
  const victims = r.enemies.filter((e) => e !== struck && set.has(K(e.q, e.r)));
  const loot = inside.filter((k) => r.pickups[k]).length + r.spawns.filter((s) => set.has(K(s.q, s.r))).length;
  return { inside, victims, live: victims.length + loot > 0, tail: t };
}
// Simulate walking a drawn path (enemies frozen). Returns the first loop it would close.
export function previewPath(keys) {
  const r = S.run;
  let t = r.tail.slice(), pos = pk();
  const en = new Map(r.enemies.map((e) => [K(e.q, e.r), e]));
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    t.push(pos); const j = t.indexOf(k); if (j >= 0) t.splice(j, 1);
    while (t.length > tailLen()) t.shift();
    pos = k;
    const inside = findInside(t, pos);
    if (inside.length) {
      const victims = inside.filter((h) => en.has(h)).map((h) => en.get(h));
      const loot = inside.filter((h) => r.pickups[h]).length;
      if (victims.length + loot) return { inside, victims, live: true, step: i };
    }
  }
  return { inside: [], victims: [], live: false, step: -1 };
}
// Guidance: the shortest loop you could draw right now, or a safe route toward the nearest enemy.
export function suggest(prev = null, maxD = 9) {
  const r = S.run; if (!r || r.phase !== 'play' || !r.enemies.length) return null;
  const th = threatMap(), en = new Map(r.enemies.map((e) => [K(e.q, e.r), e])), L = tailLen();
  if (prev && prev.loop && prev.path.length) {
    const legal = new Set(moves().filter((m) => !m.dash && !m.strike).map((m) => K(m.q, m.r)));
    const pv = legal.has(prev.path[0]) && (prev.path.length === 1 || !th.has(prev.path[0])) ? previewPath(prev.path) : null;
    if (pv && pv.live && pv.victims.length) return { path: prev.path.slice(0, pv.step + 1), v: pv.victims.length, loop: true };
  }
  const lines = new Set();
  for (const e of r.enemies) if (e.type === 'lancer' && e.cd <= 1) for (let d = 0; d < 6; d++) for (const k of beam(e, d).slice(1)) lines.add(k);
  for (const e of r.enemies) if (e.type === 'bomber' && e.fuse <= 2) for (const n of S.grid.nb[K(e.q, e.r)]) lines.add(n);
  const boss = bossOf(), bossK = boss ? K(boss.q, boss.r) : null;
  let best = null, nodes = 0, strict = true, need = bossK;
  const rec = (t, pos, path) => {
    if (nodes++ > 60000) return;
    for (const n of S.grid.nb[pos]) {
      if (S.walls.has(n) || en.has(n) || path.includes(n)) continue;
      const [nq, nr] = P(n);
      if (!r.enemies.some((e) => hd(nq, nr, e.q, e.r) <= 1)) continue; // hug enemies
      const nt = t.slice(); nt.push(pos); const i = nt.indexOf(n); if (i >= 0) nt.splice(i, 1); while (nt.length > L) nt.shift();
      const np = [...path, n], ins = findInside(nt, n), cnt = ins.filter((h) => en.has(h)).length, v = cnt && (!need || ins.includes(need)) ? cnt : 0;
      // closing on red is only safe if everything making it red dies in this loop
      const safeClose = !th.has(n) || th.get(n).every((x) => x.id >= 0 && ins.includes(K(x.q, x.r)));
      if (v && safeClose) { if (!best || np.length < best.path.length || (np.length === best.path.length && v > best.v)) best = { path: np, v, loop: true }; continue; }
      if (v) continue;
      if (th.has(n) || (strict && lines.has(n))) continue; // never route through red (closing a loop on red is fine)
      if (np.length < maxD && (!best || np.length + 1 < best.path.length)) rec(nt, n, np);
    }
  };
  const run = () => { nodes = 0; rec(r.tail.slice(), pk(), []); };
  run(); if (!best) { strict = false; run(); }
  if (!best && need) { need = null; strict = true; run(); if (!best) { strict = false; run(); } }
  if (best) return best;
  const [pq, pr] = r.player, near = boss || r.enemies.slice().sort((a, b) => hd(a.q, a.r, pq, pr) - hd(b.q, b.r, pq, pr))[0];
  if (hd(near.q, near.r, pq, pr) === 1) {
    const last = r.tail[r.tail.length - 1], tail = new Set(r.tail);
    const opts = S.grid.nb[pk()].filter((k) => S.grid.nb[K(near.q, near.r)].includes(k) && !S.walls.has(k) && !en.has(k) && !th.has(k) && k !== last);
    const step = opts.find((k) => !tail.has(k)) || opts[0];
    if (step) return { path: [step], v: 0, loop: false };
  }
  const spots = S.grid.nb[K(near.q, near.r)].filter((k) => !S.walls.has(k) && !en.has(k) && !th.has(k) && k !== pk());
  let route = null;
  for (const k of spots) { const p = routeTo(k); if (p && (!route || p.length < route.length)) route = p; }
  return route ? { path: route, v: 0, loop: false } : null;
}
// Shortest walkable route from you to a hex, avoiding red hexes where possible.
export function routeTo(goal) {
  const start = pk(), o = occ(), th = threatMap();
  if (goal === start || !S.grid.nb[goal] || S.walls.has(goal) || o.has(goal)) return null;
  const dist = new Map([[start, 0]]), prev = new Map(), open = [start];
  while (open.length) {
    open.sort((a, b) => dist.get(a) - dist.get(b));
    const c = open.shift();
    if (c === goal) break;
    for (const n of S.grid.nb[c]) {
      if (S.walls.has(n) || o.has(n)) continue;
      const d = dist.get(c) + 1 + (th.has(n) ? 6 : 0);
      if (!dist.has(n) || d < dist.get(n)) { dist.set(n, d); prev.set(n, c); open.push(n); }
    }
  }
  if (!prev.has(goal)) return null;
  const path = []; let x = goal;
  while (x !== start) { path.unshift(x); x = prev.get(x); }
  return path;
}

// ---------- turn
function snapshot() { const u = S.run.undo; S.run.undo = null; const s = JSON.stringify(S.run); S.run.undo = u; return s; }
export function doMove(m) {
  const r = S.run;
  if (!r || r.phase !== 'play') return false;
  const wait = m.q === r.player[0] && m.r === r.player[1];
  const legal = wait ? null : moves().find((x) => x.q === m.q && x.r === m.r);
  if (!wait && !legal) return false;
  m = wait ? m : legal;
  const snap = snapshot();
  const from = r.player.slice(), fk = pk();
  r.turn++;
  const struck = !wait && m.strike ? occ().get(K(m.q, m.r)) : null;
  if (struck) r.enemies = r.enemies.filter((x) => x !== struck); // clear the hex first, kill after landing
  const { t, dropped } = applyTail(r.tail, fk, m, wait);
  r.tail = t;
  if (!wait) { r.player = [m.q, m.r]; if (m.dash) r.dash--; }
  if (struck) { r.enemies.push(struck); r.strikeUsed = true; killEnemy(struck, 'strike'); addScore(100, [m.q, m.r]); }
  ev('move', { from, to: r.player.slice(), wait, dash: !!m.dash, d: m.d, tail: t.slice(), dropped });
  if (m.via && r.pickups[m.via]) collect(m.via);
  if (!wait && r.pickups[pk()]) collect(pk());
  if (has('magnet')) for (const n of S.grid.nb[pk()]) if (r.pickups[n] && r.pickups[n] !== 'shrine') collect(n);
  const caught = doCapture();
  if (r.mode !== 'tutorial') {
    if (caught) { r.idle = 0; if (r.dazed) { r.dazed = false; for (const e of r.enemies) if (e.dazed) { e.sleep = false; delete e.dazed; } ev('wake'); } }
    else if (++r.idle >= DAZE_AFTER && !r.dazed) { r.dazed = true; for (const e of r.enemies) if (!e.sleep) { e.sleep = true; e.dazed = 1; e.aim = -1; e.tg = null; } ev('daze'); }
  }
  if (settleGoal()) { r.undo = snap; return true; }
  const hits = threatMap().get(pk()) || [];
  for (const e of hits) { hurt(e); if (r.phase !== 'play') { r.undo = snap; ev('settle'); return true; } }
  for (const e of r.enemies) if (e.type === 'lancer' && e.aim >= 0) { ev('beam', { id: e.id, q: e.q, r: e.r, hs: beam(e, e.aim), burned: 0 }); e.aim = -1; e.cd = 2; }
  for (const e of r.enemies) if (e.type === 'bomber' && e.fuse === 1 && !e.sleep) { ev('blast', { id: e.id, q: e.q, r: e.r, hs: S.grid.nb[K(e.q, e.r)] }); e.fuse = 6; }
  if (settleGoal()) { r.undo = snap; return true; }
  enemyPhase();
  computeIntents();
  noteNewEnemies();
  r.undo = snap;
  ev('settle');
  return true;
}
export function canUndo() { const r = S.run; return !!(r && r.undo && r.undoLeft > 0 && (r.phase === 'play' || r.phase === 'dead')); }
export function undo() {
  if (!canUndo()) return false;
  const left = S.run.undoLeft - 1, o = JSON.parse(S.run.undo);
  o.undo = null; o.undoLeft = left;
  setRun(o); ev('undo');
  return true;
}

function addScore(n, at) { S.run.score += n; ev('score', { n, at }); }
function gainShards(n) { S.run.shardsRun += n * (has('midas') ? 2 : 1); }
function collect(k) {
  const r = S.run, t = r.pickups[k]; delete r.pickups[k];
  if (t === 'shard') { gainShards(1); addScore(25, P(k)); ev('shard', { k }); }
  else if (t === 'heart') { const was = r.hp; r.hp = Math.min(r.maxHp, r.hp + 1); ev('heal', { k, n: r.hp - was }); }
  else if (t === 'shrine') {
    const pool = Object.keys(MODS).filter((id) => MODS[id].t === 'silver' && (MODS[id].stack || !r.mods[id]));
    const id = pool.length ? pool[ri(pool.length)] : null;
    if (id) { grantMod(id); ev('shrine', { k, id }); }
    else { r.hp = Math.min(r.maxHp, r.hp + 1); ev('heal', { k, n: 1 }); }
  }
}
function grantMod(id) {
  const r = S.run;
  r.mods[id] = (r.mods[id] || 0) + 1; noteMod(id);
  if (id === 'overclock') r.dash = Math.max(r.dash, 1);
  if (id === 'bigheart') { r.maxHp++; r.hp++; }
  if (id === 'rewind') r.undoLeft++;
}
function spawnMites(near, n) {
  const r = S.run;
  for (let i = 0; i < n; i++) {
    const h = randEnemy(([q, rr]) => hd(q, rr, near.q, near.r) <= 3 && hd(q, rr, r.player[0], r.player[1]) >= 2);
    if (h) { const m = addEnemy('mite', h[0], h[1]); m.fresh = 1; if (r.dazed) { m.sleep = true; m.dazed = 1; } ev('spawn', { id: m.id, type: 'mite', q: m.q, r: m.r }); }
  }
}
function killEnemy(e, cause) {
  const r = S.run, i = r.enemies.indexOf(e); if (i < 0) return;
  r.enemies.splice(i, 1); r.kills++;
  ev('kill', { id: e.id, type: e.type, q: e.q, r: e.r, cause });
  if (isBoss(e.type)) {
    for (const o of r.enemies) { r.kills++; ev('kill', { id: o.id, type: o.type, q: o.q, r: o.r, cause: 'boss' }); }
    r.enemies = []; r.spawns = [];
  } else if (e.type === 'splitter' && r.mode !== 'tutorial') spawnMites(e, 2);
}
function damage(e, n) {
  e.hp -= n;
  if (e.hp <= 0) { killEnemy(e, 'loop'); return; }
  ev('bossHit', { id: e.id, hp: e.hp });
  if (e.type === 'warden') { // teleport + call a mite
    const h = randEnemy(([q, r]) => hd(q, r, S.run.player[0], S.run.player[1]) >= 3);
    if (h) { const from = [e.q, e.r]; [e.q, e.r] = h; ev('teleport', { id: e.id, from, to: h }); }
    spawnMites(e, 1);
  } else if (e.type === 'colossus' || e.type === 'hive') spawnMites(e, e.type === 'colossus' ? 2 : 0);
}
function doCapture() {
  const r = S.run, inside = findInside(r.tail, pk());
  if (!inside.length) return 0;
  const set = new Set(inside);
  const victims = r.enemies.filter((e) => set.has(K(e.q, e.r)));
  const loot = inside.filter((k) => r.pickups[k]);
  const warns = r.spawns.filter((s) => set.has(K(s.q, s.r)));
  if (!victims.length && !loot.length && !warns.length) return 0; // empty pocket: nothing happens, tail is kept
  const border = r.tail.filter((k) => S.grid.nb[k].some((n) => set.has(n))), bset = new Set(border);
  const struck = victims.slice();
  if (has('chain')) for (const e of r.enemies) if (!struck.includes(e) && S.grid.nb[K(e.q, e.r)].some((n) => bset.has(n))) struck.push(e);
  if (has('nova')) for (const e of r.enemies) if (!struck.includes(e) && inside.some((k) => { const [q, rr] = P(k); return hd(q, rr, e.q, e.r) <= 2; })) struck.push(e);
  ev('capture', { inside, border, victims: struck.map((e) => e.id), tail: r.tail.filter((k) => !bset.has(k)) });
  let hits = 0;
  for (const e of struck) {
    if (!r.enemies.includes(e)) continue;
    hits++;
    damage(e, has('hunter') && (e.type === 'brute' || isBoss(e.type)) ? 2 : 1);
  }
  for (const s of warns) { hits++; r.kills++; ev('kill', { id: -1, type: s.ty, q: s.q, r: s.r, cause: 'warn' }); }
  r.spawns = r.spawns.filter((s) => !warns.includes(s));
  for (const k of loot) collect(k);
  r.tail = r.tail.filter((k) => !bset.has(k));
  if (hits) {
    const window = has('momentum') ? 10 : 6, step = has('momentum') ? 2 : 1;
    r.combo = r.turn - r.lastCap <= window ? Math.min(9, r.combo + step) : 1;
    r.lastCap = r.turn;
    let cq = 0, cr = 0; for (const k of inside) { const [q, rr] = P(k); cq += q; cr += rr; }
    const mult = (1 + 0.3 * has('bounty')) * (1 + 0.25 * heat());
    const pts = Math.round((inside.length * 10 + hits * 100) * r.combo * (hits >= 2 ? hits : 1) * mult);
    addScore(pts, [cq / inside.length, cr / inside.length]);
    ev('combo', { combo: r.combo, hits });
    if (has('overclock')) r.dash = Math.min(2, r.dash + 1);
    if (has('siphon') && hits >= 2 && r.hp < r.maxHp) { r.hp++; ev('heal', { k: pk(), n: 1 }); }
    if (has('frost')) { for (const e of r.enemies) e.frozen = 1; ev('freeze'); }
  }
  return hits;
}
function hurt(e) {
  const r = S.run;
  if (has('aegis') && !r.shieldUsed) { r.shieldUsed = true; ev('block', { id: e.id }); return; }
  r.hp--;
  ev('hurt', { id: e.id, type: e.type, hp: r.hp });
  if (has('thorns') && e.id >= 0 && r.enemies.includes(e) && !isBoss(e.type)) { killEnemy(e, 'thorns'); addScore(50, [e.q, e.r]); }
  if (r.hp <= 0) {
    if (has('secondwind') && !r.swUsed) { r.swUsed = true; r.hp = 1; ev('secondwind'); }
    else if (has('phoenix') && !r.phoenixUsed) { r.phoenixUsed = true; r.hp = r.maxHp; ev('phoenix'); }
    else { r.phase = 'dead'; ev('dead'); }
  }
}
// Each pick round is one tier (LoL-Arena style). Boss clears always roll prismatic.
function rollChoices() {
  const r = S.run, a = actOf(r.sector), x = rnd();
  let tier = r.boss ? 'prism' : a === 0 ? (x < 0.65 ? 'silver' : x < 0.97 ? 'gold' : 'prism') : a === 1 ? (x < 0.4 ? 'silver' : x < 0.88 ? 'gold' : 'prism') : (x < 0.25 ? 'silver' : x < 0.75 ? 'gold' : 'prism');
  const avail = (t) => Object.keys(MODS).filter((id) => MODS[id].t === t && (MODS[id].stack || !r.mods[id]));
  let pool = shuffle(avail(tier));
  if (pool.length < 3) { const extra = shuffle(Object.keys(MODS).filter((id) => !pool.includes(id) && (MODS[id].stack || !r.mods[id]))); pool = pool.concat(extra); }
  r.choiceTier = tier;
  return pool.slice(0, 3);
}
// true when the board is finished (tutorial goal met or sector cleared)
function settleGoal() {
  const r = S.run;
  if (r.mode === 'tutorial') {
    const done = r.goal === 'collect' ? !Object.values(r.pickups).includes('shard') : !r.enemies.length;
    if (done) { r.phase = 'tutwin'; ev('tutwin'); ev('settle'); }
    return done;
  }
  const done = r.boss ? !bossOf() : (r.spawned >= r.quota && !r.enemies.length && !r.spawns.length);
  if (!done) return false;
  gainShards((r.boss ? 5 : 2) + 2 * has('thrift'));
  addScore(Math.round(r.sector * 150 * (1 + 0.25 * heat())), r.player);
  r.log.push(r.boss ? '🟨' : '🟦');
  if (heat() < 4) r.hp = Math.min(r.maxHp, r.hp + 1); // every cleared sector heals 1 (not on Heat 4+)
  if (r.sector === FINAL && !r.endless) { r.phase = 'won'; ev('won'); }
  else { r.phase = 'pick'; r.choices = rollChoices(); ev('clear'); }
  ev('settle');
  return true;
}
export function chooseMod(id) {
  const r = S.run;
  if (!r || r.phase !== 'pick') return false;
  if (id === 'repair') r.hp = Math.min(r.maxHp, r.hp + 1);
  else if (r.choices.includes(id)) grantMod(id);
  else return false;
  nextSector();
  return true;
}
// After beating sector 9: keep going in Endless.
export function continueEndless() {
  const r = S.run;
  if (!r || r.phase !== 'won' || r.mode !== 'run') return false;
  r.endless = true; r.phase = 'pick'; r.choices = rollChoices();
  return true;
}

// ---------- enemies
function bfsStep(e, goals) {
  const r = S.run, s = K(e.q, e.r); if (goals.has(s)) return null;
  const o = occ(), p = pk(), tail = new Set(r.tail);
  const crowd = new Set(); for (const x of r.enemies) if (x !== e) for (const n of S.grid.nb[K(x.q, x.r)]) crowd.add(n);
  const pass = (k) => !crowd.has(k) && !S.walls.has(k) && k !== p && !o.has(k) && (r.mode === 'tutorial' || enemyOk(k)) && (e.type === 'eater' || !tail.has(k));
  const prev = new Map([[s, null]]), qu = [s];
  for (let i = 0; i < qu.length; i++) for (const n of S.grid.nb[qu[i]]) {
    if (prev.has(n) || !pass(n)) continue;
    prev.set(n, qu[i]);
    if (goals.has(n)) { let x = n; while (prev.get(x) !== s) x = prev.get(x); return x; }
    qu.push(n);
  }
  let best = null, bd = hd(e.q, e.r, r.player[0], r.player[1]);
  for (const n of S.grid.nb[s]) { if (!pass(n)) continue; const [q, rr] = P(n), d = hd(q, rr, r.player[0], r.player[1]); if (d < bd) { bd = d; best = n; } }
  return best;
}
function moveEnemy(e) {
  const r = S.run;
  if (e.sleep || !WALKERS.includes(e.type)) { if (e.type === 'lancer' && e.cd > 0) e.cd--; return; }
  if (e.frozen) { delete e.frozen; return; }
  if (e.type === 'bomber' && e.fuse > 1) e.fuse--;
  const p = pk(), rest = has('stasis') ? 2 : 1;
  if (e.type !== 'mite') {
    if (e.cd > 0) { e.cd--; return; }
    e.cd = e.type === 'colossus' ? 2 : rest;
  }
  if (e.type === 'bomber' && e.fuse === 1) return; // armed: stays put
  let goals;
  if (e.type === 'eater') { if (S.grid.nb[p].includes(K(e.q, e.r))) return; const food = r.tail.slice(0, -2); goals = new Set(food.length ? food : S.grid.nb[p]); }
  else goals = new Set(S.grid.nb[p]);
  const step = bfsStep(e, goals);
  if (!step) return;
  const from = [e.q, e.r];
  [e.q, e.r] = P(step);
  ev('enemyMove', { id: e.id, from, to: [e.q, e.r] });
  if (e.type === 'eater' && r.tail.includes(step)) { r.tail = r.tail.filter((k) => k !== step); ev('chomp', { id: e.id, k: step }); }
}
function enemyPhase() {
  const r = S.run, p = pk(), [pq, pr] = r.player, o = occ();
  r.spawns = r.spawns.filter((s) => {
    if (s.at > r.turn) return true;
    const k = K(s.q, s.r); if (k === p || o.has(k) || S.grid.nb[k].some((n) => o.has(n))) return true; // wait until there's a gap around it
    r.tail = r.tail.filter((x) => x !== k);
    const e = addEnemy(s.ty, s.q, s.r); e.fresh = 1; o.set(k, e);
    ev('spawn', { id: e.id, type: e.type, q: e.q, r: e.r });
    return false;
  });
  const order = r.enemies.slice().sort((a, b) => hd(a.q, a.r, pq, pr) - hd(b.q, b.r, pq, pr));
  for (const e of order) { if (e.fresh) { delete e.fresh; continue; } moveEnemy(e); }
  if (r.mode === 'tutorial' || r.dazed) return;
  const warn = (h, extra, ty) => { const s = { q: h[0], r: h[1], ty: ty || pickType(), at: r.turn + 1, x: extra ? 1 : 0 }; r.spawns.push(s); ev('warn', s); };
  if (r.boss) {
    const b = bossOf();
    if (b && r.turn >= r.nextSpawn) {
      if (r.enemies.length + r.spawns.length < 6) { const h = randEnemy(([q, rr]) => hd(q, rr, b.q, b.r) <= 3 && hd(q, rr, pq, pr) >= 2); if (h) { let ty = rnd() < (b.type === 'hive' ? 0.25 : 0.5) ? 'mite' : pickType(); if (ty === 'lancer') ty = 'drone'; warn(h, true, ty); } }
      r.nextSpawn = r.turn + r.spawnEvery;
    }
  } else if (r.spawned < r.quota && (r.turn >= r.nextSpawn || (!r.enemies.length && !r.spawns.length))) {
    const h = randEnemy(([q, rr]) => hd(q, rr, pq, pr) >= 3);
    if (h) { warn(h); r.spawned++; r.nextSpawn = r.turn + r.spawnEvery; }
  }
}

// ---------- end of run / meta
export function enemiesLeft() {
  const r = S.run; if (!r) return 0;
  if (r.mode === 'tutorial') return r.enemies.length;
  return r.boss ? (bossOf() || { hp: 0 }).hp : r.quota - r.spawned + r.spawns.length + r.enemies.length;
}
export function finalizeRun() {
  const r = S.run, m = S.meta;
  if (!r) return null;
  const won = r.phase === 'won' || r.endless;
  const sum = { mode: r.mode, score: r.score, sector: r.sector, kills: r.kills, shards: r.shardsRun * 1, log: r.log.slice(), won, endless: r.endless, heat: r.heat, newBest: false, date: r.date };
  if (r.mode !== 'tutorial') {
    if (r.phase !== 'won' && r.log[r.log.length - 1] !== '🟥') sum.log.push('🟥');
    m.shards += r.shardsRun;
    if (r.score > m.best) { m.best = r.score; sum.newBest = true; }
    m.bestSector = Math.max(m.bestSector, r.sector);
    if (r.endless) m.bestEndless = Math.max(m.bestEndless || 0, r.sector);
    if (won && r.mode === 'run') { m.wins = (m.wins || 0) + 1; if ((r.heat || 0) >= (m.heat || 0) && (m.heat || 0) < HEAT.length - 1) { m.heat = (r.heat || 0) + 1; sum.heatUnlocked = m.heat; } }
    if (r.mode === 'daily' && m.daily && m.daily.date === r.date && !m.daily.done) {
      Object.assign(m.daily, { done: true, score: r.score, sector: r.sector, log: sum.log, won });
      if (m.streak.date !== r.date) { m.streak.n = m.streak.date === prevDate(r.date) ? m.streak.n + 1 : 1; m.streak.date = r.date; }
    }
  }
  setRun(null);
  return sum;
}
export function nextUnlock() {
  const c = CORES.filter((x) => !S.meta.unlocked.includes(x.id)).sort((a, b) => a.cost - b.cost)[0];
  return c ? { core: c, have: S.meta.shards, need: c.cost } : null;
}
// Import a save code without letting it reopen a finished daily (anti save-scum).
export function mergeImported(o) {
  const cur = S.meta, inc = Object.assign(defMeta(), o.meta);
  const curDone = cur.daily && cur.daily.done ? cur.daily : null;
  if (curDone && (!inc.daily || inc.daily.date <= curDone.date)) inc.daily = curDone;
  let run = o.run && ['play', 'pick', 'dead'].includes(o.run.phase) ? o.run : null;
  if (run && run.mode === 'daily' && (!inc.daily || inc.daily.done || inc.daily.date !== run.date)) run = null;
  return { meta: inc, run };
}
