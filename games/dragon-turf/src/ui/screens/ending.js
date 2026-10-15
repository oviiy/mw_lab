import { Screen } from '../screens.js';
import { fmtMoney } from '../../core/math.js';

export class EndingScreen extends Screen {
  open() {
    const g = this.game, s = g.stats; this.noEsc = true;
    this.html(`<div class="panel" style="width:min(640px,94vw);text-align:center"><div class="logo" style="font-size:clamp(32px,6vw,64px)">DRAGON STREET<small>IS YOURS</small></div><div class="logo-cn" style="font-size:36px">龍 門 歸 一</div>
      <div class="list" style="text-align:left;margin:14px 0"><div class="item" style="grid-template-columns:1fr auto"><div class="t">Turfs held</div><span class="price">${g.turf.owned().length}/${g.world.turfs.length}</span></div><div class="item" style="grid-template-columns:1fr auto"><div class="t">Total earned</div><span class="price">${fmtMoney(g.economy.earned)}</span></div><div class="item" style="grid-template-columns:1fr auto"><div class="t">Jobs completed</div><span class="price">${s.jobs}</span></div><div class="item" style="grid-template-columns:1fr auto"><div class="t">Time played</div><span class="price">${(g.playTime / 3600).toFixed(1)} h</span></div></div>
      <p class="hint">The war is over. The city is still yours to roam: hold your turf, run the market, take whatever is left.</p>
      <div class="row" style="justify-content:center"><button class="btn primary" data-a="go"><span>Keep Playing</span></button><button class="btn ghost" data-a="title"><span>Title Screen</span></button></div></div>`);
    this.$('[data-a=go]').addEventListener('click', () => this.close()); this.$('[data-a=title]').addEventListener('click', () => { this.close(); g.quitToTitle(); });
    g.audio.sting('win');
  }
}
