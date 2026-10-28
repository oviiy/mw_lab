// Every character and prop is built from primitives here: cel-shaded materials, an inked
// outline from back-face hulls, and small named parts the renderer animates.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ---------- materials ----------
const gradient = (() => {
  const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const matCache = new Map();
// A fresnel rim on every cel-shaded surface, so characters pop off the paving. The world
// shifts its colour from warm daylight to a cool moonlit edge as the waves go on.
export const rim = { color: { value: new THREE.Color('#fff0d8') }, k: { value: 0.4 } };
function withRim(m) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRim = rim.color; sh.uniforms.uRimK = rim.k;
    sh.fragmentShader = 'uniform vec3 uRim; uniform float uRimK;\n' + sh.fragmentShader.replace(
      '#include <opaque_fragment>',
      'float rimF = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);\noutgoingLight += uRim * rimF * uRimK;\n#include <opaque_fragment>');
  };
  m.customProgramCacheKey = () => 'rim-toon';
  return m;
}
export function toon(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, withRim(new THREE.MeshToonMaterial({ color, gradientMap: gradient, ...opts })));
  return matCache.get(key);
}
export function glow(color, intensity = 2) {
  const key = 'glow' + color + intensity;
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.4 }));
  return matCache.get(key);
}
export function glossy(color, opts = {}) {
  const key = 'gl' + color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshPhysicalMaterial({ color, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1, ...opts }));
  return matCache.get(key);
}
const inkMat = new THREE.MeshBasicMaterial({ color: '#1d1a24', side: THREE.BackSide });

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}
const sphere = (r, seg = 18) => new THREE.SphereGeometry(r, seg, Math.max(8, seg * 0.7 | 0));

// Inked outlines: a slightly larger back-face copy behind each solid part.
function ink(group, k = 0.045) {
  const list = [];
  group.traverse((o) => { if (o.isMesh && !o.userData.noInk && o.material !== inkMat) list.push(o); });
  for (const m of list) {
    m.geometry.computeBoundingSphere();
    const r = m.geometry.boundingSphere.radius * Math.max(m.scale.x, m.scale.y, m.scale.z);
    if (r < 0.06) continue;
    const hull = new THREE.Mesh(m.geometry, inkMat);
    hull.scale.setScalar(1 + k / Math.max(r, 0.12));
    hull.userData.noInk = true;
    m.add(hull);
  }
  return group;
}

const shineMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
function eyes(parent, x, y, z, r = 0.075, look = 1) {
  const out = [];
  for (const s of [-1, 1]) {
    const w = mesh(sphere(r, 16), toon('#ffffff'), x, y, z * s);
    const p = mesh(sphere(r * 0.62, 14), toon('#1d1a24'), r * 0.52 * look, 0, 0);
    const shine = mesh(sphere(r * 0.24, 8), shineMat, r * 0.88, r * 0.32, -r * 0.15);
    const shine2 = mesh(sphere(r * 0.11, 6), shineMat, r * 0.9, -r * 0.22, r * 0.12);
    p.userData.noInk = shine.userData.noInk = shine2.userData.noInk = true;
    w.add(p, shine, shine2);
    parent.add(w);
    out.push(w);
  }
  return out;
}

// ---------- the turtle ----------
export function makeTurtle() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const shellGreen = '#3f8f45', plate = '#79c46c', skin = '#9edb84', cream = '#f2dc96', pink = '#ff6fae';

  const shell = mesh(new THREE.SphereGeometry(0.56, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), toon(shellGreen));
  shell.scale.set(1, 0.78, 0.9);
  shell.position.y = 0.24;
  body.add(shell);
  // hexagonal plates laid onto the dome
  const plateGeo = new THREE.CylinderGeometry(0.15, 0.16, 0.05, 6);
  const up = new THREE.Vector3(0, 1, 0);
  const spots = [[0, 0]];
  for (let i = 0; i < 6; i++) spots.push([0.62, i * Math.PI / 3]);
  for (let i = 0; i < 10; i++) spots.push([1.12, i * Math.PI / 5 + 0.3]);
  for (const [th, ph] of spots) {
    const n = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
    const p = mesh(plateGeo, toon(th > 1 ? '#5aa752' : plate));
    p.position.set(n.x * 0.56, n.y * 0.56 * 0.78 + 0.24, n.z * 0.56 * 0.9);
    p.quaternion.setFromUnitVectors(up, new THREE.Vector3(n.x, n.y / 0.78, n.z / 0.9).normalize());
    p.scale.setScalar(th > 1 ? 0.75 : 1);
    p.userData.noInk = true;
    body.add(p);
  }
  const rim = mesh(new THREE.TorusGeometry(0.53, 0.07, 10, 40), toon(cream), 0, 0.24, 0);
  rim.rotation.x = Math.PI / 2; rim.scale.set(1, 0.9, 1);
  body.add(rim);
  const belly = mesh(new THREE.CylinderGeometry(0.5, 0.44, 0.14, 32), toon(cream), 0, 0.17, 0);
  belly.scale.z = 0.9;
  body.add(belly);

  // head on a neck pivot so it can bob and look around
  const head = new THREE.Group();
  head.position.set(0.6, 0.42, 0);
  body.add(head);
  head.add(mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.26, 12).rotateZ(Math.PI / 2.6), toon(skin), -0.12, -0.08, 0));
  const skull = mesh(sphere(0.27, 22), toon(skin));
  skull.scale.set(1.05, 0.95, 1);
  head.add(skull);
  const eyeList = eyes(head, 0.17, 0.07, 0.12, 0.09);
  // lashes ride on the eyes so they close together when she blinks
  for (const [i, w] of eyeList.entries()) {
    const s = i ? 1 : -1;
    for (let k = 0; k < 3; k++) {
      const lash = mesh(new THREE.BoxGeometry(0.012, 0.055, 0.012), toon('#1d1a24'), 0.03, 0.09, (k - 1) * 0.03 * s + 0.02 * s);
      lash.rotation.x = (k - 1) * 0.35 * s; lash.rotation.z = -0.35; lash.userData.noInk = true;
      w.add(lash);
    }
  }
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const f = mesh(sphere(0.012, 6), toon('#5aa752'), 0.05 + k * 0.035, 0.16 - k * 0.02, 0.17 * s); f.userData.noInk = true; head.add(f); }
  for (const s of [-1, 1]) { const c = mesh(sphere(0.055, 10), toon('#ff9fbf'), 0.16, -0.06, 0.19 * s); c.scale.set(0.5, 0.6, 1); c.userData.noInk = true; head.add(c); }
  const smile = mesh(new THREE.TorusGeometry(0.06, 0.014, 6, 12, Math.PI), toon('#2d5a27'), 0.255, -0.06, 0);
  smile.rotation.set(0, Math.PI / 2, Math.PI); smile.userData.noInk = true;
  head.add(smile);
  // pink gaming headset
  const band = mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 26, Math.PI).rotateY(Math.PI / 2), toon(pink), -0.02, 0.02, 0);
  head.add(band);
  for (const s of [-1, 1]) {
    const cup = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 18).rotateX(Math.PI / 2), toon(pink), -0.02, 0.0, 0.29 * s);
    cup.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 14).rotateX(Math.PI / 2), glow('#ffd1e8', 1.4), 0, 0, 0.045 * s));
    head.add(cup);
  }
  const mic = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.34, 6).rotateZ(Math.PI / 2.3), toon('#2a2a33'), 0.12, -0.12, 0.27);
  mic.rotation.y = 0.35; mic.userData.noInk = true;
  head.add(mic);
  head.add(mesh(sphere(0.035, 8), toon('#2a2a33'), 0.27, -0.2, 0.22));
  // bow on the shell
  const bow = new THREE.Group();
  bow.position.set(-0.12, 0.7, 0);
  for (const s of [-1, 1]) { const c = mesh(new THREE.ConeGeometry(0.11, 0.2, 4).rotateX(s * Math.PI / 2), toon(pink), 0, 0, 0.1 * s); c.scale.y = 0.6; bow.add(c); }
  bow.add(mesh(sphere(0.06, 10), toon('#ff4f99')));
  body.add(bow);

  const legs = [];
  for (const [x, z] of [[0.3, 0.33], [0.3, -0.33], [-0.28, 0.33], [-0.28, -0.33]]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.2, z);
    pivot.add(mesh(new THREE.CapsuleGeometry(0.1, 0.1, 4, 10), toon(skin), 0, -0.08, 0));
    for (let k = -1; k <= 1; k++) { const nail = mesh(sphere(0.025, 6), toon('#ff8fbf'), 0.09, -0.19, k * 0.045); nail.userData.noInk = true; pivot.add(nail); }
    body.add(pivot);
    legs.push(pivot);
  }
  body.add(mesh(new THREE.ConeGeometry(0.07, 0.22, 8).rotateZ(Math.PI / 2), toon(skin), -0.62, 0.18, 0));

  // gun on its own pivot so it can aim away from where she walks
  const gun = new THREE.Group();
  gun.position.set(0, 0.42, 0);
  const barrel = new THREE.Group();
  barrel.position.set(0.0, 0, 0.52);
  barrel.add(mesh(new THREE.BoxGeometry(0.46, 0.13, 0.12), toon('#2c2c38'), 0.12, 0, 0));
  barrel.add(mesh(new THREE.BoxGeometry(0.12, 0.18, 0.08), toon('#2c2c38'), -0.02, -0.1, 0));
  barrel.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 8).rotateZ(Math.PI / 2), toon('#55556a'), 0.41, 0.02, 0));
  const sticker = mesh(new THREE.BoxGeometry(0.12, 0.06, 0.125), toon(pink), 0.14, 0.02, 0);
  sticker.userData.noInk = true;
  barrel.add(sticker);
  const flash = mesh(sphere(0.12, 10), new THREE.MeshBasicMaterial({ color: '#fff3a8', transparent: true, opacity: 0 }), 0.55, 0.02, 0);
  flash.userData.noInk = true; flash.userData.noBake = true; flash.castShadow = false;
  barrel.add(flash);
  gun.add(barrel);
  g.add(gun);

  ink(g);
  g.userData = { body, head, legs, gun, barrel, flash, bow, eyes: eyeList };
  return g;
}

