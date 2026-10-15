import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fmtMoney, fmtPct, fmtNum, quarterLabel, initials, parseRoute, search, sortRows,
         sankeyFromFlows, sectorSankey, aggregateFlows, rankFlows, fromRows, filterClusters, filterPlayers, groupPlayers, titleCase } from './calc.js';

test('formatters', () => {
  assert.equal(fmtMoney(274160086701), '$274.16B');
  assert.equal(fmtMoney(-1.5e6), '-$1.5M');
  assert.equal(fmtMoney(4.6e13), '$46.00T');
  assert.equal(fmtMoney(null), '—');
  assert.equal(fmtMoney(999999), '$1.0M');
  assert.equal(fmtMoney(999.7), '$1K');
  assert.equal(fmtMoney(999400), '$999K');
  assert.equal(fmtMoney(999.996e9), '$1.00T');
  assert.equal(fmtPct(0.1234), '12.3%');
  assert.equal(fmtPct(NaN), '—');
  assert.equal(fmtNum(1234567.4), '1,234,567');
  assert.equal(quarterLabel('2026-06-30'), '2026Q2');
  assert.equal(initials('Warren Buffett / Greg Abel'), 'WB');
  assert.equal(initials('李录 Li Lu'), 'LL');
  assert.equal(initials('???'), '?');
});

test('parseRoute', () => {
  assert.deepEqual(parseRoute(''), { page: 'home', params: {} });
  assert.deepEqual(parseRoute('#/'), { page: 'home', params: {} });
  assert.deepEqual(parseRoute('#/manager/1067983'), { page: 'manager', params: { cik: '1067983' } });
  assert.deepEqual(parseRoute('#/stock/brk-b'), { page: 'stock', params: { t: 'BRK-B' } });
  assert.deepEqual(parseRoute('#/methods'), { page: 'methods', params: {} });
  assert.deepEqual(parseRoute('#/managers'), { page: 'managers', params: {} });
  assert.deepEqual(parseRoute('#/players/congress'), { page: 'players', params: { g: 'congress' } });
  assert.deepEqual(parseRoute('#/congress'), { page: 'congress', params: {} });
  assert.deepEqual(parseRoute('#/member/P000197'), { page: 'member', params: { id: 'P000197' } });
  assert.deepEqual(parseRoute('#/insiders'), { page: 'insiders', params: {} });
  assert.deepEqual(parseRoute('#/insider/0001604405'), { page: 'insider', params: { cik: '1604405' } });
  assert.deepEqual(parseRoute('#/insider/abc'), { page: 'notfound', params: {} });
  assert.deepEqual(parseRoute('#/nope'), { page: 'notfound', params: {} });
});

test('search ranks exact ticker, then prefix, then name; managers first', () => {
  const meta = { managers: [{ cik: 1, name: 'Appaloosa', person: 'David Tepper' }],
    stocks: [{ t: 'AAPLX', n: 'X' }, { t: 'AAPL', n: 'APPLE INC' }, { t: 'ZZZ', n: 'AAPL HOLDINGS' }] };
  assert.deepEqual(search(meta, 'aapl').map(r => r.label), ['AAPL', 'AAPLX', 'ZZZ']);
  assert.deepEqual(search(meta, 'tepper').map(r => r.href), ['#/manager/1']);
  assert.deepEqual(search(meta, '  '), []);
});

test('sortRows puts nulls last', () => {
  const rows = [{ v: 2 }, { v: null }, { v: 5 }];
  assert.deepEqual(sortRows(rows, 'v', 'desc').map(r => r.v), [5, 2, null]);
  assert.deepEqual(sortRows(rows, 'v', 'asc').map(r => r.v), [2, 5, null]);
});

test('sankeyFromFlows routes buys into and sells out of the stock', () => {
  const s = sankeyFromFlows([{ kind: 'new', group: 'curated', dollars: 10 }, { kind: 'exit', group: 'other', dollars: 5 },
                             { kind: 'trim', group: 'other', dollars: 0 }], 'AAPL');
  assert.deepEqual(s.links, [{ source: '新建·跟踪的经理', target: 'AAPL', value: 10 }, { source: 'AAPL', target: '清仓·其他机构', value: 5 }]);
  assert.equal(s.nodes.length, 3);
});

