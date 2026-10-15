// Global tunables. Anything a designer might want to tweak lives here.
export const TILE = 32;
export const WORLD_W = 168;          // tiles
export const WORLD_H = 156;          // tiles
export const SEED = 8801;

export const TIME = {
  startHour: 17.6,                   // golden hour; the neon comes on a minute or two in
  secondsPerHour: 42,                // a full day lasts ~17 real minutes
};

export const VIEW = {
  baseHeight: 500,                   // world px visible vertically at zoom 1
  minZoom: 0.55,
  maxZoom: 1.6,
  floorPx: 13,                       // wall height contributed by one floor
  maxBuildingPx: 140,
  tilt: 1.05,                         // how much south wall shows (camera pitch)
  persp: 1 / 540,                    // roof lean per world px from screen centre, per px of height
  maxDpr: 2,                       // render-resolution cap (perf)
};

export const PLAYER = {
  radius: 9,
  walk: 118,
  run: 205,
  roll: 330,
  maxHp: 100,
  maxArmor: 100,
};

export const WANTED = {
  decaySeconds: 22,                  // out-of-sight time to drop one star
  starPoints: [0, 2, 5, 9, 14, 20],   // heat needed per star; petty crime alone rarely reaches 1★
};

export const ECON = {
  startCash: 400,
  hospitalFee: 150,
  bustFee: 220,
};

export const SAVE_KEY = 'dragon-turf-save-v1';
