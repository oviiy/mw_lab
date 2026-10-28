// Game flow, input, and keeping the 3D scene in step with the simulation.
import * as THREE from 'three';
import { createWorld } from './world.js';
import { createFx } from './fx.js';
import { createUI } from './ui.js';
import * as audio from './audio.js';
import { createGame, step, startGame, HZ, AW, AH, DEF } from './game.js';
import { makeTurtle, makeEnemy, makeHubby, makeBull, makeHorse, makeBike, makePickup, PICKUP_COL, makeTornado, makeDahong, makeBomb, gemGeometry, gemMaterial, glow, glossy, toon, template, instantiate } from './models.js';
import { WAVES, ENEMY_NAMES } from './config.js';

const canvas = document.getElementById('scene');
const phone = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) <= 820;
const world = createWorld(canvas, { lowPower: phone });
const { scene, camera, renderer } = world;
const fx = createFx(scene);
const ui = createUI(camera);
const g = createGame();

const WAVE_SUBS = [
  '', '小榴莲、姜饼人……橘子来了！', '徐山羊开始冲了，丁丁要抱抱', '甲方乙方吵上门了，往昔蚝在想当年', '果哥在问号，吴浩然在偷糖', '大毛（超大号）来了',
  '大毛一家都来了', '你的龟昨天晚上风好大', '他应该不会下包的', '黄房上没人', '沉毅羊（法官）开庭了',
];

// ---------- models ----------
const turtleTpl = template(makeTurtle());
const turtle = instantiate(turtleTpl);
scene.add(turtle);
const shieldBubble = new THREE.Mesh(new THREE.SphereGeometry(0.9, 28, 18), new THREE.MeshBasicMaterial({ color: '#7fd3ff', transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending }));
shieldBubble.position.y = 0.45;
turtle.add(shieldBubble);
const heroRing = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.78, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ff6fae', transparent: true, opacity: 0.7, depthWrite: false }));
heroRing.position.y = 0.03;
scene.add(heroRing);
const pickupRing = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.12, depthWrite: false }));
pickupRing.position.y = 0.025;
scene.add(pickupRing);

const enemyTpl = {};
const tplFor = (type) => (enemyTpl[type] ||= template(makeEnemy(type)));
const hubby = instantiate(template(makeHubby()));
hubby.visible = false; scene.add(hubby);
const bullTpl = template(makeBull());
const bullM = instantiate(bullTpl);
bullM.visible = false; scene.add(bullM);
const horseM = instantiate(template(makeHorse()));
horseM.visible = false; scene.add(horseM);
// 北京骑行夫妇: the tandem, with 蔡博 on the back seat
const hubbyTpl = template(makeHubby());
const bikeM = instantiate(template(makeBike()));
const bikeRider = instantiate(hubbyTpl);
bikeRider.position.set(-0.5, 0.2, 0);
bikeM.userData.body.add(bikeRider);
bikeM.visible = false; scene.add(bikeM);
const tornadoTpl = template(makeTornado()), dahongTpl = template(makeDahong()), bombTpl = template(makeBomb());
const tornados = [], dahongs = [];
function pool(arr, tpl, n) {
  while (arr.length < n) { const m = instantiate(tpl); scene.add(m); arr.push(m); }
  arr.forEach((m, i) => { m.visible = i < n; });
}

