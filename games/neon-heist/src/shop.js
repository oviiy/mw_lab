import { G } from './state.js';
import { WEAPONS } from './combat.js';
import { line } from './speech.js';

// Keyboard-driven shop menu (press the number to buy, E / Esc to leave); also clickable.
export class Shop {
  constructor() {
    this.el = document.getElementById('shop'); this.open = false; this.items = []; this.title = '';
  }

  show(title, items, clerk) {
    this.title = title; this.builder = typeof items === 'function' ? items : null; this.items = this.builder ? this.builder() : items; this.clerk = clerk; this.open = true; this.render();
    this.el.classList.add('on'); document.body.classList.add('shopping');
    if (document.pointerLockElement) document.exitPointerLock();
    if (clerk) G.speech.say(clerk, line('shopHi'), { secs: 2.4, cls: '' });
  }
  close() {
    if (!this.open) return;
    this.open = false; this.el.classList.remove('on'); document.body.classList.remove('shopping');
    if (this.clerk) G.speech.say(this.clerk, line('shopBye'), { secs: 2 });
    try { const r = G.renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (_) { /* needs a gesture */ }
  }
  choose(n) {
    const it = this.items[n]; if (!it || it.disabled) return;
    if (G.money < it.price) { G.hud.toast('Not enough cash', 1.4); if (this.clerk) G.speech.say(this.clerk, line('broke'), { secs: 2 }); return; }
    const res = it.action(); if (res === false) return;
    G.money -= it.price; G.audio.cash(); if (typeof res === 'string') G.hud.toast(res, 2);
    if (this.builder) this.items = this.builder();
    this.render();
  }
  render() {
    const rows = this.items.map((it, i) => `<div class="row${it.disabled ? ' off' : ''}${G.money < it.price ? ' poor' : ''}" data-i="${i}"><span class="k">${i + 1}</span><span class="n">${it.label}<small>${it.desc || ''}</small></span><span class="p">${it.price ? '$' + it.price : 'free'}</span></div>`).join('');
    this.el.innerHTML = `<h3>${this.title}</h3><div class="cash">Cash: $${Math.floor(G.money).toLocaleString()}</div>${rows}<div class="foot">Press a number to buy · E / Esc to leave</div>`;
    this.el.querySelectorAll('.row').forEach((r) => r.addEventListener('click', () => this.choose(+r.dataset.i)));
  }
}

export function weaponShopItems() {
  const P = G.player, out = [];
  for (const i of [0, 1, 2, 4, 5, 6, 3]) {
    const w = WEAPONS[i];
    if (!G.missions.weaponTier(i)) { out.push({ label: w.name, desc: 'unlocks later in the story', price: w.price, disabled: true, action: () => false }); continue; }
    if (!P.owned[i]) out.push({ label: w.name, desc: `+${w.pack} ammo`, price: w.price, action: () => { P.giveWeapon(i, w.pack); if (!P.canUse(P.w) || P.w === 7) P.setWeapon(i, true); return `${w.name} purchased`; } });
    else out.push({ label: `${w.name} ammo`, desc: P.ammo[i] >= 999 ? 'full' : `+${w.pack}  (you have ${P.ammo[i]})`, price: w.packPrice, disabled: P.ammo[i] >= 999, action: () => { P.giveWeapon(i, w.pack); return `+${w.pack} ${w.name} ammo`; } });
  }
  out.push({ label: 'Body armor', desc: `+50 armor (you have ${Math.round(P.armor || 0)})`, price: 200, disabled: (P.armor || 0) >= 100, action: () => { P.armor = Math.min(100, (P.armor || 0) + 50); return 'Armor on'; } });
  return out;
}