// ---------- people ----------
function person({ shirt, pants = '#2b2d3a', skin = '#f3c79a', hair = '#2a1e18', h = 1, headless = false } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const legs = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(0, 0.5 * h, 0.12 * s);
    pivot.add(mesh(new THREE.CapsuleGeometry(0.08, 0.32 * h, 4, 8), toon(pants), 0, -0.24 * h, 0));
    body.add(pivot); legs.push(pivot);
  }
  const torso = mesh(new THREE.CapsuleGeometry(0.2, 0.3 * h, 6, 14), toon(shirt), 0, 0.82 * h, 0);
  torso.scale.z = 0.85;
  body.add(torso);
  const arms = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(0, 0.98 * h, 0.27 * s);
    pivot.add(mesh(new THREE.CapsuleGeometry(0.065, 0.3 * h, 4, 8), toon(shirt), 0, -0.18 * h, 0));
    body.add(pivot); arms.push(pivot);
  }
  const head = new THREE.Group();
  head.position.y = 1.3 * h;
  body.add(head);
  g.userData = { body, legs, arms, head };
  if (headless) return g;
  head.add(mesh(sphere(0.22, 18), toon(skin)));
  const hairCap = mesh(new THREE.SphereGeometry(0.235, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(hair), -0.02, 0.02, 0);
  head.add(hairCap);
  eyes(head, 0.17, 0.02, 0.08, 0.05);
  body.add(head);
  g.userData = { body, legs, arms, head };
  return g;
}

export function makeHubby() {
  const g = person({ shirt: '#3a7bd5', pants: '#2b2d3a', hair: '#1c1c22' });
  const { head, body } = g.userData;
  // 蔡博, her teammate: hoodie, green gaming headset, glasses, keyboard under the arm
  body.add(mesh(new THREE.SphereGeometry(0.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(Math.PI / 2), toon('#2f63b0'), -0.2, 1.12, 0));
  head.add(mesh(new THREE.TorusGeometry(0.25, 0.03, 6, 20, Math.PI).rotateY(Math.PI / 2), toon('#3ad17a'), 0, 0.02, 0));
  for (const s of [-1, 1]) {
    head.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 14).rotateX(Math.PI / 2), toon('#3ad17a'), 0, 0, 0.24 * s));
    const lens = mesh(new THREE.TorusGeometry(0.06, 0.014, 6, 16).rotateY(Math.PI / 2), toon('#1d1a24'), 0.22, 0.02, 0.085 * s);
    lens.userData.noInk = true; head.add(lens);
  }
  const kb = mesh(new THREE.BoxGeometry(0.5, 0.04, 0.18), toon('#2a2a33'), 0.05, 0.8, 0.34);
  kb.rotation.x = 0.5;
  kb.add(mesh(new THREE.BoxGeometry(0.44, 0.02, 0.12), glow('#7fe3ff', 0.8), 0, 0.03, 0));
  body.add(kb);
  ink(g, 0.035);
  return g;
}

function placard(text, bg, fg = '#fff') {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, 256, 128);
  x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 10; x.strokeRect(5, 5, 246, 118);
  x.fillStyle = fg; x.font = 'bold 76px "PingFang SC","Microsoft YaHei",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 128, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  const board = mesh(new THREE.BoxGeometry(0.62, 0.32, 0.04), [toon('#8a5a2b'), toon('#8a5a2b'), toon('#8a5a2b'), toon('#8a5a2b'), new THREE.MeshBasicMaterial({ map: t }), new THREE.MeshBasicMaterial({ map: t })]);
  board.position.y = 0.32;
  board.userData.noInk = true;
  g.add(board, mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), toon('#8a5a2b'), 0, 0.05, 0));
  return g;
}

