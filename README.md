# mw_lab

**Quant interview library & tools**

A collection of lightweight, browser-based tools, small games, and knowledge resources for quantitative research, interview preparation, and daily utilities.

Live site: [https://oviiy.github.io/mw_lab/](https://oviiy.github.io/mw_lab/)

## Repository structure

```
mw_lab/
├── README.md
├── .github/
│   └── workflows/
│       └── static.yml
├── tools/
│   ├── sleeve_research.html
│   ├── arb-free-surface-lab.html
│   ├── video_downloader.html
│   ├── jp.html
│   ├── us_rotation.html
│   ├── Quick_Pull.bat
│   └── portfolio_rotation.py
├── games/
│   ├── Particell.html
│   ├── Blitz.html
│   ├── Catrun.html
│   ├── Crimewave.html
│   ├── ThreeBody.html
│   └── NeonDistrict/
│       └── index.html
└── knowledge/
    ├── itv.html
    ├── math-finance-map.html
    ├── ai-industry-chain-encyclopedia.html
    └── theorem-library/
        └── index.html
```

---

## Knowledge

| Resource | Description | Link |
|----------|-------------|------|
| **Quant & Allocator Interview Prep (ITV)** | Structured interview prep for quant and allocator roles — questions, answers, and topic coverage | [knowledge/itv.html](./knowledge/itv.html) |
| **Mathematical Finance Map** | Intuition-first guide to why mathematical finance is built the way it is — probability, filtrations, no-arbitrage, risk-neutral pricing, Black–Scholes spine (KaTeX) | [knowledge/math-finance-map.html](./knowledge/math-finance-map.html) |
| **AI Industry Encyclopedia** | Full AI industry-chain field guide — silicon, power, networks, models, training, supply chain, and myths (2025–2026) | [knowledge/ai-industry-chain-encyclopedia.html](./knowledge/ai-industry-chain-encyclopedia.html) |
| **Theorem Library** | Math and physics theorems in plain language — Newton, thermo, Maxwell, relativity, quantum, plus classic math; KaTeX and interactive demos | [knowledge/theorem-library/](./knowledge/theorem-library/index.html) |

---

## Tools

| Tool | Description | Link |
|------|-------------|------|
| **Sleeve Research** | Single-file HTML/JS tool for sleeve-based strategy signals, interactive backtesting, parameter sweeps, Monte Carlo, walk-forward, universe exploration | [tools/sleeve_research.html](./tools/sleeve_research.html) |
| **Arbitrage-Free Surface Lab** | Interactive lab for arbitrage-free surfaces — explore no-arb constraints and surface constructions in the browser | [tools/arb-free-surface-lab.html](./tools/arb-free-surface-lab.html) |
| **US Rotation** | US equity style rotation research dashboard (single-file HTML) | [tools/us_rotation.html](./tools/us_rotation.html) |
| **Video Downloader** | Browser tool to download short-form videos (e.g. Douyin / Xiaohongshu) without watermark | [tools/video_downloader.html](./tools/video_downloader.html) |
| **Japanese Tools** | Japanese learning and utility helpers | [tools/jp.html](./tools/jp.html) |
| **Quick Pull** | Hearthstone Battlegrounds one-click disconnect utility | [tools/Quick_Pull.bat](./tools/Quick_Pull.bat) |
| **Portfolio Rotation** | Python script for portfolio rotation research | [tools/portfolio_rotation.py](./tools/portfolio_rotation.py) |

---

## Games

| Game | Description | Link |
|------|-------------|------|
| **Particell** | Thermal sandbox world — paint materials, heat physics, discoveries | [games/Particell.html](./games/Particell.html) |
| **Blitz** | Neon arena survivor — move, auto-fire, level-up builds, shards and medals | [games/Blitz.html](./games/Blitz.html) |
| **Catrun** | One-button dash runner — hop/float through biomes, coins and gust boosts | [games/Catrun.html](./games/Catrun.html) |
| **Crimewave** | Isometric crime sandbox — open world, wanted stars, cash and garage | [games/Crimewave.html](./games/Crimewave.html) |
| **Neon District** | Top-down GTA-lite (single HTML) — districts, driving physics, story, police | [games/NeonDistrict/index.html](./games/NeonDistrict/index.html) |
| **Three Body** | Three-body gravitational sim — figure-8, Lagrange, chaotic presets, trails and energy | [games/ThreeBody.html](./games/ThreeBody.html) |

---

## How to use

1. Enable **GitHub Pages** for this repository  
   (Settings → Pages → Source: Deploy from `main` branch / GitHub Actions).
2. Browse by category:
   - [Tools](./tools/) — including Sleeve Research, Arbitrage-Free Surface Lab, US Rotation
   - [Games](./games/) — Particell, Blitz, Catrun, Crimewave, Neon District, Three Body
   - [Knowledge](./knowledge/) — Interview prep, Mathematical Finance Map, AI Industry Encyclopedia, Theorem Library
3. Open any link in your browser.
4. Everything runs **client-side** — no backend or install required.

---

## Tech stack

- Pure HTML + CSS + JavaScript (some pages use Tailwind or KaTeX)
- Hosted on GitHub Pages
- Mobile-friendly where practical

---

## Notes

- All tools and games are static and run entirely in the browser.
- For best experience, open in Chrome or Edge.
- Feel free to fork or suggest improvements.

---

**Made with care by oviiy**
