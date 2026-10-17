// Place kinds. Settlement kinds get map markers; nature kinds are drawn as map labels only.
export const SETTLEMENT_KINDS = ['city', 'town', 'village', 'castle', 'ruin', 'sacred', 'inn', 'landmark', 'battle'];
export const NATURE_KINDS = ['island', 'mountain', 'forest', 'lake', 'river', 'desert', 'swamp', 'pass', 'bay'];
export const ALL_KINDS = [...SETTLEMENT_KINDS, ...NATURE_KINDS];
/** Filter chips group several kinds. */
export const FILTERS = [
  { id: 'cities', kinds: ['city'] },
  { id: 'towns', kinds: ['town', 'village'] },
  { id: 'castles', kinds: ['castle'] },
  { id: 'ruins', kinds: ['ruin', 'battle'] },
  { id: 'sacred', kinds: ['sacred'] },
  { id: 'other', kinds: ['inn', 'landmark'] },
  { id: 'nature', kinds: NATURE_KINDS },
];
export const isNature = (k) => NATURE_KINDS.includes(k);
