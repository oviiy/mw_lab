import * as THREE from 'three';
import { waterUniforms, SEA_Y } from './tileMesh.js';

const FOG = '#cdd3d1';

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(FOG);
  scene.fog = new THREE.Fog(FOG, 26, 90);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 400);

  const sunDir = new THREE.Vector3(-0.75, 0.52, -0.42).normalize();
  const hemi = new THREE.HemisphereLight('#dfe9ee', '#41524c', 1.35);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe3c2', 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  // Sky dome: fog-coloured at the horizon, peach glow toward the low sun, cool overhead.
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(300, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uSun: { value: sunDir }, uFog: { value: new THREE.Color(FOG) } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * p; }',
      fragmentShader: `
        varying vec3 vDir; uniform vec3 uSun; uniform vec3 uFog;
        void main(){
          float h = vDir.y;
          vec3 zenith = vec3(0.47, 0.60, 0.69);
          vec3 glow = vec3(0.98, 0.84, 0.72);
          float s = max(dot(normalize(vec3(vDir.x, 0.0, vDir.z)), normalize(vec3(uSun.x, 0.0, uSun.z))), 0.0);
          vec3 band = mix(uFog, glow, pow(s, 3.0) * 0.75);
          vec3 col = mix(band, zenith, smoothstep(0.02, 0.55, h));
          col = mix(uFog, col, smoothstep(-0.02, 0.06, h));
          col += vec3(1.0, 0.85, 0.65) * pow(max(dot(vDir, uSun), 0.0), 60.0) * 0.6;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    })
  );
  sky.renderOrder = -1;
  scene.add(sky);

  const seaMat = new THREE.MeshStandardMaterial({ color: '#2f6773', roughness: 0.62, metalness: 0.02 });
  seaMat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = waterUniforms.uTime;
    sh.vertexShader = 'uniform float uTime;\nvarying float vH;\n' + sh.vertexShader
      .replace('#include <beginnormal_vertex>', `
        vec4 wp0 = modelMatrix * vec4(position, 1.0);
        float wx = wp0.x, wz = wp0.z;
        float a1 = wx * 0.35 + uTime * 0.9, a2 = wz * 0.5 - uTime * 1.1 + wx * 0.2, a3 = (wx + wz) * 1.3 + uTime * 1.7;
        float h = sin(a1) * 0.09 + sin(a2) * 0.06 + sin(a3) * 0.025;
        float dx = cos(a1) * 0.35 * 0.09 + cos(a2) * 0.2 * 0.06 + cos(a3) * 1.3 * 0.025;
        float dz = cos(a2) * 0.5 * 0.06 + cos(a3) * 1.3 * 0.025;
        vec3 objectNormal = normalize(vec3(-dx, dz, 1.0));
        vH = h;`)
      .replace('#include <begin_vertex>', 'vec3 transformed = vec3(position.xy, position.z + h);');
    sh.fragmentShader = 'varying float vH;\n' + sh.fragmentShader.replace(
      '#include <color_fragment>',
      '#include <color_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.62, 0.66), smoothstep(0.11, 0.17, vH) * 0.16);'
    );
  };
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(240, 240, 180, 180), seaMat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = SEA_Y;
  sea.receiveShadow = true;
  scene.add(sea);

  // Gulls wheeling over the island.
  const wingGeo = new THREE.BufferGeometry();
  wingGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.06, 0, 0, 0.06, 0.32, 0, 0], 3));
  wingGeo.computeVertexNormals();
  const gullMat = new THREE.MeshStandardMaterial({ color: '#f2f2ee', side: THREE.DoubleSide, flatShading: true });
  const gulls = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    const l = new THREE.Mesh(wingGeo, gullMat), r = new THREE.Mesh(wingGeo, gullMat);
    r.scale.x = -1;
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 4).rotateZ(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#d9dad6', flatShading: true }));
    g.add(l, r, body);
    g.userData = { l, r, phase: Math.random() * 6, radius: 5 + Math.random() * 6, height: 3.2 + Math.random() * 2.5, speed: 0.18 + Math.random() * 0.12, dir: Math.random() < 0.5 ? 1 : -1 };
    scene.add(g);
    gulls.push(g);
  }

  const focus = new THREE.Vector3();
  let shadowR = 0;

  function setFocus(center, radius) {
    focus.copy(center);
    const R = Math.max(8, radius + 5);
    if (Math.abs(R - shadowR) > 0.5) {
      shadowR = R;
      const c = sun.shadow.camera;
      c.left = -R; c.right = R; c.top = R; c.bottom = -R; c.near = 1; c.far = 80;
      c.updateProjectionMatrix();
    }
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // A game runs from dawn to a lantern-lit night as the tile stack empties.
  const KEYS = [
    { at: 0.0, sun: '#ffe3c2', sunI: 2.6, elev: 0.52, sky: '#dfe9ee', gnd: '#41524c', hemiI: 1.35, sea: '#2f6773', fog: '#cdd3d1', exp: 1.08 },
    { at: 0.45, sun: '#fff4e2', sunI: 3.0, elev: 0.8, sky: '#e8f0f2', gnd: '#4a5a52', hemiI: 1.5, sea: '#327380', fog: '#d6dcdb', exp: 1.1 },
    { at: 0.78, sun: '#ffb877', sunI: 2.3, elev: 0.3, sky: '#f0d2c0', gnd: '#4a4340', hemiI: 1.1, sea: '#3b5a66', fog: '#d9c3b6', exp: 1.05 },
    { at: 1.0, sun: '#b4c4f0', sunI: 1.3, elev: 0.6, sky: '#8a9cc8', gnd: '#2f3848', hemiI: 1.05, sea: '#284763', fog: '#4e5f80', exp: 1.05 },
  ];
  const cur = { f: 0, goal: 0 };
  const cA = new THREE.Color(), cB = new THREE.Color();
  const mixC = (target, a, b, k) => target.copy(cA.set(a)).lerp(cB.set(b), k);
  let night = 0;
  function setDay(f) { cur.goal = Math.max(0, Math.min(1, f)); }
  function snapDay(f) { cur.goal = cur.f = Math.max(0, Math.min(1, f)); applyDay(); }
  function applyDay() {
    const f = cur.f;
    let i = 0;
    while (i < KEYS.length - 2 && f > KEYS[i + 1].at) i++;
    const A = KEYS[i], B = KEYS[i + 1];
    const k = Math.min(1, Math.max(0, (f - A.at) / (B.at - A.at)));
    mixC(sun.color, A.sun, B.sun, k);
    sun.intensity = A.sunI + (B.sunI - A.sunI) * k;
    const elev = A.elev + (B.elev - A.elev) * k;
    sunDir.set(-0.75, elev, -0.42).normalize();
    mixC(hemi.color, A.sky, B.sky, k);
    mixC(hemi.groundColor, A.gnd, B.gnd, k);
    hemi.intensity = A.hemiI + (B.hemiI - A.hemiI) * k;
    mixC(seaMat.color, A.sea, B.sea, k);
    mixC(scene.fog.color, A.fog, B.fog, k);
    scene.background.copy(scene.fog.color);
    sky.material.uniforms.uFog.value.copy(scene.fog.color);
    renderer.toneMappingExposure = A.exp + (B.exp - A.exp) * k;
    night = Math.max(0, Math.min(1, (f - 0.72) / 0.22));
  }

  function update(t, dt, camTarget) {
    if (Math.abs(cur.goal - cur.f) > 0.0005) { cur.f += (cur.goal - cur.f) * (1 - Math.exp(-dt * 1.2)); applyDay(); }
    waterUniforms.uTime.value = t;
    sea.position.x = Math.round(camTarget.x / 4) * 4;
    sea.position.z = Math.round(camTarget.z / 4) * 4;
    sky.position.copy(camera.position);
    sun.position.copy(focus).addScaledVector(sunDir, 40);
    sun.target.position.copy(focus);
    for (const g of gulls) {
      const u = g.userData;
      const a = u.phase + t * u.speed * u.dir;
      // stay well below the camera so a gull never fills the screen
      const h = Math.min(u.height, camera.position.y * 0.45);
      g.position.set(focus.x + Math.cos(a) * u.radius, h + Math.sin(t * 0.7 + u.phase) * 0.3, focus.z + Math.sin(a) * u.radius);
      g.rotation.y = -a - (u.dir > 0 ? 0 : Math.PI);
      const flap = Math.sin(t * 6 + u.phase) * 0.45 * (Math.sin(t * 0.5 + u.phase) > 0.2 ? 1 : 0.15);
      u.l.rotation.z = flap;
      u.r.rotation.z = -flap;
    }
  }

  resize();
  return { renderer, scene, camera, setFocus, resize, update, setDay, snapDay, get night() { return night; } };
}
