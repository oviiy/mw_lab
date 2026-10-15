import { loadJSON, el, card, chartDiv, kpi, kindBadge, managerLink, table } from './core.js';
import { mount } from './charts.js';
import { fmtMoney, fmtPct, fmtNum, quarterLabel, sankeyFromFlows, fromRows, titleCase } from './calc.js';
import { t, term } from './i18n.js';
import { tradeColumns } from './page-congress.js';
import { filingColumns } from './page-insiders.js';

const last = a => [...a].reverse().find(v => v != null) ?? null;
const twoYearsAgo = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 2); return d.toISOString().slice(0, 10); };

const FYE = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const num = (v, f) => (v == null || !Number.isFinite(v) ? null : f(v));
const ratio = v => num(v, x => `${x.toFixed(1)}×`);
const pctv = v => num(v, x => fmtPct(x));

// Intro composed from facts (industry, place, headcount, registration) — no licensed descriptions are reproduced.
function profileCard(s) {
  const p = s.profile || {};
  const place = [p.city || p.sec_city, p.state || p.sec_state, p.country && p.country !== 'United States' ? p.country : null].filter(Boolean).join(', ');
  const industry = p.industry || p.sic_desc;
  const facts = {
    name: p.longName || s.n, industry: industry || term(s.s), place,
    emp: p.fullTimeEmployees ? fmtNum(p.fullTimeEmployees) : null,
    inc: p.inc, fye: p.fye ? FYE[Number(p.fye.slice(0, 2))] : null, ex: (p.exchanges || [])[0],
  };
  const intro = [t('co.intro', facts), facts.emp ? t('co.emp', facts) : null, facts.inc ? t('co.inc', facts) : null, facts.fye ? t('co.fye', facts) : null]
    .filter(Boolean).join(' ');
  const fin = [
    ['co.mcap', num(p.marketCap, fmtMoney)], ['co.rev', num(p.totalRevenue, fmtMoney)], ['co.revg', pctv(p.revenueGrowth)],
    ['co.gm', pctv(p.grossMargins)], ['co.nm', pctv(p.profitMargins)], ['co.roe', pctv(p.returnOnEquity)],
    ['co.pe', ratio(p.trailingPE)], ['co.fpe', ratio(p.forwardPE)], ['co.dy', num(p.dividendYield, x => `${x.toFixed(2)}%`)],
    ['co.fcf', num(p.freeCashflow, fmtMoney)], ['co.beta', num(p.beta, x => x.toFixed(2))], ['co.52w', pctv(p['52WeekChange'])],
  ].filter(([, v]) => v != null);
  const links = [
    p.yahoo ? ['Yahoo Finance', p.yahoo] : null,
    p.website ? [t('co.site'), p.website] : null,
    p.cik ? [t('co.sec'), `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${p.cik}&type=10-K`] : null,
  ].filter(Boolean);
  return el('section', { class: 'card co mt' },
    el('div', { class: 'co-main' },
      el('h3', {}, t('co.title')),
      el('p', { class: 'co-intro' }, intro),
      links.length ? el('div', { class: 'co-links' }, links.map(([l, u]) => el('a', { class: 'btn', href: u, target: '_blank', rel: 'noopener' }, `${l} ↗`))) : null),
    fin.length ? el('dl', { class: 'co-fin' }, fin.map(([k, v]) => el('div', {}, el('dt', {}, t(k)), el('dd', {}, v)))) : el('div', { class: 'empty' }, t('co.nofin')));
}
// weekly close on or before a date (price series is weekly)
// index of the weekly bar on or before a date; -1 before the price history starts (such markers are dropped)
const weekIdx = (price, d) => { let k = -1; for (let i = 0; i < price.dates.length && price.dates[i] <= d; i++) k = i; return k; };
// one marker per week and side: buys sit above the line, sells below
function weekly(price, rows, side, val = () => 1) {
  const m = new Map();
  for (const r of rows) {
    const i = weekIdx(price, r.d);
    if (i < 0) continue;
    if (!m.has(i)) m.set(i, { i, n: 0, v: 0, rows: [] });
    const g = m.get(i); g.n++; g.v += val(r) || 0; g.rows.push(r);
  }
  return [...m.values()].map(g => ({ value: [price.dates[g.i], price.close[g.i]], g, symbolOffset: [0, side === 'buy' ? -11 : 11] }));
}

// CON is a reserved device name on Windows, so its published JSON uses CON_.json.
const tickerFile = ticker => encodeURIComponent(ticker.toUpperCase() === 'CON' ? 'CON_' : ticker);

