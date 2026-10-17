// End-to-end smoke test over the built site (npm run build first; serve dist/ on --port).
//   node tools/e2e.mjs [--port=5290] [--lang=en|zh] [--only=id1,id2] [--shots=dir]
// For every location: deep-link in, assert the scene mounts, landmarks exist, no page/console errors, tour runs, a landmark opens a source panel.
import { chromium } from 'playwright-core';
import { LOCATIONS } from '../src/data/locations.js';
import { mkdirSync } from 'node:fs';
const f = (n, d) => { const a = process.argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : d; };
const port = f('port', 5290), lang = f('lang', 'en'), only = f('only', '') ? f('only').split(',') : null, shots = f('shots', '');
if (shots) mkdirSync(shots, { recursive: true });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const results = [];
for (const l of LOCATIONS.filter((x) => !only || only.includes(x.id))) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = []; const t0 = Date.now();
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/Failed to load resource|GPU stall/.test(t)) errs.push('console: ' + t.slice(0, 200)); });
  let info = {};
  try {
    await p.goto(`http://localhost:${port}/?loc=${l.id}&lang=${lang}`);
    await p.waitForFunction(() => window.__ATLAS?.ready && window.__ATLAS.host?.landmarks?.size, null, { timeout: 150000 });
    info = await p.evaluate(async () => {
      const H = __ATLAS.host, U = __ATLAS.sceneUI, ids = [...H.landmarks.keys()];
      const pins = document.querySelectorAll('.pin').length, rail = document.querySelectorAll('.rail-item').length;
      U.select(ids[0]); const panel = !!document.querySelector('.detail .src-block dd');
      const names = ids.every((id) => (H.content.landmarks[id].name.en && H.content.landmarks[id].name.zh));
      H.startTour(H.content.tour.length ? H.content.tour : ids); await new Promise((r) => setTimeout(r, 400)); const tourBar = !document.querySelector('.tour-bar').classList.contains('hidden'); H.stopTour();
      for (const a of ['dawn', 'dusk', 'night', 'day']) U.setAtmos(a); for (const w of ['snow', 'rain', 'fog', 'clear']) U.setWeather(w);
      let cut = null; if (H.cutaways.length) { await U.enterCutaway(H.cutaways[0].id); cut = !!H.cutaway; await U.exitCutaway(); }
      return { n: ids.length, pins, rail, panel, names, tourBar, cut, tris: H.renderer.info.render.triangles, calls: H.renderer.info.render.calls };
    });
    if (shots) { await p.waitForTimeout(1500); await p.screenshot({ path: `${shots}/${l.id}.png`, timeout: 120000 }); }
  } catch (e) { errs.push('exception: ' + e.message.slice(0, 160)); }
  const ok = !errs.length && info.n >= 5 && info.pins === info.n && info.panel && info.names && info.tourBar && info.cut !== false;
  results.push({ id: l.id, ok, ms: Date.now() - t0, ...info, errs });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${l.id.padEnd(16)} ${String(Date.now() - t0).padStart(6)}ms landmarks=${info.n} cut=${info.cut} tris=${info.tris} calls=${info.calls}${errs.length ? '\n      ' + errs.slice(0, 3).join('\n      ') : ''}`);
  await p.close();
}
await b.close();
const bad = results.filter((r) => !r.ok); console.log(`\n${results.length - bad.length}/${results.length} passed`); process.exit(bad.length ? 1 : 0);
