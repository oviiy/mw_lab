import { Entity } from '../entities/entity.js';
import { Projectile, segCircleT } from '../entities/projectile.js';
import { WEAPONS } from '../data/weapons.js';
import { isEnemy } from '../data/factions.js';
import { clamp, wrapAngle } from '../core/math.js';
import { rand } from '../core/rng.js';

// Everything that hurts: guns, melee, thrown items, explosions, fire.
export class CombatSystem {
  constructor(game) { this.game = game; this._near = []; }

  /* ---------- damage entry points ---------- */
  damagePed(ped, amt, src = null, opts = {}) {
    if (ped.dead) return false;
    const game = this.game, a = opts.angle ?? Math.atan2(opts.ky || 0, opts.kx || 0);
    const killed = ped.damage(amt, src, opts);
    game.fx.blood(ped.x, ped.y, a, opts.kind === 'fire' ? 0 : Math.min(8, 2 + amt / 8));
    game.events.emit('pedHurt', { ped, src, amount: amt, opts, killed });
    if (killed) { ped.killed(game, src, opts); if (opts.kind !== 'fire') game.fx.bloodPool(ped.x, ped.y); }
    if (src && src.role === 'player' && ped.role !== 'player') {
      game.audio.tone && game.audio.tone(killed ? 1500 : 2300, killed ? 0.07 : 0.03, killed ? 0.16 : 0.07, 'square');
      if (killed) { game.freeze(opts.kind === 'vehicle' ? 0.05 : 0.035); game.fx.ring(ped.x, ped.y, 34, 'rgba(255,240,200,'); game.events.emit('playerKill', { ped, opts }); }
    }
    return killed;
  }
  canHurt(src, target) {
    if (!src || src === target) return false;
    if (src.role === 'player') return true;
    if (target.role === 'player' && (src.faction === 'jade' || src.role === 'ally')) return false;   // your crew never shoots you
    if (src.role === 'civ') return true;
    if (target.role === 'player') return true;
    const sf = src.faction, tf = target.faction;
    if (sf === 'none' || tf === 'none') return !(src.role === 'cop' && target.role === 'cop') && !(src.role === 'swat' && (target.role === 'cop' || target.role === 'swat'));
    if ((src.role === 'cop' || src.role === 'swat') && (target.role === 'cop' || target.role === 'swat')) return false;
    return isEnemy(sf, tf) || src.role === 'cop';
  }

  /* ---------- firing ---------- */
  fire(ped) {
    const game = this.game, w = WEAPONS[ped.weapon];
    if (ped.cooldown > 0 || ped.stun > 0 || ped.rollT > 0 || ped.dead) return false;
    if (w.type === 'melee') return this.melee(ped);
    if (w.type === 'throw') return this.throwItem(ped);
    if (w.ammo && !ped.infiniteAmmo) {
      if ((ped.ammo[w.ammo] || 0) <= 0) { ped.cooldown = 0.3; if (ped.role === 'player') { game.audio.click(); game.hud.toast('Out of ammo'); } return false; }
      ped.ammo[w.ammo]--;
    }
    ped.cooldown = 1 / w.rate;
    const aim = ped.intent.aim ?? ped.angle, acc = (ped.data.accuracy ?? 1) * (ped.speedNow > 70 ? 1.35 : 1);
    const ca = Math.cos(aim), sa = Math.sin(aim), mx = ped.x + ca * (ped.r + 12) - sa * 3.4, my = ped.y + sa * (ped.r + 12) + ca * 3.4;
    for (let i = 0; i < w.pellets; i++) {
      const a = aim + (rand.next() + rand.next() - 1) * w.spread * acc, s = w.speed * rand.range(0.94, 1.04);
      game.entities.add(new Projectile({ type: w.proj || (w.pellets > 1 ? 'pellet' : 'bullet'), blast: w.blast || 0, x: mx, y: my, vx: Math.cos(a) * s, vy: Math.sin(a) * s, owner: ped, faction: ped.faction, dmg: w.dmg * (ped.data.dmgMul ?? 1), life: w.range / s, weapon: w.id, knock: w.dmg * 3, tint: ped.role === 'player' || ped.faction === 'jade' ? '#ffe9a0' : '#ff9a7a' }));
    }
    ped.recoil = 1; if (w.proj === 'flame') { game.fx.fire(mx + ca * 10, my + sa * 10, 0.9); } else game.fx.flash(mx, my, 70 + w.noise * 24, '#ffcf80', 0.07, 1);
    game.fx.spark(mx, my, aim, 2, 0.5, 120); game.fx.casing(ped.x, ped.y, aim);
    game.audio.shot(w.id, ped.x, ped.y);
    game.events.emit('noise', { x: ped.x, y: ped.y, r: 220 + w.noise * 260, src: ped, kind: 'gunshot', weapon: w.id });
    if (ped.role === 'player') { game.camera.addTrauma(0.05 * w.recoil + 0.03); const k = { pistol: 3, smg: 2, shotgun: 7, rifle: 3.5 }[w.id] || 3; game.camera.kick(-Math.cos(aim) * k, -Math.sin(aim) * k); }
    return true;
  }

