// The director schedules pressure over the session. It never touches prices directly.
import { piecewise, clamp, smoothstep } from '../util.js';
import {
  TARGET_PATH, PHASES, PI_RATE, VALUE_CAPITAL, ARB_HEALTH, MAKER_APPETITE,
  NOISE_ACTIVITY, PREV_SETTLE,
} from './calibration.js';

export class Director {
  constructor(rng) {
    this.rng = rng;
    this.feedback = 1;              // PI programme multiplier, integrated from tracking error
    // Per-run personality so no two crashes are identical.
    this.jitter = {
      pi: rng.float(0.85, 1.2), value: rng.float(0.85, 1.15), pocket: rng.float(-12, 12),
      depth: rng.float(0.82, 1.06),      // how deep the afternoon goes
      rally: rng.float(-0.012, 0.018), // strength of the late-morning bounce
    };
    this.wiggle = 0; this.wiggleV = 0; // slow OU drift so no two days look alike
    // Short-covering squeezes inside the crash: violent rallies that punish big shorts.
    const n = rng.int(2, 3);
    this.squeezes = Array.from({ length: n }, (_, i) => {
      const at = 285 + (i + rng.float(0.1, 0.8)) * (105 / n);
      return { at, len: rng.float(3, 6), power: rng.float(0.7, 1.2) };
    });
  }

  targetPrice(tMin) {
    const j = this.jitter;
    let r = piecewise(TARGET_PATH, tMin - j.pocket * smoothstep(200, 300, tMin));
    r *= 1 + (j.depth - 1) * smoothstep(170, 405, tMin);
    r += j.rally * Math.exp(-(((tMin - 140) / 30) ** 2));
    return PREV_SETTLE * (1 + r + this.wiggle);
  }

  squeezeAt(tMin) {
    let s = 0;
    for (const q of this.squeezes) if (tMin >= q.at && tMin < q.at + q.len) s = Math.max(s, q.power * Math.sin(((tMin - q.at) / q.len) * Math.PI));
    return s;
  }

  phaseAt(tMin) {
    for (const p of PHASES) if (tMin < p.to) return p;
    return PHASES[PHASES.length - 1];
  }

  update(tMin, price, dtMin) {
    this.wiggle += (-this.wiggle * 0.03 * dtMin) + this.rng.normal() * 0.0016 * Math.sqrt(dtMin);
    // Integral feedback: price above target ⇒ more insurance selling; below ⇒ less.
    const err = price / this.targetPrice(tMin) - 1;
    this.feedback = clamp(this.feedback + err * 4 * dtMin, 0.2, 4);
    const tp = tMin - this.jitter.pocket;
    this.pressure = {
      piRate: piecewise(PI_RATE, tp) * this.jitter.pi * this.feedback * (1 - 0.85 * Math.min(1, this.squeezeAt(tMin))),
      valueCapital: piecewise(VALUE_CAPITAL, tMin) * this.jitter.value * clamp(1 - err * 4, 0.5, 1.6),
      arbHealth: piecewise(ARB_HEALTH, tp),
      makerAppetite: piecewise(MAKER_APPETITE, tp),
      noise: piecewise(NOISE_ACTIVITY, tMin),
      // Far below the story: bargain money floods in (the real Oct 19 close saw buyback announcements).
      instBoost: clamp(1 - (err + 0.03) * 25, 1, 4),
      squeeze: this.squeezeAt(tMin),
    };
    return this.pressure;
  }
}
