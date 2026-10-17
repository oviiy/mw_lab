// Full-app screenshot. node tools/appshot.mjs out.png [--port=5280] [--hash=#/m/winterfell] [--js="..."] [--wait=3000] [--w=1280 --h=800] [--lang=zh] [--mobile]
import { chromium } from 'playwright-core';
import { resolve } from 'node:path';
const out = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'app.png';
const f = (n, d) => { const a = process.argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : d; };
const mobile = process.argv.includes('--mobile');
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: +f('w', mobile ? 390 : 1280), height: +f('h', mobile ? 844 : 800) }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto(`http://localhost:${f('port', 5280)}/${f('q', '')}`.replace(/\/$/, '/') + (f('q') ? '' : `?lang=${f('lang', 'en')}`) + f('hash', ''));
await p.waitForFunction(() => window.__ATLAS && window.__ATLAS.ready, null, { timeout: 120000 });
for (const js of process.argv.filter((a) => a.startsWith('--js=')).map((a) => a.slice(5))) { await p.evaluate(`(async()=>{${js}})()`); await p.waitForTimeout(+f('step', 1500)); }
await p.waitForTimeout(+f('wait', 2500));
await p.evaluate(() => { const a = __ATLAS.app; if (a.mode === 'map') { a.map.stop(); a.map.render(); } });
await p.screenshot({ path: resolve(out), timeout: 120000 }); console.log(errs.length ? errs.slice(0, 10).join('\n') : 'no errors', '->', out); await b.close();
