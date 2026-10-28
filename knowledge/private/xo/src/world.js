// The courtyard: paving, brick walls, a row of houses with curled eaves, lanterns that
// light up as night falls over the waves, a scholar tree, a well, and Beijing beyond the wall.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { AW, AH, OBSTACLES } from './game.js';
import { toon, glow, rim } from './models.js';

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
// small deterministic noise so the textures look the same every load
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const paving = () => canvasTex(2048, 2048, (x, w, h) => {
  x.fillStyle = '#6f6b64'; x.fillRect(0, 0, w, h);
  const n = 16, s = w / n;
  for (let j = 0; j < n; j++) for (let i = -1; i < n; i++) {
    const off = (j % 2) * s * 0.5, px = i * s + off + 5, py = j * s + 5, sz = s - 10;
    const v = 148 + rnd() * 34 | 0, warm = rnd() * 10 | 0;
    // each stone gets a lit top-left bevel and a shaded bottom-right one, so the yard reads as carved
    const g = x.createLinearGradient(px, py, px + sz, py + sz);
    g.addColorStop(0, `rgb(${v + 22 + warm},${v + 18},${v + 8})`); g.addColorStop(0.5, `rgb(${v + warm},${v - 3},${v - 12})`); g.addColorStop(1, `rgb(${v - 26},${v - 30},${v - 36})`);
    x.fillStyle = g; x.fillRect(px, py, sz, sz);
    x.fillStyle = `rgb(${v + 4 + warm},${v},${v - 9})`; x.fillRect(px + 7, py + 7, sz - 14, sz - 14);
    for (let k = 0; k < 70; k++) { x.fillStyle = `rgba(${rnd() < 0.5 ? '40,30,20' : '255,250,240'},${rnd() * 0.07})`; const r = 1 + rnd() * 5; x.beginPath(); x.arc(px + rnd() * sz, py + rnd() * sz, r, 0, 7); x.fill(); }
    if (rnd() < 0.18) { x.strokeStyle = 'rgba(40,30,20,.35)'; x.lineWidth = 2; x.beginPath(); let cx = px + rnd() * sz, cy = py + rnd() * sz; x.moveTo(cx, cy); for (let k = 0; k < 4; k++) { cx += (rnd() - 0.5) * 50; cy += (rnd() - 0.5) * 50; x.lineTo(cx, cy); } x.stroke(); }
  }
  // a worn stone medallion in the middle of the yard
  x.save(); x.translate(w / 2, h / 2); x.scale(2, 2);
  for (let r = 150; r > 20; r -= 30) { x.strokeStyle = 'rgba(70,60,50,.35)'; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.stroke(); }
  for (let i = 0; i < 8; i++) { x.rotate(Math.PI / 4); x.beginPath(); x.moveTo(30, 0); x.lineTo(150, 0); x.stroke(); }
  x.restore();
  // moss in the cracks near the edges
  for (let k = 0; k < 1400; k++) { const e = rnd() < 0.5 ? rnd() * 160 : w - rnd() * 160; const [px, py] = rnd() < 0.5 ? [e, rnd() * h] : [rnd() * w, e]; x.fillStyle = `rgba(80,110,50,${rnd() * 0.3})`; x.beginPath(); x.arc(px, py, 2 + rnd() * 7, 0, 7); x.fill(); }
});

const bricks = () => canvasTex(512, 256, (x, w, h) => {
  x.fillStyle = '#5f5f66'; x.fillRect(0, 0, w, h);
  const bh = 16, bw = 48;
  for (let r = 0; r < h / bh; r++) for (let c = -1; c < w / bw + 1; c++) {
    const v = 112 + rnd() * 26 | 0;
    x.fillStyle = `rgb(${v},${v + 2},${v + 8})`;
    x.fillRect(c * bw + (r % 2) * bw / 2 + 2, r * bh + 2, bw - 4, bh - 4);
  }
}, [4, 1]);

const roofTiles = () => canvasTex(256, 256, (x, w, h) => {
  x.fillStyle = '#3d4049'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) {
    const g = x.createLinearGradient(i * 16, 0, i * 16 + 16, 0);
    g.addColorStop(0, '#2c2f37'); g.addColorStop(0.5, '#5b5f6b'); g.addColorStop(1, '#2c2f37');
    x.fillStyle = g; x.fillRect(i * 16 + 2, 0, 12, h);
  }
}, [8, 1]);

