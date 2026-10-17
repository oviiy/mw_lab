// Hand-authored, ORIGINAL map geometry (no tracing of published maps). See docs/MAP_GRID.md for the coordinate system.
//   World canvas: 3200 x 2000 units, x → east, y → south.  Scale: 1 unit ≈ 2 miles (≈ 3.2 km)  — an approximation:
//   MOUNTAINS: w = half-width of the relief band, k = optional height multiplier (single great peaks).
//   the Wall (~300 mi) is ~155 units long; Wall → southern coast of Dorne ≈ 1030 units (~2,100 mi).
// Control points were authored from the books' descriptions and relative distances; polygons are smoothed (Catmull-Rom) and
// roughened with seeded noise at draw time, so a control point is "the coast within a few units".
// Every named feature has `id` + `names:{en,zh}`. Chinese follows docs/GLOSSARY.md; `zhNote:'◇'` marks a project rendering.

/** Deterministic irregular island outline (used for the many small islands). rot in radians. */
function blob(cx, cy, rx, ry, seed = 1, n = 11, rot = 0) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, h = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453, j = 0.8 + 0.4 * (h - Math.floor(h));
    const x = Math.cos(a) * rx * j, y = Math.sin(a) * ry * j;
    out.push([Math.round((cx + x * Math.cos(rot) - y * Math.sin(rot)) * 10) / 10, Math.round((cy + x * Math.sin(rot) + y * Math.cos(rot)) * 10) / 10]);
  }
  return out;
}

/* =====================================================================================================================
 * LAND — continents and islands. Keys are feature ids (see ISLANDS for names). A value is one polygon or an array of them.
 * ===================================================================================================================== */
