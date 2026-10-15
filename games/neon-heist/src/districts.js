import * as THREE from 'three';
import { B } from './util.js';

/* -------------------------------------------------------------------------
   District builders. Each one receives a city block `bk` and a build context
   `c` (merged-geometry builders, RNG, helpers) and adds meshes + colliders.
   Collider rects: {x, z, w, d, h, y0}  (y0 = underside, 0 for ground-attached).
   ------------------------------------------------------------------------- */

const C = (r, g, b) => new THREE.Color(r, g, b);
const HSL = (h, s, l) => new THREE.Color().setHSL(h, s, l);
const rect = (bk, x, z, w, d, h, y0 = 0) => bk.rects.push({ x, z, w, d, h, y0 });

function nrm(a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}
// Arbitrary quad/triangle whose normal is flipped to face `toward`.
export function face(g, a, b, c, d, col, toward, uvScale = 0.25) {
  let n = nrm(a, b, c);
  if (n[0] * toward[0] + n[1] * toward[1] + n[2] * toward[2] < 0) { [a, b, c, d] = [d, c, b, a]; n = [-n[0], -n[1], -n[2]]; }
  g.quad(a, b, c, d, n, [a[0] * uvScale, a[2] * uvScale, b[0] * uvScale, b[2] * uvScale, c[0] * uvScale, c[2] * uvScale, d[0] * uvScale, d[2] * uvScale], col);
}
const flat = (g, x0, z0, x1, z1, y, col, s = 0.25) => g.quad([x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0], [0, 1, 0], [x0 * s, z0 * s, x0 * s, z1 * s, x1 * s, z1 * s, x1 * s, z0 * s], col);

// Gabled roof over a rectangle; ridge runs along X (alongX) or Z.
function gable(g, x0, z0, x1, z1, y, rise, over, col, alongX = true) {
  const a = x0 - over, b = x1 + over, c = z0 - over, d = z1 + over, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
  if (alongX) {
    face(g, [a, y, c], [b, y, c], [b, y + rise, mz], [a, y + rise, mz], col, [0, 1, -1]);
    face(g, [a, y, d], [b, y, d], [b, y + rise, mz], [a, y + rise, mz], col, [0, 1, 1]);
    face(g, [x0, y, z0], [x0, y, z1], [x0, y + rise, mz], [x0, y + rise, mz], col, [-1, 0, 0]);
    face(g, [x1, y, z0], [x1, y, z1], [x1, y + rise, mz], [x1, y + rise, mz], col, [1, 0, 0]);
  } else {
    face(g, [a, y, c], [a, y, d], [mx, y + rise, d], [mx, y + rise, c], col, [-1, 1, 0]);
    face(g, [b, y, c], [b, y, d], [mx, y + rise, d], [mx, y + rise, c], col, [1, 1, 0]);
    face(g, [x0, y, z0], [x1, y, z0], [mx, y + rise, z0], [mx, y + rise, z0], col, [0, 0, -1]);
    face(g, [x0, y, z1], [x1, y, z1], [mx, y + rise, z1], [mx, y + rise, z1], col, [0, 0, 1]);
  }
}

/* ---------- signs / storefront facades painted on canvases ---------- */
export function signTexture(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export function signMesh(c, text, wm, hm, bg, fg, pos, ry, { emis = 1, font = 'bold 54px Arial Black, Arial' } = {}) {
  const tex = signTexture(512, Math.round(512 * hm / wm), (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 3, w - 40);
  });
  const m = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.15, roughness: 0.6 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wm, hm), m); mesh.position.set(...pos); mesh.rotation.y = ry; mesh.castShadow = false;
  c.scene.add(mesh); c.signMats.push({ m, k: emis }); return mesh;
}

