"""Map SEC SIC codes to 11 GICS-style sectors (approximate; first matching range wins)."""
from __future__ import annotations

import csv
from pathlib import Path

from .config import BUILD_DIR


def load_sic_sectors(path: Path | None = None) -> list[tuple[int, int, str]]:
    with open(path or BUILD_DIR / "sic_sectors.csv", encoding="utf-8") as f:
        return [(int(r["lo"]), int(r["hi"]), r["sector"]) for r in csv.DictReader(f)]


def sector_for(sic: int | None, table: list[tuple[int, int, str]], is_etf: bool = False) -> str:
    if is_etf:
        return "ETF/基金"
    if sic is None:
        return "其他"
    for lo, hi, sector in table:
        if lo <= sic <= hi:
            return sector
    return "其他"
