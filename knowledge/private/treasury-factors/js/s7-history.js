/* §7 Breaks against history: policy timeline (Fig 13), macro series (Fig 14), candidate events (Table 6). */
(function () {
  const { $, D, color } = YC;
  const R = D.results, H = D.history;
  let evD = '4';
  const dec = (ym) => +ym.slice(0, 4) + (+ym.slice(5, 7) - 0.5) / 12;
  const decToIso = (x) => { const y = Math.floor(x), m = Math.min(12, Math.floor((x - y) * 12) + 1); return `${y}-${String(m).padStart(2, '0')}-01`; };
  const breaks = (k) => R.scans[k].segments.filter(s => s.break).map(s => s.break);
  const robustSet = (() => {
    const out = new Set();
    for (const [ds, key] of [['jkv', 'jkv'], ['treasury_cmt', 'treasury']]) for (const d of [3, 4, 5]) {
      const lanes = [12, 24, 36, 60].map(r => (R.grid.find(g => g.dataset === ds && g.d === d && g.mw === 60 && g.restart === r)?.breaks || '').split(' ').filter(Boolean));
      lanes[3].forEach(b => { if (lanes.every(l => l.some(x => Math.abs(YC.monthsBetween(x, b)) <= 3))) out.add(`${key}_${d}_${b}`); });
    }
    return out;
  })();
  YC.robustBreaks = robustSet;

  function fig13() {
    const shapes = [], ann = [], traces = [];
    const band = (x0, x1, y, fill, text, h = 0.36) => { shapes.push({ type: 'rect', x0, x1, y0: y - h, y1: y + h, fillcolor: fill, line: { width: 0.5, color: '#fff' } }); if (text) ann.push({ x: (x0 + x1) / 2, y, text, showarrow: false, font: { size: 9.5, color: '#fff' } }); };
    H.presidents.forEach(([n, a, b, p]) => band(a, Math.min(b, 2026.7), 7, p === 'D' ? '#3b6ea8' : '#b5473f', b - a > 3 ? n : ''));
    H.chairs.forEach(([n, a, b], i) => band(a, Math.min(b, 2026.7), 6, i % 2 ? '#5f6b78' : '#46505b', n));
    H.hikes.forEach(([a, b]) => band(a, b, 5, 'rgba(185,28,28,0.75)', ''));
    H.cuts.forEach(([a, b]) => band(a, Math.min(b, 2026.7), 5, 'rgba(21,128,61,0.7)', ''));
    traces.push({ x: H.fiscal.map(f => f[0]), y: H.fiscal.map(() => 4), mode: 'markers+text', marker: { symbol: 'diamond', size: 7, color: color.amber }, text: H.fiscal.map(f => f[1]), textposition: H.fiscal.map((_, i) => (i % 2 ? 'top center' : 'bottom center')), textfont: { size: 8.5, color: color.muted }, hovertemplate: '%{text}<extra></extra>' });
    YC.recessions.forEach(([a, b]) => shapes.push({ type: 'rect', x0: dec(a), x1: dec(b) + 1 / 12, yref: 'paper', y0: 0, y1: 1, fillcolor: 'rgba(100,107,117,0.12)', line: { width: 0 }, layer: 'below' }));
    shapes.push({ type: 'line', x0: 1973, x1: 1982, y0: 7.75, y1: 7.75, line: { color: color.red, width: 3 } });
    shapes.push({ type: 'line', x0: 1985, x1: 2007, y0: 7.75, y1: 7.75, line: { color: color.green, width: 3 } });
    ann.push({ x: 1977.5, y: 7.75, text: 'Great Inflation', showarrow: false, yshift: 9, font: { size: 9.5, color: color.red } });
    ann.push({ x: 1996, y: 7.75, text: 'Great Moderation', showarrow: false, yshift: 9, font: { size: 9.5, color: color.green } });
    const rows = [['jkv_3', 3], ['jkv_4', 2], ['treasury_3', 1], ['treasury_4', 0]];
    rows.forEach(([k, y]) => {
      const b = breaks(k), rob = b.map(x => robustSet.has(`${k}_${x}`));
      traces.push({ x: b.map(dec), y: b.map(() => y), mode: 'markers', marker: { symbol: 'line-ns-open', size: 15, color: rob.map(r => (r ? color.accent : color.ink)), line: { width: 2.6, color: rob.map(r => (r ? color.accent : color.ink)) } }, text: b, hovertemplate: `${k.replace('_', ' d = ')}: %{text}<extra></extra>` });
      b.forEach(x => ann.push({ x: dec(x), y, text: `'${x.slice(2, 4)}`, showarrow: false, yshift: 12, font: { size: 8.5, color: color.muted, family: 'JetBrains Mono' } }));
    });
    YC.plot($('#hTimeline'), traces, YC.layout({ margin: { l: 96, r: 10, t: 22, b: 26 }, xaxis: { range: [1969.5, 2026.8], dtick: 5, showgrid: true },
      yaxis: { range: [-0.6, 8.1], tickvals: [0, 1, 2, 3, 4, 5, 6, 7], ticktext: ['Treasury d = 4', 'Treasury d = 3', 'JKV d = 4', 'JKV d = 3', 'fiscal', 'hikes / cuts', 'Fed chair', 'President'], showgrid: false, zeroline: false },
      shapes, annotations: ann }));
  }

  function fig14() {
    const m = D.macro, x = m.months.map(v => `${v}-15`);
    const lines = [], ann = [];
    [['jkv_4', 'solid'], ['treasury_4', 'dash']].forEach(([k, dash]) => breaks(k).forEach(b => {
      const rob = robustSet.has(`${k}_${b}`);
      lines.push({ type: 'line', xref: 'x', yref: 'paper', x0: `${b}-15`, x1: `${b}-15`, y0: 0, y1: 1, line: { color: rob ? color.accent : color.ink, width: rob ? 2.2 : 1.2, dash } });
      ann.push({ x: `${b}-15`, yref: 'paper', y: 1.0, yanchor: 'bottom', text: b, showarrow: false, textangle: -90, xanchor: 'center', font: { size: 9, color: rob ? color.accent : color.muted, family: 'JetBrains Mono' } });
    }));
    const hikes = H.hikes.map(([a, b]) => ({ type: 'rect', xref: 'x', yref: 'paper', x0: decToIso(a), x1: decToIso(b), y0: 0, y1: 1, fillcolor: 'rgba(219,39,119,0.07)', line: { width: 0 }, layer: 'below' }));
    YC.plot($('#hMacro'), [
      { x, y: m.fedfunds, name: 'Fed funds', mode: 'lines', line: { color: '#1e3a8a', width: 1.3 }, hovertemplate: 'Fed funds %{y:.2f}%<extra></extra>' },
      { x, y: m.cpi_yoy, name: 'CPI y/y', mode: 'lines', line: { color: color.red, width: 1.1 }, hovertemplate: 'CPI %{y:.1f}%<extra></extra>' },
      { x, y: m.unrate, name: 'unemployment', mode: 'lines', yaxis: 'y2', line: { color: color.green, width: 1.2 }, hovertemplate: 'unemployment %{y:.1f}%<extra></extra>' },
    ], YC.layout({ showlegend: true, legend: { orientation: 'h', x: 0, y: -0.08, yanchor: 'top' }, hovermode: 'x unified', margin: { l: 36, r: 8, t: 50, b: 40 },
      xaxis: { type: 'date', range: ['1970-01-01', '2026-08-31'], dtick: 'M60' }, yaxis: { domain: [0.42, 1], ticksuffix: '%' }, yaxis2: { domain: [0, 0.34], ticksuffix: '%' },
      shapes: [...hikes, ...YC.recessionShapes('1970', '2026'), ...lines], annotations: ann }));
  }

  function table6() {
    const rows = R.events.filter(e => e.d === +evD);
    $('#tab6').innerHTML = '<thead><tr><th>Panel</th><th>Break</th><th class="num">p</th><th>Nearest event (±12 months)</th><th class="num">months after event</th><th>All window settings?</th></tr></thead><tbody>' +
      rows.map(e => { const k = `${e.panel.startsWith('JKV') ? 'jkv' : 'treasury'}_${e.d}_${e.break}`, rob = robustSet.has(k);
        return `<tr><td>${e.panel}</td><td class="mono">${e.break}${e.retreated ? ' †' : ''}</td><td class="num">${e.p.toFixed(4)}</td><td>${e.event || '<span class="muted">none within a year</span>'}</td>
          <td class="num">${e.months_after_event == null ? '—' : e.months_after_event}</td><td>${rob ? '<span class="tag acc">yes</span>' : '<span class="muted">no</span>'}</td></tr>`; }).join('') + '</tbody>';
  }

  YC.sections.push(() => {
    YC.seg($('#hEvD'), evD, (v) => { evD = v; table6(); });
    table6();
    YC.lazy($('#fig13'), fig13);
    YC.lazy($('#fig14'), fig14);
  });
})();
