import { getItem, setItem } from './storage';
// All sound is synthesized with WebAudio — opera percussion (梆子, 小锣, 大锣, 钹), a dice cup,
// coins, and an optional plucked-zither ambience in the pentatonic scale.

let ac: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let reverb: ConvolverNode | null = null;
let muted = getItem('diceSmith.muted') === '1';
let musicOn = getItem('diceSmith.music') !== '0';

function ensure(): AudioContext | null {
  if (muted) return null;
  if (!ac) {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ac = new Ctor();
    master = ac.createGain();
    master.gain.value = 0.6;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14;
    master.connect(comp).connect(ac.destination);
    // A small hall: lanterns and wooden stalls.
    reverb = ac.createConvolver();
    const len = ac.sampleRate * 1.6;
    const ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    reverb.buffer = ir;
    const wet = ac.createGain();
    wet.gain.value = 0.22;
    reverb.connect(wet).connect(master);
    musicBus = ac.createGain();
    musicBus.gain.value = 0.32;
    musicBus.connect(master);
    musicBus.connect(reverb);
  }
  if (ac.state === 'suspended') void ac.resume();
  return ac;
}

export function isMuted() {
  return muted;
}

export function setMuted(m: boolean) {
  muted = m;
  setItem('diceSmith.muted', m ? '1' : '0');
  if (master) master.gain.value = m ? 0 : 0.6;
}

export function isMusicOn() {
  return musicOn;
}

export function setMusic(on: boolean) {
  musicOn = on;
  setItem('diceSmith.music', on ? '1' : '0');
  if (on) startMusic();
}

