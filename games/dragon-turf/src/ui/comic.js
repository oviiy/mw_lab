import { Screen, h } from './screens.js';
import { CAST, drawPortrait } from './portraits.js';
import { DIALOGUES } from '../data/dialogues.js';
import { mix } from '../core/color.js';

// Comic-panel cutscene: halftone backdrop, two portraits, a typed speech bubble.
export class ComicScreen extends Screen {
  open({ scene, lines, onDone }) {
    this.lines = lines || DIALOGUES[scene] || []; this.i = 0; this.onDone = onDone; this.t = 0; this.typed = 0; this.noEsc = true; this.speed = 46;
    this.el.classList.add('comic');
    this.html(`<div class="halftone"></div><div class="letterbox top"></div><div class="letterbox bot"></div>
      <div class="cast"><canvas class="pL" width="420" height="520"></canvas><canvas class="pR" width="420" height="520"></canvas></div>
      <div class="bubble"><div class="who"></div><div class="said"></div><div class="next">▶ <kbd>Enter</kbd></div></div><div class="skip"><kbd>Enter</kbd> next · <kbd>Esc</kbd> skip scene</div>`);
    this.cL = this.$('.pL'); this.cR = this.$('.pR'); this.bubble = this.$('.bubble'); this.whoEl = this.$('.who'); this.saidEl = this.$('.said');
    this.el.addEventListener('click', () => this.advance());
    this.skipT = 0; this.sideWho = {}; for (const l of this.lines) { const s = l.side || 'right'; if (!this.sideWho[s]) this.sideWho[s] = l.who; }
    this.show();
  }
  show() {
    const l = this.lines[this.i]; if (!l) return this.finish();
    this.typed = 0; this.cur = l; const c = CAST[l.who] || CAST.stranger;
    this.whoEl.textContent = (l.name || c.name).toUpperCase(); this.whoEl.style.setProperty('--c', c.color);
    this.bubble.classList.toggle('left', (l.side || 'right') === 'left'); this.el.style.setProperty('--tint', c.color); this.el.style.setProperty('--tintA', mix(c.color, '#0b0710', 0.7));
    this.sideWho[l.side || 'right'] = l.who; this.speaker = l.side || 'right';
    this.el.classList.add('flash'); setTimeout(() => this.el.classList.remove('flash'), 120);
    this.game.audio.ui('tick');
  }
  advance() {
    const l = this.cur; if (!l) return;
    if (this.typed < l.text.length) { this.typed = l.text.length; return; }
    this.i++; this.show();
  }
  finish() { const cb = this.onDone; this.close(); if (cb) cb(); }
  update(dt) {
    this.t += dt; const l = this.cur; if (!l) return;
    if (this.typed < l.text.length) { const before = Math.floor(this.typed); this.typed = Math.min(l.text.length, this.typed + this.speed * dt); if (Math.floor(this.typed) !== before && Math.floor(this.typed) % 3 === 0) this.game.audio.tone(520 + (this.typed % 5) * 40, 0.02, 0.04, 'square'); }
    this.saidEl.textContent = l.text.slice(0, Math.floor(this.typed)); this.$('.next').style.opacity = this.typed >= l.text.length ? 1 : 0.2;
    const mood = l.mood || 'neutral', speaking = this.typed < l.text.length;
    const side = this.sideWho || {};
    if (side.left) { drawPortrait(this.cL, side.left, this.speaker === 'left' ? (speaking ? 'talk' : mood) : 'neutral', this.t); this.cL.classList.toggle('dim', this.speaker !== 'left'); } else this.cL.style.visibility = 'hidden';
    if (side.right) { drawPortrait(this.cR, side.right, this.speaker === 'right' ? (speaking ? 'talk' : mood) : 'neutral', this.t); this.cR.classList.toggle('dim', this.speaker !== 'right'); } else this.cR.style.visibility = 'hidden';
  }
  onKey(e) { if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') { this.advance(); return true; } if (e.code === 'Escape') { this.finish(); return true; } return false; }
}
void h;
