// Regions: used for map labels, filters, breadcrumbs ("World → Region → Location → Landmark") and region fly-to.
// bounds = [x0,y0,x1,y1] in world-map units (3200 x 2000, 1 unit ≈ 2 miles). Positions are artistic approximations of an
// uncharted world: the books give relative distances, not survey coordinates (see docs/MAP_GRID.md, docs/MAP_NOTES.md).
export const WORLD = { w: 3200, h: 2000 };

export const REGIONS = [
  { id: 'beyond-wall', continent: 'westeros', names: { en: 'Beyond the Wall', zh: '长城以北' }, alt: ['Land of Always Winter', 'Haunted Forest', 'Frostfangs', 'free folk', '永冬之地', '鬼影森林', '闹鬼森林', '霜雪之牙', '自由民', '野人'], label: [400, 150], size: 20, bounds: [140, 0, 640, 300], desc: { en: 'The wild north of the Wall: the Haunted Forest, the Frostfangs and the Land of Always Winter.', zh: '长城以北的荒野：鬼影森林、霜雪之牙与永冬之地。' } },
  { id: 'north', continent: 'westeros', names: { en: 'The North', zh: '北境' }, alt: ['Gift', 'Wolfswood', 'Neck', '赠地', '狼林', '颈泽'], label: [330, 432], size: 26, bounds: [130, 300, 620, 720], desc: { en: 'The largest of the Seven Kingdoms: cold, thinly settled and fiercely proud, ruled from Winterfell.', zh: '七大王国中疆域最广的一国：寒冷、地广人稀，民风刚烈自傲，以临冬城为统治中心。' } },
  { id: 'iron-islands', continent: 'westeros', names: { en: 'Iron Islands', zh: '铁群岛' }, alt: ['Ironmen', 'Ironborn', '铁种', '铁民'], label: [150, 728], size: 15, bounds: [140, 712, 262, 826], desc: { en: 'A bleak archipelago of reavers and sea-lords off the western coast.', zh: '西海岸外的荒凉群岛，劫掠者与海上领主的故乡。' } },
  { id: 'vale', continent: 'westeros', names: { en: 'The Vale', zh: '谷地' }, alt: ['Vale of Arryn', 'Mountains of the Moon', '艾林谷', '明月山脉', '月亮山脉'], label: [540, 770], size: 22, bounds: [400, 690, 650, 840], desc: { en: 'A hidden valley ringed by the Mountains of the Moon, guarded by the Eyrie.', zh: '明月山脉环抱的隐秘山谷，由鹰巢城守护。' } },
  { id: 'riverlands', continent: 'westeros', names: { en: 'The Riverlands', zh: '河间地' }, alt: ['Trident', 'God\'s Eye', '三叉戟河', '神眼湖', '众神之眼'], label: [330, 800], size: 22, bounds: [270, 720, 500, 920], desc: { en: 'Fertile, contested country watered by the three forks of the Trident.', zh: '三叉戟河三条支流灌溉的沃土，历来兵家必争。' } },
  { id: 'westerlands', continent: 'westeros', names: { en: 'The Westerlands', zh: '西境' }, alt: ['Lannister lands', '兰尼斯特', '凯岩城'], label: [268, 930], size: 19, bounds: [195, 790, 320, 985], desc: { en: 'Hills and gold mines along the western coast, seat of House Lannister.', zh: '西海岸丘陵起伏、金矿遍布之地，兰尼斯特家族的领地。' } },
  { id: 'crownlands', continent: 'westeros', names: { en: 'The Crownlands', zh: '王领' }, alt: ['Crown lands', 'Crownlands', '王室领地'], label: [520, 890], size: 19, bounds: [420, 840, 620, 990], desc: { en: 'The royal domain around King\'s Landing and Blackwater Bay.', zh: '以君临与黑水湾为中心的王室直辖领地。' } },
  { id: 'reach', continent: 'westeros', names: { en: 'The Reach', zh: '河湾地' }, alt: ['Highgarden', 'Arbor', '高庭', '青亭岛'], label: [360, 1110], size: 24, bounds: [140, 940, 480, 1200], desc: { en: 'Green, wealthy farmland of the south-west; its lords are the Tyrells and Hightowers.', zh: '西南部富庶青翠的农耕之地，提利尔与海塔尔等大家族坐镇于此。' } },
  { id: 'stormlands', continent: 'westeros', names: { en: 'The Stormlands', zh: '风暴地' }, alt: ['Kingswood', '御林', '风暴之地'], label: [566, 1072], size: 20, bounds: [460, 950, 690, 1160], desc: { en: 'Hard country of forests and storms between the Reach and the Narrow Sea.', zh: '介于河湾地与狭海之间，森林密布、风暴频仍的严酷之地。' } },
  { id: 'dorne', continent: 'westeros', names: { en: 'Dorne', zh: '多恩' }, alt: ['Dornish', 'Red Mountains', '多恩人', '赤红山脉'], label: [450, 1250], size: 24, bounds: [255, 1150, 700, 1340], desc: { en: 'A southern land of deserts, mountains and salt shores, ruled from Sunspear.', zh: '南方的沙漠、群山与盐碱海岸之地，以阳戟城为统治中心。' } },
  { id: 'free-cities', continent: 'essos', names: { en: 'The Free Cities', zh: '自由贸易城邦' }, alt: ['Nine Free Cities', '九大自由贸易城邦', '自由城邦', '九大自由城邦'], label: [930, 890], size: 24, bounds: [730, 480, 1210, 1290], desc: { en: 'Independent city-states of western Essos, most founded in the age of Valyria as colonies or refuges.', zh: '散布于厄索斯西部的独立城邦，多为瓦雷利亚时代的殖民地或避难者所建。' } },
  { id: 'dothraki-sea', continent: 'essos', names: { en: 'The Dothraki Sea', zh: '多斯拉克海' }, alt: ['Grass sea', '草海'], label: [1420, 660], size: 26, bounds: [1150, 450, 2050, 1110], desc: { en: 'A vast ocean of grass roamed by the horse-lords, with sacred Vaes Dothrak at its heart.', zh: '一望无际的草海，多斯拉克马王纵横其间，圣城维斯·多斯拉克位于其腹地。' } },
  { id: 'valyria', continent: 'essos', names: { en: 'The Valyrian Peninsula', zh: '瓦雷利亚半岛' }, alt: ['Valyria', 'Lands of the Long Summer', '瓦雷利亚', '长夏之地'], label: [1130, 1290], size: 18, bounds: [1040, 1200, 1260, 1480], desc: { en: 'The scarred peninsula where the Freehold once ruled, before the Doom.', zh: '瓦雷利亚自由堡垒昔日的疆土，末日浩劫之后满目疮痍。' } },
  { id: 'slavers-bay', continent: 'essos', names: { en: 'Slaver\'s Bay', zh: '奴隶湾' }, alt: ['Ghis', 'Ghiscari', 'Yunkish', '吉斯', '吉斯卡利'], label: [1380, 1400], size: 17, bounds: [1230, 1100, 1480, 1480], desc: { en: 'A bay lined with the old Ghiscari slave cities of Astapor, Yunkai and Meereen.', zh: '沿岸坐落着阿斯塔波、渊凯与弥林三座吉斯卡利古老奴隶城市的海湾。' } },
  { id: 'red-waste', continent: 'essos', names: { en: 'The Red Waste', zh: '红色荒原' }, alt: ['Red desert', '红色沙漠'], label: [1760, 1330], size: 18, bounds: [1600, 1150, 1960, 1480], desc: { en: 'A barren desert that stands between the Dothraki Sea and the far east.', zh: '横亘于多斯拉克海与远东之间的贫瘠沙漠。' } },
  { id: 'eastern-essos', continent: 'essos', names: { en: 'The Jade Coast', zh: '玉海沿岸' }, alt: ['Qarth', 'Jade Sea', 'Qartheen', '魁尔斯', '玉海', '翡翠海', '玉门'], label: [2060, 1400], size: 18, bounds: [1840, 1340, 2220, 1560], desc: { en: 'Coastal trading lands of the east, dominated by the great port of Qarth.', zh: '东方的沿海商贸之地，由大港魁尔斯主导。' } },
  { id: 'far-east', continent: 'essos', names: { en: 'The Far East', zh: '远东' }, alt: ['Yi Ti', 'Asshai', 'Shadow Lands', '夷地', '亚夏', '阴影之地'], label: [2560, 1000], size: 22, bounds: [2100, 380, 3200, 1820], desc: { en: 'Yi Ti, the Shadow Lands and Asshai: the edge of what the books let us see.', zh: '夷地、阴影之地与亚夏——书中所能窥见的世界尽头。' } },
  { id: 'summer-isles', continent: 'essos', names: { en: 'The Summer Isles', zh: '盛夏群岛' }, alt: ['Summer Islands', '夏日群岛', '盛夏之民'], label: [520, 1630], size: 17, bounds: [360, 1450, 690, 1650], desc: { en: 'A warm archipelago of skilled sailors and archers south of Westeros.', zh: '维斯特洛以南的温暖群岛，岛民以航海与箭术闻名。' } },
  { id: 'shivering-sea', continent: 'essos', names: { en: 'The Shivering Sea', zh: '颤抖海' }, alt: ['Ibben', 'Ibbenese', '伊班'], label: [1670, 210], size: 17, bounds: [1450, 140, 1860, 430], desc: { en: 'The cold northern sea between Westeros, Essos and the island of Ibben.', zh: '维斯特洛、厄索斯与伊班岛之间的北方寒海。' } },
];
/** Continent captions shown at world zoom (rot ≠ 0 → drawn on the sea, blue). */
export const CONTINENTS = [
  { names: { en: 'Westeros', zh: '维斯特洛' }, at: [70, 640], size: 40, rot: -1.5708 },
  { names: { en: 'Essos', zh: '厄索斯' }, at: [1560, 600], size: 56 },
  { names: { en: 'Sothoryos', zh: '索斯罗斯' }, at: [1420, 1900], size: 34 },
];
export const regionById = Object.fromEntries(REGIONS.map((r) => [r.id, r]));

