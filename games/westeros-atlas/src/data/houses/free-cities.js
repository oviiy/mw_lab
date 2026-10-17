// Houses of this group — see docs/PLACES_SCHEMA.md
// Essos has few "houses" in the Westerosi sense. Only families the books or TWOIAF name as families are listed; no sigils or words
// are recorded for them, so the sigil field says so and the colours are neutral placeholders.
const NO_SIGIL = { en: 'No sigil is recorded in the books.', zh: '书中未提及其纹章。' };
export default { group: 'free-cities', houses: [
  {
    id: 'maegyr',
    names: { en: 'Maegyr family', zh: '梅耶尔家族' },
    region: 'free-cities', seat: 'volantis', tier: 'minor', liege: null,
    sigil: NO_SIGIL, colors: ['#3a3a3a', '#c9a227'],
    summary: {
      en: 'An old-blood Volantene family. In A Dance with Dragons Malaquo Maegyr sits as a triarch and leads the "tigers", the war faction that favours conquest and the sword.',
      zh: '瓦兰提斯的旧血脉家族之一。在《魔龙的狂舞》中，马拉夸·梅耶尔身为执政官，领导主张征伐的“老虎党”。',
    },
    refs: ['adwd'],
  },
  {
    id: 'vhassar',
    names: { en: 'Vhassar family', zh: '瓦萨尔家族' },
    region: 'free-cities', seat: 'volantis', tier: 'minor', liege: null,
    sigil: NO_SIGIL, colors: ['#3a3a3a', '#8a8f98'],
    summary: {
      en: 'A Volantene family; Nyessos Vhassar is one of the three triarchs in A Dance with Dragons and belongs to the "elephants", the faction of merchants and moneylenders favouring trade over war.',
      zh: '瓦兰提斯家族之一；在《魔龙的狂舞》中，尼索斯·瓦萨尔是三位执政官之一，属于偏重贸易而非战争的商人与放贷者派系“大象党”。',
    },
    refs: ['adwd'],
  },
  {
    id: 'paenymion',
    names: { en: 'Paenymion family', zh: '佩尼米昂家族' },
    region: 'free-cities', seat: 'volantis', tier: 'minor', liege: null,
    sigil: NO_SIGIL, colors: ['#3a3a3a', '#8a8f98'],
    summary: {
      en: 'A Volantene family; Doniphos Paenymion is named as a triarch in A Dance with Dragons, sitting alongside Malaquo Maegyr and Nyessos Vhassar.',
      zh: '瓦兰提斯家族之一；《魔龙的狂舞》中提到多尼佛斯·佩尼米昂担任执政官，与马拉夸·梅耶尔、尼索斯·瓦萨尔共治。',
    },
    refs: ['adwd'],
  },
  {
    id: 'rogare',
    names: { en: 'House Rogare', zh: '罗加尔家族' },
    region: 'free-cities', seat: 'lys', tier: 'minor', liege: null,
    sigil: NO_SIGIL, colors: ['#5b3a6e', '#d8c27a'],
    summary: {
      en: 'A Lysene banking family that rose to great wealth and power in the century after the Conquest. Larra Rogare married Prince Viserys Targaryen, the future Viserys II, before the family\'s fortunes collapsed.',
      zh: '里斯的一个银行世家，在征服后约一个世纪间积累了巨额财富与权势。拉拉·罗加尔嫁给了韦赛里斯·坦格利安王子，即后来的韦赛里斯二世；此后家族盛极而衰。',
    },
    refs: ['twoiaf'],
  },
] };
