import { containsPair, containsStraight, containsTriple, HAND_ORDER } from './hands';
import type { ArtifactInst, Effect, HandType, Round, Run } from './types';

export type Rarity = 'common' | 'uncommon' | 'rare';

/** What an artifact can see while a hand is being scored. */
export interface ScoreCtx {
  run: Run;
  round: Round | null;
  hand: HandType;
  /** Indices of scoring dice. */
  scoring: number[];
  /** Indices of the dice that form the hand (before 双生灯 adds the rest). */
  formed: number[];
  /** Effective value per die. */
  vals: number[];
  isRed: (i: number) => boolean;
  big: boolean;
  isLastHand: boolean;
  rerolledThisHand: boolean;
}

export type Passive = 'gapStraight' | 'sevenPair' | 'oneIsSix' | 'allScore' | 'compass' | 'freeReroll';

export interface ArtifactDef {
  id: string;
  name: string;
  rarity: Rarity;
  /** {n} is replaced with the instance counter. */
  desc: string;
  passive?: Passive;
  onDie?: (c: ScoreCtx, i: number, inst: ArtifactInst) => Effect | null;
  onHand?: (c: ScoreCtx, inst: ArtifactInst) => Effect | null;
  /** Extra triggers for a scoring die. `first` = first scoring die of the hand. */
  retrigger?: (c: ScoreCtx, i: number, first: boolean) => number;
  /** After a hand is played (scaling). */
  afterHand?: (run: Run, round: Round, hand: HandType, inst: ArtifactInst) => void;
  roundStart?: (run: Run, inst: ArtifactInst) => void;
  /** Money at cash out. */
  cashOut?: (run: Run, round: Round, inst: ArtifactInst) => number;
  onCarve?: (inst: ArtifactInst) => void;
  onBoss?: (run: Run, inst: ArtifactInst) => void;
  /** When a round is won (before cash out). */
  onWin?: (run: Run, round: Round, inst: ArtifactInst) => void;
  /** Initial counter. */
  n0?: number;
  /** Copies another artifact's scoring behaviour. */
  copy?: 'right' | 'left';
  /** Run-level hooks with side effects are wired from run.ts. */
  tag?: 'carveOnStart' | 'starOnBoss' | 'growFace' | 'consumableSlots';
}

export const ARTIFACTS: Record<string, ArtifactDef> = {};
const def = (d: ArtifactDef) => void (ARTIFACTS[d.id] = d);

const scored = (c: ScoreCtx, i: number) => c.vals[i];

// ---------- common ----------
def({ id: 'coin', name: '铜钱', rarity: 'common', desc: '+4 倍', onHand: () => ({ mult: 4 }) });
def({ id: 'redcord', name: '红绳', rarity: 'common', desc: '每颗计分的红面骰 +3 倍', onDie: (c, i) => (c.isRed(i) ? { mult: 3 } : null) });
def({ id: 'qimen', name: '奇门', rarity: 'common', desc: '每颗计分的奇数骰 +25 筹', onDie: (c, i) => (scored(c, i) % 2 === 1 ? { chips: 25 } : null) });
def({ id: 'shuangxi', name: '双喜', rarity: 'common', desc: '每颗计分的偶数骰 +2 倍', onDie: (c, i) => (scored(c, i) % 2 === 0 ? { mult: 2 } : null) });
def({ id: 'fish', name: '双鱼佩', rarity: 'common', desc: '牌型含对子 +8 倍', onHand: (c) => (containsPair(c.hand) ? { mult: 8 } : null) });
def({ id: 'ladder', name: '竹梯', rarity: 'common', desc: '牌型含顺子 +12 倍', onHand: (c) => (containsStraight(c.hand) ? { mult: 12 } : null) });
def({ id: 'tiger', name: '虎符', rarity: 'common', desc: '牌型含豹子 +16 倍', onHand: (c) => (containsTriple(c.hand) ? { mult: 16 } : null) });
def({ id: 'weight', name: '秤砣', rarity: 'common', desc: '出「大」+50 筹', onHand: (c) => (c.big ? { chips: 50 } : null) });
def({ id: 'smallscale', name: '小秤', rarity: 'common', desc: '出「小」+5 倍', onHand: (c) => (!c.big ? { mult: 5 } : null) });
def({ id: 'bowl', name: '空碗', rarity: 'common', desc: '每剩 1 次重掷 +12 筹', onHand: (c) => (c.round && c.round.rerolls > 0 ? { chips: 12 * c.round.rerolls } : null) });
def({
  id: 'gourd', name: '酒葫芦', rarity: 'common', desc: '+{n} 倍；每出一手 −1', n0: 20,
  onHand: (_c, inst) => (inst.n > 0 ? { mult: inst.n } : null),
  afterHand: (_r, _ro, _h, inst) => void (inst.n = Math.max(0, inst.n - 1)),
});
def({ id: 'purse', name: '钱袋', rarity: 'common', desc: '每场结束 +3 金', cashOut: () => 3 });
def({ id: 'lantern', name: '灯笼', rarity: 'common', desc: '本场最后一手 ×3 倍', onHand: (c) => (c.isLastHand ? { xmult: 3 } : null) });
def({ id: 'fan', name: '折扇', rarity: 'common', desc: '出「散」+10 倍', onHand: (c) => (c.hand === 'high' ? { mult: 10 } : null) });

