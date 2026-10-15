// The four crews fighting over Dragon Street. `id` is stable (used in saves).
export const FACTIONS = {
  none:   { id: 'none',   name: 'Independent',      color: '#8a8f99', dark: '#4a4e57' },
  jade:   { id: 'jade',   name: 'Jade Serpents',    color: '#2fd07a', dark: '#12603a', boss: 'Uncle Wei',    suit: '#1f8f58', hat: null,  weapon: 'pistol' },
  dragon: { id: 'dragon', name: 'Red Dragons',      color: '#ff4a3a', dark: '#7a1a14', boss: 'Brother Hu',   suit: '#8a1d1d', hat: null,  weapon: 'smg' },
  lotus:  { id: 'lotus',  name: 'Black Lotus',      color: '#b06cff', dark: '#4a2a7a', boss: 'Madam Orchid', suit: '#3a2a52', hat: null,  weapon: 'pistol' },
  tiger:  { id: 'tiger',  name: 'Iron Tigers',      color: '#ffa93a', dark: '#7a4a10', boss: 'Big Tiger Mo', suit: '#7a4a1a', hat: null,  weapon: 'shotgun' },
};
export const FACTION_IDS = ['jade', 'dragon', 'lotus', 'tiger'];
export const PLAYER_FACTION = 'jade';
// Who hates whom (jade is the player's own crew).
export const isEnemy = (a, b) => a !== b && a !== 'none' && b !== 'none';
