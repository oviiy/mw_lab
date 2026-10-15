import { SEED, TIME, PLAYER } from './config.js';
import { Events } from './core/events.js';
import { Input } from './core/input.js';
import { Save } from './core/save.js';
import { clamp } from './core/math.js';
import { generateWorld } from './world/generate.js';
import { Clock } from './world/clock.js';
import { Renderer } from './render/renderer.js';
import { EntityManager } from './entities/manager.js';
import { Ped } from './entities/ped.js';
import { playerLook } from './entities/pedLooks.js';
import { FxSystem } from './systems/fx.js';
import { CombatSystem } from './systems/combat.js';
import { PropSystem } from './systems/props.js';
import { PickupSystem } from './systems/pickups.js';
import { VehicleSystem } from './systems/vehicles.js';
import { TrafficSystem } from './systems/traffic.js';
import { PopulationSystem } from './systems/population.js';
import { EconomySystem } from './systems/economy.js';
import { PlayerController } from './systems/playerControl.js';
import { InteractSystem } from './systems/interact.js';
import { NavSystem } from './systems/nav.js';
import { WantedSystem } from './systems/wanted.js';
import { TurfSystem } from './systems/turf.js';
import { TradeSystem } from './systems/trade.js';
import { MissionSystem } from './systems/missions/index.js';
import { WeatherSystem } from './systems/weather.js';
import { SideJobSystem } from './systems/sidejobs.js';
import { SiteSystem } from './systems/sites.js';
import { ProgressSystem } from './systems/progress.js';
import { CheatSystem } from './systems/cheats.js';
import { AmbientEvents } from './systems/events.js';
import { AudioEngine } from './audio/engine.js';
import { MusicEngine } from './audio/music.js';
import { Hud } from './ui/hud.js';
import { createScreens } from './ui/screens/index.js';
import { drawWorldOverlay } from './ui/worldOverlay.js';

// The composition root: builds the world, wires systems together and runs the frame.
// Systems talk to each other through `game.*` references and the event bus.
export class Game {
  constructor(canvas) {
    this.canvas = canvas; this.events = new Events(); this.input = new Input(canvas);
    this.world = generateWorld(SEED); this.clock = new Clock();
    this.renderer = new Renderer(canvas, this.world, this.clock); this.camera = this.renderer.cam;
    this.state = 'title'; this.time = 0; this.playTime = 0; this.cameraMode = 0; this.timeScale = 1; this.hitStop = 0; this.down = null; this.waypoint = null;
    this.settings = { shake: true, weather: true };
    this.stats = this.freshStats();
    this.entities = new EntityManager(this); this.systems = [];
    this.music = new MusicEngine(this); this.audio = new AudioEngine(this);
    this.fx = new FxSystem(this); this.combat = new CombatSystem(this); this.props = new PropSystem(this); this.pickups = new PickupSystem(this);
    this.vehicles = new VehicleSystem(this); this.traffic = new TrafficSystem(this); this.population = new PopulationSystem(this);
    this.economy = new EconomySystem(this); this.control = new PlayerController(this); this.interact = new InteractSystem(this);
    this.nav = new NavSystem(this); this.wanted = new WantedSystem(this); this.turf = new TurfSystem(this); this.trade = new TradeSystem(this);
    this.weather = new WeatherSystem(this); this.sidejobs = new SideJobSystem(this); this.events_ = new AmbientEvents(this); this.sites = new SiteSystem(this); this.progress = new ProgressSystem(this); this.cheats = new CheatSystem(this);
    this.hud = new Hud(this); this.screens = createScreens(this); this.ui = this.screens; this.missions = new MissionSystem(this);
    this.interact.register('hideout', (poi) => this.turf.useHideout(poi));
    this.systems.push(this.nav, this.wanted, this.turf, this.missions, this.trade, this.sidejobs, this.events_, this.sites, this.progress, this.cheats);
    this.events.on('pedDied', (e) => { if (e.ped === this.player && this.state === 'play') this.playerDown('wasted'); });
    const later = () => { clearTimeout(this._autoT); this._autoT = setTimeout(() => this.autosave(), 2500); };
    this.events.on('missionPassed', later); this.events.on('turfWon', later);
    this.events.on('enterVehicle', (e) => { const c = e.vehicle.cls; if (c === 'car') this.tipOnce('drive', '<kbd>W</kbd>/<kbd>S</kbd> gas & brake · <kbd>E</kbd> get out · <kbd>T</kbd> radio'); });
    this.player = null; this.wantedLevel = 0; this._focus = { x: 0, y: 0 };
    this.setupHooks(); this.enterTitle();
  }
  freshStats() { return { kills: 0, jobs: 0, carjacks: 0, copKills: 0, turfsTaken: 0, gangKills: 0 }; }