const dummy = new THREE.Object3D();
function instanced(geo, mat, max, shadow = false) {
  const m = new THREE.InstancedMesh(geo, mat, max);
  m.count = 0; m.castShadow = shadow; m.frustumCulled = false;
  scene.add(m);
  return m;
}
const bulletMesh = instanced(new THREE.CapsuleGeometry(0.075, 0.34, 4, 8).rotateZ(Math.PI / 2), glow('#ff8fcf', 3.2), 400);
const gemMesh = instanced(gemGeometry, gemMaterial, 900, true);
const ebMesh = {
  bolt: instanced(new THREE.SphereGeometry(0.17, 12, 8), glow('#ff7a2a', 2.6), 200),
  pearl: instanced(new THREE.SphereGeometry(0.16, 14, 10), glossy('#fff7f2', { emissive: '#ffd9ec', emissiveIntensity: 0.8 }), 200),
  paper: instanced(new THREE.BoxGeometry(0.42, 0.03, 0.32), toon('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.3 }), 200, true),
  hongbao: instanced(new THREE.BoxGeometry(0.36, 0.05, 0.24), glow('#e0242f', 1.4), 200, true),
  sausage: instanced(new THREE.CapsuleGeometry(0.1, 0.32, 4, 10).rotateZ(Math.PI / 2), toon('#a8382a'), 200, true),
  spear: instanced(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6).rotateZ(Math.PI / 2), toon('#c9ced6'), 100, true),
};

// pickups, elite auras, stampedes, tides, laser sights
const pickupTpl = {}, pickupModels = new Map();
const auraGeo = new THREE.RingGeometry(0.85, 1, 48).rotateX(-Math.PI / 2);
const AURA_COL = { frenzy: '#ff3b3b', tough: '#7fd3ff', split: '#7CFC9A', boom: '#ff8a2a' };
const auraModels = new Map();
const herd = [];
const tideMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uTime: { value: 0 }, uCol: { value: new THREE.Color('#2f8fd6') }, uA: { value: 0.6 } },
  vertexShader: 'varying vec2 vUv; uniform float uTime; void main(){ vUv = uv; vec3 p = position; p.y += sin(uv.x * 20.0 + uTime * 6.0) * 0.12 * uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
  fragmentShader: 'varying vec2 vUv; uniform float uTime; uniform vec3 uCol; uniform float uA; void main(){ float foam = smoothstep(0.75, 1.0, vUv.y + sin(vUv.x * 40.0 + uTime * 8.0) * 0.05); vec3 c = mix(uCol, vec3(0.95, 1.0, 1.0), foam); gl_FragColor = vec4(c, uA * (0.35 + 0.65 * vUv.y)); }',
});
const tideModels = new Map();
function makeTide(friendly) {
  const grp = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(AH * 2 + 2, 1.8, 60, 4).rotateY(Math.PI / 2).translate(0, 0.9, 0), tideMat.clone());
  wall.material.uniforms.uCol.value.set(friendly ? '#3ad1c4' : '#2a6fd6');
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2.8, AH * 2 + 2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: friendly ? '#3ad1c4' : '#2a6fd6', transparent: true, opacity: 0.35, depthWrite: false }));
  floor.position.y = 0.05;
  grp.add(wall, floor);
  grp.userData = { wall, floor };
  scene.add(grp);
  return grp;
}
const laserGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 4).rotateZ(Math.PI / 2).translate(0.5, 0, 0);
const laserMat = new THREE.MeshBasicMaterial({ color: '#ff2a2a', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
const lasers = [];
const spawnMesh = instanced((() => { const a = new THREE.BoxGeometry(0.75, 0.04, 0.14).rotateY(Math.PI / 4), b = new THREE.BoxGeometry(0.75, 0.04, 0.14).rotateY(-Math.PI / 4); const geo = new THREE.BufferGeometry(); const pa = a.toNonIndexed().attributes.position.array, pb = b.toNonIndexed().attributes.position.array; const all = new Float32Array(pa.length + pb.length); all.set(pa); all.set(pb, pa.length); geo.setAttribute('position', new THREE.BufferAttribute(all, 3)); geo.computeVertexNormals(); return geo; })(), glow('#ff3b3b', 2), 200);

const ZONE_COL = { ping: '#ffd400', slam: '#ff3b3b', gavel: '#ff6a3b', flash: '#ffffff', boom: '#ff8a2a' };
const zoneFill = new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2);
const zoneEdge = new THREE.RingGeometry(0.93, 1, 48).rotateX(-Math.PI / 2);
function makeZone(kind) {
  const grp = new THREE.Group();
  const col = ZONE_COL[kind] || '#ff3b3b';
  const fill = new THREE.Mesh(zoneFill, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.28, depthWrite: false }));
  const edge = new THREE.Mesh(zoneEdge, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, depthWrite: false }));
  fill.position.y = 0.04; edge.position.y = 0.05;
  grp.add(fill, edge);
  grp.userData = { fill, edge };
  scene.add(grp);
  return grp;
}

// the cast poses in a ring for the title screen
const showcase = new THREE.Group();
['durian', 'ginger', 'orange', 'dingding', 'oyster', 'goat', 'caesar', 'chenwei', 'jia', 'mao', 'guo', 'thief'].forEach((type, i, arr) => {
  const m = instantiate(tplFor(type));
  const a = (i / arr.length) * Math.PI * 2;
  m.position.set(Math.cos(a) * 4.6, 0, Math.sin(a) * 4.6);
  m.rotation.y = Math.atan2(Math.sin(a), -Math.cos(a)) + Math.PI;
  m.userData.phase = i;
  showcase.add(m);
});
scene.add(showcase);

const enemyModels = new Map(), zoneModels = new Map(), bombModels = new Map();
function clearDynamic() {
  for (const m of enemyModels.values()) scene.remove(m);
  for (const m of zoneModels.values()) scene.remove(m);
  for (const m of bombModels.values()) scene.remove(m);
  for (const m of pickupModels.values()) scene.remove(m);
  for (const m of auraModels.values()) scene.remove(m);
  for (const m of tideModels.values()) scene.remove(m);
  enemyModels.clear(); zoneModels.clear(); bombModels.clear(); pickupModels.clear(); auraModels.clear(); tideModels.clear();
  herd.forEach((b) => { b.visible = false; }); lasers.forEach((l) => { l.visible = false; });
}

// ---------- input ----------
const keys = new Set();
const pressed = {};
const press = (k, v = true) => { pressed[k] = v; };
addEventListener('keydown', (e) => {
  audio.unlock();
  const k = e.code;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(k)) e.preventDefault();
  if (e.repeat) return;
  keys.add(k);
  if (k === 'Space') press(g.state === 'play' ? 'ult' : 'start');
  if (k === 'Enter') press('start');
  if (k === 'Escape' || k === 'KeyP') press('pause');
  if (g.state === 'pick') {
    if (k === 'Digit1' || k === 'Numpad1') press('pick', 0);
    if (k === 'Digit2' || k === 'Numpad2') press('pick', 1);
    if (k === 'Digit3' || k === 'Numpad3') press('pick', 2);
    if (k === 'KeyR') press('reroll');
  }
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => { keys.clear(); stick.active = false; stickEl.hidden = true; if (g.state === 'play') press('pause'); });
document.addEventListener('visibilitychange', () => { if (document.hidden && g.state === 'play') press('pause'); });