// ---------- enemies ----------
export function makeEnemy(type) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const ud = { body };
  switch (type) {
    case 'durian': {
      const core = mesh(new THREE.IcosahedronGeometry(0.42, 1), toon('#c9d44c', { flatShading: true }), 0, 0.48, 0);
      body.add(core);
      const pos = new THREE.IcosahedronGeometry(0.42, 1).getAttribute('position');
      const seen = new Set(), spikeGeo = new THREE.ConeGeometry(0.07, 0.2, 5), up = new THREE.Vector3(0, 1, 0);
      for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, i);
        const k = v.toArray().map((n) => n.toFixed(2)).join();
        if (seen.has(k)) continue;
        seen.add(k);
        const s = mesh(spikeGeo, toon('#8d9a2e'));
        const n = v.clone().normalize();
        s.position.copy(n.multiplyScalar(0.46)).add(new THREE.Vector3(0, 0.48, 0));
        s.quaternion.setFromUnitVectors(up, v.clone().normalize());
        s.userData.noInk = true;
        body.add(s);
      }
      eyes(body, 0.36, 0.56, 0.13, 0.08);
      for (const s of [-1, 1]) body.add(mesh(new THREE.CapsuleGeometry(0.07, 0.06, 4, 8), toon('#6d5a2e'), 0, 0.08, 0.18 * s));
      break;
    }
    case 'oyster': {
      // 往昔蚝: an old-timey oyster with a bowler hat, a monocle and a moustache
      const shellCol = '#8d8aa0', rimCol = '#b7a9c9';
      const lower = mesh(new THREE.SphereGeometry(0.62, 24, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon(shellCol), 0, 0.34, 0);
      lower.scale.set(1, 0.45, 0.85);
      body.add(lower);
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; const b = mesh(sphere(0.1, 8), toon(rimCol), Math.cos(a) * 0.6, 0.33, Math.sin(a) * 0.5); b.scale.y = 0.5; b.userData.noInk = true; body.add(b); }
      const pearl = mesh(sphere(0.22, 20), glossy('#fff7f2', { emissive: '#ffd9ec', emissiveIntensity: 0.9 }), 0.12, 0.4, 0);
      body.add(pearl);
      const hinge = new THREE.Group();
      hinge.position.set(-0.5, 0.34, 0);
      const upper = mesh(new THREE.SphereGeometry(0.62, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#a6a3b8'), 0.5, 0, 0);
      upper.scale.set(1, 0.42, 0.85);
      hinge.add(upper);
      for (let i = -2; i <= 2; i++) { const rr = mesh(new THREE.TorusGeometry(0.44 - Math.abs(i) * 0.05, 0.025, 4, 20, Math.PI), toon('#76738a'), 0.5, 0.06, i * 0.13); rr.rotation.y = Math.PI / 2; rr.userData.noInk = true; hinge.add(rr); }
      eyes(hinge, 0.85, 0.24, 0.15, 0.08);
      const mono = mesh(new THREE.TorusGeometry(0.1, 0.015, 6, 18).rotateY(Math.PI / 2), glow('#ffd35a', 0.6), 0.93, 0.24, 0.15);
      mono.userData.noInk = true; hinge.add(mono);
      for (const sd of [-1, 1]) { const m = mesh(new THREE.CapsuleGeometry(0.035, 0.16, 4, 6).rotateX(Math.PI / 2), toon('#3a2a20'), 0.98, 0.1, 0.1 * sd); m.rotation.y = sd * 0.5; hinge.add(m); }
      const hat = new THREE.Group();
      hat.position.set(0.45, 0.3, 0);
      hat.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 20), toon('#1d1a24')));
      hat.add(mesh(new THREE.SphereGeometry(0.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#1d1a24'), 0, 0.02, 0));
      hat.add(mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.05, 20), toon('#8a1d2a'), 0, 0.05, 0));
      hinge.add(hat);
      body.add(hinge);
      ud.hinge = hinge;
      break;
    }
    case 'orange': {
      // 橘子: just an orange, rolling in
      const ball = new THREE.Group();
      ball.position.y = 0.42;
      ball.add(mesh(new THREE.IcosahedronGeometry(0.4, 3), toon('#ff9a1f')));
      for (let i = 0; i < 24; i++) { const y = 1 - (i / 23) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.4; const d = mesh(sphere(0.025, 6), toon('#e9821a'), Math.cos(th) * rad * 0.4, y * 0.4, Math.sin(th) * rad * 0.4); d.userData.noInk = true; ball.add(d); }
      body.add(ball);
      body.add(mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.1, 6), toon('#5a3a1a'), 0, 0.86, 0));
      const leaf = mesh(sphere(0.12, 10), toon('#4caf50'), 0.08, 0.88, 0.04);
      leaf.scale.set(1, 0.25, 0.5); leaf.rotation.y = 0.6;
      body.add(leaf);
      eyes(body, 0.34, 0.5, 0.13, 0.08);
      for (const sd of [-1, 1]) { const b = mesh(new THREE.BoxGeometry(0.04, 0.03, 0.14), toon('#1d1a24'), 0.38, 0.62, 0.13 * sd); b.rotation.x = sd * 0.4; b.userData.noInk = true; body.add(b); }
      ud.ball = ball;
      break;
    }
    case 'dingding': {
      // 丁丁: purple, a triangle on the antenna, a screen on the tummy and a red bag
      const purple = '#8a4fc7';
      body.add(mesh(new THREE.CapsuleGeometry(0.42, 0.42, 8, 18), toon(purple), 0, 0.78, 0));
      const tv = new THREE.Group();
      tv.position.set(0.4, 0.78, 0);
      tv.add(mesh(new THREE.BoxGeometry(0.06, 0.32, 0.38), toon('#c9c4d6')));
      const screen = mesh(new THREE.BoxGeometry(0.02, 0.24, 0.3), glow('#bfe6ff', 1.6), 0.03, 0, 0);
      screen.userData.noInk = true;
      tv.add(screen);
      body.add(tv);
      const head = new THREE.Group();
      head.position.y = 1.5;
      head.add(mesh(sphere(0.3, 20), toon(purple)));
      const face = mesh(sphere(0.24, 18), toon('#f4cfae'), 0.14, -0.01, 0);
      face.scale.set(0.55, 0.9, 0.95);
      head.add(face);
      eyes(head, 0.26, 0.05, 0.08, 0.05);
      const smile = mesh(new THREE.TorusGeometry(0.06, 0.014, 6, 12, Math.PI), toon('#7a3a2a'), 0.28, -0.08, 0);
      smile.rotation.set(0, Math.PI / 2, Math.PI); smile.userData.noInk = true;
      head.add(smile);
      for (const sd of [-1, 1]) head.add(mesh(sphere(0.07, 10), toon(purple), 0, 0.02, 0.3 * sd));
      head.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 6), toon(purple), 0, 0.38, 0));
      const tri = mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 3).rotateY(Math.PI / 2), toon(purple), 0, 0.6, 0);
      tri.rotation.x = Math.PI / 2;
      head.add(tri);
      body.add(head);
      ud.head = head;
      const legs = [], arms = [];
      for (const sd of [-1, 1]) {
        const lp = new THREE.Group(); lp.position.set(0, 0.32, 0.2 * sd);
        lp.add(mesh(new THREE.CapsuleGeometry(0.13, 0.12, 4, 10), toon(purple), 0, -0.14, 0));
        body.add(lp); legs.push(lp);
        const ap = new THREE.Group(); ap.position.set(0, 1.0, 0.45 * sd);
        ap.add(mesh(new THREE.CapsuleGeometry(0.1, 0.22, 4, 10), toon(purple), 0, -0.16, 0));
        body.add(ap); arms.push(ap);
      }
      const bag = new THREE.Group();
      bag.position.set(0.05, -0.42, 0);
      bag.add(mesh(new THREE.BoxGeometry(0.26, 0.2, 0.12), toon('#e0242f')));
      const handle = mesh(new THREE.TorusGeometry(0.08, 0.015, 6, 12, Math.PI), toon('#e0242f'), 0, 0.1, 0);
      handle.userData.noInk = true; bag.add(handle);
      arms[1].add(bag);
      ud.legs = legs; ud.arms = arms;
      break;
    }
    case 'goat': case 'judge': {
      const judge = type === 'judge';
      const k = judge ? 1.9 : 1;
      if (!judge) {
        const torso = mesh(new THREE.CapsuleGeometry(0.27, 0.42, 6, 14).rotateZ(Math.PI / 2), toon('#f6f3ea'), 0, 0.55, 0);
        body.add(torso);
        for (let i = 0; i < 7; i++) { const f = mesh(sphere(0.13, 10), toon('#ffffff'), -0.25 + i * 0.09, 0.78, (i % 2 ? 0.1 : -0.1)); f.userData.noInk = true; body.add(f); }
        const legs = [];
        for (const [x, z] of [[0.24, 0.15], [0.24, -0.15], [-0.24, 0.15], [-0.24, -0.15]]) {
          const p = new THREE.Group(); p.position.set(x, 0.4, z);
          p.add(mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.38, 8), toon('#3b3530'), 0, -0.18, 0));
          body.add(p); legs.push(p);
        }
        ud.legs = legs;
      } else {
        // 沉毅羊 stands upright in a black robe with a wig and a gavel
        body.add(mesh(new THREE.ConeGeometry(0.85, 1.9, 24), toon('#1f1d2a'), 0, 0.95, 0));
        body.add(mesh(new THREE.ConeGeometry(0.22, 0.5, 4), toon('#ffffff'), 0.32, 1.52, 0));
        const arm = new THREE.Group();
        arm.position.set(0.1, 1.55, 0.62);
        arm.add(mesh(new THREE.CapsuleGeometry(0.11, 0.55, 4, 8), toon('#1f1d2a'), 0, -0.3, 0));
        const gavel = new THREE.Group();
        gavel.position.set(0, -0.62, 0);
        gavel.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8).rotateZ(Math.PI / 2), toon('#7a4a22'), 0.32, 0, 0));
        gavel.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.36, 14), toon('#8a5328'), 0.66, 0, 0));
        arm.add(gavel);
        body.add(arm);
        ud.arm = arm;
      }
      const head = new THREE.Group();
      head.position.set(judge ? 0.15 : 0.42, judge ? 2.15 : 0.82, 0);
      head.scale.setScalar(judge ? 1.55 : 1);
      head.add(mesh(new THREE.CapsuleGeometry(0.14, 0.16, 6, 12).rotateZ(Math.PI / 2.4), toon('#f6f3ea'), 0.06, -0.03, 0));
      eyes(head, 0.1, 0.07, 0.1, 0.055);
      head.add(mesh(new THREE.ConeGeometry(0.05, 0.16, 6).rotateX(Math.PI), toon('#e8e4d8'), 0.16, -0.2, 0));
      for (const s of [-1, 1]) {
        const horn = mesh(new THREE.TorusGeometry(0.1, 0.035, 6, 14, Math.PI * 1.3), toon('#9a7b4f'), -0.06, 0.13, 0.1 * s);
        horn.rotation.set(0, s > 0 ? 0.2 : -0.2, 0.6);
        head.add(horn);
        const ear = mesh(new THREE.CapsuleGeometry(0.035, 0.12, 4, 6).rotateX(s * 1.2), toon('#ece6d6'), -0.04, 0.05, 0.17 * s);
        head.add(ear);
      }
      if (judge) {
        const wig = new THREE.Group();
        for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const c = mesh(sphere(0.09, 10), toon('#eeeae2'), -0.04 + Math.cos(a) * 0.05, 0.12 + (i % 2) * 0.03, Math.sin(a) * 0.19); wig.add(c); }
        for (const s of [-1, 1]) for (let i = 0; i < 3; i++) wig.add(mesh(sphere(0.08, 10), toon('#eeeae2'), -0.08, -0.05 - i * 0.12, 0.2 * s));
        head.add(wig);
      }
      body.add(head);
      ud.head = head;
      if (judge) g.scale.setScalar(1);
      break;
    }
    case 'guo': {
      // 果哥 is a 开心果: a cracked pistachio shell with a grinning green nut peeking out
      const shell = '#e3cfa3', nut = '#9cc95a';
      const pod = new THREE.Group();
      pod.position.y = 0.62;
      // open shell halves are seen from inside too, so they are double-sided and skip the ink hull
      const half = (sd) => { const m = mesh(new THREE.SphereGeometry(0.42, 22, 14, 0, Math.PI), toon(shell, { side: THREE.DoubleSide }), 0, 0, 0); m.scale.set(1, 1.25, 0.8); m.rotation.y = sd > 0 ? 0 : Math.PI; m.rotation.x = sd * 0.08; m.userData.noInk = true; return m; };
      for (const sd of [-1, 1]) { const lip = mesh(new THREE.TorusGeometry(0.42, 0.025, 6, 30, Math.PI), toon('#b89a62'), -0.06, 0, 0); lip.scale.set(1, 1.25, 1); lip.rotation.set(Math.PI / 2, 0, sd * 0.25 + Math.PI / 2); lip.userData.noInk = true; pod.add(lip); }
      const back = half(-1); back.position.x = -0.06; back.rotation.z = 0.25; pod.add(back);
      const front = half(1); front.position.x = -0.06; front.rotation.z = -0.25; front.rotation.y = Math.PI; pod.add(front);
      const kernel = mesh(sphere(0.33, 20), toon(nut), 0.08, 0.02, 0);
      kernel.scale.set(0.85, 1.15, 0.9); pod.add(kernel);
      for (let k = 0; k < 6; k++) { const sp = mesh(sphere(0.08, 8), toon('#8a4a6a'), 0.05 + (k % 2) * 0.1, 0.2 - k * 0.07, (k % 3 - 1) * 0.15); sp.scale.set(0.4, 1, 1); sp.userData.noInk = true; pod.add(sp); }
      eyes(pod, 0.33, 0.1, 0.11, 0.07);
      const grin = mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 14, Math.PI), toon('#2d4a1a'), 0.35, -0.08, 0);
      grin.rotation.set(0, Math.PI / 2, Math.PI); grin.userData.noInk = true; pod.add(grin);
      for (const sd of [-1, 1]) { const ch = mesh(sphere(0.04, 8), toon('#ff9fbf'), 0.32, -0.02, 0.17 * sd); ch.scale.set(0.4, 0.6, 1); ch.userData.noInk = true; pod.add(ch); }
      body.add(pod);
      const legs = [], arms = [];
      for (const sd of [-1, 1]) {
        const lp = new THREE.Group(); lp.position.set(0, 0.2, 0.14 * sd);
        lp.add(mesh(new THREE.CapsuleGeometry(0.05, 0.14, 4, 8), toon('#c9ac78'), 0, -0.1, 0));
        body.add(lp); legs.push(lp);
        const ap = new THREE.Group(); ap.position.set(0.05, 0.7, 0.4 * sd);
        ap.add(mesh(new THREE.CapsuleGeometry(0.045, 0.2, 4, 8), toon('#c9ac78'), 0, -0.12, 0));
        body.add(ap); arms.push(ap);
      }
      ud.legs = legs; ud.arms = arms;
      const sign = placard('？', '#ffb000');
      sign.position.set(-0.05, 1.45, 0); sign.rotation.y = -Math.PI / 2; sign.scale.setScalar(1.3);
      body.add(sign);
      ud.sign = sign;
      break;
    }
    case 'jia': case 'yi': {
      const look = { jia: { shirt: '#e0563a', pants: '#2b2d3a', hair: '#1c1c22' }, yi: { shirt: '#4f8a6b', pants: '#2b2d3a', hair: '#3a2a20' } }[type];
      const p = person(look);
      Object.assign(ud, p.userData);
      body.add(p);
      p.userData = {};
      // casual hoodies; 甲方 has his arms folded, ready to ask who asked
      body.add(mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(Math.PI / 2), toon(type === 'jia' ? '#c8452e' : '#3f7458'), -0.2, 1.12, 0));
      if (type === 'jia') body.add(mesh(new THREE.CapsuleGeometry(0.06, 0.42, 4, 8).rotateX(Math.PI / 2), toon('#e0563a'), 0.2, 0.86, 0));
      const sign = placard({ jia: '甲方', yi: '乙方' }[type], { jia: '#c8102e', yi: '#3a7bd5' }[type]);
      sign.position.set(-0.05, 1.62, 0);
      sign.rotation.y = -Math.PI / 2;
      body.add(sign);
      ud.sign = sign;
      break;
    }
    case 'thief': {
      // 吴浩然: a bear warrior in the Ursa mould, war paint and claws, with a sack for the candy he steals
      const fur = '#6b4226', light = '#b08356';
      body.add(mesh(new THREE.CapsuleGeometry(0.4, 0.4, 8, 16), toon(fur), 0, 0.82, 0));
      const belly = mesh(sphere(0.3, 16), toon(light), 0.22, 0.75, 0);
      belly.scale.set(0.5, 1, 0.9); body.add(belly);
      for (const sd of [-1, 1]) {
        const pad = mesh(new THREE.SphereGeometry(0.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#8a8f99'), 0, 1.12, 0.36 * sd);
        pad.rotation.x = sd * 0.5; body.add(pad);
      }
      body.add(mesh(new THREE.TorusGeometry(0.4, 0.05, 6, 24).rotateX(Math.PI / 2), toon('#8a1d2a'), 0, 0.62, 0));
      const head = new THREE.Group();
      head.position.set(0.08, 1.48, 0);
      head.add(mesh(sphere(0.3, 20), toon(fur)));
      const muzzle = mesh(sphere(0.15, 14), toon(light), 0.25, -0.07, 0);
      muzzle.scale.set(1, 0.75, 1); head.add(muzzle);
      head.add(mesh(sphere(0.05, 8), toon('#111116'), 0.39, -0.03, 0));
      eyes(head, 0.22, 0.08, 0.12, 0.05);
      for (const sd of [-1, 1]) {
        head.add(mesh(sphere(0.1, 12), toon(fur), -0.05, 0.25, 0.2 * sd));
        head.add(mesh(sphere(0.055, 8), toon(light), -0.02, 0.25, 0.2 * sd));
        for (let k = 0; k < 2; k++) { const st = mesh(new THREE.BoxGeometry(0.02, 0.18, 0.03), glow('#e0242f', 0.6), 0.26, 0.12 - k * 0.05, (0.08 + k * 0.05) * sd); st.rotation.x = sd * 0.5; st.userData.noInk = true; head.add(st); }
      }
      body.add(head);
      ud.head = head;
      const legs = [], arms = [];
      for (const sd of [-1, 1]) {
        const lp = new THREE.Group(); lp.position.set(0, 0.4, 0.2 * sd);
        lp.add(mesh(new THREE.CapsuleGeometry(0.13, 0.16, 4, 10), toon(fur), 0, -0.18, 0));
        body.add(lp); legs.push(lp);
        const ap = new THREE.Group(); ap.position.set(0.05, 1.08, 0.46 * sd);
        ap.add(mesh(new THREE.CapsuleGeometry(0.11, 0.32, 4, 10), toon(fur), 0, -0.22, 0));
        for (let k = -1; k <= 1; k++) { const c = mesh(new THREE.ConeGeometry(0.03, 0.16, 5).rotateZ(-Math.PI / 2), glossy('#f6f1e4'), 0.12, -0.45, k * 0.05); c.userData.noInk = true; ap.add(c); }
        body.add(ap); arms.push(ap);
      }
      ud.legs = legs; ud.arms = arms;
      const sack = mesh(sphere(0.3, 14), toon('#e0242f'), -0.42, 1.0, 0);
      sack.scale.set(0.8, 1, 0.8);
      sack.add(mesh(new THREE.BoxGeometry(0.02, 0.2, 0.2), glow('#ffd35a', 0.8), 0.24, 0, 0));
      body.add(sack);
      ud.sack = sack;
      break;
    }
    case 'ginger': {
      // 姜饼人: a thick gingerbread cookie with white icing, standing up to face you
      const dough = toon('#c27a3a'), icing = toon('#fffaf0');
      const man = new THREE.Group();
      man.position.y = 0.05; man.rotation.x = -0.25;
      const flat = (geo) => { geo.scale(1, 1, 0.42); return geo; };
      man.add(mesh(flat(new THREE.CapsuleGeometry(0.22, 0.22, 6, 16)), dough, 0, 0.55, 0));
      man.add(mesh(flat(new THREE.SphereGeometry(0.22, 18, 12)), dough, 0, 0.98, 0));
      for (const sd of [-1, 1]) {
        const arm = mesh(flat(new THREE.CapsuleGeometry(0.08, 0.2, 4, 10)), dough, 0.28 * sd, 0.68, 0); arm.rotation.z = sd * 1.1; man.add(arm);
        const leg = mesh(flat(new THREE.CapsuleGeometry(0.09, 0.18, 4, 10)), dough, 0.13 * sd, 0.22, 0); leg.rotation.z = sd * 0.25; man.add(leg);
        const cuff = mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 12), icing, 0.43 * sd, 0.6, 0.02); cuff.rotation.y = Math.PI / 2; cuff.userData.noInk = true; man.add(cuff);
      }
      for (let k = 0; k < 3; k++) { const b = mesh(sphere(0.035, 8), toon(['#e0242f', '#3ad17a', '#3a7bd5'][k]), 0, 0.68 - k * 0.12, 0.1); b.userData.noInk = true; man.add(b); }
      for (const sd of [-1, 1]) { const e = mesh(sphere(0.035, 8), icing, 0.07 * sd, 1.02, 0.09); e.userData.noInk = true; man.add(e); }
      const smile = mesh(new THREE.TorusGeometry(0.07, 0.014, 6, 12, Math.PI), icing, 0, 0.94, 0.09);
      smile.rotation.z = Math.PI; smile.userData.noInk = true; man.add(smile);
      const scallop = mesh(new THREE.TorusGeometry(0.2, 0.012, 4, 30), icing, 0, 0.98, 0.07); scallop.userData.noInk = true; man.add(scallop);
      body.add(man);
      ud.man = man;
      break;
    }
    case 'caesar': {
      // Caesar: laurel wreath, white toga over a red tunic, red cape, round shield and a pilum
      const p = person({ shirt: '#b3261e', pants: '#b3261e', hair: '#3a2a20' });
      Object.assign(ud, p.userData);
      body.add(p);
      const head = p.userData.head;
      p.userData = {};
      const toga = mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.62, 16, 1, true), toon('#f4f0e6', { side: THREE.DoubleSide }), 0, 0.72, 0);
      toga.rotation.z = 0.12; body.add(toga);
      const sash = mesh(new THREE.TorusGeometry(0.24, 0.05, 6, 20), toon('#f4f0e6'), 0, 0.92, 0); sash.rotation.set(Math.PI / 2, 0.6, 0); body.add(sash);
      const cape = mesh(new THREE.PlaneGeometry(0.62, 0.95, 4, 6), toon('#8a1d2a', { side: THREE.DoubleSide }), -0.24, 0.62, 0);
      cape.rotation.y = Math.PI / 2; cape.rotation.x = 0.1; body.add(cape);
      const wreath = new THREE.Group();
      wreath.position.y = 0.1;
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 1.7 - Math.PI * 0.85; const l = mesh(sphere(0.06, 8), glow('#d8b04a', 0.3), Math.cos(a) * 0.22, 0.02, Math.sin(a) * 0.22); l.scale.set(1, 0.4, 0.6); l.userData.noInk = true; wreath.add(l); }
      head.add(wreath);
      const shield = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 20).rotateX(Math.PI / 2), toon('#b3261e'), 0.1, 0.8, 0.42);
      shield.add(mesh(sphere(0.07, 10), glow('#e8b84a', 0.5), 0, 0, 0.05));
      shield.add(mesh(new THREE.TorusGeometry(0.29, 0.02, 6, 24), toon('#e8b84a'), 0, 0, 0.03));
      body.add(shield);
      const spear = new THREE.Group(); spear.position.set(0.1, 1.0, -0.36);
      spear.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.3, 6).rotateZ(Math.PI / 2.2), toon('#7a4a22')));
      spear.add(mesh(new THREE.ConeGeometry(0.05, 0.2, 6).rotateZ(-Math.PI / 2 + 0.1), toon('#c9ced6'), 0.66, 0.12, 0));
      body.add(spear); ud.spear = spear;
      break;
    }
    case 'chenwei': {
      // 陈伟: a counter-terrorist in a helmet, goggles and vest with a rifle up
      const p = person({ shirt: '#2b3448', pants: '#232a38', hair: '#1c1c22' });
      Object.assign(ud, p.userData);
      body.add(p);
      const head = p.userData.head;
      p.userData = {};
      head.add(mesh(new THREE.SphereGeometry(0.25, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#3a4232'), -0.01, 0.03, 0));
      head.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 18), toon('#3a4232'), 0, 0.03, 0));
      for (const sd of [-1, 1]) head.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 12).rotateZ(Math.PI / 2), glossy('#3ad1ff', { emissive: '#0a5a7a', emissiveIntensity: 0.6 }), 0.2, 0.08, 0.07 * sd));
      head.add(mesh(new THREE.BoxGeometry(0.06, 0.12, 0.3), toon('#1d1d24'), 0.18, -0.08, 0));
      const vest = mesh(new THREE.BoxGeometry(0.36, 0.4, 0.42), toon('#4a5a3a'), 0.02, 0.84, 0);
      body.add(vest);
      for (let k = 0; k < 3; k++) body.add(mesh(new THREE.BoxGeometry(0.06, 0.1, 0.08), toon('#3a4a2a'), 0.22, 0.78, (k - 1) * 0.12));
      const patch = placard('CT', '#3a7bd5'); patch.scale.setScalar(0.35); patch.position.set(-0.2, 0.86, 0); patch.rotation.y = -Math.PI / 2; body.add(patch);
      const rifle = new THREE.Group(); rifle.position.set(0.32, 0.98, 0.14);
      rifle.add(mesh(new THREE.BoxGeometry(0.55, 0.09, 0.07), toon('#22252b')));
      rifle.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.32, 8).rotateZ(Math.PI / 2), toon('#22252b'), 0.42, 0.02, 0));
      rifle.add(mesh(new THREE.BoxGeometry(0.06, 0.16, 0.05), toon('#22252b'), 0.08, -0.11, 0));
      rifle.add(mesh(new THREE.BoxGeometry(0.16, 0.12, 0.06), toon('#3a3d44'), -0.3, -0.03, 0));
      const dot = mesh(sphere(0.025, 6), glow('#ff2a2a', 3), 0.6, 0.06, 0); dot.userData.noInk = true; rifle.add(dot);
      body.add(rifle);
      ud.rifle = rifle;
      break;
    }
    case 'mao': case 'maoqiu': case 'bigmao': {
      const r = type === 'maoqiu' ? 0.32 : 0.8;
      const fluff = new THREE.Group();
      fluff.position.y = r * 0.95;
      fluff.add(mesh(sphere(r * 0.86, 20), toon('#c79a6b')));
      const n = type === 'maoqiu' ? 14 : 46, tuftGeo = sphere(r * 0.3, 10);
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.399;
        const t = mesh(tuftGeo, toon(i % 3 ? '#d7ad7e' : '#b8875a'), Math.cos(th) * rad * r * 0.86, y * r * 0.86, Math.sin(th) * rad * r * 0.86);
        t.userData.noInk = true;
        fluff.add(t);
      }
      eyes(fluff, r * 0.8, r * 0.18, r * 0.3, r * 0.2);
      // 大毛 wears shades: two dark glossy lenses, a gold bridge and arms back into the fur
      const shades = new THREE.Group();
      shades.position.set(r * 0.98, r * 0.2, 0);
      const lensMat = glossy('#15131c', { emissive: '#2a1a3a', emissiveIntensity: 0.3 });
      for (const sd of [-1, 1]) {
        const lens = mesh(new THREE.CylinderGeometry(r * 0.26, r * 0.24, r * 0.06, 20).rotateZ(Math.PI / 2), lensMat, 0, 0, r * 0.3 * sd);
        lens.scale.set(1, 0.82, 1.15);
        const glint = mesh(new THREE.BoxGeometry(r * 0.02, r * 0.06, r * 0.16), shineMat, r * 0.035, r * 0.07, -r * 0.05);
        glint.rotation.x = 0.6; glint.userData.noInk = true;
        lens.add(glint);
        shades.add(lens);
        const arm = mesh(new THREE.BoxGeometry(r * 0.5, r * 0.04, r * 0.04), toon('#e8b84a'), -r * 0.25, r * 0.06, r * 0.52 * sd);
        arm.rotation.y = sd * 0.35; arm.userData.noInk = true;
        shades.add(arm);
      }
      const bridge = mesh(new THREE.BoxGeometry(r * 0.04, r * 0.04, r * 0.16), toon('#e8b84a'), r * 0.02, r * 0.06, 0);
      bridge.userData.noInk = true;
      shades.add(bridge);
      fluff.add(shades);
      const mouth = mesh(new THREE.TorusGeometry(r * 0.12, r * 0.03, 6, 12, Math.PI), toon('#4a2a14'), r * 0.92, -r * 0.18, 0);
      mouth.rotation.set(0, Math.PI / 2, Math.PI); mouth.userData.noInk = true;
      fluff.add(mouth);
      if (type === 'bigmao') {
        const crown = new THREE.Group();
        crown.position.set(0, r * 0.95, 0);
        crown.add(mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.22, 10, 1, true), glow('#ffcf3a', 0.6)));
        for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; crown.add(mesh(new THREE.ConeGeometry(0.07, 0.2, 4), glow('#ffcf3a', 0.6), Math.cos(a) * 0.32, 0.18, Math.sin(a) * 0.32)); }
        fluff.add(crown);
      }
      body.add(fluff);
      ud.fluff = fluff;
      if (type === 'bigmao') g.scale.setScalar(2);
      break;
    }
  }
  ink(g, type === 'judge' ? 0.05 : 0.04);
  const cocoon = new THREE.Mesh(new THREE.IcosahedronGeometry(type === 'judge' ? 1.5 : type === 'bigmao' ? 0.9 : 0.6, 1), new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.75 }));
  cocoon.position.y = type === 'judge' ? 1.3 : 0.5;
  cocoon.visible = false;
  cocoon.userData.noBake = cocoon.userData.noInk = true; cocoon.castShadow = false;
  g.add(cocoon);
  ud.cocoon = cocoon;
  g.userData = ud;
  return g;
}

