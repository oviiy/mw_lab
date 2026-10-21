'use strict';
/* 漂流日志 · 数据表 */

const ITEMS = {
  canned:   { n: '罐头',       i: '🥫', kg: .5,  cat: 'food', food: 35 },
  biscuit:  { n: '压缩饼干',   i: '🍪', kg: .3,  cat: 'food', food: 18 },
  peaches:  { n: '黄桃罐头',   i: '🍑', kg: .5,  cat: 'food', food: 20, mor: 12 },
  fish:     { n: '生鱼',       i: '🐟', kg: .6,  cat: 'food', food: 12, mor: -6, rot: true },
  cfish:    { n: '烤鱼',       i: '🍢', kg: .5,  cat: 'food', food: 35, mor: 6 },
  veg:      { n: '蔬菜',       i: '🥬', kg: .4,  cat: 'food', food: 18, mor: 3 },
  soup:     { n: '热鱼汤',     i: '🍲', kg: .6,  cat: 'food', food: 50, mor: 14 },
  cola:     { n: '可乐',       i: '🥤', kg: .4,  cat: 'food', food: 2, drink: 15, mor: 8 },
  bottle:   { n: '瓶装水',     i: '💧', kg: 1.5, cat: 'water', L: 1.5 },
  jug:      { n: '10L 水桶',   i: '🛢️', kg: 10,  cat: 'water', L: 10 },
  plank:    { n: '原木',       i: '🪵', kg: 3,   cat: 'build' },
  rope:     { n: '缆绳',       i: '🪢', kg: 1,   cat: 'build' },
  nails:    { n: '钉子',       i: '🔩', kg: .5,  cat: 'build' },
  tarp:     { n: '防水布',     i: '⛺', kg: 1.5, cat: 'build' },
  glass:    { n: '玻璃板',     i: '🪟', kg: 2,   cat: 'build' },
  metal:    { n: '金属件',     i: '🔧', kg: 2,   cat: 'build' },
  parts:    { n: '机械零件',   i: '⚙️', kg: 1,   cat: 'build' },
  net:      { n: '渔网',       i: '🕸️', kg: 2,   cat: 'build' },
  seeds:    { n: '菜种',       i: '🌱', kg: .1,  cat: 'build' },
  float:    { n: '浮桶',       i: '🛟', kg: 4,   cat: 'build', buoy: 25 },
  panel:    { n: '太阳能组件', i: '🔆', kg: 6,   cat: 'energy' },
  battery:  { n: '蓄电池',     i: '🔋', kg: 2,   cat: 'energy' },
  diesel:   { n: '柴油',       i: '⛽', kg: 5,   cat: 'energy' },
  harpoon:  { n: '鱼叉',       i: '🔱', kg: 3,   cat: 'defense' },
  medkit:   { n: '急救包',     i: '⛑️', kg: 1,   cat: 'med', heal: 40 },
  vitamins: { n: '维生素',     i: '💊', kg: .2,  cat: 'med', heal: 10, mor: 5 },
  cart:     { n: '手推车',     i: '🛒', kg: 0,   cat: 'tool', cap: 14 },
};

// 城市（地图坐标 1000×640，海在下方）。deliver=可送货到码头
const DISTRICTS = [
  { id: 'market',   n: '海滨集市', i: '🐠', x: 170, y: 520, flood: 180, roof: '#c9733f', deliver: false,
    items: [['fish', 8, 8], ['veg', 6, 8], ['seeds', 20, 4], ['cola', 5, 6], ['net', 45, 2]] },
  { id: 'shipyard', n: '船厂',     i: '⚓', x: 700, y: 488, flood: 300, roof: '#3f7f9a', deliver: true, disc: true,
    items: [['plank', 18, 16], ['float', 45, 6], ['rope', 15, 10], ['tarp', 25, 6]] },
  { id: 'tackle',   n: '渔具店',   i: '🎣', x: 880, y: 420, flood: 360, roof: '#4f8f5a', deliver: false, disc: true,
    items: [['net', 40, 3], ['rope', 15, 6], ['harpoon', 70, 3], ['float', 50, 3]] },
  { id: 'hardware', n: '五金店',   i: '🧰', x: 290, y: 350, flood: 420, roof: '#b5523d', deliver: true,
    items: [['cart', 60, 1], ['plank', 22, 10], ['nails', 10, 10], ['metal', 25, 8], ['parts', 35, 8], ['glass', 30, 4], ['panel', 180, 2]] },
  { id: 'super',    n: '超市',     i: '🛒', x: 600, y: 280, flood: 510, roof: '#d6a23c', deliver: true,
    items: [['canned', 15, 20], ['biscuit', 8, 14], ['peaches', 20, 4], ['bottle', 6, 20], ['jug', 40, 6], ['cola', 5, 8]] },
  { id: 'pharmacy', n: '药房',     i: '💊', x: 845, y: 225, flood: 540, roof: '#3fa08a', deliver: false,
    items: [['medkit', 60, 3], ['vitamins', 25, 4]] },
  { id: 'gas',      n: '加油站',   i: '⛽', x: 200, y: 200, flood: 1e9, roof: '#c4473b', deliver: false,
    items: [['diesel', 30, 6], ['battery', 50, 4], ['parts', 40, 3], ['cola', 6, 6]] },
];
const DOCK = { id: 'dock', n: '码头', i: '⛵', x: 470, y: 590 };
// 海平面曲线：[准备开始后的分钟, 海岸线 y]
const SEA_CURVE = [[0, 612], [180, 520], [300, 486], [360, 418], [420, 348], [510, 278], [540, 222], [600, 190]];
const DELIVERY_FEE = 30, DELIVERY_UNTIL = 360; // 14:00 后司机都跑了