// floating joystick: put a finger down anywhere and drag
const stickEl = document.getElementById('stick'), knob = stickEl.firstElementChild;
const stick = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
let stickDrawPending = false;
function drawStick() {
  if (stickDrawPending) return;
  stickDrawPending = true;
  requestAnimationFrame(() => {
    stickDrawPending = false;
    if (stick.active) knob.style.transform = `translate(${stick.x * 56}px, ${-stick.y * 56}px)`;
  });
}
canvas.addEventListener('pointerdown', (e) => {
  audio.unlock();
  if (g.state !== 'play' || stick.active) return;
  e.preventDefault();
  Object.assign(stick, { active: true, id: e.pointerId, ox: e.clientX, oy: e.clientY, x: 0, y: 0 });
  stickEl.style.left = e.clientX + 'px'; stickEl.style.top = e.clientY + 'px';
  stickEl.hidden = false; knob.style.transform = '';
  try { canvas.setPointerCapture(e.pointerId); } catch {}
}, { passive: false });
canvas.addEventListener('pointermove', (e) => {
  if (!stick.active || e.pointerId !== stick.id) return;
  e.preventDefault();
  let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy;
  const d = Math.hypot(dx, dy), R = 56;
  if (d > R) { dx *= R / d; dy *= R / d; }
  stick.x = dx / R; stick.y = -dy / R;
  drawStick();
}, { passive: false });
const endStick = (e) => { if (e.pointerId === stick.id) { stick.active = false; stick.x = stick.y = 0; stickEl.hidden = true; } };
canvas.addEventListener('pointerup', endStick);
canvas.addEventListener('pointercancel', endStick);

function readMove() {
  let mx = 0, my = 0;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
  if (keys.has('KeyW') || keys.has('ArrowUp')) my += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) my -= 1;
  if (stick.active) { mx += stick.x; my += stick.y; }
  return { mx, my };
}

const $ = (id) => document.getElementById(id);
const tap = (id, fn) => $(id).addEventListener('click', (e) => { e.stopPropagation(); audio.unlock(); audio.sfx('click'); fn(); });
tap('startBtn', () => press('start'));
tap('againBtn', () => press('start'));
tap('winAgain', () => press('start'));
tap('pauseBtn', () => press('pause'));
tap('resumeBtn', () => press('pause'));
tap('quitBtn', () => { g.state = 'title'; });
tap('rerollBtn', () => press('reroll'));
$('ultBtn').addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); audio.unlock(); press('ult'); });
const syncMute = () => { const t = '声音：' + (audio.isMuted() ? '关' : '开'); $('muteBtn').textContent = t; $('pauseMute').textContent = t; };
tap('muteBtn', () => { audio.setMuted(!audio.isMuted()); syncMute(); });
tap('pauseMute', () => { audio.setMuted(!audio.isMuted()); syncMute(); });
syncMute();

// ---------- camera ----------
const cam = { x: 0, y: 0, shake: 0, zoom: 1 };
const PITCH = 0.82;
function frameCamera(t, dt) {
  const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const w = innerWidth, hgt = innerHeight;
  if (g.state === 'title') {
    const a = t * 0.12;
    const portrait = hgt > w;
    camera.position.set(Math.sin(a) * 11, 5.2, Math.cos(a) * 11);
    camera.lookAt(0, 1.1, 0);
    // push the cast to the right (landscape) or up (portrait) so the wordmark has room
    camera.setViewOffset(w, hgt, portrait ? 0 : -w * 0.2, portrait ? hgt * 0.2 : 0, w, hgt);
    world.focus.set(0, 0, 0);
    return;
  }
  if (camera.view && camera.view.enabled) camera.clearViewOffset();
  const h = g.hero;
  // keep about 11 m of yard visible across the short side of the screen, so phones in either orientation see the same
  const D = THREE.MathUtils.clamp(Math.max(5.6 / tanH, 4.6 / (tanH * camera.aspect)), 12, 26) * cam.zoom;
  const hw = D * tanH * camera.aspect, hh = D * tanH / Math.sin(PITCH);
  const tx = THREE.MathUtils.clamp(h.x + h.vx * 12, -Math.max(0, AW + 1.5 - hw), Math.max(0, AW + 1.5 - hw));
  const ty = THREE.MathUtils.clamp(h.y + h.vy * 12, -Math.max(0, AH + 1 - hh * 0.85), Math.max(0, AH + 2.5 - hh * 0.85));
  const k = 1 - Math.exp(-dt * 6);
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
  cam.shake *= Math.exp(-dt * 7);
  const s = cam.shake * 0.5;
  const sx = (Math.random() - 0.5) * s, sz = (Math.random() - 0.5) * s;
  camera.position.set(cam.x + sx, D * Math.sin(PITCH), -cam.y + D * Math.cos(PITCH) + sz);
  camera.lookAt(cam.x + sx * 0.5, 0, -cam.y + sz * 0.5);
  world.focus.set(cam.x, 0, -cam.y);
}

// ---------- syncing the scene ----------
const lerpAngle = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * k; };
let muzzle = 0, heroHurt = 0;

