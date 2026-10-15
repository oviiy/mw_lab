import { loadJSON, el, card, chartDiv, stockLink, table } from './core.js';
import { mount, bandSeries } from './charts.js';
import { fmtMoney, fmtPct, fmtNum } from './calc.js';
import { t, partyLabel, PARTY_COLOR } from './i18n.js';

export const memberLink = (id, name) => el('a', { href: `#/member/${encodeURIComponent(id)}` }, name);
export const partyPill = p => el('span', { class: `party party-${p || 'none'}` }, partyLabel(p));
export const kindPill = k => el('span', { class: `kind kind-${k === 'buy' ? 'new' : k === 'sell' ? 'exit' : 'hold'}` }, t(`cg.kind.${k}`));
export const amountRange = (lo, hi) => (lo == null ? '—' : lo === hi ? fmtMoney(lo) : `${fmtMoney(lo)}–${fmtMoney(hi)}`);
const excess = v => el('span', { class: v > 0 ? 'up' : v < 0 ? 'dn' : null }, v == null ? '—' : fmtPct(v));

export function tradeColumns(linked, { member = true } = {}) {
  return [
    { key: 'f', label: t('col.filed'), fmt: v => el('span', { class: 'nowrap' }, v) },
    { key: 'd', label: t('col.date'), fmt: v => el('span', { class: 'nowrap' }, v) },
    ...(member ? [{ key: 'mn', label: t('col.member'), fmt: (v, r) => [memberLink(r.m, v), ' ', partyPill(r.p)] }] : []),
    { key: 't', label: t('col.stock'), fmt: (v, r) => (v && linked.has(v) ? stockLink(v) : el('span', { class: 'mono' }, v || '—')) },
    { key: 'a', label: t('col.asset'), fmt: (v, r) => (r.at === 'OP' ? `${v} · ${r.desc || 'option'}` : v) },
    { key: 'k', label: t('col.change'), fmt: v => kindPill(v) },
    { key: 'hi', label: t('col.amount'), num: true, fmt: (v, r) => amountRange(r.lo, r.hi) },
    { key: 'o', label: t('col.owner'), fmt: v => t(`cg.owner.${v}`) },
    { key: 'lag', label: t('col.lag'), num: true },
    { key: 'r3', label: t('col.r3'), num: true, fmt: excess },
  ];
}

export function eventChart(node, ev, series) {
  const days = ev.days;
  const out = [];
  for (const [key, name, color] of series) out.push(...bandSeries(name, days, ev[key], color, key === series[0][0]));
  return mount(node, {
    tooltip: { trigger: 'axis', valueFormatter: v => (v == null ? '—' : fmtPct(v)) },
    legend: { top: 0, data: series.map(s => s[1]) },
    grid: { left: 52, right: 16, top: 44, bottom: 40 },
    xAxis: { type: 'category', data: days, name: t('cg.ev.x'), nameLocation: 'middle', nameGap: 26, axisLabel: { interval: 20 } },
    yAxis: { type: 'value', axisLabel: { formatter: v => fmtPct(v, 1) } },
    series: out,
  });
}

