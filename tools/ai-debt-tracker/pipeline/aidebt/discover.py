"""Find candidate debt-offering documents for each tracked issuer.

Primary source: Free Writing Prospectuses (FWP) — for investment-grade deals
these are the final pricing term sheets. Each FWP is paired with the
prospectus supplement (424B2/424B5) filed around the same date, from which we
read the "Use of Proceeds" section.

Deals that never produce an FWP (e.g. 144A high-yield notes announced via 8-K)
are listed by hand in config/extra_documents.yaml.
"""
from __future__ import annotations

import datetime as dt
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import List, Optional

import yaml

from . import sec

CONFIG = Path(__file__).resolve().parents[1] / "config"
PROSUPP_FORMS = ("424B2", "424B5", "424B3")


@dataclass
class Document:
    accession: str
    issuer_id: str
    cik: int
    form: str
    filing_date: str
    url: str
    prosupp_urls: List[str] = field(default_factory=list)
    note: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)


def load_issuers() -> dict:
    return yaml.safe_load((CONFIG / "issuers.yaml").read_text())


def _filings(cik: int, offline: bool = False) -> List[dict]:
    data = sec.get_json(
        f"https://data.sec.gov/submissions/CIK{cik:010d}.json", max_age_days=0.5, offline=offline
    )
    blocks = [data["filings"]["recent"]]
    for extra in data["filings"].get("files", []):
        blocks.append(
            sec.get_json(f"https://data.sec.gov/submissions/{extra['name']}", max_age_days=7, offline=offline)
        )
    rows = []
    for b in blocks:
        for i, form in enumerate(b["form"]):
            rows.append(
                {
                    "form": form,
                    "date": b["filingDate"][i],
                    "accession": b["accessionNumber"][i],
                    "doc": b["primaryDocument"][i],
                }
            )
    return rows


def discover(offline: bool = False) -> List[Document]:
    cfg = load_issuers()
    since = cfg["since"]
    docs: List[Document] = []
    for iss in cfg["issuers"]:
        rows = [r for r in _filings(iss["cik"], offline) if r["date"] >= since]
        prosupps = [r for r in rows if r["form"] in PROSUPP_FORMS]
        for r in rows:
            if r["form"] != "FWP":
                continue
            day = dt.date.fromisoformat(r["date"])
            near = [
                p
                for p in prosupps
                if abs((dt.date.fromisoformat(p["date"]) - day).days) <= 3
            ]
            docs.append(
                Document(
                    accession=r["accession"],
                    issuer_id=iss["id"],
                    cik=iss["cik"],
                    form="FWP",
                    filing_date=r["date"],
                    url=sec.archive_url(iss["cik"], r["accession"], r["doc"]),
                    prosupp_urls=[sec.archive_url(iss["cik"], p["accession"], p["doc"]) for p in near],
                )
            )
    extra_path = CONFIG / "extra_documents.yaml"
    if extra_path.exists():
        for e in yaml.safe_load(extra_path.read_text()) or []:
            docs.append(Document(**e))
    docs.sort(key=lambda d: (d.filing_date, d.issuer_id))
    return docs