const SHOPS = {
  ammu: { name: 'AMMU-NATION', bg: '#7d1616', fg: '#ffe9c4', win: '#2a1212', accent: '#ffcc33' },
  burger: { name: 'BURGER SHOT', bg: '#d1281f', fg: '#ffe35c', win: '#3a2216', accent: '#ffe35c' },
  clothes: { name: 'VELVET & CO', bg: '#3b2a6b', fg: '#f3dcff', win: '#171126', accent: '#ff7ad9' },
  store: { name: '24/7 MARKET', bg: '#136b3a', fg: '#ffffff', win: '#10261a', accent: '#ffd84a' },
  apartment: { name: 'SKYLINE APTS', bg: '#2b3a4f', fg: '#cfe6ff', win: '#101820', accent: '#5fb4ff' },
  hospital: { name: 'ST. SANTITOS HOSPITAL', bg: '#f2f4f6', fg: '#c01818', win: '#cfd8df', accent: '#c01818' },
  bar: { name: 'THE TIPSY TAXI', bg: '#2a1a10', fg: '#ffb347', win: '#1a0f08', accent: '#ff5fa2' },
  spray: { name: "PAY'N'SPRAY", bg: '#e07a10', fg: '#ffffff', win: '#222', accent: '#ffffff' },
};
// Painted shop front (window + door + sign) laid on a facade; returns the mesh.
export function storefront(c, kind, pos, ry, wm = 9) {
  const S = SHOPS[kind], hm = 4.6;
  const tex = signTexture(1024, Math.round(1024 * hm / wm), (g, w, h) => {
    g.fillStyle = S.bg; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, w, h * 0.26);
    g.fillStyle = S.fg; g.font = `bold ${Math.round(h * 0.17)}px Arial Black, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(S.name, w / 2, h * 0.14, w - 60);
    g.fillStyle = S.accent; g.fillRect(30, h * 0.26, w - 60, 6);
    const wy = h * 0.34, wh = h * 0.6;
    g.fillStyle = '#7a8088'; g.fillRect(24, wy - 6, w * 0.58, wh + 10); g.fillStyle = S.win; g.fillRect(34, wy, w * 0.58 - 20, wh);
    g.fillStyle = 'rgba(255,214,140,0.9)'; g.fillRect(40, wy + 6, w * 0.58 - 32, wh - 12);
    for (let i = 0; i < 6; i++) { g.fillStyle = S.accent; g.globalAlpha = 0.55; g.fillRect(60 + i * 62, wy + 24 + (i % 2) * 46, 34, 42 + (i % 3) * 12); g.globalAlpha = 1; }
    g.fillStyle = '#7a8088'; g.fillRect(w * 0.66, wy - 6, w * 0.3, wh + 10); g.fillStyle = S.win; g.fillRect(w * 0.665 + 8, wy, w * 0.3 - 16, wh);
    g.fillStyle = 'rgba(255,214,140,0.85)'; g.fillRect(w * 0.665 + 14, wy + 6, w * 0.3 - 28, wh - 40);
    g.fillStyle = '#d9dde2'; g.fillRect(w * 0.665 + 30, wy + wh * 0.5, 14, 56);
  });
  const m = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.25, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wm, hm), m); mesh.position.set(...pos); mesh.rotation.y = ry; c.scene.add(mesh); c.signMats.push({ m, k: 0.9 }); return mesh;
}

// Glowing ring on the pavement marking an enterable door.
function doorMarker(c, d) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.07, 8, 28).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x66d0ff }));
  ring.position.set(d.x, 0.35, d.z); ring.userData.noAO = true; c.scene.add(ring);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 3.2, 16, 1, true).translate(0, 1.6, 0), new THREE.MeshBasicMaterial({ color: 0x66d0ff, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  beam.position.set(d.x, 0.3, d.z); beam.userData.noAO = true; c.scene.add(beam);
  c.markers.push(ring, beam);
}

// An enterable shop: facade graphic + door record. side: 0=N(-z) 1=E 2=S 3=W (the face with the door).
export function addShop(c, bk, b, kind, forceSide = -1) {
  const cx = b.x + b.w / 2, cz = b.z + b.d / 2, dN = b.z - bk.z, dS = bk.z + bk.s - (b.z + b.d), dW = b.x - bk.x, dE = bk.x + bk.s - (b.x + b.w);
  const m = Math.min(dN, dS, dW, dE), side = forceSide >= 0 ? forceSide : m === dN ? 0 : m === dS ? 2 : m === dW ? 3 : 1;
  const e = 0.07;
  let pos, ry, dx, dz, out;
  if (side === 0) { pos = [cx, 2.55, b.z - e]; ry = Math.PI; dx = 0; dz = -1; out = [cx, b.z - 1.9]; }
  else if (side === 2) { pos = [cx, 2.55, b.z + b.d + e]; ry = 0; dx = 0; dz = 1; out = [cx, b.z + b.d + 1.9]; }
  else if (side === 3) { pos = [b.x - e, 2.55, cz]; ry = -Math.PI / 2; dx = -1; dz = 0; out = [b.x - 1.9, cz]; }
  else { pos = [b.x + b.w + e, 2.55, cz]; ry = Math.PI / 2; dx = 1; dz = 0; out = [b.x + b.w + 1.9, cz]; }
  storefront(c, kind, pos, ry);
  // the painted door sits right of centre as seen from the street: slide the trigger along the facade
  const t = side === 0 ? [-1, 0] : side === 2 ? [1, 0] : side === 3 ? [0, 1] : [0, -1];
  const door = { kind, name: SHOPS[kind].name, x: out[0] + t[0] * 2.84, z: out[1] + t[1] * 2.84, dx, dz };
  c.doors.push(door); doorMarker(c, door);
  c.pois.push({ kind, x: door.x, z: door.z, name: SHOPS[kind].name });
  return door;
}

/* ---------- residential: gabled houses, gardens, pools, driveways ---------- */
export function houses(bk, c) {
  const { rng } = c, X0 = bk.x + 5, Z0 = bk.z + 5, S = 88, cols = 3, lotW = S / cols, depth = S / 2;
  flat(c.park, X0, Z0, X0 + S, Z0 + S, 0.27, c.white, 0.25);
  const wallTints = [C(1, 0.95, 0.88), C(0.95, 0.9, 0.82), C(0.9, 0.86, 0.8), C(1, 0.9, 0.85), C(0.88, 0.88, 0.92)];
  const roofCols = [HSL(0.04, 0.45, 0.32), HSL(0.07, 0.3, 0.26), HSL(0.6, 0.06, 0.28), HSL(0.02, 0.35, 0.22)];
  for (let row = 0; row < 2; row++) for (let col = 0; col < cols; col++) {
    const lx = X0 + col * lotW, lz = Z0 + row * depth, north = row === 0;
    const hw = 12 + rng() * 4, hd = 9 + rng() * 2.5, hh = 5.2 + rng() * 2.2, rise = 2.4 + rng() * 1.2;
    const hx = lx + (lotW - hw) / 2 + (rng() - 0.5) * 2, hz = north ? lz + 9 : lz + depth - 9 - hd;
    c.walls[1].box(hx, 0.27, hz, hx + hw, hh, hz + hd, wallTints[Math.floor(rng() * wallTints.length)], { uo: rng(), vo: -0.27 / 28 });
    const rc = roofCols[Math.floor(rng() * roofCols.length)];
    gable(c.roofs, hx, hz, hx + hw, hz + hd, hh, rise, 0.7, rc, rng() < 0.5);
    c.RB(hx + hw * 0.7, hh + 0.5, hz + hd * 0.3, hx + hw * 0.7 + 0.9, hh + rise + 1.4, hz + hd * 0.3 + 0.9, C(0.45, 0.3, 0.25));
    rect(bk, hx, hz, hw, hd, hh);
    // door + porch on the street-facing side
    const fz = north ? hz - 0.12 : hz + hd + 0.12, dxm = hx + hw * 0.3;
    c.RB(dxm - 0.8, 0.27, north ? fz - 0.1 : fz, dxm + 0.8, 2.5, north ? fz : fz + 0.1, C(0.28, 0.16, 0.1));
    c.RB(dxm - 1.5, 0.27, north ? hz - 2.2 : hz + hd, dxm + 1.5, 0.4, north ? hz : hz + hd + 2.2, C(0.62, 0.6, 0.56));
    // attached garage + driveway
    const gx = hx + hw, gw = 4.8, gh = 3.2, gd = 6.5, gz = north ? hz : hz + hd - gd;
    if (gx + gw < lx + lotW - 0.5) {
      c.RB(gx, 0.27, gz, gx + gw, gh, gz + gd, wallTints[0]); c.RB(gx - 0.2, gh, gz - 0.2, gx + gw + 0.2, gh + 0.3, gz + gd + 0.2, rc);
      c.RB(gx + 0.4, 0.27, north ? gz - 0.08 : gz + gd, gx + gw - 0.4, 2.5, north ? gz : gz + gd + 0.08, C(0.78, 0.78, 0.76));
      rect(bk, gx, gz, gw, gd, gh);
      const dz0 = north ? lz : gz - 0.0, dz1 = north ? gz : lz + depth; flat(c.inter, gx + 0.4, Math.min(dz0, dz1), gx + gw - 0.4, Math.max(dz0, dz1), 0.3, c.white, 0.1);
      if (rng() < 0.5) c.parked.push({ type: rng() < 0.7 ? 'sedan' : 'sport', x: gx + gw / 2, z: north ? lz + 5 : lz + depth - 5, a: Math.PI / 2 });
    }
    // low front fence (collidable) with a gap at the walkway
    const fy = north ? lz + 1.2 : lz + depth - 1.2;
    const gapA = Math.min(gx, lx + lotW), gapB = Math.min(gx + gw, lx + lotW);
    for (const [a, b2] of [[lx + 1, dxm - 2], [dxm + 2, gapA - 0.3], [gapB + 0.3, lx + lotW - 1]]) if (b2 - a > 1) { c.RB(a, 0.27, fy, b2, 1.3, fy + 0.18, C(0.92, 0.92, 0.9)); rect(bk, a, fy, b2 - a, 0.18, 1.3); }
    c.park.quad([dxm - 0.9, 0.29, north ? lz + 1.2 : hz + hd + 2.2], [dxm - 0.9, 0.29, north ? hz - 2.2 : lz + depth - 1.2], [dxm + 0.9, 0.29, north ? hz - 2.2 : lz + depth - 1.2], [dxm + 0.9, 0.29, north ? lz + 1.2 : hz + hd + 2.2], [0, 1, 0], [0, 0, 0, 1, 1, 1, 1, 0], C(0.7, 0.68, 0.62));
    // back garden: trees, sometimes a pool
    const bz = north ? hz + hd + 4 : lz + 4;
    if (rng() < 0.42) {
      const px = hx + 1, pz = north ? hz + hd + 3.5 : hz - 3.5 - 4.5; c.RB(px - 0.5, 0.27, pz - 0.5, px + 8.5, 0.34, pz + 5, C(0.7, 0.7, 0.68)); flat(c.water, px, pz, px + 8, pz + 4, 0.36, c.white, 0.1);
      rect(bk, px - 0.5, pz - 0.5, 9, 5.5, 0.4);
    }
    for (let t = 0; t < 2; t++) { const tx = lx + 4 + rng() * (lotW - 8), tz = north ? lz + depth - 5 - rng() * 6 : lz + 5 + rng() * 6; if (Math.abs(tx - dxm) > 3) bk.trees.push({ x: tx, z: tz, r: 2.0 + rng() * 1.2 }); }
  }
}

/* ---------- industrial: warehouses, container yard, tanks, smokestack ---------- */
export function industrial(bk, c) {
  const { rng } = c, X0 = bk.x + 5, Z0 = bk.z + 5, S = 88, X1 = X0 + S, Z1 = Z0 + S;
  flat(c.inter, X0, Z0, X1, Z1, 0.27, c.white, 0.1);
  // perimeter fence with a gate on the south side
  const fc = C(0.45, 0.5, 0.52), gate = X0 + S / 2;
  const fence = (x, z, w, d) => { c.RB(x, 0.27, z, x + w, 2.6, z + d, fc, {}); rect(bk, x, z, w, d, 2.6); };
  fence(X0 + 1, Z0 + 1, S - 2, 0.25); fence(X0 + 1, Z0 + 1, 0.25, S - 2); fence(X1 - 1.25, Z0 + 1, 0.25, S - 2);
  fence(X0 + 1, Z1 - 1.25, gate - 5 - X0 - 1, 0.25); fence(gate + 5, Z1 - 1.25, X1 - 1 - gate - 5, 0.25);
  // warehouses along the back
  const wcol = [C(0.52, 0.58, 0.64), C(0.62, 0.52, 0.45), C(0.55, 0.6, 0.55)];
  let x = X0 + 5;
  while (x < X1 - 30) {
    const w = 26 + rng() * 22, d = 20 + rng() * 8, h = 9 + rng() * 4, tint = wcol[Math.floor(rng() * wcol.length)];
    if (x + w > X1 - 4) break;
    c.RB(x, 0.27, Z0 + 5, x + w, h, Z0 + 5 + d, tint); c.RB(x - 0.3, h, Z0 + 4.7, x + w + 0.3, h + 0.5, Z0 + 5.3 + d, C(0.3, 0.32, 0.34));
    for (let v = 0; v < 3; v++) c.RB(x + 4 + v * (w / 3), h + 0.5, Z0 + 9 + (v % 2) * 5, x + 6.5 + v * (w / 3), h + 1.6, Z0 + 11 + (v % 2) * 5, C(0.6, 0.62, 0.65));
    for (let k = 0; k < Math.floor(w / 9); k++) { const dx = x + 3 + k * 9; c.RB(dx, 0.27, Z0 + 5 + d - 0.05, dx + 5, 4.2, Z0 + 5 + d + 0.12, C(0.18, 0.2, 0.23)); c.RB(dx, 4.2, Z0 + 5 + d - 0.05, dx + 5, 4.5, Z0 + 5 + d + 0.14, C(0.9, 0.75, 0.1)); }
    rect(bk, x, Z0 + 5, w, d, h);
    x += w + 5;
  }
  // container yard
  const pal = [C(0.7, 0.14, 0.12), C(0.12, 0.3, 0.6), C(0.15, 0.5, 0.25), C(0.85, 0.5, 0.1), C(0.55, 0.55, 0.58), C(0.4, 0.2, 0.5)];
  for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) {
    if (rng() < 0.3) continue;
    const cx = X0 + 6 + q * 13.5, cz = Z0 + 40 + r * 7, hgt = 1 + Math.floor(rng() * 3);
    for (let s = 0; s < hgt; s++) { const col = pal[Math.floor(rng() * pal.length)]; c.RB(cx, 0.27 + s * 2.6, cz, cx + 12, 0.27 + (s + 1) * 2.6, cz + 2.5, col); c.RB(cx + 0.1, 0.27 + s * 2.6 + 0.2, cz - 0.03, cx + 11.9, 0.27 + (s + 1) * 2.6 - 0.2, cz + 2.53, col.clone().multiplyScalar(0.8), { noTop: true }); }
    rect(bk, cx, cz, 12, 2.5, 0.27 + hgt * 2.6);
  }
  // storage tanks + stack in the corner
  const tankMat = c.matTank;
  for (let t = 0; t < 2; t++) { const tx = X1 - 12 - t * 13, tz = Z1 - 14; const m = new THREE.Mesh(c.geoTank, tankMat); m.position.set(tx, 5.3, tz); m.castShadow = true; c.scene.add(m); rect(bk, tx - 5, tz - 5, 10, 10, 10.6); }
  const st = new THREE.Mesh(c.geoStack, c.matStack); st.position.set(X0 + 8, 15, Z1 - 10); st.castShadow = true; c.scene.add(st); rect(bk, X0 + 6.8, Z1 - 11.2, 2.4, 2.4, 30);
  c.pois.push({ kind: 'industrial', x: bk.x + bk.s / 2, z: bk.z + bk.s / 2, name: 'Docks' });
}

/* ---------- plaza: fountain, market stalls, benches ---------- */
export function plaza(bk, c) {
  const { rng } = c, X0 = bk.x + 5, Z0 = bk.z + 5, S = 88, cx = bk.x + bk.s / 2, cz = bk.z + bk.s / 2;
  flat(c.slabs, X0, Z0, X0 + S, Z0 + S, 0.27, C(0.86, 0.82, 0.74), 0.3);
  for (let r = 0; r < 4; r++) flat(c.slabs, X0 + 4, Z0 + 10 + r * 22, X0 + S - 4, Z0 + 12 + r * 22, 0.28, C(0.7, 0.66, 0.6), 0.3);
  // fountain
  c.RB(cx - 8, 0.27, cz - 8, cx + 8, 1.1, cz + 8, C(0.7, 0.7, 0.68)); flat(c.water, cx - 7, cz - 7, cx + 7, cz + 7, 1.14, c.white, 0.1);
  c.RB(cx - 1, 1.1, cz - 1, cx + 1, 4.4, cz + 1, C(0.8, 0.8, 0.78)); c.RB(cx - 2.6, 4.4, cz - 2.6, cx + 2.6, 4.8, cz + 2.6, C(0.75, 0.75, 0.73)); rect(bk, cx - 8, cz - 8, 16, 16, 1.1);
  // stalls
  const awn = [C(0.85, 0.2, 0.2), C(0.2, 0.5, 0.8), C(0.9, 0.7, 0.15), C(0.2, 0.65, 0.35), C(0.7, 0.3, 0.7)];
  for (let r = 0; r < 2; r++) for (let q = 0; q < 5; q++) {
    const sx = X0 + 8 + q * 16, sz = r ? Z0 + S - 20 : Z0 + 12; const col = awn[Math.floor(rng() * awn.length)];
    c.RB(sx, 0.27, sz, sx + 4, 1.1, sz + 2, C(0.55, 0.4, 0.28)); c.RB(sx - 0.3, 2.7, sz - 0.6, sx + 4.3, 2.9, sz + 2.6, col);
    for (const [px, pz] of [[sx - 0.2, sz - 0.4], [sx + 4, sz - 0.4], [sx - 0.2, sz + 2.2], [sx + 4, sz + 2.2]]) c.RB(px, 0.27, pz, px + 0.2, 2.7, pz + 0.2, C(0.3, 0.3, 0.3));
    rect(bk, sx, sz, 4, 2, 1.1);
  }
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, bx = cx + Math.cos(a) * 17, bz = cz + Math.sin(a) * 17; c.bench(bk, bx, bz, a + Math.PI / 2); bk.trees.push({ x: cx + Math.cos(a + 0.4) * 27, z: cz + Math.sin(a + 0.4) * 27, r: 2.4 + rng() * 0.8 }); }
  c.pois.push({ kind: 'plaza', x: cx, z: cz, name: 'Central Plaza' });
}

/* ---------- parking lots / gas stations ---------- */
export function parking(bk, c, density = 0.55) {
  const { rng } = c, X0 = bk.x + 5, Z0 = bk.z + 5, S = 88;
  flat(c.inter, X0, Z0, X0 + S, Z0 + S, 0.27, c.white, 0.1);
  for (let row = 0; row < 4; row++) {
    const z = Z0 + 6 + row * 20;
    for (let q = 0; q <= 14; q++) flat(c.paint, X0 + 5 + q * 5.6, z, X0 + 5.15 + q * 5.6, z + 5, 0.29, c.white, 0.2);
    for (let q = 0; q < 14; q++) if (rng() < density) c.parked.push({ type: ['sedan', 'sedan', 'taxi', 'van', 'sport', 'truck'][Math.floor(rng() * 6)], x: X0 + 7.8 + q * 5.6, z: z + 2.6, a: Math.PI / 2 * (rng() < 0.5 ? 1 : -1) });
  }
  for (const [lx, lz] of [[X0 + 3, Z0 + 3], [X0 + S - 3, Z0 + 3], [X0 + 3, Z0 + S - 3], [X0 + S - 3, Z0 + S - 3]]) { c.lamps.push({ x: lx, z: lz }); rect(bk, lx - 0.3, lz - 0.3, 0.6, 0.6, 8); }
}

export function gasStation(bk, c) {
  const { rng } = c, X0 = bk.x + 5, Z0 = bk.z + 5, S = 88;
  flat(c.inter, X0, Z0, X0 + S, Z0 + S, 0.27, c.white, 0.1);
  const cx = bk.x + bk.s / 2, cz = bk.z + 30;
  // canopy + pumps
  c.RB(cx - 14, 5.4, cz - 8, cx + 14, 6.2, cz + 8, C(0.95, 0.95, 0.95)); c.RB(cx - 14, 5.4, cz - 8.05, cx + 14, 5.8, cz + 8.05, C(0.9, 0.15, 0.12), { noTop: true });
  for (const [px, pz] of [[cx - 12, cz - 6], [cx + 12, cz - 6], [cx - 12, cz + 6], [cx + 12, cz + 6]]) { c.RB(px - 0.35, 0.27, pz - 0.35, px + 0.35, 5.4, pz + 0.35, C(0.85, 0.85, 0.85)); rect(bk, px - 0.4, pz - 0.4, 0.8, 0.8, 5.4); }
  for (let k = 0; k < 6; k++) { const px = cx - 9 + (k % 3) * 9, pz = cz + (k < 3 ? -3 : 3); c.RB(px - 0.5, 0.27, pz - 0.35, px + 0.5, 1.5, pz + 0.35, C(0.8, 0.12, 0.1)); c.RB(px - 0.35, 1.5, pz - 0.3, px + 0.35, 1.9, pz + 0.3, C(0.15, 0.15, 0.17)); rect(bk, px - 0.55, pz - 0.4, 1.1, 0.8, 1.9); }
  // convenience shop at the back (enterable)
  const sw = 22, sd = 11, sx = cx - sw / 2, sz = bk.z + bk.s - 5 - sd - 6;
  c.shops.box(sx, 0.27, sz, sx + sw, 4.6, sz + sd, c.white, { su: 1 / 16, sv: 1 / 4.55, vo: -0.27 / 4.55, noTop: true });
  c.RB(sx - 0.4, 4.6, sz - 0.4, sx + sw + 0.4, 5.1, sz + sd + 0.4, C(0.9, 0.9, 0.9)); rect(bk, sx, sz, sw, sd, 5.1);
  const b = { x: sx, z: sz, w: sw, d: sd }; addShop(c, bk, { ...b }, 'store');
  // price pylon on the street corner
  const px = bk.x + 8, pz = bk.z + 8; c.RB(px - 0.3, 0.27, pz - 0.3, px + 0.3, 9, pz + 0.3, C(0.35, 0.35, 0.38)); rect(bk, px - 0.4, pz - 0.4, 0.8, 0.8, 9);
  signMesh(c, 'GAS  1.89', 3.2, 1.8, '#0b2a5a', '#ffd23a', [px, 9.4, pz + 0.35], 0, { font: 'bold 62px Arial Black' }); signMesh(c, 'GAS  1.89', 3.2, 1.8, '#0b2a5a', '#ffd23a', [px, 9.4, pz - 0.35], Math.PI, { font: 'bold 62px Arial Black' });
  c.parked.push({ type: 'sedan', x: cx - 9, z: cz + 12, a: 0 }, { type: 'van', x: bk.x + 12, z: sz - 10, a: Math.PI / 2 });
  c.pois.push({ kind: 'gas', x: cx, z: cz, name: 'Gas Station' });
}

/* ---------- sports field with stands ---------- */
export function sports(bk, c) {
  const X0 = bk.x + 5, Z0 = bk.z + 5, S = 88, cx = bk.x + bk.s / 2, cz = bk.z + bk.s / 2;
  flat(c.slabs, X0, Z0, X0 + S, Z0 + S, 0.27, C(0.6, 0.6, 0.58), 0.2);
  flat(c.park, cx - 36, cz - 22, cx + 36, cz + 22, 0.31, C(0.75, 1, 0.75), 0.25);
  const L = (x0, z0, x1, z1) => flat(c.paint, x0, z0, x1, z1, 0.34, c.white, 0.2);
  L(cx - 35, cz - 21, cx + 35, cz - 20.8); L(cx - 35, cz + 20.8, cx + 35, cz + 21); L(cx - 35, cz - 21, cx - 34.8, cz + 21); L(cx + 34.8, cz - 21, cx + 35, cz + 21); L(cx - 0.1, cz - 21, cx + 0.1, cz + 21);
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, b = ((k + 1) / 16) * Math.PI * 2, r = 6; face(c.paint, [cx + Math.cos(a) * r, 0.35, cz + Math.sin(a) * r], [cx + Math.cos(b) * r, 0.35, cz + Math.sin(b) * r], [cx + Math.cos(b) * (r + 0.2), 0.35, cz + Math.sin(b) * (r + 0.2)], [cx + Math.cos(a) * (r + 0.2), 0.35, cz + Math.sin(a) * (r + 0.2)], c.white, [0, 1, 0]); }
  for (const s of [-1, 1]) { const gx = cx + s * 35; c.RB(gx - 0.1, 0.3, cz - 3.6, gx + 0.1, 2.5, cz - 3.4, c.white); c.RB(gx - 0.1, 0.3, cz + 3.4, gx + 0.1, 2.5, cz + 3.6, c.white); c.RB(gx - 0.1, 2.4, cz - 3.6, gx + 0.1, 2.6, cz + 3.6, c.white); }
  // stands on both long sides
  for (const s of [0, 1]) for (let step = 0; step < 6; step++) {
    const z = s ? cz + 25 + step * 2.2 : cz - 25 - step * 2.2 - 2.2; c.RB(cx - 36, 0.27, z, cx + 36, 0.8 + step * 0.9, z + 2.2, step % 2 ? C(0.55, 0.57, 0.6) : C(0.5, 0.52, 0.56));
  }
  rect(bk, cx - 36, cz + 25, 72, 13.2, 6.2); rect(bk, cx - 36, cz - 38.2, 72, 13.2, 6.2);
  for (const [lx, lz] of [[cx - 38, cz - 24], [cx + 38, cz - 24], [cx - 38, cz + 24], [cx + 38, cz + 24]]) { c.RB(lx - 0.3, 0.27, lz - 0.3, lx + 0.3, 24, lz + 0.3, C(0.4, 0.4, 0.42)); c.RB(lx - 1.2, 24, lz - 1.2, lx + 1.2, 24.6, lz + 1.2, C(0.9, 0.9, 0.7)); c.floods.push([lx, 24.4, lz]); rect(bk, lx - 0.4, lz - 0.4, 0.8, 0.8, 24); }
  c.pois.push({ kind: 'sport', x: cx, z: cz, name: 'Stadium' });
}

/* ---------- hospital & police station ---------- */
export function hospital(bk, c) {
  const X0 = bk.x + 5, Z0 = bk.z + 5, S = 88;
  flat(c.inter, X0, Z0 + 44, X0 + S, Z0 + S, 0.27, c.white, 0.1);
  for (let q = 0; q < 10; q++) flat(c.paint, X0 + 6 + q * 5.6, Z0 + 56, X0 + 6.15 + q * 5.6, Z0 + 61, 0.29, c.white, 0.2);
  const bx = X0 + 8, bz = Z0 + 4, w = 72, d = 36, h = 22;
  c.walls[2].box(bx, 0.27, bz, bx + w, h, bz + d, C(1, 1, 1), { uo: 0.2, vo: -0.27 / 28 });
  c.RB(bx - 0.5, h, bz - 0.5, bx + w + 0.5, h + 0.9, bz + d + 0.5, C(0.85, 0.87, 0.9)); rect(bk, bx, bz, w, d, h + 0.9);
  c.RB(bx + w / 2 - 9, h + 0.9, bz + d / 2 - 9, bx + w / 2 + 9, h + 1.0, bz + d / 2 + 9, C(0.2, 0.2, 0.22)); // helipad
  c.RB(bx + w / 2 - 3, h + 1.0, bz + d / 2 - 4, bx + w / 2 - 2, h + 1.05, bz + d / 2 + 4, c.white); c.RB(bx + w / 2 + 2, h + 1.0, bz + d / 2 - 4, bx + w / 2 + 3, h + 1.05, bz + d / 2 + 4, c.white); c.RB(bx + w / 2 - 3, h + 1.0, bz + d / 2 - 0.5, bx + w / 2 + 3, h + 1.05, bz + d / 2 + 0.5, c.white);
  signMesh(c, '+ HOSPITAL', 14, 3.4, '#ffffff', '#c01818', [bx + w / 2, h - 3, bz + d + 0.08], 0, { font: 'bold 70px Arial Black' });
  c.RB(bx + 36 - 4, 0.27, bz + d, bx + 36 + 4, 0.4, bz + d + 4, C(0.8, 0.8, 0.78));
  addShop(c, bk, { x: bx + w / 2 - 6, z: bz, w: 12, d }, 'hospital', 2);
  c.parked.push({ type: 'van', x: X0 + 22, z: Z0 + 58.5, a: 0, color: 0xf2f2f2 }, { type: 'van', x: X0 + 50, z: Z0 + 58.5, a: 0, color: 0xf2f2f2 });
}

export function police(bk, c) {
  const X0 = bk.x + 5, Z0 = bk.z + 5, S = 88;
  flat(c.inter, X0, Z0, X0 + S, Z0 + S, 0.27, c.white, 0.1);
  const bx = X0 + 10, bz = Z0 + 6, w = 52, d = 28, h = 12;
  c.walls[2].box(bx, 0.27, bz, bx + w, h, bz + d, C(0.75, 0.82, 1), { uo: 0.5, vo: -0.27 / 28 });
  c.RB(bx - 0.4, h, bz - 0.4, bx + w + 0.4, h + 0.7, bz + d + 0.4, C(0.2, 0.28, 0.5)); rect(bk, bx, bz, w, d, h + 0.7);
  signMesh(c, 'POLICE', 12, 2.6, '#14307a', '#ffffff', [bx + w / 2, h - 2, bz + d + 0.08], 0, { font: 'bold 80px Arial Black' });
  c.RB(bx + w - 6, h + 0.7, bz + 4, bx + w - 4, h + 3, bz + 6, C(0.1, 0.2, 0.9)); c.RB(bx + 4, h + 0.7, bz + 4, bx + 6, h + 3, bz + 6, C(0.9, 0.1, 0.1));
  for (let k = 0; k < 5; k++) c.parked.push({ type: 'cop', x: X0 + 14 + k * 11, z: Z0 + 54, a: Math.PI / 2 });
  c.RB(X0 + 3, 0.27, Z0 + S - 14, X0 + 3.4, 12, Z0 + S - 13.6, C(0.8, 0.8, 0.82));
  c.pois.push({ kind: 'police', x: bx + w / 2, z: bz + d + 6, name: 'Police HQ' });
  { const door = { kind: 'policehq', name: 'Police HQ lobby', x: bx + w / 2 + 9, z: bz + d + 1.9, dx: 0, dz: 1 }; c.doors.push(door); doorMarker(c, door); }
}

/* ---------- Pay'n'Spray: drive-in garage ---------- */
export function spray(bk, c) {
  const X0 = bk.x + 5, Z0 = bk.z + 5, S = 88, cx = bk.x + bk.s / 2;
  flat(c.inter, X0, Z0, X0 + S, Z0 + S, 0.27, c.white, 0.1);
  const bx = cx - 18, bz = Z0 + 6, w = 36, d = 30, h = 8;
  c.walls[2].box(bx, 0.27, bz, bx + w, h, bz + d, C(1, 0.9, 0.75), { uo: 0.1, vo: -0.27 / 28 });
  c.RB(bx - 0.4, h, bz - 0.4, bx + w + 0.4, h + 0.7, bz + d + 0.4, C(0.8, 0.45, 0.1));
  // open bay: two side walls + back wall are solid; the doorway on the south face stays open
  rect(bk, bx, bz, 3, d, h); rect(bk, bx + w - 3, bz, 3, d, h); rect(bk, bx, bz, w, 3, h);
  signMesh(c, "PAY'N'SPRAY", 12, 2.6, '#e07a10', '#ffffff', [cx, 7.2, bz + d + 0.1], 0, { font: 'bold 74px Arial Black' });
  c.RB(cx - 6, 0.27, bz + d - 0.1, cx + 6, 6.5, bz + d + 0.05, C(0.12, 0.12, 0.14), { noTop: true });
  const door = { kind: 'spray', name: "Pay'n'Spray", x: cx, z: bz + d - 8, drive: true };
  c.doors.push(door); c.pois.push({ kind: 'spray', x: cx, z: bz + d + 4, name: "Pay'n'Spray" });
  door.zone = { x: cx - 5, z: bz + 4, w: 10, d: d - 6 };
  flat(c.paint, cx - 5, bz + 4, cx + 5, bz + d, 0.29, C(0.9, 0.5, 0.1), 0.2);
}

/* ---------- parks: ponds, playgrounds, courts, benches ---------- */
export function park(bk, c, lake = false) {
  const { rng } = c, X0 = bk.x + 5, Z0 = bk.z + 5, S = 88, cx = bk.x + bk.s / 2, cz = bk.z + bk.s / 2;
  const e = 4, gap = 4.5, m = bk.s / 2;
  c.park.box(bk.x + 4, 0.25, bk.z + 4, bk.x + bk.s - 4, 0.3, bk.z + bk.s - 4, c.white, { noSides: true, tsu: 1 / 4 });
  const path = C(0.72, 0.68, 0.56);
  flat(c.roofs, cx - 2, bk.z + 4, cx + 2, bk.z + bk.s - 4, 0.33, path); flat(c.roofs, bk.x + 4, cz - 2, bk.x + bk.s - 4, cz + 2, 0.33, path);
  const hedge = (x, z, w, d) => { c.RB(x, 0.25, z, x + w, 1.5, z + d, C(0.16, 0.34, 0.15)); rect(bk, x, z, w, d, 1.5); };
  hedge(bk.x + e, bk.z + e, m - gap - e, 1.2); hedge(bk.x + m + gap, bk.z + e, m - gap - e, 1.2); hedge(bk.x + e, bk.z + bk.s - e - 1.2, m - gap - e, 1.2); hedge(bk.x + m + gap, bk.z + bk.s - e - 1.2, m - gap - e, 1.2);
  hedge(bk.x + e, bk.z + e, 1.2, m - gap - e); hedge(bk.x + e, bk.z + m + gap, 1.2, m - gap - e); hedge(bk.x + bk.s - e - 1.2, bk.z + e, 1.2, m - gap - e); hedge(bk.x + bk.s - e - 1.2, bk.z + m + gap, 1.2, m - gap - e);
  if (lake) {
    c.RB(cx - 26, 0.25, cz - 20, cx + 26, 0.55, cz + 20, C(0.55, 0.5, 0.42)); flat(c.water, cx - 25, cz - 19, cx + 25, cz + 19, 0.6, c.white, 0.05); rect(bk, cx - 26, cz - 20, 52, 40, 0.7);
    c.RB(cx - 2.2, 0.55, cz - 20, cx + 2.2, 0.85, cz + 20, C(0.52, 0.4, 0.28), { su: 0.5, sv: 0.5, tsu: 0.5 }); // jetty
    for (let k = 0; k < 6; k++) bk.trees.push({ x: bk.x + 12 + rng() * (bk.s - 24), z: k % 2 ? bk.z + 12 + rng() * 8 : bk.z + bk.s - 20 + rng() * 8, r: 2.6 + rng() });
    c.pois.push({ kind: 'lake', x: cx, z: cz, name: 'Lake Santitos' });
  } else {
    // basketball court (NW) + playground (SE) + benches
    const k0 = bk.x + 12, kz = bk.z + 12; flat(c.paint, k0, kz, k0 + 24, kz + 14, 0.34, C(0.18, 0.4, 0.62), 0.1);
    flat(c.paint, k0 + 0.4, kz + 0.4, k0 + 23.6, kz + 0.55, 0.36, c.white); flat(c.paint, k0 + 0.4, kz + 13.45, k0 + 23.6, kz + 13.6, 0.36, c.white); flat(c.paint, k0 + 11.9, kz + 0.4, k0 + 12.1, kz + 13.6, 0.36, c.white);
    for (const hx of [k0 + 1, k0 + 22]) { c.RB(hx - 0.1, 0.34, kz + 6.9, hx + 0.1, 3.4, kz + 7.1, C(0.3, 0.3, 0.33)); c.RB(hx - 0.9, 3.1, kz + 6.5, hx + 0.9, 4.0, kz + 6.6, C(0.9, 0.9, 0.92)); rect(bk, hx - 0.3, kz + 6.7, 0.6, 0.6, 3.4); }
    const px = bk.x + bk.s - 38, pz = bk.z + bk.s - 34; flat(c.paint, px, pz, px + 28, pz + 22, 0.34, C(0.78, 0.7, 0.5), 0.1);
    c.RB(px + 3, 0.34, pz + 3, px + 3.3, 3.2, pz + 3.3, C(0.85, 0.2, 0.2)); c.RB(px + 3, 0.34, pz + 9, px + 3.3, 3.2, pz + 9.3, C(0.85, 0.2, 0.2)); c.RB(px + 3, 3.0, pz + 3, px + 3.3, 3.3, pz + 9.3, C(0.85, 0.2, 0.2)); // swing frame
    c.RB(px + 3.0, 1.2, pz + 5, px + 3.3, 1.3, pz + 5.6, C(0.1, 0.1, 0.1)); c.RB(px + 3.0, 1.2, pz + 7, px + 3.3, 1.3, pz + 7.6, C(0.1, 0.1, 0.1));
    c.RB(px + 14, 0.34, pz + 4, px + 18, 3.0, pz + 8, C(0.2, 0.5, 0.85)); face(c.roofs, [px + 18, 0.34, pz + 4], [px + 18, 0.34, pz + 8], [px + 23, 0.34, pz + 8], [px + 23, 0.34, pz + 4], C(0.9, 0.8, 0.2), [0, 1, 0]); face(c.roofs, [px + 18, 3.0, pz + 4], [px + 18, 3.0, pz + 8], [px + 23, 0.4, pz + 8], [px + 23, 0.4, pz + 4], C(0.9, 0.8, 0.2), [0, 1, 0]); // slide
    c.RB(px + 8, 0.34, pz + 14, px + 14, 0.7, pz + 20, C(0.85, 0.75, 0.5)); rect(bk, px + 2.9, pz + 2.9, 0.5, 6.5, 3.3); rect(bk, px + 14, pz + 4, 4, 4, 3);
    for (let k = 0; k < 6; k++) c.bench(bk, bk.x + 14 + k * 12, cz + (k % 2 ? 4.5 : -4.5), k % 2 ? -Math.PI / 2 : Math.PI / 2);
    rect(bk, cx - 4, cz - 4, 8, 8, 0.9); c.RB(cx - 4, 0.25, cz - 4, cx + 4, 0.9, cz + 4, C(0.58, 0.58, 0.56)); flat(c.water, cx - 3.2, cz - 3.2, cx + 3.2, cz + 3.2, 0.95, c.white, 0.1); c.RB(cx - 0.4, 0.9, cz - 0.4, cx + 0.4, 3.2, cz + 0.4, C(0.78, 0.78, 0.74));
    for (let t = 0; t < 22; t++) { const tx = bk.x + 9 + rng() * (bk.s - 18), tz = bk.z + 9 + rng() * (bk.s - 18); if (Math.abs(tx - cx) < 9 || Math.abs(tz - cz) < 9) continue; if (tx < bk.x + 40 && tz < bk.z + 30) continue; if (tx > px - 3 && tz > pz - 3) continue; bk.trees.push({ x: tx, z: tz, r: 2.2 + rng() * 1.6 }); }
    c.pois.push({ kind: 'park', x: cx, z: cz, name: 'Park' });
  }
}
