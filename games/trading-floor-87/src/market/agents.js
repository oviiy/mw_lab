// Pit agents. Makers quote two-sided in the book; everyone else carries a target
// position and works "desires" — visible intents that cross the book after a few
// seconds, or get filled first by the player if they're quick.
import { clamp } from '../util.js';
import { PREV_SETTLE } from './calibration.js';

export const FIRMS = [
  { name: 'HARLAN BROS', color: 0x1f4fa8 },
  { name: 'RIDGEWAY',    color: 0xb22222 },
  { name: 'KESTREL',     color: 0x2e7d32 },
  { name: 'MONROE & CO', color: 0xd4a017 },
  { name: 'CALDER',      color: 0x6a1b9a },
  { name: 'OAKMONT',     color: 0xe0e0e0 },
  { name: 'FAIRWEATHER', color: 0xef6c00 },
  { name: 'LASALLE CAP', color: 0x00838f },
];

// Taker behaviour by type. Rates are per pit-minute; slack in ticks.
const TAKER = {
  pi:    { chunk: [25, 60], create: 3.0, cross: 3.5, slack: 2, grow: 6, life: 6 },
  value: { chunk: [10, 30], create: 1.6, cross: 1.0, slack: 0, grow: 1.2, life: 8 },
  inst:  { chunk: [10, 40], create: 2.0, cross: 1.2, slack: 0, grow: 1.0, life: 8 },
  mom:   { chunk: [5, 20],  create: 2.2, cross: 3.0, slack: 1, grow: 3, life: 4 },
  arb:   { chunk: [10, 30], create: 3.0, cross: 5.0, slack: 1, grow: 2, life: 3 },
  noise: { chunk: [1, 8],   create: 1.2, cross: 1.8, slack: 1, grow: 2, life: 5 },
  puke:  { chunk: [10, 40], create: 99,  cross: 6.0, slack: 3, grow: 8, life: 3 },
};

const MIX = [['mm', 8], ['mom', 6], ['value', 5], ['inst', 5], ['arb', 4], ['pi', 4], ['noise', 8]];
const LETTERS = 'ABCDEFGHJKLMNPRSTWZ';

export function createAgents(rng) {
  const agents = [];
  const badges = new Set();
  for (const [type, n] of MIX) {
    for (let k = 0; k < n; k++) {
      let badge;
      do { badge = rng.pick(LETTERS) + rng.pick(LETTERS) + rng.pick(LETTERS); } while (badges.has(badge));
      badges.add(badge);
      const a = {
        id: agents.length, type, badge,
        firm: rng.int(0, FIRMS.length - 1),
        inv: 0, cashflow: 0, volume: 0,
        desire: null, bidId: 0, askId: 0, layers: [],
        target: 0, lastTradeAt: -99,
        p: {},
      };
      if (type === 'mm') { a.p.skew = rng.float(0.015, 0.035); a.p.limit = rng.int(160, 300); a.p.size = rng.float(8, 20); }
      if (type === 'value') {
        a.belief = PREV_SETTLE * (1 - rng.float(0.0, 0.06));
        a.p.tau = rng.float(40, 120);
        a.p.pain = rng.float(0.16, 0.26);
        a.p.cap = rng.float(40, 100);
        a.capitulated = false;
      }
      if (type === 'inst') { a.p.edge = rng.float(-0.015, 0.01); a.p.cap = rng.float(150, 300); }
      if (type === 'mom') { a.p.size = rng.float(15, 40); a.p.thr = rng.float(0.01, 0.02); }
      if (type === 'arb') { a.p.cap = rng.float(40, 70); }
      if (type === 'pi') { a.p.weight = rng.float(0.8, 1.2); a.programme = 0; }
      if (type === 'noise') { a.p.nextTurn = 0; }
      agents.push(a);
    }
  }
  return agents;
}

