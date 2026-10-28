export const TERRAINS = ['meadow', 'forest', 'field', 'village', 'water'];

export const TERRAIN_INFO = {
  meadow: { name: 'Meadow', color: '#93b65b', emoji: '🌿', glint: '#e8f7a0' },
  forest: { name: 'Forest', color: '#3f6a3d', emoji: '🌲', glint: '#a8f0a0' },
  field: { name: 'Field', color: '#d8a743', emoji: '🌾', glint: '#ffe08a' },
  village: { name: 'Village', color: '#a0927b', emoji: '🏠', glint: '#ffd9a8' },
  water: { name: 'Lake', color: '#3f8796', emoji: '🌊', glint: '#bdf2ff' },
};

const WEIGHTS = { meadow: 30, forest: 27, field: 18, village: 15, water: 10 };

// How many extra tiles a request asks for, per terrain (min, max).
export const QUEST_EXTRA = { meadow: [3, 7], forest: [3, 7], field: [3, 6], village: [2, 5], water: [2, 4] };

export function rotatedEdges(edges, rot) {
  const out = new Array(6);
  for (let i = 0; i < 6; i++) out[i] = edges[(((i - rot) % 6) + 6) % 6];
  return out;
}

function pickTerrain(rng, exclude, noWater, boost) {
  const opts = TERRAINS.filter((t) => !exclude.includes(t) && !(noWater && t === 'water'));
  const w = (t) => WEIGHTS[t] * (boost[t] || 1);
  let total = 0;
  for (const t of opts) total += w(t);
  let x = rng() * total;
  for (const t of opts) {
    x -= w(t);
    if (x <= 0) return t;
  }
  return opts[opts.length - 1];
}

// A tile is 1-3 contiguous runs of terrain around its six sides.
// boost multiplies terrain weights, so an isle type can lean toward its own terrain.
export function makeTile(rng, { noWater = false, boost = {} } = {}) {
  const roll = rng();
  const n = roll < 0.18 ? 1 : roll < 0.68 ? 2 : 3;
  let lens;
  if (n === 1) lens = [6];
  else if (n === 2) {
    const a = [2, 3, 3, 4, 1, 5][Math.floor(rng() * 6)];
    lens = [a, 6 - a];
  } else {
    const a = 1 + Math.floor(rng() * 4);
    const b = a + 1 + Math.floor(rng() * (5 - a));
    lens = [a, b - a, 6 - b];
  }
  const segs = [];
  for (let s = 0; s < n; s++) {
    const exclude = [];
    if (s > 0) exclude.push(segs[s - 1]);
    if (s === n - 1 && n > 2) exclude.push(segs[0]);
    segs.push(pickTerrain(rng, exclude, noWater || lens[s] > 3, boost));
  }
  const base = [];
  segs.forEach((t, s) => { for (let k = 0; k < lens[s]; k++) base.push(t); });
  const offset = Math.floor(rng() * 6);
  return { edges: rotatedEdges(base, offset), quest: null, seed: Math.floor(rng() * 2 ** 31) };
}