  // Generic scripted shot (helicopters, turrets…).
  fireProjectile(owner, x, y, a, speed, dmg, life = 0.8) {
    const game = this.game;
    game.entities.add(new Projectile({ type: 'bullet', x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, owner, faction: owner.faction || 'none', dmg, life, weapon: 'rifle', knock: 40, tint: '#ff9a7a' }));
    game.audio.shot('rifle', x, y); game.events.emit('noise', { x, y, r: 500, src: owner, kind: 'gunshot' });
  }

  // Mounted weapons. slot 0 = primary (LMB), 1 = secondary (RMB / G).
  vehicleFire(v, slot, aim) {
    const game = this.game, d = v.driver, cls = v.cls; if (!d || v.dead) return false;
    const P = (o) => game.entities.add(new Projectile({ owner: d, faction: d.faction, knock: 60, tint: '#ffe9a0', weapon: 'rifle', ...o }));
    const lift = v.alt * 70, ca = Math.cos(aim), sa = Math.sin(aim);
    if (cls === 'tank') {
      if (slot === 0) { if (v.altCool > 0) return false; v.altCool = 1.1; v.recoilT = 0.18;
        const mx = v.x + ca * 46, my = v.y + sa * 46; P({ type: 'shell', x: mx, y: my, vx: ca * 760, vy: sa * 760, dmg: 200, life: 0.9, blast: 88 });
        game.fx.flash(mx, my, 160, '#ffcf80', 0.1, 1.4); game.fx.spark(mx, my, aim, 10, 1.6, 260); game.fx.dust(v.x, v.y, 6); game.audio.explosion(mx, my); game.camera.addTrauma(0.38); if (game.camera.kick) game.camera.kick(-ca * 9, -sa * 9);
        v.vx -= ca * 40; v.vy -= sa * 40; game.events.emit('noise', { x: v.x, y: v.y, r: 800, src: d, kind: 'gunshot' }); return true; }
      if (v.gunCool > 0) return false; v.gunCool = 0.09; const a = aim + (Math.random() - 0.5) * 0.08;
      P({ type: 'bullet', x: v.x + ca * 30, y: v.y + sa * 30, vx: Math.cos(a) * 1100, vy: Math.sin(a) * 1100, dmg: 14, life: 0.55 }); game.audio.shot('smg', v.x, v.y); game.fx.flash(v.x + ca * 30, v.y + sa * 30, 50, '#ffcf80', 0.05, 0.8);
      game.events.emit('noise', { x: v.x, y: v.y, r: 500, src: d, kind: 'gunshot' }); return true;
    }
    if (cls === 'heli' || cls === 'plane') {
      const fwd = cls === 'plane' ? v.angle : aim, fc = Math.cos(fwd), fs = Math.sin(fwd);
      if (slot === 0) { if (v.gunCool > 0) return false; v.gunCool = cls === 'plane' ? 0.08 : 0.07;
        const sp = 1150 + (cls === 'plane' ? Math.max(0, v.fw) : 0);
        for (const k of cls === 'plane' ? [-1, 1] : [0]) { const ox = v.x + fc * 30 - fs * k * 18, oy = v.y + fs * 30 + fc * k * 18, a = fwd + (Math.random() - 0.5) * 0.05;
          P({ type: 'bullet', x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg: 13, life: 0.6, air: v.alt > 0.3 }); game.fx.flash(ox, oy - lift, 46, '#ffcf80', 0.04, 0.7); }
        game.audio.shot('smg', v.x, v.y); game.events.emit('noise', { x: v.x, y: v.y, r: 600, src: d, kind: 'gunshot' }); return true; }
      if (v.altCool > 0) return false;
      if (cls === 'heli') { v.altCool = 0.55; for (const k of [-1, 1]) { const ox = v.x + fc * 20 - fs * k * 12, oy = v.y + fs * 20 + fc * k * 12; P({ type: 'rocket', x: ox, y: oy, vx: fc * 620, vy: fs * 620, dmg: 150, life: 1.1, blast: 76, air: v.alt > 0.3 }); } game.audio.shot('shotgun', v.x, v.y); return true; }
      if (v.alt < 0.3) return false;
      v.altCool = 0.45; P({ type: 'bomb', x: v.x, y: v.y, vx: v.vx * 0.8, vy: v.vy * 0.8, dmg: 180, life: 0.75, blast: 104 }); game.audio.swing(false, v.x, v.y); return true;
    }
    return false;
  }

