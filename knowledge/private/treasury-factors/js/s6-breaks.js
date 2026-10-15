/* §6 Break scan: step-through (Fig 10), results (Fig 11), robustness grid (Table 5), lanes (Fig 12). */
(function () {
  const { $, D, color } = YC;
  const R = D.results;
  const SCANS = [['jkv_4', 'JKV · d = 4'], ['jkv_3', 'JKV · d = 3'], ['jkv_5', 'JKV · d = 5'], ['treasury_4', 'Treasury · d = 4'], ['treasury_3', 'Treasury · d = 3'], ['treasury_5', 'Treasury · d = 5']];
  let scanKey = 'jkv_4', seg = 0, step = 0, playing = null, robDs = 'jkv', robD = '4';

  const dsOf = (k) => YC.dataset(k.startsWith('jkv') ? 'jkv' : 'treasury');
  const ym = (s) => s.slice(0, 7);
  const toIso = (m) => `${m}-15`;
  const mdiff = (a, b) => Math.abs(YC.monthsBetween(a, b));

  function stepsOf(s) {
    const by = new Map();
    s.traj.forEach(t => { const p = by.get(t.date); if (!p || t.stage === 'confirm') by.set(t.date, t); });
    const out = [...by.values()].sort((a, b) => a.date.localeCompare(b.date));
    return s.retreated ? out.reverse() : out;
  }
  const segsOf = (k) => R.scans[k].segments.map((s, i) => ({ ...s, i, steps: stepsOf(s) }));

  function explain(s, k, sp) {
    const st = s.steps[k], n = YC.monthsBetween(s.start, st.date) + 1, last = k === s.steps.length - 1;
    const head = `<b>Step ${k + 1} of ${s.steps.length}.</b> Window ${YC.fmtDate(s.start)} – ${YC.fmtDate(st.date)} (${n} months, T·h ≈ ${st.Th ?? '—'} months): J = ${st.J.toFixed(1)} vs 99% critical ${st.crit.toFixed(1)} (${st.stage === 'confirm' ? '9,999-draw confirmation' : '999-draw screen'}, p = ${st.p.toFixed(3)}). `;
    if (!s.break) return head + (last ? `The scan reaches the end of the sample without rejecting: the final stretch from ${YC.fmtDate(s.start)} is consistent with fixed loadings.` : 'Not rejected; extend by one month.');
    if (s.retreated) {
      if (k === 0) return head + 'The first full window <b>already rejects</b>, so the change lies inside it: shrink month by month.';
      if (!last) return head + (st.reject ? 'Still rejects — shrink again.' : 'Does not reject.');
      return head + `<b>No longer rejects</b>, so the break is recorded at <b>${YC.fmtDate(s.break)}</b>; the next stretch restarts there with ${sp.restart} months of post-break data.`;
    }
    if (!last) return head + (k === 0 ? 'The first full window does not reject; ' : 'Not rejected; ') + 'extend by one month.';
    return head + `Adding ${YC.fmtDate(st.date)} makes the test reject: <b>break at ${YC.fmtDate(s.break)}</b> (confirmed p = ${s.p.toFixed(4)}). The next stretch waits for ${sp.restart} months of post-break data.`;
  }

  function fig10() {
    const ds = dsOf(scanKey), segs = segsOf(scanKey), s = segs[seg], sp = R.scans[scanKey].spec;
    if (!s.steps.length) { $('#bExplain').textContent = 'No recorded steps for this stretch.'; return; }
    const st = s.steps[step], done = step === s.steps.length - 1 && s.break;
    const hi = s.steps.reduce((m, q) => (q.date > m ? q.date : m), s.break || s.start);
    const i0 = Math.max(0, YC.idxForMonth(ds, s.start) - 12), i1 = Math.min(ds.dates.length - 1, YC.idxForMonth(ds, hi) + 12);
    const xs = ds.dates.slice(i0, i1 + 1);
    YC.plot($('#bWin'), [3, 120].map(m => ({ x: xs, y: YC.col(ds, m).slice(i0, i1 + 1), name: YC.matLabel(m), mode: 'lines', line: { width: 1.2, color: YC.matColorFor([3, 120], m) }, hovertemplate: `${YC.matLabel(m)} %{y:.2f}%<extra></extra>` })),
      YC.layout({ showlegend: true, margin: { l: 36, r: 8, t: 22, b: 22 }, xaxis: { type: 'date', range: [xs[0], xs[xs.length - 1]] }, yaxis: { ticksuffix: '%' },
        shapes: [{ type: 'rect', xref: 'x', yref: 'paper', x0: toIso(s.start), x1: toIso(st.date), y0: 0, y1: 1, layer: 'below', fillcolor: st.reject ? 'rgba(185,28,28,0.10)' : 'rgba(15,118,110,0.12)', line: { width: 1, color: st.reject ? color.red : color.accent } },
          ...(done ? [YC.vline(toIso(s.break), color.red, 2)] : [])] }));
    const ord = [...s.steps].sort((a, b) => a.date.localeCompare(b.date)), shown = s.steps.slice(0, step + 1);
    const ymax = Math.max(...s.steps.map(q => Math.max(q.J, q.crit))) * 1.08;
    YC.plot($('#bTraj'), [
      { x: ord.map(q => toIso(q.date)), y: ord.map(q => q.crit), name: '99% critical', mode: 'lines', line: { color: color.amber, width: 1.2, dash: 'dot' }, hovertemplate: 'crit %{y:.1f}<extra></extra>' },
      { x: shown.map(q => toIso(q.date)), y: shown.map(q => q.J), name: 'J', mode: 'markers', marker: { size: shown.map((_, k) => (k === step ? 10 : 5)), color: shown.map(q => (q.reject ? color.red : color.accent)), line: { width: 1, color: '#fff' } }, hovertemplate: 'J %{y:.1f}<extra></extra>' },
    ], YC.layout({ showlegend: true, margin: { l: 36, r: 8, t: 22, b: 24 }, xaxis: { type: 'date', range: [xs[0], xs[xs.length - 1]] }, yaxis: { range: [Math.min(0, ...s.steps.map(q => q.J)), ymax] } }));
    $('#bStepLbl').textContent = `${step + 1}/${s.steps.length}`;
    $('#bExplain').innerHTML = explain(s, step, sp);
  }
  function fillSegs() {
    const segs = segsOf(scanKey);
    $('#bSeg').innerHTML = segs.map(s => `<option value="${s.i}">${s.i + 1}: ${YC.fmtDate(s.start)} → ${s.break ? YC.fmtDate(s.break) : 'end'}${s.retreated ? ' (retreat)' : ''}</option>`).join('');
    seg = Math.min(seg, segs.length - 1); $('#bSeg').value = seg; setSeg(seg);
  }
  function setSeg(i) {
    seg = i; step = 0; if (playing) toggle();
    const n = segsOf(scanKey)[i].steps.length; $('#bStep').max = Math.max(0, n - 1); $('#bStep').value = 0; fig10();
  }
  function toggle() {
    if (playing) { clearInterval(playing); playing = null; $('#bPlay').textContent = '▶'; return; }
    const n = segsOf(scanKey)[seg].steps.length; if (step >= n - 1) step = -1;
    $('#bPlay').textContent = '❚❚';
    playing = setInterval(() => { if (step >= n - 1) { toggle(); return; } step++; $('#bStep').value = step; fig10(); }, n > 40 ? 60 : 400);
  }

  function fig11() {
    const rows = SCANS.map(([k, l]) => [k, l]).sort((a, b) => a[0].localeCompare(b[0]));
    const order = ['jkv_3', 'jkv_4', 'jkv_5', 'treasury_3', 'treasury_4', 'treasury_5'], labels = order.map(k => SCANS.find(s => s[0] === k)[1]);
    const traces = [], ann = [];
    order.forEach((k, r) => {
      const sc = R.scans[k], segs = sc.segments, end = sc.spec.sample[1];
      segs.forEach((s, i) => traces.push({ x: [toIso(s.start), toIso(s.break || end)], y: [labels[r], labels[r]], mode: 'lines', line: { width: 12, color: i % 2 ? '#9cc7c2' : '#2f6f73' }, hoverinfo: 'text', text: `${labels[r]}: ${YC.fmtDate(s.start)} – ${s.break ? YC.fmtDate(s.break) : 'end'}`, showlegend: false }));
      segs.filter(s => s.break).forEach(s => ann.push({ x: toIso(s.break), y: labels[r], text: `'${s.break.slice(2, 4)}`, showarrow: false, yshift: 13, font: { size: 9, color: color.ink, family: 'JetBrains Mono' } }));
    });
    YC.plot($('#bRows'), traces, YC.layout({ margin: { l: 104, r: 10, t: 6, b: 26 }, xaxis: { type: 'date', range: ['1970-01-01', '2026-08-31'], dtick: 'M60' }, yaxis: { type: 'category', categoryarray: [...labels].reverse(), categoryorder: 'array', showgrid: false }, annotations: ann,
      shapes: YC.recessionShapes('1970', '2026') }));
    const n = order.reduce((a, k) => a + R.scans[k].segments.filter(s => s.break).length, 0);
    const list = (k) => R.scans[k].segments.filter(s => s.break).map(s => s.break).join(', ');
    $('#bRowsCap').innerHTML = `<b>Figure 11.</b> Stable stretches (alternating shades carry no meaning) and ${n} breaks across the six rows, all dated; 60-month first and restart windows. d = 3 breaks often, d = 4 rarely: JKV ${list('jkv_4')}; Treasury ${list('treasury_4')}.`;
  }

  function table5() {
    const groups = [['jkv', 'JKV'], ['treasury_cmt', 'Treasury']], rs = [12, 24, 36, 60];
    let html = `<thead><tr><th>Panel</th><th>d</th>${rs.map(r => `<th class="c">restart ${r}</th>`).join('')}</tr></thead><tbody>`;
    const maxN = Math.max(...R.grid.map(g => g.n_breaks));
    for (const [ds, lab] of groups) for (const d of [3, 4, 5]) {
      html += `<tr class="${d === 3 ? 'grp' : ''}"><td>${d === 3 ? lab : ''}</td><td>${d}</td>` + rs.map(r => {
        const v = R.grid.filter(g => g.dataset === ds && g.d === d && g.restart === r).map(g => g.n_breaks);
        const lo = Math.min(...v), hi = Math.max(...v), a = 0.08 + 0.55 * hi / maxN;
        return `<td class="c" style="background:rgba(15,118,110,${a.toFixed(2)});color:${a > 0.4 ? '#fff' : 'inherit'}">${lo === hi ? lo : `${lo}–${hi}`}</td>`;
      }).join('') + '</tr>';
    }
    $('#tab5').innerHTML = html + '</tbody>';
  }

  function fig12() {
    const lanes = [12, 24, 36, 60].map(r => ({ name: `restart ${r}`, breaks: (R.grid.find(g => g.dataset === robDs && g.d === +robD && g.mw === 60 && g.restart === r)?.breaks || '').split(' ').filter(Boolean) }));
    const bwLab = robDs === 'jkv' ? 'JKV' : 'Treasury', rules = [['silverman', 'Silverman h'], ['scale0.5', '0.5× h'], ['scale1.5', '1.5× h']];
    const bwl = rules.map(([k, l]) => ({ name: l, breaks: R.bw_breaks.filter(b => b.data === bwLab && b.d === +robD && b.rule === k).map(b => b.break) }));
    const main = lanes[3].breaks, robust = main.filter(b => lanes.every(l => l.breaks.some(x => mdiff(x, b) <= 3)));
    const names = [...lanes.map(l => l.name), ...bwl.map(l => l.name)];
    const traces = [...lanes, ...bwl].map((l, i) => ({ x: l.breaks.map(toIso), y: l.breaks.map(() => l.name), mode: 'markers', marker: { symbol: 'line-ns-open', size: 16, color: i < 4 ? color.ink : '#a21caf', line: { width: 2.4, color: i < 4 ? color.ink : '#a21caf' } }, hovertemplate: `${l.name}: %{x|%b %Y}<extra></extra>` }));
    const sp = robDs === 'jkv' ? ['1970-01-01', '2009-12-31'] : ['1981-09-01', '2026-08-31'];
    YC.plot($('#bLanes'), traces, YC.layout({ margin: { l: 84, r: 10, t: 8, b: 26 }, xaxis: { type: 'date', range: sp, dtick: 'M60' },
      yaxis: { type: 'category', categoryarray: [...names].reverse(), categoryorder: 'array', showgrid: true },
      shapes: [...robust.map(b => ({ type: 'rect', xref: 'x', yref: 'paper', x0: `${b}-01`, x1: `${b}-28`, y0: 0, y1: 1, fillcolor: 'rgba(15,118,110,0.18)', line: { width: 4, color: 'rgba(15,118,110,0.18)' }, layer: 'below' })),
        { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 2.5, y1: 2.5, line: { color: color.rule || '#cfcbc1', width: 1, dash: 'dot' } }] }));
    const all3 = R.bw_breaks.filter(b => b.data === bwLab && b.d === +robD && b.rule === 'silverman' && b.in_all_three).map(b => b.break);
    const cnt = rules.map(([k, l]) => `${bwl.find(x => x.name === l).breaks.length} (${l})`).join(', ');
    $('#bLanesCap').innerHTML = `<b>Figure 12.</b> ${bwLab}, d = ${robD}. Top four lanes: breaks for each restart window (first window 60 months). Bottom three (violet): the main scan under Silverman's h and under 0.5× and 1.5× of it (week 7). Teal bands: breaks found within ±3 months under all four restart windows.`;
    $('#bRobText').innerHTML = `For ${bwLab} with d = ${robD}, ${robust.length ? `the breaks surviving every restart window are <b>${robust.join(', ')}</b>` : 'no break survives every restart window'}. ` +
      `Changing the bandwidth changes the count — ${cnt} — and ${all3.length ? `${all3.join(', ')} recur${all3.length === 1 ? 's' : ''} under all three bandwidth rules` : 'none of these dates recurs under all three bandwidth rules'}` +
      `. Across all six rows only ${(() => { const a = R.bw_breaks.filter(b => b.rule === 'silverman' && b.in_all_three); return a.length === 1 ? `one break — ${a[0].data} d = ${a[0].d}, ${a[0].break} —` : `${a.length} breaks`; })()} survives all three bandwidth rules within ±3 months. Dates are therefore approximate.`;
  }

  YC.sections.push(() => {
    $('#bScan').innerHTML = SCANS.map(([k, l]) => `<option value="${k}">${l}</option>`).join('');
    $('#bScan').addEventListener('change', (e) => { scanKey = e.target.value; seg = 0; fillSegs(); });
    $('#bSeg').addEventListener('change', (e) => setSeg(+e.target.value));
    $('#bStep').addEventListener('input', (e) => { step = +e.target.value; fig10(); });
    $('#bPlay').addEventListener('click', toggle);
    YC.seg($('#bRobDs'), robDs, (v) => { robDs = v; fig12(); });
    YC.seg($('#bRobD'), robD, (v) => { robD = v; fig12(); });
    table5();
    YC.lazy($('#fig10'), fillSegs);
    YC.lazy($('#fig11'), fig11);
    YC.lazy($('#fig12'), fig12);
  });
})();
