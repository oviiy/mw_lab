// Merton structural credit model, solved in the browser for the stress-test interactive.
// Mirrors analysis/build.py: solve E = V N(d1) − F e^{−rT} N(d2) and σE E = N(d1) σV V for (V, σV)
// at a 1-year horizon, then read a T-year risk-neutral default probability and the spread it implies.
const Merton = (() => {
  // Abramowitz–Stegun 7.1.26 erf; |error| < 1.5e-7, ample for spreads in bp.
  function ncdf(x) {
    const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x / 2);
    return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
  }
  function residual(lv, ls, E, F, sE, r) {
    const V = Math.exp(lv), s = Math.exp(ls);
    const d1 = (Math.log(V / F) + (r + 0.5 * s * s)) / s, d2 = d1 - s;
    return [(V * ncdf(d1) - F * Math.exp(-r) * ncdf(d2)) / E - 1, ncdf(d1) * s * V / (sE * E) - 1];
  }
  // Damped Newton on (log V, log σV) with a numerical Jacobian.
  function solve(E, F, sE, r) {
    let x = [Math.log(E + F), Math.log(Math.max(sE * E / (E + F), 0.02))];
    for (let it = 0; it < 80; it++) {
      const f = residual(x[0], x[1], E, F, sE, r);
      if (Math.abs(f[0]) + Math.abs(f[1]) < 1e-10) break;
      const h = 1e-6, J = [[0, 0], [0, 0]];
      for (let j = 0; j < 2; j++) {
        const xp = x.slice(); xp[j] += h;
        const fp = residual(xp[0], xp[1], E, F, sE, r);
        J[0][j] = (fp[0] - f[0]) / h; J[1][j] = (fp[1] - f[1]) / h;
      }
      const det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
      if (!isFinite(det) || Math.abs(det) < 1e-14) break;
      let dx = [(f[0] * J[1][1] - f[1] * J[0][1]) / det, (J[0][0] * f[1] - J[1][0] * f[0]) / det];
      const step = Math.max(Math.abs(dx[0]), Math.abs(dx[1]));
      if (step > 0.5) dx = dx.map(v => v * 0.5 / step);
      x = [x[0] - dx[0], x[1] - dx[1]];
    }
    return {V: Math.exp(x[0]), sV: Math.exp(x[1])};
  }
  function spread(E, F, sE, r1, r5, T = 5, lgd = 0.6) {
    if (F <= 0) return {spread: 0, pd: 0};
    const {V, sV} = solve(E, F, sE, r1);
    const dd = (Math.log(V / F) + (r5 - 0.5 * sV * sV) * T) / (sV * Math.sqrt(T));
    const pd = ncdf(-dd);
    return {spread: -Math.log(1 - pd * lgd) / T * 1e4, pd, V, sV};
  }
  // Scenario version: hold asset volatility sV fixed (calibrated today) and find the asset value V
  // consistent with a new equity value E. Equity is increasing in V, so bisection on log V is safe.
  // Holding equity volatility fixed instead would make a falling share price lower the implied asset
  // volatility, and the spread could fall as the stock falls.
  function spreadAtAssetVol(E, F, sV, r1, r5, T = 5, lgd = 0.6) {
    if (F <= 0) return {spread: 0, pd: 0};
    const eq = V => { const d1 = (Math.log(V / F) + (r1 + 0.5 * sV * sV)) / sV; return V * ncdf(d1) - F * Math.exp(-r1) * ncdf(d1 - sV); };
    let lo = Math.log(Math.max(E, 1)), hi = Math.log(E + F * 2);
    for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (eq(Math.exp(mid)) > E) hi = mid; else lo = mid; }
    const V = Math.exp((lo + hi) / 2);
    const dd = (Math.log(V / F) + (r5 - 0.5 * sV * sV) * T) / (sV * Math.sqrt(T));
    const pd = ncdf(-dd);
    return {spread: -Math.log(1 - pd * lgd) / T * 1e4, pd, V, sV};
  }
  function solveAssets(E, F, sE, r1) { return solve(E, F, sE, r1); }
  return {spread, spreadAtAssetVol, solveAssets, ncdf};
})();
if (typeof module !== "undefined") module.exports = Merton;
