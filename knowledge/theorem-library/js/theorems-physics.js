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
      related: ["newton-gravity", "momentum", "energy-conservation"],
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
      related: ["newton-laws", "relativity-sr", "energy-conservation"],
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
      related: ["newton-laws", "thermo-1", "momentum"],
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
      related: ["newton-laws", "energy-conservation", "relativity-sr"],
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
      related: ["thermo-2", "energy-conservation", "ideal-gas"],
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
      related: ["thermo-1", "ideal-gas", "energy-conservation"],
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
      related: ["thermo-1", "thermo-2", "maxwell"],
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
      related: ["faraday", "relativity-sr", "coulomb"],
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
      related: ["maxwell", "energy-conservation", "coulomb"],
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
      related: ["maxwell", "newton-gravity", "energy-conservation"],
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
      related: ["maxwell", "newton-laws", "photoelectric"],
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
      related: ["relativity-sr", "planck", "maxwell"],
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
      related: ["photoelectric", "thermo-2", "maxwell"],
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
      related: ["photoelectric", "planck", "relativity-sr"],
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
      related: ["maxwell", "photoelectric", "energy-conservation"],
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
      related: ["newton-laws", "energy-conservation", "ideal-gas"],
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
      related: ["energy-conservation", "archimedes", "newton-laws"],
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
    }
  ];

  T.push(...PHYSICS);
})();
