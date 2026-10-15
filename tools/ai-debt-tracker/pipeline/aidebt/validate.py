"""Deterministic checks on LLM-extracted tranches.

A tranche is published only if every applicable check passes, or a human has
signed it off in config/overrides.yaml. Everything else lands in the review
queue with the reasons.
"""
from __future__ import annotations

import datetime as dt
import re
from dataclasses import dataclass, field
from typing import List, Optional

MAX_SPREAD_GAP_BP = 5.0   # stated spread vs (YTM - benchmark yield)
MAX_YIELD_GAP_BP = 5.0    # stated YTM vs YTM recomputed from price/coupon/tenor


@dataclass
class Check:
    ok: bool
    issues: List[str] = field(default_factory=list)


def _date(s: Optional[str]) -> Optional[dt.date]:
    if not s:
        return None
    try:
        return dt.date.fromisoformat(s)
    except ValueError:
        return None


def _norm(s: str) -> str:
    s = s.replace("’", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"[\s|]+", " ", s).strip().lower()


def quote_in_source(quote: Optional[str], source: str) -> bool:
    """Verbatim check, tolerant to whitespace/table-pipe differences and '...' elisions."""
    if not quote:
        return False
    src = _norm(source)
    pieces = [p for p in re.split(r"\.\.\.|…", _norm(quote)) if len(p.strip()) >= 8]
    return bool(pieces) and all(p.strip() in src for p in pieces)


def ytm_from_price(price_pct: float, coupon_pct: float, settle: dt.date, maturity: dt.date) -> float:
    """Semi-annual yield for a new-issue bullet bond (no accrued; short first coupon prorated)."""
    n = (maturity - settle).days / 365.25 * 2  # coupon periods to maturity
    c = coupon_pct / 2
    times = [n - j for j in range(int(n) + 1) if n - j > 1e-9]

    def pv(y: float) -> float:
        r = y / 200
        flows = 0.0
        for t in times:
            amt = c if t >= 1 else c * t  # first (short) coupon is prorated
            flows += amt / (1 + r) ** t
        return flows + 100 / (1 + r) ** n

    lo, hi = -5.0, 30.0
    for _ in range(100):
        mid = (lo + hi) / 2
        if pv(mid) > price_pct:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def check_tranche(t: dict, trade_date: Optional[str], settlement_date: Optional[str], source: str) -> Check:
    issues: List[str] = []
    td = _date(trade_date)
    mat = _date(t.get("maturity_date"))
    amount = t.get("amount")

    if not isinstance(amount, (int, float)) or amount <= 0:
        issues.append("amount missing or non-positive")
    elif t.get("currency", "USD") == "USD" and amount < 1e6:
        issues.append(f"amount {amount} looks like it is in millions")
    if td is None:
        issues.append("trade_date missing")
    if mat is None:
        issues.append("maturity_date missing")
    elif td and mat <= td:
        issues.append("maturity before trade date")
    c = t.get("coupon_pct")
    if c is not None and not (0 <= c <= 15):
        issues.append(f"coupon {c}% out of range")
    if c is None and t.get("instrument_type") in ("senior_notes", "secured_notes"):
        issues.append("fixed-rate note without coupon")
    s = t.get("spread_bp")
    if s is not None and not (0 <= s <= 1000):
        issues.append(f"spread {s}bp out of range")

    ytm, by = t.get("ytm_pct"), t.get("benchmark_yield_pct")
    if s is not None and ytm is not None and by is not None:
        gap = abs((ytm - by) * 100 - s)
        if gap > MAX_SPREAD_GAP_BP:
            issues.append(f"spread cross-check failed: YTM-benchmark={(ytm - by) * 100:.1f}bp vs stated {s}bp")

    price = t.get("price_pct")
    settle = _date(settlement_date) or td
    if price and c is not None and ytm is not None and settle and mat and t.get("currency", "USD") == "USD":
        calc = ytm_from_price(price, c, settle, mat)
        if abs(calc - ytm) * 100 > MAX_YIELD_GAP_BP:
            issues.append(f"yield cross-check failed: recomputed {calc:.3f}% vs stated {ytm}%")

    if not quote_in_source(t.get("quote"), source):
        issues.append("quote not found verbatim in source")
    return Check(ok=not issues, issues=issues)


def dedupe_key(issuer_id: str, t: dict) -> tuple:
    return (
        issuer_id,
        t.get("currency", "USD"),
        round(float(t.get("amount") or 0) / 1e6),
        t.get("maturity_date"),
        None if t.get("coupon_pct") is None else round(float(t["coupon_pct"]), 3),
        t.get("instrument_type"),
    )
