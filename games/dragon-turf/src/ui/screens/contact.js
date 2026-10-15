import { Screen } from '../screens.js';
import { fmtMoney } from '../../core/math.js';
import { WEAPONS } from '../../data/weapons.js';

// Contact menu: pick a job from Uncle Wei or Madam Lin.
export class ContactScreen extends Screen {
  open({ contact }) {
    const g = this.game, who = contact === 'wei' ? { n: 'Uncle Wei', sub: 'Jade Serpent boss · the Jade Teahouse', ico: '☯', col: '#2fd07a' } : { n: 'Madam Lin', sub: 'Fixer · the Phoenix Pavilion', ico: '☎', col: '#ff3d6e' };
    const rows = g.missions.listFor(contact), act = g.missions.active;
    this.html(`<div class="panel" style="width:min(720px,94vw)"><h2 style="color:${who.col}">${who.ico} ${who.n.toUpperCase()}</h2><div class="sub">${who.sub}</div>
      ${act ? `<div class="item" style="grid-template-columns:1fr auto;margin-bottom:10px"><div><div class="t">Current job: ${act.def.title}</div><div class="d">${act.objText || ''}</div></div><button class="btn small" data-a="abandon"><span>Abandon</span></button></div>` : ''}
      <div class="list">${rows.map(({ def, state }, i) => {
        const r = def.reward, extra = r.weapon ? ' + ' + WEAPONS[r.weapon].name : '';
        const btn = state === 'available' ? `<button class="btn small primary" data-i="${i}"><span>Accept</span></button>` : state === 'done' ? '<span class="pill good">DONE</span>' : state === 'active' ? '<span class="pill gold">ACTIVE</span>' : '<span class="pill bad">LOCKED</span>';
        return `<div class="item" style="${state === 'locked' ? 'opacity:.55' : ''}"><span class="ico">${state === 'done' ? '✔' : '❖'}</span><div><div class="t">${def.title}</div><div class="d">${def.brief}</div><div class="d" style="color:#c9b87a">Reward ${fmtMoney(r.cash || 0)}${extra}${state === 'locked' ? ' · ' + g.missions.lockReason(def) : ''}</div></div>${btn}</div>`;
      }).join('')}</div>
      <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn ghost" data-a="close"><span>Leave</span></button></div></div>`);
    this.$$('[data-i]').forEach((b) => b.addEventListener('click', () => { const def = rows[+b.dataset.i].def; if (act) { g.hud.toast('Finish or abandon your current job first', 2400, 'bad'); return; } this.close(); setTimeout(() => g.missions.start(def.id), 250); }));
    this.$('[data-a=close]').addEventListener('click', () => this.close());
    const ab = this.$('[data-a=abandon]'); if (ab) ab.addEventListener('click', () => { g.missions.abandon(); this.close(); });
  }
  onKey(e) { if (e.code === 'KeyE') { this.close(); return true; } return false; }
}
