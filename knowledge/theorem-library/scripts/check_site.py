# -*- coding: utf-8 -*-
"""Sanity-check theorem library content & structure."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
JS = BASE / "js"
errors: list[str] = []
warnings: list[str] = []


def read(name: str) -> str:
    return (JS / name).read_text(encoding="utf-8")


def extract_ids(text: str) -> list[str]:
    return re.findall(r'id:\s*"([^"]+)"', text)


def extract_object_blocks(text: str) -> list[tuple[str, str]]:
    """Very rough: split by id: "..." occurrences and take until next id or end of push."""
    ids = list(re.finditer(r'id:\s*"([^"]+)"', text))
    blocks = []
    for i, m in enumerate(ids):
        start = m.start()
        end = ids[i + 1].start() if i + 1 < len(ids) else len(text)
        blocks.append((m.group(1), text[start:end]))
    return blocks


REQUIRED_SECTIONS = ["story", "statement", "proof", "why", "try"]
OPTIONAL_SECTIONS = ["setup", "lemmas", "deep"]


def check_block(tid: str, block: str) -> None:
    for sec in REQUIRED_SECTIONS:
        if f"{sec}:" not in block and f"{sec} :" not in block:
            # sections: { story: `  pattern
            if not re.search(rf"\b{sec}\s*:", block):
                errors.append(f"[{tid}] missing section: {sec}")

    # template literal ${ risk in data-latex inside theorem template strings
    # already-built strings in theorems use `...` - check raw ${ that isn't from JS
    # In theorems files, ${ only OK if intentional - search data-latex lines for ${
    for m in re.finditer(r'data-latex="([^"]*)"', block):
        latex = m.group(1)
        if "${" in latex:
            errors.append(f"[{tid}] data-latex contains ${{ which breaks template: {latex[:60]}")
        # empty latex
        if not latex.strip():
            errors.append(f"[{tid}] empty data-latex")

    # broken HTML entities left in data-latex that should be <
    for m in re.finditer(r'data-latex="([^"]*&(?:lt|gt|amp);[^"]*)"', block):
        warnings.append(f"[{tid}] data-latex has HTML entity: {m.group(1)[:80]}")

    # formula div empty without data-latex
    for m in re.finditer(r'<div class="formula"([^>]*)>(.*?)</div>', block, re.S):
        attrs, inner = m.group(1), m.group(2).strip()
        if "data-latex" not in attrs and not inner:
            errors.append(f"[{tid}] empty formula without data-latex")

    # calc-line empty without data-latex
    for m in re.finditer(r'<div class="calc-line"([^>]*)>(.*?)</div>', block, re.S):
        attrs, inner = m.group(1), m.group(2).strip()
        if "data-latex" not in attrs and not inner:
            errors.append(f"[{tid}] empty calc-line without data-latex")

    # people / title
    if "title:" not in block:
        errors.append(f"[{tid}] missing title")
    if "people:" not in block:
        warnings.append(f"[{tid}] missing people")
    if "related:" not in block:
        warnings.append(f"[{tid}] missing related")


def check_related_links(all_ids: set[str], blocks: list[tuple[str, str]]) -> None:
    for tid, block in blocks:
        m = re.search(r"related:\s*\[(.*?)\]", block, re.S)
        if not m:
            continue
        refs = re.findall(r'"([^"]+)"', m.group(1))
        for r in refs:
            if r not in all_ids:
                errors.append(f"[{tid}] related → missing id '{r}'")


def check_widgets(all_ids: set[str]) -> None:
    djs = read("diagrams.js") + read("diagrams-detail.js") + read("diagrams-more.js")
    # widget keys
    keys = set(re.findall(r'["\']([a-z0-9-]+)["\']\s*:\s*\w+', djs.split("const widgets")[-1] if "const widgets" in djs else djs))
    # also W["name"]
    keys |= set(re.findall(r'W\["([^"]+)"\]', djs))
    keys |= set(re.findall(r"W\['([^']+)'\]", djs))

    # inject markers in theorem files
    content = ""
    for name in ["theorems.js", "theorems-extra.js", "theorems-more.js"]:
        content += read(name)
    used = set(re.findall(r'data-widget="([^"]+)"', content))
    # also from inject("id","sec","widget")
    used |= set(re.findall(r'inject\([^,]+,\s*[^,]+,\s*"([^"]+)"', content))
    used |= set(re.findall(r'injectMany\([^,]+,\s*[^,]+,\s*\[([^\]]+)\]', content))
    # parse injectMany arrays
    for m in re.finditer(r"injectMany\([^,]+,\s*[^,]+,\s*\[([^\]]+)\]", content):
        used |= set(re.findall(r'"([^"]+)"', m.group(1)))

    for w in sorted(used):
        if w not in keys and w not in djs:
            # check if registered as function name key
            if f'"{w}"' not in djs and f"'{w}'" not in djs:
                errors.append(f"[widget] used but not registered: {w}")

    # new theorems should have demos
    expected_demo = {
        "fermat-little",
        "cauchy-schwarz",
        "bayes",
        "binomial",
        "law-of-cosines",
        "euler-bridges",
        "taylor",
        "sandwich",
    }
    for tid in expected_demo:
        if tid not in all_ids:
            errors.append(f"[demo] theorem missing: {tid}")
        elif f'data-widget="{tid}"' not in content and f'"{tid}"' not in content:
            # inject uses same name
            if f'inject("{tid}"' not in content and f"inject(\"{tid}\"" not in content:
                warnings.append(f"[demo] no inject for {tid}")


def check_index() -> None:
    idx = (BASE / "index.html").read_text(encoding="utf-8")
    for need in [
        "vendor/katex/katex.min.js",
        "vendor/katex/katex.min.css",
        "js/theorems.js",
        "js/theorems-extra.js",
        "js/theorems-more.js",
        "js/plain-talk.js",
        "js/formulas-patch.js",
        "js/diagrams.js",
        "js/diagrams-detail.js",
        "js/diagrams-more.js",
        "js/math-render.js",
        "js/main.js",
    ]:
        if need not in idx:
            errors.append(f"[index] missing script/link: {need}")
        else:
            # resolve path
            p = BASE / need
            if not p.exists():
                errors.append(f"[index] file missing on disk: {need}")

    # katex fonts
    fonts = BASE / "vendor" / "katex" / "fonts"
    if not fonts.exists() or not list(fonts.glob("*.woff2")):
        warnings.append("[katex] fonts folder empty or missing")


def check_main_js() -> None:
    main = read("main.js")
    if "renderDetail_UNUSED" in main:
        errors.append("[main] leftover UNUSED function still present")
    if "kickMath" not in main:
        warnings.append("[main] kickMath not found")
    # balanced braces
    if main.count("{") != main.count("}"):
        errors.append(f"[main] brace mismatch {{ {main.count('{')} }} {main.count('}')}")


def check_brace_files() -> None:
    for name in [
        "theorems.js",
        "theorems-extra.js",
        "theorems-more.js",
        "plain-talk.js",
        "formulas-patch.js",
        "math-render.js",
        "diagrams-more.js",
        "main.js",
    ]:
        t = read(name)
        if t.count("{") != t.count("}"):
            errors.append(f"[{name}] brace mismatch")


def check_formulas_patch_coverage(all_ids: list[str]) -> None:
    fp = read("formulas-patch.js")
    patched = set(re.findall(r'^\s*"?([a-z0-9-]+)"?\s*:\s*\{', fp, re.M))
    # also unquoted keys like bayes:
    patched |= set(re.findall(r"^\s*([a-z0-9-]+):\s*\{", fp, re.M))
    # filter noise
    patched = {p for p in patched if p not in {"statement", "setup", "lemmas", "proof", "function", "const"}}
    important = [
        "godel",
        "kakeya",
        "ftc",
        "fermat",
        "bayes",
        "fermat-little",
        "taylor",
        "sandwich",
        "binomial",
        "cauchy-schwarz",
        "law-of-cosines",
        "euler-bridges",
    ]
    for tid in important:
        if tid not in patched and tid in all_ids:
            # check if statement already has many data-latex
            warnings.append(f"[formulas-patch] no dedicated patch for {tid} (may still be OK)")


def main() -> int:
    check_index()
    check_main_js()
    check_brace_files()

    all_blocks: list[tuple[str, str]] = []
    for name in ["theorems.js", "theorems-extra.js", "theorems-more.js"]:
        all_blocks.extend(extract_object_blocks(read(name)))

    # dedupe by id keeping first
    seen = set()
    blocks = []
    for tid, b in all_blocks:
        if tid in seen:
            # later files may re-define? shouldn't
            if tid in extract_ids(read("theorems-more.js")) and name:
                pass
            continue
        # actually extra and more only push new - duplicate id is error
        seen.add(tid)
        blocks.append((tid, b))

    # detect duplicate ids across files
    id_lists = []
    for name in ["theorems.js", "theorems-extra.js", "theorems-more.js"]:
        id_lists.extend(extract_ids(read(name)))
    from collections import Counter

    c = Counter(id_lists)
    for tid, n in c.items():
        if n > 1:
            errors.append(f"[ids] duplicate id '{tid}' appears {n} times")

    all_ids = set(c.keys())
    print(f"Theorems: {len(all_ids)}")
    for tid in sorted(all_ids):
        # find block
        block = next((b for i, b in all_blocks if i == tid), "")
        if not block:
            # merge all blocks for id
            block = "".join(b for i, b in all_blocks if i == tid)
        check_block(tid, block)

    check_related_links(all_ids, [(i, "".join(b for x, b in all_blocks if x == i)) for i in all_ids])
    check_widgets(all_ids)
    check_formulas_patch_coverage(list(all_ids))

    # plain-talk keys
    pt = read("plain-talk.js")
    # spot common issues: unclosed template in patch
    if pt.count("`") % 2:
        warnings.append("[plain-talk] odd number of backticks")

    print("\n=== ERRORS ===")
    for e in errors:
        print("ERR:", e)
    print("\n=== WARNINGS ===")
    for w in warnings:
        print("WARN:", w)
    print(f"\n{len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
