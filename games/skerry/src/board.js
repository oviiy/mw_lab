import { mulberry32 } from './rng.js';
import { DIRS, key } from './hex.js';
import { makeTile, rotatedEdges, QUEST_EXTRA } from './tiles.js';

export const START_TILES = 28;
export const QUEST_REWARD = 3;
export const MATCH_POINTS = 10;
export const CLOSE_MIN = 4; // an area this big earns a bonus when it's sealed off
export const CLOSE_POINTS = 10; // per tile in the sealed area

export const STREAK_STEP = 0.25; // each snug/perfect fit in a row adds this much to the next one's multiplier
export const STREAK_MAX = 4;
export const RANK_TILES = 2; // tiles granted each time the island reaches a new rank

// Island ranks double as in-game milestones: each one reached grants tiles and changes the world.
export const RANKS = [
  { min: 0, name: 'Rock', phrase: 'a bare rock' },
  { min: 250, name: 'Skerry', phrase: 'a skerry', event: 'puffins' },
  { min: 600, name: 'Holm', phrase: 'a holm', event: 'lighthouse' },
  { min: 1300, name: 'Isle', phrase: 'an isle', event: 'boats' },
  { min: 2400, name: 'Archipelago', phrase: 'an archipelago', event: 'whales' },
  // Beyond the first game: tuned so steady, greedy play reaches Kingdom in roughly one game in eight.
  { min: 3100, name: 'Haven', phrase: 'a haven', event: 'seals' },
  { min: 3800, name: 'Seaport', phrase: 'a seaport', event: 'harbour' },
  { min: 4500, name: 'Kingdom', phrase: 'a kingdom of isles', event: 'aurora' },
];
export function rankIndex(score) {
  let i = 0;
  while (i + 1 < RANKS.length && score >= RANKS[i + 1].min) i++;
  return i;
}

// Every isle has a type, fixed by its seed (so a daily is the same type for everyone):
// a lean in the tile mix and one rule of its own. Missing fields fall back to the usual rules.
export const ISLE_TYPES = [
  { id: 'lake', name: 'Lake isle', icon: '🌊', text: 'More lakes, and every lake side that matches scores 20.', boost: { water: 2.2 }, matchPoints: { water: 20 } },
  { id: 'wild', name: 'Wild isle', icon: '🌲', text: 'Forest everywhere. Sealing off a forest pays 20 a tile.', boost: { forest: 1.6 }, closePoints: { forest: 20 } },
  { id: 'market', name: 'Market isle', icon: '🏘️', text: 'Busy villages. Requests come more often and pay 15 points a tile.', boost: { village: 1.8 }, questChance: 0.34, questPoints: 15 },
  { id: 'tidal', name: 'Tidal isle', icon: '🌀', text: 'Streaks run higher, up to ×2.5.', streakMax: 6 },
  { id: 'rugged', name: 'Rugged isle', icon: '🪨', text: 'Four fewer tiles to start, but a perfect fit scores 20 a side.', startTiles: -4, perfectPoints: 20 },
];
export function isleTypeFor(seed) {
  return ISLE_TYPES[Math.floor(mulberry32((seed ^ 0x1517e) >>> 0)() * ISLE_TYPES.length)];
}

const STARTER = { edges: ['meadow', 'meadow', 'forest', 'forest', 'village', 'meadow'], quest: null, seed: 7, id: 0 };

// Game state: placed cells, terrain regions (union-find over the six wedges of
// every tile) and requests. Knows nothing about rendering.
export class Board {
  constructor(seed, { startTiles = START_TILES, type = null } = {}) {
    this.type = type ? ISLE_TYPES.find((t) => t.id === type) : isleTypeFor(seed);
    this.streakMax = this.type.streakMax || STREAK_MAX;
    this.questReward = this.type.questReward || QUEST_REWARD;
    this.rng = mulberry32(seed);
    this.cells = new Map();
    this.parent = [];
    this.regions = new Map(); // root -> { terrain, tiles:Set<key>, open }
    this.quests = [];
    this.questId = 0;
    this.score = 0;
    this.remaining = startTiles + (this.type.startTiles || 0);
    this.stats = { placed: 0, perfect: 0, snug: 0, questsDone: 0, questsFailed: 0, matches: 0, discarded: 0, closed: 0 };
    this.log = []; // one entry per placement: 'perfect' | 'snug' | 'match' | 'none'
    this.closedRoots = new Set();
    this.streak = 0; // snug or perfect fits in a row
    this.bestStreak = 0;
    this.rank = 0;
    this.queue = [];
    this.drawn = 0;
    this.over = false;
    this.insert(0, 0, STARTER, 0);
    this.fill();
  }

