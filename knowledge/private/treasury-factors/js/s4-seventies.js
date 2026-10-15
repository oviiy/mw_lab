/* §4 The 1970s: start-year sweep (Fig 7), misfit and null shift (Fig 8), shares and controls (Table 4). */
(function () {
  const { $, D, color } = YC;
  const R = D.results;
  let d = 4;

  function fig7() {
    const rows = R.sweep.filter(r => r.d === d);
    const ratio = rows.map(r => r.J / r.critical_99);
    YC.plot($('#f7Sweep'), [{
      type: 'bar', x: rows.map(r => String(r.start_year)), y: ratio, marker: { color: rows.map(r => (r.reject ? color.red : '#9fb9a8')) },
      text: ratio.map(v => v.toFixed(2)), textposition: 'outside', cliponaxis: false, textfont: { size: 9.5, color: color.muted },
      customdata: rows.map(r => [r.J, r.critical_99, r.p, r.T]), hovertemplate: 'start %{x} (T = %{customdata[3]}): J %{customdata[0]:.1f} vs %{customdata[1]:.1f}, p %{customdata[2]:.4f}<extra></extra>',
    }], YC.layout({ margin: { l: 38, r: 8, t: 16, b: 44 }, xaxis: { type: 'category', title: { text: 'sample start year (all end Dec 2009)', font: { size: 10.5 } } },
      yaxis: { type: d === 3 ? 'log' : 'linear', title: { text: 'J / 99% critical', font: { size: 10.5 } }, rangemode: 'tozero' },
      shapes: [{ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 1, y1: 1, line: { color: color.ink, width: 1.2, dash: 'dash' } }] }));
    const rej = rows.filter(r => r.reject).map(r => r.start_year), no = rows.filter(r => !r.reject).map(r => r.start_year);
    const span = (a) => (a.length ? (a.length > 1 && a[a.length - 1] - a[0] === a.length - 1 ? `${a[0]}–${a[a.length - 1]}` : a.join(', ')) : 'none');
    $('#f7Cap').innerHTML = `<b>Figure 7.</b> JKV, d = ${d}: J / 99% critical value by sample start year (red rejects at 1%). Starts that reject: ${span(rej)}; starts that do not: ${span(no)}.` +
      (d === 4 ? ' The decision flips as soon as 1970–76 leaves the sample.' : '');
  }

  function fig8() {
    const m = R.misfit;
    YC.plot($('#f8Mis'), [{ x: m.dates.map(x => `${x}-15`), y: m.rss, mode: 'lines', line: { color: color.ink, width: 1 }, hovertemplate: '%{x|%b %Y}: %{y:.4f}<extra></extra>' }],
      YC.layout({ margin: { l: 42, r: 8, t: 8, b: 26 }, xaxis: { type: 'date' }, yaxis: { rangemode: 'tozero' },
        shapes: [
          { type: 'rect', xref: 'x', yref: 'paper', x0: '1970-01-01', x1: '1976-12-31', y0: 0, y1: 1, fillcolor: 'rgba(180,83,9,0.12)', line: { width: 0 }, layer: 'below' },
          { type: 'rect', xref: 'x', yref: 'paper', x0: '1979-10-01', x1: '1982-11-30', y0: 0, y1: 1, fillcolor: 'rgba(100,107,117,0.12)', line: { width: 0 }, layer: 'below' },
        ],
        annotations: [{ x: '1973-06-01', yref: 'paper', y: 0.98, text: '1970–76', showarrow: false, font: { size: 10, color: color.amber } },
          { x: '1981-04-01', yref: 'paper', y: 0.98, text: 'Volcker', showarrow: false, font: { size: 10, color: color.muted } }] }));
    const a = R.null7080['1970–2009'], b = R.null7080['1980–2009'];
    const bar = (h, c, name) => ({ type: 'bar', name, x: h.edges.slice(0, -1).map((e, i) => (e + h.edges[i + 1]) / 2), y: h.counts, width: h.edges[1] - h.edges[0], marker: { color: c }, opacity: 0.55, hovertemplate: `${name}: J* ≈ %{x:.0f}<extra></extra>` });
    const vl = (x, c, dash) => ({ type: 'line', x0: x, x1: x, yref: 'paper', y0: 0, y1: 1, line: { color: c, width: dash ? 1.3 : 2.2, dash: dash ? 'dot' : 'solid' } });
    YC.plot($('#f8Null'), [bar(b, '#0369a1', 'start 1980'), bar(a, '#b91c1c', 'start 1970')], YC.layout({
      showlegend: true, barmode: 'overlay', bargap: 0, margin: { l: 8, r: 8, t: 24, b: 26 }, yaxis: { visible: false }, xaxis: { title: { text: 'J', font: { size: 10 } } },
      shapes: [vl(b.J, '#0369a1'), vl(b.crit, '#0369a1', 1), vl(a.J, '#b91c1c'), vl(a.crit, '#b91c1c', 1)],
    }));
    $('#f8Cap').innerHTML = `<b>Figure 8.</b> (a) The fixed four-factor model fits worst in the mid-1970s inflation and the Volcker years. (b) Starting in 1970 instead of 1980 moves the null median from ${b.median.toFixed(0)} to ${a.median.toFixed(0)}, ` +
      `but the observed J (solid) only from ${b.J.toFixed(0)} to ${a.J.toFixed(0)}: 1980 rejects (p = ${b.p.toFixed(4)}), 1970 does not (p = ${a.p.toFixed(2)}). Dotted: 99% critical values.`;
  }

  function table4() {
    const s = R.shares.map(r => `<tr><td>${r.period}</td><td class="num">${(r.months_share * 100).toFixed(0)}%</td><td class="num">${(r.rss_share * 100).toFixed(0)}%</td><td class="num">${(r.M_share * 100).toFixed(0)}%</td></tr>`).join('');
    const c = R.controls.map(r => `<tr><td>${r.spec}</td><td class="num">${r.Th_months.toFixed(0)}</td><td class="num">${r.J.toFixed(1)}</td><td class="num">${r.critical_99.toFixed(1)}</td><td class="num">${r.p.toFixed(4)}</td><td><span class="tag ${r.reject ? 'rej' : 'acc'}">${r.reject ? 'reject' : 'do not reject'}</span></td></tr>`).join('');
    $('#tab4').innerHTML = `<thead><tr><th>Period</th><th class="num">months</th><th class="num">misfit (RSS)</th><th class="num">gap M</th></tr></thead><tbody>${s}</tbody>
      <thead><tr><th>Control (JKV, d = 4)</th><th class="num">T·h</th><th class="num">J</th><th class="num">99% crit.</th><th class="num">p</th><th></th></tr></thead><tbody>${c}</tbody>`;
  }

  YC.sections.push(() => {
    YC.seg($('#f7D'), String(d), (v) => { d = +v; fig7(); });
    table4();
    YC.lazy($('#fig7'), fig7);
    YC.lazy($('#fig8'), fig8);
  });
})();
