import { G } from './state.js';
import { dist, clamp } from './util.js';

// Everything is synthesised at runtime — no audio files.
export class Audio {
  constructor() { this.ctx = null; this.muted = false; this.radioOn = true; this.station = 0; this.nextBeat = 0; this.beat = 0; }

  init() {
    if (this.ctx) return;
    try {
      const C = window.AudioContext || window.webkitAudioContext; const ctx = this.ctx = new C();
      this.master = ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.8; this.master.connect(ctx.destination);
      this.nbuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = this.nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // engine
      this.eng = ctx.createOscillator(); this.eng.type = 'sawtooth'; this.eng2 = ctx.createOscillator(); this.eng2.type = 'square';
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; this.engF = f; this.engG = ctx.createGain(); this.engG.gain.value = 0;
      this.eng.connect(f); this.eng2.connect(f); f.connect(this.engG); this.engG.connect(this.master); this.eng.start(); this.eng2.start();
      // siren
      this.sir = ctx.createOscillator(); this.sir.type = 'sawtooth'; this.sirG = ctx.createGain(); this.sirG.gain.value = 0; this.sir.connect(this.sirG); this.sirG.connect(this.master); this.sir.start();
      // heli thump
      this.hel = ctx.createOscillator(); this.hel.type = 'sawtooth'; this.hel.frequency.value = 38; const hf = ctx.createBiquadFilter(); hf.frequency.value = 160; this.helG = ctx.createGain(); this.helG.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 13; const lg = ctx.createGain(); lg.gain.value = 0.5; lfo.connect(lg); lg.connect(this.helG.gain); lfo.start();
      this.hel.connect(hf); hf.connect(this.helG); this.helG.connect(this.master); this.hel.start();
      // music bus
      this.mus = ctx.createGain(); this.mus.gain.value = 0; this.mus.connect(this.master);
    } catch (e) { this.ctx = null; }
  }
  resume() { this.init(); if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.8; }

  vol(x, z, r = 220) { if (x === undefined) return 1; return clamp(1 - dist(G.player.x, G.player.z, x, z) / r, 0, 1) ** 1.5; }
  noise(dur, freq, g, type = 'lowpass', q = 1) {
    const c = this.ctx; if (!c || g < 0.01) return;
    const s = c.createBufferSource(); s.buffer = this.nbuf; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const o = c.createGain(), t = c.currentTime; o.gain.setValueAtTime(g, t); o.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(o); o.connect(this.master); s.start(t); s.stop(t + dur);
  }
  tone(freq, dur, g, type = 'square', slide = 0) {
    const c = this.ctx; if (!c || g < 0.01) return;
    const o = c.createOscillator(); o.type = type; const t = c.currentTime; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    const v = c.createGain(); v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(v); v.connect(this.master); o.start(t); o.stop(t + dur);
  }

  shot(id, x, z) {
    const v = this.vol(x, z, 320);
    if (id === 'rpg') { this.noise(0.5, 700, 0.5 * v); this.tone(120, 0.4, 0.2 * v, 'sawtooth', -60); }
    else if (id === 'shotgun') { this.noise(0.28, 1400, 0.9 * v); this.noise(0.1, 4000, 0.4 * v, 'highpass'); this.tone(90, 0.2, 0.3 * v, 'square', -50); }
    else if (id === 'smg') { this.noise(0.09, 2600, 0.45 * v, 'bandpass', 0.8); this.tone(160, 0.06, 0.12 * v, 'square', -80); }
    else { this.noise(0.14, 2200, 0.55 * v, 'bandpass', 0.7); this.tone(130, 0.09, 0.2 * v, 'square', -70); }
  }
  boom(x, z) { const v = this.vol(x, z, 520); this.noise(1.4, 420, 1.3 * v); this.tone(60, 0.8, 0.5 * v, 'sine', -35); }
  crash(x, z, imp = 10) { const v = this.vol(x, z, 150) * clamp(imp / 20, 0.2, 1); this.noise(0.3, 900, 0.7 * v); this.tone(80, 0.15, 0.3 * v, 'square', -30); }
  thud(x, z) { const v = this.vol(x, z, 60); this.noise(0.12, 300, 0.7 * v); }
  hurt() { this.noise(0.18, 500, 0.5); }
  door() { this.noise(0.1, 700, 0.4); this.tone(200, 0.06, 0.15, 'square', -80); }
  cash() { this.tone(988, 0.08, 0.14, 'sine'); setTimeout(() => this.tone(1319, 0.14, 0.14, 'sine'), 70); }
  sting() { this.tone(110, 1.4, 0.35, 'sawtooth', -60); this.tone(104, 1.4, 0.3, 'square', -50); }
  horn(x, z) { const v = this.vol(x, z, 200); this.tone(330, 0.4, 0.2 * v, 'square'); this.tone(415, 0.4, 0.16 * v, 'square'); }

