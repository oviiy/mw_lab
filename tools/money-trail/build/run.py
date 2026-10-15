"""Build pipeline: python run.py [--stage 13f|map|congress|form4|prices|export|all] (comma-separated stages allowed)"""
from __future__ import annotations

import argparse
import json
from datetime import date, timedelta

import pandas as pd

from sm.clean import build_holdings, complete_periods, effective_accessions, filings_table, load_submissions
from sm.companies import shares_outstanding_series, sic_for, ticker_to_cik
from sm.config import sec_user_agent
from sm.congress import house_index, legislators, match_member, match_senator, parse_ptr, ptr_text, slug
from sm.senate import SenateClient, parse_senate_ptr
from sm.congress_export import export_congress
from sm.players_export import export_players
from sm.profiles import profile
from sm.config import CACHE_DIR, DATA_DIR, REPORTS_DIR, load_managers, load_settings
from sm.export import BuildInputs, _check_budget, export_all
from sm.insiders import ingest as ingest_form4
from sm.insiders_export import ClusterRule, export_insiders, filings, find_clusters, resolve_tickers
from sm.figi import FigiMapper
from sm.ingest_13f import ingest, shift_quarter_end
from sm.prices import YFinanceSource, update_prices
from sm.sec import SecClient
from sm.sectors import load_sic_sectors, sector_for

DERIVED = CACHE_DIR / "derived"


def select_universe(h: pd.DataFrame, n_periods: int, curated: set[int], top_n: int, top_k: int) -> set[str]:
    eq = h[(h["put_call"] == "") & (h["shares"] > 0)]
    latest = eq[eq["pi"] == n_periods - 1]
    top = set(latest.groupby("cusip")["cik"].nunique().nlargest(top_n).index)
    cur = eq[eq["cik"].isin(curated)].sort_values("value_usd", ascending=False)
    return top | set(cur.groupby(["cik", "pi"]).head(top_k)["cusip"])


def _periods() -> list[date]:
    return [date.fromisoformat(s) for s in json.loads((DERIVED / "periods.json").read_text())]


def stage_13f(settings) -> None:
    client = SecClient()
    dirs = ingest(client, shift_quarter_end(date.today(), -(settings.quarters + 2)))
    subs = load_submissions(dirs)
    eff = effective_accessions(subs)
    periods = complete_periods(eff, settings.quarters)
    eff = eff[eff["period"].isin(periods)]
    print(f"[13f] periods {periods[0]} .. {periods[-1]} ({len(periods)}); building holdings")
    holdings = build_holdings(dirs, eff)
    DERIVED.mkdir(parents=True, exist_ok=True)
    holdings.to_parquet(DERIVED / "holdings.parquet", index=False)
    filings_table(subs, eff).to_parquet(DERIVED / "filings.parquet", index=False)
    (DERIVED / "periods.json").write_text(json.dumps([p.isoformat() for p in periods]))
    print(f"[13f] {len(holdings):,} holding rows, {holdings['cik'].nunique():,} filers")


