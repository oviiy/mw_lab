// Balance simulator: a Monte-Carlo holding bot plays N full runs.
//   npm run sim -- 200
import { ARTIFACTS } from '../src/core/artifacts';
import { CONSUMABLES } from '../src/core/consumables';
import { HAND_ORDER } from '../src/core/hands';
import { int, makeRng, type Rng } from '../src/core/rng';
import { ACT_BASE, flip, flipsAvailable, play, reroll, toggleHold } from '../src/core/round';
import { buy, chooseAugment, collect, finishRound, leaveShop, newRun, pickFromPack, playBlind, useConsumable } from '../src/core/run';
import { scoreHand } from '../src/core/score';
import type { Round, Run } from '../src/core/types';

declare const process: { argv: string[] };
const N = Number(process.argv[2] ?? 200);
const STAKE = Number(process.argv[3] ?? 0);
const sampleRng: Rng = makeRng(99);

function total(run: Run, round: Round) {
  return scoreHand(run, round, sampleRng).total;
}

/** Expected best-of-now score if we reroll everything not in `mask`. */
function expected(run: Run, round: Round, mask: number, samples: number): number {
  const saved = round.rolled.map((r) => r.face);
  let sum = 0;
  for (let s = 0; s < samples; s++) {
    round.rolled.forEach((r, i) => {
      if (!(mask & (1 << i))) r.face = int(sampleRng, 0, 5);
    });
    sum += total(run, round);
  }
  round.rolled.forEach((r, i) => (r.face = saved[i]));
  return sum / samples;
}

function playHand(run: Run, round: Round) {
  for (let guard = 0; guard < 10; guard++) {
    // Free flips: take any that help.
    while (flipsAvailable(run, round) > 0) {
      const now = total(run, round);
      let best = -1;
      let bestV = now;
      for (let i = 0; i < round.rolled.length; i++) {
        round.rolled[i].face = 5 - round.rolled[i].face;
        const v = total(run, round);
        round.rolled[i].face = 5 - round.rolled[i].face;
        if (v > bestV) {
          bestV = v;
          best = i;
        }
      }
      if (best < 0) break;
      flip(run, round, best);
    }
    const now = total(run, round);
    const need = round.target - round.score;
    if (now >= need || round.rerolls <= 0) break;
    // Spend rerolls more freely when few hands are left.
    const budgetOk = round.rerolls >= Math.max(1, round.hands - 2) || round.hands <= 2;
    if (!budgetOk) break;
    const n = round.rolled.length;
    let bestMask = -1;
    let bestE = now;
    for (let mask = 0; mask < (1 << n) - 1; mask++) {
      const e = expected(run, round, mask, 20);
      if (e > bestE) {
        bestE = e;
        bestMask = mask;
      }
    }
    if (bestMask < 0 || bestE < now * 1.12) break;
    round.rolled.forEach((r, i) => {
      const want = !!(bestMask & (1 << i));
      if (r.held !== want) toggleHold(round, i);
    });
    reroll(run, round);
  }
  play(run, round);
}

function useAll(run: Run) {
  for (const c of [...run.consumables]) {
    const d = CONSUMABLES[c.id];
    if (d.target === 'none') {
      useConsumable(run, c.uid);
      continue;
    }
    // Target the highest face that is legal.
    let best: [number, number] | null = null;
    let bestV = -1;
    run.dice.forEach((die, di) =>
      die.faces.forEach((f, fi) => {
        const ok = !d.valid || d.valid(run, di, d.target === 'die' ? -1 : fi);
        if (ok && f.v > bestV) {
          bestV = f.v;
          best = [di, fi];
        }
      }),
    );
    if (best) useConsumable(run, c.uid, best[0], best[1]);
  }
}

function shop(run: Run) {
  for (let pass = 0; pass < 6; pass++) {
    const offers = run.shop!.offers;
    let bought = false;
    for (let i = 0; i < offers.length; i++) {
      const o = offers[i];
      if (o.sold || run.money < o.price) continue;
      if (o.kind === 'pack' && run.money - o.price < 4) continue;
      if (buy(run, i)) {
        bought = true;
        if (run.screen.t === 'pack') {
          const opts = run.screen.options;
          for (let k = 0; k < opts.length && run.screen.t === 'pack'; k++) {
            const op = opts[k];
            if (op.kind === 'consumable' && CONSUMABLES[op.id].target !== 'none') {
              let target: [number, number] = [0, 5];
              run.dice.forEach((die, di) => die.faces.forEach((f, fi) => f.v > run.dice[target[0]].faces[target[1]].v && (target = [di, fi])));
              pickFromPack(run, k, target[0], target[1]);
            } else pickFromPack(run, k);
          }
          if (run.screen.t === 'pack') run.screen = { t: 'shop' };
        }
        useAll(run);
      }
    }
    if (!bought) break;
  }
  leaveShop(run);
}

