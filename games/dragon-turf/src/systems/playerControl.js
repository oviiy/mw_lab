import { WEAPONS, WEAPON_ORDER } from '../data/weapons.js';
import { clamp } from '../core/math.js';

// Translates keyboard/mouse into the player's intent / vehicle controls.
export class PlayerController {
  constructor(game) { this.game = game; this.rollCool = 0; this.aimDist = 200; this.fireHeld = false; this.lastShot = 0; }

  get mouseWorld() { const g = this.game, m = g.input.mouse; return { x: g.camera.wx(m.x), y: g.camera.wy(m.y) }; }

  selectWeapon(id) {
    const g = this.game, p = g.player; if (!g.economy.owned(id) || p.weapon === id) return;
    const w = WEAPONS[id]; if (w.ammo && (p.ammo[w.ammo] || 0) <= 0 && !p.infiniteAmmo) { g.hud.toast(`No ${w.name} ammo`); return; }
    p.weapon = id; p.cooldown = Math.max(p.cooldown, 0.15); g.audio.click(); g.hud.showWeapon(id);
  }
  cycleWeapon(dir) {
    const g = this.game, p = g.player, owned = WEAPON_ORDER.filter((id) => g.economy.owned(id) && (!WEAPONS[id].ammo || (p.ammo[WEAPONS[id].ammo] || 0) > 0 || id === p.weapon));
    if (owned.length < 2) return; const i = owned.indexOf(p.weapon); this.selectWeapon(owned[(i + dir + owned.length) % owned.length]);
  }

  update(dt) {
    const g = this.game, p = g.player, inp = g.input; if (!p) return;
    this.rollCool = Math.max(0, this.rollCool - dt);
    p.comboT = Math.max(0, (p.comboT || 0) - dt);
    if (p.dead || g.state !== 'play') { p.intent.mx = p.intent.my = 0; p.intent.fire = false; if (p.vehicle) { const c = p.vehicle.controls; c.thr = 0; c.steer = 0; c.hb = false; c.brake = 0.5; } return; }
    const mw = this.mouseWorld, aim = Math.atan2(mw.y - p.y, mw.x - p.x);
    this.aimDist = Math.hypot(mw.x - p.x, mw.y - p.y);
    // weapon selection
    for (let i = 0; i < 9; i++) if (inp.pressed('w' + (i + 1))) { const owned = WEAPON_ORDER.filter((id) => g.economy.owned(id)); if (owned[i]) this.selectWeapon(owned[i]); }
    if (inp.pressed('weaponNext')) this.cycleWeapon(1);
    if (inp.mouse.wheel) this.cycleWeapon(inp.mouse.wheel > 0 ? 1 : -1);
    if (inp.pressed('use')) g.interact.activate();
    if (inp.pressed('pda')) g.screens.togglePda();
    if (inp.pressed('pause')) g.screens.togglePause();
    if (inp.pressed('cheats')) g.screens.open('cheats');
    if (inp.pressed('radio')) g.audio.nextStation();
    if (inp.pressed('cam')) g.cameraMode = (g.cameraMode + 1) % 3;
    if (inp.pressed('zoom')) g.camera.userZoom = g.camera.userZoom > 1.1 ? 0.8 : g.camera.userZoom + 0.25;

    const fireBtn = inp.mouse.left, w = WEAPONS[p.weapon];
    if (p.vehicle) return this.drive(p, p.vehicle, aim, fireBtn, w, inp);

    const ax = inp.axis(); p.intent.mx = ax.x; p.intent.my = ax.y; p.intent.run = inp.held('sprint'); p.intent.aim = aim;
    if (inp.pressed('dodge') && this.rollCool <= 0 && p.rollT <= 0) {
      p.rollDir = ax.x || ax.y ? Math.atan2(ax.y, ax.x) : aim; p.rollT = 0.34; this.rollCool = 0.6; p.invuln = 0.34; g.audio.roll(); g.fx.dust(p.x, p.y, 4);
    }
    if (p.invuln > 0) p.invuln -= dt;
    // attack
    const semi = !w.auto && w.type !== 'melee';
    if (fireBtn && (w.type === 'melee' || w.auto || (semi && inp.mouse.leftHit))) g.combat.fire(p);
    if (inp.mouse.rightHit || inp.pressed('melee')) { const old = p.weapon; if (w.type !== 'melee') { p.weapon = g.economy.owned('cleaver') ? 'cleaver' : 'fists'; g.combat.melee(p); p.weapon = old; } else g.combat.melee(p); }
    if (inp.pressed('throw')) {
      const t = ['grenade', 'molotov'].find((id) => g.economy.owned(id) && (p.ammo[id] || 0) > 0);
      if (t) { const old = p.weapon; p.weapon = t; p.intent.throwDist = clamp(this.aimDist, 90, 360); g.combat.fire(p); p.weapon = old; } else g.hud.toast('Nothing to throw');
    }
  }

  drive(p, v, aim, fireBtn, w, inp) {
    const g = this.game, c = v.controls, up = inp.held('up'), down = inp.held('down'), l = inp.held('left'), r = inp.held('right');
    const target = (r ? 1 : 0) - (l ? 1 : 0);
    // analogue-ish steering: ramps in instead of snapping to full lock
    c.steer += (target - c.steer) * (target === 0 ? 0.3 : 0.18); if (Math.abs(target - c.steer) < 0.02) c.steer = target;
    c.hb = inp.held('handbrake'); c.brake = 0;
    p.intent.aim = aim; c.aim = aim;
    const alt = inp.mouse.right || inp.held('melee') || inp.pressed('throw');
    if (v.cls === 'heli') {
      // screen-space strafing; the nose follows the mouse
      c.mx = (r ? 1 : 0) - (l ? 1 : 0); c.my = (down ? 1 : 0) - (up ? 1 : 0); c.thr = 0;
      if (fireBtn) g.combat.vehicleFire(v, 0, aim); if (alt) g.combat.vehicleFire(v, 1, aim);
      return;
    }
    if (v.cls === 'tank') {
      v.turret += Math.max(-2.4 / 60, Math.min(2.4 / 60, wrap(aim - v.turret)));
      c.thr = up && !down ? 1 : down && !up ? -1 : 0;
      if (fireBtn) g.combat.vehicleFire(v, 0, v.turret); if (alt) g.combat.vehicleFire(v, 1, v.turret);
      return;
    }
    if (up && !down) c.thr = 1; else if (down && !up) { if (v.fw > 30 && v.cls !== 'plane') { c.thr = 0; c.brake = 1; } else c.thr = -1; } else c.thr = 0;
    if (v.cls === 'plane') { if (fireBtn) g.combat.vehicleFire(v, 0, v.angle); if (alt || inp.pressed('handbrake')) g.combat.vehicleFire(v, 1, v.angle); return; }
    if (inp.pressed('horn')) { v.horn = 0.5; g.audio.horn(v); g.events.emit('noise', { x: v.x, y: v.y, r: 220, src: p, kind: 'horn' }); }
    if (inp.held('horn')) v.horn = 0.1;
    if (fireBtn && (w.type === 'gun' || w.type === 'throw') && (w.id !== 'rifle')) { if (w.auto || inp.mouse.leftHit) g.combat.fire(p); }
  }
}
const wrap = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