// ---------- companions and props ----------
export function makeBull() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const white = '#fbfaf6';
  body.add(mesh(new THREE.CapsuleGeometry(0.36, 0.7, 6, 16).rotateZ(Math.PI / 2), toon(white), 0, 0.7, 0));
  const hump = mesh(sphere(0.3, 14), toon(white), 0.25, 0.95, 0); hump.scale.set(1, 0.6, 0.9); body.add(hump);
  const head = new THREE.Group();
  head.position.set(0.75, 0.82, 0);
  head.add(mesh(new THREE.BoxGeometry(0.42, 0.36, 0.38), toon(white)));
  head.add(mesh(new THREE.BoxGeometry(0.16, 0.24, 0.32), toon('#ffb3c7'), 0.24, -0.06, 0));
  for (const s of [-1, 1]) {
    head.add(mesh(sphere(0.03, 6), toon('#1d1a24'), 0.32, -0.02, 0.07 * s));
    const horn = mesh(new THREE.ConeGeometry(0.06, 0.32, 8), glossy('#f3e3b8'), -0.05, 0.22, 0.24 * s);
    horn.rotation.x = s * -0.9; horn.rotation.z = -0.3;
    head.add(horn);
  }
  eyes(head, 0.18, 0.08, 0.13, 0.05);
  body.add(head);
  const legs = [];
  for (const [x, z] of [[0.45, 0.22], [0.45, -0.22], [-0.45, 0.22], [-0.45, -0.22]]) {
    const p = new THREE.Group(); p.position.set(x, 0.5, z);
    p.add(mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.5, 10), toon(white), 0, -0.25, 0));
    p.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 10), toon('#3b3530'), 0, -0.5, 0));
    body.add(p); legs.push(p);
  }
  const tail = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), toon(white), -0.75, 0.75, 0);
  tail.rotation.z = 0.6;
  body.add(tail);
  // a red scarf, because she is proud of it
  const scarf = mesh(new THREE.TorusGeometry(0.24, 0.06, 8, 20), toon('#e8322b'), 0.55, 0.75, 0);
  scarf.rotation.y = Math.PI / 2;
  body.add(scarf);
  ink(g, 0.04);
  g.userData = { body, legs, head };
  return g;
}

