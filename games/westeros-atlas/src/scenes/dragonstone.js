// Dragonstone — volcanic island fortress. Book anchors: the island at the mouth of Blackwater Bay, the smoking mountain Dragonmont, a black castle whose
// towers, walls and gargoyles are carved as dragons, the Stone Drum (central keep), the Sea Dragon Gate, the Chamber of the Painted Table, a harbour town below.
// Everything else (plan, positions, shapes) is artistic interpretation — see content/dragonstone.js.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const MT = [-80, -60], CS = [112, -4], SDG = [172, 34], HARB = [-4, 148];
const fixInst = (o) => { o.traverse((m) => { if (m.isInstancedMesh && !m.geometry.attributes.color) { const n = m.geometry.attributes.position.count; m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3).fill(1), 3)); } }); return o; };

const _jc = new THREE.Color();
/** Deterministic colour variation around a hex value (per-building weathering). */
const vary = (r, hex, a = 0.1) => { _jc.set(hex); const k = 1 + (r() - 0.5) * 2 * a; _jc.r = Math.min(1, _jc.r * k * (1 + (r() - 0.5) * a)); _jc.g = Math.min(1, _jc.g * k); _jc.b = Math.min(1, _jc.b * k * (1 + (r() - 0.5) * a)); return _jc.getHex(); };
/** Instanced, pulsing sea-foam rings (one draw call). rings: [[x,z,r]] */
function foamRings(ctx, rings, { y = 0.3, width = 3, opacity = 0.5, speed = 0.9 } = {}) {
  const g = new THREE.RingGeometry(0.9, 1, 28, 1); g.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending, fog: true });
  const n = rings.length * 2, m = new THREE.InstancedMesh(g, mat, n); m.frustumCulled = false; m.renderOrder = 3;
  const o = new THREE.Object3D(), c = new THREE.Color();
  ctx.root.add(m);
  ctx.onUpdate((dt, t) => {
    for (let i = 0; i < n; i++) {
      const [x, z, r] = rings[i >> 1], ph = ((t * 0.18 * speed + (i & 1) * 0.5 + (i >> 1) * 0.173) % 1);
      const s = r + 1 + ph * width * 2.2;
      o.position.set(x, y, z); o.scale.set(s, 1, s); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      const a = Math.sin(ph * Math.PI) * opacity * 0.55; m.setColorAt(i, c.setRGB(a, a, a));
    }
    m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true;
  });
}

