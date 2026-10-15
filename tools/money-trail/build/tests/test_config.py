import pytest
from sm import config


def test_settings_load():
    s = config.load_settings()
    assert s.quarters == 20
    assert s.change_threshold == 0.02
    assert s.manager_json_max_kb == 300


def test_managers_load_and_are_valid():
    ms = config.load_managers()
    assert len(ms) == 20
    assert len({m.cik for m in ms}) == 20
    brk = next(m for m in ms if m.cik == 1067983)
    assert brk.name == "Berkshire Hathaway"
    assert all(m.sources and m.bio and m.style for m in ms)
    assert all(len(m.bio_en) == len(m.bio) for m in ms)   # every Chinese bio line has an English one


def test_duplicate_cik_rejected(tmp_path):
    p = tmp_path / "m.yaml"
    entry = "  - {cik: 1, name: A, person: P, style: [x], founded: null, bio: [b], sources: [{label: l, url: 'https://x'}]}\n"
    p.write_text("managers:\n" + entry + entry)
    with pytest.raises(ValueError, match="duplicate"):
        config.load_managers(p)


def test_user_agent_reads_dotenv(monkeypatch, tmp_path):
    monkeypatch.delenv("SEC_CONTACT_EMAIL", raising=False)
    monkeypatch.setattr(config, "ROOT_DIR", tmp_path)
    (tmp_path / ".env").write_text("# c\nSEC_CONTACT_EMAIL=me@example.com\n")
    assert config.sec_user_agent() == "smart-money research me@example.com"


def test_user_agent_missing_raises(monkeypatch, tmp_path):
    monkeypatch.delenv("SEC_CONTACT_EMAIL", raising=False)
    monkeypatch.setattr(config, "ROOT_DIR", tmp_path)
    with pytest.raises(RuntimeError, match="SEC_CONTACT_EMAIL"):
        config.sec_user_agent()
