import { Pickup } from '../entities/pickup.js';
import { WEAPONS, AMMO } from '../data/weapons.js';
import { rand } from '../core/rng.js';
import { fmtMoney } from '../core/math.js';

export class PickupSystem {
  constructor(game) { this.game = game; }
  drop(x, y, type, amount = 0, o = {}) {
    const a = rand.range(0, 6.28), d = rand.range(0, 10);
    return this.game.entities.add(new Pickup(type, x + Math.cos(a) * d, y + Math.sin(a) * d, amount, o));
  }
  update() {
    const game = this.game, p = game.player; if (!p || p.dead || p.vehicle) { if (p && p.vehicle) this.grab(p); return; }
    this.grab(p);
  }
  grab(p) {
    const game = this.game;
    for (const k of game.entities.pickups) {
      if (k.removed) continue; const dx = k.x - p.x, dy = k.y - p.y;
      if (dx * dx + dy * dy > (k.r + 10) ** 2) continue;
      if (this.apply(p, k)) { k.removed = true; game.audio.pickup(k.type); }
    }
  }
  apply(p, k) {
    const g = this.game;
    switch (k.type) {
      case 'cash': g.economy.addCash(k.amount, true); g.fx.floater(k.x, k.y - 12, '+' + fmtMoney(k.amount), '#7ed957'); return true;
      case 'health': if (p.hp >= p.maxHp) return false; p.heal(k.amount || 35); g.fx.floater(k.x, k.y - 12, '+HP', '#ff8a8a'); return true;
      case 'armor': if (p.armor >= 100) return false; p.armor = Math.min(100, p.armor + (k.amount || 50)); g.fx.floater(k.x, k.y - 12, '+ARMOR', '#7fc8ff'); return true;
      case 'ammo': { const types = Object.keys(AMMO), t = k.ammoType || this.bestAmmo(p) || types[2]; const a = AMMO[t]; p.ammo[t] = Math.min(a.max, (p.ammo[t] || 0) + (k.amount && k.amount < 200 ? Math.ceil(a.pack * 0.6) : a.pack)); g.fx.floater(k.x, k.y - 12, '+' + a.name.toUpperCase(), '#ffe28a'); return true; }
      case 'weapon': { g.economy.giveWeapon(k.weapon, k.amount); g.fx.floater(k.x, k.y - 12, WEAPONS[k.weapon].name.toUpperCase(), '#ffd23a'); return true; }
      case 'drop': g.economy.addCash(k.amount, true); g.fx.floater(k.x, k.y - 12, '+' + fmtMoney(k.amount), '#7ed957'); return true;
      default: return false;
    }
  }
  bestAmmo(p) { for (const w of ['rifle', 'smg', 'shotgun', 'pistol']) if (p.ammo[w] !== undefined && this.game.economy.owned(w)) return w; return 'pistol'; }
}
