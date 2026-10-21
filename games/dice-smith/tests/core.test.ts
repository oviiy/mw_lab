import { describe, expect, it } from 'vitest';
import { evaluate } from '../src/core/hands';
import { makeRng } from '../src/core/rng';
import { flip, play, reroll, startRound, toggleHold } from '../src/core/round';
import { addArtifact, buy, chooseAugment, collect, encore, enterShop, finishRound, newRun, playBlind, skipBlind, useConsumable } from '../src/core/run';
import { targetFor } from '../src/core/round';
import { scoreHand } from '../src/core/score';
import type { Run } from '../src/core/types';

function setFaces(run: Run, faces: number[]) {
  run.round!.rolled.forEach((r, i) => (r.face = faces[i]));
}

function freshRound(seed = 1): Run {
  const run = newRun(seed);
  run.augments = [];
  run.artifacts = [];
  playBlind(run);
  return run;
}

describe('hand evaluation', () => {
  it('ranks three dice', () => {
    expect(evaluate([3, 3, 3], [false, false, false]).type).toBe('triple');
    expect(evaluate([2, 4, 3], [false, false, false]).type).toBe('straight');
    expect(evaluate([5, 2, 5], [false, false, false])).toMatchObject({ type: 'pair', scoring: [0, 2] });
    expect(evaluate([1, 6, 3], [false, false, false])).toMatchObject({ type: 'high', scoring: [1] });
  });

  it('wild dice take the best value', () => {
    expect(evaluate([4, 4, 1], [false, false, true]).type).toBe('triple');
    expect(evaluate([2, 3, 9], [false, false, true]).type).toBe('straight');
  });

  it('options: gap straights and seven-pairs', () => {
    expect(evaluate([2, 3, 5], [false, false, false]).type).toBe('high');
    expect(evaluate([2, 3, 5], [false, false, false], { gapStraight: true }).type).toBe('straight');
    expect(evaluate([1, 6, 3], [false, false, false], { sevenPair: true }).type).toBe('pair');
  });

  it('four dice hands', () => {
    expect(evaluate([2, 2, 5, 5], [false, false, false, false]).type).toBe('twopair');
    expect(evaluate([3, 4, 5, 6], [false, false, false, false]).type).toBe('longstraight');
    expect(evaluate([6, 6, 6, 6], [false, false, false, false]).type).toBe('quad');
    expect(evaluate([6, 6, 6, 1], [false, false, false, false])).toMatchObject({ type: 'triple', scoring: [0, 1, 2] });
  });
});

describe('scoring', () => {
  it('pair of fives: (10 + 5 + 5) × 2 = 40', () => {
    const run = freshRound();
    setFaces(run, [4, 4, 2]); // 5,5,3
    const r = scoreHand(run, run.round!, makeRng(1));
    expect(r.type).toBe('pair');
    expect(r.total).toBe(40);
  });

  it('marks and artifacts stack left to right', () => {
    const run = freshRound();
    run.dice[0].faces[4].mark = 'jade';
    addArtifact(run, 'coin');
    addArtifact(run, 'lantern');
    run.round!.hands = 1; // last hand
    setFaces(run, [4, 4, 2]);
    const r = scoreHand(run, run.round!, makeRng(1));
    // chips 10+5+5 = 20; mult 2 +4 (jade) +4 (coin) = 10, ×3 (lantern) = 30
    expect(r.chips).toBe(20);
    expect(r.mult).toBe(30);
    expect(r.total).toBe(600);
  });

  it('echo retriggers a die', () => {
    const run = freshRound();
    run.dice[0].faces[5].mark = 'echo';
    setFaces(run, [5, 5, 0]); // 6,6,1
    const r = scoreHand(run, run.round!, makeRng(1));
    expect(r.chips).toBe(10 + 6 + 6 + 6);
  });

  it('rubbing copies the artifact to its right', () => {
    const run = freshRound();
    addArtifact(run, 'rubbing');
    addArtifact(run, 'coin');
    setFaces(run, [0, 0, 3]);
    const r = scoreHand(run, run.round!, makeRng(1));
    expect(r.mult).toBe(2 + 4 + 4);
  });
});

