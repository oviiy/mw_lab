// Open Outcry — boot, loop, input, and the pit that reacts to the game.
import * as THREE from 'three';
import { Outcry } from './outcry.js';
import { Pit, PLAYER_ANGLE } from './pit.js';
import { Crowd, Trader } from './traders.js';
import { Effects, groundY } from './effects.js';
import { Audio } from './audio.js';
import { Hud } from './hud.js';
import { qualityPreset, FrameGovernor } from './quality.js';
import { createPostFX } from './postfx.js';
import { intentOf, FIRMS } from './market/agents.js';
import { PREV_SETTLE } from './market/calibration.js';
import { Rng, damp, fmtMoney, clamp } from './util.js';
import { DOW_PREV } from './outcry.js';

const params = new URLSearchParams(location.search);
const seed = params.has('seed') ? Number(params.get('seed')) : (Math.random() * 1e6) | 0;
const SPEED = Number(params.get('speed') || 1);
const AUTOPLAY = params.has('autoplay');
const $ = (id) => document.getElementById(id);

// ── Renderer & scene ────────────────────────────────────────────────────────────
const preset = qualityPreset();
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = preset.shadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('app').appendChild(renderer.domElement);
const governor = new FrameGovernor(renderer, preset);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x241d16);
scene.fog = new THREE.Fog(0x2a2118, 30, 75);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 120);
camera.rotation.order = 'YXZ';
scene.add(camera);
const fx = createPostFX(renderer, scene, camera, preset);

// You stand on the top step at the edge of the pit, looking across it at the big board.
const EYE = new THREE.Vector3(Math.cos(PLAYER_ANGLE) * 10.3, 1.85, Math.sin(PLAYER_ANGLE) * 10.3); // on the floor at the rim, in the crush
camera.position.copy(EYE);

const game = new Outcry(seed);
const pit = new Pit(scene, preset);
const crowd = new Crowd(scene, game.sim, new Rng(seed ^ 0xc0de), { people: preset.people });
// If the machine still can't keep up at the lowest resolution: thin the crowd, then drop shadows.
governor.onSlow = (n) => {
  if (n === 1) crowd.lite?.setDensity(0.7);
  if (n === 2) { renderer.shadowMap.enabled = false; scene.traverse((o) => { if (o.isLight) o.castShadow = false; }); }
  if (n === 3) crowd.lite?.setDensity(0.45);
};
const effects = new Effects(scene);
const audio = new Audio();
effects.scatter(60);

// Seven traders right in front of you who shout the deals.
// A row across your view: [sideways offset, distance] from where you stand.
const SLOT_SPOTS = [[-3.0, 4.4], [-2.0, 3.4], [-1.0, 4.4], [0, 3.4], [1.0, 4.4], [2.0, 3.4], [3.0, 4.4]];
const slots = SLOT_SPOTS.map(([sx, depth], i) => {
  const x = EYE.x + sx, z = EYE.z - depth;
  const tr = new Trader({ rng: new Rng(700 + i + seed), jacket: FIRMS[(i * 3 + seed) % FIRMS.length].color });
  tr.place(x, groundY(x, z), z, Math.atan2(EYE.x - x, EYE.z - z));
  tr.up = 0;
  scene.add(tr.root);
  return tr;
});
for (const tr of crowd.traders) if (tr.tag) { tr.tag.visible = false; tr.tag = null; }

const hud = new Hud((id, el) => takeDeal(id, el));

// ── State ───────────────────────────────────────────────────────────────────────
let state = 'menu';
let elapsed = 0;
let guided = false;
let dumpHold = 0;
let boardT = 0, lastPrintPx = game.mark, lastTick = 0, shoveT = 2, phaseId = null;
let mx = 0.5, my = 0.5;
let botT = 0;
let blackout = 0, flickerT = 0, power = 1, paperT = 0;
const keys = new Set();
const _v = new THREE.Vector3();

