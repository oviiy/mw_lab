import type { PuppetSpec } from './Puppet';

// Faces: young heroes and ladies are "hollow" (cut-out, lit from behind); painted faces mark the
// jing roles — red loyal, black upright or fierce, white treacherous, gold divine.
export const ROSTER: Record<string, PuppetSpec> = {
  // troupe
  scholar: { face: 'hollow', head: 'scholar', beard: 'none', garb: 'robe', pattern: 'cloud', robe: '#4F8FB8', trim: '#E2B13C', prop: 'fan' },
  clown: { face: 'white', paint: 'butterfly', head: 'cap', beard: 'none', garb: 'short', pattern: 'coin', robe: '#D9A12B', trim: '#7A3E1C', prop: 'kerchief' },
  warrior: { face: 'hollow', head: 'helmet', beard: 'none', garb: 'armor', pattern: 'scale', robe: '#3E8A55', trim: '#E2B13C', prop: 'spear', flags: true },
  elder: { face: 'hollow', head: 'official', beard: 'long', garb: 'robe', pattern: 'wave', robe: '#8A5A2E', trim: '#E2B13C', prop: 'whip' },
  maiden: { face: 'hollow', head: 'bun', beard: 'none', garb: 'dress', pattern: 'flower', robe: '#D45C7A', trim: '#F2A3B8', prop: 'fan' },
  qingyi: { face: 'hollow', head: 'bun', beard: 'none', garb: 'dress', pattern: 'cloud', robe: '#2E5C9A', trim: '#7FA6D6', prop: 'kerchief' },
  daoma: { face: 'hollow', head: 'crown', beard: 'none', garb: 'armor', pattern: 'flower', robe: '#C62F25', trim: '#E2B13C', prop: 'sword', flags: true },
  fisher: { face: 'hollow', head: 'straw', beard: 'long', garb: 'short', pattern: 'wave', robe: '#6E7F86', trim: '#3A4A50', prop: 'rod' },

  // headliners
  guangong: { face: 'red', head: 'helmet', beard: 'long', garb: 'armor', pattern: 'scale', robe: '#2F7A4A', trim: '#E2B13C', prop: 'blade', flags: true, scale: 1.05 },
  baozheng: { face: 'black', paint: 'crescent', head: 'official', beard: 'full', garb: 'robe', pattern: 'cloud', robe: '#2A2A3A', trim: '#E2B13C', prop: 'brush' },
  zhangfei: { face: 'black', paint: 'butterfly', head: 'helmet', beard: 'full', garb: 'armor', pattern: 'scale', robe: '#33302E', trim: '#C9D2D8', prop: 'spear', flags: true },
  zhuge: { face: 'hollow', head: 'scholar', beard: 'long', garb: 'robe', pattern: 'stars', robe: '#E9E2D2', trim: '#2E5C9A', prop: 'feather' },
  niumo: { face: 'blue', paint: 'eyes', head: 'horns', beard: 'full', garb: 'armor', pattern: 'scale', robe: '#3A3F5A', trim: '#B88A3C', prop: 'mace', scale: 1.1 },
  wusong: { face: 'hollow', head: 'cap', beard: 'none', garb: 'short', pattern: 'wave', robe: '#2A2420', trim: '#C62F25', prop: 'none' },
  zhongkui: { face: 'red', paint: 'eyes', head: 'official', beard: 'full', garb: 'robe', pattern: 'flower', robe: '#A8251C', trim: '#1E1410', prop: 'sword' },
  caocao: { face: 'white', paint: 'eyes', head: 'official', beard: 'long', garb: 'robe', pattern: 'coin', robe: '#6A3F86', trim: '#E2B13C', prop: 'sword' },
  wuchang: { face: 'white', head: 'tall', beard: 'none', garb: 'robe', pattern: 'wave', robe: '#E9E2D2', trim: '#7A7A7A', prop: 'whip' },
  yangmen: { face: 'hollow', head: 'crown', beard: 'none', garb: 'armor', pattern: 'flower', robe: '#C62F25', trim: '#E2B13C', prop: 'spear', flags: true },
  wukong: { face: 'gold', paint: 'heart', head: 'band', beard: 'none', garb: 'short', pattern: 'cloud', robe: '#D9A12B', trim: '#C62F25', prop: 'staff' },
  nezha: { face: 'hollow', head: 'tufts', beard: 'none', garb: 'short', pattern: 'flower', robe: '#E2683A', trim: '#E2B13C', prop: 'ring' },
  fate: { face: 'mask', head: 'stars', beard: 'none', garb: 'robe', pattern: 'stars', robe: '#1E1A2A', trim: '#E2B13C', prop: 'chisel', scale: 1.12 },
};
