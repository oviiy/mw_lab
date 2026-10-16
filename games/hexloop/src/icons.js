// Inline SVG icons (24×24 viewBox). currentColor so CSS can tint them.
const svg = (body, vb = '0 0 24 24') => `<svg viewBox="${vb}" aria-hidden="true">${body}</svg>`;
const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const MOD_ICON = {
  tail: svg(`<path ${S} d="M3 16c3 0 3-8 6-8s3 8 6 8 3-8 6-8"/>`),
  chain: svg(`<path ${S} d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>`),
  overclock: svg(`<path ${S} d="M5 6l6 6-6 6M13 6l6 6-6 6"/>`),
  thorns: svg(`<path ${S} d="M12 3l2 4 4-2-2 4 4 2-4 2 2 4-4-2-2 4-2-4-4 2 2-4-4-2 4-2-2-4 4 2z"/>`),
  aegis: svg(`<path ${S} d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>`),
  siphon: svg(`<path ${S} d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path ${S} d="M12 9v5M9.5 11.5h5"/>`),
  secondwind: svg(`<path ${S} d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5"/>`),
  strike: svg(`<path fill="currentColor" d="M13 2 4 14h6l-1 8 9-12h-6z"/>`),
  bigheart: svg(`<path fill="currentColor" d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/><path stroke="#1a1204" stroke-width="2" d="M12 8v6M9 11h6"/>`),
  magnet: svg(`<path ${S} d="M6 4v8a6 6 0 0 0 12 0V4"/><path ${S} d="M6 8h3M15 8h3"/>`),
  bounty: svg(`<circle cx="12" cy="12" r="8" ${S}/><path ${S} d="M12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.7 2.5 1.8-1.2 1.6-2.5 1.9-2.5.8-2.5 1.9 1 1.9 2.5 1.9 2.5-.6 2.5-1.6"/>`),
  thrift: svg(`<path fill="currentColor" d="M12 2l5 10-5 10-5-10z"/><path ${S} d="M4 12h3M17 12h3"/>`),
  rewind: svg(`<path ${S} d="M11 5 4 12l7 7M20 5l-7 7 7 7"/>`),
  steady: svg(`<path ${S} d="M4 12h6M14 12h6M12 4v4M12 16v4"/><circle cx="12" cy="12" r="2" fill="currentColor"/>`),
  frost: svg(`<path ${S} d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17M12 2l-2 2M12 2l2 2M12 22l-2-2M12 22l2-2"/>`),
  hunter: svg(`<path ${S} d="M5 19 19 5M14 5h5v5"/><path ${S} d="M5 14v5h5"/>`),
  momentum: svg(`<path ${S} d="M3 17l5-5 4 4 8-8"/><path ${S} d="M15 8h5v5"/>`),
  nova: svg(`<circle cx="12" cy="12" r="4" fill="currentColor"/><path ${S} d="M12 1v4M12 19v4M1 12h4M19 12h4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M4.2 19.8 7 17M17 7l2.8-2.8"/>`),
  phoenix: svg(`<path fill="currentColor" d="M12 2c2 3 6 5 6 10a6 6 0 0 1-3 5l2 5-5-3-5 3 2-5a6 6 0 0 1-3-5c0-5 4-7 6-10z"/>`),
  infinity: svg(`<path ${S} d="M7 9a3 3 0 1 0 0 6c3 0 7-6 10-6a3 3 0 1 1 0 6c-3 0-7-6-10-6z"/>`),
  stasis: svg(`<circle cx="12" cy="12" r="9" ${S}/><path ${S} d="M12 7v5l-3 3"/><path ${S} d="M3 3l18 18"/>`),
  midas: svg(`<path fill="currentColor" d="M5 9h14l-2 11H7z"/><path ${S} d="M8 9V6a4 4 0 0 1 8 0v3"/>`),
  repair: svg(`<path fill="currentColor" d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>`),
};
export const ENEMY_ICON = {
  drone: svg(`<path fill="currentColor" d="M12 3l7 9-7 9-7-9z"/><circle cx="15" cy="12" r="2" fill="#fff"/><path ${S} d="M2 12h3M19 12h3"/>`),
  lancer: svg(`<path fill="currentColor" d="M12 2l3 16H9z"/><path ${S} d="M6 21h12"/><path stroke="#fff" stroke-width="1.5" stroke-dasharray="2 2" d="M15 6h8"/>`),
  brute: svg(`<path fill="currentColor" d="M7 8h10l3 5-3 5H7l-3-5z"/><path ${S} d="M12 3v3M3 9 1 7M21 9l2-2M3 17l-2 2M21 17l2 2M12 21v-1"/>`),
  eater: svg(`<path fill="currentColor" d="M12 3a9 9 0 1 0 8.5 12L12 12l8.5-3A9 9 0 0 0 12 3z"/><circle cx="12" cy="7.5" r="1.4" fill="#fff"/>`),
  mite: svg(`<path fill="currentColor" d="M12 6l6 11H6z"/>`),
  splitter: svg(`<path fill="currentColor" d="M12 2l6 8H6zM6 14h12l-6 8z"/>`),
  bomber: svg(`<circle cx="12" cy="14" r="7" fill="currentColor"/><path ${S} d="M15 7l2-3M18 3l1 1"/>`),
  warden: svg(`<path fill="currentColor" d="M12 1l5 11-5 11-5-11z"/><ellipse cx="12" cy="12" rx="10" ry="3" ${S}/>`),
  colossus: svg(`<rect x="7" y="3" width="10" height="6" rx="1" fill="currentColor"/><rect x="5" y="10" width="14" height="8" rx="1" fill="currentColor"/><path ${S} d="M8 18v4M16 18v4"/>`),
  hive: svg(`<path fill="currentColor" d="M12 4l6 3.5v7L12 18l-6-3.5v-7z"/><path ${S} d="M12 1v2M21 6l-2 1M21 18l-2-1M12 23v-2M3 18l2-1M3 6l2 1"/>`),
};
export const UI_ICON = {
  pause: svg(`<rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/>`),
  undo: svg(`<path ${S} d="M9 14 4 9l5-5"/><path ${S} d="M4 9h10a6 6 0 0 1 0 12h-3"/>`),
  wait: svg(`<circle cx="12" cy="12" r="8" ${S}/><path ${S} d="M12 8v4l3 2"/>`),
  gear: svg(`<circle cx="12" cy="12" r="3" ${S}/><path ${S} d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>`),
  calendar: svg(`<rect x="3" y="5" width="18" height="16" rx="3" ${S}/><path ${S} d="M3 10h18M8 3v4M16 3v4"/>`),
  core: svg(`<path ${S} d="M12 2l8.7 5v10L12 22l-8.7-5V7z"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>`),
  play: svg(`<path fill="currentColor" d="M8 5v14l11-7z"/>`),
  flame: svg(`<path fill="currentColor" d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3 0-6 1-9z"/>`),
  book: svg(`<path ${S} d="M4 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H4zM20 4h-6"/><path ${S} d="M20 4v14h-6"/>`),
  shard: svg(`<path fill="currentColor" d="M12 2l5 10-5 10-5-10z"/>`),
};
export const hexPip = (on) => `<svg viewBox="0 0 20 22" class="pip ${on ? 'on' : ''}"><path d="M10 1.5l7.8 4.5v9L10 19.5 2.2 15V6z"/></svg>`;
