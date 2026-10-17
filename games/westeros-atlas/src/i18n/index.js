// Tiny structured i18n: UI strings live in strings.en.js / strings.zh.js; place content has {en, zh} pairs.
import { EN } from './strings.en.js';
import { ZH } from './strings.zh.js';

const TABLES = { en: EN, zh: ZH };
const subs = new Set();
let lang = 'en';

export function detectLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'zh') return q;
  try { const s = localStorage.getItem('atlas.lang'); if (s === 'en' || s === 'zh') return s; } catch { /* storage blocked */ }
  return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
}
export function getLang() { return lang; }
export function setLang(l) {
  if (l !== 'en' && l !== 'zh') return;
  lang = l;
  try { localStorage.setItem('atlas.lang', l); } catch { /* ignore */ }
  document.documentElement.lang = l === 'zh' ? 'zh-Hans' : 'en';
  document.documentElement.dataset.lang = l;
  subs.forEach((fn) => fn(l));
}
export function onLang(fn) { subs.add(fn); return () => subs.delete(fn); }

/** UI string by key with {param} interpolation. Falls back to English, then the key. */
export function t(key, params) {
  let s = TABLES[lang][key] ?? TABLES.en[key] ?? key;
  if (params) for (const k in params) s = s.replaceAll(`{${k}}`, params[k]);
  return s;
}
/** Pick from a {en, zh} pair. */
export function tx(pair) { if (!pair) return ''; return pair[lang] ?? pair.en ?? ''; }
export const L = (pair, l = lang) => (pair ? pair[l] ?? pair.en ?? '' : '');

/** Locale-friendly normalisation for search: lowercase, strip diacritics/punctuation/spaces. */
export function norm(s) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’`´.\-·•\s,]/g, '');
}
