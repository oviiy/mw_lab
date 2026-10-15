// Street-trade goods. `mods` are per-district price modifiers (district ids: 0 Dragon Gate,
// 1 Harbor Row, 2 Old Quarter, 3 Neon Heights, 4 Smokestack Yards, 5 Jade Hill).
export const GOODS = [
  { id: 'jade',      name: 'Jade Carvings',     icon: '🗿', base: 420, vol: 0.22, mods: [-0.10, 0.05, -0.05, 0.38, 0.10, -0.28] },
  { id: 'tea',       name: 'Aged Pu-erh Tea',   icon: '🍵', base: 160, vol: 0.18, mods: [-0.30, 0.10, 0.00, 0.22, 0.05, -0.18] },
  { id: 'fireworks', name: 'Firework Crates',   icon: '🧨', base: 70,  vol: 0.34, mods: [0.28, -0.36, 0.05, 0.12, -0.22, 0.42] },
  { id: 'watches',   name: 'Fake Watches',      icon: '⌚', base: 230, vol: 0.26, mods: [0.00, 0.10, 0.05, 0.42, -0.30, 0.00] },
  { id: 'discs',     name: 'Pirate Discs',      icon: '💿', base: 38,  vol: 0.40, mods: [0.10, 0.00, -0.40, 0.30, -0.05, 0.12] },
  { id: 'elixir',    name: 'Herbal Elixir',     icon: '🧪', base: 95,  vol: 0.30, mods: [0.14, 0.00, 0.10, 0.05, 0.36, -0.30] },
];
export const DISTRICT_NAMES = ['Dragon Gate', 'Harbor Row', 'Old Quarter', 'Neon Heights', 'Smokestack Yards', 'Jade Hill'];
