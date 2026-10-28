import * as esbuild from 'esbuild';
import fs from 'fs';
import { createHash } from 'node:crypto';

const res = await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: !process.argv.includes('--dev'),
  format: 'iife',
  target: ['es2020'],
  write: false,
  legalComments: 'none',
  logLevel: 'warning',
});
const js = res.outputFiles[0].text;
const version = createHash('sha256').update(js).digest('hex').slice(0, 12);
const html = fs.readFileSync('src/index.html', 'utf8').replace('<!--APP_SCRIPT-->', `<script defer src="app.js?v=${version}"></script>`);
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
fs.writeFileSync('dist/app.js', js);
console.log('dist/index.html', (html.length / 1024).toFixed(0) + ' KB', 'dist/app.js', (js.length / 1024).toFixed(0) + ' KB');
