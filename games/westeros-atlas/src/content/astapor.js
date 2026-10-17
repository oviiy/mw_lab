// Astapor — bilingual content. Source codes: ASOS (Dany's purchase of the Unsullied), ADWD (later events), TWOIAF, AWOIAF index.
const P = (en, zh) => ({ en, zh });
const L = (name, desc, tour, conf, refs, book, unknown, interp, spoiler) => ({
  name: P(...name), desc: P(...desc), tour: P(...tour), ...(spoiler ? { spoiler: P(...spoiler) } : {}),
  source: { confidence: conf, refs, book: P(...book), unknown: P(...unknown), interpretation: P(...interp) },
});

export default {
  id: 'astapor',
  intro: {
    en: 'The southernmost of the three Slaver cities, an old city of red brick on Slaver\'s Bay. Its stepped pyramids belong to the Good Masters, whose wealth rests on the Unsullied they train and sell.',
    zh: '奴隶湾三座奴隶城邦中最南的一座，是一座古老的红砖之城。城中的阶梯金字塔属于善主，他们的财富全系于训练并出售无垢者。',
  },
  notes: {
    en: 'From the books: the red brick (the "Red City"), the Good Masters, stepped pyramids including those of Nakloz and Ullhor, the Plaza of Pride with its bronze harpy fountain, the Unsullied trade, and a harbour gate topped by an old crumbling harpy. Invented here: the oval plan, street grid, number and position of pyramids, the training yards, a separate market, and every building shape.',
    zh: '书中可据：红砖（故称“红城”）、善主、阶梯金字塔（包括纳克洛兹与乌尔霍两家）、立有青铜鹰身女妖喷泉的骄傲广场、无垢者交易，以及顶上立着一尊残破鹰身女妖的港口城门。本场景自拟：椭圆形城市平面、街道网格、金字塔的数量与位置、训练场、独立市场，以及全部建筑造型。',
  },
  tour: ['harbour', 'harbour-gate', 'red-walls', 'plaza-of-pride', 'harpy-fountain', 'pyramid-of-nakloz', 'unsullied-pits', 'slave-market', 'brick-warrens'],
  sources: [
    { ref: 'asos', checked: 'memory', note: P('Astapor appears in Daenerys\'s chapters of A Storm of Swords; recalled, not re-read.', '阿斯塔波见于《冰雨的风暴》中丹妮莉丝的章节；凭记忆，未重读原文。') },
    { ref: 'awoiaf', checked: 'search-snippet', note: P('Search summaries of the wiki: red brick throughout, the pyramids of Nakloz and Ullhor, an old crumbling harpy on the harbour gate, and the Astapori harpy (woman\'s torso, bat wings, eagle legs, scorpion tail, a chain of open manacles in its talons). Pages could not be fetched.', '经维基搜索摘要印证：全城皆用红砖；纳克洛兹与乌尔霍的金字塔；港口城门上一尊古旧残破的鹰身女妖；阿斯塔波的鹰身女妖形象（女人上身、蝠翼、鹰足、蝎尾，爪握一串打开的镣铐）。页面本身无法打开。') },
    { ref: 'twoiaf', checked: 'not-accessed', note: P('Companion background on the Slaver cities was not consulted.', '未查阅《冰与火之歌：世界》中关于奴隶城邦的背景资料。') },
  ],
  landmarks: {
    'plaza-of-pride': L(['Plaza of Pride', '骄傲广场'], ['Astapor\'s great brick square, where the Unsullied are drawn up for buyers to inspect.', '阿斯塔波的红砖大广场，无垢者在此列队，供买主检阅。'], ['In the Plaza of Pride, ranks of Unsullied stand motionless under the sun for the buyers.', '骄傲广场上，一排排无垢者在烈日下纹丝不动，任买主审视。'], 'high', ['asos', 'awoiaf'],
      ['A large plaza with a harpy fountain at its centre, where Daenerys inspects and buys the Unsullied.', '一座大广场，中央有鹰身女妖喷泉；丹妮莉丝在此检阅并买下无垢者。'], ['Its exact size and the buildings around it.', '确切大小及四周建筑。'], ['Paving, corner posts and braziers are invented; pyramids frame it by choice.', '铺地、角柱与火盆均为自拟；以金字塔环绕广场是本场景的安排。']),
    'harpy-fountain': L(['Harpy Fountain', '鹰身女妖喷泉'], ['A red-brick fountain crowned by a great bronze harpy, emblem of Old Ghis.', '一座红砖喷泉，顶上立着巨大的青铜鹰身女妖，那是古吉斯的徽记。'], ['The bronze harpy of Ghis, chains in her talons, presides over the trade in men.', '吉斯的青铜鹰身女妖爪握镣铐，俯视着这场人口买卖。'], 'high', ['asos', 'awoiaf'],
      ['A fountain in the plaza whose water smells of brimstone, with a bronze harpy about twenty feet tall at its centre; the Astapori harpy holds a chain of open manacles.', '广场上的喷泉，水有硫磺味，中央立着约二十尺高的青铜鹰身女妖；阿斯塔波的鹰身女妖爪握一串打开的镣铐。'], ['The fountain\'s exact shape and the statue\'s pose.', '喷泉的确切形状与雕像的姿态。'], ['The figure is drawn a little over twenty feet for legibility; its pose is invented.', '为便于辨认，雕像略高于二十尺；姿态为自拟。']),
    'pyramid-of-nakloz': L(['Pyramid of Nakloz', '纳克洛兹金字塔'], ['Seat of the house of Nakloz, to which the slaver Kraznys mo Nakloz belongs: a stepped pyramid of red brick.', '纳克洛兹家族的宅邸，奴隶贩子克拉兹尼·莫·纳克洛兹即出自此家：一座红砖阶梯金字塔。'], ['Each Good Master\'s family lives in its own pyramid of red brick.', '每个善主家族都住在自家的红砖金字塔里。'], 'medium', ['asos', 'awoiaf'],
      ['The pyramid of Nakloz is named as one of Astapor\'s great pyramids.', '纳克洛兹金字塔被提及为阿斯塔波的大金字塔之一。'], ['Height, number of tiers and position in the city.', '高度、层数与城中位置。'], ['Six tiers with a plastered crown and dome, placed west of the plaza.', '六层，塔顶抹灰并覆圆顶；置于广场以西。'], ['Kraznys dies when Daenerys turns the Unsullied on the Good Masters; the pyramid is later sacked and burned.', '丹妮莉丝令无垢者反戈一击时，克拉兹尼丧命；这座金字塔后来也遭洗劫焚毁。']),
    'pyramid-of-ullhor': L(['Pyramid of Ullhor', '乌尔霍金字塔'], ['The pyramid of another great house, set here east of the plaza.', '另一大家族的金字塔，本场景置于广场以东。'], ['Astapor is ruled by many slaving families, not by a single lord.', '统治阿斯塔波的是众多奴隶主家族，而非一位君主。'], 'medium', ['asos', 'awoiaf'],
      ['A pyramid of Ullhor is named; the Good Master Grazdan mo Ullhor belongs to this house.', '书中提到乌尔霍金字塔；善主格拉兹丹·莫·乌尔霍即出自此家。'], ['Almost everything about its look and location.', '外观与位置几乎一无所知。'], ['Shaped like Nakloz but slightly smaller; the eastern position is invented.', '形制仿纳克洛兹而稍小；东侧位置为自拟。']),
    'unsullied-pits': L(['Training Yards', '无垢者训练场'], ['Walled brick yards where ranks of Unsullied drill in silence.', '砖墙围起的院落，成排的无垢者在此默然操练。'], ['Here boys are made into Unsullied: trained for years to know neither fear nor pain.', '男孩们在这里被炼成无垢者：经年训练，不知恐惧，不觉痛苦。'], 'low', ['asos'],
      ['Astapor trains and sells the Unsullied; the Good Masters describe their harsh training to Daenerys.', '阿斯塔波训练并出售无垢者；善主向丹妮莉丝讲述了严酷的训练过程。'], ['Where training takes place and what the grounds look like.', '训练在何处进行，场地是何模样。'], ['Three walled sand yards with ranks of figures; entirely invented.', '三座有围墙的沙地院落，内有成列人形；完全自拟。']),
    'slave-market': L(['Slave Market', '奴隶市场'], ['Awnings, auction blocks and pens where people are sold by the lot.', '遮阳棚、拍卖台与围栏，人被成批出售。'], ['A block for every sale: this trade built the city.', '一笔买卖一座拍卖台：这座城就是靠这门生意建起来的。'], 'low', ['asos', 'awoiaf'],
      ['Astapor is a slaving city; sales are shown in the Plaza of Pride.', '阿斯塔波是奴隶贸易之城；书中的买卖发生在骄傲广场。'], ['Whether a separate market quarter exists, and where.', '是否另有独立的市场区，又在何处。'], ['A separate market south-east of the plaza is an invention.', '广场东南另设市场区，纯属自拟。']),
    'red-walls': L(['Red Walls', '红砖城墙'], ['Thick, old walls of red brick, worn and crumbling.', '厚重古老的红砖城墙，风化剥落。'], ['The walls are old and tired; the city trusts its Unsullied more than its masonry.', '城墙古旧失修；这座城更倚仗无垢者，而非砖石。'], 'medium', ['asos', 'awoiaf'],
      ['Astapor\'s walls, like the rest of the city, are of red brick, and the city is old and decaying.', '阿斯塔波的城墙与全城一样以红砖砌成，城市古老而衰败。'], ['Wall height, towers and the number of gates.', '城墙高度、塔楼与城门数量。'], ['An oval circuit with stubby towers and four gates; rubble on the crest suggests decay.', '椭圆形城墙，设矮塔与四座城门；墙头碎砖示意破败。']),
    'harbour-gate': L(['Harbour Gate', '港口城门'], ['The sea gate, topped by an old, crumbling harpy.', '临海的城门，顶上立着一尊古旧残破的鹰身女妖。'], ['A crumbling harpy above the harbour gate greets every ship that docks.', '港口城门上，一尊残破的鹰身女妖迎接每一艘靠岸的船。'], 'medium', ['asos', 'awoiaf'],
      ['An old, crumbling harpy statue stands atop the harbour gate.', '港口城门顶上立着一尊古旧残破的鹰身女妖像。'], ['Its material, size and pose.', '材质、尺寸与姿态。'], ['A large stylised harpy over a broad gatehouse on the north wall.', '北墙一座宽阔门楼上的大型风格化鹰身女妖。']),
    'harbour': L(['Harbour', '海港'], ['Quays and piers on the bay, with cogs and galleys, where goods and captives come and go.', '海湾边的码头与栈桥，泊着柯克船与桨帆船，货物与俘虏由此进出。'], ['Daenerys\'s ships come into Slaver\'s Bay here: quays, hulls and gulls.', '丹妮莉丝的船队在此驶入奴隶湾：码头、船身与海鸥。'], 'medium', ['asos'],
      ['Astapor lies on the bay and Daenerys arrives there by ship.', '阿斯塔波濒临海湾，丹妮莉丝乘船抵达。'], ['Layout, depth and the volume of shipping.', '布局、水深与航运规模。'], ['A straight quay with four piers and moving ships; all invented.', '一道笔直岸壁、四座栈桥与往来船只；均为自拟。']),
    'brick-warrens': L(['Brick Warrens', '红砖街巷'], ['Dense, low red-brick houses with flat roofs and the odd dome, crowding between the pyramids.', '低矮密集的红砖平顶屋，偶见圆顶，挤在金字塔之间。'], ['Behind the pyramids lies a sea of low brick houses and dusty lanes.', '金字塔背后，是低矮砖屋与尘土小巷汇成的一片海。'], 'low', ['asos', 'awoiaf'],
      ['The whole city is built of red brick; its ordinary quarters are not described.', '全城以红砖建成；寻常街区并无描写。'], ['Everything about ordinary housing.', '平民住宅的一切细节。'], ['Randomly placed generic houses in a red palette.', '随机布置的普通房屋，统一为红色调。']),
  },
};
