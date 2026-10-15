"""Asset-side and debt-service metrics: where the money goes, how the gap is filled,
and whether it can be serviced. Pure functions over the quarterly/annual rows built
in quarterly.py, so they can be tested offline.
"""
from __future__ import annotations

from typing import Callable, Dict, List, Optional

GAP_USES = ("capex", "dividends", "buybacks")


# --- funding gap ----------------------------------------------------------------


def zero_ok(rows: List[dict], concept: str, upto: int, lookback: int = 8) -> bool:
    """A missing value may be read as zero only if the issuer reported nothing but zeros
    (or nothing at all) for this concept over the previous `lookback` periods."""
    window = rows[max(0, upto - lookback) : upto]
    vals = [r["values"].get(concept) for r in window if concept in r["values"]]
    return all(v == 0 for v in vals)


def funding_gap(rows: List[dict]) -> List[dict]:
    """OCF − capex − dividends − buybacks, and how the gap was filled.

    Identity (tested): gap + net_debt + cash_drawdown + other = 0, where
      net_debt      = debt issued − debt repaid
      cash_drawdown = cash & short-term securities at the start − at the end of the period
      other         = everything else (equity raised, acquisitions, FX, ...), the residual.
    A period is left out (gap = None) when a required input is missing and cannot be
    read as zero; zeros that were assumed are listed in `assumed_zero`.
    """
    out = []
    for i, r in enumerate(rows):
        v = r["values"]
        assumed: List[str] = []
        missing = False
        inputs: Dict[str, float] = {}
        for k in ("operating_cash_flow",) + GAP_USES + ("debt_issued", "debt_repaid"):
            if k in v:
                inputs[k] = v[k]
            elif k != "operating_cash_flow" and zero_ok(rows, k, i):
                inputs[k] = 0.0
                assumed.append(k)
            else:
                missing = True
        prev_cash = rows[i - 1]["values"].get("cash_and_securities") if i > 0 and _follows(rows[i - 1], r) else None
        cash = v.get("cash_and_securities")
        row = {"label": r["label"], "fy": r["fy"], "fq": r["fq"], "period_end": r["period_end"],
               "assumed_zero": assumed}
        if missing or prev_cash is None or cash is None:
            row.update({"gap": None})
            out.append(row)
            continue
        gap = inputs["operating_cash_flow"] - sum(inputs[k] for k in GAP_USES)
        net_debt = inputs["debt_issued"] - inputs["debt_repaid"]
        drawdown = prev_cash - cash
        other = -(gap + net_debt + drawdown)
        row.update({
            "ocf": inputs["operating_cash_flow"], "capex": inputs["capex"], "dividends": inputs["dividends"],
            "buybacks": inputs["buybacks"], "gap": gap, "net_debt": net_debt, "cash_drawdown": drawdown,
            "other": other,
        })
        out.append(row)
    return out


def _follows(prev: dict, cur: dict) -> bool:
    """True if `cur` is the period immediately after `prev` (quarters or fiscal years)."""
    if cur["fq"] == 0:
        return prev["fq"] == 0 and prev["fy"] == cur["fy"] - 1
    if cur["fq"] == 1:
        return prev["fy"] == cur["fy"] - 1 and prev["fq"] == 4
    return prev["fy"] == cur["fy"] and prev["fq"] == cur["fq"] - 1


# --- ratios ---------------------------------------------------------------------


def capex_intensity(rows: List[dict]) -> List[dict]:
    out = []
    for r in rows:
        v = r["values"]
        if v.get("capex") is not None and v.get("revenue"):
            out.append({"label": r["label"], "fy": r["fy"], "fq": r["fq"], "period_end": r["period_end"],
                        "capex": v["capex"], "revenue": v["revenue"], "intensity": v["capex"] / v["revenue"]})
    return out


def yoy(rows: List[dict], concept: str) -> Dict[tuple, float]:
    """Year-over-year % change keyed by (fy, fq), against the same fiscal quarter a year earlier."""
    idx = {(r["fy"], r["fq"]): r["values"].get(concept) for r in rows}
    out = {}
    for (fy, fq), val in idx.items():
        prev = idx.get((fy - 1, fq))
        if val is not None and prev:
            out[(fy, fq)] = (val / prev - 1) * 100
    return out


def capex_vs_cloud_growth(rows: List[dict], cloud: Dict[tuple, float], basis: str) -> List[dict]:
    """Capex growth next to cloud-revenue growth, both year over year, per period."""
    cg = yoy(rows, "capex")
    out = []
    for r in rows:
        k = (r["fy"], r["fq"])
        if k in cg or k in cloud:
            out.append({"label": r["label"], "fy": r["fy"], "fq": r["fq"], "period_end": r["period_end"],
                        "capex_yoy_pct": _r(cg.get(k)), "cloud_yoy_pct": _r(cloud.get(k)), "cloud_basis": basis})
    return out


def interest_coverage(quarters: List[dict]) -> List[dict]:
    """Trailing-four-quarter operating income ÷ interest expense."""
    out = []
    for i in range(3, len(quarters)):
        window = quarters[i - 3 : i + 1]
        if not all("operating_income" in q["values"] and "interest_expense" in q["values"] for q in window):
            continue
        oi = sum(q["values"]["operating_income"] for q in window)
        ie = sum(q["values"]["interest_expense"] for q in window)
        if ie <= 0:
            continue
        q = quarters[i]
        out.append({"label": q["label"], "fy": q["fy"], "fq": q["fq"], "period_end": q["period_end"],
                    "operating_income_ttm": oi, "interest_expense_ttm": ie, "coverage": oi / ie})
    return out


def _r(x: Optional[float]) -> Optional[float]:
    return None if x is None else round(x, 1)


# --- depreciation wave ----------------------------------------------------------


def straight_line(amount: float, life: float, vintage: int, year: int) -> float:
    """Depreciation in fiscal `year` of an asset bought mid-way through fiscal `vintage`
    (half-year convention) and written off straight-line over `life` years."""
    start, end = vintage + 0.5, vintage + 0.5 + life
    overlap = max(0.0, min(end, year + 1) - max(start, year))
    return amount / life * overlap


def life_schedule(history: List[dict], current: float) -> Callable[[int], float]:
    """Server life in force for capex spent in fiscal year `fy`.

    Uses the last disclosed change effective on or before that year; before the first
    change, the `from_years` the filing states (else the current life).
    """
    changes = sorted(history or [], key=lambda h: h["effective"])

    def life(fy: int) -> float:
        applicable = [h for h in changes if int(h["effective"][:4]) <= fy]
        if applicable:
            return float(applicable[-1]["years"])
        if changes and changes[0].get("from_years"):
            return float(changes[0]["from_years"])
        return float(current)

    return life


def depreciation_wave(capex_by_fy: Dict[int, float], life_of: Callable[[int], float], server_share: float,
                      other_life: float, years: List[int]) -> List[dict]:
    """Projected depreciation of capex already spent, split into servers and everything else."""
    out = []
    for y in years:
        server = sum(straight_line(c * server_share, life_of(v), v, y) for v, c in capex_by_fy.items() if v <= y)
        other = sum(straight_line(c * (1 - server_share), other_life, v, y) for v, c in capex_by_fy.items() if v <= y)
        out.append({"fy": y, "server": server, "other": other, "total": server + other})
    return out
