// Debug helper: node tools/eval.mjs "<js expression run in the page>"
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.goto(pathToFileURL(resolve('dist/index.html')).href);
await p.waitForFunction(() => !!globalThis.__HEX);
console.log(await p.evaluate(process.argv[2]));
await b.close();
