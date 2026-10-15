# Trading Floor '87 — Design

**Date:** 2026-10-14
**Status:** Approved design, pending spec review
**Location:** `~/MW/Personal/up/trading-floor-87/`

## 1. Intent

A 3D arcade game set in the CME S&P 500 futures pit on Monday, 19 October 1987 (Black Monday). The player is a local trader who survives — or profits from — the crash by making eye contact and flashing hand signals in a roaring open-outcry pit.

Quality bar: the `claude-opus-5-5-demo` games (Neon Heist, Pirate Frigate, etc.) — single-file HTML, everything procedural, multiple interlocking systems, adaptive quality, soak-tested.

**Success criteria**

- Fun inside the first 2 minutes without reading instructions twice.
- The crash *feels* terrifying: noise, shoving, liquidity vanishing, the board screaming red.
- The market model survives scrutiny from a finance professional: prices emerge from an order book and agent behaviour, not a canned line; the player's own trades move the price.
- Every run reaches a crash of historically plausible magnitude, but no two runs are identical.

**Decided (with the user):** arcade pit action · one compressed Black Monday session · look-and-signal trading verb · local trader with optional broker tickets · agent-based market with a calibrated director (Approach A).

**Assumed (not explicitly confirmed):** same stack as the demos (Three.js + esbuild → one HTML file, no external assets); desktop-first, touch is a stretch goal; no deployment unless asked.

**Non-goals:** multiplayer; multiple days/scenarios; electronic trading screens; realistic clearing/settlement; historical tick-perfect replay.

## 2. Player experience

### 2.1 The session

The real session (08:30–15:15 CT) is compressed to ~12 real minutes. The wall clock shows pit time.

| Phase | Pit time | Market character |
|---|---|---|
| Opening gap | 08:30–09:00 | Bell. Opens sharply below Friday's settle. Heavy two-way flow. |
| Morning chop | 09:00–10:30 | Volatile but tradeable; makers quoting; value buyers active. |
| False rally | 10:30–11:30 | Bounce as value buyers and shorts covering lift price. |
| Grind | 11:30–13:00 | Portfolio-insurance selling resumes; spreads widen. |
| Air pocket | ~13:00–14:00 | Index-arb link breaks; makers pull; gap lower. |
| Freefall | 14:00–15:15 | Relentless selling, thin book; closing bell. |

Contract: $500 × index, tick 0.05 = $25. Calibration target: futures settle ~25–32% below the prior close (historical ≈ −29%). Anchor values are verified against sources during implementation.

Visual clocks: wall clock, light through windows shifting, trading cards piling on the floor.

### 2.2 Core verb — look + signal

1. **Look**: mouse-look across the pit. The trader under the reticle within *contact range* highlights. A trader who is willing to deal with you meets your eyes (rim light); one who isn't looks away.
2. **Set price & size**: `1–9`, `0` set the last price digit relative to the current market (the HUD shows the absolute price); `Q`/`E` step quantity (1, 5, 10, 25, 50 lots).
3. **Signal**: left-click = **buy** (palm in), right-click = **sell** (palm out). The player's first-person arms animate the signal.
4. **Fill resolution** (within ~300–600 ms): filled if (a) the target agent currently intends the opposite side, (b) your price is at or through their limit, and (c) no faster competing local claims them first. Partial fills allowed.
5. Fills are written on the on-screen **trading card** (price, qty, counterparty badge).

**Readable tells**: each agent's current intent shows as their own hand signal, posture (leaning in = aggressive), and badge flash. Skilled play = reading tells + the board, not guessing.

### 2.3 Broker tickets (side jobs)

Runners push through the crowd with tickets, e.g. `SELL 20 MKT · 30s` or `BUY 10 LMT 254.00 · 45s`.

- Accept (`F` when the runner is near) or ignore.
- Fill them with the same look+signal verb, but they don't touch your own position.
- Graded on slippage vs. arrival price. Rewards: commission + **reputation**.
- Failing (timeout, bad slippage) costs reputation.

**Reputation** scales contact range and the probability agents meet your eyes.

### 2.4 Risk and failure

- Starting equity, initial and maintenance margin per contract (tuned; ~1987-plausible ratios).
- Below maintenance: clerk warning (phone rings, HUD flash, heartbeat audio), grace period ~20 pit-minutes.
- Still below at grace end, or equity ≤ 0: the firm liquidates at market → **game over** screen.
- Position limit caps the player's net contracts.

