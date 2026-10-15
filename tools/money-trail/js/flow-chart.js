// Headline chart: where tracked managers moved money in a quarter. Switch metric and quarter, expand/collapse,
// click a bar to trace it (who drove it, and the stock's flow history across quarters).
import { loadJSON, el } from './core.js';
import { mount } from './charts.js';
import { fmtMoney, quarterLabel, kindLabel, KIND_COLOR, aggregateFlows as aggregate, rankFlows as rank } from './calc.js';
import { t, term } from './i18n.js';

const BUY = '#4f6b3a', SELL = '#9c3b2e';
const METRICS = ['net', 'buy', 'sell', 'mgrs'];

const valueOf = (a, metric) => (metric === 'sell' ? -a.sell : a[metric]);
const fmtMetric = (v, metric) => (metric === 'mgrs' ? `${v > 0 ? '+' : ''}${v}` : fmtMoney(v));

export async function renderFlowHero(meta) {
  let flows;
  try { flows = await loadJSON('data/flows.json'); } catch { return null; }
  const P = flows.periods;
  const state = { pi: P.length - 1, metric: 'net', expanded: false, key: null };
  const chartEl = el('div', { class: 'chart flow-chart' });
  const detail = el('div', { class: 'flow-detail', hidden: true });
  const metricTabs = el('div', { class: 'tabs' });
  const qSel = el('select', { class: 'sort-select', 'aria-label': t('flow.quarter') },
    P.map((p, i) => el('option', { value: i }, quarterLabel(p))).slice(1));
  const toggle = el('button', { class: 'btn' });
  const sub = el('div', { class: 'sub' });
  let chart = null, ranked = [];

  const draw = () => {
    metricTabs.replaceChildren(...METRICS.map(m => el('button', { class: state.metric === m ? 'on' : null, onclick: () => { state.metric = m; draw(); } }, t(`flow.m.${m}`))));
    qSel.value = String(state.pi);
    toggle.textContent = state.expanded ? t('flow.fold') : t('flow.expand');
    sub.textContent = t(`flow.sub.${state.metric}`, { q: quarterLabel(P[state.pi]) });
    ranked = rank(aggregate(flows.rows, state.pi), state.metric, state.expanded ? 40 : 16);
    const data = [...ranked].reverse();
    chartEl.style.height = `${Math.max(360, data.length * (state.expanded ? 24 : 30) + 70)}px`;
    if (chart) chart.dispose();
    chart = mount(chartEl, {
      grid: { left: 80, right: 90, top: 8, bottom: 28 },
      xAxis: { type: 'value', min: v => (v.min < 0 ? v.min * 1.08 : 0), max: v => (v.max > 0 ? v.max * 1.12 : 0), axisLabel: { formatter: v => fmtMetric(v, state.metric) } },
      yAxis: { type: 'category', data: data.map(a => a.key), axisLabel: { fontFamily: 'IBM Plex Mono', fontSize: 12, width: 72, overflow: 'truncate' }, axisTick: { show: false } },
      tooltip: {
        trigger: 'item', formatter: p => {
          const a = data[p.dataIndex], s = flows.stocks[a.key] || [a.key];
          return `<b>${a.key}</b> ${s[0] !== a.key ? s[0] : ''}<br/>${t('flow.m.net')}: ${fmtMoney(a.net)}<br/>`
            + `<span style="color:${BUY}">${t('flow.m.buy')} ${fmtMoney(a.buy)} · ${a.up}</span> &nbsp; <span style="color:${SELL}">${t('flow.m.sell')} ${fmtMoney(a.sell)} · ${a.down}</span><br/><i>${t('flow.click')}</i>`;
        },
      },
      series: [{
        type: 'bar', barMaxWidth: 22, cursor: 'pointer',
        data: data.map(a => { const v = valueOf(a, state.metric); return { value: v, itemStyle: { color: v >= 0 ? BUY : SELL, borderRadius: v >= 0 ? [0, 3, 3, 0] : [3, 0, 0, 3], opacity: state.key && state.key !== a.key ? 0.45 : 1 } }; }),
        label: { show: true, position: 'right', formatter: p => fmtMetric(p.value, state.metric), fontSize: 12, color: '#4a3b2c' },
        labelLayout: p => (p.rect.width < 0 ? { x: p.rect.x - 4, align: 'right' } : {}),
      }],
    });
    chart.on('click', p => trace(data[p.dataIndex].key));
    chart.resize();
    if (state.key) trace(state.key, false);
  };

  const trace = (key, scroll = true) => {
    state.key = key;
    const s = flows.stocks[key] || [key, '其他', false];
    const agg = aggregate(flows.rows, state.pi).find(a => a.key === key);
    const parts = (agg ? agg.parts : []).sort((x, y) => x.dv - y.dv);
    const hist = P.map((_, i) => flows.rows.filter(r => r[0] === i && r[2] === key).reduce((acc, r) => acc + r[4], 0));
    const whoEl = el('div', { class: 'chart' }), histEl = el('div', { class: 'chart' });
    detail.hidden = false;
    detail.replaceChildren(
      el('div', { class: 'flow-detail-head' },
        el('div', {},
          el('span', { class: 'flow-tk' }, key), ' ',
          el('span', { class: 'flow-nm' }, s[0] !== key ? s[0] : ''), ' ',
          el('span', { class: 'tag-pill' }, term(s[1]))),
        el('div', {},
          s[2] ? el('a', { href: `#/stock/${encodeURIComponent(key)}`, class: 'btn' }, t('flow.open')) : null, ' ',
          el('button', { class: 'btn', onclick: () => { state.key = null; detail.hidden = true; draw(); }, 'aria-label': t('flow.close') }, '×'))),
      el('div', { class: 'grid g2' },
        el('div', {}, el('h3', {}, t('flow.who', { q: quarterLabel(P[state.pi]) })), el('div', { class: 'sub' }, t('flow.who.sub')), whoEl),
        el('div', {}, el('h3', {}, t('flow.hist')), el('div', { class: 'sub' }, t('flow.hist.sub')), histEl)));
    whoEl.style.height = `${Math.max(220, parts.length * 28 + 50)}px`;
    mount(whoEl, {
      grid: { left: 170, right: 80, top: 6, bottom: 24 },
      xAxis: { type: 'value', axisLabel: { formatter: v => fmtMoney(v) } },
      yAxis: { type: 'category', data: parts.map(x => flows.managers[x.cik]), axisLabel: { fontSize: 12, width: 160, overflow: 'truncate' } },
      tooltip: { trigger: 'item', formatter: p => `${p.name}<br/>${kindLabel(parts[p.dataIndex].k)} · ${fmtMoney(p.value)}` },
      series: [{ type: 'bar', barMaxWidth: 18, data: parts.map(x => ({ value: x.dv, itemStyle: { color: KIND_COLOR[x.k] } })),
                 label: { show: true, position: 'right', formatter: p => kindLabel(parts[p.dataIndex].k), fontSize: 11, color: '#7d6a52' } }],
    }).on('click', p => { location.hash = `#/manager/${parts[p.dataIndex].cik}`; });
    mount(histEl, {
      grid: { left: 64, right: 12, top: 6, bottom: 28 },
      xAxis: { type: 'category', data: P.map(quarterLabel), axisLabel: { interval: 3 } },
      yAxis: { type: 'value', axisLabel: { formatter: v => fmtMoney(v) } },
      tooltip: { trigger: 'axis', valueFormatter: fmtMoney },
      series: [{ type: 'bar', cursor: 'pointer', data: hist.map((v, i) => ({ value: v, itemStyle: { color: v >= 0 ? BUY : SELL, opacity: i === state.pi ? 1 : 0.55,
                 borderColor: i === state.pi ? '#2b2118' : 'transparent', borderWidth: 1 } })) }],
    }).on('click', p => { if (p.dataIndex > 0) { state.pi = p.dataIndex; draw(); } });
    if (chart) chart.setOption({ series: [{ data: chart.getOption().series[0].data.map((d, i) => ({ ...d, itemStyle: { ...d.itemStyle, opacity: [...ranked].reverse()[i].key === key ? 1 : 0.45 } })) }] });
    if (scroll) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  qSel.addEventListener('change', () => { state.pi = Number(qSel.value); draw(); });
  toggle.addEventListener('click', () => { state.expanded = !state.expanded; draw(); });
  const box = el('section', { class: 'card flow-hero' },
    el('div', { class: 'flow-head' },
      el('div', {}, el('h3', {}, t('flow.title')), sub),
      el('div', { class: 'flow-controls' }, metricTabs, el('label', { class: 'sort' }, t('flow.quarter'), ' ', qSel), toggle)),
    chartEl, detail);
  return { box, start: draw };
}
