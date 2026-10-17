// Bilingual search over places, regions, houses, people and 3D landmarks — in any UI language.
import { PLACES, HOUSES, PEOPLE } from '../data/atlas.js';
import { REGIONS, regionById } from '../data/regions.js';
import { LANDMARK_INDEX } from '../generated/landmarks.js';
import { norm } from '../i18n/index.js';
import { KIND_WORDS } from '../i18n/kinds.js';

let index = null;
function build() {
  index = [];
  const add = (e, primary, extra = []) => { e.primary = primary.filter(Boolean).map(norm); e.hay = [...e.primary, ...extra.filter(Boolean).map(norm)]; index.push(e); };
  for (const l of PLACES) { const r = regionById[l.region]; add({ type: 'loc', id: l.id, name: l.names, rank: l.rank }, [l.names.en, l.names.zh, ...(l.alt || [])], [r?.names.en, r?.names.zh, ...(KIND_WORDS[l.kind] || [])]); }
  for (const r of REGIONS) add({ type: 'region', id: r.id, name: r.names, rank: 3 }, [r.names.en, r.names.zh, ...(r.alt || [])]);
  for (const hs of HOUSES) add({ type: 'house', id: hs.id, name: hs.names, rank: hs.tier === 'great' ? 4 : hs.tier === 'major' ? 3 : 2 }, [hs.names.en, hs.names.zh, hs.names.en.replace(/^House\s+/i, ''), hs.names.zh.replace(/家族$/, '')]);
  for (const p of PEOPLE) if (!p.spoiler) add({ type: 'person', id: p.id, house: p.house, name: p.name, rank: 2 }, [p.name.en, p.name.zh]);
  for (const lm of LANDMARK_INDEX) add({ type: 'lm', id: lm.id, loc: lm.loc, name: { en: lm.en, zh: lm.zh }, rank: 1 }, [lm.en, lm.zh]);
}
const TYPE_BONUS = { loc: 3, region: 2, house: 2, person: 1, lm: 0 };
export function search(q, limit = 10) {
  if (!index) build();
  const n = norm(q); if (!n) return [];
  const res = [];
  for (const e of index) {
    let s = 0;
    if (e.primary.some((p) => p === n)) s = 100;
    else if (e.primary.some((p) => p.startsWith(n))) s = 60;
    else if (e.primary.some((p) => p.includes(n))) s = 40;
    else if (e.hay.some((p) => p.includes(n))) s = 18;
    if (s) res.push({ e, s: s + e.rank * 2 + TYPE_BONUS[e.type] });
  }
  res.sort((a, b) => b.s - a.s);
  return res.slice(0, limit).map((r) => r.e);
}
export function rebuildSearchIndex() { index = null; }
