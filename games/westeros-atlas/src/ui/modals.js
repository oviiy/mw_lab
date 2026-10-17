import { h, modal } from './dom.js';
import { t, tx, getLang } from '../i18n/index.js';
import { settings, setSetting, resolveQuality } from '../settings.js';
import { SOURCES, CHECKED, CONFIDENCE } from '../data/sources.js';
import { LOCATIONS } from '../data/locations.js';

const toggle = (key, label, hint) => {
  const id = 'set-' + key; const input = h('input', { type: 'checkbox', id, checked: !!settings()[key], onChange: (e) => setSetting(key, e.target.checked) });
  return h('label.set-row', { for: id }, h('span.set-text', null, h('strong', { i18n: label }), hint ? h('small', { i18n: hint }) : null), input, h('span.switch'));
};
export function openSettings() {
  const q = h('select', { id: 'set-quality', onChange: (e) => setSetting('quality', e.target.value) }, ['auto', 'low', 'medium', 'high'].map((v) => h('option', { value: v, selected: settings().quality === v, i18n: 'settings.q.' + v })));
  const body = h('div.settings', null,
    h('label.set-row', { for: 'set-quality' }, h('span.set-text', null, h('strong', { i18n: 'settings.quality' }), h('small', { i18n: 'settings.quality.hint' })), q),
    toggle('spoilers', 'settings.spoilers', 'settings.spoilers.hint'),
    toggle('reduced', 'settings.reduced', 'settings.reduced.hint'),
    toggle('labels', 'settings.labels', 'settings.labels.hint'),
    h('p.set-note', { i18n: 'settings.note' }));
  return modal({ title: t('settings.title'), body });
}
export function openHelp() {
  const rows = ['help.map', 'help.keys', 'help.scene', 'help.touch'].map((k) => h('section', null, h('h3', { i18n: k + '.t' }), h('p', { i18n: k })));
  return modal({ title: t('help.title'), body: h('div.help', null, rows) });
}
export function openSources() {
  const order = Object.entries(SOURCES).sort((a, b) => a[1].tier - b[1].tier);
  const counts = { deep: 0, moderate: 0, sparse: 0 }; LOCATIONS.forEach((l) => counts[l.depth]++);
  const body = h('div.sources', null,
    h('p', { i18n: 'sources.intro' }),
    h('div.src-tiers', null, order.map(([id, s]) => h('div.src-row', null, h('span.src-tier', null, 'T' + s.tier), h('div', null, h('strong', null, tx(s.title)), h('small', null, `${s.author} · ${t('sources.kind.' + s.kind)}`))))),
    h('h3', { i18n: 'sources.honesty.t' }), h('p', { i18n: 'sources.honesty' }),
    h('h3', { i18n: 'sources.checked.t' }), h('ul.checked', null, Object.entries(CHECKED).map(([k, v]) => h('li', null, h('b', null, k), ' — ', tx(v)))),
    h('h3', { i18n: 'sources.depth.t' }), h('p', null, t('sources.depth', { deep: counts.deep, moderate: counts.moderate, sparse: counts.sparse })),
    h('h3', { i18n: 'sources.legal.t' }), h('p', { i18n: 'sources.legal' }));
  return modal({ title: t('sources.title'), body, wide: true });
}

/** Source & interpretation block for one landmark. */
export function sourceBlock(lm, content) {
  const s = lm.source || {}; const conf = CONFIDENCE[s.confidence || 'low'];
  const chk = (ref) => { const e = (content.sources || []).find((x) => x.ref === ref); return e ? tx(CHECKED[e.checked] || CHECKED['not-accessed']) : tx(CHECKED['not-accessed']); };
  return h('div.src-block', null,
    h('div.conf.' + (s.confidence || 'low'), null, h('span.conf-dot'), tx(conf)),
    h('dl', null,
      h('dt', { i18n: 'src.book' }), h('dd', null, tx(s.book)),
      h('dt', { i18n: 'src.unknown' }), h('dd', null, tx(s.unknown)),
      h('dt', { i18n: 'src.interp' }), h('dd', null, tx(s.interpretation))),
    h('div.refs', null, (s.refs || []).map((r) => h('span.ref', { title: chk(r) }, tx(SOURCES[r]?.title) || r))));
}