let noiseBuf: AudioBuffer | null = null;
function noise(a: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

function env(a: AudioContext, t: number, peak: number, attack: number, decay: number): GainNode {
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

function connect(node: AudioNode, wetToo = false, bus?: AudioNode) {
  node.connect(bus ?? master!);
  if (wetToo && reverb) node.connect(reverb);
}

function burst(a: AudioContext, t: number, o: { freq: number; q: number; peak: number; decay: number; type?: BiquadFilterType; wet?: boolean }) {
  const src = a.createBufferSource();
  src.buffer = noise(a);
  const f = a.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.value = o.freq;
  f.Q.value = o.q;
  const g = env(a, t, o.peak, 0.002, o.decay);
  src.connect(f).connect(g);
  connect(g, o.wet);
  src.start(t, Math.random() * 0.5);
  src.stop(t + o.decay + 0.05);
}

function tone(a: AudioContext, t: number, o: { freq: number; to?: number; type?: OscillatorType; peak: number; decay: number; attack?: number; wet?: boolean; bus?: AudioNode }) {
  const osc = a.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.decay);
  const g = env(a, t, o.peak, o.attack ?? 0.003, o.decay);
  osc.connect(g);
  connect(g, o.wet, o.bus);
  osc.start(t);
  osc.stop(t + (o.attack ?? 0.003) + o.decay + 0.1);
}

/** Inharmonic metal: gongs and cymbals. */
function metal(a: AudioContext, t: number, base: number, partials: number[], peak: number, decay: number, bend = 1) {
  partials.forEach((p, k) => tone(a, t, { freq: base * p, to: base * p * bend, type: 'sine', peak: peak / (k + 1.2), decay: decay * (1 - k * 0.08), wet: true }));
}

function clack(a: AudioContext, t: number, vol = 1) {
  const f = 1500 + Math.random() * 1500;
  burst(a, t, { freq: f, q: 7, peak: 0.32 * vol, decay: 0.045 });
  tone(a, t, { freq: f / 3.3, type: 'triangle', peak: 0.1 * vol, decay: 0.04 });
}

export const sfx = {
  /** Dice rattling in a cup, then tumbling out onto lacquer. */
  roll(n = 3) {
    const a = ensure();
    if (!a) return;
    const t0 = a.currentTime;
    for (let i = 0; i < 9; i++) clack(a, t0 + i * 0.035 + Math.random() * 0.02, 0.45);
    const hits = 3 + n * 3;
    for (let i = 0; i < hits; i++) {
      const p = i / hits;
      clack(a, t0 + 0.34 + p * p * 0.5 + Math.random() * 0.03, 1 - p * 0.7);
    }
  },
  hold() {
    const a = ensure();
    if (!a) return;
    tone(a, a.currentTime, { freq: 660, type: 'triangle', peak: 0.12, decay: 0.08 });
  },
  flip() {
    const a = ensure();
    if (!a) return;
    const t = a.currentTime;
    clack(a, t, 0.8);
    clack(a, t + 0.12, 0.6);
  },
  /** 梆子: the woodblock tick that climbs with each chip. */
  tick(step: number) {
    const a = ensure();
    if (!a) return;
    const t = a.currentTime;
    const f = 700 * Math.pow(2, Math.min(step, 24) / 14);
    tone(a, t, { freq: f, type: 'sine', peak: 0.32, decay: 0.07 });
    burst(a, t, { freq: f * 1.6, q: 10, peak: 0.16, decay: 0.03 });
  },
  /** 小锣: mult. */
  gong(step = 0) {
    const a = ensure();
    if (!a) return;
    metal(a, a.currentTime, 520 + step * 18, [1, 1.47, 2.09, 2.76], 0.16, 0.5, 1.12);
  },
  /** 钹: ×mult. */
  cymbal() {
    const a = ensure();
    if (!a) return;
    const t = a.currentTime;
    burst(a, t, { freq: 6000, q: 0.6, peak: 0.35, decay: 0.55, type: 'highpass', wet: true });
    metal(a, t, 410, [1, 2.4, 3.9, 5.3], 0.1, 0.6);
  },
  /** 大锣 + 堂鼓: the final score lands. */
  bigGong(size = 1) {
    const a = ensure();
    if (!a) return;
    const t = a.currentTime;
    tone(a, t, { freq: 90, to: 55, peak: 0.7, decay: 0.35 });
    metal(a, t + 0.02, 150, [1, 1.52, 2.21, 2.93, 3.6], 0.3 * Math.min(1.5, size), 2.2, 0.9);
    burst(a, t, { freq: 1200, q: 0.5, peak: 0.25, decay: 0.8, type: 'lowpass', wet: true });
  },
  coin() {
    const a = ensure();
    if (!a) return;
    const t = a.currentTime;
    tone(a, t, { freq: 1976, type: 'square', peak: 0.05, decay: 0.07 });
    tone(a, t + 0.06, { freq: 2637, type: 'square', peak: 0.05, decay: 0.2 });
  },
  shatter() {
    const a = ensure();
    if (!a) return;
    const t = a.currentTime;
    for (let i = 0; i < 12; i++) burst(a, t + Math.random() * 0.25, { freq: 3000 + Math.random() * 5000, q: 12, peak: 0.12, decay: 0.05 });
  },
  click() {
    const a = ensure();
    if (!a) return;
    clack(a, a.currentTime, 0.5);
  },
  deny() {
    const a = ensure();
    if (!a) return;
    tone(a, a.currentTime, { freq: 160, type: 'triangle', peak: 0.16, decay: 0.12 });
  },
  carve() {
    const a = ensure();
    if (!a) return;
    const t = a.currentTime;
    for (let i = 0; i < 3; i++) {
      const src = a.createBufferSource();
      src.buffer = noise(a);
      const f = a.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 3;
      f.frequency.setValueAtTime(1200, t + i * 0.12);
      f.frequency.exponentialRampToValueAtTime(4500, t + i * 0.12 + 0.09);
      const g = env(a, t + i * 0.12, 0.28, 0.01, 0.09);
      src.connect(f).connect(g);
      connect(g);
      src.start(t + i * 0.12);
      src.stop(t + i * 0.12 + 0.14);
    }
    clack(a, t + 0.4, 0.8);
  },
  /** 开场锣鼓: a short drum-and-gong flourish when an opponent takes the stage. */
  curtain() {
    const a = ensure();
    if (!a) return;
    const t = a.currentTime;
    [0, 0.14, 0.24, 0.32, 0.38].forEach((d, i) => tone(a, t + d, { freq: 120 - i * 4, to: 60, peak: 0.45, decay: 0.16 }));
    setTimeout(() => sfx.gong(4), 520);
  },
  win() {
    const a = ensure();
    if (!a) return;
    const t = a.currentTime;
    [523, 587, 659, 784, 880].forEach((f, i) => tone(a, t + i * 0.09, { freq: f, type: 'triangle', peak: 0.12, decay: 0.7, wet: true }));
    setTimeout(() => sfx.bigGong(0.8), 450);
  },
  lose() {
    const a = ensure();
    if (!a) return;
    const t = a.currentTime;
    [440, 392, 330, 294].forEach((f, i) => tone(a, t + i * 0.28, { freq: f, type: 'triangle', peak: 0.13, decay: 0.9, wet: true }));
  },
  buy() {
    sfx.coin();
  },
};

// ---------- music: sparse zither plucks over a soft drone ----------

const PENTA = [0, 2, 4, 7, 9];
let musicTimer: ReturnType<typeof setTimeout> | null = null;

function pluck(a: AudioContext, t: number, freq: number, vol: number) {
  // Karplus-ish: a bright partial that dies fast plus a body tone.
  tone(a, t, { freq, type: 'triangle', peak: 0.18 * vol, decay: 1.6, bus: musicBus! });
  tone(a, t, { freq: freq * 2, type: 'sine', peak: 0.06 * vol, decay: 0.5, bus: musicBus! });
  tone(a, t, { freq: freq * 3.01, type: 'sine', peak: 0.025 * vol, decay: 0.25, bus: musicBus! });
}

export function startMusic() {
  if (musicTimer || !musicOn) return;
  const step = () => {
    musicTimer = null;
    if (!musicOn || muted) return;
    const a = ensure();
    if (!a) return;
    const root = 196; // G3
    const t = a.currentTime;
    const phrase = 2 + Math.floor(Math.random() * 4);
    let deg = Math.floor(Math.random() * 5);
    for (let i = 0; i < phrase; i++) {
      deg = Math.max(0, Math.min(9, deg + [-2, -1, 1, 1, 2][Math.floor(Math.random() * 5)]));
      const semis = PENTA[deg % 5] + 12 * Math.floor(deg / 5);
      pluck(a, t + i * (0.22 + Math.random() * 0.25), root * Math.pow(2, semis / 12), 0.7 + Math.random() * 0.3);
    }
    musicTimer = setTimeout(step, 2600 + Math.random() * 3800);
  };
  musicTimer = setTimeout(step, 800);
}
