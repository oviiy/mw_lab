"""Quarterly (and fiscal-year) fundamentals from SEC XBRL company facts.

Cash-flow statements in 10-Qs are year-to-date, so single quarters are derived:
Q1 = 3-month YTD, Qn = YTD(n) - YTD(n-1), Q4 = full year (10-K) - 9-month YTD.
Income-statement items usually also come as ~90-day facts; those are used directly.
Balance-sheet items are point-in-time and are taken as reported.

Fiscal years follow each company's own calendar (Microsoft ends in June, Oracle
in May): a fiscal year is identified by the start date its YTD facts share and is
labelled by the calendar year in which it ends. Every value records the XBRL tag
it came from and the accession number(s) of the filing(s), so it can be traced.
"""
from __future__ import annotations

import datetime as dt
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence, Tuple

from . import sec

FORMS = ("10-Q", "10-K", "10-Q/A", "10-K/A")

# Flow concepts: first tag with data for a given period wins.
FLOW_CONCEPTS: Dict[str, List[str]] = {
    "revenue": ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax"],
    "operating_income": ["OperatingIncomeLoss"],
    "interest_expense": ["InterestExpense", "InterestExpenseNonoperating", "InterestExpenseDebt"],
    "depreciation": ["DepreciationDepletionAndAmortization", "DepreciationAmortizationAndAccretionNet", "Depreciation"],
    # PaymentsOfOrdinaryDividends: Alphabet's tag from 2026 Q2, after it issued preferred stock
    "dividends": ["PaymentsOfDividends", "PaymentsOfDividendsCommonStock", "PaymentsOfOrdinaryDividends"],
    "buybacks": ["PaymentsForRepurchaseOfCommonStock"],
    "capex": ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets"],
    "operating_cash_flow": ["NetCashProvidedByUsedInOperatingActivities"],
    "debt_issued": [
        "ProceedsFromIssuanceOfLongTermDebt",
        "ProceedsFromIssuanceOfSeniorLongTermDebt",
        "ProceedsFromIssuanceOfDebt",
        "ProceedsFromDebtNetOfIssuanceCosts",
        "ProceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet",
        "ProceedsFromDebtMaturingInMoreThanThreeMonths",  # Microsoft
    ],
    "debt_repaid": [
        "RepaymentsOfLongTermDebt",
        "RepaymentsOfDebt",
        "RepaymentsOfSeniorDebt",
        "RepaymentsOfDebtMaturingInMoreThanThreeMonths",  # Microsoft
        "RepaymentsOfDebtAndCapitalLeaseObligations",  # Alphabet
    ],
}

# Cash and short-term securities: the combined tag if reported, otherwise cash plus
# the first short-term securities tag that has a value on the same date.
CASH_COMBINED = "CashCashEquivalentsAndShortTermInvestments"
CASH_ONLY = "CashAndCashEquivalentsAtCarryingValue"
SHORT_TERM_SECURITIES = ["ShortTermInvestments", "MarketableSecuritiesCurrent", "AvailableForSaleSecuritiesDebtSecuritiesCurrent"]


@dataclass
class Fact:
    start: Optional[str]
    end: str
    val: float
    accn: str
    filed: str
    form: str


@dataclass
class Value:
    val: float
    tag: str
    accns: List[str]
    method: str  # direct | ytd_diff | annual_minus_ytd | instant | sum

    def to_dict(self) -> dict:
        return {"val": self.val, "tag": self.tag, "accns": self.accns, "method": self.method}


@dataclass
class Period:
    fy: int
    fq: int  # 1..4; 0 for a fiscal-year row
    start: str
    end: str
    values: Dict[str, Value] = field(default_factory=dict)

    @property
    def label(self) -> str:
        return f"FY{self.fy}" if self.fq == 0 else f"FY{self.fy} Q{self.fq}"


def _d(s: str) -> dt.date:
    return dt.date.fromisoformat(s)


def _days(start: str, end: str) -> int:
    return (_d(end) - _d(start)).days


