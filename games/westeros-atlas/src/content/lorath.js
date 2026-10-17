// Lorath — sparse, bilingual content.
const L = (n, d, t, conf, refs, book, unknown, interp) => ({
  name: { en: n[0], zh: n[1] }, desc: { en: d[0], zh: d[1] }, tour: { en: t[0], zh: t[1] },
  source: { confidence: conf, refs, book: { en: book[0], zh: book[1] }, unknown: { en: unknown[0], zh: unknown[1] }, interpretation: { en: interp[0], zh: interp[1] } },
});
const NONE = ['The books give no description of this.', '书中对此并无描写。'];

export default {
  id: 'lorath',
  intro: {
    en: 'The most remote of the Free Cities, set on the largest of three islands in the cold Shivering Sea off northern Essos. The novels barely describe it; this scene is a quiet, atmospheric reading of grey stone, sheltered water and fog.',
    zh: '洛拉斯是最偏远的自由贸易城邦，位于厄索斯北岸外寒冷的颤抖海中，建在三座岛屿里最大的一座上。小说对它几无着墨；本场景以灰石、避风水湾与浓雾，营造一份静谧的氛围。',
  },
  notes: {
    en: 'Established (thinly): an island city on the largest of three islands, at the mouth of Lorath Bay on the Shivering Sea, remote from the other Free Cities. Companion lore (not shown) tells of ancient stone mazes left by the Mazemakers and of the vanished cult of Boash. Invented: the lagoon, quays, towers, halls, the entire plan and every building form.',
    zh: '可确认的不多：城市建在颤抖海洛拉斯湾口三岛中最大的一座上，与其余自由贸易城邦相距遥远。设定集还记载了上古“迷宫建造者”留下的石砌迷宫，以及已经消亡的波阿什教派（本场景均未呈现）。自拟部分：潟湖、码头、塔楼、厅堂、整体布局与所有建筑造型。',
  },
  tour: ['shivering-sea', 'three-islands', 'lagoon-harbour', 'city-quarter', 'grey-towers', 'stone-halls'],
  sources: [
    { ref: 'acok', checked: 'memory', note: { en: 'A prisoner in the novels names Lorath as his home; this is about all the novels say of the city. Recalled, not re-read.', zh: '小说中一名囚犯自称来自洛拉斯，这几乎就是小说对该城的全部交代。凭记忆复述，未重读。' } },
    { ref: 'awoiaf', checked: 'search-snippet', note: { en: 'City on the largest of three islands in the Shivering Sea, at the mouth of Lorath Bay; the Mazemakers and Boash: confirmed by web-search summaries, pages not fetched.', zh: '城市位于颤抖海三岛中最大一岛、洛拉斯湾口；迷宫建造者与波阿什教派：经网络搜索摘要印证，未能打开页面。' } },
    { ref: 'twoiaf', checked: 'not-accessed', note: { en: 'Lorathi history and customs not re-checked against the book.', zh: '洛拉斯的历史与风俗未对照原书核实。' } },
  ],
  landmarks: {
    'shivering-sea': L(['Shivering Sea', '颤抖海'], ['Cold grey water and mist surround the islands; fishing boats keep close to shore.', '冰冷的灰色海水与雾气环绕群岛，渔船不敢远离海岸。'], ['Cold water and fog keep Lorath apart from the other Free Cities.', '冷海与浓雾，把洛拉斯和其余自由贸易城邦隔开。'], 'medium', ['maps', 'awoiaf'], ['Lorath lies in the Shivering Sea, north of the other Free Cities.', '洛拉斯位于颤抖海中，在其余自由贸易城邦以北。'], ['Sea conditions and shipping.', '海况与航运。'], ['A choppy grey sea with a few fishing boats; invented.', '微浪起伏的灰色海面与几条渔船；系自拟。']),
    'three-islands': L(['Three Islands', '三岛'], ['A cluster of three islands, with the city on the largest; the two smaller isles fade into the mist.', '三岛相聚，城市在最大的一座上，两座小岛隐没在雾中。'], ['Three islands, only one of them home to a city.', '三座岛屿，唯有一座建起了城市。'], 'medium', ['awoiaf'], ['The city stands on the largest of three islands.', '城市位于三岛中最大的一座。'], ['The size and shape of the islands.', '各岛的大小与形状。'], ['Rough oval islands with low hills; invented.', '起伏低缓的椭圆形岛屿；系自拟。']),
    'lagoon-harbour': L(['Lagoon Harbour', '潟湖港'], ['A sheltered lagoon on the island\'s west side, with small boats and stone quays.', '岛西侧的避风潟湖，泊着小船，石砌码头环绕。'], ['Sheltered water inside the island, with mist on the surface.', '岛内一湾避风静水，雾气浮在水面。'], 'low', ['awoiaf'], ['An island port city is implied; no harbour is described.', '可推知这是一座岛上港城，但并无港口描写。'], ['The harbour\'s real form.', '港口的真实形态。'], ['An oval lagoon with a channel to the sea; invented.', '一湾椭圆潟湖，有水道通向外海；系自拟。']),
    'city-quarter': L(['City Quarter', '城区'], ['Tight grey houses with slate roofs ring the lagoon, smoke rising into the damp air.', '石板顶的灰色房屋紧紧围着潟湖，炊烟升入湿冷的空气。'], ['Houses crowd the water, quiet and grey.', '房屋挤在水边，灰暗而安静。'], 'low', ['awoiaf'], NONE, ['Streets, districts and architecture.', '街道、城区与建筑。'], ['Generic compact housing; invented.', '一般性的密集民居；系自拟。']),
    'grey-towers': L(['Grey Towers', '灰塔'], ['A handful of slim stone towers rise above the roofs and the mist.', '几座细长的石塔高出屋顶，探出雾外。'], ['Towers stand above the fog, whether for watch or for show.', '高塔立于雾上，或为瞭望，或为装点。'], 'low', ['awoiaf'], NONE, ['Whether any such towers exist.', '是否真有这样的塔。'], ['Five towers; purely invented.', '五座塔；纯属自拟。']),
    'stone-halls': L(['Stone Halls', '石厅'], ['Plain, quiet halls on the high ground by the lagoon, in keeping with a remote and withdrawn city.', '潟湖旁高地上几座朴素安静的石厅，与这座偏远孤僻的城邦相称。'], ['Plain, quiet buildings for a city far from everywhere.', '朴素安静的建筑，属于一座远离尘嚣的城。'], 'low', ['twoiaf'], ['Lorath is described as the most remote of the Free Cities; no building is described.', '洛拉斯被称为最偏远的自由贸易城邦；但没有任何建筑描写。'], ['Any specific institution or building, including the Mazemakers\' mazes.', '任何具体的机构或建筑，包括迷宫建造者的迷宫。'], ['One long hall and two outbuildings; invented, with no religious claim made.', '一座长厅与两间附屋；系自拟，不涉及任何宗教含义。']),
  },
};
