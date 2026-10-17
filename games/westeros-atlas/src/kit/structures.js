// Architectural building blocks. All write into a Batch (static merged geometry) so a whole city is a
// handful of draw calls. y arguments are base elevations; pass heightAt(x,z) to sit on terrain.
import * as THREE from 'three';
import { Batch, Inst, G } from './batch.js';
import { rng as makeRng } from './util.js';
import { tri, flat, glow } from './materials.js';

const TAU = Math.PI * 2;
/** Heading helper: rotation about Y that points local +X along (dx,dz). */
export const headingX = (dx, dz) => Math.atan2(-dz, dx);

export function wall(b, pts, { h = 10, t = 3, mat, capMat, crenel = true, heightAt = () => 0, closed = false, sink = 3, color = 0xffffff, walkway = true, merlon = 1.2 } = {}) {
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const A = pts[i], B = pts[(i + 1) % pts.length];
    const dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz);
    if (len < 0.01) continue;
    // split long segments so the wall hugs sloping ground
    const steps = Math.max(1, Math.ceil(len / 14));
    for (let s = 0; s < steps; s++) {
      const t0 = s / steps, t1 = (s + 1) / steps;
      const x0 = A[0] + dx * t0, z0 = A[1] + dz * t0, x1 = A[0] + dx * t1, z1 = A[1] + dz * t1;
      const g = Math.min(heightAt(x0, z0), heightAt(x1, z1), heightAt((x0 + x1) / 2, (z0 + z1) / 2));
      const top = Math.max(heightAt(x0, z0), heightAt(x1, z1)) + h;
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sl = Math.hypot(x1 - x0, z1 - z0) + 0.6;
      const ry = headingX(dx, dz);
      b.box(mat, cx, g - sink, cz, sl, top - g + sink, t, ry, color);
      if (crenel) {
        const nx = -dz / len, nz = dx / len; // perpendicular
        const count = Math.max(1, Math.round(sl / (merlon * 2)));
        for (const side of [-1, 1]) {
          for (let k = 0; k < count; k++) {
            const u = (k + 0.5) / count - 0.5;
            const px = cx + (dx / len) * u * sl + nx * side * (t / 2 - 0.25);
            const pz = cz + (dz / len) * u * sl + nz * side * (t / 2 - 0.25);
            b.box(capMat || mat, px, top, pz, merlon, 1.0, 0.5, ry, color);
          }
        }
      }
    }
  }
}

export function tower(b, x, z, { r = 4, h = 18, y = 0, mat, roofMat, roof = 'cone', roofH, seg = 14, crenel = true, windows = true, taper = 0.86, color = 0xffffff, roofColor = 0xffffff, glowMat = glow(0xffc870) } = {}) {
  b.cyl(mat, x, y - 3, z, r, h + 3, { top: taper, seg, color });
  const topR = r * taper + 0.2;
  if (roof === 'cone' || roof === 'spire') {
    const rh = roofH ?? r * (roof === 'spire' ? 4.5 : 2.2);
    b.cyl(mat, x, y + h, z, topR + 0.5, 0.9, { top: 1.12, seg, color });
    b.cone(roofMat || mat, x, y + h + 0.9, z, topR + 0.7, rh, { seg, color: roofColor });
  } else if (roof === 'dome') {
    b.cyl(mat, x, y + h, z, topR + 0.3, 0.8, { seg, color });
    b.dome(roofMat || mat, x, y + h + 0.8, z, topR + 0.3, { seg: Math.max(10, seg), sy: roofH ? roofH / (topR + 0.3) : 1, color: roofColor });
  } else if (roof === 'flat') {
    b.cyl(mat, x, y + h, z, topR + 0.6, 0.9, { top: 1.0, seg, color });
    if (crenel) {
      const n = Math.max(6, Math.round((TAU * (topR + 0.6)) / 2.4));
      for (let i = 0; i < n; i++) { const a = (i / n) * TAU; b.box(mat, x + Math.cos(a) * (topR + 0.45), y + h + 0.9, z + Math.sin(a) * (topR + 0.45), 1.2, 1.0, 0.6, -a + Math.PI / 2, color); }
    }
  }
  if (windows) {
    const lv = Math.max(1, Math.floor(h / 7));
    for (let i = 1; i <= lv; i++) {
      const a = (i * 2.4) % TAU, yy = y + (h * i) / (lv + 1);
      const rr = r * (1 - (1 - taper) * (i / (lv + 1))) + 0.05;
      b.box(glowMat, x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr, 0.5, 1.5, 0.12, -a + Math.PI / 2);
    }
  }
}

