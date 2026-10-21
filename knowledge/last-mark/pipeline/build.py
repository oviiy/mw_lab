"""Turn data/raw/<TICKER>/<period>.json into the published dataset.

    python pipeline/build.py

Steps
  1. validate: every lender-quarter's line items must add up to the portfolio
     total the company itself reports (dimensionless InvestmentOwnedAtFairValue,
     from the SEC companyconcept API) within TOL. Quarters that fail are dropped
     and listed in data/public/validation.json.
  2. par loans: keep debt lines whose cost is 90-105% of principal. That drops
     unfunded commitments (principal includes undrawn amounts, cost does not),
     loans bought at a discount and loans already restructured.
  3. borrower marks: for each lender, borrower and quarter,
     mark = sum(fair value) / sum(principal) over that lender's par loans.
  4. same loan across lenders: same borrower, same quarter, all-in interest
     rate within RATE_TOL, coupon at most MAX_RATE, not first vs second lien,
     and confirmed by the same match in an adjacent quarter -> one facility.
  5. events (first quarter below DISTRESS), one-year transitions by mark bucket,
     cross-lender disagreement, PIK share -> data/public/story.json + marks.csv
"""
import glob, html, json, os, re, statistics, time, urllib.request
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")
PUB = os.path.join(ROOT, "data", "public")
CACHE = os.path.join(ROOT, "data", "cache")
UA = os.environ.get("SEC_USER_AGENT", "MW Lab research mwlab-research@example.com")

TOL = 0.03            # line items must sum to the reported total within 3%
MIN_PAR = 1e6         # ignore exposures under $1M principal
DISTRESS = 0.60       # "distressed": borrower marked below 60c
NEAR_PAR = 0.90       # "near par": marked at or above 90c
LOOKBACK = 4          # quarters
RATE_TOL = 0.0015     # 15bp: same borrower + same coupon = same facility
GALLERY = ["pluralsight", "wellpath holdings", "help systems holdings", "wellful", "redstone holdco",
           "maverick acquisition", "triple lift"]
MAX_RATE = 0.15       # above this, coupons are mostly default rates shared by every tranche
COST_BAND = (0.90, 1.05)
BUCKETS = [(0.97, 9), (0.93, 0.97), (0.90, 0.93), (0.85, 0.90), (0.80, 0.85), (0.70, 0.80), (0.60, 0.70)]

# ---------------------------------------------------------------- names
SUFFIX = r"\b(incorporated|inc|llc|l l c|lp|l p|llp|corp|corporation|co|company|ltd|limited|plc|sarl|s a r l|s a|gmbh|bv|b v|ag|ulc|lllp)\b"
INSTRUMENT = re.compile(
    r",\s*(?=(first|second|1st|2nd|senior|junior|subordinated|unitranche|one stop|term loan|revolv|delayed|"
    r"class|series|common|preferred|warrant|units?\b|membership|partnership|limited partnership|lp interest|"
    r"llc interest|equity|notes?\b|loan|ordinary|shares|stock|interest|investment|revolving|structured|"
    r"secured|unsecured|super|last out|first out|priority|tranche|incremental))", re.I)


LEGAL = re.compile(r"^(.+?\b(?:Inc|LLC|L\.L\.C|L\.P|LP|LLP|Corp|Corporation|Ltd|Limited|plc|S\.?\s?[aà]\.?\s?r\.?\s?l|GmbH|B\.V|N\.V|ULC|LLLP|Co)\b\.?)(?=,|\s*$|\s*\(|\s+and\b|\s*\|)")


def issuer_of(identifier):
    s = html.unescape(identifier).strip()
    if "|" in s:
        return s.split("|")[0].strip()
    m = LEGAL.match(s)          # "MRI Software LLC, Application Software, First Lien Term Loan 1"
    if m:
        return m.group(1).strip()
    m = INSTRUMENT.search(s)
    return s[: m.start()].strip() if m else s


def norm(name):
    s = html.unescape(name)
    m = LEGAL.match(s)                            # first legal entity of a co-borrower list
    if m:
        s = m.group(1)
    s = s.lower()
    s = re.sub(r"\(.*?\)", " ", s)               # (dba ...), (fka ...)
    s = re.split(r"\s+and\s+(?=[a-z0-9])", s)[0]  # "A, LLC and B, Inc." -> A
    s = s.replace("&", " and ")
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(SUFFIX, " ", s)
    s = re.sub(r"\b\d+\s*$", " ", s)              # trailing position counter
    return re.sub(r"\s+", " ", s).strip()


