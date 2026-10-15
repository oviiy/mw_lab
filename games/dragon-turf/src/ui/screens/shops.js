import { Screen } from '../screens.js';
import { WEAPONS, WEAPON_ORDER, AMMO } from '../../data/weapons.js';
import { VEHICLES } from '../../data/vehicles.js';
import { fmtMoney, clamp, dist } from '../../core/math.js';

const bar = (g) => `<div class="row" style="justify-content:space-between;margin-bottom:12px"><div class="price" style="font-size:20px" id="cash">${fmtMoney(g.economy.cash)}</div><div class="hint">E / Esc to leave</div></div>`;

// Stock unlocks with the story so rewards and purchases don't step on each other.
const STOCK_UNLOCK = { smg: 'protection', grenade: 'fireworks', shotgun: 'fireworks', rifle: 'lantern_war', flamer: 'accountant', rpg: 'vendetta', minigun: 'dragons_head' };
const MISSION_TITLES = { protection: 'Protection Money', fireworks: 'Lantern Night', lantern_war: 'Lantern Alley' };

export class GunShopScreen extends Screen {
  open() { this.render(); }
  render() {
    const g = this.game, p = g.player, e = g.economy, cash = e.cash;
    const disc = (g.missions.done.has('protection') ? 0.9 : 1) * (g.progress ? g.progress.shopMul : 1);
    const weps = WEAPON_ORDER.filter((id) => WEAPONS[id].price > 0);
    const wRow = (id) => {
      const w = WEAPONS[id], own = e.owned(id), price = Math.round(w.price * disc), lock = STOCK_UNLOCK[id] && !g.missions.done.has(STOCK_UNLOCK[id]);
      const right = own ? '<span class="pill good">OWNED</span>' : lock ? `<span class="pill bad">AFTER “${MISSION_TITLES[STOCK_UNLOCK[id]]}”</span>` : `<button class="btn small ${cash < price ? 'poor' : ''}" data-w="${id}" data-p="${price}" ${cash < price ? 'disabled' : ''}><span>${fmtMoney(price)}</span></button>`;
      return `<div class="item ${lock ? 'locked' : ''}"><span class="ico">${w.type === 'melee' ? '🔪' : w.type === 'throw' ? '💣' : '🔫'}</span><div><div class="t">${w.name}</div><div class="d">${w.type === 'melee' ? 'Melee · right-click' : w.type === 'throw' ? 'Thrown · G' : `${w.dmg} dmg · ${w.rate}/s${w.pellets > 1 ? ' · ' + w.pellets + ' pellets' : ''}`}</div></div>${right}</div>`;
    };
    const ammoFor = { pistol: 'pistol', smg: 'smg', shotgun: 'shotgun', rifle: 'rifle', molotov: 'molotov', grenade: 'grenade' };
    const aRow = (k) => {
      const a = AMMO[k], have = e.owned(ammoFor[k]), full = (p.ammo[k] || 0) >= a.max;
      const btn = !have ? '<span class="pill">NO WEAPON</span>' : full ? '<span class="pill good">FULL</span>' : `<button class="btn small" data-a="${k}" ${cash < a.price ? 'disabled' : ''}><span>${fmtMoney(a.price)}</span></button>`;
      return `<div class="item ${have ? '' : 'locked'}"><span class="ico">▮</span><div><div class="t">${a.name} ×${a.pack}</div><div class="d">You have ${p.ammo[k] || 0} / ${a.max}</div></div>${btn}</div>`;
    };
    this.html(`<div class="panel shop" style="width:min(900px,95vw)"><div class="shop-head"><div><h2>🔫 ARMS DEALER</h2><div class="sub">Cash only. No questions, no receipts.${disc < 1 ? ' <span class="pill gold">SERPENT PRICE −10%</span>' : ''}</div></div><div class="shop-cash"><span class="price">${fmtMoney(cash)}</span><button class="btn small primary" data-x="leave"><span>Leave · E</span></button></div></div>
      <div class="grid2 shop-body"><div><h3 class="sh">WEAPONS</h3><div class="list">${weps.map(wRow).join('')}</div></div>
      <div><h3 class="sh">AMMO &amp; GEAR</h3><div class="list">${Object.keys(ammoFor).map(aRow).join('')}
        <div class="item"><span class="ico">🛡</span><div><div class="t">Body armor</div><div class="d">Armor ${Math.round(p.armor)}/100 · soaks most of a hit</div></div>${p.armor >= 100 ? '<span class="pill good">FULL</span>' : `<button class="btn small" data-armor="1" ${cash < 220 ? 'disabled' : ''}><span>${fmtMoney(220)}</span></button>`}</div></div></div></div></div>`);
    this.$$('[data-w]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.w; if (e.spend(+b.dataset.p)) { e.giveWeapon(id, WEAPONS[id].ammo ? AMMO[WEAPONS[id].ammo].pack : 0); g.audio.ui('ok'); g.hud.toast(`Bought ${WEAPONS[id].name} · switch with 1–6 or Q`, 2600, 'good'); this.render(); } else g.audio.ui('bad'); }));
    this.$$('[data-a]').forEach((b) => b.addEventListener('click', () => { if (e.buyAmmo(b.dataset.a)) { g.audio.ui('ok'); this.render(); } else g.audio.ui('bad'); }));
    this.$('[data-x=leave]').addEventListener('click', () => this.close());
    const ar = this.$('[data-armor]'); if (ar) ar.addEventListener('click', () => { if (e.spend(220)) { p.armor = 100; g.audio.ui('ok'); this.render(); } else g.audio.ui('bad'); });
  }
  onKey(e) { if (e.code === 'KeyE') { this.close(); return true; } return false; }
}

export class EateryScreen extends Screen {
  open() {
    const g = this.game, items = [['Roast Duck Rice', '🍗', 45, 40], ['Wonton Noodles', '🍜', 25, 25], ['Egg Tart & Milk Tea', '🥧', 14, 15], ['Chef\'s Banquet', '🥘', 120, 100]];
    this.html(`<div class="panel" style="width:min(560px,94vw)"><h2>🍜 NOODLE BAR</h2><div class="sub">Eat well. Fight better.</div>${bar(g)}<div class="list">${items.map(([n, ico, pr, hp], i) => `<div class="item"><span class="ico">${ico}</span><div><div class="t">${n}</div><div class="d">+${hp} health</div></div><button class="btn small" data-i="${i}"><span>${fmtMoney(pr)}</span></button></div>`).join('')}</div>
      <div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" data-a="leave"><span>Leave</span></button></div></div>`);
    this.$$('[data-i]').forEach((b) => b.addEventListener('click', () => { const it = items[+b.dataset.i], p = g.player; if (p.hp >= p.maxHp) { g.hud.toast('You are not hungry'); return; } if (g.economy.spend(it[2])) { p.heal(it[3]); g.audio.ui('ok'); g.hud.toast(`+${it[3]} health`, 1800, 'good'); this.$('#cash').textContent = fmtMoney(g.economy.cash); } else g.audio.ui('bad'); }));
    this.$('[data-a=leave]').addEventListener('click', () => this.close());
  }
  onKey(e) { if (e.code === 'KeyE') { this.close(); return true; } return false; }
}

export class HospitalScreen extends Screen {
  open() {
    const g = this.game, p = g.player, cost = Math.max(0, Math.ceil((p.maxHp - p.hp) * 1.2));
    this.html(`<div class="panel" style="width:min(520px,94vw)"><h2>✚ CLINIC</h2><div class="sub">Dr. Fong asks no questions about bullet holes.</div>${bar(g)}<div class="list">
      <div class="item"><span class="ico">✚</span><div><div class="t">Full treatment</div><div class="d">Health ${Math.round(p.hp)}/${p.maxHp}</div></div><button class="btn small" data-a="heal" ${cost ? '' : 'disabled'}><span>${fmtMoney(cost)}</span></button></div></div>
      <div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" data-a="leave"><span>Leave</span></button></div></div>`);
    this.$('[data-a=heal]').addEventListener('click', () => { if (g.economy.spend(cost)) { p.hp = p.maxHp; g.audio.ui('ok'); this.close(); g.hud.toast('Patched up', 1800, 'good'); } else g.audio.ui('bad'); });
    this.$('[data-a=leave]').addEventListener('click', () => this.close());
  }
  onKey(e) { if (e.code === 'KeyE') { this.close(); return true; } return false; }
}

export class SprayScreen extends Screen {
  open() {
    const g = this.game, p = g.player, v = p.vehicle, price = 160;
    const copNear = g.entities.near(p.x, p.y, 170, [], (e) => e.kind === 'ped' && (e.role === 'cop' || e.role === 'swat') && !e.dead).length > 0;
    this.html(`<div class="panel" style="width:min(520px,94vw)"><h2>🎨 PAY 'N' SPRAY</h2><div class="sub">New paint, new plates, new you.</div>${bar(g)}
      <div class="item"><span class="ico">🚗</span><div><div class="t">Respray &amp; repair</div><div class="d">${v ? 'Fixes damage. Clears your wanted level if nobody is watching.' : 'Drive a car in to use this.'}</div></div><button class="btn small" data-a="go" ${v ? '' : 'disabled'}><span>${fmtMoney(price)}</span></button></div>
      <div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" data-a="leave"><span>Leave</span></button></div></div>`);
    this.$('[data-a=go]').addEventListener('click', () => {
      if (!g.economy.spend(price)) return g.audio.ui('bad');
      v.hp = v.maxHp; v.dead = false; v.color = VEHICLES[v.type].colors[(Math.random() * VEHICLES[v.type].colors.length) | 0];
      if (g.wantedLevel > 0) { if (copNear) g.hud.toast('A cop saw the whole thing. Still wanted!', 3000, 'bad'); else { g.wanted.clear('Fresh paint. The cops lost you.'); } } else g.hud.toast('Looking sharp', 2000, 'good');
      g.audio.ui('ok'); this.close();
    });
    this.$('[data-a=leave]').addEventListener('click', () => this.close());
  }
  onKey(e) { if (e.code === 'KeyE') { this.close(); return true; } return false; }
}

export class ChopScreen extends Screen {
  open() {
    const g = this.game, p = g.player, v = p.vehicle, hour = g.clock.day % VEHICLE_KEYS.length, wanted = VEHICLE_KEYS[hour];
    const base = v ? Math.round((VEHICLES[v.type].hp * 3 + (VEHICLES[v.type].max * 0.9)) * (0.4 + 0.6 * v.hp / v.maxHp) * (v.type === wanted ? 1.6 : 1)) : 0;
    this.html(`<div class="panel" style="width:min(560px,94vw)"><h2>🚗 CHOP SHOP</h2><div class="sub">Today's special order: <b style="color:var(--gold)">${VEHICLES[wanted].name}</b> (+60%)</div>${bar(g)}
      <div class="item"><span class="ico">🔧</span><div><div class="t">${v ? 'Sell this ' + VEHICLES[v.type].name : 'Drive a vehicle in to sell it'}</div><div class="d">${v ? `Condition ${Math.round(v.hp / v.maxHp * 100)}%` : ''}</div></div><button class="btn small primary" data-a="sell" ${v ? '' : 'disabled'}><span>${fmtMoney(base)}</span></button></div>
      <div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" data-a="leave"><span>Leave</span></button></div></div>`);
    this.$('[data-a=sell]').addEventListener('click', () => { if (!v) return; if (v.tag === 'mission') { g.hud.toast('That car is part of a job', 2200, 'bad'); return; } g.vehicles.eject(p); v.removed = true; g.economy.addCash(base, true); g.fx.floater(p.x, p.y - 20, '+' + fmtMoney(base), '#7ed957', true); g.audio.ui('ok'); this.close(); });
    this.$('[data-a=leave]').addEventListener('click', () => this.close());
  }
  onKey(e) { if (e.code === 'KeyE') { this.close(); return true; } return false; }
}
const VEHICLE_KEYS = ['sedan', 'sports', 'taxi', 'van', 'limo', 'bike', 'minibus'];

export class SafehouseScreen extends Screen {
  open() {
    const g = this.game, stash = Math.floor(g.turf.stash), h = g.clock.hour;
    this.html(`<div class="panel" style="width:min(560px,94vw)"><h2>🏠 SAFEHOUSE</h2><div class="sub">${g.clock.label()} · Day ${g.clock.day} · a place to breathe</div>
      <div class="list">
        <div class="item"><span class="ico">💾</span><div><div class="t">Save game</div><div class="d">Progress, cash, turf, missions</div></div><button class="btn small" data-a="save"><span>Save</span></button></div>
        <div class="item"><span class="ico">💰</span><div><div class="t">Collect protection money</div><div class="d">${g.turf.owned().length} turfs · ${fmtMoney(g.turf.income())}/hr</div></div><button class="btn small primary" data-a="collect" ${stash > 0 ? '' : 'disabled'}><span>${fmtMoney(stash)}</span></button></div>
        ${g.turf.owned().filter((t) => !t.guarded).length ? `<div class="item"><span class="ico">🛡</span><div><div class="t">Post Serpent guards</div><div class="d">Guarded turf repels most rival raids by itself · ${g.turf.owned().filter((t) => t.guarded).length}/${g.turf.owned().length} guarded</div></div><button class="btn small" data-a="guard" ${g.economy.cash < 600 ? 'disabled' : ''}><span>$600</span></button></div>` : ''}
        <div class="item"><span class="ico">🌅</span><div><div class="t">Sleep until morning</div><div class="d">Restores health. Skips to 07:00.</div></div><button class="btn small" data-a="morning" ${g.wantedLevel ? 'disabled' : ''}><span>Sleep</span></button></div>
        <div class="item"><span class="ico">🌃</span><div><div class="t">Wait until night</div><div class="d">Skips to 19:30.</div></div><button class="btn small" data-a="night" ${g.wantedLevel ? 'disabled' : ''}><span>Wait</span></button></div>
      </div><div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" data-a="leave"><span>Leave</span></button></div></div>`);
    this.$$('[data-a]').forEach((b) => b.addEventListener('click', () => this.act(b.dataset.a)));
    void h;
  }
  act(a) {
    const g = this.game; g.audio.ui('tick');
    if (a === 'leave') return this.close();
    if (a === 'save') { g.saveGame(); g.hud.toast('Game saved', 2200, 'good'); }
    else if (a === 'guard') { const t = g.turf.owned().find((q) => !q.guarded); if (t && g.economy.spend(600)) { t.guarded = true; g.hud.toast(`Guards posted at ${t.name}`, 2400, 'good'); this.open(); } }
    else if (a === 'collect') { const n = g.turf.collect(); g.economy.addCash(n, true); g.hud.toast(`Collected ${fmtMoney(n)}`, 2400, 'good'); g.audio.pickup('cash'); this.open(); }
    else if (a === 'morning' || a === 'night') { g.clock.setHour(a === 'morning' ? 7 : 19.5); g.player.hp = g.player.maxHp; g.hud.toast(a === 'morning' ? 'You slept well' : 'Night falls over Dragon Street', 2400); g.trade.recompute(); this.close(); }
  }
  onKey(e) { if (e.code === 'KeyE') { this.close(); return true; } return false; }
}
void clamp; void dist;
