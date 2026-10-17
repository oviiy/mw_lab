// Places of this group — see docs/PLACES_SCHEMA.md
// The Wall's nineteen castles are listed west → east in the order the books / TWOIAF give them:
// Westwatch-by-the-Bridge, Shadow Tower, Sentinel Stand, Greyguard, Stonedoor, Hoarfrost Hill, Icemark, the Nightfort, Deep Lake,
// Queensgate, Castle Black, Oakenshield, Woodswatch-by-the-Pool, Sable Hall, Rimegate, the Long Barrow, the Torches, Greenguard,
// Eastwatch-by-the-Sea. Spacing along the Wall is schematic (roughly even, ~8–9 units ≈ 16–18 miles apart); only the order is sourced.
// Note: docs/MAP_GRID.md lists the Nightfort east of Castle Black (414); the books put it WEST of Castle Black (beyond Queensgate
// and Deep Lake), so it is placed at 362 here.
// Wall castles and the Gift belong to region 'north' (as Castle Black does); everything north of the Wall to 'beyond-wall'.

const WALL_CASTLE = (id, x, y, rank, en, zh, alt, summary, extra = {}) => ({
  id, kind: 'castle', region: 'north', at: [x, y], rank, names: { en, zh }, alt, summary, houses: [], refs: ['affc', 'adwd', 'twoiaf'], confidence: 'medium', ...extra,
});
const ABANDONED_ZH = '守夜人人手日渐凋零，此堡早已弃守。';

