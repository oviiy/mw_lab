import { loadJSON, el, card, chartDiv, kpi, kindBadge, stockLink, managerLink, table } from './core.js';
import { mount, onCleanup, colorFor } from './charts.js';
import { fmtMoney, fmtPct, fmtNum, quarterLabel, initials, avatarColor, kindLabel, KIND_COLOR } from './calc.js';
import { t, term, person, bio, getLang } from './i18n.js';

const last = a => [...a].reverse().find(v => v != null) ?? null;

function profile(m, managers) {
  const where = [m.city, m.state].filter(Boolean).join(', ');
  const sep = getLang() === 'zh' ? '，' : ' · ';
  return el('section', { class: 'hero' }, el('div', { class: 'hero-inner mhero' },
    el('div', { class: 'avatar', style: { background: avatarColor(m.name) } }, initials(m.person)),
    el('div', { class: 'who' },
      el('h1', {}, m.name),
      el('div', { class: 'meta' }, [person(m.person), where, m.founded ? t('mgr.founded', { y: m.founded }) : null, `CIK ${m.cik}`].filter(Boolean).join(sep)),
      el('div', { class: 'tags', style: { margin: '10px 0' } }, m.style.map(s => el('span', { class: 'tag-pill' }, term(s)))),
      el('ul', { class: 'bio' }, bio(m).map(b => el('li', {}, b))),
      el('div', { class: 'bio-links' }, m.sources.map(s => el('a', { class: 'btn', href: s.url, target: '_blank', rel: 'noopener' }, `${s.label.startsWith('Wikipedia') ? t('mgr.link.wiki') : term(s.label)} ↗`)))),
    el('div', { class: 'bigval' }, el('b', {}, fmtMoney(last(m.series.value))), el('span', {}, t('mgr.value', { q: m.latest.period ? quarterLabel(m.latest.period) : '—' })),
      switcher(m.cik, managers))));
}

function switcher(cik, managers) {
  const sel = el('select', { class: 'sort-select', 'aria-label': t('mgr.switch') },
    managers.map(x => el('option', { value: x.cik, selected: x.cik === cik ? true : null }, x.name)));
  sel.addEventListener('change', () => { location.hash = `#/manager/${sel.value}`; });
  return el('label', { class: 'switch' }, t('mgr.switch'), sel);
}

function treemap(rows) {
  const by = new Map();
  for (const r of rows) {
    const s = term(r.s);
    if (!by.has(s)) by.set(s, []);
    by.get(s).push({ name: r.t || r.n, value: r.v, w: r.w, k: r.k, n: r.n, t: r.t, itemStyle: { color: KIND_COLOR[r.k] }, label: { color: r.k === 'new' || r.k === 'exit' ? '#fffaf0' : '#2b2118' } });
  }
  return {
    tooltip: { formatter: p => (p.data.k ? `<b>${p.data.name}</b> ${p.data.n}<br/>${fmtMoney(p.value)} · ${t('mgr.tt.weight')} ${fmtPct(p.data.w)}<br/>${t('mgr.tt.this')}${kindLabel(p.data.k)}` : `<b>${p.name}</b><br/>${fmtMoney(p.value)}`) },
    series: [{
      type: 'treemap', data: [...by].map(([s, children]) => ({ name: s, children })),
      roam: false, nodeClick: false, breadcrumb: { show: false }, top: 0, left: 0, right: 0, bottom: 0,
      label: { show: true, position: 'insideTopLeft', formatter: p => (p.data.w != null ? `${p.name}\n${fmtPct(p.data.w)}` : p.name), fontSize: 13, fontFamily: 'IBM Plex Mono', lineHeight: 16 },
      upperLabel: { show: true, height: 20, color: '#2b2118', fontSize: 12 },
      levels: [{ itemStyle: { borderWidth: 0, gapWidth: 4 } },
               { itemStyle: { borderColor: '#dccba6', borderWidth: 2, gapWidth: 1 }, upperLabel: { show: true } },
               { itemStyle: { borderColor: '#f8f1e1', borderWidth: 1 } }],
    }],
  };
}

function changesTable(rows) {
  const holder = el('div');
  let kind = 'all';
  const tabs = el('div', { class: 'tabs' });
  const draw = () => {
    tabs.replaceChildren(...['all', 'new', 'add', 'trim', 'exit'].map(k => el('button', { class: kind === k ? 'on' : null, onclick: () => { kind = k; draw(); } },
      k === 'all' ? `${t('mgr.all')} ${rows.length}` : `${kindLabel(k)} ${rows.filter(r => r.k === k).length}`)));
    const shown = kind === 'all' ? rows : rows.filter(r => r.k === kind);
    holder.replaceChildren(table([
      { key: 't', label: t('col.stock'), fmt: (v, r) => stockLink(v, v || r.n) },
      { key: 'n', label: t('col.name') },
      { key: 'k', label: t('col.change'), fmt: v => kindBadge(v) },
      { key: 'sh0', label: t('col.sh0'), num: true, fmt: fmtNum },
      { key: 'sh', label: t('col.sh'), num: true, fmt: fmtNum },
      { key: 'dv', label: t('col.dv'), num: true, fmt: v => el('span', { style: { color: v > 0 ? 'var(--buy)' : v < 0 ? 'var(--sell)' : null } }, fmtMoney(v)) },
      { key: 'w0', label: t('col.w0'), num: true, fmt: v => fmtPct(v) },
      { key: 'w', label: t('col.w'), num: true, fmt: v => fmtPct(v) },
    ], shown, { limit: 60 }));
  };
  draw();
  return el('div', {}, tabs, holder);
}

