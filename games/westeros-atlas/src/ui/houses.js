// House panel (sigil swatch, words, seat, liege, summary, members) + family tree (SVG, spoiler-aware).
import { h, modal } from './dom.js';
import { t, tx, getLang } from '../i18n/index.js';
import { settings } from '../settings.js';
import { houseById, placeById, personById, loadHouse, loadAllPeople } from '../data/atlas.js';
import { SOURCES } from '../data/sources.js';
import { regionById } from '../data/regions.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); kids.forEach((c) => c && e.append(c)); return e; };

/** Small heater-shield swatch in the house colours (not a reproduction of any heraldic artwork). */
export function shield(colors = ['#888', '#ccc'], size = 28) {
  const [a, b] = colors.length ? colors : ['#888', '#ccc'];
  const s = svg('svg', { viewBox: '0 0 40 46', width: size, height: size * 1.15, class: 'shield', 'aria-hidden': 'true' });
  const path = 'M2 2 H38 V20 C38 33 28 41 20 44 C12 41 2 33 2 20 Z';
  s.append(svg('path', { d: path, fill: a, stroke: '#2a1b0d', 'stroke-width': '2' }));
  s.append(svg('path', { d: 'M20 10 L28 20 L20 34 L12 20 Z', fill: b || a, opacity: '0.95' }));
  s.append(svg('path', { d: path, fill: 'none', stroke: 'rgba(255,255,255,0.25)', 'stroke-width': '1', transform: 'translate(1.5 1.5) scale(0.925)' }));
  return s;
}

export async function openHouse(id, { onPlace, onHouse, focusPerson } = {}) {
  const idx = houseById[id]; if (!idx) return;
  const body = h('div.house-body', null, h('p.loading-line', null, t('house.loading')));
  const m = modal({ title: tx(idx.names), body, wide: true }); if (idx.tree) m.box.classList.add('xwide');
  const rec = await loadHouse(id); if (!rec) { body.replaceChildren(h('p', null, t('house.missing'))); return; }
  const seat = rec.seat && placeById[rec.seat], liege = rec.liege && houseById[rec.liege];
  const head = h('div.house-head', null, shield(rec.colors, 54), h('div', null,
    h('div.kicker', null, [t('tier.' + (rec.tier || 'minor')), tx(regionById[rec.region]?.names)].filter(Boolean).join(' · ')),
    rec.words ? h('p.words', null, '“', tx(rec.words), '”') : null,
    h('p.sigil', null, h('b', null, t('house.sigil') + '：'), tx(rec.sigil))));
  const facts = h('dl.house-facts', null,
    seat ? [h('dt', null, t('house.seat')), h('dd', null, h('button.linkish', { type: 'button', onClick: () => { m.close(); onPlace?.(seat.id); } }, tx(seat.names)))] : null,
    rec.otherSeats?.length ? [h('dt', null, t('house.otherSeats')), h('dd', null, rec.otherSeats.map((sid) => placeById[sid] ? h('button.linkish', { type: 'button', onClick: () => { m.close(); onPlace?.(sid); } }, tx(placeById[sid].names)) : null))] : null,
    liege ? [h('dt', null, t('house.liege')), h('dd', null, h('button.linkish', { type: 'button', onClick: () => { m.close(); onHouse?.(liege.id); } }, tx(liege.names)))] : null);
  const refs = h('div.refs', null, (rec.refs || []).map((r) => h('span.ref', null, tx(SOURCES[r]?.title) || r)));
  const parts = [head, facts, h('p.lead', null, tx(rec.summary)), refs];
  if (rec.members?.length) {
    const treeBox = h('div.tree-box', null, h('p.loading-line', null, t('house.treeLoading')));
    parts.push(h('h3', null, t('house.tree')), h('p.tree-note', null, settings().spoilers ? t('house.treeSpoilersOn') : t('house.treeSpoilersOff')), treeBox);
    loadAllPeople().then((people) => {
      treeBox.replaceChildren(familyTree(rec, people, { focus: focusPerson, onHouse: (hid) => { m.close(); onHouse?.(hid); } }));
      // bring the selected person (or the top of the tree) into view
      requestAnimationFrame(() => {
        const sc = treeBox.querySelector('.tree-scroll'), target = treeBox.querySelector('.tnode.focus') || treeBox.querySelector('.tnode');
        if (!sc || !target) return; const r = target.getBoundingClientRect(), b = sc.getBoundingClientRect();
        sc.scrollLeft += r.left - b.left - b.width / 2 + r.width / 2; sc.scrollTop += r.top - b.top - (target.classList.contains('focus') ? b.height / 2 : 20);
      });
    });
  }
  body.replaceChildren(...parts);
}