  /* ---------- procedural radio: soft pads + plucks, no drums or bass thump ---------- */
  static STATIONS = ['Chill FM 98.7', 'Sunset Jazz 88.1', 'radio off'];
  toggleRadio() {
    this.station = (this.station + 1) % 3; this.radioOn = this.station < 2;
    return Audio.STATIONS[this.station];
  }
  scheduleMusic() {
    const c = this.ctx; if (!c || this.station >= 2 || this.muted) return;
    const chill = this.station === 0, step = 60 / (chill ? 74 : 92) / 2; // eighth notes
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const prog = chill ? [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]] : [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [45, 49, 52, 55]];
    while (this.nextBeat < c.currentTime + 0.3) {
      const t = Math.max(this.nextBeat, c.currentTime), b = this.beat, bar = Math.floor(b / 16) % 4, s = b % 16, chord = prog[bar];
      const voice = (f, dur, peak, type, cutoff, attack) => {
        const o = c.createOscillator(); o.type = type; o.frequency.value = f;
        const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cutoff;
        const v = c.createGain(); v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(peak, t + attack); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(fl); fl.connect(v); v.connect(this.mus); o.start(t); o.stop(t + dur + 0.05);
      };
      if (s === 0) for (const m of chord) voice(hz(m), step * 15, 0.045, 'triangle', 900, 0.9); // slow-swelling pad
      if (chill) {
        const pent = [0, 2, 4, 7, 9]; // gentle pentatonic melody
        if ((s % 4 === 2 || s === 13) && Math.random() < 0.55) voice(hz(chord[0] + 24 + pent[Math.floor(Math.random() * 5)]), 1.6, 0.05, 'sine', 3000, 0.01);
        if (s === 8) voice(hz(chord[0] - 12), step * 7, 0.05, 'sine', 400, 0.3); // soft sub-pad, no attack
      } else {
        if (s % 2 === 0) voice(hz(chord[(s / 2) % 4] + 12), 0.9, 0.055, 'triangle', 2200, 0.008); // rolling electric-piano arpeggio
        if ((s === 6 || s === 14) && Math.random() < 0.6) voice(hz(chord[3] + 24), 0.7, 0.04, 'sine', 3200, 0.01);
        if (s === 0) voice(hz(chord[0] - 12), step * 6, 0.07, 'triangle', 420, 0.05);
      }
      if (s % 2 === 1) { // brushed shaker
        const ns = c.createBufferSource(); ns.buffer = this.nbuf; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500;
        const v = c.createGain(); v.gain.setValueAtTime(0.012, t); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.07); ns.connect(f); f.connect(v); v.connect(this.mus); ns.start(t); ns.stop(t + 0.08);
      }
      this.nextBeat += step; this.beat++;
    }
  }

  update(dt) {
    const c = this.ctx; if (!c) return; const p = G.player, car = p.car, t = c.currentTime;
    if (this.nextBeat === 0) this.nextBeat = t + 0.1;
    if (car && G.state === 'play') this.scheduleMusic();
    if (this.mus) this.mus.gain.setTargetAtTime(this.radioOn && car && G.state === 'play' ? 0.5 : 0, t, 0.5); // the radio only plays inside a vehicle
    if (car && !car.dead && G.state === 'play') {
      const max = car.def.max, gears = 5, r = clamp(Math.abs(car.fw) / max, 0, 1) * gears, gear = Math.min(gears - 1, Math.floor(r)), frac = r - gear;
      const rpm = 0.25 + frac * 0.75, f = 38 + rpm * (70 + gear * 6) * (car.type === 'truck' ? 0.7 : 1);
      this.eng.frequency.setTargetAtTime(f, t, 0.05); this.eng2.frequency.setTargetAtTime(f * 0.502, t, 0.05);
      this.engF.frequency.setTargetAtTime(260 + rpm * 700 + (car.thr > 0 ? 300 : 0), t, 0.08);
      this.engG.gain.setTargetAtTime(0.07 + rpm * 0.05 + (car.thr > 0 ? 0.04 : 0), t, 0.08);
      if (car.horn > 0 && !car._hornSnd) { car._hornSnd = true; this.horn(car.x, car.z); }
      if (car.horn <= 0) car._hornSnd = false;
    } else this.engG.gain.setTargetAtTime(0, t, 0.1);
    let best = 1e9; for (const k of G.traffic.cars) if (k.siren) { const d = dist(k.x, k.z, p.x, p.z); if (d < best) best = d; }
    this.sirG.gain.setTargetAtTime(best < 260 ? 0.03 * (1 - best / 260) : 0, t, 0.1);
    if (best < 260) { const ph = (G.time * 0.8) % 1; this.sir.frequency.setTargetAtTime(700 + Math.abs(Math.sin(ph * Math.PI)) * 500, t, 0.03); }
    const h = G.police.heli; this.helG.gain.setTargetAtTime(h ? 0.5 * this.vol(h.x, h.z, 300) : 0, t, 0.2);
  }
}