function syncHero(t) {
  const h = g.hero, ud = turtle.userData;
  const riding = h.ride > 0, onBike = riding && h.mount === 'bike';
  turtle.position.set(h.x, riding ? (onBike ? 0.62 : 0.95) : 0, -h.y);
  turtle.rotation.y = lerpAngle(turtle.rotation.y, h.face, 0.18);
  horseM.visible = riding && !onBike;
  bikeM.visible = onBike;
  if (onBike) {
    bikeM.position.set(h.x, 0, -h.y); bikeM.rotation.y = turtle.rotation.y;
    const sp = Math.hypot(h.vx, h.vy);
    bikeM.userData.wheels.forEach((w) => { w.rotation.z -= sp * 3; });
    const pedal = t * 14;
    bikeRider.userData.legs.forEach((l, i) => { l.rotation.z = -1.2 + Math.sin(pedal + i * Math.PI) * 0.5; });
    bikeRider.userData.arms.forEach((a) => { a.rotation.z = -1.1; });
    bikeRider.userData.body.rotation.z = -0.15;
    turtle.position.x += Math.cos(h.face) * 0.3; turtle.position.z -= Math.sin(h.face) * 0.3;
    if (Math.random() < 0.08) fx.burst('dust', h.x - Math.cos(h.face) * 1.1, h.y - Math.sin(h.face) * 1.1, 1, 0.1);
  } else if (riding) {
    horseM.position.set(h.x, 0, -h.y); horseM.rotation.y = turtle.rotation.y;
    const gal = t * 20;
    horseM.userData.legs.forEach((l, i) => { l.rotation.z = Math.sin(gal + (i < 2 ? 0 : Math.PI) + (i % 2) * 0.6) * 0.8; });
    horseM.userData.body.position.y = Math.abs(Math.sin(gal)) * 0.12;
    turtle.position.y += horseM.userData.body.position.y;
    if (Math.random() < 0.12) fx.burst('dust', h.x - Math.cos(h.face) * 0.9, h.y - Math.sin(h.face) * 0.8, 2, 0.1);
  }
  const run = h.moving ? t * 15 : 0;
  ud.legs.forEach((l, i) => { l.rotation.z = h.moving && !riding ? Math.sin(run + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 0.7 : 0; });
  ud.body.position.y = h.moving ? Math.abs(Math.sin(run)) * 0.06 : Math.sin(t * 2.2) * 0.012;
  ud.body.rotation.z = h.moving ? -0.06 : 0;
  ud.head.rotation.z = Math.sin(t * 2.2) * 0.04;
  ud.head.rotation.y = h.moving ? Math.sin(run * 0.5) * 0.08 : Math.sin(t * 0.8) * 0.25;
  ud.bow.rotation.x = Math.sin(t * 3) * 0.1;
  const blink = (t % 3.4) < 0.12 ? 0.12 : 1;
  for (const e of ud.eyes) e.scale.y = blink;
  // 女酋长的祝福 glow
  shieldBubble.material.color.set(h.bless > 0 ? '#ffd35a' : '#7fd3ff');
  const aim = h.aim ?? h.face;
  ud.gun.rotation.y = aim - turtle.rotation.y;
  muzzle = Math.max(0, muzzle - 0.12);
  ud.barrel.position.x = -muzzle * 0.12;
  ud.flash.material.opacity = muzzle;
  ud.flash.scale.setScalar(0.6 + muzzle);
  turtle.visible = !(heroHurt > 0 && Math.floor(t * 24) % 2);
  if (heroHurt > 0) heroHurt--;
  shieldBubble.visible = h.shields > 0 || h.bless > 0;
  shieldBubble.material.opacity = 0.16 + Math.sin(t * 4) * 0.05;
  heroRing.position.set(h.x, 0.03, -h.y);
  pickupRing.position.set(h.x, 0.025, -h.y);
  pickupRing.scale.setScalar(h.s.pickup);
}

function animateEnemy(m, e, t) {
  const ud = m.userData;
  const frozen = e.stun > 0 || e.web > 0;
  const step = frozen ? 0 : e.t * 0.22;
  ud.body.position.y = frozen ? 0 : Math.abs(Math.sin(step)) * 0.05;
  ud.body.rotation.z = e.stun > 0 ? Math.sin(t * 25) * 0.15 : 0;
  if (ud.legs) ud.legs.forEach((l, i) => { l.rotation.z = frozen ? 0 : Math.sin(step * 1.6 + (i % 2) * Math.PI) * 0.6; });
  if (ud.arms) ud.arms.forEach((a, i) => { a.rotation.z = frozen ? 0 : Math.sin(step * 1.6 + (i % 2 ? 0 : Math.PI)) * 0.5; });
  if (ud.disc) { ud.disc.rotation.z -= frozen ? 0 : 0.12; m.rotation.y = 0; }
  if (ud.ball) { ud.ball.rotation.z = -(e.roll || 0); ud.body.position.y = 0; }
  if (ud.man) { m.rotation.y = 0; ud.man.rotation.z = frozen ? 0 : Math.sin(step * 1.8) * 0.22; ud.body.position.y = frozen ? 0 : Math.abs(Math.sin(step * 1.8)) * 0.12; }
  if (ud.spear) ud.spear.position.x = e.throwT > 0 ? 0.1 + e.throwT * 0.02 : 0.1;
  if (ud.rifle) ud.rifle.rotation.z = e.mode === 'aim' || e.mode === 'burst' ? 0 : -0.5;
  if (e.type === 'dingding' && ud.head) ud.head.rotation.z = Math.sin(t * 3 + e.id) * 0.12;
  if (e.type === 'thief' && ud.arms && e.skill != null && e.skill < 20) ud.arms.forEach((a) => { a.rotation.z = -1.4; });
  if (ud.hinge) ud.hinge.rotation.z = e.open > 0 ? 0.65 : 0.06 + Math.sin(t * 3 + e.id) * 0.06;
  if (ud.fluff) { const s = e.squash ? 1 : 1 + Math.sin(step * 1.3) * 0.07; ud.fluff.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s)); }
  if (ud.sign) ud.sign.rotation.z = Math.sin(t * 4 + e.id) * 0.12;
  if (ud.sack) ud.sack.scale.setScalar(0.8 + Math.min(1.2, e.carry * 0.12));
  if (e.type === 'goat') {
    if (e.mode === 'wind') ud.body.rotation.z = 0.25 + Math.sin(t * 40) * 0.05;
    else if (e.mode === 'dash') ud.body.rotation.z = -0.2;
  }
  if (e.type === 'judge' && ud.arm) {
    const windup = (e.mode === 'slam' || e.mode === 'gavel') ? 1 - e.modeT / 50 : 0;
    ud.arm.rotation.z = windup ? -1.6 * windup : Math.sin(t * 2) * 0.15;
  }
  ud.cocoon.visible = e.web > 0;
  if (e.web > 0) ud.cocoon.rotation.y += 0.03;
  const born = Math.min(1, (t - m.userData.born) * 4);
  const pop = born < 1 ? 1 - Math.pow(1 - born, 3) * Math.cos(born * 6) : 1;
  const hit = e.flash > 0 ? 1 + e.flash * 0.03 : 1;
  m.scale.set(pop * hit, pop / hit, pop * hit).multiplyScalar((e.type === 'bigmao' ? 2 : 1) * (e.elite ? 1.35 : 1));
}

