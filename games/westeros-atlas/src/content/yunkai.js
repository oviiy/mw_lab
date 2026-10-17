// Yunkai — bilingual content. Source codes: ASOS (Dany's march on Yunkai), ADWD, TWOIAF, AWOIAF index.
const P = (en, zh) => ({ en, zh });
const L = (name, desc, tour, conf, refs, book, unknown, interp, spoiler) => ({
  name: P(...name), desc: P(...desc), tour: P(...tour), ...(spoiler ? { spoiler: P(...spoiler) } : {}),
  source: { confidence: conf, refs, book: P(...book), unknown: P(...unknown), interpretation: P(...interp) },
});

export default {
  id: 'yunkai',
  intro: {
    en: 'The Yellow City of Slaver\'s Bay, built of yellow brick and ruled by the Wise Masters, who are best known for training bed slaves. This scene imagines it as a tidy grid on a low hill, crowded with pyramids.',
    zh: '奴隶湾的黄城，以黄砖筑成，由智者统治，尤以调教床奴闻名。本场景将它想象成矮丘上一座规整的棋盘式城市，金字塔林立。',
  },
  notes: {
    en: 'From the books: the yellow brick that names the city, its walls and stepped pyramids, the Wise Masters, the bed-slave trade, a harpy above the gates, and an army camped before the walls. Invented here: the rectangular plan, grid streets, bastions, hill, pyramid positions, courtyard houses, gates and harbour. The books describe Yunkai far less than Meereen.',
    zh: '书中可据：赋予城名的黄砖、城墙与阶梯金字塔、智者、床奴贸易、城门上方的鹰身女妖，以及城下扎营的大军。本场景自拟：长方形平面、棋盘街道、棱堡、矮丘、金字塔位置、庭院馆舍、城门与港口。书中对渊凯的描写远少于弥林。',
  },
  tour: ['land-gate', 'yellow-walls', 'besiegers-plain', 'slave-market', 'pyramid-hill', 'bed-slave-houses', 'lower-town', 'sea-gate', 'harbour', 'fishermens-quarter'],
  sources: [
    { ref: 'asos', checked: 'memory', note: P('Yunkai\'s walls, the Wise Masters and Daenerys\'s camp before the city come from A Storm of Swords; recalled, not re-read.', '渊凯的城墙、智者，以及丹妮莉丝在城外的营地，见于《冰雨的风暴》；凭记忆，未重读原文。') },
    { ref: 'awoiaf', checked: 'search-snippet', note: P('Search summaries of the wiki: yellow brick, crumbling walls, towers and stepped pyramids (one golden pyramid, of Qaggaz), a harpy above the gates, the Wise Masters and the bed-slave trade. Pages could not be fetched.', '经维基搜索摘要印证：黄砖、残破的城墙、塔楼与阶梯金字塔（其中有卡加兹家族的金色金字塔）、城门上方的鹰身女妖、智者，以及床奴贸易。页面本身无法打开。') },
    { ref: 'adwd', checked: 'not-accessed', note: P('Later events (Yunkai returns to slavery and marches on Meereen) are not used for the scene.', '后续事件（渊凯恢复奴隶制并进军弥林）未用于本场景。') },
  ],
  landmarks: {
    'yellow-walls': L(['Yellow Walls', '黄砖城墙'], ['Walls of yellow brick with round, domed bastions at regular intervals.', '黄砖城墙，每隔一段便有一座圆顶圆形棱堡。'], ['The yellow brick gives the city both its colour and its name.', '黄砖赋予这座城颜色，也赋予它名字。'], 'high', ['asos', 'awoiaf'],
      ['The city and its walls are of yellow brick; the walls are described as old and crumbling.', '城市与城墙皆以黄砖砌成；城墙被描述为古旧残破。'], ['Wall height, thickness and number of towers.', '城墙高度、厚度与塔楼数量。'], ['A straight-sided rectangle with a round bastion every 26 units; the domes are invented, and the walls are drawn intact rather than crumbling.', '城墙呈长方形，每隔二十六单位设一座圆形棱堡；圆顶为自拟，城墙也画得比书中完整。']),
    'land-gate': L(['West Gate', '西门'], ['The gate facing the plain, flanked by two domed towers.', '面向平原的城门，两侧各有一座圆顶塔。'], ['An army camped before this gate could study the walls it would have to take.', '在此门前扎营的大军，可以细看自己将要攻打的城墙。'], 'low', ['asos', 'awoiaf'],
      ['A harpy is said to stand above the city\'s gates; no gate is described in detail.', '据载城门上方立有鹰身女妖；没有哪座城门得到具体描写。'], ['Number, form and names of the gates.', '城门的数量、形制与名称。'], ['Four gates, the west and east ones larger; all designed here.', '共四座城门，东西两门较大；均为本场景设计。']),
    'sea-gate': L(['Sea Gate', '海门'], ['The broad eastern gate that opens onto the quays.', '通往码头的东侧宽阔城门。'], ['Cargo, captives and sailors pass through this gate to the harbour.', '货物、俘虏与水手经由此门往来港口。'], 'low', ['asos'],
      ['Yunkai lies on the bay; a sea gate is not described.', '渊凯濒临海湾；书中并未描写海门。'], ['Everything about a sea gate.', '关于海门的一切。'], ['The whole structure is invented as a counterpart to the west gate.', '整座城门为自拟，与西门相对应。']),
    'pyramid-hill': L(['Pyramid Hill', '金字塔丘'], ['A low hill crowned by the tallest pyramid and ringed by lesser ones, homes of the Wise Masters.', '矮丘顶上是最高的金字塔，四周环绕着较小的金字塔，都是智者的宅邸。'], ['The Wise Masters live in stepped pyramids of yellow brick, one of them golden.', '智者们住在黄砖砌成的阶梯金字塔里，其中一座呈金色。'], 'medium', ['asos', 'awoiaf'],
      ['Yunkai has tall stepped pyramids, including the golden pyramid of Qaggaz.', '渊凯有高耸的阶梯金字塔，其中包括卡加兹家族的金色金字塔。'], ['Their number, size and distribution; there is no evidence of a hill.', '数量、大小与分布；并无城中有丘的依据。'], ['Eight pyramids, the tallest on an invented central hill.', '八座金字塔，最高者立于自拟的城中矮丘上。']),
    'bed-slave-houses': L(['Bed-Slave Houses', '床奴馆'], ['Courtyard houses with gardens where bed slaves are trained.', '带花园的庭院馆舍，床奴在此受训。'], ['Yunkai is known for its trained bed slaves; these houses are imagined.', '渊凯以受过调教的床奴闻名；这些馆舍出于想象。'], 'low', ['asos', 'awoiaf'],
      ['Training bed slaves is Yunkai\'s speciality; where it happens is not described.', '调教床奴是渊凯的专长；在何处进行，书中未述。'], ['Their layout, number and location.', '布局、数量与位置。'], ['Four square courtyard houses with palms and awnings; invented.', '四座方形庭院，配棕榈与遮阳篷；为自拟。']),
    'slave-market': L(['Slave Market', '奴隶市场'], ['A square of awnings and auction platforms.', '一处遍布遮阳棚与拍卖台的广场。'], ['People are sold here by the lot.', '人在这里被成批出售。'], 'low', ['asos'],
      ['Yunkai is a slaving city; no market place is described.', '渊凯是奴隶贸易之城；书中未描写具体市场。'], ['Whether there is a market square, and what it looks like.', '是否有市场广场，又是何模样。'], ['A market square in the west quarter; invented.', '西区的一处市场广场；为自拟。']),
    'harbour': L(['Harbour', '海港'], ['A sheltered basin between two moles, with piers, cogs and galleys.', '两道防波堤之间的避风港池，设有栈桥，泊着柯克船与桨帆船。'], ['Two long moles shelter the quays on Slaver\'s Bay.', '两道长堤为奴隶湾畔的码头挡住风浪。'], 'low', ['asos'],
      ['The city lies on the bay; its harbour is not described.', '城市濒临海湾；港口未见描写。'], ['Harbour shape and defences.', '港口形状与防御。'], ['Moles, towers and four piers are all invented.', '防波堤、塔楼与四座栈桥均为自拟。']),
    'fishermens-quarter': L(['Fishermen\'s Quarter', '渔民区'], ['Small houses, boats and drying nets along the shore north of the sea gate.', '海门以北的岸边，小屋、渔船与晾晒的渔网。'], ['Humbler houses, and boats pulled up on the beach.', '简陋的屋舍，拖上沙滩的小船。'], 'low', ['asos'],
      ['Not described in the books.', '书中未提及。'], ['Everything.', '一切。'], ['A pure atmosphere piece: a quiet corner of the shore.', '纯为营造氛围：海岸边一处安静的角落。']),
    'besiegers-plain': L(['Plain Outside the Walls', '城外平原'], ['The dusty plain where an army pitches its tents before the city.', '城前尘土飞扬的平原，大军在此安营扎寨。'], ['Daenerys\'s host camped on this plain before the Yellow City.', '丹妮莉丝的大军曾在黄城前的这片平原扎营。'], 'medium', ['asos'],
      ['Daenerys\'s army camps before Yunkai; the ground is barely described.', '丹妮莉丝的军队在渊凯城前扎营；地形几乎未作描写。'], ['Camp layout and distances.', '营地布局与距离。'], ['Tents and campfires west of the gate; the layout is invented.', '西门以西的帐篷与篝火；布局为自拟。'], ['Daario\'s Stormcrows change sides, a night attack routs Yunkai\'s army, and the Wise Masters free their slaves.', '达里奥的风暴乌鸦团倒戈，一场夜袭击溃渊凯大军，智者随即释放了奴隶。']),
    'lower-town': L(['Lower Town', '下城'], ['Rows of flat-roofed yellow houses along grid streets.', '沿棋盘街道排列的黄色平顶房屋。'], ['An orderly grid of yellow houses: the ordinary city.', '井然有序的黄色房屋，便是寻常市井。'], 'low', ['asos'],
      ['Ordinary quarters are not described.', '寻常街区未见描写。'], ['Everything.', '一切。'], ['Houses placed at random, aligned to the grid.', '房屋随机布置，朝向与棋盘街道对齐。']),
  },
};
