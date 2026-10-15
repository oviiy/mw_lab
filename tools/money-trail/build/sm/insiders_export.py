"""Form 4 signals -> JSON: open-market filings, cluster buys, event study from the filing date, insider profiles."""
from __future__ import annotations

import re
import shutil
import warnings
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd

from .congress_export import _event, _f, _write, excess_paths

PRE, POST = 20, 250
HORIZONS = {"r1": 21, "r3": 63, "r6": 126, "r12": 250}   # trading days after day 0
ROLES = ["ceo_cfo", "officer", "director", "owner10", "other"]
CAPS = [("small", 2e9), ("mid", 1e10), ("large", float("inf"))]
_TOP = re.compile(r"\b(ceo|cfo|co-ceo|chief executive|chief financial|principal executive|principal financial)\b", re.I)
_SYMBOL = re.compile(r"^[A-Z][A-Z0-9]{0,5}([.-][A-Z]{1,2})?$")


@dataclass(frozen=True)
class ClusterRule:
    window_days: int = 30
    min_insiders: int = 3
    min_value: float = 100_000


def role_group(rel: str, title: str) -> str:
    rel, title = rel or "", title or ""
    if _TOP.search(title):
        return "ceo_cfo"
    if "O" in rel:
        return "officer"
    if "D" in rel:
        return "director"
    if "T" in rel:
        return "owner10"
    return "other"


def resolve_tickers(tx: pd.DataFrame, ticker_cik: dict[str, int]) -> pd.Series:
    """Issuer CIK -> current ticker from SEC's company_tickers.json (first listed = primary class), preferring the
    symbol the filer reported when it belongs to the same CIK. Delisted issuers keep their reported symbol unless
    that symbol now belongs to another company (reused tickers would attach the wrong price history)."""
    by_cik: dict[int, list[str]] = {}
    for t, c in ticker_cik.items():
        by_cik.setdefault(int(c), []).append(t.replace(".", "-"))
    owner = {t.replace(".", "-"): int(c) for t, c in ticker_cik.items()}
    cache: dict[tuple, str | None] = {}

    def one(cik, sym):
        key = (cik, sym)
        if key not in cache:
            s = (sym or "").upper().replace(".", "-").strip()
            lst = by_cik.get(int(cik), []) if pd.notna(cik) else []
            if s and s in lst:
                cache[key] = s
            elif lst:
                cache[key] = lst[0]
            elif s and _SYMBOL.match(s) and s not in owner and s not in ("NONE", "NA", "N-A"):
                cache[key] = s
            else:
                cache[key] = None
        return cache[key]

    return pd.Series([one(c, s) for c, s in zip(tx["issuer_cik"].values, tx["symbol"].values)], index=tx.index, dtype=object)


def filings(tx: pd.DataFrame) -> pd.DataFrame:
    """Open-market purchases (P) and sales (S) collapsed to one row per filing and code, with dollar value and VWAP."""
    t = tx[tx["code"].isin(["P", "S"]) & (tx["shares"] > 0)].copy()
    t["value"] = t["shares"] * t["price"].where(t["price"] > 0)
    g = t.groupby(["accession", "code"], sort=False)
    out = g.agg(filing_date=("filing_date", "first"), trans_date=("trans_date", "min"), last_date=("trans_date", "max"),
                issuer_cik=("issuer_cik", "first"), issuer_name=("issuer_name", "first"), ticker=("ticker", "first"),
                owner_cik=("owner_cik", "first"), owner_name=("owner_name", "first"), rel=("rel", "first"),
                title=("title", "first"), n_owners=("n_owners", "first"), plan=("plan", "max"), shares=("shares", "sum"),
                value=("value", "sum"), owned_after=("owned_after", "last"), direct=("direct", "first")).reset_index()
    out["value"] = out["value"].where(out["value"] > 0)
    out["price"] = out["value"] / out["shares"]
    out["role"] = [role_group(r, ti) for r, ti in zip(out["rel"], out["title"])]
    # Filer typos: trade dates after the filing, or years before the data set; and implausible values.
    ok = (pd.to_datetime(out["trans_date"]) <= pd.to_datetime(out["filing_date"])) & \
         (pd.to_datetime(out["trans_date"]) >= pd.to_datetime(out["filing_date"]) - pd.Timedelta(days=730)) & \
         ~(out["value"] > 5e9)
    return out[ok].sort_values(["filing_date", "accession"]).reset_index(drop=True)


