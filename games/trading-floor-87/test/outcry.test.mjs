import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Outcry, LOT, MAX_LOTS, START_EQUITY, grade } from '../src/outcry.js';

const run = (g, sec) => { for (let i = 0; i < sec * 30; i++) { g.update(1 / 30); if (g.offer) g.pick(0); if (g.over) break; } };

test('traders shout deals into free slots with a price and an edge', () => {
  const g = new Outcry(3);
  run(g, 6);
  assert.ok(g.deals.length >= 1);
  for (const d of g.deals) {
    assert.ok(['buy', 'sell'].includes(d.side));
    assert.ok(Number.isFinite(d.px) && Number.isFinite(d.edge));
    assert.ok(d.slot >= 0 && d.slot < 7);
  }
  assert.equal(new Set(g.deals.map((d) => d.slot)).size, g.deals.length, 'one deal per slot');
});

test('taking a deal fills at its price and moves the tube', () => {
  const g = new Outcry(4);
  run(g, 4);
  const d = g.deals[0];
  const r = g.take(d.id);
  assert.ok(r.ok);
  assert.equal(g.pos, d.side === 'buy' ? LOT : -LOT);
  assert.equal(g.avg, d.px);
  assert.ok(!g.deals.some((x) => x.id === d.id));
});

test('the tube caps your position', () => {
  const g = new Outcry(5);
  g.pos = MAX_LOTS * LOT; g.avg = g.mark;
  for (let i = 0; i < 300 && !g.deals.some((d) => d.side === 'buy'); i++) { g.update(1 / 30); if (g.offer) g.pick(0); }
  const d = g.deals.find((x) => x.side === 'buy');
  if (d) assert.equal(g.take(d.id).reason, 'TUBE FULL');
});

test('holding too long heats the tube until the risk desk dumps you', () => {
  const g = new Outcry(6);
  g.pos = 3 * LOT; g.avg = g.mark;
  let dumped = false;
  for (let i = 0; i < 30 * 60 && !dumped; i++) { g.update(1 / 30); if (g.offer) g.pick(0); dumped = g.drainEvents().some((e) => e.type === 'riskdesk'); }
  assert.ok(dumped);
  assert.equal(g.pos, 0);
  assert.ok(g.heat < 1);
});

test('losing below the bust line closes you out with an F', () => {
  const g = new Outcry(7);
  g.pos = 30; g.avg = g.mark + 25; // −$375k on the mark
  g.update(1 / 30);
  assert.ok(g.over && g.busted);
  assert.equal(g.card.grade, 'F');
  assert.equal(g.pos, 0);
});

test('guided start: a good buy, then a good sell, then the real market', () => {
  const g = new Outcry(8, { guide: true });
  run(g, 2);
  assert.equal(g.deals.length, 1);
  assert.equal(g.deals[0].side, 'buy');
  assert.ok(g.deals[0].edge > 0);
  g.take(g.deals[0].id);
  run(g, 2);
  assert.equal(g.deals[0].side, 'sell');
  g.take(g.deals[0].id);
  assert.equal(g.guide, null);
  assert.equal(g.pos, 0);
});

test('a full day ends at the bell, flat, with a card', () => {
  const g = new Outcry(9);
  while (!g.over) { g.update(0.1); if (g.offer) g.pick(0); g.drainEvents(); }
  assert.ok(g.card && !g.card.busted);
  assert.equal(g.pos, 0);
  assert.equal(g.card.pnl, g.equity() - START_EQUITY);
});

test('grades', () => {
  assert.equal(grade(600000, false), 'S');
  assert.equal(grade(300000, false), 'A');
  assert.equal(grade(-1, false), 'D');
  assert.equal(grade(1e6, true), 'F');
});

test('profitable closes build a streak that pays a desk bonus; a loss breaks it', () => {
  const g = new Outcry(10, { augments: false });
  g.pos = 5; g.avg = g.mark - 2;
  for (let k = 0; k < 4; k++) {
    g.pos = 5; g.avg = g.mark - 2;
    const b = g._scoreClose(5000);
    if (k >= 2) assert.ok(b > 0, `bonus at streak ${g.streak}`);
  }
  assert.equal(g.streak, 4);
  assert.equal(g.tier.name, 'HOT');
  g._scoreClose(-100);
  assert.equal(g.streak, 0);
  assert.ok(g.bonus > 0);
});

test('a phase change freezes the floor and offers three augments that change the rules', () => {
  const g = new Outcry(11);
  let guard = 0;
  while (!g.offer && guard++ < 30 * 200) g.update(1 / 30);
  assert.ok(g.offer && g.offer.length === 3);
  const t = g.sim.t;
  g.update(1);
  assert.equal(g.sim.t, t, 'frozen while choosing');
  const fat = g.offer.findIndex((a) => a.id === 'fat');
  const a = g.pick(fat >= 0 ? fat : 0);
  assert.ok(g.augments.includes(a.id));
  assert.equal(g.offer, null);
  if (a.id === 'fat') assert.equal(g.lot, 10);
});

test('golden parachute saves one bust', () => {
  const g = new Outcry(12, { augments: false });
  g.mods.parachute = 1;
  g.pos = 30; g.avg = g.mark + 25;
  g.update(1 / 30);
  assert.ok(!g.over);
  assert.ok(Math.abs(g.equity() - 200000) < 1);
  g.pos = 30; g.avg = g.mark + 25;
  g.update(1 / 30);
  assert.ok(g.over && g.busted);
});