// Desired position for takers.
function targetFor(a, sim, P) {
  const pr = sim.pressure;
  const dd = Math.max(0, (PREV_SETTLE - P) / PREV_SETTLE);
  switch (a.type) {
    case 'pi': {
      // Dynamic hedging sells more as the market falls; it never buys back today.
      const hedge = 0.6 + clamp(dd * 4, 0, 1.4);
      a.programme -= pr.piRate * a.p.weight * hedge * sim.stepMin;
      return Math.round(a.programme);
    }
    case 'value': {
      // Adaptive fair-value belief: slowly marks down toward where the market trades.
      a.belief += (P - a.belief) * (1 - Math.exp(-sim.stepMin / a.p.tau));
      if (!a.capitulated && dd > a.p.pain) a.capitulated = true;
      if (a.capitulated) return Math.min(0, Math.round(a.inv * 0.5)) + 0;
      const cheap = clamp((a.belief - P) / (0.025 * P), -0.3, 1);
      return Math.round(a.p.cap * pr.valueCapital * cheap);
    }
    case 'inst': {
      // Pension / buyback money: fair value follows the macro story of the day, never capitulates.
      // A squeeze is shorts and bargain hunters stampeding the offer together.
      const fair = sim.director.targetPrice(sim.t) * (1 + a.p.edge + 0.045 * pr.squeeze);
      return Math.round(a.p.cap * pr.instBoost * clamp((fair - P) / (0.015 * P), -0.5, 6));
    }
    case 'mom': {
      const ret = (P - sim.priceAgo(10)) / P;
      return Math.round(clamp(ret / a.p.thr + pr.squeeze * 1.5, -1, 1) * a.p.size);
    }
    case 'arb': {
      const gap = sim.cash - sim.fairBasis - P; // >0 ⇒ futures cheap vs cash
      return Math.round(clamp(gap / 8, -1, 1) * a.p.cap * pr.arbHealth);
    }
    case 'noise': {
      if (sim.t >= a.p.nextTurn) {
        a.p.nextTurn = sim.t + sim.rng.float(2, 8);
        a.target = sim.rng.int(-15, 15);
      }
      return a.target;
    }
  }
  return 0;
}

function desireLimit(a, sim) {
  const d = a.desire, cfg = TAKER[d.kind];
  const age = sim.t - d.born;
  const slack = Math.round(Math.min(cfg.slack + cfg.grow * age * (0.3 + sim.panic) + Math.min(sim.volTicks, 40) * 0.15, 8 + sim.panic * 14));
  const ref = d.side === 'sell' ? (sim.book.bestBid > 0 ? sim.book.bestBid : sim.last) : (sim.book.bestAsk < Infinity ? sim.book.bestAsk : sim.last);
  return d.side === 'sell' ? ref - slack : ref + slack;
}

export function stepAgent(a, sim, dtMin) {
  const rng = sim.rng;
  if (a.type === 'mm') { stepMaker(a, sim, dtMin); return; }
  if (a.type === 'off') return;

  const P = sim.lastPx;
  a.target = targetFor(a, sim, P);
  const diff = a.target - a.inv;
  const cfg = TAKER[a.type];
  if (!a.desire && Math.abs(diff) >= 1 && rng.chance(cfg.create * dtMin * (a.type === 'noise' ? sim.pressure.noise : 1))) {
    const qty = Math.min(Math.abs(diff), rng.int(cfg.chunk[0], cfg.chunk[1]));
    a.desire = { kind: a.type, side: diff > 0 ? 'buy' : 'sell', qty, born: sim.t, limit: sim.last };
  }
  workDesire(a, sim, dtMin);
}

function workDesire(a, sim, dtMin) {
  const d = a.desire;
  if (!d) return;
  const cfg = TAKER[d.kind];
  d.limit = desireLimit(a, sim);
  if (sim.t - d.born > cfg.life * 2.5) { a.desire = null; return; }
  if (sim.rng.chance(cfg.cross * dtMin * (1 + sim.panic))) {
    const res = sim.submit(a, d.side, d.limit, d.qty, true);
    d.qty -= res.filled;
    if (d.qty <= 0) a.desire = null;
  }
}

