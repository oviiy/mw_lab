// HEXLOOP rules. Pure data + functions, no DOM / Three.js, so it runs headless in tests.
// Turn order: you move → loops resolve → red hexes hurt you → lancers fire → enemies act → new telegraphs.
import { DIRS, K, P, hd, makeGrid, hashStr } from './hex.js';
import { TUTORIAL, SECTOR1 } from './levels.js';

export const FINAL = 9;
export const BOSS_EVERY = 3;

export const MODS = {
  tail:       { n: 'Long Tail',      d: '+3 tail length. Bigger loops.', stack: true },
  chain:      { n: 'Chain Reaction', d: 'Loops also destroy enemies touching your loop from outside.' },
  overclock:  { n: 'Overclock',      d: 'Every loop kill charges a Dash (max 2): leap 2 hexes in a line.' },
  thorns:     { n: 'Thorns',         d: 'Drones and Brutes that hit you are destroyed.' },
  aegis:      { n: 'Aegis',          d: 'Block the first hit in every sector.' },
  siphon:     { n: 'Siphon',         d: 'A loop that destroys 2+ enemies heals 1.' },
  secondwind: { n: 'Second Wind',    d: 'Once per sector, survive a lethal hit with 1 HP.' },
  strike:     { n: 'Phase Strike',   d: 'Once per sector, step onto an enemy to destroy it.' },
};
export const CORES = [
  { id: 'spark',   n: 'Spark',   cost: 0,  hp: 3, tail: 8, mods: {},           d: '3 HP · tail 8. Balanced.' },
  { id: 'prism',   n: 'Prism',   cost: 15, hp: 2, tail: 8, mods: { chain: 1 }, d: '2 HP · tail 8. Starts with Chain Reaction.' },
  { id: 'bulwark', n: 'Bulwark', cost: 45, hp: 5, tail: 7, mods: { aegis: 1 }, d: '5 HP · tail 7. Starts with Aegis.' },
];
export const ENEMY_INFO = {
  drone:  { n: 'Drone',  d: 'Lunges at the hex its arrow points to. Step aside, then loop it.' },
  lancer: { n: 'Lancer', d: 'Locks a laser on your line, then fires next turn. Step off the beam. Burns your tail.' },
  brute:  { n: 'Brute',  d: 'Every hex around it hurts. Slow: moves every other turn. Loop it from a distance.' },
  eater:  { n: 'Eater',  d: 'Harmless, but eats your tail. Loop it before it breaks your loops.' },
  hive:   { n: 'Hive',   d: 'Boss. Each loop around it deals 1 damage. It keeps spawning enemies.' },
};
export const coreOf = (id) => CORES.find((c) => c.id === id) || CORES[0];

export const S = { run: null, meta: null, grid: null, walls: new Set(), events: [] };
const ev = (t, o = {}) => S.events.push(Object.assign({ t }, o));
export function takeEvents() { const e = S.events; S.events = []; return e; }

