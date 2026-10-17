// Pyke — book anchors: the Greyjoy seat on sea-stacks and a cliff, towers joined by stone bridges; the Great Keep on the largest islet, the Sea Tower
// on an outer crooked pillar reached by three narrowing bridges, the Bloody Keep and the Kitchen Keep on their own stacks, a curtain wall and
// gatehouse across the mainland cliffs; no safe anchorage; longships. Exact positions, shapes and scales are interpretation (see content/pyke.js).
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;

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


/** Arched stone span: thick haunches thinning to the crown, crenellated parapets, lantern posts; optional piers with arch ribs below. */
function arch(b, a, c, { w = 4, rise = 2.5, mat, rib, glowMat, color = 0xffffff, th0 = 1.0, th1 = 3.4, piers = [], floor = -14, lamps = true }) {
  const dx = c[0] - a[0], dz = c[2] - a[2], len = Math.hypot(dx, dz), N = Math.max(8, Math.ceil(len / 1.7)), ry = Math.atan2(-dz, dx), nx = -dz / len, nz = dx / len;
  const at = (t) => [a[0] + dx * t, a[1] + (c[1] - a[1]) * t + Math.sin(t * Math.PI) * rise, a[2] + dz * t];
  let prev = at(0);
  for (let i = 1; i <= N; i++) {
    const t = i / N, p = at(t), tm = (i - 0.5) / N, th = th0 + (th1 - th0) * Math.pow(Math.abs(1 - 2 * tm), 1.6);
    const sl = Math.hypot(p[0] - prev[0], p[2] - prev[2]) + 0.25, ang = Math.atan2(p[1] - prev[1], Math.hypot(p[0] - prev[0], p[2] - prev[2])), mx = (p[0] + prev[0]) / 2, my = (p[1] + prev[1]) / 2, mz = (p[2] + prev[2]) / 2;
    b.box(mat, mx, my - th, mz, sl, th, w, ry, color, 0, ang);
    for (const sd of [-1, 1]) b.box(mat, mx + nx * sd * (w / 2 - 0.25), my, mz + nz * sd * (w / 2 - 0.25), sl, i % 2 ? 1.5 : 0.9, 0.5, ry, color, 0, ang);
    prev = p;
  }
  if (lamps && glowMat) for (const t of [0.04, 0.5, 0.96]) { const p = at(t); for (const sd of [-1, 1]) { b.box(mat, p[0] + nx * sd * (w / 2 - 0.3), p[1], p[2] + nz * sd * (w / 2 - 0.3), 0.5, 2.2, 0.5, ry, color); b.box(glowMat, p[0] + nx * sd * (w / 2 - 0.3), p[1] + 2.2, p[2] + nz * sd * (w / 2 - 0.3), 0.7, 0.8, 0.7, ry); } }
  if (piers.length) {
    const ts = [0, ...piers, 1];
    for (let k = 0; k < ts.length - 1; k++) {
      const t0 = ts[k], t1 = ts[k + 1], p0 = at(t0), p1 = at(t1), span = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]), r = span / 2 - 0.9, cx = (p0[0] + p1[0]) / 2, cz = (p0[2] + p1[2]) / 2, crown = at((t0 + t1) / 2)[1] - 3.2, ys = crown - r * 0.95;
      let pa = null; for (let j = 0; j <= 10; j++) { const th = (j / 10) * Math.PI, ex = cx - Math.cos(th) * r * dx / len, ez = cz - Math.cos(th) * r * dz / len, ey = ys + Math.sin(th) * r * 0.95; if (pa) { const l = Math.hypot(ex - pa[0], ez - pa[2]), g = Math.hypot(l, ey - pa[1]); b.box(rib, (ex + pa[0]) / 2, (ey + pa[1]) / 2 - 0.6, (ez + pa[2]) / 2, g + 0.3, 1.5, w * 0.92, ry, color, 0, Math.atan2(ey - pa[1], l)); } pa = [ex, ey, ez]; }
    }
    for (const t of piers) { const p = at(t); b.box(rib, p[0], floor, p[2], 3.2, p[1] - 4 - floor, w + 0.8, ry, color); b.cone(rib, p[0] - dx / len * 2.2, floor, p[2] - dz / len * 2.2, 1.7, p[1] - 4 - floor, { seg: 4 }); }
  }
}

