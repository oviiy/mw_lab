"""Turn raw 13F tables into one clean holdings table: effective filings only, values in USD."""
from __future__ import annotations

from datetime import date
from pathlib import Path

import duckdb
import pandas as pd

VALUE_IN_DOLLARS_FROM = date(2023, 1, 3)  # filings on/after this date report VALUE in dollars, before in $1000s


def _concat(dirs: list[Path], table: str) -> pd.DataFrame:
    return pd.concat([pd.read_parquet(Path(d) / f"{table}.parquet") for d in dirs], ignore_index=True)


def load_submissions(dirs: list[Path]) -> pd.DataFrame:
    subs = _concat(dirs, "submission").drop_duplicates("ACCESSION_NUMBER")
    cover = _concat(dirs, "coverpage").drop_duplicates("ACCESSION_NUMBER")
    df = subs.merge(cover, on="ACCESSION_NUMBER", how="left")
    df = df[df["SUBMISSIONTYPE"].isin(["13F-HR", "13F-HR/A"])]
    out = pd.DataFrame({
        "acc": df["ACCESSION_NUMBER"],
        "cik": df["CIK"].astype("int64"),
        "filing_date": pd.to_datetime(df["FILING_DATE"], format="%d-%b-%Y").dt.date,
        "period": pd.to_datetime(df["PERIODOFREPORT"], format="%d-%b-%Y").dt.date,
        "is_amendment": (df["SUBMISSIONTYPE"] == "13F-HR/A") | (df["ISAMENDMENT"].fillna("") == "Y"),
        "amendment_type": df["AMENDMENTTYPE"].fillna("").str.upper().str.strip(),
        "name": df["FILINGMANAGER_NAME"].fillna(""),
        "city": df["FILINGMANAGER_CITY"].fillna(""),
        "state": df["FILINGMANAGER_STATEORCOUNTRY"].fillna(""),
    })
    return out.reset_index(drop=True)


def effective_accessions(subs: pd.DataFrame) -> pd.DataFrame:
    cols = ["cik", "period", "acc", "filing_date", "first_filing_date"]
    out = []
    ordered = subs.sort_values(["filing_date", "acc"])
    for (cik, period), g in ordered.groupby(["cik", "period"], sort=False):
        rows = g.to_dict("records")
        bases = [i for i, r in enumerate(rows) if not r["is_amendment"] or r["amendment_type"] != "NEW HOLDINGS"]
        if not bases:
            continue
        b = bases[-1]
        eff = [rows[b]] + [r for r in rows[b + 1:] if r["is_amendment"] and r["amendment_type"] == "NEW HOLDINGS"]
        first = rows[0]["filing_date"]
        out += [{"cik": cik, "period": period, "acc": r["acc"], "filing_date": r["filing_date"],
                 "first_filing_date": first} for r in eff]
    return pd.DataFrame(out, columns=cols)


def build_holdings(dirs: list[Path], eff: pd.DataFrame) -> pd.DataFrame:
    con = duckdb.connect()
    reg = eff[["acc", "cik", "period", "filing_date"]].assign(
        period=pd.to_datetime(eff["period"]), filing_date=pd.to_datetime(eff["filing_date"]))
    con.register("eff", reg)
    files = ", ".join("'" + str(Path(d) / "infotable.parquet").replace("'", "''") + "'" for d in dirs)
    df = con.execute(f"""
        WITH it AS (
            SELECT i.*, e.cik, e.period, e.filing_date
            FROM read_parquet([{files}]) i JOIN eff e ON i.ACCESSION_NUMBER = e.acc
            QUALIFY row_number() OVER (PARTITION BY i.ACCESSION_NUMBER, i.INFOTABLE_SK) = 1)
        SELECT cik, period, upper(trim(CUSIP)) AS cusip, upper(trim(PUTCALL)) AS put_call,
               any_value(NAMEOFISSUER) AS issuer, any_value(TITLEOFCLASS) AS title,
               sum(TRY_CAST(SSHPRNAMT AS DOUBLE)) AS shares,
               sum(TRY_CAST(VALUE AS DOUBLE)
                   * CASE WHEN filing_date >= DATE '{VALUE_IN_DOLLARS_FROM.isoformat()}' THEN 1 ELSE 1000 END) AS value_usd
        FROM it
        WHERE upper(trim(SSHPRNAMTTYPE)) = 'SH'
        GROUP BY ALL
    """).df()
    df["period"] = pd.to_datetime(df["period"]).dt.date
    df["cik"] = df["cik"].astype("int64")
    return fix_thousands(df)


def fix_thousands(h: pd.DataFrame) -> pd.DataFrame:
    """Some filers kept reporting VALUE in $1000s after the 2023 switch to dollars (e.g. Duquesne). Their implied share
    prices come out ~1000x too low; when a filer-quarter's median implied price is under $0.50, rescale it by 1000."""
    eq = h[(h["put_call"] == "") & (h["shares"] > 0) & (h["value_usd"] > 0)]
    med = (eq["value_usd"] / eq["shares"]).groupby([eq["cik"], eq["period"]]).median()
    bad = med[med < 0.5].index
    if len(bad):
        key = pd.MultiIndex.from_arrays([h["cik"], h["period"]])
        h = h.copy()
        h.loc[key.isin(bad), "value_usd"] *= 1000
        print(f"[13f] rescaled {len(bad):,} filer-quarters still reporting in $1000s")
    return h


def complete_periods(eff: pd.DataFrame, n: int) -> list[date]:
    counts = eff.drop_duplicates(["cik", "period"]).groupby("period")["cik"].count().sort_index()
    ps = [p for p in counts.index if (p.month, p.day) in {(3, 31), (6, 30), (9, 30), (12, 31)}]
    while len(ps) > 4 and counts[ps[-1]] < 0.9 * max(counts[p] for p in ps[-5:-1]):
        ps.pop()
    return ps[-n:]


def filings_table(subs: pd.DataFrame, eff: pd.DataFrame) -> pd.DataFrame:
    first = eff.drop_duplicates(["cik", "period"])[["cik", "period", "first_filing_date"]]
    names = (subs.sort_values(["filing_date", "acc"]).drop_duplicates(["cik", "period"], keep="last")
             [["cik", "period", "name", "city", "state"]])
    return first.merge(names, on=["cik", "period"], how="left").reset_index(drop=True)
