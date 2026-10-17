// Application shell: map ⇄ scene orchestration, search, directory, location card, settings and routing.
import { h, applyI18n, announce, $ } from './ui/dom.js';
import { t, tx, getLang, setLang, onLang, detectLang } from './i18n/index.js';
import { LOCATIONS, locationById } from './data/locations.js';
import { PLACES, placeById, houseById, loadPlace } from './data/atlas.js';
import { FILTERS, SETTLEMENT_KINDS } from './data/kinds.js';
import { openHouse, shield } from './ui/houses.js';
import { REGIONS, regionById, WORLD } from './data/regions.js';
import { ROUTES } from './data/routes.js';
import { AtlasMap } from './map/AtlasMap.js';
import { smoothPath } from './kit/util.js';
import { settings, setSetting, onSetting, resolveQuality, webglOK } from './settings.js';
import { search } from './ui/search.js';
import { openSettings, openHelp, openSources } from './ui/modals.js';
import { SceneUI } from './ui/sceneui.js';
import * as registry from './generated/scenes.js';

const KIND_ICON = { city: '◉', castle: '▟', town: '●', village: '·', ruin: '◬', sacred: '✦', inn: '⌂', landmark: '▲', battle: '⚔', island: '◌', mountain: '⛰', forest: '♣', lake: '≈', river: '∿', desert: '∴', swamp: '⁂', pass: '⌒', bay: '◠' };
const FILTER_ICON = { cities: '◉', towns: '●', castles: '▟', ruins: '◬', sacred: '✦', other: '▲', nature: '⛰' };
export async function startApp(root) {
  setLang(detectLang());
  const app = new App(root); await app.boot(); return app;
}

class App {
  constructor(root) {
    this.root = root; this.mode = 'map'; this.selected = null; this.host = null; this.sceneUI = null; this.hostPromise = null; this.busy = false; this.loadCache = new Map(); this.savedView = null;
  }
  async boot() {
    this._shell(); applyI18n(this.root);
    this.map = new AtlasMap(this.mapCanvas, { locations: PLACES, regions: REGIONS, onSelect: (id, how) => this.onMapSelect(id, how), onHover: (id, pt) => this.onHover(id, pt), onView: (v) => this.onView(v), onRegion: (id) => this.map.flyToRegion(id) });
    this.map.reduced = settings().reduced;
    this.setLoading(true, t('loading.map'));
    await this.map.init(); this.map.setLang(getLang()); this.map.start(); this.setLoading(false);
    this._refreshRoutes();
    onLang((l) => this.onLang(l)); onSetting((k, v) => this.onSetting(k, v));
    window.addEventListener('hashchange', () => this.route());
    window.__ATLAS = { app: this, ready: false };
    await this.route(true);
    window.__ATLAS.ready = true;
  }

