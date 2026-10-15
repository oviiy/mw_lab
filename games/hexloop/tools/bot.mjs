// Balance probe: "dance" bot — take any capture, otherwise circle the nearest enemy while avoiding red. node tools/bot.mjs [runs]
import * as G from '../src/game.js';
import { K, hd } from '../src/hex.js';
const S = G.S, N = +process.argv[2] || 100;
const res = [];
for (let g = 0; g < N; g++) {
  S.meta = G.defMeta(); G.startRun('run'); let n = 0;
  while (S.run && ['play', 'pick'].includes(S.run.phase) && n < 4000) {
    n++;
    if (S.run.phase === 'pick') { const c = S.run.choices; const pref = ['tail', 'chain', 'aegis', 'siphon', 'secondwind', 'overclock', 'thorns', 'strike'].find((x) => c.includes(x)); G.chooseMod(S.run.hp < S.run.maxHp - 1 ? 'repair' : pref || 'repair'); continue; }
    const r = S.run, th = G.threatMap(), ms = G.moves().filter((m) => !m.dash && !m.strike);
    const safe = ms.filter((m) => !th.has(K(m.q, m.r)));
    const live = ms.map((m) => [m, G.preview(m).victims.length]).filter((x) => x[1]).sort((a, b) => b[1] - a[1])[0];
    const targets = r.enemies.filter((e) => e.type !== 'lancer' || true).slice().sort((a, b) => hd(a.q, a.r, ...r.player) - hd(b.q, b.r, ...r.player));
    const t = targets[0];
    let pick = live && (!th.has(K(live[0].q, live[0].r)) || live[1] >= 1) ? live[0] : null;
    if (!pick && t) {
      const want = t.type === 'brute' ? 2 : 1;
      const cand = safe.filter((m) => !r.tail.includes(K(m.q, m.r)));
      const dist = hd(r.player[0], r.player[1], t.q, t.r);
      // circle consistently once in range, otherwise close in
      pick = dist <= want ? cand.find((m) => hd(m.q, m.r, t.q, t.r) === want) : cand.sort((a, b) => hd(a.q, a.r, t.q, t.r) - hd(b.q, b.r, t.q, t.r))[0];
      pick = pick || safe[Math.floor(Math.random() * safe.length)];
    }
    G.doMove(pick || ms[0] || { q: r.player[0], r: r.player[1] }); G.takeEvents();
  }
  res.push([S.run.sector, S.run.phase, S.run.turn, S.run.kills, S.run.score]);
}
const h = {}; for (const [s, p] of res) { const k = s + p[0]; h[k] = (h[k] || 0) + 1; }
console.log('end states (sector+d=dead/w=won/p=stalled):', JSON.stringify(h));
console.log('avg kills', (res.reduce((a, x) => a + x[3], 0) / N).toFixed(1), 'avg turns', (res.reduce((a, x) => a + x[2], 0) / N).toFixed(0), 'avg score', (res.reduce((a, x) => a + x[4], 0) / N).toFixed(0));
