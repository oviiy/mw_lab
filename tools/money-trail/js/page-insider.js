import { loadJSON, el, card, chartDiv, kpi, stockLink, table } from './core.js';
import { mount } from './charts.js';
import { fmtMoney, fmtPct, fmtNum, initials, fromRows } from './calc.js';
import { t } from './i18n.js';
import { filingColumns, rolePill, eventChart, ROLE_COLOR } from './page-insiders.js';

export async function render(app, { cik }, { meta }) {
  let p;
  try { p = await loadJSON(`data/insiders/people/${cik}.json`); } catch { throw new Error(t('ins.notfound')); }
  const linked = new Set(meta.stocks.map(s => s.t));
  const rows = fromRows(p.keys, p.rows);
  const tlEl = chartDiv(), evEl = chartDiv();
  const co = p.companies[0];
  const other = Object.entries(p.other).sort((a, b) => b[1] - a[1]);
  app.append(
    el('section', { class: 'hero' }, el('div', { class: 'hero-inner mhero' },
      el('div', { class: 'avatar', style: { background: ROLE_COLOR[p.role] } }, initials(p.nm)),
      el('div', { class: 'who' },
        el('h1', {}, p.nm),
        el('div', { class: 'meta' }, rolePill(p.role), ' ', [co?.title, co ? `${co.n} (${co.t || '—'})` : null].filter(Boolean).join(' · ')),
        el('div', { class: 'meta', style: { marginTop: '10px' } }, t('ins.p.cik', { c: p.c }), ' · ',
          el('a', { href: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${p.c}&type=4&dateb=&owner=include&count=40`, target: '_blank', rel: 'noopener' }, t('ins.p.edgar'))),
        p.cl ? el('div', { class: 'meta', style: { marginTop: '6px' } }, t('ins.p.incl', { n: p.clusters.length })) : null),
      el('div', { class: 'bigval' }, el('b', {}, fmtNum(p.buys + p.sells)), el('span', {}, t('ins.p.filings'))))),
    el('div', { class: 'grid g4' },
      kpi(t('ins.p.bs'), `${fmtNum(p.buys)} / ${fmtNum(p.sells)}`),
      kpi(t('ins.col.vb'), fmtMoney(p.vb)),
      kpi(t('ins.col.vs'), fmtMoney(p.vs)),
      kpi(t('ins.p.plan'), fmtNum(p.plan_sells))),
    el('div', { class: 'grid g3 mt' }, [['3', 'hit3', 'n3', 'r3'], ['6', 'hit6', 'n6', 'r6'], ['12', 'hit12', 'n12', 'r12']].map(([m, h, n, r]) =>
      el('div', { class: 'card kpi' },
        el('div', { class: 'label' }, t('ins.p.hit', { m })),
        el('div', { class: 'val' }, fmtPct(p[h], 0)),
        el('div', { class: 'note', style: { marginTop: '2px' } }, t('ins.p.hitsub', { n: p[n], a: fmtPct(p.avg[r]) }))))),
    card(t('ins.p.timeline'), t('ins.p.timeline.sub'), tlEl),
    el('div', { class: 'grid g2 mt' },
      card(t('ins.p.event'), t('ins.p.event.sub'), p.event_buy && p.event_buy.n ? evEl : el('div', { class: 'empty' }, t('ins.p.nobuys'))),
      card(t('ins.p.companies'), other.length ? t('ins.p.other', { s: other.map(([k, v]) => `${t(`ins.code.${k}`)} ${v}`).join(' · ') }) : null,
        table([
          { key: 'n', label: t('ins.col.company'), fmt: (v, r) => [r.linked ? stockLink(r.t) : el('span', { class: 'mono' }, r.t || '—'), ' ', el('span', { class: 'muted' }, v)] },
          { key: 'title', label: t('ins.col.title'), fmt: (v, r) => v || t(`ins.role.${r.role}`) },
          { key: 'buys', label: t('col.buys'), num: true },
          { key: 'sells', label: t('col.sells'), num: true },
          { key: 'last', label: t('col.last') },
        ], p.companies))),
    el('h2', { class: 'section-title' }, t('ins.p.trades')),
    card(null, p.n_rows > rows.length ? t('ins.p.trunc', { n: rows.length, total: fmtNum(p.n_rows) }) : null,
      table(filingColumns({ who: false, stock: p.companies.length > 1, linked }), rows, { limit: 200 })));

  // timeline: x = trade date, y = company, size = value, colour = buy/sell; plan sales drawn hollow
  const cats = [...new Set(rows.map(r => r.t || '—'))];
  tlEl.style.height = `${Math.min(460, Math.max(200, 90 + 36 * cats.length))}px`;
  const maxV = Math.max(1, ...rows.map(r => r.v || 0));
  const dot = pred => rows.filter(pred).map(r => ({ value: [r.d, r.t || '—'], r, symbolSize: 7 + 30 * Math.sqrt((r.v || 0) / maxV) }));
  mount(tlEl, {
    tooltip: { trigger: 'item', formatter: q => { const r = q.data.r; return `<b>${r.t || '—'}</b> · ${r.d}<br/>${t(r.k === 'P' ? 'ins.buy' : 'ins.sell')}${r.plan ? ' (10b5-1)' : ''} ${fmtNum(r.sh)} @ $${r.px?.toFixed(2) ?? '—'}<br/>${fmtMoney(r.v)}`; } },
    legend: { bottom: 0 }, grid: { left: 64, right: 24, top: 12, bottom: 48 },
    xAxis: { type: 'time' }, yAxis: { type: 'category', data: cats, axisLabel: { fontFamily: 'IBM Plex Mono', fontSize: 12 } },
    series: [{ name: t('ins.buy'), type: 'scatter', data: dot(r => r.k === 'P'), itemStyle: { color: 'rgba(79,107,58,.7)' } },
             { name: t('ins.m.sell'), type: 'scatter', data: dot(r => r.k === 'S' && !r.plan), itemStyle: { color: 'rgba(156,59,46,.65)' } },
             { name: t('ins.m.plan'), type: 'scatter', data: dot(r => r.k === 'S' && r.plan), itemStyle: { color: 'rgba(156,59,46,0)', borderColor: '#9c3b2e', borderWidth: 1.2 } }],
  }).on('click', q => { const tk = q.data?.r?.t; if (tk && linked.has(tk)) location.hash = `#/stock/${encodeURIComponent(tk)}`; });
  if (p.event_buy && p.event_buy.n) {
    const days = p.event_buy.mean.map((_, i) => i - 20);
    eventChart(evEl, days, [[p.event_buy, `${t('ins.ev.buy')} · n=${p.event_buy.n}`, '#4f6b3a']], { band: false });
  }
}
