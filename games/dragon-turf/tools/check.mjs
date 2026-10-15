// Headless sanity check (node tools/check.mjs): builds the world and verifies that every
// mission position spec resolves to a real point, every turf has a hideout, every race
// checkpoint is reachable by road, and every district has a dealer spot.
import { SEED } from '../src/config.js';
import { generateWorld } from '../src/world/generate.js';
import { resolvePos } from '../src/systems/missions/resolve.js';
import { nearestNode, findPath } from '../src/world/roadnet.js';
import { MISSIONS } from '../src/data/missions.js';

const w = generateWorld(SEED), problems = [];
const game = { world: w, player: { x: w.spawn.x, y: w.spawn.y }, entities: { nearest: () => null } };
const check = (id, spec) => { if (typeof spec !== 'string' || spec === 'player') return; const r = resolvePos(game, spec); if (!r || !Number.isFinite(r.x) || !Number.isFinite(r.y)) problems.push(`${id}: "${spec}" does not resolve`); };
for (const m of MISSIONS) for (const s of m.steps) {
  check(m.id, s.to); check(m.id, s.at);
  for (const sp of s.spawn || []) check(m.id, sp.at);
  for (const c of s.checkpoints || []) check(m.id, c);
  if (s.checkpoints) { let prev = nearestNode(w, w.spawn.x, w.spawn.y).id; for (const c of s.checkpoints) { const r = resolvePos(game, c), n = nearestNode(w, r.x, r.y); if (findPath(w, prev, n.id).length === 0) problems.push(`${m.id}: checkpoint "${c}" unreachable by road`); prev = n.id; } }
}
for (const t of w.turfs) if (t.hideout == null) problems.push(`turf "${t.name}" has no hideout`);
for (let d = 0; d < 6; d++) if (!w.dealerSpots.some((s) => s.d === d)) problems.push(`district ${d} has no dealer spot`);
const ids = new Set(MISSIONS.map((m) => m.id)); for (const m of MISSIONS) for (const u of m.unlock) if (!ids.has(u)) problems.push(`${m.id}: unknown unlock "${u}"`);
console.log(problems.length ? 'PROBLEMS:\n  ' + problems.join('\n  ') : `OK · ${MISSIONS.length} missions, ${w.turfs.length} turfs, ${w.dealerSpots.length} dealer spots, ${w.buildings.length} buildings`);
process.exit(problems.length ? 1 : 0);
