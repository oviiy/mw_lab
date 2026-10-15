"""Download a document and build the plain-text bundle the extractor reads."""
from __future__ import annotations

import hashlib
from pathlib import Path

from . import sec
from .discover import Document
from .text import html_to_text, sections

BUNDLE_DIR = sec.ROOT / "data" / "cache" / "bundles"
MAX_TERM_SHEET_CHARS = 60000


def bundle(doc: Document, offline: bool = False) -> str:
    """Term-sheet text + 'Use of Proceeds' windows from the paired prospectus."""
    term = html_to_text(sec.get(doc.url, offline=offline))[:MAX_TERM_SHEET_CHARS]
    parts = [f"=== DOCUMENT {doc.form} {doc.accession} filed {doc.filing_date}\n{doc.url}\n", term]
    for url in doc.prosupp_urls:
        try:
            text = html_to_text(sec.get(url, offline=offline))
        except sec.FetchError:
            continue
        for i, win in enumerate(sections(text, "Use of Proceeds")):
            parts.append(f"\n=== USE OF PROCEEDS #{i + 1} from {url}\n{win}")
    out = "\n".join(parts)
    BUNDLE_DIR.mkdir(parents=True, exist_ok=True)
    (BUNDLE_DIR / f"{doc.accession}.txt").write_text(out)
    return out


def bundle_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def bundle_path(accession: str) -> Path:
    return BUNDLE_DIR / f"{accession}.txt"