/** Water body labels (map-only decoration). size ≥ 18 = open sea (visible at world zoom); smaller = bays/straits (fade in later). */
export const SEAS = [
  { id: 'narrow-sea', names: { en: 'The Narrow Sea', zh: '狭海' }, at: [676, 800], rot: -1.42, size: 26 },
  { id: 'sunset-sea', names: { en: 'Sunset Sea', zh: '日落之海' }, at: [64, 1180], rot: -1.5708, size: 28 },
  { id: 'summer-sea', names: { en: 'The Summer Sea', zh: '夏日之海' }, at: [880, 1450], rot: 0, size: 28 },
  { id: 'shivering-sea', names: { en: 'The Shivering Sea', zh: '颤抖海' }, at: [1100, 300], rot: 0, size: 28 },
  { id: 'jade-sea', names: { en: 'The Jade Sea', zh: '玉海' }, at: [2480, 1500], rot: 0, size: 24 },
  { id: 'bay-of-ice', names: { en: 'Bay of Ice', zh: '寒冰湾' }, zhNote: '◇', at: [226, 300], rot: 0.5, size: 10 },
  { id: 'bay-of-seals', names: { en: 'Bay of Seals', zh: '海豹湾' }, at: [530, 300], rot: 0.5, size: 10 },
  { id: 'the-bite', names: { en: 'The Bite', zh: '咬人湾' }, zhNote: '◇', at: [510, 660], rot: -0.2, size: 12 },
  { id: 'blazewater-bay', names: { en: 'Blazewater Bay', zh: '炽水湾' }, zhNote: '◇', at: [196, 520], rot: 1.2, size: 9 },
  { id: 'ironmans-bay', names: { en: 'Ironman\'s Bay', zh: '铁民湾' }, at: [262, 750], rot: 1.2, size: 9 },
  { id: 'bay-of-crabs', names: { en: 'Bay of Crabs', zh: '螃蟹湾' }, at: [530, 846], rot: 0, size: 8 },
  { id: 'blackwater-bay', names: { en: 'Blackwater Bay', zh: '黑水湾' }, at: [528, 934], rot: 0, size: 9 },
  { id: 'shipbreaker-bay', names: { en: 'Shipbreaker Bay', zh: '破船湾' }, at: [580, 1016], rot: 0.3, size: 8 },
  { id: 'straits-of-tarth', names: { en: 'Straits of Tarth', zh: '塔斯海峡' }, zhNote: '◇', at: [650, 1086], rot: -0.6, size: 7 },
  { id: 'sea-of-dorne', names: { en: 'Sea of Dorne', zh: '多恩海' }, at: [566, 1162], rot: 0, size: 10 },
  { id: 'whispering-sound', names: { en: 'Whispering Sound', zh: '低语湾' }, zhNote: '◇', at: [176, 1132], rot: 0.9, size: 7 },
  { id: 'redwyne-straits', names: { en: 'Redwyne Straits', zh: '雷德温海峡' }, zhNote: '◇', at: [172, 1218], rot: 0.3, size: 7 },
  { id: 'slavers-bay', names: { en: 'Slaver\'s Bay', zh: '奴隶湾' }, at: [1330, 1226], rot: -0.4, size: 13 },
  { id: 'gulf-of-grief', names: { en: 'Gulf of Grief', zh: '悲伤湾' }, at: [1240, 1290], rot: 1.25, size: 10 },
  { id: 'smoking-sea', names: { en: 'The Smoking Sea', zh: '烟海' }, at: [1128, 1386], rot: 0, size: 8 },
  { id: 'bay-of-lorath', names: { en: 'Bay of Lorath', zh: '洛拉斯湾' }, zhNote: '◇', at: [960, 560], rot: 0, size: 8 },
  { id: 'straits-of-qarth', names: { en: 'Jade Gates', zh: '玉门' }, at: [1960, 1540], rot: 0, size: 8 },
];
