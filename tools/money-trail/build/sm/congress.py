"""House of Representatives periodic transaction reports (STOCK Act): index, PDF text, trade-line parser, member matching."""
from __future__ import annotations

import io
import re
import zipfile
from datetime import date, datetime

import pandas as pd

from .sec import SecClient, SecError

HOUSE_INDEX = "https://disclosures-clerk.house.gov/public_disc/financial-pdfs/{year}FD.zip"
HOUSE_PTR = "https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/{year}/{doc}.pdf"
LEGISLATORS = "https://unitedstates.github.io/congress-legislators/legislators-{kind}.json"
COMMITTEES = "https://unitedstates.github.io/congress-legislators/committees-current.json"
MEMBERSHIP = "https://unitedstates.github.io/congress-legislators/committee-membership-current.json"

TX_LINE = re.compile(r"^(P|S \(partial\)|S|E)\s+(\d{2}/\d{2}/\d{4})\s+(\d{2}/\d{2}/\d{4})\s*(.*)$")
TICKER = re.compile(r"\(([A-Z][A-Z0-9.\-/]{0,7})\)\s*\[([A-Z]{2})\]")
ASSET_TYPE = re.compile(r"\[([A-Z]{2})\]")
OWNER = re.compile(r"^(SP|JT|DC)\s+(.*)$")
DESC = re.compile(r"^D\s+:\s?(.*)$")
NOISE = re.compile(r"^(ID Owner|Type$|Date Notification|Date$|Amount Cap|Gains >|\$200\?|Filing ID #|\* For the complete|Name:|Status:|State/District:)")
TX_KIND = {"P": "buy", "S": "sell", "S (partial)": "sell", "E": "exchange"}
OWNER_LABEL = {"SP": "spouse", "JT": "joint", "DC": "child"}


def house_index(client: SecClient, year: int) -> pd.DataFrame:
    """All periodic transaction reports (FilingType P) filed in a calendar year."""
    raw = client.get_bytes(HOUSE_INDEX.format(year=year), max_age_s=86400)
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        name = next(n for n in z.namelist() if n.lower().endswith(".txt"))
        df = pd.read_csv(z.open(name), sep="\t", dtype=str, keep_default_na=False)
    df.columns = [c.strip() for c in df.columns]
    df = df[df["FilingType"].str.strip() == "P"]
    return pd.DataFrame({
        "doc_id": df["DocID"].str.strip(), "year": year,
        "last": df["Last"].str.strip(), "first": df["First"].str.strip(),
        "state_dst": df["StateDst"].str.strip(),
        "filing_date": pd.to_datetime(df["FilingDate"].str.strip(), format="%m/%d/%Y").dt.date,
    }).reset_index(drop=True)


def ptr_text(client: SecClient, year: int, doc_id: str) -> str:
    """Text of an e-filed PTR. Scanned paper filings (doc ids starting with 8) have no text layer; returns ''."""
    from pypdf import PdfReader

    try:
        raw = client.get_bytes(HOUSE_PTR.format(year=year, doc=doc_id))
    except SecError:
        return ""
    try:
        return "\n".join(p.extract_text() or "" for p in PdfReader(io.BytesIO(raw)).pages)
    except Exception:  # malformed PDF: treat like a scan
        return ""


def _amount(text: str) -> tuple[float | None, float | None]:
    nums = [float(n.replace(",", "")) for n in re.findall(r"\$([\d,]+)", text)]
    if not nums:
        return None, None
    return nums[0], (nums[1] if len(nums) > 1 else nums[0])


OLD_TX = re.compile(r"(?:\[(?P<at>[A-Za-z]{2})\]\s*(?:¶\s*)?|(?<=¶ )|(?<= ))(?P<tx>P|S \(partial\)|S|E)\s*(?:¶\s*)?(?P<d1>\d{2}/\d{2}/\d{4})\s+"
                    r"(?P<d2>\d{2}/\d{2}/\d{4})\s+(?P<amt>\$[\d,]+(?:\s*-\s*(?:¶\s*)?\$[\d,]+)?)")
OLD_STOP = re.compile(r"\$200\?|cap\. gains|notification|^amount$|^date$|transaction type", re.I)


