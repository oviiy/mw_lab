"""Assemble every JSON file the front end reads (see the plan's "JSON 数据契约")."""
from __future__ import annotations

import json
import math
import shutil
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path

import jsonschema
import numpy as np
import pandas as pd

from . import schemas
from .backtest import make_rebalance, perf_stats, run_clone, trading_day_after, trading_day_on_or_before
from .config import Manager, Settings
from .metrics import crowding_scores, manager_history, stock_panel
from .prices import split_factors, wide_adj_close

EDGAR_13F = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik:010d}&type=13F-HR"
BENCH = "SPY"


class BudgetError(RuntimeError):
    pass


@dataclass
class BuildInputs:
    periods: list[date]
    holdings: pd.DataFrame
    filings: pd.DataFrame
    secmeta: pd.DataFrame
    shares_out: pd.DataFrame
    prices: pd.DataFrame


def _f(x, nd: int = 4):
    if x is None or (isinstance(x, float) and not math.isfinite(x)) or (isinstance(x, (np.floating,)) and not np.isfinite(x)):
        return None
    if pd.isna(x):
        return None
    return round(float(x), nd)


def _i(x):
    v = _f(x, 0)
    return None if v is None else int(v)


def _s(x):
    return None if x is None or (isinstance(x, float) and math.isnan(x)) or pd.isna(x) else str(x)


def _write(path: Path, obj, schema) -> None:
    jsonschema.validate(obj, schema)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":"), allow_nan=False), encoding="utf-8")


def _prepare(inp: BuildInputs):
    pidx = {p: i for i, p in enumerate(inp.periods)}
    h = inp.holdings.copy()
    h["pi"] = h["period"].map(pidx)
    h = h.dropna(subset=["pi"]).astype({"pi": int})
    meta = inp.secmeta.set_index("cusip")
    h = h.join(meta[["ticker", "name", "sector", "is_equity", "is_etf"]], on="cusip")
    h["sector"] = h["sector"].fillna("其他")
    h["ticker"] = h["ticker"].where(h["ticker"].notna(), None)
    is_eq = h["is_equity"].map(lambda v: True if v is None or pd.isna(v) else bool(v))
    eq = h[(h["put_call"] == "") & (h["shares"] > 0) & is_eq].copy()
    opts = h[h["put_call"].isin(["PUT", "CALL"])].copy()
    filers = inp.filings.assign(pi=inp.filings["period"].map(pidx)).dropna(subset=["pi"]).astype({"pi": int})
    return pidx, eq, opts, filers


def _universe(secmeta: pd.DataFrame, holders: pd.DataFrame, last_pi: int) -> pd.DataFrame:
    """One row per ticker: mapped equity cusips; if a ticker has several cusips keep the most-held one."""
    sm = secmeta[secmeta["ticker"].notna() & secmeta["is_equity"].fillna(False).astype(bool)].copy()
    latest = holders[holders["pi"] == last_pi].set_index("cusip")["holders"]
    sm["h"] = sm["cusip"].map(latest).fillna(0)
    return sm.sort_values("h", ascending=False).drop_duplicates("ticker").reset_index(drop=True)


def _shares_asof(shares_out: pd.DataFrame, ticker: str, d: date):
    s = shares_out[shares_out["ticker"] == ticker]
    s = s[s["end"] <= pd.Timestamp(d)]
    return float(s.sort_values("end")["shares"].iloc[-1]) if len(s) else None


def _weekly(series: pd.Series) -> pd.Series:
    return series.resample("W-FRI").last().dropna()