def stage_map(settings, managers) -> None:
    periods = _periods()
    h = pd.read_parquet(DERIVED / "holdings.parquet")
    h["pi"] = h["period"].map({p: i for i, p in enumerate(periods)})
    cusips = select_universe(h, len(periods), {m.cik for m in managers}, settings.stock_universe_top_n,
                             settings.holdings_per_quarter)
    print(f"[map] {len(cusips):,} cusips to map")
    figi = FigiMapper().map(sorted(cusips))
    client = SecClient()
    t2c = ticker_to_cik(client)
    table = load_sic_sectors()
    rows, shares, seen = [], [], set()
    for i, (cusip, rec) in enumerate(figi.items()):
        if i % 250 == 0:
            print(f"[map] issuer facts {i}/{len(figi)}")
        if rec is None or not rec.ticker:
            rows.append({"cusip": cusip, "ticker": None, "name": None, "sector": "其他", "is_equity": None, "is_etf": None})
            continue
        t = rec.yf_ticker
        cik = t2c.get(t)
        sic = sic_for(client, cik) if (cik and not rec.is_etf) else None
        rows.append({"cusip": cusip, "ticker": t, "name": rec.name, "sector": sector_for(sic, table, rec.is_etf),
                     "is_equity": rec.is_equity, "is_etf": rec.is_etf})
        if cik and rec.is_equity and not rec.is_etf and t not in seen:
            seen.add(t)
            so = shares_outstanding_series(client, cik)
            if len(so):
                shares.append(so.assign(ticker=t))
    secmeta = pd.DataFrame(rows)
    secmeta.to_parquet(DERIVED / "secmeta.parquet", index=False)
    so = pd.concat(shares, ignore_index=True) if shares else pd.DataFrame(columns=["end", "shares", "ticker"])
    so.to_parquet(DERIVED / "shares_out.parquet", index=False)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    un = secmeta[secmeta["ticker"].isna()][["cusip"]].merge(
        h.groupby("cusip").agg(issuer=("issuer", "first"), value_usd=("value_usd", "sum")).reset_index(), on="cusip")
    un.sort_values("value_usd", ascending=False).to_csv(REPORTS_DIR / "unmapped.csv", index=False)
    print(f"[map] mapped {secmeta['ticker'].notna().sum():,}/{len(secmeta):,}; unmapped list in reports/unmapped.csv")


def stage_congress() -> None:
    """House and Senate PTRs since the start of the 13F window: parse electronic filings, match filers to members."""
    periods = _periods()
    client = SecClient(min_interval=0.2)   # polite pace for house.gov
    members = legislators(client)
    info = members.set_index("bioguide")
    rows, filings, scanned = [], 0, 0

    def add(mid, fallback_name, chamber, filing_date, state_dst, doc_id, trades):
        known = mid in info.index
        for t in trades:
            rows.append({"doc_id": doc_id, "filing_date": filing_date, "member_id": mid,
                         "member_name": info.at[mid, "full"] if known else fallback_name,
                         "party": info.at[mid, "party"] if known else "", "chamber": chamber,
                         "state_dst": state_dst or (info.at[mid, "state"] if known else ""), **t})

    years = range(periods[0].year, date.today().year + 1)
    idx = pd.concat([house_index(client, y) for y in years], ignore_index=True)
    filings += len(idx)
    for i, f in enumerate(idx.itertuples()):
        if i % 500 == 0:
            print(f"[congress] house reports {i}/{len(idx)}")
        if f.doc_id.startswith("8"):
            scanned += 1
            continue
        mid = match_member(f.last, f.first, f.state_dst, members) or slug(f.last, f.first, f.state_dst)
        add(mid, f"{f.first} {f.last}", "house", f.filing_date, f.state_dst, f.doc_id, parse_ptr(ptr_text(client, f.year, f.doc_id)))

    sen = SenateClient(sec_user_agent())
    reports = [r for r in sen.search_ptrs(f"01/01/{periods[0].year}") if r["filing_date"].year >= periods[0].year]
    filings += len(reports)
    for i, r in enumerate(reports):
        if i % 100 == 0:
            print(f"[congress] senate reports {i}/{len(reports)}")
        if r["paper"]:
            scanned += 1
            continue
        mid = match_senator(r["last"], r["first"], members) or slug(r["last"], r["first"], "sen")
        add(mid, f"{r['first']} {r['last']}", "senate", r["filing_date"], None, r["href"].rstrip("/").rsplit("/", 1)[-1],
            parse_senate_ptr(sen.report(r["href"])))

    trades = pd.DataFrame(rows)
    trades.to_parquet(DERIVED / "congress_trades.parquet", index=False)
    members.to_parquet(DERIVED / "congress_members.parquet", index=False)
    (DERIVED / "congress_stats.json").write_text(json.dumps({"filings": int(filings), "scanned": scanned}))
    by = trades.groupby("chamber")["member_id"].nunique().to_dict() if len(trades) else {}
    print(f"[congress] {filings:,} reports ({scanned:,} scanned, not parsed), {len(trades):,} trades, members {by}")


def _rule(settings) -> ClusterRule:
    return ClusterRule(settings.cluster_window_days, settings.cluster_min_insiders, settings.cluster_min_value)


