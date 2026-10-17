// SceneHost: owns the WebGL renderer, camera, atmosphere, picking, landmark pins and tours for ONE location at a time.
// Scene modules (src/scenes/<id>.js) only build geometry; everything interactive lives here.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Atmosphere, PRESET_NAMES } from '../kit/sky.js';
import { shared } from '../kit/materials.js';
import { weather } from '../kit/life.js';
import { rng as makeRng } from '../kit/util.js';
import { Post } from './post.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const QUALITY = {
  low:    { pr: 1,    shadows: false, shadowSize: 0,    dens: 0.45, weather: 1500, seg: 0.6 },
  medium: { pr: 1.5,  shadows: true,  shadowSize: 1024,    dens: 0.75, weather: 3000, seg: 0.8 },
  high:   { pr: 2,    shadows: true,  shadowSize: 2048, dens: 1,    weather: 5000, seg: 1 },
};
export const qualityProfile = (q) => QUALITY[q] || QUALITY.medium;

export class SceneHost {
  constructor({ canvas, pinLayer, quality = 'medium', reducedMotion = false, onSelect, onHover, onTourStep, onCamera }) {
    this.canvas = canvas; this.pinLayer = pinLayer; this.cb = { onSelect, onHover, onTourStep, onCamera };
    this.quality = quality; this.reduced = reducedMotion;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.info.autoReset = false; // post-processing renders several passes per frame; reset manually so stats cover the whole frame
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.5, 6000);
    this.controls = new OrbitControls(this.camera, canvas);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.08, rotateSpeed: 0.6, zoomSpeed: 0.9, panSpeed: 0.7, screenSpacePanning: false, minPolarAngle: 0.02 });
    this.atmos = new Atmosphere(this.scene, this.renderer);
    this.post = new Post(this.renderer, this.scene, this.camera); this.atmos.onApply = (st) => this.post.applyAtmosphere(st);
    this.weatherKinds = { snow: weather('snow'), rain: weather('rain'), ash: weather('ash') };
    for (const w of Object.values(this.weatherKinds)) this.scene.add(w);
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.clock = new THREE.Clock(); this.time = 0;
    this.updaters = []; this.landmarks = new Map(); this.pins = new Map();
    this.fly = null; this.running = false; this.sel = null; this.hover = null; this.tour = null; this.cutaway = null;
    this.ring = this._makeRing(); this.scene.add(this.ring);
    this.setQuality(quality);
    this._bind();
    this._resize();
    this.showLabels = true; this.lang = 'en';
  }

  /* ---------- lifecycle ---------- */
  setQuality(q) {
    this.quality = q; const p = qualityProfile(q);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, p.pr));
    this.atmos.enableShadows(p.shadows, p.shadowSize || 1024);
    this.renderer.shadowMap.enabled = p.shadows;
    this._resize();
    if (this.currentRoot) this.currentRoot.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  }
  get q() { const p = qualityProfile(this.quality); return { ...p, dens: (n) => Math.max(1, Math.round(n * p.dens)), seg: (n) => Math.max(8, Math.round(n * p.seg)), low: this.quality === 'low' }; }

  /** Build a scene module's world. Returns the built descriptor. */
  mount(mod, content, lang) {
    this.unmount();
    this.lang = lang; this.content = content;
    const ctx = {
      THREE, root: this.root, scene: this.scene, q: this.q, rng: makeRng, reduced: this.reduced,
      onUpdate: (fn) => this.updaters.push(fn), atmos: this.atmos, registerWater: (w) => this.atmos.registerWater(w), host: this,
    };
    const group = new THREE.Group(); this.root.add(group); ctx.root = group; this.currentRoot = group;
    const out = mod.default.build(ctx);
    this.desc = out;
    this.radius = out.radius || 250;
    this.center = new THREE.Vector3(...(out.center || [0, 0, 0]));
    this.atmos.setRadius(this.radius * 1.2); this.atmos.followTarget(this.center);
    const [cx, , cz] = this.center.toArray();
    this.controls.minDistance = out.minDistance ?? 12; this.controls.maxDistance = out.maxDistance ?? this.radius * 3.2;
    this.controls.maxPolarAngle = out.maxPolar ?? Math.PI * 0.485;
    for (const [id, lm] of Object.entries(out.landmarks || {})) {
      const pos = new THREE.Vector3(...lm.pos);
      const rec = { id, pos, r: lm.r ?? 8, cam: lm.cam };
      const proxy = new THREE.Mesh(new THREE.SphereGeometry(rec.r, 10, 8), new THREE.MeshBasicMaterial({ visible: false }));
      proxy.position.copy(pos); proxy.userData.landmark = id; this.root.add(proxy); rec.proxy = proxy;
      this.landmarks.set(id, rec);
    }
    for (const id of this.landmarks.keys()) if (!content?.landmarks?.[id]) console.error(`[atlas] landmark "${id}" has no content entry`);
    for (const id of Object.keys(content?.landmarks || {})) if (!this.landmarks.has(id)) console.error(`[atlas] content landmark "${id}" is not in the scene`);
    for (const id of content?.tour || []) if (!this.landmarks.has(id)) console.error(`[atlas] tour stop "${id}" is not in the scene`);
    this._buildPins();
    // scene defaults
    const cl = out.climate || {};
    this.defaultClimate = { atmos: cl.atmos || 'day', weather: cl.weather || 'clear', snow: cl.snow ?? 0, tint: cl.tint };
    this.atmos.set(this.defaultClimate.atmos, { instant: true, tint: cl.tint });
    this.setWeather(this.defaultClimate.weather, true);
    this.snowTarget = this.defaultClimate.snow; shared.uSnow.value = this.snowTarget;
    this.hero = { pos: new THREE.Vector3(...out.hero.pos), target: new THREE.Vector3(...out.hero.target) };
    this.cutaways = out.cutaways || [];
    this.resetView(true);
  }
  unmount() {
    this.stopTour(); this.exitCutaway(true);
    this.updaters.length = 0; this.landmarks.clear(); this.pinLayer.replaceChildren(); this.pins.clear();
    this.atmos.clearWater();
    if (this.currentRoot) {
      this.root.remove(this.currentRoot);
      this.currentRoot.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); // materials/textures are shared kit caches
      this.currentRoot = null;
    }
    for (const c of [...this.root.children]) { this.root.remove(c); }
    this.sel = null; this.ring.visible = false;
  }

  /* ---------- loop ---------- */
  start() { if (this.running) return; this.running = true; this.clock.getDelta(); this._loop(); }
  stop() { this.running = false; cancelAnimationFrame(this._raf); }
  _loop = () => {
    if (!this.running) return;
    this._raf = requestAnimationFrame(this._loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    this.time += dt; shared.uTime.value = this.time;
    this._stepFly(dt);
    this.controls.update();
    // keep orbit target inside the scene
    const t = this.controls.target, lim = this.radius * 1.1;
    const dx = t.x - this.center.x, dz = t.z - this.center.z, d = Math.hypot(dx, dz);
    if (d > lim) { t.x = this.center.x + (dx / d) * lim; t.z = this.center.z + (dz / d) * lim; }
    if (this.camera.position.y < 1.5) this.camera.position.y = 1.5;
    this.atmos.update(dt, this.time);
    this.atmos.sky.position.copy(this.camera.position);
    for (const k in this.weatherKinds) this.weatherKinds[k].userData.follow(this.camera);
    shared.uSnow.value += (this.snowTarget - shared.uSnow.value) * Math.min(1, dt * 0.8);
    for (const fn of this.updaters) fn(dt, this.time);
    if (this.cutUpdaters) for (const fn of this.cutUpdaters) fn(dt, this.time);
    if (this.ring.visible) { this.ring.rotation.z += dt * 0.6; const s = 1 + Math.sin(this.time * 2.4) * 0.05; this.ring.scale.setScalar(this.ring.userData.base * s); }
    this.renderer.info.reset();
    if (this.post.mode !== 'none' && !this.cutawayHidden) this.post.render(this.time); else if (this.post.mode !== 'none') this.post.render(this.time); else this.renderer.render(this.scene, this.camera);
    this._projectPins();
    this.cb.onCamera?.(this);
  };

  /* ---------- camera ---------- */
  flyTo(pos, target, { dur = 1.6, instant = false, arc = 0.15 } = {}) {
    if (instant || this.reduced) { this.camera.position.copy(pos); this.controls.target.copy(target); this.controls.update(); this.fly = null; return Promise.resolve(); }
    return new Promise((res) => {
      this.fly = { p0: this.camera.position.clone(), t0: this.controls.target.clone(), p1: pos.clone(), t1: target.clone(), t: 0, dur, arc, res };
      this.controls.enabled = false;
    });
  }
  _stepFly(dt) {
    const f = this.fly; if (!f) return;
    f.t = Math.min(1, f.t + dt / f.dur); const k = ease(f.t);
    this.camera.position.lerpVectors(f.p0, f.p1, k);
    this.camera.position.y += Math.sin(k * Math.PI) * f.arc * f.p0.distanceTo(f.p1);
    this.controls.target.lerpVectors(f.t0, f.t1, k);
    this.camera.lookAt(this.controls.target);
    if (f.t >= 1) { this.fly = null; this.controls.enabled = !this.cutawayLocked || true; this.controls.update(); f.res(); }
  }
  async resetView(instant = false) {
    this.deselect(true);
    await this.flyTo(this.hero.pos, this.hero.target, { instant, dur: 1.8 });
  }
  overhead() {
    const r = this.radius;
    return this.flyTo(new THREE.Vector3(this.center.x + 0.01, r * 1.55, this.center.z + r * 0.35), this.center.clone().setY(0), { dur: 1.8, arc: 0.0 });
  }
  /** Cinematic entrance: start high and far, settle at the hero view. */
  async enter({ from } = {}) {
    const h = this.hero;
    const dir = h.pos.clone().sub(h.target);
    const start = from ? from.clone() : h.target.clone().add(dir.clone().multiplyScalar(2.2)).setY(h.target.y + dir.length() * 1.6);
    this.camera.position.copy(start); this.controls.target.copy(h.target); this.camera.lookAt(h.target);
    await this.flyTo(h.pos, h.target, { dur: 3.2, arc: 0.08 });
  }

  /* ---------- landmarks ---------- */
  focusLandmark(id, { dur = 1.5 } = {}) {
    const lm = this.landmarks.get(id); if (!lm) return Promise.resolve();
    this.select(id, true);
    let pos, tgt;
    if (lm.cam) { pos = new THREE.Vector3(...lm.cam.pos); tgt = new THREE.Vector3(...(lm.cam.target || lm.pos.toArray())); }
    else {
      tgt = lm.pos.clone().add(new THREE.Vector3(0, lm.r * 0.4, 0));
      const dir = this.camera.position.clone().sub(tgt); dir.y = 0; if (dir.lengthSq() < 1) dir.set(1, 0, 1); dir.normalize();
      const dist = lm.r * 3.4 + 26; pos = tgt.clone().add(dir.multiplyScalar(dist)); pos.y = tgt.y + lm.r * 1.5 + 14;
    }
    return this.flyTo(pos, tgt, { dur });
  }
  select(id, silent = false) {
    this.sel = id;
    const lm = this.landmarks.get(id);
    if (lm) { this.ring.visible = true; this.ring.position.copy(lm.pos).setY(lm.pos.y + 0.4); this.ring.userData.base = lm.r * 0.9; this.ring.scale.setScalar(lm.r * 0.9); }
    this.pins.forEach((p, k) => p.el.classList.toggle('sel', k === id));
    if (!silent) this.cb.onSelect?.(id);
  }
  deselect(silent = false) {
    this.sel = null; this.ring.visible = false; this.pins.forEach((p) => p.el.classList.remove('sel'));
    if (!silent) this.cb.onSelect?.(null);
  }
  _makeRing() {
    const g = new THREE.RingGeometry(0.85, 1, 48); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.85, depthTest: false, fog: false, side: THREE.DoubleSide }));
    m.visible = false; m.renderOrder = 20; m.userData.base = 8; return m;
  }
  _buildPins() {
    this.pinLayer.replaceChildren(); this.pins.clear();
    let n = 0;
    for (const [id, lm] of this.landmarks) {
      const el = document.createElement('button');
      el.className = 'pin'; el.type = 'button'; el.dataset.id = id;
      el.innerHTML = `<span class="pin-dot"></span><span class="pin-label"></span>`;
      el.addEventListener('click', (e) => { e.stopPropagation(); this.cb.onSelect?.(id, true); });
      el.addEventListener('mouseenter', () => this._setHover(id));
      el.addEventListener('mouseleave', () => this._setHover(null));
      el.addEventListener('focus', () => this._setHover(id));
      el.addEventListener('blur', () => this._setHover(null));
      el.style.animationDelay = `${n++ * 60}ms`;
      this.pinLayer.appendChild(el); this.pins.set(id, { el, lm });
    }
    this.refreshPinText();
  }
  refreshPinText(lang = this.lang) {
    this.lang = lang;
    for (const [id, p] of this.pins) {
      const name = this.content?.landmarks?.[id]?.name?.[lang] || id;
      p.el.querySelector('.pin-label').textContent = name; p.el.setAttribute('aria-label', name); p.w = undefined;
    }
  }
  setLabelsVisible(v) { this.showLabels = v; this.pinLayer.classList.toggle('hidden', !v); }
  _setHover(id) { this.hover = id; this.cb.onHover?.(id); }
  _projectPins() {
    if (!this.pins.size) return;
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight, v = new THREE.Vector3(), list = [];
    for (const [id, p] of this.pins) {
      v.copy(p.lm.pos); v.y += p.lm.r * 0.9 + 3; v.project(this.camera);
      const vis = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1 && !this.cutawayHidden;
      p.el.style.display = vis ? '' : 'none';
      if (!vis) continue;
      const dd = this.camera.position.distanceTo(p.lm.pos), x = ((v.x + 1) / 2) * w, y = ((1 - v.y) / 2) * h;
      p.el.style.transform = `translate(${x}px, ${y}px)`;
      p.el.style.opacity = Math.max(0.4, Math.min(1, 1.35 - dd / (this.radius * 2.6))) + '';
      p.el.style.zIndex = String(1000 - Math.round(dd));
      list.push({ id, p, x, y, dd });
    }
    // declutter: nearest first; a label that would overlap an already-shown one collapses to its dot
    list.sort((a, b) => (a.id === this.sel ? -1 : b.id === this.sel ? 1 : a.dd - b.dd));
    const taken = [];
    for (const it of list) {
      const wLab = (this._labelW(it.p) + 24), r = { x0: it.x - 8, x1: it.x + wLab, y0: it.y - 16, y1: it.y + 12 };
      const force = it.id === this.sel || it.id === this.hover;
      const hit = !force && taken.some((t) => r.x0 < t.x1 && r.x1 > t.x0 && r.y0 < t.y1 && r.y1 > t.y0);
      it.p.el.classList.toggle('nolabel', hit);
      if (!hit) taken.push(r);
    }
  }
  _labelW(p) { return (p.w ??= (p.el.querySelector('.pin-label').textContent.length * (/[\u4e00-\u9fff]/.test(p.el.textContent) ? 15 : 7.4))); }
  /* ---------- atmosphere / weather ---------- */
  setAtmosphere(name) { this.atmos.set(name); }
  setWeather(kind, instant = false) {
    this.weatherKind = kind;
    const p = this.q.weather;
    for (const [k, w] of Object.entries(this.weatherKinds)) w.userData.setAmount(k === kind ? 1 : 0);
    this.atmos.setFogScale(kind === 'fog' ? 2.4 : kind === 'rain' ? 1.5 : kind === 'snow' ? 1.35 : 1);
    if (kind === 'snow') this.snowTarget = Math.max(this.defaultClimate?.snow ?? 0, 0.85);
    else this.snowTarget = this.defaultClimate?.snow ?? 0;
    if (instant) shared.uSnow.value = this.snowTarget;
  }
  /* ---------- tour ---------- */
  startTour(ids, { dwell = 7.5 } = {}) {
    this.stopTour();
    const tour = { ids, i: -1, dwell, timer: null, paused: false, alive: true };
    this.tour = tour; this._tourStep(1);
  }
  async _tourStep(dir) {
    const t = this.tour; if (!t) return;
    t.i = (t.i + dir + t.ids.length) % t.ids.length;
    clearTimeout(t.timer);
    this.cb.onTourStep?.(t.i, t.ids[t.i], t.ids.length);
    await this.focusLandmark(t.ids[t.i], { dur: 2.2 });
    if (this.tour !== t) return;
    if (!t.paused) t.timer = setTimeout(() => this._tourStep(1), t.dwell * 1000);
  }
  tourNext() { if (this.tour) this._tourStep(1); }
  tourPrev() { if (this.tour) this._tourStep(-1); }
  tourPause(p) { const t = this.tour; if (!t) return; t.paused = p; clearTimeout(t.timer); if (!p) t.timer = setTimeout(() => this._tourStep(1), 1500); }
  stopTour() { if (this.tour) { clearTimeout(this.tour.timer); this.tour = null; this.cb.onTourStep?.(-1, null, 0); } }

  /* ---------- cutaways ---------- */
  async enterCutaway(id) {
    const def = this.cutaways.find((c) => c.id === id); if (!def) return;
    if (this.fly) { const f = this.fly; this.fly = null; this.controls.enabled = true; f.res(); } // cancel any entrance/landmark flight so it can't override the interior camera
    this.stopTour(); this.deselect(true);
    this.saved = { pos: this.camera.position.clone(), target: this.controls.target.clone(), min: this.controls.minDistance, max: this.controls.maxDistance, polar: this.controls.maxPolarAngle, atm: this.atmos.name };
    const ctx = { THREE, rng: makeRng, q: this.q, onUpdate: (fn) => this.cutUpdaters.push(fn), root: null, host: this };
    this.cutUpdaters = [];
    const grp = new THREE.Group(); ctx.root = grp;
    const out = def.build(ctx) || {};
    this.cutRoot = grp; this.scene.add(grp);
    this.currentRoot.visible = false; this.cutawayHidden = true; this.cutaway = { id, out };
    this.pinLayer.classList.add('hidden');
    this.ring.visible = false;
    for (const k in this.weatherKinds) this.weatherKinds[k].visible = false;
    this.atmos.set('interior');
    const c = out.center || [0, 0, 0];
    this.controls.minDistance = out.minDistance ?? 6; this.controls.maxDistance = out.maxDistance ?? 70; this.controls.maxPolarAngle = Math.PI * 0.49;
    this.cutCenter = new THREE.Vector3(...c);
    this.camera.position.set(...(out.hero?.pos || [c[0], c[1] + 18, c[2] + 34])); this.controls.target.set(...(out.hero?.target || c));
    this.camera.lookAt(this.controls.target);
    this.cutLandmarks = out.landmarks || {};
    return out;
  }
  exitCutaway(silent = false) {
    if (!this.cutaway) return Promise.resolve();
    this.scene.remove(this.cutRoot); this.cutRoot.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    this.cutRoot = null; this.cutUpdaters = []; this.cutaway = null; this.cutawayHidden = false;
    if (this.currentRoot) this.currentRoot.visible = true;
    this.pinLayer.classList.toggle('hidden', !this.showLabels);
    const s = this.saved;
    if (s) { this.controls.minDistance = s.min; this.controls.maxDistance = s.max; this.controls.maxPolarAngle = s.polar; this.atmos.set(s.atm); this.setWeather(this.weatherKind || 'clear', true); this.camera.position.copy(s.pos); this.controls.target.copy(s.target); }
    return Promise.resolve();
  }

  /* ---------- input ---------- */
  _bind() {
    const c = this.canvas;
    let down = null;
    c.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; if (this.fly) { this.fly.res(); this.fly = null; this.controls.enabled = true; } this.stopTour(); });
    c.addEventListener('pointerup', (e) => {
      if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved < 6) this._pick(e);
    });
    c.addEventListener('pointermove', (e) => {
      if (e.buttons) return;
      const id = this._rayLandmark(e); if (id !== this.hover) this._setHover(id);
      c.style.cursor = id ? 'pointer' : '';
    });
    window.addEventListener('resize', () => this._resize());
    this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(c.parentElement);
    c.addEventListener('keydown', (e) => {
      const step = this.radius * 0.04; const f = this.camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize(); const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0));
      const mv = { ArrowUp: f, ArrowDown: f.clone().negate(), ArrowRight: r, ArrowLeft: r.clone().negate() }[e.key];
      if (mv) { this.controls.target.addScaledVector(mv, step); this.camera.position.addScaledVector(mv, step); e.preventDefault(); }
      if (e.key === '+' || e.key === '=') { this.dolly(0.85); } if (e.key === '-') { this.dolly(1.18); }
      if (e.key === 'q') this.rotate(0.12); if (e.key === 'e') this.rotate(-0.12);
    });
    c.tabIndex = 0;
  }
  dolly(k) { const off = this.camera.position.clone().sub(this.controls.target).multiplyScalar(k); const d = off.length(); if (d < this.controls.minDistance || d > this.controls.maxDistance) return; this.camera.position.copy(this.controls.target).add(off); }
  rotate(a) { const off = this.camera.position.clone().sub(this.controls.target); const x = off.x * Math.cos(a) - off.z * Math.sin(a), z = off.x * Math.sin(a) + off.z * Math.cos(a); off.x = x; off.z = z; this.camera.position.copy(this.controls.target).add(off); }
  _rayLandmark(e) {
    if (this.cutaway) return null;
    const r = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const proxies = [...this.landmarks.values()].map((l) => l.proxy);
    const hit = this.raycaster.intersectObjects(proxies, false)[0];
    return hit ? hit.object.userData.landmark : null;
  }
  _pick(e) {
    const id = this._rayLandmark(e);
    if (id) this.cb.onSelect?.(id, true);
    else if (this.sel) this.cb.onSelect?.(null, true);
  }
  _resize() {
    const p = this.canvas.parentElement; if (!p) return;
    const w = p.clientWidth || window.innerWidth, h = p.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false); this._applyPost(w, h); this.camera.aspect = w / h; this.camera.fov = w < h ? 62 : 48; this.camera.updateProjectionMatrix();
  }
  _applyPost(w, h) { const p = qualityProfile(this.quality); const mode = this.quality === 'high' ? 'full' : this.quality === 'medium' ? 'grade' : 'none'; this.post.setMode(mode, w, h, Math.min(window.devicePixelRatio || 1, p.pr)); this.canvas.parentElement.dataset.post = this.post.mode; if (this.atmos.state?.night !== undefined) this.post.applyAtmosphere(this.atmos.state); }
  dispose() { this.stop(); this.unmount(); this.renderer.dispose(); }
}
export { PRESET_NAMES };