export async function render(app, { t: tk }) {
  let s;
  try { s = await loadJSON(`data/stocks/${tickerFile(tk)}.json`); }
  catch { throw new Error(t('stk.notfound', { t: tk })); }
  const P = s.holders.periods.map(quarterLabel);
  const priceEl = chartDiv(), holdEl = chartDiv(), flowEl = chartDiv(), crowdEl = chartDiv('short');
  const sk = sankeyFromFlows(s.flows.items, s.t);
  let cg = null;
  try { cg = await loadJSON(`data/congress/tickers/${tickerFile(s.t)}.json`); } catch { cg = null; }
  let ins = null;
  try { ins = await loadJSON(`data/insiders/tickers/${tickerFile(s.t)}.json`); } catch { ins = null; }
  const insRows = ins ? fromRows(ins.keys, ins.rows) : [];
  app.append(
    el('div', { class: 'card' },
      el('div', { class: 'shead' },
        el('h1', {}, s.t),
        el('span', { class: 'nm' }, titleCase(s.n)),
        el('span', { class: 'tag-pill' }, term(s.s)), s.is_etf ? el('span', { class: 'tag-pill' }, 'ETF') : null,
        el('span', { class: 'muted mono', style: { fontSize: '12px' } }, `CUSIP ${s.cusip}`)),
      s.price.dates.length ? priceEl : el('div', { class: 'empty' }, t('stk.noprice'))),
    profileCard(s),
    el('div', { class: 'grid g4 mt' },
      kpi(t('stk.kpi.holders'), fmtNum(last(s.holders.count))), kpi(t('stk.kpi.pct'), fmtPct(last(s.holders.pct))),
      kpi(t('stk.kpi.value'), fmtMoney(last(s.holders.value))), kpi(t('stk.kpi.crowd'), s.crowding.score == null ? '—' : String(s.crowding.score))),
    el('div', { class: 'grid g2 mt' },
      card(t('stk.holders'), t('stk.holders.sub'), holdEl),
      card(t('stk.flow', { q: quarterLabel(s.flows.period) }), t('stk.flow.sub'),
        sk.links.length ? flowEl : el('div', { class: 'empty' }, t('stk.flow.none')))),
    el('div', { class: 'grid g3 mt' },
      el('div', { style: { gridColumn: '1 / -1' } }, card(t('stk.crowdh'), t('stk.crowdh.sub'), crowdEl))),
    insRows.length ? [el('h2', { class: 'section-title' }, t('stk.ins')),
      card(null, [t('stk.ins.sub', { t: s.t, b: fmtNum(ins.buys), s: fmtNum(ins.sells), p: fmtNum(ins.plan_sells) }),
        ins.clusters.length ? [' ', el('b', {}, t('stk.ins.cl', { n: ins.clusters.length, d: ins.clusters[0].d }))] : null],
        table(filingColumns({ who: true }), insRows, { limit: 30 }))] : null,
    cg && cg.trades.length ? [el('h2', { class: 'section-title' }, t('stk.cg')),
      card(null, t('stk.cg.sub', { t: s.t }), table(tradeColumns(new Set()), cg.trades, { limit: 40 }))] : null,
    el('h2', { class: 'section-title' }, t('stk.cur')),
    card(null, t('stk.cur.sub', { q: quarterLabel(s.flows.period), t: s.t }), table([
      { key: 'name', label: t('col.manager'), fmt: (v, r) => managerLink(r.cik, v) },
      { key: 'sh', label: t('col.shares'), num: true, fmt: fmtNum },
      { key: 'w', label: t('col.wport'), num: true, fmt: v => fmtPct(v) },
      { key: 'k', label: t('col.kind'), fmt: v => kindBadge(v) },
      { key: 'first', label: t('col.first'), fmt: v => quarterLabel(v) },
    ], s.curated, { sortKey: 'w' })));

  if (s.price.dates.length) mount(priceEl, {
    grid: { left: 56, right: 16, top: cg || insRows.length ? 36 : 12, bottom: 56 }, tooltip: { trigger: 'axis', valueFormatter: v => (v == null ? '—' : `$${v.toFixed(2)}`) },
    xAxis: { type: 'time' }, yAxis: { type: 'value', scale: true, axisLabel: { formatter: v => `$${v}` } },
    dataZoom: [{ type: 'inside', startValue: twoYearsAgo() }, { type: 'slider', startValue: twoYearsAgo(), height: 18, bottom: 6, borderColor: '#dccba6', fillerColor: 'rgba(168,131,58,.18)', textStyle: { fontSize: 11 } }],
    legend: cg || insRows.length ? { top: 0, right: 0, data: [...(insRows.length ? [t('stk.ins.buy'), t('stk.ins.sell')] : []), ...(cg ? [t('stk.cg.buy'), t('stk.cg.sell')] : [])] } : undefined,
    series: [{ type: 'line', symbol: 'none', lineStyle: { color: '#7a2e1f', width: 2 }, areaStyle: { color: 'rgba(122,46,31,.07)' },
               data: s.price.dates.map((d, i) => [d, s.price.close[i]]) },
             ...(cg ? ['buy', 'sell'].map(k => ({
               name: t(k === 'buy' ? 'stk.cg.buy' : 'stk.cg.sell'), type: 'scatter', symbol: 'triangle', symbolRotate: k === 'buy' ? 0 : 180, z: 4,
               itemStyle: { color: k === 'buy' ? '#4f6b3a' : '#9c3b2e' },
               tooltip: { trigger: 'item', formatter: p => { const g = p.data.g; return `<b>${t(`cg.kind.${k}`)} · ${g.n}</b><br/>${[...new Set(g.rows.map(r => r.mn))].slice(0, 6).join('<br/>')}`; } },
               data: weekly(s.price, cg.trades.filter(r => r.k === k), k).map(x => ({ ...x, symbolSize: 7 + 3 * Math.min(x.g.n, 4) })),
             })) : []),
             // insider open-market trades: circles sized by value, at the trade date; 10b5-1 sales drawn hollow
             ...['P', 'S'].map(k => {
               const maxV = Math.max(1, ...insRows.map(r => r.v || 0));
               return {
                 name: t(k === 'P' ? 'stk.ins.buy' : 'stk.ins.sell'), type: 'scatter', symbol: 'circle', z: 3,
                 itemStyle: { color: k === 'P' ? 'rgba(79,107,58,.75)' : 'rgba(156,59,46,.55)', borderColor: k === 'P' ? '#4f6b3a' : '#9c3b2e', borderWidth: 1 },
                 tooltip: { trigger: 'item', formatter: p => { const g = p.data.g; return `<b>${t(k === 'P' ? 'ins.buy' : 'ins.sell')} · ${g.n}</b> · ${fmtMoney(g.v)}<br/>${[...new Set(g.rows.map(r => r.nm))].slice(0, 6).join('<br/>')}`; } },
                 data: weekly(s.price, insRows.filter(r => r.k === k), k === 'P' ? 'buy' : 'sell', r => r.v).map(x => ({ ...x, symbolSize: 6 + 14 * Math.sqrt(x.g.v / Math.max(maxV, 1)),
                   itemStyle: x.g.rows.every(r => r.plan) ? { color: 'rgba(156,59,46,0)' } : undefined })),
               };
             })],
  });
  mount(holdEl, {
    tooltip: { trigger: 'axis' }, legend: { bottom: 0 }, grid: { left: 56, right: 56, top: 16, bottom: 48 },
    xAxis: { type: 'category', data: P },
    yAxis: [{ type: 'value', name: t('stk.axis.count') }, { type: 'value', name: t('stk.axis.pct'), axisLabel: { formatter: v => fmtPct(v, 0) }, splitLine: { show: false } }],
    series: [
      { name: t('stk.kpi.holders'), type: 'bar', data: s.holders.count, itemStyle: { color: '#e3d2ac' }, tooltip: { valueFormatter: fmtNum } },
      { name: t('stk.kpi.pct'), type: 'line', yAxisIndex: 1, connectNulls: true, data: s.holders.pct, itemStyle: { color: '#7a2e1f' }, tooltip: { valueFormatter: v => fmtPct(v) } },
    ],
  });
  if (sk.links.length) mount(flowEl, {
    tooltip: { trigger: 'item', formatter: p => (p.dataType === 'edge' ? `${p.data.source} → ${p.data.target}<br/>${fmtMoney(p.data.value)}` : `${p.name}<br/>${fmtMoney(p.value)}`) },
    series: [{ type: 'sankey', data: sk.nodes, links: sk.links, nodeAlign: 'justify', emphasis: { focus: 'adjacency' },
               lineStyle: { color: 'gradient', opacity: 0.35 }, left: 8, right: 100 }],
  });

  mount(crowdEl, {
    grid: { left: 40, right: 16, top: 12, bottom: 28 }, tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: P }, yAxis: { type: 'value', min: 0, max: 100 },
    series: [{ type: 'line', data: s.crowding.history, smooth: true, itemStyle: { color: '#a8833a' }, areaStyle: { color: 'rgba(168,131,58,.16)' } }],
  });
}
