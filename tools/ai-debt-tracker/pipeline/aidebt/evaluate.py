"""Score extractions against the independently labelled gold set in eval/labels/.

    python -m aidebt.evaluate            # prints a report, writes eval/report.json

Tranches are matched within a document on (currency, maturity, coupon). Floating-rate
notes have coupon=None, so a fixed and a floating tranche with the same maturity stay
distinct. Field accuracy is then measured on matched pairs.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from .extract import EXTRACTIONS

EVAL = Path(__file__).resolve().parents[2] / "eval"
FIELDS = ("amount", "maturity_date", "coupon_pct", "spread_bp")


def _key(t: dict) -> Tuple:
    c = t.get("coupon_pct")
    return (t.get("currency", "USD"), t.get("maturity_date"), None if c is None else round(float(c), 3))


def _same(field: str, a, b) -> bool:
    if a is None or b is None:
        return a is None and b is None
    if field == "amount":
        return math.isclose(float(a), float(b), rel_tol=1e-9)
    if field in ("coupon_pct", "spread_bp"):
        return abs(float(a) - float(b)) < 0.05
    return a == b


def evaluate() -> Dict:
    labels = sorted((EVAL / "labels").glob("*.json"))
    docs: List[Dict] = []
    tp = fp = fn = 0
    field_hits = {f: 0 for f in FIELDS}
    field_total = 0
    for lp in labels:
        gold = json.loads(lp.read_text())
        ep = EXTRACTIONS / lp.name
        pred = json.loads(ep.read_text()) if ep.exists() else {"is_new_debt": False, "tranches": []}
        g = {_key(t): t for t in gold["tranches"]}
        p = {_key(t): t for t in pred.get("tranches", [])} if pred.get("is_new_debt") else {}
        matched = set(g) & set(p)
        missing: List[str] = [str(k) for k in set(g) - set(p)]
        extra: List[str] = [str(k) for k in set(p) - set(g)]
        errors: List[str] = []
        for k in matched:
            field_total += 1
            for f in FIELDS:
                if _same(f, g[k].get(f), p[k].get(f)):
                    field_hits[f] += 1
                else:
                    errors.append(f"{k} {f}: gold={g[k].get(f)} pred={p[k].get(f)}")
        tp += len(matched)
        fn += len(missing)
        fp += len(extra)
        docs.append({"accession": gold["accession"], "gold": len(g), "pred": len(p),
                     "missing": missing, "extra": extra, "field_errors": errors})
    precision = tp / (tp + fp) if tp + fp else 1.0
    recall = tp / (tp + fn) if tp + fn else 1.0
    report = {
        "documents": len(labels),
        "gold_tranches": tp + fn,
        "tranche_precision": round(precision, 4),
        "tranche_recall": round(recall, 4),
        "field_accuracy": {f: round(field_hits[f] / field_total, 4) if field_total else None for f in FIELDS},
        "matched_tranches": field_total,
        "docs": docs,
    }
    return report


def main() -> None:
    r = evaluate()
    (EVAL / "report.json").write_text(json.dumps(r, indent=1))
    print(f"{r['documents']} documents, {r['gold_tranches']} gold tranches")
    print(f"tranche precision {r['tranche_precision']:.1%}  recall {r['tranche_recall']:.1%}")
    for f, v in r["field_accuracy"].items():
        print(f"  {f:<14} {v:.1%}")
    for d in r["docs"]:
        for line in d["missing"]:
            print(f"  MISSING {d['accession']} {line}")
        for line in d["extra"]:
            print(f"  EXTRA   {d['accession']} {line}")
        for line in d["field_errors"]:
            print(f"  FIELD   {d['accession']} {line}")


if __name__ == "__main__":
    main()
