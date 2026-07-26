from pathlib import Path
import re
from collections import Counter

base = Path(__file__).resolve().parents[1] / "js"
ids = []
for n in ["theorems.js", "theorems-extra.js", "theorems-more.js", "theorems-physics.js"]:
    t = (base / n).read_text(encoding="utf-8")
    found = re.findall(r'id:\s*"([^"]+)"', t)
    print(n, len(found))
    ids.extend(found)
c = Counter(ids)
print("unique", len(c), "dups", [k for k, v in c.items() if v > 1])
phys = [i for i in ids if i in re.findall(r'id:\s*"([^"]+)"', (base / "theorems-physics.js").read_text(encoding="utf-8"))]
print("physics ids", re.findall(r'id:\s*"([^"]+)"', (base / "theorems-physics.js").read_text(encoding="utf-8")))
t = (base / "theorems-physics.js").read_text(encoding="utf-8")
print("brace delta", t.count("{") - t.count("}"))
print("emoji ent broken?", '" ent"' in t or "emoji: \" ent\"" in t)
