import * as THREE from 'three';
import { createWorld } from './world.js';
import { Board, RANKS, rankIndex, ISLE_TYPES } from './board.js';
import { buildTileMesh, buildLand, disposeTile, SEA_Y, landMat, waterMat, glowMat, shallowMat } from './tileMesh.js';
import { Life } from './life.js';
import * as journal from './journal.js';
import { CameraRig } from './camera.js';
import { Particles } from './particles.js';
import * as audio from './audio.js';
import * as ui from './ui.js';
import { toWorld, fromWorld, key, DIRS } from './hex.js';
import { dailyInfo, dailyByNumber, hashString } from './rng.js';
import { TERRAIN_INFO } from './tiles.js';

const $ = ui.$;
const canvas = $('scene');
const world = createWorld(canvas);
const { scene, camera, renderer } = world;
const rig = new CameraRig(camera);
const particles = new Particles(scene);
const daily = dailyInfo();
const touchMode = window.matchMedia('(pointer: coarse)').matches;
const params = new URLSearchParams(location.search);
const sharedIsle = params.has('isle') ? (Number(params.get('isle')) >>> 0) : null;
const sharedDay = Math.floor(Number(params.get('day')));
const vsScore = Math.max(0, Math.floor(Number(params.get('vs')) || 0)) || null;
// A link from a friend: a numbered free isle, or a past (or today's) daily isle.
const invite = sharedIsle != null
  ? { kind: 'free', seed: sharedIsle, label: `Isle ${sharedIsle}` }
  : sharedDay >= 1 && sharedDay <= daily.number
    ? { kind: 'daily', info: dailyByNumber(sharedDay), label: `Isle no. ${sharedDay}` }
    : null;

const rankOf = (score) => { const i = rankIndex(score); return { ...RANKS[i], next: RANKS[i + 1] }; };
const EVENT_TEXT = {
  puffins: 'Puffins have found your cliffs.',
  lighthouse: 'A lighthouse now guards the coast.',
  boats: 'Fishing boats have come to your waters.',
  whales: 'Whales are passing the island.',
  seals: 'Seals have hauled out on the skerries.',
  harbour: 'A pier is built, and the ferry calls.',
  aurora: 'After dark, the northern lights dance on the sea.',
};
const life = new Life(scene, particles);
const fmt = (n) => n.toLocaleString('en-US');

const islandGroup = new THREE.Group();
const slotGroup = new THREE.Group();
scene.add(islandGroup, slotGroup);

const S = {
  mode: 'title', // title | play | paused | over
  board: null,
  kind: 'daily',
  seed: 0,
  visualRot: 0, // counts every turn so the tile never spins the long way round
  hoverKey: null,
  ev: null,
  cells: new Map(),
  anims: [],
  flags: new Map(),
  tipShown: null,
  daily: daily, // the daily isle being played (today's, or one from a friend's link)
  vs: null, // score to beat, from a challenge link
  practice: false, // a daily that already has an official first run
  lowPlayed: false,
  lastStreak: 0,
  hintsUsed: 0,
  unlockedThisGame: [],
  guideMatched: 0, // matches made by the first guided placement, which step 2 points at
  tipAge: 0, // placements since the current contextual tip appeared
  target: null, // { score, friend } the score to beat this game: a friend's, or your own best
  beatTarget: false,
  demo: false, // started from "Watch a demo"
  assisted: false, // auto-play was used, so the game isn't kept
};
const rot = () => ((S.visualRot % 6) + 6) % 6;

// Timers scheduled during a game are dropped once that game is restarted or left.
let gen = 0;
function later(fn, ms) {
  const g = gen;
  setTimeout(() => { if (g === gen) fn(); }, ms);
}

// ---------------------------------------------------------------- tutorial

const tut = JSON.parse(localStorage.getItem('skerry.tut') || '{}');
const saveTut = () => localStorage.setItem('skerry.tut', JSON.stringify(tut));

function showTip(id, html) {
  if (tut[id] || S.tipShown) return false;
  S.tipShown = id;
  S.tipAge = 0;
  ui.coach(html);
  return true;
}
function finishTip(id) {
  if (!tut[id]) { tut[id] = 1; saveTut(); }
  if (S.tipShown === id) { S.tipShown = null; ui.hideCoach(); }
}
$('coachOk').addEventListener('click', () => {
  if (S.tipShown === 'guide') { finishGuide(); S.tipShown = null; ui.hideCoach(); later(nextTip, 400); return; }
  if (S.tipShown) finishTip(S.tipShown);
  nextTip();
});

// The first game is guided: a golden beacon shows where to go and each step explains one idea.
const GUIDE = [
  () => touchMode
    ? '<b>Step 1 of 4.</b> Tap the <b>golden light</b> to move your tile there, then tap it again to place it.'
    : '<b>Step 1 of 4.</b> Click the <b>golden light</b> to place your first tile.',
  () => S.guideMatched
    ? `<b>Step 2 of 4.</b> See the glowing green edge${S.guideMatched > 1 ? 's' : ''}? There the same land touches on both tiles, so it <b>matches</b> and scores 10. Now choose a spot yourself and look for <b>green bars</b> on the floating tile.`
    : '<b>Step 2 of 4.</b> No sides matched that time. Where the same land touches on both tiles, the side <b>matches</b> and scores 10. Choose a spot and look for <b>green bars</b> on the floating tile.',
  () => touchMode
    ? '<b>Step 3 of 4.</b> Your tile turns itself to fit each spot. To try another way round, use the <b>arrows</b> beside it.'
    : '<b>Step 3 of 4.</b> Your tile turns itself to fit each spot. To try another way round, press <kbd>R</kbd> or right-click.',
  () => `<b>Step 4 of 4.</b> Your tiles are limited and the game ends when they run out. Reach the next <b>rank</b> (top left) to win 2 more tiles. Stuck? Press <b>Hint</b>.`,
];

function guideStep() { return tut.guided ? -1 : Math.min(tut.step || 0, GUIDE.length - 1); }

// While learning, the HUD only shows what has been explained so far.
function syncLearning() {
  $('hud').dataset.learn = tut.guided ? 'done' : String(Math.min(tut.step || 0, GUIDE.length - 1));
}

function advanceTutorial(res) {
  const b = S.board;
  if (!tut.guided) {
    tut.step = (tut.step || 0) + 1;
    if (tut.step >= GUIDE.length) finishGuide();
    saveTut();
    syncLearning();
    S.tipShown = null;
    ui.hideCoach();
    return;
  }
  if (S.tipShown === 'quest' && res.cell.tile.quest) finishTip('quest');
  if (S.tipShown === 'water' && res.cell.tile.edges.includes('water')) finishTip('water');
  if (S.tipShown === 'perfect' && b.stats.perfect) finishTip('perfect');
  if (S.tipShown === 'low') finishTip('low');
  if (S.tipShown === 'hint') finishTip('hint');
  // a tip that has had its say steps aside, so it doesn't sit over the island for the rest of the game
  if (S.tipShown && ++S.tipAge >= 3) finishTip(S.tipShown);
}

