// Isolated preview for scene authors: bundles ONLY the given locations so a half-written file elsewhere can't break you.
//   node tools/preview.mjs --port=5201 braavos pentos
// Then: node tools/shot.mjs braavos out.png --port=5201 [--lm=titan --atmos=dusk --weather=rain --cut=id --q=medium]
import { context } from 'esbuild';
import { mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const port = +(process.argv.find((a) => a.startsWith('--port='))?.split('=')[1] || 5201);
const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dir = resolve(`.preview/${port}`); mkdirSync(dir, { recursive: true });
const reg = resolve(dir, 'scenes.js');
const body = ids.map((s) => `  '${s}': () => Promise.all([import('${resolve('src/scenes', s + '.js')}'), import('${resolve('src/content', s + '.js')}')]),`).join('\n');
writeFileSync(reg, `export const SCENES = {\n${body}\n};\n`);
const lmReg = resolve(dir, 'landmarks.js'); writeFileSync(lmReg, 'export const LANDMARK_INDEX = [];\n');
const plugin = { name: 'registry', setup(b) {
  b.onResolve({ filter: /generated\/scenes\.js$/ }, () => ({ path: reg }));
  b.onResolve({ filter: /generated\/landmarks\.js$/ }, () => ({ path: lmReg }));
} };
const out = resolve(dir, 'dist'); mkdirSync(out, { recursive: true });
cpSync('public', out, { recursive: true }); cpSync('src/app.css', resolve(out, 'assets/style.css'), { recursive: true });
const ctx = await context({ entryPoints: { main: 'src/entry-app.js' }, bundle: true, format: 'esm', splitting: true, outdir: resolve(out, 'assets'), entryNames: '[name]', chunkNames: 'chunks/[name]-[hash]', target: ['es2022'], sourcemap: true, logLevel: 'info', plugins: [plugin], nodePaths: [resolve('node_modules')] });
await ctx.watch();
const s = await ctx.serve({ servedir: out, port });
console.log(`preview of [${ids.join(', ')}] on http://localhost:${s.port}`);