const best = (() => { try { return JSON.parse(localStorage.getItem('oo.best')); } catch { return null; } })();
$('startmeta').textContent = `Day #${seed}${best ? ` · Best ${best.pnl >= 0 ? '+' : '−'}${fmtMoney(Math.abs(best.pnl))} (${best.grade})` : ''}`;
const firstTime = (() => { try { return !localStorage.getItem('oo.played'); } catch { return true; } })();
$('go2').textContent = firstTime ? 'SKIP INTRO' : 'PLAY WITH INTRO';

function start(withGuide) {
  if (state !== 'menu') return;
  state = 'playing';
  document.body.classList.add('playing');
  $('start').hidden = true;
  audio.start();
  if (withGuide) {
    guided = true;
    game.guide = 'buy';
    hud.prompt(`<b>A trader wants to sell you 5 contracts below the board price.</b><br>That's a good deal. <span class="g">Click the green BUY bubble.</span>`);
  } else bell();
  try { localStorage.setItem('oo.played', '1'); } catch { /* private mode */ }
}
function bell() {
  audio.bell(3.2);
  hud.banner('THE OPENING BELL', `FUTURES OPEN ${(PREV_SETTLE - game.mark).toFixed(2)} BELOW FRIDAY`, 'amber', 3.2);
}
$('go').addEventListener('click', () => start(firstTime));
$('go2').addEventListener('click', () => start(!firstTime));
$('resume').addEventListener('click', () => pause(false));
$('again').addEventListener('click', () => { location.search = ''; });
$('replay').addEventListener('click', () => { location.search = `?seed=${seed}`; });

function pause(on) {
  if (state === 'menu' || state === 'ended') return;
  state = on ? 'paused' : 'playing';
  $('pause').hidden = !on;
}

// ── Input: a free mouse cursor; click the bubbles ───────────────────────────────
addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; });
addEventListener('contextmenu', (e) => e.preventDefault());
addEventListener('keydown', (e) => {
  if (state === 'menu' && (e.code === 'Enter' || e.code === 'Space')) { start(firstTime); return; }
  if (e.code === 'KeyP' || e.code === 'Escape') { pause(state === 'playing'); return; }
  if (e.code === 'KeyM') { audio.setMuted(!audio.muted); return; }
  if (e.code === 'Space') e.preventDefault();
  if (game.offer && /^Digit[1-3]$/.test(e.code)) { pickAugment(Number(e.code.slice(5)) - 1); return; }
  keys.add(e.code);
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => { keys.clear(); if (state === 'playing' && !AUTOPLAY) pause(true); });
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); fx.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

function screenOf(tr, out) {
  _v.set(0, 2.25 * tr.scale, 0);
  tr.root.localToWorld(_v);
  _v.y += (1 - tr.up) * 0.18; // anchor to standing height so the bubble doesn't ride the rise
  _v.project(camera);
  out.x = (_v.x * 0.5 + 0.5) * innerWidth;
  out.y = (-_v.y * 0.5 + 0.5) * innerHeight;
  out.visible = _v.z < 1;
  return out;
}

function takeDeal(id, el) {
  if (state !== 'playing') return;
  const d = game.deals.find((x) => x.id === id);
  const rect = el.getBoundingClientRect();
  const r = game.take(id);
  if (!r.ok) {
    hud.float(r.reason, rect.left + rect.width / 2, rect.top, '#bbb');
    audio.miss();
    return;
  }
  const tr = d && slots[d.slot];
  if (tr) { tr.nod = 1; tr.chestWorld(_v); _v.y += 0.6; effects.burst(_v, 4, 0.8); }
  audio.fill(false);
  audio.shout(0.8, 0, 1.5);
  hud.float(`${d.side === 'buy' ? 'BOUGHT' : 'SOLD'} ${d.qty} @ ${d.px.toFixed(2)}`, rect.left + rect.width / 2, rect.top - 10, d.side === 'buy' ? '#3dff6e' : '#ff6a5a');
  if (r.realized) hud.float(`${r.realized >= 0 ? '+' : '−'}${fmtMoney(Math.abs(r.realized))}`, 440, 60, r.realized >= 0 ? '#ffd23a' : '#ff3b2f', true);
  if (r.bonus) hud.float(`🔥 STREAK BONUS +${fmtMoney(r.bonus)}`, innerWidth / 2, 120, '#ff8a2a', true);
  if (r.tip) hud.float(`★ TIP +${fmtMoney(r.tip)}`, rect.left + rect.width / 2, rect.top - 50, '#ffd23a');
  if (guided && game.guide === 'sell') hud.prompt(`<b>You own 5 contracts</b> (the tube on the left). If the price rises you make money.<br>Someone now wants to <b>buy above the board</b>. <span class="r">Click the red SELL bubble</span> to lock in the profit.`);
}

