// Everything is synthesised: sea swell, gulls, a sparse pentatonic pad, tile sounds.

let ctx = null, master = null, sfxBus = null, ambBus = null;
let growth = 0; // tiles placed this game; the pad fills out as the island grows
let muted = localStorage.getItem('skerry.muted') === '1';
let volume = Number(localStorage.getItem('skerry.volume') ?? 0.45);
const level = () => (muted ? 0 : volume * 0.9);
const SCALE = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25, 739.99, 880, 987.77, 1174.66];

export const isMuted = () => muted;
export const getVolume = () => volume;
export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  localStorage.setItem('skerry.volume', String(volume));
  if (master) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.05);
}
export const setGrowth = (n) => { growth = n; };

export function setMuted(m) {
  muted = m;
  localStorage.setItem('skerry.muted', m ? '1' : '0');
  if (master) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.1);
}

export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = level();
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.connect(master);
  ambBus = ctx.createGain(); ambBus.gain.value = 0.32; ambBus.connect(master);
  startAmbience();
}

function noiseBuffer(seconds, brown = false) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
  }
  return buf;
}

function tone(freq, t0, dur, { type = 'sine', vol = 0.2, attack = 0.005, bus = sfxBus, glide = 0 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(bus);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function pluck(freq, t0, vol = 0.12) {
  tone(freq, t0, 0.9, { type: 'triangle', vol });
  tone(freq * 2, t0, 0.35, { type: 'sine', vol: vol * 0.35 });
}

function thud(t0, vol = 0.5) {
  tone(110, t0, 0.22, { vol, glide: 0.5 });
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(0.25);
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 1.2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol * 0.5, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
  src.connect(f).connect(g).connect(sfxBus);
  src.start(t0);
}

function splash(t0) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(0.9);
  const f = ctx.createBiquadFilter(); f.type = 'lowpass';
  f.frequency.setValueAtTime(3000, t0); f.frequency.exponentialRampToValueAtTime(400, t0 + 0.8);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.85);
  src.connect(f).connect(g).connect(sfxBus);
  src.start(t0);
}

function gull(t0) {
  for (let k = 0; k < 2 + Math.floor(Math.random() * 2); k++) {
    const t = t0 + k * 0.22;
    tone(1500 + Math.random() * 300, t, 0.18, { type: 'sine', vol: 0.025, attack: 0.02, bus: ambBus, glide: 0.72 });
  }
}

// One soft swell of sea against the rocks: rises, falls, and leaves silence behind it.
let waveBuf = null;
function wave(t0) {
  waveBuf = waveBuf || noiseBuffer(5, true);
  const src = ctx.createBufferSource();
  src.buffer = waveBuf;
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 0.3;
  f.frequency.setValueAtTime(220, t0);
  f.frequency.linearRampToValueAtTime(420, t0 + 1.6);
  f.frequency.linearRampToValueAtTime(180, t0 + 4.2);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.05, t0 + 1.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 4.4);
  src.connect(f).connect(g).connect(ambBus);
  src.start(t0, Math.random() * 0.5);
  src.stop(t0 + 4.6);
}

function startAmbience() {
  const swell = () => {
    if (!ctx) return;
    if (ctx.state === 'running') wave(ctx.currentTime + 0.05);
    setTimeout(swell, 8000 + Math.random() * 6000);
  };
  setTimeout(swell, 3000);

  const loop = () => {
    if (!ctx) return;
    const t = ctx.currentTime + 0.05;
    if (Math.random() < 0.4) {
      const n = SCALE[Math.floor(Math.random() * 6)] / 2;
      tone(n, t, 5.5, { type: 'sine', vol: 0.03, attack: 1.6, bus: ambBus });
      tone(n * 1.5, t + 0.4, 5, { type: 'sine', vol: 0.016, attack: 1.8, bus: ambBus });
      // an extra voice for every ten tiles on the island
      for (let v = 0; v < Math.min(3, Math.floor(growth / 10)); v++) {
        tone(SCALE[2 + Math.floor(Math.random() * 7)], t + 0.8 + v * 0.9, 4, { type: 'triangle', vol: 0.012, attack: 1.2, bus: ambBus });
      }
    }
    if (Math.random() < 0.07) gull(t + Math.random() * 2);
    setTimeout(loop, 5000 + Math.random() * 5000);
  };
  setTimeout(loop, 1500);
}

const ready = () => ctx && ctx.state === 'running';

// One sound per moment: a soft knock, plus at most one flourish for the best thing that happened.
export const sfx = {
  rotate() { if (!ready()) return; tone(880, ctx.currentTime, 0.05, { type: 'triangle', vol: 0.02 }); },
  invalid() { if (!ready()) return; tone(180, ctx.currentTime, 0.16, { type: 'triangle', vol: 0.05, glide: 0.8 }); },
  rise() { if (!ready()) return; splash(ctx.currentTime); },
  placement({ fit, streak = 0, questDone = false, closed = false, rankUp = false }) {
    if (!ready()) return;
    const t = ctx.currentTime;
    thud(t, 0.22);
    const s = Math.min(streak, 6); // the streak walks up the scale
    if (rankUp) {
      [0, 2, 4, 7, 9].forEach((n, i) => pluck(SCALE[n], t + 0.35 + i * 0.11, 0.07));
      tone(SCALE[0] / 2, t + 0.35, 2.6, { type: 'sine', vol: 0.06, attack: 0.2 });
    } else if (questDone) {
      [2, 4, 7].forEach((n, i) => pluck(SCALE[n], t + 0.3 + i * 0.1, 0.07));
    } else if (closed) {
      [0, 4, 7].forEach((n) => tone(SCALE[n], t + 0.3, 1.8, { type: 'triangle', vol: 0.035, attack: 0.05 }));
    } else if (fit === 'perfect') {
      pluck(SCALE[3 + s], t + 0.12, 0.07);
      pluck(SCALE[5 + s] || SCALE[10], t + 0.2, 0.05);
    } else if (fit === 'snug') {
      pluck(SCALE[2 + s], t + 0.12, 0.06);
    } else if (fit === 'match') {
      pluck(SCALE[1], t + 0.1, 0.035);
    }
  },
  low() {
    if (!ready()) return;
    const t = ctx.currentTime + 0.2;
    [0, 2, 4].forEach((n) => tone(SCALE[n] / 2, t, 2.6, { type: 'sine', vol: 0.035, attack: 0.3 }));
  },
  achievement() {
    if (!ready()) return;
    const t = ctx.currentTime + 0.1;
    tone(SCALE[9], t, 0.9, { vol: 0.035 }); tone(SCALE[7], t + 0.12, 0.9, { vol: 0.03 });
  },
  end() {
    if (!ready()) return;
    const t = ctx.currentTime;
    [0, 3, 5, 7].forEach((n, i) => tone(SCALE[n], t + i * 0.25, 2.5, { type: 'triangle', vol: 0.045, attack: 0.03 }));
  },
};
