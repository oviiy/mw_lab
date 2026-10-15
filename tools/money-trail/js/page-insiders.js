import { loadJSON, el, card, chartDiv, stockLink, table } from './core.js';
import { mount, bandSeries, PALETTE } from './charts.js';
import { fmtMoney, fmtPct, fmtNum, fromRows, filterClusters } from './calc.js';
import { t } from './i18n.js';

export const ROLE_COLOR = { ceo_cfo: PALETTE[4], officer: PALETTE[0], director: PALETTE[8], owner10: PALETTE[6], other: PALETTE[10] };
export const insiderLink = (c, nm, pg = true) => (pg ? el('a', { href: `#/insider/${c}` }, nm) : el('span', {}, nm));
export const rolePill = r => el('span', { class: `role role-${r}` }, t(`ins.role.${r}`));
export const codePill = (k, plan) => el('span', { class: 'codes' },
  el('span', { class: `kind kind-${k === 'P' ? 'new' : 'exit'}` }, t(k === 'P' ? 'ins.buy' : 'ins.sell')),
  plan ? el('span', { class: 'plan', title: t('ins.plan.tip') }, '10b5-1') : null);
export const excess = v => el('span', { class: v > 0 ? 'up' : v < 0 ? 'dn' : null }, v == null ? '—' : fmtPct(v));

// Columns for compact filing rows; `who` adds the insider column, `stock` the ticker column.
export function filingColumns({ who = true, stock = false, linked = new Set() } = {}) {
  return [
    { key: 'f', label: t('col.filed'), fmt: v => el('span', { class: 'nowrap' }, v) },
    { key: 'd', label: t('col.date'), fmt: v => el('span', { class: 'nowrap' }, v) },
    ...(who ? [{ key: 'nm', label: t('ins.col.insider'), fmt: (v, r) => [insiderLink(r.c, v, r.pg), ' ', rolePill(r.role)] }] : []),
    ...(stock ? [{ key: 't', label: t('col.stock'), fmt: v => (v && linked.has(v) ? stockLink(v) : el('span', { class: 'mono' }, v || '—')) }] : []),
    { key: 'k', label: t('col.change'), fmt: (v, r) => codePill(v, r.plan) },
    { key: 'sh', label: t('col.shares'), num: true, fmt: fmtNum },
    { key: 'px', label: t('ins.col.price'), num: true, fmt: v => (v == null ? '—' : `$${v.toFixed(2)}`) },
    { key: 'v', label: t('ins.col.value'), num: true, fmt: fmtMoney },
    { key: 'r3', label: t('ins.col.r3'), num: true, fmt: excess },
    { key: 'r12', label: t('ins.col.r12'), num: true, fmt: excess },
  ];
}

// Event study: x = trading days relative to day 0; the first series gets a confidence band.
export function eventChart(node, days, series, { band = true } = {}) {
  const out = [];
  series.forEach(([ev, name, color], i) => out.push(...bandSeries(name, days, ev, color, band && i === 0)));
  return mount(node, {
    tooltip: { trigger: 'axis', valueFormatter: v => (v == null ? '—' : fmtPct(v)) },
    legend: { top: 0, data: series.map(s => s[1]) },
    grid: { left: 52, right: 16, top: 44, bottom: 40 },
    xAxis: { type: 'category', data: days, name: t('ins.ev.x'), nameLocation: 'middle', nameGap: 26,
             axisLabel: { interval: i => days[i] % 50 === 0 || days[i] === -20 } },
    yAxis: { type: 'value', axisLabel: { formatter: v => fmtPct(v, 1) } },
    series: [...out, { type: 'line', data: [], markLine: { silent: true, symbol: 'none', lineStyle: { color: '#c8b48a', type: 'dashed' },
                                                         label: { show: false }, data: [{ xAxis: days.indexOf(0) }] } }],
  });
}

const RET = ['r1', 'r3', 'r6', 'r12'];
function clusterCard(c) {
  return el('div', { class: 'card cl-card' },
    el('div', { class: 'cl-head' },
      c.linked ? stockLink(c.t) : el('span', { class: 'mono' }, c.t || '—'),
      el('span', { class: 'cl-nm' }, c.n),
      c.cap ? el('span', { class: 'tag-pill' }, t(`ins.cap.${c.cap}`)) : null),
    el('div', { class: 'cl-big' }, el('b', {}, t('ins.cl.k', { k: c.k })), el('b', {}, fmtMoney(c.v)), el('span', { class: 'muted mono' }, c.d)),
    el('ul', { class: 'cl-mem' }, c.m.slice(0, 4).map(m => el('li', {}, insiderLink(m.c, m.nm, m.pg), ' ', rolePill(m.role), el('span', { class: 'mono muted' }, fmtMoney(m.v)))),
      c.m.length > 4 ? el('li', { class: 'muted' }, t('ins.cl.more', { n: c.m.length - 4 })) : null),
    el('div', { class: 'ret-chips' }, RET.map(k => el('div', {}, el('span', {}, t(`ins.h.${k}`)), excess(c[k])))));
}

