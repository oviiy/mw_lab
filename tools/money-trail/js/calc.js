// Pure helpers shared by pages; no DOM access so they run under node --test.
import { t, term } from './i18n.js';

export const kindLabel = k => t(`kind.${k}`);
export const KIND_COLOR = { new: '#4f6b3a', add: '#8fa36b', trim: '#c08a4a', exit: '#9c3b2e', hold: '#e6dcc4' };

const ok = x => x != null && Number.isFinite(x);

export function fmtMoney(x) {
  if (!ok(x)) return '—';
  const a = Math.abs(x), s = x < 0 ? '-' : '';
  // thresholds sit just below each unit so rounding never prints "$1000K"
  if (a >= 999.995e9) return `${s}$${(a / 1e12).toFixed(2)}T`;
  if (a >= 999.995e6) return `${s}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 999.95e3) return `${s}$${(a / 1e6).toFixed(1)}M`;
  if (a >= 999.5) return `${s}$${(a / 1e3).toFixed(0)}K`;
  return `${s}$${a.toFixed(0)}`;
}
export const fmtPct = (x, d = 1) => (ok(x) ? `${(x * 100).toFixed(d)}%` : '—');
export const fmtNum = x => (ok(x) ? Math.round(x).toLocaleString('en-US') : '—');
export function quarterLabel(iso) {
  const [y, m] = iso.split('-').map(Number);
  return `${y}Q${Math.ceil(m / 3)}`;
}
export function initials(name) {
  const w = name.replace(/[^A-Za-z ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  return ((w[0]?.[0] ?? '') + (w[1]?.[0] ?? '')).toUpperCase() || '?';
}
export function avatarColor(name) {
  const colors = ['#7a2e1f', '#4f6b3a', '#3f5e86', '#8a5a12', '#5e4a6e', '#2b2118', '#6b4e2e', '#5e7f7a'];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return colors[h % colors.length];
}

export function parseRoute(hash) {
  const parts = (hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
  if (!parts.length) return { page: 'home', params: {} };
  if (parts[0] === 'manager' && parts[1]) return { page: 'manager', params: { cik: parts[1] } };
  if (parts[0] === 'stock' && parts[1]) return { page: 'stock', params: { t: decodeURIComponent(parts[1]).toUpperCase() } };
  if (parts[0] === 'methods') return { page: 'methods', params: {} };
  if (parts[0] === 'managers') return { page: 'managers', params: {} };
  if (parts[0] === 'players') return { page: 'players', params: { g: parts[1] || 'all' } };
  if (parts[0] === 'congress') return { page: 'congress', params: {} };
  if (parts[0] === 'member' && parts[1]) return { page: 'member', params: { id: decodeURIComponent(parts[1]) } };
  if (parts[0] === 'insiders') return { page: 'insiders', params: {} };
  if (parts[0] === 'insider' && /^\d+$/.test(parts[1] || '')) return { page: 'insider', params: { cik: String(Number(parts[1])) } };
  return { page: 'notfound', params: {} };
}

export function search(meta, q, limit = 8) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const out = [];
  for (const m of meta.managers)
    if (m.name.toLowerCase().includes(s) || m.person.toLowerCase().includes(s))
      out.push({ type: 'manager', href: `#/manager/${m.cik}`, label: m.name, tag: m.person });
  const exact = [], prefix = [], other = [];
  for (const st of meta.stocks) {
    const t = st.t.toLowerCase();
    if (t === s) exact.push(st);
    else if (t.startsWith(s)) prefix.push(st);
    else if (st.n.toLowerCase().includes(s)) other.push(st);
  }
  for (const st of [...exact, ...prefix, ...other])
    out.push({ type: 'stock', href: `#/stock/${encodeURIComponent(st.t)}`, label: st.t, tag: st.n });
  return out.slice(0, limit);
}

export function sortRows(rows, key, dir = 'desc') {
  const m = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[key], y = b[key];
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    return (x < y ? -1 : x > y ? 1 : 0) * m;
  });
}

export function sankeyFromFlows(items, ticker) {
  const nodes = new Map([[ticker, { name: ticker }]]);
  const links = [];
  for (const it of items) {
    if (!(it.dollars > 0) || it.kind === 'hold') continue;
    const name = `${kindLabel(it.kind)}·${t(`grp.${it.group}`)}`;
    nodes.set(name, { name });
    if (it.kind === 'new' || it.kind === 'add') links.push({ source: name, target: ticker, value: it.dollars });
    else links.push({ source: ticker, target: name, value: it.dollars });
  }
  return { nodes: [...nodes.values()], links };
}

