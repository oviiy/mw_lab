import { WEAPONS, AMMO } from '../data/weapons.js';
import { RANKS } from './progress.js';
import { PLAYER } from '../config.js';
import { isWater } from '../world/tiles.js';

// Cheat mode: F1 (or `) opens the menu; classic typed codes also work while playing.
// Toggles live in `game.cheats` and are applied every frame; actions run once.
export const TOGGLES = [
  ['god', '🛡', 'God mode', 'You and your ride take no damage'],
  ['ammo', '♾', 'Infinite ammo', 'Never reload, never run dry'],
  ['noWanted', '🕶', 'Never wanted', 'The police ignore everything you do'],
  ['speed', '⚡', 'Super speed', 'Run like the wind, cars get a turbo'],
  ['boom', '💥', 'Explosive bullets', 'Every hit goes bang'],
  ['reveal', '👁', 'Reveal collectibles', 'Jade Dragons and ramps show on the radar'],
];

export const ACTIONS = [
  ['cash', '💰', '+$100,000'],
  ['arms', '🔫', 'All weapons + full ammo'],
  ['heal', '❤', 'Full health & armour'],
  ['clear', '⭐', 'Clear wanted level'],
  ['five', '🚨', 'Five stars (bring it on)'],
  ['rank', '🐉', 'Max gang rank'],
  ['missions', '📜', 'Unlock every mission'],
  ['tp', '📍', 'Teleport to waypoint'],
  ['night', '🌙', 'Toggle day / night'],
  ['rain', '🌧', 'Toggle rain'],
];

export const SPAWNS = [['tank', 'Tank'], ['heli', 'Helicopter'], ['plane', 'Stunt plane'], ['sports', 'Dragon GT'], ['bike', 'Street bike'], ['speedboat', 'Speedboat'], ['armored', 'Enforcer']];

// Typed codes (GTA style): type them on the keyboard during play.
const CODES = { DRAGONGOD: () => ['toggle', 'god'], BOTTOMLESS: () => ['toggle', 'ammo'], GHOST: () => ['toggle', 'noWanted'], FLASH: () => ['toggle', 'speed'], KABOOM: () => ['toggle', 'boom'],
  RICHKAI: () => ['action', 'cash'], ARSENAL: () => ['action', 'arms'], PANZER: () => ['spawn', 'tank'], FLYHIGH: () => ['spawn', 'heli'], WINGS: () => ['spawn', 'plane'], LOSTEM: () => ['action', 'clear'] };
export const CODE_LIST = Object.keys(CODES);

export class CheatSystem {
  constructor(game) {
    this.game = game; this.on = {}; this.buf = '';
    addEventListener('keydown', (e) => {
      if (game.state !== 'play' || e.repeat || !/^Key[A-Z]$/.test(e.code)) return;
      this.buf = (this.buf + e.code.slice(3)).slice(-12);
      for (const code of CODE_LIST) if (this.buf.endsWith(code)) { this.buf = ''; const [kind, arg] = CODES[code](); if (kind === 'toggle') this.toggle(arg); else if (kind === 'action') this.action(arg); else this.spawn(arg); game.hud.toast(`Cheat activated: ${code}`, 2200, 'good'); }
    });
  }
  reset() { this.on = {}; }
  get used() { return Object.values(this.on).some(Boolean); }

  toggle(k) { this.on[k] = !this.on[k]; this.apply(); this.game.audio.ui(this.on[k] ? 'ok' : 'tick'); return this.on[k]; }

  action(k) {
    const g = this.game, p = g.player; if (!p) return;
    if (k === 'cash') g.economy.addCash(100000);
    else if (k === 'arms') { for (const id of Object.keys(WEAPONS)) g.economy.weapons.add(id); for (const [a, d] of Object.entries(AMMO)) p.ammo[a] = d.max; g.hud.toast('Every weapon, fully loaded', 2000, 'good'); }
    else if (k === 'heal') { p.hp = p.maxHp; p.armor = p.maxArmor || 100; if (p.vehicle) p.vehicle.hp = p.vehicle.maxHp; }
    else if (k === 'clear') g.wanted.clear('Wanted level cleared');
    else if (k === 'five') { this.on.noWanted = false; g.wanted.addHeat(25, 'cheat'); }
    else if (k === 'rank') { const pr = g.progress; pr.xp(Math.max(0, RANKS[RANKS.length - 1].xp - pr.XP), 'cheat'); }
    else if (k === 'missions') { g.missions.unlockAll = true; g.hud.toast('Every contact has work for you now', 2400, 'good'); }
    else if (k === 'tp') { const w = g.waypoint || (g.missions.markers().find((m) => !m.small)); if (!w) { g.hud.toast('Set a waypoint on the PDA map first'); return; } const o = p.vehicle || p; o.x = w.x; o.y = w.y; p.x = w.x; p.y = w.y; g.camera.snapTo(w.x, w.y); g.renderer.ground.prebake(w.x, w.y, 2); }
    else if (k === 'night') g.clock.hour = g.clock.isNight ? 12 : 22;
    else if (k === 'rain') { const W = g.weather; W.target = W.target > 0.3 ? 0 : 1; W.timer = 240; }
    g.audio.ui('ok');
  }

  spawn(type) {
    const g = this.game, p = g.player; if (!p) return;
    const a = p.vehicle ? p.vehicle.angle : (p.angle || 0);
    let x = p.x + Math.cos(a) * 80, y = p.y + Math.sin(a) * 80;
    if (type === 'speedboat') { // boats need open water: search outward for it
      let spot = null; for (let r = 60; r < 1400 && !spot; r += 40) for (let k = 0; k < 24 && !spot; k++) { const t = (k / 24) * 6.283, sx = p.x + Math.cos(t) * r, sy = p.y + Math.sin(t) * r; if (isWater(g.world.tileAtPx(sx, sy)) && isWater(g.world.tileAtPx(sx + 30, sy)) && isWater(g.world.tileAtPx(sx - 30, sy)) && isWater(g.world.tileAtPx(sx, sy + 30)) && isWater(g.world.tileAtPx(sx, sy - 30))) spot = { x: sx, y: sy }; }
      if (!spot) { g.hud.toast('No water nearby: head for the harbour'); return; }
      x = spot.x; y = spot.y; g.waypoint = { x, y, auto: true }; g.hud.toast('Speedboat waiting at the waypoint', 2200, 'good');
    }
    const v = g.vehicles.spawn(type, x, y, a, { parked: true, locked: false });
    v.siteStolen = true; g.fx.ring(x, y, 60, 'rgba(120,255,170,'); g.audio.ui('ok');
  }

  // per-frame effects of the toggles
  apply() {
    const g = this.game, p = g.player, c = this.on; if (!p) return;
    p.godMode = !!c.god; p.infiniteAmmo = !!c.ammo || !!(g.progress && g.progress.rampage);
    p.runSpeed = PLAYER.run * (c.speed ? 1.8 : 1); p.walkSpeed = PLAYER.walk * (c.speed ? 1.6 : 1);
    const v = p.vehicle; if (v) { v.boost = c.speed ? 1.6 : 1; if (c.god) { v.hp = Math.max(v.hp, v.maxHp * 0.9); } }
    if (c.god) { p.hp = Math.max(p.hp, p.maxHp); }
    if (c.noWanted && g.wantedLevel) g.wanted.clear();
  }
  update() { if (this.used) this.apply(); }
}
