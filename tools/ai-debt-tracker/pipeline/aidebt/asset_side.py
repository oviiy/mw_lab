"""Assemble the asset side of the dataset: quarterly fundamentals, cloud segments,
lease commitments, and the new metrics keys (funding_gap, capex_intensity,
capex_vs_cloud_growth, interest_coverage, depreciation_wave).

Nothing here changes the headline debt numbers; it only adds keys and files.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Tuple

import yaml

from . import assets as A
from . import quarterly as Q
from . import sec
from . import segments as S
from .text import html_to_text
from .validate import quote_in_source

CONFIG = Path(__file__).resolve().parents[1] / "config"
# a newer filing only matters if it actually discloses leases not yet commenced
NOT_COMMENCED = re.compile(r"(?i)not yet commenced|have not commenced|has not commenced")


def _cfg(name: str):
    return yaml.safe_load((CONFIG / name).read_text())


def lease_commitments(offline: bool, ciks: Dict[str, int]) -> Tuple[List[dict], List[dict]]:
    """Return (published, held). Each entry's quotes must occur verbatim in its filing,
    and the amount text must appear in one of them. Entries are hand-curated, so an entry
    whose issuer has filed a newer 10-Q/10-K is also flagged (but still published) so a
    person can update it."""
    published, rejected = [], []
    for item in _cfg("lease_commitments.yaml") or []:
        cik = ciks.get(item["issuer_id"])
        if cik:
            newer = [f for f in S.periodic_filings(cik, item["as_of"], offline) if f["report_date"] > item["as_of"]
                     and NOT_COMMENCED.search(html_to_text(sec.get(f["url"], offline=offline)))]
            if newer:
                rejected.append({"id": item["id"], "issuer_id": item["issuer_id"], "status": "stale",
                                 "issues": [f"newer filing to check: {newer[-1]['form']} for {newer[-1]['report_date']}"],
                                 "source_url": newer[-1]["url"]})
        text = html_to_text(sec.get(item["source_url"], offline=offline))
        issues = [f"quote not found verbatim: {q[:60]}" for q in item["quotes"] if not quote_in_source(q, text)]
        if not any(item["amount_text"] in q for q in item["quotes"]):
            issues.append("amount text not in any quote")
        (rejected if issues else published).append({**item, "issues": issues} if issues else item)
    return published, rejected


def life_history_check(offline: bool) -> List[dict]:
    """Verify earnings-impact quotes in useful_life.yaml; returns problems (empty = all good)."""
    problems = []
    for iid, life in _cfg("useful_life.yaml").items():
        for h in life.get("history", []) or []:
            if "impact_quote" in h:
                text = html_to_text(sec.get(h["impact_url"], offline=offline))
                if not quote_in_source(h["impact_quote"], text):
                    problems.append({"issuer_id": iid, "effective": h["effective"], "issue": "impact quote not found"})
    return problems


def build(issuers_cfg: dict, offline: bool) -> Dict:
    seg_cfg = _cfg("segments.yaml")
    assumptions = _cfg("assumptions.yaml")
    lives = _cfg("useful_life.yaml")

    fundamentals_quarterly: Dict[str, dict] = {}
    segments_out: Dict[str, dict] = {}
    queue: List[dict] = []
    gap_q, gap_y, intensity, growth, coverage, wave = {}, {}, {}, {}, {}, {}

    for iss in issuers_cfg["issuers"]:
        iid, cik = iss["id"], iss["cik"]
        quarters, years = Q.build(cik, since_fy=assumptions["first_vintage_fy"], offline=offline)
        qrows, yrows = Q.to_rows(quarters, cik), Q.to_rows(years, cik)
        fundamentals_quarterly[iid] = {"quarters": qrows, "years": yrows}

        # cloud segment (validated candidates only)
        spec = seg_cfg["issuers"][iid]
        cands = S.extract_issuer(iid, cik, spec, S.since_date(cik, seg_cfg["since_fy"], offline), offline)
        queue.extend(cands)
        seg = S.series(cik, spec, cands, offline)
        segments_out[iid] = {"kind": spec["kind"], "label": spec["label"], **seg}

        if spec["kind"] in ("ixbrl_amount", "text_growth"):
            cloud_q = {(r["fy"], r["fq"]): r["yoy_pct"] for r in seg["quarters"] if r.get("yoy_pct") is not None}
            cloud_y = {(r["fy"], 0): r["yoy_pct"] for r in seg["years"] if r.get("yoy_pct") is not None}
            basis = "pct_disclosed" if spec["kind"] == "text_growth" else "segment_revenue"
        else:  # CoreWeave: all revenue; Meta: no cloud segment, total revenue
            cloud_q = A.yoy(qrows, "revenue")
            cloud_y = A.yoy(yrows, "revenue")
            basis = "total_revenue"

        recent_q = [r for r in qrows if r["fy"] >= 2023]
        recent_y = [r for r in yrows if r["fy"] >= 2022]
        gap_q[iid] = [g for g in A.funding_gap(qrows) if g["fy"] >= 2023]
        gap_y[iid] = [g for g in A.funding_gap(yrows) if g["fy"] >= 2022]
        intensity[iid] = {"quarters": A.capex_intensity(recent_q), "years": A.capex_intensity(recent_y)}
        growth[iid] = {
            "quarters": [g for g in A.capex_vs_cloud_growth(recent_q, cloud_q, basis)],
            "years": [g for g in A.capex_vs_cloud_growth(recent_y, cloud_y, basis)],
            "basis": basis,
        }
        coverage[iid] = [c for c in A.interest_coverage(qrows) if c["fy"] >= 2023]

        # depreciation wave from fiscal-year capex vintages
        capex_by_fy = {r["fy"]: r["values"]["capex"] for r in yrows if "capex" in r["values"]}
        if capex_by_fy:
            life_info = lives.get(iid, {})
            life_of = A.life_schedule(life_info.get("history", []), life_info.get("years", 6))
            last = max(capex_by_fy)
            span = list(range(last - 2, last + assumptions["horizon_years"] + 1))
            latest_rev = next((r["values"]["revenue"] for r in reversed(yrows) if "revenue" in r["values"]), None)
            reported = {r["fy"]: r["values"].get("depreciation") for r in yrows}
            wave[iid] = {
                "vintages": [{"fy": fy, "capex": c, "server_life": life_of(fy)} for fy, c in sorted(capex_by_fy.items())],
                "server_share": assumptions["server_share_of_capex"],
                "other_life": assumptions["other_asset_life_years"],
                "latest_fy": last,
                "latest_revenue": latest_rev,
                "years": [
                    {**w, "reported_depreciation": reported.get(w["fy"]), "projected": w["fy"] > last}
                    for w in A.depreciation_wave(capex_by_fy, life_of, assumptions["server_share_of_capex"],
                                                 assumptions["other_asset_life_years"], span)
                ],
            }

    ciks = {i["id"]: i["cik"] for i in issuers_cfg["issuers"]}
    commitments, rejected_commitments = lease_commitments(offline, ciks)
    queue.extend({"type": "lease_commitment", **r} for r in rejected_commitments)
    queue.extend({"type": "useful_life_impact", **p} for p in life_history_check(offline))

    return {
        "fundamentals_quarterly": fundamentals_quarterly,
        "segments": segments_out,
        "commitments": commitments,
        "queue": queue,
        "metrics": {
            "funding_gap": {"quarters": gap_q, "years": gap_y},
            "capex_intensity": intensity,
            "capex_vs_cloud_growth": growth,
            "interest_coverage": coverage,
            "depreciation_wave": {"assumptions": assumptions, "issuers": wave},
        },
    }