  /* ---------------- shell ---------------- */
  _shell() {
    const r = this.root; r.className = 'atlas';
    this.mapCanvas = h('canvas#map', { 'aria-label': t('map.aria'), 'data-i18n-attrs': 'aria-label:map.aria', role: 'application' });
    this.mapLayer = h('div#map-layer', null, this.mapCanvas);
    this.stageCanvas = h('canvas'); this.pinLayer = h('div#pins');
    this.stageLayer = h('div#stage.hidden', null, this.stageCanvas, this.pinLayer);
    this.veil = h('div.veil');
    this.sceneRoot = h('div#scene-ui-root');
    this.tooltip = h('div.tip-pop.hidden', { role: 'tooltip' });
    this.card = h('aside.card.hidden', { 'aria-live': 'polite' });
    this.loader = h('div.loader.hidden', { role: 'status' }, h('div.loader-ring'), h('p'));
    // top bar
    this.searchInput = h('input', { type: 'search', id: 'q', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': 'q-list', 'aria-autocomplete': 'list', autocomplete: 'off', spellcheck: 'false', 'data-i18n-attrs': 'placeholder:search.placeholder,aria-label:search.label', placeholder: t('search.placeholder'), 'aria-label': t('search.label') });
    this.searchList = h('ul#q-list.q-list.hidden', { role: 'listbox' });
    this._wireSearch();
    this.langEN = h('button', { type: 'button', 'aria-pressed': 'true', onClick: () => setLang('en'), lang: 'en' }, 'EN');
    this.langZH = h('button', { type: 'button', 'aria-pressed': 'false', onClick: () => setLang('zh'), lang: 'zh-Hans' }, '中文');
    const brand = h('button.brand', { type: 'button', onClick: () => this.goWorld(), 'data-i18n-attrs': 'aria-label:nav.home' , 'aria-label': t('nav.home') }, h('span.glyph', { 'aria-hidden': 'true' }, h('svg', { viewBox: '0 0 32 32', width: 30, height: 30, html: '<path d="M16 2 L19 12 L30 16 L19 20 L16 30 L13 20 L2 16 L13 12 Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="16" cy="16" r="3" fill="currentColor"/>' })), h('span.brand-t', null, h('b', { i18n: 'app.title' }), h('small', { i18n: 'app.subtitle' })));
    this.dirBtn = h('button.icon-btn', { type: 'button', onClick: () => this.toggleDir(), 'aria-expanded': 'false', 'aria-controls': 'dir', 'data-i18n-attrs': 'aria-label:dir.open,title:dir.open', 'aria-label': t('dir.open'), title: t('dir.open') }, '☰');
    const tools = h('div.top-tools', null,
      h('div.lang', { role: 'group', 'aria-label': t('lang.label'), 'data-i18n-attrs': 'aria-label:lang.label' }, this.langEN, this.langZH),
      h('button.icon-btn', { type: 'button', onClick: () => openSettings(), 'data-i18n-attrs': 'aria-label:settings.title,title:settings.title', 'aria-label': t('settings.title'), title: t('settings.title') }, '⚙'),
      h('button.icon-btn', { type: 'button', onClick: () => openSources(), 'data-i18n-attrs': 'aria-label:sources.title,title:sources.title', 'aria-label': t('sources.title'), title: t('sources.title') }, '❡'),
      h('button.icon-btn', { type: 'button', onClick: () => openHelp(), 'data-i18n-attrs': 'aria-label:help.title,title:help.title', 'aria-label': t('help.title'), title: t('help.title') }, '?'));
    this.topbar = h('header.topbar', null, this.dirBtn, brand, h('div.search', null, h('span.s-ic', { 'aria-hidden': 'true' }, '⌕'), this.searchInput, this.searchList), tools);
    // filters
    this.filterSet = new Set(FILTERS.map((f) => f.id)); this.kindSet = this._kindsFor(this.filterSet); this.filterBtns = {};
    const chips = FILTERS.map((f) => { const b = h('button.chip.on', { type: 'button', 'aria-pressed': 'false', onClick: () => this.toggleKind(f.id) }, h('span.ic', null, FILTER_ICON[f.id]), h('span', { i18n: 'filter.' + f.id })); this.filterBtns[f.id] = b; return b; });
    this.routesBtn = h('button.chip.routes.hidden', { type: 'button', 'aria-pressed': 'false', onClick: () => setSetting('routes', !settings().routes) }, h('span.ic', null, '⟿'), h('span', { i18n: 'routes.toggle' }));
    this.btn3d = h('button.chip.chip-3d', { type: 'button', 'aria-pressed': 'false', onClick: () => this.toggle3d() }, h('span.badge3d', null, '3D'), h('span', { i18n: 'filter.3d' }));
    this.filterBar = h('div.filters', { role: 'group', 'aria-label': t('filters.label'), 'data-i18n-attrs': 'aria-label:filters.label' }, this.btn3d, h('span.chip-sep'), chips, this.routesBtn);
    // breadcrumb (map mode)
    this.crumbs = h('nav.crumbs.map-crumbs', { 'aria-label': t('nav.breadcrumb'), 'data-i18n-attrs': 'aria-label:nav.breadcrumb' });
    // directory
    this.dir = h('aside#dir.dir', { 'aria-label': t('dir.title'), 'data-i18n-attrs': 'aria-label:dir.title' });
    this.dirFilter = h('input', { type: 'search', 'data-i18n-attrs': 'placeholder:dir.filter,aria-label:dir.filter', placeholder: t('dir.filter'), 'aria-label': t('dir.filter'), onInput: () => this.renderDir() });
    this.dirList = h('div.dir-list');
    this.dir.append(h('div.dir-head', null, h('h2', { i18n: 'dir.title' }), h('button.icon-btn', { type: 'button', 'aria-label': t('common.close'), 'data-i18n-attrs': 'aria-label:common.close', onClick: () => this.toggleDir(false) }, '✕')), this.dirFilter, this.dirList);
    // map tools
    this.scaleBar = h('div.scale', null, h('div.bar'), h('span'));
    this.compass = h('div.compass', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 80 80" width="64" height="64"><circle cx="40" cy="40" r="34" fill="rgba(14,22,28,.55)" stroke="#d6b36a" stroke-width="1"/><path d="M40 8 L45 40 L40 72 L35 40Z" fill="#d6b36a" opacity=".35"/><path d="M40 8 L45 40 L35 40Z" fill="#e8c26a"/><path d="M8 40 L40 35 L72 40 L40 45Z" fill="#d6b36a" opacity=".3"/><text x="40" y="21" text-anchor="middle" font-size="9" fill="#14202a" font-family="serif" font-weight="700">N</text></svg>' });
    const zoomBtns = h('div.zoom', null,
      h('button.icon-btn', { type: 'button', onClick: () => this.map.zoomBy(1.6), 'data-i18n-attrs': 'aria-label:map.zoomIn,title:map.zoomIn', 'aria-label': t('map.zoomIn') }, '+'),
      h('button.icon-btn', { type: 'button', onClick: () => this.map.zoomBy(1 / 1.6), 'data-i18n-attrs': 'aria-label:map.zoomOut,title:map.zoomOut', 'aria-label': t('map.zoomOut') }, '−'),
      h('button.icon-btn', { type: 'button', onClick: () => this.goWorld(), 'data-i18n-attrs': 'aria-label:map.world,title:map.world', 'aria-label': t('map.world') }, '⌂'));
    this.legend = this._legend();
    this.mapUI = h('div.map-ui', null, this.filterBar, this.crumbs, this.dir, h('div.map-tools', null, this.compass, zoomBtns), this.scaleBar, this.legend, this.card, this.tooltip);
    r.append(this.mapLayer, this.stageLayer, this.mapUI, this.sceneRoot, this.topbar, this.veil, this.loader);
    this.renderDir(); this.renderCrumbs();
    // dismiss search on outside click
    document.addEventListener('pointerdown', (e) => { if (!this.topbar.querySelector('.search').contains(e.target)) this._closeSearch(); });
    document.addEventListener('keydown', (e) => { if (e.key === '/' && !/input|select|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); this.searchInput.focus(); } });
    this.langSync();
  }
  _legend() {
    const row = (ic, k) => h('li', null, h('span.ic', null, ic), h('span', { i18n: k }));
    const box = h('div.legend', null, h('button.legend-toggle', { type: 'button', 'aria-expanded': 'false', onClick: (e) => { const o = box.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', String(o)); } }, h('span', { i18n: 'legend.title' })),
      h('div.legend-body', null, h('ul', null, h('li', null, h('span.badge3d', null, '3D'), h('span', { i18n: 'legend.3d' })), ...SETTLEMENT_KINDS.map((k) => row(KIND_ICON[k], 'kind.' + k)), row('⛰', 'legend.nature'), row('▭', 'legend.wall'), row('┄', 'legend.road'), row('⌇', 'legend.river')), h('p.legend-note', { i18n: 'legend.note' })));
    return box;
  }

  /* ---------------- i18n & settings ---------------- */
  langSync() { const l = getLang(); this.langEN.setAttribute('aria-pressed', String(l === 'en')); this.langZH.setAttribute('aria-pressed', String(l === 'zh')); }
  onLang(l) {
    this.langSync(); applyI18n(document); this.map.setLang(l); this.renderDir(); this.renderCrumbs(); this.renderCard();
    this.searchInput.placeholder = t('search.placeholder'); if (this.searchInput.value) this._runSearch();
    this.sceneUI?.refreshLang(); this.host?.refreshPinText(l); this._refreshRoutes();
    document.title = t('app.docTitle'); announce(t('lang.changed'));
  }
  onSetting(k, v) {
    if (k === 'reduced') { this.map.reduced = v; if (this.host) this.host.reduced = v; }
    if (k === 'quality') this.host?.setQuality(resolveQuality());
    if (k === 'labels') this.host?.setLabelsVisible(v);
    if (k === 'spoilers' || k === 'routes') { this._refreshRoutes(); this.sceneUI?.renderDetail(); }
    if (k === 'spoilers' && !v && settings().routes) setSetting('routes', false);
  }
  _refreshRoutes() {
    const s = settings(); this.routesBtn.classList.toggle('hidden', !s.spoilers); this.routesBtn.classList.toggle('on', s.routes); this.routesBtn.setAttribute('aria-pressed', String(s.routes));
    const show = s.spoilers && s.routes;
    const routes = ROUTES.map((r) => ({ ...r, pts: smoothPath(r.stops.map((id) => locationById[id].at), 10) }));
    this.map.setRoutes(routes, show); this._renderRouteList(show);
  }
  _renderRouteList(show) {
    if (!this.routeList) { this.routeList = h('div.route-list'); this.mapUI.append(this.routeList); }
    this.routeList.classList.toggle('hidden', !show);
    this.routeList.replaceChildren(h('h3', { i18n: 'routes.title' }), h('p.spoiler-warn', { i18n: 'routes.warn' }), ...ROUTES.map((r) => h('div.route', null, h('span.sw', { style: `background:${r.color}` }), h('div', null, h('strong', null, tx(r.names)), h('small', null, tx(r.note))))));
  }

  /* ---------------- search ---------------- */
  _wireSearch() {
    const inp = this.searchInput; this.sIdx = -1; this.sRes = [];
    inp.addEventListener('input', () => this._runSearch());
    inp.addEventListener('focus', () => { if (inp.value) this._runSearch(); });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!this.sRes.length) return; this.sIdx = (this.sIdx + (e.key === 'ArrowDown' ? 1 : -1) + this.sRes.length) % this.sRes.length; this._markSearch(); }
      else if (e.key === 'Enter') { e.preventDefault(); const r = this.sRes[Math.max(0, this.sIdx)]; if (r) this.pickResult(r); }
      else if (e.key === 'Escape') { this._closeSearch(); inp.blur(); }
    });
  }
  _runSearch() {
    const q = this.searchInput.value; this.sRes = search(q); this.sIdx = this.sRes.length ? 0 : -1;
    if (!q.trim()) { this._closeSearch(); return; }
    this.searchList.replaceChildren(...(this.sRes.length ? this.sRes.map((r, i) => {
      const l = r.type === 'loc' ? placeById[r.id] : r.type === 'lm' ? placeById[r.loc] : null; const other = getLang() === 'en' ? r.name.zh : r.name.en;
      const icon = r.type === 'region' ? '▦' : r.type === 'lm' ? '⚑' : r.type === 'house' ? shield(houseById[r.id]?.colors, 14) : r.type === 'person' ? '☺' : KIND_ICON[l?.kind] || '•';
      const kindTxt = r.type === 'region' ? t('search.region') : r.type === 'lm' ? tx(placeById[r.loc]?.names) : r.type === 'house' ? t('search.house') : r.type === 'person' ? tx(houseById[r.house]?.names) : t('kind.' + l?.kind);
      return h('li', { role: 'option', id: 'q-' + i, 'aria-selected': String(i === 0), onPointerdown: (e) => { e.preventDefault(); this.pickResult(r); } }, h('span.q-ic', null, icon), h('span.q-t', null, h('b', null, tx(r.name)), h('small', null, other)), h('span.q-k', null, kindTxt));
    }) : [h('li.q-empty', null, t('search.none', { q }))]));
    this.searchList.classList.remove('hidden'); this.searchInput.setAttribute('aria-expanded', 'true');
  }
  _markSearch() { [...this.searchList.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === this.sIdx))); const a = this.searchList.children[this.sIdx]; if (a) { a.scrollIntoView({ block: 'nearest' }); this.searchInput.setAttribute('aria-activedescendant', a.id); } }
  _closeSearch() { this.searchList.classList.add('hidden'); this.searchInput.setAttribute('aria-expanded', 'false'); }
  pickResult(r) {
    this._closeSearch(); this.searchInput.value = ''; this.searchInput.blur();
    if (r.type === 'region') { if (this.mode === 'scene') this.exitScene('region').then(() => this.map.flyToRegion(r.id)); else this.map.flyToRegion(r.id); return; }
    if (r.type === 'lm') { this.enterLocation(r.loc, r.id); return; }
    if (r.type === 'house') { this.openHouse(r.id); return; }
    if (r.type === 'person') { this.openHouse(r.house, r.id); return; }
    if (this.mode === 'scene') { this.exitScene('none').then(() => this.selectLocation(r.id)); return; }
    this.selectLocation(r.id);
  }

  /* ---------------- directory ---------------- */
  toggleDir(force) { const open = force ?? !this.dir.classList.contains('open'); this.dir.classList.toggle('open', open); this.dirBtn.setAttribute('aria-expanded', String(open)); if (open) this.dirFilter.focus(); }
  renderDir() {
    const q = (this.dirFilter?.value || '').trim(); const lang = getLang(); const groups = [];
    const matches = (l) => this.kindSet.has(l.kind) && (!q || search(q, 99).some((e) => (e.type === 'loc' && e.id === l.id)));
    const ids = q ? new Set(search(q, 99).filter((e) => e.type === 'loc').map((e) => e.id)) : null;
    for (const cont of ['westeros', 'essos']) {
      const regs = REGIONS.filter((r) => r.continent === cont); const rows = [];
      for (const r of regs) {
        const locs = PLACES.filter((l) => l.region === r.id && (!this.only3d || l.explorable) && this.kindSet.has(l.kind) && (!ids || ids.has(l.id))).sort((a, b) => b.rank - a.rank || tx(a.names).localeCompare(tx(b.names)));
        if (!locs.length) continue;
        rows.push(h('section.dir-region', null, h('h4', null, h('button', { type: 'button', onClick: () => { this.map.flyToRegion(r.id); this.toggleDir(false); } }, tx(r.names))), ...locs.map((l) => this._dirItem(l, lang))));
      }
      if (rows.length) groups.push(h('div.dir-cont', null, h('h3', { i18n: 'cont.' + cont }), ...rows));
    }
    this.dirList.replaceChildren(...(groups.length ? groups : [h('p.dir-empty', { i18n: 'dir.empty' })]));
  }
  _dirItem(l, lang) {
    return h('button.dir-item' + (l.id === this.selected ? '.sel' : ''), { type: 'button', onClick: () => { this.toggleDir(false); this.selectLocation(l.id); }, onMouseenter: () => this.prefetch(l.id) },
      h('span.ic', null, KIND_ICON[l.kind]), h('span.di-t', null, h('b', null, tx(l.names), l.explorable ? h('span.badge3d.inline', null, '3D') : null), h('small', null, `${t('kind.' + l.kind)} · ${lang === 'en' ? l.names.zh : l.names.en}`), locationById[l.id] ? h('span.di-s', null, tx(locationById[l.id].summary)) : null));
  }
  toggle3d(force) {
    this.only3d = force ?? !this.only3d; this.btn3d.setAttribute('aria-pressed', String(this.only3d)); this.btn3d.classList.toggle('on', this.only3d);
    this.map.setOnly3d(this.only3d); this.renderDir();
    if (this.only3d) { this.map.goWorld(); announce(t('filter.3d.on')); }
  }
  _kindsFor(set) { return new Set(FILTERS.filter((f) => set.has(f.id)).flatMap((f) => f.kinds)); }
  toggleKind(fid) {
    const n = FILTERS.length, fs = this.filterSet;
    if (fs.size === n) this.filterSet = new Set([fid]); else if (fs.has(fid)) { fs.delete(fid); if (!fs.size) this.filterSet = new Set(FILTERS.map((f) => f.id)); } else fs.add(fid);
    const all = this.filterSet.size === n; this.kindSet = this._kindsFor(this.filterSet);
    for (const f of FILTERS) { const on = this.filterSet.has(f.id); this.filterBtns[f.id].classList.toggle('on', on || all); this.filterBtns[f.id].setAttribute('aria-pressed', String(on && !all)); }
    this.map.setFilter(all ? null : this.kindSet); this.renderDir();
  }

  /* ---------------- map interactions ---------------- */
  onMapSelect(id, how) { if (!id) { this.deselect(); return; } if (how === 'enter') { this.enterLocation(id); return; } this.selectLocation(id); }
  selectLocation(id, { fly = true } = {}) {
    this.selected = id; this.map.setSelected(id); this.renderCard(); this.renderCrumbs(); this.prefetch(id);
    const l = placeById[id]; announce(tx(l.names));
    if (fly) this.map.flyToLocation(id, { zoom: Math.max(this.map.zoomRel, 3.6) > 6.5 ? this.map.zoomRel : 4.2, shift: this._cardShift() });
    history.replaceState(null, '', `#/m/${id}`); this.renderDir();
  }
  _cardShift() { return innerWidth > 760 ? [190, 24] : [0, -innerHeight * 0.14]; }
  deselect() { this.selected = null; this.map.setSelected(null); this.renderCard(); this.renderCrumbs(); if (location.hash.startsWith('#/m/')) history.replaceState(null, '', '#/'); }
  goWorld() { if (this.mode === 'scene') { this.exitScene('world'); return; } this.deselect(); this.map.goWorld(); }
  onHover(id, pt) {
    if (!id || this.map.selected === id) { this.tooltip.classList.add('hidden'); return; }
    const l = placeById[id]; if (!l) return; this.prefetch(id, true); const loc = locationById[id];
    this.tooltip.replaceChildren(h('b', null, tx(l.names)), h('small', null, `${t('kind.' + l.kind)} · ${tx(regionById[l.region]?.names)}`), loc ? h('p', null, tx(loc.summary)) : null, l.explorable ? h('p.tip3d', null, h('span.badge3d', null, '3D'), ' ', t('tip.3d')) : null);
    const [x, y] = pt || [0, 0]; const w = this.tooltip.offsetWidth || 260;
    this.tooltip.style.left = Math.max(8, Math.min(innerWidth - w - 8, x + 16)) + 'px'; this.tooltip.style.top = Math.max(60, y - 12) + 'px'; this.tooltip.classList.remove('hidden');
  }
  onView(v) { this._lastView = v; this._viewDirty = true; if (!this._vt) this._vt = requestAnimationFrame(() => { this._vt = 0; this.renderCrumbs(); this._scale(); }); }
  _scale() {
    const v = this._lastView; if (!v) return; const unitsMi = 2; const target = 120; const pxPerMi = v.unitPx / unitsMi; let mi = target / pxPerMi;
    const nice = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000]; mi = nice.reduce((a, b) => (Math.abs(b - mi) < Math.abs(a - mi) ? b : a));
    const bar = this.scaleBar.firstChild; bar.style.width = mi * pxPerMi + 'px'; this.scaleBar.lastChild.textContent = t('map.scale', { mi, km: Math.round(mi * 1.609) });
  }
  renderCrumbs() {
    if (this.mode === 'scene') return;
    const v = this._lastView || { level: 'world', region: null }; const bits = [h('button.crumb' + (v.level === 'world' && !this.selected ? '.cur' : ''), { type: 'button', onClick: () => this.goWorld() }, t('nav.world'))];
    const sel = this.selected && placeById[this.selected]; const regId = sel ? sel.region : (v.level !== 'world' ? v.region : null);
    if (regId) { bits.push(h('span.sep', null, '›'), h('button.crumb' + (sel ? '' : '.cur'), { type: 'button', onClick: () => this.map.flyToRegion(regId) }, tx(regionById[regId].names))); }
    if (sel) bits.push(h('span.sep', null, '›'), h('span.crumb.cur', { 'aria-current': 'page' }, tx(sel.names)));
    this.crumbs.replaceChildren(...bits);
  }
  renderCard() {
    const id = this.selected; this.card.classList.toggle('hidden', !id || this.mode !== 'map'); if (!id) return;
    const l = placeById[id]; if (!l) return; const r = regionById[l.region], lang = getLang(), loc = locationById[id], can3d = !!(loc && registry.SCENES[id]);
    const body = h('div.card-body', null, loc ? h('p', null, tx(loc.summary)) : h('p.loading-line', null, t('house.loading')));
    const housesBox = h('div.card-houses');
    this.card.replaceChildren(
      h('button.icon-btn.card-x', { type: 'button', 'aria-label': t('common.close'), onClick: () => this.deselect() }, '✕'),
      h('div.kicker', null, `${t('kind.' + l.kind)} · ${tx(r?.names)}`, can3d ? h('span.badge3d.inline', null, '3D') : null), h('h2', null, tx(l.names)), h('div.alt', null, lang === 'en' ? l.names.zh : l.names.en),
      l.alt?.length ? h('div.aka', null, t('card.aka'), ' ', l.alt.filter((a) => /[一-鿿]/.test(a) === (lang === 'zh')).slice(0, 4).join(' · ') || l.alt.slice(0, 3).join(' · ')) : null,
      body, housesBox,
      loc ? h('p.depth', null, h('span.pip.' + loc.depth), t('depth.' + loc.depth)) : null,
      h('div.card-actions', null, can3d ? h('button.btn.primary', { type: 'button', onClick: () => this.enterLocation(id) }, h('span', { i18n: 'card.enter' }), ' →') : null, h('button.btn', { type: 'button', onClick: () => this.map.flyToLocation(id, { zoom: 6.2, shift: this._cardShift() }) }, t('card.center'))));
    const token = (this._cardToken = (this._cardToken || 0) + 1);
    loadPlace(id).then((rec) => {
      if (token !== this._cardToken || !rec) return;
      const parts = [];
      if (rec.summary && (!loc || rec.group)) parts.push(h('p', null, tx(rec.summary)));
      else if (loc) parts.push(h('p', null, tx(loc.summary)));
      else parts.push(h('p.muted', null, t('card.noSummary')));
      if (rec.spoiler && settings().spoilers) parts.push(h('div.spoiler', null, h('strong', null, t('spoiler.label')), h('p', null, tx(rec.spoiler))));
      if (rec.confidence) parts.push(h('p.conf-line', null, h('span.conf.' + rec.confidence, null, h('span.conf-dot'), t('conf.' + rec.confidence))));
      body.replaceChildren(...parts);
      const hs = (rec.houses || []).filter((hid) => houseById[hid]);
      if (hs.length) housesBox.replaceChildren(h('div.kicker', null, t('card.houses')), h('div.house-chips', null, hs.map((hid) => h('button.house-chip', { type: 'button', onClick: () => this.openHouse(hid) }, shield(houseById[hid].colors, 16), tx(houseById[hid].names)))));
    });
  }
  openHouse(id, focusPerson) { openHouse(id, { focusPerson, onPlace: (pid) => this.selectLocation(pid), onHouse: (hid) => this.openHouse(hid) }); }

  /* ---------------- scene loading & transitions ---------------- */
  setLoading(on, msg) { this.loader.classList.toggle('hidden', !on); if (msg) this.loader.querySelector('p').textContent = msg; }
  prefetch(id, soft = false) { if (!registry.SCENES[id] || this.loadCache.has(id)) return; if (soft && !this._idleOK()) return; this.loadCache.set(id, registry.SCENES[id]().catch((e) => { this.loadCache.delete(id); throw e; })); this.loadCache.get(id).catch(() => {}); }
  _idleOK() { return (navigator.connection?.saveData !== true); }
  async getHost() {
    if (this.host) return this.host;
    this.hostPromise ||= import('./host/SceneHost.js').then(({ SceneHost }) => {
      const host = new SceneHost({ canvas: this.stageCanvas, pinLayer: this.pinLayer, quality: resolveQuality(), reducedMotion: settings().reduced, onSelect: (id) => this.onLandmark(id), onTourStep: (i, id, n) => this.sceneUI?.onTourStep(i, id, n), onHover: () => {} });
      this.host = host; return host;
    });
    return this.hostPromise;
  }
  onLandmark(id) { if (!this.sceneUI) return; if (!id) { this.sceneUI.closeDetail(); return; } this.sceneUI.select(id); this.host.focusLandmark(id); history.replaceState(null, '', `#/l/${this.sceneId}/${id}`); }

  async enterLocation(id, landmarkId = null, { instant = false } = {}) {
    if (!locationById[id]) return;
    if (this.busy && performance.now() - (this.busyAt || 0) < 20000) return; // a stuck attempt can never block entering for good
    this.busy = true; this.busyAt = performance.now(); const l = locationById[id];
    this.tooltip.classList.add('hidden'); this.toggleDir(false);
    try {
      if (this.mode === 'scene') await this.exitScene('none');
      this.savedView = { ...this.map.cam };
      this.selected = id; this.map.setSelected(id); this.renderCard(); this.map.dim = false;
      if (!webglOK() || !registry.SCENES[id]) { await this.openFallback(id); return; }
      const loadP = this._loadScene(id);
      this.setLoading(true, t('loading.scene', { name: tx(l.names) })); const showLoader = 0; // immediate feedback
      const flown = this.map.flyToLocation(id, { zoom: 14, instant, dur: 1.5 });
      let mod, content, host;
      try { [[mod, content], host] = await Promise.all([loadP, this.getHost()]); await Promise.race([flown, wait(2200)]); }
      catch (e) { clearTimeout(showLoader); this.setLoading(false); console.error(e); this.showError(id, e); return; }
      clearTimeout(showLoader);
      // cross-dissolve: ink veil, swap, reveal
      this.veil.classList.add('on'); await wait(instant ? 0 : 420);
      this.stageLayer.classList.remove('hidden'); this.mapUI.classList.add('hidden'); this.map.paused = true;
      host.setLabelsVisible(settings().labels); host.reduced = settings().reduced; host.setQuality(resolveQuality());
      try { host.mount(mod, content.default, getLang()); } catch (e) { console.error(e); this.veil.classList.remove('on'); this.stageLayer.classList.add('hidden'); this.mapUI.classList.remove('hidden'); this.map.paused = false; this.setLoading(false); this.showError(id, e); return; }
      host.start(); this.sceneId = id; this.mode = 'scene';
      this.sceneUI = new SceneUI({ root: this.sceneRoot, loc: l, content: content.default, host, desc: host.desc, onExit: (to) => this.exitScene(to || 'region'), onLandmark: (lid) => this.onLandmark(lid) });
      this.setLoading(false); this.topbar.classList.add('in-scene'); this.root.classList.add('in-scene');
      await wait(60); this.veil.classList.remove('on');
      history.replaceState(null, '', `#/l/${id}`);
      announce(t('scene.entered', { name: tx(l.names) }));
      window.__ATLAS.host = host; window.__ATLAS.sceneUI = this.sceneUI;
      const enter = host.enter();
      if (landmarkId && host.landmarks.has(landmarkId)) { await enter; this.onLandmark(landmarkId); } else await enter;
    } finally { this.busy = false; }
  }
  _loadScene(id) { if (!this.loadCache.has(id)) this.prefetch(id); return this.loadCache.get(id); }
  showError(id, e) {
    this.busy = false; const l = locationById[id];
    const box = h('div.error-box', { role: 'alert' }, h('h3', { i18n: 'error.title' }), h('p', null, t('error.body', { name: tx(l.names) })), h('div.card-actions', null, h('button.btn.primary', { type: 'button', onClick: () => { box.remove(); this.enterLocation(id); } }, t('error.retry')), h('button.btn', { type: 'button', onClick: () => box.remove() }, t('common.close'))));
    this.root.append(box);
  }
  async openFallback(id) {
    const { modal } = await import('./ui/dom.js'); const { sourceBlock } = await import('./ui/modals.js'); const l = locationById[id];
    let content = null; try { content = (await registry.CONTENT?.[id]?.())?.default; } catch { /* no content chunk */ }
    const body = h('div.fallback', null, h('p.lead', null, tx(l.summary)), h('p.warn', { i18n: webglOK() ? 'fallback.noscene' : 'fallback.nowebgl' }),
      content ? h('div', null, h('p', null, tx(content.intro)), ...Object.values(content.landmarks).map((lm) => h('details.src', null, h('summary', null, tx(lm.name)), h('p', null, tx(lm.desc)), sourceBlock(lm, content)))) : null);
    this.busy = false; modal({ title: tx(l.names), body, wide: true });
  }
  async exitScene(to = 'region') {
    if (this.mode !== 'scene' || this.busy) return; this.busy = true; const id = this.sceneId; const l = locationById[id];
    try {
      this.veil.classList.add('on'); await wait(this.map.reduced ? 0 : 420);
      this.sceneUI.destroy(); this.sceneUI = null; this.host.unmount(); this.host.stop();
      this.stageLayer.classList.add('hidden'); this.mapUI.classList.remove('hidden'); this.topbar.classList.remove('in-scene'); this.root.classList.remove('in-scene'); this.map.paused = false; this.mode = 'map';
      this.map.flyToLocation(id, { zoom: 14, instant: true });
      this.selected = id; this.map.setSelected(id); this.renderCard(); this.renderCrumbs();
      await wait(80); this.veil.classList.remove('on'); history.replaceState(null, '', `#/m/${id}`);
      if (to === 'world') { this.deselect(); await this.map.goWorld(); }
      else if (to === 'region') await this.map.flyToRegion(l.region, { dur: 1.8 });
    } finally { this.busy = false; }
    window.__ATLAS && (window.__ATLAS.sceneUI = null);
  }

  /* ---------------- routing ---------------- */
  async route(first = false) {
    const m = location.hash.match(/^#\/(l|m|r|h)\/([\w-]+)(?:\/([\w-]+))?/); const q = new URLSearchParams(location.search);
    const loc = q.get('loc'); if (loc && locationById[loc]) { await this.enterLocation(loc, q.get('lm'), { instant: true }); return; }
    if (!m) return;
    const [, kind, id, lm] = m;
    if (kind === 'l' && locationById[id] && !(this.mode === 'scene' && this.sceneId === id)) await this.enterLocation(id, lm, { instant: first });
    else if (kind === 'm' && placeById[id] && this.mode === 'map') this.selectLocation(id, { fly: true });
    else if (kind === 'h' && houseById[id]) this.openHouse(id);
    else if (kind === 'r' && regionById[id]) this.map.flyToRegion(id);
  }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