  melee(ped) {
    const game = this.game, w = WEAPONS[ped.weapon], aim = ped.intent.aim ?? ped.angle;
    ped.cooldown = 1 / w.rate; ped.swing = 1;
    ped.data.combo = (ped.comboT > 0 ? (ped.data.combo || 0) + 1 : 0) % 3; ped.comboT = 0.8; ped.lastCombo = ped.data.combo;
    const mul = ped.weapon === 'fists' ? [1, 1, 1.7][ped.data.combo] : 1;
    const targets = game.entities.near(ped.x + Math.cos(aim) * w.range * 0.5, ped.y + Math.sin(aim) * w.range * 0.5, w.range + 14, this._near, (e) => e !== ped && e.kind === 'ped' && !e.dead && !e.vehicle);
    let hit = 0;
    for (const t of targets) {
      const dx = t.x - ped.x, dy = t.y - ped.y, d = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
      if (d > w.range + t.r || Math.abs(wrapAngle(ang - aim)) > w.arc / 2) continue;
      if (!this.canHurt(ped, t) && ped.role !== 'player') continue;
      const kb = w.knock * mul;
      this.damagePed(t, w.dmg * mul * (ped.data.dmgMul ?? 1), ped, { kind: 'melee', kx: Math.cos(ang) * kb, ky: Math.sin(ang) * kb, stun: mul > 1.5 ? 0.5 : 0.22, angle: ang });
      game.fx.spark(t.x, t.y, ang, 3, 1, 100); hit++;
      if (hit >= 3) break;
    }
    // props in reach (crates, bins…)
    if (game.props) for (const p of game.world.propsNear(ped.x + Math.cos(aim) * w.range * 0.6, ped.y + Math.sin(aim) * w.range * 0.6, w.range)) if (p.hp !== undefined || game.props.breakable(p)) game.props.damage(p, w.dmg * 0.8, ped);
    game.audio.swing(hit > 0, ped.x, ped.y);
    if (hit && ped.role === 'player') { game.camera.addTrauma(0.12 * mul); game.freeze(mul > 1.5 ? 0.08 : 0.045); }
    ped.intent.melee = false;
    game.events.emit('noise', { x: ped.x, y: ped.y, r: 130, src: ped, kind: 'melee' });
    return true;
  }

