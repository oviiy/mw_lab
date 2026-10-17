// Persisted visitor settings (localStorage, with safe fallback).
const KEY = 'atlas.settings.v1';
const defaults = () => ({ quality: 'auto', spoilers: false, reduced: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, labels: true, routes: false });
let state = null; const subs = new Set();
export function settings() { if (!state) { try { state = { ...defaults(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { state = defaults(); } } return state; }
export function setSetting(k, v) { settings()[k] = v; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } subs.forEach((f) => f(k, v)); }
export function onSetting(fn) { subs.add(fn); return () => subs.delete(fn); }
export function resolveQuality() {
  const forced = new URLSearchParams(location.search).get('q'); if (forced === 'low' || forced === 'medium' || forced === 'high') return forced;
  const q = settings().quality; if (q !== 'auto') return q;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches, small = Math.min(innerWidth, innerHeight) < 700;
  const mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
  if ((coarse && small) || mem <= 2 || cores <= 2) return 'low';
  return coarse || mem <= 4 ? 'medium' : 'high';
}
export function webglOK() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }
