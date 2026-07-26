/**
 * KaTeX 公式渲染 — 本地优先、失败可见、可重复调用
 */
window.MathRender = (function () {
  const SUB = {
    "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
    "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
    "ₐ": "a", "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₖ": "k",
    "ₙ": "n", "ₘ": "m", "ₚ": "p", "ₛ": "s", "ₜ": "t", "ₓ": "x"
  };
  const SUP = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
    "ⁿ": "n", "ᵏ": "k", "ᵐ": "m", "⁺": "+", "⁻": "-"
  };

  let lastRoot = null;

  function packRuns(s, map, wrap) {
    let out = "", i = 0;
    while (i < s.length) {
      if (map[s[i]] !== undefined) {
        let buf = "";
        while (i < s.length && map[s[i]] !== undefined) {
          buf += map[s[i]];
          i++;
        }
        out += wrap(buf);
      } else out += s[i++];
    }
    return out;
  }

  function decodeEntities(s) {
    return String(s)
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  function toLatex(input) {
    if (!input) return "";
    let s = decodeEntities(String(input)).trim();
    const mostlyLatex = /\\[a-zA-Z]+/.test(s);

    s = s.replace(/\r\n/g, "\n").replace(/\n+/g, " \\\\ ");

    if (!mostlyLatex) {
      const pairs = [
        [/∬/g, "\\iint "],
        [/∫_\{([^}]+)\}\^\{([^}]+)\}/g, "\\int_{$1}^{$2}"],
        [/∫_\{([^}]+)\}/g, "\\int_{$1}"],
        [/∫_([A-Za-z0-9π∞∂\\+\-]+)\^([A-Za-z0-9π∞∂\\+\-]+)/g, "\\int_{$1}^{$2}"],
        [/∫_([A-Za-z0-9π∞∂\\+\-]+)/g, "\\int_{$1}"],
        [/∫/g, "\\int "],
        [/∑_\{([^}]+)\}\^\{([^}]+)\}/g, "\\sum_{$1}^{$2}"],
        [/∑_\{([^}]+)\}/g, "\\sum_{$1}"],
        [/∑_([A-Za-z0-9]+)\^([A-Za-z0-9∞\\]+)/g, "\\sum_{$1}^{$2}"],
        [/∑_([A-Za-z0-9]+)/g, "\\sum_{$1}"],
        [/∑/g, "\\sum "],
        [/∏/g, "\\prod "],
        [/√\(([^)]+)\)/g, "\\sqrt{$1}"],
        [/√([A-Za-z0-9]+)/g, "\\sqrt{$1}"],
        [/√/g, "\\sqrt{}"],
        [/∂/g, "\\partial "],
        [/∞/g, "\\infty "],
        [/π/g, "\\pi "],
        [/θ/g, "\\theta "],
        [/δ/g, "\\delta "],
        [/ε/g, "\\varepsilon "],
        [/ξ/g, "\\xi "],
        [/χ/g, "\\chi "],
        [/ψ/g, "\\psi "],
        [/ω/g, "\\omega "],
        [/α/g, "\\alpha "],
        [/β/g, "\\beta "],
        [/γ/g, "\\gamma "],
        [/λ/g, "\\lambda "],
        [/μ/g, "\\mu "],
        [/σ/g, "\\sigma "],
        [/τ/g, "\\tau "],
        [/ℝ/g, "\\mathbb{R}"],
        [/ℤ/g, "\\mathbb{Z}"],
        [/ℕ/g, "\\mathbb{N}"],
        [/ℚ/g, "\\mathbb{Q}"],
        [/ℂ/g, "\\mathbb{C}"],
        [/𝔻/g, "\\mathbb{D}"],
        [/Σ/g, "\\Sigma "],
        [/Δ/g, "\\Delta "],
        [/∄/g, "\\nexists "],
        [/∃/g, "\\exists "],
        [/∀/g, "\\forall "],
        [/∈/g, "\\in "],
        [/∉/g, "\\notin "],
        [/⊂/g, "\\subset "],
        [/⊆/g, "\\subseteq "],
        [/∪/g, "\\cup "],
        [/∩/g, "\\cap "],
        [/⋃/g, "\\bigcup "],
        [/⋂/g, "\\bigcap "],
        [/≤/g, "\\le "],
        [/≥/g, "\\ge "],
        [/≠/g, "\\ne "],
        [/≈/g, "\\approx "],
        [/∼/g, "\\sim "],
        [/≍/g, "\\asymp "],
        [/≲/g, "\\lesssim "],
        [/≳/g, "\\gtrsim "],
        [/→/g, "\\to "],
        [/⇒/g, "\\Rightarrow "],
        [/⇔/g, "\\Leftrightarrow "],
        [/·/g, "\\cdot "],
        [/×/g, "\\times "],
        [/±/g, "\\pm "],
        [/⋯/g, "\\cdots "],
        [/…/g, "\\ldots "],
        [/∘/g, "\\circ "],
        [/⟨/g, "\\langle "],
        [/⟩/g, "\\rangle "],
        [/−/g, "-"],
        [/–/g, "-"],
        [/—/g, "-"],
        [/′/g, "'"],
        [/≡/g, "\\equiv "],
        [/⊬/g, "\\nvdash "],
        [/⊢/g, "\\vdash "],
        [/⊨/g, "\\models "],
        [/⊭/g, "\\nvDash "],
        [/¬/g, "\\neg "],
        [/↔/g, "\\leftrightarrow "],
        [/⇔/g, "\\Leftrightarrow "],
        [/⇒/g, "\\Rightarrow "],
        [/≔/g, "\\coloneqq "],
        [/⌜/g, "\\ulcorner "],
        [/⌝/g, "\\urcorner "],
        [/φ/g, "\\varphi "],
        [/ϕ/g, "\\phi "],
        [/ψ/g, "\\psi "],
        [/ω/g, "\\omega "],
        [/dim_H/g, "\\dim_H "],
        [/dim_M/g, "\\dim_M "],
        [/Provable_T/g, "\\mathrm{Provable}_T"],
        [/Proof_T/g, "\\mathrm{Proof}_T"],
        [/Con\\(T\\)/g, "\\mathrm{Con}(T)"],
        [/Con\\(T\\)/g, "\\mathrm{Con}(T)"]
      ];
      for (const [re, rep] of pairs) s = s.replace(re, rep);
      s = packRuns(s, SUB, (b) => `_{${b}}`);
      s = packRuns(s, SUP, (b) => `^{${b}}`);
      // 仅当尚未被 \text 包住时再包中文
      s = s.replace(/(?<![\\])([\u4e00-\u9fff]+)/g, (m) => `\\text{${m}}`);
    }

    s = s.replace(/\s+/g, " ").trim();
    return s;
  }

  function prettyFallback(latex) {
    return latex
      .replace(/\\mathbb\{R\}/g, "ℝ")
      .replace(/\\mathbb\{Z\}/g, "ℤ")
      .replace(/\\int/g, "∫")
      .replace(/\\sum/g, "∑")
      .replace(/\\prod/g, "∏")
      .replace(/\\le /g, "≤ ")
      .replace(/\\ge /g, "≥ ")
      .replace(/\\to /g, "→ ")
      .replace(/\\cdot /g, "· ")
      .replace(/\\infty/g, "∞")
      .replace(/\\pi /g, "π ")
      .replace(/\\,/g, " ")
      .replace(/\\ /g, " ")
      .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
      .replace(/\\text\{([^}]*)\}/g, "$1")
      .replace(/\\subseteq/g, "⊆")
      .replace(/\\subset/g, "⊂")
      .replace(/\\in /g, "∈ ")
      .replace(/\\forall/g, "∀")
      .replace(/\\exists/g, "∃")
      .replace(/\\dim_H/g, "dim_H")
      .replace(/\\,/g, " ");
  }

  function renderEl(el, display) {
    if (!el) return;

    const attr = el.getAttribute("data-latex");
    let raw = attr != null && attr !== "" ? attr : el.textContent || "";
    raw = decodeEntities(raw).trim();
    // 若已是 katex 成功渲染则跳过
    if (el.classList.contains("math-done") && el.querySelector(".katex-html, .katex")) return;

    if (!raw) {
      el.innerHTML = '<span class="math-miss">（空公式）</span>';
      return;
    }

    let latex = attr != null && attr !== "" ? decodeEntities(attr) : toLatex(raw);
    latex = latex.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

    if (!window.katex) {
      el.textContent = prettyFallback(latex);
      el.classList.add("math-fallback");
      return;
    }

    try {
      // 清空再渲，避免叠层
      el.textContent = "";
      window.katex.render(latex, el, {
        displayMode: !!display,
        throwOnError: false,
        strict: "ignore",
        trust: false,
        output: "html"
      });
      // 若 KaTeX 解析失败会生成 .katex-error
      if (el.querySelector(".katex-error") || !el.querySelector(".katex")) {
        el.innerHTML = "";
        const span = document.createElement("code");
        span.className = "math-fallback";
        span.textContent = prettyFallback(latex);
        span.title = "LaTeX: " + latex;
        el.appendChild(span);
      } else {
        el.classList.add("math-done");
        el.classList.remove("math-fallback");
      }
    } catch (e) {
      el.textContent = prettyFallback(latex);
      el.classList.add("math-fallback");
      el.title = String(e && e.message ? e.message : e);
    }
  }

  function renderInlineSpans(root) {
    root.querySelectorAll("span[data-latex], [data-latex]").forEach((el) => {
      if (el.classList.contains("formula") || el.classList.contains("calc-line") || el.classList.contains("ix-formula"))
        return;
      renderEl(el, el.getAttribute("data-display") === "1");
    });
  }

  function walkText(root) {
    if (!window.katex) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest("script,style,.katex,.math-done,.math-fallback,.formula,.calc-line,.ix-svg,svg,code,pre,.ix-card,.math-miss"))
          return NodeFilter.FILTER_REJECT;
        if (p.hasAttribute && p.hasAttribute("data-latex")) return NodeFilter.FILTER_REJECT;
        const t = node.nodeValue;
        if (/[∫∑∏√≤≥≠≈∈→⇒·×±∞πθδελξχψ∂ℕℤℚℝℂ]|[₀-₉⁰-⁹]|dim_[HM]/.test(t))
          return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((textNode) => {
      const text = textNode.nodeValue;
      const pattern =
        /(?:dim_[HM]\s*[A-Za-z][^\s，。；;]{0,24}|[∫∑][^，。；;\n]{1,50}|[A-Za-z][A-Za-z0-9_]*\s*=\s*[^，。；;\n]{1,40})/g;
      const parts = [];
      let last = 0;
      let m;
      while ((m = pattern.exec(text)) !== null) {
        if (m.index > last) parts.push({ t: text.slice(last, m.index), math: false });
        parts.push({ t: m[0], math: true });
        last = m.index + m[0].length;
      }
      if (last < text.length) parts.push({ t: text.slice(last), math: false });
      if (!parts.some((p) => p.math)) return;

      const frag = document.createDocumentFragment();
      parts.forEach((p) => {
        if (!p.math) {
          frag.appendChild(document.createTextNode(p.t));
          return;
        }
        const span = document.createElement("span");
        span.className = "math-inline";
        try {
          window.katex.render(toLatex(p.t.trim()), span, {
            displayMode: false,
            throwOnError: false,
            strict: "ignore"
          });
        } catch (e) {
          span.textContent = p.t;
        }
        frag.appendChild(span);
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  function render(root) {
    if (!root) return;
    lastRoot = root;

    const run = () => {
      root.querySelectorAll(".formula, .ix-formula").forEach((el) => {
        el.classList.remove("math-done");
        renderEl(el, true);
      });
      root.querySelectorAll(".calc-line").forEach((el) => {
        el.classList.remove("math-done");
        renderEl(el, true);
      });
      renderInlineSpans(root);
      const article = root.querySelector(".article");
      if (article) walkText(article);
    };

    if (window.katex) {
      run();
      return;
    }

    // 先显示 fallback，等 KaTeX 就绪再正式渲染
    run();
    let n = 0;
    const id = setInterval(() => {
      n++;
      if (window.katex) {
        clearInterval(id);
        run();
        return;
      }
      if (n > 150) clearInterval(id);
    }, 40);
  }

  // KaTeX 脚本 onload 时再渲一次
  window.__mathRenderKick = function () {
    if (lastRoot) render(lastRoot);
    else if (document.getElementById("app")) render(document.getElementById("app"));
  };

  return { toLatex, render, whenReady: (cb) => (window.katex ? cb() : setTimeout(cb, 300)) };
})();
