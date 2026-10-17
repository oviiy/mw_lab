// Headless visual check (add --hideui for a clean frame, --q=high for bloom/grade/shadows). node tools/shot.mjs <locId> <out.png> [--q=low|medium|high] [--atmos=dusk] [--weather=rain] [--lm=landmark] [--cut=cutawayId] [--w=1280 --h=800]
import { chromium } from 'playwright-core';
import { resolve } from 'node:path';
const [loc = 'winterfell', out = 'shot.png'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flag = (n, d) => { const a = process.argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=')[1] : d; };
const port = flag('port', 5173), w = +flag('w', 1280), h = +flag('h', 800);
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const page = await browser.newPage({ viewport: { width: w, height: h } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(m.type() + ': ' + m.text()); });
await page.goto(`http://localhost:${port}/?loc=${loc}&q=${flag('q', 'low')}&lang=${flag('lang', 'en')}&shot=1`);
await page.waitForFunction(() => window.__ATLAS && window.__ATLAS.ready && window.__ATLAS.host && window.__ATLAS.host.landmarks && window.__ATLAS.host.landmarks.size, null, { timeout: 300000 });
await page.evaluate(async ([atmos, weather, lm, cut, instant]) => {
  const H = __ATLAS.host;
  if (atmos) H.atmos.set(atmos, { instant: true });
  if (weather) H.setWeather(weather, true);
  if (cut) { await H.enterCutaway(cut); H.atmos.set('interior', { instant: true }); }
  else if (lm) await H.focusLandmark(lm, { dur: 0.01 });
}, [flag('atmos'), flag('weather'), flag('lm'), flag('cut')]);
if (process.argv.includes('--hideui')) await page.evaluate(() => { for (const q of ['.scene-ui', '.topbar', '#pins']) document.querySelector(q)?.setAttribute('style', 'display:none'); });
await page.waitForTimeout(+flag('wait', 2500));
await page.screenshot({ path: resolve(out), timeout: 300000 });
console.log(errors.length ? errors.slice(0, 12).join('\n') : 'no console errors', '->', out);
await browser.close();
