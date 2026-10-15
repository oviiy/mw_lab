import json
from datetime import date

import numpy as np
import pandas as pd
import pytest

from sm.congress_export import export_congress
from sm.prices import PRICE_COLS


def _prices():
    days = pd.bdate_range("2025-01-01", "2025-12-31")
    n = len(days)
    series = {"UP": np.linspace(100, 200, n), "FLAT": np.full(n, 50.0), "SPY": np.full(n, 500.0)}
    return pd.DataFrame([(d, t, v[i], v[i], 0.0) for t, v in series.items() for i, d in enumerate(days)], columns=PRICE_COLS)


def _trades():
    base = dict(doc_id="1", state_dst="CA11", partial=False, notified=date(2025, 1, 1), desc="")
    return pd.DataFrame([
        {**base, "filing_date": date(2025, 2, 3), "trade_date": date(2025, 1, 6), "member_id": "P000197", "member_name": "Nancy Pelosi",
         "party": "Democrat", "owner": "spouse", "asset": "Up Inc", "ticker": "UP", "asset_type": "ST", "kind": "buy", "amount_lo": 1001.0, "amount_hi": 15000.0},
        {**base, "filing_date": date(2025, 3, 3), "trade_date": date(2025, 2, 20), "member_id": "P000197", "member_name": "Nancy Pelosi",
         "party": "Democrat", "owner": "spouse", "asset": "Flat Co", "ticker": "FLAT", "asset_type": "ST", "kind": "sell", "amount_lo": 15001.0, "amount_hi": 50000.0},
        {**base, "filing_date": date(2025, 3, 10), "trade_date": date(2025, 3, 1), "member_id": "X1", "member_name": "Some One",
         "party": "Republican", "owner": "self", "asset": "US Treasury bill", "ticker": None, "asset_type": "GS", "kind": "buy", "amount_lo": 1001.0, "amount_hi": 15000.0},
    ])


@pytest.fixture()
def out(tmp_path):
    members = pd.DataFrame([{"bioguide": "P000197", "full": "Nancy Pelosi", "party": "Democrat", "state": "CA", "district": 11,
                             "current": True, "committees": ["Committee on Ways"]}])
    stats = export_congress(_trades(), members, _prices(), {"filings": 3, "scanned": 0}, tmp_path, {"UP"})
    return tmp_path / "congress", stats


def J(p):
    return json.loads(p.read_text(encoding="utf-8"))


def test_files_and_stats(out):
    d, stats = out
    assert stats == {"trades": 3, "members": 2, "tickers": 2}
    assert (d / "members" / "P000197.json").exists() and (d / "tickers" / "UP.json").exists()
    idx = J(d / "index.json")
    assert idx["stats"]["trades"] == 3 and idx["stats"]["latest_filing"] == "2025-03-10"
    assert [m["id"] for m in idx["members"]] == ["P000197", "X1"]
    assert idx["recent"][0]["f"] == "2025-03-10"   # newest disclosure first


def test_excess_returns_and_hit_rate(out):
    d, _ = out
    m = J(d / "members" / "P000197.json")
    up = next(t for t in m["trades"] if t["t"] == "UP")
    assert up["r3"] > 0.2                     # UP rises steadily while SPY is flat
    flat = next(t for t in m["trades"] if t["t"] == "FLAT")
    assert flat["r3"] == pytest.approx(0.0)
    assert m["hit3"] == pytest.approx(0.5)    # buy UP hit; sell FLAT (0 excess) is not a hit
    assert m["photo"].endswith("/P000197.jpg") and m["committees"] == ["Committee on Ways"]
    assert m["tickers"][0]["linked"] in (True, False)
    assert up["lag"] == 28


def test_event_study_and_unmatched_member(out):
    d, _ = out
    idx = J(d / "index.json")
    ev = idx["event"]["buy"]
    assert ev["n"] == 1 and ev["mean"][0] == 0.0 and ev["mean"][-1] > 0.3
    x1 = J(d / "members" / "X1.json")
    assert x1["photo"] is None and x1["trades"][0]["t"] is None and x1["trades"][0]["r3"] is None
    assert idx["party"]["Democrat"]["n"] == 2


def test_impossible_trade_dates_are_dropped(tmp_path):
    bad = _trades()
    bad.loc[0, "trade_date"] = date(3031, 4, 30)
    stats = export_congress(bad, pd.DataFrame(columns=["bioguide", "full", "party", "state", "district", "current", "committees"]),
                            _prices(), {"filings": 3, "scanned": 0}, tmp_path, set())
    assert stats["trades"] == 2
