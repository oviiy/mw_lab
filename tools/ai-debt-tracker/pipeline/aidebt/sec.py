"""Polite, cached HTTP access to SEC EDGAR and FRED.

SEC fair-access rules: declare a User-Agent with contact info and stay under
10 requests/second. Every response is cached on disk by URL hash so re-runs are
offline and deterministic.
"""
from __future__ import annotations

import hashlib
import json
import os
import time
from pathlib import Path
from typing import Optional

import requests

ROOT = Path(__file__).resolve().parents[2]
CACHE_DIR = ROOT / "data" / "cache" / "http"

# The SEC rejects (HTTP 403) requests whose User-Agent lacks a real contact email, so there
# is no usable default. Cached/offline runs work without it; live fetches require it.
# An empty secret in CI arrives as "", which is treated as unset.
USER_AGENT = os.environ.get("SEC_USER_AGENT") or ""
_MIN_INTERVAL = 0.15  # seconds between live requests (~6.7 req/s)
_last_request = 0.0


class FetchError(RuntimeError):
    pass


def _cache_path(url: str) -> Path:
    digest = hashlib.sha256(url.encode()).hexdigest()[:24]
    return CACHE_DIR / digest[:2] / digest


def get(url: str, *, max_age_days: Optional[float] = None, offline: bool = False) -> bytes:
    """GET a URL, using the on-disk cache when fresh enough.

    max_age_days=None means cached copies never expire (right for immutable
    EDGAR archive documents). Index-like endpoints should pass a small value.
    """
    global _last_request
    path = _cache_path(url)
    if path.exists():
        age_days = (time.time() - path.stat().st_mtime) / 86400
        if offline or max_age_days is None or age_days <= max_age_days:
            return path.read_bytes()
    if offline:
        raise FetchError(f"offline and not cached: {url}")

    if not USER_AGENT and "sec.gov" in url:
        raise FetchError(
            "SEC_USER_AGENT is not set. The SEC requires a User-Agent with contact details, "
            'e.g. export SEC_USER_AGENT="Your Name you@example.com" (in GitHub: a repository secret).'
        )
    wait = _MIN_INTERVAL - (time.time() - _last_request)
    if wait > 0:
        time.sleep(wait)
    for attempt in range(4):
        _last_request = time.time()
        try:
            resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)
        except requests.RequestException as exc:  # network blip
            err: Exception = exc
        else:
            if resp.status_code == 200:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(resp.content)
                return resp.content
            err = FetchError(f"HTTP {resp.status_code} for {url}")
            if resp.status_code not in (429, 500, 502, 503, 504):
                break
        time.sleep(2 ** attempt)
    raise FetchError(str(err))


def get_json(url: str, **kw) -> dict:
    return json.loads(get(url, **kw))


def archive_url(cik: int, accession: str, filename: str) -> str:
    return f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession.replace('-', '')}/{filename}"


def filing_index_url(cik: int, accession: str) -> str:
    return f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession.replace('-', '')}/{accession}-index.htm"
