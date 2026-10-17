// Valyria after the Doom - restrained, haunted ruin. Book anchors (all thin): the Fourteen Flames, the Doom that broke the
// peninsula some four centuries before Aegon's Conquest, the boiling Smoking Sea, shattered
// towers glimpsed through fog, fused/black stone and the great stone Valyrian roads. Everything about the plan is interpretation.
// Polish pass: obsidian + ash terrain with cooled-lava veining, HDR-glowing fissures (pulsing), fluted broken towers with fused
// black-glass crowns and frozen drips, road broken exactly where it meets the fissures, drowned towers in the Smoking Sea,
// layered ash/steam, wine-dark light for all four times of day.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat } = K;

// ---- tiny geometry helpers (arbitrary rotation parts for a Batch) --------------------------------------------------------
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
const GEO = {};
const geo = (k, f) => GEO[k] || (GEO[k] = f().toNonIndexed());
const shardG = () => geo('shard', () => new THREE.ConeGeometry(1, 1, 5, 1).translate(0, 0.5, 0));
const cylG = (seg, top) => geo(`cyl${seg}|${top}`, () => new THREE.CylinderGeometry(top, 1, 1, seg, 1).translate(0, 0.5, 0));
const boxG = () => geo('box', () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
function part(b, mat, g, x, y, z, sx, sy, sz, rx, ry, rz, color) {
  _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _m4.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); b.addGeometry(mat, g, _m4, color);
}
const vary = (r, hex, a = 0.12) => { _c.set(hex); const k = 1 + (r() - 0.5) * 2 * a; return _c.clone().multiplyScalar(k); };


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
    const q = ctx.q, root = ctx.root, rng = K.rng(66);
    const cracks = [[[-130, -40], [-60, 10], [-10, 30], [60, 80], [130, 120]], [[-40, -150], [-10, -80], [20, -20], [30, 40], [90, 60]], [[100, -110], [60, -50], [40, -5]]];
    const crackD = (x, z) => { let d = 1e9; for (const c of cracks) d = Math.min(d, K.distToPolyline(x, z, c).d); return d; };
    const flames = Array.from({ length: 14 }, (_, i) => { const a = Math.PI * (1.05 + (i / 13) * 0.9); const r = 250 + rng.range(-20, 60); return [Math.cos(a) * r * 1.2, Math.sin(a) * r, rng.range(55, 110), rng.range(24, 40)]; });
    const heightAt = (x, z) => {
      let h = 3 + (K.fbm(x * 0.02, z * 0.02, 4, 5) - 0.5) * 12 + (K.fbm(x * 0.07, z * 0.07, 2, 2) - 0.5) * 2.5;
      for (const [fx, fz, fh, fr] of flames) { const d = Math.hypot(x - fx, z - fz); if (d < fr * 3) { const cone = fh * Math.pow(Math.max(0, 1 - d / (fr * 2.6)), 1.6); h += cone; if (d < fr * 0.35) h -= (1 - d / (fr * 0.35)) * fh * 0.22; } }
      const d = crackD(x, z); if (d < 17) h -= (1 - K.smoothstep(4, 17, d)) * 9; // wide, flat-floored rifts so the lava ribbons sit cleanly in them
      const s = z - (150 + Math.sin(x * 0.02) * 18 + K.fbm(x * 0.03, 1, 2, 4) * 14); h -= K.smoothstep(-6, 12, s) * 12;
      return h;
    };
    const H = heightAt;
    // ---- terrain: obsidian + ash, rust-stained near the rifts, cooled-lava veins, black glassy wet-look in the trenches
    const ash = new THREE.Color(0x4a4442), ash2 = new THREE.Color(0x5e5652), rust = new THREE.Color(0x7a3c24), char = new THREE.Color(0x1a181c), obs = new THREE.Color(0x0f0e14), ember = new THREE.Color(0xb0481c), c = new THREE.Color();
    root.add(K.terrain({ size: 1000, seg: q.seg(210), heightAt: H, kind: 'rock', scale: 14, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.03, z * 0.03, 3, 4), n2 = K.fbm(x * 0.12, z * 0.12, 2, 8), cd = crackD(x, z);
      c.copy(ash).lerp(ash2, n2).multiplyScalar(0.8 + 0.35 * n);
      c.lerp(rust, K.clamp(K.fbm(x * 0.025, z * 0.025, 2, 9) - 0.42, 0, 0.5) * 1.1);
      const vein = 1 - Math.abs(2 * K.fbm(x * 0.05, z * 0.05, 3, 21) - 1); if (vein > 0.9 && cd < 120) c.lerp(ember, 0.55 * K.smoothstep(0.9, 0.97, vein));   // cooled lava seams
      c.lerp(char, K.clamp(s * 3.2, 0, 0.85));
      if (cd < 26) c.lerp(obs, (1 - K.smoothstep(4, 26, cd)) * 0.9);                                                           // fused glassy black round the rifts
      if (cd < 10) c.lerp(ember, (1 - K.smoothstep(3, 10, cd)) * 0.5);
      for (const [fx, fz, fh, fr] of flames) { const dx = x - fx, dz = z - fz, d = Math.hypot(dx, dz); if (d < fr * 2.4) { const streak = K.fbm(Math.atan2(dz, dx) * 4 + 3, d * 0.04, 2, 33); c.lerp(streak > 0.58 ? ember : char, (1 - d / (fr * 2.4)) * (streak > 0.58 ? 0.55 : 0.6)); } }
      if (h < -2) c.lerp(obs, 0.5);
      return c; } }));
    const wat = K.water({ w: 1000, d: 460, seg: q.seg(120), level: 0, heightAt: H, deep: 0x15191b, shallow: 0x4a5a54, opacity: 0.95, choppy: 0.9, speed: 1.0, center: [0, 400] });
    root.add(wat); ctx.registerWater(wat);

    // ---- materials (near-white tints; colour lives in the per-part colour)
    const glass = flat(0xffffff, { rough: 0.16, metal: 0.12, flatShading: true });
    const fused = tri('rock', { color: 0xe0d8dc, scale: 6, snow: false, bump: 1.1, rough: 0.8 });
    const stone = tri('stone', { color: 0xf0e8e2, scale: 7, snow: false, rough: 0.95, bump: 1.0 });
    const slab = tri('slate', { color: 0xe6e2ea, scale: 6, snow: false, rough: 0.7, bump: 0.7 });
    const lavaM = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, fog: true });
    const HOT = new THREE.Color(2.4, 0.85, 0.2), WARM = new THREE.Color(1.1, 0.22, 0.04), CORE = new THREE.Color(2.6, 1.25, 0.35);
    const STREAK = new THREE.Color(1.8, 0.55, 0.12), b = new Batch(), lb = new Batch();

    // ---- glowing fissures: wide warm bed + bright core, floating just above the rift floor
    cracks.forEach((cr) => {
      const p = K.smoothPath(cr, 8);
      b.ribbon(lavaM, p, 6.5, (x, z) => H(x, z), 0.9, WARM);
      b.ribbon(lavaM, p, 3.0, (x, z) => H(x, z), 1.15, HOT);
      b.ribbon(lavaM, p.filter((_, i) => i % 2 === 0), 1.1, (x, z) => H(x, z), 1.35, CORE);
    });
    // lava runs down the flanks of the Fourteen Flames (faces the ruins)
    { const fr2 = K.rng(404);
      flames.forEach(([fx, fz, fh, fr], i) => { const n = 1 + (i % 3 === 0 ? 1 : 0); for (let k = 0; k < n; k++) {
        const a0 = Math.PI * (0.22 + fr2() * 0.56), ph = fr2() * 6; const pts = [];
        for (let st = 0, r = fr * 0.4; r < fr * 1.9; st++, r += fr * 0.2) { const a = a0 + Math.sin(st * 0.8 + ph) * 0.05; pts.push([fx + Math.cos(a) * r, fz + Math.sin(a) * r]); }
        if (pts.length > 2) { const sp = K.smoothPath(pts, 4); b.ribbon(lavaM, sp, 2.8, (x, z) => H(x, z), 1.3, WARM); b.ribbon(lavaM, sp, 1.0, (x, z) => H(x, z), 1.5, STREAK); } } }); }
    // crater lava pools at the Fourteen Flames
    flames.forEach(([fx, fz, fh, fr], i) => { b.cyl(lavaM, fx, H(fx, fz) + 0.6, fz, fr * 0.2, 0.3, { seg: 12, color: i % 3 ? HOT : CORE }); });

    // ---- fused slag mounds, obsidian shard clusters
    for (let i = 0; i < q.dens(110); i++) {
      const x = rng.range(-170, 170), z = rng.range(-150, 130), y = H(x, z); if (y < -1 || crackD(x, z) < 10) continue;
      if (rng() < 0.5) part(b, fused, geo('sph', () => new THREE.SphereGeometry(1, 8, 5)), x, y - 0.5, z, rng.range(1.5, 5), rng.range(0.6, 1.8), rng.range(1.5, 5), 0, rng() * 6, 0, vary(rng, 0x2a2428, 0.35));
      else { const n = rng.int(3, 6); for (let k = 0; k < n; k++) part(b, glass, shardG(), x + rng.range(-2, 2), y - 0.3, z + rng.range(-2, 2), rng.range(0.4, 0.95), rng.range(2, 7), rng.range(0.4, 0.95), rng.range(-0.35, 0.35), rng() * 6, rng.range(-0.35, 0.35), vary(rng, 0x1c1a2a, 0.35)); }
    }

    // ---- the city's remains ----------------------------------------------------------------------------------------------
    // Fluted, tapering towers: fused plinth, ribbed shaft, string courses, a snapped crown of obsidian shards and frozen drips.
    const R_ = (sd) => 0.5 + 0.28 * K.rng(sd * 7)();
    const brokenTower = (x, z, h, r, seed, y0 = H(x, z)) => {
      const R = K.rng(seed), hh = h * R_(seed);
      b.cyl(fused, x, y0 - 4, z, r * 1.7, 6, { top: 0.82, seg: 12, color: vary(R, 0x2a2428, 0.2) });                     // melted skirt
      b.cyl(stone, x, y0 + 1.5, z, r * 1.05, hh, { top: 0.8, seg: 14, color: vary(R, 0x453e42, 0.15) });
      for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283; part(b, stone, boxG(), x + Math.cos(a) * r * 0.98, y0 + 2, z + Math.sin(a) * r * 0.98, 0.7, hh * (0.88 - R() * 0.1), 0.5, 0, -a + Math.PI / 2, 0, 0x2e282c); } // flutes
      for (const f of [0.3, 0.62]) b.cyl(stone, x, y0 + hh * f, z, r * (1.05 - 0.25 * f) + 0.45, 0.9, { top: 1.0, seg: 14, color: 0x3a3436 });
      const topY = y0 + 1.5 + hh;
      for (let k = 0; k < 6; k++) { const a = k * 1.05 + R() * 0.4, hs = R.range(1.2, 5.5), lean = R.range(0.05, 0.22); part(b, stone, boxG(), x + Math.cos(a) * r * 0.62, topY - hs * 0.6, z + Math.sin(a) * r * 0.62, r * R.range(0.7, 1.0), hs + 1.5, r * 0.5, Math.sin(a) * lean, -a + Math.PI / 2, -Math.cos(a) * lean, vary(R, 0x3a3438, 0.2)); }
      for (let k = 0; k < 3; k++) { const a = R() * 6.283, hs = R.range(5, 10); part(b, glass, shardG(), x + Math.cos(a) * r * 0.5, topY - 2, z + Math.sin(a) * r * 0.5, r * R.range(0.28, 0.45), hs, r * R.range(0.28, 0.45), Math.sin(a) * 0.3, R() * 6, -Math.cos(a) * 0.3, vary(R, 0x1a1626, 0.3)); }
      for (let k = 0; k < 6; k++) { const a = R() * 6.283, yy = y0 + hh * R.range(0.3, 0.95); part(b, glass, geo('sph', () => new THREE.SphereGeometry(1, 8, 5)), x + Math.cos(a) * (r * (1.05 - 0.2 * (yy - y0) / hh) + 0.2), yy, z + Math.sin(a) * (r * (1.05 - 0.2 * (yy - y0) / hh) + 0.2), 0.55, R.range(1.8, 4), 0.55, 0, 0, 0, 0x14121c); } // frozen drips
      // fallen drum lying across the ground, sunk at one end
      const fa = R() * 6.283, dl = R.range(7, 11);
      part(b, stone, cylG(12, 0.95), x + Math.cos(fa) * (r * 2.6 + 4), y0 + r * 0.7, z + Math.sin(fa) * (r * 2.6 + 4), r * 0.85, dl, r * 0.85, 0, -fa, Math.PI / 2 - 0.08, vary(R, 0x504648, 0.15));
      for (let k = 0; k < 7; k++) { const a = R() * 6.283, d = r * R.range(1.8, 4.5); part(b, k % 3 ? stone : fused, boxG(), x + Math.cos(a) * d, y0 - 0.4, z + Math.sin(a) * d, R.range(1, 3), R.range(0.8, 2.4), R.range(1, 3), R.range(-0.3, 0.3), R() * 6, R.range(-0.3, 0.3), vary(R, 0x4a4244, 0.25)); }
    };
    const sites = [[0, 0, 40], [-34, -22, 30], [26, -30, 46], [-12, 38, 26], [52, 10, 32], [-58, 14, 24], [18, 66, 22], [-30, -64, 38], [68, -52, 28], [-84, -40, 20], [92, 36, 24], [-96, 34, 22]];
    sites.forEach(([x, z, h], i) => { if (crackD(x, z) < 20) { /* keep off the rift */ x += 18; } brokenTower(x, z, h, 4 + (i % 3) * 1.2, 700 + i); });
    // foundation outlines of the lost streets: low broken courses, tilted slabs
    for (let i = 0; i < q.dens(120); i++) {
      const x = rng.range(-130, 130), z = rng.range(-110, 100);
      if (crackD(x, z) < 14 || sites.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 14)) continue;
      const w = rng.range(5, 14), ry = (rng.int(0, 3)) * 1.5708 + 0.35 + rng.range(-0.06, 0.06), y = H(x, z);
      part(b, stone, boxG(), x, y - 0.4, z, w, rng.range(0.8, 3.2), rng.range(0.9, 1.4), rng.range(-0.05, 0.05), ry, rng.range(-0.05, 0.12), vary(rng, 0x5a4e4c, 0.2));
      if (rng() < 0.5) part(b, stone, boxG(), x + Math.cos(ry) * w * 0.5, y - 0.4, z - Math.sin(ry) * w * 0.5, rng.range(0.9, 1.4), rng.range(0.8, 2.4), rng.range(4, 9), 0, ry, 0, vary(rng, 0x564a48, 0.2));
    }
    // leaning façade fragments along the southern edge
    for (let i = 0; i < 6; i++) { const x = -70 + i * 26, z = 70 + (i % 2) * 8, y = H(x, z); b.box(stone, x, y - 0.5, z, 10, 5 + (i % 3) * 3, 1.6, i * 0.3, vary(rng, 0x564a48, 0.2), 0, (i - 3) * 0.04); b.box(fused, x + 1, y - 0.5, z, 3, 2, 2.4, i * 0.3, 0x2a2428); }

    // ---- the Valyrian road: jointless dark slabs with kerbs, snapped exactly where it meets the rifts
    const roadA = [-150, -86], roadB = [150, 112], rl = Math.hypot(roadB[0] - roadA[0], roadB[1] - roadA[1]), ux = (roadB[0] - roadA[0]) / rl, uz = (roadB[1] - roadA[1]) / rl;
    let run = [];
    const flush = () => {
      if (run.length > 1) {
        b.ribbon(slab, run, 7, H, 0.3, 0x6a6672);
        for (const sd of [-1, 1]) b.ribbon(slab, run.map(([x, z]) => [x - uz * sd * 3.9, z + ux * sd * 3.9]), 0.9, H, 0.62, 0x3c3840);
        const e0 = run[0], e1 = run[run.length - 1]; for (const e of [e0, e1]) part(b, slab, boxG(), e[0], H(e[0], e[1]) - 0.3, e[1], 7.6, 0.9, 1.1, 0, -Math.atan2(uz, ux), 0.15, 0x2a2630);
      }
      run = [];
    };
    for (let s = 0; s <= rl; s += 5) { const x = roadA[0] + ux * s, z = roadA[1] + uz * s; if (crackD(x, z) < 12) flush(); else run.push([x, z]); }
    flush();
    // monoliths along the road: some standing, some fallen
    for (let s = 14, i = 0; s < rl; s += 22, i++) {
      const x = roadA[0] + ux * s - uz * 6.2 * (i % 2 ? 1 : -1), z = roadA[1] + uz * s + ux * 6.2 * (i % 2 ? 1 : -1);
      if (crackD(x, z) < 14) continue; const y = H(x, z);
      if (i % 3 === 2) part(b, stone, boxG(), x, y + 0.5, z, 1.6, 6.4, 1.6, 0.1, 0.4, Math.PI / 2 - 0.1, 0x403a3c);
      else { b.box(stone, x, y - 0.5, z, 2.1, 1.2, 2.1, 0.4, 0x3a3436); b.box(stone, x, y + 0.6, z, 1.3, 5 + (i % 4), 1.3, 0.4, vary(rng, 0x4e4648, 0.2)); b.cone(glass, x, y + 5.6 + (i % 4), z, 0.9, 1.6, { seg: 4, color: 0x181420 }); }
    }
    // a gate of two stumped pylons straddling the road near the centre
    { const s = rl * 0.43, x = roadA[0] + ux * s, z = roadA[1] + uz * s, y = H(x, z), a = -Math.atan2(uz, ux);
      for (const sd of [-1, 1]) { const px = x - uz * sd * 9, pz = z + ux * sd * 9; b.cyl(stone, px, y - 1, pz, 3.2, 17, { top: 0.82, seg: 8, color: 0x4a4244 }); part(b, glass, shardG(), px, y + 15, pz, 2.4, 6, 2.4, 0.2 * sd, 0, 0.15, 0x1a1624); }
      part(b, stone, boxG(), x - uz * 4.6, y + 13, z + ux * 4.6, 9, 2.4, 2.8, 0, a, 0.26, 0x3c3638); }   // fallen lintel hanging from one pylon

    // ---- Smoking Sea: drowned towers and black basalt stacks poking from the steam
    for (let i = 0; i < 6; i++) { const x = -150 + i * 62 + (i % 2) * 20, z = 176 + (i * 37) % 40, g = H(x, z); brokenTower(x, z, 38 - (i % 3) * 5, 3.6 + (i % 2) * 0.8, 900 + i, g); }
    { const sr = K.rng(12); for (let i = 0; i < 18; i++) { const x = sr.range(-300, 300), z = sr.range(170, 260), g = H(x, z); for (let k = 0; k < 4; k++) b.cyl(fused, x + sr.range(-3, 3), g - 1, z + sr.range(-3, 3), sr.range(1.2, 2.6), sr.range(5, 12) - g, { seg: 6, top: 0.8, color: vary(sr, 0x201c22, 0.25) }); } }
    // far headlands drowned in haze: no hard horizon
    { const fr = K.rng(8), farM = tri('rock', { color: 0xd0c8c8, scale: 40, snow: false });
      for (let i = 0; i < 10; i++) { const a = i * 0.65 + 0.2 + fr() * 0.3, d = fr.range(540, 700), r = fr.range(90, 190); lb.dome(farM, Math.cos(a) * d, -10, -Math.abs(Math.sin(a)) * d, r, { seg: 10, sy: fr.range(0.25, 0.5), color: vary(fr, 0x3a3236, 0.2) }); } }
    root.add(b.build({})); root.add(lb.build({ shadow: false }));

    // ---- life: pulsing lava, crater fires, ash plumes, steam, a flickering ember light, crows
    ctx.onUpdate((dt, t) => { const k = 0.82 + 0.18 * Math.sin(t * 1.3) * Math.sin(t * 0.47 + 1) + 0.05 * Math.sin(t * 6.1); lavaM.color.setScalar(k); });
    const rims = flames.map(([x, z, fh]) => [x, H(x, z) + fh * 0.26, z]);
    const fire = K.fires(rims, { size: 110, light: 0 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const plumes = bbSmoke(rims.map(([x, y, z]) => [x, y + 3, z]), { per: 9, size: 70, rise: 190, spread: 26, color: 0x2e2422, opacity: 0.55, speed: 0.035, seed: 5 }); root.add(plumes);
    const vents = []; for (let i = 0; i < 18; i++) { const cr = cracks[i % 3], p = cr[i % cr.length]; vents.push([p[0] + rng.range(-5, 5), H(p[0], p[1]) + 1, p[1] + rng.range(-5, 5)]); }
    root.add(bbSmoke(vents, { per: 5, size: 13, rise: 44, spread: 7, color: 0x6a4e44, opacity: 0.4, speed: 0.06, seed: 6 }));
    const steam = []; for (let i = 0; i < 22; i++) steam.push([-300 + i * 28, 0.6, 168 + (i % 4) * 12]);
    root.add(bbSmoke(steam, { per: 5, size: 38, rise: 22, spread: 10, color: 0xe4e0da, opacity: 0.3, speed: 0.035, seed: 7 }));
    root.add(K.smoke(sites.slice(0, 6).map(([x, z, h]) => [x, H(x, z) + h * 0.7 + 4, z]), { color: 0x3a3436, size: 18, rise: 22, opacity: 0.2, perStack: 4 }));
    const lights = K.fires(vents.slice(0, 9).map((v) => [v[0], v[1] + 1.5, v[2]]), { size: 11, light: 0, color: 0xff5a14 }); root.add(lights);
    const pl = [[-4, 28, 28], [60, 14, 56]].map(([x, , z]) => { const l = new THREE.PointLight(0xff6a24, q.low ? 0 : 2600, 130, 1.5); l.position.set(x, H(x, z) + 9, z); if (!q.low) root.add(l); return l; });
    ctx.onUpdate((dt, t) => pl.forEach((l, i) => { l.intensity = q.low ? 0 : 2300 + 400 * Math.sin(t * 2.1 + i * 2) * Math.sin(t * 0.8 + i) + 160 * Math.sin(t * 8 + i); }));
    const crows = K.birds({ center: [0, 60, 0], radius: 90, count: q.dens(8), color: 0x161416, size: 1.4, spreadY: 18, seed: 12 }); root.add(crows); ctx.onUpdate((dt, t) => crows.userData.update(t));
    const cl = K.clouds({ y: 230, extent: 800, count: 12, opacity: 0.5, color: 0x3a2c2a }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 300, center: [0, 0, 20], minDistance: 20,
      hero: { pos: [-110, 80, 150], target: [10, 14, -10] },
      climate: { atmos: 'day', weather: 'ash', snow: 0, tint: {
        dawn: { top: 0x3a2c3a, horizon: 0xe09468, fog: 0x8c6458, fogD: 0.0019, sunC: 0xffa070, sunI: 2.1, hemiSky: 0x8a7482, hemiGround: 0x4a3030, hemiI: 0.9 },
        day: { top: 0x5a4a4c, horizon: 0xd08a5a, fog: 0x8a6250, fogD: 0.0017, sunI: 2.1, elev: 0.34, az: 1.0, hemiSky: 0xa4908a, hemiGround: 0x3e2c2a, hemiI: 1.05, sunC: 0xffc096 },
        dusk: { top: 0x1c1216, horizon: 0xaa4a28, fog: 0x5c3428, fogD: 0.002, sunC: 0xff6a30, sunI: 2.0, hemiSky: 0x6e4c52, hemiGround: 0x2e1c1c, hemiI: 0.95 },
        night: { top: 0x07050a, horizon: 0x3c160e, fog: 0x1f100e, fogD: 0.0023, sunC: 0x8a90b8, sunI: 0.9, hemiSky: 0x5a4658, hemiGround: 0x2c1a1a, hemiI: 1.25, exposure: 1.2 },
      } },
      landmarks: {
        'fourteen-flames': lm(flames[7][0], flames[7][1], 40, flames[7][2] * 0.9), 'shattered-towers': lm(0, 0, 30, 40), 'fused-stone': lm(-34, -22, 28, 12),
        'valyrian-road': lm(-44, -40, 20, 6), 'smoking-sea': lm(0, 165, 60, 8), 'fire-fissures': lm(-10, 30, 26, 4),
      },
    };
  },
};