def find_clusters(buys: pd.DataFrame, rule: ClusterRule = ClusterRule()) -> pd.DataFrame:
    """Cluster buy: >= min_insiders distinct insiders with open-market purchases whose trade dates fall within
    `window_days` calendar days (inclusive) and whose combined value >= min_value. Buys are replayed in filing order
    so a cluster is dated by the filing that completes it (when it became public). 10b5-1 plan buys never count,
    nor do issuers with no ticker.
    Later buys within `window_days` of the cluster's last trade join it instead of starting a new one.
    Returns one row per member filing with columns cluster, event_date and the filing's columns."""
    # Issuers without a trading symbol (non-traded REITs and interval funds) can't be bought on the market.
    b = buys[(buys["code"] == "P") & (buys["plan"] == 0) & buys["value"].notna() & buys["ticker"].notna()]
    b = b.sort_values(["filing_date", "trans_date", "accession"])
    w = timedelta(days=rule.window_days)
    rows = []
    for cik, g in b.groupby("issuer_cik", sort=False):
        known: list[tuple] = []
        active = None   # [cluster id, last trade date]
        for r in g.itertuples():
            if active is not None and r.trans_date <= active[1] + w:
                rows.append((active[0], active[2], r.Index))
                active[1] = max(active[1], r.trans_date)
                continue
            active = None
            known.append((r.trans_date, r.owner_cik, r.value, r.Index))
            # any window of `window_days` that contains this buy (a late filer can complete an earlier window)
            win = None
            for x in sorted({k[0] for k in known if r.trans_date - w <= k[0] <= r.trans_date}):
                cand = [k for k in known if x <= k[0] <= x + w]
                if len({k[1] for k in cand}) >= rule.min_insiders and sum(k[2] for k in cand) >= rule.min_value:
                    win = cand
                    break
            if win:
                cid = f"{int(cik)}-{r.filing_date.isoformat()}"
                active = [cid, max(k[0] for k in win), r.filing_date]
                rows += [(cid, r.filing_date, k[3]) for k in win]
                known = []
    if not rows:
        return b.iloc[:0].assign(cluster=pd.Series(dtype=str), event_date=pd.Series(dtype=object))
    m = pd.DataFrame(rows, columns=["cluster", "event_date", "_i"])
    return m.join(b, on="_i").drop(columns="_i").reset_index(drop=True)


def cap_bucket(mcap) -> str | None:
    if mcap is None or not np.isfinite(mcap) or mcap <= 0:
        return None
    return next(name for name, hi in CAPS if mcap < hi)


def market_caps(events: pd.DataFrame, shares_out: pd.DataFrame) -> pd.Series:
    """Shares outstanding (latest report on or before the date, else the earliest) x the price insiders paid.
    Not Yahoo's close: that is split-adjusted, so a later 1:50 reverse split would inflate the cap 50-fold, while
    both the Form 4 price and the reported share count are as of the time."""
    so = {t: g.sort_values("end") for t, g in shares_out.groupby("ticker")} if len(shares_out) else {}
    out = []
    for t, d, px in zip(events["ticker"], pd.to_datetime(events["event_date"]), events["price"]):
        s = so.get(t)
        if s is None or not px or not np.isfinite(px):
            out.append(np.nan)
            continue
        i = s["end"].searchsorted(d, side="right") - 1
        out.append(s["shares"].iloc[max(i, 0)] * px)
    return pd.Series(out, index=events.index, dtype=float)


def winsorize(paths: np.ndarray, q: float = 0.001) -> np.ndarray:
    """Clip each event day's cross-section to its [q, 1-q] quantiles: one bad price print in a penny stock can
    otherwise move the mean of tens of thousands of events."""
    if len(paths) < 2:
        return paths
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        lo, hi = np.nanquantile(paths, q, axis=0), np.nanquantile(paths, 1 - q, axis=0)
    return np.clip(paths, lo, hi)