function clusterFeed(clusters) {
  const wrap = el('div');
  let cap = 'all', limit = 24;
  const tabs = el('div', { class: 'tabs' });
  const draw = () => {
    const rows = filterClusters(clusters, { cap });
    tabs.replaceChildren(...['all', 'small', 'mid', 'large'].map(k => el('button', { type: 'button', class: k === cap ? 'on' : null,
      onclick: () => { cap = k; limit = 24; draw(); } }, k === 'all' ? t('ins.cap.all') : t(`ins.cap.${k}`))));
    wrap.replaceChildren(tabs, rows.length ? el('div', { class: 'cl-grid' }, rows.slice(0, limit).map(clusterCard)) : el('div', { class: 'empty' }, t('empty')),
      rows.length > limit ? el('div', { style: { textAlign: 'center', marginTop: '14px' } },
        el('button', { type: 'button', class: 'btn', onclick: () => { limit += 48; draw(); } }, t('ins.more', { n: rows.length - limit }))) : null);
  };
  draw();
  return wrap;
}

export async function render(app, _p, { meta }) {
  const d = await loadJSON('data/insiders/index.json');
  const linked = new Set(meta.stocks.map(s => s.t));
  const st = d.stats, ev = d.event, rule = d.rule;
  const evEl = chartDiv('tall'), grpEl = chartDiv('tall'), monEl = chartDiv('tall');
  const tabs = el('div', { class: 'tabs' });
  const hz = d.horizons;
  app.append(
    el('section', { class: 'hero' }, el('div', { class: 'hero-inner' },
      el('h1', {}, t('ins.h1')),
      el('p', { class: 'lede' }, t('ins.lede', { from: st.first_filing?.slice(0, 4), n: fmtNum(st.filings) })),
      el('div', { class: 'hero-stats' },
        el('div', {}, el('b', {}, fmtNum(st.buys)), el('span', {}, t('ins.stat.buys'))),
        el('div', {}, el('b', {}, fmtNum(st.sells)), el('span', {}, t('ins.stat.sells'))),
        el('div', {}, el('b', {}, fmtNum(st.clusters)), el('span', {}, t('ins.stat.clusters'))),
        el('div', {}, el('b', {}, fmtPct(st.plan_sell_share, 0)), el('span', {}, t('ins.stat.plan'))),
        el('div', {}, el('b', {}, st.latest_filing), el('span', {}, t('ins.stat.latest')))),
      el('p', { class: 'note' }, t('ins.note', { w: rule.window, k: rule.insiders, v: fmtMoney(rule.value) })))),
    el('div', { class: 'grid g4' }, RET.map(k => el('div', { class: 'card kpi' },
      el('div', { class: 'label' }, t('ins.kpi', { h: t(`ins.h.${k}`) })),
      el('div', { class: `val ${hz[k].mean > 0 ? 'up' : hz[k].mean < 0 ? 'dn' : ''}` }, fmtPct(hz[k].mean)),
      el('div', { class: 'note', style: { marginTop: '2px' } }, t('ins.kpi.sub', { hit: fmtPct(hz[k].hit, 0), n: fmtNum(hz[k].n) }))))),
    el('div', { class: 'grid g2 mt' },
      card(t('ins.event'), t('ins.event.sub'), evEl),
      card(t('ins.grp'), t('ins.grp.sub'), tabs, grpEl)),
    el('h2', { class: 'section-title' }, t('ins.feed')),
    el('p', { class: 'section-note' }, t('ins.feed.sub')),
    clusterFeed(d.clusters),
    el('div', { class: 'grid g2 mt' },
      card(t('ins.monthly'), t('ins.monthly.sub'), monEl),
      card(t('ins.big'), t('ins.big.sub'), table([
        { key: 'f', label: t('col.filed'), fmt: v => el('span', { class: 'nowrap' }, v) },
        { key: 't', label: t('col.stock'), fmt: (v, r) => (r.linked ? stockLink(v) : el('span', { class: 'mono', title: r.n }, v || '—')) },
        { key: 'nm', label: t('ins.col.insider'), fmt: (v, r) => [insiderLink(r.c, v, r.pg), ' ', rolePill(r.role)] },
        { key: 'v', label: t('ins.col.value'), num: true, fmt: fmtMoney },
      ], fromRows(d.big_keys, d.big), { limit: 10 }))),
    el('h2', { class: 'section-title' }, t('ins.top')),
    card(null, t('ins.top.sub'), table([
      { key: 'nm', label: t('ins.col.insider'), fmt: (v, r) => [insiderLink(r.c, v), ' ', rolePill(r.role)] },
      { key: 't', label: t('ins.col.company'), fmt: (v, r) => (linked.has(v) ? stockLink(v) : el('span', { class: 'mono', title: r.co }, v || '—')) },
      { key: 'buys', label: t('col.buys'), num: true },
      { key: 'vb', label: t('ins.col.vb'), num: true, fmt: fmtMoney },
      { key: 'hit3', label: t('ins.col.hit3'), num: true, fmt: (v, r) => `${fmtPct(v, 0)} (${r.n3})` },
      { key: 'hit6', label: t('ins.col.hit6'), num: true, fmt: v => fmtPct(v, 0) },
      { key: 'hit12', label: t('ins.col.hit12'), num: true, fmt: v => fmtPct(v, 0) },
      { key: 'sells', label: t('col.sells'), num: true },
      { key: 'last', label: t('col.last') },
    ], d.top, { sortKey: 'hit3', limit: 50 })));

  eventChart(evEl, ev.days, [[ev.cluster, `${t('ins.ev.cluster')} · n=${fmtNum(ev.cluster.n)}`, '#4f6b3a'],
    [ev.buy, `${t('ins.ev.buy')} · n=${fmtNum(ev.buy.n)}`, PALETTE[1]], [ev.sell, `${t('ins.ev.sell')} · n=${fmtNum(ev.sell.n)}`, '#9c3b2e'],
    [ev.sell_plan, `${t('ins.ev.plan')} · n=${fmtNum(ev.sell_plan.n)}`, '#b8aa90']]);
  const groups = {
    cap: [['cap_small', PALETTE[0]], ['cap_mid', PALETTE[1]], ['cap_large', PALETTE[3]]].map(([k, c]) => [ev[k], `${t(`ins.cap.${k.slice(4)}`)} · n=${fmtNum(ev[k].n)}`, c]),
    role: ['ceo_cfo', 'officer', 'director', 'owner10'].map(r => [ev[`role_${r}`], `${t(`ins.role.${r}`)} · n=${fmtNum(ev[`role_${r}`].n)}`, ROLE_COLOR[r]]),
  };
  let node = grpEl, grp = 'cap';
  const drawGrp = () => {
    tabs.replaceChildren(...['cap', 'role'].map(k => el('button', { type: 'button', class: k === grp ? 'on' : null, onclick: () => { grp = k; drawGrp(); } }, t(`ins.grp.${k}`))));
    const fresh = chartDiv('tall');   // a new node per tab; the old chart is disposed with the page
    node.replaceWith(fresh);
    node = fresh;
    eventChart(node, ev.days, groups[grp]);
  };
  drawGrp();
  mount(monEl, {
    tooltip: { trigger: 'axis' }, legend: { bottom: 0 }, grid: { left: 52, right: 44, top: 16, bottom: 64 },
    xAxis: { type: 'category', data: d.monthly.months, axisLabel: { interval: 11 } },
    yAxis: [{ type: 'value' }, { type: 'value', splitLine: { show: false } }],
    series: [{ name: t('ins.buy'), type: 'bar', stack: 'k', data: d.monthly.buy, itemStyle: { color: '#4f6b3a' } },
             { name: t('ins.m.sell'), type: 'bar', stack: 'k', data: d.monthly.sell, itemStyle: { color: '#9c3b2e' } },
             { name: t('ins.m.plan'), type: 'bar', stack: 'k', data: d.monthly.plan, itemStyle: { color: '#b8aa90' } },
             { name: t('ins.stat.clusters'), type: 'line', yAxisIndex: 1, data: d.monthly.clusters, symbol: 'none', lineStyle: { color: '#2b2118', width: 2 }, itemStyle: { color: '#2b2118' } }],
  });
}
