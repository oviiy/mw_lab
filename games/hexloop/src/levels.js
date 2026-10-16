// Hand-authored boards: five tutorial puzzles that each teach one idea, then the first real sector.
// Coordinates are axial "q,r". goal: 'collect' (grab every shard) or 'kill' (destroy every enemy).
export const TUTORIAL = [
  {
    title: 'Move', rad: 2, tail: 4, player: [0, 0], walls: [],
    shards: ['1,-2', '2,-1', '2,0'], enemies: [], goal: 'collect',
    hint: 'Tap a shard to walk to it. Grab all 3.',
  },
  {
    title: 'Loop', rad: 2, tail: 6, player: [0, 1], walls: [],
    enemies: [{ type: 'drone', q: 0, r: 0, sleep: true }], goal: 'kill',
    ghost: ['1,0', '1,-1', '0,-1', '-1,0', '-1,1'],
    hint: 'Drag your finger around the drone, following the gold hexes. Let go to loop it!',
  },
  {
    title: 'Red hurts', rad: 3, tail: 6, player: [-1, 0], walls: [],
    enemies: [{ type: 'drone', q: 2, r: 0 }], goal: 'kill',
    hint: 'Red hexes hurt. Draw a circle around the drone without stopping on red.',
  },
  {
    title: 'Use the rocks', rad: 3, tail: 7, player: [1, 0], walls: ['2,-2', '2,-1'],
    enemies: [{ type: 'drone', q: 0, r: 0, sleep: true }, { type: 'drone', q: 1, r: -1, sleep: true }, { type: 'drone', q: 0, r: -1, sleep: true }],
    ghost: ['0,1', '-1,1', '-1,0', '-1,-1', '0,-2', '1,-2'], goal: 'kill',
    hint: 'Rocks count as part of a loop. Circle all three drones at once!',
  },
  {
    title: 'Tail limit', rad: 3, tail: 8, player: [0, 0], walls: ['-2,0'],
    enemies: [{ type: 'drone', q: 2, r: -2 }, { type: 'drone', q: -2, r: 2 }], goal: 'kill',
    hint: 'Your tail is only 8 hexes long. Loop the drones one at a time.',
  },
];

export const SECTOR1 = {
  rad: 4, player: [0, 0], walls: ['3,-1', '-2,1', '-3,0', '1,1'],
  enemies: [{ type: 'drone', q: 2, r: -3 }, { type: 'drone', q: -1, r: 3 }],
  shards: ['-2,-1', '3,-3', '1,2'], quota: 4, spawnEvery: 7,
  hint: 'Drag a circle around each drone. 4 to go.',
};
