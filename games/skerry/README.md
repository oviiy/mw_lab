# Skerry

Raise hexagonal basalt columns out of a cold northern sea and grow a little Faroe-style island, one tile at a time.

- **Play:** place each tile beside your island. Every side that matches its neighbour scores 10. The tile turns to its best fit for whichever spot you point at; turn it yourself with `R` / right-click (`Q` turns back), or the arrows on touch.
- **Water must meet water.** Red marks on the floating tile show sides that can't touch.
- **Snug and perfect fits:** match both sides of a tile with two neighbours for a snug fit (+10). Match all sides of a tile with three or more neighbours for a perfect fit (+10 per neighbour and an extra tile).
- **Sealing off:** close an area of four or more tiles so it has no open edges left, for 10 points per tile. If it touches three or more neighbours you also get an extra tile.
- **Streaks:** snug and perfect fits in a row build a streak; each one multiplies the next good fit's points (×1.25, ×1.5 … up to ×2). Anything looser breaks it.
- **Ranks:** the bar under your score shows the next rank (Skerry 250, Holm 600, Isle 1,300, Archipelago 2,400, Haven 3,100, Seaport 3,800, Kingdom 4,500). Reaching one wins 2 tiles and brings new life: puffins, a lighthouse, fishing boats, whales, seals on the skerries, a pier with a ferry, and the northern lights.
- **Isle types:** every isle (fixed by its seed, so a daily is the same for everyone) has a twist, shown as it rises and beside the score. Lake isle: more lakes, matching lake sides score 20. Wild isle: more forest, sealed forests pay 20 a tile. Market isle: more villages, requests come more often and pay 15 points a tile. Tidal isle: streaks run up to ×2.5. Rugged isle: four fewer tiles, perfect fits score 20 a side.
- **Hint:** the Hint button (or `H`) puts a golden light on the best spot. The first game is guided step by step with that light.
- **Auto-play:** "Watch a demo" on the title screen plays a free isle by itself, putting each tile on the best spot. During a game the Auto button (or `P`) does the same. A game that used auto-play isn't kept: no journal, best scores or daily run.
- **Requests:** some tiles carry a flag. Grow that forest, field, village, meadow or lake to the size shown and you win 3 tiles. If the area gets closed off, the request is lost. The label over the floating tile warns before a move closes off a request, and shows any sealing bonus it would earn.
- The game ends when your stack runs out. Each day has one **daily isle** (the same tiles for everyone, `?day=21`); the first finished run counts and keeps your day streak going. **Free play** isles get a number you can share (`?isle=123456`).
- Your island gets a rank: Rock, Skerry, Holm, Isle, Archipelago, Haven, Seaport or Kingdom. The end screen copies a Wordle-style result with one square per tile and a challenge link (`&vs=1240`) that shows your friend the score to beat. During play the score to beat (a friend's, or your own best) sits under your score, and passing it gets a banner.

Each game runs from dawn to a lantern-lit night as the stack empties. The **journal** (title screen or pause menu) keeps 22 achievements across games, such as "Deep woods" for a 10-tile forest. Progress, tips, volume and streaks are kept in `localStorage`.

## Stack

Same as the other games in this repo: Three.js + esbuild, bundled into a single `dist/index.html`. There are no external images, fonts or audio. The terrain, houses, trees, sheep, sea, sky and sound are all generated in code.

| Module | Role |
| --- | --- |
| `board.js` | Rules: placement, scoring, union-find terrain regions, requests, tile stack |
| `tiles.js` / `hex.js` / `rng.js` | Tile generation, flat-top axial hex maths, seeded randomness and daily seed |
| `tileMesh.js` | Procedural tiles with per-terrain decoration; placed tiles are rebuilt from their neighbours so the island is one seamless landmass with a natural coastline, cliffs, foam and shallows |
| `world.js` | Sky dome, wave-shader sea, sun and shadows, dawn-to-night cycle, gulls |
| `life.js` | Rank-up arrivals: puffins, lighthouse with beam, fishing boats, whales, seals, pier and ferry, northern lights |
| `journal.js` | Achievements and lifetime totals |
| `camera.js` / `particles.js` / `audio.js` | Camera framing, splashes and glints, Web Audio synthesis |
| `ui.js` / `main.js` / `index.html` | HUD, tutorial, screens, input and game flow |

## Build & test

```bash
npm install
node build.mjs        # -> dist/index.html (open it directly in a browser)
npm test              # rules unit tests (node:test)
```

## Deploy

GitHub Pages, via `.github/workflows/deploy-skerry.yml` at the repo root. It runs on every push to `main` that touches `skerry/`: it installs, runs the unit tests, builds, and publishes `skerry/dist`. In the repository's settings, set Settings → Pages → Source to **GitHub Actions** once.
