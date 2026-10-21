import { ARTIFACTS, hasPassive, type ArtifactDef, type ScoreCtx } from './artifacts';
import { has } from './augments';
import { isRedValue, MARKS } from './dice';
import { evaluate, handChipsMult, HANDS } from './hands';
import { next, type Rng } from './rng';
import type { ArtifactInst, Effect, Face, HandType, Round, Run, ScoreResult, Step } from './types';

/** The rule in force this hand (the final boss rotates). */
export function activeRule(round: Round | null): string | undefined {
  if (!round) return undefined;
  return round.boss === 'fate' ? round.rule : round.boss;
}

export function faceUp(run: Run, round: Round, i: number): Face {
  return run.dice[i].faces[round.rolled[i].face];
}

export interface DiceView {
  vals: number[];
  wild: boolean[];
  red: boolean[];
  faces: Face[];
}

/** Values the hand is formed from, after artifacts, augments and boss rules. */
export function diceView(run: Run, round: Round): DiceView {
  const rule = activeRule(round);
  const oneIsSix = hasPassive(run, 'oneIsSix');
  const myriad = has(run, 'myriad');
  const faces = run.dice.map((_, i) => faceUp(run, round, i));
  const vals: number[] = [];
  const wild: boolean[] = [];
  faces.forEach((f, i) => {
    let v = f.v;
    if (oneIsSix && v === 1) v = 6;
    if (rule === 'nezha' && v === 6) v = 1;
    if (f.mark === 'mirror' && i > 0) v = vals[i - 1];
    vals.push(v);
    wild.push(f.mark === 'wild' || (myriad && f.v === 1 && !f.mark));
  });
  const red = faces.map((f, i) => f.mark === 'cinnabar' || isRedValue(vals[i]));
  return { vals, wild, red, faces };
}

export function evalOpts(run: Run) {
  return { gapStraight: hasPassive(run, 'gapStraight'), sevenPair: hasPassive(run, 'sevenPair') };
}

export function isBig(vals: number[]) {
  return vals.reduce((a, b) => a + b, 0) > 3.5 * vals.length;
}

/** Hand type and base numbers, for the live label above the dice. */
export function preview(run: Run, round: Round) {
  const v = diceView(run, round);
  const e = evaluate(v.vals, v.wild, evalOpts(run));
  const base = handChipsMult(e.type, run.levels[e.type]);
  return { type: e.type, scoring: e.scoring, ...base };
}

interface ActiveArt {
  a: number;
  def: ArtifactDef;
  inst: ArtifactInst;
  times: number;
}

/** Artifacts that act this hand, in order, with copies resolved. */
export function activeArtifacts(run: Run, round: Round | null): ActiveArt[] {
  const list = run.artifacts;
  const out: ActiveArt[] = [];
  list.forEach((inst, a) => {
    if (round && round.disabled === a) return;
    let d = ARTIFACTS[inst.id];
    let src = inst;
    if (d.copy) {
      const t = d.copy === 'right' ? list[a + 1] : list[0];
      if (!t || t === inst || ARTIFACTS[t.id].copy) return;
      d = ARTIFACTS[t.id];
      src = t;
    }
    out.push({ a, def: d, inst: src, times: has(run, 'mirrorflower') && a === list.length - 1 ? 2 : 1 });
  });
  return out;
}

const fmtFx = (fx: Effect) =>
  [fx.chips ? `+${fx.chips} 筹` : '', fx.mult ? `+${fx.mult} 倍` : '', fx.xmult ? `×${+fx.xmult.toFixed(2)} 倍` : '', fx.money ? `+${fx.money} 金` : ''].filter(Boolean).join(' ');

/**
 * Score the current dice. Pure except for glass shatter rolls, which consume `rng`.
 * Does not mutate the run; the caller applies money, shatters and scaling.
 */
