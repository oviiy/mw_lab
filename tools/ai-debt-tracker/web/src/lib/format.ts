const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** $383.3B / $950M — compact USD for labels and prose. */
export function usd(v: number, digits = 1): string {
  const a = Math.abs(v);
  if (a >= 1e12) return `$${(v / 1e12).toFixed(digits)}T`;
  if (a >= 1e9) return `$${(v / 1e9).toFixed(digits)}B`;
  if (a >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString("en-US")}`;
}

/** "$383 billion" — for headlines, where symbols read poorly. */
export function usdWords(v: number): string {
  if (v >= 1e9) return `$${Math.round(v / 1e9).toLocaleString("en-US")} billion`;
  return `$${Math.round(v / 1e6).toLocaleString("en-US")} million`;
}

const SYMBOL: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", CHF: "CHF ", AUD: "A$" };

export function local(amount: number, currency: string): string {
  const s = SYMBOL[currency] ?? `${currency} `;
  if (amount >= 1e9) return `${s}${+(amount / 1e9).toFixed(2)}B`;
  return `${s}${Math.round(amount / 1e6)}M`;
}

export function pct(v: number | null | undefined, digits = 3): string {
  return v == null ? "—" : `${+v.toFixed(digits)}%`;
}

export function share(v: number): string {
  return `${Math.round(v * 100)}%`;
}

export function date(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function monthYear(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function years(v: number): string {
  return v >= 10 ? `${Math.round(v)} years` : `${+v.toFixed(1)} years`;
}

export const INSTRUMENT_LABEL: Record<string, string> = {
  senior_notes: "Senior notes",
  floating_rate_notes: "Floating-rate notes",
  secured_notes: "Secured notes",
  convertible_notes: "Convertible notes",
  term_loan: "Term loan",
  revolver: "Revolving credit",
  other_debt: "Other debt",
};
