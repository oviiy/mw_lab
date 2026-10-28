"""Count AI language in each 10-K / 10-Q: mentions per 10,000 words of filing text."""
import html
import json
import re
from pathlib import Path

RAW = Path(__file__).resolve().parent.parent / "data" / "raw"
OUT = Path(__file__).resolve().parent.parent / "data" / "derived"
OUT.mkdir(parents=True, exist_ok=True)

# "AI" must be the standalone uppercase token; the long forms are case-insensitive.
AI_TOKEN = re.compile(r"(?<![A-Za-z])AI(?![A-Za-z])")
AI_PHRASE = re.compile(r"artificial intelligence|generative ai|machine learning|large language model"
                       r"|\bllms?\b|\bgpus?\b|accelerated comput", re.I)
TAG = re.compile(r"<[^>]+>")
HIDDEN = re.compile(r"(?is)<(script|style|ix:header)[^>]*>.*?</\1>")
WORD = re.compile(r"[A-Za-z]{2,}")


def text_of(path):
    raw = path.read_text(errors="ignore")
    return html.unescape(TAG.sub(" ", HIDDEN.sub(" ", raw)))


def main():
    idx = json.loads((RAW / "filings_index.json").read_text())
    rows = []
    for iid, filings in idx.items():
        for f in filings:
            t = text_of(RAW / "filings" / f"{iid}_{f['acc']}.htm")
            words = len(WORD.findall(t))
            n_ai = len(AI_TOKEN.findall(t))
            n_phrase = len(AI_PHRASE.findall(t))
            rows.append({"issuer_id": iid, "form": f["form"], "filed": f["filed"], "period": f["period"],
                         "words": words, "ai_token": n_ai, "ai_phrase": n_phrase,
                         "per_10k": round((n_ai + n_phrase) / words * 1e4, 2) if words else None})
        print(iid, [r["per_10k"] for r in rows if r["issuer_id"] == iid])
    (OUT / "ai_mentions.json").write_text(json.dumps(rows, indent=1))


if __name__ == "__main__":
    main()