def _ev(paths: np.ndarray) -> dict:
    return _event(winsorize(paths), PRE)


def _hits(r: pd.Series) -> tuple:
    v = r.dropna()
    return (_f((v > 0).mean(), 3) if len(v) else None), int(len(v))


def _frow(r, pages: set[int]) -> list:
    """Compact filing row: [filed, traded, owner cik, owner, role, code, shares, price, value, plan, r3, r12, has page]."""
    return [r.filing_date.isoformat(), r.trans_date.isoformat(), int(r.owner_cik), r.owner_name, r.role, r.code,
            _f(r.shares, 0), _f(r.price, 2), _f(r.value, 0), int(r.plan), _f(r.r3), _f(r.r12), int(r.owner_cik) in pages]


ROW_KEYS = ["f", "d", "c", "nm", "role", "k", "sh", "px", "v", "plan", "r3", "r12", "pg"]
PERSON_KEYS = ["f", "d", "role", "k", "sh", "px", "v", "plan", "r3", "r12", "t"]   # the insider is the page itself


def _prow(r) -> list:
    return [r.filing_date.isoformat(), r.trans_date.isoformat(), r.role, r.code, _f(r.shares, 0), _f(r.price, 2), _f(r.value, 0),
            int(r.plan), _f(r.r3), _f(r.r12), r.ticker]