// ── Events from the game ────────────────────────────────────────────────────────
const WIRE = [
  [0, 'S&P FUTURES OPEN SHARPLY LOWER AFTER FRIDAY\'S RECORD DROP'],
  [6, 'LONDON SHARES IN HEAVY SELLING AS U.S. OPENS'],
  [16, 'NYSE: MANY BLUE CHIPS YET TO OPEN — ORDER IMBALANCES'],
  [45, 'PORTFOLIO INSURERS REPORTED SELLING INDEX FUTURES'],
  [95, 'BARGAIN HUNTERS APPEAR; FUTURES TRIM LOSSES'],
  [135, 'SHORT COVERING LIFTS THE PIT — RALLY ATTEMPT UNDER WAY'],
  [185, 'RALLY FADES. INSURANCE PROGRAMS SELLING AGAIN', true],
  [250, 'BUYERS THINNING OUT ACROSS THE FLOOR'],
  [275, 'NYSE ORDER-ROUTING SYSTEM OVERWHELMED — QUOTES RUNNING LATE', true],
  [295, 'REPORTS: OFFICIALS DISCUSS POSSIBILITY OF A TRADING HALT', true],
  [318, 'TICKER TAPE NOW MORE THAN AN HOUR LATE', true],
  [350, 'FUTURES AT DEEP DISCOUNT TO STOCKS — ARBITRAGE LINK BROKEN', true],
  [385, 'RECORD VOLUME. FLOOR IN CHAOS.', true],
  [400, 'CLOSING BELL MINUTES AWAY', true],
];
let wireIdx = 0;

