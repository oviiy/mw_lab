// Historical anchors and director schedules for Monday 19 October 1987.
// Anchors are approximate (Dec '87 S&P 500 futures, CME; cash S&P 500 index).
// The director never sets prices — these curves shape *pressure*, and the target
// path is only used by a gentle feedback term so every seeded run tells the same story.

export const SESSION_MIN = 405;          // 08:30 → 15:15 CT
export const PREV_SETTLE = 282.25;        // futures settle, Fri 16 Oct 1987
export const PREV_CASH = 282.70;          // S&P 500 close, Fri 16 Oct 1987
export const HIST_SETTLE = 201.50;        // futures settle, Mon 19 Oct 1987 (≈ −28.6%)
export const MULTIPLIER = 500;            // $ per index point per contract

// Target path: minutes since open → return vs PREV_SETTLE.
export const TARGET_PATH = [
  [0, -0.07], [20, -0.09], [55, -0.105], [95, -0.085], [140, -0.06],
  [175, -0.075], [230, -0.105], [265, -0.13], [300, -0.175], [335, -0.215],
  [370, -0.255], [405, -0.286],
];

export const PHASES = [
  { id: 'open',    name: 'OPENING GAP',  from: 0,   to: 30 },
  { id: 'chop',    name: 'MORNING CHOP', from: 30,  to: 120 },
  { id: 'rally',   name: 'FALSE RALLY',  from: 120, to: 180 },
  { id: 'grind',   name: 'THE GRIND',    from: 180, to: 270 },
  { id: 'pocket',  name: 'AIR POCKET',   from: 270, to: 330 },
  { id: 'freefall', name: 'FREEFALL',    from: 330, to: 405 },
];

// Portfolio-insurance selling rate (contracts per pit-minute per PI desk).
export const PI_RATE = [[0, 2.2], [40, 1.2], [110, 0.4], [170, 0.3], [200, 1.0], [250, 1.8], [290, 3.4], [340, 4.2], [405, 4.2]];
// Value-buyer capital multiplier (short covering + bargain hunting peaks mid-morning).
export const VALUE_CAPITAL = [[0, 0.9], [90, 1.1], [130, 1.6], [170, 1.2], [230, 0.7], [300, 0.35], [405, 0.25]];
// Index-arbitrage link health (DOT delays and halted stocks break it in the afternoon).
export const ARB_HEALTH = [[0, 0.05], [40, 0.15], [70, 0.8], [100, 0.95], [190, 0.85], [250, 0.45], [290, 0.12], [405, 0.05]];
// Market-maker risk appetite.
export const MAKER_APPETITE = [[0, 0.7], [60, 0.9], [150, 1.0], [240, 0.7], [300, 0.35], [405, 0.28]];
// Noise-trader activity.
export const NOISE_ACTIVITY = [[0, 1.3], [60, 1.0], [200, 1.0], [300, 1.4], [405, 1.6]];
