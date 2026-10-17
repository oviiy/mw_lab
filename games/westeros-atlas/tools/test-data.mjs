// Data & content validation. Run: npm test   (exit code 1 on any failure)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { LOCATIONS, KINDS } from '../src/data/locations.js';
import { REGIONS, WORLD } from '../src/data/regions.js';
import { SOURCES, CHECKED, CONFIDENCE } from '../src/data/sources.js';
import { ROUTES } from '../src/data/routes.js';
import { EN } from '../src/i18n/strings.en.js';
import { ZH } from '../src/i18n/strings.zh.js';

const fails = [], warns = [];
const fail = (m) => fails.push(m), warn = (m) => warns.push(m);
const CJK = /[一-鿿]/, LATIN = /[A-Za-z]{3,}/;
const pairOK = (p, where, { zhMustBeCJK = true } = {}) => {
  if (!p || typeof p.en !== 'string' || typeof p.zh !== 'string' || !p.en.trim() || !p.zh.trim()) { fail(`${where}: missing en/zh text`); return false; }
  if (zhMustBeCJK && !CJK.test(p.zh)) fail(`${where}: zh text has no Chinese characters: "${p.zh.slice(0, 40)}"`);
  if (LATIN.test(p.en) === false && p.en.length > 8) fail(`${where}: en text looks non-English`);
  return true;
};

