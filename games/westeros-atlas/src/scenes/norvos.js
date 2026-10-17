// Norvos — sparse. Books/TWOIAF: an inland Free City in the Hills of Norvos on the eastern bank of the Noyne, ruled through bearded priests, famed for its bells.
// Everything else (bluff shape, tiered streets, buildings) is restrained interpretation.
// Polish pass: honey limestone walls and ring streets on a terraced bluff, verdigris-capped bell towers with swaying bells, terracotta roofs jittered per house,
// patchwork fields + vineyard rows in the hills, a hazy golden-green valley, river mist and doves. Budget ~170k tris.
import * as K from '../kit/index.js';
const { THREE, Batch, Inst, G, tri, flat, glow } = K;

const _hsl = {};
function jit(hex, r, dh = 0.012, ds = 0.07, dl = 0.05) {
  const c = new THREE.Color(hex); c.getHSL(_hsl);
  return c.setHSL((_hsl.h + r.range(-dh, dh) + 1) % 1, K.clamp(_hsl.s + r.range(-ds, ds), 0, 1), K.clamp(_hsl.l + r.range(-dl, dl), 0, 1));
}
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
/** Clone of a kit triplanar material with per-pixel limestone strata on steep faces (vertex colours are too coarse to carry the banding). */
function strata(base) {
  const m = base.clone(), orig = base.onBeforeCompile;
  m.onBeforeCompile = (sh) => {
    orig(sh);
    sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      {
        float cl_ = smoothstep(0.2, 0.5, 1.0 - nrmW_.y);
        float wob_ = sin(vWPos.x * 0.21 + vWPos.z * 0.13) * 0.4 + sin(vWPos.z * 0.37 + vWPos.x * 0.05) * 0.25;
        float yb_ = vWPos.y / 4.2 + wob_ * 1.6, id_ = floor(yb_), fr_ = fract(yb_);
        float hb_ = fract(sin(id_ * 12.9898) * 43758.5453);
        float seam_ = smoothstep(0.0, 0.1, fr_) * (1.0 - smoothstep(0.94, 1.0, fr_)) * 0.05 + 0.95;
        vec3 tint_ = mix(vec3(0.62, 0.6, 0.6), vec3(1.25, 1.16, 1.0), hb_);
        float stk_ = 0.7 + 0.5 * smoothstep(-0.3, 0.8, sin(vWPos.x * 1.3 + vWPos.z * 0.9 + sin(vWPos.z * 0.3 + vWPos.y * 0.08) * 3.0) * sin(vWPos.z * 0.7 - vWPos.x * 0.45 + 1.0));
        diffuseColor.rgb *= mix(vec3(1.0), tint_ * seam_ * stk_, cl_);
      }`);
  };
  m.customProgramCacheKey = () => (base.customProgramCacheKey ? base.customProgramCacheKey() : '') + '|strata';
  return m;
}
const hash2 = (i, j) => { const t = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return t - Math.floor(t); };
const dummyMat = flat(0xffffff);
/** Bake a small prototype geometry (vertex colours = grey ramp) from a Batch recipe, for instanced trees. */
const proto = (fn) => { const bb = new Batch(); fn(bb); return bb.build({}).children[0].geometry; };
const g = (v) => new THREE.Color(v, v, v);

function treeProtos() {
  const oak = proto((b) => { // lumpy broadleaf crown
    for (const [x, y, z, r, k] of [[0, 1.6, 0, 1.9, 0.78], [0.95, 1.9, 0.35, 1.25, 0.88], [-0.9, 2.0, -0.45, 1.3, 0.92], [0.1, 3.3, 0.1, 1.35, 1.1], [-0.2, 2.5, 0.9, 1.1, 1.0]]) b.sphere(dummyMat, x, y, z, r, { seg: 7, sy: 0.82, color: g(k) });
  });
  const pine = proto((b) => { [[1.0, 1.9, 2.8, 0.74], [2.6, 1.5, 2.6, 0.9], [4.2, 1.05, 2.4, 1.08]].forEach(([y, r, h, k]) => b.cone(dummyMat, 0, y, 0, r, h, { seg: 8, color: g(k) })); });
  const slim = proto((b) => { b.cone(dummyMat, 0, 0.8, 0, 0.95, 7.6, { seg: 7, color: g(0.85) }); b.sphere(dummyMat, 0, 4.2, 0, 0.85, { seg: 6, sy: 2.4, color: g(1.0) }); });
  const trunk = proto((b) => b.cyl(dummyMat, 0, 0, 0, 0.28, 2.8, { top: 0.7, seg: 5, color: g(1) }));
  return { oak, pine, slim, trunk };
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root, rr = K.rng(77);
    const CX = 60, CZ = 0, R = 90;
    const ell = (x, z) => Math.hypot((x - CX) / (R * 1.05), (z - CZ) / (R * 0.85));
    const riverX = (z) => -110 + Math.sin(z * 0.012) * 18 + Math.sin(z * 0.031 + 1) * 5;
    const heightAt = (x, z) => {
      const rx = riverX(z), dx = x - rx + (K.fbm(z * 0.035, x * 0.01, 2, 21) - 0.5) * 10;
      const cliff = K.smoothstep(26, 43, dx);
      const plateau = 34 * cliff * (1 - K.smoothstep(150, 260, dx) * 0.45);
      const crag = (K.fbm(x * 0.07, z * 0.07, 3, 14) - 0.5) * 6 * cliff * (1 - cliff) * 4;
      const hills = (K.fbm(x * 0.012, z * 0.012, 3, 8) - 0.35) * 26 * K.smoothstep(40, 200, Math.abs(dx - 70)) + (K.fbm(x * 0.03, z * 0.03, 2, 3) - 0.5) * 2;
      let h = 1.5 + plateau + crag + hills * (dx > 0 ? 0.2 + 0.8 * K.smoothstep(26, 44, dx) : 0.6 * K.smoothstep(8, 45, -dx));
      h = K.lerp(h, -4, 1 - K.smoothstep(6, 22, Math.abs(dx)));
      const e = ell(x, z);
      h = K.lerp(h, 34.5 + 3.5 * (1 - Math.min(e, 1)), (1 - K.smoothstep(0.98, 1.4, e)) * cliff);   // gentle dome under the town
      return h;
    };
    const H = heightAt;

    // ---- terrain: golden-green meadow, patchwork fields, banded limestone bluff, reed banks, dusty town ground
    const grass = new THREE.Color(0x7b9154), dry = new THREE.Color(0xb2a766), lime1 = new THREE.Color(0xdcd2b4), lime2 = new THREE.Color(0xa0987e), mud = new THREE.Color(0x5a5a3c), reed = new THREE.Color(0x6a8444), dust = new THREE.Color(0xc2b090), c = new THREE.Color(), fc = new THREE.Color();
    const ROCKS = [0xd2c9b2, 0xaaa18c, 0x8a8478, 0xbfb094];
    const FIELDS = [0xcdb862, 0x86a44e, 0x9aa856, 0xa08a54, 0x6f9448, 0xd2c27a], th = 0.38, ct = Math.cos(th), st = Math.sin(th);
    const terr = K.terrain({ size: 1000, seg: q.seg(140), heightAt, kind: 'rock', scale: 10, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.01, z * 0.01, 2, 5), n2 = K.fbm(x * 0.06, z * 0.06, 2, 17), e = ell(x, z);
      c.copy(grass).lerp(dry, K.clamp(n * 1.5 - 0.3, 0, 1)).multiplyScalar(0.9 + 0.2 * n2);
      const fm = K.smoothstep(1.22, 1.6, e) * (1 - K.clamp(s * 9, 0, 1)) * K.smoothstep(-60, -20, x) * K.smoothstep(1.3, 2.4, h);
      if (fm > 0.01) { const u = (x * ct + z * st) / 36, v = (-x * st + z * ct) / 24, i = Math.floor(u), j = Math.floor(v), eu = Math.min(u - i, 1 - (u - i)) * 36, ev = Math.min(v - j, 1 - (v - j)) * 24;
        fc.setHex(FIELDS[Math.floor(hash2(i, j) * FIELDS.length)]); fc.multiplyScalar(0.92 + 0.12 * n2); if (Math.min(eu, ev) < 2.4) fc.lerp(grass, 0.6).multiplyScalar(0.8); c.lerp(fc, fm * 0.9); }
      const rockT = K.clamp(s * 2.6, 0, 0.92); const stk = K.fbm((x + z * 0.3) * 0.16, h * 0.22, 2, 31), band = Math.floor((h + (n2 - 0.5) * 5 + stk * 3) / 2.6); fc.setHex(ROCKS[Math.floor(hash2(band, 7) * 4)]).multiplyScalar(0.7 + 0.45 * stk + 0.25 * K.smoothstep(2, 24, h)); c.lerp(fc, rockT);
      if (h < 1.5) c.lerp(h < 0.2 ? mud : reed, K.clamp((1.5 - h) / 1.3, 0, 0.9));
      c.lerp(dust, 0.9 * (1 - K.smoothstep(0.9, 1.08, e)));
      return c; } });
    terr.material = strata(terr.material); root.add(terr);
    const wat = K.water({ w: 120, d: 760, seg: q.seg(34), level: 0, heightAt, center: [-110, 0], deep: 0x1f4f5c, shallow: 0x74a69a, opacity: 0.92, choppy: 0.3, speed: 0.45 });
    root.add(wat); ctx.registerWater(wat);

    // ---- materials (near-white tints; colour goes in per-object args)
    const stone = tri('stone', { color: 0xffffff, scale: 7, snow: false, bump: 0.8 }), plaster = tri('plaster', { color: 0xffffff, scale: 6, snow: false, bump: 0.6 });
    const tile = tri('tile', { color: 0xffffff, scale: 4, snow: false, rough: 0.78 }), copper = tri('tile', { color: 0xffffff, scale: 3, snow: false, rough: 0.5, metal: 0.25, bump: 0.5 });
    const wood = tri('wood', { color: 0xffffff, scale: 4, snow: false }), cobble = tri('cobble', { color: 0xffffff, scale: 6, snow: false });
    const gold = flat(0xffffff, { rough: 0.35, metal: 0.6, flatShading: false }), dark = flat(0x0a0907), soft = flat(0xffffff, { rough: 1, flatShading: false });
    const win = glow(0xffc46b), lan = glow(0xffa84a, 1.3), belfry = glow(0xffb45a, 1.1);
    const b = new Batch();
    const LIME = 0xe2d2a8, LIME_D = 0xb9a67e, TERRA = [0xa4553a, 0xb4623e, 0x93492f, 0xc07548], PLASTERS = [0xeadcbc, 0xdcc9a0, 0xf0e4c8, 0xe6d2a8, 0xd9bf94, 0xe9cfa0], VERD = 0x5eab96;

    // ---- walls on the plateau, round towers with terracotta caps, east gate
    const NW = 44, wp = Array.from({ length: NW }, (_, i) => { const a = (i / NW) * Math.PI * 2, k = 1 + Math.sin(a * 3) * 0.04; return [CX + Math.cos(a) * R * 1.05 * k, CZ + Math.sin(a) * R * 0.85 * k]; });
    K.wall(b, wp, { h: 10, t: 3.4, mat: stone, capMat: stone, heightAt: H, closed: true, color: LIME, merlon: 1.3, sink: 4 });
    for (let i = 0; i < NW; i += 1) { const A = wp[i], B2 = wp[(i + 1) % NW], dx = B2[0] - A[0], dz = B2[1] - A[1], len = Math.hypot(dx, dz), mx = (A[0] + B2[0]) / 2, mz = (A[1] + B2[1]) / 2, y0 = Math.min(H(A[0], A[1]), H(B2[0], B2[1]));
      b.box(stone, mx, y0 - 1, mz, len + 0.5, 2.4, 4.6, K.headingX(dx, dz), shade(LIME, 0.82)); }   // battered plinth
    wp.forEach(([x, z], i) => { if (i % 4 !== 2) return; const y = H(x, z);
      K.tower(b, x, z, { r: 3.6, h: 15, y, mat: stone, roofMat: tile, roof: 'cone', roofH: 7.5, seg: 12, windows: false, color: LIME, roofColor: TERRA[i % 4] });
      b.cyl(stone, x, y + 8, z, 3.9, 0.7, { seg: 12, color: shade(LIME, 0.9) }); });
    const GX = CX + R * 1.05, gy = H(GX, 0);
    K.gatehouse(b, GX, 0, { y: gy, ry: Math.PI / 2, mat: stone, roofMat: tile, w: 15, d: 8.5, h: 13, gate: 4.8, wood, towerR: 3.6, color: LIME, roofColor: 0xa4553a });
    b.box(dark, GX, gy, 0, 8.8, 4.6, 5, Math.PI / 2);

    // ---- town: houses on concentric ring streets (radial lanes left open), jittered per building
    const lanes = [0, 1.25, 2.55, 3.85, 5.05], plazaC = [64, 6], towers = [[70, 10, 30], [30, -25, 24], [95, -35, 22], [40, 45, 21]], TX = 100, TZ = 28;
    const placed = [];
    const dwelling = (x, z, w, d, h, ry, kind, lowTown) => {
      const y = H(x, z), c1 = Math.cos(ry), s1 = Math.sin(ry), wc = jit(rr.pick(PLASTERS), rr), rc = jit(rr.pick(TERRA), rr, 0.012, 0.1, 0.06), rh = Math.min(w, d) * 0.5 + 0.9;
      b.box(stone, x, y - 1.4, z, w + 0.5, 2.4, d + 0.5, ry, shade(LIME_D, 0.85));
      b.box(plaster, x, y + 1.0, z, w, h - 1.0, d, ry, wc);
      if (kind === 'tall') b.box(wood, x, y + h * 0.55, z, w + 0.5, 0.3, d + 0.5, ry, 0x4d3a28);
      b.box(plaster, x, y + h - 0.4, z, w + 0.6, 0.8, d + 0.6, ry, shade(0xf4ead2, 0.96));
      b.prism(tile, x, y + h, z, w + 1.0, rh, d + 1.0, ry, rc);
      if (rr() < 0.4) b.box(stone, x + c1 * w * 0.28, y + h + rh * 0.3, z - s1 * w * 0.28, 0.9, rh + 1.3, 0.9, ry, 0xa49480);
      for (const sd of [-1, 1]) { for (const lx of [-w * 0.24, w * 0.24]) b.box(win, x + c1 * lx + s1 * sd * (d / 2 + 0.05), y + h * 0.5, z - s1 * lx + c1 * sd * (d / 2 + 0.05), 0.8, 1.1, 0.12, ry);
        if (sd > 0 && !lowTown) b.box(dark, x + s1 * (d / 2 + 0.05), y + 1.0, z + c1 * (d / 2 + 0.05), 1.0, 2.0, 0.12, ry); }
      placed.push({ x, z, h: h + rh });
    };
    for (let ri = 0; ri < 7; ri++) {
      const rad = 0.3 + ri * 0.098, circ = Math.PI * 2 * R * 0.93 * rad, n = Math.floor(circ / 7.4);
      for (let k = 0; k < n; k++) {
        const a = (k + rr.range(-0.15, 0.15)) / n * Math.PI * 2 + ri * 0.4, k3 = 1 + Math.sin(a * 3) * 0.04;
        const x = CX + Math.cos(a) * R * 1.05 * rad * k3, z = CZ + Math.sin(a) * R * 0.85 * rad * k3, rw = Math.hypot(x - CX, z - CZ);
        if (lanes.some((L) => rw * Math.abs(Math.sin(a - L)) < 3.4 && Math.cos(a - L) > 0)) continue;
        if (Math.hypot(x - plazaC[0], z - plazaC[1]) < 18 || Math.abs(x - TX) < 22 && Math.abs(z - TZ) < 17 || towers.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 8)) continue;
        const ry = Math.atan2(-Math.cos(a), -Math.sin(a)) + rr.range(-0.08, 0.08);
        dwelling(x, z, rr.range(4.6, 6.6), rr.range(4.6, 6), rr.range(4.6, 8.4), ry, rr() < 0.3 ? 'tall' : 'gable');
      }
    }
    // plaza with kerb, central fountain
    { const py = H(plazaC[0], plazaC[1]); b.cyl(cobble, plazaC[0], py - 0.7, plazaC[1], 15, 1.1, { seg: 30, color: 0xb2a58a }); b.cyl(stone, plazaC[0] - 2, py + 0.4, plazaC[1] - 1, 2.4, 0.9, { seg: 12, color: LIME_D }); b.cyl(stone, plazaC[0] - 2, py + 1.3, plazaC[1] - 1, 0.5, 1.8, { seg: 8, color: LIME }); }

    // ---- bell towers: banded stone shafts, open belfries, verdigris spires, gold finials; bells swing (see onUpdate)
    const bells = [];
    towers.forEach(([x, z, sh], ti) => {
      const y = H(x, z), w = ti === 0 ? 7.2 : 6, bt = y + sh, pier = 1.25, bh = 5.4;
      b.box(stone, x, y - 3, z, w + 1.8, 5.4, w + 1.8, 0, shade(LIME, 0.8));
      b.box(stone, x, y + 2, z, w, sh - 2, w, 0, LIME);
      for (const f of [0.3, 0.62]) b.box(stone, x, y + sh * f, z, w + 0.7, 0.55, w + 0.7, 0, shade(LIME, 0.92));
      for (let k2 = 0; k2 < 4; k2++) { const a = k2 * Math.PI / 2; b.box(win, x + Math.cos(a) * (w / 2 + 0.04), y + sh * 0.47, z + Math.sin(a) * (w / 2 + 0.04), 0.5, 2.0, 0.5, -a + Math.PI / 2); b.box(dark, x + Math.cos(a) * (w / 2 + 0.04), y + sh * 0.78, z + Math.sin(a) * (w / 2 + 0.04), 0.35, 1.6, 0.5, -a + Math.PI / 2); }
      b.box(stone, x, bt, z, w + 1.4, 0.9, w + 1.4, 0, shade(LIME, 0.95));
      b.box(belfry, x, bt + 0.9, z, w - 1.7, bh - 0.4, w - 1.7);                         // lit belfry interior
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) b.box(stone, x + sx * (w / 2 - pier / 2), bt + 0.9, z + sz * (w / 2 - pier / 2), pier, bh, pier, 0, LIME);
      for (let k2 = 0; k2 < 4; k2++) { const a = k2 * Math.PI / 2; b.box(stone, x + Math.cos(a) * (w / 2 - 0.3), bt + 0.9 + bh * 0.66, z + Math.sin(a) * (w / 2 - 0.3), 0.6, 0.55, w - 2.4, -a + Math.PI / 2 + Math.PI / 2, shade(LIME, 0.9)); } // arch lintels
      b.box(stone, x, bt + bh + 0.9, z, w + 1.4, 0.9, w + 1.4, 0, shade(LIME, 0.92));
      b.cone(copper, x, bt + bh + 1.8, z, w * 0.78, sh * 0.5, { seg: 8, color: VERD });
      b.cyl(gold, x, bt + bh + 1.8 + sh * 0.5, z, 0.22, 2.6, { seg: 6, color: 0xe6b43c }); b.sphere(gold, x, bt + bh + 1.8 + sh * 0.5 + 2.4, z, 0.5, { seg: 8, color: 0xf0c050 });
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) b.cone(copper, x + sx * (w / 2 + 0.1), bt + bh + 1.8, z + sz * (w / 2 + 0.1), 0.7, 3.2, { seg: 6, color: VERD });
      bells.push({ x, y: bt + bh + 0.7, z, ph: ti * 1.7 });
    });
    const bellGeo = new THREE.LatheGeometry([[0.18, 1.9], [0.5, 1.8], [0.62, 1.2], [0.9, 0.45], [1.18, 0.0], [1.0, -0.05], [0.0, 0.2]].map(([r, y]) => new THREE.Vector2(r, y)), 12);
    const bellMat = new THREE.MeshStandardMaterial({ color: 0xd9a838, roughness: 0.38, metalness: 0.75, emissive: 0x3a2205, emissiveIntensity: 0.5 });
    const bellMeshes = bells.map((o) => { const grp = new THREE.Group(); grp.position.set(o.x, o.y, o.z); const m = new THREE.Mesh(bellGeo, bellMat); m.position.y = -1.9; m.castShadow = true; grp.add(m); root.add(grp); return grp; });
    ctx.onUpdate((dt, t) => bellMeshes.forEach((g2, i) => { g2.rotation.z = Math.sin(t * 0.9 + bells[i].ph) * 0.22 * (0.4 + 0.6 * Math.max(0, Math.sin(t * 0.17 + i * 2.3))); }));

    // ---- temple of the bearded priests (interpretive): stepped platform, columned portico facing the plaza, terracotta roof
    { const ty = H(TX, TZ);
      b.box(stone, TX, ty - 1.6, TZ, 38, 2.8, 28, 0, shade(LIME, 0.85)); b.box(stone, TX, ty + 1.2, TZ, 35, 1.1, 25, 0, shade(LIME, 0.92)); b.box(stone, TX, ty + 2.3, TZ, 32, 1.1, 22, 0, LIME);
      const py = ty + 3.4;
      b.box(plaster, TX + 1.5, py, TZ, 24, 11, 15, 0, 0xeadcbc); b.box(plaster, TX + 1.5, py + 10.4, TZ, 25, 1.1, 16, 0, 0xf4ead2);
      b.prism(tile, TX + 1.5, py + 11.5, TZ, 26, 5.8, 17.5, 0, 0xa4553a);
      const cols = Array.from({ length: 6 }, (_, i) => [TX - 11.8, TZ - 5.5 + i * 2.2]); K.columns(b, cols, { h: 10, r: 0.62, mat: stone, y: py, color: 0xefe4c8 });
      b.box(stone, TX - 11.8, py + 10.5, TZ, 3.2, 1.3, 14.4, 0, LIME); b.prism(stone, TX - 11.8, py + 11.8, TZ, 14.6, 3.4, 3.4, Math.PI / 2, 0xe4d6b0);
      for (let i = 0; i < 4; i++) b.box(win, TX + 1.5 + 5.5 - i * 5.5 * 0 + (i - 1.5) * 5.4, py + 3.5, TZ + 7.55, 1.4, 3.6, 0.2);
      b.box(win, TX - 8.6, py + 0.0, TZ, 0.3, 5.5, 3.4);                                                              // lit doorway
      b.cone(copper, TX + 12, py + 11.5, TZ - 8, 1.3, 5, { seg: 6, color: VERD }); b.cone(copper, TX + 12, py + 11.5, TZ + 8, 1.3, 5, { seg: 6, color: VERD });
      b.ribbon(cobble, [[plazaC[0] + 14, plazaC[1] + 1], [TX - 14, TZ - 1]], 6, H, 0.3, 0xb2a58a);
      for (const sz of [-1, 1]) { b.cyl(stone, TX - 18, ty + 2.2, TZ + sz * 5, 0.6, 1.6, { seg: 8, color: LIME_D }); b.box(lan, TX - 18, ty + 3.8, TZ + sz * 5, 0.9, 0.9, 0.9); }
    }
    // main street from the gate to the plaza
    b.ribbon(cobble, K.smoothPath([[GX + 6, 0], [GX - 20, 1], [CX + 28, 3], [plazaC[0] + 12, plazaC[1] - 1]], 5), 6, H, 0.3, 0xb2a58a);

    // ---- bluff-lip promenade: balustrade + lanterns above the river, and a small belvedere
    const lipX = (z) => { let x = riverX(z) + 18; while (x < riverX(z) + 90 && H(x, z) < 31.5) x += 1; return x; };
    const lip = []; for (let z = -66; z <= 66; z += 6) lip.push([lipX(z) + 3, z]);
    K.wall(b, lip, { h: 1.5, t: 0.9, crenel: false, mat: stone, heightAt: H, sink: 2.5, color: LIME });
    lip.forEach(([x, z], i) => { if (i % 2) return; const y = H(x, z); b.box(stone, x, y, z, 0.9, 2.4, 0.9, 0, shade(LIME, 0.95)); b.box(lan, x, y + 2.4, z, 0.6, 0.6, 0.6); });
    { const [bx, bz] = [lipX(0) + 9, 0], by = H(bx, bz); b.cyl(stone, bx, by - 0.5, bz, 5.2, 1.0, { seg: 12, color: LIME }); K.columns(b, Array.from({ length: 6 }, (_, i) => [bx + Math.cos(i * 1.047) * 3.8, bz + Math.sin(i * 1.047) * 3.8]), { h: 4.2, r: 0.3, mat: stone, y: by + 0.5, color: 0xefe4c8 });
      b.cyl(stone, bx, by + 4.9, bz, 4.6, 0.5, { seg: 12, color: LIME }); b.dome(copper, bx, by + 5.4, bz, 4.4, { seg: 12, sy: 0.7, color: VERD }); b.sphere(gold, bx, by + 8.4, bz, 0.4, { seg: 6, color: 0xf0c050 }); }

    // ---- lower town in the hills east of the walls + haystacks, farmsteads
    const lowPts = K.scatter({ rng: K.rng(42), count: q.dens(70), bounds: [CX + 40, -190, CX + 230, 190], minDist: 12, accept: (x, z) => ell(x, z) > 1.22 && H(x, z) > 4 && H(x, z) < 32 && x > CX + 20 });
    lowPts.forEach(([x, z]) => { const aa = Math.atan2(z - CZ, x - CX); dwelling(x, z, rr.range(4.6, 6.4), rr.range(4.6, 6.2), rr.range(3.8, 5.6), rr() < 0.5 ? aa + Math.PI / 2 : Math.round(rr() * 4) * 1.57 + rr.range(-0.2, 0.2), 'gable', true); });
    for (let i = 0; i < 16; i++) { const [x, z] = [rr.range(CX + 140, CX + 300), rr.range(-170, 170)]; if (ell(x, z) < 1.3 || H(x, z) < 4) continue; b.cone(soft, x, H(x, z), z, 2.1, 3.2, { seg: 8, color: 0xd2b45a }); }
    // road out of the gate into the hills
    b.ribbon(cobble, K.smoothPath([[GX + 4, 0], [CX + 140, 30], [CX + 200, 18], [CX + 290, 66]], 6), 5, H, 0.35, 0xa89c80);
    // vineyard rows on the south slopes
    const vine = flat(0xffffff, { rough: 1, flatShading: false });
    for (const [vx, vz, vl, rows, ang] of [[CX + 20, 108, 70, 14, 0.12], [CX + 150, -110, 60, 10, -0.2]]) for (let r = 0; r < rows; r++) {
      const pts = []; for (let s2 = 0; s2 <= vl; s2 += 7) { const ox = s2 - vl / 2, oz = (r - rows / 2) * 3.4; pts.push([vx + ox * Math.cos(ang) - oz * Math.sin(ang), vz + ox * Math.sin(ang) + oz * Math.cos(ang)]); }
      if (pts.every(([x, z]) => H(x, z) > 3)) b.ribbon(vine, pts, 1.1, H, 0.45, r % 2 ? 0x4c6a34 : 0x58763a);
    }
    root.add(b.build({}));

    // ---- trees: instanced oak / pine / poplar with baked grey ramps + per-instance hue
    const P = treeProtos(), leafM = tri('grass', { color: 0xffffff, scale: 2.4, rough: 1, snow: false, bump: 0.5 }), trunkM = tri('wood', { color: 0xffffff, scale: 2, snow: false });
    const nearTown = (x, z) => ell(x, z) < 1.12 || Math.abs(x - riverX(z)) < 26 || H(x, z) < 1.2 || (Math.abs(x - TX) < 22 && Math.abs(z - TZ) < 17);
    const oakI = new Inst(P.oak, leafM), pineI = new Inst(P.pine, leafM), slimI = new Inst(P.slim, leafM), trunkI = new Inst(P.trunk, trunkM);
    const oakC = [0x6f9a3a, 0x7fa642, 0x95a840, 0x5e8a38, 0xb0a448], pineC = [0x2f5a3a, 0x386644, 0x2a4f35], tr = K.rng(5);
    for (const [x, z] of K.scatter({ rng: tr, count: q.dens(420), bounds: [-380, -330, 440, 330], minDist: 8, avoid: nearTown, accept: (x, z) => K.fbm(x * 0.02, z * 0.02, 2, 40) > 0.47 || tr() < 0.08 })) {
      const y = H(x, z), k = tr.range(0.9, 1.5); if (y < 2) continue;
      if (y > 26 && tr() < 0.35) { pineI.add(x, y, z, k * 1.1, k * 1.25, k * 1.1, tr() * 6, pineC[tr.int(0, 2)]); trunkI.add(x, y - 0.1, z, 0.6 * k, 0.8 * k, 0.6 * k, 0, 0x6a5238); }
      else { oakI.add(x, y, z, k, k, k, tr() * 6, oakC[tr.int(0, 4)]); trunkI.add(x, y - 0.1, z, 0.8 * k, 0.9 * k, 0.8 * k, 0, 0x6a5238); }
    }
    for (const [x, z] of K.scatter({ rng: K.rng(9), count: q.dens(90), bounds: [CX + 130, -170, CX + 300, 190], minDist: 6, accept: (x, z) => H(x, z) > 4 && ell(x, z) > 1.3 && Math.abs(Math.sin((x * 0.5 + z) * 0.05)) > 0.0 })) { const y = H(x, z), k = tr.range(0.9, 1.4); slimI.add(x, y, z, k * 0.9, k * 1.3, k * 0.9, 0, [0x3f6a3c, 0x4a7640][tr.int(0, 1)]); trunkI.add(x, y - 0.1, z, 0.5 * k, 0.4 * k, 0.5 * k, 0, 0x6a5238); }
    // slim cypresses along the bluff promenade and the gate road; willows by the west bank
    for (let z = -60; z <= 60; z += 12) { const x = lipX(z) + 7, y = H(x, z); if (Math.abs(z) < 10) continue; slimI.add(x, y, z, 1.0, 1.3, 1.0, 0, 0x3a6838); }
    for (const [x, z] of K.scatter({ rng: K.rng(11), count: q.dens(60), bounds: [-190, -260, -128, 260], minDist: 8, accept: (x, z) => x < riverX(z) - 12 && H(x, z) > 1.2 })) { const y = H(x, z), k = tr.range(1, 1.5); oakI.add(x, y, z, k, k * 0.9, k, tr() * 6, [0x6a9a58, 0x7aa860][tr.int(0, 1)]); trunkI.add(x, y - 0.1, z, 0.9 * k, 0.9 * k, 0.9 * k, 0, 0x6a5238); }
    // scrub clinging to the bluff face
    for (const [x, z] of K.scatter({ rng: K.rng(13), count: q.dens(70), bounds: [-150, -250, -30, 250], minDist: 6, accept: (x, z) => { const y = H(x, z); return y > 5 && y < 30 && Math.abs(H(x + 3, z) - H(x - 3, z)) > 2; } })) { const y = H(x, z), k = tr.range(0.5, 0.9); oakI.add(x, y - 0.3, z, k * 1.2, k, k * 1.2, tr() * 6, [0x4d6e34, 0x5e7a38, 0x6a7c3c][tr.int(0, 2)]); }
    const rockI = new Inst(proto((bb) => { bb.sphere(dummyMat, 0, 0, 0, 1.6, { seg: 5, sy: 0.7, color: g(0.9) }); bb.sphere(dummyMat, 1.2, 0, 0.5, 1.0, { seg: 5, sy: 0.8, color: g(1.05) }); }), tri('rock', { color: 0xffffff, scale: 3, snow: false, bump: 1.1 }));
    for (const [x, z] of K.scatter({ rng: K.rng(14), count: q.dens(45), bounds: [-150, -250, -30, 250], minDist: 9, accept: (x, z) => { const y = H(x, z); return y > 4 && y < 33 && Math.abs(H(x + 3, z) - H(x - 3, z)) > 2.4; } })) { const k = tr.range(1.2, 2.6); rockI.add(x, H(x, z) - 0.9, z, k * 1.3, k, k, tr() * 6, [0xd0c6aa, 0xb4a888, 0x9a9484][tr.int(0, 2)]); }
    for (const i of [oakI, pineI, slimI, trunkI, rockI]) if (i.items.length) root.add(i.build());

    // ---- life: river barges, ferry, doves round the bells, chimney smoke, river mist, banners, walkers, clouds
    const boats = [], sr = K.rng(3);
    for (let i = 0; i < q.dens(5); i++) { const s = K.ship('barge', { len: 11, hull: [0x6a5430, 0x5b4129, 0x7a3a2a][i % 3], sail: [0xe0cfa0, 0xd8c08a, 0xc9aa62][i % 3] }); root.add(s); boats.push({ s, z0: sr.range(-300, 300), v: sr.range(3, 5) * (i % 2 ? 1 : -1), o: sr.range(-0.4, 0.4), ph: sr.range(0, 6) }); }
    ctx.onUpdate((dt, t) => { for (const o of boats) { const z = ((o.z0 + t * o.v + 380) % 760 + 760) % 760 - 380; o.s.position.set(riverX(z) + o.o * 8, 0.05, z); K.animateShip(o.s, t, o.ph); o.s.rotation.y = o.v > 0 ? -Math.PI / 2 : Math.PI / 2; } });
    root.add(K.smoke(placed.filter((_, i) => i % 6 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 2, p.z]), { size: 13, rise: 10, opacity: 0.2, color: 0xe4dccd }));
    root.add(K.smoke(Array.from({ length: 9 }, (_, i) => [riverX(-240 + i * 60) + (i % 2 ? 6 : -6), 0.8, -240 + i * 60]), { color: 0xe8efee, size: 90, rise: 7, opacity: 0.16, perStack: 6, spread: 22 }));
    const dv = K.birds({ center: [70, 58, 10], radius: 46, count: q.dens(14), color: 0xf4f0e6, size: 0.9, spreadY: 9, seed: 4, speed: 0.2 }); root.add(dv); ctx.onUpdate((dt, t) => dv.userData.update(t));
    const rv = K.birds({ center: [-110, 18, 0], radius: 120, count: q.dens(8), color: 0xdadad2, size: 1.2, spreadY: 6, seed: 8 }); root.add(rv); ctx.onUpdate((dt, t) => rv.userData.update(t));
    root.add(K.banners([[towers[0][0] + 0.4, H(70, 10) + 30 + 8, towers[0][1]], [GX - 6, gy + 13, -5], [GX - 6, gy + 13, 5]].map(([x, y, z], i) => ({ x, y, z, w: 2.6, h: 7, color: i ? 0x5eab96 : 0xc89a3a, ry: 0.5 }))));
    const wk = K.walkers({ paths: [[[GX, 0], [100, 3], [70, 8]], [[40, -20], [30, 30], [60, 50]], lip.filter((_, i) => i % 2 === 0).map(([x, z]) => [x + 7, z])], heightAt: H, count: q.dens(16), rng: K.rng(4), colors: [0x7a5c3a, 0x4d5a6a, 0x8a3b32, 0x57603a, 0xc9b890] }); root.add(wk); ctx.onUpdate((dt, t) => wk.userData.update(t));
    const cl = K.clouds({ y: 230, extent: 800, count: 9, opacity: 0.4, color: 0xfff2e0 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));
    const fire = K.fires([[TX - 18, H(TX, TZ) + 4, TZ - 5], [TX - 18, H(TX, TZ) + 4, TZ + 5]], { size: 4, light: q.low ? 0 : 1, intensity: 30 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 240, center: [40, 10, 0], minDistance: 15,
      hero: { pos: [-190, 74, 134], target: [48, 30, -6] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { top: 0x5d73a4, horizon: 0xf2c4a0, fog: 0xdcc0a6, fogD: 0.0021, sunC: 0xffc590, sunI: 2.7, az: 3.6, elev: 0.18, hemiSky: 0xaab4d8, hemiGround: 0x6e5a48, hemiI: 0.85 },
        day: { top: 0x4a86c6, horizon: 0xeadfc2, fog: 0xdcd6bc, fogD: 0.0017, sunC: 0xffe3b4, sunI: 3.3, az: 3.5, elev: 0.5, hemiSky: 0xb2cdea, hemiGround: 0x7c6f4c, hemiI: 0.95 },
        dusk: { top: 0x36417e, horizon: 0xf29a64, fog: 0xc98e78, fogD: 0.0018, sunC: 0xff9a58, sunI: 3.0, az: 3.4, elev: 0.14, hemiSky: 0xa4a2d4, hemiGround: 0x6a5456, hemiI: 1.05 },
        night: { top: 0x0a1233, horizon: 0x2b3d68, fog: 0x1c2a4a, fogD: 0.0021, sunC: 0xa2b8f4, sunI: 1.9, az: 3.2, hemiSky: 0x6a80bc, hemiGround: 0x2c3a42, hemiI: 1.5 },
      } },
      landmarks: {
        'high-bluff': { ...lm(lipX(0) - 4, 0, 22, 12), cam: { pos: [-44, 54, 52], target: [-125, 14, -18] } }, 'bell-towers': lm(70, 10, 12, 50), 'bearded-priests-temple': lm(TX - 6, TZ, 14, 20), 'city-walls': lm(CX, CZ - 0.85 * R, 14, 14), 'noyne-river': lm(riverX(40), 40, 28, 4), 'lower-town': lm(CX + 130, 0, 36, 8), 'hills-of-norvos': lm(CX + 200, -110, 40, 20),
      },
    };
  },
};
