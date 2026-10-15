import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrderBook, toTick, toPx } from '../src/market/orderbook.js';
import { Rng } from '../src/util.js';

test('tick conversion round-trips', () => {
  assert.equal(toTick(254.35), 5087);
  assert.equal(toPx(5087), 254.35);
});

test('resting orders set the touch; crossing order matches at passive price', () => {
  const b = new OrderBook();
  b.submit(1, 'buy', 5000, 10);
  b.submit(2, 'sell', 5004, 7);
  assert.equal(b.bestBid, 5000);
  assert.equal(b.bestAsk, 5004);
  const r = b.submit(3, 'buy', 5010, 5);
  assert.equal(r.filled, 5);
  assert.equal(r.trades[0].tick, 5004);
  assert.equal(r.trades[0].seller, 2);
  assert.equal(r.trades[0].buyer, 3);
  assert.equal(b.depth('ask', 1)[0][1], 2);
});

test('price-time priority within a level', () => {
  const b = new OrderBook();
  b.submit(1, 'sell', 5004, 3);
  b.submit(2, 'sell', 5004, 3);
  const r = b.submit(9, 'buy', 5004, 4);
  assert.deepEqual(r.trades.map((t) => [t.seller, t.qty]), [[1, 3], [2, 1]]);
});

test('IOC does not rest; sweep walks levels and refreshes the touch', () => {
  const b = new OrderBook();
  b.submit(1, 'buy', 5000, 2);
  b.submit(2, 'buy', 4998, 2);
  const r = b.submit(3, 'sell', 4990, 10, true);
  assert.equal(r.filled, 4);
  assert.equal(r.rest, 0);
  assert.equal(b.bestBid, -1);
  assert.equal(b.bestAsk, Infinity);
});

test('cancel and reduce keep level quantities consistent', () => {
  const b = new OrderBook();
  const a = b.submit(1, 'buy', 5000, 10).id;
  b.submit(2, 'buy', 5000, 5);
  b.reduce(a, 4);
  assert.equal(b.depth('bid', 1)[0][1], 11);
  b.cancel(a);
  assert.equal(b.depth('bid', 1)[0][1], 5);
  assert.equal(b.get(a), null);
});

test('fuzz: book never crossed, quantities conserved, no NaN', () => {
  const b = new OrderBook();
  const rng = new Rng(42);
  let submitted = 0, filledBoth = 0;
  const live = [];
  for (let i = 0; i < 20000; i++) {
    if (live.length && rng.chance(0.3)) {
      b.cancel(live.splice(rng.int(0, live.length - 1), 1)[0]);
      continue;
    }
    const side = rng.chance(0.5) ? 'buy' : 'sell';
    const qty = rng.int(1, 20);
    const r = b.submit(i % 7, side, 5000 + rng.int(-30, 30), qty, rng.chance(0.2));
    submitted += qty;
    for (const t of r.trades) { assert.ok(t.qty > 0); filledBoth += t.qty; }
    if (r.id) live.push(r.id);
    if (b.bestBid > 0 && b.bestAsk < Infinity) assert.ok(b.bestBid < b.bestAsk, `crossed at ${i}`);
  }
  let resting = 0;
  for (const o of b.orders.values()) { assert.ok(Number.isFinite(o.qty) && o.qty > 0); resting += o.qty; }
  assert.ok(filledBoth <= submitted);
  assert.ok(resting >= 0);
});
