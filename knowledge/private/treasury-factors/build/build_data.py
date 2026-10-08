"""Build data.js for the Treasury factor dashboard from the thesis repository.

Usage:  python3 build/build_data.py [/path/to/time-varying-treasury-factors-main]

Every series in the main panel comes from exactly one published source over
its whole history. Nothing is interpolated and nothing is spliced:

  3M, 6M          H.15 Treasury bill secondary-market rate (discount basis),
                  converted to bond-equivalent yield with a closed-form formula
                  applied identically on every date (1970 -> now).
  1M ... 30Y      H.15 Treasury constant-maturity (CMT) yields, shown only in
                  months the series was published; gaps stay blank.

Month-end observation = last business-day value in the calendar month.
The zero-coupon panels used by the thesis (JKV 1970-2009, GSW+FRED 2006-2026)
are passed through unchanged as separate datasets.
"""
import json
import re
import sys
import zipfile
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data.js"
THESIS = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
    "/Users/michael.wang/MW/Personal/thesis/time-varying-treasury-factors-main")

START, END = "1970-01-01", "2026-08-31"  # last complete month in the H.15 snapshot
BILL_DAYS = {"m3": 91, "m6": 182}


def r(x, nd=3):
    return None if x is None or not np.isfinite(x) else round(float(x), nd)


def h15_series(xml, name):
    block = re.search(r'<kf:Series[^>]*SERIES_NAME="%s"[^>]*>(.*?)</kf:Series>' % re.escape(name), xml, re.S)
    rows = re.findall(r'<frb:Obs[^>]*?/>', block.group(1))
    out = {}
    for row in rows:
        v = re.search(r'OBS_VALUE="([^"]+)"', row).group(1)
        d = re.search(r'TIME_PERIOD="([^"]+)"', row).group(1)
        v = float(v)
        if v > -9000:
            out[pd.Timestamp(d)] = v
    return pd.Series(out).sort_index()


def bond_equivalent(discount_pct, days):
    """Discount-basis bill rate -> bond-equivalent (investment) yield, bills <= 182 days."""
    d = discount_pct / 100
    return 100 * 365 * d / (360 - d * days)


def month_end(s):
    s = s.dropna()
    return s.groupby(s.index.to_period("M")).last()


