import { clamp } from '../core/math.js';

// Procedural audio: no samples. Spatial one-shots (distance gain + pan relative to the
// camera), a driving engine voice, a siren voice and ambient beds. Music is in music.js.
export class AudioEngine {
  constructor(game) {
    this.game = game; this.ctx = null; this.muted = false; this.master = null; this.sfxBus = null; this.musicBus = null; this.ready = false;
    this.engine = null; this.siren = null; this.amb = null; this.lastPop = 0; this.volume = 0.8;
  }

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; const c = this.ctx = new AC();
      this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : this.volume; this.master.connect(c.destination);
      const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(this.master);
      this.sfxBus = c.createGain(); this.sfxBus.gain.value = 0.9; this.sfxBus.connect(comp);
      this.musicBus = c.createGain(); this.musicBus.gain.value = 0.5; this.musicBus.connect(comp);
      this.noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.buildEngine(); this.buildSiren(); this.buildAmbient(); this.ready = true;
      this.game.music.attach(this);
    } catch (e) { this.ctx = null; }
  }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : this.volume; }
  setVolume(v) { this.volume = v; if (this.master && !this.muted) this.master.gain.value = v; }

  /* ---------- helpers ---------- */
  gainFor(x, y, range = 620) {
    if (x === undefined) return { g: 1, pan: 0 };
    const cam = this.game.camera, dx = x - cam.x, dy = y - cam.y, d = Math.hypot(dx, dy);
    return { g: Math.pow(clamp(1 - d / range, 0, 1), 1.6), pan: clamp(dx / 520, -1, 1) };
  }
  noise(dur, freq, vol, type = 'lowpass', q = 1, pos, slideTo = 0) {
    const c = this.ctx; if (!c || this.muted) return; const sp = this.gainFor(pos && pos[0], pos && pos[1]); const v = vol * sp.g; if (!(v >= 0.01)) return;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true; const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, c.currentTime); if (slideTo) f.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), c.currentTime + dur); f.Q.value = q;
    const o = c.createGain(), t = c.currentTime; o.gain.setValueAtTime(v, t); o.gain.exponentialRampToValueAtTime(0.001, t + dur);
    const pan = c.createStereoPanner ? c.createStereoPanner() : null; if (pan) pan.pan.value = sp.pan;
    s.connect(f); f.connect(o); if (pan) { o.connect(pan); pan.connect(this.sfxBus); } else o.connect(this.sfxBus); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  tone(freq, dur, vol, type = 'square', slide = 0, pos) {
    const c = this.ctx; if (!c || this.muted) return; const sp = this.gainFor(pos && pos[0], pos && pos[1]); const v = vol * sp.g; if (!(v >= 0.005)) return;
    const o = c.createOscillator(); o.type = type; const t = c.currentTime; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    const pan = c.createStereoPanner ? c.createStereoPanner() : null; if (pan) pan.pan.value = sp.pan;
    o.connect(g); if (pan) { g.connect(pan); pan.connect(this.sfxBus); } else g.connect(this.sfxBus); o.start(t); o.stop(t + dur + 0.02);
  }

  /* ---------- one-shots ---------- */
  shot(id, x, y) {
    const p = [x, y];
    if (id === 'shotgun') { this.noise(0.34, 1500, 0.9, 'lowpass', 1, p, 300); this.noise(0.12, 4200, 0.4, 'highpass', 1, p); this.tone(95, 0.22, 0.4, 'square', -55, p); }
    else if (id === 'rifle') { this.noise(0.16, 2600, 0.6, 'bandpass', 0.8, p, 900); this.tone(140, 0.12, 0.28, 'sawtooth', -90, p); }
    else if (id === 'smg') { this.noise(0.09, 3000, 0.45, 'bandpass', 0.9, p, 1200); this.tone(170, 0.06, 0.15, 'square', -90, p); }
    else { this.noise(0.14, 2300, 0.6, 'bandpass', 0.7, p, 800); this.tone(150, 0.1, 0.22, 'square', -80, p); }
  }
  explosion(x, y) { const p = [x, y]; this.noise(1.5, 600, 1.3, 'lowpass', 0.7, p, 80); this.noise(0.6, 2000, 0.5, 'bandpass', 0.5, p); this.tone(58, 0.9, 0.55, 'sine', -30, p); }
  crash(x, y, imp = 100) { const k = clamp(imp / 320, 0.15, 1); this.noise(0.3, 1100, 0.7 * k, 'lowpass', 1, [x, y], 200); this.tone(85, 0.14, 0.3 * k, 'square', -35, [x, y]); if (imp > 160) this.noise(0.25, 4200, 0.3 * k, 'highpass', 1, [x, y]); }
  thud(x, y) { this.noise(0.12, 380, 0.7, 'lowpass', 1, [x, y]); }
  swing(hit, x, y) { this.noise(0.1, hit ? 900 : 2400, hit ? 0.7 : 0.25, hit ? 'lowpass' : 'highpass', 1, [x, y]); }
  glass(x, y) { this.noise(0.35, 6000, 0.4, 'highpass', 1, [x, y]); this.tone(2400, 0.12, 0.08, 'triangle', -900, [x, y]); }
  ping(x, y) { this.tone(1700 + Math.random() * 500, 0.07, 0.1, 'triangle', -500, [x, y]); this.noise(0.05, 5000, 0.2, 'highpass', 1, [x, y]); }
  click() { this.tone(900, 0.03, 0.12, 'square'); }
  roll() { this.noise(0.25, 700, 0.18, 'lowpass', 1, undefined, 300); }
  pickup(type) { if (type === 'cash' || type === 'drop') { this.tone(988, 0.09, 0.16, 'sine'); setTimeout(() => this.tone(1319, 0.14, 0.16, 'sine'), 70); } else { this.tone(660, 0.1, 0.15, 'triangle'); setTimeout(() => this.tone(990, 0.12, 0.15, 'triangle'), 80); } }
  ui(kind = 'tick') { if (kind === 'tick') this.tone(1200, 0.03, 0.08, 'square'); else if (kind === 'ok') { this.tone(880, 0.08, 0.14, 'triangle'); setTimeout(() => this.tone(1320, 0.12, 0.14, 'triangle'), 70); } else if (kind === 'bad') this.tone(180, 0.2, 0.18, 'sawtooth', -60); else if (kind === 'open') this.noise(0.12, 1800, 0.12, 'bandpass'); }
  horn(v) { const p = [v.x, v.y]; this.tone(340, 0.45, 0.2, 'square', 0, p); this.tone(428, 0.45, 0.16, 'square', 0, p); }
  door() { this.noise(0.1, 700, 0.3); this.tone(220, 0.06, 0.12, 'square', -90); }
  sting(kind) { if (kind === 'wasted') { this.tone(110, 1.6, 0.4, 'sawtooth', -70); this.tone(104, 1.6, 0.3, 'square', -60); this.noise(1.2, 400, 0.3, 'lowpass'); } else if (kind === 'busted') { this.tone(220, 0.6, 0.3, 'square', -100); setTimeout(() => this.tone(165, 0.9, 0.3, 'square', -70), 250); } else if (kind === 'win') { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.28, 0.2, 'triangle'), i * 110)); } }
  gong() { this.tone(196, 2.4, 0.22, 'sine'); this.tone(392 * 1.01, 2.0, 0.1, 'sine'); this.noise(0.4, 900, 0.08, 'bandpass'); }
  firecracker() { const n = 3 + (Math.random() * 6 | 0); for (let i = 0; i < n; i++) setTimeout(() => this.noise(0.06, 3500, 0.35, 'bandpass', 0.8), i * (50 + Math.random() * 90)); }
  nextStation() { this.game.music.next(); }

  /* ---------- continuous voices ---------- */
  buildEngine() {
    const c = this.ctx; this.engine = { o1: c.createOscillator(), o2: c.createOscillator(), f: c.createBiquadFilter(), g: c.createGain() };
    const e = this.engine; e.o1.type = 'sawtooth'; e.o2.type = 'square'; e.f.type = 'lowpass'; e.f.frequency.value = 500; e.g.gain.value = 0;
    e.o1.connect(e.f); e.o2.connect(e.f); e.f.connect(e.g); e.g.connect(this.sfxBus); e.o1.start(); e.o2.start();
  }
  buildSiren() {
    const c = this.ctx; this.siren = { o: c.createOscillator(), g: c.createGain() }; this.siren.o.type = 'sawtooth'; this.siren.g.gain.value = 0; this.siren.o.connect(this.siren.g); this.siren.g.connect(this.sfxBus); this.siren.o.start();
  }
  buildAmbient() {
    const c = this.ctx; const mk = (type, freq, q) => { const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = c.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(this.sfxBus); s.start(); return { f, g }; };
    this.amb = { city: mk('lowpass', 260, 0.7), crowd: mk('bandpass', 900, 0.6), water: mk('lowpass', 520, 0.5), rain: mk('highpass', 3500, 0.6) };
  }

  update(dt) {
    const c = this.ctx; if (!c || !this.ready) return; const g = this.game, t = c.currentTime, p = g.player; if (!p) return;
    const v = p.vehicle;
    if (v && !v.dead && g.state === 'play') {
      const e = this.engine, max = v.def.max, gears = v.def.bike ? 5 : 5, r = clamp(Math.abs(v.fw) / max, 0, 1) * gears, gear = Math.min(gears - 1, Math.floor(r)), frac = r - gear;
      const rpm = 0.25 + frac * 0.75, base = v.def.kind === 'truck' || v.def.kind === 'bus' ? 38 : v.def.bike ? 70 : 46, f = base + rpm * (80 + gear * 10);
      e.o1.frequency.setTargetAtTime(f, t, 0.05); e.o2.frequency.setTargetAtTime(f * 0.5, t, 0.05); e.f.frequency.setTargetAtTime(240 + rpm * 800 + (v.controls.thr > 0 ? 260 : 0), t, 0.08);
      e.g.gain.setTargetAtTime(0.06 + rpm * 0.05 + (v.controls.thr > 0 ? 0.035 : 0), t, 0.1);
    } else this.engine.g.gain.setTargetAtTime(0, t, 0.12);
    // siren: nearest wailing vehicle
    let best = 1e9; for (const q of g.entities.vehicles) if (q.siren && !q.dead) { const d = Math.hypot(q.x - g.camera.x, q.y - g.camera.y); if (d < best) best = d; }
    this.siren.g.gain.setTargetAtTime(best < 900 ? 0.03 * (1 - best / 900) : 0, t, 0.1);
    if (best < 900) this.siren.o.frequency.setTargetAtTime(660 + Math.abs(Math.sin(g.time * 3.1)) * 520, t, 0.02);
    // ambient mix by district / weather
    const d = g.world.districtAtPx(p.x, p.y), tile = g.world.tileAtPx(p.x, p.y), A = this.amb;
    const near = (id) => d === id ? 1 : 0.35;
    A.city.g.gain.setTargetAtTime(0.05 * (d === 3 ? 1.5 : 1), t, 0.6);
    A.crowd.g.gain.setTargetAtTime(g.clock.isNight ? 0.012 * near(0) : 0.03 * near(0), t, 0.6);
    A.water.g.gain.setTargetAtTime(tile === 10 || tile === 7 || d === 1 ? 0.05 : 0.008, t, 0.8);
    A.rain.g.gain.setTargetAtTime(g.weather && g.weather.rain > 0.05 ? 0.05 * g.weather.rain : 0, t, 0.8);
    // Chinatown flavour: distant firecrackers and gongs
    if (d === 0 && g.time - this.lastPop > 14 + Math.random() * 20 && g.state === 'play') { this.lastPop = g.time; if (Math.random() < 0.55) this.firecracker(); else this.gong(); }
  }
}