test('sectorSankey', () => {
  const s = sectorSankey({ buys: { 能源: 5 }, sells: { 金融: 3, 能源: 0 } });
  assert.deepEqual(s.links, [{ source: '卖出·金融', target: '跟踪的经理', value: 3 }, { source: '跟踪的经理', target: '买入·能源', value: 5 }]);
});

test('flow aggregation and ranking', () => {
  const rows = [[1, 10, 'AAA', 'n', 500], [1, 11, 'AAA', 't', -100], [1, 10, 'BBB', 'x', -900], [1, 12, 'CCC', 'a', 50], [0, 10, 'AAA', 'n', 7]];
  const agg = aggregateFlows(rows, 1);
  const a = agg.find(x => x.key === 'AAA');
  assert.deepEqual([a.net, a.buy, a.sell, a.mgrs], [400, 500, 100, 0]);
  assert.deepEqual(a.parts.map(p => p.k), ['new', 'trim']);
  assert.deepEqual(rankFlows(agg, 'net', 2).map(x => x.key), ['AAA', 'BBB']);   // top 2 by |net|, positives first
  assert.deepEqual(rankFlows(agg, 'sell', 5).map(x => x.key), ['BBB', 'AAA']);
  assert.deepEqual(rankFlows(agg, 'mgrs', 5).map(x => x.key), ['CCC', 'BBB']);  // AAA nets to 0 managers
});

test('fromRows and filterClusters', () => {
  assert.deepEqual(fromRows(['f', 'v'], [['2026-01-02', 5], ['2026-01-03', null]]), [{ f: '2026-01-02', v: 5 }, { f: '2026-01-03', v: null }]);
  const cl = [{ id: 'a', cap: 'small', k: 3, linked: false }, { id: 'b', cap: 'large', k: 5, linked: true }, { id: 'c', cap: null, k: 4, linked: true }];
  assert.deepEqual(filterClusters(cl).map(c => c.id), ['a', 'b', 'c']);
  assert.deepEqual(filterClusters(cl, { cap: 'large' }).map(c => c.id), ['b']);
  assert.deepEqual(filterClusters(cl, { minK: 4 }).map(c => c.id), ['b', 'c']);
  assert.deepEqual(filterClusters(cl, { linkedOnly: true, minK: 5 }).map(c => c.id), ['b']);
});

test('filterPlayers and groupPlayers', () => {
  const ps = [{ g: 'fund', id: '1', name: 'Berkshire', sub: 'Buffett', style: ['价值', '长期持有'], ex3: 0.02, n3: 10 },
              { g: 'congress', id: 'P1', name: 'Nancy Pelosi', sub: 'CA11', party: 'Democrat', ex3: -0.01, n3: 30 },
              { g: 'congress', id: 'T1', name: 'Tommy Tuberville', sub: 'AL', party: 'Republican', ex3: null, n3: 0 }];
  assert.deepEqual(filterPlayers(ps, { g: 'congress' }).map(p => p.id), ['P1', 'T1']);
  assert.deepEqual(filterPlayers(ps, { q: 'buff' }).map(p => p.id), ['1']);
  const byG = groupPlayers(ps, 'g');
  assert.deepEqual(byG.map(x => [x.key, x.rows.length]), [['congress', 2], ['fund', 1]]);
  assert.equal(byG[0].ex3, -0.01);                       // T1 has no measured buys
  assert.deepEqual(groupPlayers(ps, 'style').map(x => x.key).slice(0, 2), ['价值', '长期持有']);
});

test('titleCase for SEC company names', () => {
  assert.equal(titleCase('COCA-COLA CO/THE'), 'Coca-Cola Co');
  assert.equal(titleCase('SPDR S&P 500 ETF TRUST'), 'SPDR S&P 500 ETF Trust');
  assert.equal(titleCase('NVIDIA Corporation'), 'NVIDIA Corporation');   // mixed case left alone
  assert.equal(titleCase(null), '');
});