export function squareTower(b, x, z, { w = 8, d = w, h = 20, y = 0, ry = 0, mat, roofMat, roof = 'pyramid', roofH, crenel = true, color = 0xffffff, roofColor = 0xffffff, windows = true, glowMat = glow(0xffc870) } = {}) {
  b.box(mat, x, y - 3, z, w, h + 3, d, ry, color);
  const c = Math.cos(ry), s = Math.sin(ry);
  if (roof === 'pyramid') b.pyramid(roofMat || mat, x, y + h, z, w + 1.2, roofH ?? w * 0.9, d + 1.2, ry, roofColor);
  else if (roof === 'gable') b.prism(roofMat || mat, x, y + h, z, w + 1, roofH ?? w * 0.6, d + 1, ry, roofColor);
  else if (roof === 'flat') {
    b.box(mat, x, y + h, z, w + 1.2, 0.8, d + 1.2, ry, color);
    if (crenel) for (const [ox, oz, sx, sz] of [[0, d / 2 + 0.3, w / 1.6, 0.6], [0, -d / 2 - 0.3, w / 1.6, 0.6], [w / 2 + 0.3, 0, 0.6, d / 1.6], [-w / 2 - 0.3, 0, 0.6, d / 1.6]])
      b.box(mat, x + ox * c + oz * s, y + h + 0.8, z - ox * s + oz * c, sx, 1.0, sz, ry, color);
  }
  if (windows) for (let i = 1; i < Math.max(2, h / 8); i++) {
    const yy = y + (h * i) / Math.max(2, h / 8);
    b.box(glowMat, x + s * (d / 2 + 0.05) * 0 + c * 0 + s * (d / 2), yy, z + c * (d / 2), 0.7, 1.6, 0.12, ry);
  }
}

