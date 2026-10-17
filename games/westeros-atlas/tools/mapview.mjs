// One-shot map screenshot for checking geography & place positions (no 3D scenes bundled).
//   node tools/mapview.mjs out.png [--region=north | --x=450 --y=300 --z=6] [--all] [--lang=zh] [--w=1400 --h=900] [--port=5290x]
//   --all   show every marker and label regardless of rank/declutter (to verify positions)
import { context } from 'esbuild';
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateAtlasIndex } from './gen.mjs';
const out = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'map.png';
const f = (n, d) => { const a = process.argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : d; };
const port = +f('port', 5290 + Math.floor(Math.random() * 600)), dir = resolve(`.mapview/${port}`);
mkdirSync(dir, { recursive: true });
await generateAtlasIndex();  // pick up the latest places/houses data
const reg = resolve(dir, 'scenes.js'); writeFileSync(reg, 'export const SCENES = {}; export const CONTENT = {};\n');
const plugin = { name: 'noscenes', setup(b) { b.onResolve({ filter: /generated\/scenes\.js$/ }, () => ({ path: reg })); } };
const dist = resolve(dir, 'dist'); mkdirSync(dist, { recursive: true }); cpSync('public', dist, { recursive: true }); mkdirSync(resolve(dist, 'assets'), { recursive: true }); cpSync('src/app.css', resolve(dist, 'assets/style.css'));
const ctx = await context({ entryPoints: { main: 'src/entry-app.js' }, bundle: true, format: 'esm', splitting: true, outdir: resolve(dist, 'assets'), target: ['es2022'], logLevel: 'error', plugins: [plugin] });
await ctx.rebuild(); await ctx.serve({ servedir: dist, port });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage({ viewport: { width: +f('w', 1400), height: +f('h', 900) } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errs.push(m.text()));
await p.goto(`http://localhost:${port}/?lang=${f('lang', 'en')}`);
await p.waitForFunction(() => window.__ATLAS?.ready, null, { timeout: 120000 });
await p.evaluate(([x, y, z, region, all]) => {
  const m = __ATLAS.app.map; if (all) m.debugAll = true;
  document.querySelector('.topbar')?.setAttribute('style', 'display:none'); document.querySelector('.map-ui')?.setAttribute('style', 'display:none');
  if (region) m.flyToRegion(region, { instant: true }); else if (z) m.flyTo(+x, +y, m.fit * +z, { instant: true });
  m.stop(); m.render();
}, [f('x'), f('y'), f('z'), f('region'), process.argv.includes('--all')]);
await p.screenshot({ path: resolve(out), timeout: 120000 });
console.log(errs.length ? errs.join('\n') : 'ok', '->', out);
await b.close(); await ctx.dispose(); process.exit(0);
