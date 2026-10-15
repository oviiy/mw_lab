/**
 * All story prose. Numbers are interpolated from the dataset at build time,
 * so a weekly data refresh updates the words as well as the charts.
 */
import { bonds, deals, facts, funding, headline, issuerById, metrics } from "../lib/data";
import { date, monthYear, share, usd, usdWords } from "../lib/format";

const f = facts();
const sw = (c: "claret" | "blue") => `<span class="swatch ${c}" aria-hidden="true"></span>`;
const yr = (y: string) => usd(f.byYear[y] ?? 0, 1);

const lifeRange = (() => {
  const ls = metrics.mismatch.map((m) => m.useful_life_years);
  return [Math.min(...ls), Math.max(...ls)];
})();

const msft = issuerById.microsoft;
const msftLease = msft?.fundamentals.finance_lease_liabilities ?? {};
const leaseYears = Object.keys(msftLease).sort();
const msftDebt = msft?.fundamentals.total_debt ?? {};
const debtYears = Object.keys(msftDebt).sort();

const latestRatio = (id: string) => {
  const rows = funding().filter((r) => r.issuer_id === id);
  const last = rows[rows.length - 1];
  return last ? { year: last.year, r: last.capex / last.ocf } : { year: "", r: 0 };
};

const coreweave = headline.filter((b) => b.issuer_id === "coreweave");
const coreweaveTotal = coreweave.reduce((s, b) => s + b.amount_usd, 0);
const cwLoans = coreweave.filter((b) => b.instrument_type === "term_loan").reduce((s, b) => s + b.amount_usd, 0);
const cwHighCoupon = Math.max(...coreweave.map((b) => b.coupon_pct ?? 0));

const mm = Object.fromEntries(metrics.mismatch.map((m) => [m.issuer_id, m]));
const longestOf = (id: string) => Math.round(mm[id]?.longest_tenor_years ?? 0);
const igAt = (iso: string) => {
  const s = metrics.index_oas_bp.ig;
  let v = s[0][1];
  for (const [d, x] of s) if (d <= iso) v = x;
  return v;
};

export const hero = {
  headline: "The chips wear out in six years. The debt runs for decades.",
  dek: `Since 2024, Meta, Alphabet, Amazon, Oracle and CoreWeave have borrowed ${usdWords(f.total)} in bonds and loans to build AI. ${share(f.outliving)} of it is still owed after the servers it paid for have been written off.`,
  legend: `Each line is one bond or loan, from the day it was priced to the day it must be repaid. ${sw("claret")}Claret while the servers it financed are still in service; ${sw("blue")}blue once they have been fully depreciated.`,
};

export const howMuch = [
  `<p>Since January 2024, the five companies spending most aggressively on AI have sold <strong>${f.nTranches} bonds and loans</strong> worth <strong>${usd(f.total)}</strong>, across ${f.nDeals} separate deals.</p>`,
  `<p>The pace is accelerating. They borrowed ${yr("2024")} in 2024 and ${yr("2025")} in 2025. In 2026, with the year not yet over, the figure is <strong>${yr("2026")}</strong>.</p>`,
  `<p>The largest single day: <strong>${issuerById[f.biggest.issuer_id].name}</strong> raised ${usd(f.biggest.amount_usd)} on ${date(f.biggest.date)}, split across ${f.biggest.n} separate bonds.</p>`,
  `<p>CoreWeave is the smallest borrower here and the most dependent on it. It has no investment-grade rating, so its ${usd(coreweaveTotal)} comes as high-yield bonds paying up to ${cwHighCoupon}%, convertibles, and ${usd(cwLoans)} of loans secured by the GPUs themselves.</p>`,
];

const nonUsdShare = share(f.nonUsd / f.total);
const msftNote =
  leaseYears.length && debtYears.length
    ? `No new bonds since 2024. Finance leases: ${usd(msftLease[leaseYears[0]])} → ${usd(msftLease[leaseYears.at(-1)!])}.`
    : "No new bonds since 2024.";

