// Names, lines and the 海克斯 augments live here so the cast can change without touching game code.

export const TITLE = '京龟大闹潘家园儿';
export const SUBTITLE = '北京龟 · 胡同大乱斗';
export const HERO = '龟';
export const HUBBY = '蔡博'; // her teammate
export const WAVES = 14;

export const ENEMY_NAMES = {
  durian: '小榴莲', oyster: '往昔蚝', goat: '徐山羊', dingding: '丁丁', orange: '橘子', ginger: '姜饼人', caesar: 'Caesar', chenwei: '陈伟',
  jia: '甲方', yi: '乙方', guo: '果哥', thief: '吴浩然', mao: '大毛', maoqiu: '小毛球',
  bigmao: '大毛（超大号）', judge: '沉毅羊（法官）', finaljudge: '沉毅羊（终审）',
};

export const SHOUTS = {
  jia: ['谁问你了', '谁问你了？', '谁问你了！！'],
  yi: ['啊对对对', '好好好', '你说得都对'],
  guo: ['？', '？？？', '你在干嘛'],
  judge: ['肃静！', '驳回！', '本庭宣判：龟太甜了！', '没人通知你？那是你的事！'],
  thief: ['嘿嘿，糖葫芦归我了', '熊来了！', '溜了溜了'],
  // 大毛 is a 白色相簿2 fan and talks about 雪菜 in Japanese
  mao: ['なんでそんなに慣れてんだよ！', '雪菜…', 'せつなっ！', '届かない恋…', '又到了白色相簿的季节'],
  caili: ['彩礼38.8W！', '彩礼38.8W，少一分不行'],
  goat: ['腊肠攻击！'],
  dingding: ['顶级顶级！', '顶级顶级', '抱抱！', '丁丁！', '再来一遍！'],
  orange: ['橘子来了！', '橘子来了！！'],
  caesar: ['我来，我见，我征服', 'Veni, vidi, vici', '罗马不是一天建成的'],
  chenwei: ['Fire in the hole!', 'Enemy spotted', 'Go go go!', 'Counter-Terrorists win'],
  ginger: ['你抓不到我！', '跑跑跑，抓不到我～', '我是姜饼人！'],
  oyster: ['想当年……', '往昔不再'],
};

export const Q = {
  idle: ['你的龟昨天晚上风好大', '我觉得姆巴佩没有问题', '得嘞，走着！', '嘛呢这是？', '姐们儿今儿状态倍儿好', '您瞧好吧！', '这把我C', '黄房上没人', '龟今天手感来了！', '排好队，一个一个来！'],
  afk: ['刚和阿姨说话去了', '刚和阿姨说话去了，回来了回来了'],
  hit: ['我箭中了！我箭中了！', '我箭中了！'],
  multi: ['打死你们这些廊坊娃！', '一个都别跑！', '来一个我收一个！', '都别走，龟还没打够呢！'],
  hurt: ['哎哟喂！', '没人通知我这儿有怪！', '谁打我？！', '嘿，您这就不地道了', '你们是不是生活不如意啊', '你们再这样我退游了'],
  life: ['你们是不是生活不如意啊', '你们是不是生活不如意啊？'],
  spawnNear: ['没人通知我刷怪了！', '这怎么又来一波，没人通知我啊'],
  sweet: ['没人比我甜！'],
  voice: ['声音没我甜！'],
  bull: ['喜欢我的白牛吗？', '白牛！冲！'],
  bomb: ['他应该不会下包的', '下包了下包了'],
  hubby: ['蔡博！快来！', '队友！上！', '蔡博，救一下！'],
  wind: ['你的龟昨天晚上风好大……'],
  shield: ['你的龟决定关窗户睡觉了'],
  dodge: ['没打着～', '通知到了，躲开了'],
  waveStart: ['得嘞，下一波！', '来吧廊坊娃们', '我觉得姆巴佩没有问题', '橘子来了？', '我今天想喝血了', '这一波，龟亲自来！'],
  boss: ['沉毅羊法官？开庭了？没人通知我！'],
  bigmao: ['大毛？你怎么这么大一只！', '怎么下雪了？又到了白色相簿的季节'],
  horse: ['马背上的民族！'],
  bike: ['北京骑行夫妇！'],
  meteor: ['流星风暴！'],
  chief: ['女酋长的祝福！'],
  elite: ['精英怪？没人通知我！', '这个怎么金光闪闪的', '来了个狠的'],
  lowhp: ['龟要不行了，蔡博救我', '血不多了，稳住稳住', '没人通知我只剩这点血'],
  waveClear: ['这波稳了', '得嘞，收工', '还有谁？'],
  chest: ['大红宝箱！', '开箱开箱！'],
  tide: ['潮汐监狱？没人通知我涨潮！', '涨潮了涨潮了', '摸到大红就撤'],
  flash: ['我瞎了！陈伟你阴我', '闪光！没人通知我'],
  ult: ['超级蜘蛛！！', '超级蜘蛛，走你！'],
  dead: ['没人通知我啊！！', '这把不算，网卡了', '没人通知我团战？'],
};

