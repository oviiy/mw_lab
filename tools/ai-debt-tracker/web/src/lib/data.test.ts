/** Invariants the story relies on. If the data breaks one, the build should fail loudly. */
import { describe, expect, it } from "vitest";
import { bonds, deals, facts, headline, issuers, metrics } from "./data";

describe("dataset invariants", () => {
  it("headline excludes revolvers and matches metrics", () => {
    expect(headline.every((b) => b.instrument_type !== "revolver")).toBe(true);
    const sum = headline.reduce((s, b) => s + b.amount_usd, 0);
    expect(Math.abs(sum - metrics.headline_usd)).toBeLessThan(1);
  });

  it("every bond is traceable to an SEC filing", () => {
    for (const b of bonds) expect(b.source_url).toMatch(/^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\//);
  });

  it("every bond has a positive amount and matures after it was priced", () => {
    for (const b of bonds) {
      expect(b.amount_usd).toBeGreaterThan(0);
      expect(b.maturity_date > b.trade_date).toBe(true);
    }
  });

  it("deals partition the headline bonds", () => {
    const ds = deals();
    expect(ds.reduce((s, d) => s + d.n, 0)).toBe(headline.length);
    expect(ds.length).toBe(metrics.n_deals);
  });

  it("every borrowing issuer has a sourced server life", () => {
    for (const id of new Set(headline.map((b) => b.issuer_id))) {
      const i = issuers.find((x) => x.id === id)!;
      expect(i.useful_life?.years).toBeGreaterThan(0);
      expect(i.useful_life?.source_url).toMatch(/sec\.gov/);
    }
  });

  it("facts used in prose are present", () => {
    const f = facts();
    expect(f.biggest.amount_usd).toBeGreaterThan(0);
    expect(f.longest.tenor_years).toBeGreaterThan(40);
    expect(f.outliving).toBeGreaterThan(0);
    expect(f.outliving).toBeLessThan(1);
  });
});
