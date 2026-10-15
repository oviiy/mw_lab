// Same cases as pipeline/tests/test_assets.py, so the browser and pipeline models agree.
import { describe, expect, it } from "vitest";
import { metrics } from "./data";
import { depreciationWave, straightLine } from "./depreciation";

describe("straightLine", () => {
  it("uses a half-year convention and sums to the amount", () => {
    let total = 0;
    for (let y = 2020; y < 2040; y++) total += straightLine(600, 6, 2024, y);
    expect(total).toBeCloseTo(600, 9);
    expect(straightLine(600, 6, 2024, 2024)).toBeCloseTo(50);
    expect(straightLine(600, 6, 2024, 2025)).toBeCloseTo(100);
    expect(straightLine(600, 6, 2024, 2030)).toBeCloseTo(50);
    expect(straightLine(600, 6, 2024, 2031)).toBe(0);
  });
});

describe("depreciationWave", () => {
  it("matches the pipeline's worked example", () => {
    const out = depreciationWave([{ fy: 2024, capex: 100 }, { fy: 2025, capex: 200 }], () => 5, 0.5, 20, [2025, 2026]);
    expect(out[0].server).toBeCloseTo(20);
    expect(out[1].server).toBeCloseTo(30);
    expect(out[1].other).toBeCloseTo(50 / 20 + 100 / 20);
  });

  it("reproduces the published wave for every issuer at the disclosed lives", () => {
    const w = metrics.depreciation_wave;
    for (const [id, iss] of Object.entries(w.issuers)) {
      const life = new Map(iss.vintages.map((v) => [v.fy, v.server_life]));
      const out = depreciationWave(iss.vintages, (fy) => life.get(fy)!, iss.server_share, iss.other_life,
        iss.years.map((y) => y.fy));
      out.forEach((r, i) => expect(r.total, id).toBeCloseTo(iss.years[i].total, 0));
    }
  });
});
