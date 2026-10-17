// In-scene HUD: return button, breadcrumb, landmark rail, details + sources panel, tour, atmosphere & weather controls.
import { h, $, $$, announce } from './dom.js';
import { t, tx, getLang } from '../i18n/index.js';
import { settings, setSetting } from '../settings.js';
import { sourceBlock } from './modals.js';
import { CHECKED, SOURCES } from '../data/sources.js';
import { regionById } from '../data/regions.js';

const ATMOS = ['dawn', 'day', 'dusk', 'night'];
const WEATHER = ['clear', 'snow', 'rain', 'fog'];
const ICON = { dawn: '◐', day: '☀', dusk: '◑', night: '☾', clear: '○', snow: '❄', rain: '☂', fog: '≋' };

export class SceneUI {
  constructor({ root, loc, content, host, desc, onExit, onLandmark, onRegion }) {
    Object.assign(this, { root, loc, content, host, desc, onExit, onLandmark, onRegion });
    this.sel = null; this.min = innerWidth < 760; this.touring = false; this.tourPaused = false; this.inCut = null;
    this.ids = Object.keys(desc.landmarks || {});
    this.atmos = desc.climate?.atmos || 'day'; this.weather = desc.climate?.weather || 'clear';
    this._build();
  }
  _build() {
    const { loc, content } = this;
    this.el = h('div.scene-ui');
    this.back = h('button.btn.back', { type: 'button', onClick: () => this.onExit() }, h('span.arrow', null, '←'), h('span', { i18n: 'scene.back' }));
    this.crumbs = h('nav.crumbs.scene-crumbs', { 'aria-label': t('nav.breadcrumb'), 'data-i18n-attrs': 'aria-label:nav.breadcrumb' });
    this.top = h('div.scene-top', null, this.back, this.crumbs);
    this.rail = h('aside.rail', { 'aria-label': t('scene.landmarks') });
    this.panel = h('aside.detail', { 'aria-live': 'polite' });
    this.tourBar = h('div.tour-bar.hidden', { role: 'status' });
    this.toolbar = this._toolbar();
    this.railToggle = h('button.btn.rail-toggle', { type: 'button', onClick: () => this.rail.classList.toggle('open'), 'aria-expanded': 'false' }, '☰ ', h('span', { i18n: 'scene.landmarks' }));
    this.cutBar = h('div.cut-bar.hidden');
    this.el.append(this.top, this.railToggle, this.rail, this.panel, this.tourBar, this.cutBar, this.toolbar);
    this.root.append(this.el);
    this.renderAll();
  }
  _toolbar() {
    const b = (cls, key, fn, label) => h('button.tool' + cls, { type: 'button', onClick: fn, 'data-i18n-attrs': `aria-label:${key},title:${key}`, 'aria-label': t(key), title: t(key) }, label);
    this.tourBtn = b('.tour-btn', 'tour.start', () => this.toggleTour(), h('span.ic', null, '▶'));
    this.tourPrev = b('', 'tour.prev', () => this.host.tourPrev(), '⏮'); this.tourNext = b('', 'tour.next', () => this.host.tourNext(), '⏭');
    this.tourStop = b('', 'tour.stop', () => this.stopTour(), '■');
    const tourGrp = h('div.grp.tour-grp', null, this.tourBtn, this.tourPrev, this.tourNext, this.tourStop);
    const viewGrp = h('div.grp', null, b('', 'view.hero', () => { this.closeDetail(); this.host.resetView(); }, '⌂'), b('', 'view.overhead', () => { this.closeDetail(); this.host.overhead(); }, '⌖'), b('.labels', 'view.labels', (e) => { const on = !settings().labels; setSetting('labels', on); this.host.setLabelsVisible(on); e.currentTarget.classList.toggle('on', on); }, '⚑'));
    this.atmosBtns = ATMOS.map((a) => { const el = h('button.tool.seg', { type: 'button', 'aria-pressed': String(a === this.atmos), onClick: () => this.setAtmos(a), 'data-i18n-attrs': `aria-label:atmos.${a},title:atmos.${a}`, title: t('atmos.' + a), 'aria-label': t('atmos.' + a) }, ICON[a]); return el; });
    this.weatherBtns = WEATHER.map((w) => h('button.tool.seg', { type: 'button', 'aria-pressed': String(w === this.weather), onClick: () => this.setWeather(w), 'data-i18n-attrs': `aria-label:weather.${w},title:weather.${w}`, title: t('weather.' + w), 'aria-label': t('weather.' + w) }, ICON[w]));
    return h('div.toolbar', { role: 'toolbar', 'aria-label': t('scene.controls'), 'data-i18n-attrs': 'aria-label:scene.controls' }, viewGrp, tourGrp, h('div.grp.seg-grp', null, this.atmosBtns), h('div.grp.seg-grp', null, this.weatherBtns));
  }
  /* ---------- state changes ---------- */
  setAtmos(a) { this.atmos = a; this.host.setAtmosphere(a); this.atmosBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(ATMOS[i] === a))); announce(t('atmos.' + a)); }
  setWeather(w) { this.weather = w; this.host.setWeather(w); this.weatherBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(WEATHER[i] === w))); announce(t('weather.' + w)); }
  toggleTour() {
    if (!this.touring) { this.closeDetail(true); this.touring = true; this.tourPaused = false; this.host.startTour(this.content.tour?.length ? this.content.tour : this.ids); this.el.classList.add('touring'); this.tourBtn.firstChild.textContent = '❚❚'; }
    else { this.tourPaused = !this.tourPaused; this.host.tourPause(this.tourPaused); this.tourBtn.firstChild.textContent = this.tourPaused ? '▶' : '❚❚'; }
  }
  stopTour() { this.host.stopTour(); }
  onTourStep(i, id, n) {
    if (i < 0) { this.touring = false; this.el.classList.remove('touring'); this.tourBar.classList.add('hidden'); this.tourBtn.firstChild.textContent = '▶'; return; }
    const lm = this.content.landmarks[id]; this.tourBar.classList.remove('hidden');
    this.tourBar.replaceChildren(h('div.tour-step', null, t('tour.step', { i: i + 1, n })), h('strong', null, tx(lm.name)), h('p', null, tx(lm.tour) || tx(lm.desc)));
    this.sel = id; this.renderRail(); announce(`${tx(lm.name)}. ${tx(lm.tour) || ''}`);
    this.renderCrumbs();
  }
  select(id) { if (this.touring) return; this.sel = id; this.renderDetail(); this.renderRail(); this.renderCrumbs(); this.host.select(id, true); }
  closeDetail(keepSel = false) { if (!keepSel) { this.sel = null; this.host.deselect(true); } this.renderDetail(); this.renderRail(); this.renderCrumbs(); }
  /* ---------- rendering ---------- */
  renderAll() { this.renderCrumbs(); this.renderRail(); this.renderDetail(); this.renderCutaways(); }
  renderCrumbs() {
    const { loc, content } = this; const r = regionById[loc.region];
    const bits = [h('button.crumb', { type: 'button', onClick: () => this.onExit('world') }, t('nav.world')), h('span.sep', null, '›'), h('button.crumb', { type: 'button', onClick: () => this.onExit('region') }, tx(r?.names)), h('span.sep', null, '›'), h('button.crumb' + (this.sel ? '' : '.cur'), { type: 'button', onClick: () => this.closeDetail() }, tx(loc.names))];
    if (this.sel) bits.push(h('span.sep', null, '›'), h('span.crumb.cur', { 'aria-current': 'page' }, tx(content.landmarks[this.sel].name)));
    this.crumbs.replaceChildren(...bits);
  }
  renderRail() {
    const { content } = this;
    const items = this.ids.map((id) => h('button.rail-item' + (id === this.sel ? '.sel' : ''), { type: 'button', onClick: () => { this.rail.classList.remove('open'); this.onLandmark(id); } }, h('span.dot'), tx(content.landmarks[id].name)));
    this.rail.replaceChildren(h('h3', { i18n: 'scene.landmarks' }), h('div.rail-list', null, items));
  }
  renderCutaways() {
    const cuts = this.desc.cutaways || []; this.cutBar.classList.toggle('hidden', !cuts.length || !!this.inCut);
    this.cutBar.replaceChildren(...cuts.map((c) => h('button.btn.cut', { type: 'button', onClick: () => this.enterCutaway(c.id) }, '◧ ', tx(c.name))));
  }
  async enterCutaway(id) {
    this.stopTour(); this.closeDetail(); this.inCut = id; this.el.classList.add('in-cut');
    await this.host.enterCutaway(id); this.cutBar.classList.remove('hidden');
    const c = this.desc.cutaways.find((x) => x.id === id);
    this.cutBar.replaceChildren(h('button.btn.cut.primary', { type: 'button', onClick: () => this.exitCutaway() }, '✕ ', t('scene.exitCut')), h('span.cut-name', null, tx(c.name)), h('small.cut-note', { i18n: 'scene.cutNote' }));
  }
  async exitCutaway() { await this.host.exitCutaway(); this.inCut = null; this.el.classList.remove('in-cut'); this.setAtmos(this.atmos); this.renderCutaways(); }
  renderDetail() {
    const { content, loc, sel } = this; const sp = settings().spoilers;
    this.panel.classList.toggle('empty', false);
    if (!sel) {
      const srcRows = (content.sources || []).map((s) => h('li', null, h('b', null, tx(SOURCES[s.ref]?.title) || s.ref), h('small', null, tx(CHECKED[s.checked]), s.note ? ' — ' + tx(s.note) : '')));
      this.panel.replaceChildren(
        h('button.icon-btn.panel-min', { type: 'button', 'aria-label': t('panel.toggle'), 'aria-expanded': String(!this.min), onClick: (e) => { this.min = !this.min; this.panel.classList.toggle('min', this.min); e.currentTarget.setAttribute('aria-expanded', String(!this.min)); } }, '⌄'),
        h('div.detail-head', null, h('div.kicker', null, t('kind.' + loc.kind)), h('h2', null, tx(loc.names)), h('div.alt', null, getLang() === 'en' ? loc.names.zh : loc.names.en)),
        h('p.lead', null, tx(content.intro)),
        h('div.tip', null, h('strong', { i18n: 'scene.tip.t' }), ' ', h('span', { i18n: 'scene.tip' })),
        h('details.src', null, h('summary', { i18n: 'scene.sources' }), h('div.src-block', null, h('p', null, tx(content.notes)), h('ul.src-list', null, srcRows), h('p.depth-note', null, t('depth.' + loc.depth)))));
      this.panel.classList.add('overview'); this.panel.classList.toggle('min', !!this.min); return;
    }
    this.panel.classList.remove('overview', 'min');
    const lm = content.landmarks[sel];
    this.panel.replaceChildren(
      h('button.icon-btn.panel-x', { type: 'button', 'aria-label': t('common.close'), onClick: () => this.closeDetail() }, '✕'),
      h('div.detail-head', null, h('div.kicker', null, tx(loc.names)), h('h2', null, tx(lm.name)), h('div.alt', null, getLang() === 'en' ? lm.name.zh : lm.name.en)),
      h('p.lead', null, tx(lm.desc)),
      sp && lm.spoiler ? h('div.spoiler', null, h('strong', null, t('spoiler.label')), h('p', null, tx(lm.spoiler))) : null,
      h('details.src', { open: true }, h('summary', { i18n: 'scene.sources' }), sourceBlock(lm, content)));
  }
  refreshLang() { this.renderAll(); if (this.touring) this.onTourStep(this.host.tour?.i ?? 0, this.host.tour?.ids[this.host.tour?.i ?? 0], this.host.tour?.ids.length || 0); }
  destroy() { this.host.stopTour(); this.el.remove(); }
}
