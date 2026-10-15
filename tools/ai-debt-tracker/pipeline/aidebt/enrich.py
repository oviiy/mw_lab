"""Market and fundamentals data: FRED series, FX conversion, SEC XBRL facts."""
from __future__ import annotations

import bisect
import csv
import io
from typing import Dict, List, Optional, Tuple

from . import sec

# FRED series: credit spread indices (ICE BofA, OAS in %) and Treasury yields.
SPREAD_SERIES = {
    "ig": "BAMLC0A0CM",       # US Corporate Index OAS
    "aa": "BAMLC0A2CAA",      # AA
    "bbb": "BAMLC0A4CBBB",    # BBB
    "hy": "BAMLH0A0HYM2",     # High Yield
}

# currency -> (FRED series, True if quoted as USD per unit of currency)
FX_SERIES = {
    "EUR": ("DEXUSEU", True),
    "GBP": ("DEXUSUK", True),
    "AUD": ("DEXUSAL", True),
    "CHF": ("DEXSZUS", False),
    "JPY": ("DEXJPUS", False),
    "CAD": ("DEXCAUS", False),
}


class Series:
    """A daily FRED series with as-of lookup (last observation on or before a date)."""

    def __init__(self, rows: List[Tuple[str, float]]):
        self.dates = [d for d, _ in rows]
        self.values = [v for _, v in rows]

    def asof(self, date: str) -> Optional[float]:
        i = bisect.bisect_right(self.dates, date) - 1
        return self.values[i] if i >= 0 else None

    def since(self, start: str) -> List[Tuple[str, float]]:
        i = bisect.bisect_left(self.dates, start)
        return list(zip(self.dates[i:], self.values[i:]))


_series_cache: Dict[str, Series] = {}


def fred(series_id: str, offline: bool = False) -> Series:
    if series_id not in _series_cache:
        raw = sec.get(
            f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}",
            max_age_days=0.5,
            offline=offline,
        ).decode()
        rows = []
        for r in csv.reader(io.StringIO(raw)):
            if len(r) == 2 and r[0][:1].isdigit() and r[1] not in (".", ""):
                rows.append((r[0], float(r[1])))
        _series_cache[series_id] = Series(rows)
    return _series_cache[series_id]


def to_usd(amount: float, currency: str, date: str, offline: bool = False) -> Tuple[float, Optional[float]]:
    """Convert at the FRED noon buying rate on (or just before) the trade date."""
    if currency == "USD":
        return amount, None
    sid, usd_per_unit = FX_SERIES[currency]
    rate = fred(sid, offline).asof(date)
    if rate is None:
        raise ValueError(f"no FX rate for {currency} on {date}")
    return (amount * rate if usd_per_unit else amount / rate), rate


# --- XBRL fundamentals -------------------------------------------------------

CONCEPTS = {
    # first concept with data wins for each fiscal year
    "capex": ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets"],
    "operating_cash_flow": ["NetCashProvidedByUsedInOperatingActivities"],
    "total_debt": [
        "LongTermDebt",
        "DebtLongtermAndShorttermCombinedAmount",
        "DebtInstrumentCarryingAmount",
        "LongTermDebtNoncurrent",
    ],
    "debt_issued": [
        "ProceedsFromIssuanceOfLongTermDebt",
        "ProceedsFromIssuanceOfSeniorLongTermDebt",
        "ProceedsFromIssuanceOfDebt",
        "ProceedsFromDebtNetOfIssuanceCosts",
        "ProceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet",
    ],
    "debt_repaid": ["RepaymentsOfLongTermDebt", "RepaymentsOfDebt", "RepaymentsOfSeniorDebt"],
    "finance_lease_liabilities": ["FinanceLeaseLiability"],
}


def _annual(cik: int, concept: str, offline: bool) -> Dict[int, Tuple[float, str]]:
    url = f"https://data.sec.gov/api/xbrl/companyconcept/CIK{cik:010d}/us-gaap/{concept}.json"
    try:
        data = sec.get_json(url, max_age_days=7, offline=offline)
    except sec.FetchError:
        return {}
    out: Dict[int, Tuple[float, str]] = {}
    for f in data.get("units", {}).get("USD", []):
        if f.get("form") != "10-K" or f.get("fp") != "FY":
            continue
        # Duration facts must span ~a year; instant facts (balance sheet) have no start.
        if "start" in f:
            from datetime import date

            days = (date.fromisoformat(f["end"]) - date.fromisoformat(f["start"])).days
            if not 350 <= days <= 380:
                continue
        fy = int(f["end"][:4])  # fiscal year named by the calendar year it ends in
        # keep the latest-filed value per fiscal-year end
        prev = out.get(fy)
        if prev is None or f["filed"] >= prev[1]:
            out[fy] = (float(f["val"]), f["filed"])
    return out


def fundamentals(cik: int, years: range, offline: bool = False) -> Dict[str, Dict[int, float]]:
    result: Dict[str, Dict[int, float]] = {}
    for key, concepts in CONCEPTS.items():
        merged: Dict[int, float] = {}
        for concept in concepts:
            for fy, (val, _) in _annual(cik, concept, offline).items():
                if fy in years and fy not in merged:
                    merged[fy] = val
        result[key] = merged
    return result
