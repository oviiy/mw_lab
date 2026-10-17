// Vaes Dothrak — bilingual content. Source codes: AGOT (Daenerys in Vaes Dothrak), TWOIAF, AWOIAF index.
const P = (en, zh) => ({ en, zh });
const L = (name, desc, tour, conf, refs, book, unknown, interp, spoiler) => ({
  name: P(...name), desc: P(...desc), tour: P(...tour), ...(spoiler ? { spoiler: P(...spoiler) } : {}),
  source: { confidence: conf, refs, book: P(...book), unknown: P(...unknown), interpretation: P(...interp) },
});

export default {
  id: 'vaes-dothrak',
  intro: {
    en: 'The only city of the Dothraki: no walls, a broad grassy godsway, and halls built for khalasars that are mostly away. Within it no blade may be carried and no free man\'s blood may be shed.',
    zh: '多斯拉克人唯一的城市：没有城墙，只有一条宽阔的草径神路，以及为常年在外的卡拉萨预备的殿宇。城内不得携带刀刃，也不得让自由人流血。',
  },
  notes: {
    en: 'From the books: the Horse Gate of two bronze stallions, the godsway lined with plundered monuments, the Western and Eastern Markets, the Womb of the World, the Mother of Mountains, the dosh khaleen, khals\' halls standing empty much of the year, and the ban on blades and bloodshed. Invented here: every position and distance, the buildings\' forms, the terrain and the scale. The geography is simplified.',
    zh: '书中可据：两匹青铜骏马构成的马门、陈列掠来古物的神路、西市与东市、世界之子宫、群山之母、多斯卡林、一年中大半空置的可汗殿宇，以及禁刃、禁止流血的戒律。本场景自拟：所有位置与距离、建筑形制、地形和比例。地理关系已作简化。',
  },
  tour: ['horse-gate', 'godsway-monuments', 'western-market', 'khals-halls', 'eastern-market', 'womb-of-the-world', 'dosh-khaleen-huts', 'mother-of-mountains'],
  sources: [
    { ref: 'agot', checked: 'memory', note: P('Daenerys\'s chapters in Vaes Dothrak (A Game of Thrones) are the main source; recalled, not re-read.', '主要依据《权力的游戏》中丹妮莉丝在维斯·多斯拉克的章节；凭记忆，未重读原文。') },
    { ref: 'awoiaf', checked: 'search-snippet', note: P('Search summaries of the wiki and the Westeros.org concordance: the Horse Gate (bronze stallions whose hooves meet about a hundred feet up in a pointed arch), the plundered godsway, the walled Western Market, eastern caravans at the Eastern Market, the ban on blades, tribute of salt, silver and seed to the dosh khaleen, and the rule that only men may set foot on the Mother of Mountains. Pages could not be fetched.', '经维基与 Westeros.org 词条索引的搜索摘要印证：马门（两匹青铜骏马的前蹄在约百尺高处相接，形成尖拱）、陈列掠来古物的神路、有围墙的西市、东市的东方商队、禁刃令、向多斯卡林献上盐、银与种子，以及群山之母只许男子踏足。页面本身无法打开。') },
    { ref: 'twoiaf', checked: 'not-accessed', note: P('Companion background on Dothraki customs was not consulted.', '未查阅《冰与火之歌：世界》中关于多斯拉克习俗的背景资料。') },
  ],
  landmarks: {
    'horse-gate': L(['Horse Gate', '马门'], ['Two colossal bronze stallions rear on either side of the godsway; their hooves meet high overhead in a pointed arch.', '两匹巨大的青铜骏马在神路两侧人立而起，前蹄在高空相接，形成一道尖拱。'], ['Riders enter the sacred city beneath the raised hooves of two bronze stallions.', '骑手从两匹青铜骏马高举的前蹄下进入圣城。'], 'high', ['agot', 'awoiaf'],
      ['A gate of two enormous rearing bronze stallions whose hooves meet about a hundred feet above the road, at the start of the godsway.', '神路起点处，两匹人立的巨大青铜骏马构成城门，前蹄在路面上方约百尺处相接。'], ['The statues\' exact proportions, base and appearance up close.', '雕像的确切比例、底座及近看的样貌。'], ['Anatomy and detailing are invented; the height is kept close to the stated figure.', '马的形体与细节为自拟；高度大致依书中数字。']),
    'godsway-monuments': L(['Godsway', '神路'], ['A broad grass road lined with statues, idols and stone kings carried off from conquered and dead cities.', '宽阔的草径，两旁立着从被征服、已湮灭的城市掠来的雕像、神像与石雕君王。'], ['Stolen gods and kings line the godsway: plunder from every land the Dothraki rode over.', '神路两旁尽是掠来的神祇与君王：多斯拉克铁蹄踏过之地的战利品。'], 'high', ['agot', 'awoiaf'],
      ['The road from the Horse Gate toward the Mother of Mountains is lined with plundered monuments from many lands.', '自马门通往群山之母的大道两旁，陈列着掠自诸多土地的古迹。'], ['Which monuments stand where, and in what order.', '各件古迹的具体位置与排列顺序。'], ['Generic obelisks, statues, columns and cairns, evenly spaced.', '以通用的方尖碑、雕像、石柱与石堆示意，等距排列。']),
    'western-market': L(['Western Market', '西市'], ['A walled square of packed earth with stalls and shaded aisles, where merchants from the Free Cities and beyond trade.', '一处有围墙的夯土方场，摊位林立、过道有荫，自由贸易城邦乃至更远处的商人在此交易。'], ['Perfume, lace, wine and steel from the west are sold in the Western Market.', '西市售卖来自西方的香水、蕾丝、葡萄酒与刀甲。'], 'high', ['agot', 'awoiaf'],
      ['A walled market of stalls where western goods are sold; merchants must honour the dosh khaleen with salt, silver and seed.', '有围墙的市场，摊位售卖西方货物；商人须向多斯卡林献上盐、银与种子。'], ['Its size and its exact place beside the godsway.', '规模，以及它在神路旁的确切位置。'], ['A low wall around awnings, tents and wagons; the size is invented.', '矮墙围着遮阳棚、帐篷与货车；规模为自拟。']),
    'eastern-market': L(['Eastern Market', '东市'], ['The second market, where caravans from Yi Ti, Asshai and the Shadow Lands stop to trade.', '第二处市场，来自夷地、亚夏与阴影之地的商队在此停驻交易。'], ['Caravans from the far east, with elephants and caged beasts, meet in the Eastern Market.', '远东的商队带着大象与笼中异兽，在东市汇聚。'], 'medium', ['agot', 'awoiaf'],
      ['A second market serves caravans from the east, including Yi Ti and Asshai.', '另有一处市场接待东方商队，包括来自夷地与亚夏者。'], ['Its layout, size and position.', '布局、规模与位置。'], ['The same open field as the Western Market, with different colours.', '与西市相同的开阔场地，只换了配色。']),
    'khals-halls': L(['Halls of the Khals', '可汗殿宇'], ['Halls and houses raised by past khals, scattered through the grass and empty for much of the year.', '历代可汗修建的殿宇屋舍，散落在草地间，一年中大半空置。'], ['The city is built for every khalasar at once, so most of its halls stand empty.', '这座城为所有卡拉萨同时到来而建，因此大多数殿宇空空荡荡。'], 'medium', ['agot'],
      ['Vaes Dothrak holds halls and palaces of many styles, built far larger than its usual population needs.', '维斯·多斯拉克有各式殿宇宫室，规模远超平日的人口所需。'], ['Their form, number and layout.', '形制、数量与布局。'], ['Eight long thatched halls placed at random.', '八座茅顶长殿，随意布置。']),
    'dosh-khaleen-huts': L(['Dosh Khaleen Huts', '多斯卡林居所'], ['A ring of round huts and a long hall standing for the home of the dosh khaleen, the widowed khaleesi who serve as seers.', '一圈圆屋与一座长厅，代表多斯卡林的居所。她们是亡故可汗的遗孀，也是预言者。'], ['The dosh khaleen, widows of khals, speak prophecy; even the mightiest khal bows to them.', '多斯卡林是众可汗的遗孀，宣示预言；再强大的可汗也要向她们低头。'], 'medium', ['agot', 'awoiaf'],
      ['The dosh khaleen live in Vaes Dothrak, preside over its rites and are honoured by khals and traders alike.', '多斯卡林居于维斯·多斯拉克，主持圣城的仪式，可汗与商人都对她们恭敬有加。'], ['Where and how they live is not described here.', '她们住在何处、居所何样，此处并无依据。'], ['The huts, the hall and their place near the mountain are invented.', '圆屋、长厅及其靠近圣山的位置均为自拟。']),
    'womb-of-the-world': L(['Womb of the World', '世界之子宫'], ['A sacred lake; the Dothraki say the first man rose from its waters riding the first horse.', '一座圣湖；多斯拉克人相信，第一个人骑着第一匹马从湖中升起。'], ['The first rider rose from these waters, the Dothraki say. Rites end with a cleansing here.', '多斯拉克人说，第一位骑手从这片水中升起。仪式过后，人们来此沐浴净身。'], 'high', ['agot', 'awoiaf'],
      ['A holy lake near the Mother of Mountains, bound to the Dothraki origin myth and used for ritual bathing.', '群山之母附近的圣湖，关联多斯拉克人的起源神话，也用于仪式沐浴。'], ['Its real size, depth and shoreline.', '真实大小、深度与岸线。'], ['A round lake fringed with reeds near the mountain; reeds and shape are invented.', '山脚附近一座芦苇环绕的圆湖；芦苇与湖形为自拟。']),
    'mother-of-mountains': L(['Mother of Mountains', '群山之母'], ['The holy mountain that rises over the city, at the far end of the godsway; only men may set foot on it.', '耸立于城市上方的圣山，在神路尽头；只许男子踏足。'], ['The Mother of Mountains rises over the city. Only men may climb her slopes.', '群山之母俯临全城，只有男子可以登上她的山坡。'], 'high', ['agot', 'awoiaf'],
      ['A holy mountain beside the city, which only men may set foot on.', '城旁的圣山，只许男子踏足。'], ['Its actual height and shape.', '实际高度与形状。'], ['A broad rounded massif with a gentle outline, scaled to fit the scene.', '轮廓柔和的宽阔浑圆山体，按场景需要缩放。']),
    'sea-of-grass': L(['Dothraki Sea', '多斯拉克海'], ['Grass rolling to every horizon, with grazing herds and riders.', '草浪起伏，直抵天边，马群吃草，骑手驰过。'], ['Around the city there is only grass and sky, as far as a horse can run.', '城外只有青草与长天，马能跑多远，便延伸多远。'], 'high', ['agot'],
      ['Vaes Dothrak stands in the Dothraki sea, an immense grassland.', '维斯·多斯拉克位于多斯拉克海，一片无垠的草原。'], ['The local landscape in detail.', '当地地貌细节。'], ['Gently rolling ground with tufts of grass and herds.', '和缓起伏的地面，点缀草丛与马群。']),
  },
};
