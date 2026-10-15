import pandas as pd

from run import select_universe


def test_select_universe_union_of_top_held_and_curated_top_k():
    h = pd.DataFrame([
        (10, 1, "X", "", 1, 100.0), (11, 1, "X", "", 1, 100.0), (12, 1, "Y", "", 1, 100.0),
        (1, 0, "Z", "", 1, 5.0), (1, 0, "W", "", 1, 1.0), (1, 1, "P", "PUT", 1, 9.0),
    ], columns=["cik", "pi", "cusip", "put_call", "shares", "value_usd"])
    assert select_universe(h, 2, {1}, top_n=1, top_k=1) == {"X", "Z"}
