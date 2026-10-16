// Headless rule tests: node tools/test-logic.mjs
import * as G from '../src/game.js';
import { K, P, hd } from '../src/hex.js';
import { TUTORIAL } from '../src/levels.js';

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
const S = G.S;
const fresh = () => { S.meta = G.defMeta(); S.events = []; };
const go = (q, r) => G.doMove({ q, r });
const blank = (rad = 4) => {
  fresh(); G.startRun('run'); const r = S.run;
  Object.assign(r, { rad, walls: [], enemies: [], pickups: {}, spawns: [], tail: [], quota: 99, spawned: 0, nextSpawn: 1e9, player: [0, 0] });
  G.setRun(r); return r;
};

// ---- tutorial boards are solvable with the intended line
fresh(); G.startRun('tutorial');
ok(S.run.tut === 0 && S.run.rad === 2, 'tutorial starts on board 1 (radius 2)');
for (const [q, r] of [[1, -1], [1, -2], [2, -2], [2, -1], [2, 0]]) go(q, r);
ok(S.run.phase === 'tutwin', 'T1: collecting all shards wins');
G.nextTutorial();
for (const [q, r] of [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1]]) go(q, r);
ok(S.run.phase === 'tutwin', 'T2: walking the ghost ring destroys the sleeping drone');
G.nextTutorial();
ok(S.run.enemies[0].tg !== null, 'T3: awake drone telegraphs a target');
G.nextTutorial(); // skip T3 (dynamic)
for (const [q, r] of [[0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -2], [1, -2]]) go(q, r);
ok(S.run.phase === 'tutwin', 'T4: one loop using the rocks kills all 3 drones');
const comboEv = S.events.filter((e) => e.t === 'combo').pop();
ok(comboEv && comboEv.hits === 3, 'T4: capture reports 3 hits');
G.nextTutorial(); G.nextTutorial();
ok(S.run.phase === 'tutdone' && S.meta.tutorialDone, 'finishing board 5 marks tutorial done');

