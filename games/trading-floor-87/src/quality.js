// Adaptive quality: shadows by preset, pixel ratio steered by measured frame rate.
export function qualityPreset() {
  const q = new URLSearchParams(location.search).get('q');
  const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  if (q === 'low' || (mobile && q !== 'high')) return { name: 'low', shadows: false, shadowSize: 512, maxRatio: 1, people: 100 };
  if (q === 'high') return { name: 'high', shadows: true, shadowSize: 2048, maxRatio: 2, people: 220 };
  return { name: 'medium', shadows: true, shadowSize: 1024, maxRatio: 1.25, people: 150 };
}

export class FrameGovernor {
  constructor(renderer, preset) {
    this.r = renderer;
    this.max = Math.min(window.devicePixelRatio || 1, preset.maxRatio);
    this.ratio = this.max;
    this.min = 0.75;
    this.acc = 0; this.frames = 0;
    renderer.setPixelRatio(this.ratio);
  }
  tick(dt) {
    this.acc += dt; this.frames++;
    if (this.acc < 2) return;
    const fps = this.frames / this.acc;
    this.acc = 0; this.frames = 0;
    let next = this.ratio;
    if (fps < 45) next = Math.max(this.min, this.ratio - 0.15);
    else if (fps > 58) next = Math.min(this.max, this.ratio + 0.1);
    if (Math.abs(next - this.ratio) > 0.01) { this.ratio = next; this.r.setPixelRatio(next); }
    this.fps = fps;
    // Already at the lowest resolution and still slow: hand the next cut to the game.
    if (fps < 40 && this.ratio <= this.min + 0.01) { this.slow = (this.slow || 0) + 1; if (this.onSlow) this.onSlow(this.slow); }
  }
}