export function makeHorse() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const coat = '#8b5a2b', dark = '#3a2414';
  body.add(mesh(new THREE.CapsuleGeometry(0.32, 0.8, 6, 16).rotateZ(Math.PI / 2), toon(coat), 0, 0.85, 0));
  const neck = mesh(new THREE.CapsuleGeometry(0.16, 0.42, 4, 10), toon(coat), 0.55, 1.15, 0);
  neck.rotation.z = -0.7; body.add(neck);
  const head = new THREE.Group();
  head.position.set(0.82, 1.38, 0);
  head.add(mesh(new THREE.CapsuleGeometry(0.13, 0.3, 4, 10).rotateZ(Math.PI / 2.4), toon(coat)));
  head.add(mesh(sphere(0.1, 10), toon('#c79a6b'), 0.2, -0.08, 0));
  eyes(head, 0.02, 0.06, 0.1, 0.04);
  for (const sd of [-1, 1]) head.add(mesh(new THREE.ConeGeometry(0.04, 0.12, 6), toon(coat), -0.1, 0.17, 0.06 * sd));
  body.add(head);
  for (let i = 0; i < 6; i++) { const m = mesh(sphere(0.08, 8), toon(dark), 0.62 - i * 0.07, 1.42 - i * 0.07, 0); body.add(m); }
  const tail = mesh(new THREE.CapsuleGeometry(0.06, 0.4, 4, 6), toon(dark), -0.78, 0.8, 0);
  tail.rotation.z = 0.5; body.add(tail);
  const saddle = mesh(new THREE.BoxGeometry(0.5, 0.08, 0.56), toon('#c8102e'), -0.05, 1.18, 0);
  saddle.add(mesh(new THREE.BoxGeometry(0.52, 0.03, 0.58), toon('#e8b84a'), 0, -0.04, 0));
  body.add(saddle);
  const legs = [];
  for (const [x, z] of [[0.45, 0.17], [0.45, -0.17], [-0.45, 0.17], [-0.45, -0.17]]) {
    const p = new THREE.Group(); p.position.set(x, 0.7, z);
    p.add(mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.62, 8), toon(coat), 0, -0.31, 0));
    p.add(mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.08, 8), toon(dark), 0, -0.64, 0));
    body.add(p); legs.push(p);
  }
  ink(g, 0.035);
  g.userData = { body, legs, head };
  return g;
}

