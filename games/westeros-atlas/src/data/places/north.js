// Places of this group — see docs/PLACES_SCHEMA.md
// The North from the Gift's southern edge to the Neck (inclusive), with Bear Island, Skagos and Skane.
// (The Wall, its castles and the Gift belong to the beyond-wall group; the Three Sisters to the Vale group.)
// Bays that already have a sea label in src/data/regions.js SEAS (the Bite, Bay of Seals, Blazewater Bay, Bay of Ice) are not repeated here.
// Chinese marked ◇ in comments = project rendering, not confirmed against the Chinese edition.
export default { group: 'north', places: [

  // ───────────── existing registry places (src/data/locations.js) — descriptive extensions only
  {
    id: 'winterfell',
    summary: {
      en: 'Ancestral seat of House Stark and heart of the North, raised (legend says) by Brandon the Builder over hot springs whose water warms its walls and glass gardens. Beneath it lie the crypts of the Kings of Winter; beside it the ancient godswood and its weirwood heart tree. Winter Town, a seasonal market town that fills only when the snows come, huddles outside its walls.',
      zh: '史塔克家族的祖居、北境的心脏。相传由筑城者布兰登建于温泉之上，泉水在墙中流淌，温暖城堡与玻璃花园。城下是历代冬境之王长眠的墓窖，旁边是古老的神木林与鱼梁木心树。城墙外的冬镇平日冷清，唯有大雪降临时才会住满避冬的人家。',
    },
    houses: ['stark', 'cassel'],
    refs: ['agot', 'acok', 'adwd', 'twoiaf'],
    confidence: 'high',
    spoiler: {
      en: 'Taken by Theon Greyjoy in A Clash of Kings and then sacked and burned by Ramsay Snow; in A Dance with Dragons the Boltons hold its ruins, and Ramsay weds a girl presented as Arya Stark there.',
      zh: '《列王的纷争》中席恩·葛雷乔伊夺取此城，随后拉姆斯·雪诺将其洗劫焚毁；《魔龙的狂舞》中波顿家族据守废墟，拉姆斯在此迎娶一名冒充艾莉亚·史塔克的女孩。',
    },
  },
  {
    id: 'white-harbor',
    summary: {
      en: 'The North\'s only true city and its chief port, built of whitewashed stone where the White Knife meets the Bite. House Manderly, exiled from the Reach centuries ago, was granted the land by the Starks and still rules from the New Castle; the old Wolf\'s Den, the Sept of the Snows and the Merman\'s Court give the city a southern flavour unique in the North.',
      zh: '北境唯一称得上城市的地方，也是北境第一大港，白色石城坐落在白刃河注入咬人湾之处。数百年前被逐出河湾地的曼德勒家族受史塔克家族封赐此地，至今仍坐镇新堡；古老的狼穴、雪之圣堂与人鱼宫，让这座城市带着北境罕见的南方气息。',
    },
    houses: ['manderly', 'greystark'],
    refs: ['acok', 'adwd', 'twoiaf'],
    confidence: 'high',
    spoiler: {
      en: 'In A Dance with Dragons Lord Wyman publicly bows to the Boltons and the Freys while secretly sending Davos Seaworth to find Rickon Stark on Skagos.',
      zh: '《魔龙的狂舞》中威曼大人表面向波顿与佛雷家族低头，暗中却派戴佛斯·席渥斯前往斯卡格斯岛寻找瑞肯·史塔克。',
    },
  },
  {
    id: 'moat-cailin',
    summary: {
      en: 'A ruined First Men stronghold at the northern end of the Neck, where the causeway leaves the swamps. Only three of its twenty towers still stand, yet it remains the key to the North: any army marching up the kingsroad must pass beneath it, and none has ever taken it from the south.',
      zh: '颈泽北端的先民要塞废墟，扼守堤道出沼泽之处。昔日二十座塔楼如今只剩三座，却依然是北境的门锁：沿国王大道北上的军队必须从它脚下经过，从未有南方来敌将其攻破。',
    },
    houses: ['stark'],
    refs: ['agot', 'asos', 'adwd', 'twoiaf'],
    confidence: 'high',
    spoiler: {
      en: 'Seized by the ironborn under Victarion Greyjoy in A Clash of Kings; in A Dance with Dragons its starving, sick garrison surrenders to Ramsay Bolton after Theon ("Reek") is sent to parley, and they are flayed.',
      zh: '《列王的纷争》中维克塔利昂·葛雷乔伊率铁种夺取此地；《魔龙的狂舞》中拉姆斯·波顿派“臭佬”席恩前去谈判，饥病交加的守军投降后惨遭剥皮。',
    },
  },

  // ───────────── castles and seats
  {
    id: 'deepwood-motte', kind: 'castle', region: 'north', at: [270, 470], rank: 3,
    names: { en: 'Deepwood Motte', zh: '深林堡' }, alt: ['Deepwood', 'Glover'],
    summary: {
      en: 'Seat of House Glover: a timber longhall and watchtower on a steep wooded hill deep in the Wolfswood, ringed by a ditch and log palisade. Simple and old-fashioned, it watches the western forests and the hill clans of the mountains.',
      zh: '葛洛佛家族的居城：狼林深处一座陡峭林丘上的木制长厅与望楼，四周环以壕沟和木栅。城堡古朴简陋，守望着西部森林与群山中的山地氏族。',
    },
    houses: ['glover'], refs: ['acok', 'adwd', 'twoiaf'], confidence: 'high',
    spoiler: {
      en: 'Asha Greyjoy takes it in A Clash of Kings; in A Dance with Dragons Stannis Baratheon and the mountain clans storm it and capture her.',
      zh: '《列王的纷争》中阿莎·葛雷乔伊攻占此堡；《魔龙的狂舞》中史坦尼斯·拜拉席恩与山地氏族攻破城堡并俘获她。',
    },
  },
  {
    id: 'torrhens-square', kind: 'castle', region: 'north', at: [306, 560], rank: 3,
    names: { en: "Torrhen's Square", zh: '托伦方城' }, alt: ['Tallhart'],
    summary: {
      en: 'Seat of House Tallhart, a square-towered stone castle south-west of Winterfell named for King Torrhen Stark. It guards the approaches from the Stony Shore and the Barrowlands, and its lords followed Robb Stark south.',
      zh: '陶哈家族的居城，位于临冬城西南，是一座方塔石堡，以国王托伦·史塔克命名。它扼守石岸与古冢原方向的来路，其城主曾随罗柏·史塔克南征。',
    },
    houses: ['tallhart'], refs: ['acok', 'adwd', 'twoiaf'], confidence: 'medium',
    spoiler: {
      en: 'Dagmer Cleftjaw\'s ironborn besiege it in A Clash of Kings; later it falls to the ironborn, and in A Dance with Dragons Stannis\'s host means to take it back.',
      zh: '《列王的纷争》中“裂颚”达格默率铁种围攻此城；后来城堡落入铁种手中，《魔龙的狂舞》中史坦尼斯的军队打算将其夺回。',
    },
  },
  {
    id: 'barrowton', kind: 'town', region: 'north', at: [296, 616], rank: 3,
    names: { en: 'Barrowton', zh: '古冢镇' }, alt: ['Barrow Hall', 'Dustin', '古冢厅'],
    summary: {
      en: 'A market town in the Barrowlands, ringed by an earthen dike and timber palisade,, in the shadow of the Great Barrow. Its lords, the Dustins, rule from Barrow Hall, a timber hall within the town\'s earthworks; legend holds that the old Barrow Kings once reigned here.',
      zh: '古冢原上一座以土堤和木栅环护的集镇，依傍着大古冢而建。领主达斯丁家族坐镇镇内土垒围护的木厅“古冢厅”；传说昔日的古冢之王曾在此称雄。',
    },
    houses: ['dustin', 'stout'], refs: ['adwd', 'twoiaf'], confidence: 'high',
    spoiler: {
      en: 'In A Dance with Dragons Roose Bolton gathers his allies at Barrowton before marching on Winterfell.',
      zh: '《魔龙的狂舞》中卢斯·波顿在古冢镇召集盟军，然后进军临冬城。',
    },
  },
  {
    id: 'karhold', kind: 'castle', region: 'north', at: [572, 432], rank: 3,
    names: { en: 'Karhold', zh: '卡霍城' }, alt: ['Karstark'],
    summary: {
      en: 'Seat of House Karstark in the cold eastern uplands near the Grey Cliffs. Founded, by tradition, by Karlon Stark, a younger son of Winterfell who put down a rebel lord a thousand years ago; the castle and its house still carry that Stark blood.',
      zh: '卡史塔克家族的居城，位于东部寒冷的高地，邻近灰崖。相传千年前临冬城的幼子卡隆·史塔克平定叛乱后在此立足，城堡与家族至今仍流着史塔克的血。',
    },
    houses: ['karstark'], refs: ['agot', 'adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'last-hearth', kind: 'castle', region: 'north', at: [432, 366], rank: 3,
    names: { en: 'Last Hearth', zh: '末炉城' }, alt: ['Umber'],
    summary: {
      en: 'Seat of House Umber, the northernmost great castle south of the Gift and the last warm hall a traveller meets before the Wall. The Umbers are huge, loud and fiercely loyal, and their lands stretch up to the Wall\'s shadow.',
      zh: '安柏家族的居城，赠地以南最北的一座大城，也是旅人抵达长城前遇到的最后一处暖炉。安柏家族的人身材魁梧、嗓门洪亮、忠心耿耿，领地一直延伸到长城脚下。',
    },
    houses: ['umber'], refs: ['agot', 'adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'dreadfort', kind: 'castle', region: 'north', at: [522, 478], rank: 3,
    names: { en: 'The Dreadfort', zh: '恐怖堡' }, alt: ['Dreadfort', 'Bolton'],
    summary: {
      en: 'Seat of House Bolton on the Weeping Water, a grim castle of high walls and dark towers. Its lords descend from the old Red Kings, rivals of the Starks for millennia, who were said to wear the flayed skins of their enemies.',
      zh: '波顿家族位于泣水河畔的居城，高墙暗塔，气象森然。历代城主是古代“红王”的后裔，与史塔克家族敌对了数千年，据说曾把敌人的剥下的人皮披在身上。',
    },
    houses: ['bolton'], refs: ['acok', 'adwd', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'hornwood', kind: 'castle', region: 'north', at: [470, 540], rank: 2,
    names: { en: 'Hornwood', zh: '霍伍德城' }, alt: ['Hornwood castle'],
    summary: {
      en: 'Seat of House Hornwood, in rich forest country between Winterfell and the Sheepshead Hills, near the Broken Branch. After its lord and heir died in Robb Stark\'s war, the castle and its widow became a prize fought over by neighbours.',
      zh: '霍伍德家族的居城，位于临冬城与羊头丘陵之间林木茂盛的地带，靠近断枝河。城主及其继承人战死于罗柏·史塔克的战争之后，这座城堡和它的遗孀便成了邻人争夺的猎物。',
    },
    houses: ['hornwood'], refs: ['acok', 'adwd', 'twoiaf'], confidence: 'medium',
    spoiler: {
      en: 'Ramsay Snow seizes Lady Donella Hornwood, forces her to wed him and locks her away until she starves (A Clash of Kings).',
      zh: '拉姆斯·雪诺掳走唐娜拉·霍伍德夫人，强行与之成婚并将她囚禁至饿死（《列王的纷争》）。',
    },
  },
  {
    id: 'cerwyn', kind: 'castle', region: 'north', at: [390, 530], rank: 2,
    names: { en: 'Castle Cerwyn', zh: '赛文城' }, alt: ['Cerwyn'],
    summary: {
      en: 'Seat of House Cerwyn, half a day\'s ride from Winterfell. Its lords are among the Starks\' closest bannermen, and young Cley Cerwyn attended Winterfell\'s harvest feast in A Clash of Kings.',
      zh: '赛文家族的居城，距临冬城仅半日马程。赛文家族是史塔克家族最亲近的封臣之一，《列王的纷争》中年轻的克雷·赛文曾出席临冬城的丰收宴。',
    },
    houses: ['cerwyn'], refs: ['acok', 'adwd'], confidence: 'medium',
    spoiler: {
      en: 'By A Dance with Dragons the castle is held by the Boltons\' men while its lady is a captive at the Dreadfort.',
      zh: '至《魔龙的狂舞》时，城堡已由波顿家族的人占据，而赛文家的小姐则被囚于恐怖堡。',
    },
  },
  {
    id: 'widows-watch', kind: 'castle', region: 'north', at: [568, 546], rank: 2,
    names: { en: "Widow's Watch", zh: '寡妇望' }, alt: ['Flint of Widow\'s Watch'],
    summary: {
      en: 'Seat of a branch of House Flint on the north-eastern shore of the Bite, beyond the Sheepshead Hills. The coast here faces the Narrow Sea; its lady, Lyessa Flint, is named among the Northern lords in A Dance with Dragons.',
      zh: '菲林特家族一支的居城，位于咬人湾东北岸、羊头丘陵外侧。这里的海岸直面狭海；《魔龙的狂舞》中提到其女城主莉莎·菲林特位列北境诸侯。',
    },
    houses: ['flint-widows-watch'], refs: ['adwd', 'twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'ramsgate', kind: 'castle', region: 'north', at: [512, 576], rank: 1,
    names: { en: 'Ramsgate', zh: '公羊门' }, alt: [],
    summary: {
      en: 'A small castle on the Bite\'s northern shore between White Harbor and the Sheepshead Hills, known chiefly from the official maps. Nothing certain is said of its holders in the novels.',
      zh: '咬人湾北岸的一座小城堡，介于白港与羊头丘陵之间，主要见于官方地图。小说中没有关于其领主的确切记载。',
    },
    houses: [], refs: ['maps'], confidence: 'low',
  },
  {
    id: 'oldcastle', kind: 'castle', region: 'north', at: [428, 632], rank: 2,
    names: { en: 'Oldcastle', zh: '旧堡' }, alt: ['Locke', '老城堡'],
    summary: {
      en: 'Seat of House Locke on the Bite\'s western shore, south of White Harbor towards the Neck. As its name says, it is one of the North\'s ancient strongholds; its aged lord appears among the Northern lords in A Dance with Dragons.',
      zh: '洛克家族的居城，位于咬人湾西岸、白港以南通往颈泽的方向。正如其名，它是北境古老的要塞之一；《魔龙的狂舞》中年迈的城主也位列北境诸侯之中。',
    },
    houses: ['locke'], refs: ['adwd', 'twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'flints-finger', kind: 'castle', region: 'north', at: [250, 640], rank: 2,
    names: { en: "Flint's Finger", zh: '菲林特之指' }, alt: ['Flint\'s Finger tower'],
    summary: {
      en: 'A tower-house of a branch of House Flint on a narrow headland of the west coast, looking over Ironman\'s Bay north of Cape Kraken. It stands on one of the coasts most often struck by ironborn raids.',
      zh: '菲林特家族一支的塔楼居所，坐落在西海岸一条狭长岬角上，俯瞰海怪角以北的铁民湾。这段海岸是铁种劫掠最频繁的地方之一。',
    },
    houses: ['flint-flints-finger'], refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'mormonts-keep', kind: 'castle', region: 'north', at: [213, 399], rank: 2,
    names: { en: "Mormont's Keep", zh: '莫尔蒙堡' }, alt: ['Bear Island keep'],
    summary: {
      en: 'The timber seat of House Mormont on Bear Island, a hall of logs behind an earthen wall. Its women fight as fiercely as its men, a tradition born of fending off ironborn raiders while the menfolk were away.',
      zh: '莫尔蒙家族在熊岛上的木造居城，原木长厅立于土墙之后。这里的女子与男子一样骁勇善战——这一传统源自男人们出征时她们独力击退铁种劫掠者的往事。',
    },
    houses: ['mormont'], refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'kingshouse', kind: 'castle', region: 'north', at: [586, 330], rank: 1,
    names: { en: 'Kingshouse', zh: '王屋' }, alt: ['Magnar of Kingshouse'],
    summary: {
      en: 'Seat of House Magnar on Skagos, named in the histories as one of the island\'s holds. Its exact place on the island is not given; the marker is schematic.',
      zh: '马格拿家族在斯卡格斯岛上的居所，史书中提及为岛上据点之一。其在岛上的确切位置未见记载，此处标记仅为示意。',
    },
    houses: ['magnar'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'deepdown', kind: 'castle', region: 'north', at: [600, 368], rank: 1,
    names: { en: 'Deepdown', zh: '深坑堡' }, alt: ['Crowl of Deepdown'],
    summary: {
      en: 'Hold of House Crowl on Skagos. Little more than its name and holders is recorded; the marker\'s position on the island is a guess.',
      zh: '克罗尔家族在斯卡格斯岛上的据点。除了名称和领主之外几乎没有记载，标记在岛上的位置为推测。',
    },
    houses: ['crowl'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'driftwood-hall', kind: 'castle', region: 'north', at: [578, 358], rank: 1,
    names: { en: 'Driftwood Hall', zh: '浮木厅' }, alt: ['Stane of Driftwood Hall'],
    summary: {
      en: 'Hold of House Stane on Skagos, its name suggesting a hall built from the timber the sea throws onto that treeless coast. Position on the island is schematic.',
      zh: '斯坦恩家族在斯卡格斯岛上的据点，名字暗示其以海浪冲上这片荒凉海岸的浮木建成。在岛上的位置仅为示意。',
    },
    houses: ['stane'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'greywater-watch', kind: 'castle', region: 'north', at: [344, 708], rank: 2,
    names: { en: 'Greywater Watch', zh: '灰水望' }, alt: ['Reed', 'crannog'],
    summary: {
      en: 'Seat of House Reed, a castle built on a floating crannog that drifts through the bogs of the Neck, so that no enemy (and no raven) can find it. Its position on this map is necessarily approximate: the books say it moves.',
      zh: '黎德家族的居城，建在一座漂浮的泽岛上，在颈泽的沼泽间四处游移，敌人找不到它，连渡鸦也送不到信。它在本图上的位置只能是近似的——书中明言它会移动。',
    },
    houses: ['reed'], refs: ['acok', 'asos', 'twoiaf'], confidence: 'low',
  },
  {
    id: 'rillwater-crossing', kind: 'castle', region: 'north', at: [272, 598], rank: 1,
    names: { en: 'Rillwater Crossing', zh: '溪水渡口' }, alt: [],
    summary: {
      en: 'A castle at a river crossing in the Rills, shown on the official maps. The novels say nothing of it, so its holders are unknown.',
      zh: '溪流地一处河流渡口旁的城堡，见于官方地图。小说中没有提及，其领主不详。',
    },
    houses: [], refs: ['maps'], confidence: 'low',
  },
  {
    id: 'goldgrass', kind: 'castle', region: 'north', at: [318, 632], rank: 1,
    names: { en: 'Goldgrass', zh: '金草堡' }, alt: ['Stout'],
    summary: {
      en: 'Seat of House Stout, a small vassal house of the Dustins in the Barrowlands. Its exact location is not given; it is placed here in the open country near Barrowton.',
      zh: '斯托特家族的居所，该家族是古冢原上达斯丁家族的小封臣。确切位置未见记载，此处将其置于古冢镇附近的旷野。',
    },
    houses: ['stout'], refs: ['adwd'], confidence: 'low',
  },

  // ───────────── towns, villages, landmarks, sacred sites
  {
    id: 'great-barrow', kind: 'sacred', region: 'north', at: [304, 609], rank: 2,
    names: { en: 'The Great Barrow', zh: '大古冢' }, alt: ['First King\'s barrow'],
    summary: {
      en: 'An enormous grass-grown burial mound beside Barrowton, said to hold the First King of the First Men, or a giant king, depending on the teller. It is the greatest of the countless barrows that give the Barrowlands their name.',
      zh: '古冢镇旁一座覆满青草的巨大坟丘，传说中长眠着先民的第一位国王——也有人说是一位巨人王。古冢原星罗棋布的坟冢中，它是最大的一座，此地也因这些坟冢而得名。',
    },
    houses: ['dustin'], refs: ['adwd', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'barrowlands', kind: 'landmark', region: 'north', at: [322, 584], rank: 2,
    names: { en: 'The Barrowlands', zh: '古冢原' }, alt: ['Barrow lands'],
    summary: {
      en: 'Rolling, nearly treeless country south-west of Winterfell, dotted with the burial mounds of the First Men. The Dustins of Barrowton are its leading lords, and the old Barrow Kings once claimed to be its sovereigns.',
      zh: '临冬城西南起伏而近乎无树的原野，遍布先民的墓冢。古冢镇的达斯丁家族是此地首要领主，古代的古冢之王曾自称此地的君主。',
    },
    houses: ['dustin', 'stout'], refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'the-rills', kind: 'landmark', region: 'north', at: [256, 580], rank: 2,
    names: { en: 'The Rills', zh: '溪流地' }, alt: ['Ryswell', 'Rills'],
    summary: {
      en: 'A country of many small streams and good grazing in the south-west of the North, between the Barrowlands and the sea. It is the domain of House Ryswell, famed for its horses.',
      zh: '北境西南部溪流纵横、牧草丰美的地区，介于古冢原与大海之间。这里是以良马闻名的莱斯威尔家族的领地。',
    },
    houses: ['ryswell'], refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'stony-shore', kind: 'landmark', region: 'north', at: [256, 524], rank: 2,
    names: { en: 'The Stony Shore', zh: '石岸' }, alt: ['Stoney Shore'],
    summary: {
      en: 'A bleak, rocky stretch of the western coast below the Wolfswood, home to scattered fishing villages. Its exposure to Ironman\'s Bay makes it a favourite target of ironborn reavers.',
      zh: '狼林以南西海岸一段荒凉多岩的海滨，散布着零星渔村。由于直面铁民湾，这里历来是铁种劫掠者的首选目标。',
    },
    houses: [], refs: ['acok', 'twoiaf'], confidence: 'medium',
    spoiler: {
      en: 'Dagmer Cleftjaw raids it in A Clash of Kings to draw Winterfell\'s defenders away, and the ironborn later hold parts of it.',
      zh: '《列王的纷争》中“裂颚”达格默劫掠此地，以调开临冬城的守军；铁种此后长期占据部分地段。',
    },
  },
  {
    id: 'sea-dragon-point', kind: 'landmark', region: 'north', at: [160, 468], rank: 3,
    names: { en: 'Sea Dragon Point', zh: '海龙角' }, alt: [],
    summary: {
      en: 'A long, wild peninsula thrusting west into the Sunset Sea north of Blazewater Bay. Thinly peopled, it was once the realm of the Warg King, whose skinchanger line the Starks destroyed in ancient times; the Children of the Forest are said to have lingered there long after.',
      zh: '一条狭长荒凉的半岛，在炽水湾以北向西伸入日落之海。这里人烟稀少，远古时曾是“狼王”（易形者之王）的国度，后被史塔克家族所灭；据说森林之子在此地留存得格外长久。',
    },
    houses: [], refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'cape-kraken', kind: 'landmark', region: 'north', at: [214, 700], rank: 2,
    names: { en: 'Cape Kraken', zh: '海怪角' }, alt: [],
    summary: {
      en: 'The rocky south-western cape of the North, jutting toward the Iron Islands at the mouth of Ironman\'s Bay. Its nearness to the ironborn has made its shores a frequent battleground.',
      zh: '北境西南端的多岩海角，在铁民湾口伸向铁群岛。由于与铁种近在咫尺，这里的海岸屡屡沦为战场。',
    },
    houses: [], refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'crofters-village', kind: 'village', region: 'north', at: [332, 490], rank: 1,
    names: { en: "Crofters' village", zh: '佃农村' }, alt: ['crofter\'s village', 'Stannis\'s camp'],
    summary: {
      en: 'An unnamed hamlet of crofters\' huts beside a small frozen lake between Deepwood Motte and Winterfell, about three days\' march from the castle. Its position here is approximate.',
      zh: '深林堡与临冬城之间、一座封冻小湖旁的无名佃农小村，距临冬城约三日行军路程。此处位置为近似。',
    },
    houses: [], refs: ['adwd'], confidence: 'low',
    spoiler: {
      en: 'In A Dance with Dragons Stannis\'s army, marching on Winterfell, is trapped here by blizzards; men starve, and the Freys and Manderlys are said to be closing in when the book ends.',
      zh: '《魔龙的狂舞》中史坦尼斯向临冬城进军，大军被暴风雪困于此村，士卒饥馑；全书结束时，佛雷与曼德勒的军队据说正逼近这里。',
    },
  },
  {
    id: 'kingsroad-causeway', kind: 'landmark', region: 'north', at: [363, 688], rank: 1,
    names: { en: 'The Neck causeway', zh: '颈泽堤道' }, alt: ['causeway', 'kingsroad causeway'],
    summary: {
      en: 'The raised stone causeway that carries the kingsroad through the bogs of the Neck, the only safe road for an army. Moat Cailin commands its northern end, which is why the swamps have kept the North safe from southern hosts.',
      zh: '国王大道穿越颈泽沼泽时所走的石砌高堤，是大军唯一可行的通道。卡林湾扼守其北端，正因如此，这片沼泽一直使北境免受南方大军侵犯。',
    },
    houses: ['reed'], refs: ['agot', 'asos'], confidence: 'medium',
  },

  // ───────────── battlefields
  {
    id: 'battle-of-the-weeping-water', kind: 'battle', region: 'north', at: [578, 494], rank: 1,
    names: { en: 'Battle of the Weeping Water', zh: '泣水河之战' }, alt: ['Theon Stark', 'Hungry Wolf'],
    summary: {
      en: 'An ancient victory of King Theon Stark, the "Hungry Wolf", who threw back an Andal landing near the mouth of the Weeping Water. It is one reason the Andals never conquered the North as they did the south. The exact site is not recorded.',
      zh: '古代国王“饿狼”席恩·史塔克的一场胜仗：他在泣水河口附近击退了安达尔人的登陆。这也是安达尔人未能像征服南方那样征服北境的原因之一。确切战场位置未见记载。',
    },
    houses: ['stark', 'bolton'], refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'battle-of-torrhens-square', kind: 'battle', region: 'north', at: [314, 568], rank: 1,
    names: { en: "Battle at Torrhen's Square", zh: '托伦方城之战' }, alt: ['Siege of Torrhen\'s Square'],
    summary: {
      en: 'A clash outside Torrhen\'s Square in A Clash of Kings, when Ser Rodrik Cassel marched from Winterfell to lift an ironborn siege of the Tallhart castle.',
      zh: '《列王的纷争》中发生在托伦方城外的交战：罗德利克·凯索爵士从临冬城出兵，解救被铁种围攻的陶哈家族城堡。',
    },
    houses: ['tallhart', 'cassel'], refs: ['acok'], confidence: 'medium',
    spoiler: {
      en: 'The raid was a feint: while Ser Rodrik was away, Theon Greyjoy took Winterfell by stealth.',
      zh: '这次袭击其实是佯攻：趁罗德利克爵士离城之际，席恩·葛雷乔伊偷袭夺取了临冬城。',
    },
  },
  {
    id: 'battle-of-deepwood-motte', kind: 'battle', region: 'north', at: [282, 480], rank: 1,
    names: { en: 'Battle at Deepwood Motte', zh: '深林堡之战' }, alt: [],
    summary: {
      en: 'The fight for the Glover castle in the Wolfswood, held by ironborn after A Clash of Kings. Its details belong to A Dance with Dragons (see spoiler).',
      zh: '围绕狼林中葛洛佛家族城堡的战斗，《列王的纷争》之后此堡由铁种据守。详情见于《魔龙的狂舞》（参见剧透）。',
    },
    houses: ['glover'], refs: ['adwd'], confidence: 'medium',
    spoiler: {
      en: 'Stannis Baratheon, guided by the mountain clans, surprises Asha Greyjoy\'s garrison, takes the castle and wins the clans\' support for his march on Winterfell.',
      zh: '史坦尼斯·拜拉席恩在山地氏族引导下突袭阿莎·葛雷乔伊的守军，夺下城堡，并赢得各氏族对其进军临冬城的支持。',
    },
  },

  // ───────────── islands
  {
    id: 'bear-island', kind: 'island', region: 'north', at: [205, 390], rank: 3,
    names: { en: 'Bear Island', zh: '熊岛' }, alt: ['Mormont'],
    summary: {
      en: 'A wooded, rocky island in the Bay of Ice off the North\'s west coast, won back from the ironborn by a Stark king and given to House Mormont. Its folk are poor, hardy and loyal, and its ironborn-raided shores taught its women to fight.',
      zh: '北境西海岸外寒冰湾中一座多林多岩的岛屿，一位史塔克国王从铁种手中夺回此岛并封给莫尔蒙家族。岛民贫穷、坚韧而忠诚，饱受铁种侵扰的海岸让这里的女子也学会了拿起武器。',
    },
    houses: ['mormont', 'woodfoot'], refs: ['agot', 'adwd', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'skagos', kind: 'island', region: 'north', at: [592, 345], rank: 3,
    names: { en: 'Skagos', zh: '斯卡格斯岛' }, alt: ['Skagosi', 'Isle of Stone'],
    summary: {
      en: 'A large, mountainous island at the mouth of the Bay of Seals whose name means "stone" in the Old Tongue. Its people are wild, rarely trade with the mainland and are whispered to be cannibals who ride unicorns; they rose in open revolt against the Starks roughly a century before the books.',
      zh: '海豹湾口一座多山的大岛，其名在古语中意为“石头”。岛民蛮野，很少与大陆往来，传言他们食人并骑乘独角兽；大约在故事开始前一百年，他们曾公开起兵反叛史塔克家族。',
    },
    houses: ['magnar', 'crowl', 'stane'], refs: ['adwd', 'twoiaf'], confidence: 'high',
    spoiler: {
      en: 'Osha and Rickon Stark are reported to have fled there; Wyman Manderly sends Davos Seaworth to bring the boy back (A Dance with Dragons).',
      zh: '据称欧莎和瑞肯·史塔克逃到了这里；威曼·曼德勒派戴佛斯·席渥斯前去带回这个孩子（《魔龙的狂舞》）。',
    },
  },
  {
    id: 'skane', kind: 'island', region: 'north', at: [628, 296], rank: 1,
    names: { en: 'Skane', zh: '斯坎恩岛' }, alt: [],
    summary: {
      en: 'A small island north of Skagos at the mouth of the Bay of Seals. Almost nothing is recorded of it beyond its name.',
      zh: '斯卡格斯岛以北、海豹湾口的一座小岛。除了名字之外几乎没有任何记载。',
    },
    houses: [], refs: ['twoiaf'], confidence: 'low',
  },

  // ───────────── forests, hills and mountains
  {
    id: 'wolfswood', kind: 'forest', region: 'north', at: [278, 462], rank: 3,
    names: { en: 'The Wolfswood', zh: '狼林' }, alt: ['Wolfswood'],
    summary: {
      en: 'The great forest of sentinels, soldier pines and oaks west of Winterfell, stretching to the coast and the mountains. The Starks hunt here; wolves, wildlings and outlaws roam it, and Deepwood Motte lies in its depths.',
      zh: '临冬城以西由哨兵树、士卒松与橡树组成的大森林，一直延伸到海岸与群山。史塔克家族在此狩猎，狼群、野人与亡命之徒出没其间，深林堡就藏在林海深处。',
    },
    houses: ['stark', 'glover'], refs: ['agot', 'adwd'], confidence: 'high',
  },
  {
    id: 'northern-mountains', kind: 'mountain', region: 'north', at: [320, 376], rank: 2,
    names: { en: 'The northern mountains', zh: '北境群山' }, alt: ['mountain clans', '山地氏族'],
    summary: {
      en: 'The high, cold mountains north and west of Winterfell, home to the hill clans (Wull, Norrey, Liddle, Knott, Harclay, Burley and the mountain Flints). The clans are poor, proud and fiercely loyal to the Starks.',
      zh: '临冬城西北方高寒的群山，是山地氏族——渥尔、诺瑞、黎德尔、诺特、哈克莱、柏利与山地菲林特——的家园。这些氏族贫穷而骄傲，对史塔克家族忠心耿耿。',
    },
    houses: ['wull', 'norrey', 'liddle', 'knott', 'harclay', 'burley', 'flint-mountains'], refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'sheepshead-hills', kind: 'mountain', region: 'north', at: [530, 562], rank: 2,
    names: { en: 'Sheepshead Hills', zh: '羊头丘陵' }, alt: [],
    summary: {
      en: 'A cluster of hills on the north shore of the Bite between Hornwood and Widow\'s Watch. They appear on the official maps; the novels give little detail.',
      zh: '咬人湾北岸、霍伍德与寡妇望之间的一片丘陵。见于官方地图，小说中着墨甚少。',
    },
    houses: [], refs: ['maps', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'lonely-hills', kind: 'mountain', region: 'north', at: [512, 390], rank: 1,
    names: { en: 'The Lonely Hills', zh: '孤寂丘陵' }, alt: ['Lonely Hills'],
    summary: {
      en: 'Desolate uplands in the north-east of the North, between the Last River and Karhold, shown on the official maps. Few people live among them.',
      zh: '北境东北部的荒凉高地，位于最后河与卡霍城之间，见于官方地图。山间人烟稀少。',
    },
    houses: [], refs: ['maps'], confidence: 'low',
  },
  {
    id: 'grey-cliffs', kind: 'landmark', region: 'north', at: [560, 394], rank: 1,
    names: { en: 'The Grey Cliffs', zh: '灰崖' }, alt: ['Grey Cliffs'],
    summary: {
      en: 'A stretch of high sea cliffs on the North\'s eastern coast, north of Karhold and facing Skagos, as shown on the official maps.',
      zh: '北境东海岸一段高耸的海崖，位于卡霍城以北、隔海遥对斯卡格斯岛，见于官方地图。',
    },
    houses: ['karstark'], refs: ['maps'], confidence: 'low',
  },

  // ───────────── lakes, rivers, swamps, bays
  {
    id: 'long-lake', kind: 'lake', region: 'north', at: [394, 580], rank: 2,
    names: { en: 'Long Lake', zh: '长湖' }, alt: [],
    summary: {
      en: 'A long, narrow lake beside the kingsroad south of Winterfell, between Castle Cerwyn and the Barrowlands. Travellers on the road pass along its shore.',
      zh: '临冬城以南、国王大道旁一座狭长的湖泊，位于赛文城与古冢原之间。沿大道而行的旅人会经过它的湖岸。',
    },
    houses: [], refs: ['maps', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'the-neck', kind: 'swamp', region: 'north', at: [356, 700], rank: 4,
    names: { en: 'The Neck', zh: '颈泽' }, alt: ['Neck', 'crannogmen', '泽地人'],
    summary: {
      en: 'The narrow, boggy isthmus that joins the North to the rest of Westeros, a maze of swamps, quicksand, lizard-lions and fever. The crannogmen of House Reed and its vassals live hidden in it, and with Moat Cailin it forms the North\'s strongest natural defence.',
      zh: '连接北境与维斯特洛其余地区的狭窄泥泽地峡，到处是沼泽、流沙、狮蜥与热病。黎德家族及其封臣泽地人隐居其间，它与卡林湾一起构成北境最坚固的天然屏障。',
    },
    houses: ['reed'], refs: ['agot', 'acok', 'asos', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'white-knife', kind: 'river', region: 'north', at: [432, 572], rank: 3,
    names: { en: 'The White Knife', zh: '白刃河' }, alt: ['White Knife'],
    summary: {
      en: 'The North\'s chief river, running south from the hills east of Winterfell to the Bite, where White Harbor stands at its mouth. It is navigable for some distance inland, making it a trade road into the North.',
      zh: '北境的主要河流，发源于临冬城以东的丘陵，向南注入咬人湾，白港就坐落在河口。下游相当长一段可以通航，是深入北境的贸易水道。',
    },
    houses: ['manderly'], refs: ['acok', 'adwd', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'broken-branch', kind: 'river', region: 'north', at: [472, 512], rank: 1,
    names: { en: 'The Broken Branch', zh: '断枝河' }, alt: ['Broken Branch'],
    summary: {
      en: 'A tributary of the White Knife flowing south-west past the Hornwood lands to join the main river above White Harbor. Its course here is schematic.',
      zh: '白刃河的支流，向西南流经霍伍德领地，在白港上游汇入干流。本图所绘河道为示意。',
    },
    houses: ['hornwood'], refs: ['maps'], confidence: 'medium',
  },
  {
    id: 'weeping-water', kind: 'river', region: 'north', at: [534, 482], rank: 2,
    names: { en: 'The Weeping Water', zh: '泣水河' }, alt: ['Weeping Water'],
    summary: {
      en: 'A river of the eastern North that flows past the Dreadfort to the sea.',
      zh: '北境东部的一条河流，流经恐怖堡后入海。',
    },
    houses: ['bolton'], refs: ['acok', 'adwd', 'maps'], confidence: 'medium',
  },
  {
    id: 'last-river', kind: 'river', region: 'north', at: [474, 350], rank: 2,
    names: { en: 'The Last River', zh: '最后河' }, alt: ['Last River'],
    summary: {
      en: 'A river of Umber country that rises near the Wall and runs east to the Bay of Seals, passing north of Last Hearth. It is the last sizeable river south of the Wall.',
      zh: '安柏家族领地内的河流，发源于长城附近，向东流入海豹湾，途经末炉城以北。它是长城以南最后一条较大的河流。',
    },
    houses: ['umber'], refs: ['maps', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'fever-river', kind: 'river', region: 'north', at: [308, 708], rank: 1,
    names: { en: 'The Fever River', zh: '热病河' }, alt: ['Fever River'],
    summary: {
      en: 'A sluggish river winding west through the swamps of the Neck to Ironman\'s Bay. The ironborn used it to reach Moat Cailin from the sea.',
      zh: '一条缓慢的河流，向西蜿蜒穿过颈泽的沼泽注入铁民湾。铁种曾借此河由海上抵达卡林湾。',
    },
    houses: ['reed'], refs: ['acok', 'maps'], confidence: 'medium',
  },
  {
    id: 'saltspear', kind: 'bay', region: 'north', at: [556, 580], rank: 1,
    names: { en: 'The Saltspear', zh: '盐矛湾' }, alt: ['Saltspear'],
    summary: {
      en: 'A narrow arm of the sea reaching into the Bite\'s north shore near the Sheepshead Hills, as shown on the official maps. Its outline is not drawn on this map.',
      zh: '咬人湾北岸羊头丘陵附近伸入陆地的一道狭长海湾，见于官方地图。本图未单独描绘其轮廓。',
    },
    houses: [], refs: ['maps'], confidence: 'low',
  },
] };
