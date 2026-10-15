"""Download SEC Form 13F bulk data sets and convert the tables we use to Parquet (all string columns)."""
from __future__ import annotations

import calendar
import csv
import re
import zipfile
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

from .config import CACHE_DIR
from .sec import SecClient

INDEX_URL = "https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets"
SEC_ROOT = "https://www.sec.gov"
# Order matters: INFOTABLE last, so its parquet existing means the whole directory is complete.
TABLES = {
    "SUBMISSION": ["ACCESSION_NUMBER", "FILING_DATE", "SUBMISSIONTYPE", "CIK", "PERIODOFREPORT"],
    "COVERPAGE": ["ACCESSION_NUMBER", "ISAMENDMENT", "AMENDMENTTYPE", "FILINGMANAGER_NAME",
                  "FILINGMANAGER_CITY", "FILINGMANAGER_STATEORCOUNTRY"],
    "SUMMARYPAGE": ["ACCESSION_NUMBER", "TABLEENTRYTOTAL", "TABLEVALUETOTAL"],
    "INFOTABLE": ["ACCESSION_NUMBER", "INFOTABLE_SK", "NAMEOFISSUER", "TITLEOFCLASS", "CUSIP", "VALUE",
                  "SSHPRNAMT", "SSHPRNAMTTYPE", "PUTCALL"],
}


@dataclass(frozen=True)
class DatasetFile:
    url: str
    name: str
    start: date
    end: date


def parse_range(name: str) -> tuple[date, date]:
    m = re.fullmatch(r"(\d{4})q([1-4])_form13f\.zip", name)
    if m:
        y, q = int(m[1]), int(m[2])
        last = 3 * q
        return date(y, last - 2, 1), date(y, last, calendar.monthrange(y, last)[1])
    m = re.fullmatch(r"(\d{2}[a-z]{3}\d{4})-(\d{2}[a-z]{3}\d{4})_form13f\.zip", name)
    if m:
        parse = lambda s: datetime.strptime(s, "%d%b%Y").date()  # noqa: E731
        return parse(m[1]), parse(m[2])
    raise ValueError(f"unrecognised 13F data set file name: {name}")


def parse_index(html: str) -> list[DatasetFile]:
    out: dict[str, DatasetFile] = {}
    for href in re.findall(r'href="([^"]*_form13f\.zip)"', html):
        name = href.rsplit("/", 1)[-1]
        if name in out:
            continue
        start, end = parse_range(name)
        out[name] = DatasetFile(SEC_ROOT + href if href.startswith("/") else href, name, start, end)
    return sorted(out.values(), key=lambda f: f.start)


def select_files(files: list[DatasetFile], first_period_end: date) -> list[DatasetFile]:
    """Filings for a period are made after the period ends, so only files ending after it can hold them."""
    return [f for f in files if f.end > first_period_end]


def shift_quarter_end(d: date, k: int) -> date:
    idx = d.year * 4 + (d.month - 1) // 3 + k
    y, q = divmod(idx, 4)
    m = 3 * q + 3
    return date(y, m, calendar.monthrange(y, m)[1])


def zip_to_parquet(zip_path: Path, out_dir: Path) -> Path:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as z:
        # Some releases nest the TSVs inside a folder (e.g. 01JUN2025-31AUG2025_form13f/INFOTABLE.tsv).
        members = {Path(n).name.upper(): n for n in z.namelist() if not n.endswith("/")}
        for table, cols in TABLES.items():
            dest = out_dir / f"{table.lower()}.parquet"
            if dest.exists():
                continue
            member = members.get(f"{table}.TSV")
            if member is None:
                raise ValueError(f"{Path(zip_path).name}: no {table}.tsv in archive")
            with z.open(member) as fh:
                header = fh.readline().decode("utf-8", "replace").rstrip("\r\n").split("\t")
            missing = [c for c in cols if c not in header]
            if missing:
                raise ValueError(f"{Path(zip_path).name}/{table}.tsv missing columns {missing}; header is {header}")
            tmp = dest.with_name(dest.name + ".part")
            writer = None
            with z.open(member) as fh:
                reader = pd.read_csv(fh, sep="\t", dtype=str, usecols=cols, quoting=csv.QUOTE_NONE,
                                     keep_default_na=False, chunksize=1_000_000, encoding="utf-8",
                                     encoding_errors="replace", on_bad_lines="warn")
                for chunk in reader:
                    t = pa.Table.from_pandas(chunk[cols], preserve_index=False)
                    if writer is None:
                        writer = pq.ParquetWriter(tmp, t.schema)
                    writer.write_table(t)
            if writer is None:
                pd.DataFrame({c: pd.Series(dtype=str) for c in cols}).to_parquet(tmp, index=False)
            else:
                writer.close()
            tmp.rename(dest)
    return out_dir


def ingest(client: SecClient, first_period_end: date, root: Path = CACHE_DIR / "13f") -> list[Path]:
    html = client.get_bytes(INDEX_URL, max_age_s=86400).decode("utf-8", "replace")
    files = select_files(parse_index(html), first_period_end)
    if not files:
        raise RuntimeError("no 13F data set files found on the SEC index page")
    dirs = []
    for f in files:
        out_dir = Path(root) / f.name.removesuffix(".zip")
        if not (out_dir / "infotable.parquet").exists():
            print(f"[13f] downloading {f.name}")
            zp = client.download(f.url, Path(root) / "zips" / f.name)
            zip_to_parquet(zp, out_dir)
            zp.unlink()
        dirs.append(out_dir)
    return dirs