function finishGuide() {
  if (tut.guided) return;
  tut.guided = 1;
  saveTut();
  syncLearning();
  // journal finds made while learning are shown once the guide is done
  S.unlockedThisGame.forEach((e, i) => later(() => { audio.sfx.achievement(); ui.achievement(e); }, 800 + i * 3400));
}

function nextTip() {
  const b = S.board;
  if (!b || S.mode !== 'play' || S.tipShown || S.assisted) return;
  const cur = b.current;
  const step = guideStep();
  if (step >= 0) {
    S.tipShown = 'guide';
    ui.coach(GUIDE[step](), step === GUIDE.length - 1);
    if (step === 0) showHint(false);
    return;
  }
  if (cur && cur.quest && !tut.quest) {
    showTip('quest', `This tile brings a <b>request</b>: “${TERRAIN_INFO[cur.quest.terrain].name} +${cur.quest.extra}”. Place it, then grow that ${TERRAIN_INFO[cur.quest.terrain].name.toLowerCase()} by ${cur.quest.extra} more tiles to win 3 tiles. Its flag shows your progress.`);
  } else if (cur && cur.edges.includes('water') && !tut.water) {
    showTip('water', 'Water must always meet water. Red marks show sides that can’t touch. The tile turns to a fit that works when you point at a spot.');
  } else if (b.stats.placed >= 7 && !b.stats.perfect && !tut.perfect) {
    showTip('perfect', 'Look for a gap with three or more neighbours. Match them all for a <b>perfect fit</b>, which wins an extra tile.');
  } else if (b.remaining <= 5 && !tut.low) {
    showTip('low', 'You’re running low. Meeting requests and reaching the next rank give you more tiles.');
  } else if (b.stats.placed >= 12 && !tut.hint && S.hintsUsed === 0) {
    showTip('hint', 'Not sure where to go? Press <b>Hint</b> and a golden light marks the best spot.');
  }
}

// ---------------------------------------------------------------- visuals

const ringGeo = new THREE.RingGeometry(0.8, 0.9, 6, 1).rotateX(-Math.PI / 2);
const discGeo = new THREE.CircleGeometry(0.8, 6).rotateX(-Math.PI / 2);
const ringMat = new THREE.MeshBasicMaterial({ color: '#fff4cf', transparent: true, opacity: 0.5, depthWrite: false, fog: false });
const ringHot = new THREE.MeshBasicMaterial({ color: '#fffbe9', transparent: true, opacity: 0.95, depthWrite: false, fog: false });
const ringBad = new THREE.MeshBasicMaterial({ color: '#ff8c7a', transparent: true, opacity: 0.95, depthWrite: false, fog: false });
const discMat = new THREE.MeshBasicMaterial({ color: '#fff7dc', transparent: true, opacity: 0.16, depthWrite: false, fog: false });
const SLOT_Y = SEA_Y + 0.24;
const slotMeshes = new Map();

function refreshSlots() {
  for (const m of slotMeshes.values()) slotGroup.remove(m);
  slotMeshes.clear();
  if (S.mode !== 'play' || !S.board) return;
  for (const s of S.board.frontier().values()) {
    const { x, z } = toWorld(s.q, s.r);
    const m = new THREE.Mesh(ringGeo, ringMat);
    m.position.set(x, SLOT_Y, z);
    m.renderOrder = 3;
    slotGroup.add(m);
    slotMeshes.set(s.k, m);
  }
  hoverDisc.visible = false;
}
const hoverDisc = new THREE.Mesh(discGeo, discMat);
hoverDisc.renderOrder = 3;
scene.add(hoverDisc);

function addCell(cell, { delay = 0, quiet = false, from = -4.6, dur = 0.8 } = {}) {
  const g = new THREE.Group();
  const { x, z } = toWorld(cell.q, cell.r);
  g.position.set(x, from, z);
  islandGroup.add(g);
  const v = { group: g, cell, body: null, mask: -1, splashed: false, landed: false };
  buildBody(v);
  S.cells.set(cell.k, v);
  S.anims.push({ v, t: -delay, dur, from, splashed: false, quiet });
  return v;
}

// A tile's land depends on which sides have neighbours, so it is rebuilt when that changes.
function buildBody(v) {
  const { q, r } = v.cell;
  // a settled tile keeps its cliff toward a neighbour that is still rising, so no gap opens
  const land = DIRS.map(([dq, dr]) => { const n = S.cells.get(key(q + dq, r + dr)); return !!n && (n.landed || !v.landed); });
  const mask = land.reduce((m, l, i) => m | (l ? 1 << i : 0), 0);
  if (mask === v.mask) return;
  v.mask = mask;
  if (v.body) { v.group.remove(v.body); disposeTile(v.body); }
  v.body = buildLand(v.cell, v.group.position.x, v.group.position.z, land);
  for (const f of v.body.userData.foam) f.visible = v.splashed;
  v.group.add(v.body);
  v.group.userData = v.body.userData;
}

function refreshFoam() {
  for (const v of S.cells.values()) buildBody(v);
}

function clearIsland() {
  gen++;
  for (const v of S.cells.values()) {
    islandGroup.remove(v.group);
    disposeTile(v.group);
  }
  S.cells.clear();
  S.anims.length = 0;
  releaseFlashes(true);
  for (const el of S.flags.values()) el.remove();
  S.flags.clear();
  for (const m of slotMeshes.values()) slotGroup.remove(m);
  slotMeshes.clear();
}

function islandBounds() {
  const c = new THREE.Vector3();
  let n = 0;
  for (const v of S.cells.values()) { const p = toWorld(v.cell.q, v.cell.r); c.x += p.x; c.z += p.z; n++; }
  if (n) c.divideScalar(n);
  let r = 1;
  for (const v of S.cells.values()) { const p = toWorld(v.cell.q, v.cell.r); r = Math.max(r, Math.hypot(p.x - c.x, p.z - c.z) + 1); }
  return { c, r };
}

function reframe(force = false) {
  const { c, r } = islandBounds();
  rig.frame(c, r, force);
  world.setFocus(c, r);
}

const easeOutBack = (k) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };

function stepAnims(dt) {
  for (let i = S.anims.length - 1; i >= 0; i--) {
    const a = S.anims[i];
    a.t += dt;
    if (a.t < 0) continue;
    const k = Math.min(1, a.t / a.dur);
    const y = a.from - a.from * easeOutBack(k);
    a.v.group.position.y = y;
    if (!a.splashed && y > SEA_Y - 0.6) {
      a.splashed = true;
      a.v.splashed = true;
      for (const f of a.v.group.userData.foam) f.visible = true;
      particles.splash(a.v.group.position.x, SEA_Y + 0.1, a.v.group.position.z);
      if (!a.quiet) audio.sfx.rise();
    }
    if (k >= 1) { a.v.group.position.y = 0; a.v.landed = true; S.anims.splice(i, 1); refreshFoam(); }
  }
}

// ---------------------------------------------------------------- ghost