// ---- core rules
{ const r = blank(); r.enemies = [{ id: 9, type: 'drone', q: 2, r: -1, hp: 1, aim: -1, cd: 0, sleep: true }];
  r.player = [3, -1];
  for (const [q, rr] of [[3, -2], [2, -2], [1, -1], [1, 0], [2, 0]]) go(q, rr);
  ok(!S.run.enemies.length, 'ring around an enemy destroys it'); ok(S.run.score > 0, 'capture scores'); }
{ const r = blank(); r.enemies = [{ id: 9, type: 'drone', q: 4, r: 0, hp: 1, aim: -1, cd: 0, sleep: true }];
  r.player = [3, 1]; r.tail = ['4,-1'];
  go(3, 0);
  ok(S.run.enemies.length === 1, 'board edge is NOT a wall: corner cuts do nothing'); }
{ const r = blank(); r.player = [0, 0]; r.enemies = [{ id: 7, type: 'drone', q: -4, r: 4, hp: 1, aim: -1, cd: 0, sleep: true }];
  for (const [q, rr] of [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]) go(q, rr);
  ok(S.run.tail.length === 6, 'empty loop does not eat the tail'); }
{ const r = blank(); r.enemies = [{ id: 1, type: 'drone', q: 1, r: 0, hp: 1, aim: -1, cd: 0 }]; G.computeIntents();
  ok(r.enemies[0].tg === '0,0', 'adjacent drone targets your hex');
  const hp = r.hp; go(0, 0); ok(S.run.hp === hp - 1, 'waiting on a target hurts'); }
{ const r = blank(); r.enemies = [{ id: 1, type: 'drone', q: 1, r: 0, hp: 1, aim: -1, cd: 0 }]; G.computeIntents();
  const hp = r.hp; go(0, -1); ok(S.run.hp === hp, 'stepping aside dodges'); }
{ const r = blank(); r.enemies = [{ id: 1, type: 'brute', q: 0, r: 0, hp: 2, aim: -1, cd: 0, sleep: true }]; r.player = [0, 1];
  for (const [q, rr] of [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1]]) go(q, rr);
  ok(S.run.enemies.length === 1 && S.run.enemies[0].hp === 1, 'one loop only wounds a brute (2 HP)'); }
{ const r = blank(); r.enemies = [{ id: 1, type: 'lancer', q: 2, r: 0, hp: 1, aim: 3, cd: 0 }];
  const hp = r.hp; go(0, 0); ok(S.run.hp === hp - 1, 'standing in a lancer beam hurts'); }
{ const r = blank(); r.enemies = [{ id: 1, type: 'lancer', q: 2, r: 0, hp: 1, aim: 3, cd: 0 }];
  r.tail = ['-1,0', '-2,0']; go(0, 1);
  ok(S.run.tail.includes('-1,0'), 'beam does not burn your tail'); }
{ const r = blank(); r.player = [0, 0];
  for (let i = 0; i < 12; i++) { const m = G.moves().find((x) => !x.dash && !S.run.tail.includes(K(x.q, x.r))); go(m.q, m.r); }
  ok(S.run.tail.length === G.tailLen(), 'tail capped at tail length');
  const n = S.run.tail.length; go(...S.run.player); ok(S.run.tail.length === n - 1, 'waiting shrinks tail'); }
{ const r = blank(); r.enemies = [{ id: 1, type: 'drone', q: 3, r: 0, hp: 1, aim: -1, cd: 0 }]; r.pickups = { '1,0': 'shard' }; G.computeIntents();
  go(1, 0); const after = JSON.stringify([S.run.player, S.run.shardsRun]);
  ok(G.undo(), 'undo works'); ok(S.run.player[0] === 0 && S.run.shardsRun === 0, 'undo restores position and shards');
  ok(!G.undo(), 'only one undo per sector'); void after; }
{ const r = blank(); r.quota = 1; r.spawned = 1; r.enemies = [{ id: 1, type: 'drone', q: 0, r: 0, hp: 1, aim: -1, cd: 0, sleep: true }]; r.player = [0, 1];
  for (const [q, rr] of [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1]]) go(q, rr);
  ok(S.run.phase === 'pick' && S.run.choices.length === 3, 'sector clear offers 3 mods');
  ok(G.chooseMod(S.run.choices[0]) && S.run.sector === 2, 'choosing advances to sector 2'); }
{ const r = blank(); r.player = [0, 0];
  const pv = G.preview({ q: 1, r: 0 }); ok(Array.isArray(pv.inside) && pv.live === false, 'preview of a plain move captures nothing'); }
{ fresh(); G.startRun('run'); ok(S.run.sector === 1 && S.run.walls.length === 4, 'normal run sector 1 is hand-authored'); }
{ fresh(); G.startRun('daily'); const a = JSON.stringify(S.run.walls); fresh(); G.startRun('daily'); ok(JSON.stringify(S.run.walls) === a, 'daily board is deterministic'); }
{ fresh(); G.startRun('daily'); S.run.phase = 'dead'; const sum = G.finalizeRun(); ok(S.meta.daily.done && S.meta.streak.n === 1 && sum, 'daily finalize records + streak');
  const saved = { meta: JSON.parse(JSON.stringify(S.meta)), run: null }; saved.meta.daily.done = false;
  const merged = G.mergeImported(saved); ok(merged.meta.daily.done, 'import cannot reopen a finished daily'); }

{ const r = blank(); r.enemies = [{ id: 1, type: 'drone', q: 3, r: -1, hp: 1, aim: -1, cd: 0 }]; G.computeIntents(); r.player = [-3, 1];
  for (let i = 0; i < G.DAZE_AFTER; i++) { const m = G.moves().find((x) => !x.dash) ; go(m.q, m.r); if (S.run.phase !== 'play') break; }
  ok(S.run.dazed && S.run.enemies.every((e) => e.sleep), 'after a long dry spell all enemies are dazed (safety net)'); }
