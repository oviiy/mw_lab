import { render } from 'preact';
import { App } from './ui/App';
import { clearFaceCache } from './ui/dice3d/faceArt';
import { mountFx } from './ui/fx';
import './ui/scene.css';
import './ui/styles.css';

mountFx();
render(<App />, document.getElementById('app')!);

// Keep the curtain down until the brush font arrives (or 2.5 s pass), so titles don't flash.
const boot = document.getElementById('boot');
const lift = () => {
  boot?.classList.add('gone');
  setTimeout(() => boot?.remove(), 600);
};
const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
Promise.race([fonts ? fonts.load('40px "Ma Shan Zheng"').then(() => fonts.ready) : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]).then(() => {
  // Flat face images painted before the font arrived used fallback glyphs: repaint them.
  clearFaceCache();
  lift();
});
