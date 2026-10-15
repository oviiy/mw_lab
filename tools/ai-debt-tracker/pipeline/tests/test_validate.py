import copy
import datetime as dt
import json
from pathlib import Path

import pytest

from aidebt.validate import check_tranche, dedupe_key, quote_in_source, ytm_from_price

FIX = Path(__file__).parent / "fixtures"
SOURCE = (FIX / "meta_2025-10-30_fwp.txt").read_text()
EXT = json.loads((FIX / "meta_2025-10-30_extraction.json").read_text())


@pytest.mark.parametrize(
    "price,coupon,settle,maturity,expected",
    [
        (99.982, 4.875, dt.date(2025, 11, 3), dt.date(2035, 11, 15), 4.877),  # Meta 2035
        (99.882, 4.200, dt.date(2025, 11, 3), dt.date(2030, 11, 15), 4.226),  # Meta 2030
        (99.888, 5.750, dt.date(2025, 11, 3), dt.date(2065, 11, 15), 5.757),  # Meta 2065
        (99.938, 4.450, dt.date(2025, 9, 26), dt.date(2030, 9, 26), 4.464),   # Oracle 2030
        (100.0, 5.000, dt.date(2025, 1, 15), dt.date(2035, 1, 15), 5.000),    # par bond
    ],
)
def test_ytm_matches_term_sheets(price, coupon, settle, maturity, expected):
    assert ytm_from_price(price, coupon, settle, maturity) == pytest.approx(expected, abs=0.005)


def _check(t):
    return check_tranche(t, EXT["trade_date"], EXT["settlement_date"], SOURCE)


def test_real_extraction_passes_all_checks():
    for t in EXT["tranches"]:
        assert _check(t).ok, (t["name"], _check(t).issues)


def test_wrong_spread_is_caught():
    t = copy.deepcopy(EXT["tranches"][2])
    t["spread_bp"] = 88  # term sheet says T+78
    assert any("spread cross-check" in i for i in _check(t).issues)


def test_wrong_price_is_caught():
    t = copy.deepcopy(EXT["tranches"][2])
    t["price_pct"] = 98.5
    assert any("yield cross-check" in i for i in _check(t).issues)


def test_amount_in_millions_is_caught():
    t = copy.deepcopy(EXT["tranches"][0])
    t["amount"] = 4000
    assert any("millions" in i for i in _check(t).issues)


def test_hallucinated_quote_is_caught():
    t = copy.deepcopy(EXT["tranches"][0])
    t["quote"] = "$4,000,000,000 4.200% Senior Notes due 2031"
    assert any("verbatim" in i for i in _check(t).issues)


def test_maturity_before_trade_date():
    t = copy.deepcopy(EXT["tranches"][0])
    t["maturity_date"] = "2020-01-01"
    assert any("maturity before" in i for i in _check(t).issues)


def test_quote_matching_tolerates_whitespace_and_elision():
    src = "Principal Amount: \n 2030 Notes: $4,000,000,000 | 2032\nNotes: $4,000,000,000"
    assert quote_in_source("2030 Notes: $4,000,000,000 2032 Notes: $4,000,000,000", src)
    assert quote_in_source("Principal Amount: ... 2032 Notes: $4,000,000,000", src)
    assert not quote_in_source("2030 Notes: $5,000,000,000", src)
    assert not quote_in_source(None, src)


def test_dedupe_key_ignores_source_document():
    a = {"currency": "USD", "amount": 2e9, "maturity_date": "2030-06-01", "coupon_pct": 9.25,
         "instrument_type": "senior_notes", "quote": "x"}
    b = dict(a, quote="different 8-K wording", amount=2_000_000_000)
    assert dedupe_key("coreweave", a) == dedupe_key("coreweave", b)
    assert dedupe_key("coreweave", a) != dedupe_key("coreweave", dict(a, coupon_pct=9.0))
