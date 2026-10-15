import { ECON } from '../config.js';
import { WEAPONS, AMMO } from '../data/weapons.js';
import { clamp } from '../core/math.js';

// Wallet + weapon locker. The ped itself holds the live ammo counts.
export class EconomySystem {
  constructor(game) { this.game = game; this.cash = ECON.startCash; this.weapons = new Set(['fists', 'pistol']); this.earned = 0; this.spent = 0; }
  // small sums just roll the cash counter; only big ones get a toast
  addCash(n, silent = false) { this.cash += n; if (n > 0) this.earned += n; if (!silent && n >= 500) this.game.hud && this.game.hud.toast(`+$${Math.floor(n)}`, 2000, 'good'); this.game.events.emit('cash', { amount: n }); }
  spend(n) { if (this.cash < n) return false; this.cash -= n; this.spent += n; this.game.events.emit('cash', { amount: -n }); return true; }
  owned(id) { return this.weapons.has(id); }
  giveWeapon(id, ammo = 0) {
    const w = WEAPONS[id], p = this.game.player; this.weapons.add(id);
    if (w.ammo) p.ammo[w.ammo] = clamp((p.ammo[w.ammo] || 0) + (ammo || AMMO[w.ammo].pack), 0, AMMO[w.ammo].max);
    this.game.events.emit('weaponGained', { id });
  }
  buyAmmo(type) { const a = AMMO[type]; if (!this.spend(a.price)) return false; const p = this.game.player; p.ammo[type] = clamp((p.ammo[type] || 0) + a.pack, 0, a.max); return true; }
  serialize() { return { cash: this.cash, weapons: [...this.weapons], earned: this.earned, spent: this.spent, ammo: { ...this.game.player.ammo } }; }
  restore(d) { if (!d) return; this.cash = d.cash; this.weapons = new Set(d.weapons || ['fists', 'pistol']); this.earned = d.earned || 0; this.spent = d.spent || 0; Object.assign(this.game.player.ammo, d.ammo || {}); }
}