function syncWorld(t) {
  const h = g.hero;
  // enemies
  const seen = new Set();
  for (const e of g.enemies) {
    seen.add(e.id);
    let m = enemyModels.get(e.id);
    if (!m) { m = instantiate(tplFor(e.type)); m.userData.born = t; scene.add(m); enemyModels.set(e.id, m); }
    m.position.set(e.x, e.hop || 0, -e.y);
    const face = e.face ?? Math.atan2(h.y - e.y, h.x - e.x);
    if (!(e.stun > 0 || e.web > 0)) m.rotation.y = lerpAngle(m.rotation.y, face, 0.15);
    animateEnemy(m, e, t);
  }
  for (const [id, m] of enemyModels) if (!seen.has(id)) { scene.remove(m); enemyModels.delete(id); }

  // shots
  let n = 0;
  for (const b of g.bullets) {
    dummy.position.set(b.x, 0.5, -b.y); dummy.rotation.set(0, Math.atan2(b.vy, b.vx), 0); dummy.scale.setScalar(1);
    dummy.updateMatrix(); bulletMesh.setMatrixAt(n++, dummy.matrix);
  }
  bulletMesh.count = n; bulletMesh.instanceMatrix.needsUpdate = true;
  const counts = { bolt: 0, pearl: 0, paper: 0, hongbao: 0, sausage: 0, spear: 0 };
  for (const b of g.ebullets) {
    const mm = ebMesh[b.kind] || ebMesh.bolt, k = b.kind in counts ? b.kind : 'bolt';
    const flat = b.kind === 'paper' || b.kind === 'hongbao';
    dummy.position.set(b.x, flat ? 0.6 + Math.sin(t * 6 + b.id) * 0.1 : 0.5, -b.y);
    dummy.rotation.set(flat ? 0.4 : 0, b.kind === 'spear' ? Math.atan2(b.vy, b.vx) : flat || b.kind === 'sausage' ? t * 8 + (b.spin || 0) : 0, b.kind === 'sausage' ? t * 10 : 0);
    dummy.scale.setScalar(b.kind === 'spear' ? 1 : 1 + Math.sin(t * 12 + b.id) * 0.1);
    dummy.updateMatrix(); mm.setMatrixAt(counts[k]++, dummy.matrix);
  }
  for (const k in ebMesh) { ebMesh[k].count = counts[k]; ebMesh[k].instanceMatrix.needsUpdate = true; }

  // candy on the floor
  n = 0;
  for (const gem of g.gems) {
    dummy.position.set(gem.x, 0.22 + Math.sin(t * 4 + gem.id) * 0.06, -gem.y);
    dummy.rotation.set(0, t * 2 + gem.id, 0); dummy.scale.setScalar(1);
    dummy.updateMatrix(); gemMesh.setMatrixAt(n++, dummy.matrix);
  }
  gemMesh.count = Math.min(n, 900); gemMesh.instanceMatrix.needsUpdate = true;

  // spawn markers
  n = 0;
  for (const sp of g.spawns) {
    const blink = 0.7 + Math.abs(Math.sin(t * 10)) * 0.5;
    dummy.position.set(sp.x, 0.05, -sp.y); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(blink * (sp.type === 'judge' || sp.type === 'bigmao' ? 3 : 1));
    dummy.updateMatrix(); spawnMesh.setMatrixAt(n++, dummy.matrix);
  }
  spawnMesh.count = n; spawnMesh.instanceMatrix.needsUpdate = true;

  // telegraphed circles
  const zs = new Set();
  for (const z of g.zones) {
    zs.add(z.id);
    let m = zoneModels.get(z.id);
    if (!m) { m = makeZone(z.kind); zoneModels.set(z.id, m); }
    m.position.set(z.x, 0, -z.y);
    m.scale.setScalar(z.r);
    const k = 1 - z.t / z.T;
    m.userData.fill.scale.setScalar(Math.max(0.01, k));
    m.userData.edge.material.opacity = 0.5 + Math.abs(Math.sin(t * 12)) * 0.5;
  }
  for (const [id, m] of zoneModels) if (!zs.has(id)) { scene.remove(m); zoneModels.delete(id); }

  // bombs
  const bs = new Set();
  for (const b of g.bombs) {
    bs.add(b.id);
    let m = bombModels.get(b.id);
    if (!m) { m = instantiate(bombTpl); scene.add(m); bombModels.set(b.id, m); }
    m.position.set(b.x, 0, -b.y);
    m.userData.led.visible = Math.floor(t * (b.t < 30 ? 16 : 5)) % 2 === 0;
  }
  for (const [id, m] of bombModels) if (!bs.has(id)) { scene.remove(m); bombModels.delete(id); }

  // orbiting tornadoes and 大红
  const orb = g.orbiters || [];
  const winds = orb.filter((o) => o.kind === 'wind'), reds = orb.filter((o) => o.kind === 'dahong');
  pool(tornados, tornadoTpl, winds.length);
  winds.forEach((o, i) => {
    const m = tornados[i];
    m.position.set(o.x, 0, -o.y);
    m.userData.rings.forEach((r, j) => { r.rotation.z = t * (6 + j) * (j % 2 ? 1 : -1); r.position.x = Math.sin(t * 5 + j) * 0.06 * j; });
    m.userData.leaves.forEach((l, j) => { const a = t * 7 + j * 1.3; l.position.set(Math.cos(a) * (0.3 + j * 0.1), 0.3 + j * 0.25, Math.sin(a) * (0.3 + j * 0.1)); l.rotation.set(a, a * 2, 0); });
  });
  pool(dahongs, dahongTpl, reds.length);
  reds.forEach((o, i) => { const m = dahongs[i]; m.position.set(o.x, 0, -o.y); m.userData.box.rotation.set(t * 2, t * 3, 0); });

  // 白牛
  const b = g.bull;
  bullM.visible = !!b;
  if (b) {
    bullM.position.set(b.x, 0, -b.y);
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > 0.01) bullM.rotation.y = lerpAngle(bullM.rotation.y, Math.atan2(b.vy, b.vx), 0.2);
    const gal = t * (b.mode === 'charge' ? 22 : 12);
    bullM.userData.legs.forEach((l, i) => { l.rotation.z = sp > 0.02 ? Math.sin(gal + (i < 2 ? 0 : Math.PI) + (i % 2) * 0.5) * 0.7 : 0; });
    bullM.userData.body.rotation.z = b.mode === 'charge' ? -0.12 : 0;
    bullM.userData.body.position.y = sp > 0.02 ? Math.abs(Math.sin(gal)) * 0.1 : 0;
  }

  // elite auras
  const as = new Set();
  for (const e of g.enemies) {
    if (!e.elite) continue;
    as.add(e.id);
    let a = auraModels.get(e.id);
    if (!a) { a = new THREE.Mesh(auraGeo, new THREE.MeshBasicMaterial({ color: AURA_COL[e.elite], transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(a); auraModels.set(e.id, a); }
    a.position.set(e.x, 0.06 + (e.hop || 0), -e.y);
    a.scale.setScalar(e.r * (1.25 + Math.sin(t * 6) * 0.08));
    a.rotation.y = t * 2;
    if (Math.random() < 0.15) fx.burst(e.elite === 'tough' ? 'web' : 'gold', e.x, e.y, 1, 0.2);
  }
  for (const [id, a] of auraModels) if (!as.has(id)) { scene.remove(a); auraModels.delete(id); }

  // pickups: float, spin, and blink when about to vanish
  const ps = new Set();
  for (const p of g.pickups) {
    ps.add(p.id);
    let m = pickupModels.get(p.id);
    if (!m) { m = instantiate(pickupTpl[p.kind] ||= template(makePickup(p.kind))); m.userData.born = t; scene.add(m); pickupModels.set(p.id, m); }
    m.position.set(p.x, 0, -p.y);
    const k = Math.min(1, (t - m.userData.born) * 3);
    m.userData.icon.position.y = 0.75 + Math.sin(t * 3 + p.id) * 0.12;
    m.userData.icon.rotation.y = t * 1.6;
    m.userData.icon.scale.setScalar(k);
    m.userData.beam.material.opacity = 0.12 + Math.sin(t * 4) * 0.05;
    m.userData.ring.scale.setScalar(1 + Math.sin(t * 5) * 0.08);
    m.visible = p.t > 180 || Math.floor(t * 8) % 2 === 0;
  }
  for (const [id, m] of pickupModels) if (!ps.has(id)) { scene.remove(m); pickupModels.delete(id); }

  // white-ox stampede
  const st = g.stampede;
  const nb = st ? st.bulls.length : 0;
  while (herd.length < nb) { const b = instantiate(bullTpl); scene.add(b); herd.push(b); }
  herd.forEach((b, i) => {
    b.visible = i < nb;
    if (i >= nb) return;
    b.position.set(st.x + (i % 2) * 0.6 * -st.dir, 0, -(st.y + st.bulls[i]));
    b.rotation.y = st.dir > 0 ? 0 : Math.PI;
    const gal = t * 22 + i;
    b.userData.legs.forEach((l, j) => { l.rotation.z = Math.sin(gal + (j < 2 ? 0 : Math.PI)) * 0.8; });
    b.userData.body.position.y = Math.abs(Math.sin(gal)) * 0.12;
    b.userData.body.rotation.z = -0.12;
    if (Math.random() < 0.3) fx.burst('dust', st.x, st.y + st.bulls[i], 2, 0.1);
  });

  // tides
  const ts = new Set();
  for (const td of g.tides) {
    ts.add(td.id);
    let m = tideModels.get(td.id);
    if (!m) { m = makeTide(td.friendly); tideModels.set(td.id, m); }
    const warn = td.warn > 0;
    m.position.set(warn ? -td.dir * (AW - 0.6) : td.x, 0, 0);
    m.userData.wall.visible = !warn;
    m.userData.wall.material.uniforms.uTime.value = t;
    m.userData.floor.material.opacity = warn ? 0.15 + Math.abs(Math.sin(t * 8)) * 0.3 : 0.35;
    if (!warn && Math.random() < 0.8) fx.burst('web', td.x, (Math.random() * 2 - 1) * AH, 2, 0.3);
  }
  for (const [id, m] of tideModels) if (!ts.has(id)) { scene.remove(m); tideModels.delete(id); }

  // 陈伟's laser sight while aiming
  const aimers = g.enemies.filter((e) => e.type === 'chenwei' && e.mode === 'aim');
  while (lasers.length < aimers.length) { const l = new THREE.Mesh(laserGeo, laserMat); scene.add(l); lasers.push(l); }
  lasers.forEach((l, i) => {
    l.visible = i < aimers.length;
    if (i >= aimers.length) return;
    const e = aimers[i], dx = e.aimX - e.x, dy = e.aimY - e.y;
    l.position.set(e.x, 0.95, -e.y); l.rotation.y = Math.atan2(dy, dx); l.scale.set(Math.hypot(dx, dy) + 2, 1, 1);
  });

  // 蔡博 running across
  const run = g.hubbyRun;
  hubby.visible = !!run;
  if (run) {
    hubby.position.set(run.x, 0, -run.y);
    hubby.rotation.y = run.dir > 0 ? 0 : Math.PI;
    const r = t * 26;
    hubby.userData.legs.forEach((l, i) => { l.rotation.z = Math.sin(r + i * Math.PI) * 0.9; });
    hubby.userData.arms.forEach((a, i) => { a.rotation.z = Math.sin(r + (i ? 0 : Math.PI)) * 1.1; });
    hubby.userData.body.rotation.z = -0.25;
    if (Math.random() < 0.6) fx.burst('dust', run.x - run.dir * 0.4, run.y, 2, 0.1);
  }
}

function syncTitle(t) {
  showcase.visible = true;
  turtle.position.set(0, 0, 0);
  turtle.rotation.y = t * 0.6;
  const ud = turtle.userData;
  ud.body.position.y = Math.abs(Math.sin(t * 3)) * 0.12;
  ud.legs.forEach((l, i) => { l.rotation.z = Math.sin(t * 6 + (i % 2) * Math.PI) * 0.5; });
  ud.gun.rotation.y = Math.sin(t) * 0.8;
  ud.head.rotation.y = Math.sin(t * 0.9) * 0.4;
  turtle.visible = true; shieldBubble.visible = false;
  heroRing.visible = pickupRing.visible = false;
  for (const m of showcase.children) {
    const p = m.userData.phase;
    m.userData.body.position.y = Math.abs(Math.sin(t * 3 + p)) * 0.18;
    if (m.userData.legs) m.userData.legs.forEach((l, i) => { l.rotation.z = Math.sin(t * 6 + p + (i % 2) * Math.PI) * 0.4; });
    if (m.userData.arms) m.userData.arms.forEach((a, i) => { a.rotation.z = Math.sin(t * 5 + p + (i % 2) * Math.PI) * 0.8; });
    if (m.userData.hinge) m.userData.hinge.rotation.z = 0.1 + Math.abs(Math.sin(t * 2)) * 0.4;
    if (m.userData.disc) m.userData.disc.rotation.z = -t * 3;
    // flat cookies turn to face the orbiting camera
    if (m.userData.disc || m.userData.man) m.rotation.y = Math.atan2(camera.position.x - m.position.x, camera.position.z - m.position.z);
  }
}

// ---------- flow ----------
let lastState = null;
function onState(s) {
  ui.show(s);
  stick.active = false; stickEl.hidden = true;
  if (s === 'title') {
    clearDynamic(); ui.clearLabels();
    world.setDay(0.35, true);
    world.setSnow(false);
    audio.setMusic({ on: true, calm: true });
    bullM.visible = hubby.visible = horseM.visible = bikeM.visible = false; herd.forEach((b) => { b.visible = false; }); pool(tornados, tornadoTpl, 0); pool(dahongs, dahongTpl, 0);
    for (const m of [bulletMesh, gemMesh, spawnMesh, ...Object.values(ebMesh)]) m.count = 0;
  } else {
    showcase.visible = false;
    heroRing.visible = pickupRing.visible = true;
  }
  if (s === 'pick') { ui.resetPick(); audio.setMusic({ on: true, calm: true, wave: g.wave }); }
  if (s === 'play' && lastState === 'pick') audio.setMusic({ on: true, wave: g.wave, boss: g.bossWave });
  if (s === 'pause') audio.setMusic({ on: false });
  if (s === 'play' && lastState === 'pause') audio.setMusic({ on: true, wave: g.wave, boss: g.bossWave });
  if (s === 'over') { ui.renderOver(g); audio.setMusic({ on: false }); }
  if (s === 'win') { ui.renderWin(g); audio.setMusic({ on: true, calm: true }); fx.burst('gold', g.hero.x, g.hero.y, 80); }
  lastState = s;
}

function drainEvents() {
  for (const ev of g.events) {
    switch (ev.type) {
      case 'sfx': audio.sfx(ev.name); break;
      case 'voice': audio.babble(ev.text); break;
      case 'pop': ui.pop(ev.x, ev.y, ev.text, ev.cls); break;
      case 'dmg': ui.dmg(ev.x, ev.y, ev.n, ev.crit); break;
      case 'burst': fx.burst(ev.kind, ev.x, ev.y, ev.n); break;
      case 'ring': fx.ring(ev.x, ev.y, ev.r, ev.kind); break;
      case 'shake': cam.shake = Math.max(cam.shake, ev.amt); break;
      case 'hurt': ui.hurtFlash(); world.hurt(); heroHurt = 36; break;
      case 'flashbang': world.flash(1); ui.toast('闪光弹！', 'warn'); break;
      case 'hitstop': hitstop = Math.max(hitstop, ev.frames); break;
      case 'streak': ui.streak(ev.text, ev.n, ev.tier); world.flash(0.12); break;
      case 'pickup': ui.toast('拾取 · ' + ev.text, 'pickup', PICKUP_COL[ev.kind]); fx.ring(ev.x, ev.y, 2.2, 'voice'); break;
      case 'elite': ui.toast(ev.name + ' 出现了！', 'elite'); cam.zoom = 1.1; break;
      case 'eliteDown': fx.burst('gold', ev.x, ev.y, 50); fx.ring(ev.x, ev.y, 3, 'boom'); break;
      case 'tideWarn': ui.banner('潮汐来了！', ev.dir > 0 ? '从左边冲过来 →' : '← 从右边冲过来', false); break;
      case 'stampede': ui.toast('白牛冲锋！', 'pickup', '#ffffff'); break;
      case 'waveEnd': world.flash(0.25); break;
      case 'cleanup': ui.banner('清场', '打完场上的敌人，再选海克斯'); break;
      case 'fire': muzzle = 1; break;
      case 'ult': fx.superSpider(ev.x, ev.y); cam.zoom = 1.18; break;
      case 'meteor': fx.meteor(ev.x, ev.y, ev.t); break;
      case 'horse': fx.burst('dust', g.hero.x, g.hero.y, 20); break;
      case 'wave':
        ui.banner(ev.boss ? 'BOSS' : `第 ${ev.n} 波`, WAVE_SUBS[ev.n], ev.boss);
        world.setDay((ev.n - 1) / (WAVES - 1));
        world.setSnow(ev.n === 5);
        audio.setMusic({ on: true, wave: ev.n, boss: ev.boss });
        break;
      case 'levelup': fx.burst('gold', g.hero.x, g.hero.y, 30); fx.ring(g.hero.x, g.hero.y, 1.6, 'star'); ui.pop(g.hero.x, g.hero.y, '升级！', 'big'); ui.toast(`Lv ${ev.lvl} · ${ev.text}`, 'level'); break;
      case 'shieldBreak': fx.burst('web', g.hero.x, g.hero.y, 20); break;
      case 'boss': cam.zoom = 1.25; break;
    }
  }
  g.events.length = 0;
}

// adaptive quality: drop bloom, then resolution, if frames run long
let quality = phone ? 0 : 2, slow = 0, fast = 0;
function adapt(dt) {
  if (g.state !== 'play') return;
  if (dt > 1 / 40) slow++; else if (dt < 1 / 58) fast++;
  if (slow + fast < 120) return;
  if (slow > 60 && quality > (phone ? -1 : 0)) { quality--; world.setQuality(quality); onResize(); }
  slow = fast = 0;
}

function onResize() {
  world.resize();
  fx.setScale(renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))));
}
addEventListener('resize', onResize);
onResize();

