// Unified access to places, houses and people. Slim indexes are eager (map + search); full records load per group on demand.
import { PLACE_INDEX, HOUSE_INDEX, PEOPLE_INDEX, PLACE_GROUPS, HOUSE_GROUPS } from '../generated/atlas-index.js';
import { locationById } from './locations.js';

export const PLACES = PLACE_INDEX;
export const placeById = Object.fromEntries(PLACES.map((p) => [p.id, p]));
export const HOUSES = HOUSE_INDEX;
export const houseById = Object.fromEntries(HOUSES.map((h) => [h.id, h]));
export const PEOPLE = PEOPLE_INDEX;
export const personById = Object.fromEntries(PEOPLE.map((p) => [p.id, p]));

const groupCache = new Map();
const loadGroup = (table, key, g) => { const k = key + ':' + g; if (!groupCache.has(k)) groupCache.set(k, table[g]().then((m) => m.default)); return groupCache.get(k); };

/** Full place record: summary, houses, refs, confidence (+ index fields). Explorable places fall back to their 3D-location summary. */
export async function loadPlace(id) {
  const idx = placeById[id]; if (!idx) return null;
  let rec = null;
  if (idx.group && PLACE_GROUPS[idx.group]) { const g = await loadGroup(PLACE_GROUPS, 'p', idx.group); rec = g.places.find((p) => p.id === id) || null; }
  const loc = locationById[id];
  return { ...idx, ...(rec || {}), summary: rec?.summary || loc?.summary || null, houses: idx.houses || rec?.houses || [], at: idx.at, kind: idx.kind, names: idx.names };
}
export async function loadHouse(id) {
  const idx = houseById[id]; if (!idx) return null;
  const g = await loadGroup(HOUSE_GROUPS, 'h', idx.group);
  return g.houses.find((h) => h.id === id) || null;
}
/** Every person record across all house groups (for family trees, which cross houses through marriage). */
let peopleFull = null;
export async function loadAllPeople() {
  if (peopleFull) return peopleFull;
  const groups = await Promise.all(Object.keys(HOUSE_GROUPS).map((g) => loadGroup(HOUSE_GROUPS, 'h', g)));
  peopleFull = new Map();
  for (const g of groups) for (const h of g.houses) for (const m of h.members || []) peopleFull.set(m.id, { ...m, house: h.id });
  return peopleFull;
}
