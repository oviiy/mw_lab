// Port of Ibben - northern whaling harbour in the cold Shivering Sea. Book anchors (thin): Ibben is a rugged island whose burly,
// bearded people are sailors and whalers; the port trades and hunts whales. All layout and building forms are interpretation.
// Polish pass: peat-and-heath hills with granite outcrops, turf-roofed timber longhouses on stone footings, plank quay with
// bollards, barrels and net-sheds, a whole whale carcass on the flensing stage under tackle, a curved whale-rib arch, boulder
// breakwaters with beacon cairns, drifting ice floes, surfacing whale, cold steel light with warm window and try-works glow.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
const GEO = {};
const geo = (k, f) => GEO[k] || (GEO[k] = f().toNonIndexed());
const boxG = () => geo('box', () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
const sphG = () => geo('sph', () => new THREE.SphereGeometry(1, 10, 7));
const cylG = (seg, top) => geo(`cyl${seg}|${top}`, () => new THREE.CylinderGeometry(top, 1, 1, seg, 1).translate(0, 0.5, 0));
const wedgeG = () => geo('wedge', () => new THREE.ConeGeometry(1, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0));
function part(b, mat, g, x, y, z, sx, sy, sz, rx, ry, rz, color) {
  _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _m4.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); b.addGeometry(mat, g, _m4, color);
}
const vary = (r, hex, a = 0.1) => { _c.set(hex); const k = 1 + (r() - 0.5) * 2 * a; return _c.clone().multiplyScalar(k); };
/** Instanced, pulsing sea-foam rings round rocks (one draw call). rings: [[x,z,r]] */
function foamRings(ctx, rings, { y = 0.25, width = 3, opacity = 0.7, speed = 0.9 } = {}) {
  const g = new THREE.RingGeometry(0.9, 1, 28, 1); g.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending, fog: true });
  const n = rings.length * 2, m = new THREE.InstancedMesh(g, mat, n); m.frustumCulled = false; m.renderOrder = 3;
  const o = new THREE.Object3D(), c = new THREE.Color(); ctx.root.add(m);
  ctx.onUpdate((dt, t) => { for (let i = 0; i < n; i++) { const [x, z, r] = rings[i >> 1], ph = ((t * 0.18 * speed + (i & 1) * 0.5 + (i >> 1) * 0.173) % 1), s = r + 1 + ph * width * 2.2; o.position.set(x, y, z); o.scale.set(s, 1, s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); const a = Math.sin(ph * Math.PI) * opacity * 0.5; m.setColorAt(i, c.setRGB(a, a, a)); } m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; });
}


