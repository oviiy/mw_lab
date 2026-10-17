// Selhorys — sparse, bilingual content.
const L = (n, d, t, conf, refs, book, unknown, interp, spoiler) => ({
  name: { en: n[0], zh: n[1] }, desc: { en: d[0], zh: d[1] }, tour: { en: t[0], zh: t[1] },
  ...(spoiler ? { spoiler: { en: spoiler[0], zh: spoiler[1] } } : {}),
  source: { confidence: conf, refs, book: { en: book[0], zh: book[1] }, unknown: { en: unknown[0], zh: unknown[1] }, interpretation: { en: interp[0], zh: interp[1] } },
});
const NONE = ['The books give no plan of the town.', '书中没有给出城镇的布局。'];

export default {
  id: 'selhorys',
  intro: {
    en: 'A walled Volantene river town where the Selhoru joins the lower Rhoyne, on the river route between the upper Rhoyne and Volantis. The books say very little about it; this is a quiet, deliberately restrained scene.',
    zh: '塞尔霍利斯是瓦兰提斯治下的一座设防河镇，坐落在塞尔霍鲁河汇入洛恩河下游之处，扼守通往瓦兰提斯的河道。书中着墨极少，本场景有意保持克制。',
  },
  notes: {
    en: 'Established (mostly via wiki summaries of A Dance with Dragons): a walled Volantene town at the confluence of the Selhoru and the Rhoyne, with sandstone walls and shops, stalls and storehouses along the piers. Everything else is invented: the layout, buildings, boats and market.',
    zh: '可确认的内容（主要来自维基对《魔龙的狂舞》的摘要）：一座属于瓦兰提斯的设防城镇，位于塞尔霍鲁河与洛恩河交汇处，有砂岩城墙，码头沿线分布着店铺、摊档与仓库。其余均为自拟：布局、建筑、船只与集市。',
  },
  tour: ['confluence', 'piers', 'storehouses', 'sandstone-walls', 'river-gate', 'market-quarter'],
  sources: [
    { ref: 'awoiaf', checked: 'search-snippet', note: { en: 'Walled Volantene town at the Selhoru–Rhoyne confluence; sandstone walls; shops, stalls and storehouses along the piers: confirmed by a web-search summary; pages not fetched.', zh: '位于塞尔霍鲁河与洛恩河交汇处的瓦兰提斯设防城镇；砂岩城墙；码头沿线有店铺、摊档与仓库：经网络搜索摘要印证，未能打开页面。' } },
    { ref: 'adwd', checked: 'search-snippet', note: { en: 'A river boat\'s stop here in A Dance with Dragons (and the brothel scene in the spoiler) known only from search summaries; the text was not re-read.', zh: '《魔龙的狂舞》中一条河船在此停靠（以及剧透中的妓院情节），仅据搜索摘要得知，未重读原文。' } },
  ],
  landmarks: {
    'confluence': L(['Confluence', '汇流处'], ['The Selhoru joins the Rhoyne here, widening the water into a busy reach.', '塞尔霍鲁河在此汇入洛恩河，水面随之开阔，船来船往。'], ['Two rivers meet, and the town grew up where they join.', '两河在此交汇，城镇因之而兴。'], 'high', ['adwd', 'awoiaf'], ['The town stands where the Selhoru meets the lower Rhoyne.', '城镇位于塞尔霍鲁河与洛恩河下游的交汇处。'], ['The exact shape of the junction.', '汇流处的确切形状。'], ['A simplified Y-shaped junction.', '简化为丫字形汇流。']),
    'piers': L(['Piers', '码头'], ['Wooden piers reach into the Rhoyne; river boats tie up alongside.', '木栈桥伸入洛恩河，河船在旁系泊。'], ['River traffic calls here on the way to Volantis.', '往来瓦兰提斯的河船在此停靠。'], 'medium', ['adwd', 'awoiaf'], ['Shops, stalls and storehouses line the piers.', '码头沿线排列着店铺、摊档与仓库。'], ['The number and form of the piers.', '码头的数量与形制。'], ['A row of timber piers; invented.', '一排木栈桥；系自拟。'], ['In A Dance with Dragons the Shy Maid puts in here, and in a Selhorys brothel Ser Jorah Mormont seizes Tyrion.', '《魔龙的狂舞》中，“羞涩少女号”在此靠岸；乔拉·莫尔蒙爵士在塞尔霍利斯的一家妓院里擒住了提利昂。']),
    'storehouses': L(['Storehouses', '仓库'], ['Long plastered warehouses with tiled roofs stand behind the piers.', '码头后方是一排排抹灰瓦顶的长仓库。'], ['Goods bound up and down the river pass through here.', '沿河上下的货物在此中转。'], 'medium', ['awoiaf'], ['Storehouses along the piers are mentioned in summaries.', '摘要提到码头沿线有仓库。'], ['Size and appearance.', '规模与外观。'], ['Six near-identical gabled warehouses; invented.', '六座几乎一样的山墙仓库；系自拟。']),
    'sandstone-walls': L(['Sandstone Walls', '砂岩城墙'], ['A ring of warm sandstone walls and towers encloses the town.', '暖色砂岩城墙与塔楼环绕全镇。'], ['Sandstone walls guard a small town on a frontier river.', '砂岩城墙守护着这座边境河畔的小镇。'], 'medium', ['awoiaf'], ['The town is walled in sandstone (summary).', '城镇有砂岩城墙（据摘要）。'], ['Height, circuit and towers.', '高度、周长与塔楼。'], ['An oval ring about 11 m high; invented.', '约11米高的椭圆形城墙；系自拟。']),
    'river-gate': L(['River Gate', '河门'], ['A twin-towered gate pierces the wall where the road meets the river.', '大路与河流相遇处，城墙上开着一座双塔城门。'], ['Road and river meet at the gate.', '大路与河流在城门前交会。'], 'low', ['awoiaf'], ['No gate is described in the sources checked.', '所查资料中未提及城门。'], NONE, ['Two plain gatehouses on a north–south axis; invented.', '南北轴线上的两座朴素门楼；系自拟。']),
    'market-quarter': L(['Market Quarter', '集市区'], ['Awnings and stalls before the gate, where river traders meet buyers from the countryside.', '城门前的遮篷与摊位，河上商贩与乡间买家在此交易。'], ['A modest market, in keeping with a river port.', '一处朴实的集市，与河港的身份相称。'], 'low', ['awoiaf'], ['Stalls along the piers are mentioned; no market square is described.', '摘要提到码头边有摊档，但没有描写集市广场。'], NONE, ['A few awnings by the gate; no goods or people specified.', '城门边几顶遮篷；不指明货物与人物。']),
  },
};
