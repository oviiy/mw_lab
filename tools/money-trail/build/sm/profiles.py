"""Company profile facts for stock pages: SEC registration details plus Yahoo Finance quote fields.

Only factual fields are kept (industry, location, headcount, financial ratios); Yahoo's licensed business descriptions
are not stored. The intro sentence shown on the site is composed from these facts.
"""
from __future__ import annotations

import json
import time
from pathlib import Path

from .config import CACHE_DIR
from .sec import SecClient, SecError

SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{cik:010d}.json"
YF_FIELDS = ["longName", "industry", "sector", "city", "state", "country", "fullTimeEmployees", "website", "marketCap",
             "totalRevenue", "revenueGrowth", "profitMargins", "grossMargins", "trailingPE", "forwardPE", "dividendYield",
             "beta", "52WeekChange", "returnOnEquity", "freeCashflow", "exchange", "quoteType", "currency"]
MONTH = 30 * 86400


def sec_facts(client: SecClient, cik: int) -> dict:
    try:
        j = client.get_json(SUBMISSIONS_URL.format(cik=cik), max_age_s=MONTH)
    except SecError:
        return {}
    addr = (j.get("addresses") or {}).get("business") or {}
    return {"cik": cik, "sec_name": j.get("name"), "sic_desc": j.get("sicDescription"), "inc": j.get("stateOfIncorporation"),
            "fye": j.get("fiscalYearEnd"), "exchanges": j.get("exchanges") or [], "filer": j.get("category"),
            "sec_city": (addr.get("city") or "").title(), "sec_state": addr.get("stateOrCountryDescription") or addr.get("stateOrCountry")}


def yahoo_facts(ticker: str, cache_dir: Path = CACHE_DIR / "profiles", sleep=time.sleep, max_age_s: float = 7 * 86400) -> dict | None:
    """Cached per ticker; returns None when Yahoo has no quote for it."""
    import yfinance as yf

    cache_dir.mkdir(parents=True, exist_ok=True)
    p = cache_dir / f"{ticker}.json"
    if p.exists() and time.time() - p.stat().st_mtime < max_age_s:
        d = json.loads(p.read_text())
        return d or None
    for attempt in range(4):
        try:
            info = yf.Ticker(ticker).info or {}
            break
        except Exception as e:  # yfinance raises its own rate-limit and HTTP errors
            if "Too Many Requests" in str(e) or "Rate" in str(e):
                sleep(20 * (attempt + 1))
                continue
            info = {}
            break
    else:
        return None                                    # still rate-limited: don't cache, retry next run
    d = {k: info.get(k) for k in YF_FIELDS if info.get(k) is not None}
    if not d.get("quoteType"):
        d = {}
    p.write_text(json.dumps(d))
    sleep(0.35)
    return d or None


def profile(ticker: str, cik: int | None, client: SecClient | None) -> dict:
    out = {"yahoo": f"https://finance.yahoo.com/quote/{ticker}"}
    if cik and client:
        out |= sec_facts(client, cik)
    y = yahoo_facts(ticker)
    if y:
        out |= y
    else:
        out["yahoo"] = None if not cik else out["yahoo"]
    return out
