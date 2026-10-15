import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { G } from './state.js';
import { B, clamp } from './util.js';
import { Input } from './input.js';
import { Effects } from './effects.js';
import { Audio } from './audio.js';
import { Hud } from './hud.js';
import { City } from './city.js';
import { Sky } from './sky.js';
import { Traffic } from './traffic.js';
import { Peds } from './peds.js';
import { Combat, WEAPONS } from './combat.js';
import { Player } from './player.js';
import { CameraRig, CAM_MODES } from './camera.js';
import { Police } from './police.js';
import { Pickups } from './pickups.js';
import { MissionDirector } from './missions.js';
import { Speech } from './speech.js';
import { WeaponWheel } from './wheel.js';
import { Shop } from './shop.js';
import { Interiors } from './interiors.js';
import { pick } from './util.js';
import { WHEEL_ORDER } from './combat.js';
import { installHeightFog } from './shaderfx.js';
import { Cheats } from './cheats.js';
installHeightFog();

const START = { x: 5 * B - 30, z: 5 * B + 13.2 };
const appEl = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
let pr = Math.min(window.devicePixelRatio || 1, 1.5);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
appEl.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.2, 1800);
let sizeW = 0, sizeH = 0;
let composer = null, gtao = null, bloom = null, grade = null;
function fit() {
  if (sizeW === innerWidth && sizeH === innerHeight) return;
  sizeW = innerWidth; sizeH = innerHeight; camera.aspect = sizeW / sizeH; camera.updateProjectionMatrix();
  renderer.setPixelRatio(pr); renderer.setSize(sizeW, sizeH, false);
  if (composer) { composer.setPixelRatio(pr); composer.setSize(sizeW, sizeH); if (gtao) gtao.setSize(Math.round(sizeW * pr * 0.6), Math.round(sizeH * pr * 0.6)); if (bloom) bloom.setSize(Math.round(sizeW * pr * 0.5), Math.round(sizeH * pr * 0.5)); }
}
window.addEventListener('resize', fit);
fit();

Object.assign(G, { scene, renderer, state: 'intro', stats: { kills: 0, jacked: 0, jobs: 0, cops: 0, mugged: 0 }, timeScale: 1, wheelOpen: false });
G.input = new Input(renderer.domElement);
G.fx = new Effects(scene);
G.audio = new Audio();
G.hud = new Hud();
G.city = new City(scene);
G.sky = new Sky(scene, renderer);
G.traffic = new Traffic();
G.peds = new Peds();
G.combat = new Combat();
G.player = new Player();
G.camRig = new CameraRig(camera);
G.police = new Police();
G.pickups = new Pickups();
G.missions = new MissionDirector();
G.speech = new Speech();
G.wheel = new WeaponWheel();
G.shop = new Shop();
G.interiors = new Interiors();
G.cheats = new Cheats();

