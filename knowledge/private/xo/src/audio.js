// Everything is synthesised: a pentatonic guzheng-ish loop with woodblock and drum,
// little babble voices for speech bubbles, and one short sound per game event.

let ctx = null, master = null, sfxBus = null, musBus = null, voiceBus = null;
let muted = localStorage.getItem('xo.muted') === '1';
export const isMuted = () => muted;
export function setMuted(m) {
  muted = m;
  localStorage.setItem('xo.muted', m ? '1' : '0');
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.05);
}

export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = muted ? 0 : 0.5;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 4;
  master.connect(comp).connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
  musBus = ctx.createGain(); musBus.gain.value = 0.32; musBus.connect(master);
  voiceBus = ctx.createGain(); voiceBus.gain.value = 0.5; voiceBus.connect(master);
  // a touch of room on the music
  const delay = ctx.createDelay(); delay.delayTime.value = 0.23;
  const fb = ctx.createGain(); fb.gain.value = 0.25;
  const wet = ctx.createGain(); wet.gain.value = 0.22;
  musBus.connect(delay).connect(fb).connect(delay);
  delay.connect(wet).connect(master);
  startMusic();
}
const ready = () => ctx && ctx.state === 'running';

let noiseBuf = null;
function noise() {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function tone(f, t0, dur, { type = 'sine', vol = 0.2, attack = 0.004, bus = sfxBus, glide = 0, bend = 0 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(bend ? f * bend : f, t0);
  if (bend) o.frequency.exponentialRampToValueAtTime(f, t0 + 0.04);
  if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(bus);
  o.start(t0); o.stop(t0 + dur + 0.05);
}
function hiss(t0, dur, { vol = 0.2, f = 2000, q = 1, type = 'bandpass', bus = sfxBus, sweep = 0 } = {}) {
  const s = ctx.createBufferSource(); s.buffer = noise();
  const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t0); fl.Q.value = q;
  if (sweep) fl.frequency.exponentialRampToValueAtTime(f * sweep, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(fl).connect(g).connect(bus);
  s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.05);
}
// a plucked string: bright attack bending onto the note, a quick decay and a soft octave
function zheng(f, t0, vol = 0.12, bus = musBus) {
  tone(f, t0, 0.9, { type: 'triangle', vol, bend: 1.03, bus });
  tone(f * 2, t0, 0.35, { type: 'sine', vol: vol * 0.4, bus });
  tone(f * 3, t0, 0.12, { type: 'sine', vol: vol * 0.15, bus });
}

// ---------- music ----------
const N = { A3: 220, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5 };
const MEL = [
  'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5',
  'E5', 'G5', 'A5', 'C6', 'A5', 'G5', 'E5', '-',
  'D5', 'E5', 'G5', 'E5', 'D5', 'C5', 'A4', 'C5',
  'D5', 'E5', 'D5', 'C5', 'A4', 'G4', 'A4', '-',
];
const BASS = ['C4', 'A3', 'D4', 'G4'];
const BOSS_MEL = ['A4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4', '-', 'E5', 'G5', 'E5', 'D5', 'C5', 'D5', 'A4', '-'];
let mus = { on: false, bpm: 104, step: 0, next: 0, boss: false, calm: true };
export function setMusic({ on = mus.on, wave = 1, boss = false, calm = false } = {}) {
  mus.on = on; mus.boss = boss; mus.calm = calm;
  mus.bpm = boss ? 132 : 100 + wave * 3;
}
function startMusic() {
  mus.next = ctx.currentTime + 0.1;
  setInterval(() => {
    if (!ctx || ctx.state !== 'running') return;
    while (mus.next < ctx.currentTime + 0.15) { if (mus.on) beat(mus.next, mus.step); mus.step++; mus.next += 60 / mus.bpm / 2; }
  }, 30);
}
function beat(t, s) {
  const i = s % 32;
  if (mus.boss) {
    const n = BOSS_MEL[s % 16];
    if (n !== '-') zheng(N[n] * (s % 32 >= 16 ? 1 : 1), t, 0.1);
    if (s % 4 === 0) { tone(70, t, 0.25, { vol: 0.35, glide: 0.5, bus: musBus }); }
    if (s % 8 === 4) hiss(t, 0.12, { vol: 0.12, f: 1800, q: 0.7, bus: musBus });
    if (s % 2 === 1) hiss(t, 0.03, { vol: 0.05, f: 7000, q: 1, type: 'highpass', bus: musBus });
    if (s % 16 === 0) tone(N.A3 / 2, t, 1.6, { type: 'sawtooth', vol: 0.04, attack: 0.05, bus: musBus });
    return;
  }
  const n = MEL[i];
  if (n !== '-' && !(mus.calm && s % 2)) zheng(N[n], t, mus.calm ? 0.07 : 0.1);
  if (s % 8 === 0) tone(N[BASS[(s / 8 | 0) % 4]] / 2, t, 0.9, { type: 'sine', vol: 0.18, bus: musBus });
  if (mus.calm) return;
  if (s % 4 === 0) tone(90, t, 0.18, { vol: 0.22, glide: 0.5, bus: musBus });
  if (s % 4 === 2) { tone(1200, t, 0.05, { type: 'square', vol: 0.025, bus: musBus }); hiss(t, 0.04, { vol: 0.05, f: 2600, q: 6, bus: musBus }); }
  if (s % 16 === 14) tone(1500, t, 0.04, { type: 'square', vol: 0.02, bus: musBus });
}

// ---------- voices ----------
const VOICE_SCALE = [587, 659, 784, 880, 988, 1175];
let voiceUntil = 0;
export function babble(text, pitch = 1) {
  if (!ready()) return;
  const t0 = Math.max(ctx.currentTime, voiceUntil);
  const chars = [...text].filter((c) => !/[\s，。！？、…～!?.,]/.test(c)).slice(0, 12);
  chars.forEach((c, i) => {
    const f = VOICE_SCALE[(c.charCodeAt(0) + i) % VOICE_SCALE.length] * pitch;
    tone(f, t0 + i * 0.065, 0.06, { type: 'sine', vol: 0.06, bus: voiceBus, glide: 1.12 });
  });
  voiceUntil = t0 + chars.length * 0.065;
}

// ---------- sound effects ----------
let lastShoot = 0, lastHit = 0, lastGem = 0;
export function sfx(name) {
  if (!ready()) return;
  const t = ctx.currentTime;
  switch (name) {
    case 'shoot': if (t - lastShoot < 0.05) return; lastShoot = t; tone(900, t, 0.06, { type: 'square', vol: 0.03, glide: 0.5 }); hiss(t, 0.04, { vol: 0.04, f: 4000 }); break;
    case 'hit': if (t - lastHit < 0.03) return; lastHit = t; tone(320 + Math.random() * 80, t, 0.05, { type: 'triangle', vol: 0.05 }); break;
    case 'kill': tone(520, t, 0.09, { type: 'square', vol: 0.04, glide: 1.6 }); hiss(t, 0.1, { vol: 0.06, f: 1500 }); break;
    case 'bossdown': [0, 0.12, 0.24, 0.36].forEach((d, i) => zheng([N.C5, N.E5, N.G5, N.C6][i], t + d, 0.12, sfxBus)); tone(60, t, 1.2, { vol: 0.4, glide: 0.5 }); break;
    case 'gem': if (t - lastGem < 0.03) return; lastGem = t; tone(1400 + Math.random() * 400, t, 0.06, { type: 'sine', vol: 0.03 }); break;
    case 'levelup': [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, t + i * 0.07, 0.25, { type: 'triangle', vol: 0.07 })); break;
    case 'waveEnd': [N.G4, N.C5, N.E5, N.G5].forEach((f, i) => zheng(f, t + i * 0.09, 0.1, sfxBus)); break;
    case 'win': [N.C5, N.D5, N.E5, N.G5, N.A5, N.C6].forEach((f, i) => zheng(f, t + i * 0.12, 0.12, sfxBus)); break;
    case 'over': [N.A4, N.G4, N.E4, N.D4].forEach((f, i) => tone(f, t + i * 0.18, 0.5, { type: 'triangle', vol: 0.08 })); break;
    case 'hurt': tone(200, t, 0.18, { type: 'sawtooth', vol: 0.07, glide: 0.5 }); break;
    case 'dodge': hiss(t, 0.15, { vol: 0.08, f: 3000, sweep: 0.3 }); break;
    case 'shield': tone(1800, t, 0.2, { vol: 0.06, glide: 0.4 }); hiss(t, 0.2, { vol: 0.08, f: 5000 }); break;
    case 'shieldUp': tone(1200, t, 0.15, { vol: 0.04, glide: 1.5 }); break;
    case 'aegis': [N.C5, N.G5, N.C6].forEach((f, i) => tone(f, t + i * 0.1, 0.6, { type: 'triangle', vol: 0.08 })); break;
    case 'sweet': tone(900, t, 0.4, { vol: 0.07, glide: 1.8 }); tone(1350, t + 0.05, 0.35, { vol: 0.04, glide: 1.6 }); break;
    case 'plant': tone(300, t, 0.08, { type: 'square', vol: 0.04 }); tone(300, t + 0.12, 0.08, { type: 'square', vol: 0.04 }); break;
    case 'boom': tone(80, t, 0.5, { vol: 0.4, glide: 0.4 }); hiss(t, 0.5, { vol: 0.25, f: 900, type: 'lowpass', sweep: 0.2 }); break;
    case 'hubby': hiss(t, 0.6, { vol: 0.15, f: 600, sweep: 4 }); tone(440, t, 0.2, { type: 'square', vol: 0.04 }); tone(660, t + 0.12, 0.25, { type: 'square', vol: 0.04 }); break;
    case 'moo': tone(140, t, 0.6, { type: 'sawtooth', vol: 0.06, glide: 0.7, attack: 0.08 }); break;
    case 'baa': tone(420, t, 0.3, { type: 'sawtooth', vol: 0.03, glide: 0.9 }); break;
    case 'ult': hiss(t, 1.2, { vol: 0.2, f: 300, sweep: 10 }); [N.A4, N.C5, N.E5, N.A5].forEach((f, i) => tone(f, t + i * 0.06, 1, { type: 'sawtooth', vol: 0.035, attack: 0.02 })); tone(55, t, 1.2, { vol: 0.35, glide: 0.6 }); break;
    case 'eshoot': tone(260, t, 0.08, { type: 'square', vol: 0.025, glide: 0.7 }); break;
    case 'ping': tone(1600, t, 0.08, { vol: 0.04 }); tone(1600, t + 0.11, 0.08, { vol: 0.04 }); break;
    case 'pingland': tone(500, t, 0.15, { type: 'triangle', vol: 0.06, glide: 0.5 }); break;
    case 'spit': tone(700, t, 0.08, { vol: 0.04, glide: 0.5 }); break;
    case 'throw': hiss(t, 0.2, { vol: 0.08, f: 2500, sweep: 0.5 }); break;
    case 'slam': tone(55, t, 0.45, { vol: 0.45, glide: 0.5 }); hiss(t, 0.3, { vol: 0.15, f: 400, type: 'lowpass' }); break;
    case 'reroll': hiss(t, 0.25, { vol: 0.08, f: 1500, sweep: 3 }); break;
    case 'pick': [N.E5, N.A5].forEach((f, i) => tone(f, t + i * 0.06, 0.3, { type: 'triangle', vol: 0.07 })); break;
    case 'star': tone(1800, t, 0.3, { vol: 0.05, glide: 0.3 }); hiss(t, 0.3, { vol: 0.1, f: 3000, sweep: 0.3 }); break;
    case 'gallop': [0, 0.12, 0.3, 0.42].forEach((d) => tone(180, t + d, 0.06, { type: 'triangle', vol: 0.08, glide: 0.6 })); tone(520, t, 0.5, { type: 'sawtooth', vol: 0.03, glide: 1.4, attack: 0.05 }); break;
    case 'streak': [N.A4, N.E5, N.A5].forEach((f) => tone(f, t, 0.9, { type: 'sawtooth', vol: 0.035, attack: 0.02 })); tone(N.A3 / 2, t, 0.9, { vol: 0.25, glide: 0.8 }); hiss(t, 0.4, { vol: 0.08, f: 1200, sweep: 3 }); break;
    case 'elite': tone(98, t, 1.4, { type: 'sawtooth', vol: 0.06, attack: 0.05 }); tone(147, t, 1.4, { type: 'sawtooth', vol: 0.04, attack: 0.05 }); hiss(t, 1.2, { vol: 0.06, f: 300, type: 'lowpass' }); break;
    case 'pickup': [N.G5, N.C6, N.E5 * 2].forEach((f, i) => tone(f, t + i * 0.05, 0.25, { type: 'triangle', vol: 0.06 })); break;
    case 'chest': [N.C5, N.E5, N.G5, N.C6, N.E5 * 2].forEach((f, i) => zheng(f, t + i * 0.07, 0.12, sfxBus)); tone(65, t, 0.8, { vol: 0.3, glide: 0.6 }); break;
    case 'pickupSpawn': tone(2200, t, 0.15, { vol: 0.025, glide: 1.3 }); tone(2900, t + 0.06, 0.15, { vol: 0.02 }); break;
    case 'rifle': hiss(t, 0.06, { vol: 0.12, f: 2500, q: 0.6 }); tone(160, t, 0.05, { type: 'square', vol: 0.04, glide: 0.5 }); break;
    case 'flash': tone(3200, t, 1.2, { vol: 0.03 }); hiss(t, 0.15, { vol: 0.15, f: 5000 }); break;
    case 'tide': hiss(t, 1.4, { vol: 0.18, f: 400, type: 'lowpass', sweep: 3 }); hiss(t + 0.3, 1.2, { vol: 0.08, f: 3000, sweep: 0.4 }); break;
    case 'bell': tone(2100, t, 0.5, { vol: 0.06 }); tone(2100, t + 0.14, 0.6, { vol: 0.06 }); tone(2650, t, 0.4, { vol: 0.02 }); break;
    case 'click': tone(1000, t, 0.04, { type: 'triangle', vol: 0.04 }); break;
  }
}
