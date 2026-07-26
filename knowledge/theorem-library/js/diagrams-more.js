/**
 * 新定理交互演示（挂到 Diagrams.widgets）
 */
(function () {
  if (!window.Diagrams || !window.Diagrams.widgets) {
    console.warn("diagrams-more: Diagrams.widgets not ready");
    return;
  }
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
      </div><span class="ix-badge">演示</span></div>
      <div class="ix-controls" data-ctrl></div>
      <div class="ix-stage">
        <svg viewBox="0 0 640 320" class="ix-svg" data-svg></svg>
        <div class="ix-side" data-side></div>
      </div>
      <div class="ix-readout" data-out></div>
    `;
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
    wrap.querySelectorAll("input[type=range]").forEach((inp) => {
      inp.addEventListener("input", () => {
        const sp = wrap.querySelector(`[data-v="${inp.dataset.k}"]`);
        if (sp) sp.textContent = inp.value;
        draw();
      });
    });
  }

  /* ===== 费马小定理：a^(p-1) mod p ===== */
  W["fermat-little"] = function () {
    const ui = card("费马小定理 · 幂次取模", "拖 a 与素数 p，看 a^{p−1} mod p 是否为 1");
    const aIn = range(ui.ctrl, "a", "a", 2, 20, 3);
    const primes = [3, 5, 7, 11, 13, 17, 19];
    let pIdx = 2;
    const pLab = document.createElement("label");
    pLab.innerHTML = `素数 p <span data-v="p">7</span>
      <input type="range" min="0" max="${primes.length - 1}" value="2" data-k="p"/>`;
    ui.ctrl.appendChild(pLab);
    const pIn = pLab.querySelector("input");

    function modPow(base, exp, mod) {
      let r = 1n;
      let b = BigInt(base) % BigInt(mod);
      let e = BigInt(exp);
      const m = BigInt(mod);
      while (e > 0n) {
        if (e & 1n) r = (r * b) % m;
        b = (b * b) % m;
        e >>= 1n;
      }
      return Number(r);
    }

    function draw() {
      const a = +aIn.value;
      const p = primes[+pIn.value];
      ui.wrap.querySelector('[data-v="p"]').textContent = p;
      const ok = a % p !== 0;
      const val = ok ? modPow(a, p - 1, p) : null;
      // bars for a^k mod p
      let bars = "";
      const maxK = Math.min(p, 16);
      for (let k = 1; k <= maxK; k++) {
        const v = modPow(a, k, p);
        const h = (v / p) * 180 + 8;
        const x = 40 + k * 34;
        const hi = k === p - 1;
        bars += `<rect x="${x}" y="${260 - h}" width="28" height="${h}" rx="4"
          fill="${hi ? "#facc15" : "#60a5fa"}" opacity="0.85"/>
          <text x="${x + 14}" y="280" text-anchor="middle" fill="#94a3b8" font-size="10">${k}</text>
          <text x="${x + 14}" y="${250 - h}" text-anchor="middle" fill="#e2e8f0" font-size="11">${v}</text>`;
      }
      ui.svg.innerHTML = `
        <rect width="640" height="320" fill="#0b1220"/>
        <text x="24" y="28" fill="#94a3b8" font-size="13">纵轴：a^k mod p　黄柱 = k=p−1</text>
        ${bars}
        <text x="24" y="310" fill="#64748b" font-size="12">k →</text>
      `;
      ui.side.innerHTML = ok
        ? `<div class="ix-kv"><span>a</span><b>${a}</b></div>
           <div class="ix-kv"><span>p</span><b>${p}</b></div>
           <div class="ix-kv hi"><span>a^{p−1} mod p</span><b>${val}</b></div>
           <p class="ix-note">${val === 1 ? "等于 1 ✓ 费马小定理" : "应在 p 不整除 a 时为 1"}</p>`
        : `<p class="ix-note">p 整除 a 时，用 a^p ≡ a (mod p) 形式。</p>
           <div class="ix-kv hi"><span>a^p mod p</span><b>${modPow(a, p, p)}</b></div>
           <div class="ix-kv"><span>a mod p</span><b>${a % p}</b></div>`;
      ui.out.innerHTML = ok
        ? `定理：a^{p−1} ≡ 1 (mod p)。当前 <b>${a}^{${p - 1}} ≡ ${val} (mod ${p})</b>。`
        : `p | a 时看 a^p ≡ a：${modPow(a, p, p)} ≡ ${a % p} (mod ${p})。`;
    }
    pIn.addEventListener("input", draw);
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ===== 柯西-施瓦茨：两向量点积 ===== */
  W["cauchy-schwarz"] = function () {
    const ui = card("柯西–施瓦茨 · 向量", "拖两向量夹角与长度，看 |u·v| 与 ‖u‖‖v‖");
    const ang = range(ui.ctrl, "ang", "夹角°", 0, 180, 40);
    const lu = range(ui.ctrl, "lu", "‖u‖", 20, 120, 80);
    const lv = range(ui.ctrl, "lv", "‖v‖", 20, 120, 70);

    function draw() {
      const th = (+ang.value * Math.PI) / 180;
      const U = +lu.value,
        V = +lv.value;
      const dot = U * V * Math.cos(th);
      const bound = U * V;
      const cx = 200,
        cy = 180,
        sc = 1.2;
      const ux = cx + U * sc,
        uy = cy;
      const vx = cx + V * sc * Math.cos(th),
        vy = cy - V * sc * Math.sin(th);
      ui.svg.innerHTML = `
        <rect width="640" height="320" fill="#0b1220"/>
        <line x1="40" y1="${cy}" x2="400" y2="${cy}" stroke="#334155"/>
        <line x1="${cx}" y1="40" x2="${cx}" y2="280" stroke="#334155"/>
        <line x1="${cx}" y1="${cy}" x2="${ux}" y2="${uy}" stroke="#60a5fa" stroke-width="3"
          marker-end="url(#arr)"/>
        <line x1="${cx}" y1="${cy}" x2="${vx}" y2="${vy}" stroke="#fb923c" stroke-width="3"/>
        <path d="M ${cx + 40} ${cy} A 40 40 0 0 ${th > 0 ? 0 : 1} ${cx + 40 * Math.cos(th)} ${cy - 40 * Math.sin(th)}"
          fill="none" stroke="#facc15" stroke-width="2"/>
        <text x="420" y="80" fill="#60a5fa" font-size="14">u</text>
        <text x="420" y="110" fill="#fb923c" font-size="14">v</text>
        <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0L6,3L0,6" fill="#60a5fa"/></marker></defs>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>|u·v|</span><b>${Math.abs(dot).toFixed(1)}</b></div>
        <div class="ix-kv"><span>‖u‖‖v‖</span><b>${bound.toFixed(1)}</b></div>
        <div class="ix-kv hi"><span>比值 |cos θ|</span><b>${Math.abs(Math.cos(th)).toFixed(3)}</b></div>
        <p class="ix-note">|u·v| ≤ ‖u‖‖v‖ 永远成立；θ=0° 时等号。</p>
      `;
      ui.out.innerHTML = `|u·v| = ${Math.abs(dot).toFixed(1)} ≤ ${bound.toFixed(1)} = ‖u‖‖v‖　${Math.abs(dot) <= bound + 0.01 ? "✓" : ""}`;
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ===== 贝叶斯：疾病检测滑块 ===== */
  W["bayes"] = function () {
    const ui = card("贝叶斯 · 检测阳性后真有病？", "调患病率、真阳性率、假阳性率，看后验");
    const prev = range(ui.ctrl, "prev", "患病率 ‰", 1, 200, 10);
    const sens = range(ui.ctrl, "sens", "真阳性 %", 50, 100, 99);
    const fpr = range(ui.ctrl, "fpr", "假阳性 %", 0, 20, 1);

    function draw() {
      const pA = +prev.value / 1000; // prevalence
      const pBA = +sens.value / 100; // P(+|disease)
      const pBnot = +fpr.value / 100; // P(+|healthy)
      const pB = pBA * pA + pBnot * (1 - pA);
      const post = (pBA * pA) / pB;
      // population of 10000
      const N = 10000;
      const sick = Math.round(N * pA);
      const healthy = N - sick;
      const tp = Math.round(sick * pBA);
      const fp = Math.round(healthy * pBnot);
      const pos = tp + fp;

      // stacked bar visual
      const w = 500;
      const x0 = 60;
      ui.svg.innerHTML = `
        <rect width="640" height="320" fill="#0b1220"/>
        <text x="60" y="40" fill="#94a3b8" font-size="13">10,000 人中 · 阳性者构成</text>
        <rect x="${x0}" y="80" width="${w}" height="48" rx="8" fill="#1e293b" stroke="#475569"/>
        <rect x="${x0}" y="80" width="${(tp / Math.max(pos, 1)) * w}" height="48" rx="8" fill="#22c55e"/>
        <rect x="${x0 + (tp / Math.max(pos, 1)) * w}" y="80" width="${(fp / Math.max(pos, 1)) * w}" height="48" fill="#ef4444"/>
        <text x="60" y="160" fill="#22c55e" font-size="14">真阳性 TP ≈ ${tp}</text>
        <text x="280" y="160" fill="#ef4444" font-size="14">假阳性 FP ≈ ${fp}</text>
        <text x="60" y="200" fill="#e2e8f0" font-size="15">阳性总人数 ≈ ${pos}</text>
        <text x="60" y="240" fill="#facc15" font-size="18">后验 P(有病|阳性) ≈ ${(post * 100).toFixed(1)}%</text>
        <text x="60" y="280" fill="#94a3b8" font-size="12">绿=真有病 · 红=健康但测阳</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>先验</span><b>${(pA * 100).toFixed(2)}%</b></div>
        <div class="ix-kv"><span>P(+|病)</span><b>${sens.value}%</b></div>
        <div class="ix-kv"><span>P(+|健康)</span><b>${fpr.value}%</b></div>
        <div class="ix-kv hi"><span>后验</span><b>${(post * 100).toFixed(1)}%</b></div>
        <p class="ix-note">罕见病 + 非零假阳性 → 阳性后仍可能多数是假阳。</p>
      `;
      ui.out.innerHTML = `P(A|B)=P(B|A)P(A)/P(B)。检测很准也不等于「阳性=确诊」。`;
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ===== 二项式：杨辉三角 + 展开 ===== */
  W["binomial"] = function () {
    const ui = card("二项式 · 杨辉三角", "选 n，看 (a+b)^n 系数与 C(n,k)");
    const nIn = range(ui.ctrl, "n", "n", 0, 10, 5);

    function binom(n, k) {
      if (k < 0 || k > n) return 0;
      let r = 1;
      for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
      return Math.round(r);
    }

    function draw() {
      const n = +nIn.value;
      let rows = "";
      for (let r = 0; r <= n; r++) {
        let cells = "";
        for (let k = 0; k <= r; k++) {
          const v = binom(r, k);
          const hi = r === n;
          cells += `<span style="display:inline-block;min-width:2rem;margin:2px;padding:4px 6px;border-radius:6px;
            background:${hi ? "#1d4ed8" : "#1e293b"};color:#e2e8f0;font-size:13px;text-align:center">${v}</span>`;
        }
        rows += `<div style="text-align:center">${cells}</div>`;
      }
      // use foreignObject-ish via side for HTML triangle, svg for expansion
      let terms = [];
      for (let k = 0; k <= n; k++) {
        const c = binom(n, k);
        const a = n - k === 0 ? "" : n - k === 1 ? "a" : `a^${n - k}`;
        const b = k === 0 ? "" : k === 1 ? "b" : `b^${k}`;
        const coef = c === 1 && (a || b) ? "" : String(c);
        terms.push(`${coef}${a}${b}` || "1");
      }
      ui.svg.innerHTML = `
        <rect width="640" height="320" fill="#0b1220"/>
        <text x="24" y="36" fill="#94a3b8" font-size="14">(a+b)^${n} 展开系数（第 n 行高亮在右侧）</text>
        <text x="24" y="90" fill="#facc15" font-size="16" font-family="Consolas,monospace">${terms.join(" + ")}</text>
        <text x="24" y="150" fill="#60a5fa" font-size="14">Σ C(${n},k) = 2^${n} = ${1 << n}</text>
        <text x="24" y="200" fill="#e2e8f0" font-size="13">组合：从 n 个括号里选 k 个贡献 b</text>
        <text x="24" y="260" fill="#94a3b8" font-size="12">C(${n},0)…C(${n},${n}) = ${Array.from({ length: n + 1 }, (_, k) => binom(n, k)).join(", ")}</text>
      `;
      ui.side.innerHTML = `
        <div style="font-size:12px;line-height:1.6;max-height:260px;overflow:auto">${rows}</div>
        <p class="ix-note">蓝行 = 当前 n 的系数。</p>
      `;
      ui.out.innerHTML = `(a+b)^n = Σ C(n,k) a^{n−k} b^k。杨辉三角：每数 = 肩上两数之和。`;
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ===== 余弦定理：拖夹角 ===== */
  W["law-of-cosines"] = function () {
    const ui = card("余弦定理 · 斜三角形", "固定 a,b，拖夹角 C，看对边 c");
    const aIn = range(ui.ctrl, "a", "边 a", 40, 140, 90);
    const bIn = range(ui.ctrl, "b", "边 b", 40, 140, 70);
    const cAng = range(ui.ctrl, "C", "角 C°", 10, 170, 60);

    function draw() {
      const a = +aIn.value,
        b = +bIn.value,
        C = (+cAng.value * Math.PI) / 180;
      const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
      const cx = 220,
        cy = 220,
        sc = 1.1;
      // place C at origin, side b along x, side a at angle C
      const Bx = cx + b * sc,
        By = cy;
      const Ax = cx + a * sc * Math.cos(C),
        Ay = cy - a * sc * Math.sin(C);
      const pythag = Math.sqrt(a * a + b * b);
      ui.svg.innerHTML = `
        <rect width="640" height="320" fill="#0b1220"/>
        <polygon points="${cx},${cy} ${Bx},${By} ${Ax},${Ay}" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" stroke-width="2"/>
        <text x="${(cx + Bx) / 2}" y="${cy + 24}" fill="#94a3b8" font-size="13">b</text>
        <text x="${(cx + Ax) / 2 - 16}" y="${(cy + Ay) / 2}" fill="#94a3b8" font-size="13">a</text>
        <text x="${(Ax + Bx) / 2 + 8}" y="${(Ay + By) / 2}" fill="#facc15" font-size="14">c</text>
        <text x="${cx + 20}" y="${cy - 10}" fill="#facc15" font-size="13">C</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>a,b</span><b>${a}, ${b}</b></div>
        <div class="ix-kv"><span>角 C</span><b>${cAng.value}°</b></div>
        <div class="ix-kv hi"><span>c</span><b>${c.toFixed(1)}</b></div>
        <div class="ix-kv"><span>√(a²+b²) 直角</span><b>${pythag.toFixed(1)}</b></div>
        <p class="ix-note">${Math.abs(cAng.value - 90) < 2 ? "直角：退化为勾股" : cAng.value > 90 ? "钝角：c 更长" : "锐角：c 较短"}</p>
      `;
      ui.out.innerHTML = `c² = a²+b²−2ab cos C = ${c.toFixed(2)}²。C=90° 时 cos=0 → 勾股。`;
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ===== 七桥 / 一笔画 ===== */
  W["euler-bridges"] = function () {
    const ui = card("一笔画 · 奇度点", "切换图：看奇度顶点个数能否一笔画");
    const graphs = {
      konigsberg: {
        name: "柯尼斯堡七桥",
        // positions and edges
        nodes: [
          [200, 80],
          [120, 200],
          [280, 200],
          [200, 280]
        ],
        edges: [
          [0, 1],
          [0, 1],
          [0, 2],
          [0, 2],
          [0, 3],
          [1, 3],
          [2, 3]
        ]
      },
      envelope: {
        name: "信封形",
        nodes: [
          [140, 80],
          [300, 80],
          [140, 220],
          [300, 220],
          [220, 40]
        ],
        edges: [
          [0, 1],
          [0, 2],
          [1, 3],
          [2, 3],
          [0, 3],
          [1, 2],
          [0, 4],
          [1, 4]
        ]
      },
      square: {
        name: "正方形",
        nodes: [
          [160, 100],
          [300, 100],
          [300, 240],
          [160, 240]
        ],
        edges: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0]
        ]
      },
      path2: {
        name: "两点奇度",
        nodes: [
          [120, 160],
          [220, 80],
          [320, 160],
          [220, 240]
        ],
        edges: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
          [0, 2]
        ]
      }
    };
    let cur = "konigsberg";
    Object.keys(graphs).forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ix-btn";
      b.textContent = graphs[k].name;
      b.addEventListener("click", () => {
        cur = k;
        draw();
      });
      ui.ctrl.appendChild(b);
    });

    function draw() {
      const g = graphs[cur];
      const deg = g.nodes.map(() => 0);
      g.edges.forEach(([u, v]) => {
        deg[u]++;
        deg[v]++;
      });
      const odd = deg.filter((d) => d % 2 === 1).length;
      let verdict =
        odd === 0 ? "有欧拉回路（一笔画可回到起点）" : odd === 2 ? "有欧拉路径（可不回到起点）" : "不能一笔画（奇度点 > 2）";

      let edges = "";
      g.edges.forEach(([u, v], i) => {
        const [x1, y1] = g.nodes[u];
        const [x2, y2] = g.nodes[v];
        // offset multi-edges
        const off = (i % 3) * 4 - 4;
        edges += `<line x1="${x1 + off}" y1="${y1 + off}" x2="${x2 + off}" y2="${y2 + off}"
          stroke="#60a5fa" stroke-width="3" opacity="0.8"/>`;
      });
      let nodes = "";
      g.nodes.forEach(([x, y], i) => {
        const oddN = deg[i] % 2 === 1;
        nodes += `<circle cx="${x}" cy="${y}" r="18" fill="${oddN ? "#422006" : "#1e293b"}" stroke="${oddN ? "#facc15" : "#94a3b8"}" stroke-width="2"/>
          <text x="${x}" y="${y + 5}" text-anchor="middle" fill="#e2e8f0" font-size="12">${deg[i]}</text>`;
      });
      ui.svg.innerHTML = `
        <rect width="640" height="320" fill="#0b1220"/>
        ${edges}${nodes}
        <text x="400" y="60" fill="#e2e8f0" font-size="14">${g.name}</text>
        <text x="400" y="100" fill="#facc15" font-size="14">奇度点：${odd} 个</text>
        <text x="400" y="140" fill="#94a3b8" font-size="12">黄圈 = 奇度顶点</text>
        <text x="400" y="200" fill="#4ade80" font-size="13" width="200">${verdict}</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>顶点数</span><b>${g.nodes.length}</b></div>
        <div class="ix-kv"><span>边数</span><b>${g.edges.length}</b></div>
        <div class="ix-kv hi"><span>奇度点数</span><b>${odd}</b></div>
        <p class="ix-note">0 个奇度 → 回路；2 个 → 路径；≥4 → 不可能。</p>
      `;
      ui.out.innerHTML = verdict + "（连通图）";
    }
    draw();
    return ui.wrap;
  };

  /* ===== 泰勒：多项式逼近 ===== */
  W["taylor"] = function () {
    const ui = card("泰勒 · 逼近 e^x / sin x", "选函数与阶数，看多项式贴合");
    const funs = ["exp", "sin"];
    let fi = 0;
    const nIn = range(ui.ctrl, "n", "阶数 n", 0, 10, 3);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ix-btn";
    btn.textContent = "切换 e^x / sin x";
    btn.addEventListener("click", () => {
      fi = 1 - fi;
      draw();
    });
    ui.ctrl.appendChild(btn);

    function fact(k) {
      let r = 1;
      for (let i = 2; i <= k; i++) r *= i;
      return r;
    }

    function taylorExp(x, n) {
      let s = 0;
      for (let k = 0; k <= n; k++) s += Math.pow(x, k) / fact(k);
      return s;
    }
    function taylorSin(x, n) {
      // only odd powers: sum (-1)^m x^{2m+1}/(2m+1)! for terms up to degree n
      let s = 0;
      for (let k = 0; k <= n; k++) {
        if (k % 2 === 0) continue; // only odd for sin from 0; actually sin uses 1,3,5...
      }
      // standard: for m=0,1,... while 2m+1 <= n
      for (let m = 0; 2 * m + 1 <= n; m++) {
        s += ((m % 2 === 0 ? 1 : -1) * Math.pow(x, 2 * m + 1)) / fact(2 * m + 1);
      }
      if (n === 0) return 0;
      return s;
    }

    function draw() {
      const n = +nIn.value;
      const name = funs[fi];
      const f = (x) => (name === "exp" ? Math.exp(x) : Math.sin(x));
      const p = (x) => (name === "exp" ? taylorExp(x, n) : taylorSin(x, n));
      const x0 = -2.5,
        x1 = 2.5;
      const ox = 60,
        oy = 160,
        sx = 100,
        sy = 40;
      const X = (x) => ox + (x - x0) * ((500) / (x1 - x0));
      const Y = (y) => oy - y * sy;

      let pathF = "",
        pathP = "";
      for (let i = 0; i <= 80; i++) {
        const x = x0 + ((x1 - x0) * i) / 80;
        pathF += `${i ? "L" : "M"}${X(x)},${Y(f(x))} `;
        pathP += `${i ? "L" : "M"}${X(x)},${Y(p(x))} `;
      }
      const err = Math.abs(f(1) - p(1));
      ui.svg.innerHTML = `
        <rect width="640" height="320" fill="#0b1220"/>
        <line x1="40" y1="${oy}" x2="600" y2="${oy}" stroke="#334155"/>
        <path d="${pathF}" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
        <path d="${pathP}" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="6 3"/>
        <text x="420" y="40" fill="#60a5fa" font-size="13">真函数 ${name === "exp" ? "e^x" : "sin x"}</text>
        <text x="420" y="65" fill="#facc15" font-size="13">泰勒 n=${n}</text>
        <text x="420" y="100" fill="#e2e8f0" font-size="13">在 x=1：误差 |f−P|≈${err.toFixed(5)}</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>函数</span><b>${name === "exp" ? "e^x" : "sin x"}</b></div>
        <div class="ix-kv"><span>阶数</span><b>${n}</b></div>
        <div class="ix-kv hi"><span>x=1 误差</span><b>${err.toFixed(5)}</b></div>
        <p class="ix-note">阶数越高，黄线越贴蓝线（在收敛半径内）。</p>
      `;
      ui.out.innerHTML = `在 x₀=0 处展开。阶数升高 → 局部逼近更好。`;
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* ===== 夹逼：上下界 ===== */
  W["sandwich"] = function () {
    const ui = card("夹逼 · x sin(1/x) → 0", "蓝线夹在 ±|x| 之间，x→0 时上下都→0");
    const zIn = range(ui.ctrl, "z", "放大中心附近", 10, 100, 40);

    function draw() {
      const zoom = +zIn.value / 20; // domain half-width
      const x0 = -zoom,
        x1 = zoom;
      const ox = 60,
        oy = 160,
        W = 520,
        H = 200;
      const X = (x) => ox + ((x - x0) / (x1 - x0)) * W;
      const Y = (y) => oy - (y / zoom) * (H / 2);

      let f = "",
        up = "",
        lo = "";
      for (let i = 0; i <= 120; i++) {
        const x = x0 + ((x1 - x0) * i) / 120;
        if (Math.abs(x) < 1e-6) continue;
        const y = x * Math.sin(1 / x);
        const cmd = f ? "L" : "M";
        f += `${cmd}${X(x)},${Y(y)} `;
        up += `${up ? "L" : "M"}${X(x)},${Y(Math.abs(x))} `;
        lo += `${lo ? "L" : "M"}${X(x)},${Y(-Math.abs(x))} `;
      }
      ui.svg.innerHTML = `
        <rect width="640" height="320" fill="#0b1220"/>
        <line x1="40" y1="${oy}" x2="600" y2="${oy}" stroke="#334155"/>
        <path d="${up}" fill="none" stroke="#22c55e" stroke-width="2"/>
        <path d="${lo}" fill="none" stroke="#22c55e" stroke-width="2"/>
        <path d="${f}" fill="none" stroke="#60a5fa" stroke-width="1.5"/>
        <text x="420" y="40" fill="#22c55e" font-size="13">±|x| 上下界</text>
        <text x="420" y="65" fill="#60a5fa" font-size="13">x sin(1/x)</text>
        <text x="420" y="100" fill="#facc15" font-size="13">x→0 时都挤向 0</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>窗口半宽</span><b>${zoom.toFixed(2)}</b></div>
        <div class="ix-kv hi"><span>极限</span><b>0</b></div>
        <p class="ix-note">−|x| ≤ x sin(1/x) ≤ |x|，两边 →0，故中间 →0。</p>
      `;
      ui.out.innerHTML = `夹逼：g≤f≤h 且 lim g=lim h=L ⇒ lim f=L。`;
    }
    bind(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  console.info("diagrams-more: registered", [
    "fermat-little",
    "cauchy-schwarz",
    "bayes",
    "binomial",
    "law-of-cosines",
    "euler-bridges",
    "taylor",
    "sandwich"
  ]);
})();