### 2.5 Scorecard

End-of-day (or blow-up) screen: realized/unrealized P&L, max drawdown, trades count, best/worst trade, broker-ticket report (implementation shortfall split into delay cost vs. execution cost), a survival grade (S/A/B/C/F), and your equity curve overlaid on the session's price path. Best result per browser in `localStorage`.

### 2.6 Interlocking systems

- **Noise**: crowd loudness ∝ recent order flow. Higher noise shrinks contact range and fill-timing windows.
- **Panic** (0–1, from volatility + drawdown of price): agents shove (camera knock, brief look disruption), signal faster, makers widen/pull.
- **Wall board**: futures last/change, NYSE cash index, and the futures–cash basis. Cash lags futures (DOT delays) — the visible basis gap is a readable edge.
- **Reputation ↔ tickets ↔ access**: tickets build reputation; reputation buys access during the crash when everyone is ignoring everyone.

### 2.7 Controls

| Input | Action |
|---|---|
| Mouse | Look (pointer lock on click) |
| Left / Right click | Buy / Sell signal to the trader you're looking at |
| `1–9`, `0` | Price last digit |
| `Q` / `E` | Quantity down / up |
| `F` | Accept nearby ticket |
| `Space` | Flatten position (sends market order to best counterparties in view — costly) |
| `Tab` | Expand trading card / ticket list |
| `P` / `Esc` | Pause |
| `M` | Mute |

## 3. Market engine

Pure JavaScript, no Three.js or DOM dependency — runs headless in Node.

### 3.1 Order book (`market/orderbook.js`)

- Price-time priority limit order book, integer tick prices (tick = 0.05).
- Operations: add limit, cancel, market order, best bid/ask, depth snapshot, trade events.
- Invariants: best bid < best ask after matching; no negative/NaN quantity; filled qty conserved between counterparties.

### 3.2 Agents (`market/agents.js`)

~40 agents, each bound 1:1 to a 3D trader. Each step (10 Hz sim) an agent may post/cancel/cross.

| Type | Count (approx.) | Behaviour |
|---|---|---|
| Market maker | 8 | Quote two-sided around a fair value; width ∝ realised vol; size shrinks and quotes pulled as panic and inventory rise. |
| Momentum | 8 | Trade in direction of short-horizon return. |
| Value buyer | 8 | Buy below a fair-value estimate; finite capital that depletes through the day. |
| Index arbitrage | 4 | Trade futures toward the cash index while the arb link is up. |
| Portfolio insurance | 4 | Sell futures in proportion to cumulative decline (feedback loop); program size set by director. |
| Noise / locals | 8 | Small random flow; some compete with the player for counterparties. |

Each agent exposes `intent` (side, limit, size, urgency) for the 3D layer and the fill-resolution logic.

The player interacts through the same book: a signal to agent X becomes a cross against X's current intent if compatible.

### 3.3 Cash index (`market/cash.js`)

A separate lagging series: cash = smoothed futures + arb-maintained basis, with lag that grows as the director degrades the NYSE link.

### 3.4 Director (`market/director.js`, `market/calibration.js`)

Never sets prices directly. Over pit time it schedules:

- portfolio-insurance program size,
- value-buyer capital,
- arb-link health (0–1; collapses in the air-pocket phase),
- maker risk appetite,
- noise-trader activity.

Schedules are piecewise curves in `calibration.js`, fitted so seeded runs reproduce the qualitative Oct-19 shape. A light feedback term nudges pressure if a run drifts far from the target envelope (keeps every run on-story without scripting prices).

### 3.5 Determinism

All randomness via a seeded PRNG. Same seed + same player inputs ⇒ same session.

## 4. World, characters, audio

