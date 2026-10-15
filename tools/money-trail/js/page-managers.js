import { el } from './core.js';
import { fmtMoney, fmtPct, fmtNum, quarterLabel, initials, avatarColor, sortRows } from './calc.js';
import { t, term, person } from './i18n.js';

const SORTS = ['value', 'n', 'cagr', 'turnover', 'name'];

function cardFor(m) {
  const chg = m.chg || {};
  const beat = m.cagr != null && m.bench_cagr != null ? m.cagr - m.bench_cagr : null;
  return el('a', { class: 'card mgr-tile', href: `#/manager/${m.cik}` },
    el('div', { class: 'mgr-tile-head' },
      el('div', { class: 'avatar sm', style: { background: avatarColor(m.name) } }, initials(m.person)),
      el('div', { style: { minWidth: 0 } },
        el('div', { class: 'nm' }, m.name),
        el('div', { class: 'ps' }, person(m.person)))),
    el('div', { class: 'tags' }, m.style.map(s => el('span', { class: 'tag-pill' }, term(s)))),
    el('div', { class: 'mgr-stats' },
      el('div', {}, el('b', {}, fmtMoney(m.value)), el('span', {}, t('mgrs.value'))),
      el('div', {}, el('b', {}, fmtNum(m.n)), el('span', {}, t('mgr.kpi.n'))),
      el('div', {}, el('b', { class: beat == null ? null : beat >= 0 ? 'up' : 'dn' }, m.cagr == null ? '—' : fmtPct(m.cagr)),
        el('span', {}, t('mgrs.cagr')))),
    m.top?.length ? el('div', { class: 'mgr-top' }, el('span', { class: 'lbl' }, t('mgrs.top')),
      m.top.map(x => el('span', { class: 'chip' }, el('b', { class: 'mono' }, x.t), ' ', fmtPct(x.w, 0)))) : null,
    el('div', { class: 'mgr-chg' }, t('mgrs.chg', { q: m.period ? quarterLabel(m.period) : '' }), ' ',
      el('span', { class: 'up' }, `+${chg.new ?? 0} ${t('kind.new')}`), ' · ',
      el('span', { class: 'up' }, `${chg.add ?? 0} ${t('kind.add')}`), ' · ',
      el('span', { class: 'dn' }, `${chg.trim ?? 0} ${t('kind.trim')}`), ' · ',
      el('span', { class: 'dn' }, `−${chg.exit ?? 0} ${t('kind.exit')}`)));
}

export async function render(app, _p, { meta }) {
  const styles = [...new Set(meta.managers.flatMap(m => m.style))];
  let style = 'all', sort = 'value';
  const tabs = el('div', { class: 'tabs' });
  const sel = el('select', { class: 'sort-select', 'aria-label': t('mgrs.sort') },
    SORTS.map(k => el('option', { value: k }, t(`mgrs.sort.${k}`))));
  const grid = el('div', { class: 'mgr-tiles' });
  const draw = () => {
    tabs.replaceChildren(...['all', ...styles].map(s => el('button', { class: style === s ? 'on' : null, onclick: () => { style = s; draw(); } },
      s === 'all' ? `${t('mgr.all')} ${meta.managers.length}` : `${term(s)} ${meta.managers.filter(m => m.style.includes(s)).length}`)));
    const rows = meta.managers.filter(m => style === 'all' || m.style.includes(style));
    grid.replaceChildren(...sortRows(rows, sort, sort === 'name' ? 'asc' : 'desc').map(cardFor));
  };
  sel.addEventListener('change', () => { sort = sel.value; draw(); });
  draw();
  app.append(
    el('h1', { class: 'section-title' }, t('mgrs.h1')),
    el('p', { class: 'section-note' }, t('mgrs.note', { n: meta.managers.length, q: quarterLabel(meta.latest_period) })),
    el('div', { class: 'mgr-toolbar' }, tabs, el('label', { class: 'sort' }, t('mgrs.sort'), ' ', sel)),
    grid);
}
