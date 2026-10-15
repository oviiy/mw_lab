import zipfile
from datetime import date

import pandas as pd
import pytest

from sm.ingest_13f import (TABLES, parse_index, parse_range, select_files, shift_quarter_end,
                           zip_to_parquet)


def test_parse_range_both_formats():
    assert parse_range("2022q4_form13f.zip") == (date(2022, 10, 1), date(2022, 12, 31))
    assert parse_range("01dec2025-28feb2026_form13f.zip") == (date(2025, 12, 1), date(2026, 2, 28))
    with pytest.raises(ValueError):
        parse_range("readme.zip")


def test_parse_index_and_select():
    html = '''<a href="/files/structureddata/data/form-13f-data-sets/2022q4_form13f.zip">x</a>
      <a href="/files/datastandardsinnovation/data/form-13f-data-sets/01jun2026-31aug2026_form13f.zip">y</a>
      <a href="/files/structureddata/data/form-13f-data-sets/2022q4_form13f.zip">dup</a>'''
    files = parse_index(html)
    assert [f.name for f in files] == ["2022q4_form13f.zip", "01jun2026-31aug2026_form13f.zip"]
    assert files[1].url.startswith("https://www.sec.gov/files/datastandardsinnovation/")
    assert [f.name for f in select_files(files, date(2023, 3, 31))] == ["01jun2026-31aug2026_form13f.zip"]


def test_shift_quarter_end():
    assert shift_quarter_end(date(2026, 10, 15), 0) == date(2026, 12, 31)
    assert shift_quarter_end(date(2026, 10, 15), -1) == date(2026, 9, 30)
    assert shift_quarter_end(date(2026, 2, 1), -2) == date(2025, 9, 30)


def _write_zip(path, tables, folder=""):
    with zipfile.ZipFile(path, "w") as z:
        for name, text in tables.items():
            z.writestr(f"{folder}{name}.tsv", text)


def _minimal_tables(infotable_rows):
    sub = "ACCESSION_NUMBER\tFILING_DATE\tSUBMISSIONTYPE\tCIK\tPERIODOFREPORT\nA-1\t14-NOV-2022\t13F-HR\t0000000001\t30-SEP-2022\n"
    cov = ("ACCESSION_NUMBER\tISAMENDMENT\tAMENDMENTTYPE\tFILINGMANAGER_NAME\tFILINGMANAGER_CITY\tFILINGMANAGER_STATEORCOUNTRY\tEXTRA\n"
           "A-1\tN\t\tAlpha\tNYC\tNY\tz\n")
    summ = "ACCESSION_NUMBER\tTABLEENTRYTOTAL\tTABLEVALUETOTAL\nA-1\t1\t5\n"
    info = "\t".join(TABLES["INFOTABLE"] + ["FIGI"]) + "\n" + infotable_rows
    return {"SUBMISSION": sub, "COVERPAGE": cov, "SUMMARYPAGE": summ, "INFOTABLE": info}


def test_zip_to_parquet_keeps_quotes_and_selected_columns(tmp_path):
    row = "A-1\t7\tO\"REILLY AUTOMOTIVE\tCOM\t67103H107\t5\t10\tSH\t\tfigi\n"
    zp = tmp_path / "t.zip"
    _write_zip(zp, _minimal_tables(row))
    out = zip_to_parquet(zp, tmp_path / "out")
    info = pd.read_parquet(out / "infotable.parquet")
    assert list(info.columns) == TABLES["INFOTABLE"]
    assert info.loc[0, "NAMEOFISSUER"] == 'O"REILLY AUTOMOTIVE'
    assert info.loc[0, "PUTCALL"] == ""
    cov = pd.read_parquet(out / "coverpage.parquet")
    assert "EXTRA" not in cov.columns


def test_zip_to_parquet_rejects_schema_change(tmp_path):
    t = _minimal_tables("")
    t["INFOTABLE"] = "ACCESSION_NUMBER\tCUSIP\n"
    zp = tmp_path / "bad.zip"
    _write_zip(zp, t)
    with pytest.raises(ValueError, match="missing columns"):
        zip_to_parquet(zp, tmp_path / "out")


def test_zip_to_parquet_finds_tables_in_subfolder(tmp_path):
    zp = tmp_path / "nested.zip"
    _write_zip(zp, _minimal_tables("A-1\t7\tX\tCOM\t1\t5\t10\tSH\t\t\n"), folder="01JUN2025-31AUG2025_form13f/")
    out = zip_to_parquet(zp, tmp_path / "out")
    assert len(pd.read_parquet(out / "infotable.parquet")) == 1
