import { Screen } from '../screens.js';
import { rand } from '../../core/rng.js';

// Hotwire minigame: repeat the arrow sequence before the timer runs out.
// one glyph rotated per direction: renders identically on every system font
const ARROWS = [['ArrowUp', 0, 'KeyW'], ['ArrowDown', 180, 'KeyS'], ['ArrowLeft', -90, 'KeyA'], ['ArrowRight', 90, 'KeyD']];

export class HotwireScreen extends Screen {
  open({ vehicle }) {
    const first = !this.game.tipsSeen || !this.game.tipsSeen.has('hotwired');
    this.v = vehicle; this.noEsc = false; this.len = first ? 3 : 4 + (vehicle.def.hp > 200 ? 1 : 0) + (vehicle.type === 'sports' || vehicle.type === 'limo' ? 1 : 0);
    this.seq = Array.from({ length: this.len }, () => rand.int(0, 3)); this.i = 0; this.t = -0.8; this.limit = (first ? 5.5 : 2.4) + this.len * 0.5; this.result = null; this.el.classList.add('clear');
    this.html(`<div class="hw"><div class="hw-title">HOTWIRE · ${vehicle.def.name.toUpperCase()}</div><div class="hw-seq">${this.seq.map((a, k) => `<span class="k" data-k="${k}"><b style="transform:rotate(${ARROWS[a][1]}deg)">▲</b></span>`).join('')}</div><div class="hw-bar"><i></i></div><div class="hint">Tap the arrow keys (or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>) in this order before the bar runs out. A wrong key resets the sequence. <kbd>Esc</kbd> gives up.</div></div>`);
    this.bar = this.$('.hw-bar i'); this.keys = this.$$('.k'); this.game.audio.tone(260, 0.2, 0.12, 'sawtooth', 120);
  }
  update(dt) {
    if (this.result) { this.rt -= dt; if (this.rt <= 0) this.finish(); return; }
    this.t += dt; this.bar.style.width = Math.max(0, Math.min(100, 100 - (this.t / this.limit) * 100)) + '%';
    if (this.t >= this.limit) this.fail();
  }
  onKey(e) {
    if (this.result) return true;
    const a = ARROWS.findIndex((x) => x[0] === e.code || x[2] === e.code); if (a < 0) return e.code === 'Escape' ? false : true;
    if (a === this.seq[this.i]) { this.keys[this.i].classList.add('ok'); this.i++; this.game.audio.tone(500 + this.i * 120, 0.06, 0.12, 'square'); if (this.i >= this.seq.length) { this.result = 'ok'; this.rt = 0.35; this.game.audio.ui('ok'); } }
    else { this.keys.forEach((k) => k.classList.remove('ok')); this.keys[this.i].classList.add('bad'); setTimeout(() => this.keys[this.i] && this.keys[this.i].classList.remove('bad'), 200); this.i = 0; this.t += 0.5; this.game.audio.ui('bad'); }
    return true;
  }
  fail() { this.result = 'fail'; this.rt = 0.5; this.el.classList.add('failed'); this.game.audio.ui('bad'); }
  finish() {
    const g = this.game, v = this.v, ok = this.result === 'ok'; this.close();
    if (ok && this.game.tipsSeen) this.game.tipsSeen.add('hotwired');
    if (ok) { v.locked = false; g.vehicles.enter(g.player, v); g.fx.floater(v.x, v.y - 20, 'HOTWIRED', '#7ed957'); }
    else { v.alarm = 6; g.audio.tone(900, 0.3, 0.2, 'square'); g.events.emit('noise', { x: v.x, y: v.y, r: 400, src: g.player, kind: 'alarm' }); g.wanted.crime('theft', 0.6, v.x, v.y, g.player); g.hud.toast('The alarm is wailing!', 2200, 'bad'); }
  }
  onClose() { }
}
