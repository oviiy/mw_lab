import { ARTIFACTS } from './artifacts';
import { MARKS, MAX_DICE, MAX_PIPS, makeDie, opposite, cloneFace } from './dice';
import { HAND_ORDER, HANDS } from './hands';
import { int, pick, shuffle } from './rng';
import type { ConsumableKind, Face, MarkId, Material, Run } from './types';

/** What a consumable needs the player to pick before it can be used. */
export type TargetKind = 'face' | 'die' | 'none';

export interface ConsumableDef {
  id: string;
  kind: ConsumableKind;
  name: string;
  glyph: string;
  desc: string;
  price: number;
  target: TargetKind;
  /** For face/die targets: is this face (or die, face = -1) a legal target? */
  valid?: (run: Run, die: number, face: number) => boolean;
  /** Can it be used right now at all? */
  usable?: (run: Run) => boolean;
  /** Returns a short result line for the toast. */
  apply: (run: Run, die: number, face: number) => string;
  rare?: boolean;
}

export const CONSUMABLES: Record<string, ConsumableDef> = {};
const def = (d: ConsumableDef) => void (CONSUMABLES[d.id] = d);

const face = (run: Run, d: number, f: number) => run.dice[d]?.faces[f];

/** 铭刻大师: carving also applies to the opposite face. */
function carveFace(run: Run, d: number, f: number, fn: (x: Face) => void) {
  fn(run.dice[d].faces[f]);
  if (run.augments.includes('mastercarver')) fn(run.dice[d].faces[opposite(f)]);
}

// ---------- carving tools ----------

def({ id: 'plus1', kind: 'carve', name: '加刻', glyph: '+1', desc: '一面点数 +1（最高 9）', price: 3, target: 'face', valid: (r, d, f) => face(r, d, f).v < MAX_PIPS, apply: (r, d, f) => (carveFace(r, d, f, (x) => (x.v = Math.min(MAX_PIPS, x.v + 1))), '刻深了一分') });
def({ id: 'plus2', kind: 'carve', name: '深刻', glyph: '+2', desc: '一面点数 +2（最高 9）', price: 3, target: 'face', valid: (r, d, f) => face(r, d, f).v < MAX_PIPS, apply: (r, d, f) => (carveFace(r, d, f, (x) => (x.v = Math.min(MAX_PIPS, x.v + 2))), '刻深了两分') });
def({ id: 'minus1', kind: 'carve', name: '磨低', glyph: '−1', desc: '一面点数 −1（最低 0）', price: 3, target: 'face', valid: (r, d, f) => face(r, d, f).v > 0, apply: (r, d, f) => (carveFace(r, d, f, (x) => (x.v = Math.max(0, x.v - 1))), '磨平了一分') });
def({ id: 'shave', kind: 'carve', name: '削平', glyph: '削', desc: '去掉一面的印记', price: 3, target: 'face', valid: (r, d, f) => !!face(r, d, f).mark, apply: (r, d, f) => (carveFace(r, d, f, (x) => delete x.mark), '印记削去了') });
def({
  id: 'mirrorcarve', kind: 'carve', name: '翻刻', glyph: '翻', desc: '把一面（点数与印记）复制到它的对面', price: 3, target: 'face',
  apply: (r, d, f) => {
    r.dice[d].faces[opposite(f)] = cloneFace(r.dice[d].faces[f]);
    return '对面也刻成了这样';
  },
});

const MARK_ORDER: MarkId[] = ['jade', 'iron', 'gold', 'glass', 'echo', 'wild', 'mirror', 'cinnabar', 'ink'];
for (const m of MARK_ORDER) {
  def({
    id: `mark_${m}`, kind: 'carve', name: `${MARKS[m].glyph}印刀`, glyph: MARKS[m].glyph, desc: `在一面刻上${MARKS[m].name}：${MARKS[m].desc}`, price: 3, target: 'face',
    valid: (r, d, f) => face(r, d, f).mark !== m,
    apply: (r, d, f) => (carveFace(r, d, f, (x) => (x.mark = m)), `刻上了${MARKS[m].name}`),
  });
}

const MAT: [Material, string, string][] = [
  ['ivory', '象', '整颗骰子变为象牙：每次计分 +10 筹'],
  ['ebony', '檀', '整颗骰子变为黑檀：每次计分 +2 倍'],
  ['lacquer', '漆', '整颗骰子变为金漆：每次计分 ×1.5 倍'],
];
for (const [m, g, desc] of MAT) {
  def({ id: `mat_${m}`, kind: 'carve', name: `${g === '象' ? '象牙' : g === '檀' ? '黑檀' : '金漆'}刀`, glyph: g, desc, price: 5, rare: true, target: 'die', valid: (r, d) => r.dice[d].material !== m, apply: (r, d) => ((r.dice[d].material = m), '换了一身骨') });
}