def stage_form4(settings) -> None:
    """Form 4 transactions over the 13F window (bulk data sets + daily index), with tickers; shares outstanding for
    cluster-buy issuers outside the 13F universe (for market-cap buckets)."""
    periods = _periods()
    client = SecClient()
    tx = ingest_form4(client, periods[0])
    t2c = ticker_to_cik(client)
    tx["ticker"] = resolve_tickers(tx, t2c)
    tx.to_parquet(DERIVED / "insider_tx.parquet", index=False)
    f = filings(tx)
    cl = find_clusters(f, _rule(settings))
    have = set(pd.read_parquet(DERIVED / "shares_out.parquet")["ticker"]) if (DERIVED / "shares_out.parquet").exists() else set()
    need = cl[~cl["ticker"].isin(have) & cl["ticker"].notna()].drop_duplicates("ticker")[["ticker", "issuer_cik"]]
    shares = []
    for i, r in enumerate(need.itertuples()):
        if i % 200 == 0:
            print(f"[form4] shares outstanding {i}/{len(need)}")
        so = shares_outstanding_series(client, int(r.issuer_cik))
        if len(so):
            shares.append(so.assign(ticker=r.ticker))
    so = pd.concat(shares, ignore_index=True) if shares else pd.DataFrame(columns=["end", "shares", "ticker"])
    so.to_parquet(DERIVED / "insider_shares_out.parquet", index=False)
    print(f"[form4] {tx['accession'].nunique():,} filings, {len(tx):,} transactions; {len(f):,} open-market filings; "
          f"{cl['cluster'].nunique():,} cluster buys")


def stage_profiles() -> None:
    """Company facts for every stock page (SEC registration + Yahoo quote fields), cached in cache/derived/profiles.json."""
    secmeta = pd.read_parquet(DERIVED / "secmeta.parquet")
    tickers = sorted(set(secmeta.loc[secmeta["is_equity"].fillna(False).astype(bool), "ticker"].dropna()))
    client = SecClient()
    t2c = ticker_to_cik(client)
    from concurrent.futures import ThreadPoolExecutor
    out = {}
    with ThreadPoolExecutor(max_workers=4) as pool:   # Yahoo tolerates a few parallel quote requests; SEC calls are cached
        for i, (t, prof) in enumerate(zip(tickers, pool.map(lambda x: profile(x, t2c.get(x), client), tickers))):
            out[t] = prof
            if i % 200 == 0:
                print(f"[profiles] {i}/{len(tickers)}")
    (DERIVED / "profiles.json").write_text(json.dumps(out))
    print(f"[profiles] {len(out):,} companies, {sum(1 for v in out.values() if v.get('marketCap')):,} with Yahoo financials")


def apply_profiles() -> None:
    """Attach profiles to the exported stock pages (run after export_all, which rewrites stocks/)."""
    p = DERIVED / "profiles.json"
    if not p.exists():
        return
    prof = json.loads(p.read_text())
    n = 0
    for f in (DATA_DIR / "stocks").glob("*.json"):
        doc = json.loads(f.read_text(encoding="utf-8"))
        doc["profile"] = prof.get(doc["t"]) or {"yahoo": f"https://finance.yahoo.com/quote/{doc['t']}"}
        f.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":"), allow_nan=False), encoding="utf-8")
        n += 1
    print(f"[export] profiles attached to {n:,} stock pages")


def stage_prices() -> None:
    periods = _periods()
    secmeta = pd.read_parquet(DERIVED / "secmeta.parquet")
    tickers = set(secmeta["ticker"].dropna()) | {"SPY", "RSP", "IWM", "QQQ"}   # benchmarks: cap-weight, equal-weight, small caps, Nasdaq-100
    if (DERIVED / "congress_trades.parquet").exists():
        ct = pd.read_parquet(DERIVED / "congress_trades.parquet")
        tickers |= set(ct.loc[ct["asset_type"].isin(["ST", "OP"]), "ticker"].dropna())
    if (DERIVED / "insider_tx.parquet").exists():
        # Every stock with an open-market insider purchase (signals + event study); sales only matter on stock pages.
        it = pd.read_parquet(DERIVED / "insider_tx.parquet", columns=["code", "ticker"])
        tickers |= set(it.loc[it["code"] == "P", "ticker"].dropna())
    tickers = sorted(tickers)
    update_prices(YFinanceSource(), tickers, periods[0] - timedelta(days=100), date.today())


