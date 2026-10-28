// Particles (two pooled point clouds: glowing and solid), expanding rings, and the
// 超级蜘蛛 web with its spider. Plane (x, y) maps to world (x, height, -y).
import * as THREE from 'three';
import { toon, glow } from './models.js';

const KINDS = {
  kill: { cols: ['#ffd35a', '#ff7a59', '#ffffff'], add: true, sp: 0.09, up: 0.08, g: 0.006, life: 40, size: 0.28 },
  spark: { cols: ['#fff3a8', '#ffd35a'], add: true, sp: 0.07, up: 0.03, g: 0.004, life: 14, size: 0.18 },
  fluff: { cols: ['#d7ad7e', '#c79a6b', '#f1d6b0'], add: false, sp: 0.06, up: 0.06, g: 0.0015, life: 70, size: 0.3, drag: 0.95 },
  gold: { cols: ['#ffd35a', '#fff1a8', '#ffb000'], add: true, sp: 0.08, up: 0.12, g: 0.004, life: 60, size: 0.3 },
  sugar: { cols: ['#ff3b5c', '#ffffff', '#ffd1e0'], add: true, sp: 0.06, up: 0.1, g: 0.005, life: 40, size: 0.22 },
  dust: { cols: ['#b9b2a6', '#9d968a'], add: false, sp: 0.05, up: 0.03, g: 0.001, life: 34, size: 0.4, drag: 0.92 },
  ping: { cols: ['#ffd400', '#fff3a8'], add: true, sp: 0.1, up: 0.06, g: 0.005, life: 30, size: 0.3 },
  paper: { cols: ['#ffffff', '#f1ede4'], add: false, sp: 0.06, up: 0.08, g: 0.002, life: 60, size: 0.26, drag: 0.95 },
  boom: { cols: ['#ff7a2a', '#ffd35a', '#ff3b24'], add: true, sp: 0.16, up: 0.1, g: 0.004, life: 32, size: 0.5 },
  poof: { cols: ['#e8e4dc', '#c9c4ba'], add: false, sp: 0.05, up: 0.05, g: 0, life: 30, size: 0.45, drag: 0.9 },
  spawn: { cols: ['#ff5a5a', '#ffb3b3'], add: true, sp: 0.05, up: 0.07, g: 0.002, life: 26, size: 0.24 },
  heart: { cols: ['#ff7ab8', '#ffd1e8', '#ffffff'], add: true, sp: 0.12, up: 0.04, g: 0.001, life: 40, size: 0.32 },
  web: { cols: ['#ffffff', '#e6f3ff'], add: true, sp: 0.2, up: 0.05, g: 0.002, life: 40, size: 0.2 },
};

