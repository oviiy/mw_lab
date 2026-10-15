"""Build the static file list used by the mw_lab browser.

Run from any directory: python scripts/build-file-index.py
"""

import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "file-index.json"

HIDDEN_PREFIXES = (
    ".deleted/",
    ".github/",
    "assets/",
    "knowledge/private/",
    "scripts/",
)
HIDDEN_FILES = {
    ".nojekyll",
    "file-index.json",
    "index.html",
    "knowledge/index.html",
    "tools/index.html",
    "games/index.html",
}


def main() -> None:
    tracked = subprocess.check_output(
        ["git", "ls-files", "-z"], cwd=ROOT
    ).decode("utf-8").split("\0")
    paths = sorted(
        path
        for path in tracked
        if path
        and path not in HIDDEN_FILES
        and not path.startswith(HIDDEN_PREFIXES)
    )
    OUTPUT.write_text(
        json.dumps(paths, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"Indexed {len(paths)} files in {OUTPUT.name}")


if __name__ == "__main__":
    main()
