# Map notes — what is invented and why

* **No published map was traced or copied.** Coastlines are original hand-authored control points on a 3200 × 2000 canvas (see `docs/MAP_GRID.md`), smoothed
  (Catmull-Rom) and roughened with seeded noise; terrain, relief, biome washes and paper grain are generated procedurally at start-up
  (`src/map/basemap.js`).
* **Scale:** 1 map unit ≈ 2 miles (≈ 3.2 km), pinned to the one hard number the books give — the Wall is ~300 miles long (≈ 155 units).
  Everything else is relative: Wall → southern Dorne ≈ 1,030 units (~2,100 mi), the Narrow Sea ≈ 130 units at the Stepstones and ≈ 220 units
  Dragonstone → Pentos, Volantis at Dorne's latitude, Essos roughly five times as wide as Westeros. GRRM has also spoken of Westeros as
  ~3,000 miles long; the map follows the Wall-based reading. The scale bar says “approx.”.
* **Named geography** (rivers, ranges, lakes, forests, swamps, deserts, capes, islands) lives in `src/map/geo.js` with ids and EN/中文 names;
  courses of minor rivers and the far east are schematic and flagged `approximate` there.
* **Placement:** relative positions follow the books (e.g. Winterfell north of the Neck, King's Landing at the head of Blackwater Bay, Braavos and
  Pentos on the western coast of Essos, Volantis at the Rhoyne's mouth, the Slaver cities on the bay, Qarth far east). Interiors of Essos — mountains,
  rivers, forests — are **schematic**; the legend says so.
* **Limits of knowledge:** the far east (Yi Ti, the Shadow Lands, Asshai), Sothoryos and the Summer Isles are shown sparsely on purpose. Places with thin
  source material (e.g. Yin, Asshai, Valyria, Port of Ibben, Tall Trees Town) open restrained, clearly interpretive scenes.
* **Never reproduced:** HBO production maps/designs, published endpaper art, third-party art.
