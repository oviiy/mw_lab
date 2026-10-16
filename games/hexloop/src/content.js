// Game content tables: augments, heroes, enemies, acts, difficulty. Pure data.

// Hex augments: chosen 1-of-3 after every sector. Each pick round rolls one tier.
export const MODS = {
  // ---- silver
  tail:       { t: 'silver', n: 'Long Tail',      d: '+3 tail length. Bigger loops.', stack: true },
  aegis:      { t: 'silver', n: 'Aegis',          d: 'Block the first hit in every sector.' },
  bigheart:   { t: 'silver', n: 'Big Heart',      d: '+1 max HP and heal 1.', stack: true },
  magnet:     { t: 'silver', n: 'Magnet',         d: 'Collect pickups on hexes next to you.' },
  bounty:     { t: 'silver', n: 'Bounty',         d: '+30% score from loops.', stack: true },
  thrift:     { t: 'silver', n: 'Thrift',         d: '+2 shards every time you clear a sector.', stack: true },
  rewind:     { t: 'silver', n: 'Rewind',         d: '+1 undo per sector.', stack: true },
  steady:     { t: 'silver', n: 'Insulation',     d: 'Lancer lasers reach 1 hex less.' },
  // ---- gold
  chain:      { t: 'gold', n: 'Chain Reaction',   d: 'Loops also destroy enemies touching your loop from outside.' },
  overclock:  { t: 'gold', n: 'Overclock',        d: 'Every loop kill charges a Dash (max 2): leap 2 hexes in a line.' },
  thorns:     { t: 'gold', n: 'Thorns',           d: 'Enemies that hit you are destroyed.' },
  siphon:     { t: 'gold', n: 'Siphon',           d: 'A loop that destroys 2+ enemies heals 1.' },
  secondwind: { t: 'gold', n: 'Second Wind',      d: 'Once per sector, survive a lethal hit with 1 HP.' },
  strike:     { t: 'gold', n: 'Phase Strike',     d: 'Once per sector, step onto an enemy to destroy it.' },
  frost:      { t: 'gold', n: 'Cryo Pulse',       d: 'After every loop, all enemies freeze for a turn.' },
  hunter:     { t: 'gold', n: 'Executioner',      d: 'Loops deal 2 damage to Brutes and bosses.' },
  momentum:   { t: 'gold', n: 'Momentum',         d: 'Combos last longer and build twice as fast.' },
  // ---- prismatic
  nova:       { t: 'prism', n: 'Supernova',       d: 'Loops also destroy every enemy within 2 hexes of the loop.' },
  phoenix:    { t: 'prism', n: 'Phoenix',         d: 'Once per run, a lethal hit revives you at full HP.' },
  infinity:   { t: 'prism', n: 'Infinity Tail',   d: '+6 tail length, and waiting no longer shrinks it.' },
  stasis:     { t: 'prism', n: 'Stasis Field',    d: 'Walking enemies move only every third turn.' },
  midas:      { t: 'prism', n: 'Midas',           d: 'Double shards, and hearts drop far more often.' },
};
export const TIER = {
  silver: { n: 'SILVER', c: '#c9d6ea' },
  gold: { n: 'GOLD', c: '#ffc94d' },
  prism: { n: 'PRISMATIC', c: '#c08bff' },
};

// Heroes: unique HP / tail / starting augments.
export const CORES = [
  { id: 'spark',   n: 'Spark',   cost: 0,   hp: 3, tail: 8,  mods: {},                          color: '#3de8ff', d: '3 HP · tail 8. Balanced.' },
  { id: 'prism',   n: 'Prism',   cost: 15,  hp: 2, tail: 8,  mods: { chain: 1 },                color: '#9d7dff', d: '2 HP · tail 8. Starts with Chain Reaction.' },
  { id: 'bulwark', n: 'Bulwark', cost: 40,  hp: 5, tail: 7,  mods: { aegis: 1 },                color: '#5dffa0', d: '5 HP · tail 7. Starts with Aegis.' },
  { id: 'phantom', n: 'Phantom', cost: 70,  hp: 3, tail: 8,  mods: { strike: 1, overclock: 1 }, color: '#e6f0ff', d: '3 HP · tail 8. Phase Strike + Overclock.' },
  { id: 'weaver',  n: 'Weaver',  cost: 100, hp: 2, tail: 12, mods: { magnet: 1 },               color: '#ffb547', d: '2 HP · tail 12. Huge loops, starts with Magnet.' },
  { id: 'glacier', n: 'Glacier', cost: 140, hp: 4, tail: 8,  mods: { frost: 1 },                color: '#a8e4ff', d: '4 HP · tail 8. Starts with Cryo Pulse.' },
  { id: 'reaper',  n: 'Reaper',  cost: 200, hp: 3, tail: 8,  mods: { hunter: 1, thorns: 1 },    color: '#ff6b8e', d: '3 HP · tail 8. Executioner + Thorns.' },
];

export const ENEMY_INFO = {
  drone:    { n: 'Drone',    d: 'Slow: moves every other turn. Hits the hex its arrow points to. Circle it to destroy it.' },
  lancer:   { n: 'Lancer',   d: 'A turret that never moves. If you line up within its range it aims, then fires next turn. Keep moving and circle it.' },
  brute:    { n: 'Brute',    d: 'Tough: takes 2 loops to destroy. Slow, and hits the hex its arrow points to.' },
  eater:    { n: 'Eater',    d: 'Harmless and slow, but it nibbles the old end of your tail. Loop it quickly.' },
  mite:     { n: 'Mite',     d: 'Minion. Fast and harmless, but it gets in your way. Easy points.' },
  splitter: { n: 'Splitter', d: 'Splits into 2 Mites when destroyed. Hits the hex its arrow points to.' },
  bomber:   { n: 'Bomber',   d: 'Every few turns it glows, then blasts every hex around it. Step away when it glows; loop it between blasts.' },
  hive:     { n: 'Hive',     d: 'Act 1 boss. Each loop around it deals 1 damage. It keeps spawning enemies.' },
  warden:   { n: 'Warden',   d: 'Act 2 boss. Teleports somewhere new every time you loop it, and calls Mites.' },
  colossus: { n: 'Colossus', d: 'Act 3 boss. 5 HP, walks slowly toward you and hits hard. Summons Mites when hurt.' },
};
export const BOSSES = ['hive', 'warden', 'colossus'];
export const isBoss = (t) => BOSSES.includes(t);

// Acts: each has a look, its own terrain and its own boss.
export const ACTS = [
  { n: 'Neon Grid',   boss: 'hive',     lava: 0, hedge: 0, shrine: 0.15 },
  { n: 'Magma Core',  boss: 'warden',   lava: 4, hedge: 0, shrine: 0.35 },
  { n: 'Overgrowth',  boss: 'colossus', lava: 2, hedge: 6, shrine: 0.35 },
];
export const actOf = (sector) => Math.floor((sector - 1) / 3);           // 0,1,2,3,…  (endless keeps counting)
export const actInfo = (sector) => ACTS[actOf(sector) % ACTS.length];

// Difficulty ("Heat"): unlocked by winning at the level below.
export const HEAT = [
  { n: 'Normal',  d: 'The standard game.' },
  { n: 'Heat 1',  d: '+1 enemy in every sector.' },
  { n: 'Heat 2',  d: 'Enemies arrive faster.' },
  { n: 'Heat 3',  d: 'More Brutes and Bombers.' },
  { n: 'Heat 4',  d: 'Clearing a sector no longer heals you.' },
  { n: 'Heat 5',  d: '−1 max HP. For legends only.' },
];
