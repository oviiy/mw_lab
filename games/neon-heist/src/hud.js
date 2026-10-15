import { G } from './state.js';
import { WEAPONS } from './combat.js';
import { CAM_MODES } from './camera.js';
import { dist, TAU, R, B, N } from './util.js';
import { VD } from './viaduct.js';

const $ = (id) => document.getElementById(id);

export class Hud {
  constructor() {
    this.el = { money: $('money'), stars: $('stars'), wpn: $('wpn'), hp: $('hp'), carhp: $('carhp'), carbar: $('carbarw'), speed: $('speed'), mission: $('mission'), sub: $('sub'), hint: $('hint'), big: $('big'), vig: $('vig'), mini: $('mini'), clock: $('clock'), radio: $('radio'), cross: $('cross'), wasted: $('wastedFade'), stats: $('stats'), icon: $('wpnIcon') };
    this.ctx = this.el.mini.getContext('2d');
    this.queue = []; this.toastT = 0; this.bigT = 0; this.last = {};
  }
  hitMarker() { this.hitT = 0.12; }
  // red arc on the screen edge pointing at whoever shot you
  damageFrom(x, z) {
    const p = G.player, yaw = G.camRig.yaw, a = Math.atan2(z - p.z, x - p.x) - yaw, el = $('dmgdir');
    el.style.transform = `translate(-50%,-50%) rotate(${(a * 180) / Math.PI + 90}deg)`; el.style.opacity = 1; clearTimeout(this.dmgTO); this.dmgTO = setTimeout(() => (el.style.opacity = 0), 650);
  }
  toast(msg, secs = 2.4) { this.queue.push({ msg, secs }); if (this.queue.length > 4) this.queue.shift(); }
  big(text, secs = 3, color = '#c21') { const b = this.el.big; b.textContent = text; b.style.color = color; b.classList.add('show'); this.bigT = secs; }
  set(id, v) { if (this.last[id] !== v) { this.last[id] = v; this.el[id].textContent = v; } }

  update(dt) {
    const p = G.player, e = this.el;
    this.set('money', '$' + Math.floor(G.money).toLocaleString());
    let h = ''; for (let i = 0; i < 5; i++) h += `<b class="${i < G.wanted ? 'on' : ''}">★</b>`;
    if (this.last.stars !== h) { this.last.stars = h; e.stars.innerHTML = h; }
    e.stars.classList.toggle('flash', G.wanted > 0 && G.wantedT > 0.6); // flashing = they lost sight of you
    const w = WEAPONS[p.w]; this.set('wpn', p.car ? '' : `${w.name}${w.melee ? '' : '  ×' + p.ammo[p.w]}`);
    this.el.icon.style.display = p.car ? 'none' : 'block'; G.wheel.updateIcon();
    $('scope').classList.toggle('on', !!p.zoom && !p.car);
    e.hp.style.width = Math.max(0, p.hp) + '%';
    e.carbar.style.display = p.car ? 'block' : 'none';
    if (p.car) e.carhp.style.width = Math.max(0, (p.car.hp / p.car.def.hp) * 100) + '%';
    this.set('speed', p.car ? `${Math.round(Math.abs(p.car.fw) * 3.6)} km/h` : '');
    e.vig.style.opacity = p.hurtT > 0 ? p.hurtT * 1.6 : p.hp < 30 && !p.dead ? 0.5 : 0;
    e.cross.style.display = !p.dead && G.state === 'play' && !p.inside ? 'block' : 'none';
    e.cross.classList.toggle('hot', p.cool > 0);
    // mission text
    this.set('mission', G.missions.hudText());
    $('armor').style.width = Math.max(0, p.armor || 0) + '%'; $('armorbar').style.display = (p.armor || 0) > 0 ? 'block' : 'none';
    if (this.hitT > 0) { this.hitT -= dt; e.cross.classList.toggle('hit', this.hitT > 0); }
    let hint = '';
    if (!p.dead && G.state === 'play') {
      if (!p.car) {
        const c = p.nearestCar();
        if (c) hint = `[E] ${c.drv === 'civ' ? 'Hijack' : 'Enter'} ${c.def.n}`;
        else if (G.interact) hint = G.interact;
        else { const q = p.nearestPed(); if (q) hint = q.state === 'hands' ? '[E] Rob' : '[E] Talk'; }
      }
      else hint = '';
    }
    this.set('hint', hint);
    const tm = (G.sky.tod * 24 + 6) % 24;
    this.set('clock', `${String(Math.floor(tm)).padStart(2, '0')}:${String(Math.floor((tm % 1) * 6) * 10).padStart(2, '0')}`);
    // toasts
    if (this.toastT > 0) { this.toastT -= dt; if (this.toastT <= 0) e.sub.classList.remove('show'); }
    else if (this.queue.length) { const n = this.queue.shift(); e.sub.textContent = n.msg; e.sub.classList.add('show'); this.toastT = n.secs; }
    if (this.bigT > 0) { this.bigT -= dt; if (this.bigT <= 0 && !p.dead) e.big.classList.remove('show'); }
    e.wasted.style.opacity = p.dead ? Math.min(1, p.dt / 2.6) : 0;
    this.minimap();
  }

