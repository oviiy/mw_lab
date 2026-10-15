import { TILE } from '../config.js';
import { ARCH } from './archetypes.js';

// Stage 4: tag buildings with gameplay roles (shops, contacts, safehouse...).
// A POI is {id, type, x, y, label, icon, building}. x,y is the door stand-spot (px).

const doorOf = (b) => ({ x: (b.x + b.w / 2) * TILE, y: (b.y + b.d) * TILE + 16 });

function convert(b, key, extra = {}) { b.key = key; b.arch = ARCH[key]; Object.assign(b, extra); }

export function placePois(world, rng) {
  const pois = world.pois = [];
  const add = (type, b, label, icon, extra = {}) => { const p = { id: pois.length, type, building: b.id, label, icon, ...doorOf(b), ...extra }; pois.push(p); b.poi = p.id; return p; };
  const free = (pred) => world.buildings.filter((b) => !b.tag && !b.poi && pred(b));
  const nearest = (list, x, y) => list.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
  
  // Jade safehouse: a tenement/house in the Old Quarter, inside Jade territory.
  const jadeIds = new Set(world.turfs.filter((t) => t.owner === 'jade').map((t) => t.id));
  const jade = world.turfs.find((t) => t.owner === 'jade') || world.turfs[0];
  const inJade = (b) => jadeIds.has(world.turfMap[(b.y + (b.d >> 1)) * world.W + b.x + (b.w >> 1)]) && jadeIds.has(world.turfMap[Math.min(world.H - 1, b.y + b.d + 1) * world.W + b.x + (b.w >> 1)]);
  const homeList = free((b) => (b.key === 'tenement' || b.key === 'house_row' || b.key === 'tenement_cn') && inJade(b));
  let home = nearest(homeList, jade.sx, jade.sy);
  if (!home) { // no residential building inside Jade turf: convert the biggest plain one nearby
    home = nearest(free((b) => inJade(b) && b.w >= 4 && b.w <= 9 && b.d <= 9), jade.sx, jade.sy);
    convert(home, 'tenement', { floors: 5, H: 55 });
  }
  home.tag = 'safehouse'; add('safehouse', home, 'Safehouse', '🏠'); world.spawn = { ...doorOf(home), y: doorOf(home).y + 8 };

  // Uncle Wei's teahouse, Madam Lin's restaurant (mission contacts), both in Chinatown.
  const ct = world.turfs.find((t) => t.name === 'Jade Teahouse Row');
  const inTurf = (b, id) => world.turfMap[(b.y + (b.d >> 1)) * world.W + b.x + (b.w >> 1)] === id;
  let tea = nearest(free((b) => b.district === 'chinatown' && b.w >= 5 && b.w <= 12 && inTurf(b, ct.id)), ct.sx, ct.sy)
    || nearest(free((b) => b.key === 'teahouse' && b.district === 'chinatown'), ct.sx, ct.sy) || nearest(free((b) => b.district === 'chinatown' && b.w >= 5), ct.sx, ct.sy);
  convert(tea, 'teahouse', { sign: { text: '玉茶軒', color: '#2fd07a', vertical: false }, neon: '#2fd07a', tag: 'wei', roof: '#2c7a6b' });
  add('contact', tea, 'Uncle Wei', '☯', { contact: 'wei' });

  let lin = nearest(free((b) => (b.key === 'restaurant' || b.key === 'dojo') && b.district === 'chinatown'), ct.sx + 400, ct.sy - 200) || nearest(free((b) => b.district === 'chinatown' && b.w >= 5), ct.sx + 300, ct.sy - 200);
  convert(lin, 'restaurant', { sign: { text: '鳳凰樓', color: '#ff3d6e', vertical: false }, neon: '#ff3d6e', tag: 'lin' });
  add('contact', lin, 'Madam Lin', '☎', { contact: 'lin' });

  // Gun shops
  const guns = [];
  for (const dist of ['chinatown', 'downtown', 'industrial']) {
    const c = free((b) => b.district === dist && b.w >= 4 && b.w <= 7 && b.key !== 'highrise' && b.w * b.d < 70);
    if (c.length) guns.push(rng.pick(c));
  }
  for (const b of guns) { convert(b, 'gunshop', { sign: { text: '軍械', color: '#ff8a2a', vertical: false }, neon: '#ff8a2a', tag: 'gunshop' }); add('shop_gun', b, 'Arms Dealer', '🔫'); }

  // Clinics, garages (pay'n'spray), police, chop shops.
  const need = (key, n, pred, tag, poiType, label, icon, extra = {}) => {
    let got = world.buildings.filter((b) => b.key === key && !b.tag && !b.poi && pred(b));
    if (got.length < n) got = got.concat(free((b) => b.key !== key && pred(b) && b.w >= 5 && b.w <= 12).slice(0, n - got.length));
    rng.shuffle(got);
    for (const b of got.slice(0, n)) { if (b.key !== key) convert(b, key); b.tag = tag; add(poiType, b, label, icon, extra); }
  };
  need('clinic', 3, (b) => b.district !== 'temple', 'clinic', 'hospital', 'Clinic', '✚');
  need('garage', 3, (b) => b.district !== 'temple', 'spray', 'spray', "Pay 'n' Spray", '🎨');
  need('police', 2, (b) => b.district === 'downtown' || b.district === 'chinatown', 'police', 'police', 'Police Station', '★');
  need('warehouse', 2, (b) => b.district === 'industrial' || b.district === 'waterfront', 'chop', 'chop', 'Chop Shop', '🚗');

  // Eateries: every restaurant sells food.
  for (const b of world.buildings) if ((b.key === 'restaurant' || b.key === 'seafood') && !b.tag && !b.poi) add('eatery', b, 'Noodle Bar', '🍜');

  // Gang hideouts (one per turf with a hideout building).
  for (const t of world.turfs) { if (t.hideout == null) continue; const b = world.buildings[t.hideout]; add('hideout', b, t.name, '⚑', { turf: t.id }); }

  // Vehicle sites (airbase, tank yard, marina) — map markers only, no building.
  const SITE = { airfield: ['airfield', '✈'], depot: ['depot', '★'], marina: ['marina', '⚓'], helipad: ['airfield', 'H'] };
  for (const s of world.sites || []) { const d = SITE[s.kind]; if (!d) continue; const at = s.runway ? { x: s.runway.x + s.runway.w / 2, y: s.runway.y + s.runway.h / 2 } : s.pad; pois.push({ id: pois.length, type: d[0], label: s.name, icon: d[1], x: at.x, y: at.y, site: true }); }

  // Dealers hide in Dragon Gate alleys.
  // two dealer spots per district so price differences between districts can actually be traded
  const spots = rng.shuffle([...world.spawns.dealers]); world.dealerSpots = [];
  for (let d = 0; d < 6; d++) world.dealerSpots.push(...spots.filter((s) => s.d === d).slice(0, d === 0 ? 3 : 2));
}
