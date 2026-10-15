/**
 * Build-time access to the published dataset (../data/public). Astro pages call
 * these helpers and pass plain, already-trimmed objects to the React islands.
 */
import bondsFile from "../../../data/public/bonds.json";
import issuersFile from "../../../data/public/issuers.json";
import metricsFile from "../../../data/public/metrics.json";
import offFile from "../../../data/public/offbalance.json";
import commitmentsFile from "../../../data/public/commitments.json";
import segmentsFile from "../../../data/public/segments.json";
import { curveSample, fitCurve } from "./stats";
import type { Bond, Commitment, Issuer, Metrics, OffBalance } from "./types";

export const bonds = bondsFile.bonds as unknown as Bond[];
export const issuers = issuersFile.issuers as unknown as Issuer[];
export const metrics = metricsFile as unknown as Metrics;
export const offBalance = offFile.items as unknown as OffBalance[];
export const commitments = commitmentsFile.items as unknown as Commitment[];
/** How each issuer's cloud revenue is measured (label shown on the growth chart). */
export const segmentLabels: Record<string, { kind: string; label: string }> = Object.fromEntries(
  Object.entries(segmentsFile.issuers as Record<string, { kind: string; label: string }>).map(([k, v]) => [k, { kind: v.kind, label: v.label }]),
);
export const datasetVersion = metrics.meta.dataset_version;

/** Bonds that count toward the headline (excludes undrawn revolvers). */
export const headline = bonds.filter((b) => b.in_headline);

export const issuerById: Record<string, Issuer> = Object.fromEntries(issuers.map((i) => [i.id, i]));
export const colors: Record<string, string> = Object.fromEntries(issuers.map((i) => [i.id, i.color]));

/** Fields the charts need; everything else stays in the downloadable files. */
export type SlimBond = Pick<
  Bond,
  | "id" | "issuer_id" | "name" | "instrument_type" | "trade_date" | "maturity_date" | "tenor_years"
  | "currency" | "amount" | "amount_usd" | "coupon_pct" | "floating_spread_bp" | "spread_bp"
  | "index_oas_bp" | "ai_flag" | "source_url" | "cusip"
>;

export function slim(b: Bond): SlimBond {
  const { id, issuer_id, name, instrument_type, trade_date, maturity_date, tenor_years, currency, amount,
    amount_usd, coupon_pct, floating_spread_bp, spread_bp, index_oas_bp, ai_flag, source_url, cusip } = b;
  return { id, issuer_id, name, instrument_type, trade_date, maturity_date, tenor_years, currency, amount,
    amount_usd, coupon_pct, floating_spread_bp, spread_bp, index_oas_bp, ai_flag, source_url, cusip };
}

export interface IssuerMeta {
  id: string;
  name: string;
  color: string;
  life: number;
}

export const issuerMeta: IssuerMeta[] = issuers.map((i) => ({
  id: i.id,
  name: i.name,
  color: i.color,
  life: i.useful_life?.years ?? 6,
}));

export interface Deal {
  key: string;
  issuer_id: string;
  date: string;
  amount_usd: number;
  currencies: string[];
  n: number;
  types: string[];
  source_url: string;
  longest: string;
}

