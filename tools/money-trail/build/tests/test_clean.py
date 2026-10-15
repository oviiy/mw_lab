import zipfile
from datetime import date
from pathlib import Path

import pandas as pd
import pytest

from sm.clean import build_holdings, complete_periods, effective_accessions, filings_table, load_submissions
from sm.ingest_13f import zip_to_parquet

FIX = Path(__file__).parent / "fixtures" / "brk"


@pytest.fixture(scope="module")
def brk_dir(tmp_path_factory):
    tmp = tmp_path_factory.mktemp("brk")
    zp = tmp / "brk.zip"
    with zipfile.ZipFile(zp, "w") as z:
        for t in ["SUBMISSION", "COVERPAGE", "SUMMARYPAGE", "INFOTABLE"]:
            z.write(FIX / f"{t}.tsv", f"{t}.tsv")
    return zip_to_parquet(zp, tmp / "pq")


def test_berkshire_golden(brk_dir):
    subs = load_submissions([brk_dir])
    assert set(subs.period) == {date(2022, 9, 30), date(2025, 12, 31)}
    eff = effective_accessions(subs)
    h = build_holdings([brk_dir], eff)
    eq = h[h.put_call == ""]
    q25 = eq[eq.period == date(2025, 12, 31)].set_index("cusip")
    q22 = eq[eq.period == date(2022, 9, 30)].set_index("cusip")
    # 2025Q4: VALUE already in dollars (filed 2026-02-17). Totals match SUMMARYPAGE TABLEVALUETOTAL.
    assert q25.loc["037833100", "shares"] == 227_917_808
    assert q25.loc["037833100", "value_usd"] == 61_961_735_283
    assert q25.value_usd.sum() == 274_160_086_701
    top10 = list(q25.value_usd.nlargest(10).index)
    assert top10[:4] == ["037833100", "025816109", "060505104", "191216100"]  # AAPL, AXP, BAC, KO
    # 2022Q3: filed 2022-11-14, VALUE in thousands -> multiplied by 1000.
    assert q22.loc["037833100", "shares"] == 894_802_319
    assert q22.loc["037833100", "value_usd"] == 123_661_679_000
    assert q22.value_usd.sum() == 296_096_640_000


def _subs(rows):
    df = pd.DataFrame(rows, columns=["acc", "cik", "filing_date", "period", "is_amendment", "amendment_type"])
    df["name"] = "X"; df["city"] = ""; df["state"] = ""
    return df


P = date(2025, 6, 30)


def test_restatement_replaces_original():
    subs = _subs([("a", 1, date(2025, 8, 1), P, False, ""), ("b", 1, date(2025, 9, 1), P, True, "RESTATEMENT")])
    eff = effective_accessions(subs)
    assert list(eff.acc) == ["b"]
    assert eff.first_filing_date.iloc[0] == date(2025, 8, 1)


def test_new_holdings_appends():
    subs = _subs([("a", 1, date(2025, 8, 1), P, False, ""), ("b", 1, date(2025, 9, 1), P, True, "NEW HOLDINGS")])
    assert sorted(effective_accessions(subs).acc) == ["a", "b"]


def test_new_holdings_before_restatement_dropped_and_blank_type_is_restatement():
    subs = _subs([
        ("a", 1, date(2025, 8, 1), P, False, ""),
        ("b", 1, date(2025, 8, 5), P, True, "NEW HOLDINGS"),
        ("c", 1, date(2025, 9, 1), P, True, ""),
        ("d", 1, date(2025, 9, 9), P, True, "NEW HOLDINGS"),
    ])
    assert sorted(effective_accessions(subs).acc) == ["c", "d"]


def test_orphan_new_holdings_dropped():
    subs = _subs([("a", 1, date(2025, 8, 1), P, True, "NEW HOLDINGS")])
    assert effective_accessions(subs).empty


def test_complete_periods_drops_partial_tail():
    rows = []
    for i, (p, n) in enumerate([(date(2025, 3, 31), 100), (date(2025, 6, 30), 100), (date(2025, 9, 30), 100),
                                (date(2025, 12, 31), 100), (date(2026, 3, 31), 100), (date(2026, 6, 30), 30)]):
        rows += [{"cik": c, "period": p, "acc": f"{i}-{c}"} for c in range(n)]
    eff = pd.DataFrame(rows)
    assert complete_periods(eff, 3) == [date(2025, 9, 30), date(2025, 12, 31), date(2026, 3, 31)]


def test_filings_table_uses_latest_name(brk_dir):
    subs = load_submissions([brk_dir])
    ft = filings_table(subs, effective_accessions(subs))
    row = ft[ft.period == date(2025, 12, 31)].iloc[0]
    assert row["name"] == "Berkshire Hathaway Inc" and row["cik"] == 1067983


def test_fix_thousands_rescales_filers_still_reporting_in_thousands():
    from sm.clean import fix_thousands
    h = pd.DataFrame([
        (1, date(2025, 6, 30), "A", "", 1000.0, 300.0),      # $0.30 a share -> really $300K
        (1, date(2025, 6, 30), "B", "", 2000.0, 100.0),
        (2, date(2025, 6, 30), "A", "", 1000.0, 300_000.0),  # normal filer, $300 a share
    ], columns=["cik", "period", "cusip", "put_call", "shares", "value_usd"])
    out = fix_thousands(h)
    assert list(out["value_usd"]) == [300_000.0, 100_000.0, 300_000.0]
