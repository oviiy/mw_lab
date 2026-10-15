// Price-time priority limit order book on integer ticks (1 tick = 0.05 index points).

export const TICK = 0.05;
export const toTick = (px) => Math.round(px / TICK);
export const toPx = (tick) => Math.round(tick * 5) / 100;

const MIN_TICK = 1000; // 50.00
const MAX_TICK = 8000; // 400.00

export class OrderBook {
  constructor() {
    this.n = MAX_TICK - MIN_TICK + 1;
    this.bidLv = new Array(this.n).fill(null);
    this.askLv = new Array(this.n).fill(null);
    this.bidQty = new Float64Array(this.n);
    this.askQty = new Float64Array(this.n);
    this.bestBid = -1;           // tick, -1 = empty
    this.bestAsk = Infinity;     // tick, Infinity = empty
    this.orders = new Map();     // id -> order
    this.nextId = 1;
    this.restingBids = 0;
    this.restingAsks = 0;
  }

  _idx(t) { return t - MIN_TICK; }
  static clampTick(t) { return Math.max(MIN_TICK, Math.min(MAX_TICK, Math.round(t))); }

  // Submit a limit order. Marketable quantity matches immediately; the rest rests unless ioc.
  // Returns { id, filled, rest, trades: [{tick, qty, buyer, seller, aggressor}] }.
  submit(owner, side, tick, qty, ioc = false) {
    tick = OrderBook.clampTick(tick);
    const trades = [];
    let remaining = qty;
    if (!(qty > 0)) return { id: 0, filled: 0, rest: 0, trades };
    if (side === 'buy') {
      while (remaining > 0 && this.bestAsk <= tick) remaining = this._take('ask', this.bestAsk, remaining, owner, 'buy', trades);
    } else {
      while (remaining > 0 && this.bestBid >= tick) remaining = this._take('bid', this.bestBid, remaining, owner, 'sell', trades);
    }
    let id = 0;
    if (remaining > 0 && !ioc) id = this._rest(owner, side, tick, remaining);
    return { id, filled: qty - remaining, rest: ioc ? 0 : remaining, trades };
  }

  _take(bookSide, tick, qty, owner, aggressor, trades) {
    const i = this._idx(tick);
    const lv = bookSide === 'ask' ? this.askLv[i] : this.bidLv[i];
    while (qty > 0 && lv && lv.length) {
      const o = lv[0];
      if (o.qty <= 0) { lv.shift(); continue; }
      const q = Math.min(qty, o.qty);
      o.qty -= q; qty -= q;
      if (bookSide === 'ask') this.askQty[i] -= q; else this.bidQty[i] -= q;
      trades.push({
        tick, qty: q, aggressor,
        buyer: aggressor === 'buy' ? owner : o.owner,
        seller: aggressor === 'sell' ? owner : o.owner,
        passiveId: o.id,
      });
      if (o.qty <= 0) { lv.shift(); this._dead(o); }
    }
    if (!lv || lv.length === 0) this._refreshBest(bookSide);
    return qty;
  }

  _rest(owner, side, tick, qty) {
    const id = this.nextId++;
    const o = { id, owner, side, tick, qty };
    const i = this._idx(tick);
    if (side === 'buy') {
      (this.bidLv[i] ||= []).push(o); this.bidQty[i] += qty; this.restingBids++;
      if (tick > this.bestBid) this.bestBid = tick;
    } else {
      (this.askLv[i] ||= []).push(o); this.askQty[i] += qty; this.restingAsks++;
      if (tick < this.bestAsk) this.bestAsk = tick;
    }
    this.orders.set(id, o);
    return id;
  }

  _dead(o) {
    this.orders.delete(o.id);
    if (o.side === 'buy') this.restingBids--; else this.restingAsks--;
  }

  cancel(id) {
    const o = this.orders.get(id);
    if (!o) return false;
    const i = this._idx(o.tick);
    const lv = o.side === 'buy' ? this.bidLv[i] : this.askLv[i];
    const k = lv.indexOf(o);
    if (k >= 0) lv.splice(k, 1);
    if (o.side === 'buy') this.bidQty[i] -= o.qty; else this.askQty[i] -= o.qty;
    o.qty = 0;
    this._dead(o);
    if (lv.length === 0) this._refreshBest(o.side === 'buy' ? 'bid' : 'ask');
    return true;
  }

  // Reduce a resting order outside of matching (a bilateral pit trade with the player).
  reduce(id, qty) {
    const o = this.orders.get(id);
    if (!o) return 0;
    const q = Math.min(qty, o.qty);
    const i = this._idx(o.tick);
    if (o.side === 'buy') this.bidQty[i] -= q; else this.askQty[i] -= q;
    o.qty -= q;
    if (o.qty <= 0) this.cancel(id);
    return q;
  }

  get(id) { return this.orders.get(id) || null; }

  _refreshBest(bookSide) {
    if (bookSide === 'bid') {
      if (this.restingBids <= 0) { this.bestBid = -1; return; }
      let t = this.bestBid;
      while (t >= MIN_TICK && !(this.bidQty[this._idx(t)] > 1e-9)) t--;
      this.bestBid = t >= MIN_TICK ? t : -1;
    } else {
      if (this.restingAsks <= 0) { this.bestAsk = Infinity; return; }
      let t = this.bestAsk;
      while (t <= MAX_TICK && !(this.askQty[this._idx(t)] > 1e-9)) t++;
      this.bestAsk = t <= MAX_TICK ? t : Infinity;
    }
  }

  // Aggregated depth: [[tick, qty], ...] best first.
  depth(side, levels = 5) {
    const out = [];
    if (side === 'bid') {
      for (let t = this.bestBid; t >= MIN_TICK && out.length < levels && t >= 0; t--) {
        const q = this.bidQty[this._idx(t)];
        if (q > 1e-9) out.push([t, q]);
        if (this.bestBid - t > 400) break;
      }
    } else {
      for (let t = this.bestAsk; t <= MAX_TICK && out.length < levels && t !== Infinity; t++) {
        const q = this.askQty[this._idx(t)];
        if (q > 1e-9) out.push([t, q]);
        if (t - this.bestAsk > 400) break;
      }
    }
    return out;
  }
}