const facade = () => canvasTex(1024, 256, (x, w, h) => {
  x.fillStyle = '#b8b2a6'; x.fillRect(0, 0, w, h);
  const bay = w / 4;
  for (let b = 0; b < 4; b++) {
    const bx = b * bay;
    x.fillStyle = '#9e2a22'; x.fillRect(bx, 0, 18, h); x.fillRect(bx + bay - 18, 0, 18, h);
    if (b % 2 === 0) {
      // red double doors with brass studs
      x.fillStyle = '#b3261e'; x.fillRect(bx + 70, 70, bay - 140, h - 70);
      x.strokeStyle = '#6e140f'; x.lineWidth = 4; x.strokeRect(bx + 70, 70, bay - 140, h - 70);
      x.beginPath(); x.moveTo(bx + bay / 2, 70); x.lineTo(bx + bay / 2, h); x.stroke();
      x.fillStyle = '#e8b84a';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) for (const s of [-1, 1]) { x.beginPath(); x.arc(bx + bay / 2 + s * (22 + j * 22), 100 + i * 36, 4, 0, 7); x.fill(); }
      x.beginPath(); x.arc(bx + bay / 2 - 12, 160, 9, 0, 7); x.arc(bx + bay / 2 + 12, 160, 9, 0, 7); x.fill();
      x.fillStyle = '#d8292b'; x.fillRect(bx + 88, 82, 26, 70); x.fillRect(bx + bay - 114, 82, 26, 70);
      x.fillStyle = '#1d1a24'; x.font = 'bold 20px "PingFang SC",sans-serif'; x.textAlign = 'center';
      x.fillText('福', bx + 101, 124); x.fillText('福', bx + bay - 101, 124);
      // couplets either side of the door
      for (const [cx, words] of [[bx + 40, '龟年福寿'], [bx + bay - 40, '甜过众生']]) { x.fillStyle = '#d8292b'; x.fillRect(cx - 14, 62, 28, 180); x.fillStyle = '#1d1a24'; x.font = 'bold 22px "PingFang SC",sans-serif'; [...words].forEach((c, k) => x.fillText(c, cx, 92 + k * 42)); }
    } else {
      // lattice window
      x.fillStyle = '#6e140f'; x.fillRect(bx + 50, 50, bay - 100, 130);
      x.fillStyle = '#f4ead1'; x.fillRect(bx + 58, 58, bay - 116, 114);
      x.strokeStyle = '#8b2a1d'; x.lineWidth = 5;
      for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(bx + 58 + i * (bay - 116) / 6, 58); x.lineTo(bx + 58 + i * (bay - 116) / 6, 172); x.stroke(); }
      for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(bx + 58, 58 + i * 28.5); x.lineTo(bx + bay - 58, 58 + i * 28.5); x.stroke(); }
    }
  }
  // painted beam under the eaves
  const g = x.createLinearGradient(0, 0, 0, 40);
  g.addColorStop(0, '#2f6e7a'); g.addColorStop(1, '#1f4d58');
  x.fillStyle = g; x.fillRect(0, 0, w, 40);
  for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#d8b04a' : '#c23b2e'; x.beginPath(); x.arc(i * 64 + 32, 20, 11, 0, 7); x.fill(); }
});

// A roof with a soft concave sweep and upturned eaves, extruded along x.
function roof(len, depth, height, mat) {
  const s = new THREE.Shape();
  const d = depth / 2;
  s.moveTo(-d - 0.25, 0.12);
  s.quadraticCurveTo(-d * 0.35, 0.05, 0, height);
  s.quadraticCurveTo(d * 0.35, 0.05, d + 0.25, 0.12);
  s.lineTo(d + 0.25, -0.05);
  s.quadraticCurveTo(d * 0.3, -0.08, 0, height - 0.22);
  s.quadraticCurveTo(-d * 0.3, -0.08, -d - 0.25, -0.05);
  const geo = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false, curveSegments: 10 });
  geo.translate(0, 0, -len / 2);
  geo.rotateY(Math.PI / 2);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, len + 0.4, 10).rotateZ(Math.PI / 2), toon('#2a2c33'));
  ridge.position.y = height;
  m.add(ridge);
  for (const sx of [-1, 1]) {
    const orn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 6), toon('#2a2c33'));
    orn.position.set(sx * (len / 2 + 0.2), height + 0.14, 0);
    orn.rotation.z = -sx * 0.5;
    m.add(orn);
  }
  return m;
}

function lantern() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 12), glow('#ff3b24', 1.2));
  body.scale.y = 1.15;
  g.add(body);
  for (const y of [-0.3, 0.3]) g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), toon('#e8b84a')).translateY(y));
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.06, 0.3, 6), toon('#ffcf3a'));
  tassel.position.y = -0.48;
  g.add(tassel);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), toon('#2a2c33'));
  cord.position.y = 0.55;
  g.add(cord);
  g.userData.body = body;
  return g;
}

