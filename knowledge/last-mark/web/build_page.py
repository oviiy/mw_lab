"""Inject data/public/story.json into web/template.html -> web/index.html (one self-contained file).

    python web/build_page.py
"""
import csv, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "data", "public")
WEB = os.path.join(ROOT, "web")

SHORT = {
    "ARCC": "Ares Capital", "GBDC": "Golub Capital BDC", "PSEC": "Prospect Capital",
    "BXSL": "Blackstone Secured Lending", "OBDC": "Blue Owl Capital Corp", "MSDL": "Morgan Stanley Direct Lending",
    "BBDC": "Barings BDC", "MAIN": "Main Street Capital", "GAIN": "Gladstone Investment", "OFS": "OFS Capital",
    "CCAP": "Crescent Capital BDC", "FDUS": "Fidus Investment", "MFIC": "MidCap Financial", "PSBD": "Palmer Square BDC",
    "TCPC": "BlackRock TCP Capital", "TRIN": "Trinity Capital", "HTGC": "Hercules Capital", "KBDC": "Kayne Anderson BDC",
}

# Case files: borrower key -> the two lenders, the window to plot (later quarters are
# post-restructuring paper), and the outcome. Order = order in the gallery.
CASES = {
    "pluralsight": {"lenders": ["ARCC", "GBDC"], "until": {"ARCC": "2024Q1", "GBDC": "2024Q2"},
                    "name": "Pluralsight", "coupon": "13.56%", "q": "2023Q4",
                    "event": {"q": "2024Q3", "zh": "2024年8月 贷款方接管", "en": "Aug 2024: lenders take over"},
                    "zh": "在线教育软件。Ares 提前一年开始下调，Golub 一次跌到 50。",
                    "en": "Online learning software. Ares cut a year early; Golub dropped to 50 in one quarter."},
    "wellpath holdings": {"lenders": ["ARCC", "PSEC"], "until": {"ARCC": "2024Q2", "PSEC": "2024Q3"},
                          "name": "Wellpath", "coupon": "11.32%", "q": "2023Q4",
                          "event": {"q": "2024Q4", "zh": "2024年11月 破产", "en": "Nov 2024: Chapter 11"},
                          "zh": "监狱医疗服务商。同一笔一留置权贷款，一年多里两家始终相差 14–28 个点。",
                          "en": "Prison healthcare. Same first-lien loan, 14–28 points apart for more than a year."},
    "help systems holdings": {"lenders": ["PSBD", "PSEC"], "until": {},
                              "name": "Help/Systems (Fortra)", "coupon": "12.74%", "q": "2026Q2",
                              "zh": "网络安全软件。同一笔二留置权贷款，2026 年 6 月一家标 47.5，另一家标 82.6。",
                              "en": "Security software. Same second-lien loan: 47.5 at one lender, 82.6 at another in June 2026."},
    "wellful": {"lenders": ["OFS", "PSEC"], "until": {"OFS": "2024Q3"},
                "name": "Wellful", "coupon": "11.71%", "q": "2024Q2",
                "zh": "保健品零售。OFS 一个季度下调 23 个点，Prospect 晚了一个季度才跟上。",
                "en": "Supplements retail. OFS cut 23 points in one quarter; Prospect followed a quarter later."},
    "maverick acquisition": {"lenders": ["ARCC", "BXSL"], "until": {"ARCC": "2024Q3"},
                             "name": "Maverick", "coupon": "11.64%", "q": "2023Q3",
                             "zh": "反例：这一次 Blackstone 比 Ares 标得更低，两家都缓慢下调。",
                             "en": "The other way round: here Blackstone sat below Ares, and both glided down."},
    "triple lift": {"lenders": ["GBDC", "BXSL"], "until": {},
                    "name": "TripleLift", "coupon": "9.58%", "q": "2026Q2",
                    "zh": "广告科技，仍在进行中。2025 年底起两家逐渐拉开：最新 Blackstone 86，Golub 95。",
                    "en": "Ad tech, still live. The marks drifted apart from late 2025: Blackstone 86, Golub 95 at the latest."},
}


def qi(q):
    return int(q[:4]) * 4 + int(q[-1]) - 1


def main():
    d = json.load(open(os.path.join(PUB, "story.json")))
    cases = {}
    for b, c in CASES.items():
        fp = d["facility_paths"].get(b)
        if not fp:
            print("missing facility path", b)
            continue
        series = {}
        for t in c["lenders"]:
            cut = c["until"].get(t)
            series[t] = [[q, m] for q, m in fp.get(t, {}).items() if not cut or qi(q) <= qi(cut)]
        cases[b] = {k: v for k, v in c.items() if k != "until"}
        cases[b]["series"] = series
    lenders = {t: {"short": SHORT.get(t, v["name"]), "name": v["name"],
                   "filings": {q: f["url"] for q, f in v["filings"].items()}} for t, v in d["lenders"].items()}
    pairs = sorted(d["pairs"], key=lambda p: -p["gap"])
    data = {
        "metrics": d["metrics"], "quarters": d["quarters"], "coverage": d["coverage"], "lenders": lenders,
        "path_stats": d["path_stats"],
        "events": [[e["lender"], e["name"], e["q"], e["path"], e["par"]] for e in d["events"]],
        "transitions": d["transitions"], "disagreement": d["disagreement"],
        "pairs": [[p["name"], p["q"], p["rate"], p["marks"], p["gap"], p["median"]] for p in pairs],
        "pik": d["pik"], "cases": cases, "case_order": list(CASES),
        "lender_rel": d["lender_rel"], "lender_table": d["lender_table"],
        "robust": {k: v for k, v in d["robust"].items() if k not in ("jump_cases",)},
    }
    tpl = open(os.path.join(WEB, "template.html")).read()
    html = tpl.replace("/*__DATA__*/null", json.dumps(data, separators=(",", ":"), ensure_ascii=False))
    open(os.path.join(WEB, "index.html"), "w").write(html)

    os.makedirs(os.path.join(WEB, "data"), exist_ok=True)
    with open(os.path.join(WEB, "data", "same_loan_pairs.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["borrower", "quarter", "coupon", "lender", "mark", "gap_points", "median_mark"])
        for p in pairs:
            for t, m in sorted(p["marks"].items()):
                w.writerow([p["name"], p["q"], p["rate"], t, m, round(p["gap"] * 100, 2), p["median"]])
    for name in ("marks.csv", "validation.json"):
        src = os.path.join(PUB, name)
        open(os.path.join(WEB, "data", name), "wb").write(open(src, "rb").read())
    print("wrote web/index.html", round(len(html) / 1024), "KB")


if __name__ == "__main__":
    main()
