"""Build every number and chart series in the story from ../data/raw into ../data/derived/story_data.json.

Credit side (market prices, no model): the spread over Treasuries each company paid on each new
USD bond, compared with (a) the ICE BofA index for its rating band and (b) the ICE BofA index for
the same maturity bucket. No maturity adjustment is applied: tranches are compared at the maturity
they were sold.

Equity side (model): a Merton structural model turns market value, stock volatility and debt into
a default probability and the spread it implies. Scenarios hold the calibrated asset volatility
fixed and change the equity value, so a lower share price always means a higher implied spread.
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy.optimize import brentq, fsolve
from scipy.stats import norm

ROOT = Path(__file__).resolve().parent.parent
RAW, OUT = ROOT / "data" / "raw", ROOT / "data" / "derived"
OUT.mkdir(parents=True, exist_ok=True)

ISSUERS = {"meta": ("Meta Platforms", "META"), "alphabet": ("Alphabet", "GOOGL"), "amazon": ("Amazon", "AMZN"),
           "oracle": ("Oracle", "ORCL"), "microsoft": ("Microsoft", "MSFT"), "coreweave": ("CoreWeave", "CRWV")}
IG4 = ["meta", "alphabet", "amazon", "oracle"]
# Rating-band index each company's bonds are compared with (agency ratings around AA for the three
# hyperscalers that borrowed, around BBB for Oracle, high yield for CoreWeave).
RATING_INDEX = {"meta": "aa_oas", "alphabet": "aa_oas", "amazon": "aa_oas", "oracle": "bbb_oas", "coreweave": "hy_oas"}
# ICE BofA US Corporate maturity buckets (upper bound in years, FRED series stem, label).
BUCKETS = [(3, "c1_3", "1–3y"), (5, "c3_5", "3–5y"), (7, "c5_7", "5–7y"), (10, "c7_10", "7–10y"),
           (15, "c10_15", "10–15y"), (999, "c15p", "15y+")]
CHATGPT_DAY = pd.Timestamp("2022-11-30")
LGD = 0.6
T_SPREAD = 5.0
FILING_LAG = 45
# Signed-but-not-started leases, valued as level payments over 15 years starting in 2 years at 5%.
LEASE_PV = sum(1.05 ** -t for t in range(3, 18)) / 15


# ---------------------------------------------------------------- loaders
def load_prices():
    p = json.loads((RAW / "prices.json").read_text())
    close, adj = {}, {}
    for t, d in p.items():
        idx = pd.to_datetime(d["t"], unit="s").normalize()
        close[t] = pd.Series(d["close"], index=idx, dtype=float)
        adj[t] = pd.Series(d["adjclose"], index=idx, dtype=float)
    return pd.DataFrame(close).sort_index(), pd.DataFrame(adj).sort_index()


def load_fred():
    out = {}
    for f in RAW.glob("fred_*.csv"):
        s = pd.read_csv(f, index_col=0, parse_dates=True).iloc[:, 0]
        out[f.stem[5:]] = pd.to_numeric(s, errors="coerce")
    return pd.DataFrame(out).sort_index().ffill()


def at(fred, col, date):
    return float(fred[col].loc[:date].dropna().iloc[-1])


CMT = [("ust_1m", 1 / 12), ("ust_3m", .25), ("ust_6m", .5), ("ust_1y", 1), ("ust_2y", 2), ("ust_3y", 3),
       ("ust_5y", 5), ("ust_7y", 7), ("ust_10y", 10), ("ust_20y", 20), ("ust_30y", 30)]


def treasury_yield(fred, date, tenor):
    row = fred.loc[:date].iloc[-1]
    return float(np.interp(min(tenor, 30), [m for _, m in CMT], [row[c] for c, _ in CMT]))


def headline_bonds():
    b = pd.read_csv(RAW / "bonds.csv", parse_dates=["trade_date", "maturity_date"])
    return b[b.in_headline].sort_values("trade_date")


# ---------------------------------------------------------------- balance sheet
def facts(iid):
    return json.loads((RAW / f"facts_{iid}.json").read_text())["facts"]["us-gaap"]


def instant_series(g, tag):
    """Balance-sheet values by period end, as first reported (no later restatements)."""
    if tag not in g:
        return pd.Series(dtype=float)
    rows = [x for x in g[tag]["units"].get("USD", []) if x.get("form") in ("10-K", "10-Q")]
    if not rows:
        return pd.Series(dtype=float)
    df = pd.DataFrame(rows)
    df = df[pd.to_datetime(df.end) <= pd.to_datetime(df.filed)]
    df = df.sort_values("filed").drop_duplicates("end", keep="first")
    return pd.Series(df["val"].values, index=pd.to_datetime(df["end"])).sort_index()


def weighted_shares(g):
    rows = []
    for x in g.get("WeightedAverageNumberOfDilutedSharesOutstanding", {}).get("units", {}).get("shares", []):
        if "start" in x:
            days = (pd.Timestamp(x["end"]) - pd.Timestamp(x["start"])).days
            if 80 <= days <= 370:
                rows.append({**x, "days": days})
    df = pd.DataFrame(rows).sort_values(["end", "days", "filed"], ascending=[True, True, False]).drop_duplicates("end")
    return pd.Series(df["val"].values, index=pd.to_datetime(df["end"])).sort_index()


def balance_sheet(iid):
    """Total debt by period end from the most comprehensive tag the company uses.

    Tags that describe single instruments (DebtInstrumentCarryingAmount, SeniorNotes) are never used:
    in quarters without a total they return one note issue, not the company's debt.
    """
    g = facts(iid)
    s = {t: instant_series(g, t) for t in [
        "LongTermDebt", "LongTermDebtNoncurrent", "LongTermDebtCurrent", "DebtCurrent",
        "DebtLongtermAndShorttermCombinedAmount", "CommercialPaper", "ShortTermBorrowings",
        "FinanceLeaseLiability", "FinanceLeaseLiabilityNoncurrent", "OperatingLeaseLiability",
        "OperatingLeaseLiabilityNoncurrent"]}
    ends = sorted(set().union(*[v.index for v in s.values()]))
    rows = []
    for e in [e for e in ends if e >= pd.Timestamp("2020-06-30")]:
        v = {k: ser.get(e, np.nan) for k, ser in s.items()}
        if not np.isnan(v["LongTermDebt"]) and v["LongTermDebt"] > 0:  # Oracle tags FY2022 LongTermDebt as 0
            debt = v["LongTermDebt"]
        elif not np.isnan(v["LongTermDebtNoncurrent"]):
            cur = v["LongTermDebtCurrent"] if not np.isnan(v["LongTermDebtCurrent"]) else v["DebtCurrent"]
            debt = v["LongTermDebtNoncurrent"] + np.nan_to_num(cur)
        elif not np.isnan(v["DebtLongtermAndShorttermCombinedAmount"]):
            debt = v["DebtLongtermAndShorttermCombinedAmount"]
        else:
            continue
        debt += np.nansum([v["CommercialPaper"], v["ShortTermBorrowings"]])
        fin = v["FinanceLeaseLiability"] if not np.isnan(v["FinanceLeaseLiability"]) else v["FinanceLeaseLiabilityNoncurrent"]
        op = v["OperatingLeaseLiability"] if not np.isnan(v["OperatingLeaseLiability"]) else v["OperatingLeaseLiabilityNoncurrent"]
        rows.append({"end": e, "debt": debt, "fin_lease": fin, "op_lease": op})
    bs = pd.DataFrame(rows).set_index("end").sort_index()
    bs[["fin_lease", "op_lease"]] = bs[["fin_lease", "op_lease"]].ffill().fillna(0)
    sh = weighted_shares(g)
    if iid == "coreweave":  # IPO 28 Mar 2025: the Q1 2025 weighted count is mostly pre-IPO
        sh = sh[sh.index >= pd.Timestamp("2025-06-30")]
    bs["shares"] = sh.reindex(sh.index.union(bs.index)).sort_index().ffill().bfill().reindex(bs.index)
    return bs


def daily_debt(iid, bs, index, bonds):
    """Debt on each day: the last reported total once public (45 days after period end), plus the
    bonds and loans the AI Debt Tracker records as priced after that period end. Repayments in
    between are ignored, which matters little over a quarter."""
    known = bs.copy()
    known.index = known.index + pd.Timedelta(days=FILING_LAG)
    base = known.reindex(known.index.union(index)).sort_index().ffill().reindex(index)
    ends = pd.Series(bs.index, index=bs.index + pd.Timedelta(days=FILING_LAG))
    ends = ends.reindex(ends.index.union(index)).sort_index().ffill().reindex(index)
    mine = bonds[(bonds.issuer_id == iid) & (bonds.instrument_type != "revolver")]
    add = np.array([mine[(mine.trade_date > e) & (mine.trade_date <= d)].amount_usd.sum() if pd.notna(e) else 0.0
                    for d, e in zip(index, ends.values)])
    base["debt"] = base["debt"] + add
    return base


# ---------------------------------------------------------------- Merton
def solve_assets(E, F, sigE, r, T=1.0):
    def eqs(x):
        V, sV = np.exp(x[0]), np.exp(x[1])
        d1 = (np.log(V / F) + (r + 0.5 * sV ** 2) * T) / (sV * np.sqrt(T))
        d2 = d1 - sV * np.sqrt(T)
        return [(V * norm.cdf(d1) - F * np.exp(-r * T) * norm.cdf(d2)) / E - 1, norm.cdf(d1) * sV * V / (sigE * E) - 1]
    x, _, ok, _ = fsolve(eqs, [np.log(E + F), np.log(max(sigE * E / (E + F), .02))], full_output=True)
    return (np.exp(x[0]), np.exp(x[1])) if ok == 1 else (np.nan, np.nan)


def spread_from_assets(V, F, sV, r, T=T_SPREAD, lgd=LGD):
    dd = (np.log(V / F) + (r - 0.5 * sV ** 2) * T) / (sV * np.sqrt(T))
    pd_ = norm.cdf(-dd)
    return -np.log(1 - pd_ * lgd) / T * 1e4, pd_


def merton(E, F, sigE, r):
    V, sV = solve_assets(E, F, sigE, r)
    s, p = spread_from_assets(V, F, sV, r)
    return s, p, V, sV


def assets_for_equity(E, F, sV, r):
    """Asset value consistent with equity value E at a fixed asset volatility (1-year horizon)."""
    def f(lv):
        V = np.exp(lv)
        d1 = (np.log(V / F) + (r + 0.5 * sV ** 2)) / sV
        return V * norm.cdf(d1) - F * np.exp(-r) * norm.cdf(d1 - sV) - E
    return np.exp(brentq(f, np.log(max(E, 1.0)), np.log(E + 2 * F)))


def scenario_spread(E, F, sV, r, lgd=LGD):
    return spread_from_assets(assets_for_equity(E, F, sV, r), F, sV, r, lgd=lgd)[0]


def equity_side(close, adj, fred, bonds):
    rets = np.log(adj).diff()
    rf5 = fred["ust_5y"] / 100
    out = {}
    for iid, (_, tk) in ISSUERS.items():
        bs = balance_sheet(iid)
        px = close[tk].dropna()
        idx = px.index[px.index >= pd.Timestamp("2021-01-01")]
        d = daily_debt(iid, bs, idx, bonds)
        sigE = rets[tk].rolling(252, min_periods=120).std().reindex(idx) * np.sqrt(252)
        df = pd.DataFrame({"E": px.reindex(idx) * d.shares, "F": d.debt + d.fin_lease, "op_lease": d.op_lease,
                           "sigE": sigE, "r5": rf5.reindex(idx).ffill()}).dropna()
        df = df.iloc[::-1].iloc[::5].iloc[::-1]  # weekly, ending on the latest day
        res = [merton(e, f, s, r) for e, f, s, r in zip(df.E, df.F, df.sigE, df.r5)]
        df[["spr5", "pd5", "V", "sV"]] = pd.DataFrame(res, index=df.index)
        out[iid] = df
    return out


# ---------------------------------------------------------------- credit side
def ytm_from_price(cpn, price, years):
    n = int(round(years * 2))
    return brentq(lambda y: sum(cpn / 2 / (1 + y / 200) ** k for k in range(1, n + 1)) + 100 / (1 + y / 200) ** n - price, -5, 50)


def tranches(fred, bonds):
    b = bonds[(bonds.currency == "USD") & (bonds.instrument_type == "senior_notes") & bonds.coupon_pct.notna()].copy()
    miss = b.ytm_pct.isna()
    b["price_assumed"] = miss & b.price_pct.isna()
    b.loc[miss, "ytm_pct"] = [ytm_from_price(c, p if not np.isnan(p) else 100.0, t)
                              for c, p, t in zip(b.coupon_pct[miss], b.price_pct[miss], b.tenor_years[miss])]
    b["spread_calc"] = [(y - treasury_yield(fred, d, t)) * 100 for y, d, t in zip(b.ytm_pct, b.trade_date, b.tenor_years)]
    # Term-sheet spread to the benchmark Treasury where stated; computed otherwise (CoreWeave's 144A notes).
    b["spread"] = b.spread_bp.fillna(b.spread_calc)
    b = b[b.spread.notna()].copy()
    b["bucket"] = [next(c for hi, c, _ in BUCKETS if t <= hi + 0.5) for t in b.tenor_years]
    b["bucket_label"] = [next(l for hi, c, l in BUCKETS if t <= hi + 0.5) for t in b.tenor_years]
    b["bucket_oas"] = [at(fred, c, d) * 100 for c, d in zip(b.bucket, b.trade_date)]
    b["rating_index"] = b.issuer_id.map(RATING_INDEX)
    b["rating_oas"] = [at(fred, c, d) * 100 for c, d in zip(b.rating_index, b.trade_date)]
    b["vs_bucket"] = b.spread - b.bucket_oas
    b["vs_rating"] = b.spread - b.rating_oas
    b["group"] = pd.cut(b.tenor_years, [0, 4.5, 6.6, 12.5, 24.5, 200], labels=["short", "5y", "10y", "20y", "long"]).astype(str)
    b["deal"] = b.issuer_id + "|" + b.trade_date.dt.strftime("%Y-%m-%d")
    allb = headline_bonds()
    b["cum_before_bn"] = [allb[(allb.issuer_id == i) & (allb.trade_date < d)].amount_usd.sum() / 1e9 for i, d in zip(b.issuer_id, b.trade_date)]
    return b


def deal_table(t, fred):
    rows = []
    for deal, x in t.groupby("deal"):
        iid, d = x.issuer_id.iloc[0], x.trade_date.iloc[0]
        g = x.groupby("group").spread.mean()
        s5, lng = g.get("5y", np.nan), g.get("long", np.nan)
        # The 30-year bond: the tranche closest to 30 years among those of 25 to 35 years. Every
        # first and latest deal has one, so it compares like with like (unlike "longest", whose
        # maturity varies between 40 and 50 years).
        t30 = x[(x.tenor_years >= 25) & (x.tenor_years <= 35)]
        s30 = t30.loc[(t30.tenor_years - 30).abs().idxmin(), "spread"] if len(t30) else np.nan
        mkt_short, mkt_long = at(fred, "c3_5", d) * 100, at(fred, "c15p", d) * 100
        rows.append({"issuer_id": iid, "date": d, "n": len(x), "size_bn": x.amount_usd.sum() / 1e9,
                     "cum_before_bn": x.cum_before_bn.iloc[0], "s5": s5, "s10": g.get("10y", np.nan),
                     "s20": g.get("20y", np.nan), "long": lng, "longest_years": x.tenor_years.max(),
                     "rating_oas": x.rating_oas.iloc[0], "rating_index": x.rating_index.iloc[0],
                     "s5_vs_rating": s5 - x.rating_oas.iloc[0],
                     "long_vs_market": lng - mkt_long, "mkt_long": mkt_long, "mkt_short": mkt_short,
                     "slope": lng - s5, "mkt_slope": mkt_long - mkt_short, "excess_slope": (lng - s5) - (mkt_long - mkt_short),
                     "s30": s30, "s30_vs_market": s30 - mkt_long, "excess_slope30": (s30 - s5) - (mkt_long - mkt_short),
                     "s5_ratio": s5 / x.rating_oas.iloc[0], "s30_ratio": s30 / mkt_long,
                     "ig_oas": at(fred, "ig_oas", d) * 100,
                     # Market curve that day: ICE BofA maturity-bucket spreads at each bucket's midpoint.
                     "mkt_curve": [[m, round(at(fred, c, d) * 100, 1)] for m, c in
                                   [(2, "c1_3"), (4, "c3_5"), (6, "c5_7"), (8.5, "c7_10"), (12.5, "c10_15"), (25, "c15p")]]})
    return pd.DataFrame(rows).sort_values(["issuer_id", "date"]).reset_index(drop=True)


def curve_regression(t):
    """Tranche level: spread over the same-maturity index on log maturity, before and in 2026, issuer
    intercepts, standard errors clustered by deal. Tests whether the long-end premium grew."""
    x = t[t.issuer_id.isin(IG4)].copy()
    x["ln_t"] = np.log(x.tenor_years)
    x["y2026"] = (x.trade_date >= "2026-01-01").astype(float)
    x["ln_t_2026"] = x.ln_t * x.y2026
    fe = pd.get_dummies(x.issuer_id, prefix="fe", drop_first=True, dtype=float)
    X = sm.add_constant(pd.concat([x[["ln_t", "y2026", "ln_t_2026"]], fe], axis=1))
    m = sm.OLS(x.vs_bucket, X).fit(cov_type="cluster", cov_kwds={"groups": pd.factorize(x.deal)[0]})
    ln2 = np.log(2)
    return {"n": int(m.nobs), "deals": int(x.deal.nunique()), "r2": round(m.rsquared, 3),
            "per_doubling_before": round(m.params.ln_t * ln2, 1), "per_doubling_before_se": round(m.bse.ln_t * ln2, 1),
            "per_doubling_change_2026": round(m.params.ln_t_2026 * ln2, 1), "per_doubling_change_se": round(m.bse.ln_t_2026 * ln2, 1),
            "p_change": round(m.pvalues.ln_t_2026, 3)}


def deal_regressions(dl):
    """Deal level, within issuer: can borrowing, AI heat, time or deal size be told apart?"""
    d = dl[dl.issuer_id.isin(IG4)].dropna(subset=["excess_slope30"]).copy()
    d["days"] = (d.date - pd.Timestamp("2024-01-01")).dt.days / 365
    d["cum_100bn"] = d.cum_before_bn / 100
    d["ln_size"] = np.log(d.size_bn)
    fe = pd.get_dummies(d.issuer_id, prefix="fe", drop_first=True, dtype=float)
    out = {}
    for name, cols in {"time": ["days"], "borrowed": ["cum_100bn"], "size": ["ln_size"], "nvda": ["nvda_rel"],
                       "borrowed_time": ["cum_100bn", "days"], "nvda_time": ["nvda_rel", "days"]}.items():
        X = sm.add_constant(pd.concat([d[cols], fe], axis=1))
        m = sm.OLS(d.excess_slope30, X).fit()
        out[name] = {"n": int(m.nobs), "r2": round(m.rsquared, 2),
                     "coef": {c: [round(m.params[c], 1), round(m.bse[c], 1), round(m.pvalues[c], 3)] for c in cols}}
    return out


# ---------------------------------------------------------------- AI heat
def ai_beta(adj):
    r = np.log(adj).diff()
    ai = r["NVDA"] - r["SPY"]
    out = {}
    for iid, (_, tk) in ISSUERS.items():
        y = r[tk].dropna()
        betas = {}
        for dt in y.index[y.index >= pd.Timestamp("2022-01-01")][::5]:
            w = pd.DataFrame({"y": r[tk], "m": r["SPY"], "a": ai}).loc[:dt].tail(252).dropna()
            if len(w) >= 120:
                betas[dt] = sm.OLS(w.y, sm.add_constant(w[["m", "a"]])).fit().params["a"]
        out[iid] = pd.Series(betas)
    return out


# ---------------------------------------------------------------- scenarios
def scenarios(eq, close, adj):
    commit = {x["issuer_id"]: x["amount_usd"] + (x.get("subsequent_usd") or 0)
              for x in json.loads((RAW / "commitments.json").read_text())["items"]}
    tr = lambda tk: adj[tk].dropna().iloc[-1] / adj[tk].loc[:CHATGPT_DAY].dropna().iloc[-1]   # total return since ChatGPT
    spy_x = tr("SPY")
    rows = []
    for iid, (name, tk) in ISSUERS.items():
        n = eq[iid].iloc[-1]
        px_now = close[tk].dropna().iloc[-1]
        has_pre = iid != "coreweave"
        px_pre = close[tk].loc[:CHATGPT_DAY].dropna().iloc[-1] if has_pre else np.nan
        mkt_only = spy_x / tr(tk) if has_pre else np.nan   # value had its total return only matched the S&P 500's
        nov22 = px_pre / px_now if has_pre else np.nan
        lease_face = commit.get(iid, 0)
        F_debt, F_ops = n.F, n.F + n.op_lease
        F_all = F_ops + lease_face * LEASE_PV
        row = {"issuer_id": iid, "name": name, "as_of": eq[iid].index[-1].strftime("%Y-%m-%d"),
               "E": n.E, "debt": n.F, "op_lease": n.op_lease, "lease_face": lease_face, "lease_pv": lease_face * LEASE_PV,
               "sigE": n.sigE, "sV": n.sV, "r": n.r5, "px_now": px_now, "px_pre": px_pre, "spy_x": spy_x,
               "mkt_only_ratio": mkt_only, "nov22_ratio": nov22,
               "value_added_share": 1 - nov22 if has_pre else np.nan,
               "value_added_net_share": 1 - mkt_only if has_pre else np.nan,
               "spr_now": n.spr5}
        for lab, ratio in [("now", 1.0), ("mkt", mkt_only), ("nov22", nov22)]:
            for flab, F in [("debt", F_debt), ("ops", F_ops), ("all", F_all)]:
                for lgd in (0.4, 0.6):
                    row[f"spr_{lab}_{flab}_lgd{int(lgd * 100)}"] = scenario_spread(n.E * ratio, F, n.sV, n.r5, lgd) if not np.isnan(ratio) else np.nan
        row["cushion_now"] = n.E / F_all
        row["cushion_mkt"] = n.E * mkt_only / F_all if has_pre else np.nan
        rows.append(row)
    return pd.DataFrame(rows)


# ---------------------------------------------------------------- export helpers
def ser(s, nd=2, fmt="%Y-%m-%d"):
    s = s.dropna()
    return [[i.strftime(fmt), round(float(v), nd)] for i, v in s.items()]


def clean(o):
    if isinstance(o, dict):
        return {k: clean(v) for k, v in o.items()}
    if isinstance(o, list):
        return [clean(v) for v in o]
    if isinstance(o, (float, np.floating)):
        return None if not np.isfinite(o) else round(float(o), 6)
    if isinstance(o, np.integer):
        return int(o)
    if isinstance(o, np.bool_):
        return bool(o)
    if isinstance(o, pd.Timestamp):
        return o.strftime("%Y-%m-%d")
    return o


def main():
    close, adj = load_prices()
    fred = load_fred()
    bonds = headline_bonds()
    eq = equity_side(close, adj, fred, bonds)
    t = tranches(fred, bonds)
    dl = deal_table(t, fred)
    nvda_rel = (adj.NVDA / adj.SPY).dropna()
    nvda_rel = nvda_rel / nvda_rel.loc[:CHATGPT_DAY].iloc[-1]
    dl["nvda_rel"] = [nvda_rel.loc[:d].iloc[-1] for d in dl.date]
    creg = curve_regression(t)
    dreg = deal_regressions(dl)
    sc = scenarios(eq, close, adj)
    betas = ai_beta(adj)
    lang = pd.DataFrame(json.loads((OUT / "ai_mentions.json").read_text()))
    lang = lang[lang.form == "10-K"].sort_values("filed")
    wiki = json.loads((RAW / "wiki_pageviews.json").read_text())
    att = pd.DataFrame({a: pd.Series({pd.Timestamp(x[:4] + "-" + x[4:6] + "-01"): v for x, v in rows}) for a, rows in wiki.items()})
    att = att[["Artificial_intelligence", "ChatGPT", "Large_language_model", "Generative_artificial_intelligence"]].sum(axis=1, min_count=1)
    att = att[att.index < pd.Timestamp("2026-10-01")]
    commitments = json.loads((RAW / "commitments.json").read_text())["items"]
    offb = json.loads((RAW / "offbalance.json").read_text())["items"]
    tracked = bonds.groupby("issuer_id").amount_usd.sum() / 1e9

    weekly = lambda c: ser(fred[c].dropna().resample("W-FRI").last() * 100, 0)
    data = {
        "meta": {"built": pd.Timestamp.today().strftime("%Y-%m-%d"), "price_last": close.dropna(how="all").index[-1].strftime("%Y-%m-%d"),
                 "fred_last": fred.ig_oas.dropna().index[-1].strftime("%Y-%m-%d"), "lgd": LGD, "lease_pv": round(LEASE_PV, 3),
                 "chatgpt": CHATGPT_DAY.strftime("%Y-%m-%d")},
        "issuers": [{"id": k, "name": v[0], "ticker": v[1]} for k, v in ISSUERS.items()],
        "tranches": t.assign(trade_date=t.trade_date.dt.strftime("%Y-%m-%d"), maturity_date=t.maturity_date.dt.strftime("%Y-%m-%d"))[
            ["issuer_id", "trade_date", "maturity_date", "name", "tenor_years", "coupon_pct", "spread", "spread_bp", "ytm_pct", "amount_usd",
             "bucket_label", "bucket_oas", "rating_index", "rating_oas", "vs_bucket", "vs_rating", "group", "price_assumed", "source_url", "cusip"]].to_dict("records"),
        "deals": dl.assign(date=dl.date.dt.strftime("%Y-%m-%d")).to_dict("records"),
        "curve_regression": creg,
        "deal_regressions": dreg,
        "equity": {i: {"spr5": ser(df.spr5.clip(lower=0.01).loc["2022-12-01":], 1)} for i, df in eq.items()},
        "scenarios": sc.to_dict("records"),
        "index": {k: weekly(k) for k in ["ig_oas", "aa_oas", "bbb_oas", "hy_oas", "c3_5", "c15p"]},
        "index_now": {k: round(at(fred, k, fred.index[-1]) * 100) for k in ["aaa_oas", "aa_oas", "a_oas", "bbb_oas", "bb_oas", "b_oas", "hy_oas", "ig_oas"]},
        "nvda_rel": ser(nvda_rel.resample("W-FRI").last().loc["2023-06-01":], 2),
        "ai_beta": {i: ser(s.loc["2022-12-01":], 2) for i, s in betas.items() if i == "oracle"},
        "ai_beta_ends": {i: [round(float(s.iloc[0]), 2), round(float(s.iloc[-1]), 2)] for i, s in betas.items()},
        "commitments": commitments, "offbalance": offb,
        "tracked_bn": tracked.round(2).to_dict(),
        "cum_borrowed": ser((bonds.set_index("trade_date").amount_usd / 1e9).sort_index().cumsum()
                            .groupby(level=0).last().resample("W-FRI").last().ffill(), 1),
    }
    (OUT / "story_data.json").write_text(json.dumps(clean(data), separators=(",", ":")))

    pd.set_option("display.width", 240, "display.max_columns", 40)
    print(dl[["issuer_id", "date", "size_bn", "s5", "rating_oas", "s5_vs_rating", "s5_ratio", "s30", "mkt_long", "s30_vs_market", "s30_ratio", "excess_slope30"]].round(2).to_string())
    print("curve regression", creg)
    for k, v in dreg.items():
        print("deal reg", k, v)
    print(sc[["name", "E", "debt", "op_lease", "lease_pv", "sigE", "sV", "spr_now", "value_added_share", "value_added_net_share",
              "spr_mkt_debt_lgd60", "spr_mkt_all_lgd60", "spr_nov22_debt_lgd60", "spr_nov22_all_lgd60", "spr_nov22_all_lgd40", "spr_now_all_lgd60", "cushion_now", "cushion_mkt"]].round(3).to_string())
    o = eq["oracle"]
    print("oracle path", [(d.strftime("%Y-%m"), round(v, 1), round(f / 1e9)) for d, v, f in zip(o.index[::8], o.spr5[::8], o.F[::8])][-14:])
    print("betas end", {i: round(s.iloc[-1], 2) for i, s in betas.items()}, "start", {i: round(s.iloc[0], 2) for i, s in betas.items()})


if __name__ == "__main__":
    main()
