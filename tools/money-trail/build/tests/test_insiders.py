import json
import zipfile
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from sm.congress_export import excess_paths
from sm.insiders import (extract_xml, mentions_plan, parse_daily_index, parse_form4_xml, primary_owners, read_dataset,
                         rel_code)
from sm.insiders_export import (ClusterRule, cap_bucket, export_insiders, filings, find_clusters, market_caps, resolve_tickers,
                                role_group, winsorize)
from sm.prices import PRICE_COLS

FX = Path(__file__).parent / "fixtures" / "form345"


def _zip(tmp_path, q):
    p = tmp_path / f"{q}_form345.zip"
    with zipfile.ZipFile(p, "w") as z:
        for f in (FX / q).iterdir():
            z.write(f, f.name)
    return p


@pytest.fixture()
def q3(tmp_path):
    df = read_dataset(_zip(tmp_path, "2026q3"))
    return df.assign(ticker=df["symbol"])


# ---------------- parsing real SEC files ----------------

def test_dataset_keeps_original_form4_only_and_reads_checkbox(q3):
    assert set(q3["symbol"]) == {"CELH", "SION", "POWL"}          # the 4/A in the fixture is dropped
    powl = q3[q3["symbol"] == "POWL"]
    assert len(powl) == 8 and (powl["plan"] == 1).all() and (powl["code"] == "S").all()
    fieldly = q3[q3["owner_name"] == "Fieldly John"].iloc[0]
    assert fieldly["rel"] == "DO" and fieldly["title"] == "Chief Executive Officer"
    assert fieldly["trans_date"] == date(2026, 9, 10) and fieldly["shares"] == 18000 and fieldly["price"] == 27.44


def test_joint_filing_is_attributed_to_one_owner(q3):
    sion = q3[q3["symbol"] == "SION"]
    assert len(sion) == 1 and sion["n_owners"].iloc[0] == 2


def test_pre_2023_plan_detected_from_footnote(tmp_path):
    df = read_dataset(_zip(tmp_path, "2022q1"))
    plan = df.groupby("symbol")["plan"].max().to_dict()
    assert plan == {"ADSK": 1, "ANDE": 0}


def test_schema_change_fails_loudly(tmp_path):
    p = tmp_path / "bad_form345.zip"
    with zipfile.ZipFile(p, "w") as z:
        for f in (FX / "2026q3").iterdir():
            text = f.read_text()
            z.writestr(f.name, text.replace("TRANS_CODE", "TRANSACTION_CODE") if f.name == "NONDERIV_TRANS.tsv" else text)
    with pytest.raises(ValueError, match="TRANS_CODE"):
        read_dataset(p)


def test_daily_feed_xml():
    txt = (FX / "0001104659-26-115763.txt").read_text()
    df = parse_form4_xml(extract_xml(txt), "0001104659-26-115763", date(2026, 10, 14))
    assert len(df) == 2 and set(df["code"]) == {"S"} and (df["plan"] == 1).all()
    assert df["symbol"].iloc[0] == "AFL" and df["issuer_cik"].iloc[0] == 4977
    assert df["owner_name"].iloc[0] == "Japan Post Holdings Co., Ltd." and df["rel"].iloc[0] == "T"
    assert df["shares"].tolist() == [11468.0, 732.0] and df["trans_date"].iloc[0] == date(2026, 10, 12)


def test_daily_index_dedupes_owner_and_issuer_listings():
    text = (
        "Form Type   Company Name   CIK   Date Filed  File Name\n"
        "4                AFLAC INC                       4977        20261014    edgar/data/4977/0001104659-26-115763.txt   \n"
        "4                Japan Post Holdings Co., Ltd.   1234567     20261014    edgar/data/1234567/0001104659-26-115763.txt\n"
        "4/A              SOMEONE                         1111        20261014    edgar/data/1111/0000000000-26-000001.txt\n"
        "3                SOMEONE                         1111        20261014    edgar/data/1111/0000000000-26-000002.txt\n")
    assert parse_daily_index(text) == [("0001104659-26-115763", date(2026, 10, 14), "edgar/data/1234567/0001104659-26-115763.txt")]


def test_plan_text_and_relationship_codes():
    assert mentions_plan("Sold pursuant to a Rule 10b5-1 trading plan adopted May 1, 2025.")
    assert mentions_plan("effected under a 10b-5-1 plan")
    assert not mentions_plan("This transaction was not made pursuant to a Rule 10b5-1 plan.")
    assert not mentions_plan("")
    assert rel_code("Director,Officer,TenPercentOwner") == "DOT" and rel_code("Other") == "X"
    o = pd.DataFrame({"accession": ["a", "a", "b"], "owner_cik": [5, 9, 3], "owner_name": ["Fund LP", "Jane", "X"],
                      "rel": ["T", "D", "O"], "title": ["", "", ""]})
    p = primary_owners(o).set_index("accession")
    assert p.loc["a", "owner_name"] == "Jane" and p.loc["a", "n_owners"] == 2


