// Headless browser smoke + soak: loads dist/index.html in Chrome, autoplays a session at
// high speed, captures console errors, screenshots, and heap/geometry counts over time.
//   node test/smoke.mjs [--speed 6] [--seconds 140] [--shots dir] [--manual]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const speed = Number(opt('--speed', 6));
const seconds = Number(opt('--seconds', 140));
const shots = opt('--shots', null);
const manual = args.includes('--manual');
const seed = Number(opt('--seed', 42));
const root = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(root, '../dist/index.html');
const url = `file://${file}?seed=${seed}${manual ? '' : `&autoplay=1&speed=${speed}`}`;

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1440,900', '--autoplay-policy=no-user-gesture-required'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: 'load' });
await new Promise((r) => setTimeout(r, 1500));
if (shots) mkdirSync(shots, { recursive: true });
const shot = async (name) => { if (shots) await page.screenshot({ path: path.join(shots, `${name}.png`) }); };
await shot('00-start');
if (manual) { await page.click('#go'); await new Promise((r) => setTimeout(r, 1500)); }

const samples = [];
const t0 = Date.now();
let i = 0;
while ((Date.now() - t0) / 1000 < seconds) {
  await new Promise((r) => setTimeout(r, 5000));
  const s = await page.evaluate(() => {
    const { game, renderer } = window.__tf;
    const info = renderer.info;
    const m = 510 + Math.floor(game.sim.t);
    return {
      pit: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`, px: game.sim.lastPx, over: game.over,
      pos: game.pos, eq: Math.round(game.equity()), trades: game.trades, heat: +game.heat.toFixed(2), deals: game.deals.length,
      heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
      geo: info.memory.geometries, tex: info.memory.textures, calls: info.render.calls,
    };
  });
  samples.push(s);
  console.log(JSON.stringify(s));
  if (i % 4 === 0) await shot(`${String(++i).padStart(2, '0')}-${s.pit.replace(':', '')}`); else i++;
  if (s.over) break;
}
await new Promise((r) => setTimeout(r, 3500));
await shot('99-end');
console.log('errors:', errors.length ? errors.slice(0, 20) : 'none');
await browser.close();
process.exit(errors.some((e) => e.includes('pageerror') || e.startsWith('[error]')) ? 1 : 0);
