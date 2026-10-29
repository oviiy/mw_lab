import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, step, startGame, applyAugment, applyStatUpgrade, rollOffer, rollStatOffer, xpNeed, hurtHero, DEF, AW, HZ } from '../src/game.js';
import { AUGMENTS, STAT_UPGRADES, WAVES } from '../src/config.js';

function seeded(seed = 7) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const idle = { mx: 0, my: 0, pressed: {} };
const run = (g, n, inp = idle) => { for (let i = 0; i < n; i++) { step(g, inp); g.events.length = 0; } };
function started(seed) { const g = createGame({ rng: seeded(seed) }); startGame(g); return g; }

test('start puts the turtle in the middle of wave 1', () => {
  const g = started();
  assert.equal(g.state, 'play');
  assert.equal(g.wave, 1);
  assert.equal(g.hero.x, 0);
  assert.equal(g.hero.s.hp, 15);
});

test('the turtle moves and stays inside the courtyard', () => {
  const g = started();
  g.hero.inv = 1e9;
  run(g, 600, { mx: 1, my: 0, pressed: {} });
  assert.ok(g.hero.x <= AW - g.hero.r + 1e-9);
  assert.ok(g.hero.x > AW - 1.5);
});

test('enemies spawn after a telegraph and the turtle auto-fires at them', () => {
  const g = started();
  g.hero.inv = 1e9;
  run(g, 400);
  assert.ok(g.shots > 0, 'fired');
  assert.ok(g.kills > 0, 'killed something');
});

test('a timed wave waits for remaining enemies, then offers a stat and a 海克斯 pick', () => {
  const g = started();
  g.hero.inv = 1e9;
  run(g, 120);
  assert.ok(g.enemies.length > 0);
  g.waveT = 1; g.spawnT = 9999; g.spawns = [];
  run(g, 1);
  assert.equal(g.state, 'play');
  assert.equal(g.waveT, 0);
  g.enemies = [];
  run(g, 1);
  assert.equal(g.state, 'pick');
  assert.equal(g.offer.kind, 'stat');
  assert.deepEqual(g.offer.list, ['shots', 'damage', 'health']);
  assert.ok(g.offer.list.every((id) => STAT_UPGRADES.some((a) => a.id === id)));
  const rerolls = g.rerolls;
  run(g, 1, { mx: 0, my: 0, pressed: { reroll: true } });
  assert.equal(g.rerolls, rerolls, 'stat choices do not spend 海克斯 rerolls');
  run(g, 25, { mx: 0, my: 0, pressed: { pick: 0 } });
  assert.equal(g.state, 'pick');
  assert.equal(g.offer.kind, 'hex');
  const tier = g.offer.tier;
  assert.ok(g.offer.list.every((id) => AUGMENTS.find((a) => a.id === id).tier === tier), 'one tier per offer');
  while (g.state === 'pick') run(g, 25, { mx: 0, my: 0, pressed: { pick: 0 } });
  assert.equal(g.state, 'play');
  assert.equal(g.wave, 2);
  assert.equal(g.enemies.length, 0, 'the courtyard is cleared between waves');
});

test('reroll keeps the tier and costs a reroll', () => {
  const g = started(3);
  g.wave = 6;
  rollOffer(g, 'gold');
  g.state = 'pick'; g.pickPhase = 'hex'; g.st = 30;
  const before = g.rerolls;
  step(g, { mx: 0, my: 0, pressed: { reroll: true } });
  assert.equal(g.rerolls, before - 1);
  assert.equal(g.offer.tier, 'gold');
});

test('xp from candy levels the turtle up with a small bonus, not an extra pick', () => {
  const g = started();
  const need = xpNeed(1);
  const before = JSON.stringify(g.hero.s);
  for (let i = 0; i < need; i++) g.gems.push({ id: 1000 + i, x: 0, y: 0, v: 1, mag: false, vx: 0, vy: 0 });
  run(g, 2);
  assert.equal(g.hero.lvl, 2);
  assert.equal(g.picks, 0);
  assert.notEqual(JSON.stringify(g.hero.s), before);
});

test('a wave gives one stat pick and one 海克斯 pick, however many levels were gained', () => {
  const g = started();
  g.hero.inv = 1e9;
  for (let i = 0; i < 200; i++) g.gems.push({ id: 5000 + i, x: 0, y: 0, v: 1, mag: false, vx: 0, vy: 0 });
  g.waveT = 1; g.spawnT = 9999; g.enemies = []; g.spawns = [];
  run(g, 1);
  assert.equal(g.state, 'pick');
  assert.equal(g.picks, 2);
  assert.equal(g.pickPhase, 'stat');
  run(g, 25, { mx: 0, my: 0, pressed: { pick: 0 } });
  assert.equal(g.picks, 1);
  assert.equal(g.pickPhase, 'hex');
  assert.ok(g.hero.lvl > 3);
  assert.ok(g.lastWave && 'SABC'.includes(g.lastWave.rating));
});

