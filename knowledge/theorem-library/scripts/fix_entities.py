# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "js" / "theorems.js"
t = p.read_text(encoding="utf-8")
# In data-latex attributes, use \lt \gt instead of HTML entities or raw <
# Source is JS: need \\\\lt in file for template literal → \lt in HTML attr
# Current: &lt;  → replace with \\lt  (in file as \\\\lt for template?)
# theorems.js content is inside template literals `...`
# When we write data-latex="0 \\lt |h| \\lt \\delta" inside backticks:
#   \\ becomes \, so attribute is "0 \lt |h| \lt \delta" ✓

n1 = t.count("&lt;")
n2 = t.count("&gt;")
t2 = t.replace("&lt;", "\\lt ").replace("&gt;", "\\gt ")
# Also fix any raw < inside data-latex="..." that might have been introduced
import re

def fix_latex_attr(m):
    inner = m.group(1)
    # if already has \lt leave bare < replacements only
    inner2 = inner.replace("<", "\\lt ").replace(">", "\\gt ")
    # avoid double: \lt  \lt
    inner2 = re.sub(r"(\\lt\s*)+", r"\\lt ", inner2)
    inner2 = re.sub(r"(\\gt\s*)+", r"\\gt ", inner2)
    return 'data-latex="' + inner2 + '"'

t2 = re.sub(r'data-latex="([^"]*)"', fix_latex_attr, t2)
p.write_text(t2, encoding="utf-8")
print(f"replaced &lt;={n1} &gt;={n2}")
print("sample ftc:", "\\lt" in t2)