  get current() { return this.queue[0] || null; }
  get next() { return this.queue[1] || null; }

  find(a) {
    let r = a;
    while (this.parent[r] !== r) r = this.parent[r];
    while (this.parent[a] !== r) { const n = this.parent[a]; this.parent[a] = r; a = n; }
    return r;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return;
    let A = this.regions.get(ra), B = this.regions.get(rb);
    if (A.tiles.size < B.tiles.size) { [ra, rb] = [rb, ra]; [A, B] = [B, A]; }
    this.parent[rb] = ra;
    for (const t of B.tiles) A.tiles.add(t);
    A.open += B.open;
    this.regions.delete(rb);
  }

  regionOfWedge(w) { return this.regions.get(this.find(w)); }

  insert(q, r, tile, rot) {
    const edges = rotatedEdges(tile.edges, rot);
    const k = key(q, r);
    const cell = { q, r, k, tile, rot, edges, wedges: [] };
    this.cells.set(k, cell);
    for (let i = 0; i < 6; i++) {
      const id = this.parent.length;
      this.parent.push(id);
      this.regions.set(id, { terrain: edges[i], tiles: new Set([k]), open: 0 });
      cell.wedges.push(id);
    }
    for (let i = 0; i < 6; i++) {
      if (edges[i] === edges[(i + 1) % 6]) this.union(cell.wedges[i], cell.wedges[(i + 1) % 6]);
    }
    for (let i = 0; i < 6; i++) {
      const [dq, dr] = DIRS[i];
      const nb = this.cells.get(key(q + dq, r + dr));
      const w = cell.wedges[i];
      if (!nb) { this.regionOfWedge(w).open++; continue; }
      const j = (i + 3) % 6;
      this.regionOfWedge(nb.wedges[j]).open--;
      if (nb.edges[j] === edges[i]) this.union(w, nb.wedges[j]);
    }
    this._frontier = null;
    return cell;
  }

  frontier() {
    if (this._frontier) return this._frontier;
    const f = new Map();
    for (const c of this.cells.values()) {
      for (const [dq, dr] of DIRS) {
        const k = key(c.q + dq, c.r + dr);
        if (!this.cells.has(k) && !f.has(k)) f.set(k, { q: c.q + dq, r: c.r + dr, k });
      }
    }
    return (this._frontier = f);
  }

  evaluate(q, r, rot, tile = this.current) {
    if (!tile || this.cells.has(key(q, r))) return { valid: false, n: 0, m: 0, marks: [null, null, null, null, null, null] };
    const edges = rotatedEdges(tile.edges, rot);
    const marks = new Array(6).fill(null);
    let n = 0, m = 0, matchPts = 0, conflict = false;
    for (let i = 0; i < 6; i++) {
      const [dq, dr] = DIRS[i];
      const nb = this.cells.get(key(q + dq, r + dr));
      if (!nb) continue;
      n++;
      const other = nb.edges[(i + 3) % 6];
      if (other === edges[i]) { m++; matchPts += (this.type.matchPoints || {})[other] || MATCH_POINTS; marks[i] = 'match'; }
      else if (other === 'water' || edges[i] === 'water') { conflict = true; marks[i] = 'conflict'; }
      else marks[i] = 'miss';
    }
    const valid = n > 0 && !conflict;
    // Perfect: three or more neighbours, all matched. Snug: both of exactly two neighbours matched.
    const perfect = valid && n >= 3 && m === n;
    const snug = valid && n === 2 && m === 2;
    const mult = perfect || snug ? 1 + STREAK_STEP * Math.min(this.streak, this.streakMax) : 1;
    const points = valid ? Math.round((matchPts + (perfect ? (this.type.perfectPoints || 10) * n : snug ? 10 : 0)) * mult) : 0;
    const bonusTiles = perfect ? 1 : 0;
    return { valid, n, m, marks, perfect, snug, points, bonusTiles, edges, mult };
  }

