import test from 'node:test';
import assert from 'node:assert/strict';
import { Board } from '../src/board.js';
import { DIRS, toWorld, fromWorld, key } from '../src/hex.js';
import { rotatedEdges, makeTile } from '../src/tiles.js';
import { mulberry32 } from '../src/rng.js';

test('neighbour directions line up with edge angles and opposites', () => {
  for (let i = 0; i < 6; i++) {
    const [dq, dr] = DIRS[i];
    const [oq, or] = DIRS[(i + 3) % 6];
    assert.equal(dq + oq, 0);
    assert.equal(dr + or, 0);
    const { x, z } = toWorld(dq, dr);
    const a = Math.atan2(z, x);
    const want = ((i * 60 + 30) * Math.PI) / 180;
    assert.ok(Math.abs(Math.cos(a) - Math.cos(want)) < 1e-9 && Math.abs(Math.sin(a) - Math.sin(want)) < 1e-9);
  }
});

test('world <-> hex round trip', () => {
  for (let q = -4; q <= 4; q++) for (let r = -4; r <= 4; r++) {
    const { x, z } = toWorld(q, r);
    assert.deepEqual(fromWorld(x + 0.2, z - 0.2), { q, r });
  }
});

test('rotation moves edge j to j+rot', () => {
  const e = ['a', 'b', 'c', 'd', 'e', 'f'];
  assert.deepEqual(rotatedEdges(e, 1), ['f', 'a', 'b', 'c', 'd', 'e']);
  assert.deepEqual(rotatedEdges(e, 6), e);
});

test('tiles never carry long water runs', () => {
  const rng = mulberry32(5);
  for (let i = 0; i < 2000; i++) {
    const t = makeTile(rng);
    assert.equal(t.edges.length, 6);
    assert.ok(t.edges.filter((x) => x === 'water').length <= 3);
  }
});

test('water must meet water', () => {
  const b = new Board(1);
  const [dq, dr] = DIRS[0];
  b.queue[0] = { edges: Array(6).fill('water'), quest: null, seed: 1 };
  assert.equal(b.evaluate(dq, dr, 0).valid, false);
  b.queue[0] = { edges: Array(6).fill('meadow'), quest: null, seed: 1 };
  const ev = b.evaluate(dq, dr, 0);
  assert.equal(ev.valid, true);
  // new tile's edge 3 faces the starter's edge 0, which is meadow
  assert.equal(ev.points, 10);
});

test('regions merge across tiles and track open sides', () => {
  const b = new Board(1);
  const [dq, dr] = DIRS[0];
  b.queue[0] = { edges: Array(6).fill('meadow'), quest: null, seed: 1 };
  const starter = b.cells.get(key(0, 0));
  // starter edge 0 is meadow; new tile edge 3 is meadow -> match
  const res = b.place(dq, dr, 0);
  assert.equal(res.m, 1);
  assert.equal(res.points, 10);
  const reg = b.regionOfWedge(starter.wedges[0]);
  assert.equal(reg.tiles.size, 2);
  assert.equal(reg.terrain, 'meadow');
});

test('a full auto-played game ends and is deterministic', () => {
  const run = () => {
    const b = new Board(12345);
    let guard = 0;
    while (!b.over && guard++ < 500) {
      const m = b.bestMove();
      if (!m) { b.discard(); continue; }
      assert.ok(b.place(m.q, m.r, m.rot));
    }
    assert.ok(b.over, 'game should end');
    return b;
  };
  const a = run(), c = run();
  assert.equal(a.score, c.score);
  assert.ok(a.score > 100);
  assert.ok(a.stats.placed >= 24);
  for (const q of a.quests) assert.ok(['active', 'done', 'failed'].includes(q.state));
});

test('games last a reasonable length with good play', () => {
  const lens = [];
  for (let s = 1; s <= 20; s++) {
    const b = new Board(s * 977);
    let guard = 0;
    while (!b.over && guard++ < 1000) {
      const m = b.bestMove();
      if (!m) b.discard(); else b.place(m.q, m.r, m.rot);
    }
    assert.ok(b.over, 'game ' + s + ' never ended');
    lens.push(b.stats.placed);
  }
  const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
  console.log('placed per game:', lens.join(' '), 'avg', avg.toFixed(1));
  assert.ok(avg < 150);
});

test('the deal does not depend on how the player plays', () => {
  for (let seed = 1; seed <= 60; seed++) {
    const greedy = new Board(seed), lazy = new Board(seed);
    for (let n = 0; n < 25 && !greedy.over && !lazy.over; n++) {
      assert.deepEqual(greedy.current.edges, lazy.current.edges, `seed ${seed} tile ${n}`);
      const g = greedy.bestMove();
      if (g) greedy.place(g.q, g.r, g.rot); else greedy.discard();
      // the lazy player takes the first legal spot it finds
      let done = false;
      for (const s of lazy.frontier().values()) {
        for (let rot = 0; rot < 6 && !done; rot++) if (lazy.evaluate(s.q, s.r, rot).valid) { lazy.place(s.q, s.r, rot); done = true; }
        if (done) break;
      }
      if (!done) lazy.discard();
    }
  }
});

