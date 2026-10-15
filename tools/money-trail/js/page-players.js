// Who's Buying: every kind of disclosed buyer on one yardstick, plus a strategy lab that separates signal from noise.
import { loadJSON, el, card, chartDiv, table } from './core.js';
import { mount } from './charts.js';
import { fmtMoney, fmtPct, fmtNum, filterPlayers, groupPlayers } from './calc.js';
import { t, term, partyLabel, person } from './i18n.js';

const GROUPS = ['all', 'fund', 'congress', 'insider'];
const COLOR = { fund: '#2b2118', congress: '#3f5e86', insider: '#8a5a12', bench: '#7d6a52', smart: '#4f6b3a' };
const HREF = { fund: id => `#/manager/${id}`, congress: id => `#/member/${encodeURIComponent(id)}`, insider: id => `#/insider/${id}` };
const DEEP = { fund: '#/managers', congress: '#/congress', insider: '#/insiders' };
// strategy catalogue: key prefix in players.json -> group it belongs to
const SMART = [['smart.all', 'all'], ['smart.fund_mom', 'fund'], ['smart.fund_proven', 'fund'], ['smart.congress_crowd', 'congress'], ['smart.insider_confirmed', 'insider']];
const BASE = [['fund.0', 'fund'], ['congress.0', 'congress'], ['insider.0', 'insider']];
const lineColor = k => (k.startsWith('smart.all') ? COLOR.smart : COLOR[k.startsWith('smart.') ? k.split('.')[1].split('_')[0] : k.split('.')[0]]);

const plink = (p, label) => (p.page === false ? el('span', {}, label) : el('a', { href: HREF[p.g](p.id) }, label));
const pill = g => el('span', { class: `gpill gpill-${g}` }, t(`pl.g.${g}`));
const signed = v => el('span', { class: v > 0 ? 'up' : v < 0 ? 'dn' : null }, v == null ? '—' : `${v > 0 ? '+' : ''}${fmtPct(v)}`);
const subOf = p => (p.g === 'congress' ? `${partyLabel(p.party)} · ${p.sub} · ${t(p.chamber === 'senate' ? 'mem.senate' : 'mem.house')}`
  : p.g === 'fund' ? `${person(p.sub)} · ${p.style.map(term).join(' / ')}` : `${t(`ins.role.${p.role}`)} · ${p.sub}`);

