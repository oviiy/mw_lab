// Places of this group — see docs/PLACES_SCHEMA.md
// Western Essos: the nine Free Cities, the Rhoyne and its ruined Rhoynish cities, the Volantene river towns, the Stepstones and the
// hills, forests and plains between them. Nature places reuse the ids/label points of src/map/geo.js FEATURES.
export default { group: 'free-cities', places: [
  // ---------------------------------------------------------------- the nine Free Cities + Selhorys (defined in locations.js)
  {
    id: 'braavos',
    summary: {
      en: 'The northernmost and richest of the Free Cities, founded on a fog-shrouded lagoon by slaves who fled Valyria and hid from the dragonlords for a century. Ruled by an elected Sealord, it is guarded by the Titan, funded by the Iron Bank and served by the Faceless Men of the House of Black and White.',
      zh: '自由贸易城邦中最北、也最富有的一座，由逃离瓦雷利亚的奴隶建于雾气笼罩的潟湖之上，曾隐匿百年而不为龙王所知。城邦由推选产生的海王统治，有布拉佛斯泰坦镇守海门，铁金库为其财源，黑白之院的无面者亦栖身于此。',
    },
    refs: ['agot', 'affc', 'adwd', 'twoiaf'],
    confidence: 'high',
    spoiler: { en: 'Arya Stark trains with the Faceless Men here in A Feast for Crows and A Dance with Dragons.', zh: '在《群鸦的盛宴》和《魔龙的狂舞》中，艾莉亚·史塔克在此随无面者受训。' },
  },
  {
    id: 'lorath',
    summary: {
      en: 'The smallest and poorest of the Free Cities, set on a cluster of bleak islands in the Bay of Lorath. Its islands are strewn with the vast stone mazes of a vanished people, and the city lives chiefly from fishing and whaling.',
      zh: '九大自由贸易城邦中最小也最贫穷的一座，坐落于洛拉斯湾中几座荒凉的岛屿上。岛上遍布一个早已消失的民族留下的巨大石砌迷宫，城邦主要以捕鱼和捕鲸为生。',
    },
    refs: ['agot', 'twoiaf'],
    confidence: 'high',
  },
  {
    id: 'pentos',
    summary: {
      en: 'A great trading port on the Narrow Sea, ruled by a prince chosen from the forty families but in practice governed by its rich magisters. It pays tribute to the passing Dothraki rather than fight them, and the exiled Viserys and Daenerys lived here as guests of Magister Illyrio Mopatis.',
      zh: '狭海之滨的大贸易港，名义上由从四十个家族中推选的亲王统治，实权却握在富有的总督们手中。潘托斯宁可向途经的多斯拉克人纳贡也不愿开战；流亡的韦赛里斯与丹妮莉丝曾在此寄居于伊利里欧·莫帕提斯总督府中。',
    },
    refs: ['agot', 'adwd', 'twoiaf'],
    confidence: 'high',
  },
  {
    id: 'norvos',
    summary: {
      en: 'An austere inland city on the Noyne, ruled by bearded priests and split between a high city on a hill and a low city on the river below. Its axe-bearing guards and its great bells are famous, and Prince Doran Martell\'s wife Mellario came from here.',
      zh: '诺伊河畔一座严峻的内陆城邦，由蓄须的祭司统治，分为山丘上的上城与河边的下城。城中手持长斧的卫士和巨钟闻名遐迩；多恩亲王道朗·马泰尔之妻梅拉莉欧即出身于此。',
    },
    refs: ['agot', 'affc', 'twoiaf'],
    confidence: 'high',
  },
  {
    id: 'qohor',
    summary: {
      en: 'An eastern Free City on the edge of the great Forest of Qohor, last outpost before the Dothraki sea. Its smiths are said to be the only ones still able to rework Valyrian steel, and its people worship the Black Goat with blood sacrifice.',
      zh: '位于科霍尔森林边缘的东部自由贸易城邦，是多斯拉克海之前的最后一座城市。据说城中铁匠是世上仅存懂得重铸瓦雷利亚钢的人，居民则以血祭供奉黑山羊。',
    },
    refs: ['agot', 'asos', 'twoiaf'],
    confidence: 'high',
  },
  {
    id: 'myr',
    summary: {
      en: 'A port city on a gulf of the Narrow Sea, famous for fine lace, carpets, lenses and its crossbowmen and sellswords. It is endlessly at war with Lys and Tyrosh over the Disputed Lands, and Thoros of Myr, the red priest, came from here.',
      zh: '坐落于狭海一处海湾畔的港口城邦，以精美蕾丝、地毯、透镜以及弩手和佣兵闻名。密尔为争夺争议之地与里斯、泰洛西征战不休；红袍僧密尔的索罗斯即出身于此。',
    },
    refs: ['agot', 'acok', 'twoiaf'],
    confidence: 'high',
  },
  {
    id: 'tyrosh',
    summary: {
      en: 'An island city at the northern end of the Stepstones, ruled by an archon and grown rich on dyes, sweet wines and the sea trade. Tyroshi are known for their brightly dyed hair and beards, and for selling their swords and ships to the highest bidder.',
      zh: '位于石阶列岛北端的岛屿城邦，由执政者统治，靠染料、甜酒和海上贸易致富。泰洛西人以染得五颜六色的头发和胡须著称，也以向出价最高者出卖刀剑与船只闻名。',
    },
    refs: ['agot', 'acok', 'twoiaf'],
    confidence: 'high',
  },
  {
    id: 'lys',
    summary: {
      en: 'An island city south of the Stepstones, renowned for its pleasure houses, its poisons and its pale-haired, violet-eyed people who still carry the blood of Valyria. Its magisters are among the richest slave-traders of the west, and it vies with Myr and Tyrosh over the Disputed Lands.',
      zh: '石阶列岛以南的岛屿城邦，以欢乐馆、毒药闻名，居民多为浅发紫眼，仍带着瓦雷利亚的血统。里斯总督是西方最富有的奴隶贩子之一，并与密尔、泰洛西争夺争议之地。',
    },
    houses: ['rogare'],
    refs: ['agot', 'acok', 'twoiaf'],
    confidence: 'high',
  },
  {
    id: 'volantis',
    summary: {
      en: 'The oldest and proudest of the Free Cities, straddling the mouth of the Rhoyne and joined by the Long Bridge. The old blood of Valyria lives within the Black Walls, three triarchs are elected each year, and five slaves walk its streets for every free man.',
      zh: '最古老、也最骄傲的自由贸易城邦，横跨洛恩河口，两岸以长桥相连。瓦雷利亚旧血脉居于黑墙之内，城中每年选出三位执政官，街上每有一个自由人就有五个奴隶。',
    },
    houses: ['maegyr', 'vhassar', 'paenymion'],
    refs: ['adwd', 'twoiaf'],
    confidence: 'high',
  },
  {
    id: 'selhorys',
    summary: {
      en: 'A Volantene river town where the Selhoru joins the Rhoyne, the first proper town a traveller meets after the ruined Rhoynish reaches upstream. It is Volantis\'s northern bulwark on the river, with a garrison, temples and a busy waterfront.',
      zh: '塞尔霍鲁河汇入洛恩河处的瓦兰提斯河畔城镇，也是旅人穿过上游洛伊拿废墟后遇到的第一座像样的城镇。它是瓦兰提斯在河上的北方屏障，城中驻有守军，神庙林立，码头繁忙。',
    },
    refs: ['adwd', 'twoiaf'],
    confidence: 'medium',
    spoiler: { en: 'In A Dance with Dragons Tyrion is seized in a Selhorys brothel by Jorah Mormont.', zh: '在《魔龙的狂舞》中，提利昂在塞尔霍利斯的一家妓院被乔拉·莫尔蒙抓走。' },
  },

  // ---------------------------------------------------------------- the Rhoyne and its tributaries
  {
    id: 'rhoyne', kind: 'river', region: 'free-cities', at: [1036, 1100], rank: 4,
    names: { en: 'The Rhoyne', zh: '洛恩河' }, alt: ['Mother Rhoyne', '洛恩母亲', '罗伊拿河'],
    summary: {
      en: 'The greatest river of the west of Essos, called Mother Rhoyne by the Rhoynar who once built a civilisation of river cities along her banks. Fed by many tributaries, she runs south for hundreds of miles to the sea at Volantis.',
      zh: '厄索斯西部最大的河流，昔日沿岸建起一连串河畔城市的洛伊拿人尊称她为“洛恩母亲”。她汇聚众多支流，向南奔流数百英里，在瓦兰提斯入海。',
    },
    refs: ['adwd', 'twoiaf', 'maps'], confidence: 'high',
  },
  {
    id: 'upper-rhoyne', kind: 'river', region: 'free-cities', at: [990, 740], rank: 2,
    names: { en: 'The Upper Rhoyne', zh: '上洛恩河' }, alt: ['Rhoyne headwaters'],
    summary: {
      en: 'The northern reach of the Rhoyne, flowing down from the Hills of Norvos past the Forest of Qohor. The ruins of Ny Sar stand on its banks.',
      zh: '洛恩河的北段，自诺佛斯丘陵流下，经过科霍尔森林。尼·萨的废墟就矗立在它的岸边。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'little-rhoyne', kind: 'river', region: 'free-cities', at: [1052, 800], rank: 2,
    names: { en: 'The Little Rhoyne', zh: '小洛恩河' },
    summary: {
      en: 'An eastern tributary that flows past Qohor and through its forest before joining the Rhoyne. It gives Qohor its river link to the south.',
      zh: '洛恩河的一条东部支流，流经科霍尔城及其森林后汇入洛恩河，为科霍尔提供了通往南方的水路。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'noyne', kind: 'river', region: 'free-cities', at: [946, 790], rank: 2,
    names: { en: 'The Noyne', zh: '诺伊河' },
    summary: {
      en: 'A western tributary of the Rhoyne that flows past Norvos and meets the main river at the ruins of Ghoyan Drohe. River traffic from Pentos and Norvos joins the Rhoyne here.',
      zh: '洛恩河的西部支流，流经诺佛斯，在戈延·卓赫废墟处汇入干流。来自潘托斯和诺佛斯方向的船只由此进入洛恩河。',
    },
    refs: ['adwd', 'twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'qhoyne', kind: 'river', region: 'free-cities', at: [1050, 908], rank: 2,
    names: { en: 'The Qhoyne', zh: '克霍伊河' },
    summary: {
      en: 'An eastern tributary flowing out of the plains towards the Rhoyne, which it joins at the ruins of Ar Noy.',
      zh: '一条发源于东方平原的支流，向西流入洛恩河，交汇处便是阿·诺伊的废墟。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'lhorulu', kind: 'river', region: 'free-cities', at: [1036, 974], rank: 1,
    names: { en: 'The Lhorulu', zh: '洛鲁鲁河' },
    summary: {
      en: 'A lesser eastern tributary that meets the Rhoyne near the drowned ruins of Chroyane, in the fog of the Sorrows.',
      zh: '一条较小的东部支流，在哀伤之地的迷雾中、克罗扬沉没废墟附近汇入洛恩河。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'low',
  },
  {
    id: 'selhoru', kind: 'river', region: 'free-cities', at: [1052, 1054], rank: 1,
    names: { en: 'The Selhoru', zh: '塞尔霍鲁河' },
    summary: {
      en: 'An eastern tributary that joins the Rhoyne at the Volantene town of Selhorys, which takes its name from the river.',
      zh: '洛恩河的东部支流，在瓦兰提斯治下的塞尔霍利斯镇汇入干流，该镇即因此河得名。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'sorrows', kind: 'swamp', region: 'free-cities', at: [1014, 996], rank: 2,
    names: { en: 'The Sorrows', zh: '哀伤之地' }, alt: ['Shrouded Lord'],
    summary: {
      en: 'A stretch of the Rhoyne around ruined Chroyane where a thick, unnatural fog never lifts. Rivermen say it is the curse of Garin the Great, and they fear the stone men — victims of greyscale — who lurk in the ruins under the rule of the Shrouded Lord.',
      zh: '洛恩河在克罗扬废墟一带的河段，终年笼罩着一层浓重而诡异的迷雾。船夫们说这是伟大的加林留下的诅咒，并畏惧潜伏在废墟中、听命于“裹布之王”的石人——那些染上灰鳞病的可怜人。',
    },
    refs: ['adwd', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'dagger-lake', kind: 'lake', region: 'free-cities', at: [1126, 868], rank: 2,
    names: { en: 'Dagger Lake', zh: '匕首湖' },
    summary: {
      en: 'A long lake in the lands east of the Rhoyne, notorious in the histories as a haunt of lake pirates who preyed on river traffic.',
      zh: '洛恩河以东地区的一座狭长湖泊，在史书中以湖盗出没、劫掠往来船只而著称。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'low',
  },

  // ---------------------------------------------------------------- ruined Rhoynish cities and Volantene river towns
  {
    id: 'ny-sar', kind: 'ruin', region: 'free-cities', at: [986, 712], rank: 2,
    names: { en: 'Ny Sar', zh: '尼·萨' }, alt: ['Nysar'],
    summary: {
      en: 'A ruined Rhoynish city on the upper Rhoyne, remembered as the city of Princess Nymeria. When Valyria destroyed the Rhoynar, Nymeria led her people from here on the long flight that ended in Dorne.',
      zh: '上洛恩河畔一座洛伊拿废城，被人们记作奈梅莉亚公主的城市。瓦雷利亚摧毁洛伊拿诸城之后，奈梅莉亚由此率领族人踏上漫长的流亡之路，最终在多恩落脚。',
    },
    houses: [], refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'ghoyan-drohe', kind: 'ruin', region: 'free-cities', at: [982, 870], rank: 2,
    names: { en: 'Ghoyan Drohe', zh: '戈延·卓赫' },
    summary: {
      en: 'The ruins of a Rhoynish city where the Noyne meets the Rhoyne, burned by the dragons in the wars against Valyria. Travellers from Pentos take boat here to go downriver.',
      zh: '诺伊河与洛恩河交汇处的一座洛伊拿城市废墟，毁于对抗瓦雷利亚战争中的龙焰。从潘托斯来的旅人常在这里登船顺流而下。',
    },
    refs: ['adwd', 'twoiaf'], confidence: 'high',
    spoiler: { en: 'Tyrion joins Griff\'s party on the Shy Maid here in A Dance with Dragons.', zh: '在《魔龙的狂舞》中，提利昂在此登上“羞怯少女号”，加入格里夫一行。' },
  },
  {
    id: 'sar-mell', kind: 'ruin', region: 'free-cities', at: [986, 902], rank: 1,
    names: { en: 'Sar Mell', zh: '萨·梅尔' },
    summary: {
      en: 'One of the lost cities of the Rhoynar, overrun when Valyria broke their confederation. Its site on the river is given only roughly here.',
      zh: '洛伊拿人已失落的城市之一，在瓦雷利亚击溃洛伊拿诸城联盟时陷落。此处标注的河畔位置仅为大致推测。',
    },
    refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'ar-noy', kind: 'ruin', region: 'free-cities', at: [992, 930], rank: 2,
    names: { en: 'Ar Noy', zh: '阿·诺伊' },
    summary: {
      en: 'A ruined Rhoynish city at the meeting of the Qhoyne and the Rhoyne. Like its sisters it fell in the wars with Valyria, and only broken stone remains.',
      zh: '克霍伊河与洛恩河交汇处的一座洛伊拿城市废墟。它和姊妹城市一样陷落于与瓦雷利亚的战争，如今只余断壁残垣。',
    },
    refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'chroyane', kind: 'ruin', region: 'free-cities', at: [1006, 980], rank: 3,
    names: { en: 'Chroyane', zh: '克罗扬' }, alt: ['Festival city'],
    summary: {
      en: 'Once the "festival city" of the Rhoynar, home of Garin the Great, who rose against Valyria and was destroyed with his army. Its drowned ruins now lie half-sunk in the Rhoyne amid the fogs of the Sorrows.',
      zh: '昔日洛伊拿人的“节庆之城”，也是伟大的加林的故乡；加林起兵反抗瓦雷利亚，最终与大军一同覆灭。如今它的废墟半没于洛恩河中，隐在哀伤之地的迷雾里。',
    },
    refs: ['adwd', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'bridge-of-dream', kind: 'landmark', region: 'free-cities', at: [1000, 986], rank: 1,
    names: { en: 'Bridge of Dream', zh: '梦之桥' },
    summary: {
      en: 'A broken stone bridge spanning the Rhoyne in the ruins of Chroyane. Boats must pass beneath it, and the stone men of the Sorrows are said to drop from it onto passing decks.',
      zh: '克罗扬废墟中横跨洛恩河的一座残破石桥。过往船只必须从桥下穿过，据说哀伤之地的石人会从桥上跳落到甲板上。',
    },
    refs: ['adwd'], confidence: 'medium',
    spoiler: { en: 'Stone men attack the Shy Maid beneath the bridge; Tyrion is dragged into the river and afterwards fears he has caught greyscale.', zh: '石人在桥下袭击“羞怯少女号”，提利昂被拖入河中，从此担心自己染上了灰鳞病。' },
  },
  {
    id: 'palace-of-love', kind: 'ruin', region: 'free-cities', at: [1012, 974], rank: 1,
    names: { en: 'Palace of Love', zh: '爱之宫' },
    summary: {
      en: 'A ruined palace in drowned Chroyane, glimpsed through the fog by river travellers. Its broken halls recall the city\'s lost splendour.',
      zh: '沉没的克罗扬城中一座宫殿的废墟，河上旅人只能透过迷雾窥见其轮廓。残破的厅堂令人追想这座城市昔日的繁华。',
    },
    refs: ['adwd'], confidence: 'medium',
  },
  {
    id: 'valysar', kind: 'town', region: 'free-cities', at: [1044, 1118], rank: 2,
    names: { en: 'Valysar', zh: '瓦利萨' },
    summary: {
      en: 'A Volantene town on the lower Rhoyne between Selhorys and Volon Therys. Its river garrisons and boats tie the towns of the river to the mother city.',
      zh: '洛恩河下游的一座瓦兰提斯城镇，位于塞尔霍利斯与沃隆·塞利斯之间。河上的驻军和船只将沿河诸镇与母城紧密相连。',
    },
    refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'volon-therys', kind: 'town', region: 'free-cities', at: [1050, 1166], rank: 2,
    names: { en: 'Volon Therys', zh: '沃隆·塞利斯' },
    summary: {
      en: 'The last Volantene town on the Rhoyne before Volantis itself, a short way upriver from the sea. Travellers heading for the city by boat pass it on their final day.',
      zh: '洛恩河上到达瓦兰提斯本城前的最后一座瓦兰提斯城镇，距入海口不远。乘船前往瓦兰提斯的旅人会在航程的最后一天经过这里。',
    },
    refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },

  // ---------------------------------------------------------------- hills, forests and plains
  {
    id: 'forest-of-qohor', kind: 'forest', region: 'free-cities', at: [1020, 760], rank: 3,
    names: { en: 'The Forest of Qohor', zh: '科霍尔森林' },
    summary: {
      en: 'A vast forest stretching west of Qohor, the largest in western Essos. Khal Drogo\'s khalasar crossed it on the way east, and the Qohorik draw their timber and furs from its depths.',
      zh: '科霍尔以西的一片广袤森林，是厄索斯西部最大的林地。卓戈卡奥的卡拉萨东行时曾穿越此林，科霍尔人也从林中取得木材与毛皮。',
    },
    refs: ['agot', 'twoiaf', 'maps'], confidence: 'high',
  },
  {
    id: 'hills-of-norvos', kind: 'mountain', region: 'free-cities', at: [940, 690], rank: 2,
    names: { en: 'Hills of Norvos', zh: '诺佛斯丘陵' },
    summary: {
      en: 'Rolling uplands north of Norvos where the Noyne and the upper Rhoyne take their rise. They formed part of the ancient homeland of the Andals.',
      zh: '诺佛斯以北的起伏高地，诺伊河与上洛恩河皆发源于此，曾是安达尔人古老故土的一部分。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'hills-of-andalos', kind: 'mountain', region: 'free-cities', at: [830, 740], rank: 2,
    names: { en: 'Hills of Andalos', zh: '安达洛斯丘陵' }, alt: ['Andalos', '安达洛斯'],
    summary: {
      en: 'Hill country in the lands between Braavos and Pentos, once part of Andalos, the homeland of the Andals. The Faith of the Seven holds that the Seven walked these hills, and from here the Andals crossed the sea to conquer Westeros.',
      zh: '布拉佛斯与潘托斯之间的丘陵地带，昔为安达尔人的故土安达洛斯的一部分。七神信仰认为七神曾行走于这片山丘，安达尔人也正是由此渡海征服维斯特洛。',
    },
    refs: ['agot', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'the-axe', kind: 'landmark', region: 'free-cities', at: [882, 522], rank: 2,
    names: { en: 'The Axe', zh: '斧头半岛' },
    summary: {
      en: 'A rugged peninsula jutting north into the Shivering Sea west of the Bay of Lorath, at the northern edge of the old Andal lands.',
      zh: '位于洛拉斯湾以西、向北伸入颤抖海的一座崎岖半岛，地处古代安达尔人领土的北缘。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'medium',
  },
  {
    id: 'velvet-hills', kind: 'mountain', region: 'free-cities', at: [920, 910], rank: 2,
    names: { en: 'Velvet Hills', zh: '天鹅绒丘陵' },
    summary: {
      en: 'Soft, green hills in the Pentoshi hinterland between the coast and the Rhoyne. Travellers going overland from Pentos to the river cross them on the way to Ghoyan Drohe.',
      zh: '潘托斯腹地中、海岸与洛恩河之间一片柔缓的绿色丘陵。从潘托斯走陆路前往洛恩河的旅人，会穿过这里抵达戈延·卓赫。',
    },
    refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'flatlands', kind: 'landmark', region: 'free-cities', at: [860, 840], rank: 2,
    names: { en: 'The Flatlands', zh: '平地' }, alt: ['Pentoshi plains', '平原'],
    summary: {
      en: 'The level grasslands behind Pentos. Here the Dothraki khalasars camp when they come to collect their "gifts", and Daenerys was wed to Khal Drogo outside the city walls.',
      zh: '潘托斯城后的一片平坦草原。多斯拉克卡拉萨前来收取“礼物”时便在此扎营，丹妮莉丝与卓戈卡奥的婚礼也在城墙外的这片土地上举行。',
    },
    refs: ['agot', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'golden-fields', kind: 'landmark', region: 'free-cities', at: [1110, 940], rank: 2,
    names: { en: 'The Golden Fields', zh: '金色原野' },
    summary: {
      en: 'Rich grain lands east of the Rhoyne, between its eastern tributaries. They fed the Rhoynish cities of old and lie on the margin of the Dothraki sea.',
      zh: '洛恩河以东、几条东部支流之间的富饶谷地，昔日供养着洛伊拿诸城，如今地处多斯拉克海的边缘。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'low',
  },
  {
    id: 'disputed-lands', kind: 'landmark', region: 'free-cities', at: [846, 1150], rank: 3,
    names: { en: 'The Disputed Lands', zh: '争议之地' },
    summary: {
      en: 'Contested borderlands between Myr, Lys and Tyrosh, fought over for centuries and changing hands with every alliance. Sellsword companies, the Golden Company among them, find steady employment in their wars.',
      zh: '密尔、里斯与泰洛西之间的边境地带，数百年来争战不休，随每一次结盟变换而易手。佣兵团——包括黄金团——在这里的战事中总能找到差事。',
    },
    refs: ['agot', 'adwd', 'twoiaf'], confidence: 'high',
  },
  {
    id: 'orange-shore', kind: 'landmark', region: 'free-cities', at: [960, 1212], rank: 2,
    names: { en: 'The Orange Shore', zh: '橙色海岸' },
    summary: {
      en: 'The warm southern coast running west from the mouth of the Rhoyne towards the Disputed Lands, part of the Volantene sphere and known for its orange groves.',
      zh: '自洛恩河口向西延伸至争议之地的温暖南部海岸，属瓦兰提斯势力范围，以橙树林闻名。',
    },
    refs: ['adwd', 'maps'], confidence: 'low',
  },
  {
    id: 'demon-road', kind: 'landmark', region: 'valyria', at: [1112, 1228], rank: 2,
    names: { en: 'The Demon Road', zh: '恶魔之路' },
    summary: {
      en: 'The old Valyrian road leading east from Volantis across the neck of the Valyrian peninsula towards Mantarys and Slaver\'s Bay. Its name comes from the dangers of the lands it crosses, and travellers prefer the sea.',
      zh: '一条古老的瓦雷利亚大道，自瓦兰提斯向东穿过瓦雷利亚半岛的颈部，通往曼塔里斯与奴隶湾。此路因沿途凶险而得名，旅人多宁愿走海路。',
    },
    refs: ['adwd', 'twoiaf'], confidence: 'medium',
  },
  {
    id: 'battle-of-qohor', kind: 'battle', region: 'free-cities', at: [1092, 788], rank: 2,
    names: { en: 'The Three Thousand of Qohor', zh: '科霍尔的三千勇士' }, alt: ['Battle of Qohor', '科霍尔之战'],
    summary: {
      en: 'Before the gates of Qohor, three thousand Unsullied hired by the city stood against a Dothraki horde many times their number and broke charge after charge. The Dothraki who survived cut off their braids in shame, and the tale made the Unsullied famous.',
      zh: '在科霍尔城门前，城邦雇来的三千名无垢者迎战数倍于己的多斯拉克大军，一次又一次击退冲锋。幸存的多斯拉克人羞愧地割掉了辫子，无垢者也因此役声名远扬。',
    },
    refs: ['asos', 'twoiaf'], confidence: 'medium',
  },

  // ---------------------------------------------------------------- seas and islands
  {
    id: 'bay-of-lorath', kind: 'bay', region: 'free-cities', at: [960, 560], rank: 2,
    names: { en: 'Bay of Lorath', zh: '洛拉斯湾' },
    summary: {
      en: 'The sheltered bay on Essos\'s northern coast in which the Isles of Lorath lie, opening onto the Shivering Sea.',
      zh: '厄索斯北岸一处避风的海湾，洛拉斯群岛就坐落其中，湾口朝向颤抖海。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'high',
  },
  {
    id: 'isles-of-lorath', kind: 'island', region: 'free-cities', at: [946, 534], rank: 1,
    names: { en: 'Isles of Lorath', zh: '洛拉斯群岛' },
    summary: {
      en: 'A small group of rocky islands in the Bay of Lorath, the largest of which holds the Free City of Lorath. Earlier peoples left mazes and ruins on all of them.',
      zh: '洛拉斯湾中的一小群岩石岛屿，自由贸易城邦洛拉斯坐落在其中最大的一座岛上。早先的民族在各岛上都留下了迷宫与遗迹。',
    },
    refs: ['twoiaf', 'maps'], confidence: 'high',
  },
  {
    id: 'lorath-mazes', kind: 'ruin', region: 'free-cities', at: [998, 518], rank: 1,
    names: { en: 'Mazes of the Mazemakers', zh: '迷宫建造者的迷宫' }, alt: ['Mazemakers', '迷宫建造者'],
    summary: {
      en: 'Great stone labyrinths raised on the Isles of Lorath by the mysterious Mazemakers, a people who vanished long before the Andals or Valyrians came. No one knows their purpose.',
      zh: '神秘的“迷宫建造者”在洛拉斯群岛上修筑的巨大石砌迷宫；这个民族早在安达尔人与瓦雷利亚人到来之前便已消失。无人知晓这些迷宫的用途。',
    },
    refs: ['twoiaf'], confidence: 'medium',
  },
  {
    id: 'stepstones', kind: 'island', region: 'free-cities', at: [704, 1208], rank: 3,
    names: { en: 'The Stepstones', zh: '石阶列岛' },
    summary: {
      en: 'A broken chain of islands strung between Dorne\'s Broken Arm and Essos — said to be the remnant of an ancient land bridge, the Arm of Dorne. Long a nest of pirates and a battleground of the Free Cities, they were also where the War of the Ninepenny Kings was fought.',
      zh: '一串散落于多恩断臂角与厄索斯之间的破碎岛链，相传是古时连接两块大陆的陆桥“多恩之臂”的残余。这里长期是海盗的巢穴和自由贸易城邦争夺的战场，九铜板王之战也在此进行。',
    },
    refs: ['agot', 'twoiaf', 'maps'], confidence: 'high',
  },
  {
    id: 'bloodstone', kind: 'island', region: 'free-cities', at: [737, 1190], rank: 2,
    names: { en: 'Bloodstone', zh: '血石岛' },
    summary: {
      en: 'One of the larger islands of the Stepstones, fought over in the wars between Prince Daemon Targaryen and the Triarchy, and again in later struggles for the islands.',
      zh: '石阶列岛中较大的岛屿之一，戴蒙·坦格利安王子与三女儿联盟交战时曾为争夺焦点，后来群岛的历次争斗中也屡遭战火。',
    },
    refs: ['twoiaf'], confidence: 'medium',
  },
  {
    id: 'grey-gallows', kind: 'island', region: 'free-cities', at: [770, 1176], rank: 1,
    names: { en: 'Grey Gallows', zh: '灰色绞架岛' },
    summary: {
      en: 'An island of the Stepstones named in the histories of the wars fought over the chain. Its position here is approximate.',
      zh: '石阶列岛中的一座岛屿，见于围绕群岛所发生的战争史载。此处位置为大致推测。',
    },
    refs: ['twoiaf'], confidence: 'low',
  },
  {
    id: 'torturers-deep', kind: 'bay', region: 'free-cities', at: [748, 1206], rank: 1,
    names: { en: "Torturer's Deep", zh: '拷问者深渊' },
    summary: {
      en: 'A deep channel among the Stepstones, one of the passages ships must thread between the islands. Its exact position is approximate.',
      zh: '石阶列岛间的一条深水航道，是船只穿行群岛时必经的水道之一。具体位置为大致推测。',
    },
    refs: ['twoiaf'], confidence: 'low',
  },
] };