// --- locations & regions
const regionIds = new Set(REGIONS.map((r) => r.id)), seen = new Set();
for (const r of REGIONS) { pairOK(r.names, `region ${r.id} names`); pairOK(r.desc, `region ${r.id} desc`); }
for (const l of LOCATIONS) {
  if (seen.has(l.id)) fail(`duplicate location id ${l.id}`); seen.add(l.id);
  if (!KINDS.includes(l.kind)) fail(`${l.id}: bad kind ${l.kind}`);
  if (!regionIds.has(l.region)) fail(`${l.id}: unknown region ${l.region}`);
  if (!(l.at[0] > 0 && l.at[0] < WORLD.w && l.at[1] > 0 && l.at[1] < WORLD.h)) fail(`${l.id}: position outside the world`);
  if (![1, 2, 3, 4, 5].includes(l.rank)) fail(`${l.id}: bad rank`);
  pairOK(l.names, `${l.id} names`); pairOK(l.summary, `${l.id} summary`);
  if (!['deep', 'moderate', 'sparse'].includes(l.depth)) fail(`${l.id}: bad depth`);
}
// --- UI strings parity + usage
const enK = Object.keys(EN), zhK = Object.keys(ZH);
for (const k of enK) if (!(k in ZH)) fail(`strings: "${k}" missing in zh`);
for (const k of zhK) if (!(k in EN)) fail(`strings: "${k}" missing in en`);
for (const k of zhK) if (!CJK.test(ZH[k]) && !/^[A-Za-z0-9 ·{}\/+\-:.,]+$/.test(ZH[k])) warn(`strings: zh "${k}" has no CJK`);
const srcFiles = ['src/app.js', 'src/ui/sceneui.js', 'src/ui/modals.js', 'src/ui/dom.js'];
const used = new Set();
for (const f of srcFiles) {
  const s = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  for (const m of s.matchAll(/\bt\('([\w.]+)'\s*[,)]/g)) used.add(m[1]);
  for (const m of s.matchAll(/(?:\bi18n):\s*'([\w.]+)'\s*[,})]/g)) used.add(m[1]);
  for (const m of s.matchAll(/i18n-attrs'?:\s*'([^']+)'/g)) for (const p of m[1].split(',')) { const k = p.split(':')[1]?.trim(); if (k && k !== "key" && k.includes(".") && !k.includes("$")) used.add(k); }
}
for (const k of used) if (!(k in EN)) fail(`code uses missing string key "${k}"`);
// dynamic key families
for (const l of ['dawn', 'day', 'dusk', 'night']) if (!EN['atmos.' + l]) fail('atmos.' + l);
for (const w of ['clear', 'snow', 'rain', 'fog']) if (!EN['weather.' + w]) fail('weather.' + w);
for (const k of KINDS) for (const s of ['', '.pl']) if (!EN['kind.' + k + s]) fail('kind.' + k + s);
for (const d of ['deep', 'moderate', 'sparse']) if (!EN['depth.' + d]) fail('depth.' + d);
for (const k of ['westeros', 'essos']) if (!EN['cont.' + k]) fail('cont.' + k);
for (const k of ['novel', 'map', 'author', 'companion', 'index']) if (!EN['sources.kind.' + k]) fail('sources.kind.' + k);
// routes
for (const r of ROUTES) { pairOK(r.names, `route ${r.id}`); pairOK(r.note, `route ${r.id} note`); for (const s of r.stops) if (!seen.has(s)) fail(`route ${r.id}: unknown stop ${s}`); }

// --- scenes & content
const MIN = { deep: 10, moderate: 7, sparse: 5 };
let withContent = 0;
for (const l of LOCATIONS) {
  const sf = existsSync(`src/scenes/${l.id}.js`), cf = existsSync(`src/content/${l.id}.js`);
  if (!sf || !cf) { fail(`${l.id}: missing ${!sf ? 'scene ' : ''}${!cf ? 'content' : ''} file`); continue; }
  const sceneSrc = readFileSync(`src/scenes/${l.id}.js`, 'utf8');
  const mod = await import(pathToFileURL(resolve(`src/content/${l.id}.js`)).href); const c = mod.default; withContent++;
  if (c.id !== l.id) fail(`${l.id}: content.id mismatch`);
  pairOK(c.intro, `${l.id} intro`); pairOK(c.notes, `${l.id} notes`);
  const ids = Object.keys(c.landmarks || {});
  if (ids.length < MIN[l.depth]) fail(`${l.id}: only ${ids.length} landmarks (min ${MIN[l.depth]} for ${l.depth})`);
  for (const t of c.tour || []) if (!ids.includes(t)) fail(`${l.id}: tour stop "${t}" not in landmarks`);
  if ((c.tour || []).length < 4) fail(`${l.id}: tour has < 4 stops`);
  for (const id of ids) {
    const lm = c.landmarks[id], w = `${l.id}/${id}`;
    pairOK(lm.name, `${w} name`); pairOK(lm.desc, `${w} desc`); pairOK(lm.tour, `${w} tour`);
    if (lm.name.en.length > 34) warn(`${w}: English pin name long (${lm.name.en.length})`);
    if (lm.name.zh.length > 12) warn(`${w}: Chinese pin name long (${lm.name.zh.length})`);
    if (lm.spoiler) pairOK(lm.spoiler, `${w} spoiler`);
    const s = lm.source; if (!s) { fail(`${w}: no source block`); continue; }
    if (!CONFIDENCE[s.confidence]) fail(`${w}: bad confidence`);
    pairOK(s.book, `${w} source.book`); pairOK(s.unknown, `${w} source.unknown`); pairOK(s.interpretation, `${w} source.interpretation`);
    if (!Array.isArray(s.refs) || !s.refs.length) fail(`${w}: no refs`); for (const r of s.refs || []) if (!SOURCES[r]) fail(`${w}: unknown ref ${r}`);
    if (!sceneSrc.includes(`'${id}'`) && !sceneSrc.includes(`"${id}"`) && !sceneSrc.includes(id)) fail(`${w}: landmark id not found in scene source`);
  }
  for (const s of c.sources || []) { if (!SOURCES[s.ref]) fail(`${l.id}: unknown source ref ${s.ref}`); if (!CHECKED[s.checked]) fail(`${l.id}: bad checked "${s.checked}"`); pairOK(s.note, `${l.id} source note`); }
  if (!(c.sources || []).length) fail(`${l.id}: no sources[] register`);
}
// --- places / houses / people (src/data/places, src/data/houses)
{
  const { readdirSync } = await import('node:fs');
  const { ALL_KINDS } = await import('../src/data/kinds.js');
  const grp = (d) => readdirSync(d).filter((f) => f.endsWith('.js'));
  const allIds = new Set(LOCATIONS.map((l) => l.id)), placeIds = new Set(allIds), houseIds = new Set(), personIds = new Set(), houseRefs = [], personRefs = [];
  let nPlaces = 0, nHouses = 0, nPeople = 0;
  for (const f of grp('src/data/places')) {
    const mod = (await import(pathToFileURL(resolve('src/data/places', f)).href)).default;
    for (const p of mod.places || []) {
      const w = `places/${f}:${p.id}`;
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id || '')) fail(`${w}: bad id`);
      const ext = allIds.has(p.id) && LOCATIONS.some((l) => l.id === p.id);
      if (!ext) { if (placeIds.has(p.id)) fail(`${w}: duplicate place id`); placeIds.add(p.id); nPlaces++;
        if (!ALL_KINDS.includes(p.kind)) fail(`${w}: bad kind ${p.kind}`);
        if (!regionIds.has(p.region)) fail(`${w}: unknown region ${p.region}`);
        if (!Array.isArray(p.at) || !(p.at[0] >= 0 && p.at[0] <= WORLD.w && p.at[1] >= 0 && p.at[1] <= WORLD.h)) fail(`${w}: position outside the world`);
        if (![1, 2, 3, 4, 5].includes(p.rank)) fail(`${w}: bad rank`);
        pairOK(p.names, `${w} names`, { zhMustBeCJK: false }); }
      if (p.summary) pairOK(p.summary, `${w} summary`); else if (!ext) fail(`${w}: missing summary`);
      if (p.spoiler) pairOK(p.spoiler, `${w} spoiler`);
      for (const r of p.refs || []) if (!SOURCES[r]) fail(`${w}: unknown ref ${r}`);
      if (p.confidence && !CONFIDENCE[p.confidence]) fail(`${w}: bad confidence`);
      for (const hId of p.houses || []) houseRefs.push([w, hId]);
    }
  }
  for (const f of grp('src/data/houses')) {
    const mod = (await import(pathToFileURL(resolve('src/data/houses', f)).href)).default;
    for (const hs of mod.houses || []) {
      const w = `houses/${f}:${hs.id}`; nHouses++;
      if (houseIds.has(hs.id)) fail(`${w}: duplicate house id`); houseIds.add(hs.id);
      pairOK(hs.names, `${w} names`); pairOK(hs.summary, `${w} summary`); pairOK(hs.sigil, `${w} sigil`); if (hs.words) pairOK(hs.words, `${w} words`);
      if (!['great', 'major', 'minor', 'extinct'].includes(hs.tier)) fail(`${w}: bad tier`);
      if (!regionIds.has(hs.region)) fail(`${w}: unknown region ${hs.region}`);
      if (!Array.isArray(hs.colors) || !hs.colors.every((c) => /^#[0-9a-f]{6}$/i.test(c))) fail(`${w}: colors must be #rrggbb`);
      if (hs.seat) houseRefs.push([w + ' seat', '@' + hs.seat]); for (const s2 of hs.otherSeats || []) houseRefs.push([w + ' otherSeat', '@' + s2]);
      if (hs.liege) houseRefs.push([w + ' liege', hs.liege]);
      for (const r of hs.refs || []) if (!SOURCES[r]) fail(`${w}: unknown ref ${r}`);
      for (const m of hs.members || []) {
        nPeople++; if (personIds.has(m.id)) fail(`${w}: duplicate person ${m.id}`); personIds.add(m.id);
        pairOK(m.name, `${w}/${m.id} name`, { zhMustBeCJK: false }); if (m.note) pairOK(m.note, `${w}/${m.id} note`); if (m.fate) pairOK(m.fate, `${w}/${m.id} fate`);
        for (const r of [m.father, m.mother, ...(m.spouses || [])].filter(Boolean)) personRefs.push([`${w}/${m.id}`, r]);
      }
    }
  }
  for (const [w, r] of houseRefs) { if (r.startsWith('@')) { if (!placeIds.has(r.slice(1))) fail(`${w}: unknown place ${r.slice(1)}`); } else if (!houseIds.has(r)) fail(`${w}: unknown house ${r}`); }
  for (const [w, r] of personRefs) if (!personIds.has(r)) warn(`${w}: refers to undefined person ${r}`);
  console.log(`places (extra): ${nPlaces}, houses: ${nHouses}, people: ${nPeople}`);
}
console.log(`locations: ${LOCATIONS.length}, regions: ${REGIONS.length}, with scene+content: ${withContent}, ui strings: ${enK.length} (en) / ${zhK.length} (zh)`);
warns.slice(0, 40).forEach((w) => console.log('  warn:', w)); if (warns.length > 40) console.log(`  … ${warns.length - 40} more warnings`);
if (fails.length) { console.error(`\n${fails.length} FAILURES`); fails.slice(0, 120).forEach((f) => console.error('  ✘', f)); process.exit(1); }
console.log('all checks passed');
