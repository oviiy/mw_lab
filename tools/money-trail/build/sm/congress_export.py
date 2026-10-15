"""Congress trades -> JSON: per-trade excess returns after disclosure, member profiles, ticker pages, event study."""
from __future__ import annotations

import json
import math
import shutil
import warnings
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

HORIZONS = {"r1": 21, "r3": 63, "r6": 126}          # trading days after the first trading day following disclosure
EVENT_DAYS = 126
BENCH = "SPY"
PHOTO = "https://unitedstates.github.io/images/congress/225x275/{id}.jpg"


def _f(x, nd=4):
    if x is None:
        return None
    try:
        if pd.isna(x) or not math.isfinite(float(x)):
            return None
    except TypeError:
        return None
    return round(float(x), nd)


def _clean(o):
    """NaN from pandas object columns (missing ticker, party) -> None, recursively."""
    if isinstance(o, dict):
        return {k: _clean(v) for k, v in o.items()}
    if isinstance(o, list):
        return [_clean(v) for v in o]
    if isinstance(o, float) and not math.isfinite(o):
        return None
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.floating,)):
        return _clean(float(o))
    if isinstance(o, (np.bool_,)):
        return bool(o)
    return o


def _write(path: Path, obj) -> None:
    obj = _clean(obj)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":"), allow_nan=False), encoding="utf-8")


def excess_paths(trades: pd.DataFrame, px: pd.DataFrame, date_col: str, days: int = EVENT_DAYS,
                 pre: int = 0) -> tuple[np.ndarray, np.ndarray]:
    """For each trade, the cumulative excess return vs SPY from `pre` trading days before to `days` after day 0, the
    first trading day following `date_col` (column `pre` of the output). Pre-event values are the negated excess return
    from that day into day 0, so a stock that rallied into the event shows a curve rising to 0. Returns (paths [n, pre+days+1] with NaN where
    unavailable, day-0 index positions)."""
    idx = px.index
    width = pre + days + 1
    out = np.full((len(trades), width), np.nan)
    starts = np.full(len(trades), -1)
    if BENCH not in px.columns or px.empty:
        return out, starts
    bench = px[BENCH].values
    cols = {c: i for i, c in enumerate(px.columns)}
    vals = px.values
    pos = idx.searchsorted(pd.to_datetime(trades[date_col]).values, side="right")
    for k, (t, p) in enumerate(zip(trades["ticker"].values, pos)):
        if t not in cols or p >= len(idx):
            continue
        a = max(p - pre, 0)
        s = vals[a:p + days + 1, cols[t]]
        b = bench[a:p + days + 1]
        s0, b0 = vals[p, cols[t]], bench[p]
        if not np.isfinite(s0) or not np.isfinite(b0) or s0 <= 0:
            continue
        off = pre - (p - a)
        n_pre = p - a
        with np.errstate(divide="ignore", invalid="ignore"):
            # before day 0: minus the excess run-up from that day into day 0 (a ratio to day 0 would explode for
            # stocks that crashed into the event); from day 0 on: buy-and-hold excess return
            out[k, off:off + n_pre] = -((s0 / s[:n_pre]) - (b0 / b[:n_pre]))
            out[k, off + n_pre:off + len(s)] = (s[n_pre:] / s0) - (b[n_pre:] / b0)
        starts[k] = p
    return out, starts


def _event(paths: np.ndarray, at: int = 0) -> dict:
    """Mean path with a 95% normal-approximation band; `n` counts events with data at column `at` (day 0)."""
    n = np.sum(np.isfinite(paths), axis=0)
    width = paths.shape[1] if paths.ndim == 2 else EVENT_DAYS + 1
    if len(paths):
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", RuntimeWarning)   # all-NaN columns at the far end
            mean, sd = np.nanmean(paths, axis=0), np.nanstd(paths, axis=0)
    else:
        mean = sd = np.full(width, np.nan)
    half = 1.96 * sd / np.sqrt(np.maximum(n, 1))
    return {"mean": [_f(v) for v in mean], "lo": [_f(v) for v in mean - half], "hi": [_f(v) for v in mean + half],
            "n": int(n[at]) if len(n) else 0}