  fade(cb, hold = 0) { const f = $('fade'); f.style.opacity = 1; setTimeout(() => { cb(); setTimeout(() => { f.style.opacity = 0; }, 160 + hold); }, 380); }

  setRadio(label) { this.el.radio.textContent = '♫ ' + label; }

  minimap() {
    const g = this.ctx, p = G.player, S = G.city.mapScale, size = 170, c = size / 2, zoom = 1.25;
    const yaw = G.camRig.yaw, rot = -Math.PI / 2 - yaw;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, size, size);
    g.save(); g.beginPath(); g.arc(c, c, c, 0, TAU); g.clip();
    g.fillStyle = '#16171a'; g.fillRect(0, 0, size, size);
    g.translate(c, c); g.rotate(rot); g.scale(zoom, zoom);
    const px = (p.x + R / 2) * S, pz = (p.z + R / 2) * S; g.translate(-px, -pz);
    g.drawImage(G.city.mapCanvas, 0, 0);
    const blip = (x, z, col, r) => { g.fillStyle = col; g.beginPath(); g.arc((x + R / 2) * S, (z + R / 2) * S, r / zoom, 0, TAU); g.fill(); };
    const flash = Math.floor(G.time * 6) % 2;
    for (const car of G.traffic.cars) if (car.type === 'cop' && !car.dead && dist(car.x, car.z, p.x, p.z) < 160) blip(car.x, car.z, car.siren && flash ? '#ff3b3b' : '#4a88ff', 3);
    for (const q of G.peds.list) if (q.type === 'cop' && q.state !== 'dead') blip(q.x, q.z, '#4a88ff', 2.3);
    if (G.police.heli) blip(G.police.heli.x, G.police.heli.z, '#ff3b3b', 4.5);
    for (const it of G.pickups.items) if (it.t <= 0 && it.k === 'hp' && dist(it.x, it.z, p.x, p.z) < 120) blip(it.x, it.z, '#ffffff', 2);
    const mk = (x, z, col, star) => {
      let dx = (x - p.x) * S, dz = (z - p.z) * S; const d = Math.hypot(dx, dz), lim = (c - 10) / zoom;
      if (d > lim) { dx *= lim / d; dz *= lim / d; }
      g.fillStyle = col; g.strokeStyle = '#000'; g.lineWidth = 1.2 / zoom; g.beginPath();
      if (star) { for (let k = 0; k < 10; k++) { const r = (k % 2 ? 3.4 : 8) / zoom, a = (k / 10) * TAU - Math.PI / 2 - rot; g.lineTo(px + dx + Math.cos(a) * r, pz + dz + Math.sin(a) * r); } g.closePath(); } else g.arc(px + dx, pz + dz, 5.5 / zoom, 0, TAU);
      g.fill(); g.stroke();
    };
    // GPS: route along the road grid to the current objective
    const bl = G.missions.blips(), tgt = bl[0];
    this.routeT = (this.routeT || 0) - 1 / 60;
    if (tgt && (this.routeT <= 0 || !this.route || this.routeKey !== tgt.x + ',' + tgt.z)) { this.routeT = 0.5; this.routeKey = tgt.x + ',' + tgt.z; this.route = gpsRoute(p.car ? p.car.x : p.x, p.car ? p.car.z : p.z, p.car ? p.car.y : 0, tgt.x, tgt.z); }
    if (tgt && this.route && this.route.length > 1) {
      g.strokeStyle = tgt.c; g.globalAlpha = 0.85; g.lineWidth = 4.5 / zoom; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath();
      this.route.forEach((q, k) => (k ? g.lineTo : g.moveTo).call(g, (q[0] + R / 2) * S, (q[1] + R / 2) * S)); g.stroke(); g.globalAlpha = 1;
    }
    for (const b of bl) mk(b.x, b.z, b.c, b.star);
    g.restore();
    // upright POI icons (the map itself rotates with the camera)
    g.save(); g.beginPath(); g.arc(c, c, c - 2, 0, TAU); g.clip(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 9px Arial';
    const cr = Math.cos(rot), sr = Math.sin(rot);
    for (const q of G.city.icons) {
      const dx = (q.x - p.x) * S * zoom, dz = (q.z - p.z) * S * zoom, sx = c + dx * cr - dz * sr, sy = c + dx * sr + dz * cr;
      if ((sx - c) ** 2 + (sy - c) ** 2 > (c - 8) ** 2) continue;
      g.fillStyle = q.ic[0]; g.beginPath(); g.arc(sx, sy, 6.5, 0, TAU); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 1; g.stroke(); g.fillStyle = q.ic[1]; g.fillText(q.ic[2], sx, sy + 0.5);
    }
    g.restore();
    g.save(); g.translate(c, c); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5;
    g.rotate((p.car ? p.car.a : p.a) - yaw - Math.PI / 2); // map "up" = camera forward
    g.beginPath(); g.moveTo(8, 0); g.lineTo(-5, -5.5); g.lineTo(-2, 0); g.lineTo(-5, 5.5); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
}

/* ---------- GPS: Dijkstra over the junction lattice ---------- */
const RAMPS = () => [[VD.xa - 6, VD.zc], [VD.xd + 6, VD.zc], ...(VD.mid || [])];
function entries(x, z) { // junctions reachable from a point, with the road distance to each
  const i = Math.round(x / B), j = Math.round(z / B), out = [], ok = (a, b) => a >= 0 && b >= 0 && a <= N && b <= N;
  const onH = Math.abs(z - j * B) < 13, onV = Math.abs(x - i * B) < 13;
  if (onH) for (const ii of [Math.floor(x / B), Math.floor(x / B) + 1]) if (ok(ii, j)) out.push({ i: ii, j, d: Math.abs(x - ii * B) });
  if (onV) for (const jj of [Math.floor(z / B), Math.floor(z / B) + 1]) if (ok(i, jj)) out.push({ i, j: jj, d: Math.abs(z - jj * B) });
  if (!out.length) { const bi = Math.floor(x / B), bj = Math.floor(z / B); for (const a of [bi, bi + 1]) for (const b of [bj, bj + 1]) if (ok(a, b)) out.push({ i: a, j: b, d: Math.abs(x - a * B) + Math.abs(z - b * B) }); }
  return out;
}
function onDeck(x, z) { return Math.abs(z - VD.zc) < 9 && x > VD.xb && x < VD.xc; }
function nearestRamp(x, z) { return RAMPS().reduce((a, b) => (dist(a[0], a[1], x, z) < dist(b[0], b[1], x, z) ? a : b)); }
function gridRoute(sx, sz, tx, tz) {
  const M = N + 1, cost = new Float64Array(M * M).fill(Infinity), prev = new Int32Array(M * M).fill(-1), done = new Uint8Array(M * M);
  for (const e of entries(sx, sz)) { const k = e.j * M + e.i; if (e.d < cost[k]) cost[k] = e.d; }
  const goal = new Map(); for (const e of entries(tx, tz)) goal.set(e.j * M + e.i, e.d);
  let best = Infinity, bestK = -1;
  for (;;) {
    let k = -1, mc = Infinity; for (let q = 0; q < M * M; q++) if (!done[q] && cost[q] < mc) { mc = cost[q]; k = q; }
    if (k < 0 || mc >= best) break; done[k] = 1;
    if (goal.has(k) && mc + goal.get(k) < best) { best = mc + goal.get(k); bestK = k; }
    const i = k % M, j = (k / M) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= M || b >= M) continue; const q = b * M + a, nc = mc + B; if (nc < cost[q]) { cost[q] = nc; prev[q] = k; } }
  }
  const pts = [[tx, tz]]; for (let k = bestK; k >= 0; k = prev[k]) pts.push([(k % M) * B, ((k / M) | 0) * B]);
  pts.push([sx, sz]); return pts.reverse();
}
function gpsRoute(sx, sz, sy, tx, tz) {
  const pDeck = sy > 3, tDeck = onDeck(tx, tz);
  if (pDeck && tDeck) return [[sx, sz], [tx, tz]];
  if (pDeck) { const r = nearestRamp(sx, sz); return [[sx, sz], ...gridRoute(r[0], r[1], tx, tz)]; }
  if (tDeck) { const r = nearestRamp(tx, tz); return [...gridRoute(sx, sz, r[0], r[1]), [tx, tz]]; }
  return gridRoute(sx, sz, tx, tz);
}