export function scoreHand(run: Run, round: Round, rng: Rng): ScoreResult {
  const view = diceView(run, round);
  const ev = evaluate(view.vals, view.wild, evalOpts(run));
  const rule = activeRule(round);
  const type: HandType = ev.type;
  const base = handChipsMult(type, run.levels[type]);
  let chips = base.chips;
  let mult = base.mult;
  let money = 0;
  const steps: Step[] = [{ k: 'base', chips, mult }];
  const shattered: [number, number][] = [];

  const scoring = hasPassive(run, 'allScore') ? view.vals.map((_, i) => i) : [...ev.scoring].sort((a, b) => a - b);
  const ctx: ScoreCtx = {
    run,
    round,
    hand: type,
    scoring,
    formed: ev.scoring,
    vals: view.vals,
    isRed: (i) => view.red[i],
    big: isBig(view.vals),
    isLastHand: round.hands === 1,
    rerolledThisHand: round.rerolledThisHand,
  };

  const apply = (fx: Effect) => {
    if (fx.chips) chips += fx.chips;
    if (fx.mult) mult += fx.mult;
    if (fx.xmult) mult *= fx.xmult;
    if (fx.money) money += fx.money;
  };

  if (rule === 'yangmen' && round.playedTypes.includes(type)) {
    steps.push({ k: 'rule', label: `不二：${HANDS[type].name}已经出过`, chips: 0, mult: 0 });
    return { type, scoring, vals: view.vals, steps, chips: 0, mult: 0, total: 0, money: 0, shattered };
  }

  const arts = activeArtifacts(run, round);
  const maxDie = view.vals.reduce((b, v, i) => (v > view.vals[b] ? i : b), 0);
  const debuffed = (i: number) => (rule === 'guangong' && view.red[i]) || (rule === 'baozheng' && view.vals[i] % 2 === 1) || (rule === 'caocao' && i === maxDie);

  scoring.forEach((i, p) => {
    if (debuffed(i)) {
      steps.push({ k: 'rule', label: '不计分', chips, mult });
      return;
    }
    const f = view.faces[i];
    let triggers = 1;
    if (f.mark === 'echo') triggers++;
    for (const aa of arts) if (aa.def.retrigger) triggers += aa.def.retrigger(ctx, i, p === 0) * aa.times;
    if (p === 0 && has(run, 'echoes')) triggers += 2;
    const die = run.dice[i];

    for (let t = 0; t < triggers; t++) {
      // Pips.
      chips += view.vals[i];
      steps.push({ k: 'die', i, label: `+${view.vals[i]}`, fx: { chips: view.vals[i] }, chips, mult });
      // Face mark.
      let mfx: Effect | null = null;
      if (f.mark === 'jade') mfx = { mult: 4 };
      else if (f.mark === 'iron') mfx = { chips: 20 };
      else if (f.mark === 'gold') mfx = { money: 2 };
      else if (f.mark === 'glass') {
        mfx = { xmult: 2 };
        if (t === 0 && next(rng) < 0.25) shattered.push([i, round.rolled[i].face]);
      } else if (f.mark === 'cinnabar') mfx = { mult: 2 };
      if (mfx) {
        apply(mfx);
        steps.push({ k: 'die', i, label: `${MARKS[f.mark!].glyph} ${fmtFx(mfx)}`, fx: mfx, chips, mult });
      }
      // Material.
      const mat: Effect | null = die.material === 'ivory' ? { chips: 10 } : die.material === 'ebony' ? { mult: 2 } : die.material === 'lacquer' ? { xmult: 1.5 } : null;
      if (mat) {
        apply(mat);
        steps.push({ k: 'die', i, label: fmtFx(mat), fx: mat, chips, mult });
      }
      if (has(run, 'midas') && t === 0) {
        apply({ money: 1 });
        steps.push({ k: 'die', i, label: '+1 金', fx: { money: 1 }, chips, mult });
      }
      // Per-die artifacts.
      for (const aa of arts) {
        if (!aa.def.onDie) continue;
        for (let k = 0; k < aa.times; k++) {
          const fx = aa.def.onDie(ctx, i, aa.inst);
          if (!fx) continue;
          apply(fx);
          steps.push({ k: 'art', a: aa.a, label: fmtFx(fx), fx, chips, mult });
        }
      }
    }
  });

  // Per-hand artifacts.
  for (const aa of arts) {
    if (!aa.def.onHand) continue;
    for (let k = 0; k < aa.times; k++) {
      const fx = aa.def.onHand(ctx, aa.inst);
      if (!fx) continue;
      apply(fx);
      steps.push({ k: 'art', a: aa.a, label: fmtFx(fx), fx, chips, mult });
    }
  }

  mult = Math.round(mult * 100) / 100;
  const total = Math.floor(chips * mult);
  return { type, scoring, vals: view.vals, steps, chips, mult, total, money, shattered };
}