/** Tranches priced by the same issuer on the same day form one deal. */
export function deals(list: Bond[] = headline): Deal[] {
  const map = new Map<string, Deal>();
  for (const b of list) {
    const key = `${b.issuer_id}|${b.trade_date}`;
    const d =
      map.get(key) ??
      { key, issuer_id: b.issuer_id, date: b.trade_date, amount_usd: 0, currencies: [], n: 0, types: [],
        source_url: b.source_url, longest: b.maturity_date };
    d.amount_usd += b.amount_usd;
    d.n += 1;
    if (!d.currencies.includes(b.currency)) d.currencies.push(b.currency);
    if (!d.types.includes(b.instrument_type)) d.types.push(b.instrument_type);
    if (b.maturity_date > d.longest) d.longest = b.maturity_date;
    map.set(key, d);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export interface FundingRow {
  issuer_id: string;
  year: string;
  capex: number;
  ocf: number;
  debt: number | null;
}

/** Capex vs operating cash flow by fiscal year, for issuers with both series. */
export function funding(): FundingRow[] {
  const rows: FundingRow[] = [];
  for (const i of issuers) {
    const f = i.fundamentals;
    for (const y of Object.keys(f.capex ?? {}).sort()) {
      if (+y < 2022 || f.operating_cash_flow?.[y] == null) continue;
      rows.push({ issuer_id: i.id, year: y, capex: f.capex[y], ocf: f.operating_cash_flow[y],
        debt: f.total_debt?.[y] ?? null });
    }
  }
  return rows;
}

/** Facts the prose quotes. Computed, never typed by hand, so copy stays true to the data. */
export function facts() {
  const ds = deals();
  const biggest = [...ds].sort((a, b) => b.amount_usd - a.amount_usd)[0];
  const longest = [...headline].sort((a, b) => b.tenor_years - a.tenor_years)[0];
  const byYear: Record<string, number> = {};
  for (const b of headline) byYear[b.trade_date.slice(0, 4)] = (byYear[b.trade_date.slice(0, 4)] ?? 0) + b.amount_usd;
  const nonUsd = headline.filter((b) => b.currency !== "USD").reduce((s, b) => s + b.amount_usd, 0);
  const oracle10 = headline
    .filter((b) => b.issuer_id === "oracle" && b.currency === "USD" && b.spread_bp != null && b.tenor_years >= 9 && b.tenor_years <= 11)
    .sort((a, b) => a.trade_date.localeCompare(b.trade_date));
  const msftDebt = issuerById.microsoft?.fundamentals.total_debt ?? {};
  const msftYears = Object.keys(msftDebt).sort();
  return {
    total: metrics.headline_usd,
    explicit: metrics.headline_explicit_usd,
    outliving: metrics.share_outliving_hardware,
    nDeals: metrics.n_deals,
    nTranches: metrics.n_tranches,
    biggest,
    longest,
    byYear,
    nonUsd,
    oracleFirst: oracle10[0],
    oracleLast: oracle10[oracle10.length - 1],
    msftDebtFirst: msftYears.length ? { year: msftYears[0], v: msftDebt[msftYears[0]] } : null,
    msftDebtLast: msftYears.length ? { year: msftYears.at(-1)!, v: msftDebt[msftYears.at(-1)!] } : null,
  };
}

/* ---------- statistics for the paper layer ---------- */

const wavg = (xs: { v: number | null; w: number }[]) => {
  const ok = xs.filter((x) => x.v != null);
  const w = ok.reduce((s, x) => s + x.w, 0);
  return w ? ok.reduce((s, x) => s + (x.v as number) * x.w, 0) / w : null;
};

export interface SummaryRow {
  id: string;
  name: string;
  deals: number;
  tranches: number;
  total: number;
  share: number;
  nonUsd: number;
  coupon: number | null;
  tenor: number;
  spread: number | null;
  longest: number;
  life: number | null;
  outliving: number;
}

/** Table 1: descriptive statistics by issuer (amount-weighted). */
export function summaryTable(): { rows: SummaryRow[]; all: SummaryRow } {
  const lifeOf = (id: string) => issuerById[id]?.useful_life?.years ?? null;
  const build = (id: string, name: string, list: Bond[]): SummaryRow => {
    const total = list.reduce((s, b) => s + b.amount_usd, 0);
    return {
      id,
      name,
      deals: new Set(list.map((b) => `${b.issuer_id}|${b.trade_date}`)).size,
      tranches: list.length,
      total,
      share: total / metrics.headline_usd,
      nonUsd: list.filter((b) => b.currency !== "USD").reduce((s, b) => s + b.amount_usd, 0) / total,
      coupon: wavg(list.map((b) => ({ v: b.coupon_pct, w: b.amount_usd }))),
      tenor: wavg(list.map((b) => ({ v: b.tenor_years, w: b.amount_usd })))!,
      spread: wavg(list.filter((b) => b.currency === "USD").map((b) => ({ v: b.spread_bp, w: b.amount_usd }))),
      longest: Math.max(...list.map((b) => b.tenor_years)),
      life: id === "all" ? null : lifeOf(id),
      outliving:
        list.filter((b) => b.tenor_years > (lifeOf(b.issuer_id) ?? 6)).reduce((s, b) => s + b.amount_usd, 0) / total,
    };
  };
  const ids = [...new Set(headline.map((b) => b.issuer_id))];
  const rows = ids
    .map((id) => build(id, issuerById[id].name, headline.filter((b) => b.issuer_id === id)))
    .sort((a, b) => b.total - a.total);
  return { rows, all: build("all", "All issuers", headline) };
}

/** Share of headline debt still outstanding after the asset is fully depreciated, for alternative asset lives. */
export function sensitivity(lives = [4, 5, 6, 8, 10, 15, 20, 30]) {
  return lives.map((L) => ({
    life: L,
    share: headline.filter((b) => b.tenor_years > L).reduce((s, b) => s + b.amount_usd, 0) / metrics.headline_usd,
  }));
}

/** Amount-weighted median maturity: half of the money is owed until at least this date. */
export function medianMaturity(): string {
  const sorted = [...headline].sort((a, b) => a.maturity_date.localeCompare(b.maturity_date));
  let acc = 0;
  for (const b of sorted) {
    acc += b.amount_usd;
    if (acc >= metrics.headline_usd / 2) return b.maturity_date;
  }
  return sorted.at(-1)!.maturity_date;
}

/** Fitted ten-year new-issue spread per issuer, before 2026 and in 2026. */
export function curveShift(split = "2026-01-01") {
  const sample = curveSample(headline);
  const ids = [...new Set(sample.map((b) => b.issuer_id))];
  return ids
    .map((id) => {
      const own = sample.filter((b) => b.issuer_id === id);
      const pre = fitCurve(own.filter((b) => b.trade_date < split));
      const post = fitCurve(own.filter((b) => b.trade_date >= split));
      return { id, name: issuerById[id].name, pre: pre?.at10 ?? null, post: post?.at10 ?? null };
    })
    .filter((r) => r.pre != null && r.post != null)
    .map((r) => ({ ...r, delta: (r.post as number) - (r.pre as number) }))
    .sort((a, b) => b.delta - a.delta);
}

/* ---------- asset side: facts quoted in the new chapter ---------- */

/** Headline bonds/loans priced inside each issuer's fiscal year (for the waterfall note). */
export function bondsInFiscalYear(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, rows] of Object.entries(metrics.funding_gap.years)) {
    for (const r of rows) {
      const end = new Date(`${r.period_end}T00:00:00Z`);
      const start = new Date(end);
      start.setUTCFullYear(end.getUTCFullYear() - 1);
      const s = start.toISOString().slice(0, 10);
      out[`${id}|${r.fy}`] = headline
        .filter((b) => b.issuer_id === id && b.trade_date > s && b.trade_date <= r.period_end)
        .reduce((t, b) => t + b.amount_usd, 0);
    }
  }
  return out;
}