// a tandem bicycle: she rides in front, 蔡博 pedals behind
export function makeBike() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const frameMat = toon('#2fb59a'), dark = toon('#1d1a24'), chrome = glossy('#d8dde6');
  const wheels = [];
  for (const x of [0.85, -0.85]) {
    const w = new THREE.Group();
    w.position.set(x, 0.36, 0);
    w.add(mesh(new THREE.TorusGeometry(0.33, 0.035, 8, 28), dark));
    w.add(mesh(new THREE.TorusGeometry(0.29, 0.012, 4, 24), chrome));
    for (let k = 0; k < 8; k++) { const sp = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.58, 3), chrome); sp.rotation.z = (k / 8) * Math.PI; sp.userData.noInk = true; w.add(sp); }
    w.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 10).rotateX(Math.PI / 2), chrome));
    body.add(w); wheels.push(w);
  }
  const tube = (a, b, r = 0.03, mat = frameMat) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const m = mesh(new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 8), mat);
    m.position.copy(va).lerp(vb, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    body.add(m);
  };
  tube([0.85, 0.36, 0], [0.7, 0.95, 0]);
  tube([0.7, 0.85, 0], [-0.75, 0.8, 0]);
  tube([0.4, 0.42, 0], [-0.85, 0.36, 0]);
  tube([0.4, 0.42, 0], [0.35, 0.75, 0]); tube([-0.45, 0.42, 0], [-0.45, 0.8, 0]);
  tube([0.4, 0.42, 0], [-0.45, 0.42, 0]);
  tube([0.7, 0.95, -0.2], [0.7, 0.95, 0.2], 0.022, chrome);
  for (const x of [0.32, -0.48]) { const seat = mesh(new THREE.BoxGeometry(0.24, 0.06, 0.16), toon('#3a2a20'), x, 0.82, 0); body.add(seat); }
  body.add(mesh(new THREE.BoxGeometry(0.3, 0.04, 0.22), toon('#c8102e'), -0.95, 0.62, 0));
  const bell = mesh(sphere(0.045, 10), glossy('#ffd35a'), 0.72, 0.99, 0.12); bell.userData.noInk = true; body.add(bell);
  const basket = mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.16, 10, 1, true), toon('#b98a52', { side: THREE.DoubleSide }), 0.98, 0.82, 0);
  basket.userData.noInk = true; body.add(basket);
  for (let k = 0; k < 3; k++) { const h = mesh(sphere(0.06, 8), glossy('#d81e2a'), 0.95 + (k - 1) * 0.05, 0.92, (k - 1) * 0.05); h.userData.noInk = true; body.add(h); }
  ink(g, 0.025);
  g.userData = { body, wheels };
  return g;
}

