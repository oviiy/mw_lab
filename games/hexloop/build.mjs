import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const dev = process.argv.includes('--dev');
const res = await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  minify: !dev,
  sourcemap: dev ? 'inline' : false,
  write: false,
  target: ['es2020'],
  legalComments: 'none',
  logLevel: 'warning',
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = readFileSync('src/style.css', 'utf8');
const html = readFileSync('src/index.html', 'utf8')
  .replace('/*APP_CSS*/', () => css)
  .replace('/*APP_JS*/', () => js);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
console.log(`dist/index.html ${(html.length / 1024).toFixed(1)} KB (js ${(js.length / 1024).toFixed(1)} KB)`);
