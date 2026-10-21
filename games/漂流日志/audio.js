'use strict';
/* 漂流日志 · 程序化音频（WebAudio，无外部资源）
 * 环境声：海浪 / 雨 / 风暴风声；音乐：缓慢的氛围和弦；音效：各类交互反馈
 */
const SETTINGS_KEY = 'driftlog_settings';
const SETTINGS = Object.assign({ vol: .7, music: true, amb: true, sfx: true, tips: true, shake: true }, (() => { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch (e) { return {}; } })());
function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS)); } catch (e) { } AUDIO.apply(); }

const AUDIO = (() => {
  let ac = null, master, sfxG, ambG, musG, noise;
  const amb = {};
  let chordTimer = null, mood = 'day';
  function g(dst, v = 1) { const n = ac.createGain(); n.gain.value = v; n.connect(dst); return n; }
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = g(ac.destination, 0); sfxG = g(master, .9); ambG = g(master, .55); musG = g(master, .32);
    const len = ac.sampleRate * 2; noise = ac.createBuffer(1, len, ac.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const loop = (filterType, freq, q = .7) => {
      const src = ac.createBufferSource(); src.buffer = noise; src.loop = true;
      const f = ac.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
      const gg = g(ambG, 0); src.connect(f); f.connect(gg); src.start(); return { f, g: gg };
    };
    amb.sea = loop('lowpass', 420); amb.rain = loop('highpass', 1800); amb.wind = loop('bandpass', 500, 1.2);
    // 海浪起伏
    const lfo = ac.createOscillator(); lfo.frequency.value = .11; const lg = ac.createGain(); lg.gain.value = .12; lfo.connect(lg); lg.connect(amb.sea.g.gain); lfo.start();
    const lfo2 = ac.createOscillator(); lfo2.frequency.value = .23; const lg2 = ac.createGain(); lg2.gain.value = 220; lfo2.connect(lg2); lg2.connect(amb.wind.f.frequency); lfo2.start();
    amb.sea.g.gain.value = .2;
    startMusic(); apply();
  }
  function apply() {
    if (!ac) return;
    const t = ac.currentTime;
    master.gain.setTargetAtTime(SETTINGS.vol, t, .1);
    sfxG.gain.setTargetAtTime(SETTINGS.sfx ? .9 : 0, t, .05);
    ambG.gain.setTargetAtTime(SETTINGS.amb ? .55 : 0, t, .3);
    musG.gain.setTargetAtTime(SETTINGS.music ? .32 : 0, t, .5);
  }
  function setScene(kind, weather) {
    if (!ac) return;
    const t = ac.currentTime, rain = weather === 'rain' ? .25 : weather === 'storm' ? .5 : 0, wind = weather === 'storm' ? .35 : weather === 'rain' ? .08 : .02;
    amb.sea.g.gain.setTargetAtTime(kind === 'city' ? .05 : .22, t, 1);
    amb.rain.g.gain.setTargetAtTime(kind === 'city' ? 0 : rain, t, 1.2);
    amb.wind.g.gain.setTargetAtTime(kind === 'city' ? 0 : wind, t, 1.2);
  }
  // 氛围音乐：D 小调 / F 大调交替的长音和弦
  const CHORDS = { day: [[146.8, 220, 293.7, 349.2], [174.6, 261.6, 349.2, 440], [130.8, 196, 261.6, 329.6], [146.8, 220, 277.2, 349.2]],
    night: [[110, 164.8, 220, 261.6], [98, 146.8, 196, 233.1], [87.3, 130.8, 174.6, 220], [103.8, 155.6, 207.7, 246.9]],
    danger: [[73.4, 110, 155.6], [77.8, 116.5, 155.6], [73.4, 103.8, 146.8], [69.3, 103.8, 138.6]] };
  let ci = 0;
  function playChord() {
    if (!ac) return;
    const set = CHORDS[mood] || CHORDS.day, ch = set[ci++ % set.length], t = ac.currentTime, dur = mood === 'danger' ? 4 : 8;
    ch.forEach((f, i) => {
      const o = ac.createOscillator(); o.type = mood === 'danger' ? 'sawtooth' : i % 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 8;
      const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = mood === 'danger' ? 500 : 1400;
      const gg = ac.createGain(); gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(.05 / (1 + i * .3), t + dur * .35); gg.gain.linearRampToValueAtTime(0, t + dur * 1.05);
      o.connect(fl); fl.connect(gg); gg.connect(musG); o.start(t); o.stop(t + dur * 1.1);
    });
    // 偶尔的高音铃声
    if (mood !== 'danger' && Math.random() < .6) setTimeout(() => tone(ch[2] * 2, .6, 'sine', .025, musG), 1500 + Math.random() * 3000);
    chordTimer = setTimeout(playChord, dur * 1000);
  }
  function startMusic() { if (!chordTimer) playChord(); }
  function setMood(m) { mood = m; }
  // ---- 音效基元 ----
  function tone(freq, dur, type = 'sine', vol = .2, dst, f2) {
    if (!ac) return; const t = ac.currentTime, o = ac.createOscillator(), gg = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    gg.gain.setValueAtTime(vol, t); gg.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(gg); gg.connect(dst || sfxG); o.start(t); o.stop(t + dur + .02);
  }
  function burst(dur, type, freq, vol = .3, delay = 0, f2) {
    if (!ac) return; const t = ac.currentTime + delay, s = ac.createBufferSource(); s.buffer = noise;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const gg = ac.createGain(); gg.gain.setValueAtTime(vol, t); gg.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(gg); gg.connect(sfxG); s.start(t, Math.random()); s.stop(t + dur + .02);
  }
  const SFX = {
    click: () => tone(900, .05, 'sine', .08),
    coin: () => { tone(1320, .08, 'square', .05); setTimeout(() => tone(1760, .12, 'square', .05), 70); },
    build: () => { for (let i = 0; i < 3; i++) burst(.07, 'bandpass', 380, .5, i * .13); },
    splash: () => burst(.6, 'lowpass', 1800, .5, 0, 160),
    harpoon: () => { burst(.12, 'highpass', 2500, .25); tone(700, .18, 'triangle', .15, null, 180); },
    hit: () => tone(140, .2, 'sine', .35, null, 60),
    monster: () => { tone(70, .7, 'sawtooth', .12, null, 45); burst(.6, 'lowpass', 300, .2); },
    alarm: () => { tone(440, .22, 'square', .07); setTimeout(() => tone(330, .3, 'square', .07), 240); setTimeout(() => tone(440, .22, 'square', .07), 560); },
    fish: () => tone(320, .18, 'sine', .2, null, 760),
    eat: () => { for (let i = 0; i < 3; i++) burst(.05, 'bandpass', 1800, .2, i * .09); },
    drink: () => { tone(500, .1, 'sine', .15, null, 900); setTimeout(() => tone(600, .1, 'sine', .12, null, 1000), 120); },
    thunder: () => burst(2.2, 'lowpass', 260, .7, 0, 60),
    good: () => [523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, .25, 'triangle', .09), i * 90)),
    bad: () => [392, 311, 262].forEach((f, i) => setTimeout(() => tone(f, .3, 'triangle', .09), i * 110)),
    page: () => burst(.25, 'bandpass', 3000, .12),
    walk: () => burst(.05, 'lowpass', 600, .08),
    ach: () => [659, 784, 988, 1319].forEach((f, i) => setTimeout(() => tone(f, .35, 'triangle', .08), i * 100)),
    crack: () => { burst(.3, 'bandpass', 900, .5, 0, 200); tone(90, .4, 'sine', .3, null, 40); },
  };
  function sfx(n) { if (ac && SFX[n]) try { SFX[n](); } catch (e) { } }
  return { init, apply, sfx, setScene, setMood };
})();
