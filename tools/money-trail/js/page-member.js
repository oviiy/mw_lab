import { loadJSON, el, card, chartDiv, kpi, table } from './core.js';
import { mount } from './charts.js';
import { fmtMoney, fmtPct, fmtNum, initials, avatarColor } from './calc.js';
import { t, partyLabel, PARTY_COLOR } from './i18n.js';
import { tradeColumns, partyPill, eventChart } from './page-congress.js';

function photo(m) {
  const fallback = () => el('div', { class: 'avatar', style: { background: PARTY_COLOR[m.party] || avatarColor(m.name) } }, initials(m.name));
  if (!m.photo) return fallback();
  const img = el('img', { class: 'photo', src: m.photo, alt: m.name, loading: 'lazy' });
  img.addEventListener('error', () => img.replaceWith(fallback()));
  return img;
}

export async function render(app, { id }, { meta }) {
  let m;
  try { m = await loadJSON(`data/congress/members/${encodeURIComponent(id)}.json`); } catch { throw new Error(t('mem.notfound')); }
  const linked = new Set(meta.stocks.map(s => s.t));
  const tlEl = chartDiv('tall'), monEl = chartDiv(), evEl = chartDiv(), tkEl = chartDiv();
  const where = m.district != null ? `${m.state}` : m.state;
  app.append(
    el('section', { class: 'hero' }, el('div', { class: 'hero-inner mhero' },
      photo(m),
      el('div', { class: 'who' },
        el('h1', {}, m.name),
        el('div', { class: 'meta' }, partyPill(m.party), ' ', [t(m.chamber === 'senate' ? 'mem.senate' : 'mem.house'), where, m.current == null ? null : t(m.current ? 'mem.current' : 'mem.former')].filter(Boolean).join(' · ')),
        m.committees.length
          ? [el('div', { class: 'meta', style: { marginTop: '14px' } }, t('mem.committees')), el('ul', { class: 'committees' }, m.committees.map(c => el('li', {}, c)))]
          : null,
        (m.links || []).length ? el('div', { class: 'bio-links' }, m.links.map(l => el('a', { class: 'btn', href: l.url, target: '_blank', rel: 'noopener' }, `${t(`mem.link.${l.k}`)} ↗`))) : null),
      el('div', { class: 'bigval' }, el('b', {}, fmtNum(m.n)), el('span', {}, t('mem.kpi.trades'))))),
    el('div', { class: 'grid g4' },
      kpi(t('mem.kpi.trades'), t('mem.kpi.mix', { b: fmtNum(m.buys), s: fmtNum(m.sells), e: fmtNum(m.n - m.buys - m.sells) })),
      kpi(t('mem.kpi.est'), fmtMoney(m.est)),
      kpi(t('mem.kpi.hit'), m.hit3 == null ? '—' : fmtPct(m.hit3, 0)),
      kpi(t('mem.kpi.lag'), m.lag == null ? '—' : t('cg.days', { n: m.lag }))),
    el('p', { class: 'note' }, `${t('col.buys')} / ${t('col.sells')} · ${t('mem.kpi.sub', { s: m.spouse, o: m.options })} · ${t('mem.kpi.hitsub', { n: m.n_hit })}`),
    card(t('mem.timeline'), t('mem.timeline.sub'), tlEl),
    el('div', { class: 'grid g2 mt' },
      card(t('mem.monthly'), null, monEl),
      card(t('mem.event'), t('mem.event.sub'), m.event_buy.n ? evEl : el('div', { class: 'empty' }, t('empty')))),
    el('div', { class: 'grid g2 mt' },
      card(t('mem.tickers'), null, tkEl),
      el('div')),
    el('h2', { class: 'section-title' }, t('mem.trades')),
    card(null, null, table(tradeColumns(linked, { member: false }), m.trades, { limit: 200 })));

  // timeline: x = trade date, y = ticker (top 20 by count), size = amount midpoint, colour = buy/sell
  const top = m.tickers.slice(0, 20).map(r => r.t);
  const maxEst = Math.max(1, ...m.trades.map(r => ((r.lo || 0) + (r.hi || 0)) / 2));
  const dot = k => m.trades.filter(r => r.k === k && top.includes(r.t)).map(r => {
    const est = ((r.lo || 0) + (r.hi || 0)) / 2;
    return { value: [r.d, r.t], r, symbolSize: 6 + 30 * Math.sqrt(est / maxEst) };
  });
  mount(tlEl, {
    tooltip: { trigger: 'item', formatter: p => { const r = p.data.r; return `<b>${r.t}</b> ${r.a}<br/>${t(`cg.kind.${r.k}`)} · ${r.d}<br/>${fmtMoney(r.lo)}–${fmtMoney(r.hi)} · ${t(`cg.owner.${r.o}`)}`; } },
    legend: { bottom: 0 }, grid: { left: 64, right: 24, top: 12, bottom: 48 },
    xAxis: { type: 'time' }, yAxis: { type: 'category', data: [...top].reverse(), axisLabel: { fontFamily: 'IBM Plex Mono', fontSize: 12 } },
    series: [{ name: t('cg.kind.buy'), type: 'scatter', data: dot('buy'), itemStyle: { color: 'rgba(79,107,58,.6)' } },
             { name: t('cg.kind.sell'), type: 'scatter', data: dot('sell'), itemStyle: { color: 'rgba(156,59,46,.6)' } }],
  }).on('click', p => { const tk = p.data?.r?.t; if (tk && linked.has(tk)) location.hash = `#/stock/${encodeURIComponent(tk)}`; });
  mount(monEl, {
    tooltip: { trigger: 'axis', valueFormatter: fmtMoney }, legend: { bottom: 0 }, grid: { left: 60, right: 12, top: 12, bottom: 48 },
    xAxis: { type: 'category', data: m.monthly.months }, yAxis: { type: 'value', axisLabel: { formatter: v => fmtMoney(v) } },
    series: [{ name: t('cg.kind.buy'), type: 'bar', stack: 'k', data: m.monthly.buy, itemStyle: { color: '#4f6b3a' } },
             { name: t('cg.kind.sell'), type: 'bar', stack: 'k', data: m.monthly.sell, itemStyle: { color: '#9c3b2e' } }],
  });
  if (m.event_buy.n) eventChart(evEl, { days: m.event_buy.mean.map((_, i) => i), buy: m.event_buy }, [['buy', `${t('cg.ev.buy')} · n=${m.event_buy.n}`, '#4f6b3a']]);
  const tk = m.tickers.slice(0, 12).reverse();
  mount(tkEl, {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, legend: { bottom: 0 }, grid: { left: 64, right: 24, top: 8, bottom: 48 },
    xAxis: { type: 'value', minInterval: 1 }, yAxis: { type: 'category', data: tk.map(r => r.t), axisLabel: { fontFamily: 'IBM Plex Mono', fontSize: 12 } },
    series: [{ name: t('cg.kind.buy'), type: 'bar', stack: 'k', data: tk.map(r => r.buys), itemStyle: { color: '#4f6b3a' } },
             { name: t('cg.kind.sell'), type: 'bar', stack: 'k', data: tk.map(r => r.sells), itemStyle: { color: '#9c3b2e' } }],
  });
  void partyLabel;
}