/** Big blocky keep with stepped parapets and corner turrets. */
export function keep(b, x, z, { w = 24, d = 20, h = 30, y = 0, ry = 0, mat, roofMat, turret = true, turretR = 3, turretH = 8, color = 0xffffff, roofColor = 0xffffff, roof = 'flat' } = {}) {
  squareTower(b, x, z, { w, d, h, y, ry, mat, roofMat, roof, crenel: true, color, roofColor });
  if (turret) {
    const c = Math.cos(ry), s = Math.sin(ry);
    for (const [ox, oz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const lx = (w / 2) * ox, lz = (d / 2) * oz;
      tower(b, x + lx * c + lz * s, z - lx * s + lz * c, { r: turretR, h: h + turretH, y, mat, roofMat: roofMat || mat, roof: 'cone', seg: 10, color, roofColor, windows: false });
    }
  }
}

/** Gatehouse spanning a wall: passage runs along local Z. */
export function gatehouse(b, x, z, { y = 0, ry = 0, mat, roofMat, w = 20, d = 12, h = 20, gate = 5, towerR = 4.5, color = 0xffffff, roofColor = 0xffffff, portcullis = true, wood } = {}) {
  const c = Math.cos(ry), s = Math.sin(ry);
  const off = (w - gate) / 4 + gate / 2;
  for (const sgn of [-1, 1]) {
    b.box(mat, x + sgn * off * c, y - 3, z - sgn * off * s, (w - gate) / 2, h + 3, d, ry, color);
    tower(b, x + sgn * (w / 2) * c, z - sgn * (w / 2) * s, { r: towerR, h: h + 5, y, mat, roofMat, roof: 'cone', seg: 12, color, roofColor });
  }
  b.box(mat, x, y + gate * 1.15, z, gate + 0.5, h - gate * 1.15, d, ry, color);
  b.box(mat, x, y + h, z, w, 0.9, d + 0.6, ry, color);
  if (portcullis && wood) for (let i = -2; i <= 2; i++) b.box(wood, x + i * 0.9 * c, y + gate * 0.55, z - i * 0.9 * s, 0.25, gate * 0.6, 0.25, ry);
}

/** Generic building. style: gable | hip | flat | tall | dome | longhouse */
export function house(b, x, y, z, { w = 6, d = 8, h = 5, ry = 0, style = 'gable', wallMat, roofMat, wall = 0xffffff, roof = 0xffffff, glowMat, chimney = false, windows = true, domeMat } = {}) {
  b.box(wallMat, x, y - 1.2, z, w, h + 1.2, d, ry, wall);
  const c = Math.cos(ry), s = Math.sin(ry);
  if (style === 'gable' || style === 'longhouse') b.prism(roofMat, x, y + h, z, w + 0.8, Math.min(w, d) * 0.55 + 1, d + 0.8, ry, roof);
  else if (style === 'hip') b.pyramid(roofMat, x, y + h, z, w + 0.9, Math.min(w, d) * 0.6 + 1, d + 0.9, ry, roof);
  else if (style === 'tall') {
    b.box(wallMat, x, y + h, z, w + 0.8, 0.5, d + 0.8, ry, wall); // jetty
    b.prism(roofMat, x, y + h + 0.5, z, w + 1.2, w * 0.6 + 1, d + 1.2, ry, roof);
  } else if (style === 'flat') {
    b.box(wallMat, x, y + h, z, w + 0.5, 0.7, d + 0.5, ry, wall);
  } else if (style === 'dome') {
    b.box(wallMat, x, y + h, z, w + 0.4, 0.5, d + 0.4, ry, wall);
    b.dome(domeMat || roofMat, x, y + h + 0.5, z, Math.min(w, d) * 0.46, { seg: 10, color: roof });
  }
  if (chimney) b.box(wallMat, x + c * w * 0.25, y + h, z - s * w * 0.25, 1, Math.min(w, d) * 0.55 + 2.2, 1, ry, wall);
  if (windows && glowMat) {
    for (const side of [-1, 1]) b.box(glowMat, x + s * side * (d / 2 + 0.05), y + h * 0.45, z + c * side * (d / 2 + 0.05), 0.9, 1.2, 0.12, ry);
  }
}

/** Poisson-ish scatter with min distance via spatial hash. avoid(x,z) -> true to reject. */
export function scatter({ rng = makeRng(1), count = 100, bounds, poly, minDist = 6, avoid = () => false, accept = () => true, tries = 40 }) {
  const out = [], cell = Math.max(1, minDist), hash = new Map();
  const [x0, z0, x1, z1] = bounds;
  const key = (i, j) => i * 73856093 ^ j * 19349663;
  let guard = count * tries;
  while (out.length < count && guard-- > 0) {
    const x = rng.range(x0, x1), z = rng.range(z0, z1);
    if (poly && !pointInPolyLocal(x, z, poly)) continue;
    if (avoid(x, z) || !accept(x, z)) continue;
    const ci = Math.floor(x / cell), cj = Math.floor(z / cell);
    let ok = true;
    for (let i = -1; i <= 1 && ok; i++) for (let j = -1; j <= 1 && ok; j++) {
      const list = hash.get(key(ci + i, cj + j)); if (!list) continue;
      for (const p of list) if ((p[0] - x) ** 2 + (p[1] - z) ** 2 < minDist * minDist) { ok = false; break; }
    }
    if (!ok) continue;
    const p = [x, z]; out.push(p);
    const k = key(ci, cj); (hash.get(k) || hash.set(k, []).get(k)).push(p);
  }
  return out;
}
function pointInPolyLocal(x, z, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** Fill an area with houses. palette: [{wall:hex, roof:hex}]. Returns placed list. */
export function town(b, { rng = makeRng(2), count = 200, bounds, poly, minDist = 7.5, size = [4.5, 8], height = [3.5, 7], heightAt = () => 0, avoid, accept, style = 'gable', styles, palette = [{ wall: 0xd9cdb4, roof: 0x8a4a38 }], wallMat, roofMat, glowMat, orient, chimneyChance = 0.25, domeMat }) {
  const pts = scatter({ rng, count, bounds, poly, minDist, avoid, accept });
  const placed = [];
  for (const [x, z] of pts) {
    const p = rng.pick(palette), w = rng.range(size[0], size[1]), d = rng.range(size[0], size[1]) * rng.range(1, 1.4), h = rng.range(height[0], height[1]);
    const ry = orient ? orient(x, z) : Math.round(rng() * 4) * (Math.PI / 2) + rng.range(-0.15, 0.15);
    const st = styles ? rng.pick(styles) : style;
    house(b, x, heightAt(x, z), z, { w, d, h, ry, style: st, wallMat, roofMat, glowMat, wall: p.wall, roof: p.roof, chimney: rng() < chimneyChance, domeMat });
    placed.push({ x, z, w, d, h, ry, style: st });
  }
  return placed;
}

/** Arched stone bridge from a=[x,y,z] to c=[x,y,z]. */
export function bridge(b, a, c, { w = 5, rise = 3, mat, color = 0xffffff, rail = true, thick = 1.0, pillars = false, sink = 4 } = {}) {
  const dx = c[0] - a[0], dz = c[2] - a[2], len = Math.hypot(dx, dz), N = Math.max(6, Math.ceil(len / 2.2));
  const ry = headingX(dx, dz);
  let prev = null;
  for (let i = 0; i <= N; i++) {
    const t = i / N, x = a[0] + dx * t, z = a[2] + dz * t, y = a[1] + (c[1] - a[1]) * t + Math.sin(t * Math.PI) * rise;
    if (prev) {
      const sl = Math.hypot(x - prev.x, z - prev.z) + 0.3, ang = Math.atan2(y - prev.y, Math.hypot(x - prev.x, z - prev.z));
      b.box(mat, (x + prev.x) / 2, (y + prev.y) / 2 - thick, (z + prev.z) / 2, sl, thick, w, ry, color, 0, ang);
      if (rail) for (const sd of [-1, 1]) {
        const nx = -dz / len, nz = dx / len;
        b.box(mat, (x + prev.x) / 2 + nx * sd * (w / 2 - 0.2), (y + prev.y) / 2, (z + prev.z) / 2 + nz * sd * (w / 2 - 0.2), sl, 1.0, 0.4, ry, color, 0, ang);
      }
      if (pillars && i % 3 === 0) b.box(mat, x, Math.min(a[1], c[1]) - sink, z, w * 0.8, y - Math.min(a[1], c[1]) + sink - thick, 1.4, ry, color);
    }
    prev = { x, y, z };
  }
}

/** Simple ship. type: cog | galley | longship | dhow | junk | barge */
export function ship(type = 'cog', { len = 14, hull = 0x5b4129, sail = 0xe8dfc8, sailColor2, mast = 0x3a2a1c } = {}) {
  const g = new THREE.Group(), b = new Batch();
  const wood = flat(0xffffff, { rough: 0.9 }), cloth = flat(0xffffff, { rough: 1, side: THREE.DoubleSide });
  const W = len * 0.3;
  // hull: layered tapered boxes
  const layers = type === 'longship' ? 3 : 4;
  for (let i = 0; i < layers; i++) {
    const t = i / layers, l = len * (0.78 + 0.22 * t), ww = W * (0.55 + 0.45 * t);
    b.box(wood, 0, i * 0.5 - 0.3, 0, l, 0.55, ww, 0, hull);
  }
  b.box(wood, len * 0.46, 0.8, 0, len * 0.14, 1.2, W * 0.7, 0, hull); b.box(wood, -len * 0.5, 0.5, 0, len * 0.16, 2.2, W * 0.8, 0, hull);
  const masts = type === 'galley' || type === 'junk' ? 2 : 1;
  const sails = [];
  for (let m = 0; m < masts; m++) {
    const mx = masts === 1 ? 0 : (m ? -len * 0.22 : len * 0.2), mh = len * 0.9;
    b.cyl(wood, mx, 1.5, 0, 0.22, mh, { color: mast, seg: 6 });
    b.box(wood, mx, 1.5 + mh * 0.82, 0, 0.18, 0.18, W * 1.7, 0, mast);
    const sg = new THREE.PlaneGeometry(W * 1.6, mh * 0.62, 4, 3);
    const sm = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: m === 0 ? sail : (sailColor2 || sail), roughness: 1, side: THREE.DoubleSide }));
    sm.position.set(mx + 0.2, 1.5 + mh * 0.5, 0); sm.rotation.y = Math.PI / 2; sm.castShadow = true;
    sm.userData.sail = true; sails.push(sm); g.add(sm);
  }
  g.add(b.build());
  g.userData.sails = sails; g.userData.len = len;
  return g;
}
/** Animate sails billow + bob. Call each frame with time. */
export function animateShip(s, t, phase = 0) {
  s.rotation.z = Math.sin(t * 0.9 + phase) * 0.025; s.rotation.x = Math.sin(t * 0.7 + phase * 1.3) * 0.02;
  for (const sm of s.userData.sails || []) {
    const pos = sm.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); pos.setZ(i, Math.sin(t * 1.4 + x * 0.6 + phase) * 0.18 + 0.5 * (1 - (x * x) / 40) * 0.3 + y * 0); }
    pos.needsUpdate = true;
  }
}

