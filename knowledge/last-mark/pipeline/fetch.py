"""Download every 10-Q/10-K XBRL instance for the tracked BDCs and keep only the
Schedule of Investments: one row per investment per period-end, with fair value,
cost, principal and PIK rate exactly as tagged.

    python pipeline/fetch.py ARCC OBDC ...      # default: all tickers in LENDERS

Output: data/raw/<TICKER>/<period>.json  (the raw XML is not kept)
"""
import gzip, json, os, re, sys, time, urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")
UA = os.environ.get("SEC_USER_AGENT", "MW Lab research mwlab-research@example.com")
START = "2022-06-30"

LENDERS = ["ARCC", "OBDC", "FSK", "BXSL", "GBDC", "MAIN", "PSEC", "BBDC", "OCSL",
           "HTGC", "TCPC", "NMFC", "CGBD", "MFIC", "SLRC", "CCAP", "PFLT", "KBDC",
           "FDUS", "CSWC", "WHF", "TRIN", "GAIN", "PNNT", "OFS", "SAR", "MSDL", "PSBD"]

XBRLI = "{http://www.xbrl.org/2003/instance}"
XBRLDI = "{http://xbrl.org/2006/xbrldi}"
FIELDS = {
    "InvestmentOwnedAtFairValue": "fv",
    "InvestmentOwnedAtCost": "cost",
    "InvestmentOwnedBalancePrincipalAmount": "par",
    "InvestmentInterestRatePaidInKind": "pik",
    "InvestmentInterestRate": "rate",
}
_last = [0.0]


def get(url):
    wait = 0.5 - (time.time() - _last[0])
    if wait > 0:
        time.sleep(wait)
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "gzip"})
            with urllib.request.urlopen(req, timeout=120) as r:
                body = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    body = gzip.decompress(body)
            _last[0] = time.time()
            return body
        except Exception as e:  # noqa: BLE001 - retry any transport error
            if attempt == 4:
                raise
            time.sleep(2 * (attempt + 1))


def cik_map():
    tk = json.loads(get("https://www.sec.gov/files/company_tickers.json"))
    return {v["ticker"]: (v["cik_str"], v["title"]) for v in tk.values()}


def filings(cik):
    sub = json.loads(get(f"https://data.sec.gov/submissions/CIK{cik:010d}.json"))
    blocks = [sub["filings"]["recent"]]
    for f in sub["filings"].get("files", []):
        blocks.append(json.loads(get("https://data.sec.gov/submissions/" + f["name"])))
    out = []
    for b in blocks:
        for form, acc, rd, fd in zip(b["form"], b["accessionNumber"], b["reportDate"], b["filingDate"]):
            if form in ("10-Q", "10-K") and rd >= START:
                out.append((rd, form, acc, fd))
    return sorted(set(out))


def parse_instance(xml_bytes, period):
    root = ET.fromstring(xml_bytes)
    ctx = {}
    for c in root.iter(XBRLI + "context"):
        inst = c.find(f"{XBRLI}period/{XBRLI}instant")
        if inst is None or inst.text.strip() != period:
            continue
        dims = {}
        seg = c.find(f"{XBRLI}entity/{XBRLI}segment")
        if seg is not None:
            for m in seg:
                d = m.get("dimension", "").split(":")[-1]
                dims[d] = "".join(m.itertext()).strip()
        if "InvestmentIdentifierAxis" in dims:
            ctx[c.get("id")] = dims
    rows = defaultdict(dict)
    for el in root:
        name = el.tag.split("}")[-1]
        f = FIELDS.get(name)
        if not f or el.get("contextRef") not in ctx or el.text is None:
            continue
        dims = ctx[el.get("contextRef")]
        try:
            v = float(el.text)
        except ValueError:
            continue
        # one investment can appear under several contexts (extra axes); keep the
        # context with the fewest dimensions, which is the plain SOI line
        key = dims["InvestmentIdentifierAxis"]
        r = rows[key]
        n = len(dims)
        if f in r and r.get("_n_" + f, 99) <= n:
            continue
        r[f] = v
        r["_n_" + f] = n
        if "InvestmentIssuerNameAxis" in dims:
            r["issuer"] = dims["InvestmentIssuerNameAxis"]
    out = []
    for k, r in rows.items():
        o = {"id": k}
        o.update({x: r[x] for x in ("fv", "cost", "par", "pik", "rate", "issuer") if x in r})
        out.append(o)
    return out


def run(tickers):
    cm = cik_map()
    for t in tickers:
        if t not in cm:
            print(t, "not in SEC ticker map", flush=True)
            continue
        cik, title = cm[t]
        d = os.path.join(RAW, t)
        os.makedirs(d, exist_ok=True)
        try:
            fl = filings(cik)
        except Exception as e:  # noqa: BLE001
            print(t, "submissions failed", e, flush=True)
            continue
        for rd, form, acc, fd in fl:
            out = os.path.join(d, rd + ".json")
            if os.path.exists(out):
                continue
            base = f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc.replace('-', '')}/"
            try:
                items = json.loads(get(base + "index.json"))["directory"]["item"]
                names = [i["name"] for i in items]
                inst = [n for n in names if n.endswith("_htm.xml")] or [
                    n for n in names if n.endswith(".xml") and not re.search(r"_(cal|def|lab|pre)\.xml$|FilingSummary", n)]
                if not inst:
                    print(t, rd, "no inline XBRL instance", flush=True)
                    continue
                rows = parse_instance(get(base + inst[0]), rd)
            except Exception as e:  # noqa: BLE001
                print(t, rd, "failed", e, flush=True)
                continue
            meta = {"ticker": t, "cik": cik, "name": title, "period": rd, "form": form,
                    "accession": acc, "filed": fd, "url": base + inst[0].replace("_htm.xml", ".htm").replace(".xml", ".htm")}
            json.dump({"meta": meta, "rows": rows}, open(out, "w"))
            print(t, rd, form, len(rows), "rows", flush=True)


if __name__ == "__main__":
    run(sys.argv[1:] or LENDERS)