test('augments change stats', () => {
  const g = started();
  applyAugment(g, 'multi');
  applyAugment(g, 'ranked');
  assert.equal(g.hero.s.count, 2);
  assert.ok(Math.abs(g.hero.s.rate - 3.2) < 1e-9);
  applyAugment(g, 'bull');
  assert.ok(g.bull, 'the white ox joins');
});

test('stat choices can add shots, damage and recovery with sensible caps', () => {
  const g = started();
  assert.equal(rollStatOffer(g).kind, 'stat');
  assert.equal(new Set(g.offer.list).size, 3);
  assert.ok(applyStatUpgrade(g, 'shots'));
  assert.equal(g.hero.s.count, 2);
  const damage = g.hero.s.dmg;
  assert.ok(applyStatUpgrade(g, 'damage'));
  assert.ok(g.hero.s.dmg > damage);
  assert.ok(applyStatUpgrade(g, 'regen'));
  assert.equal(g.hero.s.regen, 1);
  g.hero.s.count = 5;
  assert.equal(applyStatUpgrade(g, 'shots'), false);
  assert.ok(!rollStatOffer(g).list.includes('shots'));
});

test('the window shield eats one hit, then hp drops', () => {
  const g = started();
  g.hero.inv = 0; g.hero.shields = 1;
  hurtHero(g, 2, 1, 0);
  assert.equal(g.hero.s.hp, 15);
  g.hero.inv = 0;
  hurtHero(g, 2, 1, 0);
  assert.equal(g.hero.s.hp, 13);
});

test('不朽盾 revives once, then the run ends', () => {
  const g = started();
  applyAugment(g, 'aegis');
  g.hero.s.hp = 1; g.hero.inv = 0;
  hurtHero(g, 5, 1, 0);
  assert.equal(g.state, 'play');
  assert.equal(g.hero.s.hp, g.hero.s.maxhp);
  g.hero.s.hp = 1; g.hero.inv = 0;
  hurtHero(g, 5, 1, 0);
  assert.equal(g.state, 'over');
});

test('超级蜘蛛 needs a full charge and webs nearby enemies', () => {
  const g = started();
  g.hero.inv = 1e9;
  run(g, 200);
  const e = { id: 999, type: 'durian', x: 3, y: 0, r: 0.45, hp: 50, max: 50, sp: 0.04, dmg: 1, xp: 1, t: 0, flash: 0, stun: 0, web: 0, kx: 0, ky: 0, mode: 'walk', modeT: 0, carry: 0, cd: 100, hitBy: {} };
  g.enemies.push(e);
  g.hero.ult = 50;
  step(g, { mx: 0, my: 0, pressed: { ult: true } });
  assert.equal(e.web, 0, 'not charged');
  g.hero.ult = 100;
  step(g, { mx: 0, my: 0, pressed: { ult: true } });
  assert.ok(e.web > 0, 'webbed');
  assert.equal(g.hero.ult, 0);
});

test('大毛 splits into 小毛球 when it pops', () => {
  const g = started();
  g.wave = 6;
  g.hero.inv = 1e9; g.hero.s.dmg = 999; g.hero.s.crit = 0;
  g.enemies = [{ id: 500, type: 'mao', x: 2, y: 0, r: 0.8, hp: 1, max: 40, sp: 0, dmg: 0, xp: 5, t: 0, flash: 0, stun: 0, web: 0, kx: 0, ky: 0, mode: 'walk', modeT: 0, carry: 0, cd: 1e9, hitBy: {} }];
  g.spawnT = 1e9; g.hero.cd = 0;
  run(g, 20);
  assert.ok(g.enemies.filter((e) => e.type === 'maoqiu').length >= DEF.mao.split - 1);
});

test('boss waves end only when the boss falls, and the last one wins the game', () => {
  const g = started();
  g.hero.inv = 1e9;
  g.wave = WAVES - 1;
  g.state = 'pick'; g.pickPhase = 'hex'; g.picks = 1; rollOffer(g); g.st = 30;
  step(g, { mx: 0, my: 0, pressed: { pick: 0 } });
  assert.equal(g.wave, WAVES);
  assert.ok(g.bossWave);
  run(g, 200);
  assert.ok(g.boss, 'the judge arrived');
  assert.equal(g.state, 'play');
  g.boss.hp = 1; g.hero.s.dmg = 50; g.hero.s.crit = 0;
  for (let i = 0; i < 600 && g.boss; i++) { step(g, idle); g.events.length = 0; if (g.boss) g.boss.web = 10; }
  assert.equal(g.boss, null);
  assert.equal(g.state, 'play', 'the boss death does not skip surviving enemies');
  g.enemies = []; g.spawns = [];
  run(g, 1);
  assert.equal(g.state, 'win');
});

