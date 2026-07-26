# -*- coding: utf-8 -*-
"""Fix broken LaTeX escapes inside theorems.js template literals."""
from pathlib import Path
import re

p = Path(__file__).resolve().parents[1] / "js" / "theorems.js"
t = p.read_text(encoding="utf-8")

# Broken by previous entity fix
t = t.replace("\\gt rsim", "\\gtrsim")
t = t.replace("\\lt rsim", "\\lesssim")  # just in case

# Inside data-latex="...", ensure \lt \gt \le etc. have double backslash for JS templates
# Pattern: data-latex="...."
def fix_attr(m):
    inner = m.group(1)
    # normalize mistaken single-backslash latex cmds that are invalid JS escapes
    # First, protect already doubled
    # Replace bare \lt that isn't \\lt
    # Work on a copy where we temporarily mark \\\\
    tmp = inner.replace("\\\\", "\x00")
    # Now single \ before lt/gt/le/ge/to/... 
    cmds = [
        "lt", "gt", "le", "ge", "to", "in", "cdot", "times", "pm",
        "infty", "pi", "theta", "delta", "varepsilon", "xi", "chi",
        "psi", "omega", "alpha", "beta", "gamma", "lambda", "mu", "sigma",
        "tau", "partial", "sum", "prod", "int", "iint", "sqrt", "frac",
        "dfrac", "text", "mathrm", "operatorname", "mathbb", "quad",
        "qquad", "sim", "approx", "equiv", "ne", "neq", "nvdash", "vdash",
        "models", "neg", "forall", "exists", "subset", "subseteq", "cup",
        "cap", "bigcup", "bigcap", "lesssim", "gtrsim", "langle", "rangle",
        "lceil", "rceil", "lfloor", "rfloor", "coloneqq", "leftrightarrow",
        "Rightarrow", "Leftrightarrow", "mapsto", "circ", "sin", "cos", "log",
        "ln", "dim", "bigl", "bigr", "Bigl", "Bigr", "left", "right",
        "overline", "underline", "hat", "bar", "vec", "cdot", "bmod",
        "pmod", "mod", "ulcorner", "urcorner", "varphi", "phi", "ell",
        "emptyset", "nabla", "ast", "star", "bullet", "dots", "cdots",
        "ldots", "vdots", "ddots", "mid", "parallel", "perp", "angle",
    ]
    for c in sorted(cmds, key=len, reverse=True):
        tmp = re.sub(r"(?<![\\a-zA-Z])\\" + c + r"(?![a-zA-Z])", "\x00" + c, tmp)
        # also bare command without backslash written as \lt already consumed
        # fix cases where \l became just from invalid - we have literal \lt as backslash+lt
        tmp = tmp.replace("\\" + c, "\x00" + c)
    # After mark, restore as \\\\cmd in source file so template gives \\cmd? 
    # File content inside `...`: we need \\lt in file so runtime string has \lt
    # So write \\\\lt in the replacement for the file? 
    # When Python writes to file the string "\\lt" is two chars \ and l,t - correct for template literal source.
    # In Python: "\\\\lt" written to file is \\lt (two backslashes + lt) which in JS template becomes \lt - GOOD
    # In Python: "\\lt" written to file is \lt (one backslash) which in JS template may be invalid escape
    out = tmp.replace("\x00", "\\\\")
    # undo over-doubling: \\\\\\\\ → \\\\
    while "\\\\\\\\" in out:
        out = out.replace("\\\\\\\\", "\\\\")
    return 'data-latex="' + out + '"'

t2 = re.sub(r'data-latex="([^"]*)"', fix_attr, t)

# Also fix span data-latex the same way
t2 = re.sub(r'data-latex="([^"]*)"', fix_attr, t2)

p.write_text(t2, encoding="utf-8")
print("done")
# show a few
for line in t2.splitlines():
    if "data-latex=" in line and ("lt" in line or "gtrsim" in line or "int" in line):
        if "ftc" in line.lower() or "varepsilon" in line or "gtrsim" in line or "A(x)" in line:
            print(line[:200])
