// Dev harness: run seeded sessions headless and summarise the price path.
import { Sim } from '../src/market/sim.js';
import { PREV_SETTLE } from '../src/market/calibration.js';
const n = +(process.argv[2] || 10), verbose = process.argv.includes('-v');
const res = [];
const t0 = Date.now();
for (let s = 1; s <= n; s++) {
  const sim = new Sim(s);
  const marks = {};
  while (!sim.done) { sim.advance(1); const m = Math.round(sim.t); if ([0,30,60,120,150,180,240,270,300,330,370,405].includes(m)) marks[m] = sim.lastPx; }
  const ret = sim.lastPx / PREV_SETTLE - 1;
  res.push(ret);
  const pct = (p) => ((p / PREV_SETTLE - 1) * 100).toFixed(1).padStart(6);
  console.log(`seed ${String(s).padStart(3)} settle ${sim.lastPx.toFixed(2)} ${pct(sim.lastPx)}%  vol ${sim.volume}  panic ${sim.panic.toFixed(2)}  basis ${sim.basis.toFixed(1)} | ` + Object.entries(marks).map(([k,v]) => `${k}:${pct(v)}`).join(' '));
}
res.sort((a,b)=>a-b);
console.log(`min ${(res[0]*100).toFixed(1)} median ${(res[res.length>>1]*100).toFixed(1)} max ${(res[res.length-1]*100).toFixed(1)}  ${(Date.now()-t0)}ms`);