const CHARS = [
  { id: 'docker', n: '码头工',   i: '🧔', cash: 720, cap: 18, desc: '背包 18kg（常人 12kg）<br>在码头组装设施只需一半时间<br>建造不耗体力' },
  { id: 'diver',  n: '潜水教练', i: '🤿', cash: 850, cap: 12, desc: '生命归零时可复苏一次<br>海图节点收获 +30%' },
  { id: 'rider',  n: '外卖骑手', i: '🛵', cash: 650, cap: 12, desc: '城市移动耗时 -40%<br>开局自带 1 块蓄电池' },
];

// 设施。c=材料 kg=重量 w=耗电 t=码头组装耗时(分钟)
const FAC = {
  deck:     { n: '扩建甲板',   i: '🟫', c: { plank: 2, rope: 1 }, kg: 0, t: 15, d: '+1 格甲板（+15kg 浮力）' },
  storage:  { n: '储物箱',     i: '📦', c: { plank: 2, nails: 1 }, kg: 3, t: 20, d: '保护 40kg 物资不被浪冲走' },
  rain:     { n: '雨水收集器', i: '☔', c: { plank: 1, tarp: 1 }, kg: 2, t: 20, d: '下雨时收集淡水（暴雨 ×2）' },
  still:    { n: '蒸馏器',     i: '🔺', c: { plank: 1, glass: 1 }, kg: 3, t: 20, d: '晴天用阳光把海水蒸成淡水' },
  netf:     { n: '渔网',       i: '🕸️', c: { net: 1, rope: 1 }, kg: 2, t: 15, d: '挂在筏边被动捕鱼，约 2 条/天' },
  planter:  { n: '种植箱',     i: '🌿', c: { plank: 2, seeds: 1 }, kg: 5, t: 25, d: '消耗少量淡水，约 30 小时产 2 份菜' },
  stove:    { n: '油桶炉',     i: '🔥', c: { metal: 2 }, kg: 8, t: 25, d: '解锁烹饪：烤鱼 / 热鱼汤' },
  solar:    { n: '太阳能板',   i: '🔆', c: { panel: 1 }, kg: 6, t: 20, d: '白天发电，晴天 60W' },
  wind:     { n: '风力机',     i: '🌀', c: { parts: 2, tarp: 1, metal: 1 }, kg: 7, t: 35, d: '风越大越强，风暴可达 120W，可能被吹坏' },
  pedal:    { n: '脚踏发电机', i: '🚲', c: { parts: 1, metal: 1 }, kg: 6, t: 25, d: '解锁「脚踏发电」：体力换电' },
  batt:     { n: '电池组',     i: '🔋', c: { battery: 2 }, kg: 4, t: 15, d: '+400Wh 储能' },
  purifier: { n: '净水机',     i: '🚰', c: { parts: 2, metal: 1 }, kg: 6, w: 40, t: 30, d: '耗电 40W，昼夜稳定产淡水' },
  diesel:   { n: '柴油机',     i: '🏭', c: { parts: 2, metal: 2 }, kg: 12, t: 35, d: '电不够时自动启动 150W，耗柴油' },
  lamp:     { n: '马灯',       i: '🏮', c: { glass: 1, battery: 1 }, kg: 1, w: 10, t: 10, d: '夜里亮着能稳住士气，耗电 10W' },
  fence:    { n: '防护栏',     i: '🚧', c: { plank: 1, nails: 1 }, kg: 3, hp: 80, t: 15, d: '黑潮兽先啃它；相邻甲板受伤 -60%' },
  turret:   { n: '鱼叉炮',     i: '🔱', c: { harpoon: 1, parts: 1, metal: 1 }, kg: 8, w: 20, t: 30, d: '夜里自动射击黑潮兽，耗电 20W' },
  sail:     { n: '船帆',       i: '⛵', c: { tarp: 2, rope: 2 }, kg: 4, t: 25, d: '海图每天多 1 个可选目的地' },
};
const BUILD_ORDER = ['deck', 'storage', 'rain', 'still', 'netf', 'planter', 'stove', 'solar', 'wind', 'pedal', 'batt', 'purifier', 'diesel', 'lamp', 'fence', 'turret', 'sail'];

