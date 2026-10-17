// Location registry. Eager (small): drives the map, search, directory and routing.
// Deep content (landmarks, tours, source notes) lives in src/content/<id>.js and loads together with the scene.
//   kind:  city | town | castle | ruin | sacred
//   rank:  1..5 label priority on the map (5 = visible at world zoom)
//   at:    [x,y] on the 3200x2000 world map, 1 unit ≈ 2 miles (artistic approximation, see docs/MAP_GRID.md)
//   zoom:  map zoom used when diving in
//   depth: 'deep' (strongly described, rich scene) | 'moderate' | 'sparse' (restrained, interpretive scene)
// Chinese names follow docs/GLOSSARY.md; `alt` also carries common alternative Chinese renderings (TV subtitles, fan wikis) for search.
export const KINDS = ['city', 'town', 'castle', 'ruin', 'sacred'];

const L = (id, kind, region, at, rank, names, alt, summary, depth = 'moderate', extra = {}) => ({ id, kind, region, at, rank, names, alt, summary, depth, zoom: 6, explorable: true, ...extra });

export const LOCATIONS = [
  // ---------------------------------------------------------------- THE NORTH & BEYOND
  L('winterfell', 'castle', 'north', [372, 510], 5, { en: 'Winterfell', zh: '临冬城' }, ['Winterfell Castle', 'Winter town', 'Stark', '临冬', '冬镇', '史塔克'],
    { en: 'Ancient seat of House Stark: concentric granite walls with a moat between them, a steaming godswood and a sprawling winter town.', zh: '史塔克家族的古老居城：内外两道花岗岩城墙，墙间隔着护城河；神木林中温泉氤氲，城外是绵延的冬镇。' }, 'deep'),
  L('castle-black', 'castle', 'north', [385, 308], 5, { en: 'Castle Black & the Wall', zh: '黑城堡与长城' }, ['Castle Black', 'The Wall', 'Night\'s Watch', '绝境长城', '黑城堡', '长城', '守夜人', '守夜人军团'],
    { en: 'Headquarters of the Night\'s Watch beneath a seven-hundred-foot wall of ice that guards the realm from what lies beyond.', zh: '守夜人军团的总部，坐落在七百尺高的冰墙脚下。长城守护着王国，抵御墙外之物。' }, 'deep'),
  L('white-harbor', 'city', 'north', [450, 594], 4, { en: 'White Harbor', zh: '白港' }, ['Whitetown', 'Manderly', '白港城', '曼德勒'],
    { en: 'The only true city of the North: a walled, cosmopolitan port at the mouth of the White Knife, home to House Manderly.', zh: '北境唯一真正的城市：白刃河口一座筑有城墙的港口，商旅往来、五方杂处，是曼德勒家族的领地。' }, 'moderate'),
  L('moat-cailin', 'ruin', 'north', [360, 664], 3, { en: 'Moat Cailin', zh: '卡林湾' }, ['Moat Cailin ruins', 'The Neck', '凯林堡', '卡林堡', '莫特凯林', '颈泽'],
    { en: 'Crumbling towers rising from the Neck\'s swamps, the old gate that guards the North from the south.', zh: '颈泽沼地中残存的几座塔楼，自古扼守北境的南大门。' }, 'moderate'),
  L('hardhome', 'ruin', 'beyond-wall', [528, 242], 2, { en: 'Hardhome', zh: '艰难屯' }, ['Hard Home', '哈德霍姆', '硬家'],
    { en: 'A long-abandoned settlement on the cold eastern coast beyond the Wall, ill-omened yet still sought by free folk as a refuge.', zh: '长城以北寒冷东海岸上荒弃已久的聚落，虽被视为不祥之地，仍有自由民来此寻求庇护。' }, 'sparse'),
  // ---------------------------------------------------------------- RIVERLANDS / VALE / IRON ISLANDS
  L('the-twins', 'castle', 'riverlands', [352, 758], 3, { en: 'The Twins', zh: '孪河城' }, ['Twins', 'The Crossing', 'Frey', '佛雷', '弗雷', '双子城', '孪生城'],
    { en: 'Paired fortresses joined by a bridge over the Green Fork, whose Frey lords charge a toll on the crossing.', zh: '绿叉河两岸的一对城堡，以桥相连；佛雷家族据此把守渡口，向过往行人收取过路费。' }, 'moderate'),
  L('riverrun', 'castle', 'riverlands', [322, 846], 4, { en: 'Riverrun', zh: '奔流城' }, ['Riverrun Castle', 'Tully', '徒利', '图利'],
    { en: 'The Tully seat on a triangle of land where the Tumblestone meets the Red Fork, ringed by water on two sides.', zh: '徒利家族的居城，位于腾石河与红叉河交汇处的三角地上，两面环水。' }, 'moderate'),
  L('harrenhal', 'castle', 'riverlands', [402, 866], 4, { en: 'Harrenhal', zh: '赫伦堡' }, ['Harrenhall', '赫伦城'],
    { en: 'The largest castle in Westeros, a ruin of fire-split towers on the shore of the God\'s Eye.', zh: '维斯特洛最大的城堡，坐落于神眼湖畔；高塔曾被龙焰熔裂，如今半成废墟。' }, 'deep'),
  L('isle-of-faces', 'sacred', 'riverlands', [400, 884], 2, { en: 'Isle of Faces', zh: '千面屿' }, ['Isle of Faces godswood', 'Green Men', '面孔岛', '千面岛', '绿人', '神眼湖'],
    { en: 'A sacred island of carved weirwoods in the God\'s Eye, said to be kept still by the green men of the old faith.', zh: '神眼湖中的圣岛，遍布刻有人脸的鱼梁木；相传仍有信奉旧神的绿人守护。' }, 'moderate'),
  L('the-eyrie', 'castle', 'vale', [480, 788], 5, { en: 'The Eyrie', zh: '鹰巢城' }, ['Eyrie', 'Gates of the Moon', 'Vale of Arryn', 'Arryn', '月门堡', '艾林谷', '艾林'],
    { en: 'A small white castle perched high on the Giant\'s Lance, reached by a mule path from the Gates of the Moon.', zh: '高踞巨人之枪山峰上的白色小城堡，须从月门堡沿骡道攀登而上。' }, 'deep'),
  L('gulltown', 'city', 'vale', [548, 814], 4, { en: 'Gulltown', zh: '海鸥镇' }, ['海鸥城'],
    { en: 'The Vale\'s chief port, a busy harbour on the Bite facing the Narrow Sea.', zh: '谷地的首要港口，濒临咬人湾，面向狭海，舟船往来频繁。' }, 'moderate'),
  L('pyke', 'castle', 'iron-islands', [192, 806], 4, { en: 'Pyke', zh: '派克城' }, ['Pyke Castle', 'Iron Islands', 'Greyjoy', '葛雷乔伊', '格雷乔伊', '派克岛'],
    { en: 'Greyjoy fortress of towers on sea-stacks, joined by swaying bridges above the crashing waves.', zh: '葛雷乔伊家族的要塞，座座塔楼立于海中石柱之上，以摇晃的吊桥相连，脚下惊涛拍岸。' }, 'moderate'),
  // ---------------------------------------------------------------- WESTERLANDS / CROWNLANDS / REACH / STORMLANDS / DORNE
  L('casterly-rock', 'castle', 'westerlands', [248, 858], 4, { en: 'Casterly Rock', zh: '凯岩城' }, ['Lannister stronghold', 'Lannister', '兰尼斯特'],
    { en: 'A fortress carved in a colossal rock above the sea, riddled with mines, above the port of Lannisport.', zh: '凿建于临海巨岩之中的要塞，岩体内矿道纵横，山脚便是兰尼斯港。' }, 'moderate'),
  L('lannisport', 'city', 'westerlands', [252, 878], 4, { en: 'Lannisport', zh: '兰尼斯港' }, ['Lannisport harbour', '兰尼港'],
    { en: 'A rich, orderly port city at the foot of Casterly Rock, one of the great harbours of the west.', zh: '凯岩城脚下富庶整洁的港口城市，西海岸的大港之一。' }, 'moderate'),
  L('kings-landing', 'city', 'crownlands', [468, 928], 5, { en: 'King\'s Landing', zh: '君临' }, ['Kings Landing', 'Red Keep', 'Great Sept of Baelor', '君临城', '红堡', '贝勒大圣堂', '贝勒圣堂'],
    { en: 'Capital of the Seven Kingdoms, sprawling across three hills above Blackwater Bay beneath the Red Keep.', zh: '七大王国的首都，依三座山丘铺展于黑水湾畔，红堡雄踞其上。' }, 'deep'),
  L('dragonstone', 'castle', 'crownlands', [600, 926], 4, { en: 'Dragonstone', zh: '龙石岛' }, ['Dragonstone Island', 'Targaryen', '坦格利安', '龙石堡'],
    { en: 'A smoking volcanic island fortress at the mouth of Blackwater Bay, first Targaryen foothold in Westeros.', zh: '黑水湾口一座烟气升腾的火山岛要塞，坦格利安家族在维斯特洛的第一个立足点。' }, 'moderate'),
  L('storms-end', 'castle', 'stormlands', [526, 1026], 4, { en: 'Storm\'s End', zh: '风息堡' }, ['Stormsend', 'Baratheon', '拜拉席恩'],
    { en: 'A single colossal drum tower on a seaward cliff, said to have been raised to defy the storms.', zh: '海崖上一座巨大的圆形塔楼，相传专为抵御风暴而建。' }, 'moderate'),
  L('highgarden', 'castle', 'reach', [330, 1062], 4, { en: 'Highgarden', zh: '高庭' }, ['Highgarden Castle', 'Tyrell', '提利尔'],
    { en: 'The Tyrell seat amid gardens and orchards, the green heart of the richest region in the realm.', zh: '提利尔家族的居城，花园与果园环绕，是王国最富庶地区的青翠心脏。' }, 'moderate'),
  L('oldtown', 'city', 'reach', [222, 1130], 5, { en: 'Oldtown', zh: '旧镇' }, ['Hightower', 'Citadel', 'Starry Sept', '参天塔', '高塔', '海塔尔', '学城', '星辰圣堂'],
    { en: 'The oldest and second-largest city in the realm, home of the Citadel, the Starry Sept and the Hightower.', zh: '王国最古老、规模第二的城市，学城、星辰圣堂与参天塔皆在此地。' }, 'deep'),
  L('sunspear', 'castle', 'dorne', [614, 1280], 4, { en: 'Sunspear', zh: '阳戟城' }, ['Shadow City', 'Water Gardens', 'Martell', '日矛城', '影子城', '流水花园', '水之花园', '马泰尔'],
    { en: 'Seat of House Martell on the Dornish coast, with the sprawling shadow city at its gates; the Water Gardens lie a few miles off.', zh: '马泰尔家族的居城，坐落于多恩海岸，城门外是杂乱铺开的影子城；流水花园在数里之外。' }, 'moderate'),
  // ---------------------------------------------------------------- FREE CITIES
  L('braavos', 'city', 'free-cities', [752, 636], 5, { en: 'Braavos', zh: '布拉佛斯' }, ['Titan of Braavos', 'House of Black and White', 'Iron Bank', '泰坦', '布拉佛斯泰坦', '黑白之院', '铁金库', '布拉沃斯'],
    { en: 'The Secret City on a hundred islands: canals instead of streets, a titan guarding the harbour mouth, and the Iron Bank.', zh: '建于上百座岛屿之上的“秘密之城”：以运河代街道，泰坦巨像守卫港口入口，铁金库坐镇其中。' }, 'deep'),
  L('pentos', 'city', 'free-cities', [806, 848], 4, { en: 'Pentos', zh: '潘托斯' }, ['Pentoshi', '潘托斯人'],
    { en: 'A wealthy trading city on a bright bay, ruled in truth by its magisters behind a Prince chosen from the old families.', zh: '濒临明亮海湾的富庶商城；名义上由出身古老家族的亲王统治，实权却握在总督们手中。' }, 'moderate'),
  L('lorath', 'city', 'free-cities', [962, 528], 2, { en: 'Lorath', zh: '洛拉斯' }, ['Lorathi'],
    { en: 'A remote northern free city built on rocky, fog-bound islands.', zh: '偏处北方的自由贸易城邦，坐落于雾气笼罩的岩岛之上。' }, 'sparse'),
  L('norvos', 'city', 'free-cities', [934, 746], 3, { en: 'Norvos', zh: '诺佛斯' }, ['Norvoshi'],
    { en: 'An inland free city on a high bluff above the Noyne, governed by bearded priests.', zh: '坐落于诺伊河畔高崖上的内陆自由贸易城邦，由蓄须的祭司治理。' }, 'sparse'),
  L('qohor', 'city', 'free-cities', [1078, 774], 3, { en: 'Qohor', zh: '科霍尔' }, ['Forest of Qohor', 'Black Goat', '科霍尔森林', '黑山羊'],
    { en: 'A grim inland city of master smiths and worshippers of the Black Goat, hemmed by the great Forest of Qohor.', zh: '阴郁的内陆城邦，以技艺高超的铁匠和对黑山羊的崇拜闻名，四周是广袤的科霍尔森林。' }, 'sparse'),
  L('myr', 'city', 'free-cities', [894, 1002], 4, { en: 'Myr', zh: '密尔' }, ['Myrish', '密尔人'],
    { en: 'A southern free city of lens-makers, lace and carpet weavers and sellswords, on a sheltered bay.', zh: '南方的自由贸易城邦，濒临避风海湾，以镜片、蕾丝、地毯和佣兵闻名。' }, 'moderate'),
  L('lys', 'city', 'free-cities', [814, 1256], 4, { en: 'Lys', zh: '里斯' }, ['Lysene', '里斯人'],
    { en: 'A warm, pleasure-loving island city of perfumes, pillow houses and fair, silver-haired people of Valyrian blood.', zh: '温暖而纵情享乐的岛城，以香水与青楼闻名，居民多有瓦雷利亚血统，金发银发、容貌秀美。' }, 'moderate'),
  L('tyrosh', 'city', 'free-cities', [776, 1100], 4, { en: 'Tyrosh', zh: '泰洛西' }, ['Tyroshi', '泰洛西人'],
    { en: 'A gaudy island city by the Stepstones, rich from its dyes, its pear brandy and its sellswords.', zh: '石阶列岛旁一座浮华艳丽的岛城，靠染料、梨子白兰地和佣兵致富。' }, 'moderate'),
  L('volantis', 'city', 'free-cities', [1058, 1206], 5, { en: 'Volantis', zh: '瓦兰提斯' }, ['Black Walls', 'Long Bridge', 'Rhoyne', '黑墙', '长桥', '洛恩河'],
    { en: 'The oldest and largest of the Free Cities at the Rhoyne\'s mouth: the Black Walls, the Long Bridge, and a rigidly tiered social order.', zh: '自由贸易城邦中最古老、最大的一座，坐落于洛恩河口：黑墙、长桥，以及森严的等级社会。' }, 'deep'),
  L('selhorys', 'town', 'free-cities', [1030, 1058], 2, { en: 'Selhorys', zh: '塞尔霍利斯' }, ['Selhoru', '塞霍里斯'],
    { en: 'A Volantene river town on the Rhoyne, a stop for trade heading upriver toward the Free Cities.', zh: '洛恩河畔隶属瓦兰提斯的河港城镇，是沿河上行贸易的中转站。' }, 'sparse'),
  // ---------------------------------------------------------------- ESSOS EAST
  L('vaes-dothrak', 'city', 'dothraki-sea', [1560, 764], 4, { en: 'Vaes Dothrak', zh: '维斯·多斯拉克' }, ['Dothraki holy city', '维斯多斯拉克', '圣城'],
    { en: 'The only city of the Dothraki, a sacred place where no blade may be drawn and no blood shed.', zh: '多斯拉克人唯一的城市，神圣之地，城中不得拔刀，不得流血。' }, 'moderate'),
  L('astapor', 'city', 'slavers-bay', [1338, 1318], 4, { en: 'Astapor', zh: '阿斯塔波' }, ['Red City', 'Unsullied', 'Good Masters', '无垢者', '红城', '善主'],
    { en: 'The southernmost Slaver city, red-brick and sun-baked, famed for training the eunuch soldiers called the Unsullied.', zh: '奴隶湾最南端的城市，红砖城垣，烈日炙烤，以训练名为“无垢者”的阉人士兵著称。' }, 'deep'),
  L('yunkai', 'city', 'slavers-bay', [1424, 1226], 4, { en: 'Yunkai', zh: '渊凯' }, ['Yellow City', 'Wise Masters', '黄城', '智者'],
    { en: 'The Yellow City, walled in yellow brick and home to the Wise Masters, who train bed-slaves.', zh: '“黄城”，黄砖城墙环绕，由智者们统治，以调教床奴闻名。' }, 'deep'),
  L('meereen', 'city', 'slavers-bay', [1350, 1142], 5, { en: 'Meereen', zh: '弥林' }, ['Great Pyramid', 'Harpy', 'Skahazadhan', '大金字塔', '鹰身女妖', '米林'],
    { en: 'The greatest Slaver city: a many-coloured brick metropolis of stepped pyramids, rising above the Skahazadhan.', zh: '奴隶湾最大的城市：五色砖砌的阶梯金字塔林立，雄踞斯卡哈扎丹河口。' }, 'deep'),
  L('qarth', 'city', 'eastern-essos', [1914, 1514], 5, { en: 'Qarth', zh: '魁尔斯' }, ['Pureborn', 'Tower of the Pureborn', 'Hall of a Thousand Thrones', '魁尔斯城', '纯血者', '千座之厅', '夸斯'],
    { en: 'Self-styled greatest city that ever was, guarding the straits to the Jade Sea: triple walls carved with scenes, and a skyline of opulent towers.', zh: '自诩“史上最伟大的城市”，扼守通往玉海的海峡：三重城墙饰满浮雕，塔楼林立，极尽奢华。' }, 'deep'),
  L('valyria', 'ruin', 'valyria', [1130, 1424], 4, { en: 'Valyria', zh: '瓦雷利亚' }, ['Freehold of Valyria', 'The Doom', 'Smoking Sea', '末日浩劫', '自由堡垒', '瓦雷利亚自由堡垒', '烟海'],
    { en: 'The legendary dragonlord capital, destroyed in the Doom: today a smoking, haunted ruin among fire-split hills.', zh: '传说中的龙王之都，毁于末日浩劫，如今只剩火裂群山间烟气弥漫、阴森可怖的废墟。' }, 'sparse'),
  L('asshai', 'city', 'far-east', [2796, 1570], 4, { en: 'Asshai-by-the-Shadow', zh: '阴影之地亚夏' }, ['Asshai', 'Shadow Lands', '亚夏', '阴影之地', '暗影之地'],
    { en: 'A black-stoned city at the edge of the known world, home to shadowbinders and warlocks, barely glimpsed in the books.', zh: '已知世界尽头的黑石之城，缚影士与术士聚居于此，书中着墨寥寥。' }, 'sparse'),
  L('yin', 'city', 'far-east', [2480, 1180], 2, { en: 'Yin (Yi Ti)', zh: '殷城（夷地）' }, ['Yi Ti', 'Yin', 'Imperial Yi Ti', '夷地', '殷'],
    { en: 'The imperial capital of far Yi Ti in rumour and report, a city the novels describe only second-hand.', zh: '遥远夷地的帝都，书中仅见于传闻，细节寥寥。' }, 'sparse'),
  L('port-of-ibben', 'town', 'shivering-sea', [1694, 332], 2, { en: 'Port of Ibben', zh: '伊班港' }, ['Ibben', 'Ibbenese', '伊班', '伊班人'],
    { en: 'A hardy whaling and trading harbour on a northern island, home of burly, hairy Ibbenese sailors.', zh: '北方岛屿上的捕鲸与贸易港口，粗壮多毛的伊班水手以此为家。' }, 'sparse'),
  L('kayakayanaya', 'town', 'summer-isles', [440, 1508], 2, { en: 'Tall Trees Town', zh: '高树镇' }, ['Summer Isles', '盛夏群岛', '夏日群岛'],
    { en: 'A port town of the Summer Isles, set among enormous trees and visited by traders and sailors.', zh: '盛夏群岛的港口城镇，坐落在参天巨树之间，商人与水手往来于此。' }, 'sparse'),
];

export const locationById = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));
