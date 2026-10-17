import { t } from '../i18n/index.js';

/** Hyperscript. h('button.btn.primary', {onClick, 'aria-label': ''}, 'text' | node | [..]) ; use {i18n:'key'} for translatable text. */
export function h(tag, props, ...kids) {
  const m = /^([\w-]*)(?:#([\w-]+))?((?:\.[\w-]+)*)$/.exec(tag) || [];
  const el = document.createElement(m[1] || 'div');
  if (m[2]) el.id = m[2];
  if (m[3]) el.className = m[3].slice(1).replaceAll('.', ' ');
  for (const k in props || {}) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className += ' ' + v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'i18n') el.dataset.i18n = v;
    else if (k === 'i18nAttrs') el.dataset.i18nAttrs = v; // "aria-label:key,title:key2"
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  if (el.dataset.i18n && !el.childNodes.length) el.textContent = t(el.dataset.i18n);
  return el;
}
/** Re-apply translations for all [data-i18n] / [data-i18n-attrs] beneath root. */
export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-attrs]').forEach((el) => {
    for (const pair of el.dataset.i18nAttrs.split(',')) { const [a, k] = pair.split(':'); el.setAttribute(a.trim(), t(k.trim())); }
  });
}
// replaceChildren() would stringify null/false into the text "null"/"false"; our render code uses `cond ? node : null` freely.
const _rc = Element.prototype.replaceChildren;
Element.prototype.replaceChildren = function (...nodes) { return _rc.apply(this, nodes.flat().filter((n) => n != null && n !== false)); };
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Visually hidden live region for screen-reader announcements. */
let live;
export function announce(msg) {
  if (!live) { live = h('div', { class: 'sr-only', 'aria-live': 'polite', role: 'status' }); document.body.append(live); }
  live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 30);
}
/** Minimal modal helper with focus trap + Esc. */
export function modal({ title, body, onClose, wide = false, labelledBy }) {
  const prev = document.activeElement;
  const close = () => { overlay.remove(); document.removeEventListener('keydown', key, true); prev?.focus?.(); onClose?.(); };
  const key = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    if (e.key === 'Tab') { const f = $$('button, [href], input, select, [tabindex]:not([tabindex="-1"])', box).filter((x) => !x.disabled); if (!f.length) return; const i = f.indexOf(document.activeElement); if (e.shiftKey && (i <= 0)) { f.at(-1).focus(); e.preventDefault(); } else if (!e.shiftKey && i === f.length - 1) { f[0].focus(); e.preventDefault(); } }
  };
  const closeBtn = h('button.icon-btn.modal-x', { type: 'button', 'aria-label': t('common.close'), 'data-i18n-attrs': 'aria-label:common.close', onClick: close }, '✕');
  const box = h('div.modal' + (wide ? '.wide' : ''), { role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, h('header.modal-head', null, h('h2', null, title), closeBtn), h('div.modal-body', null, body));
  const overlay = h('div.modal-overlay', { onClick: (e) => { if (e.target === overlay) close(); } }, box);
  document.body.append(overlay); document.addEventListener('keydown', key, true);
  setTimeout(() => closeBtn.focus(), 30);
  return { close, box };
}