// ---- new content
{ const r = blank(); r.lava = ['1,0']; G.setRun(r); r.enemies = [{ id: 1, type: 'drone', q: -3, r: 3, hp: 1, aim: -1, cd: 0, sleep: true }];
  const hp = r.hp; go(1, 0); ok(S.run.hp === hp - 1, 'ending on lava hurts'); }
{ const r = blank(); r.enemies = [{ id: 1, type: 'splitter', q: 0, r: 0, hp: 1, aim: -1, cd: 0, sleep: true }]; r.player = [0, 1];
  for (const [q, rr] of [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1]]) go(q, rr);
  ok(S.run.enemies.filter((e) => e.type === 'mite').length === 2, 'a looped Splitter splits into 2 Mites'); }
{ const r = blank(); r.boss = true; r.bossType = 'warden'; r.enemies = []; G.setRun(r); const w = G.addEnemy('warden', 0, 0); w.sleep = true; r.player = [0, 1];
  for (const [q, rr] of [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1]]) go(q, rr);
  const w2 = S.run.enemies.find((e) => e.type === 'warden'); ok(w2 && w2.hp === 3 && (w2.q !== 0 || w2.r !== 0), 'a looped Warden loses 1 HP and teleports'); }
{ const r = blank(); r.pickups = { '1,0': 'shrine' }; r.enemies = [{ id: 1, type: 'drone', q: -3, r: 3, hp: 1, aim: -1, cd: 0, sleep: true }]; const n = Object.keys(r.mods).length;
  go(1, 0); ok(Object.keys(S.run.mods).length === n + 1, 'a shrine grants a free augment'); }
{ fresh(); G.startRun('run'); const r = S.run; r.sector = 8; G.nextSector(); r.enemies = []; r.spawns = []; G.takeEvents();
  ok(r.boss && r.bossType === 'colossus', 'sector 9 boss is the Colossus');
  r.phase = 'won'; ok(G.continueEndless() && S.run.phase === 'pick', 'beating sector 9 can continue into Endless');
  G.chooseMod(S.run.choices[0]); ok(S.run.sector === 10 && S.run.endless, 'Endless continues at sector 10'); }
{ fresh(); G.startRun('run'); S.run.sector = 3; S.run.phase = 'play'; S.run.boss = true; const ch = (() => { S.run.phase = 'play'; return null; })(); void ch;
  const r = S.run; r.sector = 2; G.nextSector(); ok(r.bossType === 'hive', 'sector 3 boss is the Hive'); r.enemies = []; r.phase = 'play';
  G.doMove({ q: r.player[0], r: r.player[1] }); ok(S.run.choiceTier === 'prism', 'beating a boss offers prismatic augments'); }
// ---- bot stress: smart-ish bot (takes captures, avoids red, otherwise heads toward the nearest enemy)
let errs = 0, steps = 0; const reached = {};
for (let g = 0; g < 120; g++) {
  try {
    fresh(); G.startRun('run'); let n = 0;
    while (S.run && ['play', 'pick'].includes(S.run.phase) && n < 2500) {
      n++; steps++;
      if (S.run.phase === 'pick') { G.chooseMod(S.run.choices[0] || 'repair'); continue; }
      const th = G.threatMap(), ms = G.moves(), r = S.run;
      const near = r.enemies.slice().sort((a, b) => hd(a.q, a.r, ...r.player) - hd(b.q, b.r, ...r.player))[0];
      const sc = ms.map((m) => { const pv = G.preview(m); let v = pv.victims.length * 20 + (pv.live ? 3 : 0) - (th.has(K(m.q, m.r)) ? 15 : 0);
        if (near) { const d = hd(m.q, m.r, near.q, near.r); v += d === 1 ? 2 : d === 2 ? 1 : -d * 0.3; } return { m, v: v + Math.random() }; });
      sc.sort((a, b) => b.v - a.v);
      G.doMove(sc.length ? sc[0].m : { q: r.player[0], r: r.player[1] });
      G.takeEvents();
      const rr = S.run;
      if (!Number.isFinite(rr.score) || !Number.isFinite(rr.hp)) throw new Error('NaN');
      const o = new Set(rr.enemies.map((e) => K(e.q, e.r)));
      if (o.size !== rr.enemies.length || o.has(K(...rr.player))) throw new Error('overlap');
      if (rr.enemies.some((e) => !S.grid.nb[K(e.q, e.r)] || S.walls.has(K(e.q, e.r)))) throw new Error('enemy off board');
      if (rr.tail.length > G.tailLen()) throw new Error('tail too long');
      JSON.stringify(rr);
    }
    const key = S.run.sector + S.run.phase[0]; reached[key] = (reached[key] || 0) + 1;
  } catch (e) { errs++; if (errs < 3) console.log(e.stack); }
}
ok(errs === 0, `120 bot runs without invalid state (${steps} steps)`);
console.log('bot sector reached:', JSON.stringify(reached));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