export function makeTornado() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: '#d8f3ff', transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const rings = [];
  for (let i = 0; i < 6; i++) {
    const r = mesh(new THREE.TorusGeometry(0.16 + i * 0.09, 0.03, 6, 20, Math.PI * 1.5), mat, 0, 0.15 + i * 0.22, 0);
    r.rotation.x = Math.PI / 2; r.castShadow = false;
    g.add(r); rings.push(r);
  }
  const leafMat = toon('#7cbf4a');
  const leaves = [];
  for (let i = 0; i < 5; i++) { const l = mesh(new THREE.PlaneGeometry(0.12, 0.08), leafMat); l.material = toon('#7cbf4a', { side: THREE.DoubleSide }); g.add(l); leaves.push(l); }
  g.userData = { rings, leaves };
  return g;
}

export function makeDahong() {
  const g = new THREE.Group();
  const box = mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), glow('#e0201b', 1.2), 0, 0.6, 0);
  box.add(new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineBasicMaterial({ color: '#ffd35a' })));
  box.add(mesh(new THREE.BoxGeometry(0.42, 0.06, 0.32), glow('#ffcf3a', 1.5)));
  g.add(box);
  g.userData = { box };
  return g;
}

export function makeBomb() {
  const g = new THREE.Group();
  const bag = mesh(sphere(0.26, 14), toon('#6b4a2e'), 0, 0.24, 0);
  bag.scale.set(1, 0.8, 1);
  g.add(bag);
  g.add(mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.12, 10), toon('#4a3220'), 0, 0.45, 0));
  const led = mesh(sphere(0.06, 8), glow('#ff2a2a', 3), 0.18, 0.32, 0.12);
  led.userData.noInk = true;
  g.add(led);
  ink(g, 0.03);
  g.userData = { led };
  return g;
}

