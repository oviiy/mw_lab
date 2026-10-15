"""LLM extraction of debt terms from a filing bundle.

Resolution order for each document:
  1. extraction cache  pipeline/extractions/<accession>.json  (committed, auditable)
  2. Claude API         if ANTHROPIC_API_KEY is set (result is written to the cache)
  3. otherwise          the document goes to the review queue

Cached extractions record the bundle hash they were made from; if the source
bundle changes, the cache entry is treated as stale.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

from .fetch import bundle_hash

EXTRACTIONS = Path(__file__).resolve().parents[1] / "extractions"
MODEL = os.environ.get("AIDEBT_MODEL", "claude-sonnet-5-5")

INSTRUMENT_TYPES = [
    "senior_notes",        # fixed-rate senior unsecured notes (the IG workhorse)
    "floating_rate_notes",
    "secured_notes",       # incl. high-yield secured notes
    "convertible_notes",
    "term_loan",           # incl. GPU-backed delayed-draw term loans
    "revolver",            # revolving credit facility commitments
    "other_debt",
]

SCHEMA = {
    "type": "object",
    "required": ["accession", "is_new_debt", "doc_kind", "tranches", "proceeds"],
    "properties": {
        "accession": {"type": "string"},
        "is_new_debt": {
            "type": "boolean",
            "description": "True only if this document prices/closes/commits NEW borrowing by the issuer.",
        },
        "doc_kind": {
            "type": "string",
            "description": "e.g. pricing_term_sheet, closing_8k, launch_announcement, equity_offering, earnings, amendment, other",
        },
        "skip_reason": {"type": ["string", "null"]},
        "trade_date": {"type": ["string", "null"], "description": "YYYY-MM-DD pricing/agreement date"},
        "settlement_date": {"type": ["string", "null"]},
        "tranches": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["name", "instrument_type", "currency", "amount", "maturity_date", "quote"],
                "properties": {
                    "name": {"type": "string", "description": "As written, e.g. '4.875% Senior Notes due 2035'"},
                    "instrument_type": {"enum": INSTRUMENT_TYPES},
                    "currency": {"type": "string", "description": "ISO code: USD, EUR, GBP, CHF, JPY, AUD, CAD"},
                    "amount": {"type": "number", "description": "Principal in units of `currency` (not millions)"},
                    "coupon_pct": {"type": ["number", "null"], "description": "Fixed coupon %, null for floating"},
                    "floating_spread_bp": {"type": ["number", "null"], "description": "FRN margin over SOFR/etc."},
                    "maturity_date": {"type": ["string", "null"], "description": "YYYY-MM-DD"},
                    "price_pct": {"type": ["number", "null"]},
                    "ytm_pct": {"type": ["number", "null"]},
                    "spread_bp": {"type": ["number", "null"], "description": "Spread to benchmark government bond"},
                    "benchmark": {"type": ["string", "null"]},
                    "benchmark_yield_pct": {"type": ["number", "null"]},
                    "cusip": {"type": ["string", "null"]},
                    "isin": {"type": ["string", "null"]},
                    "secured_by": {"type": ["string", "null"], "description": "Collateral, e.g. 'GPUs and customer contracts'"},
                    "quote": {"type": "string", "description": "Verbatim snippet (<=300 chars) supporting amount + maturity"},
                },
            },
        },
        "proceeds": {
            "type": "object",
            "required": ["ai_flag", "quote"],
            "properties": {
                "ai_flag": {
                    "enum": ["explicit", "general"],
                    "description": "explicit = use of proceeds names AI, data centers, compute, GPUs or AI infrastructure",
                },
                "quote": {"type": ["string", "null"], "description": "Verbatim use-of-proceeds snippet (<=400 chars)"},
            },
        },
    },
}

PROMPT = """You are extracting bond and loan terms from an SEC filing for an open research dataset.
Accuracy matters more than coverage: never guess a number that is not in the text.

The bundle below contains a filing (usually a pricing term sheet / FWP, or an 8-K) followed by
"Use of Proceeds" windows from the related prospectus supplement, when available.

Rules
- is_new_debt=true only when the document prices, closes or commits NEW borrowing. Equity offerings,
  earnings releases, exchange offers, launch announcements without final terms, and amendments that
  do not add new money are is_new_debt=false (give skip_reason, tranches=[]).
- One tranche per series/facility. `amount` is the full principal in the stated currency
  (e.g. 4000000000, not 4,000 or 4.0).
- For term loans / delayed-draw facilities, use the committed amount and final maturity.
- spread_bp is the spread to the benchmark government bond ("T + 78 bps" -> 78; "+75 basis points" -> 75).
- `quote` must be copied verbatim from the bundle.
- proceeds.ai_flag = "explicit" only if the use-of-proceeds language (or the 8-K's stated purpose)
  mentions AI, data centers, compute capacity, GPUs or AI infrastructure. Otherwise "general".

Return a single JSON object matching this schema:
{schema}

BUNDLE
{bundle}
"""


def cache_path(accession: str) -> Path:
    return EXTRACTIONS / f"{accession}.json"


def load_cached(accession: str, bundle_text: str) -> Optional[dict]:
    p = cache_path(accession)
    if not p.exists():
        return None
    data = json.loads(p.read_text())
    if data.get("_meta", {}).get("bundle_hash") not in (None, bundle_hash(bundle_text)):
        return None  # source changed; re-extract
    return data


def extract_with_claude(accession: str, bundle_text: str) -> dict:
    import anthropic  # optional dependency

    client = anthropic.Anthropic()
    msg = client.messages.create(
        model=MODEL,
        max_tokens=8000,
        messages=[
            {
                "role": "user",
                "content": PROMPT.format(schema=json.dumps(SCHEMA), bundle=bundle_text),
            }
        ],
    )
    text = "".join(b.text for b in msg.content if b.type == "text")
    data = json.loads(text[text.find("{") : text.rfind("}") + 1])
    save(accession, data, bundle_text, extractor=MODEL)
    return data


def save(accession: str, data: dict, bundle_text: str, extractor: str) -> None:
    data["accession"] = accession
    data["_meta"] = {"bundle_hash": bundle_hash(bundle_text), "extractor": extractor}
    EXTRACTIONS.mkdir(parents=True, exist_ok=True)
    cache_path(accession).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def extract(accession: str, bundle_text: str) -> Optional[dict]:
    cached = load_cached(accession, bundle_text)
    if cached is not None:
        return cached
    if os.environ.get("ANTHROPIC_API_KEY"):
        return extract_with_claude(accession, bundle_text)
    return None
