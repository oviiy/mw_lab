// Weapon definitions. dmg per hit, rate in shots/s, speed px/s, range px, spread radians.
// `ammo` ties a weapon to an ammo pool; null means unlimited (fists, melee).
export const WEAPONS = {
  fists:   { id: 'fists',   name: 'Fists',          type: 'melee', dmg: 14, rate: 2.6, range: 28, arc: 1.3, knock: 90,  ammo: null, hold: 'none',  price: 0, noise: 0 },
  cleaver: { id: 'cleaver', name: 'Cleaver',        type: 'melee', dmg: 34, rate: 1.7, range: 34, arc: 1.5, knock: 160, ammo: null, hold: 'blade', price: 220, noise: 0 },
  katana:  { id: 'katana',  name: 'Dragon Katana',  type: 'melee', dmg: 52, rate: 1.7, range: 42, arc: 1.9, knock: 210, ammo: null, hold: 'blade', price: 1500, noise: 0 },
  pistol:  { id: 'pistol',  name: 'Pistol',         type: 'gun', dmg: 24, rate: 3.6, speed: 980, range: 560, spread: 0.035, pellets: 1, ammo: 'pistol',  mag: 12, hold: 'pistol', price: 300, noise: 1, auto: false, recoil: 0.5 },
  smg:     { id: 'smg',     name: 'Micro SMG',      type: 'gun', dmg: 12, rate: 11,  speed: 1050, range: 500, spread: 0.09, pellets: 1, ammo: 'smg',     mag: 30, hold: 'smg',    price: 900, noise: 1.3, auto: true, recoil: 0.35 },
  shotgun: { id: 'shotgun', name: 'Pump Shotgun',   type: 'gun', dmg: 12, rate: 1.15, speed: 900, range: 330, spread: 0.26, pellets: 7, ammo: 'shotgun', mag: 6,  hold: 'shotgun', price: 1200, noise: 1.6, auto: false, recoil: 1.3 },
  rifle:   { id: 'rifle',   name: 'Dragon AK',      type: 'gun', dmg: 20, rate: 8,   speed: 1200, range: 680, spread: 0.05, pellets: 1, ammo: 'rifle',   mag: 30, hold: 'rifle',  price: 2200, noise: 1.6, auto: true, recoil: 0.5 },
  flamer:  { id: 'flamer',  name: 'Flamethrower',   type: 'gun', dmg: 5, rate: 18, speed: 380, range: 160, spread: 0.2, pellets: 1, ammo: 'fuel', hold: 'rifle', price: 4500, noise: 0.8, auto: true, recoil: 0.1, proj: 'flame' },
  rpg:     { id: 'rpg',     name: 'RPG Launcher',   type: 'gun', dmg: 190, rate: 0.75, speed: 560, range: 720, spread: 0.01, pellets: 1, ammo: 'rocket', hold: 'rifle', price: 6000, noise: 2, auto: false, recoil: 2.4, proj: 'rocket', blast: 92 },
  minigun: { id: 'minigun', name: 'Minigun',        type: 'gun', dmg: 11, rate: 22, speed: 1150, range: 560, spread: 0.11, pellets: 1, ammo: 'minigun', hold: 'rifle', price: 15000, noise: 1.8, auto: true, recoil: 0.3 },
  molotov: { id: 'molotov', name: 'Molotov',        type: 'throw', dmg: 0, rate: 0.9, speed: 420, range: 380, ammo: 'molotov', hold: 'bottle', price: 120, noise: 0.4, fuse: 0, effect: 'fire' },
  grenade: { id: 'grenade', name: 'Grenade',        type: 'throw', dmg: 120, rate: 0.9, speed: 380, range: 360, ammo: 'grenade', hold: 'grenade', price: 250, noise: 0.4, fuse: 1.6, effect: 'blast' },
};
export const WEAPON_ORDER = ['fists', 'cleaver', 'katana', 'pistol', 'smg', 'shotgun', 'rifle', 'minigun', 'flamer', 'rpg', 'molotov', 'grenade'];
export const AMMO = {
  pistol: { name: 'Pistol rounds', pack: 24, price: 40, max: 180 },
  smg: { name: 'SMG rounds', pack: 60, price: 90, max: 400 },
  shotgun: { name: 'Shells', pack: 12, price: 80, max: 60 },
  rifle: { name: 'Rifle rounds', pack: 60, price: 140, max: 300 },
  fuel: { name: 'Fuel tank', pack: 120, price: 140, max: 480 },
  rocket: { name: 'Rockets', pack: 3, price: 450, max: 12 },
  minigun: { name: 'Minigun belt', pack: 200, price: 400, max: 1000 },
  molotov: { name: 'Molotovs', pack: 3, price: 90, max: 12 },
  grenade: { name: 'Grenades', pack: 2, price: 140, max: 8 },
};