const BOTTLES = {
  shipyard: { n: '船厂早上打折',   d: '12:00 前船厂、渔具店 -30%' },
  tide:     { n: '我记得涨潮的时间', d: '所有区域晚 1 小时被淹' },
  cash:     { n: '多存点钱',       d: '开局现金 +$250' },
  buoy:     { n: '别贪',           d: '甲板浮力 +20%' },
  light:    { n: '黑潮怕光',       d: '亮着的马灯会灼伤附近的黑潮兽' },
  rainx:    { n: '雨会来的',       d: '雨水收集器产量 ×2' },
  fishing:  { n: '我学会了钓鱼',   d: '钓鱼和渔网收获 +50%' },
  storm:    { n: '风暴前加固',     d: '风暴对甲板的伤害 -40%' },
  oldwood:  { n: '码头的旧木头',   d: '开局木筏多 3 格甲板' },
  thirst:   { n: '先喝水',         d: '水分下降速度 -20%' },
};

const NODES = {
  rooftop:    { n: '楼顶废墟',   i: '🏚️', d: '翻找建材和罐头' },
  container:  { n: '漂浮集装箱', i: '📦', d: '好东西很多，但铁皮的回响会惊动黑潮兽' },
  lighthouse: { n: '灯塔',       i: '🗼', d: '今夜无袭击，士气 +15' },
  survivors:  { n: '幸存者筏',   i: '🙋', d: '救下船员：多 2 格甲板，但每天要分口粮' },
  fishing:    { n: '渔场',       i: '🐟', d: '海鸟盘旋的地方，鱼很多' },
  stormfront: { n: '风暴边缘',   i: '⛈️', d: '必遇风暴，但能接满雨水' },
  ark:        { n: '方舟',       i: '🚢', d: '传说中的方舟。抵达即获救。' },
};
const CREW_ROLES = [{ r: '渔夫', d: '捕鱼 +50%' }, { r: '厨师', d: '熟食士气 +5' }, { r: '机械师', d: '发电 +25%' }];
const NAMES = ['阿海', '小鸥', '老陈', '林姐', '阿北', '小满', '周叔', '晴晴'];
const TIDE_NIGHTS = [3, 6, 9, 12];
const WEATHER = { sun: '☀️', cloud: '⛅', rain: '🌧️', storm: '⛈️', fog: '🌫️' };
const WNAME = { sun: '晴', cloud: '多云', rain: '雨', storm: '暴风雨', fog: '浓雾' };

