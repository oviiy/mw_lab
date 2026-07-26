# -*- coding: utf-8 -*-
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
s = (root / "js/diagrams-physics.js").read_text(encoding="utf-8")
widgets = re.findall(r'W\["([^"]+)"\]\s*=', s)
print("widgets", len(widgets))
for w in widgets:
    print(" ", w)

# extract map object body
m = re.search(r"const map = \{([\s\S]*?)\n  \};", s)
assert m, "map not found"
body = m.group(1)
# "id": "widget" or bare id: "widget"
pairs = re.findall(r'["\']?([\w-]+)["\']?\s*:\s*["\']([\w-]+)["\']', body)
print("map entries", len(pairs))
wset = set(widgets)
missing_w = sorted({v for _, v in pairs if v not in wset})
print("missing widgets for map:", missing_w or "none")

# physics theorem ids
phys = (root / "js/theorems-physics.js").read_text(encoding="utf-8")
ids = re.findall(r'^\s*id:\s*"([^"]+)"', phys, re.M)
mapped = {k for k, _ in pairs}
unmapped = [i for i in ids if i not in mapped]
print("physics theorems", len(ids))
print("unmapped theorems:", unmapped or "none")

print("brace bal", s.count("{") - s.count("}"), "paren", s.count("(") - s.count(")"))
print("file bytes", len(s.encode("utf-8")))

# crude JS syntax: check no obvious template issues
if s.count("`") % 2:
    print("WARN: odd backtick count", s.count("`"))
else:
    print("backticks even OK")
