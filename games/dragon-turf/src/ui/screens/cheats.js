import { Screen } from '../screens.js';
import { TOGGLES, ACTIONS, SPAWNS, CODE_LIST } from '../../systems/cheats.js';

// F1 / ` — the cheat menu. Toggles stay on until switched off; actions fire once.
export class CheatScreen extends Screen {
  open() { this.render(); }
  render() {
    const c = this.game.cheats;
    this.html(`<div class="panel cheats" style="width:min(860px,95vw)"><div class="shop-head"><div><h2>🐉 CHEAT MODE</h2><div class="sub">Have fun. Nobody is keeping score.</div></div><div><button class="btn small primary" data-x="close"><span>Back to the game · F1</span></button></div></div>
      <div class="cheat-grid">
        <div><h3>TOGGLES</h3><div class="list">${TOGGLES.map(([k, ico, t, d]) => `<div class="item"><span class="ico">${ico}</span><div><div class="t">${t}</div><div class="d">${d}</div></div><button class="btn small ${c.on[k] ? 'on' : ''}" data-t="${k}"><span>${c.on[k] ? 'ON' : 'OFF'}</span></button></div>`).join('')}</div></div>
        <div><h3>INSTANT</h3><div class="cheat-btns">${ACTIONS.map(([k, ico, t]) => `<button class="btn small" data-a="${k}"><span>${ico} ${t}</span></button>`).join('')}</div>
          <h3 style="margin-top:14px">SPAWN IN FRONT OF YOU</h3><div class="cheat-btns">${SPAWNS.map(([k, t]) => `<button class="btn small" data-s="${k}"><span>${t}</span></button>`).join('')}</div>
          <div class="hint" style="margin-top:14px;line-height:1.7">Typed codes work while playing: ${CODE_LIST.map((k) => `<kbd>${k}</kbd>`).join(' ')}</div></div>
      </div></div>`);
    this.$$('[data-t]').forEach((b) => b.addEventListener('click', () => { c.toggle(b.dataset.t); this.render(); }));
    this.$$('[data-a]').forEach((b) => b.addEventListener('click', () => { c.action(b.dataset.a); if (b.dataset.a === 'tp') this.close(); else this.flash(b); }));
    this.$$('[data-s]').forEach((b) => b.addEventListener('click', () => { c.spawn(b.dataset.s); this.close(); }));
    this.$('[data-x=close]').addEventListener('click', () => this.close());
  }
  flash(b) { b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 350); }
  onKey(e) { if (e.code === 'F1' || e.code === 'Backquote') { this.close(); return true; } return false; }
}