// ---------- uncommon ----------
def({ id: 'compass', name: '罗盘', rarity: 'uncommon', desc: '每手一次：点一颗骰子，翻到对面', passive: 'compass' });
def({ id: 'rings', name: '九连环', rarity: 'uncommon', desc: '顺子可以缺一位（如 2·3·5）', passive: 'gapStraight' });
def({ id: 'yinyang', name: '阴阳盘', rarity: 'uncommon', desc: '点数和为 7 的两颗骰子视为对子', passive: 'sevenPair' });
def({
  id: 'abacus', name: '算盘', rarity: 'uncommon', desc: '每出一次含顺子的牌型，永久 +1 倍（现 +{n}）',
  onHand: (_c, inst) => (inst.n > 0 ? { mult: inst.n } : null),
  afterHand: (_r, _ro, h, inst) => void (containsStraight(h) && inst.n++),
});
def({
  id: 'zoetrope', name: '走马灯', rarity: 'uncommon', desc: '连续打出同一牌型，每连一次 +2 倍',
  onHand: (c) => {
    const s = c.run.streak;
    const n = s.type === c.hand ? s.count : 0;
    return n > 0 ? { mult: 2 * n } : null;
  },
});
def({
  id: 'whetstone', name: '磨刀石', rarity: 'uncommon', desc: '每用一把刻刀，永久 +1 倍（现 +{n}）',
  onHand: (_c, inst) => (inst.n > 0 ? { mult: inst.n } : null),
  onCarve: (inst) => void (inst.n += 1),
});
def({ id: 'treasure', name: '聚宝盆', rarity: 'uncommon', desc: '每持有 3 金 +1 倍', onHand: (c) => (c.run.money >= 3 ? { mult: Math.floor(c.run.money / 3) } : null) });
def({ id: 'ledger', name: '账本', rarity: 'uncommon', desc: '每场结束，每剩 1 次重掷 +2 金', cashOut: (_r, ro) => ro.rerolls * 2 });
def({
  id: 'twinlamp', name: '双生灯', rarity: 'uncommon', desc: '所有骰子都计分；不在牌型里的骰子每颗 +3 倍', passive: 'allScore',
  onDie: (c, i) => (!c.formed.includes(i) ? { mult: 3 } : null),
});
def({ id: 'drum', name: '鼓', rarity: 'uncommon', desc: '第一颗计分骰子再触发一次', retrigger: (_c, _i, first) => (first ? 1 : 0) });
def({ id: 'puppet', name: '皮影小人', rarity: 'uncommon', desc: '每场开始，获得一把随机刻刀（需有空位）', tag: 'carveOnStart' });
def({ id: 'cat', name: '招财猫', rarity: 'uncommon', desc: '牌型含豹子时，每颗计分骰子 +2 金', onDie: (c) => (containsTriple(c.hand) ? { money: 2 } : null) });
def({
  id: 'ironabacus', name: '铁算盘', rarity: 'uncommon', desc: '本场每出一手 +4 倍（场内累加，含这一手）',
  onHand: (c) => (c.round && c.round.roundMult > 0 ? { mult: c.round.roundMult } : null),
});
def({ id: 'astrolabe', name: '星盘', rarity: 'uncommon', desc: '每击败一位头牌，获得一颗随机星（需有空位）', tag: 'starOnBoss' });
def({ id: 'sixes', name: '六六顺', rarity: 'uncommon', desc: '每颗计分的 6 +4 倍', onDie: (c, i) => (scored(c, i) === 6 ? { mult: 4 } : null) });
def({ id: 'yaoji', name: '幺鸡', rarity: 'uncommon', desc: '每颗计分的 1 ×1.5 倍', onDie: (c, i) => (scored(c, i) === 1 ? { xmult: 1.5 } : null) });