export const LAND = {
  westeros: [
    // --- west coast beyond the Wall (Frozen Shore) down to the Bay of Ice
    [150,-420],[148,-200],[160,-80],[150,0],[165,50],[158,95],[176,130],[198,160],[190,190],[172,212],[188,232],[214,236],[240,248],[262,262],[282,280],[298,296],
    // --- the North, west coast: Westwatch → Sea Dragon Point → Blazewater Bay → Stony Shore → Rills → Cape Kraken
    [302,318],[292,338],[278,356],[262,372],[250,392],[244,414],[236,432],[220,446],[196,452],[172,454],[150,457],[134,465],[140,476],[164,479],[190,481],[212,488],
    [226,500],[240,512],[248,528],[242,546],[232,560],[226,578],[230,598],[236,616],[240,634],[246,648],[238,662],[222,678],[206,693],[198,704],[210,709],[232,701],[254,694],[272,700],
    // --- Ironman's Bay: the Neck's west shore, Seagard, the Westerlands coast (Fair Isle offshore), Lannisport
    [284,712],[292,730],[298,750],[296,768],[290,784],[278,798],[264,810],[250,822],[242,838],[238,856],[244,872],[238,888],[230,904],[224,922],[216,942],[208,962],[205,980],
    // --- the Reach: Shield Islands / Mander mouth, Whispering Sound & Oldtown, Redwyne Straits
    [210,994],[222,1001],[236,1008],[224,1017],[213,1030],[206,1050],[200,1072],[196,1092],[186,1104],[198,1114],[210,1124],[218,1134],[210,1146],[196,1154],[182,1162],[184,1176],[200,1186],
    // --- south-west coast of the Reach and Dorne: Three Towers, Starfall (Torrentine), Dorne's south coast to Sunspear
    [222,1198],[246,1208],[266,1218],[284,1229],[302,1240],[324,1253],[350,1265],[378,1277],[406,1289],[434,1300],[462,1310],[490,1318],[520,1324],[548,1324],[572,1317],[590,1306],[604,1294],[616,1286],[623,1276],[614,1267],[604,1261],
    // --- the Broken Arm (towards the Stepstones) and the Sea of Dorne's shores
    [608,1250],[620,1240],[640,1232],[660,1226],[678,1218],[690,1209],[682,1200],[662,1198],[640,1196],[618,1192],[596,1188],[572,1184],[548,1180],[526,1176],[508,1170],
    [504,1158],[518,1148],[540,1140],[566,1134],[590,1126],[610,1116],[626,1102],[633,1088],
    // --- Cape Wrath's north shore, Shipbreaker Bay (Storm's End), Massey's Hook, Blackwater Bay (King's Landing), Crackclaw Point
    [626,1074],[612,1062],[592,1051],[570,1041],[550,1036],[532,1030],[532,1012],[548,1000],[568,992],[590,986],[588,974],[570,966],[548,960],[526,954],[504,948],[484,942],[468,935],
    [480,924],[500,918],[522,914],[544,910],[566,904],[584,894],[580,880],[562,872],[540,868],[518,866],
    // --- Bay of Crabs (Maidenpool, Trident mouth), the Vale's coast (Gulltown), the Fingers
    [498,862],[482,856],[474,846],[482,836],[496,829],[516,826],[538,822],[560,820],[582,813],[600,802],[610,786],[612,770],[618,764],[636,758],[656,752],[640,744],[622,742],[628,734],[648,724],[662,716],[644,712],[626,716],[620,706],[634,694],[648,682],[632,680],[614,690],[598,698],[588,701],
    // --- the Bite: the Vale's north shore, the Neck's east shore, White Harbor, the Sheepshead coast, Widow's Watch
    [568,706],[546,712],[522,718],[498,724],[474,730],[450,736],[428,742],[412,742],[404,730],[406,712],[410,694],[414,676],[420,660],[428,644],[436,628],[444,614],[452,604],
    [462,598],[480,592],[500,586],[522,580],[544,574],[564,566],[578,554],[586,540],
    // --- the North's east coast: Karhold, the Grey Cliffs, Bay of Seals, Eastwatch; then the coast beyond the Wall (Hardhome)
    [584,522],[590,504],[600,486],[606,466],[600,446],[588,428],[576,410],[566,392],[552,376],[538,364],[520,350],[500,334],[482,318],[466,304],
    [474,292],[492,282],[510,268],[526,250],[540,232],[552,214],[560,196],[566,176],[578,150],[590,120],[596,90],[592,50],[600,10],[614,-60],[620,-200],[624,-420],
  ],
  essos: [
    // --- west coast, south → north: Disputed Lands cape, the Myrish gulf (Myr), Pentos, the Braavosi coastland, Braavos
    [815,1172],[822,1150],[834,1130],[846,1108],[858,1086],[870,1064],[880,1042],[886,1024],[892,1010],[882,998],[866,990],[850,978],[834,964],[818,950],[802,936],[790,920],[782,902],[778,884],[774,872],
    [786,866],[796,856],[794,844],[782,838],[768,832],[766,816],[758,800],[752,784],[756,766],[748,748],[740,732],[744,714],[738,698],[744,682],[752,668],[744,654],[736,644],
    // --- north coast: the Axe, Bay of Lorath, the Sarnori shore, the Shivering Sea coast running north-east
    [744,624],[752,612],[768,602],[788,596],[808,592],[828,584],[846,572],[858,556],[866,536],[874,514],[884,498],[896,506],[900,526],[906,546],[918,562],[936,572],[956,578],[978,576],[1000,570],
    [1024,562],[1050,552],[1080,544],[1110,536],[1140,526],[1170,516],[1200,506],[1232,496],[1264,488],[1296,480],[1330,474],[1366,470],[1402,464],[1440,460],[1478,454],[1516,450],[1556,446],[1596,440],
    [1636,436],[1676,432],[1716,430],[1756,424],[1796,420],[1836,412],[1876,404],[1916,396],[1956,384],[1990,364],[2010,374],[2036,360],[2076,350],[2116,336],[2156,326],[2196,312],[2236,300],[2276,286],[2316,268],[2356,248],[2396,224],[2440,214],[2500,206],[2560,196],[2620,184],[2680,170],[2740,156],[2800,148],[2860,136],[2920,128],[2980,116],[3040,104],[3100,96],[3160,90],[3240,84],[3700,80],
    // --- far east (off the canvas edge; the Shivering Sea runs on along the north) and the south coast east → west: beyond Asshai, the Shadow Lands, Yi Ti's Jade Sea coast
    [3700,1640],[3560,1650],[3420,1640],[3300,1630],[3200,1636],[3120,1640],[3060,1630],[3000,1614],[2950,1600],[2900,1592],[2850,1590],[2814,1584],[2790,1574],[2766,1562],[2742,1544],[2720,1518],
    [2700,1490],[2680,1462],[2650,1440],[2610,1420],[2560,1408],[2510,1400],[2460,1396],[2410,1396],[2360,1400],[2310,1404],[2260,1406],[2210,1410],[2160,1418],[2110,1430],[2060,1446],[2020,1462],[1990,1478],
    // --- Qarth's cape between the Jade Sea and the Summer Sea
    [1964,1494],[1944,1512],[1928,1528],[1912,1530],[1898,1516],[1882,1500],[1856,1490],
    // --- the Summer Sea coast west to Ghis, then Slaver's Bay (Astapor, Yunkai, Meereen) and the Gulf of Grief
    [1810,1484],[1760,1480],[1710,1478],[1660,1476],[1610,1474],[1560,1470],[1510,1466],[1460,1462],[1410,1458],[1366,1458],[1330,1454],[1302,1446],[1286,1428],[1280,1404],[1288,1380],[1300,1358],[1312,1336],[1326,1320],
    [1350,1310],[1372,1300],[1392,1284],[1404,1262],[1410,1238],[1408,1214],[1398,1192],[1384,1172],[1366,1158],[1346,1150],[1326,1150],[1304,1156],[1282,1166],[1262,1180],[1246,1198],[1232,1218],
    // --- the Valyrian peninsula (east shore on the Gulf of Grief, broken southern end on the Smoking Sea, west shore to Volantis)
    [1218,1240],[1210,1262],[1214,1286],[1204,1306],[1210,1330],[1198,1352],[1182,1366],[1168,1358],[1156,1374],[1138,1366],[1120,1380],[1102,1366],[1084,1374],[1068,1360],[1058,1340],[1046,1322],[1050,1300],[1040,1282],[1046,1262],[1052,1240],[1056,1224],
    // --- the Orange Shore and the Lysene coast back to the Disputed Lands cape
    [1040,1214],[1015,1218],[990,1220],[962,1222],[934,1224],[906,1226],[878,1226],[852,1222],[834,1208],[822,1190],
  ],
  sothoryos: [
    [810,2400],[820,1900],[838,1860],[866,1832],[900,1814],[940,1800],[972,1780],[998,1754],[1012,1730],[1030,1748],[1056,1770],[1090,1786],[1130,1796],[1170,1790],[1210,1800],[1252,1812],[1296,1806],
    [1340,1794],[1386,1782],[1430,1790],[1474,1804],[1520,1812],[1566,1806],[1612,1796],[1660,1788],[1708,1796],[1756,1810],[1804,1822],[1850,1836],[1894,1854],[1934,1878],[1966,1910],[1990,1950],[2006,2010],[2020,2400],
  ],
  // --- Westeros, islands
  'bear-island': blob(205, 390, 15, 12, 3, 10, 0.3),
  skagos: [[580,312],[596,306],[612,318],[618,338],[614,360],[604,378],[588,384],[574,374],[568,352],[570,330]],
  skane: blob(628, 296, 7, 5, 4, 8),
  orkmont: blob(186, 738, 15, 9, 5, 10, -0.3),
  blacktyde: blob(222, 734, 9, 7, 6, 9),
  'great-wyk': blob(162, 768, 22, 16, 7, 12, 0.2),
  'old-wyk': blob(200, 762, 11, 9, 8, 10),
  harlaw: blob(232, 790, 13, 10, 9, 10, 0.4),
  pyke: blob(192, 806, 11, 8, 10, 10),
  saltcliffe: blob(156, 808, 10, 7, 11, 9),
  'fair-isle': blob(214, 842, 10, 7, 12, 9, 0.5),
  'three-sisters': [blob(548, 636, 9, 6, 13, 9, 0.6), blob(568, 652, 11, 6, 14, 9, 0.5), blob(580, 628, 6, 5, 15, 8)],
  'claw-isle': blob(602, 878, 8, 6, 16, 9),
  dragonstone: [[592,914],[604,912],[612,920],[612,932],[604,940],[592,938],[586,928]],
  driftmark: blob(570, 944, 13, 6, 18, 10, -0.2),
  tarth: blob(658, 1054, 18, 8, 19, 11, -0.25),
  estermont: blob(646, 1126, 9, 7, 20, 9),
  arbor: [[124,1176],[138,1166],[156,1168],[170,1178],[168,1194],[156,1204],[138,1206],[124,1196]],
  'shield-islands': [blob(186, 984, 6, 4, 21, 8), blob(188, 1002, 7, 5, 22, 8), blob(190, 1022, 7, 5, 23, 8), blob(186, 1042, 6, 4, 24, 8)],
  stepstones: [blob(704, 1208, 6, 4, 25, 8), blob(720, 1199, 7, 5, 26, 8), blob(752, 1183, 6, 4, 28, 8), blob(770, 1176, 7, 4, 29, 8), blob(790, 1174, 5, 4, 30, 8), blob(714, 1222, 4, 3, 31, 7), blob(748, 1166, 5, 3, 32, 7), blob(766, 1196, 5, 3, 33, 7)],
  bloodstone: blob(737, 1190, 9, 6, 27, 9, 0.3),
  // --- Essos & the south
  tyrosh: blob(776, 1100, 15, 11, 34, 11, 0.4),
  lys: blob(814, 1256, 16, 12, 35, 11, -0.3),
  lorath: [blob(962, 528, 20, 12, 36, 11, 0.2), blob(996, 518, 9, 6, 37, 9), blob(932, 522, 7, 5, 38, 8)],
  ibben: [[1520,300],[1540,262],[1580,236],[1630,220],[1690,212],[1748,218],[1796,236],[1826,262],[1820,292],[1790,312],[1750,326],[1712,340],[1676,346],[1636,340],[1596,334],[1556,326]],
  'valyria': [[1090,1402],[1112,1392],[1140,1394],[1164,1408],[1172,1428],[1162,1448],[1138,1458],[1110,1454],[1092,1436]],
  'valyrian-isles': [blob(1060, 1410, 10, 7, 39, 9), blob(1190, 1460, 8, 6, 40, 8), blob(1076, 1458, 7, 5, 41, 8)],
  'isle-of-cedars': blob(1222, 1430, 14, 10, 42, 10, 0.3),
  'new-ghis': blob(1248, 1352, 11, 8, 43, 10),
  'isle-of-tears': blob(1150, 1562, 26, 15, 44, 12, -0.2),
  naath: blob(880, 1700, 22, 13, 45, 11, 0.2),
  'basilisk-isles': [blob(1000, 1650, 9, 6, 46, 9), blob(1034, 1664, 7, 5, 47, 8), blob(980, 1680, 6, 5, 48, 8), blob(1062, 1640, 8, 5, 49, 8), blob(1016, 1692, 6, 4, 50, 8)],
  jhala: blob(430, 1500, 28, 17, 51, 12, 0.3),
  walano: blob(522, 1560, 38, 22, 52, 13, -0.15),
  omboru: blob(612, 1528, 18, 11, 53, 11, 0.4),
  'summer-isles-minor': [blob(470, 1612, 8, 5, 54, 8), blob(588, 1600, 7, 5, 55, 8), blob(380, 1540, 6, 4, 56, 8), blob(660, 1570, 6, 4, 57, 8)],
  'great-moraq': blob(2310, 1590, 64, 26, 58, 14, -0.1),
  leng: [[2560,1700],[2600,1680],[2650,1676],[2700,1684],[2746,1702],[2780,1730],[2786,1764],[2760,1792],[2716,1804],[2664,1800],[2616,1786],[2578,1760],[2558,1730]],
};

