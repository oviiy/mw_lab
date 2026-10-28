import * as THREE from 'three';
import { toWorld, DIRS, key } from './hex.js';
import { SEA_Y } from './tileMesh.js';

// Things that arrive as the island ranks up: puffins on the cliffs, a lighthouse,
// fishing boats, whales offshore, seals on the skerries, a harbour with its ferry,
// and the northern lights. Purely visual.

const flat = (c) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.85 });
const M = { dark: flat('#22201f'), white: flat('#f1efe8'), orange: flat('#e8792e'), red: flat('#a8372c'), hull: flat('#7a3a2c'), sail: flat('#efe9da'), whale: flat('#33414a'), glass: flat('#ffe6a8'), seal: flat('#6d6862'), sealPale: flat('#9a948b'), rock: flat('#3f4547'), wood: flat('#8a6a48'), plank: flat('#a8865d'), ferry: flat('#2f4d63') };
const beamMat = new THREE.MeshBasicMaterial({ color: '#fff1c4', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });

function puffin() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M.dark);
  body.scale.set(1, 1.3, 1); body.position.y = 0.045;
  const belly = new THREE.Mesh(new THREE.IcosahedronGeometry(0.026, 0), M.white);
  belly.scale.set(0.8, 1.2, 0.8); belly.position.set(0.016, 0.04, 0);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.024, 0), M.dark);
  head.position.set(0.005, 0.095, 0);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.03, 4).rotateZ(-Math.PI / 2), M.orange);
  beak.position.set(0.03, 0.092, 0);
  g.add(body, belly, head, beak);
  return g;
}

function lighthouse() {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.62, 10), M.white);
  tower.position.y = 0.31;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.083, 0.088, 0.1, 10), M.red);
  band.position.y = 0.36;
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), M.glass);
  lamp.position.y = 0.66;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.09, 8), M.red);
  cap.position.y = 0.745;
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4, 16, 1, true).translate(0, -2, 0).rotateZ(Math.PI / 2), beamMat);
  beam.position.y = 0.66;
  g.add(tower, band, lamp, cap, beam);
  for (const o of [tower, band, cap]) { o.castShadow = true; }
  g.userData.beam = beam;
  g.userData.lampMat = lamp.material;
  return g;
}

function boat() {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.16), M.hull);
  hull.position.y = 0.04;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.12), M.white);
  deck.position.set(-0.06, 0.13, 0);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 4), M.dark);
  mast.position.set(0.08, 0.26, 0);
  const sail = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.09, 0.12, 0), new THREE.Vector3(0.09, 0.42, 0), new THREE.Vector3(0.24, 0.12, 0)]), M.sail);
  sail.geometry.computeVertexNormals();
  sail.material.side = THREE.DoubleSide;
  g.add(hull, deck, mast, sail);
  hull.castShadow = deck.castShadow = true;
  return g;
}

function whale() {
  const g = new THREE.Group();
  const back = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.whale);
  back.scale.set(2.2, 0.55, 0.8);
  const tail = new THREE.Group();
  const fluke = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.9), M.whale);
  fluke.position.y = 0.45;
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.5, 6), M.whale);
  stalk.position.y = 0.2;
  tail.add(stalk, fluke);
  tail.position.x = -1.3;
  g.add(back, tail);
  g.userData.tail = tail;
  return g;
}

function sealRock(seed) {
  const g = new THREE.Group();
  // a little cluster of basalt columns, like the island's own
  for (let i = 0; i < 4; i++) {
    const h = 0.16 + ((seed * (i + 3) * 7919) % 9) * 0.025;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, h + 0.5, 6), M.rock);
    const a = (i * Math.PI * 2) / 3 + seed;
    col.position.set(i ? Math.cos(a) * 0.3 : 0, SEA_Y - 0.25 + (h + 0.5) / 2, i ? Math.sin(a) * 0.3 : 0);
    col.castShadow = true;
    g.add(col);
  }
  g.userData.seals = [];
  for (let j = 0; j < 1 + (seed % 2); j++) {
    const s = seal(j ? M.sealPale : M.seal);
    const top = g.children[j].position.y + g.children[j].geometry.parameters.height / 2;
    s.position.set(g.children[j].position.x, top, g.children[j].position.z);
    s.rotation.y = seed * 2 + j * 2.4;
    s.userData.phase = seed * 3 + j * 1.7;
    g.add(s);
    g.userData.seals.push(s);
  }
  return g;
}

