/* §4 Testing constancy: kernel and fits (Fig 7), thesis results (Table 2, Fig 8), live test (Fig 9). */
(function () {
  const { $, D, E, color } = YC;
  let gsw, gZ, gK, gFit, tIdx = 120, labR = 3, labB = 199, running = false;
  const runs = [];

  function prep() {
    if (gFit) return;
    gsw = YC.dataset('gsw');
    gZ = E.standardize(gsw.yields);
    gK = E.kernel(gZ.Z.length, gZ.Z[0].length);
    gFit = E.suWangFit(gZ.Z, 3, gK);
  }

  function fig7() {
    prep();
    const T = gsw.dates.length;
    YC.plot($('#kW'), [{ x: gsw.dates, y: gsw.dates.map((_, s) => gK.K[s * T + tIdx]), mode: 'lines', fill: 'tozeroy', fillcolor: 'rgba(15,118,110,0.12)', line: { color: color.accent, width: 1.6 }, hovertemplate: '%{x|%b %Y}: %{y:.2f}<extra></extra>' }],
      YC.layout({ margin: { l: 34, r: 8, t: 8, b: 26 }, xaxis: { type: 'date' }, yaxis: { rangemode: 'tozero' }, shapes: [YC.vline(gsw.dates[tIdx])],
        annotations: [{ xref: 'paper', yref: 'paper', x: 1, y: 1, xanchor: 'right', showarrow: false, font: { size: 10.5 }, text: `h = ${gK.h.toFixed(3)}, Th ≈ ${gK.bandwidthMonths.toFixed(0)} months` }] }));
    const x = gsw.maturities.map(m => m / 12), un = (row) => row.map((v, i) => gZ.mean[i] + gZ.sd[i] * v);
    const st = un(gFit.fixedCommon[tIdx]), lo = un(gFit.common[tIdx]);
    const gmax = Math.max(...gFit.common.flatMap((row, t) => row.map((v, i) => Math.abs(v - gFit.fixedCommon[t][i]) * gZ.sd[i] * 100))) * 1.05;
    YC.plot($('#kFit'), [
      { x, y: lo.map((v, i) => (v - st[i]) * 100), type: 'bar', yaxis: 'y2', name: 'gap', marker: { color: 'rgba(162,28,175,0.28)' }, width: x.map(v => v * 0.1), hovertemplate: '%{y:.1f} bp<extra>local − static</extra>' },
      { x, y: gsw.yields[tIdx], name: 'observed', mode: 'markers', marker: { color: color.ink, size: 5 }, hovertemplate: '%{y:.3f}%<extra>observed</extra>' },
      { x, y: st, name: 'static', mode: 'lines', line: { color: color.amber, width: 1.8, dash: 'dash' }, hovertemplate: '%{y:.3f}%<extra>static</extra>' },
      { x, y: lo, name: 'local', mode: 'lines', line: { color: color.accent, width: 1.8 }, hovertemplate: '%{y:.3f}%<extra>local</extra>' },
    ], YC.layout({ showlegend: true, margin: { l: 40, r: 40, t: 24, b: 28 }, xaxis: { type: 'log', ...YC.matTicks([3, 6, 12, 24, 36, 60, 84, 120]) }, yaxis: { ticksuffix: '%' },
      yaxis2: { overlaying: 'y', side: 'right', range: [-gmax, gmax], ticksuffix: ' bp', showgrid: false, zeroline: false, showline: false, tickfont: { color: '#a21caf', size: 10 } } }));
    $('#kLbl').textContent = YC.fmtDate(gsw.dates[tIdx]);
  }

  function nullChart(el, h, J, c99, small) {
    const mids = h.edges.slice(0, -1).map((e, i) => (e + h.edges[i + 1]) / 2);
    const rej = J > c99;
    YC.plot(el, [{ type: 'bar', x: mids, y: h.counts, width: h.edges[1] - h.edges[0], marker: { color: '#c9c4b8' }, hovertemplate: 'J* ≈ %{x:.1f}: %{y}<extra></extra>' }], YC.layout({
      bargap: 0, margin: { l: 10, r: 10, t: 22, b: 28 }, yaxis: { visible: false }, xaxis: { range: [Math.min(h.min, 0, J), Math.max(J, h.max) * 1.08], title: { text: 'J', font: { size: 10 } } },
      shapes: [
        { type: 'line', x0: c99, x1: c99, yref: 'paper', y0: 0, y1: 1, line: { color: color.amber, width: 1.4, dash: 'dot' } },
        { type: 'line', x0: J, x1: J, yref: 'paper', y0: 0, y1: 1, line: { color: rej ? color.red : color.green, width: 2.2 } },
      ],
      annotations: [{ x: J, yref: 'paper', y: 1.08, text: `J = ${J.toFixed(1)}`, showarrow: false, xanchor: J > (h.max * 0.6) ? 'right' : 'left', font: { size: small ? 10.5 : 11.5, color: rej ? color.red : color.green, family: 'JetBrains Mono' } }],
    }));
  }

  function results() {
    const T = D.thesis.tests;
    $('#tab2').innerHTML = '<thead><tr><th>R</th><th class="num">J</th><th class="num">90%</th><th class="num">95%</th><th class="num">99% crit.</th><th class="num">draws ≥ J</th><th class="num">p</th><th>at 1%</th></tr></thead><tbody>' +
      T.map(t => `<tr><td>${t.R}</td><td class="num"><b>${t.J.toFixed(2)}</b></td><td class="num">${t.critical_90.toFixed(2)}</td><td class="num">${t.critical_95.toFixed(2)}</td><td class="num">${t.critical_99.toFixed(2)}</td>
        <td class="num">${t.exceedances} / ${t.B.toLocaleString()}</td><td class="num">${t.bootstrap_p_add_one.toFixed(4)}</td><td><span class="tag ${t.reject_1pct ? 'rej' : 'acc'}">${t.reject_1pct ? 'reject' : 'do not reject'}</span></td></tr>`).join('') + '</tbody>';
    YC.lazy($('#fig8'), () => {
      $('#f8Grid').innerHTML = T.map(t => `<div><div class="sub">R = ${t.R}</div><div id="f8R${t.R}" class="plot" style="height:170px"></div></div>`).join('');
      T.forEach(t => nullChart($(`#f8R${t.R}`), t.hist, t.J, t.critical_99, true));
    });
  }

  // ---------- live ----------
  function sample() {
    const ds = YC.dataset($('#lDs').value);
    let a = +$('#lFrom').value, b = +$('#lTo').value;
    if (a > b) [a, b] = [b, a];
    return { ds, ...YC.core(ds, a, b) };
  }
  function fillDates() {
    const ds = YC.dataset($('#lDs').value);
    const opts = ds.dates.map((d, i) => `<option value="${i}">${YC.fmtDate(d)}</option>`).join('');
    $('#lFrom').innerHTML = opts; $('#lTo').innerHTML = opts;
    $('#lFrom').value = ds.id === 'treasury' ? YC.idxForMonth(ds, '2006-09') : 0;
    $('#lTo').value = ds.dates.length - 1;
    meta();
  }
  function meta() {
    const s = sample(), T = s.Y.length, N = s.mats.length;
    const h = (2.35 / Math.sqrt(12)) * T ** -0.2 * N ** -0.1, secs = T * T * N * N * (labB + 1) / 3e8;
    $('#lMeta').innerHTML = `T = ${T} months, N = ${N} maturities, bandwidth ≈ ${Math.round(T * h)} months · est. ${secs < 60 ? `${Math.max(1, Math.round(secs))} s` : `${(secs / 60).toFixed(1)} min`}` +
      (labR >= N ? ' · <span style="color:var(--red)">R must be below N</span>' : '') + (T < 48 ? ' · <span style="color:var(--amber)">short sample: unreliable</span>' : '');
    $('#lRun').disabled = running || labR >= N || T < 24;
  }
  async function run() {
    const s = sample();
    running = true; $('#lRun').disabled = true; $('#lRun').textContent = 'Running…';
    const bar = $('#lProg'); bar.hidden = false; bar.firstElementChild.style.width = '0%';
    const t0 = performance.now();
    try {
      const res = await YC.runBootstrap(E.standardize(s.Y).Z, labR, { reps: labB, seed: +$('#lSeed').value || 2017 }, (b, n) => { bar.firstElementChild.style.width = `${(100 * b / n).toFixed(0)}%`; });
      const rej = res.p < 0.01, v = res.draws.filter(Number.isFinite);
      $('#lRes').innerHTML = `<div class="muted">J statistic</div><div class="bigJ">${res.J.toFixed(2)}</div>
        <div class="verdict ${rej ? 'rej' : 'acc'}">${rej ? 'Constancy rejected at 1%' : res.p < 0.05 ? 'Rejected at 5%, not 1%' : 'Constancy not rejected'}</div>
        <dl class="stats"><dt>p-value</dt><dd>${res.p.toFixed(4)}</dd><dt>99% critical</dt><dd>${res.critical_99.toFixed(2)}</dd><dt>draws ≥ J</dt><dd>${res.exceedances} / ${v.length}</dd><dt>time</dt><dd>${((performance.now() - t0) / 1000).toFixed(1)} s</dd></dl>
        ${v.length < 999 ? `<div class="muted">Smallest attainable p with B = ${v.length}: ${(1 / (v.length + 1)).toFixed(4)}.</div>` : ''}`;
      const lo = Math.min(...v), hi = Math.max(...v), bins = 36, w = (hi - lo) / bins || 1, counts = new Array(bins).fill(0);
      v.forEach(d => { counts[Math.min(bins - 1, Math.floor((d - lo) / w))]++; });
      nullChart($('#lHist'), { edges: Array.from({ length: bins + 1 }, (_, i) => lo + i * w), counts, min: lo, max: hi }, res.J, res.critical_99);
      runs.unshift({ ds: s.ds.short, a: s.dates[0], b: s.dates[s.dates.length - 1], T: s.Y.length, N: s.mats.length, R: labR, B: labB, J: res.J, c: res.critical_99, p: res.p });
      $('#lHistory').innerHTML = '<thead><tr><th>Data</th><th>Sample</th><th class="num">T</th><th class="num">N</th><th class="num">R</th><th class="num">B</th><th class="num">J</th><th class="num">99% crit.</th><th class="num">p</th></tr></thead><tbody>' +
        runs.map(r => `<tr><td>${r.ds}</td><td>${YC.fmtDate(r.a)} – ${YC.fmtDate(r.b)}</td><td class="num">${r.T}</td><td class="num">${r.N}</td><td class="num">${r.R}</td><td class="num">${r.B}</td><td class="num"><b>${r.J.toFixed(2)}</b></td><td class="num">${r.c.toFixed(2)}</td><td class="num">${r.p.toFixed(4)}</td></tr>`).join('') + '</tbody>';
    } catch (err) {
      $('#lRes').innerHTML = `<span style="color:var(--red)">${err.message}</span>`;
    } finally {
      running = false; $('#lRun').textContent = 'Run test'; bar.hidden = true; meta();
    }
  }

  YC.sections.push(() => {
    const sl = $('#kT');
    sl.addEventListener('input', (e) => { tIdx = +e.target.value; fig7(); });
    YC.lazy($('#fig7'), () => { prep(); sl.max = gsw.dates.length - 1; fig7(); });
    results();
    D.datasets.forEach(d => $('#lDs').appendChild(new Option(d.label, d.id)));
    $('#lDs').addEventListener('change', fillDates);
    $('#lFrom').addEventListener('change', meta); $('#lTo').addEventListener('change', meta);
    YC.seg($('#lR'), String(labR), (v) => { labR = +v; meta(); });
    YC.seg($('#lB'), String(labB), (v) => { labB = +v; meta(); });
    $('#lRun').addEventListener('click', run);
    fillDates();
  });
})();
