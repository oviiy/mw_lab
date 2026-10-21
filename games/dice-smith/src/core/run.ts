import { ARTIFACT_IDS, ARTIFACT_PRICE, ARTIFACTS, hasTag, type Rarity } from './artifacts';
import { AUGMENTS, augmentOptions, has, randomHand, type Tier } from './augments';
import { canUse, CONSUMABLES, consumablesOf } from './consumables';
import { makeDie, MAX_PIPS } from './dice';
import { HAND_ORDER, HANDS } from './hands';
import { BOSSES, BOUNTIES, OPPONENTS, TAGS } from './opponents';
import { int, makeRng, pick, shuffle, weighted } from './rng';
import { ACTS, giveCarve, startRound } from './round';
import type { CashLine, ConsumableKind, GEvent, HandType, Offer, PackKind, Run } from './types';

export const RUN_VERSION = 3;

const levels0 = () => Object.fromEntries(HAND_ORDER.map((h) => [h, 1])) as Record<HandType, number>;

function setupAct(run: Run) {
  run.opponents = shuffle(run.rng, Object.keys(OPPONENTS)).slice(0, 2);
  run.bounties = shuffle(run.rng, Object.keys(BOUNTIES)).slice(0, 2);
  run.skipTags = [pick(run.rng, Object.keys(TAGS)), pick(run.rng, Object.keys(TAGS))];
}

export function newRun(seed: number, opts: { tutorial?: boolean; stake?: number } = {}): Run {
  const rng = makeRng(seed);
  const gentle = Object.values(BOSSES).filter((b) => b.gentle).map((b) => b.id);
  const act1 = pick(rng, gentle);
  const rest = shuffle(rng, Object.keys(BOSSES).filter((b) => b !== 'fate' && b !== act1)).slice(0, ACTS - 2);
  const run: Run = {
    version: RUN_VERSION,
    seed,
    rng,
    money: 4,
    dice: [1, 2, 3].map((i) => makeDie(`d${i}`)),
    artifacts: [],
    consumables: [],
    artifactSlots: 5,
    consumableSlots: 2,
    levels: levels0(),
    augments: [],
    act: 1,
    blind: 0,
    bosses: [act1, ...rest, 'fate'],
    opponents: [],
    bounties: [],
    tags: [],
    skipTags: [],
    round: null,
    shop: null,
    screen: { t: 'select' },
    streak: { type: null, count: 0 },
    stats: { hands: 0, best: 0, bestType: null, rounds: 0, carves: 0, played: {} },
    nextUid: 100,
    tutorial: !!opts.tutorial,
    shops: 0,
    stake: opts.stake ?? 0,
    endless: false,
  };
  setupAct(run);
  return run;
}

// ---------- augments ----------

export function chooseAugment(run: Run, i: number) {
  if (run.screen.t !== 'augment') return;
  const id = run.screen.options[i];
  if (!id) return;
  const then = run.screen.then;
  run.augments.push(id);
  AUGMENTS[id].apply?.(run);
  if (id === 'pack') giveCarve(run);
  if (id === 'fourthdie' && run.dice.length < 4) run.dice.push(makeDie(`d${run.nextUid++}`));
  run.screen = then === 'shop' ? enterShop(run) : { t: 'select' };
}

// ---------- blind select ----------

export function playBlind(run: Run): GEvent[] {
  if (run.screen.t !== 'select') return [];
  return startRound(run);
}

export function skipBlind(run: Run) {
  if (run.screen.t !== 'select' || !canSkip(run)) return;
  const tag = run.skipTags[run.blind];
  run.blind++;
  applyTag(run, tag);
}

/** Skipping unlocks in act 2. */
export function canSkip(run: Run) {
  return run.act >= 2 && run.blind < 2;
}

function applyTag(run: Run, tag: string) {
  switch (tag) {
    case 'cash':
      run.money += 8;
      break;
    case 'talisman':
      if (run.consumables.length < run.consumableSlots) run.consumables.push({ uid: run.nextUid++, kind: 'talisman', id: pick(run.rng, consumablesOf('talisman')) });
      break;
    case 'carvepack':
      openPack(run, 'carve', 3, 1);
      break;
    case 'starpack':
      openPack(run, 'star', 3, 1);
      break;
    default:
      run.tags.push(tag);
  }
}

// ---------- after a round ----------

