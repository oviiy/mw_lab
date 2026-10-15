// Everything you hear is synthesised: crowd roar, shouted bids, bells, phones, heartbeat.
import { clamp } from './util.js';

const VOWELS = [[800, 1200], [500, 900], [350, 2000], [650, 1700], [450, 1000]];

export class Audio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.noise = 0;
    this.shoutClock = 0;
    this.heartClock = 0;
    this.phoneOn = false;
    this.phoneClock = 0;
  }

  start() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain();
    this.master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4;
    this.master.connect(comp).connect(ctx.destination);
    this.sfx = ctx.createGain(); this.sfx.connect(this.master);

    // Crowd bed: three filtered noise bands, each wobbling at its own rate.
    this.noiseBuf = this._noiseBuffer(4, true);
    this.crowd = [[260, 0.9, 0.31], [700, 1.1, 0.47], [1700, 1.6, 0.73]].map(([f, q, lfoHz]) => {
      const src = ctx.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
      src.playbackRate.value = 0.9 + Math.random() * 0.2;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
      const g = ctx.createGain(); g.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.frequency.value = lfoHz;
      const lfoG = ctx.createGain(); lfoG.gain.value = 0;
      lfo.connect(lfoG).connect(g.gain);
      src.connect(bp).connect(g).connect(this.master);
      src.start(); lfo.start();
      return { g, lfoG, f };
    });
  }

  _noiseBuffer(sec, pink) {
    const ctx = this.ctx, n = ctx.sampleRate * sec;
    const buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (pink) { b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.02) * 2.2; }
      else d[i] = w;
    }
    return buf;
  }

  setMuted(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.05); }

  // Called every frame with crowd noise 0..1 and danger 0..1 (margin pressure).
  update(dt, noise, danger, paused) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const n = paused ? 0.15 : noise;
    for (const c of this.crowd) {
      const level = 0.04 + n * (c.f > 1000 ? 0.22 : 0.35);
      c.g.gain.setTargetAtTime(level, t, 0.3);
      c.lfoG.gain.setTargetAtTime(level * 0.35, t, 0.3);
    }
    if (paused) return;
    this.shoutClock -= dt * (1 + n * 14);
    if (this.shoutClock <= 0) { this.shout(n); this.shoutClock = 0.4 + Math.random() * 1.2; }
    if (danger > 0.05) {
      this.heartClock -= dt;
      if (this.heartClock <= 0) { this._heart(danger); this.heartClock = 60 / (70 + danger * 80); }
    }
    if (this.phoneOn) {
      this.phoneClock -= dt;
      if (this.phoneClock <= 0) { this._ring(); this.phoneClock = 3; }
    }
  }

  // A shouted bid/offer from somewhere in the pit: buzzy voice through vowel formants.
  shout(intensity = 0.5, pan = Math.random() * 2 - 1, gainMul = 1) {
    const ctx = this.ctx; if (!ctx) return;
    const t = ctx.currentTime;
    const dur = 0.18 + Math.random() * 0.35;
    const f0 = 110 + Math.random() * 120 + intensity * 70;
    const osc = ctx.createOscillator(); osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f0 * (1 + Math.random() * 0.2), t);
    osc.frequency.exponentialRampToValueAtTime(f0 * (0.75 + Math.random() * 0.4), t + dur);
    const [f1, f2] = VOWELS[Math.floor(Math.random() * VOWELS.length)];
    const g = ctx.createGain();
    const peak = (0.025 + intensity * 0.05) * gainMul;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.03);
    g.gain.setTargetAtTime(0, t + dur * 0.6, dur * 0.25);
    const p = ctx.createStereoPanner(); p.pan.value = pan;
    for (const [f, q, a] of [[f1, 9, 1], [f2, 12, 0.6]]) {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
      const ga = ctx.createGain(); ga.gain.value = a * 3;
      osc.connect(bp).connect(ga).connect(g);
    }
    g.connect(p).connect(this.master);
    osc.start(t); osc.stop(t + dur + 0.3);
  }

  // Opening/closing bell: inharmonic partials with a clapper flutter.
  bell(long = 3) {
    const ctx = this.ctx; if (!ctx) return;
    const t = ctx.currentTime;
    const out = ctx.createGain(); out.gain.value = 0.22; out.connect(this.master);
    const trem = ctx.createOscillator(); trem.frequency.value = 22;
    const tremG = ctx.createGain(); tremG.gain.value = 0.5;
    trem.connect(tremG).connect(out.gain);
    trem.start(t); trem.stop(t + long + 1);
    for (const [ratio, amp] of [[1, 1], [2.76, 0.5], [5.4, 0.3], [8.93, 0.15]]) {
      const o = ctx.createOscillator(); o.frequency.value = 940 * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(amp * 0.4, t);
      g.gain.setValueAtTime(amp * 0.4, t + long);
      g.gain.exponentialRampToValueAtTime(0.0001, t + long + 1.2);
      o.connect(g).connect(out);
      o.start(t); o.stop(t + long + 1.3);
    }
  }

  _ring() {
    const ctx = this.ctx, t = ctx.currentTime;
    const g = ctx.createGain(); g.gain.value = 0; g.connect(this.sfx);
    for (const f of [440, 480]) { const o = ctx.createOscillator(); o.frequency.value = f; o.connect(g); o.start(t); o.stop(t + 1.6); }
    for (let i = 0; i < 32; i++) g.gain.setValueAtTime(i % 2 ? 0 : 0.06, t + i * 0.05);
    g.gain.setValueAtTime(0, t + 1.6);
  }

  _heart(danger) {
    const ctx = this.ctx, t = ctx.currentTime;
    for (const [dt, amp] of [[0, 1], [0.16, 0.7]]) {
      const o = ctx.createOscillator(); o.frequency.setValueAtTime(70, t + dt); o.frequency.exponentialRampToValueAtTime(38, t + dt + 0.12);
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t + dt);
      g.gain.linearRampToValueAtTime(0.25 * amp * clamp(danger, 0.3, 1), t + dt + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.18);
      o.connect(g).connect(this.sfx); o.start(t + dt); o.stop(t + dt + 0.2);
    }
  }

  _burst(dur, freq, q, gain, type = 'bandpass') {
    const ctx = this.ctx, t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this._white ||= this._noiseBuffer(1, false);
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.sfx);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }

  // Deal! a pencil stroke and card snap.
  fill(big) {
    if (!this.ctx) return;
    this._burst(0.05, 4200, 1.2, 0.4, 'highpass');
    this._burst(0.12, 2600, 2, 0.22);
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(big ? 660 : 880, t); o.frequency.setValueAtTime(big ? 990 : 1320, t + 0.07);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g).connect(this.sfx); o.start(t); o.stop(t + 0.25);
  }

  miss() { if (this.ctx) this._burst(0.15, 300, 1.5, 0.3, 'lowpass'); }
  signal() { if (this.ctx) { this._burst(0.14, 1400, 0.8, 0.12); this.shout(0.9, 0.15, 1.8); } }
  rustle() { if (!this.ctx) return; for (let i = 0; i < 4; i++) setTimeout(() => this._burst(0.07, 3200 + Math.random() * 1500, 1.5, 0.18), i * 70); }
  tick(up) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(); o.type = 'square';
    o.frequency.value = up ? 1500 : 1100;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.025, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g).connect(this.sfx); o.start(t); o.stop(t + 0.06);
  }
  // Streak chime: pitch climbs with the streak, brighter per tier.
  chime(n, level) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const base = 523.25 * Math.pow(2, Math.min(n, 14) / 12);
    const notes = level >= 2 ? [1, 1.25, 1.5, 2] : level === 1 ? [1, 1.25, 1.5] : [1, 1.5];
    notes.forEach((m, i) => {
      const o = this.ctx.createOscillator(); o.type = level >= 3 ? 'sawtooth' : 'triangle';
      o.frequency.value = base * m;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t + i * 0.06); g.gain.linearRampToValueAtTime(0.07, t + i * 0.06 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.35);
      o.connect(g).connect(this.sfx); o.start(t + i * 0.06); o.stop(t + i * 0.06 + 0.4);
    });
  }

  // Fanfare for tier-ups, milestones and augment picks.
  fanfare(kind = 'tier') {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const seq = kind === 'milestone' ? [392, 523.25, 659.25, 783.99, 1046.5] : kind === 'pick' ? [659.25, 987.77, 1318.5] : [523.25, 659.25, 783.99, 1046.5];
    seq.forEach((f, i) => {
      for (const det of [1, 1.005]) {
        const o = this.ctx.createOscillator(); o.type = 'square'; o.frequency.value = f * det;
        const g = this.ctx.createGain(); const st = t + i * 0.09;
        g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(0.035, st + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, st + (i === seq.length - 1 ? 0.8 : 0.2));
        o.connect(g).connect(this.sfx); o.start(st); o.stop(st + 0.9);
      }
    });
  }

  breakSound() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(440, t); o.frequency.exponentialRampToValueAtTime(110, t + 0.45);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.09, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g).connect(this.sfx); o.start(t); o.stop(t + 0.55);
  }

  alarm() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(380, t + 0.5);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g).connect(this.sfx); o.start(t); o.stop(t + 0.65);
  }
}
