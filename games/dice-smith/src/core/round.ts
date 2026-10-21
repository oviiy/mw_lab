import { ARTIFACTS, hasPassive } from './artifacts';
import { has } from './augments';
import { consumablesOf } from './consumables';
import { containsStraight, containsTriple, evaluate } from './hands';
import { BOSSES, FATE_RULES } from './opponents';
import { int, pick } from './rng';
import { activeRule, diceView, evalOpts, isBig, scoreHand } from './score';
import type { BlindKind, GEvent, Round, Run, ScoreResult } from './types';

/** Base target per act; small ×1, big ×1.5, boss ×2 (× boss modifier). Tuned by scripts/sim.ts. */
export const ACT_BASE = [60, 250, 650, 1500, 3400, 7000];
export const ACTS = ACT_BASE.length;
const BLIND_MUL = [1, 1.5, 2];
export const BLIND_KIND: BlindKind[] = ['small', 'big', 'boss'];

function niceRound(n: number) {
  const step = n < 1000 ? 10 : n < 10000 ? 50 : n < 100000 ? 500 : 5000;
  return Math.round(n / step) * step;
}

export const STAKES = [
  { name: '寻常', desc: '标准难度。' },
  { name: '加注', desc: '目标分 ×1.25；利息上限降到 3。' },
  { name: '豪赌', desc: '目标分 ×1.5；利息上限 3；每场重掷 −1。' },
];
const STAKE_MUL = [1, 1.25, 1.5];

/** Base target for an act; past act 6 (加演) it doubles each act. */
export function actBase(act: number) {
  if (act <= ACT_BASE.length) return ACT_BASE[act - 1];
  return ACT_BASE[ACT_BASE.length - 1] * Math.pow(2, act - ACT_BASE.length);
}

export function targetFor(run: Run, blind = run.blind): number {
  const boss = blind === 2 ? BOSSES[run.bosses[run.act - 1]] : undefined;
  return niceRound(actBase(run.act) * BLIND_MUL[blind] * (boss?.targetMul ?? 1) * STAKE_MUL[run.stake ?? 0]);
}

export function giveCarve(run: Run): boolean {
  if (run.consumables.length >= run.consumableSlots) return false;
  run.consumables.push({ uid: run.nextUid++, kind: 'carve', id: pick(run.rng, consumablesOf('carve', false)) });
  return true;
}

export function startRound(run: Run): GEvent[] {
  const blind = run.blind;
  const kind = BLIND_KIND[blind];
  const boss = kind === 'boss' ? run.bosses[run.act - 1] : undefined;
  let hands = 4 + (has(run, 'morehands') ? 1 : 0);
  let rerolls = 4 + (has(run, 'morerolls') ? 2 : 0);
  const ti = run.tags.indexOf('rerolls');
  if (ti >= 0) {
    rerolls += 3;
    run.tags.splice(ti, 1);
  }
  if ((run.stake ?? 0) >= 2) rerolls = Math.max(1, rerolls - 1);
  if (boss === 'zhuge') rerolls = 1;
  if (boss === 'wusong') hands = 1;
  const round: Round = {
    kind,
    opponent: kind === 'boss' ? boss! : run.opponents[blind],
    boss,
    target: targetFor(run),
    score: 0,
    hands,
    rerolls,
    handsPlayed: 0,
    rolled: run.dice.map(() => ({ face: 0, held: false })),
    rerolledThisHand: false,
    handRerolls: 0,
    anyReroll: false,
    flipped: false,
    freeFlipped: false,
    hidden: false,
    disabled: null,
    playedTypes: [],
    roundMult: 0,
    // Bounties start in act 2, once the basics have landed.
    bounty: kind === 'boss' || run.act < 2 ? undefined : { id: run.bounties[blind], done: false },
    kept: null,
    script: run.tutorial && run.act === 1 && blind === 0 ? TUTORIAL_SCRIPT.map((x) => [...x]) : undefined,
    phase: 'rolling',
  };
  run.round = round;
  run.screen = { t: 'round' };
  for (const a of run.artifacts) {
    const d = ARTIFACTS[a.id];
    if (d.tag === 'carveOnStart') giveCarve(run);
    d.roundStart?.(run, a);
  }
  return rollHand(run, round);
}

function rollFace(run: Run) {
  return int(run.rng, 0, 5);
}

function inkBonus(run: Run, round: Round, dice: number[], ev: GEvent[]) {
  const n = dice.filter((i) => run.dice[i].faces[round.rolled[i].face].mark === 'ink').length;
  if (n) {
    round.rerolls += n;
    ev.push({ t: 'reroll+', amount: n });
  }
}

function applyScript(round: Round, dice: number[]) {
  const s = round.script?.shift();
  if (!s) return;
  for (const i of dice) if (s[i] !== undefined && s[i] >= 0) round.rolled[i].face = s[i];
}

/** The teaching round: a pair of fives, then 3·4·1 that rerolls into a straight. */
export const TUTORIAL_SCRIPT = [
  [4, 4, 1],
  [2, 3, 0],
  [-1, -1, 4],
];

