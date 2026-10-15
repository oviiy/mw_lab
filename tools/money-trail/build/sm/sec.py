"""Rate-limited, caching HTTP client for sec.gov (SEC fair access: <=10 req/s with a declared User-Agent)."""
from __future__ import annotations

import hashlib
import json
import time
from pathlib import Path

import requests

from .config import CACHE_DIR, sec_user_agent


class SecError(RuntimeError):
    pass


class SecClient:
    def __init__(self, cache_dir: Path = CACHE_DIR / "http", *, session=None, user_agent: str | None = None,
                 min_interval: float = 0.11, retries: int = 3, sleep=time.sleep, clock=time.monotonic):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.session = session or requests.Session()
        self.headers = {"User-Agent": user_agent or sec_user_agent(), "Accept-Encoding": "gzip, deflate"}
        self.min_interval = min_interval
        self.retries = retries
        self._sleep = sleep
        self._clock = clock
        self._last = None

    def _throttle(self) -> None:
        if self._last is not None:
            wait = self._last + self.min_interval - self._clock()
            if wait > 0:
                self._sleep(wait)
        self._last = self._clock()

    def _request(self, url: str, stream: bool = False):
        err: Exception | None = None
        for attempt in range(self.retries + 1):
            self._throttle()
            try:
                resp = self.session.get(url, headers=self.headers, timeout=120, stream=stream)
            except requests.RequestException as e:
                resp, err = None, e
            if resp is not None:
                if resp.status_code == 200:
                    return resp
                if resp.status_code == 404:
                    raise SecError(f"404 Not Found: {url}")
                if resp.status_code in (403, 429):
                    self.min_interval = min(self.min_interval * 2, 2.0)
                err = SecError(f"HTTP {resp.status_code}: {url}")
            if attempt < self.retries:
                self._sleep(2 ** attempt)
        raise SecError(f"giving up after {self.retries + 1} attempts: {url}") from err

    def _cache_path(self, url: str) -> Path:
        return self.cache_dir / (hashlib.sha1(url.encode()).hexdigest() + ".bin")

    def get_bytes(self, url: str, *, max_age_s: float | None = None) -> bytes:
        p = self._cache_path(url)
        if p.exists() and (max_age_s is None or time.time() - p.stat().st_mtime < max_age_s):
            return p.read_bytes()
        data = self._request(url).content
        p.write_bytes(data)
        return data

    def get_json(self, url: str, *, max_age_s: float | None = None):
        return json.loads(self.get_bytes(url, max_age_s=max_age_s))

    def download(self, url: str, dest: Path) -> Path:
        dest = Path(dest)
        if dest.exists():
            return dest
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = dest.with_name(dest.name + ".part")
        resp = self._request(url, stream=True)
        with open(tmp, "wb") as f:
            for chunk in resp.iter_content(1 << 20):
                f.write(chunk)
        tmp.rename(dest)
        return dest
