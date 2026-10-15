# 钱迹 · Money Trail

Published at [mw_lab / Money Trail](https://oviiy.github.io/mw_lab/tools/money-trail/). The site serves the checked-in public dataset; the data build pipeline runs separately.

A bilingual (中文 / English) site that follows the public money trail of fund managers, members of Congress and company insiders, and puts them on one yardstick against SPY:

- **Who's Buying** (`#/players`): every player on the same yardstick, the average excess return vs SPY in the 3 months after a buy became public. It includes a copy-strategy race per group against SPY, a benchmark map, a filterable and groupable player list, and a position tracker of the latest disclosed buys.

- **20 well-known fund managers**, from SEC Form 13F filings (2021Q3 onward): holdings treemaps, quarter-over-quarter changes, an animated holdings race, sector allocation, style metrics, similar managers, and a clone backtest that buys only after each real filing date.
- **~2,400 stocks**, each with a look-through page: who holds it, how money flowed in and out, how crowded it is, which tracked managers own it, and Congress trades marked on the price chart.
- **Insider radar**, from SEC Form 4 (company officers, directors and 10% owners, 2021Q3 onward): a feed of cluster buys (≥3 insiders buying on the open market within 30 days), an event study from the filing date split by market cap and role, insider profiles with 3/6/12-month hit rates, and insider buys and sales marked on stock pages. 10b5-1 plan trades are flagged and kept out of signals.
- **Members of Congress**, from STOCK Act periodic transaction reports (House and Senate): the latest disclosures, the most active members and most traded stocks, member profiles with committees and a trade timeline, and an event study of what happened after trades were disclosed.

Everything comes from public sources (SEC EDGAR incl. the Insider Transactions Data Sets, House Clerk, Senate eFD, OpenFIGI, Yahoo Finance, unitedstates/congress-legislators). There's no backend: a Python build writes JSON into `data/`, and the site is static (ES modules + ECharts).

## View it

```bash
python3 -m http.server 8771 --directory tools/money-trail
```

Open http://localhost:8771/. The site uses ES modules, so it has to be served over http; opening `index.html` directly won't work. Use the 中文 / EN button at the top right to switch languages.

## Rebuild the data

```bash
cd tools/money-trail
cp .env.example .env              # put your personal email in SEC_CONTACT_EMAIL; OPENFIGI_API_KEY is optional
cd build
/opt/homebrew/bin/python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python run.py           # or chosen stages: --stage 13f | map | congress | form4 | prices | export (comma-separated)
```

The first full build downloads about 1.9 GB of SEC bulk files (13F and Form 3/4/5 data sets), the current quarter's Form 4s from EDGAR's daily index, and ~4,000 congressional reports, and takes about an hour and a half. Everything is cached in `build/cache/` (gitignored), so later runs only fetch what's new. A free OpenFIGI key makes the ticker-mapping stage about 25× faster.

For portability on Windows, the published dataset names the three `CON` ticker files `CON_.json` (under `data/stocks/`, `data/congress/tickers/`, and `data/insiders/tickers/`). The page maps ticker `CON` to those filenames. Apply the same rename after a fresh export before committing data.

## Tests

```bash
cd build && .venv/bin/python -m pytest -q          # pipeline, incl. Berkshire 13F golden values, real House/Senate reports and real Form 4 filings
env -u NODE_OPTIONS node --test js/calc.test.js
```

## Layout

```
build/run.py            build stages
build/sm/               ingest_13f, clean, figi, companies, sectors, prices, metrics, backtest, export,
                        congress (House PTR parser), senate (eFD scraper), congress_export,
                        insiders (Form 4 data sets + daily feed), insiders_export (clusters, event study)
build/config/           settings.yaml, managers.yaml (curated managers with sourced bios in both languages)
data/                   generated JSON: meta, home, managers/, stocks/, congress/, insiders/
js/                     page-*.js (page-players.js = Who's Buying), flow-chart.js, i18n.js (all UI strings), charts.js, calc.js (tested), core.js
docs/specs, docs/plans  design spec and phase-1 implementation plan
```

## Notes

- 13F covers long US positions only and can lag by up to 45 days. Congress amounts are ranges, not exact values. Form 4 code P also covers private purchases (e.g. joining a placement), and cluster-buy returns are measured against SPY, which small caps lagged over this period. The methods page lists every processing rule and known limitation.
- Senate eFD asks users to agree that the data won't be used for commercial or fundraising purposes. This project is a free research site.
- For research and education only. Not investment advice.