/** Trees via instancing. species: pine | oak | birch | palm | weirwood | cypress. Returns Group. */
export function forest({ rng = makeRng(3), count = 300, bounds, poly, heightAt = () => 0, avoid = () => false, species = 'pine', scale = [0.8, 1.3], minDist = 3.2, dens = 1, snow = false, tint }) {
  const pts = scatter({ rng, count: Math.round(count * dens), bounds, poly, minDist, avoid });
  const grp = new THREE.Group();
  const trunk = new Inst(G.cyl(6, 0.7), tri('wood', { color: 0x6b5238, scale: 3, snow: false })), crownA = new Inst(species === 'pine' || species === 'cypress' ? G.cone(7) : G.sphere(7), flat(0xffffff, { rough: 1 }));
  const crownB = species === 'pine' ? new Inst(G.cone(7), flat(0xffffff, { rough: 1 })) : null;
  const greens = { pine: [0x2c4a35, 0x35563b, 0x264133], oak: [0x4b7a3a, 0x58863f, 0x3f6a33], birch: [0x8cae4a, 0x9cb852, 0x7a9f40], palm: [0x3f8f45, 0x4aa04d], weirwood: [0xb0463d, 0xa23d36, 0xc2554a], cypress: [0x2f4f3a, 0x38583f] }[species];
  for (const [x, z] of pts) {
    const k = rng.range(scale[0], scale[1]), y = heightAt(x, z), gc = tint ?? rng.pick(greens);
    if (species === 'pine') {
      trunk.add(x, y, z, 0.5 * k, 3 * k, 0.5 * k, 0, 0x6b5238);
      crownA.add(x, y + 2 * k, z, 2.6 * k, 5.2 * k, 2.6 * k, rng() * 6, gc);
      crownB.add(x, y + 5 * k, z, 1.9 * k, 4.2 * k, 1.9 * k, rng() * 6, snow ? 0xe8eef2 : gc);
    } else if (species === 'cypress') {
      trunk.add(x, y, z, 0.35 * k, 2 * k, 0.35 * k, 0, 0x5d4733);
      crownA.add(x, y + 1.5 * k, z, 1.4 * k, 8 * k, 1.4 * k, rng() * 6, gc);
    } else if (species === 'palm') {
      trunk.add(x, y, z, 0.35 * k, 7 * k, 0.35 * k, rng() * 0.3, 0x8d7452);
      crownA.add(x, y + 6.4 * k, z, 3.0 * k, 1.1 * k, 3.0 * k, 0, gc);
    } else if (species === 'weirwood') {
      trunk.add(x, y, z, 0.9 * k, 7 * k, 0.9 * k, 0, 0xe9e4d8);
      crownA.add(x, y + 5 * k, z, 3.8 * k, 3.4 * k, 3.8 * k, 0, gc);
    } else {
      trunk.add(x, y, z, 0.45 * k, 3 * k, 0.45 * k, 0, 0x6b5238);
      crownA.add(x, y + 2.4 * k, z, 2.5 * k, 2.4 * k, 2.5 * k, 0, gc);
    }
  }
  for (const i of [trunk, crownA, crownB]) if (i && i.items.length) { const m = i.build(); m.castShadow = true; grp.add(m); }
  grp.userData.positions = pts;
  return grp;
}

