/* §5 Break dates: step-through of the scan (Fig 10), 1970–2009 results (Fig 11, Table 3), 2006–2026 by R (Fig 12). */
(function () {
  const { $, D, E, color } = YC;
  const tr = YC.dataset('treasury');
  const JKV = D.thesis.breaks.jkv, PAR = D.thesis.breaks.treasury_par_2006;
  let sel = 4, step = 0, playing = null, rankSel = '3';

  // ---------- scan steps in the order the scan actually took them ----------
  function steps(seg) {
    const byDate = new Map();
    seg.trajectory.forEach(t => { const prev = byDate.get(t.end_date); if (!prev || t.stage === 'confirm') byDate.set(t.end_date, t); });
    const s = [...byDate.values()].sort((a, b) => a.end_date.localeCompare(b.end_date));
    return seg.retreated ? s.reverse() : s;
  }
  const segs = JKV.segments.map((s, i) => ({ ...s, i, steps: steps(s), months: YC.monthsBetween(s.start, s.break) }));
  const nearestEvent = (d) => {
    let best = null;
    YC.events.forEach(e => { const g = Math.abs(YC.monthsBetween(e.d, d.slice(0, 7))); if (g <= 12 && (!best || g < best.g)) best = { ...e, g }; });
    return best;
  };

  function explain(seg, k) {
    const st = seg.steps[k], n = YC.monthsBetween(seg.start, st.end_date) + 1;
    const stage = st.stage === 'confirm' ? '9,999-draw confirmation' : '999-draw screen';
    const head = `<b>Step ${k + 1} of ${seg.steps.length}.</b> Window ${YC.fmtDate(seg.start)} – ${YC.fmtDate(st.end_date)} (${n} months): J = ${st.J.toFixed(1)} vs 99% critical value ${st.crit.toFixed(1)} (${stage}, p = ${st.p.toFixed(3)}). `;
    const last = k === seg.steps.length - 1;
    if (seg.retreated) {
      if (k === 0) return head + 'The minimum-length window <b>already rejects</b>, so the change lies inside it. Retreat rule: step back one month at a time.';
      if (!last) return head + (st.reject ? 'Still rejected — step back another month.' : 'Not rejected.');
      return head + `<b>Not rejected</b> — this is the last window end consistent with constant loadings, so the break is recorded at the next month, <b>${YC.fmtDate(seg.break)}</b>, and the next segment starts there.`;
    }
    if (!last) return head + (k === 0 ? 'The minimum window does not reject; ' : 'Not rejected; ') + 'extend the window by one month.';
    return head + `Including ${YC.fmtDate(st.end_date)} pushes J above the critical value: <b>constancy rejected</b>. A break is recorded at <b>${YC.fmtDate(seg.break)}</b> and a new segment starts there.`;
  }

  function fig10() {
    const seg = segs[sel], st = seg.steps[step];
    const pad = seg.retreated ? 6 : 12;
    const lo = seg.start, hi = seg.steps.reduce((m, s) => (s.end_date > m ? s.end_date : m), seg.break);
    const i0 = Math.max(0, YC.idxForMonth(tr, lo.slice(0, 7)) - pad), i1 = Math.min(tr.dates.length - 1, YC.idxForMonth(tr, hi.slice(0, 7)) + pad);
    const xs = tr.dates.slice(i0, i1 + 1);
    const winEnd = st.end_date, done = step === seg.steps.length - 1;
    YC.plot($('#bWin'), [3, 120].map(m => ({ x: xs, y: YC.col(tr, m).slice(i0, i1 + 1), name: YC.matLabel(m), mode: 'lines', line: { width: 1.3, color: YC.matColorFor(tr.maturities, m) }, hovertemplate: `${YC.matLabel(m)} %{y:.2f}%<extra></extra>` })),
      YC.layout({ showlegend: true, margin: { l: 38, r: 8, t: 22, b: 22 }, xaxis: { type: 'date', range: [xs[0], xs[xs.length - 1]] }, yaxis: { ticksuffix: '%' },
        shapes: [
          { type: 'rect', xref: 'x', yref: 'paper', x0: seg.start, x1: winEnd, y0: 0, y1: 1, fillcolor: st.reject ? 'rgba(185,28,28,0.10)' : 'rgba(15,118,110,0.12)', line: { width: 1, color: st.reject ? color.red : color.accent }, layer: 'below' },
          ...(done ? [YC.vline(seg.break, color.red, 2)] : []),
        ],
        annotations: done ? [{ x: seg.break, yref: 'paper', y: 1.02, text: 'break', showarrow: false, yanchor: 'bottom', font: { size: 10.5, color: color.red } }] : [] }));
    const all = seg.steps, shown = all.slice(0, step + 1);
    const ord = [...all].sort((a, b) => a.end_date.localeCompare(b.end_date));
    const ymax = Math.max(...all.map(s => Math.max(s.J, s.crit))) * 1.08, ymin = Math.min(0, ...all.map(s => s.J));
    YC.plot($('#bTraj'), [
      { x: ord.map(s => s.end_date), y: ord.map(s => s.crit), name: '99% critical value', mode: 'lines', line: { color: color.amber, width: 1.3, dash: 'dot' }, hovertemplate: 'crit %{y:.1f}<extra></extra>' },
      { x: shown.map(s => s.end_date), y: shown.map(s => s.J), name: 'J', mode: 'markers', marker: { size: shown.map((_, k) => (k === step ? 11 : 6)), color: shown.map(s => (s.reject ? color.red : color.accent)), line: { width: 1, color: '#fff' } }, hovertemplate: 'J %{y:.1f}<extra></extra>' },
    ], YC.layout({ showlegend: true, margin: { l: 38, r: 8, t: 22, b: 26 }, xaxis: { type: 'date', range: [xs[0], xs[xs.length - 1]] }, yaxis: { range: [ymin, ymax], title: { text: 'J', font: { size: 10.5 } } } }));
    $('#bStepLbl').textContent = `${step + 1}/${all.length}`;
    $('#bExplain').innerHTML = explain(seg, step);
  }

  function setSeg(i, scroll) {
    sel = i; step = 0; $('#bSeg').value = i;
    const sl = $('#bStep'); sl.max = segs[i].steps.length - 1; sl.value = step;
    if (playing) togglePlay();
    fig10(); table3(); if (YC.$('#bTimeline').data) timeline();
    if (scroll) $('#fig10').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  function togglePlay() {
    if (playing) { clearInterval(playing); playing = null; $('#bPlay').textContent = '▶'; return; }
    if (step >= segs[sel].steps.length - 1) step = -1;
    $('#bPlay').textContent = '❚❚';
    const n = segs[sel].steps.length, ms = n > 40 ? 60 : 500;
    playing = setInterval(() => { if (step >= n - 1) { togglePlay(); return; } step++; $('#bStep').value = step; fig10(); }, ms);
  }

  // ---------- 1970–2009 results ----------
  function timeline() {
    const from = '1970-01-01', to = '2009-12-31';
    const i1 = YC.idxForMonth(tr, '2009-12');
    const tracesY = [3, 120].map(m => ({ x: tr.dates.slice(0, i1 + 1), y: YC.col(tr, m).slice(0, i1 + 1), name: YC.matLabel(m), mode: 'lines', line: { width: 1.2, color: YC.matColorFor(tr.maturities, m) }, hovertemplate: `${YC.matLabel(m)} %{y:.2f}%<extra></extra>` }));
    const ends = [...segs.map(s => ({ a: s.start, b: s.break })), { a: segs[segs.length - 1].break, b: JKV.spec.sample[1] }];
    YC.plot($('#bTimeline'), tracesY, YC.layout({
      showlegend: true, legend: { orientation: 'h', x: 0, y: -0.1, yanchor: 'top' }, hovermode: 'x unified', margin: { l: 38, r: 8, t: 40, b: 46 }, xaxis: { type: 'date', range: [from, to] }, yaxis: { ticksuffix: '%' },
      shapes: [
        ...ends.map((s, i) => ({ type: 'rect', xref: 'x', yref: 'paper', x0: s.a, x1: s.b, y0: 0, y1: 1, layer: 'below', line: { width: i === sel ? 1.2 : 0, color: color.accent },
          fillcolor: i === sel ? 'rgba(15,118,110,0.14)' : (i % 2 ? 'rgba(100,107,117,0.06)' : 'rgba(0,0,0,0)') })),
        ...segs.map(s => YC.vline(s.break, color.red, 1.2)),
      ],
      annotations: segs.map((s, k) => ({ x: s.break, yref: 'paper', y: 1.01, yanchor: 'bottom', showarrow: false, text: `${s.break.slice(2, 4)}'${s.break.slice(5, 7)}`, font: { size: 9.5, color: color.red, family: 'JetBrains Mono' }, yshift: k % 2 ? 12 : 0 })),
    }));
    YC.onClick($('#bTimeline'), (e) => { const d = String(e.points[0].x).slice(0, 10); const k = segs.findIndex(s => d >= s.start && d < s.break); if (k >= 0) setSeg(k, true); });
  }

  function table3() {
    $('#tab3').innerHTML = '<thead><tr><th>#</th><th>Segment</th><th class="num">Months</th><th class="num">Break p</th><th>How found</th><th>Nearest event (±12m)</th></tr></thead><tbody>' +
      segs.map(s => {
        const ev = nearestEvent(s.break);
        const how = s.retreated ? 'retreat (min. window rejected)' : (s.steps.length <= 3 ? 'rejected soon after min. window' : `extended ${s.steps.length} steps`);
        return `<tr data-i="${s.i}" class="${s.i === sel ? 'sel' : ''}"><td>${s.i + 1}</td><td>${YC.fmtDate(s.start)} → ${YC.fmtDate(s.break)}</td><td class="num">${s.months}</td><td class="num">${s.p.toFixed(4)}</td><td>${how}</td><td>${ev ? `${ev.t} (${YC.fmtDate(ev.d)})` : '<span class="muted">—</span>'}</td></tr>`;
      }).join('') + `<tr><td>${segs.length + 1}</td><td>${YC.fmtDate(segs[segs.length - 1].break)} → ${YC.fmtDate(JKV.spec.sample[1])}</td><td class="num">${YC.monthsBetween(segs[segs.length - 1].break, JKV.spec.sample[1])}</td><td class="num">—</td><td class="muted">sample ends (too short to test)</td><td></td></tr></tbody>`;
  }

  function longText() {
    const lens = segs.map(s => s.months).sort((a, b) => a - b), med = lens[Math.floor(lens.length / 2)];
    const longest = segs.reduce((a, b) => (b.months > a.months ? b : a));
    const matched = segs.filter(s => nearestEvent(s.break)).length;
    const early = segs.filter(s => s.break < '1980-01').length, retr = segs.filter(s => s.retreated).length;
    $('#bLongText').innerHTML = `The scan finds <b>${segs.length} breaks</b> in 40 years; the median segment lasts ${med} months. ${early} of the breaks fall before 1980, in the oil-shock and high-inflation decade, ${retr} of them through the retreat rule — loadings were changing faster than a five-year window could absorb. ` +
      `The longest stable segment, ${YC.fmtDate(longest.start)} – ${YC.fmtDate(longest.break)} (${longest.months} months), spans the Volcker disinflation: rates were volatile, but the way maturities co-moved was not detectably changing. ` +
      `${matched} of ${segs.length} breaks lie within a year of an event in the list; the others have no obvious single trigger, which is typical of gradual shifts.`;
  }

  // ---------- 2006–2026 by number of factors ----------
  function fig12() {
    const ranks = ['3', '4', '5'], a = PAR.spec.period_start, b = PAR.spec.period_end;
    const traces = ranks.map(r => ({
      x: PAR.ranks[r].breaks.map(x => x.date), y: PAR.ranks[r].breaks.map(() => `R = ${r}`), mode: 'markers+text', marker: { symbol: 'line-ns-open', size: 18, color: color.red, line: { width: 3, color: color.red } },
      text: PAR.ranks[r].breaks.map(x => YC.fmtDate(x.date)), textposition: 'top center', cliponaxis: false, textfont: { size: 10.5, color: color.red }, hovertemplate: 'break %{x|%b %Y}<extra></extra>',
    }));
    YC.plot($('#bRank'), traces, YC.layout({
      margin: { l: 46, r: 12, t: 22, b: 26 }, xaxis: { type: 'date', range: [a, b] }, yaxis: { type: 'category', categoryarray: ['R = 5', 'R = 4', 'R = 3'], categoryorder: 'array', showgrid: false },
      shapes: ranks.map(r => ({ type: 'line', xref: 'x', yref: 'y', x0: a, x1: b, y0: `R = ${r}`, y1: `R = ${r}`, line: { color: '#cfcbc1', width: 6 }, layer: 'below' })),
      annotations: [{ x: '2016-06-30', y: 'R = 5', text: 'no break', showarrow: false, yshift: 12, font: { size: 10.5, color: color.green } }],
    }));
    const brks = PAR.ranks[rankSel].breaks.map(x => x.date);
    const bd = brks[0], nx = brks[1] || b;
    const ia = YC.idxForMonth(tr, a.slice(0, 7)), ib = YC.idxForMonth(tr, bd.slice(0, 7)) - 1, ic = YC.idxForMonth(tr, nx.slice(0, 7)) - (brks[1] ? 1 : 0);
    const before = E.pca(YC.core(tr, ia, ib).Y, 3).loadings, after = E.pca(YC.core(tr, ib + 1, ic).Y, 3).loadings;
    for (let k = 0; k < 3; k++) { let d = 0; after.forEach((r, i) => { d += r[k] * before[i][k]; }); if (d < 0) after.forEach(r => { r[k] = -r[k]; }); }
    const mats = tr.core.map(i => tr.maturities[i]), x = mats.map(m => m / 12);
    const t = [];
    for (let k = 0; k < 3; k++) {
      t.push({ x, y: before.map(r => r[k]), mode: 'lines', line: { color: color.factor[k], width: 1.3, dash: 'dash' }, hovertemplate: `${YC.factorName[k]} before %{y:.3f}<extra></extra>` });
      t.push({ x, y: after.map(r => r[k]), mode: 'lines+markers', marker: { size: 4 }, line: { color: color.factor[k], width: 2 }, hovertemplate: `${YC.factorName[k]} after %{y:.3f}<extra></extra>` });
    }
    YC.plot($('#bBA'), t, YC.layout({ margin: { l: 36, r: 8, t: 10, b: 26 }, xaxis: { type: 'log', ...YC.matTicks(mats) }, yaxis: { zeroline: true } }));
    const ang = E.principalAnglesDeg(before, after)[2];
    $('#bRankCap').innerHTML = `<b>Figure 12.</b> (a) Break dates for each number of factors R; more factors absorb more of the variation, so fewer breaks are found. (b) R = ${rankSel}: loadings estimated on ${YC.fmtDate(a)} – ${YC.fmtDate(tr.dates[ib])} (dashed) and ${YC.fmtDate(tr.dates[ib + 1])} – ${YC.fmtDate(tr.dates[ic])} (solid), on this note's Treasury core maturities; colours as in Figure 3. Largest principal angle between the two: ${ang.toFixed(0)}°.`;
  }

  YC.sections.push(() => {
    $('#bSeg').innerHTML = segs.map(s => `<option value="${s.i}">${s.i + 1}: ${YC.fmtDate(s.start)} → ${YC.fmtDate(s.break)}${s.retreated ? ' (retreat)' : ''}</option>`).join('');
    $('#bSeg').addEventListener('change', (e) => setSeg(+e.target.value));
    $('#bStep').addEventListener('input', (e) => { step = +e.target.value; fig10(); });
    $('#bPlay').addEventListener('click', togglePlay);
    $('#tab3').addEventListener('click', (e) => { const r = e.target.closest('tr[data-i]'); if (r) setSeg(+r.dataset.i, true); });
    YC.seg($('#bRankSel'), rankSel, (v) => { rankSel = v; fig12(); });
    $('#bSeg').value = sel; $('#bStep').max = segs[sel].steps.length - 1;
    table3(); longText();
    YC.lazy($('#fig10'), fig10);
    YC.lazy($('#fig11'), timeline);
    YC.lazy($('#fig12'), fig12);
  });
})();
