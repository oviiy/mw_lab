import { MISSIONS, MISSION_BY_ID } from '../../data/missions.js';
import { STEPS } from './steps.js';
import { WEAPONS } from '../../data/weapons.js';
import { fmtMoney, clamp, pad2 } from '../../core/math.js';
import { INK } from '../../render/style.js';

// Runs one mission at a time: walks its step list, owns the objective text, markers,
// spawned entities and the pass/fail flow. Content lives in data/missions.js.
export class MissionSystem {
  constructor(game) {
    this.game = game; this.done = new Set(); this.active = null; this.cache = [];
    game.events.on('pedDied', (e) => { if (this.active && e.ped === game.player) this.fail(game.down && game.down.kind === 'busted' ? 'Busted' : 'You died'); });
    // the final job is gated on turf count: tell the player the moment it opens
    game.events.on('turfChanged', () => { for (const d of MISSIONS) if (d.needTurfs && !this.announced?.has(d.id) && this.state(d) === 'available') { (this.announced ||= new Set()).add(d.id); game.hud.toast(`${d.giver === 'wei' ? 'Uncle Wei' : 'Madam Lin'} is ready for you: ${d.title}`, 5000, 'good'); this.pointTo(d.giver); } });
  }

  /* ---------- queries ---------- */
  state(def) {
    if (this.done.has(def.id)) return 'done';
    if (this.active && this.active.def.id === def.id) return 'active';
    if (this.unlockAll) return 'available';
    if (!def.unlock.every((u) => this.done.has(u))) return 'locked';
    if (def.needTurfs && this.game.turf.owned().length < def.needTurfs) return 'locked';
    return 'available';
  }
  listFor(contact) { return MISSIONS.filter((m) => m.giver === contact).map((m) => ({ def: m, state: this.state(m) })); }
  allStates() { return MISSIONS.map((m) => ({ def: m, state: this.state(m) })); }
  lockReason(def) {
    const missing = def.unlock.filter((u) => !this.done.has(u)).map((u) => MISSION_BY_ID[u].title);
    const parts = []; if (missing.length) parts.push('Finish: ' + missing.join(', ')); if (def.needTurfs && this.game.turf.owned().length < def.needTurfs) parts.push(`Own ${def.needTurfs} turfs`);
    return parts.join(' · ');
  }

