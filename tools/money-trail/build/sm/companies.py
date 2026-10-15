"""Issuer facts from SEC: ticker->CIK, SIC industry code, shares outstanding history."""
from __future__ import annotations

import pandas as pd

from .sec import SecClient, SecError

TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{cik:010d}.json"
SHARES_URL = "https://data.sec.gov/api/xbrl/companyconcept/CIK{cik:010d}/dei/EntityCommonStockSharesOutstanding.json"
CONCEPT_URL = "https://data.sec.gov/api/xbrl/companyconcept/CIK{cik:010d}/{tax}/{tag}.json"
# Many large filers (e.g. Alphabet, Meta) don't tag the cover-page dei count; fall back to balance-sheet, then weighted-average shares.
SHARE_TAGS = [("dei", "EntityCommonStockSharesOutstanding"), ("us-gaap", "CommonStockSharesOutstanding"),
              ("us-gaap", "WeightedAverageNumberOfSharesOutstandingBasic")]
MONTH = 30 * 86400


def ticker_to_cik(client: SecClient) -> dict[str, int]:
    raw = client.get_json(TICKERS_URL, max_age_s=7 * 86400)
    return {v["ticker"].upper(): int(v["cik_str"]) for v in raw.values()}


def sic_for(client: SecClient, cik: int) -> int | None:
    try:
        j = client.get_json(SUBMISSIONS_URL.format(cik=cik), max_age_s=MONTH)
    except SecError:
        return None
    sic = j.get("sic")
    return int(sic) if sic else None


def shares_outstanding_series(client: SecClient, cik: int) -> pd.DataFrame:
    empty = pd.DataFrame({"end": pd.Series(dtype="datetime64[ns]"), "shares": pd.Series(dtype=float)})
    for tax, tag in SHARE_TAGS:
        try:
            j = client.get_json(CONCEPT_URL.format(cik=cik, tax=tax, tag=tag), max_age_s=MONTH)
        except SecError:
            continue
        df = pd.DataFrame(j.get("units", {}).get("shares", []))
        if df.empty:
            continue
        df["end"] = pd.to_datetime(df["end"])
        if tax == "dei":
            # cover-page counts are reported once per share class in the same filing: sum the classes
            g = df.groupby(["accn", "end", "filed"], as_index=False)["val"].sum()
        else:
            # us-gaap facts repeat per context (e.g. 3-month and year-to-date averages ending on the same day): keep one
            g = df.drop_duplicates(["accn", "end"], keep="last")[["accn", "end", "filed", "val"]]
        g = g.sort_values("filed").drop_duplicates("end", keep="last").sort_values("end")
        return g.rename(columns={"val": "shares"})[["end", "shares"]].astype({"shares": float}).reset_index(drop=True)
    return empty
