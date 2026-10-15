// Headless visual check: node tools/shot.mjs <outDir> [phone|laptop]
// Loads dist/index.html in system Chrome (SwiftShader WebGL), runs scripted scenarios, saves PNGs and console errors.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const out = resolve(process.argv[2] || 'shots');
const device = process.argv[3] || 'laptop';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const vp = device === 'phone' ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1280, height: 800, deviceScaleFactor: 1 };
const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(pathToFileURL(resolve('dist/index.html')).href);
await page.waitForFunction(() => !!globalThis.__HEX);
const snap = async (name, js = null, sec = 1.2) => {
  if (js) await page.evaluate(js);
  await page.evaluate((s) => __HEX.tick(s), sec);
  await page.waitForTimeout(700); // let CSS transitions settle
  await page.evaluate(() => __HEX.tick(0.05));
  await page.screenshot({ path: `${out}/${device}-${name}.png` });
  console.log('saved', name);
};
const scenarios = (process.env.SCENES || 'title,lesson2,showcase,capture').split(',');
for (const s of scenarios) {
  if (s === 'title') await snap('title', null, 1.5);
  if (s === 'lesson2') await snap('lesson2', () => { const H = __HEX; H.startGame('tutorial'); H.G.nextTutorial(); H.enterLevel(H.G.takeEvents()); H.ui.hide(); });
  if (s === 'lesson2press') await snap('lesson2press', () => { const H = __HEX; for (const [q, r] of [[1, 0], [1, -1], [0, -1], [-1, 0]]) { H.G.doMove({ q, r }); H.G.takeEvents(); } H.board.setLevel(H.S.run, { intro: false }); H.view.pressed = '-1,1'; H.enterLevel([]); H.view.pressed = '-1,1'; });
  if (s === 'showcase') await snap('showcase', () => {
    const H = __HEX, G = H.G; H.S.meta.seen = ['drone', 'lancer', 'brute', 'eater', 'hive']; H.startGame('run');
    const r = H.S.run; Object.assign(r, { sector: 6, boss: true, walls: ['2,-3', '-3,1'], enemies: [], tail: ['0,2', '-1,2', '-1,1'], player: [0, 1], pickups: { '3,0': 'shard', '-2,-1': 'heart' }, spawns: [{ q: -3, r: 3, ty: 'drone', at: 99 }] });
    G.setRun(r); G.addEnemy('drone', 1, 1); const l = G.addEnemy('lancer', 3, -2); G.addEnemy('brute', -2, 0); G.addEnemy('eater', -1, 3); G.addEnemy('hive', 1, -2).hp = 4;
    l.cd = 0; G.computeIntents(); l.aim = 4; H.enterLevel([]);
  }, 2.5);
  if (s === 'capture') {
    await page.evaluate(() => {
      const H = __HEX, G = H.G; H.S.meta.seen = ['drone', 'lancer', 'brute', 'eater', 'hive']; H.startGame('run');
      const r = H.S.run; Object.assign(r, { walls: [], enemies: [], tail: ['1,0', '1,-1', '0,-1', '-1,0', '-1,1'], player: [0, 1], pickups: {}, spawns: [], quota: 9, spawned: 9 });
      G.setRun(r); G.addEnemy('drone', 0, 0).sleep = true; G.computeIntents(); H.enterLevel([]); H.tick(2);
      H.commit({ q: 1, r: 0 });
    });
    await snap('capture-a', null, 0.25);
    await snap('capture-b', null, 0.3);
  }
  if (s === 'pick') await snap('pick', () => { const H = __HEX; H.startGame('run'); const r = H.S.run; r.enemies = []; r.spawns = []; r.spawned = r.quota; r.phase = 'play'; H.G.setRun(r); H.commit({ q: r.player[0], r: r.player[1] }); }, 2.2);
  if (s === 'over') await snap('over', () => { const H = __HEX; H.startGame('run'); const r = H.S.run; r.hp = 1; r.score = 4280; r.kills = 9; r.shardsRun = 7; r.enemies = []; H.G.setRun(r); H.G.addEnemy('brute', r.player[0] + 1, r.player[1]); H.G.computeIntents(); H.commit({ q: r.player[0], r: r.player[1] }); }, 2.5);
  if (s === 'enemy') await snap('enemy', () => { const H = __HEX; H.S.meta.seen = []; H.ui.enemy('lancer'); }, 0.5);
}
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors');
await browser.close();