def _backtest(hm: pd.DataFrame, first_filing: dict[int, date], periods: list[date], px: pd.DataFrame, top_k: int):
    if BENCH not in px.columns or px.empty:
        return None
    idx = px.index
    reb_f, reb_i = [], []
    for pi, g in hm.groupby("pi"):
        total = float(g["value_usd"].sum())
        top = g.nlargest(top_k, "value_usd")
        pos = top.groupby(top["ticker"].fillna(""))["value_usd"].sum()
        d_f = trading_day_after(idx, first_filing[pi]) if pi in first_filing else None
        d_i = trading_day_on_or_before(idx, periods[pi])
        for day, bucket in ((d_f, reb_f), (d_i, reb_i)):
            if day is not None:
                r = make_rebalance(day, pos, total, px)
                if r is not None:
                    bucket.append(r)
    if len(reb_f) < 2 or len(reb_i) < 2:
        return None
    end = idx[-1]
    vf = run_clone(reb_f, px, end)
    start = vf.index[0]
    vi = run_clone(reb_i, px, end).loc[start:]
    vi = vi / vi.iloc[0]
    vb = px[BENCH].loc[start:end]
    vb = vb / vb.iloc[0]
    wk = pd.DataFrame({"filing": _weekly(vf), "ideal": _weekly(vi), "bench": _weekly(vb)}).dropna()
    return {
        "dates": [d.date().isoformat() for d in wk.index],
        "filing": [_f(v) for v in wk["filing"]], "ideal": [_f(v) for v in wk["ideal"]], "bench": [_f(v) for v in wk["bench"]],
        "stats": {k: {kk: _f(vv) for kk, vv in perf_stats(s).items()} for k, s in (("filing", vf), ("ideal", vi), ("bench", vb))},
        "coverage": [_f(r.coverage, 3) for r in sorted(reb_f, key=lambda r: r.date)],
    }


