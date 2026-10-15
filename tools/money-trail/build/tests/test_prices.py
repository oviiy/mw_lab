from datetime import date

import pandas as pd

from sm.prices import PRICE_COLS, split_factors, update_prices, wide_adj_close


class FakeSource:
    def __init__(self):
        self.calls = []

    def fetch(self, tickers, start, end):
        self.calls.append(list(tickers))
        d = pd.to_datetime(["2025-07-31", "2025-08-01"])
        return pd.DataFrame([(dt, t, 1.0, 1.0, 0.0) for t in tickers for dt in d], columns=PRICE_COLS)


def test_update_prices_fetches_only_missing_when_fresh(tmp_path):
    p = tmp_path / "px.parquet"
    src = FakeSource()
    update_prices(src, ["AAA", "BBB"], date(2025, 7, 1), date(2025, 8, 1), p, today=date(2025, 8, 2), sleep=lambda _: None)
    update_prices(src, ["AAA", "BBB", "CCC"], date(2025, 7, 1), date(2025, 8, 1), p, today=date(2025, 8, 2), sleep=lambda _: None)
    assert src.calls == [["AAA", "BBB"], ["CCC"]]
    assert set(pd.read_parquet(p).ticker) == {"AAA", "BBB", "CCC"}


def test_update_prices_refetches_all_when_stale(tmp_path):
    p = tmp_path / "px.parquet"
    src = FakeSource()
    update_prices(src, ["AAA"], date(2025, 7, 1), date(2025, 8, 1), p, today=date(2025, 8, 2), sleep=lambda _: None)
    update_prices(src, ["AAA"], date(2025, 7, 1), date(2025, 9, 1), p, today=date(2025, 9, 2), sleep=lambda _: None)
    assert src.calls == [["AAA"], ["AAA"]]


def test_split_factors_bucket_by_period():
    periods = [date(2025, 3, 31), date(2025, 6, 30), date(2025, 9, 30)]
    px = pd.DataFrame([
        (pd.Timestamp("2025-06-30"), "AAA", 1, 1, 2.0),   # on period end -> belongs to (Mar 31, Jun 30] -> pi 1
        (pd.Timestamp("2025-08-01"), "AAA", 1, 1, 3.0),   # pi 2
        (pd.Timestamp("2025-02-01"), "AAA", 1, 1, 5.0),   # before first period -> ignored
        (pd.Timestamp("2025-08-01"), "ZZZ", 1, 1, 4.0),   # ticker not in map -> ignored
    ], columns=PRICE_COLS)
    f = split_factors(px, {"C1": "AAA", "C2": "AAA"}, periods)
    got = {(r.cusip, r.pi): r.factor for r in f.itertuples()}
    assert got == {("C1", 1): 2.0, ("C1", 2): 3.0, ("C2", 1): 2.0, ("C2", 2): 3.0}


def test_wide_adj_close_forward_fills():
    px = pd.DataFrame([(pd.Timestamp("2025-01-02"), "A", 1, 10, 0), (pd.Timestamp("2025-01-03"), "B", 1, 5, 0),
                       (pd.Timestamp("2025-01-02"), "B", 1, 4, 0)], columns=PRICE_COLS)
    w = wide_adj_close(px)
    assert w.loc["2025-01-03", "A"] == 10 and w.loc["2025-01-02", "B"] == 4


def test_update_prices_retries_dropped_tickers(tmp_path):
    class Flaky(FakeSource):
        def fetch(self, tickers, start, end):
            self.calls.append(list(tickers))
            keep = [t for t in tickers if not (t == "BBB" and len(self.calls) == 1)]   # BBB dropped on first pass
            return FakeSource.fetch(FakeSource(), keep, start, end) if keep else pd.DataFrame(columns=PRICE_COLS)
    src = Flaky()
    out = update_prices(src, ["AAA", "BBB"], date(2025, 7, 1), date(2025, 8, 1), tmp_path / "px.parquet",
                        today=date(2025, 8, 2), sleep=lambda _: None)
    assert src.calls == [["AAA", "BBB"], ["BBB"]]
    assert set(out.ticker) == {"AAA", "BBB"}
