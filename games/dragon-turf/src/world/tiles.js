// Ground tile codes (one byte per tile in World.ground).
export const T = {
  WATER: 0, ROAD: 1, SIDEWALK: 2, PLAZA: 3, PARK: 4, LOT: 5,
  ALLEY: 6, PIER: 7, BUILDING: 8, COURT: 9, DOCK: 10, RAIL: 11,
};

export const isRoad = (t) => t === T.ROAD;
export const isSolid = (t) => t === T.BUILDING;
export const isWater = (t) => t === T.WATER;
// Where pedestrians may stand (roads included: jaywalking is a feature).
export const isWalkable = (t) => t !== T.WATER && t !== T.BUILDING;
export const isSidewalkish = (t) => t === T.SIDEWALK || t === T.PLAZA || t === T.PARK || t === T.ALLEY || t === T.COURT || t === T.DOCK || t === T.PIER || t === T.LOT;
export const isDrivable = (t) => t === T.ROAD;
