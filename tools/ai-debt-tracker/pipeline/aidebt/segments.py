"""Cloud segment revenue from the filings themselves (the XBRL API has no segment data).

Extraction is deterministic and every value carries a verbatim quote:
  * ixbrl_amount: inline-XBRL facts in the 10-Q/10-K whose context carries the configured
    segment member; the quote is the text of the table row the fact sits in.
  * text_growth: a growth percentage matched in the filing text; the quote is the sentence.

All candidates are written to data/review/segments_queue.json. A candidate is published
only if validate() passes: the quote occurs verbatim in the filing and contains the number.
"""
from __future__ import annotations

import datetime as dt
import html
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import yaml

from . import quarterly as Q
from . import sec
from .text import html_to_text
from .validate import quote_in_source

CONFIG = Path(__file__).resolve().parents[1] / "config" / "segments.yaml"
ALLOWED_EXTRA_DIMS = {("srt:ConsolidationItemsAxis", "us-gaap:OperatingSegmentsMember")}


def load_config() -> dict:
    return yaml.safe_load(CONFIG.read_text())


def periodic_filings(cik: int, since: str, offline: bool = False) -> List[dict]:
    """10-Q and 10-K filings (with amendments) whose report date is on or after `since`."""
    data = sec.get_json(f"https://data.sec.gov/submissions/CIK{cik:010d}.json", max_age_days=0.5, offline=offline)
    blocks = [data["filings"]["recent"]]
    for extra in data["filings"].get("files", []):
        blocks.append(sec.get_json(f"https://data.sec.gov/submissions/{extra['name']}", max_age_days=7, offline=offline))
    out = []
    for b in blocks:
        for i, form in enumerate(b["form"]):
            if form in Q.FORMS and b["reportDate"][i] >= since:
                out.append({
                    "form": form, "accession": b["accessionNumber"][i], "doc": b["primaryDocument"][i],
                    "report_date": b["reportDate"][i], "filed": b["filingDate"][i],
                    "url": sec.archive_url(cik, b["accessionNumber"][i], b["primaryDocument"][i]),
                })
    return sorted(out, key=lambda f: f["report_date"])


# --- inline XBRL ---------------------------------------------------------------

_CTX = re.compile(r"<xbrli:context id=\"([^\"]+)\">(.*?)</xbrli:context>", re.S)
_MEMBER = re.compile(r"<xbrldi:explicitMember dimension=\"([^\"]+)\">\s*([^<\s]+)\s*<")
_FACT = re.compile(r"<ix:nonFraction\b([^>]*)>(.*?)</ix:nonFraction>", re.S)


def _attr(attrs: str, name: str) -> Optional[str]:
    m = re.search(rf'\b{name}="([^"]*)"', attrs)
    return m.group(1) if m else None


def contexts(raw: str) -> Dict[str, Tuple[frozenset, Optional[str], Optional[str]]]:
    out = {}
    for m in _CTX.finditer(raw):
        body = m.group(2)
        dims = frozenset(_MEMBER.findall(body))
        st = re.search(r"<xbrli:startDate>([^<]+)<", body)
        en = re.search(r"<xbrli:endDate>([^<]+)<", body)
        out[m.group(1)] = (dims, st.group(1) if st else None, en.group(1) if en else None)
    return out


def _row_text(raw: str, pos: int) -> str:
    """Visible text of the table row enclosing position `pos`."""
    start = raw.rfind("<tr", 0, pos)
    end = raw.find("</tr>", pos)
    if start < 0 or end < 0:
        return ""
    return html_to_text(raw[start : end + 5].encode())


def ixbrl_facts(raw: str, member: List[str], tags: List[str]) -> List[dict]:
    want = tuple(member)
    ctx = contexts(raw)
    found = []
    for m in _FACT.finditer(raw):
        attrs, inner = m.group(1), m.group(2)
        name = _attr(attrs, "name") or ""
        tag = name.split(":", 1)[-1]
        if tag not in tags:
            continue
        c = ctx.get(_attr(attrs, "contextRef") or "")
        if not c or want not in c[0] or not c[1]:
            continue
        if not (c[0] - {want}) <= ALLOWED_EXTRA_DIMS:
            continue
        text = html.unescape(re.sub(r"<[^>]+>", "", inner)).strip()
        if not re.search(r"\d", text):
            continue
        num = float(text.replace(",", ""))
        scale = int(_attr(attrs, "scale") or 0)
        if _attr(attrs, "sign") == "-":
            num = -num
        found.append({
            "tag": tag, "start": c[1], "end": c[2], "val": num * 10 ** scale,
            "number_text": text, "quote": _row_text(raw, m.start()),
        })
    return found


# --- validation -----------------------------------------------------------------


def validate(candidate: dict, source_text: str) -> List[str]:
    """Reasons to reject; empty means publishable."""
    issues = []
    quote = candidate.get("quote") or ""
    if not quote_in_source(quote, source_text):
        issues.append("quote not found verbatim in filing")
    if candidate.get("number_text") and candidate["number_text"] not in quote:
        issues.append("number does not appear in its quote")
    return issues


