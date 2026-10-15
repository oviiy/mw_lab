from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml

BUILD_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BUILD_DIR.parent
CONFIG_DIR = BUILD_DIR / "config"
CACHE_DIR = BUILD_DIR / "cache"
REPORTS_DIR = BUILD_DIR / "reports"
DATA_DIR = ROOT_DIR / "data"


@dataclass(frozen=True)
class Source:
    label: str
    url: str


@dataclass(frozen=True)
class Manager:
    cik: int
    name: str
    person: str
    style: list[str]
    founded: int | None
    bio: list[str]
    sources: list[Source]
    bio_en: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class Settings:
    quarters: int
    change_threshold: float
    stock_universe_top_n: int
    holdings_per_quarter: int
    changes_per_quarter: int
    manager_json_max_kb: int
    stock_json_max_kb: int
    data_dir_max_mb: int
    cluster_window_days: int = 30
    cluster_min_insiders: int = 3
    cluster_min_value: float = 100_000


def load_settings(path: Path | None = None) -> Settings:
    raw = yaml.safe_load(Path(path or CONFIG_DIR / "settings.yaml").read_text())
    return Settings(**raw)


def load_managers(path: Path | None = None) -> list[Manager]:
    raw = yaml.safe_load(Path(path or CONFIG_DIR / "managers.yaml").read_text(encoding="utf-8"))
    out = [
        Manager(
            cik=int(m["cik"]), name=m["name"], person=m["person"], style=list(m["style"]),
            founded=int(m["founded"]) if m.get("founded") else None, bio=list(m["bio"]),
            sources=[Source(**s) for s in m["sources"]], bio_en=list(m.get("bio_en") or []),
        )
        for m in raw["managers"]
    ]
    ciks = [m.cik for m in out]
    if len(set(ciks)) != len(ciks):
        raise ValueError("duplicate CIK in managers.yaml")
    for m in out:
        if not m.sources:
            raise ValueError(f"manager {m.cik} has no sources")
    return out


def read_dotenv(path: Path | None = None) -> dict[str, str]:
    p = Path(path or ROOT_DIR / ".env")
    if not p.exists():
        return {}
    out = {}
    for line in p.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            out[k.strip()] = v.strip().strip('"')
    return out


def sec_user_agent() -> str:
    email = os.environ.get("SEC_CONTACT_EMAIL") or read_dotenv().get("SEC_CONTACT_EMAIL")
    if not email:
        raise RuntimeError("Set SEC_CONTACT_EMAIL in smart-money/.env (a personal email; SEC requires it in the User-Agent)")
    return f"smart-money research {email}"
