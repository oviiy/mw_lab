# Open Outcry — Black Monday 1987

You're a trader on the S&P 500 futures floor on Monday, 19 October 1987. Traders shout deals at you. Take the good ones, keep your book small, and survive a day when the market crashes almost 30%.

Everything is in one HTML file (~640 KB). It's built with Three.js and esbuild, and the pit, people, board and sound are all generated in code.

## Run

```bash
npm install
node build.mjs        # → dist/index.html, open it in a browser
```

URL options: `?seed=123` replays a day, `?q=low|high` sets quality, and `?autoplay&speed=5` lets a bot play (used for soak tests).

## How to play

You stand on the top step. Traders in front of you pop up with a deal bubble:

- **Green BUY 5 · 261.20**: they'll sell you 5 contracts. That pays if the price then rises.
- **Red SELL 5 · 261.90**: they'll buy 5 from you. That pays if the price falls.
- **★ gold border**: a good price compared with the big board. **Grey** is a bad price, only worth taking to get out.

**Click a bubble to take the deal.** Deals stay firm at their shouted price until their timer runs out.

- **The tube** (left) is your position: green up = long, red down = short, up to 30 contracts each way.
- **Heat:** holding contracts heats the tube, faster the more you hold. At full heat the risk desk dumps you at a bad price. Being flat cools it.
- **Hold Space** to dump everything yourself. **P** pauses, **M** mutes.
- If you lose your way below $100k equity, the clerk closes you out (F).
- **Streaks:** close trades at a profit back to back. HOT (3) → ON FIRE (6) → LEGEND (10) pays a desk bonus of 25% / 50% / 100% of each win.
- **Augments:** when each phase of the day begins, the floor freezes and you pick 1 of 3 augments (silver / gold / prismatic, 15 in all, e.g. Fat Finger, Ice Pack, Golden Parachute, Market Whisperer, Double Down). Press 1–3 or click.
- Every new $50k of profit is celebrated.
- At the bell you're flattened and graded: S ≥ $500k · A ≥ $250k · B ≥ $100k · C ≥ $0 · D = loss.

The day lasts 6 real minutes. The morning chops and even rallies, then after lunch the buyers disappear. Cheap prices on a falling board are traps, so trade with the move and keep the tube small. First launch runs a two-trade intro (one buy, one sell) in slow motion.

## How the market works

- **Order book** (`src/market/orderbook.js`): price-time priority on 0.05 ticks.
- **Agents** (`src/market/agents.js`):
  - Makers quote three layers deep, with spreads that widen with volatility and panic. Past their risk limits they dump inventory ("puke").
  - The other agents each hold a target position and work it through visible *desires*. A desire stands for a few seconds before crossing the book, and in that window you can trade with it.
  - Desperate takers shout at the touch but will accept a worse price. That's your edge if you read their tells.
- **Director** (`src/market/director.js`, `calibration.js`):
  - Schedules four pressures through the day: the portfolio-insurance selling rate, value-buyer capital, the health of the arbitrage link to the NYSE, and how much risk makers will take.
  - Fitted to the approximate Oct 19 shape: gap down, chop, false rally, grind, air pocket, freefall.
  - Each run gets random crash depth, rally strength and pocket timing, plus a slow random drift.
- **Cash index** (`src/market/cash.js`): lags futures. Once the arbitrage link breaks, the futures discount opens up. You can read it as the basis on the board.

**Afternoon pressure** (so knowing the ending isn't enough):
- At 13:30 margins rise 50% and your clearing firm cuts your limit to 15 lots. Being over the limit counts as a margin call. This is a gameplay device: exchanges did raise margins around the crash, but this exact intraday timing isn't historical.
- Two or three short-covering squeezes per day rally the market 3–15 points inside the crash. Insurance selling pauses while shorts and bargain hunters stampede the offer.
- In a panicked selloff makers shrink their bids, and selling into it gets crowded out more often.

Across 50 seeds the settle lands between −22.5% and −33.4% (median −27.9%; history: −28.6%).

## Tests

```bash
npm test                                   # order book, sim calibration/determinism, Open Outcry rules (21 tests)
node test/bots.mjs 8                       # balance: scripted players (skilled, trend, naive, dip-buyer, shorter)
node test/smoke.mjs --seconds 170 --speed 24 --shots /tmp/shots   # headless Chrome soak + screenshots
node test/tune.mjs 50                      # print seeded day summaries for calibration
```

## Layout

```
src/
  market/   orderbook · agents · director · calibration · cash · sim   (pure JS, runs in Node)
  outcry.js the game rules, headless: deals from the market, tube, heat, fees, streaks, augments, bust, grade
  augments.js the 15 augments, rarity odds, streak tiers
  postfx.js bloom (NaN-guarded), 80s colour grade, vignette, grain
  main.js   fixed camera, the 7 shouters, deal bubbles, events → pit/audio
  hud.js    bubbles, tube + heat, cash, prompts, end card, charts
  pit.js traders.js effects.js textures.js quality.js audio.js
docs/design.md   design history, including the redesign
```

Anchor prices are approximate: Dec '87 S&P futures prior settle 282.25, Oct 19 settle ≈ 201.50. Firm names and badges are fictional.
