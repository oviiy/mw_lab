export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.mouse = [false, false, false];
    this.lookX = 0; this.lookY = 0; this.lastLook = 0;
    this.actions = { use: false, camera: false, radio: false, horn: false, pause: false, siren: false, ao: false, cheats: false, weapon: -1, wheel: 0 };
    this.locked = false; this.enabled = false; this.mx = 0; this.my = 0;
    const prevent = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab']);
    window.addEventListener('keydown', (e) => {
      if (this.enabled && prevent.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(e.code);
      const a = this.actions;
      if (e.code === 'KeyE' || e.code === 'KeyF') a.use = true;
      else if (e.code === 'KeyC') a.camera = true;
      else if (e.code === 'KeyR') a.radio = true;
      else if (e.code === 'KeyH') a.horn = true;
      else if (e.code === 'KeyL') a.siren = true;
      else if (e.code === 'KeyO') a.ao = true;
      else if (e.code === 'KeyP' || e.code === 'Escape') a.pause = true;
      else if (e.code === 'Backquote') a.cheats = true;
      else if (e.code === 'Digit0' || e.code === 'Minus' || e.code === 'Equal') a.weapon = { Digit0: 9, Minus: 10, Equal: 11 }[e.code];
      else if (e.code.startsWith('Digit')) { const n = +e.code.slice(5) - 1; if (n >= 0 && n < 8) a.weapon = n; }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => { this.keys.clear(); this.mouse = [false, false, false]; });
    canvas.addEventListener('mousedown', (e) => {
      // When the mouse isn't captured yet, the click only captures it (so it doesn't also fire a shot).
      if (this.enabled && !this.locked && e.button === 0 && !this.lockFailed && canvas.requestPointerLock) {
        try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => { this.lockFailed = true; }); } catch (_) { this.lockFailed = true; }
        return;
      }
      this.mouse[e.button] = true;
    });
    window.addEventListener('mouseup', (e) => { this.mouse[e.button] = false; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('mousemove', (e) => {
      this.mx = e.clientX; this.my = e.clientY;
      // look with the mouse when the pointer is locked, or by dragging with the right button
      if (this.locked || this.mouse[2]) { this.lookX += e.movementX; this.lookY += e.movementY; this.lastLook = performance.now(); }
    });
    window.addEventListener('wheel', (e) => { if (this.enabled) this.actions.wheel += Math.sign(e.deltaY); }, { passive: true });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === canvas; });
  }
  consume() {
    const a = { ...this.actions }, lx = this.lookX, ly = this.lookY;
    Object.assign(this.actions, { use: false, camera: false, radio: false, horn: false, pause: false, siren: false, ao: false, cheats: false, weapon: -1, wheel: 0 });
    this.lookX = this.lookY = 0;
    return { a, lx, ly };
  }
}