/* ===== v3 追加内容 ===== */
const DIFFS = {
  easy:   { n: '休闲', d: '黑潮兽更少更弱、风暴更温和、身体消耗更慢，现金 +15%', mon: .6, hp: .8, decay: .8, cash: 1.15, storm: .6 },
  normal: { n: '标准', d: '设计中的体验', mon: 1, hp: 1, decay: 1, cash: 1, storm: 1 },
  hard:   { n: '困难', d: '黑潮兽更多更凶，消耗更快，现金 -10%', mon: 1.4, hp: 1.25, decay: 1.15, cash: .9, storm: 1.2 },
};
// 黑潮兽种类：hp 倍率 / 速度 / 啃咬伤害 / 最早出现天数
const MONSTERS = {
  eater: { n: '蚀木者', d: '最常见。成群结队地啃木头。', hp: 1, spd: .035, bite: .3, from: 1 },
  eel:   { n: '跃鳗',   d: '又细又快，血少，专挑落单的甲板。', hp: .6, spd: .07, bite: .22, from: 3 },
  shell: { n: '甲壳兽', d: '慢，但很硬。鱼叉要刺很多下。', hp: 2.2, spd: .02, bite: .5, from: 5 },
};
const ACHIEVEMENTS = {
  night1:   { n: '第一夜',     d: '活过漂流的第一夜', i: '🌙' },
  tide1:    { n: '潮退之后',   d: '活过第一个大潮夜', i: '🌊' },
  day7:     { n: '一周',       d: '漂流满 7 天', i: '📅' },
  ark:      { n: '方舟',       d: '抵达方舟', i: '🚢' },
  keeper:   { n: '守灯人',     d: '修好灯塔并留了下来', i: '🗼' },
  hardark:  { n: '怒海余生',   d: '在困难难度抵达方舟', i: '🏆' },
  fisher:   { n: '老渔夫',     d: '一局内收获 25 条鱼', i: '🎣' },
  hunter:   { n: '鱼叉手',     d: '一局内击退 20 只黑潮兽', i: '🔱' },
  builder:  { n: '造船匠',     d: '一局内建造 15 个设施', i: '🔨' },
  captain:  { n: '船长',       d: '同时拥有 3 名船员', i: '🙋' },
  chef:     { n: '海上厨房',   d: '一局内做出 8 份热鱼汤', i: '🍲' },
  swift:    { n: '未雨绸缪',   d: '在 15:00 之前就启航，并且活过第一个大潮夜', i: '⏱️' },
  bottles:  { n: '写给自己的信', d: '同时拥有 5 个漂流瓶', i: '🍾' },
};
// 准备阶段的随机事件（每局每个最多一次）
const PREP_EVENTS = [
  { id: 'shopkeeper', at: ['super', 'hardware'], cond: S => S.t1 < 420, title: '慌张的店主',
    text: '店主老周满头大汗：“小伙子，帮我把货搬上卡车吧，我女儿还在城北……我送你一箱罐头。”',
    opts: [{ n: '帮他搬（30 分钟）', f: S => { S.bag.canned = (S.bag.canned || 0) + 4; return { mins: 30, msg: '老周塞给你 4 个罐头，开着卡车走了。' }; } },
           { n: '没时间了', f: () => ({ mins: 0, msg: '你摇摇头，转身走进货架之间。' }) }] },
  { id: 'crowd', at: ['super', 'pharmacy'], cond: S => S.t1 >= 330, title: '抢购的人群',
    text: '门口挤满了人，有人在喊“海上要出事了”。排队至少要四十分钟。后门有个店员，冲你搓了搓手指。',
    opts: [{ n: '塞给他 $25 走后门', cond: S => S.cash >= 25, f: S => { S.cash -= 25; return { mins: 5, msg: '店员把你领进了仓库。' }; } },
           { n: '老实排队（40 分钟）', f: () => ({ mins: 40, msg: '你终于挤进了门。' }) }] },
  { id: 'neighbor', at: ['dock'], cond: S => S.t1 >= 240, title: '邻居林姐',
    text: '林姐抱着一个旧保温箱站在码头上：“我看见你在搬东西……你是不是知道些什么？能带上我吗？我会做饭。”',
    opts: [{ n: '带上她', f: S => { S.preCrew = true; S.stock.canned = (S.stock.canned || 0) + 2; return { mins: 0, msg: '林姐成了你的第一个船员（厨师）。她带来了 2 个罐头——但以后每天要分她一份口粮。' }; } },
           { n: '木筏太小了', f: () => ({ mins: 0, msg: '林姐点点头，没再说什么。' }) }] },
  { id: 'kid', at: ['market', 'tackle'], cond: S => S.t1 < 300, title: '迷路的孩子',
    text: '一个小男孩在摊位间哭着找妈妈。你记得——上一次，没有人管他。',
    opts: [{ n: '陪他找妈妈（25 分钟）', f: S => { S.morBonus = (S.morBonus || 0) + 15; return { mins: 25, msg: '他妈妈抱着他哭了。你心里踏实了一点（漂流开局士气 +15）。' }; } },
           { n: '指给他保安亭的方向', f: () => ({ mins: 0, msg: '你指了指远处。希望他能找到。' }) }] },
];
// 电台：漂流途中断断续续收到的广播（推进故事、暗示方舟）
const RADIO = {
  2:  '📻 沙沙……“这里是……海岸警卫……所有幸存者……不要靠近发光的水域……”',
  4:  '📻 一个女声：“……如果有人听到……我们是‘方舟’号……我们在东边……一直往东……”',
  7:  '📻 “……方舟号广播……我们还在……第十二天前后会经过旧航道……保持灯亮着……”',
  10: '📻 “……我们看到了一些木筏的灯……再坚持一下……”',
  12: '📻 “这里是方舟。我们看见你了。”',
};
