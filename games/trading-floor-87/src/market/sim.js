// The market simulation: order book + agents + director + cash index, stepped on a
// fixed pit-time clock. This is the only API the game layer talks to.
import { Rng, clamp } from '../util.js';
import { OrderBook, toTick, toPx } from './orderbook.js';
import { Director } from './director.js';
import { CashIndex } from './cash.js';
import { createAgents, stepAgent, intentOf, fillAgainst } from './agents.js';
import { SESSION_MIN, PREV_SETTLE, TARGET_PATH } from './calibration.js';

export const PLAYER = -1;
const STEP_MIN = 2 / 60; // 2 pit-seconds

export class Sim {
  constructor(seed = 1987) {
    this.seed = seed;
    this.rng = new Rng(seed);
    this.book = new OrderBook();
    this.director = new Director(this.rng);
    this.cashIdx = new CashIndex();
    this.agents = createAgents(this.rng);
    this.fairBasis = 0.5;        // cash − futures in normal conditions (points)
    this.t = 0;                  // pit minutes since 08:30
    this.acc = 0;
    this.done = false;
    this.listeners = [];

    const openRet = TARGET_PATH[0][1] + this.rng.float(-0.012, 0.008);
    this.last = toTick(PREV_SETTLE * (1 + openRet));
    this.open = this.last; this.high = this.last; this.low = this.last;
    this.volume = 0;
    this.ref = this.last;         // makers' reference price (smoothed prints), ticks
    this.volTicks = 2;           // EMA of |Δprice| per pit-minute, ticks
    this.flowImb = 0;            // EMA of signed aggressor qty per minute
    this.volRate = 0;            // EMA contracts per minute
    this.panic = 0.15;
    this.cash = this.cashIdx.value;
    this.bars = [];              // per pit-minute: {t, o, h, l, c, v, cash}
    this._bar = null;
    this._minuteCloses = [this.last];
    this._minuteFlow = 0; this._minuteVol = 0;
    this.pressure = this.director.update(0, this.lastPx, 0);
    for (let i = 0; i < 8; i++) for (const a of this.agents) if (a.type === 'mm') stepAgent(a, this, STEP_MIN);
  }

  get stepMin() { return STEP_MIN; }
  get lastPx() { return toPx(this.last); }
  get phase() { return this.director.phaseAt(this.t); }
  get basis() { return this.lastPx - this.cash; }
  onTrade(fn) { this.listeners.push(fn); }

  priceAgo(min) {
    const c = this._minuteCloses;
    return toPx(c[Math.max(0, c.length - 1 - Math.round(min))]);
  }

  // Order entry for agents (and the player's emergency flatten).
  submit(owner, side, tick, qty, ioc) {
    const res = this.book.submit(owner === PLAYER ? PLAYER : owner.id, side, tick, qty, ioc);
    for (const tr of res.trades) this._record(tr.tick, tr.qty, tr.buyer, tr.seller, side, tr.passiveId);
    return res;
  }

  _record(tick, qty, buyerId, sellerId, aggressor, passiveId = 0) {
    if (!Number.isFinite(tick) || !(qty > 0)) return;
    this.last = tick;
    this.ref += (tick - this.ref) * 0.25;
    if (tick > this.high) this.high = tick;
    if (tick < this.low) this.low = tick;
    this.volume += qty;
    this._minuteVol += qty;
    this._minuteFlow += aggressor === 'buy' ? qty : -qty;
    const px = toPx(tick);
    for (const [id, sgn] of [[buyerId, 1], [sellerId, -1]]) {
      if (id === PLAYER) continue;
      const a = this.agents[id];
      a.inv += sgn * qty; a.cashflow -= sgn * qty * px; a.volume += qty; a.lastTradeAt = this.t;
    }
    if (!this._bar) this._bar = { t: Math.floor(this.t), o: px, h: px, l: px, c: px, v: 0 };
    const b = this._bar; b.h = Math.max(b.h, px); b.l = Math.min(b.l, px); b.c = px; b.v += qty;
    const tr = { t: this.t, tick, px, qty, buyer: buyerId, seller: sellerId, aggressor, passiveId };
    for (const fn of this.listeners) fn(tr);
  }

  // Advance by pit-minutes using fixed steps. Returns number of steps run.
  advance(dtMin) {
    if (this.done) return 0;
    this.acc += dtMin;
    let n = 0;
    while (this.acc >= STEP_MIN && !this.done && n < 400) { this.acc -= STEP_MIN; this._step(); n++; }
    return n;
  }

  _step() {
    const prevMinute = Math.floor(this.t);
    this.t += STEP_MIN;
    this.pressure = this.director.update(this.t, this.lastPx, STEP_MIN);
    this.cash = this.cashIdx.update(this.lastPx, this.fairBasis, this.pressure.arbHealth, STEP_MIN, this.t);

    // Shuffle order each step so no agent always moves first.
    const order = this._order ||= this.agents.slice();
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(this.rng.next() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    for (const a of order) stepAgent(a, this, STEP_MIN);

    if (Math.floor(this.t) !== prevMinute) this._closeMinute();
    if (this.t >= SESSION_MIN) this.done = true;
  }

  _closeMinute() {
    const c = this._minuteCloses;
    const prev = c[c.length - 1];
    c.push(this.last);
    const move = Math.abs(this.last - prev);
    this.volTicks += (move - this.volTicks) * 0.15;
    this.flowImb += (this._minuteFlow - this.flowImb) * 0.35;
    this.volRate += (this._minuteVol - this.volRate) * 0.3;
    this._minuteFlow = 0; this._minuteVol = 0;
    const hi = toPx(this.high), px = this.lastPx;
    const ddHigh = (hi - px) / hi;
    const ddPrev = (PREV_SETTLE - px) / PREV_SETTLE;
    const volPct = (this.volTicks * 0.05) / px; // per-minute move as fraction
    this.panic = clamp(volPct / 0.006 * 0.45 + ddHigh / 0.12 * 0.35 + Math.max(0, ddPrev - 0.1) / 0.15 * 0.35, 0.05, 1);
    const b = this._bar || { t: prevMinuteOf(this.t), o: px, h: px, l: px, c: px, v: 0 };
    b.cash = this.cash;
    this.bars.push(b);
    this._bar = null;
  }

  // Crowd loudness 0..1.
  get noise() { return clamp(this.volRate / 260 * 0.6 + this.panic * 0.5, 0.05, 1); }

  intent(agentId) { return intentOf(this.agents[agentId], this); }

  // Bilateral pit trade between the player and an agent at the player's price.
  playerTrade(agentId, side, tick, qty, honor = false) {
    const a = this.agents[agentId];
    const q = fillAgainst(a, this, side, tick, qty, honor);
    if (q > 0) {
      if (side === 'buy') this._record(tick, q, PLAYER, a.id, 'buy');
      else this._record(tick, q, a.id, PLAYER, 'sell');
    }
    return q;
  }

  // Emergency: sweep the book (IOC, up to `maxTicks` through the touch).
  playerSweep(side, qty, maxTicks = 200) {
    const ref = side === 'buy' ? (this.book.bestAsk < Infinity ? this.book.bestAsk : this.last) : (this.book.bestBid > 0 ? this.book.bestBid : this.last);
    const lim = side === 'buy' ? ref + maxTicks : ref - maxTicks;
    return this.submit(PLAYER, side, lim, qty, true);
  }
}

function prevMinuteOf(t) { return Math.floor(t) - 1; }
