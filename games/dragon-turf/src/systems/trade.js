import { GOODS } from '../data/goods.js';
import { Ped } from '../entities/ped.js';
import { civilianLook } from '../entities/pedLooks.js';
import { dist, clamp, fmtMoney } from '../core/math.js';
import { rand } from '../core/rng.js';

// Contraband market: prices drift per district, news events spike or crash a good,
// and shady dealers appear in Dragon Gate alleys after dark.
export class TradeSystem {
  constructor(game) {
    this.game = game; this.cargo = {}; this.baseCapacity = 12; this.prices = []; this.events = []; this.lastHour = -1; this.dealers = []; this.news = []; this.profit = 0; this.seed = rand.range(0, 1000);
    for (const g of GOODS) this.cargo[g.id] = 0; this.recompute(); game.interact.register('dealer', () => {});
  }
  get capacity() { return this.baseCapacity + this.game.turf.owned().length * 3; }
  get carried() { let n = 0; for (const k in this.cargo) n += this.cargo[k]; return n; }

  price(did, gid) { return this.prices[did] ? this.prices[did][gid] : 0; }
  recompute() {
    const hour = this.game.clock.hour + (this.game.clock.day - 1) * 24, prices = [];
    for (let d = 0; d < 6; d++) {
      const row = {};
      for (const g of GOODS) {
        let mul = 1 + g.mods[d] + Math.sin(hour * 0.35 + this.seed + d * 1.7 + g.base * 0.01) * g.vol * 0.55 + Math.sin(hour * 0.9 + g.base) * g.vol * 0.2;
        for (const e of this.events) if (e.good === g.id && (e.district === d || e.district === -1)) mul *= e.mult;
        row[g.id] = Math.max(5, Math.round(g.base * mul));
      }
      prices.push(row);
    }
    this.prices = prices;
  }
  update(dt) {
    const g = this.game, h = Math.floor(g.clock.hour + (g.clock.day - 1) * 24);
    if (h !== this.lastHour) {
      this.lastHour = h; for (const e of this.events) e.left--; this.events = this.events.filter((e) => e.left > 0);
      if (rand.chance(0.22)) this.newEvent(); this.recompute();
    }
    this.manageDealers(dt);
  }
  newEvent() {
    const gd = rand.pick(GOODS), d = rand.int(0, 5), spike = rand.chance(0.55), mult = spike ? rand.range(1.55, 2.1) : rand.range(0.45, 0.65);
    const e = { good: gd.id, district: d, mult, left: rand.int(4, 8), spike };
    this.events.push(e); const DN = ['Dragon Gate', 'Harbor Row', 'Old Quarter', 'Neon Heights', 'Smokestack Yards', 'Jade Hill'];
    const msg = spike ? `${gd.name} are scarce in ${DN[d]} — prices are surging` : `A glut of ${gd.name} floods ${DN[d]} — sell elsewhere`;
    this.news.unshift({ msg, at: this.game.clock.label(), spike }); this.news.length = Math.min(this.news.length, 8);
  }

  buy(gid, n) {
    const g = this.game, did = g.world.districtAtPx(g.player.x, g.player.y), price = this.price(did, gid), room = this.capacity - this.carried; n = Math.min(n, room);
    if (n <= 0) { g.hud.toast(`Cargo full (${this.carried}/${this.capacity} crates). Own more turf to carry more.`, 2400, 'bad'); return false; }
    const afford = Math.floor(g.economy.cash / price); n = Math.min(n, afford); if (n <= 0) { g.hud.toast('Not enough cash', 1800, 'bad'); return false; }
    g.economy.spend(price * n); this.cargo[gid] += n; (this.cost = this.cost || {})[gid] = ((this.cost[gid] || 0) * (this.cargo[gid] - n) + price * n) / this.cargo[gid]; g.audio.pickup('cash'); return true;
  }
  sell(gid, n) {
    const g = this.game, did = g.world.districtAtPx(g.player.x, g.player.y), price = this.price(did, gid); n = Math.min(n, this.cargo[gid]); if (n <= 0) return false;
    if (g.wantedLevel > 0) { g.hud.toast('Not while the cops are watching', 2200, 'bad'); return false; }
    this.cargo[gid] -= n; const gain = price * n; g.economy.addCash(gain, true); this.profit += gain - (this.cost && this.cost[gid] ? this.cost[gid] * n : 0); g.audio.pickup('cash');
    if (rand.chance(0.045 * Math.min(3, n / 6 + 0.6))) { // undercover sting
      const seized = Object.values(this.cargo).reduce((a, b) => a + b, 0); for (const k in this.cargo) this.cargo[k] = 0; g.wanted.addHeat(2.5, 'sting'); g.hud.banner('UNDERCOVER STING', `Cargo seized (${seized} crates)`, '#4a7cff', 3600);
    }
    return true;
  }

  /* ---------- dealers ---------- */
  manageDealers(dt) {
    const g = this.game, p = g.player; if (!p) return; this.t = (this.t || 0) - dt; if (this.t > 0) return; this.t = 1.2;
    const night = true /* dealers now work around the clock */, spots = g.world.dealerSpots || [];
    this.dealers = this.dealers.filter((d) => !d.removed && !d.dead);
    for (const s of spots) {
      const has = this.dealers.some((d) => d.data.spot === s), d = dist(p.x, p.y, s.x, s.y);
      if (!has && night && d < 700) {
        const ped = new Ped({ x: s.x, y: s.y, role: 'dealer', look: civilianLook('walker'), hp: 50, walk: 40, brain: null }); ped.look = { ...ped.look, id: ped.look.id + 'd', hat: 'beanie', hatColor: '#222', top: '#3a2a4a', shades: true };
        ped.persistent = true; ped.data.spot = s; ped.interact = 'Deal with the dealer'; ped.onInteract = (game) => game.screens.open('trade', { dealer: ped }); ped.angle = rand.range(0, 6.28); ped.state = 'idle'; ped.noDrop = true;
        g.entities.add(ped); this.dealers.push(ped);
      } else if (has && (!night || d > 1200)) { for (const q of this.dealers) if (q.data.spot === s) q.removed = true; }
    }
  }
  serialize() { return { cargo: this.cargo, cost: this.cost || {}, profit: this.profit, seed: this.seed }; }
  restore(d) { if (!d) return; this.cargo = { ...this.cargo, ...d.cargo }; this.cost = d.cost || {}; this.profit = d.profit || 0; this.seed = d.seed ?? this.seed; this.recompute(); }
}
void clamp; void fmtMoney;