def clean_rows(rows):
    """Drop rows that would double count:
    - issuer-level subtotals: an id that is a prefix of another id ("Acme, LLC" vs "Acme, LLC | First lien")
    - the same position listed twice (e.g. in the main schedule and the affiliate schedule) under
      slightly different ids: same normalized issuer and identical fair value and cost."""
    # schedule-of-investments lines carry both fair value and cost; rows with fair value
    # only come from roll-forward or affiliate tables that repeat the same positions
    rows = [r for r in rows if "fv" in r and "cost" in r and not is_subtotal(r["id"])]
    key = lambda r: re.sub(r"\s+", " ", html.unescape(r["id"])).strip().lower()
    keys = {key(r) for r in rows}
    out, seen = [], set()
    for r in rows:
        k = key(r)
        if any(o != k and (o.startswith(k + " |") or o.startswith(k + ",")) for o in keys):
            continue
        sig = (norm(issuer_of(r["id"])), r.get("fv"), r.get("cost"))
        if r.get("fv") and sig in seen:
            continue
        seen.add(sig)
        out.append(r)
    return out


def is_subtotal(identifier):
    return bool(re.search(r"(^|[,|]\s*)total\b|\btotal investments\b", identifier, re.I))


# ---------------------------------------------------------------- reported totals
def get(url):
    time.sleep(0.15)
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read()


def reported_totals(cik):
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, f"total_{cik}.json")
    if not os.path.exists(p):
        try:
            body = get(f"https://data.sec.gov/api/xbrl/companyconcept/CIK{cik:010d}/us-gaap/InvestmentOwnedAtFairValue.json")
        except Exception:  # noqa: BLE001 - concept missing for this filer
            body = b"{}"
        open(p, "wb").write(body)
    d = json.load(open(p))
    out = {}
    for f in d.get("units", {}).get("USD", []):
        if f.get("form") in ("10-Q", "10-K") and "end" in f and "start" not in f:
            out[(f["end"], f["accn"])] = f["val"]
    return out


# ---------------------------------------------------------------- load
def quarter(period):
    y, m = int(period[:4]), int(period[5:7])
    return f"{y}Q{(m - 1) // 3 + 1}"


def qindex(q):
    return int(q[:4]) * 4 + int(q[-1]) - 1


def load():
    filings, validation = [], []
    for t in sorted(os.listdir(RAW)):
        files = sorted(glob.glob(os.path.join(RAW, t, "*.json")))
        if not files:
            continue
        totals = None
        for f in files:
            d = json.load(open(f))
            meta, rows = d["meta"], clean_rows(d["rows"])
            if totals is None:
                totals = reported_totals(meta["cik"])
            fv_sum = sum(r.get("fv", 0) for r in rows)
            rep = totals.get((meta["period"], meta["accession"]))
            ok = bool(rep) and abs(fv_sum / rep - 1) <= TOL and len(rows) >= 20
            validation.append({"ticker": t, "period": meta["period"], "rows": len(rows),
                               "line_item_sum": round(fv_sum), "reported_total": rep,
                               "diff": None if not rep else round(fv_sum / rep - 1, 4), "passed": ok})
            if ok:
                meta["q"] = quarter(meta["period"])
                filings.append((meta, rows))
    return filings, validation


# ---------------------------------------------------------------- build
def par_loan(r):
    fv, par, cost = r.get("fv"), r.get("par"), r.get("cost")
    if fv is None or not par or par <= 0 or cost is None:
        return False
    # fv/par above 1.05 is almost always a currency mismatch (principal tagged in EUR/GBP,
    # fair value in USD) rather than a loan priced above par
    return COST_BAND[0] <= cost / par <= COST_BAND[1] and -0.05 <= fv / par <= 1.05


def rate_of(r):
    x = r.get("rate")
    if x is None or x <= 0:
        return None
    return x / 100 if x > 1 else x          # some filers tag 12.13, most 0.1213


def lien(identifier):
    s = identifier.lower()
    if re.search(r"second lien|2nd lien|second-lien|junior|subordinat|mezz", s):
        return "2L"
    if re.search(r"(second|third|last)[ -]out", s):
        return "1L-last-out"                    # split first lien: not the same claim as a plain first lien
    if re.search(r"first lien|1st lien|first-lien|unitranche|one stop|senior secured", s):
        return "1L"
    return None


def bucket(m):
    for lo, hi in BUCKETS:
        if lo <= m < hi:
            return f"{lo:.2f}"
    return None


