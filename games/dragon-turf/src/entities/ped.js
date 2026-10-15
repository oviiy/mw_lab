import { Entity } from './entity.js';
import { clamp, dampAngle, wrapAngle, damp } from '../core/math.js';
import { WEAPONS } from '../data/weapons.js';
import { pedSprite, corpseSprite, PED_SPRITE_SIZE } from '../render/pedSprites.js';
import { PLAYER } from '../config.js';
const INK_LINE = '#1a1020';

// A person. Players, civilians, gangsters and cops are all Peds; they differ by
// look, role, faction and the brain that fills `intent` every frame.
export class Ped extends Entity {
  constructor(o) {
    super('ped');
    this.role = o.role || 'civ'; this.faction = o.faction || 'none'; this.look = o.look; this.name = o.name || null;
    this.x = o.x; this.y = o.y; this.angle = o.angle ?? Math.random() * 6.28; this.r = 8;
    this.maxHp = o.hp ?? 40; this.hp = this.maxHp; this.armor = o.armor ?? 0;
    this.walkSpeed = o.walk ?? 62; this.runSpeed = o.run ?? 150;
    this.vx = 0; this.vy = 0; this.kx = 0; this.ky = 0;
    this.intent = { mx: 0, my: 0, run: false, aim: null, fire: false, melee: false, throw: false };
    this.weapon = o.weapon || 'fists'; this.ammo = o.ammo || {}; this.infiniteAmmo = o.infiniteAmmo ?? (this.role !== 'player');
    this.cooldown = 0; this.reload = 0; this.swing = 0; this.recoil = 0;
    this.brain = o.brain || null; this.state = 'idle'; this.stateT = 0;
    this.vehicle = null; this.seat = null;
    this.dead = false; this.deadT = 0; this.hitFlash = 0; this.walkPhase = Math.random() * 4; this.rollT = 0; this.rollDir = 0;
    this.cash = o.cash ?? 0; this.tag = o.tag || null; this.data = o.data || {};
    this.bounty = o.bounty ?? 0; this.hostileToPlayer = o.hostile ?? false; this.knownCrime = false; this.stun = 0;
    this.boss = !!o.boss; this.scale = o.scale ?? 1; this.noDrop = !!o.noDrop; this.persistent = !!o.persistent;
    this.lastHitBy = null; this.wasSeen = false; this.comboT = 0; this.invuln = 0;
  }

  get speedNow() { return Math.hypot(this.vx, this.vy); }
  get weaponDef() { return WEAPONS[this.weapon]; }
  get isArmed() { return this.weapon !== 'fists'; }
  get sortY() { return this.dead ? this.y - 6 : this.y; }

  update(dt, game) {
    if (this.dead) { this.deadT += dt; if (this.deadT > (this.persistent ? 120 : 28)) this.removed = true; this.x += this.kx * dt; this.y += this.ky * dt; this.kx *= 0.9; this.ky *= 0.9; if (Math.abs(this.kx) + Math.abs(this.ky) > 4) game.world.resolveCircle(this, 6, { props: true }); return; }
    this.stateT += dt; this.cooldown = Math.max(0, this.cooldown - dt); this.hitFlash = Math.max(0, this.hitFlash - dt * 5); this.swing = Math.max(0, this.swing - dt * 5); this.recoil = Math.max(0, this.recoil - dt * 9); this.stun = Math.max(0, this.stun - dt);
    if (this.vehicle) { this.x = this.vehicle.x; this.y = this.vehicle.y; this.angle = this.vehicle.angle; if (this.brain && this.brain.updateInVehicle) this.brain.updateInVehicle(this, dt, game); return; }
    if (this.brain) this.brain.update(this, dt, game);
    this.step(dt, game);
  }

  step(dt, game) {
    const it = this.intent, world = game.world;
    let mx = it.mx, my = it.my;
    if (this.stun > 0) { mx = my = 0; }
    const l = Math.hypot(mx, my); if (l > 1) { mx /= l; my /= l; }
    // dodge roll overrides control for its duration
    if (this.rollT > 0) {
      this.rollT -= dt; const s = PLAYER.roll * (this.rollT > 0.12 ? 1 : 0.5);
      this.vx = Math.cos(this.rollDir) * s; this.vy = Math.sin(this.rollDir) * s;
    } else {
      const sp = (it.run ? this.runSpeed : this.walkSpeed) * (this.armor > 0 ? 0.97 : 1);
      this.vx = damp(this.vx, mx * sp, 14, dt); this.vy = damp(this.vy, my * sp, 14, dt);
    }
    this.kx *= Math.exp(-7 * dt); this.ky *= Math.exp(-7 * dt);
    this.x += (this.vx + this.kx) * dt; this.y += (this.vy + this.ky) * dt;
    const hit = world.resolveCircle(this, this.r, { water: true });
    if (hit && this.rollT > 0 && hit.depth > 2) this.rollT = 0;
    // soft separation from neighbours
    if (game.entities) {
      const near = game.entities.near(this.x, this.y, 22, this._near || (this._near = []));
      for (const e of near) {
        if (e === this || e.kind !== 'ped' || e.dead) continue;
        const dx = this.x - e.x, dy = this.y - e.y, d = Math.hypot(dx, dy) || 1, m = this.r + e.r - 1;
        if (d < m) { const push = (m - d) * 0.5; this.x += (dx / d) * push; this.y += (dy / d) * push; }
      }
    }
    // facing
    const sp2 = Math.hypot(this.vx, this.vy);
    if (it.aim !== null && it.aim !== undefined) this.angle = dampAngle(this.angle, it.aim, 18, dt);
    else if (sp2 > 12) this.angle = dampAngle(this.angle, Math.atan2(this.vy, this.vx), 12, dt);
    this.walkPhase += sp2 * dt * 0.075;
  }

