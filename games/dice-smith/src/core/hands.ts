import type { HandType } from './types';

export interface HandInfo {
  name: string;
  star: string;
  chips: number;
  mult: number;
  dChips: number;
  dMult: number;
  /** Minimum dice needed to form it. */
  need: number;
  desc: string;
}

export const HANDS: Record<HandType, HandInfo> = {
  high: { name: '散', star: '天枢', chips: 5, mult: 1, dChips: 10, dMult: 1, need: 1, desc: '没有组合，只有最大的一颗计分' },
  pair: { name: '对子', star: '天璇', chips: 10, mult: 2, dChips: 15, dMult: 1, need: 2, desc: '两颗相同' },
  twopair: { name: '两对', star: '天玑', chips: 20, mult: 2, dChips: 20, dMult: 1, need: 4, desc: '两组对子' },
  straight: { name: '顺子', star: '天权', chips: 25, mult: 3, dChips: 25, dMult: 2, need: 3, desc: '三颗连续' },
  triple: { name: '豹子', star: '玉衡', chips: 35, mult: 5, dChips: 30, dMult: 2, need: 3, desc: '三颗相同' },
  longstraight: { name: '长顺', star: '开阳', chips: 45, mult: 5, dChips: 35, dMult: 3, need: 4, desc: '四颗连续' },
  quad: { name: '四喜', star: '摇光', chips: 60, mult: 8, dChips: 40, dMult: 3, need: 4, desc: '四颗相同' },
};

export const HAND_ORDER: HandType[] = ['high', 'pair', 'twopair', 'straight', 'triple', 'longstraight', 'quad'];
const RANK: Record<HandType, number> = { high: 0, pair: 1, twopair: 2, straight: 3, triple: 4, longstraight: 5, quad: 6 };

export const containsPair = (h: HandType) => h === 'pair' || h === 'twopair' || h === 'triple' || h === 'quad';
export const containsStraight = (h: HandType) => h === 'straight' || h === 'longstraight';
export const containsTriple = (h: HandType) => h === 'triple' || h === 'quad';

export function handChipsMult(h: HandType, level: number) {
  const d = HANDS[h];
  return { chips: d.chips + (level - 1) * d.dChips, mult: d.mult + (level - 1) * d.dMult };
}

export interface EvalOpts {
  /** 九连环: straights may skip one value. */
  gapStraight?: boolean;
  /** 阴阳盘: two dice summing to 7 count as a pair. */
  sevenPair?: boolean;
}

export interface Evaluated {
  type: HandType;
  scoring: number[];
  /** Values used to form the hand (wild dice resolved). */
  vals: number[];
}

function combos(n: number, k: number): number[][] {
  const out: number[][] = [];
  const rec = (start: number, acc: number[]) => {
    if (acc.length === k) return void out.push([...acc]);
    for (let i = start; i < n; i++) rec(i + 1, [...acc, i]);
  };
  rec(0, []);
  return out;
}

function isRun(vs: number[], gap: boolean): boolean {
  const s = [...vs].sort((a, b) => a - b);
  for (let i = 1; i < s.length; i++) if (s[i] === s[i - 1]) return false;
  const span = s[s.length - 1] - s[0];
  return gap ? span <= s.length : span === s.length - 1;
}

const isPair = (a: number, b: number, seven: boolean) => a === b || (seven && a + b === 7);

/** Best hand for fixed values. Ties broken by the sum of scoring values. */
function bestFixed(vals: number[], o: EvalOpts): Evaluated {
  const n = vals.length;
  const idx = vals.map((_, i) => i);
  const sum = (ix: number[]) => ix.reduce((s, i) => s + vals[i], 0);
  const pick = (cands: number[][]) => cands.sort((a, b) => sum(b) - sum(a))[0];

  if (n >= 4) {
    const quads = combos(n, 4).filter((c) => c.every((i) => vals[i] === vals[c[0]]));
    if (quads.length) return { type: 'quad', scoring: pick(quads), vals };
    const long = combos(n, 4).filter((c) => isRun(c.map((i) => vals[i]), !!o.gapStraight));
    if (long.length) return { type: 'longstraight', scoring: pick(long), vals };
  }
  if (n >= 3) {
    const trips = combos(n, 3).filter((c) => c.every((i) => vals[i] === vals[c[0]]));
    if (trips.length) return { type: 'triple', scoring: pick(trips), vals };
    const runs = combos(n, 3).filter((c) => isRun(c.map((i) => vals[i]), !!o.gapStraight));
    if (runs.length) return { type: 'straight', scoring: pick(runs), vals };
  }
  const pairs = combos(n, 2).filter(([a, b]) => isPair(vals[a], vals[b], !!o.sevenPair));
  if (n >= 4) {
    const twos: number[][] = [];
    for (const p of pairs) for (const q of pairs) if (p[0] < q[0] && !q.includes(p[0]) && !q.includes(p[1])) twos.push([...p, ...q]);
    if (twos.length) return { type: 'twopair', scoring: pick(twos), vals };
  }
  if (pairs.length) return { type: 'pair', scoring: pick(pairs), vals };
  const hi = idx.reduce((b, i) => (vals[i] > vals[b] ? i : b), 0);
  return { type: 'high', scoring: [hi], vals };
}

/**
 * Evaluate a set of dice. `wild[i]` dice may take any value 0–9 to form the hand;
 * the reported `vals` keep their real pips so scoring still uses them.
 */
export function evaluate(vals: number[], wild: boolean[], o: EvalOpts = {}): Evaluated {
  const wi = wild.map((w, i) => (w ? i : -1)).filter((i) => i >= 0);
  if (!wi.length) return bestFixed(vals, o);
  let best: Evaluated | null = null;
  let bestKey = -1;
  const trial = [...vals];
  const rec = (k: number) => {
    if (k === wi.length) {
      const e = bestFixed([...trial], o);
      const key = RANK[e.type] * 1000 + e.scoring.reduce((s, i) => s + vals[i], 0);
      if (key > bestKey) {
        bestKey = key;
        best = { ...e, vals: [...vals] };
      }
      return;
    }
    for (let v = 0; v <= 9; v++) {
      trial[wi[k]] = v;
      rec(k + 1);
    }
  };
  rec(0);
  return best!;
}
