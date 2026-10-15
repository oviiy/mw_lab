"""Senate periodic transaction reports from eFD (efdsearch.senate.gov).

The search requires accepting the site's usage agreement (no commercial or fundraising use of the data; the user
approved this for a free research site). Electronic reports are HTML tables; paper filings are scanned images and skipped.
"""
from __future__ import annotations

import hashlib
import html as htmllib
import re
import time
from datetime import datetime
from pathlib import Path

import requests

from .config import CACHE_DIR

BASE = "https://efdsearch.senate.gov"
TYPE = {"Purchase": ("buy", False), "Sale (Full)": ("sell", False), "Sale (Partial)": ("sell", True),
        "Sale": ("sell", False), "Exchange": ("exchange", False)}
OWNER = {"Self": "self", "Spouse": "spouse", "Joint": "joint", "Child": "child", "Dependent Child": "child"}
ASSET = {"Stock": "ST", "Stock Option": "OP", "Corporate Bond": "CS", "Municipal Security": "GS", "Government Security": "GS",
         "Other Securities": "OT", "Mutual Fund": "MF", "Non-Public Stock": "OT", "Cryptocurrency": "CT"}


def _text(cell: str) -> str:
    return re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", " ", cell))).strip()


def _amount(s: str) -> tuple[float | None, float | None]:
    nums = [float(n.replace(",", "")) for n in re.findall(r"\$([\d,]+)", s)]
    return (nums[0], nums[-1]) if nums else (None, None)


def parse_senate_ptr(page: str) -> list[dict]:
    body = re.search(r"<tbody>(.*?)</tbody>", page, re.S)
    if not body:
        return []
    out = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", body.group(1), re.S):
        cells = [_text(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
        if len(cells) < 8:
            continue
        _, d, owner, ticker, asset, atype, ttype, amount = cells[:8]
        comment = cells[8] if len(cells) > 8 else ""
        kind, partial = TYPE.get(ttype, (None, False))
        if kind is None:
            continue
        lo, hi = _amount(amount)
        trade_date = datetime.strptime(d, "%m/%d/%Y").date()
        out.append({
            "owner": OWNER.get(owner, "self"), "asset": asset, "ticker": None if ticker in ("--", "") else ticker.split()[0],
            "asset_type": ASSET.get(atype, "OT"), "kind": kind, "partial": partial, "trade_date": trade_date,
            "notified": trade_date, "amount_lo": lo, "amount_hi": hi, "desc": "" if comment == "--" else comment,
        })
    return out


class SenateClient:
    def __init__(self, user_agent: str, cache_dir: Path = CACHE_DIR / "senate", min_interval: float = 0.3, sleep=time.sleep):
        self.s = requests.Session()
        self.s.headers["User-Agent"] = user_agent
        self.cache = Path(cache_dir)
        self.cache.mkdir(parents=True, exist_ok=True)
        self.min_interval, self._sleep, self._agreed = min_interval, sleep, False

    def _agree(self) -> None:
        r = self.s.get(BASE + "/search/home/", timeout=60)
        tok = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', r.text).group(1)
        self.s.post(BASE + "/search/home/", data={"prohibition_agreement": "1", "csrfmiddlewaretoken": tok},
                    headers={"Referer": BASE + "/search/home/"}, timeout=60).raise_for_status()
        self._agreed = True

    def search_ptrs(self, start_date: str) -> list[dict]:
        """All PTR filings submitted since start_date (MM/DD/YYYY)."""
        if not self._agreed:
            self._agree()
        out, start = [], 0
        while True:
            d = {"start": str(start), "length": "100", "report_types": "[11]", "filer_types": "[]",
                 "submitted_start_date": f"{start_date} 00:00:00", "submitted_end_date": "", "candidate_state": "",
                 "senator_state": "", "office_id": "", "first_name": "", "last_name": "", "draw": "1"}
            r = self.s.post(BASE + "/search/report/data/", data=d, timeout=60,
                            headers={"Referer": BASE + "/search/", "X-CSRFToken": self.s.cookies.get("csrftoken", "")})
            r.raise_for_status()
            j = r.json()
            for first, last, office, link, filed in j["data"]:
                href = re.search(r'href="([^"]+)"', link).group(1)
                out.append({"first": first.strip(), "last": last.strip(), "office": office, "href": href,
                            "filing_date": datetime.strptime(filed, "%m/%d/%Y").date(), "paper": "/paper/" in href})
            start += 100
            self._sleep(self.min_interval)
            if start >= j["recordsTotal"]:
                return out

    def report(self, href: str) -> str:
        p = self.cache / (hashlib.sha1(href.encode()).hexdigest() + ".html")
        if p.exists():
            return p.read_text(encoding="utf-8")
        if not self._agreed:
            self._agree()
        for attempt in range(4):
            try:
                r = self.s.get(BASE + href, timeout=60)
                if r.status_code == 200 and "<tbody>" in r.text:
                    p.write_text(r.text, encoding="utf-8")
                    self._sleep(self.min_interval)
                    return r.text
                if "prohibition_agreement" in r.text:   # session expired: agree again
                    self._agree()
            except requests.RequestException:
                pass
            self._sleep(5 * (attempt + 1))
        return ""
