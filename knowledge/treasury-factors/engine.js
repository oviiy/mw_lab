/* Numerical engine: PCA, rolling/local loadings, and the Su & Wang (2017) J test.
 * Written as a factory so the same source can be re-instantiated inside a Web Worker
 * (see app code: `(${YCEngineFactory})()` in a Blob). No dependencies.
 *
 * Su–Wang implementation follows tool/su_wang_monthly.py in the thesis repo line for line
 * (Epanechnikov kernel with boundary-mass correction, feasible J, Gaussian covariance
 * bootstrap with 0.99^|i-j| shrinkage) and is unit-tested against its outputs.
 */
function YCEngineFactory() {
  'use strict';

  // ---------- small linear algebra ----------
  const zeros = (r, c) => Array.from({ length: r }, () => new Float64Array(c));

  /** Symmetric eigendecomposition (cyclic Jacobi). Returns values desc, vectors as columns. */
  function symEig(Ain) {
    const n = Ain.length;
    const A = Ain.map(r => Float64Array.from(r));
    const V = zeros(n, n);
    for (let i = 0; i < n; i++) V[i][i] = 1;
    for (let sweep = 0; sweep < 100; sweep++) {
      let off = 0;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] * A[p][q];
      if (off < 1e-26) break;
      for (let p = 0; p < n - 1; p++) {
        for (let q = p + 1; q < n; q++) {
          const apq = A[p][q];
          if (Math.abs(apq) < 1e-300) continue;
          const theta = (A[q][q] - A[p][p]) / (2 * apq);
          const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
          const c = 1 / Math.sqrt(t * t + 1), s = t * c;
          for (let k = 0; k < n; k++) {
            const akp = A[k][p], akq = A[k][q];
            A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq;
          }
          for (let k = 0; k < n; k++) {
            const apk = A[p][k], aqk = A[q][k];
            A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk;
          }
          for (let k = 0; k < n; k++) {
            const vkp = V[k][p], vkq = V[k][q];
            V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq;
          }
        }
      }
    }
    const order = [...Array(n).keys()].sort((a, b) => A[b][b] - A[a][a]);
    return {
      values: order.map(i => A[i][i]),
      vectors: Array.from({ length: n }, (_, r) => order.map(i => V[r][i])),
    };
  }

  function standardize(Y) {
    const T = Y.length, N = Y[0].length;
    const mean = new Array(N).fill(0), sd = new Array(N).fill(0);
    for (const r of Y) for (let i = 0; i < N; i++) mean[i] += r[i] / T;
    for (const r of Y) for (let i = 0; i < N; i++) sd[i] += (r[i] - mean[i]) ** 2 / (T - 1);
    for (let i = 0; i < N; i++) sd[i] = Math.sqrt(sd[i]);
    return { Z: Y.map(r => r.map((v, i) => (v - mean[i]) / sd[i])), mean, sd };
  }

  function demean(Y) {
    const T = Y.length, N = Y[0].length;
    const mean = new Array(N).fill(0);
    for (const r of Y) for (let i = 0; i < N; i++) mean[i] += r[i] / T;
    return { Z: Y.map(r => r.map((v, i) => v - mean[i])), mean };
  }

  function covariance(Z) {
    const T = Z.length, N = Z[0].length;
    const C = zeros(N, N);
    for (const r of Z) for (let i = 0; i < N; i++) { const ri = r[i]; for (let j = i; j < N; j++) C[i][j] += ri * r[j]; }
    for (let i = 0; i < N; i++) for (let j = i; j < N; j++) { C[i][j] /= T; C[j][i] = C[i][j]; }
    return C;
  }

  /** Conventional signs: level positive on average, slope rising with maturity, curvature humped. */
  function conventionalSigns(V, R) {
    const N = V.length;
    const out = V.map(r => r.slice(0, R));
    for (let k = 0; k < R; k++) {
      let s;
      if (k === 0) s = out.reduce((a, r) => a + r[0], 0);
      else if (k === 1) s = out[N - 1][1] - out[0][1];
      else if (k === 2) { const m = Math.floor(N / 2); s = 2 * out[m][2] - out[0][2] - out[N - 1][2]; }
      else s = out[0][k];
      if (s < 0) for (const r of out) r[k] = -r[k];
    }
    return out;
  }

  /** Static PCA. mode: 'standardize' | 'demean'. Loadings are unit eigenvectors (N×R). */
  function pca(Y, R, mode = 'standardize') {
    const { Z } = mode === 'standardize' ? standardize(Y) : demean(Y);
    const { values, vectors } = symEig(covariance(Z));
    const total = values.reduce((a, b) => a + Math.max(b, 0), 0);
    const L = conventionalSigns(vectors, R);
    const factors = Z.map(r => L[0].map((_, k) => r.reduce((a, v, i) => a + v * L[i][k], 0)));
    return { loadings: L, values, share: values.map(v => Math.max(v, 0) / total), factors, Z };
  }

  /** Orthonormal basis (modified Gram-Schmidt) of the columns of A (N×R). */
  function orthonormal(A) {
    const N = A.length, R = A[0].length;
    const Q = A.map(r => Float64Array.from(r));
    for (let k = 0; k < R; k++) {
      for (let j = 0; j < k; j++) {
        let d = 0; for (let i = 0; i < N; i++) d += Q[i][k] * Q[i][j];
        for (let i = 0; i < N; i++) Q[i][k] -= d * Q[i][j];
      }
      let nrm = 0; for (let i = 0; i < N; i++) nrm += Q[i][k] ** 2;
      nrm = Math.sqrt(nrm) || 1;
      for (let i = 0; i < N; i++) Q[i][k] /= nrm;
    }
    return Q;
  }

  /** Principal angles (degrees, ascending) between span(A) and span(B), both N×R. */
  function principalAnglesDeg(A, B) {
    const Qa = orthonormal(A), Qb = orthonormal(B);
    const R = Qa[0].length, S = Qb[0].length, N = Qa.length;
    const M = zeros(R, S);
    for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { let d = 0; for (let n = 0; n < N; n++) d += Qa[n][i] * Qb[n][j]; M[i][j] = d; }
    const MMt = zeros(R, R);
    for (let i = 0; i < R; i++) for (let j = 0; j < R; j++) { let d = 0; for (let k = 0; k < S; k++) d += M[i][k] * M[j][k]; MMt[i][j] = d; }
    const { values } = symEig(MMt);
    return values.map(v => Math.acos(Math.min(1, Math.sqrt(Math.max(v, 0)))) * 180 / Math.PI).sort((a, b) => a - b);
  }

  /** Rolling-window PCA. Signs aligned window-to-window; angles vs the full-sample subspace. */
  function rollingPCA(Y, window, R, mode = 'standardize') {
    const full = pca(Y, R, mode).loadings;
    const ends = [], loadings = [], shares = [], angles = [];
    let prev = full;
    for (let e = window - 1; e < Y.length; e++) {
      const p = pca(Y.slice(e - window + 1, e + 1), R, mode);
      const L = p.loadings;
      for (let k = 0; k < R; k++) {
        let d = 0; for (let i = 0; i < L.length; i++) d += L[i][k] * prev[i][k];
        if (d < 0) for (const r of L) r[k] = -r[k];
      }
      prev = L;
      ends.push(e); loadings.push(L); shares.push(p.share.slice(0, R));
      angles.push(principalAnglesDeg(L, full));
    }
    return { ends, loadings, shares, angles, full };
  }

  // ---------- Su & Wang (2017) ----------
  const P = z => 0.75 * (z - z * z * z / 3);

  /** Kernel weights K[s*T+t] (row s, evaluation t) and the convolution kernel. */
  function kernel(T, N, hIn) {
    const h = hIn ?? (2.35 / Math.sqrt(12)) * T ** -0.2 * N ** -0.1;
    const K = new Float64Array(T * T), C = new Float64Array(T * T);
    const Th = T * h, fTh = Math.floor(Th);
    const mass = new Float64Array(T);
    for (let t = 1; t <= T; t++) {
      if (t < fTh) mass[t - 1] = P(1) - P(-t / Th);
      else if (t > T - fTh) mass[t - 1] = P((1 - t / T) / h) - P(-1);
      else mass[t - 1] = 1;
    }
    for (let s = 0; s < T; s++) for (let t = 0; t < T; t++) {
      const u = (s - t) / Th;
      K[s * T + t] = (0.75 * Math.max(1 - u * u, 0) / h) / mass[t];
      const v = Math.abs(u);
      C[s * T + t] = v <= 2 ? 0.6 - 0.75 * v * v + 0.375 * v ** 3 - (3 / 160) * v ** 5 : 0;
    }
    return { h, K, C, T, N, bandwidthMonths: Th };
  }

  function signFirstRow(V, R) {
    const out = V.map(r => r.slice(0, R));
    for (let k = 0; k < R; k++) if (out[0][k] < 0) for (const r of out) r[k] = -r[k];
    return out;
  }

  function suWangFit(X, R, Kobj) {
    const T = X.length, N = X[0].length, { K } = Kobj;
    // static: eigenvectors of X'X (= right singular vectors)
    const XtX = zeros(N, N);
    for (const r of X) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) XtX[i][j] += r[i] * r[j];
    const se = symEig(XtX);
    const V0 = signFirstRow(se.vectors, R);
    const sv = se.values.slice(0, R).map(v => Math.sqrt(Math.max(v, 0)) / Math.sqrt(T));
    const fixedFactors = X.map(r => V0[0].map((_, k) => r.reduce((a, v, i) => a + v * V0[i][k], 0) / sv[k]));
    const fixedCommon = fixedFactors.map(f => V0.map((row, i) => row.reduce((a, v, k) => a + v * sv[k] * f[k], 0)));

    // local: kernel-weighted second moments at each t
    const NN = N * N, outer = new Float64Array(T * NN);
    for (let s = 0; s < T; s++) { const r = X[s]; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) outer[s * NN + i * N + j] = r[i] * r[j]; }
    const factors = [], common = [], loadings = [], eig = [];
    const cov = new Float64Array(NN);
    for (let t = 0; t < T; t++) {
      cov.fill(0);
      for (let s = 0; s < T; s++) {
        const w = K[s * T + t];
        if (w === 0) continue;
        const o = s * NN;
        for (let q = 0; q < NN; q++) cov[q] += w * outer[o + q];
      }
      const M = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => cov[i * N + j] / T));
      const { values, vectors } = symEig(M);
      const vals = values.slice(0, R);
      if (Math.min(...vals) <= 1e-14) throw new Error('Degenerate local eigenvalue; J cannot be evaluated');
      const V = signFirstRow(vectors, R);
      const x = X[t];
      const f = vals.map((lam, k) => x.reduce((a, v, i) => a + v * V[i][k], 0) / Math.sqrt(lam));
      factors.push(f);
      loadings.push(V.map(row => row.map((v, k) => v * Math.sqrt(vals[k]))));
      common.push(V.map(row => row.reduce((a, v, k) => a + v * Math.sqrt(vals[k]) * f[k], 0)));
      eig.push(vals);
    }
    return { fixedFactors, fixedCommon, fixedLoadings: V0.map(r => r.map((v, k) => v * sv[k])), factors, common, loadings, eig };
  }

  function suWangStat(X, fit, Kobj) {
    const T = X.length, N = X[0].length, { K, C, h } = Kobj;
    const { factors: F, fixedFactors: F0, common } = fit;
    const R = F[0].length;
    let M = 0;
    for (let t = 0; t < T; t++) for (let i = 0; i < N; i++) M += (common[t][i] - fit.fixedCommon[t][i]) ** 2;
    M /= T * N;
    const E = X.map((r, t) => r.map((v, i) => v - common[t][i]));
    const ee = E.map(r => r.reduce((a, v) => a + v * v, 0));
    const dot = (a, b) => { let d = 0; for (let k = 0; k < a.length; k++) d += a[k] * b[k]; return d; };
    // Sigma_F = F'F/T
    const S = zeros(R, R);
    for (const f of F) for (let a = 0; a < R; a++) for (let b = 0; b < R; b++) S[a][b] += f[a] * f[b] / T;
    const FS = F.map(f => Array.from({ length: R }, (_, b) => { let d = 0; for (let a = 0; a < R; a++) d += f[a] * S[a][b]; return d; }));
    let bias = 0, varSum = 0;
    for (let i = 0; i < T; i++) {
      for (let j = 0; j < T; j++) {
        const inner = K[i * T + j] * dot(F[i], F[j]) - dot(F0[i], F0[j]);
        bias += inner * inner * ee[i];
        if (i !== j) {
          const c = C[i * T + j];
          if (c !== 0) { const q = dot(FS[i], F[j]), e = dot(E[i], E[j]); varSum += c * c * q * q * e * e; }
        }
      }
    }
    bias *= Math.sqrt(h) / (T * T * Math.sqrt(N));
    const variance = 2 * varSum / (T * T * N * h);
    if (!(variance > 0) || !Number.isFinite(variance)) throw new Error('Non-positive studentizing variance');
    const J = (T * Math.sqrt(N * h) * M - bias) / Math.sqrt(variance);
    return { M, bias, variance, J };
  }

  // seeded RNG (mulberry32) + Box–Muller
  function rng(seed) {
    let a = seed >>> 0, spare = null;
    const u = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    return () => {
      if (spare !== null) { const s = spare; spare = null; return s; }
      let x; do { x = u(); } while (x <= 1e-300);
      const r = Math.sqrt(-2 * Math.log(x)), th = 2 * Math.PI * u();
      spare = r * Math.sin(th); return r * Math.cos(th);
    };
  }

  /** Observed J plus a Gaussian covariance bootstrap of its null distribution (Section 4.6). */
  function suWangBootstrap(X, R, { reps = 199, seed = 2017, h, onProgress } = {}) {
    const T = X.length, N = X[0].length;
    const Kobj = kernel(T, N, h);
    const fit = suWangFit(X, R, Kobj);
    const obs = suWangStat(X, fit, Kobj);
    const e0 = X.map((r, t) => r.map((v, i) => v - fit.fixedCommon[t][i]));
    const Sig = covariance(e0).map((row, i) => row.map((v, j) => v * 0.99 ** Math.abs(i - j)));
    const { values, vectors } = symEig(Sig);
    const root = vectors.map(row => row.map((v, k) => v * Math.sqrt(Math.max(values[k], 0))));
    const g = rng(seed), draws = [];
    for (let b = 0; b < reps; b++) {
      const Xb = fit.fixedCommon.map(row => {
        const z = Array.from({ length: N }, g);
        return row.map((v, i) => v + root[i].reduce((a, r, k) => a + r * z[k], 0));
      });
      try { draws.push(suWangStat(Xb, suWangFit(Xb, R, Kobj), Kobj).J); }
      catch (err) { draws.push(NaN); }
      if (onProgress) onProgress(b + 1, reps);
    }
    const valid = draws.filter(Number.isFinite);
    const exceed = valid.filter(d => d >= obs.J).length;
    const sorted = [...valid].sort((a, b) => a - b);
    const q = p => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
    return {
      ...obs, R, T, N, h: Kobj.h, bandwidthMonths: Kobj.bandwidthMonths, reps, seed, draws,
      exceedances: exceed, p: (exceed + 1) / (valid.length + 1),
      critical_90: q(0.9), critical_95: q(0.95), critical_99: q(0.99),
      fit,
    };
  }

  return {
    symEig, standardize, demean, covariance, pca, orthonormal, principalAnglesDeg, rollingPCA,
    kernel, suWangFit, suWangStat, suWangBootstrap, rng, conventionalSigns,
  };
}

(function (root) {
  const api = YCEngineFactory();
  if (root) root.YCEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : this));
