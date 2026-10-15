"""Build data.js for the technical note from the thesis repository.

Usage:  python3 build/build_data.py [/path/to/time-varying-treasury-factors-main]

Datasets are exactly the thesis's two main panels, never pooled:
  jkv        JKV (2014) unsmoothed Fama–Bliss zero yields, Jan 1970 – Dec 2009, 17 maturities.
  treasury   Official Treasury CMT yields (Fed H.15), Sep 1981 – Aug 2026, the 8 maturities
             3M–10Y that are complete over the whole span (no interpolation).
Results are read from the thesis's saved outputs (wk5/, wk6/, wk7/results); nothing is re-estimated here.
"""
import ast
import glob
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data.js"
THESIS = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
    "/Users/michael.wang/MW/Personal/thesis/time-varying-treasury-factors-main")
R5, R6, R7 = THESIS / "wk5/results", THESIS / "wk6/results", THESIS / "wk7/results"
TSY_COLS = ["m3", "m6", "m12", "m24", "m36", "m60", "m84", "m120"]


def r(x, nd=4):
    if x is None:
        return None
    try:
        x = float(x)
    except (TypeError, ValueError):
        return x
    return None if not np.isfinite(x) else round(x, nd)


def rows(df, nd=4):
    return [{k: (r(v, nd) if isinstance(v, (float, np.floating, int, np.integer)) and not isinstance(v, (bool, np.bool_)) else
                 (bool(v) if isinstance(v, (bool, np.bool_)) else (None if pd.isna(v) else v)))
             for k, v in rec.items()} for rec in df.to_dict("records")]


def hist(draws, bins=60):
    d = np.asarray(draws, float)
    d = d[np.isfinite(d)]
    lo, hi = float(np.quantile(d, .0005)), float(np.quantile(d, .9995))
    c, e = np.histogram(np.clip(d, lo, hi), bins=bins, range=(lo, hi))
    return {"edges": [r(v, 3) for v in e], "counts": c.tolist(), "n": int(d.size),
            "q99": r(np.quantile(d, .99), 3), "median": r(np.median(d), 3)}


# ---------------- datasets ----------------
def datasets():
    jkv = pd.read_csv(THESIS / "references/JKV2014-data/UnsmFB_70-09.csv")
    jd = pd.to_datetime(jkv["date"].astype(str), format="%Y%m%d")
    tsy = pd.read_csv(THESIS / "data/derived/treasury_cmt_h15_monthly_1962_2026.csv", parse_dates=["date"])
    tsy = tsy[(tsy.date >= "1981-09-01") & (tsy.date <= "2026-08-31")].reset_index(drop=True)
    assert tsy[TSY_COLS].isna().sum().sum() == 0
    return [
        {"id": "jkv", "label": "JKV zero-coupon, 1970–2009", "short": "JKV", "kind": "zero",
         "maturities": [int(c) for c in jkv.columns[1:]], "dates": [d.strftime("%Y-%m-%d") for d in jd],
         "yields": [[r(v, 6) for v in row] for row in jkv.iloc[:, 1:].to_numpy()]},
        {"id": "treasury", "label": "Treasury CMT (H.15), 1981–2026", "short": "Treasury", "kind": "par",
         "maturities": [int(c[1:]) for c in TSY_COLS], "dates": [d.strftime("%Y-%m-%d") for d in tsy.date],
         "yields": [[r(v, 2) for v in row] for row in tsy[TSY_COLS].to_numpy()]},
    ]


def macro():
    def fred(n):
        return pd.read_csv(THESIS / f"data/raw/fred_{n}.csv", index_col=0, parse_dates=True).iloc[:, 0]
    cpi = fred("CPIAUCSL")
    idx = pd.period_range("1970-01", "2026-08", freq="M")
    pick = lambda s: [r(v, 2) for v in s.groupby(s.index.to_period("M")).last().reindex(idx)]
    return {"months": [str(p) for p in idx], "fedfunds": pick(fred("FEDFUNDS")),
            "cpi_yoy": pick((cpi / cpi.shift(12) - 1) * 100), "unrate": pick(fred("UNRATE"))}


def history():
    """Presidents, Fed chairs, policy cycles and fiscal milestones exactly as drawn on the thesis slides."""
    tree = ast.parse((THESIS / "wk5/scripts/wk5_extra.py").read_text())
    out = {}
    for node in tree.body:
        if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name) and node.targets[0].id in (
                "PRESIDENTS", "FISCAL", "CHAIRS", "HIKES", "CUTS"):
            out[node.targets[0].id.lower()] = ast.literal_eval(node.value)
    return out