/** Camera-facing smoke/mist billboards (one instanced draw, no point-size cap). emitters: [[x,y,z],...] */
function bbSmoke(emitters, { per = 8, size = 80, rise = 100, spread = 10, color = 0x303030, opacity = 0.5, speed = 0.05, seed = 1 } = {}) {
  const r = K.rng(seed), n = emitters.length * per, base = new Float32Array(n * 3), sd = new Float32Array(n);
  emitters.forEach((e, i) => { for (let k = 0; k < per; k++) { const o = i * per + k; base.set(e, o * 3); sd[o] = (k + r() * 0.5) / per; } });
  const g = new THREE.PlaneGeometry(1, 1); const ig = new THREE.InstancedBufferGeometry(); ig.index = g.index; ig.attributes.position = g.attributes.position; ig.attributes.uv = g.attributes.uv;
  ig.setAttribute('aBase', new THREE.InstancedBufferAttribute(base, 3)); ig.setAttribute('aSeed', new THREE.InstancedBufferAttribute(sd, 1)); ig.instanceCount = n;
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    uniforms: { uTime: K.shared.uTime, uMap: { value: K.spriteTexture() }, uColor: { value: new THREE.Color(color) }, uSize: { value: size }, uRise: { value: rise }, uSpread: { value: spread }, uOpacity: { value: opacity }, uSpeed: { value: speed } },
    vertexShader: `attribute vec3 aBase; attribute float aSeed; uniform float uTime,uSize,uRise,uSpread,uOpacity,uSpeed; varying vec2 vUv; varying float vA; void main(){ float t=fract(uTime*uSpeed+aSeed); vec3 p=aBase; p.y+=t*uRise; p.x+=sin(aSeed*50.0+t*2.0)*uSpread*t+t*uSpread*0.6; p.z+=cos(aSeed*30.0+t*1.5)*uSpread*t*0.6; vec4 mv=viewMatrix*vec4(p,1.0); float s=uSize*(0.35+t*1.1)*(0.8+0.4*fract(aSeed*7.0)); mv.xy+=position.xy*s; gl_Position=projectionMatrix*mv; vUv=uv; vA=sin(t*3.14159)*uOpacity; }`,
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uColor; varying vec2 vUv; varying float vA; void main(){ float a=texture2D(uMap,vUv).a; gl_FragColor=vec4(uColor,a*vA); }` });
  const mesh = new THREE.Mesh(ig, m); mesh.frustumCulled = false; mesh.renderOrder = 4; return mesh;
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, R = K.rng(15);
    const coastAt = (x) => 74 + K.smoothstep(70, 140, Math.abs(x)) * 70 + Math.sin(x * 0.05) * 3;
    const heightAt = (x, z) => {
      const coast = coastAt(x);
      let h = -7 + (1 - K.smoothstep(coast - 14, coast + 4, z)) * 11;
      h += K.smoothstep(-20, -140, z) * 38 * (0.6 + K.fbm(x * 0.012, z * 0.012, 3, 5)) + (K.fbm(x * 0.03, z * 0.03, 3, 2) - 0.5) * 3.5 * (1 - K.smoothstep(coast - 10, coast + 2, z));
      h += K.smoothstep(150, 280, Math.abs(x)) * 28; // rocky shoulders
      return h;
    };
    const H = heightAt;
    // ---- terrain: peat and heath, granite outcrops, pale shingle, wet kelp-dark shallows
    const peat = new THREE.Color(0x5a5a3e), heath = new THREE.Color(0x6a5a48), moss = new THREE.Color(0x56684a), granite = new THREE.Color(0x7c7e82), dkrock = new THREE.Color(0x4a4e54), heather = new THREE.Color(0x6e5470), shingle = new THREE.Color(0xa8a496), wet = new THREE.Color(0x34403f), c = new THREE.Color();
    root.add(K.terrain({ size: 1000, seg: q.seg(210), heightAt: H, kind: 'rock', scale: 14, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.02, z * 0.02, 3, 3), n2 = K.fbm(x * 0.09, z * 0.09, 2, 12);
      c.copy(peat).lerp(moss, K.clamp(n * 1.6 - 0.4, 0, 0.8)).lerp(heath, K.clamp(n2 * 1.5 - 0.5, 0, 0.55)).multiplyScalar(0.85 + 0.3 * n2);
      c.lerp(heather, K.clamp(n2 * 2.0 - 0.9, 0, 0.5) * (1 - K.clamp(s * 3, 0, 1))); c.lerp(granite, K.clamp(s * 3.4 + h * 0.01, 0, 0.9)); if (h > 40) c.lerp(dkrock, K.clamp((h - 40) * 0.02, 0, 0.5));
      if (h < 2.2 && h > -0.3) c.lerp(shingle, 0.7 * K.smoothstep(2.2, 0.8, h));
      if (h < 0.5) c.lerp(wet, K.clamp((0.5 - h) * 0.7, 0, 0.9));
      return c; } }));
    const wat = K.water({ w: 1000, d: 700, seg: q.seg(150), level: 0, heightAt: H, deep: 0x16303a, shallow: 0x3c6a6c, opacity: 0.94, choppy: 0.7, speed: 0.8, center: [0, 330] });
    root.add(wat); ctx.registerWater(wat);

    // ---- materials (near-white tints; colour per part)
    const woodW = tri('wood', { color: 0xf0e8de, scale: 3, snow: false }), woodD = tri('wood', { color: 0xc0b0a0, scale: 4, snow: false, bump: 0.9 }), stone = tri('stone', { color: 0xf0f0f0, scale: 6 }), turf = tri('grass', { color: 0xc8bea0, scale: 4, rough: 1 }), slate = tri('slate', { color: 0xe0e4ea, scale: 5 });
    const bone = flat(0xffffff, { rough: 0.7, flatShading: false }), winG = glow(0xffb85a, 1.15), rig = flat(0xffffff, { rough: 0.9 }), hull = flat(0xffffff, { rough: 0.85 }), cobble = tri('cobble', { color: 0xc8c4b8, scale: 8, snow: true });
    const whaleM = flat(0xffffff, { rough: 0.55, flatShading: false }), cloth = flat(0xffffff, { rough: 1, side: THREE.DoubleSide });
    const b = new Batch(), rb = new Batch();
    const qz = 66; // quay line

    // ---- quay: stone face, plank deck, bollards, lamps, piers with moored whaleboats
    b.box(stone, 0, -0.5, qz - 2, 176, 3.8, 6.4, 0, 0x7a7c80); b.box(woodD, 0, 3.2, qz - 2, 176, 0.35, 6.0, 0, 0x7a6a56);
    for (let x = -84; x <= 84; x += 7) b.cyl(stone, x, 3.4, qz + 0.4, 0.45, 0.9, { seg: 7, top: 0.8, color: 0x2a2a2c });
    for (const x of [-80, -48, -16, 16, 48, 80]) { b.cyl(woodD, x, 3.4, qz - 4.6, 0.14, 4.4, { seg: 5, color: 0x3a2e24 }); b.sphere(winG, x, 7.9, qz - 4.6, 0.5, { seg: 6 }); }
    for (let i = -4; i <= 4; i++) { K.pier(b, i * 18 + 6, 1.8, qz + 0, { len: 26 + (i % 2) * 8, w: 4.5, ry: -Math.PI / 2, mat: woodD, color: 0x6a5a48 }); }
    const boatsAt = [[-30, qz + 12, 0.1], [-12, qz + 22, -0.05], [24, qz + 14, 0.15], [42, qz + 25, 0.0], [66, qz + 16, -0.1], [-66, qz + 13, 0.05]];
    boatsAt.forEach(([x, z, r], i) => { // clinker whaleboats, double-ended
      const col = vary(R, i % 2 ? 0x2a2420 : 0x4a3a2c, 0.1);
      part(b, hull, boxG(), x, 0.0, z, 1.9, 0.55, 5.4, 0, r, 0, col); part(b, hull, boxG(), x, 0.45, z, 2.4, 0.5, 5.0, 0, r, 0, col); part(b, hull, boxG(), x, 0.9, z, 2.5, 0.5, 4.2, 0, r, 0, vary(R, 0x8a6a46, 0.1));
      for (const sd of [-1, 1]) part(b, hull, wedgeG(), x + Math.sin(r) * sd * 2.9, 0.3, z + Math.cos(r) * sd * 2.9, 0.9, 1.7, 0.9, sd * 0.9, r, 0, col);
    });
    // net sheds & boat-houses along the back of the quay
    for (let i = -7; i <= 7; i++) { if (Math.abs(i) < 2) continue; const x = i * 11.5, z = qz - 14 + (i % 2) * 2; if (H(x, z) < 1) continue; K.house(b, x, H(x, z), z, { w: 8.5, d: 6.4, h: 3.6, ry: (i % 3 - 1) * 0.05, style: 'gable', wallMat: woodD, roofMat: slate, wall: vary(R, [0x2a2622, 0x3a3028, 0x4a3c2e][Math.abs(i) % 3], 0.12), roof: 0x3c4046, glowMat: winG }); }
    // ---- flensing wharf: timber stage on piles, the carcass in the water-line, tackle masts and blubber hooks
    const fx = -40, fz = qz + 18;
    b.box(woodW, fx, 1.6, fz, 44, 0.5, 18, 0, 0x7a6850); for (let i = 0; i < 12; i++) for (const sd of [-1, 1]) b.cyl(woodD, fx - 20 + i * 3.7, -3.4, fz + sd * 8.4, 0.4, 5, { seg: 6, color: 0x3a2e24 });
    for (let i = 0; i < 11; i++) b.box(woodW, fx - 20 + i * 4, 2.1, fz, 0.18, 0.1, 18, 0, 0x5a4a38);       // plank seams
    // the whale: slate-blue back, pale belly, flukes, flipper, jaw line
    part(b, whaleM, sphG(), fx - 1, 2.0, fz - 1, 11, 2.6, 3.6, 0, 0.05, 0, 0x34414c);               // back
    part(b, whaleM, sphG(), fx - 1, 1.7, fz - 0.6, 10, 1.7, 3.3, 0, 0.05, 0, 0xcfc8b8);              // belly
    part(b, whaleM, sphG(), fx + 9.5, 2.1, fz - 1.3, 4.6, 2.1, 2.8, 0, 0.05, 0.1, 0x34414c);          // head
    part(b, whaleM, sphG(), fx - 11, 2.0, fz - 1, 4.2, 1.1, 1.5, 0, 0.05, 0.1, 0x34414c);             // tail stock
    for (const sd of [-1, 1]) part(b, whaleM, boxG(), fx - 13.2, 2.0, fz - 1 + sd * 0.4, 4.6, 0.45, 2.1, 0, 0.55 * sd, 0.05, 0x2a3640);   // flukes
    for (let i = 0; i < 5; i++) part(b, bone, boxG(), fx + 3 + i * 1.3, 1.3, fz + 1.15 + i * 0.05, 0.12, 0.08, 0.1, 0, 0, 0, 0xe8e0d0);
    for (let i = 0; i < 8; i++) part(b, whaleM, boxG(), fx + 1 + i * 1.1, 0.9, fz + 1.5, 0.09, 0.07, 2.0, 0, 0.1, 0, 0xb8b2a4);         // throat grooves
    part(b, whaleM, wedgeG(), fx + 3, 1.2, fz + 2.2, 0.8, 3.0, 0.5, 1.0, 0, 0, 0x2a3640);
    for (let i = 0; i < 6; i++) part(b, bone, boxG(), fx + 2 + i * 1.3, 2.9, fz + 0.9, 0.25, 0.12, 3.6, 0, 0.04, 0, 0xe8cdb8);   // flensed blubber strips
    for (const sx of [-15, 15]) { b.cyl(woodD, fx + sx, 2.0, fz - 7, 0.5, 12, { seg: 6, top: 0.7, color: 0x4a3c2e }); part(b, woodD, boxG(), fx + sx - 3.5, 13.6, fz - 7, 7, 0.45, 0.45, 0, 0, 0, 0x4a3c2e); part(b, rig, cylG(5, 1), fx + sx - 3, 6, fz - 7, 0.09, 7.6, 0.09, 0, 0, 0.0, 0x2a2018); b.cyl(rig, fx + sx, 13.2, fz - 7, 0.12, 2.2, { seg: 4, color: 0x2a2018 }); }
    part(b, rig, boxG(), fx - 9, 8, fz - 5, 0.07, 6.2, 0.07, 0.0, 0, 0.5, 0x2a2018); part(b, rig, boxG(), fx + 9, 8, fz - 5, 0.07, 6.2, 0.07, 0.0, 0, -0.5, 0x2a2018);

    // ---- whale-rib arch spanning the harbour road (interpretive): two curved ribs sprung from earth-sunk bases
    const ax = 0, az = 36, ay = H(ax, az), AR = 8.4;
    for (const dz of [-2.2, 2.2]) for (let i = 0; i < 12; i++) {
      const t0 = (i / 12) * Math.PI, t1 = ((i + 1) / 12) * Math.PI, x0 = Math.cos(t0) * AR, y0 = Math.sin(t0) * AR * 1.05, x1 = Math.cos(t1) * AR, y1 = Math.sin(t1) * AR * 1.05, len = Math.hypot(x1 - x0, y1 - y0) * 1.08, tan = Math.atan2(y1 - y0, x1 - x0);
      const th = 1.2 - 0.6 * Math.sin(t0);
      part(b, bone, boxG(), ax + x0, ay - 0.8 + y0, az + dz, Math.max(0.5, th), len, Math.max(0.5, th) * 0.8, 0, 0, tan - Math.PI / 2, 0xe6dcc6);
    }
    for (const sd of [-1, 1]) for (const dz of [-2.2, 2.2]) b.cyl(stone, ax + sd * AR, ay - 1.2, az + dz, 1.3, 1.4, { seg: 7, top: 0.8, color: 0x70727a });
    for (let i = 0; i < 7; i++) { const x = 96 + i * 3.2, z = 88 - i * 1.2; if (H(x, z) < 1.5) continue; part(b, bone, boxG(), x, H(x, z) - 0.6, z, 0.6, 5.6 - Math.abs(i - 3) * 0.3, 0.4, 0, 1.2, -0.28, 0xe6dcc6); } // a fence of ribs by the slip

    // ---- town: turf-roofed timber longhouses on stone footings, up the slope; smoking chimneys
    const pal = [{ wall: 0x8a7458, roof: 0x8a8858 }, { wall: 0x7a6850, roof: 0x9a8a62 }, { wall: 0x9a8466, roof: 0x6e7a52 }, { wall: 0x6e5e4a, roof: 0xa49468 }, { wall: 0x8a8070, roof: 0x7a7c58 }, { wall: 0x5a4a3a, roof: 0x5e6648 }];
    const roadPts = K.smoothPath([[0, qz - 4], [4, 40], [-8, 10], [6, -20], [0, -50]], 6);
    b.ribbon(cobble, roadPts, 6, H, 0.16, 0x9a9486); for (const sd of [-1, 1]) b.ribbon(stone, roadPts.map(([x, z]) => [x + sd * 3.3, z]), 0.7, H, 0.35, 0x5a5c60);
    const hut = [[70, 18], [86, 28], [78, 40]];
    const placed = K.town(b, { rng: K.rng(15), count: q.dens(150), bounds: [-100, -70, 100, 60], minDist: 10.5, size: [5.5, 10], height: [3.3, 5.2], heightAt: H, styles: ['gable', 'longhouse'], palette: pal, wallMat: woodD, roofMat: turf, glowMat: winG, chimneyChance: 0.75, orient: () => R.range(-0.14, 0.14) + Math.round(R()) * Math.PI / 2 * 0, avoid: (x, z) => K.distToPolyline(x, z, roadPts).d < 5.5 || Math.hypot(x - fx, z - fz) < 28 || hut.some(([hx, hz]) => Math.hypot(x - hx, z - hz) < 14) || (Math.abs(x) < 12 && z > 20 && z < 46) || Math.hypot(x - 30, z - 8) < 17, accept: (x, z) => H(x, z) > 0.8 });
    // stone footings under each longhouse + dark timber plates (hides the wall/ground seam, grounds the building)
    for (const p of placed) { part(b, stone, boxG(), p.x, H(p.x, p.z) - 1.4, p.z, p.w + 0.7, 1.6, p.d + 0.7, 0, p.ry, 0, vary(R, 0x6a6c70, 0.12)); }
    // the moot-hall: one great longhouse with crossed gable-horns, above the harbour road (interpretive)
    { const hx = 30, hz = 8, hy = H(hx, hz);
      part(b, stone, boxG(), hx, hy - 1.6, hz, 22.4, 1.8, 9.2, 0, 0.05, 0, 0x6a6c70); part(b, woodD, boxG(), hx, hy - 0.4, hz, 21, 6, 8, 0, 0.05, 0, 0x4a3a2c);
      part(b, turf, geo('prism', () => { const sh = new THREE.Shape(); sh.moveTo(-0.5, 0); sh.lineTo(0.5, 0); sh.lineTo(0, 1); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -0.5); g.rotateY(Math.PI / 2); return g; }), hx, hy + 5.6, hz, 24, 6.4, 11, 0, 0.05, 0, 0x7a7a52);
      for (const sd of [-1, 1]) for (const k of [-1, 1]) part(b, woodD, boxG(), hx + sd * 12.0, hy + 11.2, hz - sd * 0.6, 0.35, 3.2, 0.35, 0, 0.05, k * 0.55, 0x2a2018);
      b.box(winG, hx + 0.5, hy - 0.3, hz + 4.1, 2.2, 3.4, 0.12, 0.05); for (let k = -3; k <= 3; k++) if (k) b.box(winG, hx + k * 2.6, hy + 2.2, hz + 4.1, 0.9, 1.1, 0.12, 0.05);
      b.cyl(stone, hx + 6, hy + 6, hz - 0.5, 0.9, 5, { seg: 7, top: 0.8, color: 0x6a6a6c }); }
    // try-works: stone rendering sheds with vents, tall chimneys, glowing furnace doors
    hut.forEach(([x, z], i) => { const y = H(x, z);
      b.box(stone, x, y - 1.4, z, 12, 7.2, 9, 0.1, 0x8a8a8c); b.prism(slate, x, y + 5.5, z, 13.4, 4, 10.4, 0.1, 0x363c42);
      b.cyl(stone, x + 3, y + 5, z, 1.3, 10, { top: 0.78, seg: 7, color: 0x7a7a7c }); b.cyl(slate, x + 3, y + 15, z, 1.1, 0.6, { top: 1.3, seg: 7, color: 0x30343a });
      b.box(winG, x + 6.02, y + 0.2, z - 1, 0.1, 3.2, 2.4, 0.1); b.box(winG, x - 3, y + 2, z + 4.56, 2.6, 1.6, 0.1, 0.1);
      for (let k = 0; k < 4; k++) b.cyl(woodD, x - 4 + k * 1.3, y, z + 6.5, 0.55, 1.1, { seg: 7, color: 0x3a2e24 });  // oil barrels
    });
    // drying racks hung with blubber & fish; stacked barrels and crates on the quay
    for (let i = 0; i < 6; i++) { const x = 96 + (i % 3) * 5.5, z = 52 + ((i / 3) | 0) * 7, y = H(x, z); for (const s of [-2.1, 2.1]) b.cyl(woodD, x + s, y, z, 0.17, 3.6, { seg: 4, color: 0x4a3c2e }); b.box(woodD, x, y + 3.5, z, 4.8, 0.2, 0.2, 0, 0x4a3c2e); for (let k = 0; k < 5; k++) b.box(bone, x - 1.8 + k * 0.9, y + 1.7, z, 0.28, 1.8, 0.1, 0, k % 2 ? 0xd8c8a8 : 0x9a6a50); }
    const barrels = new Inst(G.cyl(9, 0.92), woodD), crates = new Inst(G.box(), woodW);
    for (let i = 0; i < 46; i++) { const x = -78 + R() * 156, z = qz - 3.6 + R() * 2.4; if (Math.abs(x - fx) < 20 && R() < 0.6) continue; barrels.add(x, 3.4, z, 0.55, 1.1, 0.55, R() * 6, vary(R, 0x4a3828, 0.2)); if (R() < 0.3) barrels.add(x + 0.7, 3.4, z + 0.6, 0.55, 1.1, 0.55, R() * 6, vary(R, 0x4a3828, 0.2)); }
    for (let i = 0; i < 14; i++) { const x = -70 + R() * 140, z = qz - 1.2 + R() * 1.4; crates.add(x, 3.4, z, 1.3, 1.1, 1.3, R() * 6, vary(R, 0x7a6850, 0.15)); }
    // ---- breakwaters: boulder-and-timber arms curving out from the shoulders, with beacon cairns
    for (const sg of [-1, 1]) {
      const arm = [[sg * 104, 104], [sg * 96, 116], [sg * 82, 125], [sg * 66, 130]];
      K.wall(b, arm, { h: 10.5, t: 5.5, mat: stone, capMat: stone, heightAt: H, crenel: false, sink: 4, color: 0x70747a });
      const rr2 = K.rng(30 + sg); for (let k = 0; k < 26; k++) { const t = k / 25, p = K.smoothPath(arm, 4)[Math.min(Math.floor(t * 12), 12)] || arm[0]; part(rb, stone, sphG(), p[0] + rr2.range(-3.6, 3.6), -0.6 + rr2.range(-0.4, 1.4), p[1] + rr2.range(-3.6, 3.6), rr2.range(1.4, 3.0), rr2.range(0.9, 2), rr2.range(1.4, 3.0), 0, rr2() * 6, 0, vary(rr2, 0x6a6e74, 0.18)); }
      const [tx, tz] = arm[3]; b.cyl(stone, tx, -1, tz, 3.6, 12, { seg: 8, top: 0.7, color: 0x6a6e74 }); b.cyl(stone, tx, 11, tz, 3.2, 0.8, { seg: 8, top: 1.2, color: 0x4a4e54 }); b.box(winG, tx, 11.8, tz, 1.6, 1.4, 1.6, 0);
    }
    root.add(b.build({})); root.add(rb.build({ shadow: false }));
    const bm = barrels.build(), cm = crates.build(); root.add(bm); root.add(cm);

    // ---- boulders on the slopes and shore (instanced), a few skerries with foam
    { const bo = new Inst(G.sphere(7), tri('rock', { color: 0xe0e0e4, scale: 6, bump: 1.1 })), br = K.rng(63), sk = [];
      for (let i = 0; i < q.dens(240); i++) { const x = br.range(-260, 260), z = br.range(-200, 100), h = H(x, z); if (h < 0.2 || (Math.abs(x) < 100 && z > -40 && z < 66)) continue; const k = br.range(0.8, 3.4); bo.add(x, h - k * 0.3, z, k * br.range(0.9, 1.5), k * br.range(0.5, 0.9), k * br.range(0.9, 1.5), br() * 6, vary(br, 0x6c6e72, 0.2)); }
      for (let i = 0; i < 12; i++) { const x = br.range(-210, 210), z = br.range(150, 215); if (Math.abs(x) < 100 && z < 200) continue; const k = br.range(2.5, 6); bo.add(x, -2.5, z, k, k * 0.9, k * 1.1, br() * 6, 0x3a3e44); sk.push([x, z, k * 1.4]); }
      root.add(bo.build()); foamRings(ctx, sk); }
    // sparse pines on the slopes
    root.add(K.forest({ rng: K.rng(33), count: q.dens(300), bounds: [-300, -250, 300, -30], heightAt: H, species: 'pine', snow: true, minDist: 6, avoid: (x, z) => Math.abs(x) < 105 && z > -80 }));

    // ---- life: whalers, surfacing whale, ice floes, smoke, fires, gulls, walkers
    const sh = [['cog', -90, 150, 0.4], ['cog', -30, 160, 3.4], ['longship', 40, 148, 1.6], ['cog', 100, 168, 2.2], ['longship', -130, 178, 0.9]].map(([tp, x, z, ry], i) => { const s = K.ship(tp, { len: 17, hull: 0x2e2218, sail: i % 2 ? 0xa8a498 : 0x8f8c80, sailColor2: 0x8a8a7a }); s.position.set(x, 0.1, z); s.rotation.y = ry; s.userData.b = x; root.add(s); return s; });
    const whale = new THREE.Group(); { const wb = new Batch(); part(wb, whaleM, sphG(), 0, 0, 0, 5.2, 1.5, 1.8, 0, 0, 0, 0x2a3640); part(wb, whaleM, sphG(), 3.4, 0, 0, 1.8, 1.1, 1.3, 0, 0, 0, 0x2a3640); part(wb, whaleM, wedgeG(), -5.4, -0.2, 0, 0.6, 2.2, 0.35, 0, 0, 1.2, 0x222e38); part(wb, whaleM, wedgeG(), -5.4, 0, 0.9, 0.5, 1.8, 0.35, 1.2, 0, 1.2, 0x222e38); whale.add(wb.build({ shadow: false })); }
    root.add(whale);
    const floes = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 0.85, 0.5, 7), new THREE.MeshStandardMaterial({ color: 0xe6f0f4, roughness: 0.35, flatShading: true }), 16), fd = []; { const fr = K.rng(77); for (let i = 0; i < 16; i++) fd.push({ x: fr.range(-260, 260), z: fr.range(210, 330), s: fr.range(2.5, 7), sp: fr.range(0.4, 1.0), ph: fr() * 6 }); }
    floes.frustumCulled = false; root.add(floes);
    const o = new THREE.Object3D();
    ctx.onUpdate((dt, t) => {
      sh.forEach((s, i) => { K.animateShip(s, t, i); s.position.x = s.userData.b + Math.sin(t * 0.07 + i) * 4; });
      const ph = (t * 0.1) % 1, up = Math.max(0, Math.sin(ph * Math.PI * 2)); whale.visible = up > 0.02; whale.position.set(-170 + ph * 40, -1.4 + up * 1.7, 232); whale.rotation.set(0, 0.3, Math.cos(ph * Math.PI * 2) * -0.35);
      fd.forEach((f, i) => { o.position.set(((f.x + t * f.sp + 260) % 520) - 260, -0.1 + Math.sin(t * 0.5 + f.ph) * 0.12, f.z); o.rotation.set(0, f.ph + t * 0.02, 0); o.scale.set(f.s, 1, f.s * 0.8); o.updateMatrix(); floes.setMatrixAt(i, o.matrix); });
      floes.instanceMatrix.needsUpdate = true;
    });
    const smk = placed.filter((_, i) => i % 3 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 4, p.z]);
    root.add(K.smoke(smk, { size: 20, rise: 16, opacity: 0.42, color: 0xd0d0cc }));
    root.add(bbSmoke(hut.map(([x, z]) => [x + 3, H(x, z) + 16, z]), { per: 8, size: 9, rise: 34, spread: 6, color: 0x7a7876, opacity: 0.5, speed: 0.07, seed: 3 }));
    const fire = K.fires([[70, H(70, 18) + 2, 24], [-48, 8.2, qz - 4.6], [48, 8.2, qz - 4.6], [fx, 4.2, fz + 9], [sgn(-1)[0], 14, sgn(-1)[1]], [sgn(1)[0], 14, sgn(1)[1]]], { size: 8, light: q.low ? 0 : 2, intensity: 30 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const gulls = K.birds({ center: [0, 40, 70], radius: 90, count: q.dens(16), color: 0xe8e8e4, size: 1.2, spreadY: 12, seed: 8 }); root.add(gulls); ctx.onUpdate((dt, t) => gulls.userData.update(t));
    const wk = K.walkers({ paths: [roadPts, [[-70, qz - 3], [80, qz - 3]], [[-60, qz + 18], [-20, qz + 18]]], heightAt: H, count: q.dens(26), rng: K.rng(5), colors: [0x4a4030, 0x5a6a70, 0x7a4a30, 0x3a3a3a, 0x8a8070], lift: 0.3 }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const cl = K.clouds({ y: 240, extent: 800, count: 12, opacity: 0.5, color: 0xcfd5d8 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 250, center: [0, 0, 30], minDistance: 18,
      hero: { pos: [-140, 90, 190], target: [10, 4, 20] },
      climate: { atmos: 'day', weather: 'clear', snow: 0.22, tint: {
        dawn: { top: 0x5a6a92, horizon: 0xe8b8b0, fog: 0xc4a8b0, fogD: 0.0018, sunC: 0xffc0a0, sunI: 2.2, hemiSky: 0x9aa8cc, hemiGround: 0x4a4a52, hemiI: 0.85 },
        day: { top: 0x587890, horizon: 0xc8d4da, fog: 0xb4c2ca, fogD: 0.0017, sunI: 1.8, elev: 0.4, hemiSky: 0xa4b8cc, hemiGround: 0x4a4e48, hemiI: 1.05, sunC: 0xf4f2ee },
        dusk: { top: 0x26346a, horizon: 0xd8907c, fog: 0x8c7c88, fogD: 0.002, sunC: 0xff9a70, sunI: 2.0, hemiSky: 0x7c88b8, hemiGround: 0x403c48, hemiI: 0.95 },
        night: { top: 0x070c24, horizon: 0x24345c, fog: 0x16223c, fogD: 0.0023, sunC: 0x9ab4f0, sunI: 1.3, hemiSky: 0x5a6cac, hemiGround: 0x20283c, hemiI: 1.4, exposure: 1.2 },
      } },
      landmarks: { 'whaling-harbour': lm(0, qz + 25, 40, 8), 'flensing-wharf': lm(fx, fz, 20, 12), 'rendering-sheds': lm(78, 28, 20, 18), 'harbour-town': lm(-10, -10, 40, 10), 'breakwater': lm(-90, 118, 22, 12), 'whale-bone-arch': lm(0, 36, 12, 14) },
    };
    function sgn(sg) { return sg < 0 ? [-66, 130] : [66, 130]; }
  },
};
