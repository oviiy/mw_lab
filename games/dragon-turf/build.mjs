// Bundles src/ (ES modules) + the stylesheet into a single self-contained HTML file.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const minify = !process.argv.includes('--dev');
const res = await build({ entryPoints: ['src/main.js'], bundle: true, format: 'iife', minify, write: false, target: ['es2021'], legalComments: 'none', logLevel: 'warning' });
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = readFileSync('src/ui/style.css', 'utf8');
let html = readFileSync('index.html', 'utf8');
html = html.replace('<link rel="stylesheet" href="src/ui/style.css" />', () => `<style>${css}</style>`);
html = html.replace('<script type="module" src="src/main.js"></script>', () => `<script>${js}</script>`);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/dragon-turf.html', html);
console.log(`dist/dragon-turf.html  ${(html.length / 1024).toFixed(0)} KB  (js ${(js.length / 1024).toFixed(0)} KB)`);