/** Named land masses / islands (labels; `group` ties members of an archipelago). Centres are computed by landCentre(id). */
export const ISLANDS = [
  { id: 'westeros', names: { en: 'Westeros', zh: '维斯特洛' }, kind: 'continent' },
  { id: 'essos', names: { en: 'Essos', zh: '厄索斯' }, kind: 'continent' },
  { id: 'sothoryos', names: { en: 'Sothoryos', zh: '索斯罗斯' }, kind: 'continent' },
  { id: 'bear-island', names: { en: 'Bear Island', zh: '熊岛' } },
  { id: 'skagos', names: { en: 'Skagos', zh: '斯卡格斯岛' } },
  { id: 'skane', names: { en: 'Skane', zh: '斯坎恩岛' }, zhNote: '◇' },
  { id: 'orkmont', names: { en: 'Orkmont', zh: '奥克蒙岛' }, group: 'iron-islands' },
  { id: 'blacktyde', names: { en: 'Blacktyde', zh: '黑潮岛' }, group: 'iron-islands' },
  { id: 'great-wyk', names: { en: 'Great Wyk', zh: '大威克岛' }, group: 'iron-islands' },
  { id: 'old-wyk', names: { en: 'Old Wyk', zh: '老威克岛' }, group: 'iron-islands' },
  { id: 'harlaw', names: { en: 'Harlaw', zh: '哈尔洛岛' }, group: 'iron-islands' },
  { id: 'pyke', names: { en: 'Pyke', zh: '派克岛' }, group: 'iron-islands' },
  { id: 'saltcliffe', names: { en: 'Saltcliffe', zh: '盐崖岛' }, group: 'iron-islands' },
  { id: 'fair-isle', names: { en: 'Fair Isle', zh: '仙女岛' } },
  { id: 'three-sisters', names: { en: 'The Three Sisters', zh: '三姐妹群岛' }, parts: ['Sweetsister', 'Longsister', 'Littlesister'] },
  { id: 'claw-isle', names: { en: 'Claw Isle', zh: '爪岛' } },
  { id: 'dragonstone', names: { en: 'Dragonstone', zh: '龙石岛' } },
  { id: 'driftmark', names: { en: 'Driftmark', zh: '潮头岛' } },
  { id: 'tarth', names: { en: 'Tarth', zh: '塔斯岛' } },
  { id: 'estermont', names: { en: 'Estermont', zh: '伊斯蒙岛' }, zhNote: '◇' },
  { id: 'arbor', names: { en: 'The Arbor', zh: '青亭岛' } },
  { id: 'shield-islands', names: { en: 'The Shield Islands', zh: '盾牌列岛' }, parts: ['Grey Shield', 'Greenshield', 'Oakenshield', 'Southshield'] },
  { id: 'stepstones', names: { en: 'The Stepstones', zh: '石阶列岛' } },
  { id: 'bloodstone', names: { en: 'Bloodstone', zh: '血石岛' }, zhNote: '◇', group: 'stepstones' },
  { id: 'tyrosh', names: { en: 'Tyrosh', zh: '泰洛西' } },
  { id: 'lys', names: { en: 'Lys', zh: '里斯' } },
  { id: 'lorath', names: { en: 'Isles of Lorath', zh: '洛拉斯群岛' }, zhNote: '◇' },
  { id: 'ibben', names: { en: 'Ibben', zh: '伊班' } },
  { id: 'valyria', names: { en: 'Valyria', zh: '瓦雷利亚' } },
  { id: 'valyrian-isles', names: { en: 'Broken isles of Valyria', zh: '瓦雷利亚碎岛' }, zhNote: '◇' },
  { id: 'isle-of-cedars', names: { en: 'Isle of Cedars', zh: '雪松岛' } },
  { id: 'new-ghis', names: { en: 'New Ghis', zh: '新吉斯' } },
  { id: 'isle-of-tears', names: { en: 'Isle of Tears', zh: '泪之岛' }, zhNote: '◇' },
  { id: 'naath', names: { en: 'Naath', zh: '纳斯' } },
  { id: 'basilisk-isles', names: { en: 'Basilisk Isles', zh: '蛇蜥群岛' } },
  { id: 'jhala', names: { en: 'Jhala', zh: '贾拉岛' }, zhNote: '◇', group: 'summer-isles' },
  { id: 'walano', names: { en: 'Walano', zh: '瓦拉诺岛' }, zhNote: '◇', group: 'summer-isles' },
  { id: 'omboru', names: { en: 'Omboru', zh: '欧姆波鲁岛' }, zhNote: '◇', group: 'summer-isles' },
  { id: 'summer-isles-minor', names: { en: 'lesser Summer Isles', zh: '盛夏群岛小岛' }, zhNote: '◇', group: 'summer-isles', label: false },
  { id: 'great-moraq', names: { en: 'Great Moraq', zh: '大莫拉克岛' }, zhNote: '◇' },
  { id: 'leng', names: { en: 'Leng', zh: '冷岛' }, zhNote: '◇' },
];
/** Centroid (vertex mean of the largest part) of a LAND entry — handy for labels/anchors. */
export function landCentre(id) {
  const v = LAND[id]; if (!v) return null; const list = Array.isArray(v[0][0]) ? v : [v];
  const p = list.reduce((a, b) => (b.length > a.length ? b : a)); let x = 0, y = 0; for (const q of p) { x += q[0]; y += q[1]; } return [Math.round(x / p.length), Math.round(y / p.length)];
}