# --- per-issuer extraction ------------------------------------------------------


def extract_issuer(issuer_id: str, cik: int, spec: dict, since: str, offline: bool = False) -> List[dict]:
    """All candidates from every periodic filing since `since`, each with validation status."""
    cands: List[dict] = []
    if spec["kind"] not in ("ixbrl_amount", "text_growth"):
        return cands
    for f in periodic_filings(cik, since, offline):
        raw_bytes = sec.get(f["url"], offline=offline)
        raw = raw_bytes.decode("utf-8", errors="replace")
        text = html_to_text(raw_bytes)
        if spec["kind"] == "ixbrl_amount":
            found = ixbrl_facts(raw, spec["member"], spec["tags"])
        else:
            found = []
            m = re.search(spec["pattern"], text)
            if m:
                sent_start = max(text.rfind(".", 0, m.start()) + 1, text.rfind("\n", 0, m.start()) + 1)
                sent_end = text.find(".", m.end())
                quote = text[sent_start : sent_end + 1].strip()
                found.append({
                    "tag": "text", "start": None, "end": f["report_date"], "val": float(m.group(1)),
                    "number_text": f"{m.group(1)}%", "quote": quote,
                    # 10-Q highlights are for the quarter; 10-K highlights for the fiscal year
                    "period": "fiscal_year" if f["form"].startswith("10-K") else "quarter",
                })
        for c in found:
            c.update({"issuer_id": issuer_id, "accession": f["accession"], "form": f["form"],
                      "filed": f["filed"], "source_url": f["url"]})
            issues = validate(c, text)
            c["status"] = "validated" if not issues else "rejected"
            c["issues"] = issues
            cands.append(c)
    return cands


def series(cik: int, spec: dict, cands: List[dict], offline: bool = False) -> dict:
    """Publishable quarterly and fiscal-year series from validated candidates only."""
    ok = [c for c in cands if c["status"] == "validated"]
    gaap = Q.company_facts(cik, offline)
    starts = Q.fiscal_starts(gaap)
    if spec["kind"] == "ixbrl_amount":
        pseudo = {"SEGMENT": {"units": {"USD": [
            {"start": c["start"], "end": c["end"], "val": c["val"], "accn": c["accession"],
             "filed": c["filed"], "form": c["form"]} for c in ok
        ]}}}
        qv = Q.quarterly_flow(pseudo, ["SEGMENT"], starts)
        yv = Q.annual_flow(pseudo, ["SEGMENT"])
        by_accn = {c["accession"]: c["source_url"] for c in ok}
        quarters = [{"fy": fy, "fq": fq, "value": v.val, "unit": "usd", "method": v.method,
                     "sources": [by_accn.get(a) for a in v.accns]} for (fy, fq), v in sorted(qv.items())]
        years = [{"fy": fy, "value": v.val, "unit": "usd", "sources": [by_accn.get(a) for a in v.accns]}
                 for fy, v in sorted(yv.items())]
        _add_yoy(quarters, key=lambda r: (r["fy"] - 1, r["fq"]))
        _add_yoy(years, key=lambda r: (r["fy"] - 1,))
        return {"quarters": quarters, "years": years}
    if spec["kind"] == "text_growth":
        quarters, years = [], []
        for c in ok:
            if c["period"] == "quarter":
                fy, fq = _fiscal_label(starts, c["end"])
                quarters.append({"fy": fy, "fq": fq, "yoy_pct": c["val"], "unit": "pct_yoy",
                                 "quote": c["quote"], "sources": [c["source_url"]]})
            else:
                fy, _ = _fiscal_label(starts, c["end"])
                years.append({"fy": fy, "yoy_pct": c["val"], "unit": "pct_yoy",
                              "quote": c["quote"], "sources": [c["source_url"]]})
        return {"quarters": sorted(quarters, key=lambda r: (r["fy"], r["fq"])),
                "years": sorted(years, key=lambda r: r["fy"])}
    return {"quarters": [], "years": []}


def _fiscal_label(starts: List[str], end: str) -> Tuple[int, int]:
    s = max(x for x in starts if x <= end)
    return Q.fiscal_year_of(s), Q.quarter_index(s, end)


def _add_yoy(rows: List[dict], key) -> None:
    index = {(r["fy"], r.get("fq")) if "fq" in r else (r["fy"],): r for r in rows}
    for r in rows:
        prev = index.get(key(r))
        r["yoy_pct"] = round((r["value"] / prev["value"] - 1) * 100, 1) if prev and prev["value"] else None


def since_date(cik: int, since_fy: int, offline: bool = False) -> str:
    starts = Q.fiscal_starts(Q.company_facts(cik, offline))
    eligible = [s for s in starts if Q.fiscal_year_of(s) >= since_fy]
    return eligible[0] if eligible else f"{since_fy}-01-01"