interface Result {
  won: boolean;
  act: number;
  best: number;
  diedTo: string | null;
  arts: string[];
  augs: string[];
  types: Record<string, number>;
}

function playRun(seed: number): Result {
  const run = newRun(seed, { stake: STAKE });
  for (let step = 0; step < 5000; step++) {
    const s = run.screen;
    if (s.t === 'over') break;
    if (s.t === 'augment') chooseAugment(run, 0);
    else if (s.t === 'select') playBlind(run);
    else if (s.t === 'round') {
      const round = run.round!;
      if (round.phase === 'rolling') playHand(run, round);
      else finishRound(run);
    } else if (s.t === 'cashout') collect(run);
    else if (s.t === 'shop') shop(run);
    else if (s.t === 'pack') {
      pickFromPack(run, 0, 0, 5);
      if (run.screen.t === 'pack') run.screen = run.shop ? { t: 'shop' } : { t: 'select' };
    }
  }
  const won = run.screen.t === 'over' && run.screen.won;
  const diedTo = !won && run.round ? (run.round.boss ?? `${run.round.kind}`) : null;
  for (const a of run.artifacts) seenArts.add(a.id);
  return { won, act: run.act + run.blind / 3, best: run.stats.best, diedTo, arts: run.artifacts.map((a) => a.id), augs: run.augments, types: run.stats.played as Record<string, number> };
}

const seenArts = new Set<string>();
const results: Result[] = [];
for (let i = 0; i < N; i++) results.push(playRun(5000 + i));
const wins = results.filter((r) => r.won).length;
console.log(`runs ${N}  win ${((wins / N) * 100).toFixed(1)}%  bases ${ACT_BASE.join('/')}`);
const hist: Record<string, number> = {};
for (const r of results) {
  const k = r.won ? 'WIN' : `act${Math.floor(r.act)}.${Math.round((r.act % 1) * 3)}`;
  hist[k] = (hist[k] ?? 0) + 1;
}
console.log('died at', JSON.stringify(Object.fromEntries(Object.entries(hist).sort())));
const bests = results.map((r) => r.best).sort((a, b) => a - b);
console.log('best hand p50', bests[Math.floor(N / 2)], 'p90', bests[Math.floor(N * 0.9)]);
// Who kills runs, and how often each boss is met.
const met: Record<string, number> = {};
const killed: Record<string, number> = {};
for (let i = 0; i < N; i++) {
  const r = newRun(5000 + i);
  r.bosses.forEach((b, k) => {
    if (results[i].act > k + 1 + 2 / 3 || results[i].won) met[b] = (met[b] ?? 0) + 1;
  });
}
for (const r of results) if (r.diedTo) killed[r.diedTo] = (killed[r.diedTo] ?? 0) + 1;
console.log('\nkiller        met  killed  kill%');
for (const [k, v] of Object.entries(killed).sort((a, b) => b[1] - a[1])) {
  const m = met[k] ?? v;
  console.log(`${k.padEnd(12)} ${String(m).padStart(4)}  ${String(v).padStart(6)}  ${((v / Math.max(1, m + v)) * 100).toFixed(0).padStart(4)}%`);
}
// Artifacts held at the end: win rate with vs overall.
const base = wins / N;
const rows = Object.keys(ARTIFACTS)
  .map((id) => {
    const withIt = results.filter((r) => r.arts.includes(id));
    return { id, n: withIt.length, wr: withIt.length ? withIt.filter((r) => r.won).length / withIt.length : 0 };
  })
  .filter((r) => r.n >= 8)
  .sort((a, b) => b.wr - a.wr);
console.log('\nartifact (held at end, n>=8)  win% vs base', (base * 100).toFixed(1));
console.log(rows.map((r) => `${ARTIFACTS[r.id].name}:${(r.wr * 100).toFixed(0)}%(${r.n})`).join('  '));
const typeTotals: Record<string, number> = {};
for (const r of results) for (const [k, v] of Object.entries(r.types)) typeTotals[k] = (typeTotals[k] ?? 0) + v;
console.log('\nhands played', JSON.stringify(typeTotals));
void HAND_ORDER;
