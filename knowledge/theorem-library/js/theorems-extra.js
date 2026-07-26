/**
 * 扩展定理：素数定理、高斯–博内、黎曼映射定理
 * 以及为已有定理注入交互图示占位
 */
(function () {
  const T = (window.THEOREMS = window.THEOREMS || []);

  function inject(id, section, widget, where) {
    const th = T.find((t) => t.id === id);
    if (!th || !th.sections[section]) return;
    const marker = `data-widget="${widget}"`;
    if (th.sections[section].includes(marker)) return;
    const html = `<div class="interactive" data-widget="${widget}"></div>`;
    if (where === "prepend") th.sections[section] = html + th.sections[section];
    else th.sections[section] = th.sections[section] + html;
  }

  function injectMany(id, section, widgets, where) {
    (where === "prepend" ? [...widgets].reverse() : widgets).forEach((w) =>
      inject(id, section, w, where)
    );
  }

  function appendProof(id, html) {
    const th = T.find((t) => t.id === id);
    if (!th || !th.sections.proof) return;
    if (th.sections.proof.includes("data-more-detail")) return;
    th.sections.proof += `<div data-more-detail>${html}</div>`;
  }

  /* ----- 交互图示注入 ----- */
  injectMany("kakeya", "proof", ["kakeya-tubes", "kakeya-l2", "kakeya-perron"], "prepend");
  injectMany("pythagoras", "proof", ["pythagoras-tiles", "pythagoras-similar"], "prepend");
  inject("cantor", "proof", "cantor-diagonal", "prepend");
  inject("euler-polyhedron", "statement", "euler-poly", "append");
  inject("euclid-primes", "proof", "euclid-primes", "prepend");
  inject("sqrt2", "proof", "sqrt2-proof", "prepend");
  inject("ivt", "proof", "ivt-bisection", "prepend");
  inject("mvt", "proof", "mvt-visual", "prepend");
  inject("euler-identity", "proof", "euler-circle", "prepend");
  inject("ftc", "proof", "ftc-area", "prepend");
  inject("pigeonhole", "proof", "pigeonhole", "prepend");
  inject("crt", "proof", "crt-visual", "prepend");
  inject("amgm", "proof", "amgm-rect", "prepend");
  inject("pick", "proof", "pick-theorem", "prepend");
  inject("brouwer", "proof", "brouwer-1d", "prepend");
  inject("basel", "proof", "basel-sum", "prepend");
  inject("fta", "proof", "fta-roots", "prepend");
  inject("four-color", "proof", "four-color-map", "prepend");
  inject("fta-arith", "proof", "factor-tree", "prepend");
  inject("fermat", "proof", "fermat-descent", "prepend");
  // pnt / gauss / riemann 已在正文内含 data-widget

  /* ----- 证明加厚：关键步骤图解 ----- */
  appendProof(
    "euclid-primes",
    `
    <h3>证明流程图解</h3>
    <div class="diagram"><svg viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="520" height="160" fill="#0f172a" rx="8"/>
      <rect x="20" y="50" width="90" height="50" rx="8" fill="#1e3a5f" stroke="#6eb5ff"/>
      <text x="65" y="80" text-anchor="middle" fill="#e2e8f0" font-size="12">有限名单</text>
      <text x="125" y="80" fill="#94a3b8" font-size="18">→</text>
      <rect x="150" y="50" width="90" height="50" rx="8" fill="#1e3a5f" stroke="#fbbf24"/>
      <text x="195" y="80" text-anchor="middle" fill="#e2e8f0" font-size="12">N=P+1</text>
      <text x="255" y="80" fill="#94a3b8" font-size="18">→</text>
      <rect x="280" y="50" width="100" height="50" rx="8" fill="#1e3a5f" stroke="#3dcc8c"/>
      <text x="330" y="80" text-anchor="middle" fill="#e2e8f0" font-size="12">素因子 q</text>
      <text x="395" y="80" fill="#94a3b8" font-size="18">→</text>
      <rect x="420" y="50" width="80" height="50" rx="8" fill="#3b1f1f" stroke="#ef4444"/>
      <text x="460" y="80" text-anchor="middle" fill="#e2e8f0" font-size="12">矛盾</text>
      <text x="260" y="140" text-anchor="middle" fill="#94a3b8" font-size="12">q 不在名单中（因 N≡1 mod 每个旧素数）</text>
    </svg></div>
    <ol class="steps">
      <li><strong>定量版：</strong>若前 k 个素数为 p₁…pₖ，则存在素数 ≤ N = p₁…pₖ+1（未必是 N 本身）。</li>
      <li><strong>与「素数空隙」共存：</strong>n!+2,…,n!+n 是长合数串，说明素数可任意稀疏，但仍无限。</li>
    </ol>
    `
  );

  appendProof(
    "sqrt2",
    `
    <h3>奇偶表（核心推理）</h3>
    <div class="diagram"><svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="120" fill="#0f172a"/>
      <text x="24" y="35" fill="#e2e8f0" font-size="14">n 偶 ⇔ n² 偶　｜　n 奇 ⇒ n² 奇</text>
      <text x="24" y="65" fill="#6eb5ff" font-size="14">a²=2b² ⇒ a² 偶 ⇒ a 偶 ⇒ a=2k</text>
      <text x="24" y="95" fill="#fbbf24" font-size="14">⇒ b²=2k² ⇒ b 偶 ⇒ 与既约矛盾</text>
    </svg></div>
    <p>用唯一分解：a² 中 2 的指数为偶，2b² 中为奇，矛盾。可推广到 √m（m 非平方）。</p>
    `
  );

  appendProof(
    "ivt",
    `
    <h3>上确界论证的图示要点</h3>
    <ol class="steps">
      <li>S={x∈[a,b]: f(x)≤0}，c=sup S。</li>
      <li>若 f(c)≥0：连续性 ⇒ 左侧一小段 f≥0，与「c 是上确界」矛盾（左侧应有 S 中的点逼近 c）。</li>
      <li>若 f(c)≤0：右侧一小段 f≤0，c 不是上界。</li>
      <li>故 f(c)=0。上图二分法给出<strong>可计算</strong>的逼近序列，误差 ≤(b−a)/2ⁿ。</li>
    </ol>
    `
  );

  appendProof(
    "mvt",
    `
    <h3>从罗尔到拉格朗日的几何</h3>
    <div class="diagram"><svg viewBox="0 0 480 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="100" fill="#0f172a"/>
      <text x="24" y="40" fill="#e2e8f0" font-size="13">g(x)=f(x)−[割线]，使 g(a)=g(b)=0</text>
      <text x="24" y="70" fill="#fbbf24" font-size="13">罗尔 ⇒ g'(ξ)=0 ⇒ f'(ξ)=割线斜率</text>
    </svg></div>
    <p>上图对 f=x² 可显式看到 ξ 与割线平行。一般 f 只需可导，不必二阶光滑。</p>
    `
  );

  appendProof(
    "ftc",
    `
    <h3>差商夹逼（细节重述）</h3>
    <div class="calc-line" data-latex="f(x)-\\varepsilon \\le [A(x+h)-A(x)]/h \\le f(x)+\\varepsilon （|h| \\text{充分小}）"></div>
    <p>令 h→0 得 A'(x)=f(x)。直观：x 处「长出」的薄条面积 ≈ 高 f(x)×宽 h。</p>
    `
  );

  appendProof(
    "kakeya",
    `
    <h3>二维 L² 估计 · 算式串联</h3>
    <ol class="steps">
      <li>约 1/δ 根 δ-管，每根面积 ≍ δ，故 ∫f = ∑|Tⱼ| ≍ 1。</li>
      <li>∫f² = ∑_{j,k}|Tⱼ∩Tₖ| ≲ ∑_j δ + ∑_{j≠k} δ²/θ_{jk} ≲ log(1/δ)。</li>
      <li>(∫f)² ≤ |⋃|·∫f² ⇒ |⋃| ≳ 1/log(1/δ)。</li>
      <li>若 Minkowski 维数 ≤ s≤2，则 |K_δ|≲δ^{2−s} 比 1/log 更快→0，矛盾。</li>
    </ol>
    <p>上图「两管重叠」对应步骤 2 的几何输入；「滑动三角形」对应零测度构造。</p>
    `
  );

  appendProof(
    "crt",
    `
    <h3>构造公式回顾</h3>
    <div class="calc-line" data-latex="x = \\Sigma a_{i} M_{i} y_{i}， M_{i}=M/m_{i}， M_{i} y_{i} \\equiv 1 (mod m_{i})"></div>
    <p>交互图中拖到 23 时三条件全绿；通解 +105k。不互素时需 a≡b (mod gcd) 才有解。</p>
    `
  );

  appendProof(
    "four-color",
    `
    <h3>与五色证明的关系</h3>
    <p>交互地图可用贪心 4-染色。五色定理有纯手工 Kempe 链证明；四色需「不可避免可约构型」+ 机器检验。平面图必有 deg≤5 顶点（欧拉推论）是两种证明的共同起点。</p>
    `
  );

  appendProof(
    "basel",
    `
    <h3>傅里叶关键代入</h3>
    <div class="calc-line" data-latex="x^{2} = \\pi ^{2}/3 + \\Sigma 4(-1)^{n} cos(nx)/n^{2} \\to x=\\pi \\Rightarrow \\sum 1/n^{2}=\\pi ^{2}/6"></div>
    <p>上图部分和展示收敛速度；完整推导见正文分部积分求 aₙ。</p>
    `
  );

  appendProof(
    "pick",
    `
    <h3>与欧拉公式的接口</h3>
    <p>剖成 T 个基本三角（各面积 1/2）⇒ Area=T/2。结合 3T=2E_int+B 与 V−E+T=1（V=I+B）即得 Area=I+B/2−1。交互图中绿点=内点、黄点=边界点。</p>
    `
  );

  appendProof(
    "amgm",
    `
    <h3>等号条件</h3>
    <p>交互图中 a→b 时矩形趋近正方形、面积最大。严格证明中每步 (√x−√y)²≥0 等号 ⇔ x=y，故全体相等。</p>
    `
  );

  appendProof(
    "brouwer",
    `
    <h3>高维归约到「无回缩」</h3>
    <p>一维即 IVT（上图）。高维：若无不动点，从 f(x) 过 x 射到边界得回缩 r:D→∂D，与拓扑矛盾。纳什均衡用的是集值推广（Kakutani）。</p>
    `
  );

  appendProof(
    "fermat",
    `
    <h3>逻辑链（现代）</h3>
    <div class="diagram"><svg viewBox="0 0 520 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="520" height="80" fill="#0f172a"/>
      <text x="16" y="45" fill="#e2e8f0" font-size="13">费马反例 → 弗雷曲线 → 里贝特（非模）→ 怀尔斯（半稳定⇒模）→ 矛盾</text>
    </svg></div>
    <p>n=4 的无穷下降是初等可完成的部分（上图示意）；一般 n 依赖模形式。</p>
    `
  );

  appendProof(
    "fta-arith",
    `
    <h3>存在性 vs 唯一性</h3>
    <p>存在：强归纳拆合数。唯一：欧几里得引理（p|ab⇒p|a 或 p|b）消因子。交互分解展示「素幂写法」；若无唯一性则约分算法会失效。</p>
    `
  );

  appendProof(
    "euler-identity",
    `
    <h3>与幂级数对齐</h3>
    <p>拖动 θ 观察单位圆。θ=π 时点在 (−1,0)。级数证明：e^{iθ} 的实部/虚部分别拼成 cos/sin 的泰勒级数。</p>
    `
  );

  appendProof(
    "pythagoras",
    `
    <h3>两条证明对照</h3>
    <p><strong>拼图：</strong>面积算两次。(a+b)²=2ab+c²。<strong>相似：</strong>高线 ⇒ b²=c·AD，a²=c·BD。交互图分别对应二者。</p>
    `
  );

  /* =========================================================
   * 素数定理
   * ========================================================= */
  T.push({
    id: "pnt",
    title: "素数定理",
    subtitle: "素数有多密？π(x) ∼ x / ln x",
    emoji: "📊",
    iconClass: "warm",
    difficulty: "hard",
    difficultyLabel: "挑战",
    tags: ["数论", "分析", "渐近"],
    era: "猜想 18–19 世纪；1896 证明",
    oneLiner: "不超过 x 的素数个数 π(x)，当 x→∞ 时与 x/ln x 比值趋于 1。",
    people: [
      { role: "数值观察 / 猜想", name: "高斯、勒让德", years: "约 1792 起" },
      { role: "首次证明", name: "阿达马、德·拉·瓦莱-普桑", years: "1896" },
      { role: "初等证明", name: "塞尔伯格、爱尔特希", years: "1949" }
    ],
    related: ["euclid-primes", "fta-arith", "basel"],
    sections: {
      story: `
        <p>欧几里得只说素数无穷。更锋利的问题是：<strong>前 x 个正整数里大约有多少素数？</strong>记为 π(x)。高斯少年时代就猜 π(x) 大约是 x/ln x。严格证明迟到 1896 年，用了复分析中的 ζ 函数。</p>
        <div class="interactive" data-widget="pnt-chart"></div>
        <div class="fun-box">生活感：x 越大，素数越「稀」，平均每隔约 ln x 才遇到一个——但永远不会断绝。</div>
      `,
      statement: `
        <p><strong>素数定理（PNT）：</strong></p>
        <div class="formula" data-latex="\\pi(x)\\sim\\dfrac{x}{\\ln x}"></div>
        <div class="formula" data-latex="\\lim_{x\\to\\infty}\\pi(x)\\cdot\\dfrac{\\ln x}{x}=1"></div>
        <p>等价形式：第 n 个素数 pₙ ∼ n ln n；ψ(x)∼x（切比雪夫函数）等。</p>
        <div class="diagram" aria-hidden="true">
          <svg viewBox="0 0 480 160" xmlns="http://www.w3.org/2000/svg">
            <rect width="480" height="160" fill="#0f172a" rx="8"/>
            <text x="24" y="36" fill="#e2e8f0" font-size="14">π(x) = # { p 素数 : p ≤ x }</text>
            <text x="24" y="70" fill="#6eb5ff" font-size="14">例：π(10)=4（2,3,5,7）</text>
            <text x="24" y="100" fill="#fbbf24" font-size="14">π(100)=25， 100/ln100≈21.7</text>
            <text x="24" y="130" fill="#94a3b8" font-size="13">比值随 x 增大趋近 1（见上图）</text>
          </svg>
        </div>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">黎曼 ζ 函数（证明需要的角色）</div>
          <div class="calc-line" data-latex="ζ(s) = \\sum_{n=1}^\\infty n^{-s} = \\prod _p (1-p^{-s})^{-1} （Re s \\gt  1）"></div>
          <p>欧拉乘积把 ζ 与素数绑在一起。ζ 可解析延拓到复平面（除 s=1 的极点）。</p>
        </div>
        <div class="def-box">
          <div class="def-title">切比雪夫函数</div>
          <div class="calc-line" data-latex="\\psi (x) = \\sum_{p^k \\le x} ln p"></div>
          <p>PNT ⇔ ψ(x)∼x。ψ 比 π 更适合做分析。</p>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理（ζ 无零点与素数）</div>
          <p>若 ζ 在 Re s=1 的直线上无零点，则可推出 ψ(x)∼x。阿达马与德·拉·瓦莱-普桑正是证明了 ζ(1+it)≠0（t≠0）。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">纽曼 / 维纳–池原 型定理（纲要）</div>
          <p>由 ζ 的解析性质控制 −ζ'/ζ 的狄利克雷级数，再用陶伯型定理把「生成函数行为」翻译成 ψ(x)∼x。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>战略图</span><span>非完整专业证明</span><span>逻辑链闭合说明</span></div>
        <h3>总体战略（1896 分析证明）</h3>
        <ol class="steps">
          <li><strong>编码素数：</strong>对 Re s≥1，
            <div class="calc-line" data-latex="-ζ'(s)/ζ(s) = \\sum_{n\\ge 1} Λ(n) n^{-s}"></div>
            其中 Λ(n)=ln p 当 n=p^k，否则 0。这是 ψ 的「生成函数」。
          </li>
          <li><strong>解析延拓：</strong>ζ 在 s=1 有简单极点，其余在 Re s≥1 无零点（需证）。于是 −ζ'/ζ 在 Re s≥1 上（除 s=1 的极点）性态可控。</li>
          <li><strong>关键困难：</strong>证明 ζ(1+it)≠0。若 ζ(1+it₀)=0，则欧拉乘积/三角不等式会出现与 ζ 在 1 附近极点不相容的抵消（经典 3ζ 不等式：ζ(σ)³|ζ(σ+it)|⁴|ζ(σ+2it)|≥1 类型）。</li>
          <li><strong>陶伯/佩龙：</strong>用复积分（佩龙公式）把 ∑ Λ(n)n^{-s} 变回 ∑_{n≤x} Λ(n)=ψ(x)，主极点 s=1 贡献主项 x，其余积分在左移轮廓后成为误差。</li>
          <li>得 ψ(x)∼x，再由初等变换得 π(x)∼x/ln x。</li>
        </ol>
        <p class="qed">∎（战略完备；ζ 无零与陶伯估计需专书展开）</p>

        <h3>为何「初等证明」也难</h3>
        <p>1949 塞尔伯格–爱尔特希给出不显式使用复变的证明，但仍依赖精巧的对称公式与渐近，并非「高中初等」。</p>
      `,
      deep: `
        <h3>误差项与黎曼假设</h3>
        <p>RH 断言 ζ 的非平凡零点都在 Re s=1/2。若 RH 成立，则
          π(x) = li(x) + O(√x ln x) 一类强误差。PNT 本身弱于 RH。</p>
        <h3>数值</h3>
        <p>π(10³)=168，1000/ln1000≈144.8；π(10⁶)=78498，10⁶/ln(10⁶)≈72382。比值缓慢→1。</p>
        <div class="diagram">
          <svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
            <rect width="480" height="120" fill="#0f172a"/>
            <text x="24" y="40" fill="#e2e8f0" font-size="14">逻辑链：素数 ↔ 欧拉乘积 ↔ ζ ↔ 无零点 ↔ ψ(x)∼x ↔ PNT</text>
            <text x="24" y="75" fill="#94a3b8" font-size="13">把「数数」变成「复分析」是 19 世纪的伟大翻译</text>
          </svg>
        </div>
      `,
      why: `
        <p>密码学大素数尺度、整数分布、随机模型（克拉默模型）都以 PNT 为背景音。</p>
      `,
      try: `
        <ul>
          <li>用上面交互图观察 X=50,100,300 时比值变化。</li>
          <li>验证 π(30)=10，与 30/ln30 比较。</li>
          <li>阅读：为何「素数两两独立」的概率模型会猜出 1/ln x 密度。</li>
        </ul>
      `
    }
  });

  /* =========================================================
   * 高斯–博内
   * ========================================================= */
  T.push({
    id: "gauss-bonnet",
    title: "高斯–博内定理",
    subtitle: "曲率积分 = 拓扑不变量",
    emoji: "🌐",
    iconClass: "purple",
    difficulty: "hard",
    difficultyLabel: "挑战",
    tags: ["微分几何", "拓扑", "曲率"],
    era: "高斯 1827；博内；陈省身推广",
    oneLiner: "曲面上高斯曲率的积分，加上边界测地曲率，等于 2π 乘欧拉示性数。",
    people: [
      { role: "局部/绝妙定理相关", name: "高斯", years: "1827" },
      { role: "全局形式", name: "博内等", years: "19 世纪" },
      { role: "高维示性类", name: "陈省身", years: "1940s" }
    ],
    related: ["euler-polyhedron", "riemann-mapping", "kakeya"],
    sections: {
      story: `
        <p>弯曲表面上，「三角形内角和」不再是 180°。高斯发现曲率是内蕴的；高斯–博内进一步说：把曲率加总，得到的竟是拓扑量——与欧拉的 V−E+F 同类。</p>
        <div class="interactive" data-widget="gauss-bonnet"></div>
      `,
      statement: `
        <p><strong>紧致可定向无边曲面 Σ：</strong></p>
        <div class="formula" data-latex="\\iint_{\\Sigma} K\\,dA = 2\\pi\\,\\chi(\\Sigma)"></div>
        <p>其中 <span data-latex="K">K</span> 为高斯曲率，<span data-latex="\\chi">χ</span> 为欧拉示性数（球面 <span data-latex="\\chi=2">χ=2</span>，环面 <span data-latex="\\chi=0">χ=0</span>）。</p>
        <p><strong>有边界时：</strong></p>
        <div class="formula" data-latex="\\iint_{\\Sigma} K\\,dA + \\int_{\\partial\\Sigma} k_g\\,ds = 2\\pi\\,\\chi(\\Sigma)"></div>
        <p>k_g 为边界的测地曲率。</p>
        <div class="diagram" aria-hidden="true">
          <svg viewBox="0 0 500 180" xmlns="http://www.w3.org/2000/svg">
            <rect width="500" height="180" fill="#0f172a" rx="8"/>
            <ellipse cx="110" cy="90" rx="70" ry="50" fill="none" stroke="#6eb5ff" stroke-width="2"/>
            <text x="110" y="95" text-anchor="middle" fill="#6eb5ff" font-size="12">球面 K≥0</text>
            <text x="110" y="160" text-anchor="middle" fill="#94a3b8" font-size="12">∬K=4π</text>
            <ellipse cx="250" cy="90" rx="80" ry="35" fill="none" stroke="#fbbf24" stroke-width="2"/>
            <ellipse cx="250" cy="90" rx="30" ry="14" fill="#0f172a" stroke="#fbbf24"/>
            <text x="250" y="160" text-anchor="middle" fill="#94a3b8" font-size="12">环面 ∬K=0</text>
            <path d="M 360 120 Q 400 40 440 120 Q 400 100 360 120" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" stroke-width="2"/>
            <text x="400" y="160" text-anchor="middle" fill="#94a3b8" font-size="12">角盈=∬K</text>
          </svg>
        </div>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">高斯曲率 K</div>
          <p>主曲率乘积。球面半径 R：K=1/R²。平面 K=0。马鞍点 K≤0。</p>
        </div>
        <div class="def-box">
          <div class="def-title">欧拉示性数</div>
          <p>对三角剖分 χ=V−E+F；同胚不变。球面 2，环面 0，双环面 −2。</p>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理（球面三角）</div>
          <p>单位球上以大圆弧为边的三角形，面积 = 角盈 A+B+C−π。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">绝妙定理（Gauss Theorema Egregium）</div>
          <p>K 只依赖于第一基本形式（内蕴度量），与嵌入方式无关——纸不能无皱铺到球上。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>局部角盈</span><span>拼起来</span><span>边界项</span></div>
        <h3>教学证明纲要（光滑闭曲面）</h3>
        <ol class="steps">
          <li><strong>剖分：</strong>把 Σ 分成许多测地三角形（边为测地线），足够细。</li>
          <li><strong>每个三角形：</strong>在曲面几何中有高斯–博内局部式：
            <div class="calc-line" data-latex="\\iint_{\\Delta } K dA + \\text{边界测地曲率贡献} + \\text{顶点外角} = 2\\pi"></div>
            对测地三角形，边的 k_g=0，化为：∬_Δ K + (π − 内角和的补) 形式 → 角盈 = ∬_Δ K。
          </li>
          <li><strong>求和：</strong>∑ ∬_Δ K = ∬_Σ K。角盈总和用组合方式计数：每个顶点处内角和为 2π（光滑点），最终只剩下拓扑贡献 2π χ。</li>
          <li>更组合的路径：对多面体（K 集中在顶点，像角盈的离散版）验证 ∑ 角亏 = 2π χ，再取细密多面体逼近光滑曲面。</li>
          <li>得 ∬ K dA = 2π χ(Σ)。</li>
        </ol>
        <p class="qed">∎（纲要）</p>
        <h3>多面体离散版（可验算）</h3>
        <ol class="steps">
          <li>在顶点 v，角亏 δ_v = 2π − （会聚面角之和）。</li>
          <li>笛卡尔：∑_v δ_v = 2π χ。对立方体：8 个顶点各角亏 π/2，总和 4π = 2π·2。</li>
          <li>这是高斯–博内的「曲率原子」版本：光滑时角亏弥散成 K dA。</li>
        </ol>
      `,
      deep: `
        <h3>环面为什么平均曲率「正负抵消」</h3>
        <p>环面外侧 K≥0，内侧洞口附近 K≤0，积分恰为 0，与 χ=0 一致——你不能处处正曲率地实现环面。</p>
        <h3>陈省身</h3>
        <p>把示性类与曲率形式联系起来，高维高斯–博内成为整体微分几何的支柱。</p>
      `,
      why: `
        <p>广义相对论中曲率编码引力；材料科学中缺陷与拓扑荷；纯数学中连接分析与拓扑。</p>
      `,
      try: `
        <ul>
          <li>立方体、正四面体算 ∑ 角亏，核对 2πχ。</li>
          <li>用交互图感受球面角盈与面积同步增大。</li>
          <li>解释：为何地球上的「大三角」内角和大于 180°。</li>
        </ul>
      `
    }
  });

  /* =========================================================
   * 黎曼映射
   * ========================================================= */
  T.push({
    id: "riemann-mapping",
    title: "黎曼映射定理",
    subtitle: "单连通区域共形等价于单位圆盘",
    emoji: "🔮",
    iconClass: "",
    difficulty: "hard",
    difficultyLabel: "挑战",
    tags: ["复分析", "共形", "黎曼"],
    era: "1851 黎曼；卡拉西奥多里等严格化",
    oneLiner: "平面上不是全平面的单连通开集，都全纯双射到单位圆盘（可规范化到唯一）。",
    people: [
      { role: "提出并论证", name: "波恩哈德·黎曼", years: "1851 博士论文" },
      { role: "严格存在性", name: "卡拉西奥多里、柯西等后人", years: "20 世纪初完善" }
    ],
    related: ["gauss-bonnet", "fta", "euler-identity"],
    sections: {
      story: `
        <p>复分析最惊人的刚性与柔性并存：全纯函数极度刚性（一点决定全局），但区域形状又极度柔性——只要单连通、不是整个平面，就能<strong>保角地</strong>变成最标准的单位圆盘。</p>
        <div class="interactive" data-widget="riemann-map"></div>
      `,
      statement: `
        <p><strong>黎曼映射定理：</strong>设 Ω⊂ℂ 为单连通开集，且 Ω≠ℂ。则存在全纯双射 f: Ω → 𝔻（单位圆盘）。</p>
        <p><strong>唯一性：</strong>若再指定 z₀∈Ω，要求 f(z₀)=0 且 f'(z₀)≥0（正实数），则 f 唯一。</p>
        <div class="diagram">
          <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <rect width="500" height="150" fill="#0f172a" rx="8"/>
            <path d="M40,90 Q70,30 110,70 Q150,120 180,80 Q200,50 220,90 L200,120 Q120,140 40,110 Z"
              fill="rgba(110,181,255,0.3)" stroke="#6eb5ff"/>
            <text x="120" y="30" fill="#6eb5ff" font-size="12" text-anchor="middle">Ω</text>
            <path d="M250,75 L310,75" stroke="#94a3b8" stroke-width="2"/>
            <circle cx="400" cy="75" r="45" fill="rgba(61,204,140,0.25)" stroke="#3dcc8c" stroke-width="2"/>
            <text x="400" y="80" text-anchor="middle" fill="#3dcc8c" font-size="14">𝔻</text>
          </svg>
        </div>
        <div class="warn-box">全平面 ℂ 不能全纯双射到 𝔻（刘维尔：有界整函数为常；或两端可去/本性的分类）。</div>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">共形 / 全纯双射</div>
          <p>f 全纯且 f'≠0 时局部保角。双射 + 全纯 ⇒ 逆也全纯（复分析定理）。</p>
        </div>
        <div class="def-box">
          <div class="def-title">正规族</div>
          <p>全纯函数族若局部一致有界，则有局部一致收敛子列（蒙泰尔）。用于抽取极限映射。</p>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">施瓦茨引理</div>
          <p>f:𝔻→𝔻 全纯，f(0)=0 ⇒ |f(z)|≤|z|，|f'(0)|≤1；等号则旋转。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">黎曼可去 / 双全纯开映射</div>
          <p>非常数全纯映射为开映射；单叶全纯的逆全纯。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>函数族</span><span>极值</span><span>证明是满射</span></div>
        <h3>现代存在性证明纲要（卡拉西奥多里–克贝路线）</h3>
        <ol class="steps">
          <li><strong>化简：</strong>因 Ω≠ℂ，存在 a∉Ω。通过平移与开方/平方根分支等（利用单连通可选分支），可构造单叶全纯映射把 Ω 映入 𝔻，且某点 z₀ 映到 0 附近。即：函数族
            <div class="calc-line" data-latex="ℱ = { f: Ω\\to \\mathbb{D} \\text{全纯单叶} : f(z_{0})=0, f'(z_{0})\\gt 0 }"></div>
            非空。
          </li>
          <li><strong>取极值：</strong>在 ℱ 中最大化 f'(z₀)（或等价地用蒙泰尔正规族取极限）。得 f∈ℱ 使 f'(z₀) 最大。</li>
          <li><strong>f 必满射到 𝔻：</strong>反设漏掉某 α∈𝔻。用布拉施克因子与开方构造
            一个「把 α 挖掉后的圆盘」映回 𝔻 的函数，与 f 复合，得到 g∈ℱ 且 g'(z₀)≥f'(z₀)，矛盾。
            <ul class="substeps">
              <li>这一步是证明的几何核心：若像集不是整个圆盘，就能「再撑大一点」导数。</li>
            </ul>
          </li>
          <li><strong>唯一性：</strong>若 f,g 都满足规范化，则 φ = f ∘ g^{-1}: 𝔻→𝔻 是自同构且 φ(0)=0, φ'(0)≥0，由施瓦茨知 φ=id。</li>
        </ol>
        <p class="qed">∎（纲要；单连通用于开方分支与单叶性构造）</p>
      `,
      deep: `
        <h3>边界对应</h3>
        <p>若 ∂Ω 足够好（若尔当曲线），则 f 可连续延拓到边界的同胚（卡拉西奥多里定理）。</p>
        <h3>计算现实</h3>
        <p>显式 f 只对特殊区域可写（半平面、多边形的施瓦茨–克里斯托费尔）。一般靠数值共形映射。</p>
        <h3>与物理学</h3>
        <p>二维静电、流体、热平衡中的势线/场线正交网，正是共形网的物理版。</p>
      `,
      why: `
        <p>复分析「标准化」工具；泰希米勒理论、共形焊、计算机图形中的参数化都有其影子。</p>
      `,
      try: `
        <ul>
          <li>上半平面 → 𝔻 的显式映射：凯莱变换 (z−i)/(z+i)。</li>
          <li>用交互图感受「怪异区域」被抚成圆盘。</li>
          <li>说明：为何环（有洞）不能共形等价于圆盘？（不是单连通 / 共形不变量）</li>
        </ul>
      `
    }
  });

  /* 相关链接补丁 */
  const patchRelated = {
    "euclid-primes": "pnt",
    "euler-polyhedron": "gauss-bonnet",
    "euler-identity": "riemann-mapping",
    kakeya: "gauss-bonnet"
  };
  Object.keys(patchRelated).forEach((id) => {
    const th = T.find((t) => t.id === id);
    if (th && !th.related.includes(patchRelated[id])) th.related.push(patchRelated[id]);
  });
})();
