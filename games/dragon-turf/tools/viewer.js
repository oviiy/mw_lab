// Dev tool: fly around the generated world with the real renderer (no gameplay).
import { generateWorld } from '../src/world/generate.js';
import { Renderer } from '../src/render/renderer.js';
import { Clock } from '../src/world/clock.js';
import { SEED } from '../src/config.js';

const t0 = performance.now();
const world = generateWorld(SEED);
const clock = new Clock();
const canvas = document.getElementById('c');
const r = new Renderer(canvas, world, clock);
const info = document.getElementById('i');
const keys = new Set();
addEventListener('keydown', (e) => keys.add(e.code)); addEventListener('keyup', (e) => keys.delete(e.code));
const q = new URLSearchParams(location.search);
r.cam.snapTo(+(q.get('x') || world.spawn.x), +(q.get('y') || world.spawn.y));
if (q.get('h')) clock.setHour(+q.get('h'));
clock.paused = true;
r.cam.userZoom = +(q.get('z') || 1);
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const sp = 500 / r.cam.zoom * dt;
  if (keys.has('KeyW')) r.cam.y -= sp; if (keys.has('KeyS')) r.cam.y += sp; if (keys.has('KeyA')) r.cam.x -= sp; if (keys.has('KeyD')) r.cam.x += sp;
  if (keys.has('KeyQ')) r.cam.userZoom = Math.min(1.6, r.cam.userZoom * 1.02); if (keys.has('KeyE')) r.cam.userZoom = Math.max(0.3, r.cam.userZoom / 1.02);
  if (keys.has('KeyT')) clock.hour = (clock.hour + dt * 3) % 24;
  r.cam.zoom = r.cam.userZoom;
  r.cam.trauma = 0; r.cam.shakeX = r.cam.shakeY = 0;
  r.ground.prebake(r.cam.x, r.cam.y, 1);
  r.render(dt, null);
  info.textContent = `gen ${(performance.now() - t0).toFixed(0)}ms  cam ${r.cam.x | 0},${r.cam.y | 0} z${r.cam.zoom.toFixed(2)}  hour ${clock.label()}  items ${r.stats.items} lights ${r.stats.lights} chunks ${r.ground.chunks.size}  bld ${world.buildings.length}`;
  requestAnimationFrame(frame);
}
window.__v = { world, r, clock };
requestAnimationFrame(frame);