  /* ---------- combat state ---------- */
  damage(amount, src = null, opts = {}) {
    if (this.dead || amount <= 0 || this.godMode) return false;
    const g = this.game_ || null; void g;
    let a = amount;
    if (this.armor > 0) { const ab = Math.min(this.armor, a * 0.7); this.armor -= ab; a -= ab * 0.9; }
    this.hp -= a; this.hitFlash = 1; this.lastHitBy = src;
    if (opts.kx !== undefined) { this.kx += opts.kx; this.ky += opts.ky; }
    if (opts.stun) this.stun = Math.max(this.stun, opts.stun);
    if (this.brain && this.brain.onHit) this.brain.onHit(this, src, amount, opts);
    return this.hp <= 0;
  }
  heal(n) { this.hp = clamp(this.hp + n, 0, this.maxHp); }

  // Called by CombatSystem after damage() reports lethal.
  killed(game, src, opts = {}) {
    if (this.dead) return;
    this.dead = true; this.deadT = 0; this.hp = 0; this.vx = this.vy = 0; this.intent.fire = false;
    if (this.vehicle) game.vehicles.eject(this, true);
    if (this.brain && this.brain.onDeath) this.brain.onDeath(this, src, game);
    game.events.emit('pedDied', { ped: this, src, opts });
  }

  /* ---------- drawing ---------- */
  draw(g, time, cam, game) {
    if (this.vehicle) return;
    if (this.parachute > 0) { // drifting down after bailing out of an aircraft
      this.parachute -= 1 / 60; const k = Math.min(1, this.parachute / 1.6), lift = 50 * k;
      g.fillStyle = 'rgba(10,6,24,0.25)'; g.beginPath(); g.ellipse(this.x + 3, this.y + 4, 8, 5, 0, 0, 6.3); g.fill();
      g.save(); g.translate(this.x, this.y - lift); g.strokeStyle = INK_LINE; g.lineWidth = 1; for (const sx of [-14, 0, 14]) { g.beginPath(); g.moveTo(0, 0); g.lineTo(sx, -24); g.stroke(); }
      g.beginPath(); g.ellipse(0, -26, 20, 9, 0, Math.PI, 0); g.fillStyle = '#e23b2e'; g.fill(); g.fillStyle = '#f4f4f4'; g.fillRect(-6, -34, 12, 8); g.lineWidth = 1.6; g.strokeStyle = INK_LINE; g.beginPath(); g.ellipse(0, -26, 20, 9, 0, Math.PI, 0); g.stroke(); g.restore();
      if (this.parachute > 0.2) return;
    }
    const s = this.scale;
    if (this.dead) {
      const c = corpseSprite(this.look), S = PED_SPRITE_SIZE;
      g.save(); g.translate(this.x, this.y); g.rotate(this.angle); g.globalAlpha = clamp(1 - Math.max(0, this.deadT - (this.persistent ? 100 : 22)) / 6, 0, 1);
      g.drawImage(c, -S / 2, -S / 2, S, S); g.restore(); return;
    }
    if (this.role === 'player') { g.strokeStyle = 'rgba(255,255,255,0.32)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(this.x, this.y + 1, 12.5, 11, 0, 0, 6.3); g.stroke(); }
    // shadow
    g.fillStyle = 'rgba(10,6,24,0.28)'; g.beginPath(); g.ellipse(this.x + 2.5, this.y + 3.5, 7.5 * s, 5 * s, 0, 0, 6.3); g.fill();
    const hold = this.vehicle ? 'none' : WEAPONS[this.weapon].hold;
    const spr = pedSprite(this.look, Math.floor(this.walkPhase) & 3, hold), S = PED_SPRITE_SIZE;
    g.save(); g.translate(this.x, this.y);
    if (this.rollT > 0) { g.rotate(this.angle + (1 - this.rollT / 0.34) * 12); g.scale(0.85, 0.85); } else g.rotate(this.angle);
    const rec = this.recoil * 3.5; g.translate(-rec, 0); g.scale(s, s);
    g.drawImage(spr, -S / 2, -S / 2, S, S);
    if (this.hitFlash > 0.05) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = this.hitFlash * 0.7; g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 8.5, 0, 6.3); g.fill(); }
    g.restore();
    if (this.swing > 0.05 && this.weaponDef.type === 'melee') this.drawSwing(g);
    if (this.boss && this.hp < this.maxHp) { // bosses show a health bar
      const w = 34, f = this.hp / this.maxHp;
      g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(this.x - w / 2 - 1, this.y - 22, w + 2, 6); g.fillStyle = '#ff4a3a'; g.fillRect(this.x - w / 2, this.y - 21, w * f, 4);
    }
    void game; void time; void wrapAngle;
  }
  drawSwing(g) {
    const d = this.weaponDef, a = this.angle, t = 1 - this.swing;
    g.save(); g.translate(this.x, this.y); g.rotate(a); g.globalAlpha = this.swing * 0.8;
    g.strokeStyle = this.weapon === 'cleaver' ? '#e8f4ff' : '#ffe6c0'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, d.range * 0.75, -d.arc * 0.5 + t * 0.4, d.arc * 0.5 - t * 0.4); g.stroke(); g.restore();
  }
}