// ---------- stars ----------

for (const h of HAND_ORDER) {
  def({
    id: `star_${h}`, kind: 'star', name: HANDS[h].star, glyph: HANDS[h].star[1], desc: `「${HANDS[h].name}」升一级：+${HANDS[h].dChips} 筹 +${HANDS[h].dMult} 倍`, price: 3, target: 'none',
    apply: (r) => {
      r.levels[h]++;
      return `${HANDS[h].name}升到 ${r.levels[h]} 级`;
    },
  });
}

// ---------- talismans ----------

def({
  id: 'forgedie', kind: 'talisman', name: '铸骰符', glyph: '铸', desc: `熔掉最右边的法器，铸一颗新骰子（至多 ${MAX_DICE} 颗）`, price: 5, target: 'none',
  usable: (r) => r.screen.t !== 'round' && r.dice.length < MAX_DICE && r.artifacts.length > 0,
  apply: (r) => {
    const gone = r.artifacts.pop()!;
    r.dice.push(makeDie(`d${r.nextUid++}`));
    return `${ARTIFACTS[gone.id].name}化作了一颗新骰子`;
  },
});
def({
  id: 'onefate', kind: 'talisman', name: '易命符', glyph: '易', desc: '一颗骰子的六面都变成你选的那一面；随机摧毁一件法器', price: 5, target: 'face',
  apply: (r, d, f) => {
    const src = cloneFace(r.dice[d].faces[f]);
    r.dice[d].faces = r.dice[d].faces.map(() => cloneFace(src));
    if (r.artifacts.length) r.artifacts.splice(int(r.rng, 0, r.artifacts.length - 1), 1);
    return '六面如一';
  },
});
def({
  id: 'goldtouch', kind: 'talisman', name: '点金符', glyph: '金', desc: '金币翻倍（至多 +20）', price: 5, target: 'none',
  apply: (r) => {
    const add = Math.min(20, Math.max(0, r.money));
    r.money += add;
    return `+${add} 金`;
  },
});
def({
  id: 'starfall', kind: 'talisman', name: '星落符', glyph: '星', desc: '所有牌型升一级', price: 5, target: 'none',
  apply: (r) => {
    for (const h of HAND_ORDER) r.levels[h]++;
    return '七星齐明';
  },
});
def({
  id: 'crack', kind: 'talisman', name: '裂骰符', glyph: '裂', desc: '一颗骰子：三面得到随机印记，另三面变为 0', price: 5, target: 'die',
  apply: (r, d) => {
    const order = shuffle(r.rng, [0, 1, 2, 3, 4, 5]);
    order.forEach((fi, k) => {
      const f = r.dice[d].faces[fi];
      if (k < 3) f.mark = pick(r.rng, MARK_ORDER);
      else {
        f.v = 0;
        delete f.mark;
      }
    });
    return '骰子裂开，又长出了花纹';
  },
});
def({
  id: 'possess', kind: 'talisman', name: '夺舍符', glyph: '夺', desc: '复制一件随机法器，摧毁其余所有法器', price: 5, target: 'none',
  usable: (r) => r.artifacts.length > 0,
  apply: (r) => {
    const keep = pick(r.rng, r.artifacts);
    r.artifacts = [keep, { uid: r.nextUid++, id: keep.id, n: keep.n }];
    return `只剩下两件${ARTIFACTS[keep.id].name}`;
  },
});

export const CONSUMABLE_IDS = Object.keys(CONSUMABLES);

export function consumablesOf(kind: ConsumableKind, includeRare = true): string[] {
  return CONSUMABLE_IDS.filter((id) => CONSUMABLES[id].kind === kind && (includeRare || !CONSUMABLES[id].rare));
}

/** Whether the consumable has at least one legal target right now. */
export function canUse(run: Run, id: string): boolean {
  const d = CONSUMABLES[id];
  if (d.usable && !d.usable(run)) return false;
  if (d.target === 'none' || !d.valid) return true;
  if (d.target === 'die') return run.dice.some((_, i) => d.valid!(run, i, -1));
  return run.dice.some((die, i) => die.faces.some((_, f) => d.valid!(run, i, f)));
}
