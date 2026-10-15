import { fmtMoney, clamp, lerp } from '../core/math.js';
import { WEAPONS } from '../data/weapons.js';
import { FACTIONS } from '../data/factions.js';
import { Minimap } from './minimap.js';
import { RANKS } from '../systems/progress.js';
import { rgba } from '../core/color.js';
import { DISTRICT_LIST, DISTRICTS } from '../world/districts.js';

const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const BADGE = '<svg viewBox="0 0 24 24"><path d="M12 1.6l3 6.4 7 .9-5.2 4.8 1.4 6.9L12 17.2 5.8 20.6l1.4-6.9L2 8.9l7-.9z"/></svg>';

// DOM heads-up display. Reads game state each frame; never mutates it.
export class Hud {
  constructor(game) {
    this.game = game; this.root = document.getElementById('hud'); this.cash = 0; this.shownCash = 0; this.toastQueue = []; this.lastDistrict = -1; this.lastTurf = -2; this.bannerT = 0; this.tips = []; this.tipT = 0; this.seenTurf = new Map(); this.lastMajor = -1e9;
    this.build(); this.mini = new Minimap(game);
  }

  build() {
    const r = this.root; r.innerHTML = '';
    const tl = el('div', 'hud-tl');
    tl.innerHTML = `<div class="portrait"><span>龍</span></div><div class="bars"><div class="bar hp"><i></i><b>♥</b></div><div class="bar armor"><i></i><b>◈</b></div><div class="rankchip"><b id="hudRank">Street Rat</b><i><s id="hudXp"></s></i></div></div>`;
    const tr = el('div', 'hud-tr');
    tr.innerHTML = `<div class="cash"><small>CASH</small><span id="hudCash">$0</span></div><div class="stars" id="hudStars">${[0, 1, 2, 3, 4].map(() => `<em>${BADGE}</em>`).join('')}</div><div class="weapon"><div class="wname" id="hudWeapon">Pistol</div><div class="wammo" id="hudAmmo">12</div></div><div class="clock" id="hudClock">19:00</div>`;
    const bl = el('div', 'hud-bl');
    bl.innerHTML = `<div class="radar"><canvas id="hudRadar" width="190" height="190"></canvas><div class="ring"></div></div><div class="loc" id="hudLoc">Dragon Gate</div><div class="radio" id="hudRadio">♫ Jade Lantern FM</div>`;
    r.append(tl, tr, bl, el('div', 'objective', '<span id="hudObj"></span>'), el('div', 'prompt', '<kbd>E</kbd><span id="hudPrompt"></span>'), el('div', 'toasts'), el('div', 'banner', '<div class="b1"></div><div class="b2"></div>'), el('div', 'vig hurt'), el('div', 'vig wanted'), el('div', 'speedo', '<span id="hudSpeed">0</span><small>km/h</small>'), el('div', 'subtitle', ''), el('div', 'bigtext', ''));
    this.$ = (s) => r.querySelector(s);
    this.cashEl = this.$('#hudCash'); this.starsEl = this.$('#hudStars'); this.weaponEl = this.$('#hudWeapon'); this.ammoEl = this.$('#hudAmmo'); this.clockEl = this.$('#hudClock');
    this.hpBar = this.$('.bar.hp i'); this.armorBar = this.$('.bar.armor i'); this.armorWrap = this.$('.bar.armor'); this.radar = this.$('#hudRadar').getContext('2d');
    this.rankEl = this.$('#hudRank'); this.xpEl = this.$('#hudXp'); this.locEl = this.$('#hudLoc'); this.radioEl = this.$('#hudRadio'); this.objEl = this.$('#hudObj'); this.objWrap = this.$('.objective'); this.promptWrap = this.$('.prompt'); this.promptEl = this.$('#hudPrompt');
    this.toastsEl = this.$('.toasts'); this.bannerEl = this.$('.banner'); this.hurtEl = this.$('.vig.hurt'); this.wantedEl = this.$('.vig.wanted'); this.speedoEl = this.$('.speedo'); this.speedEl = this.$('#hudSpeed'); this.subEl = this.$('.subtitle');
    this.game.music.stationChanged = (n) => { this.radioEl.textContent = n === 'Radio Off' ? '♫ off' : '♫ ' + n; };
    this.game.events.on('playerHurt', (e) => { this.hurtT = clamp((this.hurtT || 0) + e.amount / 40, 0, 1); });
    this.game.events.on('cash', (e) => { if (e.amount > 0) { this.cashEl.classList.remove('pop'); void this.cashEl.offsetWidth; this.cashEl.classList.add('pop'); } });
  }

  overlayText(text, color = '#e23b2e') { const b = this.root.querySelector('.bigtext'); b.textContent = text; b.style.setProperty('--c', color); b.style.setProperty('--cg', rgba(color, 0.6)); b.classList.toggle('on', !!text); }
  show(v) { this.root.style.display = v ? '' : 'none'; }

