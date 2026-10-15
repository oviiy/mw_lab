import { describe, expect, it } from "vitest";
import { date, local, pct, share, usd, usdWords, years } from "./format";

describe("format", () => {
  it("compacts dollars", () => {
    expect(usd(383_314_772_581)).toBe("$383.3B");
    expect(usd(950_000_000)).toBe("$950M");
    expect(usd(1.2e12)).toBe("$1.2T");
  });
  it("writes dollars for headlines", () => {
    expect(usdWords(383_314_772_581)).toBe("$383 billion");
  });
  it("shows local currency", () => {
    expect(local(1_000_000_000, "GBP")).toBe("£1B");
    expect(local(1_250_000_000, "EUR")).toBe("€1.25B");
    expect(local(576_500_000_000, "JPY")).toBe("¥576.5B");
  });
  it("formats rates, shares, dates and terms", () => {
    expect(pct(4.875)).toBe("4.875%");
    expect(pct(null)).toBe("—");
    expect(share(0.7264)).toBe("73%");
    expect(date("2026-02-10")).toBe("Feb 10, 2026");
    expect(years(5.5)).toBe("5.5 years");
    expect(years(100.01)).toBe("100 years");
  });
});
