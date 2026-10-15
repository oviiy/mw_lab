import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sim, PLAYER } from '../src/market/sim.js';
import { PREV_SETTLE, SESSION_MIN } from '../src/market/calibration.js';

function runDay(seed) {
  const sim = new Sim(seed);
  const path = [];
  while (!sim.done) { sim.advance(1); path.push(sim.lastPx); }
  return { sim, path };
}

test('50 seeded sessions all crash by a historically plausible amount', () => {
  const rets = [];
  for (let s = 1; s <= 50; s++) {
    const { sim, path } = runDay(s);
    const ret = sim.lastPx / PREV_SETTLE - 1;
    rets.push(ret);
    assert.ok(ret <= -0.2 && ret >= -0.36, `seed ${s} settled ${(ret * 100).toFixed(1)}%`);
    assert.ok(path.every(Number.isFinite), `seed ${s} produced a non-finite price`);
    assert.ok(Number.isFinite(sim.cash) && sim.volume > 0);
  }
  rets.sort((a, b) => a - b);
  const median = rets[25];
  assert.ok(median < -0.24 && median > -0.33, `median ${median}`);
});

test('story shape: a false rally, then the biggest damage after the arb link breaks', () => {
  let rallies = 0;
  for (let s = 1; s <= 20; s++) {
    const { path } = runDay(s);
    const at = (m) => path[Math.min(path.length - 1, m)];
    if (at(150) > at(60)) rallies++;
    const morningLow = Math.min(...path.slice(0, 240));
    const dayLow = Math.min(...path);
    assert.ok(dayLow < morningLow - 15, `seed ${s}: afternoon low ${dayLow} vs morning ${morningLow}`);
  }
  assert.ok(rallies >= 16, `only ${rallies}/20 sessions had a late-morning rally`);
});

test('short-covering squeezes rally the market inside the crash', () => {
  let big = 0, total = 0;
  for (let s = 1; s <= 10; s++) {
    const sim = new Sim(s);
    const path = [];
    while (!sim.done) { sim.advance(0.25); path.push([sim.t, sim.lastPx]); }
    for (const q of sim.director.squeezes) {
      total++;
      const w = path.filter(([t]) => t >= q.at - 1 && t <= q.at + q.len + 2).map((p) => p[1]);
      if (Math.max(...w) - Math.min(...w.slice(0, 6)) >= 5) big++;
    }
  }
  assert.ok(big / total >= 0.7, `only ${big}/${total} squeezes rallied 5+ points`);
});

test('same seed ⇒ identical session', () => {
  const a = new Sim(7), b = new Sim(7);
  const la = [], lb = [];
  a.onTrade((t) => la.push(`${t.tick}:${t.qty}:${t.buyer}:${t.seller}`));
  b.onTrade((t) => lb.push(`${t.tick}:${t.qty}:${t.buyer}:${t.seller}`));
  for (let i = 0; i < 60; i++) { a.advance(1); b.advance(1); }
  assert.ok(la.length > 100);
  assert.deepEqual(la, lb);
});

test('session ends at the closing bell', () => {
  const { sim } = runDay(3);
  assert.ok(sim.done && sim.t >= SESSION_MIN && sim.t < SESSION_MIN + 0.1);
  assert.ok(sim.bars.length >= SESSION_MIN - 1);
});

test('player trades fill only at compatible prices and move the tape', () => {
  const sim = new Sim(11);
  sim.advance(5);
  const trades = [];
  sim.onTrade((t) => trades.push(t));
  let tested = false;
  for (const a of sim.agents) {
    const it = sim.intent(a.id);
    if (!it.ask) continue;
    assert.equal(sim.playerTrade(a.id, 'buy', it.ask.tick - 1, 1), 0, 'below their offer must not fill');
    const q = sim.playerTrade(a.id, 'buy', it.ask.tick, 1);
    assert.equal(q, 1);
    const t = trades.at(-1);
    assert.equal(t.buyer, PLAYER);
    assert.equal(t.seller, a.id);
    assert.equal(sim.last, it.ask.tick);
    tested = true;
    break;
  }
  assert.ok(tested, 'no agent was offering');
});

test('player sweep hits the book', () => {
  const sim = new Sim(12);
  sim.advance(3);
  const r = sim.playerSweep('sell', 20);
  assert.ok(r.filled > 0);
  assert.ok(r.trades.every((t) => t.seller === PLAYER));
});
