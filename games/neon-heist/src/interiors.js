import * as THREE from 'three';
import { G } from './state.js';
import { clamp, dist, rand, pick } from './util.js';
import { signTexture } from './districts.js';
import { weaponShopItems } from './shop.js';

// Interiors are small real rooms built far outside the city (x < -500). Walking into a
// shop door teleports the player there; the shared point lights follow them in.
const W = 16, D = 12, H = 3.8;
const OFFS = { ammu: [-1000, -1000], store: [-1000, -1100], burger: [-1000, -1200], clothes: [-1000, -1300], apartment: [-1000, -1400], hospital: [-1000, -1500], bar: [-1000, -1600], policehq: [-1000, -1700] };

const mats = {};
function mat(c, o = {}) { const k = c + JSON.stringify(o); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, ...o })); }
function floorTex(kind) {
  return signTexture(256, 256, (g) => {
    if (kind === 'check') { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#d9d9d4' : '#3a3d42'; g.fillRect(x * 32, y * 32, 32, 32); } }
    else if (kind === 'wood') { for (let y = 0; y < 8; y++) { g.fillStyle = `hsl(28,${35 + (y % 3) * 6}%,${30 + (y * 7) % 14}%)`; g.fillRect(0, y * 32, 256, 31); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y * 32 + 31, 256, 1); for (let k = 0; k < 4; k++) g.fillRect(((y * 53 + k * 97) % 256), y * 32, 1, 31); } }
    else { g.fillStyle = '#9aa0a4'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 256); g.moveTo(0, i * 32); g.lineTo(256, i * 32); g.stroke(); } }
  });
}

export class Interiors {
  constructor() {
    this.rooms = {}; this.cur = null; this.ret = null; this.busy = false; this.clerks = [];
    // two shared warm lights that follow the player indoors
    this.lights = [new THREE.PointLight(0xffe2b8, 0, 14, 2), new THREE.PointLight(0xffe2b8, 0, 14, 2)];
    for (const l of this.lights) { l.visible = false; G.scene.add(l); }
  }

  rectsAt(x, z) {
    for (const k in this.rooms) { const r = this.rooms[k]; if (x > r.ox - 2 && x < r.ox + W + 2 && z > r.oz - 2 && z < r.oz + D + 2) return r.rects; }
    return [];
  }

