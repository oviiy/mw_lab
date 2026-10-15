import { Entity } from '../../entities/entity.js';
import { resolvePos, roadSpotNear, freeSpotNear, pickShops } from './resolve.js';
import { makeGangMember } from '../turf.js';
import { RoadDriver } from '../traffic.js';
import { gangLook } from '../../entities/pedLooks.js';
import { gangBrain } from '../ai/gangBrain.js';
import { findPath, nearestNode } from '../../world/roadnet.js';
import { dist, fmtMoney } from '../../core/math.js';
import { rand } from '../../core/rng.js';
import { INK } from '../../render/style.js';

// Step library. A step = { start(m,s,game), update(m,s,dt,game)→done?, markers?, cleanup? }.
// `m` is the mission runtime, `s` the step definition (with scratch state in s.$).

const ring = (g, x, y, r, color, t) => {
  g.save(); g.lineWidth = 3; g.strokeStyle = color; g.globalAlpha = 0.9; g.setLineDash([9, 7]); g.lineDashOffset = -t * 24; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke(); g.setLineDash([]);
  g.globalAlpha = 0.18 + Math.sin(t * 4) * 0.05; g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.restore();
};

// A glowing point the player must walk up to and press E on.
export class MissionPoint extends Entity {
  constructor(x, y, label, onUse, color = '#ffd23a') { super('misc'); this.x = x; this.y = y; this.interact = label; this.onInteract = onUse; this.color = color; this.reach = 40; this.t = 0; this.used = false; }
  get sortY() { return this.y - 30; }
  update(dt) { this.t += dt; }
  draw(g, time) { if (this.used) return; ring(g, this.x, this.y, 22, this.color, time); g.save(); g.translate(this.x, this.y - 16 + Math.sin(time * 3) * 2); g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 8.5, 0, 6.283); g.fill(); g.fillStyle = this.color; g.beginPath(); g.arc(0, 0, 6.8, 0, 6.283); g.fill(); g.fillStyle = '#111'; g.font = 'bold 10px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 0.5); g.restore(); }
}

