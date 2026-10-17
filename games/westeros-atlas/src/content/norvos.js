// Norvos — sparse, bilingual content.
const L = (n, d, t, conf, refs, book, unknown, interp) => ({
  name: { en: n[0], zh: n[1] }, desc: { en: d[0], zh: d[1] }, tour: { en: t[0], zh: t[1] },
  source: { confidence: conf, refs, book: { en: book[0], zh: book[1] }, unknown: { en: unknown[0], zh: unknown[1] }, interpretation: { en: interp[0], zh: interp[1] } },
});
const NONE = ['The books give no description of this.', '书中对此并无描写。'];

export default {
  id: 'norvos',
  intro: {
    en: 'An inland Free City on the Noyne, ruled in effect by its bearded priests and governed by its bells. A walled high city crowns a hill, with a low city by the river far below. This scene renders it as a restrained hill-town.',
    zh: '诺佛斯是诺伊河畔的内陆自由贸易城邦，实际由蓄须祭司掌权，日常作息听凭钟声。城墙环绕的上城高踞山顶，下城远在河边。本场景以克制的笔触，把它呈现为一座山城。',
  },
  notes: {
    en: 'Established: an inland Free City on the Noyne, a tributary of the Rhoyne; bearded priests who hold real power; three great bells named Noom, Narrah and Nyel that regulate daily life. Wiki summaries add a walled high city on the hilltop with the priests\' fortress-temple, a low city about 300 feet below by the river, and the Sinner\'s Steps between them. Invented: the bluff\'s scale, the wall circuit, the towers and temple forms, and every building.',
    zh: '可确认：诺佛斯是洛恩河支流诺伊河畔的内陆自由贸易城邦；蓄须祭司掌握实权；三口大钟努姆、纳拉与奈尔规定着全城的作息。维基摘要另称：山顶是城墙环绕的上城，祭司的要塞神殿就在其中；下城在约三百尺之下的河边，两者以“罪人阶梯”相连。自拟部分：高岗尺度、城墙走向、塔楼与神殿造型，以及所有建筑。',
  },
  tour: ['noyne-river', 'high-bluff', 'city-walls', 'bell-towers', 'bearded-priests-temple', 'lower-town', 'hills-of-norvos'],
  sources: [
    { ref: 'affc', checked: 'memory', note: { en: 'A Norvoshi guard\'s memories of his home city (the bearded priests, the three bells, high and low city) recalled from memory, not re-read.', zh: '一名诺佛斯籍护卫对故乡的回忆（蓄须祭司、三口大钟、上城与下城）凭记忆复述，未重读。' } },
    { ref: 'awoiaf', checked: 'search-snippet', note: { en: 'Bell names, high city and low city (about 300 ft apart), the Sinner\'s Steps and the priests\' fortress-temple: confirmed via web-search summaries; pages not fetched.', zh: '钟名、上下两城（高差约三百尺）、罪人阶梯与祭司的要塞神殿：经网络搜索摘要印证，未能打开页面。' } },
    { ref: 'twoiaf', checked: 'not-accessed', note: { en: 'Background history not re-checked.', zh: '背景历史未再核对。' } },
  ],
  landmarks: {
    'noyne-river': L(['Noyne River', '诺伊河'], ['A tributary of the Rhoyne running at the foot of the hill; the low city lies along it.', '洛恩河的支流，流经山脚，下城就沿河而建。'], ['The Noyne flows far below, a road for barges.', '诺伊河在远远的山下流过，是驳船往来的水路。'], 'high', ['twoiaf', 'maps'], ['Norvos stands on the Noyne, a tributary of the Rhoyne.', '诺佛斯位于洛恩河的支流诺伊河畔。'], ['Width and navigability.', '河宽与通航条件。'], ['A calm green river with a few barges; invented.', '平静的碧绿河面与几条驳船；系自拟。']),
    'high-bluff': L(['High City', '上城'], ['The high city crowns a steep hill above the river, where the old nobility live.', '上城高踞河畔陡峭的山顶，是古老贵族的居所。'], ['A sheer bluff lifts the high city above the river.', '陡峭的高岗将上城托在河面之上。'], 'medium', ['affc', 'awoiaf'], ['The high city stands on a tall hill, about 300 feet above the low city by the river (wiki summary).', '上城位于高丘之上，比河边的下城高出约三百尺（据维基摘要）。'], ['The hill\'s exact shape and the route of the Sinner\'s Steps.', '山丘的确切形状与罪人阶梯的走向。'], ['A plateau only about 34 m above the river, far lower than described, with a steep western face; no stair is modelled.', '台地仅高出河面约34米，远低于书中所述，西侧陡峭；未建模阶梯。']),
    'city-walls': L(['City Walls', '城墙'], ['A stone wall rings the high city, with round towers and one gate toward the road east.', '石墙环绕上城，设有圆塔，一座城门通向东去的大道。'], ['Mighty walls follow the edge of the hilltop.', '坚固的城墙沿着山顶边缘而筑。'], 'medium', ['affc', 'awoiaf'], ['The high city is ringed by mighty stone walls (wiki summary).', '上城由坚固的石墙环绕（据维基摘要）。'], ['Wall height, circuit and gates.', '城墙高度、周长与城门。'], ['A single irregular oval with one gate; invented.', '一圈不规则的椭圆城墙，只设一门；系自拟。']),
    'bell-towers': L(['Bell Towers', '钟楼'], ['Open belfries rise above the roofs; three great bells tell the Norvoshi when to rise, work, pray and sleep.', '敞口钟室高出屋顶。三口大钟告诉诺佛斯人何时起床、劳作、祈祷与就寝。'], ['Noom, Narrah and Nyel: three bells rule the Norvoshi day.', '努姆、纳拉、奈尔，三口大钟主宰着诺佛斯人的一天。'], 'high', ['affc', 'awoiaf'], ['Norvos has three named bells, Noom, Narrah and Nyel, each with its own voice, which regulate daily life; they are counted among the Wonders Made by Man.', '诺佛斯有三口各有名字的大钟——努姆、纳拉与奈尔，声音各异，规定着日常作息；它们位列“人造奇观”之一。'], ['Where the bells hang and what their towers look like.', '大钟悬于何处，钟楼是何模样。'], ['Four towers of different heights; invented.', '四座高低不一的钟楼；系自拟。']),
    'bearded-priests-temple': L(['Priests\' Temple', '祭司神殿'], ['The bearded priests\' fortress-temple in the high city, the true seat of power.', '上城中蓄须祭司的要塞神殿，是真正的权力所在。'], ['The bearded priests rule Norvos in all but name.', '蓄须祭司虽无其名，却是诺佛斯真正的统治者。'], 'medium', ['affc', 'awoiaf'], ['The bearded priests hold real power and train temple guards; a wiki summary places their great fortress-temple in the high city.', '蓄须祭司握有实权，并训练神殿卫士；维基摘要称他们宏大的要塞神殿位于上城。'], ['The temple\'s appearance and the faith\'s doctrines.', '神殿的外观与教义。'], ['A columned hall with a gabled slate roof, not fortified; invented.', '一座带山墙石板顶的柱廊大厅，未作要塞化处理；系自拟。']),
    'lower-town': L(['Lower Town', '下城'], ['Houses and lanes on the slopes below the walls.', '城墙之下山坡上的房屋与小巷。'], ['Below the walls the lanes spill down the hill.', '城墙之下，小巷顺山势而下。'], 'low', ['affc', 'awoiaf'], ['The low city lies at the foot of the hill by the river, linked to the high city by the Sinner\'s Steps.', '下城位于山脚河畔，经罪人阶梯与上城相连。'], ['Its streets, size and look.', '街道、规模与样貌。'], ['A loose scatter of houses east of the walls along the road, not by the river as in the books.', '城墙以东沿路散布的房屋；位置与书中“下城在河边”并不相符。']),
    'hills-of-norvos': L(['Hills of Norvos', '诺佛斯丘陵'], ['Rolling hills of oak and pine around the city.', '城周起伏的丘陵，橡树与松林相间。'], ['The city sits among hills, far from the sea.', '城市坐落在群丘之间，远离大海。'], 'medium', ['maps', 'twoiaf'], ['The city lies in hill country, inland from the sea.', '城市位于远离海岸的丘陵地带。'], ['Vegetation and relief.', '植被与地势。'], ['Oak and pine cover; invented.', '橡树与松林；系自拟。']),
  },
};
