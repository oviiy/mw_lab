import { Game } from './game.js';

// Entry point: create the game, start the frame loop, expose a debug handle.
const canvas = document.getElementById('game');
const game = new Game(canvas);
window.__game = game;

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.25, (now - last) / 1000); last = now;
  game.update(dt);
  game.render(dt);
  game.renderer.adapt(dt);
}
requestAnimationFrame(frame);

// Dev convenience: ?play skips the title screen.
if (new URLSearchParams(location.search).has('play')) { game.screens.closeAll(); game.beginGame(false); }

// Pause when the tab is hidden.
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'play' && !game.down) game.screens.open('pause'); });
