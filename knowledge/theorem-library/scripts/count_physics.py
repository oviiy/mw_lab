# -*- coding: utf-8 -*-
import re
from pathlib import Path

s = Path(__file__).resolve().parent.parent.joinpath("js/theorems-physics.js").read_text(
    encoding="utf-8"
)
ids = re.findall(r'^\s*id:\s*"([^"]+)"', s, re.M)
print("count", len(ids))
for i in ids:
    print(" ", i)
print("chinese", bool(re.search(r"[\u4e00-\u9fff]", s)))
rels = re.findall(r"related:\s*\[([^\]]*)\]", s)
all_rel = []
for r in rels:
    all_rel += re.findall(r'"([^"]+)"', r)
miss = sorted(set(x for x in all_rel if x not in ids))
print("missing related", miss)
print(
    "balance braces",
    s.count("{") - s.count("}"),
    "parens",
    s.count("(") - s.count(")"),
    "brackets",
    s.count("[") - s.count("]"),
)
print("titles", len(re.findall(r'title:\s*"', s)))
print("fields physics", len(re.findall(r'field:\s*"physics"', s)))
req = ["story", "statement", "setup", "lemmas", "proof", "deep", "why", "try"]
# Split by id entries roughly
parts = re.split(r'(?=\n\s*\{\s*\n\s*id:\s*")', s)
incomplete = []
for p in parts:
    m = re.search(r'id:\s*"([^"]+)"', p)
    if not m:
        continue
    tid = m.group(1)
    for k in req:
        if not re.search(rf"\b{k}\s*:", p):
            incomplete.append((tid, k))
print("incomplete", incomplete if incomplete else "none")
# try compile as JS-like: strip template? just check balanced and ends properly
if not s.rstrip().endswith("})();") and "T.push(...PHYSICS)" not in s:
    print("WARN: unexpected ending")
else:
    print("ending OK")
print("bytes", len(s.encode("utf-8")))
