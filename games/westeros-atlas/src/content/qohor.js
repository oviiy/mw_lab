// Qohor — sparse, bilingual content.
const L = (n, d, t, conf, refs, book, unknown, interp) => ({
  name: { en: n[0], zh: n[1] }, desc: { en: d[0], zh: d[1] }, tour: { en: t[0], zh: t[1] },
  source: { confidence: conf, refs, book: { en: book[0], zh: book[1] }, unknown: { en: unknown[0], zh: unknown[1] }, interpretation: { en: interp[0], zh: interp[1] } },
});
const NONE = ['The books give no description of this.', '书中对此并无描写。'];

export default {
  id: 'qohor',
  intro: {
    en: 'A grim inland Free City at the edge of the great Forest of Qohor. Its smiths are famed across the world, and they alone are said to keep the secret of reworking Valyrian steel. The books say little about the city itself, so this scene is dark and restrained.',
    zh: '科霍尔是一座阴郁的内陆自由贸易城邦，坐落在科霍尔大森林边缘。城中铁匠名闻天下，据说只有他们还掌握重铸瓦雷利亚钢的秘法。书中对城市本身着墨甚少，故本场景基调暗沉、克制。',
  },
  notes: {
    en: 'From the novels: the Forest of Qohor; Qohorik-trained armourers who can rework Valyrian steel; the Black Goat as Qohor\'s god; the tale of the Three Thousand of Qohor, Unsullied who held the city against the Dothraki. From companion summaries: timber as a source of wealth and the Unsullied as its standing defence. Invented: the black-stone look, the plan, every building, the kilns and the walls.',
    zh: '出自小说：科霍尔大森林；在科霍尔学艺、能重铸瓦雷利亚钢的铸甲师；科霍尔人信奉的黑山羊；“科霍尔三千勇士”的故事——三千无垢者为该城挡住了多斯拉克人。出自设定集摘要：木材是财源之一，城防此后多倚仗无垢者。自拟部分：黑石外观、城市布局、所有建筑，以及炭窑与城墙。',
  },
  tour: ['forest-of-qohor', 'charcoal-kilns', 'black-walls', 'forges', 'smiths-quarter', 'black-goat-temple'],
  sources: [
    { ref: 'agot', checked: 'memory', note: { en: 'A master armourer in King\'s Landing who trained in Qohor, and the khalasar\'s journey past the Forest of Qohor, recalled from memory, not re-read.', zh: '君临一位在科霍尔学艺的铸甲师傅，以及卡拉萨途经科霍尔大森林的情节，凭记忆复述，未重读。' } },
    { ref: 'asos', checked: 'memory', note: { en: 'Valyrian steel reworked by that armourer; the Three Thousand of Qohor; oaths by the Black Goat from a Qohorik sellsword captain. Recalled, not re-read.', zh: '该铸甲师重铸瓦雷利亚钢；科霍尔三千勇士；一名科霍尔籍佣兵队长以黑山羊起誓。凭记忆复述，未重读。' } },
    { ref: 'awoiaf', checked: 'search-snippet', note: { en: 'Qohor alone preserving the art of reworking Valyrian steel, the Unsullied defence, and the forest as a source of wealth: confirmed via web-search summaries; pages not fetched.', zh: '唯有科霍尔保存重铸瓦雷利亚钢的技艺、无垢者守城、森林为财源：经网络搜索摘要印证，未能打开页面。' } },
  ],
  landmarks: {
    'forest-of-qohor': L(['Forest of Qohor', '科霍尔大森林'], ['A vast, dark forest around the city; its timber is one of Qohor\'s sources of wealth.', '环绕全城的广袤密林，木材是科霍尔的财源之一。'], ['Qohor lives off the forest that hems it in.', '科霍尔靠这片将它团团围住的森林为生。'], 'high', ['agot', 'twoiaf'], ['The Forest of Qohor is named in the novels; its role in the city\'s wealth comes from companion summaries.', '科霍尔大森林见于小说；其为城市财源一说出自设定集摘要。'], ['Its extent and tree species.', '范围与树种。'], ['Dense pine and oak; invented.', '茂密的松树与橡树；系自拟。']),
    'charcoal-kilns': L(['Charcoal Kilns', '炭窑'], ['Earth-covered kilns outside the walls turn the forest into fuel for the forges.', '城外覆土的炭窑，把林木烧成供给铸炉的燃料。'], ['Fuel for the forges is made out here.', '铸炉的燃料就在这里烧制。'], 'low', ['awoiaf'], NONE, ['Anything about how the wood is used.', '木材如何利用，书中只字未提。'], ['Eight small kilns, inferred from the forest-and-smith link.', '八座小炭窑，由森林与铁匠之间的关联推想而来。']),
    'black-walls': L(['City Walls', '城墙'], ['Dark stone walls and towers ring the city; three gates open onto roads through the trees.', '深色石墙与塔楼环绕全城，三座城门通向林间大道。'], ['A dark ring of wall holds the city apart from the trees.', '一圈暗色城墙，把城市与林海隔开。'], 'low', ['awoiaf'], NONE, ['Colour, height and gates.', '颜色、高度与城门。'], ['Black stone is this scene\'s palette choice, not a book fact.', '黑石只是本场景的配色选择，并非书中事实。']),
    'forges': L(['Forges', '铸炉'], ['Low dark halls with tall chimneys and glowing furnaces where Qohorik smiths work.', '低矮的深色工坊，烟囱高耸，炉火通红，科霍尔铁匠在此劳作。'], ['Only Qohor\'s smiths still know how to rework Valyrian steel.', '如今只有科霍尔的铁匠还懂得重铸瓦雷利亚钢。'], 'high', ['agot', 'asos', 'awoiaf'], ['Qohor is famed for its smiths; a Qohor-trained armourer reforges a Valyrian steel sword in the novels, and Qohor is said to be the only place that keeps this art.', '科霍尔以铁匠闻名；小说中一位在科霍尔学艺的铸甲师重铸了一把瓦雷利亚钢剑，据说只有科霍尔保有此项技艺。'], ['The number, size and layout of the forges.', '铸炉的数量、规模与布局。'], ['Four forge halls with chimneys and fires; invented.', '四座带烟囱与炉火的锻造工坊；系自拟。']),
    'smiths-quarter': L(['Smiths\' Quarter', '铁匠区'], ['Dense dark roofs and chimney smoke in the district around the forges.', '铸炉四周的街区里，深色屋顶密密匝匝，炉烟缭绕。'], ['Smoke and the ring of hammers fill the lanes.', '烟雾与锤声充斥着大街小巷。'], 'low', ['awoiaf'], NONE, ['Districts and streets.', '街区与街道。'], ['Generic dense housing; invented.', '一般性的密集民居；系自拟。']),
    'black-goat-temple': L(['Black Goat Temple', '黑山羊神殿'], ['A dark, horned hall near the heart of the city, imagined as a shrine of the Black Goat.', '城中心附近一座顶生双角的暗色殿堂，设想为供奉黑山羊之所。'], ['Qohor\'s god is the Black Goat, honoured with blood.', '科霍尔人信奉黑山羊，以鲜血献祭。'], 'medium', ['asos', 'awoiaf'], ['The Black Goat is the god of Qohor, and a Qohorik sellsword swears by it; blood sacrifice is attributed to the cult in companion summaries.', '黑山羊是科霍尔之神，一名科霍尔籍佣兵便以它起誓；设定集摘要称该信仰以血献祭。'], ['Any temple, its form and rites.', '是否有神殿，其形制与仪式。'], ['A simple hall with two horn-like spires; invented.', '一座带两根角状尖顶的简朴殿堂；系自拟。']),
  },
};
