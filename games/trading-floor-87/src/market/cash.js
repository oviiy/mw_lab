// The NYSE cash index lags futures. Healthy arb link ⇒ a few minutes of lag; broken
// link (DOT delays, unopened stocks) ⇒ stale prices and a yawning futures discount.
import { PREV_CASH } from './calibration.js';

export class CashIndex {
  constructor() { this.value = PREV_CASH; }
  update(futuresPx, fairBasis, health, dtMin, tMin) {
    // Many NYSE stocks hadn't opened in the first hour: the index barely moves at first.
    const opening = tMin < 45 ? 14 : 0;
    const tau = 2.5 + 30 * (1 - health) + opening;
    const target = futuresPx + fairBasis;
    this.value += (target - this.value) * (1 - Math.exp(-dtMin / tau));
    return this.value;
  }
}