function tree() {
  const g = new THREE.Group();
  const bark = toon('#6b4a33');
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 2.6, 10), bark);
  trunk.position.y = 1.3; trunk.castShadow = true;
  g.add(trunk);
  for (const [a, l] of [[0.6, 1.4], [-0.7, 1.2], [2.2, 1.1]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, l, 7), bark);
    b.position.set(Math.cos(a) * 0.4, 2.5, Math.sin(a) * 0.4);
    b.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
    b.castShadow = true;
    g.add(b);
  }
  const crown = new THREE.Group();
  crown.position.y = 3.3;
  const leafCols = ['#4f8a3c', '#5f9c45', '#6fae4f', '#4a7f38'];
  for (let i = 0; i < 16; i++) {
    const r = 0.7 + rnd() * 0.6;
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), toon(leafCols[i % 4], { flatShading: true }));
    const a = rnd() * Math.PI * 2, d = rnd() * 1.6;
    c.position.set(Math.cos(a) * d, rnd() * 1.3 - 0.2, Math.sin(a) * d);
    c.castShadow = true;
    crown.add(c);
  }
  // persimmons, very Beijing in autumn
  for (let i = 0; i < 18; i++) {
    const a = rnd() * Math.PI * 2, d = 0.6 + rnd() * 1.6;
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), glow('#ff8a1f', 0.25));
    f.scale.y = 0.8; f.position.set(Math.cos(a) * d, -0.4 + rnd() * 1.2, Math.sin(a) * d); f.castShadow = true;
    crown.add(f);
  }
  // a birdcage hanging from a branch
  const cage = new THREE.Group();
  cage.position.set(1.6, 2.2, 0.6);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), toon('#8a5a2b')); bar.position.set(Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18); cage.add(bar); }
  cage.add(new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.2, 12), toon('#8a5a2b')).translateY(0.34));
  cage.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 12), toon('#8a5a2b')).translateY(-0.25));
  const bird = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), toon('#ffd35a')); bird.position.y = -0.05; cage.add(bird);
  cage.add(new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.7, 3), toon('#2a2c33')).translateY(0.75));
  g.add(cage);
  g.add(crown);
  g.userData.crown = crown; g.userData.cage = cage;
  return g;
}

function well() {
  const g = new THREE.Group();
  const stone = toon('#8a8780');
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.7, 16, 1, true), toon('#8a8780', { side: THREE.DoubleSide }));
  ring.position.y = 0.35; ring.castShadow = true;
  g.add(ring);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.1, 8, 24), stone);
  lip.rotation.x = Math.PI / 2; lip.position.y = 0.7;
  g.add(lip);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), new THREE.MeshStandardMaterial({ color: '#1f4d58', roughness: 0.1, metalness: 0.3 }));
  water.rotation.x = -Math.PI / 2; water.position.y = 0.45;
  g.add(water);
  const wood = toon('#7a5230');
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), wood); p.position.set(0, 0.8, s * 0.8); p.castShadow = true; g.add(p); }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.8, 8).rotateX(Math.PI / 2), wood);
  beam.position.y = 1.5;
  g.add(beam);
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.22, 10), toon('#9a6b3c'));
  bucket.position.set(0, 0.95, 0);
  g.add(bucket);
  return g;
}

