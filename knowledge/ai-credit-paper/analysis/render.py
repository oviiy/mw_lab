"""Assemble the story into one self-contained ../index.html.

Inlines the fonts, stylesheet, d3, the Merton solver, the app and the data, and fills every
{{number}} in the prose from data/derived/story_data.json, so text and charts cannot disagree.
"""
import base64
import json
import re
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
D = json.loads((ROOT / "data" / "derived" / "story_data.json").read_text())

sc = {r["issuer_id"]: r for r in D["scenarios"]}
deals = pd.DataFrame(D["deals"])
dr, cr = D["deal_regressions"], D["curve_regression"]
IG4 = ["meta", "alphabet", "amazon", "oracle"]


def bp(x):
    return "under 1" if abs(x) < 1 else f"{x:,.0f}"


def sbp(x):
    return ("+" if x > 0 else "−" if x < 0 else "") + f"{abs(x):,.0f}"


def mon(s):
    return pd.Timestamp(s).strftime("%B %Y")


def day(s):
    return pd.Timestamp(s).strftime("%-d %B %Y")


N = {"version": D["meta"]["built"].replace("-", "."), "price_last": day(D["meta"]["price_last"]),
     "n_deals": int(deals.issuer_id.isin(IG4).sum()), "n_reg": dr["time"]["n"], "n_tranches": len(D["tranches"]),
     "borrowed": f"{D['cum_borrowed'][-1][1]:.0f}", "lease_pv_pct": f"{D['meta']['lease_pv'] * 100:.0f}"}
for i in IG4:
    d = deals[deals.issuer_id == i].sort_values("date")
    f5, l5 = d.dropna(subset=["s5_vs_rating"]).iloc[0], d.dropna(subset=["s5_vs_rating"]).iloc[-1]
    fl, ll = d.dropna(subset=["s30_vs_market"]).iloc[0], d.dropna(subset=["s30_vs_market"]).iloc[-1]
    fs, ls = d.dropna(subset=["excess_slope30"]).iloc[0], d.dropna(subset=["excess_slope30"]).iloc[-1]
    N |= {f"{i}_v0": sbp(f5.s5_vs_rating), f"{i}_v1": sbp(l5.s5_vs_rating), f"{i}_s0": f"{f5.s5:.0f}", f"{i}_s1": f"{l5.s5:.0f}",
          f"{i}_r0": f"{f5.rating_oas:.0f}", f"{i}_r1": f"{l5.rating_oas:.0f}", f"{i}_d0": mon(f5.date), f"{i}_d1": mon(l5.date),
          f"{i}_l0": sbp(fl.s30_vs_market), f"{i}_l1": sbp(ll.s30_vs_market), f"{i}_ld0": mon(fl.date), f"{i}_ld1": mon(ll.date),
          f"{i}_l0a": f"{abs(fl.s30_vs_market):.0f}", f"{i}_l1a": f"{abs(ll.s30_vs_market):.0f}",
          f"{i}_long0": f"{fl.s30:.0f}", f"{i}_long1": f"{ll.s30:.0f}", f"{i}_mlong0": f"{fl.mkt_long:.0f}", f"{i}_mlong1": f"{ll.mkt_long:.0f}",
          f"{i}_x0": f"{fs.excess_slope30:.0f}", f"{i}_x1": f"{ls.excess_slope30:.0f}",
          f"{i}_rt0": f"{f5.s5_ratio:.2f}", f"{i}_rt1": f"{l5.s5_ratio:.2f}",
          f"{i}_cum1": f"{l5.cum_before_bn:.0f}",
          f"{i}_v0a": f"{abs(f5.s5_vs_rating):.0f}", f"{i}_v1a": f"{abs(l5.s5_vs_rating):.0f}"}
meta5 = deals[deals.issuer_id == "meta"].sort_values("date").s5.round().astype(int).tolist()
N["meta_5s"] = ", ".join(map(str, meta5[:-1])) + " and " + str(meta5[-1])
ms = deals[deals.issuer_id.isin(IG4)].mkt_slope
N |= {"mslope_lo": f"{ms.min():.0f}", "mslope_hi": f"{ms.max():.0f}"}
N |= {"reg_time_r2": f"{dr['time']['r2']:.2f}", "reg_borrow": f"{dr['borrowed']['coef']['cum_100bn'][0]:.0f}",
      "reg_borrow_p": f"{dr['borrowed']['coef']['cum_100bn'][2]:.2f}", "reg_borrow_t": f"{dr['borrowed_time']['coef']['cum_100bn'][0]:.0f}",
      "reg_borrow_t_se": f"{dr['borrowed_time']['coef']['cum_100bn'][1]:.0f}", "reg_nvda": f"{dr['nvda']['coef']['nvda_rel'][0]:.1f}",
      "reg_nvda_p": f"{dr['nvda']['coef']['nvda_rel'][2]:.2f}", "reg_nvda_t": f"{dr['nvda_time']['coef']['nvda_rel'][0]:.1f}",
      "cr_before": f"{cr['per_doubling_before']:.0f}", "cr_change": f"{cr['per_doubling_change_2026']:.0f}", "cr_change_se": f"{cr['per_doubling_change_se']:.0f}",
      "cr_p": f"{cr['p_change']:.1f}", "cr_n": cr["n"]}
