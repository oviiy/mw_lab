// Batch: collect many primitives and bake them into ONE mesh per material (static geometry, few draw calls).
// Inst: thin helper over InstancedMesh for repeated props.
import * as THREE from 'three';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const _n = new THREE.Matrix3(), _v = new THREE.Vector3(), _c = new THREE.Color();

const protos = new Map();
function proto(key, make) {
  let g = protos.get(key);
  if (!g) { g = make(); if (g.index) g = g.toNonIndexed(); protos.set(key, g); }
  return g;
}
const baseUp = (g) => { g.computeBoundingBox(); g.translate(0, -g.boundingBox.min.y, 0); return g; }; // sit on y=0

const P = {
  box: () => proto('box', () => baseUp(new THREE.BoxGeometry(1, 1, 1))),
  cyl: (seg, top) => proto(`cyl${seg}|${top}`, () => baseUp(new THREE.CylinderGeometry(top, 1, 1, seg, 1))),
  cone: (seg) => proto(`cone${seg}`, () => baseUp(new THREE.ConeGeometry(1, 1, seg, 1))),
  sphere: (seg) => proto(`sph${seg}`, () => baseUp(new THREE.SphereGeometry(1, seg, Math.max(4, seg >> 1)))),
  dome: (seg) => proto(`dome${seg}`, () => baseUp(new THREE.SphereGeometry(1, seg, Math.max(4, seg >> 1), 0, Math.PI * 2, 0, Math.PI / 2))),
  pyramid: () => proto('pyr', () => baseUp(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4))),
  prism: () => proto('prism', () => {
    // gable roof: ridge along local X, unit footprint 1x1, height 1
    const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 1); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -0.5);
    g.rotateY(Math.PI / 2); return g; // now ridge along X, slopes toward +/-Z
  }),
  wedge: () => proto('wedge', () => { // ramp: rises along +x
    const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0.5, 1); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -0.5); return g;
  }),
  torus: (seg) => proto(`tor${seg}`, () => new THREE.TorusGeometry(1, 0.08, 6, seg)),
};

export class Batch {
  constructor() { this.groups = new Map(); }
  _g(mat) { let g = this.groups.get(mat); if (!g) { g = { pos: [], nor: [], uv: [], col: [] }; this.groups.set(mat, g); } return g; }

