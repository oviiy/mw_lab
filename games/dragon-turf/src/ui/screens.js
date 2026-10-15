// Full-screen UI manager. Screens are small classes that build DOM into #screens;
// the manager stacks them, pauses the world while any modal is open and routes keys.
export class Screen {
  constructor(game, mgr) { this.game = game; this.mgr = mgr; this.el = document.createElement('div'); this.el.className = 'screen'; }
  open() {}
  close() { this.mgr.close(this); }
  update() {}
  onKey() { return false; }
  onClose() {}
  html(s) { this.el.innerHTML = s; return this.el; }
  $(sel) { return this.el.querySelector(sel); }
  $$(sel) { return [...this.el.querySelectorAll(sel)]; }
}

export class Screens {
  constructor(game) {
    this.game = game; this.root = document.getElementById('screens'); this.defs = {}; this.stack = []; this.prevState = 'play';
    addEventListener('keydown', (e) => this.onKey(e), true);
  }
  register(name, cls) { this.defs[name] = cls; }
  get modal() { return this.stack.length > 0; }
  get top() { return this.stack[this.stack.length - 1] || null; }
  is(name) { return this.stack.some((s) => s.name === name); }

  open(name, props = {}) {
    if (this.is(name)) return null;
    const Cls = this.defs[name]; if (!Cls) { console.warn('unknown screen', name); return null; }
    const s = new Cls(this.game, this); s.name = name; this.root.appendChild(s.el);
    if (!this.stack.length && this.game.state === 'play') { this.prevState = 'play'; this.game.state = 'ui'; }
    this.stack.push(s); s.open(props); this.game.audio.ui('open'); requestAnimationFrame(() => s.el.classList.add('show'));
    return s;
  }
  close(s) {
    const i = this.stack.indexOf(s); if (i < 0) return; this.stack.splice(i, 1); s.onClose(); s.el.classList.remove('show');
    setTimeout(() => s.el.remove(), 220);
    if (!this.stack.length && this.game.state === 'ui') this.game.state = this.prevState;
  }
  closeAll() { for (const s of [...this.stack]) this.close(s); }
  update(dt) { const t = this.top; if (t) t.update(dt); }

  onKey(e) {
    const t = this.top; if (!t) return;
    if (t.onKey(e)) { e.preventDefault(); e.stopPropagation(); return; }
    if (e.code === 'Escape' && !t.noEsc) { t.close(); e.preventDefault(); e.stopPropagation(); }
  }

  togglePda() { if (this.is('pda')) this.close(this.stack.find((s) => s.name === 'pda')); else if (this.game.state === 'play') this.open('pda'); }
  togglePause() { if (this.is('pause')) this.close(this.stack.find((s) => s.name === 'pause')); else if (this.game.state === 'play') this.open('pause'); }
}

// Small DOM helper used across screens.
export const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
