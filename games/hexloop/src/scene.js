import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { K, P, hd, hexXZ, makeGrid, DIRS, easeOut, easeOutBack, clamp, lerp, damp } from './hex.js';
import * as TX from './textures.js';
import { Particles, Tweens } from './fx.js';

export const COL = {
  cyan: new THREE.Color('#3de8ff'), danger: new THREE.Color('#ff3d6e'), amber: new THREE.Color('#ffb547'),
  heal: new THREE.Color('#5dffa0'), purple: new THREE.Color('#b07cff'), white: new THREE.Color('#ffffff'),
};
const TOP = 0.28;      // tile top height
const TILE_R = 0.93;   // tile radius (unit hex = 1)
const ELEV = THREE.MathUtils.degToRad(57);

function hexShape(rad, hole = 0) {
  const s = new THREE.Shape();
  for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (90 + 60 * i); const x = rad * Math.cos(a), y = rad * Math.sin(a); i ? s.lineTo(x, y) : s.moveTo(x, y); }
  s.closePath();
  if (hole) { const h = new THREE.Path(); for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (90 - 60 * i); const x = hole * Math.cos(a), y = hole * Math.sin(a); i ? h.lineTo(x, y) : h.moveTo(x, y); } h.closePath(); s.holes.push(h); }
  return s;
}
const flat = (g) => { g.rotateX(-Math.PI / 2); return g; };
const wpos = (q, r, y = 0) => { const [x, z] = hexXZ(q, r); return new THREE.Vector3(x, y, z); };

