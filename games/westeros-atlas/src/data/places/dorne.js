// Places of this group — see docs/PLACES_SCHEMA.md
// Positions follow docs/MAP_GRID.md anchors where given; others are approximate (see `confidence`).
export default { group: 'dorne', places: [
  // ------------------------------------------------------------ Sunspear and the Greenblood mouth
  {
    id: 'sunspear',
    summary: {
      en: 'The ancient seat of House Martell, built where a rocky spit of land juts into the sea at Dorne\'s eastern end. Its Spear Tower, the Tower of the Sun and the Threefold Gate look down on the crowded mud-brick sprawl of the shadow city. Since Nymeria\'s Rhoynar landed here a thousand years ago, Sunspear has ruled all Dorne.',
      zh: '马泰尔家族的古老居城，建在多恩东端一道伸入大海的岩石岬角上。长矛塔、太阳塔与三重门俯瞰着城下拥挤杂乱的泥砖街巷——影子城。自千年前娜梅莉亚率洛伊拿人在此登陆，阳戟城便统治着整个多恩。',
    },
    houses: ['martell'],
    refs: ['agot', 'affc', 'adwd', 'twoiaf'],
    confidence: 'high',
  },
  {
    id: 'shadow-city', kind: 'town', region: 'dorne', at: [603, 1272], rank: 2,
    names: { en: 'The Shadow City', zh: '影子城' },
    alt: ['Shadow City', 'Sunspear town'],
    summary: {
      en: 'The tangle of mud-brick hovels, shops and alleys that grew up beneath Sunspear\'s walls. Its narrow lanes are shaded by the castle itself, hence the name; three successive walls must be passed to reach the Old Palace.',
      zh: '在阳戟城城墙下逐渐长成的一片泥砖陋屋、店铺与窄巷。街巷终日笼罩在城堡的阴影之中，故得此名；要抵达旧王宫，须先穿过层层城墙。',
    },
    houses: ['martell'], refs: ['affc', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'water-gardens', kind: 'castle', region: 'dorne', at: [594, 1291], rank: 3,
    names: { en: 'The Water Gardens', zh: '流水花园' },
    alt: ['Water Gardens', '水之花园'],
    summary: {
      en: 'A pink-marble pleasure palace of fountains, pools and orange trees a few leagues west of Sunspear by the sea. A Martell prince built it for his Targaryen bride; today children of nobles and commoners alike play in its pools together. Prince Doran retires here to nurse his gout.',
      zh: '阳戟城以西数里格、临海而建的粉色大理石离宫，遍布喷泉、水池与橙树。当年一位马泰尔亲王为迎娶坦格利安新娘而建；如今贵族与平民的孩子一同在池中嬉水。道朗亲王为痛风所苦，常避居于此。',
    },
    houses: ['martell'], refs: ['affc', 'adwd', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'planky-town', kind: 'town', region: 'dorne', at: [598, 1262], rank: 3,
    names: { en: 'Planky Town', zh: '木板镇' },
    summary: {
      en: 'A floating town at the mouth of the Greenblood, made of barges, poleboats and hulks lashed together with planks and ropes. It is Dorne\'s busiest port for ships from the Free Cities, and the Orphans of the Greenblood ply the river above it.',
      zh: '绿血河口一座漂浮的城镇，由驳船、撑篙船与废船以木板和绳索连缀而成。它是多恩迎接自由贸易城邦船只最繁忙的港口，"绿血孤儿"们就在其上游的河面往来撑船。',
    },
    houses: ['martell'], refs: ['affc', 'adwd', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'lemonwood', kind: 'castle', region: 'dorne', at: [626, 1218], rank: 2,
    names: { en: 'Lemonwood', zh: '柠檬林城' },
    summary: {
      en: 'Seat of House Dalt in eastern Dorne, not far from Sunspear; its name recalls the lemon groves around it. Ser Andrey "Drey" Dalt, heir to Lemonwood, is one of Princess Arianne\'s closest companions.',
      zh: '戴尔特家族的居城，位于多恩东部、离阳戟城不远，因周围的柠檬林而得名。柠檬林的继承人安德雷（"德雷"）·戴尔特爵士是亚莲恩公主最亲密的伙伴之一。',
    },
    houses: ['dalt'], refs: ['affc', 'twoiaf'], confidence: 'low',
  },
  // ------------------------------------------------------------ the Greenblood and the river castles
  {
    id: 'godsgrace', kind: 'castle', region: 'dorne', at: [480, 1238], rank: 3,
    names: { en: 'Godsgrace', zh: '神恩城' },
    summary: {
      en: 'Seat of House Allyrion where the Brimstone and the Vaith join to form the Greenblood. The surrounding river valley is some of the most fertile land in Dorne, a green strip between the sands.',
      zh: '艾利昂家族的居城，坐落于硫磺河与维斯河交汇、汇成绿血河之处。周围的河谷是多恩最肥沃的土地之一，在黄沙之间铺开一条绿带。',
    },
    houses: ['allyrion'], refs: ['affc', 'twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'shandystone', kind: 'ruin', region: 'dorne', at: [520, 1270], rank: 2,
    names: { en: 'Shandystone', zh: '沙迪石城' },
    alt: ['沙迪石'],
    summary: {
      en: 'An abandoned castle in the sands, once watered by a well that has long since run dry. Princess Arianne\'s party rests among its ruins while carrying Myrcella Baratheon toward the Greenblood.',
      zh: '黄沙中一座荒废的城堡，昔日赖以维生的水井早已干涸。亚莲恩公主一行护送弥赛菈·拜拉席恩前往绿血河时，曾在其废墟中歇脚。',
    },
    spoiler: {
      en: 'Arianne\'s scheme to crown Myrcella ends at the Greenblood soon after: Areo Hotah intercepts them, Ser Arys Oakheart is killed and Myrcella is maimed by Darkstar.',
      zh: '亚莲恩拥立弥赛菈的密谋在离开此地后不久便于绿血河畔告终：何塔截住了他们，亚历斯·奥克赫特爵士丧命，弥赛菈被暗星砍伤毁容。',
    },
    houses: [], refs: ['affc'], confidence: 'low',
  },
  {
    id: 'salt-shore', kind: 'castle', region: 'dorne', at: [520, 1314], rank: 2,
    names: { en: 'Salt Shore', zh: '盐滨城' },
    alt: ['Saltshore'],
    summary: {
      en: 'Seat of House Gargalen on Dorne\'s southern coast facing the Summer Sea. Lord Tremond Gargalen is among the Dornish lords who come to Sunspear in the time of Myrcella\'s stay.',
      zh: '盖加伦家族的居城，位于多恩南部海岸、面朝夏日之海。特蒙德·盖加伦大人是弥赛菈寄居多恩期间前来阳戟城的多恩领主之一。',
    },
    houses: ['gargalen'], refs: ['affc', 'twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'ghost-hill', kind: 'castle', region: 'dorne', at: [586, 1198], rank: 2,
    names: { en: 'Ghost Hill', zh: '鬼丘城' },
    alt: ['鬼丘'],
    summary: {
      en: 'Seat of House Toland, whose heraldry shows a dragon devouring its own tail. Its position near the Sea of Dorne coast here is approximate.',
      zh: '托兰家族的居城，其纹章是一条咬住自己尾巴的龙。此处标注在多恩海沿岸附近，位置为近似。',
    },
    houses: ['toland'], refs: ['affc', 'twoiaf'], confidence: 'low',
  },
  {
    id: 'spottswood', kind: 'castle', region: 'dorne', at: [528, 1196], rank: 2,
    names: { en: 'Spottswood', zh: '斑林城' },
    summary: {
      en: 'Seat of House Santagar. Its heir, "Spotted Sylva" Santagar, is one of Princess Arianne\'s confidantes. The books say little of the castle itself, and its placement here on the Sea of Dorne side is a guess.',
      zh: '桑塔加家族的居城。其继承人"斑点"席尔娃·桑塔加是亚莲恩公主的心腹之一。书中对城堡本身着墨极少，此处将其标在多恩海一侧，纯属推测。',
    },
    houses: ['santagar'], refs: ['affc'], confidence: 'low',
  },
  // ------------------------------------------------------------ the sands
  {
    id: 'hellholt', kind: 'castle', region: 'dorne', at: [446, 1210], rank: 2,
    names: { en: 'Hellholt', zh: '地狱堡' },
    summary: {
      en: 'Seat of House Uller on the Brimstone, a river whose waters stink of sulphur. The Ullers have a name for wildness; Ellaria Sand, Prince Oberyn\'s paramour, is the natural daughter of Lord Harmen Uller.',
      zh: '乌勒家族的居城，坐落于河水散发硫磺臭味的硫磺河畔。乌勒家的人素以狂野著称；奥柏伦亲王的情人艾拉莉亚·沙德便是哈蒙·乌勒大人的私生女。',
    },
    houses: ['uller'], refs: ['asos', 'affc', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'vaith', kind: 'castle', region: 'dorne', at: [402, 1270], rank: 2,
    names: { en: 'Vaith', zh: '维斯' },
    alt: ['维斯城'],
    summary: {
      en: 'Seat of House Vaith in the deep sands, on the upper reaches of the river of the same name. Little more than its lords\' loyalty to Sunspear is recorded.',
      zh: '维斯家族的居城，位于深沙之中、同名河流的上游。关于它，书中记下的不过是其领主效忠阳戟城而已。',
    },
    houses: ['vaith'], refs: ['affc', 'twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'sandstone', kind: 'castle', region: 'dorne', at: [372, 1240], rank: 2,
    names: { en: 'Sandstone', zh: '沙石城' },
    summary: {
      en: 'Seat of House Qorgyle in the western deep sands, among the harshest country in Dorne. Ser Gulian Qorgyle rides to King\'s Landing in Prince Oberyn\'s company.',
      zh: '科格尔家族的居城，位于西部深沙之中，是多恩最严酷的地带之一。古里安·科格尔爵士曾随奥柏伦亲王一同前往君临。',
    },
    houses: ['qorgyle'], refs: ['asos', 'twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'tor', kind: 'castle', region: 'dorne', at: [334, 1246], rank: 2,
    names: { en: 'The Tor', zh: '托尔城' },
    alt: ['Tor'],
    summary: {
      en: 'Seat of House Jordayne, near Dorne\'s south-western coast between Starfall and the deep sands. The Jordaynes bear a golden quill on their arms.',
      zh: '乔戴恩家族的居城，位于多恩西南海岸附近，介于星坠城与深沙之间。乔戴恩家族的纹章是一支金色羽毛笔。',
    },
    houses: ['jordayne'], refs: ['affc', 'twoiaf', 'maps'], confidence: 'medium',
  },
  // ------------------------------------------------------------ the west: Starfall and the Torrentine
  {
    id: 'starfall', kind: 'castle', region: 'dorne', at: [292, 1222], rank: 3,
    names: { en: 'Starfall', zh: '星坠城' },
    summary: {
      en: 'Seat of House Dayne on an island where the Torrentine meets the Summer Sea. Legend says the Daynes\' first lord followed a falling star to this spot and forged the sword Dawn from its heart. The finest Dayne knight of each generation bears Dawn as the Sword of the Morning.',
      zh: '戴恩家族的居城，坐落于激流河注入夏日之海处的一座岛上。传说戴恩家的始祖追随一颗坠落的星辰来到此地，并以其星核锻造了宝剑"黎明"。每一代中最出色的戴恩骑士执此剑，被称为"拂晓神剑"。',
    },
    houses: ['dayne'], refs: ['agot', 'asos', 'affc', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'high-hermitage', kind: 'castle', region: 'dorne', at: [308, 1214], rank: 2,
    names: { en: 'High Hermitage', zh: '高隐庐' },
    summary: {
      en: 'A small castle near Starfall held by a lesser branch of House Dayne. Its best-known son is Ser Gerold Dayne, called Darkstar, a dangerous knight with a streak of purple in his silver hair.',
      zh: '星坠城附近的一座小城堡，由戴恩家族的一个旁支据守。此地最出名的子弟是绰号"暗星"的杰洛·戴恩爵士——银发中夹着一缕紫色、危险难测的骑士。',
    },
    houses: ['dayne-of-high-hermitage'], refs: ['affc', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'torrentine', kind: 'river', region: 'dorne', at: [298, 1212], rank: 2,
    names: { en: 'The Torrentine', zh: '激流河' },
    alt: ['Torrentine'],
    summary: {
      en: 'A swift river that rushes down from the western Red Mountains to the Summer Sea, reaching it at Starfall. Its falls and rapids give it its name.',
      zh: '一条湍急的河流，自赤红山脉西段奔流而下，在星坠城注入夏日之海。其名正得自沿途的瀑布与急流。',
    },
    houses: ['dayne'], refs: ['affc', 'twoiaf', 'maps'], confidence: 'medium',
  },
  // ------------------------------------------------------------ the Red Mountains and their passes
  {
    id: 'red-mountains', kind: 'mountain', region: 'dorne', at: [420, 1166], rank: 4,
    names: { en: 'The Red Mountains', zh: '赤红山脉' },
    alt: ['Red Mountains', 'Dornish mountains'],
    summary: {
      en: 'The rugged red-rock range that walls Dorne off from the Reach and the Stormlands. Only two practical roads cross it — the Prince\'s Pass in the west and the Boneway in the east — which is why Dorne alone resisted the Conqueror\'s dragons and armies for so long.',
      zh: '赤色岩石构成的崎岖山脉，将多恩与河湾地、风暴地隔开。真正可行的通道只有两条——西边的亲王隘口与东边的骸骨路——这正是多恩能长期抵御征服者的巨龙与大军的原因。',
    },
    houses: ['yronwood', 'fowler', 'manwoody', 'blackmont', 'wyl'], refs: ['agot', 'twoiaf', 'maps'], confidence: 'high',
  },
  {
    id: 'princes-pass', kind: 'pass', region: 'dorne', at: [318, 1182], rank: 3,
    names: { en: 'Prince\'s Pass', zh: '亲王隘口' },
    summary: {
      en: 'The western road through the Red Mountains, linking the Reach\'s Dornish Marches to the sands. Skyreach and Kingsgrave guard its southern end, and invading armies have repeatedly come to grief in its narrows.',
      zh: '穿越赤红山脉的西路，连接河湾地一侧的多恩边疆地与南方的沙漠。天及城与王墓扼守其南端，入侵的大军屡屡在这条险道中折戟。',
    },
    houses: ['fowler', 'manwoody'], refs: ['asos', 'twoiaf', 'maps'], confidence: 'high',
  },
  {
    id: 'skyreach', kind: 'castle', region: 'dorne', at: [324, 1198], rank: 2,
    names: { en: 'Skyreach', zh: '天及城' },
    summary: {
      en: 'Seat of House Fowler, perched at the Dornish end of the Prince\'s Pass. The Fowlers, whose arms show a falcon, have long been the first Dornish lords any army coming down the pass must face.',
      zh: '佛勒家族的居城，高踞于亲王隘口的多恩一端。以猎鹰为纹章的佛勒家族，历来是任何从隘口南下的军队首先要面对的多恩领主。',
    },
    houses: ['fowler'], refs: ['asos', 'twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'kingsgrave', kind: 'castle', region: 'dorne', at: [350, 1188], rank: 2,
    names: { en: 'Kingsgrave', zh: '王墓' },
    alt: ['王墓城'],
    summary: {
      en: 'Seat of House Manwoody in the Red Mountains near the Prince\'s Pass; its grim name, echoed by the crowned skull on the Manwoody arms, is said to recall a king who fell nearby. Lord Dagos Manwoody is a loyal bannerman of Sunspear.',
      zh: '曼伍迪家族的居城，位于亲王隘口附近的赤红山脉中；阴森的城名与曼伍迪纹章上那颗戴冠骷髅相互呼应，据说是在纪念一位殒命于附近的国王。达戈斯·曼伍迪大人是阳戟城忠实的封臣。',
    },
    houses: ['manwoody'], refs: ['affc', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'blackmont', kind: 'castle', region: 'dorne', at: [384, 1188], rank: 2,
    names: { en: 'Blackmont', zh: '黑山城' },
    summary: {
      en: 'Seat of House Blackmont in the Red Mountains, whose arms show a black vulture clutching a babe. Lady Larra Blackmont and her daughter Jynessa travel to King\'s Landing with Prince Oberyn.',
      zh: '布莱克蒙家族的居城，位于赤红山脉之中，其纹章是一只爪攫婴孩的黑秃鹫。拉拉·布莱克蒙夫人与女儿吉妮莎曾随奥柏伦亲王前往君临。',
    },
    houses: ['blackmont'], refs: ['asos', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'tower-of-joy', kind: 'ruin', region: 'dorne', at: [356, 1206], rank: 2,
    names: { en: 'The Tower of Joy', zh: '极乐塔' },
    alt: ['Tower of Joy', '喜悦之塔'],
    summary: {
      en: 'A lone round tower in the Red Mountains, remembered in Eddard Stark\'s fevered dreams; Eddard later pulled it down and used its stones to raise eight cairns. Its exact position is never given in the books; the marker here is only a guess somewhere in the mountains.',
      zh: '赤红山脉中一座孤零零的圆塔，常在艾德·史塔克的梦魇中出现；后来艾德将它拆毁，用其石块垒起了八座坟冢。书中从未说明其确切位置，此处标记只是对山中某处的猜测。',
    },
    spoiler: {
      en: 'Rhaegar Targaryen named the tower. At the end of Robert\'s Rebellion Eddard and six companions fought three Kingsguard here, Ser Arthur Dayne among them; only Eddard and Howland Reed survived. Lyanna Stark was found inside, dying "in a bed of blood" — what she made Ned promise is one of the series\' central mysteries.',
      zh: '此塔由雷加·坦格利安命名。劳勃叛乱末期，艾德与六名同伴在此与三名御林铁卫（包括亚瑟·戴恩爵士）死战，只有艾德与霍兰·黎德生还。莱安娜·史塔克被发现躺在塔中，"在血床上"奄奄一息——她让奈德许下的承诺，是全书的核心谜团之一。',
    },
    houses: [], refs: ['agot', 'asos'], confidence: 'low',
  },
  {
    id: 'yronwood', kind: 'castle', region: 'dorne', at: [430, 1186], rank: 3,
    names: { en: 'Yronwood', zh: '铁木城' },
    summary: {
      en: 'The great stronghold of House Yronwood on the southern slopes of the Red Mountains, near the Boneway. Before the Rhoynar came the Yronwoods were kings over much of Dorne, and they remain the most powerful — and least reconciled — of Sunspear\'s vassals.',
      zh: '伊伦伍德家族的坚固要塞，坐落于赤红山脉南麓、骸骨路附近。洛伊拿人到来之前，伊伦伍德家族曾是多恩大片土地之王，至今仍是阳戟城麾下最强大、也最心存芥蒂的封臣。',
    },
    houses: ['yronwood'], refs: ['adwd', 'twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'wyl', kind: 'castle', region: 'dorne', at: [470, 1172], rank: 2,
    names: { en: 'Wyl', zh: '威尔' },
    alt: ['威尔城'],
    summary: {
      en: 'Seat of House Wyl, high in the Red Mountains along the Boneway. The Wyls have a dark name among stormlanders as mountain raiders who ambushed armies and travellers on the pass.',
      zh: '威尔家族的居城，高踞于赤红山脉、骸骨路沿线。在风暴地人口中，威尔家族是凶名在外的山地劫掠者，惯于在山路上伏击军队与旅人。',
    },
    houses: ['wyl'], refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'boneway', kind: 'pass', region: 'dorne', at: [488, 1162], rank: 3,
    names: { en: 'The Boneway', zh: '骸骨路' },
    alt: ['Boneway', 'Stone Way'],
    summary: {
      en: 'The eastern road over the Red Mountains, climbing from the Stormlands past Wyl to Yronwood. Its name comes from the bones of the many soldiers who have died along it in Dorne\'s wars.',
      zh: '翻越赤红山脉的东路，从风暴地出发，经威尔城下行至铁木城。其名来自历次多恩战争中死在沿途的无数士兵的白骨。',
    },
    houses: ['wyl', 'yronwood'], refs: ['adwd', 'twoiaf', 'maps'], confidence: 'high',
  },
  // ------------------------------------------------------------ rivers, sands and capes
  {
    id: 'greenblood', kind: 'river', region: 'dorne', at: [536, 1252], rank: 3,
    names: { en: 'The Greenblood', zh: '绿血河' },
    alt: ['Greenblood'],
    summary: {
      en: 'Dorne\'s only great river, formed at Godsgrace and flowing east through the sands to the sea at Planky Town. Nearly all of Dorne\'s farming clings to its banks, and the Orphans of the Greenblood — descendants of Rhoynar who still long for their lost river — pole their boats along it.',
      zh: '多恩唯一的大河，在神恩城汇成，向东穿过沙漠，于木板镇入海。多恩的农耕几乎全都依附在它两岸；"绿血孤儿"——仍在怀念故土洛恩河的洛伊拿人后裔——在河上撑篙往来。',
    },
    houses: ['allyrion', 'martell'], refs: ['affc', 'adwd', 'twoiaf', 'maps'], confidence: 'high',
  },
  {
    id: 'brimstone', kind: 'river', region: 'dorne', at: [462, 1222], rank: 2,
    names: { en: 'The Brimstone', zh: '硫磺河' },
    alt: ['Brimstone'],
    summary: {
      en: 'A sulphurous river flowing down from the Red Mountains past Hellholt to join the Vaith at Godsgrace. Its yellow, foul-smelling water gives it its name.',
      zh: '一条带着硫磺气味的河流，自赤红山脉流经地狱堡，在神恩城与维斯河汇合。河水泛黄而腥臭，因此得名。',
    },
    houses: ['uller'], refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'vaith-river', kind: 'river', region: 'dorne', at: [452, 1246], rank: 2,
    names: { en: 'The Vaith', zh: '维斯河' },
    summary: {
      en: 'A thin desert river rising in the deep sands near the castle of Vaith and running east to Godsgrace, where it meets the Brimstone to form the Greenblood.',
      zh: '一条细瘦的沙漠河流，发源于维斯城附近的深沙，向东流至神恩城，与硫磺河汇合成绿血河。',
    },
    houses: ['vaith'], refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'dornish-sands', kind: 'desert', region: 'dorne', at: [468, 1290], rank: 3,
    names: { en: 'The Dornish sands', zh: '多恩沙漠' },
    alt: ['Deep sands', 'Dornish desert', '深沙'],
    summary: {
      en: 'The red and white sands that fill Dorne\'s heart, with the harshest "deep sands" in the west. Travellers cross them by night, from well to well, and the lords of the sand castles answer to Sunspear.',
      zh: '填满多恩腹地的红白沙海，西部的"深沙"最为严酷。旅人多在夜间穿越，循着一口口水井前行；坐落其间的沙漠城堡领主皆听命于阳戟城。',
    },
    houses: ['qorgyle', 'vaith', 'uller'], refs: ['affc', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'broken-arm', kind: 'landmark', region: 'dorne', at: [664, 1212], rank: 2,
    names: { en: 'The Broken Arm', zh: '断臂角' },
    alt: ['Broken Arm', 'Arm of Dorne'],
    summary: {
      en: 'The ragged peninsula at Dorne\'s north-eastern tip, pointing toward the Stepstones. Legend says it is what remains of the Arm of Dorne, the land bridge to Essos that the children of the forest shattered to stop the First Men.',
      zh: '多恩东北端参差的半岛，指向石阶列岛。传说它是"多恩之臂"的残余——那条连通厄索斯的陆桥，被森林之子击碎以阻挡先民。',
    },
    houses: [], refs: ['agot', 'twoiaf', 'maps'], confidence: 'high',
  },
] };