/** Start a new hand: fresh roll (except a kept die), per-hand boss effects. */
export function rollHand(run: Run, round: Round): GEvent[] {
  const ev: GEvent[] = [];
  if (round.boss === 'fate') round.rule = pick(run.rng, FATE_RULES);
  const rule = activeRule(round);
  round.disabled = rule === 'zhongkui' && run.artifacts.length ? int(run.rng, 0, run.artifacts.length - 1) : null;
  round.hidden = rule === 'wuchang';
  round.rerolledThisHand = false;
  round.handRerolls = 0;
  round.flipped = false;
  round.freeFlipped = false;
  const dice = run.dice.map((_, i) => i).filter((i) => i !== round.kept);
  round.rolled.forEach((r, i) => (r.held = i === round.kept));
  const doRoll = () => dice.forEach((i) => (round.rolled[i].face = rollFace(run)));
  doRoll();
  applyScript(round, dice);
  if (has(run, 'destiny')) {
    for (let k = 0; k < 40; k++) {
      const v = diceView(run, round);
      if (evaluate(v.vals, v.wild, evalOpts(run)).type !== 'high') break;
      doRoll();
    }
  }
  round.kept = null;
  ev.push({ t: 'roll', dice });
  inkBonus(run, round, dice, ev);
  return ev;
}

export function canHold(round: Round) {
  return activeRule(round) !== 'zhangfei';
}

export function toggleHold(round: Round, i: number): boolean {
  if (round.phase !== 'rolling' || !canHold(round) || !round.rolled[i]) return false;
  round.rolled[i].held = !round.rolled[i].held;
  return true;
}

export function reroll(run: Run, round: Round): GEvent[] {
  if (round.phase !== 'rolling' || round.rerolls <= 0) return [];
  const all = !canHold(round);
  const dice = round.rolled.map((r, i) => (all || !r.held ? i : -1)).filter((i) => i >= 0);
  if (!dice.length) return [];
  // 骰盅: the first reroll of each hand is on the house.
  if (!(hasPassive(run, 'freeReroll') && !round.rerolledThisHand)) round.rerolls--;
  round.rerolledThisHand = true;
  round.handRerolls++;
  round.hidden = false;
  round.anyReroll = true;
  dice.forEach((i) => (round.rolled[i].face = rollFace(run)));
  applyScript(round, dice);
  const ev: GEvent[] = [{ t: 'roll', dice }];
  inkBonus(run, round, dice, ev);
  return ev;
}

export function flipsAvailable(run: Run, round: Round): number {
  return (has(run, 'palmflip') && !round.freeFlipped ? 1 : 0) + (hasPassive(run, 'compass') && !round.flipped ? 1 : 0);
}

export function flip(run: Run, round: Round, i: number): GEvent[] {
  if (round.phase !== 'rolling' || !round.rolled[i]) return [];
  if (has(run, 'palmflip') && !round.freeFlipped) round.freeFlipped = true;
  else if (hasPassive(run, 'compass') && !round.flipped) round.flipped = true;
  else return [];
  round.rolled[i].face = 5 - round.rolled[i].face;
  round.hidden = false;
  return [{ t: 'flip', die: i }];
}

function bountyMet(run: Run, round: Round, r: ScoreResult, won: boolean): boolean {
  const id = round.bounty?.id;
  const view = diceView(run, round);
  switch (id) {
    case 'straight':
      return containsStraight(r.type);
    case 'triple':
      return containsTriple(r.type);
    case 'twohands':
      return won && round.handsPlayed <= 2;
    case 'allred':
      return view.red.every(Boolean);
    case 'half':
      return r.total * 2 >= round.target;
    case 'noreroll':
      return won && !round.anyReroll;
    case 'big':
      return isBig(r.vals);
    case 'parity':
      return r.vals.every((v) => v % 2 === 1) || r.vals.every((v) => v % 2 === 0);
  }
  return false;
}

export function play(run: Run, round: Round): GEvent[] {
  if (round.phase !== 'rolling') return [];
  const ev: GEvent[] = [];
  round.hidden = false;
  if (activeRule(round) === 'wukong') {
    // Held dice are safe from the transformation: holding becomes a defence.
    const loose = round.rolled.map((r, i) => (r.held ? -1 : i)).filter((i) => i >= 0);
    if (loose.length) {
      const i = loose[int(run.rng, 0, loose.length - 1)];
      round.rolled[i].face = rollFace(run);
      ev.push({ t: 'change', die: i });
    }
  }
  const ironCount = run.artifacts.filter((a) => a.id === 'ironabacus').length;
  round.roundMult += 4 * ironCount;

  const r = scoreHand(run, round, run.rng);
  round.last = r;
  round.score += r.total;
  ev.push({ t: 'score', result: r });
  if (r.money) {
    run.money += r.money;
    ev.push({ t: 'money', amount: r.money });
  }
  for (const [d, f] of r.shattered) {
    const face = run.dice[d].faces[f];
    face.v = 0;
    delete face.mark;
    ev.push({ t: 'shatter', die: d });
  }

  // Scaling and streaks.
  for (const a of run.artifacts) ARTIFACTS[a.id].afterHand?.(run, round, r.type, a);
  run.streak = run.streak.type === r.type ? { type: r.type, count: run.streak.count + 1 } : { type: r.type, count: 1 };
  round.playedTypes.push(r.type);
  run.stats.hands++;
  run.stats.played[r.type] = (run.stats.played[r.type] ?? 0) + 1;
  if (r.total > run.stats.best) {
    run.stats.best = r.total;
    run.stats.bestType = r.type;
  }

  round.handsPlayed++;
  round.hands--;
  const won = round.score >= round.target;
  if (round.bounty && !round.bounty.done && bountyMet(run, round, r, won)) {
    round.bounty.done = true;
    ev.push({ t: 'bounty', id: round.bounty.id });
  }
  if (has(run, 'keepdie')) {
    const held = round.rolled.findIndex((x) => x.held);
    round.kept = held >= 0 ? held : null;
  }
  if (won) {
    round.phase = 'won';
    ev.push({ t: 'won' });
  } else if (round.hands <= 0) {
    round.phase = 'lost';
    ev.push({ t: 'lost' });
  } else ev.push(...rollHand(run, round));
  return ev;
}
