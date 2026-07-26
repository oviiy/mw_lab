/**
 * 高细节交互图解层 —— 覆盖/扩展 Diagrams.widgets
 * 分步、标注、双栏、数值联动
 */
(function () {
  if (!window.Diagrams || !window.Diagrams.widgets) return;
  const W = window.Diagrams.widgets;

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function shell(opts) {
    const wrap = el(`<div class="ix-card ix-pro"></div>`);
    wrap.innerHTML = `
      <div class="ix-head">
        <div>
          <div class="ix-title">${opts.title}</div>
          <p class="ix-desc">${opts.desc || ""}</p>
        </div>
        ${opts.badge ? `<span class="ix-badge">${opts.badge}</span>` : ""}
      </div>
      ${opts.steps ? `<div class="ix-steps" data-steps></div>` : ""}
      <div class="ix-controls" data-ctrl></div>
      <div class="ix-stage">
        <svg viewBox="0 0 ${opts.w || 640} ${opts.h || 340}" class="ix-svg" data-svg></svg>
        ${opts.side ? `<div class="ix-side" data-side></div>` : ""}
      </div>
      <div class="ix-readout" data-out></div>
      ${opts.formula ? `<div class="ix-formula" data-formula>${opts.formula}</div>` : ""}
    `;
    return {
      wrap,
      svg: wrap.querySelector("[data-svg]"),
      out: wrap.querySelector("[data-out]"),
      ctrl: wrap.querySelector("[data-ctrl]"),
      side: wrap.querySelector("[data-side]"),
      stepsEl: wrap.querySelector("[data-steps]"),
      formula: wrap.querySelector("[data-formula]")
    };
  }

  function addRange(ctrl, key, label, min, max, val, step) {
    const lab = document.createElement("label");
    lab.innerHTML = `${label} <span data-v="${key}">${val}</span>
      <input type="range" min="${min}" max="${max}" value="${val}" step="${step || 1}" data-k="${key}"/>`;
    ctrl.appendChild(lab);
    return lab.querySelector("input");
  }

  function addBtn(ctrl, text, cls) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ix-btn" + (cls ? " " + cls : "");
    b.textContent = text;
    ctrl.appendChild(b);
    return b;
  }

  function bindRanges(wrap, onChange) {
    wrap.querySelectorAll("input[type=range]").forEach((inp) => {
      inp.addEventListener("input", () => {
        const sp = wrap.querySelector(`[data-v="${inp.dataset.k}"]`);
        if (sp) sp.textContent = inp.value;
        onChange();
      });
    });
  }

  function setSteps(stepsEl, labels, active) {
    if (!stepsEl) return;
    stepsEl.innerHTML = labels
      .map(
        (t, i) =>
          `<button type="button" class="ix-step ${i === active ? "on" : i < active ? "done" : ""}" data-si="${i}">${i + 1}. ${t}</button>`
      )
      .join("");
  }

  /* =========================================================
   * 挂谷：详细两管 + 重叠度量
   * ========================================================= */
  W["kakeya-tubes"] = function () {
    const ui = shell({
      title: "细管重叠 · 几何度量",
      desc: "两根长度 1、宽度 δ 的管，夹角 θ。黄区 = 交。右侧同步 δ²/sinθ 与证明用到的量级。",
      badge: "挂谷 · 二维",
      w: 640,
      h: 360,
      side: true,
      formula: "|T₁ ∩ T₂|  ≲  δ² / sinθ",
      steps: true
    });
    const stepLabels = ["画两管", "标夹角 θ", "看重叠区", "调 δ 与 θ", "联系 L²"];
    let step = 0;
    const thIn = addRange(ui.ctrl, "th", "θ (°)", 8, 85, 35);
    const dIn = addRange(ui.ctrl, "d", "δ (宽)", 8, 40, 20);
    addBtn(ui.ctrl, "下一步").onclick = () => {
      step = Math.min(4, step + 1);
      draw();
    };
    addBtn(ui.ctrl, "重置").onclick = () => {
      step = 0;
      draw();
    };

    function tube(cx, cy, ang, len, hw) {
      const a = (ang * Math.PI) / 180;
      const dx = Math.cos(a),
        dy = Math.sin(a);
      const px = -dy * hw,
        py = dx * hw;
      const x0 = cx - (dx * len) / 2,
        y0 = cy - (dy * len) / 2;
      const x1 = cx + (dx * len) / 2,
        y1 = cy + (dy * len) / 2;
      return [
        [x0 + px, y0 + py],
        [x1 + px, y1 + py],
        [x1 - px, y1 - py],
        [x0 - px, y0 - py]
      ];
    }
    function ps(pts) {
      return pts.map((p) => p.join(",")).join(" ");
    }
    function overlap(thDeg, hw) {
      const th = (thDeg * Math.PI) / 180;
      const n1 = [0, 1],
        n2 = [-Math.sin(th), Math.cos(th)];
      function hit(na, ca, nb, cb) {
        const det = na[0] * nb[1] - na[1] * nb[0];
        return [(ca * nb[1] - cb * na[1]) / det, (na[0] * cb - nb[0] * ca) / det];
      }
      const cs = [
        hit(n1, hw, n2, hw),
        hit(n1, hw, n2, -hw),
        hit(n1, -hw, n2, -hw),
        hit(n1, -hw, n2, hw)
      ];
      cs.sort((p, q) => Math.atan2(p[1], p[0]) - Math.atan2(q[1], q[0]));
      return cs.map(([x, y]) => [280 + x * 2.4, 180 + y * 2.4]);
    }

    function draw() {
      setSteps(ui.stepsEl, stepLabels, step);
      ui.stepsEl.querySelectorAll(".ix-step").forEach((b) =>
        b.addEventListener("click", () => {
          step = +b.dataset.si;
          draw();
        })
      );
      const th = +thIn.value,
        d = +dIn.value,
        hw = d / 2;
      const thR = (th * Math.PI) / 180;
      const area = (d * d) / Math.max(Math.sin(thR), 0.05);
      const t1 = tube(280, 180, 0, 300, hw);
      const t2 = tube(280, 180, -th, 300, hw);
      const ov = overlap(th, hw);
      const showT2 = step >= 0;
      const showAng = step >= 1;
      const showOv = step >= 2;
      const dim = step >= 3;

      ui.svg.innerHTML = `
        <defs>
          <marker id="ah" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#e2e8f0"/></marker>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#1a2332" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="640" height="360" fill="#0b1220"/>
        <rect width="640" height="360" fill="url(#grid)"/>
        <polygon points="${ps(t1)}" fill="rgba(96,165,250,${showOv ? 0.28 : 0.4})" stroke="#60a5fa" stroke-width="2"/>
        ${
          showT2
            ? `<polygon points="${ps(t2)}" fill="rgba(251,146,60,${showOv ? 0.28 : 0.4})" stroke="#fb923c" stroke-width="2"/>`
            : ""
        }
        ${
          showOv
            ? `<polygon points="${ps(ov)}" fill="rgba(250,204,21,0.55)" stroke="#facc15" stroke-width="2.5"/>
               <text x="280" y="175" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="700">重叠</text>`
            : ""
        }
        ${
          showAng
            ? `<path d="M 340 180 A 50 50 0 0 0 ${340 + 50 * Math.cos((-th * Math.PI) / 180)} ${180 + 50 * Math.sin((-th * Math.PI) / 180)}"
                fill="none" stroke="#e2e8f0" stroke-width="1.5" marker-end="url(#ah)"/>
               <text x="400" y="165" fill="#f8fafc" font-size="16">θ=${th}°</text>`
            : ""
        }
        ${
          dim
            ? `<line x1="80" y1="300" x2="80" y2="${300 - d}" stroke="#f472b6" stroke-width="3"/>
               <text x="90" y="${300 - d / 2}" fill="#f472b6" font-size="13">δ=${d}</text>
               <text x="24" y="40" fill="#94a3b8" font-size="12">长度方向 ≈ 单位段加粗</text>`
            : ""
        }
        <text x="24" y="340" fill="#64748b" font-size="12">管 A 蓝 · 管 B 橙 · 交 黄</text>
      `;

      ui.side.innerHTML = `
        <div class="ix-kv"><span>夹角 θ</span><b>${th}°</b></div>
        <div class="ix-kv"><span>sin θ</span><b>${Math.sin(thR).toFixed(3)}</b></div>
        <div class="ix-kv"><span>管宽 δ</span><b>${d}</b></div>
        <div class="ix-kv"><span>δ²</span><b>${(d * d).toFixed(0)}</b></div>
        <div class="ix-kv hi"><span>δ²/sinθ</span><b>${area.toFixed(1)}</b></div>
        <p class="ix-note">${
          step < 2
            ? "点「下一步」或步骤条，先理解两管如何相交。"
            : step < 4
              ? "θ 变大 → 黄区迅速变小；δ 变小 → 整体变瘦。"
              : "证明里对所有管对 (j,k) 把 |Tⱼ∩Tₖ| 用此量级求和 → ∫f² ≲ log(1/δ)。"
        }</p>
      `;
      ui.out.innerHTML =
        step === 4
          ? `L² 关键：∫(∑1_T)² = ∑_{j,k}|Tⱼ∩Tₖ| ≲ ∑δ + ∑_{j≠k} δ²/θ_{jk} ≲ <b>log(1/δ)</b>。再配柯西 ⇒ |并集| ≳ 1/log。`
          : `当前估计重叠面积量级 <code>${area.toFixed(1)}</code>（相对单位）。试把 θ 拖到 80° 再拖到 10°。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 挂谷：多管 L² 演示
   * ========================================================= */
  W["kakeya-l2"] = function () {
    const ui = shell({
      title: "多管并集 · L² 思想实验",
      desc: "方向均匀分布的 N 根细管。观察并集「覆盖像素」与 ∑ 单管面积的比 = 重叠效率。",
      badge: "挂谷 · 定量",
      w: 640,
      h: 360,
      side: true,
      formula: "(∫f)² ≤ |⋃| · ∫f²"
    });
    const nIn = addRange(ui.ctrl, "n", "管数 N", 3, 24, 10);
    const dIn = addRange(ui.ctrl, "d", "宽度", 4, 18, 8);

    function draw() {
      const N = +nIn.value,
        d = +dIn.value;
      const cx = 220,
        cy = 180,
        len = 200;
      let polys = "";
      // rasterize crude coverage on grid
      const gw = 80,
        gh = 60,
        cell = 4;
      const grid = new Uint8Array(gw * gh);
      const ox = 40,
        oy = 40;
      for (let j = 0; j < N; j++) {
        const ang = (j * Math.PI) / N;
        const dx = Math.cos(ang),
          dy = Math.sin(ang);
        const px = -dy * (d / 2),
          py = dx * (d / 2);
        const x0 = cx - dx * len,
          y0 = cy - dy * len;
        const x1 = cx + dx * len,
          y1 = cy + dy * len;
        const pts = [
          [x0 + px, y0 + py],
          [x1 + px, y1 + py],
          [x1 - px, y1 - py],
          [x0 - px, y0 - py]
        ];
        polys += `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="rgba(96,165,250,0.15)" stroke="rgba(147,197,253,0.5)" stroke-width="1"/>`;
        // stamp grid
        for (let t = 0; t <= 40; t++) {
          const x = x0 + ((x1 - x0) * t) / 40;
          const y = y0 + ((y1 - y0) * t) / 40;
          for (let s = -d / 2; s <= d / 2; s += 2) {
            const xx = x + px * (s / (d / 2 || 1));
            const yy = y + py * (s / (d / 2 || 1));
            const gx = Math.floor((xx - ox) / cell);
            const gy = Math.floor((yy - oy) / cell);
            if (gx >= 0 && gy >= 0 && gx < gw && gy < gh) grid[gy * gw + gx] = 1;
          }
        }
      }
      let cover = 0;
      for (let i = 0; i < grid.length; i++) cover += grid[i];
      const unionApprox = cover * cell * cell;
      const sumArea = N * (2 * len) * d * 0.15; // visual scale
      const ratio = sumArea / Math.max(unionApprox, 1);

      ui.svg.innerHTML = `
        <rect width="640" height="360" fill="#0b1220"/>
        ${polys}
        <circle cx="${cx}" cy="${cy}" r="3" fill="#fbbf24"/>
        <text x="420" y="40" fill="#94a3b8" font-size="12">中心交汇 · 方向均匀</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>管数 N</span><b>${N}</b></div>
        <div class="ix-kv"><span>单管视觉面积</span><b>${(sumArea / N).toFixed(0)}</b></div>
        <div class="ix-kv"><span>∑|T|</span><b>${sumArea.toFixed(0)}</b></div>
        <div class="ix-kv"><span>|⋃| 约</span><b>${unionApprox.toFixed(0)}</b></div>
        <div class="ix-kv hi"><span>重叠比 ∑/|⋃|</span><b>${ratio.toFixed(2)}</b></div>
        <p class="ix-note">比值 &gt;1 表示大量重叠。挂谷构造追求：方向齐全却 |⋃| 尽量小。</p>
      `;
      ui.out.innerHTML = `f=∑1_T 时 ∫f=∑|T|，∫f² 反映两两重叠。柯西：(∫f)²≤|⋃|∫f² 给出并集下界——维数证明的引擎。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 勾股：完整拼图（可拆步）
   * ========================================================= */
  W["pythagoras-tiles"] = function () {
    const ui = shell({
      title: "勾股拼图 · 面积算两次",
      desc: "四个全等直角三角形 + 中间 c×c。调节 a,b；分步显示面积恒等式。",
      badge: "勾股",
      w: 640,
      h: 380,
      side: true,
      formula: "(a+b)² = 4·(ab/2) + c²  ⇒  a²+b²=c²",
      steps: true
    });
    const labels = ["摆出直角三角形", "拼成 (a+b)²", "标出内正方形 c²", "写面积等式", "消去 2ab"];
    let step = 0;
    const aIn = addRange(ui.ctrl, "a", "a", 20, 80, 40);
    const bIn = addRange(ui.ctrl, "b", "b", 20, 90, 55);
    addBtn(ui.ctrl, "下一步").onclick = () => {
      step = Math.min(4, step + 1);
      draw();
    };

    function draw() {
      setSteps(ui.stepsEl, labels, step);
      ui.stepsEl.querySelectorAll(".ix-step").forEach((b) =>
        b.addEventListener("click", () => {
          step = +b.dataset.si;
          draw();
        })
      );
      const a = +aIn.value,
        b = +bIn.value;
      const c = Math.sqrt(a * a + b * b);
      const S = a + b;
      const sc = 200 / S;
      const A = a * sc,
        B = b * sc,
        side = S * sc;
      const ox = 40,
        oy = 40;

      // outer square corners
      // triangles at sides - classic arrangement:
      // bottom: right angle at bottom-left area
      const T1 = `${ox},${oy + side} ${ox + A},${oy + side} ${ox},${oy + side - B}`; // wait
      // Standard: outer square side a+b
      // Triangle 1 bottom-left: vertices (0,b), (0,0), (a,0) in local - legs a horizontal b vertical outward... 
      // Use: 
      // TL triangle pointing: (0,0)-(b,0)-(0,a) NO
      // Arrangement from earlier proof:
      // corners of inner square are at distance along edges

      // Inner square vertices (going around):
      // P1 = (b, 0) top area of bottom edge... Let's place outer square [0,side]^2 with origin top-left in svg y-down:
      // Outer: (ox,oy) to (ox+side, oy+side)
      // Four triangles:
      // Top edge: from (ox,oy) to (ox+side,oy); triangle hangs down with leg b along top from left? 
      // Simpler visual: show one right triangle big + algebra on side when step low; full square when step>=1

      let body = "";
      if (step === 0) {
        // single triangle
        body = `
          <polygon points="${ox},${oy + B * 1.2} ${ox + A * 1.2},${oy + B * 1.2} ${ox},${oy}" 
            fill="rgba(96,165,250,0.4)" stroke="#60a5fa" stroke-width="2"/>
          <rect x="${ox}" y="${oy + B * 1.2 - 14}" width="14" height="14" fill="none" stroke="#facc15" stroke-width="2"/>
          <text x="${ox + A * 0.5}" y="${oy + B * 1.2 + 24}" fill="#93c5fd" font-size="14">a=${a}</text>
          <text x="${ox - 28}" y="${oy + B * 0.6}" fill="#93c5fd" font-size="14">b=${b}</text>
          <text x="${ox + A * 0.55}" y="${oy + B * 0.55}" fill="#facc15" font-size="14">c≈${c.toFixed(1)}</text>
        `;
      } else {
        // full van Schooten-style: outer square, 4 triangles, inner square
        // vertices of outer square
        const O = [ox, oy],
          R = [ox + side, oy],
          Br = [ox + side, oy + side],
          L = [ox, oy + side];
        // Place triangles with hypotenuse inward
        // Top triangle: legs along top: left leg vertical down a? 
        // Standard dissection:
        // Triangle positions (right angle at outer edge mid-ish):
        // Bottom: right angle bottom-leftish: (ox, oy+side), (ox+A, oy+side), (ox, oy+side-B)
        const tri = [
          [
            [ox, oy + side],
            [ox + A, oy + side],
            [ox, oy + side - B]
          ],
          [
            [ox + side, oy + side],
            [ox + side, oy + side - A],
            [ox + side - B, oy + side]
          ],
          [
            [ox + side, oy],
            [ox + side - A, oy],
            [ox + side, oy + B]
          ],
          [
            [ox, oy],
            [ox, oy + A],
            [ox + B, oy]
          ]
        ];
        const cols = ["#60a5fa", "#fb923c", "#c084fc", "#34d399"];
        tri.forEach((t, i) => {
          if (step >= 1)
            body += `<polygon points="${t.map((p) => p.join(",")).join(" ")}" fill="${cols[i]}55" stroke="${cols[i]}" stroke-width="2"/>`;
        });
        // inner square corners = free vertices of triangles
        const inner = [
          [ox + B, oy + A],
          [ox + side - A, oy + B],
          [ox + side - B, oy + side - A],
          [ox + A, oy + side - B]
        ];
        if (step >= 2) {
          body += `<polygon points="${inner.map((p) => p.join(",")).join(" ")}" fill="rgba(250,204,21,0.35)" stroke="#facc15" stroke-width="2.5"/>
            <text x="${ox + side / 2}" y="${oy + side / 2}" text-anchor="middle" fill="#facc15" font-size="16">c²</text>`;
        }
        body += `<rect x="${ox}" y="${oy}" width="${side}" height="${side}" fill="none" stroke="#64748b" stroke-width="2"/>`;
        body += `<text x="${ox + side / 2}" y="${oy + side + 28}" text-anchor="middle" fill="#94a3b8" font-size="13">边长 a+b=${S}</text>`;
      }

      ui.svg.innerHTML = `<rect width="640" height="380" fill="#0b1220"/>${body}`;

      const left = S * S;
      const right = 2 * a * b + c * c;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>a</span><b>${a}</b></div>
        <div class="ix-kv"><span>b</span><b>${b}</b></div>
        <div class="ix-kv"><span>c=√(a²+b²)</span><b>${c.toFixed(2)}</b></div>
        <div class="ix-kv"><span>(a+b)²</span><b>${left}</b></div>
        <div class="ix-kv"><span>2ab+c²</span><b>${right.toFixed(1)}</b></div>
        <div class="ix-kv hi"><span>a²+b² ? c²</span><b>${(a * a + b * b).toFixed(1)} = ${(c * c).toFixed(1)}</b></div>
        <p class="ix-note">${labels[step]}</p>
      `;
      ui.out.innerHTML =
        step >= 3
          ? `(a+b)² = a²+2ab+b² 且 = 2ab+c² ⇒ <b>a²+b²=c²</b>。数值：${left} = ${right.toFixed(1)}。`
          : `步骤 ${step + 1}/${labels.length}：${labels[step]}`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 康托：完整对角线表 + 构造 y
   * ========================================================= */
  W["cantor-diagonal"] = function () {
    const ui = shell({
      title: "对角线法 · 完整过程",
      desc: "假设置名单。改对角元得 y。高亮「与第 n 行第 n 位不同」。",
      badge: "康托",
      w: 640,
      h: 360,
      side: true,
      formula: "y 的第 n 位 ≠ xₙ 的第 n 位  ⇒  y ≠ 任一 xₙ",
      steps: true
    });
    const labels = ["列出名单", "标出对角线", "构造 y", "逐行比对", "结论不可数"];
    let step = 0;
    let grid = null;
    function regen() {
      grid = Array.from({ length: 6 }, () =>
        Array.from({ length: 8 }, () => Math.floor(Math.random() * 10))
      );
    }
    regen();
    addBtn(ui.ctrl, "换名单").onclick = () => {
      regen();
      draw();
    };
    addBtn(ui.ctrl, "下一步").onclick = () => {
      step = Math.min(4, step + 1);
      draw();
    };
    addBtn(ui.ctrl, "重来").onclick = () => {
      step = 0;
      draw();
    };

    function draw() {
      setSteps(ui.stepsEl, labels, step);
      ui.stepsEl.querySelectorAll(".ix-step").forEach((b) =>
        b.addEventListener("click", () => {
          step = +b.dataset.si;
          draw();
        })
      );
      const rows = 6,
        cols = 8;
      const y = grid.map((row, i) => (row[i] === 4 ? 5 : 4));
      let cells = "";
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = 50 + j * 38;
          const yy = 36 + i * 36;
          const diag = step >= 1 && i === j && j < rows;
          const mismatch = step >= 3 && i === j && j < rows;
          cells += `<rect x="${x}" y="${yy}" width="34" height="32" rx="4"
            fill="${diag ? "#422006" : "#1e293b"}" stroke="${mismatch ? "#f87171" : diag ? "#facc15" : "#334155"}" stroke-width="${mismatch ? 2.5 : 1}"/>
            <text x="${x + 17}" y="${yy + 21}" text-anchor="middle" fill="${diag ? "#facc15" : "#e2e8f0"}" font-size="14">${grid[i][j]}</text>`;
        }
        cells += `<text x="16" y="${56 + i * 36}" fill="#64748b" font-size="12">x${i + 1}</text>`;
      }
      let yrow = "";
      if (step >= 2) {
        for (let j = 0; j < rows; j++) {
          const x = 50 + j * 38;
          yrow += `<rect x="${x}" y="270" width="34" height="32" rx="4" fill="#14532d" stroke="#4ade80" stroke-width="2"/>
            <text x="${x + 17}" y="291" text-anchor="middle" fill="#bbf7d0" font-size="14">${y[j]}</text>`;
        }
        yrow += `<text x="16" y="290" fill="#4ade80" font-size="13">y</text>`;
      }
      ui.svg.innerHTML = `
        <rect width="640" height="360" fill="#0b1220"/>
        <text x="50" y="22" fill="#94a3b8" font-size="12">每位是小数 0.••••… 的数字</text>
        ${cells}${yrow}
        ${step >= 1 ? `<text x="400" y="50" fill="#facc15" font-size="12">黄 = 对角线 aₙₙ</text>` : ""}
        ${step >= 3 ? `<text x="400" y="80" fill="#f87171" font-size="12">红框：y 与 xₙ 在 n 位不同</text>` : ""}
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>名单行数</span><b>${rows}</b></div>
        <div class="ix-kv"><span>y 前段</span><b>0.${y.join("")}…</b></div>
        <p class="ix-note">${
          [
            "假设 (0,1) 可列成 x₁,x₂,…",
            "取出对角数字 a₁₁,a₂₂,…",
            "令 bₙ=4 或 5，强制 bₙ≠aₙₙ",
            "对每个 n，y 与 xₙ 至少第 n 位不同",
            "y 在 (0,1) 却不在名单 → 矛盾 → 不可数"
          ][step]
        }</p>
      `;
      ui.out.innerHTML =
        step === 4
          ? `<b>结论：</b>任何「完整名单」都漏掉 y。故 (0,1) 不可数，ℝ 不可数。`
          : `步骤 ${step + 1}：${labels[step]}。点「下一步」继续。`;
    }
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * FTC：黎曼和 + 面积导数
   * ========================================================= */
  W["ftc-area"] = function () {
    const ui = shell({
      title: "微积分基本定理 · 黎曼和与 A'(x)",
      desc: "f(t)=2t。左：分划小矩形逼近面积；右：A(x)=x² 的斜率 → 2x。",
      badge: "FTC",
      w: 640,
      h: 360,
      side: true,
      formula: "A(x)=∫₀ˣ f ,  A'(x)=f(x)",
      steps: true
    });
    const labels = ["被积函数 f", "黎曼矩形", "面积 A(x)", "差商 ΔA/Δx", "极限 = f(x)"];
    let step = 0;
    const xIn = addRange(ui.ctrl, "x", "x", 5, 35, 20);
    const nIn = addRange(ui.ctrl, "n", "矩形数", 2, 40, 8);
    addBtn(ui.ctrl, "下一步").onclick = () => {
      step = Math.min(4, step + 1);
      draw();
    };

    function draw() {
      setSteps(ui.stepsEl, labels, step);
      ui.stepsEl.querySelectorAll(".ix-step").forEach((b) =>
        b.addEventListener("click", () => {
          step = +b.dataset.si;
          draw();
        })
      );
      const x = +xIn.value / 10;
      const n = +nIn.value;
      const f = (t) => 2 * t;
      const A = x * x;
      const ox = 50,
        oy = 300,
        sx = 140,
        sy = 28;
      const X = (t) => ox + t * sx;
      const Y = (v) => oy - v * sy;

      let rects = "";
      let riemann = 0;
      if (step >= 1) {
        for (let i = 0; i < n; i++) {
          const t0 = (x * i) / n;
          const t1 = (x * (i + 1)) / n;
          const h = f(t0);
          riemann += h * (t1 - t0);
          rects += `<rect x="${X(t0)}" y="${Y(h)}" width="${(t1 - t0) * sx}" height="${h * sy}"
            fill="rgba(96,165,250,0.25)" stroke="#60a5fa" stroke-width="1"/>`;
        }
      }
      let curve = "";
      for (let i = 0; i <= 50; i++) {
        const t = (3.5 * i) / 50;
        curve += `${i ? "L" : "M"}${X(t)},${Y(f(t))} `;
      }
      const h = 0.25;
      const dA = (x + h) * (x + h) - A;
      const quot = dA / h;

      ui.svg.innerHTML = `
        <rect width="640" height="360" fill="#0b1220"/>
        <line x1="${ox}" y1="${oy}" x2="500" y2="${oy}" stroke="#334155"/>
        <line x1="${ox}" y1="${oy}" x2="${ox}" y2="40" stroke="#334155"/>
        ${rects}
        <path d="${curve}" fill="none" stroke="#93c5fd" stroke-width="2.5"/>
        ${
          step >= 2
            ? `<line x1="${X(x)}" y1="${oy}" x2="${X(x)}" y2="${Y(f(x))}" stroke="#facc15" stroke-dasharray="4 3"/>
               <circle cx="${X(x)}" cy="${Y(f(x))}" r="5" fill="#facc15"/>`
            : ""
        }
        ${
          step >= 3
            ? `<text x="360" y="80" fill="#facc15" font-size="13">ΔA/Δx ≈ ${quot.toFixed(3)}</text>
               <text x="360" y="105" fill="#4ade80" font-size="13">f(x)=${(2 * x).toFixed(2)}</text>`
            : ""
        }
        <text x="${ox}" y="330" fill="#64748b" font-size="12">t</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>x</span><b>${x.toFixed(1)}</b></div>
        <div class="ix-kv"><span>A(x)=x²</span><b>${A.toFixed(2)}</b></div>
        <div class="ix-kv"><span>黎曼和</span><b>${riemann.toFixed(2)}</b></div>
        <div class="ix-kv"><span>真面积</span><b>${A.toFixed(2)}</b></div>
        <div class="ix-kv hi"><span>f(x)=2x</span><b>${(2 * x).toFixed(2)}</b></div>
        <p class="ix-note">${labels[step]}。增加矩形数 → 黎曼和逼近 A(x)。</p>
      `;
      ui.out.innerHTML =
        step >= 4
          ? `夹逼：f(x)−ε ≤ ΔA/h ≤ f(x)+ε ⇒ <b>A'(x)=f(x)</b>。FTC-2：∫ₐᵇf=F(b)−F(a)。`
          : `精确面积 A(${x.toFixed(1)})=${A.toFixed(2)}；${n} 个左矩形和=${riemann.toFixed(2)}。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 欧拉：级数 + 单位圆 双视图
   * ========================================================= */
  W["euler-circle"] = function () {
    const ui = shell({
      title: "欧拉公式 · 圆上一点与级数",
      desc: "左：e^{iθ} 在单位圆。右：e^{iθ} 级数部分和在复平面的逼近。",
      badge: "欧拉",
      w: 640,
      h: 340,
      side: true,
      formula: "e^{iθ} = Σ (iθ)ⁿ/n! = cosθ + i sinθ"
    });
    const thIn = addRange(ui.ctrl, "th", "θ°", 0, 360, 60);
    const nIn = addRange(ui.ctrl, "n", "级数项数", 1, 20, 6);

    function draw() {
      const deg = +thIn.value;
      const N = +nIn.value;
      const th = (deg * Math.PI) / 180;
      // series
      let re = 0,
        im = 0;
      let termRe = 1,
        termIm = 0; // (iθ)^0
      const partial = [[1, 0]];
      for (let n = 0; n < N; n++) {
        if (n > 0) {
          // multiply by iθ / n
          const nr = (-termIm * th) / n;
          const ni = (termRe * th) / n;
          termRe = nr;
          termIm = ni;
        }
        re += termRe;
        im += termIm;
        partial.push([re, im]);
      }
      const c = Math.cos(th),
        s = Math.sin(th);
      const cx = 150,
        cy = 170,
        R = 100;
      const px = cx + R * Math.cos(th),
        py = cy - R * Math.sin(th);
      // right panel series path
      const cx2 = 420,
        cy2 = 170,
        sc = 90;
      let path = "";
      partial.forEach((p, i) => {
        path += `${i ? "L" : "M"}${cx2 + p[0] * sc},${cy2 - p[1] * sc} `;
      });

      ui.svg.innerHTML = `
        <rect width="640" height="340" fill="#0b1220"/>
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#334155" stroke-width="2"/>
        <line x1="${cx - R - 15}" y1="${cy}" x2="${cx + R + 15}" y2="${cy}" stroke="#334155"/>
        <line x1="${cx}" y1="${cy + R + 15}" x2="${cx}" y2="${cy - R - 15}" stroke="#334155"/>
        <line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="#60a5fa" stroke-width="2"/>
        <circle cx="${px}" cy="${py}" r="7" fill="#facc15"/>
        <text x="${cx}" y="40" text-anchor="middle" fill="#94a3b8" font-size="12">单位圆</text>
        <circle cx="${cx2}" cy="${cy2}" r="${sc}" fill="none" stroke="#334155" stroke-dasharray="4 3"/>
        <path d="${path}" fill="none" stroke="#c084fc" stroke-width="2"/>
        <circle cx="${cx2 + re * sc}" cy="${cy2 - im * sc}" r="5" fill="#c084fc"/>
        <circle cx="${cx2 + c * sc}" cy="${cy2 - s * sc}" r="5" fill="#facc15"/>
        <text x="${cx2}" y="40" text-anchor="middle" fill="#94a3b8" font-size="12">级数部分和 → 真值</text>
      `;
      const err = Math.hypot(re - c, im - s);
      ui.side.innerHTML = `
        <div class="ix-kv"><span>θ</span><b>${deg}° = ${th.toFixed(3)} rad</b></div>
        <div class="ix-kv"><span>cosθ+ i sinθ</span><b>${c.toFixed(3)} ${s >= 0 ? "+" : ""}${s.toFixed(3)}i</b></div>
        <div class="ix-kv"><span>级数和</span><b>${re.toFixed(3)} ${im >= 0 ? "+" : ""}${im.toFixed(3)}i</b></div>
        <div class="ix-kv hi"><span>误差</span><b>${err.toFixed(5)}</b></div>
        <p class="ix-note">${Math.abs(deg - 180) < 2 ? "θ=π → e^{iπ}=−1 → e^{iπ}+1=0" : "增加项数，紫点贴合黄点（真值）"}</p>
      `;
      ui.out.innerHTML = `e^{iθ} 既是旋转，又是幂级数。θ=π 时落到 −1，即欧拉恒等式。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 中间值：可调函数 + 二分轨迹
   * ========================================================= */
  W["ivt-bisection"] = function () {
    const ui = shell({
      title: "中间值定理 · 二分轨迹",
      desc: "f(x)=x³−x−1。每步取中点，保留变号一侧。区间套 → 根。",
      badge: "IVT",
      w: 640,
      h: 360,
      side: true,
      formula: "f(a)<0<f(b) 且 f 连续 ⇒ ∃c, f(c)=0",
      steps: true
    });
    const labels = ["异号端点", "取中点 m", "看 f(m) 符号", "收缩区间", "误差≤1/2ⁿ"];
    let step = 0;
    const nIn = addRange(ui.ctrl, "n", "二分次数", 0, 14, 0);
    addBtn(ui.ctrl, "自动一步").onclick = () => {
      nIn.value = Math.min(14, +nIn.value + 1);
      ui.wrap.querySelector('[data-v="n"]').textContent = nIn.value;
      step = Math.min(4, step + 1);
      draw();
    };

    const f = (x) => x * x * x - x - 1;

    function draw() {
      setSteps(ui.stepsEl, labels, step);
      const n = +nIn.value;
      let a = 1,
        b = 2;
      const hist = [[a, b]];
      for (let i = 0; i < n; i++) {
        const m = (a + b) / 2;
        if (f(a) * f(m) <= 0) b = m;
        else a = m;
        hist.push([a, b]);
      }
      const m = (a + b) / 2;
      const ox = 60,
        oy = 300,
        W = 400,
        H = 220;
      const x0 = 0.6,
        x1 = 2.3;
      const mx = (x) => ox + ((x - x0) / (x1 - x0)) * W;
      const my = (y) => oy - ((y + 3) / 10) * H;
      let path = "";
      for (let i = 0; i <= 100; i++) {
        const x = x0 + ((x1 - x0) * i) / 100;
        path += `${i ? "L" : "M"}${mx(x)},${my(f(x))} `;
      }
      let bands = "";
      hist.forEach((h, i) => {
        if (i === hist.length - 1)
          bands += `<rect x="${mx(h[0])}" y="50" width="${mx(h[1]) - mx(h[0])}" height="250" fill="rgba(250,204,21,0.12)" stroke="#facc15" stroke-dasharray="3 2"/>`;
      });

      ui.svg.innerHTML = `
        <rect width="640" height="360" fill="#0b1220"/>
        <line x1="${ox}" y1="${my(0)}" x2="${ox + W}" y2="${my(0)}" stroke="#475569"/>
        ${bands}
        <path d="${path}" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
        <circle cx="${mx(a)}" cy="${my(f(a))}" r="5" fill="#f97316"/>
        <circle cx="${mx(b)}" cy="${my(f(b))}" r="5" fill="#22c55e"/>
        <circle cx="${mx(m)}" cy="${my(f(m))}" r="6" fill="#facc15"/>
        <text x="500" y="80" fill="#f97316" font-size="12">a f=${f(a).toFixed(3)}</text>
        <text x="500" y="100" fill="#22c55e" font-size="12">b f=${f(b).toFixed(3)}</text>
        <text x="500" y="120" fill="#facc15" font-size="12">m f=${f(m).toFixed(3)}</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>次数 n</span><b>${n}</b></div>
        <div class="ix-kv"><span>[a,b]</span><b>[${a.toFixed(5)}, ${b.toFixed(5)}]</b></div>
        <div class="ix-kv"><span>长度</span><b>${(b - a).toFixed(5)}</b></div>
        <div class="ix-kv hi"><span>上限 (b₀−a₀)/2ⁿ</span><b>${(1 / Math.pow(2, n)).toFixed(5)}</b></div>
        <p class="ix-note">黄带 = 当前搜索区间。根被锁在变号端点之间。</p>
      `;
      ui.out.innerHTML = `存在性由上确界证明；二分法给出<strong>可计算</strong>逼近，误差 ≤ 初始长 / 2ⁿ。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 中值定理：割线切线 + 辅助函数
   * ========================================================= */
  W["mvt-visual"] = function () {
    const ui = shell({
      title: "中值定理 · 割线 / 切线 / 辅助函数",
      desc: "f(x)=x²。黄=割线，绿=切线。可选显示 g(x)=f−割线（罗尔）。",
      badge: "MVT",
      w: 640,
      h: 360,
      side: true,
      formula: "f'(ξ)=[f(b)−f(a)]/(b−a)"
    });
    const aIn = addRange(ui.ctrl, "a", "a×10", 2, 18, 5);
    const bIn = addRange(ui.ctrl, "b", "b×10", 12, 38, 28);
    let showG = false;
    addBtn(ui.ctrl, "显示 g(x)").onclick = () => {
      showG = !showG;
      draw();
    };

    function draw() {
      const a = +aIn.value / 10,
        b = +bIn.value / 10;
      if (b <= a + 0.15) return;
      const slope = a + b;
      const xi = slope / 2;
      const ox = 50,
        oy = 300,
        sx = 100,
        sy = 16;
      const X = (x) => ox + x * sx;
      const Y = (y) => oy - y * sy;
      let curve = "",
        gcurve = "";
      const g = (x) => x * x - (a * a + slope * (x - a));
      for (let i = 0; i <= 60; i++) {
        const x = i * 0.07;
        curve += `${i ? "L" : "M"}${X(x)},${Y(x * x)} `;
        gcurve += `${i ? "L" : "M"}${X(x)},${Y(g(x) + 2)} `;
      }
      const t1 = xi - 0.9,
        t2 = xi + 0.9;
      const ty = (x) => xi * xi + 2 * xi * (x - xi);

      ui.svg.innerHTML = `
        <rect width="640" height="360" fill="#0b1220"/>
        <path d="${curve}" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
        ${showG ? `<path d="${gcurve}" fill="none" stroke="#c084fc" stroke-width="2" stroke-dasharray="5 3"/>` : ""}
        <line x1="${X(a)}" y1="${Y(a * a)}" x2="${X(b)}" y2="${Y(b * b)}" stroke="#facc15" stroke-width="2.5"/>
        <line x1="${X(t1)}" y1="${Y(ty(t1))}" x2="${X(t2)}" y2="${Y(ty(t2))}" stroke="#4ade80" stroke-width="2.5" stroke-dasharray="6 3"/>
        <circle cx="${X(a)}" cy="${Y(a * a)}" r="5" fill="#facc15"/>
        <circle cx="${X(b)}" cy="${Y(b * b)}" r="5" fill="#facc15"/>
        <circle cx="${X(xi)}" cy="${Y(xi * xi)}" r="6" fill="#4ade80"/>
        <text x="400" y="50" fill="#facc15" font-size="13">割线斜率 ${slope.toFixed(2)}</text>
        <text x="400" y="75" fill="#4ade80" font-size="13">ξ=${xi.toFixed(2)} 切线斜率 ${(2 * xi).toFixed(2)}</text>
        ${showG ? `<text x="400" y="100" fill="#c084fc" font-size="12">紫：g (平移后) g(a)=g(b)=0</text>` : ""}
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>a, b</span><b>${a.toFixed(1)}, ${b.toFixed(1)}</b></div>
        <div class="ix-kv"><span>[f(b)−f(a)]/(b−a)</span><b>${slope.toFixed(3)}</b></div>
        <div class="ix-kv hi"><span>ξ=(a+b)/2</span><b>${xi.toFixed(3)}</b></div>
        <p class="ix-note">对一般 f：构造 g 使端点等高 → 罗尔 ⇒ g'(ξ)=0 ⇒ 中值公式。</p>
      `;
      ui.out.innerHTML = `几何：必有一点切线 ∥ 割线。分析：罗尔是端点值相等的特例。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 素数无穷：完整构造板
   * ========================================================= */
  W["euclid-primes"] = function () {
    const ui = shell({
      title: "欧几里得 · 从名单到新素数",
      desc: "勾选有限名单 → 乘积 P → N=P+1 → 分解。红框标出名单外的素因子。",
      badge: "素数",
      w: 640,
      h: 300,
      side: true,
      formula: "N = p₁p₂…pₖ + 1  ⇒  其素因子 ∉ 名单",
      steps: true
    });
    const labels = ["选名单", "算 P", "得 N=P+1", "分解 N", "新素数矛盾"];
    let step = 2;
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
    const box = document.createElement("div");
    box.style.cssText = "display:flex;flex-wrap:wrap;gap:0.4rem;width:100%";
    primes.forEach((p, i) => {
      const lab = document.createElement("label");
      lab.style.cssText = "flex-direction:row;align-items:center;gap:0.3rem;min-width:auto;font-size:0.88rem";
      lab.innerHTML = `<input type="checkbox" value="${p}" ${i < 4 ? "checked" : ""}/> ${p}`;
      box.appendChild(lab);
    });
    ui.ctrl.appendChild(box);
    addBtn(ui.ctrl, "下一步").onclick = () => {
      step = Math.min(4, step + 1);
      draw();
    };

    function factorize(n) {
      const f = [];
      let x = n;
      for (let p = 2; p * p <= x; p++) while (x % p === 0) {
        f.push(p);
        x /= p;
      }
      if (x > 1) f.push(x);
      return f;
    }

    function draw() {
      setSteps(ui.stepsEl, labels, step);
      const sel = [...box.querySelectorAll("input:checked")].map((c) => +c.value);
      if (!sel.length) return;
      const P = sel.reduce((a, b) => a * b, 1);
      const N = P + 1;
      const fac = factorize(N);
      const neu = fac.filter((p) => !sel.includes(p));

      ui.svg.innerHTML = `
        <rect width="640" height="300" fill="#0b1220"/>
        <text x="32" y="50" fill="#94a3b8" font-size="14">名单 S = {${sel.join(", ")}}</text>
        ${step >= 1 ? `<text x="32" y="95" fill="#60a5fa" font-size="18">P = ${sel.join(" × ")} = ${P}</text>` : ""}
        ${step >= 2 ? `<text x="32" y="140" fill="#facc15" font-size="22">N = P + 1 = ${N}</text>` : ""}
        ${
          step >= 3
            ? `<text x="32" y="190" fill="#e2e8f0" font-size="16">N = ${fac.join(" × ")}</text>
               <text x="32" y="230" fill="#4ade80" font-size="16">新素因子：${neu.join(", ") || N}</text>`
            : ""
        }
        ${
          step >= 4
            ? `<rect x="28" y="250" width="400" height="36" rx="8" fill="#450a0a" stroke="#ef4444"/>
               <text x="40" y="274" fill="#fecaca" font-size="14">每个 p∈S 都有 N ≡ 1 (mod p) ⇒ 矛盾</text>`
            : ""
        }
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>|S|</span><b>${sel.length}</b></div>
        <div class="ix-kv"><span>P</span><b>${P}</b></div>
        <div class="ix-kv hi"><span>N</span><b>${N}</b></div>
        <p class="ix-note">N 本身不必是素数（如 30031=59×509），但必带新素因子。</p>
      `;
      ui.out.innerHTML = `这是「存在性」证明：说明任意有限名单都不完备，而非给出第 n 个素数公式。`;
    }
    box.querySelectorAll("input").forEach((c) => c.addEventListener("change", draw));
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * √2：竖直时间线 + 数值试探
   * ========================================================= */
  W["sqrt2-proof"] = function () {
    const ui = shell({
      title: "√2 无理 · 反证时间线",
      desc: "假设 √2=a/b 既约，逐步推出 a、b 皆偶。可试输入分数看平方是否接近 2。",
      badge: "无理数",
      w: 640,
      h: 340,
      side: true,
      formula: "a² = 2b²  ⇒  a 偶  ⇒  b 偶  ⇒  矛盾"
    });
    const sIn = addRange(ui.ctrl, "s", "证明步骤", 0, 5, 0);
    const aIn = addRange(ui.ctrl, "aa", "试 a", 1, 30, 7);
    const bIn = addRange(ui.ctrl, "bb", "试 b", 1, 30, 5);

    const lines = [
      "反设 √2=a/b，gcd(a,b)=1，b>0",
      "平方得 a² = 2b²",
      "右边偶 ⇒ a² 偶 ⇒ a 偶，a=2k",
      "4k²=2b² ⇒ b²=2k² ⇒ b 偶",
      "a、b 皆偶 ⇒ gcd≥2，矛盾",
      "故 √2 ∉ ℚ  ∎"
    ];

    function draw() {
      const s = +sIn.value;
      const a = +aIn.value,
        b = +bIn.value;
      let rows = "";
      lines.forEach((t, i) => {
        const on = i <= s;
        const y = 40 + i * 42;
        rows += `
          <circle cx="40" cy="${y}" r="14" fill="${on ? "#2563eb" : "#1e293b"}" stroke="#64748b"/>
          <text x="40" y="${y + 5}" text-anchor="middle" fill="#fff" font-size="12">${i}</text>
          ${i < 5 ? `<line x1="40" y1="${y + 14}" x2="40" y2="${y + 28}" stroke="#334155"/>` : ""}
          <text x="70" y="${y + 5}" fill="${on ? "#f1f5f9" : "#475569"}" font-size="15">${t}</text>`;
      });
      const r = (a * a) / (b * b);
      ui.svg.innerHTML = `<rect width="640" height="340" fill="#0b1220"/>${rows}`;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>试验 a/b</span><b>${a}/${b}</b></div>
        <div class="ix-kv"><span>(a/b)²</span><b>${r.toFixed(6)}</b></div>
        <div class="ix-kv"><span>|·−2|</span><b>${Math.abs(r - 2).toFixed(6)}</b></div>
        <div class="ix-kv hi"><span>gcd(a,b)</span><b>${gcd(a, b)}</b></div>
        <p class="ix-note">有理逼近可任意近，但<strong>永不相等</strong>。证明排除的是「相等」。</p>
      `;
      ui.out.innerHTML = lines[s];
    }
    function gcd(x, y) {
      x = Math.abs(x);
      y = Math.abs(y);
      while (y) {
        const t = y;
        y = x % y;
        x = t;
      }
      return x;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 鸽巢：动画投放
   * ========================================================= */
  W["pigeonhole"] = function () {
    const ui = shell({
      title: "鸽巢原理 · 投放演示",
      desc: "逐只放入鸽子（尽量均匀）。观察何时被迫某盒 ≥⌈m/n⌉。",
      badge: "组合",
      w: 640,
      h: 300,
      side: true,
      formula: "m 物 n 盒 ⇒ 某盒 ≥ ⌈m/n⌉"
    });
    const nIn = addRange(ui.ctrl, "n", "盒 n", 2, 8, 4);
    const mIn = addRange(ui.ctrl, "m", "已放 m", 0, 24, 0);
    addBtn(ui.ctrl, "+1 只鸽").onclick = () => {
      mIn.value = Math.min(24, +mIn.value + 1);
      ui.wrap.querySelector('[data-v="m"]').textContent = mIn.value;
      draw();
    };

    function draw() {
      const n = +nIn.value,
        m = +mIn.value;
      const counts = Array(n).fill(0);
      for (let i = 0; i < m; i++) counts[i % n]++; // round-robin then leftover pattern
      // actually sequential fill round-robin
      counts.fill(0);
      for (let i = 0; i < m; i++) counts[i % n]++;
      const ceil = m === 0 ? 0 : Math.ceil(m / n);
      const bw = Math.min(70, 500 / n - 10);
      let boxes = "";
      counts.forEach((c, i) => {
        const x = 50 + i * (bw + 16);
        const hot = c >= ceil && c > 0 && m > n;
        boxes += `<rect x="${x}" y="80" width="${bw}" height="160" rx="10" fill="${hot ? "#422006" : "#1e293b"}" stroke="${hot ? "#facc15" : "#475569"}" stroke-width="2"/>`;
        for (let k = 0; k < c; k++) {
          boxes += `<circle cx="${x + bw / 2}" cy="${220 - k * 18}" r="8" fill="#60a5fa"/>`;
        }
        boxes += `<text x="${x + bw / 2}" y="70" text-anchor="middle" fill="#94a3b8" font-size="12">#${i + 1}</text>`;
        boxes += `<text x="${x + bw / 2}" y="265" text-anchor="middle" fill="#e2e8f0" font-size="14">${c}</text>`;
      });
      ui.svg.innerHTML = `<rect width="640" height="300" fill="#0b1220"/>${boxes}`;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>m / n</span><b>${m} / ${n}</b></div>
        <div class="ix-kv hi"><span>⌈m/n⌉</span><b>${ceil}</b></div>
        <div class="ix-kv"><span>当前最大</span><b>${Math.max(0, ...counts)}</b></div>
        <p class="ix-note">${m > n ? "已超过盒数 → 必有一盒 ≥2（基本形式）。" : "继续 +1，直到 m=n+1。"}</p>
      `;
      ui.out.innerHTML = `反证：若每盒 ≤⌈m/n⌉−1，总数 &lt; m，矛盾。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 皮克：可点格点? keep enhanced presets + grid numbers
   * ========================================================= */
  W["pick-theorem"] = function () {
    const ui = shell({
      title: "皮克定理 · 格点计数",
      desc: "绿=内点 I，黄=边界 B。Area = I + B/2 − 1。切换形状并对照鞋带公式。",
      badge: "皮克",
      w: 640,
      h: 360,
      side: true,
      formula: "Area = I + B/2 − 1"
    });
    const presets = [
      { name: "正方形", pts: [[1, 1], [4, 1], [4, 4], [1, 4]] },
      { name: "三角形", pts: [[1, 1], [6, 1], [1, 5]] },
      { name: "五边形", pts: [[2, 1], [5, 1], [6, 3], [4, 5], [1, 3]] },
      { name: "瘦三角", pts: [[1, 1], [7, 1], [1, 3]] }
    ];
    let cur = presets[0];
    presets.forEach((p) => {
      addBtn(ui.ctrl, p.name).onclick = () => {
        cur = p;
        draw();
      };
    });

    function onBoundary(x, y, pts) {
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[(i + 1) % pts.length];
        const cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
        if (Math.abs(cross) > 1e-8) continue;
        const dot = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
        const len = (x2 - x1) ** 2 + (y2 - y1) ** 2;
        if (dot >= -1e-8 && dot <= len + 1e-8) return true;
      }
      return false;
    }
    function pointInPoly(x, y, pts) {
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i],
          [xj, yj] = pts[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-12) + xi) c = !c;
      }
      return c;
    }
    function shoelace(pts) {
      let a = 0;
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[(i + 1) % pts.length];
        a += x1 * y2 - x2 * y1;
      }
      return Math.abs(a) / 2;
    }
    function countIB(pts) {
      let I = 0,
        B = 0;
      for (let x = 0; x <= 8; x++)
        for (let y = 0; y <= 8; y++) {
          if (onBoundary(x, y, pts)) B++;
          else if (pointInPoly(x, y, pts)) I++;
        }
      return { I, B, area: shoelace(pts) };
    }

    function draw() {
      const pts = cur.pts;
      const { I, B, area } = countIB(pts);
      const pick = I + B / 2 - 1;
      const scale = 38,
        ox = 50,
        oy = 300;
      let g = "";
      for (let i = 0; i <= 8; i++) {
        g += `<line x1="${ox}" y1="${oy - i * scale}" x2="${ox + 8 * scale}" y2="${oy - i * scale}" stroke="#1e293b"/>`;
        g += `<line x1="${ox + i * scale}" y1="${oy}" x2="${ox + i * scale}" y2="${oy - 8 * scale}" stroke="#1e293b"/>`;
      }
      for (let x = 0; x <= 8; x++)
        for (let y = 0; y <= 8; y++) {
          g += `<circle cx="${ox + x * scale}" cy="${oy - y * scale}" r="2" fill="#334155"/>`;
        }
      const poly = pts.map(([x, y]) => `${ox + x * scale},${oy - y * scale}`).join(" ");
      let dots = "";
      for (let x = 0; x <= 8; x++)
        for (let y = 0; y <= 8; y++) {
          if (onBoundary(x, y, pts))
            dots += `<circle cx="${ox + x * scale}" cy="${oy - y * scale}" r="5" fill="#facc15"/>`;
          else if (pointInPoly(x, y, pts))
            dots += `<circle cx="${ox + x * scale}" cy="${oy - y * scale}" r="5" fill="#4ade80"/>`;
        }
      ui.svg.innerHTML = `
        <rect width="640" height="360" fill="#0b1220"/>
        ${g}
        <polygon points="${poly}" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" stroke-width="2.5"/>
        ${dots}
        <text x="420" y="40" fill="#e2e8f0" font-size="15">${cur.name}</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>I 内点</span><b style="color:#4ade80">${I}</b></div>
        <div class="ix-kv"><span>B 边界</span><b style="color:#facc15">${B}</b></div>
        <div class="ix-kv"><span>鞋带 Area</span><b>${area}</b></div>
        <div class="ix-kv hi"><span>I+B/2−1</span><b>${pick}</b></div>
        <p class="ix-note">${Math.abs(pick - area) < 0.01 ? "皮克 = 面积 ✓" : "边界判定为网格近似，以鞋带为准"}</p>
      `;
      ui.out.innerHTML = `证明思路：剖成面积 1/2 的基本三角，个数 T=2·Area，再与欧拉 V−E+F 联立。`;
    }
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 布劳威尔增强
   * ========================================================= */
  W["brouwer-1d"] = function () {
    const ui = shell({
      title: "不动点 · f 与 y=x",
      desc: "连续 f:[0,1]→[0,1]。黄点 = 交点 = 不动点。拖动形状参数。",
      badge: "布劳威尔",
      w: 640,
      h: 360,
      side: true,
      formula: "g(x)=f(x)−x，g(0)≥0≥g(1) ⇒ g(c)=0"
    });
    const kIn = addRange(ui.ctrl, "k", "形状", 0, 100, 35);
    const aIn = addRange(ui.ctrl, "a", "左端 f(0)", 0, 100, 20);
    const bIn = addRange(ui.ctrl, "b", "右端 f(1)", 0, 100, 80);

    function draw() {
      const k = +kIn.value / 100;
      const f0 = +aIn.value / 100;
      const f1 = +bIn.value / 100;
      const f = (x) => {
        const bump = Math.sin(Math.PI * x);
        const base = f0 * (1 - x) + f1 * x;
        return Math.min(1, Math.max(0, base * (1 - k) + (0.2 + 0.6 * bump * bump) * k));
      };
      let best = 0,
        bv = 1;
      for (let i = 0; i <= 400; i++) {
        const x = i / 400;
        const v = Math.abs(f(x) - x);
        if (v < bv) {
          bv = v;
          best = x;
        }
      }
      const ox = 80,
        oy = 300,
        S = 240;
      const X = (x) => ox + x * S;
      const Y = (y) => oy - y * S;
      let curve = `M${X(0)},${Y(f(0))} `;
      for (let i = 1; i <= 80; i++) {
        const x = i / 80;
        curve += `L${X(x)},${Y(f(x))} `;
      }
      // g bars
      let bars = "";
      for (let i = 0; i <= 20; i++) {
        const x = i / 20;
        const g = f(x) - x;
        bars += `<line x1="${X(x)}" y1="${Y(0)}" x2="${X(x)}" y2="${Y(g)}" stroke="rgba(192,132,252,0.5)" stroke-width="3"/>`;
      }

      ui.svg.innerHTML = `
        <rect width="640" height="360" fill="#0b1220"/>
        <path d="M${X(0)},${Y(0)} L${X(1)},${Y(1)}" stroke="#475569" stroke-width="2" stroke-dasharray="5 4"/>
        ${bars}
        <path d="${curve}" fill="none" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="${X(best)}" cy="${Y(best)}" r="7" fill="#facc15"/>
        <text x="400" y="60" fill="#94a3b8" font-size="12">虚线 y=x · 蓝 y=f · 紫 g 棒</text>
        <text x="400" y="90" fill="#facc15" font-size="14">x* ≈ ${best.toFixed(4)}</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>f(0)</span><b>${f(0).toFixed(3)}</b></div>
        <div class="ix-kv"><span>f(1)</span><b>${f(1).toFixed(3)}</b></div>
        <div class="ix-kv"><span>g(0)=f(0)</span><b>${(f(0) - 0).toFixed(3)}</b></div>
        <div class="ix-kv"><span>g(1)=f(1)−1</span><b>${(f(1) - 1).toFixed(3)}</b></div>
        <div class="ix-kv hi"><span>不动点</span><b>${best.toFixed(4)}</b></div>
        <p class="ix-note">保持 f 映入 [0,1] 时 g(0)≥0≥g(1)，IVT 给零点。</p>
      `;
      ui.out.innerHTML = `高维：无不动点 ⇒ 构造到边界的回缩 ⇒ 拓扑矛盾。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 四色增强地图
   * ========================================================= */
  W["four-color-map"] = function () {
    const ui = shell({
      title: "四色 · 可点击地图",
      desc: "点击区域循环 0→4 色。相邻同色会红框警告。「自动」用贪心。",
      badge: "四色",
      w: 640,
      h: 340,
      side: true,
      formula: "平面图 χ ≤ 4"
    });
    const regions = [
      { id: 0, d: "M50,40 L220,40 L200,130 L70,140 Z", adj: [1, 2], c: [130, 85] },
      { id: 1, d: "M220,40 L400,50 L380,140 L200,130 Z", adj: [0, 2, 3], c: [300, 90] },
      { id: 2, d: "M70,140 L200,130 L220,220 L90,230 Z", adj: [0, 1, 3, 4], c: [145, 180] },
      { id: 3, d: "M200,130 L380,140 L400,220 L220,220 Z", adj: [1, 2, 4, 5], c: [300, 175] },
      { id: 4, d: "M90,230 L220,220 L240,300 L50,300 Z", adj: [2, 3, 5], c: [145, 265] },
      { id: 5, d: "M220,220 L400,220 L450,300 L240,300 Z", adj: [3, 4], c: [320, 260] },
      { id: 6, d: "M400,50 L520,80 L500,200 L400,220 L380,140 Z", adj: [1, 3, 5], c: [450, 140] }
    ];
    const colors = ["#1e293b", "#3b82f6", "#22c55e", "#eab308", "#ef4444"];
    const col = regions.map(() => 0);
    addBtn(ui.ctrl, "重置").onclick = () => {
      col.fill(0);
      draw();
    };
    addBtn(ui.ctrl, "自动染色").onclick = () => {
      col.fill(0);
      regions.forEach((r) => {
        const used = new Set(r.adj.map((j) => col[j]).filter(Boolean));
        let c = 1;
        while (used.has(c)) c++;
        col[r.id] = Math.min(c, 4);
      });
      draw();
    };

    function conflicts() {
      const set = new Set();
      regions.forEach((r) => {
        r.adj.forEach((j) => {
          if (col[r.id] && col[j] && col[r.id] === col[j]) {
            set.add(r.id);
            set.add(j);
          }
        });
      });
      return set;
    }

    function draw() {
      const bad = conflicts();
      const used = new Set(col.filter((c) => c > 0)).size;
      ui.svg.innerHTML =
        `<rect width="640" height="340" fill="#0b1220"/>` +
        regions
          .map((r) => {
            const isBad = bad.has(r.id);
            return `<path data-id="${r.id}" d="${r.d}" fill="${colors[col[r.id]]}" stroke="${isBad ? "#f87171" : "#94a3b8"}" stroke-width="${isBad ? 3 : 2}" style="cursor:pointer"/>
            <text x="${r.c[0]}" y="${r.c[1]}" fill="#fff" font-size="16" text-anchor="middle" pointer-events="none">${col[r.id] || "·"}</text>`;
          })
          .join("");
      ui.svg.querySelectorAll("path[data-id]").forEach((p) => {
        p.addEventListener("click", () => {
          const id = +p.getAttribute("data-id");
          col[id] = (col[id] + 1) % 5;
          draw();
        });
      });
      ui.side.innerHTML = `
        <div class="ix-kv"><span>用色数</span><b>${used}</b></div>
        <div class="ix-kv"><span>冲突边</span><b style="color:${bad.size ? "#f87171" : "#4ade80"}">${bad.size ? "有" : "无"}</b></div>
        <div class="ix-kv hi"><span>≤4？</span><b>${used <= 4 && !bad.size ? "✓" : "…"}</b></div>
        <p class="ix-note">五色有手工证明；四色需构型可约性+计算机。此处仅体验染色约束。</p>
      `;
      ui.out.innerHTML = !bad.size
        ? used
          ? `合法 ${used}-染色${used <= 4 ? "（符合四色上界）" : ""}`
          : "点击区域上色"
        : "红框区域与邻居同色 — 再点击换色";
    }
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * CRT 增强
   * ========================================================= */
  W["crt-visual"] = function () {
    const ui = shell({
      title: "中国剩余定理 · 同余板",
      desc: "拖动 x。三行分别检查 mod 3/5/7。全绿 ⇒ 解。并显示构造公式项。",
      badge: "CRT",
      w: 640,
      h: 320,
      side: true,
      formula: "x = Σ aᵢ Mᵢ yᵢ  (mod M)"
    });
    const xIn = addRange(ui.ctrl, "x", "x", 0, 104, 23);
    addBtn(ui.ctrl, "跳到 23").onclick = () => {
      xIn.value = 23;
      ui.wrap.querySelector('[data-v="x"]').textContent = 23;
      draw();
    };
    addBtn(ui.ctrl, "+105").onclick = () => {
      xIn.value = (+xIn.value + 105) % 105;
      ui.wrap.querySelector('[data-v="x"]').textContent = xIn.value;
      draw();
    };

    // precompute construction for a=(2,3,2), m=(3,5,7)
    const M = 105,
      Mi = [35, 21, 15],
      yi = [2, 1, 1],
      ai = [2, 3, 2];
    const x0 = ai.reduce((s, a, i) => s + a * Mi[i] * yi[i], 0) % M;

    function draw() {
      const x = +xIn.value;
      const checks = [
        { lab: "x ≡ 2 (mod 3)", ok: x % 3 === 2, r: x % 3 },
        { lab: "x ≡ 3 (mod 5)", ok: x % 5 === 3, r: x % 5 },
        { lab: "x ≡ 2 (mod 7)", ok: x % 7 === 2, r: x % 7 }
      ];
      let rows = "";
      checks.forEach((c, i) => {
        const y = 40 + i * 55;
        rows += `<rect x="40" y="${y}" width="360" height="44" rx="10" fill="${c.ok ? "#14532d" : "#1e293b"}" stroke="${c.ok ? "#4ade80" : "#475569"}" stroke-width="2"/>
          <text x="60" y="${y + 28}" fill="#f1f5f9" font-size="16">${c.lab}　余 ${c.r} ${c.ok ? "✓" : ""}</text>`;
      });
      ui.svg.innerHTML = `
        <rect width="640" height="320" fill="#0b1220"/>
        ${rows}
        <text x="40" y="230" fill="#94a3b8" font-size="13">构造特解 x₀ = 2·35·2 + 3·21·1 + 2·15·1 = 233 ≡ ${x0} (mod 105)</text>
        <text x="40" y="260" fill="#facc15" font-size="14">通解 x = ${x0} + 105k</text>
        <text x="40" y="295" fill="${checks.every((c) => c.ok) ? "#4ade80" : "#64748b"}" font-size="15">${checks.every((c) => c.ok) ? "当前 x 是解 ✓" : "未齐 — 继续拖动"}</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>x</span><b>${x}</b></div>
        <div class="ix-kv"><span>M</span><b>105</b></div>
        <div class="ix-kv hi"><span>x mod 105</span><b>${x % 105}</b></div>
        <p class="ix-note">互素 ⇒ 解模 M 唯一。Mᵢ=M/mᵢ，yᵢ 为逆元。</p>
      `;
      ui.out.innerHTML = `验证：M₁y₁=70≡1 (mod 3)，M₂y₂=21≡1 (mod 5)，M₃y₃=15≡1 (mod 7)。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 巴塞尔增强：项与部分和
   * ========================================================= */
  W["basel-sum"] = function () {
    const ui = shell({
      title: "巴塞尔问题 · 部分和与目标",
      desc: "S_N=∑_{n=1}^N 1/n²（蓝）逼近 π²/6（黄线）。可看第 n 项大小。",
      badge: "ζ(2)",
      w: 640,
      h: 340,
      side: true,
      formula: "∑ 1/n² = π²/6"
    });
    const nIn = addRange(ui.ctrl, "n", "N", 1, 250, 20);
    const target = (Math.PI * Math.PI) / 6;

    function draw() {
      const N = +nIn.value;
      let s = 0;
      const pts = [];
      for (let n = 1; n <= N; n++) {
        s += 1 / (n * n);
        pts.push(s);
      }
      const ox = 50,
        oy = 280,
        W = 400,
        H = 200;
      const mx = (i) => ox + ((i - 1) / Math.max(N - 1, 1)) * W;
      const my = (v) => oy - ((v - 0.9) / 0.9) * H;
      let path = "";
      pts.forEach((v, i) => {
        path += `${i ? "L" : "M"}${mx(i + 1)},${my(v)} `;
      });
      // bars for last few terms
      let bars = "";
      const show = Math.min(N, 15);
      for (let n = N - show + 1; n <= N; n++) {
        if (n < 1) continue;
        const term = 1 / (n * n);
        const bx = 480;
        const by = 40 + (N - n) * 14;
        bars += `<rect x="${bx}" y="${by}" width="${term * 800}" height="10" fill="#60a5fa"/>`;
      }

      ui.svg.innerHTML = `
        <rect width="640" height="340" fill="#0b1220"/>
        <line x1="${ox}" y1="${my(target)}" x2="${ox + W}" y2="${my(target)}" stroke="#facc15" stroke-width="2" stroke-dasharray="6 4"/>
        <path d="${path}" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
        <circle cx="${mx(N)}" cy="${my(s)}" r="5" fill="#60a5fa"/>
        <text x="50" y="36" fill="#facc15" font-size="13">π²/6 ≈ ${target.toFixed(6)}</text>
        ${bars}
        <text x="480" y="30" fill="#94a3b8" font-size="11">末项 1/n²</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>N</span><b>${N}</b></div>
        <div class="ix-kv"><span>S_N</span><b>${s.toFixed(6)}</b></div>
        <div class="ix-kv"><span>末项 1/N²</span><b>${(1 / (N * N)).toFixed(6)}</b></div>
        <div class="ix-kv hi"><span>误差</span><b>${Math.abs(s - target).toFixed(6)}</b></div>
        <p class="ix-note">误差量级 ~ 1/N。傅里叶证明给出精确值 π²/6。</p>
      `;
      ui.out.innerHTML = `x² 在 [−π,π] 的傅里叶展开，令 x=π 即得 ∑1/n²=π²/6。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 高斯-博内增强
   * ========================================================= */
  W["gauss-bonnet"] = function () {
    const ui = shell({
      title: "高斯–博内 · 角盈 = 曲率积分",
      desc: "球面三角：内角和 = π + Area/R²。拖动角盈，观察三角形「鼓起」。",
      badge: "曲率",
      w: 640,
      h: 340,
      side: true,
      formula: "∬ K dA = 2π χ　（闭曲面）"
    });
    const eIn = addRange(ui.ctrl, "e", "角盈 °", 5, 120, 40);
    const chiIn = addRange(ui.ctrl, "chi", "示意 χ", 0, 2, 2);

    function draw() {
      const ex = +eIn.value;
      const chi = +chiIn.value;
      const bulge = 0.25 + (ex / 120) * 0.9;
      const A = [160, 240],
        B = [360, 240],
        C = [260, 70 + (1 - bulge) * 50];
      const mid = (p, q, pull) => [(p[0] + q[0]) / 2 + pull[0], (p[1] + q[1]) / 2 + pull[1]];
      const mAB = mid(A, B, [0, 30 * bulge]);
      const mBC = mid(B, C, [35 * bulge, -5]);
      const mCA = mid(C, A, [-35 * bulge, -5]);
      const area = (ex * Math.PI) / 180; // unit sphere

      ui.svg.innerHTML = `
        <rect width="640" height="340" fill="#0b1220"/>
        <circle cx="260" cy="170" r="130" fill="#111827" stroke="#334155" stroke-width="2"/>
        <path d="M ${A} Q ${mAB} ${B} Q ${mBC} ${C} Q ${mCA} ${A}"
          fill="rgba(167,139,250,0.4)" stroke="#a78bfa" stroke-width="2.5"/>
        <circle cx="${A[0]}" cy="${A[1]}" r="5" fill="#facc15"/>
        <circle cx="${B[0]}" cy="${B[1]}" r="5" fill="#facc15"/>
        <circle cx="${C[0]}" cy="${C[1]}" r="5" fill="#facc15"/>
        <text x="450" y="80" fill="#e2e8f0" font-size="14">内角和 ≈ ${180 + ex}°</text>
        <text x="450" y="110" fill="#a78bfa" font-size="14">ε = ${ex}° ≈ ${(area).toFixed(3)} rad</text>
        <text x="450" y="150" fill="#94a3b8" font-size="12">单位球 K=1</text>
        <text x="450" y="200" fill="#facc15" font-size="13">闭曲面 ∬K = 2πχ</text>
        <text x="450" y="225" fill="#e2e8f0" font-size="13">χ=${chi} ⇒ 2πχ=${(2 * Math.PI * chi).toFixed(2)}</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>角盈 ε</span><b>${ex}°</b></div>
        <div class="ix-kv"><span>面积 (K=1)</span><b>${area.toFixed(3)}</b></div>
        <div class="ix-kv hi"><span>2πχ</span><b>${(2 * Math.PI * chi).toFixed(3)}</b></div>
        <p class="ix-note">球面 χ=2 → ∬K=4π。环面 χ=0 → 正负曲率抵消。</p>
      `;
      ui.out.innerHTML = `局部：角盈=∬K；全局：拼起来只剩拓扑 2πχ。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* =========================================================
   * 黎曼映射增强
   * ========================================================= */
  W["riemann-map"] = function () {
    const ui = shell({
      title: "黎曼映射 · 共形变形",
      desc: "左：单连通区域 Ω（可调起伏）。右：单位圆盘。进度滑条模拟「抚圆」。",
      badge: "复分析",
      w: 640,
      h: 340,
      side: true,
      formula: "∃ f:Ω→𝔻 全纯双射，f(z₀)=0, f'(z₀)>0 时唯一"
    });
    const wIn = addRange(ui.ctrl, "w", "边界起伏", 0, 100, 40);
    const mIn = addRange(ui.ctrl, "m", "映射进度", 0, 100, 0);

    function blob(cx, cy, R, weird) {
      const pts = [];
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        const wob =
          1 +
          weird * 0.4 * Math.sin(3 * th) +
          weird * 0.22 * Math.cos(5 * th + 0.4);
        pts.push([cx + R * wob * Math.cos(th), cy + R * wob * Math.sin(th)]);
      }
      return pts.map((p, i) => `${i ? "L" : "M"}${p.join(",")}`).join(" ") + "Z";
    }

    function draw() {
      const w = +wIn.value / 100;
      const m = +mIn.value / 100;
      const weird = w * (1 - m);
      const R = 75;
      const left = blob(160, 170, R, weird);
      // interior grid warped
      let grid = "";
      for (let i = -3; i <= 3; i++) {
        let p = "";
        for (let j = 0; j <= 20; j++) {
          const t = j / 20;
          const ang = t * Math.PI * 2;
          const rr = (0.35 + 0.15 * Math.abs(i / 3)) * R * (1 + weird * 0.2 * Math.sin(3 * ang));
          const x = 160 + rr * Math.cos(ang) * (1 + i * 0.04);
          const y = 170 + rr * Math.sin(ang);
          p += `${j ? "L" : "M"}${x},${y} `;
        }
        grid += `<path d="${p}" fill="none" stroke="#334155" stroke-width="1"/>`;
      }

      let diskG = "";
      for (let k = 1; k <= 4; k++)
        diskG += `<circle cx="460" cy="170" r="${18 * k * (0.7 + 0.3 * m)}" fill="none" stroke="#334155"/>`;
      for (let k = 0; k < 12; k++) {
        const th = (k * Math.PI) / 6;
        diskG += `<line x1="460" y1="170" x2="${460 + 72 * Math.cos(th)}" y2="${170 + 72 * Math.sin(th)}" stroke="#334155"/>`;
      }

      ui.svg.innerHTML = `
        <rect width="640" height="340" fill="#0b1220"/>
        <path d="${left}" fill="rgba(96,165,250,0.25)" stroke="#60a5fa" stroke-width="2.5"/>
        ${grid}
        <text x="160" y="40" text-anchor="middle" fill="#60a5fa" font-size="14">Ω 单连通</text>
        <path d="M 280 170 L 360 170" stroke="#94a3b8" stroke-width="2" marker-end="url(#ar)"/>
        <defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0L6,3L0,6" fill="#94a3b8"/></marker></defs>
        <circle cx="460" cy="170" r="72" fill="rgba(74,222,128,0.15)" stroke="#4ade80" stroke-width="2.5"/>
        ${diskG}
        <text x="460" y="40" text-anchor="middle" fill="#4ade80" font-size="14">𝔻 单位圆盘</text>
        <circle cx="160" cy="170" r="4" fill="#facc15"/>
        <text x="168" y="165" fill="#facc15" font-size="11">z₀</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>起伏</span><b>${Math.round(w * 100)}%</b></div>
        <div class="ix-kv"><span>进度</span><b>${Math.round(m * 100)}%</b></div>
        <div class="ix-kv hi"><span>共形</span><b>保角</b></div>
        <p class="ix-note">存在性：正规族取极大导数；若不满射则可用布拉施克因子「撑大」导出矛盾。</p>
      `;
      ui.out.innerHTML = `ℂ 本身不能映到 𝔻（有界整函数）。有洞区域也不是单连通，不适用。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  /* 素数定理：双曲线 + 比值 */
  W["pnt-chart"] = function () {
    const ui = shell({
      title: "素数定理 · π(x) 对 x/ln x",
      desc: "蓝：π(x)。黄虚：x/ln x。右侧比值 → 1。",
      badge: "PNT",
      w: 640,
      h: 340,
      side: true,
      formula: "π(x) ∼ x / ln x"
    });
    const xIn = addRange(ui.ctrl, "X", "X", 40, 500, 200);
    const N = 500;
    const isP = new Uint8Array(N + 1);
    isP.fill(1);
    isP[0] = isP[1] = 0;
    for (let i = 2; i * i <= N; i++) if (isP[i]) for (let j = i * i; j <= N; j += i) isP[j] = 0;
    const pi = new Array(N + 1).fill(0);
    for (let i = 1; i <= N; i++) pi[i] = pi[i - 1] + (isP[i] ? 1 : 0);

    function draw() {
      const X = +xIn.value;
      const ox = 50,
        oy = 290,
        W = 400,
        H = 220;
      const maxY = Math.max(pi[X], X / Math.log(X)) * 1.12;
      const mx = (x) => ox + (x / X) * W;
      const my = (y) => oy - (y / maxY) * H;
      let p1 = "",
        p2 = "";
      const step = Math.max(1, Math.floor(X / 100));
      for (let x = 2; x <= X; x += step) {
        p1 += `${x === 2 ? "M" : "L"}${mx(x)},${my(pi[x])} `;
        p2 += `${x === 2 ? "M" : "L"}${mx(x)},${my(x / Math.log(x))} `;
      }
      p1 += `L${mx(X)},${my(pi[X])}`;
      p2 += `L${mx(X)},${my(X / Math.log(X))}`;
      const ratio = pi[X] / (X / Math.log(X));

      ui.svg.innerHTML = `
        <rect width="640" height="340" fill="#0b1220"/>
        <line x1="${ox}" y1="${oy}" x2="${ox + W}" y2="${oy}" stroke="#334155"/>
        <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy - H}" stroke="#334155"/>
        <path d="${p1}" fill="none" stroke="#60a5fa" stroke-width="2.5"/>
        <path d="${p2}" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="6 4"/>
        <text x="50" y="36" fill="#60a5fa" font-size="13">π(x)</text>
        <text x="120" y="36" fill="#facc15" font-size="13">x/ln x</text>
      `;
      ui.side.innerHTML = `
        <div class="ix-kv"><span>X</span><b>${X}</b></div>
        <div class="ix-kv"><span>π(X)</span><b>${pi[X]}</b></div>
        <div class="ix-kv"><span>X/ln X</span><b>${(X / Math.log(X)).toFixed(1)}</b></div>
        <div class="ix-kv hi"><span>比值</span><b>${ratio.toFixed(4)}</b></div>
        <p class="ix-note">PNT：比值 → 1。证明经 ζ(1+it)≠0 与 ψ(x)∼x。</p>
      `;
      ui.out.innerHTML = `更强误差与黎曼假设有关；PNT 本身 1896 年用复分析完成。`;
    }
    bindRanges(ui.wrap, draw);
    draw();
    return ui.wrap;
  };

  // 注入挂谷 L2 到页面：扩展 inject 标记（在 theorems-extra 再加一行更干净）
  // 注册完成
})();
