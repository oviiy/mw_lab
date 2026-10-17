// Places of the Crownlands — see docs/PLACES_SCHEMA.md
// Positions follow docs/MAP_GRID.md (coast control points of Blackwater Bay, Crackclaw Point and Massey's Hook in src/map/geo.js).
// Note: the schema has no "cape/peninsula" kind; Crackclaw Point is filed as forest (pine and bog), Massey's Hook as island.
export default { group: 'crownlands', places: [
  // ------------------------------------------------------------ existing 3D locations (summary + houses only)
  {
    id: 'kings-landing',
    summary: {
      en: 'Aegon the Conqueror landed here with his sisters and raised a timber fort on the highest of three hills; within a century it had become the largest city of the Seven Kingdoms. The Red Keep, the Great Sept of Baelor and the Dragonpit crown its hills, while the poor crowd into Flea Bottom below. It is crowded, rich and notorious for its smell.',
      zh: '征服者伊耿与两位姐妹在此登陆，在三座山丘中最高的一座上筑起木堡；不到百年，这里便成了七大王国最大的城市。红堡、贝勒大圣堂与龙穴各据山头，穷人则挤在山下的跳蚤窝里。城中人烟稠密、财富汇聚，气味之难闻也同样出名。',
    },
    houses: ['targaryen', 'blount', 'chelsted'],
    refs: ['agot', 'acok', 'twoiaf'],
    confidence: 'high',
    spoiler: {
      en: 'In A Feast for Crows the Great Sept becomes the seat of a newly armed Faith; by the end of A Dance with Dragons the city is ruled by a regency council after Kevan Lannister\'s murder.',
      zh: '《群鸦的盛宴》中，重新武装起来的教会以贝勒大圣堂为据点；至《魔龙的狂舞》结尾，凯冯·兰尼斯特遇刺，城中由摄政会议掌权。',
    },
  },
  {
    id: 'dragonstone',
    summary: {
      en: 'An island fortress beneath the smoking Dragonmont, raised by Valyrian masons whose stone seems shaped rather than cut, its walls crowded with dragons and gargoyles. The Targaryens held it for a century before the Conquest, and it became the traditional seat of the heir to the throne. In the books it is held by Stannis Baratheon and serves as his base in the war.',
      zh: '烟雾缭绕的龙山脚下的岛上要塞，由瓦雷利亚石匠建造，石材仿佛是被塑出来而非凿出来的，城墙上满是巨龙与石像鬼雕饰。征服之前，坦格利安家族已在此盘踞百年，此后这里传统上归王位继承人所有。小说中它由史坦尼斯·拜拉席恩据守，是他在战争中的根据地。',
    },
    houses: ['targaryen'],
    refs: ['acok', 'asos', 'twoiaf'],
    confidence: 'high',
  },
  // ------------------------------------------------------------ waters and land features
  {
    id: 'blackwater-bay', kind: 'bay', region: 'crownlands', at: [528, 934], rank: 3,
    names: { en: 'Blackwater Bay', zh: '黑水湾' }, alt: ['Blackwater'],
    summary: {
      en: 'The broad bay between Crackclaw Point and Massey\'s Hook, fed by the Blackwater Rush. King\'s Landing sits at its head, Duskendale on its northern shore, and Dragonstone and Driftmark guard its mouth. Whoever commands its waters controls the sea road to the capital.',
      zh: '夹在蟹爪半岛与梅西钩之间的宽阔海湾，黑水河注入其中。君临位于湾底，暮谷镇在北岸，龙石岛与潮头岛把守湾口。谁掌控这片水域，谁就扼住了通往首都的海路。',
    },
    houses: [], refs: ['agot', 'acok', 'maps'], confidence: 'high',
  },
  {
    id: 'blackwater-rush', kind: 'river', region: 'crownlands', at: [392, 920], rank: 3,
    names: { en: 'The Blackwater Rush', zh: '黑水河' }, alt: ['Blackwater', 'Blackwater River'],
    summary: {
      en: 'A deep, swift river running east from the hills of the westerlands, south of the Gods Eye, to empty into Blackwater Bay beneath King\'s Landing. It roughly marks the southern edge of the riverlands and is hard to ford near the capital. Its mouth was the scene of Stannis Baratheon\'s defeat in A Clash of Kings.',
      zh: '一条水深流急的河流，自西境丘陵向东奔流，经神眼湖以南，在君临城下注入黑水湾。它大致构成河间地的南界，靠近首都一带难以涉渡。《列王的纷争》中，史坦尼斯·拜拉席恩正是在其河口兵败。',
    },
    houses: [], refs: ['agot', 'acok', 'maps'], confidence: 'high',
  },
  {
    id: 'the-gullet', kind: 'bay', region: 'crownlands', at: [580, 957], rank: 2,
    names: { en: 'The Gullet', zh: '咽喉海峡' }, alt: ['Gullet', '咽喉'],
    summary: {
      en: 'The narrow sea passage between Driftmark and Massey\'s Hook, one of the gates between Blackwater Bay and the Narrow Sea. Ships bound for King\'s Landing from the south pass through it, which made it a natural battleground.',
      zh: '潮头岛与梅西钩之间的狭窄水道，是黑水湾通往狭海的门户之一。从南方驶往君临的船只必经此地，因而天然便是兵家必争之处。',
    },
    houses: ['velaryon'], refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'crackclaw-point', kind: 'forest', region: 'crownlands', at: [560, 886], rank: 3,
    names: { en: 'Crackclaw Point', zh: '蟹爪半岛' }, alt: ['Crackclaw'],
    summary: {
      en: 'A rugged peninsula of pine forest, bogs, hills and rocky shore between the Bay of Crabs and Blackwater Bay. Its petty lords and clannish folk distrust outsiders, feud among themselves, and kept faith with the Targaryens long after the dragons fell. Only the dragonlords ever truly brought it to heel.',
      zh: '位于螃蟹湾与黑水湾之间的崎岖半岛，松林、沼泽、丘陵与礁岸交错。这里的小领主和宗族乡民排斥外人、彼此世仇不断，龙王朝覆灭后仍长期心向坦格利安家族。真正让它俯首的，唯有当年的龙王。',
    },
    houses: ['brune-of-brownhollow', 'brune-of-the-dyre-den', 'boggs', 'crabb'],
    refs: ['acok', 'affc', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'masseys-hook', kind: 'island', region: 'crownlands', at: [566, 976], rank: 2,
    names: { en: 'Massey\'s Hook', zh: '梅西钩' }, alt: ['Masseys Hook'],
    summary: {
      en: 'The peninsula that closes Blackwater Bay to the south-east, reaching out toward Driftmark. Its castles — Sharp Point, Stonedance and Sweetport Sound — owe service to Dragonstone rather than to King\'s Landing. (A peninsula, filed here among islands for labelling.)',
      zh: '从东南方合拢黑水湾的半岛，向潮头岛方向伸出。半岛上的锐角城、石舞城和甜港湾等城堡效忠龙石岛，而非君临。（实为半岛，为标注方便归入岛屿类。）',
    },
    houses: ['massey', 'bar-emmon', 'sunglass'], refs: ['acok', 'twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'driftmark', kind: 'island', region: 'crownlands', at: [570, 944], rank: 3,
    names: { en: 'Driftmark', zh: '潮头岛' }, alt: ['Drift Mark'],
    summary: {
      en: 'The largest island in Blackwater Bay, lying west of Dragonstone. It is the ancient domain of House Velaryon, whose fleets and sea trade once made them the richest house in the realm. Its towns and shipyards face the Gullet and the bay.',
      zh: '黑水湾中最大的岛屿，位于龙石岛以西。这里是瓦列利安家族的古老领地，其舰队与海上贸易一度令该家族富甲王国。岛上城镇与船坞面朝咽喉海峡和海湾。',
    },
    houses: ['velaryon'], refs: ['acok', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'claw-isle', kind: 'island', region: 'crownlands', at: [602, 878], rank: 2,
    names: { en: 'Claw Isle', zh: '爪岛' }, alt: ['Claw Island'],
    summary: {
      en: 'A small island off the tip of Crackclaw Point, seat of House Celtigar, one of the Valyrian-descended houses that came west with the Targaryens. The Celtigars are said to keep a hoard of Myrish carpets, Volantene glass and gold plate in their castle.',
      zh: '蟹爪半岛尖端外的小岛，赛提加家族的居城所在；该家族与坦格利安家族一同西来，有瓦雷利亚血统。据说其城堡里藏着密尔地毯、瓦兰提斯玻璃器和金器。',
    },
    houses: ['celtigar'], refs: ['acok', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'dragonmont', kind: 'mountain', region: 'crownlands', at: [600, 921], rank: 2,
    names: { en: 'Dragonmont', zh: '龙山' }, alt: ['Dragon Mont'],
    summary: {
      en: 'The smoking volcano that rises behind the castle of Dragonstone. Its warm caves once housed the Targaryens\' dragons, and the island beneath it is rich in dragonglass. Sailors say it still rumbles and steams.',
      zh: '龙石岛城堡背后冒着烟的火山。山中温暖的洞穴曾是坦格利安家族巨龙的巢穴，山下岛上龙晶（即黑曜石）储量丰富。水手们说它至今仍会轰鸣、喷吐蒸汽。',
    },
    houses: ['targaryen'], refs: ['acok', 'adwd', 'twoiaf'], confidence: 'high',
  },
  // ------------------------------------------------------------ Driftmark
  {
    id: 'high-tide', kind: 'castle', region: 'crownlands', at: [580, 948], rank: 2,
    names: { en: 'High Tide', zh: '满潮堡' }, alt: ['高潮城', '潮汐堡'],
    summary: {
      en: 'The later seat of House Velaryon, built by the seafaring lord Corlys Velaryon on a tidal islet off Driftmark, reachable on foot only at low tide. Its halls were furnished with the wealth of his voyages. In the books it remains the Velaryon seat.',
      zh: '瓦列利安家族后期的居城，由航海家科利斯·瓦列利安伯爵建于潮头岛外的一座潮汐小岛上，只有退潮时才能步行抵达。城中陈设尽是他远航所得的财富。小说中这里仍是瓦列利安家族的居城。',
    },
    houses: ['velaryon'], refs: ['affc', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'castle-driftmark', kind: 'castle', region: 'crownlands', at: [560, 941], rank: 1,
    names: { en: 'Castle Driftmark', zh: '潮头堡' }, alt: ['Driftmark Castle'],
    summary: {
      en: 'The older seat of House Velaryon on the north side of the island, above the town of Hull. It was overshadowed once High Tide was built, but the Velaryons kept it as a second stronghold.',
      zh: '瓦列利安家族较早的居城，位于岛的北侧，俯临赫尔镇。满潮堡建成后它便退居次席，但瓦列利安家族仍将其作为第二座要塞。',
    },
    houses: ['velaryon'], refs: ['twoiaf'], confidence: 'medium',
  },
  {
    id: 'hull', kind: 'town', region: 'crownlands', at: [566, 939], rank: 1,
    names: { en: 'Hull', zh: '赫尔镇' }, alt: ['船壳镇'],
    summary: {
      en: 'A shipbuilding town beneath the walls of Castle Driftmark on the north side of the island. Its yards built many of the Velaryon ships that once made up the strength of the royal fleet.',
      zh: '潮头岛北侧、潮头堡城墙下的造船小镇。当年构成王家舰队主力的瓦列利安战船，不少出自这里的船坞。',
    },
    houses: ['velaryon'], refs: ['twoiaf'], confidence: 'medium',
  },
  {
    id: 'spicetown', kind: 'ruin', region: 'crownlands', at: [565, 948], rank: 1,
    names: { en: 'Spicetown', zh: '香料镇' }, alt: ['Spice Town'],
    summary: {
      en: 'Once a busy port on Driftmark\'s south shore near High Tide, grown rich on the Velaryon trade with the east. It was sacked and burned by a fleet from the Free Cities during the Dance of the Dragons and never rebuilt.',
      zh: '曾是潮头岛南岸、满潮堡附近的繁忙港口，靠瓦列利安家族与东方的贸易而致富。“血龙狂舞”期间遭自由贸易城邦的舰队洗劫焚毁，此后再未重建。',
    },
    houses: ['velaryon'], refs: ['twoiaf'], confidence: 'medium',
  },
  // ------------------------------------------------------------ Massey's Hook
  {
    id: 'sharp-point', kind: 'castle', region: 'crownlands', at: [583, 976], rank: 2,
    names: { en: 'Sharp Point', zh: '锐角城' }, alt: ['尖角城'],
    summary: {
      en: 'Seat of House Bar Emmon at the northern end of Massey\'s Hook, looking out over the Gullet toward Driftmark. Its young lord, Duram Bar Emmon, is among the Dragonstone bannermen who follow Stannis.',
      zh: '巴尔·艾蒙家族的居城，位于梅西钩北端，隔咽喉海峡遥望潮头岛。年轻的城主杜拉姆·巴尔·艾蒙是追随史坦尼斯的龙石岛封臣之一。',
    },
    houses: ['bar-emmon'], refs: ['acok', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'stonedance', kind: 'castle', region: 'crownlands', at: [570, 985], rank: 2,
    names: { en: 'Stonedance', zh: '石舞城' }, alt: ['Stone Dance'],
    summary: {
      en: 'Seat of the ancient House Massey on Massey\'s Hook, to which the peninsula owes its name. The Masseys are sworn to Dragonstone and sided with Stannis in the war.',
      zh: '古老的梅西家族的居城，坐落于以该家族命名的梅西钩上。梅西家族效忠龙石岛，在战争中站在史坦尼斯一边。',
    },
    houses: ['massey'], refs: ['acok', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'sweetport-sound', kind: 'castle', region: 'crownlands', at: [549, 993], rank: 1,
    names: { en: 'Sweetport Sound', zh: '甜港湾' }, alt: ['Sweetport'],
    summary: {
      en: 'Seat of House Sunglass on Massey\'s Hook, sworn to Dragonstone. Its lord Guncer Sunglass was a devout follower of the Seven who balked at Stannis\'s new red faith.',
      zh: '桑格拉斯家族的居城，位于梅西钩，效忠龙石岛。城主冈瑟·桑格拉斯是虔诚的七神信徒，对史坦尼斯改奉的红神信仰心存抵触。',
    },
    houses: ['sunglass'], refs: ['asos', 'twoiaf'], confidence: 'low',
  },
  // ------------------------------------------------------------ the northern shore and the hinterland of King's Landing
  {
    id: 'stokeworth', kind: 'castle', region: 'crownlands', at: [490, 915], rank: 2,
    names: { en: 'Stokeworth', zh: '史铎克渥斯' }, alt: ['Castle Stokeworth', '史铎克渥斯城'],
    summary: {
      en: 'A castle with farmland a short way north of King\'s Landing, seat of House Stokeworth. With Rosby, its fields helped feed the capital during the war. Lady Tanda\'s family spends much of its time at court.',
      zh: '君临以北不远处一座带有农田的城堡，史铎克渥斯家族的居城。战争期间，它与罗斯比的田地一同为首都提供口粮。坦妲夫人一家常年流连宫廷。',
    },
    houses: ['stokeworth'], refs: ['asos', 'affc'], confidence: 'medium',
    spoiler: {
      en: 'In A Feast for Crows the sellsword Bronn becomes master of Stokeworth through his marriage to Lollys and the deaths of her mother and sister.',
      zh: '《群鸦的盛宴》中，佣兵波隆因娶了罗莉丝，又逢其母亲与姐姐相继死去，成了史铎克渥斯的主人。',
    },
  },
  {
    id: 'rosby', kind: 'castle', region: 'crownlands', at: [480, 908], rank: 2,
    names: { en: 'Rosby', zh: '罗斯比城' }, alt: ['Rosby Castle'],
    summary: {
      en: 'A small castle and town just north-east of King\'s Landing on the Rosby road, the shortest way from the capital to Duskendale. Its lord, the coughing Gyles Rosby, sits on the small council. Its granaries mattered when the capital went hungry.',
      zh: '君临东北不远、罗斯比路旁的小城堡与市镇；罗斯比路是首都通往暮谷镇的最近路线。城主盖尔斯·罗斯比咳嗽不止，在御前会议任职。首都闹饥荒时，这里的粮仓举足轻重。',
    },
    houses: ['rosby'], refs: ['acok', 'affc'], confidence: 'medium',
  },
  {
    id: 'duskendale', kind: 'town', region: 'crownlands', at: [506, 906], rank: 3,
    names: { en: 'Duskendale', zh: '暮谷镇' }, alt: ['Dusk', '暮谷城'],
    summary: {
      en: 'A port town on the northern shore of Blackwater Bay that takes King\'s Landing\'s overflow trade. Its lords the Darklyns once held King Aerys II prisoner here for half a year — the Defiance of Duskendale — and were destroyed for it; House Rykker now rules from the Dun Fort.',
      zh: '黑水湾北岸的港口城镇，分担君临容纳不下的贸易。其旧领主达克林家族曾将国王伊里斯二世扣押于此长达半年，史称“暮谷镇之变”，事后满门被灭；如今由雷克家族在暗堡统治。',
    },
    houses: ['rykker', 'darklyn', 'hollard'], refs: ['asos', 'affc', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'dun-fort', kind: 'castle', region: 'crownlands', at: [511, 912], rank: 1,
    names: { en: 'The Dun Fort', zh: '暗堡' }, alt: ['Dun Fort'],
    summary: {
      en: 'The castle overlooking Duskendale\'s harbour. Aerys II was held captive in its dungeons during the Defiance until Ser Barristan Selmy entered the town alone and brought him out.',
      zh: '俯临暮谷镇港口的城堡。“暮谷镇之变”期间，伊里斯二世被囚于其地牢，直到巴利斯坦·赛尔弥爵士只身潜入，将他救出。',
    },
    houses: ['rykker', 'darklyn'], refs: ['asos', 'affc'], confidence: 'medium',
  },
  {
    id: 'rooks-rest', kind: 'castle', region: 'crownlands', at: [532, 906], rank: 2,
    names: { en: 'Rook\'s Rest', zh: '鸦栖堡' }, alt: ['Rooks Rest'],
    summary: {
      en: 'Seat of House Staunton on the northern shore of Blackwater Bay, beyond Duskendale toward Crackclaw Point. It is remembered chiefly for a battle of the Dance of the Dragons fought around its walls.',
      zh: '斯坦顿家族的居城，位于黑水湾北岸、暮谷镇以东通往蟹爪半岛的方向。它之所以为人铭记，主要因为“血龙狂舞”中在其城下爆发的一场大战。',
    },
    houses: ['staunton'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'hayford', kind: 'castle', region: 'crownlands', at: [444, 915], rank: 2,
    names: { en: 'Hayford', zh: '海福特城' }, alt: ['Hayford Castle'],
    summary: {
      en: 'A hilltop castle beside a stream, less than a day\'s ride from King\'s Landing. Jaime Lannister\'s host camps beneath it on the way to Riverrun; its lady is the infant Ermesande Hayford, married to the missing Tyrek Lannister.',
      zh: '建在小山顶上的城堡，旁有溪流，距君临不到一天路程。詹姆·兰尼斯特率军前往奔流城途中曾在山下扎营；城主是尚在襁褓中的艾梅散德·海福特，她已与失踪的泰瑞克·兰尼斯特成婚。',
    },
    houses: ['hayford', 'hogg'], refs: ['affc'], confidence: 'medium',
  },
  {
    id: 'sows-horn', kind: 'castle', region: 'crownlands', at: [452, 897], rank: 1,
    names: { en: 'Sow\'s Horn', zh: '母猪角' }, alt: ['Sows Horn'],
    summary: {
      en: 'A stout stone towerhouse near the riverlands border, seat of the landed knights of House Hogg, who serve the Hayfords. Lannister raiders tried to burn it during the war, but its thick walls would not catch.',
      zh: '靠近河间地边界的一座坚固石砌塔楼，霍格家族的居所；该家族是有封地的骑士，侍奉海福特家族。战争中兰尼斯特的劫掠部队曾试图纵火焚烧，但厚实的石墙烧不起来。',
    },
    houses: ['hogg'], refs: ['awoiaf'], confidence: 'low',
  },
  {
    id: 'the-antlers', kind: 'castle', region: 'crownlands', at: [474, 890], rank: 1,
    names: { en: 'The Antlers', zh: '鹿角堡' }, alt: ['Antlers'],
    summary: {
      en: 'Seat of House Buckwell, north of King\'s Landing and north-west of Rosby and Duskendale. It is a modest lordship of the king\'s own domain, rarely visited in the novels.',
      zh: '巴克威尔家族的居城，位于君临以北、罗斯比与暮谷镇的西北方。这是王室直辖领地内一处不大的领主封地，小说中鲜少着墨。',
    },
    houses: ['buckwell'], refs: ['twoiaf', 'awoiaf'], confidence: 'low',
  },
  // ------------------------------------------------------------ Crackclaw Point
  {
    id: 'brownhollow', kind: 'castle', region: 'crownlands', at: [530, 884], rank: 1,
    names: { en: 'Brownhollow', zh: '褐谷堡' }, alt: ['Brown Hollow'],
    summary: {
      en: 'One of the two seats of House Brune on Crackclaw Point, a modest holdfast among the pines and bogs. Like its neighbours it guards its independence jealously.',
      zh: '布伦家族在蟹爪半岛的两处居所之一，是松林与沼泽间一座不大的据点。与邻居们一样，它对自家的独立看得极重。',
    },
    houses: ['brune-of-brownhollow'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'dyre-den', kind: 'castle', region: 'crownlands', at: [546, 892], rank: 1,
    names: { en: 'The Dyre Den', zh: '凶穴堡' }, alt: ['Dyre Den'],
    summary: {
      en: 'The other seat of House Brune on Crackclaw Point. Like the rest of the Crackclaw lords, the Brunes had to choose between Stannis and the Iron Throne after the Blackwater, when the crown offered pardons.',
      zh: '布伦家族在蟹爪半岛的另一处居城。黑水河之役后王室提出赦免，布伦家族与蟹爪半岛其他领主一样，不得不在史坦尼斯与铁王座之间作出抉择。',
    },
    houses: ['brune-of-the-dyre-den'], refs: ['affc', 'twoiaf', 'awoiaf'], confidence: 'low',
  },
  {
    id: 'the-whispers', kind: 'ruin', region: 'crownlands', at: [554, 875], rank: 2,
    names: { en: 'The Whispers', zh: '低语堡' }, alt: ['Whispers'],
    summary: {
      en: 'A ruined castle on the cliffs of Crackclaw Point, once held by House Crabb and linked in local legend to the giant Ser Clarence Crabb. Smugglers use its cove, and in A Feast for Crows Brienne\'s search leads her there with the guide Nimble Dick.',
      zh: '蟹爪半岛海崖上的一座城堡废墟，昔日归克莱勃家族所有，当地传说将它与巨人般的克拉伦斯·克莱勃爵士联系在一起。走私者利用其下的海湾；《群鸦的盛宴》中，布蕾妮在向导“灵巧的迪克”带领下寻访至此。',
    },
    houses: ['crabb'], refs: ['affc'], confidence: 'medium',
    spoiler: {
      en: 'At the Whispers Brienne runs into survivors of the Brave Companions; Nimble Dick is killed and Brienne kills the outlaws in the fight.',
      zh: '布蕾妮在低语堡撞上勇士团的残余匪徒；灵巧的迪克遇害，布蕾妮在搏斗中将这些亡命徒尽数杀死。',
    },
  },
  // ------------------------------------------------------------ battles
  {
    id: 'battle-of-the-blackwater', kind: 'battle', region: 'crownlands', at: [485, 935], rank: 2,
    names: { en: 'Battle of the Blackwater', zh: '黑水河之役' }, alt: ['Blackwater battle', '黑水河之战'],
    summary: {
      en: 'Stannis Baratheon\'s assault on King\'s Landing in A Clash of Kings. His fleet was trapped by a chain across the river mouth and set ablaze with wildfire, and his army on the south bank broke when Tywin Lannister and the Tyrells fell on its flank.',
      zh: '《列王的纷争》中史坦尼斯·拜拉席恩对君临的进攻。他的舰队被横跨河口的铁链困住，遭野火焚毁；南岸大军又被泰温·兰尼斯特与提利尔家族的援军从侧翼击溃。',
    },
    houses: [], refs: ['acok'], confidence: 'high',
  },
  {
    id: 'battle-of-the-gullet', kind: 'battle', region: 'crownlands', at: [574, 959], rank: 1,
    names: { en: 'Battle of the Gullet', zh: '咽喉海峡之战' }, alt: ['Gullet battle'],
    summary: {
      en: 'One of the bloodiest sea battles in Westerosi history, fought during the Dance of the Dragons when the Triarchy\'s fleet tried to force the Gullet. Velaryon ships, dragons and burning galleys filled the strait.',
      zh: '维斯特洛历史上最惨烈的海战之一，发生于“血龙狂舞”期间，三城联盟的舰队企图强闯咽喉海峡。瓦列利安战船、巨龙与燃烧的桨帆船挤满了整条海峡。',
    },
    houses: ['velaryon', 'targaryen'], refs: ['twoiaf'], confidence: 'medium',
  },
  {
    id: 'battle-of-rooks-rest', kind: 'battle', region: 'crownlands', at: [537, 900], rank: 1,
    names: { en: 'Battle of Rook\'s Rest', zh: '鸦栖堡之战' }, alt: ['Rooks Rest battle'],
    summary: {
      en: 'An ambush of the Dance of the Dragons: when Princess Rhaenys flew her dragon Meleys to relieve Rook\'s Rest, she was set upon by Aegon II and Prince Aemond on their dragons, and she and Meleys were killed.',
      zh: '“血龙狂舞”中的一场伏击：雷妮丝公主骑着巨龙米勒斯前来为鸦栖堡解围，遭伊耿二世与伊蒙德王子驾龙围攻，她与米勒斯双双殒命。',
    },
    houses: ['staunton', 'targaryen'], refs: ['twoiaf'], confidence: 'medium',
  },
] };