  setupHooks() {
    const r = this.renderer, game = this;
    r.hooks.drawables = (items, b) => {
      const add = (e) => { if (e.removed || e.x < b.x0 - 90 || e.x > b.x1 + 90 || e.y < b.y0 - 90 || e.y > b.y1 + 90) return; items.push({ y: e.sortY, draw: (g, t, c) => e.draw(g, t, c, game) }); };
      for (const e of this.entities.pickups) add(e);
      for (const e of this.entities.misc) add(e);
      for (const e of this.entities.vehicles) add(e);
      for (const e of this.entities.peds) add(e);
      for (const e of this.entities.projectiles) add(e);
    };
    r.hooks.fxBelow = (g, cam) => this.progress.drawRamps(g, cam);
    r.hooks.fxAbove = (g, cam) => { this.fx.drawParticles(g); this.weather.drawWorld(g, cam); };
    r.hooks.lights = (L, cam, night) => {
      this.fx.lights(L);
      for (const v of this.entities.vehicles) {
        if (v.removed || v.x < cam.x - 700 || v.x > cam.x + 700 || v.y < cam.y - 500 || v.y > cam.y + 500) continue;
        if (v.dead) { L.add(v.x, v.y, 80, '#ff7a30', 0.7); continue; }
        if (!v.driver && !v.siren) continue;
        const ca = Math.cos(v.angle), sa = Math.sin(v.angle), fx = v.x + ca * v.def.len * 0.5, fy = v.y + sa * v.def.len * 0.5;
        L.cone(fx, fy, v.angle, 190, 58, '#fff0c0', 0.95); L.add(fx + ca * 14, fy + sa * 14, 36, '#fff0c0', 0.5);
        if (v.braking) L.add(v.x - ca * v.def.len * 0.5, v.y - sa * v.def.len * 0.5, 26, '#ff3b2a', 0.6);
        if (v.siren) { const ph = Math.floor(game.time * 7) & 1; L.add(v.x, v.y, 110, ph ? '#ff3030' : '#3a5cff', 0.9); }
      }
      const h = this.wanted.heli; if (h && !h.dead) { L.add(h.light.x, h.light.y, 150, '#e8f0ff', 0.95); }
      void night;
    };
    r.hooks.emissive = (g, cam, night) => {
      void night; this.fx.drawFloaters(g);
      const h = this.wanted.heli; if (h && !h.dead && this.clock.dark > 0.1) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(h.light.x, h.light.y, 0, h.light.x, h.light.y, 95); gr.addColorStop(0, 'rgba(230,240,255,0.5)'); gr.addColorStop(1, 'rgba(230,240,255,0)'); g.fillStyle = gr; g.fillRect(h.light.x - 100, h.light.y - 100, 200, 200); g.restore(); }
      this.weather.drawLightning(g, cam);
    };
    r.hooks.overlay = (g, cam) => { this.progress.draw(g, cam, this.time); drawWorldOverlay(g, cam, this); this.weather.drawScreen(g, cam); };
  }

  freeze(s) { this.hitStop = Math.max(this.hitStop, s); }
  viewRadius() { return Math.hypot(this.camera.w, this.camera.h) / 2 / this.camera.scale; }

  /* ---------- lifecycle ---------- */
  resetState() {
    this.entities.clear(); this.stats = this.freshStats(); this.playTime = 0; this.down = null; this.timeScale = 1; this.waypoint = null;
    for (const t of this.world.turfs) { t.owner = t.startOwner; t.underAttack = null; t.guarded = false; } this.turf.war = null; this.turf.defenders.clear(); this.turf.stash = 0; this.turf.raidT = 140; this.hud.mini.turfDirty = true;
    this.economy.cash = 400; this.economy.weapons = new Set(['fists', 'pistol']); this.economy.earned = 0; this.economy.spent = 0;
    this.missions.done = new Set(); this.missions.active = null; this.clock.hour = 19.2; this.clock.day = 1;
    this.wanted.clear(); this.wanted.heli = null; this.wanted.roadblocks = [];
    for (const k in this.trade.cargo) this.trade.cargo[k] = 0; this.trade.profit = 0; this.trade.events = []; this.trade.news = []; this.trade.dealers = []; this.trade.recompute();
    this.world.propHash.forEach((arr) => { for (const p of arr) { p.dead = false; delete p.hp; } });
    this.hud.setObjective(''); this.hud.clearTips(); this.hud.seenTurf.clear(); clearTimeout(this._hintT); clearTimeout(this._hintT2); this.tipsSeen = new Set(); clearTimeout(this._autoT);
    // per-run state owned by other systems
    const m = this.missions; if (m) { if (m.active && m.active.step && m.active.step.$ && m.active.step.$.off) m.active.step.$.off(); m.active = null; m.retry = null; m.announced = new Set(); }
    if (this.sites) this.sites.reset(); if (this.progress) this.progress.reset(); if (this.cheats) this.cheats.reset(); if (this.missions) this.missions.unlockAll = false;
    if (this.sidejobs) this.sidejobs.taxi = null; if (this.events_) { this.events_.active = []; this.events_.trespassT = 0; }
    this.turf.hourAcc = 0; this.turf.worldT = 300;
  }
  // One-time contextual tutorial tip.
  tipOnce(key, msg) { if (!this.tipsSeen) this.tipsSeen = new Set(); if (this.tipsSeen.has(key)) return; this.tipsSeen.add(key); this.hud.tip(msg); }

  autosave() { if ((this.state !== 'play' && this.state !== 'ui') || this.down || !this.player || this.player.dead) return; if (this.saveGame()) this.hud.toast('Autosaved', 1400, 'mini'); }

  makePlayer(x, y) {
    const p = this.player = new Ped({ x, y, role: 'player', faction: 'jade', look: playerLook(), hp: 100, walk: PLAYER.walk, run: PLAYER.run, weapon: 'pistol', name: 'Kai', infiniteAmmo: false });
    p.maxHp = 100; p.ammo = { pistol: 36 }; p.persistent = true; p.data.accuracy = 0.9;
    p.brain = { update() {}, onHit: (ped, src, amt) => { this.events.emit('playerHurt', { amount: amt, src }); this.camera.addTrauma(clamp(amt / 90, 0.08, 0.5)); this.audio.thud(ped.x, ped.y); } };
    const orig = p.damage.bind(p); p.damage = (a, s, o) => (p.invuln > 0 || this.state !== 'play' ? false : orig(a, s, o));
    this.entities.add(p); return p;
  }

  enterTitle() {
    this.resetState(); this.state = 'title'; this.hud.show(false);
    const t = this.world.turfs.find((q) => q.name === 'Night Market') || this.world.turfs[0], p = this.makePlayer(t.cx, t.cy + 40);
    p.draw = () => {}; p.update = () => {}; p.removed = false; this.clock.hour = 20.4;
    this.camera.snapTo(p.x, p.y); this.renderer.ground.prebake(p.x, p.y, 2);
    this.traffic.prime(); this.population.prime(); this.titleT = 0;
    this.screens.closeAll(); this.screens.open('title');
  }
  quitToTitle() { this.screens.closeAll(); this.state = 'title'; this.enterTitle(); }

  beginGame(cont) {
    const save = cont ? Save.read() : null;
    this.resetState(); this.screens.closeAll();
    const w = this.world, sp = w.spawn; const p = this.makePlayer(sp.x, sp.y);
    this.camera.snapTo(p.x, p.y); this.renderer.ground.prebake(p.x, p.y, 2);
    if (save) this.applySave(save, p); else { this.clock.hour = TIME.startHour; this.clock.day = 1; }
    this.state = 'play'; this.hud.show(true); this.clock.paused = false;
    this.traffic.prime(); this.population.prime();
    if (!save) this.vehicles.spawn('sports', sp.x + 38, sp.y + 8, 0, { parked: true, locked: false, color: '#e23b2e' });
    this.audio.init(); this.events.emit('gameStart', { cont: !!save });
    if (this.music.station !== 2) this.music.setStation(this.music.station);
    if (!save) {
      // one quiet nudge: a text from Uncle Wei and a waypoint — follow it or ignore it
      const idle = () => this.state === 'play' && !this.missions.done.size && !this.missions.active;
      clearTimeout(this._hintT); clearTimeout(this._hintT2);
      this._hintT = setTimeout(() => { if (!idle()) return; this.hud.toast('📱 Uncle Wei: "Welcome home, Kai. Come to the teahouse when you have settled in." · Waypoint set', 6500); this.missions.pointTo('wei'); this.audio.ping && this.audio.ping(); }, 7000);
      this._hintT2 = setTimeout(() => idle() && this.hud.tip('<kbd>Tab</kbd> opens the map. ☯ is Uncle Wei\'s teahouse; follow the white marker on the radar.', 6000), 120000);
    }
  }

  /* ---------- save / load ---------- */
  saveGame() {
    const p = this.player; if (!p || p.dead || this.down || this.state === 'title') return false;
    return Save.write({ v: 1, at: Date.now(), player: { x: p.x, y: p.y, hp: Math.max(1, p.hp), armor: p.armor, weapon: p.weapon }, economy: this.economy.serialize(), missions: this.missions.serialize(), progress: this.progress.serialize(), turf: this.turf.serialize(), trade: this.trade.serialize(), clock: this.clock.serialize(), stats: this.stats, playTime: this.playTime });
  }
  applySave(s, p) {
    p.x = s.player.x; p.y = s.player.y; p.hp = s.player.hp; p.armor = s.player.armor || 0; p.weapon = s.player.weapon || 'pistol';
    this.economy.restore(s.economy); this.progress.restore(s.progress); this.missions.restore(s.missions); this.turf.restore(s.turf); this.trade.restore(s.trade); this.clock.restore(s.clock); this.stats = { ...this.freshStats(), ...s.stats }; this.playTime = s.playTime || 0;
    if (!this.economy.weapons.has(p.weapon)) p.weapon = 'pistol'; this.camera.snapTo(p.x, p.y);
  }

  /* ---------- death / arrest ---------- */
  playerDown(kind) {
    if (this.down) return; const p = this.player; this.down = { kind, t: 0 };
    p.dead = true; p.deadT = 0;
    if (kind === 'busted' && this.missions.active) this.missions.fail('Busted');
    this.hud.overlayText(kind === 'busted' ? 'BUSTED' : 'WASTED', kind === 'busted' ? '#4a8cff' : '#e23b2e');
    this.audio.sting(kind); this.timeScale = 0.45;
  }
  respawn() {
    const p = this.player, kind = this.down.kind, w = this.world; this.down = null; this.timeScale = 1;
    const hosp = w.pois.filter((q) => q.type === (kind === 'busted' ? 'police' : 'hospital')); let best = hosp[0], bd = 1e18;
    for (const q of hosp) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = q; } }
    const at = best || w.spawn, fee = kind === 'busted' ? 220 : 150, paid = Math.min(this.economy.cash, fee); this.economy.cash -= paid;
    p.dead = false; p.hp = p.maxHp; p.armor = 0; p.deadT = 0; p.x = at.x; p.y = at.y + 14; p.vx = p.vy = p.kx = p.ky = 0; p.vehicle = null; p.invuln = 2; p.cooldown = 0;
    this.wanted.clear(); this.wanted.playerShot = false; this.camera.snapTo(p.x, p.y); this.hud.overlayText('');
    this.hud.toast(kind === 'busted' ? `Released on bail. -$${paid}` : `Patched up at the clinic. -$${paid}`, 3600);
    for (const q of this.entities.peds) if (q.role === 'cop' || q.role === 'swat') { q.state = 'idle'; q.data.goal = null; }
  }

  /* ---------- frame ---------- */
  update(rawDt) {
    let dt = Math.min(rawDt, 1 / 20);
    if (this.hitStop > 0) { this.hitStop -= dt; dt *= 0.08; }
    dt *= this.timeScale;
    const sim = this.state === 'play' || this.state === 'title';
    if (sim) {
      this.time += dt; this.clock.update(dt); if (this.state === 'play') this.playTime += rawDt;
      if (this.state === 'play') { this.control.update(dt); this.interact.update(dt); }
      this.entities.update(dt);
      this.vehicles.update(dt);
      this.traffic.update(dt); this.population.update(dt);
      if (this.state === 'play') { this.pickups.update(dt); for (const s of this.systems) s.update(dt); }
      this.props.update(dt); this.fx.update(dt); this.weather.update(dt);
      this.audio.update(dt);
    } else if (this.state === 'ui') { this.fx.update(dt * 0.2); this.time += dt * 0.2; }
    if (this.down) { this.down.t += rawDt; if (this.down.t > 3.4) this.respawn(); }
    this.screens.update(rawDt);
    this.updateCamera(dt);
    this.hud.update(rawDt);
    this.input.endFrame();
  }

  updateCamera(dt) {
    const cam = this.camera, p = this.player; if (!p) return;
    if (this.state === 'title') {
      this.titleT += dt; const t = this.titleT * 0.05, home = this.world.turfs.find((q) => q.name === 'Night Market') || this.world.turfs[0];
      cam.userZoom = 0.9; cam.update(dt, home.cx + Math.cos(t) * 420, home.cy + 60 + Math.sin(t * 1.3) * 260, 0, 0, 1); return;
    }
    const v = p.vehicle, m = this.input.mouse; let fx = p.x, fy = p.y, lx = 0, ly = 0, sz = 1;
    if (v) { fx = v.x; fy = v.y - v.alt * 70; lx = v.vx * 0.42; ly = v.vy * 0.42; sz = v.isAir ? 0.78 - v.alt * 0.2 : v.cls === 'tank' ? 0.85 : clamp(1 - v.speed / 700, 0.7, 1); if (this.cameraMode === 1) sz *= 0.82; else if (this.cameraMode === 2) sz *= 1.15; }
    else if (this.state === 'play') { const mx = (m.x - cam.w / 2) / cam.scale, my = (m.y - cam.h / 2) / cam.scale; lx = mx * 0.22; ly = my * 0.22; if (this.cameraMode === 1) sz = 0.82; else if (this.cameraMode === 2) sz = 1.2; }
    if (!this.settings.shake) cam.trauma = 0;
    cam.update(dt, fx, fy, lx, ly, sz); this._focus.x = p.x; this._focus.y = p.y;
  }

  render(rawDt) {
    const dt = Math.min(rawDt, 1 / 20);
    this.renderer.render(dt, this.player && !this.player.dead && this.state !== 'title' ? this._focus : null);
  }
}
