# Map grid — coordinates, scale and anchors for place authors

Use this file to put a place at `at: [x, y]` (in `src/data/locations.js` or `src/data/places/<group>.js`) so that it lands on the right
coast, river bank or valley. All geometry is original and hand-authored (see `docs/MAP_NOTES.md`); nothing was traced.

## 1. Coordinate system

| | |
|---|---|
| World canvas | **3200 × 2000 units** (`WORLD` in `src/data/regions.js`). Origin top-left; **x → east, y → south**. |
| Scale | **1 unit ≈ 2 miles (≈ 3.2 km)**. Pinned to the Wall ≈ 300 mi ≈ 155 units; every other distance is relative (books give travel times, not surveys). |
| Useful lengths | 10 units ≈ 20 mi (a long day on foot) · 25 units ≈ 50 mi (a hard day's ride) · 100 units ≈ 200 mi |
| Raster | `SCALE = 0.44` px per unit, painted over the world plus a 340-unit sea margin (`src/map/basemap.js`). |
| Beyond the canvas | Westeros runs off the top edge (Land of Always Winter); the far east and Sothoryos run off the right/bottom. Keep places inside 0 < x < 3200, 0 < y < 2000 (`npm test` checks). |

### Latitude bands (y) — handy for "is this north or south of …"

| y | what lies on that line |
|---:|---|
| ~100 | Frostfangs; Ibben's north coast is ~210 |
| **300** | **the Wall** (x 305 → 462); Ibben's south coast ~340 |
| 450–470 | Sea Dragon Point, Deepwood Motte, Karhold; north coast of Essos runs y ≈ 450–580 from Braavos eastward |
| **510** | **Winterfell** |
| 595–640 | White Harbor, the Bite's north shore, **Braavos (636)** |
| 660–760 | the Neck (Moat Cailin 664 → the Twins 758); Norvos 746, Vaes Dothrak 764, Qohor 774 |
| 780–850 | the Vale (Eyrie 788), Riverrun 846, **Pentos 848**, the Trident (y ≈ 820) |
| **928** | **King's Landing**, Dragonstone 926 |
| 1000–1060 | Myr 1002, Storm's End 1026, Highgarden 1062, Selhorys 1058 |
| 1130–1210 | Oldtown 1130, Meereen 1142, Red Mountains ~1165, Tyrosh 1100, Stepstones ~1190, **Volantis 1206** |
| 1250–1330 | Dorne's interior and south coast (≈ 1310–1325), Sunspear 1280, Lys 1256, Astapor 1318 |
| 1380–1460 | the Smoking Sea and Valyria (1424), Ghis, Gulf of Grief |
| 1500–1600 | Summer Isles, Qarth (1514), Asshai (1570), the Jade Sea islands |
| 1700–1830 | Naath, Basilisk Isles, north coast of Sothoryos (≈ 1730–1830) |

### Precision and coasts — read before placing anything coastal

* Coastlines are Catmull-Rom curves through the control points in `LAND` (geo.js), then **roughened by up to ±4 units**. A place
  "on the coast" (port, sea-castle, river-mouth town) should sit **3–6 units inland** of the control-point line; island places should sit near
  the island's centre (`landCentre(id)` in geo.js gives it).
* Rivers are drawn through their `pts` (± ~1 unit wobble). A town "on the X" should be within ~3 units of a river point; a town at a
  confluence uses the confluence point listed below.
* Lakes are ellipses (`LAKES`: centre `c`, radii `rx/ry`). Gods Eye spans x 384–424, y 869–895; Harrenhal sits on its north shore.
* Always check with `node tools/mapview.mjs out.png --region=<id> --all` (or `--x= --y= --z=4`) and look at the PNG.
* Relative order matters more than exact numbers: keep the books' "north of / a day's ride from / across the bay from" relations true.

## 2. Regions (bounds = [x0, y0, x1, y1], from `src/data/regions.js`)

| region id | bounds | region id | bounds |
|---|---|---|---|
| beyond-wall | 140, 0, 640, 300 | free-cities | 730, 480, 1210, 1290 |
| north | 130, 300, 620, 720 | dothraki-sea | 1150, 450, 2050, 1110 |
| iron-islands | 140, 712, 262, 826 | valyria | 1040, 1200, 1260, 1480 |
| vale | 400, 690, 650, 840 | slavers-bay | 1230, 1100, 1480, 1480 |
| riverlands | 270, 720, 500, 920 | red-waste | 1600, 1150, 1960, 1480 |
| westerlands | 195, 790, 320, 985 | eastern-essos (Qarth, Jade coast) | 1840, 1340, 2220, 1560 |
| crownlands | 420, 840, 620, 990 | far-east (Yi Ti, Asshai) | 2100, 380, 3200, 1820 |
| reach | 140, 940, 480, 1200 | summer-isles | 360, 1450, 690, 1650 |
| stormlands | 460, 950, 690, 1160 | shivering-sea (Ibben) | 1450, 140, 1860, 430 |
| dorne | 255, 1150, 700, 1340 | | |

Boxes overlap at borders; assign `region` by the books, not by the box. Rough borders: North/Riverlands = the Neck's south end (y ≈ 750);
Riverlands/Crownlands ≈ the Blackwater Rush + the line Crossroads Inn → Duskendale; Reach/Stormlands ≈ x 450–470 (Kingswood edge → Dornish
Marches); Reach/Dorne = the Red Mountains (y ≈ 1160–1185); Westerlands/Riverlands = the Golden Tooth hills (x ≈ 285–300).

## 3. Named geography in `src/map/geo.js` (reuse these ids for nature places)

`FEATURES` is a flat list `{ id, kind, names:{en,zh}, at, pts? }` of everything below. For a **nature place** (`kind: river|mountain|lake|
forest|swamp|desert|island|pass|bay`) reuse the geo id and put `at` at the feature's label point (`FEATURES[...].at`) — the map's faint fallback
label for that feature is automatically hidden once a place with the same id (or English name) exists, so nothing is drawn twice.

* `LAND` — continents and islands (keys = ids); `ISLANDS` gives names (incl. each Iron Island, the Three Sisters, Shield Islands, Stepstones,
  Bloodstone, Tarth, Estermont, the Arbor, Fair Isle, Claw Isle, Driftmark, Skagos, Skane, Bear Island, Lys, Tyrosh, Lorath, Ibben, Valyria,
  Isle of Cedars, New Ghis, Isle of Tears, Naath, Basilisk Isles, Jhala, Walano, Omboru, Great Moraq, Leng).
* `MOUNTAINS` (ridge polylines), `PEAKS` (Giant's Lance, Dragonmont, Mother of Mountains, Fourteen Flames).
* `RIVERS` — `pts` run **from source to mouth/confluence**; `into` says where it ends. Main ones:

| river | runs | ends at |
|---|---|---|
| Milkwater | Frostfangs (262,100) → SE | Bay of Seals (500,280) *(course approximate)* |
| Last River | (372,318) → E past Last Hearth | Bay of Seals (536,362) |
| Weeping Water | (460,420) → past the Dreadfort | Narrow Sea (592,500) |
| White Knife | (404,446) → S | White Harbor (448,604) |
| Green Fork | the Neck (352,690) → the Twins (352,758) | Trident confluence (410,820) |
| Tumblestone | (268,800) → SE | joins the Red Fork at Riverrun (322,846) |
| Red Fork | (266,884) → Riverrun → E | Trident confluence (410,820) |
| Blue Fork | Mountains of the Moon (438,758) → SW | Trident confluence (410,820) |
| Trident | confluence (410,820) → Ruby Ford (428,822) → E | Bay of Crabs (484,834) |
| Blackwater Rush | (300,904) → E, south of the Gods Eye | King's Landing (468,935) |
| Mander | (466,968) → Bitterbridge (420,1000) → Highgarden (330,1062) → W | Shield Islands (236,1008) |
| Honeywine | (300,1078) → SW | Oldtown (218,1134) |
| Torrentine | Red Mountains (328,1184) → SW | Starfall (284,1228) |
| Brimstone + Vaith → Greenblood | confluence at Godsgrace (478,1234) → E | Planky Town (604,1262) |
| Rhoyne | Upper Rhoyne (972,640) → Little Rhoyne joins (990,830) → Noyne at Ghoyan Drohe (982,870) → Qhoyne at Ar Noy (992,930) → Lhorulu at Chroyane (1006,980) → Selhoru at Selhorys (1026,1060) → Valysar → Volon Therys | Volantis (1058,1210) |
| Skahazadhan | Dothraki Sea (1470,960) → SW | Meereen (1348,1150) |
| Worm | (1376,1380) → N | Astapor (1336,1314) |

* `LAKES` (Gods Eye + Isle of Faces, Long Lake, Queenscrown lake, Dagger Lake, Womb of the World), `FORESTS` (`parts` = clusters
  [cx, cy, r, n]: Haunted Forest, Wolfswood, Whispering Wood, Kingswood, Rainwood, Forest of Qohor, Yi Ti, the Green Hell …),
  `SWAMPS` (the Neck), `DESERTS` (Dornish sands, Red Waste, Grey Waste), `PLAINS` (Dothraki Sea, Disputed Lands, Golden Fields, Lhazar,
  Barrowlands …), `CAPES` (Sea Dragon Point, Cape Kraken, the Fingers, Crackclaw Point, Massey's Hook, Cape Wrath, Broken Arm, the Axe,
  Basilisk Point), `ROADS` (kingsroad, roseroad, goldroad, river road, high road, ocean road, Boneway, Prince's Pass, Demon Road …),
  `WALL`, `SEA_LANES`. Seas and bays (with ids) are in `SEAS` in `src/data/regions.js`.

## 4. Anchor coordinates

"registry" = already a location in `src/data/locations.js` (these values are authoritative). "approx." = the books/companions give only a
rough position; keep the relation in the note and adjust if you know better. Chinese marked ◇ is a project rendering — `docs/GLOSSARY.md`
wins wherever it differs. Every anchor below was checked to be on land and ≥ 3 units from the coast (coast/mouth anchors excepted).

### Beyond the Wall

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| fist-of-the-first-men | Fist of the First Men | 先民拳峰 | 372 | 170 |  |
| crasters-keep | Craster's Keep | 卡斯特堡 | 392 | 214 |  |
| hardhome | Hardhome | 艰难屯 | 528 | 242 | registry |
| skirling-pass | Skirling Pass | 啸声隘口 | 292 | 150 | in the Frostfangs |
| frostfangs | Frostfangs (centre) | 霜雪之牙 | 250 | 96 |  |
| haunted-forest | Haunted Forest (centre) | 鬼影森林 | 400 | 226 |  |

### The Wall

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| westwatch | Westwatch-by-the-Bridge | 西望台 ◇ | 308 | 306 | W end of the Wall |
| shadow-tower | Shadow Tower | 影子塔 | 332 | 306 |  |
| castle-black | Castle Black | 黑城堡 | 385 | 308 | registry |
| nightfort | Nightfort | 夜堡 | 414 | 306 |  |
| eastwatch | Eastwatch-by-the-Sea | 东海望 | 456 | 306 | E end of the Wall |

### The North

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| queenscrown | Queenscrown | 王后冠 | 394 | 346 | island in a small lake |
| last-hearth | Last Hearth | 末炉城 | 432 | 366 |  |
| karhold | Karhold | 卡霍城 | 572 | 432 |  |
| dreadfort | Dreadfort | 恐怖堡 | 522 | 478 | on the Weeping Water |
| winterfell | Winterfell | 临冬城 | 372 | 510 | registry |
| deepwood-motte | Deepwood Motte | 深林堡 | 270 | 470 | in the Wolfswood |
| bear-island | Bear Island (centre) | 熊岛 | 205 | 390 |  |
| torrhens-square | Torrhen's Square | 托伦方城 | 306 | 560 |  |
| cerwyn | Castle Cerwyn | 赛文城 | 390 | 530 |  |
| hornwood | Hornwood | 霍伍德城 | 470 | 540 |  |
| widows-watch | Widow's Watch | 寡妇望 | 568 | 546 |  |
| white-harbor | White Harbor | 白港 | 450 | 594 | registry; White Knife mouth |
| long-lake | Long Lake (centre) | 长湖 | 392 | 566 | lake |
| barrowton | Barrowton | 古冢镇 | 296 | 616 |  |
| moat-cailin | Moat Cailin | 卡林湾 | 360 | 664 | registry; N end of the Neck |
| greywater-watch | Greywater Watch | 灰水望 | 344 | 708 | in the Neck |
| sea-dragon-point | Sea Dragon Point (tip) | 海龙角 | 148 | 468 |  |
| cape-kraken | Cape Kraken (tip) | 海怪角 | 212 | 702 |  |
| skagos | Skagos (centre) | 斯卡格斯岛 | 594 | 345 |  |

### Iron Islands

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| pyke | Pyke | 派克城 | 192 | 806 | registry |
| great-wyk | Great Wyk (centre) | 大威克岛 | 162 | 768 |  |
| old-wyk | Old Wyk (centre) | 老威克岛 | 200 | 762 |  |
| harlaw | Harlaw (centre) | 哈尔洛岛 | 232 | 790 |  |
| orkmont | Orkmont (centre) | 奥克蒙岛 | 186 | 738 |  |
| blacktyde | Blacktyde (centre) | 黑潮岛 | 222 | 734 |  |
| saltcliffe | Saltcliffe (centre) | 盐崖岛 | 156 | 808 |  |

### Riverlands

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| the-twins | The Twins | 孪河城 | 352 | 758 | registry; Green Fork |
| seagard | Seagard | 海疆城 | 304 | 772 | on Ironman's Bay |
| raventree-hall | Raventree Hall | 鸦树城 | 318 | 806 | approx. |
| riverrun | Riverrun | 奔流城 | 322 | 846 | registry; Tumblestone/Red Fork |
| ruby-ford | Ruby Ford | 红宝石滩 | 428 | 822 | kingsroad crosses the Trident |
| crossroads-inn | Inn at the Crossroads | 十字路口客栈 | 424 | 842 |  |
| harrenhal | Harrenhal | 赫伦堡 | 402 | 866 | registry; N shore of Gods Eye |
| gods-eye | Gods Eye (centre) | 神眼湖 | 404 | 882 | lake |
| isle-of-faces | Isle of Faces | 千面屿 | 400 | 884 | registry |
| stoney-sept | Stoney Sept | 石堂镇 | 366 | 886 | approx. |
| maidenpool | Maidenpool | 女泉镇 | 484 | 864 | Bay of Crabs |
| trident-mouth | Mouth of the Trident | 三叉戟河口 | 484 | 834 |  |

### Westerlands

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| golden-tooth | Golden Tooth | 金牙城 | 282 | 848 | pass into the Riverlands |
| casterly-rock | Casterly Rock | 凯岩城 | 248 | 858 | registry |
| lannisport | Lannisport | 兰尼斯港 | 252 | 878 | registry |
| fair-isle | Fair Isle (centre) | 仙女岛 | 214 | 842 |  |
| crakehall | Crakehall | 克雷克赫 ◇ | 254 | 832 | approx. |
| banefort | Banefort | 斑林堡 | 276 | 808 | approx. |
| ashemark | Ashemark | 灰标城 ◇ | 276 | 872 | approx. |
| deep-den | Deep Den | 深穴城 | 300 | 906 | approx. |
| kayce | Kayce | 凯斯 ◇ | 236 | 904 | approx. |

### The Vale

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| bloody-gate | Bloody Gate | 血门 | 444 | 800 |  |
| the-eyrie | The Eyrie | 鹰巢城 | 480 | 788 | registry; on the Giant's Lance |
| gates-of-the-moon | Gates of the Moon | 月门堡 | 490 | 802 |  |
| gulltown | Gulltown | 海鸥镇 | 548 | 814 | registry |
| runestone | Runestone | 符文石城 | 598 | 780 | approx. |
| the-fingers | The Fingers (tip) | 五指半岛 | 640 | 724 |  |
| sisterton | Sisterton (Three Sisters) | 姐妹镇 | 568 | 652 |  |

### Crownlands

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| kings-landing | King's Landing | 君临 | 468 | 928 | registry; Blackwater mouth |
| rosby | Rosby | 罗斯比城 | 482 | 916 | approx. |
| duskendale | Duskendale | 暮谷镇 | 508 | 908 | approx. |
| crackclaw-point | Crackclaw Point (centre) | 蟹爪半岛 | 556 | 886 |  |
| dragonstone | Dragonstone | 龙石岛 | 600 | 926 | registry |
| driftmark | Driftmark (centre) | 潮头岛 | 570 | 944 |  |
| claw-isle | Claw Isle (centre) | 爪岛 | 602 | 878 |  |
| blackwater-mouth | Mouth of the Blackwater Rush | 黑水河口 | 468 | 935 |  |

### The Reach

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| bitterbridge | Bitterbridge | 苦桥 | 420 | 1000 | Mander crossing of the Roseroad |
| longtable | Longtable | 长桌厅 | 392 | 976 | approx. |
| goldengrove | Goldengrove | 金树城 | 364 | 1018 | approx. |
| highgarden | Highgarden | 高庭 | 330 | 1062 | registry; on the Mander |
| horn-hill | Horn Hill | 角陵 | 290 | 1100 | approx. |
| brightwater-keep | Brightwater Keep | 亮水城 | 262 | 1072 | approx. |
| ashford | Ashford | 灰烬镇 | 396 | 1100 | approx. |
| oldtown | Oldtown | 旧镇 | 222 | 1130 | registry; head of Whispering Sound |
| three-towers | Three Towers | 三塔堡 | 248 | 1204 | approx. |
| arbor | The Arbor (centre) | 青亭岛 | 146 | 1186 |  |
| shield-islands | Shield Islands (middle) | 盾牌列岛 | 188 | 1002 |  |
| mander-mouth | Mouth of the Mander | 曼德河口 | 236 | 1008 |  |

### Stormlands

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| storms-end | Storm's End | 风息堡 | 526 | 1026 | registry; Shipbreaker Bay |
| bronzegate | Bronzegate | 铜门城 | 494 | 1006 | approx. |
| kingswood | Kingswood (centre) | 御林 | 494 | 976 |  |
| griffins-roost | Griffin's Roost | 狮鹫栖息地 | 596 | 1062 | approx. |
| rain-house | Rain House | 雨屋 | 618 | 1092 | approx.; Cape Wrath |
| cape-wrath | Cape Wrath (centre) | 怒角 | 600 | 1090 |  |
| evenfall-hall | Evenfall Hall (Tarth) | 暮临厅 | 658 | 1054 |  |
| greenstone | Greenstone (Estermont) | 绿石堡 | 646 | 1126 |  |
| summerhall | Summerhall | 盛夏厅 | 480 | 1110 | ruin |
| nightsong | Nightsong | 夜歌城 | 372 | 1146 | Dornish Marches, approx. |
| blackhaven | Blackhaven | 黑港城 | 420 | 1132 | Dornish Marches, approx. |
| stonehelm | Stonehelm | 石盔城 | 484 | 1148 | guards the Boneway, approx. |

### Dorne

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| princes-pass | Prince's Pass | 亲王隘口 | 318 | 1184 |  |
| skyreach | Skyreach / Kingsgrave | 天及城 / 王墓 | 322 | 1196 | approx. |
| boneway | Boneway (summit) | 骸骨路 | 488 | 1162 |  |
| starfall | Starfall | 星坠城 | 292 | 1222 | Torrentine mouth |
| yronwood | Yronwood | 铁木城 | 430 | 1186 | approx. |
| wyl | Wyl | 威尔 | 470 | 1172 | approx. |
| sandstone | Sandstone | 沙石城 | 362 | 1260 | approx. |
| hellholt | Hellholt | 地狱堡 | 414 | 1246 | approx. |
| vaith | Vaith | 维斯 | 404 | 1274 | approx. |
| godsgrace | Godsgrace | 神恩城 | 482 | 1242 | Greenblood confluence |
| salt-shore | Salt Shore | 盐滨城 | 520 | 1314 | approx. |
| planky-town | Planky Town | 木板镇 | 598 | 1262 | Greenblood mouth |
| water-gardens | Water Gardens | 流水花园 | 598 | 1286 |  |
| sunspear | Sunspear | 阳戟城 | 614 | 1280 | registry |
| broken-arm | Broken Arm (tip) | 断臂角 ◇ | 684 | 1210 |  |
| bloodstone | Bloodstone (Stepstones) | 血石岛 ◇ | 737 | 1190 |  |

### Free Cities

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| braavos | Braavos | 布拉佛斯 | 752 | 636 | registry |
| lorath | Lorath | 洛拉斯 | 962 | 528 | registry |
| pentos | Pentos | 潘托斯 | 806 | 848 | registry |
| norvos | Norvos | 诺佛斯 | 934 | 746 | registry; on the Noyne |
| qohor | Qohor | 科霍尔 | 1078 | 774 | registry |
| forest-of-qohor | Forest of Qohor (centre) | 科霍尔森林 | 1020 | 760 |  |
| myr | Myr | 密尔 | 894 | 1002 | registry |
| tyrosh | Tyrosh | 泰洛西 | 776 | 1100 | registry |
| lys | Lys | 里斯 | 814 | 1256 | registry |
| disputed-lands | Disputed Lands (centre) | 争议之地 | 846 | 1150 |  |
| ghoyan-drohe | Ghoyan Drohe | 戈延·卓赫 ◇ | 982 | 870 | ruin; Noyne joins the Rhoyne |
| ar-noy | Ar Noy | 阿·诺伊 ◇ | 992 | 930 | ruin; Qhoyne joins |
| chroyane | Chroyane | 克罗扬 ◇ | 1006 | 980 | ruin; the Sorrows |
| selhorys | Selhorys | 塞尔霍利斯 | 1030 | 1058 | registry |
| valysar | Valysar | 瓦利萨 ◇ | 1044 | 1118 |  |
| volon-therys | Volon Therys | 沃隆·塞利斯 ◇ | 1050 | 1166 |  |
| volantis | Volantis | 瓦兰提斯 | 1058 | 1206 | registry; Rhoyne mouth |

### Valyria & Ghis

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| mantarys | Mantarys | 曼塔里斯 ◇ | 1150 | 1236 | on the Demon Road, approx. |
| valyria | Valyria | 瓦雷利亚 | 1130 | 1424 | registry |
| isle-of-cedars | Isle of Cedars (centre) | 雪松岛 | 1222 | 1430 |  |
| new-ghis | New Ghis (centre) | 新吉斯 | 1248 | 1352 |  |
| old-ghis | Old Ghis (ruins) | 古吉斯 | 1316 | 1410 | approx. |
| astapor | Astapor | 阿斯塔波 | 1338 | 1318 | registry |
| yunkai | Yunkai | 渊凯 | 1424 | 1226 | registry |
| meereen | Meereen | 弥林 | 1350 | 1142 | registry; Skahazadhan mouth |

### Eastern Essos

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| vaes-dothrak | Vaes Dothrak | 维斯·多斯拉克 | 1560 | 764 | registry |
| mother-of-mountains | Mother of Mountains | 群山之母 | 1564 | 726 |  |
| womb-of-the-world | Womb of the World | 世界之子宫 | 1584 | 788 | lake |
| lhazar | Lhazar (centre) | 拉札 | 1560 | 1110 |  |
| vaes-tolorro | Vaes Tolorro | 维斯·托罗若 ◇ | 1720 | 1300 | in the Red Waste |
| qarth | Qarth | 魁尔斯 | 1914 | 1514 | registry |
| bone-mountains | Bone Mountains (centre) | 骸骨山脉 | 2080 | 900 |  |
| yin | Yin (Yi Ti) | 殷城 | 2480 | 1180 | registry |
| asshai | Asshai | 亚夏 | 2796 | 1570 | registry |
| great-moraq | Great Moraq (centre) | 大莫拉克岛 ◇ | 2310 | 1590 |  |
| leng | Leng (centre) | 冷岛 ◇ | 2672 | 1740 |  |
| ibben | Ibben (centre) | 伊班 | 1680 | 282 |  |
| port-of-ibben | Port of Ibben | 伊班港 | 1694 | 332 | registry |

### South

| id | English | 中文 | x | y | note |
|---|---|---|---:|---:|---|
| tall-trees-town | Tall Trees Town (Jhala) | 高树镇 | 440 | 1508 | registry |
| walano | Walano (centre) | 瓦拉诺岛 ◇ | 522 | 1560 |  |
| omboru | Omboru (centre) | 欧姆波鲁岛 ◇ | 612 | 1528 |  |
| naath | Naath (centre) | 纳斯 | 880 | 1700 |  |
| basilisk-isles | Basilisk Isles (centre) | 蛇蜥群岛 | 1000 | 1650 |  |
| isle-of-tears | Isle of Tears (centre) | 泪之岛 ◇ | 1150 | 1562 |  |
| basilisk-point | Basilisk Point (Sothoryos) | 蛇蜥角 ◇ | 1012 | 1744 |  |

### Seas, bays and straits (label points; all water)

| id | English | 中文 | x | y |
|---|---|---|---:|---:|
| narrow-sea | The Narrow Sea | 狭海 | 676 | 800 |
| sunset-sea | Sunset Sea | 日落之海 | 64 | 1180 |
| summer-sea | The Summer Sea | 夏日之海 | 880 | 1450 |
| shivering-sea | The Shivering Sea | 颤抖海 | 1100 | 300 |
| jade-sea | The Jade Sea | 玉海 | 2480 | 1500 |
| bay-of-ice | Bay of Ice | 寒冰湾 ◇ | 226 | 300 |
| bay-of-seals | Bay of Seals | 海豹湾 | 530 | 300 |
| the-bite | The Bite | 咬人湾 ◇ | 510 | 660 |
| blazewater-bay | Blazewater Bay | 炽水湾 ◇ | 196 | 520 |
| ironmans-bay | Ironman's Bay | 铁民湾 | 262 | 750 |
| bay-of-crabs | Bay of Crabs | 螃蟹湾 | 530 | 846 |
| blackwater-bay | Blackwater Bay | 黑水湾 | 528 | 934 |
| shipbreaker-bay | Shipbreaker Bay | 破船湾 | 580 | 1016 |
| straits-of-tarth | Straits of Tarth | 塔斯海峡 ◇ | 650 | 1086 |
| sea-of-dorne | Sea of Dorne | 多恩海 | 566 | 1162 |
| whispering-sound | Whispering Sound | 低语湾 ◇ | 176 | 1132 |
| redwyne-straits | Redwyne Straits | 雷德温海峡 ◇ | 172 | 1218 |
| slavers-bay | Slaver's Bay | 奴隶湾 | 1330 | 1226 |
| gulf-of-grief | Gulf of Grief | 悲伤湾 | 1240 | 1290 |
| smoking-sea | The Smoking Sea | 烟海 | 1128 | 1386 |
| bay-of-lorath | Bay of Lorath | 洛拉斯湾 ◇ | 960 | 560 |
| straits-of-qarth | Jade Gates | 玉门 | 1960 | 1540 |

## 5. Known approximations / open questions

* Scale follows the Wall (300 mi). If you prefer GRRM's "Westeros ≈ 3,000 miles long", multiply distances by ~1.4 — positions don't change.
* Minor river courses (Milkwater, Cockleswhent, Blueburn, Wendwater, Fever River, Broken Branch) and the far east (Bone Mountains' shape,
  Mountains of the Morn, Yi Ti, Leng, Great Moraq, Sothoryos) are schematic.
* Tall Trees Town is placed on Jhala; Duskendale on the north shore of Blackwater Bay near Rosby; Isle of Cedars at the mouth of the Gulf of
  Grief; Estermont off Cape Wrath's south tip. Correct here (and in geo.js) if a better source says otherwise.
