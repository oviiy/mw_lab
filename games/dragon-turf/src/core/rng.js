// Mulberry32. A seeded generator keeps the city identical between sessions;
// gameplay randomness uses the shared `rand` instance below.
export class Rng {
  constructor(seed = 1) { this.s = seed >>> 0; }
  next() {
    this.s = (this.s + 0x6D2B79F5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a, b) { return a + this.next() * (b - a); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  chance(p) { return this.next() < p; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  sign() { return this.next() < 0.5 ? -1 : 1; }
  gauss() { return (this.next() + this.next() + this.next() - 1.5) / 1.5; }
  // items: [[value, weight], ...]
  weighted(items) {
    let total = 0; for (const it of items) total += it[1];
    let r = this.next() * total;
    for (const it of items) { r -= it[1]; if (r <= 0) return it[0]; }
    return items[items.length - 1][0];
  }
  shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
}
export const rand = new Rng((Math.random() * 2 ** 31) | 0);
