/**
 * 物理定理交互演示
 */
(function () {
  if (!window.Diagrams || !window.Diagrams.widgets) return;
  const W = window.Diagrams.widgets;

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function card(title, desc) {
    const wrap = el(`<div class="ix-card ix-pro"></div>`);
    wrap.innerHTML = `
      <div class="ix-head"><div>
        <div class="ix-title">${title}</div>
        <p class="ix-desc">${desc}</p>
      </div><span class="ix-badge">物理</span></div>
      <div class="ix-controls" data-ctrl></div>
      <div class="ix-stage">
        <svg viewBox="0 0 640 300" class="ix-svg" data-svg></svg>
        <div class="ix-side" data-side></div>
      </div>
      <div class="ix-readout" data-out></div>`;
    return {
      wrap,
      ctrl: wrap.querySelector("[data-ctrl]"),
      svg: wrap.querySelector("[data-svg]"),
      side: wrap.querySelector("[data-side]"),
      out: wrap.querySelector("[data-out]")
    };
  }
  function range(ctrl, key, label, min, max, val) {
    const lab = document.createElement("label");
    lab.innerHTML = `${label} <span data-v="${key}">${val}</span>
      <input type="range" min="${min}" max="${max}" value="${val}" data-k="${key}"/>`;
    ctrl.appendChild(lab);
    return lab.querySelector("input");
  }
  function bind(wrap, draw) {
    wrap.querySelectorAll("input").forEach((i) =>
      i.addEventListener("input", () => {
        const sp = wrap.querySelector(`[data-v="${i.dataset.k}"]`);
        if (sp) sp.textContent = i.value;
        draw();
      })
    );
  }

  W["newton-fma"] = function () {
    const ui = card("F=ma 演示", "固定质量，拖力；或固定力，拖质量——看加速度");
    const mIn = range(ui.ctrl, "m", "质量 m", 1, 20, 5);
    const fIn = range(ui.ctrl, "F", "力 F", 0, 100, 20);
    function draw() {
      const m = +mIn.value,
        F = +fIn.value;
      const a = F / m;
      const bar = Math.min(220, a * 12);
      ui.svg.innerHTML = `
        <rect width="640" height="300" fill="#0b1220"/>
        <rect x="80" y="120" width="80" height="60" rx="8" fill="#60a5fa"/>
        <text x="120" y="155" text-anchor="middle" fill="#0f172a" font-size="14">m=${m}</text>
        <path d="M170 150 L${180 + bar} 150" stroke="#facc15" stroke-width="4" marker-end="url(#a)"/>
        <defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0L6,3L0,6" fill="#facc15"/></marker></defs>
        <text x="200" y="100" fill="#facc15" font-size="16">a = F/m = ${a.toFixed(2)}</text>
        <text x="80" y="230" fill="#94a3b8" font-size="13">箭头长度 ∝ 加速度</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>F</span><b>${F}</b></div>
        <div class="ix-kv"><span>m</span><b>${m}</b></div>
        <div class="ix-kv hi"><span>a</span><b>${a.toFixed(2)}</b></div>
        <p class="ix-note">力越大加速越猛；质量越大越「迟钝」。</p>`;
      ui.out.textContent = "牛顿第二定律：F = ma（质量恒定）。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["ideal-gas-demo"] = function () {
    const ui = card("理想气体 PV=nRT", "固定 n、R：拖 P、V 看 T；或等温看反比");
    const pIn = range(ui.ctrl, "P", "压强 P", 1, 20, 5);
    const vIn = range(ui.ctrl, "V", "体积 V", 1, 20, 8);
    const n = 1,
      R = 1; // 自然单位
    function draw() {
      const P = +pIn.value,
        V = +vIn.value;
      const T = (P * V) / (n * R);
      const maxR = 80;
      const r = 20 + (V / 20) * maxR;
      ui.svg.innerHTML = `
        <rect width="640" height="300" fill="#0b1220"/>
        <rect x="80" y="${200 - r * 1.2}" width="${60 + r}" height="${r * 1.2}" rx="8"
          fill="rgba(96,165,250,0.25)" stroke="#60a5fa" stroke-width="2"/>
        <text x="100" y="240" fill="#94a3b8" font-size="13">容器体积 ~ V</text>
        <text x="320" y="100" fill="#facc15" font-size="18">T = PV/(nR) = ${T.toFixed(2)}</text>
        <text x="320" y="140" fill="#e2e8f0" font-size="14">等温时 P↑ 则 V↓</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>P</span><b>${P}</b></div>
        <div class="ix-kv"><span>V</span><b>${V}</b></div>
        <div class="ix-kv hi"><span>T</span><b>${T.toFixed(2)}</b></div>
        <p class="ix-note">单位已简化；关系形状与真实气体理想模型一致。</p>`;
      ui.out.textContent = "PV = nRT。压大或体积大 → 温度（动能）高。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["relativity-gamma"] = function () {
    const ui = card("狭义相对论 · γ 因子", "拖速度 v（相对光速），看时间膨胀因子 γ");
    const vIn = range(ui.ctrl, "v", "v/c %", 0, 99, 60);
    function draw() {
      const beta = +vIn.value / 100;
      const g = 1 / Math.sqrt(1 - beta * beta);
      const bar = Math.min(260, (g - 1) * 40);
      ui.svg.innerHTML = `
        <rect width="640" height="300" fill="#0b1220"/>
        <text x="40" y="50" fill="#94a3b8" font-size="14">γ = 1/√(1−v²/c²)</text>
        <rect x="40" y="100" width="400" height="28" rx="8" fill="#1e293b"/>
        <rect x="40" y="100" width="${40 + bar}" height="28" rx="8" fill="#a78bfa"/>
        <text x="40" y="160" fill="#facc15" font-size="20">γ ≈ ${g.toFixed(3)}</text>
        <text x="40" y="200" fill="#e2e8f0" font-size="14">运动时钟变慢：Δt = γ Δt₀</text>
        <text x="40" y="230" fill="#94a3b8" font-size="13">长度收缩：L = L₀/γ</text>
        <text x="40" y="270" fill="#94a3b8" font-size="13">v→c 时 γ→∞，有质量物体到不了光速</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>v/c</span><b>${beta.toFixed(2)}</b></div>
        <div class="ix-kv hi"><span>γ</span><b>${g.toFixed(3)}</b></div>
        <div class="ix-kv"><span>1 秒变</span><b>${g.toFixed(2)} 秒</b></div>
        <p class="ix-note">低速 γ≈1，回到牛顿。</p>`;
      ui.out.textContent = "E=γmc²；静止能量 E₀=mc²。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["carnot"] = function () {
    const ui = card("卡诺效率上限", "拖高温/低温热源温度，看热机效率上限 1−Tc/Th");
    const th = range(ui.ctrl, "th", "Th (K)", 300, 900, 600);
    const tc = range(ui.ctrl, "tc", "Tc (K)", 200, 400, 300);
    function draw() {
      let Th = +th.value,
        Tc = +tc.value;
      if (Tc >= Th) Tc = Th - 1;
      const eta = 1 - Tc / Th;
      ui.svg.innerHTML = `
        <rect width="640" height="300" fill="#0b1220"/>
        <rect x="100" y="60" width="120" height="80" rx="10" fill="#ef4444" opacity="0.8"/>
        <text x="160" y="105" text-anchor="middle" fill="#fff" font-size="14">Th=${Th}K</text>
        <rect x="100" y="180" width="120" height="80" rx="10" fill="#3b82f6" opacity="0.8"/>
        <text x="160" y="225" text-anchor="middle" fill="#fff" font-size="14">Tc=${Tc}K</text>
        <path d="M230 100 L320 100 L320 220 L230 220" fill="none" stroke="#facc15" stroke-width="2"/>
        <text x="340" y="160" fill="#facc15" font-size="18">η ≤ ${(eta * 100).toFixed(1)}%</text>
        <text x="340" y="200" fill="#94a3b8" font-size="13">η = 1 − Tc/Th</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>Th</span><b>${Th} K</b></div>
        <div class="ix-kv"><span>Tc</span><b>${Tc} K</b></div>
        <div class="ix-kv hi"><span>η_max</span><b>${(eta * 100).toFixed(1)}%</b></div>
        <p class="ix-note">第二定律：不可能 100% 把热变成功（Tc>0）。</p>`;
      ui.out.textContent = "热力学第二定律 → 卡诺效率上限。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["maxwell-c"] = function () {
    const ui = card("麦克斯韦 · 光速", "电磁波波速 c = 1/√(μ₀ε₀)");
    const ui2 = ui;
    ui.ctrl.innerHTML = "<p style='color:#94a3b8;font-size:0.9rem;margin:0'>真空常量估算（示意）</p>";
    const c = 2.998e8;
    ui.svg.innerHTML = `
      <rect width="640" height="300" fill="#0b1220"/>
      <text x="40" y="70" fill="#e2e8f0" font-size="16">∇×E = −∂B/∂t　·　∇×B = μ₀ε₀ ∂E/∂t</text>
      <text x="40" y="120" fill="#60a5fa" font-size="15">取旋度 → 波动方程</text>
      <text x="40" y="170" fill="#facc15" font-size="20">c = 1/√(μ₀ε₀) ≈ 3.00×10⁸ m/s</text>
      <text x="40" y="220" fill="#94a3b8" font-size="14">与光学测量光速一致 → 光是电磁波</text>
      <text x="40" y="260" fill="#4ade80" font-size="13">赫兹实验验证了电磁波的存在</text>`;
    ui.side.innerHTML = `<div class="ix-kv hi"><span>c</span><b>3×10⁸</b></div>
      <p class="ix-note">四条方程统一电、磁、光。</p>`;
    ui.out.textContent = "麦克斯韦理论最炫的预言：电磁波以光速传播。";
    return ui.wrap;
  };

  // inject into physics theorems
  const T = window.THEOREMS || [];
  function inject(id, widget) {
    const th = T.find((t) => t.id === id);
    if (!th || !th.sections || !th.sections.proof) return;
    if (th.sections.proof.includes(`data-widget="${widget}"`)) return;
    th.sections.proof = `<div class="interactive" data-widget="${widget}"></div>` + th.sections.proof;
  }
  inject("newton-laws", "newton-fma");
  inject("ideal-gas", "ideal-gas-demo");
  inject("relativity-sr", "relativity-gamma");
  inject("thermo-2", "carnot");
  inject("maxwell", "maxwell-c");

  console.info("diagrams-physics: ok");
})();