export function defMeta() {
  return { v: 2, shards: 0, unlocked: ['spark'], core: 'spark', best: 0, bestSector: 0, runs: 0, daily: null,
    streak: { date: null, n: 0 }, seen: [], tutorialDone: false, muted: false, music: true };
}
export function setRun(run) {
  S.run = run;
  if (run) { S.grid = makeGrid(run.rad); S.walls = new Set(run.walls); }
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
export const tailLen = () => S.run.tailLen || coreOf(S.run.core).tail + 3 * (S.run.mods.tail || 0);
const isEdge = (k) => { const [q, r] = P(k); return hd(q, r, 0, 0) === S.grid.rad; };

function baseRun(mode, coreId) {
  const core = coreOf(mode === 'run' ? coreId : 'spark'), date = utcDate();
  return { v: 2, mode, date, core: core.id, rng: mode === 'daily' ? hashStr('hexloop2:' + date) : (Math.random() * 2 ** 31) | 0,
    sector: 0, tut: -1, score: 0, kills: 0, shardsRun: 0, hp: core.hp, maxHp: core.hp, mods: Object.assign({}, core.mods), dash: 0,
    turn: 0, combo: 0, lastCap: -99, rad: 4, walls: [], tail: [], tailLen: null, player: [0, 0], enemies: [], nextId: 1, pickups: {},
    spawns: [], quota: 0, spawned: 0, nextSpawn: 0, spawnEvery: 6, boss: false, phase: 'play', choices: null, log: [],
    undo: null, undoLeft: 1, shieldUsed: false, swUsed: false, strikeUsed: false, hint: '', ghost: null, goal: null, title: '' };
}
export function startRun(mode = 'run') {
  const run = baseRun(mode, S.meta.core);
  if (mode !== 'tutorial') S.meta.runs++;
  if (mode === 'daily') S.meta.daily = { date: run.date, done: false, score: 0, sector: 0, log: [] };
  setRun(run);
  if (mode === 'tutorial') nextTutorial(); else nextSector();
}
export function addEnemy(type, q, r, sleep) {
  const e = { id: S.run.nextId++, type, q, r, hp: 1, aim: -1, cd: type === 'lancer' ? 1 : 0, tg: null, sleep: !!sleep };
  S.run.enemies.push(e);
  return e;
}
function resetBoard(rad) {
  Object.assign(S.run, { rad, walls: [], tail: [], player: [0, 0], enemies: [], pickups: {}, spawns: [], turn: 0, combo: 0, lastCap: -99,
    shieldUsed: false, swUsed: false, strikeUsed: false, phase: 'play', choices: null, hint: '', ghost: null, goal: null, tailLen: null,
    undo: null, undoLeft: 1, title: '' });
  setRun(S.run);
}
function loadLevel(L) {
  const r = S.run;
  resetBoard(L.rad);
  Object.assign(r, { walls: L.walls.slice(), player: L.player.slice(), hint: L.hint || '', ghost: L.ghost ? L.ghost.slice() : null,
    goal: L.goal || null, tailLen: L.tail || null, title: L.title || '' });
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

function validWalls(walls, rad) {
  const g = makeGrid(rad), bar = new Set(walls); bar.add('0,0');
  const reach = new Set(), st = [];
  for (const k of g.keys) { const [q, r] = P(k); if (!bar.has(k) && hd(q, r, 0, 0) === rad) { reach.add(k); st.push(k); } }
  while (st.length) { const c = st.pop(); for (const n of g.nb[c]) if (!bar.has(n) && !reach.has(n)) { reach.add(n); st.push(n); } }
  return g.keys.every((k) => bar.has(k) || reach.has(k));
}
function randFree(pred) {
  const r = S.run, o = occ(), p = pk(), sp = new Set(r.spawns.map((s) => K(s.q, s.r))), tail = new Set(r.tail);
  const c = S.grid.keys.filter((k) => !S.walls.has(k) && !o.has(k) && !r.pickups[k] && k !== p && !sp.has(k) && !tail.has(k) && (!pred || pred(P(k))));
  if (!c.length) return pred ? randFree(null) : null;
  return P(c[ri(c.length)]);
}
function pickType() {
  const s = S.run.sector, x = rnd();
  if (s >= 5 && x < 0.15) return 'eater';
  if (s >= 4 && x < 0.35) return 'brute';
  if (s >= 2 && x < 0.6) return 'lancer';
  return 'drone';
}
export function nextSector() {
  const r = S.run;
  r.sector++;
  const s = r.sector;
  r.boss = s % BOSS_EVERY === 0;
  if (s === 1 && r.mode === 'run') {
    loadLevel(SECTOR1);
    r.quota = SECTOR1.quota; r.spawned = SECTOR1.enemies.length; r.spawnEvery = SECTOR1.spawnEvery; r.nextSpawn = SECTOR1.spawnEvery;
  } else {
    resetBoard(4);
    let walls = [];
    for (let t = 0; t < 120; t++) {
      const n = 3 + ri(4), ws = new Set(), cand = shuffle(S.grid.keys.filter((k) => { const [q, rr] = P(k); return hd(q, rr, 0, 0) >= 2; }));
      for (const k of cand) {
        if (ws.size >= n) break;
        ws.add(k);
        if (rnd() < 0.5 && ws.size < n) { const [q, rr] = P(k), [dq, dr] = DIRS[ri(6)], k2 = K(q + dq, rr + dr); if (S.grid.nb[k].includes(k2) && hd(q + dq, rr + dr, 0, 0) >= 2) ws.add(k2); }
      }
      if (validWalls([...ws], 4)) { walls = [...ws]; break; }
    }
    r.walls = walls; setRun(r);
    const far = ([q, rr]) => hd(q, rr, 0, 0) >= 3;
    r.spawnEvery = Math.max(3, 6 - Math.floor(s / 3));
    if (r.boss) {
      const h = randFree(([q, rr]) => hd(q, rr, 0, 0) === 2 && !S.grid.nb[K(q, rr)].some((n) => S.walls.has(n)));
      addEnemy('hive', h[0], h[1]).hp = 2 + s / BOSS_EVERY;
      r.quota = 0; r.spawned = 0; r.nextSpawn = 3; r.spawnEvery = 4;
      const d = randFree(far); if (d) addEnemy('drone', d[0], d[1]);
      if (s >= 6) { const l = randFree(far); if (l) addEnemy('lancer', l[0], l[1]); }
    } else {
      r.quota = 3 + s;
      const init = Math.min(r.quota, 2 + Math.floor(s / 2));
      for (let i = 0; i < init; i++) { const h = randFree(far); if (h) addEnemy(i === 0 ? 'drone' : pickType(), h[0], h[1]); }
      r.spawned = init; r.nextSpawn = r.spawnEvery;
    }
    const ns = 2 + ri(2);
    for (let i = 0; i < ns; i++) { const h = randFree(([q, rr]) => hd(q, rr, 0, 0) >= 2); if (h) r.pickups[K(h[0], h[1])] = 'shard'; }
    if (rnd() < (r.hp < r.maxHp ? 0.55 : 0.12)) { const h = randFree(([q, rr]) => hd(q, rr, 0, 0) >= 2); if (h) r.pickups[K(h[0], h[1])] = 'heart'; }
    r.hint = r.boss ? 'Boss! Loop the Hive ' + (2 + s / BOSS_EVERY) + ' times.' : 'Destroy ' + r.quota + ' enemies.';
  }
  computeIntents(); noteNewEnemies(); ev('level');
}
function noteNewEnemies() {
  const types = new Set(S.run.enemies.map((e) => e.type));
  for (const s of S.run.spawns) types.add(s.ty);
  for (const t of types) if (!S.meta.seen.includes(t)) { S.meta.seen.push(t); ev('newEnemy', { type: t }); }
}

// ---------- telegraphs
export function beam(e, d) {
  const out = []; let q = e.q, r = e.r; const [dq, dr] = DIRS[d];
  for (;;) { q += dq; r += dr; const k = K(q, r); if (!S.grid.nb[k] || S.walls.has(k)) break; out.push(k); }
  return out;
}
function alignDir(e) {
  const [pq, pr] = S.run.player;
  for (let d = 0; d < 6; d++) {
    const [dq, dr] = DIRS[d]; let q = e.q, r = e.r;
    for (let k = 1; k <= 6; k++) { q += dq; r += dr; const kk = K(q, r); if (!S.grid.nb[kk] || S.walls.has(kk)) break; if (q === pq && r === pr) return d; }
  }
  return -1;
}
export function computeIntents() {
  const p = pk();
  for (const e of S.run.enemies) {
    if (e.sleep) { e.aim = -1; e.tg = null; continue; }
    if (e.type === 'lancer') e.aim = e.cd === 0 ? alignDir(e) : -1;
    else if (e.type === 'drone') e.tg = S.grid.nb[K(e.q, e.r)].includes(p) ? p : bfsStep(e, new Set(S.grid.nb[p]));
  }
}
export function threatMap() {
  const m = new Map(), add = (k, e) => { if (!m.has(k)) m.set(k, []); m.get(k).push(e); };
  for (const e of S.run.enemies) {
    if (e.sleep) continue;
    if (e.type === 'drone') { if (e.tg) add(e.tg, e); }
    else if (e.type === 'brute') for (const n of S.grid.nb[K(e.q, e.r)]) add(n, e);
    else if (e.type === 'lancer' && e.aim >= 0) for (const h of beam(e, e.aim)) add(h, e);
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
    else if (r.mods.strike && !r.strikeUsed && o.has(k) && o.get(k).type !== 'hive') res.push({ q, r: rr, strike: 1, d });
  }
  return res;
}
function applyTail(tail, from, m, wait) {
  const t = tail.slice(), to = K(m.q, m.r), dropped = [];
  if (!wait) { t.push(from); if (m.via) t.push(m.via); const i = t.indexOf(to); if (i >= 0) t.splice(i, 1); }
  else if (t.length) dropped.push(t.shift());
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
// What would this move capture? Used for the live preview.
export function preview(m) {
  const r = S.run, wait = m.q === r.player[0] && m.r === r.player[1];
  const { t } = applyTail(r.tail, pk(), m, wait);
  const inside = findInside(t, K(m.q, m.r)), set = new Set(inside);
  const o = occ(), struck = m.strike ? o.get(K(m.q, m.r)) : null;
  const victims = r.enemies.filter((e) => e !== struck && set.has(K(e.q, e.r)));
  const loot = inside.filter((k) => r.pickups[k]).length + r.spawns.filter((s) => set.has(K(s.q, s.r))).length;
  return { inside, victims, live: victims.length + loot > 0, tail: t };
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
  if (!wait && m.strike) { const e = occ().get(K(m.q, m.r)); r.strikeUsed = true; killEnemy(e, 'strike'); addScore(100, [m.q, m.r]); }
  const { t, dropped } = applyTail(r.tail, fk, m, wait);
  r.tail = t;
  if (!wait) { r.player = [m.q, m.r]; if (m.dash) r.dash--; }
  ev('move', { from, to: r.player.slice(), wait, dash: !!m.dash, d: m.d, tail: t.slice(), dropped });
  if (m.via && r.pickups[m.via]) collect(m.via);
  if (!wait && r.pickups[pk()]) collect(pk());
  doCapture();
  if (settleGoal()) { r.undo = snap; return true; }
  const hits = threatMap().get(pk()) || [];
  for (const e of hits) { hurt(e); if (r.phase !== 'play') { r.undo = snap; ev('settle'); return true; } }
  for (const e of r.enemies) if (e.type === 'lancer' && e.aim >= 0) {
    const hs = beam(e, e.aim), burn = new Set(hs);
    const before = r.tail.length; r.tail = r.tail.filter((k) => !burn.has(k));
    ev('beam', { id: e.id, q: e.q, r: e.r, hs, burned: before - r.tail.length });
    e.aim = -1; e.cd = 2;
  }
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
function collect(k) {
  const r = S.run, t = r.pickups[k]; delete r.pickups[k];
  if (t === 'shard') { r.shardsRun++; addScore(25, P(k)); ev('shard', { k }); }
  else if (t === 'heart') { const was = r.hp; r.hp = Math.min(r.maxHp, r.hp + 1); ev('heal', { k, n: r.hp - was }); }
}
function killEnemy(e, cause) {
  const r = S.run, i = r.enemies.indexOf(e); if (i < 0) return;
  r.enemies.splice(i, 1); r.kills++;
  ev('kill', { id: e.id, type: e.type, q: e.q, r: e.r, cause });
  if (e.type === 'hive') {
    for (const o of r.enemies) { r.kills++; ev('kill', { id: o.id, type: o.type, q: o.q, r: o.r, cause: 'hive' }); }
    r.enemies = []; r.spawns = [];
  }
}
function doCapture() {
  const r = S.run, inside = findInside(r.tail, pk());
  if (!inside.length) return;
  const set = new Set(inside);
  const victims = r.enemies.filter((e) => set.has(K(e.q, e.r)));
  const loot = inside.filter((k) => r.pickups[k]);
  const warns = r.spawns.filter((s) => set.has(K(s.q, s.r)));
  if (!victims.length && !loot.length && !warns.length) return; // empty pocket: nothing happens, tail is kept
  const border = r.tail.filter((k) => S.grid.nb[k].some((n) => set.has(n))), bset = new Set(border);
  let hits = 0;
  const struck = [];
  for (const e of victims) struck.push(e);
  if (r.mods.chain) for (const e of r.enemies) if (!set.has(K(e.q, e.r)) && S.grid.nb[K(e.q, e.r)].some((n) => bset.has(n))) struck.push(e);
  ev('capture', { inside, border, victims: struck.map((e) => e.id), tail: r.tail.filter((k) => !bset.has(k)) });
  for (const e of struck) {
    if (!r.enemies.includes(e)) continue;
    hits++;
    e.hp--;
    if (e.hp <= 0) killEnemy(e, 'loop'); else ev('bossHit', { id: e.id, hp: e.hp });
  }
  for (const s of warns) { hits++; r.kills++; ev('kill', { id: -1, type: s.ty, q: s.q, r: s.r, cause: 'warn' }); }
  r.spawns = r.spawns.filter((s) => !warns.includes(s));
  for (const k of loot) collect(k);
  r.tail = r.tail.filter((k) => !bset.has(k));
  if (hits) {
    r.combo = r.turn - r.lastCap <= 6 ? Math.min(9, r.combo + 1) : 1;
    r.lastCap = r.turn;
    let cq = 0, cr = 0; for (const k of inside) { const [q, rr] = P(k); cq += q; cr += rr; }
    const pts = (inside.length * 10 + hits * 100) * r.combo * (hits >= 2 ? hits : 1);
    addScore(pts, [cq / inside.length, cr / inside.length]);
    ev('combo', { combo: r.combo, hits });
    if (r.mods.overclock) r.dash = Math.min(2, r.dash + 1);
    if (r.mods.siphon && hits >= 2 && r.hp < r.maxHp) { r.hp++; ev('heal', { k: pk(), n: 1 }); }
  }
}
function hurt(e) {
  const r = S.run;
  if (r.mods.aegis && !r.shieldUsed) { r.shieldUsed = true; ev('block', { id: e.id }); return; }
  r.hp--;
  ev('hurt', { id: e.id, type: e.type, hp: r.hp });
  if (r.mods.thorns && (e.type === 'drone' || e.type === 'brute')) { killEnemy(e, 'thorns'); addScore(50, [e.q, e.r]); }
  if (r.hp <= 0) {
    if (r.mods.secondwind && !r.swUsed) { r.swUsed = true; r.hp = 1; ev('secondwind'); }
    else { r.phase = 'dead'; ev('dead'); }
  }
}
// true when the board is finished (tutorial goal met or sector cleared)
function settleGoal() {
  const r = S.run;
  if (r.mode === 'tutorial') {
    const done = r.goal === 'collect' ? !Object.values(r.pickups).includes('shard') : !r.enemies.length;
    if (done) { r.phase = 'tutwin'; ev('tutwin'); ev('settle'); }
    return done;
  }
  const done = r.boss ? !r.enemies.some((e) => e.type === 'hive') : (r.spawned >= r.quota && !r.enemies.length && !r.spawns.length);
  if (!done) return false;
  r.shardsRun += r.boss ? 5 : 2;
  addScore(r.sector * 150, r.player);
  r.log.push(r.boss ? '🟨' : '🟦');
  if (r.boss) r.hp = Math.min(r.maxHp, r.hp + 1);
  if (r.sector >= FINAL) { r.phase = 'won'; ev('won'); }
  else {
    r.phase = 'pick';
    r.choices = shuffle(Object.keys(MODS).filter((id) => MODS[id].stack || !r.mods[id])).slice(0, 3);
    ev('clear');
  }
  ev('settle');
  return true;
}
export function chooseMod(id) {
  const r = S.run;
  if (!r || r.phase !== 'pick') return false;
  if (id === 'repair') r.hp = Math.min(r.maxHp, r.hp + 1);
  else if (r.choices.includes(id)) { r.mods[id] = (r.mods[id] || 0) + 1; if (id === 'overclock') r.dash = Math.max(r.dash, 1); }
  else return false;
  nextSector();
  return true;
}

// ---------- enemies
function bfsStep(e, goals) {
  const r = S.run, s = K(e.q, e.r); if (goals.has(s)) return null;
  const o = occ(), p = pk(), tail = new Set(r.tail);
  const pass = (k) => !S.walls.has(k) && k !== p && !o.has(k) && (e.type === 'eater' || !tail.has(k));
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
  if (e.type === 'hive' || e.sleep) return;
  const p = pk(), [pq, pr] = r.player;
  let goals;
  if (e.type === 'lancer') {
    if (e.cd > 0) e.cd--;
    if (e.cd === 0 && alignDir(e) >= 0) return;
    goals = new Set();
    for (const [dq, dr] of DIRS) { let q = pq, rr = pr; for (let k = 1; k <= 6; k++) { q += dq; rr += dr; const kk = K(q, rr); if (!S.grid.nb[kk] || S.walls.has(kk)) break; if (k >= 2) goals.add(kk); } }
  } else if (e.type === 'eater') goals = new Set(r.tail.length ? r.tail : S.grid.nb[p]);
  else if (e.type === 'brute') { if (e.cd > 0) { e.cd--; return; } e.cd = 1; goals = new Set(S.grid.nb[p]); }
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
    const k = K(s.q, s.r); if (k === p || o.has(k)) return true;
    r.tail = r.tail.filter((x) => x !== k);
    const e = addEnemy(s.ty, s.q, s.r); e.fresh = 1; o.set(k, e);
    ev('spawn', { id: e.id, type: e.type, q: e.q, r: e.r });
    return false;
  });
  const order = r.enemies.slice().sort((a, b) => hd(a.q, a.r, pq, pr) - hd(b.q, b.r, pq, pr));
  for (const e of order) { if (e.fresh) { delete e.fresh; continue; } moveEnemy(e); }
  if (r.mode === 'tutorial') return;
  const warn = (h, extra) => { const s = { q: h[0], r: h[1], ty: pickType(), at: r.turn + 1, x: extra ? 1 : 0 }; r.spawns.push(s); ev('warn', s); };
  if (r.boss) {
    const hv = r.enemies.find((e) => e.type === 'hive');
    if (hv && r.turn >= r.nextSpawn) {
      if (r.enemies.length + r.spawns.length < 6) { const h = randFree(([q, rr]) => hd(q, rr, hv.q, hv.r) <= 2 && hd(q, rr, pq, pr) >= 2); if (h) warn(h, true); }
      r.nextSpawn = r.turn + r.spawnEvery;
    }
  } else if (r.spawned < r.quota && (r.turn >= r.nextSpawn || (!r.enemies.length && !r.spawns.length))) {
    const h = randFree(([q, rr]) => hd(q, rr, pq, pr) >= 3);
    if (h) { warn(h); r.spawned++; r.nextSpawn = r.turn + r.spawnEvery; }
  }
}

// ---------- end of run / meta
export function enemiesLeft() {
  const r = S.run; if (!r) return 0;
  if (r.mode === 'tutorial') return r.enemies.length;
  return r.boss ? (r.enemies.find((e) => e.type === 'hive') || { hp: 0 }).hp : r.quota - r.spawned + r.spawns.length + r.enemies.length;
}
export function finalizeRun() {
  const r = S.run, m = S.meta;
  if (!r) return null;
  const sum = { mode: r.mode, score: r.score, sector: r.sector, kills: r.kills, shards: r.shardsRun, log: r.log.slice(), won: r.phase === 'won', newBest: false, date: r.date };
  if (r.mode !== 'tutorial') {
    if (r.phase !== 'won' && r.log[r.log.length - 1] !== '🟥') sum.log.push('🟥');
    m.shards += r.shardsRun;
    if (r.score > m.best) { m.best = r.score; sum.newBest = true; }
    m.bestSector = Math.max(m.bestSector, r.sector);
    if (r.mode === 'daily' && m.daily && m.daily.date === r.date && !m.daily.done) {
      Object.assign(m.daily, { done: true, score: r.score, sector: r.sector, log: sum.log, won: sum.won });
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
