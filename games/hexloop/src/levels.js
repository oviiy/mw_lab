// Hand-authored boards: five tutorial puzzles that each teach one idea, then the first real sector.
// Coordinates are axial "q,r". goal: 'collect' (grab every shard) or 'kill' (destroy every enemy).
export const TUTORIAL = [
  {
    title: 'Move', rad: 2, tail: 4, player: [0, 0], walls: [],
    shards: ['1,-2', '2,-1', '2,0'], enemies: [], goal: 'collect',
    hint: 'Tap a glowing hex to move. Grab the 3 shards.',
  },
  {
    title: 'Loop', rad: 2, tail: 6, player: [0, 1], walls: [],
    enemies: [{ type: 'drone', q: 0, r: 0, sleep: true }], goal: 'kill',
    ghost: ['1,0', '1,-1', '0,-1', '-1,0', '-1,1'],
    hint: 'Walk all the way around the drone. Closing the loop destroys it.',
  },
  {
    title: 'Red hurts', rad: 3, tail: 6, player: [-1, 0], walls: [],
    enemies: [{ type: 'drone', q: 2, r: 0 }], goal: 'kill',
    hint: 'Red hexes hurt. Never end on red. Circle the drone to trap it.',
  },
  {
    title: 'Use the rocks', rad: 3, tail: 7, player: [1, 0], walls: ['2,-2', '2,-1'],
    enemies: [{ type: 'drone', q: 0, r: 0, sleep: true }, { type: 'drone', q: 1, r: -1, sleep: true }, { type: 'drone', q: 0, r: -1, sleep: true }],
    ghost: ['0,1', '-1,1', '-1,0', '-1,-1', '0,-2', '1,-2'], goal: 'kill',
    hint: 'Rocks count as part of a loop. Trap all three at once!',
  },
  {
    title: 'Tail limit', rad: 3, tail: 8, player: [0, 0], walls: ['-2,0'],
    enemies: [{ type: 'drone', q: 3, r: -3 }, { type: 'drone', q: -3, r: 3 }], goal: 'kill',
    hint: 'Your tail is only 8 long, and waiting shrinks it. Trap them one at a time.',
  },
];

export const SECTOR1 = {
  rad: 4, player: [0, 0], walls: ['2,-2', '-2,2', '-3,0', '3,0'],
  enemies: [{ type: 'drone', q: 2, r: -4 }, { type: 'drone', q: -1, r: 4 }],
  shards: ['-2,-1', '3,-3', '1,2'], quota: 4, spawnEvery: 7,
  hint: 'Destroy 4 drones. Loop them, use the rocks.',
};