export async function render(app, params, { meta }) {
  const d = await loadJSON('data/players.json');
  const S = d.strategies;
  const linked = new Set(meta.stocks.map(s => s.t));
  const best = [...SMART].sort((a, b) => S.stats[`${b[0]}.${S.holds[0]}`].cagr - S.stats[`${a[0]}.${S.holds[0]}`].cagr)[0][0];
  const state = { g: GROUPS.includes(params.g) ? params.g : 'all', q: '', by: 'none', pick: best, hold: S.holds[0], bench: 'SPY' };

  // ---------- strategy lab
  const picker = el('div', { class: 'lab-picker' });
  const holdTabs = el('div', { class: 'tabs' });
  const benchSel = el('select', { class: 'sort-select', 'aria-label': t('pl.bench') }, ['SPY', 'RSP', 'IWM', 'QQQ'].filter(b => S.bench[b]).map(b => el('option', { value: b }, t(`pl.b.${b}`))));
  const finding = el('p', { class: 'pl-finding' });
  const labEl = chartDiv('tall'), years = el('div', { class: 'lab-years' });
  let lab = null;
  const key = k => `${k}.${state.hold}`;
  const vsBench = k => S.stats[key(k)].cagr - S.bench_stats[state.bench].cagr;
  const item = ([k]) => el('button', { class: `lab-item${state.pick === k ? ' on' : ''}`, onclick: () => { state.pick = k; drawLab(); } },
    el('span', { class: 'dot', style: { background: lineColor(k) } }),
    el('span', { class: 'lab-txt' }, el('b', {}, t(`lab.${k}`)), el('small', {}, t(`lab.${k}.d`))),
    el('span', { class: 'lab-num' }, fmtPct(S.stats[key(k)].cagr), signed(vsBench(k))));

  const drawLab = () => {
    const inGroup = ([, g]) => state.g === 'all' || g === state.g || g === 'all';
    const smart = SMART.filter(inGroup).sort((a, b) => S.stats[key(b[0])].cagr - S.stats[key(a[0])].cagr), base = BASE.filter(inGroup);
    if (!smart.concat(base).some(([k]) => k === state.pick)) state.pick = (smart[0] || base[0])[0];
    picker.replaceChildren(el('div', { class: 'lab-h' }, t('lab.smart')), ...smart.map(item), el('div', { class: 'lab-h' }, t('lab.base')), ...base.map(item));
    holdTabs.replaceChildren(...S.holds.map(h => el('button', { class: state.hold === h ? 'on' : null, onclick: () => { state.hold = h; drawLab(); } }, t(`pl.hold.${h}`))));
    // chart: selected strategy (bold), the composite for reference, its group's copy-all baseline, the benchmark
    const pickGroup = (SMART.concat(BASE).find(([k]) => k === state.pick) || [])[1];
    const show = [state.pick, ...(state.pick !== 'smart.all' ? ['smart.all'] : []), ...BASE.filter(([, g]) => g === pickGroup || (pickGroup === 'all' && state.g === 'all') || (pickGroup === 'all' && g === state.g)).map(([k]) => k)];
    const uniq = [...new Set(show)];
    if (lab) lab.dispose();
    lab = mount(labEl, {
      tooltip: { trigger: 'axis', valueFormatter: v => (v == null ? '—' : `$${(v * 100).toFixed(0)}`) },
      legend: { top: 0 }, grid: { left: 56, right: 18, top: 44, bottom: 30 },
      xAxis: { type: 'time' }, yAxis: { type: 'value', name: t('lab.growth'), scale: true, splitNumber: 5, axisLabel: { formatter: v => `$${(v * 100).toFixed(0)}` } },
      series: [...uniq.map(k => ({ name: t(`lab.${k}`), type: 'line', symbol: 'none', z: k === state.pick ? 3 : 2,
                                   lineStyle: { width: k === state.pick ? 3 : 1, color: lineColor(k), opacity: k === state.pick ? 1 : 0.35, type: k.startsWith('smart') ? 'solid' : 'dotted' },
                                   itemStyle: { color: lineColor(k) }, data: S.dates.map((x, i) => [x, S.lines[key(k)][i]]) })),
               { name: state.bench, type: 'line', symbol: 'none', lineStyle: { width: 2, type: 'dashed', color: COLOR.bench }, itemStyle: { color: COLOR.bench }, data: S.dates.map((x, i) => [x, S.bench[state.bench][i]]) }],
    });
    const st = S.stats[key(state.pick)], bst = S.bench_stats[state.bench];
    const r1 = x => Math.round(x * 1000) / 10;                  // displayed to 0.1 pt, so the gap reconciles with what's shown
    const gap = r1(st.cagr) - r1(bst.cagr);
    finding.replaceChildren(el('b', {}, t(`lab.${state.pick}`)), ' — ', t(gap >= 0 ? 'lab.find.beat' : 'lab.find.lag',
      { n: fmtNum(st.n), h: t(`pl.hold.${state.hold}`), c: `${r1(st.cagr).toFixed(1)}%`, b: state.bench, bc: `${r1(bst.cagr).toFixed(1)}%`, v: Math.abs(gap).toFixed(1), m: fmtPct(st.mdd), bm: fmtPct(bst.mdd) }));
    const yr = S.yearly[key(state.pick)][state.bench === 'RSP' ? 'RSP' : 'SPY'];
    const wins = Object.values(yr).filter(x => x > 0).length;
    years.replaceChildren(el('span', { class: 'lab-years-h' }, t('lab.years', { b: state.bench === 'RSP' ? 'RSP' : 'SPY', w: wins, n: Object.keys(yr).length })),
      ...Object.entries(yr).map(([y, x], i, all) => el('span', { class: `yr ${x >= 0 ? 'yr-up' : 'yr-dn'}`, style: { opacity: 0.55 + Math.min(Math.abs(x) * 4, 0.45) } },
        el('b', {}, i === all.length - 1 && Number(y) === new Date().getFullYear() ? `${y} ${t('lab.ytd')}` : y), `${x >= 0 ? '+' : ''}${fmtPct(x)}`)));
  };
  benchSel.addEventListener('change', () => { state.bench = benchSel.value; drawLab(); });

  // ---------- benchmark map + live signals
  const mapEl = chartDiv('tall'), liveBox = el('div', { class: 'live-box' });
  let map = null;
  const drawMap = rows => {
    const pts = rows.filter(p => p.ex3 != null && p.buys > 0 && (p.n3 || 0) >= 5);
    const maxV = Math.max(1, ...pts.map(p => p.vol || 0));
    const byEx = [...pts].sort((a, b) => b.ex3 - a.ex3);
    const top = new Set([...byEx.slice(0, 6), ...byEx.slice(-6)].map(p => p.g + p.id));
    const ys = byEx.map(p => p.ex3), lo = ys[Math.floor(ys.length * 0.98)] ?? -0.5, hi = ys[Math.floor(ys.length * 0.02)] ?? 0.5;
    if (map) map.dispose();
    map = mount(mapEl, {
      tooltip: { trigger: 'item', formatter: x => { const p = x.data.p; return `<b>${p.name}</b> · ${t(`pl.g.${p.g}`)}${p.proven ? ` · ${t('pl.proven')}` : ''}<br/>${subOf(p)}<br/>${t('pl.buys')} ${fmtNum(p.buys)} · ${t('pl.ex3')} ${fmtPct(p.ex3)} · ${t('col.hit')} ${p.hit3 == null ? '—' : fmtPct(p.hit3, 0)}`; } },
      legend: { top: 0 }, grid: { left: 60, right: 30, top: 40, bottom: 48 },
      xAxis: { type: 'log', name: t('pl.buys'), nameLocation: 'middle', nameGap: 28, min: 1, axisLabel: { formatter: v => (v >= 1000 ? `${v / 1000}k` : String(v)) } },
      yAxis: { type: 'value', name: t('pl.ex3'), nameLocation: 'middle', nameGap: 44, min: Math.floor(lo * 20) / 20, max: Math.ceil(hi * 20) / 20, axisLabel: { formatter: v => fmtPct(v, 0) } },
      series: ['fund', 'congress', 'insider'].filter(g => state.g === 'all' || state.g === g).map((g, i) => ({
        name: t(`pl.g.${g}`), type: 'scatter', labelLayout: { hideOverlap: true }, itemStyle: { color: COLOR[g], opacity: 0.45, borderColor: '#f8f1e1', borderWidth: 0.5 },
        data: pts.filter(p => p.g === g).map(p => ({ value: [Math.max(1, p.buys), Math.max(lo, Math.min(hi, p.ex3))], p, symbolSize: 7 + 30 * Math.sqrt((p.vol || 0) / maxV),
          itemStyle: p.proven ? { borderColor: '#2b2118', borderWidth: 1.5 } : undefined,
          label: { show: top.has(p.g + p.id), formatter: p.name.length > 18 ? `${p.name.slice(0, 17)}…` : p.name, position: 'top', fontSize: 12, color: '#4a3b2c' } })),
        markLine: i === 0 ? { silent: true, symbol: 'none', lineStyle: { color: '#2b2118', type: 'dashed' }, label: { formatter: t('pl.spyline'), color: '#7d6a52', position: 'insideEndTop' }, data: [{ yAxis: 0 }] } : undefined,
      })),
    });
    map.on('click', x => { const p = x.data.p; if (p.page !== false) location.hash = HREF[p.g](p.id); });
  };
  const drawLive = () => {
    const groupsMap = new Map();
    for (const r of d.live.filter(x => state.g === 'all' || x.g === state.g)) {
      const k = `${r.t}|${r.f}|${r.g}|${r.rules.join(',')}`;
      if (!groupsMap.has(k)) groupsMap.set(k, { ...r, ex: r.since - r.spy, who: [] });
      groupsMap.get(k).who.push(r);
    }
    const rows = [...groupsMap.values()].slice(0, 30);
    liveBox.replaceChildren(rows.length ? table([
      { key: 'f', label: t('col.filed'), fmt: v => el('span', { class: 'nowrap' }, v) },
      { key: 't', label: t('col.stock'), fmt: v => (linked.has(v) ? el('a', { href: `#/stock/${encodeURIComponent(v)}`, class: 'mono' }, v) : el('span', { class: 'mono' }, v)) },
      { key: 'name', label: t('pl.player'), fmt: (v, r) => (r.who.length > 1 ? el('span', { title: r.who.map(w => w.name).join(', ') }, el('b', {}, t('lab.live.grp', { n: r.who.length })), ' ', pill(r.g), el('div', { class: 'sig-who' }, r.who.slice(0, 3).map(w => w.name).join(', ') + (r.who.length > 3 ? '…' : '')))
        : [plink(r, v), ' ', pill(r.g)]) },
      { key: 'rules', label: t('lab.why'), fmt: v => v.map(k => el('span', { class: 'chip' }, t(`lab.rule.${k}`))) },
      { key: 'ex', label: t('pl.vs'), num: true, fmt: signed },
    ], rows) : el('div', { class: 'empty' }, t('lab.live.none')));
  };

  // ---------- players + positions
  const listBox = el('div'), posBox = el('div');
  const search = el('input', { class: 'pl-search', placeholder: t('pl.search'), 'aria-label': t('pl.search') });
  const bySel = el('select', { class: 'sort-select', 'aria-label': t('pl.by') },
    ['none', 'g', 'party', 'chamber', 'style', 'role'].map(k => el('option', { value: k }, t(`pl.by.${k}`))));
  const playerCols = [
    { key: 'name', label: t('pl.player'), fmt: (v, p) => [plink(p, v), p.proven ? el('span', { class: 'proven', title: t('pl.proven.tip') }, ` ✓ ${t('pl.proven')}`) : null, el('div', { class: 'pl-sub' }, subOf(p))] },
    { key: 'g', label: t('pl.type'), fmt: v => pill(v) },
    { key: 'buys', label: t('pl.buys'), num: true, fmt: fmtNum },
    { key: 'sells', label: t('pl.sells'), num: true, fmt: fmtNum },
    { key: 'vol', label: t('pl.vol'), num: true, fmt: fmtMoney },
    { key: 'ex3', label: t('pl.ex3'), num: true, fmt: signed },
    { key: 'hit3', label: t('col.hit'), num: true, fmt: v => (v == null ? '—' : fmtPct(v, 0)) },
    { key: 'last', label: t('col.last') },
  ];
  const drawList = rows => {
    if (state.by === 'none') return listBox.replaceChildren(table(playerCols, rows, { sortKey: 'buys', limit: 120 }));
    const label = k => (state.by === 'g' ? t(`pl.g.${k}`) : state.by === 'party' ? partyLabel(k) : state.by === 'style' ? term(k)
      : state.by === 'chamber' ? t(k === 'senate' ? 'mem.senate' : 'mem.house') : state.by === 'role' ? t(`ins.role.${k}`) : k);
    listBox.replaceChildren(...groupPlayers(rows, state.by).map(gr => el('details', { class: 'pl-group', open: true },
      el('summary', {}, el('b', {}, gr.key === '—' ? '—' : label(gr.key)), el('span', { class: 'muted' }, ` · ${t('pl.n', { n: gr.rows.length })} · ${t('pl.ex3')} `), signed(gr.ex3)),
      table(playerCols, gr.rows, { sortKey: 'buys', limit: 60 }))));
  };
  const drawPositions = () => {
    const rows = d.positions.filter(r => state.g === 'all' || r.g === state.g).slice(0, 60).map(r => ({ ...r, ex: r.since - r.spy }));
    posBox.replaceChildren(table([
      { key: 'f', label: t('col.filed') },
      { key: 'name', label: t('pl.player'), fmt: (v, r) => plink(r, v) },
      { key: 'g', label: t('pl.type'), fmt: v => pill(v) },
      { key: 't', label: t('col.stock'), fmt: v => (linked.has(v) ? el('a', { href: `#/stock/${encodeURIComponent(v)}`, class: 'mono' }, v) : el('span', { class: 'mono' }, v)) },
      { key: 'since', label: t('pl.since'), num: true, fmt: signed },
      { key: 'spy', label: t('pl.spysince'), num: true, fmt: signed },
      { key: 'ex', label: t('pl.vs'), num: true, fmt: signed },
    ], rows));
  };

  // ---------- header + wiring
  const tabs = el('div', { class: 'tabs' }), deep = el('div', { class: 'pl-deep' });
  const draw = () => {
    tabs.replaceChildren(...GROUPS.map(g => el('button', { class: state.g === g ? 'on' : null, onclick: () => { state.g = g; history.replaceState(null, '', g === 'all' ? '#/players' : `#/players/${g}`); draw(); } },
      g === 'all' ? `${t('mgr.all')} ${d.players.length}` : `${t(`pl.g.${g}`)} ${d.players.filter(p => p.g === g).length}`)));
    deep.replaceChildren(...(state.g === 'all' ? ['fund', 'congress', 'insider'] : [state.g]).map(g => el('a', { class: 'btn', href: DEEP[g] }, t(`pl.deep.${g}`))));
    const rows = filterPlayers(d.players, { g: state.g, q: state.q });
    drawLab(); drawMap(rows); drawLive(); drawList(rows); drawPositions();
  };
  search.addEventListener('input', () => { state.q = search.value; drawList(filterPlayers(d.players, { g: state.g, q: state.q })); });
  bySel.addEventListener('change', () => { state.by = bySel.value; drawList(filterPlayers(d.players, { g: state.g, q: state.q })); });

  app.append(
    el('div', { class: 'pl-head' },
      el('div', {}, el('h1', { class: 'pl-title' }, t('pl.h1')), el('p', { class: 'section-note' }, t('pl.lede', { h: d.hold_days }))),
      el('div', { class: 'pl-head-right' }, tabs, deep)),
    el('section', { class: 'card lab' },
      el('div', { class: 'lab-top' }, el('div', {}, el('h3', {}, t('lab.title')), el('div', { class: 'sub' }, t('lab.sub'))),
        el('div', { class: 'pl-ctl' }, holdTabs, el('label', { class: 'sort' }, t('pl.bench'), ' ', benchSel))),
      el('div', { class: 'lab-body' }, picker, el('div', { class: 'lab-main' }, finding, labEl, years, el('p', { class: 'lab-caveat' }, t('lab.caveat'))))),
    el('div', { class: 'grid g2 mt eq' },
      card(t('pl.map'), t('pl.map.sub'), mapEl),
      card(t('lab.live'), t('lab.live.sub'), liveBox)),
    el('h2', { class: 'section-title' }, t('pl.list')),
    card(null, t('pl.list.sub'), el('div', { class: 'pl-tools' }, search, el('label', { class: 'sort' }, t('pl.by'), ' ', bySel)), listBox),
    el('h2', { class: 'section-title' }, t('pl.pos')),
    card(null, t('pl.pos.sub'), posBox));
  draw();
}
