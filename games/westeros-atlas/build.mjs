// Build: generates the lazy scene registry + landmark search index, then bundles with esbuild (ESM, code-split).
//   node build.mjs          production build -> dist/
//   node build.mjs --dev    watch + serve on http://localhost:5173
// env: ENTRY (default src/entry-app.js), OUT (default dist), CSS (default src/app.css)
import { context, build } from 'esbuild';
import { writeFileSync, mkdirSync, cpSync, rmSync, readFileSync } from 'node:fs';
import { generate } from './tools/gen.mjs';

const dev = process.argv.includes('--dev');
const ENTRY = process.env.ENTRY || 'src/entry-app.js', OUT = process.env.OUT || 'dist', CSS = process.env.CSS || 'src/app.css', PORT = +(process.env.PORT || 5173);
const opts = {
  entryPoints: { main: ENTRY }, bundle: true, format: 'esm', splitting: true, outdir: `${OUT}/assets`, entryNames: '[name]', chunkNames: 'chunks/[name]-[hash]',
  minify: !dev, sourcemap: dev, target: ['es2022'], legalComments: 'none', logLevel: 'warning',
};
function copyStatic() { mkdirSync(OUT, { recursive: true }); cpSync('public', OUT, { recursive: true }); mkdirSync(`${OUT}/assets`, { recursive: true }); cpSync(CSS, `${OUT}/assets/style.css`); }
const have = await generate();
console.log(`scenes: ${have.length}`);
if (dev) {
  copyStatic();
  const ctx = await context(opts); await ctx.watch();
  const { port } = await ctx.serve({ servedir: OUT, port: PORT });
  console.log(`dev server http://localhost:${port}`);
} else {
  rmSync(OUT, { recursive: true, force: true });
  copyStatic(); const r = await build({ ...opts, metafile: true });
  const files = Object.entries(r.metafile.outputs).filter(([f]) => f.endsWith('.js'));
  const total = files.reduce((a, [, o]) => a + o.bytes, 0), main = r.metafile.outputs[`${OUT}/assets/main.js`]?.bytes || 0;
  console.log(`built ${OUT}/ — ${files.length} js files, ${(total / 1024).toFixed(0)} KB total, initial entry ${(main / 1024).toFixed(0)} KB`);
}