describe('round flow', () => {
  it('holding keeps a die through a reroll', () => {
    const run = freshRound(3);
    const round = run.round!;
    setFaces(run, [5, 1, 2]);
    toggleHold(round, 0);
    reroll(run, round);
    expect(round.rolled[0].face).toBe(5);
    expect(round.rerolls).toBe(3);
  });

  it('compass flips to the opposite face once per hand', () => {
    const run = freshRound();
    addArtifact(run, 'compass');
    setFaces(run, [0, 1, 2]);
    expect(flip(run, run.round!, 0).length).toBe(1);
    expect(run.round!.rolled[0].face).toBe(5);
    expect(flip(run, run.round!, 1).length).toBe(0);
  });

  it('reaching the target wins and pays out', () => {
    const run = freshRound();
    run.round!.target = 10;
    setFaces(run, [5, 5, 5]);
    const money = run.money;
    play(run, run.round!);
    expect(run.round!.phase).toBe('won');
    finishRound(run);
    expect(run.screen.t).toBe('cashout');
    collect(run);
    expect(run.money).toBeGreaterThan(money);
    expect(run.screen.t).toBe('shop');
  });

  it('running out of hands loses', () => {
    const run = freshRound();
    run.round!.target = 1e9;
    for (let k = 0; k < 4; k++) play(run, run.round!);
    expect(run.round!.phase).toBe('lost');
  });

  it('skipping unlocks in act 2 and grants its tag', () => {
    const run = newRun(5);
    run.skipTags = ['cash', 'cash'];
    skipBlind(run);
    expect(run.blind).toBe(0); // not in act 1
    run.act = 2;
    const m = run.money;
    skipBlind(run);
    expect(run.blind).toBe(1);
    expect(run.money).toBe(m + 8);
  });
});

describe('shop and consumables', () => {
  it('buying an artifact spends money and fills a slot', () => {
    const run = newRun(9);
    run.money = 50;
    enterShop(run);
    const i = run.shop!.offers.findIndex((o) => o.kind === 'artifact');
    expect(buy(run, i)).toBe(true);
    expect(run.artifacts.length).toBe(1);
  });

  it('carving a face and starring a hand', () => {
    const run = newRun(9);
    run.consumables = [
      { uid: 1, kind: 'carve', id: 'plus2' },
      { uid: 2, kind: 'star', id: 'star_pair' },
      { uid: 3, kind: 'carve', id: 'mirrorcarve' },
    ];
    expect(useConsumable(run, 1, 0, 5)).not.toBeNull();
    expect(run.dice[0].faces[5].v).toBe(8);
    expect(useConsumable(run, 3, 0, 5)).not.toBeNull();
    expect(run.dice[0].faces[0].v).toBe(8);
    useConsumable(run, 2);
    expect(run.levels.pair).toBe(2);
  });
});

describe('a whole act', () => {
  it('can be played to the shop of act 2 by forcing wins', () => {
    const run = newRun(11);
    for (let b = 0; b < 3; b++) {
      playBlind(run);
      run.round!.target = 1;
      play(run, run.round!);
      finishRound(run);
      collect(run);
      if (run.screen.t === 'shop') run.screen = { t: 'select' };
    }
    expect(run.act).toBe(2);
    // The first 命格 is offered after act 1, then the market opens.
    expect(run.screen.t).toBe('augment');
    chooseAugment(run, 0);
    expect(run.screen.t).toBe('shop');
    expect(run.augments.length).toBe(1);
    expect(startRound).toBeDefined();
  });
});

describe('onboarding pacing', () => {
  it('the tutorial round deals a pair, then a straight on reroll', () => {
    const run = newRun(1, { tutorial: true });
    playBlind(run);
    const r = run.round!;
    expect(scoreHand(run, r, makeRng(1)).type).toBe('pair');
    play(run, r);
    expect(r.rolled.map((x) => x.face)).toEqual([2, 3, 0]);
    toggleHold(r, 0);
    toggleHold(r, 1);
    reroll(run, r);
    expect(scoreHand(run, r, makeRng(1)).type).toBe('straight');
  });

  it('act 1 has no bounties and the first market is small', () => {
    const run = newRun(3);
    playBlind(run);
    expect(run.round!.bounty).toBeUndefined();
    run.money = 50;
    enterShop(run);
    const kinds = run.shop!.offers.map((o) => (o.kind === 'consumable' ? o.c : o.kind));
    expect(kinds.filter((k) => k === 'artifact').length).toBe(2);
    expect(kinds.filter((k) => k === 'pack').length).toBe(0);
    expect(kinds.filter((k) => k === 'star').length).toBe(1);
  });
});

describe('replay', () => {
  it('stakes raise targets', () => {
    const a = newRun(4);
    const b = newRun(4, { stake: 2 });
    expect(targetFor(b)).toBeGreaterThan(targetFor(a));
  });

  it('encore continues past the final headliner with bigger targets', () => {
    const run = newRun(8);
    run.act = 6;
    run.blind = 2;
    playBlind(run);
    run.round!.target = 1;
    play(run, run.round!);
    finishRound(run);
    collect(run);
    expect(run.screen).toEqual({ t: 'over', won: true });
    const t6 = targetFor(run, 0);
    encore(run);
    expect(run.act).toBe(7);
    expect(run.screen.t).toBe('shop');
    expect(targetFor(run, 0)).toBeGreaterThan(t6);
    expect(run.bosses[6]).toBeDefined();
  });
});
