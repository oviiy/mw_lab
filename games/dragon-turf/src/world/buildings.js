import { VIEW } from '../config.js';
import { T } from './tiles.js';
import { ARCH } from './archetypes.js';
import { DISTRICTS } from './districts.js';
import { jitter } from '../core/color.js';

const NEON = ['#ff3d6e', '#37e6ff', '#ffd23a', '#7dff6a', '#c26bff', '#ff8a2a'];
const SIGNS = {
  restaurant: ['龍門酒家', '金鳳茶樓', '福滿樓', '點心皇', '醉仙樓', '粥麵館'],
  seafood: ['海鮮城', '漁港', '鮮味坊', '龍蝦王'],
  teahouse: ['茶', '玉茶軒', '翠竹茶室'],
  pawn: ['當', '典當', '金鋪'],
  gunshop: ['槍', 'ARMS 軍械'],
  hotel: ['HOTEL 酒店', '帝景 HOTEL', 'GRAND 龍'],
  dojo: ['武館', '龍虎武館'],
  garage: ['AUTO 車行', '修車', 'TURBO 快修'],
  shophouse: ['藥', '米', '茶莊', '布', '雜貨', '燒味', '麵', '金', '福', '花'],
  clinic: ['CLINIC 醫院', '醫'],
  tenement: [], tenement_cn: ['旅館', '租'], office: ['TOWER', ''], highrise: ['', ''], parking: ['P'], police: ['POLICE'],
};

// Creates the building record, stamps its footprint into the world grids and
// returns it. `opts.px` overrides wall height (px); `opts.floors` overrides floors.
export function placeBuilding(world, rng, key, x, y, w, d, district, opts = {}) {
  const a = ARCH[key], cfg = DISTRICTS[district];
  const floors = opts.floors ?? rng.int(a.floors[0], a.floors[1]);
  const H = Math.min(VIEW.maxBuildingPx, opts.px ?? a.px ?? floors * VIEW.floorPx);
  const wallPal = opts.walls || cfg.walls, roofPal = opts.roofs || cfg.roofs;
  const texts = SIGNS[key] || SIGNS[a.facade] || [];
  const b = {
    id: world.buildings.length, key, arch: a, x, y, w, d, floors, H, district,
    wall: opts.wall || jitter(rng.pick(wallPal), rng, 0.012, 0.05, 0.05),
    roof: opts.roof || jitter(rng.pick(roofPal), rng, 0.012, 0.05, 0.05),
    trim: opts.trim || rng.pick(['#f1d98a', '#2a1a14', '#e8e0cc', '#c8453b']),
    seed: rng.int(1, 1e9), sign: null, neon: null, door: { tx: x + (w >> 1), ty: y + d },
    flip: rng.chance(0.5), tag: opts.tag || null, destroyedBy: null,
  };
  if (texts.length && (a.sign === 'big' || key === 'shophouse' || key === 'tenement_cn')) {
    const text = rng.pick(texts);
    if (text) { b.sign = { text, color: rng.pick(NEON), vertical: a.facade === 'shophouse' || key === 'tenement_cn' || /^[^\x00-\x7f]$/.test(text) }; b.neon = b.sign.color; }
  }
  world.fillRect(x, y, x + w, y + d, T.BUILDING); world.solidRect(x, y, x + w, y + d, 1);
  world.buildings.push(b);
  return b;
}
