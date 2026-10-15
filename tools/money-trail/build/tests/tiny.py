"""Hand-built 3-period universe used by export tests. See test_export.py for the expected numbers."""
from datetime import date

import numpy as np
import pandas as pd

from sm.config import Manager, Settings, Source
from sm.export import BuildInputs
from sm.prices import PRICE_COLS

PERIODS = [date(2025, 3, 31), date(2025, 6, 30), date(2025, 9, 30)]
SETTINGS = Settings(quarters=3, change_threshold=0.02, stock_universe_top_n=10, holdings_per_quarter=150,
                    changes_per_quarter=100, manager_json_max_kb=300, stock_json_max_kb=100, data_dir_max_mb=50)
MANAGERS = [
    Manager(1, "Alpha Capital", "Ann Alpha", ["价值"], 2001, ["Fact."], [Source("src", "https://example.com/a")]),
    Manager(2, "Beta Partners", "Bob Beta", ["成长"], None, ["Fact."], [Source("src", "https://example.com/b")]),
]


def inputs() -> BuildInputs:
    p0, p1, p2 = PERIODS
    rows = [
        (1, p0, "A1", "", "AAA CORP", 100, 1000), (1, p0, "B1", "", "BBB INC", 50, 1000),
        (1, p1, "A1", "", "AAA CORP", 100, 1200), (1, p1, "B1", "", "BBB INC", 100, 2200),
        (1, p2, "A1", "", "AAA CORP", 200, 2600), (1, p2, "C1", "", "CCC LTD", 10, 500),
        (1, p2, "A1", "PUT", "AAA CORP", 100, 300),
        (2, p0, "A1", "", "AAA CORP", 10, 100),
        (2, p2, "A1", "", "AAA CORP", 20, 260), (2, p2, "U1", "", "MYSTERY CO", 5, 50),
        (3, p0, "B1", "", "BBB INC", 1000, 20000), (3, p1, "B1", "", "BBB INC", 1000, 22000),
        (3, p2, "B1", "", "BBB INC", 500, 11500), (3, p2, "C1", "", "CCC LTD", 100, 5000),
    ]
    holdings = pd.DataFrame(rows, columns=["cik", "period", "cusip", "put_call", "issuer", "shares", "value_usd"])
    holdings["title"] = "COM"
    holdings = holdings.astype({"shares": float, "value_usd": float})
    fil = [(1, p0), (1, p1), (1, p2), (2, p0), (2, p2), (3, p0), (3, p1), (3, p2)]
    first = {p0: date(2025, 5, 10), p1: date(2025, 8, 9), p2: date(2025, 11, 8)}   # Saturdays
    filings = pd.DataFrame([{"cik": c, "period": p, "first_filing_date": first[p], "name": {1: "ALPHA CAPITAL LLC", 2: "BETA PARTNERS LP", 3: "GAMMA"}[c],
                             "city": "NEW YORK", "state": "NY"} for c, p in fil])
    secmeta = pd.DataFrame([
        ("A1", "AAA", "AAA CORP", "信息技术", True, False), ("B1", "BBB", "BBB INC", "金融", True, False),
        ("C1", "CCC", "CCC LTD", "能源", True, False), ("U1", None, None, "其他", None, None),
    ], columns=["cusip", "ticker", "name", "sector", "is_equity", "is_etf"])
    shares_out = pd.DataFrame([("AAA", pd.Timestamp("2025-01-01"), 1000.0), ("BBB", pd.Timestamp("2025-01-01"), 10000.0)],
                              columns=["ticker", "end", "shares"])
    days = pd.bdate_range("2025-03-03", "2025-12-31")
    n = len(days)
    series = {"AAA": np.linspace(10, 13, n), "BBB": np.full(n, 20.0), "CCC": np.full(n, 50.0), "SPY": np.linspace(500, 550, n)}
    px = [(d, t, v[i], v[i], 2.0 if (t == "AAA" and d == pd.Timestamp("2025-08-01")) else 0.0)
          for t, v in series.items() for i, d in enumerate(days)]
    prices = pd.DataFrame(px, columns=PRICE_COLS)
    return BuildInputs(PERIODS, holdings, filings, secmeta, shares_out, prices)
