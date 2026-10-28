// Seeded randomness so a given isle (daily or shared) always deals the same tiles.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const DAY0 = Date.UTC(2026, 9, 1);

// Daily isle numbering starts at #1 on 2026-10-01, in the player's local calendar.
export function dailyByNumber(n) {
  const d = new Date(DAY0 + (n - 1) * 86400000);
  return dailyInfo(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function dailyInfo(date = new Date()) {
  const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
  const number = Math.floor((Date.UTC(y, m, d) - DAY0) / 86400000) + 1;
  const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return { number, key, seed: hashString('skerry-daily-' + key) };
}
