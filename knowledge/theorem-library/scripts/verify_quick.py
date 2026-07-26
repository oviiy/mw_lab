from pathlib import Path
import re

base = Path(__file__).resolve().parents[1] / "js"
ids = []
for n in ["theorems.js", "theorems-extra.js", "theorems-more.js"]:
    ids += re.findall(r'id:\s*"([^"]+)"', (base / n).read_text(encoding="utf-8"))
print(len(ids), "theorems")
more = (base / "theorems-more.js").read_text(encoding="utf-8")
for tid in ["fermat-little", "bayes", "taylor", "sandwich", "euler-bridges"]:
    assert f'id: "{tid}"' in more
    assert f'inject("{tid}"' in more
print("new injects ok")
t = (base / "theorems.js").read_text(encoding="utf-8")
assert "gt rsim" not in t
assert "gtrsim" in t
assert "&lt;" not in t
assert "&lt;" not in (base / "theorems-extra.js").read_text(encoding="utf-8")
assert "&lt;" not in (base / "theorems-more.js").read_text(encoding="utf-8")
print("entities ok")
# formulas patch has all new ids
fp = (base / "formulas-patch.js").read_text(encoding="utf-8")
for tid in ["bayes", "fermat-little", "taylor", "godel", "kakeya"]:
    assert tid in fp
print("formulas-patch ok")
print("ALL MANUAL CHECKS PASSED")