// 海克斯 augments. Three tiers like ARAM: 白银 silver, 黄金 gold, 棱彩 prism.
// apply(s) edits the hero's stats in place; the game reads them every step.
export const AUGMENTS = [
  // 白银
  { id: 'douzhi', tier: 'silver', icon: '🥤', name: '豆汁儿续命', desc: '最大生命 +3，并回满', apply: (s) => { s.maxhp += 3; s.hp = s.maxhp; } },
  { id: 'hutong', tier: 'silver', icon: '🏃', name: '胡同串子', desc: '移动速度 +12%', apply: (s) => { s.speed *= 1.12; } },
  { id: 'arrow', tier: 'silver', icon: '🏹', name: '我箭中了', desc: '伤害 +20%', apply: (s) => { s.dmg *= 1.2; } },
  { id: 'magnet', tier: 'silver', icon: '🧲', name: '糖葫芦磁铁', desc: '拾取范围 +60%', apply: (s) => { s.pickup *= 1.6; } },
  { id: 'auntie', tier: 'silver', icon: '💚', name: '刚和阿姨说话去了', desc: '每 6 秒回 1 点血', apply: (s) => { s.regen += 1; } },
  { id: 'yellow', tier: 'silver', icon: '🎯', name: '黄房上没人', desc: '射程 +25%', apply: (s) => { s.range *= 1.25; } },
  { id: 'mbappe', tier: 'silver', icon: '⚽', name: '姆巴佩没有问题', desc: '攻速 +18%', apply: (s) => { s.rate *= 1.18; } },
  { id: 'armor', tier: 'silver', icon: '🛡️', name: '北京大妞', desc: '受到伤害 -15%', apply: (s) => { s.armor = Math.min(0.6, s.armor + 0.15); } },
  // 黄金
  { id: 'multi', tier: 'gold', icon: '🎆', name: '打死你们这些廊坊娃', desc: '每次多发射 1 枚子弹', apply: (s) => { s.count += 1; } },
  { id: 'pierce', tier: 'gold', icon: '🪡', name: '一箭穿糖', desc: '子弹穿透 +1', apply: (s) => { s.pierce += 1; } },
  { id: 'voice', tier: 'gold', icon: '🎤', name: '声音没我甜', desc: '每 5 秒甜嗓一声，震晕并伤害周围敌人', apply: (s) => { s.voice += 1; } },
  { id: 'bomb', tier: 'gold', icon: '💣', name: '他应该不会下包的', desc: '每 4 秒在脚下下个包，爆炸伤害', apply: (s) => { s.bomb += 1; } },
  { id: 'hubby', tier: 'gold', icon: '🤝', name: '叫队友', desc: '每 15 秒队友蔡博冲过来清一排怪', apply: (s) => { s.hubby += 1; } },
  { id: 'window', tier: 'gold', icon: '🪟', name: '你的龟决定关窗户睡觉了', desc: '每 10 秒获得一层护盾，挡一次伤害', apply: (s) => { s.shield += 1; } },
  { id: 'sweetest', tier: 'gold', icon: '🍬', name: '没人比我甜', desc: '暴击率 +20%，暴击伤害 ×2', apply: (s) => { s.crit += 0.2; } },
  { id: 'chief', tier: 'gold', icon: '👑', name: '女酋长的祝福', desc: '每波开始回满血，伤害 +15%', apply: (s) => { s.chief += 1; s.dmg *= 1.15; } },
  { id: 'meteor', tier: 'gold', icon: '☄️', name: '米拉娜的流星风暴', desc: '每 6 秒流星砸向附近的敌人', apply: (s) => { s.meteor += 1; } },
  { id: 'aegis', tier: 'gold', icon: '🛟', name: '不朽盾', desc: '死亡时原地复活一次', apply: (s) => { s.aegis += 1; } },
  // 棱彩
  { id: 'bull', tier: 'prism', icon: '🐂', name: '喜欢我的白牛吗', desc: '召唤白牛伙伴，来回冲撞敌人', apply: (s) => { s.bull += 1; } },
  { id: 'tide', tier: 'gold', icon: '🌊', name: '潮汐监狱越狱', desc: '每 12 秒放一道潮汐，冲走并伤害一整排敌人', apply: (s) => { s.tide += 1; } },
  { id: 'bike', tier: 'gold', icon: '🚲', name: '北京骑行夫妇', desc: '每 12 秒和蔡博骑双人自行车 5 秒：移速 ×1.9，撞飞敌人', apply: (s) => { s.bike += 1; } },
  { id: 'horse', tier: 'prism', icon: '🐎', name: '马背上的民族', desc: '每 10 秒周期出发骑马 4 秒：移速 ×1.7，撞飞敌人', apply: (s) => { s.horse += 1; } },
  { id: 'wind', tier: 'prism', icon: '🌪️', name: '你的龟昨天晚上风好大', desc: '身边环绕龙卷风，持续绞碎敌人', apply: (s) => { s.wind += 1; } },
  { id: 'ranked', tier: 'prism', icon: '⚡', name: '你的龟打排位打得好累', desc: '攻速 +60%，但移速 -10%', apply: (s) => { s.rate *= 1.6; s.speed *= 0.9; } },
  { id: 'notified', tier: 'prism', icon: '🔔', name: '没人通知我', desc: '25% 闪避，被打前总会有人通知你', apply: (s) => { s.dodge = Math.min(0.6, s.dodge + 0.25); } },
  { id: 'dahong', tier: 'prism', icon: '💎', name: '出大红了', desc: '经验 +50%，3 个大红环绕身边', apply: (s) => { s.xpMul *= 1.5; s.orbit += 3; } },
];