  /* ---------- lifecycle ---------- */
  start(id, retry = false) {
    const game = this.game, def = MISSION_BY_ID[id]; if (!def || this.active) return false;
    if (this.state(def) === 'locked') return false;
    const m = this.active = { def, i: -1, retry, veh: {}, ents: [], data: {}, objText: '', timer: null, game, progress: '', failed: false, t: 0, objective: (t) => { m.objText = t || ''; }, fail: (r) => this.fail(r) };
    game.hud.banner(def.title.toUpperCase(), 'Mission', '#ffd23a', 2600); game.audio.ui('ok'); this.retry = null;
    if (game.waypoint && game.waypoint.auto) game.waypoint = null;
    this.next(); return true;
  }
  next() {
    const m = this.active; if (!m) return; const game = this.game;
    if (m.step) { const h = STEPS[m.step.t]; if (h.cleanup) h.cleanup(m, m.step, game); }
    m.i++; m.timer = null; m.progress = '';
    if (m.i >= m.def.steps.length) return this.complete();
    const s = m.step = m.def.steps[m.i]; s.$ = undefined; m.objText = s.text || m.objText;
    if (m.retry && s.t === 'dialogue') return this.next();     // retries skip the cutscenes
    const h = STEPS[s.t]; if (!h) { console.warn('unknown step', s.t); return this.next(); }
    h.start(m, s, game);
  }
  complete() {
    const m = this.active, game = this.game, r = m.def.reward || {}; this.active = null;
    if (r.cash) game.economy.addCash(r.cash, true); if (r.weapon) game.economy.giveWeapon(r.weapon, r.ammo || 0);
    this.done.add(m.def.id); game.stats.jobs++; this.cleanup(m);
    game.hud.setObjective('');
    game.hud.banner('MISSION PASSED', `${m.def.title}  ·  ${fmtMoney(r.cash || 0)}${r.weapon ? '  ·  ' + WEAPONS[r.weapon].name : ''}`, '#7ed957', 4600); game.audio.sting('win');
    game.events.emit('missionPassed', { id: m.def.id });
    // announce what opened up
    const nxt = MISSIONS.filter((d) => this.state(d) === 'available' && d.unlock.includes(m.def.id));
    if (nxt.length) setTimeout(() => { game.hud.toast(`New mission: ${nxt.map((d) => `${d.title} (${d.giver === 'wei' ? 'Uncle Wei' : 'Madam Lin'})`).join(', ')}. Waypoint set.`, 5200, 'good'); this.pointTo(nxt[0].giver); }, 2400);
    const gated = MISSIONS.filter((d) => d.needTurfs && this.state(d) === 'locked' && d.unlock.every((u) => this.done.has(u)));
    for (const d of gated) setTimeout(() => game.hud.toast(`${d.title} needs ${d.needTurfs} turfs (you hold ${game.turf.owned().length}). Claim or raid a ⚑ hideout.`, 6000), 5200);
    if (m.def.final) game.events.emit('gameWon', {});
  }
  fail(reason) {
    const m = this.active; if (!m || m.failed) return; m.failed = true; const game = this.game; this.active = null; this.cleanup(m);
    const h = STEPS[m.step && m.step.t]; if (h && h.cleanup) h.cleanup(m, m.step, game);
    game.hud.setObjective(''); game.hud.banner('MISSION FAILED', `${reason || ''} · press R to retry`, '#e23b2e', 4200); game.audio.ui('bad');
    this.retry = { id: m.def.id, t: 9 };
    if (game.turf.war && m.step && m.step.t === 'turfWar') game.turf.endWar(false);
  }
  abandon() { if (this.active) this.fail('Abandoned'); }
  cleanup(m) {
    const game = this.game;
    for (const e of m.ents) { if (e.removed) continue; if (e.kind === 'vehicle') { if (game.player.vehicle === e) { e.tag = null; continue; } e.tag = null; if (e.dead || Math.hypot(e.x - game.player.x, e.y - game.player.y) > 500) e.removed = true; } else if (e.kind === 'ped') { if (e.dead) continue; e.persistent = false; if (Math.hypot(e.x - game.player.x, e.y - game.player.y) > 400 && !game.turf.war) e.removed = true; } else if (e.kind === 'misc') e.removed = true; }
  }

  // Put a waypoint on a contact (used after unlocks).
  pointTo(contact) { const p = this.game.world.pois.find((q) => q.contact === contact); if (p) this.game.waypoint = { x: p.x, y: p.y, auto: true }; }

  update(dt) {
    const game = this.game;
    if (this.retry) { // R shortly after failing restarts the mission, skipping cutscenes
      this.retry.t -= dt; if (game.down) this.retry.t = Math.max(this.retry.t, 2);
      if (this.retry.t <= 0) this.retry = null;
      else if (!game.down && game.state === 'play' && game.input.keyHit('KeyR')) { const id = this.retry.id; this.retry = null; this.start(id, true); }
    }
    // stumbling onto a contact with work available: a one-line nudge, nothing more
    if (!this.active) for (const poi of game.world.pois) if (poi.type === 'contact' && Math.hypot(poi.x - game.player.x, poi.y - game.player.y) < 190 && this.listFor(poi.contact).some((q) => q.state === 'available')) game.tipOnce('contact-' + poi.contact, `${poi.label} has work for you. Press <kbd>E</kbd> at the door.`);
    if (game.waypoint && game.waypoint.auto && Math.hypot(game.waypoint.x - game.player.x, game.waypoint.y - game.player.y) < 70) game.waypoint = null;
    const m = this.active; if (!m || m.failed) return;
    m.t += dt; const s = m.step, h = s && STEPS[s.t]; if (!h) return;
    if (h.update(m, s, dt, this.game)) this.next();
    if (this.active === m) { let txt = m.objText; if (m.timer != null && m.timer > 0) txt += `  ·  ${Math.floor(m.timer / 60)}:${pad2(Math.ceil(m.timer % 60) % 60)}`; if (!this.game.turf.war) this.game.hud.setObjective(txt); }
  }

