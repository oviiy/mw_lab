// Flat-top axial hex grid. Corner i sits at angle 60*i, edge i spans corners i..i+1
// and faces angle 60*i+30, measured with cos -> world x and sin -> world z.

export const SQRT3 = Math.sqrt(3);

export function toWorld(q, r) {
  return { x: 1.5 * q, z: SQRT3 * (r + q / 2) };
}

export function fromWorld(x, z) {
  const q = (2 / 3) * x;
  const r = (-1 / 3) * x + (SQRT3 / 3) * z;
  let rx = Math.round(q), rz = Math.round(r), ry = Math.round(-q - r);
  const dx = Math.abs(rx - q), dz = Math.abs(rz - r), dy = Math.abs(ry + q + r);
  if (dx > dy && dx > dz) rx = -ry - rz;
  else if (dz > dy) rz = -rx - ry;
  return { q: rx + 0, r: rz + 0 }; // + 0 normalises -0
}

export const key = (q, r) => q + ',' + r;

// DIRS[i] is the axial offset of the neighbour across edge i.
export const DIRS = new Array(6);
for (const [dq, dr] of [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]) {
  const { x, z } = toWorld(dq, dr);
  const deg = (Math.atan2(z, x) * 180) / Math.PI;
  DIRS[(((Math.round((deg - 30) / 60)) % 6) + 6) % 6] = [dq, dr];
}

export const cornerAngle = (i) => (i * Math.PI) / 3;
export const edgeAngle = (i) => ((i * 60 + 30) * Math.PI) / 180;