export function sectorSankey(flows) {
  const mid = t('grp.curated');
  const nodes = new Map([[mid, { name: mid }]]);
  const links = [];
  for (const [s, v] of Object.entries(flows.sells)) if (v > 0) { const n = `${t('flow.sell')}·${term(s)}`; nodes.set(n, { name: n }); links.push({ source: n, target: mid, value: v }); }
  for (const [s, v] of Object.entries(flows.buys)) if (v > 0) { const n = `${t('flow.buy')}·${term(s)}`; nodes.set(n, { name: n }); links.push({ source: mid, target: n, value: v }); }
  return { nodes: [...nodes.values()], links };
}

// ---- headline flow chart: per-stock totals for one quarter, and ranking by metric
const FLOW_KIND = { n: 'new', a: 'add', t: 'trim', x: 'exit' };

export function aggregateFlows(rows, pi) {
  const by = new Map();
  for (const [p, cik, key, k, dv] of rows) {
    if (p !== pi) continue;
    let a = by.get(key);
    if (!a) by.set(key, (a = { key, net: 0, buy: 0, sell: 0, up: 0, down: 0, parts: [] }));
    a.net += dv;
    if (dv > 0) { a.buy += dv; a.up++; } else if (dv < 0) { a.sell -= dv; a.down++; }
    a.parts.push({ cik, k: FLOW_KIND[k], dv });
  }
  for (const a of by.values()) a.mgrs = a.up - a.down;
  return [...by.values()];
}

export function rankFlows(aggs, metric, n) {
  if (metric === 'buy') return aggs.filter(a => a.buy > 0).sort((x, y) => y.buy - x.buy).slice(0, n);
  if (metric === 'sell') return aggs.filter(a => a.sell > 0).sort((x, y) => y.sell - x.sell).slice(0, n);
  const v = a => a[metric];
  return aggs.filter(a => v(a) !== 0).sort((x, y) => Math.abs(v(y)) - Math.abs(v(x))).slice(0, n).sort((x, y) => v(y) - v(x));
}

// Compact JSON tables ({keys, rows: [[...], ...]}) -> array of objects.
export const fromRows = (keys, rows) => rows.map(r => Object.fromEntries(keys.map((k, i) => [k, r[i]])));

// Cluster feed filter: cap bucket ('all' | 'small' | 'mid' | 'large') and minimum insiders.
export function filterClusters(clusters, { cap = 'all', minK = 0, linkedOnly = false } = {}) {
  return clusters.filter(c => (cap === 'all' || c.cap === cap) && c.k >= minK && (!linkedOnly || c.linked));
}

// ---- unified players view
export function filterPlayers(players, { g = 'all', q = '' } = {}) {
  const s = q.trim().toLowerCase();
  return players.filter(p => (g === 'all' || p.g === g) && (!s || p.name.toLowerCase().includes(s) || (p.sub || '').toLowerCase().includes(s)));
}

// Group rows by a field (funds can have several styles: they appear under each). Groups sorted by size; each carries
// its buy-weighted average 3-month excess return.
export function groupPlayers(rows, by) {
  const m = new Map();
  for (const p of rows) {
    const keys = by === 'style' ? (p.style || ['—']) : [by === 'g' ? p.g : (p[by] ?? '—')];
    for (const k of keys) { if (!m.has(k)) m.set(k, []); m.get(k).push(p); }
  }
  return [...m].map(([key, rs]) => {
    const w = rs.filter(p => p.ex3 != null && p.n3);
    const n = w.reduce((a, p) => a + p.n3, 0);
    return { key, rows: rs, ex3: n ? w.reduce((a, p) => a + p.ex3 * p.n3, 0) / n : null };
  }).sort((a, b) => (a.key === '—') - (b.key === '—') || b.rows.length - a.rows.length);   // players without the field last
}

// SEC filings shout company names ("COCA-COLA CO/THE"); show them in title case, keeping short all-caps tokens (ETF, LLC, II).
export function titleCase(name) {
  if (!name || name !== name.toUpperCase()) return name || '';
  const keep = new Set(['ETF', 'LLC', 'LP', 'II', 'III', 'IV', 'REIT', 'ADR', 'USA', 'US', 'NV', 'SA', 'AG', 'PLC', 'NA', 'SPDR', 'MSCI', 'S&P']);
  return name.replace(/\/THE$/, '').split(/(\s+|-|\/)/).map(w => (keep.has(w) || /^[A-Z]$/.test(w) || /\d/.test(w) ? w : w.charAt(0) + w.slice(1).toLowerCase())).join('');
}
