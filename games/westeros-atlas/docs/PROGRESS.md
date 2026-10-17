# Progress & remaining work

## Done (v1.0)
* 2D illustrated world map (aged-parchment style, terrain-driven painted glyphs, bilingual labels, filters, search, directory, spoiler-gated journeys, legend, compass, scale).
* 40 explorable 3D locations, each lazy-loaded with 6–16 clickable landmarks, hero/overhead views, guided tour, dawn–night, weather, source & interpretation panel; cutaway interiors where the books support them.
* Full EN / 简体中文 UI and content (key-parity tests), persisted language, reduced-motion, quality tiers, WebGL-less written-guide fallback.
* Tests: `npm test` (data/content/i18n), `node tools/e2e.mjs` (every location end-to-end in headless Chrome).

## Review & polish passes (after v1.0)
* Rendering upgrade: HDR + MSAA, soft bloom (high), film grade, vignette; retuned dawn/day/dusk/night; night-aware clouds/smoke; softer broken surf; irregular ashlar stone texture.
* Two art polish passes over all 40 scenes, then an art-director critique pass on the flagships (King's Landing, Winterfell, Braavos, Oldtown, Meereen, Qarth, Volantis).
* Content review of all 40 places for book accuracy (removed HBO-isms such as Casterly Rock's dry mines, Sam in the library, the High Sparrow; fixed e.g. Traitor's Walk, the Twins' east/west banks, the Eyrie's godswood, Harrenhal's hearth count, Volantis' Merchant's House), honest confidence levels, and rewritten Chinese.
* Glossary consolidated toward the Chinese edition's renderings (阳戟城, 卡林湾, 艰难屯, 参天塔, 徒利 …); older renderings kept only as search aliases.
* Character journeys corrected to the books (Eddard via Moat Cailin; Jon never goes to Hardhome).

## Known limitations / honest gaps
* Source notes were written without the novels' text in front of the authors (see `docs/SOURCES.md`); wiki pages could not be fetched. Confidence labels are conservative; contributions welcome.
* Chinese renderings of some proper nouns are project transliterations (marked ◇ in `docs/GLOSSARY.md` or listed in scene reports) — please replace with the official Chinese edition's terms if you have it.
* Perf was measured with software GL only. Scene geometry is ~130k–265k triangles at high quality; with the shadow pass the renderer reports roughly 1.5× that and up to ~180 draw calls on the densest cities. Real-GPU profiling on phones is still to do; 'low' quality disables shadows and post-processing.
* Cutaway interiors exist for the places where a real interior is described (Winterfell ×2, King's Landing, Dragonstone, Castle Black, the Eyrie, Harrenhal, Oldtown, Meereen, Qarth, …); others deliberately have none.

## Next batches (candidates)
Duskendale, Maidenpool, the Dreadfort, Starfall, Skyreach, Tarth, Skagos, Old Ghis, Lhazar, Bayasabhad; more cutaways (Great Sept, Casterly Rock mines); richer map terrain in Essos' interior once more is established; audio ambience (opt-in).
