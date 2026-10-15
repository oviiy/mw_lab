"""Form 4 insider transactions: SEC Insider Transactions Data Sets (quarterly bulk) plus the EDGAR daily index
for filings newer than the latest data set. Both sources are normalised to one row per non-derivative
transaction, attributed to a single "primary" reporting owner per filing."""
from __future__ import annotations

import csv
import re
import xml.etree.ElementTree as ET
import zipfile
from datetime import date, datetime, timedelta
from pathlib import Path

import pandas as pd

from .config import CACHE_DIR
from .sec import SecClient, SecError

INDEX_URL = "https://www.sec.gov/data-research/sec-markets-data/insider-transactions-data-sets"
SEC_ROOT = "https://www.sec.gov"
DAILY_DIR = "https://www.sec.gov/Archives/edgar/daily-index/{y}/QTR{q}/"
ROOT = CACHE_DIR / "form345"

TABLES = {
    "SUBMISSION": ["ACCESSION_NUMBER", "FILING_DATE", "DOCUMENT_TYPE", "ISSUERCIK", "ISSUERNAME", "ISSUERTRADINGSYMBOL", "REMARKS"],
    "REPORTINGOWNER": ["ACCESSION_NUMBER", "RPTOWNERCIK", "RPTOWNERNAME", "RPTOWNER_RELATIONSHIP", "RPTOWNER_TITLE", "RPTOWNER_TXT"],
    "NONDERIV_TRANS": ["ACCESSION_NUMBER", "NONDERIV_TRANS_SK", "SECURITY_TITLE", "TRANS_DATE", "TRANS_CODE", "TRANS_SHARES",
                       "TRANS_PRICEPERSHARE", "TRANS_ACQUIRED_DISP_CD", "SHRS_OWND_FOLWNG_TRANS", "DIRECT_INDIRECT_OWNERSHIP"],
    "FOOTNOTES": ["ACCESSION_NUMBER", "FOOTNOTE_TXT"],
}
OPTIONAL = {"SUBMISSION": ["AFF10B5ONE"]}   # the 10b5-1 checkbox exists on filings from April 2023

COLS = ["accession", "filing_date", "issuer_cik", "issuer_name", "symbol", "owner_cik", "owner_name", "rel", "title",
        "n_owners", "plan", "trans_date", "code", "shares", "price", "ad", "owned_after", "direct"]

# "pursuant to a Rule 10b5-1 trading plan", "10b5-1(c)", "10b-5-1"; but not "not pursuant to ... 10b5-1"
_PLAN = re.compile(r"10b-?5-?1", re.I)
_NOT_PLAN = re.compile(r"\bnot\b[^.]{0,60}10b-?5-?1", re.I)


def mentions_plan(text: str) -> bool:
    return bool(text) and bool(_PLAN.search(text)) and not _NOT_PLAN.search(text)


def parse_index(html: str) -> list[tuple[int, int, str]]:
    out = {}
    for href, y, q in re.findall(r'href="([^"]*?(\d{4})q([1-4])_form345\.zip)"', html):
        out[(int(y), int(q))] = SEC_ROOT + href if href.startswith("/") else href
    return sorted((y, q, u) for (y, q), u in out.items())