def _parse_old(text: str) -> list[dict]:
    """2021 to early-2022 PTRs: the text layer runs fields together ('[ST] S (partial)' on its own line, owner code
    trailing the previous description). Find each '[XX] <type> <date> <date> <amount>' and walk back for the asset."""
    flat = " ¶ ".join(ln.strip() for ln in text.replace("\x00", " ").splitlines())
    out, prev_end = [], 0
    for m in OLD_TX.finditer(flat):
        segs = [s.strip() for s in flat[prev_end:m.start()].split("¶")]
        parts, owner = [], "self"
        for seg in reversed(segs):
            if not seg:
                continue
            if seg in OWNER_LABEL:
                owner = OWNER_LABEL[seg]
                break
            om = re.search(r"(?:^|\s)(SP|JT|DC)$", seg)
            if ":" in seg or OLD_STOP.search(seg) or len(parts) >= 2:
                if om and ":" in seg:
                    owner = OWNER_LABEL[om.group(1)]
                elif ":" in seg and not parts:
                    # asset name glued to the previous 'Subholding of: <account>' line; keep the tail
                    parts.insert(0, seg.rsplit(":", 1)[1].strip())
                break
            parts.insert(0, seg)
        asset = re.sub(r"\s+", " ", " ".join(parts)).strip()
        # the old font renders some capitals as lowercase, e.g. '(gPN)' for GPN
        tk = re.search(r"\(([A-Za-z][A-Za-z0-9.\-/]{0,7})\)\s*$", asset)
        lo, hi = _amount(m.group("amt"))
        out.append({
            "owner": owner, "asset": re.sub(r"\s*\([A-Za-z][A-Za-z0-9.\-/]{0,7}\)\s*$", "", asset).rstrip(" -"),
            "ticker": tk.group(1).upper() if tk else None, "asset_type": (m.group("at") or "").upper() or None, "kind": TX_KIND[m.group("tx")],
            "partial": m.group("tx") == "S (partial)",
            "trade_date": datetime.strptime(m.group("d1"), "%m/%d/%Y").date(),
            "notified": datetime.strptime(m.group("d2"), "%m/%d/%Y").date(),
            "amount_lo": lo, "amount_hi": hi, "desc": "",
        })
        prev_end = m.end()
    return out


def parse_ptr(text: str) -> list[dict]:
    # Layouts changed during 2022; some reports half-match the line parser, so keep whichever finds more trades.
    a, b = _parse_lines(text), _parse_old(text)
    return a if len(a) >= len(b) else b


def _parse_lines(text: str) -> list[dict]:
    # The House PDF fonts render small-caps labels as NUL characters ("D\x00\x00: Purchased ..."); treat them as spaces.
    lines = [re.sub(r"\s+", " ", ln.replace("\x00", " ")).strip() for ln in text.splitlines()]
    out: list[dict] = []
    buf: list[str] = []
    i = 0
    while i < len(lines):
        ln = lines[i]
        m = TX_LINE.match(ln)
        if m and buf:
            amount = m.group(4)
            if amount.rstrip().endswith("-") and i + 1 < len(lines):
                i += 1
                amount += " " + lines[i]
            asset = " ".join(buf)
            owner = "self"
            om = OWNER.match(asset)
            if om:
                owner, asset = OWNER_LABEL[om.group(1)], om.group(2)
            tk = TICKER.search(asset)
            at = ASSET_TYPE.search(asset)
            name = re.sub(r"\s*(\([A-Z][A-Z0-9.\-/]{0,7}\))?\s*\[[A-Z]{2}\]\s*$", "", asset).rstrip(" -")
            lo, hi = _amount(amount)
            out.append({
                "owner": owner, "asset": name, "ticker": tk.group(1) if tk else None,
                "asset_type": at.group(1) if at else None, "kind": TX_KIND[m.group(1)],
                "partial": m.group(1) == "S (partial)",
                "trade_date": datetime.strptime(m.group(2), "%m/%d/%Y").date(),
                "notified": datetime.strptime(m.group(3), "%m/%d/%Y").date(),
                "amount_lo": lo, "amount_hi": hi, "desc": "",
            })
            buf = []
            i += 1
            continue
        d = DESC.match(ln)
        if d and out:
            desc = d.group(1)
            while not desc.rstrip().endswith(".") and i + 1 < len(lines) and not ASSET_TYPE.search(lines[i + 1]) \
                    and not OWNER.match(lines[i + 1]) and " : " not in lines[i + 1] and not TX_LINE.match(lines[i + 1]):
                i += 1
                desc += " " + lines[i]
            out[-1]["desc"] = desc.strip()
            buf = []
        elif not ln or " : " in ln or ":" in ln[:24] and ln.split(":")[0].replace(" ", "").isalpha() or NOISE.match(ln):
            buf = []
        else:
            buf.append(ln)
            if len(buf) > 4:          # asset names never span more than a few lines; drop stray text
                buf = buf[-4:]
        i += 1
    return out