export function interestCap(run: Run) {
  if (has(run, 'midas')) return 0;
  return ((run.stake ?? 0) >= 1 ? 3 : 5) + (has(run, 'smallfortune') ? 5 : 0);
}

/** Called when the round is won: build cash-out lines and apply end-of-round effects. */
export function finishRound(run: Run) {
  const round = run.round;
  if (!round) return;
  if (round.phase === 'lost') {
    run.screen = { t: 'over', won: false };
    return;
  }
  if (round.phase !== 'won') return;
  for (const a of run.artifacts) ARTIFACTS[a.id].onWin?.(run, round, a);
  const lines: CashLine[] = [];
  lines.push({ label: round.kind === 'boss' ? '赢下头牌' : round.kind === 'big' ? '赢下大场' : '赢下小场', amount: [3, 4, 5][run.blind] });
  if (round.hands > 0) lines.push({ label: `剩余出手 ×${round.hands}`, amount: round.hands });
  const interest = Math.min(interestCap(run), Math.floor(Math.max(0, run.money) / 5));
  if (interest > 0) lines.push({ label: '利息', amount: interest });
  for (const a of run.artifacts) {
    const m = ARTIFACTS[a.id].cashOut?.(run, round, a) ?? 0;
    if (m > 0) lines.push({ label: ARTIFACTS[a.id].name, amount: m });
  }
  if (round.bounty?.done) {
    const b = BOUNTIES[round.bounty.id];
    if (b.money) lines.push({ label: `悬赏：${b.desc}`, amount: b.money });
    if (b.carve) giveCarve(run);
  }
  // Growth effects.
  for (let k = 0; k < hasTag(run, 'growFace'); k++) {
    const d = pick(run.rng, run.dice);
    const f = d.faces[int(run.rng, 0, 5)];
    f.v = Math.min(MAX_PIPS, f.v + 1);
  }
  if (round.kind === 'boss') {
    for (let k = 0; k < hasTag(run, 'starOnBoss'); k++) {
      if (run.consumables.length < run.consumableSlots) run.consumables.push({ uid: run.nextUid++, kind: 'star', id: `star_${pick(run.rng, availableHands(run))}` });
    }
    if (has(run, 'starluck')) run.levels[randomHand(run)]++;
  }
  run.stats.rounds++;
  run.screen = { t: 'cashout', lines };
}

export function availableHands(run: Run): HandType[] {
  return HAND_ORDER.filter((h) => HANDS[h].need <= run.dice.length);
}

export function collect(run: Run) {
  if (run.screen.t !== 'cashout') return;
  run.money += run.screen.lines.reduce((s, l) => s + l.amount, 0);
  const wasBoss = run.blind === 2;
  run.round = null;
  if (wasBoss) {
    if (run.act === ACTS && !run.endless) {
      run.screen = { t: 'over', won: true };
      return;
    }
    if (run.act >= ACTS) run.bosses.push(randomBoss(run));
    // 命格 arrive after acts 1, 3 and 5 — never before the player has seen a whole act.
    const tier: Tier | null = run.act === 1 ? 'silver' : run.act === 3 ? 'gold' : run.act === 5 ? 'prism' : null;
    run.act++;
    run.blind = 0;
    setupAct(run);
    if (tier) {
      run.screen = { t: 'augment', tier, options: augmentOptions(run, tier), then: 'shop' };
      return;
    }
  } else run.blind++;
  run.screen = enterShop(run);
}

/** 加演: keep playing past the final headliner with doubling targets. */
export function encore(run: Run) {
  if (run.screen.t !== 'over' || !run.screen.won) return;
  run.endless = true;
  run.act = ACTS + 1;
  run.blind = 0;
  run.round = null;
  run.bosses.push(randomBoss(run));
  setupAct(run);
  run.screen = enterShop(run);
}

function randomBoss(run: Run) {
  return pick(run.rng, [...Object.keys(BOSSES).filter((b) => b !== 'fate'), 'fate']);
}

// ---------- shop ----------

const ART_WEIGHTS: [Rarity, number][] = [['common', 68], ['uncommon', 26], ['rare', 6]];

/** Rarer artifacts unlock as the run goes on: commons in act 1, uncommons from act 2, rares from act 3. */
function artWeights(run: Run): [Rarity, number][] {
  if (run.act <= 1) return [['common', 1]];
  if (run.act === 2) return [['common', 70], ['uncommon', 30]];
  return ART_WEIGHTS;
}

