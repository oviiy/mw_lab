/**
 * 再增一批著名定理（mw_lab / theorem-library）
 */
(function () {
  const T = (window.THEOREMS = window.THEOREMS || []);

  T.push(
    {
      id: "fermat-little",
      title: "费马小定理",
      subtitle: "质数模下的幂次循环",
      emoji: "🔐",
      iconClass: "green",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["数论", "密码学", "费马"],
      era: "1640 年费马提出；欧拉等给出证明",
      oneLiner: "p 是质数、a 不被 p 整除时，a 的 (p−1) 次方除以 p 余 1。",
      people: [
        { role: "提出", name: "皮埃尔·德·费马", years: "1640" },
        { role: "推广与证明", name: "欧拉等", years: "18 世纪" }
      ],
      related: ["euclid-primes", "crt", "fermat"],
      sections: {
        story: `
          <p>密码学、快速幂取模，经常碰到：质数当「模」时，幂次会乖乖循环。费马小定理就是这条规矩的最干净版本。</p>
          <div class="fun-box"><strong>和费马大定理区别：</strong>小定理是模运算小工具；大定理是 aⁿ+bⁿ=cⁿ 无正整数解，难了三百年。</div>
        `,
        statement: `
          <p><strong>费马小定理：</strong>若 p 为素数，a 为整数且 p 不整除 a，则</p>
          <div class="formula" data-latex="a^{p-1}\\equiv 1\\pmod{p}"></div>
          <p>也常写成（去掉「p 不整除 a」时多一个因子）：</p>
          <div class="formula" data-latex="a^{p}\\equiv a\\pmod{p}"></div>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">同余</div>
            <p><span data-latex="a\\equiv b\\pmod{p}">a≡b (mod p)</span> 表示 p 整除 a−b，也就是「除以 p 余数相同」。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">引理</div>
            <p>在模 p（素数）下，1,2,…,p−1 与 a,2a,…, (p−1)a 是同一批非零剩余的重排（因 a 有逆元）。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话版：</strong>把 1 到 p−1 每项乘 a，只是把这些余数重新排了一次，乘积一样；两边约掉相同部分，就剩下 a^{p−1}≡1。</p>
          <ol class="steps">
            <li>考虑 1,2,…,p−1。因 p 素且不整除 a，乘 a 后：a,2a,…, (p−1)a 在模 p 下仍是 1,…,p−1 的一个排列。</li>
            <li>两边连乘：
              <div class="calc-line" data-latex="1\\cdot 2\\cdots(p-1)\\ \\equiv\\ a\\cdot(2a)\\cdots((p-1)a)\\pmod{p}"></div>
            </li>
            <li>右边 = <span data-latex="a^{p-1}(p-1)!">a^{p−1}(p−1)!</span>，故
              <div class="calc-line" data-latex="(p-1)!\\ \\equiv\\ a^{p-1}(p-1)!\\pmod{p}"></div>
            </li>
            <li>p 不整除 (p−1)!，两边同乘逆元约掉，得 <span data-latex="a^{p-1}\\equiv 1\\pmod{p}">a^{p−1}≡1 (mod p)</span>。</li>
          </ol>
          <p class="qed">∎</p>
        `,
        deep: `
          <p>欧拉定理是推广：若 gcd(a,n)=1，则 a^{φ(n)}≡1 (mod n)。RSA 密码的指数运算就建立在这类同余结构上。</p>
        `,
        why: `
          <p>快速判断「是不是质数」的随机算法、公钥密码、竞赛数论的基本招。</p>
        `,
        try: `
          <ul>
            <li>p=7,a=3：算 3^6=729，729÷7 是否余 1。</li>
            <li>想一想：p 合数时定理为什么会失败？试 a=2,p=4。</li>
          </ul>
        `
      }
    },

    {
      id: "cauchy-schwarz",
      title: "柯西–施瓦茨不等式",
      subtitle: "点积不超过长度乘积",
      emoji: "⟨,⟩",
      iconClass: "",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["不等式", "线性代数", "分析"],
      era: "柯西 1821；布尼亚科夫斯基、施瓦茨推广",
      oneLiner: "两向量点积的绝对值，不会超过它们长度的乘积——角再斜也斜不过 180°。",
      people: [
        { role: "有限和形式", name: "柯西", years: "1821" },
        { role: "积分等形式", name: "施瓦茨等", years: "19 世纪" }
      ],
      related: ["amgm", "pythagoras", "mvt"],
      sections: {
        story: `
          <p>几何上：cos θ 的绝对值 ≤ 1，所以 |u·v| = |u||v||cos θ| ≤ |u||v|。分析、概率、机器学习里的内积估计，天天用这条。</p>
        `,
        statement: `
          <p>对实数 a_i,b_i：</p>
          <div class="formula" data-latex="\\Bigl(\\sum_{i=1}^n a_i b_i\\Bigr)^2 \\le \\Bigl(\\sum_{i=1}^n a_i^2\\Bigr)\\Bigl(\\sum_{i=1}^n b_i^2\\Bigr)"></div>
          <p>向量写法：</p>
          <div class="formula" data-latex="|\\langle u,v\\rangle|\\le \\|u\\|\\,\\|v\\|"></div>
          <p>等号 ⇔ 两向量线性相关（同向或反向）。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">内积与范数</div>
            <p><span data-latex="\\langle u,v\\rangle=\\sum a_i b_i">⟨u,v⟩=∑ a_i b_i</span>，<span data-latex="\\|u\\|=\\sqrt{\\langle u,u\\rangle}">‖u‖=√⟨u,u⟩</span>。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">二次函数判别式</div>
            <p>对任意实数 t，‖u−tv‖² ≥ 0，展开后看成 t 的二次式，判别式 ≤ 0。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话版：</strong>长度平方永远非负；用「滑动比例 t」去减另一向量，非负条件逼出点积上界。</p>
          <ol class="steps">
            <li>若 v=0，显然成立。下设 v≠0。</li>
            <li>对任意实数 t：
              <div class="calc-line" data-latex="0\\le \\|u-tv\\|^2=\\|u\\|^2-2t\\langle u,v\\rangle+t^2\\|v\\|^2"></div>
            </li>
            <li>这是关于 t 的二次函数，且永远 ≥0，故判别式 ≤0：
              <div class="calc-line" data-latex="(2\\langle u,v\\rangle)^2-4\\|v\\|^2\\|u\\|^2\\le 0"></div>
            </li>
            <li>化简得 <span data-latex="\\langle u,v\\rangle^2\\le\\|u\\|^2\\|v\\|^2">⟨u,v⟩² ≤ ‖u‖²‖v‖²</span>。</li>
          </ol>
          <p class="qed">∎</p>
        `,
        deep: `
          <p>积分版：⟨f,g⟩=∫fg 时同样成立（施瓦茨）。概率里 |E[XY]|² ≤ E[X²]E[Y²] 也是它。</p>
        `,
        why: `
          <p>几乎所有「用内积说话」的估计的起点：正交、投影、相关系数 |ρ|≤1。</p>
        `,
        try: `
          <ul>
            <li>取 n=2：验证 (a₁b₁+a₂b₂)² ≤ (a₁²+a₂²)(b₁²+b₂²)。</li>
            <li>由它推出 |cos θ|≤1 的坐标版。</li>
          </ul>
        `
      }
    },

    {
      id: "bayes",
      title: "贝叶斯定理",
      subtitle: "根据新证据更新判断",
      emoji: "🎲",
      iconClass: "warm",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["概率", "统计", "日常决策"],
      era: "贝叶斯 18 世纪；拉普拉斯发扬",
      oneLiner: "先有先验看法，再看新证据，用公式把「事后更信什么」算清楚。",
      people: [
        { role: "思想来源", name: "托马斯·贝叶斯", years: "约 1763 发表" },
        { role: "系统发展", name: "拉普拉斯等", years: "18–19 世纪" }
      ],
      related: ["pigeonhole", "ftc", "cantor"],
      sections: {
        story: `
          <p>验血阳性不一定有病——还要看这种病本来有多稀、假阳性有多高。贝叶斯公式就是「把原有判断 + 新证据」合成后验概率的规矩。</p>
          <div class="fun-box"><strong>生活：</strong>导航、推荐系统、垃圾邮件过滤、医学检验解读，全是贝叶斯更新。</div>
        `,
        statement: `
          <p>事件 A、B（P(B)>0）时：</p>
          <div class="formula" data-latex="P(A\\mid B)=\\dfrac{P(B\\mid A)\\,P(A)}{P(B)}"></div>
          <p>若 A 有多种互斥可能 A_i 覆盖全部情况：</p>
          <div class="formula" data-latex="P(A_i\\mid B)=\\dfrac{P(B\\mid A_i)P(A_i)}{\\sum_j P(B\\mid A_j)P(A_j)}"></div>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">条件概率</div>
            <p><span data-latex="P(A\\mid B)=P(A\\cap B)/P(B)">P(A|B)=P(A∩B)/P(B)</span>：已知 B 发生时 A 的概率。</p>
            <p><strong>先验</strong> P(A)：证据来之前的判断；<strong>后验</strong> P(A|B)：证据来之后的判断。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">乘法公式</div>
            <p><span data-latex="P(A\\cap B)=P(B\\mid A)P(A)=P(A\\mid B)P(B)">P(A∩B)=P(B|A)P(A)=P(A|B)P(B)</span>。贝叶斯只是把两种写法对一下。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话版：</strong>联合概率可以两种顺序拆；拆完移项就是贝叶斯。</p>
          <ol class="steps">
            <li>由定义：<span data-latex="P(A\\cap B)=P(A\\mid B)P(B)">P(A∩B)=P(A|B)P(B)</span>。</li>
            <li>又有：<span data-latex="P(A\\cap B)=P(B\\mid A)P(A)">P(A∩B)=P(B|A)P(A)</span>。</li>
            <li>两边相等：<span data-latex="P(A\\mid B)P(B)=P(B\\mid A)P(A)">P(A|B)P(B)=P(B|A)P(A)</span>。</li>
            <li>P(B)>0 时两边除以 P(B)，得贝叶斯公式。</li>
          </ol>
          <p class="qed">∎</p>
        `,
        deep: `
          <p><strong>经典坑：</strong>疾病患病率 0.1%，检测真阳性 99%、假阳性 1%。测出阳性时，真有病的概率往往只有约 9%，不是 99%。请用全概率公式算一遍分母。</p>
        `,
        why: `
          <p>所有「根据数据更新信念」的数学骨架。统计学习、A/B 测试、AI 里的生成模型，都听得到它的回声。</p>
        `,
        try: `
          <ul>
            <li>算上面「罕见病检测」的后验概率。</li>
            <li>两枚硬币：一枚公平、一枚双面花。随机摸一枚掷出花，是双面花硬币的概率？</li>
          </ul>
        `
      }
    },

    {
      id: "binomial",
      title: "二项式定理",
      subtitle: "(a+b)ⁿ 怎么展开",
      emoji: "➕",
      iconClass: "green",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["代数", "组合", "必学经典"],
      era: "古代有特例；牛顿推广到一般指数",
      oneLiner: "(a+b) 的 n 次方，等于各项 C(n,k) a^{n−k} b^k 加起来。",
      people: [
        { role: "一般形式与系数", name: "帕斯卡、牛顿等", years: "17 世纪前后系统化" }
      ],
      related: ["pythagoras", "amgm", "fermat-little"],
      sections: {
        story: `
          <p>展开 (a+b)²=a²+2ab+b²、立方… 系数正好是杨辉三角（帕斯卡三角）那一行。二项式定理一次说清所有 n。</p>
        `,
        statement: `
          <p>对正整数 n：</p>
          <div class="formula" data-latex="(a+b)^n=\\sum_{k=0}^{n}\\binom{n}{k}a^{n-k}b^{k}"></div>
          <p>其中组合数 <span data-latex="\\binom{n}{k}=\\dfrac{n!}{k!(n-k)!}">C(n,k)=n!/(k!(n−k)!)</span>。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">组合意义</div>
            <p><span data-latex="\\binom{n}{k}">C(n,k)</span>：从 n 个因子里选 k 个贡献 b、其余贡献 a 的方式数。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">帕斯卡恒等式</div>
            <div class="calc-line" data-latex="\\binom{n}{k}=\\binom{n-1}{k}+\\binom{n-1}{k-1}"></div>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话版：</strong>(a+b)…(a+b) 共 n 份，每一份从 a 或 b 里挑一个相乘；挑了 k 次 b 的项系数就是 C(n,k)。</p>
          <ol class="steps">
            <li>把 (a+b)^n 看成 n 个括号 (a+b)(a+b)…(a+b)。</li>
            <li>展开时每一项来自：每个括号选 a 或 b，再相乘。</li>
            <li>若恰好选了 k 次 b（因而 n−k 次 a），该项为 a^{n−k}b^k，出现次数 = 从 n 个括号选 k 个给 b 的方法数 = C(n,k)。</li>
            <li>对 k 从 0 到 n 求和，即得定理。</li>
          </ol>
          <p class="qed">∎（组合证明）</p>
          <p>也可用数学归纳 + 帕斯卡恒等式证明。</p>
        `,
        deep: `
          <p>牛顿把指数推广到实数/复数，得到无穷级数（|x| 小时 (1+x)^α 的展开），是微积分的基本工具。</p>
        `,
        why: `
          <p>概率二项分布、代数变形、近似 (1+x)^n≈1+nx，处处出场。</p>
        `,
        try: `
          <ul>
            <li>写出 (a+b)^4 的全部项，对照杨辉三角第 5 行。</li>
            <li>用定理算 1.01^5 的近似（取前两项）。</li>
          </ul>
        `
      }
    },

    {
      id: "law-of-cosines",
      title: "余弦定理",
      subtitle: "勾股定理的「有夹角版」",
      emoji: "📐",
      iconClass: "warm",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["几何", "三角", "测量"],
      era: "欧几里得有几何版；现代形式用余弦",
      oneLiner: "任意三角形：c² = a² + b² − 2ab cos C。直角时 cos 90°=0，退化为勾股。",
      people: [
        { role: "古典几何", name: "欧几里得《原本》", years: "约前 300 年" }
      ],
      related: ["pythagoras", "amgm", "fta"],
      sections: {
        story: `
          <p>不是直角三角形时，勾股不再成立。余弦定理补上「夹角」那一项，测距、导航、图形学天天用。</p>
        `,
        statement: `
          <p>三角形中，C 为边 c 的对角：</p>
          <div class="formula" data-latex="c^{2}=a^{2}+b^{2}-2ab\\cos C"></div>
          <p>另两边同理（轮换字母）。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">记号</div>
            <p>边 a,b,c 分别对顶角 A,B,C。余弦在锐角为正、钝角为负，所以钝角时 c² > a²+b²。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">坐标引理</div>
            <p>把角 C 放在原点，两边沿坐标轴方向放置，用距离公式即得。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话版：</strong>把顶点 C 放原点，两边向量点积，长度平方一拆开就是余弦定理。</p>
          <ol class="steps">
            <li>令向量 <span data-latex="\\vec{u},\\vec{v}">u→,v→</span> 表示夹角 C 的两边，|u|=b，|v|=a，对边向量 u−v 长度是 c。</li>
            <li><span data-latex="c^{2}=\\|\\vec{u}-\\vec{v}\\|^{2}=\\|\\vec{u}\\|^{2}+\\|\\vec{v}\\|^{2}-2\\langle\\vec{u},\\vec{v}\\rangle">c²=‖u−v‖²=‖u‖²+‖v‖²−2⟨u,v⟩</span>。</li>
            <li>而 <span data-latex="\\langle\\vec{u},\\vec{v}\\rangle=ab\\cos C">⟨u,v⟩=ab cos C</span>，代入即得
              <div class="calc-line" data-latex="c^{2}=a^{2}+b^{2}-2ab\\cos C"></div>
            </li>
            <li>当 C=90°，cos C=0，回到勾股定理。</li>
          </ol>
          <p class="qed">∎</p>
        `,
        deep: `
          <p>正弦定理 a/sin A = 2R（外接圆直径）与余弦定理一起，构成解斜三角形的基本武器。</p>
        `,
        why: `
          <p>测量第三边、算角度、计算机图形里的光照与夹角，都是它的应用场。</p>
        `,
        try: `
          <ul>
            <li>边 3,4 夹角 60°，求对边（应是 √13）。</li>
            <li>验证：夹角 90° 时公式退化成 3-4-5。</li>
          </ul>
        `
      }
    },

    {
      id: "euler-bridges",
      title: "欧拉七桥问题",
      subtitle: "一笔画与图论的诞生",
      emoji: "🌉",
      iconClass: "purple",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["图论", "欧拉", "拓扑直觉"],
      era: "1736，柯尼斯堡七桥",
      oneLiner: "七座桥能不能每座恰好走一次走完？欧拉证明：不能——并发明了「点线」图论语言。",
      people: [
        { role: "提出与解决", name: "莱昂哈德·欧拉", years: "1736" }
      ],
      related: ["euler-polyhedron", "four-color", "pigeonhole"],
      sections: {
        story: `
          <p>18 世纪柯尼斯堡城有七座桥连着河岸与岛。居民打赌：能不能每座桥只走一次，全部走完？欧拉证明不可能，并把问题抽象成：点（地区）和边（桥）。</p>
          <div class="fun-box"><strong>意义：</strong>不管桥弯不弯、岛大不大，只看「谁和谁相连」——图论由此诞生。</div>
        `,
        statement: `
          <p><strong>欧拉路径定理（连通图）：</strong></p>
          <ul>
            <li>有<strong>欧拉回路</strong>（一笔画回到起点，每边恰一次）⇔ 每个顶点度数为偶数。</li>
            <li>有<strong>欧拉路径</strong>（不要求回到起点）⇔ 恰有 0 或 2 个奇度数顶点。</li>
          </ul>
          <p>柯尼斯堡图有 4 个奇度顶点 → 无欧拉路径。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">图与度数</div>
            <p>图 = 顶点 + 边。顶点的<strong>度数</strong> = 连出的边数。七桥对应 4 个点、7 条边，四个点度数分别为 3,3,3,5（皆奇）。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">握手引理</div>
            <p>所有顶点度数之和 = 2×边数，故奇度顶点必有偶数个。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话版：</strong>一笔画走进一个路口再离开，边成对用掉；只有起点和终点可以「单着」。奇度路口太多就画不成。</p>
          <ol class="steps">
            <li>若存在欧拉回路：在每一中间经过的顶点，进一条边必出一条边，度数被成对用完 → 全为偶数。</li>
            <li>反之（连通 + 全偶度）：可构造回路（标准证明用「走最大闭迹再拼接剩余」）。</li>
            <li>欧拉路径（不闭合）：恰允许两个「端点」为奇度，其余偶度。</li>
            <li>柯尼斯堡有 4 个奇度点 → 不可能。</li>
          </ol>
          <p class="qed">∎</p>
        `,
        deep: `
          <p>由此发展出欧拉回路算法、邮差问题、电路布线。与哈密顿路径（过每个点恰好一次）看似对偶，难度却天差地别。</p>
        `,
        why: `
          <p>第一次系统展示：问题可以只保留连接关系。现代网络、地图、社交关系图，都走在这条路上。</p>
        `,
        try: `
          <ul>
            <li>画一个「信封」图形，数奇度点，判断能否一笔画。</li>
            <li>自己设计一张 2 个奇度点的图，找一条欧拉路径。</li>
          </ul>
        `
      }
    },

    {
      id: "taylor",
      title: "泰勒定理",
      subtitle: "用多项式贴合光滑函数",
      emoji: "📈",
      iconClass: "",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["微积分", "近似", "分析"],
      era: "泰勒 1715；拉格朗日余项等完善",
      oneLiner: "足够光滑的函数，在一点附近可以用多项式逼近，误差由下一阶导数控制。",
      people: [
        { role: "级数形式", name: "布鲁克·泰勒", years: "1715" },
        { role: "余项等形式", name: "拉格朗日等", years: "18–19 世纪" }
      ],
      related: ["ftc", "mvt", "euler-identity"],
      sections: {
        story: `
          <p>sin、e^x、√(1+x) 这些函数不好算，但多项式好算。泰勒定理说：在一点附近，用导数信息堆一个多项式，就能贴得很近——计算器、物理近似都靠它。</p>
        `,
        statement: `
          <p>若 f 在含 x₀ 的区间上有 n+1 次导数，则</p>
          <div class="formula" data-latex="f(x)=\\sum_{k=0}^{n}\\dfrac{f^{(k)}(x_0)}{k!}(x-x_0)^{k}+R_n(x)"></div>
          <p>拉格朗日余项：存在 ξ 介于 x 与 x₀ 之间，使</p>
          <div class="formula" data-latex="R_n(x)=\\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}(x-x_0)^{n+1}"></div>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">在 x₀ 处的泰勒多项式</div>
            <p>前 n 阶导数在 x₀ 处与 f 相同的那个唯一 n 次多项式。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">罗尔定理多次使用</div>
            <p>构造辅助函数使在多个点取 0，反复用罗尔，逼出余项里的高阶导数。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话版：</strong>先写出你想要的多项式，把「误差」单独拎出来；对误差函数反复用中值/罗尔，误差就被下一阶导数钉死。</p>
          <ol class="steps">
            <li>令 P_n 为 n 阶泰勒多项式，写 f(x)=P_n(x)+R_n(x)，目标刻画 R_n。</li>
            <li>固定 x，构造辅助函数（常见写法之一），使其在 x₀ 处连同前 n 阶导数都为 0，并在 x 处与余项挂钩。</li>
            <li>对辅助函数在 x₀ 与 x 之间反复应用罗尔定理 n+1 次，得到一点 ξ，使高阶导数条件成立。</li>
            <li>解出 R_n(x) 的拉格朗日形式。</li>
          </ol>
          <p class="qed">∎（纲要；细节见任意微积分教材）</p>
        `,
        deep: `
          <p>e^x、sin x、cos x 的泰勒级数在全实轴收敛；1/(1−x) 只在 |x|<1。收敛半径是复分析的故事。</p>
        `,
        why: `
          <p>数值计算、物理线性化、机器学习里的泰勒展开与二阶方法，都从这里长出来。</p>
        `,
        try: `
          <ul>
            <li>写 e^x 在 0 处前 4 项，估算 e^{0.1}。</li>
            <li>比较 sin x 与 x−x³/6 在 x=0.5 时的差别。</li>
          </ul>
        `
      }
    },

    {
      id: "sandwich",
      title: "夹逼定理",
      subtitle: "上下夹住，极限就跑不了",
      emoji: "🥪",
      iconClass: "green",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["微积分", "极限", "基础"],
      era: "古典极限理论标准工具",
      oneLiner: "若两条曲线夹着第三条，上下两边都挤向同一极限，中间也只能去那儿。",
      people: [
        { role: "极限理论中的标准定理", name: "柯西等严格化", years: "19 世纪" }
      ],
      related: ["ivt", "ftc", "sqrt2"],
      sections: {
        story: `
          <p>有些极限不好直接算，比如 sin x / x 在 0 附近。用几何把 sin x 夹在两条好函数中间，上下极限一样，中间就定了。这叫夹逼（三明治）定理。</p>
        `,
        statement: `
          <p>若在 x₀ 附近（可去掉 x₀ 本身）有</p>
          <div class="formula" data-latex="g(x)\\le f(x)\\le h(x)"></div>
          <p>且 <span data-latex="\\lim_{x\\to x_0}g(x)=\\lim_{x\\to x_0}h(x)=L">lim g = lim h = L</span>，则</p>
          <div class="formula" data-latex="\\lim_{x\\to x_0}f(x)=L"></div>
          <p>序列版本完全类似。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">极限的 ε 语言（直觉）</div>
            <p>f 逼近 L：只要 x 够靠近 x₀，f(x) 就掉进 L 的任意小邻域。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">不等式传递</div>
            <p>若 A≤B≤C 且 A、C 都在 (L−ε,L+ε) 内，则 B 也在里面。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话版：</strong>上下两扇门都关到只剩一条缝，夹在中间的人只能进那条缝。</p>
          <ol class="steps">
            <li>任给 ε>0。因 g→L，存在 δ₁，使 0≤|x−x₀|≤δ₁ 时 |g(x)−L|≤ε，即 L−ε≤g(x)≤L+ε。</li>
            <li>同理存在 δ₂，使 h 也落入 (L−ε,L+ε)。</li>
            <li>取 δ=min(δ₁,δ₂)。当 0≤|x−x₀|≤δ 时，L−ε≤g(x)≤f(x)≤h(x)≤L+ε。</li>
            <li>故 |f(x)−L|≤ε。由 ε 任意，f→L。</li>
          </ol>
          <p class="qed">∎</p>
        `,
        deep: `
          <p>经典应用：证明 <span data-latex="\\lim_{x\\to 0}\\dfrac{\\sin x}{x}=1">lim (sin x)/x = 1</span>（单位圆几何夹逼）。</p>
        `,
        why: `
          <p>极限课里最常用的间接工具之一。不会直接算时，就想办法「上下包住」。</p>
        `,
        try: `
          <ul>
            <li>用 −|x| ≤ x sin(1/x) ≤ |x|（x≠0）证明 x→0 时极限为 0。</li>
            <li>解释：为什么只夹一边不够。</li>
          </ul>
        `
      }
    }
  );

  // 相关链接
  const moreRelated = {
    "euclid-primes": ["fermat-little"],
    pythagoras: ["law-of-cosines", "cauchy-schwarz"],
    amgm: ["cauchy-schwarz", "binomial"],
    ftc: ["taylor", "sandwich"],
    mvt: ["taylor", "sandwich"],
    fermat: ["fermat-little"],
    "euler-polyhedron": ["euler-bridges"],
    "four-color": ["euler-bridges"]
  };
  Object.keys(moreRelated).forEach((id) => {
    const th = T.find((x) => x.id === id);
    if (!th) return;
    moreRelated[id].forEach((r) => {
      if (!th.related.includes(r)) th.related.push(r);
    });
  });

  // 注入交互演示到证明区（需在 diagrams-more 注册后由页面 mount）
  function inject(id, section, widget) {
    const th = T.find((t) => t.id === id);
    if (!th || !th.sections[section]) return;
    const marker = `data-widget="${widget}"`;
    if (th.sections[section].includes(marker)) return;
    th.sections[section] =
      `<div class="interactive" data-widget="${widget}"></div>` + th.sections[section];
  }
  inject("fermat-little", "proof", "fermat-little");
  inject("cauchy-schwarz", "proof", "cauchy-schwarz");
  inject("bayes", "proof", "bayes");
  inject("binomial", "proof", "binomial");
  inject("law-of-cosines", "proof", "law-of-cosines");
  inject("euler-bridges", "proof", "euler-bridges");
  inject("taylor", "proof", "taylor");
  inject("sandwich", "proof", "sandwich");
})();
