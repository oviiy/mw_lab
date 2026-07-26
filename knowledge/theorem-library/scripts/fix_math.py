# -*- coding: utf-8 -*-
"""Convert plain math in theorems*.js to data-latex attributes for KaTeX."""
from pathlib import Path
import re
import html as htmlmod

ROOT = Path(__file__).resolve().parents[1]
FILES = [ROOT / "js" / "theorems.js", ROOT / "js" / "theorems-extra.js"]

SUB = str.maketrans({
    "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
    "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
    "ₐ": "a", "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₖ": "k",
    "ₙ": "n", "ₘ": "m", "ₚ": "p", "ₛ": "s", "ₜ": "t", "ₓ": "x",
})
SUP = str.maketrans({
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
    "ⁿ": "n", "ᵏ": "k", "ᵐ": "m", "⁺": "+", "⁻": "-",
})


def pack_runs(s, table, wrap):
    out = []
    i = 0
    while i < len(s):
        ch = s[i]
        if ch in table:
            buf = []
            while i < len(s) and s[i] in table:
                buf.append(table[s[i]])
                i += 1
            out.append(wrap("".join(buf)))
        else:
            out.append(ch)
            i += 1
    return "".join(out)


def to_latex(raw: str) -> str:
    s = raw.strip()
    s = s.replace("\r\n", "\n").replace("\n", " \\\\ ")
    pairs = [
        (r"∬_\{([^}]+)\}", r"\\iint_{\1}"),
        (r"∬_(\w+)", r"\\iint_{\1}"),
        (r"∬", r"\\iint "),
        (r"∫_\{([^}]+)\}\^\{([^}]+)\}", r"\\int_{\1}^{\2}"),
        (r"∫_\{([^}]+)\}", r"\\int_{\1}"),
        (r"∫_([A-Za-z0-9π∞∂\\+−\-]+)\^([A-Za-z0-9π∞∂\\+−\-]+)", r"\\int_{\1}^{\2}"),
        (r"∫_([A-Za-z0-9π∞∂\\+−\-]+)", r"\\int_{\1}"),
        (r"∫", r"\\int "),
        (r"∑_\{([^}]+)\}\^\{([^}]+)\}", r"\\sum_{\1}^{\2}"),
        (r"∑_\{([^}]+)\}", r"\\sum_{\1}"),
        (r"∑_([A-Za-z0-9]+)\^([A-Za-z0-9∞\\]+)", r"\\sum_{\1}^{\2}"),
        (r"∑_([A-Za-z0-9]+)", r"\\sum_{\1}"),
        (r"∑", r"\\sum "),
        (r"∏_\{([^}]+)\}", r"\\prod_{\1}"),
        (r"∏", r"\\prod "),
        (r"√\(([^)]+)\)", r"\\sqrt{\1}"),
        (r"√([A-Za-z0-9]+)", r"\\sqrt{\1}"),
        (r"√", r"\\sqrt{}"),
        (r"∂", r"\\partial "),
        (r"∞", r"\\infty "),
        (r"π", r"\\pi "),
        (r"θ", r"\\theta "),
        (r"δ", r"\\delta "),
        (r"ε", r"\\varepsilon "),
        (r"ξ", r"\\xi "),
        (r"χ", r"\\chi "),
        (r"ψ", r"\\psi "),
        (r"ω", r"\\omega "),
        (r"α", r"\\alpha "),
        (r"β", r"\\beta "),
        (r"γ", r"\\gamma "),
        (r"λ", r"\\lambda "),
        (r"μ", r"\\mu "),
        (r"σ", r"\\sigma "),
        (r"τ", r"\\tau "),
        (r"ℝ", r"\\mathbb{R}"),
        (r"ℤ", r"\\mathbb{Z}"),
        (r"ℕ", r"\\mathbb{N}"),
        (r"ℚ", r"\\mathbb{Q}"),
        (r"ℂ", r"\\mathbb{C}"),
        (r"𝔻", r"\\mathbb{D}"),
        (r"Σ", r"\\Sigma "),
        (r"Δ", r"\\Delta "),
        (r"∄", r"\\nexists "),
        (r"∃", r"\\exists "),
        (r"∀", r"\\forall "),
        (r"∈", r"\\in "),
        (r"∉", r"\\notin "),
        (r"⊂", r"\\subset "),
        (r"⊆", r"\\subseteq "),
        (r"∪", r"\\cup "),
        (r"∩", r"\\cap "),
        (r"⋃", r"\\bigcup "),
        (r"⋂", r"\\bigcap "),
        (r"≤", r"\\le "),
        (r"≥", r"\\ge "),
        (r"≠", r"\\ne "),
        (r"≈", r"\\approx "),
        (r"∼", r"\\sim "),
        (r"≍", r"\\asymp "),
        (r"≲", r"\\lesssim "),
        (r"≳", r"\\gtrsim "),
        (r"→", r"\\to "),
        (r"⇒", r"\\Rightarrow "),
        (r"⇔", r"\\Leftrightarrow "),
        (r"·", r"\\cdot "),
        (r"×", r"\\times "),
        (r"±", r"\\pm "),
        (r"⋯", r"\\cdots "),
        (r"…", r"\\ldots "),
        (r"∘", r"\\circ "),
        (r"⟨", r"\\langle "),
        (r"⟩", r"\\rangle "),
        (r"⌈", r"\\lceil "),
        (r"⌉", r"\\rceil "),
        (r"⌊", r"\\lfloor "),
        (r"⌋", r"\\rfloor "),
        (r"−", r"-"),
        (r"–", r"-"),
        (r"—", r"-"),
        (r"′", r"'"),
        (r"≡", r"\\equiv "),
        (r"≪", r"\\ll "),
        (r"≫", r"\\gg "),
        (r"⊢", r"\\vdash "),
        (r"¬", r"\\neg "),
        (r"↔", r"\\leftrightarrow "),
        (r"⌜", r"\\ulcorner "),
        (r"⌝", r"\\urcorner "),
    ]
    for pat, rep in pairs:
        s = re.sub(pat, rep, s)
    # unicode sub/sup runs
    sub_chars = set("₀₁₂₃₄₅₆₇₈₉ₐₑᵢⱼₖₙₘₚₛₜₓ")
    sup_chars = set("⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏᵐ⁺⁻")

    def pack(s, chars, wrap):
        out = []
        i = 0
        while i < len(s):
            if s[i] in chars:
                buf = []
                while i < len(s) and s[i] in chars:
                    buf.append(s[i].translate(SUB if chars is sub_chars else SUP))
                    i += 1
                out.append(wrap("".join(buf)))
            else:
                out.append(s[i])
                i += 1
        return "".join(out)

    s = pack(s, sub_chars, lambda b: "_{%s}" % b)
    s = pack(s, sup_chars, lambda b: "^{%s}" % b)
    # a^b already ascii carets for S^{n-1} broken as S^{n-1} in source - handle ^{...}
    s = re.sub(r"\^\{([^}]+)\}", r"^{\1}", s)
    s = re.sub(r"_\{([^}]+)\}", r"_{\1}", s)
    # Chinese to \text
    def zh(m):
        t = m.group(0)
        if re.fullmatch(r"[\s.,;:!?，。；：、（）()\-]+", t):
            return t
        return r"\text{%s}" % t

    s = re.sub(r"[\u4e00-\u9fff]+", zh, s)
    s = re.sub(r"\s+", " ", s).strip()
    # escape for HTML attribute: backslash stays, quote escape
    return s