function race(node, ctrl, m) {
  const frames = m.race.frames;
  const chart = mount(node, {
    grid: { left: 96, right: 90, top: 10, bottom: 28 },
    xAxis: { type: 'value', max: 'dataMax', axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: { type: 'category', inverse: true, max: 14, axisLabel: { fontFamily: 'IBM Plex Mono', fontSize: 12 }, animationDuration: 300, animationDurationUpdate: 300 },
    dataset: { source: [] },
    series: [{ type: 'bar', realtimeSort: true, encode: { x: 1, y: 0 }, itemStyle: { color: p => colorFor(p.value[0]) },
               label: { show: true, position: 'right', valueAnimation: true, formatter: p => fmtMoney(p.value[1]) } }],
    animationDuration: 0, animationDurationUpdate: 900, animationEasing: 'linear', animationEasingUpdate: 'linear',
    graphic: { elements: [{ type: 'text', id: 'lbl', right: 100, bottom: 50, style: { text: '', font: '600 44px "Cormorant Garamond", serif', fill: 'rgba(58,42,30,.12)' } }] },
  });
  const slider = el('input', { type: 'range', min: 0, max: frames.length - 1, value: frames.length - 1, 'aria-label': t('mgr.race') });
  const btn = el('button', { class: 'btn' }, t('mgr.play'));
  let i = frames.length - 1, timer = null;
  const show = k => {
    i = k;
    slider.value = k;
    const q = quarterLabel(m.periods[k]);
    chart.setOption({ dataset: { source: frames[k].map(r => [r.t, r.v]) }, graphic: { elements: [{ id: 'lbl', style: { text: frames[k].length ? q : t('mgr.nofile', { q }) } }] } });
  };
  const stop = () => { clearInterval(timer); timer = null; btn.textContent = t('mgr.play'); };
  btn.addEventListener('click', () => {
    if (timer) return stop();
    if (i >= frames.length - 1) show(0);
    btn.textContent = t('mgr.pause');
    timer = setInterval(() => (i >= frames.length - 1 ? stop() : show(i + 1)), 1100);
  });
  slider.addEventListener('input', () => { stop(); show(Number(slider.value)); });
  onCleanup(stop);
  ctrl.append(btn, slider);
  show(i);
}

function backtestBlock(bt) {
  if (!bt) return { body: [el('div', { class: 'empty' }, t('mgr.bt.none'))], mountTo: null };
  const node = chartDiv();
  const lines = [[t('mgr.bt.filing'), bt.filing, '#7a2e1f', 'solid'], [t('mgr.bt.ideal'), bt.ideal, '#b8aa90', 'dashed'], ['SPY', bt.bench, '#2b2118', 'solid']];
  const option = {
    tooltip: { trigger: 'axis', valueFormatter: v => (v == null ? '—' : v.toFixed(3)) },
    legend: { bottom: 0 }, grid: { left: 48, right: 16, top: 16, bottom: 48 },
    xAxis: { type: 'time' }, yAxis: { type: 'value', scale: true, axisLabel: { formatter: v => v.toFixed(2) } },
    series: lines.map(([name, ys, color, type]) => ({ name, type: 'line', symbol: 'none', lineStyle: { color, type, width: 2 }, itemStyle: { color }, data: bt.dates.map((d, i) => [d, ys[i]]) })),
  };
  const rows = [[t('mgr.bt.f'), bt.stats.filing], [t('mgr.bt.i'), bt.stats.ideal], ['SPY', bt.stats.bench]].map(([k, s]) => ({ k, ...s }));
  const low = bt.coverage.filter(c => c < 0.9).length;
  return {
    body: [node, table([
      { key: 'k', label: t('col.port') },
      { key: 'cagr', label: t('col.cagr'), num: true, fmt: v => fmtPct(v) },
      { key: 'vol', label: t('col.vol'), num: true, fmt: v => fmtPct(v) },
      { key: 'sharpe', label: t('col.sharpe'), num: true, fmt: v => (v == null ? '—' : v.toFixed(2)) },
      { key: 'mdd', label: t('col.mdd'), num: true, fmt: v => fmtPct(v) },
    ], rows),
    low ? el('div', { class: 'warn' }, t('mgr.bt.warn', { n: bt.coverage.length, k: low })) : null],
    mountTo: node, option,
  };
}

export async function render(app, { cik }, { meta }) {
  let m;
  try { m = await loadJSON(`data/managers/${cik}.json`); } catch { throw new Error(t('mgr.notfound', { cik, n: meta.managers.length })); }
  const P = m.periods.map(quarterLabel);
  const treeEl = chartDiv('tall'), raceEl = chartDiv('tall'), raceCtrl = el('div', { class: 'controls' });
  const sectorEl = chartDiv(), styleEl = chartDiv();
  const bt = backtestBlock(m.backtest);
  const legend = el('div', { class: 'legend' }, t('mgr.legend'), ['new', 'add', 'trim', 'hold'].map(k => kindBadge(k)));
  const lq = m.latest.period ? quarterLabel(m.latest.period) : '';
  app.append(
    profile(m, meta.managers),
    el('div', { class: 'grid g4' },
      kpi(t('mgr.kpi.n'), fmtNum(last(m.series.n))), kpi(t('mgr.kpi.top5'), fmtPct(m.latest.rows.slice(0, 5).reduce((a, r) => a + (r.w || 0), 0))),
      kpi(t('mgr.kpi.top10'), fmtPct(last(m.series.top10))), kpi(t('mgr.kpi.turnover'), fmtPct(last(m.series.turnover)))),
    el('h2', { class: 'section-title' }, t('mgr.tree.h', { q: lq })),
    card(null, m.latest.other_w > 0.0005 ? t('mgr.tree.sub', { n: m.latest.rows.length, w: fmtPct(m.latest.other_w) }) : t('mgr.tree.sub0'), legend, treeEl),
    el('h2', { class: 'section-title' }, t('mgr.chg.h')),
    card(null, m.changes.period ? t('mgr.chg.sub', { q: quarterLabel(m.changes.period), p: quarterLabel(m.changes.prev_period) }) : t('mgr.chg.none'), changesTable(m.changes.rows)),
    el('div', { class: 'grid g2 mt' },
      card(t('mgr.race'), t('mgr.race.sub'), raceCtrl, raceEl),
      card(t('mgr.sector'), t('mgr.sector.sub'), sectorEl)),
    el('div', { class: 'grid g2 mt' },
      card(t('mgr.style'), t('mgr.style.sub'), styleEl),
      card(t('mgr.bt'), t('mgr.bt.sub'), ...bt.body)),
    el('div', { class: 'grid g2 mt' },
      card(t('mgr.sim'), t('mgr.sim.sub'), m.similar.length
        ? table([{ key: 'name', label: t('col.manager'), fmt: (v, r) => managerLink(r.cik, v) }, { key: 'score', label: t('col.sim'), num: true, fmt: v => v.toFixed(2) }], m.similar)
        : el('div', { class: 'empty' }, t('mgr.none'))),
      card(t('mgr.opt'), t('mgr.opt.sub'), m.options.length
        ? table([{ key: 't', label: t('col.under'), fmt: (v, r) => stockLink(v, v || r.n) }, { key: 'pc', label: t('col.type') }, { key: 'v', label: t('col.notional'), num: true, fmt: fmtMoney }], m.options, { limit: 20 })
        : el('div', { class: 'empty' }, t('mgr.opt.none')))));

  if (m.latest.rows.length) mount(treeEl, treemap(m.latest.rows)); else treeEl.replaceWith(el('div', { class: 'empty' }, t('mgr.nohold')));
  race(raceEl, raceCtrl, m);
  mount(sectorEl, {
    tooltip: { trigger: 'axis', valueFormatter: v => fmtPct(v) }, legend: { type: 'scroll', bottom: 0 },
    grid: { left: 48, right: 16, top: 12, bottom: 48 },
    xAxis: { type: 'category', data: P, boundaryGap: false }, yAxis: { type: 'value', max: 1, axisLabel: { formatter: v => fmtPct(v, 0) } },
    series: m.sectors.names.map((s, j) => ({ name: term(s), type: 'line', stack: 'w', symbol: 'none', lineStyle: { width: 0 }, areaStyle: { opacity: 0.85 },
                                              data: m.sectors.weights.map(row => (row ? row[j] : null)) })),
  });
  mount(styleEl, {
    tooltip: { trigger: 'axis' }, legend: { bottom: 0 }, grid: { left: 48, right: 48, top: 16, bottom: 48 },
    xAxis: { type: 'category', data: P },
    yAxis: [{ type: 'value', axisLabel: { formatter: v => fmtPct(v, 0) } }, { type: 'value', name: t('mgr.s.q'), splitLine: { show: false } }],
    series: [
      { name: t('mgr.s.top10'), type: 'line', data: m.series.top10, tooltip: { valueFormatter: v => fmtPct(v) } },
      { name: t('mgr.s.turn'), type: 'line', data: m.series.turnover, tooltip: { valueFormatter: v => fmtPct(v) } },
      { name: t('mgr.s.hold'), type: 'line', yAxisIndex: 1, data: m.series.hold_q, tooltip: { valueFormatter: v => (v == null ? '—' : v.toFixed(1)) } },
    ],
  });
  if (bt.mountTo) mount(bt.mountTo, bt.option);
}
