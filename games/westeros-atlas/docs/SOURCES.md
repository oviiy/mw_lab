# Sources, method and licences

## Hierarchy (as requested)
1. The five published novels — *A Game of Thrones*, *A Clash of Kings*, *A Storm of Swords*, *A Feast for Crows*, *A Dance with Dragons*.
2. Official maps and author statements.
3. *The World of Ice & Fire* and other official companion material (always labelled).
4. Reputable indexes (A Wiki of Ice and Fire; Westeros.org Concordance) to *discover* references.
The HBO series is never used for architecture, geography, costume or chronology.

## What was and was not checked (please read)
The authors had **no direct access to the novels' text**. Claims were written from recollection of the books and companions, and — where the
tooling allowed — spot-confirmed with web-search summaries (the wiki pages themselves could not be fetched: TLS error in the build environment).
Each location's `src/content/<id>.js` therefore carries a `sources[]` register with a `checked` field:
`memory` · `search-snippet` · `not-accessed`. Nothing is labelled as verified against the primary text. Every landmark has
`book` (what sources establish), `unknown`, `interpretation`, `confidence` and `refs`. Treat `confidence:'high'` as “widely attested and recalled with
confidence”, not “proof-read”. Corrections via pull request are welcome.

## Licences
* All geometry, textures, map art, UI icons: original, procedural.
* Three.js — MIT (bundled). esbuild — MIT (dev). playwright-core — Apache-2.0 (dev only, screenshots).
* Fonts: system fonts only (Cormorant Garamond is named first for users who have it installed; nothing is downloaded).
* No book passages are reproduced beyond short factual paraphrase.