  throwItem(ped) {
    const game = this.game, w = WEAPONS[ped.weapon];
    if (!ped.infiniteAmmo && (ped.ammo[w.ammo] || 0) <= 0) { ped.cooldown = 0.3; return false; }
    if (!ped.infiniteAmmo) ped.ammo[w.ammo]--;
    ped.cooldown = 1 / w.rate; ped.swing = 1;
    const aim = ped.intent.aim ?? ped.angle, dist = clamp(ped.intent.throwDist ?? 260, 90, w.range), flight = 0.75, s = dist / flight;
    game.entities.add(new Projectile({ type: w.id === 'molotov' ? 'molotov' : 'grenade', x: ped.x + Math.cos(aim) * 12, y: ped.y + Math.sin(aim) * 12, vx: Math.cos(aim) * s * 1.18, vy: Math.sin(aim) * s * 1.18, owner: ped, faction: ped.faction, dmg: w.dmg, life: flight, fuse: w.fuse || 1.5, weapon: w.id }));
    game.audio.swing(false, ped.x, ped.y);
    game.events.emit('noise', { x: ped.x, y: ped.y, r: 160, src: ped, kind: 'throw' });
    return true;
  }

  molotovBurst(p) {
    const game = this.game; game.audio.glass(p.x, p.y);
    game.entities.add(new FireZone(p.x, p.y, 48, 7, p.owner));
    game.events.emit('noise', { x: p.x, y: p.y, r: 240, src: p.owner, kind: 'fire' });
  }

  /* ---------- bullets ---------- */
  bulletStep(p, x0, y0, x1, y1) {
    const game = this.game, world = game.world, owner = p.owner;
    const wall = p.air ? null : world.raycastSolid(x0, y0, x1, y1);
    let bestT = wall ? wall.t : 2, kind = wall ? 'wall' : null, target = null;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, rad = Math.hypot(x1 - x0, y1 - y0) / 2 + 26;
    const near = game.entities.near(mx, my, rad, this._near);
    for (const e of near) {
      if (e === owner || e.removed) continue;
      if (e.kind === 'ped') {
        if (e.dead || e.vehicle || !this.canHurt(owner, e)) continue;
        const t = segCircleT(x0, y0, x1, y1, e.x, e.y, e.r + 1.2); if (t >= 0 && t < bestT) { bestT = t; kind = 'ped'; target = e; }
      } else if (e.kind === 'vehicle') {
        if (e === owner?.vehicle || e.dead) continue;
        const ca = Math.cos(e.angle), sa = Math.sin(e.angle);
        for (const o of e.offs) { const t = segCircleT(x0, y0, x1, y1, e.x + ca * o, e.y + sa * o, e.rad + 1.5); if (t >= 0 && t < bestT) { bestT = t; kind = 'vehicle'; target = e; } }
      }
    }
    const heli = game.wanted && game.wanted.heli;
    if (heli && !heli.dead && owner && owner.role === 'player') { const t = segCircleT(x0, y0, x1, y1, heli.x, heli.y - 30, 24); if (t >= 0 && t < bestT) { bestT = t; kind = 'heli'; target = heli; } }
    if (game.props) { const t = game.props.bulletTest(x0, y0, x1, y1, bestT); if (t) { bestT = t.t; kind = 'prop'; target = t.prop; } }
    if (!kind) return false;
    const hx = x0 + (x1 - x0) * Math.min(bestT, 1), hy = y0 + (y1 - y0) * Math.min(bestT, 1), a = Math.atan2(p.vy, p.vx);
    if (p.type === 'flame') { // flames lick whatever they touch and leave little fires behind
      if (kind === 'ped') this.damagePed(target, p.dmg, owner, { kind: 'fire', angle: a }); else if (kind === 'vehicle') target.damage(p.dmg, owner, 'fire');
      if (Math.random() < 0.08) game.entities.add(new FireZone(hx, hy, 16, 1.6, owner)); p.x = hx; p.y = hy; return true;
    }
    if (kind === 'ped') {
      this.damagePed(target, p.dmg, owner, { kind: 'bullet', kx: Math.cos(a) * p.knock, ky: Math.sin(a) * p.knock, angle: a, weapon: p.weapon, stun: p.weapon === 'shotgun' ? 0.3 : 0 });
    } else if (kind === 'vehicle') {
      target.damage(p.dmg * 0.7, owner, 'bullet'); game.fx.spark(hx, hy, a + Math.PI, 4, 1.1, 170); game.audio.ping(hx, hy);
      if (target.driver && !target.driver.dead && rand.chance(0.18) && this.canHurt(owner, target.driver)) this.damagePed(target.driver, p.dmg * 0.8, owner, { kind: 'bullet', angle: a });
      if (target.ai && target.ai.onShotAt) target.ai.onShotAt(target, owner);
      game.events.emit('vehicleShot', { vehicle: target, src: owner });
    } else if (kind === 'heli') { target.damage(p.dmg * 0.6, owner); game.fx.spark(hx, hy, a + Math.PI, 4, 1.1, 170); game.audio.ping(hx, hy);
    } else if (kind === 'prop') { game.props.damage(target, p.dmg, owner); game.fx.spark(hx, hy, a + Math.PI, 3, 1, 140); }
    else { game.fx.spark(hx, hy, a + Math.PI, 3, 1.4, 150); game.fx.dust(hx, hy, 2); game.audio.ping(hx, hy); }
    if (owner && owner.role === 'player' && game.cheats && game.cheats.on.boom && !p.blast && p.type !== 'flame') this.explode(hx, hy, 46, 60, owner);
    p.x = hx; p.y = hy; return true;
  }