- **Pit** (`pit.js`): octagonal stepped pit with tiered rings, rail, clerk phone booths around the perimeter, high windows, giant price board, wall clock. Merged geometry for few draw calls.
- **Traders** (`traders.js`): procedural low-poly humans; firm-coloured jackets, badge acronyms (canvas textures), arm rigs for hand-signal animations; posture and animation speed driven by agent urgency and panic. Instanced where possible.
- **Player view** (`player.js`): first-person with visible arms/card; camera shove from crowd.
- **Effects** (`effects.js`): paper/trading-card particles, floor litter accumulating over time, board flash on big moves.
- **Textures** (`textures.js`): canvas-generated (jacket fabric, badges, board LEDs, floor).
- **Audio** (`audio.js`, Web Audio, no files): crowd roar = filtered noise layers driven by order flow; formant "shout" bursts; open/close bells; phones; heartbeat near margin; fills tick.
- **Quality** (`quality.js`): FPS-adaptive pixel ratio, shadow and particle budgets.

## 5. Architecture

```
trading-floor-87/
├── build.mjs              esbuild → dist/index.html (inlined)
├── index.template.html
├── package.json           three, esbuild
├── README.md
├── src/
│   ├── main.js            boot, loop, phase/state machine
│   ├── util.js            PRNG, math helpers
│   ├── market/
│   │   ├── orderbook.js
│   │   ├── agents.js
│   │   ├── cash.js
│   │   ├── director.js
│   │   ├── calibration.js
│   │   └── sim.js         steps book+agents+director; public API for the game
│   ├── player.js          look, contact, signals → sim
│   ├── tickets.js         runner tickets, slippage grading, reputation
│   ├── margin.js          equity, margin calls, liquidation
│   ├── scoring.js         scorecard, shortfall decomposition, persistence
│   ├── pit.js  traders.js  effects.js  textures.js  quality.js
│   ├── hud.js             board, trading card, clock, ticket list, scorecard UI
│   └── audio.js
└── test/
    ├── orderbook.test.mjs
    ├── sim.test.mjs
    ├── game-logic.test.mjs   tickets, margin, scoring
    └── smoke.mjs             headless browser run
```

**Boundaries:** `market/*` knows nothing about rendering or the player. `sim.js` exposes `step(dt)`, `agents[]` (with intent), `board` (last, cash, basis, volume, panic), `playerSignal(agentId, side, price, qty)` → fill result. Game modules (`player`, `tickets`, `margin`, `scoring`) consume that API; render modules read state only.

## 6. Error handling

- Sim step guards: clamp prices to a sane range; any NaN in book/agent state is logged and the offending order dropped.
- Render: NaN-safe bloom/post (demo lesson); WebGL context loss → pause overlay with reload.
- Audio context starts on first user gesture.
- Missing pointer lock (e.g. iframe) falls back to right-drag look.

## 7. Testing

- **Order book (Node):** matching, priority, cancels, invariants under randomized fuzz.
- **Sim (Node):** 50 seeds with no player — every run settles between −20% and −35%; phase shape check (rally exists, largest drop after the arb break); determinism (same seed ⇒ identical trade log).
- **Game logic (Node):** fill resolution rules, margin call and liquidation, slippage grading, scorecard math.
- **Smoke (headless browser):** loads with zero console errors; scripted player trades through a full session at time-acceleration; soak run checks JS heap and geometry/texture counts stay flat.

## 8. Open questions (to resolve during implementation)

- Exact historical anchor prices (prior settle, open, intraday high, settle) — verify from sources, then encode in `calibration.js`.
- Starting equity / margin parameters — tune for a session where reckless play blows up by the air pocket and skilled play survives.

## 9. Implementation notes (deviations from the spec above)