const ghost = { root: new THREE.Group(), tile: null, tileId: -1, markers: [] };
scene.add(ghost.root);
ghost.root.visible = false;
// A bar along each side of the floating tile: green where it matches its neighbour, yellow where it doesn't, red where it can't touch.
const markGeo = new THREE.BoxGeometry(0.78, 0.04, 0.09);
const ghostLand = landMat.clone();
ghostLand.transparent = true;
ghostLand.opacity = 0.82;
const ghostWater = waterMat.clone();
ghostWater.transparent = true;
ghostWater.opacity = 0.82;
const MARK = { match: '#5fe07a', miss: '#f2c35c', conflict: '#ef4a3a' };
function edgeBar(i, y, mat) {
  const m = new THREE.Mesh(markGeo, mat);
  const a = ((i * 60 + 30) * Math.PI) / 180;
  m.position.set(Math.cos(a) * 0.79, y, Math.sin(a) * 0.79);
  m.rotation.y = -(a + Math.PI / 2);
  m.renderOrder = 10;
  return m;
}
for (let i = 0; i < 6; i++) {
  const m = edgeBar(i, 0.07, new THREE.MeshBasicMaterial({ color: '#fff', fog: false, depthTest: false, transparent: true, opacity: 0.95, toneMapped: false }));
  ghost.root.add(m);
  ghost.markers.push(m);
}
const ghostPos = new THREE.Vector3();

function syncGhostTile() {
  const cur = S.board && S.board.current;
  if (!cur) { ghost.root.visible = false; return; }
  if (ghost.tileId === cur.id) return;
  if (ghost.tile) { ghost.root.remove(ghost.tile); disposeTile(ghost.tile); }
  ghost.tile = buildTileMesh(cur, { short: true });
  ghost.tile.traverse((o) => {
    o.castShadow = false;
    if (o.material === landMat) o.material = ghostLand;
    else if (o.material === waterMat) o.material = ghostWater;
  });
  ghost.tile.rotation.y = (-S.visualRot * Math.PI) / 3;
  ghost.root.add(ghost.tile);
  ghost.tileId = cur.id;
}

// Turn the tile to its best fit for the hovered spot, preferring the smallest turn.
function snapRotation() {
  const b = S.board;
  if (!b || !b.current || !S.hoverKey) return;
  const s = b.frontier().get(S.hoverKey);
  if (!s) return;
  let best = 0, bestV = -Infinity;
  for (const d of [0, 1, -1, 2, -2, 3]) {
    const r = (((S.visualRot + d) % 6) + 6) % 6;
    const ev = b.evaluate(s.q, s.r, r);
    let v = -1e9;
    if (ev.valid) {
      // count a sealing bonus, and steer clear of shutting a request in when another way round fits
      const out = b.outcome(s.q, s.r, r);
      v = ev.points + ev.bonusTiles * 40 + out.sealed.reduce((a, c) => a + c.points, 0) - out.lost.length * 60;
    }
    if (v > bestV) { bestV = v; best = d; }
  }
  S.visualRot += best;
}

function setHover(k) {
  if (k === S.hoverKey) return;
  S.hoverKey = k;
  snapRotation();
  evaluateHover();
}

function evaluateHover() {
  const b = S.board;
  S.ev = null;
  const tag = $('ghostTag');
  for (const [k, m] of slotMeshes) m.material = ringMat;
  if (!b || b.over || !b.current || S.mode !== 'play' || !S.hoverKey || !b.frontier().has(S.hoverKey)) {
    ghost.root.visible = false;
    hoverDisc.visible = false;
    tag.hidden = true;
    canvas.classList.remove('can-place');
    $('btnPlace').disabled = true;
    return;
  }
  const s = b.frontier().get(S.hoverKey);
  const ev = (S.ev = b.evaluate(s.q, s.r, rot()));
  const { x, z } = toWorld(s.q, s.r);
  if (!ghost.root.visible) ghostPos.set(x, 0.55, z);
  ghost.root.visible = true;
  hoverDisc.visible = true;
  hoverDisc.position.set(x, SLOT_Y - 0.01, z);
  const ring = slotMeshes.get(S.hoverKey);
  if (ring) ring.material = ev.valid ? ringHot : ringBad;
  for (let i = 0; i < 6; i++) {
    const mk = ev.marks[i];
    ghost.markers[i].visible = !!mk;
    if (mk) ghost.markers[i].material.color.set(MARK[mk]);
  }
  tag.hidden = false;
  tag.className = '';
  let html;
  const sides = (n) => `${n} side${n === 1 ? '' : 's'}`;
  if (!ev.valid) { html = 'Water must touch water'; tag.classList.add('bad'); }
  else if (ev.perfect) { html = `All ${ev.n} sides match! +${ev.points}, +1 tile`; tag.classList.add('perfect'); }
  else if (ev.snug) html = `Both sides match! +${ev.points}`;
  else html = ev.m ? `${sides(ev.m)} of ${ev.n} match, +${ev.points}` : 'No sides match';
  if (ev.valid) {
    // what else this spot would do: seal an area for a bonus, or shut a request in before it's met
    const out = b.outcome(s.q, s.r, rot());
    const lost = new Set(out.lost.map((q) => q.id));
    for (const p of b.questPreview(s.q, s.r, rot())) {
      if (lost.has(p.quest.id)) continue;
      const done = p.size >= p.target;
      html += ` <span class="tq${done ? ' met' : ''}"><i style="background:${TERRAIN_INFO[p.quest.terrain].color}"></i>${done ? 'Request met' : `${p.size}/${p.target}`}</span>`;
    }
    for (const c of out.sealed) html += ` <span class="tq met">Seals ${TERRAIN_INFO[c.terrain].name.toLowerCase()} +${c.points}</span>`;
    for (const q of out.lost) html += ` <span class="tq lost"><i style="background:${TERRAIN_INFO[q.terrain].color}"></i>${q.own ? 'Request can’t grow here' : 'Closes off a request'}</span>`;
  }
  tag.innerHTML = html;
  canvas.classList.toggle('can-place', ev.valid);
  $('btnPlace').disabled = !ev.valid;
}

// ---------------------------------------------------------------- HUD

let dockDeg = null;
function renderDock() {
  const b = S.board;
  if (!b) return;
  ui.drawHex($('curSvg'), b.current, currentDeg());
  ui.drawHex($('nextSvg'), b.next, currentDeg());
  dockDeg = currentDeg();
  const badge = $('curBadge');
  badge.hidden = !(b.current && b.current.quest);
  if (b.current && b.current.quest) badge.textContent = `${TERRAIN_INFO[b.current.quest.terrain].name} +${b.current.quest.extra}`;
  const rem = $('remaining');
  rem.textContent = b.remaining;
  rem.classList.toggle('low', b.remaining <= 5);
  ui.animateNumber($('score'), b.score);
  $('scoreLive').textContent = `Score ${b.score}`;
  ui.renderQuests($('quests'), b);
}
const currentDeg = () => (rig.az * 180) / Math.PI + 60 * S.visualRot;

function turn(d) {
  if (S.mode !== 'play') return;
  S.visualRot += d;
  audio.sfx.rotate();
  evaluateHover();
  if (S.tipShown === 'turn') later(() => finishTip('turn'), 1200);
}

const _v = new THREE.Vector3();
function project(x, y, z) {
  _v.set(x, y, z).project(camera);
  return { x: (_v.x * 0.5 + 0.5) * window.innerWidth, y: (-_v.y * 0.5 + 0.5) * window.innerHeight, vis: _v.z < 1 };
}
function cellScreen(k, lift = 0.8) {
  const v = S.cells.get(k);
  if (!v) return null;
  return project(v.group.position.x, Math.max(0, v.group.position.y) + (v.group.userData.top || 0) + lift, v.group.position.z);
}

