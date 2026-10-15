export type InstrumentType =
  | "senior_notes"
  | "floating_rate_notes"
  | "secured_notes"
  | "convertible_notes"
  | "term_loan"
  | "revolver"
  | "other_debt";

export interface Bond {
  id: string;
  issuer_id: string;
  issuer: string;
  name: string;
  instrument_type: InstrumentType;
  trade_date: string;
  maturity_date: string;
  tenor_years: number;
  currency: string;
  amount: number;
  amount_usd: number;
  fx_rate: number | null;
  coupon_pct: number | null;
  floating_spread_bp: number | null;
  price_pct: number | null;
  ytm_pct: number | null;
  spread_bp: number | null;
  benchmark: string | null;
  benchmark_yield_pct: number | null;
  index_oas_bp: number | null;
  cusip: string | null;
  isin: string | null;
  secured_by: string | null;
  ai_flag: "explicit" | "general";
  in_headline: boolean;
  validation: "pass" | "override";
  override_reason: string | null;
  source_url: string;
  accession: string;
  extract_quote: string | null;
  proceeds_quote: string | null;
  other_sources?: string[];
}

export interface Issuer {
  id: string;
  name: string;
  ticker: string;
  cik: number;
  color: string;
  inclusion_reason: string;
  useful_life: { years: number; range?: [number, number]; source_url: string; quote: string } | null;
  fundamentals: Record<
    "capex" | "operating_cash_flow" | "total_debt" | "debt_issued" | "debt_repaid" | "finance_lease_liabilities",
    Record<string, number>
  >;
  borrowed_usd: number;
  n_tranches: number;
}

export interface Mismatch {
  issuer_id: string;
  useful_life_years: number;
  longest_tenor_years: number;
  wavg_tenor_years: number;
  share_outliving_hardware: number;
}

export interface Metrics {
  meta: { dataset_version: string; generated_at: string };
  headline_usd: number;
  share_outliving_hardware: number;
  currencies: string[];
  headline_explicit_usd: number;
  n_tranches: number;
  n_deals: number;
  n_issuers_borrowing: number;
  first_date: string;
  last_date: string;
  by_issuer_year: Record<string, Record<string, number>>;
  maturity_wall: Record<string, Record<string, number>>;
  cumulative: Array<{ date: string } & Record<string, number | string>>;
  index_oas_bp: Record<"ig" | "aa" | "bbb" | "hy", [string, number][]>;
  mismatch: Mismatch[];
  // asset side (added with the "where the money goes" chapter)
  funding_gap: { quarters: Record<string, GapRow[]>; years: Record<string, GapRow[]> };
  capex_intensity: Record<string, { quarters: IntensityRow[]; years: IntensityRow[] }>;
  capex_vs_cloud_growth: Record<string, { quarters: GrowthRow[]; years: GrowthRow[]; basis: CloudBasis }>;
  interest_coverage: Record<string, CoverageRow[]>;
  depreciation_wave: {
    assumptions: { server_share_of_capex: number; other_asset_life_years: number; horizon_years: number; first_vintage_fy: number };
    issuers: Record<string, WaveIssuer>;
  };
}

export interface PeriodKey {
  label: string;
  fy: number;
  fq: number;
  period_end: string;
}

export interface GapRow extends PeriodKey {
  gap: number | null;
  ocf?: number;
  capex?: number;
  dividends?: number;
  buybacks?: number;
  net_debt?: number;
  cash_drawdown?: number;
  other?: number;
  assumed_zero: string[];
}

export interface IntensityRow extends PeriodKey {
  capex: number;
  revenue: number;
  intensity: number;
}

export type CloudBasis = "segment_revenue" | "pct_disclosed" | "total_revenue";

export interface GrowthRow extends PeriodKey {
  capex_yoy_pct: number | null;
  cloud_yoy_pct: number | null;
  cloud_basis: CloudBasis;
}

export interface CoverageRow extends PeriodKey {
  operating_income_ttm: number;
  interest_expense_ttm: number;
  coverage: number;
}

export interface WaveIssuer {
  vintages: { fy: number; capex: number; server_life: number }[];
  server_share: number;
  other_life: number;
  latest_fy: number;
  latest_revenue: number | null;
  years: { fy: number; server: number; other: number; total: number; reported_depreciation: number | null; projected: boolean }[];
}

export interface Commitment {
  id: string;
  issuer_id: string;
  as_of: string;
  amount_usd: number;
  amount_text: string;
  description: string;
  subsequent_usd?: number;
  subsequent_note?: string;
  form: string;
  source_url: string;
  quotes: string[];
}

export interface OffBalance {
  id: string;
  issuer_id: string;
  name: string;
  date: string;
  structure: string;
  development_cost_usd: number;
  max_exposure_usd: number;
  initial_lease_years: number;
  max_lease_years: number;
  residual_value_guarantee_usd: number;
  source_url: string;
  quotes: string[];
}