export class Board {
  constructor(host, { low = false } = {}) {
    this.host = host; this.low = low;
    const renderer = (this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' }));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !low; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    const scene = (this.scene = new THREE.Scene());
    scene.background = new THREE.Color('#07090f');
    scene.fog = new THREE.Fog('#07090f', 18, 40);
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    this.camTarget = new THREE.Vector3(); this.camDist = 20; this.camDistGoal = 20; this.camAz = 0; this.fovKick = 0;
    this.margins = { top: 80, bottom: 120 };

    scene.add(new THREE.HemisphereLight(0x9fc0ff, 0x0b0e18, 1.1));
    const sun = (this.sun = new THREE.DirectionalLight(0xdfe8ff, 1.5));
    sun.position.set(-5, 12, 7); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 });
    sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x6a4cff, 0.5); rim.position.set(6, 4, -8); scene.add(rim);

    // composer with MSAA target
    const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: low ? 0 : 4 });
    this.composer = new EffectComposer(renderer, rt);
    this.composer.addPass(new RenderPass(scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.85, 0.55, 0.82);
    this.bloomBase = 0.85; this.bloomKick = 0;
    if (!low) this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    // shared assets
    this.tex = { tile: TX.tileTexture(), emis: TX.tileEmissive(), stripe: TX.stripeTexture(), glow: TX.glowTexture(), floor: TX.floorTexture() };
    for (const t of [this.tex.tile, this.tex.emis]) { t.repeat.set(0.5, 0.5); t.offset.set(0.5, 0.5); }
    this.tex.stripe.repeat.set(1.6, 1.6);
    this.geo = this.makeGeometries();
    this.mat = this.makeMaterials();

    const floor = (this.floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), new THREE.MeshBasicMaterial({ map: this.tex.floor, transparent: true, depthWrite: false })));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.9; scene.add(floor);
    this.dust = this.makeDust(); scene.add(this.dust);
    this.theme = { tile: new THREE.Color('#ffffff'), idle: new THREE.Color(0.02, 0.035, 0.07) };

    this.root = new THREE.Group(); scene.add(this.root);
    this.particles = new Particles(this.root, low ? 600 : 1400);
    this.tweens = new Tweens();
    this.tiles = new Map(); this.walls = []; this.ents = new Map(); this.picks = new Map(); this.warns = new Map(); this.arrows = new Map();
    this.ribbon = new THREE.Group(); this.root.add(this.ribbon);
    this.ribbonMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
    this.ribbonFlash = 0;
    this.player = this.makePlayer(); this.root.add(this.player.g);
    this.raycaster = new THREE.Raycaster();
    this.gameTime = 0; this.timeScale = 1; this.freezeUntil = 0; this.slowUntil = 0; this.realTime = 0;
    this.shake = 0; this.attract = true; this.rad = 4; this.view = null; this.run = null;
    this.resize();
  }

  // ------------------------------------------------------------ assets
  makeGeometries() {
    const bt = 0.035;
    const tile = new THREE.ExtrudeGeometry(hexShape(TILE_R - bt), { depth: TOP - 2 * bt, bevelEnabled: true, bevelThickness: bt, bevelSize: bt, bevelSegments: 2, curveSegments: 1 });
    flat(tile); tile.translate(0, bt, 0);
    const pillar = new THREE.CylinderGeometry(0.7, 0.84, 1.5, 6); pillar.translate(0, 0.75, 0);
    const cap = flat(new THREE.ShapeGeometry(hexShape(0.72, 0.6)));
    const capFill = flat(new THREE.ShapeGeometry(hexShape(0.6)));
    const ring = flat(new THREE.ShapeGeometry(hexShape(0.86, 0.74)));
    const ringThin = flat(new THREE.ShapeGeometry(hexShape(0.88, 0.82)));
    const disc = flat(new THREE.ShapeGeometry(hexShape(0.86)));
    const arrowShape = new THREE.Shape(); arrowShape.moveTo(0.42, 0); arrowShape.lineTo(0.05, 0.26); arrowShape.lineTo(0.05, 0.1); arrowShape.lineTo(-0.36, 0.1); arrowShape.lineTo(-0.36, -0.1); arrowShape.lineTo(0.05, -0.1); arrowShape.lineTo(0.05, -0.26); arrowShape.closePath();
    const arrow = flat(new THREE.ShapeGeometry(arrowShape));
    const heart = new THREE.Shape(); heart.moveTo(0, -0.14); heart.bezierCurveTo(-0.22, 0.02, -0.14, 0.2, 0, 0.09); heart.bezierCurveTo(0.14, 0.2, 0.22, 0.02, 0, -0.14);
    const heartG = new THREE.ExtrudeGeometry(heart, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }); heartG.center();
    const bush = new THREE.IcosahedronGeometry(0.16, 0);
    return { tile, pillar, cap, capFill, bush, ring, ringThin, disc, arrow, heart: heartG,
      shard: (() => { const g = new THREE.OctahedronGeometry(0.15); g.scale(0.8, 1.5, 0.8); return g; })(),
      beam: (() => { const g = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true); g.rotateZ(Math.PI / 2); g.translate(0.5, 0, 0); return g; })(),
      column: new THREE.CylinderGeometry(0.42, 0.42, 4, 6, 1, true) };
  }
  makeMaterials() {
    const basic = (c, o = 1, add = false) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, toneMapped: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
    const m = {
      side: new THREE.MeshStandardMaterial({ color: '#0b0e16', roughness: 0.7, metalness: 0.3 }),
      pillar: new THREE.MeshStandardMaterial({ color: '#56618f', roughness: 0.5, metalness: 0.2, flatShading: true, emissive: '#151a36', emissiveIntensity: 1 }),
      capFill: new THREE.MeshStandardMaterial({ color: '#1b2140', emissive: '#4e5cff', emissiveIntensity: 0.35, roughness: 0.4 }),
      cap: basic(new THREE.Color('#5d6dff').multiplyScalar(1.2), 0.75, true),
      haz: new THREE.MeshBasicMaterial({ color: COL.danger.clone().multiplyScalar(1.1), alphaMap: this.tex.stripe, transparent: true, opacity: 0.32, depthWrite: false, toneMapped: false }),
      haz2: new THREE.MeshBasicMaterial({ color: COL.danger.clone().multiplyScalar(1.8), alphaMap: this.tex.stripe, transparent: true, opacity: 0.6, depthWrite: false, toneMapped: false }),
      ringMove: basic(new THREE.Color('#b9c9f0'), 0.3),
      ringPress: basic(new THREE.Color('#d8f6ff').multiplyScalar(0.8), 0.8),
      ringDanger: basic(COL.danger.clone().multiplyScalar(1.5), 0.9),
      ringLive: basic(COL.amber.clone().multiplyScalar(1.8), 1),
      ringGhost: basic(COL.amber.clone().multiplyScalar(1.3), 0.5),
      arrow: basic(COL.danger.clone().multiplyScalar(2.2), 0.95),
      bush: new THREE.MeshStandardMaterial({ color: '#2f8f4e', roughness: 0.8, flatShading: true, emissive: '#0c3a1c', emissiveIntensity: 0.6 }),
      warn: basic(COL.danger.clone().multiplyScalar(1.6), 0.8),
      column: basic(COL.danger.clone().multiplyScalar(0.8), 0.12, true),
      shock: basic(COL.amber.clone().multiplyScalar(2), 0.9, true),
      beam: basic(COL.danger.clone().multiplyScalar(3), 0.9, true),
      sight: basic(COL.danger.clone().multiplyScalar(2), 0.35, true),
    };
    m.haz.alphaMap.wrapS = m.haz.alphaMap.wrapT = THREE.RepeatWrapping;
    return m;
  }
  setTheme(i) {
    const T = [
      { bg: '#07090f', tile: '#ffffff', idle: [0.02, 0.035, 0.07], floor: '#ffffff', pillar: '#56618f', cap: '#5d6dff', capFill: '#4e5cff', dust: '#5f86d8' },
      { bg: '#0d0605', tile: '#f0d2c6', idle: [0.06, 0.02, 0.01], floor: '#ff8a5a', pillar: '#6a5650', cap: '#c9b8b0', capFill: '#3a2420', dust: '#ff8a4a' },
      { bg: '#040b08', tile: '#cfe8d8', idle: [0.01, 0.05, 0.03], floor: '#6dffb0', pillar: '#30503e', cap: '#5dffa0', capFill: '#3ddc84', dust: '#8dffc0' },
    ][i];
    this.theme = { tile: new THREE.Color(T.tile), idle: new THREE.Color(...T.idle) };
    this.scene.background.set(T.bg); this.scene.fog.color.set(T.bg);
    this.floor.material.color.set(T.floor);
    this.mat.pillar.color.set(T.pillar); this.mat.cap.color.set(T.cap).multiplyScalar(1.2); this.mat.capFill.emissive.set(T.capFill);
    this.dust.material.color.set(T.dust);
  }
  makeDust() {
    const n = this.low ? 120 : 260, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 30; pos[i * 3 + 1] = -0.5 + Math.random() * 6; pos[i * 3 + 2] = (Math.random() - 0.5) * 30; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size: 0.08, map: this.tex.glow, color: '#5f86d8', transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  }
  emissiveMat(color, intensity = 1.6, base = null) {
    const c = base ? new THREE.Color(base) : color.clone().multiplyScalar(0.55);
    return new THREE.MeshStandardMaterial({ color: c, emissive: color, emissiveIntensity: intensity * 0.45, roughness: 0.3, metalness: 0.25 });
  }
  makePlayer() {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 1), new THREE.MeshStandardMaterial({ color: '#c8fbff', emissive: COL.cyan, emissiveIntensity: 1.25, roughness: 0.2, flatShading: true }));
    core.castShadow = true;
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.9, 2), toneMapped: false }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex.glow, color: COL.cyan, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.set(1.25, 1.25, 1);
    const light = new THREE.PointLight(COL.cyan, 3, 4, 2); light.position.y = 0.25;
    const orbit = new THREE.Group();
    for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 3, 3.2), toneMapped: false })); s.position.set(Math.cos(i * 2.09) * 0.38, 0, Math.sin(i * 2.09) * 0.38); orbit.add(s); }
    g.add(core, inner, halo, light, orbit);
    return { g, core, inner, halo, light, orbit, q: 0, r: 0, hop: null, hurt: 0 };
  }
  makeEnemy(e) {
    const g = new THREE.Group(), B = new THREE.Group(), parts = {};
    const mag = this.emissiveMat(COL.danger, 1.7), dark = new THREE.MeshStandardMaterial({ color: '#1a1d2b', roughness: 0.35, metalness: 0.8 });
    parts.mats = [mag];
    if (e.type === 'drone') {
      const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), mag); body.castShadow = true;
      const spikes = new THREE.Group();
      for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.2, 5), dark); const a = i * Math.PI / 3; c.position.set(Math.cos(a) * 0.24, 0, Math.sin(a) * 0.24); c.rotation.z = -Math.PI / 2; c.rotation.y = -a; spikes.add(c); }
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.5, 1.5), toneMapped: false })); eye.scale.setScalar(0.75); eye.position.set(0.21, 0.03, 0);
      const pivot = new THREE.Group(); pivot.add(body, spikes, eye);
      pivot.scale.setScalar(1.65); B.add(pivot); Object.assign(parts, { body, spikes, eye, pivot, baseY: 0.5 });
    } else if (e.type === 'brute') {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.34, 6), dark); base.position.y = 0.17; base.castShadow = true;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.07, 6), mag); band.position.y = 0.2;
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mag); dome.position.y = 0.34;
      const spikes = new THREE.Group();
      for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 5), mag); const a = i * Math.PI / 3 + Math.PI / 6; c.position.set(Math.cos(a) * 0.48, 0.2, Math.sin(a) * 0.48); c.rotation.z = -Math.PI / 2; c.rotation.y = -a; spikes.add(c); }
      const pips = new THREE.Group(); pips.position.y = 0.85;
      B.add(base, band, dome, spikes, pips); Object.assign(parts, { spikes, dome, pips, baseY: TOP });
    } else if (e.type === 'lancer') {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.14, 6), dark); base.position.y = 0.07; base.castShadow = true;
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.85, 6), mag); spire.position.y = 0.55; spire.castShadow = true;
      const fins = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 3), mag); fins.position.y = 0.3;
      const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.11), mag); tip.position.y = 1.05;
      const sight = new THREE.Mesh(this.geo.beam, this.mat.sight.clone()); sight.position.y = 1.3; sight.visible = false;
      B.add(base, spire, fins, tip); g.add(sight); Object.assign(parts, { tip, sight, fins, baseY: TOP });
    } else if (e.type === 'eater') {
      const pm = this.emissiveMat(COL.purple, 1.4, '#1c1030'); parts.mats = [pm];
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), pm);
      const bot = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), pm);
      top.castShadow = true;
      const eyeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3), toneMapped: false });
      const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), eyeM), e2 = e1.clone(); e1.position.set(0.16, 0.16, 0.09); e2.position.set(0.16, 0.16, -0.09); top.add(e1, e2);
      const jaw = new THREE.Group(); jaw.add(top);
      const pivot = new THREE.Group(); pivot.add(jaw, bot);
      B.add(pivot); Object.assign(parts, { jaw, pivot, baseY: 0.55 });
    } else if (e.type === 'hive') {
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.56, 0.62, 6), this.emissiveMat(COL.danger, 1.2, '#2a0b16')); core.position.y = 0.31; core.castShadow = true;
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.4, 0.3, 6), mag); crown.position.y = 0.76;
      const cells = new THREE.Group();
      for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.22, 6), mag); c.userData.a = i * Math.PI / 3; cells.add(c); }
      const pips = new THREE.Group(); pips.position.y = 1.35;
      B.add(core, crown, cells, pips); Object.assign(parts, { cells, pips, crown, baseY: TOP });
      parts.mats.push(core.material);
    } else if (e.type === 'mite') {
      const pm = this.emissiveMat(new THREE.Color('#ff7aa8'), 1.6); parts.mats = [pm];
      const body = new THREE.Mesh(new THREE.TetrahedronGeometry(0.17), pm); body.castShadow = true;
      const pivot = new THREE.Group(); pivot.add(body); B.add(pivot); Object.assign(parts, { body, pivot, baseY: 0.32 });
    } else if (e.type === 'splitter') {
      const top = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.26, 6), mag), bot = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.26, 6), mag);
      top.position.y = 0.17; bot.rotation.x = Math.PI; bot.position.y = -0.17; top.castShadow = true;
      const seam = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.2, 1.6), toneMapped: false })); seam.rotation.x = Math.PI / 2;
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.5, 1.5), toneMapped: false })); eye.position.set(0.2, 0, 0);
      const pivot = new THREE.Group(); pivot.add(top, bot, seam, eye); pivot.scale.setScalar(1.3);
      B.add(pivot); Object.assign(parts, { top, bot, seam, pivot, baseY: 0.5 });
    } else if (e.type === 'bomber') {
      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), new THREE.MeshStandardMaterial({ color: '#2a1420', roughness: 0.35, metalness: 0.6 })); shell.position.y = 0.32; shell.castShadow = true;
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 24), mag); band.rotation.x = Math.PI / 2; band.position.y = 0.32;
      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 6), new THREE.MeshStandardMaterial({ color: '#555' })); fuse.position.y = 0.68;
      const spark = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex.glow, color: new THREE.Color('#ffb547'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); spark.position.y = 0.8; spark.scale.setScalar(0.35);
      const pips = new THREE.Group(); pips.position.y = 1.0;
      B.add(shell, band, fuse, spark, pips); Object.assign(parts, { shell, band, spark, pips, baseY: TOP });
    } else if (e.type === 'warden') {
      const wm = this.emissiveMat(new THREE.Color('#c06bff'), 1.5); parts.mats = [wm];
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), wm); crystal.scale.set(0.8, 1.7, 0.8); crystal.position.y = 0.95; crystal.castShadow = true;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.18, 6), new THREE.MeshStandardMaterial({ color: '#1d1430', roughness: 0.3, metalness: 0.8 })); base.position.y = 0.09;
      const rings = new THREE.Group();
      for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62 - i * 0.14, 0.03, 6, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1, 2.6), toneMapped: false })); ring.position.y = 0.7 + i * 0.5; ring.userData.i = i; rings.add(ring); }
      const pips = new THREE.Group(); pips.position.y = 1.95;
      B.add(base, crystal, rings, pips); Object.assign(parts, { crystal, rings, pips, baseY: TOP });
    } else if (e.type === 'colossus') {
      const stone = new THREE.MeshStandardMaterial({ color: '#7d6a8a', roughness: 0.55, metalness: 0.25, flatShading: true, emissive: '#3a1028', emissiveIntensity: 0.8 });
      const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.3, 6), stone); legs.position.y = 0.15; legs.castShadow = true;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.6), stone); body.position.y = 0.6; body.castShadow = true;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.3, 0.36), stone); head.position.y = 1.05;
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), mag); core.position.set(0.31, 0.62, 0);
      const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.24), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1, 1.4), toneMapped: false })); eyes.position.set(0.19, 1.08, 0);
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.22), stone), armR = armL.clone(); armL.position.set(0, 0.55, 0.45); armR.position.set(0, 0.55, -0.45);
      const pivot = new THREE.Group(); pivot.add(body, head, core, eyes, armL, armR);
      const pips = new THREE.Group(); pips.position.y = 1.55;
      B.add(legs, pivot, pips); Object.assign(parts, { pivot, armL, armR, core, pips, baseY: TOP });
    }
    const zzz = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.textTexture('z z', { color: '#c9d4ff' }), transparent: true, depthWrite: false }));
    zzz.scale.set(1.0, 0.5, 1); zzz.position.y = 1.1; zzz.visible = false; g.add(zzz); parts.zzz = zzz;
    B.scale.setScalar(e.type === 'hive' ? 1.15 : e.type === 'colossus' ? 1.2 : e.type === 'warden' ? 1.1 : 1.3); g.add(B);
    return { g, parts, type: e.type, q: e.q, r: e.r, move: null, dying: false, spin: Math.random() * 6, face: 0, hp: e.hp };
  }

  // ------------------------------------------------------------ level build
  setLevel(run, { intro = true } = {}) {
    this.attract = false;
    for (const t of this.tiles.values()) { this.root.remove(t.g); t.top.dispose(); }
    for (const w of this.walls) this.root.remove(w);
    for (const e of this.ents.values()) this.root.remove(e.g);
    for (const p of this.picks.values()) this.root.remove(p.g);
    for (const w of this.warns.values()) this.root.remove(w.g);
    for (const a of this.arrows.values()) this.root.remove(a);
    this.tiles.clear(); this.walls = []; this.ents.clear(); this.picks.clear(); this.warns.clear(); this.arrows.clear();
    this.rad = run.rad;
    this.setTheme(run.mode === 'tutorial' || !run.sector ? 0 : Math.floor((run.sector - 1) / 3) % 3);
    const grid = makeGrid(run.rad), walls = new Set(run.walls), lava = new Set(run.lava || []), hedge = new Set(run.hedge || []);
    for (const k of grid.keys) {
      const [q, r] = P(k), g = new THREE.Group(); g.position.copy(wpos(q, r));
      if (walls.has(k)) {
        const p = new THREE.Mesh(this.geo.pillar, this.mat.pillar); p.castShadow = p.receiveShadow = true;
        const cap = new THREE.Mesh(this.geo.cap, this.mat.cap); cap.position.y = 1.505;
        const capF = new THREE.Mesh(this.geo.capFill, this.mat.capFill); capF.position.y = 1.503;
        g.add(p, cap, capF); g.userData = { k, wall: true }; this.walls.push(g); this.root.add(g);
        if (intro) { g.position.y = 6; this.tweens.add(0.55, (t) => { g.position.y = 6 * (1 - easeOut(t)); }, { delay: 0.25 + hd(q, r, 0, 0) * 0.05, done: () => this.shake = Math.max(this.shake, 0.08) }); }
        continue;
      }
      const top = new THREE.MeshStandardMaterial({ map: this.tex.tile, emissiveMap: this.tex.emis, emissive: new THREE.Color(0, 0, 0), roughness: 0.5, metalness: 0.35 });
      const mesh = new THREE.Mesh(this.geo.tile, [top, this.mat.side]); mesh.receiveShadow = true; mesh.userData = { k };
      const haz = new THREE.Mesh(this.geo.disc, this.mat.haz); haz.position.y = TOP + 0.004; haz.visible = false;
      const ring = new THREE.Mesh(this.geo.ring, this.mat.ringMove); ring.position.y = TOP + 0.008; ring.visible = false;
      g.add(mesh, haz, ring);
      const t = { k, q, r, g, mesh, top, haz, ring, lift: 0, liftV: 0, emis: new THREE.Color(), emisGoal: new THREE.Color(), pulse: 0, intro: 0 };
      top.color.copy(this.theme.tile);
      if (lava.has(k)) { t.lava = true; top.color.set('#3a1206'); mesh.scale.y = 0.75; }
      if (hedge.has(k)) {
        t.hedge = true; top.color.set('#1d3a26');
        for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(this.geo.bush, this.mat.bush); const a = i * 1.7 + q; b.position.set(Math.cos(a) * 0.38, TOP + 0.12, Math.sin(a) * 0.38); b.scale.setScalar(0.8 + (i % 2) * 0.35); b.castShadow = true; g.add(b); }
      }
      this.tiles.set(k, t); this.root.add(g);
      if (intro) { t.intro = -1; const d = hd(q, r, 0, 0); this.tweens.add(0.6, (k2) => { t.intro = -1 + easeOutBack(k2); }, { delay: d * 0.06 + Math.random() * 0.04 }); }
    }
    this.player.q = run.player[0]; this.player.r = run.player[1]; this.player.hop = null;
    this.player.g.position.copy(wpos(run.player[0], run.player[1], TOP));
    this.player.g.scale.setScalar(intro ? 0.01 : 1);
    if (intro) this.tweens.add(0.5, (k2) => this.player.g.scale.setScalar(Math.max(0.01, easeOutBack(k2))), { delay: 0.45 });
    this.frame();
    this.sync(run, this.view);
    try { this.renderer.compile(this.scene, this.camera); } catch (_) {} // warm shaders up front: no first-frame hitch
  }

  // ------------------------------------------------------------ state → visuals
  sync(run, view, { snap = false } = {}) {
    this.run = run; this.view = view; this.ribbonRun = null;
    if (!run) return;
    const tailIdx = new Map(run.tail.map((k, i) => [k, i])), L = view && view.tailLen || 8;
    const threat = view ? view.threat : new Map();
    const legal = view ? view.legal : new Map();
    const inside = view && view.preview ? new Set(view.preview.inside) : null;
    const ghost = run.ghost ? new Set(run.ghost) : view && view.suggest ? new Set(view.suggest) : null;
    for (const t of this.tiles.values()) {
      const ti = tailIdx.get(t.k), n = threat.get(t.k), lm = legal.get(t.k);
      t.flicker = false;
      if (inside && inside.has(t.k)) { t.emisGoal.copy(COL.amber).multiplyScalar(1.3); t.pulse = 1; }
      else if (ti !== undefined) {
        const age = run.tail.length - 1 - ti, f = 1 - age / Math.max(L, 1);
        t.emisGoal.copy(COL.cyan).multiplyScalar(0.25 + 0.9 * f); t.pulse = 0;
        t.flicker = ti === 0 && run.tail.length >= L;
      } else if (n) { t.emisGoal.copy(COL.danger).multiplyScalar(n.length > 1 ? 0.55 : 0.3); t.pulse = 0; }
      else if (t.lava) { t.emisGoal.setRGB(1.6, 0.45, 0.08); t.pulse = 0; }
      else { t.emisGoal.copy(this.theme.idle); t.pulse = 0; }
      if (t.lava && ti === undefined && !(inside && inside.has(t.k))) t.emisGoal.setRGB(1.6, 0.45, 0.08);
      if (snap) t.emis.copy(t.emisGoal);
      t.haz.visible = !!n && ti === undefined && !(t.lava && n.every((x) => x.type === 'lava'));
      if (n) t.haz.material = n.length > 1 ? this.mat.haz2 : this.mat.haz;
      // move rings (drawn path first)
      const onPath = view && view.pathSet && view.pathSet.has(t.k);
      if (onPath) {
        t.ring.visible = true;
        const closes = view.preview && view.preview.live && view.path[view.preview.step] === t.k;
        t.ring.material = closes ? this.mat.ringLive : n ? this.mat.ringDanger : this.mat.ringPress;
      } else if (lm && view.pathSet) { t.ring.visible = true; t.ring.material = this.mat.ringMove; }
      else if (lm) {
        t.ring.visible = true;
        t.ring.material = lm.live ? this.mat.ringLive : lm.danger ? this.mat.ringDanger : view.pressed === t.k ? this.mat.ringPress : this.mat.ringMove;
      } else if (ghost && ghost.has(t.k) && ti === undefined) { t.ring.visible = true; t.ring.material = this.mat.ringGhost; }
      else t.ring.visible = false;
      t.legal = !!lm; t.pressed = view && view.pressed === t.k;
    }
    this.buildRibbon(run);
    this.buildPath(view);
    // enemies
    const alive = new Set();
    for (const e of run.enemies) {
      alive.add(e.id);
      let ent = this.ents.get(e.id);
      if (!ent) {
        ent = this.makeEnemy(e); this.ents.set(e.id, ent); this.root.add(ent.g);
        ent.g.position.copy(wpos(e.q, e.r, ent.parts.baseY));
        ent.g.scale.setScalar(0.01); this.tweens.add(0.45, (k) => ent.g.scale.setScalar(Math.max(0.01, easeOutBack(k))), { delay: snap ? 0 : 0.1 });
      }
      if (snap || !ent.move) { ent.q = e.q; ent.r = e.r; const p = wpos(e.q, e.r, ent.parts.baseY); ent.g.position.x = p.x; ent.g.position.z = p.z; ent.move = null; }
      ent.data = e;
    }
    for (const [id, ent] of this.ents) if (!alive.has(id) && !ent.dying) this.removeEnt(id, 'fade');
    // drone arrows
    const want = new Set();
    for (const e of run.enemies) if (['drone', 'brute', 'splitter', 'colossus'].includes(e.type) && e.tg && !e.sleep) {
      want.add(e.id);
      let a = this.arrows.get(e.id);
      if (!a) { a = new THREE.Mesh(this.geo.arrow, this.mat.arrow); this.arrows.set(e.id, a); this.root.add(a); }
      const [tq, tr] = P(e.tg), to = wpos(tq, tr), fr = wpos(e.q, e.r);
      a.position.set(to.x, TOP + 0.02, to.z); a.rotation.y = -Math.atan2(to.z - fr.z, to.x - fr.x); a.userData.k = e.tg;
    }
    for (const [id, a] of this.arrows) if (!want.has(id)) { this.root.remove(a); this.arrows.delete(id); }
    // pickups
    const pk = new Set(Object.keys(run.pickups));
    for (const k of pk) if (!this.picks.has(k)) {
      const type = run.pickups[k], [q, r] = P(k), g = new THREE.Group();
      if (type === 'shrine') {
        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.32, 6), new THREE.MeshStandardMaterial({ color: '#3a2d52', roughness: 0.3, metalness: 0.7 })); ped.position.y = -0.25;
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.17), this.emissiveMat(new THREE.Color('#c08bff'), 4, '#4a2a7a')); gem.position.y = 0.12;
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 6, 28), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.6), toneMapped: false })); halo.rotation.x = Math.PI / 2; halo.position.y = 0.12;
        g.add(ped, gem, halo); g.position.copy(wpos(q, r, TOP + 0.4)); this.root.add(g);
        this.picks.set(k, { g, m: gem, type, ph: Math.random() * 6, halo }); continue;
      }
      const mat = type === 'shard' ? this.emissiveMat(COL.amber, 4, '#6a4410') : this.emissiveMat(COL.heal, 3.5, '#145a34');
      const m = new THREE.Mesh(type === 'shard' ? this.geo.shard : this.geo.heart, mat); m.castShadow = true;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex.glow, color: type === 'shard' ? COL.amber : COL.heal, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.scale.set(0.9, 0.9, 1);
      g.add(m, glow); g.position.copy(wpos(q, r, TOP + 0.4)); this.root.add(g);
      this.picks.set(k, { g, m, type, ph: Math.random() * 6 });
    }
    for (const [k, p] of this.picks) if (!pk.has(k)) { this.root.remove(p.g); this.picks.delete(k); }
    // spawn warnings
    const wk = new Set(run.spawns.map((s) => K(s.q, s.r)));
    for (const s of run.spawns) { const k = K(s.q, s.r); if (!this.warns.has(k)) {
      const g = new THREE.Group(), ring = new THREE.Mesh(this.geo.ring, this.mat.warn), col = new THREE.Mesh(this.geo.column, this.mat.column);
      ring.position.y = TOP + 0.02; col.position.y = 2; g.add(ring, col); g.position.copy(wpos(s.q, s.r)); this.root.add(g); this.warns.set(k, { g, ring, col });
    } }
    for (const [k, w] of this.warns) if (!wk.has(k)) { this.root.remove(w.g); this.warns.delete(k); }
  }
  buildRibbon(run, flash = 0) {
    for (const m of this.ribbon.children) m.geometry.dispose();
    this.ribbon.clear();
    const pts = run.tail.slice(); pts.push(K(run.player[0], run.player[1]));
    const total = pts.length;
    if (total < 2) return;
    // split into chains of adjacent hexes
    const chains = []; let cur = [0];
    for (let i = 1; i < pts.length; i++) { const [a, b] = [P(pts[i - 1]), P(pts[i])]; if (hd(a[0], a[1], b[0], b[1]) === 1) cur.push(i); else { chains.push(cur); cur = [i]; } }
    chains.push(cur);
    const hp = this.player.g.position;
    for (const ch of chains) {
      if (ch.length < 2) continue;
      const vs = ch.map((i) => { if (i === total - 1) return new THREE.Vector3(hp.x, TOP + 0.2, hp.z); const [q, r] = P(pts[i]); return wpos(q, r, TOP + 0.2); });
      const curve = new THREE.CatmullRomCurve3(vs, false, 'centripetal');
      const segs = (ch.length - 1) * 10, rad = 7;
      const geo = new THREE.TubeGeometry(curve, segs, 0.1, rad, false);
      const cols = new Float32Array(geo.attributes.position.count * 3), c = new THREE.Color();
      for (let i = 0; i <= segs; i++) {
        const u = (ch[0] + (i / segs) * (ch.length - 1)) / (total - 1);
        const b = 0.6 + 2.2 * u * u;
        c.copy(COL.cyan).lerp(COL.white, Math.max(0, (u - 0.85) / 0.15) * 0.6).multiplyScalar(b);
        for (let j = 0; j <= rad; j++) { const idx = (i * (rad + 1) + j) * 3; cols[idx] = c.r; cols[idx + 1] = c.g; cols[idx + 2] = c.b; }
      }
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      this.ribbon.add(new THREE.Mesh(geo, this.ribbonMat));
    }
  }
  buildPath(view) {
    if (!this.pathG) { this.pathG = new THREE.Group(); this.root.add(this.pathG); this.dotGeo = new THREE.SphereGeometry(0.09, 10, 8); this.dotMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.8, 2), toneMapped: false }); }
    this.pathG.clear();
    const path = view && view.path || [];
    if (!path.length) return;
    const pts = [K(this.player.q, this.player.r), ...path];
    for (let i = 1; i < pts.length; i++) {
      const [aq, ar] = P(pts[i - 1]), [bq, br] = P(pts[i]), a = wpos(aq, ar, TOP + 0.12), b = wpos(bq, br, TOP + 0.12);
      for (const f of [0.5, 1]) { const d = new THREE.Mesh(this.dotGeo, this.dotMat); d.position.lerpVectors(a, b, f); if (f === 0.5) d.scale.setScalar(0.6); this.pathG.add(d); }
    }
  }
  updatePips(pr, hp, T, color = null) {
    if (pr.pips.children.length !== hp) {
      pr.pips.clear();
      const c = color ? new THREE.Color(color).multiplyScalar(2.2) : COL.danger.clone().multiplyScalar(2.4);
      for (let i = 0; i < hp; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); s.position.x = (i - (hp - 1) / 2) * 0.22; pr.pips.add(s); }
    }
    pr.pips.children.forEach((s, i) => { s.rotation.y = T * 2 + i; s.position.y = Math.sin(T * 3 + i) * 0.03; });
  }
  removeEnt(id, how, center) {
    const ent = this.ents.get(id); if (!ent || ent.dying) return;
    ent.dying = true; ent.move = null;
    const g = ent.g, start = g.position.clone(), col = ent.type === 'eater' ? COL.purple : COL.danger;
    const end = () => { this.root.remove(g); this.ents.delete(id); };
    if (how === 'implode') {
      const c = center || start;
      this.tweens.add(0.32, (k) => { const s = k < 0.35 ? 1 + k : 1.35 * (1 - (k - 0.35) / 0.65); g.scale.setScalar(Math.max(0.01, s)); g.position.lerpVectors(start, new THREE.Vector3(c.x, start.y + 0.3, c.z), easeOut(k)); g.rotation.y += 0.4; },
        { done: () => { this.particles.burst(g.position, col, 36, 4.2, 0.16, 0.9, 2.2, 7); this.particles.burst(g.position, COL.white, 14, 3, 0.1, 0.5, 2.5, 6); end(); } });
    } else if (how === 'burst') {
      this.particles.burst(start, col, 28, 3.6, 0.14, 0.8, 2, 7); this.shockwave(start, col, 1.2); end();
    } else this.tweens.add(0.25, (k) => g.scale.setScalar(Math.max(0.01, 1 - k)), { done: end });
  }
  shockwave(p, color = COL.amber, size = 2) {
    const m = new THREE.Mesh(this.geo.ringThin, this.mat.shock.clone()); m.material.color.copy(color).multiplyScalar(2.2);
    m.position.set(p.x, TOP + 0.05, p.z); this.root.add(m);
    this.tweens.add(0.55, (k) => { m.scale.setScalar(0.3 + size * easeOut(k)); m.material.opacity = 0.9 * (1 - k); }, { done: () => { this.root.remove(m); m.material.dispose(); } });
  }

  // light the tail immediately on move (full sync happens when the turn settles)
  lightTail(tail, L) {
    const idx = new Map(tail.map((k, i) => [k, i]));
    for (const t of this.tiles.values()) {
      t.ring.visible = false; t.legal = false; t.pressed = false;
      const i = idx.get(t.k);
      if (i !== undefined) { const age = tail.length - 1 - i; t.emisGoal.copy(COL.cyan).multiplyScalar(0.25 + 0.9 * (1 - age / Math.max(L, 1))); t.haz.visible = false; }
      else if (!t.haz.visible) t.emisGoal.setRGB(0, 0, 0);
    }
  }
  snapPlayer(run) { this.player.hop = null; this.player.q = run.player[0]; this.player.r = run.player[1]; this.player.g.position.copy(wpos(run.player[0], run.player[1], TOP)); this.ribbonRun = null; }

  // ------------------------------------------------------------ events
  onMove(ev) {
    const p = this.player, from = wpos(ev.from[0], ev.from[1], TOP), to = wpos(ev.to[0], ev.to[1], TOP);
    p.q = ev.to[0]; p.r = ev.to[1];
    this.ribbonRun = { tail: ev.tail, player: ev.to };
    if (ev.wait) { this.buildRibbon(this.ribbonRun); }
    if (ev.wait) { this.tweens.add(0.25, (k) => p.g.scale.set(1 + 0.25 * Math.sin(k * Math.PI), 1 - 0.2 * Math.sin(k * Math.PI), 1 + 0.25 * Math.sin(k * Math.PI))); return; }
    const dur = ev.dash ? 0.22 : 0.16, h = ev.dash ? 0.8 : 0.42;
    p.hop = { from, to, t: 0, dur, h };
    for (const k of ev.dropped || []) { const t = this.tiles.get(k); if (t) { this.particles.burst(t.g.position.clone().setY(TOP + 0.15), COL.cyan, 6, 1, 0.07, 0.4, 1, 3); } }
  }
  onLand() {
    const p = this.player;
    this.tweens.add(0.18, (k) => { const s = Math.sin(k * Math.PI); p.g.scale.set(1 + 0.3 * s, 1 - 0.32 * s, 1 + 0.3 * s); });
    const t = this.tiles.get(K(p.q, p.r)); if (t) t.liftV -= 0.9;
    this.particles.burst(p.g.position.clone().setY(TOP + 0.05), COL.cyan, 8, 1.4, 0.06, 0.35, 0.5, 2);
  }
  onCapture(ev, kills) {
    // ribbon flash → ripple lift → implode victims at the loop centre
    this.ribbonFlash = 1;
    const inside = ev.inside.map((k) => this.tiles.get(k)).filter(Boolean);
    const c = new THREE.Vector3(); for (const t of inside) c.add(t.g.position); c.divideScalar(Math.max(1, inside.length));
    const border = ev.border.map(P);
    for (const t of inside) {
      const d = Math.min(...border.map(([q, r]) => hd(q, r, t.q, t.r)), 3);
      t.emis.copy(COL.amber).multiplyScalar(3.5);
      this.tweens.add(0.6, (k) => { t.lift = Math.sin(Math.min(1, k * 1.6) * Math.PI) * 0.55 * (1 - k * 0.4); }, { delay: 0.04 + d * 0.06, done: () => { t.lift = 0; t.liftV = -1.5; } });
      this.particles.burst(t.g.position.clone().setY(TOP + 0.2), COL.amber, 6, 2, 0.1, 0.8, 3.5, 6);
    }
    for (const k of ev.border) { const t = this.tiles.get(k); if (t) { t.emis.setRGB(2, 2.4, 2.6); t.emisGoal.setRGB(0, 0, 0); } if (t) this.particles.burst(t.g.position.clone().setY(TOP + 0.25), COL.cyan, 7, 2.4, 0.09, 0.6, 2, 6); }
    for (const id of ev.victims) {
      const ent = this.ents.get(id);
      if (ent && ent.data && ent.data.hp <= 0) this.removeEnt(id, 'implode', c);
      else if (ent) this.tweens.add(0.4, (k) => ent.g.scale.setScalar(1 + 0.4 * Math.sin(k * Math.PI)));
    }
    this.shockwave(c, COL.amber, 1.5 + inside.length * 0.25);
    this.shake = Math.max(this.shake, 0.1 + 0.06 * kills);
    this.fovKick = 1.4 + kills * 0.4;
    this.bloomKick = 0.9 + kills * 0.25;
    this.ribbonRun = { tail: ev.tail, player: [this.player.q, this.player.r] };
    this.buildRibbon(this.ribbonRun);
    return c;
  }
  onKill(ev) { if (ev.id >= 0 && this.ents.has(ev.id)) this.removeEnt(ev.id, 'burst'); else this.particles.burst(wpos(ev.q, ev.r, TOP + 0.4), COL.danger, 20, 3, 0.12, 0.7); }
  onHurt() {
    this.player.hurt = 1; this.shake = Math.max(this.shake, 0.32);
    this.particles.burst(this.player.g.position, COL.danger, 26, 3.2, 0.12, 0.6, 1.4, 5);
  }
  onBlock() { this.shockwave(this.player.g.position, COL.cyan, 1.4); this.particles.burst(this.player.g.position, COL.white, 20, 3, 0.1, 0.5); }
  onBeam(ev) {
    const ent = this.ents.get(ev.id), from = wpos(ev.q, ev.r, TOP + 1.3);
    if (!ev.hs.length) return;
    const [lq, lr] = P(ev.hs[ev.hs.length - 1]), to = wpos(lq, lr, TOP + 0.3);
    const m = new THREE.Mesh(this.geo.beam, this.mat.beam.clone()); m.position.copy(from);
    const dir = to.clone().sub(from), len = dir.length();
    m.scale.set(len, 0.12, 0.12); m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.normalize());
    this.root.add(m);
    this.tweens.add(0.35, (k) => { const w = 0.14 * (1 - k) + 0.01; m.scale.y = m.scale.z = w; m.material.opacity = 1 - k; }, { done: () => { this.root.remove(m); m.material.dispose(); } });
    for (const k of ev.hs) { const t = this.tiles.get(k); if (t) { t.emis.copy(COL.danger).multiplyScalar(3); this.particles.burst(t.g.position.clone().setY(TOP + 0.2), COL.danger, 4, 1.5, 0.08, 0.4); } }
    this.shake = Math.max(this.shake, 0.12); if (ent) ent.recoil = 1;
  }
  onEnemyMove(ev) {
    const ent = this.ents.get(ev.id); if (!ent) return;
    ent.move = { from: wpos(ev.from[0], ev.from[1]), to: wpos(ev.to[0], ev.to[1]), t: 0 };
    ent.q = ev.to[0]; ent.r = ev.to[1];
    ent.face = Math.atan2(-(ent.move.to.z - ent.move.from.z), ent.move.to.x - ent.move.from.x);
  }
  onTeleport(ev) {
    const ent = this.ents.get(ev.id); const a = wpos(ev.from[0], ev.from[1], TOP + 0.6), b = wpos(ev.to[0], ev.to[1], TOP + 0.6);
    this.particles.burst(a, COL.purple, 26, 2.6, 0.12, 0.6, 2.5, 3); this.particles.burst(b, COL.purple, 26, 2.6, 0.12, 0.6, 2.5, 3);
    if (ent) { ent.move = null; ent.q = ev.to[0]; ent.r = ev.to[1]; ent.g.position.x = b.x; ent.g.position.z = b.z; ent.g.scale.setScalar(0.01); this.tweens.add(0.4, (k) => ent.g.scale.setScalar(Math.max(0.01, easeOutBack(k)))); }
    this.shockwave(b, COL.purple, 1.2);
  }
  onBlast(ev) {
    const c = wpos(ev.q, ev.r, TOP + 0.3);
    this.shockwave(c, COL.amber, 2.2); this.particles.burst(c, COL.amber, 40, 4.5, 0.14, 0.7, 1.4, 5); this.particles.burst(c, COL.danger, 20, 3, 0.12, 0.5, 1, 4);
    for (const k of ev.hs) { const t = this.tiles.get(k); if (t) { t.emis.setRGB(3, 1, 0.3); t.liftV -= 1.2; } }
    this.shake = Math.max(this.shake, 0.22);
  }
  onFreeze() { for (const ent of this.ents.values()) this.particles.burst(ent.g.position.clone().setY(TOP + 0.5), new THREE.Color('#a8e4ff'), 10, 1.6, 0.09, 0.6, 1, 1); }
  setPlayerColor(hex) { const c = new THREE.Color(hex); this.playerCol = c; }
  onSpawn(ev) { const p = wpos(ev.q, ev.r, TOP + 0.3); this.particles.burst(p, COL.danger, 22, 2.4, 0.12, 0.6, 3, 4); this.shockwave(p, COL.danger, 1); }
  onShard(k) { const [q, r] = P(k); const p = wpos(q, r, TOP + 0.4); this.particles.burst(p, COL.amber, 18, 2.4, 0.1, 0.6, 2.4, 5); }
  onHeal(k) { const [q, r] = P(k); this.particles.burst(wpos(q, r, TOP + 0.4), COL.heal, 18, 2, 0.1, 0.7, 2.6, 3); }
  onChomp(k) { const [q, r] = P(k); this.particles.burst(wpos(q, r, TOP + 0.2), COL.cyan, 10, 1.6, 0.08, 0.4); }
  celebrate() {
    for (const t of this.tiles.values()) {
      const d = hd(t.q, t.r, this.player.q, this.player.r);
      this.tweens.add(0.5, (k) => { t.lift = Math.sin(k * Math.PI) * 0.35; if (k > 0.2 && k < 0.3) t.emis.copy(COL.cyan).multiplyScalar(1.6); }, { delay: d * 0.07 });
    }
    for (let i = 0; i < 70; i++) { const a = Math.random() * 6.28, r = Math.random() * 5; this.particles.emit(Math.cos(a) * r, TOP + 0.2, Math.sin(a) * r, 0, 2 + Math.random() * 4, 0, Math.random() < 0.5 ? COL.amber : COL.cyan, 0.12, 1.4, 3, 0.8); }
  }
  hitstop(sec) { this.freezeUntil = this.realTime + sec; }
  slowmo(sec, scale = 0.35) { this.slowUntil = this.realTime + sec; this.slowScale = scale; }

  // ------------------------------------------------------------ camera
  setMargins(top, bottom) { this.margins = { top, bottom }; this.frame(); }
  frame() {
    const cam = this.camera, w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    cam.aspect = w / h; cam.updateProjectionMatrix();
    const portrait = w / h < 0.85;
    this.elev = portrait ? THREE.MathUtils.degToRad(66) : ELEV;
    this.root.rotation.y = portrait ? Math.PI / 2 : 0; // flat-top in portrait: the long axis runs down the screen
    this.root.updateMatrixWorld(true);
    // fit against the real corners of every rim tile (top and bottom faces)
    const pts = [], g = makeGrid(this.rad);
    for (const k of g.keys) {
      const [q, r] = P(k); if (hd(q, r, 0, 0) < this.rad) continue;
      const c = wpos(q, r);
      for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (90 + 60 * i); for (const y of [0, TOP + 0.2]) pts.push(this.root.localToWorld(new THREE.Vector3(c.x + Math.cos(a) * 0.95, y, c.z + Math.sin(a) * 0.95))); }
    }
    const yTop = 1 - (2 * this.margins.top) / h, yBot = -1 + (2 * this.margins.bottom) / h, xMax = 1 - 16 / w;
    const dir = new THREE.Vector3(0, Math.sin(this.elev), Math.cos(this.elev));
    let tz = 0, d = 20;
    for (let pass = 0; pass < 3; pass++) {
      let lo = 4, hi = 80;
      for (let it = 0; it < 30; it++) {
        d = (lo + hi) / 2;
        cam.position.set(0, 0, tz).addScaledVector(dir, d); cam.lookAt(0, 0, tz); cam.updateMatrixWorld();
        let fit = true;
        for (const p of pts) { const v = p.clone().project(cam); if (Math.abs(v.x) > xMax || v.y > yTop || v.y < yBot) { fit = false; break; } }
        fit ? (hi = d) : (lo = d);
      }
      d = hi;
      cam.position.set(0, 0, tz).addScaledVector(dir, d); cam.lookAt(0, 0, tz); cam.updateMatrixWorld();
      let mn = 9, mx = -9; for (const p of pts) { const v = p.clone().project(cam); mn = Math.min(mn, v.y); mx = Math.max(mx, v.y); }
      const off = ((yTop + yBot) / 2 - (mn + mx) / 2);
      tz -= off * d * 0.25;
    }
    this.camDistGoal = d; this.camTarget.set(0, 0, tz);
    if (!this.framed) { this.camDist = d; this.framed = true; }
  }
  resize() {
    const w = this.host.clientWidth || innerWidth, h = this.host.clientHeight || innerHeight;
    this.renderer.setSize(w, h); this.composer.setSize(w, h);
    this.bloom.resolution.set(w / 2, h / 2);
    this.particles.uniforms.uScale.value = h * 0.9;
    this.frame();
  }
  pick(cx, cy) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector2(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(v, this.camera);
    const meshes = []; for (const t of this.tiles.values()) meshes.push(t.mesh);
    const hit = this.raycaster.intersectObjects(meshes, false)[0];
    if (hit) return hit.object.userData.k;
    // fall back to the floor plane under the cursor so taps on enemies/rings still land
    const pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TOP), p = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(pl, p)) return null;
    this.root.worldToLocal(p);
    let best = null, bd = 0.9;
    for (const t of this.tiles.values()) { const d = Math.hypot(t.g.position.x - p.x, t.g.position.z - p.z); if (d < bd) { bd = d; best = t.k; } }
    for (const w of this.walls) { const d = Math.hypot(w.position.x - p.x, w.position.z - p.z); if (d < bd) { bd = d; best = w.userData.k; } }
    return best;
  }
  screenOf(q, r, y = TOP + 0.6) {
    const v = this.root.localToWorld(wpos(q, r, y)).project(this.camera), rect = this.renderer.domElement.getBoundingClientRect();
    return [rect.left + (v.x + 1) / 2 * rect.width, rect.top + (1 - v.y) / 2 * rect.height];
  }
  screenOfVec(p) { const v = this.root.localToWorld(p.clone()).project(this.camera), rect = this.renderer.domElement.getBoundingClientRect(); return [rect.left + (v.x + 1) / 2 * rect.width, rect.top + (1 - v.y) / 2 * rect.height]; }

  // ------------------------------------------------------------ frame
  update(realDt) {
    realDt = Math.max(0, realDt || 0);
    this.realTime += realDt;
    let scale = 1;
    if (this.realTime < this.freezeUntil) scale = 0;
    else if (this.realTime < this.slowUntil) scale = this.slowScale;
    const dt = Math.min(realDt, 0.05) * scale;
    this.timeScale = scale; this.gameTime += dt;
    const T = this.gameTime;
    this.tweens.update(dt);
    this.particles.update(dt);
    this.dust.rotation.y += realDt * 0.01;
    this.tex.stripe.offset.x = (T * 0.35) % 1;

    // camera
    this.camDist = damp(this.camDist, this.camDistGoal, 4, realDt);
    if (this.attract) this.camAz += realDt * 0.12; else this.camAz = damp(this.camAz, 0, 3, realDt);
    this.fovKick = damp(this.fovKick, 0, 6, realDt);
    this.shake = damp(this.shake, 0, 7, realDt);
    const cam = this.camera, el = (this.elev || ELEV) - (this.attract ? 0.15 : 0);
    cam.position.set(this.camTarget.x + Math.sin(this.camAz) * Math.cos(el) * this.camDist, Math.sin(el) * this.camDist, this.camTarget.z + Math.cos(this.camAz) * Math.cos(el) * this.camDist);
    cam.lookAt(this.camTarget);
    if (this.shake > 0.002) { cam.position.x += (Math.random() - 0.5) * this.shake; cam.position.y += (Math.random() - 0.5) * this.shake; }
    cam.fov = 34 - this.fovKick; cam.updateProjectionMatrix();
    this.scene.fog.near = this.camDist * 1.05; this.scene.fog.far = this.camDist * 2.2;
    this.bloomKick = damp(this.bloomKick, 0, 4, realDt);
    this.bloom.strength = this.bloomBase + this.bloomKick;

    // tiles
    for (const t of this.tiles.values()) {
      t.liftV = damp(t.liftV, 0, 10, dt);
      const hov = (t.pressed ? 0.12 : t.legal ? 0.03 : 0) + t.liftV * 0.04;
      t.g.position.y = t.lift + hov + t.intro * 4;
      t.g.visible = t.intro > -0.98;
      const goal = t.emisGoal;
      t.emis.r = damp(t.emis.r, goal.r, 9, dt); t.emis.g = damp(t.emis.g, goal.g, 9, dt); t.emis.b = damp(t.emis.b, goal.b, 9, dt);
      let mul = 1;
      if (t.pulse) mul = 0.75 + 0.45 * Math.sin(T * 9);
      if (t.flicker) mul = 0.45 + 0.55 * (Math.sin(T * 25) > 0 ? 1 : 0.3);
      if (this.attract) { const w = 0.5 + 0.5 * Math.sin(T * 1.6 - hd(t.q, t.r, 0, 0) * 0.9); t.top.emissive.copy(COL.cyan).multiplyScalar(0.06 + 0.25 * w * w * w); continue; }
      if (t.lava) { mul *= 0.8 + 0.25 * Math.sin(T * 2.2 + t.q * 1.3 + t.r); if (Math.random() < dt * 0.6) this.particles.emit(t.g.position.x + (Math.random() - 0.5) * 0.8, TOP * 0.8, t.g.position.z + (Math.random() - 0.5) * 0.8, 0, 0.8 + Math.random(), 0, COL.amber, 0.09, 0.9, -0.2, 0.5); }
      t.top.emissive.copy(t.emis).multiplyScalar(mul);
      if (t.ring.visible && t.ring.material === this.mat.ringLive) t.ring.scale.setScalar(1 + 0.04 * Math.sin(T * 10));
      else t.ring.scale.setScalar(1);
    }
    this.mat.ringGhost.opacity = 0.35 + 0.3 * Math.sin(T * 4);
    this.mat.ringLive.opacity = 0.75 + 0.25 * Math.sin(T * 10);
    this.mat.arrow.opacity = 0.7 + 0.3 * Math.sin(T * 6);

    // player
    const p = this.player;
    if (p.hop) {
      p.hop.t += dt; const k = Math.min(1, p.hop.t / p.hop.dur);
      p.g.position.lerpVectors(p.hop.from, p.hop.to, easeOut(k)); p.g.position.y = TOP + Math.sin(k * Math.PI) * p.hop.h;
      if (this.run) this.buildRibbon(this.ribbonRun || this.run);
      if (k >= 1) { p.hop = null; this.onLand(); }
    } else p.g.position.y = TOP + 0.02;
    p.core.position.y = 0.32 + Math.sin(T * 3) * 0.03; p.inner.position.y = p.core.position.y; p.halo.position.y = p.core.position.y;
    p.core.rotation.y += dt * 1.5; p.core.rotation.x += dt * 0.7;
    p.orbit.position.y = p.core.position.y; p.orbit.rotation.y += dt * 2.6;
    p.hurt = damp(p.hurt, 0, 4, realDt);
    const pc = this.playerCol || COL.cyan;
    p.core.material.emissive.copy(pc).lerp(COL.danger, p.hurt);
    p.halo.material.color.copy(pc).lerp(COL.danger, p.hurt);
    p.light.color.copy(p.core.material.emissive);

    // ribbon
    this.ribbonFlash = damp(this.ribbonFlash, 0, 5, dt);
    this.ribbonMat.color.setScalar(1 + this.ribbonFlash * 2.5);

    // enemies
    for (const ent of this.ents.values()) {
      const e = ent.data || {}, pr = ent.parts;
      if (ent.move) {
        ent.move.t += dt / 0.2; const k = Math.min(1, ent.move.t);
        ent.g.position.x = lerp(ent.move.from.x, ent.move.to.x, easeOut(k)); ent.g.position.z = lerp(ent.move.from.z, ent.move.to.z, easeOut(k));
        if (k >= 1) ent.move = null;
      }
      const sleep = !!e.sleep;
      pr.zzz.visible = sleep || (e.frozen && ent.type !== 'lancer');
      if (pr.zzz.visible) { pr.zzz.position.y = 1.1 + Math.sin(T * 2) * 0.06; pr.zzz.material.opacity = 0.6 + 0.4 * Math.sin(T * 2.2); }
      const glow = sleep ? 0.6 : 1;
      for (const m of pr.mats) m.emissiveIntensity = lerp(m.emissiveIntensity, (ent.type === 'brute' && e.cd > 0 ? 0.15 : 0.75) * glow, 0.2);
      if (ent.type === 'drone') {
        ent.g.position.y = pr.baseY + TOP + Math.sin(T * 3 + ent.spin) * 0.06;
        pr.spikes.rotation.y += dt * (sleep ? 0.3 : 2.2); pr.body.rotation.y -= dt * 1.2;
        let face = ent.face;
        if (e.tg) { const [tq, tr] = P(e.tg), to = wpos(tq, tr); face = Math.atan2(-(to.z - ent.g.position.z), to.x - ent.g.position.x); }
        pr.pivot.rotation.y = damp(pr.pivot.rotation.y, face, 10, realDt);
      } else if (ent.type === 'brute') {
        ent.g.position.y = TOP;
        pr.spikes.rotation.y += dt * (e.cd > 0 ? 0.3 : 1.6);
        pr.dome.scale.setScalar(1 + (e.cd > 0 ? 0 : 0.06 * Math.sin(T * 6)));
        this.updatePips(pr, e.hp || 0, T);
      } else if (ent.type === 'lancer') {
        ent.g.position.y = TOP;
        pr.tip.rotation.y += dt * 3; pr.tip.position.y = 1.05 + Math.sin(T * 2.5) * 0.04;
        const aiming = e.aim >= 0;
        pr.sight.visible = aiming;
        if (aiming && this.run) {
          const hs = beamLine(this.run, e);
          if (hs.length) {
            const [lq, lr] = P(hs[hs.length - 1]), to = wpos(lq, lr, TOP + 0.3), from = ent.g.position.clone().setY(ent.g.position.y + 1.3);
            const dir = to.sub(from), len = dir.length();
            pr.sight.position.set(0, 1.3, 0);
            pr.sight.scale.set(len, 0.03 + 0.015 * Math.sin(T * 14), 0.03 + 0.015 * Math.sin(T * 14));
            pr.sight.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.normalize());
            pr.sight.material.opacity = 0.55 + 0.35 * Math.sin(T * 12);
          }
        }
        pr.mats[0].emissiveIntensity = aiming ? 1.4 + 0.6 * Math.sin(T * 12) : 0.6;
      } else if (ent.type === 'eater') {
        ent.g.position.y = pr.baseY - 0.25 + TOP + Math.abs(Math.sin(T * 5 + ent.spin)) * 0.08;
        pr.jaw.rotation.z = 0.15 + Math.abs(Math.sin(T * 7)) * 0.5;
        pr.pivot.rotation.y = damp(pr.pivot.rotation.y, ent.face, 8, realDt);
      } else if (ent.type === 'hive') {
        ent.g.position.y = TOP;
        pr.cells.children.forEach((c, i) => { const a = c.userData.a + T * 0.8; c.position.set(Math.cos(a) * 0.78, 0.35 + Math.sin(T * 2 + i) * 0.12, Math.sin(a) * 0.78); c.rotation.y = -a; });
        pr.crown.rotation.y += dt * 0.6;
        this.updatePips(pr, e.hp || 0, T);
      } else if (ent.type === 'mite') {
        ent.g.position.y = pr.baseY + TOP + Math.abs(Math.sin(T * 9 + ent.spin)) * 0.1;
        pr.body.rotation.y += dt * 6; pr.body.rotation.x += dt * 3;
      } else if (ent.type === 'splitter') {
        ent.g.position.y = pr.baseY + TOP + Math.sin(T * 3 + ent.spin) * 0.05;
        const gap = 0.02 + 0.03 * Math.abs(Math.sin(T * 4)); pr.top.position.y = 0.17 + gap; pr.bot.position.y = -0.17 - gap;
        let face = ent.face; if (e.tg) { const [tq, tr] = P(e.tg), to = wpos(tq, tr); face = Math.atan2(-(to.z - ent.g.position.z), to.x - ent.g.position.x); }
        pr.pivot.rotation.y = damp(pr.pivot.rotation.y, face, 10, realDt);
      } else if (ent.type === 'bomber') {
        ent.g.position.y = TOP;
        const armed = e.fuse === 1 && !sleep, k2 = armed ? 0.5 + 0.5 * Math.sin(T * 18) : 0;
        pr.shell.scale.setScalar(1 + 0.12 * k2);
        pr.shell.material.emissive = pr.shell.material.emissive || new THREE.Color();
        pr.shell.material.emissive.setRGB(1.4 * k2, 0.35 * k2, 0.15 * k2);
        pr.spark.material.opacity = 0.6 + 0.4 * Math.sin(T * 20); pr.spark.scale.setScalar(armed ? 0.7 : 0.35);
        this.updatePips(pr, Math.max(0, (e.fuse || 1) - 1), T, '#ffb547');
      } else if (ent.type === 'warden') {
        ent.g.position.y = TOP;
        pr.crystal.rotation.y += dt * 1.2; pr.crystal.position.y = 0.95 + Math.sin(T * 2) * 0.06;
        pr.rings.children.forEach((rg) => { rg.rotation.x = Math.PI / 2 + Math.sin(T * 1.5 + rg.userData.i) * 0.4; rg.rotation.y += dt * (1 + rg.userData.i); });
        this.updatePips(pr, e.hp || 0, T);
      } else if (ent.type === 'colossus') {
        ent.g.position.y = TOP;
        let face = ent.face; if (e.tg) { const [tq, tr] = P(e.tg), to = wpos(tq, tr); face = Math.atan2(-(to.z - ent.g.position.z), to.x - ent.g.position.x); }
        pr.pivot.rotation.y = damp(pr.pivot.rotation.y, face, 6, realDt);
        pr.armL.rotation.z = Math.sin(T * 2) * 0.2; pr.armR.rotation.z = -Math.sin(T * 2) * 0.2;
        pr.core.scale.setScalar(1 + 0.15 * Math.sin(T * 4));
        this.updatePips(pr, e.hp || 0, T);
      }
    }
    for (const pkp of this.picks.values()) { pkp.m.rotation.y += dt * 2; pkp.g.position.y = TOP + 0.42 + Math.sin(T * 2.5 + pkp.ph) * 0.07; if (pkp.halo) pkp.halo.rotation.z += dt; }
    for (const w of this.warns.values()) { const s = 1 + 0.12 * Math.sin(T * 8); w.ring.scale.setScalar(s); w.col.material.opacity = 0.1 + 0.06 * Math.sin(T * 8); }
    this.composer.render();
  }
}

function beamLine(run, e) {
  const out = [], walls = new Set(run.walls); let q = e.q, r = e.r; const [dq, dr] = DIRS[e.aim];
  for (let i = 0; i < (run.mods && run.mods.steady ? 2 : 3); i++) { q += dq; r += dr; if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) > run.rad || walls.has(K(q, r))) break; out.push(K(q, r)); }
  return out;
}
export { clamp };
