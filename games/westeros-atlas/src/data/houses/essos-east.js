// Houses of this group — see docs/PLACES_SCHEMA.md
// The Ghiscari "great families" of Slaver's Bay are named in ASOS/ADWD mostly through their pyramids, their hostages and a few
// nobles. The novels describe no sigils or words for them, so `sigil` says so honestly and `colors` are neutral placeholders.
// Members are listed only where the books name the person and tie them to the family; no parents or children are invented.
// Naming: Meereenese and Yunkish nobles put "zo" before the family name (Hizdahr zo Loraq); "mo" appears in other names
// (Skahaz mo Kandaq, Reznak mo Reznak, Kraznys mo Nakloz).

const NO_SIGIL = { en: 'No sigil is described in the books; the family is identified by its name and its pyramid.', zh: '书中未描述其纹章；人们以姓氏和家族金字塔来辨识这一家族。' };
const H = (id, en, zh, seat, tier, colors, summary, refs, members = []) =>
  ({ id, names: { en, zh }, region: 'slavers-bay', seat, tier, liege: null, sigil: NO_SIGIL, colors, summary, refs, members });

export default { group: 'essos-east', houses: [
  H('loraq', 'House Loraq', '洛拉克家族', 'meereen', 'major', ['#7a2e2a', '#d9b46a'],
    { en: 'One of the oldest and noblest families of Meereen, said to descend from ancient Ghiscari rulers. Its pyramid stands among the great ones of the city, and its head in the novels, Hizdahr, is a wealthy and conciliatory noble.',
      zh: '弥林最古老、最高贵的家族之一，据说是古代吉斯统治者的后裔。家族金字塔位列城中大金字塔之列；小说中的家主希兹达尔是一位富有而善于调和的贵族。' },
    ['asos', 'adwd'], [
      { id: 'hizdahr-zo-loraq', name: { en: 'Hizdahr zo Loraq', zh: '希兹达尔·佐·洛拉克' },
        note: { en: 'Meereenese noble of an ancient line; he petitions Daenerys to restore the fighting pits.', zh: '出身古老世家的弥林贵族，曾向丹妮莉丝请愿重开角斗场。' },
        fate: { en: 'Married Daenerys and was crowned King of Meereen to make peace with Yunkai (ADWD); he is suspected of links to the Sons of the Harpy and is imprisoned after her disappearance.', zh: '为与渊凯议和，他娶了丹妮莉丝并加冕为弥林国王（卷五）；他被怀疑与鹰身女妖之子有所勾连，在丹妮莉丝失踪后遭到囚禁。' },
        spoiler: false },
      { id: 'marghaz-zo-loraq', name: { en: 'Marghaz zo Loraq', zh: '马格哈兹·佐·洛拉克' },
        note: { en: 'Hizdahr\'s cousin, given command of the Brazen Beasts in ADWD.', zh: '希兹达尔的堂亲，卷五中被任命统领铜兽。' }, spoiler: false },
    ]),
  H('pahl', 'House Pahl', '帕尔家族', 'meereen', 'major', ['#3f4a6b', '#c9a24a'],
    { en: 'A proud Meereenese family whose sons served in the city\'s defence. Its champion rode out to mock the besiegers when Meereen was attacked, and the family later had blood scores to settle with the city\'s new rulers.',
      zh: '骄傲的弥林家族，家中子弟曾参与守城。弥林遭围攻时，家族的勇士曾骑马出城嘲弄围城者；此后该家族与城市的新统治者结下血仇。' },
    ['asos', 'adwd'], [
      { id: 'oznak-zo-pahl', name: { en: 'Oznak zo Pahl', zh: '奥兹纳克·佐·帕尔' },
        note: { en: 'Meereenese champion who rode out to challenge the besiegers at the gates.', zh: '弥林勇士，骑马出城向城下的围城者挑战。' },
        fate: { en: 'Slain in single combat by Strong Belwas (ASOS).', zh: '在单挑中被壮汉贝沃斯所杀（卷三）。' }, spoiler: false },
    ]),
  H('galare', 'House Galare', '加拉尔家族', 'meereen', 'major', ['#2f5d4a', '#e8dcb5'],
    { en: 'An old Meereenese family closely tied to the Temple of the Graces. Its most prominent member is the Green Grace, the high priestess who acts as a go-between for the city\'s nobles.',
      zh: '与美惠神庙关系密切的弥林古老家族。其最著名的成员是绿色圣女，她身为大祭司，常在城中贵族之间斡旋。' },
    ['asos', 'adwd'], [
      { id: 'galazza-galare', name: { en: 'Galazza Galare', zh: '葛拉札·加拉尔' },
        note: { en: 'The Green Grace, high priestess of the Temple of the Graces and an adviser to Daenerys.', zh: '绿色圣女，美惠神庙的大祭司，丹妮莉丝的顾问。' }, spoiler: false },
      { id: 'grazdan-zo-galare', name: { en: 'Grazdan zo Galare', zh: '格拉兹丹·佐·加拉尔' },
        note: { en: 'Meereenese noble of the family named in ADWD.', zh: '卷五中提及的该家族弥林贵族。' }, spoiler: false },
    ]),
  H('merreq', 'House Merreq', '梅瑞克家族', 'meereen', 'minor', ['#5a3b2a', '#cfa66a'],
    { en: 'One of the Meereenese great families named in ADWD, which gave children to Daenerys\'s court as hostages. The novels give no further detail about it.',
      zh: '卷五中提及的弥林名门之一，曾将子女送入丹妮莉丝的宫廷充当人质。小说中别无更多细节。' }, ['adwd']),
  H('ghazeen', 'House Ghazeen', '加津家族', 'meereen', 'minor', ['#6b5a2a', '#e0c070'],
    { en: 'A Meereenese pyramid family named in ADWD among the nobles who sent hostages to the queen. Little else is said of it.',
      zh: '卷五中提到的弥林金字塔家族，曾向女王送交人质。此外着墨甚少。' }, ['adwd']),
  H('rhazdar', 'House Rhazdar', '拉兹达家族', 'meereen', 'minor', ['#4a2f3f', '#d4b080'],
    { en: 'One of the old families of Meereen whose name appears in ADWD. The novels describe nothing more of it.',
      zh: '卷五中出现过名字的弥林古老家族之一。小说中没有更多描述。' }, ['adwd']),
  H('zhak', 'House Zhak', '札克家族', 'meereen', 'minor', ['#2f3f4a', '#c8b48a'],
    { en: 'A noble family of Meereen named in ADWD, among those whose children served as the queen\'s cupbearers and hostages.',
      zh: '卷五中提到的弥林贵族家族，其子女曾作为女王的侍酒童和人质。' }, ['adwd']),
  H('hazkar', 'House Hazkar', '哈兹卡家族', 'meereen', 'minor', ['#3d4a2a', '#d8c27a'],
    { en: 'A Meereenese noble house mentioned in ADWD among the city\'s pyramid families. Nothing else is recorded about it.',
      zh: '卷五中提到的弥林金字塔家族之一。别无更多记载。' }, ['adwd']),
  H('uhlez', 'House Uhlez', '乌勒兹家族', 'meereen', 'minor', ['#4a3a5a', '#d6bf8a'],
    { en: 'One of the pyramid families of Meereen named in ADWD. The novels say little more than its name and its pyramid.',
      zh: '卷五中提到的弥林金字塔家族之一。小说中除名字与金字塔外几乎没有着墨。' }, ['adwd']),
  H('kandaq', 'House Kandaq', '坎达克家族', 'meereen', 'minor', ['#5a2a2a', '#b8b0a0'],
    { en: 'A lesser Meereenese family, known through its member Skahaz, who shaved his head to show he had broken with the old ways and served the new queen.',
      zh: '弥林的次等家族，因其成员斯卡哈兹而为人所知；他剃光头发以示与旧俗决裂，转而效忠新女王。' },
    ['asos', 'adwd'], [
      { id: 'skahaz-mo-kandaq', name: { en: 'Skahaz mo Kandaq', zh: '斯卡哈兹·莫·坎达克' },
        note: { en: 'The Shavepate, commander of the Brazen Beasts and Daenerys\'s most hawkish Meereenese adviser.', zh: '“剃头者”，铜兽的指挥官，丹妮莉丝的弥林顾问中最强硬的一位。' }, spoiler: false },
    ]),
  H('reznak', 'Reznak family', '雷兹纳克家族', 'meereen', 'minor', ['#4a4a2a', '#e6d39a'],
    { en: 'The family of Reznak mo Reznak, the perfumed seneschal who served Daenerys in Meereen. The books treat him as a man of the city rather than of a great house, so this entry is kept minimal.',
      zh: '雷兹纳克·莫·雷兹纳克的家族；这位满身香气的总管曾在弥林为丹妮莉丝效力。书中将他视为城中人士而非名门出身，故此条目从简。' },
    ['asos', 'adwd'], [
      { id: 'reznak-mo-reznak', name: { en: 'Reznak mo Reznak', zh: '雷兹纳克·莫·雷兹纳克' },
        note: { en: 'Seneschal of Meereen under Daenerys, obsequious and heavily perfumed.', zh: '丹妮莉丝治下的弥林总管，谄媚逢迎，浑身香气。' }, spoiler: false },
    ]),
  H('qaggaz', 'House Qaggaz', '卡加兹家族', 'yunkai', 'minor', ['#8a6d1f', '#f1df9a'],
    { en: 'A family of the Wise Masters of Yunkai. Its member Yezzan is one of the richest slavers of the city and owns a troupe of grotesques and performers.',
      zh: '渊凯智者的家族之一。其成员耶赞是城中最富有的奴隶主之一，蓄养着一班畸人与艺人。' },
    ['adwd'], [
      { id: 'yezzan-zo-qaggaz', name: { en: 'Yezzan zo Qaggaz', zh: '耶赞·佐·卡加兹' },
        note: { en: 'Grossly fat Yunkish Wise Master at the siege of Meereen, a collector of slaves with deformities and talents.', zh: '参加弥林围攻的渊凯智者，极度肥胖，专门收集畸形或身怀技艺的奴隶。' },
        fate: { en: 'Fell sick with the bloody flux in the camp outside Meereen (ADWD).', zh: '在弥林城外营地染上血痢（卷五）。' }, spoiler: false },
    ]),
  H('eraz', 'House Eraz', '埃拉兹家族', 'yunkai', 'minor', ['#9a7a2a', '#f4e4b0'],
    { en: 'A Yunkish family of the Wise Masters, known through the envoy who came out to treat with the dragon queen before the walls of Yunkai.',
      zh: '渊凯智者家族之一，因其使者在渊凯城下与龙女王谈判而为人所知。' },
    ['asos'], [
      { id: 'grazdan-mo-eraz', name: { en: 'Grazdan mo Eraz', zh: '格拉兹丹·莫·埃拉兹' },
        note: { en: 'Yunkish envoy sent to negotiate with Daenerys outside the city.', zh: '渊凯派往城外与丹妮莉丝谈判的使者。' }, spoiler: false },
    ]),
  H('nakloz', 'House Nakloz', '纳克罗兹家族', 'astapor', 'minor', ['#8a2a1f', '#e8c49a'],
    { en: 'A family of the Good Masters of Astapor, slave-traders who dealt in the Unsullied.',
      zh: '阿斯塔波善主家族之一，以买卖无垢者为业的奴隶商。' },
    ['asos'], [
      { id: 'kraznys-mo-nakloz', name: { en: 'Kraznys mo Nakloz', zh: '克拉兹尼·莫·纳克罗兹' },
        note: { en: 'Arrogant Good Master who showed the Unsullied to Daenerys, speaking only Ghiscari through an interpreter.', zh: '傲慢的善主，曾向丹妮莉丝展示无垢者，只肯通过译者说吉斯卡利语。' },
        fate: { en: 'Burned by Drogon when Daenerys turned the Unsullied on their masters (ASOS).', zh: '丹妮莉丝令无垢者倒戈之时，被卓耿烧死（卷三）。' }, spoiler: false },
    ]),
  { id: 'xho', names: { en: 'House Xho', zh: '梭家族' }, region: 'summer-isles', seat: 'red-flower-vale', tier: 'minor', liege: null,
    sigil: { en: 'No sigil is described; the prince wears the bright feathered cloaks of the Summer Isles.', zh: '书中未描述纹章；王子身披盛夏群岛特有的鲜艳羽毛斗篷。' },
    colors: ['#b8322a', '#f2c94c'],
    summary: { en: 'The family of the exiled princes of the Red Flower Vale in the Summer Isles. Its prince lives at the Iron Throne\'s court, petitioning in vain for men to win back his home.',
      zh: '盛夏群岛红花谷流亡王族。其王子寄居铁王座宫廷，徒劳地请求借兵收复故土。' },
    refs: ['agot', 'acok'], members: [
      { id: 'jalabhar-xho', name: { en: 'Jalabhar Xho', zh: '贾拉巴·梭' },
        note: { en: 'Exiled Prince of the Red Flower Vale, a courtier in King\'s Landing.', zh: '流亡的红花谷王子，君临宫廷中的一员。' }, spoiler: false },
    ] },
] };
