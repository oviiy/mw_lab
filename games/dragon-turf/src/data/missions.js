// Mission scripts. See systems/missions/steps.js for what each step type does.
// Positions: 'poi:wei' · 'poi:chop' · 'turf:Lantern Alley' · 'gate:0' · 'building:hotel' · {x,y}
const SHOP_TURFS = ['Jade Teahouse Row', 'Westside Tenements', 'Night Market'];

export const MISSIONS = [
  {
    id: 'homecoming', title: 'Homecoming', giver: 'wei', unlock: [],
    brief: 'Uncle Wei needs a car stolen. Easy money, right?', reward: { cash: 300 },
    steps: [
      { t: 'dialogue', scene: 'wei1' },
      { t: 'spawnVehicle', key: 'car', type: 'sedan', color: '#1f1f28', at: 'poi:wei', locked: true },
      { t: 'enterVehicle', key: 'car', text: 'Steal the black sedan (press E to hotwire)' },
      { t: 'deliver', key: 'car', to: 'poi:chop', r: 90, time: 170, text: 'Deliver the car to the Chop Shop', consume: true },
      { t: 'goto', to: 'poi:wei', r: 70, text: 'Return to Uncle Wei' },
      { t: 'dialogue', scene: 'wei2' },
    ],
  },
  {
    id: 'protection', title: 'Protection Money', giver: 'wei', unlock: ['homecoming'],
    brief: 'Collect the Serpents\' dues from four shops. Expect competition.', reward: { cash: 650, weapon: 'cleaver' },
    steps: [
      { t: 'dialogue', scene: 'protect1' },
      { t: 'collect', shops: { n: 2, turfs: SHOP_TURFS }, label: 'Collect dues', text: 'Collect protection money', amount: 130 },
      { t: 'dialogue', scene: 'protect_ambush' },
      { t: 'kill', spawn: [{ faction: 'dragon', count: 4, at: 'player', offset: 300, spread: 50, aggro: true }], text: 'Fight off the Red Dragon collectors' },
      { t: 'collect', shops: { n: 2, turfs: SHOP_TURFS }, label: 'Collect dues', text: 'Finish the collection', amount: 130 },
      { t: 'goto', to: 'poi:wei', r: 70, text: 'Deliver the money to Uncle Wei' },
      { t: 'dialogue', scene: 'protect2' },
    ],
  },
  {
    id: 'fireworks', title: 'Lantern Night', giver: 'lin', unlock: ['protection'],
    brief: 'Hijack the Iron Tigers\' fireworks truck and deliver it to the Dragon Gate arch before the festival.', reward: { cash: 900 },
    steps: [
      { t: 'dialogue', scene: 'lin1' },
      { t: 'goto', to: "turf:Smuggler's Pier", r: 260, text: "Head to Smuggler's Pier" },
      { t: 'spawnVehicle', key: 'truck', type: 'truck', color: '#c8453b', at: "turf:Smuggler's Pier", locked: false, radius: 420, guards: [{ faction: 'tiger', count: 5, rank: 0, sight: 380 }] },
      { t: 'enterVehicle', key: 'truck', text: 'Steal the fireworks truck' },
      { t: 'chasers', faction: 'tiger', count: 2, text: 'The Iron Tigers are after you!' },
      { t: 'deliver', key: 'truck', to: 'gate:0', r: 120, time: 190, text: 'Drive the truck to the Dragon Gate arch' },
      { t: 'fireworks', at: 'gate:0', sec: 9 },
      { t: 'dialogue', scene: 'lin2' },
    ],
  },
  {
    id: 'accountant', title: 'The Accountant', giver: 'lin', unlock: ['fireworks'],
    brief: 'Pang, the Black Lotus accountant, hides in a Neon Heights tower. Make the books disappear.', reward: { cash: 1300, weapon: 'smg', ammo: 120 },
    steps: [
      { t: 'dialogue', scene: 'hit1' },
      { t: 'goto', to: 'building:highrise@Neon Heights', r: 170, text: 'Go to Pang\'s tower in Neon Heights' },
      { t: 'kill', spawn: [{ faction: 'lotus', count: 4, at: 'building:highrise@Neon Heights', rank: 1, spread: 90 }, { faction: 'lotus', count: 1, at: 'building:highrise@Neon Heights', rank: 2, spread: 40, hp: 140, name: 'Pang', weapon: 'smg' }], text: 'Eliminate Pang and his guards' },
      { t: 'wanted', heat: 5.2 },
      { t: 'loseCops', text: 'Shake the police' },
      { t: 'dialogue', scene: 'hit2' },
    ],
  },
  {
    id: 'lantern_war', title: 'Lantern Alley', giver: 'wei', unlock: ['accountant'],
    brief: 'Take Lantern Alley back from the Red Dragons.', reward: { cash: 900, weapon: 'shotgun', ammo: 30 },
    steps: [
      { t: 'dialogue', scene: 'war1' },
      { t: 'turfWar', turf: 'Lantern Alley' },
      { t: 'dialogue', scene: 'war2' },
    ],
  },
  {
    id: 'midnight_run', title: 'Midnight Run', giver: 'lin', unlock: ['fireworks'],
    brief: 'Win a six-checkpoint street race against three rivals.', reward: { cash: 1600 },
    steps: [
      { t: 'dialogue', scene: 'race1' },
      { t: 'spawnVehicle', key: 'racer', type: 'sports', color: '#e23b2e', at: 'poi:lin', locked: false },
      { t: 'enterVehicle', key: 'racer', text: 'Your race car is waiting outside the Phoenix Pavilion' },
      { t: 'race', car: 'racer', checkpoints: ['poi:wei', 'gate:1', 'turf:Neon Heights', 'turf:Smokestack Yards', 'turf:Harbor Row', 'poi:lin'], rivals: 3, mustWin: true },
      { t: 'dialogue', scene: 'race2' },
    ],
  },
  {
    id: 'vendetta', title: 'Blood and Jade', giver: 'wei', unlock: ['lantern_war'],
    brief: 'Kill the three Black Lotus captains running protection across the city.', reward: { cash: 2200, weapon: 'rifle', ammo: 120 },
    steps: [
      { t: 'dialogue', scene: 'vendetta1' },
      { t: 'goto', to: 'turf:Night Market', r: 300, text: 'Find the Lotus captain at the Night Market' },
      { t: 'kill', spawn: [{ faction: 'lotus', count: 1, at: 'turf:Night Market', rank: 2, hp: 150, name: 'Captain Ling', spread: 30 }, { faction: 'lotus', count: 3, at: 'turf:Night Market', rank: 1, spread: 90 }], text: 'Kill the captain at the Night Market' },
      { t: 'goto', to: 'turf:Harbor Row', r: 300, text: 'Find the Lotus captain at Harbor Row' },
      { t: 'kill', spawn: [{ faction: 'lotus', count: 1, at: 'turf:Harbor Row', rank: 2, hp: 150, name: 'Captain Sho', spread: 30 }, { faction: 'lotus', count: 3, at: 'turf:Harbor Row', rank: 1, spread: 90 }], text: 'Kill the captain at Harbor Row' },
      { t: 'goto', to: 'turf:Smokestack Yards', r: 300, text: 'Find the Lotus captain at the Smokestack Yards' },
      { t: 'kill', spawn: [{ faction: 'lotus', count: 1, at: 'turf:Smokestack Yards', rank: 2, hp: 150, name: 'Captain Duan', spread: 30 }, { faction: 'lotus', count: 4, at: 'turf:Smokestack Yards', rank: 1, spread: 110 }], text: 'Kill the captain at the Smokestack Yards' },
      { t: 'dialogue', scene: 'vendetta2' },
    ],
  },
  {
    id: 'dragons_head', title: "Dragon's Head", giver: 'wei', unlock: ['vendetta', 'midnight_run'], needTurfs: 4,
    brief: "Storm Brother Hu's fortress in Dragon Gate and end the war.", reward: { cash: 6000 }, final: true,
    steps: [
      { t: 'dialogue', scene: 'final1' },
      { t: 'goto', to: 'turf:Dragon Gate', r: 260, text: "Approach Brother Hu's hideout" },
      { t: 'kill', spawn: [{ faction: 'dragon', count: 7, at: 'turf:Dragon Gate', rank: 1, spread: 120, aggro: true }], text: 'Break the outer guard' },
      { t: 'kill', spawn: [{ faction: 'dragon', count: 5, at: 'turf:Dragon Gate', rank: 1, spread: 90, aggro: true }, { faction: 'dragon', count: 2, at: 'turf:Dragon Gate', rank: 2, spread: 60, aggro: true }], text: 'Clear the inner courtyard' },
      { t: 'dialogue', scene: 'final_hu' },
      { t: 'kill', spawn: [{ faction: 'dragon', count: 1, boss: true, at: 'turf:Dragon Gate', rank: 3, hp: 560, armor: 100, weapon: 'rifle', name: 'Brother Hu', aggro: true, spread: 20 }, { faction: 'dragon', count: 4, at: 'turf:Dragon Gate', rank: 2, spread: 120, aggro: true }], text: 'Defeat Brother Hu' },
      { t: 'dialogue', scene: 'final2' },
      { t: 'custom', run: (m, s, dt, game) => { game.screens.open('ending'); return true; } },
    ],
  },
  // ---------------- side stories: the new toys ----------------
  {
    id: 'paper_tigers', title: 'Paper Tigers', giver: 'wei', unlock: ['homecoming'],
    brief: 'The Iron Tigers are coming to smash up the teahouse. Hold the door.', reward: { cash: 800, ammo: 60 },
    steps: [
      { t: 'dialogue', scene: 'tigers1' },
      { t: 'kill', spawn: [{ faction: 'tiger', count: 4, at: 'poi:wei', offset: 260, spread: 60, aggro: true }], text: 'Defend the teahouse' },
      { t: 'kill', spawn: [{ faction: 'tiger', count: 5, at: 'poi:wei', offset: 300, spread: 70, aggro: true, rank: 1 }], text: 'Second wave! Hold the door' },
      { t: 'dialogue', scene: 'tigers2' },
    ],
  },
  {
    id: 'harbor_run', title: 'Harbour Run', giver: 'lin', unlock: ['fireworks'],
    brief: 'Run a crate of hot jade across the harbour by speedboat before the coastguard wakes up.', reward: { cash: 1400 },
    steps: [
      { t: 'dialogue', scene: 'boat1' },
      { t: 'spawnVehicle', key: 'boat', type: 'speedboat', color: '#c8202a', at: 'site:marina:0', locked: false, water: true },
      { t: 'enterVehicle', key: 'boat', text: 'Take the red speedboat at the marina' },
      { t: 'wanted', heat: 2.1 },
      { t: 'deliver', key: 'boat', to: 'site:marina:3', r: 110, time: 75, text: 'Race the crate to the far pier' },
      { t: 'dialogue', scene: 'boat2' },
    ],
  },
  {
    id: 'lotus_blossoms', title: 'Lotus Blossoms', giver: 'lin', unlock: ['accountant'],
    brief: 'Borrow a stunt plane from Fort Jade and sink three Black Lotus smuggling junks.', reward: { cash: 2600 },
    steps: [
      { t: 'dialogue', scene: 'plane1' },
      { t: 'boardClass', cls: 'plane', at: 'site:airfield', text: 'Steal the stunt plane at Fort Jade Airbase (✈ on the map)' },
      { t: 'toast', text: 'Hold W down the runway to take off. RMB or Space drops bombs.' },
      { t: 'destroy', type: 'junk', count: 3, water: true, at: 'site:marina:2', faction: 'lotus', text: 'Bomb the Lotus junks in the harbour' },
      { t: 'loseCops', text: 'Lose the heat (land somewhere quiet or outfly them)' },
      { t: 'dialogue', scene: 'plane2' },
    ],
  },
  {
    id: 'iron_dragon', title: 'Iron Dragon', giver: 'wei', unlock: ['lantern_war'],
    brief: 'The Red Dragons are moving guns in armoured vans. Answer with a tank.', reward: { cash: 3500, weapon: 'rpg', ammo: 6 },
    steps: [
      { t: 'dialogue', scene: 'tank1' },
      { t: 'boardClass', cls: 'tank', at: 'site:depot', text: 'Steal the tank from the Fort Jade tank yard (★ on the map)' },
      { t: 'toast', text: 'Mouse aims the turret. LMB fires the cannon, RMB the machine gun. Ram cars to crush them.' },
      { t: 'destroy', type: 'truck', count: 3, at: 'turf:Lantern Alley', faction: 'dragon', speed: 130, hp: 900, color: '#7a1a14', text: 'Destroy the Red Dragon armoured vans' },
      { t: 'loseCops', text: 'Ditch the tank and lose the army' },
      { t: 'dialogue', scene: 'tank2' },
    ],
  },
  {
    id: 'eye_in_sky', title: 'Eye in the Sky', giver: 'wei', unlock: ['vendetta'],
    brief: 'Big Tiger Mo is holding a meeting in the Smokestack Yards. Arrive from above.', reward: { cash: 3200 },
    steps: [
      { t: 'dialogue', scene: 'heli1' },
      { t: 'boardClass', cls: 'heli', at: 'site:airfield', text: 'Take a helicopter from Fort Jade Airbase (✈ on the map)' },
      { t: 'toast', text: 'WASD flies, the mouse aims. LMB chain gun, RMB rockets. E bails out with a parachute.' },
      { t: 'goto', to: 'turf:Smokestack Yards', r: 320, text: 'Fly to the Smokestack Yards' },
      { t: 'kill', spawn: [{ faction: 'tiger', count: 1, at: 'turf:Smokestack Yards', rank: 3, hp: 260, name: 'Big Tiger Mo', weapon: 'rifle', spread: 30, aggro: true }, { faction: 'tiger', count: 7, at: 'turf:Smokestack Yards', rank: 1, spread: 140, aggro: true }], text: 'Wipe out the Tiger meeting' },
      { t: 'dialogue', scene: 'heli2' },
    ],
  },
  {
    id: 'jade_express', title: 'Jade Express', giver: 'lin', unlock: ['midnight_run'],
    brief: 'An armoured cash truck leaves Neon Heights tonight. It should arrive at the chop shop instead.', reward: { cash: 4500 },
    steps: [
      { t: 'dialogue', scene: 'heist1' },
      { t: 'spawnVehicle', key: 'cash', type: 'van', hp: 650, color: '#c9a227', at: 'turf:Neon Heights', locked: false, guards: [{ faction: 'lotus', count: 4, rank: 1, sight: 360 }] },
      { t: 'enterVehicle', key: 'cash', text: 'Hijack the golden cash truck in Neon Heights' },
      { t: 'wanted', heat: 9.2 },
      { t: 'deliver', key: 'cash', to: 'poi:chop', r: 100, time: 160, text: 'Get the truck to the Chop Shop', consume: true },
      { t: 'dialogue', scene: 'heist2' },
    ],
  },
];
export const MISSION_BY_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));