/* =====================================================================================================================
 * MOUNTAINS — ranges as ridge polylines (drive relief + mountain glyphs). w = half-width of the relief band in units.
 * ===================================================================================================================== */
export const MOUNTAINS = [
  // Westeros
  { id: 'frostfangs', names: { en: 'The Frostfangs', zh: '霜雪之牙' }, at: [250, 96], pts: [[196,10],[226,52],[256,96],[284,138],[306,176],[322,214]], w: 26 },
  { id: 'land-of-always-winter', names: { en: 'Land of Always Winter', zh: '永冬之地' }, pts: [[300,-40],[380,-10],[470,-20],[540,0]], w: 24 },
  { id: 'northern-mountains', names: { en: 'Northern mountains', zh: '北境群山' }, zhNote: '◇', pts: [[300,362],[318,392],[330,420],[338,446]], w: 16 },
  { id: 'skagos-heights', names: { en: 'Skagos heights', zh: '斯卡格斯高地' }, zhNote: '◇', pts: [[588,326],[596,356]], w: 9, label: false },
  { id: 'sheepshead-hills', names: { en: 'Sheepshead Hills', zh: '羊头丘陵' }, zhNote: '◇', pts: [[520,552],[546,548]], w: 8 },
  { id: 'mountains-of-the-moon', names: { en: 'Mountains of the Moon', zh: '明月山脉' }, at: [500, 770], pts: [[440,752],[452,778],[458,804],[480,826],[512,830],[528,808],[516,770],[540,748],[580,732]], w: 18 },
  { id: 'giants-lance', names: { en: 'Giant\'s Lance', zh: '巨人之枪' }, pts: [[476,780],[484,792]], w: 10, k: 1.6, label: false },
  { id: 'westerlands-hills', names: { en: 'Hills of the Westerlands', zh: '西境丘陵' }, zhNote: '◇', pts: [[268,812],[282,846],[290,884],[296,922],[290,956]], w: 14 },
  { id: 'dornish-marches', names: { en: 'Dornish Marches', zh: '多恩边疆地' }, pts: [[360,1140],[420,1132],[470,1126]], w: 8, label: false },
  { id: 'red-mountains', names: { en: 'The Red Mountains', zh: '赤红山脉' }, pts: [[300,1180],[340,1170],[380,1166],[420,1166],[460,1162],[496,1160]], w: 18 },
  { id: 'red-mountains-south', names: { en: 'The Red Mountains', zh: '赤红山脉' }, pts: [[340,1180],[352,1212],[360,1244]], w: 11, label: false },
  { id: 'dragonmont', names: { en: 'Dragonmont', zh: '龙山' }, pts: [[598,920],[602,928]], w: 6, k: 1.4, label: false },
  // Essos
  { id: 'hills-of-norvos', names: { en: 'Hills of Norvos', zh: '诺佛斯丘陵' }, zhNote: '◇', pts: [[900,700],[940,690],[980,700]], w: 14 },
  { id: 'velvet-hills', names: { en: 'Velvet Hills', zh: '天鹅绒丘陵' }, zhNote: '◇', pts: [[900,880],[920,910],[936,946]], w: 10 },
  { id: 'hills-of-andalos', names: { en: 'Hills of Andalos', zh: '安达洛斯丘陵' }, zhNote: '◇', pts: [[800,720],[830,740],[850,770]], w: 10 },
  { id: 'mother-of-mountains', names: { en: 'Mother of Mountains', zh: '群山之母' }, pts: [[1548,724],[1566,718],[1580,728]], w: 16, k: 2 },
  { id: 'krazaar-hills', names: { en: 'Hills of Lhazar', zh: '拉札林丘陵' }, zhNote: '◇', pts: [[1500,1080],[1540,1060]], w: 8, label: false },
  { id: 'bone-mountains', names: { en: 'The Bone Mountains', zh: '骸骨山脉' }, at: [2080, 900], pts: [[2086,520],[2060,620],[2090,720],[2060,820],[2096,920],[2060,1020],[2090,1120],[2066,1220],[2096,1320]], w: 28 },
  { id: 'bone-mountains-east', names: { en: 'The Bone Mountains', zh: '骸骨山脉' }, pts: [[2140,640],[2156,780],[2134,920],[2156,1060],[2140,1200]], w: 12, label: false },
  { id: 'bone-mountains-west', names: { en: 'The Bone Mountains', zh: '骸骨山脉' }, pts: [[2020,700],[2010,860],[2024,1000],[2012,1160]], w: 9, label: false },
  { id: 'mountains-of-the-morn', names: { en: 'Mountains of the Morn', zh: '晨曦山脉' }, zhNote: '◇', pts: [[2960,860],[2980,960],[2970,1060],[2990,1160],[2980,1260]], w: 24 },
  { id: 'the-shadow', names: { en: 'The Shadow', zh: '阴影山脉' }, zhNote: '◇', pts: [[2830,1500],[2860,1460],[2900,1430],[2950,1440]], w: 20 },
  { id: 'fourteen-flames', names: { en: 'The Fourteen Flames', zh: '十四火峰' }, pts: [[1110,1416],[1140,1430],[1156,1420]], w: 10, k: 1.6 },
  { id: 'ghiscari-hills', names: { en: 'Ghiscari hills', zh: '吉斯丘陵' }, zhNote: '◇', pts: [[1310,1400],[1350,1420]], w: 8, label: false },
  { id: 'ibben-hills', names: { en: 'Ibbenese hills', zh: '伊班丘陵' }, zhNote: '◇', pts: [[1600,262],[1680,248],[1760,262]], w: 14, label: false },
  // Sothoryos (sparse on purpose)
  { id: 'sothoryos-highlands', names: { en: 'Sothoryi highlands', zh: '索斯罗斯高地' }, zhNote: '◇', pts: [[1300,1900],[1400,1880],[1500,1900]], w: 18, label: false },
];
/** Single notable peaks (for anchors / labels). */
export const PEAKS = [
  { id: 'giants-lance', names: { en: 'Giant\'s Lance', zh: '巨人之枪' }, at: [480, 786] },
  { id: 'dragonmont', names: { en: 'Dragonmont', zh: '龙山' }, at: [600, 924] },
  { id: 'mother-of-mountains', names: { en: 'Mother of Mountains', zh: '群山之母' }, at: [1564, 726] },
  { id: 'fourteen-flames', names: { en: 'The Fourteen Flames', zh: '十四火峰' }, at: [1138, 1426] },
];