function seal(mat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), mat);
  body.scale.set(2.1, 0.75, 1); body.position.y = 0.05;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 4).rotateZ(Math.PI / 2), mat);
  tail.position.set(-0.2, 0.04, 0);
  const head = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 0), mat);
  const nose = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), M.dark);
  nose.position.set(0.05, -0.005, 0);
  head.add(skull, nose);
  head.position.set(0.15, 0.09, 0);
  g.add(body, tail, head);
  g.userData.head = head;
  return g;
}

function pier(top) {
  const g = new THREE.Group();
  const deckY = SEA_Y + 0.32, L = 1.5;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(L, 0.04, 0.26), M.plank);
  deck.position.set(0.15 + L / 2, deckY, 0);
  // planks down from the cliff edge to the deck
  const drop = Math.max(0.05, top - deckY);
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(0.32, drop), 0.035, 0.2), M.plank);
  ramp.position.set(0, deckY + drop / 2, 0);
  ramp.rotation.z = -Math.atan2(drop, 0.32);
  g.add(deck, ramp);
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.6, 5), M.wood);
      post.position.set(0.22 + (i * (L - 0.12)) / 3, deckY - 0.26, side * 0.12);
      g.add(post);
    }
  }
  const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), M.dark);
  lampPost.position.set(0.1 + L, deckY + 0.15, 0.1);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.04), M.glass);
  lamp.position.set(0.1 + L, deckY + 0.32, 0.1);
  const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.06, 6), M.dark);
  bollard.position.set(L - 0.2, deckY + 0.05, -0.09);
  g.add(lampPost, lamp, bollard);
  deck.castShadow = ramp.castShadow = true;
  g.userData.end = 0.15 + L;
  return g;
}

function ferry() {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.13, 0.26), M.ferry);
  hull.position.y = 0.05;
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.13, 3, 1).rotateY(Math.PI / 6), M.ferry);
  bow.scale.set(1.1, 1, 1); bow.position.set(0.36, 0.05, 0);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.22), M.white);
  cabin.position.set(-0.04, 0.17, 0);
  const windows = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.225), M.glass);
  windows.position.set(-0.04, 0.19, 0);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.16), M.white);
  bridge.position.set(0.06, 0.27, 0);
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.14, 8), M.red);
  funnel.position.set(-0.14, 0.3, 0);
  g.add(hull, bow, cabin, windows, bridge, funnel);
  hull.castShadow = cabin.castShadow = true;
  return g;
}