def _member_links(mid: str, info) -> list[dict]:
    """Biography links: the official Biographical Directory, Wikipedia and the member's own site, when known."""
    if info is None:
        return []
    out = [{"k": "bioguide", "url": f"https://bioguide.congress.gov/search/bio/{mid}"}]
    wiki = info.get("wikipedia") if hasattr(info, "get") else None
    if isinstance(wiki, str) and wiki:
        out.append({"k": "wikipedia", "url": "https://en.wikipedia.org/wiki/" + wiki.replace(" ", "_")})
    site = info.get("website") if hasattr(info, "get") else None
    if isinstance(site, str) and site:
        out.append({"k": "website", "url": site})
    return out


def _row(r, ret: dict) -> dict:
    return {"d": r.trade_date.isoformat(), "f": r.filing_date.isoformat(), "m": r.member_id, "mn": r.member_name,
            "p": r.party, "ch": r.chamber, "t": r.ticker, "a": r.asset, "at": r.asset_type, "k": r.kind, "o": r.owner,
            "lo": _f(r.amount_lo, 0), "hi": _f(r.amount_hi, 0), "lag": int((r.filing_date - r.trade_date).days),
            "desc": r.desc or "", **ret}


def export_congress(trades: pd.DataFrame, members: pd.DataFrame, prices: pd.DataFrame, stats: dict,
                    out_dir: Path, linked_tickers: set[str]) -> dict:
    """trades: one row per parsed trade with columns doc_id, filing_date, member_id, member_name, party, state_dst,
    owner, asset, ticker, asset_type, kind, partial, trade_date, notified, amount_lo, amount_hi, desc.
    members: bioguide, full, party, state, district, current, committees."""
    out = Path(out_dir) / "congress"
    shutil.rmtree(out, ignore_errors=True)
    tr = trades.sort_values(["filing_date", "trade_date"], ascending=False).reset_index(drop=True)
    if "chamber" not in tr.columns:
        tr["chamber"] = "house"
    # Filer typos (e.g. year 3031) or dates after the report was filed can't be real trade dates; drop them.
    ok = (pd.to_datetime(tr["trade_date"], errors="coerce") >= "2012-01-01") & (tr["trade_date"] <= tr["filing_date"])
    if (~ok).any():
        print(f"[congress] dropped {int((~ok).sum())} trades with impossible trade dates")
    tr = tr[ok].reset_index(drop=True)
    tr["est"] = (tr["amount_lo"].fillna(0) + tr["amount_hi"].fillna(0)) / 2
    px = prices.pivot_table(index="date", columns="ticker", values="adj_close", aggfunc="last").sort_index().ffill() \
        if len(prices) else pd.DataFrame()
    paths, _ = excess_paths(tr.assign(ticker=tr["ticker"].fillna("")), px, "filing_date")
    trade_paths, _ = excess_paths(tr.assign(ticker=tr["ticker"].fillna("")), px, "trade_date")
    for col, h in HORIZONS.items():
        tr[col] = paths[:, h]
    stock = (tr["asset_type"] == "ST") & tr["ticker"].notna()
    hit3 = np.where(tr["kind"] == "buy", tr["r3"] > 0, np.where(tr["kind"] == "sell", tr["r3"] < 0, np.nan))
    tr["hit3"] = np.where(tr["r3"].notna() & stock & tr["kind"].isin(["buy", "sell"]), hit3, np.nan)

    rows = [_row(r, {c: _f(getattr(r, c)) for c in HORIZONS}) for r in tr.itertuples()]
    mem_info = members.set_index("bioguide") if len(members) else pd.DataFrame()

    # ---- members ----
    summaries = []
    for mid, g in tr.groupby("member_id"):
        info = mem_info.loc[mid] if mid in mem_info.index else None
        gi = g.index
        tick = (g[g["ticker"].notna()].groupby("ticker")
                .agg(n=("kind", "size"), buys=("kind", lambda s: int((s == "buy").sum())), sells=("kind", lambda s: int((s == "sell").sum())),
                     est=("est", "sum")).sort_values("n", ascending=False).head(15).reset_index())
        monthly = g.assign(m=pd.to_datetime(g["trade_date"]).dt.strftime("%Y-%m")).groupby(["m", "kind"])["est"].sum().unstack(fill_value=0)
        s = {
            "id": mid, "name": g["member_name"].iloc[0], "party": g["party"].iloc[0], "state": g["state_dst"].iloc[0],
            "chamber": g["chamber"].iloc[0],
            "n": int(len(g)), "buys": int((g["kind"] == "buy").sum()), "sells": int((g["kind"] == "sell").sum()),
            "est": _f(g["est"].sum(), 0), "last": g["filing_date"].max().isoformat(),
            "hit3": _f(g["hit3"].mean(), 3), "n_hit": int(g["hit3"].notna().sum()),
            "avg_r3_buy": _f(g.loc[(g["kind"] == "buy") & (g["asset_type"] == "ST"), "r3"].mean()),
            "options": int((g["asset_type"] == "OP").sum()), "spouse": int((g["owner"] == "spouse").sum()),
            "lag": _f((pd.to_datetime(g["filing_date"]) - pd.to_datetime(g["trade_date"])).dt.days.median(), 0),
        }
        summaries.append(s)
        ev = _event(paths[gi][(g["kind"] == "buy").values & stock[gi].values])
        _write(out / "members" / f"{mid}.json", {
            **s,
            "committees": list(info["committees"]) if info is not None else [],
            "district": None if info is None or pd.isna(info["district"]) else int(info["district"]),
            "current": bool(info["current"]) if info is not None else None,
            "photo": PHOTO.format(id=mid) if info is not None else None,
            "links": _member_links(mid, info),
            "tickers": [{"t": r.ticker, "n": int(r.n), "buys": r.buys, "sells": r.sells, "est": _f(r.est, 0),
                         "linked": r.ticker in linked_tickers} for r in tick.itertuples()],
            "monthly": {"months": list(monthly.index), "buy": [_f(v, 0) for v in monthly.get("buy", pd.Series(0, index=monthly.index))],
                        "sell": [_f(v, 0) for v in monthly.get("sell", pd.Series(0, index=monthly.index))]},
            "event_buy": ev,
            "trades": [rows[i] for i in gi],
        })
    summaries.sort(key=lambda s: s["n"], reverse=True)

    # ---- tickers ----
    by_t = tr[tr["ticker"].notna()].groupby("ticker")
    tickers = []
    for t, g in by_t:
        _write(out / "tickers" / f"{t}.json", {"t": t, "trades": [rows[i] for i in g.index]})
        tickers.append({"t": t, "a": g["asset"].iloc[0], "n": int(len(g)), "buys": int((g["kind"] == "buy").sum()),
                        "sells": int((g["kind"] == "sell").sum()), "members": int(g["member_id"].nunique()),
                        "est": _f(g["est"].sum(), 0), "linked": t in linked_tickers})
    tickers.sort(key=lambda x: (x["members"], x["n"]), reverse=True)

    # ---- index ----
    buys = (tr["kind"] == "buy").values & stock.values
    sells = (tr["kind"] == "sell").values & stock.values
    monthly = tr.assign(m=pd.to_datetime(tr["trade_date"]).dt.strftime("%Y-%m")).groupby(["m", "kind"]).size().unstack(fill_value=0)
    monthly = monthly[monthly.index >= tr["filing_date"].min().strftime("%Y-%m")] if len(tr) else monthly
    chambers = tr.groupby("chamber").agg(n=("kind", "size"), members=("member_id", "nunique"))
    party = tr.groupby("party").agg(n=("kind", "size"), est=("est", "sum"), members=("member_id", "nunique"))
    index = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "stats": {**stats, "trades": int(len(tr)), "members": int(tr["member_id"].nunique()),
                  "latest_filing": tr["filing_date"].max().isoformat() if len(tr) else None,
                  "first_filing": tr["filing_date"].min().isoformat() if len(tr) else None,
                  "median_lag": _f((pd.to_datetime(tr["filing_date"]) - pd.to_datetime(tr["trade_date"])).dt.days.median(), 0),
                  "hit3": _f(tr["hit3"].mean(), 3)},
        "members": summaries,
        "recent": rows[:120],
        "tickers": tickers[:60],
        "monthly": {"months": list(monthly.index), "buy": [int(v) for v in monthly.get("buy", pd.Series(0, index=monthly.index))],
                    "sell": [int(v) for v in monthly.get("sell", pd.Series(0, index=monthly.index))]},
        "party": {p: {"n": int(r.n), "est": _f(r.est, 0), "members": int(r.members)} for p, r in party.iterrows() if p},
        "chambers": {c: {"n": int(r.n), "members": int(r.members)} for c, r in chambers.iterrows()},
        "event": {"days": list(range(EVENT_DAYS + 1)), "buy": _event(paths[buys]), "sell": _event(paths[sells]),
                  "buy_trade": _event(trade_paths[buys])},
    }
    _write(out / "index.json", index)
    return {"trades": len(tr), "members": len(summaries), "tickers": len(tickers)}
