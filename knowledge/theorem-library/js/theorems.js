/**
 * 数学奇境 · 经典定理内容库（加强证明细节版）
 * 每篇尽量含：预备 / 引理 / 主证明分步 / 深入补充
 */
window.THEOREMS = [
  /* =========================================================
   * 1. 勾股定理
   * ========================================================= */
  {
    id: "pythagoras",
    title: "勾股定理",
    subtitle: "直角三角形的边长秘密",
    emoji: "📐",
    iconClass: "warm",
    difficulty: "easy",
    difficultyLabel: "入门",
    tags: ["几何", "古代数学", "必学经典"],
    era: "约公元前 1000–500 年",
    oneLiner: "直角三角形两条直角边的平方和，等于斜边的平方：a² + b² = c²。",
    people: [
      { role: "中国最早记载", name: "商高 / 《周髀算经》", years: "约公元前 11–1 世纪" },
      { role: "西方命名者", name: "毕达哥拉斯学派", years: "约公元前 6 世纪" },
      { role: "《原本》证明", name: "欧几里得", years: "约前 300 年，命题 I.47" }
    ],
    related: ["sqrt2", "pick", "amgm"],
    sections: {
      story: `
        <p>直角三角形三边之间有一个几乎「魔法」般的关系。中国《周髀算经》记「勾三股四弦五」；古希腊毕达哥拉斯学派将其提升为普遍定理。它是坐标几何、距离公式、三角学的起点。</p>
        <div class="fun-box"><strong>现实用途：</strong>木工放样（3-4-5 取直角）、导航距离、图像像素对角、向量模长……</div>
      `,
      statement: `
        <p><strong>定理（勾股）：</strong>设 △ABC 中 ∠C = 90°，BC = a，AC = b，AB = c，则</p>
        <div class="formula" data-latex="a^{2}+b^{2}=c^{2}"></div>
        <p><strong>逆定理：</strong>若三角形三边满足 a² + b² = c²，则 c 所对的角是直角。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">需要的工具</div>
          <ul>
            <li>面积：直角三角形面积 = ab/2；正方形面积 = 边长²。</li>
            <li>全等：SAS / HL 等（欧几里得证明会用到）。</li>
            <li>相似：若只走「相似三角形路线」，需会 AA 相似与对应边成比例。</li>
          </ul>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理 A（面积可加）</div>
          <p>若多边形被剖分成有限块不重叠的多边形，则总面积等于各块面积之和。（默认的欧氏几何公理后果）</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">引理 B（代数恒等式）</div>
          <p>(a+b)² = a² + 2ab + b²。展开： (a+b)(a+b) = a² + ab + ba + b²。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>证明 1 · 拼图</span><span>代数抵消</span><span>可小学完成</span></div>
        <p><strong>证明 1（范·奥贝尔 / 赵爽风格拼图）。</strong>取四个全等的直角三角形，直角边 a,b，斜边 c。</p>
        <ol class="steps">
          <li>把它们拼进边长为 a+b 的正方形：每个三角形的直角边贴在大正方形边上，斜边朝内。四个斜边围成中间一个边长为 c 的正方形（需验证四角为直角：相邻两直角三角形在内角处，两锐角互补，故内角为 90°）。</li>
          <li>由引理 A、B：大正方形面积
            <div class="calc-line" data-latex="(a+b)^{2} = a^{2} + 2ab + b^{2}"></div>
          </li>
          <li>另一方面：大正方形 = 4 个直角三角形 + 中间正方形
            <div class="calc-line" data-latex="4 \\cdot (ab/2) + c^{2} = 2ab + c^{2}"></div>
          </li>
          <li>两式相等：a² + 2ab + b² = 2ab + c²。两边减 2ab，得 <strong>a² + b² = c²</strong>。</li>
        </ol>
        <p class="qed">∎（证明 1）</p>

        <h3>证明 2（相似三角形，更「分析味」）</h3>
        <ol class="steps">
          <li>自直角顶点 C 作斜边 AB 的垂线，垂足 D。则 △ACD ∼ △ABC ∼ △CBD（公共角 + 直角）。</li>
          <li>由 △ACD ∼ △ABC：AC/AB = AD/AC，即 b/c = AD/b，故 <strong>b² = c · AD</strong>。</li>
          <li>由 △CBD ∼ △ABC：a/c = BD/a，故 <strong>a² = c · BD</strong>。</li>
          <li>两式相加：a² + b² = c(AD + BD) = c · AB = c · c = c²。</li>
        </ol>
        <p class="qed">∎（证明 2）</p>
      `,
      deep: `
        <h3>欧几里得《原本》I.47 的骨架</h3>
        <p>在斜边向外作三个正方形。证明以 a、b 为边的两正方形面积之和等于以 c 为边的正方形。关键步骤：作斜边上高，用全等三角形说明「a 上正方形 = 斜边正方形被高所分的一块矩形」，同理处理 b，再相加。</p>
        <h3>逆定理证明提纲</h3>
        <ol class="steps">
          <li>设三角形边 a,b,c 满足 a²+b²=c²。另作直角三角形 a′,b′ 使 a′=a, b′=b，则其斜边 c′ 满足 c′²=a²+b²=c²，故 c′=c（边长正）。</li>
          <li>两三角形三边对应相等 ⇒ SSS 全等 ⇒ 对应角相等 ⇒ 原三角形 c 的对角为直角。</li>
        </ol>
        <div class="warn-box"><strong>注意：</strong>在非欧几何中勾股关系会变形；它刻画的是「平坦」空间的特征。</div>
      `,
      why: `
        <p>它把「直角」翻译成代数等式，使几何可计算。向量内积 ⟨u,v⟩=0 ⇔ 勾股推广到任意维。</p>
      `,
      try: `
        <ul>
          <li>用证明 1 在纸上拼一次，标出 (a+b)² 与 2ab+c²。</li>
          <li>验证 5-12-13、8-15-17 是勾股数；试证若 a,b,c 是勾股数，则 ka,kb,kc 也是。</li>
          <li>用证明 2 写出 AD = b²/c，BD = a²/c，验证 AD+BD=c。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 2. 素数无穷
   * ========================================================= */
  {
    id: "euclid-primes",
    title: "素数有无穷多个",
    subtitle: "欧几里得论证的完整细节",
    emoji: "🔢",
    iconClass: "",
    difficulty: "easy",
    difficultyLabel: "入门",
    tags: ["数论", "证明典范", "古希腊"],
    era: "约公元前 300 年",
    oneLiner: "素数序列没有终点：任何有限名单都漏掉某个素数。",
    people: [
      { role: "提出并证明", name: "欧几里得", years: "《几何原本》卷 IX 命题 20" },
      { role: "分析强化", name: "欧拉", years: "∑ 1/p = ∞ 等" }
    ],
    related: ["fta-arith", "sqrt2", "fermat"],
    sections: {
      story: `
        <p>素数是大于 1 且只有 1 与自身两个正因数的整数。欧几里得证明它们无穷多——不是列出无穷个，而是证明「有限个」的假设必然破产。</p>
      `,
      statement: `
        <p><strong>定理：</strong>素数集合是无限集。</p>
        <p>等价表述：对任意正整数 N，存在素数 p > N。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">定义与基本事实</div>
          <ul>
            <li><strong>素数：</strong>p∈ℤ，p>1，且 p 的正因数只有 1 与 p。</li>
            <li><strong>合数：</strong>>1 且非素数。</li>
            <li><strong>算术基本事实：</strong>每个整数 n>1 都有一个素因数（见下引理）。</li>
            <li><strong>整除：</strong>a|b 表示存在整数 k 使 b=ak。</li>
          </ul>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理 1（最小因数是素数）</div>
          <p>设 n>1。令 d 为 n 的最小的大于 1 的正因数。则 d 是素数。</p>
          <p><em>证明：</em>若 d 合数，则 d=ab，1<a,b<d，于是 a|n 且 1<a<d，与 d 最小矛盾。故 d 素数。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">引理 2（每个 n>1 有素因数）</div>
          <p>由引理 1，n 的最小 >1 因数即为素因数。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">引理 3（余数）</div>
          <p>若 p 整除 M，则 p 不整除 M+1。（因若 p|M 且 p|(M+1)，则 p|1，但 p>1 不可能。）</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>反证法</span><span>构造 N=P+1</span><span>新素因子</span></div>
        <ol class="steps">
          <li><strong>反设：</strong>只有有限个素数，全部列出 p₁=2 &lt; p₂ &lt; … &lt; pₖ。</li>
          <li><strong>构造：</strong>令 P = p₁ p₂ ⋯ pₖ（有限个素数乘积），再令
            <div class="calc-line" data-latex="N = P + 1"></div>
            则 N ≥ 2+1 = 3 > 1。
          </li>
          <li>由引理 2，N 有某个素因数 q。</li>
          <li>对每个 i=1,…,k：因 pᵢ | P，由引理 3，pᵢ 不整除 N。故 q ≠ pᵢ。</li>
          <li>于是 q 是不在名单中的素数——与「名单完备」矛盾。</li>
          <li>因此反设错误，素数有无穷多个。</li>
        </ol>
        <p class="qed">∎</p>
        <div class="idea-box"><strong>证明真正建立的是：</strong>「任意有限素数集 S，都存在素数 ∉ S」。这比「写出通项公式」弱，但已足够说明无穷。</div>
      `,
      deep: `
        <h3>细节：N 本身不必是素数</h3>
        <p>例子：2·3·5·7·11·13+1 = 30031 = 59×509。新素数是 59 与 509，不是 30031。证明只需要「新素因子」，不需要 N 为素。</p>
        <h3>欧拉的分析证明提纲（∑1/p=∞）</h3>
        <ol class="steps">
          <li>若素数有限，则欧拉乘积 ∏_p (1−1/p)⁻¹ 是有限个因子的有限数。</li>
          <li>但调和级数 ∑ 1/n = ∞，而每个 n 的素因子分解给出
            ∑ 1/n = ∏_p (1 + 1/p + 1/p² + …) = ∏_p (1−1/p)⁻¹。</li>
          <li>左边发散 ⇒ 右边发散 ⇒ 不能只有有限个素数因子在乘积里。实际上更强：∑_p 1/p = ∞。</li>
        </ol>
        <h3>与「存在任意大素数空隙」不矛盾</h3>
        <p>n!+2, n!+3, …, n!+n 给出长度为 n−1 的合数段。素数可任意稀疏，但仍无限。</p>
      `,
      why: `
        <p>模板级反证法；密码学依赖大素数；素数定理 π(x)∼x/ln x 描述「有多密」。</p>
      `,
      try: `
        <ul>
          <li>从 {2,3,5} 造 N，分解 N，标出新素数。</li>
          <li>证明：存在任意长的连续合数串（用 n! 技巧）。</li>
          <li>思考：同样方法能否证明「有无穷多孪生素数」？缺在哪里？</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 3. 算术基本定理
   * ========================================================= */
  {
    id: "fta-arith",
    title: "算术基本定理",
    subtitle: "唯一分解：整数的「原子论」",
    emoji: "⚛️",
    iconClass: "green",
    difficulty: "medium",
    difficultyLabel: "进阶",
    tags: ["数论", "唯一性", "基础"],
    era: "欧几里得已有要点；高斯明确现代形式",
    oneLiner: "每个大于 1 的整数都能写成素数乘积，并且在不计次序时写法唯一。",
    people: [
      { role: "《原本》中的要点", name: "欧几里得", years: "约前 300 年" },
      { role: "现代明确表述", name: "高斯《算术研究》", years: "1801" }
    ],
    related: ["euclid-primes", "crt", "sqrt2"],
    sections: {
      story: `
        <p>化学有原子，整数有素数。算术基本定理说：合数的「分子式」在忽略顺序后是唯一的。没有它，约分、最小公倍数、密码学里的模运算都会失去根基。</p>
      `,
      statement: `
        <p><strong>定理：</strong>每个整数 n>1 均可写成 n = p₁ p₂ ⋯ pᵣ（pᵢ 为素数，可重复）。若还有 n = q₁ ⋯ qₛ，则 r=s 且在重排后 pᵢ=qᵢ。</p>
        <div class="formula" data-latex="n=p_1^{a_1}p_2^{a_2}\\cdots p_k^{a_k}"></div>
        <p style="text-align:center;color:var(--muted);font-size:0.9rem;margin-top:-0.35rem">标准素幂形式（不计顺序唯一）</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">整除与最大公因数</div>
          <ul>
            <li>gcd(a,b)：同时整除 a,b 的最大正整数。</li>
            <li>欧几里得算法：gcd(a,b)=gcd(b,a mod b)。</li>
            <li>贝祖等式：存在 x,y∈ℤ 使 ax+by=gcd(a,b)。</li>
          </ul>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理（欧几里得引理）</div>
          <p>若素数 p 整除 ab，则 p|a 或 p|b。</p>
          <p><em>证明：</em>若 p∤a，则 gcd(p,a)=1。由贝祖，存在 x,y 使 px+ay=1。两边乘 b：pxb + ayb = b。左边两项都被 p 整除（因 p|ab ⇒ p|ayb），故 p|b。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">推论</div>
          <p>若素数 p 整除 a₁a₂⋯aₘ，则 p 整除某个 aᵢ。（对 m 归纳 + 欧几里得引理）</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>存在性·强归纳</span><span>唯一性·欧几里得引理</span></div>
        <h3>第一部分：存在性</h3>
        <ol class="steps">
          <li>对 n 用强数学归纳法。n=2 已是素数，成立。</li>
          <li>设对所有 2≤m&lt;n，m 可写成素数积。看 n：若 n 是素数，完毕；若 n 合数，则 n=ab，1&lt;a,b&lt;n。</li>
          <li>由归纳假设 a、b 皆为素数积，故 n 亦然。</li>
        </ol>
        <h3>第二部分：唯一性</h3>
        <ol class="steps">
          <li>设 n = p₁⋯pᵣ = q₁⋯qₛ，所有 p,q 为素，并 debatable 按大小排序或逐步消元。</li>
          <li>p₁ 整除右边乘积，由推论 p₁ 等于某个 qⱼ。重排使 p₁=q₁。</li>
          <li>两边除以 p₁，得 p₂⋯pᵣ = q₂⋯qₛ。重复，最终 r=s 且对应相等。</li>
          <li>（形式写法：对 r 归纳更干净。）</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>为什么「整环」里会失败？</h3>
        <p>在 ℤ[√−5] 中，6 = 2·3 = (1+√−5)(1−√−5)，而两边因子在该环内都「不可约」却不相伴——唯一分解失败。这正是理想论诞生的动机之一。</p>
        <h3>应用：√2 无理的快速版</h3>
        <p>若 √2=p/q 既约，则 p²=2q²。左边素因子 2 的指数为偶，右边为奇（至少有 2q² 多一个 2）——与唯一分解矛盾。详见「√2 无理」专篇。</p>
      `,
      why: `
        <p>分数约分、周期小数、RSA（n=pq 分解难）都建立在「分解存在且（在ℤ上）唯一」之上。</p>
      `,
      try: `
        <ul>
          <li>把 360 写成素幂并验证唯一性。</li>
          <li>用欧几里得引理证明：若 p 素且 p|a²，则 p|a。</li>
          <li>说明为何「每个数都是素数积」不能推出「无穷多素数」（存在性≠无限供应）。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 4. √2 无理
   * ========================================================= */
  {
    id: "sqrt2",
    title: "√2 是无理数",
    subtitle: "第一次「数系不够用」的危机",
    emoji: "√",
    iconClass: "warm",
    difficulty: "easy",
    difficultyLabel: "入门",
    tags: ["数论", "无理数", "反证法"],
    era: "约公元前 5 世纪，毕达哥拉斯学派",
    oneLiner: "正方形对角线与边长的比，不能写成两个整数之比。",
    people: [
      { role: "发现（传说）", name: "希帕索斯 / 毕达哥拉斯学派", years: "约前 5 世纪" },
      { role: "经典教材证法", name: "亚里士多德等记载的偶奇证法", years: "古希腊" }
    ],
    related: ["pythagoras", "fta-arith", "cantor"],
    sections: {
      story: `
        <p>边长为 1 的正方形，对角线是 √2。若一切长度都是整数比，世界会很「干净」——但 √2 打破了幻想。这迫使希腊人认真区分「可公度」与「不可公度」，并最终走向实数观念。</p>
      `,
      statement: `
        <p><strong>定理：</strong>√2 ∉ ℚ，即不存在整数 a,b（b≠0）使 (a/b)² = 2。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">约定</div>
          <p>有理数 a/b 总可写成<strong>既约分数</strong>：gcd(a,b)=1，b>0。偶数谓 2 的倍数；奇数谓非偶数。</p>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理：平方的奇偶性</div>
          <p>n 为偶数 ⇔ n² 为偶数。等价：n 奇数 ⇒ n² 奇数。</p>
          <p><em>证明：</em>n=2k ⇒ n²=4k² 偶；n=2k+1 ⇒ n²=4k(k+1)+1 奇。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>反证</span><span>既约</span><span>偶奇矛盾</span></div>
        <ol class="steps">
          <li>反设 √2 = a/b，其中 a,b∈ℤ，b>0，gcd(a,b)=1。</li>
          <li>两边平方：a² / b² = 2 ⇒ <strong>a² = 2b²</strong>。</li>
          <li>右边是偶数 ⇒ a² 偶 ⇒ 由引理 <strong>a 偶</strong>。写 a=2k。</li>
          <li>代入：(2k)² = 2b² ⇒ 4k² = 2b² ⇒ <strong>b² = 2k²</strong>。故 b² 偶 ⇒ <strong>b 偶</strong>。</li>
          <li>a、b 都是偶数 ⇒ gcd(a,b)≥2，与既约矛盾。</li>
          <li>因此 √2 不是有理数。</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>用唯一分解的版本</h3>
        <p>a²=2b²。比较两边素因子 2 的指数：左边为偶（平方），右边 = 1 +（b² 中 2 的指数）为奇。矛盾。</p>
        <h3>推广</h3>
        <p>对非完全平方的正整数 m，√m 无理：同样 a²=m b²，看某个在 m 中指数为奇的素数。</p>
        <h3>几何版（无穷下降）</h3>
        <p>若等腰直角三角形腰与斜边可公度，可构造更小的同类可公度三角形，无限下降——与「正整数不能无限变小」矛盾。</p>
      `,
      why: `
        <p>说明「测量」需要比分数更大的数系；分析学里稠密、完备性的故事由此开端。</p>
      `,
      try: `
        <ul>
          <li>模仿证明：√3 无理（注意：不能再用「偶」字，应改用「3 的倍数」）。</li>
          <li>证明 √4 是有理——看证明哪一步对完全平方数失效。</li>
          <li>用计算器看 √2 小数是否「明显循环」（不循环不能当证明，但可直观）。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 5. 欧拉多面体
   * ========================================================= */
  {
    id: "euler-polyhedron",
    title: "欧拉公式 V − E + F = 2",
    subtitle: "多面体的拓扑身份证",
    emoji: "🎲",
    iconClass: "purple",
    difficulty: "medium",
    difficultyLabel: "进阶",
    tags: ["拓扑", "几何", "欧拉"],
    era: "1750 年代",
    oneLiner: "凸多面体（球面拓扑）上，顶点数减棱数加面数恒为 2。",
    people: [
      { role: "系统研究", name: "莱昂哈德·欧拉", years: "1707–1783" },
      { role: "严格化与拓扑视角", name: "柯西、庞加莱等", years: "19–20 世纪" }
    ],
    related: ["four-color", "pick", "kakeya"],
    sections: {
      story: `
        <p>立方体 8−12+6=2，四面体 4−6+4=2，十二面体 20−30+12=2。欧拉发现这个组合不变量；现代观点认为它是球面的欧拉示性数 χ(S²)=2。</p>
      `,
      statement: `
        <p><strong>定理：</strong>设 P 为凸多面体（或更一般：边界同胚于球面的多面体），V,E,F 为顶点、棱、面数目，则 V−E+F=2。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">假设（教学版）</div>
          <ul>
            <li>每个面是与圆盘同胚的多边形；</li>
            <li>任意两面至多共一条棱；每条棱恰属两个面；</li>
            <li>多面体「实心」同胚于球（无洞，非环面）。</li>
          </ul>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">握手引理（平面图）</div>
          <p>∑_面 (面的边数) = 2E。因为每条棱被两个面各数一次。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">顶点度数和</div>
          <p>∑_v deg(v) = 2E。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>去面摊平</span><span>树形收缩</span><span>χ 不变</span></div>
        <p><strong>证明（柯西风格的组合版，细化）。</strong></p>
        <ol class="steps">
          <li><strong>去掉一个面：</strong>把多面体表面其余部分「压平」成平面连通图 G，外轮廓是被去掉那面的边界。此时平面区域数（有界面）F′=F−1，而 V,E 不变。目标变为证 V−E+F′=1。</li>
          <li><strong>三角剖分：</strong>在每个面（含可能的非三角面）加对角线，不改变 V，每加一条对角线 E 与 F′ 各 +1，故 V−E+F′ 不变。可设所有有界面都是三角形，且外边界是简单多边形。</li>
          <li><strong>逐步删三角形：</strong>
            <ul class="substeps">
              <li>若某三角形有一条边在外边界、另两边在内部：删去该三角形的「外棱」及外顶点的方式需分类；标准教材采用：删去一个有且仅有一边在边界上的三角形时，E−1，F′−1，V 不变，χ 不变；或删去有两边在边界的「耳朵」时 V−1,E−2,F′−1，χ 仍不变。</li>
              <li>重复直到只剩一个三角形：此时 V=3,E=3,F′=1，V−E+F′=1。</li>
            </ul>
          </li>
          <li>故原式 V−E+(F−1)=1，即 <strong>V−E+F=2</strong>。</li>
        </ol>
        <p class="qed">∎</p>
        <div class="idea-box">关键是：允许的手术保持 χ=V−E+F 不变，而最终物体的 χ 可直接数出来。</div>
      `,
      deep: `
        <h3>用双计数直接推立方体类型不等式</h3>
        <p>由 2E ≥ 3F（每面至少 3 边）及 2E ≥ 3V（每顶点至少 3 棱），结合 V−E+F=2，可推 E ≤ 3V−6（V≥3 的简单平面图）。这是四色定理与平面图理论的基本不等式。</p>
        <h3>环面</h3>
        <p>轮胎面 χ=0：例如适当的矩形网格识别对边后 V−E+F=0。洞的个数（亏格 g）满足 χ=2−2g。</p>
      `,
      why: `
        <p>拓扑不变量入门；足球面片约束、平面图、曲面分类都用它。</p>
      `,
      try: `
        <ul>
          <li>数正四面体、立方体、八面体、十二、二十面体，填表验证。</li>
          <li>验证：从立方体「切掉一个角」（截角）后 V,E,F 如何变，χ 是否仍为 2。</li>
          <li>用 2E≥3F 与 χ=2 推出 F≤2V−4。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 6. 微积分基本定理
   * ========================================================= */
  {
    id: "ftc",
    title: "微积分基本定理",
    subtitle: "导数与积分互逆——写清 ε 味道的纲要",
    emoji: "∫",
    iconClass: "green",
    difficulty: "medium",
    difficultyLabel: "进阶",
    tags: ["微积分", "牛顿", "莱布尼茨"],
    era: "17 世纪创立；19 世纪严格化",
    oneLiner: "面积函数的导数回到被积函数；原函数在两端之差等于定积分。",
    people: [
      { role: "创立", name: "牛顿、莱布尼茨", years: "17 世纪" },
      { role: "严格化", name: "柯西、黎曼等", years: "19 世纪" }
    ],
    related: ["ivt", "euler-identity", "mvt"],
    sections: {
      story: `
        <p>瞬时变化率（导数）与累积总量（积分）曾是两套问题。微积分基本定理（FTC）把它们焊成一体，成为科学革命的数学引擎。</p>
      `,
      statement: `
        <p>设 <span data-latex="f">f</span> 在 <span data-latex="[a,b]">[a,b]</span> 上连续。定义面积函数</p>
        <div class="formula" data-latex="A(x)=\\int_a^x f(t)\\,dt"></div>
        <p><strong>FTC-1：</strong><span data-latex="A">A</span> 可导，且对所有 <span data-latex="x\\in(a,b)">x∈(a,b)</span> 有</p>
        <div class="formula" data-latex="A'(x)=f(x)"></div>
        <p><strong>FTC-2：</strong>若 <span data-latex="F'=f">F'=f</span>，则</p>
        <div class="formula" data-latex="\\int_a^b f(x)\\,dx = F(b)-F(a)"></div>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">黎曼积分直觉</div>
          <p>把 <span data-latex="[a,b]">[a,b]</span> 分成小段，作上和/下和；当网径 <span data-latex="\\to 0">→0</span> 时上下和趋于同一极限，则称可积，极限为定积分。连续函数在闭区间上可积。</p>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理（积分中值不等式）</div>
          <p>若 <span data-latex="m\\le f(t)\\le M">m≤f(t)≤M</span> 在 <span data-latex="[x,x+h]">[x,x+h]</span> 上，则（<span data-latex="h>0">h>0</span>）</p>
          <div class="calc-line" data-latex="mh \\le \\int_x^{x+h} f(t)\\,dt \\le Mh"></div>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">引理（连续函数局部几乎常值）</div>
          <p><span data-latex="f">f</span> 在 <span data-latex="x_0">x₀</span> 连续 <span data-latex="\\Rightarrow">⇒</span> 对任意 <span data-latex="\\varepsilon>0">ε>0</span>，存在 <span data-latex="\\delta>0">δ>0</span>，当 <span data-latex="|t-x_0|<\\delta">|t−x₀|&lt;δ</span> 时 <span data-latex="|f(t)-f(x_0)|<\\varepsilon">|f(t)−f(x₀)|&lt;ε</span>。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>FTC-1</span><span>差商夹逼</span><span>FTC-2 望远镜</span></div>
        <h3>证明 FTC-1</h3>
        <ol class="steps">
          <li>固定 <span data-latex="x\\in(a,b)">x∈(a,b)</span>，取 <span data-latex="h">h</span> 使 <span data-latex="x+h\\in[a,b]">x+h∈[a,b]</span>，<span data-latex="h\\ne 0">h≠0</span>。则
            <div class="calc-line" data-latex="A(x+h)-A(x)=\\int_x^{x+h} f(t)\\,dt"></div>
          </li>
          <li>差商：
            <div class="calc-line" data-latex="\\dfrac{A(x+h)-A(x)}{h}=\\dfrac{1}{h}\\int_x^{x+h} f(t)\\,dt"></div>
          </li>
          <li>由连续性：对 <span data-latex="\\varepsilon>0">ε>0</span>，取 <span data-latex="\\delta">δ</span> 使 <span data-latex="|t-x|<\\delta\\Rightarrow|f(t)-f(x)|<\\varepsilon">|t−x|&lt;δ⇒|f(t)−f(x)|&lt;ε</span>。当 <span data-latex="0&lt;|h|&lt;\\delta">0&lt;|h|&lt;δ</span> 时，在积分区间上
            <div class="calc-line" data-latex="f(x)-\\varepsilon &lt; f(t) &lt; f(x)+\\varepsilon"></div>
            用引理积分并除以 <span data-latex="h">h</span>（注意 <span data-latex="h&lt;0">h&lt;0</span> 时不等式方向与除法，最终同样得到）
            <div class="calc-line" data-latex="f(x)-\\varepsilon &lt; \\dfrac{A(x+h)-A(x)}{h} &lt; f(x)+\\varepsilon"></div>
          </li>
          <li>故差商当 <span data-latex="h\\to 0">h→0</span> 时趋于 <span data-latex="f(x)">f(x)</span>。即
            <div class="calc-line" data-latex="A'(x)=f(x)"></div>
          </li>
        </ol>
        <h3>证明 FTC-2</h3>
        <ol class="steps">
          <li>设 <span data-latex="F'=f">F'=f</span>。考虑 <span data-latex="G(x)=A(x)-F(x)">G(x)=A(x)−F(x)</span>。则 <span data-latex="G'=f-f=0">G'=0</span>，故 <span data-latex="G">G</span> 为常数。</li>
          <li><span data-latex="G(a)=A(a)-F(a)=-F(a)">G(a)=−F(a)</span>，故 <span data-latex="G(x)=-F(a)">G(x)=−F(a)</span>，即 <span data-latex="A(x)=F(x)-F(a)">A(x)=F(x)−F(a)</span>。</li>
          <li>令 <span data-latex="x=b">x=b</span>：
            <div class="calc-line" data-latex="\\int_a^b f=F(b)-F(a)"></div>
          </li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>为什么 F'=0 ⇒ F 常数？</h3>
        <p>用中值定理：对 x₁&lt;x₂，存在 ξ 使 F(x₂)−F(x₁)=F'(ξ)(x₂−x₁)=0。无需中值定理时，可用「上确界论证」或直接从导数定义控制增量。</p>
        <h3>不连续的情况</h3>
        <p>若 f 仅黎曼可积而不连续，A 仍几乎处处可导且 A'=f a.e.（勒贝格理论）。教学中连续已足够。</p>
        <h3>换元与分部的来源</h3>
        <p>链式法则 + FTC ⇒ 换元公式；乘积法则 + FTC ⇒ 分部积分。</p>
      `,
      why: `
        <p>科学中所有「由变化率还原总量」的计算都走 FTC。没有它，微积分只是两堆不相干的技巧。</p>
      `,
      try: `
        <ul>
          <li>对 f=2x，手算 A(x)=∫_0^x 2t dt=x²，验证 A'=2x。</li>
          <li>用定义估算 [A(1+h)−A(1)]/h 对 f(t)=t² 当 h=0.1,0.01。</li>
          <li>说明：为何求 ∫_0^1 e^{x²} dx 没有初等原函数，但仍有定积分意义。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 7. 中间值定理
   * ========================================================= */
  {
    id: "ivt",
    title: "中间值定理",
    subtitle: "连续曲线没有「瞬移」",
    emoji: "📈",
    iconClass: "",
    difficulty: "medium",
    difficultyLabel: "进阶",
    tags: ["分析", "连续", "存在性"],
    era: "波尔查诺 1817；柯西等完善",
    oneLiner: "连续函数从负值到正值，中途必经过 0——根的存在性无需公式。",
    people: [
      { role: "早期严格证明", name: "波尔查诺", years: "1817" },
      { role: "分析奠基", name: "柯西、魏尔斯特拉斯", years: "19 世纪" }
    ],
    related: ["ftc", "mvt", "fta"],
    sections: {
      story: `
        <p>解方程 f(x)=0 不一定有求根公式，但若 f 连续且 f(a)、f(b) 异号，根一定存在。这是所有「二分法」数值求根的理论担保，也是许多存在性定理的母机。</p>
      `,
      statement: `
        <p><strong>中间值定理（IVT）：</strong>f:[a,b]→ℝ 连续，f(a)&lt;0&lt;f(b)（或反过来），则存在 c∈(a,b) 使 f(c)=0。</p>
        <p><strong>一般形式：</strong>f 连续，则 f 取到 f(a) 与 f(b) 之间一切值。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">实数完备性（要用的形式）</div>
          <p>ℝ 的<strong>确界原理</strong>：非空有上界的集合有上确界（最小上界）。这是实数区别于有理数的关键性质。</p>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理：连续保持符号</div>
          <p>若 f 在 c 连续且 f(c)>0，则存在邻域使 f 在该邻域内 >0。（对 &lt;0 类似。）</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>集合 S</span><span>取上确界 c</span><span>排除 f(c)≠0</span></div>
        <ol class="steps">
          <li>设 f(a)&lt;0&lt;f(b)，f 在 [a,b] 连续。定义
            <div class="calc-line" data-latex="S = { x\\in [a,b] : f \\text{在} [a,x] \\text{上处处} \\le 0 }"></div>
            更常用的经典定义：S={x∈[a,b]: f(x)≤0}。此处采用：
            <div class="calc-line" data-latex="S = { x\\in [a,b] : f(x) \\le 0 }"></div>
            则 a∈S，S 非空有上界 b，令 c = sup S ∈[a,b]。
          </li>
          <li><strong>不能 f(c)&gt;0：</strong>若 f(c)>0，由连续，在 c 左侧小邻域 f 仍为正，与 c 是「f≤0 的点」的上确界矛盾（左侧应仍有 S 中的点逼近 c，那些点 f≤0）。更细：存在 δ 使 (c−δ,c+δ) 上 f>0，则 c−δ/2 已是比 c 小的上界，矛盾。</li>
          <li><strong>不能 f(c)&lt;0：</strong>若 f(c)&lt;0，则邻域内 f&lt;0，于是 c 右侧仍有点属于 S，与上确界矛盾。</li>
          <li>故 f(c)=0。又因 f(a)≠0、f(b)≠0（严格异号），有 c∈(a,b)。</li>
        </ol>
        <p class="qed">∎</p>
        <div class="warn-box">若只在 ℚ 上讨论，「连续」函数 g(x)=x²−2 在有理数上异号但不取 0——完备性不可或缺。</div>
      `,
      deep: `
        <h3>一般值形式</h3>
        <p>要证 f 取到 f(a) 与 f(b) 之间的 γ，考虑 h(x)=f(x)−γ，化为过零点问题。</p>
        <h3>二分法算法</h3>
        <ol class="steps">
          <li>若 f(a)f(b)&lt;0，取中点 m。(a+b)/2。</li>
          <li>若 f(m)=0 结束；若 f(a)f(m)&lt;0 则改 b:=m，否则 a:=m。</li>
          <li>区间长度每次减半，由区间套/完备性，唯一极限点即为根（或一串趋于某根）。</li>
        </ol>
        <p>误差 ≤ (b−a)/2ⁿ，可明确给出步数。</p>
      `,
      why: `
        <p>存在性定理的模板；数值分析、微分方程解的延拓、拓扑度理论的一维影子。</p>
      `,
      try: `
        <ul>
          <li>证明：任何奇次实系数多项式至少有一个实根（x→±∞ 时符号相反 + IVT）。</li>
          <li>证明：地球上（理想化连续温度）总有对跖点温度相同——相关有趣拓扑加强版。</li>
          <li>指出：f(x)=1/x 在 [−1,1]∖{0} 不满足 IVT 结论——缺在「区间上连续」。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 8. 中值定理
   * ========================================================= */
  {
    id: "mvt",
    title: "拉格朗日中值定理",
    subtitle: "平均速度必等于某一瞬间速度",
    emoji: "🚗",
    iconClass: "warm",
    difficulty: "medium",
    difficultyLabel: "进阶",
    tags: ["微积分", "分析", "罗尔"],
    era: "拉格朗日；罗尔更早有特例",
    oneLiner: "光滑曲线的割线斜率，必等于某点切线斜率。",
    people: [
      { role: "罗尔定理", name: "米歇尔·罗尔", years: "1691" },
      { role: "中值定理", name: "拉格朗日等", years: "18 世纪" }
    ],
    related: ["ftc", "ivt", "pythagoras"],
    sections: {
      story: `
        <p>若你 1 小时开了 80 公里，速度表是否一定在某时刻恰指 80？在「速度连续/可导」的理想模型下，答案是肯定的——这就是中值定理的生活版。</p>
      `,
      statement: `
        <p><strong>罗尔定理：</strong>f 在 [a,b] 连续，(a,b) 可导，f(a)=f(b)，则存在 ξ∈(a,b) 使 f'(ξ)=0。</p>
        <p><strong>拉格朗日中值定理：</strong>f 在 [a,b] 连续，(a,b) 可导，则存在 ξ∈(a,b) 使</p>
        <div class="formula" data-latex="f'(\\xi)=\\dfrac{f(b)-f(a)}{b-a}"></div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">极值点导数</div>
          <p>若 f 在 c∈(a,b) 可导且取局部极值，则 f'(c)=0。（费马内点定理：差商左右符号迫使导数为 0。）</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">连续函数极值</div>
          <p>闭区间上连续函数达到最大、最小值。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>先罗尔</span><span>再辅助函数</span></div>
        <h3>罗尔定理</h3>
        <ol class="steps">
          <li>f 在 [a,b] 连续 ⇒ 有最大值 M 与最小值 m。</li>
          <li>若 M=m，则 f 常数，任意 ξ 都有 f'=0。</li>
          <li>若 M>m，因 f(a)=f(b)，最大值或最小值至少有一个在开区间 (a,b) 内达到（两端同值，若都只在端点取极值则函数常值）。更精确：M、m 不能同时仅在端点且不相等——若最大只在端点，则最大=f(a)=f(b)，若内部都严格小于它，最小在内部或端点；标准写法：
            <ul class="substeps">
              <li>若 f 非常数，则 M&gt;f(a) 或 m&lt;f(a)；</li>
              <li>若 M&gt;f(a)，最大点 c∈(a,b)，由引理 f'(c)=0；</li>
              <li>若 m&lt;f(a)，最小点同理。</li>
            </ul>
          </li>
        </ol>
        <h3>中值定理</h3>
        <ol class="steps">
          <li>构造辅助函数（减去割线）：
            <div class="calc-line" data-latex="g(x) = f(x) - f(a) - [(f(b)-f(a))/(b-a)](x-a)"></div>
          </li>
          <li>则 g(a)=g(b)=0，g 满足罗尔条件 ⇒ 存在 ξ，g'(ξ)=0。</li>
          <li>但 g'(x)=f'(x) − [f(b)−f(a)]/(b−a)，故 f'(ξ)=[f(b)−f(a)]/(b−a)。</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>柯西中值定理</h3>
        <p>f,g 可导，g'≠0，则存在 ξ 使 [f(b)−f(a)]/[g(b)−g(a)] = f'(ξ)/g'(ξ)。用于洛必达法则的证明。</p>
        <h3>推论</h3>
        <ul>
          <li>f'=0 ⇒ f 常数；</li>
          <li>f'>0 ⇒ 严格递增；</li>
          <li>用泰勒定理的余项形式继续强化。</li>
        </ul>
      `,
      why: `
        <p>连接局部（导数）与整体（增量）；误差估计、不等式、数值分析的根基之一。</p>
      `,
      try: `
        <ul>
          <li>对 f(x)=x² 在 [0,2] 找出 ξ。</li>
          <li>用中值定理证明：|sin x − sin y| ≤ |x−y|。</li>
          <li>解释：为何「瞬时速度一直 ≤ 80」能推出「平均速度 ≤ 80」。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 9. 欧拉恒等式
   * ========================================================= */
  {
    id: "euler-identity",
    title: "欧拉公式与欧拉恒等式",
    subtitle: "e^{iθ} = cosθ + i sinθ 的推导细节",
    emoji: "🌀",
    iconClass: "purple",
    difficulty: "medium",
    difficultyLabel: "进阶",
    tags: ["复数", "分析", "最美公式"],
    era: "18 世纪",
    oneLiner: "指数函数在虚方向上变成旋转；θ=π 时得到 e^{iπ}+1=0。",
    people: [
      { role: "系统建立", name: "欧拉", years: "1707–1783" }
    ],
    related: ["ftc", "fta", "basel"],
    sections: {
      story: `
        <p>e、i、π、1、0 五个常数挤进一个等式，被誉为数学最美公式。其根是欧拉公式：指数映射把虚轴变成单位圆。</p>
      `,
      statement: `
        <div class="formula" data-latex="e^{i\\theta}=\\cos\\theta+i\\sin\\theta"></div>
        <p>令 θ=π：e^{iπ} = −1，即 e^{iπ}+1=0。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">幂级数定义（分析路径）</div>
          <div class="calc-line" data-latex="e^z = \\sum_{n=0}^\\infty z^n / n!"></div>
          <div class="calc-line" data-latex="cos \\theta = \\sum (-1)^k \\theta ^{2k}/(2k)! ， sin \\theta = \\sum (-1)^k \\theta ^{2k+1}/(2k+1)!"></div>
          <p>对实 θ，这些级数绝对收敛，可合法重排。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>代入 z=iθ</span><span>按 i 的幂归类</span><span>对齐级数</span></div>
        <ol class="steps">
          <li>写 e^{iθ} = ∑ (iθ)^n / n! = ∑ i^n θ^n / n!。</li>
          <li>i 的循环：i^0=1, i^1=i, i^2=−1, i^3=−i，然后重复。</li>
          <li>拆成 n=4k, 4k+1, 4k+2, 4k+3 四类：
            <ul class="substeps">
              <li>n=4k：贡献 + θ^{4k}/(4k)! （实）</li>
              <li>n=4k+1：贡献 + i θ^{4k+1}/(4k+1)! （虚）</li>
              <li>n=4k+2：贡献 − θ^{4k+2}/(4k+2)! （实）</li>
              <li>n=4k+3：贡献 − i θ^{4k+3}/(4k+3)! （虚）</li>
            </ul>
          </li>
          <li>全体实部 = ∑ (−1)^k θ^{2k}/(2k)! = cos θ。</li>
          <li>全体虚部系数 = ∑ (−1)^k θ^{2k+1}/(2k+1)! = sin θ。</li>
          <li>故 e^{iθ}=cosθ + i sinθ。θ=π 时得恒等式。</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>微分方程路径</h3>
        <p>令 f(θ)=cosθ + i sinθ。则 f'= −sinθ + i cosθ = i f，且 f(0)=1。而 g(θ)=e^{iθ} 满足同一 ODE 与初值，由唯一性 f≡g。</p>
        <h3>几何：模长</h3>
        <p>|e^{iθ}|² = cos²θ + sin²θ = 1，故在单位圆上；θ 增加对应辐角增加（角速度 1）。</p>
        <h3>棣莫弗</h3>
        <p>(cosθ+i sinθ)^n = cos(nθ)+i sin(nθ) 由欧拉公式立即得到。</p>
      `,
      why: `
        <p>傅里叶分析、量子相位、交流电相量——全部把振荡写成复指数。</p>
      `,
      try: `
        <ul>
          <li>用级数前 6 项数值验证 θ=π/2 时接近 i。</li>
          <li>由欧拉公式推 sinθ = (e^{iθ}−e^{−iθ})/(2i)。</li>
          <li>计算 e^{iπ/3} 的直角坐标形式。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 10. 康托尔
   * ========================================================= */
  {
    id: "cantor",
    title: "实数不可数（对角线法）",
    subtitle: "无限也有不同大小",
    emoji: "♾️",
    iconClass: "rose",
    difficulty: "medium",
    difficultyLabel: "进阶",
    tags: ["集合论", "无限", "康托尔"],
    era: "1874–1891",
    oneLiner: "(0,1) 中的实数无法与自然数一一对应；对角线上总能逃出一个漏网之数。",
    people: [
      { role: "创立并证明", name: "格奥尔格·康托尔", years: "1845–1918" }
    ],
    related: ["euclid-primes", "godel", "sqrt2"],
    sections: {
      story: `
        <p>康托尔证明：自然数、整数、有理数「一样多」（可数），但实数严格更多。对角线法是 20 世纪逻辑与计算理论的祖先级技巧。</p>
      `,
      statement: `
        <p><strong>定理：</strong>集合 (0,1) 不可数，即不存在从 ℕ 到 (0,1) 的双射。因此 ℝ 不可数。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">可数</div>
          <p>集合 S 可数（countable infinite）指存在双射 ℕ→S，或等价：元素可排成无重复的无穷序列 s₁,s₂,s₃,… 穷尽 S。</p>
          <p>小数约定：避免 0.1999…=0.2000… 的双重表示——证明中构造的 y 只用数字 4 与 5，避开 0 与 9。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>反设可列</span><span>造对角线数</span><span>逐位不同</span></div>
        <ol class="steps">
          <li>反设 (0,1) 可数，列成 x₁,x₂,x₃,… 写十进位：
            <div class="calc-line" data-latex="x_n = 0.a_{n1}a_{n2}a_{n3}\\ldots ， a_{nj}\\in {0,1,\\ldots ,9}"></div>
          </li>
          <li>定义 y=0.b₁b₂b₃…，其中
            <div class="calc-line" data-latex="b_n = 4 \\text{若} a_{nn} \\ne 4； b_n = 5 \\text{若} a_{nn} = 4"></div>
          </li>
          <li>则 y∈(0,1)，且 y 不含循环全 0/全 9 的双重表示问题（各位是 4 或 5）。</li>
          <li>对任意 n，y 与 x_n 的第 n 位不同：b_n ≠ a_{nn}。故 y ≠ x_n。</li>
          <li>y 不在名单中，矛盾。因此 (0,1) 不可数。</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>有理数可数（对比）</h3>
        <p>正有理数按 p+q 斜线枚举，跳过不既约者，可排成序列。整数 ℤ：0,1,−1,2,−2,… 可数。可数个可数集的并仍可数。</p>
        <h3>基数</h3>
        <p>|ℕ|=ℵ₀，|(0,1)|=2^{ℵ₀}=𝔠。康托尔定理：对任何集合 A，|A| &lt; |P(A)|（幂集更大）——对角论证的抽象版。</p>
        <h3>连续统假设 CH</h3>
        <p>是否存在基数严格介于 ℵ₀ 与 𝔠 之间？哥德尔与科恩证明 CH 相对 ZFC 独立——不可证也不可否。</p>
      `,
      why: `
        <p>重塑无限观念；为测度论（「几乎处处」）、概率、逻辑奠定集合论语言。</p>
      `,
      try: `
        <ul>
          <li>手写 3 个小数，按规则造 y，验证三位都不同。</li>
          <li>证明 (0,1) 与 ℝ 等势（例如 tan 把 (−π/2,π/2) 映到 ℝ）。</li>
          <li>证明「有限小数全体」可数——与全体实数对比。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 11. 四色
   * ========================================================= */
  {
    id: "four-color",
    title: "四色定理",
    subtitle: "从五色证明到计算机可约构型",
    emoji: "🗺️",
    iconClass: "warm",
    difficulty: "hard",
    difficultyLabel: "挑战",
    tags: ["图论", "计算机证明", "平面图"],
    era: "1852 提出；1976 证明",
    oneLiner: "平面地图四国着色总够用；完整证明依赖不可避集与可约性的大规模检验。",
    people: [
      { role: "提出", name: "格思里", years: "1852" },
      { role: "五色定理", name: "希伍德", years: "1890" },
      { role: "四色证明", name: "阿佩尔、哈肯", years: "1976" }
    ],
    related: ["euler-polyhedron", "pigeonhole", "kakeya"],
    sections: {
      story: `
        <p>地图着色问题把「邻接」抽象成平面图顶点染色。五色定理有纯手工证明；四色则靠「不可避免的可约构型」+ 计算机检查，开启计算机辅助证明的时代。</p>
      `,
      statement: `
        <p>每个平面图 G 满足 χ(G)≤4（顶点染色数 ≤4）。等价：平面地图面染色 ≤4（对偶）。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">图论语言</div>
          <ul>
            <li>平面图：可画在平面上使边仅在顶点相交。</li>
            <li>k-染色：用 k 种颜色给顶点上色，邻接异色。</li>
            <li>最小反例：顶点数最少的不可 4-染色平面图。</li>
          </ul>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理（欧拉推论）</div>
          <p>简单平面图 E≤3V−6（V≥3），故存在顶点度数 d(v)≤5。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">五色定理（完整短证）</div>
          <p>对 V 归纳。取 d(v)≤5。删 v 后 5-染色。若 d(v)≤4，直接染 v。若 d(v)=5 且五个邻居五色俱全：在两不相邻邻居的颜色类上做 Kempe 链切换，可腾出一种颜色给 v。（细节：若 1-3 Kempe 链堵住，则 2-4 链不会同时堵住，可切换。）</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>五色可手工</span><span>四色：不可避+可约</span></div>
        <h3>A. 五色定理（希伍德，细节纲要）</h3>
        <ol class="steps">
          <li>对顶点数 n 归纳。n 小则显然。</li>
          <li>平面图有 v，deg(v)≤5。G−v 有 5-染色。</li>
          <li>deg≤4：邻居最多用 4 色，第 5 色给 v。</li>
          <li>deg=5：设邻居颜色为 1..5 环绕。考虑颜色 1 与 3 的 Kempe 子图：
            <ul class="substeps">
              <li>若染 1 的邻居与染 3 的邻居不在同一连通分量，切换分量颜色，使「1」色空出，染 v；</li>
              <li>若在同一分量，则 1–3 路径把平面分成两侧，此时 2 与 4 的邻居被隔开，对 2–4 切换一定成功。</li>
            </ul>
          </li>
        </ol>
        <h3>B. 四色定理的战略（阿佩尔–哈肯）</h3>
        <ol class="steps">
          <li><strong>最小反例性质：</strong>可证明最小反例是三角剖分、最小度 ≥5 等（可约化掉 deg≤4）。</li>
          <li><strong>不可避免集：</strong>用放电法（discharging）：给顶点电荷，按欧拉公式总电荷负，重新分配后某些局部构型必然「仍然带电」——这些构型构成不可避免集 U：任何最小反例必须包含 U 中某个构型。</li>
          <li><strong>可约性：</strong>对 U 中每一构型 C，证明：若 G 含 C 且 G−C（适当收缩）可 4-染色，则染色可延拓回 G。于是含 C 的图不是最小反例。</li>
          <li>计算机检查 U 中所有构型的可约性（历史上约 1500 个，后经简化）。</li>
          <li>故最小反例不能存在 ⇒ 所有平面图 4-可染。</li>
        </ol>
        <p class="qed">∎（战略完备；可约性机器检查属证明的一部分）</p>
      `,
      deep: `
        <h3>放电法一瞥</h3>
        <p>初始电荷 σ(v)=deg(v)−6，则 ∑σ=∑(deg−6)=2E−6V≤−12&lt;0（由 E≤3V−6）。规定「从高电荷顶点向某些邻域输送电荷」的规则后，若每个可能的局部在输送后电荷 ≤0，则总电荷 ≤0 与 ∑=−12 的精细分析结合，迫使某些构型出现——这就是「不可避免」。</p>
        <h3>为何四色比五色难</h3>
        <p>deg=5 时 4 色没有「备用色」，Kempe 在 1879 年的四色「证明」有漏洞；修补漏洞需要系统的构型表，人手难以穷尽。</p>
      `,
      why: `
        <p>图染色是调度、寄存器分配、无线频率的模型；四色是方法论里程碑。</p>
      `,
      try: `
        <ul>
          <li>证明树 2-可染；奇圈 χ=3。</li>
          <li>画出 K₅ 非平面（或用 E≤3V−6 否定）。</li>
          <li>用纸笔完成「最多 5 邻」情形下的五色讨论。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 12. 费马
   * ========================================================= */
  {
    id: "fermat",
    title: "费马大定理",
    subtitle: "从无穷下降到模形式的战略图",
    emoji: "📜",
    iconClass: "rose",
    difficulty: "hard",
    difficultyLabel: "挑战",
    tags: ["数论", "怀尔斯", "椭圆曲线"],
    era: "1637 断言；1995 证明完成",
    oneLiner: "n≥3 时 aⁿ+bⁿ=cⁿ 无正整数解；完整证明连接弗雷曲线与模性。",
    people: [
      { role: "断言", name: "费马", years: "1637" },
      { role: "n=4 无穷下降", name: "费马", years: "17 世纪" },
      { role: "完全证明", name: "安德鲁·怀尔斯", years: "1995" }
    ],
    related: ["euclid-primes", "fta-arith", "godel"],
    sections: {
      story: `
        <p>费马页边注成就了 350 年传奇。特例 n=4 可用无穷下降；一般 n 需要 20 世纪的椭圆曲线与模形式。怀尔斯证明了半稳定椭圆曲线的模性，从而推出费马大定理。</p>
      `,
      statement: `
        <div class="formula" data-latex="\\nexists\\, a,b,c\\in\\mathbb{Z}^{+},\\ n\\in\\mathbb{Z},\\ n\\ge 3\\ \\text{ s.t. }\\ a^n+b^n=c^n"></div>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">可化约到素指数</div>
          <p>若 n=km，aⁿ+bⁿ=cⁿ ⇒ (aᵏ)ᵐ+(bᵏ)ᵐ=(cᵏ)ᵐ。故只需对 n=4 与奇素数 p 证明。n=4 由费马完成；核心是奇素数 p。</p>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">定理（费马，n=4）纲要</div>
          <p>用无穷下降证明 a⁴+b⁴=c² 无正整数解（更强），从而 a⁴+b⁴=d⁴ 无解。思想：由一组解构造严格更小的正整数解，与「正整数无限下降」矛盾。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">弗雷曲线</div>
          <p>若 aᵖ+bᵖ=cᵖ 是非平凡解，可构造椭圆曲线 y² = x(x−aᵖ)(x+bᵖ)，具有极特殊的算术性质（极小判别式等）。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>n=4 下降</span><span>反例⇒弗雷曲线</span><span>模性⇒矛盾</span></div>
        <h3>第一部分：n=4 无穷下降（细节骨架）</h3>
        <ol class="steps">
          <li>研究更强方程 x⁴ + y⁴ = z²。设有正整数解，取 z 最小者。</li>
          <li>改写 x⁴ + y⁴ = z² 为 (z−x²)(z+x²)=y⁴ 或视为勾股型：z² − (x²)² = (y²)²，即 (z−x²)(z+x²)=y⁴。</li>
          <li>利用 gcd(z−x²,z+x²) 整除 2x² 等的精细互素分析（标准数论教材有完整初等证明），可说明存在另一组更小的解 (x₁,y₁,z₁) 满足同型方程。</li>
          <li>与 z 最小矛盾 ⇒ 无解 ⇒ 费马 n=4 成立。</li>
        </ol>
        <h3>第二部分：奇素数的现代战略（怀尔斯）</h3>
        <ol class="steps">
          <li>反设奇素数 p 与正整数 a,b,c 互素满足 aᵖ+bᵖ=cᵖ。</li>
          <li>弗雷（1986 思想）：关联椭圆曲线 E：y²=x(x−aᵖ)(x+bᵖ)。E 是半稳定的，且其模形式对应物若存在会违反某些水平估计（里贝特后来证明：E 不可能是模的——「ε 猜想」/水平降低）。</li>
          <li>里贝特定理：若 E 模，则可降低水平推出矛盾 ⇒ 弗雷曲线非模。</li>
          <li>谷山–志村–韦伊猜想（模性猜想）说：有理数域上椭圆曲线都来自模形式。怀尔斯证明了<strong>半稳定</strong>情形（1995，与泰勒修补漏洞）。</li>
          <li>弗雷曲线半稳定 ⇒ 应是模的 ⇒ 与里贝特矛盾。</li>
          <li>故反例不存在。费马大定理成立。</li>
        </ol>
        <p class="qed">∎（现代路线的逻辑闭链；各黑盒为已证大定理）</p>
      `,
      deep: `
        <h3>「空白太小」真相</h3>
        <p>主流认为费马不可能拥有一般 n 的证明；他确实掌握 n=4。页边注更像对特例方法的过度自信。</p>
        <h3>为什么难</h3>
        <p>问题表述初等，但解空间受制于深刻的伽罗瓦表示与自守形式对应（朗兰兹纲领的一角）。</p>
      `,
      why: `
        <p>推动椭圆曲线、模形式、伽罗瓦表示数十年发展；展示「翻译问题」的力量。</p>
      `,
      try: `
        <ul>
          <li>验证小范围内 n=3 无解（计算机搜索仅作体验）。</li>
          <li>阅读 n=4 完整初等证明（任何初等数论书）。</li>
          <li>用自己的话复述：弗雷曲线如何把费马反例变成「非模椭圆曲线」。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 13. 代数基本定理
   * ========================================================= */
  {
    id: "fta",
    title: "代数基本定理",
    subtitle: "复多项式必有根——分析证明纲要",
    emoji: "🧩",
    iconClass: "",
    difficulty: "hard",
    difficultyLabel: "挑战",
    tags: ["代数", "复数", "高斯"],
    era: "高斯 1799 等",
    oneLiner: "次数 ≥1 的复系数多项式在 ℂ 上至少有一个根，并可完全一次因式分解。",
    people: [
      { role: "重要证明", name: "高斯", years: "1777–1855" },
      { role: "更早探索", name: "达朗贝尔、欧拉", years: "18 世纪" }
    ],
    related: ["euler-identity", "ivt", "ftc"],
    sections: {
      story: `
        <p>实数上 x²+1 无根；复数上每个非恒定多项式都有根。ℂ 因此是代数闭域——解多项式方程不必再扩张数系。</p>
      `,
      statement: `
        <p>设 p(z)=aₙzⁿ+…+a₀，aₙ≠0，n≥1，aᵢ∈ℂ。则存在 z₀∈ℂ，p(z₀)=0。进而 p(z)=aₙ(z−r₁)…(z−rₙ)。</p>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理 1（模长趋于无穷）</div>
          <p>|z|→∞ 时 |p(z)|→∞。因 |p(z)| ≥ |aₙ| |z|ⁿ (1 − C/|z| − …) 对大 |z| 成立。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">引理 2（最小值存在）</div>
          <p>|p| 连续，在足够大的闭圆盘上达到最小值；由引理 1 最小值不会只在边界外逃逸，故 |p| 在 ℂ 上达到全局最小。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>最小模</span><span>若非零则局部可降</span><span>矛盾</span></div>
        <ol class="steps">
          <li>由引理 2，存在 z₀ 使 |p(z₀)| 最小。</li>
          <li>若 p(z₀)=0，完毕。反设 p(z₀)≠0。</li>
          <li>写 p(z₀+w)=p(z₀) + bₖ wᵏ + 高阶项，其中 bₖ≠0 是第一个非零系数（k≥1）。</li>
          <li>选择方向 θ 使 bₖ (re^{iθ})ᵏ 与 p(z₀) 反向，即
            <div class="calc-line" data-latex="b_{k} e^{ik\\theta } / |b_{k}| = - p(z_{0})/|p(z_{0})|"></div>
            取 w = r e^{iθ}，r 充分小，则
            <div class="calc-line" data-latex="p(z_{0}+w) = p(z_{0}) ( 1 - c r^{k} + o(r^{k}) )"></div>
            其中 c>0，从而 |p(z₀+w)| &lt; |p(z₀)|。
          </li>
          <li>与最小性矛盾。故 p(z₀)=0。</li>
          <li>用多项式除法提出 (z−z₀)，对次数归纳得完全分解。</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>拓扑证明一句话</h3>
        <p>对大 R，z↦p(z)/|p(z)| 把 |z|=R 映到单位圆且度数为 n≥1，故不能延拓到圆盘内无零点的连续映射——否则度数应为 0。</p>
        <h3>与实系数</h3>
        <p>实系数多项式的非实根成共轭对出现；奇次实多项式必有实根（IVT）。</p>
      `,
      why: `
        <p>线性代数特征多项式、控制论极点、信号与系统——默认在 ℂ 上分解。</p>
      `,
      try: `
        <ul>
          <li>对 p(z)=z²+1 指出最小值点 z=±i。</li>
          <li>用归纳法：有一根后如何整除降次。</li>
          <li>说明为何「实系数 + 奇次 ⇒ 实根」比 FTA 弱但初等。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 14. 鸽巢
   * ========================================================= */
  {
    id: "pigeonhole",
    title: "鸽巢原理",
    subtitle: "存在性证明的瑞士军刀（加强形式）",
    emoji: "🕊️",
    iconClass: "green",
    difficulty: "easy",
    difficultyLabel: "入门",
    tags: ["组合", "离散", "狄利克雷"],
    era: "19 世纪明确；思想古老",
    oneLiner: "物体比盒子多，必有盒子挤了至少 ⌈m/n⌉ 个——不必指出是哪一个。",
    people: [
      { role: "数论中系统使用", name: "狄利克雷", years: "1805–1859" }
    ],
    related: ["euclid-primes", "crt", "four-color"],
    sections: {
      story: `
        <p>看似常识，却能推出生日悖论型结论、丢番图逼近、图论拉姆齐的玩具情形。精髓是：用计数强迫结构出现。</p>
      `,
      statement: `
        <p><strong>基本形式：</strong>n+1 物入 n 盒 ⇒ 某盒 ≥2 物。</p>
        <p><strong>加强：</strong>m 物入 n 盒 ⇒ 某盒 ≥ ⌈m/n⌉ 物。</p>
        <p><strong>无穷版：</strong>无穷物入有限盒 ⇒ 某盒无穷物。</p>
      `,
      proof: `
        <div class="proof-nav"><span>反证</span><span>加强用求和</span></div>
        <h3>基本形式</h3>
        <ol class="steps">
          <li>反设每盒 ≤1 物 ⇒ 总物 ≤n，与有 n+1 物矛盾。</li>
        </ol>
        <h3>加强形式</h3>
        <ol class="steps">
          <li>反设每盒 ≤ ⌈m/n⌉ − 1 ≤ m/n 的某整数上界。更干净：设每盒 ≤ k−1，而 k=⌈m/n⌉，则总物 ≤ n(k−1)。</li>
          <li>因 k−1 &lt; m/n，有 n(k−1) &lt; m，与总物 =m 矛盾。</li>
          <li>故某盒 ≥k=⌈m/n⌉。</li>
        </ol>
        <p class="qed">∎</p>
        <h3>典型应用：狄利克雷逼近（细节）</h3>
        <ol class="steps">
          <li>设 α 实数。考虑 {0·α}, {1·α}, …, {n·α} 的小数部分，落入 n 个区间 [0,1/n),[1/n,2/n),…。</li>
          <li>有 n+1 个数、n 个间隔 ⇒ 某两 j&gt;i 落入同一间隔，| (j−i)α − 整数 | &lt; 1/n。</li>
          <li>令 q=j−i≤n，则存在 p 使 |α−p/q| &lt; 1/(q n) ≤ 1/q²。</li>
        </ol>
      `,
      deep: `
        <h3>应用：同一子集和</h3>
        <p>从 {1,…,2n} 取 n+1 个数，必有两数互素？（不一定用鸽巢直接）— 经典：必有一数整除另一数：按「最大奇因数」分盒，有 n 个奇盒子 1,3,…,2n−1，n+1 个数必两数同盒，则相差 2 的幂倍，较大者被比较者整除关系可建立。</p>
      `,
      why: `
        <p>训练非构造性存在；算法下界、哈希碰撞都是同族思想。</p>
      `,
      try: `
        <ul>
          <li>证明：任意 6 人中 3 人两两相识或两两不相识（两色 K₆ 有单色三角）。</li>
          <li>袜子：黑白各无限，保证一双同色最少取 3；保证两双？</li>
          <li>完成上面狄利克雷逼近的数值例子 α=π，n=10。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 15. 哥德尔
   * ========================================================= */
  {
    id: "godel",
    title: "哥德尔不完备定理",
    subtitle: "自指、编码与不可证的真命题",
    emoji: "🪞",
    iconClass: "purple",
    difficulty: "hard",
    difficultyLabel: "挑战",
    tags: ["逻辑", "元数学", "基础"],
    era: "1931",
    oneLiner: "足够强的一致形式系统里，总有真而不可证的命题；系统不能内证自身一致性。",
    people: [
      { role: "证明", name: "库尔特·哥德尔", years: "1931" },
      { role: "背景纲领", name: "希尔伯特", years: "20 世纪初" }
    ],
    related: ["cantor", "fermat", "euclid-primes"],
    sections: {
      story: `
        <p>希尔伯特希望用有限公理一次搞定数学的完备与无矛盾。哥德尔证明：只要系统能表达基本算术且一致，就既不完备，也不能内证一致性。</p>
      `,
      statement: `
        <p><strong>第一定理：</strong>令 T 为递归可公理化、足够强（含鲁滨逊算术 Q 或 PA）、一致的理论。则存在语句 G，T ⊬ G 且 T ⊬ ¬G；在标准模型中 G 为真。</p>
        <p><strong>第二定理：</strong>若 T 还满足某些可证性条件，则 T ⊬ Con(T)（Con(T) 表达「T 一致」）。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">哥德尔编码</div>
          <p>把符号、公式、证明序列编成自然数。谓词 Proof_T(y,x)：「y 是语句 x 的一个 T-证明」可写成算术公式。</p>
          <p>Provable_T(x) ≔ ∃y Proof_T(y,x)。</p>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">对角线引理（不动点引理）</div>
          <p>对任意公式 φ(x)，存在语句 ψ 使 T ⊢ ψ ↔ φ(⌜ψ⌝)，其中 ⌜ψ⌝ 是 ψ 的编码。</p>
          <p>思想：构造「把自身代入」的公式，实现受控自指。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>构造 G</span><span>不可证</span><span>真理性</span><span>第二定理</span></div>
        <h3>第一定理（细节纲要）</h3>
        <ol class="steps">
          <li>用对角线引理于 φ(x)=¬Provable_T(x)，得到 G 满足
            <div class="calc-line" data-latex="T \\vdash G \\leftrightarrow \\neg Provable_T(\\ulcorner G\\urcorner )"></div>
            即 G 说：「G 不可证。」
          </li>
          <li><strong>T ⊬ G：</strong>若有证明，则 G 可证 ⇒ 由 G 的意义 G 假；但一致的 T 只证真语句（更形式：若 T⊢G，则 ℕ⊨Provable(⌜G⌝)，与 G 的等价矛盾）。标准形式化：若 T⊢G，则存在证明码，算术可证 Provable(⌜G⌝)，再与 G↔¬Provable 推出 T 不一致。</li>
          <li><strong>T ⊬ ¬G：</strong>在 T 一致（实际需 ω-一致或后续罗瑟改进为简单一致）的假设下，¬G 也不可证。罗瑟句用「没有比某证明更小的反证」避开 ω-一致。</li>
          <li>因 T ⊬ G，故「G 不可证」为真，而 G 正表达此事 ⇒ G 真。</li>
        </ol>
        <h3>第二定理纲要</h3>
        <ol class="steps">
          <li>形式化第一定理的推理：T ⊢ Con(T) → G。</li>
          <li>若 T⊢Con(T)，则 T⊢G，与第一定理矛盾。</li>
          <li>故 T ⊬ Con(T)。</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>罗瑟改进</h3>
        <p>只需简单一致性，不必 ω-一致性：用「不存在更小编号的 ¬G 证明」构造罗瑟句。</p>
        <h3>与停机问题</h3>
        <p>图灵：不存在算法判定任意程序是否停机。证明也用对角自指。两者共同划定「形式/算法」边界。</p>
        <div class="warn-box">不完备 ≠ 数学无用。它限制的是「单一形式系统包打天下」的野心。</div>
      `,
      why: `
        <p>逻辑、计算机科学、科学哲学的分水岭；理解「可证」与「真」的裂隙。</p>
      `,
      try: `
        <ul>
          <li>用自然语言模拟：卡片写「本卡片上的句子在本系统内不可证」。</li>
          <li>区分：不完备 / 不一致 / 不可判定。</li>
          <li>了解：加法理论 Presburger 是完备可判定的——「足够强」不可少。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 16. 布劳威尔
   * ========================================================= */
  {
    id: "brouwer",
    title: "布劳威尔不动点定理",
    subtitle: "连续自映射必有定点",
    emoji: "☕",
    iconClass: "warm",
    difficulty: "hard",
    difficultyLabel: "挑战",
    tags: ["拓扑", "不动点", "应用"],
    era: "1910 年代",
    oneLiner: "闭圆盘到自身的连续映射至少固定一点；证明可用无回缩定理。",
    people: [
      { role: "证明", name: "布劳威尔", years: "1881–1966" }
    ],
    related: ["ivt", "euler-polyhedron", "four-color"],
    sections: {
      story: `
        <p>搅咖啡、揉地图、经济均衡——连续地把一个「实心圆」揉进自己，必有一点不动。高维与凸紧集版本支撑博弈论中的纳什存在性。</p>
      `,
      statement: `
        <p>设 Dⁿ = {x∈ℝⁿ : |x|≤1}。若 f:Dⁿ→Dⁿ 连续，则存在 x* 使 f(x*)=x*。</p>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">无回缩定理</div>
          <p>不存在连续映射 r:Dⁿ→S^{n−1}=∂Dⁿ 使 r|S^{n−1} = id。（圆盘不能连续缩到边界且边界点不动。）</p>
          <p>一维即：不存在连续 r:[−1,1]→{−1,1} 在端点为恒等——与 IVT 冲突。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>反设无不动点</span><span>造回缩</span><span>矛盾</span></div>
        <ol class="steps">
          <li>反设对所有 x，f(x)≠x。</li>
          <li>对每个 x，作射线：从 f(x) 出发穿过 x（因不同点，方向唯一），继续延伸与球面 S^{n−1} 交于 r(x)。</li>
          <li>几何上 r(x) = 解方程 f(x) + t(x−f(x)) 落在球面上的适当 t≥1。公式可显式写出，连续性由 f 连续与分母 |x−f(x)|≠0 保证。</li>
          <li>若 x 已在边界，则 r(x)=x（射线从内部点 f(x) 穿过边界点 x，交点即 x）。</li>
          <li>于是 r:Dⁿ→S^{n−1} 是连续回缩，与引理矛盾。</li>
          <li>故存在不动点。</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>一维即 IVT</h3>
        <p>f:[a,b]→[a,b] 连续。看 g(x)=f(x)−x，g(a)≥0，g(b)≤0，IVT ⇒ g(c)=0。</p>
        <h3>代数拓扑证明</h3>
        <p>若无不动点则造回缩 ⇒ 诱导同调/同伦群上 id:H_{n−1}(S^{n−1})→H_{n−1}(S^{n−1}) 经过 H_{n−1}(Dⁿ)=0，矛盾。</p>
        <h3>卡库塔尼</h3>
        <p>上半连续的凸值对应也有不动点——用于纳什均衡。</p>
      `,
      why: `
        <p>存在性定理的拓扑引擎；经济、博弈、微分方程周期解。</p>
      `,
      try: `
        <ul>
          <li>在一维上用 g=f−x 写完整证明。</li>
          <li>举反例：开圆盘 (0,1) 上 f(x)=x/2 有不动点，但 f(x)=x/2+1/2 把 (0,1) 映入自身？检查条件「闭」为何必要：开区间 (0,1) 上 f(x)=x/2 有不动点 0 但不在开区间——改 f(x)=x/2 不动点 0∉(0,1)；f(x)=x/2 其实 0 是不动点但不在定义域。更好反例：f:(0,1)→(0,1)，f(x)=x/2 无不动点。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 17. 中国剩余定理
   * ========================================================= */
  {
    id: "crt",
    title: "中国剩余定理",
    subtitle: "构造解 + 唯一性的完整证明",
    emoji: "🧮",
    iconClass: "green",
    difficulty: "medium",
    difficultyLabel: "进阶",
    tags: ["数论", "中国古代", "算法"],
    era: "《孙子算经》；高斯等系统化",
    oneLiner: "两两互素模下，余数组唯一决定模乘积类中的整数；并给出显式公式。",
    people: [
      { role: "经典问题", name: "《孙子算经》", years: "约 3–5 世纪" },
      { role: "系统化", name: "秦九韶、欧拉、高斯", years: "中世纪–近代" }
    ],
    related: ["fta-arith", "euclid-primes", "pigeonhole"],
    sections: {
      story: `
        <p>「三三数之剩二，五五数之剩三，七七数之剩二」——CRT 给出一般构造。现代计算机用它把大整数运算拆到小模上。</p>
      `,
      statement: `
        <p>m₁,…,mₖ 两两互素，M=∏mᵢ。则对任意 aᵢ，方程组 x≡aᵢ (mod mᵢ) 在模 M 下恰有一解。</p>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理（逆元存在）</div>
          <p>若 gcd(a,m)=1，则存在 y 使 ay≡1 (mod m)。由贝祖 ax+my=1。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">引理（两两互素 ⇒ 与乘积互素）</div>
          <p>gcd(mᵢ, M/mᵢ)=1。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>构造</span><span>验证</span><span>唯一性</span></div>
        <ol class="steps">
          <li>令 Mᵢ = M/mᵢ。由引理 gcd(Mᵢ,mᵢ)=1，取 yᵢ 使 Mᵢ yᵢ ≡ 1 (mod mᵢ)。</li>
          <li>令
            <div class="calc-line" data-latex="x_{0} = \\sum_{i=1}^k a_{i} M_{i} y_{i}"></div>
          </li>
          <li><strong>验证：</strong>固定 j。对 i≠j，mⱼ | Mᵢ（因 Mᵢ 含 mⱼ），故 aᵢ Mᵢ yᵢ ≡0 (mod mⱼ)。而 aⱼ Mⱼ yⱼ ≡ aⱼ ·1 (mod mⱼ)。故 x₀≡aⱼ (mod mⱼ)。</li>
          <li><strong>唯一性：</strong>若 x,x' 都是解，则 mᵢ|(x−x') 对一切 i。因两两互素，M|(x−x')（可逐步：m₁m₂|差，再乘上去）。故模 M 同类。</li>
        </ol>
        <p class="qed">∎</p>
        <h3>孙子题计算</h3>
        <div class="calc-line" data-latex="m=3,5,7； a=2,3,2； M=105"></div>
        <div class="calc-line" data-latex="M_{1}=35, y_{1}=2 \\text{因} 35\\cdot 2=70\\equiv 1 (mod 3)"></div>
        <div class="calc-line" data-latex="M_{2}=21, y_{2}=1 \\text{因} 21\\equiv 1 (mod 5)"></div>
        <div class="calc-line" data-latex="M_{3}=15, y_{3}=1 \\text{因} 15\\equiv 1 (mod 7)"></div>
        <div class="calc-line" data-latex="x=2\\cdot 35\\cdot 2 + 3\\cdot 21\\cdot 1 + 2\\cdot 15\\cdot 1 = 140+63+30=233 \\equiv 23 (mod 105)"></div>
      `,
      deep: `
        <h3>模不互素时</h3>
        <p>x≡a (mod m)，x≡b (mod n) 有解 ⇔ a≡b (mod gcd(m,n))。解模 lcm(m,n) 唯一。</p>
        <h3>环论表述</h3>
        <p>ℤ/Mℤ ≅ ℤ/m₁ℤ × … × ℤ/mₖℤ（两两互素时）。</p>
      `,
      why: `
        <p>历法、密码实现、编码、并行算术。</p>
      `,
      try: `
        <ul>
          <li>手算孙子题得 23，并验证三个余数。</li>
          <li>解 x≡1 (mod 4)，x≡2 (mod 3)，x≡3 (mod 5)。</li>
          <li>举互不素无解之例：x≡1 (mod 4)，x≡0 (mod 6)。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 18. 挂谷猜想 ★ 新增重点
   * ========================================================= */
  {
    id: "kakeya",
    title: "挂谷猜想（贝西科维奇集）",
    subtitle: "针可以挤进零测度，却挤不掉满维数",
    emoji: "📍",
    iconClass: "rose",
    difficulty: "hard",
    difficultyLabel: "挑战",
    tags: ["几何测度论", "调和分析", "前沿"],
    era: "1917 转针问题；1919 零面积构造；维数猜想；2025 三维突破",
    oneLiner: "含所有方向单位线段的集合测度可为 0，但 Hausdorff 维数必须等于空间维数；二维已证，三维由王虹–Zahl 证明。",
    people: [
      { role: "转针问题", name: "挂谷宗一", years: "1917" },
      { role: "零测度构造", name: "贝西科维奇", years: "1919 / 1920s" },
      { role: "二维维数", name: "Davies；Córdoba 等", years: "1970s" },
      { role: "三维维数猜想", name: "王虹、Joshua Zahl", years: "2025 证明" }
    ],
    related: ["euler-polyhedron", "cantor", "four-color"],
    sections: {
      story: `
        <p>挂谷问：单位线段在平面内转一圈，扫过面积最小多少？贝西科维奇证明：若只要求「每个方向有一根针」（不必连续转动），面积可以任意小甚至为 0。于是问题升级：零测度集合能否「维数也很低」？</p>
        <p><strong>挂谷集猜想</strong>回答：不能。针的方向若要齐全，集合在维数意义上必须「撑满」全空间。二维早已解决；三维在 2025 年由王虹与 Zahl 证明，是几何测度论的重大突破。</p>
        <div class="fun-box"><strong>易混点：</strong>「转针问题」与「挂谷集维数猜想」不是同一题。现在常说的挂谷猜想通常指<strong>维数猜想</strong>。</div>
      `,
      statement: `
        <div class="def-box">
          <div class="def-title">定义：挂谷集 / 贝西科维奇集</div>
          <p>集合 <span data-latex="K\\subset\\mathbb{R}^n">K</span> 叫挂谷集，意思是：每个方向都有一根长为 1 的针躺在里面。</p>
          <div class="formula" data-latex="\\forall\\,\\omega\\in S^{n-1},\\ \\exists\\,x\\in\\mathbb{R}^n:\\quad \\{x+t\\omega:0\\le t\\le 1\\}\\subset K"></div>
        </div>
        <p><strong>贝西科维奇（平面）：</strong>存在平面挂谷集，面积（勒贝格测度）可以是 0。</p>
        <div class="formula" data-latex="\\exists\\,K\\subset\\mathbb{R}^2:\\ K\\text{ 是挂谷集且 }|K|=0"></div>
        <p><strong>挂谷集猜想：</strong>挂谷集的维数必须等于空间维数（可以没面积，但不能「更瘦」）。</p>
        <div class="formula" data-latex="K\\text{ 挂谷集 }\\Rightarrow\\ \\dim_H K = n"></div>
        <p><strong>已证情况：</strong><span data-latex="n=1">n=1</span> 平凡；<span data-latex="n=2">n=2</span> 上世纪 70 年代；<span data-latex="n=3">n=3</span> 约 2025 年。更高维仍有开放部分。</p>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">细管语言</div>
          <p>把方向 <span data-latex="\\omega">ω</span> 上的单位线段加粗成宽度 <span data-latex="\\delta">δ</span> 的细管 <span data-latex="T_\\omega">T_ω</span>。关心：方向网很密时，并集体积相对 <span data-latex="\\delta">δ</span> 掉得多快。</p>
          <div class="formula" data-latex="\\Bigl|\\bigcup_\\omega T_\\omega\\Bigr|\\ \\text{ 随 }\\delta\\to 0\\text{ 如何变小}"></div>
          <p>若体积大约像 <span data-latex="\\delta^{n-d}">δ^{n-d}</span>，就对应「维数约 d」的信息。</p>
        </div>
        <div class="def-box">
          <div class="def-title">Hausdorff 维数（直觉）</div>
          <p>用边长约 <span data-latex="\\varepsilon">ε</span> 的小球去盖住集合，大约需要 <span data-latex="N(\\varepsilon)">N(ε)</span> 个。看代价 <span data-latex="N(\\varepsilon)\\,\\varepsilon^{s}">N(ε)·ε^s</span> 在 <span data-latex="\\varepsilon\\to 0">ε→0</span> 时还能不能有限——临界的 <span data-latex="s">s</span> 就是维数。</p>
          <div class="formula" data-latex="\\text{曲线 }s=1,\\quad \\text{面片 }s=2,\\quad \\text{康托集可取中间值}"></div>
        </div>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理 A（二维管重叠）</div>
          <p>平面上两根长 1、宽 <span data-latex="\\delta">δ</span>、夹角 <span data-latex="\\theta">θ</span> 的细管，重叠面积大约：</p>
          <div class="formula" data-latex="|T_1\\cap T_2|\\ \\lesssim\\ \\dfrac{\\delta^{2}}{\\sin\\theta}"></div>
          <p>角张得越大，黄重叠区越小——两根针「交于一点附近」。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">引理 B（Córdoba 型 L² 思想）</div>
          <p>方向散开的细管族，用 <span data-latex="f=\\sum_i 1_{T_i}">f=∑ 1_T</span> 衡量重叠。大致有：</p>
          <div class="formula" data-latex="\\int f^{2}\\ =\\ \\sum_{i,j}|T_i\\cap T_j|\\ \\lesssim\\ \\text{（由夹角控制）}"></div>
          <p>再配合柯西不等式，就能推出「并集不能太小」。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>零测度构造思想</span><span>二维维数：管估计</span><span>三维现状</span></div>

        <h3>一、平面上面积可为 0（贝西科维奇–Perron 树思想）</h3>
        <ol class="steps">
          <li><strong>基本积木：</strong>一个三角形包含「一小撮」方向上的单位段（从顶点射出的线段方向落在对边所张的角度内）。</li>
          <li><strong>二分滑动：</strong>把底边二等分，得到两个窄三角形，方向各覆盖原角度的一半。将两者平移，使底侧重叠尽量多，而顶角方向仍保留。</li>
          <li>面积：每次滑动后并集面积可严格小于原面积（重叠区只算一次）。对任意 ε>0，有限步后可构造「包含一个角度区间内所有方向的单位段」且面积 &lt;ε 的集合。</li>
          <li><strong>铺满圆周：</strong>把 [0,π) 方向分成许多小角度块，每块用上述构造，再把这些「刺」适当安放（可再重叠）。可使总面积任意小，同时每个方向都有单位段。</li>
          <li><strong>取极限：</strong>取面积 &lt;1/n 的挂谷集 K_n 的合适对角线极限 / 闭包操作，得到测度 0 的挂谷集。（严格写法需注意极限仍含各方向段：常用「对每个有理方向保留，再闭包」或一致估计。）</li>
        </ol>
        <div class="idea-box"><strong>要点：</strong>圆环装不下所有方向；真正机制是<strong>大量不同方向的细针高度重叠</strong>。</div>

        <h3>二、二维维数必须为 2（Davies / Córdoba 路线的可讲细节）</h3>
        <ol class="steps">
          <li>设 K 为平面挂谷集。要证 dim_H K=2。等价地：对任意 s&lt;2，s 维 Hausdorff 测度在 K 上「不能太小」的否定形式——通常改证 Minkowski 维数 ≥2：δ-邻域面积不能比 δ^{2−s} 衰减得更快（s&lt;2）。</li>
          <li><strong>离散化：</strong>取 δ&gt;0。在半圆周上取约 1/δ 个方向 ω_j，使相邻夹角约 δ。对每个方向取一根含于 K 的 δ-管 T_j（线段的 δ 邻域）。则 ⋃ T_j ⊂ K_δ（K 的 δ 邻域）。</li>
          <li><strong>目标：</strong>证明 |⋃ T_j| ≳ 1 / log(1/δ) 或至少 ≫ δ^ε（对任意 ε，当 δ→0）——经典结果是 |⋃ T_j| ≳ 1/log(1/δ)，已迫使 Minkowski 维数 =2。</li>
          <li><strong>L² 计算：</strong>令 f = ∑_j 1_{T_j}。则 ∫ f = ∑ |T_j| ≍ ∑ δ ·1 ≍ 1（约 1/δ 根管，每根面积 ≍δ）。</li>
          <li>∫ f² = ∑_j ∑_k |T_j ∩ T_k|。当 j=k，|T_j|≍δ；当 j≠k，夹角 θ_{jk}≳δ·|j−k|，由引理 A，|T_j∩T_k| ≲ δ² / θ_{jk}。</li>
          <li>对固定 j 对 k 求和：∑_{k≠j} δ²/θ_{jk} ≲ δ² · ∑_{m=1}^{1/δ} 1/(mδ) ≲ δ · log(1/δ)。再乘管子数 1/δ，得 ∫f² ≲ log(1/δ)。</li>
          <li>由柯西–施瓦茨：
            <div class="calc-line" data-latex="\\Bigl(\\int f\\Bigr)^{2}\\ \\le\\ \\bigl|\\bigcup T_j\\bigr|\\cdot\\int f^{2}"></div>
            于是得到
            <div class="calc-line" data-latex="\\bigl|K_{\\delta}\\bigr|\\ \\gtrsim\\ \\dfrac{1}{\\log(1/\\delta)}"></div>
          </li>
          <li>若 dim_M K ≤ s &lt;2，则 |K_δ| ≲ δ^{2−s}，右边当 δ→0 比任何 1/log 更快趋于 0，矛盾。故 dim_M K=2，从而 dim_H K=2。</li>
        </ol>
        <p class="qed">∎（二维维数部分的标准 L² 纲要）</p>

        <h3>三、三维为何陡然变难（思想，非完整证明）</h3>
        <ol class="steps">
          <li>三维中两根管可以几乎平行地「粘」很久，重叠体积可以很大；也可以异面而过重叠很小。仅用两两夹角不够。</li>
          <li>经典进展：Wolff 牙刷（hairbrush）论证——固定一根「柄」管，看穿过它的许多管形成的「刷子」体积；得到维数 ≥5/2 等。</li>
          <li>「粘性」（sticky）情形：管的方向与位置强相关，最难处理。王虹–Zahl 的工作对 sticky 情形与迭代/多尺度分析作出突破，最终得到三维满维数。</li>
          <li>完整论文很长（百余页级），此处只强调：<strong>逻辑目标仍是管并集体积的下界</strong>，但需要的几何组合远超二维。</li>
        </ol>
      `,
      deep: `
        <h3>与调和分析的联系</h3>
        <p>限制猜想、Bochner–Riesz 平均、Kakeya 最大函数猜想彼此纠缠。费弗曼曾用挂谷集说明球乘子在 p≠2 时的失败。挂谷维数若过低，会摧毁一批傅里叶分析不等式；维数满则与「可能成立」的分析猜想兼容。</p>
        <h3>常见错误图像</h3>
        <ul>
          <li>「无限大无限薄圆环面积 0」：圆环不含所有方向的单位段（径向段装不下），且圆周本身无线段。</li>
          <li>把「转针最小面积」与「维数猜想」混为一谈。</li>
        </ul>
        <h3>二维结果历史</h3>
        <p>Davies (1971) 证明平面挂谷集 Hausdorff 维数 2；Córdoba 给出基于管与 L² 的漂亮论证，与上文纲要一致。</p>
      `,
      why: `
        <p>它是几何测度论与傅里叶分析的交汇点；三维的解决展示了现代多尺度几何的力量，也启发更高维与相关分析猜想。</p>
      `,
      try: `
        <ul>
          <li>画一个三角形，标出它「覆盖」的方向角区间。</li>
          <li>用两张窄纸条交叉不同角度，观察重叠面积随夹角如何变。</li>
          <li>用自己的话解释：为何 |⋃T| ≳ 1/log(1/δ) 能推出维数是 2 而不是 1.9。</li>
          <li>思考：若所有管都几乎平行，并集可以很瘦——但那样<strong>方向不齐全</strong>，不是挂谷。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 19. AM-GM
   * ========================================================= */
  {
    id: "amgm",
    title: "算术–几何平均不等式",
    subtitle: "AM-GM：从归纳到凸性的完整初等证",
    emoji: "⚖️",
    iconClass: "green",
    difficulty: "medium",
    difficultyLabel: "进阶",
    tags: ["不等式", "分析", "优化"],
    era: "古代特例；柯西等系统化",
    oneLiner: "对正数，算术平均 ≥ 几何平均，等号当且仅当全部相等。",
    people: [
      { role: "经典初等证", name: "柯西等", years: "19 世纪教材传统" }
    ],
    related: ["mvt", "pythagoras", "basel"],
    sections: {
      story: `
        <p>固定周长的矩形何时面积最大？答案是正方形——这是 AM-GM 的几何影子。不等式是估计、优化、信息论的日用工具。</p>
      `,
      statement: `
        <p>对 x_i > 0，</p>
        <div class="formula" data-latex="\\dfrac{x_1+\\cdots+x_n}{n}\\ge (x_1\\cdots x_n)^{1/n}"></div>
        <p>等号 ⇔ x₁=…=xₙ。</p>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理（n=2）</div>
          <p>(√x−√y)²≥0 ⇒ x+y ≥ 2√(xy)。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>柯西向前向后归纳</span></div>
        <h3>柯西的「向前–向后」归纳</h3>
        <ol class="steps">
          <li><strong>n=2：</strong>由引理成立。</li>
          <li><strong>向前：</strong>若对 n=2^k 成立，则对 2^{k+1}：把 2^{k+1} 个数分成两半，各 2^k 个，
            <div class="calc-line" data-latex="A = (S_{1}+S_{2})/2 \\ge \\sqrt{G_{1} G_{2}}"></div>
            其中 S_i 是半组算术和/2^k 等——标准写法：
            <div class="calc-line" data-latex="(x_{1}+\\ldots +x_{2m})/(2m) \\ge \\sqrt{ [(x_{1}+\\ldots +x_m}/m] [(x_{m+1}+\\ldots )/m] ) \\ge \\sqrt{ (\\prod _{1}^{m}}^{1/m} (\\prod_{m+1}^{2m})^{1/m} ) = (\\prod \\text{全部})^{1/(2m)}"></div>
            对 m=2^k 用归纳假设。
          </li>
          <li>于是对所有 2 的幂成立。</li>
          <li><strong>向后：</strong>设对 n 成立，证 n−1。对正数 y₁,…,y_{n−1}，令
            <div class="calc-line" data-latex="y_n = (y_{1}+\\ldots +y_{n-1})/(n-1)"></div>
            为前 n−1 个的算术平均。对 n 个数用 AM-GM：
            <div class="calc-line" data-latex="( (n-1)y_n + y_n )/n \\ge (y_{1}\\ldots y_{n-1} y_n)^{1/n}"></div>
            即 y_n ≥ (y₁…y_{n−1} y_n)^{1/n}。两边 n 次方：y_n^n ≥ (∏₁^{n−1} y_i) y_n，故 y_n^{n−1} ≥ ∏₁^{n−1} y_i，即
            <div class="calc-line" data-latex="y_n \\ge (\\prod _{1}^{n-1} y_i)^{1/(n-1)}"></div>
            而 y_n 恰是左边 AM。得证。
          </li>
          <li>从 2 的幂向后可到达任何 n。</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>詹森不等式路径</h3>
        <p>log 凹（实为 concave）：(log x₁+…+log xₙ)/n ≤ log((x₁+…+xₙ)/n)，指数化即 AM-GM。</p>
        <h3>等号条件</h3>
        <p>每步 (√x−√y)²=0 或 log 严格凹 ⇒ 全部 x_i 相等。</p>
      `,
      why: `
        <p>最优形状、熵不等式、机器学习正则与经典估计的起点。</p>
      `,
      try: `
        <ul>
          <li>由 AM-GM 证：对 a,b>0，(a+b)/2 ≥ √(ab)，再推矩形周长固定时正方形面积最大。</li>
          <li>证 1·2·…·n ≤ ((n+1)/2)^n 的粗估计。</li>
          <li>用 n=3 直接展开验证。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 20. 巴塞尔问题
   * ========================================================= */
  {
    id: "basel",
    title: "巴塞尔问题",
    subtitle: "∑ 1/n² = π²/6 的傅里叶证明纲要",
    emoji: "π",
    iconClass: "purple",
    difficulty: "hard",
    difficultyLabel: "挑战",
    tags: ["分析", "傅里叶", "欧拉"],
    era: "1734 欧拉；严格化后继",
    oneLiner: "所有正整数平方倒数之和等于 π²/6——连接离散级数与圆周率。",
    people: [
      { role: "求解", name: "欧拉", years: "1734" },
      { role: "严格傅里叶路径", name: "后继分析学家", years: "19 世纪" }
    ],
    related: ["euler-identity", "ftc", "fta"],
    sections: {
      story: `
        <p>意大利巴塞尔的数学家关注 ∑1/n² 而久攻不克。欧拉给出 π²/6 的惊人答案。现代最清晰的课堂证明之一使用傅里叶级数。</p>
      `,
      statement: `
        <div class="formula" data-latex="\\sum_{n=1}^{\\infty}\\dfrac{1}{n^2}=\\dfrac{\\pi^2}{6}"></div>
      `,
      setup: `
        <div class="def-box">
          <div class="def-title">傅里叶系数</div>
          <p>f 在 [−π,π] 上分段光滑时，a₀/2 + ∑ (aₙ cos nx + bₙ sin nx)，
          aₙ=(1/π)∫_{−π}^π f cos nx dx 等。帕塞瓦尔：平均 |f|² 等于系数平方和。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>展开 f(x)=x</span><span>算系数</span><span>代入特殊点/帕塞瓦尔</span></div>
        <ol class="steps">
          <li>在 (−π,π) 上取 f(x)=x。则 f 为奇函数，aₙ=0，bₙ = (2/π) ∫_0^π x sin(nx) dx。</li>
          <li>分部积分：u=x，dv=sin(nx)dx，
            <div class="calc-line" data-latex="\\int_{0}^{\\pi } x sin(nx) dx = [-x cos(nx)/n]_0^\\pi + \\int_{0}^{\\pi } cos(nx)/n dx = -\\pi (-1)^n /n + 0"></div>
            更仔细：cos(nπ)=(−1)^n，故 −π cos(nπ)/n = −π(−1)^n /n；在 0 处为 0。∫ cos 项为 0 当 n≥1。
            实际上 ∫_0^π x sin nx dx = −(π/n)(−1)^n 的符号：cos(nπ)=(−1)^n，−x cos/n 在 π：−π(−1)^n /n。
            故 bₙ = (2/π)·[−π(−1)^n /n] = −2(−1)^n /n = 2(−1)^{n+1}/n。
          </li>
          <li>于是 x = ∑_{n=1}^∞ 2(−1)^{n+1} sin(nx)/n  在 (−π,π) 内。</li>
          <li>用帕塞瓦尔恒等式更直接：对 f(x)=x，
            <div class="calc-line" data-latex="(1/\\pi )\\int_{-\\pi }^\\pi x^{2} dx /2 \\text{的标准形式}： (1/\\pi )\\int_{-\\pi }^\\pi [f(x)]^{2} dx = 2\\sum b_{n}^{2} \\text{的约定版本}"></div>
            常用结论：∫_{−π}^π x² dx = 2π³/3，而系数给出 ∑ 4/n² 型关系。
          </li>
          <li><strong>课堂干净版：</strong>考虑 f(x)=x² 在 [−π,π]：
            <div class="calc-line" data-latex="a_{0} = (2/\\pi )\\int_{0}^{\\pi } x^{2} dx = 2\\pi ^{2}/3"></div>
            <div class="calc-line" data-latex="a_{n} = (2/\\pi )\\int_{0}^{\\pi } x^{2} cos(nx) dx = 4(-1)^n / n^{2}"></div>
            （两次分部积分。）
          </li>
          <li>傅里叶展开：x² = π²/3 + ∑_{n=1}^∞ 4(−1)^n cos(nx)/n²。</li>
          <li>令 x=π：π² = π²/3 + ∑ 4(−1)^n (−1)^n /n² = π²/3 + ∑ 4/n²。</li>
          <li>故 π² − π²/3 = 4 ∑ 1/n² ⇒ (2π²/3)=4 ∑1/n² ⇒ <strong>∑1/n² = π²/6</strong>。</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>欧拉的无穷乘积启发</h3>
        <p>欧拉类比 sin x /x = ∏ (1−x²/(n²π²))，比较 x² 系数得 ∑1/n²=π²/6。启发正确，严格性后补。</p>
        <h3>推广</h3>
        <p>∑1/n^{2k} 是 π^{2k} 的有理倍数（伯努利数）；奇数值 ζ(3) 的无理性到 1979 年阿佩里才证。</p>
      `,
      why: `
        <p>ζ 函数特殊值；傅里叶分析威力的招牌例子；随机游走回归等有隐藏联系。</p>
      `,
      try: `
        <ul>
          <li>用电脑对前 1000 项求和，与 π²/6 比较。</li>
          <li>完成 aₙ 的分部积分计算。</li>
          <li>由同样展开令 x=0 得 ∑ (−1)^{n+1}/n² = π²/12。</li>
        </ul>
      `
    }
  },

  /* =========================================================
   * 21. 皮克定理
   * ========================================================= */
  {
    id: "pick",
    title: "皮克定理",
    subtitle: "格点多边形的面积公式及证明",
    emoji: "🔷",
    iconClass: "warm",
    difficulty: "medium",
    difficultyLabel: "进阶",
    tags: ["几何", "组合", "格点"],
    era: "1899，Georg Pick",
    oneLiner: "简单格点多边形面积 = I + B/2 − 1，其中 I 内点、B 边界点。",
    people: [
      { role: "提出并证明", name: "格奥尔格·皮克", years: "1899" }
    ],
    related: ["euler-polyhedron", "pythagoras", "amgm"],
    sections: {
      story: `
        <p>在点阵纸上画多边形，顶点都在格点上。面积竟只由「里面有几个点、边界有几个点」决定——不必剪下来称重。皮克定理是欧拉公式在几何计数中的可爱后代。</p>
      `,
      statement: `
        <div class="formula" data-latex="\\operatorname{Area}(P)=I+\\dfrac{B}{2}-1"></div>
        <p>P 为简单（不自交）格点多边形；I=内部格点数，B=边界格点数（含顶点）。</p>
      `,
      lemmas: `
        <div class="lemma-box">
          <div class="lemma-title">引理 1（基本三角）</div>
          <p>若格点三角形内部无点、边界只有 3 个顶点（无其它边界点），则面积为 1/2。</p>
          <p>由叉积：顶点 (0,0),(a,b),(c,d) 时 Area=|ad−bc|/2，而无其它边界点 + 空内部 ⇔ |ad−bc|=1（Pick 或整数几何）。</p>
        </div>
        <div class="lemma-box">
          <div class="lemma-title">引理 2（可加性）</div>
          <p>若 P 分成 P₁,P₂ 沿公共格点折线，则 I,B,Area 满足可加关系使 Pick 表达式可加：证明公式对两块成立 ⇒ 对合并成立（边界点共享需仔细计）。</p>
        </div>
      `,
      proof: `
        <div class="proof-nav"><span>基本三角</span><span>剖分</span><span>欧拉核对</span></div>
        <ol class="steps">
          <li>把 P 剖分成面积 1/2 的基本格点三角形（可证明任何简单格点多边形都能这样剖分）。</li>
          <li>设有 T 个基本三角，则 Area = T/2。</li>
          <li>把剖分看成平面图：V = I+B 个格点顶点；面数 F = T + 1（含外部无限面）。</li>
          <li>每三角形 3 边，每内部棱算两次，边界棱算一次：3T = 2E_int + E_boundary。而 E = E_int + E_boundary。</li>
          <li>边界恰有 B 个格点 ⇒ 边界棱数 E_boundary = B（简单闭折线）。</li>
          <li>欧拉：V−E+F=2（含外面；对圆盘三角剖分 V−E+(T+1)=2 ⇒ V−E+T=1）。</li>
          <li>联立 3T = 2(E−B) + B = 2E − B，得 2E = 3T + B。代入欧拉：
            <div class="calc-line" data-latex="I+B - (3T+B)/2 + T = 1"></div>
            化简：I + B/2 − T/2 = 1 ⇒ T/2 = I + B/2 − 1。
          </li>
          <li>但 Area=T/2，故 Area = I + B/2 − 1。</li>
        </ol>
        <p class="qed">∎</p>
      `,
      deep: `
        <h3>例子</h3>
        <p>单位正方形：I=0,B=4，Area=0+2−1=1。对。</p>
        <p>3-4-5 直角三角形格点版需自己数 I,B。</p>
        <h3>高维</h3>
        <p>高维格点多面体体积不能仅由「内点边界点」如此简单给出（需 Ehrhart 理论）。</p>
      `,
      why: `
        <p>离散几何入门；计算几何、地理信息栅格近似的玩具模型。</p>
      `,
      try: `
        <ul>
          <li>在方格纸上画多边形，数 I,B，验证公式。</li>
          <li>证明：基本三角形面积必为 1/2（用 |det|=1）。</li>
          <li>若允许洞：公式变为 I+B/2−χ，χ 为示性数。</li>
        </ul>
      `
    }
  }
];
