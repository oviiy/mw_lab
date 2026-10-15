import { G } from './state.js';
import { WEAPONS, WHEEL_ORDER } from './combat.js';
import { TAU } from './util.js';

// Pictograms are drawn with canvas rectangles/paths — no image files.
export function drawWeaponIcon(canvas, id, color = '#fff') {
  const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
  g.clearRect(0, 0, W, H); g.fillStyle = color; g.strokeStyle = color; g.lineCap = 'round'; g.lineWidth = 4;
  const R = (x, y, w, h) => g.fillRect(x, y, w, h);
  g.save(); g.translate(W / 2 - 48, H / 2 - 28);
  if (id === 'pistol') { R(14, 18, 52, 10); R(20, 14, 40, 5); g.beginPath(); g.moveTo(20, 27); g.lineTo(36, 27); g.lineTo(32, 50); g.lineTo(16, 50); g.closePath(); g.fill(); R(38, 28, 8, 5); }
  else if (id === 'smg') { R(8, 18, 62, 11); R(70, 21, 14, 4); R(28, 29, 8, 24); R(46, 29, 7, 14); R(2, 20, 8, 7); }
  else if (id === 'shotgun') { R(4, 20, 84, 5); R(4, 26, 70, 4); g.beginPath(); g.moveTo(70, 18); g.lineTo(92, 20); g.lineTo(92, 34); g.lineTo(70, 30); g.closePath(); g.fill(); R(34, 24, 14, 9); }
  else if (id === 'rifle') { R(18, 20, 60, 9); R(78, 22, 14, 4); R(2, 20, 18, 11); g.beginPath(); g.moveTo(40, 29); g.lineTo(52, 29); g.lineTo(46, 50); g.lineTo(34, 50); g.closePath(); g.fill(); R(30, 14, 22, 6); R(56, 29, 6, 14); }
  else if (id === 'sniper') { R(2, 24, 92, 5); R(2, 20, 26, 12); R(34, 14, 26, 7); R(30, 12, 4, 10); R(60, 12, 4, 10); R(44, 29, 8, 14); }
  else if (id === 'rpg') { R(10, 16, 74, 14); g.beginPath(); g.moveTo(84, 12); g.lineTo(94, 8); g.lineTo(94, 38); g.lineTo(84, 34); g.closePath(); g.fill(); R(32, 30, 8, 18); R(54, 6, 6, 10); g.beginPath(); g.moveTo(4, 20); g.lineTo(16, 16); g.lineTo(16, 30); g.lineTo(4, 26); g.closePath(); g.fill(); }
  else if (id === 'grenade') { g.beginPath(); g.ellipse(48, 32, 17, 20, 0, 0, TAU); g.fill(); R(42, 8, 12, 8); g.lineWidth = 3; g.beginPath(); g.arc(60, 12, 8, 0, TAU); g.stroke(); }
  else { g.lineWidth = 9; g.beginPath(); g.moveTo(14, 48); g.lineTo(82, 10); g.stroke(); g.lineWidth = 14; g.beginPath(); g.moveTo(14, 48); g.lineTo(22, 43); g.stroke(); }
  g.restore();
}

export class WeaponWheel {
  constructor() {
    this.root = document.getElementById('wheel'); this.name = document.getElementById('wheelName'); this.slots = [];
    this.icon = document.getElementById('wpnIcon'); this.iconId = null;
    WHEEL_ORDER.forEach((wi, k) => {
      const ang = -Math.PI / 2 + (k * TAU) / 8, el = document.createElement('div'); el.className = 'slot';
      el.style.left = `calc(50% + ${Math.cos(ang).toFixed(3)} * min(200px, 38vmin))`; el.style.top = `calc(50% + ${Math.sin(ang).toFixed(3)} * min(150px, 29vmin))`;
      const cv = document.createElement('canvas'); cv.width = 96; cv.height = 56; drawWeaponIcon(cv, WEAPONS[wi].id);
      const nm = document.createElement('span'), am = document.createElement('b'); nm.textContent = `${k + 1} · ${WEAPONS[wi].name}`;
      el.append(cv, nm, am); this.root.appendChild(el); this.slots.push({ el, wi, am });
    });
    this.open = false; this.vx = 0; this.vy = 0; this.sel = -1;
  }

  ammoText(i) { const p = G.player; return WEAPONS[i].melee ? '' : p.owned[i] ? `${p.ammo[i]}` : 'locked'; }

  begin() { this.open = true; this.vx = this.vy = 0; this.sel = WHEEL_ORDER.indexOf(G.player.w); this.root.classList.add('on'); document.body.classList.add('wheelopen'); this.refresh(); }
  end() { this.open = false; this.root.classList.remove('on'); document.body.classList.remove('wheelopen'); const s = this.sel; if (s >= 0) G.player.setWeapon(WHEEL_ORDER[s]); }

  // Drive the selection from raw mouse movement (pointer locked) or the cursor position (otherwise).
  move(dx, dy, absolute) {
    if (absolute) { this.vx = dx; this.vy = dy; } else { this.vx += dx; this.vy += dy; const l = Math.hypot(this.vx, this.vy); if (l > 120) { this.vx *= 120 / l; this.vy *= 120 / l; } }
    if (Math.hypot(this.vx, this.vy) > 28) { let a = Math.atan2(this.vy, this.vx) + Math.PI / 2; a = ((a % TAU) + TAU) % TAU; this.sel = Math.round(a / (TAU / 8)) % 8; }
    this.refresh();
  }

  refresh() {
    const p = G.player;
    this.slots.forEach((s, k) => { s.el.classList.toggle('sel', k === this.sel); s.el.classList.toggle('locked', !p.canUse(s.wi)); s.am.textContent = this.ammoText(s.wi); });
    const wi = this.sel >= 0 ? WHEEL_ORDER[this.sel] : p.w;
    this.name.innerHTML = `${WEAPONS[wi].name}<small>${p.owned[wi] ? (WEAPONS[wi].melee ? 'melee' : `${p.ammo[wi]} rounds`) : 'not owned — buy at Ammu-Nation'}</small>`;
  }

  updateIcon() {
    const p = G.player, id = WEAPONS[p.w].id; if (this.iconId !== id) { this.iconId = id; drawWeaponIcon(this.icon, id); }
  }
}
