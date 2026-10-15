import json

import pytest

from sm.companies import sic_for, shares_outstanding_series, ticker_to_cik
from sm.figi import FigiMapper, FigiRecord, pick_record
from sm.sec import SecError
from sm.sectors import load_sic_sectors, sector_for


def test_pick_record_prefers_us_composite():
    data = [{"ticker": "AAPL", "exchCode": "UW", "securityType": "Common Stock", "marketSector": "Equity", "name": "APPLE INC"},
            {"ticker": "AAPL", "exchCode": "US", "securityType": "Common Stock", "marketSector": "Equity", "name": "APPLE INC"}]
    r = pick_record("037833100", data)
    assert r.exch_code == "US" and r.is_equity and not r.is_etf
    assert pick_record("x", []) is None


def test_yf_ticker_and_types():
    r = FigiRecord("084670702", "BRK/B", "BERKSHIRE HATHAWAY INC-CL B", "US", "Common Stock", "Equity")
    assert r.yf_ticker == "BRK-B"
    assert FigiRecord("c", "SPY", "SPDR", "US", "ETP", "Equity").is_etf
    assert not FigiRecord("c", "X", "X", "US", "Equity Option", "Equity").is_equity


class FakePost:
    def __init__(self, payloads):
        self.payloads = list(payloads)
        self.bodies = []

    def post(self, url, json=None, headers=None, timeout=None):
        self.bodies.append(json)
        status, body = self.payloads.pop(0)

        class R:
            status_code = status
            text = "t"

            def json(self_inner):
                return body
        return R()


def test_figi_mapper_batches_caches_and_skips_errors(tmp_path):
    # Jobs are sent in sorted CUSIP order: 000000000, 037833100, BADBADBAD.
    s = FakePost([(200, [{"warning": "No identifier found."},
                         {"data": [{"ticker": "AAPL", "exchCode": "US", "securityType": "Common Stock", "marketSector": "Equity", "name": "APPLE"}]},
                         {"error": "Invalid idValue"}])])
    m = FigiMapper(tmp_path / "figi.json", session=s, api_key="k", sleep=lambda _: None)
    out = m.map(["037833100", "000000000", "BADBADBAD"])
    assert out["037833100"].ticker == "AAPL"
    assert out["000000000"] is None and out["BADBADBAD"] is None
    cached = json.loads((tmp_path / "figi.json").read_text())
    assert "000000000" in cached and cached["000000000"] is None   # definitive miss cached
    assert "BADBADBAD" not in cached                                # error not cached, retried next run
    m2 = FigiMapper(tmp_path / "figi.json", session=FakePost([]), api_key="k", sleep=lambda _: None)
    assert m2.map(["037833100"])["037833100"].ticker == "AAPL"      # served from cache, no HTTP


def test_figi_mapper_retries_429(tmp_path):
    s = FakePost([(429, None), (200, [{"warning": "No identifier found."}])])
    sleeps = []
    m = FigiMapper(tmp_path / "f.json", session=s, api_key="k", sleep=sleeps.append)
    assert m.map(["000000001"]) == {"000000001": None}
    assert sleeps[0] == 10


class FakeClient:
    def __init__(self, routes):
        self.routes = routes

    def get_json(self, url, max_age_s=None):
        if url not in self.routes:
            raise SecError("404 Not Found: " + url)
        return self.routes[url]


def test_company_lookups():
    c = FakeClient({
        "https://www.sec.gov/files/company_tickers.json": {"0": {"cik_str": 320193, "ticker": "AAPL", "title": "Apple"},
                                                           "1": {"cik_str": 1067983, "ticker": "BRK-B", "title": "BRK"}},
        "https://data.sec.gov/submissions/CIK0000320193.json": {"sic": "3571", "sicDescription": "Electronic Computers"},
        "https://data.sec.gov/api/xbrl/companyconcept/CIK0001652044/dei/EntityCommonStockSharesOutstanding.json": {"units": {"shares": [
            {"end": "2025-01-31", "val": 100, "accn": "a1", "filed": "2025-02-05"},
            {"end": "2025-01-31", "val": 50, "accn": "a1", "filed": "2025-02-05"},   # second share class, same filing
            {"end": "2025-04-20", "val": 160, "accn": "a2", "filed": "2025-04-25"},
            {"end": "2025-04-20", "val": 161, "accn": "a3", "filed": "2025-05-01"},  # later re-filing wins
        ]}},
    })
    assert ticker_to_cik(c) == {"AAPL": 320193, "BRK-B": 1067983}
    assert sic_for(c, 320193) == 3571
    so = shares_outstanding_series(c, 1652044)
    assert list(so.shares) == [150, 161]
    assert shares_outstanding_series(c, 999).empty
    fallback = FakeClient({"https://data.sec.gov/api/xbrl/companyconcept/CIK0001326801/us-gaap/WeightedAverageNumberOfSharesOutstandingBasic.json":
                           {"units": {"shares": [{"start": "2026-04-01", "end": "2026-06-30", "val": 2543000000, "accn": "a", "filed": "2026-07-30"},
                                                     {"start": "2026-01-01", "end": "2026-06-30", "val": 2545000000, "accn": "a", "filed": "2026-07-30"}]}}})
    assert list(shares_outstanding_series(fallback, 1326801).shares) == [2545000000]   # one value per date, not summed


def test_sectors():
    t = load_sic_sectors()
    assert sector_for(3571, t) == "信息技术"
    assert sector_for(2834, t) == "医疗保健"
    assert sector_for(1311, t) == "能源"
    assert sector_for(6022, t) == "金融"
    assert sector_for(6798, t) == "房地产"
    assert sector_for(None, t) == "其他"
    assert sector_for(9995, t) == "其他"
    assert sector_for(3571, t, is_etf=True) == "ETF/基金"


def test_figi_mapper_retries_network_errors(tmp_path):
    import requests

    class Flaky(FakePost):
        def post(self, url, json=None, headers=None, timeout=None):
            if not getattr(self, "failed", False):
                self.failed = True
                raise requests.ReadTimeout("slow")
            return super().post(url, json=json, headers=headers, timeout=timeout)

    m = FigiMapper(tmp_path / "f.json", session=Flaky([(200, [{"warning": "No identifier found."}])]), api_key="k", sleep=lambda _: None)
    assert m.map(["000000001"]) == {"000000001": None}


def test_foreign_quote_of_delisted_us_stock_keeps_root():
    r = pick_record("x", [{"ticker": "ABMDEUR", "exchCode": "XS", "securityType": "Common Stock", "marketSector": "Equity", "name": "ABIOMED"}])
    assert r.yf_ticker == "ABMD"
    r = pick_record("x", [{"ticker": "ATSG*", "exchCode": "MM", "securityType": "Common Stock", "marketSector": "Equity", "name": "ATSG"},
                          {"ticker": "ALEX", "exchCode": "UN", "securityType": "REIT", "marketSector": "Equity", "name": "ALEX"}])
    assert r.yf_ticker == "ALEX"


def test_cins_fallback_for_letter_prefixed_cusip(tmp_path):
    s = FakePost([(200, [{"warning": "No identifier found."}]),
                  (200, [{"data": [{"ticker": "CB", "exchCode": "US", "securityType": "Common Stock", "marketSector": "Equity", "name": "CHUBB"}]}])])
    m = FigiMapper(tmp_path / "f.json", session=s, api_key="k", sleep=lambda _: None)
    assert m.map(["H1467J104"])["H1467J104"].ticker == "CB"
    assert s.bodies[1] == [{"idType": "ID_CINS", "idValue": "H1467J104"}]