function dagoba() {
  // the white stupa on the hill in Beihai, far beyond the wall
  const g = new THREE.Group();
  const white = toon('#f1efe8');
  const hill = new THREE.Mesh(new THREE.SphereGeometry(9, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#5f7d4a'));
  hill.scale.y = 0.45;
  g.add(hill);
  const pts = [[0, 0], [2.2, 0], [2.2, 0.6], [1.9, 0.7], [2.1, 2.6], [1.6, 3.6], [0.9, 4.0], [0.55, 4.2], [0.55, 4.6], [0.35, 4.6], [0.4, 6.6], [0.15, 6.9], [0, 7.4]].map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), white);
  body.position.y = 3.9;
  g.add(body);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8), glow('#d8b04a', 0.4));
  cap.position.y = 11.4;
  g.add(cap);
  return g;
}

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#e9d8c0', 40, 120);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);

  const hemi = new THREE.HemisphereLight('#fff1dc', '#5a5048', 1.3);
  const sun = new THREE.DirectionalLight('#ffe0b5', 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 80 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  scene.add(hemi, sun, sun.target);

  // Sky dome: horizon glow, zenith, a sun disc by day and stars by night.
  const skyU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uGlow: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3(0.4, 0.25, -1).normalize() }, uNight: { value: 0 }, uTime: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec3 vDir; uniform vec3 uTop, uHor, uGlow, uSun; uniform float uNight, uTime;
      float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main(){
        float h = max(vDir.y, 0.0);
        vec3 col = mix(uHor, uTop, smoothstep(0.0, 0.5, h));
        float s = max(dot(vDir, uSun), 0.0);
        col += uGlow * pow(s, 6.0) * 0.6 + uGlow * pow(s, 400.0) * 3.0;
        vec3 cell = floor(vDir * 180.0);
        float st = step(0.997, hash(cell)) * smoothstep(0.05, 0.3, h);
        col += vec3(st) * uNight * (0.6 + 0.4 * sin(uTime * 3.0 + hash(cell) * 30.0));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  scene.add(sky);

  // ---------- courtyard ----------
  const yard = new THREE.Group();
  scene.add(yard);
  const groundMat = new THREE.MeshStandardMaterial({ map: paving(), roughness: 0.92 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(AW * 2, AH * 2), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  yard.add(ground);
  const outside = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: '#6f6a60', roughness: 1 }));
  outside.rotation.x = -Math.PI / 2; outside.position.y = -0.02; outside.receiveShadow = true;
  yard.add(outside);

  const brickMat = new THREE.MeshStandardMaterial({ map: bricks(), roughness: 0.95 });
  const tileMat = toon('#5b5f6b', { map: roofTiles() });
  function wall(x, z, len, h, rotY) {
    const g = new THREE.Group();
    const w = new THREE.Mesh(new THREE.BoxGeometry(len, h, 0.5), brickMat);
    w.position.y = h / 2; w.castShadow = w.receiveShadow = true;
    g.add(w);
    const cap = roof(len, 0.9, 0.35, tileMat);
    cap.position.y = h;
    g.add(cap);
    g.position.set(x, 0, z); g.rotation.y = rotY;
    yard.add(g);
  }
  wall(-AW - 0.3, 0, AH * 2 + 1.2, 1.8, Math.PI / 2);
  wall(AW + 0.3, 0, AH * 2 + 1.2, 1.8, Math.PI / 2);
  wall(0, AH + 0.3, AW * 2 + 1.2, 0.55, 0); // the near wall stays low so it never hides the yard

  // the main hall along the back
  const hall = new THREE.Group();
  hall.position.set(0, 0, -AH - 1.4);
  const fac = new THREE.Mesh(new THREE.BoxGeometry(AW * 2 + 1, 3.2, 2), [brickMat, brickMat, brickMat, brickMat, new THREE.MeshStandardMaterial({ map: facade(), roughness: 0.85 }), brickMat]);
  fac.material[4].map.repeat.set(2, 1); fac.material[4].map.wrapS = THREE.RepeatWrapping;
  fac.position.y = 1.6; fac.castShadow = fac.receiveShadow = true;
  hall.add(fac);
  const step = new THREE.Mesh(new THREE.BoxGeometry(AW * 2 + 1, 0.3, 0.8), toon('#a8a296'));
  step.position.set(0, 0.15, 1.3); step.receiveShadow = true;
  hall.add(step);
  for (let i = 0; i <= 8; i++) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 3.2, 12), toon('#a3261c'));
    p.position.set(-AW - 0.5 + i * (AW * 2 + 1) / 8, 1.6, 1.15); p.castShadow = true;
    hall.add(p);
  }
  const bigRoof = roof(AW * 2 + 2.4, 3.6, 1.6, tileMat);
  bigRoof.position.set(0, 3.2, 0.2);
  hall.add(bigRoof);
  // a plaque over the middle door
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.08), [toon('#1d1a24'), toon('#1d1a24'), toon('#1d1a24'), toon('#1d1a24'), new THREE.MeshStandardMaterial({ map: canvasTex(512, 140, (x, w, h) => { x.fillStyle = '#1d1a24'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e8b84a'; x.lineWidth = 8; x.strokeRect(8, 8, w - 16, h - 16); x.fillStyle = '#e8b84a'; x.font = 'bold 84px "PingFang SC","Songti SC",serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('龟 苑', w / 2, h / 2 + 4); }), emissive: '#3a2a10', emissiveIntensity: 0.3 }), toon('#1d1a24')]);
  plaque.position.set(0, 2.75, 1.05);
  hall.add(plaque);
  // strings of firecrackers on the pillars
  for (const px of [-AW - 0.5 + 3 * (AW * 2 + 1) / 8, -AW - 0.5 + 5 * (AW * 2 + 1) / 8]) for (let k = 0; k < 9; k++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 8), glow('#e0242f', 0.5));
    c.position.set(px + (k % 2 ? 0.07 : -0.07), 2.6 - k * 0.15, 1.38); c.rotation.z = (k % 2 ? 0.5 : -0.5);
    hall.add(c);
  }
  yard.add(hall);

  // stone lions guarding the hall steps
  for (const sx of [-1, 1]) {
    const lion = new THREE.Group();
    const stone = toon('#9a968c');
    lion.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.9), toon('#7f7b72')).translateY(0.25));
    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), stone); torso.scale.set(0.9, 1.1, 0.8); torso.position.y = 0.85; lion.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), stone); head.position.set(0, 1.35, 0.12); lion.add(head);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const curl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), toon('#86827a')); curl.position.set(Math.cos(a) * 0.3, 1.35 + Math.sin(a) * 0.3, 0.02); lion.add(curl); }
    for (const ex of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), toon('#5f5b52')); e.position.set(ex * 0.11, 1.42, 0.38); lion.add(e); }
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), toon('#86827a')); ball.position.set(sx * -0.25, 0.68, 0.32); lion.add(ball);
    lion.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    lion.position.set(sx * 3.2, 0, -AH - 0.25);
    lion.rotation.y = sx * -0.25;
    yard.add(lion);
  }

  // a laundry line across one corner of the yard, well above head height
  const lineA = new THREE.Vector3(-AW + 0.2, 2.6, -2), lineB = new THREE.Vector3(-6.2, 3.4, -4.6);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, lineA.distanceTo(lineB), 4), toon('#e8e2d0'));
  rope.position.copy(lineA).lerp(lineB, 0.5); rope.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), lineB.clone().sub(lineA).normalize());
  yard.add(rope);
  const clothes = [];
  ['#ff6fae', '#3a7bd5', '#ffd35a', '#ffffff', '#3ad17a'].forEach((c, i) => {
    const p = lineA.clone().lerp(lineB, 0.15 + i * 0.17);
    const cloth = new THREE.Mesh(i === 3 ? new THREE.PlaneGeometry(0.5, 0.6) : new THREE.PlaneGeometry(0.42, 0.5), toon(c, { side: THREE.DoubleSide }));
    cloth.geometry.translate(0, -0.27, 0);
    cloth.position.copy(p); cloth.rotation.y = Math.atan2(lineB.x - lineA.x, lineB.z - lineA.z) + Math.PI / 2; cloth.castShadow = true;
    yard.add(cloth); clothes.push(cloth);
  });

  // grass in the cracks, mostly near the walls and around the tree, swaying in the breeze
  const windU = { value: 0 };
  const grassGeo = (() => {
    const blades = [];
    for (let i = 0; i < 4; i++) { const b = new THREE.ConeGeometry(0.035, 0.32 + i * 0.05, 3); b.translate(0, 0.16, 0); b.rotateZ((i - 1.5) * 0.25); b.rotateY(i * 1.6); blades.push(b.toNonIndexed()); }
    const pos = blades.flatMap((b) => [...b.attributes.position.array]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    return geo;
  })();
  const grassMat = toon('#6f9e43');
  const grassMatW = grassMat.clone();
  grassMatW.onBeforeCompile = (sh) => {
    sh.uniforms.uWind = windU;
    sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvec4 ip = instanceMatrix[3];\ntransformed.x += sin(uWind * 2.0 + ip.x * 0.7 + ip.z * 0.5) * 0.06 * position.y * 3.0;');
  };
  const NG = 520;
  const grass = new THREE.InstancedMesh(grassGeo, grassMatW, NG);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  for (let i = 0; i < NG; i++) {
    let x, z;
    if (i < 340) { const side = i % 4, t = rnd() * 2 - 1, edge = AW - rnd() * rnd() * 2.2; [x, z] = side === 0 ? [-edge, t * AH] : side === 1 ? [edge, t * AH] : side === 2 ? [t * AW, -edge] : [t * AW, edge]; }
    else if (i < 420) { const a = rnd() * Math.PI * 2, d = 1.1 + rnd() * 1.4; x = OBSTACLES[0].x + Math.cos(a) * d; z = -OBSTACLES[0].y + Math.sin(a) * d; }
    else { x = (rnd() * 2 - 1) * AW; z = (rnd() * 2 - 1) * AH; }
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6.28);
    const k = 0.6 + rnd() * 0.9;
    m4.compose(new THREE.Vector3(x, 0, z), q, sc.set(k, k * (0.7 + rnd() * 0.6), k));
    grass.setMatrixAt(i, m4);
  }
  grass.receiveShadow = true;
  yard.add(grass);

  // fallen leaves and a few persimmons on the ground
  const leafGeo = new THREE.CircleGeometry(0.11, 6).rotateX(-Math.PI / 2); leafGeo.scale(1.6, 1, 0.8);
  const NL = 160;
  const leaves = new THREE.InstancedMesh(leafGeo, toon('#ffffff'), NL);
  const leafCols = ['#c9a43a', '#b8722c', '#8fae4a', '#d88a2a'].map((c) => new THREE.Color(c));
  for (let i = 0; i < NL; i++) {
    const a = rnd() * Math.PI * 2, d = i < 90 ? 1.2 + rnd() * 4 : rnd() * 16;
    const x = i < 90 ? OBSTACLES[0].x + Math.cos(a) * d : (rnd() * 2 - 1) * AW, z = i < 90 ? -OBSTACLES[0].y + Math.sin(a) * d : (rnd() * 2 - 1) * AH;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6.28);
    m4.compose(new THREE.Vector3(THREE.MathUtils.clamp(x, -AW, AW), 0.012 + i * 0.00005, THREE.MathUtils.clamp(z, -AH, AH)), q, sc.setScalar(0.7 + rnd() * 0.7));
    leaves.setMatrixAt(i, m4); leaves.setColorAt(i, leafCols[i % 4]);
  }
  leaves.receiveShadow = true;
  yard.add(leaves);

  // lanterns: meshes along the hall, four real lights that brighten with the night
  const lanterns = [];
  for (let i = 0; i < 6; i++) {
    const l = lantern();
    l.position.set(-AW + 2 + i * (AW * 2 - 4) / 5, 2.65, -AH + 0.15);
    yard.add(l); lanterns.push(l);
  }
  for (const [x, z] of [[-AW + 0.4, -3], [-AW + 0.4, 6], [AW - 0.4, -3], [AW - 0.4, 6]]) {
    const l = lantern(); l.position.set(x, 2.1, z); yard.add(l); lanterns.push(l);
  }
  const lights = [[-7, -AH + 1], [7, -AH + 1], [-AW + 1, 2], [AW - 1, 2]].map(([x, z]) => {
    const p = new THREE.PointLight('#ff7a3c', 0, 13, 1.6);
    p.position.set(x, 2.5, z);
    scene.add(p);
    return p;
  });

  const props = [];
  for (const o of OBSTACLES) {
    const m = o.kind === 'tree' ? tree() : well();
    m.position.set(o.x, 0, -o.y);
    yard.add(m); props.push(m);
  }
  // potted pomegranates and a birdcage, a bicycle leaning by the wall
  for (const [x, z] of [[-AW + 1, -AH + 1], [AW - 1, -AH + 1], [-AW + 1, AH - 1.2], [AW - 1, AH - 1.2]]) {
    const pot = new THREE.Group();
    pot.add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.32, 0.6, 14), toon('#8a3b22')).translateY(0.3));
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), toon('#4f8a3c', { flatShading: true }));
    bush.position.y = 1.0; pot.add(bush);
    for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), glow('#ff5a3a', 0.4)); const a = i * 1.1; f.position.set(Math.cos(a) * 0.45, 1 + Math.sin(i) * 0.3, Math.sin(a) * 0.45); pot.add(f); }
    pot.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    pot.position.set(x, 0, z);
    yard.add(pot);
  }
  const bike = new THREE.Group();
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 6, 20), toon('#1d1a24')); w.position.set(s * 0.5, 0.36, 0); bike.add(w); }
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 0.06, 0.06), toon('#2c7a6b')); frame.position.y = 0.6; bike.add(frame);
  bike.position.set(AW - 0.7, 0, 3.5); bike.rotation.y = Math.PI / 2; bike.rotation.x = 0.12;
  yard.add(bike);

  // Beijing beyond the wall: rows of grey roofs, a few trees, the white stupa
  const beyond = new THREE.Group();
  for (let row = 0; row < 3; row++) for (let i = -6; i <= 6; i++) {
    const len = 5 + rnd() * 3, h = 2.4 + rnd() * 0.8;
    const r = roof(len, 4, 1.3, tileMat);
    r.position.set(i * 7 + (row % 2) * 3.5 + rnd(), h, -AH - 7 - row * 7);
    beyond.add(r);
    const wb = new THREE.Mesh(new THREE.BoxGeometry(len - 0.6, h, 3.4), toon('#9a9488'));
    wb.position.set(r.position.x, h / 2, r.position.z);
    beyond.add(wb);
  }
  for (let i = 0; i < 18; i++) {
    const t = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 + rnd(), 0), toon(rnd() < 0.5 ? '#557a40' : '#4a6d38', { flatShading: true }));
    t.position.set(-45 + rnd() * 90, 3.5, -AH - 9 - rnd() * 18);
    beyond.add(t);
  }
  for (const s of [-1, 1]) for (let i = 0; i < 8; i++) {
    const r = roof(4, 4, 1.2, tileMat);
    r.rotation.y = Math.PI / 2;
    r.position.set(s * (AW + 4 + (i % 2) * 5), 2.6, -AH + i * 4);
    beyond.add(r);
  }
  const stupa = dagoba();
  stupa.position.set(22, 0, -70);
  beyond.add(stupa);
  scene.add(beyond);

  // ---------- post ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.5, 0.45, 0.93);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  // colour grade, vignette, and the white-out / red-edge flashes for hits and flashbangs
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uSat: { value: 1.12 }, uVig: { value: 0.42 }, uFlash: { value: 0 }, uHurt: { value: 0 }, uChroma: { value: 0 }, uWarm: { value: 0.5 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uSat, uVig, uFlash, uHurt, uChroma, uWarm; varying vec2 vUv;
      void main(){
        vec2 d = vUv - 0.5; float r = length(d);
        vec3 col = uChroma > 0.001 ? vec3(texture2D(tDiffuse, vUv + d * uChroma * 0.03).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - d * uChroma * 0.03).b) : texture2D(tDiffuse, vUv).rgb;
        float l = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(l), col, uSat);
        col *= mix(vec3(1.0), vec3(1.05, 1.0, 0.93), uWarm);
        col = (col - 0.5) * 1.06 + 0.5;
        col *= 1.0 - uVig * smoothstep(0.42, 0.95, r);
        col = mix(col, vec3(0.85, 0.08, 0.1), uHurt * smoothstep(0.3, 0.8, r) * 0.7);
        col = mix(col, vec3(1.0), uFlash);
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }`,
  });
  composer.addPass(grade);
  let useBloom = true, usePost = true;
  const post = grade.uniforms;

  // drifting petals by day, fireflies at night
  const NA = 180;
  const ambGeo = new THREE.BufferGeometry();
  const ambPos = new Float32Array(NA * 3), ambSeed = new Float32Array(NA);
  for (let i = 0; i < NA; i++) { ambPos[i * 3] = (rnd() * 2 - 1) * AW; ambPos[i * 3 + 1] = 0.5 + rnd() * 3.5; ambPos[i * 3 + 2] = (rnd() * 2 - 1) * AH; ambSeed[i] = rnd() * 100; }
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
  ambGeo.setAttribute('seed', new THREE.BufferAttribute(ambSeed, 1));
  const ambU = { uTime: { value: 0 }, uNight: { value: 0 }, uScale: { value: 400 }, uSnow: { value: 0 } };
  let snowGoal = 0;
  const amb = new THREE.Points(ambGeo, new THREE.ShaderMaterial({
    uniforms: ambU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float seed; uniform float uTime, uNight, uScale, uSnow; varying float vA; varying vec3 vC;
      void main(){ vec3 p = position; float t = uTime * 0.3 + seed;
        p.x += sin(t * 0.7) * 1.5 + uTime * 0.25 * (1.0 - uNight) * (1.0 - uSnow); p.z += cos(t * 0.5) * 1.2; p.y += sin(t * 1.3) * 0.4;
        // snow: everything drifts down and loops back to the top
        p.y = mix(p.y, 5.5 - mod(uTime * 0.7 + seed * 3.0, 5.5), uSnow);
        p.x = mod(p.x + 12.5, 25.0) - 12.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float blink = uNight > 0.5 ? 0.5 + 0.5 * sin(uTime * 3.0 + seed * 7.0) : 0.7;
        vA = mix(blink, 0.85, uSnow); vC = mix(mix(vec3(1.0, 0.72, 0.82), vec3(0.75, 1.0, 0.45), uNight), vec3(0.75), uSnow);
        gl_PointSize = mix(mix(0.18, 0.13, uNight), 0.22, uSnow) * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vA; varying vec3 vC; void main(){ float r = length(gl_PointCoord - 0.5); if (r > 0.5) discard; gl_FragColor = vec4(vC * 1.4, pow(1.0 - r * 2.0, 1.5) * vA); }`,
  }));
  amb.frustumCulled = false;
  scene.add(amb);

  // ---------- time of day: one step per wave, afternoon to lantern-lit night ----------
  const KEYS = [
    { at: 0, top: '#7fb2e0', hor: '#f6dcb8', glow: '#ffd09a', sun: '#ffe7c4', sunI: 2.7, hemi: 1.3, fog: '#ead8bd', elev: 0.55, lamp: 0, exp: 1.05 },
    { at: 0.55, top: '#6f8fc8', hor: '#ffbf8a', glow: '#ff9a5c', sun: '#ffb47a', sunI: 2.2, hemi: 1.05, fog: '#e7b996', elev: 0.25, lamp: 0.4, exp: 1.05 },
    { at: 0.8, top: '#2b3466', hor: '#b86a6a', glow: '#ff7a4a', sun: '#ff9a6a', sunI: 1.1, hemi: 0.75, fog: '#6a5472', elev: 0.12, lamp: 1, exp: 1.1 },
    { at: 1, top: '#0e1430', hor: '#2c3466', glow: '#6a7ad8', sun: '#9fb2ff', sunI: 0.75, hemi: 0.6, fog: '#232a4a', elev: 0.6, lamp: 1.3, exp: 1.15 },
  ];
  const cA = new THREE.Color(), cB = new THREE.Color();
  const mixC = (t, a, b, k) => t.copy(cA.set(a)).lerp(cB.set(b), k);
  const day = { f: 0, goal: 0, lamp: 0 };
  const sunDir = new THREE.Vector3();
  function applyDay() {
    let i = 0;
    while (i < KEYS.length - 2 && day.f > KEYS[i + 1].at) i++;
    const A = KEYS[i], B = KEYS[i + 1], k = THREE.MathUtils.clamp((day.f - A.at) / (B.at - A.at), 0, 1);
    const L = (p) => A[p] + (B[p] - A[p]) * k;
    mixC(skyU.uTop.value, A.top, B.top, k); mixC(skyU.uHor.value, A.hor, B.hor, k); mixC(skyU.uGlow.value, A.glow, B.glow, k);
    mixC(sun.color, A.sun, B.sun, k); sun.intensity = L('sunI');
    hemi.intensity = L('hemi');
    mixC(scene.fog.color, A.fog, B.fog, k);
    mixC(hemi.groundColor, '#5a5048', '#1c1a2a', day.f);
    renderer.toneMappingExposure = L('exp');
    day.lamp = L('lamp');
    sunDir.set(-0.55, L('elev'), 0.35).normalize();
    skyU.uSun.value.set(-0.55, Math.max(0.05, L('elev') * 0.5), -0.8).normalize();
    skyU.uNight.value = THREE.MathUtils.clamp((day.f - 0.7) / 0.3, 0, 1);
    ambU.uNight.value = skyU.uNight.value;
    mixC(rim.color.value, '#fff0d8', '#8fb4ff', THREE.MathUtils.clamp((day.f - 0.5) / 0.5, 0, 1));
    rim.k.value = 0.35 + 0.25 * day.f;
    post.uWarm.value = 0.6 - 0.6 * day.f;
  }
  applyDay();

  const focus = new THREE.Vector3();
  function setDay(f, snap) { day.goal = THREE.MathUtils.clamp(f, 0, 1); if (snap) { day.f = day.goal; applyDay(); } }

  function update(t, dt) {
    if (Math.abs(day.goal - day.f) > 0.0005) { day.f += (day.goal - day.f) * (1 - Math.exp(-dt * 0.8)); applyDay(); }
    skyU.uTime.value = t;
    sky.position.copy(camera.position);
    sun.position.copy(focus).addScaledVector(sunDir, 40);
    sun.target.position.copy(focus);
    for (const [i, l] of lanterns.entries()) {
      l.rotation.z = Math.sin(t * 1.3 + i) * 0.06;
      l.userData.body.material.emissiveIntensity = 0.5 + day.lamp * 2.2;
    }
    for (const [i, p] of lights.entries()) p.intensity = day.lamp * (9 + Math.sin(t * 7 + i * 2) * 0.6);
    for (const p of props) if (p.userData.crown) { p.userData.crown.rotation.z = Math.sin(t * 0.7) * 0.025; p.userData.crown.rotation.x = Math.sin(t * 0.53) * 0.02; p.userData.cage.rotation.z = Math.sin(t * 1.1) * 0.08; }
    windU.value = t; ambU.uTime.value = t;
    ambU.uSnow.value += (snowGoal - ambU.uSnow.value) * (1 - Math.exp(-dt * 0.8));
    for (const [i, c] of clothes.entries()) c.rotation.x = Math.sin(t * 2 + i) * 0.15;
    post.uFlash.value *= Math.exp(-dt * 1.6); post.uHurt.value *= Math.exp(-dt * 5); post.uChroma.value *= Math.exp(-dt * 6);
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    ambU.uScale.value = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render() { if (usePost) composer.render(); else renderer.render(scene, camera); }
  function setQuality(level) {
    // 2: full, 1: no bloom, 0: no bloom and pixel ratio 1
    useBloom = level >= 2; usePost = level >= 1; bloom.enabled = useBloom;
    renderer.setPixelRatio(level >= 1 ? Math.min(window.devicePixelRatio || 1, level >= 2 ? 2 : 1.5) : 1);
    const ms = level >= 1 ? 2048 : 1024;
    if (sun.shadow.mapSize.x !== ms) { sun.shadow.mapSize.set(ms, ms); sun.shadow.map?.dispose(); sun.shadow.map = null; }
    resize();
  }

  resize();
  const flash = (k) => { post.uFlash.value = Math.max(post.uFlash.value, k); };
  const hurt = () => { post.uHurt.value = 1; post.uChroma.value = 1; };
  const setSnow = (on) => { snowGoal = on ? 1 : 0; };
  return { renderer, scene, camera, focus, update, resize, render, setDay, setQuality, flash, hurt, setSnow, get lamp() { return day.lamp; } };
}