function updateFlags() {
  const b = S.board;
  if (!b || S.mode === 'title' || S.mode === 'over') return;
  for (const q of b.quests) {
    let el = S.flags.get(q.id);
    if (!el) {
      if (q.state !== 'active') continue;
      el = document.createElement('div');
      el.className = 'flag';
      $('labels').appendChild(el);
      S.flags.set(q.id, el);
    }
    if (q.state === 'active') {
      const p = b.questProgress(q);
      const txt = `<i style="background:${TERRAIN_INFO[q.terrain].color}"></i>${p.size}/${p.target}`;
      if (el.dataset.t !== txt) { el.innerHTML = txt; el.dataset.t = txt; }
    } else if (!el.dataset.final) {
      el.dataset.final = 1;
      el.classList.add(q.state);
      el.innerHTML = q.state === 'done' ? `+${b.questReward} tiles` : 'Closed off';
      later(() => { el.style.opacity = 0; }, 1800);
      later(() => { el.remove(); if (S.flags.get(q.id) === el) S.flags.delete(q.id); }, 2400);
    }
    const s = cellScreen(q.cellKey, 1.1);
    if (s) { el.style.left = s.x + 'px'; el.style.top = s.y + 'px'; el.style.display = s.vis ? '' : 'none'; }
  }
}

// Briefly light up the sides that just matched, so the rule is visible on the island itself.
// A held flash stays lit (gently pulsing) until the next placement, for the guide step that points at it.
const flashes = [];
function flashEdges(q, r, marks, hold = false) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: MARK.match, fog: false, depthTest: false, transparent: true, opacity: 0, toneMapped: false });
  for (let i = 0; i < 6; i++) if (marks[i] === 'match') g.add(edgeBar(i, 0, mat));
  if (!g.children.length) return;
  const { x, z } = toWorld(q, r);
  g.position.set(x, 0.12, z);
  // scale out a touch so the bar sits on the shared edge between the two tiles
  g.scale.setScalar(1.14);
  scene.add(g);
  flashes.push({ g, mat, t: 0, hold });
}
function releaseFlashes(drop = false) {
  for (const f of flashes) if (f.hold) { f.hold = false; f.t = drop ? 2 : 1.4; }
}
function stepFlashes(dt, t) {
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i];
    f.t += dt;
    if (f.hold && f.t > 1) { f.t = 1; f.mat.opacity = 0.75 + Math.sin(t * 3) * 0.25; continue; }
    f.mat.opacity = f.t < 0.35 ? 0 : Math.max(0, Math.min(1, (f.t - 0.35) * 6) * (1 - Math.max(0, f.t - 1.4) / 0.6));
    if (f.t >= 2) { scene.remove(f.g); f.mat.dispose(); flashes.splice(i, 1); }
  }
}

// ---------------------------------------------------------------- hint beacon, goals, ranks, journal

