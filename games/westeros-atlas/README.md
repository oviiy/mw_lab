# Atlas of Ice & Fire · 冰与火地图集

A bilingual (English / 简体中文) interactive atlas of the known world of *A Song of Ice and Fire*. It opens on an illustrated,
zoomable world map and dives — through a smooth map-to-scene transition — into lazily loaded, explorable 3D reconstructions of
40 cities, castles, ruins and sacred sites, each with clickable landmarks, a guided tour, atmosphere controls and an honest
**Sources & interpretation** panel that separates what the books establish from what this atlas invents.

No account, API key or backend is needed. Everything (map art, textures, geometry) is original and procedural.

## Gazetteer (places, houses, family trees)
Besides the 40 explorable 3D locations, the map carries a gazetteer of ~490 named places — cities, towns, villages, castles, ruins,
inns, sacred sites, battlefields, and natural features (rivers, mountains, forests, lakes, islands) — each with a short EN/中文
introduction and a confidence level, plus ~240 noble houses and families (sigil, words, seat, liege, summary) and family trees for the
great houses. Click any marker for its card; click a house for its panel and tree; search finds places, houses and people in either
language. Fates and secret parentage stay hidden until spoilers are enabled. Data: `src/data/places/*.js`, `src/data/houses/*.js`
(schema in `docs/PLACES_SCHEMA.md`), positions per `docs/MAP_GRID.md` (1 map unit ≈ 2 miles).

## Quick start

```bash
cd westeros-atlas
unset NODE_OPTIONS        # only if your shell sets a conflicting --use-openssl-ca / --use-system-ca pair
npm install               # three, esbuild, playwright-core (dev tooling only)
npm run dev               # watch + serve → http://localhost:5173
npm test                  # validates data, bilingual parity, sources, tours, landmark ids
npm run build             # production build → dist/  (static files; host anywhere)
```

Deploy `dist/` to any static host (GitHub Pages, Netlify, S3 …). Deep links work from a static host (hash routing):
`#/m/<id>` (map preview), `#/l/<id>` (enter location), `#/l/<id>/<landmark>`, `#/r/<region>`; `?lang=zh` forces a language.

## Using it
* **Map:** drag to pan, wheel / pinch to zoom, double-click a place to enter it. Click a place for its card, then *Enter location*.
  Keyboard: focus the map, arrows pan, `+ -` zoom, `Home` world, `[` `]` step between places, `Enter` opens, `/` searches.
* **Search** works in English and Chinese, on alternate spellings, regions, place types and landmark names — whatever language the UI is in.
* **Filters** (city, castle, town/port, ruin, sacred) and a searchable **directory** (☰). **Journeys** (character routes) appear only after enabling spoilers.
* **Inside a location:** orbit / zoom / pan, hero & overhead views, guided tour, dawn–night, clear/snow/rain/fog, cutaways where the books support interiors,
  *Return to map* always at top-left. Settings (⚙): quality (auto/low/medium/high), spoilers, reduced motion, labels.

## Architecture (short)
| Concern | Where | Why |
|---|---|---|
| World map | `src/map/` — Canvas 2D, procedural raster base + live vector layers | Cheap, crisp, no 3D needed for a 2.5D illustrated map; label decluttering by rank/zoom |
| Location scenes | `src/scenes/<id>.js` + `src/kit/` — Three.js, lazy chunks | One file per place; shared kit (triplanar materials, batching, water, sky, life) keeps draw calls low |
| Scene host | `src/host/SceneHost.js` | Renderer, camera flights, picking, pins, tours, cutaways, atmosphere, weather, quality tiers |
| Content | `src/content/<id>.js` | Stable landmark ids; English + Chinese text, tour order, per-landmark source notes |
| Registry data | `src/data/` | Locations, regions, routes, global source register |
| i18n | `src/i18n/` | Structured UI string tables with key-parity tests; `{en, zh}` pairs for place content |
| App shell | `src/app.js`, `src/ui/` | Routing, search, directory, cards, HUD, modals; Three.js is only downloaded when the first location is entered |
| Build | `build.mjs`, `tools/gen.mjs` | esbuild ESM code-splitting; registry & landmark search index generated from the files present |

The first load ships only the map shell (~100 KB JS); every city is its own chunk, fetched on selection/hover prefetch.
Rendering: HDR MSAA pipeline with soft bloom (high quality), film grade (cool shadows, warm highlights, vignette, grain), triplanar bump-mapped materials, shadows on medium/high.
Performance: merged static batches, instancing for trees/props, GPU-animated water/smoke/weather, quality tiers (shadows, density, pixel ratio),
reduced-motion support, and a written-guide fallback when WebGL is unavailable.

## Honesty & sources
See `docs/SOURCES.md` and the in-app *Sources & method* panel. The novels' text was **not** open during construction; each source note says whether a
claim was *recalled from memory*, *confirmed by a search summary* or *not accessed*. The HBO series is not a source. `docs/COVERAGE.md` lists what is modelled,
how deeply, and what was considered but left out.

## Licences
Project code: MIT-style (see `LICENSE`). Three.js (MIT). No third-party art, fonts, maps or book passages are bundled — see `docs/SOURCES.md`.
*A Song of Ice and Fire* is © George R. R. Martin; this is an unofficial fan project.
