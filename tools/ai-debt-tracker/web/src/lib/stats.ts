/** Small statistics helpers shared by charts and build-time copy. */

export interface CurveFit {
  a: number;
  b: number;
  r2: number;
  n: number;
  /** fitted spread at 10 years */
  at10: number;
}

/** OLS of spread (bp) on ln(years to maturity): an issuer's new-issue credit curve. */
export function fitCurve(pts: { tenor_years: number; spread_bp: number | null }[]): CurveFit | null {
  const ok = pts.filter((p) => p.spread_bp != null && p.tenor_years > 0);
  if (ok.length < 3) return null;
  const xs = ok.map((p) => Math.log(p.tenor_years));
  const ys = ok.map((p) => p.spread_bp as number);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const sxx = xs.reduce((s, v) => s + (v - mx) ** 2, 0);
  if (sxx === 0) return null;
  const b = xs.reduce((s, v, i) => s + (v - mx) * (ys[i] - my), 0) / sxx;
  const a = my - b * mx;
  const ssr = ys.reduce((s, v, i) => s + (v - (a + b * xs[i])) ** 2, 0);
  const sst = ys.reduce((s, v) => s + (v - my) ** 2, 0);
  return { a, b, r2: sst ? 1 - ssr / sst : 1, n: ok.length, at10: a + b * Math.log(10) };
}

/** The bonds a credit curve is fitted on: USD, fixed-rate, with a stated spread. */
export function curveSample<T extends { currency: string; spread_bp: number | null; coupon_pct: number | null; tenor_years: number }>(bonds: T[]) {
  return bonds.filter((b) => b.currency === "USD" && b.spread_bp != null && b.coupon_pct != null && b.tenor_years >= 1.5);
}