/** Tidy descendant tree of the house. Units = person + spouses; children hang under their father's (else mother's) unit. */
function familyTree(house, people, { focus, onHouse }) {
  const sp = settings().spoilers, lang = getLang();
  const members = (house.members || []).filter((m) => sp || !m.spoiler);
  const inHouse = new Set(members.map((m) => m.id));
  const kids = new Map(); const roots = [];
  for (const m of members) {
    const parent = (m.father && inHouse.has(m.father)) ? m.father : (m.mother && inHouse.has(m.mother)) ? m.mother : null;
    if (parent) (kids.get(parent) || kids.set(parent, []).get(parent)).push(m); else roots.push(m);
  }
  // a member who is the spouse of a displayed root (and has no children hung under them) is drawn beside that root, not as a second root
  const hasKids = (id) => (kids.get(id) || []).length > 0;
  const kept = new Set(roots.filter((r) => hasKids(r.id)).map((r) => r.id));
  const spouseOfKept = (r) => members.some((m) => kept.has(m.id) && (m.spouses || []).includes(r.id));
  const rootList = roots.filter((r) => kept.has(r.id) || !spouseOfKept(r));
  const BW = 150, BH = 50, GX = 14, GY = 46;
  const unitW = (m) => 1 + (m.spouses || []).filter((s) => sp || !(people.get(s)?.spoiler)).length;
  const widthOf = new Map();
  const W = (m) => { if (widthOf.has(m.id)) return widthOf.get(m.id); const c = kids.get(m.id) || []; const w = Math.max(unitW(m), c.reduce((a, k) => a + W(k), 0)); widthOf.set(m.id, w); return w; };
  const nodes = [], links = [];
  let maxDepth = 0;
  const place = (m, x0, depth) => {
    maxDepth = Math.max(maxDepth, depth);
    const w = W(m), uw = unitW(m), ux = x0 + (w - uw) / 2;
    const spouses = (m.spouses || []).filter((s) => sp || !(people.get(s)?.spoiler));
    nodes.push({ p: { ...people.get(m.id), ...m, house: house.id }, slot: ux, depth });
    spouses.forEach((s, i) => { const ps = people.get(s) || { id: s, name: { en: s, zh: s } }; nodes.push({ p: ps, slot: ux + 1 + i, depth, spouse: true }); links.push({ type: 'marriage', a: ux, b: ux + 1 + i, depth }); });
    let cx = x0; const c = kids.get(m.id) || [];
    for (const k of c) { const kw = W(k); const kslot = place(k, cx, depth + 1); links.push({ type: 'child', from: ux + (uw - 1) / 2, to: kslot, depth }); cx += kw; }
    return ux;
  };
  let x = 0; for (const r of rootList) { place(r, x, 0); x += W(r) + 0.4; }
  const width = Math.max(1, x) * (BW + GX), height = (maxDepth + 1) * (BH + GY) + 20;
  const sx = (slot) => slot * (BW + GX) + BW / 2 + 10, sy = (d) => d * (BH + GY) + 10;
  const root = svg('svg', { viewBox: `0 0 ${width + 20} ${height}`, width: width + 20, height, class: 'tree' });
  for (const l of links) {
    if (l.type === 'marriage') root.append(svg('line', { x1: sx(l.a) + BW / 2, y1: sy(l.depth) + BH / 2, x2: sx(l.b) - BW / 2, y2: sy(l.depth) + BH / 2, class: 'tl-marriage' }));
    else { const x1 = sx(l.from), y1 = sy(l.depth) + BH, x2 = sx(l.to), y2 = sy(l.depth + 1), my = (y1 + y2) / 2; root.append(svg('path', { d: `M${x1} ${y1} V${my} H${x2} V${y2}`, class: 'tl-child' })); }
  }
  for (const n of nodes) {
    const p = n.p, x0 = sx(n.slot) - BW / 2, y0 = sy(n.depth), other = p.house && p.house !== house.id;
    const g = svg('g', { class: `tnode${n.spouse ? ' spouse' : ''}${p.id === focus ? ' focus' : ''}`, transform: `translate(${x0} ${y0})`, tabindex: '0' });
    g.append(svg('rect', { width: BW, height: BH, rx: 7 }));
    const name = svg('text', { x: BW / 2, y: 20, 'text-anchor': 'middle', class: 'tn-name' }); name.textContent = trim(p.name?.[lang] || p.id, lang === 'zh' ? 9 : 20); g.append(name);
    const sub = svg('text', { x: BW / 2, y: 37, 'text-anchor': 'middle', class: 'tn-sub' });
    sub.textContent = other ? `${t('house.of')} ${trim(tx(houseById[p.house]?.names) || '', lang === 'zh' ? 8 : 18)}` : trim(tx(p.note) || '', lang === 'zh' ? 10 : 24); g.append(sub);
    const title = svg('title'); title.textContent = [p.name?.[lang], tx(p.note), sp && p.fate ? `${t('spoiler.label')}: ${tx(p.fate)}` : ''].filter(Boolean).join('\n'); g.append(title);
    if (other && houseById[p.house]) { g.style.cursor = 'pointer'; g.addEventListener('click', () => onHouse(p.house)); }
    root.append(g);
  }
  const wrap = h('div.tree-scroll', null, root);
  const zoom = (k) => { const cur = +(root.dataset.z || 1) * k; root.dataset.z = cur; root.setAttribute('width', (width + 20) * cur); root.setAttribute('height', height * cur); };
  return h('div', null, h('div.tree-tools', null, h('button.icon-btn', { type: 'button', 'aria-label': t('map.zoomIn'), onClick: () => zoom(1.25) }, '+'), h('button.icon-btn', { type: 'button', 'aria-label': t('map.zoomOut'), onClick: () => zoom(0.8) }, '−')), wrap);
}
const trim = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
