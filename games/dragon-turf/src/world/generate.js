import { WORLD_W, WORLD_H, SEED } from '../config.js';
import { Rng } from '../core/rng.js';
import { World } from './world.js';
import { carveCoast, assignDistricts, carveRoads, carvePiers } from './layout.js';
import { fillBlocks } from './blocks.js';
import { scatterProps } from './scatter.js';
import { buildRoadNet } from './roadnet.js';
import { placeTurfs } from './turfs.js';
import { placePois } from './pois.js';
import { placeSites, placeMarina, purgeSiteProps } from './sites.js';

// World generation pipeline. Deterministic for a given seed.
export function generateWorld(seed = SEED) {
  const rng = new Rng(seed), world = new World(WORLD_W, WORLD_H);
  world.seed = seed; world.templeCount = 0;
  carveCoast(world, rng, seed);
  assignDistricts(world);
  carveRoads(world, rng);
  carvePiers(world, rng);
  fillBlocks(world, rng);
  placeSites(world, rng);
  buildRoadNet(world);
  scatterProps(world, rng);
  placeMarina(world);
  purgeSiteProps(world);
  placeTurfs(world, rng);
  placePois(world, rng);
  return world;
}