/* =====================================================================================================================
 * RIVERS — polylines from SOURCE to MOUTH (or confluence). w = drawn weight. `into` = what it flows into.
 * ===================================================================================================================== */
export const RIVERS = [
  // Beyond the Wall & the North
  { id: 'milkwater', names: { en: 'The Milkwater', zh: '乳河' }, pts: [[262,100],[290,140],[318,176],[336,210],[352,238],[384,256],[424,262],[470,270],[500,280]], w: 1.6, into: 'Bay of Seals (course approximate)' },
  { id: 'last-river', names: { en: 'The Last River', zh: '最后河' }, zhNote: '◇', pts: [[372,318],[404,334],[438,344],[474,350],[508,354],[536,362]], w: 1.4, into: 'Bay of Seals' },
  { id: 'weeping-water', names: { en: 'The Weeping Water', zh: '泣水河' }, zhNote: '◇', pts: [[460,420],[484,446],[506,468],[534,482],[566,490],[592,500]], w: 1.4, into: 'Narrow Sea' },
  { id: 'white-knife', names: { en: 'The White Knife', zh: '白刃河' }, pts: [[404,446],[412,486],[420,526],[428,560],[438,588],[448,604]], w: 1.8, into: 'the Bite (White Harbor)' },
  { id: 'broken-branch', names: { en: 'The Broken Branch', zh: '断枝河' }, zhNote: '◇', pts: [[478,500],[462,530],[446,566],[436,590]], w: 1.1, into: 'White Knife' },
  { id: 'fever-river', names: { en: 'The Fever River', zh: '热病河' }, zhNote: '◇', pts: [[350,690],[330,698],[308,708],[290,718]], w: 1.1, into: 'Ironman\'s Bay (the Neck)' },
  // Riverlands
  { id: 'green-fork', names: { en: 'The Green Fork', zh: '绿叉河' }, pts: [[352,690],[350,722],[352,758],[358,786],[376,806],[396,816],[410,820]], w: 1.8, into: 'Trident' },
  { id: 'tumblestone', names: { en: 'The Tumblestone', zh: '腾石河' }, pts: [[268,800],[284,816],[302,832],[322,846]], w: 1.3, into: 'Red Fork (at Riverrun)' },
  { id: 'red-fork', names: { en: 'The Red Fork', zh: '红叉河' }, pts: [[266,884],[286,872],[306,858],[322,846],[348,834],[376,826],[410,820]], w: 1.8, into: 'Trident' },
  { id: 'blue-fork', names: { en: 'The Blue Fork', zh: '蓝叉河' }, zhNote: '◇', pts: [[438,758],[432,780],[424,800],[410,820]], w: 1.5, into: 'Trident' },
  { id: 'trident', names: { en: 'The Trident', zh: '三叉戟河' }, pts: [[410,820],[428,822],[446,826],[464,830],[484,834]], w: 2.4, into: 'Bay of Crabs' },
  { id: 'blackwater-rush', names: { en: 'The Blackwater Rush', zh: '黑水河' }, pts: [[300,904],[328,910],[358,916],[392,920],[424,922],[448,927],[468,935]], w: 2, into: 'Blackwater Bay (King\'s Landing)' },
  // Reach, Stormlands, Dorne
  { id: 'mander', names: { en: 'The Mander', zh: '曼德河' }, pts: [[466,968],[444,984],[420,1000],[394,1014],[368,1032],[344,1048],[324,1054],[300,1040],[272,1024],[250,1013],[236,1008]], w: 2.2, into: 'Sunset Sea (Shield Islands)' },
  { id: 'cockleswhent', names: { en: 'The Cockleswhent', zh: '科克斯温河' }, zhNote: '◇', pts: [[436,950],[428,972],[420,1000]], w: 1.1, into: 'Mander (course approximate)' },
  { id: 'blueburn', names: { en: 'The Blueburn', zh: '蓝焰河' }, zhNote: '◇', pts: [[300,982],[308,1008],[300,1040]], w: 1.1, into: 'Mander (course approximate)' },
  { id: 'honeywine', names: { en: 'The Honeywine', zh: '蜜酒河' }, pts: [[300,1078],[276,1094],[252,1112],[230,1128],[218,1134]], w: 1.4, into: 'Whispering Sound (Oldtown)' },
  { id: 'wendwater', names: { en: 'The Wendwater', zh: '温德河' }, zhNote: '◇', pts: [[456,990],[484,1004],[510,1014],[532,1018]], w: 1.1, into: 'Shipbreaker Bay (course approximate)' },
  { id: 'torrentine', names: { en: 'The Torrentine', zh: '激流河' }, zhNote: '◇', pts: [[328,1184],[314,1198],[298,1212],[284,1228]], w: 1.3, into: 'Summer Sea (Starfall)' },
  { id: 'brimstone', names: { en: 'The Brimstone', zh: '硫磺河' }, zhNote: '◇', pts: [[420,1186],[442,1206],[462,1222],[478,1234]], w: 1.1, into: 'Greenblood' },
  { id: 'vaith', names: { en: 'The Vaith', zh: '维斯河' }, zhNote: '◇', pts: [[396,1272],[424,1260],[452,1246],[478,1234]], w: 1.1, into: 'Greenblood' },
  { id: 'greenblood', names: { en: 'The Greenblood', zh: '绿血河' }, pts: [[478,1234],[506,1244],[536,1252],[566,1258],[590,1261],[604,1262]], w: 1.8, into: 'Narrow Sea (Planky Town)' },
  // Essos — the Rhoyne system
  { id: 'upper-rhoyne', names: { en: 'The Upper Rhoyne', zh: '上洛恩河' }, zhNote: '◇', pts: [[972,640],[982,690],[990,740],[988,790],[990,830]], w: 1.7, into: 'Rhoyne' },
  { id: 'little-rhoyne', names: { en: 'The Little Rhoyne', zh: '小洛恩河' }, zhNote: '◇', pts: [[1090,730],[1078,774],[1052,800],[1020,816],[990,830]], w: 1.4, into: 'Rhoyne (past Qohor)' },
  { id: 'noyne', names: { en: 'The Noyne', zh: '诺伊河' }, zhNote: '◇', pts: [[920,712],[934,748],[946,790],[960,836],[982,870]], w: 1.4, into: 'Rhoyne (Ghoyan Drohe)' },
  { id: 'qhoyne', names: { en: 'The Qhoyne', zh: '克霍伊河' }, zhNote: '◇', pts: [[1120,872],[1086,892],[1050,908],[1016,922],[992,930]], w: 1.4, into: 'Rhoyne (Ar Noy)' },
  { id: 'lhorulu', names: { en: 'The Lhorulu', zh: '洛鲁鲁河' }, zhNote: '◇', pts: [[1110,960],[1072,966],[1036,974],[1006,980]], w: 1.2, into: 'Rhoyne (Chroyane)' },
  { id: 'selhoru', names: { en: 'The Selhoru', zh: '塞尔霍鲁河' }, zhNote: '◇', pts: [[1112,1030],[1080,1044],[1052,1054],[1026,1060]], w: 1.2, into: 'Rhoyne (Selhorys)' },
  { id: 'rhoyne', names: { en: 'The Rhoyne', zh: '洛恩河' }, pts: [[990,830],[984,850],[982,870],[986,900],[992,930],[1000,956],[1006,980],[1014,1020],[1026,1060],[1036,1100],[1044,1140],[1050,1176],[1058,1210]], w: 2.8, into: 'Summer Sea (Volantis)' },
  // Essos — east
  { id: 'skahazadhan', names: { en: 'The Skahazadhan', zh: '斯卡哈扎丹河' }, pts: [[1470,960],[1440,1010],[1410,1060],[1380,1106],[1360,1136],[1348,1150]], w: 1.8, into: 'Slaver\'s Bay (Meereen)' },
  { id: 'worm', names: { en: 'The Worm', zh: '蠕虫河' }, zhNote: '◇', pts: [[1376,1380],[1356,1356],[1342,1332],[1336,1314]], w: 1.1, into: 'Slaver\'s Bay (Astapor)' },
  { id: 'ash', names: { en: 'The Ash', zh: '灰烬河' }, zhNote: '◇', pts: [[2880,1440],[2840,1500],[2810,1546],[2796,1576]], w: 1.4, into: 'Jade Sea (Asshai)' },
  { id: 'sothoryos-river', names: { en: 'Zamoyos', zh: '扎莫约斯河' }, zhNote: '◇', pts: [[1200,1950],[1160,1880],[1130,1820],[1130,1797]], w: 1.4, into: 'Summer Sea (course schematic)' },
];

