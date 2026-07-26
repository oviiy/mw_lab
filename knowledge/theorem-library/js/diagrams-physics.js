/**
 * 物理定理交互演示 / 图解
 * 注册到 Diagrams.widgets，并注入各物理条目的 proof 区
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
  function range(ctrl, key, label, min, max, val, step) {
    const lab = document.createElement("label");
    const st = step != null ? ` step="${step}"` : "";
    lab.innerHTML = `${label} <span data-v="${key}">${val}</span>
      <input type="range" min="${min}" max="${max}" value="${val}" data-k="${key}"${st}/>`;
    ctrl.appendChild(lab);
    return lab.querySelector("input");
  }
  function bind(wrap, draw) {
    wrap.querySelectorAll("input").forEach((i) =>
      i.addEventListener("input", () => {
        const sp = wrap.querySelector(`[data-v="${i.dataset.k}"]`);
        if (sp) {
          if (i.step && String(i.step).includes(".")) sp.textContent = (+i.value).toFixed(2);
          else sp.textContent = i.value;
        }
        draw();
      })
    );
  }
  function bg() {
    return `<rect width="640" height="300" fill="#0b1220"/>`;
  }
  function marker(id, color) {
    return `<defs><marker id="${id}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0L6,3L0,6" fill="${color}"/></marker></defs>`;
  }

  /* ========== 已有 5 个 ========== */
  W["newton-fma"] = function () {
    const ui = card("F=ma 演示", "拖质量与力，看加速度与箭头长度");
    const mIn = range(ui.ctrl, "m", "质量 m", 1, 20, 5);
    const fIn = range(ui.ctrl, "F", "力 F", 0, 100, 20);
    function draw() {
      const m = +mIn.value,
        F = +fIn.value;
      const a = F / m;
      const bar = Math.min(220, a * 12);
      ui.svg.innerHTML = `
        ${bg()}${marker("a1", "#facc15")}
        <rect x="80" y="120" width="80" height="60" rx="8" fill="#60a5fa"/>
        <text x="120" y="155" text-anchor="middle" fill="#0f172a" font-size="14">m=${m}</text>
        <path d="M170 150 L${180 + bar} 150" stroke="#facc15" stroke-width="4" marker-end="url(#a1)"/>
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
    const ui = card("理想气体 PV=nRT", "固定 n、R：拖 P、V 看 T");
    const pIn = range(ui.ctrl, "P", "压强 P", 1, 20, 5);
    const vIn = range(ui.ctrl, "V", "体积 V", 1, 20, 8);
    function draw() {
      const P = +pIn.value,
        V = +vIn.value;
      const T = P * V;
      const r = 20 + (V / 20) * 80;
      ui.svg.innerHTML = `
        ${bg()}
        <rect x="80" y="${200 - r * 1.2}" width="${60 + r}" height="${r * 1.2}" rx="8"
          fill="rgba(96,165,250,0.25)" stroke="#60a5fa" stroke-width="2"/>
        <text x="100" y="240" fill="#94a3b8" font-size="13">容器体积 ~ V</text>
        <text x="320" y="100" fill="#facc15" font-size="18">T = PV/(nR) = ${T.toFixed(2)}</text>
        <text x="320" y="140" fill="#e2e8f0" font-size="14">等温时 P↑ 则 V↓</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>P</span><b>${P}</b></div>
        <div class="ix-kv"><span>V</span><b>${V}</b></div>
        <div class="ix-kv hi"><span>T</span><b>${T.toFixed(2)}</b></div>
        <p class="ix-note">单位已简化；关系形状与理想模型一致。</p>`;
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
        ${bg()}
        <text x="40" y="50" fill="#94a3b8" font-size="14">γ = 1/√(1−v²/c²)</text>
        <rect x="40" y="100" width="400" height="28" rx="8" fill="#1e293b"/>
        <rect x="40" y="100" width="${40 + bar}" height="28" rx="8" fill="#a78bfa"/>
        <text x="40" y="160" fill="#facc15" font-size="20">γ ≈ ${g.toFixed(3)}</text>
        <text x="40" y="200" fill="#e2e8f0" font-size="14">运动时钟变慢：Δt = γ Δt₀</text>
        <text x="40" y="230" fill="#94a3b8" font-size="13">长度收缩：L = L₀/γ</text>`;
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
        ${bg()}
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
    ui.ctrl.innerHTML = "<p style='color:#94a3b8;font-size:0.9rem;margin:0'>真空常量估算（示意）</p>";
    ui.svg.innerHTML = `
      ${bg()}
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

  /* ========== 力学 ========== */
  W["gravity-demo"] = function () {
    const ui = card("万有引力", "拖两质量与距离，看引力大小（相对单位）");
    const m1 = range(ui.ctrl, "m1", "m₁", 1, 20, 10);
    const m2 = range(ui.ctrl, "m2", "m₂", 1, 20, 5);
    const rIn = range(ui.ctrl, "r", "距离 r", 2, 20, 8);
    function draw() {
      const a = +m1.value,
        b = +m2.value,
        r = +rIn.value;
      const F = (a * b) / (r * r);
      const gap = 40 + r * 12;
      const x1 = 180,
        x2 = x1 + gap;
      ui.svg.innerHTML = `
        ${bg()}${marker("g1", "#f87171")}${marker("g2", "#60a5fa")}
        <circle cx="${x1}" cy="150" r="${12 + a}" fill="#60a5fa"/>
        <circle cx="${x2}" cy="150" r="${12 + b}" fill="#fb923c"/>
        <text x="${x1}" y="155" text-anchor="middle" fill="#0f172a" font-size="12">m₁</text>
        <text x="${x2}" y="155" text-anchor="middle" fill="#0f172a" font-size="12">m₂</text>
        <path d="M${x1 + 12 + a} 150 L${x2 - 12 - b} 150" stroke="#64748b" stroke-dasharray="4"/>
        <path d="M${x1} 120 L${x1 + 30} 120" stroke="#f87171" stroke-width="3" marker-end="url(#g1)"/>
        <path d="M${x2} 120 L${x2 - 30} 120" stroke="#60a5fa" stroke-width="3" marker-end="url(#g2)"/>
        <text x="320" y="50" fill="#facc15" font-size="16">F ∝ m₁m₂/r² = ${F.toFixed(3)}</text>
        <text x="100" y="260" fill="#94a3b8" font-size="13">距离加倍 → 力变为 1/4</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>m₁m₂</span><b>${a * b}</b></div>
        <div class="ix-kv"><span>r²</span><b>${r * r}</b></div>
        <div class="ix-kv hi"><span>F∝</span><b>${F.toFixed(3)}</b></div>
        <p class="ix-note">方向沿连线互相吸引。</p>`;
      ui.out.textContent = "F = G m₁m₂ / r²。图中 G=1。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["energy-ball"] = function () {
    const ui = card("机械能 · 抛体能量", "拖高度与速度，看动能+重力势能（取 g=10）");
    const hIn = range(ui.ctrl, "h", "高度 h", 0, 50, 20);
    const vIn = range(ui.ctrl, "v", "速率 v", 0, 30, 10);
    const m = 2,
      g = 10;
    function draw() {
      const h = +hIn.value,
        v = +vIn.value;
      const Ek = 0.5 * m * v * v;
      const Ep = m * g * h;
      const E = Ek + Ep;
      const y = 240 - h * 3.5;
      const maxE = Math.max(E, 1);
      ui.svg.innerHTML = `
        ${bg()}
        <line x1="40" y1="250" x2="280" y2="250" stroke="#475569" stroke-width="3"/>
        <circle cx="160" cy="${y}" r="16" fill="#60a5fa"/>
        <text x="160" y="${y + 5}" text-anchor="middle" fill="#0f172a" font-size="11">m</text>
        <text x="40" y="40" fill="#facc15" font-size="15">E = ½mv² + mgh</text>
        <rect x="340" y="60" width="40" height="${(Ek / maxE) * 160}" fill="#60a5fa" transform="translate(0,${220 - (Ek / maxE) * 160})"/>
        <rect x="400" y="60" width="40" height="${(Ep / maxE) * 160}" fill="#4ade80" transform="translate(0,${220 - (Ep / maxE) * 160})"/>
        <rect x="460" y="60" width="40" height="${(E / maxE) * 160}" fill="#facc15" transform="translate(0,${220 - (E / maxE) * 160})"/>
        <text x="360" y="250" fill="#60a5fa" font-size="12" text-anchor="middle">Ek</text>
        <text x="420" y="250" fill="#4ade80" font-size="12" text-anchor="middle">Ep</text>
        <text x="480" y="250" fill="#facc15" font-size="12" text-anchor="middle">E</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>Ek</span><b>${Ek.toFixed(0)}</b></div>
        <div class="ix-kv"><span>Ep</span><b>${Ep.toFixed(0)}</b></div>
        <div class="ix-kv hi"><span>E</span><b>${E.toFixed(0)}</b></div>
        <p class="ix-note">保守力下总机械能守恒；这里手调 h、v 看各部分占比。</p>`;
      ui.out.textContent = `m=${m}, g=${g}。自由落体时 Ep↓ 则 Ek↑，E 近似不变。`;
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["momentum-collide"] = function () {
    const ui = card("一维弹性碰撞", "拖两质量与初速，看碰后速度（等质量交换速度）");
    const m1 = range(ui.ctrl, "m1", "m₁", 1, 10, 3);
    const m2 = range(ui.ctrl, "m2", "m₂", 1, 10, 3);
    const u1 = range(ui.ctrl, "u1", "u₁", -10, 20, 12);
    const u2 = range(ui.ctrl, "u2", "u₂", -10, 10, 0);
    function draw() {
      const a = +m1.value,
        b = +m2.value;
      const U1 = +u1.value,
        U2 = +u2.value;
      const v1 = ((a - b) / (a + b)) * U1 + ((2 * b) / (a + b)) * U2;
      const v2 = ((2 * a) / (a + b)) * U1 + ((b - a) / (a + b)) * U2;
      const p0 = a * U1 + b * U2;
      const p1 = a * v1 + b * v2;
      ui.svg.innerHTML = `
        ${bg()}${marker("mL", "#60a5fa")}${marker("mR", "#fb923c")}
        <line x1="40" y1="160" x2="400" y2="160" stroke="#334155"/>
        <rect x="100" y="130" width="${30 + a * 4}" height="40" rx="6" fill="#60a5fa"/>
        <rect x="280" y="130" width="${30 + b * 4}" height="40" rx="6" fill="#fb923c"/>
        <path d="M80 100 L${80 + U1 * 4} 100" stroke="#60a5fa" stroke-width="3" marker-end="url(#mL)"/>
        <path d="M320 100 L${320 + U2 * 4} 100" stroke="#fb923c" stroke-width="3" marker-end="url(#mR)"/>
        <text x="40" y="50" fill="#e2e8f0" font-size="14">碰后 v₁=${v1.toFixed(2)}　v₂=${v2.toFixed(2)}</text>
        <text x="40" y="240" fill="#94a3b8" font-size="13">动量守恒 · 弹性碰撞动能也守恒</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>p 前</span><b>${p0.toFixed(2)}</b></div>
        <div class="ix-kv"><span>p 后</span><b>${p1.toFixed(2)}</b></div>
        <div class="ix-kv hi"><span>Δp</span><b>${(p1 - p0).toFixed(3)}</b></div>
        <p class="ix-note">m₁=m₂ 时速度对调。</p>`;
      ui.out.textContent = "系统外力为零 → 总动量守恒。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["thermo1-demo"] = function () {
    const ui = card("热力学第一定律", "ΔU = Q − W：拖吸热与做功，看内能变化");
    const qIn = range(ui.ctrl, "Q", "吸热 Q", -50, 100, 40);
    const wIn = range(ui.ctrl, "W", "对外做功 W", -30, 80, 20);
    function draw() {
      const Q = +qIn.value,
        W = +wIn.value;
      const dU = Q - W;
      const uBar = Math.max(8, Math.abs(dU) * 1.5);
      const col = dU >= 0 ? "#4ade80" : "#f87171";
      ui.svg.innerHTML = `
        ${bg()}
        <rect x="200" y="80" width="120" height="100" rx="12" fill="rgba(96,165,250,0.3)" stroke="#60a5fa"/>
        <text x="260" y="135" text-anchor="middle" fill="#e2e8f0" font-size="14">系统</text>
        <text x="80" y="100" fill="#facc15" font-size="14">Q →</text>
        <text x="360" y="200" fill="#fb923c" font-size="14">→ W</text>
        <text x="40" y="50" fill="#e2e8f0" font-size="16">ΔU = Q − W = ${dU}</text>
        <rect x="480" y="${150 - (dU >= 0 ? uBar : 0)}" width="40" height="${uBar}" fill="${col}"/>
        <text x="500" y="180" text-anchor="middle" fill="#94a3b8" font-size="12">ΔU</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>Q</span><b>${Q}</b></div>
        <div class="ix-kv"><span>W</span><b>${W}</b></div>
        <div class="ix-kv hi"><span>ΔU</span><b>${dU}</b></div>
        <p class="ix-note">符号约定随教材；此处：吸热为正、对外做功为正。</p>`;
      ui.out.textContent = "能量守恒在热力学里的记账本。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["hooke-demo"] = function () {
    const ui = card("胡克定律", "拖伸长量 x，看弹力 F=−kx 与弹性势能");
    const kIn = range(ui.ctrl, "k", "劲度 k", 1, 20, 5);
    const xIn = range(ui.ctrl, "x", "伸长 x", -20, 30, 15);
    function draw() {
      const k = +kIn.value,
        x = +xIn.value;
      const F = -k * x;
      const Ep = 0.5 * k * x * x;
      const rest = 200;
      const end = rest + x * 4;
      ui.svg.innerHTML = `
        ${bg()}${marker("hk", "#f87171")}
        <rect x="40" y="100" width="20" height="100" fill="#64748b"/>
        <path d="M60 150 ${Array.from({ length: 12 }, (_, i) => {
          const t = i / 11;
          const xx = 60 + t * (end - 60);
          const yy = 150 + (i % 2 === 0 ? -18 : 18);
          return `L${xx} ${yy}`;
        }).join(" ")}" fill="none" stroke="#60a5fa" stroke-width="3"/>
        <rect x="${end}" y="125" width="50" height="50" rx="6" fill="#fb923c"/>
        <path d="M${end + 25} 100 L${end + 25 + Math.sign(F || 1) * Math.min(80, Math.abs(F) * 1.2)} 100"
          stroke="#f87171" stroke-width="3" marker-end="url(#hk)"/>
        <text x="40" y="50" fill="#facc15" font-size="16">F = −kx = ${F.toFixed(1)}</text>
        <text x="40" y="250" fill="#94a3b8" font-size="13">Ep = ½kx² = ${Ep.toFixed(1)}</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>k</span><b>${k}</b></div>
        <div class="ix-kv"><span>x</span><b>${x}</b></div>
        <div class="ix-kv hi"><span>F</span><b>${F.toFixed(1)}</b></div>
        <p class="ix-note">力总是把物体往平衡位置拽。</p>`;
      ui.out.textContent = "弹性限度内：F∝−x。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["shm-demo"] = function () {
    const ui = card("简谐振动", "拖振幅与相位，看位移–时间正弦曲线");
    const AIn = range(ui.ctrl, "A", "振幅 A", 20, 100, 60);
    const ph = range(ui.ctrl, "ph", "相位 φ°", 0, 360, 0);
    const w = 1.2;
    function draw() {
      const A = +AIn.value;
      const phi = (+ph.value * Math.PI) / 180;
      let pts = "";
      for (let i = 0; i <= 200; i++) {
        const t = (i / 200) * 4 * Math.PI;
        const x = 40 + i * 2.5;
        const y = 150 - A * Math.cos(w * t + phi) * 0.8;
        pts += (i ? "L" : "M") + x + " " + y + " ";
      }
      const y0 = 150 - A * Math.cos(phi) * 0.8;
      ui.svg.innerHTML = `
        ${bg()}
        <line x1="40" y1="150" x2="560" y2="150" stroke="#334155"/>
        <path d="${pts}" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
        <circle cx="40" cy="${y0}" r="8" fill="#facc15"/>
        <text x="40" y="40" fill="#e2e8f0" font-size="14">x = A cos(ωt + φ)</text>
        <text x="40" y="270" fill="#94a3b8" font-size="13">周期与振幅无关（线性振子）</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>A</span><b>${A}</b></div>
        <div class="ix-kv"><span>φ</span><b>${ph.value}°</b></div>
        <div class="ix-kv hi"><span>ω</span><b>${w}</b></div>
        <p class="ix-note">加速度 a = −ω²x，永远指向中心。</p>`;
      ui.out.textContent = "弹簧、单摆小角都近似简谐。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["angular-demo"] = function () {
    const ui = card("角动量守恒", "固定 L，拖转动惯量 I：I 变小则 ω 变大（收臂加速）");
    const iIn = range(ui.ctrl, "I", "转动惯量 I", 2, 20, 10);
    const ph = range(ui.ctrl, "ph", "相位 °", 0, 360, 40);
    const L0 = 40;
    function draw() {
      const I = +iIn.value;
      const omega = L0 / I;
      const L = I * omega;
      const r = 24 + I * 5;
      const a = (+ph.value * Math.PI) / 180;
      const x2 = 200 + r * Math.cos(a);
      const y2 = 150 + r * Math.sin(a);
      ui.svg.innerHTML = `
        ${bg()}
        <circle cx="200" cy="150" r="${r}" fill="none" stroke="#334155" stroke-dasharray="4"/>
        <circle cx="200" cy="150" r="8" fill="#64748b"/>
        <circle cx="${x2}" cy="${y2}" r="14" fill="#60a5fa"/>
        <line x1="200" y1="150" x2="${x2}" y2="${y2}" stroke="#94a3b8" stroke-width="2"/>
        <text x="360" y="80" fill="#facc15" font-size="16">L = Iω = ${L0}（守恒）</text>
        <text x="360" y="120" fill="#e2e8f0" font-size="14">I=${I.toFixed(1)}　ω=${omega.toFixed(2)}</text>
        <text x="360" y="160" fill="#94a3b8" font-size="13">花滑收臂：I↓ → ω↑</text>
        <text x="360" y="200" fill="#94a3b8" font-size="12">轨道半径示意随 I 变大</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>I</span><b>${I}</b></div>
        <div class="ix-kv"><span>ω</span><b>${omega.toFixed(2)}</b></div>
        <div class="ix-kv hi"><span>L</span><b>${L.toFixed(1)}</b></div>
        <p class="ix-note">L 固定为 ${L0}：调 I 看角速度反比变化。</p>`;
      ui.out.textContent = "合外力矩为零 → 角动量守恒。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["work-energy-demo"] = function () {
    const ui = card("动能定理", "合力做功 W = ΔEk = ½m(v²−u²)");
    const fIn = range(ui.ctrl, "F", "合力 F", 0, 50, 20);
    const sIn = range(ui.ctrl, "s", "位移 s", 0, 40, 10);
    const mIn = range(ui.ctrl, "m", "质量 m", 1, 20, 5);
    const u0 = 0;
    function draw() {
      const F = +fIn.value,
        s = +sIn.value,
        m = +mIn.value;
      const Wk = F * s;
      const v2 = u0 * u0 + (2 * Wk) / m;
      const v = Math.sqrt(Math.max(0, v2));
      ui.svg.innerHTML = `
        ${bg()}${marker("we", "#facc15")}
        <rect x="80" y="140" width="50" height="40" rx="6" fill="#60a5fa"/>
        <path d="M130 160 L${130 + s * 8} 160" stroke="#facc15" stroke-width="4" marker-end="url(#we)"/>
        <text x="40" y="50" fill="#e2e8f0" font-size="15">W = Fs = ${Wk.toFixed(1)} = ΔEk</text>
        <text x="40" y="80" fill="#facc15" font-size="14">末速 v = ${v.toFixed(2)}</text>
        <text x="40" y="250" fill="#94a3b8" font-size="13">从静止加速：½mv² = Fs</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>W</span><b>${Wk.toFixed(1)}</b></div>
        <div class="ix-kv"><span>m</span><b>${m}</b></div>
        <div class="ix-kv hi"><span>v</span><b>${v.toFixed(2)}</b></div>
        <p class="ix-note">功是能量转移的量度。</p>`;
      ui.out.textContent = "动能定理：W_合 = Ek末 − Ek初。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["kepler-demo"] = function () {
    const ui = card("开普勒第三定律", "拖半长轴 a，看周期 T（T²∝a³）");
    const aIn = range(ui.ctrl, "a", "半长轴 a (AU)", 1, 10, 1);
    function draw() {
      const a = +aIn.value;
      const T = Math.pow(a, 1.5); // years if central = sun units
      const rx = 40 + a * 22;
      const ry = rx * 0.7;
      ui.svg.innerHTML = `
        ${bg()}
        <ellipse cx="220" cy="150" rx="${rx}" ry="${ry}" fill="none" stroke="#60a5fa" stroke-width="2"/>
        <circle cx="${220 - rx * 0.4}" cy="150" r="12" fill="#facc15"/>
        <circle cx="${220 + rx}" cy="150" r="8" fill="#60a5fa"/>
        <text x="400" y="80" fill="#e2e8f0" font-size="15">T² ∝ a³</text>
        <text x="400" y="120" fill="#facc15" font-size="18">T ≈ ${T.toFixed(2)} 年</text>
        <text x="400" y="160" fill="#94a3b8" font-size="13">a=1 → 地球 1 年</text>
        <text x="400" y="200" fill="#94a3b8" font-size="13">a=4 → T=8 年</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>a</span><b>${a} AU</b></div>
        <div class="ix-kv hi"><span>T</span><b>${T.toFixed(2)} yr</b></div>
        <div class="ix-kv"><span>T²/a³</span><b>${((T * T) / (a * a * a)).toFixed(3)}</b></div>
        <p class="ix-note">太阳系单位下 T²/a³≈1。</p>`;
      ui.out.textContent = "牛顿引力可导出 T² = 4π²a³/(GM)。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["escape-demo"] = function () {
    const ui = card("逃逸速度", "拖星球质量与半径，看 v_esc = √(2GM/R)");
    const mIn = range(ui.ctrl, "M", "质量 M（地球=1）", 1, 20, 1);
    const rIn = range(ui.ctrl, "R", "半径 R（地球=1）", 1, 10, 1);
    const vescEarth = 11.2;
    function draw() {
      const M = +mIn.value,
        R = +rIn.value;
      const vesc = vescEarth * Math.sqrt(M / R);
      const vorb = vesc / Math.SQRT2;
      const rad = 30 + R * 8;
      ui.svg.innerHTML = `
        ${bg()}
        <circle cx="180" cy="160" r="${rad}" fill="#3b82f6" opacity="0.7"/>
        <path d="M${180 + rad} 160 Q${280 + rad} 80 ${380 + rad * 0.3} 40" fill="none" stroke="#4ade80" stroke-width="2" stroke-dasharray="6"/>
        <path d="M${180 + rad} 160 Q${250} 160 ${320} 200" fill="none" stroke="#f87171" stroke-width="2"/>
        <text x="400" y="80" fill="#4ade80" font-size="14">逃逸轨迹</text>
        <text x="400" y="120" fill="#f87171" font-size="14">不够快会掉回</text>
        <text x="40" y="40" fill="#facc15" font-size="16">v_esc ≈ ${vesc.toFixed(2)} km/s</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>v_esc</span><b>${vesc.toFixed(2)}</b></div>
        <div class="ix-kv"><span>v_orb</span><b>${vorb.toFixed(2)}</b></div>
        <div class="ix-kv hi"><span>√(M/R)</span><b>${Math.sqrt(M / R).toFixed(2)}</b></div>
        <p class="ix-note">地球约 11.2 km/s；圆轨道约 7.9。</p>`;
      ui.out.textContent = "能量 ≥0 才能到无穷远：½mv² ≥ GMm/R。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ========== 电磁 ========== */
  W["coulomb-demo"] = function () {
    const ui = card("库仑定律", "拖电荷与距离，看静电力量级（相对）");
    const q1 = range(ui.ctrl, "q1", "q₁", -10, 10, 5);
    const q2 = range(ui.ctrl, "q2", "q₂", -10, 10, -4);
    const rIn = range(ui.ctrl, "r", "距离 r", 2, 20, 8);
    function draw() {
      const a = +q1.value,
        b = +q2.value,
        r = +rIn.value;
      const F = (a * b) / (r * r);
      const attr = a * b < 0;
      const gap = 50 + r * 10;
      ui.svg.innerHTML = `
        ${bg()}${marker("c1", "#f87171")}${marker("c2", "#60a5fa")}
        <circle cx="160" cy="150" r="22" fill="${a >= 0 ? "#f87171" : "#60a5fa"}"/>
        <circle cx="${160 + gap}" cy="150" r="22" fill="${b >= 0 ? "#f87171" : "#60a5fa"}"/>
        <text x="160" y="155" text-anchor="middle" fill="#fff" font-size="12">${a}</text>
        <text x="${160 + gap}" y="155" text-anchor="middle" fill="#fff" font-size="12">${b}</text>
        <text x="40" y="50" fill="#facc15" font-size="16">F ∝ q₁q₂/r² = ${F.toFixed(3)}</text>
        <text x="40" y="250" fill="#94a3b8" font-size="13">${attr ? "异号 → 吸引" : "同号 → 排斥"}</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>q₁q₂</span><b>${a * b}</b></div>
        <div class="ix-kv"><span>r²</span><b>${r * r}</b></div>
        <div class="ix-kv hi"><span>F∝</span><b>${F.toFixed(3)}</b></div>
        <p class="ix-note">与引力形式相似，可正可负。</p>`;
      ui.out.textContent = "F = k |q₁q₂| / r²，方向由符号决定。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["faraday-demo"] = function () {
    const ui = card("法拉第感应", "拖磁通变化率，看感应电动势 ε = −dΦ/dt");
    const dphi = range(ui.ctrl, "dp", "dΦ/dt", -20, 20, 8);
    const nIn = range(ui.ctrl, "N", "匝数 N", 1, 20, 5);
    function draw() {
      const dp = +dphi.value,
        N = +nIn.value;
      const eps = -N * dp;
      ui.svg.innerHTML = `
        ${bg()}
        <rect x="120" y="80" width="160" height="120" rx="8" fill="none" stroke="#60a5fa" stroke-width="3"/>
        <text x="200" y="145" text-anchor="middle" fill="#60a5fa" font-size="14">线圈 N=${N}</text>
        <path d="M80 140 L110 140" stroke="#f87171" stroke-width="3"/>
        <text x="40" y="130" fill="#f87171" font-size="12">B</text>
        <text x="320" y="100" fill="#facc15" font-size="16">ε = −N dΦ/dt</text>
        <text x="320" y="140" fill="#e2e8f0" font-size="18">ε = ${eps.toFixed(1)}</text>
        <text x="320" y="200" fill="#94a3b8" font-size="13">楞次：感应电流反抗变化</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>N</span><b>${N}</b></div>
        <div class="ix-kv"><span>dΦ/dt</span><b>${dp}</b></div>
        <div class="ix-kv hi"><span>ε</span><b>${eps.toFixed(1)}</b></div>
        <p class="ix-note">负号 = 楞次定律方向。</p>`;
      ui.out.textContent = "发电机、变压器的核心。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["ohm-demo"] = function () {
    const ui = card("欧姆定律", "拖电压与电阻，看电流 I=U/R");
    const uIn = range(ui.ctrl, "U", "电压 U", 1, 24, 12);
    const rIn = range(ui.ctrl, "R", "电阻 R", 1, 20, 4);
    function draw() {
      const U = +uIn.value,
        R = +rIn.value;
      const I = U / R;
      const thick = Math.min(12, 2 + I);
      ui.svg.innerHTML = `
        ${bg()}
        <rect x="100" y="120" width="40" height="60" rx="4" fill="#facc15"/>
        <text x="120" y="155" text-anchor="middle" fill="#0f172a" font-size="12">V</text>
        <rect x="280" y="130" width="80" height="40" rx="4" fill="#fb923c"/>
        <text x="320" y="155" text-anchor="middle" fill="#0f172a" font-size="12">R</text>
        <path d="M140 150 L280 150" stroke="#60a5fa" stroke-width="${thick}"/>
        <path d="M360 150 L420 150 L420 200 L120 200 L120 180" stroke="#60a5fa" stroke-width="${thick}" fill="none"/>
        <text x="40" y="50" fill="#e2e8f0" font-size="16">I = U/R = ${I.toFixed(2)} A</text>
        <text x="40" y="260" fill="#94a3b8" font-size="13">线宽示意电流大小</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>U</span><b>${U} V</b></div>
        <div class="ix-kv"><span>R</span><b>${R} Ω</b></div>
        <div class="ix-kv hi"><span>I</span><b>${I.toFixed(2)} A</b></div>
        <p class="ix-note">欧姆导体：U–I 直线。</p>`;
      ui.out.textContent = "功率 P = UI = I²R。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["lorentz-demo"] = function () {
    const ui = card("洛伦兹力", "磁场中带电粒子圆周运动：r = mv/(|q|B)");
    const vIn = range(ui.ctrl, "v", "速率 v", 1, 20, 10);
    const bIn = range(ui.ctrl, "B", "磁场 B", 1, 10, 3);
    const qIn = range(ui.ctrl, "q", "|q|", 1, 5, 1);
    function draw() {
      const v = +vIn.value,
        B = +bIn.value,
        q = +qIn.value;
      const m = 5;
      const r = (m * v) / (q * B);
      const R = Math.min(90, 10 + r * 3);
      ui.svg.innerHTML = `
        ${bg()}
        <circle cx="200" cy="150" r="${R}" fill="none" stroke="#60a5fa" stroke-width="2" stroke-dasharray="4"/>
        <circle cx="${200 + R}" cy="150" r="8" fill="#facc15"/>
        <text x="40" y="40" fill="#e2e8f0" font-size="14">× × × ×  B 垂直纸面向里</text>
        <text x="40" y="70" fill="#facc15" font-size="16">r = mv/(|q|B) ∝ ${r.toFixed(2)}</text>
        <text x="360" y="140" fill="#94a3b8" font-size="13">F = q v B（垂直）</text>
        <text x="360" y="170" fill="#94a3b8" font-size="13">只改方向不改速率</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>v</span><b>${v}</b></div>
        <div class="ix-kv"><span>B</span><b>${B}</b></div>
        <div class="ix-kv hi"><span>r∝</span><b>${r.toFixed(2)}</b></div>
        <p class="ix-note">加速器、质谱、地磁约束。</p>`;
      ui.out.textContent = "F = q(E + v×B)；纯 B 场做功为零。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["ampere-demo"] = function () {
    const ui = card("安培定律 · 直导线", "拖电流，看环绕磁场 B∝I/r");
    const iIn = range(ui.ctrl, "I", "电流 I", 1, 20, 8);
    const rIn = range(ui.ctrl, "r", "距离 r", 1, 15, 5);
    function draw() {
      const I = +iIn.value,
        r = +rIn.value;
      const B = I / r;
      const R = 20 + r * 8;
      ui.svg.innerHTML = `
        ${bg()}
        <circle cx="200" cy="150" r="10" fill="#facc15"/>
        <text x="200" y="155" text-anchor="middle" fill="#0f172a" font-size="10">I</text>
        <circle cx="200" cy="150" r="${R}" fill="none" stroke="#60a5fa" stroke-width="2"/>
        <path d="M${200 + R} 150 A 8 8 0 0 1 ${200 + R - 5} ${150 - 12}" fill="none" stroke="#60a5fa" stroke-width="2"/>
        <text x="360" y="100" fill="#e2e8f0" font-size="15">B = μ₀I/(2πr)</text>
        <text x="360" y="140" fill="#facc15" font-size="18">B ∝ ${B.toFixed(2)}</text>
        <text x="360" y="200" fill="#94a3b8" font-size="13">右手螺旋：拇指电流，四指 B</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>I</span><b>${I}</b></div>
        <div class="ix-kv"><span>r</span><b>${r}</b></div>
        <div class="ix-kv hi"><span>B∝</span><b>${B.toFixed(2)}</b></div>
        <p class="ix-note">∮B·dl = μ₀ I_enc。</p>`;
      ui.out.textContent = "电流是磁场的源（稳恒情形）。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ========== 光学 / 波动 ========== */
  W["snell-demo"] = function () {
    const ui = card("斯涅尔折射", "拖入射角与折射率，看折射角");
    const th1 = range(ui.ctrl, "th", "入射角 θ₁°", 0, 85, 40);
    const n2 = range(ui.ctrl, "n2", "n₂ (n₁=1)", 1, 25, 15); // /10
    function draw() {
      const t1 = (+th1.value * Math.PI) / 180;
      const n1 = 1,
        nr = +n2.value / 10;
      const s2 = (n1 / nr) * Math.sin(t1);
      const tir = s2 > 1;
      const t2 = tir ? Math.PI / 2 : Math.asin(Math.min(1, s2));
      const L = 100;
      const ix = 200 + L * Math.sin(t1);
      const iy = 150 - L * Math.cos(t1);
      const rx = 200 + L * Math.sin(t2);
      const ry = 150 + L * Math.cos(t2);
      const rfx = 200 - L * Math.sin(t1);
      const rfy = 150 - L * Math.cos(t1);
      ui.svg.innerHTML = `
        ${bg()}
        <rect x="40" y="150" width="360" height="120" fill="rgba(59,130,246,0.15)"/>
        <line x1="40" y1="150" x2="400" y2="150" stroke="#94a3b8"/>
        <line x1="200" y1="40" x2="200" y2="260" stroke="#334155" stroke-dasharray="4"/>
        <line x1="${ix}" y1="${iy}" x2="200" y2="150" stroke="#facc15" stroke-width="2"/>
        <line x1="200" y1="150" x2="${rfx}" y2="${rfy}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3"/>
        ${tir ? "" : `<line x1="200" y1="150" x2="${rx}" y2="${ry}" stroke="#60a5fa" stroke-width="2"/>`}
        <text x="420" y="80" fill="#e2e8f0" font-size="14">n₁ sinθ₁ = n₂ sinθ₂</text>
        <text x="420" y="120" fill="#facc15" font-size="14">${tir ? "全反射!" : `θ₂ ≈ ${((t2 * 180) / Math.PI).toFixed(1)}°`}</text>
        <text x="60" y="140" fill="#94a3b8" font-size="12">n₁=1</text>
        <text x="60" y="180" fill="#60a5fa" font-size="12">n₂=${nr.toFixed(1)}</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>θ₁</span><b>${th1.value}°</b></div>
        <div class="ix-kv"><span>n₂</span><b>${nr.toFixed(1)}</b></div>
        <div class="ix-kv hi"><span>θ₂</span><b>${tir ? "TIR" : ((t2 * 180) / Math.PI).toFixed(1) + "°"}</b></div>
        <p class="ix-note">从密到疏且角度够大 → 全反射。</p>`;
      ui.out.textContent = "费马最短时间原理可导出斯涅尔定律。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["young-demo"] = function () {
    const ui = card("杨氏双缝", "拖波长与缝距，看条纹间距 Δx=λL/d");
    const lam = range(ui.ctrl, "lam", "波长 λ (nm)", 400, 700, 550);
    const dIn = range(ui.ctrl, "d", "缝距 d", 1, 20, 5);
    const L = 50;
    function draw() {
      const lambda = +lam.value;
      const d = +dIn.value;
      const dx = (lambda * L) / (d * 100); // scaled
      let fringes = "";
      for (let i = -6; i <= 6; i++) {
        const x = 320 + i * dx * 3;
        const bright = Math.abs(i) % 2 === 0;
        fringes += `<rect x="${x - 4}" y="80" width="8" height="140" fill="${bright ? "#facc15" : "#1e293b"}" opacity="${bright ? 0.9 : 0.5}"/>`;
      }
      ui.svg.innerHTML = `
        ${bg()}
        <circle cx="80" cy="150" r="6" fill="#facc15"/>
        <line x1="120" y1="100" x2="120" y2="200" stroke="#64748b" stroke-width="4"/>
        <circle cx="120" cy="130" r="3" fill="#fff"/>
        <circle cx="120" cy="170" r="3" fill="#fff"/>
        ${fringes}
        <text x="40" y="40" fill="#e2e8f0" font-size="14">Δx = λL/d ∝ ${(dx).toFixed(2)}</text>
        <text x="40" y="270" fill="#94a3b8" font-size="13">屏上明暗相间；λ↑ 或 d↓ → 条纹更疏</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>λ</span><b>${lambda} nm</b></div>
        <div class="ix-kv"><span>d</span><b>${d}</b></div>
        <div class="ix-kv hi"><span>Δx∝</span><b>${dx.toFixed(2)}</b></div>
        <p class="ix-note">相干叠加：路径差 = mλ 明纹。</p>`;
      ui.out.textContent = "波动性的经典铁证；电子双缝更奇妙。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["lens-demo"] = function () {
    const ui = card("薄透镜成像", "拖物距 u 与焦距 f，看像距 v（1/u+1/v=1/f）");
    const uIn = range(ui.ctrl, "u", "物距 u", 5, 40, 20);
    const fIn = range(ui.ctrl, "f", "焦距 f", 5, 25, 10);
    function draw() {
      const u = +uIn.value,
        f = +fIn.value;
      let v = null,
        msg = "";
      if (Math.abs(u - f) < 0.2) {
        msg = "物在焦点：像在无穷远";
      } else {
        v = 1 / (1 / f - 1 / u);
        msg = `v = ${v.toFixed(1)}`;
      }
      const m = v != null ? -v / u : 0;
      const ox = 200 - u * 4;
      const ix = v != null && v > 0 ? 200 + Math.min(200, v * 4) : v != null ? 200 + v * 2 : 200;
      ui.svg.innerHTML = `
        ${bg()}
        <line x1="40" y1="150" x2="600" y2="150" stroke="#334155"/>
        <path d="M200 60 L200 240" stroke="#60a5fa" stroke-width="3"/>
        <path d="M190 70 Q200 150 190 230" fill="none" stroke="#60a5fa"/>
        <path d="M210 70 Q200 150 210 230" fill="none" stroke="#60a5fa"/>
        <circle cx="${ox}" cy="120" r="6" fill="#fb923c"/>
        <text x="${ox}" y="100" text-anchor="middle" fill="#fb923c" font-size="12">物</text>
        ${
          v != null && isFinite(v)
            ? `<circle cx="${ix}" cy="${150 - m * 30}" r="6" fill="#4ade80"/>
               <text x="${ix}" y="100" text-anchor="middle" fill="#4ade80" font-size="12">像</text>`
            : ""
        }
        <text x="40" y="40" fill="#facc15" font-size="15">1/u + 1/v = 1/f　${msg}</text>
        <text x="40" y="270" fill="#94a3b8" font-size="13">u>f 凸透镜成实倒像；u&lt;f 成虚正像</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>u</span><b>${u}</b></div>
        <div class="ix-kv"><span>f</span><b>${f}</b></div>
        <div class="ix-kv hi"><span>v</span><b>${v != null && isFinite(v) ? v.toFixed(1) : "∞"}</b></div>
        <p class="ix-note">放大率 m = −v/u ${v != null && isFinite(v) ? "≈ " + m.toFixed(2) : ""}</p>`;
      ui.out.textContent = "眼镜、相机、望远镜的基本公式。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["doppler-demo"] = function () {
    const ui = card("多普勒效应", "拖波源速度，看前方波长压缩、频率升高");
    const vs = range(ui.ctrl, "vs", "波源速度 vs", 0, 15, 6);
    const f0 = 10,
      v = 20;
    function draw() {
      const u = +vs.value;
      const fFront = (f0 * v) / (v - u);
      const fBack = (f0 * v) / (v + u);
      let waves = "";
      for (let i = 1; i <= 6; i++) {
        const rf = 20 + i * (18 - u * 0.6);
        const rb = 20 + i * (18 + u * 0.5);
        waves += `<circle cx="280" cy="150" r="${rf}" fill="none" stroke="#60a5fa" opacity="0.5"/>`;
        waves += `<circle cx="280" cy="150" r="${rb}" fill="none" stroke="#fb923c" opacity="0.35"/>`;
      }
      ui.svg.innerHTML = `
        ${bg()}
        ${waves}
        <circle cx="280" cy="150" r="10" fill="#facc15"/>
        <text x="40" y="40" fill="#60a5fa" font-size="14">前方 f′ ≈ ${fFront.toFixed(2)}</text>
        <text x="40" y="70" fill="#fb923c" font-size="14">后方 f′ ≈ ${fBack.toFixed(2)}</text>
        <text x="40" y="270" fill="#94a3b8" font-size="13">蓝：前（密）　橙：后（疏）　静止波速 v=${v}</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>vs</span><b>${u}</b></div>
        <div class="ix-kv"><span>f前</span><b>${fFront.toFixed(2)}</b></div>
        <div class="ix-kv hi"><span>f后</span><b>${fBack.toFixed(2)}</b></div>
        <p class="ix-note">急救车呼啸：靠近尖、离开沉。</p>`;
      ui.out.textContent = "f′ = f · (v±vo)/(v±vs)。光学还有相对论多普勒。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ========== 流体 ========== */
  W["archimedes-demo"] = function () {
    const ui = card("阿基米德浮力", "拖物体密度与浸没比例，看浮沉");
    const rho = range(ui.ctrl, "rho", "物密度 ρ（水=10）", 1, 20, 8);
    const sub = range(ui.ctrl, "sub", "浸没 %", 10, 100, 100);
    function draw() {
      const r = +rho.value / 10;
      const s = +sub.value / 100;
      const rhoF = 1;
      const V = 1;
      const Fg = r * V * 10;
      const Fb = rhoF * (V * s) * 10;
      const net = Fb - Fg;
      const y = net > 0.5 ? 100 : net < -0.5 ? 180 : 140;
      ui.svg.innerHTML = `
        ${bg()}
        <rect x="80" y="120" width="200" height="140" fill="rgba(59,130,246,0.25)" stroke="#3b82f6"/>
        <rect x="130" y="${y}" width="80" height="60" rx="6" fill="#fb923c"/>
        <text x="320" y="80" fill="#e2e8f0" font-size="14">Fg = ρVg = ${Fg.toFixed(1)}</text>
        <text x="320" y="110" fill="#60a5fa" font-size="14">Fb = ρ_液 V浸 g = ${Fb.toFixed(1)}</text>
        <text x="320" y="160" fill="#facc15" font-size="16">${net > 0.3 ? "上浮" : net < -0.3 ? "下沉" : "悬浮/漂浮"}</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>Fg</span><b>${Fg.toFixed(1)}</b></div>
        <div class="ix-kv"><span>Fb</span><b>${Fb.toFixed(1)}</b></div>
        <div class="ix-kv hi"><span>净力</span><b>${net.toFixed(1)}</b></div>
        <p class="ix-note">Fb = 排开液体的重力。</p>`;
      ui.out.textContent = "船能浮：平均密度小于水。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["bernoulli-demo"] = function () {
    const ui = card("伯努利原理", "管道变窄 → 流速↑ 压强↓");
    const aIn = range(ui.ctrl, "a", "窄段面积比 %", 20, 100, 40);
    function draw() {
      const ratio = +aIn.value / 100;
      const v1 = 5,
        A1 = 1,
        A2 = ratio;
      const v2 = (v1 * A1) / A2;
      const dp = 0.5 * (v2 * v2 - v1 * v1); // rho=1
      const h1 = 80,
        h2 = 30 + ratio * 50;
      ui.svg.innerHTML = `
        ${bg()}
        <path d="M60 100 L200 100 L200 ${150 - h1 / 2} L280 ${150 - h2 / 2} L400 ${150 - h2 / 2}
          L400 ${150 + h2 / 2} L280 ${150 + h2 / 2} L200 ${150 + h1 / 2} L200 200 L60 200 Z"
          fill="rgba(96,165,250,0.2)" stroke="#60a5fa" stroke-width="2"/>
        <text x="100" y="160" fill="#e2e8f0" font-size="12">v₁=${v1}</text>
        <text x="320" y="160" fill="#facc15" font-size="12">v₂=${v2.toFixed(1)}</text>
        <text x="40" y="40" fill="#e2e8f0" font-size="14">P + ½ρv² + ρgh ≈ const</text>
        <text x="40" y="270" fill="#94a3b8" font-size="13">窄处压强相对低 ≈ −${dp.toFixed(1)}（相对单位）</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>A₂/A₁</span><b>${ratio.toFixed(2)}</b></div>
        <div class="ix-kv"><span>v₂</span><b>${v2.toFixed(1)}</b></div>
        <div class="ix-kv hi"><span>Δ(½v²)</span><b>${dp.toFixed(1)}</b></div>
        <p class="ix-note">机翼、喷雾器、两纸间吹气。</p>`;
      ui.out.textContent = "连续方程 A₁v₁=A₂v₂ + 能量形式。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["pascal-demo"] = function () {
    const ui = card("帕斯卡液压", "小活塞用力，大活塞抬重：F₂ = F₁ (A₂/A₁)");
    const f1 = range(ui.ctrl, "f1", "小活塞力 F₁", 10, 200, 50);
    const ratio = range(ui.ctrl, "ar", "面积比 A₂/A₁", 2, 30, 10);
    function draw() {
      const F1 = +f1.value,
        ar = +ratio.value;
      const F2 = F1 * ar;
      ui.svg.innerHTML = `
        ${bg()}
        <rect x="100" y="160" width="200" height="60" rx="8" fill="rgba(59,130,246,0.3)" stroke="#3b82f6"/>
        <rect x="120" y="100" width="30" height="60" fill="#60a5fa"/>
        <rect x="240" y="80" width="60" height="80" fill="#fb923c"/>
        <text x="135" y="90" text-anchor="middle" fill="#e2e8f0" font-size="12">F₁</text>
        <text x="270" y="70" text-anchor="middle" fill="#e2e8f0" font-size="12">F₂</text>
        <text x="360" y="120" fill="#facc15" font-size="16">F₂ = ${F2.toFixed(0)}</text>
        <text x="360" y="160" fill="#94a3b8" font-size="13">省力，费距离</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>F₁</span><b>${F1}</b></div>
        <div class="ix-kv"><span>A₂/A₁</span><b>${ar}</b></div>
        <div class="ix-kv hi"><span>F₂</span><b>${F2.toFixed(0)}</b></div>
        <p class="ix-note">压强在密闭流体中均匀传递。</p>`;
      ui.out.textContent = "F₁/A₁ = F₂/A₂。刹车与千斤顶同理。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ========== 量子 / 近代 ========== */
  W["photoelectric-demo"] = function () {
    const ui = card("光电效应", "拖频率与光强，看能否打出电子、电流大小");
    const fIn = range(ui.ctrl, "f", "频率 f（阈值=10）", 1, 30, 15);
    const iIn = range(ui.ctrl, "I", "光强 I", 1, 20, 8);
    const f0 = 10;
    function draw() {
      const f = +fIn.value,
        I = +iIn.value;
      const ok = f > f0;
      const Kmax = ok ? f - f0 : 0;
      const nElec = ok ? I : 0;
      ui.svg.innerHTML = `
        ${bg()}
        <rect x="80" y="100" width="100" height="80" rx="6" fill="#64748b"/>
        <text x="130" y="145" text-anchor="middle" fill="#fff" font-size="12">金属</text>
        ${
          ok
            ? Array.from({ length: Math.min(8, nElec) }, (_, i) => {
                const x = 220 + i * 25;
                return `<circle cx="${x}" cy="${120 + (i % 3) * 20}" r="6" fill="#facc15"/>`;
              }).join("")
            : `<text x="220" y="150" fill="#f87171" font-size="14">频率不够，无光电子</text>`
        }
        <text x="40" y="40" fill="#e2e8f0" font-size="14">K_max = h(f−f₀) ∝ ${Kmax}</text>
        <text x="40" y="260" fill="#94a3b8" font-size="13">光强只增电子数，不降阈值</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>f/f₀</span><b>${(f / f0).toFixed(2)}</b></div>
        <div class="ix-kv"><span>K_max∝</span><b>${Kmax}</b></div>
        <div class="ix-kv hi"><span>电子流∝</span><b>${nElec}</b></div>
        <p class="ix-note">${ok ? "有光电子射出" : "f ≤ 截止频率"}</p>`;
      ui.out.textContent = "爱因斯坦：光是一份份 hν。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["planck-demo"] = function () {
    const ui = card("普朗克能量子", "能量 E = nhν：拖 n 与频率，看能量台阶");
    const nIn = range(ui.ctrl, "n", "量子数 n", 0, 12, 3);
    const fIn = range(ui.ctrl, "f", "频率档", 1, 5, 2);
    function draw() {
      const n = +nIn.value,
        f = +fIn.value;
      const h = 1,
        E = n * h * f;
      let stairs = "";
      for (let k = 0; k <= 12; k++) {
        const y = 260 - k * f * 8;
        if (y < 40) break;
        stairs += `<line x1="80" y1="${y}" x2="280" y2="${y}" stroke="${k === n ? "#facc15" : "#334155"}" stroke-width="${k === n ? 3 : 1}"/>`;
      }
      ui.svg.innerHTML = `
        ${bg()}
        ${stairs}
        <text x="300" y="80" fill="#e2e8f0" font-size="15">E = n h ν</text>
        <text x="300" y="120" fill="#facc15" font-size="18">E = ${E}</text>
        <text x="300" y="180" fill="#94a3b8" font-size="13">能量不能取任意中间值</text>
        <text x="300" y="220" fill="#94a3b8" font-size="13">黑体辐射的关键一步</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>n</span><b>${n}</b></div>
        <div class="ix-kv"><span>ν档</span><b>${f}</b></div>
        <div class="ix-kv hi"><span>E</span><b>${E}</b></div>
        <p class="ix-note">h 极小，宏观看起来连续。</p>`;
      ui.out.textContent = "量子论敲门砖：E = nhν。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["uncertainty-demo"] = function () {
    const ui = card("不确定原理", "波包越窄（位置准），动量展宽越大");
    const sig = range(ui.ctrl, "sig", "位置宽度 σx", 5, 60, 20);
    function draw() {
      const sx = +sig.value;
      const sp = 200 / sx; // σp ∝ 1/σx
      let px = "",
        pp = "";
      for (let i = 0; i <= 100; i++) {
        const x = -50 + i;
        const y1 = Math.exp((-x * x) / (2 * (sx / 5) * (sx / 5)));
        const y2 = Math.exp((-x * x) / (2 * (sp / 3) * (sp / 3)));
        px += (i ? "L" : "M") + (120 + x * 2) + " " + (120 - y1 * 50) + " ";
        pp += (i ? "L" : "M") + (400 + x * 2) + " " + (120 - y2 * 50) + " ";
      }
      ui.svg.innerHTML = `
        ${bg()}
        <text x="80" y="40" fill="#60a5fa" font-size="13">位置空间 |ψ(x)|</text>
        <text x="360" y="40" fill="#fb923c" font-size="13">动量空间 |φ(p)|</text>
        <path d="${px}" fill="none" stroke="#60a5fa" stroke-width="2"/>
        <path d="${pp}" fill="none" stroke="#fb923c" stroke-width="2"/>
        <text x="40" y="220" fill="#facc15" font-size="15">σx · σp ≳ ℏ/2</text>
        <text x="40" y="260" fill="#94a3b8" font-size="13">左边变窄 → 右边变胖</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>σx</span><b>${sx}</b></div>
        <div class="ix-kv hi"><span>σp∝</span><b>${sp.toFixed(1)}</b></div>
        <div class="ix-kv"><span>乘积</span><b>${(sx * sp).toFixed(0)}</b></div>
        <p class="ix-note">不是测量技术差，是波的本性。</p>`;
      ui.out.textContent = "Δx Δp ≥ ℏ/2。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["debroglie-demo"] = function () {
    const ui = card("德布罗意波", "λ = h/p：拖动量看物质波波长");
    const pIn = range(ui.ctrl, "p", "动量 p", 1, 30, 8);
    function draw() {
      const p = +pIn.value;
      const lam = 80 / p;
      let wave = "";
      for (let i = 0; i <= 200; i++) {
        const x = 40 + i * 2.5;
        const y = 150 - 40 * Math.sin((i * 2.5 * Math.PI) / Math.max(lam, 2));
        wave += (i ? "L" : "M") + x + " " + y + " ";
      }
      ui.svg.innerHTML = `
        ${bg()}
        <path d="${wave}" fill="none" stroke="#a78bfa" stroke-width="2.5"/>
        <circle cx="100" cy="150" r="10" fill="#60a5fa"/>
        <text x="40" y="40" fill="#e2e8f0" font-size="15">λ = h/p ∝ ${lam.toFixed(2)}</text>
        <text x="40" y="270" fill="#94a3b8" font-size="13">动量大 → 波长短 → 更「粒子」</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>p</span><b>${p}</b></div>
        <div class="ix-kv hi"><span>λ∝</span><b>${lam.toFixed(2)}</b></div>
        <p class="ix-note">电子衍射证实了物质波。</p>`;
      ui.out.textContent = "波粒二象性：粒子也有波长。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["schrodinger-demo"] = function () {
    const ui = card("一维无限深势阱", "定态：ψ_n ∝ sin(nπx/L)，E_n ∝ n²");
    const nIn = range(ui.ctrl, "n", "能级 n", 1, 6, 1);
    const L = 200;
    function draw() {
      const n = +nIn.value;
      const E = n * n;
      let pts = "";
      for (let i = 0; i <= 100; i++) {
        const x = i / 100;
        const psi = Math.sin(n * Math.PI * x);
        pts += (i ? "L" : "M") + (120 + x * L) + " " + (160 - psi * 50) + " ";
      }
      ui.svg.innerHTML = `
        ${bg()}
        <line x1="120" y1="60" x2="120" y2="240" stroke="#64748b" stroke-width="4"/>
        <line x1="320" y1="60" x2="320" y2="240" stroke="#64748b" stroke-width="4"/>
        <line x1="120" y1="210" x2="320" y2="210" stroke="#334155"/>
        <path d="${pts}" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
        <text x="360" y="100" fill="#facc15" font-size="16">E_n ∝ n² = ${E}</text>
        <text x="360" y="140" fill="#e2e8f0" font-size="13">节点数 = n−1</text>
        <text x="360" y="180" fill="#94a3b8" font-size="13">|ψ|² = 概率密度</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>n</span><b>${n}</b></div>
        <div class="ix-kv hi"><span>E∝n²</span><b>${E}</b></div>
        <p class="ix-note">边界 ψ=0 → 波长量子化 → 能量量子化。</p>`;
      ui.out.textContent = "薛定谔方程决定允许的定态。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["stefan-demo"] = function () {
    const ui = card("斯特藩–玻尔兹曼", "辐射功率 j = σT⁴：温度稍升，功率猛涨");
    const tIn = range(ui.ctrl, "T", "温度 T (×100K)", 20, 60, 30);
    function draw() {
      const T = +tIn.value * 100;
      const j = Math.pow(T / 300, 4);
      const h = Math.min(180, j * 8);
      ui.svg.innerHTML = `
        ${bg()}
        <circle cx="160" cy="150" r="${20 + tIn.value}" fill="#f97316" opacity="0.85"/>
        <text x="160" y="155" text-anchor="middle" fill="#fff" font-size="12">${T}K</text>
        <rect x="320" y="${220 - h}" width="50" height="${h}" fill="#facc15" rx="4"/>
        <text x="345" y="250" text-anchor="middle" fill="#94a3b8" font-size="12">∝T⁴</text>
        <text x="40" y="40" fill="#e2e8f0" font-size="15">j / j₃₀₀K ≈ ${j.toFixed(2)}</text>
        <text x="400" y="120" fill="#94a3b8" font-size="13">T 翻倍 → 功率 ×16</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>T</span><b>${T} K</b></div>
        <div class="ix-kv hi"><span>相对功率</span><b>${j.toFixed(2)}</b></div>
        <p class="ix-note">恒星光度、地球辐射平衡。</p>`;
      ui.out.textContent = "P = σ A e T⁴（黑体 e=1）。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["compton-demo"] = function () {
    const ui = card("康普顿散射", "拖散射角，看波长增量 Δλ = λc(1−cosθ)");
    const th = range(ui.ctrl, "th", "散射角 θ°", 0, 180, 90);
    function draw() {
      const t = (+th.value * Math.PI) / 180;
      const dlam = 1 - Math.cos(t);
      const L = 90;
      const ex = 200 + L * Math.cos(t);
      const ey = 150 - L * Math.sin(t);
      ui.svg.innerHTML = `
        ${bg()}${marker("cp", "#facc15")}
        <circle cx="200" cy="150" r="14" fill="#60a5fa"/>
        <text x="200" y="155" text-anchor="middle" fill="#fff" font-size="10">e</text>
        <path d="M80 150 L186 150" stroke="#facc15" stroke-width="2" marker-end="url(#cp)"/>
        <path d="M214 150 L${ex} ${ey}" stroke="#4ade80" stroke-width="2"/>
        <text x="40" y="40" fill="#e2e8f0" font-size="14">Δλ / λc = 1−cosθ = ${dlam.toFixed(3)}</text>
        <text x="40" y="270" fill="#94a3b8" font-size="13">黄：入射光子　绿：散射光子（波长变长）</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>θ</span><b>${th.value}°</b></div>
        <div class="ix-kv hi"><span>Δλ/λc</span><b>${dlam.toFixed(3)}</b></div>
        <p class="ix-note">θ=180° 时红移最大（反冲）。</p>`;
      ui.out.textContent = "光子–电子碰撞：光也有动量 p=h/λ。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["equipartition-demo"] = function () {
    const ui = card("能量均分", "每个平方自由度平均 ½kT；拖温度与自由度数");
    const tIn = range(ui.ctrl, "T", "温度 T", 1, 20, 10);
    const fIn = range(ui.ctrl, "f", "自由度 f", 1, 8, 3);
    function draw() {
      const T = +tIn.value,
        f = +fIn.value;
      const u = 0.5 * f * T;
      let bars = "";
      for (let i = 0; i < f; i++) {
        const h = T * 6;
        bars += `<rect x="${80 + i * 40}" y="${220 - h}" width="28" height="${h}" fill="#60a5fa" rx="3"/>
          <text x="${94 + i * 40}" y="245" text-anchor="middle" fill="#94a3b8" font-size="10">½kT</text>`;
      }
      ui.svg.innerHTML = `
        ${bg()}
        ${bars}
        <text x="40" y="40" fill="#e2e8f0" font-size="15">U ≈ (f/2) kT  →  ${u.toFixed(1)}（相对）</text>
        <text x="400" y="120" fill="#94a3b8" font-size="13">单原子 f=3</text>
        <text x="400" y="150" fill="#94a3b8" font-size="13">双原子常温 f≈5</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>f</span><b>${f}</b></div>
        <div class="ix-kv"><span>T</span><b>${T}</b></div>
        <div class="ix-kv hi"><span>U∝</span><b>${u.toFixed(1)}</b></div>
        <p class="ix-note">低温自由度「冻结」→ 均分失效（量子）。</p>`;
      ui.out.textContent = "理想气体 C_V = (f/2)R。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  W["gr-demo"] = function () {
    const ui = card("广义相对论 · 光线弯曲", "拖恒星质量，看背景光线偏折示意");
    const mIn = range(ui.ctrl, "M", "质量 M", 1, 20, 8);
    function draw() {
      const M = +mIn.value;
      const bend = M * 3;
      ui.svg.innerHTML = `
        ${bg()}
        <circle cx="280" cy="160" r="${20 + M}" fill="#1e293b" stroke="#facc15" stroke-width="2"/>
        <text x="280" y="165" text-anchor="middle" fill="#facc15" font-size="11">M</text>
        <path d="M40 80 Q${200} ${80 + bend} 280 160 Q${360} ${240 - bend} 560 220"
          fill="none" stroke="#60a5fa" stroke-width="2"/>
        <path d="M40 80 L560 40" fill="none" stroke="#334155" stroke-dasharray="4"/>
        <text x="40" y="40" fill="#e2e8f0" font-size="14">物质弯曲时空 → 光走测地线</text>
        <text x="40" y="270" fill="#94a3b8" font-size="13">虚线：无质量直线；实线：被引力偏折</text>`;
      ui.side.innerHTML = `<div class="ix-kv"><span>M</span><b>${M}</b></div>
        <div class="ix-kv hi"><span>偏折∝</span><b>${bend}</b></div>
        <p class="ix-note">日食测星光偏折是早期检验。</p>`;
      ui.out.textContent = "弱场极限回到牛顿；GPS 也需 GR 修正。";
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ========== 注入到定理 proof ========== */
  const T = window.THEOREMS || [];
  function inject(id, widget) {
    const th = T.find((t) => t.id === id);
    if (!th || !th.sections || !th.sections.proof) return false;
    if (th.sections.proof.includes("data-widget=")) return true; // already has one
    th.sections.proof =
      `<div class="interactive" data-widget="${widget}"></div>` + th.sections.proof;
    return true;
  }

  const map = {
    "newton-laws": "newton-fma",
    "newton-gravity": "gravity-demo",
    "energy-conservation": "energy-ball",
    momentum: "momentum-collide",
    "thermo-1": "thermo1-demo",
    "thermo-2": "carnot",
    "ideal-gas": "ideal-gas-demo",
    maxwell: "maxwell-c",
    faraday: "faraday-demo",
    coulomb: "coulomb-demo",
    "relativity-sr": "relativity-gamma",
    photoelectric: "photoelectric-demo",
    planck: "planck-demo",
    uncertainty: "uncertainty-demo",
    snell: "snell-demo",
    archimedes: "archimedes-demo",
    bernoulli: "bernoulli-demo",
    kepler: "kepler-demo",
    hooke: "hooke-demo",
    shm: "shm-demo",
    "angular-momentum": "angular-demo",
    "work-energy": "work-energy-demo",
    ohm: "ohm-demo",
    "lorentz-force": "lorentz-demo",
    ampere: "ampere-demo",
    doppler: "doppler-demo",
    "young-slit": "young-demo",
    "de-broglie": "debroglie-demo",
    schrodinger: "schrodinger-demo",
    "stefan-boltzmann": "stefan-demo",
    compton: "compton-demo",
    pascal: "pascal-demo",
    equipartition: "equipartition-demo",
    "escape-velocity": "escape-demo",
    "relativity-gr": "gr-demo",
    "lens-maker": "lens-demo"
  };

  let ok = 0,
    miss = [];
  Object.keys(map).forEach((id) => {
    if (inject(id, map[id])) ok++;
    else miss.push(id);
  });
  console.info(
    "diagrams-physics: widgets",
    Object.keys(map).length,
    "injected",
    ok,
    miss.length ? "miss " + miss.join(",") : ""
  );
})();