# ---------------- results ----------------
def scan(ds, d, suffix="_mw60_restart60"):
    m = json.loads((R5 / f"multibreak_{ds}_d{d}{suffix}.json").read_text())
    segs = []
    for s in m["segments"]:
        traj = [{"date": t["end_date"][:7], "J": r(t["J"], 3), "crit": r(t["critical_99"], 3), "p": r(t["p"], 4),
                 "reject": bool(t["reject"]), "stage": t.get("stage"), "Th": r(t.get("Th_months"), 1)}
                for t in s.get("trajectory", []) if t.get("end_date")]
        segs.append({"start": s["start_date"][:7], "break": (s["break_date"] or "")[:7] or None, "p": r(s.get("break_p"), 4),
                     "retreated": bool(s.get("retreated")), "edge": bool(s.get("rejected_at_min_window")), "traj": traj})
    sp = m["spec"]
    return {"spec": {"T": sp["T"], "N": sp["N"], "sample": [x[:7] for x in sp["sample"]], "min_window": sp["min_window"],
                     "restart": sp.get("restart_min_window"), "screen": sp["screen_reps"], "confirm": sp["confirm_reps"]},
            "segments": segs}


def results():
    head = pd.read_csv(R5 / "headline_tests.csv")
    z = np.load(R5 / "j_distribution_draws.npz")
    nulls = {}
    for key, panel in (("jkv", "JKV 1970-2009"), ("tsy", "Treasury CMT (H.15) 1981-09-2026-08")):
        for d in (3, 4, 5):
            row = head[(head.panel == panel) & (head.d == d)].iloc[0]
            draws = z[f"{key}_d{d}"]
            nulls[f"{'jkv' if key == 'jkv' else 'treasury'}_{d}"] = {
                **hist(draws), "J": r(row.J, 3), "crit": r(row.critical_99, 3), "p": r(row.p, 4),
                "p_from_draws": r((1 + (draws >= row.J).sum()) / (1 + draws.size), 4)}

    nd = pd.read_csv(R5 / "jkv_1970s_null_draws.csv")
    nobs = pd.read_csv(R5 / "jkv_1970s_null_obs.csv").set_index("sample")
    null7080 = {c: {**hist(nd[c]), "J": r(nobs.loc[c, "J"], 3), "crit": r(nobs.loc[c, "critical_99"], 3),
                    "p": r(nobs.loc[c, "p"], 4)} for c in nd.columns}
    mis = pd.read_csv(R5 / "jkv_1970s_monthly_misfit.csv")

    ev = pd.read_csv(R5 / "wk5_break_events.csv")
    ev = ev[ev.panel.isin(["JKV 1970–2009", "Treasury 1981–2026"])]
    sim = pd.read_csv(R5 / "sim_size_power.csv", dtype={"dgp": str})
    simg = sim.groupby(["dgp", "N", "T"]).rej05.mean().mul(100).round(1).reset_index()
    diag = pd.read_csv(glob.glob(str(R5 / "diag5_bootstrap_errors_1_17_480*rep5000*.csv"))[0], dtype={"dgp": str})
    diagg = diag.groupby(["dgp", "N", "T", "config"]).rej05.mean().mul(100).round(1).reset_index()

    return {
        "headline": rows(head.drop(columns=["resid_lag1_median"])),
        "nulls": nulls,
        "periods": rows(pd.read_csv(R5 / "period_replication.csv")),
        "bw_mult": rows(pd.read_csv(R5 / "robust_bandwidth.csv")),
        "bw_fixed": rows(pd.read_csv(R7 / "full_sample_bw.csv")),
        "sweep": rows(pd.read_csv(R5 / "jkv_puzzle_sweep.csv").drop(columns=["static_variance_share"])),
        "shares": rows(pd.read_csv(R5 / "jkv_1970s_shares.csv")),
        "misfit": {"dates": [d[:7] for d in mis.date], "rss": [r(v, 5) for v in mis.rss]},
        "null7080": null7080,
        "controls": rows(pd.read_csv(R5 / "jkv_puzzle_controls.csv")[["spec", "T", "Th_months", "J", "critical_99", "null_median", "p", "reject"]]),
        "scans": {f"{ds}_{d}": scan("jkv" if ds == "jkv" else "treasury_cmt", d) for ds in ("jkv", "treasury") for d in (3, 4, 5)},
        "grid": rows(pd.read_csv(R6 / "grid_configs.csv").fillna("")),
        "bw_breaks": rows(pd.read_csv(R7 / "bw_compare.csv")),
        "bw_audit": rows(pd.read_csv(R7 / "bandwidth_audit.csv")),
        "events": rows(ev),
        "sim_size_power": rows(simg),
        "bootstrap_versions": rows(diagg),
        "planted": rows(pd.read_csv(R7 / "sim_summary.csv")),
    }


def main():
    data = {"built": pd.Timestamp.now().strftime("%Y-%m-%d"), "datasets": datasets(), "macro": macro(),
            "history": history(), "results": results()}
    OUT.write_text("/* generated by build/build_data.py — do not edit */\nwindow.YC_DATA = " +
                   json.dumps(data, separators=(",", ":"), allow_nan=False, ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size / 1e3:.0f} kB)")
    for k, v in data["results"]["nulls"].items():
        print(f"  null {k}: J={v['J']} crit={v['crit']} p={v['p']} p_from_draws={v['p_from_draws']} q99(draws)={v['q99']}")
    for k, v in data["results"]["scans"].items():
        print(f"  scan {k}: {[s['break'] for s in v['segments']]}")


if __name__ == "__main__":
    main()