/* LAKES — ellipses (c = centre, rx/ry = radii, rot optional). `isle` draws an island inside. */
export const LAKES = [
  { id: 'gods-eye', names: { en: 'Gods Eye', zh: '神眼湖' }, c: [404, 882], rx: 20, ry: 13, isle: { id: 'isle-of-faces', names: { en: 'Isle of Faces', zh: '千面屿' }, c: [400, 884], rx: 6, ry: 4 } },
  { id: 'long-lake', names: { en: 'Long Lake', zh: '长湖' }, c: [392, 566], rx: 4, ry: 16 },
  { id: 'queenscrown-lake', names: { en: 'Queenscrown lake', zh: '王后冠湖' }, zhNote: '◇', c: [394, 346], rx: 6, ry: 4 },
  { id: 'dagger-lake', names: { en: 'Dagger Lake', zh: '匕首湖' }, zhNote: '◇', c: [1126, 868], rx: 9, ry: 4 },
  { id: 'womb-of-the-world', names: { en: 'Womb of the World', zh: '世界之子宫' }, c: [1584, 788], rx: 12, ry: 6 },
  { id: 'lake-of-lhazar', names: { en: 'lake of Lhazar', zh: '拉札林湖' }, zhNote: '◇', c: [1560, 1110], rx: 8, ry: 5, label: false },
];

/* FORESTS — each forest is one or more clusters [cx, cy, radius, glyphCount]. k = tree glyph species. */
export const FORESTS = [
  { id: 'haunted-forest', names: { en: 'The Haunted Forest', zh: '鬼影森林' }, k: 'pine', parts: [[400,226,58,110],[346,250,40,60],[460,250,36,50],[420,170,40,50]] },
  { id: 'wolfswood', names: { en: 'The Wolfswood', zh: '狼林' }, k: 'pine', parts: [[278,462,40,80],[316,500,28,40]] },
  { id: 'northern-pines', names: { en: 'northern woods', zh: '北境林地' }, zhNote: '◇', k: 'pine', label: false, parts: [[450,402,36,50],[500,430,30,40],[420,476,24,30]] },
  { id: 'whispering-wood', names: { en: 'The Whispering Wood', zh: '呓语森林' }, k: 'oak', parts: [[338,830,14,22]] },
  { id: 'kingswood', names: { en: 'The Kingswood', zh: '御林' }, k: 'oak', parts: [[494,976,30,70],[520,994,20,30]] },
  { id: 'rainwood', names: { en: 'The Rainwood', zh: '雨林' }, k: 'oak', parts: [[594,1080,24,50]] },
  { id: 'reach-woods', names: { en: 'woods of the Reach', zh: '河湾地林地' }, zhNote: '◇', k: 'oak', label: false, parts: [[300,1100,22,30],[400,1060,18,24],[268,960,16,20]] },
  { id: 'vale-woods', names: { en: 'woods of the Vale', zh: '谷地林地' }, zhNote: '◇', k: 'pine', label: false, parts: [[540,790,14,18]] },
  { id: 'forest-of-qohor', names: { en: 'The Forest of Qohor', zh: '科霍尔森林' }, k: 'oak', parts: [[1020,760,46,110],[1060,720,30,40]] },
  { id: 'braavosi-woods', names: { en: 'Braavosi woodland', zh: '布拉佛斯林地' }, zhNote: '◇', k: 'pine', label: false, parts: [[800,650,28,40]] },
  { id: 'valyrian-groves', names: { en: 'Lands of the Long Summer', zh: '长夏之地' }, k: 'palm', parts: [[1126,1290,34,50],[1110,1340,20,24]] },
  { id: 'yi-ti-forests', names: { en: 'Forests of Yi Ti', zh: '夷地森林' }, zhNote: '◇', k: 'oak', parts: [[2420,1240,70,100],[2650,1160,60,80]] },
  { id: 'jade-coast-woods', names: { en: 'Qartheen gardens', zh: '魁尔斯林园' }, zhNote: '◇', k: 'palm', label: false, parts: [[1960,1450,24,30]] },
  { id: 'summer-isles-forest', names: { en: 'Summer Isles forests', zh: '盛夏群岛森林' }, zhNote: '◇', k: 'palm', label: false, parts: [[430,1500,22,40],[522,1560,30,60],[612,1528,14,20]] },
  { id: 'naath-forest', names: { en: 'Naathi forest', zh: '纳斯森林' }, zhNote: '◇', k: 'palm', label: false, parts: [[880,1700,16,24]] },
  { id: 'green-hell', names: { en: 'The Green Hell', zh: '绿色地狱' }, zhNote: '◇', k: 'palm', parts: [[1100,1900,90,140],[1420,1900,110,140],[1760,1900,90,110]] },
];

