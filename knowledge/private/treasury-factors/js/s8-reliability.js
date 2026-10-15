/* §8 Reliability: size/power (Tables 7–8), bootstrap versions (Table 9), planted break (Fig 15, Table 10), scan bandwidth (Table 11). */
(function () {
  const { $, D, color } = YC;
  const R = D.results;
  const sp = R.sim_size_power;
  const get = (dgp, N, T) => sp.find(r => r.dgp === dgp && r.N === N && r.T === T)?.rej05;

  function sizeTable() {
    const Ns = [8, 11, 15, 17, 20], Ts = [60, 100, 200, 480];
    const cls = (v) => (v == null ? '' : v > 6.5 ? 'rej' : v < 4 ? 'acc' : 'mid');
    let h = `<thead><tr><th>design</th><th>T</th>${Ns.map(n => `<th class="c">N = ${n}</th>`).join('')}</tr></thead><tbody>`;
    for (const g of ['1', '2', '3']) for (const T of Ts) {
      if (Ns.every(n => get(g, n, T) == null)) continue;
      h += `<tr class="${T === 60 ? 'grp' : ''}"><td>${T === 60 ? `DGP ${g}${g === '1' ? ' (i.i.d.)' : g === '3' ? ' (cross-corr.)' : ''}` : ''}</td><td>${T}</td>` +
        Ns.map(n => { const v = get(g, n, T); return `<td class="c ${cls(v)}">${v == null ? '' : v.toFixed(1)}</td>`; }).join('') + '</tr>';
    }
    $('#tab7').innerHTML = h + '</tbody>';
  }

  function powerTable() {
    const cols = [[8, 200], [8, 540], [11, 200], [17, 200], [17, 480], [20, 200]];
    const cls = (v) => (v == null ? '' : v >= 80 ? 'acc' : v >= 50 ? 'mid' : 'rej');
    const dgps = [...new Set(sp.filter(r => /b/.test(r.dgp)).map(r => r.dgp))].sort();
    $('#tab8').innerHTML = `<thead><tr><th>design</th>${cols.map(([n, t]) => `<th class="c">N ${n}<br>T ${t}</th>`).join('')}</tr></thead><tbody>` +
      dgps.map(g => `<tr><td>${g}${g === '6b1' ? ' (slow drift)' : ''}</td>${cols.map(([n, t]) => { const v = get(g, n, t); return `<td class="c ${cls(v)}">${v == null ? '' : v.toFixed(0)}</td>`; }).join('')}</tr>`).join('') + '</tbody>';
  }

  function bootTable() {
    const bv = R.bootstrap_versions, cells = [['1', 'size, i.i.d.'], ['3', 'size, cross-correlated'], ['4b1', 'power, break'], ['6b1', 'power, slow drift']];
    const v = (g, n, t, c) => bv.find(r => r.dgp === g && r.N === n && r.T === t && r.config === c)?.rej05;
    const cls = (size, x) => (size ? (x > 6.5 ? 'rej' : 'acc') : (x >= 80 ? 'acc' : x >= 50 ? 'mid' : 'rej'));
    $('#tab9').innerHTML = '<thead><tr><th>design</th><th class="c">N 17, T 480<br>printed</th><th class="c">N 17, T 480<br>code (diagonal)</th><th class="c">N 8, T 540<br>printed</th><th class="c">N 8, T 540<br>code (diagonal)</th></tr></thead><tbody>' +
      cells.map(([g, lab]) => { const size = g === '1' || g === '3';
        return `<tr><td>${g} · ${lab}</td>${[[17, 480], [8, 540]].map(([n, t]) => ['paper_cov', 'diag_restd'].map(c => { const x = v(g, n, t, c); return `<td class="c ${cls(size, x)}">${x.toFixed(1)}</td>`; }).join('')).join('')}</tr>`; }).join('') +
      '</tbody>';
  }

  const rng = (a, b) => { const x = Math.round(Math.min(a, b) * 100), y = Math.round(Math.max(a, b) * 100); return x === y ? `${x}%` : `${x}–${y}%`; };
  const P = (rule, setup, d) => R.planted.find(r => r.rule === rule && r.setup === setup && r.d === d) || {};
  function planted() {
    const groups = [['Svensson (week 7)', 'Silverman'], ['PCA (week 6)', 'wk6 PCA (Silverman)']];
    const metrics = [
      ['false alarm<br>no break, d = 3', (g) => P(g, 'null3', 3).scan_any_break],
      ['false alarm<br>no break (4 factors), d = 4', (g) => P(g, 'null4', 4).scan_any_break],
      ['planted break found<br>within 3 years, d = 3', (g) => P(g, 'break', 3).found_within_36m],
      ['d = 4 rejects<br>planted break', (g) => P(g, 'break', 4).scan_any_break],
      ['d = 4 rejects<br>same noise both halves', (g) => P(g, 'break_same4', 4).scan_any_break],
    ];
    YC.plot($('#sPlanted'), groups.map(([lab, g], i) => ({
      type: 'bar', name: lab, x: metrics.map(m => m[0]), y: metrics.map(m => m[1](g) * 100), marker: { color: i ? '#c9c4b8' : color.accent },
      text: metrics.map(m => `${Math.round(m[1](g) * 100)}%`), textposition: 'outside', cliponaxis: false, textfont: { size: 10 }, hovertemplate: `${lab}: %{y:.0f}%<extra></extra>`,
    })), YC.layout({ showlegend: true, barmode: 'group', margin: { l: 38, r: 8, t: 26, b: 52 }, yaxis: { ticksuffix: '%', range: [0, 112] }, xaxis: { tickfont: { size: 10 } } }));
    const s = 'Silverman', b3 = P(s, 'break', 3), b4 = P(s, 'break', 4), s4 = P(s, 'break_same4', 4);
    $('#sPlantedCap').innerHTML = `<b>Figure 15.</b> Planted-break simulations, 100 replications (50 for the week-6 same-noise setup). With no break, false alarms at the true rank are ${rng(P(s, 'null3', 3).scan_any_break, P(s, 'null4', 4).scan_any_break)}. ` +
      `At d = 4 the scan "finds" the planted break in ${Math.round(b4.scan_any_break * 100)}% of runs but only ${Math.round(s4.scan_any_break * 100)}% when both halves have the same noise: it reacts to the change in noise variance.`;
    const rows = [];
    for (const [lab, g] of groups) for (const [setup, d, name] of [['null3', 3, 'no break, 3 factors'], ['null4', 4, 'no break, 4 factors'], ['break', 3, 'break'], ['break', 4, 'break'], ['break_same4', 3, 'break, same noise'], ['break_same4', 4, 'break, same noise']]) {
      const r = P(g, setup, d); if (r.reps == null) continue;
      const pc = (v) => (v == null ? '—' : `${Math.round(v * 100)}%`);
      rows.push(`<tr class="${setup === 'null3' ? 'grp' : ''}"><td>${setup === 'null3' ? lab : ''}</td><td>${name}</td><td class="num">${d}</td><td class="num">${r.reps}</td><td class="num">${pc(r.scan_any_break)}</td><td class="num">${pc(r.full_sample_rejects)}</td><td class="num">${pc(r.found_within_36m)}</td><td class="num">${r.median_lag_all == null ? '—' : r.median_lag_all}</td></tr>`);
    }
    $('#tab10').innerHTML = '<thead><tr><th>Fake data</th><th>Setup</th><th class="num">d</th><th class="num">runs</th><th class="num">scan finds a break</th><th class="num">full test rejects</th><th class="num">found ≤ 3 years</th><th class="num">median delay (m)</th></tr></thead><tbody>' + rows.join('') + '</tbody>';
    const p3 = P('wk6 PCA (Silverman)', 'break', 3);
    $('#sText').innerHTML = `The scan detects the planted change in every run, but late: within three years in ${Math.round(b3.found_within_36m * 100)}% of Svensson runs (${Math.round(p3.found_within_36m * 100)}% with PCA loadings), with a median delay of ${b3.median_lag_all} months (${p3.median_lag_all} with PCA). ` +
      `With no break the scan alarms ${rng(P(s, 'null3', 3).scan_any_break, P(s, 'null4', 4).scan_any_break)} of the time at the true rank, against ${rng(P(s, 'null3', 3).full_sample_rejects, P(s, 'null4', 4).full_sample_rejects)} for one full-sample test — too rare to explain alone why the JKV scan rejects while the full test does not. ` +
      'Repeating the check under 0.5× and 1.5× Silverman (199-draw screens) gives similar rates, so no bandwidth rule does clearly better and Silverman is kept.';
  }

  function auditTable() {
    $('#tab11').innerHTML = '<thead><tr><th>Panel</th><th>window length (months)</th><th class="num">tests</th><th class="num">min T·h</th><th class="num">mean T·h</th><th class="num">max T·h</th></tr></thead><tbody>' +
      R.bw_audit.map((r, i) => `<tr class="${i && r.data !== R.bw_audit[i - 1].data ? 'grp' : ''}"><td>${i === 0 || r.data !== R.bw_audit[i - 1].data ? (r.data === 'jkv' ? 'JKV' : 'Treasury') : ''}</td><td>${r.length.replace('(', '').replace(']', '').replace(', ', '–')}</td><td class="num">${r.count.toLocaleString()}</td><td class="num">${r.min.toFixed(1)}</td><td class="num">${r.mean.toFixed(1)}</td><td class="num">${r.max.toFixed(1)}</td></tr>`).join('') + '</tbody>';
  }

  YC.sections.push(() => {
    sizeTable(); powerTable(); bootTable(); auditTable();
    YC.lazy($('#fig15'), planted);
  });
})();
