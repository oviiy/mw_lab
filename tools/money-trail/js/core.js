import { kindLabel, sortRows } from './calc.js';
import { t } from './i18n.js';

const cache = new Map();
export async function loadJSON(path) {
  if (!cache.has(path)) cache.set(path, fetch(path).then(r => { if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`); return r.json(); }));
  try { return await cache.get(path); } catch (e) { cache.delete(path); throw e; }
}

export function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) n.append(k instanceof Node ? k : String(k));
  return n;
}
export const card = (title, sub, ...body) =>
  el('div', { class: 'card' }, title ? el('h3', {}, title) : null, sub ? el('div', { class: 'sub' }, sub) : null, ...body);
export const chartDiv = (size = '') => el('div', { class: `chart ${size}`.trim() });
export const kpi = (label, value) => el('div', { class: 'card kpi' }, el('div', { class: 'label' }, label), el('div', { class: 'val' }, value));
export const kindBadge = k => el('span', { class: `kind kind-${k}` }, kindLabel(k));
export const stockLink = (t, label) => (t ? el('a', { href: `#/stock/${encodeURIComponent(t)}`, class: 'mono' }, label ?? t) : el('span', { class: 'muted' }, label ?? '—'));
export const managerLink = (cik, name) => el('a', { href: `#/manager/${cik}` }, name);

// cols: [{key, label, num?, fmt?(value,row) -> Node|string}]
export function table(cols, rows, { sortKey = null, dir = 'desc', limit = 0 } = {}) {
  const wrap = el('div', { class: 'tbl-wrap' });
  let key = sortKey, d = dir;
  const draw = () => {
    const data = key ? sortRows(rows, key, d) : rows;
    const shown = limit ? data.slice(0, limit) : data;
    const head = el('tr', {}, cols.map(c => el('th', {
      class: c.num ? 'num' : null,
      onclick: () => { d = key === c.key && d === 'desc' ? 'asc' : 'desc'; key = c.key; draw(); },
    }, c.label + (key === c.key ? (d === 'desc' ? ' ↓' : ' ↑') : ''))));
    const body = shown.map(r => el('tr', {}, cols.map(c => el('td', { class: c.num ? 'num' : null }, c.fmt ? c.fmt(r[c.key], r) : (r[c.key] ?? '—')))));
    wrap.replaceChildren(el('table', { class: 'tbl' }, el('thead', {}, head), el('tbody', {}, body)));
    if (!rows.length) wrap.append(el('div', { class: 'empty' }, t('empty')));
  };
  draw();
  return wrap;
}
