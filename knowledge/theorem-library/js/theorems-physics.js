/**
 * 物理定理库 —— 与数学条目同一结构
 * field: "physics"
 */
(function () {
  const T = (window.THEOREMS = window.THEOREMS || []);

  // 既有数学条目默认 field
  T.forEach((t) => {
    if (!t.field) t.field = "math";
  });

  function F(latex) {
    return `<div class="formula" data-latex="${latex}"></div>`;
  }
  function C(latex) {
    return `<div class="calc-line" data-latex="${latex}"></div>`;
  }
  function M(latex, fb) {
    return `<span data-latex="${latex}">${fb || ""}</span>`;
  }

  const PHYSICS = [
    {
      id: "newton-laws",
      field: "physics",
      title: "牛顿运动定律",
      subtitle: "经典力学的三条基石",
      emoji: "🍎",
      iconClass: "warm",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["力学", "牛顿", "经典物理"],
      era: "1687《自然哲学的数学原理》",
      oneLiner: "惯性、F=ma、作用力与反作用力——描述宏观低速世界里物体怎么动。",
      people: [{ role: "建立体系", name: "艾萨克·牛顿", years: "1643–1727" }],
      related: ["newton-gravity", "momentum", "work-energy", "angular-momentum"],
      sections: {
        story: `
          <p>苹果落地、炮弹飞行，以前靠亚里士多德直觉。牛顿用三条定律把「力」和「运动」焊在一起，经典力学开张。</p>
          <div class="fun-box"><strong>适用范围：</strong>日常速度、宏观物体很好用；接近光速或原子尺度要换成相对论/量子。</div>
        `,
        statement: `
          <p class="plain-lead"><strong>先记住：</strong>① 不受力就匀速（或静止）；② 力改变动量，F=ma；③ 你推墙，墙也推你。</p>
          <p><strong>第一定律（惯性）：</strong>质点不受外力（或合力为零）时，保持静止或匀速直线运动。</p>
          <p><strong>第二定律：</strong></p>
          ${F("\\vec{F}=\\dfrac{d\\vec{p}}{dt}=m\\vec{a}\\quad(\\text{质量恒定时})")}
          <p><strong>第三定律：</strong>作用力与反作用力等大、反向、共线，分别作用在两个物体上。</p>
          ${F("\\vec{F}_{12}=-\\vec{F}_{21}")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">惯性参考系</div>
            <p>第一定律成立的参考系叫惯性系。地球近似惯性系；加速的电梯不是。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">动量</div>
            <p>${M("\\vec{p}=m\\vec{v}", "p=mv")}。第二定律最干净的写法是力等于动量变化率。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>这不是从更简单公理「推」出来的数学定理，而是对自然的高度压缩总结；正确性靠无数实验与工程成功。</p>
          <ol class="steps">
            <li><strong>惯性：</strong>在足够光滑的气垫导轨上，滑块近似匀速——外力越小，速度越「懒得变」。</li>
            <li><strong>F=ma：</strong>同一物体，力翻倍加速度翻倍；质量越大越难加速。这是定义力/验证比例的实验核心。</li>
            <li><strong>反作用：</strong>两车互撞、溜冰者互推，动量交换等大反向——第三者（地球）有时藏在细节里。</li>
          </ol>
          <p class="qed">（物理定律：实验归纳 + 体系自洽）</p>
        `,
        deep: `
          <p>拉格朗日/哈密顿形式把牛顿力学改写成「极值原理」，为量子与场论铺路。相对论里 F=dp/dt 仍可用，但 p 的定义变了。</p>
        `,
        why: `
          <p>桥梁、汽车、卫星发射、机器人控制——宏观工程默认牛顿框架。</p>
        `,
        try: `
          <ul>
            <li>站在称上突然下蹲，读数如何变？用第二定律解释。</li>
            <li>为什么开枪会后坐？第三定律 + 动量。</li>
          </ul>
        `
      }
    },

    {
      id: "newton-gravity",
      field: "physics",
      title: "万有引力定律",
      subtitle: "苹果与月亮服从同一条式子",
      emoji: "🌍",
      iconClass: "green",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["力学", "引力", "牛顿"],
      era: "1687；卡文迪许测 G",
      oneLiner: "两质点互相吸引，力与质量乘积成正比、与距离平方成反比。",
      people: [
        { role: "提出", name: "牛顿", years: "1687" },
        { role: "测定 G", name: "卡文迪许", years: "1798" }
      ],
      related: ["newton-laws", "kepler", "escape-velocity", "relativity-gr"],
      sections: {
        story: `
          <p>地面落体和天体运行曾是两套故事。牛顿说：都是引力。月亮也在「掉向地球」，只是速度够快，一直掉在轨道上。</p>
        `,
        statement: `
          <p>两质点质量 ${M("m_1,m_2", "m₁,m₂")}，距离 ${M("r", "r")}：</p>
          ${F("F=G\\dfrac{m_1 m_2}{r^2}")}
          <p>方向沿连线互相吸引。${M("G", "G")} 为引力常量，约 ${M("6.67\\times 10^{-11}\\,\\mathrm{N\\,m^2/kg^2}", "6.67×10⁻¹¹")}。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">质点与球对称</div>
            <p>均匀球体对外等效于质量集中在球心（牛顿壳层定理）——所以把地球当地心质点常常够用。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">与开普勒</div>
            <p>在平方反比引力下，可推出行星轨道为圆锥曲线，周期满足开普勒第三定律。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>定律本身来自观测归纳与数学推演的闭环：假设平方反比 → 推出开普勒；卡文迪许在实验室测出 G。</p>
          <ol class="steps">
            <li>从开普勒定律反推：圆周近似下向心力 ${M("mv^2/r", "mv²/r")} 与 ${M("1/r^2", "1/r²")} 一致。</li>
            <li>推广到任意两质点，引入普适 G。</li>
            <li>卡文迪许扭秤：测出小球间微弱引力，定出 G 的数量级。</li>
          </ol>
        `,
        deep: `
          <p>广义相对论用时空弯曲取代「超距力」，但在弱场低速下精确回到牛顿公式。</p>
        `,
        why: `
          <p>卫星轨道、潮汐、称重「g」、宇宙大尺度结构的经典起点。</p>
        `,
        try: `
          <ul>
            <li>用 g=GM/R² 估算地球质量（已知 g、R、G）。</li>
            <li>距离加倍，引力变为原来的多少？</li>
          </ul>
        `
      }
    },

    {
      id: "energy-conservation",
      field: "physics",
      title: "机械能守恒与能量守恒",
      subtitle: "能量不会无故消失，只会换张脸",
      emoji: "⚡",
      iconClass: "",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["力学", "能量", "守恒"],
      era: "19 世纪能量概念成熟；力学守恒更早",
      oneLiner: "只有保守力做功时，动能+势能不变；更一般地，孤立系统总能量守恒。",
      people: [
        { role: "力学发展", name: "惠更斯、莱布尼茨等", years: "17 世纪" },
        { role: "普遍能量守恒", name: "迈尔、焦耳、亥姆霍兹等", years: "19 世纪" }
      ],
      related: ["newton-laws", "work-energy", "thermo-1", "momentum"],
      sections: {
        story: `
          <p>过山车最高点最慢、最低点最快——高度换成速度。能量守恒说：账本两边要平，可以变形，不能凭空造或毁（在适用条件下）。</p>
        `,
        statement: `
          <p><strong>机械能守恒：</strong>仅保守力做功时</p>
          ${F("E_k+E_p=\\mathrm{const}")}
          <p>例如重力附近：</p>
          ${F("\\tfrac12 mv^2+mgh=\\mathrm{const}")}
          <p><strong>普遍能量守恒：</strong>孤立系统总能量（含热、化学、电磁…）保持不变——热力学第一定律的灵魂。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">保守力</div>
            <p>做功与路径无关（只取决于起点终点），如重力、静电力。摩擦力通常不保守，机械能会「漏」成热。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">动能定理</div>
            <p>合力做功 = 动能变化：${M("W=\\Delta E_k", "W=ΔE_k")}。保守力功 = −ΔE_p，故 E_k+E_p 不变。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>力做的功变成动能；若这功又能写成势能差的减少，两项一加就守恒。</p>
          <ol class="steps">
            <li>由牛顿第二定律沿路径积分：${C("\\int \\vec{F}\\cdot d\\vec{r}=\\Delta(\\tfrac12 mv^2)")}</li>
            <li>若 ${M("\\vec{F}=-\\nabla V", "F=−∇V")}（保守），则左边 = ${M("-\\Delta V", "−ΔV")}。</li>
            <li>故 ${M("\\Delta(\\tfrac12 mv^2+V)=0", "Δ(½mv²+V)=0")}。</li>
          </ol>
        `,
        deep: `
          <p>诺特定理：时间平移对称性 ↔ 能量守恒。现代物理把守恒律和对称性绑在一起。</p>
        `,
        why: `
          <p>估测速、设计过山车、分析碰撞（常配合动量）、理解永动机为何不可能。</p>
        `,
        try: `
          <ul>
            <li>从高 h 静止滑下（无摩擦），落地速度？</li>
            <li>有摩擦时机械能去哪了？</li>
          </ul>
        `
      }
    },

    {
      id: "momentum",
      field: "physics",
      title: "动量守恒定律",
      subtitle: "内力再怎么推，总动量不变",
      emoji: "🏒",
      iconClass: "warm",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["力学", "守恒", "碰撞"],
      era: "笛卡儿、惠更斯、牛顿时代形成",
      oneLiner: "系统不受外力（或外力矢量和为零）时，总动量保持不变。",
      people: [{ role: "体系化", name: "牛顿等", years: "17 世纪" }],
      related: ["newton-laws", "angular-momentum", "work-energy", "energy-conservation"],
      sections: {
        story: `
          <p>两冰球相撞，各速度变了，但「质量×速度」加起来可以不变。火箭喷气向前走，也是动量守恒：往后喷气，箭体往前。</p>
        `,
        statement: `
          ${F("\\sum_i \\vec{p}_i = \\mathrm{const}\\quad(\\sum \\vec{F}_{\\mathrm{ext}}=0)")}
          <p>一维碰撞常用：</p>
          ${F("m_1 v_1+m_2 v_2=m_1 v_1'+m_2 v_2'")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">内力与外力</div>
            <p>系统内物体间的力成对出现（第三定律），对总动量的贡献抵消；只有外力能改变总动量。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">冲量</div>
            <p>${M("\\vec{J}=\\int\\vec{F}dt=\\Delta\\vec{p}", "J=∫F dt=Δp")}。短时间大力（碰撞）用冲量分析很方便。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>把系统里所有牛顿第二定律加起来，内力两两抵消，剩下外力管总动量变化。</p>
          <ol class="steps">
            <li>对每个质点：${M("\\dot{\\vec{p}}_i=\\vec{F}_i^{\\mathrm{ext}}+\\sum_j\\vec{F}_{ji}", "ṗᵢ=F_ext+内力")}。</li>
            <li>求和：内力成对反向，和为零。</li>
            <li>故 ${M("\\frac{d}{dt}\\sum\\vec{p}_i=\\sum\\vec{F}^{\\mathrm{ext}}", "dP/dt=F_ext")}。外力为零则总动量守恒。</li>
          </ol>
        `,
        deep: `
          <p>弹性碰撞还守恒动能；完全非弹性碰撞动能不守恒，但动量仍守恒（无外力时）。</p>
        `,
        why: `
          <p>碰撞分析、火箭方程、粒子物理「看不见的粒子」用动量缺口反推。</p>
        `,
        try: `
          <ul>
            <li>等质量一维弹性碰撞，交换速度——用守恒验证。</li>
            <li>人在船上走路，船怎么动？</li>
          </ul>
        `
      }
    },

    {
      id: "thermo-1",
      field: "physics",
      title: "热力学第一定律",
      subtitle: "能量守恒的热学版",
      emoji: "🔥",
      iconClass: "warm",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["热力学", "能量", "热机"],
      era: "焦耳、亥姆霍兹、克劳修斯等，19 世纪中叶",
      oneLiner: "系统内能变化 = 吸收的热 − 对外做的功（符号约定以教材为准）。",
      people: [
        { role: "热功当量", name: "焦耳", years: "1840s" },
        { role: "表述完善", name: "克劳修斯等", years: "19 世纪" }
      ],
      related: ["thermo-2", "ideal-gas", "equipartition", "energy-conservation"],
      sections: {
        story: `
          <p>永动机梦碎于此：你不能无中生有能量。给系统加热、对系统做功，内能就变；热机把热部分变成功，但账必须平。</p>
        `,
        statement: `
          <p>常见约定（系统吸热为正、系统对外做功为正）：</p>
          ${F("\\Delta U=Q-W")}
          <p>微分形式：</p>
          ${F("dU=\\delta Q-\\delta W")}
          <p>对气体体积功常有 ${M("\\delta W=p\\,dV", "δW=p dV")}（准静态）。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">状态量 vs 过程量</div>
            <p>内能 U 是状态量（只取决于状态）。热 Q、功 W 是过程量（看你怎么走）。所以写 δQ、δW 而不是 dQ、dW。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">热功当量</div>
            <p>焦耳实验：机械功可以定量转化为热，比例固定——热不是一种「热质」，而是能量的一种形式。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>这是能量守恒在热力学语言里的记账法；实验上由热功当量与无数热机循环支持。</p>
          <ol class="steps">
            <li>认定内能是状态函数：从状态 A 到 B，ΔU 与路径无关。</li>
            <li>任意过程中，进入系统的能量以热与功的形式往来，其代数和等于 ΔU。</li>
            <li>与力学/电磁能量衔接，得到普遍能量守恒图景。</li>
          </ol>
        `,
        deep: `
          <p>统计力学里 U 是微观能量的平均；第一定律对应微观哈密顿量的守恒结构在宏观的投影。</p>
        `,
        why: `
          <p>发动机、冰箱、发电厂效率分析的起点；识破第一类永动机。</p>
        `,
        try: `
          <ul>
            <li>等温下理想气体 ΔU=0，吸的热等于对外做的功。</li>
            <li>绝热 Q=0，则 ΔU=−W。</li>
          </ul>
        `
      }
    },

    {
      id: "thermo-2",
      field: "physics",
      title: "热力学第二定律",
      subtitle: "熵增：不是所有能量都能随便变功",
      emoji: "♻️",
      iconClass: "rose",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["热力学", "熵", "不可逆"],
      era: "克劳修斯、开尔文，19 世纪",
      oneLiner: "孤立系统的熵不会自发减少；热不能全部自动变成功而不留下其他变化。",
      people: [
        { role: "克劳修斯表述 / 熵", name: "鲁道夫·克劳修斯", years: "1850s–1865" },
        { role: "开尔文表述", name: "开尔文", years: "1851" }
      ],
      related: ["thermo-1", "ideal-gas", "stefan-boltzmann", "energy-conservation"],
      sections: {
        story: `
          <p>第一定律只说「能量账要平」，没说「哪些过程能发生」。热自发从高温流向低温，反过来不会自动发生。第二定律管「方向」和「品质」。</p>
          <div class="fun-box"><strong>永动机：</strong>第一类违背能量守恒；第二类声称把热 100% 变功且无副作用——被第二定律禁止。</div>
        `,
        statement: `
          <p><strong>克劳修斯：</strong>不可能把热从低温物体传到高温物体而不引起其他变化。</p>
          <p><strong>开尔文：</strong>不可能从单一热源吸热使之完全变成功而不产生其他影响。</p>
          <p><strong>熵表述：</strong>孤立系统</p>
          ${F("\\Delta S\\ge 0")}
          <p>可逆过程熵变：</p>
          ${F("dS=\\dfrac{\\delta Q_{\\mathrm{rev}}}{T}")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">熵 S</div>
            <p>描述「能量分散程度 / 微观可能性多少」的状态量。克劳修斯先给出宏观定义，玻尔兹曼给出微观解释 ${M("S=k\\ln\\Omega", "S=k ln Ω")}。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">卡诺效率</div>
            <p>工作在 T_h 与 T_c 之间的热机，效率上限</p>
            ${C("\\eta\\le 1-\\dfrac{T_c}{T_h}")}
            <p>等号对应可逆卡诺循环——第二定律的定量后果。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>多种表述等价；若能造第二类永动机，就能造出克劳修斯禁止的「自动热流上坡」。</p>
          <ol class="steps">
            <li>假设开尔文机存在：从单一热源吸热全部变功。</li>
            <li>用该功驱动一台制冷机，可把热从低温泵到高温，而整体除了热从低温到高温外无其他变化 → 违背克劳修斯。</li>
            <li>反之亦然。故两表述等价。</li>
            <li>引入熵后，不可逆过程对应孤立系熵增；可逆循环 ∮ δQ/T=0。</li>
          </ol>
        `,
        deep: `
          <p>统计观点：宏观不可逆来自「可能性一边倒」——破碎的杯子微态远多于完整杯子，不是微观定律禁止倒放录像，而是概率上几乎不会。</p>
        `,
        why: `
          <p>热机效率上限、信息与熵、宇宙「热寂」讨论、化学自发方向（结合自由能）。</p>
        `,
        try: `
          <ul>
            <li>T_h=600K，T_c=300K，卡诺效率上限是多少？</li>
            <li>解释：为什么冰箱不违背第二定律（看房间整体）。</li>
          </ul>
        `
      }
    },

    {
      id: "ideal-gas",
      field: "physics",
      title: "理想气体状态方程",
      subtitle: "PV=nRT：气体的理想账本",
      emoji: "🎈",
      iconClass: "green",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["热力学", "气体", "模型"],
      era: "波义耳、查理、盖-吕萨克 → 克拉珀龙、门捷列夫形式",
      oneLiner: "稀薄气体近似：压强×体积 = 物质的量×R×温度。",
      people: [
        { role: "经验定律", name: "波义耳等", years: "17–19 世纪" },
        { role: "统一形式", name: "克拉珀龙等", years: "19 世纪" }
      ],
      related: ["thermo-1", "thermo-2", "equipartition"],
      sections: {
        story: `
          <p>真实气体会液化、分子有体积；理想气体假设分子是「弹性小弹珠、本身不占体积、除碰撞无力」。常温常压空气常常够用。</p>
        `,
        statement: `
          ${F("PV=nRT")}
          <p>或 ${M("PV=Nk_B T", "PV=NkT")}（N 分子数，k_B 玻尔兹曼常量）。R 为普适气体常量。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">三个经典实验律</div>
            <p>等温：PV=const（波义耳）。等压：V∝T（查理）。等容：P∝T。拼起来就是状态方程。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">微观图像</div>
            <p>动理学：压强来自分子 thrashing 器壁的动量变化；温度与平均平动动能成正比 ${M("\\langle\\tfrac12 mv^2\\rangle\\propto T", "½mv²∝T")}。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>宏观上由实验定律合并；微观上由分子碰撞模型导出 P=⅓ρv²_rms 再连到温度。</p>
          <ol class="steps">
            <li>合并波义耳/查理等，得 PV/T=const，对 1 mol 记为 R。</li>
            <li>n 摩尔：PV=nRT。</li>
            <li>动理学导出 ${M("PV=\\tfrac13 Nm\\langle v^2\\rangle", "PV=⅓Nm⟨v²⟩")}，与能量均分衔接得同一形式。</li>
          </ol>
        `,
        deep: `
          <p>范德瓦尔斯方程给分子体积与引力修正，是迈向真实气体的一步。</p>
        `,
        why: `
          <p>气球、引擎循环估算、化学计量与气体计量的基本工具。</p>
        `,
        try: `
          <ul>
            <li>温度（开尔文）加倍、体积不变，压强怎么变？</li>
            <li>为何要用热力学温标而不是摄氏？</li>
          </ul>
        `
      }
    },

    {
      id: "maxwell",
      field: "physics",
      title: "麦克斯韦方程组",
      subtitle: "电与磁的统一语法",
      emoji: "⚡",
      iconClass: "purple",
      difficulty: "hard",
      difficultyLabel: "硬核挑战",
      tags: ["电磁学", "麦克斯韦", "场"],
      era: "1860s 麦克斯韦；亥维赛等矢量形式",
      oneLiner: "四条方程管住电场、磁场如何互相激发，并预言电磁波以光速传播。",
      people: [
        { role: "统一理论", name: "詹姆斯·克拉克·麦克斯韦", years: "1831–1879" },
        { role: "实验证实电磁波", name: "赫兹", years: "1887" }
      ],
      related: ["faraday", "ampere", "lorentz-force", "coulomb"],
      sections: {
        story: `
          <p>库仑、安培、法拉第各自发现碎片。麦克斯韦把它们写成统一场方程，并大胆加上「位移电流」——于是电场变化也能生磁，电磁波被预言，光被解释为电磁波动。</p>
        `,
        statement: `
          <p>真空中的微分形式（SI）：</p>
          ${F("\\nabla\\cdot\\vec{E}=\\dfrac{\\rho}{\\varepsilon_0}")}
          ${F("\\nabla\\cdot\\vec{B}=0")}
          ${F("\\nabla\\times\\vec{E}=-\\dfrac{\\partial\\vec{B}}{\\partial t}")}
          ${F("\\nabla\\times\\vec{B}=\\mu_0\\vec{J}+\\mu_0\\varepsilon_0\\dfrac{\\partial\\vec{E}}{\\partial t}")}
          <p>人话：① 电荷产生电发散；② 没有磁单极；③ 变磁生旋电（法拉第）；④ 电流与变电生旋磁（安培–麦克斯韦）。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">场与源</div>
            <p>${M("\\rho", "ρ")} 电荷密度，${M("\\vec{J}", "J")} 电流密度。${M("\\varepsilon_0,\\mu_0", "ε₀,μ₀")} 真空电容率/磁导率，光速 ${M("c=1/\\sqrt{\\mu_0\\varepsilon_0}", "c=1/√(μ₀ε₀)")}。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">位移电流</div>
            <p>仅有传导电流时，安培定律与电荷守恒冲突。麦克斯韦加入 ${M("\\varepsilon_0\\partial\\vec{E}/\\partial t", "ε₀∂E/∂t")}，方程组自洽并允许真空中的波。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>不是一条「证明题」，而是：归纳实验定律 → 数学统一 → 推出电磁波 → 赫兹实验验证 → 与光学光速吻合。</p>
          <ol class="steps">
            <li>高斯电/磁、法拉第、安培定律分别来自实验。</li>
            <li>补上位移电流，使连续性方程 ${M("\\nabla\\cdot\\vec{J}+\\partial\\rho/\\partial t=0", "∇·J+∂ρ/∂t=0")} 与方程兼容。</li>
            <li>在无源区取旋度，得波动方程，波速 = 当时测得的光速。</li>
            <li>赫兹产生并检测无线电波，闭合历史证据链。</li>
          </ol>
        `,
        deep: `
          <p>闵可夫斯基把 E、B 合成电磁场张量，狭义相对论与麦克斯韦天然一体。量子电动力学是其量子版。</p>
        `,
        why: `
          <p>电机、无线电、光纤、雷达、电路——现代文明的隐形操作系统。</p>
        `,
        try: `
          <ul>
            <li>说明：为什么「变磁场」能点亮线圈里的灯泡。</li>
            <li>由 μ₀ε₀ 估算 c 的数量级。</li>
          </ul>
        `
      }
    },

    {
      id: "faraday",
      field: "physics",
      title: "法拉第电磁感应定律",
      subtitle: "变磁生电",
      emoji: "🧲",
      iconClass: "warm",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["电磁学", "感应", "技术"],
      era: "1831 法拉第；楞次定律定方向",
      oneLiner: "穿过回路的磁通量一变，回路里就出现电动势；发电机靠它吃饭。",
      people: [
        { role: "发现", name: "迈克尔·法拉第", years: "1831" },
        { role: "方向", name: "楞次", years: "1834" }
      ],
      related: ["maxwell", "lorentz-force", "ampere", "ohm"],
      sections: {
        story: `
          <p>法拉第发现：动磁铁或改电流，旁边线圈会「感应」出电流。人类第一次大规模把机械运动变成电力，电力系统由此起步。</p>
        `,
        statement: `
          ${F("\\mathcal{E}=-\\dfrac{d\\Phi_B}{dt}")}
          <p>磁通量 ${M("\\Phi_B=\\int\\vec{B}\\cdot d\\vec{A}", "Φ_B=∫B·dA")}。负号是楞次定律：感应效果反抗通量的变化。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">三种图像</div>
            <p>① 磁场变；② 回路面积/取向变；③ 导体在磁场中运动（动生电动势）。都可纳入通量变化。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">动生电动势</div>
            <p>棒在磁场中切割：${M("\\mathcal{E}=B\\ell v", "ε=Bℓv")}（合适几何），与洛伦兹力做功图像一致。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>实验定律；方向由「反抗变化」（能量守恒）定下。麦克斯韦方程里的旋度式是其微分版。</p>
          <ol class="steps">
            <li>法拉第大量实验：只有通量变化时才稳定出现感应电流。</li>
            <li>楞次：感应电流的磁场总试图抵消原通量变化——否则可造永动机。</li>
            <li>写入 ${M("\\nabla\\times\\vec{E}=-\\partial\\vec{B}/\\partial t", "∇×E=−∂B/∂t")}，与电路形式统一。</li>
          </ol>
        `,
        deep: `
          <p>感生电场可以是涡旋场，电位不再全局单值——变压器区域要小心。</p>
        `,
        why: `
          <p>发电机、变压器、电磁炉、无线充电的原理核心。</p>
        `,
        try: `
          <ul>
            <li>磁铁插入线圈，电流计如何偏转？拔出呢？</li>
            <li>为何变压器不能对直流工作？</li>
          </ul>
        `
      }
    },

    {
      id: "coulomb",
      field: "physics",
      title: "库仑定律",
      subtitle: "电荷之间的平方反比力",
      emoji: "➕",
      iconClass: "",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["电磁学", "静电", "基础"],
      era: "1785 库仑扭秤",
      oneLiner: "两点电荷之间的力 ∝ 电荷乘积 / 距离平方，同号相斥、异号相吸。",
      people: [{ role: "实验确立", name: "查尔斯·库仑", years: "1785" }],
      related: ["maxwell", "ohm", "faraday", "lorentz-force"],
      sections: {
        story: `
          <p>与万有引力神似，但电荷有正负，所以可斥可吸。静电学、原子里电子为何不掉进核（经典图像的起点，虽不完整），都从这儿讲。</p>
        `,
        statement: `
          ${F("F=k\\dfrac{|q_1 q_2|}{r^2},\\quad k=\\dfrac{1}{4\\pi\\varepsilon_0}")}
          <p>矢量形式：</p>
          ${F("\\vec{F}_{12}=\\dfrac{1}{4\\pi\\varepsilon_0}\\dfrac{q_1 q_2}{r^2}\\hat{r}_{12}")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">点电荷</div>
            <p>尺寸远小于间距时，电荷分布可当点。连续分布用积分叠加（电场线性）。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">高斯定理联系</div>
            <p>库仑平方反比 ↔ 真空中 ${M("\\nabla\\cdot\\vec{E}=\\rho/\\varepsilon_0", "∇·E=ρ/ε₀")}（在各向同性等条件下）。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>扭秤实验测力与距离、电荷量的关系；数学上与引力同型。</p>
          <ol class="steps">
            <li>库仑用扭秤比较不同距离、不同电荷的扭转力矩。</li>
            <li>归纳得平方反比与乘积关系。</li>
            <li>引入 ε₀ 与现代单位制书写。</li>
          </ol>
        `,
        deep: `
          <p>量子电动力学修正极近距离行为；宏观静电库仑仍然极准。</p>
        `,
        why: `
          <p>电路、电容器、化学键静电模型、打印机与静电除尘。</p>
        `,
        try: `
          <ul>
            <li>距离变为 3 倍，力变为多少？</li>
            <li>比较：同样「平方反比」，引力恒吸引、库仑可排斥。</li>
          </ul>
        `
      }
    },

    {
      id: "relativity-sr",
      field: "physics",
      title: "狭义相对论要点",
      subtitle: "光速不变，时空联姻，E=mc²",
      emoji: "🚀",
      iconClass: "rose",
      difficulty: "hard",
      difficultyLabel: "硬核挑战",
      tags: ["相对论", "爱因斯坦", "时空"],
      era: "1905 爱因斯坦",
      oneLiner: "对所有惯性系，光速相同；同时性相对；质量与能量互通。",
      people: [
        { role: "提出", name: "阿尔伯特·爱因斯坦", years: "1905" },
        { role: "数学形式", name: "闵可夫斯基等", years: "1908 前后" }
      ],
      related: ["maxwell", "relativity-gr", "photoelectric", "doppler"],
      sections: {
        story: `
          <p>麦克斯韦电磁理论给出绝对光速，与伽利略相对性看似打架。爱因斯坦丢掉「绝对时间」，留下两条公设，重写时空观。</p>
          <div class="fun-box"><strong>两公设：</strong>① 物理定律对所有惯性系形式相同；② 真空光速 c 与光源运动无关。</div>
        `,
        statement: `
          <p><strong>洛伦兹因子：</strong></p>
          ${F("\\gamma=\\dfrac{1}{\\sqrt{1-v^2/c^2}}")}
          <p><strong>时间膨胀：</strong>运动时钟变慢 ${M("\\Delta t=\\gamma\\Delta t_0", "Δt=γΔt₀")}。</p>
          <p><strong>长度收缩：</strong>运动尺子变短 ${M("L=L_0/\\gamma", "L=L₀/γ")}（沿运动方向）。</p>
          <p><strong>质能关系：</strong></p>
          ${F("E=\\gamma mc^2,\\quad E_0=mc^2")}
          <p>动量 ${M("\\vec{p}=\\gamma m\\vec{v}", "p=γmv")}。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">同时性</div>
            <p>「两地同时」依赖参考系。绝对同时被放弃，换来电磁与力学的统一相对性。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">光速极限</div>
            <p>有质量粒子 v→c 时 γ→∞，加速越来越难，无法越过 c。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>从两公设推洛伦兹变换；时间膨胀、长度收缩、速度合成、质能关系都是推论。实验（μ子寿命、GPS、粒子加速器）反复确认。</p>
          <ol class="steps">
            <li>光信号校准时钟 + 相对性 → 推导洛伦兹变换。</li>
            <li>由变换读出时间膨胀与长度收缩。</li>
            <li>要求动量守恒在所有惯性系成立 → 修正 p、E 的表达式 → E²=(pc)²+(mc²)²。</li>
            <li>低速展开回到牛顿力学 + 动能 ½mv²。</li>
          </ol>
        `,
        deep: `
          <p>广义相对论进一步让引力=时空弯曲。狭义相对论是平直时空的「惯性系专版」。</p>
        `,
        why: `
          <p>核能源、粒子物理、GPS 钟差修正、宇宙线 μ 子能落到地面。</p>
        `,
        try: `
          <ul>
            <li>v=0.6c 时 γ 是多少？时间膨胀因子？</li>
            <li>1 g 质量对应多少能量（用 E=mc² 估数量级）？</li>
          </ul>
        `
      }
    },

    {
      id: "photoelectric",
      field: "physics",
      title: "光电效应",
      subtitle: "光是一份一份的：E=hν",
      emoji: "💡",
      iconClass: "warm",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["量子", "爱因斯坦", "光"],
      era: "赫兹发现；爱因斯坦 1905 解释",
      oneLiner: "光电子能否打出取决于光的频率，不取决于光强；爱因斯坦用光量子解释。",
      people: [
        { role: "现象", name: "赫兹等", years: "1887 前后" },
        { role: "光量子解释", name: "爱因斯坦", years: "1905（诺奖 1921）" }
      ],
      related: ["planck", "compton", "de-broglie", "relativity-sr"],
      sections: {
        story: `
          <p>经典波动说预言：光再弱，只要照得够久也能积够能量打出电子；频率不该设门槛。实验却是：频率不够，再亮也没电子；频率够了，几乎立刻有。爱因斯坦提出：光是能量为 hν 的量子。</p>
        `,
        statement: `
          ${F("h\\nu=\\phi+K_{\\max}")}
          <p>${M("\\phi", "φ")} 逸出功，${M("K_{\\max}", "K_max")} 光电子最大动能。截止频率 ${M("\\nu_0=\\phi/h", "ν₀=φ/h")}。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">与波动说冲突的三点</div>
            <p>① 截止频率；② 瞬时发射；③ 饱和电流随光强变、最大动能随频率变。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">普朗克关系</div>
            <p>能量子 ${M("E=h\\nu", "E=hν")}（普朗克先用于黑体，爱因斯坦用到光本身）。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>一个光子把全部身家 hν 交给一个电子；付完逸出功 φ，剩下变动能。光强只表示光子多寡，不提高单个光子能量。</p>
          <ol class="steps">
            <li>假设辐射以能量 hν 的量子被吸收。</li>
            <li>电子挣脱金属需至少 φ → 需要 ν≥φ/h。</li>
            <li>K_max=hν−φ，与密强无关；光强影响单位时间光子数 → 光电流。</li>
            <li>密立根等精密实验验证线性关系与 h 的数值。</li>
          </ol>
        `,
        deep: `
          <p>光的波粒二象性由此坐实；康普顿散射进一步支持光子动量 p=h/λ。</p>
        `,
        why: `
          <p>太阳能电池、光电管、光传感器；量子论的实验基石之一。</p>
        `,
        try: `
          <ul>
            <li>若 φ=2 eV，求截止频率数量级（h≈4.14×10⁻¹⁵ eV·s）。</li>
            <li>为何紫光比红光更容易打出电子？</li>
          </ul>
        `
      }
    },

    {
      id: "planck",
      field: "physics",
      title: "普朗克关系与能量子",
      subtitle: "E=hν：能量可以一份一份卖",
      emoji: "📦",
      iconClass: "purple",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["量子", "黑体", "普朗克"],
      era: "1900 普朗克",
      oneLiner: "谐振子能量不是连续任意值，而是 hν 的整数倍——量子论敲门砖。",
      people: [{ role: "提出", name: "马克斯·普朗克", years: "1900" }],
      related: ["photoelectric", "stefan-boltzmann", "compton", "de-broglie"],
      sections: {
        story: `
          <p>黑体辐射的「紫外灾难」：经典统计把高频能量算爆。普朗克不情愿地假设能量一份份来，公式突然完美拟合实验——量子时代开始。</p>
        `,
        statement: `
          ${F("E=nh\\nu,\\quad n=0,1,2,\\ldots")}
          <p>光子语言（爱因斯坦）：每个光子能量</p>
          ${F("E=h\\nu=\\dfrac{hc}{\\lambda}")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">普朗克常量 h</div>
            <p>约 6.626×10⁻³⁴ J·s。极小，所以日常看不出「一份一份」。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">普朗克光谱</div>
            <p>黑体辐射能密度按频率分布的普朗克公式，成功压住紫外灾难，并回到瑞利-金斯/维恩两极限。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>为拟合曲线引入的假设，后来被光电效应等实验抬成原理。</p>
          <ol class="steps">
            <li>经典均分 → 紫外发散。</li>
            <li>假设振子能量量子化 E=nhν，改写统计权重。</li>
            <li>得到与实验吻合的谱；h 由拟合确定。</li>
          </ol>
        `,
        deep: `
          <p>量子力学里能量量子化来自边界条件与算符本征值，不再是「为了拟合硬加」。</p>
        `,
        why: `
          <p>LED、激光、原子光谱、一切量子技术的概念源头。</p>
        `,
        try: `
          <ul>
            <li>绿光 λ≈500 nm，一个光子能量约多少 eV？</li>
            <li>为什么「量子」在宏观被平均掉了？</li>
          </ul>
        `
      }
    },

    {
      id: "uncertainty",
      field: "physics",
      title: "海森堡不确定原理",
      subtitle: "不能同时把位置和动量看得无限准",
      emoji: "🌫️",
      iconClass: "rose",
      difficulty: "hard",
      difficultyLabel: "硬核挑战",
      tags: ["量子", "海森堡", "基础"],
      era: "1927 海森堡",
      oneLiner: "位置测得越准，动量就越不准；不是仪器太烂，是波的本性。",
      people: [{ role: "提出", name: "维尔纳·海森堡", years: "1927" }],
      related: ["de-broglie", "schrodinger", "planck", "photoelectric"],
      sections: {
        story: `
          <p>经典世界观：粒子同时有精确位置和速度。量子世界观：波函数给出概率；位置与动量是「不对易」的一对，精确度互相拆台。</p>
        `,
        statement: `
          ${F("\\sigma_x\\,\\sigma_p\\ge \\dfrac{\\hbar}{2}")}
          <p>更一般：对任意不对易可观测量有类似不等式。能量-时间也有形式 ${M("\\Delta E\\Delta t\\gtrsim\\hbar/2", "ΔE Δt ≳ ℏ/2")}（解释需谨慎）。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">不是测量扰动那么简单</div>
            <p>入门比喻「光子踢飞电子」有启发，但原理更深层：态本身不能同时是两者的本征态。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">对易子</div>
            <p>${M("[x,p]=i\\hbar", "[x,p]=iℏ")}。由柯西-施瓦茨型论证可导出不确定度乘积下限。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>波包越窄（位置确定），需要的频率/波数成分越宽（动量不确定）——傅里叶变换的冤家。</p>
          <ol class="steps">
            <li>定义方差 ${M("\\sigma_x^2=\\langle(x-\\bar x)^2\\rangle", "σ_x²")} 等。</li>
            <li>对态矢量用算符不等式（Robertson 关系）。</li>
            <li>代入 [x,p]=iℏ，得 σ_x σ_p ≥ ℏ/2。</li>
          </ol>
        `,
        deep: `
          <p>量子信息里的纠缠、互补原理，都与「不能同时拥有全部经典标签」一脉相承。</p>
        `,
        why: `
          <p>理解原子稳定性、光谱线宽、隧道效应的概念背景；否定「决定性轨迹」的经典图像。</p>
        `,
        try: `
          <ul>
            <li>若把电子限制在 Δx≈0.1 nm，估 Δp 与速度不确定的数量级。</li>
            <li>用「波包」画草图解释位置-动量权衡。</li>
          </ul>
        `
      }
    },

    {
      id: "snell",
      field: "physics",
      title: "斯涅尔折射定律",
      subtitle: "光在界面转弯的规矩",
      emoji: "🔦",
      iconClass: "green",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["光学", "波动", "几何光学"],
      era: "斯涅尔 1621；费马原理更优解释",
      oneLiner: "n₁ sin θ₁ = n₂ sin θ₂——折射率×入射角正弦，两边相等。",
      people: [
        { role: "经验定律", name: "斯涅尔", years: "1621" },
        { role: "最短时间原理", name: "费马", years: "17 世纪" }
      ],
      related: ["young-slit", "lens-maker", "maxwell", "doppler"],
      sections: {
        story: `
          <p>筷子在水里「折断」，是光在水面弯折。折射率不同，速度不同；费马说光走时间最短路径，弯折角就服从斯涅尔。</p>
        `,
        statement: `
          ${F("n_1\\sin\\theta_1=n_2\\sin\\theta_2")}
          <p>${M("n=c/v", "n=c/v")} 为介质折射率。从光密到光疏，折射角大于入射角，大到 90° 发生全反射。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">相对折射率</div>
            <p>也可写 ${M("\\sin\\theta_1/\\sin\\theta_2=v_1/v_2", "sinθ₁/sinθ₂=v₁/v₂")}。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">费马原理</div>
            <p>光取光程极值。在两介质直线路径族里对入射点变分，即得斯涅尔定律。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>救生员跑沙滩+游泳救人要选折线；光也「算」时间。数学变分给出 sin 关系。</p>
          <ol class="steps">
            <li>设界面上一点把路径分成两段直线。</li>
            <li>总时间 t=L₁/v₁+L₂/v₂，对交点坐标求导为零。</li>
            <li>得到 n₁ sin θ₁ = n₂ sin θ₂。</li>
          </ol>
        `,
        deep: `
          <p>波动说用边界条件匹配同样得到折射定律；麦克斯韦方程是更底层。</p>
        `,
        why: `
          <p>眼镜、镜头、光纤（全反射）、海市蜃楼。</p>
        `,
        try: `
          <ul>
            <li>空气→水，入射 30°，n≈1.33，折射角？</li>
            <li>计算水→空气的临界角。</li>
          </ul>
        `
      }
    },

    {
      id: "archimedes",
      field: "physics",
      title: "阿基米德原理",
      subtitle: "浮力等于排开液体的重量",
      emoji: "🛁",
      iconClass: "warm",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["力学", "流体", "古典"],
      era: "古希腊阿基米德",
      oneLiner: "浸在流体里的物体受到向上的浮力，大小等于它挤走的那份流体的重力。",
      people: [{ role: "发现", name: "阿基米德", years: "约前 3 世纪" }],
      related: ["pascal", "bernoulli", "newton-laws", "energy-conservation"],
      sections: {
        story: `
          <p>国王皇冠是否掺假？阿基米德在浴池里悟到排水与浮力——「尤里卡」传说讲的就是这件事。船为何浮、热气球为何升，都是同一套账。</p>
        `,
        statement: `
          ${F("F_{\\mathrm{b}}=\\rho_{\\mathrm{f}} V_{\\mathrm{dis}} g")}
          <p>方向竖直向上。ρ_f 流体密度，V_dis 排开体积。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">压强随深度</div>
            <p>静止液体中 ${M("p=p_0+\\rho g h", "p=p₀+ρgh")}。物体上下表面压力差提供浮力。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">压力差</div>
            <p>对竖直柱体：下表面比上表面深 Δh，压力差 ρgΔh，乘面积 = ρgV。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>底下顶得比上面压得更猛，净力向上，刚好等于「挖掉那块液体」本来的重量。</p>
          <ol class="steps">
            <li>静止流体压强随深度线性增加。</li>
            <li>任意形状物体：把表面压力积分；或用「替换为同形状流体」平衡论证。</li>
            <li>得浮力 = 排开流体重力，方向向上。</li>
          </ol>
        `,
        deep: `
          <p>密度小于液体则上浮至平衡；潜艇靠改变自身平均密度下潜。</p>
        `,
        why: `
          <p>造船、水文、密度测量、热气球与潜水。</p>
        `,
        try: `
          <ul>
            <li>冰山约 90% 在水下，如何用密度比解释？</li>
            <li>同样质量，铁球与木块谁浮力大（都完全浸没时）？</li>
          </ul>
        `
      }
    },

    {
      id: "bernoulli",
      field: "physics",
      title: "伯努利原理",
      subtitle: "流得快的地方压强小",
      emoji: "✈️",
      iconClass: "",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["流体", "能量", "应用"],
      era: "丹尼尔·伯努利 1738",
      oneLiner: "理想流体定常流动时，高度、压强与流速满足能量式守恒关系。",
      people: [{ role: "提出", name: "丹尼尔·伯努利", years: "1738" }],
      related: ["archimedes", "pascal", "energy-conservation", "work-energy"],
      sections: {
        story: `
          <p>飞机机翼、喷雾器、球场上「香蕉球」——流速与压强的拉扯。伯努利把流体动能、重力势能和压强能写在一条式子里。</p>
        `,
        statement: `
          <p>不可压缩、无黏、定常流沿流线：</p>
          ${F("p+\\rho g h+\\tfrac12\\rho v^2=\\mathrm{const}")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">理想化条件</div>
            <p>真实空气有黏性、可能湍流。伯努利是「第一刀」模型，机翼完整解释还需环量与边界层（但压强差图像仍有用）。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">能量观点</div>
            <p>对流体微团用做功与动能定理，压强做功项变成 p/ρ，加上 gh 与 v²/2。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>管道变窄处流加快（连续性）；要加速就得有净压力推——所以窄处压强往往更低。</p>
          <ol class="steps">
            <li>连续方程：ρAv≈const（不可压 A v≈const）。</li>
            <li>对沿流线的柱体用牛顿定律/能量积分。</li>
            <li>整理得伯努利方程。</li>
          </ol>
        `,
        deep: `
          <p>文丘里管测流速、匹托托管测空速，都是直接应用。</p>
        `,
        why: `
          <p>航空入门、管道工程、气象直觉（风大处压强）。</p>
        `,
        try: `
          <ul>
            <li>两张纸中间吹气，纸为何靠近？</li>
            <li>水平管截面积减半，流速与压强如何变（定性）？</li>
          </ul>
        `
      }
    },

    /* ========== 扩充至 ~35 ========== */
    {
      id: "kepler",
      field: "physics",
      title: "开普勒行星运动定律",
      subtitle: "椭圆、面积、周期平方",
      emoji: "🪐",
      iconClass: "purple",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["天体力学", "开普勒", "引力"],
      era: "1609–1619；牛顿后来给出动力学解释",
      oneLiner: "行星绕日：轨道是椭圆；相等时间扫过相等面积；T² 正比于半长轴的立方。",
      people: [
        { role: "经验定律", name: "约翰内斯·开普勒", years: "1609–1619" },
        { role: "动力学导出", name: "牛顿", years: "1687" }
      ],
      related: ["newton-gravity", "escape-velocity", "angular-momentum", "relativity-gr"],
      sections: {
        story: `
          <p>第谷留下精密数据，开普勒用椭圆取代完美正圆，写出三条定律。牛顿再用万有引力从「为什么」导出它们。</p>
        `,
        statement: `
          <p><strong>第一定律：</strong>轨道是椭圆，太阳在一个焦点上。</p>
          <p><strong>第二定律：</strong>太阳–行星连线在相等时间内扫过相等面积（面积速度恒定）。</p>
          <p><strong>第三定律：</strong>周期 T 与半长轴 a 满足</p>
          ${F("\\dfrac{T^2}{a^3}=\\mathrm{const}\\quad(\\text{对绕同一中心天体})")}
          <p>牛顿形式（中心质量 M ≫ m）：</p>
          ${F("T^2=\\dfrac{4\\pi^2}{GM}a^3")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">面积定律 = 角动量守恒</div>
            <p>中心力矩为零 → 角动量守恒 → 面积速度恒定。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">向心力与平方反比</div>
            <p>圆周近似下 ${M("GMm/r^2=m\\omega^2 r", "GMm/r²=mω²r")} 可推出 T²∝r³。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>开普勒从数据归纳；牛顿用引力 + 微积分证明圆锥曲线轨道与第三定律。</p>
          <ol class="steps">
            <li>第二定律 ← 中心力 → 角动量守恒。</li>
            <li>平方反比引力下，轨道微分方程给出圆锥曲线（椭圆/抛物/双曲）。</li>
            <li>对椭圆积分周期，得 T²∝a³。</li>
          </ol>
        `,
        deep: `
          <p>双星、系外行星测质量仍用第三定律的推广。广义相对论对水星近日点进动作小修正。</p>
        `,
        why: `
          <p>卫星轨道设计、航天窗口、天文测质量的基本尺子。</p>
        `,
        try: `
          <ul>
            <li>地球 a 约 1 AU、T=1 年。若 a 变为 4 AU，周期约几年？</li>
            <li>近日点为何更快？（第二定律）</li>
          </ul>
        `
      }
    },

    {
      id: "hooke",
      field: "physics",
      title: "胡克定律",
      subtitle: "弹簧：拉力与伸长成正比",
      emoji: "🌀",
      iconClass: "green",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["力学", "弹性", "振动"],
      era: "胡克 1676/1678",
      oneLiner: "在弹性限度内，弹簧恢复力 F = −kx，与形变成正比、方向相反。",
      people: [{ role: "提出", name: "罗伯特·胡克", years: "1676" }],
      related: ["newton-laws", "shm", "energy-conservation"],
      sections: {
        story: `
          <p>弹簧秤、蹦床、分子键的简化模型，第一步往往是胡克定律：拉得越长，往回拽得越狠——在没拉坏之前。</p>
        `,
        statement: `
          ${F("F=-kx")}
          <p>k 为劲度系数，x 为相对平衡位置的位移。弹性势能：</p>
          ${F("E_p=\\tfrac12 kx^2")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">弹性限度</div>
            <p>超过限度会出现塑性形变，不再回到原点，胡克定律失效。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">串联并联</div>
            <p>两弹簧串联 1/k=1/k₁+1/k₂；并联 k=k₁+k₂（理想情况）。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>实验归纳的线性本构关系；小形变下固体原子间力的一阶近似。</p>
          <ol class="steps">
            <li>实验：力与伸长在小范围内成正比。</li>
            <li>定义 k = |F|/|x|，写 F=−kx（负号表示恢复）。</li>
            <li>W=∫kx dx → 势能 ½kx²。</li>
          </ol>
        `,
        deep: `
          <p>广义胡克定律用应力–应变张量描述各向异性弹性体。</p>
        `,
        why: `
          <p>测力计、减震、简谐振动、材料弹性模量入门。</p>
        `,
        try: `
          <ul>
            <li>k=200 N/m，伸长 5 cm，弹力？势能？</li>
            <li>两根相同弹簧并联，等效 k 如何变？</li>
          </ul>
        `
      }
    },

    {
      id: "shm",
      field: "physics",
      title: "简谐运动",
      subtitle: "最干净的来回振动",
      emoji: "〰️",
      iconClass: "",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["力学", "振动", "波动"],
      era: "经典力学标准模型",
      oneLiner: "加速度与位移成正比反向：x=A cos(ωt+φ)，周期与振幅无关（线性时）。",
      people: [{ role: "经典分析", name: "牛顿、惠更斯等", years: "17 世纪起" }],
      related: ["hooke", "newton-laws", "energy-conservation"],
      sections: {
        story: `
          <p>钟摆小角度、弹簧振子，都近似简谐：节奏均匀，能量在动能与势能间倒腾。声波、电路 LC 振荡，数学同构。</p>
        `,
        statement: `
          ${F("\\ddot{x}+\\omega^2 x=0")}
          <p>通解：</p>
          ${F("x(t)=A\\cos(\\omega t+\\varphi)")}
          <p>弹簧：${M("\\omega=\\sqrt{k/m}", "ω=√(k/m)")}；单摆小角：${M("\\omega=\\sqrt{g/\\ell}", "ω=√(g/ℓ)")}。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">相位与振幅</div>
            <p>A 振幅，φ 初相，ω 角频率，周期 T=2π/ω。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">能量</div>
            <p>${M("E=\\tfrac12 kA^2=\\tfrac12 m\\omega^2 A^2", "E=½kA²")} 守恒（无阻尼）。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>胡克力 F=−kx 代入牛顿定律，得到「加速度 = −ω²×位移」，解就是正弦/余弦。</p>
          <ol class="steps">
            <li>m ẍ = −kx ⇒ ẍ + (k/m)x = 0。</li>
            <li>特征方程 λ²+ω²=0，ω=√(k/m)。</li>
            <li>通解 A cos(ωt+φ)；初值定 A、φ。</li>
          </ol>
        `,
        deep: `
          <p>阻尼、驱动、共振：在方程中加 −bẋ 与 F₀ cos ωt，工程减震与收音机调谐都靠它。</p>
        `,
        why: `
          <p>钟表、地震简化模型、交流电、分子振动近似。</p>
        `,
        try: `
          <ul>
            <li>m=0.2 kg，k=50 N/m，求 T。</li>
            <li>振幅加倍，周期变吗？能量变吗？</li>
          </ul>
        `
      }
    },

    {
      id: "angular-momentum",
      field: "physics",
      title: "角动量守恒定律",
      subtitle: "转起来的「动量」",
      emoji: "💫",
      iconClass: "warm",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["力学", "转动", "守恒"],
      era: "经典力学；开普勒第二定律已隐含",
      oneLiner: "对某点合力矩为零时，系统对该点的角动量守恒——花滑收臂转得更快。",
      people: [{ role: "体系化", name: "牛顿力学传统", years: "17–18 世纪" }],
      related: ["momentum", "newton-laws", "kepler"],
      sections: {
        story: `
          <p>花滑运动员收臂转速变大，不是魔法，是角动量守恒：转动惯量变小，角速度变大。</p>
        `,
        statement: `
          ${F("\\vec{L}=\\vec{r}\\times\\vec{p},\\quad \\dfrac{d\\vec{L}}{dt}=\\vec{\\tau}")}
          <p>若总外力矩 ${M("\\vec{\\tau}=0", "τ=0")}，则 ${M("\\vec{L}", "L")} 守恒。刚体绕固定轴：</p>
          ${F("L=I\\omega,\\quad \\tau=I\\alpha")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">转动惯量 I</div>
            <p>质量分布对轴的「惰性」：${M("I=\\sum m_i r_i^2", "I=∑m r²")}（质点组）。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">中心力</div>
            <p>力始终指向中心 ⇒ 力矩为零 ⇒ 角动量守恒 ⇒ 行星面积定律。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>对 r×(F=dp/dt) 整理，力矩等于角动量变化率；无力矩则 L 不变。</p>
          <ol class="steps">
            <li>定义 L=r×p。</li>
            <li>dL/dt = v×p + r×F = r×F = τ（因 v×(mv)=0）。</li>
            <li>τ_ext 总=0 ⇒ L 守恒。</li>
          </ol>
        `,
        deep: `
          <p>量子里角动量量子化；微观粒子自旋是角动量的新篇章。</p>
        `,
        why: `
          <p>陀螺定向、卫星姿态、天体自转、工程飞轮。</p>
        `,
        try: `
          <ul>
            <li>转椅上伸臂/收臂，转速如何变？</li>
            <li>为何猫空中能转身落地？（内力矩与形变，总角动量仍守恒。）</li>
          </ul>
        `
      }
    },

    {
      id: "work-energy",
      field: "physics",
      title: "动能定理",
      subtitle: "功是动能的「存款单」",
      emoji: "💪",
      iconClass: "green",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["力学", "能量", "功"],
      era: "经典力学标准定理",
      oneLiner: "合力对物体做的功，等于动能的变化量。",
      people: [{ role: "经典表述", name: "力学传统", years: "18–19 世纪完善" }],
      related: ["energy-conservation", "newton-laws", "momentum"],
      sections: {
        story: `
          <p>推箱子加速，你做的功变成它的动能。动能定理不要求力保守，摩擦力做的负功也会写进等式。</p>
        `,
        statement: `
          ${F("W_{\\mathrm{net}}=\\Delta E_k=\\tfrac12 mv_2^2-\\tfrac12 mv_1^2")}
          <p>变质量/相对论情形要改写，但低速恒质量下就是这式。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">功</div>
            <p>${M("W=\\int\\vec{F}\\cdot d\\vec{r}", "W=∫F·dr")}。与位移同向的分力才做正功。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">由牛顿定律导出</div>
            <p>F=ma=m dv/dt，两边点乘 v dt = dr，积分即得。</p>
          </div>
        `,
        proof: `
          <ol class="steps">
            <li>${C("\\vec{F}\\cdot d\\vec{r}=m\\dfrac{d\\vec{v}}{dt}\\cdot\\vec{v}\\,dt=m\\vec{v}\\cdot d\\vec{v}")}</li>
            <li>积分：${C("\\int_{1}^{2}\\vec{F}\\cdot d\\vec{r}=\\tfrac12 m v_2^2-\\tfrac12 m v_1^2")}</li>
          </ol>
          <p class="qed">∎</p>
        `,
        deep: `
          <p>保守力时 W_c=−ΔE_p，与动能定理合并得机械能守恒。</p>
        `,
        why: `
          <p>不求中间加速度过程，直接用功算末速度——工程估算利器。</p>
        `,
        try: `
          <ul>
            <li>质量 2 kg 物体，合力做功 100 J，动能增加多少？</li>
            <li>摩擦力做负功时，动能一定减少吗？（看净功。）</li>
          </ul>
        `
      }
    },

    {
      id: "ohm",
      field: "physics",
      title: "欧姆定律",
      subtitle: "电压、电流、电阻",
      emoji: "🔋",
      iconClass: "warm",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["电磁学", "电路", "基础"],
      era: "欧姆 1827",
      oneLiner: "很多导体上，电流与电压成正比：U=IR；R 由材料与几何决定。",
      people: [{ role: "提出", name: "格奥尔格·欧姆", years: "1827" }],
      related: ["coulomb", "maxwell", "faraday"],
      sections: {
        story: `
          <p>电路入门第一式。金属里自由电子在电场下漂移，宏观上常常近似线性——欧姆定律。</p>
        `,
        statement: `
          ${F("U=IR\\quad\\text{或}\\quad \\vec{J}=\\sigma\\vec{E}")}
          <p>电阻 ${M("R=\\rho \\ell/A", "R=ρℓ/A")}，ρ 电阻率，σ=1/ρ 电导率。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">欧姆器件 vs 非欧姆</div>
            <p>二极管、灯丝高温时 I–U 非线性。欧姆定律是材料模型，不是宇宙铁律。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">焦耳热</div>
            <p>功率 ${M("P=UI=I^2 R=U^2/R", "P=UI=I²R")}（纯电阻）。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>实验上许多金属在恒温下 I∝U；微观上漂移速度 ∝ 电场，导致 J=σE。</p>
          <ol class="steps">
            <li>欧姆用热电偶与电流扭秤等装置测 V–I 关系。</li>
            <li>微观：弛豫时间近似下平均漂移速度 ∝ E，得欧姆形式。</li>
          </ol>
        `,
        deep: `
          <p>基尔霍夫电压/电流定律 + 欧姆定律 → 线性电路网络可解。</p>
        `,
        why: `
          <p>家用电路、电子学入门、电费与发热估算。</p>
        `,
        try: `
          <ul>
            <li>U=12 V，R=4 Ω，I 与功率？</li>
            <li>为何电线要够粗？（R 与发热。）</li>
          </ul>
        `
      }
    },

    {
      id: "lorentz-force",
      field: "physics",
      title: "洛伦兹力",
      subtitle: "电磁场对电荷的力",
      emoji: "🧲",
      iconClass: "purple",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["电磁学", "磁场", "运动电荷"],
      era: "洛伦兹 19 世纪末综合",
      oneLiner: "F = q(E + v×B)：电场沿场推拉，磁场只弯轨迹不改速率。",
      people: [{ role: "表述", name: "亨德里克·洛伦兹", years: "1895 前后" }],
      related: ["maxwell", "faraday", "coulomb"],
      sections: {
        story: `
          <p>阴极射线、加速器、地磁场引导宇宙线，都靠「运动电荷在磁场里拐弯」。洛伦兹力把电、磁对电荷的作用写在一起。</p>
        `,
        statement: `
          ${F("\\vec{F}=q(\\vec{E}+\\vec{v}\\times\\vec{B})")}
          <p>磁场部分永远垂直速度，不做功；只改方向不改速率（均匀 B、无 E 时圆周/螺旋）。</p>
          ${F("r=\\dfrac{mv_{\\perp}}{|q|B}")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">右手定则</div>
            <p>正电荷：v、B、F 方向满足右手螺旋（负电荷反向）。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">回旋频率</div>
            <p>${M("\\omega=|q|B/m", "ω=|q|B/m")}，与速率无关（非相对论）。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>实验总结 + 与麦克斯韦动量/能量一致；磁场力 ∝ qvB sinθ。</p>
          <ol class="steps">
            <li>电场力 qE 来自库仑/场定义。</li>
            <li>运动导线与粒子实验给出磁偏转 ∝ qvB。</li>
            <li>写成叉乘保证方向与不做功性质。</li>
          </ol>
        `,
        deep: `
          <p>相对论形式用四维电磁场张量，力与场变换一致。</p>
        `,
        why: `
          <p>质谱仪、回旋加速器、霍尔效应、电动机（宏观电流元）。</p>
        `,
        try: `
          <ul>
            <li>电子垂直射入匀强 B，轨迹是什么？半径公式？</li>
            <li>为何磁场不能给带电粒子加速（提高速率）？</li>
          </ul>
        `
      }
    },

    {
      id: "ampere",
      field: "physics",
      title: "安培定律",
      subtitle: "电流周围有磁场",
      emoji: "⭕",
      iconClass: "",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["电磁学", "磁场", "电流"],
      era: "1820 奥斯特；安培；麦克斯韦修正",
      oneLiner: "电流产生环绕磁场；积分形式：B 沿闭合路径的环流正比于穿过的电流。",
      people: [
        { role: "发现电流磁效应", name: "奥斯特", years: "1820" },
        { role: "定量规律", name: "安培", years: "1820s" }
      ],
      related: ["maxwell", "faraday", "lorentz-force"],
      sections: {
        story: `
          <p>奥斯特发现通电导线让磁针偏转。安培把它变成可算的定律；麦克斯韦再补位移电流，才有完整波动图景。</p>
        `,
        statement: `
          <p>磁介质真空、稳恒电流时：</p>
          ${F("\\oint \\vec{B}\\cdot d\\vec{\\ell}=\\mu_0 I_{\\mathrm{enc}}")}
          <p>无限长直导线：</p>
          ${F("B=\\dfrac{\\mu_0 I}{2\\pi r}")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">右手螺旋</div>
            <p>拇指沿电流，四指环绕方向为 B 线方向。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">对称性</div>
            <p>用安培环路定理算 B，关键是选对对称路径，使 |B| 恒定、方向与 dl 平行。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>实验 + 毕奥–萨伐尔积分；高对称情形用安培环路更快捷。</p>
          <ol class="steps">
            <li>毕奥–萨伐尔：${M("d\\vec{B}\\propto I d\\vec{\\ell}\\times\\hat{r}/r^2", "dB∝Idℓ×r̂/r²")}。</li>
            <li>对长直导线积分得 1/r 磁场。</li>
            <li>抽象为环流形式；麦克斯韦加入位移电流推广到非稳恒。</li>
          </ol>
        `,
        deep: `
          <p>螺线管内部 B≈μ₀ n I，电磁铁与 MRI 主磁场的简化起点。</p>
        `,
        why: `
          <p>电机、电磁铁、无线电力传输的磁场源估算。</p>
        `,
        try: `
          <ul>
            <li>电流加倍，距导线同样位置的 B？</li>
            <li>为何两平行同向电流互相吸引？</li>
          </ul>
        `
      }
    },

    {
      id: "doppler",
      field: "physics",
      title: "多普勒效应",
      subtitle: "声源靠近时音调变高",
      emoji: "🚑",
      iconClass: "warm",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["波动", "声学", "天文"],
      era: "多普勒 1842；声学与光学推广",
      oneLiner: "波源或观察者相对介质/彼此运动时，接收频率改变——急救车呼啸而过最直观。",
      people: [{ role: "提出", name: "克里斯蒂安·多普勒", years: "1842" }],
      related: ["snell", "relativity-sr", "photoelectric"],
      sections: {
        story: `
          <p>火车驶近笛声尖、驶离笛声沉。天文上星系光谱红移，是多普勒在光上的亲戚（相对论版更精确）。</p>
        `,
        statement: `
          <p>声波（相对空气）：</p>
          ${F("f'=f\\,\\dfrac{v\\pm v_o}{v\\mp v_s}")}
          <p>分子：观察者向源近取上号，源向观察者近取下号（分母）。光速多普勒（沿视线）：</p>
          ${F("f'=f\\sqrt{\\dfrac{1-\\beta}{1+\\beta}}\\quad(\\beta=v/c,\\ \\text{退行})")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">介质 vs 相对论</div>
            <p>声需要介质，源与观察者角色不对称；光在真空用相对论公式，只依赖相对速度。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">波长图像</div>
            <p>源追上自己的波前 → 前方波长变短 → 频率变高。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>数一数单位时间碰到耳膜的波峰个数；运动改变「相遇节奏」。</p>
          <ol class="steps">
            <li>静止时 f=v/λ。</li>
            <li>源运动改变 λ；观察者运动改变相对波速。</li>
            <li>组合得声多普勒公式；光用洛伦兹变换四维波矢。</li>
          </ol>
        `,
        deep: `
          <p>医疗彩超、警察测速雷达、卫星测速、宇宙膨胀红移。</p>
        `,
        why: `
          <p>日常听觉现象 + 精密测速与天文测距的基础工具。</p>
        `,
        try: `
          <ul>
            <li>源向你以 0.1v 靠近（v 声速），频率变为原来的多少？</li>
            <li>红移与蓝移分别对应靠近还是远离？</li>
          </ul>
        `
      }
    },

    {
      id: "young-slit",
      field: "physics",
      title: "杨氏双缝干涉",
      subtitle: "光是波的铁证之一",
      emoji: "🌈",
      iconClass: "purple",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["光学", "波动", "量子入门"],
      era: "托马斯·杨 1801",
      oneLiner: "两束相干光在屏上相长/相消，条纹间距 Δx=λL/d。",
      people: [{ role: "实验", name: "托马斯·杨", years: "1801" }],
      related: ["snell", "de-broglie", "lens-maker", "maxwell"],
      sections: {
        story: `
          <p>牛顿偏微粒，杨用双缝打出明暗条纹，波动说大胜。电子双缝更诡异：粒子也「自己和自己干涉」——量子的招牌谜题。</p>
        `,
        statement: `
          <p>双缝间距 d，屏距 L，波长 λ（L≫d）：</p>
          ${F("\\Delta x=\\dfrac{\\lambda L}{d}")}
          <p>明纹：路径差 δ=mλ；暗纹：δ=(m+½)λ。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">相干</div>
            <p>两列波频率相同、相位差稳定，才能出稳定干涉图样。通常用同一光源分两缝。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">小角近似</div>
            <p>路径差 ≈ d sinθ ≈ d x/L，用于推导条纹间距。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>两列波到屏上某点路程不同；差整数个波长就一起波峰，差半个就抵消。</p>
          <ol class="steps">
            <li>几何给出路径差 δ=d sinθ。</li>
            <li>δ=mλ 相长，(m+1/2)λ 相消。</li>
            <li>θ≈x/L 时相邻明纹间距 λL/d。</li>
          </ol>
        `,
        deep: `
          <p>单光子双缝：干涉仍在，但落点一个一个来——波动与粒子统计图景。</p>
        `,
        why: `
          <p>测波长、薄膜测厚、光栅光谱、量子基础实验。</p>
        `,
        try: `
          <ul>
            <li>λ 变大，条纹变疏还是变密？</li>
            <li>d 变大呢？</li>
          </ul>
        `
      }
    },

    {
      id: "de-broglie",
      field: "physics",
      title: "德布罗意波",
      subtitle: "粒子也有波长",
      emoji: "🌊",
      iconClass: "rose",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["量子", "物质波", "基础"],
      era: "1924 德布罗意；电子衍射证实",
      oneLiner: "动量为 p 的粒子对应波长 λ=h/p——电子也能衍射。",
      people: [
        { role: "提出", name: "路易·德布罗意", years: "1924" },
        { role: "电子衍射", name: "戴维逊–革末等", years: "1927" }
      ],
      related: ["photoelectric", "planck", "uncertainty", "schrodinger"],
      sections: {
        story: `
          <p>光既是波也是粒子。德布罗意大胆反问：电子会不会也是波？几年后电子晶体衍射证明：是。</p>
        `,
        statement: `
          ${F("\\lambda=\\dfrac{h}{p}=\\dfrac{h}{mv}\\quad(\\text{非相对论})")}
          <p>同时 ${M("E=h\\nu", "E=hν")} 对物质波同样讨论（与色散关系相连）。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">宏观为何看不见</div>
            <p>人、足球动量大，λ 小到无法察觉；电子、中子刚好合适做波动实验。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">玻尔轨道</div>
            <p>早期图像：轨道周长 = nλ，与角动量量子化一致（启发性，非最终理论）。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>对称性猜测 + 实验证实；理论地位由量子力学波函数巩固。</p>
          <ol class="steps">
            <li>类比光子 p=h/λ，提出物质 λ=h/p。</li>
            <li>电子束打晶体出现衍射峰，符合布拉格条件与 λ=h/p。</li>
          </ol>
        `,
        deep: `
          <p>薛定谔波动力学把「物质波」写成波函数演化方程。</p>
        `,
        why: `
          <p>电子显微镜、中子散射、量子技术的概念基础。</p>
        `,
        try: `
          <ul>
            <li>估 1 eV 电子的德布罗意波长数量级。</li>
            <li>为何棒球波长不可测？</li>
          </ul>
        `
      }
    },

    {
      id: "schrodinger",
      field: "physics",
      title: "薛定谔方程",
      subtitle: "量子态如何随时间变",
      emoji: "Ψ",
      iconClass: "purple",
      difficulty: "hard",
      difficultyLabel: "硬核挑战",
      tags: ["量子", "波函数", "基础方程"],
      era: "1926 薛定谔",
      oneLiner: "波函数 ψ 的演化方程；|ψ|² 给出找到粒子的概率密度。",
      people: [{ role: "提出", name: "埃尔温·薛定谔", years: "1926" }],
      related: ["de-broglie", "uncertainty", "planck"],
      sections: {
        story: `
          <p>海森堡矩阵力学难直觉，薛定谔写出波动方程，氢原子能级像琴弦泛音一样算出来——量子力学两种语言随后被证明等价。</p>
        `,
        statement: `
          <p>含时薛定谔方程：</p>
          ${F("i\\hbar\\dfrac{\\partial\\psi}{\\partial t}=\\hat{H}\\psi")}
          <p>一维非相对论定态：</p>
          ${F("-\\dfrac{\\hbar^2}{2m}\\dfrac{d^2\\psi}{dx^2}+V(x)\\psi=E\\psi")}
          <p>玻恩规则：${M("|\\psi|^2", "|ψ|²")} 为概率密度。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">算符</div>
            <p>动量 ${M("\\hat{p}=-i\\hbar\\nabla", "p̂=−iℏ∇")}，哈密顿 ${M("\\hat{H}=\\hat{p}^2/2m+V", "Ĥ")}。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">定态</div>
            <p>能量本征态时间部分 e^{−iEt/ℏ}，概率密度不随时间变。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>方程本身是公设级；由经典色散关系 + 算符对应启发，靠实验与数学自洽立足。</p>
          <ol class="steps">
            <li>从 E=p²/2m+V 与 E=ℏω、p=ℏk 想到波动方程形式。</li>
            <li>定态解给出量子化能级（如无限深阱、氢原子）。</li>
            <li>与光谱、隧道效应等实验一致。</li>
          </ol>
        `,
        deep: `
          <p>狄拉克方程是相对论电子版；量子场论进一步量子化场本身。</p>
        `,
        why: `
          <p>化学键、半导体、激光、量子计算——微观世界的动力学语法。</p>
        `,
        try: `
          <ul>
            <li>一维无限深阱能级 E_n∝n²，n=1,2,3… 意味着什么？</li>
            <li>|ψ|² 积分为 1 叫什么条件？</li>
          </ul>
        `
      }
    },

    {
      id: "stefan-boltzmann",
      field: "physics",
      title: "斯特藩–玻尔兹曼定律",
      subtitle: "热辐射功率 ∝ T⁴",
      emoji: "☀️",
      iconClass: "warm",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["热辐射", "黑体", "天体物理"],
      era: "斯特藩 1879；玻尔兹曼理论推导",
      oneLiner: "黑体单位时间单位面积辐射能量 j*=σT⁴，温度稍微升高，辐射猛增。",
      people: [
        { role: "经验", name: "约瑟夫·斯特藩", years: "1879" },
        { role: "理论", name: "路德维希·玻尔兹曼", years: "1884" }
      ],
      related: ["planck", "thermo-2", "ideal-gas"],
      sections: {
        story: `
          <p>为什么恒星表面温度差一倍，亮度差得不是一倍而是十六倍量级？T⁴ 定律。地球能量平衡、红外遥感都用它。</p>
        `,
        statement: `
          ${F("j^{\\star}=\\sigma T^4")}
          <p>σ≈5.67×10⁻⁸ W·m⁻²·K⁻⁴。灰体再乘发射率 ε≤1。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">黑体</div>
            <p>理想吸收体/辐射体。普朗克公式对频率积分就得到 σT⁴。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">热力学推导梗概</div>
            <p>玻尔兹曼用电磁辐射压与卡诺循环思想导出 u∝T⁴（能量密度），再联系通量。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>实验先看见 T⁴；理论从热力学 + 辐射压，或从普朗克光谱积分得到。</p>
          <ol class="steps">
            <li>测量不同温度黑体总辐射 → 拟合 T⁴。</li>
            <li>对普朗克能谱积分 ∫B_ν dν ∝ T⁴，定义 σ。</li>
          </ol>
        `,
        deep: `
          <p>维恩位移律 λ_max T=const 描述「峰值颜色」随温度移动。</p>
        `,
        why: `
          <p>气候模型、恒星光度、热成像、白炽灯效率直觉。</p>
        `,
        try: `
          <ul>
            <li>T 从 300 K 到 600 K，辐射功率密度变为几倍？</li>
            <li>人皮肤约 300 K，为何主要是红外？</li>
          </ul>
        `
      }
    },

    {
      id: "compton",
      field: "physics",
      title: "康普顿散射",
      subtitle: "光子打电子：波长变长",
      emoji: "💥",
      iconClass: "rose",
      difficulty: "hard",
      difficultyLabel: "硬核挑战",
      tags: ["量子", "光子", "相对论"],
      era: "康普顿 1923",
      oneLiner: "X 射线被电子散射后波长变长，改变量只与散射角有关——光子带着动量 h/λ。",
      people: [{ role: "实验与解释", name: "阿瑟·康普顿", years: "1923（诺奖 1927）" }],
      related: ["photoelectric", "planck", "relativity-sr", "de-broglie"],
      sections: {
        story: `
          <p>若光只是波，散射波长不该这么改。康普顿把光子当粒子，与电子做相对论碰撞，完美解释——光有动量。</p>
        `,
        statement: `
          ${F("\\Delta\\lambda=\\lambda'-\\lambda=\\dfrac{h}{m_e c}(1-\\cos\\theta)")}
          <p>h/(m_e c) 称康普顿波长（电子）。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">光子四动量</div>
            <p>E=pc=hc/λ；与电子能量动量守恒联立求解。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">守恒</div>
            <p>碰撞：能量守恒 + 动量守恒（二维分量）。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>光子撞静止电子，把自己一部分能量给电子，自己波长变长； confer 角越大，丢能越多。</p>
          <ol class="steps">
            <li>写光子 E、p 与电子相对论能量。</li>
            <li>守恒方程消去电子反冲动量。</li>
            <li>得 Δλ 公式，与 θ 相关、与入射强度无关。</li>
            <li>实验测不同角度的波长移动验证。</li>
          </ol>
        `,
        deep: `
          <p>与光电效应一起，把「光子」从假说变成标准粒子图像。</p>
        `,
        why: `
          <p>辐射剂量、天体 X 射线、粒子物理散射的教学样板。</p>
        `,
        try: `
          <ul>
            <li>θ=90° 时 Δλ 等于多少（用康普顿波长）？</li>
            <li>θ=0 时为何 Δλ=0？</li>
          </ul>
        `
      }
    },

    {
      id: "pascal",
      field: "physics",
      title: "帕斯卡原理",
      subtitle: "密闭液体：压强会原样传递",
      emoji: "🔧",
      iconClass: "green",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["流体", "压强", "机械"],
      era: "布莱兹·帕斯卡 17 世纪",
      oneLiner: "密闭静止流体中，外加压强大小不变地向各个方向传递。",
      people: [{ role: "提出", name: "布莱兹·帕斯卡", years: "17 世纪" }],
      related: ["archimedes", "newton-laws", "bernoulli"],
      sections: {
        story: `
          <p>液压千斤顶：小活塞使劲，大活塞抬车——力被放大，压强在液体里「广播」。刹车油路同一个道理。</p>
        `,
        statement: `
          ${F("\\Delta p=\\mathrm{const}\\ \\text{（密闭流体中附加压强）}")}
          <p>液压机：</p>
          ${F("\\dfrac{F_1}{A_1}=\\dfrac{F_2}{A_2}")}
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">不可压近似</div>
            <p>液体难压缩，体积几乎不变，压强传递效率高。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">功与位移</div>
            <p>理想无损耗：F₁d₁=F₂d₂，省力费距离。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>流体静止时，任意小面元两侧力平衡；外加的压强增量必须处处相同，否则会流动直到平衡。</p>
          <ol class="steps">
            <li>流体静平衡：压强各向同性。</li>
            <li>外加 Δp 后，若某处不同，会出现净力驱动流动。</li>
            <li>平衡时附加压强均匀传递 → F/A 相等。</li>
          </ol>
        `,
        deep: `
          <p>与深度引起的 ρgh 叠加：总压 = 外压 + ρgh。</p>
        `,
        why: `
          <p>液压系统、工程机械、汽车刹车。</p>
        `,
        try: `
          <ul>
            <li>小活塞面积 1 cm²、力 100 N；大活塞 50 cm²，理论抬力？</li>
            <li>为何液压系统怕混入气泡？</li>
          </ul>
        `
      }
    },

    {
      id: "equipartition",
      field: "physics",
      title: "能量均分定理",
      subtitle: "每一自由度平均分 ½kT",
      emoji: "⚖️",
      iconClass: "",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["统计物理", "热学", "微观"],
      era: "麦克斯韦、玻尔兹曼经典统计",
      oneLiner: "温度 T 时，每个二次型自由度平均能量 ½k_B T——解释气体热容的起点。",
      people: [
        { role: "发展", name: "麦克斯韦、玻尔兹曼等", years: "19 世纪" }
      ],
      related: ["ideal-gas", "thermo-1", "planck"],
      sections: {
        story: `
          <p>理想气体平动三个方向，每个 ½kT，共 3/2 kT。双原子再加转动……经典均分在低温「冻结」自由度时失败，要靠量子论修正。</p>
        `,
        statement: `
          ${F("\\Bigl\\langle \\tfrac12 \\alpha q^2\\Bigr\\rangle=\\tfrac12 k_B T")}
          <p>对哈密顿量中每个平方项（如 ½mv_x²、½kx²、½Iω²）平均贡献 ½kT。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">自由度</div>
            <p>独立平方项个数。单原子气体 f=3；双原子常温 f≈5。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">与内能</div>
            <p>理想气体摩尔内能 U≈(f/2)nRT，C_V=(f/2)R。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>在正则系综里对 e^{−βH} 积分，每个二次项贡献同样的平均能量。</p>
          <ol class="steps">
            <li>配分函数对二次坐标/动量高斯积分。</li>
            <li>得 ⟨½αq²⟩=½kT。</li>
            <li>量子：能级间距 ≫kT 时该自由度不激发，均分失效（紫外灾难相关）。</li>
          </ol>
        `,
        deep: `
          <p>布朗运动、热噪声（约翰逊噪声）与 kT 尺度密切相关。</p>
        `,
        why: `
          <p>热容估算、气体内能、统计物理入门桥梁。</p>
        `,
        try: `
          <ul>
            <li>室温下空气分子平均平动动能数量级？</li>
            <li>为何低温下双原子 C_V 会下降？</li>
          </ul>
        `
      }
    },

    {
      id: "escape-velocity",
      field: "physics",
      title: "逃逸速度",
      subtitle: "飞出星球要多快",
      emoji: "🚀",
      iconClass: "warm",
      difficulty: "medium",
      difficultyLabel: "费点脑子",
      tags: ["引力", "航天", "能量"],
      era: "牛顿力学推论",
      oneLiner: "从星球表面发射，动能够抵消引力势能差到无穷远：v_esc=√(2GM/R)。",
      people: [{ role: "经典推导", name: "牛顿力学", years: "17 世纪起" }],
      related: ["newton-gravity", "energy-conservation", "kepler"],
      sections: {
        story: `
          <p>抛多高掉多快；抛够快就不再回来。逃逸速度不是「轨道速度」，而是「能去无穷远」的阈值。</p>
        `,
        statement: `
          ${F("v_{\\mathrm{esc}}=\\sqrt{\\dfrac{2GM}{R}}=\\sqrt{2gR}")}
          <p>圆轨道速度 ${M("v_{\\mathrm{orb}}=\\sqrt{GM/R}=v_{\\mathrm{esc}}/\\sqrt{2}", "v_orb=v_esc/√2")}。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">引力势能</div>
            <p>${M("U=-GMm/r", "U=−GMm/r")}，选无穷远为 0。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">能量条件</div>
            <p>无穷远动能 ≥0 ⇒ 表面总能量 ≥0 ⇒ ½mv² − GMm/R ≥0。</p>
          </div>
        `,
        proof: `
          <ol class="steps">
            <li>机械能守恒，无推力、无大气阻力。</li>
            <li>r=R 时 E=½mv²−GMm/R；r→∞ 时 U→0，要能到达需 E≥0。</li>
            <li>得 v≥√(2GM/R)。</li>
          </ol>
          <p class="qed">∎</p>
        `,
        deep: `
          <p>黑洞的「光都逃不掉」是相对论版本：逃逸速度形式上达 c 的视界。</p>
        `,
        why: `
          <p>航天发射能量尺度、行星大气是否留得住气体（热速度 vs 逃逸速度）。</p>
        `,
        try: `
          <ul>
            <li>地球 v_esc≈11 km/s，圆轨道约 7.9 km/s，差在哪？</li>
            <li>质量相同半径更小的星，逃逸速度更大还是更小？</li>
          </ul>
        `
      }
    },

    {
      id: "relativity-gr",
      field: "physics",
      title: "广义相对论要点",
      subtitle: "引力 = 时空弯曲",
      emoji: "🌌",
      iconClass: "rose",
      difficulty: "hard",
      difficultyLabel: "硬核挑战",
      tags: ["相对论", "引力", "爱因斯坦"],
      era: "1915 爱因斯坦",
      oneLiner: "等效原理：加速与引力本地分不清；物质告诉时空怎么弯，时空告诉物质怎么走。",
      people: [{ role: "建立", name: "阿尔伯特·爱因斯坦", years: "1915" }],
      related: ["relativity-sr", "newton-gravity", "maxwell"],
      sections: {
        story: `
          <p>电梯里失重 vs 太空漂浮——爱因斯坦说本地等价。引力不是神秘拉力，而是质量–能量让时空弯曲，自由下落走「直线」（测地线）。</p>
        `,
        statement: `
          <p><strong>等效原理（弱形式）：</strong>均匀引力场局部等价于加速参考系。</p>
          <p><strong>爱因斯坦场方程（示意）：</strong></p>
          ${F("G_{\\mu\\nu}=\\dfrac{8\\pi G}{c^4}T_{\\mu\\nu}")}
          <p>左边几何（曲率），右边物质–能量。弱场慢速极限回到牛顿引力。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">经典检验</div>
            <p>水星近日点进动、光线弯曲、引力红移、引力波（2015 直接探测）。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">测地线</div>
            <p>自由粒子沿弯曲时空的「最直路径」运动——对应牛顿的惯性运动推广。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>从等效原理与广义协变出发构造场方程；靠观测筛选正确理论，而非课堂式「证明」。</p>
          <ol class="steps">
            <li>等效原理 → 光速弯曲、钟慢（引力红移）等思想实验。</li>
            <li>数学上用度规张量描述时空；场方程联系曲率与 T_μν。</li>
            <li>求解施瓦西解等，预言可检验效应。</li>
            <li>实验/观测确认（至今在适用尺度极成功）。</li>
          </ol>
        `,
        deep: `
          <p>与量子力学统一仍是开放前沿（量子引力）。</p>
        `,
        why: `
          <p>GPS 钟修正、黑洞与宇宙学、引力波天文。</p>
        `,
        try: `
          <ul>
            <li>用等效原理解释：光经过太阳为何偏折（定性）。</li>
            <li>牛顿引力在什么极限下够用？</li>
          </ul>
        `
      }
    },

    {
      id: "lens-maker",
      field: "physics",
      title: "薄透镜成像公式",
      subtitle: "1/u + 1/v = 1/f",
      emoji: "🔎",
      iconClass: "green",
      difficulty: "easy",
      difficultyLabel: "好上手",
      tags: ["光学", "几何光学", "应用"],
      era: "几何光学传统；高斯光学",
      oneLiner: "物距、像距与焦距满足 1/u+1/v=1/f；放大率 m=−v/u。",
      people: [{ role: "高斯形式", name: "高斯等", years: "19 世纪系统化" }],
      related: ["snell", "young-slit", "maxwell"],
      sections: {
        story: `
          <p>眼镜、相机、望远镜：光线在透镜两侧折射，把物点会聚（或发散成虚像）。薄透镜公式是第一把工程尺子。</p>
        `,
        statement: `
          ${F("\\dfrac{1}{u}+\\dfrac{1}{v}=\\dfrac{1}{f}")}
          ${F("m=-\\dfrac{v}{u}")}
          <p>符号约定依教材（实正虚负等）；凸透镜 f>0（常用约定）。</p>
        `,
        setup: `
          <div class="def-box">
            <div class="def-title">三条特殊光线</div>
            <p>过光心不偏折；平行轴过焦点；过焦点出射平行——作图法与公式一致。</p>
          </div>
        `,
        lemmas: `
          <div class="lemma-box">
            <div class="lemma-title">透镜制造者公式</div>
            <p>${M("1/f=(n-1)(1/R_1-1/R_2)", "1/f=(n−1)(1/R₁−1/R₂)")}（薄透镜、空气中）。</p>
          </div>
        `,
        proof: `
          <p class="plain-lead"><strong>人话：</strong>用折射定律 + 傍轴近似（sinθ≈θ），对单球面成像两次，合并成薄透镜公式。</p>
          <ol class="steps">
            <li>单球面物像关系。</li>
            <li>两面贴近： thrice 像为第二面之物。</li>
            <li>傍轴小角下化成 1/u+1/v=1/f。</li>
          </ol>
        `,
        deep: `
          <p>像差、厚透镜、光阑与景深是下一步工程课。</p>
        `,
        why: `
          <p>相机对焦、视力矫正、显微镜组合系统。</p>
        `,
        try: `
          <ul>
            <li>f=10 cm，物距 15 cm，像在哪？虚实？</li>
            <li>物距等于 f 时像在哪？</li>
          </ul>
        `
      }
    }
  ];

  T.push(...PHYSICS);
})();