const PHASE_SUB = {
  chop: 'SELL ABOVE THE BOARD · BUY BELOW IT · STAY SMALL',
  rally: 'A BOUNCE · SHORTS ARE COVERING',
  grind: 'SELLERS ARE BACK · BUYERS THINNING OUT',
  pocket: 'THE BIDS ARE VANISHING',
  freefall: 'NOBODY IS BUYING · WATCH FOR SQUEEZES',
};
function handleEvents() {
  for (const e of game.drainEvents()) {
    switch (e.type) {
      case 'print': {
        const t = e.t;
        pit.board.pushPrint(t.px, t.qty, Math.sign(t.px - lastPrintPx));
        if (Math.abs(t.px - lastPrintPx) >= 0.5 && elapsed - lastTick > 0.12) { audio.tick(t.px > lastPrintPx); lastTick = elapsed; }
        if (Math.abs(t.px - lastPrintPx) >= 1.5) pit.board.flash = 0.5;
        lastPrintPx = t.px;
        break;
      }
      case 'deal': audio.shout(0.6 + game.sim.panic * 0.4, (e.deal.slot - 3) / 4, 1.3); break;
      case 'guide-done':
        hud.prompt(`<b>That's the whole game.</b> Buy below the board, sell above it, keep the tube small.<br>The market is about to fall apart, so <b>the board is your enemy</b>. Good luck.`);
        setTimeout(() => hud.prompt(null), 5500);
        guided = false;
        bell();
        break;
      case 'riskdesk':
        hud.banner('RISK DESK DUMPED YOU', `HELD TOO LONG · ${e.realized >= 0 ? '+' : '−'}${fmtMoney(Math.abs(e.realized))}`, 'red', 2.6);
        audio.alarm();
        break;
      case 'streak':
        hud.pump();
        audio.chime(e.n, e.tier.level);
        if (e.n === 3 - (3 - game.mods.streakStart) || e.n === 6 - (3 - game.mods.streakStart) || e.n === 10 - (3 - game.mods.streakStart)) {
          hud.banner(`${e.tier.name}!`, `${e.n} WINNING CLOSES IN A ROW · DESK PAYS ${Math.round(e.tier.rate * game.mods.bonusMul * 100)}% BONUS`, 'amber', 2.2);
          hud.celebrate(e.tier.level >= 3); audio.fanfare('tier');
        }
        break;
      case 'streak-break': if (e.n >= 2) { hud.float(`STREAK LOST · ${e.n}×`, innerWidth / 2, 110, '#ff6a5a', true); audio.breakSound(); } break;
      case 'streak-saved': hud.float(`♥ SECOND WIND · STREAK SAVED`, innerWidth / 2, 110, '#ffc94a', true); break;
      case 'milestone': hud.banner(`+${fmtMoney(e.amount)}`, 'NEW HIGH FOR THE DAY', 'amber', 2.4); hud.celebrate(e.amount >= 250000); audio.fanfare('milestone'); break;
      case 'squeeze-warn': hud.banner('SQUEEZE INCOMING', 'SHORTS ARE ABOUT TO GET RUN OVER · 5 SECONDS', 'red', 3); audio.alarm(); break;
      case 'parachute': hud.banner('GOLDEN PARACHUTE', 'THE FIRM BAILED YOU OUT · BACK TO $200,000', 'amber', 3); hud.celebrate(true); audio.fanfare('milestone'); break;
      case 'offer':
        hud.prompt(null);
        hud.showOffer(e.offer, e.phase, (i) => pickAugment(i));
        audio.fanfare('pick');
        break;
      case 'dow': {
        const big = e.points >= 300;
        hud.news(`DOW DOWN ${e.points} POINTS AT ${e.dow.toFixed(2)}${e.points >= 500 ? ' — WORST DAY IN HISTORY' : ''}`, big);
        if (e.points >= 200) { crowd.surge?.(0.5 + e.points / 1000); camera.userData.kick = 0.05 + e.points / 10000; }
        if (e.points >= 500) { hud.banner('DOW −500', 'THE WORST DAY IN STOCK MARKET HISTORY', 'red', 3.2); pit.board.flash = 1.2; audio.alarm(); }
        break;
      }
      case 'end': endGame(e.card); break;
    }
  }
  // The wire tells the story of the day.
  while (wireIdx < WIRE.length && game.sim.t >= WIRE[wireIdx][0]) { hud.news(WIRE[wireIdx][1], WIRE[wireIdx][2]); wireIdx++; }
  const p = game.sim.phase;
  if (p.id !== phaseId) {
    if (phaseId && !guided && !game.offer) { hud.banner(p.name, PHASE_SUB[p.id] || '', p.id === 'pocket' || p.id === 'freefall' ? 'red' : 'amber', 2.8); audio.alarm(); }
    if (p.id === 'pocket' || p.id === 'freefall') { blackout = p.id === 'pocket' ? 0.9 : 0.5; crowd.surge?.(1); camera.userData.kick = 0.09; pit.board.flash = 1.5; audio.phoneOn = true; }
    phaseId = p.id;
  }
}

function pickAugment(i) {
  const a = game.pick(i);
  if (!a) return;
  hud.hideOffer();
  hud.augsBar(game.augments);
  hud.banner(`${a.icon} ${a.name.toUpperCase()}`, game.sim.phase.name + ' · ' + (PHASE_SUB[game.sim.phase.id] || ''), a.tier === 'prismatic' ? 'amber' : 'amber', 2.6);
  hud.celebrate(a.tier === 'prismatic');
  audio.fanfare(a.tier === 'silver' ? 'pick' : 'tier');
}

