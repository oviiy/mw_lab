// Open Outcry: the whole game's rules, headless. Traders shout deals at you; you take
// the good ones, keep your book near flat, and survive the crash.
import { Rng, clamp } from './util.js';
import { Sim, PLAYER } from './market/sim.js';
import { toPx } from './market/orderbook.js';
import { intentOf } from './market/agents.js';
import { SESSION_MIN, PREV_SETTLE, MULTIPLIER } from './market/calibration.js';
import { AUGMENTS, baseMods, rollOffer, streakTier } from './augments.js';

export const DAY_SEC = 360;                       // one Black Monday in six minutes
export const PIT_MIN_PER_SEC = SESSION_MIN / DAY_SEC; // average; the clock actually runs unevenly:
// [pit-minute where a stretch ends, real seconds it takes]. The crash gets the most screen time.
export const PACING = [[120, 80], [180, 55], [270, 60], [405, 165]];
export function pitRate(tMin) {
  let from = 0;
  for (const [to, sec] of PACING) { if (tMin < to) return (to - from) / sec; from = to; }
  return 1;
}
export const DOW_PREV = 2246.74; // DJIA, Fri 16 Oct 1987
export const dowOf = (cash) => DOW_PREV * (1 + (cash / 282.70 - 1) * 0.85); // tuned so a typical day closes near the real −508
export const LOT = 5;                             // contracts per click
export const MAX_LOTS = 6;                        // tube capacity each way (±30 contracts)
export const SLOTS = 7;
export const START_EQUITY = 400000;
export const BUST_EQUITY = 100000;                // below this the clerk closes you out
export const FEE = 15;                            // $ per contract, exchange + clearing
export const HEAT_BASE = 0.012, HEAT_PER_LOT = 0.011, HEAT_COOL = 0.12; // per second

let nextId = 1;

export class Outcry {
  constructor(seed = (Math.random() * 1e9) | 0, opts = {}) {
    this.seed = seed;
    this.sim = new Sim(seed);
    this.rng = new Rng(seed ^ 0x0c7c);
    this.pos = 0; this.avg = 0; this.realized = 0;
    this.trades = 0; this.best = 0;
    this.deals = [];
    this.events = [];
    this.spawnT = 1.2;
    this.over = false; this.busted = false;
    this.curve = [{ t: 0, equity: START_EQUITY }];
    this.sampleAt = 2;
    this.peak = START_EQUITY; this.maxDD = 0;
    this.heat = 0;                     // 0..1: holding risk too long; at 1 the risk desk dumps you
    this.forced = 0;
    // Onboarding: 'buy' → only good buys; 'sell' → only good sells; null → the real market.
    this.guide = opts.guide ? 'buy' : null;
    // Rewards: streaks pay a desk bonus; augments are picked at each phase change.
    this.mods = baseMods();
    this.augments = [];
    this.offer = null; this.picks = 0;
    this.phaseId = this.sim.phase.id;
    this.augmentsOn = opts.augments !== false;
    this.streak = 0; this.bestStreak = 0; this.bonus = 0;
    this.milestone = 0;
    this.warned = new Set();
    this.sim.onTrade((t) => this.events.push({ type: 'print', t }));
  }

  get mark() { return this.sim.lastPx; }
  unrealized() { return this.pos * (this.mark - this.avg) * MULTIPLIER; }
  equity() { return START_EQUITY + this.realized + this.unrealized(); }
  get lot() { return this.mods.lot; }
  get cap() { return MAX_LOTS * this.mods.lot; }
  get lots() { return this.pos / this.mods.lot; }
  get tier() { return streakTier(this.streak, this.mods.streakStart); }

  update(dt) {
    if (this.over || this.offer) return; // the floor freezes while you pick an augment
    const slow = this.guide ? 0.08 : 1;
    this.sim.advance(dt * slow * pitRate(this.sim.t));

    // A shouted deal is firm at its price until its timer runs out; only the board moves.
    for (const d of this.deals) {
      d.left -= dt;
      if (d.left <= 0) this._drop(d, 'expired');
      else if (this.guide && d.forced) { d.tick = d.side === 'buy' ? this.sim.last - 4 : this.sim.last + 4; d.px = toPx(d.tick); d.edge = this._edge(d.side, d.px); }
      else { d.edge = this._edge(d.side, d.px); d.withTape = this._withTape(d.side); }
    }
    this.deals = this.deals.filter((d) => !d.dead);

    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this._spawn();
      const p = this.sim.panic;
      this.spawnT = this.guide ? 0.9 : (1.5 - p * 0.5) * this.mods.spawnMul * this.rng.float(0.7, 1.3);
    }