// kit workaround: K.forest's instanced meshes render black (vertexColors on geometry lacking a colour attribute); not used here.
const STACKS = [ // x, z, r, h
  [0, 50, 26, 34], [-55, 60, 15, 28], [50, 62, 13, 26], [-8, -2, 6, 36], [-3, -26, 5, 42], [-5, -52, 9, 52],
  [-98, 24, 9, 24], [92, 18, 8, 30], [-120, 78, 7, 18], [80, -38, 7, 22], [28, -84, 6, 26], [-62, -62, 8, 20], [130, 60, 6, 16],
];
const WALLP = [[-95, 134], [-50, 123], [0, 118], [50, 123], [95, 134]];

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root;
    const cliffZ = (x) => 108 + 10 * Math.sin(x * 0.04) + 5 * Math.sin(x * 0.11 + 1);
    const heightAt = (x, z) => {
      const cz = cliffZ(x), m = K.smoothstep(cz - 5, cz + 2, z);
      let h = -14 + m * (14 + 30 + Math.min(40, Math.max(0, z - cz) * 0.15) + (K.fbm(x * 0.02, z * 0.02, 3, 4) - 0.5) * 8);
      h += K.smoothstep(300, 420, -z) * (46 + K.fbm(x * 0.006, z * 0.006, 3, 2) * 50);                         // far Great Wyk hint
      h += K.smoothstep(280, 420, Math.abs(x)) * K.smoothstep(-60, -200, -z * 0 - 80) * 0; // (unused)
      return h;
    };
    const rockC = new THREE.Color(0x373c42), rockD2 = new THREE.Color(0x272c34), rockL = new THREE.Color(0x585e62), turf = new THREE.Color(0x4a5638), heath = new THREE.Color(0x5a4a52), turf2 = new THREE.Color(0x3a4a34), wetR = new THREE.Color(0x1c2528), c = new THREE.Color();
    root.add(K.terrain({ size: 1400, seg: q.seg(210), heightAt, kind: 'rock', scale: 12, colorAt: (x, z, h, s) => {
      const f = K.fbm(x * 0.03, z * 0.03, 3, 6), g = K.fbm(x * 0.12, z * 0.12, 2, 12);
      c.copy(rockC).lerp(rockD2, g * 0.8); c.multiplyScalar(0.84 + 0.3 * (0.5 + 0.5 * Math.sin(h * 0.8 + g * 3)));    // dark layered cliff
      if (s > 0.12) c.lerp(rockL, K.clamp(f - 0.45, 0, 0.5) * 0.7);                                                      // paler weathered faces
      const moor = K.clamp((h - 26) * 0.12 - s * 3.2, 0, 1);
      c.lerp(f > 0.5 ? heath : (g > 0.55 ? turf2 : turf), moor * 0.85);                                                  // moorland: heather, turf, bog
      if (h < 4) c.lerp(wetR, K.smoothstep(4, -2, h) * 0.85);                                                            // sea-wet, kelp-dark base
      return c; } }));
    const sea = K.water({ w: 1400, d: 1400, seg: q.seg(210), level: 0, heightAt, deep: 0x0b1f2b, shallow: 0x35606a, opacity: 0.95, choppy: 1.8, speed: 1.8 });
    root.add(sea); ctx.registerWater(sea);

    const rock = tri('rock', { color: 0x5a5d62, scale: 9 }), rockD = tri('rock', { color: 0x43464b, scale: 8 }), seastone = tri('stone', { color: 0x4a5c5a, scale: 7 }), stone = tri('stone', { color: 0x666971, scale: 7 }), stoneD = tri('stone', { color: 0x4d5057, scale: 7 });
    const slate = tri('slate', { color: 0x3c4046, scale: 5 }), kelp = tri('rock', { color: 0x2a3a36, scale: 6 }), guano = tri('rock', { color: 0xc8cccc, scale: 5 }), trimS = tri('stone', { color: 0x80858a, scale: 6 }), mossS = tri('rock', { color: 0x4a5a40, scale: 6 }), wood = tri('wood', { color: 0x3d2f23, scale: 4, snow: false }), win = glow(0xff9a4a);
    const b = new Batch(), H = heightAt, rr = K.rng(9), vr = K.rng(91), lamp = glow(0xffb060, 1.3);

    // ---- sea-stacks: crooked tiered columns, kelp-dark at the waterline, pale weathering and guano above
    STACKS.forEach(([x, z, r, h], k) => {
      const tiers = 4, tot = h + 14, R = (y) => r * (1.5 - 0.44 * (y + 14) / tot);
      let ox = 0, oz = 0;
      for (let t = 0; t < tiers; t++) {
        const y0 = -14 + (t * tot) / tiers, y1 = -14 + ((t + 1) * tot) / tiers, last = t === tiers - 1;
        const col = vary(rr, t < 1 ? 0xb0b8b8 : (t === 1 ? 0xd8dcdc : 0xffffff), 0.12);
        if (!last) { ox += rr.range(-0.07, 0.07) * r; oz += rr.range(-0.07, 0.07) * r; }
        else { ox *= 0.4; oz *= 0.4; }
        b.cyl(t < 2 ? rockD : rock, x + ox, y0, z + oz, R(y0) * 1.0, y1 - y0 + 0.4, { top: R(y1) / R(y0) * (last ? 1.0 : 1.04), seg: 8 + (k % 4), color: col, ry: rr() * 3 });
      }
      b.cyl(kelp, x, -2.2, z, R(-2.2) * 1.03, 5.6, { top: R(3.4) / R(-2.2), seg: 10 });                      // kelp & barnacle band
      for (let i = 0; i < 7; i++) { const a = rr() * 6.283, d = r * rr.range(0.9, 1.2), hh = rr.range(h * 0.25, h * 0.65); b.box(rockD, x + Math.cos(a) * d, rr.range(-2, h * 0.4), z + Math.sin(a) * d, rr.range(2.6, 5.5), hh, rr.range(2.6, 5.5), a, vary(rr, 0xffffff, 0.12), rr.range(-0.12, 0.12), rr.range(-0.18, 0.18)); } // fallen buttresses of rock
      b.cyl(trimS, x, h - 1.4, z, r * 1.08, 1.7, { top: 1, seg: 10 });                                                // weathered cap
      for (let i = 0; i < 5; i++) { const a = rr() * 6.283; b.box(guano, x + Math.cos(a) * r * 0.9, h - 1.0, z + Math.sin(a) * r * 0.9, 1.1, 2.8, 0.5, a, 0xffffff); } // guano streaks
      if (r < 12 && k % 2) b.sphere(mossS, x + r * 0.3, h + 0.2, z - r * 0.2, r * 0.55, { seg: 7, sy: 0.35 });
    });
    // ---- Great Keep (largest islet): squat, massive, with corner towers and a long hall
    const kz = 50;
    K.keep(b, 0, kz, { w: 34, d: 26, h: 34, y: 34, mat: stone, roofMat: slate, turretR: 4.2, turretH: 10, roof: 'flat', color: 0xe4e8ea });
    for (let r = 0; r < 3; r++) for (let i = -3; i <= 3; i++) { b.box(win, i * 4.4, 40 + r * 8, kz + 13.1, 1.1, 3.4, 0.2); b.box(win, i * 4.4, 40 + r * 8, kz - 13.1, 1.1, 3.4, 0.2); }
    for (const sg of [-1, 1]) for (let r = 0; r < 3; r++) for (let i = -2; i <= 2; i++) b.box(win, sg * 17.1, 40 + r * 8, kz + i * 4.6, 0.2, 3.4, 1.1);
    K.squareTower(b, 0, kz, { w: 20, d: 16, h: 18, y: 68, mat: stoneD, roofMat: slate, roof: 'flat', windows: false, color: 0xcfd4d6 }); b.cone(slate, 0, 86.8, kz, 4, 11, { seg: 4 }); b.cone(trimS, 0, 97.6, kz, 0.4, 5, { seg: 5 });
    b.box(stone, -14, 34, kz + 20, 28, 12, 10, 0); b.prism(slate, -14, 46, kz + 20, 30, 5, 12, 0); // great hall wing (Seastone Chair hall)
    for (let i = -3; i <= 3; i++) b.box(win, -14 + i * 4, 40, kz + 25.1, 1.2, 4, 0.2);
    for (const [x, z] of [[-22, kz - 16], [22, kz - 16], [-22, kz + 22]]) K.tower(b, x, z, { r: 3.6, h: 14, y: 34, mat: stoneD, roofMat: slate, roof: 'cone', roofH: 7, seg: 9, windows: false, color: vary(vr, 0xffffff, 0.1) });
    // ---- Bloody Keep
    K.keep(b, -55, 60, { w: 18, d: 18, h: 26, y: 28, mat: stoneD, roofMat: slate, turretR: 3, turretH: 7, roof: 'flat' });
    for (let i = 0; i < 4; i++) b.box(win, -55 + (i - 1.5) * 3.5, 40, 51, 1, 3, 0.2);
    // ---- Kitchen Keep (smoking chimneys)
    K.house(b, 50, 26, 62, { w: 15, d: 13, h: 12, style: 'gable', wallMat: stone, roofMat: slate, wall: 0xffffff, roof: 0xffffff, glowMat: win, chimney: true });
    K.tower(b, 50, 62, { r: 4.5, h: 26, y: 38, mat: stoneD, roofMat: slate, roof: 'cone', roofH: 9, seg: 8, windows: false });
    // ---- Sea Tower: the oldest, tallest round tower, on the outermost crooked pillar
    const st = STACKS[5];
    K.tower(b, st[0], st[1], { r: 6.6, h: 40, y: st[3], mat: seastone, roofMat: slate, roof: 'flat', seg: 14, taper: 0.8, windows: false });
    b.cyl(seastone, st[0] + 1.5, st[3] + 40, st[1] + 0.8, 5.4, 6, { top: 0.9, seg: 10 }); b.box(win, st[0], st[3] + 22, st[1] + 6.6, 1.2, 3, 0.2); b.box(win, st[0] + 5, st[3] + 30, st[1] + 4, 1.2, 3, 0.2);
    // small watch platforms on the stepping stacks
    for (const k of [3, 4]) { const [x, z, , h] = STACKS[k]; b.box(stoneD, x, h, z, 6, 2.2, 6, 0); b.box(stoneD, x - 2.5, h + 2.2, z - 2.5, 1, 1, 1, 0); }
    // ---- mainland curtain wall across the cliffs and the gatehouse
    K.wall(b, WALLP, { h: 20, t: 6, mat: stone, capMat: stoneD, heightAt, sink: 6, merlon: 1.4, color: 0xd8dcde });
    WALLP.forEach(([x, z], i) => K.tower(b, x, z, { r: 6, h: 28 + (i % 3) * 3, y: H(x, z), mat: stone, roofMat: slate, roof: i % 2 ? 'cone' : 'flat', roofH: 12, seg: 10, windows: false, color: vary(vr, 0xe4e8ea, 0.1) }));
    K.gatehouse(b, 0, 118, { y: H(0, 118), ry: 0, mat: stone, roofMat: slate, w: 24, d: 12, h: 32, gate: 7, wood, towerR: 6 });
    const hy = H(0, 118); // the keep's service yard on the mainland (stables, barracks)
    for (const [x, z, w, d] of [[-32, 142, 18, 10], [30, 146, 20, 10], [0, 152, 14, 9]]) K.house(b, x, H(x, z), z, { w, d, h: 7, style: 'gable', wallMat: stoneD, roofMat: slate, wall: 0xffffff, roof: 0xffffff, glowMat: win, chimney: true });
    b.ribbon(tri('cobble', { color: 0x4a4944, scale: 8 }), [[0, 118], [4, 160], [-8, 220], [6, 300]], 6, heightAt, 0.2);

    // ---- the stone bridges (arched), the final one a narrow plank-and-rope span
    const br = (a, c, w, rise, o = {}) => arch(b, a, c, { w: w * 1.3, rise, mat: o.wood ? wood : stone, rib: stoneD, glowMat: lamp, color: o.wood ? 0xffffff : 0xdde2e4, th0: o.th0 ?? 1.0, th1: o.th1 ?? 3.0, lamps: !o.wood, piers: o.piers || [] });
    br([0, 34.5, 108], [0, 34.2, 64], 8, 3.4, { piers: [0.34, 0.67], th1: 2.4 });   // mainland gate -> Great Keep (viaduct)
    br([-17, 34.4, 52], [-46, 28.4, 58], 5, 2.6); br([17, 34.4, 52], [43, 26.4, 58], 5, 2.6);
    br([0, 34.4, 36.8], [-6, 36.4, 4.5], 4.4, 2.2); br([-8, 36.4, -6], [-4, 42.4, -22], 3.2, 1.8); br([-3, 42.4, -30], [-5, 52.4, -44.5], 2, 1.4, { wood: true, th1: 0.7, th0: 0.5 });
    root.add(b.build({}));

    // ---- crashing sea: foam rings that surge round every stack, plus spray
    foamRings(ctx, STACKS.map(([x, z, r]) => [x, z, r * 1.45]), { y: 0.35, width: 3.0, opacity: 0.6, speed: 1.1 });
    root.add(K.smoke(STACKS.slice(0, 8).flatMap(([x, z, r]) => [[x + r * 1.1, 1, z + r * 0.6], [x - r * 1.1, 1, z - r * 0.4]]), { color: 0xeef4f6, size: 26, rise: 10, opacity: 0.28, perStack: 4, spread: 5 }));
    root.add(K.smoke([[50, 40, 62], [-14, 52, kz + 20], [0, 70, kz]], { color: 0x55585c, size: 20, rise: 18, opacity: 0.35 }));
    { const fb = new Batch(), fr = K.rng(18), farM = tri('rock', { color: 0x3a444c, scale: 40 });
      for (let i = 0; i < 10; i++) { const a = -0.3 + i * 0.68, d = fr.range(620, 820), r = fr.range(80, 170); if (Math.sin(a) < -0.2 && false) continue; fb.cone(farM, Math.cos(a) * d, -8, Math.sin(a) * d, r, r * fr.range(0.25, 0.5), { seg: 7, color: vary(fr, 0xffffff, 0.1) }); }
      root.add(fb.build({ shadow: false })); }
    const fire = K.fires([[0, 38.4, 104], [-6, 38.4, 4.5], [-5, 56, -44], [-25, 33, kz + 18], [5, 38, 112], [-5, 38, 112]], { size: 9, light: q.low ? 0 : 3, intensity: 70 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    // longships: two beached under the cliff, three at sea
    const ls = (x, z, ry, hull, sail) => { const s = K.ship('longship', { len: 17, hull, sail }); s.position.set(x, 0.2, z); s.rotation.y = ry; root.add(s); return s; };
    const moored = [ls(112, 96, 0.5, 0x2c2218, 0x1d1d22), ls(122, 88, 0.2, 0x3a2b1c, 0x24242a)];
    const roam = [ls(0, 200, 0, 0x2c2218, 0x20202a), ls(-140, 150, 0, 0x3a2b1c, 0x1d1d22), ls(160, 160, 0, 0x2c2218, 0x2a2a30)];
    ctx.onUpdate((dt, t) => { moored.forEach((s, i) => { K.animateShip(s, t, i); s.position.y = 0.2 + Math.sin(t + i) * 0.15; }); roam.forEach((s, i) => { const a = t * 0.035 * (i % 2 ? -1 : 1) + i * 2.1, R = 150 + i * 35; s.position.set(Math.cos(a) * R, 0.2, 30 + Math.sin(a) * R * 0.8 - 20); s.rotation.y = -a + (i % 2 ? -1.57 : 1.57); K.animateShip(s, t, i * 2); s.position.y = 0.2 + Math.sin(t * 1.2 + i) * 0.2; }); });
    const gull = K.birds({ center: [0, 55, 20], radius: 120, count: q.dens(18), color: 0xc8ccce, size: 1.6, spreadY: 18, seed: 14, speed: 0.15 }); root.add(gull); ctx.onUpdate((dt, t) => gull.userData.update(t));
    const bn = [[-22, 52 + 4, kz - 16], [22, 52 + 4, kz - 16], [0, 90, kz], [-55, 60, 51], [st[0], st[3] + 48, st[1]], [0, 54, 118], [-6, 54, 118]].map(([x, y, z], i) => ({ x, y: y + (i === 4 ? 6 : 0), z, w: 3.4, h: 10, color: 0x14141a, ry: 0.3 }));
    root.add(K.banners(bn));
    root.add(K.clouds({ y: 250, extent: 700, count: 14, opacity: 0.5, color: 0x9aa1a8 }));

    const lm = (x, z, y, r) => ({ pos: [x, y, z], r });
    return {
      radius: 250, center: [0, 20, 20], minDistance: 15,
      hero: { pos: [-150, 112, -118], target: [0, 34, 28] },
      climate: { atmos: 'day', weather: 'rain', tint: {
        dawn: { top: 0x2e3a56, horizon: 0xc8a0a0, fog: 0x8a8896, fogD: 0.0017, sunC: 0xffb090, sunI: 2.2, hemiSky: 0x8a96b8, hemiGround: 0x34383c, hemiI: 0.9 },
        day: { top: 0x3e4a5a, horizon: 0x8e9aa2, fog: 0x8e9aa2, fogD: 0.0012, az: 2.4, elev: 0.38, sunC: 0xe8e4dc, sunI: 2.6, hemiSky: 0x9aaabc, hemiGround: 0x3c4448, hemiI: 1.35 },
        dusk: { top: 0x1c2440, horizon: 0xc47862, fog: 0x86646c, fogD: 0.0019, sunC: 0xff8a5a, sunI: 2.6, hemiSky: 0x7c92c4, hemiGround: 0x30343c, hemiI: 1.0 },
        night: { top: 0x060a1c, horizon: 0x24344e, fog: 0x1a2840, fogD: 0.0021, sunC: 0x9fb8f0, sunI: 1.5, elev: 0.5, hemiSky: 0x6a82b8, hemiGround: 0x243038, hemiI: 1.55, exposure: 1.2 },
      } },
      landmarks: {
        'great-keep': lm(0, kz, 82, 26), 'great-hall': { pos: [-14, 48, kz + 24], r: 12 }, 'sea-tower': lm(st[0], st[1], 98, 14), 'bloody-keep': lm(-55, 60, 60, 16), 'kitchen-keep': lm(50, 62, 56, 12),
        'stone-bridges': lm(-3, -14, 44, 18), 'gatehouse-and-wall': lm(0, 118, 56, 22), 'sea-stacks': lm(92, 18, 36, 14), 'longship-cove': { pos: [116, 14, 92], r: 20 },
      },
    };
  },
};
