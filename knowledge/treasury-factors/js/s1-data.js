/* §1 Data: Table 1, both panels on one axis (Fig 1), curve at a date (Fig 2). */
(function () {
  const { $, D, color } = YC;
  const PIN = ['#b45309', '#a21caf', '#4338ca', '#0369a1', '#15803d'];
  let ds = YC.dataset('jkv'), idx = 0, pins = [], playing = null, curveReady = false;
  const CS = [[0, '#f7f4ec'], [0.15, '#d9ecef'], [0.35, '#7fc2c4'], [0.55, '#2a8f99'], [0.75, '#21587a'], [1, '#1b1f45']];

  function table1() {
    const rows = D.datasets.map(d => {
      const zero = d.kind === 'zero';
      return `<tr><td><b>${d.short}</b></td><td>${zero ? 'zero-coupon (unsmoothed Fama–Bliss, CRSP)' : 'par / constant-maturity (official Treasury, H.15)'}</td>
        <td>${YC.fmtDate(d.dates[0])} – ${YC.fmtDate(d.dates[d.dates.length - 1])}</td><td class="num">${d.dates.length}</td><td class="num">${d.maturities.length}</td>
        <td>${d.maturities.map(YC.matLabel).join(', ')}</td></tr>`;
    }).join('');
    $('#tab1').innerHTML = `<thead><tr><th>Panel</th><th>Yield type</th><th>Span</th><th class="num">T</th><th class="num">N</th><th>Maturities</th></tr></thead><tbody>${rows}</tbody>`;
  }

  function fig1() {
    const [j, t] = D.datasets;
    const all = D.datasets.flatMap(d => d.yields.flat());
    const zmax = Math.max(...all), zmin = Math.min(0, ...all);
    const tr = (d, ya) => ({
      type: 'heatmap', x: d.dates, y: d.maturities.map(YC.matLabel), z: d.maturities.map((_, i) => d.yields.map(r => r[i])), yaxis: ya,
      zmin, zmax, colorscale: CS, showscale: ya === 'y', colorbar: { thickness: 8, outlinewidth: 0, ticksuffix: '%', tickfont: { size: 10 }, len: 1, y: 0.5 },
      hovertemplate: `${d.short} %{x|%b %Y} · %{y}<br><b>%{z:.2f}%</b><extra></extra>`,
    });
    YC.plot($('#f1Heat'), [tr(j, 'y'), tr(t, 'y2')], YC.layout({
      margin: { l: 70, r: 8, t: 20, b: 26 }, xaxis: { type: 'date', range: ['1970-01-01', '2026-08-31'], showline: false, anchor: 'y2', dtick: 'M60' },
      yaxis: { domain: [0.5, 1], type: 'category', autorange: 'reversed', showline: false, tickfont: { size: 9 }, title: { text: 'JKV', font: { size: 11, color: color.ink } } },
      yaxis2: { domain: [0, 0.42], type: 'category', autorange: 'reversed', showline: false, tickfont: { size: 9 }, title: { text: 'Treasury', font: { size: 11, color: color.ink } } },
      shapes: [{ type: 'rect', xref: 'x', yref: 'paper', x0: '1990-01-01', x1: '2009-12-31', y0: 0, y1: 1, line: { color: color.accent, width: 1, dash: 'dot' }, fillcolor: 'rgba(0,0,0,0)' }],
      annotations: [{ x: '2000-01-01', xref: 'x', yref: 'paper', y: 1, yanchor: 'bottom', text: 'overlap 1990–2009', showarrow: false, font: { size: 10.5, color: color.accent } }],
    }));
  }

  const env = {};
  function envelope() {
    if (env[ds.id]) return env[ds.id];
    const lo = ds.maturities.map(() => Infinity), hi = ds.maturities.map(() => -Infinity);
    ds.yields.forEach(r => r.forEach((v, i) => { lo[i] = Math.min(lo[i], v); hi[i] = Math.max(hi[i], v); }));
    return (env[ds.id] = { lo, hi, ymax: Math.max(...hi) });
  }

  function drawCurve() {
    const x = ds.maturities.map(m => m / 12), e = envelope();
    const tr = [
      { x, y: e.hi, mode: 'lines', line: { width: 0 }, hoverinfo: 'skip' },
      { x, y: e.lo, mode: 'lines', line: { width: 0 }, fill: 'tonexty', fillcolor: 'rgba(100,107,117,0.08)', hoverinfo: 'skip' },
      ...pins.map((p, k) => ({ x, y: ds.yields[p], mode: 'lines+markers', name: YC.fmtDate(ds.dates[p]), showlegend: true, line: { color: PIN[k % PIN.length], width: 1.3, dash: 'dot' }, marker: { size: 3 }, hovertemplate: '%{y:.2f}%<extra></extra>' })),
      { x, y: ds.yields[idx], mode: 'lines+markers', name: YC.fmtDate(ds.dates[idx]), showlegend: pins.length > 0, line: { color: color.ink, width: 2 }, marker: { size: 6, color: color.accent, line: { width: 1, color: '#fff' } },
        text: ds.maturities.map(YC.matLabel), hovertemplate: '%{text}: <b>%{y:.3f}%</b><extra></extra>' },
    ];
    YC.plot($('#f2Curve'), tr, YC.layout({ showlegend: pins.length > 0, margin: { l: 40, r: 8, t: pins.length ? 24 : 8, b: 28 },
      xaxis: { type: 'log', ...YC.matTicks(ds.maturities) }, yaxis: { ticksuffix: '%', range: [-0.3, e.ymax + 0.5] } }));
    curveReady = true;
  }

  function stats() {
    const r = ds.yields[idx], g = (m) => r[ds.maturities.indexOf(m)];
    const s = (g(120) - g(3)) * 100;
    $('#f2Stats').innerHTML = [['3M', `${g(3).toFixed(2)}%`], ['2Y', `${g(24).toFixed(2)}%`], ['10Y', `${g(120).toFixed(2)}%`],
      ['10Y − 3M', `<span style="color:${s < 0 ? color.red : 'inherit'}">${s.toFixed(0)} bp</span>`]].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    const ym = YC.month(ds.dates[idx]);
    let h = '';
    if (YC.recessions.some(([a, b]) => ym >= a && ym <= b)) h += '<div class="ev"><b>Recession</b> (NBER)</div>';
    YC.events.filter(e => Math.abs(YC.monthsBetween(e.d, ym)) <= 6).forEach(e => { h += `<div class="ev"><b>${e.t}</b> · ${YC.fmtDate(e.d)}<br>${e.long}</div>`; });
    $('#f2Ctx').innerHTML = h;
  }

  function setIdx(i, fromSlider) {
    idx = Math.max(0, Math.min(ds.dates.length - 1, i));
    if (!fromSlider) $('#f2Slider').value = idx;
    $('#f2Date').textContent = YC.fmtDate(ds.dates[idx]);
    stats(); if (curveReady) drawCurve();
  }
  function setDs(id) {
    const ym = YC.month(ds.dates[idx]);
    ds = YC.dataset(id); pins = [];
    $('#f2Slider').max = ds.dates.length - 1;
    setIdx(YC.idxForMonth(ds, ym < ds.dates[0].slice(0, 7) ? '1981-09' : ym));
  }
  function play() {
    if (playing) { clearInterval(playing); playing = null; $('#f2Play').textContent = '▶'; return; }
    if (idx >= ds.dates.length - 1) setIdx(0);
    $('#f2Play').textContent = '❚❚';
    playing = setInterval(() => { if (idx >= ds.dates.length - 1) play(); else setIdx(idx + 2); }, 80);
  }

  YC.sections.push(() => {
    table1();
    YC.lazy($('#f1Heat'), fig1);
    YC.seg($('#f2Ds'), 'jkv', setDs);
    $('#f2Slider').max = ds.dates.length - 1;
    $('#f2Slider').addEventListener('input', (e) => setIdx(+e.target.value, true));
    $('#f2Play').addEventListener('click', play);
    $('#f2Pin').addEventListener('click', () => { if (!pins.includes(idx)) { pins.push(idx); if (pins.length > 5) pins.shift(); drawCurve(); } });
    $('#f2Clear').addEventListener('click', () => { pins = []; drawCurve(); });
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input,select,textarea')) return;
      const b = $('#fig2').getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setIdx(idx + (e.shiftKey ? 12 : 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setIdx(idx - (e.shiftKey ? 12 : 1)); }
      if (e.key === ' ') { e.preventDefault(); play(); }
    });
    setIdx(YC.idxForMonth(ds, '1981-09'));
    YC.lazy($('#f2Curve'), drawCurve);
  });
})();