for i, r in sc.items():
    N[f"{i}_eq"] = bp(r["spr_now"])
    if r.get("value_added_share") is not None:
        N[f"{i}_va"] = f"{r['value_added_share'] * 100:.0f}"
        N[f"{i}_van"] = f"{r['value_added_net_share'] * 100:.0f}"
    for k in ["spr_mkt_debt_lgd60", "spr_mkt_all_lgd60", "spr_nov22_debt_lgd60", "spr_nov22_all_lgd60", "spr_nov22_all_lgd40", "spr_now_all_lgd60"]:
        if r.get(k) is not None:
            N[f"{i}_{k[4:]}"] = bp(r[k])
    N[f"{i}_lease_bn"] = f"{r['lease_face'] / 1e9:,.0f}"
    N[f"{i}_cush_now"] = f"{r['cushion_now']:.1f}"
    if r.get("cushion_mkt") is not None:
        N[f"{i}_cush_mkt"] = f"{r['cushion_mkt']:.1f}"
    N[f"{i}_E_bn"] = f"{r['E'] / 1e9:,.0f}"
N["meta_sub_bn"] = f"{next(c['subsequent_usd'] for c in D['commitments'] if c['issuer_id'] == 'meta') / 1e9:.0f}"
N["meta_E_pre_bn"] = f"{sc['meta']['E'] * sc['meta']['nov22_ratio'] / 1e9:,.0f}"
N["oracle_van_abs"] = f"{abs(sc['oracle']['value_added_net_share']) * 100:.0f}"
ix = D["index_now"]
N |= {f"idx_{k[:-4]}": v for k, v in ix.items()}
leases = sum(c["amount_usd"] for c in D["commitments"]) / 1e12
N["leases_tn"] = f"{leases:.2f}"
N["leases_x"] = f"{leases * 1000 / D['cum_borrowed'][-1][1]:.0f}"
ob = pd.DataFrame(D["equity"]["oracle"]["spr5"], columns=["d", "v"])
ob["d"] = pd.to_datetime(ob.d)
pk = ob.loc[ob.v.idxmax()]
N |= {"orc_eq_sep25": bp(ob[ob.d <= "2025-09-30"].v.iloc[-1]), "orc_eq_dec25": bp(ob[ob.d <= "2025-12-31"].v.iloc[-1]),
      "orc_eq_peak": bp(pk.v), "orc_eq_peak_m": mon(pk.d)}
beta = {i: tuple(v) for i, v in D["ai_beta_ends"].items()}
N |= {"orc_beta0": f"{beta['oracle'][0]:+.2f}", "orc_beta1": f"{beta['oracle'][1]:+.2f}", "cw_beta1": f"{beta['coreweave'][1]:.2f}",
      "nvda_x": f"{D['nvda_rel'][-1][1]:.1f}"}
cw = deals[deals.issuer_id == "coreweave"]
N |= {"cw_lo": f"{cw.s5.min():.0f}", "cw_hi": f"{cw.s5.max():.0f}", "cw_E_bn": f"{sc['coreweave']['E'] / 1e9:.0f}",
      "cw_debt_bn": f"{sc['coreweave']['debt'] / 1e9:.0f}", "cw_vol": f"{sc['coreweave']['sigE'] * 100:.0f}"}

# ---------------------------------------------------------------- assemble
tpl = (SITE / "template.html").read_text()


def fill(m):
    k = m.group(1)
    if k not in N:
        raise KeyError(f"template placeholder {{{{{k}}}}} has no value")
    return str(N[k])


tpl = re.sub(r"\{\{(\w+)\}\}", fill, tpl)
# Five faces keep the page under ~500 KB; weights 500 and 600 fall back to the nearest face.
faces = [("Spectral", 400, "normal", "spectral-latin-400-normal"), ("Spectral", "600 700", "normal", "spectral-latin-700-normal"),
         ("Spectral", 400, "italic", "spectral-latin-400-italic"),
         ("IBM Plex Sans Condensed", "400 500", "normal", "ibm-plex-sans-condensed-latin-400-normal"),
         ("IBM Plex Sans Condensed", "600 700", "normal", "ibm-plex-sans-condensed-latin-600-normal")]
# Only the d3 modules the app uses, in dependency order (UMD builds extend the global d3).
D3_MODULES = ["d3-array", "d3-color", "d3-dispatch", "d3-ease", "d3-format", "d3-interpolate", "d3-path", "d3-time",
              "d3-time-format", "d3-scale", "d3-selection", "d3-shape", "d3-timer", "d3-transition"]
fonts = "".join(
    f'@font-face{{font-family:"{f}";font-weight:{w};font-style:{s};font-display:swap;src:url(data:font/woff2;base64,'
    f'{base64.b64encode((SITE / "fonts" / (n + ".woff2")).read_bytes()).decode()}) format("woff2")}}' for f, w, s, n in faces)
html = (tpl.replace("/*__FONTS__*/", fonts)
        .replace("/*__CSS__*/", (SITE / "style.css").read_text())
        .replace("/*__D3__*/", "\n".join((SITE / "vendor" / "d3m" / f"{m}.min.js").read_text() for m in D3_MODULES))
        .replace("/*__MERTON__*/", (SITE / "merton.js").read_text())
        .replace("/*__DATA__*/", "window.STORY=" + json.dumps(D, separators=(",", ":")) + ";")
        .replace("/*__APP__*/", (SITE / "app.js").read_text()))
(ROOT / "index.html").write_text(html)
print("wrote", ROOT / "index.html", f"{len(html.encode()) / 1024:.0f} KB")
for k in sorted(N):
    print(f"  {k} = {N[k]}")