def stage_export(settings, managers) -> None:
    inp = BuildInputs(
        periods=_periods(),
        holdings=pd.read_parquet(DERIVED / "holdings.parquet"),
        filings=pd.read_parquet(DERIVED / "filings.parquet"),
        secmeta=pd.read_parquet(DERIVED / "secmeta.parquet"),
        shares_out=pd.read_parquet(DERIVED / "shares_out.parquet"),
        prices=pd.read_parquet(CACHE_DIR / "prices.parquet"),
    )
    stats = export_all(inp, settings, managers, DATA_DIR)
    apply_profiles()
    print(f"[export] wrote {stats['managers']} managers, {stats['stocks']} stocks to {DATA_DIR}")
    if (DERIVED / "congress_trades.parquet").exists():
        linked = {s["t"] for s in json.loads((DATA_DIR / "meta.json").read_text())["stocks"]}
        cs = export_congress(pd.read_parquet(DERIVED / "congress_trades.parquet"), pd.read_parquet(DERIVED / "congress_members.parquet"),
                             inp.prices, json.loads((DERIVED / "congress_stats.json").read_text()), DATA_DIR, linked)
        print(f"[export] congress: {cs['trades']:,} trades, {cs['members']} members, {cs['tickers']} tickers")
    if (DERIVED / "insider_tx.parquet").exists():
        linked = {s["t"] for s in json.loads((DATA_DIR / "meta.json").read_text())["stocks"]}
        so = pd.concat([inp.shares_out] + ([pd.read_parquet(DERIVED / "insider_shares_out.parquet")]
                                            if (DERIVED / "insider_shares_out.parquet").exists() else []), ignore_index=True)
        st = export_insiders(pd.read_parquet(DERIVED / "insider_tx.parquet"), inp.prices, so, DATA_DIR, linked, _rule(settings))
        print(f"[export] insiders: {st['filings']:,} open-market filings, {st['clusters']:,} cluster buys, "
              f"{st['people']:,} insider pages, {st['tickers']:,} stock files")
    ps = export_players(DATA_DIR, inp.prices, inp.filings, managers,
                        pd.read_parquet(DERIVED / "congress_trades.parquet") if (DERIVED / "congress_trades.parquet").exists() else None,
                        pd.read_parquet(DERIVED / "insider_tx.parquet") if (DERIVED / "insider_tx.parquet").exists() else None)
    print(f"[export] players: {ps}")
    _check_budget(DATA_DIR, settings)   # again, now that congress/ and insiders/ are written too
    total = sum(p.stat().st_size for p in DATA_DIR.rglob("*.json"))
    print(f"[export] data/ total {total / 1048576:.1f} MB (budget {settings.data_dir_max_mb} MB)")


STAGES = ["13f", "map", "congress", "form4", "profiles", "prices", "export"]


def main(argv=None) -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", default="all", help="13f|map|congress|form4|profiles|prices|export|all, comma-separated")
    stages = set(ap.parse_args(argv).stage.split(","))
    bad = stages - set(STAGES) - {"all"}
    if bad:
        ap.error(f"unknown stage(s) {sorted(bad)}; choose from {STAGES + ['all']}")
    settings, managers = load_settings(), load_managers()
    run = lambda s: s in stages or "all" in stages  # noqa: E731
    if run("13f"):
        stage_13f(settings)
    if run("map"):
        stage_map(settings, managers)
    if run("congress"):
        stage_congress()
    if run("form4"):
        stage_form4(settings)
    if run("profiles"):
        stage_profiles()
    if run("prices"):
        stage_prices()
    if run("export"):
        stage_export(settings, managers)


if __name__ == "__main__":
    main()