test('quest preview matches the real outcome', () => {
  let checked = 0;
  for (let seed = 1; seed <= 150; seed++) {
    const b = new Board(seed);
    let guard = 0;
    while (!b.over && guard++ < 200) {
      const m = b.bestMove();
      if (!m) { b.discard(); continue; }
      const pv = b.questPreview(m.q, m.r, m.rot);
      const before = new Map(b.activeQuests().map((q) => [q.id, b.questProgress(q).size]));
      b.place(m.q, m.r, m.rot);
      for (const p of pv) { assert.equal(b.questProgress(p.quest).size, p.size, `seed ${seed}`); checked++; }
      for (const [id, size] of before) {
        const q = b.quests.find((x) => x.id === id);
        if (!pv.some((p) => p.quest.id === id)) assert.equal(b.questProgress(q).size, size, `seed ${seed} quest ${id} grew unpredicted`);
      }
    }
  }
  assert.ok(checked > 100, 'checked ' + checked);
});

test('sealing off a big area pays once', () => {
  for (let seed = 1; seed <= 80; seed++) {
    const b = new Board(seed);
    let guard = 0, closures = 0;
    while (!b.over && guard++ < 200) {
      const m = b.bestMove();
      if (!m) { b.discard(); continue; }
      const res = b.place(m.q, m.r, m.rot);
      for (const c of res.closed) { assert.ok(c.size >= 4); closures++; }
    }
    assert.equal(closures, b.stats.closed);
    assert.equal(b.closedRoots.size, closures);
  }
});

test('streaks multiply snug and perfect fits, and ranks grant tiles once', async () => {
  const { RANKS, RANK_TILES, STREAK_STEP } = await import('../src/board.js');
  for (let seed = 1; seed <= 60; seed++) {
    const b = new Board(seed);
    let guard = 0, ranks = 0;
    while (!b.over && guard++ < 300) {
      const m = b.bestMove();
      if (!m) { b.discard(); continue; }
      const streakBefore = b.streak;
      const ev = b.evaluate(m.q, m.r, m.rot);
      if (ev.snug || ev.perfect) assert.equal(ev.mult, 1 + STREAK_STEP * Math.min(streakBefore, b.streakMax));
      else assert.equal(ev.mult, 1);
      const remBefore = b.remaining;
      const res = b.place(m.q, m.r, m.rot);
      assert.equal(b.streak, ev.snug || ev.perfect ? streakBefore + 1 : 0);
      ranks += res.rankUps.length;
      assert.equal(b.remaining, remBefore - 1 + res.gained);
      assert.ok(res.gained >= res.rankUps.length * RANK_TILES);
    }
    assert.equal(ranks, b.rank);
    assert.ok(b.score >= RANKS[b.rank].min);
  }
});

test('outcome preview predicts sealed areas and lost requests, without touching the board', () => {
  const rng = mulberry32(31);
  let sealed = 0, lost = 0;
  for (let seed = 1; seed <= 150; seed++) {
    const b = new Board(seed);
    let guard = 0;
    while (!b.over && guard++ < 200) {
      // a mix of best and random-but-legal moves, so requests do get lost sometimes
      let m = b.bestMove();
      if (!m) { b.discard(); continue; }
      if (rng() < 0.5) {
        const opts = [];
        for (const s of b.frontier().values()) for (let rot = 0; rot < 6; rot++) if (b.evaluate(s.q, s.r, rot).valid) opts.push({ q: s.q, r: s.r, rot });
        m = opts[Math.floor(rng() * opts.length)];
      }
      const scoreBefore = b.score, regionsBefore = b.regions.size;
      const out = b.outcome(m.q, m.r, m.rot);
      assert.equal(b.score, scoreBefore);
      assert.equal(b.regions.size, regionsBefore);
      const res = b.place(m.q, m.r, m.rot);
      assert.deepEqual(out.sealed.map((c) => c.points).sort(), res.closed.map((c) => c.points).sort(), `seed ${seed}`);
      const failed = res.questsFailed.filter((q) => q.cellKey !== res.cell.k).map((q) => q.id).sort();
      assert.deepEqual(out.lost.filter((q) => !q.own).map((q) => q.id).sort(), failed, `seed ${seed} lost`);
      assert.equal(out.lost.some((q) => q.own), res.questsFailed.some((q) => q.cellKey === res.cell.k));
      sealed += out.sealed.length;
      lost += out.lost.length;
    }
  }
  assert.ok(sealed > 20 && lost > 5, `sealed ${sealed} lost ${lost}`);
});
