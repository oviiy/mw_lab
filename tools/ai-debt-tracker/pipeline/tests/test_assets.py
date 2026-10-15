import pytest

from aidebt import assets as A


def _row(fy, fq, **values):
    return {"label": f"FY{fy} Q{fq}", "fy": fy, "fq": fq, "period_end": f"{fy}-0{fq}-28", "values": values}


ROWS = [
    _row(2026, 1, cash_and_securities=100.0),
    _row(2026, 2, operating_cash_flow=40.0, capex=55.0, dividends=5.0, buybacks=1.0, debt_issued=30.0,
         debt_repaid=2.0, cash_and_securities=85.0),
    _row(2026, 3, operating_cash_flow=30.0, capex=50.0, buybacks=0.0, debt_issued=0.0, debt_repaid=0.0,
         cash_and_securities=60.0, dividends=6.0),
]


def test_funding_gap_identity():
    out = A.funding_gap(ROWS)
    for r in out:
        if r["gap"] is None:
            continue
        assert r["gap"] + r["net_debt"] + r["cash_drawdown"] + r["other"] == pytest.approx(0)
    q2 = out[1]
    assert q2["gap"] == 40 - 55 - 5 - 1
    assert q2["net_debt"] == 28 and q2["cash_drawdown"] == 15
    assert q2["other"] == pytest.approx(-(-21 + 28 + 15))


def test_first_period_without_opening_cash_is_skipped():
    assert A.funding_gap(ROWS)[0]["gap"] is None


def test_missing_value_assumed_zero_only_if_never_reported():
    rows = [_row(2025, q, operating_cash_flow=10.0, capex=5.0, buybacks=0.0, debt_issued=0.0, debt_repaid=0.0,
                 cash_and_securities=50.0) for q in (1, 2, 3)]
    out = A.funding_gap(rows)  # no dividends ever reported -> zero, and flagged
    assert out[2]["gap"] == 5.0 and out[2]["assumed_zero"] == ["dividends"]
    rows[1]["values"]["dividends"] = 2.0  # dividends reported once, then missing -> period incomplete
    assert A.funding_gap(rows)[2]["gap"] is None


def test_gap_requires_consecutive_periods():
    rows = [ROWS[0], ROWS[2]]  # Q2 missing: Q3 cannot use Q1's cash as its opening balance
    assert A.funding_gap(rows)[1]["gap"] is None


def test_interest_coverage_ttm():
    qs = [_row(2025, q, operating_income=10.0, interest_expense=2.0) for q in (1, 2, 3, 4)]
    out = A.interest_coverage(qs)
    assert len(out) == 1 and out[0]["coverage"] == 5.0


def test_straight_line_half_year_totals():
    life = 6
    total = sum(A.straight_line(600.0, life, 2024, y) for y in range(2020, 2040))
    assert total == pytest.approx(600.0)
    assert A.straight_line(600.0, life, 2024, 2024) == pytest.approx(50.0)  # half a year in year one
    assert A.straight_line(600.0, life, 2024, 2025) == pytest.approx(100.0)
    assert A.straight_line(600.0, life, 2024, 2030) == pytest.approx(50.0)  # last half year
    assert A.straight_line(600.0, life, 2024, 2031) == 0


def test_life_schedule_follows_history():
    hist = [{"effective": "2024-01-01", "years": 6, "from_years": 5}, {"effective": "2025-01-01", "years": 5}]
    life = A.life_schedule(hist, current=5)
    assert [life(2022), life(2024), life(2025), life(2027)] == [5, 6, 5, 5]
    assert A.life_schedule([], current=6)(2020) == 6


def test_depreciation_wave_projection():
    capex = {2024: 100.0, 2025: 200.0}
    out = A.depreciation_wave(capex, lambda fy: 5.0, server_share=0.5, other_life=20.0, years=[2025, 2026])
    by = {r["fy"]: r for r in out}
    # servers: 2024 vintage full year (50/5) + 2025 vintage half year (100/5/2)
    assert by[2025]["server"] == pytest.approx(10 + 10)
    assert by[2026]["server"] == pytest.approx(10 + 20)
    assert by[2026]["other"] == pytest.approx(50 / 20 + 100 / 20)
    assert by[2026]["total"] == pytest.approx(by[2026]["server"] + by[2026]["other"])


def test_capex_intensity_and_yoy():
    rows = [_row(2025, 1, capex=10.0, revenue=100.0), _row(2026, 1, capex=15.0, revenue=120.0)]
    assert A.capex_intensity(rows)[1]["intensity"] == pytest.approx(0.125)
    assert A.yoy(rows, "capex")[(2026, 1)] == pytest.approx(50.0)
