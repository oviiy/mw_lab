// Pure WebAudio synthesis: no audio files. Music bus + sfx bus → compressor, with a shared reverb send.
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
// A-minor-ish progression, one chord per bar
const CHORDS = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]];

export class Audio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicOn = true;
    this.intensity = 0; // 0 calm … 1 tense; drives music density
    this.step = 0;
    this.nextT = 0;
  }

  start() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    this.master.connect(comp).connect(ctx.destination);
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(2.6, 2.4);
    const rv = ctx.createGain(); rv.gain.value = 0.42;
    this.reverb.connect(rv).connect(this.master);
    this.sfx = ctx.createGain(); this.sfx.gain.value = 0.85; this.sfx.connect(this.master);
    const sfxSend = ctx.createGain(); sfxSend.gain.value = 0.25; this.sfx.connect(sfxSend).connect(this.reverb);
    this.music = ctx.createGain(); this.music.gain.value = this.musicOn ? 0.32 : 0; this.music.connect(this.master);
    const mSend = ctx.createGain(); mSend.gain.value = 0.7; this.music.connect(mSend).connect(this.reverb);
    this.noise = this.noiseBuffer();
    this.nextT = ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 50);
  }

  setMuted(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05); }
  setMusic(on) { this.musicOn = on; if (this.music) this.music.gain.setTargetAtTime(on ? 0.32 : 0, this.ctx.currentTime, 0.2); }

  impulse(sec, decay) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  noiseBuffer() {
    const ctx = this.ctx, b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  // ---------- primitives
  tone(freq, dur, { type = 'sine', vol = 0.2, at = 0, to = null, attack = 0.005, bus = this.sfx, filter = null, detune = 0 } = {}) {
    const ctx = this.ctx; if (!ctx) return;
    const t = (at || ctx.currentTime), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (filter) { const f = ctx.createBiquadFilter(); f.type = filter.type || 'lowpass'; f.frequency.value = filter.freq; f.Q.value = filter.q || 0.7; node.connect(f); node = f; }
    node.connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }
  burst(dur, { vol = 0.3, at = 0, freq = 1200, to = null, type = 'bandpass', q = 1 } = {}) {
    const ctx = this.ctx; if (!ctx) return;
    const t = at || ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noise; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.sfx); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  // ---------- music: soft pad + plucked arpeggio, denser with intensity
  schedule() {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    const spb = 60 / 96 / 2; // eighth notes at 96 bpm
    while (this.nextT < ctx.currentTime + 0.25) {
      const s = this.step, bar = Math.floor(s / 8) % CHORDS.length, ch = CHORDS[bar], t = this.nextT;
      if (s % 8 === 0) for (const n of ch) this.tone(midi(n - 12), spb * 8.5, { type: 'triangle', vol: 0.05, at: t, attack: 0.6, bus: this.music, filter: { freq: 900 }, detune: (Math.random() - 0.5) * 12 });
      if (s % 8 === 0) this.tone(midi(ch[0] - 24), spb * 7.5, { type: 'sine', vol: 0.12, at: t, attack: 0.05, bus: this.music });
      const density = 0.35 + this.intensity * 0.6;
      if (Math.random() < density) {
        const n = ch[(s * 3 + bar) % 4] + (s % 4 === 3 ? 12 : 0) + 12;
        this.tone(midi(n), 0.35, { type: 'square', vol: 0.025, at: t, bus: this.music, filter: { freq: 1400 + 1400 * this.intensity } });
      }
      if (this.intensity > 0.45 && s % 2 === 0) this.burst(0.05, { vol: 0.05 * this.intensity, at: t, freq: 7000, type: 'highpass' });
      if (this.intensity > 0.6 && s % 4 === 0) this.tone(70, 0.18, { type: 'sine', vol: 0.18 * this.intensity, at: t, to: 40, bus: this.music });
      this.nextT += spb; this.step++;
    }
  }

  // ---------- sfx
  play(name, x = 0) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    switch (name) {
      case 'move': this.tone(520 + Math.random() * 40, 0.09, { type: 'triangle', vol: 0.09, to: 760 }); this.burst(0.04, { vol: 0.05, freq: 3000 }); break;
      case 'wait': this.tone(300, 0.12, { type: 'sine', vol: 0.08, to: 240 }); break;
      case 'bump': this.tone(140, 0.08, { type: 'square', vol: 0.05, filter: { freq: 600 } }); break;
      case 'ready': this.tone(1320, 0.08, { type: 'sine', vol: 0.05 }); this.tone(1760, 0.1, { type: 'sine', vol: 0.04, at: now + 0.06 }); break;
      case 'capture': {
        const k = Math.min(x, 6);
        [0, 4, 7, 12, 16].forEach((iv, i) => this.tone(midi(69 + iv + k * 2), 0.5, { type: 'triangle', vol: 0.12, at: now + i * 0.045 }));
        this.burst(0.6, { vol: 0.25, freq: 400, to: 6000, type: 'bandpass', q: 0.8 });
        this.tone(90, 0.5, { type: 'sine', vol: 0.4, to: 35 });
        break;
      }
      case 'empty': this.tone(660, 0.18, { type: 'triangle', vol: 0.06 }); this.tone(880, 0.2, { type: 'triangle', vol: 0.05, at: now + 0.05 }); break;
      case 'kill': this.burst(0.3, { vol: 0.3, freq: 2400, to: 200, q: 1.5 }); this.tone(220, 0.25, { type: 'square', vol: 0.06, to: 60, filter: { freq: 1200 } }); break;
      case 'hit': this.tone(180, 0.35, { type: 'sawtooth', vol: 0.18, to: 50, filter: { freq: 900 } }); this.burst(0.25, { vol: 0.35, freq: 800, to: 120, type: 'lowpass' }); break;
      case 'block': this.tone(1200, 0.25, { type: 'square', vol: 0.05, filter: { freq: 3000 } }); this.tone(1800, 0.3, { type: 'sine', vol: 0.06, at: now + 0.03 }); break;
      case 'beam': this.tone(1800, 0.35, { type: 'sawtooth', vol: 0.06, to: 180, filter: { freq: 4000 } }); this.burst(0.35, { vol: 0.2, freq: 5000, to: 400 }); break;
      case 'charge': this.tone(300, 0.3, { type: 'sawtooth', vol: 0.03, to: 900, filter: { freq: 1500 } }); break;
      case 'spawn': this.tone(200, 0.4, { type: 'sine', vol: 0.06, to: 600 }); break;
      case 'chomp': this.tone(160, 0.07, { type: 'square', vol: 0.06, filter: { freq: 700 } }); break;
      case 'shard': [88, 95].forEach((n, i) => this.tone(midi(n), 0.18, { type: 'sine', vol: 0.08, at: now + i * 0.06 })); break;
      case 'heal': [76, 79, 84].forEach((n, i) => this.tone(midi(n), 0.25, { type: 'sine', vol: 0.08, at: now + i * 0.07 })); break;
      case 'clear': [72, 76, 79, 84, 88].forEach((n, i) => this.tone(midi(n), 0.6, { type: 'triangle', vol: 0.1, at: now + i * 0.09 })); this.burst(1.2, { vol: 0.12, freq: 6000, type: 'highpass' }); break;
      case 'die': [64, 60, 57, 52].forEach((n, i) => this.tone(midi(n), 0.5, { type: 'sawtooth', vol: 0.07, at: now + i * 0.16, filter: { freq: 1200 } })); this.tone(60, 1.2, { type: 'sine', vol: 0.4, to: 25 }); break;
      case 'ui': this.tone(990, 0.05, { type: 'sine', vol: 0.05 }); break;
      case 'pick': this.tone(midi(84), 0.3, { type: 'triangle', vol: 0.09 }); this.tone(midi(91), 0.4, { type: 'triangle', vol: 0.07, at: now + 0.08 }); break;
    }
  }
}