let last = performance.now(), acc = 0, hitstop = 0;
let lastHud = 0, lastLabels = 0, lastRender = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  const t = now / 1000;
  acc += dt;
  let steps = 0;
  while (acc >= 1 / HZ && steps < 4) {
    if (hitstop > 0) { hitstop--; acc -= 1 / HZ; steps++; continue; }
    const mv = readMove();
    step(g, { ...mv, pressed: { ...pressed } });
    for (const k in pressed) delete pressed[k];
    acc -= 1 / HZ; steps++;
    if (g.state !== lastState) onState(g.state);
    drainEvents();
  }
  if (steps === 4) acc = 0;
  adapt(dt);
  cam.zoom += (1 - cam.zoom) * (1 - Math.exp(-dt * 1.5));

  if (g.state === 'title') syncTitle(t);
  else if (g.hero) { syncHero(t); syncWorld(t); }
  if (g.state === 'pick' && g.offer) ui.renderPick(g, (i) => { press('pick', i); });
  if (g.hero && g.state !== 'title' && (!phone || now - lastHud >= 100)) { ui.hud(g); lastHud = now; }
  if (!phone || now - lastLabels >= 33) { ui.updateLabels(g); lastLabels = now; }
  fx.update();
  world.update(t, dt);
  frameCamera(t, dt);
  if (!phone || now - lastRender >= 33) { world.render(); lastRender = now; }
}
onState('title');
$('startBtn').disabled = false;
$('startBtn').textContent = '开始';
requestAnimationFrame(frame);

// tiny debug handle for testing from the console
window.__xo = { g, ENEMY_NAMES, setQuality: (q) => { quality = q; world.setQuality(q); onResize(); } };
