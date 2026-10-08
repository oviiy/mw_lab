/* Shared state, palette, plotting defaults, lazy rendering, and the bootstrap worker. */
(function () {
  const D = window.YC_DATA;
  const E = window.YCEngine;
  const YC = (window.YC = { D, E, sections: [] });

  // ---------- palette (light, print-like) ----------
  YC.color = {
    ink: '#1d2126', muted: '#646b75', faint: '#9aa0a8', grid: '#ece9e2', axis: '#b9b4a8',
    accent: '#0f766e', amber: '#b45309', red: '#b91c1c', green: '#15803d', bill: '#c2410c',
    factor: ['#0f766e', '#b45309', '#a21caf', '#4338ca', '#0369a1'],
    recession: 'rgba(100,107,117,0.09)',
  };
  YC.factorName = ['Level', 'Slope', 'Curvature', 'Factor 4', 'Factor 5'];
  YC.matColor = (t) => {
    const stops = [[194, 65, 12], [180, 83, 9], [21, 128, 61], [15, 118, 110], [3, 105, 161], [67, 56, 202]];
    const x = Math.max(0, Math.min(1, t)) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
    return `rgb(${stops[i].map((v, k) => Math.round(v + f * (stops[i + 1][k] - v))).join(',')})`;
  };
  YC.matColorFor = (mats, m) => YC.matColor((Math.log(m) - Math.log(mats[0])) / (Math.log(mats[mats.length - 1]) - Math.log(mats[0])));

  // ---------- context ----------
  YC.recessions = [
    ['1969-12', '1970-11'], ['1973-11', '1975-03'], ['1980-01', '1980-07'], ['1981-07', '1982-11'],
    ['1990-07', '1991-03'], ['2001-03', '2001-11'], ['2007-12', '2009-06'], ['2020-02', '2020-04'],
  ];
  YC.events = [
    { d: '1973-10', t: 'Oil embargo', long: 'OPEC oil embargo; inflation moves to double digits.' },
    { d: '1979-10', t: 'Volcker shock', long: 'The Fed switches to targeting reserves; short rates become extremely volatile.' },
    { d: '1981-09', t: 'Rate peak', long: 'Bill yields above 15%; the curve is deeply inverted.' },
    { d: '1987-10', t: 'Black Monday', long: 'Equity crash and flight to quality.' },
    { d: '1994-02', t: 'Bond sell-off', long: 'Surprise tightening; long yields rise sharply.' },
    { d: '1998-09', t: 'LTCM', long: 'Russian default and LTCM unwind; liquidity premia spike.' },
    { d: '2001-01', t: 'Easing cycle', long: 'The Fed cuts from 6.5% toward 1%; the curve steepens.' },
    { d: '2008-09', t: 'Lehman', long: 'Global financial crisis; bill yields go to zero.' },
    { d: '2008-12', t: 'Zero bound', long: 'Policy rate at 0–0.25%; the short end is pinned until late 2015.' },
    { d: '2013-05', t: 'Taper tantrum', long: 'QE taper signal; term premium jumps.' },
    { d: '2015-12', t: 'Liftoff', long: 'First hike since 2006; the short end moves again.' },
    { d: '2020-03', t: 'COVID', long: 'Emergency cuts to zero; QE restarts.' },
    { d: '2022-03', t: 'Hiking cycle', long: 'Fastest tightening since the 1980s; deep inversion.' },
    { d: '2024-09', t: 'First cut', long: 'Easing begins; the curve dis-inverts.' },
  ];

  // ---------- data helpers ----------
  YC.dataset = (id) => D.datasets.find(d => d.id === id);
  YC.matLabel = (m) => (m < 12 ? `${m}M` : `${m / 12}Y`);
  YC.month = (iso) => iso.slice(0, 7);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  YC.fmtDate = (iso) => `${MON[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
  YC.monthsBetween = (a, b) => (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7));
  YC.idxForMonth = (ds, ym) => { let best = 0; for (let i = 0; i < ds.dates.length; i++) if (ds.dates[i].slice(0, 7) <= ym) best = i; return best; };
  YC.core = (ds, from = 0, to = ds.dates.length - 1) => ({
    Y: ds.yields.slice(from, to + 1).map(r => ds.core.map(i => r[i])),
    mats: ds.core.map(i => ds.maturities[i]), dates: ds.dates.slice(from, to + 1),
  });
  YC.col = (ds, m) => { const i = ds.maturities.indexOf(m); return ds.yields.map(r => r[i]); };
  YC.matTicks = (mats) => {
    const nice = [1, 3, 6, 12, 24, 36, 60, 84, 120, 240, 360];
    const pick = mats.length > 9 ? mats.filter(m => nice.includes(m)) : mats;
    return { tickvals: pick.map(m => m / 12), ticktext: pick.map(YC.matLabel) };
  };

  // ---------- plotting ----------
  const axis = { gridcolor: YC.color.grid, zerolinecolor: '#d6d2c8', linecolor: YC.color.axis, tickcolor: YC.color.axis, ticks: 'outside', ticklen: 3, showline: true, mirror: false };
  YC.layout = (extra = {}) => {
    const base = {
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'Inter, system-ui, sans-serif', size: 11, color: YC.color.muted },
      margin: { l: 46, r: 12, t: 10, b: 32 },
      hoverlabel: { bgcolor: '#fff', bordercolor: '#cfcbc1', font: { family: 'JetBrains Mono, monospace', size: 11, color: YC.color.ink } },
      legend: { orientation: 'h', x: 0, y: 1.14, font: { size: 11 }, bgcolor: 'rgba(0,0,0,0)' },
      xaxis: { ...axis }, yaxis: { ...axis }, dragmode: false, showlegend: false,
    };
    const out = { ...base, ...extra };
    for (const k of Object.keys(extra)) if (/^[xy]axis\d*$/.test(k)) out[k] = { ...axis, ...extra[k] };
    return out;
  };
  YC.plot = (el, traces, layout) => Plotly.react(el, traces, layout, { displayModeBar: false, responsive: true });
  YC.recessionShapes = (from, to) => YC.recessions.filter(([a, b]) => b >= from.slice(0, 7) && a <= to.slice(0, 7)).map(([a, b]) => ({
    type: 'rect', xref: 'x', yref: 'paper', x0: `${a}-01`, x1: `${b}-28`, y0: 0, y1: 1, fillcolor: YC.color.recession, line: { width: 0 }, layer: 'below',
  }));
  YC.eventMarks = (from, to) => {
    const ev = YC.events.filter(e => e.d >= from.slice(0, 7) && e.d <= to.slice(0, 7));
    return {
      shapes: ev.map(e => ({ type: 'line', xref: 'x', yref: 'paper', x0: `${e.d}-15`, x1: `${e.d}-15`, y0: 0, y1: 1, line: { color: '#d6d2c8', width: 1, dash: 'dot' }, layer: 'below' })),
      annotations: ev.filter((e, i) => i === 0 || YC.monthsBetween(ev[i - 1].d, e.d) > 8).map(e => ({ x: `${e.d}-15`, y: 1, xref: 'x', yref: 'paper', text: e.t, showarrow: false, textangle: -90, xanchor: 'right', yanchor: 'top', font: { size: 9.5, color: YC.color.faint } })),
    };
  };
  YC.vline = (iso, color = YC.color.accent, width = 1.5) => ({ type: 'line', xref: 'x', yref: 'paper', x0: iso, x1: iso, y0: 0, y1: 1, line: { color, width } });

  // ---------- DOM ----------
  YC.$ = (s, r = document) => r.querySelector(s);
  YC.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  YC.debounce = (fn, ms = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  YC.seg = (root, value, onChange) => {
    const btns = YC.$$('button', root);
    const set = (v) => btns.forEach(b => b.classList.toggle('on', b.dataset.v === String(v)));
    set(value);
    btns.forEach(b => b.addEventListener('click', () => { set(b.dataset.v); onChange(b.dataset.v); }));
  };
  YC.fill = (key, text) => YC.$$(`[data-k="${key}"]`).forEach(el => { el.textContent = text; });
  YC.onClick = (el, fn) => { if (el.removeAllListeners) el.removeAllListeners('plotly_click'); el.on('plotly_click', fn); };

  /** Lazy rendering: run `init` the first time `el` approaches the viewport. */
  const pending = new Map();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const fn = pending.get(e.target);
      io.unobserve(e.target); pending.delete(e.target);
      if (fn) fn();
    }
  }, { rootMargin: '400px 0px' }) : null;
  YC.lazy = (el, init) => { if (!io) { init(); return; } pending.set(el, init); io.observe(el); };

  // ---------- bootstrap in a worker ----------
  YC.runBootstrap = (X, R, opts, onProgress) => new Promise((resolve, reject) => {
    let worker = null;
    try {
      const src = `const YCEngine=(${YCEngineFactory.toString()})();
        self.onmessage=(e)=>{const {X,R,opts}=e.data;try{
          const res=YCEngine.suWangBootstrap(X,R,{...opts,onProgress:(b,n)=>{if(b%Math.max(1,Math.floor(n/50))===0||b===n)self.postMessage({type:'progress',b,n});}});
          delete res.fit; self.postMessage({type:'done',res});}catch(err){self.postMessage({type:'error',message:String(err.message||err)});}};`;
      worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
    } catch (err) { worker = null; }
    if (!worker) {
      setTimeout(() => { try { const res = E.suWangBootstrap(X, R, { ...opts, onProgress }); delete res.fit; resolve(res); } catch (err) { reject(err); } }, 30);
      return;
    }
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'progress') onProgress && onProgress(m.b, m.n);
      else if (m.type === 'done') { resolve(m.res); worker.terminate(); }
      else { reject(new Error(m.message)); worker.terminate(); }
    };
    worker.onerror = (e) => { reject(new Error(e.message || 'worker failed')); worker.terminate(); };
    worker.postMessage({ X, R, opts });
  });
})();
