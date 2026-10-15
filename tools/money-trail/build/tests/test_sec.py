import pytest

from sm.sec import SecClient, SecError


class FakeResp:
    def __init__(self, status, content=b""):
        self.status_code = status
        self.content = content

    def iter_content(self, n):
        yield self.content


class FakeSession:
    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    def get(self, url, headers=None, timeout=None, stream=False):
        self.calls.append((url, headers))
        return self.responses.pop(0)


def make(tmp_path, responses):
    s = FakeSession(responses)
    sleeps = []
    c = SecClient(tmp_path / "http", session=s, user_agent="smart-money research me@example.com",
                  sleep=sleeps.append, clock=lambda: 0.0)
    return c, s, sleeps


def test_sends_user_agent_and_caches(tmp_path):
    c, s, _ = make(tmp_path, [FakeResp(200, b'{"a": 1}')])
    assert c.get_json("https://x/a.json") == {"a": 1}
    assert c.get_json("https://x/a.json") == {"a": 1}
    assert len(s.calls) == 1
    assert s.calls[0][1]["User-Agent"] == "smart-money research me@example.com"


def test_throttles_between_requests(tmp_path):
    c, s, sleeps = make(tmp_path, [FakeResp(200, b"1"), FakeResp(200, b"2")])
    c.get_bytes("https://x/1")
    c.get_bytes("https://x/2")
    assert sleeps == [pytest.approx(0.11)]


def test_retries_and_slows_down_on_429(tmp_path):
    c, s, sleeps = make(tmp_path, [FakeResp(429), FakeResp(200, b"ok")])
    assert c.get_bytes("https://x/b") == b"ok"
    assert len(s.calls) == 2
    assert c.min_interval > 0.11
    assert 1 in sleeps


def test_404_fails_fast(tmp_path):
    c, s, _ = make(tmp_path, [FakeResp(404)])
    with pytest.raises(SecError, match="404"):
        c.get_bytes("https://x/missing")
    assert len(s.calls) == 1


def test_gives_up_after_retries(tmp_path):
    c, s, _ = make(tmp_path, [FakeResp(500)] * 4)
    with pytest.raises(SecError, match="giving up"):
        c.get_bytes("https://x/c")
    assert len(s.calls) == 4


def test_download_writes_file_once(tmp_path):
    c, s, _ = make(tmp_path, [FakeResp(200, b"zipbytes")])
    p = c.download("https://x/f.zip", tmp_path / "d" / "f.zip")
    assert p.read_bytes() == b"zipbytes"
    c.download("https://x/f.zip", p)
    assert len(s.calls) == 1
