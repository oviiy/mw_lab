/* §2 Static factors: loadings + variance (Fig 3), scores vs proxies (Fig 4). */
(function () {
  const { $, E, color } = YC;
  const ds = YC.dataset('treasury');
  let model, which = 0;

  function fit() {
    const c = YC.core(ds);
    const st = E.standardize(c.Y);
    const p = E.pca(c.Y, c.mats.length, 'standardize');
    const recon = (t, k) => c.mats.map((_, i) => { let v = 0; for (let j = 0; j < k; j++) v += p.loadings[i][j] * p.factors[t][j]; return st.mean[i] + st.sd[i] * v; });
    const rmse = (k) => { let s = 0, n = 0; c.Y.forEach((row, t) => { const f = recon(t, k); row.forEach((v, i) => { s += (v - f[i]) ** 2; n++; }); }); return Math.sqrt(s / n) * 100; };
    model = { ...c, p, rmse1: rmse(1), rmse3: rmse(3) };
  }

  function fig3() {
    const L = model.p.loadings, x = model.mats.map(m => m / 12);
    YC.plot($('#f3Load'), [0, 1, 2].map(k => ({
      x, y: L.map(r => r[k]), mode: 'lines+markers', name: YC.factorName[k], line: { width: 2, color: color.factor[k] }, marker: { size: 5 },
      text: model.mats.map(YC.matLabel), hovertemplate: `${YC.factorName[k]} %{text}: %{y:.3f}<extra></extra>`,
    })), YC.layout({ showlegend: true, margin: { l: 40, r: 8, t: 24, b: 30 }, xaxis: { type: 'log', ...YC.matTicks(model.mats) }, yaxis: { zeroline: true } }));
    const s = model.p.share;
    YC.plot($('#f3Scree'), [{
      type: 'bar', x: s.map((_, i) => `PC${i + 1}`), y: s.map(v => v * 100), marker: { color: s.map((_, i) => (i < 3 ? color.factor[i] : '#c9c4b8')) },
      text: s.map(v => `${(v * 100).toPrecision(v > 0.1 ? 4 : 2)}%`), textposition: 'outside', cliponaxis: false, textfont: { size: 10, color: color.ink },
      hovertemplate: '%{x}: %{y:.4f}%<extra></extra>',
    }], YC.layout({ margin: { l: 40, r: 8, t: 18, b: 30 }, yaxis: { type: 'log', ticksuffix: '%', tickvals: [0.001, 0.01, 0.1, 1, 10, 100], ticktext: ['0.001', '0.01', '0.1', '1', '10', '100'], range: [-3.3, 2.5] } }));
  }

  const z = (a) => { const v = a.filter(t => t != null); const m = v.reduce((s, t) => s + t, 0) / v.length; const sd = Math.sqrt(v.reduce((s, t) => s + (t - m) ** 2, 0) / (v.length - 1)); return a.map(t => (t == null ? null : (t - m) / sd)); };
  const corr = (a, b) => { const p = a.map((v, i) => [v, b[i]]).filter(([u, w]) => u != null && w != null); const n = p.length; const ma = p.reduce((s, q) => s + q[0], 0) / n, mb = p.reduce((s, q) => s + q[1], 0) / n; let ab = 0, aa = 0, bb = 0; p.forEach(([u, w]) => { ab += (u - ma) * (w - mb); aa += (u - ma) ** 2; bb += (w - mb) ** 2; }); return ab / Math.sqrt(aa * bb); };

  function fig4() {
    const s3 = YC.col(ds, 3), s120 = YC.col(ds, 120), s24 = YC.col(ds, 24);
    const proxies = [
      { y: model.Y.map(r => r.reduce((a, b) => a + b, 0) / r.length), name: 'average yield' },
      { y: s120.map((v, i) => v - s3[i]), name: '10Y − 3M' },
      { y: s24.map((v, i) => (v == null ? null : 2 * v - s3[i] - s120[i])), name: '2·2Y − 3M − 10Y' },
    ];
    const f = model.p.factors.map(r => r[which]), pr = proxies[which];
    const from = model.dates[0], to = model.dates[model.dates.length - 1];
    YC.plot($('#f4Scores'), [
      { x: model.dates, y: z(f), name: `${YC.factorName[which]} factor`, mode: 'lines', line: { color: color.factor[which], width: 1.5 }, hovertemplate: 'factor %{y:.2f}<extra></extra>' },
      { x: model.dates, y: z(pr.y), name: pr.name, mode: 'lines', connectgaps: false, line: { color: color.ink, width: 0.9, dash: 'dot' }, hovertemplate: 'proxy %{y:.2f}<extra></extra>' },
    ], YC.layout({ showlegend: true, hovermode: 'x unified', margin: { l: 38, r: 8, t: 24, b: 26 }, xaxis: { type: 'date' }, yaxis: { title: { text: 'standardized', font: { size: 10.5 } } }, shapes: YC.recessionShapes(from, to) }));
    $('#f4Cap').innerHTML = `<b>Figure 4.</b> ${YC.factorName[which]} factor score against its textbook proxy, <i>${pr.name}</i> (both standardized; correlation ${corr(f, pr.y).toFixed(3)}).` +
      (which === 2 ? ' The 2Y yield starts in June 1976.' : '');
  }

  YC.sections.push(() => {
    fit();
    YC.fill('share3', `${(model.p.share.slice(0, 3).reduce((a, b) => a + b, 0) * 100).toFixed(2)}%`);
    YC.fill('rmse1', `${model.rmse1.toFixed(0)} bp`);
    YC.fill('rmse3', `${model.rmse3.toFixed(1)} bp`);
    YC.seg($('#f4Which'), '0', (v) => { which = +v; fig4(); });
    YC.lazy($('#fig3'), fig3);
    YC.lazy($('#fig4'), fig4);
  });
})();