/* SWAMPS / DESERTS / PLAINS — soft areas (c, rx, ry). Drive glyphs (reeds, dunes) and flatten relief. */
export const SWAMPS = [
  { id: 'the-neck', names: { en: 'The Neck', zh: '颈泽' }, c: [356, 700], rx: 52, ry: 40, n: 120 },
  { id: 'sorrows', names: { en: 'The Sorrows', zh: '哀伤之地' }, zhNote: '◇', c: [1004, 976], rx: 14, ry: 16, n: 22, label: false },
];
export const DESERTS = [
  { id: 'dornish-sands', names: { en: 'The Dornish sands', zh: '多恩沙漠' }, zhNote: '◇', c: [440, 1272], rx: 110, ry: 34, n: 90 },
  { id: 'red-waste', names: { en: 'The Red Waste', zh: '红色荒原' }, c: [1760, 1320], rx: 150, ry: 100, n: 160 },
  { id: 'grey-waste', names: { en: 'The Grey Waste', zh: '灰色荒原' }, zhNote: '◇', c: [2520, 700], rx: 220, ry: 90, n: 70 },
];
export const PLAINS = [
  { id: 'dothraki-sea', names: { en: 'The Dothraki Sea', zh: '多斯拉克海' }, c: [1560, 800], rx: 400, ry: 250, label: false },
  { id: 'flatlands', names: { en: 'The Flatlands', zh: '平地' }, zhNote: '◇', c: [860, 840], rx: 60, ry: 60, label: false },
  { id: 'golden-fields', names: { en: 'The Golden Fields', zh: '金色原野' }, zhNote: '◇', c: [1110, 940], rx: 50, ry: 40 },
  { id: 'disputed-lands', names: { en: 'The Disputed Lands', zh: '争议之地' }, c: [846, 1150], rx: 30, ry: 40 },
  { id: 'reach-plains', names: { en: 'Reach farmland', zh: '河湾地农田' }, zhNote: '◇', c: [350, 1040], rx: 90, ry: 60, label: false },
  { id: 'barrowlands', names: { en: 'The Barrowlands', zh: '古冢原' }, zhNote: '◇', c: [300, 612], rx: 40, ry: 30 },
  { id: 'lhazar', names: { en: 'Lhazar', zh: '拉札' }, zhNote: '◇', c: [1560, 1110], rx: 80, ry: 70 },
  { id: 'jogos-nhai-plains', names: { en: 'Plains of the Jogos Nhai', zh: '乔戈奈平原' }, zhNote: '◇', c: [2380, 560], rx: 180, ry: 80 },
];

/** Named capes / peninsulas (point anchors for labels). */
export const CAPES = [
  { id: 'sea-dragon-point', names: { en: 'Sea Dragon Point', zh: '海龙角' }, at: [160, 468] },
  { id: 'cape-kraken', names: { en: 'Cape Kraken', zh: '海怪角' }, at: [214, 700] },
  { id: 'the-fingers', names: { en: 'The Fingers', zh: '五指半岛' }, at: [624, 726] },
  { id: 'crackclaw-point', names: { en: 'Crackclaw Point', zh: '蟹爪半岛' }, at: [560, 886] },
  { id: 'masseys-hook', names: { en: 'Massey\'s Hook', zh: '梅西钩' }, zhNote: '◇', at: [566, 976] },
  { id: 'cape-wrath', names: { en: 'Cape Wrath', zh: '怒角' }, at: [604, 1096] },
  { id: 'broken-arm', names: { en: 'The Broken Arm', zh: '断臂角' }, zhNote: '◇', at: [664, 1212] },
  { id: 'the-axe', names: { en: 'The Axe', zh: '斧头半岛' }, zhNote: '◇', at: [882, 522] },
  { id: 'basilisk-point', names: { en: 'Basilisk Point', zh: '蛇蜥角' }, zhNote: '◇', at: [1012, 1744] },
];

/* BIOMES — soft tint ellipses under the terrain: [cx, cy, rx, ry, colour(hex), strength] */
export const BIOMES = [
  [390,100,280,200,0xe6eef2,0.78],[380,270,190,50,0xdfe9ee,0.55],[390,470,220,170,0xcfd9d2,0.35],[356,700,62,46,0x8a9a78,0.5],
  [380,850,110,90,0x9fb36b,0.5],[320,1060,150,110,0x9ec15c,0.55],[262,880,46,90,0xb9b27a,0.4],[560,1040,80,70,0x8da668,0.4],
  [430,1262,170,56,0xd9b97a,0.72],[540,1290,90,40,0xe3c488,0.7],[500,780,70,60,0xb9c7b0,0.4],
  [1560,800,460,290,0xcfc27a,0.6],[960,850,220,300,0xaebf74,0.4],[1130,1320,90,90,0x6fa557,0.55],[1760,1320,170,120,0xd8a86a,0.85],
  [2500,1150,380,240,0x9cbf63,0.5],[1560,1110,90,70,0xbac06c,0.4],[1350,1400,80,60,0xd7b072,0.5],[2080,1440,120,40,0x87b660,0.4],
  [1700,420,620,120,0xc9d8d6,0.4],[1670,280,170,70,0xc9d8d6,0.5],[2520,700,300,140,0xbdb8a0,0.5],[2400,420,400,150,0xc9d8d6,0.35],
  [1420,1940,640,160,0x3e7a3a,0.7],[520,1550,140,80,0x4f8f4a,0.5],[880,1700,30,20,0x4f8f4a,0.5],[2860,1520,130,100,0x2d2a2c,0.38],
  [2690,1740,110,60,0x4f8f4a,0.45],[2310,1590,70,30,0x6fa557,0.45],[1150,1562,30,18,0x6fa557,0.4],
];

