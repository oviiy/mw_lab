"""CUSIP -> ticker via the OpenFIGI mapping API, with a permanent JSON cache."""
from __future__ import annotations

import json
import os
import re
import time
from dataclasses import asdict, dataclass
from pathlib import Path

import requests

from .config import CACHE_DIR, read_dotenv

OPENFIGI_URL = "https://api.openfigi.com/v3/mapping"
NON_EQUITY_TYPES = {"Equity Option", "Index Option", "Warrant", "Right"}


@dataclass(frozen=True)
class FigiRecord:
    cusip: str
    ticker: str
    name: str
    exch_code: str
    security_type: str
    market_sector: str

    @property
    def yf_ticker(self) -> str:
        t = self.ticker.rstrip("*")
        # Delisted US names often survive only as foreign quotes such as ABMDEUR; keep the US root.
        if not _is_us(self.exch_code):
            t = re.sub(r"(USD|EUR|GBP|CHF)$", "", t) or t
        return t.replace("/", "-").replace(" ", "-")

    @property
    def is_equity(self) -> bool:
        return self.market_sector == "Equity" and self.security_type not in NON_EQUITY_TYPES

    @property
    def is_etf(self) -> bool:
        return self.security_type == "ETP"


def _is_us(exch: str) -> bool:
    return exch == "US" or (len(exch) == 2 and exch.startswith("U"))


def pick_record(cusip: str, data: list[dict]) -> FigiRecord | None:
    if not data:
        return None
    best = (next((d for d in data if d.get("exchCode") == "US"), None)
            or next((d for d in data if _is_us(d.get("exchCode") or "")), None)
            or data[0])
    return FigiRecord(cusip, best.get("ticker") or "", best.get("name") or "", best.get("exchCode") or "",
                      best.get("securityType") or "", best.get("marketSector") or "")


class FigiMapper:
    def __init__(self, cache_path: Path = CACHE_DIR / "figi.json", *, session=None, api_key: str | None = None,
                 sleep=time.sleep):
        self.cache_path = Path(cache_path)
        self.cache: dict = json.loads(self.cache_path.read_text()) if self.cache_path.exists() else {}
        self.session = session or requests.Session()
        self.api_key = api_key if api_key is not None else (
            os.environ.get("OPENFIGI_API_KEY") or read_dotenv().get("OPENFIGI_API_KEY") or "")
        # Public limits: with key 25 req / 6 s and 100 jobs per request; without key 25 req / min and 10 jobs.
        self.batch = 100 if self.api_key else 10
        self.interval = 0.25 if self.api_key else 2.5
        self._sleep = sleep

    def map(self, cusips) -> dict[str, FigiRecord | None]:
        cusips = list(cusips)
        todo = sorted({c for c in cusips if c not in self.cache})
        for i in range(0, len(todo), self.batch):
            chunk = todo[i:i + self.batch]
            for c, res in zip(chunk, self._post(chunk)):
                if "error" in res:
                    continue
                data = res.get("data") or []
                if not data and c[:1].isalpha():
                    alt = self._post([c], id_type="ID_CINS")[0]
                    data = [] if "error" in alt else (alt.get("data") or [])
                rec = pick_record(c, data)
                self.cache[c] = asdict(rec) if rec else None
            self._save()
            self._sleep(self.interval)
            if (i // self.batch) % 20 == 0:
                print(f"[figi] {min(i + self.batch, len(todo))}/{len(todo)}")
        return {c: (FigiRecord(**self.cache[c]) if self.cache.get(c) else None) for c in cusips}

    def _post(self, chunk: list[str], id_type: str = "ID_CUSIP") -> list[dict]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-OPENFIGI-APIKEY"] = self.api_key
        jobs = [{"idType": id_type, "idValue": c} for c in chunk]
        for attempt in range(4):
            try:
                r = self.session.post(OPENFIGI_URL, json=jobs, headers=headers, timeout=60)
            except requests.RequestException:
                self._sleep(10 * (attempt + 1))
                continue
            if r.status_code == 200:
                return r.json()
            if r.status_code == 429:
                self._sleep(10 * (attempt + 1))
                continue
            raise RuntimeError(f"OpenFIGI HTTP {r.status_code}: {r.text[:200]}")
        raise RuntimeError("OpenFIGI: giving up after repeated rate limits or network errors")

    def _save(self) -> None:
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self.cache_path.with_name(self.cache_path.name + ".part")
        tmp.write_text(json.dumps(self.cache))
        tmp.replace(self.cache_path)
