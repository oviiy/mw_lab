# Are fixed-loading factor models adequate for the U.S. Treasury curve? — interactive technical note

A single-page technical note accompanying the working paper by Qian & Wang (2026), updated to the week-7 results. Open `index.html` in a browser, or serve the folder. There's no build step and no backend. Plotly (cartesian bundle) and KaTeX load from CDNs, and charts render as they scroll into view.

## Sections

1. **Data:** the two panels on one time axis, and the curve at any month.
2. **Model and test:** global vs local PCA, Silverman bandwidth, M, J, and the covariance bootstrap. Includes a live JKV fit.
3. **Full-sample results:** headline tests, null distributions, eight sub-periods, the bandwidth grid (including the week-7 fixed T·h), and a live test that runs in a Web Worker.
4. **The 1970s:** the start-year sweep, where the misfit sits, how the null shifts, and controls.
5. **Local loadings:** kernel or rolling loadings, plus the angle to the full-sample loadings.
6. **Break scan:**
   - the rule, with a step-through of the main 60/60 scans;
   - the six-row results;
   - the week-6 32-setting robustness grid;
   - break dates under 0.5× and 1.5× Silverman (week 7).
7. **Breaks and history:** presidents, Fed chairs, policy cycles and fiscal milestones; the Fed funds rate, CPI and unemployment; and the candidate events.
8. **Reliability:**
   - small-N size and power;
   - the printed vs the code's (diagonal) bootstrap;
   - planted-break simulations (week-6 PCA, week-7 Svensson);
   - the scan's bandwidth audit.
9. **Conclusions.**

## Data

The note uses exactly the thesis's two panels, which are never pooled:

- **JKV:** unsmoothed Fama–Bliss zero-coupon yields, 1970–2009, 17 maturities.
- **Treasury:** official CMT yields from H.15, Sep 1981 – Aug 2026, 8 maturities from 3M to 10Y. None are interpolated.

All results come from the thesis's saved outputs (`wk5/`, `wk6/`, `wk7/results`); `build/build_data.py` collects them into `data.js`. Nothing is re-estimated, except the live figures and the live test, which use `engine.js`.

```
python3 build/build_data.py [/path/to/time-varying-treasury-factors-main]
node --test engine.test.mjs   # J matches the thesis full-sample statistics (JKV and Treasury, d = 3–5) to 1e-6
```