  place(q, r, rot) {
    if (this.over) return null;
    const ev = this.evaluate(q, r, rot);
    if (!ev.valid) return null;
    const tile = this.current;
    const cell = this.insert(q, r, tile, rot);
    this.score += ev.points;
    this.stats.placed++;
    this.stats.matches += ev.m;
    if (ev.perfect) this.stats.perfect++;
    if (ev.snug) this.stats.snug++;
    this.log.push(ev.perfect ? 'perfect' : ev.snug ? 'snug' : ev.m ? 'match' : 'none');
    // Snug and perfect fits build the streak; anything looser breaks it.
    this.streak = ev.perfect || ev.snug ? this.streak + 1 : 0;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    let gained = ev.bonusTiles;
    const out = { cell, points: ev.points, perfect: ev.perfect, snug: ev.snug, n: ev.n, m: ev.m, mult: ev.mult, streak: this.streak, bonusTiles: ev.bonusTiles, questsNew: [], questsDone: [], questsFailed: [], closed: [], rankUps: [] };

    // Areas this placement sealed off for good.
    for (const c of this.sealedBy(cell)) {
      this.closedRoots.add(c.root);
      this.score += c.points;
      this.stats.closed++;
      out.closed.push({ terrain: c.terrain, size: c.size, points: c.points, cellKey: cell.k });
    }

    if (tile.quest) {
      let best = null;
      for (let i = 0; i < 6; i++) {
        if (cell.edges[i] !== tile.quest.terrain) continue;
        const reg = this.regionOfWedge(cell.wedges[i]);
        if (reg.open > 0 && (!best || reg.tiles.size > best.size)) best = { w: cell.wedges[i], size: reg.tiles.size };
      }
      if (best) {
        const quest = { id: ++this.questId, terrain: tile.quest.terrain, anchor: best.w, cellKey: cell.k, target: best.size + tile.quest.extra, state: 'active' };
        this.quests.push(quest);
        out.questsNew.push(quest);
      } else {
        // Placed where its area is already sealed in: the request is lost straight away, and says so.
        const w = cell.wedges[cell.edges.indexOf(tile.quest.terrain)];
        const quest = { id: ++this.questId, terrain: tile.quest.terrain, anchor: w, cellKey: cell.k, target: this.regionOfWedge(w).tiles.size + tile.quest.extra, state: 'failed' };
        this.quests.push(quest);
        this.stats.questsFailed++;
        out.questsFailed.push(quest);
      }
    }

    for (const quest of this.quests) {
      if (quest.state !== 'active') continue;
      const reg = this.regionOfWedge(quest.anchor);
      if (reg.tiles.size >= quest.target) {
        quest.state = 'done';
        this.stats.questsDone++;
        gained += this.questReward;
        const pts = quest.target * (this.type.questPoints || 10);
        this.score += pts;
        out.questsDone.push({ quest, points: pts });
      } else if (reg.open <= 0) {
        quest.state = 'failed';
        this.stats.questsFailed++;
        out.questsFailed.push(quest);
      }
    }

    while (this.rank + 1 < RANKS.length && this.score >= RANKS[this.rank + 1].min) {
      this.rank++;
      gained += RANK_TILES;
      out.rankUps.push(RANKS[this.rank]);
    }

    out.gained = gained;
    this.remaining += gained - 1;
    this.queue.shift();
    this.fill();
    if (this.remaining <= 0) this.over = true;
    out.over = this.over;
    return out;
  }

  // Areas a freshly inserted cell has just sealed off (no open edges left, big enough to score).
  sealedBy(cell) {
    const touched = new Set(cell.wedges.map((w) => this.find(w)));
    for (let i = 0; i < 6; i++) {
      const [dq, dr] = DIRS[i];
      const nb = this.cells.get(key(cell.q + dq, cell.r + dr));
      if (nb) touched.add(this.find(nb.wedges[(i + 3) % 6]));
    }
    const out = [];
    for (const root of touched) {
      const reg = this.regions.get(root);
      if (!reg || reg.open > 0 || reg.tiles.size < CLOSE_MIN || this.closedRoots.has(root)) continue;
      out.push({ root, terrain: reg.terrain, size: reg.tiles.size, points: reg.tiles.size * ((this.type.closePoints || {})[reg.terrain] || CLOSE_POINTS) });
    }
    return out;
  }

  // What else a placement would do, worked out on a scratch copy of the terrain:
  // areas it would seal off (and their bonus) and requests it would close off unmet.
  outcome(q, r, rot, tile = this.current) {
    const out = { sealed: [], lost: [] };
    if (!tile || !this.evaluate(q, r, rot, tile).valid) return out;
    const b = Object.create(Board.prototype);
    b.type = this.type;
    b.cells = new Map(this.cells);
    b.parent = this.parent.slice();
    b.regions = new Map();
    for (const [root, reg] of this.regions) b.regions.set(root, { terrain: reg.terrain, tiles: new Set(reg.tiles), open: reg.open });
    b.closedRoots = this.closedRoots;
    const cell = b.insert(q, r, tile, rot);
    out.sealed = b.sealedBy(cell).map(({ terrain, size, points }) => ({ terrain, size, points }));
    for (const quest of this.activeQuests()) {
      const reg = b.regionOfWedge(quest.anchor);
      if (reg.tiles.size < quest.target && reg.open <= 0) out.lost.push(quest);
    }
    // a request tile dropped where its own land is already shut in
    if (tile.quest && !cell.edges.some((e, i) => e === tile.quest.terrain && b.regionOfWedge(cell.wedges[i]).open > 0)) {
      out.lost.push({ terrain: tile.quest.terrain, own: true });
    }
    return out;
  }

