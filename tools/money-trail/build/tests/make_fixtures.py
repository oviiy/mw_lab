"""One-off: copy Berkshire's 2022Q3 and 2025Q4 13F rows from SEC bulk files into small TSV fixtures (SEC data is public domain)."""
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sm.config import CACHE_DIR  # noqa: E402
from sm.sec import SecClient  # noqa: E402

BASE = "https://www.sec.gov/files/structureddata/data/form-13f-data-sets/"
PICKS = {"2022q4_form13f.zip": "0000950123-22-012275", "01dec2025-28feb2026_form13f.zip": "0001193125-26-054580"}
TABLES = ["SUBMISSION", "COVERPAGE", "SUMMARYPAGE", "INFOTABLE"]
OUT = Path(__file__).resolve().parent / "fixtures" / "brk"


def main() -> None:
    client = SecClient()
    OUT.mkdir(parents=True, exist_ok=True)
    headers: dict[str, str] = {}
    rows: dict[str, list[str]] = {t: [] for t in TABLES}
    for name, acc in PICKS.items():
        zp = client.download(BASE + name, CACHE_DIR / "zips" / name)
        with zipfile.ZipFile(zp) as z:
            for t in TABLES:
                with z.open(f"{t}.tsv") as fh:
                    h = fh.readline().decode()
                    if t in headers and headers[t] != h:
                        raise SystemExit(f"{t} header differs between files; fixture would be inconsistent")
                    headers[t] = h
                    rows[t] += [ln.decode() for ln in fh if ln.startswith(acc.encode())]
    for t in TABLES:
        (OUT / f"{t}.tsv").write_text(headers[t] + "".join(rows[t]))
        print(t, len(rows[t]), "rows")


if __name__ == "__main__":
    main()
