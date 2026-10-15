// Vehicle definitions. Sizes in world px (1 tile = 32px), speeds in px/s.
// `kind` picks the sprite painter; `ai` hints which traffic roles use it.
export const VEHICLES = {
  sedan:    { name: 'Sedan',        kind: 'sedan',   len: 54, wid: 26, max: 330, accel: 460, brake: 850, grip: 6.2, turn: 3.0, mass: 1.0, hp: 110, colors: ['#d6453b', '#2a6fb0', '#e8e4d8', '#2b2b33', '#7a8088', '#2e8b6a', '#d99a2b', '#6d3a8a'], weight: 30 },
  taxi:     { name: 'Taxi',         kind: 'taxi',    len: 56, wid: 26, max: 340, accel: 470, brake: 850, grip: 6.2, turn: 3.0, mass: 1.0, hp: 110, colors: ['#d63a30'], weight: 14 },
  minibus:  { name: 'Minibus',      kind: 'minibus', len: 64, wid: 28, max: 290, accel: 380, brake: 760, grip: 6.8, turn: 2.6, mass: 1.5, hp: 150, colors: ['#e8e4d8'], weight: 7 },
  van:      { name: 'Delivery Van', kind: 'van',     len: 62, wid: 28, max: 300, accel: 400, brake: 780, grip: 6.8, turn: 2.6, mass: 1.5, hp: 150, colors: ['#e8e4d8', '#3a6ea5', '#c8453b', '#d9a441'], weight: 10 },
  truck:    { name: 'Truck',        kind: 'truck',   len: 98, wid: 32, max: 250, accel: 300, brake: 700, grip: 7.2, turn: 2.0, mass: 2.8, hp: 260, colors: ['#c8453b', '#2a6fb0', '#d9d4c4', '#4a9b6e'], weight: 5 },
  bus:      { name: 'City Bus',     kind: 'bus',     len: 124, wid: 34, max: 230, accel: 260, brake: 640, grip: 7.6, turn: 1.7, mass: 4.0, hp: 360, colors: ['#e8c34a'], weight: 3 },
  sports:   { name: 'Dragon GT',    kind: 'sports',  len: 52, wid: 25, max: 500, accel: 700, brake: 950, grip: 5.0, turn: 3.3, mass: 0.9, hp: 90, colors: ['#e23b2e', '#ffcc33', '#1f1f28', '#37e6ff'], weight: 5 },
  limo:     { name: 'Boss Limo',    kind: 'limo',    len: 82, wid: 28, max: 360, accel: 420, brake: 800, grip: 6.6, turn: 2.2, mass: 1.8, hp: 190, colors: ['#15151c'], weight: 1 },
  scooter:  { name: 'Scooter',      kind: 'scooter', len: 34, wid: 14, max: 330, accel: 600, brake: 800, grip: 5.2, turn: 3.9, mass: 0.35, hp: 50, colors: ['#e8e4d8', '#d6453b', '#2e8b6a', '#ffcc33'], weight: 11, bike: true },
  bike:     { name: 'Street Bike',  kind: 'bike',    len: 40, wid: 14, max: 480, accel: 780, brake: 850, grip: 4.8, turn: 3.6, mass: 0.5, hp: 60, colors: ['#e23b2e', '#1f1f28', '#37e6ff'], weight: 2, bike: true },
  police:   { name: 'Police Cruiser', kind: 'police', len: 56, wid: 26, max: 400, accel: 560, brake: 900, grip: 6.0, turn: 3.2, mass: 1.1, hp: 150, colors: ['#eef0f4'], weight: 0 },
  swat:     { name: 'SWAT Van',     kind: 'swat',    len: 66, wid: 30, max: 330, accel: 460, brake: 800, grip: 6.4, turn: 2.4, mass: 2.0, hp: 320, colors: ['#1d2330'], weight: 0 },
  // ---- special classes (cls): never in traffic; found at the airfield, army depot and marinas ----
  tank:     { name: 'Tiger Tank',   kind: 'tank',    cls: 'tank',  len: 80, wid: 42, max: 175, accel: 230, brake: 700, grip: 16, turn: 1.6, mass: 12, hp: 2400, colors: ['#4f5a34'], weight: 0 },
  heli:     { name: 'Sparrow Heli', kind: 'heli',    cls: 'heli',  len: 66, wid: 24, span: 104, max: 360, accel: 420, brake: 420, grip: 2.4, turn: 2.8, mass: 1.6, hp: 460, colors: ['#1f8a5a', '#c8202a', '#1f1f28'], weight: 0 },
  plane:    { name: 'Crane Stunt Plane', kind: 'plane', cls: 'plane', len: 60, wid: 18, span: 84, max: 560, accel: 300, brake: 380, grip: 9, turn: 1.9, mass: 1.2, hp: 260, colors: ['#efe6cf', '#c8202a'], weight: 0 },
  speedboat:{ name: 'Jade Runner',  kind: 'speedboat', cls: 'boat', len: 58, wid: 22, max: 430, accel: 430, brake: 320, grip: 1.7, turn: 2.5, mass: 1.0, hp: 170, colors: ['#f4f4f4', '#c8202a', '#1f6f8b'], weight: 0 },
  junk:     { name: 'Harbour Junk', kind: 'junk',    cls: 'boat',  len: 74, wid: 28, max: 250, accel: 240, brake: 260, grip: 2.2, turn: 1.7, mass: 2.4, hp: 300, colors: ['#a8322a'], weight: 0 },
  armored:  { name: 'Enforcer',     kind: 'armored', len: 76, wid: 34, max: 300, accel: 420, brake: 760, grip: 6.8, turn: 2.0, mass: 3.4, hp: 620, colors: ['#3a4a3a'], weight: 0 },
};
export const vclass = (def) => def.cls || 'car';
export const TRAFFIC_TABLE = Object.entries(VEHICLES).filter(([, v]) => v.weight > 0).map(([k, v]) => [k, v.weight]);
