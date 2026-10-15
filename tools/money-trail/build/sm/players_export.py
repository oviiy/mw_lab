"""One yardstick for every kind of "smart money": fund managers (13F), members of Congress (STOCK Act) and insiders
(Form 4). For each player, the average excess return vs SPY over the 3 months after a buy became public; per group, a
copy strategy that buys every disclosed purchase the next trading day and holds it for 3 months, against SPY."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

from .congress_export import _clean, excess_paths
from .signals import RULES, annotate

HOLD = 63          # trading days (~3 months)
HOLDS = [63, 252]  # 3 months, 1 year
BENCHES = ["SPY", "RSP", "IWM", "QQQ"]
MIN_PRICE = 2.0    # $ at entry
BENCH = "SPY"


def copy_curve(events: pd.DataFrame, px: pd.DataFrame, rets: pd.DataFrame, hold: int = HOLD) -> pd.Series:
    """Equal-weight portfolio of every event held for `hold` trading days from the first trading day after its date.
    Daily return = average daily return of the positions open that day (cash at 0% when none are)."""
    idx = px.index
    cols = {c: i for i, c in enumerate(px.columns)}
    R = rets.values
    total = np.zeros(len(idx))
    count = np.zeros(len(idx))
    pos = idx.searchsorted(pd.to_datetime(events["date"]).values, side="right")
    P = px.values
    for t, p in zip(events["ticker"].values, pos):
        j = cols.get(t)
        if j is None or p >= len(idx) or not (P[p, j] >= MIN_PRICE):
            continue                             # skip penny stocks: free price data for them is too noisy
        seg = np.clip(R[p + 1:p + 1 + hold, j], -0.5, 0.5)   # cap single-day moves (split/price-feed glitches)
        ok = np.isfinite(seg)
        total[p + 1:p + 1 + len(seg)] += np.where(ok, seg, 0.0)
        count[p + 1:p + 1 + len(seg)] += ok
    daily = np.where(count > 0, total / np.maximum(count, 1), 0.0)
    return pd.Series(np.cumprod(1 + daily), index=idx)


def _ex3(events: pd.DataFrame, px: pd.DataFrame) -> np.ndarray:
    paths, _ = excess_paths(events.reset_index(drop=True), px, "date", days=HOLD)
    return paths[:, HOLD]


def export_players(data_dir: Path, prices: pd.DataFrame, filings: pd.DataFrame, managers: list,
                   congress_trades: pd.DataFrame | None, insider_tx: pd.DataFrame | None) -> dict:
    data_dir = Path(data_dir)
    px = prices.pivot_table(index="date", columns="ticker", values="adj_close", aggfunc="last").sort_index().ffill()
    rets = px.pct_change()
    last_px = px.iloc[-1]
    groups: dict[str, pd.DataFrame] = {}
    players: list[dict] = []

    # ---- fund managers: new and added positions, disclosed on the first 13F filing date for that quarter
    flows = json.loads((data_dir / "flows.json").read_text(encoding="utf-8"))
    first = {(int(r.cik), int(pi)): r.first_filing_date for pi, p in enumerate(flows["periods"])
             for r in filings[filings["period"] == pd.Timestamp(p).date()].itertuples()}
    fr = pd.DataFrame(flows["rows"], columns=["pi", "cik", "key", "k", "dv"])
    fr["date"] = [first.get((c, p)) for c, p in zip(fr["cik"], fr["pi"])]
    fbuy = fr[fr["k"].isin(["n", "a"]) & fr["date"].notna() & fr["key"].isin(px.columns)].rename(columns={"key": "ticker"})
    fbuy = fbuy.assign(ex=_ex3(fbuy, px) if len(fbuy) else [])
    book = {}
    for m in managers:
        mp = data_dir / "managers" / f"{m.cik}.json"
        if mp.exists():
            vals = json.loads(mp.read_text(encoding="utf-8"))["series"]["value"]
            book.update({(m.cik, i): v for i, v in enumerate(vals) if v})
    fbuy["pct"] = [dv / book[(c, p)] if (c, p) in book else np.nan for dv, c, p in zip(fbuy["dv"], fbuy["cik"], fbuy["pi"])]
    groups["fund"] = fbuy.assign(id=fbuy["cik"].astype(str))
    levels: dict[str, list[pd.DataFrame]] = {"fund": [fbuy, fbuy[fbuy["k"] == "n"], fbuy[fbuy["pct"] >= 0.01]]}
    for m in managers:
        g = fbuy[fbuy["cik"] == m.cik]
        allm = fr[fr["cik"] == m.cik]
        players.append({"g": "fund", "id": str(m.cik), "name": m.name, "sub": m.person, "style": m.style,
                        "buys": int(len(g)), "sells": int(allm["k"].isin(["t", "x"]).sum()),
                        "vol": float(allm["dv"].abs().sum()), "ex3": float(g["ex"].mean()) if g["ex"].notna().any() else None,
                        "hit3": float((g["ex"].dropna() > 0).mean()) if g["ex"].notna().any() else None,
                        "n3": int(g["ex"].notna().sum()), "last": str(g["date"].max()) if len(g) else None})

    # ---- members of Congress: disclosed stock purchases
    if congress_trades is not None and (data_dir / "congress" / "index.json").exists():
        cg = json.loads((data_dir / "congress" / "index.json").read_text(encoding="utf-8"))
        ct = congress_trades[(congress_trades["kind"] == "buy") & (congress_trades["asset_type"] == "ST")
                             & congress_trades["ticker"].isin(px.columns)]
        ct = ct.assign(date=ct["filing_date"])
        groups["congress"] = ct.assign(id=ct["member_id"])
        levels["congress"] = [ct, ct[ct["amount_lo"] >= 50_001], ct[ct["amount_lo"] >= 250_001]]
        for s in cg["members"]:
            players.append({"g": "congress", "id": s["id"], "name": s["name"], "sub": s.get("state") or "", "party": s["party"],
                            "chamber": s.get("chamber", "house"), "buys": s["buys"], "sells": s["sells"], "vol": s["est"],
                            "ex3": s.get("avg_r3_buy"), "hit3": s["hit3"], "n3": s["n_hit"], "last": s["last"]})

    # ---- insiders: open-market purchases outside 10b5-1 plans; the most active insiders get a player row
    if insider_tx is not None and (data_dir / "insiders" / "index.json").exists():
        it = insider_tx[(insider_tx["code"] == "P") & (insider_tx["plan"] == 0) & insider_tx["ticker"].isin(px.columns)]
        it = it.assign(val_line=it["shares"] * it["price"])
        it = it.assign(val=it.groupby(["accession", "ticker"])["val_line"].transform("sum"))
        it = it.drop_duplicates(["accession", "ticker"]).assign(date=lambda d: d["filing_date"], id=lambda d: d["owner_cik"].astype(str))
        groups["insider"] = it
        ceo = it["title"].str.contains("CEO|Chief Exec|CFO|Chief Fin", case=False, na=False)
        levels["insider"] = [it, it[it["val"] >= 250_000], it[ceo & (it["val"] >= 250_000)]]
        ins = json.loads((data_dir / "insiders" / "index.json").read_text(encoding="utf-8"))
        for s in ins["top"]:
            p = data_dir / "insiders" / "people" / f"{s['c']}.json"
            avg = json.loads(p.read_text(encoding="utf-8")).get("avg", {}) if p.exists() else {}
            players.append({"g": "insider", "id": str(s["c"]), "page": p.exists(), "name": s["nm"].title(), "sub": f"{s['co']} ({s['t']})", "role": s["role"],
                            "buys": s["buys"], "sells": s["sells"], "vol": (s.get("vb") or 0) + (s.get("vs") or 0),
                            "ex3": avg.get("r3"), "hit3": s.get("hit3"), "n3": s.get("n3"), "last": s.get("last")})

    # ---- smart signals (no look-ahead): annotate every disclosed buy, then build rule-based strategies
    ev = pd.concat([e.assign(g=g)[["g", "id", "ticker", "date"]] for g, e in groups.items() if len(e)], ignore_index=True)
    ev = annotate(ev.assign(pid=ev["g"] + ":" + ev["id"].astype(str)), px)
    smart_sets = {r: ev[ev[r]] for r in RULES} | {"all": ev[ev["smart"]].drop_duplicates(["ticker", "date"])}
    # latest walk-forward record per player (all results known by the last price date)
    last_day = px.index[-1]
    rec = ev[np.isfinite(ev["ex"]) & (ev["known"] <= last_day)].groupby("pid")["ex"].agg(["mean", "count"])
    for pl in players:
        r = rec.loc[f"{pl['g']}:{pl['id']}"] if f"{pl['g']}:{pl['id']}" in rec.index else None
        pl["proven"] = bool(r is not None and r["count"] >= 5 and r["mean"] > 0)

    # ---- strategy grid: group x conviction level x holding period, against four benchmarks, weekly from a common start
    start = max(pd.Timestamp(e["date"].min()) for e in groups.values() if len(e))
    def norm(c: pd.Series) -> pd.Series:
        c = c.loc[start:]
        return c / c.iloc[0]
    lines = {}
    for g, lv in levels.items():
        for i, lev in enumerate(lv):
            for h in HOLDS:
                lines[f"{g}.{i}.{h}"] = (norm(copy_curve(lev, px, rets, hold=h)), int(len(lev)))
    for r, e in smart_sets.items():
        for h in HOLDS:
            lines[f"smart.{r}.{h}"] = (norm(copy_curve(e, px, rets, hold=h)), int(len(e)))
    benches = {b: norm(px[b]) for b in BENCHES if b in px.columns}
    wk = pd.DataFrame({**{k: v for k, (v, _) in lines.items()}, **benches}).resample("W-FRI").last().dropna()

    def yearly(c: pd.Series, b: pd.Series) -> dict:
        out = {}
        for y in sorted({d.year for d in c.index}):
            cy, by = c[c.index.year == y], b[b.index.year == y]
            if len(cy) >= 8:
                out[str(y)] = round(float((cy.iloc[-1] / cy.iloc[0] - 1) - (by.iloc[-1] / by.iloc[0] - 1)), 4)
        return out

    def stats(s: pd.Series) -> dict:
        yrs = (s.index[-1] - s.index[0]).days / 365.25
        return {"total": float(s.iloc[-1] - 1), "cagr": float(s.iloc[-1] ** (1 / yrs) - 1) if yrs > 0 else None,
                "mdd": float((s / s.cummax() - 1).min())}

    strategies = {"dates": [d.date().isoformat() for d in wk.index], "holds": HOLDS,
                  "lines": {k: [round(v, 4) for v in wk[k]] for k in lines},
                  "bench": {b: [round(v, 4) for v in wk[b]] for b in benches},
                  "stats": {k: {**stats(wk[k]), "n": n} for k, (_, n) in lines.items()},
                  "bench_stats": {b: stats(wk[b]) for b in benches},
                  "yearly": {k: {b: yearly(wk[k], wk[b]) for b in ("SPY", "RSP")} for k in lines},
                  "rules": list(RULES)}

    # ---- position tracker: latest disclosed buys, return since disclosure vs SPY
    names = {(p["g"], p["id"]): p["name"] for p in players}
    recent = []
    for g, e in groups.items():
        e = e.sort_values("date", ascending=False).head(400)
        for r in e.itertuples():
            d0 = px.index.searchsorted(pd.Timestamp(r.date), side="right")
            if d0 >= len(px.index):
                continue
            p0, s0 = px[r.ticker].iloc[d0], px[BENCH].iloc[d0]
            if not (np.isfinite(p0) and p0 > 0):
                continue
            nm = names.get((g, r.id)) or (r.owner_name.title() if g == "insider" else r.member_name if g == "congress" else r.id)
            page = g != "insider" or (data_dir / "insiders" / "people" / f"{r.id}.json").exists()
            recent.append({"g": g, "id": r.id, "page": page, "name": nm, "t": r.ticker, "f": str(pd.Timestamp(r.date).date()),
                           "since": float(last_px[r.ticker] / p0 - 1), "spy": float(last_px[BENCH] / s0 - 1)})
    recent.sort(key=lambda x: x["f"], reverse=True)

    names = {(p["g"], p["id"]): p["name"] for p in players}
    live = []
    recent_cut = last_day - pd.Timedelta(days=150)
    for r in ev[ev["smart"] & (ev["date"] >= recent_cut)].sort_values("date", ascending=False).itertuples():
        d0 = px.index.searchsorted(r.date, side="right")
        if d0 >= len(px.index) or not (px[r.ticker].iloc[d0] > 0):
            continue
        src = groups[r.g]
        nm = names.get((r.g, str(r.id)))
        if nm is None:
            row = src[src["id"].astype(str) == str(r.id)].head(1)
            nm = (row["owner_name"].iloc[0].title() if r.g == "insider" else row["member_name"].iloc[0] if r.g == "congress" else str(r.id)) if len(row) else str(r.id)
        live.append({"g": r.g, "id": str(r.id), "name": nm, "t": r.ticker, "f": str(r.date.date()),
                     "page": r.g != "insider" or (data_dir / "insiders" / "people" / f"{r.id}.json").exists(),
                     "rules": [k for k in RULES if getattr(r, k)], "consensus": int(r.consensus),
                     "skill": None if not np.isfinite(r.skill) else float(r.skill), "mom": None if not np.isfinite(r.mom) else float(r.mom),
                     "since": float(last_px[r.ticker] / px[r.ticker].iloc[d0] - 1), "spy": float(last_px[BENCH] / px[BENCH].iloc[d0] - 1)})
        if len(live) >= 120:
            break

    out = {"hold_days": HOLD, "players": players, "strategies": strategies, "live": live,
           "events": {g: int(len(e)) for g, e in groups.items()},
           "positions": recent[:300]}
    (data_dir / "players.json").write_text(json.dumps(_clean(out), ensure_ascii=False, separators=(",", ":"), allow_nan=False), encoding="utf-8")
    return {"players": len(players), **{f"events_{g}": int(len(e)) for g, e in groups.items()}}
