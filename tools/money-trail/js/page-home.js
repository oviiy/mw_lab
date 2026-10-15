import { loadJSON, el, card, chartDiv } from './core.js';
import { mount } from './charts.js';
import { fmtMoney, fmtPct, fmtNum, quarterLabel, initials, avatarColor, titleCase } from './calc.js';
import { t, term, person } from './i18n.js';
import { memberLink, partyPill, kindPill, amountRange } from './page-congress.js';
import { renderFlowHero } from './flow-chart.js';

const go = tk => { location.hash = `#/stock/${encodeURIComponent(tk)}`; };

function crowdBubble(rows) {
  const maxV = Math.max(1, ...rows.map(r => r.value || 0));
  return {
    grid: { left: 64, right: 28, top: 24, bottom: 48 },
    xAxis: { type: 'value', name: t('home.axis.holders'), nameLocation: 'middle', nameGap: 30, scale: true },
    yAxis: { type: 'value', name: t('home.axis.tracked'), nameLocation: 'middle', nameGap: 36, minInterval: 1, scale: true },
    tooltip: { trigger: 'item', formatter: p => { const d = p.data; return `<b>${d.t}</b> ${titleCase(d.n)}<br/>${t('home.tt.bubble2', { h: fmtNum(d.value[0]), m: d.value[1], v: fmtMoney(d.v) })}`; } },
    series: [{
      type: 'scatter',
      data: rows.map(r => ({ value: [r.holders, r.curated ?? 0], t: r.t, n: r.n, v: r.value, symbolSize: 10 + 40 * Math.sqrt((r.value || 0) / maxV) })),
      itemStyle: { color: 'rgba(43,33,24,.18)', borderColor: '#4a3b2c' },
      label: { show: true, formatter: p => p.data.t, position: 'top', fontSize: 12, color: '#4a3b2c' },
      labelLayout: { hideOverlap: true },
      cursor: 'pointer',
    }],
  };
}

// Net dollars by sector as a diverging bar (sold on the left, bought on the right) instead of a sankey.
function sectorBars(flows) {
  const keys = [...new Set([...Object.keys(flows.buys), ...Object.keys(flows.sells)])];
  const rows = keys.map(k => ({ k, net: (flows.buys[k] || 0) - (flows.sells[k] || 0), b: flows.buys[k] || 0, s: flows.sells[k] || 0 }))
    .filter(r => r.b || r.s).sort((a, b) => a.net - b.net);
  return {
    grid: { left: 140, right: 70, top: 10, bottom: 28 },
    xAxis: { type: 'value', axisLabel: { formatter: v => fmtMoney(v) } },
    yAxis: { type: 'category', data: rows.map(r => term(r.k)), axisTick: { show: false } },
    tooltip: { trigger: 'item', formatter: p => { const r = rows[p.dataIndex]; return `<b>${term(r.k)}</b><br/>${t('flow.m.buy')} ${fmtMoney(r.b)} · ${t('flow.m.sell')} ${fmtMoney(r.s)}<br/>${t('flow.m.net')} ${fmtMoney(r.net)}`; } },
    series: [{ type: 'bar', barMaxWidth: 18, data: rows.map(r => ({ value: r.net, itemStyle: { color: r.net >= 0 ? '#4f6b3a' : '#9c3b2e', borderRadius: r.net >= 0 ? [0, 3, 3, 0] : [3, 0, 0, 3] } })),
               label: { show: true, position: 'right', formatter: p => fmtMoney(p.value), fontSize: 12, color: '#4a3b2c' },
               labelLayout: p => (p.rect.width < 0 ? { x: p.rect.x - 4, align: 'right' } : {}) }],
  };
}