export const TIER_NAME = { silver: '白银', gold: '黄金', prism: '棱彩' };

export const BUILD_PATHS = {
  spider: '超级蜘蛛', bullet: '子弹火力', turtle: '环绕龟', hubby: '蔡博支援',
};

export const SHOP_UPGRADES = [
  { id: 'health', name: '结实开局', desc: '初始最大生命 +2', cost: 20, max: 5, apply: (s) => { s.maxhp += 2; s.hp += 2; } },
  { id: 'damage', name: '练习射击', desc: '初始伤害 +5%', cost: 25, max: 5, apply: (s) => { s.dmg *= 1.05; } },
  { id: 'rate', name: '提前热手', desc: '初始攻速 +4%', cost: 25, max: 5, apply: (s) => { s.rate *= 1.04; } },
  { id: 'spider', name: '蜘蛛预热', desc: '开局大招充能 +10', cost: 30, max: 5, apply: () => {} },
];

const pathOf = {
  arrow: 'bullet', multi: 'bullet', pierce: 'bullet', ranked: 'bullet', mbappe: 'bullet',
  wind: 'turtle', dahong: 'turtle', hubby: 'hubby', bike: 'hubby',
};
for (const a of AUGMENTS) if (pathOf[a.id]) a.path = pathOf[a.id];

AUGMENTS.push(
  { id: 'webReach', path: 'spider', tier: 'silver', icon: '🕸️', name: '蜘蛛撒网', desc: '超级蜘蛛范围 +25%', apply: (s) => { s.ultRange *= 1.25; } },
  { id: 'webCharge', path: 'spider', tier: 'gold', icon: '🕷️', name: '蛛丝蓄力', desc: '普通击杀的蜘蛛充能 +50%', apply: (s) => { s.ultCharge *= 1.5; } },
  { id: 'webPower', path: 'spider', tier: 'prism', icon: '💜', name: '毒蛛女王', desc: '蛛网持续伤害 +80%', apply: (s) => { s.ultDamage *= 1.8; } },
  { id: 'webEcho', path: 'spider', tier: 'gold', icon: '🪄', name: '蛛网余响', desc: '每次蜘蛛施放后，蛛网击杀最多返还 20 充能', apply: (s) => { s.ultEcho = true; } },
  { id: 'bulletPower', path: 'bullet', tier: 'gold', icon: '🔥', name: '穿甲火力', desc: '子弹伤害 +30%，穿透 +1', apply: (s) => { s.dmg *= 1.3; s.pierce += 1; } },
  { id: 'bulletStorm', path: 'bullet', tier: 'prism', icon: '🌠', name: '弹幕时间', desc: '额外 2 枚子弹，攻速 +20%', apply: (s) => { s.count += 2; s.rate *= 1.2; } },
  { id: 'turtleGuard', path: 'turtle', tier: 'silver', icon: '🐢', name: '小龟护卫', desc: '召唤 1 只环绕小龟', apply: (s) => { s.turtles += 1; } },
  { id: 'turtleSquad', path: 'turtle', tier: 'gold', icon: '🐢', name: '龟龟小队', desc: '再召唤 2 只环绕小龟', apply: (s) => { s.turtles += 2; } },
  { id: 'turtlePower', path: 'turtle', tier: 'prism', icon: '🛡️', name: '龟甲旋风', desc: '环绕小龟伤害翻倍', apply: (s) => { s.turtlePower *= 2; } },
  { id: 'hubbyQuick', path: 'hubby', tier: 'silver', icon: '⚡', name: '蔡博快来', desc: '蔡博支援冷却缩短 25%', apply: (s) => { s.hubby = Math.max(1, s.hubby); s.hubbyCooldown *= 0.75; } },
  { id: 'hubbyPower', path: 'hubby', tier: 'gold', icon: '🤜', name: '蔡博认真了', desc: '蔡博冲锋伤害翻倍', apply: (s) => { s.hubby = Math.max(1, s.hubby); s.hubbyPower *= 2; } },
  { id: 'hubbyStorm', path: 'hubby', tier: 'prism', icon: '🤝', name: '最佳搭档', desc: '蔡博支援更快、冲锋伤害 +50%', apply: (s) => { s.hubby = Math.max(1, s.hubby); s.hubbyCooldown *= 0.65; s.hubbyPower *= 1.5; } },
);

