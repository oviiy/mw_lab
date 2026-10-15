import numpy as np
import pandas as pd
import pytest

from sm.metrics import classify, crowding_scores, hhi, manager_history, stock_panel, top_n_weight, turnover


def S(d):
    return pd.Series(d, dtype=float)


def test_classify_handles_split_and_all_kinds():
    cls = classify(S({"A": 100, "B": 50, "D": 10}), S({"A": 200, "B": 100, "C": 5}), S({"A": 2.0}), 0.02)
    assert cls.kind.to_dict() == {"A": "hold", "B": "add", "C": "new", "D": "exit"}
    assert cls.loc["B", "chg"] == 50 and cls.loc["A", "prev_adj"] == 200


def test_classify_threshold():
    cls = classify(S({"A": 100, "B": 100, "C": 100}), S({"A": 101, "B": 103, "C": 97}), None, 0.02)
    assert cls.kind.to_dict() == {"A": "hold", "B": "add", "C": "trim"}


def test_turnover():
    cls = classify(S({"A": 100, "B": 50, "D": 10}), S({"A": 200, "B": 100, "C": 5}), S({"A": 2.0}), 0.02)
    t = turnover(cls, S({"A": 13, "B": 22, "C": 50}), S({"A": 5, "B": 20, "D": 7}), 2000, 3000)
    assert t == pytest.approx(70 / 2500)   # buys 1350, sells 70


def test_concentration():
    assert hhi(S({"a": .5, "b": .5})) == pytest.approx(.5)
    assert top_n_weight(S({"a": .5, "b": .3, "c": .2}), 2) == pytest.approx(.8)


def test_manager_history_skips_missing_quarter():
    hm = pd.DataFrame([(0, "A", 10, 100.0), (2, "A", 10, 130.0), (2, "U", 5, 50.0)],
                      columns=["pi", "cusip", "shares", "value_usd"])
    series, changes = manager_history(hm, 3, pd.DataFrame(), 0.02)
    assert series["value"] == [100.0, None, 180.0]
    assert series["n"] == [1, None, 2]
    assert list(changes) == [2]
    cls, prev_pi = changes[2]
    assert prev_pi == 0 and cls.kind.to_dict() == {"A": "hold", "U": "new"}
    assert series["hold_q"][2] == pytest.approx(1.0)   # run resets after a gap


def test_manager_history_consecutive_runs_and_split():
    hm = pd.DataFrame([(0, "A", 100, 1000.0), (1, "A", 200, 1300.0)], columns=["pi", "cusip", "shares", "value_usd"])
    fac = pd.DataFrame({1: [2.0]}, index=["A"])
    series, changes = manager_history(hm, 2, fac, 0.02)
    assert changes[1][0].kind["A"] == "hold"
    assert series["hold_q"] == [1.0, 2.0]
    assert series["turnover"] == [None, 0.0]


def test_stock_panel_flows_require_both_filings():
    h = pd.DataFrame([
        (3, 0, "BBB", 1000, 20000), (3, 1, "BBB", 1000, 22000), (3, 2, "BBB", 500, 11500),
        (1, 1, "BBB", 100, 2200), (1, 2, "AAA", 200, 2600),
    ], columns=["cik", "pi", "cusip", "shares", "value_usd"]).astype({"shares": float, "value_usd": float})
    filers = pd.DataFrame([(3, 0), (3, 1), (3, 2), (1, 1), (1, 2)], columns=["cik", "pi"])
    holders, flows = stock_panel(h, filers, pd.DataFrame(columns=["cusip", "pi", "factor"]), {1}, 0.02)
    b2 = flows[(flows.cusip == "BBB") & (flows.pi == 2)].set_index(["kind", "grp"])
    assert b2.loc[("exit", "curated"), "dollars"] == pytest.approx(2200)
    assert b2.loc[("trim", "other"), "dollars"] == pytest.approx(11500)
    assert flows[(flows.cusip == "BBB") & (flows.pi == 1)].empty   # cik1 did not file at pi 0; cik3 held flat
    assert holders.set_index(["cusip", "pi"]).loc[("BBB", 2), "holders"] == 1


def test_crowding_scores():
    df = pd.DataFrame({"curated_holders": [0, 1, 2], "pct_held": [0.1, 0.2, np.nan], "avg_curated_w": [0, .01, .05]})
    assert list(crowding_scores(df)) == [38.9, 77.8, 100.0]
