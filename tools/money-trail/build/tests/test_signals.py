import numpy as np
import pandas as pd

from sm.signals import trailing_distinct, walk_skill

D = lambda s: np.datetime64(s, "ns")  # noqa: E731


def test_walk_skill_uses_only_results_known_before_the_event():
    pid = np.array(["a"] * 7)
    date = np.array([D(f"2025-01-0{i}") for i in range(1, 8)])
    # results become known on day+3; the 7th event is on 01-07, so only results known before 01-07 count
    known = np.array([D("2025-01-02"), D("2025-01-03"), D("2025-01-04"), D("2025-01-05"), D("2025-01-06"), D("2025-01-10"), D("2025-01-11")])
    ex = np.array([0.1, 0.1, 0.1, 0.1, 0.1, 9.9, 9.9])          # the huge later results must not leak in
    skill, n = walk_skill(pid, date, known, ex, min_n=5)
    assert np.isnan(skill[:6]).all()                            # by 01-06 only 4 results (01-02..01-05) are known
    assert skill[6] == 0.1 and n[6] == 5                        # 01-07: five known results, the 9.9s are still in the future


def test_walk_skill_is_per_player():
    pid = np.array(["a", "a", "b"])
    date = np.array([D("2025-01-01"), D("2025-02-01"), D("2025-02-01")])
    known = np.array([D("2025-01-10"), D("2025-03-01"), D("2025-03-01")])
    skill, n = walk_skill(pid, date, known, np.array([0.5, 0.0, 0.0]), min_n=1)
    assert skill[1] == 0.5 and np.isnan(skill[2])


def test_trailing_distinct_window():
    t = np.array(["X", "X", "X", "X", "Y"])
    d = np.array([D("2025-01-01"), D("2025-01-20"), D("2025-02-25"), D("2025-02-26"), D("2025-02-26")])
    k = np.array(["a", "b", "a", "c", "a"])
    out = trailing_distinct(t, d, k, days=60)
    assert list(out) == [1, 2, 2, 3, 1]                         # 02-25 window starts 12-27: a,b,a → 2 distinct
