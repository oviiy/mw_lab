import { G } from './state.js';
import { WEAPONS } from './combat.js';
import { viaductSurface } from './viaduct.js';

// Cheat menu: ` (backquote / ~) or the CHEATS button on the pause screen.
// Toggles stay on until switched off; nothing here touches the save file.
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];

export class Cheats {
  constructor() {
    this.el = document.getElementById('cheats'); this.open = false;
    this.god = false; this.ammo = false; this.cops = false;
  }
  items() {
    const P = G.player, M = G.missions, on = (b) => (b ? 'ON' : 'OFF');
    const ramp = (k, label) => ({ label: `Start rampage: ${label}`, desc: M.active ? 'finish the current job first' : M.skulls[k].what, act: () => {
      if (M.active) return 'Finish the current job first';
      this.close(); M.start(M.rampage(M.skulls[k])); return null;
    } });
    return [
      { label: 'God mode', desc: 'no damage to you or your car', state: on(this.god), act: () => { this.god = !this.god; return `God mode ${on(this.god)}`; } },
      { label: 'Infinite ammo', desc: 'never run dry', state: on(this.ammo), act: () => { this.ammo = !this.ammo; return `Infinite ammo ${on(this.ammo)}`; } },
      { label: 'All weapons', desc: 'every gun, 999 rounds', act: () => { WEAPONS.forEach((w, i) => P.giveWeapon(i, w.melee ? 0 : 999)); return 'All weapons unlocked'; } },
      { label: '+$100,000', desc: 'cash in hand', act: () => { G.money += 100000; G.audio.cash(); return '+$100,000'; } },
      { label: 'Never wanted', desc: 'cops ignore your crimes', state: on(this.cops), act: () => { this.cops = !this.cops; if (this.cops) G.police.reset(); return `Never wanted ${on(this.cops)}`; } },
      { label: 'Spawn sports car', desc: 'right in front of you', act: () => {
        if (P.car) return 'You are already in a car';
        const x = P.x + Math.cos(P.a) * 5, z = P.z + Math.sin(P.a) * 5; G.traffic.create('sport', x, z, P.a, 0xff2d95); return 'Sports car delivered';
      } },
      { label: 'Heal & repair', desc: 'full health, armor and car', act: () => { P.hp = 100; P.armor = 100; if (P.car) { P.car.hp = P.car.def.hp; P.car.model.paint.color.setHex(P.car.col); } return 'Patched up'; } },
      { label: 'Day / night', desc: 'jump the clock', act: () => { G.sky.tod = G.night > 0.5 ? 0.12 : 0.62; return G.night > 0.5 ? 'Good morning' : 'Good evening'; } },
      { label: 'Teleport to objective', desc: 'the first marker on the minimap', act: () => {
        const b = G.missions.blips()[0]; if (!b) return 'No objective right now';
        if (P.inside) return 'Step outside first';
        const o = P.car || P; o.x = b.x + 4; o.z = b.z + 4; if (P.car) { P.car.vx = P.car.vz = 0; P.car.y = viaductSurface(o.x, o.z); } G.camRig.inited = false; return 'Teleported';
      } },
      ramp(0, 'SMG'), ramp(1, 'rocket launcher'), ramp(2, 'baseball bat'),
    ];
  }
  toggle() { if (this.open) this.close(); else this.show(); }
  show() {
    if (G.shop.open) G.shop.close();
    this.open = true; this.render(); this.el.classList.add('on'); document.body.classList.add('shopping');
    if (document.pointerLockElement) document.exitPointerLock();
  }
  close() {
    if (!this.open) return;
    this.open = false; this.el.classList.remove('on'); document.body.classList.remove('shopping');
    try { const r = G.renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (_) { /* needs a gesture */ }
  }
  choose(n) {
    const it = this.items()[n]; if (!it) return;
    const res = it.act(); if (res) G.hud.toast(res, 1.8);
    if (this.open) this.render();
  }
  render() {
    const rows = this.items().map((it, i) => `<div class="row" data-i="${i}"><span class="k">${KEYS[i]}</span><span class="n">${it.label}<small>${it.desc}</small></span>${it.state ? `<span class="p" style="color:${it.state === 'ON' ? '#7ed957' : '#ff6b6b'}">${it.state}</span>` : ''}</div>`).join('');
    this.el.innerHTML = `<h3>CHEATS</h3>${rows}<div class="foot">Click or press a key · ~ / Esc to close</div>`;
    this.el.querySelectorAll('.row').forEach((r) => r.addEventListener('click', () => this.choose(+r.dataset.i)));
  }
  // per-frame effects of the toggles
  update() {
    const P = G.player;
    if (this.god && !P.dead) { P.hp = 100; if (P.car && !P.car.dead) P.car.hp = Math.max(P.car.hp, P.car.def.hp); }
    if (this.ammo) for (let i = 0; i < WEAPONS.length; i++) if (P.owned[i] && !WEAPONS[i].melee && P.ammo[i] < 999) P.ammo[i] = 999;
    if (this.cops && G.wanted > 0) G.police.reset();
  }
}
