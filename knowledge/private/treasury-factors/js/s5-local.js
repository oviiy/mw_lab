/* §5 Local loadings: kernel or rolling PCA (Fig 9). */
(function () {
  const { $, E, color } = YC;
  const R = 3;
  let dsId = 'jkv', method = 'kernel', win = 120, factor = 0, heatMode = 'delta', res = null, pick = { A: null, B: null }, next = 'A', ready = false;
  const cache = {};

  function kernelPCA(Y) {
    const Z = E.standardize(Y).Z, T = Z.length, N = Z[0].length, K = E.kernel(T, N), full = E.pca(Y, R).loadings;
    const out = { ends: [], loadings: [], angles: [], full, bandwidthMonths: K.bandwidthMonths };
    let prev = full;
    for (let t = 0; t < T; t++) {
      const C = Array.from({ length: N }, () => new Array(N).fill(0));
      for (let s = 0; s < T; s++) { const w = K.K[s * T + t]; if (!w) continue; const x = Z[s]; for (let i = 0; i < N; i++) for (let j = i; j < N; j++) C[i][j] += w * x[i] * x[j]; }
      for (let i = 0; i < N; i++) for (let j = 0; j < i; j++) C[i][j] = C[j][i];
      const L = E.symEig(C).vectors.map(r => r.slice(0, R));
      for (let k = 0; k < R; k++) { let d = 0; for (let i = 0; i < N; i++) d += L[i][k] * prev[i][k]; if (d < 0) for (const r of L) r[k] = -r[k]; }
      prev = L; out.ends.push(t); out.loadings.push(L); out.angles.push(E.principalAnglesDeg(L, full));
    }
    return out;
  }

  function compute() {
    const ds = YC.dataset(dsId), key = `${dsId}|${method}|${win}`;
    res = cache[key] || (cache[key] = method === 'rolling' ? E.rollingPCA(ds.yields, win, R) : kernelPCA(ds.yields));
    res.mats = ds.maturities; res.dates = res.ends.map(e => ds.dates[e]); res.ds = ds;
    const near = (ym) => { let b = 0; res.dates.forEach((d, i) => { if (d.slice(0, 7) <= ym) b = i; }); return res.dates[b]; };
    if (!res.dates.includes(pick.A)) pick.A = near(dsId === 'jkv' ? '1981-08' : '1995-12');
    if (!res.dates.includes(pick.B)) pick.B = near(dsId === 'jkv' ? '2004-12' : '2014-06');
  }

  function heat() {
    const zz = res.mats.map((_, i) => res.loadings.map(L => L[i][factor] - (heatMode === 'delta' ? res.full[i][factor] : 0)));
    const zmax = Math.max(...zz.flat().map(Math.abs));
    YC.plot($('#dHeat'), [{ type: 'heatmap', x: res.dates, y: res.mats.map(YC.matLabel), z: zz, zmid: 0, zmin: -zmax, zmax,
      colorscale: [[0, '#9f1239'], [0.25, '#f19aa8'], [0.5, '#f7f5f0'], [0.75, '#7cc4b8'], [1, '#0b5e57']], colorbar: { thickness: 8, outlinewidth: 0, tickfont: { size: 10 } },
      hovertemplate: `%{x|%b %Y} · %{y}<br>${heatMode === 'delta' ? 'change' : 'loading'} %{z:.3f}<extra></extra>` }],
    YC.layout({ margin: { l: 36, r: 4, t: 6, b: 26 }, xaxis: { type: 'date', showline: false }, yaxis: { type: 'category', showline: false, tickfont: { size: 9 } },
      shapes: [YC.vline(pick.A, color.amber, 2), YC.vline(pick.B, '#a21caf', 2)] }));
    YC.onClick($('#dHeat'), (e) => { const ym = String(e.points[0].x).slice(0, 7), d = res.dates.find(v => v.slice(0, 7) === ym); if (!d) return; pick[next] = d; next = next === 'A' ? 'B' : 'A'; $('#dNext').textContent = next; heat(); snap(); angle(); });
  }
  function snap() {
    const x = res.mats.map(m => m / 12), iA = res.dates.indexOf(pick.A), iB = res.dates.indexOf(pick.B);
    YC.plot($('#dSnap'), [
      { x, y: res.full.map(r => r[factor]), name: 'full sample', mode: 'lines', line: { color: color.ink, width: 1.2, dash: 'dash' }, hovertemplate: '%{y:.3f}<extra>full</extra>' },
      { x, y: res.loadings[iA].map(r => r[factor]), name: `A ${YC.fmtDate(pick.A)}`, mode: 'lines+markers', line: { color: color.amber, width: 2 }, marker: { size: 4 }, hovertemplate: '%{y:.3f}<extra>A</extra>' },
      { x, y: res.loadings[iB].map(r => r[factor]), name: `B ${YC.fmtDate(pick.B)}`, mode: 'lines+markers', line: { color: '#a21caf', width: 2 }, marker: { size: 4 }, hovertemplate: '%{y:.3f}<extra>B</extra>' },
    ], YC.layout({ showlegend: true, margin: { l: 40, r: 8, t: 24, b: 28 }, xaxis: { type: 'log', ...YC.matTicks(res.mats) }, yaxis: { zeroline: true } }));
  }
  function angle() {
    const from = res.dates[0], to = res.dates[res.dates.length - 1];
    YC.plot($('#dAngle'), [{ x: res.dates, y: res.angles.map(a => a[2]), mode: 'lines', line: { width: 1.6, color: color.accent }, hovertemplate: '%{x|%b %Y}: %{y:.1f}°<extra></extra>' }],
      YC.layout({ margin: { l: 34, r: 8, t: 10, b: 26 }, xaxis: { type: 'date' }, yaxis: { ticksuffix: '°', rangemode: 'tozero' },
        shapes: [...YC.recessionShapes(from, to), YC.vline(pick.A, color.amber, 1), YC.vline(pick.B, '#a21caf', 1)] }));
  }
  function text() {
    const big = res.angles.map(a => a[2]), order = big.map((v, i) => i).sort((p, q) => big[q] - big[p]), peaks = [];
    for (const i of order) { if (peaks.length === 3) break; if (peaks.every(j => Math.abs(j - i) >= 60)) peaks.push(i); }
    peaks.sort((p, q) => p - q);
    const med = [...big].sort((p, q) => p - q)[Math.floor(big.length / 2)];
    const how = method === 'rolling' ? `${win}-month rolling windows` : `the test's kernel weights (T·h ≈ ${Math.round(res.bandwidthMonths)} months)`;
    $('#dText').innerHTML = `${res.ds.short}, ${how}: the largest angle between local and full-sample three-factor loadings has median ${med.toFixed(0)}° and peaks at ` +
      peaks.map(i => `<b>${big[i].toFixed(0)}°</b> around ${YC.fmtDate(res.dates[i])}`).join(', ') + `; it never falls below ${Math.min(...big).toFixed(0)}°. ` +
      'This is descriptive: the test in §3 and the scan in §6 decide whether such movement is more than noise.';
  }

  const redraw = YC.debounce(() => {
    $('#dBusy').hidden = false;
    setTimeout(() => { compute(); heat(); snap(); angle(); text(); $('#dBusy').hidden = true; }, 16);
  }, 80);

  YC.sections.push(() => {
    YC.seg($('#dDs'), dsId, (v) => { dsId = v; pick = { A: null, B: null }; if (ready) redraw(); });
    YC.seg($('#dMethod'), method, (v) => { method = v; $('#dWinWrap').hidden = v !== 'rolling'; if (ready) redraw(); });
    YC.seg($('#dFactor'), '0', (v) => { factor = +v; if (ready) { heat(); snap(); } });
    YC.seg($('#dHeatMode'), heatMode, (v) => { heatMode = v; if (ready) heat(); });
    $('#dWin').addEventListener('input', (e) => { win = +e.target.value; $('#dWinLbl').textContent = `${win}m`; if (ready) redraw(); });
    YC.lazy($('#fig9'), () => { ready = true; redraw(); });
  });
})();
