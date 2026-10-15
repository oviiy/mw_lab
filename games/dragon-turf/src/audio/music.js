// Generative radio. Stations are small schedulers that fire notes ahead of the audio
// clock. Everything is built on the pentatonic scale so any combination sounds right.
const D_PENT = [0, 2, 4, 7, 9];                       // major pentatonic degrees
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

export class MusicEngine {
  constructor(game) { this.game = game; this.audio = null; this.station = 0; this.next_ = 0; this.beat = 0; this.timer = null; this.intensity = 0; this.names = ['Jade Lantern FM', 'Neon Dragon Beat', 'Radio Off']; this.stationChanged = null; this.seed = 7; }

  attach(audio) {
    this.audio = audio; this.ctx = audio.ctx; this.bus = audio.musicBus; this.next_ = this.ctx.currentTime + 0.2;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 60);
  }
  setStation(i) { this.station = i; this.beat = 0; if (this.ctx) this.next_ = this.ctx.currentTime + 0.15; if (this.stationChanged) this.stationChanged(this.names[i]); }
  next() { this.setStation((this.station + 1) % this.names.length); }
  get name() { return this.names[this.station]; }

  rnd() { this.seed = (this.seed * 16807) % 2147483647; return this.seed / 2147483647; }

  tick() {
    const c = this.ctx; if (!c || this.station === 2 || this.audio.muted) return;
    const game = this.game; const calm = game.state === 'play' && game.wantedLevel ? 0 : 1; void calm;
    const bpm = this.station === 0 ? 82 : 112, step = 60 / bpm / 4;
    while (this.next_ < c.currentTime + 0.3) {
      const t = Math.max(this.next_, c.currentTime + 0.01);
      if (this.station === 0) this.jade(t, this.beat); else this.neon(t, this.beat);
      this.next_ += step; this.beat++;
    }
  }

  /* ---------- voices ---------- */
  pluck(t, midi, vol = 0.18, dur = 0.9, bright = 2600) {
    const c = this.ctx, o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'triangle'; o2.type = 'sine'; o.frequency.setValueAtTime(hz(midi) * 1.012, t); o.frequency.exponentialRampToValueAtTime(hz(midi), t + 0.06); o2.frequency.value = hz(midi) * 2;
    f.type = 'lowpass'; f.frequency.setValueAtTime(bright, t); f.frequency.exponentialRampToValueAtTime(500, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(this.bus); o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  erhu(t, midi, dur, vol = 0.07) {
    const c = this.ctx, o = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(hz(midi - 0.6), t); o.frequency.exponentialRampToValueAtTime(hz(midi), t + 0.12);
    lfo.frequency.value = 5.2; lg.gain.value = hz(midi) * 0.012; lfo.connect(lg); lg.connect(o.frequency);
    f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.9;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.12); g.gain.setValueAtTime(vol, t + dur - 0.2); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(this.bus); o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
  }
  pad(t, midis, dur, vol = 0.035) {
    const c = this.ctx; for (const m of midis) { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = hz(m); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.8); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(this.bus); o.start(t); o.stop(t + dur + 0.1); }
  }
  kick(t, vol = 0.5) { const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22); o.connect(g); g.connect(this.bus); o.start(t); o.stop(t + 0.25); }
  hat(t, vol = 0.08, open = false) { const c = this.ctx, s = c.createBufferSource(); s.buffer = this.audio.noiseBuf; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500; const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.18 : 0.04)); s.connect(f); f.connect(g); g.connect(this.bus); s.start(t, Math.random()); s.stop(t + 0.2); }
  snare(t, vol = 0.22) { const c = this.ctx, s = c.createBufferSource(); s.buffer = this.audio.noiseBuf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15); s.connect(f); f.connect(g); g.connect(this.bus); s.start(t, Math.random()); s.stop(t + 0.18); this.tone(t, 190, 0.1, 0.1); }
  tone(t, freq, dur, vol, type = 'triangle') { const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(this.bus); o.start(t); o.stop(t + dur + 0.02); }
  bass(t, midi, dur, vol = 0.2, type = 'sawtooth') { const c = this.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(); o.type = type; o.frequency.value = hz(midi); f.type = 'lowpass'; f.frequency.setValueAtTime(700, t); f.frequency.exponentialRampToValueAtTime(160, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(f); f.connect(g); g.connect(this.bus); o.start(t); o.stop(t + dur + 0.03); }

  /* ---------- station 0: Jade Lantern FM (guzheng + erhu, slow) ---------- */
  jade(t, b) {
    const bar = Math.floor(b / 16) % 8, s = b % 16, roots = [62, 59, 57, 64, 62, 59, 64, 57], root = roots[bar];
    if (s === 0) this.pad(t, [root, root + 7, root + 16], 16 * (60 / 82 / 4) + 0.6);
    if (s === 0 || s === 8) this.pluck(t, root - 12, 0.2, 1.5, 900);
    if (s % 4 === 0 && this.rnd() < 0.6) this.hat(t, 0.04);
    if (s === 4 || s === 12) { if (this.rnd() < 0.5) this.kick(t, 0.22); }
    // guzheng runs: random walks on the scale
    if (s % 2 === 0 && this.rnd() < 0.62) { const deg = (this.rnd() * 5) | 0, oct = this.rnd() < 0.3 ? 12 : 0; this.pluck(t, 69 + D_PENT[deg] + oct - (bar % 2 ? 2 : 0), 0.14, 1.1); }
    if (s === 0 && this.rnd() < 0.5) { const d = (this.rnd() * 5) | 0; this.erhu(t + 0.02, 74 + D_PENT[d], 2.4); }
    if (s === 8 && this.rnd() < 0.3) this.erhu(t, 81 + D_PENT[(this.rnd() * 5) | 0], 1.6);
  }

  /* ---------- station 1: Neon Dragon Beat (synthwave + pentatonic lead) ---------- */
  neon(t, b) {
    const bar = Math.floor(b / 16) % 4, s = b % 16, roots = [38, 36, 41, 43], root = roots[bar];
    if (s % 4 === 0) this.kick(t, 0.55);
    if (s === 4 || s === 12) this.snare(t);
    this.hat(t, s % 2 ? 0.04 : 0.07, s === 14);
    if (s % 2 === 0) this.bass(t, root + (s % 8 === 6 ? 7 : 0), 0.26, 0.2);
    if (s % 2 === 1 && (s === 3 || s === 7 || s === 11 || s === 15)) this.bass(t, root + 12, 0.14, 0.1, 'square');
    if (s === 0) this.pad(t, [root + 24, root + 31, root + 36], 16 * (60 / 112 / 4), 0.03);
    if ((s === 2 || s === 6 || s === 10 || s === 14) && this.rnd() < 0.7) this.pluck(t, 74 + D_PENT[(this.rnd() * 5) | 0] + (bar === 2 ? 5 : 0), 0.1, 0.3, 4200);
    if (s === 0 && this.rnd() < 0.45) this.erhu(t, 79 + D_PENT[(this.rnd() * 5) | 0], 1.8, 0.05);
  }
}