function cloud(scene, max, additive) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(max * 3), col = new Float32Array(max * 3), size = new Float32Array(max), alpha = new Float32Array(max);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
  const uniforms = { uScale: { value: 500 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, vertexColors: true,
    vertexShader: `attribute float size; attribute float alpha; varying vec3 vC; varying float vA; uniform float uScale;
      void main(){ vC = color; vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vC; varying float vA;
      void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard;
        float a = ${additive ? 'pow(1.0 - r * 2.0, 1.6)' : 'smoothstep(0.5, 0.35, r)'} * vA; gl_FragColor = vec4(vC * ${additive ? '1.6' : '1.0'}, a); }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  scene.add(pts);
  return { geo, pos, col, size, alpha, uniforms, list: [], max };
}

function webTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const x = c.getContext('2d');
  x.translate(512, 512);
  x.strokeStyle = 'rgba(255,255,255,0.95)';
  x.shadowColor = '#bfe4ff'; x.shadowBlur = 12;
  const spokes = 16;
  x.lineWidth = 5;
  for (let i = 0; i < spokes; i++) { const a = (i / spokes) * Math.PI * 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * 500, Math.sin(a) * 500); x.stroke(); }
  x.lineWidth = 3.5;
  for (let r = 40; r < 500; r += 34) {
    x.beginPath();
    for (let i = 0; i <= spokes; i++) {
      const a = (i / spokes) * Math.PI * 2, a0 = ((i - 0.5) / spokes) * Math.PI * 2;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      if (i === 0) x.moveTo(px, py); else x.quadraticCurveTo(Math.cos(a0) * r * 0.9, Math.sin(a0) * r * 0.9, px, py);
    }
    x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeSpider() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 14), toon('#2a2233'));
  body.scale.set(1, 0.85, 1.1);
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 12), toon('#2a2233'));
  head.position.set(0, -0.35, 0.7);
  g.add(head);
  for (const [x, y] of [[-0.14, -0.2], [0.14, -0.2], [-0.26, -0.32], [0.26, -0.32]]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), glow('#ff4fa0', 3)); e.position.set(x, y - 0.1, 1.05); g.add(e); }
  // her pink bow, so you know whose spider it is
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 4).rotateZ(s * Math.PI / 2), toon('#ff6fae')); c.position.set(s * 0.22, 0.65, 0); c.scale.y = 0.6; g.add(c); }
  const legs = [];
  for (let i = 0; i < 8; i++) {
    const s = i < 4 ? -1 : 1, k = i % 4;
    const pivot = new THREE.Group();
    pivot.position.set(s * 0.5, 0, 0.45 - k * 0.3);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.1, 6), toon('#2a2233'));
    upper.position.set(s * 0.45, 0.25, 0); upper.rotation.z = s * -1.0;
    pivot.add(upper);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 1.2, 6), toon('#2a2233'));
    lower.position.set(s * 1.05, -0.2, 0); lower.rotation.z = s * 0.5;
    pivot.add(lower);
    pivot.rotation.y = (k - 1.5) * 0.35 * s;
    g.add(pivot); legs.push(pivot);
  }
  const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 30, 4), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  thread.position.y = 15;
  g.add(thread);
  g.userData.legs = legs;
  return g;
}

export function createFx(scene) {
  const add = cloud(scene, 1600, true), solid = cloud(scene, 900, false);
  const tmp = new THREE.Color();

  function burst(kind, x, y, n = 12, h = 0.5) {
    const K = KINDS[kind] || KINDS.kill, sys = K.add ? add : solid;
    for (let i = 0; i < n; i++) {
      if (sys.list.length >= sys.max) sys.list.shift();
      const a = Math.random() * Math.PI * 2, sp = K.sp * (0.4 + Math.random());
      tmp.set(K.cols[i % K.cols.length]);
      sys.list.push({ x, y: h + Math.random() * 0.3, z: -y, vx: Math.cos(a) * sp, vy: K.up * (0.5 + Math.random()), vz: Math.sin(a) * sp, life: K.life * (0.6 + Math.random() * 0.6), max: 0, g: K.g, drag: K.drag || 0.97, size: K.size * (0.6 + Math.random() * 0.8), r: tmp.r, gg: tmp.g, b: tmp.b });
      sys.list[sys.list.length - 1].max = sys.list[sys.list.length - 1].life;
    }
  }

  function flush(sys) {
    let n = 0;
    const keep = [];
    for (const p of sys.list) {
      p.vy -= p.g; p.vx *= p.drag; p.vz *= p.drag;
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      if (p.y < 0.03) { p.y = 0.03; p.vy *= -0.3; p.vx *= 0.7; p.vz *= 0.7; }
      if (--p.life <= 0) continue;
      keep.push(p);
      sys.pos[n * 3] = p.x; sys.pos[n * 3 + 1] = p.y; sys.pos[n * 3 + 2] = p.z;
      sys.col[n * 3] = p.r; sys.col[n * 3 + 1] = p.gg; sys.col[n * 3 + 2] = p.b;
      sys.size[n] = p.size; sys.alpha[n] = Math.min(1, p.life / (p.max * 0.4));
      n++;
    }
    sys.list = keep;
    sys.geo.setDrawRange(0, n);
    for (const k of ['position', 'color', 'size', 'alpha']) sys.geo.attributes[k].needsUpdate = true;
  }

  // expanding rings: sweet voice (pink), bombs (orange), slams (red)
  const RING_COL = { voice: '#ff7ab8', boom: '#ff8a2a', slam: '#ff3b3b', gavel: '#ff6a3b', ping: '#ffd400', star: '#9fd8ff' };
  const ringGeo = new THREE.RingGeometry(0.86, 1, 64).rotateX(-Math.PI / 2);
  const rings = [];
  function ring(x, y, r, kind) {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: RING_COL[kind] || '#ffffff', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set(x, 0.08, -y);
    scene.add(m);
    rings.push({ m, r, t: 0, T: kind === 'voice' ? 26 : 20 });
    if (kind === 'voice') burst('heart', x, y, 26, 0.8);
  }

  // 超级蜘蛛: a spider drops on its thread, and a web spreads across the yard
  const webMat = new THREE.MeshBasicMaterial({ map: webTexture(), transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending });
  const web = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), webMat);
  web.position.y = 0.06; web.visible = false;
  scene.add(web);
  const spider = makeSpider();
  spider.visible = false;
  scene.add(spider);
  let webT = 0;
  function superSpider(x, y) {
    webT = 1;
    web.position.x = x; web.position.z = -y; web.visible = true;
    spider.position.set(x, 18, -y); spider.visible = true;
    burst('web', x, y, 60, 0.3);
  }

  // 流星风暴: a glowing star streaks down onto each target
  const starGeo = new THREE.SphereGeometry(0.28, 14, 10), trailGeo = new THREE.ConeGeometry(0.22, 2.4, 10, 1, true).translate(0, 1.2, 0);
  const starMat = glow('#bfe6ff', 4), trailMat = new THREE.MeshBasicMaterial({ color: '#9fd8ff', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const stars = [];
  function meteor(x, y, t) {
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(starGeo, starMat), new THREE.Mesh(trailGeo, trailMat));
    grp.rotation.z = -0.5;
    scene.add(grp);
    stars.push({ grp, x, y, t: 0, T: t });
  }

  function update() {
    flush(add); flush(solid);
    for (const s of stars) {
      s.t++;
      const k = Math.min(1, s.t / s.T);
      s.grp.position.set(s.x - 6 * (1 - k), 0.2 + 12 * (1 - k), -s.y);
      if (s.t >= s.T) { scene.remove(s.grp); s.done = true; }
    }
    for (let i = stars.length - 1; i >= 0; i--) if (stars[i].done) stars.splice(i, 1);
    for (const r of rings) {
      r.t++;
      const k = r.t / r.T;
      r.m.scale.setScalar(Math.max(0.01, r.r * (0.25 + 0.75 * Math.sqrt(k))));
      r.m.material.opacity = 0.9 * (1 - k);
      if (r.t >= r.T) { scene.remove(r.m); r.m.material.dispose(); r.done = true; }
    }
    for (let i = rings.length - 1; i >= 0; i--) if (rings[i].done) rings.splice(i, 1);
    if (webT > 0) {
      webT++;
      const grow = Math.min(1, webT / 30);
      web.scale.setScalar(26 * (1 - Math.pow(1 - grow, 3)));
      web.rotation.y = webT * 0.002;
      webMat.opacity = webT < 200 ? 0.75 : Math.max(0, 0.75 * (1 - (webT - 200) / 60));
      // drop, hang, climb back up
      const sy = webT < 24 ? 18 - (webT / 24) * 15.5 : webT < 120 ? 2.5 + Math.sin(webT * 0.1) * 0.25 : 2.5 + (webT - 120) * 0.25;
      spider.position.y = sy;
      spider.rotation.y = Math.sin(webT * 0.05) * 0.3;
      for (const [i, l] of spider.userData.legs.entries()) l.rotation.x = Math.sin(webT * 0.3 + i) * 0.25;
      if (webT > 260) { webT = 0; web.visible = false; spider.visible = false; }
    }
  }

  function setScale(v) { add.uniforms.uScale.value = solid.uniforms.uScale.value = v; }
  return { burst, ring, superSpider, meteor, update, setScale };
}
