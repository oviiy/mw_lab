import io
import zipfile
from datetime import date
from pathlib import Path

import pandas as pd

from sm.congress import house_index, match_member, match_senator, parse_ptr
from sm.senate import parse_senate_ptr

FIX = Path(__file__).parent / "fixtures" / "house"


def test_parse_pelosi_options_and_multiline_desc():
    rows = parse_ptr((FIX / "20026590.txt").read_text())
    first = rows[0]
    assert first["owner"] == "spouse" and first["ticker"] == "GOOGL" and first["asset_type"] == "OP"
    assert first["kind"] == "buy" and first["trade_date"] == date(2025, 1, 14)
    assert (first["amount_lo"], first["amount_hi"]) == (250_001, 500_000)
    assert first["desc"].startswith("Purchased 50 call options")
    aapl = next(r for r in rows if r["ticker"] == "AAPL")
    assert aapl["kind"] == "sell" and aapl["partial"] and aapl["amount_hi"] == 25_000_000
    exercised = next(r for r in rows if "Exercised" in r["desc"])
    assert exercised["desc"].endswith("of 12/20/24.")
    # the description continuation must not leak into the next asset name
    nxt = rows[rows.index(exercised) + 1]
    assert nxt["asset"].startswith("NVIDIA") and "12/20/24" not in nxt["asset"]
    assert rows[-1]["ticker"] == "VST" and rows[-1]["asset_type"] == "OP"
    assert all(r["ticker"] for r in rows)


def test_parse_many_rows_across_pages():
    rows = parse_ptr((FIX / "20029134.txt").read_text())
    assert len(rows) >= 15
    assert {r["ticker"] for r in rows} >= {"AAL", "BKR", "BLK", "TNA", "DASH"}
    assert rows[0]["asset"].startswith("American Airlines Group")
    assert all(r["owner"] == "self" for r in rows)
    assert sum(r["kind"] == "sell" for r in rows) >= 1


def test_parse_joint_owner_and_multiline_asset():
    rows = parse_ptr((FIX / "20026538.txt").read_text())
    assert len(rows) == 1
    r = rows[0]
    assert r["owner"] == "joint" and r["ticker"] == "NGL" and r["asset_type"] == "ST"
    assert r["notified"] == date(2025, 1, 8) and r["amount_lo"] == 15_001


def test_parse_scan_returns_nothing():
    assert parse_ptr("") == []


def test_house_index_keeps_ptrs_only():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("2025FD.txt", (FIX / "2025FD_sample.txt").read_text())

    class C:
        def get_bytes(self, url, max_age_s=None):
            return buf.getvalue()

    df = house_index(C(), 2025)
    assert len(df) > 0 and set(df.columns) >= {"doc_id", "last", "state_dst", "filing_date"}
    pel = df[df["last"] == "Pelosi"]
    assert set(pel["doc_id"]) == {"20026590", "20030630", "20033337"}   # the 'O' annual report is excluded
    assert pel["filing_date"].min() == date(2025, 1, 17)


def test_match_member_uses_district_then_first_name():
    m = pd.DataFrame([
        {"bioguide": "P000197", "first": "Nancy", "last": "Pelosi", "state": "CA", "district": 11},
        {"bioguide": "X1", "first": "Mark", "last": "Green", "state": "TN", "district": 7},
        {"bioguide": "X2", "first": "Al", "last": "Green", "state": "TX", "district": 9},
        {"bioguide": "X3", "first": "Ann", "last": "Smith", "state": "NJ", "district": 4},
        {"bioguide": "X4", "first": "Bob", "last": "Smith", "state": "NJ", "district": 4},
    ])
    assert match_member("Pelosi", "Nancy", "CA11", m) == "P000197"
    assert match_member("Green", "Mark Dr", "TN07", m) == "X1"
    assert match_member("Smith", "Robert", "NJ04", m) in {"X3", "X4"}
    assert match_member("Smith", "Bob", "NJ04", m) == "X4"
    assert match_member("Nobody", "X", "CA01", m) is None


def test_parse_2021_layout():
    rows = parse_ptr((FIX / "20018685.txt").read_text())
    assert len(rows) == 5
    assert rows[0]["owner"] == "spouse" and rows[0]["ticker"] == "HHC" and rows[0]["partial"]
    assert rows[0]["asset"] == "Howard Hughes Corporation" and rows[0]["trade_date"] == date(2021, 4, 9)
    assert rows[2]["kind"] == "sell" and not rows[2]["partial"]
    assert rows[3]["asset"].startswith("Realty Income") and rows[3]["kind"] == "buy" and rows[3]["asset_type"] == "AB"
    assert rows[4]["asset_type"] == "GS" and rows[4]["amount_hi"] == 100_000
    assert all(r["owner"] == "spouse" for r in rows)


def test_parse_senate_html():
    rows = parse_senate_ptr((FIX.parent / "senate_ptr.html").read_text())
    assert len(rows) == 5
    jpm = rows[0]
    assert jpm["ticker"] == "JPM" and jpm["owner"] == "spouse" and jpm["kind"] == "sell" and jpm["partial"]
    assert jpm["asset_type"] == "ST" and (jpm["amount_lo"], jpm["amount_hi"]) == (15_001, 50_000)
    assert parse_senate_ptr("<html>no table</html>") == []


def test_match_senator_handles_suffix_and_nickname():
    m = pd.DataFrame([
        {"bioguide": "J1", "first": "James", "last": "Justice", "nick": "Jim", "chambers": ["sen"]},
        {"bioguide": "W1", "first": "Sheldon", "last": "Whitehouse", "nick": "", "chambers": ["sen"]},
        {"bioguide": "H1", "first": "Tom", "last": "Whitehouse", "nick": "", "chambers": ["rep"]},
    ])
    assert match_senator("Justice, II", "James Conley", m) == "J1"
    assert match_senator("Whitehouse", "Sheldon", m) == "W1"
    assert match_senator("Nobody", "X", m) is None