def build_treasury():
    with zipfile.ZipFile(THESIS / "data/raw/h15_cmt/H15_ddp_all_20260925.zip") as z:
        xml = z.read("H15_data.xml").decode("utf-8")
    cmt = pd.read_csv(THESIS / "data/raw/h15_cmt/h15_cmt_daily_1962_2026.csv", index_col=0, parse_dates=True)
    daily = {}
    for col, code in (("m3", "RIFSGFSM03_N.B"), ("m6", "RIFSGFSM06_N.B")):
        daily[col] = bond_equivalent(h15_series(xml, code), BILL_DAYS[col])
    for col in ("m1", "m12", "m24", "m36", "m60", "m84", "m120", "m240", "m360"):
        daily[col] = cmt[col]
    # Treasury suspended the 30Y CMT 2002-02-18 -> 2006-02-08; H.15 carries an
    # extrapolated value there. The official Treasury file is blank, so are we.
    s30 = daily["m360"].copy()
    s30[(s30.index >= "2002-02-18") & (s30.index < "2006-02-09")] = np.nan
    daily["m360"] = s30

    cols = ["m1", "m3", "m6", "m12", "m24", "m36", "m60", "m84", "m120", "m240", "m360"]
    periods = pd.period_range(START, END, freq="M")
    panel = pd.DataFrame({c: month_end(daily[c][START:END]) for c in cols}).reindex(periods)
    # month-end date label = last business day actually observed in that month
    any_obs = pd.concat([daily[c][START:END] for c in cols], axis=1).dropna(how="all")
    last_day = any_obs.groupby(any_obs.index.to_period("M")).apply(lambda g: g.index.max())
    dates = [last_day[p].strftime("%Y-%m-%d") for p in periods]

    # T-bill (BEY) vs 3M/6M CMT on the overlap: documentation only, never used to splice.
    splice = {}
    for col in ("m3", "m6"):
        j = pd.concat([daily[col].rename("bill"), cmt[col].rename("cmt")], axis=1).dropna()
        diff = (j.bill - j.cmt) * 100
        mdiff = diff.groupby(diff.index.to_period("M")).mean()
        splice[col] = {
            "overlap_start": j.index[0].strftime("%Y-%m-%d"), "n_days": int(len(diff)),
            "mean_bp": r(diff.mean(), 2), "sd_bp": r(diff.std(), 2),
            "p95_abs_bp": r(diff.abs().quantile(.95), 2),
            "corr_levels": r(np.corrcoef(j.bill, j.cmt)[0, 1], 5),
            "monthly_dates": [str(p) for p in mdiff.index], "monthly_bp": [r(v, 1) for v in mdiff],
        }

    coverage = {}
    for c in cols:
        s = panel[c]
        runs, on, start = [], False, None
        for p, v in s.items():
            if np.isfinite(v) and not on:
                on, start = True, p
            elif not np.isfinite(v) and on:
                runs.append([str(start), str(p - 1)]); on = False
        if on:
            runs.append([str(start), str(s.index[-1])])
        coverage[c] = runs

    return {
        "id": "treasury", "label": "Treasury observed (1970–2026)",
        "short": "Treasury observed", "kind": "par",
        "maturities": [1, 3, 6, 12, 24, 36, 60, 84, 120, 240, 360],
        "dates": dates,
        "yields": [[r(v, 3) for v in row] for row in panel[cols].to_numpy()],
        "core": [1, 2, 3, 5, 6, 7, 8],  # 3M,6M,1Y,3Y,5Y,7Y,10Y: balanced Jan-1970 -> now
        "source": {c: ("H.15 T-bill secondary market, discount → bond-equivalent" if c in BILL_DAYS
                       else "H.15 / Treasury constant-maturity (CMT)") for c in cols},
        "coverage": coverage, "splice_diagnostics": splice,
    }


def build_zero(path, ident, label, short, date_fmt=None, note=""):
    df = pd.read_csv(path)
    d = df.columns[0]
    dates = pd.to_datetime(df[d].astype(str), format=date_fmt)
    mats = [int(str(c).lstrip("m")) for c in df.columns[1:]]
    return {
        "id": ident, "label": label, "short": short, "kind": "zero", "maturities": mats,
        "dates": [x.strftime("%Y-%m-%d") for x in dates],
        "yields": [[r(v, 8) for v in row] for row in df.iloc[:, 1:].to_numpy()],
        "core": list(range(len(mats))), "note": note,
    }


def build_macro():
    def fred(name):
        s = pd.read_csv(THESIS / f"data/raw/fred_{name}.csv", index_col=0, parse_dates=True).iloc[:, 0]
        return s
    cpi = fred("CPIAUCSL")
    cpi_yoy = (cpi / cpi.shift(12) - 1) * 100
    ff, ur = fred("FEDFUNDS"), fred("UNRATE")
    idx = pd.period_range(START, END, freq="M")
    pick = lambda s: [r(v, 2) for v in s.groupby(s.index.to_period("M")).last().reindex(idx)]
    return {"months": [str(p) for p in idx], "fedfunds": pick(ff), "cpi_yoy": pick(cpi_yoy), "unrate": pick(ur)}


def histogram(draws, obs, bins=90):
    lo, hi = float(np.quantile(draws, .0005)), float(np.quantile(draws, .9995))
    counts, edges = np.histogram(np.clip(draws, lo, hi), bins=bins, range=(lo, hi))
    return {"edges": [r(e, 4) for e in edges], "counts": counts.tolist(),
            "q": {str(q): r(np.quantile(draws, q), 4) for q in (.5, .9, .95, .99)},
            "min": r(draws.min(), 4), "max": r(draws.max(), 4), "n": int(draws.size)}


