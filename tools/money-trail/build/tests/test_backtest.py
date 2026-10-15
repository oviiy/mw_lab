import pandas as pd
import pytest

from sm.backtest import (Rebalance, make_rebalance, perf_stats, run_clone, trading_day_after,
                         trading_day_on_or_before)

IDX = pd.to_datetime(["2025-01-06", "2025-01-07", "2025-01-08", "2025-01-09", "2025-01-10"])
PX = pd.DataFrame({"A": [10, 11, 12, 12, 13], "B": [20, 20, 22, 24, 24]}, index=IDX, dtype=float)


def test_run_clone_hand_computed():
    rebs = [Rebalance(IDX[0], {"A": .5, "B": .5}, 1.0), Rebalance(IDX[2], {"A": 1.0}, 1.0)]
    v = run_clone(rebs, PX, IDX[-1])
    assert list(v.index) == list(IDX)
    assert list(v.round(6)) == [1.0, 1.05, 1.15, 1.15, round(1.15 * 13 / 12, 6)]


def test_make_rebalance_drops_unpriced_and_reports_coverage():
    px = PX.assign(C=[float("nan")] * 5)
    r = make_rebalance(IDX[0], pd.Series({"A": 60.0, "C": 20.0, "": 20.0}), 100.0, px)
    assert r.weights == {"A": 1.0}
    assert r.coverage == pytest.approx(0.6)
    assert make_rebalance(IDX[0], pd.Series({"C": 1.0}), 1.0, px) is None


def test_trading_day_helpers():
    sat = pd.Timestamp("2025-01-11")
    assert trading_day_after(IDX, pd.Timestamp("2025-01-04")) == IDX[0]   # Saturday filing -> Monday
    assert trading_day_after(IDX, IDX[0]) == IDX[1]                       # filed during the day -> next close
    assert trading_day_after(IDX, sat) is None
    assert trading_day_on_or_before(IDX, sat) == IDX[-1]
    assert trading_day_on_or_before(IDX, pd.Timestamp("2025-01-01")) is None


def test_perf_stats():
    v = pd.Series([1.0, 1.2, 0.9, 1.0], index=pd.to_datetime(["2020-01-01", "2020-06-01", "2020-09-01", "2021-01-01"]))
    s = perf_stats(v)
    assert s["mdd"] == pytest.approx(0.9 / 1.2 - 1)
    assert s["cagr"] == pytest.approx(0.0, abs=1e-12)