def export_insiders(tx: pd.DataFrame, prices: pd.DataFrame, shares_out: pd.DataFrame, out_dir: Path,
                    linked_tickers: set[str], rule: ClusterRule = ClusterRule(), *, today: date | None = None,
                    max_people: int = 1200, ticker_rows: int = 40, person_rows: int = 100, cluster_list: int = 400,
                    person_companies: int = 25) -> dict:
    """tx: one row per non-derivative Form 4 transaction (sm.insiders.COLS + ticker)."""
    out = Path(out_dir) / "insiders"
    shutil.rmtree(out, ignore_errors=True)
    today = today or date.today()
    f = filings(tx)
    px = prices.pivot_table(index="date", columns="ticker", values="adj_close", aggfunc="last").sort_index().ffill() \
        if len(prices) else pd.DataFrame()
    paths, _ = excess_paths(f.assign(ticker=f["ticker"].fillna("")), px, "filing_date", days=POST, pre=PRE)
    for col, h in HORIZONS.items():
        f[col] = paths[:, PRE + h]
    cl = find_clusters(f, rule)
    ev = cl.groupby("cluster", sort=False).agg(event_date=("event_date", "first"), ticker=("ticker", "first"),
                                              price=("price", "median")).reset_index()
    ev["mcap"] = market_caps(ev, shares_out)
    ev["cap"] = ev["mcap"].map(cap_bucket)
    ev_paths, _ = excess_paths(ev.assign(ticker=ev["ticker"].fillna("")), px, "event_date", days=POST, pre=PRE)
    for col, h in HORIZONS.items():
        ev[col] = ev_paths[:, PRE + h]
    buys = (f["code"] == "P") & (f["plan"] == 0)
    sells = (f["code"] == "S")

    # ---- people: everyone in a cluster, then the most active open-market buyers, then the biggest sellers ----
    in_cl = set(cl["owner_cik"].astype(int))
    bstats = f[buys].groupby("owner_cik").agg(nb=("value", "size"), vb=("value", "sum"))
    sstats = f[sells & (f["plan"] == 0)].groupby("owner_cik")["value"].sum()
    ranked = list(in_cl) + [int(c) for c in bstats.sort_values(["nb", "vb"], ascending=False).index if int(c) not in in_cl]
    ranked += [int(c) for c in sstats.sort_values(ascending=False).index]
    pages = set(list(dict.fromkeys(ranked))[:max_people])

    other_codes = tx[tx["owner_cik"].isin(pages) & ~tx["code"].isin(["P", "S"])].groupby(["owner_cik", "code"]).size()
    summaries = []
    for cik, g in f[f["owner_cik"].isin(pages)].groupby("owner_cik"):
        cik = int(cik)
        gb = g[(g["code"] == "P") & (g["plan"] == 0)]
        gs = g[g["code"] == "S"]
        hits = {f"hit{k[1:]}": _hits(gb[k]) for k in ("r3", "r6", "r12")}
        last = g.iloc[-1]
        cos = (g.groupby(["issuer_cik"]).agg(t=("ticker", "first"), n=("issuer_name", "first"), title=("title", "last"),
                                             role=("role", "last"), first=("filing_date", "min"), last=("filing_date", "max"),
                                             buys=("code", lambda s: int((s == "P").sum())), sells=("code", lambda s: int((s == "S").sum())))
               .sort_values("last", ascending=False).reset_index())
        s = {"c": cik, "nm": last.owner_name, "role": last.role, "t": last.ticker, "co": last.issuer_name,
             "buys": int(len(gb)), "sells": int(len(gs)), "vb": _f(gb["value"].sum(), 0), "vs": _f(gs["value"].sum(), 0),
             "hit3": hits["hit3"][0], "hit6": hits["hit6"][0], "hit12": hits["hit12"][0], "n3": hits["hit3"][1],
             "last": g["filing_date"].max().isoformat(), "cl": int(cik in in_cl)}
        summaries.append(s)
        _write(out / "people" / f"{cik}.json", {
            **s, "n12": hits["hit12"][1], "n6": hits["hit6"][1],
            "avg": {k: _f(gb[k].mean()) for k in ("r3", "r6", "r12")},
            "avg_sell": {k: _f(gs[gs["plan"] == 0][k].mean()) for k in ("r3", "r6", "r12")},
            "plan_sells": int((gs["plan"] == 1).sum()),
            "companies": [{"cik": int(r.issuer_cik), "t": r.t, "n": r.n, "title": r.title or "", "role": r.role,
                           "first": r.first.isoformat(), "last": r.last.isoformat(), "buys": r.buys, "sells": r.sells,
                           "linked": r.t in linked_tickers} for r in cos.head(person_companies).itertuples()],
            "n_companies": int(len(cos)),
            "other": {k: int(v) for k, v in other_codes.loc[cik].items()} if cik in other_codes.index.get_level_values(0) else {},
            # mean path only (the band of a handful of trades is mostly noise, and it triples the file size)
            "event_buy": {"mean": eb["mean"], "n": eb["n"]} if (eb := _ev(paths[gb.index]))["n"] >= 3 else None,
            "clusters": sorted(set(cl.loc[cl["owner_cik"] == cik, "cluster"])),
            "keys": PERSON_KEYS,
            "rows": [_prow(r) for r in g.iloc[::-1].head(person_rows).itertuples()],
            "n_rows": int(len(g)),
        })

    # ---- clusters ----
    ev_by = ev.set_index("cluster")
    clusters = []
    for cid, g in cl.groupby("cluster", sort=False):
        e = ev_by.loc[cid]
        mem = g.groupby("owner_cik").agg(nm=("owner_name", "first"), role=("role", "first"), v=("value", "sum"), d=("trans_date", "min"))
        clusters.append({
            "id": cid, "t": e.ticker, "n": g["issuer_name"].iloc[0], "d": e.event_date.isoformat(),
            "s": g["trans_date"].min().isoformat(), "e": g["trans_date"].max().isoformat(),
            "k": int(len(mem)), "v": _f(g["value"].sum(), 0), "cap": e.cap, "mcap": _f(e.mcap, -6),
            "linked": e.ticker in linked_tickers, **{c: _f(e[c]) for c in HORIZONS},
            "m": [{"c": int(c), "nm": r.nm, "role": r.role, "v": _f(r.v, 0), "d": r.d.isoformat(), "pg": int(c) in pages}
                  for c, r in mem.sort_values("v", ascending=False).iterrows()],
        })
    clusters.sort(key=lambda c: c["d"], reverse=True)

    # ---- tickers (stock-page markers): only for stocks that have a page ----
    nt = 0
    for t, g in f[f["ticker"].isin(linked_tickers)].groupby("ticker"):
        g = g.iloc[::-1]
        _write(out / "tickers" / f"{t}.json", {
            "t": t, "keys": ROW_KEYS, "rows": [_frow(r, pages) for r in g.head(ticker_rows).itertuples()],
            "n": int(len(g)), "buys": int(((g["code"] == "P") & (g["plan"] == 0)).sum()), "sells": int((g["code"] == "S").sum()),
            "plan_sells": int(((g["code"] == "S") & (g["plan"] == 1)).sum()),
            "vb": _f(g.loc[(g["code"] == "P") & (g["plan"] == 0), "value"].sum(), 0), "vs": _f(g.loc[g["code"] == "S", "value"].sum(), 0),
            "clusters": [c for c in clusters if c["t"] == t][:10],
        })
        nt += 1

    # ---- index ----
    def evs(mask):
        return _ev(paths[np.asarray(mask)])

    ev_cap = {c: _ev(ev_paths[(ev["cap"] == c).values]) for c, _ in CAPS}
    by_role = {r: evs(buys & (f["role"] == r)) for r in ROLES[:4]}
    recent_cut = (pd.Timestamp(today) - pd.Timedelta(days=90)).date()
    big = f[buys & (f["filing_date"] >= recent_cut)].sort_values("value", ascending=False).head(80)
    month = pd.to_datetime(f["filing_date"]).dt.strftime("%Y-%m")
    mon = pd.DataFrame({"m": month, "b": buys, "s0": sells & (f["plan"] == 0), "s1": sells & (f["plan"] == 1)}).groupby("m").sum()
    mon_cl = ev.assign(m=pd.to_datetime(ev["event_date"]).dt.strftime("%Y-%m")).groupby("m").size()
    top = sorted([s for s in summaries if s["n3"] >= 5], key=lambda s: (s["hit3"] or 0, s["n3"]), reverse=True)[:150]
    wp = winsorize(ev_paths)
    hz = {c: {"mean": _f(np.nanmean(wp[:, PRE + h])) if ev[c].notna().any() else None, "hit": _f((ev[c].dropna() > 0).mean(), 3),
              "n": int(ev[c].notna().sum())} for c, h in HORIZONS.items()}
    index = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "rule": {"window": rule.window_days, "insiders": rule.min_insiders, "value": rule.min_value},
        "stats": {"filings": int(tx["accession"].nunique()), "tx": int(len(tx)), "buys": int(buys.sum()), "sells": int(sells.sum()),
                  "plan_sell_share": _f((f.loc[sells, "plan"] == 1).mean(), 3), "clusters": int(len(ev)),
                  "insiders": int(f["owner_cik"].nunique()), "issuers": int(f["issuer_cik"].nunique()),
                  "first_filing": f["filing_date"].min().isoformat() if len(f) else None,
                  "latest_filing": f["filing_date"].max().isoformat() if len(f) else None,
                  "buy_value": _f(f.loc[buys, "value"].sum(), 0), "sell_value": _f(f.loc[sells, "value"].sum(), 0)},
        "horizons": hz,
        "clusters": clusters[:cluster_list],
        "big": [_frow(r, pages) + [r.ticker, r.issuer_name, r.ticker in linked_tickers] for r in big.itertuples()],
        "big_keys": ROW_KEYS + ["t", "n", "linked"],
        "top": top,
        "monthly": {"months": list(mon.index), "buy": [int(v) for v in mon["b"]], "sell": [int(v) for v in mon["s0"]],
                    "plan": [int(v) for v in mon["s1"]], "clusters": [int(mon_cl.get(m, 0)) for m in mon.index]},
        "event": {"days": list(range(-PRE, POST + 1)), "cluster": _ev(ev_paths), "buy": evs(buys),
                  "sell": evs(sells & (f["plan"] == 0)), "sell_plan": evs(sells & (f["plan"] == 1)), **{f"cap_{k}": v for k, v in ev_cap.items()},
                  **{f"role_{k}": v for k, v in by_role.items()}},
    }
    _write(out / "index.json", index)
    return {"filings": int(len(f)), "clusters": int(len(ev)), "people": len(summaries), "tickers": nt}