  /* ---------- explosions ---------- */
  explode(x, y, r, dmg, src = null, opts = {}) {
    const game = this.game; game.fx.explosion(x, y, r * 0.8); game.audio.explosion(x, y);
    const near = game.entities.near(x, y, r * 1.5 + 60, [], null);
    for (const e of near) {
      const d = Math.hypot(e.x - x, e.y - y); if (d > r + (e.r || 8)) continue;
      const f = clamp(1 - d / (r + (e.r || 8)), 0.05, 1), a = Math.atan2(e.y - y, e.x - x);
      if (e.kind === 'ped' && !e.dead) { if (e.vehicle) continue; this.damagePed(e, dmg * f * 1.2, src, { kind: 'explosion', kx: Math.cos(a) * 520 * f, ky: Math.sin(a) * 520 * f, stun: 0.9, angle: a }); }
      else if (e.kind === 'vehicle' && e !== opts.skipVehicle && !e.dead) { e.damage(dmg * f * 1.5, src, 'explosion'); e.vx += Math.cos(a) * 420 * f / e.mass; e.vy += Math.sin(a) * 420 * f / e.mass; }
    }
    if (game.props) game.props.explosion(x, y, r, dmg, src);
    game.events.emit('explosion', { x, y, r, src, opts });
    game.events.emit('noise', { x, y, r: 700, src, kind: 'explosion' });
  }
}

// A patch of burning fuel.
export class FireZone extends Entity {
  constructor(x, y, r, life, owner) { super('misc'); this.x = x; this.y = y; this.r = r; this.life = life; this.max = life; this.owner = owner; this.t = 0; this.zone = true; }
  get sortY() { return this.y - 40; }
  update(dt, game) {
    this.life -= dt; this.t += dt; if (this.life <= 0) { this.removed = true; return; }
    const k = Math.min(1, this.life / 1.2);
    if (Math.random() < dt * 40 * k) { const a = rand.range(0, 6.28), d = Math.sqrt(Math.random()) * this.r; game.fx.fire(this.x + Math.cos(a) * d, this.y + Math.sin(a) * d, 0.9); }
    if (Math.random() < dt * 6) game.fx.smoke(this.x + rand.range(-10, 10), this.y + rand.range(-10, 10), 0.3);
    this._tick = (this._tick || 0) + dt;
    if (this._tick > 0.25) {
      this._tick = 0;
      for (const e of game.entities.near(this.x, this.y, this.r + 10)) {
        if (e.kind === 'ped' && !e.dead && !e.vehicle) { game.combat.damagePed(e, 5, this.owner, { kind: 'fire' }); e.state = e.role === 'civ' ? 'flee' : e.state; }
        else if (e.kind === 'vehicle' && !e.dead) e.damage(6, this.owner, 'fire');
      }
    }
  }
  draw(g) { const k = Math.min(1, this.life / 1.5); g.save(); g.globalAlpha = 0.5 * k; const gr = g.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.r); gr.addColorStop(0, 'rgba(255,170,60,0.9)'); gr.addColorStop(1, 'rgba(255,60,20,0)'); g.fillStyle = gr; g.beginPath(); g.arc(this.x, this.y, this.r, 0, 6.3); g.fill(); g.restore(); }
}
