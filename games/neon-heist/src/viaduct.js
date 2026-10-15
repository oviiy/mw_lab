import * as THREE from 'three';
import { B, W } from './util.js';
import { face } from './districts.js';

// "Skyway": an elevated expressway running east-west over block row 8, bridging every
// cross street. Ramps climb inside the two end blocks and meet the edge roads.
export const VD = { zc: 8 * B + B / 2, hw: 7, y: 9, xa: 14, xb: B - 11, xc: W - (B - 11), xd: W - 14 };
// Mid-city slip ramps (both sides) inside block (4,8): climb from x0 to x1, then a short bridge to x2 merges into the deck.
VD.m = { x0: 4 * B + 11, x1: 5 * B - 11, x2: 5 * B + 30, w: 7 };
VD.mid = [[4 * B, VD.zc + VD.hw + 3.5], [4 * B, VD.zc - VD.hw - 3.5]]; // ground mouths (GPS / cop routing)

// Height of the drivable surface at (x, z); 0 when not on the viaduct.
export function viaductSurface(x, z) {
  const m = VD.m, dz = Math.abs(z - VD.zc);
  if (dz > VD.hw && dz <= VD.hw + m.w && x >= m.x0 && x <= m.x2) return x < m.x1 ? (VD.y * (x - m.x0)) / (m.x1 - m.x0) : VD.y;
  if (Math.abs(z - VD.zc) > VD.hw || x < VD.xa || x > VD.xd) return 0;
  if (x < VD.xb) return (VD.y * (x - VD.xa)) / (VD.xb - VD.xa);
  if (x <= VD.xc) return VD.y;
  return (VD.y * (VD.xd - x)) / (VD.xd - VD.xc);
}

