// Passability check: plays ONLY by following the in-game gold guidance.
// node tools/guided-bot.mjs [runs] [core] [mode] [heat] [endlessUntil]
import * as G from '../src/game.js';
import { K, P } from '../src/hex.js';
const S = G.S, N = +process.argv[2] || 60, CORE = process.argv[3] || 'spark', MODE = process.argv[4] || 'run', HEAT = +process.argv[5] || 0, UNTIL = +process.argv[6] || 9;
const res = []; let dazes = 0, sectors = 0, deaths = {}, stuck = [];
for (let g = 0; g < N; g++) {
  S.meta = G.defMeta(); S.meta.core = CORE; S.meta.heat = 5; S.meta.heatSel = HEAT; G.startRun(MODE);
  let n = 0, prev = null;
  while (S.run && n < 6000) {
    n++;
    const r = S.run;
    if (r.phase === 'won') { if (UNTIL > 9 && MODE === 'run') { G.continueEndless(); continue; } break; }
    if (r.phase === 'pick') { if (r.sector >= UNTIL) { r.phase = 'won'; break; } const c = r.choices; G.chooseMod(r.hp < r.maxHp - 1 && Math.random() < 0.5 ? 'repair' : c[Math.floor(Math.random() * c.length)]); prev = null; continue; }
    if (r.phase !== 'play') break;
    const sg = G.suggest(prev); prev = sg && sg.loop ? { ...sg, path: sg.path.slice(1) } : null;
    let mv;
    if (sg) { const [q, rr] = P(sg.path[0]); mv = G.moves().find((m) => m.q === q && m.r === rr && !m.dash); }
    if (!mv) { const th = G.threatMap(); mv = G.moves().find((m) => !th.has(K(m.q, m.r)) && !m.dash && !m.strike) || { q: r.player[0], r: r.player[1] }; }
    G.doMove(mv);
    for (const e of G.takeEvents()) { if (e.t === 'daze') dazes++; if (e.t === 'clear' || e.t === 'won') sectors++; if (e.t === 'hurt') deaths[e.type] = (deaths[e.type] || 0) + 1; }
  }
  const r = S.run;
  if (r.phase === 'play' && stuck.length < 4) stuck.push(`s${r.sector} ${r.enemies.map((e) => e.type + '@' + e.q + ',' + e.r).join(' ')} p=${r.player} tail=${r.tail.length}`);
  res.push([r.sector, r.phase]);
}
const h = {}; for (const [s, p] of res) { const k = s + p[0]; h[k] = (h[k] || 0) + 1; }
const wins = res.filter(([s, p]) => p === 'won').length;
console.log(`core=${CORE} mode=${MODE} heat=${HEAT} until=${UNTIL}: WON ${wins}/${N}  end=${JSON.stringify(h)}  dazes/sector=${(dazes / Math.max(1, sectors)).toFixed(2)}  hits-by=${JSON.stringify(deaths)}`);
for (const s of stuck) console.log('  stuck', s);