  /* ---------- room construction ---------- */
  build(kind) {
    const [ox, oz] = OFFS[kind], g = new THREE.Group(), rects = [], spots = [];
    const add = (w, h, d, x, y, z, m, cast = false) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(ox + x, y, oz + z); b.receiveShadow = true; b.castShadow = cast; g.add(b); return b; };
    const solid = (x, z, w, d, h) => rects.push({ x: ox + x, z: oz + z, w, d, h, y0: 0 });
    const fk = kind === 'burger' || kind === 'store' ? 'check' : kind === 'hospital' || kind === 'policehq' ? 'tile' : 'wood', ft = floorTex(fk); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(W / 4, D / 4);
    add(W, 0.2, D, W / 2, -0.1, D / 2, new THREE.MeshStandardMaterial({ map: ft, roughness: kind === 'hospital' ? 0.4 : 0.55 }));
    const wallC = { ammu: 0x6a5648, store: 0xeaeee6, burger: 0xe9c34a, clothes: 0xcdb8d8, apartment: 0xd9cbb6, hospital: 0xe9f1f4, bar: 0x4a2c22, policehq: 0xc9d2de }[kind];
    add(W, 0.2, D, W / 2, H + 0.1, D / 2, mat(0xd8d8d2, { roughness: 0.9 }));
    const wm = mat(wallC, { roughness: 0.85 });
    add(W + 0.8, H, 0.4, W / 2, H / 2, -0.2, wm); add(W + 0.8, H, 0.4, W / 2, H / 2, D + 0.2, wm); add(0.4, H, D, -0.2, H / 2, D / 2, wm); add(0.4, H, D, W + 0.2, H / 2, D / 2, wm);
    solid(-0.4, -0.4, W + 0.8, 0.4, H); solid(-0.4, D, W + 0.8, 0.4, H); solid(-0.4, 0, 0.4, D, H); solid(W, 0, 0.4, D, H);
    for (let i = 0; i < 3; i++) add(2.4, 0.06, 1.0, 3 + i * 5, H - 0.02, D / 2, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d8, emissiveIntensity: 0.7 }));
    const door = add(2.2, 2.6, 0.12, W / 2, 1.3, D - 0.02, new THREE.MeshStandardMaterial({ color: 0x16222c, roughness: 0.05, metalness: 0.8 }));
    add(2.4, 0.3, 0.14, W / 2, 2.8, D - 0.06, new THREE.MeshStandardMaterial({ color: 0x22aa55, emissive: 0x22ff77, emissiveIntensity: 1.2 })); // exit sign
    spots.push({ x: W / 2, z: D - 0.9, r: 1.2, label: 'Exit', act: () => this.exit() });
    const counter = (x, z, w, d = 1.1, c = 0x5a3e2a) => { add(w, 1.1, d, x + w / 2, 0.55, z + d / 2, mat(c, { roughness: 0.5 }), true); add(w + 0.1, 0.06, d + 0.1, x + w / 2, 1.12, z + d / 2, mat(0xe8e2d4, { roughness: 0.3 })); solid(x, z, w, d, 1.1); };
    const clerkAt = (x, z, look) => spots.push({ clerk: { x: ox + x, z: oz + z, look } });
    const shelf = (x, z, w, d, rows = 4) => { add(w, 2.0, d, x + w / 2, 1.0, z + d / 2, mat(0x8d9096, { metalness: 0.4 }), true); for (let r = 0; r < rows; r++) for (let k = 0; k < Math.floor(Math.max(w, d) / 0.35); k++) { const col = new THREE.Color().setHSL(Math.random(), 0.65, 0.5); const horiz = w > d; add(horiz ? 0.28 : d - 0.1, 0.28, horiz ? w - 0.1 : 0.28, x + (horiz ? 0.2 + k * 0.35 : w / 2), 0.35 + r * 0.45, z + (horiz ? d / 2 : 0.2 + k * 0.35), mat(col.getHex())); } solid(x, z, w, d, 2); };

    if (kind === 'store') {
      counter(10.2, 2.2, 5.0, 1.2, 0x2f6b46); add(0.5, 0.45, 0.4, 12.2, 1.34, 2.8, mat(0x222428)); clerkAt(12.7, 1.4, { shirt: 0x136b3a, pants: 0x222222 });
      for (let i = 0; i < 3; i++) shelf(2.2 + i * 3.2, 4.4, 0.9, 4.6);
      for (let i = 0; i < 4; i++) { add(1.4, 2.1, 0.7, 1 + i * 1.5, 1.05, 0.5, new THREE.MeshStandardMaterial({ color: 0xaecfe0, transparent: true, opacity: 0.4, roughness: 0.05, metalness: 0.4, emissive: 0x6aa8d8, emissiveIntensity: 0.6 })); } solid(0.2, 0.1, 6.4, 0.9, 2.1);
      spots.push({ x: 11.2, z: 3.9, r: 1.3, label: 'Rob the register', show: () => G.missions.canRob() && G.player.w !== 7, act: () => G.missions.rob() });
      spots.push({ x: 13.6, z: 3.9, r: 1.3, label: 'Shop', act: () => this.shop('24/7 MARKET', [
        { label: 'Snack bar', desc: '+20 health', price: 8, action: () => { G.player.hp = Math.min(100, G.player.hp + 20); return 'Yum'; } },
        { label: 'Energy drink', desc: '+45 health', price: 20, action: () => { G.player.hp = Math.min(100, G.player.hp + 45); return 'Energy!'; } },
        { label: 'Lottery ticket', desc: 'scratch to win', price: 10, action: () => { if (Math.random() < 0.03) { const w = pick([50, 100, 250, 1000]); G.money += w; return `You won $${w}!`; } return 'Not a winner...'; } },
        { label: 'First-aid kit', desc: 'full health', price: 60, action: () => { G.player.hp = 100; return 'Patched up'; } },
      ]) });
    } else if (kind === 'burger') {
      counter(2.4, 2.4, 11.2, 1.2, 0xb3261e);
      const menu = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshStandardMaterial({ map: signTexture(1024, 256, (c, w, h) => { c.fillStyle = '#1b1b1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffe35c'; c.font = 'bold 70px Arial Black'; c.fillText('BURGER SHOT', 30, 90); c.fillStyle = '#fff'; c.font = 'bold 44px Arial'; c.fillText('Burger $18   Fries $9   Big Meal $35   Shake $12', 30, 180); }), emissive: 0xffffff, emissiveIntensity: 0.6 }));
      menu.position.set(ox + 8, 2.5, oz + 0.12); g.add(menu);
      for (const [tx, tz] of [[3.5, 7], [7, 8], [10.5, 7], [13, 8]]) { add(1.2, 0.08, 1.2, tx, 0.9, tz, mat(0xe8e2d4), true); add(0.12, 0.9, 0.12, tx, 0.45, tz, mat(0x555555)); for (const s of [-1, 1]) { add(0.5, 0.06, 0.5, tx + s * 1.0, 0.55, tz, mat(0xb3261e)); add(0.1, 0.55, 0.1, tx + s * 1.0, 0.27, tz, mat(0x555555)); } solid(tx - 1.3, tz - 0.6, 2.6, 1.2, 0.95); }
      clerkAt(8, 1.4, { shirt: 0xd1281f, pants: 0x222222 });
      spots.push({ x: 8, z: 4.6, r: 2.2, label: 'Order food', act: () => this.shop('BURGER SHOT', [
        { label: 'Cheese burger', desc: '+35 health', price: 18, action: () => { G.player.hp = Math.min(100, G.player.hp + 35); return 'Tasty!'; } },
        { label: 'Fries', desc: '+15 health', price: 9, action: () => { G.player.hp = Math.min(100, G.player.hp + 15); return 'Crispy.'; } },
        { label: 'Big Meal', desc: 'full health', price: 35, action: () => { G.player.hp = 100; return 'Stuffed!'; } },
        { label: 'Milkshake', desc: '+20 health', price: 12, action: () => { G.player.hp = Math.min(100, G.player.hp + 20); return 'Brain freeze'; } },
      ]) });
    } else if (kind === 'ammu') {
      counter(2.2, 3.6, 11.6, 1.2, 0x2b2b2e);
      const pegs = new THREE.Mesh(new THREE.PlaneGeometry(13, 2.6), new THREE.MeshStandardMaterial({ map: signTexture(1024, 205, (c, w, h) => { c.fillStyle = '#3a3128'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let i = 0; i < 9; i++) { c.fillRect(40 + i * 108, 50 + (i % 2) * 20, 90, 14); c.fillRect(60 + i * 108, 64 + (i % 2) * 20, 18, 46); c.fillRect(110 + i * 108, 66 + (i % 2) * 20, 28, 8); } }), roughness: 0.9 }));
      pegs.position.set(ox + 8, 2.0, oz + 0.12); g.add(pegs);
      for (const x of [3.2, 7, 10.8]) { add(2.4, 1.0, 0.9, x + 0.9, 0.5, 6.8, new THREE.MeshStandardMaterial({ color: 0x202226, roughness: 0.4 }), true); add(2.4, 0.5, 0.9, x + 0.9, 1.25, 6.8, new THREE.MeshStandardMaterial({ color: 0xbfd8e6, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.5 })); solid(x - 0.3, 6.35, 2.4, 0.9, 1.5); }
      clerkAt(8, 2.5, { shirt: 0x7d1616, pants: 0x222222 });
      spots.push({ x: 8, z: 6.0, r: 2.6, label: 'Buy weapons', act: () => this.shop('AMMU-NATION', weaponShopItems) });
    } else if (kind === 'clothes') {
      for (let i = 0; i < 4; i++) { add(0.06, 1.6, 2.6, 0.5, 0.8, 2 + i * 2.7, mat(0x888888, { metalness: 0.7 })); for (let k = 0; k < 7; k++) add(0.1, 0.9, 0.22, 0.7, 1.0, 1 + i * 2.7 + k * 0.32, mat(new THREE.Color().setHSL(Math.random(), 0.6, 0.5).getHex())); solid(0.4, 0.7 + i * 2.7, 0.7, 2.6, 1.6); }
      add(2, 0.9, 2, 8, 0.45, 6.2, mat(0x8a5f3c), true); solid(7, 5.2, 2, 2, 0.9);
      add(3.0, 2.4, 0.08, 14, 1.4, 0.15, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.02, metalness: 1 }));
      counter(10.0, 8.0, 5.0, 1.0, 0x3b2a6b); clerkAt(12.5, 10.2, { shirt: 0x3b2a6b, pants: 0x111111 });
      spots.push({ x: 14, z: 2.0, r: 1.9, label: 'Try on outfits', act: () => this.shop('VELVET & CO', [
        { label: 'Street casual', desc: 'new outfit', price: 40, action: () => G.player.setOutfit(0x2c6fbb, 0x2b3a55) && 'Looking good' },
        { label: 'Leather jacket', desc: 'new outfit', price: 60, action: () => G.player.setOutfit(0x1c1c20, 0x3a3a40) && 'Badass' },
        { label: 'Hawaiian shirt', desc: 'new outfit', price: 45, action: () => G.player.setOutfit(0xe67e22, 0xe8e2d0) && 'Aloha' },
        { label: 'Smart suit', desc: 'new outfit', price: 120, action: () => G.player.setOutfit(0x2a2f3d, 0x23272f) && 'Sharp' },
        { label: 'Original gold jacket', desc: 'back to default', price: 0, action: () => G.player.setOutfit(0xe8a317, 0x1f2a3d) && 'Classic' },
      ]) });
    } else if (kind === 'apartment') {
      add(3.0, 0.5, 4.2, 3.5, 0.25, 4, mat(0x3b4a66), true); add(3.0, 0.15, 0.2, 3.5, 0.9, 1.85, mat(0x5a3e2a)); add(2.8, 0.25, 1.2, 3.5, 0.62, 5.2, mat(0xf2f2ee)); solid(2, 1.9, 3, 4.2, 0.9);
      add(3.4, 0.7, 1.2, 11, 0.35, 8, mat(0x6b3f3f), true); add(3.4, 0.5, 0.3, 11, 0.9, 8.55, mat(0x6b3f3f)); solid(9.3, 7.4, 3.4, 1.2, 0.9);
      add(2.4, 1.4, 0.12, 11, 1.7, 11.6, new THREE.MeshStandardMaterial({ color: 0x050608, emissive: 0x2a6dff, emissiveIntensity: 0.8, roughness: 0.1 })); add(2.2, 0.5, 0.5, 11, 0.5, 11.6, mat(0x3a2a1c)); solid(9.8, 11.2, 2.4, 0.8, 1);
      counter(11, 1.0, 4.2, 1.0, 0xcfc9bd); add(0.8, 0.5, 0.7, 15.2, 1.4, 1.6, mat(0xbbbbbb, { metalness: 0.8 }));
      spots.push({ x: 3.5, z: 6.6, r: 1.9, label: () => (G.missions.prog.safehouse ? 'Sleep & save' : G.missions.prog.story >= 4 ? 'Buy this apartment ($6,000)' : 'Apartment for sale (not available yet)'), act: () => this.bed() });
      spots.push({ x: 13.5, z: 3.2, r: 1.8, label: 'Change clothes', act: () => this.shop('WARDROBE', [
        { label: 'Casual', desc: 'free', price: 0, action: () => G.player.setOutfit(0x2c6fbb, 0x2b3a55) && 'Changed' },
        { label: 'Dark', desc: 'free', price: 0, action: () => G.player.setOutfit(0x1c1c20, 0x3a3a40) && 'Changed' },
        { label: 'Classic gold', desc: 'free', price: 0, action: () => G.player.setOutfit(0xe8a317, 0x1f2a3d) && 'Changed' },
      ]) });
    } else if (kind === 'hospital') {
      for (let i = 0; i < 3; i++) { add(1.0, 0.5, 2.1, 2 + i * 4.5, 0.55, 8, mat(0xf4f4f4), true); add(1.0, 0.1, 0.5, 2 + i * 4.5, 0.85, 7.1, mat(0xffffff)); add(0.06, 1.7, 0.06, 1.5 + i * 4.5, 0.9, 6.2, mat(0xaaaaaa, { metalness: 0.8 })); solid(1.5 + i * 4.5, 6.9, 1.0, 2.2, 0.9); }
      counter(5.0, 3.0, 6.0, 1.2, 0xdfe6ea); clerkAt(8, 1.8, { shirt: 0x4fb7c9, pants: 0xeeeeee });
      add(2.0, 0.9, 0.1, 8, 3.0, 0.1, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9 })); add(0.5, 0.15, 0.12, 8, 3.0, 0.16, new THREE.MeshStandardMaterial({ color: 0xc01818, emissive: 0xff2020, emissiveIntensity: 1.2 })); add(0.15, 0.5, 0.12, 8, 3.0, 0.16, new THREE.MeshStandardMaterial({ color: 0xc01818, emissive: 0xff2020, emissiveIntensity: 1.2 }));
      spots.push({ x: 8, z: 4.8, r: 2.2, label: 'See a doctor', act: () => this.shop('ST. SANTITOS HOSPITAL', [
        { label: 'Full treatment', desc: 'restores all health', price: 60, action: () => { G.player.hp = 100; return 'Good as new'; } },
        { label: 'Quick patch-up', desc: '+40 health', price: 25, action: () => { G.player.hp = Math.min(100, G.player.hp + 40); return 'Patched'; } },
      ]) });
    } else if (kind === 'bar') {
      counter(1.5, 2.2, 10, 1.0, 0x3a2414);
      add(11, 2.2, 0.5, 6.5, 1.1, 0.3, mat(0x2a1a10), true);
      for (let r = 0; r < 3; r++) for (let k = 0; k < 24; k++) add(0.14, 0.34, 0.14, 1.6 + k * 0.42, 0.75 + r * 0.6, 0.7, new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL([0.08, 0.3, 0.55, 0.0][k % 4], 0.7, 0.35), roughness: 0.08, metalness: 0.1, emissive: new THREE.Color().setHSL([0.08, 0.3, 0.55, 0.0][k % 4], 0.8, 0.2), emissiveIntensity: 0.6 }));
      for (let k = 0; k < 6; k++) { add(0.42, 0.08, 0.42, 2.4 + k * 1.6, 0.78, 3.6, mat(0x8a1c2a)); add(0.08, 0.78, 0.08, 2.4 + k * 1.6, 0.39, 3.6, mat(0x777777, { metalness: 0.8 })); }
      add(2.8, 0.18, 1.6, 11.8, 0.85, 7.2, mat(0x1d6b3a, { roughness: 0.95 }), true); add(3.0, 0.14, 1.8, 11.8, 0.72, 7.2, mat(0x3a2414));
      for (const [lx, lz] of [[-1.3, -0.7], [1.3, -0.7], [-1.3, 0.7], [1.3, 0.7]]) add(0.16, 0.7, 0.16, 11.8 + lx, 0.35, 7.2 + lz, mat(0x3a2414)); solid(10.2, 6.3, 3.2, 1.8, 0.95);
      add(1.0, 1.7, 0.7, 15.2, 0.85, 3.2, new THREE.MeshStandardMaterial({ color: 0x40204a, emissive: 0xff5fa2, emissiveIntensity: 0.9, roughness: 0.3 }), true); solid(14.6, 2.8, 1.1, 0.9, 1.7);
      for (const [tx, tz] of [[3, 8.4], [6.2, 9.6]]) { add(1.1, 0.06, 1.1, tx, 0.95, tz, mat(0x3a2414), true); add(0.1, 0.95, 0.1, tx, 0.47, tz, mat(0x222222)); solid(tx - 0.6, tz - 0.6, 1.2, 1.2, 1); }
      const neon = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.1), new THREE.MeshStandardMaterial({ map: signTexture(512, 112, (c, w, h) => { c.fillStyle = '#120a06'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff5fa2'; c.font = 'bold 64px Arial Black'; c.textAlign = 'center'; c.fillText('TIPSY TAXI', w / 2, 80); }), emissive: 0xffffff, emissiveIntensity: 0.3 }));
      neon.position.set(ox + 14, 2.6, oz + 0.12); g.add(neon);
      clerkAt(6.5, 1.3, { shirt: 0x111111, pants: 0x222222 });
      spots.push({ x: 6.5, z: 3.9, r: 2.2, label: 'Order a drink', act: () => this.shop('THE TIPSY TAXI', [
        { label: 'Glass of water', desc: '+5 health', price: 2, action: () => { G.player.hp = Math.min(100, G.player.hp + 5); return 'Refreshing'; } },
        { label: 'Cold beer', desc: '+10 health · a little tipsy', price: 8, action: () => { G.player.hp = Math.min(100, G.player.hp + 10); G.drunk = Math.min(60, (G.drunk || 0) + 15); return 'Cheers!'; } },
        { label: 'Whiskey, neat', desc: '+15 health · drunk', price: 15, action: () => { G.player.hp = Math.min(100, G.player.hp + 15); G.drunk = Math.min(60, (G.drunk || 0) + 30); return 'Whoa...'; } },
        { label: 'Round for the bar', desc: 'everyone loves you', price: 120, action: () => { G.drunk = Math.min(60, (G.drunk || 0) + 10); return 'The bar cheers your name'; } },
      ]) });
      spots.push({ x: 11.8, z: 9.0, r: 1.8, label: 'Play pool ($50 bet)', act: () => {
        if (G.money < 50) { G.hud.toast('You need $50 to play.', 1.6); return; }
        const win = Math.random() < 0.45 - Math.min(0.2, (G.drunk || 0) / 150); G.money += win ? 50 : -50; if (win) G.audio.cash();
        G.hud.toast(win ? 'You sink the 8-ball. +$50' : 'You scratch on the 8-ball. -$50', 2);
      } });
    } else if (kind === 'policehq') {
      counter(4, 3.0, 8, 1.2, 0x2a3550); add(8, 0.25, 0.1, 8, 1.6, 3.6, new THREE.MeshStandardMaterial({ color: 0xbfd8e6, transparent: true, opacity: 0.35, roughness: 0.05 }));
      for (let k = 0; k < 2; k++) { add(0.5, 0.45, 3.2, 0.6, 0.23, 4 + k * 4, mat(0x4a4f58), true); solid(0.3, 2.4 + k * 4, 0.6, 3.2, 0.5); }
      const board = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.2), new THREE.MeshStandardMaterial({ map: signTexture(512, 282, (c, w, h) => {
        c.fillStyle = '#6b4a2a'; c.fillRect(0, 0, w, h); c.font = 'bold 26px Arial Black'; c.textAlign = 'center';
        for (let k = 0; k < 4; k++) { const x = 18 + k * 124; c.fillStyle = '#efe6cf'; c.fillRect(x, 24, 106, 236); c.fillStyle = '#a01010'; c.fillText('WANTED', x + 53, 54); c.fillStyle = '#555'; c.beginPath(); c.arc(x + 53, 120, 34, 0, 6.3); c.fill(); c.fillRect(x + 23, 158, 60, 50); c.fillStyle = '#222'; c.font = 'bold 20px Arial'; c.fillText('$' + (800 + k * 300), x + 53, 240); c.font = 'bold 26px Arial Black'; }
      }), roughness: 0.9 }));
      board.position.set(ox + 13, 1.8, oz + 0.12); g.add(board);
      add(1.4, 0.9, 0.1, 3, 2.8, 0.1, new THREE.MeshStandardMaterial({ color: 0x14307a, emissive: 0x2a54c8, emissiveIntensity: 0.6 }));
      clerkAt(8, 1.8, { shirt: 0x1d2b5a, pants: 0x1a2238 });
      spots.push({ x: 8, z: 5.0, r: 2.2, label: 'Front desk', act: () => this.shop('POLICE HQ — FRONT DESK', () => [
        G.wanted > 0
          ? { label: `Pay outstanding fines`, desc: `clears your ${G.wanted}★ wanted level`, price: 250 * G.wanted, action: () => { G.police.reset(); return 'All square. Behave yourself.'; } }
          : { label: 'No outstanding fines', desc: 'you\'re clean', price: 0, disabled: true, action: () => false },
        { label: 'Body armor (surplus)', desc: '+50 armor', price: 150, action: () => { G.player.armor = Math.min(100, (G.player.armor || 0) + 50); return 'Strapped in'; } },
      ]) });
      spots.push({ x: 13, z: 1.6, r: 1.9, label: () => (G.missions.active ? 'Bounty board (finish your current job first)' : G.missions.prog.story < 1 ? 'Bounty board (not available yet)' : 'Take a bounty'), act: () => {
        const M = G.missions; if (M.active || M.prog.story < 1) return; M.start(M.bounty()); G.hud.toast('Head outside — the target is on the minimap.', 3);
      } });
    }
    G.scene.add(g); g.userData.noAO = true; g.traverse((o) => { if (o.isMesh) o.userData.noAO = false; });
    const room = { kind, ox, oz, rects, spots, group: g };
    return (this.rooms[kind] = room);
  }

  /* ---------- gameplay ---------- */
  enter(door) {
    if (this.busy || this.cur) return;
    if (G.wanted > 0 && G.police.seen()) { G.hud.toast("The clerk won't open up with cops on your tail", 2); return; }
    const P = G.player; this.busy = true;
    G.hud.fade(() => {
      const room = this.rooms[door.kind] || this.build(door.kind);
      this.cur = room; this.ret = { x: door.x, z: door.z, dx: door.dx || 0, dz: door.dz || 0, yaw: Math.atan2(door.dz || 1, door.dx || 0) }; P.inside = room;
      P.x = room.ox + W / 2; P.z = room.oz + D - 2.6; P.vx = P.vz = 0; P.a = -Math.PI / 2; G.camRig.yaw = -Math.PI / 2; G.camRig.pitch = 0.32;
      G.indoor = true; G.camRig.inited = false;
      this.lights[0].position.set(room.ox + 4, 2.4, room.oz + 4); this.lights[1].position.set(room.ox + 12, 2.4, room.oz + 8); for (const l of this.lights) { l.intensity = 7; l.visible = true; }
      this.clearClerks();
      for (const s of room.spots) if (s.clerk) { const p = G.peds.create(s.clerk.x, s.clerk.z, 'civ', s.clerk.look); p.state = 'static'; p.hp = 9999; p.a = Math.PI / 2; p.model.root.rotation.y = -p.a; this.clerks.push(p); }
      this.busy = false;
    });
  }
  exit() {
    if (this.busy || !this.cur) return;
    this.busy = true;
    G.hud.fade(() => {
      const P = G.player, r = this.ret;
      P.x = r.x + r.dx * 1.6; P.z = r.z + r.dz * 1.6; P.vx = P.vz = 0; P.inside = null; this.cur = null; G.indoor = false; G.shop.close();
      G.camRig.yaw = r.yaw; G.camRig.pitch = 0.3; G.camRig.inited = false;
      for (const l of this.lights) { l.intensity = 0; l.visible = false; } this.clearClerks(); this.busy = false;
      G.missions.onExitInterior();
    });
  }
  clearClerks() { for (const p of this.clerks) { p.state = 'dead'; p.t = 99; } this.clerks.length = 0; }
  shop(title, items) { const room = this.cur; const clerk = this.clerks[0]; G.shop.show(title, typeof items === 'function' ? items() : items, clerk); }
  bed() {
    const M = G.missions;
    if (M.prog.safehouse) return this.sleep();
    if (M.prog.story < 4) { G.hud.toast('The landlord isn\'t selling to you... yet.', 2); return; }
    if (G.money < 6000) { G.hud.toast('You need $6,000 to buy this apartment.', 2); return; }
    G.money -= 6000; M.prog.safehouse = true; M.save(); G.audio.cash(); G.hud.big('SAFEHOUSE PURCHASED', 2.5, '#7ed957'); G.hud.toast('Sleep here to save and skip the night.', 3);
  }
  sleep() {
    G.hud.fade(() => { G.sky.tod = 2 / 24; G.player.hp = 100; G.wanted = 0; G.heat = 0; G.missions.save(); G.hud.toast('You slept until 8:00 AM. Game saved.', 3); }, 1400);
  }

  update(dt) {
    const P = G.player; G.interact = null; G.nearDoor = null;
    if (this.cur) {
      for (const s of this.cur.spots) {
        if (!s.label || (s.show && !s.show())) continue;
        const d = dist(P.x, P.z, this.cur.ox + s.x, this.cur.oz + s.z);
        if (d < s.r) { G.interact = `[E] ${typeof s.label === 'function' ? s.label() : s.label}`; G.spot = s; break; }
      }
      if (!G.interact) G.spot = null;
      return;
    }
    if (P.car || P.dead) return;
    for (const d of G.city.doors) { if (d.drive) continue; if (dist(P.x, P.z, d.x, d.z) < 2.3) { G.nearDoor = d; G.interact = `[E] Enter ${d.name}`; break; } }
  }
}
