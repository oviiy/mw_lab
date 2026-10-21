// Who sits behind the puppet screen: generic troupe members, headline bosses with rules,
// bounties for the small/big blinds, and tags earned by skipping.

export interface OpponentDef {
  id: string;
  name: string;
  role: string;
  line: string;
  /** Said as the puppet falls. */
  lose: string;
}

export const OPPONENTS: Record<string, OpponentDef> = {};
for (const o of [
  { id: 'scholar', lose: '罢了罢了，再读十年。', name: '穷书生', role: '小生', line: '十年寒窗，只学会了掷骰。' },
  { id: 'clown', lose: '哎哟——这回轮到我哭了。', name: '小花脸', role: '丑角', line: '输了别哭，赢了别笑。' },
  { id: 'warrior', lose: '功夫……还是不到家。', name: '武生', role: '武生', line: '台上一分钟，台下十年功。' },
  { id: 'elder', lose: '后生可畏啊。', name: '老生', role: '老生', line: '老夫掷骰的时候，你还没出生呢。' },
  { id: 'maiden', lose: '公子好手气，奴家认输。', name: '花旦', role: '花旦', line: '公子，再来一局？' },
  { id: 'qingyi', lose: '曲终人散，各自归家。', name: '青衣', role: '青衣', line: '一曲终了，骰子未停。' },
  { id: 'daoma', lose: '马失前蹄！', name: '刀马旦', role: '刀马旦', line: '马不停蹄，骰不离手。' },
  { id: 'fisher', lose: '鱼没钓着，钩倒丢了。', name: '渔翁', role: '老生', line: '愿者上钩。' },
]) {
  OPPONENTS[o.id] = o;
}

export interface BossDef {
  id: string;
  name: string;
  title: string;
  desc: string;
  /** Usable as act-1 boss. */
  gentle?: boolean;
  /** Said as the puppet falls. */
  lose?: string;
  targetMul?: number;
}

export const BOSSES: Record<string, BossDef> = {};
for (const b of [
  { id: 'guangong', lose: '大意失荆州……', name: '关公', title: '赤面', desc: '红面（1、4、朱印）不计分', gentle: true },
  { id: 'baozheng', lose: '本府……也有看走眼的时候。', name: '包拯', title: '明镜', desc: '奇数骰不计分' },
  { id: 'zhangfei', lose: '俺老张不服！再来！', name: '张飞', title: '莽撞', desc: '不能扣骰，重掷必须全掷', gentle: true },
  { id: 'zhuge', lose: '亮，算错了一着。', name: '诸葛亮', title: '空城', desc: '本场重掷只有 1 次' },
  { id: 'niumo', lose: '俺的芭蕉扇呢？', name: '牛魔王', title: '蛮力', desc: '目标分 ×1.75', targetMul: 1.75 },
  { id: 'wusong', lose: '这一拳，打空了。', name: '武松', title: '一拳', desc: '只能出手 1 次，目标分减半', targetMul: 0.5 },
  { id: 'zhongkui', lose: '鬼没捉着，倒被你捉了。', name: '钟馗', title: '捉鬼', desc: '每手随机一件法器失效' },
  { id: 'caocao', lose: '宁教我负天下人——唉。', name: '曹操', title: '多疑', desc: '点数最大的那颗骰子不计分' },
  { id: 'wuchang', lose: '一见……破财。', name: '白无常', title: '遮眼', desc: '每手第一次掷出的点数被遮住' },
  { id: 'yangmen', lose: '穆家枪，今日认栽。', name: '穆桂英', title: '不二', desc: '同一牌型本场只计分一次' },
  { id: 'wukong', lose: '俺老孙去也——', name: '孙悟空', title: '七十二变', desc: '出手时，一颗没扣住的骰子会变成随机一面' },
  { id: 'nezha', lose: '哼，我去找师父告状。', name: '哪吒', title: '倒海', desc: '6 当作 1', gentle: true },
] as BossDef[]) {
  BOSSES[b.id] = b;
}

export const FINAL_BOSS: BossDef = { lose: '这一面……竟是你刻的。', id: 'fate', name: '命运之匠', title: '千变', desc: '每一手轮换一条戒律；目标分 ×1.4', targetMul: 1.4 };
BOSSES.fate = FINAL_BOSS;

/** Rules the final boss rotates through (one per hand). */
export const FATE_RULES = ['guangong', 'baozheng', 'zhangfei', 'zhongkui', 'wuchang', 'wukong', 'nezha'];

export interface BountyDef {
  id: string;
  desc: string;
  reward: string;
  money?: number;
  carve?: boolean;
}

export const BOUNTIES: Record<string, BountyDef> = {};
for (const b of [
  { id: 'straight', desc: '打出一次顺子', reward: '+3 金', money: 3 },
  { id: 'triple', desc: '打出一次豹子', reward: '+5 金', money: 5 },
  { id: 'twohands', desc: '两手之内过关', reward: '一把刻刀', carve: true },
  { id: 'allred', desc: '出一手全是红面', reward: '+4 金', money: 4 },
  { id: 'half', desc: '单手得分达到目标一半', reward: '+4 金', money: 4 },
  { id: 'noreroll', desc: '一次不重掷就过关', reward: '+4 金', money: 4 },
  { id: 'big', desc: '出一手「大」', reward: '+2 金', money: 2 },
  { id: 'parity', desc: '出一手全奇或全偶', reward: '+3 金', money: 3 },
] as BountyDef[]) {
  BOUNTIES[b.id] = b;
}

export interface TagDef {
  id: string;
  name: string;
  glyph: string;
  desc: string;
}

export const TAGS: Record<string, TagDef> = {};
for (const t of [
  { id: 'freeart', name: '法签', glyph: '法', desc: '下个集市的第一件法器免费' },
  { id: 'carvepack', name: '刻签', glyph: '刻', desc: '立即打开一个免费刻刀包' },
  { id: 'starpack', name: '星签', glyph: '星', desc: '立即打开一个免费星图包' },
  { id: 'rareart', name: '稀签', glyph: '稀', desc: '下个集市必有一件稀有法器' },
  { id: 'talisman', name: '符签', glyph: '符', desc: '获得一张随机符（需有空位）' },
  { id: 'rerolls', name: '骰签', glyph: '骰', desc: '下一场重掷 +3' },
  { id: 'cash', name: '钱签', glyph: '钱', desc: '立即 +8 金' },
] as TagDef[]) {
  TAGS[t.id] = t;
}