// ---------- decision hooks: these change how you hold and reroll ----------
def({ id: 'diecup', name: '骰盅', rarity: 'common', desc: '每手第一次重掷，不消耗重掷次数', passive: 'freeReroll' });
def({ id: 'spearback', name: '回马枪', rarity: 'common', desc: '这一手每重掷一次，+15 筹', onHand: (c) => (c.round && c.round.handRerolls > 0 ? { chips: 15 * c.round.handRerolls } : null) });
def({
  id: 'rattle', name: '拨浪鼓', rarity: 'common', desc: '出「散」时，+所有骰子点数和 ×3 筹',
  onHand: (c) => (c.hand === 'high' ? { chips: 3 * c.vals.reduce((a, b) => a + b, 0) } : null),
});
def({ id: 'paperweight', name: '镇纸', rarity: 'uncommon', desc: '出手时被扣住的骰子，计分时每颗 +3 倍', onDie: (c, i) => (c.round?.rolled[i]?.held ? { mult: 3 } : null) });
def({ id: 'allin', name: '孤注', rarity: 'uncommon', desc: '重掷次数用光后出手 ×2 倍', onHand: (c) => (c.round && c.round.rerolls === 0 ? { xmult: 2 } : null) });
def({ id: 'lion', name: '狮子头', rarity: 'uncommon', desc: '每场的第一手 ×2 倍', onHand: (c) => (c.round && c.round.handsPlayed === 0 ? { xmult: 2 } : null) });
def({
  id: 'chest', name: '压箱底', rarity: 'uncommon', desc: '过关时若还剩 2 次以上出手，永久 +2 倍（现 +{n}）',
  onHand: (_c, inst) => (inst.n > 0 ? { mult: inst.n } : null),
  onWin: (_r, ro, inst) => void (ro.hands >= 2 && (inst.n += 2)),
});
def({ id: 'luoshu', name: '洛书', rarity: 'rare', desc: '所有骰子点数之和恰好是 15 时 ×3 倍', onHand: (c) => (c.vals.reduce((a, b) => a + b, 0) === 15 ? { xmult: 3 } : null) });

// ---------- rare ----------
def({ id: 'rubbing', name: '拓印', rarity: 'rare', desc: '复制右边法器的效果', copy: 'right' });
def({ id: 'seal', name: '印泥', rarity: 'rare', desc: '复制最左边法器的效果', copy: 'left' });
def({ id: 'guanyin', name: '千手观音', rarity: 'rare', desc: '所有计分骰子各再触发一次', retrigger: () => 1 });
def({ id: 'onesix', name: '幺变六', rarity: 'rare', desc: '朝上的 1 视为 6', passive: 'oneIsSix' });
def({ id: 'brush', name: '判官笔', rarity: 'rare', desc: '本手没有重掷 ×3 倍', onHand: (c) => (!c.rerolledThisHand ? { xmult: 3 } : null) });
def({
  id: 'idol', name: '骰神像', rarity: 'rare', desc: '每打出一次含豹子的牌型，永久 +×0.5 倍（现 ×{x}）',
  onHand: (_c, inst) => (inst.n > 0 ? { xmult: 1 + inst.n * 0.5 } : null),
  afterHand: (_r, _ro, h, inst) => void (containsTriple(h) && inst.n++),
});
def({ id: 'qiankun', name: '乾坤袋', rarity: 'rare', desc: '消耗品栏 +2', tag: 'consumableSlots' });
def({ id: 'forge', name: '铸骰炉', rarity: 'rare', desc: '每过一场，你的骰子随机一面 +1', tag: 'growFace' });
def({
  id: 'inkstone', name: '墨宝', rarity: 'rare', desc: '你的骰子上每有一个印记，+×0.1 倍',
  onHand: (c) => {
    const marks = c.run.dice.reduce((s, d) => s + d.faces.filter((f) => f.mark).length, 0);
    return marks > 0 ? { xmult: 1 + marks * 0.1 } : null;
  },
});
def({
  id: 'sword', name: '七星剑', rarity: 'rare', desc: '牌型每比初始高 1 级，+1 倍',
  onHand: (c) => {
    const n = HAND_ORDER.reduce((s, h) => s + (c.run.levels[h] - 1), 0);
    return n > 0 ? { mult: n } : null;
  },
});

export const ARTIFACT_IDS = Object.keys(ARTIFACTS);
export const ARTIFACT_PRICE: Record<Rarity, number> = { common: 4, uncommon: 6, rare: 9 };

export function artifactDesc(inst: ArtifactInst): string {
  const d = ARTIFACTS[inst.id];
  return d.desc.replace('{n}', String(inst.n)).replace('{x}', (1 + inst.n * 0.5).toFixed(1));
}

export function hasPassive(run: Run, p: Passive): boolean {
  return run.artifacts.some((a) => ARTIFACTS[a.id].passive === p);
}

export function hasTag(run: Run, t: NonNullable<ArtifactDef['tag']>): number {
  return run.artifacts.filter((a) => ARTIFACTS[a.id].tag === t).length;
}
