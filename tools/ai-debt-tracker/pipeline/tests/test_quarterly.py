"""Single-quarter derivation from year-to-date XBRL facts, including non-calendar fiscal years."""
from aidebt import quarterly as Q


def _fact(start, end, val, accn="a", filed="2026-01-01", form="10-Q"):
    return {"start": start, "end": end, "val": val, "accn": accn, "filed": filed, "form": form}


def _gaap(**tags):
    return {tag: {"units": {"USD": facts}} for tag, facts in tags.items()}


def _cash_flow_year(start, ends, ytd, annual_form="10-K"):
    """YTD facts sharing one fiscal-year start; the last one is the 10-K full year."""
    facts = [_fact(start, e, v, accn=f"acc-{e}") for e, v in zip(ends[:-1], ytd[:-1])]
    facts.append(_fact(start, ends[-1], ytd[-1], accn=f"acc-{ends[-1]}", form=annual_form))
    return facts


# Microsoft-style fiscal year: July–June, named for the June in which it ends.
MSFT_ENDS = ["2025-09-30", "2025-12-31", "2026-03-31", "2026-06-30"]
MSFT_YTD = [19.39, 49.27, 80.15, 115.95]  # capex YTD, $B


def test_ytd_subtraction_june_fiscal_year():
    g = _gaap(PaymentsToAcquirePropertyPlantAndEquipment=_cash_flow_year("2025-07-01", MSFT_ENDS, MSFT_YTD),
              NetCashProvidedByUsedInOperatingActivities=_cash_flow_year("2025-07-01", MSFT_ENDS, [1, 2, 3, 4]))
    starts = Q.fiscal_starts(g)
    assert starts == ["2025-07-01"]
    out = Q.quarterly_flow(g, ["PaymentsToAcquirePropertyPlantAndEquipment"], starts)
    assert sorted(out) == [(2026, 1), (2026, 2), (2026, 3), (2026, 4)]
    vals = [round(out[(2026, q)].val, 2) for q in (1, 2, 3, 4)]
    assert vals == [19.39, 29.88, 30.88, 35.80]
    assert out[(2026, 1)].method == "direct"
    assert out[(2026, 2)].method == "ytd_diff"
    assert out[(2026, 4)].method == "annual_minus_ytd"  # Q4 = full year − nine months
    assert out[(2026, 4)].accns == ["acc-2026-06-30", "acc-2026-03-31"]


def test_may_fiscal_year_labels_and_quarters():
    # Oracle: June–May, FY2026 ends 2026-05-31
    ends = ["2025-08-31", "2025-11-30", "2026-02-28", "2026-05-31"]
    g = _gaap(NetCashProvidedByUsedInOperatingActivities=_cash_flow_year("2025-06-01", ends, [8.14, 10.21, 17.36, 31.98]))
    starts = Q.fiscal_starts(g)
    out = Q.quarterly_flow(g, ["NetCashProvidedByUsedInOperatingActivities"], starts)
    assert Q.fiscal_year_of("2025-06-01") == 2026
    assert [Q.quarter_index("2025-06-01", e) for e in ends] == [1, 2, 3, 4]
    assert round(out[(2026, 2)].val, 2) == 2.07
    assert round(out[(2026, 4)].val, 2) == 14.62


def test_direct_quarter_facts_preferred_over_subtraction():
    ends = ["2025-03-31", "2025-06-30"]
    facts = [_fact("2025-01-01", "2025-03-31", 10), _fact("2025-01-01", "2025-06-30", 25),
             _fact("2025-04-01", "2025-06-30", 14.9)]  # income statement 3-month fact
    g = _gaap(Revenues=facts, NetCashProvidedByUsedInOperatingActivities=[_fact("2025-01-01", e, 1) for e in ends])
    out = Q.quarterly_flow(g, ["Revenues"], Q.fiscal_starts(g))
    assert out[(2025, 2)].val == 14.9 and out[(2025, 2)].method == "direct"


def test_missing_ytd_period_is_not_bridged():
    # Q2 YTD missing: Q3 must not be computed as nine months − three months
    facts = [_fact("2025-01-01", "2025-03-31", 10), _fact("2025-01-01", "2025-09-30", 40)]
    g = _gaap(X=facts, NetCashProvidedByUsedInOperatingActivities=facts)
    out = Q.quarterly_flow(g, ["X"], Q.fiscal_starts(g))
    assert (2025, 3) not in out


def test_latest_filing_wins_for_restated_period():
    facts = [_fact("2025-01-01", "2025-03-31", 10, accn="old", filed="2025-04-30"),
             _fact("2025-01-01", "2025-03-31", 11, accn="new", filed="2026-04-30")]
    g = _gaap(X=facts, NetCashProvidedByUsedInOperatingActivities=facts)
    out = Q.quarterly_flow(g, ["X"], Q.fiscal_starts(g))
    assert out[(2025, 1)].val == 11 and out[(2025, 1)].accns == ["new"]


def test_tag_fallback_order():
    cf = [_fact("2025-01-01", "2025-03-31", 1), _fact("2025-01-01", "2025-06-30", 2)]
    g = _gaap(
        NetCashProvidedByUsedInOperatingActivities=cf,
        First=[_fact("2025-01-01", "2025-03-31", 100)],  # has Q1 only
        Second=[_fact("2025-01-01", "2025-03-31", 999), _fact("2025-01-01", "2025-06-30", 1250)],
    )
    out = Q.quarterly_flow(g, ["First", "Second"], Q.fiscal_starts(g))
    assert out[(2025, 1)].val == 100 and out[(2025, 1)].tag == "First"  # first tag wins where it has data
    # Q2 falls back to Second's YTD, minus First's Q1: the value records both tags
    assert out[(2025, 2)].val == 1150 and out[(2025, 2)].tag == "Second-First"


def test_cash_and_securities_combined_tag_then_sum():
    g = _gaap(
        CashCashEquivalentsAndShortTermInvestments=[{"end": "2025-03-31", "val": 50, "accn": "a", "filed": "f", "form": "10-Q"}],
        CashAndCashEquivalentsAtCarryingValue=[{"end": "2025-03-31", "val": 1, "accn": "a", "filed": "f", "form": "10-Q"},
                                               {"end": "2025-06-30", "val": 20, "accn": "b", "filed": "f", "form": "10-Q"}],
        MarketableSecuritiesCurrent=[{"end": "2025-06-30", "val": 30, "accn": "b", "filed": "f", "form": "10-Q"}],
    )
    cash = Q.cash_and_securities(g)
    assert cash["2025-03-31"].val == 50 and cash["2025-03-31"].method == "instant"
    assert cash["2025-06-30"].val == 50 and cash["2025-06-30"].tag.endswith("+MarketableSecuritiesCurrent")