  toast(msg, ms = 2600, kind = '') {
    const t = el('div', 'toast ' + kind, msg); this.toastsEl.appendChild(t);
    setTimeout(() => t.classList.add('out'), ms); setTimeout(() => t.remove(), ms + 400);
    while (this.toastsEl.children.length > 3) this.toastsEl.firstChild.remove();
  }
  // Tutorial tips wait until the player is actually in control (no cutscene/menu open).
  tip(msg, ms = 4200) { if (!this.tips.includes(msg)) this.tips.push(msg); this._tipMs = ms; }
  clearTips() { this.tips.length = 0; }
  banner(title, sub = '', color = '#ffcc33', ms = 3200, minor = false) {
    if (minor && performance.now() - this.lastMajor < 4500) return;
    if (!minor) this.lastMajor = performance.now();
    this.bannerEl.querySelector('.b1').textContent = title; this.bannerEl.querySelector('.b2').textContent = sub; this.bannerEl.style.setProperty('--c', color); this.bannerEl.style.setProperty('--cg', rgba(color, 0.55));
    this.bannerEl.classList.remove('show'); void this.bannerEl.offsetWidth; this.bannerEl.classList.add('show'); clearTimeout(this._bt); this._bt = setTimeout(() => this.bannerEl.classList.remove('show'), ms);
  }
  subtitle(text, ms = 3500) { this.subEl.textContent = text; this.subEl.classList.toggle('on', !!text); clearTimeout(this._st); if (text) this._st = setTimeout(() => this.subEl.classList.remove('on'), ms); }
  showWeapon(id) { this.toast(WEAPONS[id].name, 1200, 'mini'); }
  setObjective(text) { this.objText = text || ''; }

  update(dt) {
    const g = this.game, p = g.player, play = g.state === 'play';
    this.root.classList.toggle('inactive', !p || !play);
    if (!p) return;
    // vitals
    this.hpBar.style.width = clamp(p.hp / p.maxHp * 100, 0, 100) + '%'; this.armorBar.style.width = clamp(p.armor, 0, 100) + '%'; this.armorWrap.classList.toggle('empty', p.armor <= 0);
    this.$('.bar.hp').classList.toggle('low', p.hp < 30);
    // cash roll-up
    const cash = g.economy.cash; this.shownCash = lerp(this.shownCash, cash, 1 - Math.exp(-dt * 8)); if (Math.abs(this.shownCash - cash) < 1) this.shownCash = cash;
    this.cashEl.textContent = fmtMoney(this.shownCash);
    // weapon
    const w = p.weaponDef; this.weaponEl.textContent = w.name; this.ammoEl.textContent = w.ammo ? (p.infiniteAmmo ? '∞' : (p.ammo[w.ammo] || 0)) : '—';
    // wanted
    const wl = g.wantedLevel | 0, flash = wl > 0 && g.wanted && g.wanted.seen;
    this.starsEl.classList.toggle('none', wl === 0);
    [...this.starsEl.children].forEach((s, i) => { s.classList.toggle('on', i < wl); s.classList.toggle('flash', flash && i < wl); });
    this.wantedEl.style.opacity = wl > 0 ? (flash ? 0.55 + Math.sin(g.time * 8) * 0.25 : 0.25) : 0; this.wantedEl.style.setProperty('--phase', Math.sin(g.time * 7) > 0 ? '#ff2a2a' : '#2a4aff');
    // rank
    const pr = g.progress; if (pr) { const base = RANKS[pr.rank].xp, nx = pr.nextXP; if (this.rankEl.textContent !== pr.rankName) this.rankEl.textContent = pr.rankName; this.xpEl.style.width = (nx > base ? clamp((pr.XP - base) / (nx - base), 0, 1) * 100 : 100) + '%'; }
    // clock + location
    this.clockEl.textContent = g.clock.label() + (g.clock.isNight ? '  ☾' : '  ☀');
    const t = g.world.turfAtPx(p.x, p.y), did = g.world.districtAtPx(p.x, p.y);
    if (t !== this.lastTurf) {
      this.lastTurf = t; const turf = t >= 0 ? g.world.turfs[t] : null;
      if (turf) {
        const f = FACTIONS[turf.owner]; this.locEl.innerHTML = `${turf.name}<small style="color:${f.color}">${f.name}${turf.owner === 'jade' ? ' · yours' : turf.owner === 'none' ? ' · unclaimed' : ' · hostile'}</small>`;
        // only announce a turf the first time you enter it, or when it has changed hands since
        if (this.lastDistrict !== -1 && play && this.seenTurf.has(turf.id) && this.seenTurf.get(turf.id) !== turf.owner) this.banner(turf.name.toUpperCase(), turf.owner === 'jade' ? 'Jade Serpent turf · yours' : turf.owner === 'none' ? 'Unclaimed turf' : `${f.name} turf · hostile`, f.color, 2600, true);
        this.seenTurf.set(turf.id, turf.owner);
      }
      this.lastDistrict = did;
    }
    // queued tips
    this.tipT -= dt; if (play && this.tips.length && this.tipT <= 0 && !g.down) { this.toast(this.tips.shift(), this._tipMs || 4200, 'tip'); this.tipT = 4.4; }
    // prompt + objective
    const cur = g.interact.current; this.promptWrap.classList.toggle('on', !!cur && play); if (cur) this.promptEl.textContent = cur.label;
    this.objWrap.classList.toggle('on', !!this.objText && play); if (this.objEl.textContent !== this.objText) this.objEl.textContent = this.objText || '';
    // vehicle speedo
    const v = p.vehicle; this.speedoEl.classList.toggle('on', !!v && play); this.toastsEl.classList.toggle('lift', !!v && play); if (v) this.speedEl.textContent = Math.round(Math.abs(v.fw) * 0.28);
    // damage vignette
    this.hurtT = Math.max(0, (this.hurtT || 0) - dt * 1.8); this.hurtEl.style.opacity = Math.max(this.hurtT, p.hp < 30 && !p.dead ? 0.35 + Math.sin(g.time * 6) * 0.1 : 0);
    // radar
    this.mini.drawRadar(this.radar, 190);
  }

  togglePda() { if (this.game.screens) this.game.screens.togglePda(); }
}
void DISTRICT_LIST; void DISTRICTS;