/** A carved dragon (gargoyle): haunches, S-curved neck, horned head with open jaw, spined back, folded wings. Faces local +X, base at y. */
function drake(b, mat, x, y, z, ry, s = 1, color = 0xffffff, eye = null) {
  const c = Math.cos(ry), sn = Math.sin(ry), P = (lx, lz) => [x + lx * c + lz * sn, z - lx * sn + lz * c];
  const bx = (lx, ly, lz, w, h, d, rz = 0, rx = 0) => { const [px, pz] = P(lx * s, lz * s); b.box(mat, px, y + ly * s, pz, w * s, h * s, d * s, ry, color, rx, rz); };
  bx(0, 0, 0, 3.6, 1.7, 1.6);                // torso
  bx(-1.6, 0.3, 0, 2.2, 1.2, 1.3, -0.15);    // haunch
  bx(-3.0, 0.2, 0, 2.4, 0.6, 0.6, 0.25); bx(-4.6, 0.7, 0, 1.8, 0.35, 0.35, 0.5);    // tail
  bx(1.5, 1.0, 0, 1.5, 0.95, 0.95, 0.75); bx(2.2, 1.9, 0, 1.4, 0.85, 0.85, 0.25); bx(2.7, 2.5, 0, 1.3, 0.8, 0.8, -0.15); // neck
  bx(3.5, 2.55, 0, 2.0, 0.85, 1.0, -0.12);   // skull + snout
  bx(3.7, 2.1, 0, 1.6, 0.28, 0.7, 0.18);     // lower jaw (open)
  for (const sd of [-1, 1]) {
    bx(2.6, 3.2, sd * 0.4, 0.2, 0.2, 1.4, 0); // brow ridge
    bx(2.4, 3.2, sd * 0.35, 1.5, 0.16, 0.16, -0.9); // swept horns
    bx(0.3, 0.9, sd * 1.5, 0.35, 0.35, 2.8, 0, sd * 0.2); // wing arm
    bx(0.1, 0.9, sd * 2.9, 2.6, 0.12, 1.8, 0, sd * 0.45); // wing membrane (folded)
    bx(-0.9, 0.8, sd * 2.6, 2.0, 0.12, 1.2, 0, sd * 0.55);
  }
  for (let i = 0; i < 4; i++) bx(-1.4 + i * 1.0, 1.7, 0, 0.35, 0.5, 0.2, 0.2); // back spines
  if (eye) { const [px, pz] = P(3.95 * s, 0.52 * s), [qx, qz] = P(3.95 * s, -0.52 * s); b.box(eye, px, y + 2.95 * s, pz, 0.34 * s, 0.22 * s, 0.1 * s, ry); b.box(eye, qx, y + 2.95 * s, qz, 0.34 * s, 0.22 * s, 0.1 * s, ry); }
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rng = K.rng(21);
    // ---- terrain: island, Dragonmont cone with crater, castle headland, harbour cove ----------------------------------------
    const Rof = (ang) => 215 + (K.fbm(Math.cos(ang) * 1.6 + 5, Math.sin(ang) * 1.6 + 5, 3, 5) - 0.5) * 120;
    const heightAt = (x, z) => {
      const d0 = Math.hypot(x, z), ang = Math.atan2(z, x);
      const R = Rof(ang);
      const isl = K.smoothstep(R, R * 0.86, d0);
      const ridge = 1 - Math.abs(2 * K.fbm(x * 0.03, z * 0.03, 3, 11) - 1);
      let h = -11 + isl * (40 + (K.fbm(x * 0.02, z * 0.02, 3, 4) - 0.5) * 14 + ridge * ridge * 9);
      const dm = Math.hypot(x - MT[0], z - MT[1]);
      const cone = Math.pow(1 - K.smoothstep(8, 175, dm), 1.8);
      h += cone * (125 + (K.fbm(x * 0.05, z * 0.05, 4, 2) - 0.5) * 60) * (0.9 + 0.2 * K.noise2(Math.atan2(z - MT[1], x - MT[0]) * 3, dm * 0.03));
      h -= (1 - K.smoothstep(0, 24, dm)) * 34;
      const dc = Math.hypot(x - CS[0], z - CS[1]); h += 24 * (1 - K.smoothstep(66, 120, dc)) * isl;
      const cv = Math.hypot(x - HARB[0], (z - HARB[1]) * 0.7); h = K.lerp(h, -4, 1 - K.smoothstep(26, 58, cv));
      h += (K.fbm(x * 0.12, z * 0.12, 2, 9) - 0.5) * 2.2 * K.smoothstep(0, 30, h);
      return h;
    };
    const H = heightAt;
    const rock = new THREE.Color(0x484852), rock2 = new THREE.Color(0x33333e), ash = new THREE.Color(0x5e6068), ember = new THREE.Color(0x7a2e16), grey = new THREE.Color(0x8a8582), scree = new THREE.Color(0x77716c), heath = new THREE.Color(0x3c3e40), moss = new THREE.Color(0x34403a), wet = new THREE.Color(0x1f2128), c = new THREE.Color();
    const terr = K.terrain({ size: 1400, seg: q.seg(190), heightAt, kind: 'rock', scale: 30, colorAt: (x, z, h, s) => {
      const f = K.fbm(x * 0.03, z * 0.03, 2, 3), g = K.fbm(x * 0.11, z * 0.11, 2, 17), pp = K.fbm(x * 0.018, z * 0.018, 3, 31);
      c.copy(rock).lerp(rock2, g * 0.9);
      c.multiplyScalar(0.86 + 0.24 * (0.5 + 0.5 * Math.sin(h * 0.85 + f * 4)));                // basalt strata
      if (s < 0.12 && h > 2.5 && h < 34) c.lerp(pp > 0.5 ? moss : heath, K.clamp((pp - 0.42) * 3.2, 0, 0.75));  // heather + moss patches on gentle ground
      c.lerp(ash, K.clamp(f * 1.4 - 0.25, 0, 0.7) * (0.35 + K.smoothstep(40, 110, h) * 0.9));    // ash drift, thicker high up
      if (s > 0.22) c.lerp(scree, K.clamp((s - 0.22) * 3, 0, 0.6) * (0.5 + g));                  // scree on the steeps
      const dm = Math.hypot(x - MT[0], z - MT[1]); c.lerp(ember, (1 - K.smoothstep(6, 38, dm)) * 0.85);
      const vein = 1 - Math.abs(2 * K.fbm(x * 0.045, z * 0.045, 3, 53) - 1); if (vein > 0.93 && dm < 130 && h > 20) c.lerp(ember, 0.7);   // cooled lava seams
      if (h < 3.2) c.lerp(grey, K.smoothstep(3.2, 1.2, h) * 0.5); if (h < 0.5) c.lerp(wet, K.smoothstep(0.5, -1.5, h) * 0.8); // pale shingle then wet rock
      return c.lerp(grey, K.clamp((h - 90) * 0.01, 0, 0.25));
    } });
    root.add(terr);
    const wat = K.water({ w: 1400, d: 1400, seg: q.seg(120), level: 0, heightAt, deep: 0x0a1822, shallow: 0x3a5c60, opacity: 0.95, choppy: 1.0, speed: 0.8 });
    root.add(wat); ctx.registerWater(wat);
    const farSea = K.water({ w: 7000, d: 7000, seg: 6, level: -0.4, heightAt: () => -20, deep: 0x0a1822, shallow: 0x0a1822, opacity: 0.95, choppy: 1.0, speed: 0.8 }); root.add(farSea); ctx.registerWater(farSea);

    // ---- materials -------------------------------------------------------------------------------------------------
    const T = (k, color, scale = 7, o = {}) => tri(k, { color, scale, snow: false, ...o });
    const black = T('stone', 0x4b4a52, 8), blackD = T('stone', 0x333238, 8), slate = T('slate', 0x2e2d34, 6), wood = T('wood', 0x4e3a28, 4), thatch = T('thatch', 0x6e6246, 5), basalt = T('rock', 0x3a383e, 10);
    const trim = T('stone', 0x7a7880, 8), mossM = T('rock', 0x3e4a38, 8), redSlate = T('slate', 0x4a2a2e, 6), ironM = flat(0x2a2a30, { rough: 0.5, metal: 0.6 });
    const ember2 = glow(0xff5a1a, 1.7), windowG = glow(0xffa84a, 1.15), eye = glow(0xff3a10, 1.8), lavaG = glow(0xff4a12, 2.0);
    const b = new Batch(), vr = K.rng(77);

    // ---- castle: curtain wall following the headland, dragon towers, gargoyles --------------------------------------------------
    const ring = Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2, jr = 1 + 0.07 * Math.sin(i * 2.3); return [CS[0] + Math.cos(a) * 66 * jr, CS[1] + Math.sin(a) * 46 * jr]; });
    K.wall(b, ring, { h: 15, t: 4.5, mat: black, capMat: blackD, heightAt, closed: true, sink: 6 });
    ring.forEach(([x, z], i) => {
      const y = H(x, z), col = vary(vr, 0xffffff, 0.14), tall = 30 + (i % 4) * 5;
      if (i % 2 === 0) {
        K.tower(b, x, z, { r: 4.4, h: tall, y, mat: black, roofMat: i % 4 === 0 ? redSlate : slate, roof: 'spire', roofH: 16, seg: 10, windows: false, color: col });
        b.cyl(trim, x, y + tall * 0.55, z, 4.4 * (1 - 0.14 * 0.55) + 0.35, 1.0, { seg: 10, top: 1.04 }); b.cyl(trim, x, y + tall - 0.1, z, 4.4 * 0.86 + 0.7, 1.0, { seg: 10, top: 1.1 }); // string courses
        b.box(windowG, x + Math.cos(i) * 4.1, y + tall * 0.35, z + Math.sin(i) * 4.1, 0.6, 2.2, 0.3, -i + Math.PI / 2);
        b.cone(trim, x, y + tall + 15.5, z, 0.55, 3, { seg: 6 });  // finial
      } else K.squareTower(b, x, z, { w: 7, h: 22, y, mat: blackD, roofMat: slate, roof: 'flat', windows: false, color: col });
      b.cyl(mossM, x, y - 1, z, 5.4, 4.2, { seg: 10, top: 0.85 });                                   // sea-stained, mossy footing
      const a = Math.atan2(z - CS[1], x - CS[0]);
      drake(b, blackD, x + Math.cos(a) * 5, y + (i % 2 === 0 ? tall + 0.4 : 22.2), z + Math.sin(a) * 5, -a, 1.4, 0xffffff, eye);
    });
    // wall-top gargoyles: a drake every ~16 units, plus corbelled arrow-slit glows
    for (let i = 0; i < ring.length; i++) {
      const A = ring[i], B = ring[(i + 1) % ring.length], n = Math.floor(Math.hypot(B[0] - A[0], B[1] - A[1]) / 16);
      for (let k = 1; k <= n; k++) { const t = k / (n + 1), x = A[0] + (B[0] - A[0]) * t, z = A[1] + (B[1] - A[1]) * t, a = Math.atan2(z - CS[1], x - CS[0]); drake(b, blackD, x, Math.max(H(A[0], A[1]), H(B[0], B[1])) + 15.2, z, -a, 0.9, 0xffffff, eye);
        b.box(windowG, x + Math.cos(a) * 2.3, Math.max(H(A[0], A[1]), H(B[0], B[1])) + 8, z + Math.sin(a) * 2.3, 0.35, 2.4, 0.5, -a); }
    }
    // The Stone Drum: a vast, squat drum keep, crowned with a collar of carved dragons
    const sy = H(CS[0], CS[1]);
    b.cyl(blackD, CS[0], sy - 3, CS[1], 26, 7, { seg: 22, top: 0.92 });                                          // splayed, wave-darkened plinth
    b.cyl(black, CS[0], sy + 3.5, CS[1], 23, 42.5, { seg: 22, top: 0.9 }); b.cyl(blackD, CS[0], sy + 43, CS[1], 22, 2.4, { seg: 22, top: 1.12 });
    for (const yy of [14, 28]) b.cyl(trim, CS[0], sy + yy, CS[1], 23 * (1 - 0.1 * (yy / 45)) + 0.45, 1.1, { seg: 22, top: 1.03 });
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2 + 0.1, rr0 = 23 - 0.1 * 23 * 0.3; b.box(blackD, CS[0] + Math.cos(a) * rr0, sy, CS[1] + Math.sin(a) * rr0, 2.2, 42, 2.4, -a + Math.PI / 2, 0xffffff, 0, 0); } // buttress ribs
    b.cyl(black, CS[0], sy + 45.4, CS[1], 14, 12, { seg: 16, top: 0.9 }); b.cyl(trim, CS[0], sy + 56.8, CS[1], 13.1, 1.0, { seg: 16, top: 1.06 }); b.dome(slate, CS[0], sy + 57.8, CS[1], 14.6, { seg: 16, sy: 0.6 });
    b.cone(ironM, CS[0], sy + 65, CS[1], 0.7, 7, { seg: 6 });
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; drake(b, blackD, CS[0] + Math.cos(a) * 23.5, sy + 45.4, CS[1] + Math.sin(a) * 23.5, -a, 1.7, 0xffffff, eye); }
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 + 0.2; b.box(windowG, CS[0] + Math.cos(a) * 22.6, sy + 18 + (k % 3) * 8, CS[1] + Math.sin(a) * 22.6, 1.2, 4.4, 0.3, -a + Math.PI / 2); }
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.5; b.box(windowG, CS[0] + Math.cos(a) * 13.3, sy + 49 + (k % 2) * 3, CS[1] + Math.sin(a) * 13.3, 0.9, 3, 0.3, -a + Math.PI / 2); }
    // inner halls, barracks, kitchens, a great hall: low black slate roofs
    const hall = (x, z, w, d, h, ry) => K.house(b, x, H(x, z), z, { w, d, h, ry, style: 'gable', wallMat: black, roofMat: vr() < 0.4 ? redSlate : slate, wall: vary(vr, 0xffffff, 0.14), roof: vary(vr, 0xffffff, 0.12), glowMat: windowG, chimney: true });
    hall(CS[0] - 36, CS[1] - 10, 26, 13, 11, 0.1); hall(CS[0] + 34, CS[1] - 14, 20, 11, 9, -0.3); hall(CS[0] - 8, CS[1] + 33, 24, 12, 9, 0); hall(CS[0] + 30, CS[1] + 22, 16, 10, 8, 0.4); hall(CS[0] - 30, CS[1] + 26, 14, 10, 8, -0.2);
    // Sea Dragon Gate: great gateway whose arch is the open jaws of a sea dragon, facing the water on a stair down to a dock
    const gy = H(SDG[0], SDG[1]), ga = Math.atan2(SDG[1] - CS[1], SDG[0] - CS[0]);
    const gx = (lx, lz) => [SDG[0] + lx * Math.sin(ga) + lz * Math.cos(ga), SDG[1] - lx * Math.cos(ga) + lz * Math.sin(ga)];
    for (const sg of [-1, 1]) { const [x, z] = gx(sg * 9, 0); b.box(black, x, gy - 4, z, 6, 30, 16, -ga + Math.PI / 2); const [x2, z2] = gx(sg * 9, 8); b.cone(blackD, x2, gy + 26, z2, 1.8, 10, { seg: 6 }); }
    { const [x, z] = gx(0, 0); b.box(black, x, gy + 17, z, 14, 8, 16, -ga + Math.PI / 2); b.box(blackD, x, gy + 25, z, 16, 6, 16, -ga + Math.PI / 2);
      const [hx, hz] = gx(0, 9); b.box(blackD, hx, gy + 21, hz, 12, 7, 6, -ga + Math.PI / 2); b.box(eye, ...(() => { const [ex, ez] = gx(3, 12.1); return [ex, gy + 26, ez]; })(), 1.4, 1, 0.3, -ga + Math.PI / 2); b.box(eye, ...(() => { const [ex, ez] = gx(-3, 12.1); return [ex, gy + 26, ez]; })(), 1.4, 1, 0.3, -ga + Math.PI / 2);
      for (let i = -3; i <= 3; i++) { const [tx, tz] = gx(i * 1.5, 12.2); b.cone(T('marble', 0xcfc8b8, 4), tx, gy + 16.8, tz, 0.35, 2.6, { seg: 4, color: 0xffffff }); } // fangs
      const [ex, ez] = gx(0, 10); b.box(flat(0x08070a), ex, gy, ez, 7, 14, 6, -ga + Math.PI / 2); }
    for (let i = 0; i < 26; i++) { const [x, z] = gx(0, 12 + i * 1.6), hh = Math.max(H(x, z), 0.5); b.box(i % 2 ? blackD : black, x, hh - 1.4, z, 7.4, 1.7, 1.9, -ga + Math.PI / 2); }
    { const [x, z] = gx(0, 56); b.box(wood, x, 0.4, z, 7, 0.5, 14, -ga + Math.PI / 2 + 0); }

    // ---- harbour town (fishing village on the cove) + road up -----------------------------------------------------------------
    const road = K.smoothPath([[HARB[0] + 6, HARB[1] - 20], [10, 100], [50, 70], [76, 40], [96, 22], [CS[0] - 14, CS[1] + 28]], 6);
    b.ribbon(T('cobble', 0x3d3b40, 8), road, 6, heightAt, 0.2);
    const vil = K.town(b, { rng: K.rng(5), count: q.dens(90), bounds: [HARB[0] - 60, HARB[1] - 62, HARB[0] + 60, HARB[1] + 20], minDist: 8, size: [4.5, 8], height: [3.5, 6], heightAt, accept: (x, z) => H(x, z) > 1.6 && H(x, z) < 26, avoid: (x, z) => K.distToPolyline(x, z, road).d < 5, wallMat: black, roofMat: thatch, glowMat: windowG, palette: [{ wall: 0x6c6a70, roof: 0x4f4636 }, { wall: 0x5b5a60, roof: 0x57503c }, { wall: 0x7a7578, roof: 0x3f382c }, { wall: 0x58565e, roof: 0x6a5a40 }, { wall: 0x84807c, roof: 0x4a4038 }, { wall: 0x4a4a52, roof: 0x5e4a36 }, { wall: 0x6a645e, roof: 0x30302c }], style: 'gable', chimneyChance: 0.5 });
    const qy = 0.9; for (const k of [-1, 1]) K.pier(b, HARB[0] + k * 20, qy, HARB[1] + 18, { len: 30, w: 4, ry: Math.PI / 2 * 0 + (k > 0 ? -1.2 : -1.9), mat: wood });
    // ---- molten pool in the crater and glowing fissures at the vents (emissive: glows at dusk/night and blooms)
    { const cy = H(MT[0], MT[1]); b.cyl(lavaG, MT[0], cy - 0.2, MT[1], 9, 0.7, { seg: 14 });
      for (const [vx, vz, vr] of [[-40, -20, 2.6], [-20, -50, 2.2], [-110, -30, 2.8], [-70, -105, 2.4], [-110, -90, 2.0]]) { b.cyl(blackD, vx, H(vx, vz) - 1, vz, vr * 1.9, 1.6, { seg: 8, top: 0.7 }); b.cyl(lavaG, vx, H(vx, vz) + 0.5, vz, vr, 0.5, { seg: 8 }); } }
    // ---- glowing lava fissures laid flat on the flanks (aligned to the slope normal), plus scattered basalt boulders
    { const pg = new THREE.PlaneGeometry(1, 1); pg.rotateX(-Math.PI / 2); const m4 = new THREE.Matrix4(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), D = new THREE.Vector3(), lr = K.rng(61);
      for (const [a0, len] of [[0.35, 105], [1.5, 80], [2.4, 95], [3.4, 100], [4.3, 80], [5.3, 90], [5.9, 60]]) {
        let x = MT[0] + Math.cos(a0) * 10, z = MT[1] + Math.sin(a0) * 10, a = a0;
        for (let d = 10; d < len; d += 9) {
          a += lr.range(-0.25, 0.25); x += Math.cos(a) * 9; z += Math.sin(a) * 9;
          Y.set(H(x - 1.5, z) - H(x + 1.5, z), 3, H(x, z - 1.5) - H(x, z + 1.5)).normalize(); D.set(Math.cos(a), 0, Math.sin(a)); Z.copy(D).addScaledVector(Y, -D.dot(Y)).normalize(); X.crossVectors(Y, Z);
          const wdt = lr.range(1.4, 2.6) * (1 - d / (len * 1.4)); m4.makeBasis(X.clone().multiplyScalar(wdt), Y, Z.clone().multiplyScalar(lr.range(8, 12))); m4.setPosition(x, H(x, z) + 0.45, z); b.addGeometry(lavaG, pg, m4);
        }
      }
      const bo = new Inst(G.sphere(6), T('rock', 0x4a4852, 6)), br2 = K.rng(63);
      for (let i = 0; i < q.dens(260); i++) { const x = br2.range(-230, 230), z = br2.range(-230, 230), h = H(x, z); if (h < 3 || h > 70 || Math.hypot(x - CS[0], z - CS[1]) < 85 || Math.hypot(x - HARB[0], z - HARB[1]) < 52 || Math.hypot(x - SDG[0], z - SDG[1]) < 30) continue; const k = br2.range(0.7, 2.8); bo.add(x, h - k * 0.35, z, k * br2.range(0.9, 1.5), k * br2.range(0.55, 1.0), k * br2.range(0.9, 1.5), br2() * 6, vary(br2, 0xffffff, 0.16)); }
      const bm = fixInst(bo.build()); root.add(bm); }
    // ---- basalt skerries & columnar stacks ringing the coast (with pulsing surf)
    const sk = [], skr = K.rng(31);
    for (let i = 0; i < 26; i++) {
      const a = skr() * 6.283, rad = Rof(a) * skr.range(0.98, 1.16) + skr.range(0, 26), x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      if (H(x, z) > -2.5 || H(x, z) < -14 || (z > 90 && Math.abs(x) < 80) || Math.hypot(x - SDG[0], z - SDG[1]) < 60) continue;
      const n = skr.int(3, 6), base = skr.range(2.2, 4.2); sk.push([x, z, base * 1.6]);
      for (let k = 0; k < n; k++) { const ox = x + skr.range(-4, 4), oz = z + skr.range(-4, 4), hh = skr.range(3, 11) * (1 - k * 0.1); b.cyl(basalt, ox, -8, oz, base * skr.range(0.5, 1), hh + 8, { seg: 6, top: 0.86, color: vary(skr, 0xffffff, 0.14) }); }
    }
    foamRings(ctx, sk, { width: 3, opacity: 0.8 });
    root.add(b.build({}));
    // ---- far headlands drowned in haze: depth layering, no hard horizon
    { const fb = new Batch(), fr = K.rng(8), farM = T('rock', 0x4a4650, 40);
      for (let i = 0; i < 9; i++) { const a = i * 0.7 + fr() * 0.4, d = fr.range(760, 1000), r = fr.range(90, 190); fb.dome(farM, Math.cos(a) * d, -10, Math.sin(a) * d, r, { seg: 10, sy: fr.range(0.22, 0.4), color: vary(fr, 0xffffff, 0.1) }); }
      root.add(fb.build({ shadow: false })); }

    // ---- Dragonmont plume, vents, steam, ash ----------------------------------------------------------------------------------
    const cr = H(MT[0], MT[1]);
    root.add(K.smoke([[MT[0], cr + 2, MT[1]], [MT[0] + 5, cr + 2, MT[1] + 4], [MT[0] - 5, cr + 2, MT[1] - 3]], { size: 90, rise: 150, opacity: 0.5, perStack: 14, color: 0x4a4648, spread: 22 }));
    root.add(K.smoke([[MT[0] + 2, cr + 2, MT[1]]], { size: 70, rise: 90, opacity: 0.35, perStack: 10, color: 0x8a7a70, spread: 10 }));
    const vents = [[-40, -20], [-20, -50], [-110, -30], [-70, -105], [-110, -90]].map(([x, z]) => [x, H(x, z) + 0.8, z]);
    root.add(K.smoke(vents, { size: 24, rise: 22, opacity: 0.3, perStack: 4, color: 0xdcd8d2, spread: 4 }));
    const lava = K.fires([[MT[0], cr + 1, MT[1]], [MT[0] + 6, cr + 1, MT[1] + 3], [MT[0] - 6, cr + 1, MT[1] - 4], ...vents.slice(0, 3)], { size: 26, light: 0 }); root.add(lava); ctx.onUpdate((dt, t) => lava.userData.update(t));
    const crl = new THREE.PointLight(0xff5a20, q.low ? 0 : 6000, 140, 1.6); crl.position.set(MT[0], cr + 6, MT[1]); if (!q.low) root.add(crl); ctx.onUpdate((dt, t) => { crl.intensity = 5200 + 1000 * Math.sin(t * 2.3) * Math.sin(t * 0.9 + 1) + 400 * Math.sin(t * 7.1); });
    root.add(K.smoke([...vil.filter((_, i) => i % 3 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 4, p.z]), [CS[0] - 30, sy + 14, CS[1] - 10], [CS[0] - 8, sy + 12, CS[1] + 33]], { size: 16, rise: 16, opacity: 0.3, perStack: 4, color: 0x9a9690 }));
    const fires = K.fires([[SDG[0] - 8, gy + 2, SDG[1] - 2], [CS[0] - 40, sy + 2, CS[1] + 4], [CS[0], sy + 58, CS[1]], [HARB[0], 3, HARB[1] + 14], [ring[0][0], H(ring[0][0], ring[0][1]) + 16, ring[0][1]]], { size: 9, light: q.low ? 0 : 2 }); root.add(fires); ctx.onUpdate((dt, t) => fires.userData.update(t));
    root.add(K.banners([[CS[0], sy + 70, CS[1]], [SDG[0] - 6, gy + 34, SDG[1]], ...ring.filter((_, i) => i % 4 === 0).map(([x, z]) => [x, H(x, z) + 38, z])].map(([x, y, z], i) => ({ x, y, z, w: 3.2, h: 8, color: i % 2 ? 0x1a1a1c : 0x8a1414, ry: i * 0.7 }))));

    // ---- ships & life ---------------------------------------------------------------------------------------------------------------
    const ships = [];
    const addShip = (type, len, hull, sail, x, z, ry, mv) => { const s = K.ship(type, { len, hull, sail }); s.position.set(x, 0.3, z); s.rotation.y = ry; root.add(s); ships.push({ s, mv, ph: ships.length * 1.9 }); };
    addShip('galley', 34, 0x2b2a2e, 0x8a1818, 250, 80, 0.4, null); addShip('cog', 28, 0x3d2f22, 0xcfc8b0, 300, -70, 2.2, { cx: 300, cz: -160, R: 110, sp: 0.008 });
    addShip('cog', 22, 0x3d2f22, 0xd8cfb4, HARB[0] + 8, HARB[1] + 44, 0.8, null); addShip('barge', 12, 0x4a3a2a, 0xc8bfa5, HARB[0] - 26, HARB[1] + 36, 2.2, null); addShip('barge', 12, 0x4a3a2a, 0xc8bfa5, HARB[0] + 30, HARB[1] + 52, -0.5, { cx: HARB[0], cz: HARB[1] + 100, R: 50, sp: 0.01 });
    ctx.onUpdate((dt, t) => { for (const o of ships) { const m = o.mv; if (m) { const a = t * m.sp * 2 + 1; o.s.position.set(m.cx + Math.cos(a) * m.R, 0.3, m.cz + Math.sin(a) * m.R); o.s.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); } K.animateShip(o.s, t, o.ph); } });
    for (const [cx, cy, cz, R, n, s, col] of [[MT[0], 120, MT[1], 90, 10, 3, 0x1a1a1d], [CS[0], 70, CS[1], 80, 8, 4, 0x1a1a1d], [100, 40, 90, 120, 6, 5, 0xc8c8c4]]) { const g = K.birds({ center: [cx, cy, cz], radius: R, count: q.dens(n), color: col, size: 1.6, spreadY: 16, seed: s }); root.add(g); ctx.onUpdate((dt, t) => g.userData.update(t)); }
    const cl = K.clouds({ y: 240, extent: 700, count: 10, opacity: 0.55, color: 0x6d6a6c }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));
    const wk = K.walkers({ paths: [road, K.smoothPath([[CS[0] - 40, CS[1] + 20], [CS[0], CS[1] + 28], [CS[0] + 40, CS[1] + 10]], 3)], heightAt, count: q.dens(26), rng: K.rng(5), colors: [0x2a2a2e, 0x6a2020, 0x4a4a50, 0x3a3228] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 300, center: [20, 20, 0], minDistance: 20,
      hero: { pos: [268, 140, 218], target: [30, 44, -6] },
      climate: { atmos: 'day', weather: 'ash', tint: {
        dawn: { top: 0x3c3f5c, horizon: 0xe0907a, fog: 0xa87a74, az: 2.5, fogD: 0.0019, sunC: 0xffa070, sunI: 2.5, hemiSky: 0x8a7a9c, hemiGround: 0x4a3030, hemiI: 0.85 },
        day: { top: 0x3a4658, horizon: 0xc0a68e, fog: 0xc0a68e, fogD: 0.00095, az: 2.3, elev: 0.42, sunC: 0xffe0c0, sunI: 3.0, hemiSky: 0xa8b0c0, hemiGround: 0x5a4a40, hemiI: 1.3 },
        dusk: { top: 0x1c1c3c, horizon: 0xd86a46, fog: 0xa86050, fogD: 0.0015, sunC: 0xff7a3a, sunI: 2.6, hemiSky: 0x8a80b0, hemiGround: 0x4a3034, hemiI: 1.3 },
        night: { top: 0x0a0c20, horizon: 0x2e2a44, fog: 0x2e2a44, fogD: 0.0019, sunC: 0x9fb0e8, sunI: 1.6, elev: 0.45, hemiSky: 0x7a86b8, hemiGround: 0x3a3040, hemiI: 1.6, exposure: 1.25 },
      } },
      landmarks: {
        'dragonmont': lm(MT[0], MT[1], 70, 14), 'stone-drum': lm(CS[0], CS[1], 26, 62), 'sea-dragon-gate': lm(SDG[0], SDG[1], 18, 32), 'painted-table-chamber': lm(CS[0] + 2, CS[1] - 2, 12, 52),
        'dragon-gargoyles': lm(ring[3][0], ring[3][1], 20, 34), 'castle-walls': lm(ring[10][0], ring[10][1], 26, 22), 'harbor-village': lm(HARB[0], HARB[1] - 24, 36, 8),
        'dragonglass-slopes': lm(-110, -30, 26, 20), 'shingle-shore': lm(60, -140, 30, 4),
      },
      cutaways: [{ id: 'painted-table-chamber', name: { en: 'Chamber of the Painted Table (cutaway)', zh: '彩绘桌厅（剖面）' }, build: buildChamber }],
    };
  },
};