def company_facts(cik: int, offline: bool = False) -> dict:
    data = sec.get_json(
        f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik:010d}.json", max_age_days=7, offline=offline
    )
    return data.get("facts", {}).get("us-gaap", {})


def tag_facts(gaap: dict, tag: str) -> List[Fact]:
    """USD facts for one tag from 10-K/10-Q filings; latest filing wins per period."""
    best: Dict[Tuple[Optional[str], str], Fact] = {}
    for f in gaap.get(tag, {}).get("units", {}).get("USD", []):
        if f.get("form") not in FORMS:
            continue
        key = (f.get("start"), f["end"])
        fact = Fact(f.get("start"), f["end"], float(f["val"]), f["accn"], f["filed"], f["form"])
        if key not in best or fact.filed >= best[key].filed:
            best[key] = fact
    return list(best.values())


# --- fiscal calendar ----------------------------------------------------------


def fiscal_starts(gaap: dict) -> List[str]:
    """Fiscal-year start dates, read off year-to-date cash-flow facts (which all share the FY start)."""
    starts = set()
    for tag in ("NetCashProvidedByUsedInOperatingActivities",):
        for f in tag_facts(gaap, tag):
            if f.start and 80 <= _days(f.start, f.end) <= 380:
                starts.add(f.start)
    # drop starts that fall inside another fiscal year (e.g. stray 3-month facts)
    ordered = sorted(starts)
    out: List[str] = []
    for s in ordered:
        if not out or _days(out[-1], s) >= 300:
            out.append(s)
    return out


def fiscal_year_of(start: str) -> int:
    """A fiscal year is named for the calendar year in which it ends."""
    end = _d(start) + dt.timedelta(days=364)
    return end.year


def quarter_index(fy_start: str, end: str) -> int:
    return max(1, min(4, round(_days(fy_start, end) / 91.3)))


# --- flow concepts --------------------------------------------------------------


def _merged(gaap: dict, tags: Sequence[str]) -> Dict[Tuple[str, str], Tuple[Fact, str]]:
    """Duration facts across the candidate tags; for each period the first tag in order wins."""
    out: Dict[Tuple[str, str], Tuple[Fact, str]] = {}
    for tag in tags:
        for f in tag_facts(gaap, tag):
            if f.start and (f.start, f.end) not in out:
                out[(f.start, f.end)] = (f, tag)
    return out


def quarterly_flow(gaap: dict, tags: Sequence[str], starts: List[str]) -> Dict[Tuple[int, int], Value]:
    """Single-quarter values keyed by (fiscal year, quarter).

    Tags are tried in order per period. A quarter derived by subtraction may combine two
    tags when a company re-tags mid-year (e.g. Alphabet's dividends in 2026); the value
    then records both, as "TagA-TagB".
    """
    facts = _merged(gaap, tags)
    out: Dict[Tuple[int, int], Value] = {}
    for i, s in enumerate(starts):
        fy_end = starts[i + 1] if i + 1 < len(starts) else (_d(s) + dt.timedelta(days=372)).isoformat()
        fy = fiscal_year_of(s)
        cum = {e: ft for (st, e), ft in facts.items() if st == s and 80 <= _days(st, e) <= 380}
        direct = {e: ft for (st, e), ft in facts.items() if s <= st < fy_end and 80 <= _days(st, e) <= 100}
        for e in sorted(set(cum) | set(direct)):
            q = quarter_index(s, e)
            if (fy, q) in out:
                continue
            if e in direct:
                f, tag = direct[e]
                out[(fy, q)] = Value(f.val, tag, [f.accn], "direct")
                continue
            prev_ends = [p for p in cum if p < e]
            if not prev_ends:
                continue
            p = max(prev_ends)
            if quarter_index(s, p) != q - 1:
                continue  # a cumulative period is missing; do not bridge two quarters
            (fe, te), (fp, tp) = cum[e], cum[p]
            tag = te if te == tp else f"{te}-{tp}"
            method = "annual_minus_ytd" if q == 4 else "ytd_diff"
            out[(fy, q)] = Value(fe.val - fp.val, tag, [fe.accn, fp.accn], method)
    return out