export function buildViaduct(city, c) {
  const { zc, hw, y: Y, xa, xb, xc, xd } = VD, col = new THREE.Color(0.55, 0.55, 0.53), dark = new THREE.Color(0.32, 0.32, 0.34), white = c.white;
  const u0 = 0.5 - hw / 22, u1 = 0.5 + hw / 22;
  const road = (x0, y0, x1, y1, nrm) => c.roads.quad([x0, y0 + 0.03, zc - hw], [x0, y0 + 0.03, zc + hw], [x1, y1 + 0.03, zc + hw], [x1, y1 + 0.03, zc - hw], nrm, [u0, x0 / 22, u1, x0 / 22, u1, x1 / 22, u0, x1 / 22], white);
  const sl = Math.hypot(xb - xa, Y);
  road(xb, Y, xc, Y, [0, 1, 0]);                                  // flat deck
  road(xa, 0, xb, Y, [-Y / sl, (xb - xa) / sl, 0]);               // west ramp
  road(xc, Y, xd, 0, [Y / sl, (xd - xc) / sl, 0]);                // east ramp
  // deck body
  c.slabs.box(xb, Y - 1.1, zc - hw - 0.7, xc, Y, zc + hw + 0.7, col, { su: 1 / 3, sv: 1 / 3, tsu: 1 / 3 });
  // parapets on the flat part
  for (const s of [-1, 1]) {
    const z0 = s < 0 ? zc - hw - 0.7 : zc + hw, z1 = z0 + 0.7;
    c.RB(xb, Y, z0, VD.m.x1, Y + 1.1, z1, col); c.RB(VD.m.x2, Y, z0, xc, Y + 1.1, z1, col);
    // ramps: sloped outer wall + parapet top
    for (const [xs, xe, ys, ye] of [[xa, xb, 0, Y], [xc, xd, Y, 0]]) {
      const zo = s < 0 ? zc - hw - 0.7 : zc + hw + 0.7, zi = s < 0 ? zc - hw : zc + hw;
      face(c.roofs, [xs, 0, zo], [xe, 0, zo], [xe, ye + 1.1, zo], [xs, ys + 1.1, zo], col, [0, 0, s], 0.25);
      face(c.roofs, [xs, 0, zi], [xe, 0, zi], [xe, ye + 1.1, zi], [xs, ys + 1.1, zi], dark, [0, 0, -s], 0.25);
      face(c.roofs, [xs, ys + 1.1, zo], [xe, ye + 1.1, zo], [xe, ye + 1.1, zi], [xs, ys + 1.1, zi], col, [0, 1, 0], 0.25);
      // stepped colliders along the ramp wall
      const n = Math.ceil(Math.abs(xe - xs) / 6);
      for (let k = 0; k < n; k++) {
        const a = xs + ((xe - xs) * k) / n, b = xs + ((xe - xs) * (k + 1)) / n, top = Math.max(Math.abs(viaductSurface(a, zc)), Math.abs(viaductSurface(b, zc))) + 1.1;
        const bi = Math.min(9, Math.max(0, Math.floor(Math.min(a, b) / B)));
        city.blocks[bi][8].rects.push({ x: Math.min(a, b), z: s < 0 ? zc - hw - 0.7 : zc + hw, w: Math.abs(b - a) + 0.05, d: 0.7, h: top, y0: 0 });
        if (s < 0) { const fill = Math.min(viaductSurface(a, zc), viaductSurface(b, zc)) - 0.05; if (fill > 0.45) city.blocks[bi][8].rects.push({ x: Math.min(a, b), z: zc - hw, w: Math.abs(b - a) + 0.05, d: 2 * hw, h: fill, y0: 0 }); } // solid embankment
      }
    }
    // flat-deck parapet colliders, split per block column so spatial queries find them
    for (let i = 1; i <= 9; i++) {
      for (const [lo, hi] of [[xb, VD.m.x1], [VD.m.x2, xc]]) {
        const a = Math.max(lo, i * B - 11), b = Math.min(hi, (i + 1) * B - 11);
        if (b > a) city.blocks[i][8].rects.push({ x: a, z: s < 0 ? zc - hw - 0.7 : zc + hw, w: b - a, d: 0.7, h: Y + 1.1, y0: Y - 0.3 });
      }
    }
  }
  // mid-city slip ramps
  { const { x0, x1, x2, w } = VD.m, bk = city.blocks[4][8], sl2 = Math.hypot(x1 - x0, Y);
    for (const s of [-1, 1]) {
      const zi = zc + s * hw, zo = zc + s * (hw + w), zp = zo + s * 0.7, za = Math.min(zi, zo), zb = Math.max(zi, zo);
      const v0 = s > 0 ? 0.5 - w / 22 : 0.5, v1 = s > 0 ? 0.5 : 0.5 + w / 22;
      c.roads.quad([x0, 0.03, za], [x0, 0.03, zb], [x1, Y + 0.03, zb], [x1, Y + 0.03, za], [-Y / sl2, (x1 - x0) / sl2, 0], [v0, x0 / 22, v1, x0 / 22, v1, x1 / 22, v0, x1 / 22], white);
      c.roads.quad([x1, Y + 0.03, za], [x1, Y + 0.03, zb], [x2, Y + 0.03, zb], [x2, Y + 0.03, za], [0, 1, 0], [v0, x1 / 22, v1, x1 / 22, v1, x2 / 22, v0, x2 / 22], white);
      c.slabs.box(x1, Y - 1.1, Math.min(za, zp), x2, Y, Math.max(zb, zp), col, { su: 1 / 3, sv: 1 / 3, tsu: 1 / 3 });            // merge bridge
      c.RB(x1, Y, Math.min(zo, zp), x2 + 0.7, Y + 1.1, Math.max(zo, zp), col);                                              // its outer parapet
      c.RB(x2, Y, za, x2 + 0.7, Y + 1.1, zb, col);                                                                            // end wall of the slip lane
      face(c.roofs, [x0, 0, zp], [x1, 0, zp], [x1, Y + 1.1, zp], [x0, 1.1, zp], col, [0, 0, s], 0.25);                     // embankment outer wall
      face(c.roofs, [x0, 1.1, zp], [x1, Y + 1.1, zp], [x1, Y + 1.1, zo], [x0, 1.1, zo], col, [0, 1, 0], 0.25);
      face(c.roofs, [x0, 0, zo], [x1, 0, zo], [x1, Y + 1.1, zo], [x0, 1.1, zo], dark, [0, 0, -s], 0.25);
      face(c.roofs, [x0, 0, zi], [x1, 0, zi], [x1, Y, zi], [x0, 0.6, zi], dark, [0, 0, -s], 0.25);                         // inner barrier under the deck edge
      face(c.roofs, [x1, 0, za], [x1, 0, zb], [x1, Y, zb], [x1, Y, za], col, [1, 0, 0], 0.25);
      const n = Math.ceil((x1 - x0) / 6);
      for (let k = 0; k < n; k++) {
        const a = x0 + ((x1 - x0) * k) / n, b = x0 + ((x1 - x0) * (k + 1)) / n, ya = (Y * (a - x0)) / (x1 - x0), yb = (Y * (b - x0)) / (x1 - x0);
        bk.rects.push({ x: a, z: Math.min(zo, zp), w: b - a + 0.05, d: 0.7, h: yb + 1.1, y0: 0 });                          // outer wall
        bk.rects.push({ x: a, z: s > 0 ? zi : zi - 0.7, w: b - a + 0.05, d: 0.7, h: Y + 1.1, y0: 0 });                       // inner wall
        if (ya > 0.45) bk.rects.push({ x: a, z: za, w: b - a + 0.05, d: w, h: ya - 0.05, y0: 0 });                           // solid fill
      }
      bk.rects.push({ x: x1, z: Math.min(zo, zp), w: x2 - x1 + 0.7, d: 0.7, h: Y + 1.1, y0: Y - 0.3 }, { x: x2, z: za, w: 0.7, d: w, h: Y + 1.1, y0: Y - 0.3 });
    }
  }
  // end caps where the embankment meets the bridge deck
  face(c.roofs, [xb, 0, zc - hw - 0.7], [xb, 0, zc + hw + 0.7], [xb, Y, zc + hw + 0.7], [xb, Y, zc - hw - 0.7], col, [1, 0, 0], 0.25);
  face(c.roofs, [xc, 0, zc - hw - 0.7], [xc, 0, zc + hw + 0.7], [xc, Y, zc + hw + 0.7], [xc, Y, zc - hw - 0.7], col, [-1, 0, 0], 0.25);
  // SKYWAY gantry signs at both ramp mouths
  for (const [gx, ry] of [[xa + 18, -Math.PI / 2], [xd - 18, Math.PI / 2]]) {
    const y0 = viaductSurface(gx, zc);
    c.RB(gx - 0.25, y0, zc - hw - 0.6, gx + 0.25, y0 + 6.5, zc - hw - 0.1, col); c.RB(gx - 0.25, y0, zc + hw + 0.1, gx + 0.25, y0 + 6.5, zc + hw + 0.6, col);
    c.RB(gx - 0.3, y0 + 6.2, zc - hw - 0.6, gx + 0.3, y0 + 6.7, zc + hw + 0.6, col);
    c.signs.push({ text: 'SKYWAY  →  EAST · WEST', x: gx, y: y0 + 5.2, z: zc, ry });
  }
  // pillars with hammer-head crossbeams in the lots under the deck
  for (let i = 1; i <= 8; i++) {
    const bk = city.blocks[i][8];
    for (const dx of [14, 49, 84]) {
      const px = bk.x + dx;
      c.RB(px - 1.5, 0.25, zc - 1.5, px + 1.5, Y - 1.1, zc + 1.5, col);
      c.RB(px - 1.6, Y - 2.4, zc - 5.5, px + 1.6, Y - 1.1, zc + 5.5, col);
      bk.rects.push({ x: px - 1.5, z: zc - 1.5, w: 3, d: 3, h: Y - 1.1, y0: 0 });
    }
  }
  // deck lamps (alternating sides) with arms reaching over the carriageway
  for (let x = xb + 20, k = 0; x < xc - 10; x += 40, k++) { if (k === 12) continue; const s = k % 2 ? 1 : -1; c.lamps.push({ x, z: zc + s * (hw - 0.3), y: Y + 0.1, ang: s > 0 ? -Math.PI / 2 : Math.PI / 2 }); }
  c.pois.push({ kind: 'skyway', x: W / 2, z: zc, name: 'Skyway' });
}
