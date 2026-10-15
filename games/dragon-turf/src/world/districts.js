// District definitions: layout parameters + the colour world each one lives in.
// Palettes are deliberately saturated — the look is cel-shaded comic ink, not realism.
export const DISTRICTS = {
  chinatown: {
    id: 0, name: 'Dragon Gate', blurb: 'Lanterns, markets and old money.',
    maxBlock: 12, minBlock: 7, roads: [3, 3, 4],
    asphalt: '#2d2930', asphaltLight: '#3d3840', sidewalk: '#dccdb0', sidewalk2: '#c6b596', plaza: '#a9564a', plaza2: '#8f4439',
    roofs: ['#2c7a6b', '#2a5f8f', '#8c2f2f', '#3d3a4a', '#b8862f'], walls: ['#c8453b', '#d9a441', '#ead9b0', '#7fa88a', '#8a5a44', '#d96b4a'],
    accent: '#ffcc33',
  },
  waterfront: {
    id: 1, name: 'Harbor Row', blurb: 'Seafood, smugglers and salt air.',
    maxBlock: 15, minBlock: 8, roads: [4, 4],
    asphalt: '#29303a', asphaltLight: '#39414c', sidewalk: '#d3d0c3', sidewalk2: '#bdbaad', plaza: '#9a8d78', plaza2: '#867a66',
    roofs: ['#4a6f86', '#7a4a3a', '#58606a', '#2d6a6a'], walls: ['#d8c9a6', '#7fa3b5', '#c98f5a', '#a8b5ad', '#c9b8a0'],
    accent: '#5fd0e0',
  },
  old: {
    id: 2, name: 'Old Quarter', blurb: 'Tenements, washing lines, long memories.',
    maxBlock: 14, minBlock: 8, roads: [3, 4],
    asphalt: '#2e2c33', asphaltLight: '#3e3b43', sidewalk: '#d6c9b2', sidewalk2: '#c0b39c', plaza: '#9a8a74', plaza2: '#86766a',
    roofs: ['#7b6a5a', '#8b5e4a', '#6e7b82', '#8a7a52'], walls: ['#b08968', '#9c8f7a', '#a7a39a', '#b5776a', '#8e9a8a', '#c4a77d'],
    accent: '#ff9a4a',
  },
  downtown: {
    id: 3, name: 'Neon Heights', blurb: 'Glass towers and corporate money.',
    maxBlock: 19, minBlock: 10, roads: [5, 5, 6],
    asphalt: '#272a35', asphaltLight: '#373b47', sidewalk: '#dcdce2', sidewalk2: '#c4c4cc', plaza: '#a0a4b0', plaza2: '#8a8e9c',
    roofs: ['#5a6a7c', '#4a5668', '#6b7a8a', '#3f4a5a'], walls: ['#6aa8c8', '#4b6f9a', '#8aa0b4', '#5f7f9a', '#a6b5c4'],
    accent: '#7fd8ff',
  },
  industrial: {
    id: 4, name: 'Smokestack Yards', blurb: 'Warehouses, rust and shift whistles.',
    maxBlock: 22, minBlock: 12, roads: [5, 6],
    asphalt: '#2b2b31', asphaltLight: '#3b3b42', sidewalk: '#cbc8ba', sidewalk2: '#b5b2a4', plaza: '#8a8478', plaza2: '#7a7468',
    roofs: ['#6d747a', '#8a6a3f', '#59606a', '#7a5a4a'], walls: ['#8a8f94', '#a08a6a', '#7a8087', '#9a7a6a'],
    accent: '#ffb347',
  },
  temple: {
    id: 5, name: 'Jade Hill', blurb: 'Quiet gardens above the noise.',
    maxBlock: 24, minBlock: 12, roads: [4, 4],
    asphalt: '#2c2b32', asphaltLight: '#3c3b43', sidewalk: '#ddd2b8', sidewalk2: '#c8bc9f', plaza: '#b0a58a', plaza2: '#9a8f76',
    roofs: ['#2c7a6b', '#8c2f2f', '#2a5f8f'], walls: ['#ead9b0', '#c8453b', '#d9c9a0'],
    accent: '#9be8a8',
  },
};
export const DISTRICT_LIST = Object.keys(DISTRICTS);
export const districtKey = (id) => DISTRICT_LIST[id];

// Voronoi seeds (tile coords) + weights. Bigger weight = bigger district.
export const DISTRICT_SEEDS = [
  { key: 'chinatown', x: 82, y: 74, w: 1.55 },
  { key: 'downtown', x: 78, y: 22, w: 1.15 },
  { key: 'waterfront', x: 82, y: 118, w: 1.0 },
  { key: 'old', x: 24, y: 72, w: 1.2 },
  { key: 'old', x: 24, y: 118, w: 0.8 },
  { key: 'industrial', x: 142, y: 88, w: 1.15 },
  { key: 'industrial', x: 140, y: 124, w: 0.8 },
  { key: 'temple', x: 140, y: 28, w: 1.0 },
  { key: 'temple', x: 26, y: 24, w: 0.85 },
];