def test_role_groups():
    assert role_group("DO", "President & CEO") == "ceo_cfo"
    assert role_group("O", "Chief Financial Officer") == "ceo_cfo"
    assert role_group("O", "Chief Operating Officer") == "officer"
    assert role_group("D", "") == "director"
    assert role_group("T", "") == "owner10"
    assert role_group("DT", "") == "director"


def test_resolve_tickers_avoids_reused_symbols():
    tx = pd.DataFrame({"issuer_cik": [1, 2, 3, 4], "symbol": ["BRK.B", "OLD", "META", "none"]})
    out = resolve_tickers(tx, {"BRK-A": 1, "BRK.B": 1, "META": 99})
    # own class kept; delisted keeps its symbol; reused symbol (META belongs to another CIK) dropped
    assert out.tolist() == ["BRK-B", "OLD", None, None]


# ---------------- signals ----------------

def test_filings_collapse_rows_with_vwap(q3):
    f = filings(q3)
    powl = f[f["ticker"] == "POWL"].iloc[0]
    assert powl["shares"] == 4500 and powl["plan"] == 1
    assert powl["price"] == pytest.approx((q3.loc[q3["symbol"] == "POWL", "shares"] * q3.loc[q3["symbol"] == "POWL", "price"]).sum() / 4500)
    assert len(f[f["owner_name"] == "DeSantis Damon"]) == 1 and f[f["owner_name"] == "DeSantis Damon"]["trans_date"].iloc[0] == date(2026, 9, 14)


def test_real_cluster_buy_dated_by_completing_filing(q3):
    cl = find_clusters(filings(q3))
    assert cl["cluster"].nunique() == 1
    assert cl["event_date"].iloc[0] == date(2026, 9, 16)              # Kravitz's filing made it the third insider
    assert set(cl["owner_name"]) == {"Kravitz Hal", "DeSantis Damon", "Fieldly John"}


def _buy(owner, td, value=50_000, plan=0, fd=None, issuer=1):
    td = date.fromisoformat(td)
    return {"accession": f"{owner}-{td}", "code": "P", "issuer_cik": issuer, "issuer_name": "X", "ticker": "X", "owner_cik": owner,
            "owner_name": str(owner), "role": "director", "plan": plan, "value": value, "trans_date": td,
            "filing_date": fd and date.fromisoformat(fd) or td + timedelta(days=2)}


def test_cluster_window_is_inclusive_at_exactly_30_days():
    b = pd.DataFrame([_buy(1, "2025-01-01"), _buy(2, "2025-01-15"), _buy(3, "2025-01-31")])
    assert find_clusters(b)["cluster"].nunique() == 1
    b = pd.DataFrame([_buy(1, "2025-01-01"), _buy(2, "2025-01-15"), _buy(3, "2025-02-01")])
    assert find_clusters(b).empty


def test_cluster_excludes_plan_buys_and_needs_distinct_insiders_and_value():
    assert find_clusters(pd.DataFrame([_buy(1, "2025-01-01"), _buy(2, "2025-01-02"), _buy(3, "2025-01-03", plan=1)])).empty
    assert find_clusters(pd.DataFrame([_buy(i, f"2025-01-0{i}") for i in (1, 2, 3)]).assign(ticker=None)).empty
    assert find_clusters(pd.DataFrame([_buy(1, "2025-01-01"), _buy(2, "2025-01-02"), _buy(2, "2025-01-03")])).empty
    assert find_clusters(pd.DataFrame([_buy(i, f"2025-01-0{i}", value=30_000) for i in (1, 2, 3)])).empty
    assert not find_clusters(pd.DataFrame([_buy(i, f"2025-01-0{i}", value=34_000) for i in (1, 2, 3)])).empty
    rule = ClusterRule(window_days=10, min_insiders=2, min_value=1)
    assert find_clusters(pd.DataFrame([_buy(1, "2025-01-01"), _buy(2, "2025-01-11")]), rule)["cluster"].nunique() == 1


def test_follow_on_buys_join_and_later_buys_start_a_new_cluster():
    rows = [_buy(1, "2025-01-01"), _buy(2, "2025-01-02"), _buy(3, "2025-01-03"),
            _buy(4, "2025-01-20"),                                                   # joins (within 30d of last)
            _buy(5, "2025-04-01"), _buy(6, "2025-04-02"), _buy(7, "2025-04-03"),      # new cluster
            _buy(8, "2025-04-03", issuer=2), _buy(9, "2025-04-03", issuer=2)]         # other issuer: only 2
    cl = find_clusters(pd.DataFrame(rows))
    sizes = cl.groupby("cluster")["owner_cik"].nunique().sort_index()
    assert sizes.tolist() == [4, 3]
    assert sorted(cl["event_date"].unique()) == [date(2025, 1, 5), date(2025, 4, 5)]


