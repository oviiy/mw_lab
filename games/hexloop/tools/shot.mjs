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
const snap = async (name, js = null, sec = 1.2, args = null) => {
  if (js) await page.evaluate(js, args);
  await page.evaluate((s) => __HEX.tick(s), sec);
  await page.waitForTimeout(700); // let CSS transitions settle
  await page.evaluate(() => __HEX.tick(0.05));
  await page.screenshot({ path: `${out}/${device}-${name}.png`, timeout: 120000 });
  console.log('saved', name);
};
const scenarios = (process.env.SCENES || 'title,lesson2,showcase,capture').split(',');
for (const s of scenarios) {
  if (s === 'title') await snap('title', null, 1.5);
  if (s === 'lesson2') await snap('lesson2', () => { const H = __HEX; H.startGame('tutorial'); H.G.nextTutorial(); H.enterLevel(H.G.takeEvents()); H.ui.hide(); });
  if (s === 'lesson2press') await snap('lesson2press', () => { const H = __HEX; for (const [q, r] of [[1, 0], [1, -1], [0, -1], [-1, 0]]) { H.G.doMove({ q, r }); H.G.takeEvents(); } H.board.setLevel(H.S.run, { intro: false }); H.view.pressed = '-1,1'; H.enterLevel([]); H.view.pressed = '-1,1'; });
  if (s === 'showcase') await snap('showcase', () => {
    const H = __HEX, G = H.G; H.S.meta.seen = ['drone', 'lancer', 'brute', 'eater', 'hive']; H.startGame('run');
    const r = H.S.run; Object.assign(r, { sector: 6, boss: true, bossType: 'hive', walls: ['2,-3', '-3,1'], enemies: [], tail: ['0,2', '-1,2', '-1,1'], player: [0, 1], pickups: { '3,0': 'shard', '-2,-1': 'heart' }, spawns: [{ q: -3, r: 3, ty: 'drone', at: 99 }] });
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
  if (s === 'draw') {
    await page.evaluate(() => { const H = __HEX; H.startGame('tutorial'); H.G.nextTutorial(); H.enterLevel(H.G.takeEvents()); H.tick(2); });
    const ring = ['0,1', '1,0', '1,-1', '0,-1', '-1,0', '-1,1'];
    const pts = await page.evaluate((ks) => ks.map((k) => { const [q, r] = k.split(',').map(Number); return __HEX.board.screenOf(q, r, 0.28); }), ring);
    await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down();
    for (const [x, y] of pts.slice(1)) { await page.mouse.move(x, y, { steps: 6 }); }
    await page.evaluate(() => __HEX.tick(0.3));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${device}-draw-mid.png` });
    console.log('mid-drag path:', await page.evaluate(() => JSON.stringify({ path: __HEX.view.path, live: __HEX.view.preview && __HEX.view.preview.live })));
    await page.mouse.up();
    for (let i = 0; i < 8; i++) await page.evaluate(() => __HEX.tick(0.5));
    console.log('after release:', await page.evaluate(() => JSON.stringify({ phase: __HEX.S.run && __HEX.S.run.phase, tut: __HEX.S.run && __HEX.S.run.tut, enemies: __HEX.S.run && __HEX.S.run.enemies.length })));
  }
  if (s === 'tapwalk') {
    await page.evaluate(() => { const H = __HEX; H.startGame('tutorial'); H.tick(2); });
    const [x, y] = await page.evaluate(() => __HEX.board.screenOf(2, -1, 0.28));
    await page.mouse.click(x, y);
    for (let i = 0; i < 6; i++) await page.evaluate(() => __HEX.tick(0.5));
    console.log('after tap far hex:', await page.evaluate(() => JSON.stringify({ player: __HEX.S.run.player, shards: __HEX.S.run.shardsRun })));
  }
  if (s === 'sector1') await snap('sector1', () => { const H = __HEX; H.S.meta.tutorialDone = true; H.S.meta.seen = ['drone']; H.startGame('run'); H.tick(2); for (let i = 0; i < 2; i++) { const sg = H.view.sug; if (!sg) break; const [q, r] = sg.path[0].split(',').map(Number); H.commit({ q, r }); H.tick(1.2); } }, 1.5);
  for (const [name, sec, extra] of [['act2', 4, ['bomber', 'splitter', 'mite']], ['act3', 7, ['bomber', 'eater', 'mite', 'splitter']], ['warden', 6, []], ['colossus', 9, []]]) if (s === name) await snap(name, (args) => {
    const H = __HEX, G = H.G; H.S.meta.tutorialDone = true; H.S.meta.seen = Object.keys(G.ENEMY_INFO); H.startGame('run');
    const r = H.S.run; r.sector = args.sec - 1; G.nextSector(); G.takeEvents();
    for (const ty of args.extra) { const free = H.S.grid.keys.filter((k) => !r.walls.includes(k) && !(r.lava || []).includes(k) && !(r.hedge || []).includes(k) && !r.enemies.some((e) => Math.abs(e.q - +k.split(',')[0]) + Math.abs(e.r - +k.split(',')[1]) < 3) && k !== '0,0'); const k = free[Math.floor(free.length / 2)]; if (k) { const [q, rr] = k.split(',').map(Number); G.addEnemy(ty, q, rr); } }
    const b = r.enemies.find((e) => e.type === 'bomber'); if (b) b.fuse = 1;
    G.computeIntents(); H.enterLevel([]);
  }, 2.5, { sec, extra });
  if (s === 'pickgold') await snap('pickgold', () => { const H = __HEX; H.startGame('run'); const r = H.S.run; r.phase = 'pick'; r.choiceTier = 'prism'; r.choices = ['nova', 'phoenix', 'infinity']; H.ui.pick(r); }, 0.6);
  if (s === 'codex') await snap('codex', () => { const H = __HEX; H.S.meta.seen = ['drone', 'lancer', 'bomber', 'hive']; H.S.meta.seenMods = ['tail', 'chain', 'nova']; H.ui.codex(H.S.meta); }, 0.6);
  if (s === 'enemy') await snap('enemy', () => { const H = __HEX; H.S.meta.seen = []; H.ui.enemy('lancer'); }, 0.5);
}
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors');
await browser.close();