/* ---------- post-processing: ambient occlusion, bloom, tone-map, film grade ---------- */
{
  const w = innerWidth, h = innerHeight;
  const rt = new THREE.WebGLRenderTarget(w * pr, h * pr, { type: THREE.HalfFloatType });
  composer = new EffectComposer(renderer, rt); composer.setPixelRatio(pr); composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));
  gtao = new GTAOPass(scene, camera, Math.round(w * pr * 0.6), Math.round(h * pr * 0.6));
  gtao.output = GTAOPass.OUTPUT.Default; gtao.blendIntensity = 1;
  gtao.updateGtaoMaterial({ radius: 1.8, distanceExponent: 1.4, thickness: 2.2, scale: 1.25, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  // keep sprites / particles / transparent overlays out of the AO depth+normal pre-pass
  gtao._overrideVisibility = function () {
    const cache = this._visibilityCache;
    this.scene.traverse((o) => { if ((o.isPoints || o.isLine || o.isSprite || (o.userData && o.userData.noAO)) && o.visible) { o.visible = false; cache.push(o); } });
  };
  gtao.enabled = false; // optional: press O (costly on weaker GPUs)
  composer.addPass(gtao);
  bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.3, 0.6, 0.9); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.addPass(new SMAAPass(w * pr, h * pr));
  grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, time: { value: 0 }, vig: { value: 0.55 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float time; uniform float vig; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){
        vec2 d=vUv-0.5; float r=dot(d,d);
        vec3 c; c.r=texture2D(tDiffuse,vUv+d*0.0035*r).r; c.g=texture2D(tDiffuse,vUv).g; c.b=texture2D(tDiffuse,vUv-d*0.0035*r).b;
        c=mix(c,c*c*(3.0-2.0*c),0.22);
        float l=dot(c,vec3(0.299,0.587,0.114)); c=mix(vec3(l),c,0.96);
        c*=1.0-smoothstep(0.12,0.62,r)*vig;
        c+=(hash(vUv*vec2(1731.0,1093.0)+time)-0.5)*0.022;
        gl_FragColor=vec4(c,1.0);
      }`,
  });
  composer.addPass(grade);
}

G.carLight = new THREE.SpotLight(0xfff0cc, 0, 90, 0.5, 0.5, 2); scene.add(G.carLight, G.carLight.target);
const P = G.player;
P.x = START.x; P.z = START.z; P.a = 0; G.camRig.yaw = 0;
G.traffic.create('sport', START.x + 2, START.z - 4.6, 0, 0xd62828);
for (let i = 0; i < 28; i++) G.traffic.spawn('civ', true);
for (let i = 0; i < 24; i++) G.traffic.spawn('park', true);
for (let i = 0; i < 56; i++) G.peds.spawn(true);
G.hud.setRadio('Chill FM 98.7 (plays in cars)');
const resumed = G.missions.applySave();
document.getElementById('btnCheats').addEventListener('click', (e) => { e.stopPropagation(); setPaused(false); G.cheats.show(); });
document.getElementById('btnNew').addEventListener('click', () => { if (confirm('Erase your saved progress and start over?')) { G.missions.reset(); location.reload(); } });

function respawn() {
  const home = G.missions && G.missions.respawnPoint ? G.missions.respawnPoint() : START;
  P.dead = false; P.hp = 100; G.drunk = 0; P.x = home.x; P.z = home.z; P.vx = P.vz = 0; P.bust = 0; P.a = 0; P.model.root.rotation.z = 0; P.jumpY = P.jumpV = 0;
  G.camRig.inited = false; G.camRig.pitch = 0.3; G.combat.bullets.length = 0;
  const lost = Math.floor(G.money * 0.15) + (P.kind === 'BUSTED' ? 250 : 150); G.money = Math.max(0, G.money - lost);
  if (P.kind === 'BUSTED') { for (const i of [1, 2, 3, 4, 5, 6]) P.ammo[i] = Math.floor(P.ammo[i] / 2); }
  G.police.reset(); G.camRig.yaw = 0; document.getElementById('big').classList.remove('show');
  if (!G.traffic.cars.some((c) => !c.dead && Math.hypot(c.x - START.x, c.z - START.z) < 12)) G.traffic.create('sport', START.x + 2, START.z - 4.6, 0, 0xd62828);
  G.hud.toast(`Back on your feet. ${P.kind === 'BUSTED' ? 'Bail (and half your ammo was confiscated)' : 'Hospital bills'}: -$${lost}`, 3.5);
}

/* ---------- state / UI ---------- */
function start() {
  document.body.classList.add('started'); G.state = 'play'; G.input.enabled = true; G.audio.resume();
  try { const r = renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (_) { /* not available */ }
  if (resumed) G.hud.toast(`Welcome back. Story ${G.missions.prog.story}/5 · $${Math.floor(G.money).toLocaleString()}`, 4);
  else G.hud.toast('Grab the red sports car (E) and drive to Vinnie at the docks — the yellow ★ on your map.', 6);
}
document.getElementById('intro').addEventListener('click', start);
function setPaused(p) {
  if (p && G.state === 'play') {
    G.state = 'pause'; document.getElementById('pause').classList.add('on');
    const s = G.stats; document.getElementById('pauseStats').innerHTML = `Money $${Math.floor(G.money).toLocaleString()}<br>Jobs done ${s.jobs} · Cars jacked ${s.jacked}<br>Pedestrians down ${s.kills} · Cops down ${s.cops} · Mugged ${s.mugged}<br>Story ${G.missions.prog.story}/5${G.missions.prog.safehouse ? ' · Safehouse owned' : ''}${G.missions.prog.best ? ' · Skyway best ' + G.missions.prog.best.toFixed(1) + 's' : ''}`;
    if (document.pointerLockElement) document.exitPointerLock();
  } else if (!p && G.state === 'pause') { G.state = 'play'; document.getElementById('pause').classList.remove('on'); try { const r = renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (_) { /* needs a gesture */ } }
}
document.getElementById('btnResume').addEventListener('click', () => { setPaused(false); try { renderer.domElement.requestPointerLock(); } catch (_) { /* ignore */ } });
let hadLock = false;
document.addEventListener('pointerlockchange', () => { if (document.pointerLockElement) hadLock = true; else if (hadLock && G.state === 'play' && !G.shop.open) { hadLock = false; setPaused(true); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) setPaused(true); });

/* ---------- simulation ---------- */
function handleActions(a) {
  if (a.cheats && G.state === 'play') G.cheats.toggle();
  if (G.cheats.open && G.state === 'play') { if (a.weapon >= 0) G.cheats.choose(a.weapon); if (a.pause) G.cheats.close(); return; }
  if (G.shop.open && G.state === 'play') { if (a.weapon >= 0) G.shop.choose(a.weapon); if (a.use || a.pause) G.shop.close(); return; }
  if (a.ao && G.state === 'play') { gtao.enabled = !gtao.enabled; G.hud.toast(`Ambient occlusion: ${gtao.enabled ? 'on' : 'off'}`, 1.6); }
  if (a.pause) setPaused(G.state === 'play');
  if (G.state !== 'play') return;
  if (a.use) P.useVehicle();
  if (a.camera) G.hud.toast(`Camera: ${CAM_MODES[(G.camRig.mode + 1) % CAM_MODES.length]}`, 1.2), G.camRig.cycle();
  if (a.radio) { const label = G.audio.toggleRadio(); if (label) G.hud.setRadio(label); }
  if (a.horn && P.car) { P.car.horn = 0.45; }
  if (a.siren && P.car && P.car.type === 'cop') { P.sirenOn = !P.sirenOn; }
  if (a.weapon >= 0 && !P.car) { if (!P.setWeapon(WHEEL_ORDER[a.weapon])) G.hud.toast(P.owned[WHEEL_ORDER[a.weapon]] ? 'No ammo' : 'You don\'t own that weapon', 1.4); }
  if (a.wheel && !P.car && !G.wheelOpen) P.cycleWeapon(a.wheel > 0 ? 1 : -1);
}

let sprayCd = 0, insideT = 0;
function sprayCheck(dt) {
  sprayCd -= dt; const c = P.car; if (!c || sprayCd > 0 || c.dead) return;
  for (const d of G.city.doors) {
    if (!d.drive) continue; const z = d.zone;
    if (c.x > z.x && c.x < z.x + z.w && c.z > z.z && c.z < z.z + z.d && Math.abs(c.fw) < 11) {
      if (G.wanted > 0 && G.wantedT < 2) { sprayCd = 2; G.hud.toast("Pay'n'Spray: lose the cops' line of sight first!", 2); return; }
      sprayCd = 30; const price = 150 * Math.max(1, G.wanted);
      if (G.money < price) { G.hud.toast(`Pay'n'Spray: you need $${price}`, 2.4); return; }
      c.vx = c.vz = 0; c.thr = 0;
      G.hud.fade(() => {
        G.money -= price; c.hp = c.def.hp; c.col = c.type === 'cop' ? 0x1c3f94 : pick([0xc0392b, 0x2c6fbb, 0x1c1c20, 0x2e8b57, 0xd98c1f, 0x7d3c98, 0xe8e8e8]);
        c.model.paint.color.setHex(c.col); G.police.reset(); G.hud.toast(`Resprayed and repaired. The cops lost your trail. (-$${price})`, 3.5);
      }, 700);
      return;
    }
  }
}

function tick(dt, play) {
  G.time += dt;
  const focus = new THREE.Vector3(P.x, 0, P.z);
  G.night = G.sky.update(dt, focus);
  G.city.update(G.night, G.time);
  const inside = !!P.inside;
  if (play) { G.cheats.update(); P.update(dt); G.missions.update(dt); }
  G.interiors.update(dt);
  if (!inside) { // the street freezes while you are in a shop
    const n = dt > 0.026 ? 2 : 1;
    for (let i = 0; i < n; i++) { G.traffic.update(dt / n); G.peds.update(dt / n); G.combat.update(dt / n); }
    { const c = P.car; if (c && !c.dead && G.night > 0.05) { const ca = Math.cos(c.a), sa = Math.sin(c.a); G.carLight.position.set(c.x + ca * c.def.len * 0.45, 0.9, c.z + sa * c.def.len * 0.45); G.carLight.target.position.set(c.x + ca * 32, 0, c.z + sa * 32); G.carLight.intensity = G.night * 1100; } else G.carLight.intensity = 0; G.carLight.visible = G.carLight.intensity > 0; }
    G.police.update(dt); G.pickups.update(dt); sprayCheck(dt); insideT = 0;
    G.city.signals.update(dt, G.time); G.city.updateFountains(dt);
  } else {
    G.carLight.intensity = 0; G.carLight.visible = false; insideT += dt;
    if (G.wanted > 0 && G.wanted <= 2 && insideT > 15) { insideT = 0; G.wanted--; G.heat = G.wanted; G.hud.toast(G.wanted ? 'Wanted level decreased' : 'The heat died down', 2.5); }
  }
  G.fx.update(dt); G.speech.update(dt);
  if (P.dead && P.dt > 3.9) respawn();
  G.audio.update(dt);
}

let lowFps = 0, degraded = false, tier = 0;
let lastT = performance.now();
function frame() {
  requestAnimationFrame(frame);
  const now = performance.now(), raw = Math.min(0.25, (now - lastT) / 1000), dt = Math.min(raw, 1 / 20); lastT = now;
  if (!degraded) {
    lowFps = raw > 1 / 24 ? lowFps + raw : 0;
    if (lowFps > 3.5) {
      lowFps = 0; tier++;
      if (tier === 1) { gtao.enabled = false; if (pr > 1.25) { pr = 1.25; sizeW = 0; fit(); } }
      else if (tier === 2) { pr = 1; sizeW = 0; fit(); bloom.enabled = false; }
      else { degraded = true; G.sky.sun.castShadow = false; }
    }
  }
  fit();
  let { a, lx, ly } = G.input.consume();
  handleActions(a);
  { // weapon wheel: hold Q / Tab, slows time and steals the mouse
    const k = G.input.keys, want = (k.has('KeyQ') || k.has('Tab')) && G.state === 'play' && !P.car && !P.dead;
    if (want && !G.wheel.open) { G.wheel.begin(); G.wheelOpen = true; }
    if (G.wheel.open) {
      if (document.pointerLockElement) G.wheel.move(lx, ly, false); else G.wheel.move(G.input.mx - innerWidth / 2, G.input.my - innerHeight / 2, true);
      lx = ly = 0;
      if (!want) { G.wheel.end(); G.wheelOpen = false; }
    }
    G.timeScale += ((G.wheelOpen ? 0.12 : 1) - G.timeScale) * Math.min(1, dt * 14);
  }
  const play = G.state === 'play', intro = G.state === 'intro';
  if (play || intro) tick(dt * G.timeScale, play);
  if (G.state !== 'pause') {
    G.traffic.sync(dt); P.sync(dt);
    G.camRig.update(dt, play ? lx : 0, play ? ly : 0, performance.now() - G.input.lastLook < 120, intro);
    if (G.drunk > 0) { // a few drinks at the bar: the world sways
      G.drunk = Math.max(0, G.drunk - dt); const k = Math.min(1, G.drunk / 8), t = performance.now() / 1000;
      camera.rotation.z += Math.sin(t * 1.3) * 0.07 * k; camera.position.x += Math.sin(t * 0.9) * 0.3 * k; camera.position.y += Math.sin(t * 1.7) * 0.15 * k;
    }
    G.fx.setTracers(G.combat.bullets);
  }
  G.fx.setViewport(renderer.domElement.height, camera.fov);
  if (!intro) G.hud.update(dt);
  grade.uniforms.time.value = G.time % 100; grade.uniforms.vig.value = 0.55 + Math.min(1, (G.drunk || 0) / 8) * 0.35;
  bloom.strength = 0.16 + G.night * 0.22; bloom.threshold = 0.95 - G.night * 0.1;
  composer.render();
}
requestAnimationFrame(frame);
window.__step = (dt = 1 / 30, n = 1) => { for (let i = 0; i < n; i++) { tick(dt, true); G.traffic.sync(dt); P.sync(dt); } }; // test hook
window.__g = G; window.__post = { composer, gtao, bloom, grade, renderer, setPr: (v) => { pr = v; sizeW = 0; fit(); } };