export const STEPS = {
  /* ---------- narrative ---------- */
  dialogue: {
    start(m, s, game) {
      s.$ = { done: false, lost: 0 };
      const old = game.screens.stack.find((q) => q.name === 'comic'); if (old) game.screens.close(old);   // never stack two scenes
      game.screens.open('comic', { scene: s.scene, onDone: () => { s.$.done = true; } });
    },
    // if the scene was closed without finishing (e.g. menus reset), don't wait forever
    update(m, s, dt, game) { if (!s.$.done && !game.screens.is('comic')) { s.$.lost += dt; if (s.$.lost > 0.4) s.$.done = true; } return s.$.done; },
  },
  wait: { start(m, s) { s.$ = { t: s.sec }; }, update(m, s, dt) { s.$.t -= dt; return s.$.t <= 0; } },
  say: { start(m, s, game) { game.hud.subtitle(s.text, (s.sec || 3.5) * 1000); s.$ = { t: 0.2 }; }, update(m, s, dt) { s.$.t -= dt; return s.$.t <= 0; } },
  toast: { start(m, s, game) { game.hud.toast(s.text, 3200, s.kind || ''); }, update() { return true; } },
  wanted: { start(m, s, game) { game.wanted.addHeat(s.heat ?? 6, 'mission'); }, update() { return true; } },
  custom: { start(m, s, game) { s.$ = {}; if (s.onStart) s.onStart(m, s, game); }, update(m, s, dt, game) { return s.run ? s.run(m, s, dt, game) : true; } },

  /* ---------- movement ---------- */
  goto: {
    start(m, s, game) { s.$ = { pos: resolvePos(game, s.to) }; m.objective(s.text); game.tipOnce('goto', 'Follow the <b style="color:#ffd23a">yellow arrow</b> at the screen edge. Targets are also on your radar (bottom-left).'); },
    update(m, s, dt, game) { const p = game.player, q = s.$.pos; if (!q || !Number.isFinite(q.x)) return true; if (s.vehicle && !p.vehicle) return false; if (s.key && p.vehicle !== m.veh[s.key]) return false; return dist(p.x, p.y, q.x, q.y) < (s.r || 60); },
    markers(m, s) { return s.$.pos ? [{ x: s.$.pos.x, y: s.$.pos.y, color: '#ffd23a', r: s.r || 60 }] : []; },
  },

  /* ---------- vehicles ---------- */
  spawnVehicle: {
    start(m, s, game) {
      const at = resolvePos(game, s.at), spot = s.water ? { ...at, angle: Math.PI / 2 } : roadSpotNear(game, at.x, at.y, s.radius || 240) || { ...at, angle: 0 };
      const v = game.vehicles.spawn(s.type || 'sedan', spot.x, spot.y, spot.angle + (s.flip ? Math.PI : 0), { parked: true, locked: s.locked ?? true, color: s.color, tag: 'mission' });
      m.veh[s.key] = v; m.ents.push(v); v.missionMark = s.mark !== false; if (s.hp) v.maxHp = v.hp = s.hp;
      if (s.guards) for (const gspec of s.guards) { for (let i = 0; i < gspec.count; i++) { const a = rand.range(0, 6.28), q = freeSpotNear(game, v.x + Math.cos(a) * 60, v.y + Math.sin(a) * 60, 50); const e = makeGangMember(game, gspec.faction, q.x, q.y, { rank: gspec.rank || 0, anchor: { x: v.x, y: v.y }, leash: 130, sight: gspec.sight || 330 }); m.ents.push(e); } }
    },
    update() { return true; },
  },
  enterVehicle: {
    start(m, s, game) { s.$ = {}; m.objective(s.text); const v = m.veh[s.key]; if (v && v.locked) game.tipOnce('hotwire', 'Locked car: walk up, press <kbd>E</kbd>, then tap the arrow keys in the order shown. Mess up and the alarm goes off.'); },
    update(m, s, dt, game) { const v = m.veh[s.key]; if (!v || v.dead || v.removed) { m.fail('The vehicle was destroyed'); return false; } return game.player.vehicle === v; },
    markers(m, s) { const v = m.veh[s.key]; return v && !v.dead ? [{ x: v.x, y: v.y, color: '#37e6ff', r: 40 }] : []; },
  },
  deliver: {
    start(m, s, game) { s.$ = { pos: resolvePos(game, s.to), t: s.time || 0, hp0: m.veh[s.key] ? m.veh[s.key].hp : 0 }; m.objective(s.text); },
    update(m, s, dt, game) {
      const v = m.veh[s.key], p = game.player, q = s.$.pos; if (!v || v.dead || v.removed) { m.fail('The vehicle was destroyed'); return false; }
      if (s.time) { s.$.t -= dt; m.timer = s.$.t; if (s.$.t <= 0) { m.fail('Out of time'); return false; } }
      if (p.vehicle !== v) { m.objective('Get back in the vehicle'); return false; } m.objective(s.text);
      if (dist(v.x, v.y, q.x, q.y) < (s.r || 70) && Math.abs(v.fw) < 240) {
        m.timer = null;
        if (s.consume) { game.vehicles.eject(p); v.removed = true; game.fx.floater(v.x, v.y - 20, 'DELIVERED', '#7ed957', true); }
        return true;
      } return false;
    },
    markers(m, s) { return s.$.pos ? [{ x: s.$.pos.x, y: s.$.pos.y, color: '#37e6ff', r: s.r || 70 }] : []; },
  },

  // Be aboard any vehicle of a class (tank / plane / heli / boat) — e.g. one stolen from a site.
  boardClass: {
    start(m, s, game) { m.objective(s.text); s.$ = { at: resolvePos(game, s.at) }; },
    update(m, s, dt, game) { const v = game.player.vehicle; return !!v && (v.cls === s.cls || (s.cls === 'air' && v.isAir)); },
    markers(m, s) { return s.$.at ? [{ x: s.$.at.x, y: s.$.at.y, color: '#37e6ff', r: 60 }] : []; },
  },
  // Destroy a group of vehicles (convoys, smuggler boats). Land convoys cruise the roads.
  destroy: {
    start(m, s, game) {
      s.$ = { list: [] }; m.objective(s.text);
      const at = resolvePos(game, s.at) || resolvePos(game, 'player'), w = game.world;
      for (let i = 0; i < s.count; i++) {
        let v;
        if (s.water) { // find open water around the anchor
          let spot = null; for (let r = 80; r < 900 && !spot; r += 40) for (let k = 0; k < 12 && !spot; k++) { const a = k / 12 * 6.283 + i, x = at.x + Math.cos(a) * r, y = at.y + Math.sin(a) * r; let ok = true; for (let dy = -40; dy <= 40; dy += 20) for (let dx = -40; dx <= 40; dx += 20) if (w.tileAtPx(x + dx, y + dy) !== 0) ok = false; if (ok && s.$.list.every((o) => dist(o.x, o.y, x, y) > 120)) spot = { x, y }; }
          spot = spot || at; v = game.vehicles.spawn(s.type, spot.x, spot.y, rand.range(0, 6.28), { parked: true, locked: true, tag: 'mission', color: s.color });
        } else {
          const pick = game.traffic.pickEdge(at.x, at.y, 0, 600) || { n: null }; if (!pick.n) continue;
          const drv = new RoadDriver(w, pick.n, pick.e); drv.cruise = s.speed || 150;
          v = game.vehicles.spawn(s.type, pick.x, pick.y, Math.atan2(pick.e.dy, pick.e.dx), { ai: drv, tag: 'mission', color: s.color });
          if (s.faction) { const d = game.vehicles.seatNew(v, { role: 'gang', faction: s.faction, look: gangLook(s.faction), hp: 80, weapon: 'smg', hostile: true, brain: gangBrain }); d.data.sight = 360; m.ents.push(d); }
        }
        if (s.hp) v.maxHp = v.hp = s.hp; v.missionMark = true; s.$.list.push(v); m.ents.push(v);
      }
      s.$.total = s.$.list.length;
    },
    update(m, s) { const left = s.$.list.filter((v) => !v.dead && !v.removed).length; if (s.text) m.objective(`${s.text} (${left} left)`); return left === 0; },
    markers(m, s) { return s.$.list.filter((v) => !v.dead && !v.removed).map((v) => ({ x: v.x, y: v.y, color: '#ff4a4a', r: 0 })); },
  },

  /* ---------- combat ---------- */
  kill: {
    start(m, s, game) {
      s.$ = { ents: [] }; m.objective(s.text);
      for (const spec of s.spawn) {
        let at = resolvePos(game, spec.at); if (!at || !Number.isFinite(at.x)) at = resolvePos(game, 'player');
        if (spec.offset) { const a = rand.range(0, 6.283); at = freeSpotNear(game, at.x + Math.cos(a) * spec.offset, at.y + Math.sin(a) * spec.offset, 60, true); }
        for (let i = 0; i < (spec.count || 1); i++) {
          const q = freeSpotNear(game, at.x, at.y, spec.spread ?? 90);
          const e = makeGangMember(game, spec.faction, q.x, q.y, { rank: spec.rank || 0, boss: !!spec.boss, weapon: spec.weapon, anchor: { x: at.x, y: at.y }, leash: spec.leash ?? 130, sight: spec.sight ?? 340 });
          if (spec.hp) { e.maxHp = e.hp = spec.hp; } if (spec.armor) e.armor = spec.armor; if (spec.name) e.name = spec.name; if (spec.aggro) { e.state = 'fight'; e.data.target = game.player; e.data.sight = 700; }
          e.data.mission = true; e.persistent = true; s.$.ents.push(e); m.ents.push(e);
        }
      }
      s.$.total = s.$.ents.length;
    },
    update(m, s, dt, game) { const left = s.$.ents.filter((e) => !e.dead && !e.removed).length; m.progress = `${s.$.total - left}/${s.$.total}`; if (s.text) m.objective(`${s.text} (${left} left)`); return left === 0; },
    markers(m, s) { return s.$.ents.filter((e) => !e.dead && !e.removed).slice(0, 10).map((e) => ({ x: e.x, y: e.y, color: '#ff4a4a', r: 0, small: true })); },
  },
  loseCops: {
    start(m, s, game) { m.objective(s.text || 'Lose the cops'); s.$ = { t: 0 }; if (s.heat && game.wantedLevel < 2) game.wanted.addHeat(s.heat, 'mission'); },
    update(m, s, dt, game) { s.$.t += dt; return s.$.t > 2 && game.wantedLevel === 0; },
  },
  chasers: {
    start(m, s, game) {
      const p = game.player;
      for (let i = 0; i < s.count; i++) {
        const pick = game.traffic.pickEdge(p.x, p.y, 420, 800); if (!pick) continue;
        const drv = new RoadDriver(game.world, pick.n, pick.e); drv.mode = 'chase'; drv.target = p; drv.aggressive = 0.9; drv.reckless = true;
        const v = game.vehicles.spawn('sedan', pick.x, pick.y, Math.atan2(pick.e.dy, pick.e.dx), { ai: drv, speed: 160, color: s.color }); v.tag = 'mission'; v.maxHp = v.hp = 150;
        const d = game.vehicles.seatNew(v, { role: 'gang', faction: s.faction, look: gangLook(s.faction), hp: 60, weapon: 'smg', hostile: true, brain: gangBrain }); d.data.accuracy = 1.8; d.data.sight = 400; m.ents.push(v, d);
      }
      if (s.text) game.hud.toast(s.text, 3000, 'bad');
    },
    update() { return true; },
  },
  turfWar: {
    start(m, s, game) { s.$ = { turf: game.world.turfs.find((t) => t.name === s.turf), won: false }; m.objective(`Raid the ${s.turf} hideout`); s.$.off = game.events.on('turfWon', (e) => { if (e.turf === s.$.turf) s.$.won = true; }); },
    update(m, s, dt, game) {
      const t = s.$.turf; if (t.owner === 'jade') return true; if (s.$.won) return true;
      if (!game.turf.war) { m.objective(`Raid the ${t.name} hideout`); const p = game.player; if (dist(p.x, p.y, t.hx, t.hy) < 90) game.turf.startWar(t); }
      return false;
    },
    markers(m, s) { const t = s.$.turf; return [{ x: t.hx, y: t.hy, color: '#ff4a4a', r: 90 }]; },
    cleanup(m, s) { if (s.$ && s.$.off) s.$.off(); },
  },

  /* ---------- interaction ---------- */
  collect: {
    start(m, s, game) {
      s.$ = { points: [], got: 0 };
      const spots = s.shops ? pickShops(game, s.shops.n, s.shops.turfs) : s.points.map((q) => resolvePos(game, q));
      spots.forEach((q, i) => {
        const pt = new MissionPoint(q.x, q.y, s.label || 'Collect', () => { if (pt.used) return; pt.used = true; pt.removed = true; s.$.got++; game.economy.addCash(s.amount || 100, true); game.fx.floater(pt.x, pt.y - 24, '+' + fmtMoney(s.amount || 100), '#7ed957', true); game.audio.pickup('cash'); if (s.onEach) s.onEach(s.$.got, m, game); });
        game.entities.add(pt); s.$.points.push(pt); m.ents.push(pt);
      });
      s.$.total = spots.length;
    },
    update(m, s) { m.objective(`${s.text} (${s.$.got}/${s.$.total})`); return s.$.got >= s.$.total; },
    markers(m, s) { return s.$.points.filter((p) => !p.used).map((p) => ({ x: p.x, y: p.y, color: '#ffd23a', r: 0 })); },
  },

  /* ---------- set pieces ---------- */
  fireworks: {
    start(m, s, game) { s.$ = { t: 0, next: 0, at: resolvePos(game, s.at) }; game.hud.banner('LANTERN NIGHT', 'The fireworks begin', '#ffcc33', 4200); game.audio.gong(); },
    update(m, s, dt, game) {
      s.$.t += dt; s.$.next -= dt; const q = s.$.at;
      if (s.$.next <= 0) { s.$.next = rand.range(0.18, 0.4); const bx = q.x + rand.range(-260, 260), by = q.y + rand.range(-200, 120) - 60, col = rand.pick(['#ff4a6e', '#ffd23a', '#37e6ff', '#7dff6a', '#c26bff']); burst(game, bx, by, col); }
      game.camera.addTrauma(0.004); return s.$.t > (s.sec || 8);
    },
  },
  race: {
    start(m, s, game) {
      // checkpoints sit on road nodes so player and rival routes both pass through them
      const cps = s.checkpoints.map((q) => { const r = resolvePos(game, q), n = nearestNode(game.world, r.x, r.y); return { x: n.x, y: n.y, node: n.id }; }); const p = game.player;
      // the grid: the player's race car (spawned by a previous step) or wherever the player stands
      const own = s.car && m.veh[s.car], g0 = own ? { x: own.x, y: own.y } : { x: p.x, y: p.y };
      s.$ = { cps, i: 0, rivals: [], order: [], finished: false, countdown: 4, started: false, grid: g0 };
      const first = nearestNode(game.world, cps[0].x, cps[0].y), startNode = nearestNode(game.world, g0.x, g0.y);
      let route = []; let prev = startNode.id;
      for (const c of cps) { const seg = findPath(game.world, prev, c.node); route = route.concat(seg.slice(1)); prev = c.node; }
      void first;
      const spot = own ? { x: own.x, y: own.y, angle: own.angle } : roadSpotNear(game, g0.x, g0.y, 300);
      for (let i = 0; i < (s.rivals || 3); i++) {
        const base = spot || { x: p.x, y: p.y, angle: 0 };
        const edge = startNode.edges.find((e) => e.to === route[0]) || startNode.edges[0], drv = new RoadDriver(game.world, startNode, edge); drv.mode = 'race'; drv.route = [...route]; drv.reckless = true;
        const back = 64 * (i + 1), side = (i % 2 ? 1 : -1) * 6, v = game.vehicles.spawn('sports', base.x - Math.cos(base.angle) * back - Math.sin(base.angle) * side, base.y - Math.sin(base.angle) * back + Math.cos(base.angle) * side, base.angle, { color: ['#37e6ff', '#ffd23a', '#c26bff', '#7dff6a'][i], tag: 'mission' });
        v.ai = null; v.maxHp = v.hp = 160; v.crashMul = 0.25; const d = game.vehicles.seatNew(v, { role: 'civ', look: gangLook('tiger'), hp: 60 }); d.persistent = true; v.raceDrv = drv; v.cp = 0; drv.cruise = v.def.max; drv.skill = 0.94 + i * 0.03;
        s.$.rivals.push(v); m.ents.push(v, d);
      }
      m.objective('Get in a car and reach the start line'); game.hud.toast('Midnight Run: six checkpoints, three rivals', 4000);
    },
    update(m, s, dt, game) {
      const S = s.$, p = game.player;
      if (!S.started) {
        if (!p.vehicle || dist(p.x, p.y, S.grid.x, S.grid.y) > 140) { S.countdown = 4; m.objective(p.vehicle ? 'Drive to the starting grid' : 'Get in your race car at the starting grid'); return false; }
        S.countdown -= dt; m.objective(S.countdown > 0 ? `Race starts in ${Math.ceil(S.countdown)}` : 'GO!'); if (S.countdown > 0) { for (const v of S.rivals) v.controls.brake = 1; return false; }
        S.started = true; for (const v of S.rivals) { v.ai = v.raceDrv; v.controls.brake = 0; } game.audio.sting('win');
      }
      // rival progress
      for (const v of S.rivals) { const c = S.cps[v.cp]; if (c && dist(v.x, v.y, c.x, c.y) < 110) v.cp++; if (v.cp >= S.cps.length && !S.order.includes(v)) { S.order.push(v); } }
      // gentle rubber-banding keeps the pack honest
      for (const v of S.rivals) if (v.raceDrv) v.raceDrv.speedMul = (v.raceDrv.skill || 1) * (v.cp - S.i >= 2 ? 0.82 : S.i - v.cp >= 2 ? 1.08 : 1);
      const c = S.cps[S.i]; m.objective(`Checkpoint ${Math.min(S.i + 1, S.cps.length)}/${S.cps.length}  ·  position ${1 + S.rivals.filter((v) => v.cp > S.i || (v.cp === S.i && dist(v.x, v.y, c ? c.x : 0, c ? c.y : 0) < dist(p.x, p.y, c ? c.x : 0, c ? c.y : 0))).length}/${S.rivals.length + 1}`);
      if (c && p.vehicle && dist(p.x, p.y, c.x, c.y) < 90) { S.i++; game.audio.pickup('ammo'); game.fx.floater(c.x, c.y - 20, S.i >= S.cps.length ? 'FINISH!' : 'CHECKPOINT', '#37e6ff', true); }
      if (S.i >= S.cps.length) { const place = S.order.length + 1; if (place > 1 && s.mustWin) { m.fail(`You finished ${place}${place === 2 ? 'nd' : place === 3 ? 'rd' : 'th'}. Win the race!`); return false; } m.data.place = place; return true; }
      return false;
    },
    markers(m, s) { const S = s.$, out = []; if (!S.started) return [{ x: S.grid.x, y: S.grid.y, color: '#ffd23a', r: 80 }]; const c = S.cps[S.i], n = S.cps[S.i + 1]; if (c) out.push({ x: c.x, y: c.y, color: '#37e6ff', r: 90 }); if (n) out.push({ x: n.x, y: n.y, color: '#ffffff55', r: 60, faint: true }); return out; },
  },
};

function burst(game, x, y, color) {
  const n = 26, fx = game.fx; game.audio.noise(0.2, 2200, 0.2, 'bandpass', 1, [x, y]); fx.flash(x, y, 190, color, 0.35, 0.9);
  for (let i = 0; i < n; i++) { const a = (i / n) * 6.283, sp = rand.range(90, 210); fx.parts.push({ t: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand.range(0.7, 1.2), max: 1.2, a: 1 }); fx.parts.push({ t: 'fire', x, y, vx: Math.cos(a) * sp * 0.6, vy: Math.sin(a) * sp * 0.6, life: 0.9, max: 0.9, s0: 9, s1: 2, a: 0.8 }); }
}
void INK;
