"""Download every public input the paper uses into ../data/raw.

Sources: Yahoo Finance chart API (daily prices), FRED (credit indices, Treasury curve),
SEC XBRL company facts (debt, leases, shares), SEC EDGAR filings (AI mentions),
Wikimedia pageviews (public attention to AI).
"""
import json
import time
import subprocess
from pathlib import Path

RAW = Path(__file__).resolve().parent.parent / "data" / "raw"
RAW.mkdir(parents=True, exist_ok=True)
SEC_UA = "ai-credit-research research@example.com"

TICKERS = ["META", "GOOGL", "AMZN", "ORCL", "MSFT", "CRWV", "NVDA", "SPY"]
CIKS = {"meta": 1326801, "alphabet": 1652044, "amazon": 1018724,
        "oracle": 1341439, "microsoft": 789019, "coreweave": 1769628}
FRED = {
    "ig_oas": "BAMLC0A0CM", "aa_oas": "BAMLC0A2CAA", "a_oas": "BAMLC0A3CA",
    "bbb_oas": "BAMLC0A4CBBB", "hy_oas": "BAMLH0A0HYM2", "bb_oas": "BAMLH0A1HYBB",
    "b_oas": "BAMLH0A2HYB",
    "ust_1m": "DGS1MO", "ust_3m": "DGS3MO", "ust_6m": "DGS6MO", "ust_1y": "DGS1",
    "ust_2y": "DGS2", "ust_3y": "DGS3", "ust_5y": "DGS5", "ust_7y": "DGS7",
    "ust_10y": "DGS10", "ust_20y": "DGS20", "ust_30y": "DGS30",
}
WIKI_ARTICLES = ["Artificial_intelligence", "ChatGPT", "Large_language_model",
                 "Generative_artificial_intelligence", "Nvidia"]


def get(url, ua="Mozilla/5.0", tries=4):
    # curl, not urllib: FRED stalls on Python's TLS client from this network.
    for k in range(tries):
        ua_args = ["-A", ua] if ua else []
        r = subprocess.run(["curl", "-sfL", "--max-time", "90", *ua_args, url], capture_output=True)
        if r.returncode == 0 and r.stdout:
            return r.stdout
        if k == tries - 1:
            raise RuntimeError(f"{url}: curl exit {r.returncode}")
        time.sleep(2 * (k + 1))


def prices():
    out = {}
    for t in TICKERS:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{t}?period1=1609459200&period2=1798761600&interval=1d&events=div,split"
        d = json.loads(get(url))["chart"]["result"][0]
        q = d["indicators"]
        out[t] = {"t": d["timestamp"], "close": q["quote"][0]["close"],
                  "adjclose": q["adjclose"][0]["adjclose"]}
        print("price", t, len(d["timestamp"]))
    (RAW / "prices.json").write_text(json.dumps(out))


def fred():
    for name, sid in FRED.items():
        (RAW / f"fred_{name}.csv").write_bytes(
            get(f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={sid}&cosd=2019-01-01", ua=None))  # FRED rejects browser UAs
        print("fred", name)


def companyfacts():
    for iid, cik in CIKS.items():
        b = get(f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik:010d}.json", SEC_UA)
        (RAW / f"facts_{iid}.json").write_bytes(b)
        print("facts", iid, len(b))
        time.sleep(0.3)


def wiki():
    out = {}
    for a in WIKI_ARTICLES:
        url = ("https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/"
               f"all-access/user/{a}/monthly/20190101/20261001")
        try:
            items = json.loads(get(url, SEC_UA))["items"]
        except RuntimeError:  # articles created after 2019 fail on the full range
            items = json.loads(get(url.replace("/20190101/", "/20221201/"), SEC_UA))["items"]
        out[a] = [(x["timestamp"][:8], x["views"]) for x in items]
        print("wiki", a, len(out[a]))
    (RAW / "wiki_pageviews.json").write_text(json.dumps(out))


def filings():
    """List each issuer's 10-K and 10-Q filings since 2021 with their primary documents."""
    out = {}
    for iid, cik in CIKS.items():
        sub = json.loads(get(f"https://data.sec.gov/submissions/CIK{cik:010d}.json", SEC_UA))
        # "recent" holds only the latest ~1000 filings; Form 4-heavy issuers need the older pages too.
        pages = [sub["filings"]["recent"]] + [
            json.loads(get(f"https://data.sec.gov/submissions/{f['name']}", SEC_UA))
            for f in sub["filings"].get("files", []) if f["filingTo"] >= "2021-01-01"]
        rows = []
        for r in pages:
            for form, date, acc, doc, period in zip(r["form"], r["filingDate"], r["accessionNumber"],
                                                    r["primaryDocument"], r["reportDate"]):
                if form in ("10-K", "10-Q") and date >= "2021-01-01":
                    rows.append({"form": form, "filed": date, "period": period, "acc": acc,
                                 "url": f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc.replace('-', '')}/{doc}"})
        rows.sort(key=lambda x: x["filed"])
        out[iid] = rows
        print("filings", iid, len(rows))
        time.sleep(0.3)
    (RAW / "filings_index.json").write_text(json.dumps(out, indent=1))


def filing_texts():
    """Download each 10-K/10-Q primary document (cached) for the AI-mention count."""
    idx = json.loads((RAW / "filings_index.json").read_text())
    d = RAW / "filings"
    d.mkdir(exist_ok=True)
    for iid, rows in idx.items():
        for row in rows:
            f = d / f"{iid}_{row['acc']}.htm"
            if f.exists():
                continue
            f.write_bytes(get(row["url"], SEC_UA))
            time.sleep(0.15)
        print("texts", iid, len(rows))


if __name__ == "__main__":
    import sys
    steps = sys.argv[1:] or ["prices", "fred", "companyfacts", "wiki", "filings", "filing_texts"]
    for s in steps:
        globals()[s]()
