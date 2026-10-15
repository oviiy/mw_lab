"""End-to-end pipeline:  python -m aidebt.run [--offline]

discover -> fetch/bundle -> extract -> validate (+overrides) -> dedupe -> enrich -> publish
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List

import yaml

from . import asset_side, enrich, sec
from .discover import CONFIG, Document, discover, load_issuers
from .extract import extract
from .fetch import bundle
from .validate import check_tranche, dedupe_key

PUBLIC = sec.ROOT / "data" / "public"
REVIEW = sec.ROOT / "data" / "review"
HEADLINE_EXCLUDES = {"revolver"}  # undrawn revolving commitments are not borrowing

CSV_FIELDS = [
    "id", "issuer_id", "issuer", "name", "instrument_type", "trade_date", "maturity_date",
    "tenor_years", "currency", "amount", "amount_usd", "fx_rate", "coupon_pct", "floating_spread_bp",
    "price_pct", "ytm_pct", "spread_bp", "benchmark", "benchmark_yield_pct", "index_oas_bp",
    "cusip", "isin", "secured_by", "ai_flag", "in_headline", "validation", "source_url",
    "extract_quote", "proceeds_quote",
]


def load_overrides() -> dict:
    p = CONFIG / "overrides.yaml"
    return (yaml.safe_load(p.read_text()) or {}) if p.exists() else {}


def _tenor(start: str, end: str) -> float:
    return round((dt.date.fromisoformat(end) - dt.date.fromisoformat(start)).days / 365.25, 2)


def build_records(docs: List[Document], offline: bool) -> (List[dict], List[dict]):
    overrides = load_overrides()
    issuers = {i["id"]: i for i in load_issuers()["issuers"]}
    records: List[dict] = []
    review: List[dict] = []

    for doc in docs:
        text = bundle(doc, offline=offline)
        ext = extract(doc.accession, text)
        if ext is None:
            review.append({"accession": doc.accession, "url": doc.url, "issues": ["not extracted yet"]})
            continue
        if not ext.get("is_new_debt"):
            continue
        ov = overrides.get(doc.accession, {})
        trade_date = ov.get("trade_date") or ext.get("trade_date") or ext.get("settlement_date")
        settle = ext.get("settlement_date")
        for idx, t in enumerate(ext.get("tranches", [])):
            t = {**t, **(ov.get("tranches", {}).get(idx, {}))}
            chk = check_tranche(t, trade_date, settle, text)
            accepted = idx in ov.get("accept", [])
            if not chk.ok and not accepted:
                review.append(
                    {"accession": doc.accession, "tranche": idx, "name": t.get("name"),
                     "url": doc.url, "issues": chk.issues}
                )
                continue
            records.append(
                {
                    "issuer_id": doc.issuer_id,
                    "issuer": issuers[doc.issuer_id]["name"],
                    "name": t["name"],
                    "instrument_type": t["instrument_type"],
                    "trade_date": trade_date,
                    "maturity_date": t["maturity_date"],
                    "currency": t.get("currency", "USD"),
                    "amount": t["amount"],
                    "coupon_pct": t.get("coupon_pct"),
                    "floating_spread_bp": t.get("floating_spread_bp"),
                    "price_pct": t.get("price_pct"),
                    "ytm_pct": t.get("ytm_pct"),
                    "spread_bp": t.get("spread_bp"),
                    "benchmark": t.get("benchmark"),
                    "benchmark_yield_pct": t.get("benchmark_yield_pct"),
                    "cusip": t.get("cusip"),
                    "isin": t.get("isin"),
                    "secured_by": t.get("secured_by"),
                    "ai_flag": ext.get("proceeds", {}).get("ai_flag", "general"),
                    "validation": "pass" if chk.ok else "override",
                    "override_reason": ov.get("reason") if accepted or ov.get("tranches") else None,
                    "source_url": doc.url,
                    "accession": doc.accession,
                    "extract_quote": t.get("quote"),
                    "proceeds_quote": ext.get("proceeds", {}).get("quote"),
                }
            )
    return records, review


def dedupe(records: List[dict]) -> List[dict]:
    """Same tranche disclosed twice (pricing release + closing 8-K): keep the richest, earliest-dated."""
    groups: Dict[tuple, List[dict]] = defaultdict(list)
    for r in records:
        groups[dedupe_key(r["issuer_id"], r)].append(r)
    out = []
    for rs in groups.values():
        rs.sort(key=lambda r: (-sum(v is not None for v in r.values()), r["trade_date"]))
        best = dict(rs[0])
        best["trade_date"] = min(r["trade_date"] for r in rs)
        best["ai_flag"] = "explicit" if any(r["ai_flag"] == "explicit" for r in rs) else "general"
        best["other_sources"] = sorted({r["source_url"] for r in rs} - {best["source_url"]})
        out.append(best)
    return out


def finalize(records: List[dict], offline: bool) -> List[dict]:
    ig = enrich.fred(enrich.SPREAD_SERIES["ig"], offline)
    for r in records:
        r["amount_usd"], r["fx_rate"] = enrich.to_usd(r["amount"], r["currency"], r["trade_date"], offline)
        r["amount_usd"] = round(r["amount_usd"])
        r["tenor_years"] = _tenor(r["trade_date"], r["maturity_date"])
        oas = ig.asof(r["trade_date"])
        r["index_oas_bp"] = None if oas is None else round(oas * 100)
        r["in_headline"] = r["instrument_type"] not in HEADLINE_EXCLUDES
        key = r.get("cusip") or f"{r['accession']}-{r['maturity_date']}-{r['amount']:.0f}"
        r["id"] = f"{r['issuer_id']}-{key}".lower()
    records.sort(key=lambda r: (r["trade_date"], r["issuer_id"], r["maturity_date"]))
    return records


def metrics(records: List[dict], cfg: dict, offline: bool) -> dict:
    head = [r for r in records if r["in_headline"]]
    by_issuer_year: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
    wall: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
    for r in head:
        by_issuer_year[r["issuer_id"]][r["trade_date"][:4]] += r["amount_usd"]
        wall[r["maturity_date"][:4]][r["issuer_id"]] += r["amount_usd"]

    cumulative = []
    running: Dict[str, float] = defaultdict(float)
    for r in head:
        running[r["issuer_id"]] += r["amount_usd"]
        cumulative.append({"date": r["trade_date"], **{k: round(v) for k, v in running.items()}})
    # one point per date (last wins)
    cum_by_date = {c["date"]: c for c in cumulative}

    spreads = {}
    for key, sid in enrich.SPREAD_SERIES.items():
        rows = enrich.fred(sid, offline).since("2023-06-01")
        spreads[key] = [[d, round(v * 100)] for i, (d, v) in enumerate(rows) if i % 5 == 0 or i == len(rows) - 1]

    life = yaml.safe_load((CONFIG / "useful_life.yaml").read_text())
    mismatch = []
    for iss in cfg["issuers"]:
        rs = [r for r in head if r["issuer_id"] == iss["id"]]
        if not rs:
            continue
        w = sum(r["amount_usd"] for r in rs)
        mismatch.append(
            {
                "issuer_id": iss["id"],
                "useful_life_years": life[iss["id"]]["years"],
                "longest_tenor_years": max(r["tenor_years"] for r in rs),
                "wavg_tenor_years": round(sum(r["tenor_years"] * r["amount_usd"] for r in rs) / w, 2),
                "share_outliving_hardware": round(
                    sum(r["amount_usd"] for r in rs if r["tenor_years"] > life[iss["id"]]["years"]) / w, 4
                ),
            }
        )

    life_by_issuer = {k: v["years"] for k, v in life.items()}
    outliving = sum(r["amount_usd"] for r in head if r["tenor_years"] > life_by_issuer[r["issuer_id"]])
    return {
        "headline_usd": round(sum(r["amount_usd"] for r in head)),
        "share_outliving_hardware": round(outliving / max(1, sum(r["amount_usd"] for r in head)), 4),
        "currencies": sorted({r["currency"] for r in head}),
        "headline_explicit_usd": round(sum(r["amount_usd"] for r in head if r["ai_flag"] == "explicit")),
        "n_tranches": len(head),
        "n_deals": len({(r["issuer_id"], r["trade_date"]) for r in head}),
        "n_issuers_borrowing": len({r["issuer_id"] for r in head}),
        "first_date": head[0]["trade_date"] if head else None,
        "last_date": head[-1]["trade_date"] if head else None,
        "by_issuer_year": {k: {y: round(v) for y, v in d.items()} for k, d in by_issuer_year.items()},
        "maturity_wall": {y: {k: round(v) for k, v in d.items()} for y, d in sorted(wall.items())},
        "cumulative": list(cum_by_date.values()),
        "index_oas_bp": spreads,
        "mismatch": mismatch,
    }


def issuers_payload(cfg: dict, records: List[dict], offline: bool) -> List[dict]:
    life = yaml.safe_load((CONFIG / "useful_life.yaml").read_text())
    out = []
    years = range(2022, dt.date.today().year + 1)
    for iss in cfg["issuers"]:
        f = enrich.fundamentals(iss["cik"], years, offline)
        rs = [r for r in records if r["issuer_id"] == iss["id"] and r["in_headline"]]
        out.append(
            {
                **{k: iss[k] for k in ("id", "name", "ticker", "cik", "color", "inclusion_reason")},
                "useful_life": life.get(iss["id"]),
                "fundamentals": {k: {str(y): v for y, v in d.items() if v} for k, d in f.items()},
                "borrowed_usd": round(sum(r["amount_usd"] for r in rs)),
                "n_tranches": len(rs),
            }
        )
    return out


def write_outputs(records, issuers, met, review, side=None) -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    REVIEW.mkdir(parents=True, exist_ok=True)
    today = dt.date.today().isoformat()
    meta = {"dataset_version": today.replace("-", "."), "generated_at": today,
            "sources": ["SEC EDGAR", "SEC XBRL API", "FRED (ICE BofA indices, H.10 FX)"],
            "license": "CC-BY-4.0"}
    (PUBLIC / "bonds.json").write_text(json.dumps({"meta": meta, "bonds": records}, indent=1))
    with open(PUBLIC / "bonds.csv", "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=CSV_FIELDS, extrasaction="ignore")
        w.writeheader()
        w.writerows(records)
    (PUBLIC / "issuers.json").write_text(json.dumps({"meta": meta, "issuers": issuers}, indent=1))
    (PUBLIC / "metrics.json").write_text(json.dumps({"meta": meta, **met}, indent=1))
    obs = yaml.safe_load((CONFIG / "off_balance_sheet.yaml").read_text()) or []
    (PUBLIC / "offbalance.json").write_text(json.dumps({"meta": meta, "items": obs}, indent=1))
    (REVIEW / "queue.json").write_text(json.dumps(review, indent=1))
    if side is not None:
        (PUBLIC / "quarterly.json").write_text(
            json.dumps({"meta": meta, "issuers": side["fundamentals_quarterly"]}, indent=1))
        (PUBLIC / "segments.json").write_text(json.dumps({"meta": meta, "issuers": side["segments"]}, indent=1))
        (PUBLIC / "commitments.json").write_text(json.dumps({"meta": meta, "items": side["commitments"]}, indent=1))
        # every extracted segment number, validated or not, for human review
        (REVIEW / "segments_queue.json").write_text(json.dumps(side["queue"], indent=1))


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true", help="use cached HTTP responses only")
    args = ap.parse_args(argv)

    cfg = load_issuers()
    docs = discover(offline=args.offline)
    records, review = build_records(docs, args.offline)
    records = finalize(dedupe(records), args.offline)
    met = metrics(records, cfg, args.offline)
    side = asset_side.build(cfg, args.offline)
    met.update(side["metrics"])  # new keys only; existing keys are untouched
    write_outputs(records, issuers_payload(cfg, records, args.offline), met, review, side)

    print(f"documents: {len(docs)}  tranches published: {len(records)}  review queue: {len(review)}")
    print(f"headline: ${met['headline_usd'] / 1e9:,.1f}B across {met['n_deals']} deals")
    for item in review:
        print(f"  REVIEW {item['accession']} #{item.get('tranche', '-')}: {'; '.join(item['issues'])}")
    held = [q for q in side["queue"] if q.get("status") != "validated"]
    print(f"asset side: {sum(len(v['quarters']) for v in side['fundamentals_quarterly'].values())} issuer-quarters, "
          f"{sum(q.get('status') == 'validated' for q in side['queue'])} segment values validated, "
          f"{len(side['commitments'])} lease commitments, {len(held)} held for review")
    for q in held:
        print(f"  HELD {q.get('type', 'segment')} {q.get('issuer_id')}: {q.get('issues') or q.get('issue')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