export async function render(app, _p, { meta }) {
  const cg = await loadJSON('data/congress/index.json');
  const linked = new Set(meta.stocks.map(s => s.t));
  const st = cg.stats;
  const evEl = chartDiv('tall'), monEl = chartDiv('tall'), actEl = chartDiv('tall'), tkEl = chartDiv('tall');
  app.append(
    el('section', { class: 'hero' }, el('div', { class: 'hero-inner' },
      el('h1', {}, t('cg.h1')),
      el('p', { class: 'lede' }, t('cg.lede', { n: fmtNum(st.filings - st.scanned), from: st.first_filing?.slice(0, 4), t: fmtNum(st.trades) })),
      el('div', { class: 'hero-stats' },
        el('div', {}, el('b', {}, fmtNum(st.trades)), el('span', {}, t('cg.stat.trades'))),
        el('div', {}, el('b', {}, fmtNum(st.members)), el('span', {}, t('cg.stat.members'))),
        el('div', {}, el('b', {}, t('cg.days', { n: st.median_lag })), el('span', {}, t('cg.stat.lag'))),
        el('div', {}, el('b', {}, st.latest_filing), el('span', {}, t('cg.stat.latest')))),
      el('p', { class: 'note' }, t('cg.scanned', { n: fmtNum(st.scanned) }), ' ', t('cg.note')))),
    el('div', { class: 'grid g2' },
      card(t('cg.event'), t('cg.event.sub'), evEl),
      card(t('cg.monthly'), t('cg.monthly.sub'), monEl)),
    el('div', { class: 'grid g2 mt' },
      card(t('cg.active'), t('cg.active.sub'), actEl),
      card(t('cg.tickers'), t('cg.tickers.sub'), tkEl)),
    el('h2', { class: 'section-title' }, t('cg.recent')),
    card(null, t('cg.recent.sub'), table(tradeColumns(linked), cg.recent, { limit: 60 })),
    el('h2', { class: 'section-title' }, t('cg.all')),
    card(null, t('cg.all.sub'), table([
      { key: 'name', label: t('col.member'), fmt: (v, r) => memberLink(r.id, v) },
      { key: 'party', label: t('col.party'), fmt: v => partyPill(v) },
      { key: 'chamber', label: t('col.chamber'), fmt: v => t(v === 'senate' ? 'mem.senate' : 'mem.house') },
      { key: 'state', label: t('col.state'), fmt: v => el('span', { class: 'mono' }, v) },
      { key: 'n', label: t('col.trades'), num: true },
      { key: 'buys', label: t('col.buys'), num: true },
      { key: 'sells', label: t('col.sells'), num: true },
      { key: 'est', label: t('col.est'), num: true, fmt: fmtMoney },
      { key: 'hit3', label: t('col.hit'), num: true, fmt: (v, r) => (v == null ? '—' : `${fmtPct(v, 0)} (${r.n_hit})`) },
      { key: 'last', label: t('col.last') },
    ], cg.members, { sortKey: 'n' })));

  eventChart(evEl, cg.event, [['buy', t('cg.ev.buy'), '#4f6b3a'], ['sell', t('cg.ev.sell'), '#9c3b2e'], ['buy_trade', t('cg.ev.buyt'), '#b8aa90']]);
  mount(monEl, {
    tooltip: { trigger: 'axis' }, legend: { bottom: 0 }, grid: { left: 44, right: 12, top: 16, bottom: 48 },
    xAxis: { type: 'category', data: cg.monthly.months, axisLabel: { interval: 5 } }, yAxis: { type: 'value' },
    series: [{ name: t('cg.kind.buy'), type: 'bar', stack: 'k', data: cg.monthly.buy, itemStyle: { color: '#4f6b3a' } },
             { name: t('cg.kind.sell'), type: 'bar', stack: 'k', data: cg.monthly.sell, itemStyle: { color: '#9c3b2e' } }],
  });
  const act = cg.members.slice(0, 15).reverse();
  mount(actEl, {
    tooltip: { trigger: 'item', formatter: p => { const m = act[p.dataIndex]; return `<b>${m.name}</b> ${partyLabel(m.party)} · ${m.state}<br/>${t('col.buys')} ${m.buys} · ${t('col.sells')} ${m.sells}<br/>${t('col.est')} ${fmtMoney(m.est)}`; } },
    grid: { left: 150, right: 40, top: 8, bottom: 24 },
    xAxis: { type: 'value' }, yAxis: { type: 'category', data: act.map(m => m.name), axisLabel: { fontSize: 12 } },
    series: [{ type: 'bar', data: act.map(m => ({ value: m.n, itemStyle: { color: PARTY_COLOR[m.party] || '#7e6a55', borderRadius: [0, 4, 4, 0] } })), label: { show: true, position: 'right' }, cursor: 'pointer' }],
  }).on('click', p => { location.hash = `#/member/${encodeURIComponent(act[p.dataIndex].id)}`; });
  const tk = cg.tickers.slice(0, 15).reverse();
  mount(tkEl, {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: ps => { const r = tk[ps[0].dataIndex]; return `<b>${r.t}</b> ${r.a}<br/>${t('col.members')} ${r.members} · ${t('col.buys')} ${r.buys} · ${t('col.sells')} ${r.sells}`; } },
    legend: { bottom: 0 }, grid: { left: 64, right: 24, top: 8, bottom: 48 },
    xAxis: { type: 'value' }, yAxis: { type: 'category', data: tk.map(r => r.t), axisLabel: { fontFamily: 'IBM Plex Mono', fontSize: 12 } },
    series: [{ name: t('cg.kind.buy'), type: 'bar', stack: 'k', data: tk.map(r => r.buys), itemStyle: { color: '#4f6b3a' }, cursor: 'pointer' },
             { name: t('cg.kind.sell'), type: 'bar', stack: 'k', data: tk.map(r => r.sells), itemStyle: { color: '#9c3b2e' }, cursor: 'pointer' }],
  }).on('click', p => { const r = tk[p.dataIndex]; if (r.linked) location.hash = `#/stock/${encodeURIComponent(r.t)}`; });
}
