import { Screen } from '../screens.js';
import { GOODS, DISTRICT_NAMES } from '../../data/goods.js';
import { fmtMoney } from '../../core/math.js';

// Dealer counter: buy and sell contraband at this district's prices.
export class TradeScreen extends Screen {
  open() { this.render(); }
  render() {
    const g = this.game, tr = g.trade, did = g.world.districtAtPx(g.player.x, g.player.y);
    const wanted = g.wantedLevel > 0;
    this.html(`<div class="panel" style="width:min(820px,95vw)"><h2>🕶 THE DEALER</h2><div class="sub">${DISTRICT_NAMES[did]} · prices as of ${g.clock.label()}</div>
      <div class="row" style="justify-content:space-between;margin-bottom:12px"><div class="price" style="font-size:20px">${fmtMoney(g.economy.cash)}</div><div class="hint">Cargo ${tr.carried}/${tr.capacity} crates ${wanted ? '· <span style="color:#ff6a5a">cops are watching</span>' : ''}</div></div>
      <div class="list">${GOODS.map((gd) => { const p = tr.price(did, gd.id), r = p / gd.base, tag = r > 1.18 ? '<span class="pill gold">PREMIUM · SELL HERE</span>' : r < 0.84 ? '<span class="pill good">CHEAP · BUY HERE</span>' : '', own = tr.cargo[gd.id], avg = tr.cost && tr.cost[gd.id] ? tr.cost[gd.id] : 0; return `<div class="item" style="grid-template-columns:auto 1fr auto auto"><span class="ico">${gd.icon}</span><div><div class="t">${gd.name} ${tag}</div><div class="d">Carrying ${own}${own && avg ? ` · bought @ ${fmtMoney(avg)}` : ''}</div></div><span class="price">${fmtMoney(p)}</span><div class="row" style="gap:4px"><button class="btn small" data-b="${gd.id}" data-n="1"><span>Buy</span></button><button class="btn small" data-b="${gd.id}" data-n="5"><span>×5</span></button><button class="btn small primary" data-s="${gd.id}" data-n="1" ${own ? '' : 'disabled'}><span>Sell</span></button><button class="btn small primary" data-s="${gd.id}" data-n="99" ${own ? '' : 'disabled'}><span>All</span></button></div></div>`; }).join('')}</div>
      <div class="row" style="justify-content:space-between;margin-top:14px"><div class="hint">Check the PDA ▸ DEALERS tab for prices in other districts. You can't sell while wanted, and big sales risk an undercover sting.</div><button class="btn primary" data-a="leave"><span>Leave</span></button></div></div>`);
    this.$$('[data-b]').forEach((b) => b.addEventListener('click', () => { if (tr.buy(b.dataset.b, +b.dataset.n)) this.render(); else g.audio.ui('bad'); }));
    this.$$('[data-s]').forEach((b) => b.addEventListener('click', () => { if (tr.sell(b.dataset.s, +b.dataset.n)) this.render(); else g.audio.ui('bad'); }));
    this.$('[data-a=leave]').addEventListener('click', () => this.close());
  }
  onKey(e) { if (e.code === 'KeyE') { this.close(); return true; } return false; }
}
