/**
 * 全站公式补丁：把各定理「陈述/预备/引理/证明」里的关键式子改成 data-latex
 * 主旋律仍是大白话；符号一律 KaTeX
 */
(function () {
  const T = window.THEOREMS;
  if (!T) return;

  function F(latex) {
    return `<div class="formula" data-latex="${latex}"></div>`;
  }
  function C(latex) {
    return `<div class="calc-line" data-latex="${latex}"></div>`;
  }
  function M(latex, fallback) {
    return `<span data-latex="${latex}">${fallback || ""}</span>`;
  }

  const PATCH = {
    /* ---------- 哥德尔（截图页） ---------- */
    godel: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>足够强又一致的数学系统里，总有「真，但系统内证不出来」的句子；系统也不能自己证明自己没矛盾。</p>
        <p><strong>第一不完备定理（人话）：</strong>系统够强、没自相矛盾时，一定存在一句「真话」G，但系统既推不出 G，也推不出「非 G」。</p>
        ${F("T\\nvdash G\\quad\\text{且}\\quad T\\nvdash \\neg G")}
        <p>在标准自然数模型里，G 其实是真的。</p>
        <p><strong>第二不完备定理（人话）：</strong>这样的系统无法在内部证明「我自己是一致的」。</p>
        ${F("T\\nvdash \\mathrm{Con}(T)")}
        <p>其中 ${M("\\mathrm{Con}(T)", "Con(T)")} 表示「T 一致」这句话的形式化。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">哥德尔编码（在干什么）</div>
          <p>把符号、公式、证明步骤都编成自然数，于是「证明」变成数论关系，系统可以「谈论自己」。</p>
          <p>谓词 ${M("\\mathrm{Proof}_T(y,x)", "Proof_T(y,x)")}：读作「y 是语句 x 的一个 T-证明」。</p>
          ${C("\\mathrm{Provable}_T(x)\\ :=\\ \\exists y\\,\\mathrm{Proof}_T(y,x)")}
          <p>即：存在某个证明码 y，使得 y 证明了 x。</p>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="def-title">对角线引理（不动点引理）</div>
          <p>对任意公式 ${M("\\varphi(x)", "φ(x)")}，都能找到一句话 ${M("\\psi", "ψ")}，使得系统可证：</p>
          ${F("T\\vdash \\psi \\leftrightarrow \\varphi(\\ulcorner\\psi\\urcorner)")}
          <p>其中 ${M("\\ulcorner\\psi\\urcorner", "⌜ψ⌝")} 是 ψ 的哥德尔数（编码）。直觉：ψ 在说「关于我自己的编码，有性质 φ」。</p>
        </div>
      `,
      proof: `
        <p class="plain-lead" data-plain-lead><strong>人话版：</strong>造一句「这句话不可证」；若系统靠谱，它就真，但系统说不出口。</p>
        <div class="proof-nav"><span>构造 G</span><span>不可证</span><span>真理性</span><span>第二定理</span></div>
        <h3>第一定理（纲要）</h3>
        <ol class="steps">
          <li>对 ${M("\\varphi(x)=\\neg\\mathrm{Provable}_T(x)", "φ(x)=¬Provable_T(x)")} 用对角线引理，得到 G 满足
            ${C("T\\vdash G \\leftrightarrow \\neg\\mathrm{Provable}_T(\\ulcorner G\\urcorner)")}
            即 G 说：「G 不可证。」
          </li>
          <li><strong>不能有</strong> ${M("T\\vdash G", "T ⊢ G")}：若有，则 G 可证，与 G 的含义矛盾（在一致系统中）。
            ${C("T\\vdash G \\ \\Rightarrow\\ T\\text{ 不一致}")}
          </li>
          <li><strong>也不能有</strong> ${M("T\\vdash\\neg G", "T ⊢ ¬G")}（在合适的一致性假设下）。罗瑟改进可减弱假设。</li>
          <li>因此 ${M("T\\nvdash G", "T ⊬ G")}，于是「G 不可证」为真，而 G 正说这件事 → G 为真。</li>
        </ol>
        <h3>第二定理（纲要）</h3>
        <ol class="steps">
          <li>可形式化得到：${C("T\\vdash \\mathrm{Con}(T)\\rightarrow G")}</li>
          <li>若 ${M("T\\vdash\\mathrm{Con}(T)", "T ⊢ Con(T)")}，则 ${M("T\\vdash G", "T ⊢ G")}，与第一定理矛盾。</li>
          <li>故 ${C("T\\nvdash \\mathrm{Con}(T)")}</li>
        </ol>
        <p class="qed">∎</p>
      `
    },

    /* ---------- 挂谷 ---------- */
    kakeya: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>每个方向都放一根「针」，集合可以薄到面积为 0，但不能薄到「维数」也塌掉。</p>
        <div class="def-box">
          <div class="def-title">定义：挂谷集 / 贝西科维奇集</div>
          <p>集合 ${M("K\\subset\\mathbb{R}^n", "K ⊂ ℝⁿ")} 叫挂谷集，意思是：每个方向都有一根长为 1 的针躺在里面。</p>
          ${F("\\forall\\,\\omega\\in S^{n-1},\\;\\exists\\,x\\in\\mathbb{R}^n:\\quad\\{x+t\\omega:0\\le t\\le 1\\}\\subset K")}
        </div>
        <p><strong>贝西科维奇（平面）：</strong>存在平面挂谷集，面积可以是 0。</p>
        ${F("\\exists\\,K\\subset\\mathbb{R}^2:\\ K\\text{ 是挂谷集且 }|K|=0")}
        <p><strong>挂谷集猜想：</strong>挂谷集的维数必须等于空间维数。</p>
        ${F("K\\text{ 是挂谷集 }\\;\\Rightarrow\\;\\dim_H K=n")}
        <p><strong>已证：</strong>${M("n=1", "n=1")} 平凡；${M("n=2", "n=2")} 上世纪 70 年代；${M("n=3", "n=3")} 约 2025 年。更高维仍部分开放。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">细管语言</div>
          <p>把方向 ${M("\\omega", "ω")} 上的单位线段加粗成宽度 ${M("\\delta", "δ")} 的细管 ${M("T_\\omega", "T_ω")}。</p>
          ${F("\\text{关心：}\\quad\\Bigl|\\bigcup_\\omega T_\\omega\\Bigr|\\ \\text{随 }\\delta\\to 0\\text{ 如何变小}")}
          <p>若体积大约像 ${M("\\delta^{n-d}", "δ^{n-d}")}，就对应「维数约 d」。</p>
        </div>
        <div class="def-box">
          <div class="def-title">Hausdorff 维数（直觉）</div>
          <p>用边长约 ${M("\\varepsilon", "ε")} 的小球去盖集合，大约要 ${M("N(\\varepsilon)", "N(ε)")} 个。看代价 ${M("N(\\varepsilon)\\,\\varepsilon^{s}", "N(ε)·ε^s")} 在 ${M("\\varepsilon\\to 0", "ε→0")} 时是否仍可有限——临界 ${M("s", "s")} 即维数。</p>
          ${F("\\text{曲线 }s=1,\\quad\\text{面片 }s=2,\\quad\\text{康托集可取中间值}")}
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理 A（二维管重叠）</div>
          <p>两根长 1、宽 ${M("\\delta", "δ")}、夹角 ${M("\\theta", "θ")} 的细管，重叠大约：</p>
          ${F("|T_1\\cap T_2|\\lesssim\\dfrac{\\delta^2}{\\sin\\theta}")}
        </div>
        <div class="lemma-box">
          <div class="lemma-title">引理 B（L² 思想）</div>
          ${F("f=\\sum_i 1_{T_i},\\qquad \\int f^2=\\sum_{i,j}|T_i\\cap T_j|")}
          <p>再配合柯西不等式，推出并集不能太小。</p>
        </div>
      `
    },

    /* ---------- 勾股 ---------- */
    pythagoras: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>直角三角形两直角边各自平方，加起来等于斜边的平方。</p>
        <p>直角在 C，直角边 ${M("a,b", "a,b")}，斜边 ${M("c", "c")}：</p>
        ${F("a^2+b^2=c^2")}
        <p><strong>逆定理：</strong>若三边满足上式，则 c 的对角是直角。</p>
      `
    },

    /* ---------- 素数无穷 ---------- */
    "euclid-primes": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>质数永远数不完，没有「最后一个质数」。</p>
        ${F("\\text{素数集合是无限集}")}
        <p>等价说法：对任意正整数 ${M("N", "N")}，都存在素数 ${M("p>N", "p>N")}。</p>
      `
    },

    /* ---------- 算术基本定理 ---------- */
    "fta-arith": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>大于 1 的整数都能拆成质数相乘，且拆法本质上唯一。</p>
        ${F("n=p_1^{a_1}p_2^{a_2}\\cdots p_k^{a_k}")}
        <p>（${M("p_i", "p_i")} 为素数，${M("a_i\\ge 1", "a_i≥1")}；不计顺序唯一。）</p>
      `
    },

    /* ---------- √2 ---------- */
    sqrt2: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>√2 写不成两个整数之比。</p>
        ${F("\\sqrt{2}\\notin\\mathbb{Q}")}
        <p>即：不存在整数 ${M("a,b", "a,b")}（${M("b\\ne 0", "b≠0")}）使 ${M("(a/b)^2=2", "(a/b)²=2")}。</p>
      `
    },

    /* ---------- 欧拉多面体 ---------- */
    "euler-polyhedron": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>凸多面体顶点数减棱数加面数，永远等于 2。</p>
        ${F("V-E+F=2")}
        <p>${M("V", "V")} 顶点，${M("E", "E")} 棱，${M("F", "F")} 面（含底面）。</p>
      `
    },

    /* ---------- FTC ---------- */
    ftc: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>「此刻有多快」和「一共走了多远」是一对反操作。</p>
        <p>设 ${M("f", "f")} 在 ${M("[a,b]", "[a,b]")} 上连续。定义</p>
        ${F("A(x)=\\int_a^x f(t)\\,dt")}
        <p><strong>FTC-1：</strong></p>
        ${F("A'(x)=f(x)")}
        <p><strong>FTC-2：</strong>若 ${M("F'=f", "F'=f")}，则</p>
        ${F("\\int_a^b f(x)\\,dx=F(b)-F(a)")}
      `
    },

    /* ---------- IVT ---------- */
    ivt: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>连续曲线从负走到正，中途必经过 0。</p>
        ${F("f\\text{ 连续},\\ f(a)<0<f(b)\\ \\Rightarrow\\ \\exists c\\in(a,b):\\ f(c)=0")}
        <p>更一般：连续函数取到两端之间的一切中间值。</p>
      `
    },

    /* ---------- MVT ---------- */
    mvt: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>平均速度若是 80，过程中至少有一瞬速度表也指 80。</p>
        <p><strong>罗尔：</strong>${M("f(a)=f(b)", "f(a)=f(b)")} 时，中间有水平切线。</p>
        ${F("\\exists\\xi\\in(a,b):\\ f'(\\xi)=0")}
        <p><strong>拉格朗日中值定理：</strong></p>
        ${F("f'(\\xi)=\\dfrac{f(b)-f(a)}{b-a}")}
      `
    },

    /* ---------- 欧拉恒等式 ---------- */
    "euler-identity": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>e、i、π、1、0 被一个式子拴在一起。</p>
        ${F("e^{i\\theta}=\\cos\\theta+i\\sin\\theta")}
        <p>令 ${M("\\theta=\\pi", "θ=π")}：</p>
        ${F("e^{i\\pi}+1=0")}
      `
    },

    /* ---------- 康托 ---------- */
    cantor: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>自然数能排队，0 到 1 的实数排不完。</p>
        ${F("(0,1)\\text{ 不可数}\\quad\\Rightarrow\\quad\\mathbb{R}\\text{ 不可数}")}
        <p>即：不存在从 ${M("\\mathbb{N}", "ℕ")} 到 ${M("(0,1)", "(0,1)")} 的一一对应。</p>
      `
    },

    /* ---------- 四色 ---------- */
    "four-color": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>平面地图相邻不同色，四种颜色总够用。</p>
        ${F("\\chi(G)\\le 4\\quad(G\\text{ 为平面图})")}
        <p>${M("\\chi(G)", "χ(G)")} 是染色数：最少用几种颜色才能让相邻顶点不同色。</p>
      `
    },

    /* ---------- 费马 ---------- */
    fermat: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>立方以上，${M("a^n+b^n=c^n", "aⁿ+bⁿ=cⁿ")} 没有正整数解。</p>
        ${F("\\nexists\\,a,b,c\\in\\mathbb{Z}^{+},\\ n\\ge 3:\\quad a^n+b^n=c^n")}
      `
    },

    /* ---------- 代数基本定理 ---------- */
    fta: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>复数里，多项式方程一定有根；n 次就有 n 个根（计重数）。</p>
        ${F("p(z)=a_n z^n+\\cdots+a_0,\\ a_n\\ne 0,\\ n\\ge 1\\ \\Rightarrow\\ \\exists z_0:\\ p(z_0)=0")}
        ${F("p(z)=a_n(z-r_1)\\cdots(z-r_n)")}
      `
    },

    /* ---------- 鸽巢 ---------- */
    pigeonhole: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>鸽子比笼子多，就一定有笼子挤了至少两只。</p>
        ${F("m\\text{ 物放入 }n\\text{ 盒}\\ \\Rightarrow\\ \\text{某盒}\\ge\\left\\lceil\\frac{m}{n}\\right\\rceil")}
        <p>基本情形：${M("m=n+1", "m=n+1")} 时某盒至少 2 个。</p>
      `
    },

    /* ---------- 布劳威尔 ---------- */
    brouwer: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>把圆盘连续揉进自己里面，至少有一点不动。</p>
        ${F("f:D^n\\to D^n\\text{ 连续}\\ \\Rightarrow\\ \\exists x^*:\\ f(x^*)=x^*")}
        <p>${M("D^n", "Dⁿ")} 是闭单位球（二维就是闭圆盘）。</p>
      `
    },

    /* ---------- CRT ---------- */
    crt: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>几条「除以 m 余 a」的条件，在除数两两互素时，能拼出模 ${M("M", "M")} 唯一的答案。</p>
        ${F("x\\equiv a_i\\pmod{m_i},\\ i=1,\\ldots,k")}
        <p>当 ${M("m_i", "m_i")} 两两互素、${M("M=\\prod m_i", "M=∏m_i")} 时，解在模 ${M("M", "M")} 下唯一。</p>
      `
    },

    /* ---------- AM-GM ---------- */
    amgm: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>正数的算术平均 ≥ 几何平均；全相等时才取等。</p>
        ${F("\\dfrac{x_1+\\cdots+x_n}{n}\\ge(x_1\\cdots x_n)^{1/n}\\quad(x_i>0)")}
      `
    },

    /* ---------- 巴塞尔 ---------- */
    basel: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>平方倒数无穷加起来，等于 ${M("\\pi^2/6", "π²/6")}。</p>
        ${F("\\sum_{n=1}^{\\infty}\\dfrac{1}{n^2}=\\dfrac{\\pi^2}{6}")}
      `
    },

    /* ---------- 皮克 ---------- */
    pick: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>格子纸上多边形：面积 = 内点 + 边界点/2 − 1。</p>
        ${F("\\operatorname{Area}(P)=I+\\dfrac{B}{2}-1")}
        <p>${M("I", "I")} 内部格点数，${M("B", "B")} 边界格点数（含顶点）。</p>
      `
    },

    /* ---------- 素数定理 ---------- */
    pnt: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>不超过 x 的质数大约有 ${M("x/\\ln x", "x/ln x")} 个。</p>
        ${F("\\pi(x)\\sim\\dfrac{x}{\\ln x}")}
        ${F("\\lim_{x\\to\\infty}\\pi(x)\\cdot\\dfrac{\\ln x}{x}=1")}
      `
    },

    /* ---------- 高斯–博内 ---------- */
    "gauss-bonnet": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>曲率积分等于拓扑量，和「有几个洞」绑定。</p>
        <p>紧致无边可定向曲面：</p>
        ${F("\\iint_\\Sigma K\\,dA=2\\pi\\,\\chi(\\Sigma)")}
        <p>有边界时还要加上边界测地曲率：</p>
        ${F("\\iint_\\Sigma K\\,dA+\\int_{\\partial\\Sigma}k_g\\,ds=2\\pi\\,\\chi(\\Sigma)")}
      `
    },

    /* ---------- 黎曼映射 ---------- */
    "riemann-mapping": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>单连通、不是全平面的开区域，都能保角变成单位圆盘。</p>
        ${F("\\Omega\\subset\\mathbb{C}\\text{ 单连通},\\ \\Omega\\ne\\mathbb{C}\\ \\Rightarrow\\ \\exists\\ f:\\Omega\\xrightarrow{\\text{双全纯}}\\mathbb{D}")}
        <p>若再规定 ${M("f(z_0)=0", "f(z₀)=0")} 且 ${M("f'(z_0)>0", "f'(z₀)>0")}，则 f 唯一。</p>
      `
    },
    "fermat-little": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>质数模下，a 的 (p−1) 次方余 1。</p>
        ${F("p\\text{ 素数},\\ p\\nmid a\\ \\Rightarrow\\ a^{p-1}\\equiv 1\\pmod{p}")}
        ${F("a^{p}\\equiv a\\pmod{p}")}
      `
    },
    "cauchy-schwarz": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>点积绝对值不超过长度乘积。</p>
        ${F("\\Bigl(\\sum a_i b_i\\Bigr)^2\\le\\Bigl(\\sum a_i^2\\Bigr)\\Bigl(\\sum b_i^2\\Bigr)")}
        ${F("|\\langle u,v\\rangle|\\le\\|u\\|\\,\\|v\\|")}
      `
    },
    bayes: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>用新证据更新对事件的判断。</p>
        ${F("P(A\\mid B)=\\dfrac{P(B\\mid A)\\,P(A)}{P(B)}")}
      `
    },
    binomial: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>(a+b)ⁿ 按组合数展开。</p>
        ${F("(a+b)^n=\\sum_{k=0}^{n}\\binom{n}{k}a^{n-k}b^{k}")}
      `
    },
    "law-of-cosines": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>任意三角形的边角关系；直角时变回勾股。</p>
        ${F("c^{2}=a^{2}+b^{2}-2ab\\cos C")}
      `
    },
    "euler-bridges": {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>一笔画回路要所有点度数为偶；路径最多两个奇度点。</p>
        ${F("\\text{欧拉回路}\\Leftrightarrow\\text{连通且所有顶点度数为偶数}")}
      `
    },
    taylor: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>光滑函数可用多项式局部逼近，误差由更高阶导数控制。</p>
        ${F("f(x)=\\sum_{k=0}^{n}\\dfrac{f^{(k)}(x_0)}{k!}(x-x_0)^k+R_n(x)")}
        ${F("R_n(x)=\\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}(x-x_0)^{n+1}")}
      `
    },
    sandwich: {
      statement: `
        <p class="plain-lead" data-plain-stmt><strong>先记住结论：</strong>上下夹住且两边极限相同，中间极限也相同。</p>
        ${F("g\\le f\\le h,\\ \\lim g=\\lim h=L\\ \\Rightarrow\\ \\lim f=L")}
      `
    }
  };

  T.forEach((th) => {
    const p = PATCH[th.id];
    if (!p || !th.sections) return;
    ["statement", "setup", "lemmas", "proof"].forEach((key) => {
      if (p[key]) th.sections[key] = p[key];
    });
  });
})();