function randomArtifact(run: Run, rarity?: Rarity, exclude: string[] = []): string | null {
  const r = rarity ?? weighted(run.rng, artWeights(run));
  const owned = run.artifacts.map((a) => a.id);
  const pool = ARTIFACT_IDS.filter((id) => ARTIFACTS[id].rarity === r && !owned.includes(id) && !exclude.includes(id));
  if (pool.length) return pick(run.rng, pool);
  const any = ARTIFACT_IDS.filter((id) => !owned.includes(id) && !exclude.includes(id));
  return any.length ? pick(run.rng, any) : null;
}

/** First market: stars only. Carving tools from the second. Talismans from act 3. */
function consumableWeights(run: Run): [ConsumableKind, number][] {
  if (run.shops <= 1) return [['star', 1]];
  if (run.act < 3) return [['carve', 55], ['star', 45]];
  return [['carve', 52], ['star', 40], ['talisman', 8]];
}

function randomConsumable(run: Run, kind?: ConsumableKind): { c: ConsumableKind; id: string } {
  const c = kind ?? weighted<ConsumableKind>(run.rng, consumableWeights(run));
  if (c === 'star') return { c, id: `star_${pick(run.rng, availableHands(run))}` };
  return { c, id: pick(run.rng, consumablesOf(c, c !== 'carve' || int(run.rng, 0, 4) === 0)) };
}

const PACKS: { pack: PackKind; size: number; picks: number; price: number; w: number }[] = [
  { pack: 'carve', size: 3, picks: 1, price: 4, w: 40 },
  { pack: 'star', size: 3, picks: 1, price: 4, w: 30 },
  { pack: 'artifact', size: 2, picks: 1, price: 5, w: 20 },
  { pack: 'talisman', size: 2, picks: 1, price: 5, w: 10 },
];

function stockShop(run: Run): Offer[] {
  const offers: Offer[] = [];
  const used: string[] = [];
  for (let k = 0; k < 2; k++) {
    const rare = k === 0 && run.tags.includes('rareart');
    const id = randomArtifact(run, rare ? 'rare' : undefined, used);
    if (rare) run.tags.splice(run.tags.indexOf('rareart'), 1);
    if (id) {
      used.push(id);
      offers.push({ kind: 'artifact', id, price: ARTIFACT_PRICE[ARTIFACTS[id].rarity] });
    }
  }
  // The first market keeps it to two artifacts and one star; it widens from there.
  const nCons = run.shops <= 1 ? 1 : 2;
  for (let k = 0; k < nCons; k++) {
    const { c, id } = randomConsumable(run);
    offers.push({ kind: 'consumable', c, id, price: CONSUMABLES[id].price });
  }
  const packs = run.act < 2 ? [] : PACKS.filter((p) => run.act >= 3 || p.pack !== 'talisman');
  for (let k = 0; k < (packs.length ? 2 : 0); k++) {
    const p = weighted(run.rng, packs.map((x) => [x, x.w] as [typeof x, number]));
    offers.push({ kind: 'pack', pack: p.pack, size: p.size, picks: p.picks, price: p.price });
  }
  const free = run.tags.indexOf('freeart');
  const firstArt = offers.find((o) => o.kind === 'artifact');
  if (free >= 0 && firstArt) {
    firstArt.price = 0;
    run.tags.splice(free, 1);
  }
  return offers;
}

export function enterShop(run: Run): { t: 'shop' } {
  run.shops++;
  run.shop = { offers: stockShop(run), rerollCost: 5 };
  if (has(run, 'carver')) giveCarve(run);
  return { t: 'shop' };
}

export function rerollShop(run: Run): boolean {
  const s = run.shop;
  if (!s || run.money < s.rerollCost) return false;
  run.money -= s.rerollCost;
  s.rerollCost++;
  const keepPacks = s.offers.filter((o) => o.kind === 'pack');
  s.offers = [...stockShop(run).filter((o) => o.kind !== 'pack'), ...keepPacks];
  return true;
}

export function canAfford(run: Run, o: Offer) {
  return run.money >= o.price;
}

export function canTake(run: Run, o: Offer) {
  if (o.kind === 'artifact') return run.artifacts.length < run.artifactSlots;
  if (o.kind === 'consumable') return run.consumables.length < run.consumableSlots;
  return true;
}

