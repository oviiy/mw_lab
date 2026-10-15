import { loadJSON, el } from './core.js';
import { parseRoute, search, quarterLabel } from './calc.js';
import { disposeAll } from './charts.js';
import { t, getLang, setLang } from './i18n.js';
import * as home from './page-home.js';
import * as manager from './page-manager.js';
import * as stock from './page-stock.js';
import * as methods from './page-methods.js';
import * as congress from './page-congress.js';
import * as member from './page-member.js';
import * as managers from './page-managers.js';
import * as players from './page-players.js';
import * as insiders from './page-insiders.js';
import * as insider from './page-insider.js';

const PAGES = { home, manager, stock, methods, congress, member, managers, players, insiders, insider };
const app = document.getElementById('app');
let meta = null;

function errorCard(e) {
  return el('div', { class: 'card error' }, el('h3', {}, t('err.title')), el('p', {}, String(e?.message || e)), el('a', { href: '#/' }, t('err.back')));
}

function renderChrome() {
  document.documentElement.lang = getLang() === 'zh' ? 'zh-CN' : 'en';
  for (const n of document.querySelectorAll('[data-i18n]')) n.textContent = t(n.dataset.i18n);
  const [a, b] = getLang() === 'zh' ? ['钱', '迹'] : ['Money ', 'Trail'];
  document.querySelector('.brand-name').replaceChildren(a, el('span', {}, b));
  document.title = t('title');
  document.getElementById('q').placeholder = t('search.placeholder');
  document.getElementById('lang').textContent = getLang() === 'zh' ? 'EN' : '中文';
  if (meta) document.getElementById('asof').textContent = t('foot.asof', { q: quarterLabel(meta.latest_period), d: meta.generated_at.slice(0, 10) });
}

async function route({ keepScroll = false } = {}) {
  disposeAll();
  const { page, params } = parseRoute(location.hash);
  const y = window.scrollY;
  app.replaceChildren(el('div', { class: 'empty' }, t('loading')));
  try {
    if (page === 'notfound') throw new Error(t('err.notfound'));
    const frag = el('div');
    // Pages pass optional sections as arrays or null; native append would print them as "[object …]" / "null".
    frag.append = (...kids) => Element.prototype.append.apply(frag, kids.flat(Infinity).filter(k => k != null && k !== false));
    app.replaceChildren(frag);
    await PAGES[page].render(frag, params, { meta });
  } catch (e) {
    console.error(e);
    disposeAll();
    app.replaceChildren(errorCard(e));
  }
  window.scrollTo(0, keepScroll ? y : 0);
}

function wireSearch() {
  const q = document.getElementById('q'), box = document.getElementById('qres');
  let items = [], active = 0;
  const close = () => { box.hidden = true; };
  const draw = () => {
    items = search(meta, q.value);
    active = 0;
    box.replaceChildren(...items.map((it, i) => el('a', { href: it.href, class: i === 0 ? 'active' : null, onclick: () => { q.value = ''; close(); } },
      el('span', { class: it.type === 'stock' ? 'mono' : null }, it.label), el('span', { class: 'tag' }, it.type === 'manager' ? `${t('search.manager')} · ${it.tag}` : it.tag))));
    if (q.value.trim() && !items.length) box.replaceChildren(el('div', { class: 'empty' }, t('search.none')));
    box.hidden = !q.value.trim();
  };
  q.addEventListener('input', draw);
  q.addEventListener('keydown', e => {
    if (e.key === 'Escape') { close(); q.blur(); }
    if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      active = (active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
      [...box.children].forEach((c, i) => c.classList.toggle('active', i === active));
    }
    if (e.key === 'Enter') { location.hash = items[active].href; q.value = ''; close(); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) close(); });
}

async function boot() {
  renderChrome();
  document.getElementById('lang').addEventListener('click', () => {
    setLang(getLang() === 'zh' ? 'en' : 'zh');
    renderChrome();
    if (meta) route({ keepScroll: true });
  });
  try {
    meta = await loadJSON('data/meta.json');
  } catch (e) {
    app.replaceChildren(errorCard(new Error(t('err.nometa'))));
    return;
  }
  renderChrome();
  wireSearch();
  window.addEventListener('hashchange', () => route());
  route();
}
boot();
