# -*- coding: utf-8 -*-
from pathlib import Path
import re

JS = Path(__file__).resolve().parents[1] / "js"
for name in ["theorems.js", "theorems-extra.js", "theorems-more.js"]:
    p = JS / name
    t = p.read_text(encoding="utf-8")
    n = t.count("&lt;") + t.count("&gt;")
    if not n:
        print(name, "clean")
        continue
    # only inside data-latex attributes
    def fix(m):
        inner = m.group(1)
        inner = inner.replace("&lt;", "\\lt ").replace("&gt;", "\\gt ")
        inner = inner.replace("<", "\\lt ").replace(">", "\\gt ")
        # repair broken commands
        inner = inner.replace("\\gt rsim", "\\gtrsim")
        inner = inner.replace("\\lt rsim", "\\lesssim")
        # ensure commands doubled for template literals: turn \lt into \\lt if single
        tmp = inner.replace("\\\\", "\x00")
        for c in ("lt", "gt", "le", "ge", "gtrsim", "lesssim", "delta", "varepsilon", "theta", "omega", "pi", "to", "in", "cdot", "times", "infty", "sum", "int", "frac", "dfrac", "text", "mathrm", "mathbb", "sin", "cos", "log", "neg", "forall", "exists", "subset", "cup", "cap", "approx", "equiv", "sim", "pmod", "bmod", "quad", "qquad", "bigl", "bigr", "Bigl", "Bigr", "langle", "rangle", "mid", "prod", "sqrt", "partial", "alpha", "beta", "gamma", "lambda", "mu", "sigma", "tau", "xi", "chi", "psi", "varphi", "phi", "dim", "ln", "mod", "operatorname", "ulcorner", "urcorner", "coloneqq", "leftrightarrow", "Rightarrow", "Leftrightarrow", "nvdash", "vdash", "models"):
            tmp = re.sub(r"(?<!\x00)\\" + c + r"(?![a-zA-Z])", "\x00" + c, tmp)
            tmp = tmp.replace("\\" + c, "\x00" + c)
        out = tmp.replace("\x00", "\\\\")
        while "\\\\\\\\" in out:
            out = out.replace("\\\\\\\\", "\\\\")
        return 'data-latex="' + out + '"'

    t2 = re.sub(r'data-latex="([^"]*)"', fix, t)
    # also replace remaining &lt; outside attrs in HTML body (as text) - leave as ≤ via unicode if in prose
    t2 = t2.replace("&lt;", "≤").replace("&gt;", "≥")
    p.write_text(t2, encoding="utf-8")
    print(name, "fixed", n, "entities")
