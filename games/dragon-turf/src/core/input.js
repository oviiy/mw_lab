// Keyboard + mouse. Gameplay code asks for *actions*, never raw key codes.
const BINDINGS = {
  up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
  sprint: ['ShiftLeft', 'ShiftRight'], dodge: ['Space'], use: ['KeyE', 'KeyF'], handbrake: ['Space'],
  reload: ['KeyR'], throw: ['KeyG'], melee: ['KeyV'], horn: ['KeyH'], radio: ['KeyT'],
  pda: ['Tab', 'KeyM'], pause: ['Escape', 'KeyP'], weaponNext: ['KeyQ'], zoom: ['KeyZ'], cam: ['KeyC'],
  w1: ['Digit1'], w2: ['Digit2'], w3: ['Digit3'], w4: ['Digit4'], w5: ['Digit5'], w6: ['Digit6'], w7: ['Digit7'], w8: ['Digit8'], w9: ['Digit9'], backup: ['KeyB'], cheats: ['F1', 'Backquote'],
};

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.down = new Set(); this.hit = new Set();
    this.mouse = { x: 0, y: 0, left: false, right: false, wheel: 0, leftHit: false, rightHit: false };
    this.enabled = true;
    const prevent = new Set(['F1', 'Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
    addEventListener('keydown', (e) => {
      if (prevent.has(e.code) && this.enabled) e.preventDefault();
      if (!e.repeat) this.hit.add(e.code);
      this.down.add(e.code);
    });
    addEventListener('keyup', (e) => this.down.delete(e.code));
    addEventListener('blur', () => { this.down.clear(); this.mouse.left = this.mouse.right = false; });
    canvas.addEventListener('mousemove', (e) => { const r = canvas.getBoundingClientRect(); this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top; });
    canvas.addEventListener('mousedown', (e) => { if (e.button === 0) { this.mouse.left = true; this.mouse.leftHit = true; } if (e.button === 2) { this.mouse.right = true; this.mouse.rightHit = true; } });
    addEventListener('mouseup', (e) => { if (e.button === 0) this.mouse.left = false; if (e.button === 2) this.mouse.right = false; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => { this.mouse.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
  }
  held(action) { if (!this.enabled) return false; for (const c of BINDINGS[action]) if (this.down.has(c)) return true; return false; }
  pressed(action) { if (!this.enabled) return false; for (const c of BINDINGS[action]) if (this.hit.has(c)) return true; return false; }
  key(code) { return this.down.has(code); }
  keyHit(code) { return this.hit.has(code); }
  axis() {
    let x = (this.held('right') ? 1 : 0) - (this.held('left') ? 1 : 0), y = (this.held('down') ? 1 : 0) - (this.held('up') ? 1 : 0);
    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    return { x, y };
  }
  endFrame() { this.hit.clear(); this.mouse.leftHit = this.mouse.rightHit = false; this.mouse.wheel = 0; }
}
