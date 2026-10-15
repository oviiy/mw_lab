import * as THREE from 'three';
import { G } from './state.js';
import { B, N, W, rand, pick, dist, clamp } from './util.js';
import { VD } from './viaduct.js';

/* -------------------------------------------------------------------------
   Mission director: a five-mission story told by "Vinnie" at the docks, plus
   side activities (courier jobs, steal-to-order, Skyway time trial, store
   robberies). Progress is saved in localStorage.
   ------------------------------------------------------------------------- */

const SAVE_KEY = 'neonheist.v1';
const markerGeo = new THREE.CylinderGeometry(3, 3, 60, 20, 1, true).translate(0, 30, 0);
const ringGeo = new THREE.TorusGeometry(3.2, 0.18, 8, 36).rotateX(Math.PI / 2);

class Marker {
  constructor(color) {
    this.g = new THREE.Group();
    this.beam = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    this.ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color }));
    this.g.add(this.beam, this.ring); this.g.visible = false; this.g.userData.noAO = true; G.scene.add(this.g);
    this.color = color; this.x = 0; this.z = 0; this.y = 0;
  }
  at(x, z, y = 0, scale = 1) { this.x = x; this.z = z; this.y = y; this.g.position.set(x, y, z); this.g.scale.setScalar(scale); this.g.visible = true; this.r = 3.2 * scale; return this; }
  hide() { this.g.visible = false; }
  near(px, pz, py = 0, extra = 1.5) { return this.g.visible && Math.abs(py - this.y) < 3 && dist(px, pz, this.x, this.z) < this.r + extra; }
}

const STORY = [
  { name: 'Fresh Start', type: 'courier', pay: 1000,
    lines: ['VINNIE: So you\'re the new driver. Let\'s see if you can follow simple instructions.', 'VINNIE: Pick up a "special order" at Burger Shot. Bring it here. Don\'t eat it.'],
    unlock: 'Courier jobs are now available around the city.' },
  { name: 'Hot Property', type: 'steal', pay: 1500,
    lines: ['VINNIE: A client wants a yellow sports car parked at the stadium.', 'VINNIE: It has an alarm. Expect company. Bring it back in one piece.'],
    unlock: 'Steal-to-order jobs unlocked · Ammu-Nation now sells the SMG and Assault Rifle.' },
  { name: 'Corner Store', type: 'rob', pay: 1000,
    lines: ['VINNIE: Money\'s tight. The 24/7 market on the south side keeps cash in the register.', 'VINNIE: Take it, then lose the cops — or hide at a safehouse.'],
    unlock: 'You can now rob 24/7 stores any time (aim at the register).' },
  { name: 'Loose Ends', type: 'hit', pay: 2000,
    lines: ['VINNIE: Somebody talked. He\'s at the hospital and he\'s about to run to the police.', 'VINNIE: Stop him before he reaches Police HQ.'],
    unlock: 'Sniper Rifle and Rocket Launcher unlocked · The Skyline apartment can now be bought.' },
  { name: 'Skyway Score', type: 'armored', pay: 2000,
    lines: ['VINNIE: The big one. An armored truck crosses the Skyway with the casino\'s cash.', 'VINNIE: Wreck it, grab the bags, and shake off whatever they throw at you.'],
    unlock: 'You run this town now. Free roam — every job stays open.' },
];

const RAMPAGES = [
  { id: 'smg', bi: 3, bj: 2, w: 1, ammo: 400, goal: 20, type: 'peds', time: 75, pay: 1500, what: 'take out 20 people with the SMG' },
  { id: 'rpg', bi: 5, bj: 6, w: 3, ammo: 24, goal: 8, type: 'cars', time: 75, pay: 2000, what: 'blow up 8 vehicles with the rocket launcher' },
  { id: 'bat', bi: 8, bj: 4, w: 7, ammo: 0, goal: 12, type: 'peds', time: 75, pay: 1200, what: 'beat down 12 people with the bat' },
];

export class MissionDirector {
  constructor() {
    this.prog = this.load();
    this.active = null; this.offer = null; this.offerT = 8; this.cool = 0; this.robCool = 0;
    this.contact = new Marker(0xffd23a); this.side = new Marker(0x40e0ff); this.goal = new Marker(0x40e0ff); this.race = new Marker(0xffffff);
    this.lastText = '';
    this.skulls = RAMPAGES.map((r) => ({ ...r, m: new Marker(0xff3030) }));
  }