function endGame(card) {
  state = 'ended';
  hud.prompt(null);
  hud.bubblesUpdate([]);
  if (!card.busted) { audio.bell(4); hud.banner('CLOSING BELL', '', 'amber', 3); }
  else hud.banner('CLOSED OUT', 'THE CLERK TOOK YOUR BADGE', 'red', 3);
  let prev = null;
  try { prev = JSON.parse(localStorage.getItem('oo.best')); if (!prev || card.pnl > prev.pnl) localStorage.setItem('oo.best', JSON.stringify({ pnl: card.pnl, grade: card.grade })); } catch { /* private mode */ }
  audio.phoneOn = false;
  setTimeout(() => hud.showPaper(card, () => hud.showEnd(card, prev && prev.pnl > card.pnl ? prev : { pnl: card.pnl, grade: card.grade })), 2400);
}

// ── People ──────────────────────────────────────────────────────────────────────
function updatePeople(dt) {
  const panic = game.sim.panic;
  for (const tr of crowd.traders) if (tr.root.visible) tr.update(dt, elapsed, { intent: intentOf(game.sim.agents[tr.agentId], game.sim), looking: false, panic });
  for (const tr of crowd.fillers) {
    if (!tr.root.visible) continue;
    if (elapsed > tr.fakeAt) {
      tr.fakeAt = elapsed + 1.5 + Math.random() * 4;
      const r = Math.random();
      tr.fake = r < 0.35 * (0.5 + panic) ? { kind: 'take', bid: r < 0.15 ? {} : null, ask: r >= 0.15 ? {} : null, urgency: Math.random() * (0.4 + panic * 0.6) } : null;
    }
    tr.update(dt, elapsed, { intent: tr.fake, looking: false, panic });
  }
  for (const tr of crowd.extras) {
    tr.update(dt, elapsed, { intent: null, looking: false, panic: panic * 0.6 });
    if (tr.phoneArm) { tr.arms[1].shoulder.rotation.x = -2.2; tr.arms[1].elbow.rotation.x = -2.3; tr.arms[1].shoulder.rotation.z = 0.6; }
  }
  // Shouters: crouched in the crowd until they have a deal for you, then up, arm raised, facing you.
  const bySlot = new Map(game.deals.map((d) => [d.slot, d]));
  slots.forEach((tr, i) => {
    const d = bySlot.get(i);
    tr.up = damp(tr.up, d ? 1 : 0, 10, dt);
    const intent = d ? { kind: 'take', bid: d.side === 'sell' ? {} : null, ask: d.side === 'buy' ? {} : null, urgency: 0.5 + panic * 0.5 } : null;
    tr.update(dt, elapsed, { intent, looking: !!d, toPlayer: { yaw: 0, pitch: 0.2 }, panic, targeted: false });
    tr.root.position.y -= (1 - tr.up) * 0.18; // idle shouters hunker down a little
    // Their hands glow in the deal's colour: green = you buy, red = you sell.
    if (d) tr.handMat.emissive.set(d.side === 'buy' ? 0x30ff70 : 0xff3a2a).multiplyScalar(1.4);
  });
}

// ── Autoplay bot (smoke tests): reads the board and trades with the move ───────
function autoplay(dt) {
  botT -= dt;
  if (botT > 0) return;
  botT = 0.6;
  if (game.offer) { pickAugment(Math.floor(Math.random() * 3)); return; }
  const move = game.mark - game.sim.priceAgo(12);
  const dir = move > 0.6 ? 'buy' : move < -0.6 ? 'sell' : null;
  for (const d of game.deals) {
    const after = Math.abs(game.pos + (d.side === 'buy' ? game.lot : -game.lot));
    const reduces = after < Math.abs(game.pos);
    if ((reduces && (game.heat > 0.5 || d.edge > 0.04)) || (dir === d.side && d.edge > -0.05 && after <= 3 * game.lot)) {
      const el = hud.bubbles.get(d.id);
      if (el) { takeDeal(d.id, el); break; }
    }
  }
}

