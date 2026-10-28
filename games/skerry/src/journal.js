// The island journal: achievements kept across games, plus lifetime totals.

const STORE = 'skerry.journal';

export const ENTRIES = [
  { id: 'snug', icon: '🟩', name: 'Snug as a sheep', text: 'Make a snug fit.' },
  { id: 'perfect', icon: '⭐', name: 'Perfect fit', text: 'Match every side of a tile with three or more neighbours.' },
  { id: 'streak3', icon: '🔥', name: 'On a roll', text: 'Make three good fits in a row.' },
  { id: 'streak6', icon: '🌟', name: 'Unbroken', text: 'Make six good fits in a row.' },
  { id: 'streak10', icon: '💫', name: 'Spring tide', text: 'Make ten good fits in a row.' },
  { id: 'request', icon: '🚩', name: 'Obliging', text: 'Meet a request.' },
  { id: 'request3', icon: '🎏', name: 'Good neighbour', text: 'Meet three requests in one game.' },
  { id: 'request5', icon: '🏅', name: 'Pillar of the isle', text: 'Meet five requests in one game.' },
  { id: 'seal', icon: '🔒', name: 'Sealed', text: 'Seal off an area of four or more tiles.' },
  { id: 'seal3', icon: '🧱', name: 'Dry-stone walls', text: 'Seal off three areas in one game.' },
  { id: 'woods', icon: '🌲', name: 'Deep woods', text: 'Grow a forest across 10 tiles.' },
  { id: 'lake', icon: '🌊', name: 'Still waters', text: 'Grow a lake across 5 tiles.' },
  { id: 'town', icon: '🏘️', name: 'Market town', text: 'Grow a village across 7 tiles.' },
  { id: 'fields', icon: '🌾', name: 'Breadbasket', text: 'Grow a field across 8 tiles.' },
  { id: 'holm', icon: '🐧', name: 'Holm', text: 'Raise your island to a holm.' },
  { id: 'isle', icon: '⛵', name: 'Isle', text: 'Raise your island to an isle.' },
  { id: 'arch', icon: '🐋', name: 'Archipelago', text: 'Raise your island to an archipelago.' },
  { id: 'kingdom', icon: '🌌', name: 'Kingdom', text: 'Raise your island to a kingdom of isles.' },
  { id: 'hopper', icon: '🧭', name: 'Island hopper', text: 'Finish one of every kind of isle.' },
  { id: 'long', icon: '☀️', name: 'Long summer', text: 'Place 50 tiles in one game.' },
  { id: 'regular', icon: '📅', name: 'Regular', text: 'Finish daily isles on three different days.' },
  { id: 'week', icon: '🗓️', name: 'Faithful', text: 'Keep a daily streak going for seven days.' },
];

const REGION_GOALS = [['woods', 'forest', 10], ['lake', 'water', 5], ['town', 'village', 7], ['fields', 'field', 8]];

export function load() {
  try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; }
}
function save(j) { localStorage.setItem(STORE, JSON.stringify(j)); }

export function unlockedCount() {
  const j = load();
  return ENTRIES.filter((e) => j[e.id]).length;
}

// Check a board after a placement; returns entries unlocked just now.
export function check(board) {
  const j = load();
  const got = [];
  const give = (id) => { if (!j[id]) { j[id] = Date.now(); got.push(ENTRIES.find((e) => e.id === id)); } };
  if (board.stats.snug) give('snug');
  if (board.stats.perfect) give('perfect');
  if (board.bestStreak >= 3) give('streak3');
  if (board.bestStreak >= 6) give('streak6');
  if (board.bestStreak >= 10) give('streak10');
  if (board.stats.questsDone) give('request');
  if (board.stats.questsDone >= 3) give('request3');
  if (board.stats.questsDone >= 5) give('request5');
  if (board.stats.closed) give('seal');
  if (board.stats.closed >= 3) give('seal3');
  if (board.rank >= 2) give('holm');
  if (board.rank >= 3) give('isle');
  if (board.rank >= 4) give('arch');
  if (board.rank >= 7) give('kingdom');
  if (board.stats.placed >= 50) give('long');
  const biggest = {};
  for (const reg of board.regions.values()) biggest[reg.terrain] = Math.max(biggest[reg.terrain] || 0, reg.tiles.size);
  for (const [id, terrain, n] of REGION_GOALS) if ((biggest[terrain] || 0) >= n) give(id);
  if (got.length) save(j);
  return got;
}

export function recordDaily(dayKey) {
  const j = load();
  j.days = j.days || [];
  if (!j.days.includes(dayKey)) j.days.push(dayKey);
  const got = [];
  if (j.days.length >= 3 && !j.regular) { j.regular = Date.now(); got.push(ENTRIES.find((e) => e.id === 'regular')); }
  save(j);
  return got;
}

// The day streak itself is kept by the game; this just notices a week of it.
export function recordStreak(days) {
  const j = load();
  if (days < 7 || j.week) return [];
  j.week = Date.now();
  save(j);
  return [ENTRIES.find((e) => e.id === 'week')];
}

// Returns entries unlocked by finishing this game (only the isle-type tour, for now).
export function recordGame(board, typeCount) {
  const j = load();
  j.games = (j.games || 0) + 1;
  j.tiles = (j.tiles || 0) + board.stats.placed;
  j.types = j.types || [];
  if (!j.types.includes(board.type.id)) j.types.push(board.type.id);
  const got = [];
  if (j.types.length >= typeCount && !j.hopper) { j.hopper = Date.now(); got.push(ENTRIES.find((e) => e.id === 'hopper')); }
  save(j);
  return got;
}

export function lifetime() {
  const j = load();
  return { games: j.games || 0, tiles: j.tiles || 0 };
}
