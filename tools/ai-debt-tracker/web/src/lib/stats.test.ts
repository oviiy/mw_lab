import { describe, expect, it } from "vitest";
import { curveSample, fitCurve } from "./stats";

describe("fitCurve", () => {
  it("recovers an exact log-linear curve", () => {
    const pts = [2, 5, 10, 30].map((t) => ({ tenor_years: t, spread_bp: 40 + 20 * Math.log(t) }));
    const f = fitCurve(pts)!;
    expect(f.b).toBeCloseTo(20, 6);
    expect(f.at10).toBeCloseTo(40 + 20 * Math.log(10), 6);
    expect(f.r2).toBeCloseTo(1, 9);
  });
  it("refuses to fit fewer than three bonds", () => {
    expect(fitCurve([{ tenor_years: 5, spread_bp: 60 }, { tenor_years: 10, spread_bp: 80 }])).toBeNull();
  });
  it("samples only USD fixed-rate bonds with a spread", () => {
    const base = { currency: "USD", spread_bp: 50, coupon_pct: 5, tenor_years: 10 };
    const s = curveSample([base, { ...base, currency: "EUR" }, { ...base, coupon_pct: null }, { ...base, spread_bp: null }]);
    expect(s).toHaveLength(1);
  });
});