def _date(s: str) -> date | None:
    s = (s or "").strip()
    for fmt in ("%d-%b-%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(s[:11] if fmt == "%d-%b-%Y" else s[:10], fmt).date()
        except ValueError:
            pass
    return None


def _num(s) -> float | None:
    try:
        v = float(str(s).replace(",", "").strip())
    except ValueError:
        return None
    return v


def _flag(s: str) -> int | None:
    s = (s or "").strip().lower()
    return 1 if s in ("1", "true") else 0 if s in ("0", "false") else None


def rel_code(relationship: str) -> str:
    """'Director,Officer,TenPercentOwner' -> 'DOT' (X = other)."""
    r = relationship or ""
    return "".join(c for c, k in (("D", "Director"), ("O", "Officer"), ("T", "TenPercentOwner"), ("X", "Other")) if k in r)


def primary_owners(owners: pd.DataFrame) -> pd.DataFrame:
    """One owner per filing. Joint filings (a fund and its general partner, a person and their trust) would otherwise
    double-count both the trade and the insider: prefer an officer/director, then the lowest CIK."""
    o = owners.assign(_insider=owners["rel"].str.contains("[DO]", regex=True).astype(int))
    o = o.sort_values(["accession", "_insider", "owner_cik"], ascending=[True, False, True])
    n = o.groupby("accession")["owner_cik"].transform("size")
    return o.assign(n_owners=n).drop_duplicates("accession").drop(columns="_insider")


def _read(z: zipfile.ZipFile, table: str, name: str) -> pd.DataFrame:
    members = {Path(n).name.upper(): n for n in z.namelist() if not n.endswith("/")}
    member = members.get(f"{table}.TSV")
    if member is None:
        raise ValueError(f"{name}: no {table}.tsv in archive")
    with z.open(member) as fh:
        header = fh.readline().decode("utf-8", "replace").rstrip("\r\n").split("\t")
    cols = TABLES[table]
    missing = [c for c in cols if c not in header]
    if missing:
        raise ValueError(f"{name}/{table}.tsv missing columns {missing}; header is {header}")
    use = cols + [c for c in OPTIONAL.get(table, []) if c in header]
    with z.open(member) as fh:
        return pd.read_csv(fh, sep="\t", dtype=str, usecols=use, quoting=csv.QUOTE_NONE, keep_default_na=False,
                           encoding="utf-8", encoding_errors="replace", on_bad_lines="skip")


def normalise(sub: pd.DataFrame, owners: pd.DataFrame, trans: pd.DataFrame, plan_accessions: set[str]) -> pd.DataFrame:
    """sub: accession, filing_date, doc_type, issuer_cik, issuer_name, symbol, aff (0/1/None), remarks.
    owners: accession, owner_cik, owner_name, rel, title.  trans: accession, trans_date, code, shares, price, ad,
    owned_after, direct.  Only original Form 4s (amendments restate earlier filings and would double count)."""
    sub = sub[sub["doc_type"] == "4"]
    own = primary_owners(owners)
    df = trans.merge(sub, on="accession").merge(own, on="accession")
    by_text = df["accession"].isin(plan_accessions) | df["remarks"].map(mentions_plan)
    # Explicit checkbox wins; before April 2023 (no checkbox) fall back to footnote/remark text.
    df["plan"] = df["aff"].where(df["aff"].notna(), by_text.astype(int)).fillna(0).astype(int)
    df.loc[df["aff"].eq(0) & by_text, "plan"] = 1   # a few filers leave the box unticked but footnote the plan
    return df[COLS].reset_index(drop=True)


def read_dataset(zip_path: Path) -> pd.DataFrame:
    name = Path(zip_path).name
    with zipfile.ZipFile(zip_path) as z:
        s, o, t, f = (_read(z, k, name) for k in ("SUBMISSION", "REPORTINGOWNER", "NONDERIV_TRANS", "FOOTNOTES"))
    sub = pd.DataFrame({
        "accession": s["ACCESSION_NUMBER"], "filing_date": s["FILING_DATE"].map(_date), "doc_type": s["DOCUMENT_TYPE"].str.strip(),
        "issuer_cik": pd.to_numeric(s["ISSUERCIK"], errors="coerce").astype("Int64"), "issuer_name": s["ISSUERNAME"].str.strip(),
        "symbol": s["ISSUERTRADINGSYMBOL"].str.strip().str.upper(),
        "aff": s["AFF10B5ONE"].map(_flag) if "AFF10B5ONE" in s.columns else None, "remarks": s["REMARKS"]})
    owners = pd.DataFrame({
        "accession": o["ACCESSION_NUMBER"], "owner_cik": pd.to_numeric(o["RPTOWNERCIK"], errors="coerce").astype("Int64"),
        "owner_name": o["RPTOWNERNAME"].str.strip(), "rel": o["RPTOWNER_RELATIONSHIP"].map(rel_code),
        "title": o["RPTOWNER_TITLE"].str.strip().where(o["RPTOWNER_TITLE"].str.strip() != "", o["RPTOWNER_TXT"].str.strip())})
    trans = pd.DataFrame({
        "accession": t["ACCESSION_NUMBER"], "trans_date": t["TRANS_DATE"].map(_date), "code": t["TRANS_CODE"].str.strip(),
        "shares": t["TRANS_SHARES"].map(_num), "price": t["TRANS_PRICEPERSHARE"].map(_num), "ad": t["TRANS_ACQUIRED_DISP_CD"].str.strip(),
        "owned_after": t["SHRS_OWND_FOLWNG_TRANS"].map(_num), "direct": t["DIRECT_INDIRECT_OWNERSHIP"].str.strip()})
    plan = set(f.loc[f["FOOTNOTE_TXT"].map(mentions_plan), "ACCESSION_NUMBER"])
    return normalise(sub, owners.dropna(subset=["owner_cik"]), trans, plan)


# ---------------- daily: Form 4 XML ----------------

def _x(node, path: str) -> str:
    if node is None:
        return ""
    n = node.find(path)
    return (n.text or "").strip() if n is not None and n.text else ""


def parse_form4_xml(xml: str, accession: str, filing_date: date) -> pd.DataFrame:
    root = ET.fromstring(xml)
    issuer = root.find("issuer")
    footnotes = " ".join((n.text or "") for n in root.iter("footnote"))
    sub = pd.DataFrame([{
        "accession": accession, "filing_date": filing_date, "doc_type": _x(root, "documentType").strip(),
        "issuer_cik": int(_x(issuer, "issuerCik") or 0), "issuer_name": _x(issuer, "issuerName"),
        "symbol": _x(issuer, "issuerTradingSymbol").upper(), "aff": _flag(_x(root, "aff10b5One")), "remarks": _x(root, "remarks")}])
    owners = []
    for ro in root.findall("reportingOwner"):
        r = ro.find("reportingOwnerRelationship")
        flags = {k: _flag(_x(r, k)) == 1 for k in ("isDirector", "isOfficer", "isTenPercentOwner", "isOther")}
        rel = "".join(c for c, k in (("D", "isDirector"), ("O", "isOfficer"), ("T", "isTenPercentOwner"), ("X", "isOther")) if flags[k])
        owners.append({"accession": accession, "owner_cik": int(_x(ro, "reportingOwnerId/rptOwnerCik") or 0),
                       "owner_name": _x(ro, "reportingOwnerId/rptOwnerName"), "rel": rel,
                       "title": _x(r, "officerTitle") or _x(r, "otherText")})
    trans = []
    for tr in root.findall("nonDerivativeTable/nonDerivativeTransaction"):
        trans.append({"accession": accession, "trans_date": _date(_x(tr, "transactionDate/value")),
                      "code": _x(tr, "transactionCoding/transactionCode"),
                      "shares": _num(_x(tr, "transactionAmounts/transactionShares/value")),
                      "price": _num(_x(tr, "transactionAmounts/transactionPricePerShare/value")),
                      "ad": _x(tr, "transactionAmounts/transactionAcquiredDisposedCode/value"),
                      "owned_after": _num(_x(tr, "postTransactionAmounts/sharesOwnedFollowingTransaction/value")),
                      "direct": _x(tr, "ownershipNature/directOrIndirectOwnership/value")})
    tcols = ["accession", "trans_date", "code", "shares", "price", "ad", "owned_after", "direct"]
    return normalise(sub, pd.DataFrame(owners, columns=["accession", "owner_cik", "owner_name", "rel", "title"]),
                     pd.DataFrame(trans, columns=tcols), {accession} if mentions_plan(footnotes) else set())


def extract_xml(txt: str) -> str | None:
    m = re.search(r"<XML>\s*(<\?xml.*?)</XML>", txt, re.S) or re.search(r"(<ownershipDocument>.*?</ownershipDocument>)", txt, re.S)
    return m.group(1).strip() if m else None


def parse_daily_index(text: str) -> list[tuple[str, date, str]]:
    """form.YYYYMMDD.idx -> unique (accession, filing date, path) for original Form 4s (each is listed twice:
    under the reporting owner and under the issuer)."""
    out = {}
    for line in text.splitlines():
        if not line.startswith("4 "):
            continue
        m = re.search(r"\s(\d{8})\s+(edgar/data/\S+/(\d{10}-\d{2}-\d{6})\.txt)", line)
        if m:
            out[m[3]] = (m[3], datetime.strptime(m[1], "%Y%m%d").date(), m[2])
    return list(out.values())


def quarter_of(d: date) -> tuple[int, int]:
    return d.year, (d.month - 1) // 3 + 1


def fetch_daily(client: SecClient, after: date, today: date, root: Path = ROOT) -> pd.DataFrame:
    """Form 4s filed after `after` (end of the latest bulk data set) up to `today`, via the daily index."""
    frames, d = [], after + timedelta(days=1)
    quarters = sorted({quarter_of(after + timedelta(days=i)) for i in range(1, (today - after).days + 1)})
    for y, q in quarters:
        try:
            listing = client.get_bytes(DAILY_DIR.format(y=y, q=q), max_age_s=6 * 3600).decode("utf-8", "replace")
        except SecError:
            continue
        days = sorted(set(re.findall(r"form\.(\d{8})\.idx", listing)))
        for ds in days:
            day = datetime.strptime(ds, "%Y%m%d").date()
            if day < d or day > today:
                continue
            idx = client.get_bytes(DAILY_DIR.format(y=y, q=q) + f"form.{ds}.idx").decode("latin-1")
            filings = parse_daily_index(idx)
            print(f"[form4] daily {ds}: {len(filings)} Form 4 filings")
            for acc, fd, path in filings:
                try:
                    xml = extract_xml(client.get_bytes(f"{SEC_ROOT}/Archives/{path}").decode("utf-8", "replace"))
                    if xml:
                        frames.append(parse_form4_xml(xml, acc, fd))
                except (SecError, ET.ParseError, ValueError) as e:
                    print(f"[form4] skip {acc}: {e}")
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame(columns=COLS)


def ingest(client: SecClient, first: date, today: date | None = None, root: Path = ROOT) -> pd.DataFrame:
    """All Form 4 non-derivative transactions filed from the quarter containing `first` to today."""
    today = today or date.today()
    files = [f for f in parse_index(client.get_bytes(INDEX_URL, max_age_s=86400).decode("utf-8", "replace"))
             if (f[0], f[1]) >= quarter_of(first)]
    if not files:
        raise RuntimeError("no insider transactions data sets found on the SEC index page")
    frames = []
    for y, q, url in files:
        pq = Path(root) / f"{y}q{q}.parquet"
        if not pq.exists():
            zp = client.download(url, Path(root) / "zips" / f"{y}q{q}_form345.zip")
            print(f"[form4] reading {zp.name}")
            read_dataset(zp).to_parquet(pq, index=False)
        frames.append(pd.read_parquet(pq))
    y, q = files[-1][0], files[-1][1]
    last_end = date(y + (q == 4), 1 if q == 4 else 3 * q + 1, 1) - timedelta(days=1)
    frames.append(fetch_daily(client, last_end, today, root))
    return pd.concat([f for f in frames if len(f)], ignore_index=True)