export function buy(run: Run, index: number): boolean {
  const o = run.shop?.offers[index];
  if (!o || o.sold || !canAfford(run, o) || !canTake(run, o)) return false;
  run.money -= o.price;
  o.sold = true;
  if (o.kind === 'artifact') addArtifact(run, o.id);
  else if (o.kind === 'consumable') run.consumables.push({ uid: run.nextUid++, kind: o.c, id: o.id });
  else openPack(run, o.pack, o.size, o.picks);
  return true;
}

export function addArtifact(run: Run, id: string) {
  run.artifacts.push({ uid: run.nextUid++, id, n: ARTIFACTS[id].n0 ?? 0 });
  if (ARTIFACTS[id].tag === 'consumableSlots') run.consumableSlots += 2;
}

export function sellPrice(id: string) {
  return Math.max(1, Math.floor(ARTIFACT_PRICE[ARTIFACTS[id].rarity] / 2));
}

export function sellArtifact(run: Run, index: number): boolean {
  const a = run.artifacts[index];
  if (!a) return false;
  run.money += sellPrice(a.id);
  run.artifacts.splice(index, 1);
  if (ARTIFACTS[a.id].tag === 'consumableSlots') {
    run.consumableSlots -= 2;
    run.consumables = run.consumables.slice(0, run.consumableSlots);
  }
  return true;
}

export function moveArtifact(run: Run, from: number, to: number) {
  if (from === to || !run.artifacts[from] || to < 0 || to >= run.artifacts.length) return;
  const [a] = run.artifacts.splice(from, 1);
  run.artifacts.splice(to, 0, a);
}

export function leaveShop(run: Run) {
  if (run.screen.t !== 'shop') return;
  run.shop = null;
  run.screen = { t: 'select' };
}

// ---------- packs ----------

function openPack(run: Run, pack: PackKind, size: number, picks: number) {
  const options: Offer[] = [];
  const used: string[] = [];
  for (let k = 0; k < size; k++) {
    if (pack === 'artifact') {
      const id = randomArtifact(run, undefined, used);
      if (id) {
        used.push(id);
        options.push({ kind: 'artifact', id, price: 0 });
      }
    } else {
      let o = randomConsumable(run, pack);
      for (let t = 0; t < 8 && used.includes(o.id); t++) o = randomConsumable(run, pack);
      used.push(o.id);
      options.push({ kind: 'consumable', c: o.c, id: o.id, price: 0 });
    }
  }
  run.screen = { t: 'pack', pack, options, picks };
}

export function packBack(run: Run) {
  run.screen = run.shop ? { t: 'shop' } : { t: 'select' };
}

/** Take an item from an open pack. Consumables are used immediately (die/face for targeted ones). */
export function pickFromPack(run: Run, index: number, die = -1, face = -1): string | null {
  if (run.screen.t !== 'pack') return null;
  const o = run.screen.options[index];
  if (!o || o.sold) return null;
  let msg: string | null = null;
  if (o.kind === 'artifact') {
    if (run.artifacts.length >= run.artifactSlots) return null;
    addArtifact(run, o.id);
    msg = `得到${ARTIFACTS[o.id].name}`;
  } else if (o.kind === 'consumable') {
    msg = applyConsumable(run, o.id, die, face);
    if (msg === null) return null;
  }
  o.sold = true;
  run.screen.picks--;
  if (run.screen.picks <= 0) packBack(run);
  return msg;
}

// ---------- consumables ----------

function applyConsumable(run: Run, id: string, die: number, face: number): string | null {
  const d = CONSUMABLES[id];
  if (!canUse(run, id)) return null;
  if (d.target !== 'none') {
    if (!run.dice[die]) return null;
    if (d.target === 'face' && !run.dice[die].faces[face]) return null;
    if (d.valid && !d.valid(run, die, d.target === 'die' ? -1 : face)) return null;
  }
  const msg = d.apply(run, die, face);
  if (d.kind === 'carve') {
    run.stats.carves++;
    for (const a of run.artifacts) ARTIFACTS[a.id].onCarve?.(a);
  }
  return msg;
}

export function useConsumable(run: Run, uid: number, die = -1, face = -1): string | null {
  const i = run.consumables.findIndex((c) => c.uid === uid);
  if (i < 0) return null;
  const msg = applyConsumable(run, run.consumables[i].id, die, face);
  if (msg !== null) run.consumables.splice(i, 1);
  return msg;
}

export function discardConsumable(run: Run, uid: number) {
  run.consumables = run.consumables.filter((c) => c.uid !== uid);
}