export function assetFacts() {
  const latest = <T extends { fy: number; fq: number }>(rows: T[] | undefined) =>
    rows && rows.length ? rows[rows.length - 1] : undefined;
  const cov = Object.fromEntries(
    Object.entries(metrics.interest_coverage).map(([id, rows]) => [id, latest(rows)]),
  );
  const others = Object.entries(cov)
    .filter(([id, r]) => r && id !== "oracle" && id !== "coreweave")
    .map(([, r]) => r!.coverage);
  const leaseTotal = commitments.reduce((s, c) => s + c.amount_usd, 0);
  const growthY = Object.fromEntries(
    Object.entries(metrics.capex_vs_cloud_growth).map(([id, g]) => [id, latest(g.years.filter((r) => r.capex_yoy_pct != null))]),
  );
  const gapY = Object.fromEntries(
    Object.entries(metrics.funding_gap.years).map(([id, rows]) => [id, latest(rows.filter((r) => r.gap != null))]),
  );
  const intensityQ = Object.fromEntries(
    Object.entries(metrics.capex_intensity).map(([id, v]) => [id, latest(v.quarters)]),
  );
  const wave = metrics.depreciation_wave.issuers;
  const waveNext = Object.fromEntries(
    Object.entries(wave).map(([id, w]) => {
      const proj = w.years.filter((y) => y.projected);
      const peak = proj.reduce((a, y) => (y.total > a.total ? y : a), proj[0]);
      const lastActual = w.years.filter((y) => !y.projected).at(-1)!;
      return [id, { peak, lastActual, revenue: w.latest_revenue, latestFy: w.latest_fy }];
    }),
  );
  return {
    cov,
    minOtherCoverage: others.length ? Math.min(...others) : null,
    leaseTotal,
    leaseVsHeadline: leaseTotal / metrics.headline_usd,
    largestLease: [...commitments].sort((a, b) => b.amount_usd - a.amount_usd)[0],
    growthY,
    gapY,
    intensityQ,
    waveNext,
  };
}