def legislators(client: SecClient) -> pd.DataFrame:
    """Members of either chamber serving since 2020, with party, state, district, chamber and committee names (public domain data)."""
    rows = []
    for kind in ("current", "historical"):
        for p in client.get_json(LEGISLATORS.format(kind=kind), max_age_s=7 * 86400):
            terms = [t for t in p.get("terms", []) if t.get("type") in ("rep", "sen") and t.get("end", "") >= "2020-01-01"]
            if not terms:
                continue
            t = terms[-1]
            rows.append({"bioguide": p["id"]["bioguide"], "first": p["name"].get("first", ""), "last": p["name"].get("last", ""),
                         "nick": p["name"].get("nickname", ""),
                         "full": p["name"].get("official_full") or f'{p["name"].get("first", "")} {p["name"].get("last", "")}',
                         "party": t.get("party", ""), "state": t.get("state", ""), "district": t.get("district"),
                         "chamber": "senate" if t["type"] == "sen" else "house",
                         "wikipedia": p["id"].get("wikipedia") or "", "website": t.get("url") or "",
                         "chambers": sorted({x["type"] for x in terms}), "current": kind == "current"})
    df = pd.DataFrame(rows).drop_duplicates("bioguide")
    names = {c["thomas_id"]: c["name"] for c in client.get_json(COMMITTEES, max_age_s=7 * 86400)}
    member_of: dict[str, list[str]] = {}
    for cid, members in client.get_json(MEMBERSHIP, max_age_s=7 * 86400).items():
        if cid in names:
            for mm in members:
                member_of.setdefault(mm["bioguide"], []).append(names[cid])
    df["committees"] = df["bioguide"].map(lambda b: member_of.get(b, []))
    return df.reset_index(drop=True)


def _norm(s: str) -> str:
    return re.sub(r"[^a-z]", "", s.lower())


def match_member(last: str, first: str, state_dst: str, members: pd.DataFrame) -> str | None:
    """Match a filer to a bioguide id by state + last name, using district/first name to break ties."""
    st, dist = state_dst[:2], state_dst[2:]
    cand = members[(members["state"] == st) & (members["last"].map(_norm) == _norm(last))]
    if len(cand) > 1 and dist.isdigit():
        by_d = cand[cand["district"] == int(dist)]
        cand = by_d if len(by_d) else cand
    if len(cand) > 1:
        by_f = cand[cand["first"].map(_norm).str[:3] == _norm(first)[:3]]
        cand = by_f if len(by_f) else cand
    return cand["bioguide"].iloc[0] if len(cand) else None


def match_senator(last: str, first: str, members: pd.DataFrame) -> str | None:
    """eFD gives only names, e.g. last='Justice, II' first='James Conley'. Match among people who served as senators."""
    base = _norm(re.split(r",| Jr| Sr| II| III", last)[0])
    sen = members[members["chambers"].map(lambda c: "sen" in c)]
    cand = sen[sen["last"].map(_norm) == base]
    if len(cand) > 1:
        f = _norm(first)
        by_f = cand[(cand["first"].map(_norm).str[:3] == f[:3]) | (cand["nick"].map(_norm).str[:3] == f[:3])]
        cand = by_f if len(by_f) else cand
    return cand["bioguide"].iloc[0] if len(cand) else None


def slug(last: str, first: str, state_dst: str) -> str:
    return f"{_norm(last)}-{_norm(first)[:8]}-{state_dst.lower()}"