def annual_flow(gaap: dict, tags: Sequence[str]) -> Dict[int, Value]:
    out: Dict[int, Value] = {}
    for tag in tags:
        for f in tag_facts(gaap, tag):
            if f.start and f.form.startswith("10-K") and 350 <= _days(f.start, f.end) <= 380:
                fy = fiscal_year_of(f.start)
                if fy not in out:
                    out[fy] = Value(f.val, tag, [f.accn], "direct")
    return out


# --- balance sheet --------------------------------------------------------------


def cash_and_securities(gaap: dict) -> Dict[str, Value]:
    """Point-in-time cash plus short-term securities, keyed by period end."""
    out: Dict[str, Value] = {}
    for f in tag_facts(gaap, CASH_COMBINED):
        if not f.start:
            out[f.end] = Value(f.val, CASH_COMBINED, [f.accn], "instant")
    cash = {f.end: f for f in tag_facts(gaap, CASH_ONLY) if not f.start}
    for tag in SHORT_TERM_SECURITIES:
        sec_facts = {f.end: f for f in tag_facts(gaap, tag) if not f.start}
        for end, c in cash.items():
            if end in out or end not in sec_facts:
                continue
            s = sec_facts[end]
            out[end] = Value(c.val + s.val, f"{CASH_ONLY}+{tag}", sorted({c.accn, s.accn}), "sum")
    for end, c in cash.items():  # no securities tag at all: cash alone, labelled as such
        if end not in out:
            out[end] = Value(c.val, CASH_ONLY, [c.accn], "instant")
    return out


# --- assembly -------------------------------------------------------------------


def build(cik: int, since_fy: int = 2019, offline: bool = False) -> Tuple[List[Period], List[Period]]:
    """Return (quarters, fiscal_years) with every concept the company reports."""
    gaap = company_facts(cik, offline)
    starts = fiscal_starts(gaap)
    quarters: Dict[Tuple[int, int], Period] = {}
    years: Dict[int, Period] = {}

    # quarter boundaries come from the cash-flow statement, which every filer reports
    cfo_tag = FLOW_CONCEPTS["operating_cash_flow"]
    for i, s in enumerate(starts):
        fy = fiscal_year_of(s)
        if fy < since_fy:
            continue
        ends = sorted(
            {f.end for f in tag_facts(gaap, cfo_tag[0]) if f.start == s and 80 <= _days(f.start, f.end) <= 380}
        )
        prev_end = (_d(s) - dt.timedelta(days=1)).isoformat()
        for e in ends:
            q = quarter_index(s, e)
            quarters[(fy, q)] = Period(fy, q, (_d(prev_end) + dt.timedelta(days=1)).isoformat(), e)
            prev_end = e
            if q == 4:
                years[fy] = Period(fy, 0, s, e)

    for key, tags in FLOW_CONCEPTS.items():
        for (fy, q), v in quarterly_flow(gaap, tags, starts).items():
            if (fy, q) in quarters:
                quarters[(fy, q)].values[key] = v
        for fy, v in annual_flow(gaap, tags).items():
            if fy in years:
                years[fy].values[key] = v

    cash = cash_and_securities(gaap)
    for p in list(quarters.values()) + list(years.values()):
        if p.end in cash:
            p.values["cash_and_securities"] = cash[p.end]

    return (
        [quarters[k] for k in sorted(quarters)],
        [years[k] for k in sorted(years)],
    )


def to_rows(periods: List[Period], cik: int) -> List[dict]:
    rows = []
    for p in periods:
        rows.append(
            {
                "fy": p.fy,
                "fq": p.fq,
                "label": p.label,
                "period_start": p.start,
                "period_end": p.end,
                "values": {k: v.val for k, v in p.values.items()},
                "sources": {
                    k: {**v.to_dict(), "urls": [sec.filing_index_url(cik, a) for a in v.accns]}
                    for k, v in p.values.items()
                },
            }
        )
    return rows