export const whoBorrows = {
  notes: { microsoft: msftNote },
  steps: [
    `<p>Each circle is one deal: every bond a company priced on a single day. Its area is proportional to the amount raised. Hover for the terms; click to open the filing.</p>`,
    `<p>The US market was not big enough. ${nonUsdShare} of the money, ${usd(f.nonUsd)}, was raised in euros, sterling, Canadian dollars and yen. That includes Alphabet's ${f.longest.currency === "GBP" ? "£" : ""}${(f.longest.amount / 1e9).toFixed(0)} billion bond due in <strong>${f.longest.maturity_date.slice(0, 4)}</strong>: a hundred-year loan to fund a five-year asset.</p>`,
    `<p>CoreWeave borrows differently. Its ${sw("claret")}deals are term loans secured by GPUs and customer contracts, convertibles, and high-yield notes. These are instruments built for companies that lenders consider risky.</p>`,
    `<p>One company is missing. <strong>Microsoft</strong>, among the largest AI spenders, has not sold a bond since 2024, and its total debt fell from ${usd(msftDebt[debtYears[0]] ?? 0)} to ${usd(msftDebt[debtYears.at(-1)!] ?? 0)}. Its finance leases, mostly data centers it rents rather than owns, rose from ${usd(msftLease[leaseYears[0]] ?? 0)} to ${usd(msftLease[leaseYears.at(-1)!] ?? 0)}. That is leverage too, just not in this chart.</p>`,
  ],
};

const o1 = f.oracleFirst;
const o2 = f.oracleLast;
export const marketPrice = [
  `<p>Bond investors have been relaxed about all this. The extra yield they demand to hold an average investment-grade corporate bond instead of Treasuries has stayed low, at about ${(igAt(metrics.last_date) / 100).toFixed(2)} percentage points.</p>`,
  `<p>Each dot is a new ten-year bond from one of these companies, at the spread it paid over Treasuries on the day it was sold. Meta, Alphabet and Amazon borrow at or below the market average.</p>`,
  o1 && o2
    ? `<p><strong>Oracle</strong> is the exception. Its ten-year spread rose from ${o1.spread_bp} basis points in ${monthYear(o1.trade_date)} to <strong>${o2.spread_bp}</strong> in ${monthYear(o2.trade_date)}, while the market average fell from ${o1.index_oas_bp} to ${o2.index_oas_bp}. Lenders are charging Oracle for its AI bet.</p>
       <p class="note">New-issue spreads are measured against a single Treasury benchmark; the indices are option-adjusted spreads across thousands of bonds. The comparison shows direction, not a precise premium.</p>`
    : `<p>No Oracle ten-year bonds in the data yet.</p>`,
];

const amzn = latestRatio("amazon");
const orcl = latestRatio("oracle");
const crwv = latestRatio("coreweave");
export const whereMoneyGoes = [
  `<p>Why borrow at all? Capital spending, the ${sw("claret")}claret line, has more than doubled in two years at every company here. The black line is the cash the businesses actually generate. Shading marks spending beyond it. The ${sw("blue")}blue dashes show total debt.</p>`,
  `<p>Amazon spent ${share(amzn.r)} of its operating cash flow on capital projects in fiscal ${amzn.year}, leaving almost nothing for anything else.</p>`,
  `<p>Oracle and CoreWeave spend far more than they earn. Oracle's fiscal ${orcl.year} capital spending was <strong>${share(orcl.r)}</strong> of its operating cash flow; CoreWeave's was <strong>${share(crwv.r)}</strong>. The gap is borrowed.</p>`,
  `<p>Microsoft's spending is covered by its cash flow, which is why it can build without new bonds, though it leans on leases instead.</p>`,
];

export const mismatch = [
  `<p>Here is the catch. Every company in this story tells its auditors that AI servers stay useful for ${lifeRange[0]} to ${lifeRange[1]} years. That is the ${sw("claret")}claret bar: their own estimate, from their annual reports.</p>`,
  `<p>The ${sw("blue")}blue bar is how long the money is owed, on average, weighted by size. At Meta it is ${Math.round(mm.meta?.wavg_tenor_years ?? 0)} years. At Alphabet, ${Math.round(mm.alphabet?.wavg_tenor_years ?? 0)}.</p>`,
  `<p>At the far end are ${longestOf("meta")}-year bonds from Meta and Oracle, ${longestOf("amazon")} from Amazon, and Alphabet's ${longestOf("alphabet")}-year bond. In all, <strong>${share(f.outliving)}</strong> of this debt is still owed after the hardware it paid for has been written off.</p>
   <p>CoreWeave is the exception: its loans are sized to the life of the GPUs, which is also why they cost so much more.</p>`,
];

export const wallNote = {
  writtenOffBy: Number(metrics.last_date.slice(0, 4)) + Math.max(...metrics.mismatch.map((m) => m.useful_life_years)),
};

export { bonds, deals };