// Northern lights: curtains low over the far sea, and their glow laid across the water.
const auroraMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    varying vec2 vUv; uniform float uTime; uniform float uOpacity;
    void main(){
      float x = vUv.x * 40.0;
      float rays = 0.55 + 0.45 * sin(x * 1.7 + sin(x * 0.31 + uTime * 0.4) * 3.0 + uTime * 0.6);
      float fold = 0.5 + 0.5 * sin(vUv.x * 9.0 - uTime * 0.25);
      float fade = smoothstep(0.0, 0.12, vUv.y) * pow(1.0 - vUv.y, 1.6);
      vec3 col = mix(vec3(0.25, 1.0, 0.6), vec3(0.6, 0.35, 1.0), smoothstep(0.35, 0.95, vUv.y));
      float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
      gl_FragColor = vec4(col * rays * (0.4 + 0.6 * fold) * fade * edge * uOpacity, 1.0);
    }`,
});

// One arc of light: a wavy curtain standing on the horizon (flat = false) or
// its reflection lying on the water toward the island (flat = true). Built for radius 1.
function auroraArc(a0, span, flat) {
  const N = 48, pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = a0 + span * t;
    const r = 1 + Math.sin(a * 5 + a0) * 0.05;
    const cx = Math.cos(a), cz = Math.sin(a);
    if (flat) {
      pos.push(cx * r, SEA_Y + 0.22, cz * r, cx * r * 0.55, SEA_Y + 0.22, cz * r * 0.55);
    } else {
      pos.push(cx * r, SEA_Y + 0.5, cz * r, cx * r, SEA_Y + 9, cz * r);
    }
    uv.push(t, flat ? 0.02 : 0, t, flat ? 0.85 : 1);
    if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  const m = new THREE.Mesh(g, auroraMat);
  m.frustumCulled = false;
  m.renderOrder = 2;
  return m;
}

function aurora() {
  const g = new THREE.Group();
  for (const [a0, span] of [[0.2, 1.5], [2.4, 1.2], [4.1, 1.6]]) g.add(auroraArc(a0, span, false), auroraArc(a0, span, true));
  return g;
}

export class Life {
  constructor(scene, particles) {
    this.scene = scene;
    this.particles = particles;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.on = new Set();
    this.puffins = [];
    this.light = null;
    this.boats = [];
    this.whale = null;
    this.whaleT = 0;
    this.seals = [];
    this.harbour = null;
    this.ferry = null;
    this.aurora = null;
    this.ctx = null;
  }

  reset() {
    for (const c of [...this.root.children]) this.root.remove(c);
    this.on.clear();
    this.puffins = []; this.light = null; this.boats = []; this.whale = null;
    this.seals = []; this.harbour = null; this.ferry = null; this.aurora = null;
  }

  // ctx: { cells: Map key -> { q, r, top }, center: Vector3, radius }
  refresh(ctx) {
    this.ctx = ctx;
    if (this.on.has('puffins')) this.placePuffins();
    if (this.seals.length) this.placeSeals();
    if (this.harbour) this.placeHarbour();
  }

  enable(event, ctx) {
    if (ctx) this.ctx = ctx;
    if (this.on.has(event) || !this.ctx) return null;
    this.on.add(event);
    if (event === 'puffins') return this.placePuffins();
    if (event === 'lighthouse') return this.placeLighthouse();
    if (event === 'boats') {
      for (let i = 0; i < 2; i++) {
        const b = boat();
        b.userData = { phase: i * Math.PI, speed: 0.07 + i * 0.02 };
        this.root.add(b);
        this.boats.push(b);
      }
      const { center, radius } = this.ctx;
      return new THREE.Vector3(center.x + radius + 2.5, SEA_Y, center.z);
    }
    if (event === 'whales') {
      this.whale = whale();
      this.whale.visible = false;
      this.root.add(this.whale);
      this.whaleT = 2;
      return null;
    }
    if (event === 'seals') {
      for (let i = 0; i < 3; i++) { const r = sealRock(i + 1); this.root.add(r); this.seals.push(r); }
      return this.placeSeals();
    }
    if (event === 'harbour') {
      this.ferry = ferry();
      this.ferry.userData = { t: 0, yaw: null };
      this.root.add(this.ferry);
      return this.placeHarbour();
    }
    if (event === 'aurora') {
      this.aurora = aurora();
      this.root.add(this.aurora);
      const { center, radius } = this.ctx;
      return new THREE.Vector3(center.x, SEA_Y, center.z - radius - 4);
    }
    return null;
  }

  coastSpots() {
    const spots = [];
    for (const c of this.ctx.cells.values()) {
      for (let i = 0; i < 6; i++) {
        const [dq, dr] = DIRS[i];
        if (this.ctx.cells.has(key(c.q + dq, c.r + dr))) continue;
        const { x, z } = toWorld(c.q, c.r);
        const a = ((i * 60 + 30) * Math.PI) / 180;
        const e = c.coast && c.coast[i]; // the tile's own coastline, which wanders off the hex edge
        spots.push(e ? { x: x + e.x, z: z + e.z, y: e.y, a, k: c.q * 7 + c.r * 13 + i } : { x: x + Math.cos(a) * 0.74, z: z + Math.sin(a) * 0.74, y: c.top, a, k: c.q * 7 + c.r * 13 + i });
      }
    }
    return spots;
  }

  placePuffins() {
    for (const p of this.puffins) this.root.remove(p);
    this.puffins = [];
    const spots = this.coastSpots().filter((s) => ((s.k * 2654435761) >>> 0) % 3 === 0).slice(0, 26);
    for (const s of spots) {
      const n = 1 + (((s.k * 40503) >>> 0) % 2);
      for (let j = 0; j < n; j++) {
        const p = puffin();
        const off = (j - (n - 1) / 2) * 0.09;
        p.position.set(s.x - Math.sin(s.a) * off, s.y, s.z + Math.cos(s.a) * off);
        p.rotation.y = -s.a + (j ? 0.6 : -0.3);
        p.userData.phase = s.k + j;
        this.root.add(p);
        this.puffins.push(p);
      }
    }
    return spots[0] ? new THREE.Vector3(spots[0].x, spots[0].y, spots[0].z) : null;
  }

  placeLighthouse() {
    const spots = this.coastSpots();
    if (!spots.length) return null;
    const { center } = this.ctx;
    let best = spots[0], bd = -1;
    for (const s of spots) { const d = Math.hypot(s.x - center.x, s.z - center.z); if (d > bd) { bd = d; best = s; } }
    this.light = lighthouse();
    this.light.position.set(best.x - Math.cos(best.a) * 0.2, best.y, best.z - Math.sin(best.a) * 0.2);
    this.root.add(this.light);
    return this.light.position.clone();
  }

  // Three basalt skerries just offshore; they keep their bearing as the island grows.
  placeSeals() {
    const { center, radius } = this.ctx;
    this.seals.forEach((r, i) => {
      const a = 0.5 + i * 2.2;
      r.position.set(center.x + Math.cos(a) * (radius + 1.3), 0, center.z + Math.sin(a) * (radius + 1.3));
    });
    const r = this.seals[0];
    return new THREE.Vector3(r.position.x, SEA_Y + 0.3, r.position.z);
  }

  // A pier on an open headland away from the lighthouse; it moves only if the island builds over it.
  placeHarbour() {
    const spots = this.coastSpots();
    if (!spots.length) return null;
    const h = this.harbour;
    if (h && spots.some((s) => s.k === h.userData.k)) return null;
    const { center } = this.ctx;
    const lp = this.light && this.light.position;
    let best = null, bv = -Infinity;
    for (const s of spots) {
      const dx = s.x - center.x, dz = s.z - center.z, d = Math.hypot(dx, dz) || 1;
      const out = (Math.cos(s.a) * dx + Math.sin(s.a) * dz) / d; // faces away from the middle
      // and, other things equal, on the side the camera starts out facing
      const v = d + out * 3 + Math.sin(s.a) * 2 - (lp && Math.hypot(s.x - lp.x, s.z - lp.z) < 2.5 ? 10 : 0)
        - (this.seals.some((r) => Math.hypot(s.x - r.position.x, s.z - r.position.z) < 2) ? 5 : 0);
      if (v > bv) { bv = v; best = s; }
    }
    if (h) this.root.remove(h);
    this.harbour = pier(best.y);
    this.harbour.position.set(best.x, 0, best.z);
    this.harbour.rotation.y = -best.a;
    this.harbour.userData.k = best.k;
    this.harbour.userData.a = best.a;
    this.root.add(this.harbour);
    return new THREE.Vector3(best.x, best.y, best.z);
  }

  update(t, dt, night) {
    for (const p of this.puffins) {
      const u = p.userData.phase;
      p.position.y += Math.sin(t * 3 + u) * 0.0004;
      p.rotation.y += Math.sin(t * 0.7 + u * 3) * 0.004;
    }
    if (this.light) {
      const beam = this.light.userData.beam;
      beam.rotation.y = t * 0.8;
      beamMat.opacity = night * 0.16;
    }
    if (this.ctx) {
      const { center, radius } = this.ctx;
      for (const b of this.boats) {
        const u = b.userData;
        const a = u.phase + t * u.speed;
        const R = radius + 2.6 + Math.sin(t * 0.3 + u.phase) * 0.4;
        b.position.set(center.x + Math.cos(a) * R, SEA_Y + 0.05 + Math.sin(t * 1.7 + u.phase) * 0.03, center.z + Math.sin(a) * R);
        b.rotation.y = -a - Math.PI / 2;
        b.rotation.z = Math.sin(t * 1.3 + u.phase) * 0.06;
      }
      for (const r of this.seals) {
        for (const s of r.userData.seals) {
          // now and then a seal lifts its head and looks about
          const u = s.userData.phase;
          s.userData.head.rotation.z = Math.max(0, Math.sin(t * 0.45 + u) - 0.4) * 0.9;
          s.userData.head.rotation.y = Math.sin(t * 0.3 + u * 2) * 0.4;
        }
      }
      if (this.ferry && this.harbour) {
        // docks at the pier end, steams out to sea, waits, and comes back: 32 seconds a round
        const f = this.ferry, h = this.harbour, a = h.userData.a;
        const ox = Math.cos(a), oz = Math.sin(a), sx = -oz, sz = ox;
        const end = h.userData.end;
        const dock = { x: h.position.x + ox * (end - 0.45) + sx * 0.32, z: h.position.z + oz * (end - 0.45) + sz * 0.32 };
        const p = (t % 32) / 32;
        const ease = (k) => k * k * (3 - 2 * k);
        const out = p < 0.2 ? 0 : p < 0.48 ? ease((p - 0.2) / 0.28) : p < 0.62 ? 1 : p < 0.9 ? 1 - ease((p - 0.62) / 0.28) : 0;
        const D = 9;
        f.position.set(dock.x + ox * out * D, SEA_Y + 0.04 + Math.sin(t * 1.4) * 0.025, dock.z + oz * out * D);
        const goal = p >= 0.48 && p < 0.9 ? -a + Math.PI : -a;
        if (f.userData.yaw === null) f.userData.yaw = goal;
        f.userData.yaw += (goal - f.userData.yaw) * (1 - Math.exp(-dt * 0.8));
        f.rotation.y = f.userData.yaw;
        f.rotation.x = Math.sin(t * 1.1) * 0.03;
      }
      if (this.aurora) {
        this.aurora.position.set(center.x, 0, center.z);
        const R = radius + 18;
        this.aurora.scale.set(R, 1, R);
        auroraMat.uniforms.uTime.value = t;
        auroraMat.uniforms.uOpacity.value = 0.15 + night * 0.85;
      }
      if (this.whale) {
        this.whaleT -= dt;
        const w = this.whale;
        if (this.whaleT <= 0 && !w.visible) {
          const a = Math.random() * Math.PI * 2, R = radius + 6 + Math.random() * 3;
          w.position.set(center.x + Math.cos(a) * R, SEA_Y - 0.6, center.z + Math.sin(a) * R);
          w.rotation.y = -a + Math.PI / 2;
          w.userData.t = 0;
          w.visible = true;
          this.particles.spout(w.position.x, SEA_Y + 0.2, w.position.z);
        }
        if (w.visible) {
          w.userData.t += dt;
          const k = w.userData.t / 6; // six seconds up and under
          w.position.y = SEA_Y - 0.6 + Math.sin(Math.min(1, k) * Math.PI) * 0.75;
          w.userData.tail.rotation.z = Math.max(0, k - 0.6) * 2.2;
          if (k >= 1) { w.visible = false; this.whaleT = 9 + Math.random() * 8; }
        }
      }
    }
  }
}
