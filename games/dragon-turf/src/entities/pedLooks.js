import { FACTIONS } from '../data/factions.js';
import { rand } from '../core/rng.js';

// Appearance generator. A look is a plain record + a string id used as the sprite cache key.
const SKIN = ['#f1c9a5', '#e8b88a', '#d9a47c', '#c48a5e', '#a9724d'];
const HAIR = ['#15121a', '#241a14', '#3a2a1e', '#5a4a3a', '#8a8a92', '#e6e2da'];
const TOPS = ['#c8453b', '#2a6fb0', '#e8e4d8', '#2f8f6a', '#d99a2b', '#7d4a8a', '#3a3a46', '#d6577a', '#5a7a9a', '#9a5a3a'];
const BOTTOMS = ['#2b3550', '#23232b', '#4a4036', '#5a5a64', '#3a4a3a', '#6a4a3a'];
const SHOES = ['#1c1a20', '#3a2a22', '#e8e4d8'];

function finish(l) {
  l.id = [l.skin, l.hair, l.top, l.bottom, l.hat || '', l.hatColor || '', l.vest || '', l.scarf || '', l.hairStyle || '', l.shades ? 's' : '', l.tattoo || '', l.build.toFixed(1)].join('');
  return l;
}

export function civilianLook(kind = 'walker') {
  const l = {
    skin: pick(SKIN), hair: pick(HAIR), top: pick(TOPS), bottom: pick(BOTTOMS), shoes: pick(SHOES), build: rand.range(-0.3, 0.7),
    hairStyle: pick(['short', 'short', 'bun', 'long', 'spiky']), hat: null,
  };
  if (kind === 'vendor') { l.hat = 'straw'; l.top = pick(['#e8e4d8', '#4a7a5a', '#a8453b']); }
  else if (kind === 'elder') { l.hair = '#e6e2da'; l.top = pick(['#5a7a5a', '#8a5a3a', '#3a4a6a']); l.build = 0.4; }
  else if (kind === 'worker') { l.hat = 'cap'; l.hatColor = '#e0a233'; l.top = '#e0a233'; l.vest = '#ff9a2a'; }
  else if (kind === 'biz') { l.top = pick(['#2a2a36', '#3a3a46', '#e8e4d8']); l.bottom = '#23232b'; l.hat = rand.chance(0.15) ? 'fedora' : null; l.hatColor = '#2a2428'; }
  else if (rand.chance(0.12)) { l.hat = 'beanie'; l.hatColor = pick(TOPS); }
  return finish(l);
}

export function gangLook(faction) {
  const f = FACTIONS[faction];
  const l = {
    skin: pick(SKIN), hair: pick(HAIR.slice(0, 3)), top: f.suit, bottom: '#23232b', shoes: '#1c1a20', build: rand.range(0.1, 0.9), hairStyle: pick(['short', 'spiky', 'short']),
    hat: rand.chance(0.5) ? 'bandana' : null, hatColor: f.color, trim: f.color, shades: rand.chance(0.35), tattoo: rand.chance(0.5) ? f.color : null,
  };
  return finish(l);
}

export function bossLook(faction) {
  const f = FACTIONS[faction];
  return finish({ skin: pick(SKIN.slice(0, 3)), hair: '#15121a', top: f.suit, bottom: '#15151c', shoes: '#111', build: 1.0, hairStyle: 'short', hat: 'fedora', hatColor: '#15121a', trim: f.color, shades: true, scarf: f.color });
}

export function copLook(level = 'cop') {
  if (level === 'swat') return finish({ skin: pick(SKIN), hair: '#15121a', top: '#1d2330', bottom: '#14181f', shoes: '#0c0c10', build: 1.1, hat: 'helmet', vest: '#2a3140', hairStyle: 'short' });
  return finish({ skin: pick(SKIN), hair: pick(HAIR.slice(0, 3)), top: '#2a4f9a', bottom: '#1c2640', shoes: '#111', build: rand.range(0.2, 0.8), hat: 'cap', hatColor: '#1c2a5a', hairStyle: 'short', trim: '#f1c64a' });
}

export function playerLook() {
  return finish({ skin: '#f1c9a5', hair: '#15121a', top: '#1c1c24', bottom: '#2b3550', shoes: '#e8e4d8', build: 0.6, hairStyle: 'spiky', scarf: '#e23b2e', hat: null, shades: false });
}

function pick(a) { return a[(rand.next() * a.length) | 0]; }