const beacon = new THREE.Mesh(
  new THREE.CylinderGeometry(0.12, 0.32, 2.6, 12, 1, true).translate(0, 1.4, 0),
  new THREE.MeshBasicMaterial({ color: '#ffcf4a', transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false })
);
const beaconRing = new THREE.Mesh(new THREE.RingGeometry(0.78, 0.96, 6, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffcf4a', transparent: true, depthWrite: false, fog: false }));
beacon.add(beaconRing);
beaconRing.position.y = SLOT_Y + 0.02 - (SEA_Y - 0.2);
beacon.visible = false;
beacon.renderOrder = 4;
scene.add(beacon);
let beaconKey = null;

function hideBeacon() { beacon.visible = false; beaconKey = null; }

// Mark the best spot with a golden light and turn the tile to suit it.
function showHint(fromPlayer, preview = false) {
  const b = S.board;
  if (!b || S.mode !== 'play' || !b.current) return;
  const m = b.bestMove();
  if (!m) return;
  if (fromPlayer) { S.hintsUsed++; if (S.tipShown === 'hint') finishTip('hint'); }
  const { x, z } = toWorld(m.q, m.r);
  beacon.position.set(x, SEA_Y - 0.2, z);
  beacon.visible = true;
  beaconKey = m.k;
  // on touch, preview the tile right there so a tap on Place finishes it
  if (touchMode || fromPlayer || preview) {
    S.hoverKey = m.k;
    S.visualRot += (((m.rot - rot()) % 6) + 6) % 6;
    if ((((m.rot - rot()) % 6) + 6) % 6 > 3) S.visualRot -= 6;
    evaluateHover();
  }
  const sp = project(x, 0, z);
  if (sp.x < 40 || sp.x > window.innerWidth - 40 || sp.y < 80 || sp.y > window.innerHeight - 150) {
    rig.goal.set(x, 0, z);
    rig.userMoved = true;
  }
}

function updateGoal() {
  const b = S.board;
  if (!b) return;
  const r = rankOf(b.score);
  $('rankName').textContent = r.name;
  if (r.next) {
    const k = (b.score - r.min) / (r.next.min - r.min);
    $('goalFill').style.width = Math.max(3, Math.min(100, k * 100)) + '%';
    $('goalText').textContent = `${fmt(r.next.min - b.score)} to ${r.next.name}, +2 tiles`;
  } else {
    $('goalFill').style.width = '100%';
    $('goalText').textContent = 'The highest rank. Keep building.';
  }
  const st = $('streak');
  st.hidden = b.streak < 1;
  if (b.streak >= 1) {
    st.innerHTML = `Streak ${b.streak} <span>match all sides again ×${(1 + 0.25 * Math.min(b.streak, b.streakMax)).toString()}</span>`;
    ui.bump(st);
  }
}

function lifeCtx() {
  const cells = new Map();
  for (const v of S.cells.values()) cells.set(v.cell.k, { q: v.cell.q, r: v.cell.r, top: v.group.userData.top || 0, coast: v.group.userData.coast });
  const { c, r } = islandBounds();
  return { cells, center: c, radius: r };
}

function celebrateRank(rank) {
  later(() => {
    const at = rank.event ? life.enable(rank.event, lifeCtx()) : null;
    if (at) particles.sparkle(at.x, at.y + 0.3, at.z, '#ffe9a8', 70);
    ui.banner(`Your island is now ${rank.phrase}`, `+2 tiles. ${EVENT_TEXT[rank.event] || ''}`);
  }, 700);
}

function unlocked(entry) {
  S.unlockedThisGame.push(entry);
  if (!tut.guided) return; // shown after the guide, to keep the first minutes calm
  later(() => { audio.sfx.achievement(); ui.achievement(entry); }, 1400);
}

function renderJournal() {
  const j = journal.load();
  const list = $('journalList');
  list.textContent = '';
  for (const e of journal.ENTRIES) {
    const li = document.createElement('li');
    li.className = j[e.id] ? 'got' : '';
    li.innerHTML = `<span class="ic">${j[e.id] ? e.icon : '·'}</span><span><b>${e.name}</b><small>${e.text}</small></span>`;
    list.appendChild(li);
  }
  const lt = journal.lifetime();
  $('journalSum').textContent = `${journal.unlockedCount()} of ${journal.ENTRIES.length} found. ${lt.games} island${lt.games === 1 ? '' : 's'} raised, ${fmt(lt.tiles)} tiles placed.`;
}

// ---------------------------------------------------------------- game flow

function tryPlace(k) {
  const b = S.board;
  if (S.mode !== 'play' || !b || b.over || !b.current || !k) return;
  const s = b.frontier().get(k);
  if (!s) return;
  const ev = b.evaluate(s.q, s.r, rot());
  if (!ev.valid) { audio.sfx.invalid(); ui.toast('Water must meet water. Try turning the tile.'); return; }
  const res = b.place(s.q, s.r, rot());
  if (!res) return;
  const v = addCell(res.cell, { from: -1.9, dur: 0.55 });
  hideBeacon();
  releaseFlashes();
  // the first guided placement keeps its match lit while step 2 explains it
  if (!tut.guided && !tut.step) S.guideMatched = ev.m;
  flashEdges(s.q, s.r, ev.marks, !tut.guided && !tut.step);
  audio.setGrowth(b.stats.placed);
  audio.sfx.placement({
    fit: res.perfect ? 'perfect' : res.snug ? 'snug' : res.m ? 'match' : 'none',
    streak: res.streak,
    questDone: res.questsDone.length > 0,
    closed: res.closed.length > 0,
    rankUp: res.rankUps.length > 0,
  });

  // One label per placement: the points, and underneath what earned them.
  const notes = [];
  if (res.perfect) notes.push('All sides match, +1 tile');
  else if (res.snug) notes.push('Both sides match');
  if (res.mult > 1) notes.push(`streak ×${res.mult}`);
  later(() => {
    const p = cellScreen(res.cell.k, 0.5);
    if (!p) return;
    if (res.points) ui.popAt(p.x, p.y, '+' + res.points, res.perfect || res.mult > 1 ? 'gold' : '', notes.join(', '));
    if (res.perfect) particles.sparkle(v.group.position.x, 0.2, v.group.position.z);
  }, 350);
  for (const c of res.closed) {
    later(() => {
      const p = cellScreen(c.cellKey, 1.2);
      if (p) ui.popAt(p.x, p.y - 30, '+' + c.points, 'gold', `${TERRAIN_INFO[c.terrain].name} sealed off`);
    }, 950);
    particles.sparkle(v.group.position.x, 0.3, v.group.position.z, TERRAIN_INFO[c.terrain].glint, 60);
  }
  for (const d of res.questsDone) {
    const qv = S.cells.get(d.quest.cellKey);
    if (qv) particles.sparkle(qv.group.position.x, 0.4, qv.group.position.z, '#bff0a6', 60);
    later(() => { const p = cellScreen(d.quest.cellKey, 1.6); if (p) ui.popAt(p.x, p.y, '+' + d.points, 'gold', 'Request met'); }, 600);
  }
  if (res.gained > 0) {
    later(() => {
      const r = $('remaining').getBoundingClientRect();
      ui.popAt(r.left + r.width / 2, r.top - 14, `+${res.gained} tile${res.gained > 1 ? 's' : ''}`, 'gold small');
      ui.bump($('remaining'));
    }, 650);
  }
  if (b.remaining <= 5 && !b.over && !S.lowPlayed) { S.lowPlayed = true; audio.sfx.low(); }
  if (res.streak === 0 && S.lastStreak >= 2 && tut.guided) ui.toast(`Streak of ${S.lastStreak} ended`);
  S.lastStreak = res.streak;

  for (const rank of res.rankUps) celebrateRank(rank);
  if (S.target && !S.beatTarget && b.score > S.target.score) {
    S.beatTarget = true;
    renderModeLabel();
    const t = S.target;
    later(() => {
      audio.sfx.achievement();
      ui.banner(t.friend ? `You beat ${fmt(t.score)}` : 'Your best island yet', t.friend ? 'Keep building and send it back to them.' : `Past your old best of ${fmt(t.score)}. Keep building.`);
    }, res.rankUps.length ? 4400 : 900);
  }
  world.setDay(b.stats.placed / (b.stats.placed + b.remaining + 1));
  life.refresh(lifeCtx());
  if (!S.assisted) {
    for (const entry of journal.check(b)) unlocked(entry);
    advanceTutorial(res);
  }

  // Rare: the next tile fits nowhere at all.
  while (!b.over && !b.hasAnyMove()) {
    b.discard();
    ui.toast('That tile had nowhere to go, so it drifted out to sea.');
  }

  const keep = touchMode ? null : S.hoverKey;
  S.hoverKey = null;
  refreshFoam();
  refreshSlots();
  syncGhostTile();
  setHover(keep && b.frontier().has(keep) ? keep : null);
  evaluateHover();
  renderDock();
  reframe();
  updateGoal();
  if (b.over) later(endGame, 1500);
  else later(nextTip, 650);
}

function startGame(kind, seed, info = null, { demo = false } = {}) {
  clearIsland();
  S.demo = demo;
  S.assisted = demo;
  S.daily = kind === 'daily' ? (info || S.daily || daily) : daily;
  if (kind === 'daily') seed = S.daily.seed;
  S.vs = invite && vsScore && ((invite.kind === 'free' && kind === 'free' && seed === invite.seed) || (invite.kind === 'daily' && kind === 'daily' && S.daily.key === invite.info.key)) ? vsScore : null;
  S.practice = kind === 'daily' && localStorage.getItem('skerry.first.' + S.daily.key) != null;
  S.lowPlayed = false;
  S.lastStreak = 0;
  S.hintsUsed = 0;
  S.unlockedThisGame = [];
  audio.setGrowth(0);
  camera.clearViewOffset();
  life.reset();
  world.snapDay(0);
  ui.hideCoach();
  S.tipShown = null;
  S.kind = kind;
  S.seed = seed;
  S.board = new Board(seed);
  S.visualRot = 0;
  S.hoverKey = null;
  ghost.tileId = -1;
  rig.spin = 0;
  rig.goalAz = rig.az;
  for (const cell of S.board.cells.values()) addCell(cell);
  S.mode = 'play';
  showScreen(null);
  $('hud').hidden = false;
  // A score to chase: a friend's from a challenge link, or your own best on this isle (or anywhere).
  const own = Number(localStorage.getItem(kind === 'daily' ? 'skerry.daily.' + S.daily.key : 'skerry.isle.' + seed) || 0) || Number(localStorage.getItem('skerry.best') || 0);
  S.target = S.vs ? { score: S.vs, friend: true } : own ? { score: own, friend: false } : null;
  S.beatTarget = false;
  renderModeLabel();
  $('btnPlace').hidden = !touchMode;
  refreshFoam();
  refreshSlots();
  syncGhostTile();
  evaluateHover();
  $('score').dataset.v = 0;
  renderDock();
  reframe(true);
  life.refresh(lifeCtx());
  updateGoal();
  syncLearning();
  if (demo) $('hud').dataset.learn = 'done'; // a demo shows the whole HUD, even before the guided game
  setAuto(demo);
  // each isle's twist, announced once the island has risen (left out of the guided first game)
  if (tut.guided || demo) later(() => ui.banner(`${S.board.type.icon} ${S.board.type.name}`, S.board.type.text), 900);
  const url = new URL(location.href);
  url.search = (kind === 'daily' ? '?day=' + S.daily.number : '?isle=' + seed) + (S.vs ? '&vs=' + S.vs : '');
  history.replaceState(null, '', url);
  later(nextTip, 900);
}

function renderModeLabel() {
  const t = S.target;
  const base = (S.kind === 'daily' ? `Daily isle no. ${S.daily.number}${S.practice ? ', practice' : ''}` : `Isle ${S.seed}`) + (S.assisted ? ', auto-play' : '');
  const el = $('modeLabel');
  const type = S.board.type;
  $('isleType').innerHTML = `${type.icon} <b>${type.name}</b> <span>${type.text}</span>`;
  if (!t) el.textContent = base;
  else if (!S.beatTarget) el.textContent = base + (t.friend ? `. Beat ${fmt(t.score)}` : `. Your best ${fmt(t.score)}`);
  else { el.innerHTML = `${base}. <b class="beat">${t.friend ? `You beat ${fmt(t.score)}` : 'New best!'}</b>`; ui.bump(el.lastChild); }
}

function endGame() {
  const b = S.board;
  S.mode = 'over';
  S.hoverKey = null;
  evaluateHover();
  refreshSlots();
  ui.hideCoach();
  S.tipShown = null;
  audio.sfx.end();
  hideBeacon();
  setAuto(false);
  // a game played on auto-play leaves no trace: no journal, best scores or daily run
  const kept = !S.assisted;
  if (kept) for (const e of journal.recordGame(b, ISLE_TYPES.length)) unlocked(e);
  if (kept && S.kind === 'daily') for (const e of journal.recordDaily(S.daily.key)) unlocked(e);
  for (const el of S.flags.values()) el.remove();
  S.flags.clear();
  const bestKey = S.kind === 'daily' ? 'skerry.daily.' + S.daily.key : 'skerry.isle.' + S.seed;
  const prevBest = Number(localStorage.getItem(bestKey) || 0);
  const prevAll = Number(localStorage.getItem('skerry.best') || 0);
  if (kept && b.score > prevBest) localStorage.setItem(bestKey, b.score);
  if (kept && b.score > prevAll) localStorage.setItem('skerry.best', b.score);

  // The first finished run of a daily is the one that counts; it also keeps the day streak going.
  let official = null;
  if (kept && S.kind === 'daily') {
    const firstKey = 'skerry.first.' + S.daily.key;
    if (localStorage.getItem(firstKey) == null) {
      localStorage.setItem(firstKey, b.score);
      if (S.daily.key === daily.key) {
        const last = localStorage.getItem('skerry.streakDay');
        const yesterday = dailyByNumber(daily.number - 1).key;
        const streak = last === yesterday ? Number(localStorage.getItem('skerry.streak') || 0) + 1 : last === daily.key ? Number(localStorage.getItem('skerry.streak') || 1) : 1;
        localStorage.setItem('skerry.streak', streak);
        localStorage.setItem('skerry.streakDay', daily.key);
        for (const e of journal.recordStreak(streak)) unlocked(e);
      }
    } else official = Number(localStorage.getItem(firstKey));
  }

  const rank = rankOf(b.score);
  $('overTitle').textContent = `You raised ${rank.phrase}`;
  $('overSub').textContent = (S.kind === 'daily' ? `Daily isle no. ${S.daily.number}` : `Isle ${S.seed}`) + `, ${b.type.name.toLowerCase()}` + (rank.next ? `. ${fmt(rank.next.min - b.score)} more points makes it ${rank.next.phrase}.` : '. The finest kind of island.');
  $('overScore').textContent = fmt(b.score);
  let record = '';
  if (S.assisted) record = S.demo ? 'That was the autopilot taking the best spot every time. Now try this isle yourself.' : 'Played partly on auto-play, so this one isn’t kept.';
  else if (S.vs) record = b.score > S.vs ? `You beat ${fmt(S.vs)}. Send it back to them.` : b.score === S.vs ? `A dead heat with ${fmt(S.vs)}.` : `${fmt(S.vs)} to beat, ${fmt(S.vs - b.score)} short.`;
  else if (official != null) record = `Practice run. Your first score on this isle, ${fmt(official)}, is the one you share.`;
  else if (b.score > prevAll && prevAll > 0) record = 'Your best island yet';
  else if (b.score > prevBest && prevBest > 0) record = 'Your best on this isle';
  $('overRecord').textContent = record;
  $('stPlaced').textContent = b.stats.placed;
  $('stPerfect').textContent = b.bestStreak;
  $('overJournal').hidden = !S.unlockedThisGame.length;
  $('overJournal').textContent = S.unlockedThisGame.length ? `New in your journal: ${S.unlockedThisGame.map((e) => `${e.icon} ${e.name}`).join(', ')}` : '';
  $('stQuests').textContent = `${b.stats.questsDone}/${b.quests.length}`;
  $('stClosed').textContent = b.stats.closed;
  $('emojiBar').textContent = ui.placementStrip(b.log);
  $('btnAgain').textContent = S.demo ? 'Try this isle' : S.kind === 'daily' ? 'Play a new isle' : 'Play again';
  showScreen('over');
  applyViewOffset();
  rig.spin = 0.06;
  rig.frame(islandBounds().c, islandBounds().r, true);
}

function shareText() {
  const b = S.board;
  const score = b.score;
  const link = location.origin + location.pathname + (S.kind === 'daily' ? '?day=' + S.daily.number : '?isle=' + S.seed) + '&vs=' + score;
  const head = (S.kind === 'daily' ? `Skerry no. ${S.daily.number}` : `Skerry isle ${S.seed}`) + `, ${rankOf(score).name}${S.practice ? ' (practice)' : ''}${S.assisted ? ' (auto-play)' : ''}`;
  const line = `${fmt(score)} points, ${b.stats.placed} tiles, requests ${b.stats.questsDone}/${b.quests.length}`;
  return `${head}\n${line}\n${ui.placementStrip(b.log)}\nCan you beat it? ${link}`;
}

async function share() {
  const text = shareText();
  try {
    if (navigator.share && touchMode) { await navigator.share({ text }); return; }
    await navigator.clipboard.writeText(text);
    ui.toast('Result copied. Paste it anywhere.');
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    ui.toast('Result copied. Paste it anywhere.');
  }
}

// ---------------------------------------------------------------- title

function buildTitleIsland() {
  clearIsland();
  const b = new Board(hashString('skerry-title-isle'));
  for (let i = 0; i < 17; i++) { const m = b.bestMove(); if (!m) break; b.place(m.q, m.r, m.rot); }
  let d = 0.2;
  for (const cell of b.cells.values()) { addCell(cell, { delay: d, quiet: true }); d += 0.11; }
  S.board = null;
  refreshFoam();
  const { c, r } = islandBounds();
  rig.frame(c, r, true);
  world.setFocus(c, r);
  rig.spin = 0.05;
  life.reset();
  world.snapDay(0.12);
  later(() => { for (const e of ['puffins', 'lighthouse', 'boats']) life.enable(e, lifeCtx()); }, d * 1000 + 900);
}

// Slide the rendered view so the island sits clear of the title text or the end card.
function applyViewOffset() {
  const W = window.innerWidth, H = window.innerHeight, narrow = W < 640;
  if (S.mode === 'title') narrow ? camera.setViewOffset(W, H, 0, H * 0.2, W, H) : camera.setViewOffset(W, H, -W * 0.2, 0, W, H);
  else if (S.mode === 'over') narrow ? camera.setViewOffset(W, H, 0, H * 0.24, W, H) : camera.setViewOffset(W, H, W * 0.17, 0, W, H);
  else camera.clearViewOffset();
}

function showScreen(id) {
  for (const s of ['title', 'help', 'pause', 'over', 'journal', 'intro']) $(s).hidden = s !== id;
  if (id === 'journal') renderJournal();
  $('hud').hidden = !(S.mode === 'play' || S.mode === 'paused') || id === 'title';
  if (id === 'title') {
    $('dailySub').textContent = invite ? `${invite.label}, shared with you${vsScore ? `. Beat ${fmt(vsScore)}` : ''}` : `Isle no. ${daily.number}`;
    $('btnDaily').firstChild.textContent = invite ? 'Play the shared isle' : "Play today's isle";
    const today = localStorage.getItem('skerry.first.' + daily.key);
    const best = Number(localStorage.getItem('skerry.best') || 0);
    const streak = Number(localStorage.getItem('skerry.streak') || 0);
    const streakDay = localStorage.getItem('skerry.streakDay');
    const live = streakDay === daily.key || streakDay === dailyByNumber(daily.number - 1).key;
    const parts = [];
    if (today != null) parts.push(`Today's isle: ${fmt(Number(today))}, ${rankOf(Number(today)).name}.`);
    else if (best) parts.push(`Your best island scored ${fmt(best)}.`);
    if (live && streak >= 2) parts.push(`${streak} days in a row.`);
    $('bestLine').textContent = parts.join(' ');
  }
}

function goTitle() {
  S.mode = 'title';
  ui.hideCoach();
  S.tipShown = null;
  $('ghostTag').hidden = true;
  ghost.root.visible = false;
  hoverDisc.visible = false;
  history.replaceState(null, '', location.pathname);
  audio.setGrowth(0);
  buildTitleIsland();
  showScreen('title');
  applyViewOffset();
}

let helpReturn = 'title';
function openHelp(from) { helpReturn = from; showScreen('help'); }

// First-timers see three picture cards explaining the idea before their first game.
let introThen = null, introSlide = 0;
function openIntro(then) {
  introThen = then;
  introSlide = 0;
  ui.renderIntro(introSlide);
  showScreen('intro');
}
function play(fn) {
  audio.unlock();
  if (!tut.intro) openIntro(fn);
  else fn();
}
$('introNext').addEventListener('click', () => {
  if (introSlide < 2) { introSlide++; ui.renderIntro(introSlide); return; }
  tut.intro = 1;
  saveTut();
  const fn = introThen;
  introThen = null;
  if (fn) fn(); else showScreen(helpReturn);
});
$('introBack').addEventListener('click', () => { if (introSlide > 0) { introSlide--; ui.renderIntro(introSlide); } });
$('btnIntroAgain').addEventListener('click', () => openIntro(null));

$('btnDaily').addEventListener('click', () => play(() => {
  if (!invite) startGame('daily', daily.seed, daily);
  else if (invite.kind === 'free') startGame('free', invite.seed);
  else startGame('daily', invite.info.seed, invite.info);
}));
$('btnFree').addEventListener('click', () => play(() => startGame('free', Math.floor(Math.random() * 900000) + 100000)));
$('btnDemo').addEventListener('click', () => { audio.unlock(); startGame('free', Math.floor(Math.random() * 900000) + 100000, null, { demo: true }); });
$('btnAuto').addEventListener('click', () => setAuto(!auto.on));
$('btnHowTitle').addEventListener('click', () => openHelp('title'));
let journalReturn = 'title';
$('btnJournalTitle').addEventListener('click', () => { journalReturn = 'title'; showScreen('journal'); });
$('btnJournalPause').addEventListener('click', () => { journalReturn = 'pause'; showScreen('journal'); });
$('btnJournalClose').addEventListener('click', () => showScreen(journalReturn));
$('btnHint').addEventListener('click', () => showHint(true));
const vol = $('volume');
vol.value = Math.round(audio.getVolume() * 100);
vol.addEventListener('input', () => {
  audio.unlock();
  audio.setVolume(vol.value / 100);
  if (audio.isMuted() && vol.value > 0) toggleMute();
});
$('btnHelpClose').addEventListener('click', () => showScreen(helpReturn));
$('btnMenu').addEventListener('click', () => pause());
$('btnResume').addEventListener('click', () => resume());
$('btnHowPause').addEventListener('click', () => openHelp('pause'));
$('btnRestart').addEventListener('click', () => startGame(S.kind, S.seed, S.daily));
$('btnQuit').addEventListener('click', goTitle);
$('btnShare').addEventListener('click', share);
$('btnAgain').addEventListener('click', () => startGame(S.kind === 'daily' ? 'free' : 'free', S.kind === 'daily' ? Math.floor(Math.random() * 900000) + 100000 : S.seed));
$('btnOverTitle').addEventListener('click', goTitle);
$('btnTurnL').addEventListener('click', () => turn(-1));
$('btnTurnR').addEventListener('click', () => turn(1));
$('btnPlace').addEventListener('click', () => tryPlace(S.hoverKey));
$('btnSound').innerHTML = ui.soundIcon(audio.isMuted());
$('btnSound').addEventListener('click', () => toggleMute());
if (touchMode) $('keysHelp').innerHTML = 'Tap an outline to try a tile there, tap again or press Place to raise it. Drag to look around, pinch to zoom.';

function toggleMute() {
  audio.unlock();
  audio.setMuted(!audio.isMuted());
  $('btnSound').innerHTML = ui.soundIcon(audio.isMuted());
  $('btnSound').setAttribute('aria-label', audio.isMuted() ? 'Turn sound on' : 'Mute sound');
}
// ---------------------------------------------------------------- auto-play

// Auto-play takes the best spot for every tile: the golden light settles there and the
// tile turns to fit, then it goes down. Using it means the game isn't kept.
const AUTO_STEP = 0.7, AUTO_AIM = 0.35; // seconds per tile, and how long it shows the spot first
const auto = { on: false, t: 0, aimed: false };

function setAuto(on) {
  auto.on = on;
  auto.t = 0;
  auto.aimed = false;
  $('btnAuto').setAttribute('aria-pressed', String(on));
  if (on && !S.assisted) { S.assisted = true; renderModeLabel(); }
  if (on) { ui.hideCoach(); S.tipShown = null; }
}

function stepAuto(dt) {
  const b = S.board;
  if (!auto.on || S.mode !== 'play' || !b || b.over || !b.current) return;
  auto.t += dt;
  if (!auto.aimed && auto.t >= AUTO_STEP - AUTO_AIM) { auto.aimed = true; showHint(false, true); }
  if (auto.t < AUTO_STEP) return;
  const rank = b.rank;
  showHint(false, true); // aim again in case the pointer moved the tile meanwhile
  tryPlace(beaconKey);
  // linger while a new rank is celebrated
  auto.t = b.rank > rank ? -1.6 : 0;
  auto.aimed = false;
}

function pause() { if (S.mode !== 'play') return; S.mode = 'paused'; showScreen('pause'); }
function resume() { if (S.mode !== 'paused') return; S.mode = 'play'; showScreen(null); }

// ---------------------------------------------------------------- input

const ray = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -SLOT_Y);
const ndc = new THREE.Vector2();
const hit = new THREE.Vector3();

function keyAt(x, y) {
  ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  if (!ray.ray.intersectPlane(plane, hit)) return null;
  const { q, r } = fromWorld(hit.x, hit.z);
  return key(q, r);
}

const ptrs = new Map();
let drag = null, pinch = null, mouse = null;

canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointerdown', (e) => {
  audio.unlock();
  canvas.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 1) drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false, button: e.button, type: e.pointerType };
  if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) };
    if (drag) drag.moved = true;
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') mouse = { x: e.clientX, y: e.clientY };
  if (!ptrs.has(e.pointerId)) return;
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d > 10) { rig.zoom(pinch.d / d); pinch.d = d; }
    return;
  }
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 7) drag.moved = true;
  if (drag.moved && drag.button === 0 && S.mode !== 'title') {
    rig.pan(e.clientX - drag.x, e.clientY - drag.y, window.innerHeight);
    canvas.classList.add('grab');
  }
  drag.x = e.clientX; drag.y = e.clientY;
});
function endPointer(e) {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinch = null;
  if (ptrs.size === 1 && drag) { const [p] = [...ptrs.values()]; drag.x = p.x; drag.y = p.y; }
  if (drag && !drag.moved && ptrs.size === 0) onTap(e, drag);
  if (ptrs.size === 0) { drag = null; canvas.classList.remove('grab'); }
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', (e) => { ptrs.delete(e.pointerId); drag = null; pinch = null; canvas.classList.remove('grab'); });
canvas.addEventListener('wheel', (e) => { e.preventDefault(); if (S.mode !== 'title') rig.zoom(Math.exp(e.deltaY * 0.0012)); }, { passive: false });

function onTap(e, d) {
  if (S.mode !== 'play') return;
  if (d.button === 2) { turn(1); return; }
  if (d.button !== 0) return;
  const k = keyAt(e.clientX, e.clientY);
  if (d.type === 'mouse') { setHover(k && S.board.frontier().has(k) ? k : null); tryPlace(k); return; }
  if (!k || !S.board.frontier().has(k)) return;
  if (k === S.hoverKey) tryPlace(k);
  else setHover(k);
}

window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === 'escape') {
    if (S.mode === 'play') pause();
    else if (S.mode === 'paused') resume();
    else if (!$('help').hidden) showScreen(helpReturn);
    else if (!$('journal').hidden) showScreen(journalReturn);
    return;
  }
  if (k === 'm') { toggleMute(); return; }
  if (k === 'h' && S.mode === 'play') { showHint(true); return; }
  if (k === 'p' && S.mode === 'play' && $('hud').dataset.learn === 'done') { setAuto(!auto.on); return; }
  if (S.mode !== 'play') return;
  if ((k === ' ' || k === 'enter') && e.target.closest && e.target.closest('button')) return;
  if (k === 'r' || k === 'e') turn(1);
  else if (k === 'q') turn(-1);
  else if (k === 'a' || k === 'arrowleft') rig.turn(-1);
  else if (k === 'd' || k === 'arrowright') rig.turn(1);
  else if (k === 'c') { reframe(true); }
  else if (k === ' ' || k === 'enter') { e.preventDefault(); tryPlace(S.hoverKey); }
});

