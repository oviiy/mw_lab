"""Record provenance on extractions produced outside the API path.

    python -m aidebt.stamp --extractor "claude-sonnet (agent run 2026-10-14)"

Adds _meta.bundle_hash (of the current bundle) and _meta.extractor to every
extraction file that does not have them yet.
"""
from __future__ import annotations

import argparse
import json

from .extract import EXTRACTIONS
from .fetch import bundle_hash, bundle_path


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--extractor", required=True)
    args = ap.parse_args()
    n = 0
    for p in sorted(EXTRACTIONS.glob("*.json")):
        data = json.loads(p.read_text())
        if "_meta" in data:
            continue
        bp = bundle_path(p.stem)
        if not bp.exists():
            print(f"skip {p.stem}: no bundle")
            continue
        data["_meta"] = {"bundle_hash": bundle_hash(bp.read_text()), "extractor": args.extractor}
        p.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        n += 1
    print(f"stamped {n} extraction(s)")


if __name__ == "__main__":
    main()
