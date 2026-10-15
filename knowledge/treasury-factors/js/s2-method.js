/* §2 Model and test: kernel weights and global vs local fit on JKV (Fig 3). */
(function () {
  const { $, E, color } = YC;
  let ds, Z, K, fit, t = 140;

  function prep() {
    if (fit) return;
    ds = YC.dataset('jkv');
    Z = E.standardize(ds.yields);
    K = E.kernel(Z.Z.length, Z.Z[0].length);
    fit = E.suWangFit(Z.Z, 3, K);
  }
  const un = (row) => row.map((v, i) => Z.mean[i] + Z.sd[i] * v);
  const rms = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / a.length) * 100;

  function draw() {
    prep();
    const T = ds.dates.length;
    YC.plot($('#kW'), [{ x: ds.dates, y: ds.dates.map((_, s) => K.K[s * T + t]), mode: 'lines', fill: 'tozeroy', fillcolor: 'rgba(15,118,110,0.12)', line: { color: color.accent, width: 1.5 }, hovertemplate: '%{x|%b %Y}: %{y:.2f}<extra></extra>' }],
      YC.layout({ margin: { l: 32, r: 8, t: 8, b: 26 }, xaxis: { type: 'date' }, yaxis: { rangemode: 'tozero' }, shapes: [YC.vline(ds.dates[t])],
        annotations: [{ xref: 'paper', yref: 'paper', x: 1, y: 1, xanchor: 'right', showarrow: false, font: { size: 10.5 }, text: `h = ${K.h.toFixed(3)}, T·h ≈ ${K.bandwidthMonths.toFixed(0)} months` }] }));
    const x = ds.maturities.map(m => m / 12), st = un(fit.fixedCommon[t]), lo = un(fit.common[t]), ob = ds.yields[t];
    YC.plot($('#kFit'), [
      { x, y: ob, name: 'observed', mode: 'markers', marker: { color: color.ink, size: 5 }, hovertemplate: '%{y:.3f}%<extra>observed</extra>' },
      { x, y: st, name: 'global (fixed)', mode: 'lines', line: { color: color.amber, width: 1.8, dash: 'dash' }, hovertemplate: '%{y:.3f}%<extra>global</extra>' },
      { x, y: lo, name: 'local', mode: 'lines', line: { color: color.accent, width: 1.8 }, hovertemplate: '%{y:.3f}%<extra>local</extra>' },
    ], YC.layout({ showlegend: true, margin: { l: 38, r: 8, t: 24, b: 28 }, xaxis: { type: 'log', ...YC.matTicks(ds.maturities) }, yaxis: { ticksuffix: '%' } }));
    $('#kLbl').textContent = YC.fmtDate(ds.dates[t]);
    $('#kCap').innerHTML = `<b>Figure 3.</b> Global and local three-factor fits on JKV. In ${YC.fmtDate(ds.dates[t])} the fit error is ${rms(ob, st).toFixed(1)} bp (global) vs ${rms(ob, lo).toFixed(1)} bp (local). ` +
      'The thesis highlights four months: 1974-08, 1981-09 and 2008-12, where the local fit is clearly better, and 1995-12, where the two coincide. \\(M\\) averages the squared gap between the dashed and solid lines over every month and maturity.';
    if (window.renderMathInElement) renderMathInElement($('#kCap'), { delimiters: [{ left: '\\(', right: '\\)', display: false }], throwOnError: false });
  }

  YC.sections.push(() => {
    $('#kT').addEventListener('input', (e) => { t = +e.target.value; draw(); });
    YC.lazy($('#fig3'), draw);
  });
})();