window.addEventListener('resize', () => { world.resize(); applyViewOffset(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

// ---------------------------------------------------------------- loop

const SHALLOWS = new THREE.Color('#2b6a6c');
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;

  if (S.mode === 'play' && mouse && !drag && !auto.on) {
    const k = keyAt(mouse.x, mouse.y);
    const hk = k && S.board.frontier().has(k) ? k : null;
    if (hk !== S.hoverKey) setHover(hk);
  }

  stepAnims(dt);
  stepFlashes(dt, t);
  rig.update(dt);

  if (ghost.root.visible && S.hoverKey) {
    const p = S.board.frontier().get(S.hoverKey);
    if (p) {
      const { x, z } = toWorld(p.q, p.r);
      const k = 1 - Math.exp(-dt * 16);
      ghostPos.x += (x - ghostPos.x) * k;
      ghostPos.z += (z - ghostPos.z) * k;
      ghostPos.y = 0.5 + Math.sin(t * 2.2) * 0.05;
      ghost.root.position.copy(ghostPos);
      if (ghost.tile) {
        const goal = (-S.visualRot * Math.PI) / 3;
        ghost.tile.rotation.y += (goal - ghost.tile.rotation.y) * (1 - Math.exp(-dt * 14));
      }
      const s = project(ghostPos.x, ghostPos.y + 0.55, ghostPos.z);
      const tag = $('ghostTag');
      tag.style.left = s.x + 'px';
      tag.style.top = s.y + 'px';
    }
  }
  if (S.mode === 'play') {
    const pulse = 0.38 + Math.sin(t * 2.4) * 0.14;
    ringMat.opacity = pulse;
  }

  if (S.board && S.mode !== 'title') {
    const deg = currentDeg();
    if (dockDeg === null || Math.abs(deg - dockDeg) > 0.5) {
      ui.setHexRotation($('curSvg'), deg);
      ui.setHexRotation($('nextSvg'), deg);
      dockDeg = deg;
    }
  }

  world.update(t, dt, rig.target);
  glowMat.opacity = world.night * 0.95;
  shallowMat.color.copy(SHALLOWS).multiplyScalar(1 - world.night * 0.7);
  life.update(t, dt, world.night);
  if (beacon.visible) {
    beacon.material.opacity = 0.28 + Math.sin(t * 4) * 0.1;
    beaconRing.scale.setScalar(1 + ((t * 0.8) % 1) * 0.35);
    beaconRing.material.opacity = 0.9 * (1 - ((t * 0.8) % 1));
  }
  stepAuto(dt);
  particles.update(dt);
  updateFlags();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

goTitle();
requestAnimationFrame(frame);

// Hooks for automated play-testing.
window.__skerry = {
  get mode() { return S.mode; },
  get board() { return S.board; },
  start: startGame,
  hover(k) { setHover(k); return S.ev; },
  place: tryPlace,
  turn,
  best() { const m = S.board.bestMove(); if (m) { S.visualRot += ((m.rot - rot()) + 6) % 6; } return m; },
  info: () => renderer.info.render,
  screenOf(k) { const [q, r] = k.split(',').map(Number); const { x, z } = toWorld(q, r); return project(x, SLOT_Y, z); },
  get tip() { return S.tipShown; },
  get beacon() { return beacon.visible ? beaconKey : null; },
  get heldFlash() { return flashes.some((f) => f.hold); },
  hint: () => showHint(true),
  arrive: (event) => life.enable(event, lifeCtx()),
  day: (f) => world.snapDay(f),
};