// ── Loop ────────────────────────────────────────────────────────────────────────
let last = performance.now();
const _s = { x: 0, y: 0, visible: false };
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  elapsed += dt;
  governor.tick(dt);
  const sim = game.sim;
  const playing = state === 'playing';

  if (playing) {
    game.update(dt * SPEED);
    if (AUTOPLAY) autoplay(dt);
    if (keys.has('Space') && game.pos) {
      dumpHold += dt;
      if (dumpHold > 0.45) {
        const r = game.dump(); dumpHold = 0; keys.delete('Space');
        hud.float(`DUMPED · ${r >= 0 ? '+' : '−'}${fmtMoney(Math.abs(r))}`, innerWidth / 2, innerHeight * 0.45, r >= 0 ? '#ffd23a' : '#ff6a5a', true);
        audio.miss();
      }
    } else dumpHold = 0;
    handleEvents();
    shoveT -= dt * (0.3 + sim.panic * 2);
    if (shoveT <= 0) { shoveT = 1 + Math.random() * 2; if (sim.panic > 0.35) camera.userData.kick = 0.02 + sim.panic * 0.03; }
  }

  // Camera: fixed spot, drifts toward the cursor for a little parallax; jostled in the panic.
  const kick = (camera.userData.kick = Math.max(0, (camera.userData.kick || 0) - dt * 0.08));
  const yaw = -(mx - 0.5) * 0.32, pitch = -0.1 - (my - 0.5) * 0.12;
  camera.rotation.y = damp(camera.rotation.y, yaw, 3, dt) + (Math.random() - 0.5) * kick;
  camera.rotation.x = damp(camera.rotation.x, pitch, 3, dt) + (Math.random() - 0.5) * kick * 0.6;
  camera.position.set(EYE.x + Math.sin(elapsed * 0.7) * 0.03, EYE.y + Math.sin(elapsed * 1.3) * 0.02, EYE.z);

  // ── The crash, felt: lights brown out, alarms, the crowd heaves, paper flies ──
  const panic = playing ? sim.panic : 0;
  const crashing = playing && (sim.phase.id === 'pocket' || sim.phase.id === 'freefall');
  blackout = Math.max(0, blackout - dt);
  flickerT -= dt;
  if (flickerT <= 0) { flickerT = 0.05 + Math.random() * (crashing ? 0.35 : 2); power = crashing && Math.random() < 0.35 + panic * 0.3 ? 0.35 + Math.random() * 0.5 : 1; }
  const lvl = blackout > 0 ? (blackout > 0.6 ? 0.08 : 0.5) : power;
  if (pit.setPower) pit.setPower(lvl);
  else renderer.toneMappingExposure = 1.08 * (0.55 + 0.45 * lvl);
  pit.setAlarm?.(clamp((panic - 0.55) * 2.5, 0, 1));
  crowd.setPanic?.(panic);
  if (crashing) {
    paperT -= dt;
    if (paperT <= 0) {
      paperT = 0.25 / (0.3 + panic);
      _v.set((Math.random() - 0.5) * 14, 1.8 + Math.random(), EYE.z - 3 - Math.random() * 9);
      effects.burst(_v, 3 + Math.floor(panic * 6), 1.2);
    }
  }
  if (playing) hud.dow(game.dow ?? DOW_PREV, (game.dow ?? DOW_PREV) - DOW_PREV);
  hud.crawl(dt);

  updatePeople(dt);
  effects.update(dt);
  pit.update(dt, sim.t / 405, sim, playing ? sim.panic : 0);
  boardT -= dt;
  if (boardT <= 0) { pit.board.draw(sim, 0.16); boardT = 0.16; }

  if (state !== 'menu') {
    hud.update(dt, game);
    if (state === 'playing') hud.bubblesUpdate(game.deals.map((d) => ({ deal: d, screen: { ...screenOf(slots[d.slot], _s) } })));
  }
  audio.update(dt, playing ? sim.noise : 0.2, playing && game.heat > 0.7 ? 1 : 0, !playing);
  fx.setPanic(playing ? sim.panic : 0);
  fx.render(dt);
}
requestAnimationFrame(frame);

// Litter piles up with volume.
let litterVol = 0;
setInterval(() => {
  if (state !== 'playing') return;
  const v = game.sim.volume - litterVol;
  if (v > 150) { effects.scatter(Math.min(40, Math.floor(v / 150))); litterVol = game.sim.volume; }
}, 1000);

window.__tf = { game, crowd, slots, renderer, scene, start, hud, takeDeal };
if (AUTOPLAY) start(false);