  /** Add any BufferGeometry with a transform and optional tint (hex or THREE.Color). */
  addGeometry(mat, geom, matrix, color = 0xffffff) {
    const g = this._g(mat);
    const geo = geom.index ? geom.toNonIndexed() : geom;
    const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv;
    _n.getNormalMatrix(matrix);
    _c.set(color);
    for (let i = 0; i < pos.count; i++) {
      _v.fromBufferAttribute(pos, i).applyMatrix4(matrix); g.pos.push(_v.x, _v.y, _v.z);
      if (nor) { _v.fromBufferAttribute(nor, i).applyMatrix3(_n).normalize(); g.nor.push(_v.x, _v.y, _v.z); } else g.nor.push(0, 1, 0);
      if (uv) g.uv.push(uv.getX(i), uv.getY(i)); else g.uv.push(0, 0);
      g.col.push(_c.r, _c.g, _c.b);
    }
  }
  _add(mat, geom, x, y, z, sx, sy, sz, ry, color, rx = 0, rz = 0) {
    _e.set(rx, ry, rz); _q.setFromEuler(_e); _p.set(x, y, z); _s.set(sx, sy, sz);
    _m.compose(_p, _q, _s);
    this.addGeometry(mat, geom, _m, color);
  }
  /** Box sitting on base y. */
  box(mat, x, y, z, w, h, d, ry = 0, color = 0xffffff, rx = 0, rz = 0) { this._add(mat, P.box(), x, y, z, w, h, d, ry, color, rx, rz); return this; }
  /** Cylinder (tapering to rTop fraction) sitting on y. r = bottom radius. */
  cyl(mat, x, y, z, r, h, { top = 1, seg = 14, color = 0xffffff, ry = 0 } = {}) { this._add(mat, P.cyl(seg, top), x, y, z, r, h, r, ry, color); return this; }
  cone(mat, x, y, z, r, h, { seg = 10, color = 0xffffff, ry = 0 } = {}) { this._add(mat, P.cone(seg), x, y, z, r, h, r, ry, color); return this; }
  sphere(mat, x, y, z, r, { seg = 12, sy = 1, color = 0xffffff } = {}) { this._add(mat, P.sphere(seg), x, y, z, r, r * sy, r, 0, color); return this; }
  dome(mat, x, y, z, r, { seg = 16, sy = 1, color = 0xffffff, ry = 0 } = {}) { this._add(mat, P.dome(seg), x, y, z, r, r * sy, r, ry, color); return this; }
  pyramid(mat, x, y, z, w, h, d, ry = 0, color = 0xffffff) { this._add(mat, P.pyramid(), x, y, z, w * 1.4142, h, d * 1.4142, ry, color); return this; }
  /** Gable roof prism: footprint w (along ridge) x d, height h. */
  prism(mat, x, y, z, w, h, d, ry = 0, color = 0xffffff) { this._add(mat, P.prism(), x, y, z, w, h, d, ry, color); return this; }
  wedge(mat, x, y, z, w, h, d, ry = 0, color = 0xffffff) { this._add(mat, P.wedge(), x, y, z, w, h, d, ry, color); return this; }
  /** Extrude a 2D footprint [[x,z],...] from y up by h. */
  extrude(mat, pts, y, h, color = 0xffffff) {
    const sh = new THREE.Shape(pts.map(([px, pz]) => new THREE.Vector2(px, -pz)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); // shape XY -> XZ, extrusion up +Y
    _m.makeTranslation(0, y, 0); this.addGeometry(mat, g, _m, color); g.dispose(); return this;
  }
  /** Flat ribbon that follows terrain along [[x,z],...]. */
  ribbon(mat, pts, width, heightAt = () => 0, lift = 0.12, color = 0xffffff, uvScale = 0.1) {
    const g = this._g(mat); _c.set(color);
    let dist = 0; const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      const nx = -dz * width / 2, nz = dx * width / 2;
      if (i) dist += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      L.push([pts[i][0] + nx, pts[i][1] + nz, dist]); R.push([pts[i][0] - nx, pts[i][1] - nz, dist]);
    }
    const push = (p, u) => { g.pos.push(p[0], heightAt(p[0], p[1]) + lift, p[1]); g.nor.push(0, 1, 0); g.uv.push(u, p[2] * uvScale); g.col.push(_c.r, _c.g, _c.b); };
    for (let i = 0; i < pts.length - 1; i++) {
      push(L[i], 0); push(L[i + 1], 0); push(R[i], 1);   // counter-clockwise seen from above (faces up)
      push(R[i], 1); push(L[i + 1], 0); push(R[i + 1], 1);
    }
    return this;
  }
  build({ shadow = true, receive = true } = {}) {
    const root = new THREE.Group();
    for (const [mat, g] of this.groups) {
      if (!g.pos.length) continue;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(g.pos, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(g.nor, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.uv, 2));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(g.col, 3));
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = shadow && !mat.transparent; mesh.receiveShadow = receive;
      root.add(mesh);
    }
    this.groups.clear();
    return root;
  }
}

/** Instanced props: add() then build(). */
export class Inst {
  constructor(geometry, material, { cast = true } = {}) { this.geometry = geometry; this.material = material; this.items = []; this.cast = cast; }
  add(x, y, z, sx = 1, sy = sx, sz = sx, ry = 0, color = 0xffffff) { this.items.push([x, y, z, sx, sy, sz, ry, color]); return this; }
  build() {
    let geo = this.geometry;
    if (!geo.attributes.color) { geo = geo.clone(); const n = geo.attributes.position.count; geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3)); }
    const mesh = new THREE.InstancedMesh(geo, this.material, Math.max(1, this.items.length));
    mesh.count = this.items.length;
    this.items.forEach((it, i) => {
      _e.set(0, it[6], 0); _q.setFromEuler(_e); _p.set(it[0], it[1], it[2]); _s.set(it[3], it[4], it[5]);
      _m.compose(_p, _q, _s); mesh.setMatrixAt(i, _m); mesh.setColorAt(i, _c.set(it[7]));
    });
    mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = this.cast; mesh.receiveShadow = true; mesh.frustumCulled = false;
    return mesh;
  }
}

/** Reusable base-on-ground geometries for Inst. */
export const G = {
  box: () => P.box(),
  cone: (seg = 7) => P.cone(seg),
  cyl: (seg = 8, top = 1) => P.cyl(seg, top),
  sphere: (seg = 8) => P.sphere(seg),
  dome: (seg = 12) => P.dome(seg),
  prism: () => P.prism(),
  pyramid: () => P.pyramid(),
};