def test_cluster_uses_filing_order_not_trade_order():
    # third insider traded early but filed late: the cluster becomes public on that late filing date
    b = pd.DataFrame([_buy(1, "2025-01-10"), _buy(2, "2025-01-11"), _buy(3, "2025-01-05", fd="2025-01-25")])
    cl = find_clusters(b)
    assert cl["event_date"].iloc[0] == date(2025, 1, 25)


def test_market_cap_uses_price_paid_and_shares_reported_at_the_time():
    # 1:100 reverse split in 2024: Yahoo's split-adjusted close for 2023 would be 100x the real price
    so = pd.DataFrame({"end": pd.to_datetime(["2023-03-31", "2023-06-30", "2024-09-30"]), "shares": [4e8, 5e8, 5e6], "ticker": "PNY"})
    ev = pd.DataFrame({"ticker": ["PNY", "PNY", "PNY", "NOPE"], "event_date": [date(2023, 8, 1), date(2023, 1, 5), date(2025, 1, 1), date(2025, 1, 1)],
                       "price": [0.5, 0.5, 40.0, 10.0]})
    assert market_caps(ev, so).tolist()[:3] == [2.5e8, 2e8, 2e8] and np.isnan(market_caps(ev, so).iloc[3])


def test_winsorize_clips_each_day():
    p = np.vstack([np.zeros((99, 3)), [[50.0, -9.0, np.nan]]])
    w = winsorize(p, 0.01)
    assert w[:, 0].max() < 1 and w[:, 1].min() > -1 and np.isnan(w[-1, 2])


def test_cap_bucket():
    assert [cap_bucket(x) for x in (5e8, 5e9, 5e10, None, np.nan)] == ["small", "mid", "large", None, None]


# ---------------- event study alignment ----------------

def _px(days, series):
    return pd.DataFrame(series, index=days)


def test_event_window_day0_is_first_trading_day_after_filing():
    days = pd.bdate_range("2025-01-01", periods=40)
    s = np.arange(100, 140, dtype=float)
    px = _px(days, {"X": s, "SPY": np.full(40, 10.0)})
    filed = days[25].date()                                                 # day 0 = days[26]
    paths, starts = excess_paths(pd.DataFrame({"ticker": ["X"], "d": [filed]}), px, "d", days=5, pre=3)
    assert starts[0] == 26 and paths.shape == (1, 9)
    assert paths[0, 3] == 0
    np.testing.assert_allclose(paths[0, 3:], s[26:32] / s[26] - 1)
    np.testing.assert_allclose(paths[0, :3], -(s[26] / s[23:26] - 1))       # minus the run-up into day 0
    # near the start: missing pre-days stay NaN instead of shifting the window
    p2, _ = excess_paths(pd.DataFrame({"ticker": ["X"], "d": [days[0].date()]}), px, "d", days=2, pre=3)
    assert np.isnan(p2[0, :2]).all() and p2[0, 3] == 0


# ---------------- export ----------------

def test_export_insiders(tmp_path, q3):
    days = pd.bdate_range("2026-06-01", "2027-12-31")
    n = len(days)
    series = {"CELH": np.linspace(28, 56, n), "POWL": np.full(n, 280.0), "SION": np.full(n, 45.0), "SPY": np.full(n, 600.0)}
    prices = pd.DataFrame([(d, t, v[i], v[i], 0.0) for t, v in series.items() for i, d in enumerate(days)], columns=PRICE_COLS)
    so = pd.DataFrame({"end": pd.to_datetime(["2026-06-30"]), "shares": [2.5e8], "ticker": ["CELH"]})
    st = export_insiders(q3, prices, so, tmp_path, {"CELH", "POWL"}, today=date(2026, 10, 15))
    assert st["clusters"] == 1 and st["tickers"] == 2
    d = tmp_path / "insiders"
    idx = json.loads((d / "index.json").read_text())
    c = idx["clusters"][0]
    assert c["t"] == "CELH" and c["k"] == 3 and c["d"] == "2026-09-16" and c["cap"] == "mid" and c["r3"] > 0
    assert len(idx["event"]["days"]) == 271 and idx["event"]["cluster"]["n"] == 1 and idx["event"]["cluster"]["mean"][20] == 0
    assert idx["stats"]["buys"] == 3 and idx["stats"]["sells"] == 2 and idx["stats"]["plan_sell_share"] == 1.0
    tk = json.loads((d / "tickers" / "POWL.json").read_text())
    row = dict(zip(tk["keys"], tk["rows"][0]))
    assert row["k"] == "S" and row["plan"] == 1 and tk["plan_sells"] == 1
    fieldly = q3.loc[q3["owner_name"] == "Fieldly John", "owner_cik"].iloc[0]
    p = json.loads((d / "people" / f"{fieldly}.json").read_text())
    assert p["buys"] == 1 and p["hit3"] == 1.0 and p["cl"] == 1 and p["companies"][0]["t"] == "CELH"
    assert all(f.stat().st_size < 100_000 for f in d.rglob("*.json"))
