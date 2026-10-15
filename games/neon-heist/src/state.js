// Shared game context. main.js fills it in; modules read from it lazily, which
// avoids circular imports between vehicles / combat / police / player.
export const G = {
  time: 0,
  wanted: 0,
  wantedT: 0,
  night: 0,
  money: 500,
  indoor: false,
  interact: null,
  nearDoor: null,
  spot: null,
  drunk: 0,
};