  questProgress(quest) {
    const reg = this.regionOfWedge(quest.anchor);
    return { size: reg.tiles.size, target: quest.target, open: reg.open };
  }

  activeQuests() { return this.quests.filter((q) => q.state === 'active'); }

  fill() {
    while (this.queue.length < Math.min(2, this.remaining)) this.queue.push(this.drawTile());
  }

  drawTile() {
    const idx = this.drawn++;
    const t = makeTile(this.rng, { noWater: idx < 3, boost: this.type.boost });
    t.id = idx + 1;
    // Always consume the same random numbers per tile, so the deal never depends on how the player plays.
    const rChance = this.rng(), rForce = this.rng(), rTerrain = this.rng(), rExtra = this.rng();
    const pending = this.activeQuests().length + this.queue.filter((x) => x.quest).length;
    if (idx >= 3 && pending < 3 && (rChance < (this.type.questChance || 0.22) || (pending === 0 && idx >= 4 && rForce < 0.5))) {
      const kinds = [...new Set(t.edges)];
      const terrain = kinds[Math.floor(rTerrain * kinds.length)];
      // The first request of a game is kept small so newcomers see one pay off early.
      const first = this.quests.length === 0 && !this.queue.some((x) => x.quest);
      const [lo, hi] = first ? [2, 3] : QUEST_EXTRA[terrain];
      t.quest = { terrain, extra: lo + Math.floor(rExtra * (hi - lo + 1)) };
    }
    return t;
  }

  // How each active request's area would grow if the current tile went here.
  questPreview(q, r, rot, tile = this.current) {
    const out = [];
    if (!tile) return out;
    const edges = rotatedEdges(tile.edges, rot);
    const k = key(q, r);
    for (const quest of this.activeQuests()) {
      const root = this.find(quest.anchor);
      // walk each run of same-terrain sides; a run touching the request area joins everything it touches
      for (let s = 0; s < 6; s++) {
        if (edges[s] !== quest.terrain) continue;
        if (edges[(s + 5) % 6] === quest.terrain && edges.some((e) => e !== quest.terrain)) continue; // not the run start
        const tiles = new Set([k]);
        let hits = false;
        for (let j = 0; j < 6; j++) {
          const i = (s + j) % 6;
          if (edges[i] !== quest.terrain) break;
          const [dq, dr] = DIRS[i];
          const nb = this.cells.get(key(q + dq, r + dr));
          if (!nb || nb.edges[(i + 3) % 6] !== quest.terrain) continue;
          const nroot = this.find(nb.wedges[(i + 3) % 6]);
          if (nroot === root) hits = true;
          for (const t of this.regions.get(nroot).tiles) tiles.add(t);
        }
        if (hits) { out.push({ quest, size: tiles.size, target: quest.target }); break; }
      }
    }
    return out;
  }

  hasAnyMove(tile = this.current) {
    if (!tile) return false;
    for (const s of this.frontier().values())
      for (let rot = 0; rot < 6; rot++) if (this.evaluate(s.q, s.r, rot, tile).valid) return true;
    return false;
  }

  // Throw away a tile that fits nowhere.
  discard() {
    this.stats.discarded++;
    this.remaining--;
    this.queue.shift();
    this.fill();
    if (this.remaining <= 0) this.over = true;
  }

  bestMove(tile = this.current) {
    let best = null;
    for (const s of this.frontier().values()) {
      for (let rot = 0; rot < 6; rot++) {
        const ev = this.evaluate(s.q, s.r, rot, tile);
        if (!ev.valid) continue;
        const v = ev.points + ev.bonusTiles * 40 + ev.n;
        if (!best || v > best.v) best = { q: s.q, r: s.r, k: s.k, rot, v, ev };
      }
    }
    return best;
  }

  composition() {
    const c = { meadow: 0, forest: 0, field: 0, village: 0, water: 0 };
    for (const cell of this.cells.values()) for (const e of cell.edges) c[e]++;
    return c;
  }
}
