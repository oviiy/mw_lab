import { HAND_ORDER } from './hands';
import { pick, shuffle } from './rng';
import type { Run } from './types';

export type Tier = 'silver' | 'gold' | 'prism';

export interface AugmentDef {
  id: string;
  tier: Tier;
  name: string;
  desc: string;
  /** Applied once when chosen. */
  apply?: (run: Run) => void;
}

export const AUGMENTS: Record<string, AugmentDef> = {};
const def = (d: AugmentDef) => void (AUGMENTS[d.id] = d);

// silver
def({ id: 'morehands', tier: 'silver', name: '多手', desc: '每场出手 +1' });
def({ id: 'morerolls', tier: 'silver', name: '多掷', desc: '每场重掷 +2' });
def({ id: 'pack', tier: 'silver', name: '行囊', desc: '消耗品栏 +1，并获得一把随机刻刀', apply: (r) => void (r.consumableSlots += 1) });
def({ id: 'practiced', tier: 'silver', name: '熟手', desc: '「散」与「对子」各升两级', apply: (r) => ((r.levels.high += 2), (r.levels.pair += 2)) });
def({ id: 'smallfortune', tier: 'silver', name: '小财', desc: '立即 +15 金；利息上限 +5', apply: (r) => void (r.money += 15) });
def({ id: 'carver', tier: 'silver', name: '刻工', desc: '每进一次集市，获得一把随机刻刀（需有空位）' });

// gold
def({ id: 'fourthdie', tier: 'gold', name: '第四颗骰', desc: '骰子 +1，解锁两对、长顺、四喜' });
def({ id: 'keepdie', tier: 'gold', name: '留骰', desc: '出手时扣住的一颗骰子，带到下一手（不重掷）' });
def({ id: 'wideshelf', tier: 'gold', name: '宽架', desc: '法器栏 +1', apply: (r) => void (r.artifactSlots += 1) });
def({ id: 'mastercarver', tier: 'gold', name: '铭刻大师', desc: '刻刀刻一面时，它的对面也同样刻上' });
def({ id: 'palmflip', tier: 'gold', name: '翻掌', desc: '每手一次，免费把一颗骰子翻到对面' });
def({
  id: 'starluck', tier: 'gold', name: '星运', desc: '随机三种牌型各升一级；此后每击败一位头牌，再随机升一级',
  apply: (r) => shuffle(r.rng, [...HAND_ORDER]).slice(0, 3).forEach((h) => r.levels[h]++),
});

// prismatic
def({ id: 'destiny', tier: 'prism', name: '天命', desc: '每手的第一次掷骰，至少是对子' });
def({ id: 'myriad', tier: 'prism', name: '万象', desc: '所有点数为 1 的面，都视为带万印' });
def({ id: 'sevenstars', tier: 'prism', name: '七星连珠', desc: '所有牌型立即升三级', apply: (r) => HAND_ORDER.forEach((h) => (r.levels[h] += 3)) });
def({ id: 'mirrorflower', tier: 'prism', name: '镜花水月', desc: '最右边的法器每次都触发两次' });
def({ id: 'midas', tier: 'prism', name: '点石成金', desc: '每颗计分骰子 +1 金；但不再有利息' });
def({ id: 'echoes', tier: 'prism', name: '无尽回声', desc: '每手第一颗计分骰子再触发两次' });

export function augmentOptions(run: Run, tier: Tier): string[] {
  const pool = Object.values(AUGMENTS).filter((a) => a.tier === tier && !run.augments.includes(a.id)).map((a) => a.id);
  return shuffle(run.rng, pool).slice(0, 3);
}

export function has(run: Run, id: string) {
  return run.augments.includes(id);
}

export function randomHand(run: Run) {
  return pick(run.rng, HAND_ORDER);
}
