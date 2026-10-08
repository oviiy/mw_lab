/* §1 Data: curve at a date (Fig 1), history (Fig 2), sources (Table 1); §6 bill-vs-CMT (Fig 13). */
(function () {
  const { $, color } = YC;
  const ds = YC.dataset('treasury');
  const x = ds.maturities.map(m => m / 12);
  const PIN = ['#b45309', '#a21caf', '#4338ca', '#0369a1', '#15803d'];
  let idx = YC.idxForMonth(ds, '1981-09'), pins = [], playing = null, histMode = 'levels', curveReady = false, histReady = false;

  const isBill = (m) => m === 3 || m === 6;
  const env = (() => {
    const lo = ds.maturities.map(() => Infinity), hi = ds.maturities.map(() => -Infinity);
    ds.yields.forEach(r => r.forEach((v, i) => { if (v != null) { lo[i] = Math.min(lo[i], v); hi[i] = Math.max(hi[i], v); } }));
    return { lo, hi, ymax: Math.max(...hi) };
  })();

  function drawCurve() {
    const tr = [
      { x, y: env.hi, mode: 'lines', line: { width: 0 }, hoverinfo: 'skip' },
      { x, y: env.lo, mode: 'lines', line: { width: 0 }, fill: 'tonexty', fillcolor: 'rgba(100,107,117,0.08)', hoverinfo: 'skip' },
      ...pins.map((p, k) => ({
        x, y: ds.yields[p], mode: 'lines+markers', connectgaps: true, name: YC.fmtDate(ds.dates[p]), showlegend: true,
        line: { color: PIN[k % PIN.length], width: 1.4, dash: 'dot' }, marker: { size: 4 },
        text: ds.maturities.map(YC.matLabel), hovertemplate: `${YC.fmtDate(ds.dates[p])} %{text}: %{y:.2f}%<extra></extra>`,
      })),
      {
        x, y: ds.yields[idx], mode: 'lines+markers', connectgaps: true, name: YC.fmtDate(ds.dates[idx]), showlegend: pins.length > 0,
        line: { color: color.ink, width: 2 }, marker: { size: 8, color: ds.maturities.map(m => (isBill(m) ? color.bill : color.accent)), line: { width: 1.5, color: '#fff' } },
        text: ds.maturities.map(m => `${YC.matLabel(m)} · ${isBill(m) ? 'T-bill' : 'CMT'}`), hovertemplate: '%{text}: <b>%{y:.3f}%</b><extra></extra>',
      },
    ];
    YC.plot($('#f1Curve'), tr, YC.layout({
      showlegend: pins.length > 0, margin: { l: 42, r: 10, t: pins.length ? 26 : 8, b: 30 },
      xaxis: { type: 'log', ...YC.matTicks(ds.maturities), range: [Math.log10(1 / 12) - 0.04, Math.log10(30) + 0.04] },
      yaxis: { ticksuffix: '%', range: [-0.3, env.ymax + 0.5] },
    }));
    curveReady = true;
  }

  function drawStats() {
    const r = ds.yields[idx], g = (m) => r[ds.maturities.indexOf(m)];
    const s1 = g(120) != null && g(3) != null ? (g(120) - g(3)) * 100 : null;
    const s2 = g(120) != null && g(24) != null ? (g(120) - g(24)) * 100 : null;
    const fmt = (v, u, d = 2) => (v == null ? '<span class="muted">n/a</span>' : `<span style="color:${v < 0 && u === 'bp' ? color.red : 'inherit'}">${v.toFixed(d)}${u === 'bp' ? ' bp' : '%'}</span>`);
    $('#f1Stats').innerHTML = [['3M', g(3), '%'], ['2Y', g(24), '%'], ['10Y', g(120), '%'], ['30Y', g(360), '%'], ['10Y − 3M', s1, 'bp', 0], ['10Y − 2Y', s2, 'bp', 0]]
      .map(([k, v, u, d]) => `<dt>${k}</dt><dd>${fmt(v, u, d)}</dd>`).join('');
    const ym = YC.month(ds.dates[idx]);
    let h = '';
    if (YC.recessions.some(([a, b]) => ym >= a && ym <= b)) h += '<div class="ev"><b>Recession</b> (NBER)</div>';
    YC.events.filter(e => Math.abs(YC.monthsBetween(e.d, ym)) <= 6).forEach(e => { h += `<div class="ev"><b>${e.t}</b> · ${YC.fmtDate(e.d)}<br>${e.long}</div>`; });
    const miss = ds.maturities.filter((m, i) => r[i] == null).map(YC.matLabel);
    if (miss.length) h += `<div class="muted" style="margin-top:6px">Not published this month: ${miss.join(', ')}</div>`;
    $('#f1Ctx').innerHTML = h;
  }

  function drawHist() {
    const from = ds.dates[0], to = ds.dates[ds.dates.length - 1];
    let tr;
    if (histMode === 'levels') {
      tr = [3, 24, 120, 360].map(m => ({
        x: ds.dates, y: YC.col(ds, m), name: YC.matLabel(m), mode: 'lines', connectgaps: false,
        line: { width: 1.2, color: YC.matColorFor(ds.maturities, m) }, hovertemplate: `${YC.matLabel(m)} %{y:.2f}%<extra></extra>`,
      }));
    } else {
      const sp = (a, b) => ds.yields.map(r => { const u = r[ds.maturities.indexOf(a)], v = r[ds.maturities.indexOf(b)]; return u == null || v == null ? null : +((u - v) * 100).toFixed(1); });
      tr = [
        { x: ds.dates, y: sp(120, 3), name: '10Y − 3M', mode: 'lines', line: { width: 1.3, color: color.accent }, hovertemplate: '10Y−3M %{y:.0f} bp<extra></extra>' },
        { x: ds.dates, y: sp(120, 24), name: '10Y − 2Y', mode: 'lines', connectgaps: false, line: { width: 1.1, color: color.amber }, hovertemplate: '10Y−2Y %{y:.0f} bp<extra></extra>' },
      ];
    }
    const ev = YC.eventMarks(from, to);
    YC.plot($('#f2Hist'), tr, YC.layout({
      showlegend: true, hovermode: 'x unified', margin: { l: 42, r: 10, t: 26, b: 28 },
      xaxis: { type: 'date', range: [from, to] }, yaxis: { ticksuffix: histMode === 'levels' ? '%' : '', zeroline: true },
      shapes: [...YC.recessionShapes(from, to), ...ev.shapes, YC.vline(ds.dates[idx])], annotations: ev.annotations,
    }));
    YC.onClick($('#f2Hist'), (e) => setIdx(YC.idxForMonth(ds, String(e.points[0].x).slice(0, 7))));
    histReady = true;
  }

  function setIdx(i, fromSlider) {
    idx = Math.max(0, Math.min(ds.dates.length - 1, i));
    if (!fromSlider) $('#f1Slider').value = idx;
    $('#f1Date').textContent = YC.fmtDate(ds.dates[idx]);
    drawStats();
    if (curveReady) drawCurve();
    if (histReady) {
      const el = $('#f2Hist');
      Plotly.relayout(el, { shapes: el.layout.shapes.slice(0, -1).concat([YC.vline(ds.dates[idx])]) });
    }
  }

  function play() {
    if (playing) { clearInterval(playing); playing = null; $('#f1Play').textContent = '▶'; return; }
    if (idx >= ds.dates.length - 1) setIdx(0);
    $('#f1Play').textContent = '❚❚';
    playing = setInterval(() => { if (idx >= ds.dates.length - 1) play(); else setIdx(idx + 2); }, 80);
  }

  function table1() {
    const first = (m) => ds.coverage[`m${m}`][0][0];
    const gaps = (m) => {
      const runs = ds.coverage[`m${m}`];
      const add = (ym, k) => { const d = new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7) - 1 + k, 1)); return d.toISOString().slice(0, 7); };
      return runs.slice(1).map((r, i) => `${YC.fmtDate(add(runs[i][1], 1))} – ${YC.fmtDate(add(r[0], -1))}`).join('; ') || '—';
    };
    $('#tab1').innerHTML = '<thead><tr><th>Maturity</th><th>Source</th><th>First month</th><th>Gaps (blank, not filled)</th><th>Core</th></tr></thead><tbody>' +
      ds.maturities.map((m, i) => `<tr><td>${YC.matLabel(m)}</td><td>${isBill(m) ? 'Treasury bill, secondary market (discount → bond-equivalent)' : 'Constant-maturity Treasury (CMT)'}</td>
        <td>${YC.fmtDate(first(m) + '-01')}</td><td>${gaps(m)}</td><td>${ds.core.includes(i) ? '●' : ''}</td></tr>`).join('') + '</tbody>';
  }

  function fig13() {
    const sp = ds.splice_diagnostics;
    YC.plot($('#sDiff'), ['m3', 'm6'].map((k, i) => ({
      x: sp[k].monthly_dates.map(d => `${d}-15`), y: sp[k].monthly_bp, name: k === 'm3' ? '3M' : '6M', mode: 'lines',
      line: { width: 1, color: i ? color.factor[3] : color.bill }, hovertemplate: `${k === 'm3' ? '3M' : '6M'} %{y:.1f} bp<extra></extra>`,
    })), YC.layout({ showlegend: true, hovermode: 'x unified', margin: { l: 38, r: 10, t: 24, b: 24 }, xaxis: { type: 'date' }, yaxis: { ticksuffix: ' bp', zeroline: true } }));
  }

  YC.sections.push(() => {
    const sp = ds.splice_diagnostics;
    YC.fill('T', ds.dates.length);
    YC.fill('splice3', `${sp.m3.mean_bp.toFixed(1)} bp on average (s.d. ${sp.m3.sd_bp.toFixed(1)} bp)`);
    YC.fill('splice6', `${sp.m6.mean_bp.toFixed(1)} bp (s.d. ${sp.m6.sd_bp.toFixed(1)} bp)`);
    table1();
    const sl = $('#f1Slider'); sl.max = ds.dates.length - 1; sl.value = idx;
    sl.addEventListener('input', (e) => setIdx(+e.target.value, true));
    $('#f1Play').addEventListener('click', play);
    $('#f1Pin').addEventListener('click', () => { if (!pins.includes(idx)) { pins.push(idx); if (pins.length > 5) pins.shift(); drawCurve(); } });
    $('#f1Clear').addEventListener('click', () => { pins = []; drawCurve(); });
    YC.seg($('#f2Mode'), histMode, (v) => { histMode = v; drawHist(); });
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input,select,textarea')) return;
      const r = $('#fig1').getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setIdx(idx + (e.shiftKey ? 12 : 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setIdx(idx - (e.shiftKey ? 12 : 1)); }
      if (e.key === ' ') { e.preventDefault(); play(); }
    });
    $('#f1Date').textContent = YC.fmtDate(ds.dates[idx]);
    drawStats();
    YC.lazy($('#f1Curve'), drawCurve);
    YC.lazy($('#f2Hist'), drawHist);
    YC.lazy($('#sDiff'), fig13);
  });
})();
