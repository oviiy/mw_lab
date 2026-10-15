/* global echarts */
import { getLang } from './i18n.js';
const live = new Set();
const cleanups = [];
export const PALETTE = ['#7a2e1f', '#a8833a', '#4f6b3a', '#3f5e86', '#6e4b7a', '#2b2118', '#b5651d', '#8c9a6b', '#5e7f7a', '#c2a15a', '#7e6a55', '#a26b5b', '#4a3b2c'];
const BASE = {
  color: PALETTE,
  textStyle: { fontFamily: '"EB Garamond", "Noto Serif SC", Georgia, serif', color: '#4a3b2c', fontSize: 13 },
  tooltip: { backgroundColor: '#f8f1e1', borderColor: '#c8b48a', borderWidth: 1, padding: [8, 12], textStyle: { color: '#2b2118', fontSize: 13 }, extraCssText: 'border-radius:6px;box-shadow:0 12px 30px -12px rgba(58,42,30,.5)' },
};
export function colorFor(key) {
  let h = 0;
  for (const ch of String(key)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
// One theme for every chart: readable axis text (12px, ink) and gridlines that don't compete with the data.
const AXIS = { axisLabel: { fontSize: 12, color: '#4a3b2c' }, nameTextStyle: { fontSize: 12, color: '#4a3b2c' },
               axisLine: { lineStyle: { color: '#b9a57d' } }, splitLine: { lineStyle: { color: '#e3d4b3' } } };
let themed = false;
function theme() {
  if (themed) return;
  echarts.registerTheme('parchment', { categoryAxis: AXIS, valueAxis: AXIS, timeAxis: AXIS, logAxis: AXIS,
                                       legend: { textStyle: { fontSize: 13, color: '#4a3b2c' } } });
  themed = true;
}
export function mount(node, option) {
  theme();
  const c = echarts.init(node, 'parchment', { renderer: 'canvas', locale: getLang() === 'zh' ? 'ZH' : 'EN' });
  c.setOption({ ...BASE, ...option, tooltip: { ...BASE.tooltip, ...(option.tooltip || {}) } });
  live.add(c);
  return c;
}
export function onCleanup(fn) { cleanups.push(fn); }
export function disposeAll() {
  while (cleanups.length) cleanups.pop()();
  for (const c of live) c.dispose();
  live.clear();
}
window.addEventListener('resize', () => { for (const c of live) c.resize(); });

// Mean line with a shaded lo–hi band: an invisible base line at `lo` plus a stacked area of (hi − lo).
let bandSeq = 0;
export function bandSeries(name, x, ev, color, withBand = true) {
  const id = `band${bandSeq++}`;   // not derived from the name: Chinese names would strip to ''
  const out = [];
  if (withBand) {
    out.push({ name: `${name}-lo`, type: 'line', data: ev.lo, stack: id, stackStrategy: 'all', symbol: 'none', lineStyle: { opacity: 0 }, tooltip: { show: false }, silent: true });
    out.push({ name: `${name}-band`, type: 'line', data: ev.hi.map((h, i) => (h == null || ev.lo[i] == null ? null : h - ev.lo[i])), stack: id, stackStrategy: 'all',
               symbol: 'none', lineStyle: { opacity: 0 }, areaStyle: { color, opacity: 0.14 }, tooltip: { show: false }, silent: true });
  }
  out.push({ name, type: 'line', data: ev.mean, symbol: 'none', lineStyle: { color, width: 2.2 }, itemStyle: { color } });
  return out;
}