  /* ---------- markers ---------- */
  markers() {
    const extra = [...this.game.sidejobs.markers(), ...this.game.events_.markers()];
    if (this.game.waypoint) extra.push({ x: this.game.waypoint.x, y: this.game.waypoint.y, color: '#ffffff', r: 40 });
    for (const t of this.game.world.turfs) if (t.underAttack) extra.push({ x: t.hx, y: t.hy, color: '#ff4a4a', r: 90 });
    const m = this.active; if (!m || !m.step) return extra;
    const h = STEPS[m.step.t]; return (h.markers && m.step.$ ? h.markers(m, m.step, this.game) : []).concat(extra);
  }
  drawWorld(g, cam) {
    const t = this.game.time, list = this.markers();
    for (const k of list) {
      if (k.small) { g.save(); g.translate(k.x, k.y - 20 + Math.sin(t * 5) * 1.5); g.fillStyle = INK; g.beginPath(); g.moveTo(-5, -4); g.lineTo(5, -4); g.lineTo(0, 4); g.closePath(); g.fill(); g.fillStyle = k.color; g.beginPath(); g.moveTo(-3.6, -3); g.lineTo(3.6, -3); g.lineTo(0, 2.6); g.closePath(); g.fill(); g.restore(); continue; }
      if (k.faint) continue;
      g.save(); g.lineWidth = 3; g.strokeStyle = k.color; g.globalAlpha = 0.95; g.setLineDash([10, 8]); g.lineDashOffset = -t * 26; g.beginPath(); g.arc(k.x, k.y, k.r || 40, 0, 6.283); g.stroke(); g.setLineDash([]);
      g.globalAlpha = 0.14 + Math.sin(t * 4) * 0.04; g.fillStyle = k.color; g.beginPath(); g.arc(k.x, k.y, k.r || 40, 0, 6.283); g.fill();
      g.globalAlpha = 1; g.translate(k.x, k.y - 40 + Math.sin(t * 4) * 4); g.fillStyle = INK; g.beginPath(); g.moveTo(-10, -8); g.lineTo(10, -8); g.lineTo(0, 8); g.closePath(); g.fill(); g.fillStyle = k.color; g.beginPath(); g.moveTo(-7, -5.5); g.lineTo(7, -5.5); g.lineTo(0, 5); g.closePath(); g.fill(); g.restore();
    }
    // screen-edge pointers
    g.save(); g.setTransform(cam.dpr, 0, 0, cam.dpr, 0, 0);
    for (const k of list) {
      if (k.small || k.faint) continue; const sx = cam.sx(k.x), sy = cam.sy(k.y), m = 48; if (sx > m && sx < cam.w - m && sy > m && sy < cam.h - m) continue;
      const cx = cam.w / 2, cy = cam.h / 2, dx = sx - cx, dy = sy - cy, kx = (cam.w / 2 - m) / Math.abs(dx || 1e-6), ky = (cam.h / 2 - m) / Math.abs(dy || 1e-6), kk = Math.min(kx, ky), px = cx + dx * kk, py = cy + dy * kk;
      g.save(); g.translate(px, py); g.save(); g.rotate(Math.atan2(dy, dx)); g.scale(1.35, 1.35); g.fillStyle = INK; g.beginPath(); g.moveTo(15, 0); g.lineTo(-11, -11); g.lineTo(-6, 0); g.lineTo(-11, 11); g.closePath(); g.fill(); g.fillStyle = k.color; g.beginPath(); g.moveTo(11, 0); g.lineTo(-8, -8); g.lineTo(-4, 0); g.lineTo(-8, 8); g.closePath(); g.fill(); g.restore();
      // distance label, pulled toward the screen centre so it never clips
      const meters = Math.round(Math.hypot(k.x - this.game.player.x, k.y - this.game.player.y) / 16), ox = -Math.cos(Math.atan2(dy, dx)) * 30, oy = -Math.sin(Math.atan2(dy, dx)) * 26;
      g.font = '900 12px "Arial Black", Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 3.5; g.strokeStyle = INK; g.strokeText(meters + 'm', ox, oy); g.fillStyle = k.color; g.fillText(meters + 'm', ox, oy); g.restore();
    }
    g.restore(); void clamp;
  }

  serialize() { return { done: [...this.done] }; }
  restore(d) { if (d) this.done = new Set(d.done || []); }
}
