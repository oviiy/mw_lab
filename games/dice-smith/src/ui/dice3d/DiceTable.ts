// The red-lacquer dice tray with real 3D dice. Outcomes are decided by the game core;
// this only animates a tumble that lands on the given face.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Die } from '../../core/types';
import { FACE_PX, faceKey, paintFace } from './faceArt';

// Box material order: +X, −X, +Y, −Y, +Z, −Z. Die face f sits on slot SLOT[f]; opposites stay opposite.
const SLOT = [2, 0, 4, 5, 1, 3];
const NORMALS = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)];
const UP = new THREE.Vector3(0, 1, 0);
const SIZE = 1;
const SPACING = 1.75;
const REST_Y = SIZE / 2;

interface Anim {
  t0: number;
  dur: number;
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  axis: THREE.Vector3;
  spin: number;
  target: THREE.Quaternion;
  bounce: boolean;
  resolve: () => void;
}

interface DieObj {
  group: THREE.Group;
  mesh: THREE.Mesh;
  mats: THREE.MeshStandardMaterial[];
  keys: string[];
  face: number;
  held: boolean;
  yaw: number;
  anim: Anim | null;
  pulse: number;
  glow: THREE.Mesh;
  /** Glow state: scoring right now, or would score if played. */
  lit: boolean;
  preview: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
function easeOutBounce(t: number) {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
}

const texCache = new Map<string, THREE.CanvasTexture>();
function faceTexture(face: Die['faces'][number], material: Die['material'], hidden: boolean, aniso: number) {
  const key = faceKey(face, material, hidden);
  let tex = texCache.get(key);
  if (!tex) {
    const c = document.createElement('canvas');
    c.width = c.height = FACE_PX;
    paintFace(c.getContext('2d')!, face, material, hidden);
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = aniso;
    texCache.set(key, tex);
  }
  return tex;
}

function tableTexture(): THREE.CanvasTexture {
  const S = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const bg = g.createRadialGradient(S / 2, S * 0.45, S * 0.05, S / 2, S / 2, S * 0.55);
  bg.addColorStop(0, '#9E2620');
  bg.addColorStop(0.7, '#6A1410');
  bg.addColorStop(1, '#3A0907');
  g.fillStyle = bg;
  g.beginPath();
  g.ellipse(S / 2, S / 2, S * 0.49, S * 0.49, 0, 0, Math.PI * 2);
  g.fill();
  // Faint cloud scrolls in the lacquer.
  g.strokeStyle = 'rgba(255,200,120,0.07)';
  g.lineWidth = 6;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const x = S / 2 + Math.cos(a) * S * 0.33;
    const y = S / 2 + Math.sin(a) * S * 0.33;
    g.beginPath();
    g.arc(x, y, 26, 0, Math.PI * 1.5);
    g.arc(x + 30, y - 6, 16, Math.PI, Math.PI * 2.4);
    g.stroke();
  }
  // Gold rims.
  for (const [r, w, a] of [
    [0.47, 10, 0.95],
    [0.44, 3, 0.7],
    [0.4, 2, 0.35],
  ] as const) {
    g.strokeStyle = `rgba(222,176,86,${a})`;
    g.lineWidth = w;
    g.beginPath();
    g.ellipse(S / 2, S / 2, S * r, S * r, 0, 0, Math.PI * 2);
    g.stroke();
  }
  // Rim ornaments.
  g.fillStyle = 'rgba(222,176,86,0.9)';
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    g.beginPath();
    g.arc(S / 2 + Math.cos(a) * S * 0.455, S / 2 + Math.sin(a) * S * 0.455, 5, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class DiceTable {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private dice: DieObj[] = [];
  private raf = 0;
  private dirtyUntil = 0;
  private lantern: THREE.PointLight;
  private ray = new THREE.Raycaster();
  private aniso: number;
  private ro: ResizeObserver;
  onPick: ((i: number) => void) | null = null;
  pixelScale = 1;
  /** Animation speed multiplier from settings. */
  speed = 1;

  constructor(private host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0);
    this.aniso = this.renderer.capabilities.getMaxAnisotropy();
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.camera.position.set(0, 9.2, 6.4);
    this.camera.lookAt(0, 0, 0.35);

    // Lantern light from above-left, a cool moon rim from behind, warm fill.
    this.scene.add(new THREE.HemisphereLight(0xffe2b8, 0x2a0d18, 0.75));
    this.lantern = new THREE.PointLight(0xffb066, 60, 30, 1.6);
    this.lantern.position.set(-3.2, 7, 3.2);
    this.lantern.castShadow = true;
    this.lantern.shadow.mapSize.set(1024, 1024);
    this.lantern.shadow.radius = 6;
    this.lantern.shadow.bias = -0.002;
    this.scene.add(this.lantern);
    const rim = new THREE.DirectionalLight(0x8fa8ff, 0.5);
    rim.position.set(3, 4, -5);
    this.scene.add(rim);

    const table = new THREE.Mesh(
      new THREE.CircleGeometry(1, 96),
      new THREE.MeshStandardMaterial({ map: tableTexture(), roughness: 0.32, metalness: 0.08, transparent: true }),
    );
    table.rotation.x = -Math.PI / 2;
    table.scale.set(5.6, 3.4, 1);
    table.receiveShadow = true;
    this.scene.add(table);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.renderer.domElement.addEventListener('pointerdown', this.onPointer);
    this.loop();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointer);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  resize() {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer.setPixelRatio(Math.min(2.5, (window.devicePixelRatio || 1) * this.pixelScale));
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = `${w}px`;
    this.renderer.domElement.style.height = `${h}px`;
    this.camera.aspect = w / h;
    // Keep the tray framed on narrow (portrait) hosts.
    this.camera.fov = w / h < 1.4 ? 40 : 26;
    this.camera.updateProjectionMatrix();
    this.kick(100);
  }

  private kick(ms = 600) {
    this.dirtyUntil = Math.max(this.dirtyUntil, performance.now() + ms);
  }

  private onPointer = (e: PointerEvent) => {
    const r = this.renderer.domElement.getBoundingClientRect();
    const p = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(p, this.camera);
    const hits = this.ray.intersectObjects(this.dice.map((d) => d.mesh));
    if (hits.length) {
      const i = this.dice.findIndex((d) => d.mesh === hits[0].object);
      if (i >= 0) this.onPick?.(i);
    }
  };

  private homeX(i: number) {
    return (i - (this.dice.length - 1) / 2) * SPACING;
  }

  private restPos(i: number) {
    const d = this.dice[i];
    return new THREE.Vector3(this.homeX(i), REST_Y + (d.held ? 0.32 : 0), d.held ? -0.25 : 0.15);
  }

  private quatFor(face: number, yaw: number) {
    const q = new THREE.Quaternion().setFromUnitVectors(NORMALS[SLOT[face]], UP);
    return new THREE.Quaternion().setFromAxisAngle(UP, yaw).multiply(q);
  }

  /** Create or update dice meshes to match the run's dice (textures follow carving). */
  setDice(dice: Die[], hidden = false) {
    while (this.dice.length > dice.length) {
      const d = this.dice.pop()!;
      this.scene.remove(d.group);
    }
    dice.forEach((die, i) => {
      let obj = this.dice[i];
      if (!obj) {
        const mats = Array.from({ length: 6 }, () => new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0 }));
        const mesh = new THREE.Mesh(new RoundedBoxGeometry(SIZE, SIZE, SIZE, 5, 0.13), mats);
        mesh.castShadow = true;
        const glow = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.82, 48), new THREE.MeshBasicMaterial({ color: 0xffc860, transparent: true, opacity: 0, depthWrite: false }));
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = 0.01;
        const group = new THREE.Group();
        group.add(mesh);
        this.scene.add(group);
        this.scene.add(glow);
        obj = { group, mesh, mats, keys: [], face: 0, held: false, yaw: (Math.random() - 0.5) * 0.5, anim: null, pulse: 0, glow, lit: false, preview: false };
        this.dice[i] = obj;
        group.position.copy(new THREE.Vector3(0, REST_Y, 0));
      }
      const rough = die.material === 'ivory' ? 0.32 : die.material === 'lacquer' ? 0.28 : die.material === 'ebony' ? 0.42 : 0.55;
      const metal = die.material === 'lacquer' ? 0.45 : 0;
      die.faces.forEach((f, fi) => {
        const isHidden = hidden && fi === obj.face;
        const key = faceKey(f, die.material, isHidden);
        const m = obj.mats[SLOT[fi]];
        if (obj.keys[fi] !== key) {
          m.map = faceTexture(f, die.material, isHidden, this.aniso);
          m.needsUpdate = true;
          obj.keys[fi] = key;
        }
        m.roughness = rough;
        m.metalness = metal;
      });
    });
    this.dice.forEach((_, i) => this.placeGlow(i));
    this.kick();
  }

  /** Snap to faces/holds without animation. */
  show(faces: number[], held: boolean[]) {
    this.dice.forEach((d, i) => {
      if (d.anim) return;
      d.face = faces[i] ?? d.face;
      d.held = held[i] ?? false;
      d.group.quaternion.copy(this.quatFor(d.face, d.yaw));
      d.group.position.copy(this.restPos(i));
      this.placeGlow(i);
    });
    this.kick();
  }

  /** Animate holds lifting/settling. */
  setHeld(held: boolean[]) {
    this.dice.forEach((d, i) => {
      if (d.held === !!held[i] || d.anim) return;
      d.held = !!held[i];
      const target = this.restPos(i);
      d.anim = { t0: performance.now(), dur: 220, fromPos: d.group.position.clone(), toPos: target, axis: UP.clone(), spin: 0, target: d.group.quaternion.clone(), bounce: false, resolve: () => undefined };
    });
    this.kick(400);
  }

  roll(indices: number[], faces: number[]): Promise<void> {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const all = indices.map(
      (i, k) =>
        new Promise<void>((resolve) => {
          const d = this.dice[i];
          if (!d) return resolve();
          d.face = faces[i];
          d.yaw = (Math.random() - 0.5) * 0.7;
          const to = this.restPos(i);
          const from = new THREE.Vector3(to.x + (Math.random() - 0.5) * 1.6, 3.4 + Math.random(), to.z + 2.2 + Math.random());
          d.group.position.copy(from);
          d.anim = {
            t0: performance.now() + k * 60,
            dur: (reduced ? 200 : 820 + Math.random() * 260) / this.speed,
            fromPos: from,
            toPos: to,
            axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
            spin: (reduced ? 0.5 : 3 + Math.random() * 2.5) * Math.PI * 2,
            target: this.quatFor(d.face, d.yaw),
            bounce: true,
            resolve,
          };
        }),
    );
    this.kick(2000);
    return settle(Promise.all(all).then(() => undefined), 2200, () => this.finishAll());
  }

  /** Snap any running animation to its end (used when frames stop, e.g. a hidden tab). */
  private finishAll() {
    this.dice.forEach((d) => {
      const a = d.anim;
      if (!a) return;
      d.anim = null;
      d.group.position.copy(a.toPos);
      d.group.quaternion.copy(a.target);
      a.resolve();
    });
    this.kick(200);
  }

  flip(i: number, face: number): Promise<void> {
    return new Promise((resolve) => {
      const d = this.dice[i];
      if (!d) return resolve();
      d.face = face;
      const to = this.restPos(i);
      const axis = new THREE.Vector3(1, 0, 0);
      d.anim = { t0: performance.now(), dur: 520, fromPos: to.clone().add(new THREE.Vector3(0, 1.4, 0)), toPos: to, axis, spin: Math.PI, target: this.quatFor(face, d.yaw), bounce: true, resolve };
      this.kick(900);
      setTimeout(() => this.finishAll(), 1200);
    });
  }

  /** A short hop + glow while a die scores. */
  pulse(i: number) {
    const d = this.dice[i];
    if (!d) return;
    d.pulse = performance.now();
    this.kick(500);
  }

  setGlow(i: number, on: boolean) {
    const d = this.dice[i];
    if (!d) return;
    d.lit = on;
    this.applyGlow(d);
  }

  /** Faint rings under the dice that would score if played now. */
  setPreview(indices: number[]) {
    this.dice.forEach((d, i) => {
      d.preview = indices.includes(i);
      this.applyGlow(d);
    });
  }

  private applyGlow(d: DieObj) {
    (d.glow.material as THREE.MeshBasicMaterial).opacity = d.lit ? 0.8 : d.preview ? 0.22 : 0;
    this.kick(100);
  }

  private placeGlow(i: number) {
    const d = this.dice[i];
    d.glow.position.x = this.homeX(i);
    d.glow.position.z = d.held ? -0.25 : 0.15;
  }

  /** Client-space position of a die (for DOM overlays). */
  screenPos(i: number): { x: number; y: number } | null {
    const d = this.dice[i];
    if (!d) return null;
    const v = this.restPos(i).add(new THREE.Vector3(0, 0.55, 0)).project(this.camera);
    const r = this.renderer.domElement.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    let active = now < this.dirtyUntil;
    // Lantern flicker keeps the scene alive, cheaply.
    const flick = 60 + Math.sin(now * 0.004) * 3 + Math.sin(now * 0.013) * 2;
    if (Math.abs(this.lantern.intensity - flick) > 1.5) {
      this.lantern.intensity = flick;
      active = true;
    }
    this.dice.forEach((d) => {
      if (d.anim) {
        active = true;
        const a = d.anim;
        const t = Math.max(0, Math.min(1, (now - a.t0) / a.dur));
        const e = easeOutCubic(t);
        const p = a.fromPos.clone().lerp(a.toPos, e);
        if (a.bounce) {
          const yb = a.toPos.y + (a.fromPos.y - a.toPos.y) * (1 - easeOutBounce(t));
          p.y = yb;
        }
        d.group.position.copy(p);
        const rest = new THREE.Quaternion().setFromAxisAngle(a.axis, a.spin * (1 - e));
        d.group.quaternion.copy(a.target.clone().multiply(rest));
        if (t >= 1) {
          d.anim = null;
          d.group.position.copy(a.toPos);
          d.group.quaternion.copy(a.target);
          a.resolve();
        }
      }
      if (d.pulse) {
        const t = (now - d.pulse) / 380;
        if (t >= 1) {
          d.pulse = 0;
          d.mesh.position.y = 0;
          d.mesh.scale.setScalar(1);
        } else {
          d.mesh.position.y = Math.sin(t * Math.PI) * 0.35;
          d.mesh.scale.setScalar(1 + Math.sin(t * Math.PI) * 0.1);
        }
        active = true;
      }
    });
    if (active) this.renderer.render(this.scene, this.camera);
  };
}

/** Resolve after `ms` even if the animation never finishes (frames stop in hidden tabs). */
function settle(p: Promise<void>, ms: number, onTimeout: () => void): Promise<void> {
  return Promise.race([p, new Promise<void>((r) => setTimeout(() => (onTimeout(), r()), ms))]);
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
