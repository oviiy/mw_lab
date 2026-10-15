# mw_lab

Browser games, research tools, and knowledge pages. The [homepage](https://oviiy.github.io/mw_lab/) lists every public browser project. GitHub Pages deploys the `main` branch through [the Pages workflow](./.github/workflows/static.yml).

## Knowledge

| Project | Open |
| --- | --- |
| Quant & Allocator Interview Prep | [Read](./knowledge/itv.html) |
| Quant Interview Drill | [Open](./knowledge/quant-interview-drill.html) |
| Treasury Quant Interview Prep | [Read](./knowledge/treasury-quant-interview-prep.html) |
| Mathematical Finance Map | [Read](./knowledge/math-finance-map.html) |
| AI Industry Encyclopedia | [Read](./knowledge/ai-industry-chain-encyclopedia.html) |
| Theorem Library | [Read](./knowledge/theorem-library.html) |
| Treasury Factor Loadings, an interactive technical note | [Open](./knowledge/treasury-factors/) |

The older research material in [`knowledge/private/`](./knowledge/private/README.md) remains available by direct link.

## Tools

| Project | Open |
| --- | --- |
| Sleeve Research | [Open](./tools/sleeve_research.html) |
| Arbitrage-Free Surface Lab | [Open](./tools/arb-free-surface-lab.html) |
| Credit Correlation Desk | [Open](./tools/credit_correlation.html) |
| US Style Analysis | [Open](./tools/us_rotation.html) |
| Video Downloader | [Open](./tools/video_downloader.html) |
| Japanese Tools | [Open](./tools/jp.html) |
| World Cup Bracket Picker | [Open](./tools/worldcup.html) |
| AI Debt Tracker | [Open site](./tools/ai-debt-tracker/web/dist/) · [Source and data notes](./tools/ai-debt-tracker/README.md) |
| Money Trail | [Open site](./tools/money-trail/) · [Source and data notes](./tools/money-trail/README.md) |

[`Quick_Pull.bat`](./tools/Quick_Pull.bat) and [`portfolio_rotation.py`](./tools/portfolio_rotation.py) are local utilities, not browser pages.

## Games

| Project | Play |
| --- | --- |
| Particell | [Play](./games/Particell.html) |
| Blitz | [Play](./games/Blitz.html) |
| Catrun | [Play](./games/Catrun.html) |
| Crimewave | [Play](./games/Crimewave.html) |
| Neon District | [Play](./games/NeonDistrict/) |
| Three Body | [Play](./games/ThreeBody.html) |
| Tiny Gods | [Play](./games/tiny-gods.html) |
| Dragon Turf | [Play](./games/dragon-turf/) · [Source](./games/dragon-turf/README.md) |
| Hexloop | [Play](./games/hexloop/dist/) · [Source](./games/hexloop/) |
| Neon Heist | [Play](./games/neon-heist/dist/) · [Source](./games/neon-heist/README.md) |
| Open Outcry: 1987 | [Play](./games/trading-floor-87/dist/) · [Source](./games/trading-floor-87/README.md) |

## Publishing

The game builds under `dist/` are checked in so Pages can serve them directly. AI Debt Tracker is an Astro site; its checked-in `web/dist/` build uses `/mw_lab/tools/ai-debt-tracker/web/dist/` as its base path. To rebuild it, run `npm ci` in `tools/ai-debt-tracker/web`, run `node scripts/copy-data.mjs`, then build with `SITE=https://oviiy.github.io` and `BASE_PATH=/mw_lab/tools/ai-debt-tracker/web/dist/`.

Money Trail is a static site backed by checked-in public JSON. Its data pipeline and AI Debt Tracker's data pipeline can be updated separately; neither runs during Pages deployment. No private `.env` file or embedded repository metadata is published.