- **Seventh agent type, `inst`** (pension and buyback money): fair value follows the director's story path, and it never capitulates. Without an elastic buyer that doesn't capitulate, every seeded run liquidity-spiralled to zero, because adaptive value buyers alone can't stop a spiral.
- **Portfolio insurance sells at a director-scheduled rate** (contracts per minute, scaled up as the price falls), not a fixed programme size. Fixed-size targets dumped the whole hedge in the first minutes.
- **Price keys are relative to the target's shout** (`5` = match, `6–9` squeeze, `1–4` sweeten), not an absolute last digit. Takers shout at the touch but hold a hidden, worse limit, so squeezing a sweating trader is the skill.
- **Agreed deals are honoured.** If your price beat their real limit when you signalled, the trade goes through even if they re-quote during the 0.3–0.6 s signal delay. Fill rate for human-paced play went from ~37% to ~57%.
- **New module `signals.js`** holds the pit rules (attention, shouts, contention, resolution). **New module `game.js`** runs one trading day headlessly, used by both the 3D layer and the tests.
- **Account:** $400k equity, $12k initial and $8k maintenance margin per contract, 50-lot position limit, 20 pit-minute grace on a margin call.
- **Afternoon difficulty** (added after playtesting with strategy bots): margin hike plus a position-limit cut to 15 lots at 13:30, with over-limit treated as a margin call; 2–3 short-covering squeezes; thinner maker bids and crowding on the stampede side. A perfect-hindsight short bot's P&L fell from $500–920k to $250–470k; random play and dip-buying are unchanged.
- **Independent review fixes** (art + gameplay review, 14 findings): ▲▼◆ signal markers above traders and tone-map-proof hand glow; faces warm up when a trader is looking at you; "TOO FAR" readout for out-of-reach targets; banner/tips/tutorial moved off the price board; target panel beside the crosshair; result pops at the crosshair; 3 s minimum per tutorial step; ~40 filler traders and a warm-lit hall; finger-level first-person hand that flashes on signals; end chart legend, equity axis and grade breakdown; autoplay bot trades properly.
- **Balance after review:** makers often meet you inside their spread (50%); squeeze contention halved; commission $50/lot; ticket timers scale with size, and taking a ticket auto-sizes you (restored after); reputation floor of 15 for willingness. Being over the limit at the deadline now **trims** to the limit instead of liquidating, and in-flight signals count toward the limit. Trading with one-sided order-fillers is now profitable through the morning (+$11k to +$28k by 12:30 on all test seeds); the tutorial and tips teach that market makers charge the spread.
- **Simplified after playtesting** ("too complicated, can't move"): the player walks the pit with WASD and trades with whoever is within 3.4 m. There's no precise aiming, no eye-contact requirement, no price-adjust keys and no routing key, and trades are always at the trader's price. Floating tags show the *player's* action (green BUY / red SELL) instead of the trader's intent. The tutorial is down to 6 steps.

## 10. Redesign: Open Outcry (2026-10-15)

The first-person walk-and-trade version failed with its first player ("don't know what to play", "can't freely turn", "feels very bad"). An independent design review found the cause: the fantasy (screaming pit trader) didn't match the verb (walk to a mannequin, read a tag, click). There was no goal you could act on from moment to moment, and the crash never reached the player's P&L. Of the three concepts it proposed, the user chose **Open Outcry**:

- **Fixed camera** on the top step with a free cursor (no pointer lock) and slight parallax. There's no movement.
- **Seven shouters** in a row pop up with clickable deal bubbles. Each deal comes from a real agent's intent: hurried traders concede part of the way to their real limit, and makers quote their spread. Deals are firm at the shouted price until their 2–3 s timer runs out. The edge against the board is shown, with a gold border for good prices.
- **Tube:** 5 contracts per click, ±6 lots. **Heat** warms with how much you hold and dumps you at full. $15/contract fee. Bust below $100k equity. The bell flattens you. 6-minute day.
- **Cut:** walking, tags, tickets/runners, reputation, margin maths, size picker, routing, tutorial/coach, help map, event feed.
- **Balance** (test/bots.mjs, 8 seeds): reading the board and trading with the move grades mostly A–S. Careful edge-taking scores well but can lose. Clicking everything usually loses or busts. Dip-buying the crash always busts. Blind shorting no longer always wins.

## 11. Theme pass: the crash and the floor (2026-10-15)

Feedback: "it doesn't fit the theme, where is the crash? It looks like a boxing ring."
- **The crash as the main event:** the pit clock runs unevenly (morning 80 s, rally 55 s, slide 60 s, crash 165 s). There are only 2 augment picks (chop, rally), so the crash is never interrupted. A DJ news wire carries the day's story, and a live Dow (`dowOf`) closes near the real −508. At the air pocket and in freefall: the lights brown out (`pit.setPower`), alarms sound (`pit.setAlarm`), the crowd surges (`crowd.surge`), paper storms, phones ring, and banners mark each −100 Dow points. The day ends with tomorrow's front page of *The Chicago Ledger*.
- **The floor:** an instanced dense crowd (about 250 people) with panic-driven animation; worn grey-brown steps, thin steel rails and vinyl floor; fluorescent lighting and haze; walls of quote boards for 12 contracts that move with the crash; world clocks; about 50 phone booths with clerks and runners; a Dow LED strip. The camera is lowered to the rim, in the crush.
