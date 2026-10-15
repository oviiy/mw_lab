"""One-off: copy a handful of real Form 4 filings from SEC Insider Transactions Data Sets into small TSV fixtures
(SEC data is public domain), plus one raw daily-feed Form 4 submission."""
import sys
import zipfile
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sm.config import CACHE_DIR  # noqa: E402
from sm.insiders import TABLES  # noqa: E402
from sm.sec import SecClient  # noqa: E402

OUT = Path(__file__).resolve().parent / "fixtures" / "form345"
ZIPS = CACHE_DIR / "form345" / "zips"
DAILY = "https://www.sec.gov/Archives/edgar/data/4977/0001104659-26-115763.txt"   # AFLAC, 10b5-1 box ticked


def picks_2026q3(z: zipfile.ZipFile) -> set[str]:
    sub = pd.read_csv(z.open("SUBMISSION.tsv"), sep="\t", dtype=str, keep_default_na=False)
    tr = pd.read_csv(z.open("NONDERIV_TRANS.tsv"), sep="\t", dtype=str, keep_default_na=False)
    celh = set(sub.loc[sub["ISSUERTRADINGSYMBOL"] == "CELH", "ACCESSION_NUMBER"]) & set(tr.loc[tr["TRANS_CODE"] == "P", "ACCESSION_NUMBER"])
    amend = sub.loc[sub["DOCUMENT_TYPE"] == "4/A", "ACCESSION_NUMBER"].head(1)
    return celh | {"0000080420-26-000091", "0000947871-26-000683"} | set(amend)


def main() -> None:
    picks = {"2026q3_form345.zip": None, "2022q1_form345.zip": {"0000769397-22-000002", "0000821026-22-000002"}}
    for name, accs in picks.items():
        out = OUT / name.split("_")[0]
        out.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(ZIPS / name) as z:
            accs = accs or picks_2026q3(z)
            for t in TABLES:
                with z.open(f"{t}.tsv") as fh:
                    lines = fh.read().decode("utf-8", "replace").splitlines(keepends=True)
                keep = [lines[0]] + [ln for ln in lines[1:] if ln.split("\t", 1)[0] in accs]
                (out / f"{t}.tsv").write_text("".join(keep), encoding="utf-8")
        print(name, len(accs), "filings")
    (OUT / "0001104659-26-115763.txt").write_bytes(SecClient().get_bytes(DAILY))


if __name__ == "__main__":
    main()