/** Wooden/stone pier along +X from (x,z). */
export function pier(b, x, y, z, { len = 20, w = 3, ry = 0, mat, color = 0xffffff, posts = true } = {}) {
  const c = Math.cos(ry), s = Math.sin(ry);
  b.box(mat, x + c * len / 2, y, z - s * len / 2, len, 0.5, w, ry, color);
  if (posts) for (let i = 0; i <= len; i += 3) for (const sd of [-1, 1]) b.cyl(mat, x + c * i + s * sd * (w / 2) * 0.9, y - 3.5, z - s * i + c * sd * (w / 2) * 0.9, 0.3, 4, { seg: 5, color });
}

/** Column ring / colonnade helper. */
export function columns(b, pts, { h = 6, r = 0.5, mat, color = 0xffffff, y = 0, cap = true }) {
  for (const [x, z] of pts) { b.cyl(mat, x, y, z, r, h, { top: 0.88, seg: 10, color }); if (cap) b.box(mat, x, y + h, z, r * 2.6, 0.5, r * 2.6, 0, color); }
}

/** Stepped (Ghiscari-style) pyramid. */
export function steppedPyramid(b, x, y, z, { base = 30, steps = 5, stepH = 4, shrink = 0.8, ry = 0, mat, color = 0xffffff, topMat, topColor } = {}) {
  let s = base, yy = y;
  for (let i = 0; i < steps; i++) { b.box(i === steps - 1 && topMat ? topMat : mat, x, yy, z, s, stepH, s, ry, i === steps - 1 && topColor ? topColor : color); yy += stepH; s *= shrink; }
  return yy;
}