// One focused stat choice after each wave, before the 海克斯 choice.
export const STAT_UPGRADES = [
  { id: 'shots', icon: '🎯', name: '多一发', desc: '每次射击额外发射 1 枚子弹', available: (s) => s.count < 5, apply: (s) => { s.count += 1; } },
  { id: 'damage', icon: '💥', name: '火力训练', desc: '子弹伤害 +15%', apply: (s) => { s.dmg *= 1.15; } },
  { id: 'speed', icon: '⚡', name: '快手连射', desc: '攻击速度 +12%', apply: (s) => { s.rate *= 1.12; } },
  { id: 'health', icon: '❤️', name: '结实一点', desc: '最大生命 +3，并回复 3 点生命', apply: (s) => { s.maxhp += 3; s.hp = Math.min(s.maxhp, s.hp + 3); } },
  { id: 'regen', icon: '💚', name: '慢慢回血', desc: '每 6 秒额外恢复 1 点生命', available: (s) => s.regen < 4, apply: (s) => { s.regen += 1; } },
  { id: 'crit', icon: '✨', name: '找准要害', desc: '暴击率 +6%', available: (s) => s.crit < 0.5, apply: (s) => { s.crit += 0.06; } },
  { id: 'move', icon: '🏃', name: '脚下生风', desc: '移动速度 +8%', apply: (s) => { s.speed *= 1.08; } },
];

// Level-ups now give a small bonus straight away; 海克斯 are picked once per wave.
export const LEVEL_BONUS = [
  { text: '伤害 +8%', lateText: '伤害 +3%', apply: (s, late) => { s.dmg *= late ? 1.03 : 1.08; } },
  { text: '攻速 +7%', lateText: '攻速 +3%', apply: (s, late) => { s.rate *= late ? 1.03 : 1.07; } },
  { text: '移速 +4%', lateText: '移速 +2%', apply: (s, late) => { s.speed *= late ? 1.02 : 1.04; } },
  { text: '最大生命 +2', lateText: '最大生命 +1', apply: (s, late) => { const v = late ? 1 : 2; s.maxhp += v; s.hp += v; } },
  { text: '拾取范围 +15%', lateText: '拾取范围 +8%', apply: (s, late) => { s.pickup *= late ? 1.08 : 1.15; } },
  { text: '暴击 +4%', lateText: '暴击 +2%', apply: (s, late) => { s.crit += late ? 0.02 : 0.04; } },
  { text: '射程 +6%', lateText: '射程 +3%', apply: (s, late) => { s.range *= late ? 1.03 : 1.06; } },
];

// Things lying around the yard. Picking one up does something right away.
export const PICKUPS = {
  horse: { name: '马背上的民族', line: '马背上的民族！', w: 2 },
  bike: { name: '北京骑行夫妇', line: '北京骑行夫妇！', w: 2 },
  bull: { name: '白牛冲锋', line: '喜欢我的白牛吗？', w: 2 },
  meteor: { name: '米拉娜的流星风暴', line: '流星风暴！', w: 2 },
  chief: { name: '女酋长的祝福', line: '女酋长的祝福！', w: 1 },
  spider: { name: '蜘蛛之力', line: '超级蜘蛛充能！', w: 1 },
  douzhi: { name: '豆汁儿', line: '这豆汁儿，地道！', w: 2 },
  magnet: { name: '糖葫芦磁铁', line: '糖葫芦都过来！', w: 1 },
  chest: { name: '大红宝箱', line: '大红宝箱！', w: 0 },
};

export const ELITE_AFFIX = { frenzy: '狂暴的', tough: '坚韧的', split: '分裂的', boom: '爆炸的' };

// Dota-style kill streak calls for chains of kills without a break
export const STREAKS = [[10, '大杀特杀'], [20, '主宰比赛'], [30, '杀人如麻'], [45, '无人能挡'], [60, '变态杀戮'], [80, '妖怪般的杀戮'], [100, '如同神一般'], [130, '超神！']];

