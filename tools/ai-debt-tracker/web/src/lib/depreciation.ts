/**
 * Browser port of pipeline/aidebt/assets.py depreciation functions, so the slider can
 * recompute the depreciation wave. Kept line-for-line equivalent; both sides are tested
 * on the same cases.
 */

/** Depreciation in fiscal `year` of an asset bought mid-way through fiscal `vintage`
 *  (half-year convention), written off straight-line over `life` years. */
export function straightLine(amount: number, life: number, vintage: number, year: number): number {
  const start = vintage + 0.5;
  const end = vintage + 0.5 + life;
  const overlap = Math.max(0, Math.min(end, year + 1) - Math.max(start, year));
  return (amount / life) * overlap;
}

export interface WaveYear {
  fy: number;
  server: number;
  other: number;
  total: number;
}

export function depreciationWave(
  vintages: { fy: number; capex: number }[],
  lifeOf: (fy: number) => number,
  serverShare: number,
  otherLife: number,
  years: number[],
): WaveYear[] {
  return years.map((y) => {
    let server = 0;
    let other = 0;
    for (const v of vintages) {
      if (v.fy > y) continue;
      server += straightLine(v.capex * serverShare, lifeOf(v.fy), v.fy, y);
      other += straightLine(v.capex * (1 - serverShare), otherLife, v.fy, y);
    }
    return { fy: y, server, other, total: server + other };
  });
}
