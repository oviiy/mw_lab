/* §3 Full-sample results: Table 2, null distributions (Fig 4), sub-periods (Fig 5), bandwidth (Table 3), live test (Fig 6). */
(function () {
  const { $, D, E, color } = YC;
  const R = D.results;
  const tag = (rej) => `<span class="tag ${rej ? 'rej' : 'acc'}">${rej ? 'reject' : 'do not reject'}</span>`;
  const fp = (p) => (p <= 0.0001 ? '≤ 0.0001' : p.toFixed(4));

  function table2() {
    const name = (p) => p.replace('Treasury CMT (H.15) 1981-09-2026-08', 'Treasury CMT 1981–2026').replace('Treasury par 1990-2026', 'Treasury par 1990–2026').replace('JKV 1970-2009', 'JKV 1970–2009');
    let last = '';
    $('#tab2').innerHTML = '<thead><tr><th>Panel</th><th class="num">T</th><th class="num">N</th><th class="num">d</th><th class="num">T·h (months)</th><th class="num">J</th><th class="num">99% crit.</th><th class="num">p</th><th>at 1%</th></tr></thead><tbody>' +
      R.headline.map(h => { const g = h.panel !== last; last = h.panel; return `<tr class="${g ? 'grp' : ''}"><td>${g ? name(h.panel) : ''}</td><td class="num">${g ? h.T : ''}</td><td class="num">${g ? h.N : ''}</td><td class="num">${h.d}</td>
        <td class="num">${h.Th_months.toFixed(0)}</td><td class="num"><b>${h.J.toFixed(2)}</b></td><td class="num">${h.critical_99.toFixed(2)}</td><td class="num">${fp(h.p)}</td><td>${tag(h.reject_1pct)}</td></tr>`; }).join('') + '</tbody>';
  }

  /** Histogram of a null distribution with critical value and observed J (arrow when J is off the chart). */
  YC.nullChart = (el, h, J, crit, opts = {}) => {
    const mids = h.edges.slice(0, -1).map((e, i) => (e + h.edges[i + 1]) / 2);
    const xmax = Math.max(h.edges[h.edges.length - 1], crit) * 1.15, rej = J > crit, off = J > xmax;
    const jx = off ? xmax * 0.97 : J;
    YC.plot(el, [{ type: 'bar', x: mids, y: h.counts, width: h.edges[1] - h.edges[0], marker: { color: opts.color || '#c9c4b8' }, hovertemplate: 'J* ≈ %{x:.1f}: %{y}<extra></extra>' }, ...(opts.extra || [])], YC.layout({
      bargap: 0, barmode: 'overlay', margin: { l: 8, r: 8, t: 22, b: 26 }, yaxis: { visible: false }, xaxis: { range: [Math.min(0, h.edges[0]), xmax] },
      shapes: [
        { type: 'line', x0: crit, x1: crit, yref: 'paper', y0: 0, y1: 1, line: { color: color.amber, width: 1.4, dash: 'dot' } },
        { type: 'line', x0: jx, x1: jx, yref: 'paper', y0: 0, y1: 1, line: { color: rej ? color.red : color.green, width: 2 } },
        ...(opts.shapes || []),
      ],
      annotations: [{ x: jx, yref: 'paper', y: 1.1, text: `J = ${J.toFixed(1)}${off ? ' →' : ''}`, showarrow: false, xanchor: jx > xmax * 0.6 ? 'right' : 'left', font: { size: 10.5, color: rej ? color.red : color.green, family: 'JetBrains Mono' } }, ...(opts.annotations || [])],
    }));
  };

  function fig4() {
    const keys = ['jkv_3', 'jkv_4', 'jkv_5', 'treasury_3', 'treasury_4', 'treasury_5'];
    $('#f4Grid').innerHTML = keys.map(k => `<div><div class="sub">${k.startsWith('jkv') ? 'JKV' : 'Treasury'} · d = ${k.slice(-1)} · p ${fp(R.nulls[k].p)}</div><div id="f4_${k}" class="plot" style="height:150px"></div></div>`).join('');
    keys.forEach(k => { const n = R.nulls[k]; YC.nullChart($(`#f4_${k}`), n, n.J, n.crit); });
  }

  function fig5() {
    const periods = [...new Set(R.periods.map(p => p.period))];
    const z = [3, 4, 5].map(d => periods.map(p => { const r = R.periods.find(q => q.period === p && q.d === d); return r.J / r.critical_99; }));
    const lbl = periods.map(p => p.replace('Treasury', 'Tsy'));
    YC.plot($('#f5Periods'), [{
      type: 'heatmap', x: lbl, y: ['d = 3', 'd = 4', 'd = 5'], z: z.map(r => r.map(v => Math.log(v))), zmid: 0, zmin: -1.2, zmax: 1.2,
      colorscale: [[0, '#2f855a'], [0.5, '#f7f5f0'], [1, '#b91c1c']], showscale: false,
      text: z.map(r => r.map(v => v.toFixed(2))), texttemplate: '%{text}', textfont: { size: 12, family: 'JetBrains Mono' },
      hovertemplate: '%{x}, %{y}: J/crit %{text}<extra></extra>',
    }], YC.layout({ margin: { l: 48, r: 8, t: 6, b: 50 }, xaxis: { type: 'category', showline: false, tickangle: 0, tickfont: { size: 10 } }, yaxis: { type: 'category', autorange: 'reversed', showline: false },
      shapes: [3, 5].map(c => ({ type: 'rect', xref: 'x', yref: 'paper', x0: c - 0.5, x1: c + 0.5, y0: 0, y1: 1, line: { color: color.accent, width: 2 } })) }));
    const rej = (d) => R.periods.filter(p => p.d === d && p.reject).length;
    $('#f5Cap').innerHTML = `<b>Figure 5.</b> J / 99% critical value on eight samples (1,999 draws each; red rejects, green does not). d = 3 rejects in ${rej(3)} of 8, d = 4 in ${rej(4)} of 8. Boxed: the 1990–2009 overlap, where JKV and Treasury agree at every rank. Treasury 2010–2026 has only 200 months and little power.`;
    const ord = periods.indexOf('JKV 1990–2009'), ord2 = periods.indexOf('Treasury 1990–2009');
    if (ord !== 3 || ord2 !== 5) console.warn('overlap box positions assume period order');
  }

  function table3() {
    const panels = [['JKV 1970-2009', 'JKV 1970-2009', 'JKV'], ['Treasury 1981-2026', 'Treasury 1981-2026', 'Treasury']];
    const mults = [0.5, 0.8, 1.0, 1.2, 2.0], fixed = ['Th=36', 'Th=24', 'Th=12'];
    const cell = (p) => `<td class="c ${p < 0.01 ? 'rej' : p < 0.05 ? 'mid' : 'acc'}">${p <= 0.0001 ? '≤.0001' : p.toFixed(4)}</td>`;
    let html = `<thead><tr><th>Panel</th><th>d</th>${mults.map(m => `<th class="c">${m}× h</th>`).join('')}${fixed.map(f => `<th class="c">T·h = ${f.slice(3)}</th>`).join('')}</tr></thead><tbody>`;
    for (const [pm, pf, lab] of panels) {
      for (const d of [3, 4, 5]) {
        const a = mults.map(m => R.bw_mult.find(r => r.panel === pm && r.d === d && Math.abs(r.h_mult - m) < 1e-6));
        const b = fixed.map(f => R.bw_fixed.find(r => r.data.startsWith(lab) && r.d === d && r.bandwidth === f));
        html += `<tr class="${d === 3 ? 'grp' : ''}"><td>${d === 3 ? lab : ''}</td><td>${d}</td>${a.map(r => cell(r.p)).join('')}${b.map(r => cell(r.p)).join('')}</tr>`;
      }
    }
    $('#tab3').innerHTML = html + '</tbody>';
  }

  // ---------- live test ----------
  let labR = 4, labB = 199, running = false;
  const runs = [];
  const sample = () => { const ds = YC.dataset($('#lDs').value); let a = +$('#lFrom').value, b = +$('#lTo').value; if (a > b) [a, b] = [b, a]; return { ds, ...YC.core(ds, a, b) }; };
  function fillDates() {
    const ds = YC.dataset($('#lDs').value), o = ds.dates.map((d, i) => `<option value="${i}">${YC.fmtDate(d)}</option>`).join('');
    $('#lFrom').innerHTML = o; $('#lTo').innerHTML = o;
    $('#lFrom').value = ds.id === 'jkv' ? YC.idxForMonth(ds, '1980-01') : 0; $('#lTo').value = ds.dates.length - 1; meta();
  }
  function meta() {
    const s = sample(), T = s.Y.length, N = s.mats.length, h = (2.35 / Math.sqrt(12)) * T ** -0.2 * N ** -0.1, secs = T * T * N * N * (labB + 1) / 3e8;
    $('#lMeta').innerHTML = `T = ${T}, N = ${N}, T·h ≈ ${Math.round(T * h)} months · est. ${secs < 60 ? `${Math.max(1, Math.round(secs))} s` : `${(secs / 60).toFixed(1)} min`}` +
      (labR >= N - 1 ? ' · <span style="color:var(--red)">too many factors for N</span>' : '') + (T < 48 ? ' · <span style="color:var(--amber)">short sample</span>' : '');
    $('#lRun').disabled = running || labR >= N - 1 || T < 24;
  }
  async function run() {
    const s = sample(); running = true; $('#lRun').disabled = true; $('#lRun').textContent = 'Running…';
    const bar = $('#lProg'); bar.hidden = false; bar.firstElementChild.style.width = '0%';
    const t0 = performance.now();
    try {
      const res = await YC.runBootstrap(E.standardize(s.Y).Z, labR, { reps: labB, seed: +$('#lSeed').value || 2017 }, (b, n) => { bar.firstElementChild.style.width = `${(100 * b / n).toFixed(0)}%`; });
      const v = res.draws.filter(Number.isFinite), rej = res.p < 0.01;
      $('#lRes').innerHTML = `<div class="muted">J</div><div class="bigJ">${res.J.toFixed(2)}</div><div class="verdict ${rej || res.exceedances === 0 ? 'rej' : 'acc'}">${rej ? 'Reject at 1%' : res.exceedances === 0 ? `J exceeds all ${v.length} draws (p ≤ ${(1 / (v.length + 1)).toFixed(3)}); use more draws for a 1% decision` : res.p < 0.05 ? 'Reject at 5%, not 1%' : 'Do not reject'}</div>
        <dl class="stats"><dt>p</dt><dd>${res.p.toFixed(4)}</dd><dt>99% crit.</dt><dd>${res.critical_99.toFixed(2)}</dd><dt>T·h</dt><dd>${res.bandwidthMonths.toFixed(0)} m</dd><dt>time</dt><dd>${((performance.now() - t0) / 1000).toFixed(1)} s</dd></dl>`;
      const lo = Math.min(...v), hi = Math.max(...v), bins = 30, w = (hi - lo) / bins || 1, counts = new Array(bins).fill(0);
      v.forEach(d => { counts[Math.min(bins - 1, Math.floor((d - lo) / w))]++; });
      YC.nullChart($('#lHist'), { edges: Array.from({ length: bins + 1 }, (_, i) => lo + i * w), counts }, res.J, res.critical_99);
      runs.unshift({ ds: s.ds.short, a: s.dates[0], b: s.dates[s.dates.length - 1], T: s.Y.length, d: labR, B: labB, J: res.J, c: res.critical_99, p: res.p });
      $('#lHistory').innerHTML = '<thead><tr><th>Panel</th><th>Sample</th><th class="num">T</th><th class="num">d</th><th class="num">B</th><th class="num">J</th><th class="num">99% crit.</th><th class="num">p</th></tr></thead><tbody>' +
        runs.map(q => `<tr><td>${q.ds}</td><td>${YC.fmtDate(q.a)} – ${YC.fmtDate(q.b)}</td><td class="num">${q.T}</td><td class="num">${q.d}</td><td class="num">${q.B}</td><td class="num"><b>${q.J.toFixed(2)}</b></td><td class="num">${q.c.toFixed(2)}</td><td class="num">${q.p.toFixed(4)}</td></tr>`).join('') + '</tbody>';
    } catch (err) { $('#lRes').innerHTML = `<span style="color:var(--red)">${err.message}</span>`; }
    finally { running = false; $('#lRun').textContent = 'Run test'; bar.hidden = true; meta(); }
  }

  YC.sections.push(() => {
    table2(); table3();
    YC.lazy($('#fig4'), fig4);
    YC.lazy($('#fig5'), fig5);
    D.datasets.forEach(d => $('#lDs').appendChild(new Option(d.label, d.id)));
    $('#lDs').value = 'treasury';
    $('#lDs').addEventListener('change', fillDates);
    $('#lFrom').addEventListener('change', meta); $('#lTo').addEventListener('change', meta);
    YC.seg($('#lR'), String(labR), (v) => { labR = +v; meta(); });
    YC.seg($('#lB'), String(labB), (v) => { labB = +v; meta(); });
    $('#lRun').addEventListener('click', run);
    fillDates();
  });
})();