export default { group: 'beyond-wall', places: [
  // ------------------------------------------------------------------ the Wall itself and Castle Black (existing)
  {
    id: 'the-wall', kind: 'landmark', region: 'north', at: [425, 299], rank: 4,
    names: { en: 'The Wall', zh: '长城' }, alt: ['Wall', 'Night\'s Watch', '绝境长城', '冰墙'],
    summary: {
      en: 'A rampart of ice some three hundred miles long and about seven hundred feet high, running from the Bay of Ice to the Bay of Seals. Legend credits Brandon the Builder with raising it after the Long Night to shut out the Others. Nineteen castles were built along its southern face, but by the time of the novels the Night\'s Watch holds only three.',
      zh: '一道冰筑的壁垒，长约三百英里、高约七百尺，西起寒冰湾，东抵海豹湾。传说长夜之后由筑城者布兰登主持修建，用以阻挡异鬼。长城南侧先后筑起十九座城堡，但到小说时代，守夜人只剩三座仍有驻守。',
    },
    houses: [], refs: ['agot', 'asos', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'castle-black',
    summary: {
      en: 'Seat of the Lord Commander of the Night\'s Watch, at the northern end of the kingsroad. It has no curtain wall of its own: its towers, halls and a long timber stair cling to the foot of the Wall, which is its only defence. Through a tunnel beneath the ice, rangers ride out into the Haunted Forest.',
      zh: '守夜人总司令的驻地，位于国王大道的北端。它本身没有外墙，塔楼、厅堂与一道长长的木阶都依偎在长城脚下，长城就是它唯一的屏障。游骑兵从冰墙下的隧道出发，进入鬼影森林。',
    },
    houses: [], refs: ['agot', 'acok', 'asos', 'adwd'], confidence: 'high',
    spoiler: {
      en: 'Mance Rayder\'s host assaults it in A Storm of Swords; Jon Snow is later elected Lord Commander here.',
      zh: '《冰雨的风暴》中曼斯·雷德的大军进攻此地；其后琼恩·雪诺在此当选总司令。',
    },
  },
  // ------------------------------------------------------------------ the nineteen castles, west → east
  WALL_CASTLE('westwatch-by-the-bridge', 308, 306, 2, 'Westwatch-by-the-Bridge', '西望台', ['Westwatch', '桥畔西望台', '西望堡'], {
    en: 'The westernmost castle of the Wall, on the shore of the Bay of Ice. It has long been abandoned; the western end of the Wall is watched instead from the Shadow Tower.',
    zh: '长城最西端的城堡，濒临寒冰湾。它早已荒废，长城西段如今由影子塔代为看守。',
  }, { confidence: 'medium' }),
  WALL_CASTLE('shadow-tower', 316, 306, 3, 'Shadow Tower', '影子塔', ['The Shadow Tower', '阴影塔'], {
    en: 'One of the three castles the Night\'s Watch still garrisons, guarding the Wall\'s mountainous western end. Its men watch the Gorge and the Bridge of Skulls, and its rangers range the Frostfangs; Ser Denys Mallister commands there.',
    zh: '守夜人仍在驻守的三座城堡之一，扼守长城多山的西段。堡中守军看守大峡谷与骷髅桥，游骑兵则深入霜雪之牙巡逻；指挥官为丹尼斯·马利斯特爵士。',
  }, { refs: ['agot', 'acok', 'asos', 'twoiaf'], confidence: 'high' }),
  WALL_CASTLE('sentinel-stand', 324, 306, 1, 'Sentinel Stand', '哨兵台', ['哨兵站'], {
    en: 'An abandoned castle on the western stretch of the Wall, between the Shadow Tower and Greyguard. Little is told of it beyond its name.',
    zh: '长城西段一座废弃的城堡，位于影子塔与灰卫堡之间。书中除了名字，几乎没有其他记载。',
  }),
  WALL_CASTLE('greyguard', 332, 306, 1, 'Greyguard', '灰卫堡', ['Grey Guard', '灰卫'], {
    en: 'An abandoned Wall castle west of the Nightfort. In the time of the novels the Wall near it lies unwatched, and raiders can scale the ice in this stretch.',
    zh: '夜堡以西一座废弃的长城城堡。小说时代，这一带的长城无人看守，野人可以从这里攀越冰墙。',
  }, {
    spoiler: {
      en: 'In A Dance with Dragons Jon Snow orders Janos Slynt to restore and command Greyguard; Slynt\'s refusal costs him his head.',
      zh: '《魔龙的狂舞》中，琼恩·雪诺命杰诺斯·史林特前去修复并镇守灰卫堡；史林特抗命，因此被斩首。',
    },
  }),
  WALL_CASTLE('stonedoor', 340, 306, 1, 'Stonedoor', '石门堡', ['Stone Door', '石门'], {
    en: 'An abandoned castle on the western half of the Wall. Its name suggests a gate of stone rather than the usual ice tunnel, though the books say little more.',
    zh: '长城西半段一座废弃的城堡。从名字看，它的门户或许是石砌的而非寻常的冰隧道，但书中着墨甚少。',
  }, {
    spoiler: { en: 'Jon Snow plans to garrison it with free folk in A Dance with Dragons.', zh: '《魔龙的狂舞》中，琼恩·雪诺计划让自由民进驻此堡。' },
  }),
  WALL_CASTLE('hoarfrost-hill', 348, 306, 1, 'Hoarfrost Hill', '白霜丘', ['霜丘堡'], {
    en: 'An abandoned castle along the Wall between Stonedoor and Icemark, empty since the Watch shrank.',
    zh: '长城上位于石门堡与冰痕堡之间的一座废弃城堡，自守夜人人手萎缩以来一直空置。',
  }),
  WALL_CASTLE('icemark', 355, 306, 1, 'Icemark', '冰痕堡', ['冰标堡'], {
    en: 'An abandoned Wall castle just west of the Nightfort. ' + 'Like most of its neighbours it has stood empty for generations.',
    zh: '夜堡以西不远的一座废弃长城城堡。' + ABANDONED_ZH,
  }, {
    spoiler: { en: 'Jon Snow means to reopen it with free folk in A Dance with Dragons.', zh: '《魔龙的狂舞》中，琼恩·雪诺打算让自由民重新进驻此堡。' },
  }),
  {
    id: 'nightfort', kind: 'ruin', region: 'north', at: [362, 306], rank: 3,
    names: { en: 'The Nightfort', zh: '夜堡' }, alt: ['Nightfort', 'Black Gate', '黑门'],
    summary: {
      en: 'The oldest and once the largest castle of the Wall, seat of the early Lord Commanders, abandoned some two hundred years before the novels. Old Nan\'s tales cling to it — the Night\'s King, the Rat Cook, the seventy-nine sentinels — and it hides the Black Gate, a weirwood door deep in the ice.',
      zh: '长城上最古老、也曾是最宏大的城堡，早年守夜人总司令的驻地，在小说开始前约两百年被弃。老奶妈的故事多与它相关——夜王、鼠厨师、七十九名哨兵；冰墙深处还藏着鱼梁木制成的“黑门”。',
    },
    houses: [], refs: ['agot', 'asos', 'adwd', 'twoiaf'], confidence: 'high',
    spoiler: {
      en: 'In A Storm of Swords Samwell Tarly leads Bran Stark\'s party north through the Black Gate. In A Dance with Dragons Stannis Baratheon has the Nightfort restored for his men.',
      zh: '《冰雨的风暴》中，山姆威尔·塔利领着布兰·史塔克一行穿过黑门北上。《魔龙的狂舞》中，史坦尼斯·拜拉席恩下令修复夜堡供其部下驻扎。',
    },
  },
  WALL_CASTLE('deep-lake', 370, 306, 1, 'Deep Lake', '深湖堡', ['Deeplake', '深湖'], {
    en: 'An abandoned castle between the Nightfort and Queensgate, presumably named for a lake on its southern side.',
    zh: '夜堡与王后门之间的一座废弃城堡，名字大概源于其南侧的一片湖泊。',
  }),
  WALL_CASTLE('queensgate', 377, 306, 2, 'Queensgate', '王后门', ['Snowgate', '雪门', '女王门'], {
    en: 'The nearest castle west of Castle Black. Once called Snowgate, it was renamed after Good Queen Alysanne visited the Wall in the reign of Jaehaerys I; it now stands empty.',
    zh: '黑城堡以西最近的一座城堡。它原名“雪门”，因贤后阿莉森在杰赫里斯一世在位时巡视长城而改名，如今已无人驻守。',
  }, { refs: ['adwd', 'twoiaf'] }),
  WALL_CASTLE('oakenshield', 393, 306, 1, 'Oakenshield', '橡盾堡', ['橡木盾'], {
    en: 'The first castle east of Castle Black, long abandoned.',
    zh: '黑城堡以东的第一座城堡，早已荒废。',
  }, {
    spoiler: { en: 'In A Dance with Dragons Jon Snow gives it to Tormund Giantsbane\'s free folk.', zh: '《魔龙的狂舞》中，琼恩·雪诺把此堡交给巨人克星托蒙德的自由民驻守。' },
  }),
  WALL_CASTLE('woodswatch-by-the-pool', 402, 305, 1, 'Woodswatch-by-the-Pool', '池畔林望堡', ['Woodswatch', '林望堡'], {
    en: 'An abandoned castle on the eastern half of the Wall, between Oakenshield and Sable Hall; its name recalls a pool and the forest it once watched.',
    zh: '长城东半段、橡盾堡与黑貂厅之间的一座废弃城堡；名字让人想起一片水塘和它昔日守望的森林。',
  }),
  WALL_CASTLE('sable-hall', 411, 305, 1, 'Sable Hall', '黑貂厅', ['黑貂堡'], {
    en: 'An abandoned castle east of Castle Black, between Woodswatch-by-the-Pool and Rimegate.',
    zh: '黑城堡以东的一座废弃城堡，位于池畔林望堡与冰霜门之间。',
  }),
  WALL_CASTLE('rimegate', 420, 305, 1, 'Rimegate', '冰霜门', ['雾凇门'], {
    en: 'An abandoned castle on the eastern stretch of the Wall, between Sable Hall and the Long Barrow.',
    zh: '长城东段一座废弃的城堡，位于黑貂厅与长垄堡之间。',
  }),
  WALL_CASTLE('long-barrow', 429, 305, 1, 'The Long Barrow', '长垄堡', ['Long Barrow', '长垄'], {
    en: 'An abandoned castle east of Castle Black. Its name evokes the long burial mounds of the First Men.',
    zh: '黑城堡以东的一座废弃城堡，名字令人联想到先民狭长的古墓。',
  }, {
    spoiler: { en: 'Jon Snow sends men to restore it in A Dance with Dragons.', zh: '《魔龙的狂舞》中，琼恩·雪诺派人修复此堡。' },
  }),
  WALL_CASTLE('the-torches', 438, 304, 1, 'The Torches', '火炬堡', ['Torches', '火炬'], {
    en: 'An abandoned castle near the eastern end of the Wall, between the Long Barrow and Greenguard.',
    zh: '长城东端附近的一座废弃城堡，位于长垄堡与绿卫堡之间。',
  }),
  WALL_CASTLE('greenguard', 447, 304, 1, 'Greenguard', '绿卫堡', ['绿卫'], {
    en: 'The last castle before Eastwatch, abandoned long ago.',
    zh: '东海望之前的最后一座城堡，很久以前就已弃守。',
  }),
  WALL_CASTLE('eastwatch-by-the-sea', 456, 306, 3, 'Eastwatch-by-the-Sea', '东海望', ['Eastwatch', '东海望城'], {
    en: 'The Watch\'s easternmost manned castle, where the Wall meets the Bay of Seals. It is also the Watch\'s port: its ships patrol the coast, carry recruits and trade with Braavos and the Free Cities. Cotter Pyke commands there.',
    zh: '守夜人在长城最东端仍有驻守的城堡，坐落在长城与海豹湾交汇处。它也是守夜人的港口：船只在此巡视海岸、运送新兵，并与布拉佛斯等自由贸易城邦通商。指挥官是科特·派克。',
  }, { refs: ['agot', 'asos', 'adwd', 'twoiaf'], confidence: 'high' }),
  // ------------------------------------------------------------------ the Gift
  {
    id: 'brandons-gift', kind: 'landmark', region: 'north', at: [346, 322], rank: 2,
    names: { en: 'The Gift', zh: '赠地' }, alt: ['Brandon\'s Gift', 'the Gift', '布兰登赠地'],
    summary: {
      en: 'A belt of land some twenty-five leagues deep south of the Wall, granted to the Night\'s Watch by Brandon the Builder for its upkeep. Once farmed by smallfolk who fed the castles, it has emptied as wildling raids grew bolder and the Watch dwindled.',
      zh: '长城以南纵深约二十五里格的一片土地，传说由筑城者布兰登赠予守夜人，以供养军团。昔日有平民在此耕作、供给各座城堡，随着野人劫掠日甚、守夜人日渐衰落，这里已人烟稀少。',
    },
    houses: [], refs: ['agot', 'adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'new-gift', kind: 'landmark', region: 'north', at: [346, 356], rank: 1,
    names: { en: 'The New Gift', zh: '新赠地' }, alt: ['New Gift', '新赠予地'],
    summary: {
      en: 'A second belt of land south of Brandon\'s Gift, added at the urging of Good Queen Alysanne in the reign of Jaehaerys I, when the Starks ceded it to the Watch. Like the old Gift it is now thinly peopled.',
      zh: '布兰登赠地以南的第二片赠地。杰赫里斯一世在位时，贤后阿莉森力劝史塔克家族将其让予守夜人。如今它与旧赠地一样人口稀落。',
    },
    houses: [], refs: ['adwd', 'twoiaf'], confidence: 'medium',
    spoiler: {
      en: 'In A Dance with Dragons Jon Snow begins settling free folk in the Gift.',
      zh: '《魔龙的狂舞》中，琼恩·雪诺开始让自由民在赠地定居。',
    },
  },
  {
    id: 'moles-town', kind: 'village', region: 'north', at: [386, 318], rank: 2,
    names: { en: 'Mole\'s Town', zh: '鼹鼠村' }, alt: ['Moles Town', 'Moletown', '鼹鼠镇'],
    summary: {
      en: 'A village about half a league south of Castle Black, mostly built underground so its people can ride out the winters. Brothers of the Watch slip down to its alehouse and its "buried treasure" — a brothel — though their vows forbid it.',
      zh: '黑城堡以南约半里格的一座村庄，房屋大多建在地下，好让村民熬过寒冬。守夜人弟兄常偷偷溜来光顾村里的酒馆和那处被戏称为“地下宝藏”的妓院，尽管誓言不容。',
    },
    houses: [], refs: ['agot', 'asos', 'adwd'], confidence: 'high',
    spoiler: {
      en: 'In A Storm of Swords the Thenns under Styr sack Mole\'s Town before attacking Castle Black from the south.',
      zh: '《冰雨的风暴》中，斯迪尔率领的瑟恩人洗劫鼹鼠村，随后从南面进攻黑城堡。',
    },
  },
  {
    id: 'queenscrown', kind: 'village', region: 'north', at: [394, 346], rank: 2,
    names: { en: 'Queenscrown', zh: '王后冠' }, alt: ['Queen\'s Crown', '女王冠'],
    summary: {
      en: 'A small, abandoned village in the Gift beside a lake, with a stone tower on an island in the water. It takes its name from Good Queen Alysanne, who is said to have stopped here on her way to the Wall.',
      zh: '赠地里一座荒废的小村，濒临一片湖泊，湖心小岛上立着一座石塔。村名来自贤后阿莉森，相传她前往长城途中曾在此驻跸。',
    },
    houses: [], refs: ['asos'], confidence: 'medium',
    spoiler: {
      en: 'In A Storm of Swords Bran Stark\'s party shelters in the island tower on the very night Jon Snow and the Thenns raid the village; Jon escapes there.',
      zh: '《冰雨的风暴》中，布兰·史塔克一行藏身湖心塔，恰逢琼恩·雪诺与瑟恩人夜袭村庄；琼恩也正是在那里脱身。',
    },
  },
  // ------------------------------------------------------------------ just north of the Wall
  {
    id: 'weirwood-grove-castle-black', kind: 'sacred', region: 'beyond-wall', at: [376, 292], rank: 1,
    names: { en: 'Weirwood grove (beyond Castle Black)', zh: '鱼梁木林（黑城堡以北）' }, alt: ['the nine weirwoods', 'heart tree grove', '九棵鱼梁木'],
    summary: {
      en: 'A ring of nine weirwoods in the Haunted Forest a little north of Castle Black. Brothers who keep the old gods ride out to say their vows here, as Jon Snow and Samwell Tarly do in A Game of Thrones.',
      zh: '黑城堡以北不远处、鬼影森林中由九棵鱼梁木围成的林间空地。信奉旧神的新兄弟会骑马出墙，在此立誓——《权力的游戏》中琼恩·雪诺与山姆威尔·塔利便是如此。',
    },
    houses: [], refs: ['agot'], confidence: 'medium',
  },
  {
    id: 'battle-beneath-the-wall', kind: 'battle', region: 'beyond-wall', at: [394, 292], rank: 1,
    names: { en: 'Battle beneath the Wall', zh: '长城下之战' }, alt: ['Battle of Castle Black', '黑城堡之战'],
    summary: {
      en: 'The fields north of Castle Black where Mance Rayder\'s host of free folk, giants and mammoths assaulted the Wall in A Storm of Swords. A handful of brothers held the tunnel gate through days of fighting.',
      zh: '黑城堡以北的原野。《冰雨的风暴》中，曼斯·雷德率领自由民、巨人与猛犸在此猛攻长城，少数守夜人弟兄连日死守隧道城门。',
    },
    houses: [], refs: ['asos'], confidence: 'high',
    spoiler: {
      en: 'Stannis Baratheon\'s army arrives by sea at Eastwatch and routs the wildling camp, capturing Mance.',
      zh: '史坦尼斯·拜拉席恩的军队经东海望从海路赶到，击溃野人营地并俘虏曼斯。',
    },
  },
  {
    id: 'the-gorge', kind: 'pass', region: 'beyond-wall', at: [324, 288], rank: 2,
    names: { en: 'The Gorge', zh: '大峡谷' }, alt: ['Gorge', '峡谷'],
    summary: {
      en: 'A deep chasm cutting through the mountains at the Wall\'s western end, one of the few ways south for raiders who cannot climb the ice. The Shadow Tower stands guard over it.',
      zh: '长城西端山地间的一道深谷，是不愿攀冰的劫掠者南下的少数通路之一，由影子塔把守。',
    },
    houses: [], refs: ['agot', 'asos', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'bridge-of-skulls', kind: 'landmark', region: 'beyond-wall', at: [314, 295], rank: 2,
    names: { en: 'Bridge of Skulls', zh: '骷髅桥' }, alt: ['Skull Bridge', '头骨桥'],
    summary: {
      en: 'An ancient stone bridge spanning the Gorge near the Shadow Tower, the scene of repeated battles between the Watch and wildling hosts trying to force a crossing.',
      zh: '影子塔附近横跨大峡谷的一座古老石桥，守夜人与试图强渡的野人大军曾在此屡屡交锋。',
    },
    houses: [], refs: ['agot', 'asos', 'twoiaf'], confidence: 'medium',
    spoiler: {
      en: 'During Mance Rayder\'s attack in A Storm of Swords, Ser Denys Mallister\'s men hold the bridge against a wildling assault.',
      zh: '《冰雨的风暴》中曼斯·雷德来犯期间，丹尼斯·马利斯特爵士的部下在此击退了野人的进攻。',
    },
  },
  // ------------------------------------------------------------------ the Haunted Forest
  {
    id: 'haunted-forest', kind: 'forest', region: 'beyond-wall', at: [400, 226], rank: 4,
    names: { en: 'The Haunted Forest', zh: '鬼影森林' }, alt: ['Haunted Forest', '闹鬼森林'],
    summary: {
      en: 'The vast, ancient forest that presses up against the Wall\'s northern face. The Night\'s Watch once kept it cleared for a long bowshot from the ice; now its pines, sentinels and weirwoods shelter wildlings, rangers on patrol, and worse.',
      zh: '紧贴长城北面的一片广袤原始森林。守夜人曾把冰墙前一箭之地的林木砍伐干净；如今松树、哨兵树和鱼梁木间藏着野人、巡逻的游骑兵，还有更可怕的东西。',
    },
    houses: [], refs: ['agot', 'acok', 'asos'], confidence: 'high',
  },
  {
    id: 'whitetree', kind: 'village', region: 'beyond-wall', at: [368, 262], rank: 2,
    names: { en: 'Whitetree', zh: '白树村' }, alt: ['White Tree', '白树'],
    summary: {
      en: 'A deserted wildling village in the Haunted Forest, dominated by an enormous, ancient weirwood whose carved face can swallow a child. It is the first stop of the Watch\'s great ranging in A Clash of Kings, and its emptiness is an early warning sign.',
      zh: '鬼影森林中一座空无一人的野人村落，中央矗立着一棵巨大的古老鱼梁木，树上刻出的脸庞张口大得能吞下一个孩子。《列王的纷争》中守夜人大举出巡的第一站即是此处，村庄的空寂是最早的不祥征兆之一。',
    },
    houses: [], refs: ['acok'], confidence: 'medium',
  },
  {
    id: 'crasters-keep', kind: 'landmark', region: 'beyond-wall', at: [392, 214], rank: 3,
    names: { en: 'Craster\'s Keep', zh: '卡斯特堡' }, alt: ['Crasters Keep', '卡斯特的堡垒'],
    summary: {
      en: 'A muddy wildling holdfast in the Haunted Forest — a single long hall behind an earthen dike — ruled by Craster, who takes his daughters as wives. Its master is friendly enough to the Watch to give rangers shelter, and his sons vanish into the woods.',
      zh: '鬼影森林中一处泥泞的野人据点：土堤环绕着一座长厅，主人卡斯特娶自己的女儿为妻。他与守夜人关系尚可，会收留游骑兵，而他的儿子们则一个个消失在林中。',
    },
    houses: [], refs: ['acok', 'asos'], confidence: 'high',
    spoiler: {
      en: 'In A Storm of Swords the survivors of the Fist mutiny here; Craster and Lord Commander Mormont are killed, and Gilly flees with Samwell Tarly.',
      zh: '《冰雨的风暴》中，先民拳峰的幸存者在此哗变，卡斯特与总司令莫尔蒙相继被杀，吉莉随山姆威尔·塔利逃离。',
    },
  },
  {
    id: 'fist-of-the-first-men', kind: 'ruin', region: 'beyond-wall', at: [372, 170], rank: 3,
    names: { en: 'Fist of the First Men', zh: '先民拳峰' }, alt: ['The Fist', '拳峰', '先民之拳'],
    summary: {
      en: 'A steep, lone hill rising above the Haunted Forest, crowned with the tumbled ringwall of an ancient First Men fort. Lord Commander Mormont makes it the base of his great ranging in A Clash of Kings, and Jon Snow finds a buried cache of dragonglass there.',
      zh: '突兀耸立于鬼影森林之上的一座孤山，山顶环绕着先民古堡坍塌的环形石墙。《列王的纷争》中，莫尔蒙总司令把这里定为大出巡的营地，琼恩·雪诺还在此掘出一批埋藏的龙晶。',
    },
    houses: [], refs: ['acok', 'asos'], confidence: 'high',
    spoiler: {
      en: 'At the opening of A Storm of Swords the Others and their wights overrun the camp; only a remnant of the Watch escapes.',
      zh: '《冰雨的风暴》开篇，异鬼与尸鬼攻陷营地，守夜人只有少数人突围。',
    },
  },
  // ------------------------------------------------------------------ the Frostfangs and the far north-west
  {
    id: 'milkwater', kind: 'river', region: 'beyond-wall', at: [352, 238], rank: 3,
    names: { en: 'The Milkwater', zh: '乳河' }, alt: ['Milkwater', '牛奶河'],
    summary: {
      en: 'A river born in the Frostfangs whose water runs pale and cloudy with silt. Mance Rayder gathers the free folk along its banks before marching on the Wall, which is why the Watch finds the villages of the Haunted Forest empty.',
      zh: '发源于霜雪之牙的一条河流，河水因夹带泥沙而浑浊发白。曼斯·雷德在河畔聚集自由民，准备进军长城——守夜人发现鬼影森林里的村庄空无一人，原因正在于此。',
    },
    houses: [], refs: ['acok', 'asos'], confidence: 'medium',
  },
  {
    id: 'frostfangs', kind: 'mountain', region: 'beyond-wall', at: [250, 96], rank: 4,
    names: { en: 'The Frostfangs', zh: '霜雪之牙' }, alt: ['Frostfangs', '霜牙山脉'],
    summary: {
      en: 'A savage range of jagged, snow-clad peaks in the west beyond the Wall. Its high valleys shelter the Thenns and other hardy free folk, and its passes — above all the Skirling Pass — lead down to the Milkwater.',
      zh: '长城以北西部一道险峻的山脉，峰峦嶙峋、终年积雪。高山谷地中栖居着瑟恩人等强悍的自由民，山间隘口——尤其是啸声隘口——通往乳河流域。',
    },
    houses: [], refs: ['acok', 'asos'], confidence: 'high',
  },
  {
    id: 'skirling-pass', kind: 'pass', region: 'beyond-wall', at: [292, 150], rank: 2,
    names: { en: 'Skirling Pass', zh: '啸声隘口' }, alt: ['The Skirling Pass', '尖啸隘口'],
    summary: {
      en: 'A high pass in the Frostfangs, named for the wind that shrieks through it. In A Clash of Kings Qhorin Halfhand leads a small band of rangers up it to spy on Mance Rayder\'s gathering.',
      zh: '霜雪之牙中的一处高山隘口，因狂风呼啸穿过而得名。《列王的纷争》中，断掌科林率一小队游骑兵攀上此隘，窥探曼斯·雷德的集结。',
    },
    houses: [], refs: ['acok'], confidence: 'high',
    spoiler: {
      en: 'Here Jon Snow, on Qhorin\'s orders, kills him and feigns desertion to join the wildlings.',
      zh: '琼恩·雪诺在此奉科林之命将其杀死，假装叛逃投向野人。',
    },
  },
  {
    id: 'thenn', kind: 'landmark', region: 'beyond-wall', at: [222, 44], rank: 2,
    names: { en: 'Thenn', zh: '瑟恩' }, alt: ['Valley of Thenn', 'Thenns', '瑟恩谷', '瑟恩人'],
    summary: {
      en: 'A hidden upland valley in the far north of the Frostfangs, home of the Thenns. Unlike most free folk they obey a lord, the Magnar, mine their own copper and tin, and fight in bronze armour.',
      zh: '霜雪之牙北部深处一片隐秘的高山谷地，是瑟恩人的家园。与大多数自由民不同，他们服从一位领主——马格纳，自行开采铜锡，身披青铜铠甲作战。',
    },
    houses: [], refs: ['asos', 'twoiaf'], confidence: 'low',
  },
  {
    id: 'frozen-shore', kind: 'landmark', region: 'beyond-wall', at: [174, 112], rank: 2,
    names: { en: 'The Frozen Shore', zh: '冰封海岸' }, alt: ['Frozen Shore', '冰冻海岸'],
    summary: {
      en: 'The bleak western coast north of the Bay of Ice. Its people drive dog sleds across the ice and hunt walrus and seal; some of them join Mance Rayder\'s host.',
      zh: '寒冰湾以北荒凉的西部海岸。这里的人驾着狗拉雪橇在冰面上奔驰，猎捕海象与海豹；其中一些人加入了曼斯·雷德的大军。',
    },
    houses: [], refs: ['acok', 'asos', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'land-of-always-winter', kind: 'mountain', region: 'beyond-wall', at: [440, 16], rank: 4,
    names: { en: 'The Land of Always Winter', zh: '永冬之地' }, alt: ['Lands of Always Winter', 'Land of Always Winter', '永冬之境'],
    summary: {
      en: 'The frozen, unmapped wastes at the top of the world, beyond the Haunted Forest and the Frostfangs. No one in the novels has charted it; legend says the Others come out of it when the long winters fall.',
      zh: '世界尽头冰封而未经测绘的荒原，位于鬼影森林与霜雪之牙以北。小说中无人绘制过它的地图；传说漫长的冬季降临时，异鬼便自此而来。',
    },
    houses: [], refs: ['agot', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'cave-of-the-three-eyed-crow', kind: 'sacred', region: 'beyond-wall', at: [444, 118], rank: 2,
    names: { en: 'Cave of the three-eyed crow', zh: '三眼乌鸦的洞穴' }, alt: ['hollow hill', 'cave of the last greenseer', '空心山', '三眼乌鸦之洞'],
    summary: {
      en: 'A cave system beneath a hollow hill far north of the Wall, threaded with weirwood roots, where the last of the children of the forest dwell. It is reached in A Dance with Dragons; its exact location is never given.',
      zh: '长城以北远方一座空心山下的洞穴网络，鱼梁木的根须盘绕其间，最后的森林之子栖身于此。《魔龙的狂舞》中才有人抵达；书中从未给出其确切位置。',
    },
    houses: [], refs: ['adwd'], confidence: 'low',
    spoiler: {
      en: 'Bran Stark, guided by Coldhands with Meera and Jojen Reed, reaches the cave and meets the last greenseer, who begins to teach him.',
      zh: '布兰·史塔克在冷手引领下，与梅拉、玖健·黎德一同抵达洞穴，见到最后的绿先知，并开始随其修习。',
    },
  },
  // ------------------------------------------------------------------ the eastern coast
  {
    id: 'hardhome',
    summary: {
      en: 'A natural harbour on the eastern coast beyond the Wall, once the closest thing the free folk had to a town. Some six centuries ago it was destroyed in a single night of fire and horror whose cause is still disputed, and since then wildlings shun the place as cursed.',
      zh: '长城以北东海岸的一处天然良港，曾是自由民最接近城镇的聚落。约六百年前，它在一夜之间毁于烈火与恐怖，原因至今众说纷纭；此后野人都视其为受诅咒之地，避之不及。',
    },
    houses: [], refs: ['acok', 'adwd', 'twoiaf'], confidence: 'medium',
    spoiler: {
      en: 'In A Dance with Dragons thousands of free folk following Mother Mole gather at Hardhome, starving and beset by the dead; the Watch\'s rescue fleet is wrecked by storms.',
      zh: '《魔龙的狂舞》中，数千名追随鼹鼠婆婆的自由民聚集于艰难屯，饥寒交迫，又遭死人侵袭；守夜人派去的救援船队被风暴打散。',
    },
  },
  {
    id: 'storrolds-point', kind: 'landmark', region: 'beyond-wall', at: [500, 274], rank: 1,
    names: { en: 'Storrold\'s Point', zh: '斯托罗德角' }, alt: ['Storrolds Point', '斯托洛德角'],
    summary: {
      en: 'A headland on the coast north of Eastwatch, between the Wall and Hardhome, on the shore of the Bay of Seals. It appears on the official maps; the books record little about it.',
      zh: '东海望以北海岸上的一处岬角，位于长城与艰难屯之间，濒临海豹湾。它出现在官方地图上，书中记载甚少。',
    },
    houses: [], refs: ['maps', 'adwd'], confidence: 'low',
  },
  {
    id: 'lorn-point', kind: 'landmark', region: 'beyond-wall', at: [570, 150], rank: 1,
    names: { en: 'Lorn Point', zh: '孤角' }, alt: ['孤寂角', '洛恩角'],
    summary: {
      en: 'A cape on the lonely eastern coast north of Hardhome, marked on the official maps. Beyond it the shore runs on towards the Land of Always Winter.',
      zh: '艰难屯以北荒凉东海岸上的一处海角，见于官方地图。过了此角，海岸线继续延伸向永冬之地。',
    },
    houses: [], refs: ['maps'], confidence: 'low',
  },
] };
