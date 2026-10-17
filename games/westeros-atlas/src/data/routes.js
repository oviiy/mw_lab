// Optional character journeys — SPOILERS (they reveal plot movement). Hidden unless the visitor enables spoilers.
// stops are location ids; the map draws a smoothed dashed path through their map positions.
// Stops are simplified to registry places on (or near) each book route; they are not every waypoint.
export const ROUTES = [
  { id: 'eddard', color: '#c0392b', stops: ['winterfell', 'moat-cailin', 'kings-landing'], names: { en: 'The King\'s Hand rides south', zh: '首相南下' }, note: { en: 'Down the kingsroad from the North, through the Neck and across the Trident, to the capital (A Game of Thrones).', zh: '沿国王大道离开北境，穿过颈泽、渡过三叉戟河，直抵都城（《权力的游戏》）。' } },
  { id: 'daenerys', color: '#e08a1e', stops: ['pentos', 'vaes-dothrak', 'qarth', 'astapor', 'yunkai', 'meereen'], names: { en: 'Across the grass and the bay', zh: '穿越草海与奴隶湾' }, note: { en: 'From the Free Cities through the Dothraki Sea and the Red Waste to Qarth, then on to the Slaver cities.', zh: '从自由贸易城邦出发，穿过多斯拉克海与红色荒原抵达魁尔斯，再转赴奴隶湾诸城。' } },
  { id: 'arya', color: '#3d7ea6', stops: ['kings-landing', 'harrenhal', 'the-twins', 'braavos'], names: { en: 'A girl runs from the capital', zh: '逃离都城的女孩' }, note: { en: 'From King\'s Landing through the war-torn Riverlands, then over the narrow sea to Braavos.', zh: '从君临出发，穿过战火中的河间地，再渡过狭海前往布拉佛斯。' } },
  { id: 'jon', color: '#6b6f78', stops: ['winterfell', 'castle-black'], names: { en: 'To the Wall', zh: '北上长城' }, note: { en: 'From Winterfell up the kingsroad to the Night\'s Watch at Castle Black.', zh: '从临冬城沿国王大道北上，加入黑城堡的守夜人军团。' } },
  { id: 'tyrion', color: '#8e44ad', stops: ['kings-landing', 'pentos', 'selhorys', 'volantis', 'meereen'], names: { en: 'Exile across the sea', zh: '渡海流亡' }, note: { en: 'A long flight from the capital: across the narrow sea, down the Rhoyne and on to the Slaver cities.', zh: '逃离都城的漫长旅程：渡过狭海，沿洛恩河而下，远赴奴隶湾诸城。' } },
];