def build_thesis():
    res = json.loads((THESIS / "results/monthly_results.json").read_text())
    tests = []
    for t in res["tests"]:
        draws = np.load(THESIS / f"results/bootstrap_J_R{t['R']}.npy")
        tests.append({k: t[k] for k in ("R", "J", "M", "bias", "variance", "B", "exceedances",
                                         "bootstrap_p_add_one", "critical_90", "critical_95", "critical_99",
                                         "reject_1pct", "static_residual_mse", "local_residual_mse")}
                     | {"hist": histogram(draws, t["J"])})

    def segs(path, keep_traj=True):
        d = json.loads((THESIS / path).read_text())
        out = []
        for s in d["segments"]:
            traj = [{"end_date": p.get("end_date"), "J": r(p["J"], 3), "crit": r(p["critical_99"], 3),
                     "p": r(p.get("p"), 5), "reject": bool(p["reject"]), "stage": p.get("stage")}
                    for p in s.get("trajectory", [])] if keep_traj else []
            out.append({"start": s["start_date"], "break": s["break_date"], "p": s.get("break_p"),
                        "rejected_at_min_window": s.get("rejected_at_min_window"),
                        "retreated": s.get("retreated", False), "trajectory": traj})
        spec = {k: v for k, v in d["spec"].items()}
        return {"spec": spec, "segments": out}

    jkv = segs("wk6/results/multibreak_jkv_d3_mw60_restart24.json")
    par = json.loads((THESIS / "followup/results/todo3_treasury_breakdates.json").read_text())
    par_out = {"spec": par["spec"], "ranks": {}}
    for rank, v in par["results"].items():
        par_out["ranks"][rank] = {
            "windows_tested": v["windows_tested"],
            "breaks": [{"date": b["break_date"], "J": r(b["screen_J"], 3), "crit": r(b["screen_critical_99"], 3),
                        "confirm": [{"date": c["date"], "wlen": c["wlen"], "J": r(c["J"], 3),
                                     "crit": r(c["critical_99"], 3),
                                     "p": r(c.get("bootstrap_p_add_one", c.get("p")), 5)} for c in b["confirm_windows"]]}
                       for b in v["breaks"]],
            "trajectory": [{"date": p["date"], "wlen": p["wlen"], "J": r(p["J"], 3), "crit": r(p["critical_99"], 3),
                            "reject": bool(p["reject_1pct"])} for p in v.get("trajectory", [])],
        }
    return {"sample": res["sample"], "tests": tests, "method": res["method"],
            "qualification": res["qualification"],
            "fixed_approx": res.get("fixed_approximation_of_local_three_factor_common"),
            "breaks": {"jkv": jkv, "treasury_par_2006": par_out}}


def main():
    data = {
        "built": pd.Timestamp.now().strftime("%Y-%m-%d"),
        "datasets": [
            build_treasury(),
            build_zero(THESIS / "data/derived/monthly_yields_2006_2026.csv", "gsw",
                       "Thesis panel (GSW + FRED zeros, 2006–2026)", "Thesis panel", None,
                       "3M/6M FRED CMT; 9M = midpoint of 6M and GSW 12M (supervisor's construction); 12M+ evaluated from GSW Svensson parameters."),
        ],
        "thesis": build_thesis(),
    }
    js = "/* generated by build/build_data.py — do not edit */\nwindow.YC_DATA = " + json.dumps(data, separators=(",", ":"), allow_nan=False) + ";\n"
    OUT.write_text(js, encoding="utf-8")
    t = data["datasets"][0]
    print(f"wrote {OUT} ({OUT.stat().st_size/1e3:.0f} kB); treasury {t['dates'][0]} -> {t['dates'][-1]}, T={len(t['dates'])}")
    core = np.array([[row[i] for i in t["core"]] for row in t["yields"]], dtype=float)
    print("treasury core NaNs:", int(np.isnan(core).sum()))
    for k, v in t["splice_diagnostics"].items():
        print(k, {kk: vv for kk, vv in v.items() if not kk.startswith("monthly")})


if __name__ == "__main__":
    main()
