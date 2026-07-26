# -*- coding: utf-8 -*-
from pathlib import Path
import re
from collections import Counter

BASE = Path(__file__).resolve().parents[1]
JS = BASE / "js"
errors, warnings = [], []

def read(n):
    return (JS / n).read_text(encoding="utf-8")

# --- ids ---
ids = []
for n in ["theorems.js", "theorems-extra.js", "theorems-more.js"]:
    ids += re.findall(r'id:\s*"([^"]+)"', read(n))
ctr = Counter(ids)
for i, c in ctr.items():
    if c > 1:
        errors.append(f"duplicate id {i} x{c}")
all_ids = set(ids)
print("theorems", len(all_ids))

# --- required sections ---
for n in ["theorems.js", "theorems-extra.js", "theorems-more.js"]:
    text = read(n)
    for m in re.finditer(r'id:\s*"([^"]+)"', text):
        tid = m.group(1)
        # slice until next id
        start = m.start()
        nxt = re.search(r'id:\s*"', text[m.end():])
        block = text[start : m.end() + (nxt.start() if nxt else len(text))]
        for sec in ["story", "statement", "proof", "why", "try"]:
            if not re.search(rf"\b{sec}\s*:", block):
                errors.append(f"{tid}: missing {sec}")

# --- related ---
for n in ["theorems.js", "theorems-extra.js", "theorems-more.js"]:
    text = read(n)
    for m in re.finditer(r'id:\s*"([^"]+)"[\s\S]*?related:\s*\[(.*?)\]', text):
        tid, arr = m.group(1), m.group(2)
        for r in re.findall(r'"([^"]+)"', arr):
            if r not in all_ids:
                errors.append(f"{tid}: bad related {r}")

# --- data-latex quality ---
for n in ["theorems.js", "theorems-extra.js", "theorems-more.js", "formulas-patch.js"]:
    text = read(n)
    if "&lt;" in text or "&gt;" in text:
        errors.append(f"{n}: still has HTML entities &lt;/&gt;")
    if "gt rsim" in text or "lt rsim" in text:
        errors.append(f"{n}: broken gtrsim/lesssim")
    # bare single-backslash \lt inside data-latex in .js template is risky;
    # expect \\lt in source (appears as \\\\lt in python raw? in file we see \\lt)
    for m in re.finditer(r'data-latex="([^"]*)"', text):
        val = m.group(1)
        # ignore helper templates like data-latex="${latex}"
        if val in ("${latex}", "${latex }") or val.startswith("${") and "latex" in val:
            continue
        if "${" in val:
            errors.append(f"{n}: ${{ in data-latex: {val[:60]}")

# --- widgets ---
wsrc = read("diagrams.js") + read("diagrams-detail.js") + read("diagrams-more.js")
registered = set(re.findall(r'W\["([^"]+)"\]', wsrc))
# from const widgets map
if "const widgets" in wsrc:
    part = wsrc.split("const widgets")[-1]
    registered |= set(re.findall(r'"([a-z0-9-]+)":\s*[a-zA-Z_]', part))
# inject used
used = set()
for n in ["theorems-extra.js", "theorems-more.js"]:
    t = read(n)
    used |= set(re.findall(r'data-widget="([^"]+)"', t))
    used |= set(re.findall(r'inject(?:Many)?\([^)]*"([a-z0-9-]+)"\s*\)', t))
    for m in re.finditer(r"\[((?:\"[a-z0-9-]+\"\s*,?\s*)+)\]", t):
        used |= set(re.findall(r'"([a-z0-9-]+)"', m.group(1)))

# filter used to known inject widget names only (not theorem ids wrongly)
widget_used = {u for u in used if u in registered or "inject" in read("theorems-extra.js")}
# better: get from inject lines only
inject_widgets = set()
for n in ["theorems-extra.js", "theorems-more.js"]:
    t = read(n)
    # inject("id", "sec", "widget")
    inject_widgets |= set(re.findall(r'inject\(\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*"([^"]+)"', t))
    # injectMany arrays
    for m in re.finditer(r"injectMany\(\s*\"[^\"]+\"\s*,\s*\"[^\"]+\"\s*,\s*\[([^\]]+)\]", t):
        inject_widgets |= set(re.findall(r'"([^"]+)"', m.group(1)))

print("registered widgets", len(registered))
print("injected widgets", sorted(inject_widgets))
for w in sorted(inject_widgets):
    if w not in registered and w not in wsrc:
        errors.append(f"widget not registered: {w}")
    elif f'"{w}"' not in wsrc and f"'{w}'" not in wsrc:
        # still search function registration
        if w not in wsrc:
            errors.append(f"widget not in diagrams source: {w}")

# new demos
for w in ["fermat-little","cauchy-schwarz","bayes","binomial","law-of-cosines","euler-bridges","taylor","sandwich"]:
    if w not in inject_widgets:
        errors.append(f"new theorem missing inject: {w}")
    if f'W["{w}"]' not in read("diagrams-more.js"):
        errors.append(f"new demo missing factory: {w}")

# --- index ---
idx = (BASE / "index.html").read_text(encoding="utf-8")
for need in [
    "vendor/katex/katex.min.js",
    "js/theorems-more.js",
    "js/formulas-patch.js",
    "js/diagrams-more.js",
    "js/math-render.js",
]:
    if need not in idx:
        errors.append(f"index missing {need}")
    elif not (BASE / need).exists():
        errors.append(f"missing file {need}")

# --- main ---
main = read("main.js")
if "UNUSED" in main:
    errors.append("main still has UNUSED")
if main.count("{") - main.count("}") != 0:
    # ignore if only string noise - check function wrappers
    if not main.strip().endswith("})();"):
        errors.append("main.js doesn't end cleanly")

# formulas-patch keys for all 32?
fp = read("formulas-patch.js")
for tid in ["godel", "kakeya", "bayes", "fermat-little", "taylor", "sandwich", "binomial"]:
    if tid not in fp and f'"{tid}"' not in fp:
        warnings.append(f"formulas-patch may lack {tid}")

print("\nERRORS:")
for e in errors:
    print(" ", e)
print("WARNINGS:")
for w in warnings:
    print(" ", w)
print(f"\n{len(errors)} errors")
raise SystemExit(1 if errors else 0)