  /* ---------- persistence ---------- */
  load() { try { return { story: 0, safehouse: false, best: null, ...JSON.parse(localStorage.getItem(SAVE_KEY) || localStorage.getItem('gta5lite.v1') || '{}') }; } catch (_) { return { story: 0, safehouse: false, best: null }; } }
  save() {
    const P = G.player; this.prog.money = Math.floor(G.money); this.prog.owned = P.owned; this.prog.ammo = P.ammo.map((a) => (a === Infinity ? -1 : a)); this.prog.armor = P.armor || 0;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.prog)); } catch (_) { /* private mode */ }
  }
  applySave() {
    const s = this.prog, P = G.player; if (s.money == null) return false;
    G.money = s.money; if (s.owned) P.owned = s.owned; if (s.ammo) P.ammo = s.ammo.map((a) => (a < 0 ? Infinity : a)); P.armor = s.armor || 0;
    return true;
  }
  reset() { try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem('gta5lite.v1'); } catch (_) { /* ignore */ } }

  /* ---------- locations ---------- */
  door(kind, near) { const ds = G.city.doors.filter((d) => d.kind === kind); if (!ds.length) return null; if (!near) return ds[0]; return ds.reduce((a, b) => (dist(a.x, a.z, near.x, near.z) < dist(b.x, b.z, near.x, near.z) ? a : b)); }
  curb(d) { return { x: d.x + (d.dx || 0) * 6.5, z: d.z + (d.dz || 0) * 6.5 }; }               // drivable spot in front of a door
  poi(kind) { return G.city.pois.find((p) => p.kind === kind); }
  blockRoad(kind) { const b = G.city.blocks.flat().find((q) => q.kind === kind); return { x: b.x + b.s / 2, z: b.z + b.s + 8 }; } // road beside a block
  docks() { return this.blockRoad('industrial'); }
  roadPoint(cx, cz, mn, mx) {
    for (let i = 0; i < 40; i++) {
      const a = rand(0, 6.28), d = rand(mn, mx); let x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (Math.random() < 0.5) z = Math.round(z / B) * B; else x = Math.round(x / B) * B;
      if (Math.abs(z - VD.zc) < 20) continue;
      if (x > 20 && x < W - 20 && z > 20 && z < W - 20) return { x, z };
    }
    return { x: W / 2, z: W / 2 };
  }
  respawnPoint(kind = G.player.kind) {
    const d = kind === 'BUSTED' ? this.poi('police') : this.door('hospital');
    return d ? { x: d.x + (d.dx || 0) * 3, z: d.z + (d.dz || 0) * 3 } : { x: 5 * B - 30, z: 5 * B + 13.2 };
  }
  weaponTier(i) { const s = this.prog.story; if (this.active && this.active.type === 'rampage' && this.active.w === i) return true; if (i === 1 || i === 4) return s >= 2; if (i === 3 || i === 5) return s >= 4; return true; }

  /* ---------- public hooks ---------- */
  canRob() { return G.player.inside && G.player.inside.kind === 'store' && this.robCool <= 0 && ((this.active && this.active.type === 'rob' && this.active.stage === 'rob') || (!this.active && this.prog.story >= 3)); }
  rob() {
    const loot = Math.floor(rand(350, 750)); G.money += loot; this.robCool = 120; G.audio.cash();
    G.hud.toast(`You emptied the register: +$${loot}`, 2.5); if (G.interiors.clerks[0]) G.speech.say(G.interiors.clerks[0], 'Take it! Just don\'t shoot!', { secs: 2.5 });
    this.pendingHeat = 3; if (this.active && this.active.type === 'rob') this.active.stage = 'escape';
  }
  onExitInterior() { if (this.pendingHeat) { G.police.crime(this.pendingHeat, G.player.x, G.player.z, true); this.pendingHeat = 0; } }

  /* ---------- mission builders ---------- */
  start(m) {
    this.active = m; this.offer = null; this.side.hide(); this.contact.hide(); this.race.hide(); for (const r of this.skulls) r.m.hide();
    G.hud.big(m.title.toUpperCase(), 2.6, '#ffd23a'); for (const l of m.lines || []) G.hud.toast(l, 4.2);
    m.setup && m.setup();
  }
  finish(ok, msg) {
    const m = this.active; this.active = null; this.goal.hide(); this.side.hide();
    m.cleanup && m.cleanup();
    if (ok) {
      const pay = Math.round(m.payout ? m.payout() : m.pay); G.money += pay; G.audio.cash();
      G.hud.big(m.story != null ? 'MISSION PASSED' : 'JOB DONE', 2.6, '#7ed957'); G.hud.toast(`+$${pay}${msg ? ' — ' + msg : ''}`, 3);
      if (m.story != null && this.prog.story === m.story) {
        this.prog.story++; G.hud.toast(STORY[m.story].unlock, 5);
        if (this.prog.story >= STORY.length) setTimeout(() => this.ending(), 3000);
      }
      if (m.type === 'courier') G.stats.jobs++;
      this.save();
    } else { G.hud.big(m.story != null ? 'MISSION FAILED' : 'JOB FAILED', 2.4, '#ff5a3a'); if (msg) G.hud.toast(msg, 3); }
    this.cool = ok ? 4 : 6; this.offerT = 10;
  }
  ending() {
    const s = G.stats; G.hud.big('KINGPIN OF LOS SANTITOS', 5, '#ffd23a');
    G.hud.toast(`Story complete! Jobs ${s.jobs} · Cars jacked ${s.jacked} · Cops down ${s.cops} · $${Math.floor(G.money).toLocaleString()} in the bank`, 7);
  }

  courier({ from, to, pay, time, title = 'Courier job', story = null, fragile = false, lines = [] }) {
    const self = this; let stage = 'pickup', hp0 = 0, t = 0;
    return {
      title, story, type: 'courier', pay, lines, get stage() { return stage; },
      setup() { self.goal.at(from.x, from.z); },
      update(dt) {
        const P = G.player;
        if (stage === 'pickup') {
          if (self.goal.near(P.x, P.z)) {
            if (!P.car) { G.hud.toast('You need a vehicle for this job.', 1.2); return null; }
            stage = 'deliver'; t = time; hp0 = P.car.hp; self.goal.at(to.x, to.z); G.audio.cash();
            G.hud.toast(fragile ? 'Fragile cargo — don\'t damage the car!' : 'Package loaded — go!', 2.4);
          }
        } else {
          t -= dt; if (t <= 0) return 'fail';
          if (fragile && P.car && P.car.hp < hp0 * 0.7) return 'fail';
          if (P.car && self.goal.near(P.x, P.z, P.car.y)) return 'pass';
        }
        return null;
      },
      text() { return stage === 'pickup' ? `${title}: pick up the package` : `${title}: deliver it  ·  ${fmt(t)}${fragile ? '  ·  FRAGILE' : ''}  ·  $${pay}`; },
      blips() { return [{ x: self.goal.x, z: self.goal.z, c: '#40e0ff' }]; },
      payout() { return fragile ? pay * 1.5 : pay; },
    };
  }

  steal({ at, dest, pay, title = 'Steal-to-order', story = null, type = 'sport', color = 0xffd200, alarm = 0.4, lines = [] }) {
    const self = this; let car = null, stage = 'find', alarmed = false;
    return {
      title, story, type: 'steal', pay, lines, get stage() { return stage; },
      setup() {
        car = G.traffic.create(type, at.x, at.z, rand(0, 6.28), color); car.keep = true;
        car.onWreck = () => { stage = 'wrecked'; };
        G.hud.toast(`Find the ${car.def.n.toLowerCase()} (red blip)`, 3);
      },
      update() {
        const P = G.player;
        if (stage === 'wrecked') return 'fail';
        if (!G.traffic.cars.includes(car)) return 'fail';
        if (P.car === car) {
          if (stage === 'find') { stage = 'deliver'; self.goal.at(dest.x, dest.z); if (!alarmed && Math.random() < alarm) { alarmed = true; G.police.crime(2, P.x, P.z, true); G.hud.toast('The alarm went off!', 2); } }
          if (self.goal.near(P.x, P.z, car.y) && Math.abs(car.fw) < 9) return 'pass';
        } else if (stage === 'deliver') self.goal.hide();
        if (stage === 'deliver' && P.car !== car) { stage = 'find'; }
        return null;
      },
      text() { return stage === 'find' ? `${title}: steal the ${car.def.n.toLowerCase()}` : `${title}: deliver it to the docks  ·  condition ${Math.round((car.hp / car.def.hp) * 100)}%`; },
      blips() { return stage === 'find' ? [{ x: car.x, z: car.z, c: '#ff4040' }] : [{ x: self.goal.x, z: self.goal.z, c: '#40e0ff' }]; },
      payout() { return pay * clamp(car.hp / car.def.hp, 0.3, 1); },
      cleanup() { if (car && G.player.car !== car) car.keep = false; else if (car) { const c = car; setTimeout(() => { if (G.player.car === c) G.player.exitCar(false); c.keep = false; c.x = -9999; }, 1500); } },
    };
  }

  robbery({ pay, title = 'Corner Store', story = null, lines = [] }) {
    const self = this, d = this.door('store', this.docks());
    const m = {
      title, story, type: 'rob', pay, lines, stage: 'go',
      setup() { self.goal.at(d.x, d.z, 0, 0.6); },
      update() {
        const P = G.player;
        if (m.stage === 'go' && P.inside && P.inside.kind === 'store') { m.stage = 'rob'; self.goal.hide(); G.hud.toast('Walk up to the counter and rob the register (E).', 3); }
        if (m.stage === 'escape' && !P.inside) {
          const safe = self.door('apartment'); self.goal.at(safe.x, safe.z, 0, 0.6);
          if (G.wanted === 0) return 'pass';
        }
        if (m.stage === 'escape' && P.inside && P.inside.kind === 'apartment') return 'pass';
        return null;
      },
      text() { return m.stage === 'go' ? `${title}: go to the 24/7 market` : m.stage === 'rob' ? `${title}: rob the register` : `${title}: lose the cops or hide in the Skyline Apartments`; },
      blips() { return self.goal.g.visible ? [{ x: self.goal.x, z: self.goal.z, c: '#40e0ff' }] : []; },
    };
    return m;
  }

  hit({ pay, title = 'Loose Ends', story = null, lines = [] }) {
    const self = this; let car = null, stage = 'find', t = 160;
    const hq = this.poi('police'), hd = this.door('hospital'), start = this.curb(hd);
    return {
      title, story, type: 'hit', pay, lines, get stage() { return stage; },
      setup() {
        car = G.traffic.create('sedan', start.x, start.z, Math.atan2(hd.dz, hd.dx) + Math.PI / 2, 0x7a1f1f); car.keep = true; car.drv = 'civ'; car.hp = 160;
        car.onWreck = (by) => { stage = 'dead'; };
      },
      update(dt) {
        const P = G.player; t -= dt;
        if (stage === 'dead') return 'pass';
        if (t <= 0) return 'fail';
        if (stage === 'find' && dist(P.x, P.z, car.x, car.z) < 55) {
          stage = 'flee'; car.ai = true; car.mode = 'flee'; car.spd = 26; car.dir = ((Math.round(car.a / (Math.PI / 2)) % 4) + 4) % 4; car.lastI = -1;
          G.hud.toast('He spotted you — he\'s running for Police HQ!', 2.5); G.speech.say(car, 'Get away from me!', { secs: 2 });
        }
        if (stage === 'flee' && hq && dist(car.x, car.z, hq.x, hq.z) < 30) return 'fail';
        if (P.car === car) return 'pass';
        return null;
      },
      text() { return `${title}: stop the informant  ·  ${fmt(t)}`; },
      blips() { return [{ x: car.x, z: car.z, c: '#ff4040' }, ...(hq ? [{ x: hq.x, z: hq.z, c: '#4a88ff' }] : [])]; },
      cleanup() { if (car) car.keep = false; },
    };
  }

  armored({ pay, title = 'Skyway Score', story = null, lines = [] }) {
    const self = this; let truck = null, stage = 'hunt', bags = 0, items = [];
    return {
      title, story, type: 'armored', pay, lines, get stage() { return stage; },
      setup() {
        truck = G.traffic.create('truck', VD.xb + 60, VD.zc + 3.5, 0, 0x2f4a2a); truck.y = VD.y; truck.hw = true; truck.ai = true; truck.drv = 'civ'; truck.dir = 0; truck.spd = 19; truck.keep = true;
        truck.hp = truck.def.hp * 3; truck.def = { ...truck.def, hp: truck.def.hp * 3 };
        truck.onWreck = () => {
          stage = 'loot'; G.hud.toast('Grab the cash bags!', 2.5);
          for (let i = 0; i < 5; i++) items.push(G.pickups.add(truck.x + rand(-4, 4), clamp(truck.z + rand(-3, 3), VD.zc - 5, VD.zc + 5), 'cash', 1000, 120, truck.y));
        };
        G.hud.toast('The truck is on the Skyway (red blip).', 3);
      },
      update() {
        const P = G.player;
        if (stage === 'hunt' && !G.traffic.cars.includes(truck)) return 'fail';
        if (stage === 'loot') {
          bags = items.filter((it) => !G.pickups.items.includes(it)).length;
          if (bags >= 5) { stage = 'escape'; G.police.crime(4, P.x, P.z, true); G.hud.toast('Every cop in the city is coming. Lose them!', 3); }
          else if (items.every((it) => !G.pickups.items.includes(it) || it.ttl < 1)) { if (bags >= 1) { stage = 'escape'; G.police.crime(4, P.x, P.z, true); } }
        }
        if (stage === 'escape' && G.wanted === 0) return 'pass';
        return null;
      },
      text() { return stage === 'hunt' ? `${title}: destroy the armored truck` : stage === 'loot' ? `${title}: collect the cash (${bags}/5)` : `${title}: lose the cops`; },
      blips() { return stage === 'hunt' ? [{ x: truck.x, z: truck.z, c: '#ff4040' }] : stage === 'loot' ? items.filter((i) => G.pickups.items.includes(i)).map((i) => ({ x: i.x, z: i.z, c: '#7ed957' })) : []; },
      cleanup() { if (truck) truck.keep = false; },
    };
  }

  raceMission() {
    const self = this, cps = [];
    for (let x = VD.xa + 40; x < VD.xd - 30; x += 160) cps.push({ x, z: VD.zc, y: Math.max(0, Math.min(VD.y, x < VD.xb ? (VD.y * (x - VD.xa)) / (VD.xb - VD.xa) : VD.y)) });
    cps.push({ x: VD.xd + 10, z: VD.zc, y: 0 });
    let i = 0, t = 0, out = 0;
    return {
      title: 'Skyway Time Trial', type: 'race', pay: 0, lines: ['Hit every checkpoint along the Skyway. Gold < 0:40 · Silver < 0:48 · Bronze < 0:58'],
      setup() { self.goal.at(cps[0].x, cps[0].z, cps[0].y, 1.5); },
      update(dt) {
        const P = G.player; t += dt;
        if (!P.car) { out += dt; if (out > 8) return 'fail'; } else out = 0;
        const py = P.car ? P.car.y : 0;
        if (self.goal.near(P.x, P.z, py, 3)) { i++; G.audio.cash(); if (i >= cps.length) return 'pass'; const c = cps[i]; self.goal.at(c.x, c.z, c.y, 1.5); }
        if (t > 120) return 'fail';
        return null;
      },
      text() { return `Skyway Time Trial  ·  checkpoint ${i + 1}/${cps.length}  ·  ${fmt(t)}${self.prog.best ? '  ·  best ' + fmt(self.prog.best) : ''}`; },
      blips() { return [{ x: self.goal.x, z: self.goal.z, c: '#ffffff' }]; },
      payout() {
        const medal = t < 40 ? ['GOLD', 1500] : t < 48 ? ['SILVER', 800] : t < 58 ? ['BRONZE', 400] : ['', 0];
        if (!self.prog.best || t < self.prog.best) { self.prog.best = t; G.hud.toast(`New best time: ${fmt(t)}`, 3); }
        if (medal[0]) G.hud.toast(`${medal[0]} medal!`, 3);
        return medal[1];
      },
    };
  }

  /* Rampage: a borrowed weapon, a kill quota and a clock. */
  rampage(r) {
    const self = this, P = G.player, st = G.stats; let t = r.time, k0 = 0, prevOwned = false, prevAmmo = 0;
    const count = () => (r.type === 'cars' ? (st.wrecks || 0) : st.kills + st.cops) - k0;
    return {
      title: 'RAMPAGE', type: 'rampage', w: r.w, pay: r.pay, lines: [`Rampage: ${r.what} in ${r.time} seconds.`],
      setup() { k0 = (r.type === 'cars' ? (st.wrecks || 0) : st.kills + st.cops); prevOwned = P.owned[r.w]; prevAmmo = P.ammo[r.w]; P.giveWeapon(r.w, r.ammo || 0); P.setWeapon(r.w, true); },
      update(dt) { t -= dt; if (count() >= r.goal) return 'pass'; return t <= 0 ? 'fail' : null; },
      text() { return `RAMPAGE  ·  ${Math.min(r.goal, count())}/${r.goal} ${r.type === 'cars' ? 'vehicles' : 'kills'}  ·  ${fmt(t)}`; },
      blips() { return []; },
      payout() { (self.prog.rampages ||= []).push(r.id); return r.pay; },
      cleanup() { P.owned[r.w] = prevOwned; P.ammo[r.w] = prevAmmo; if (!P.canUse(P.w)) { if (!P.setWeapon(0, true)) P.setWeapon(7, true); } },
    };
  }
  /* Bounty from the Police HQ board: find the fugitive's car, it bolts when you get close. */
  bounty() {
    const self = this, hq = this.poi('police'), at = this.roadPoint(hq.x, hq.z, 350, 700), name = pick(['"Two-Tone" Tony', 'Mad Dog Reyes', 'Slim Kowalski', 'Big Lou Marino', 'Vic "The Weasel" Pratt']);
    let car = null, stage = 'find', t = 180; const pay = Math.round(rand(800, 1400) / 50) * 50;
    return {
      title: 'Bounty', type: 'bounty', pay, lines: [`DESK SERGEANT: ${name} skipped bail. Bring him down — we don't ask how.`],
      setup() {
        const horiz = Math.abs(at.z - Math.round(at.z / B) * B) < 1;
        car = G.traffic.create(pick(['sedan', 'sport', 'van']), at.x + (horiz ? 0 : 5.5), at.z + (horiz ? 5.5 : 0), horiz ? 0 : Math.PI / 2, 0x222428);
        car.keep = true; car.drv = 'civ'; car.hp = 150; car.onWreck = () => { stage = 'dead'; };
      },
      update(dt) {
        const P = G.player; t -= dt;
        if (stage === 'dead' || P.car === car) return 'pass';
        if (t <= 0) return 'fail';
        if (stage === 'find' && !P.inside && dist(P.x, P.z, car.x, car.z) < 50) {
          stage = 'flee'; car.ai = true; car.mode = 'flee'; car.away = true; car.spd = 28; car.dir = ((Math.round(car.a / (Math.PI / 2)) % 4) + 4) % 4; car.lastI = -1;
          G.hud.toast(`${name} spotted you — don't let him get away!`, 2.5); G.speech.say(car, 'Not today, pig!', { secs: 2 });
        }
        if (stage === 'flee' && dist(P.x, P.z, car.x, car.z) > 420) return 'fail';
        return null;
      },
      text() { return `Bounty: ${name}  ·  ${stage === 'find' ? 'find his car' : 'take him down'}  ·  ${fmt(t)}`; },
      blips() { return [{ x: car.x, z: car.z, c: '#ff4040' }]; },
      cleanup() { if (car) car.keep = false; },
    };
  }

  storyMission(k) {
    const s = STORY[k], base = { story: k, title: s.name, lines: s.lines, pay: s.pay };
    if (s.type === 'courier') { const d = this.door('burger'); return this.courier({ ...base, from: this.curb(d), to: this.docks(), time: 75 }); }
    if (s.type === 'steal') { const p = this.poi('sport'); return this.steal({ ...base, at: { x: p.x, z: p.z + 52 }, dest: this.docks(), alarm: 1 }); }
    if (s.type === 'rob') return this.robbery(base);
    if (s.type === 'hit') return this.hit(base);
    return this.armored(base);
  }

  /* ---------- per-frame ---------- */
  update(dt) {
    const P = G.player; this.cool -= dt; this.robCool -= dt;
    const t = G.time;
    for (const m of [this.contact, this.side, this.goal, this.race]) if (m.g.visible) m.ring.scale.setScalar(1 + Math.sin(t * 5) * 0.08);
    if (this.active) {
      if (P.dead) { this.finish(false, P.kind === 'BUSTED' ? 'You got busted.' : 'You died.'); return; }
      const r = this.active.update(dt);
      if (r) this.finish(r === 'pass');
      return;
    }
    if (P.dead || this.cool > 0 || P.inside) return;
    // story contact at the docks
    if (this.prog.story < STORY.length) {
      const d = this.docks(); this.contact.at(d.x, d.z);
      if (this.contact.near(P.x, P.z, P.car ? P.car.y : 0)) { this.start(this.storyMission(this.prog.story)); return; }
    } else this.contact.hide();
    // rampage skulls (on foot)
    for (const r of this.skulls) {
      if (this.prog.story < 1 || (this.prog.rampages || []).includes(r.id)) { r.m.hide(); continue; }
      const b = G.city.blocks[r.bi][r.bj]; r.m.at(b.x + 2.5, b.z + 2.5, 0, 0.45); r.m.ring.rotation.y = t * 2;
      if (!P.car && r.m.near(P.x, P.z, 0, 0.6)) { for (const q of this.skulls) q.m.hide(); this.start(this.rampage(r)); return; }
    }
    // Skyway time trial (after the first story mission)
    if (this.prog.story >= 1) {
      this.race.at(VD.xa - 4, VD.zc, 0, 1.2);
      if (P.car && this.race.near(P.x, P.z, P.car.y)) { this.start(this.raceMission()); return; }
    }
    // side-job offers
    if (this.prog.story >= 1) {
      if (!this.offer) {
        this.offerT -= dt;
        if (this.offerT <= 0) {
          const steal = this.prog.story >= 2 && Math.random() < 0.45, p = this.roadPoint(P.x, P.z, 160, 420);
          this.offer = { kind: steal ? 'steal' : 'courier', x: p.x, z: p.z }; this.side.at(p.x, p.z);
          G.hud.toast(steal ? 'New steal-to-order job — green marker' : 'New courier job — cyan marker', 3);
          this.side.ring.material.color.setHex(steal ? 0x58ff8a : 0x40e0ff); this.side.beam.material.color.setHex(steal ? 0x58ff8a : 0x40e0ff);
        }
      } else if (this.side.near(P.x, P.z, P.car ? P.car.y : 0)) {
        const o = this.offer;
        if (o.kind === 'courier') {
          if (!P.car) { G.hud.toast('You need a vehicle for this job.', 1.2); return; }
          const to = this.roadPoint(o.x, o.z, 400, 850), d = dist(to.x, to.z, o.x, o.z);
          this.start(this.courier({ from: { x: o.x, z: o.z }, to, pay: Math.round((150 + d * 0.45) / 10) * 10, time: d / 16 + 15, fragile: Math.random() < 0.3 }));
          this.active.update(0);
        } else {
          const at = this.roadPoint(o.x, o.z, 250, 550), types = ['sport', 'sedan', 'van', 'taxi'];
          this.start(this.steal({ at: { x: at.x + 9, z: at.z + 9 }, dest: this.docks(), pay: Math.round(rand(600, 1200) / 10) * 10, type: pick(types), color: pick([0xffd200, 0xd62828, 0x2c6fbb, 0x1c1c20, 0x2e8b57]) }));
        }
      }
    }
  }

  hudText() {
    if (this.active) return this.active.text();
    if (this.prog.story < STORY.length && !G.player.dead) return `Story: drive to Vinnie at the docks (yellow ★) — "${STORY[this.prog.story].name}"`;
    return '';
  }
  blips() {
    const out = [];
    if (this.active) out.push(...(this.active.blips() || []));
    else {
      if (this.contact.g.visible) out.push({ x: this.contact.x, z: this.contact.z, c: '#ffd23a', star: true });
      if (this.offer) out.push({ x: this.offer.x, z: this.offer.z, c: this.offer.kind === 'steal' ? '#58ff8a' : '#40e0ff' });
      if (this.race.g.visible) out.push({ x: this.race.x, z: this.race.z, c: '#ffffff' });
      for (const r of this.skulls) if (r.m.g.visible) out.push({ x: r.m.x, z: r.m.z, c: '#ff3030' });
    }
    return out;
  }
}

const fmt = (s) => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