function buildChamber(ctx) {
  const g = ctx.root, b = new Batch(), R = 24, Hh = 16;
  const T = (k, color, scale = 6, o = {}) => tri(k, { color, scale, snow: false, ...o });
  const stone = T('stone', 0x6a6970, 6, { emissive: 0x1c1b22 }), floor = T('cobble', 0x4a484e, 5, { emissive: 0x1a1a1e }), wood = T('wood', 0x6e5034, 3, { emissive: 0x2a1a0e }), paint = flat(0xffffff, { rough: 0.8 }), wg = glow(0xffd18a), gold = flat(0xd9b04a, { metal: 0.6, rough: 0.4 });
  b.cyl(floor, 0, -0.6, 0, R + 3, 0.6, { seg: 24 });
  const N = 24; for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2; if (a > 1.0 && a < 2.2) continue; /* cutaway opening toward +z */ b.box(stone, Math.cos(a) * R, 0, Math.sin(a) * R, 6.6, Hh, 1.8, -a + Math.PI / 2); } // ring wall with front opened
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2; if (a > 1.0 && a < 2.2) continue; b.box(wg, Math.cos(a) * (R - 0.8), 5, Math.sin(a) * (R - 0.8), 2.2, 7, 0.2, -a + Math.PI / 2); } // tall windows over the sea
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; b.box(wood, Math.cos(a) * R * 0.5, Hh, Math.sin(a) * R * 0.5, 0.7, 0.7, R * 0.98, -a, 0xffffff); } // roof beams
  // The Painted Table: a huge carved map of Westeros, lacquered, on a plinth. Outline is a rough sketch only.
  const tx = 0, tz = -1, ty = 3.2;
  b.box(wood, tx, 0, tz, 7, ty, 4, 0); b.box(wood, tx - 6, 0, tz, 3, ty - 0.2, 3, 0.3); b.box(wood, tx + 6, 0, tz, 3, ty - 0.2, 3, -0.3);
  b.box(paint, tx, ty, tz, 34, 0.5, 15, 0, 0x3f78a8); // the sea (blue lacquer)
  const land = (col, pts, h = 0.5) => b.extrude(paint, pts.map(([x, z]) => [tx + x, tz + z]), ty + 0.5, h, col);
  land(0xc9b890, [[-12, -6], [-6, -7], [0, -6.4], [6, -6], [9, -3], [6, -1], [10, 2], [4, 3.5], [-2, 5], [-8, 4], [-10, 1], [-13, -2]], 0.3); // rough continent
  land(0xdfe6ec, [[-9, -6.4], [0, -6.2], [3, -4], [-4, -3], [-10, -4]], 0.55); // North
  land(0x7aa05a, [[-4, -3], [3, -4], [4, 0], [-2, 1]], 0.55); // Riverlands/Crownlands (green)
  land(0xb8a050, [[-2, 1], [4, 0], [7, 2], [3, 3], [-2, 4]], 0.55); // Reach/Stormlands (gold)
  land(0xd0803a, [[3, 3], [7, 2], [9, 3], [4, 3.6]], 0.55); // Dorne (orange)
  land(0xa04a3a, [[-10, -4], [-4, -3], [-2, 1], [-8, 3], [-11, 0]], 0.55); // Westerlands (red)
  b.box(gold, tx + 7.5, ty + 0.5, tz - 4.5, 1.2, 1.4, 1.2, 0.6); // marker figure for Dragonstone, east
  // hearth, braziers and a dragon-skull-like carved chair
  b.cyl(stone, -R + 4, 0, 0, 2.4, 3, { seg: 8 }); b.box(stone, 14, 0, -10, 4, 1.4, 3, -0.5); b.box(stone, 14, 1.4, -10.3, 1.2, 2.8, 2.4, -0.5);
  for (const k of [-1, 1]) b.box(stone, k * 5, 0, 16.5, 1.6, 6, 1.6);
  const items = [...Array(6)].map((_, i) => ({ x: Math.cos(i * 0.9 + 3.3) * (R - 1.2), y: 13, z: Math.sin(i * 0.9 + 3.3) * (R - 1.2), w: 2.6, h: 7, color: i % 2 ? 0x8a1414 : 0x1b1b1e, ry: -(i * 0.9 + 3.3) + Math.PI / 2 }));
  g.add(b.build({})); g.add(K.banners(items, { pole: false }));
  const fire = K.fires([[-R + 4, 3.2, 0], [-5, 2, 16.5], [5, 2, 16.5], [14, 3.4, -10]], { size: 9, light: 3, intensity: 90, color: 0xff9a3c }); g.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
  for (const [x, y, z, I] of [[0, 12, 2, 230], [-12, 8, 0, 120]]) { const l = new THREE.PointLight(0xffd7a0, I, 80, 1.6); l.position.set(x, y, z); g.add(l); }
  return { center: [0, 4, 0], hero: { pos: [-6, 26, 40], target: [0, 3, -2] }, minDistance: 8, maxDistance: 70 };
}
