"""Position-change classification, manager style metrics, cross-filer stock panel, crowding score."""
from __future__ import annotations

import duckdb
import numpy as np
import pandas as pd

KINDS = ("new", "add", "trim", "exit", "hold")


def classify(prev_shares: pd.Series, curr_shares: pd.Series, factor: pd.Series | None, thr: float) -> pd.DataFrame:
    idx = prev_shares.index.union(curr_shares.index)
    f = factor.reindex(idx).fillna(1.0) if factor is not None else 1.0
    p = prev_shares.reindex(idx).fillna(0.0) * f
    c = curr_shares.reindex(idx).fillna(0.0)
    ratio = np.where(p > 0, c / np.where(p > 0, p, 1.0) - 1.0, np.nan)
    kind = np.select([(p == 0) & (c > 0), (p > 0) & (c == 0), ratio > thr, ratio < -thr],
                     ["new", "exit", "add", "trim"], default="hold")
    return pd.DataFrame({"prev_adj": p, "curr": c, "chg": c - p, "kind": kind}, index=idx)


def hhi(w: pd.Series) -> float:
    return float((w ** 2).sum())


def top_n_weight(w: pd.Series, n: int = 10) -> float:
    return float(w.nlargest(n).sum())


def turnover(cls: pd.DataFrame, px_curr: pd.Series, px_prev: pd.Series, v_prev: float, v_curr: float) -> float | None:
    px = px_curr.reindex(cls.index).fillna(px_prev.reindex(cls.index))
    buys = float((cls["chg"].clip(lower=0) * px).sum())
    sells = float(((-cls["chg"]).clip(lower=0) * px).sum())
    avg = (v_prev + v_curr) / 2
    return min(buys, sells) / avg if avg > 0 else None


def _factor(fac_wide: pd.DataFrame, cusips: pd.Index, a: int, b: int) -> pd.Series:
    """Cumulative split factor per cusip over periods (a, b]."""
    if fac_wide is None or fac_wide.empty:
        return pd.Series(1.0, index=cusips)
    cols = [c for c in range(a + 1, b + 1) if c in fac_wide.columns]
    if not cols:
        return pd.Series(1.0, index=cusips)
    return fac_wide.reindex(index=cusips, columns=cols).fillna(1.0).prod(axis=1)


def manager_history(hm: pd.DataFrame, n_periods: int, fac_wide: pd.DataFrame, thr: float):
    keys = ("value", "n", "top10", "hhi", "turnover", "hold_q")
    series = {k: [None] * n_periods for k in keys}
    changes: dict[int, tuple[pd.DataFrame, int]] = {}
    by_pi = {int(pi): g.groupby("cusip")[["shares", "value_usd"]].sum() for pi, g in hm.groupby("pi")}
    prev_pi, run = None, pd.Series(dtype=float)
    for pi in range(n_periods):
        g = by_pi.get(pi)
        if g is None or g["value_usd"].sum() <= 0:
            continue
        v = float(g["value_usd"].sum())
        w = g["value_usd"] / v
        series["value"][pi], series["n"][pi] = v, int(len(g))
        series["top10"][pi], series["hhi"][pi] = top_n_weight(w), hhi(w)
        if prev_pi is not None:
            p = by_pi[prev_pi]
            f = _factor(fac_wide, g.index.union(p.index), prev_pi, pi)
            cls = classify(p["shares"], g["shares"], f, thr)
            px_curr = g["value_usd"] / g["shares"]
            px_prev = (p["value_usd"] / p["shares"]) / f.reindex(p.index).fillna(1.0)
            series["turnover"][pi] = turnover(cls, px_curr, px_prev, float(p["value_usd"].sum()), v)
            changes[pi] = (cls, prev_pi)
        run = run.reindex(g.index).fillna(0) + 1 if prev_pi == pi - 1 else pd.Series(1.0, index=g.index)
        series["hold_q"][pi] = float((w * run.reindex(w.index)).sum())
        prev_pi = pi
    return series, changes


def stock_panel(h_eq: pd.DataFrame, filers: pd.DataFrame, factors: pd.DataFrame, curated: set[int], thr: float):
    con = duckdb.connect()
    con.register("h", h_eq[["cik", "pi", "cusip", "shares", "value_usd"]])
    con.register("filers", filers[["cik", "pi"]].drop_duplicates())
    con.register("f", factors[["cusip", "pi", "factor"]].astype({"factor": float}) if len(factors)
                 else pd.DataFrame({"cusip": pd.Series(dtype=str), "pi": pd.Series(dtype="int64"),
                                    "factor": pd.Series(dtype=float)}))
    con.register("cur", pd.DataFrame({"cik": pd.Series(sorted(curated), dtype="int64")}))
    holders = con.execute("""SELECT cusip, pi, count(*) AS holders, sum(shares) AS shares, sum(value_usd) AS value
                             FROM h WHERE shares > 0 GROUP BY 1, 2""").df()
    flows = con.execute(f"""
        WITH both_filed AS (
            SELECT a.cik, a.pi FROM filers a JOIN filers b ON a.cik = b.cik AND b.pi = a.pi - 1),
        pairs AS (
            SELECT coalesce(c.cik, p.cik) AS cik, coalesce(c.pi, p.pi + 1) AS pi, coalesce(c.cusip, p.cusip) AS cusip,
                   c.shares AS cs, c.value_usd AS cv, p.shares AS ps, p.value_usd AS pv
            FROM h c FULL OUTER JOIN h p ON c.cik = p.cik AND c.cusip = p.cusip AND c.pi = p.pi + 1),
        x AS (
            SELECT pr.cik, pr.pi, pr.cusip,
                   coalesce(pr.ps, 0) * coalesce(f.factor, 1) AS prev_adj, coalesce(pr.cs, 0) AS curr,
                   coalesce(pr.cv / nullif(pr.cs, 0), pr.pv / nullif(pr.ps, 0) / coalesce(f.factor, 1)) AS px
            FROM pairs pr JOIN both_filed bo ON bo.cik = pr.cik AND bo.pi = pr.pi
            LEFT JOIN f ON f.cusip = pr.cusip AND f.pi = pr.pi),
        k AS (
            SELECT *, CASE WHEN prev_adj = 0 AND curr > 0 THEN 'new'
                           WHEN prev_adj > 0 AND curr = 0 THEN 'exit'
                           WHEN curr / prev_adj - 1 > {thr} THEN 'add'
                           WHEN curr / prev_adj - 1 < -{thr} THEN 'trim'
                           ELSE 'hold' END AS kind
            FROM x)
        SELECT k.cusip, k.pi, k.kind, CASE WHEN cur.cik IS NULL THEN 'other' ELSE 'curated' END AS grp,
               sum(abs(curr - prev_adj) * px) AS dollars, count(*) AS n
        FROM k LEFT JOIN cur ON cur.cik = k.cik
        WHERE kind <> 'hold'
        GROUP BY ALL
    """).df()
    return holders, flows


def crowding_scores(df: pd.DataFrame) -> pd.Series:
    r = df[["curated_holders", "pct_held", "avg_curated_w"]].rank(pct=True)
    return (r.mean(axis=1, skipna=True) * 100).round(1)
