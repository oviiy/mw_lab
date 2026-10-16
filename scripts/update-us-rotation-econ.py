"""Refresh the public FRED history used by the US rotation dashboard."""

import csv
import io
import json
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "tools" / "us_rotation_econ.json"
SERIES = {
    "federalFunds": "FEDFUNDS",
    "CPI": "CPIAUCSL",
    "realGDP": "GDPC1",
    "unemploymentRate": "UNRATE",
    "retailSales": "RSAFS",
    "consumerSentiment": "UMCSENT",
    "inflationRate": "T10YIE",
}


def fetch_series(series_id: str, cutoff: str) -> dict:
    query = urllib.parse.urlencode({"id": series_id})
    url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?{query}"
    request = urllib.request.Request(url, headers={"User-Agent": "mw_lab/1.0"})
    with urllib.request.urlopen(request, timeout=20) as response:
        text = response.read().decode("utf-8-sig")
    dates, values = [], []
    for row in csv.reader(io.StringIO(text)):
        if len(row) < 2 or row[0] < cutoff or row[1] in ("", "."):
            continue
        try:
            value = float(row[1])
        except ValueError:
            continue
        dates.append(row[0])
        values.append(value)
    if len(dates) < 15:
        raise ValueError(f"{series_id} returned only {len(dates)} points")
    return {"dates": dates, "vals": values, "seriesId": series_id}


def main() -> None:
    previous = json.loads(OUTPUT.read_text(encoding="utf-8")) if OUTPUT.exists() else {}
    cutoff = (date.today() - timedelta(days=13 * 365)).isoformat()
    econ = {}
    updated = 0
    for name, series_id in SERIES.items():
        try:
            econ[name] = fetch_series(series_id, cutoff)
            updated += 1
            print(f"{name}: {len(econ[name]['dates'])} points through {econ[name]['dates'][-1]}")
        except Exception as error:
            fallback = previous.get("econ", {}).get(name)
            if not fallback:
                raise RuntimeError(f"No data available for {name}") from error
            econ[name] = fallback
            print(f"{name}: retaining previous data ({error})")
    payload = {
        "source": "Federal Reserve Economic Data (FRED)",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "econ": econ,
    }
    OUTPUT.write_text(json.dumps(payload, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Refreshed {updated}/{len(SERIES)} FRED series")


if __name__ == "__main__":
    main()
