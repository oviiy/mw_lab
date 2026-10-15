// Building archetypes: footprint ranges (tiles), height, roof/facade families and
// how often each district uses them. Visuals live in render/buildingSprites.js.
export const ARCH = {
  shophouse:   { w: [3, 4], d: [6, 8],  floors: [3, 4], roof: 'tile',   facade: 'shophouse',  gap: 0 },
  restaurant:  { w: [6, 9], d: [6, 8],  floors: [2, 3], roof: 'tile',   facade: 'restaurant', gap: 1, sign: 'big' },
  teahouse:    { w: [6, 8], d: [6, 7],  floors: [2, 3], roof: 'pagoda', facade: 'teahouse',   gap: 1, sign: 'big' },
  tenement_cn: { w: [5, 7], d: [6, 8],  floors: [5, 7], roof: 'flat',   facade: 'tenement',   gap: 1, laundry: true },
  temple:      { w: [11, 13], d: [12, 14], floors: [2, 2], roof: 'temple', facade: 'temple',   gap: 1, courtyard: true },
  pawn:        { w: [4, 5], d: [5, 6],  floors: [2, 3], roof: 'flat',   facade: 'shophouse',  gap: 1, sign: 'big' },
  tenement:    { w: [6, 9], d: [6, 9],  floors: [5, 9], roof: 'flat',   facade: 'tenement',   gap: 1, laundry: true },
  house_row:   { w: [3, 4], d: [5, 6],  floors: [2, 2], roof: 'tile',   facade: 'house',      gap: 0 },
  clinic:      { w: [9, 11], d: [8, 9], floors: [4, 5], roof: 'flat',   facade: 'clinic',     gap: 1 },
  garage:      { w: [6, 8], d: [6, 7],  floors: [1, 2], roof: 'metal',  facade: 'garage',     gap: 1, sign: 'big' },
  highrise:    { w: [8, 11], d: [8, 11], floors: [10, 14], roof: 'glass', facade: 'tower',    gap: 2 },
  office:      { w: [9, 14], d: [7, 10], floors: [5, 8], roof: 'flat',   facade: 'office',     gap: 2 },
  hotel:       { w: [10, 13], d: [8, 10], floors: [8, 10], roof: 'flat', facade: 'hotel',     gap: 2, sign: 'big' },
  parking:     { w: [10, 14], d: [9, 12], floors: [4, 4], roof: 'deck',  facade: 'parking',    gap: 2 },
  warehouse:   { w: [10, 16], d: [8, 12], floors: [2, 2], roof: 'metal', facade: 'warehouse',  gap: 2 },
  factory:     { w: [12, 16], d: [10, 12], floors: [3, 3], roof: 'metal', facade: 'factory',   gap: 2, chimney: true },
  seafood:     { w: [8, 10], d: [6, 8], floors: [2, 2], roof: 'tile',   facade: 'restaurant', gap: 1, sign: 'big' },
  police:      { w: [10, 12], d: [8, 9], floors: [3, 3], roof: 'flat',  facade: 'police',     gap: 1 },
  pavilion:    { w: [4, 5], d: [4, 5],  floors: [1, 1], roof: 'pagoda', facade: 'pavilion',   gap: 1 },
  gunshop:     { w: [5, 6], d: [5, 6],  floors: [2, 2], roof: 'flat',   facade: 'gunshop',    gap: 1, sign: 'big' },
  dojo:        { w: [7, 9], d: [6, 8],  floors: [2, 2], roof: 'pagoda', facade: 'teahouse',   gap: 1, sign: 'big' },
  // small fixtures placed by block generators rather than lot rows
  stall:       { w: [2, 2], d: [2, 2],  floors: [1, 1], roof: 'awning', facade: 'stall',      gap: 0, px: 15 },
  container:   { w: [4, 4], d: [2, 2],  floors: [1, 3], roof: 'container', facade: 'container', gap: 0, px: 9 },
  booth:       { w: [2, 2], d: [2, 2],  floors: [1, 1], roof: 'flat',   facade: 'booth',      gap: 0, px: 16 },
  hall:        { w: [5, 5], d: [5, 5],  floors: [2, 2], roof: 'temple', facade: 'temple',     gap: 0 },
};

// Per-district lot mix. Weights are relative.
export const LOT_MIX = {
  chinatown: [['shophouse', 52], ['restaurant', 13], ['tenement_cn', 14], ['teahouse', 5], ['pawn', 4], ['dojo', 3]],
  waterfront: [['warehouse', 26], ['seafood', 22], ['shophouse', 16], ['garage', 8], ['tenement', 8], ['office', 6]],
  old: [['tenement', 50], ['house_row', 24], ['garage', 5], ['clinic', 3], ['shophouse', 12]],
  downtown: [['highrise', 38], ['office', 28], ['hotel', 10], ['parking', 12], ['police', 2]],
  industrial: [['warehouse', 46], ['factory', 24], ['garage', 8], ['office', 4]],
  temple: [['pavilion', 20], ['house_row', 12], ['dojo', 12], ['teahouse', 14]],
};

// Block-level layouts (what a whole block turns into).
export const BLOCK_MIX = {
  chinatown: [['lots', 66], ['market', 14], ['park', 6], ['temple', 8], ['court', 6]],
  waterfront: [['lots', 62], ['containers', 22], ['market', 8], ['park', 4], ['lot', 4]],
  old: [['lots', 74], ['park', 8], ['lot', 10], ['court', 8]],
  downtown: [['lots', 74], ['plaza', 12], ['park', 6], ['lot', 8]],
  industrial: [['lots', 60], ['containers', 28], ['lot', 12]],
  temple: [['park', 46], ['temple', 14], ['lots', 28], ['court', 12]],
};