test('wave 5 waits for 大毛 split enemies before opening rewards', () => {
  const g = started();
  g.hero.inv = 1e9;
  g.wave = 4; g.state = 'pick'; g.pickPhase = 'hex'; g.picks = 1; rollOffer(g); g.st = 30;
  step(g, { mx: 0, my: 0, pressed: { pick: 0 } });
  assert.equal(g.wave, 5);
  run(g, 200);
  assert.ok(g.boss);
  const boss = g.boss;
  boss.x = 2; boss.y = 0; boss.hp = 1;
  g.enemies = [boss]; g.spawns = []; g.spawnT = 1e9;
  g.hero.s.dmg = 999; g.hero.s.crit = 0; g.hero.cd = 0;
  for (let i = 0; i < 60 && g.boss; i++) run(g, 1);
  assert.equal(g.boss, null);
  assert.ok(g.enemies.length > 0, '大毛留下分裂小怪');
  g.hero.cd = 1e9;
  run(g, 1);
  assert.equal(g.state, 'play');
  g.enemies = []; g.spawns = [];
  run(g, 1);
  assert.equal(g.state, 'pick');
  assert.equal(g.pickPhase, 'stat');
});

test('each new enemy type turns up in the first spawns of its wave', () => {
  const g = started(5);
  g.hero.inv = 1e9;
  const seen = new Set();
  for (let i = 0; i < 6 * HZ; i++) { step(g, idle); g.events.length = 0; for (const e of g.enemies) seen.add(e.type); }
  for (const t of ['durian', 'ginger', 'orange']) assert.ok(seen.has(t), t + ' in wave 1');
});

test('马背上的民族 sets off on a horse and tramples', () => {
  const g = started();
  g.hero.inv = 1e9; g.spawnT = 1e9;
  applyAugment(g, 'horse');
  g.hero.timers.horse = 599;
  run(g, 2);
  assert.ok(g.hero.ride > 0, 'riding');
  assert.equal(g.hero.mount, 'horse');
  assert.equal(g.hero.say, '马背上的民族！');
  const e = { id: 777, type: 'durian', x: g.hero.x + 0.6, y: g.hero.y, r: 0.45, hp: 100, max: 100, sp: 0, dmg: 1, xp: 1, t: 0, flash: 0, stun: 0, web: 0, kx: 0, ky: 0, mode: 'walk', modeT: 0, carry: 0, cd: 1e9, hitBy: {} };
  g.enemies.push(e);
  run(g, 2);
  assert.ok(e.hp < 100, 'trampled');
});

test('米拉娜的流星风暴 drops stars on nearby enemies', () => {
  const g = started();
  g.hero.inv = 1e9; g.spawnT = 1e9; g.hero.cd = 1e9;
  applyAugment(g, 'meteor');
  const e = { id: 778, type: 'durian', x: 4, y: 0, r: 0.45, hp: 100, max: 100, sp: 0, dmg: 1, xp: 1, t: 0, flash: 0, stun: 0, web: 0, kx: 0, ky: 0, mode: 'walk', modeT: 0, carry: 0, cd: 1e9, hitBy: {} };
  g.enemies.push(e);
  g.hero.timers.meteor = 400;
  run(g, 40);
  assert.ok(e.hp < 100, 'hit by a star');
});

test('北京骑行夫妇 sets off on the bike, faster than the horse', () => {
  const g = started();
  g.hero.inv = 1e9; g.spawnT = 1e9;
  applyAugment(g, 'bike');
  g.hero.timers.bike = 719;
  run(g, 2);
  assert.equal(g.hero.mount, 'bike');
  assert.equal(g.hero.say, '北京骑行夫妇！');
  run(g, 60, { mx: 1, my: 0, pressed: {} });
  assert.ok(Math.abs(g.hero.vx - g.hero.s.speed * 1.9) < 1e-6);
});

test('no 曲奇 anywhere in the waves', () => {
  const g = started(9);
  g.hero.inv = 1e9;
  const seen = new Set();
  for (let i = 0; i < 20 * HZ; i++) { step(g, idle); g.events.length = 0; for (const e of g.enemies) seen.add(e.type); }
  assert.ok(!seen.has('cookie'));
  assert.ok(seen.has('ginger'));
});
