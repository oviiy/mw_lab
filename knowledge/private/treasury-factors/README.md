# Are yield-curve factor loadings constant over time? — interactive technical note

A single-page technical note that accompanies the working paper by Qian & Wang (2026). It uses 56 years of U.S. Treasury yields to test the assumption, built into most yield-curve factor models, that the factor loadings are fixed over time. It also shows how those loadings move.

Open `index.html` directly in a browser, or serve the folder. There's no build step and no backend. Plotly (cartesian bundle) and KaTeX load from CDNs. Charts render only as they scroll into view.

## Sections

1. **Data:** month-end curve at any date (play, pin, keyboard stepping), yield and spread history with recessions and events, and a source and availability table.
2. **Static factors:** full-sample PCA loadings, variance shares, and each factor score against its textbook proxy.
3. **Time-varying loadings:** rolling-window or kernel-weighted local PCA. Shows a heatmap of loading changes, loadings on two chosen dates, and the principal angle to the full-sample subspace.
4. **Testing constancy:** the method with equations, the kernel weights and the static-vs-local fit, the thesis results (B = 9,999), and a live test that runs in a Web Worker.
5. **Break dates:**
   - what a break is, and the scan algorithm, including its retreat rule;
   - a step-through of any segment of the 1970–2009 scan;
   - the 1970–2009 segments, matched to nearby events;
   - the 2006–2026 breaks for R = 3, 4 and 5, with loadings before and after each break;
   - caveats.
6. **Notes on construction**, then references.

## Data

There are two datasets:

- **Treasury observed, Jan 1970 – Aug 2026:** used everywhere except the headline test. Each maturity comes from one source over its whole history, with no splicing and no interpolation.
  - 3M and 6M are H.15 T-bill secondary-market rates, converted from discount basis to bond-equivalent yield on every date.
  - All other maturities are H.15 constant-maturity yields, blank in months when they weren't published.
  - The factor analysis uses the 7 gap-free maturities, 3M to 10Y.
- **Thesis panel, 2006–2026:** GSW + FRED zero-coupon yields. Used only in §4 to reproduce the headline test.

The 1970–2009 and 2006–2026 break scans are included as results only, read from the thesis repository's JSON output.

## Files

```
build/build_data.py   thesis repo → data.js   (python3 build/build_data.py [thesis_repo])
data.js               generated bundle (~150 kB)
engine.js             PCA, rolling/kernel loadings, principal angles, J statistic + bootstrap
engine.test.mjs       node --test engine.test.mjs  (J matches the thesis Python output to 1e-6)
index.html, styles.css
js/core.js            palette, plotting defaults, lazy rendering, worker
js/s1-data.js … js/s5-breaks.js   one file per section; js/main.js boots them
```
