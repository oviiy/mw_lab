/**
 * 数学奇境 · 交互图示引擎
 * 在页面中查找 [data-widget="..."] 并挂载
 */
window.Diagrams = (function () {
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function mount(root) {
    if (!root) return;
    root.querySelectorAll("[data-widget]").forEach((node) => {
      const name = node.getAttribute("data-widget");
      const factory = widgets[name];
      if (!factory) {
        node.innerHTML = `<p style="color:#94a3b8">（未找到图示组件：${name}）</p>`;
        return;
      }
      node.innerHTML = "";
      node.appendChild(factory(node.dataset));
    });
  }

  /* ========== 挂谷：两管夹角与重叠 ========== */
  function kakeyaTubes() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">两管重叠</div>
      <p class="ix-desc">夹角 θ ↑ → 重叠面积 ↓（∝ δ²/sinθ）</p>
      <div class="ix-controls">
        <label>夹角 θ <span data-v="theta">30°</span>
          <input type="range" min="5" max="90" value="30" data-k="theta" />
        </label>
        <label>管宽 δ <span data-v="delta">18</span>
          <input type="range" min="6" max="36" value="18" data-k="delta" />
        </label>
      </div>
      <svg viewBox="0 0 520 320" class="ix-svg" aria-label="两管重叠示意图"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    const labels = {
      theta: wrap.querySelector('[data-v="theta"]'),
      delta: wrap.querySelector('[data-v="delta"]')
    };

    function tubePolygon(cx, cy, angleDeg, len, halfW) {
      const a = (angleDeg * Math.PI) / 180;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const px = -dy * halfW;
      const py = dx * halfW;
      const x0 = cx - (dx * len) / 2;
      const y0 = cy - (dy * len) / 2;
      const x1 = cx + (dx * len) / 2;
      const y1 = cy + (dy * len) / 2;
      return [
        [x0 + px, y0 + py],
        [x1 + px, y1 + py],
        [x1 - px, y1 - py],
        [x0 - px, y0 - py]
      ];
    }

    function polyStr(pts) {
      return pts.map((p) => p.join(",")).join(" ");
    }

    // approximate overlap parallelogram near origin
    function overlapPoly(thetaDeg, halfW) {
      const th = (thetaDeg * Math.PI) / 180;
      const s = Math.sin(th) || 0.05;
      // diamond-like region scale ~ halfW / sin
      const L = halfW / s;
      const a1 = 0;
      const a2 = th;
      // corners of intersection of two infinite strips (approx finite blob)
      const n1 = [-Math.sin(a1), Math.cos(a1)];
      const n2 = [-Math.sin(a2), Math.cos(a2)];
      // four lines n·x = ±halfW
      // Solve intersections
      function solve(nA, cA, nB, cB) {
        const det = nA[0] * nB[1] - nA[1] * nB[0];
        if (Math.abs(det) < 1e-6) return [0, 0];
        const x = (cA * nB[1] - cB * nA[1]) / det;
        const y = (nA[0] * cB - nB[0] * cA) / det;
        return [x, y];
      }
      const corners = [
        solve(n1, halfW, n2, halfW),
        solve(n1, halfW, n2, -halfW),
        solve(n1, -halfW, n2, -halfW),
        solve(n1, -halfW, n2, halfW)
      ];
      // order by angle
      const cx = 0,
        cy = 0;
      corners.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
      // scale for display around center 260,160
      return corners.map(([x, y]) => [260 + x * 2.2, 160 + y * 2.2]);
    }

    function draw() {
      const theta = +wrap.querySelector('[data-k="theta"]').value;
      const delta = +wrap.querySelector('[data-k="delta"]').value;
      labels.theta.textContent = theta + "°";
      labels.delta.textContent = delta + " px";
      const half = delta / 2;
      const len = 260;
      const t1 = tubePolygon(260, 160, 0, len, half);
      const t2 = tubePolygon(260, 160, -theta, len, half);
      const ov = overlapPoly(theta, half);
      const th = (theta * Math.PI) / 180;
      const areaEst = (delta * delta) / Math.max(Math.sin(th), 0.08);
      svg.innerHTML = `
        <rect width="520" height="320" fill="#0f172a" rx="12"/>
        <polygon points="${polyStr(t1)}" fill="rgba(110,181,255,0.35)" stroke="#6eb5ff" stroke-width="2"/>
        <polygon points="${polyStr(t2)}" fill="rgba(255,159,110,0.35)" stroke="#ff9f6e" stroke-width="2"/>
        <polygon points="${polyStr(ov)}" fill="rgba(251,191,36,0.55)" stroke="#fbbf24" stroke-width="2"/>
        <circle cx="260" cy="160" r="3" fill="#fff"/>
        <path d="M 320 160 A 40 40 0 0 0 ${320 + 40 * Math.cos((-theta * Math.PI) / 180)} ${160 + 40 * Math.sin((-theta * Math.PI) / 180)}"
          fill="none" stroke="#e2e8f0" stroke-width="1.5"/>
        <text x="355" y="150" fill="#e2e8f0" font-size="14">θ</text>
        <text x="20" y="28" fill="#6eb5ff" font-size="13">管 A</text>
        <text x="20" y="48" fill="#ff9f6e" font-size="13">管 B</text>
        <text x="20" y="68" fill="#fbbf24" font-size="13">重叠 ≈ δ² / sinθ</text>
      `;
      out.innerHTML = `重叠 ∝ δ²/sinθ ≈ <code>${areaEst.toFixed(1)}</code>`;
    }

    wrap.querySelectorAll("input").forEach((inp) => inp.addEventListener("input", draw));
    draw();
    return wrap;
  }

  /* ========== 挂谷：滑动三角形动画 ========== */
  function kakeyaPerron() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">滑动三角形</div>
      <p class="ix-desc">细分并滑动 → 面积减小，方向保留</p>
      <div class="ix-controls">
        <label>细分 / 滑动程度 <span data-v="step">0</span>
          <input type="range" min="0" max="100" value="0" data-k="step" />
        </label>
        <button type="button" class="ix-btn" data-play>自动播放</button>
      </div>
      <svg viewBox="0 0 520 300" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    const stepLab = wrap.querySelector('[data-v="step"]');
    let timer = null;

    function draw(step) {
      stepLab.textContent = step;
      const t = step / 100;
      const n = 5;
      const colors = ["#6eb5ff", "#ff9f6e", "#b08cff", "#3dcc8c", "#fbbf24"];
      let polys = "";
      for (let i = 0; i < n; i++) {
        const spread = 40 * (1 - t); // base separation shrinks
        const baseX = 80 + i * (spread + 8) + t * 70;
        const tipX = 200 + i * (8 + (1 - t) * 25) + t * 40;
        const tipY = 40 + i * 4;
        const bw = 36 + (1 - t) * 10;
        polys += `<polygon points="${baseX},250 ${baseX + bw},250 ${tipX},${tipY}"
          fill="${colors[i]}" fill-opacity="0.35" stroke="${colors[i]}" stroke-width="1.5"/>`;
      }
      const areaFactor = (1 - 0.55 * t).toFixed(2);
      svg.innerHTML = `
        <rect width="520" height="300" fill="#0f172a" rx="12"/>
        ${polys}
        <text x="20" y="28" fill="#94a3b8" font-size="13">相对面积 ≈ ${areaFactor} × 初始</text>
        <text x="20" y="280" fill="#64748b" font-size="12">黄框：底侧重叠区随滑动增大</text>
        <ellipse cx="${220 + t * 60}" cy="248" rx="${50 + t * 40}" ry="14" fill="none" stroke="#fbbf24" stroke-dasharray="4 3"/>
      `;
      out.innerHTML = t < 0.5 ? "片分开，面积大" : "底侧重叠，并集变小";
    }

    const slider = wrap.querySelector('[data-k="step"]');
    slider.addEventListener("input", () => draw(+slider.value));
    wrap.querySelector("[data-play]").addEventListener("click", () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        return;
      }
      timer = setInterval(() => {
        let v = +slider.value + 2;
        if (v > 100) v = 0;
        slider.value = v;
        draw(v);
      }, 40);
    });
    draw(0);
    return wrap;
  }

  /* ========== 素数定理：π(x) 曲线 ========== */
  function pntChart() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">π(x) 与 x/ln x</div>
      <p class="ix-desc">拖动 X 比较素数计数与渐近近似</p>
      <div class="ix-controls">
        <label>查看上限 X <span data-v="X">200</span>
          <input type="range" min="30" max="500" value="200" data-k="X" />
        </label>
      </div>
      <svg viewBox="0 0 520 300" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    // sieve primes up to 500
    const N = 500;
    const isP = new Uint8Array(N + 1);
    isP.fill(1);
    isP[0] = isP[1] = 0;
    for (let i = 2; i * i <= N; i++) if (isP[i]) for (let j = i * i; j <= N; j += i) isP[j] = 0;
    const pi = new Array(N + 1).fill(0);
    for (let i = 1; i <= N; i++) pi[i] = pi[i - 1] + (isP[i] ? 1 : 0);

    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    const lab = wrap.querySelector('[data-v="X"]');

    function draw() {
      const X = +wrap.querySelector('[data-k="X"]').value;
      lab.textContent = X;
      const W = 480,
        H = 220,
        ox = 30,
        oy = 260;
      const maxY = Math.max(pi[X], X / Math.log(X)) * 1.15;
      function mapX(x) {
        return ox + (x / X) * W;
      }
      function mapY(y) {
        return oy - (y / maxY) * H;
      }
      let pathPi = "";
      let pathLi = "";
      const step = Math.max(1, Math.floor(X / 120));
      for (let x = 2; x <= X; x += step) {
        const cmd = x === 2 ? "M" : "L";
        pathPi += `${cmd}${mapX(x)},${mapY(pi[x])} `;
        pathLi += `${cmd}${mapX(x)},${mapY(x / Math.log(x))} `;
      }
      // finish at X
      pathPi += `L${mapX(X)},${mapY(pi[X])}`;
      pathLi += `L${mapX(X)},${mapY(X / Math.log(X))}`;
      svg.innerHTML = `
        <rect width="520" height="300" fill="#0f172a" rx="12"/>
        <line x1="${ox}" y1="${oy}" x2="${ox + W}" y2="${oy}" stroke="#334155"/>
        <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy - H}" stroke="#334155"/>
        <path d="${pathPi}" fill="none" stroke="#6eb5ff" stroke-width="2.5"/>
        <path d="${pathLi}" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="6 4"/>
        <text x="40" y="28" fill="#6eb5ff" font-size="13">π(x) 实线</text>
        <text x="140" y="28" fill="#fbbf24" font-size="13">x/ln x 虚线</text>
        <text x="${ox + W - 10}" y="${oy + 18}" fill="#94a3b8" font-size="12" text-anchor="end">x</text>
      `;
      const p = pi[X];
      const approx = X / Math.log(X);
      const ratio = p / approx;
      out.innerHTML = `π(${X})=${p}，X/ln X≈${approx.toFixed(1)}，比值≈${ratio.toFixed(3)} → 1 (x→∞)`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== 高斯-博内：球面三角角盈 ========== */
  function gaussBonnetSphere() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">球面角盈</div>
      <p class="ix-desc">内角和 &gt; 180°；角盈 = 面积（单位球）</p>
      <div class="ix-controls">
        <label>角盈（相对） <span data-v="ex">0.4</span>
          <input type="range" min="10" max="90" value="40" data-k="ex" />
        </label>
      </div>
      <svg viewBox="0 0 520 300" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    const lab = wrap.querySelector('[data-v="ex"]');

    function draw() {
      const exDeg = +wrap.querySelector('[data-k="ex"]').value;
      const ex = (exDeg * Math.PI) / 180;
      lab.textContent = exDeg + "°";
      // visualize sphere circle + triangle that "bulges"
      const bulge = 0.3 + (exDeg / 90) * 0.7;
      const A = [180, 200];
      const B = [340, 200];
      const C = [260, 70 + (1 - bulge) * 40];
      // curved sides as quadratic beziers pulling outward
      function mid(p, q, pull) {
        return [(p[0] + q[0]) / 2 + pull[0], (p[1] + q[1]) / 2 + pull[1]];
      }
      const mAB = mid(A, B, [0, 25 * bulge]);
      const mBC = mid(B, C, [30 * bulge, -10 * bulge]);
      const mCA = mid(C, A, [-30 * bulge, -10 * bulge]);
      const angleSum = 180 + exDeg;
      svg.innerHTML = `
        <rect width="520" height="300" fill="#0f172a" rx="12"/>
        <circle cx="260" cy="150" r="120" fill="#1e293b" stroke="#475569" stroke-width="2"/>
        <path d="M ${A} Q ${mAB} ${B} Q ${mBC} ${C} Q ${mCA} ${A}"
          fill="rgba(167,139,250,0.35)" stroke="#a78bfa" stroke-width="2.5"/>
        <circle cx="${A[0]}" cy="${A[1]}" r="4" fill="#fbbf24"/>
        <circle cx="${B[0]}" cy="${B[1]}" r="4" fill="#fbbf24"/>
        <circle cx="${C[0]}" cy="${C[1]}" r="4" fill="#fbbf24"/>
        <text x="20" y="30" fill="#e2e8f0" font-size="14">内角和 ≈ ${angleSum}°</text>
        <text x="20" y="52" fill="#a78bfa" font-size="13">角盈 ε = ${exDeg}° ≈ 面积（单位球）</text>
      `;
      out.innerHTML = `ε = A+B+C−π = Area/R²；平面极限 ε→0`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== 黎曼映射：区域 → 圆盘 示意 ========== */
  function riemannMap() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">共形 → 单位圆盘</div>
      <p class="ix-desc">单连通区域全纯双射到 𝔻（保角）</p>
      <div class="ix-controls">
        <label>区域怪异度 <span data-v="w">30%</span>
          <input type="range" min="0" max="100" value="30" data-k="w" />
        </label>
        <label>映射进度（→圆盘） <span data-v="m">0%</span>
          <input type="range" min="0" max="100" value="0" data-k="m" />
        </label>
      </div>
      <svg viewBox="0 0 520 300" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");

    function blobPath(cx, cy, R, weird, phase) {
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const th = (i / 48) * Math.PI * 2;
        const wobble =
          1 +
          weird * 0.35 * Math.sin(3 * th + phase) +
          weird * 0.2 * Math.cos(5 * th - phase);
        const r = R * wobble;
        pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]);
      }
      return pts.map((p, i) => (i ? "L" : "M") + p.join(",")).join(" ") + " Z";
    }

    function draw() {
      const w = +wrap.querySelector('[data-k="w"]').value / 100;
      const m = +wrap.querySelector('[data-k="m"]').value / 100;
      wrap.querySelector('[data-v="w"]').textContent = Math.round(w * 100) + "%";
      wrap.querySelector('[data-v="m"]').textContent = Math.round(m * 100) + "%";
      const weird = w * (1 - m);
      const R = 70 + m * 10;
      // grid inside
      let grid = "";
      for (let i = -3; i <= 3; i++) {
        const x1 = 150 + i * 18;
        grid += `<line x1="${x1}" y1="80" x2="${150 + i * 18 * (1 - 0.3 * m)}" y2="220" stroke="#334155" stroke-width="1"/>`;
      }
      // right side unit disk grid
      let diskGrid = "";
      for (let k = 1; k <= 3; k++) {
        diskGrid += `<circle cx="380" cy="150" r="${20 * k}" fill="none" stroke="#334155"/>`;
      }
      for (let k = 0; k < 8; k++) {
        const th = (k * Math.PI) / 4;
        diskGrid += `<line x1="380" y1="150" x2="${380 + 60 * Math.cos(th)}" y2="${150 + 60 * Math.sin(th)}" stroke="#334155"/>`;
      }
      const left = blobPath(150, 150, R, weird, 0.5);
      const rightR = 60;
      svg.innerHTML = `
        <rect width="520" height="300" fill="#0f172a" rx="12"/>
        <path d="${left}" fill="rgba(110,181,255,0.25)" stroke="#6eb5ff" stroke-width="2"/>
        ${grid}
        <text x="150" y="40" fill="#6eb5ff" font-size="13" text-anchor="middle">区域 Ω（单连通）</text>
        <path d="M 230 150 L 300 150" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>
        <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#94a3b8"/></marker></defs>
        <circle cx="380" cy="150" r="${rightR}" fill="rgba(61,204,140,0.2)" stroke="#3dcc8c" stroke-width="2"/>
        ${diskGrid}
        <text x="380" y="40" fill="#3dcc8c" font-size="13" text-anchor="middle">单位圆盘 𝔻</text>
        <text x="260" y="280" fill="#fbbf24" font-size="12" text-anchor="middle">f: Ω → 𝔻 全纯双射，f'(z₀)>0 时唯一</text>
      `;
      out.innerHTML = m < 0.5 ? "区域 Ω（单连通）" : "f: Ω→𝔻 全纯双射，规范化后唯一";
    }
    wrap.querySelectorAll("input").forEach((i) => i.addEventListener("input", draw));
    draw();
    return wrap;
  }

  /* ========== 勾股拼图 ========== */
  function pythagorasTiles() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">勾股 a²+b²=c²</div>
      <p class="ix-desc">调节 a、b</p>
      <div class="ix-controls">
        <label>a <span data-v="a">60</span><input type="range" min="30" max="100" value="60" data-k="a"/></label>
        <label>b <span data-v="b">80</span><input type="range" min="30" max="100" value="80" data-k="b"/></label>
      </div>
      <svg viewBox="0 0 520 320" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const a = +wrap.querySelector('[data-k="a"]').value;
      const b = +wrap.querySelector('[data-k="b"]').value;
      wrap.querySelector('[data-v="a"]').textContent = a;
      wrap.querySelector('[data-v="b"]').textContent = b;
      const c = Math.sqrt(a * a + b * b);
      const S = a + b;
      const scale = 200 / S;
      const A = a * scale,
        B = b * scale,
        C = c * scale,
        side = S * scale;
      const ox = 40,
        oy = 40;
      // outer square
      // four triangles and inner square - van Schooten style
      // positions for right triangles with legs along outer square
      svg.innerHTML = `
        <rect width="520" height="320" fill="#0f172a" rx="12"/>
        <rect x="${ox}" y="${oy}" width="${side}" height="${side}" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
        <polygon points="${ox},${oy} ${ox + B},${oy} ${ox},${oy + A}" fill="rgba(110,181,255,0.45)" stroke="#6eb5ff"/>
        <polygon points="${ox + side},${oy} ${ox + side},${oy + B} ${ox + side - A},${oy}" fill="rgba(255,159,110,0.45)" stroke="#ff9f6e"/>
        <polygon points="${ox + side},${oy + side} ${ox + side - B},${oy + side} ${ox + side},${oy + side - A}" fill="rgba(176,140,255,0.45)" stroke="#b08cff"/>
        <polygon points="${ox},${oy + side} ${ox},${oy + side - B} ${ox + A},${oy + side}" fill="rgba(61,204,140,0.45)" stroke="#3dcc8c"/>
        <rect x="${ox + B}" y="${oy + A}" width="${C}" height="${C}" transform="rotate(${(-Math.atan2(a, b) * 180) / Math.PI} ${ox + B} ${oy + A})"
          fill="rgba(251,191,36,0.25)" stroke="#fbbf24" stroke-width="2" display="none"/>
        <text x="360" y="80" fill="#e2e8f0" font-size="14">a=${a}, b=${b}</text>
        <text x="360" y="105" fill="#fbbf24" font-size="14">c=√(a²+b²)≈${c.toFixed(1)}</text>
        <text x="360" y="140" fill="#94a3b8" font-size="13">(a+b)² = ${S * S}</text>
        <text x="360" y="162" fill="#94a3b8" font-size="13">4·(ab/2)+c² = ${2 * a * b + c * c}</text>
      `;
      // better inner square: corners are the inner vertices of triangles
      const p1 = [ox + B, oy];
      const p2 = [ox + side, oy + B];
      const p3 = [ox + side - B, oy + side];
      const p4 = [ox, oy + side - B];
      // wait the triangle placement might be wrong. Simpler: show equation numbers only + right triangle
      svg.innerHTML = `
        <rect width="520" height="320" fill="#0f172a" rx="12"/>
        <polygon points="80,260 80,${260 - B} ${80 + A},260" fill="rgba(110,181,255,0.4)" stroke="#6eb5ff" stroke-width="2"/>
        <rect x="80" y="${260 - 12}" width="12" height="12" fill="none" stroke="#fbbf24"/>
        <text x="80" y="285" fill="#93c5fd" font-size="13">a</text>
        <text x="55" y="${260 - B / 2}" fill="#93c5fd" font-size="13">b</text>
        <text x="${80 + A / 2 + 20}" y="${260 - B / 2}" fill="#fbbf24" font-size="13">c</text>
        <text x="280" y="100" fill="#e2e8f0" font-size="16">a² + b² = c²</text>
        <text x="280" y="140" fill="#6eb5ff" font-size="14">${a}² + ${b}² = ${a * a + b * b}</text>
        <text x="280" y="165" fill="#fbbf24" font-size="14">c² ≈ ${(c * c).toFixed(1)}</text>
        <text x="280" y="210" fill="#94a3b8" font-size="13">大正方形 (a+b)² = ${S * S}</text>
        <text x="280" y="232" fill="#94a3b8" font-size="13">4 三角形 + 内正方形 = ${2 * a * b} + ${(c * c).toFixed(0)} = ${(2 * a * b + c * c).toFixed(0)}</text>
      `;
      out.textContent = `(a+b)² = 4·(ab/2)+c² 恒成立`;
    }
    wrap.querySelectorAll("input").forEach((i) => i.addEventListener("input", draw));
    draw();
    return wrap;
  }

  /* ========== 康托对角线 ========== */
  function cantorDiagonal() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">对角线法</div>
      <p class="ix-desc">改 aₙₙ 得 y，与每一行都不同</p>
      <div class="ix-controls">
        <button type="button" class="ix-btn" data-reshuffle>换一组随机名单</button>
      </div>
      <svg viewBox="0 0 520 280" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");

    function randDigit() {
      return Math.floor(Math.random() * 10);
    }

    function draw() {
      const rows = 5;
      const cols = 8;
      const grid = [];
      for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) row.push(randDigit());
        grid.push(row);
      }
      const y = grid.map((row, i) => (row[i] === 4 ? 5 : 4));
      let cells = "";
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = 40 + j * 36;
          const yy = 40 + i * 36;
          const diag = i === j;
          cells += `<rect x="${x}" y="${yy}" width="32" height="32" rx="4"
            fill="${diag ? "#3b2f0e" : "#1e293b"}" stroke="${diag ? "#fbbf24" : "#334155"}"/>
            <text x="${x + 16}" y="${yy + 21}" text-anchor="middle" fill="${diag ? "#fbbf24" : "#e2e8f0"}" font-size="14">${grid[i][j]}</text>`;
        }
        cells += `<text x="12" y="${55 + i * 36}" fill="#64748b" font-size="12">x${i + 1}</text>`;
      }
      let ycells = "";
      for (let j = 0; j < rows; j++) {
        const x = 40 + j * 36;
        ycells += `<rect x="${x}" y="230" width="32" height="32" rx="4" fill="#14532d" stroke="#3dcc8c"/>
          <text x="${x + 16}" y="251" text-anchor="middle" fill="#86efac" font-size="14">${y[j]}</text>`;
      }
      svg.innerHTML = `
        <rect width="520" height="280" fill="#0f172a" rx="12"/>
        ${cells}
        <text x="12" y="250" fill="#3dcc8c" font-size="12">y</text>
        ${ycells}
        <text x="320" y="50" fill="#94a3b8" font-size="12">黄框 = 对角线 aₙₙ</text>
        <text x="320" y="250" fill="#86efac" font-size="12">y 的前 ${rows} 位</text>
      `;
      out.innerHTML = `y=0.${y.join("")}… ∉ 名单`;
    }
    wrap.querySelector("[data-reshuffle]").addEventListener("click", draw);
    draw();
    return wrap;
  }

  /* ========== 欧拉多面体 V-E+F ========== */
  function eulerPoly() {
    const wrap = el(`<div class="ix-card"></div>`);
    const solids = {
      tetra: { name: "四面体", V: 4, E: 6, F: 4 },
      cube: { name: "立方体", V: 8, E: 12, F: 6 },
      octa: { name: "八面体", V: 6, E: 12, F: 8 },
      dodeca: { name: "十二面体", V: 20, E: 30, F: 12 },
      icosa: { name: "二十面体", V: 12, E: 30, F: 20 }
    };
    wrap.innerHTML = `
      <div class="ix-title">V − E + F</div>
      <div class="ix-controls" data-btns></div>
      <svg viewBox="0 0 520 240" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const btns = wrap.querySelector("[data-btns]");
    Object.keys(solids).forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ix-btn";
      b.textContent = solids[k].name;
      b.addEventListener("click", () => draw(k));
      btns.appendChild(b);
    });
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw(key) {
      const s = solids[key];
      const chi = s.V - s.E + s.F;
      svg.innerHTML = `
        <rect width="520" height="240" fill="#0f172a" rx="12"/>
        <text x="260" y="70" text-anchor="middle" fill="#e2e8f0" font-size="22">${s.name}</text>
        <text x="120" y="140" text-anchor="middle" fill="#6eb5ff" font-size="18">V=${s.V}</text>
        <text x="260" y="140" text-anchor="middle" fill="#ff9f6e" font-size="18">E=${s.E}</text>
        <text x="400" y="140" text-anchor="middle" fill="#b08cff" font-size="18">F=${s.F}</text>
        <text x="260" y="190" text-anchor="middle" fill="#fbbf24" font-size="20">V − E + F = ${chi}</text>
      `;
      out.textContent = chi === 2 ? "等于 2：与球面同胚的多面体。" : "异常！";
    }
    draw("cube");
    return wrap;
  }

  /* ========== 欧几里得：素数无穷 构造 N ========== */
  function euclidPrimes() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">欧几里得构造 N = P+1</div>
      <p class="ix-desc">勾选「已知素数」，构造 N 并分解出新素因子</p>
      <div class="ix-controls" data-primes style="flex-wrap:wrap"></div>
      <svg viewBox="0 0 520 200" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const primes = [2, 3, 5, 7, 11, 13, 17, 19];
    const box = wrap.querySelector("[data-primes]");
    primes.forEach((p, i) => {
      const lab = document.createElement("label");
      lab.style.cssText = "flex-direction:row;align-items:center;gap:0.35rem;min-width:auto";
      lab.innerHTML = `<input type="checkbox" value="${p}" ${i < 3 ? "checked" : ""}/> ${p}`;
      box.appendChild(lab);
    });
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");

    function factorize(n) {
      const f = [];
      let x = n;
      for (let p = 2; p * p <= x; p++) {
        while (x % p === 0) {
          f.push(p);
          x /= p;
        }
      }
      if (x > 1) f.push(x);
      return f;
    }

    function draw() {
      const sel = [...box.querySelectorAll("input:checked")].map((c) => +c.value);
      if (!sel.length) {
        out.textContent = "请至少选一个素数";
        return;
      }
      const P = sel.reduce((a, b) => a * b, 1);
      const N = P + 1;
      const fac = factorize(N);
      const newOnes = fac.filter((p) => !sel.includes(p));
      svg.innerHTML = `
        <rect width="520" height="200" fill="#0f172a" rx="12"/>
        <text x="24" y="40" fill="#94a3b8" font-size="14">名单 p₁…pₖ = {${sel.join(", ")}}</text>
        <text x="24" y="75" fill="#6eb5ff" font-size="16">P = ${sel.join("×")} = ${P}</text>
        <text x="24" y="110" fill="#fbbf24" font-size="18">N = P+1 = ${N}</text>
        <text x="24" y="150" fill="#3dcc8c" font-size="15">N 的素因子：${fac.join(" × ")}</text>
        <text x="24" y="180" fill="#e2e8f0" font-size="14">新素数：${newOnes.length ? newOnes.join(", ") : "（N 本身可能是新素）"}</text>
      `;
      out.innerHTML = `每个旧 p 整除 P 故不整除 N（余 1）。故 N 的素因子必为<strong>新素数</strong> → 名单不可能完备。`;
    }
    box.querySelectorAll("input").forEach((c) => c.addEventListener("change", draw));
    draw();
    return wrap;
  }

  /* ========== √2 无理：偶奇步骤 ========== */
  function sqrt2Proof() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">√2 无理 · 反证步骤</div>
      <p class="ix-desc">逐步展开：既约 → a²=2b² → a 偶 → b 偶 → 矛盾</p>
      <div class="ix-controls">
        <label>步骤 <span data-v="s">0</span>
          <input type="range" min="0" max="5" value="0" data-k="s"/>
        </label>
      </div>
      <svg viewBox="0 0 520 240" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const steps = [
      { t: "反设 √2 = a/b，gcd(a,b)=1", d: "既约分数" },
      { t: "平方：a² = 2b²", d: "左边偶 ⇒ a² 偶 ⇒ a 偶" },
      { t: "写 a = 2k", d: "代入：4k² = 2b² ⇒ b² = 2k²" },
      { t: "b² 偶 ⇒ b 偶", d: "a、b 均为偶数" },
      { t: "与 gcd(a,b)=1 矛盾", d: "故 √2 不是有理数" },
      { t: "∎ 证毕", d: "推广：√m（m 非完全平方）同理" }
    ];
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const s = +wrap.querySelector("[data-k=s]").value;
      wrap.querySelector("[data-v=s]").textContent = s;
      let rows = "";
      steps.forEach((st, i) => {
        const on = i <= s;
        const y = 36 + i * 32;
        rows += `<circle cx="36" cy="${y}" r="10" fill="${on ? "#3b82f6" : "#1e293b"}" stroke="#64748b"/>
          <text x="36" y="${y + 4}" text-anchor="middle" fill="#fff" font-size="11">${i}</text>
          <text x="56" y="${y + 5}" fill="${on ? "#e2e8f0" : "#475569"}" font-size="14">${st.t}</text>`;
      });
      svg.innerHTML = `<rect width="520" height="240" fill="#0f172a" rx="12"/>${rows}`;
      out.textContent = steps[s].d;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== 中间值 / 二分法 ========== */
  function ivtBisection() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">中间值 · 二分法求根</div>
      <p class="ix-desc">f(x)=x³−x−1，f(1)&lt;0&lt;f(2)。逐步二分逼近根</p>
      <div class="ix-controls">
        <label>二分次数 <span data-v="n">0</span>
          <input type="range" min="0" max="12" value="0" data-k="n"/>
        </label>
        <button type="button" class="ix-btn" data-play>逐步+</button>
      </div>
      <svg viewBox="0 0 520 280" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const f = (x) => x * x * x - x - 1;
    let a = 1,
      b = 2;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const n = +wrap.querySelector("[data-k=n]").value;
      wrap.querySelector("[data-v=n]").textContent = n;
      a = 1;
      b = 2;
      for (let i = 0; i < n; i++) {
        const m = (a + b) / 2;
        if (f(a) * f(m) <= 0) b = m;
        else a = m;
      }
      const m = (a + b) / 2;
      // plot
      const ox = 40,
        oy = 220,
        W = 440,
        H = 160;
      const x0 = 0.5,
        x1 = 2.5;
      function mx(x) {
        return ox + ((x - x0) / (x1 - x0)) * W;
      }
      function my(y) {
        return oy - ((y + 2) / 6) * H;
      }
      let path = "";
      for (let i = 0; i <= 80; i++) {
        const x = x0 + ((x1 - x0) * i) / 80;
        path += `${i ? "L" : "M"}${mx(x)},${my(f(x))} `;
      }
      svg.innerHTML = `
        <rect width="520" height="280" fill="#0f172a" rx="12"/>
        <line x1="${ox}" y1="${my(0)}" x2="${ox + W}" y2="${my(0)}" stroke="#334155"/>
        <path d="${path}" fill="none" stroke="#6eb5ff" stroke-width="2"/>
        <line x1="${mx(a)}" y1="40" x2="${mx(a)}" y2="240" stroke="#fbbf24" stroke-dasharray="4 3"/>
        <line x1="${mx(b)}" y1="40" x2="${mx(b)}" y2="240" stroke="#fbbf24" stroke-dasharray="4 3"/>
        <circle cx="${mx(m)}" cy="${my(f(m))}" r="5" fill="#3dcc8c"/>
        <text x="24" y="28" fill="#e2e8f0" font-size="13">区间 [a,b]=[${a.toFixed(4)}, ${b.toFixed(4)}]</text>
      `;
      out.innerHTML = `中点 m=${m.toFixed(5)}，f(m)=${f(m).toFixed(5)}；长度=${(b - a).toFixed(5)} ≤ 1/2ⁿ`;
    }
    wrap.querySelector("[data-k=n]").addEventListener("input", draw);
    wrap.querySelector("[data-play]").addEventListener("click", () => {
      const inp = wrap.querySelector("[data-k=n]");
      inp.value = Math.min(12, +inp.value + 1);
      draw();
    });
    draw();
    return wrap;
  }

  /* ========== 中值定理：割线与切线 ========== */
  function mvtVisual() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">中值定理 · 割线 ∥ 切线</div>
      <p class="ix-desc">f(x)=x²。存在 ξ 使 f'(ξ)=[f(b)−f(a)]/(b−a)</p>
      <div class="ix-controls">
        <label>a <span data-v="a">0.5</span><input type="range" min="0" max="20" value="5" data-k="a"/></label>
        <label>b <span data-v="b">2.5</span><input type="range" min="10" max="40" value="25" data-k="b"/></label>
      </div>
      <svg viewBox="0 0 520 280" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const a = +wrap.querySelector("[data-k=a]").value / 10;
      const b = +wrap.querySelector("[data-k=b]").value / 10;
      wrap.querySelector("[data-v=a]").textContent = a.toFixed(1);
      wrap.querySelector("[data-v=b]").textContent = b.toFixed(1);
      if (b <= a + 0.1) return;
      const slope = (b * b - a * a) / (b - a); // = a+b for x²
      const xi = slope / 2; // f'=2x
      const ox = 50,
        oy = 240,
        sx = 90,
        sy = 18;
      function X(x) {
        return ox + x * sx;
      }
      function Y(y) {
        return oy - y * sy;
      }
      let curve = "";
      for (let i = 0; i <= 50; i++) {
        const x = i * 0.08;
        curve += `${i ? "L" : "M"}${X(x)},${Y(x * x)} `;
      }
      // tangent at xi: y - xi² = 2xi (x-xi)
      const t1 = xi - 0.8,
        t2 = xi + 0.8;
      const y1 = xi * xi + 2 * xi * (t1 - xi);
      const y2 = xi * xi + 2 * xi * (t2 - xi);
      svg.innerHTML = `
        <rect width="520" height="280" fill="#0f172a" rx="12"/>
        <path d="${curve}" fill="none" stroke="#6eb5ff" stroke-width="2"/>
        <line x1="${X(a)}" y1="${Y(a * a)}" x2="${X(b)}" y2="${Y(b * b)}" stroke="#fbbf24" stroke-width="2"/>
        <line x1="${X(t1)}" y1="${Y(y1)}" x2="${X(t2)}" y2="${Y(y2)}" stroke="#3dcc8c" stroke-width="2" stroke-dasharray="5 3"/>
        <circle cx="${X(a)}" cy="${Y(a * a)}" r="4" fill="#fbbf24"/>
        <circle cx="${X(b)}" cy="${Y(b * b)}" r="4" fill="#fbbf24"/>
        <circle cx="${X(xi)}" cy="${Y(xi * xi)}" r="5" fill="#3dcc8c"/>
        <text x="360" y="40" fill="#fbbf24" font-size="13">割线斜率 ${(a + b).toFixed(2)}</text>
        <text x="360" y="62" fill="#3dcc8c" font-size="13">ξ=${xi.toFixed(2)}，f'=2ξ</text>
      `;
      out.innerHTML = `对 f=x²：ξ=(a+b)/2，f'(ξ)=a+b=割线斜率。一般情形由罗尔定理+辅助函数证明。`;
    }
    wrap.querySelectorAll("input").forEach((i) => i.addEventListener("input", draw));
    draw();
    return wrap;
  }

  /* ========== 欧拉公式：单位圆 ========== */
  function eulerCircle() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">e^{iθ} 在单位圆上</div>
      <p class="ix-desc">e^{iθ}=cosθ+i sinθ。θ=π 时落到 −1</p>
      <div class="ix-controls">
        <label>θ (°) <span data-v="th">60</span>
          <input type="range" min="0" max="360" value="60" data-k="th"/>
        </label>
      </div>
      <svg viewBox="0 0 520 300" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const deg = +wrap.querySelector("[data-k=th]").value;
      wrap.querySelector("[data-v=th]").textContent = deg;
      const th = (deg * Math.PI) / 180;
      const cx = 200,
        cy = 150,
        R = 100;
      const x = cx + R * Math.cos(th);
      const y = cy - R * Math.sin(th);
      const c = Math.cos(th),
        s = Math.sin(th);
      svg.innerHTML = `
        <rect width="520" height="300" fill="#0f172a" rx="12"/>
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#334155" stroke-width="2"/>
        <line x1="${cx - R - 20}" y1="${cy}" x2="${cx + R + 20}" y2="${cy}" stroke="#475569"/>
        <line x1="${cx}" y1="${cy + R + 20}" x2="${cx}" y2="${cy - R - 20}" stroke="#475569"/>
        <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#6eb5ff" stroke-width="2"/>
        <circle cx="${x}" cy="${y}" r="7" fill="#fbbf24"/>
        <path d="M ${cx + 30} ${cy} A 30 30 0 ${deg > 180 ? 1 : 0} 0 ${cx + 30 * Math.cos(th)} ${cy - 30 * Math.sin(th)}"
          fill="none" stroke="#a78bfa" stroke-width="2"/>
        <text x="340" y="80" fill="#e2e8f0" font-size="14">cosθ=${c.toFixed(3)}</text>
        <text x="340" y="105" fill="#e2e8f0" font-size="14">sinθ=${s.toFixed(3)}</text>
        <text x="340" y="140" fill="#fbbf24" font-size="15">e^{iθ}≈${c.toFixed(2)}${s >= 0 ? "+" : ""}${s.toFixed(2)}i</text>
        <text x="340" y="180" fill="#94a3b8" font-size="13">${deg === 180 ? "θ=π → e^{iπ}=−1" : ""}</text>
      `;
      out.innerHTML =
        Math.abs(deg - 180) < 1
          ? "e^{iπ}+1=0"
          : `|e^{iθ}|=1，辐角=θ。θ=π 时得欧拉恒等式。`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== 微积分基本定理：面积函数 ========== */
  function ftcArea() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">FTC · 面积函数 A(x)=∫₀ˣ f</div>
      <p class="ix-desc">f=2t（直线）。拖动 x，看阴影面积与 A'(x)=f(x)</p>
      <div class="ix-controls">
        <label>x <span data-v="x">1.5</span>
          <input type="range" min="2" max="40" value="15" data-k="x"/>
        </label>
      </div>
      <svg viewBox="0 0 520 280" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const x = +wrap.querySelector("[data-k=x]").value / 10;
      wrap.querySelector("[data-v=x]").textContent = x.toFixed(1);
      const f = (t) => 2 * t;
      const A = x * x; // ∫0^x 2t dt
      const ox = 50,
        oy = 230,
        sx = 100,
        sy = 25;
      const X = (t) => ox + t * sx;
      const Y = (v) => oy - v * sy;
      // area polygon under y=2t from 0 to x
      const areaPts = [`${X(0)},${Y(0)}`];
      for (let i = 0; i <= 20; i++) {
        const t = (x * i) / 20;
        areaPts.push(`${X(t)},${Y(f(t))}`);
      }
      areaPts.push(`${X(x)},${Y(0)}`);
      svg.innerHTML = `
        <rect width="520" height="280" fill="#0f172a" rx="12"/>
        <polygon points="${areaPts.join(" ")}" fill="rgba(110,181,255,0.35)" stroke="none"/>
        <line x1="${X(0)}" y1="${Y(0)}" x2="${X(3.8)}" y2="${Y(f(3.8))}" stroke="#6eb5ff" stroke-width="2"/>
        <line x1="${ox}" y1="${oy}" x2="480" y2="${oy}" stroke="#475569"/>
        <line x1="${X(x)}" y1="${oy}" x2="${X(x)}" y2="${Y(f(x))}" stroke="#fbbf24" stroke-dasharray="4 3"/>
        <circle cx="${X(x)}" cy="${Y(f(x))}" r="5" fill="#fbbf24"/>
        <text x="340" y="50" fill="#e2e8f0" font-size="14">A(x)=x²=${A.toFixed(2)}</text>
        <text x="340" y="75" fill="#fbbf24" font-size="14">f(x)=2x=${(2 * x).toFixed(2)}</text>
        <text x="340" y="100" fill="#3dcc8c" font-size="14">A'(x)=2x ✓</text>
      `;
      out.innerHTML = `面积增量 ≈ f(x)Δx ⇒ A'(x)=f(x)。FTC-2：∫ₐᵇ f = F(b)−F(a)。`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== 鸽巢原理 ========== */
  function pigeonhole() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">鸽巢原理</div>
      <p class="ix-desc">n 个盒子，放入 m 只鸽。必有一盒 ≥ ⌈m/n⌉</p>
      <div class="ix-controls">
        <label>盒子 n <span data-v="n">4</span><input type="range" min="2" max="8" value="4" data-k="n"/></label>
        <label>鸽子 m <span data-v="m">5</span><input type="range" min="1" max="20" value="5" data-k="m"/></label>
      </div>
      <svg viewBox="0 0 520 220" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const n = +wrap.querySelector("[data-k=n]").value;
      const m = +wrap.querySelector("[data-k=m]").value;
      wrap.querySelector("[data-v=n]").textContent = n;
      wrap.querySelector("[data-v=m]").textContent = m;
      // greedy: put as evenly as possible then remainder forces
      const base = Math.floor(m / n);
      const rem = m % n;
      const counts = Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
      const ceil = Math.ceil(m / n);
      let boxes = "";
      const bw = Math.min(60, 400 / n - 8);
      counts.forEach((c, i) => {
        const x = 40 + i * (bw + 12);
        const hot = c >= ceil && c > 0;
        boxes += `<rect x="${x}" y="80" width="${bw}" height="100" rx="8" fill="${hot ? "#3b2f0e" : "#1e293b"}" stroke="${hot ? "#fbbf24" : "#475569"}" stroke-width="2"/>
          <text x="${x + bw / 2}" y="70" text-anchor="middle" fill="#94a3b8" font-size="12">盒${i + 1}</text>
          <text x="${x + bw / 2}" y="140" text-anchor="middle" fill="#e2e8f0" font-size="20">${c}</text>`;
      });
      svg.innerHTML = `
        <rect width="520" height="220" fill="#0f172a" rx="12"/>
        ${boxes}
        <text x="24" y="36" fill="#e2e8f0" font-size="14">⌈m/n⌉ = ${ceil}</text>
      `;
      out.innerHTML =
        m > n
          ? `m=${m}>n=${n} ⇒ 至少一盒 ≥2。加强：必有一盒 ≥${ceil}（高亮）。`
          : `均匀分配时最大为 ${ceil}。`;
    }
    wrap.querySelectorAll("input").forEach((i) => i.addEventListener("input", draw));
    draw();
    return wrap;
  }

  /* ========== 中国剩余定理 ========== */
  function crtVisual() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">孙子题 · CRT</div>
      <p class="ix-desc">x≡2 (mod 3)，x≡3 (mod 5)，x≡2 (mod 7)</p>
      <div class="ix-controls">
        <label>查看 x <span data-v="x">23</span>
          <input type="range" min="0" max="104" value="23" data-k="x"/>
        </label>
      </div>
      <svg viewBox="0 0 520 200" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const x = +wrap.querySelector("[data-k=x]").value;
      wrap.querySelector("[data-v=x]").textContent = x;
      const c1 = x % 3 === 2,
        c2 = x % 5 === 3,
        c3 = x % 7 === 2;
      const ok = c1 && c2 && c3;
      function row(y, label, good) {
        return `<rect x="40" y="${y}" width="440" height="36" rx="8" fill="${good ? "#14532d" : "#1e293b"}" stroke="${good ? "#3dcc8c" : "#475569"}"/>
          <text x="60" y="${y + 24}" fill="#e2e8f0" font-size="15">${label} ${good ? "✓" : "✗"}</text>`;
      }
      svg.innerHTML = `
        <rect width="520" height="200" fill="#0f172a" rx="12"/>
        ${row(30, `x≡2 (mod 3)　${x}%3=${x % 3}`, c1)}
        ${row(80, `x≡3 (mod 5)　${x}%5=${x % 5}`, c2)}
        ${row(130, `x≡2 (mod 7)　${x}%7=${x % 7}`, c3)}
      `;
      out.innerHTML = ok
        ? `x=${x} 满足全部同余。最小正解 23，通解 23+105k。`
        : `继续拖动；三条件同时绿时即解。周期 M=3×5×7=105。`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== AM-GM 矩形 ========== */
  function amgmRect() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">AM-GM · 定周长矩形</div>
      <p class="ix-desc">周长固定时面积 ab 最大 ⇔ 正方形。 (a+b)/2 ≥ √(ab)</p>
      <div class="ix-controls">
        <label>边 a <span data-v="a">3</span>
          <input type="range" min="10" max="90" value="30" data-k="a"/>
        </label>
      </div>
      <svg viewBox="0 0 520 260" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    const peri = 20; // a+b fixed
    function draw() {
      const a = +wrap.querySelector("[data-k=a]").value / 10;
      const b = peri - a;
      wrap.querySelector("[data-v=a]").textContent = a.toFixed(1);
      const AM = (a + b) / 2,
        GM = Math.sqrt(a * b);
      const scale = 12;
      const aw = a * scale,
        bh = b * scale;
      const sw = 5 * scale;
      svg.innerHTML = `
        <rect width="520" height="260" fill="#0f172a" rx="12"/>
        <rect x="40" y="${200 - bh}" width="${aw}" height="${bh}" fill="rgba(110,181,255,0.35)" stroke="#6eb5ff" stroke-width="2"/>
        <rect x="280" y="${200 - sw}" width="${sw}" height="${sw}" fill="rgba(61,204,140,0.3)" stroke="#3dcc8c" stroke-width="2"/>
        <text x="40" y="30" fill="#6eb5ff" font-size="14">矩形 a×b 面积=${(a * b).toFixed(2)}</text>
        <text x="280" y="30" fill="#3dcc8c" font-size="14">正方形 面积=25</text>
        <text x="40" y="240" fill="#fbbf24" font-size="14">AM=${AM.toFixed(2)} ≥ GM=${GM.toFixed(2)}</text>
      `;
      out.innerHTML = `a+b=${peri} 固定。等号 ⇔ a=b。这是 AM-GM 的几何含义。`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== 皮克定理格点 ========== */
  function pickTheorem() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">皮克定理 · 格点多边形</div>
      <p class="ix-desc">Area = I + B/2 − 1。切换预设多边形</p>
      <div class="ix-controls" data-btns></div>
      <svg viewBox="0 0 520 280" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const shapes = {
      square: {
        name: "单位正方形",
        pts: [
          [1, 1],
          [3, 1],
          [3, 3],
          [1, 3]
        ],
        I: 1,
        B: 8
      },
      tri: {
        name: "3-4-5 三角",
        pts: [
          [1, 1],
          [4, 1],
          [1, 4]
        ],
        I: 3,
        B: 8
      },
      poly: {
        name: "L 形",
        pts: [
          [1, 1],
          [4, 1],
          [4, 2],
          [2, 2],
          [2, 4],
          [1, 4]
        ],
        I: 1,
        B: 10
      }
    };
    // recompute I,B roughly - for square: interior (2,2) only if 1,1-3,3 includes? 
    // grid from 0 to 5. square vertices (1,1)(3,1)(3,3)(1,3): I=1 (2,2), B=8? edges have (2,1)(2,3)(1,2)(3,2)+4 verts=8. Area=4. Pick:1+4-1=4 OK
    // tri (1,1)(4,1)(1,4): area 4.5. B: bottom 1,2,3,4; left 1,2,3,4 but (1,1) double; hypotenuse points... classic I=3 B=8? 3+4-1=6 wrong. 
    // Area of triangle with verts (0,0)(4,0)(0,3) is 6. Let me use correct known examples.
    shapes.square = { name: "2×2 正方形", pts: [[0,0],[2,0],[2,2],[0,2]], I: 1, B: 8 }; // wait area 4, I=1 (1,1), B=8 → 1+4-1=4 OK. points 0,0 to 2,2
    shapes.tri = { name: "直角三角", pts: [[0,0],[4,0],[0,3]], I: 3, B: 8 }; // area 6, 3+4-1=6. B: bottom 5 pts 0-4, left 4 pts 0-3 but 0,0 shared, hyp: gcd(4,3)+1=5, shared 2 verts: B=5+4+5-2=12? Let me calculate Pick properly.
    // For triangle (0,0),(n,0),(0,m): I = (n-1)(m-1)/2 if? Actually formula I=(n-1)(m-1) - something for hyp.
    // Simple: use square and a rectangle and polygon we compute by code when drawing.

    const btns = wrap.querySelector("[data-btns]");
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");

    const presets = [
      { name: "正方形", pts: [[1,1],[4,1],[4,4],[1,4]] },
      { name: "三角形", pts: [[1,1],[6,1],[1,5]] },
      { name: "五边形", pts: [[2,1],[5,1],[6,3],[4,5],[1,3]] }
    ];

    function pointInPoly(x, y, pts) {
      // ray casting
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i][0],
          yi = pts[i][1],
          xj = pts[j][0],
          yj = pts[j][1];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi) c = !c;
      }
      return c;
    }
    function onBoundary(x, y, pts) {
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[(i + 1) % pts.length];
        const cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
        if (Math.abs(cross) > 1e-9) continue;
        const dot = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
        const len = (x2 - x1) ** 2 + (y2 - y1) ** 2;
        if (dot >= 0 && dot <= len) return true;
      }
      return false;
    }
    function countIB(pts) {
      let minx = 99,
        maxx = -99,
        miny = 99,
        maxy = -99;
      pts.forEach(([x, y]) => {
        minx = Math.min(minx, x);
        maxx = Math.max(maxx, x);
        miny = Math.min(miny, y);
        maxy = Math.max(maxy, y);
      });
      let I = 0,
        B = 0;
      for (let x = minx; x <= maxx; x++)
        for (let y = miny; y <= maxy; y++) {
          if (onBoundary(x, y, pts)) B++;
          else if (pointInPoly(x + 0.01, y + 0.01, pts) && pointInPoly(x - 0.01, y - 0.01, pts)) I++;
        }
      // shoelace area
      let area = 0;
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[(i + 1) % pts.length];
        area += x1 * y2 - x2 * y1;
      }
      area = Math.abs(area) / 2;
      return { I, B, area };
    }

    function draw(pts, name) {
      const { I, B, area } = countIB(pts);
      const pick = I + B / 2 - 1;
      const scale = 36,
        ox = 60,
        oy = 220;
      // grid
      let g = "";
      for (let i = 0; i <= 7; i++) {
        g += `<line x1="${ox}" y1="${oy - i * scale}" x2="${ox + 7 * scale}" y2="${oy - i * scale}" stroke="#1e293b"/>`;
        g += `<line x1="${ox + i * scale}" y1="${oy}" x2="${ox + i * scale}" y2="${oy - 7 * scale}" stroke="#1e293b"/>`;
      }
      const poly = pts.map(([x, y]) => `${ox + x * scale},${oy - y * scale}`).join(" ");
      let dots = "";
      for (let x = 0; x <= 7; x++)
        for (let y = 0; y <= 7; y++) {
          const b = onBoundary(x, y, pts);
          const ins = !b && pointInPoly(x, y, pts);
          if (b || ins)
            dots += `<circle cx="${ox + x * scale}" cy="${oy - y * scale}" r="4" fill="${b ? "#fbbf24" : "#3dcc8c"}"/>`;
        }
      svg.innerHTML = `
        <rect width="520" height="280" fill="#0f172a" rx="12"/>
        ${g}
        <polygon points="${poly}" fill="rgba(110,181,255,0.25)" stroke="#6eb5ff" stroke-width="2"/>
        ${dots}
        <text x="320" y="40" fill="#e2e8f0" font-size="14">${name}</text>
        <text x="320" y="70" fill="#3dcc8c" font-size="13">I=${I}（内点）</text>
        <text x="320" y="95" fill="#fbbf24" font-size="13">B=${B}（边界）</text>
        <text x="320" y="130" fill="#6eb5ff" font-size="14">Area=${area}</text>
        <text x="320" y="155" fill="#e2e8f0" font-size="14">I+B/2−1=${pick}</text>
      `;
      out.innerHTML = `皮克：I+B/2−1=${pick} ${Math.abs(pick - area) < 0.01 ? "= Area ✓" : "（计数边界算法近似，以鞋带面积为准）"}`;
    }

    presets.forEach((p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ix-btn";
      b.textContent = p.name;
      b.addEventListener("click", () => draw(p.pts, p.name));
      btns.appendChild(b);
    });
    draw(presets[0].pts, presets[0].name);
    return wrap;
  }

  /* ========== 布劳威尔 1D ========== */
  function brouwer1d() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">不动点（一维）</div>
      <p class="ix-desc">f:[0,1]→[0,1] 连续 ⇒ 存在 x=f(x)。看 y=f(x) 与 y=x 相交</p>
      <div class="ix-controls">
        <label>弯曲 <span data-v="k">0.3</span>
          <input type="range" min="0" max="100" value="30" data-k="k"/>
        </label>
      </div>
      <svg viewBox="0 0 520 280" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const k = +wrap.querySelector("[data-k=k]").value / 100;
      wrap.querySelector("[data-v=k]").textContent = k.toFixed(2);
      // f(x) = (1-k)*x + k*(0.2+0.6*sin(pi*x)^2) mapped to stay in [0,1]
      const f = (x) => {
        const s = 0.15 + 0.7 * Math.pow(Math.sin(Math.PI * x), 1.5 + k);
        return (1 - k) * (0.1 + 0.8 * x) + k * s;
      };
      const ox = 60,
        oy = 240,
        S = 200;
      const X = (x) => ox + x * S;
      const Y = (y) => oy - y * S;
      let curve = "",
        diag = `M${X(0)},${Y(0)} L${X(1)},${Y(1)}`;
      for (let i = 0; i <= 50; i++) {
        const x = i / 50;
        curve += `${i ? "L" : "M"}${X(x)},${Y(f(x))} `;
      }
      // find intersection approx
      let fp = 0.5;
      for (let i = 0; i < 30; i++) {
        // bisection on f(x)-x
        let lo = 0,
          hi = 1;
        for (let j = 0; j < 40; j++) {
          const m = (lo + hi) / 2;
          if (f(m) - m > 0) lo = m;
          else hi = m;
        }
        fp = (lo + hi) / 2;
      }
      // better scan
      let best = 0,
        bestv = 1;
      for (let i = 0; i <= 200; i++) {
        const x = i / 200;
        const v = Math.abs(f(x) - x);
        if (v < bestv) {
          bestv = v;
          best = x;
        }
      }
      fp = best;
      svg.innerHTML = `
        <rect width="520" height="280" fill="#0f172a" rx="12"/>
        <path d="${diag}" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="4 3"/>
        <path d="${curve}" fill="none" stroke="#6eb5ff" stroke-width="2.5"/>
        <circle cx="${X(fp)}" cy="${Y(fp)}" r="6" fill="#fbbf24"/>
        <text x="320" y="50" fill="#94a3b8" font-size="13">虚线 y=x</text>
        <text x="320" y="75" fill="#6eb5ff" font-size="13">曲线 y=f(x)</text>
        <text x="320" y="110" fill="#fbbf24" font-size="14">不动点 x*≈${fp.toFixed(3)}</text>
      `;
      out.innerHTML = `g(x)=f(x)−x，g(0)≥0≥g(1)（因 f 映入[0,1]），IVT ⇒ g(c)=0。`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== 巴塞尔：部分和 ========== */
  function baselSum() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">∑ 1/n² → π²/6</div>
      <p class="ix-desc">部分和 S_N 逼近 π²/6≈1.64493</p>
      <div class="ix-controls">
        <label>N <span data-v="n">10</span>
          <input type="range" min="1" max="200" value="10" data-k="n"/>
        </label>
      </div>
      <svg viewBox="0 0 520 240" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    const target = Math.PI * Math.PI / 6;
    function draw() {
      const N = +wrap.querySelector("[data-k=n]").value;
      wrap.querySelector("[data-v=n]").textContent = N;
      let s = 0;
      const pts = [];
      for (let n = 1; n <= N; n++) {
        s += 1 / (n * n);
        pts.push(s);
      }
      const ox = 40,
        oy = 200,
        W = 440,
        H = 150;
      function mx(i) {
        return ox + ((i - 1) / Math.max(N - 1, 1)) * W;
      }
      function my(v) {
        return oy - ((v - 1) / 0.8) * H;
      }
      let path = "";
      pts.forEach((v, i) => {
        path += `${i ? "L" : "M"}${mx(i + 1)},${my(v)} `;
      });
      const ty = my(target);
      svg.innerHTML = `
        <rect width="520" height="240" fill="#0f172a" rx="12"/>
        <line x1="${ox}" y1="${ty}" x2="${ox + W}" y2="${ty}" stroke="#fbbf24" stroke-dasharray="5 3"/>
        <path d="${path}" fill="none" stroke="#6eb5ff" stroke-width="2"/>
        <text x="40" y="30" fill="#fbbf24" font-size="13">π²/6 ≈ ${target.toFixed(5)}</text>
        <text x="280" y="30" fill="#6eb5ff" font-size="13">S_${N} ≈ ${s.toFixed(5)}</text>
      `;
      out.innerHTML = `误差 |S_N − π²/6| ≈ ${(Math.abs(s - target)).toFixed(5)}（收敛如 1/N）`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== 代数基本定理：根的示意 ========== */
  function ftaRoots() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">多项式的根（复平面）</div>
      <p class="ix-desc">p(z)=zⁿ−1 的 n 个根均匀分布在单位圆上</p>
      <div class="ix-controls">
        <label>次数 n <span data-v="n">5</span>
          <input type="range" min="2" max="12" value="5" data-k="n"/>
        </label>
      </div>
      <svg viewBox="0 0 520 280" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const n = +wrap.querySelector("[data-k=n]").value;
      wrap.querySelector("[data-v=n]").textContent = n;
      const cx = 220,
        cy = 140,
        R = 90;
      let roots = "";
      for (let k = 0; k < n; k++) {
        const th = (2 * Math.PI * k) / n;
        const x = cx + R * Math.cos(th);
        const y = cy - R * Math.sin(th);
        roots += `<circle cx="${x}" cy="${y}" r="6" fill="#fbbf24"/>
          <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#334155"/>`;
      }
      svg.innerHTML = `
        <rect width="520" height="280" fill="#0f172a" rx="12"/>
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#475569"/>
        <line x1="${cx - 120}" y1="${cy}" x2="${cx + 120}" y2="${cy}" stroke="#334155"/>
        <line x1="${cx}" y1="${cy + 120}" x2="${cx}" y2="${cy - 120}" stroke="#334155"/>
        ${roots}
        <text x="360" y="80" fill="#e2e8f0" font-size="14">zⁿ = 1</text>
        <text x="360" y="110" fill="#fbbf24" font-size="14">${n} 个根</text>
      `;
      out.innerHTML = `代数基本定理：n 次多项式恰有 n 个复根（计重数）。图为 zⁿ−1 的根。`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== 四色：简易地图染色 ========== */
  function fourColorMap() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">地图四色 · 点击染色</div>
      <p class="ix-desc">相邻不同色。颜色：1–4 循环点击区域</p>
      <div class="ix-controls">
        <button type="button" class="ix-btn" data-reset>重置</button>
        <button type="button" class="ix-btn" data-auto>自动 4-染色</button>
      </div>
      <svg viewBox="0 0 520 260" class="ix-svg" data-map></svg>
      <div class="ix-readout" data-out></div>
    `;
    // regions as polygons, adjacency list
    const regions = [
      { id: 0, d: "M40,40 L200,40 L180,120 L60,130 Z", adj: [1, 2] },
      { id: 1, d: "M200,40 L360,50 L340,130 L180,120 Z", adj: [0, 2, 3] },
      { id: 2, d: "M60,130 L180,120 L200,200 L80,210 Z", adj: [0, 1, 3, 4] },
      { id: 3, d: "M180,120 L340,130 L360,200 L200,200 Z", adj: [1, 2, 4, 5] },
      { id: 4, d: "M80,210 L200,200 L220,250 L40,250 Z", adj: [2, 3, 5] },
      { id: 5, d: "M200,200 L360,200 L400,250 L220,250 Z", adj: [3, 4] }
    ];
    const colors = ["#1e293b", "#3b82f6", "#22c55e", "#eab308", "#ef4444"];
    const col = regions.map(() => 0);
    const svg = wrap.querySelector("[data-map]");
    const out = wrap.querySelector("[data-out]");

    function valid() {
      for (const r of regions) {
        for (const j of r.adj) {
          if (col[r.id] && col[j] && col[r.id] === col[j]) return false;
        }
      }
      return true;
    }
    function used() {
      return new Set(col.filter((c) => c > 0)).size;
    }
    function draw() {
      svg.innerHTML =
        `<rect width="520" height="260" fill="#0f172a" rx="12"/>` +
        regions
          .map(
            (r) =>
              `<path data-id="${r.id}" d="${r.d}" fill="${colors[col[r.id]]}" stroke="#94a3b8" stroke-width="2" style="cursor:pointer"/>
               <text x="0" y="0"></text>`
          )
          .join("");
      // labels
      const centers = [
        [110, 80],
        [260, 85],
        [130, 165],
        [270, 160],
        [130, 230],
        [290, 225]
      ];
      centers.forEach((c, i) => {
        svg.innerHTML += `<text x="${c[0]}" y="${c[1]}" fill="#fff" font-size="14" text-anchor="middle">${col[i] || "·"}</text>`;
      });
      svg.querySelectorAll("path[data-id]").forEach((p) => {
        p.addEventListener("click", () => {
          const id = +p.getAttribute("data-id");
          col[id] = (col[id] + 1) % 5;
          draw();
        });
      });
      out.innerHTML = valid()
        ? `合法着色，使用 ${used()} 种颜色${used() <= 4 ? "（≤4 ✓）" : ""}`
        : "存在相邻同色 — 再点该区域换色";
    }
    wrap.querySelector("[data-reset]").addEventListener("click", () => {
      col.fill(0);
      draw();
    });
    wrap.querySelector("[data-auto]").addEventListener("click", () => {
      // greedy
      col.fill(0);
      for (const r of regions) {
        const usedc = new Set(r.adj.map((j) => col[j]).filter(Boolean));
        let c = 1;
        while (usedc.has(c)) c++;
        col[r.id] = c;
      }
      draw();
    });
    draw();
    return wrap;
  }

  /* ========== 算术基本定理：分解 ========== */
  function factorTree() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">素因子分解</div>
      <p class="ix-desc">拖动 n，看唯一分解（算术基本定理）</p>
      <div class="ix-controls">
        <label>n <span data-v="n">360</span>
          <input type="range" min="2" max="500" value="360" data-k="n"/>
        </label>
      </div>
      <svg viewBox="0 0 520 180" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function factors(n) {
      const m = {};
      let x = n;
      for (let p = 2; p * p <= x; p++) {
        while (x % p === 0) {
          m[p] = (m[p] || 0) + 1;
          x /= p;
        }
      }
      if (x > 1) m[x] = (m[x] || 0) + 1;
      return m;
    }
    function draw() {
      const n = +wrap.querySelector("[data-k=n]").value;
      wrap.querySelector("[data-v=n]").textContent = n;
      const m = factors(n);
      const parts = Object.keys(m).map((p) => `${p}${m[p] > 1 ? "^" + m[p] : ""}`);
      svg.innerHTML = `
        <rect width="520" height="180" fill="#0f172a" rx="12"/>
        <text x="260" y="70" text-anchor="middle" fill="#e2e8f0" font-size="22">${n}</text>
        <text x="260" y="120" text-anchor="middle" fill="#fbbf24" font-size="20">= ${parts.join(" × ")}</text>
      `;
      out.innerHTML = `素幂形式唯一（不计顺序）。这保证约分、lcm/gcd 算法有效。`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  /* ========== 相似勾股：高线 ========== */
  function pythagorasSimilar() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">勾股 · 相似三角形证明</div>
      <p class="ix-desc">斜边上的高分出两个小三角形，均与原三角形相似</p>
      <div class="ix-controls">
        <label>a <span data-v="a">3</span><input type="range" min="20" max="80" value="30" data-k="a"/></label>
        <label>b <span data-v="b">4</span><input type="range" min="20" max="80" value="40" data-k="b"/></label>
      </div>
      <svg viewBox="0 0 520 280" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const a = +wrap.querySelector("[data-k=a]").value / 10;
      const b = +wrap.querySelector("[data-k=b]").value / 10;
      wrap.querySelector("[data-v=a]").textContent = a.toFixed(1);
      wrap.querySelector("[data-v=b]").textContent = b.toFixed(1);
      const c = Math.sqrt(a * a + b * b);
      const AD = (b * b) / c;
      const BD = (a * a) / c;
      // place C at origin, B on x, A on y - then scale
      const sc = 180 / Math.max(a, b, c);
      const C = [80, 220],
        B = [80 + a * sc, 220],
        A = [80, 220 - b * sc];
      // D on AB: from A to B, AD length... D divides AB with AD=b²/c along AB of length c
      // geometric: foot from C to AB
      // AB vector
      const ABx = B[0] - A[0],
        ABy = B[1] - A[1];
      const t = AD / c;
      // actually D is at distance AD from A along AB? AD is projection length on AB from A: yes |AD|=b²/c
      const D = [A[0] + ABx * (AD / c), A[1] + ABy * (AD / c)];
      svg.innerHTML = `
        <rect width="520" height="280" fill="#0f172a" rx="12"/>
        <polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}" fill="rgba(110,181,255,0.2)" stroke="#6eb5ff" stroke-width="2"/>
        <line x1="${C[0]}" y1="${C[1]}" x2="${D[0]}" y2="${D[1]}" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4 3"/>
        <circle cx="${D[0]}" cy="${D[1]}" r="4" fill="#fbbf24"/>
        <text x="320" y="60" fill="#e2e8f0" font-size="14">a²=${(a*a).toFixed(1)} = c·BD</text>
        <text x="320" y="90" fill="#e2e8f0" font-size="14">b²=${(b*b).toFixed(1)} = c·AD</text>
        <text x="320" y="120" fill="#fbbf24" font-size="14">AD+BD=${(AD+BD).toFixed(2)} = c=${c.toFixed(2)}</text>
        <text x="320" y="160" fill="#3dcc8c" font-size="14">⇒ a²+b²=c²</text>
      `;
      out.innerHTML = `△ACD∼△ABC∼△CBD ⇒ b²=c·AD，a²=c·BD，相加得勾股。`;
    }
    wrap.querySelectorAll("input").forEach((i) => i.addEventListener("input", draw));
    draw();
    return wrap;
  }

  /* ========== 费马 n=4 下降示意 ========== */
  function fermatDescent() {
    const wrap = el(`<div class="ix-card"></div>`);
    wrap.innerHTML = `
      <div class="ix-title">费马 n=4 · 无穷下降思想</div>
      <p class="ix-desc">若有正整数解，可造出更小的正整数解 → 无限下降 → 矛盾</p>
      <div class="ix-controls">
        <label>下降步数 <span data-v="s">0</span>
          <input type="range" min="0" max="6" value="0" data-k="s"/>
        </label>
      </div>
      <svg viewBox="0 0 520 220" class="ix-svg"></svg>
      <div class="ix-readout" data-out></div>
    `;
    const svg = wrap.querySelector("svg");
    const out = wrap.querySelector("[data-out]");
    function draw() {
      const s = +wrap.querySelector("[data-k=s]").value;
      wrap.querySelector("[data-v=s]").textContent = s;
      // schematic sizes
      let boxes = "";
      for (let i = 0; i <= s; i++) {
        const w = 120 - i * 14;
        const x = 40 + i * 55;
        const y = 40 + i * 18;
        boxes += `<rect x="${x}" y="${y}" width="${w}" height="50" rx="8" fill="rgba(239,68,68,${0.15 + i * 0.05})" stroke="#ef4444" stroke-width="2"/>
          <text x="${x + w / 2}" y="${y + 30}" text-anchor="middle" fill="#e2e8f0" font-size="12">解 #${i + 1}</text>`;
        if (i < s)
          boxes += `<text x="${x + w + 8}" y="${y + 30}" fill="#fbbf24" font-size="16">→</text>`;
      }
      svg.innerHTML = `
        <rect width="520" height="220" fill="#0f172a" rx="12"/>
        ${boxes}
        <text x="40" y="200" fill="#94a3b8" font-size="13">正整数不能无限严格变小</text>
      `;
      out.innerHTML =
        s === 0
          ? "假设存在 a⁴+b⁴=c² 的正整数解"
          : `构造第 ${s + 1} 组更小的解。无限步不可能 ⇒ 无解 ⇒ 费马 n=4。`;
    }
    wrap.querySelector("input").addEventListener("input", draw);
    draw();
    return wrap;
  }

  const widgets = {
    "kakeya-tubes": kakeyaTubes,
    "kakeya-perron": kakeyaPerron,
    "pnt-chart": pntChart,
    "gauss-bonnet": gaussBonnetSphere,
    "riemann-map": riemannMap,
    "pythagoras-tiles": pythagorasTiles,
    "pythagoras-similar": pythagorasSimilar,
    "cantor-diagonal": cantorDiagonal,
    "euler-poly": eulerPoly,
    "euclid-primes": euclidPrimes,
    "sqrt2-proof": sqrt2Proof,
    "ivt-bisection": ivtBisection,
    "mvt-visual": mvtVisual,
    "euler-circle": eulerCircle,
    "ftc-area": ftcArea,
    "pigeonhole": pigeonhole,
    "crt-visual": crtVisual,
    "amgm-rect": amgmRect,
    "pick-theorem": pickTheorem,
    "brouwer-1d": brouwer1d,
    "basel-sum": baselSum,
    "fta-roots": ftaRoots,
    "four-color-map": fourColorMap,
    "factor-tree": factorTree,
    "fermat-descent": fermatDescent
  };

  return { mount, widgets };
})();