function stepMaker(a, sim, dtMin) {
  const rng = sim.rng;
  const app = sim.pressure.makerAppetite;
  const limit = a.p.limit * (0.4 + 0.6 * app);
  // Over the risk limit: puke the inventory.
  if (!a.desire && Math.abs(a.inv) > limit) {
    a.desire = { kind: 'puke', side: a.inv > 0 ? 'sell' : 'buy', qty: Math.round(Math.abs(a.inv) * 0.3), born: sim.t, limit: sim.last };
    cancelQuotes(a, sim);
  }
  if (a.desire) { workDesire(a, sim, dtMin); return; }

  const stale = !sim.book.get(a.bidId) || !sim.book.get(a.askId);
  if (!stale && !rng.chance((1.5 + sim.volTicks * 0.2) * dtMin * 6)) return;
  cancelQuotes(a, sim);
  // Panic: makers step away entirely some of the time.
  if (rng.chance(sim.panic * 0.2 * (1.2 - app))) return;

  const vt = Math.min(sim.volTicks, 40);
  const hs = Math.max(1, Math.min(14, Math.round((1 + vt * 0.12 + sim.panic * 3) / Math.max(0.4, app) * rng.float(0.7, 1.3))));
  const lean = clamp(sim.flowImb / 120, -1, 1) * Math.min(hs, 3);
  const ref = sim.ref - a.inv * a.p.skew + lean;
  const size = Math.max(1, Math.round(a.p.size * app * rng.float(0.6, 1.4)));
  const bid = Math.round(ref - hs), ask = Math.max(bid + 1, Math.round(ref + hs));
  // In a panicked selloff makers shrink their bids before their offers.
  const down = clamp(-sim.flowImb / 120, 0, 1) * sim.panic;
  const bidSize = Math.max(1, Math.round(size * (1 - 0.6 * down)));
  a.bidId = sim.submit(a, 'buy', bid, bidSize, false).id;
  a.askId = sim.submit(a, 'sell', ask, size, false).id;
  // Deeper layers give the book some depth beneath the touch.
  const gap = hs + 2 + Math.round(sim.panic * 6);
  a.layers.push(sim.submit(a, 'buy', bid - gap, size * 2, false).id, sim.submit(a, 'sell', ask + gap, size * 2, false).id);
  a.layers.push(sim.submit(a, 'buy', bid - gap * 2 - 3, size * 3, false).id, sim.submit(a, 'sell', ask + gap * 2 + 3, size * 3, false).id);
}

export function cancelQuotes(a, sim) {
  if (a.bidId) { sim.book.cancel(a.bidId); a.bidId = 0; }
  if (a.askId) { sim.book.cancel(a.askId); a.askId = 0; }
  for (const id of a.layers) sim.book.cancel(id);
  a.layers.length = 0;
}

// What the agent is showing the pit right now. bid/ask: {tick, qty} or null.
export function intentOf(a, sim) {
  if (a.desire) {
    const d = a.desire;
    const q = { tick: d.limit, qty: d.qty };
    const age = sim.t - d.born;
    return { kind: 'take', bid: d.side === 'buy' ? q : null, ask: d.side === 'sell' ? q : null, urgency: clamp(0.4 + age * 0.4 + sim.panic * 0.4, 0, 1) };
  }
  if (a.type === 'mm') {
    const b = sim.book.get(a.bidId), s = sim.book.get(a.askId);
    if (!b && !s) return { kind: 'idle', bid: null, ask: null, urgency: 0 };
    return { kind: 'quote', bid: b ? { tick: b.tick, qty: b.qty } : null, ask: s ? { tick: s.tick, qty: s.qty } : null, urgency: 0.25 + sim.panic * 0.3 };
  }
  return { kind: 'idle', bid: null, ask: null, urgency: 0 };
}

// The player trades bilaterally with agent `a` at `tick`. Returns filled qty.
// `honor`: the deal was agreed at signal time, so price moves since then don't void it.
export function fillAgainst(a, sim, side, tick, qty, honor = false) {
  const it = intentOf(a, sim);
  if (side === 'buy') {
    if (!it.ask || (!honor && tick < it.ask.tick)) return 0;
    const q = Math.min(qty, it.ask.qty);
    if (it.kind === 'quote') sim.book.reduce(a.askId, q);
    else { a.desire.qty -= q; if (a.desire.qty <= 0) a.desire = null; }
    return q;
  } else {
    if (!it.bid || (!honor && tick > it.bid.tick)) return 0;
    const q = Math.min(qty, it.bid.qty);
    if (it.kind === 'quote') sim.book.reduce(a.bidId, q);
    else { a.desire.qty -= q; if (a.desire.qty <= 0) a.desire = null; }
    return q;
  }
}
