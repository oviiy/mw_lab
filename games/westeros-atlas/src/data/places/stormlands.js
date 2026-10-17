// Places of this group — see docs/PLACES_SCHEMA.md
// Positions marked confidence 'low' are placed only by the region's general layout: the books and companions name these seats
// but give no reliable bearing. Chinese names marked ◇ in the glossary sense are project renderings (no settled edition form verified).
export default { group: 'stormlands', places: [
  // ------------------------------------------------------------------ existing 3D location (summary + houses only)
  {
    id: 'storms-end',
    summary: {
      en: "Ancestral seat of the Storm Kings and then of House Baratheon, raised on the cliffs above Shipbreaker Bay. Legend says Durran Godsgrief built six castles that the gods' storms threw down before the seventh, with Bran the Builder's help, finally stood. Its curved walls and single great drum tower have never been taken by storm, and Stannis held it through a year-long siege during Robert's Rebellion.",
      zh: '风暴之王的祖居，后为拜拉席恩家族居城，矗立于破船湾畔的悬崖之上。传说“神怒”杜兰连建六座城堡皆被众神的风暴摧毁，第七座在筑城者布兰登协助下终于屹立不倒。其弧形城墙与唯一一座巨大的圆形塔楼从未被强攻攻破；劳勃叛乱期间，史坦尼斯曾在此坚守长达一年的围城。',
    },
    houses: ['baratheon', 'durrandon', 'penrose'],
    refs: ['agot', 'acok', 'asos', 'twoiaf'],
    confidence: 'high',
    spoiler: {
      en: "In 299 AC Renly besieges the castle and dies in his camp before its walls; its castellan Ser Cortnay Penrose dies soon after, and the castle passes to Stannis. Davos later smuggles Robert's bastard Edric Storm away from Dragonstone.",
      zh: '299年，蓝礼兵围此城，却死在城下的营帐之中；代理城主科塔奈·盘罗斯爵士随即身亡，城堡落入史坦尼斯之手。后来戴佛斯将劳勃的私生子艾德瑞克·风暴偷偷送离龙石岛。',
    },
  },

  // ------------------------------------------------------------------ nature
  {
    id: 'kingswood', kind: 'forest', region: 'stormlands', at: [494, 976], rank: 4,
    names: { en: 'The Kingswood', zh: '御林' }, alt: ['Kingswood', '国王森林'],
    summary: {
      en: "A great old forest of oak and undergrowth spreading south of King's Landing towards Storm's End, crossed by the kingsroad. In Aerys II's reign it sheltered the outlaw Kingswood Brotherhood until Ser Arthur Dayne and other knights of the Kingsguard broke them; the young Jaime Lannister was knighted during that campaign.",
      zh: '一片古老辽阔的橡树林，从君临以南一直延伸到风息堡方向，国王大道穿林而过。伊里斯二世在位时，“御林兄弟会”盗匪藏身林中，直到亚瑟·戴恩爵士等御林铁卫将其剿灭；年少的詹姆·兰尼斯特便是在那次征讨中受封骑士。',
    },
    houses: [], refs: ['agot', 'asos', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'wendwater', kind: 'river', region: 'stormlands', at: [506, 1012], rank: 2,
    names: { en: 'The Wendwater', zh: '温德河' }, alt: ['Wendwater'],
    summary: {
      en: "A river of the northern stormlands that runs east along the southern edge of the Kingswood to Shipbreaker Bay, north of Storm's End. It is a feature of the official maps more than of the novels' action, and its course here is approximate.",
      zh: '风暴地北部的一条河流，沿御林南缘向东流入破船湾，河口位于风息堡以北。它主要见于官方地图，在小说情节中着墨不多；此处所绘河道仅为大致走向。',
    },
    houses: [], refs: ['maps', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'slayne', kind: 'river', region: 'stormlands', at: [490, 1132], rank: 1,
    names: { en: 'The Slayne', zh: '斯雷恩河' }, alt: ['Slayne'],
    summary: {
      en: "A river of the southern stormlands that drains the Dornish Marches towards the Sea of Dorne, near Stonehelm and the northern end of the Boneway. Known from the official maps; its exact course is not described in the novels.",
      zh: '风暴地南部的一条河流，从多恩边疆地向多恩海流去，靠近石盔城与骸骨路北端。此河见于官方地图，小说中并未描述其确切流向。',
    },
    houses: [], refs: ['maps', 'twoiaf'], confidence: 'low',
  },
  {
    id: 'rainwood', kind: 'forest', region: 'stormlands', at: [594, 1076], rank: 3,
    names: { en: 'The Rainwood', zh: '雨林' }, alt: ['Rainwood'],
    summary: {
      en: "A dense, dripping forest that covers much of Cape Wrath, fed by the storms that blow in off the Narrow Sea. Its tangled, boggy country made it a hard place to hunt down outlaws or move an army through.",
      zh: '覆盖怒角大部的一片茂密湿林，狭海吹来的风暴使它终年滴水不止。林中地形纠结、泥泞难行，无论追剿盗匪还是行军都十分艰难。',
    },
    houses: ['wylde', 'mertyns', 'morrigen'], refs: ['acok', 'asos', 'adwd', 'twoiaf'], confidence: 'high',
    spoiler: {
      en: "Stannis names Davos Seaworth Lord of the Rainwood, granting him lands on Cape Wrath (A Storm of Swords).",
      zh: '史坦尼斯册封戴佛斯·席渥斯为“雨林伯爵”，赐他怒角上的领地（《冰雨的风暴》）。',
    },
  },
  {
    id: 'cape-wrath', kind: 'landmark', region: 'stormlands', at: [608, 1100], rank: 3,
    names: { en: 'Cape Wrath', zh: '怒角' },
    summary: {
      en: "The great eastern peninsula of the stormlands, thrusting into the Narrow Sea between Shipbreaker Bay and the Sea of Dorne. Most of it lies under the Rainwood; Griffin's Roost, Rain House and Mistwood stand on or near it, and the isle of Tarth lies just off its eastern shore.",
      zh: '风暴地向东伸入狭海的大半岛，北临破船湾，南临多恩海。半岛大部为雨林所覆盖，狮鹫栖息地、雨屋与雾林堡都坐落于其上或附近，塔斯岛就在它东岸之外。',
    },
    houses: [], refs: ['acok', 'adwd', 'maps', 'twoiaf'], confidence: 'high',
    spoiler: {
      en: "In A Dance with Dragons the Golden Company lands on Cape Wrath and quickly seizes several of its castles in the name of a young claimant presented as Aegon Targaryen.",
      zh: '在《魔龙的狂舞》中，黄金团登陆怒角，以一位自称伊耿·坦格利安的少年的名义迅速夺取了当地数座城堡。',
    },
  },
  {
    id: 'shipbreaker-bay', kind: 'bay', region: 'stormlands', at: [580, 1016], rank: 4,
    names: { en: 'Shipbreaker Bay', zh: '破船湾' },
    summary: {
      en: "The storm-wracked bay between Massey's Hook and Cape Wrath, with Storm's End on its western shore; its name is earned by the gales that sweep in from the Narrow Sea. Lord Steffon Baratheon and his wife Cassana drowned here when their ship broke apart within sight of the castle, watched by their sons Robert and Stannis.",
      zh: '位于梅西钩与怒角之间、风暴肆虐的海湾，风息堡坐落在其西岸；狭海吹来的狂风让它名副其实。史蒂芬·拜拉席恩公爵与妻子卡珊娜的座船就在城堡视野之内的海面上解体沉没，他们的儿子劳勃与史坦尼斯亲眼目睹了这一幕。',
    },
    houses: [], refs: ['agot', 'acok', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'sea-of-dorne', kind: 'bay', region: 'stormlands', at: [566, 1162], rank: 3,
    names: { en: 'Sea of Dorne', zh: '多恩海' },
    summary: {
      en: "The inland sea between the stormlands' southern coast and northern Dorne, opening east onto the Stepstones and the Narrow Sea. Stonehelm and Weeping Town stand on its northern shore, Dornish ports on the southern.",
      zh: '介于风暴地南岸与多恩北部之间的内海，向东通往石阶列岛与狭海。石盔城与哭泣镇位于北岸，多恩的港口则散布于南岸。',
    },
    houses: [], refs: ['maps', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'straits-of-tarth', kind: 'bay', region: 'stormlands', at: [650, 1076], rank: 2,
    names: { en: 'Straits of Tarth', zh: '塔斯海峡' }, alt: ['Tarth Straits'],
    summary: {
      en: "The narrow channel separating the isle of Tarth from the tip of Cape Wrath, a passage for ships rounding the stormlands between the Narrow Sea and the Sea of Dorne.",
      zh: '分隔塔斯岛与怒角尖端的狭窄水道，往来于狭海与多恩海、绕行风暴地的船只多经此处。',
    },
    houses: [], refs: ['maps', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'tarth', kind: 'island', region: 'stormlands', at: [657, 1054], rank: 3,
    names: { en: 'Tarth', zh: '塔斯岛' }, alt: ['Sapphire Isle', '蓝宝石岛', '塔斯'],
    summary: {
      en: "A mountainous island off Cape Wrath, called the Sapphire Isle for the deep blue of the waters around it. It is ruled from Evenfall Hall by House Tarth, whose lord in the novels is Selwyn the Evenstar, father of Brienne.",
      zh: '怒角外海的一座多山岛屿，因四周海水湛蓝而被称为“蓝宝石岛”。塔斯家族从暮临厅统治全岛，小说中的岛主是“暮星”赛尔温，即布蕾妮的父亲。',
    },
    houses: ['tarth'], refs: ['acok', 'affc', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'estermont', kind: 'island', region: 'stormlands', at: [646, 1126], rank: 2,
    names: { en: 'Estermont', zh: '伊斯蒙岛' },
    summary: {
      en: "An island off the southern tip of Cape Wrath, held by House Estermont from Greenstone. Through Lady Cassana Estermont, the mother of Robert, Stannis and Renly, the island's lords are close kin of the Baratheon kings.",
      zh: '怒角南端外海的一座岛屿，伊斯蒙家族在绿石堡统治此岛。劳勃、史坦尼斯与蓝礼的母亲卡珊娜夫人出身伊斯蒙家族，因此岛上的领主与拜拉席恩诸王是近亲。',
    },
    houses: ['estermont'], refs: ['acok', 'affc', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'dornish-marches', kind: 'mountain', region: 'stormlands', at: [440, 1124], rank: 3,
    names: { en: 'The Dornish Marches', zh: '多恩边疆地' }, alt: ['Marches', 'the Marches', '边疆地'],
    summary: {
      en: "The hilly borderland along the northern foothills of the Red Mountains, where the stormlands and the Reach face Dorne. Its marcher lords — Caron, Dondarrion, Swann, Selmy and others — kept watch on the mountain passes through centuries of border war.",
      zh: '赤红山脉北麓的丘陵边地，风暴地与河湾地在此与多恩对峙。卡伦、唐德利恩、史文、赛尔弥等边疆诸侯世代扼守山口，经历了数百年的边境战争。',
    },
    houses: ['caron', 'dondarrion', 'swann', 'selmy'], refs: ['agot', 'acok', 'twoiaf'], confidence: 'high',
  },

  // ------------------------------------------------------------------ the northern stormlands
  {
    id: 'bronzegate', kind: 'castle', region: 'stormlands', at: [494, 1004], rank: 2,
    names: { en: 'Bronzegate', zh: '铜门城' },
    summary: {
      en: "Seat of House Buckler, standing by the kingsroad on the way from King's Landing to Storm's End, near the southern edge of the Kingswood. The castle takes its name from its gates of bronze; the Bucklers are old bannermen of Storm's End.",
      zh: '巴克勒家族的居城，位于从君临前往风息堡的国王大道旁，临近御林南缘。城堡因其青铜大门而得名；巴克勒家族是风息堡的老封臣。',
    },
    houses: ['buckler'], refs: ['acok', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'felwood', kind: 'castle', region: 'stormlands', at: [486, 1040], rank: 2,
    names: { en: 'Felwood', zh: '费尔林堡' },
    summary: {
      en: "Seat of House Fell in the northern stormlands. Lord Fell was one of the loyalist lords Robert Baratheon defeated in the three battles he fought in a single day at Summerhall early in his rebellion.",
      zh: '费尔家族的居城，位于风暴地北部。劳勃起兵之初曾在盛夏厅一日之内连打三仗，费尔公爵便是被他击败的效忠王室的领主之一。',
    },
    houses: ['fell'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'haystack-hall', kind: 'castle', region: 'stormlands', at: [562, 1046], rank: 2,
    names: { en: 'Haystack Hall', zh: '草垛厅' },
    summary: {
      en: "Seat of House Errol, near the shore of Shipbreaker Bay between Storm's End and Cape Wrath. The Errols are a minor house sworn to Storm's End.",
      zh: '艾罗尔家族的居城，位于破船湾沿岸，介于风息堡与怒角之间。艾罗尔家族是效忠风息堡的小家族。',
    },
    houses: ['errol'], refs: ['adwd', 'twoiaf'], confidence: 'low',
    spoiler: {
      en: "The Golden Company takes Haystack Hall during its campaign in the stormlands (A Dance with Dragons).",
      zh: '黄金团在风暴地作战期间攻占了草垛厅（《魔龙的狂舞》）。',
    },
  },
  {
    id: 'parchments', kind: 'castle', region: 'stormlands', at: [546, 1062], rank: 1,
    names: { en: 'Parchments', zh: '羊皮纸城' },
    summary: {
      en: "Seat of House Penrose, whose arms show crossed quills. Ser Cortnay Penrose of this house was castellan of Storm's End for Stannis in 299 AC. The castle's position is not described; it is placed here only within the northern stormlands.",
      zh: '盘罗斯家族的居城，其纹章为交叉的羽毛笔。299年为史坦尼斯镇守风息堡的代理城主科塔奈·盘罗斯爵士即出身此家。书中未描述城堡位置，此处仅大致标在风暴地北部。',
    },
    houses: ['penrose'], refs: ['acok', 'twoiaf'], confidence: 'low',
  },
  {
    id: 'gallowsgrey', kind: 'castle', region: 'stormlands', at: [514, 1074], rank: 1,
    names: { en: 'Gallowsgrey', zh: '灰绞架堡' },
    summary: {
      en: "Seat of House Trant, a minor stormland house best known for Ser Meryn Trant of King Joffrey's Kingsguard. Its exact location is not given; the marker is approximate.",
      zh: '特恩特家族的居城。这一风暴地小家族最出名的成员是乔佛里国王的御林铁卫马林·特恩特爵士。城堡确切位置不详，此处标注仅为大致。',
    },
    houses: ['trant'], refs: ['agot', 'twoiaf'], confidence: 'low',
  },
  {
    id: 'the-last-storm', kind: 'battle', region: 'stormlands', at: [512, 1044], rank: 2,
    names: { en: 'The Last Storm', zh: '最后的风暴' }, alt: ['Battle of the Last Storm'],
    summary: {
      en: "The battle of Aegon's Conquest in which Orys Baratheon defeated Argilac the Arrogant, last of the Storm Kings, and slew him. Orys then wed Argilac's daughter Argella and took his arms and words, founding House Baratheon at Storm's End. The exact field is not fixed; it is marked near the castle.",
      zh: '伊耿征服战争中的一场战役：奥里斯·拜拉席恩击败并斩杀了末代风暴之王“傲慢的”阿基拉克。随后奥里斯娶了阿基拉克之女阿捷拉，承袭其纹章与族语，在风息堡开创拜拉席恩家族。战场确切位置不详，此处标在风息堡附近。',
    },
    houses: ['durrandon', 'baratheon'], refs: ['agot', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'fawnton', kind: 'castle', region: 'stormlands', at: [468, 1056], rank: 1,
    names: { en: 'Fawnton', zh: '小鹿城' },
    summary: {
      en: "Seat of House Cafferen in the western stormlands. Lord Cafferen marched for King Aerys early in Robert's Rebellion and was beaten by Robert at Summerhall.",
      zh: '卡夫伦家族的居城，位于风暴地西部。劳勃叛乱之初，卡夫伦公爵举兵支持伊里斯国王，结果在盛夏厅败于劳勃之手。',
    },
    houses: ['cafferen'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'grandview', kind: 'castle', region: 'stormlands', at: [458, 1082], rank: 1,
    names: { en: 'Grandview', zh: '远景堡' },
    summary: {
      en: "Seat of House Grandison in the western stormlands. Lord Grandison was among the loyalist lords who gathered at Summerhall against Robert in 282 AC and were defeated there.",
      zh: '葛兰狄森家族的居城，位于风暴地西部。282年，葛兰狄森公爵与其他效忠王室的领主聚集盛夏厅讨伐劳勃，却在那里战败。',
    },
    houses: ['grandison'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'poddingfield', kind: 'castle', region: 'stormlands', at: [500, 1092], rank: 1,
    names: { en: 'Poddingfield', zh: '豆田堡' },
    summary: {
      en: "Seat of House Peasebury, a minor house of the stormlands sworn to Storm's End. Little is told of the castle itself, and its position is a guess.",
      zh: '皮斯伯里家族的居城，这是效忠风息堡的一个风暴地小家族。书中对城堡本身少有记述，此处位置纯属推测。',
    },
    houses: ['peasebury'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'amberly', kind: 'castle', region: 'stormlands', at: [530, 1100], rank: 1,
    names: { en: 'Amberly', zh: '安柏利' },
    summary: {
      en: "Seat of House Rogers, a minor stormland house. It is named in the companion histories, which give no detail of its setting; the marker is approximate.",
      zh: '罗杰斯家族的居城，这是风暴地的一个小家族。此地仅见于官方编年史，未述其环境，此处标注仅为大致。',
    },
    houses: ['rogers'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'broad-arch', kind: 'castle', region: 'stormlands', at: [520, 1120], rank: 1,
    names: { en: 'Broad Arch', zh: '宽拱堡' },
    summary: {
      en: "Seat of House Staedmon in the stormlands. The histories recall a Lord Staedmon nicknamed Pennylover for his thrift. Position approximate.",
      zh: '史戴蒙家族的居城，位于风暴地。史书中有一位以吝啬出名、绰号“爱财者”的史戴蒙伯爵。此处位置仅为大致。',
    },
    houses: ['staedmon'], refs: ['twoiaf'], confidence: 'low',
  },

  // ------------------------------------------------------------------ Cape Wrath and the isles
  {
    id: 'griffins-roost', kind: 'castle', region: 'stormlands', at: [592, 1056], rank: 3,
    names: { en: "Griffin's Roost", zh: '狮鹫栖息地' },
    summary: {
      en: "Seat of House Connington, perched on a crag above Shipbreaker Bay on the northern side of Cape Wrath. Its lord Jon Connington served Aerys II as Hand, failed to catch Robert at Stoney Sept in the Battle of the Bells, and was exiled; the house lost much of its land and standing.",
      zh: '克林顿家族的居城，高踞怒角北侧、俯瞰破船湾的一座岩峰之上。其领主琼恩·克林顿曾任伊里斯二世的首相，在石堂镇“钟楼之役”中未能擒获劳勃，因而遭到流放；家族也随之失去大片领地与地位。',
    },
    houses: ['connington'], refs: ['asos', 'adwd', 'twoiaf'], confidence: 'medium',
    spoiler: {
      en: "Jon Connington, long believed dead, returns with the Golden Company and retakes Griffin's Roost by surprise (A Dance with Dragons).",
      zh: '人们长久以为已死的琼恩·克林顿随黄金团归来，以奇袭夺回狮鹫栖息地（《魔龙的狂舞》）。',
    },
  },
  {
    id: 'rain-house', kind: 'castle', region: 'stormlands', at: [624, 1088], rank: 2,
    names: { en: 'Rain House', zh: '雨屋' },
    summary: {
      en: "Seat of House Wylde near the eastern end of Cape Wrath, facing the Straits of Tarth. Lord Casper Wylde is one of the stormlords of the War of the Five Kings.",
      zh: '威尔德家族的居城，位于怒角东端附近，面对塔斯海峡。卡斯珀·威尔德伯爵是五王之战中的风暴地诸侯之一。',
    },
    houses: ['wylde'], refs: ['acok', 'adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'mistwood', kind: 'castle', region: 'stormlands', at: [582, 1088], rank: 2,
    names: { en: 'Mistwood', zh: '雾林堡' },
    summary: {
      en: "Seat of House Mertyns, standing in the damp depths of the Rainwood on Cape Wrath.",
      zh: '梅尔廷斯家族的居城，坐落在怒角雨林潮湿的深处。',
    },
    houses: ['mertyns'], refs: ['adwd', 'twoiaf'], confidence: 'low',
    spoiler: {
      en: "Mistwood falls to the Golden Company in A Dance with Dragons.",
      zh: '在《魔龙的狂舞》中，雾林堡被黄金团攻陷。',
    },
  },
  {
    id: 'crows-nest', kind: 'castle', region: 'stormlands', at: [602, 1118], rank: 2,
    names: { en: "Crow's Nest", zh: '鸦巢堡' },
    summary: {
      en: "Seat of House Morrigen on Cape Wrath, whose arms show a crow in flight. Ser Guyard Morrigen of this house was one of Renly's Rainbow Guard.",
      zh: '莫里根家族在怒角的居城，其纹章是一只展翅的乌鸦。该家族的盖亚德·莫里根爵士是蓝礼的彩虹护卫之一。',
    },
    houses: ['morrigen'], refs: ['acok', 'adwd', 'twoiaf'], confidence: 'low',
    spoiler: {
      en: "Crow's Nest is taken by the Golden Company in A Dance with Dragons.",
      zh: '在《魔龙的狂舞》中，鸦巢堡被黄金团夺取。',
    },
  },
  {
    id: 'evenfall-hall', kind: 'castle', region: 'stormlands', at: [668, 1051], rank: 3,
    names: { en: 'Evenfall Hall', zh: '暮临厅' }, alt: ['Evenfall'],
    summary: {
      en: "Seat of House Tarth on the Sapphire Isle, home of Lord Selwyn the Evenstar and his daughter Brienne. Brienne remembers it as a hall above the sea, where she grew up tall, awkward and set on the sword.",
      zh: '塔斯家族在蓝宝石岛上的居城，“暮星”赛尔温伯爵与女儿布蕾妮的家。在布蕾妮的回忆里，那是一座临海的厅堂，她在那里长成了一个高大笨拙、一心习剑的姑娘。',
    },
    houses: ['tarth'], refs: ['acok', 'affc', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'morne', kind: 'ruin', region: 'stormlands', at: [646, 1061], rank: 1,
    names: { en: 'Morne', zh: '莫恩' },
    summary: {
      en: "A ruined stronghold on Tarth, mentioned in passing as one of the island's ancient places. Nothing certain is told of who built it; its position on the island is a guess.",
      zh: '塔斯岛上的一处要塞废墟，书中仅顺带提及，是岛上的古迹之一。何人所建并无确切记载，其在岛上的位置亦属推测。',
    },
    houses: [], refs: ['affc'], confidence: 'low',
  },
  {
    id: 'greenstone', kind: 'castle', region: 'stormlands', at: [650, 1123], rank: 2,
    names: { en: 'Greenstone', zh: '绿石堡' },
    summary: {
      en: "Seat of House Estermont on the island of Estermont. Lord Eldon Estermont, uncle of King Robert, and his son and grandson appear in the novels.",
      zh: '伊斯蒙家族在伊斯蒙岛上的居城。小说中出现过劳勃国王的舅父艾尔登·伊斯蒙伯爵及其子孙。',
    },
    houses: ['estermont'], refs: ['acok', 'affc', 'adwd', 'twoiaf'], confidence: 'medium',
  },

  // ------------------------------------------------------------------ the south and the Dornish Marches
  {
    id: 'summerhall', kind: 'ruin', region: 'stormlands', at: [480, 1108], rank: 3,
    names: { en: 'Summerhall', zh: '盛夏厅' },
    summary: {
      en: "A Targaryen summer palace in the southern stormlands, destroyed by fire in 259 AC at a feast where King Aegon V, his son Prince Duncan and Ser Duncan the Tall died; Prince Rhaegar was born amid the disaster and later haunted its ruins with his harp. Early in his rebellion Robert Baratheon won three battles there in a single day.",
      zh: '坦格利安家族位于风暴地南部的夏宫。259年的一场宴会上大火焚毁了宫殿，伊耿五世国王、其子邓肯王子与“高个子”邓肯爵士皆葬身火海；雷加王子恰在这场灾难中降生，日后常携竖琴流连于废墟之间。劳勃起兵之初，曾在此地一日之内连胜三仗。',
    },
    houses: [], refs: ['agot', 'asos', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'harvest-hall', kind: 'castle', region: 'stormlands', at: [450, 1104], rank: 2,
    names: { en: 'Harvest Hall', zh: '丰收厅' },
    summary: {
      en: "Seat of House Selmy, a modest knightly house of the Dornish Marches whose arms bear sheaves of wheat. Its most famous son is Ser Barristan Selmy, called the Bold, Lord Commander of the Kingsguard under Robert.",
      zh: '赛尔弥家族的居城。这是多恩边疆地上一个不算显赫的骑士家族，纹章上绘有麦束。家族最著名的成员是“无畏的”巴利斯坦·赛尔弥爵士，劳勃在位时任御林铁卫队长。',
    },
    houses: ['selmy'], refs: ['agot', 'twoiaf'], confidence: 'low',
  },
  {
    id: 'blackhaven', kind: 'castle', region: 'stormlands', at: [420, 1132], rank: 2,
    names: { en: 'Blackhaven', zh: '黑港城' },
    summary: {
      en: "Seat of House Dondarrion in the Dornish Marches, beneath the Red Mountains. Its young lord Beric Dondarrion was sent by Eddard Stark to bring Gregor Clegane to justice in the riverlands.",
      zh: '唐德利恩家族的居城，位于赤红山脉脚下的多恩边疆地。年轻的领主贝里·唐德利恩奉艾德·史塔克之命前往河间地，捉拿格雷果·克里冈归案。',
    },
    houses: ['dondarrion'], refs: ['agot', 'asos', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'nightsong', kind: 'castle', region: 'stormlands', at: [374, 1146], rank: 2,
    names: { en: 'Nightsong', zh: '夜歌城' },
    summary: {
      en: "Seat of House Caron, marcher lords of the westernmost stormlands who guard the approaches from the Dornish mountains; their arms show nightingales. Lord Bryce Caron served in Renly's Rainbow Guard.",
      zh: '卡伦家族的居城，这支边疆诸侯镇守风暴地最西端，扼守来自多恩群山的通道；其纹章绘有夜莺。布莱斯·卡伦伯爵曾是蓝礼的彩虹护卫。',
    },
    houses: ['caron'], refs: ['acok', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'stonehelm', kind: 'castle', region: 'stormlands', at: [494, 1144], rank: 2,
    names: { en: 'Stonehelm', zh: '石盔城' },
    summary: {
      en: "Seat of House Swann near the Sea of Dorne, guarding the northern end of the Boneway, the mountain road into Dorne. The Swanns' black and white swans are borne by Lord Gulian and his sons Balon and Donnel.",
      zh: '史文家族的居城，临近多恩海，扼守通往多恩的山路“骸骨路”北端。古利安伯爵及其子拜伦、唐纳尔都佩戴史文家族黑白双天鹅的纹章。',
    },
    houses: ['swann'], refs: ['acok', 'asos', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'weeping-town', kind: 'town', region: 'stormlands', at: [540, 1124], rank: 1,
    names: { en: 'Weeping Town', zh: '哭泣镇' },
    summary: {
      en: "A small port on the southern coast of the stormlands, looking across the Sea of Dorne. It is named in the histories but hardly described, and its position on the coast is approximate.",
      zh: '风暴地南部海岸的一座小港，隔着多恩海与对岸相望。史书虽提及其名，却几乎未加描述，其在海岸上的位置亦属大致。',
    },
    houses: [], refs: ['twoiaf'], confidence: 'low',
  },
] };
