// Run: node --test engine.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {}, self: undefined, console };
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL('./engine.js', import.meta.url), 'utf8'), ctx);
vm.runInContext(readFileSync(new URL('./data.js', import.meta.url), 'utf8'), ctx);
const E = ctx.window.YCEngine;
const D = ctx.window.YC_DATA;

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test('symEig recovers a known decomposition', () => {
  const A = [[4, 1, 0.5], [1, 3, 0.2], [0.5, 0.2, 2]];
  const { values, vectors } = E.symEig(A);
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 3; i++) {
      let Av = 0;
      for (let j = 0; j < 3; j++) Av += A[i][j] * vectors[j][k];
      close(Av, values[k] * vectors[i][k], 1e-10, `Av=λv k=${k} i=${i}`);
    }
  }
  assert.ok(values[0] >= values[1] && values[1] >= values[2]);
});

test('principal angles: identical subspaces → 0, orthogonal → 90°', () => {
  const A = [[1, 0], [0, 1], [0, 0]];
  const B = [[0, 1], [1, 0], [0, 0]];
  const C = [[0], [0], [1]];
  close(Math.max(...E.principalAnglesDeg(A, B)), 0, 1e-8, 'same span');
  close(E.principalAnglesDeg([[1], [0], [0]], C)[0], 90, 1e-8, 'orthogonal');
});

test('Su–Wang J reproduces the thesis Python results on the GSW+FRED panel', () => {
  const ds = D.datasets.find(d => d.id === 'gsw');
  const X = E.standardize(ds.yields).Z;
  const expected = Object.fromEntries(D.thesis.tests.map(t => [t.R, t]));
  const K = E.kernel(X.length, X[0].length);
  close(K.h, D.thesis.sample.h, 1e-12, 'bandwidth h');
  for (const R of [3, 4, 5]) {
    const fit = E.suWangFit(X, R, K);
    const s = E.suWangStat(X, fit, K);
    close(s.M, expected[R].M, 1e-9 * Math.max(1, expected[R].M) + 1e-12, `M R=${R}`);
    close(s.J, expected[R].J, 1e-6 * Math.abs(expected[R].J), `J R=${R}`);
  }
});

test('bootstrap is reproducible from the seed and gives a sane null', () => {
  const ds = D.datasets.find(d => d.id === 'gsw');
  const X = E.standardize(ds.yields.slice(0, 120)).Z;
  const a = E.suWangBootstrap(X, 3, { reps: 5, seed: 7 });
  const b = E.suWangBootstrap(X, 3, { reps: 5, seed: 7 });
  assert.deepEqual(a.draws, b.draws);
  assert.ok(a.draws.every(Number.isFinite));
  assert.ok(a.p > 0 && a.p <= 1);
});

test('rolling PCA returns sign-aligned loadings and angles for every window end', () => {
  const ds = D.datasets.find(d => d.id === 'treasury');
  const Y = ds.yields.map(r => ds.core.map(i => r[i]));
  const out = E.rollingPCA(Y, 60, 3);
  assert.equal(out.ends.length, Y.length - 60 + 1);
  assert.equal(out.loadings[0].length, ds.core.length);
  assert.ok(out.angles.every(a => a.length === 3 && a.every(v => v >= 0 && v <= 90.0001)));
  // level factor keeps a positive overall sign in every window (individual short-end
  // loadings can legitimately turn negative at the zero lower bound)
  assert.ok(out.loadings.every(L => L.reduce((a, row) => a + row[0], 0) > 0));
  // and is uniformly positive in a normal-policy window (1990s)
  const i95 = out.ends.findIndex(e => ds.dates[e].startsWith('1995-12'));
  assert.ok(out.loadings[i95].every(row => row[0] > 0));
});