// A tanghulu skewer for the title, and a single glazed haw for the instanced xp gems.
export function makeTanghulu() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), toon('#d8b57a'), 0, 0.6, 0));
  for (let i = 0; i < 5; i++) g.add(mesh(sphere(0.13, 18), glossy('#d81e2a', { emissive: '#5a0008', emissiveIntensity: 0.6 }), 0, 0.62 + i * 0.2, 0));
  return g;
}
export const gemGeometry = new THREE.SphereGeometry(0.15, 14, 10);
export const gemMaterial = new THREE.MeshPhysicalMaterial({ color: '#e0212e', emissive: '#8a0a12', emissiveIntensity: 0.9, roughness: 0.15, clearcoat: 1 });

// ---------- pickups on the floor ----------
export const PICKUP_COL = { bike: '#2fb59a', horse: '#ffb347', bull: '#ffffff', meteor: '#9fd8ff', chief: '#ff6fae', spider: '#c58cff', douzhi: '#8dffb0', magnet: '#ff4f5e', chest: '#ffd35a' };
export function makePickup(kind) {
  const g = new THREE.Group();
  const icon = new THREE.Group();
  icon.position.y = 0.75;
  const col = PICKUP_COL[kind];
  switch (kind) {
    case 'horse': { const h = makeHorse(); h.scale.setScalar(0.42); h.position.y = -0.35; icon.add(h); break; }
    case 'bull': { const b = makeBull(); b.scale.setScalar(0.45); b.position.y = -0.38; icon.add(b); break; }
    case 'bike': { const b = makeBike(); b.scale.setScalar(0.5); b.position.y = -0.4; icon.add(b); break; }
    case 'meteor': {
      icon.add(mesh(new THREE.IcosahedronGeometry(0.2, 0), glow('#bfe6ff', 3)));
      for (let i = 0; i < 6; i++) { const c = mesh(new THREE.ConeGeometry(0.06, 0.26, 5), glow('#9fd8ff', 2)); const v = new THREE.Vector3().setFromSphericalCoords(0.22, Math.acos(1 - 2 * (i + 0.5) / 6), i * 2.4); c.position.copy(v); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize()); icon.add(c); }
      break;
    }
    case 'chief': {
      icon.add(mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 24).rotateX(Math.PI / 2), toon('#b3261e')));
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI - Math.PI / 2; const f = mesh(new THREE.CapsuleGeometry(0.04, 0.3, 4, 6), toon(['#ff6fae', '#ffd35a', '#3ad1ff'][i % 3]), Math.sin(a) * 0.18, 0.22, -Math.cos(a) * 0.05 - 0.05); f.rotation.z = -a * 0.5; icon.add(f); }
      break;
    }
    case 'spider': {
      icon.add(mesh(sphere(0.16, 14), toon('#2a2233')));
      icon.add(mesh(sphere(0.1, 12), toon('#2a2233'), 0.17, -0.02, 0));
      for (let i = 0; i < 8; i++) { const s = i < 4 ? -1 : 1, k = i % 4; const l = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 5), toon('#2a2233'), (k - 1.5) * 0.08, -0.05, s * 0.2); l.rotation.x = s * 1.1; icon.add(l); }
      for (const s of [-1, 1]) icon.add(mesh(sphere(0.025, 6), glow('#ff4fa0', 3), 0.25, 0.02, 0.04 * s));
      break;
    }
    case 'douzhi': {
      const bowl = mesh(new THREE.SphereGeometry(0.22, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon('#f4f6fb', { side: THREE.DoubleSide }));
      icon.add(bowl);
      icon.add(mesh(new THREE.TorusGeometry(0.215, 0.02, 6, 24).rotateX(Math.PI / 2), toon('#2a6fb5')));
      const soup = mesh(new THREE.CircleGeometry(0.2, 20).rotateX(-Math.PI / 2), toon('#a9b47e'), 0, -0.03, 0); soup.userData.noInk = true; icon.add(soup);
      break;
    }
    case 'magnet': { const t = makeTanghulu(); t.scale.setScalar(0.55); t.position.y = -0.45; icon.add(t); break; }
    case 'chest': {
      icon.add(mesh(new THREE.BoxGeometry(0.56, 0.32, 0.4), toon('#c8102e')));
      const lid = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.56, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), toon('#d8232a'), 0, 0.16, 0);
      lid.rotation.x = -Math.PI / 2; icon.add(lid);
      for (const x of [-0.2, 0, 0.2]) icon.add(mesh(new THREE.BoxGeometry(0.05, 0.5, 0.42), glow('#ffcf3a', 0.8), x, 0.06, 0));
      icon.add(mesh(new THREE.BoxGeometry(0.1, 0.12, 0.05), glow('#ffcf3a', 1.2), 0, 0.04, 0.21));
      break;
    }
  }
  g.add(icon);
  ink(icon, 0.03);
  // pedestal ring and a beam of light so pickups read from across the yard
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.55, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  ring.position.y = 0.04; g.add(ring);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 3.2, 20, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.y = 1.6; g.add(beam);
  for (const o of [ring, beam]) { o.userData.noBake = true; o.castShadow = false; }
  g.userData = { icon, ring, beam };
  return g;
}

// ---------- baking ----------
// Characters are built from dozens of primitives. To keep a yard of 100+ enemies cheap, each
// model is baked once: every static mesh under a node is merged into one mesh per material,
// and only the parts the renderer animates (the nodes listed in userData) stay separate.
// Spawning then clones the baked template, which shares geometry and materials.
function bakeNode(node, keep) {
  node.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(node.matrixWorld).invert();
  const buckets = new Map();
  const m4 = new THREE.Matrix4();
  const walk = (o) => {
    for (const c of [...o.children]) {
      if (keep.has(c)) { bakeNode(c, keep); continue; }
      walk(c);
      if (c.isMesh && !c.userData.noBake && !Array.isArray(c.material) && !c.isInstancedMesh) {
        let geo = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone();
        for (const name of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(name)) geo.deleteAttribute(name);
        if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
        geo.applyMatrix4(m4.multiplyMatrices(inv, c.matrixWorld));
        const list = buckets.get(c.material) || [];
        list.push({ geo, shadow: c.castShadow });
        buckets.set(c.material, list);
        const kids = c.children.filter((k) => !(k.isMesh && !k.userData.noBake));
        for (const k of kids) { o.add(k); k.applyMatrix4(c.matrix); }
        c.removeFromParent();
      } else if (!c.isMesh && c.children.length === 0 && !keep.has(c)) c.removeFromParent();
    }
  };
  walk(node);
  for (const [mat, list] of buckets) {
    const merged = new THREE.Mesh(mergeGeometries(list.map((l) => l.geo)), mat);
    merged.castShadow = mat !== inkMat && list.some((l) => l.shadow);
    merged.userData.noBake = true;
    node.add(merged);
  }
}

export function template(model) {
  const ud = model.userData;
  model.userData = {};
  const map = {}, keep = new Set();
  let i = 0;
  const tag = (o) => { o.name = 'k' + i++; keep.add(o); return o.name; };
  for (const [k, v] of Object.entries(ud)) {
    if (Array.isArray(v)) { if (v.length && v[0]?.isObject3D) map[k] = v.map(tag); }
    else if (v?.isObject3D) map[k] = tag(v);
  }
  bakeNode(model, keep);
  return { model, map };
}

export function instantiate(tpl) {
  const m = tpl.model.clone();
  const ud = {};
  for (const [k, v] of Object.entries(tpl.map)) ud[k] = Array.isArray(v) ? v.map((n) => m.getObjectByName(n)) : m.getObjectByName(v);
  m.userData = ud;
  return m;
}