def fix_block(tag, content):
    """Replace <div class="TAG">inner</div> without data-latex."""
    pattern = re.compile(
        rf'<div class="{tag}"(?![^>]*data-latex)>(.*?)</div>',
        re.DOTALL,
    )

    def repl(m):
        inner = m.group(1).strip()
        # skip empty or already katex
        if not inner or "katex" in inner or "data-latex" in m.group(0):
            return m.group(0)
        # strip nested tags lightly
        plain = re.sub(r"<[^>]+>", "", inner)
        plain = htmlmod.unescape(plain).strip()
        if not plain:
            return m.group(0)
        latex = to_latex(plain)
        # HTML attr escape
        latex_attr = (
            latex.replace("\\", "\\\\")
            .replace('"', "&quot;")
            .replace("<", "&lt;")
        )
        # In JS template strings we need \\ for backslash in the file source.
        # The file is JS - content is inside backticks. When we write data-latex="\\int"
        # the browser gets \int. In the .js file as regular string content in template:
        # data-latex="\\int"  -> HTML attribute \int  CORRECT for reading from DOM
        # Actually in JS template literal: `data-latex="\\int"` yields HTML data-latex="\int"
        # Wait: in a .js file the content is:
        #   <div class="formula" data-latex="a^{2}">
        # inside template literal `...`, \\ becomes \, so we need \\\\ for one \ in output HTML? 
        # Template literal: `\\` -> `\`, so data-latex="\\int" in source -> attribute value `\int` good for katex.
        # to_latex returns `\int` as two chars backslash+int. When writing to JS file:
        # we need to escape backslashes for the JS source: each \ -> \\
        latex_js = latex.replace("\\", "\\\\").replace('"', '\\"')
        return f'<div class="{tag}" data-latex="{latex_js}"></div>'

    return pattern.sub(repl, content)


# Also fix broken S^{n-1} style in paragraphs: S^{n−1} in source
def inject_inline_spans(content):
    """Optional: leave paragraphs; math-render handles more now."""
    return content


def process_file(path: Path):
    text = path.read_text(encoding="utf-8")
    orig = text
    text = fix_block("formula", text)
    text = fix_block("calc-line", text)
    if text != orig:
        path.write_text(text, encoding="utf-8")
        print(f"updated {path.name}")
    else:
        print(f"no change {path.name}")


def main():
    for f in FILES:
        if f.exists():
            process_file(f)
        else:
            print("missing", f)


if __name__ == "__main__":
    main()
