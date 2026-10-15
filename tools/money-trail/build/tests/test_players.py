import pandas as pd
import pytest

from sm.players_export import copy_curve


def test_copy_curve_buys_next_close_and_holds():
    idx = pd.bdate_range("2025-01-06", periods=6)
    px = pd.DataFrame({"A": [100, 100, 110, 121, 121, 121], "SPY": [1.0] * 6}, index=idx, dtype=float)
    ev = pd.DataFrame({"ticker": ["A"], "date": [idx[0]]})          # disclosed on day 0 -> bought at day 1's close
    c = copy_curve(ev, px, px.pct_change(), hold=2)
    assert list(c.round(4)) == [1.0, 1.0, 1.1, 1.21, 1.21, 1.21]    # earns days 2 and 3, then back in cash


def test_copy_curve_averages_overlapping_positions():
    idx = pd.bdate_range("2025-01-06", periods=4)
    px = pd.DataFrame({"A": [10, 10, 11, 11], "B": [10, 10, 9, 9], "SPY": [1.0] * 4}, index=idx, dtype=float)
    ev = pd.DataFrame({"ticker": ["A", "B", "ZZZ"], "date": [idx[0], idx[0], idx[0]]})   # unknown ticker ignored
    c = copy_curve(ev, px, px.pct_change(), hold=1)
    assert c.iloc[2] == pytest.approx(1.0)                          # +10% and -10% average to 0


def test_copy_curve_skips_penny_stocks_and_caps_glitches():
    idx = pd.bdate_range("2025-01-06", periods=4)
    px = pd.DataFrame({"P": [1.0, 1.0, 5.0, 5.0], "G": [10.0, 10.0, 100.0, 100.0], "SPY": [1.0] * 4}, index=idx)
    ev = pd.DataFrame({"ticker": ["P", "G"], "date": [idx[0], idx[0]]})
    c = copy_curve(ev, px, px.pct_change(), hold=2)
    assert c.iloc[-1] == pytest.approx(1.5)      # P skipped (under $2); G's 10x jump capped at +50%