def export_all(inp: BuildInputs, settings: Settings, managers: list[Manager], out_dir: Path) -> dict:
    out_dir = Path(out_dir)
    for sub in ("managers", "stocks"):
        shutil.rmtree(out_dir / sub, ignore_errors=True)
    periods = inp.periods
    n, last = len(periods), len(periods) - 1
    P = [p.isoformat() for p in periods]
    thr = settings.change_threshold
    curated = {m.cik for m in managers}
    names = {m.cik: m.name for m in managers}
    pidx, eq, opts, filers = _prepare(inp)

    ticker_by_cusip = {r.cusip: r.ticker for r in inp.secmeta.itertuples() if r.ticker}
    factors = split_factors(inp.prices, ticker_by_cusip, periods)
    fac_wide = factors.pivot_table(index="cusip", columns="pi", values="factor", aggfunc="prod") if len(factors) else pd.DataFrame()
    holders, flows = stock_panel(eq[["cik", "pi", "cusip", "shares", "value_usd"]], filers[["cik", "pi"]], factors, curated, thr)
    px = wide_adj_close(inp.prices) if len(inp.prices) else pd.DataFrame()
    label = eq.drop_duplicates("cusip").set_index("cusip")
    lab = lambda c: (_s(label.at[c, "ticker"]) if c in label.index else None)  # noqa: E731
    nm = lambda c: (_s(label.at[c, "name"]) or _s(label.at[c, "issuer"])) if c in label.index else c  # noqa: E731
    sec = lambda c: (label.at[c, "sector"] if c in label.index else "其他")  # noqa: E731

    # ---- managers ----
    weights_latest: dict[int, pd.Series] = {}
    latest_changes = []           # rows for home: cik, cusip, kind, dollars
    curated_pos = []              # rows for stock pages: cik, pi, cusip, shares, w
    meta_managers = []
    flow_rows: list[list] = []          # [pi, cik, key, kind (n/a/t/x), dollars]
    flow_meta: dict[str, list] = {}     # key -> [name, sector, has stock page]
    for m in managers:
        hm = eq[eq["cik"] == m.cik]
        fm = filers[filers["cik"] == m.cik].set_index("pi")
        series, changes = manager_history(hm, n, fac_wide, thr)
        sectors = sorted(hm["sector"].unique())
        sw = []
        for pi in range(n):
            g = hm[hm["pi"] == pi]
            if g.empty:
                sw.append(None)
                continue
            w = g.groupby("sector")["value_usd"].sum() / g["value_usd"].sum()
            sw.append([_f(w.get(s, 0.0)) for s in sectors])
            gw = g.groupby("cusip")["value_usd"].sum() / g["value_usd"].sum()
            gs = g.groupby("cusip")["shares"].sum()
            curated_pos += [{"cik": m.cik, "pi": pi, "cusip": c, "shares": float(gs[c]), "w": float(gw[c])} for c in gw.index]
        frames = []
        for pi in range(n):
            g = hm[hm["pi"] == pi].groupby("cusip")["value_usd"].sum().nlargest(15)
            frames.append([{"t": lab(c) or nm(c), "v": _i(v)} for c, v in g.items()])
        # every quarter's priced changes, for the traceable flow chart (top changes by |$| per manager-quarter)
        for cpi, (ccls, cprev) in changes.items():
            cg = hm[hm["pi"] == cpi].groupby("cusip")[["shares", "value_usd"]].sum()
            pg = hm[hm["pi"] == cprev].groupby("cusip")[["shares", "value_usd"]].sum()
            px_c = (cg["value_usd"] / cg["shares"]).reindex(ccls.index)
            px_p = (pg["value_usd"] / pg["shares"]).reindex(ccls.index)
            fac = (ccls["prev_adj"] / pg["shares"].reindex(ccls.index)).fillna(1.0)
            dv = (ccls["chg"] * px_c.fillna(px_p / fac)).fillna(0.0)
            moved = ccls.assign(dv=dv)[ccls["kind"] != "hold"]
            moved = moved.reindex(moved["dv"].abs().sort_values(ascending=False).index).head(settings.holdings_per_quarter)
            for c, r in moved.iterrows():
                flow_rows.append([cpi, m.cik, lab(c) or nm(c), r.kind[0] if r.kind != "exit" else "x", _i(r.dv)])
                flow_meta.setdefault(lab(c) or nm(c), [nm(c), sec(c), bool(lab(c))])
        last_pi = max((pi for pi in range(n) if series["value"][pi] is not None), default=None)
        latest = {"period": None, "rows": [], "other_w": 0.0}
        chg = {"period": None, "prev_period": None, "rows": []}
        if last_pi is not None:
            g = hm[hm["pi"] == last_pi].groupby("cusip")[["shares", "value_usd"]].sum()
            tot = g["value_usd"].sum()
            kinds = changes[last_pi][0]["kind"] if last_pi in changes else pd.Series(dtype=str)
            top = g.nlargest(settings.holdings_per_quarter, "value_usd")
            latest = {"period": P[last_pi], "other_w": _f(1 - top["value_usd"].sum() / tot),
                      "rows": [{"c": c, "t": lab(c), "n": nm(c), "s": sec(c), "sh": _i(r.shares), "v": _i(r.value_usd),
                                "w": _f(r.value_usd / tot), "k": kinds.get(c, "hold")} for c, r in top.iterrows()]}
            weights_latest[m.cik] = g["value_usd"] / tot
            if last_pi in changes:
                cls, prev_pi = changes[last_pi]
                pg = hm[hm["pi"] == prev_pi].groupby("cusip")[["shares", "value_usd"]].sum()
                ptot = pg["value_usd"].sum()
                px_c = (g["value_usd"] / g["shares"]).reindex(cls.index)
                px_p = (pg["value_usd"] / pg["shares"]).reindex(cls.index)
                fac = (cls["prev_adj"] / pg["shares"].reindex(cls.index)).fillna(1.0)
                price = px_c.fillna(px_p / fac)
                moved = cls[cls["kind"] != "hold"].assign(dv=lambda d: d["chg"] * price.reindex(d.index))
                rows = cls.assign(dv=cls["chg"] * price, absdv=(cls["chg"] * price).abs()).sort_values("absdv", ascending=False)
                rows = rows.head(settings.changes_per_quarter)
                chg = {"period": P[last_pi], "prev_period": P[prev_pi], "rows": [
                    {"c": c, "t": lab(c), "n": nm(c), "k": r.kind, "sh0": _i(r.prev_adj), "sh": _i(r.curr), "dv": _i(r.dv),
                     "w0": _f(pg["value_usd"].get(c, 0.0) / ptot), "w": _f(g["value_usd"].get(c, 0.0) / tot)}
                    for c, r in rows.iterrows()]}
                if last_pi == last:
                    latest_changes += [{"cik": m.cik, "cusip": c, "kind": r.kind, "dv": float(r.dv)} for c, r in moved.iterrows()]
        mo = opts[(opts["cik"] == m.cik) & (opts["pi"] == last_pi)] if last_pi is not None else opts.iloc[0:0]
        mo = mo.groupby(["cusip", "put_call"])["value_usd"].sum().reset_index().sort_values("value_usd", ascending=False)
        first_filing = {int(pi): r["first_filing_date"] for pi, r in fm.iterrows()}
        bt = _backtest(hm, first_filing, periods, px, settings.holdings_per_quarter)
        city = fm["city"].iloc[-1] if len(fm) else ""
        state = fm["state"].iloc[-1] if len(fm) else ""
        doc = {
            "cik": m.cik, "name": m.name, "person": m.person, "style": m.style, "founded": m.founded, "bio": m.bio, "bio_en": m.bio_en,
            "sources": [{"label": s.label, "url": s.url} for s in m.sources]
                       + [{"label": "SEC EDGAR 13F 申报", "url": EDGAR_13F.format(cik=m.cik)}],
            "city": city, "state": state, "periods": P,
            "series": {"value": [_i(v) for v in series["value"]], "n": series["n"],
                       "top10": [_f(v) for v in series["top10"]], "hhi": [_f(v) for v in series["hhi"]],
                       "turnover": [_f(v) for v in series["turnover"]], "hold_q": [_f(v, 2) for v in series["hold_q"]]},
            "sectors": {"names": sectors, "weights": sw},
            "latest": latest, "changes": chg, "race": {"frames": frames},
            "options": [{"t": lab(r.cusip), "n": nm(r.cusip), "pc": r.put_call, "v": _i(r.value_usd)} for r in mo.itertuples()],
            "backtest": bt, "similar": [],
        }
        _write(out_dir / "managers" / f"{m.cik}.json", doc, schemas.MANAGER)
        counts = changes[last_pi][0]["kind"].value_counts() if last_pi in changes else pd.Series(dtype=int)
        meta_managers.append({"cik": m.cik, "name": m.name, "person": m.person, "style": m.style,
                              "value": _i(series["value"][last_pi]) if last_pi is not None else None,
                              "n": series["n"][last_pi] if last_pi is not None else None,
                              "period": P[last_pi] if last_pi is not None else None,
                              "top10": _f(series["top10"][last_pi]) if last_pi is not None else None,
                              "turnover": _f(series["turnover"][last_pi]) if last_pi is not None else None,
                              "top": [{"t": r["t"] or r["n"], "w": r["w"]} for r in latest["rows"][:5]],
                              "chg": {k: int(counts.get(k, 0)) for k in ("new", "add", "trim", "exit")},
                              "cagr": (bt or {}).get("stats", {}).get("filing", {}).get("cagr"),
                              "bench_cagr": (bt or {}).get("stats", {}).get("bench", {}).get("cagr")})

    # similar managers: cosine similarity of latest weight vectors (second pass, rewrite files)
    for m in managers:
        if m.cik not in weights_latest:
            continue
        a = weights_latest[m.cik]
        sims = []
        for o, b in weights_latest.items():
            if o == m.cik:
                continue
            idx = a.index.union(b.index)
            va, vb = a.reindex(idx).fillna(0).values, b.reindex(idx).fillna(0).values
            denom = np.linalg.norm(va) * np.linalg.norm(vb)
            sims.append((float(va @ vb / denom) if denom else 0.0, o))
        p = out_dir / "managers" / f"{m.cik}.json"
        doc = json.loads(p.read_text(encoding="utf-8"))
        doc["similar"] = [{"cik": o, "name": names[o], "score": _f(s, 3)} for s, o in sorted(sims, reverse=True)[:5]]
        _write(p, doc, schemas.MANAGER)

    # ---- stocks ----
    uni = _universe(inp.secmeta, holders, last)
    cp = pd.DataFrame(curated_pos, columns=["cik", "pi", "cusip", "shares", "w"])
    hold_idx = holders.set_index(["cusip", "pi"])
    crowd_rows = []
    for pi in range(n):
        cpi = cp[cp["pi"] == pi]
        ch = cpi.groupby("cusip")["cik"].nunique()
        aw = cpi.groupby("cusip")["w"].sum() / max(len(managers), 1)
        for u in uni.itertuples():
            sh13 = hold_idx["shares"].get((u.cusip, pi))
            so = _shares_asof(inp.shares_out, u.ticker, periods[pi])
            pct = sh13 / so if (sh13 is not None and so) else None
            crowd_rows.append({"cusip": u.cusip, "pi": pi, "curated_holders": float(ch.get(u.cusip, 0)),
                               "pct_held": pct if (pct is not None and pct <= 1.2) else np.nan,
                               "avg_curated_w": float(aw.get(u.cusip, 0.0))})
    crowd = pd.DataFrame(crowd_rows)
    if len(crowd):
        crowd["score"] = crowd.groupby("pi", group_keys=False).apply(crowding_scores)
    close = inp.prices.pivot_table(index="date", columns="ticker", values="close", aggfunc="last").sort_index()
    close = close.loc[pd.Timestamp(periods[0]) - pd.Timedelta(days=95):]
    first_held = cp.groupby(["cik", "cusip"])["pi"].min()
    for u in uni.itertuples():
        cr = crowd[crowd["cusip"] == u.cusip].set_index("pi")
        f_last = flows[(flows["cusip"] == u.cusip) & (flows["pi"] == last)]
        cur_last = cp[(cp["cusip"] == u.cusip) & (cp["pi"] == last)]
        kinds_last = {(r["cik"]): r["kind"] for r in latest_changes if r["cusip"] == u.cusip}
        wk = _weekly(close[u.ticker]) if u.ticker in close.columns else pd.Series(dtype=float)
        doc = {
            "t": u.ticker, "n": _s(u.name) or u.ticker, "cusip": u.cusip, "s": u.sector, "is_etf": bool(u.is_etf) if u.is_etf is not None and not pd.isna(u.is_etf) else False,
            "price": {"dates": [d.date().isoformat() for d in wk.index], "close": [_f(v, 2) for v in wk.values]},
            "holders": {"periods": P,
                        "count": [_i(hold_idx["holders"].get((u.cusip, pi))) for pi in range(n)],
                        "pct": [_f(cr["pct_held"].get(pi)) for pi in range(n)],
                        "value": [_i(hold_idx["value"].get((u.cusip, pi))) for pi in range(n)]},
            "flows": {"period": P[last], "items": [{"kind": r.kind, "group": r.grp, "dollars": _i(r.dollars), "n": int(r.n)}
                                                    for r in f_last.itertuples()]},
            "curated": [{"cik": int(r.cik), "name": names[int(r.cik)], "sh": _i(r.shares), "w": _f(r.w),
                         "k": kinds_last.get(int(r.cik), "hold"), "first": P[int(first_held[(r.cik, u.cusip)])]}
                        for r in cur_last.sort_values("w", ascending=False).itertuples()],
            "crowding": {"score": _f(cr["score"].get(last), 1), "history": [_f(cr["score"].get(pi), 1) for pi in range(n)]},
        }
        _write(out_dir / "stocks" / f"{u.ticker}.json", doc, schemas.STOCK)

    # ---- home ----
    lc = pd.DataFrame(latest_changes, columns=["cik", "cusip", "kind", "dv"])
    agg = []
    for c, g in lc.groupby("cusip"):
        cnt = g["kind"].value_counts()
        k = {x: int(cnt.get(x, 0)) for x in ("new", "add", "trim", "exit")}
        agg.append({"t": lab(c) or nm(c), "n": nm(c), **k, "c": c,
                    "buy_who": [names[x] for x in g[g["kind"].isin(["new", "add"])]["cik"]],
                    "sell_who": [names[x] for x in g[g["kind"].isin(["trim", "exit"])]["cik"]]})
    bought = sorted([a for a in agg if a["new"] - a["exit"] > 0 or (a["new"] == a["exit"] and a["add"] > a["trim"])],
                    key=lambda a: (a["new"] - a["exit"], a["add"] - a["trim"]), reverse=True)[:15]
    sold = sorted([a for a in agg if a["exit"] - a["new"] > 0 or (a["new"] == a["exit"] and a["trim"] > a["add"])],
                  key=lambda a: (a["exit"] - a["new"], a["trim"] - a["add"]), reverse=True)[:15]
    pack = lambda a, net, who: {"t": a["t"], "n": a["n"], "new": a["new"], "add": a["add"], "trim": a["trim"],  # noqa: E731
                                "exit": a["exit"], "net": net, "who": who}
    lc["sector"] = lc["cusip"].map(sec)
    buys = lc[lc["dv"] > 0].groupby("sector")["dv"].sum()
    sells = (-lc[lc["dv"] < 0].groupby("sector")["dv"].sum())
    crowd_last = crowd[crowd["pi"] == last].merge(uni[["cusip", "ticker", "name", "sector"]], on="cusip") if len(crowd) else crowd
    crowded = []
    # the bubble chart plots 13F ownership, so only rank stocks whose share count is known
    # "crowded" = held by the most tracked managers (ties broken by number of 13F holders); ownership % is too noisy
    known = crowd_last[crowd_last["curated_holders"] >= 3] if len(crowd_last) else crowd_last
    known = known.assign(_h=known["cusip"].map(lambda c: hold_idx["holders"].get((c, last), 0))) if len(known) else known
    for r in known.sort_values(["curated_holders", "_h"], ascending=False).head(20).itertuples() if len(known) else []:
        crowded.append({"t": r.ticker, "n": _s(r.name) or r.ticker, "s": r.sector,
                        "holders": _i(hold_idx["holders"].get((r.cusip, last))), "pct": _f(r.pct_held),
                        "value": _i(hold_idx["value"].get((r.cusip, last))), "score": _f(r.score, 1), "curated": int(r.curated_holders)})
    home = {"period": P[last],
            "most_bought": [pack(a, a["new"] - a["exit"], a["buy_who"]) for a in bought],
            "most_sold": [pack(a, a["exit"] - a["new"], a["sell_who"]) for a in sold],
            "crowded": crowded,
            "sector_flows": {"buys": {k: _i(v) for k, v in buys.items()}, "sells": {k: _i(v) for k, v in sells.items()}}}
    _write(out_dir / "home.json", home, schemas.HOME)
    linked = set(uni["ticker"])
    _write(out_dir / "flows.json", {"periods": P, "managers": {str(k): v for k, v in names.items()},
                                    "stocks": {k: [v[0], v[1], v[2] and k in linked] for k, v in flow_meta.items()},
                                    "rows": flow_rows}, schemas.FLOWS)

    # ---- meta ----
    cur_last = eq[(eq["cik"].isin(curated)) & (eq["pi"] == last)]
    tot = cur_last["value_usd"].sum()
    mapped = cur_last[cur_last["ticker"].notna()]
    priced = mapped[mapped["ticker"].isin(px.columns)] if len(px) else mapped.iloc[0:0]
    meta = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "latest_period": P[last], "periods": P, "managers": meta_managers,
        "stocks": [{"t": u.ticker, "n": _s(u.name) or u.ticker, "s": u.sector} for u in uni.itertuples()],
        "coverage": {"figi_value_pct": _f(mapped["value_usd"].sum() / tot if tot else None, 3),
                     "price_value_pct": _f(priced["value_usd"].sum() / tot if tot else None, 3),
                     "unmapped_cusips": int(inp.secmeta["ticker"].isna().sum())},
        "universe": {"filers": int(filers[filers["pi"] == last]["cik"].nunique()),
                     "total_value": _i(eq[eq["pi"] == last]["value_usd"].sum())},
    }
    _write(out_dir / "meta.json", meta, schemas.META)
    _check_budget(out_dir, settings)
    return {"managers": len(managers), "stocks": len(uni)}


def _check_budget(out_dir: Path, s: Settings) -> None:
    problems = []
    for sub, kb in (("managers", s.manager_json_max_kb), ("stocks", s.stock_json_max_kb)):
        for p in sorted((out_dir / sub).glob("*.json")):
            if p.stat().st_size > kb * 1024:
                problems.append(f"{sub}/{p.name}: {p.stat().st_size / 1024:.0f} KB > {kb} KB")
    total = sum(p.stat().st_size for p in out_dir.rglob("*.json"))
    if total > s.data_dir_max_mb * 1024 * 1024:
        problems.append(f"data/: {total / 1048576:.1f} MB > {s.data_dir_max_mb} MB")
    if problems:
        raise BudgetError("size budget exceeded:\n" + "\n".join(problems))