    // Heat: carrying contracts warms the tube (faster with more); being flat cools it.
    if (!this.guide) {
      const l = Math.abs(this.lots);
      const contracts = Math.abs(this.pos) / 5; // heat scales with contracts held, whatever the click size
      this.heat = clamp(this.heat + (contracts ? (HEAT_BASE + HEAT_PER_LOT * contracts) * this.mods.heatMul : -HEAT_COOL * this.mods.coolMul) * dt, 0, 1);
      if (this.heat >= 1) { this.forced++; const r = this.dump(); this._breakStreak(true); this.events.push({ type: 'riskdesk', realized: r }); this.heat = 0.55; }
    }

    const eq = this.equity();
    this.peak = Math.max(this.peak, eq);
    this.maxDD = Math.max(this.maxDD, this.peak - eq);
    if (this.sim.t >= this.sampleAt) { this.curve.push({ t: this.sim.t, equity: eq }); this.sampleAt = this.sim.t + 2; }
    // Milestones: celebrate every new $50k of profit.
    const pnl = eq - START_EQUITY;
    // The Dow, and every 100 points it loses.
    this.dow = dowOf(this.sim.cash);
    const drop = Math.floor((DOW_PREV - this.dow) / 100);
    if (drop > (this.dowDrop || 0)) { this.dowDrop = drop; if (drop >= 1) this.events.push({ type: 'dow', points: drop * 100, dow: this.dow }); }
    if (pnl >= (this.milestone + 1) * 50000) { this.milestone = Math.floor(pnl / 50000); this.events.push({ type: 'milestone', amount: this.milestone * 50000 }); }
    if (this.mods.whisper) {
      for (const q of this.sim.director.squeezes) {
        if (!this.warned.has(q) && this.sim.t >= q.at - 5 * pitRate(this.sim.t) && this.sim.t < q.at) { this.warned.add(q); this.events.push({ type: 'squeeze-warn' }); }
      }
    }
    if (eq <= this.mods.bust) { this._bust(); return; }
    if (this.sim.done) { this._end(false); return; }
    // A new phase: freeze the floor and offer three augments.
    const ph = this.sim.phase.id;
    if (ph !== this.phaseId) {
      this.phaseId = ph;
      this.mods.saver = this.augments.includes('saver') ? 1 : 0;
      // Two picks: at the morning chop and the false rally. The crash itself is never interrupted.
      if (this.augmentsOn && !this.guide && this.picks < 2 && (ph === 'chop' || ph === 'rally')) {
        this.offer = rollOffer(this.rng, this.picks, this.augments);
        this.events.push({ type: 'offer', offer: this.offer, phase: this.sim.phase });
      }
    }
  }

  // Pick augment `i` from the current offer.
  pick(i) {
    if (!this.offer) return null;
    const a = this.offer[clamp(i, 0, this.offer.length - 1)];
    a.apply(this.mods);
    this.augments.push(a.id);
    this.picks++;
    this.offer = null;
    if (a.id === 'saver') this.mods.saver = 1;
    this.events.push({ type: 'picked', augment: a });
    return a;
  }

  _withTape(side) {
    if (!this.mods.tape) return false;
    const move = this.mark - this.sim.priceAgo(12);
    return side === 'buy' ? move > 0.6 : move < -0.6;
  }

  _breakStreak(hard = false) {
    if (!this.streak) return;
    if (!hard && this.mods.saver > 0) { this.mods.saver--; this.events.push({ type: 'streak-saved', n: this.streak }); return; }
    this.events.push({ type: 'streak-break', n: this.streak });
    this.streak = 0;
  }

  // A closing trade's result feeds the streak; profitable streaks pay a desk bonus.
  _scoreClose(realized) {
    if (realized > 0) {
      this.streak++;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      const t = this.tier;
      const bonus = Math.round(realized * t.rate * this.mods.bonusMul);
      if (bonus > 0) { this.realized += bonus; this.bonus += bonus; }
      this.events.push({ type: 'streak', n: this.streak, tier: t, bonus });
      return bonus;
    }
    if (realized < 0) this._breakStreak();
    return 0;
  }

  // The price this agent will deal at, for the player's `side`. Takers deal at their real
  // (desperate) limit; market makers at their quote.
  _quote(agentId, side) {
    const it = intentOf(this.sim.agents[agentId], this.sim);
    const q = side === 'buy' ? it.ask : it.bid;
    if (!q || q.qty < 1) return null;
    let tick = q.tick;
    // A hurried trader concedes part of the way to their real limit, not all of it.
    if (it.kind === 'take') tick = Math.round(this.sim.last + (q.tick - this.sim.last) * 0.4);
    return { tick, kind: it.kind, urgency: it.urgency };
  }

  _edge(side, px) { return side === 'buy' ? this.mark - px : px - this.mark; }

  _spawn() {
    const max = this.guide ? 1 : (this.sim.panic > 0.6 ? 5 : 4) + this.mods.maxDealsAdd;
    if (this.deals.length >= max) return;
    const free = [];
    for (let s = 0; s < SLOTS; s++) if (!this.deals.some((d) => d.slot === s)) free.push(s);
    if (!free.length) return;
    const busy = new Set(this.deals.map((d) => d.agentId));
    const cands = [];
    for (const a of this.sim.agents) {
      if (busy.has(a.id)) continue;
      for (const side of ['buy', 'sell']) {
        if (this.guide && side !== this.guide) continue;
        const q = this._quote(a.id, side);
        if (!q) continue;
        const edge = this._edge(side, toPx(q.tick));
        if (this.guide && edge <= 0.05) continue;
        // Takers are the interesting deals; makers fill in with fair-but-slightly-bad prices.
        cands.push({ a, side, q, edge, w: q.kind === 'take' ? this.mods.takerW : 1 });
      }
    }
    if (!cands.length) {
      if (this.guide) this._guideDeal(free);
      return;
    }
    let r = this.rng.float(0, cands.reduce((s, c) => s + c.w, 0));
    let c = cands[0];
    for (const x of cands) { r -= x.w; if (r <= 0) { c = x; break; } }
    const ttl = this.guide ? 999 : clamp(3.0 - this.sim.panic * 1.0, 2.0, 3.0) + this.mods.ttlAdd;
    const d = {
      id: nextId++, slot: this.rng.pick(free), agentId: c.a.id, side: c.side, tick: c.q.tick, px: toPx(c.q.tick),
      edge: c.edge, kind: c.q.kind, urgency: c.q.urgency, ttl, left: ttl, qty: this.mods.lot, withTape: this._withTape(c.side),
      forced: !!this.guide, // onboarding deals always fill in full
    };
    this.deals.push(d);
    this.events.push({ type: 'deal', deal: d });
  }

  // Onboarding fallback: a maker's quote shaded into a good deal so the first trade is a win.
  _guideDeal(free) {
    const a = this.sim.agents.find((x) => x.type === 'mm' && this._quote(x.id, this.guide));
    if (!a) return;
    const tick = this.guide === 'buy' ? this.sim.last - 4 : this.sim.last + 4;
    const d = { id: nextId++, slot: free[0], agentId: a.id, side: this.guide, tick, px: toPx(tick), edge: 0.2, kind: 'take', urgency: 0.8, ttl: 999, left: 999, qty: LOT, forced: true };
    this.deals.push(d);
    this.events.push({ type: 'deal', deal: d });
  }

  _drop(d, why) { d.dead = true; this.events.push({ type: 'drop', deal: d, why }); }

  // Click a deal. Returns { ok, reason?, realized? }.
  take(dealId) {
    const d = this.deals.find((x) => x.id === dealId);
    if (!d || this.over) return { ok: false, reason: 'GONE' };
    const s = d.side === 'buy' ? 1 : -1;
    if (Math.abs(this.pos + s * d.qty) > this.cap) return this._miss(d, 'TUBE FULL');
    const good = d.edge > 0.02;
    // Pit honour: the trader stands by what they shouted, even if their book moved since.
    let q = d.forced ? 0 : this.sim.playerTrade(d.agentId, d.side, d.tick, d.qty, true);
    if (q < d.qty) this.sim._record(d.tick, d.qty - q, s > 0 ? PLAYER : d.agentId, s > 0 ? d.agentId : PLAYER, d.side);
    q = d.qty;
    const closing = this.pos !== 0 && Math.sign(this.pos) !== s;
    let realized = this._fill(d.side, d.px, q);
    let bonus = 0, tip = 0;
    if (good && this.mods.tip) { tip = this.mods.tip; this.realized += tip; this.bonus += tip; realized += tip; }
    if (closing && !this.guide) bonus = this._scoreClose(realized);
    d.dead = true;
    this.deals = this.deals.filter((x) => !x.dead);
    this.events.push({ type: 'fill', deal: d, qty: q, realized, bonus, tip, good });
    if (this.guide === 'buy' && d.side === 'buy') this.guide = 'sell';
    else if (this.guide === 'sell' && d.side === 'sell') { this.guide = null; this.events.push({ type: 'guide-done' }); }
    return { ok: true, realized, bonus, tip, good };
  }

  _miss(d, reason) { this.events.push({ type: 'miss', deal: d, reason }); return { ok: false, reason }; }

  _fill(side, px, qty) {
    const s = side === 'buy' ? 1 : -1;
    const fee = FEE * this.mods.feeMul * qty;
    let realized = -fee;
    this.realized -= fee;
    this.trades++;
    if (this.pos === 0 || Math.sign(this.pos) === s) {
      this.avg = (this.avg * Math.abs(this.pos) + px * qty) / (Math.abs(this.pos) + qty);
      this.pos += s * qty;
    } else {
      const closing = Math.min(qty, Math.abs(this.pos));
      const gain = closing * (px - this.avg) * Math.sign(this.pos) * MULTIPLIER;
      realized += gain;
      this.realized += gain;
      this.pos += s * closing;
      if (this.pos === 0) this.avg = 0;
      const opening = qty - closing;
      if (opening > 0) { this.pos = s * opening; this.avg = px; }
      this.best = Math.max(this.best, realized);
    }
    return realized;
  }

  // Hold Space: hit the book for everything. Guaranteed out, ugly price.
  dump() {
    if (!this.pos || this.over) return 0;
    const side = this.pos > 0 ? 'sell' : 'buy';
    const r = this.sim.playerSweep(side, Math.abs(this.pos), 300);
    let realized = 0;
    for (const t of r.trades) realized += this._fill(side, toPx(t.tick), t.qty);
    if (this.pos) realized += this._fill(side, this.mark, Math.abs(this.pos));
    this.events.push({ type: 'dump', realized });
    return realized;
  }

  skipGuide() { if (this.guide) { this.guide = null; for (const d of this.deals) d.dead = true; this.deals = []; this.events.push({ type: 'guide-done' }); } }

  _bust() {
    this.dump();
    if (this.mods.parachute > 0) {
      // Golden Parachute: the firm bails you out once.
      this.mods.parachute--;
      this.realized += 200000 - this.equity();
      this.heat = 0; this._breakStreak(true);
      this.events.push({ type: 'parachute' });
      return;
    }
    this.busted = true;
    this._end(true);
  }

  _end(busted) {
    if (this.over) return;
    this.over = true;
    this.deals = [];
    if (this.pos && !busted) this.dump(); // the bell flattens you at the close
    this.curve.push({ t: this.sim.t, equity: this.equity() });
    const pnl = this.equity() - START_EQUITY;
    this.card = {
      seed: this.seed, pnl, busted, trades: this.trades, best: this.best, maxDD: this.maxDD,
      settle: this.mark, dayRet: this.mark / PREV_SETTLE - 1, closedAt: this.sim.t,
      dow: dowOf(this.sim.cash), dowChg: dowOf(this.sim.cash) - DOW_PREV,
      grade: grade(pnl, busted), curve: this.curve, bars: this.sim.bars, forced: this.forced,
      bestStreak: this.bestStreak, bonus: this.bonus, augments: this.augments.map((id) => AUGMENTS.find((a) => a.id === id)),
    };
    this.events.push({ type: 'end', card: this.card });
  }

  drainEvents() { const e = this.events; this.events = []; return e; }
}

export function grade(pnl, busted) {
  if (busted) return 'F';
  return pnl >= 500000 ? 'S' : pnl >= 250000 ? 'A' : pnl >= 100000 ? 'B' : pnl >= 0 ? 'C' : 'D';
}

export const GRADE_RULE = 'S ≥ $500k · A ≥ $250k · B ≥ $100k · C ≥ $0 · D = loss · F = closed out';
