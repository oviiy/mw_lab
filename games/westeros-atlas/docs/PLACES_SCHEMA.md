# Places, houses & people — data schema (read before writing data)

All data is bilingual. Chinese must be natural, edited prose and must follow docs/GLOSSARY.md (one rendering per name).
Write ORIGINAL short summaries (2–4 sentences); never copy wiki or book text. Books first, then official maps / author, then
The World of Ice & Fire (TWOIAF); never the HBO show. Spoilers (later-book events, deaths, secret parentage) go ONLY in `spoiler`
/ `fate` fields or members marked `spoiler: true`.

## Places — `src/data/places/<group>.js`
```js
export default { group: 'north', places: [
  {
    id: 'deepwood-motte',              // kebab-case, globally unique, stable
    kind: 'castle',                    // city|town|village|castle|ruin|sacred|inn|landmark|battle  (settlements, get a marker)
                                       // island|mountain|forest|lake|river|desert|swamp|pass|bay       (nature, drawn as a label)
    region: 'north',                   // a region id from src/data/regions.js
    at: [x, y],                        // map coordinates — use docs/MAP_GRID.md anchors; check with tools/mapview.mjs --all
    rank: 3,                           // 5 = visible at world zoom … 1 = only when zoomed far in. Use 4–5 sparingly.
    names: { en: 'Deepwood Motte', zh: '深林堡' },
    alt: ['Deepwood'],                 // other spellings / Chinese variants for search
    summary: { en: '2–4 sentences.', zh: '2–4 句。' },
    houses: ['glover'],                // house ids associated with the place (seat holder first)
    refs: ['agot', 'twoiaf'],          // keys of src/data/sources.js
    confidence: 'high',                // how sure the existence/description/position is: high|medium|low
    spoiler: { en: '…', zh: '…' },     // OPTIONAL later-book information
  },
] };
```
The 40 places that already have 3D scenes live in `src/data/locations.js`. Do NOT redefine them; to give one a summary and houses, add an entry with
the SAME id and only `{ id, summary, houses, refs, confidence }` (position/kind/names come from locations.js).

## Houses — `src/data/houses/<group>.js`
```js
export default { group: 'north', houses: [
  {
    id: 'stark',                                   // kebab-case, globally unique
    names: { en: 'House Stark', zh: '史塔克家族' },
    region: 'north', seat: 'winterfell',           // seat = place id (must exist in places or locations.js); otherSeats: [...] optional
    tier: 'great',                                 // great (paramount/royal) | major | minor | extinct
    liege: null,                                   // house id of the overlord, or null
    sigil: { en: 'A grey direwolf running across an ice-white field', zh: '…' },
    colors: ['#e9ecef', '#7a7e86'],                // field colour first, charge colour second (used for a small shield swatch)
    words: { en: 'Winter Is Coming', zh: '凛冬将至' },   // omit if unknown
    summary: { en: '2–4 sentences', zh: '…' },
    refs: ['agot', 'twoiaf'],
    members: [ /* optional: only for houses that get a family tree */
      { id: 'eddard-stark', name: { en: 'Eddard Stark', zh: '艾德·史塔克' }, father: 'rickard-stark', mother: 'lyarra-stark',
        spouses: ['catelyn-tully'], note: { en: 'Lord of Winterfell, Warden of the North.', zh: '…' },
        fate: { en: '…', zh: '…' },           // OPTIONAL, later-book fate — hidden unless the visitor enables spoilers
        spoiler: false },                      // true = the person's existence/identity itself is a spoiler
    ],
  },
] };
```
Person ids are globally unique (`given-family`, e.g. `catelyn-tully`). A person is defined ONCE, in their house of birth; other houses refer
to them by id (as spouse/parent). Family trees are built from father/mother/spouses links across all houses.
Members appear in the tree in generation order; include roughly 3–4 generations for great houses.