def borrower_resolver(filings):
    """Some filers tag the whole table row as the identifier ("Investments United States Debt
    Investments Software Acme Holdings Investment Type First lien ..."), so no clean issuer can be
    cut out of it. For those, look up the longest borrower name known from cleanly tagged filers
    that appears in the row text on word boundaries."""
    known = set()
    for _, rows in filings:
        for r in rows:
            b = norm(issuer_of(r["id"]))
            if b and len(b.split()) <= 5:
                known.add(b)
    by_first = defaultdict(list)
    for b in known:
        toks = b.split()
        if len(b) >= 6 and toks[0] not in ("investments", "debt", "first", "senior", "the"):
            by_first[toks[0]].append(toks)
    for v in by_first.values():
        v.sort(key=len, reverse=True)
    cache = {}

    def resolve(b, identifier):
        if not b or len(b.split()) <= 6:
            return b
        if identifier in cache:
            return cache[identifier]
        toks = norm_text(identifier).split()
        best = None
        for i, tk in enumerate(toks):
            for cand in by_first.get(tk, ()):
                if toks[i:i + len(cand)] == cand and (best is None or len(cand) > len(best)):
                    best = cand
                    break
        cache[identifier] = " ".join(best) if best else b
        return cache[identifier]
    return resolve


def norm_text(s):
    s = html.unescape(s).lower().replace("&", " and ")
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(SUFFIX, " ", s)
    return re.sub(r"\s+", " ", s).strip()


