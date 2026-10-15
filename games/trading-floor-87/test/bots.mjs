// Balance harness: scripted players over seeded days. node test/bots.mjs [seeds]
import { Outcry, LOT, MAX_LOTS } from '../src/outcry.js';
const STRATS = {
  // Takes only good deals and keeps the book small.
  skilled: (g, d) => {
    const after = Math.abs(g.pos + (d.side === 'buy' ? g.lot : -g.lot));
    if (g.heat > 0.6 && after < Math.abs(g.pos)) return true; // cool off before the risk desk does it
    return d.edge > 0.04 && after <= 2 * g.lot;
  },
  // Reads the board: trades with the recent move, flattens when hot or when the move turns.
  trend: (g, d) => {
    const move = g.mark - g.sim.priceAgo(12);
    const dir = move > 0.6 ? 'buy' : move < -0.6 ? 'sell' : null;
    const reduces = Math.abs(g.pos + (d.side === 'buy' ? g.lot : -g.lot)) < Math.abs(g.pos);
    if (reduces && (g.heat > 0.5 || (dir && dir !== d.side && false) || (g.pos > 0 && dir === 'sell') || (g.pos < 0 && dir === 'buy'))) return true;
    if (reduces && d.edge > 0.04) return true;
    return dir === d.side && d.edge > -0.05 && Math.abs(g.pos) < 3 * g.lot;
  },
  // Clicks everything.
  naive: () => true,
  // Buys every bargain, never sells.
  dipbuyer: (g, d) => d.side === 'buy',
  // Knows history: sells everything it can.
  shorter: (g, d) => d.side === 'sell',
};
const n = +(process.argv[2] || 8);
for (const [name, want] of Object.entries(STRATS)) {
  const res = [];
  for (let s = 1; s <= n; s++) {
    const g = new Outcry(s);
    const seen = new Map();
    let t = 0;
    while (!g.over) {
      g.update(1 / 30); t += 1 / 30;
      if (g.offer) g.pick(0);
      for (const d of g.deals) {
        if (!seen.has(d.id)) seen.set(d.id, t + 0.7); // human reaction time
        if (t >= seen.get(d.id) && want(g, d)) { g.take(d.id); break; }
      }
      g.drainEvents();
    }
    res.push(`${Math.round(g.card.pnl / 1000)}k${g.card.grade}${g.card.busted ? '!' : ''}/s${g.bestStreak}/b${Math.round(g.bonus / 1000)}k`);
  }
  console.log(name.padEnd(9), res.join('  '));
}
