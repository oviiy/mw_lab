"""Check every source URL in managers.yaml resolves (HTTP 200). Exit 1 listing failures."""
import sys

import requests

from sm.config import load_managers


def main() -> int:
    bad = []
    for m in load_managers():
        for s in m.sources:
            try:
                r = requests.get(s.url, timeout=20, headers={"User-Agent": "smart-money link check"})
                ok = r.status_code == 200
            except requests.RequestException:
                ok = False
            if not ok:
                bad.append(f"{m.cik} {m.name}: {s.url}")
    print("\n".join(bad) if bad else "all links OK")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