function hero(meta, players) {
  const S = players && players.strategies;
  const pts = k => (S && S.stats[`${k}.63`] ? Math.round((S.stats[`${k}.63`].cagr - S.bench_stats.SPY.cagr) * 1000) / 10 : null);
  const stat = (k, label) => { const v = pts(k); return el('div', {}, el('b', { class: v == null ? null : v >= 0 ? 'up' : 'dn' }, v == null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(1)}`), el('span', {}, t(label))); };
  const nCongress = players ? players.players.filter(p => p.g === 'congress').length : 0;
  return el('section', { class: 'hero' },
    el('div', { class: 'hero-inner' },
      el('h1', {}, t('home.h1')),
      el('p', { class: 'lede' }, t('home.lede', { n: meta.managers.length, c: fmtNum(nCongress) })),
      S ? [el('div', { class: 'hero-stats' }, stat('smart.all', 'home.st.smart'), stat('fund.0', 'home.st.fund'), stat('congress.0', 'home.st.cg'), stat('insider.0', 'home.st.ins')),
           el('p', { class: 'hero-note' }, t('home.st.note')),
           el('a', { class: 'hero-cta', href: '#/players' }, t('home.cta'))] : null));
}

async function congressCard(meta) {
  let cg;
  try { cg = await loadJSON('data/congress/index.json'); } catch { return null; }
  const linked = new Set(meta.stocks.map(s => s.t));
  const rows = cg.recent.filter(r => r.t).slice(0, 10);
  return [el('h2', { class: 'section-title' }, t('home.cg')),
    card(null, [t('home.cg.sub'), ' · ', el('a', { href: '#/congress' }, t('home.cg.all'))],
      el('div', { class: 'tbl-wrap' }, el('table', { class: 'tbl' }, el('tbody', {}, rows.map(r => el('tr', {},
        el('td', { class: 'mono muted' }, r.f),
        el('td', { class: 'nowrap' }, memberLink(r.m, r.mn), ' ', partyPill(r.p)),
        el('td', { class: 'nowrap' }, kindPill(r.k)),
        el('td', {}, linked.has(r.t) ? el('a', { href: `#/stock/${encodeURIComponent(r.t)}`, class: 'mono' }, r.t) : el('span', { class: 'mono' }, r.t)),
        el('td', { class: 'num nowrap' }, amountRange(r.lo, r.hi))))))))];
}

async function insidersCard() {
  let d;
  try { d = await loadJSON('data/insiders/index.json'); } catch { return null; }
  const rows = d.clusters.slice(0, 10);
  return [el('h2', { class: 'section-title' }, t('home.ins')),
    card(null, [t('home.ins.sub', { k: d.rule.insiders, w: d.rule.window }), ' · ', el('a', { href: '#/insiders' }, t('home.cg.all'))],
      el('div', { class: 'tbl-wrap' }, el('table', { class: 'tbl' }, el('tbody', {}, rows.map(c => el('tr', {},
        el('td', { class: 'mono muted' }, c.d),
        el('td', {}, c.linked ? el('a', { href: `#/stock/${encodeURIComponent(c.t)}`, class: 'mono' }, c.t) : el('span', { class: 'mono' }, c.t || '—')),
        el('td', { class: 'muted ellip' }, c.n),
        el('td', { class: 'nowrap' }, t('ins.cl.k', { k: c.k })),
        el('td', { class: 'num nowrap' }, fmtMoney(c.v))))))))];
}

function managerGrid(managers) {
  return el('div', { class: 'mgr-grid' }, managers.map(m =>
    el('a', { class: 'card mgr-card', href: `#/manager/${m.cik}` },
      el('div', { class: 'avatar sm', style: { background: avatarColor(m.name) } }, initials(m.person)),
      el('div', { style: { minWidth: 0 } },
        el('div', { class: 'nm' }, m.name),
        el('div', { class: 'ps' }, `${person(m.person)} · ${fmtMoney(m.value)} · ${t('home.holdings', { n: fmtNum(m.n) })}`),
        el('div', { class: 'tags', style: { marginTop: '4px' } }, m.style.map(s => el('span', { class: 'tag-pill' }, term(s))))))));
}

export async function render(app, _params, { meta }) {
  const home = await loadJSON('data/home.json');
  let players = null;
  try { players = await loadJSON('data/players.json'); } catch { players = null; }
  const q = quarterLabel(home.period);
  const crowdEl = chartDiv('tall'), flowEl = chartDiv('tall');
  const flowHero = await renderFlowHero(meta);
  app.append(
    hero(meta, players),
    el('h2', { class: 'section-title', style: { marginTop: '8px' } }, t('home.h2', { q })),
    el('p', { class: 'section-note' }, t('home.note', { n: meta.managers.length })),
    flowHero ? flowHero.box : null,
    el('div', { class: 'grid g2 home-feeds' }, ...[await congressCard(meta), await insidersCard()].map(x => (x ? el('div', {}, ...x) : null))),
    el('div', { class: 'grid g2 mt' },
      card(t('home.crowd'), t('home.crowd.sub'), crowdEl),
      card(t('home.flow'), t('home.flow.sub'), flowEl)),
    el('h2', { class: 'section-title' }, t('home.managers')),
    managerGrid(meta.managers));
  if (flowHero) flowHero.start();
  mount(crowdEl, crowdBubble(home.crowded)).on('click', p => go(p.data.t));
  mount(flowEl, sectorBars(home.sector_flows));
}