def main():
    os.makedirs(PUB, exist_ok=True)
    filings, validation = load()
    json.dump(validation, open(os.path.join(PUB, "validation.json"), "w"), indent=1)
    passed = sum(v["passed"] for v in validation)
    print(f"validation: {passed}/{len(validation)} lender-quarters passed")

    lenders = {}
    covered = defaultdict(set)                     # lender -> validated quarters
    present = defaultdict(set)                     # (lender, q) -> borrowers with any line
    agg = defaultdict(lambda: defaultdict(lambda: {"fv": 0.0, "par": 0.0, "cost": 0.0, "pik_par": 0.0}))
    lines = defaultdict(list)                      # (borrower, q) -> [(lender, rate, fv, par, id)]
    display = defaultdict(lambda: defaultdict(int))
    pik_q = defaultdict(lambda: {"par": 0.0, "pik_par": 0.0})
    resolve = borrower_resolver(filings)
    agg_all = defaultdict(lambda: defaultdict(lambda: {"fv": 0.0, "par": 0.0}))   # every term-debt line
    equity = defaultdict(set)
    for meta, rows in filings:
        t, q = meta["ticker"], meta["q"]
        lenders.setdefault(t, {"ticker": t, "name": meta["name"], "cik": meta["cik"], "filings": {}})
        lenders[t]["filings"][q] = {"period": meta["period"], "form": meta["form"], "url": meta["url"]}
        covered[t].add(q)
        for r in rows:
            iss = issuer_of(r["id"])
            b = resolve(norm(iss), r["id"])
            if not b:
                continue
            present[(t, q)].add(b)
            fv_, par_ = r.get("fv"), r.get("par")
            if par_ and par_ > 0 and fv_ is not None and -0.05 <= fv_ / par_ <= 1.05 \
                    and not re.search(r"revolv|delayed draw|ddtl", r["id"], re.I):
                d_ = agg_all[(t, b)][q]
                d_["fv"] += fv_; d_["par"] += par_
            elif (not par_) and (fv_ or 0) > 0 and (r.get("cost") or 0) > 0:
                equity[(t, q)].add(b)               # shares, units or other non-debt claims
            if not par_loan(r):
                continue
            display[b][iss] += 1
            a = agg[(t, b)][q]
            a["fv"] += r["fv"]; a["par"] += r["par"]; a["cost"] += r["cost"]
            pik_q[(t, q)]["par"] += r["par"]
            if r.get("pik"):
                a["pik_par"] += r["par"]
                pik_q[(t, q)]["pik_par"] += r["par"]
            rt = rate_of(r)
            # revolvers and delayed-draw lines are excluded from matching: undrawn amounts and fees make
            # their marks not comparable to term loans
            if rt and r["par"] >= MIN_PAR and not re.search(r"revolv|delayed draw|ddtl", r["id"], re.I):
                lines[(b, q)].append((t, rt, r["fv"], r["par"], html.unescape(r["id"]).strip()))

    names = {b: max(v.items(), key=lambda kv: kv[1])[0] for b, v in display.items()}
    quarters = sorted({q for s in agg.values() for q in s}, key=qindex)
    qi = {q: qindex(q) for q in quarters}
    by_index = {qindex(q): q for q in quarters}

    series = {}
    for (t, b), byq in agg.items():
        pts = {q: v for q, v in byq.items() if v["par"] >= MIN_PAR}
        if pts:
            series[(t, b)] = {q: round(v["fv"] / v["par"], 4) for q, v in pts.items()}

    # all-debt series: every term-debt line, including restructured or rebooked paper. Used for the
    # event study and the transitions so that loans written down or exchanged do not drop out.
    series_all = {}
    for (t, b), byq in agg_all.items():
        pts = {q: v for q, v in byq.items() if v["par"] >= MIN_PAR}
        if pts:
            series_all[(t, b)] = {q: round(v["fv"] / v["par"], 4) for q, v in pts.items()}

    def new_equity(t, b, q, q_later):
        """The lender holds equity in the borrower at q_later that it did not hold at q:
        the usual footprint of a debt-for-equity restructuring."""
        return b in equity[(t, q_later)] and b not in equity[(t, q)]

    # ---- 1. distress events and the path into them
    events = []
    for (t, b), s in series_all.items():
        qs = sorted(s, key=qindex)
        for i, q in enumerate(qs):
            if s[q] >= DISTRESS:
                continue
            prev = by_index.get(qindex(q) - 1)
            if prev is None or prev not in s or s[prev] < DISTRESS:
                break                               # need an observed non-distressed prior quarter
            path = []
            for k in range(LOOKBACK, -1, -1):
                qq = by_index.get(qindex(q) - k)
                path.append(s.get(qq) if qq else None)
            v = agg_all[(t, b)][q]
            events.append({"lender": t, "borrower": b, "name": names.get(b, b), "q": q, "path": path,
                           "par": round(v["par"]), "fv": round(v["fv"]),
                           "pik_before": any(agg[(t, b)][by_index[qindex(q) - k]]["pik_par"] > 0
                                             for k in (1, 2) if by_index.get(qindex(q) - k) in s and (t, b) in agg)})
            break

    def at(k):  # path index for quarter t+k, k in -LOOKBACK..0
        return LOOKBACK + k
    path_stats = []
    full = [e for e in events if e["path"][0] is not None]      # same set of loans at every k
    for k in range(-LOOKBACK, 1):
        v = sorted(e["path"][at(k)] for e in full if e["path"][at(k)] is not None)
        if v:
            path_stats.append({"k": k, "n": len(v), "median": round(statistics.median(v), 4),
                               "p25": round(v[int(0.25 * (len(v) - 1))], 4), "p75": round(v[int(0.75 * (len(v) - 1))], 4),
                               "share_ge90": round(sum(x >= NEAR_PAR for x in v) / len(v), 4),
                               "share_ge80": round(sum(x >= 0.80 for x in v) / len(v), 4)})

    # ---- 2. one year later: what a mark turned into
    trans = defaultdict(lambda: defaultdict(float))  # bucket -> outcome -> principal
    trans_n = defaultdict(lambda: defaultdict(int))
    pik_trans = defaultdict(lambda: defaultdict(int))  # (bucket, pik) -> outcome -> count
    def outcome(t, b, q, q4):
        s_ = series_all.get((t, b), {})
        par0, par4 = agg_all[(t, b)][q]["par"] if q in s_ else 0, agg_all[(t, b)][q4]["par"] if q4 in s_ else 0
        if new_equity(t, b, q, q4) and (q4 not in s_ or par4 < 0.75 * par0 or s_[q4] < NEAR_PAR):
            return "other"                          # debt-for-equity: equity appears while the debt shrinks or is impaired
        if q4 in s_:
            m4 = s_[q4]
            return "par" if m4 >= NEAR_PAR else ("mid" if m4 >= DISTRESS else "distress")
        # debt gone: repaid, sold or written off. A co-investment equity stake the lender already held
        # can remain on the schedule; that is not a restructuring.
        return "gone"

    for (t, b), s in series_all.items():
        for q, m in s.items():
            bk = bucket(m)
            if bk is None:
                continue
            q4 = by_index.get(qindex(q) + 4)
            if q4 is None or q4 not in covered[t]:
                continue                            # the lender's filing a year later did not validate
            out = outcome(t, b, q, q4)
            trans[bk][out] += agg_all[(t, b)][q]["par"]
            trans_n[bk][out] += 1
            pik_trans[(bk, (t, b) in agg and agg[(t, b)][q]["pik_par"] > 0)][out] += 1
    transitions = []
    for lo, hi in BUCKETS:
        bk = f"{lo:.2f}"
        n = trans_n[bk]
        tot = sum(n.values())
        if not tot:
            continue
        row = {"bucket": bk, "lo": lo, "hi": min(hi, 1.5), "n": tot,
               "share": {o: round(n[o] / tot, 4) for o in ("par", "mid", "distress", "other", "gone")}}
        for flag in (False, True):
            pn = pik_trans[(bk, flag)]
            pt = sum(pn.values())
            row["pik" if flag else "cash"] = {"n": pt, "distress_or_other": round((pn["distress"] + pn["other"]) / pt, 4) if pt else None}
        transitions.append(row)

    # ---- 3. the same loan at different lenders
    # pass 1: clusters of lines with the same borrower, quarter and coupon
    raw_clusters = []
    for (b, q), ls in lines.items():
        ls.sort(key=lambda x: x[1])
        clusters, cur = [], [ls[0]]
        for x in ls[1:]:
            if x[1] - cur[0][1] <= RATE_TOL:
                cur.append(x)
            else:
                clusters.append(cur); cur = [x]
        clusters.append(cur)
        for c in clusters:
            per = defaultdict(lambda: [0.0, 0.0, []])
            for t, rt, fv, par, ident in c:
                per[t][0] += fv; per[t][1] += par; per[t][2].append(ident)
            if len(per) < 2:
                continue
            rate = statistics.median(x[1] for x in c)
            if rate > MAX_RATE:
                continue                            # default-rate / restructured paper: tranches share pricing
            liens = {t: lien(v[2][0]) for t, v in per.items()}
            if len({x for x in liens.values() if x}) > 1 or (any(x in ("2L", "1L-last-out") for x in liens.values()) and None in liens.values()):
                continue                            # first lien vs second lien is not the same loan
            raw_clusters.append((b, q, rate, dict(per)))
    # pass 2: keep a lender in a match only if it also matches the same partner in an adjacent
    # quarter. Floating coupons reset with SOFR, so two lines that move together are one facility;
    # a one-quarter coincidence of coupons is not enough.
    seen_pair = {(b, qindex(q), t, u) for b, q, _, per in raw_clusters for t in per for u in per if t != u}
    pairs = []
    for b, q, rate, per in raw_clusters:
        k = qindex(q)
        per = {t: v for t, v in per.items()
               if any((b, k + d, t, u) in seen_pair for u in per if u != t for d in (-1, 1))}
        if len(per) < 2:
            continue
        marks = {t: round(v[0] / v[1], 4) for t, v in per.items()}
        vals = sorted(marks.values())
        pairs.append({"borrower": b, "name": names.get(b, b), "q": q,
                      "rate": round(rate, 4),
                      "marks": marks, "par": {t: round(v[1]) for t, v in per.items()},
                      "ids": {t: v[2][0] for t, v in per.items()},
                      "median": round(statistics.median(vals), 4), "gap": round(vals[-1] - vals[0], 4)})
    # disagreement by how stressed the loan is
    bands = [(0.97, 9, "97+"), (0.93, 0.97, "93–97"), (0.85, 0.93, "85–93"), (0, 0.85, "below 85")]
    disagreement = []
    for lo, hi, label in bands:
        g = sorted(p["gap"] for p in pairs if lo <= p["median"] < hi)
        if g:
            disagreement.append({"band": label, "lo": lo, "n": len(g), "median_gap": round(statistics.median(g), 4),
                                 "p90_gap": round(g[int(0.9 * (len(g) - 1))], 4),
                                 "share_gap_ge5": round(sum(x >= 0.05 for x in g) / len(g), 4),
                                 "share_gap_ge10": round(sum(x >= 0.10 for x in g) / len(g), 4)})
    # the widest disagreements, one per borrower
    seen, widest = set(), []
    for p in sorted(pairs, key=lambda p: -p["gap"]):
        if p["borrower"] in seen:
            continue
        seen.add(p["borrower"])
        widest.append(p)
        if len(widest) == 40:
            break
    # timelines of the same facility at each lender, for the widest cases
    facility_paths = {}
    for p in widest[:12]:
        b, rate = p["borrower"], p["rate"]
        pathd = defaultdict(dict)
        for (bb, q), ls in lines.items():
            if bb != b:
                continue
            for t, rt, fv, par, _ in ls:
                if abs(rt - rate) <= 0.01:          # same facility over time (coupons float with SOFR)
                    v = pathd[t].setdefault(q, [0.0, 0.0])
                    v[0] += fv; v[1] += par
        facility_paths[b] = {t: {q: round(v[0] / v[1], 4) for q, v in sorted(qs.items(), key=lambda kv: qindex(kv[0]))}
                             for t, qs in pathd.items() if t in p["marks"]}

    # ---- 3b. who marks lower: on shared loans below 97, each lender's mark against the others'
    dev = defaultdict(list)
    lowest = defaultdict(int)
    dev_b = defaultdict(set)
    for p in pairs:
        if p["median"] >= 0.97:
            continue
        lo_t = min(p["marks"], key=p["marks"].get)
        for t, m in p["marks"].items():
            others = [v for u, v in p["marks"].items() if u != t]
            dev[t].append(m - statistics.mean(others))
            dev_b[t].add(p["borrower"])
            if t == lo_t and p["gap"] > 0.0049:
                lowest[t] += 1
    lender_rel = sorted(({"lender": t, "n": len(v), "mean_dev": round(statistics.mean(v), 4),
                          "median_dev": round(statistics.median(v), 4), "share_lowest": round(lowest[t] / len(v), 4),
                          "borrowers": len(dev_b[t]),
                          "se": round(statistics.stdev(v) / len(dev_b[t]) ** 0.5, 4) if len(v) > 1 else None}
                         for t, v in dev.items() if len(v) >= 8), key=lambda r: r["mean_dev"])

    # ---- 3e. robustness and stakes
    # (a) who was closer: for the first stressed disagreement on each borrower, compare both marks
    #     with where the same lenders stood four quarters later (all-debt marks; a debt-for-equity
    #     exchange counts as resolving toward the lower mark).
    expost = {"closer_low": 0, "closer_high": 0, "restructured": 0, "exited": 0, "cases": []}
    done = set()
    for p in sorted(pairs, key=lambda p: qindex(p["q"])):
        if p["median"] >= 0.97 or p["gap"] < 0.03 or p["borrower"] in done:
            continue
        q4 = by_index.get(qindex(p["q"]) + 4)
        ts = [t for t in p["marks"] if q4 and q4 in covered[t]]
        if not ts:
            continue
        done.add(p["borrower"])
        b = p["borrower"]
        lo_t, hi_t = min(p["marks"], key=p["marks"].get), max(p["marks"], key=p["marks"].get)
        lo, hi = p["marks"][lo_t], p["marks"][hi_t]
        outs = {t: outcome(t, b, p["q"], q4) for t in ts}
        later = [series_all[(t, b)][q4] for t in ts if outs[t] in ("par", "mid", "distress")]
        if any(o == "other" for o in outs.values()):
            k, m4 = "restructured", None
        elif later:
            m4 = statistics.mean(later)
            k = "closer_low" if abs(m4 - lo) < abs(m4 - hi) else "closer_high"
        else:
            k, m4 = "exited", None
        expost[k] += 1
        expost["cases"].append({"name": p["name"], "q": p["q"], "lo": [lo_t, lo], "hi": [hi_t, hi],
                                "later": None if m4 is None else round(m4, 4), "outcome": k})
    # (b) ceiling: gap as a share of the discount the median mark implies (1 - median)
    for d in disagreement:
        lo_ = d["lo"]; hi_ = next((x[1] for x in bands if x[2] == d["band"]), 9)
        rel_ = sorted(p["gap"] / (1 - p["median"]) for p in pairs if lo_ <= p["median"] < hi_ and p["median"] < 0.995)
        d["median_gap_rel_loss"] = round(statistics.median(rel_), 4) if rel_ else None
    # (c) is dispersion rising? by year, all lenders and a fixed panel present from 2022 to 2026
    panel_d = {t for t in covered if qindex(min(covered[t], key=qindex)) <= qindex("2022Q4") and qindex(max(covered[t], key=qindex)) >= qindex("2026Q1")}
    trend = []
    for y in sorted({p["q"][:4] for p in pairs}):
        st_all = [p["gap"] for p in pairs if p["q"][:4] == y and p["median"] < 0.97]
        st_pan = [max(v for u, v in p["marks"].items() if u in panel_d) - min(v for u, v in p["marks"].items() if u in panel_d)
                  for p in pairs if p["q"][:4] == y and p["median"] < 0.97 and sum(u in panel_d for u in p["marks"]) >= 2]
        trend.append({"year": y, "n": len(st_all), "median_gap": round(statistics.median(st_all), 4) if st_all else None,
                      "n_panel": len(st_pan), "median_gap_panel": round(statistics.median(st_pan), 4) if st_pan else None})
    # (d) abrupt cases: marked 90+ and, one quarter later, below 60 or exchanged into equity
    jumps = []
    for (t, b), s_ in series_all.items():
        for q, m in s_.items():
            q1 = by_index.get(qindex(q) + 1)
            if m < NEAR_PAR or not q1 or q1 not in covered[t]:
                continue
            o = outcome(t, b, q, q1)
            if o in ("distress", "other"):
                jumps.append({"lender": t, "name": names.get(b, b), "q": q, "mark": m, "outcome": o})
    glides = [e for e in events if e["path"][-2] is not None and e["path"][-2] < NEAR_PAR]
    # (e) lead and lag: on facilities two lenders share, when one first marks 5+ points below the other,
    #     how many quarters until the gap closes to 2 points, and who moved
    pair_ts = defaultdict(dict)                        # (borrower, t_a, t_b) -> q -> (m_a, m_b)
    for p in pairs:
        ts = sorted(p["marks"])
        for x in range(len(ts)):
            for y in range(x + 1, len(ts)):
                pair_ts[(p["borrower"], ts[x], ts[y])][p["q"]] = (p["marks"][ts[x]], p["marks"][ts[y]])
    leadlag = {"episodes": 0, "closed": 0, "follower_moved": 0, "leader_moved": 0, "both": 0, "quarters": [], "open": 0}
    for (b, ta, tb), byq in pair_ts.items():
        qs = sorted(byq, key=qindex)
        start = next((q for q in qs if abs(byq[q][0] - byq[q][1]) >= 0.05 and min(byq[q]) < 0.97), None)
        if not start:
            continue
        a0, b0 = byq[start]
        lead_is_a = a0 < b0
        leadlag["episodes"] += 1
        close = next((q for q in qs if qindex(q) > qindex(start) and abs(byq[q][0] - byq[q][1]) < 0.02), None)
        if close is None:
            leadlag["open"] += 1
            continue
        a1, b1 = byq[close]
        lead0, lead1 = (a0, a1) if lead_is_a else (b0, b1)
        fol0, fol1 = (b0, b1) if lead_is_a else (a0, a1)
        leadlag["closed"] += 1
        leadlag["quarters"].append(qindex(close) - qindex(start))
        d_fol, d_lead = fol0 - fol1, lead1 - lead0        # follower falls / leader rises
        if d_fol > 2 * max(d_lead, 0) and d_fol > 0.02:
            leadlag["follower_moved"] += 1
        elif d_lead > 2 * max(d_fol, 0) and d_lead > 0.02:
            leadlag["leader_moved"] += 1
        else:
            leadlag["both"] += 1
    if leadlag["quarters"]:
        leadlag["median_quarters"] = statistics.median(leadlag["quarters"])
    # (f) dollars: fair value above (below) what the same principal would be worth at the other lenders' marks
    stakes = {}
    for p in pairs:
        if p["median"] >= 0.97:
            continue
        for t, m in p["marks"].items():
            others = [v for u, v in p["marks"].items() if u != t]
            stakes.setdefault(t, defaultdict(float))[p["q"]] += (m - statistics.mean(others)) * p["par"][t]
    stakes_latest = {}
    for t, byq in stakes.items():
        q = max(byq, key=qindex)
        tot = sum(v["par"] for (tt, b), v_ in agg.items() if tt == t for qq, v in v_.items() if qq == q)
        stakes_latest[t] = {"q": q, "usd": round(byq[q]), "share_of_par": round(byq[q] / tot, 5) if tot else None}
    robust = {"expost": expost, "trend": trend, "trend_panel": sorted(panel_d), "jumps": len(jumps), "jump_cases": jumps[:60],
              "jump_distress": sum(j["outcome"] == "distress" for j in jumps), "jump_other": sum(j["outcome"] == "other" for j in jumps),
              "glides": len(glides), "events_full": len([e for e in events if e["path"][0] is not None]),
              "events_borrowers": len({e["borrower"] for e in events}),
              "leadlag": leadlag, "stakes": stakes_latest}

    # ---- 3c. gallery: timelines of named matched facilities
    for b in GALLERY:
        if b in facility_paths:
            continue
        ps = [p for p in pairs if p["borrower"] == b]
        if not ps:
            continue
        p = max(ps, key=lambda p: p["gap"])
        pathd = defaultdict(dict)
        for (bb, q), ls in lines.items():
            if bb != b:
                continue
            for t, rt, fv, par, _ in ls:
                if t in p["marks"] and abs(rt - p["rate"]) <= 0.01:
                    v = pathd[t].setdefault(q, [0.0, 0.0])
                    v[0] += fv; v[1] += par
        facility_paths[b] = {t: {q: round(v[0] / v[1], 4) for q, v in sorted(qs.items(), key=lambda kv: qindex(kv[0]))}
                             for t, qs in pathd.items()}

    # ---- 3d. one row per lender for the summary table
    lender_table = []
    for t in sorted(lenders):
        cov = sorted(covered[t], key=qindex)
        lender_table.append({
            "lender": t, "name": lenders[t]["name"], "first": cov[0], "last": cov[-1], "quarters": len(cov),
            "borrowers": len({b for (tt, b) in series if tt == t}),
            "par_latest": round(sum(agg[(tt, b)][cov[-1]]["par"] for (tt, b) in series if tt == t and cov[-1] in series[(tt, b)])),
            "matched": sum(1 for p in pairs if t in p["marks"]),
            "events": sum(1 for e in events if e["lender"] == t),
        })

    # ---- 4. PIK share of par loans, fixed panel (lenders validated in every quarter used)
    panel_q = [q for q in quarters if sum(1 for t in covered if q in covered[t]) >= 6]
    panel = [t for t in covered if all(q in covered[t] for q in panel_q[-12:])]
    pik = []
    for q in quarters:
        ps = [pik_q[(t, q)] for t in panel if (t, q) in pik_q]
        if len(ps) == len(panel) and ps:
            par = sum(x["par"] for x in ps); pk = sum(x["pik_par"] for x in ps)
            pik.append({"q": q, "share": round(pk / par, 4), "par": round(par)})

    # ---- headline numbers
    ev_k4 = [e for e in events if e["path"][0] is not None]
    ev_k1 = [e for e in events if e["path"][-2] is not None]
    near_par_year = sum(e["path"][0] >= NEAR_PAR for e in ev_k4)
    near_par_q = sum(e["path"][-2] >= NEAR_PAR for e in ev_k1)
    tr90 = next((r for r in transitions if r["bucket"] == "0.97"), None)
    tr85 = next((r for r in transitions if r["bucket"] == "0.85"), None)
    d97 = next((r for r in disagreement if r["band"] == "97+"), None)
    d70 = next((r for r in disagreement if r["band"] == "below 85"), None)
    metrics = {
        "lenders": len(lenders), "quarters": [quarters[0], quarters[-1]],
        "lender_quarters": passed, "lender_quarters_total": len(validation),
        "borrowers": len({b for (_, b) in series}), "positions": len(series),
        "observations": sum(len(s) for s in series.values()),
        "events": len(events),
        "events_with_year": len(ev_k4), "events_near_par_year": near_par_year,
        "events_with_quarter": len(ev_k1), "events_near_par_quarter": near_par_q,
        "events_par": sum(e["par"] for e in events),
        "events_pik_before": sum(e["pik_before"] for e in events),
        "pairs": len(pairs), "pair_borrowers": len({p["borrower"] for p in pairs}),
        "gap_median_97": d97 and d97["median_gap"], "gap_median_below85": d70 and d70["median_gap"],
        "pik_latest": pik[-1] if pik else None, "pik_first": pik[0] if pik else None, "pik_panel": sorted(panel),
        "thresholds": {"distress": DISTRESS, "near_par": NEAR_PAR, "min_par": MIN_PAR, "tol": TOL,
                       "rate_tol": RATE_TOL, "cost_band": COST_BAND},
    }
    out = {"metrics": metrics, "lenders": lenders, "quarters": quarters,
           "coverage": {t: sorted(qs, key=qindex) for t, qs in covered.items()},
           "events": sorted(events, key=lambda e: (qindex(e["q"]), e["lender"])), "path_stats": path_stats,
           "transitions": transitions, "disagreement": disagreement, "widest": widest,
           "facility_paths": facility_paths, "pik": pik, "lender_rel": lender_rel, "lender_table": lender_table, "robust": robust,
           "pairs": [{k: p[k] for k in ("borrower", "name", "q", "rate", "marks", "median", "gap")} for p in pairs]}
    json.dump(out, open(os.path.join(PUB, "story.json"), "w"), separators=(",", ":"))
    with open(os.path.join(PUB, "marks.csv"), "w") as f:
        f.write("lender,borrower_key,borrower_name,quarter,fair_value,principal,cost,mark,source\n")
        for (t, b), byq in sorted(agg.items()):
            for q, v in sorted(byq.items(), key=lambda kv: qindex(kv[0])):
                if v["par"] >= MIN_PAR:
                    nm = names[b].replace('"', "'")
                    f.write(f'{t},{b},"{nm}",{q},{v["fv"]:.0f},{v["par"]:.0f},{v["cost"]:.0f},'
                            f'{v["fv"] / v["par"]:.4f},{lenders[t]["filings"][q]["url"]}\n')
    print(json.dumps(metrics, indent=1))


if __name__ == "__main__":
    main()