/* ROADS — dotted overland routes. */
export const ROADS = [
  { id: 'kingsroad', names: { en: 'The Kingsroad', zh: '国王大道' }, pts: [[385,306],[390,350],[386,410],[378,460],[372,510],[368,566],[362,620],[360,662],[364,708],[372,752],[392,790],[418,816],[424,840],[438,876],[454,908],[466,930]], style: 'road' },
  { id: 'kingsroad-south', names: { en: 'The Kingsroad', zh: '国王大道' }, pts: [[466,930],[478,962],[494,994],[514,1016],[526,1026]], style: 'road' },
  { id: 'roseroad', names: { en: 'The Roseroad', zh: '玫瑰大道' }, pts: [[466,930],[446,958],[420,1000],[384,1030],[330,1062],[288,1094],[250,1118],[224,1132]], style: 'road' },
  { id: 'goldroad', names: { en: 'The Goldroad', zh: '黄金大道' }, pts: [[466,930],[432,944],[388,950],[340,938],[296,906],[264,884],[252,880]], style: 'road' },
  { id: 'river-road', names: { en: 'The River Road', zh: '河道' }, zhNote: '◇', pts: [[252,880],[284,850],[322,846],[372,840],[424,840]], style: 'road' },
  { id: 'high-road', names: { en: 'The High Road', zh: '高路' }, zhNote: '◇', pts: [[424,840],[436,812],[446,800],[466,792],[480,790]], style: 'road' },
  { id: 'ocean-road', names: { en: 'The Ocean Road', zh: '海洋大道' }, zhNote: '◇', pts: [[252,880],[240,930],[234,990],[262,1030],[300,1050],[330,1062]], style: 'road' },
  { id: 'boneway', names: { en: 'The Boneway', zh: '骸骨路' }, zhNote: '◇', pts: [[526,1026],[500,1080],[480,1120],[488,1150],[478,1180],[454,1196]], style: 'trail' },
  { id: 'princes-pass', names: { en: 'Prince\'s Pass', zh: '亲王隘口' }, pts: [[330,1062],[330,1110],[322,1150],[318,1184],[330,1210],[356,1230]], style: 'trail' },
  { id: 'dothraki-way', names: { en: 'Road to Vaes Dothrak', zh: '通往维斯·多斯拉克之路' }, zhNote: '◇', pts: [[806,848],[860,836],[950,808],[1020,790],[1075,775],[1200,770],[1350,764],[1480,760],[1560,762]], style: 'trail' },
  { id: 'qarth-road', names: { en: 'Through the Red Waste', zh: '穿越红色荒原' }, zhNote: '◇', pts: [[1560,762],[1590,900],[1570,1060],[1640,1200],[1720,1300],[1830,1420],[1918,1510]], style: 'trail' },
  { id: 'demon-road', names: { en: 'The Demon Road', zh: '恶魔之路' }, zhNote: '◇', pts: [[1060,1206],[1120,1232],[1180,1222],[1240,1190],[1300,1160],[1348,1142]], style: 'road' },
  { id: 'valyrian-road', names: { en: 'Valyrian road along the Rhoyne', zh: '洛恩河畔的瓦雷利亚大道' }, zhNote: '◇', pts: [[1060,1206],[1046,1140],[1032,1062],[1012,980],[996,930],[982,870],[960,820],[935,748]], style: 'road' },
];
/** The Wall: Westwatch-by-the-Bridge (west) → Eastwatch-by-the-Sea (east). ~155 units ≈ 300 miles. */
export const WALL = [[305, 302], [462, 298]];
/** Shipping lanes (drawn faintly with moving ship glyphs). */
export const SEA_LANES = [
  [[602,936],[680,900],[740,872],[784,856]],                         // King's Landing → Pentos
  [[552,826],[620,780],[690,700],[738,644]],                          // Gulltown → Braavos
  [[458,606],[540,620],[640,640],[738,638]],                          // White Harbor → Braavos
  [[214,1150],[230,1240],[380,1340],[600,1330],[720,1250],[880,1240],[1050,1226]], // Oldtown → Volantis (south of the Stepstones)
  [[252,884],[180,900],[150,990],[160,1100],[180,1150]],              // Lannisport → Oldtown
  [[752,624],[860,470],[1100,450],[1400,400],[1680,350]],             // Braavos → Lorath → Ibben
  [[1060,1226],[1000,1380],[1060,1500],[1200,1500],[1262,1420],[1300,1270],[1340,1200]], // Volantis → Slaver's Bay (around Valyria)
  [[1912,1540],[1700,1510],[1460,1490],[1300,1470]],                  // Qarth → Ghis
  [[1960,1500],[2100,1500],[2400,1500],[2700,1600],[2790,1590]],      // Qarth → Asshai across the Jade Sea
];

/** Every named feature in one flat list (for labels, search, place-authoring tools). kind ∈ range|peak|river|lake|forest|swamp|desert|plain|cape|island. */
export const FEATURES = [
  ...MOUNTAINS.filter((m) => m.label !== false).map((m) => ({ id: m.id, kind: 'range', names: m.names, at: m.at || m.pts[Math.floor(m.pts.length / 2)], pts: m.pts })),
  ...PEAKS.map((p) => ({ id: p.id, kind: 'peak', names: p.names, at: p.at })),
  ...RIVERS.map((r) => ({ id: r.id, kind: 'river', names: r.names, at: r.pts[Math.floor(r.pts.length / 2)], pts: r.pts })),
  ...LAKES.filter((l) => l.label !== false).map((l) => ({ id: l.id, kind: 'lake', names: l.names, at: l.c })),
  ...FORESTS.filter((f) => f.label !== false).map((f) => ({ id: f.id, kind: 'forest', names: f.names, at: f.parts[0].slice(0, 2) })),
  ...SWAMPS.filter((f) => f.label !== false).map((f) => ({ id: f.id, kind: 'swamp', names: f.names, at: f.c })),
  ...DESERTS.map((f) => ({ id: f.id, kind: 'desert', names: f.names, at: f.c })),
  ...PLAINS.filter((f) => f.label !== false).map((f) => ({ id: f.id, kind: 'plain', names: f.names, at: f.c })),
  ...CAPES.map((c) => ({ id: c.id, kind: 'cape', names: c.names, at: c.at })),
  ...ISLANDS.filter((i) => i.kind !== 'continent' && i.label !== false).map((i) => ({ id: i.id, kind: 'island', names: i.names, at: landCentre(i.id) })),
  ...LAKES.filter((l) => l.isle).map((l) => ({ id: l.isle.id, kind: 'island', names: l.isle.names, at: l.isle.c })),
];
