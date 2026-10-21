'use strict';
/* 漂流日志 · 渲染层（Canvas 2D，等距视角） */

const cv = document.getElementById('view'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1, T = 0;
function resize() { DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
addEventListener('resize', resize); resize();

/* ---------- 小工具 ---------- */
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const shade = (c, k) => c.map(v => clamp(Math.round(v * k), 0, 255));
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const tkey = (x, y) => x + ',' + y;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

/* ---------- 光照调色板（按一天中的小时） ---------- */
const PAL = [
  [0,    [5, 16, 28],   [10, 34, 50],   .52],
  [4.5,  [7, 20, 34],   [14, 40, 58],   .48],
  [6,    [44, 58, 86],  [118, 112, 128], .14],
  [7.5,  [20, 82, 104], [52, 134, 154], 0],
  [12,   [16, 94, 120], [56, 160, 178], 0],
  [16.5, [20, 82, 108], [64, 136, 154], 0],
  [18.3, [52, 50, 82],  [168, 104, 92], .12],
  [19.6, [12, 28, 46],  [22, 48, 68],   .42],
  [24,   [5, 16, 28],   [10, 34, 50],   .52],
];
function palette(h, weather) {
  let i = 1; while (i < PAL.length - 1 && PAL[i][0] < h) i++;
  const a = PAL[i - 1], b = PAL[i], k = clamp((h - a[0]) / (b[0] - a[0]), 0, 1);
  let deep = mix(a[1], b[1], k), light = mix(a[2], b[2], k), dark = lerp(a[3], b[3], k);
  const grey = { storm: [.45, [34, 44, 52]], rain: [.28, [46, 58, 66]], fog: [.38, [150, 160, 166]], cloud: [.1, [60, 80, 90]] }[weather];
  if (grey) { deep = mix(deep, grey[1], grey[0]); light = mix(light, grey[1], grey[0]); if (weather === 'storm') dark += .12; }
  const warm = (h > 5.4 && h < 7.6) ? 1 - Math.abs(h - 6.4) / 1.2 : (h > 16.8 && h < 19.6) ? 1 - Math.abs(h - 18.3) / 1.4 : 0;
  return { deep, light, dark: clamp(dark, 0, .62), warm: clamp(warm, 0, 1) * (weather === 'storm' ? .2 : 1), sun: clamp(Math.sin((h - 6) / 13 * Math.PI), 0, 1) };
}

/* ---------- 等距投影 ---------- */
const ISO = { tw: 170, th: 85, cx: 0, cy: 0, s: 1.5 };
function iso(gx, gy) { return [ISO.cx + (gx - gy) * ISO.tw / 2, ISO.cy + (gx + gy) * ISO.th / 2]; }
function unIso(sx, sy) { const a = (sx - ISO.cx) / (ISO.tw / 2), b = (sy - ISO.cy) / (ISO.th / 2); return [(a + b) / 2, (b - a) / 2]; }
function diamond(x, y, k = 1, c = ctx) { const w = ISO.tw / 2 * k, h = ISO.th / 2 * k; c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + w, y); c.lineTo(x, y + h); c.lineTo(x - w, y); c.closePath(); }
function box3(x, y, w, d, z, top, left, right, c = ctx) {
  // 以 (x,y) 为底面中心的等距长方体；w 沿屏幕宽，d 为底面菱形半高
  const hw = w / 2, hd = d / 2;
  c.fillStyle = left; c.beginPath(); c.moveTo(x - hw, y - z); c.lineTo(x, y + hd - z); c.lineTo(x, y + hd); c.lineTo(x - hw, y); c.closePath(); c.fill();
  c.fillStyle = right; c.beginPath(); c.moveTo(x + hw, y - z); c.lineTo(x, y + hd - z); c.lineTo(x, y + hd); c.lineTo(x + hw, y); c.closePath(); c.fill();
  c.fillStyle = top; c.beginPath(); c.moveTo(x, y - hd - z); c.lineTo(x + hw, y - z); c.lineTo(x, y + hd - z); c.lineTo(x - hw, y - z); c.closePath(); c.fill();
}
function cyl(x, y, r, h, top, side, c = ctx) {
  const ry = r * .5;
  const g = c.createLinearGradient(x - r, 0, x + r, 0); g.addColorStop(0, shade(side, .7).toString() ? rgb(shade(side, .75)) : side); g.addColorStop(.45, rgb(side)); g.addColorStop(1, rgb(shade(side, .55)));
  c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r, ry, 0, 0, Math.PI); c.lineTo(x - r, y - h); c.ellipse(x, y - h, r, ry, 0, Math.PI, 0, true); c.closePath(); c.fill();
  c.fillStyle = rgb(top); c.beginPath(); c.ellipse(x, y - h, r, ry, 0, 0, Math.PI * 2); c.fill();
}
function softShadow(x, y, rx, ry, a = .3) { ctx.fillStyle = `rgba(0,10,18,${a})`; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }

/* ---------- 海面 ---------- */
const CRESTS = Array.from({ length: 260 }, () => ({ x: Math.random(), y: Math.random(), s: rand(.5, 1.3), p: rand(0, 6.3) }));
const GLINTS = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), p: rand(0, 6.3) }));
const CLOUDS = Array.from({ length: 4 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: rand(.18, .32), v: rand(.004, .009) }));
let lightCanvas = null;

function drawWater(R, pal, dt, flow) {
  // 底色：围绕木筏的径向渐变
  const g = ctx.createRadialGradient(ISO.cx, ISO.cy, 40, ISO.cx, ISO.cy, Math.max(W, H) * .75);
  g.addColorStop(0, rgb(mix(pal.deep, pal.light, .45))); g.addColorStop(.55, rgb(mix(pal.deep, pal.light, .15))); g.addColorStop(1, rgb(shade(pal.deep, .8)));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const storm = R.weather === 'storm' ? 1 : R.weather === 'rain' ? .5 : 0;
  // 深色涌浪带
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const off = ((i / 9 + T * .006 * (1 + storm)) % 1) * (H + W * .5) - W * .25;
    ctx.strokeStyle = rgb(shade(pal.deep, .75), .18); ctx.lineWidth = 60 + i % 3 * 20;
    ctx.beginPath(); ctx.moveTo(-50, off); ctx.bezierCurveTo(W * .3, off - 40 + Math.sin(T * .3 + i) * 20, W * .7, off + 30, W + 50, off - W * .1); ctx.stroke();
  }
  // 浪尖（沿等距方向）
  const crest = mix(pal.light, [235, 250, 250], .55);
  CRESTS.forEach(c => {
    c.x += flow[0] * dt * .012 * c.s; c.y += flow[1] * dt * .012 * c.s;
    if (c.x < -.05) c.x += 1.1; if (c.x > 1.05) c.x -= 1.1; if (c.y < -.05) c.y += 1.1; if (c.y > 1.05) c.y -= 1.1;
    const a = (.35 + .35 * Math.sin(T * 1.6 + c.p)) * (.35 + storm * .4);
    const x = c.x * W, y = c.y * H, L = (14 + c.s * 22) * (1 + storm * .4);
    ctx.strokeStyle = rgb(crest, a * .55); ctx.lineWidth = 1.4 + storm;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + L * .5, y + L * .25 - 3 - storm * 3, x + L, y + L * .5); ctx.stroke();
  });
  // 阳光闪烁
  if (pal.sun > .2 && (R.weather === 'sun' || R.weather === 'cloud')) {
    GLINTS.forEach(gl => { const a = Math.max(0, Math.sin(T * 3 + gl.p * 3)) * pal.sun * (R.weather === 'sun' ? .9 : .4); if (a < .05) return; ctx.fillStyle = `rgba(255,252,235,${a})`; ctx.fillRect(gl.x * W + Math.sin(T + gl.p) * 4, gl.y * H, 5, 1.5); });
  }
  // 云影
  if (pal.sun > .1 && R.weather !== 'fog') {
    CLOUDS.forEach(c => {
      c.x += c.v * dt; if (c.x > 1.4) { c.x = -.4; c.y = Math.random(); }
      const x = c.x * W, y = c.y * H, r = c.r * W;
      const cg = ctx.createRadialGradient(x, y, 0, x, y, r); cg.addColorStop(0, `rgba(0,20,30,${.14 * pal.sun})`); cg.addColorStop(1, 'rgba(0,20,30,0)');
      ctx.fillStyle = cg; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    });
  }
}

/* ---------- 港口（准备阶段的码头视图） ---------- */
const HARBOR_BLD = Array.from({ length: 16 }, (_, i) => ({ gx: -9 + i * 1.25 + (i % 3) * .2, gy: -5.4 - (i % 4) * .9, w: rand(.9, 1.3), h: rand(50, 150), c: pick(['#8a8478', '#a4927a', '#6f7a80', '#9c6f5a', '#7d8a77', '#b0a58f']), win: Math.random() }));
function drawHarbor(R, pal) {
  const s = ISO.s;
  // 陆地
  const a = iso(-30, -3.55), b = iso(30, -3.55), c2 = iso(30, -40), d = iso(-30, -40);
  ctx.fillStyle = rgb(mix([96, 94, 86], pal.deep, .25)); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c2); ctx.lineTo(...d); ctx.fill();
  // 堤岸立面
  const a2 = iso(-30, -3.55), b2 = iso(30, -3.55);
  ctx.fillStyle = rgb(mix([70, 68, 62], pal.deep, .3)); ctx.beginPath(); ctx.moveTo(...a2); ctx.lineTo(...b2); ctx.lineTo(b2[0], b2[1] + 18 * s); ctx.lineTo(a2[0], a2[1] + 18 * s); ctx.fill();
  ctx.fillStyle = 'rgba(20,40,40,.35)'; ctx.beginPath(); ctx.moveTo(a2[0], a2[1] + 12 * s); ctx.lineTo(b2[0], b2[1] + 12 * s); ctx.lineTo(b2[0], b2[1] + 18 * s); ctx.lineTo(a2[0], a2[1] + 18 * s); ctx.fill();
  // 建筑
  [...HARBOR_BLD].sort((p, q) => (p.gx + p.gy) - (q.gx + q.gy)).forEach(bd => {
    const [x, y] = iso(bd.gx, bd.gy), col = hex(bd.c), lit = mix(col, pal.deep, .25);
    box3(x, y, ISO.tw * bd.w, ISO.th * bd.w, bd.h * s, rgb(shade(lit, 1.12)), rgb(shade(lit, .8)), rgb(shade(lit, .62)));
    // 窗户
    const night = pal.dark > .2;
    for (let r = 1; r < bd.h / 22; r++) for (let k = 1; k < 4; k++) {
      const on = night && hash(bd.gx * 3 + k, r) > .55;
      ctx.fillStyle = on ? 'rgba(255,205,120,.9)' : 'rgba(30,40,50,.45)';
      const wx = x - ISO.tw * bd.w / 2 + k * ISO.tw * bd.w / 8, wy = y - r * 22 * s + k * ISO.th * bd.w / 8;
      ctx.fillRect(wx, wy - 6 * s, 5 * s, 7 * s);
    }
  });
  // 码头栈桥
  for (let gx = -8; gx <= 8; gx++) {
    const [x, y] = iso(gx, -2.75);
    ctx.fillStyle = '#3d2a1a'; ctx.fillRect(x - 2 * s, y, 4 * s, 22 * s);
    ctx.fillStyle = rgb(mix([120, 90, 60], pal.deep, .2)); diamond(x, y, .98); ctx.save(); ctx.scale(1, 1); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(40,25,10,.4)'; ctx.lineWidth = 1; for (let k = -2; k <= 2; k++) { const p0 = iso(gx - .5, -2.75 + k * .2), p1 = iso(gx + .5, -2.75 + k * .2); ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.stroke(); }
    if (gx % 3 === 0) { cyl(x + 10 * s, y - 4 * s, 5 * s, 10 * s, [60, 60, 60], [40, 40, 42]); }
  }
  // 缆绳：码头 → 木筏
  const [px, py] = iso(-1, -2.75), [rx, ry] = iso(-1, -1.5);
  ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py - 6 * s); ctx.quadraticCurveTo((px + rx) / 2, (py + ry) / 2 + 14 * s, rx, ry - 4 * s); ctx.stroke();
  // 吊车
  const [cx2, cy2] = iso(6, -4.2);
  ctx.strokeStyle = '#d0a23a'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2, cy2 - 190 * s); ctx.lineTo(cx2 - 150 * s, cy2 - 150 * s); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(cx2 - 120 * s, cy2 - 158 * s); ctx.lineTo(cx2 - 120 * s, cy2 - 80 * s); ctx.stroke();
  box3(cx2 - 120 * s, cy2 - 60 * s, 40 * s, 20 * s, 20 * s, '#b4503c', '#8a3a2a', '#6e2e22');
}

/* ---------- 漂浮物（被淹的城市） ---------- */
function newDebris(far) {
  const side = Math.random() < .5 ? -1 : 1;
  return { type: pick(['roof', 'roof', 'building', 'tree', 'tree', 'sign', 'car', 'crate', 'barrel']), gx: far ? rand(-9, 9) : 10, gy: side * rand(3.6, 8), r: Math.random(), h: rand(20, 70) };
}
function drawDebris(d, pal) {
  const [x, y] = iso(d.gx, d.gy), s = ISO.s, bob = Math.sin(T * 1.2 + d.r * 9) * 2 * s;
  const wet = rgb(mix(pal.deep, pal.light, .3), .55);
  ctx.save(); ctx.translate(x, y + bob);
  softShadow(0, 10 * s, 46 * s, 14 * s, .18);
  switch (d.type) {
    case 'roof': {
      const c = pick.call ? [[150, 72, 56], [92, 96, 110], [120, 100, 80]][Math.floor(d.r * 3)] : [150, 72, 56];
      const lc = mix(c, pal.deep, .3);
      ctx.fillStyle = rgb(shade(lc, 1.1)); ctx.beginPath(); ctx.moveTo(-50 * s, 0); ctx.lineTo(0, -28 * s); ctx.lineTo(10 * s, -24 * s); ctx.lineTo(-40 * s, 4 * s); ctx.fill();
      ctx.fillStyle = rgb(shade(lc, .75)); ctx.beginPath(); ctx.moveTo(10 * s, -24 * s); ctx.lineTo(50 * s, -4 * s); ctx.lineTo(0, 22 * s); ctx.lineTo(-40 * s, 4 * s); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-40 * s + i * 8 * s, 4 * s - i * 4.8 * s); ctx.lineTo(i * 8 * s, 22 * s - i * 4.8 * s); ctx.stroke(); }
      ctx.fillStyle = wet; ctx.beginPath(); ctx.ellipse(0, 12 * s, 54 * s, 12 * s, 0, 0, Math.PI); ctx.fill();
      break;
    }
    case 'building': {
      const col = mix([130, 128, 120], pal.deep, .35);
      box3(0, 0, 90 * s, 45 * s, d.h * .5 * s, rgb(shade(col, 1.1)), rgb(shade(col, .8)), rgb(shade(col, .62)));
      cyl(18 * s, -d.h * .5 * s - 2 * s, 9 * s, 16 * s, [150, 140, 120], [110, 100, 85]);
      box3(-18 * s, -d.h * .5 * s, 20 * s, 10 * s, 8 * s, '#999', '#777', '#666');
      ctx.fillStyle = wet; ctx.beginPath(); ctx.moveTo(-45 * s, 0); ctx.lineTo(0, 22 * s); ctx.lineTo(45 * s, 0); ctx.lineTo(45 * s, 4 * s); ctx.lineTo(0, 26 * s); ctx.lineTo(-45 * s, 4 * s); ctx.fill();
      break;
    }
    case 'tree': { const g = mix([46, 84, 52], pal.deep, .35); for (let i = 0; i < 5; i++) { ctx.fillStyle = rgb(shade(g, .85 + i * .06)); ctx.beginPath(); ctx.arc(-16 * s + i * 8 * s, -6 * s - (i % 2) * 7 * s, 12 * s, 0, 7); ctx.fill(); } break; }
    case 'sign': ctx.fillStyle = '#555'; ctx.fillRect(-2 * s, -10 * s, 4 * s, 14 * s); ctx.fillStyle = '#2f7a4a'; rr(ctx, -30 * s, -32 * s, 60 * s, 22 * s, 3 * s); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = `bold ${10 * s}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('港湾路 →', 0, -21 * s); break;
    case 'car': ctx.fillStyle = rgb(mix([168, 50, 44], pal.deep, .3)); ctx.beginPath(); ctx.ellipse(0, 0, 30 * s, 12 * s, -.45, Math.PI, 0); ctx.fill(); ctx.fillStyle = 'rgba(160,210,230,.55)'; ctx.beginPath(); ctx.ellipse(0, -5 * s, 16 * s, 5 * s, -.45, Math.PI, 0); ctx.fill(); break;
    case 'crate': box3(0, 0, 30 * s, 15 * s, 13 * s, '#9a7748', '#755634', '#5f4428'); break;
    case 'barrel': cyl(0, 0, 9 * s, 16 * s, [70, 120, 160], [40, 90, 130]); break;
  }
  ctx.restore();
}

/* ---------- 地标（海图目的地） ---------- */
function drawLandmark(R, pal) {
  const L = R.land; if (!L) return;
  const gx = lerp(9, 2.4, L.k), gy = lerp(-10, -4.4, L.k), [x, y] = iso(gx, gy), s = ISO.s;
  const night = pal.dark > .25;
  ctx.save(); ctx.globalAlpha = clamp(L.k * 2, 0, 1);
  softShadow(x, y + 10 * s, 80 * s, 22 * s, .2);
  switch (L.type) {
    case 'rooftop': {
      const col = mix([128, 122, 112], pal.deep, .3);
      box3(x, y, 180 * s, 90 * s, 34 * s, rgb(shade(col, 1.08)), rgb(shade(col, .78)), rgb(shade(col, .6)));
      cyl(x + 30 * s, y - 40 * s, 16 * s, 34 * s, [150, 140, 120], [110, 98, 82]);
      box3(x - 40 * s, y - 34 * s, 36 * s, 18 * s, 14 * s, '#9aa', '#788', '#667');
      ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 90 * s, y - 34 * s); ctx.lineTo(x, y + 11 * s - 34 * s); ctx.lineTo(x + 90 * s, y - 34 * s); ctx.stroke();
      break;
    }
    case 'container': {
      ctx.translate(x, y); ctx.rotate(-.06);
      box3(0, 0, 150 * s, 75 * s, 46 * s, '#c8503e', '#9a3a2c', '#7a2c22');
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; for (let i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo(-75 * s + i * 7.5 * s, -46 * s + i * 3.75 * s); ctx.lineTo(-75 * s + i * 7.5 * s, i * 3.75 * s); ctx.stroke(); }
      ctx.fillStyle = '#fff'; ctx.font = `bold ${12 * s}px sans-serif`; ctx.fillText('MAERA', -60 * s, -12 * s);
      break;
    }
    case 'lighthouse': {
      box3(x, y, 120 * s, 60 * s, 16 * s, '#777', '#555', '#444');
      for (let i = 0; i < 6; i++) cyl(x, y - 16 * s - i * 34 * s, (26 - i * 1.6) * s, 34 * s, [230, 230, 225], i % 2 ? [220, 220, 215] : [196, 60, 50]);
      const ty = y - 16 * s - 6 * 34 * s;
      cyl(x, ty, 18 * s, 22 * s, [50, 50, 50], night ? [255, 220, 140] : [180, 200, 210]);
      if (night) { ctx.globalCompositeOperation = 'lighter'; const a = T * .8; const bx = Math.cos(a) * 900, by = Math.sin(a) * 450;
        const bg = ctx.createLinearGradient(x, ty, x + bx, ty + by); bg.addColorStop(0, 'rgba(255,230,160,.45)'); bg.addColorStop(1, 'rgba(255,230,160,0)');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(x, ty - 10 * s); ctx.lineTo(x + bx - by * .12, ty + by + bx * .12); ctx.lineTo(x + bx + by * .12, ty + by - bx * .12); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      break;
    }
    case 'survivors': {
      for (let i = 0; i < 3; i++) { const [lx, ly] = [x - 30 * s + i * 20 * s, y - 10 * s + i * 10 * s]; ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 12 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx - 30 * s, ly - 15 * s); ctx.lineTo(lx + 30 * s, ly + 15 * s); ctx.stroke(); }
      drawPerson(x, y - 4 * s, { col: [200, 70, 60], wave: true });
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 30 * s, y); ctx.lineTo(x + 30 * s, y - 70 * s); ctx.stroke();
      ctx.fillStyle = '#f0f0f0'; ctx.beginPath(); ctx.moveTo(x + 30 * s, y - 70 * s); ctx.quadraticCurveTo(x + 50 * s, y - 64 * s + Math.sin(T * 4) * 4, x + 62 * s, y - 60 * s); ctx.lineTo(x + 30 * s, y - 50 * s); ctx.fill();
      break;
    }
    case 'fishing': {
      for (let i = 0; i < 6; i++) { const a = T * .7 + i; const bx = x + Math.cos(a) * 80 * s, by = y - 90 * s + Math.sin(a) * 30 * s; ctx.strokeStyle = '#eee'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 8 * s, by - 3 * s + Math.sin(T * 8 + i) * 3); ctx.lineTo(bx, by); ctx.lineTo(bx + 8 * s, by - 3 * s + Math.sin(T * 8 + i) * 3); ctx.stroke(); }
      for (let i = 0; i < 4; i++) { const ph = (T * .8 + i * .37) % 1; ctx.strokeStyle = `rgba(230,250,255,${1 - ph})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x - 50 * s + i * 30 * s, y + (i % 2) * 20 * s, ph * 24 * s, ph * 10 * s, 0, 0, 7); ctx.stroke(); }
      break;
    }
    case 'stormfront': break; // 用天气表现
    case 'ark': {
      ctx.translate(x + 60 * s, y - 20 * s);
      box3(0, 0, 520 * s, 260 * s, 70 * s, '#d8d2c4', '#6d5a48', '#4a3c30');
      box3(30 * s, -70 * s, 260 * s, 130 * s, 60 * s, '#eee', '#bbb', '#999');
      for (let i = 0; i < 8; i++) { ctx.fillStyle = '#3b7a3b'; ctx.beginPath(); ctx.arc(-120 * s + i * 22 * s, -82 * s + i * 11 * s, 14 * s, 0, 7); ctx.fill(); }
      for (let i = 0; i < 14; i++) { ctx.fillStyle = night ? 'rgba(255,210,130,.95)' : 'rgba(40,60,70,.6)'; ctx.fillRect(-250 * s + i * 18 * s, -40 * s + i * 9 * s, 6 * s, 5 * s); }
      break;
    }
  }
  ctx.restore();
}

/* ---------- 木筏 ---------- */
function isEdgeT(R, t) { return DIRS.some(([dx, dy]) => !R.tiles[tkey(t.x + dx, t.y + dy)]); }
function rFacs(R, type) { return Object.values(R.tiles).filter(t => t.fac && t.fac.t === type); }
function raftLift(R, t) { return Math.sin(T * 1.3) * 2.2 * ISO.s * (1 + (R.weather === 'storm' ? 1.5 : 0)) + (t.x - t.y) * Math.sin(T * .9) * .9 * ISO.s * (R.weather === 'storm' ? 2.5 : 1) + R.sinkPx; }
const LOG = [[132, 94, 58], [120, 84, 50], [140, 102, 64], [112, 80, 48]];
function drawTile(R, t, y0off, pal) {
  const s = ISO.s, dmg = 1 - t.hp / 100, lift = y0off;
  const lanes = [-.32, 0, .32];
  const base = LOG[Math.floor(hash(t.x, t.y) * 4)];
  const tint = k => rgb(mix(shade(base, k * (1 - dmg * .45)), pal.deep, .12 + pal.dark * .25));
  const lw = ISO.th * .34;
  lanes.forEach((v, li) => {
    if (dmg > .55 && li === 1) return; // 严重损坏：中间那根原木断了
    const [x0, y0] = iso(t.x - .46, t.y + v), [x1, y1] = iso(t.x + .46, t.y + v);
    ctx.lineCap = 'round';
    ctx.strokeStyle = tint(.55); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0 + lift + 3 * s); ctx.lineTo(x1, y1 + lift + 3 * s); ctx.stroke();
    ctx.strokeStyle = tint(1); ctx.lineWidth = lw * .86; ctx.beginPath(); ctx.moveTo(x0, y0 + lift); ctx.lineTo(x1, y1 + lift); ctx.stroke();
    ctx.strokeStyle = tint(1.28); ctx.lineWidth = lw * .22; ctx.beginPath(); ctx.moveTo(x0 + 2, y0 + lift - lw * .22); ctx.lineTo(x1 - 2, y1 + lift - lw * .22); ctx.stroke();
    // 木纹
    ctx.strokeStyle = 'rgba(50,30,15,.25)'; ctx.lineWidth = 1;
    const k = hash(t.x + li, t.y); ctx.beginPath(); ctx.moveTo(lerp(x0, x1, k * .4 + .1), lerp(y0, y1, k * .4 + .1) + lift + 2); ctx.lineTo(lerp(x0, x1, k * .4 + .35), lerp(y0, y1, k * .4 + .35) + lift + 2); ctx.stroke();
    // 原木端面（朝向镜头的 +x 侧，且外侧没有甲板）
    if (!R.tiles[tkey(t.x + 1, t.y)]) {
      ctx.fillStyle = rgb(mix([196, 160, 112], pal.deep, .15 + pal.dark * .3)); ctx.beginPath(); ctx.ellipse(x1 + lw * .18, y1 + lift + lw * .1, lw * .42, lw * .48, -.5, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(90,60,30,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x1 + lw * .18, y1 + lift + lw * .1, lw * .22, lw * .26, -.5, 0, 7); ctx.stroke();
    }
  });
  // 绑绳
  ctx.strokeStyle = rgb(mix([214, 190, 140], pal.deep, .2 + pal.dark * .3)); ctx.lineWidth = 2.2 * s;
  [-.3, .3].forEach(u => { const [a0, b0] = iso(t.x + u, t.y - .5), [a1, b1] = iso(t.x + u, t.y + .5); ctx.beginPath(); ctx.moveTo(a0, b0 + lift - lw * .3); ctx.lineTo(a1, b1 + lift - lw * .3); ctx.stroke(); });
  if (t.hp < 85) {
    const [x, y] = iso(t.x, t.y);
    ctx.fillStyle = 'rgba(0,0,0,.55)'; rr(ctx, x - 20 * s, y + lift + 14 * s, 40 * s, 5 * s, 2); ctx.fill();
    ctx.fillStyle = t.hp < 40 ? '#e05a4c' : '#e0b84c'; rr(ctx, x - 20 * s, y + lift + 14 * s, 40 * s * t.hp / 100, 5 * s, 2); ctx.fill();
  }
}
function drawFoam(R, tiles, pal) {
  const s = ISO.s, a = .35 + pal.sun * .25;
  ctx.lineCap = 'round';
  tiles.forEach(t => {
    const lift = raftLift(R, t);
    const corners = { '1,0': [[.5, -.5], [.5, .5]], '-1,0': [[-.5, -.5], [-.5, .5]], '0,1': [[-.5, .5], [.5, .5]], '0,-1': [[-.5, -.5], [.5, -.5]] };
    DIRS.forEach(([dx, dy]) => {
      if (R.tiles[tkey(t.x + dx, t.y + dy)]) return;
      const [c0, c1] = corners[dx + ',' + dy];
      const o = .1 + Math.sin(T * 2 + t.x + t.y) * .03;
      const p0 = iso(t.x + c0[0] + dx * o, t.y + c0[1] + dy * o), p1 = iso(t.x + c1[0] + dx * o, t.y + c1[1] + dy * o);
      ctx.strokeStyle = `rgba(230,248,250,${a * .35})`; ctx.lineWidth = 9 * s; ctx.beginPath(); ctx.moveTo(p0[0], p0[1] + lift + 6 * s); ctx.lineTo(p1[0], p1[1] + lift + 6 * s); ctx.stroke();
      ctx.setLineDash([5 * s, 7 * s]); ctx.lineDashOffset = -T * 14;
      ctx.strokeStyle = `rgba(245,255,255,${a})`; ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.moveTo(p0[0], p0[1] + lift + 6 * s); ctx.lineTo(p1[0], p1[1] + lift + 6 * s); ctx.stroke();
      ctx.setLineDash([]);
    });
  });
}

/* ---------- 设施 ---------- */
function drawFac(R, t, x, y, pal) {
  const f = t.fac.t, s = ISO.s, on = t.fac.on !== false, night = pal.dark > .25;
  const D = c => rgb(mix(hex(c), pal.deep, .1 + pal.dark * .35));
  const Dk = (c, k) => rgb(shade(mix(hex(c), pal.deep, .1 + pal.dark * .35), k));
  ctx.save();
  if (!['netf', 'fence'].includes(f)) softShadow(x + 4 * s, y + 4 * s, 26 * s, 12 * s, .28);
  switch (f) {
    case 'storage':
      box3(x, y, 56 * s, 28 * s, 30 * s, Dk('#a07a4a', 1.1), Dk('#a07a4a', .8), Dk('#a07a4a', .62));
      ctx.strokeStyle = 'rgba(40,25,10,.45)'; ctx.lineWidth = 1.2;
      for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - 28 * s, y - i * 10 * s); ctx.lineTo(x, y + 14 * s - i * 10 * s); ctx.lineTo(x + 28 * s, y - i * 10 * s); ctx.stroke(); }
      ctx.fillStyle = Dk('#888888', 1); [[-28, 0], [0, 14], [28, 0]].forEach(([dx, dy]) => ctx.fillRect(x + dx * s - 1.5 * s, y + dy * s - 30 * s, 3 * s, 30 * s));
      break;
    case 'rain': {
      // 四根杆撑起的防水布漏斗 + 水桶
      cyl(x, y, 13 * s, 22 * s, [80, 140, 190], [46, 100, 150]);
      const lv = clamp((R.water || 0) / 60, .1, 1);
      ctx.fillStyle = 'rgba(120,200,255,.8)'; ctx.beginPath(); ctx.ellipse(x, y - 22 * s + 2 * s, 10 * s * lv, 5 * s * lv, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = D('#5a4030'); ctx.lineWidth = 2 * s;
      [[-26, -6], [26, -6], [-8, 10], [8, -20]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.moveTo(x + dx * s, y + dy * s); ctx.lineTo(x + dx * s, y + dy * s - 46 * s); ctx.stroke(); });
      ctx.fillStyle = D('#2f7fb0'); ctx.beginPath(); ctx.moveTo(x - 26 * s, y - 52 * s); ctx.lineTo(x + 8 * s, y - 66 * s); ctx.lineTo(x + 26 * s, y - 52 * s); ctx.lineTo(x - 8 * s, y - 36 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = Dk('#2f7fb0', .7); ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 36 * s); ctx.lineTo(x + 26 * s, y - 52 * s); ctx.lineTo(x + 2 * s, y - 30 * s); ctx.fill();
      break;
    }
    case 'still': {
      const g = ctx.createLinearGradient(x - 30 * s, y - 40 * s, x + 30 * s, y);
      g.addColorStop(0, 'rgba(220,245,255,.75)'); g.addColorStop(1, 'rgba(120,180,210,.35)');
      box3(x, y, 50 * s, 25 * s, 6 * s, Dk('#3a5a6a', 1), Dk('#3a5a6a', .7), Dk('#3a5a6a', .55));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - 40 * s); ctx.lineTo(x + 25 * s, y - 6 * s); ctx.lineTo(x, y + 6 * s); ctx.lineTo(x - 25 * s, y - 6 * s); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 40 * s); ctx.lineTo(x, y + 6 * s); ctx.stroke();
      if (!night && R.weather === 'sun') { ctx.fillStyle = `rgba(255,255,255,${.5 + .5 * Math.sin(T * 3)})`; ctx.beginPath(); ctx.arc(x - 8 * s, y - 24 * s, 2.5 * s, 0, 7); ctx.fill(); }
      break;
    }
    case 'purifier':
      box3(x, y, 36 * s, 18 * s, 34 * s, Dk('#e4ecf0', 1), Dk('#e4ecf0', .78), Dk('#e4ecf0', .62));
      cyl(x + 6 * s, y - 34 * s, 9 * s, 14 * s, [120, 190, 240], [70, 140, 200]);
      ctx.fillStyle = on ? '#4fe08a' : '#a33'; ctx.beginPath(); ctx.arc(x + 10 * s, y - 14 * s, 2.5 * s, 0, 7); ctx.fill();
      break;
    case 'netf': {
      // 网挂在朝水的一侧
      const dir = DIRS.find(([dx, dy]) => !R.tiles[tkey(t.x + dx, t.y + dy)]) || [1, 0];
      const [ox, oy] = iso(t.x + dir[0] * .95, t.y + dir[1] * .95), lift = y - iso(t.x, t.y)[1];
      ctx.strokeStyle = 'rgba(225,220,200,.7)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) { const k = i / 6; const ax = lerp(x - 22 * s, x + 22 * s, k), ay = lerp(y - 11 * s, y + 11 * s, k); ctx.beginPath(); ctx.moveTo(ax, ay - 4 * s); ctx.quadraticCurveTo(lerp(ax, ox, .5), lerp(ay, oy + lift, .5) + 10 * s, ox + (ax - x) * .8, oy + lift + (ay - y) * .8 + 4 * s); ctx.stroke(); }
      for (let i = 0; i < 4; i++) { const k = (i + .5) / 4; ctx.fillStyle = '#e7663a'; ctx.beginPath(); ctx.arc(ox + (lerp(-22, 22, k)) * s * .8, oy + lift + lerp(-11, 11, k) * s * .8 + 4 * s + Math.sin(T * 2 + i) * 1.5, 3.4 * s, 0, 7); ctx.fill(); }
      ctx.strokeStyle = D('#5a4030'); ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x - 22 * s, y - 15 * s); ctx.lineTo(x + 22 * s, y + 7 * s); ctx.stroke();
      break;
    }
    case 'planter': {
      box3(x, y, 58 * s, 29 * s, 16 * s, Dk('#3d2a1a', 1), Dk('#7a5634', .85), Dk('#7a5634', .65));
      const gr = clamp((t.fac.g || 0) / 1800, 0, 1);
      for (let i = 0; i < 6; i++) { const px = x - 18 * s + (i % 3) * 18 * s, py = y - 18 * s + Math.floor(i / 3) * 9 * s - (i % 3) * 4 * s;
        const sz = (3 + gr * 7) * s; ctx.fillStyle = Dk('#4fae4f', .8 + (i % 2) * .2); ctx.beginPath(); ctx.ellipse(px - sz * .4, py - sz * .4, sz * .6, sz * .35, -.6, 0, 7); ctx.ellipse(px + sz * .4, py - sz * .5, sz * .6, sz * .35, .6, 0, 7); ctx.fill(); }
      break;
    }
    case 'stove': {
      cyl(x, y, 15 * s, 28 * s, [70, 70, 70], [92, 70, 58]);
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(x, y - 28 * s, 11 * s, 5 * s, 0, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) { const fh = (10 + Math.sin(T * 9 + i * 2) * 4) * s; ctx.fillStyle = `rgba(255,${130 + i * 40},40,.7)`; ctx.beginPath(); ctx.ellipse(x - 5 * s + i * 5 * s, y - 30 * s - fh / 2, 3.5 * s, fh / 2, 0, 0, 7); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 3; i++) { const ph = (T * .5 + i / 3) % 1; ctx.fillStyle = `rgba(180,180,180,${.3 * (1 - ph)})`; ctx.beginPath(); ctx.arc(x + Math.sin(ph * 5 + i) * 6 * s, y - 44 * s - ph * 50 * s, (5 + ph * 10) * s, 0, 7); ctx.fill(); }
      break;
    }
    case 'solar': {
      ctx.strokeStyle = '#555'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(x - 14 * s, y + 4 * s); ctx.lineTo(x - 14 * s, y - 14 * s); ctx.moveTo(x + 16 * s, y - 2 * s); ctx.lineTo(x + 16 * s, y - 26 * s); ctx.stroke();
      const g = ctx.createLinearGradient(x - 30 * s, y - 30 * s, x + 30 * s, y);
      g.addColorStop(0, D('#2b5aa0')); g.addColorStop(.5, R.weather === 'sun' && !night ? '#7fb2ff' : D('#244a86')); g.addColorStop(1, D('#132a52'));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 34 * s, y - 10 * s); ctx.lineTo(x + 4 * s, y - 34 * s); ctx.lineTo(x + 36 * s, y - 20 * s); ctx.lineTo(x - 2 * s, y + 4 * s); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(200,220,255,.45)'; ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) { const k = i / 4; ctx.beginPath(); ctx.moveTo(lerp(x - 34 * s, x + 4 * s, k), lerp(y - 10 * s, y - 34 * s, k)); ctx.lineTo(lerp(x - 2 * s, x + 36 * s, k), lerp(y + 4 * s, y - 20 * s, k)); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(lerp(x - 34 * s, x - 2 * s, .5), lerp(y - 10 * s, y + 4 * s, .5)); ctx.lineTo(lerp(x + 4 * s, x + 36 * s, .5), lerp(y - 34 * s, y - 20 * s, .5)); ctx.stroke();
      ctx.strokeStyle = '#ccd'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 34 * s, y - 10 * s); ctx.lineTo(x + 4 * s, y - 34 * s); ctx.lineTo(x + 36 * s, y - 20 * s); ctx.lineTo(x - 2 * s, y + 4 * s); ctx.closePath(); ctx.stroke();
      break;
    }
    case 'wind': {
      ctx.strokeStyle = D('#d8dde0'); ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 78 * s); ctx.stroke();
      box3(x, y - 76 * s, 12 * s, 6 * s, 8 * s, '#eee', '#ccc', '#aaa');
      const hubx = x - 6 * s, huby = y - 82 * s, ang = T * 5 * (R.wind || .5);
      ctx.fillStyle = D('#f2f2f2');
      for (let i = 0; i < 3; i++) { const a = ang + i * 2.094; ctx.beginPath(); ctx.moveTo(hubx, huby); ctx.lineTo(hubx + Math.cos(a) * 34 * s * .55 - Math.sin(a) * 4 * s, huby + Math.sin(a) * 34 * s + Math.cos(a) * 2 * s); ctx.lineTo(hubx + Math.cos(a) * 36 * s * .55, huby + Math.sin(a) * 36 * s); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(hubx, huby, 3 * s, 0, 7); ctx.fill();
      break;
    }
    case 'pedal': {
      ctx.strokeStyle = D('#c14a3a'); ctx.lineWidth = 3 * s;
      ctx.beginPath(); ctx.ellipse(x - 12 * s, y - 8 * s, 10 * s, 11 * s, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x + 14 * s, y - 2 * s, 10 * s, 11 * s, 0, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 12 * s, y - 8 * s); ctx.lineTo(x - 2 * s, y - 26 * s); ctx.lineTo(x + 14 * s, y - 2 * s); ctx.moveTo(x - 2 * s, y - 26 * s); ctx.lineTo(x - 4 * s, y - 34 * s); ctx.stroke();
      box3(x + 2 * s, y + 6 * s, 16 * s, 8 * s, 10 * s, '#444', '#333', '#222');
      break;
    }
    case 'diesel':
      box3(x, y, 48 * s, 24 * s, 28 * s, Dk('#e0b034', 1.05), Dk('#e0b034', .78), Dk('#e0b034', .6));
      ctx.fillStyle = '#333'; ctx.fillRect(x + 6 * s, y - 20 * s, 14 * s, 8 * s);
      cyl(x - 12 * s, y - 26 * s, 3 * s, 14 * s, [60, 60, 60], [80, 80, 80]);
      if (R.dieselOn) for (let i = 0; i < 3; i++) { const ph = (T * .9 + i / 3) % 1; ctx.fillStyle = `rgba(60,60,60,${.45 * (1 - ph)})`; ctx.beginPath(); ctx.arc(x - 12 * s + ph * 10 * s, y - 44 * s - ph * 44 * s, (4 + ph * 9) * s, 0, 7); ctx.fill(); }
      break;
    case 'batt': {
      box3(x, y, 40 * s, 20 * s, 20 * s, '#3a3d40', '#2a2c2e', '#1e2022');
      const lv = R.battCap ? R.wh / R.battCap : 0;
      for (let i = 0; i < 4; i++) { ctx.fillStyle = i < Math.ceil(lv * 4) ? '#4fe08a' : '#333'; ctx.fillRect(x + 4 * s + i * 4 * s, y - 12 * s - i * 2 * s, 3 * s, 4 * s); }
      break;
    }
    case 'fence': {
      ctx.strokeStyle = D('#7a5634'); ctx.fillStyle = D('#8a6440');
      DIRS.forEach(([dx, dy]) => {
        if (R.tiles[tkey(t.x + dx, t.y + dy)]) return;
        const c = { '1,0': [[.45, -.45], [.45, .45]], '-1,0': [[-.45, -.45], [-.45, .45]], '0,1': [[-.45, .45], [.45, .45]], '0,-1': [[-.45, -.45], [.45, -.45]] }[dx + ',' + dy];
        const lift = y - iso(t.x, t.y)[1];
        const p0 = iso(t.x + c[0][0], t.y + c[0][1]), p1 = iso(t.x + c[1][0], t.y + c[1][1]);
        for (let i = 0; i <= 4; i++) { const px = lerp(p0[0], p1[0], i / 4), py = lerp(p0[1], p1[1], i / 4) + lift; ctx.fillRect(px - 2 * s, py - 24 * s, 4 * s, 24 * s); ctx.beginPath(); ctx.moveTo(px - 2 * s, py - 24 * s); ctx.lineTo(px, py - 28 * s); ctx.lineTo(px + 2 * s, py - 24 * s); ctx.fill(); }
        ctx.lineWidth = 3 * s; [16, 7].forEach(h => { ctx.beginPath(); ctx.moveTo(p0[0], p0[1] + lift - h * s); ctx.lineTo(p1[0], p1[1] + lift - h * s); ctx.stroke(); });
      });
      if (t.fac.hp < 80) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - 20 * s, y + 22 * s, 40 * s, 4 * s); ctx.fillStyle = '#7ac'; ctx.fillRect(x - 20 * s, y + 22 * s, 40 * s * t.fac.hp / 80, 4 * s); }
      break;
    }
    case 'turret': {
      ctx.strokeStyle = '#333'; ctx.lineWidth = 3 * s; [[-14, 6], [14, 6], [0, -8]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.moveTo(x + dx * s, y + dy * s); ctx.lineTo(x, y - 18 * s); ctx.stroke(); });
      const tg = (R.monsters || []).filter(m => m.delay <= 0).sort((a, b) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y))[0];
      let ang = -.5; if (tg) { const [mx, my] = iso(tg.x, tg.y); ang = Math.atan2(my - (y - 22 * s), mx - x); }
      ctx.save(); ctx.translate(x, y - 22 * s); ctx.rotate(ang);
      ctx.fillStyle = '#4a4f55'; rr(ctx, -10 * s, -5 * s, 30 * s, 10 * s, 3 * s); ctx.fill();
      ctx.strokeStyle = on ? '#e9d9a0' : '#888'; ctx.lineWidth = 2.5 * s; ctx.beginPath(); ctx.moveTo(10 * s, 0); ctx.lineTo(34 * s, 0); ctx.stroke();
      ctx.fillStyle = on ? '#e9d9a0' : '#888'; ctx.beginPath(); ctx.moveTo(34 * s, -4 * s); ctx.lineTo(42 * s, 0); ctx.lineTo(34 * s, 4 * s); ctx.fill();
      ctx.restore();
      break;
    }
    case 'lamp': {
      ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 46 * s); ctx.lineTo(x + 10 * s, y - 46 * s); ctx.stroke();
      const lit = on && night, fl = .85 + Math.sin(T * 13) * .08 + Math.sin(T * 7) * .07;
      ctx.fillStyle = '#2b2b2b'; ctx.fillRect(x + 4 * s, y - 46 * s, 12 * s, 3 * s);
      ctx.fillStyle = lit ? `rgba(255,${200 * fl | 0},110,1)` : '#9a9080'; rr(ctx, x + 5 * s, y - 42 * s, 10 * s, 13 * s, 3 * s); ctx.fill();
      if (lit) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x + 10 * s, y - 36 * s, 0, x + 10 * s, y - 36 * s, 26 * s); g.addColorStop(0, `rgba(255,200,110,${.8 * fl})`); g.addColorStop(1, 'rgba(255,200,110,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + 10 * s, y - 36 * s, 26 * s, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      break;
    }
    case 'sail': {
      ctx.strokeStyle = D('#5a4030'); ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 120 * s); ctx.stroke();
      ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x, y - 24 * s); ctx.lineTo(x + 56 * s, y - 10 * s); ctx.stroke();
      const b = Math.sin(T * 1.2) * 5 * s;
      const g = ctx.createLinearGradient(x, 0, x + 60 * s, 0); g.addColorStop(0, D('#d8cfba')); g.addColorStop(1, D('#f4eedf'));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 3 * s, y - 116 * s); ctx.quadraticCurveTo(x + 58 * s + b, y - 70 * s, x + 54 * s, y - 14 * s); ctx.lineTo(x + 3 * s, y - 26 * s); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(120,100,70,.4)'; ctx.lineWidth = 1; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + 3 * s, y - 26 * s - i * 22 * s); ctx.quadraticCurveTo(x + 30 * s + b * .5, y - 30 * s - i * 18 * s, x + 50 * s, y - 14 * s - i * 10 * s); ctx.stroke(); }
      break;
    }
  }
  if (!on && FAC[f] && FAC[f].w && (night || f === 'purifier')) { ctx.font = `${13 * s}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('🔌', x + 20 * s, y - 40 * s); }
  ctx.restore();
}

/* ---------- 人物 ---------- */
function drawPerson(x, y, o = {}) {
  const s = ISO.s * .9, col = o.col || [226, 222, 210], pose = o.pose || 'stand', ph = o.phase || T * 8;
  const skin = '#e3b48e', hair = o.hair || '#2a1d14', pants = '#2b3440';
  if (pose === 'sleep') {
    softShadow(x, y, 18 * s, 6 * s, .3);
    ctx.fillStyle = '#5a6b8a'; rr(ctx, x - 18 * s, y - 9 * s, 30 * s, 10 * s, 4 * s); ctx.fill();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(x + 14 * s, y - 6 * s, 5 * s, 0, 7); ctx.fill();
    ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(x + 16 * s, y - 7 * s, 5 * s, -1.2, 1.6); ctx.fill();
    ctx.fillStyle = 'rgba(220,230,255,.8)'; ctx.font = `bold ${10 * s}px sans-serif`; const z = (T * .7) % 1; ctx.fillText('z', x + 18 * s + z * 8 * s, y - 16 * s - z * 14 * s);
    return;
  }
  const walk = pose === 'walk', sw = walk ? Math.sin(ph) * 4 * s : 0, bob = walk ? Math.abs(Math.sin(ph)) * -1.5 * s : Math.sin(T * 2) * .6;
  softShadow(x, y, 9 * s, 3.5 * s, .32);
  ctx.fillStyle = pants; rr(ctx, x - 5 * s + sw * .3, y - 15 * s, 4 * s, 15 * s, 2); ctx.fill(); rr(ctx, x + 1 * s - sw * .3, y - 15 * s, 4 * s, 15 * s, 2); ctx.fill();
  ctx.fillStyle = '#1d1d1d'; ctx.fillRect(x - 5 * s + sw * .3, y - 2 * s, 4.5 * s, 2.5 * s); ctx.fillRect(x + 1 * s - sw * .3, y - 2 * s, 4.5 * s, 2.5 * s);
  ctx.fillStyle = rgb(col); rr(ctx, x - 7 * s, y - 31 * s + bob, 14 * s, 18 * s, 5 * s); ctx.fill();
  ctx.fillStyle = rgb(shade(col, .75)); rr(ctx, x - 7 * s, y - 20 * s + bob, 14 * s, 6 * s, 2 * s); ctx.fill();
  // 手臂
  ctx.strokeStyle = rgb(shade(col, .85)); ctx.lineWidth = 3.4 * s; ctx.lineCap = 'round';
  if (o.wave) { ctx.beginPath(); ctx.moveTo(x + 6 * s, y - 27 * s); ctx.lineTo(x + 12 * s + Math.sin(T * 8) * 3 * s, y - 42 * s); ctx.stroke(); }
  else if (pose === 'fish') { ctx.beginPath(); ctx.moveTo(x + 5 * s, y - 26 * s); ctx.lineTo(x + 12 * s, y - 22 * s); ctx.stroke();
    ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 1.8 * s; const tipx = x + 44 * s * (o.dir || 1), tipy = y - 52 * s; ctx.beginPath(); ctx.moveTo(x + 10 * s, y - 20 * s); ctx.lineTo(tipx, tipy); ctx.stroke();
    ctx.strokeStyle = 'rgba(240,240,240,.7)'; ctx.lineWidth = 1; const bx = tipx + 18 * s * (o.dir || 1), by = y + 22 * s + Math.sin(T * 3) * 2; ctx.beginPath(); ctx.moveTo(tipx, tipy); ctx.quadraticCurveTo(bx, tipy + 10 * s, bx, by); ctx.stroke();
    ctx.fillStyle = '#e8463a'; ctx.beginPath(); ctx.arc(bx, by, 2.5 * s, 0, 7); ctx.fill(); }
  else if (pose === 'work') { const k = Math.sin(T * 10) * 4 * s; ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 27 * s); ctx.lineTo(x - 12 * s, y - 20 * s + k); ctx.moveTo(x + 5 * s, y - 27 * s); ctx.lineTo(x + 12 * s, y - 20 * s - k); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 28 * s + bob); ctx.lineTo(x - 8 * s - sw * .4, y - 17 * s + bob); ctx.moveTo(x + 6 * s, y - 28 * s + bob); ctx.lineTo(x + 8 * s + sw * .4, y - 17 * s + bob); ctx.stroke(); }
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(x, y - 37 * s + bob, 6 * s, 0, 7); ctx.fill();
  ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(x, y - 38.5 * s + bob, 6.2 * s, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  if (o.hood) { ctx.fillStyle = rgb(shade(col, .9)); ctx.beginPath(); ctx.arc(x, y - 38 * s + bob, 7.5 * s, Math.PI * .85, Math.PI * 2.15); ctx.lineTo(x + 5 * s, y - 31 * s); ctx.lineTo(x - 5 * s, y - 31 * s); ctx.fill(); }
}

/* ---------- 黑潮兽 ---------- */
const MSTYLE = {
  eater: { sc: 1, glow: '40,220,190', eye: '#7dffe8', body: ['#1d4a4c', '#061416'], tent: 5, tc: '#0a2226', tl: 'rgba(80,240,210,.5)' },
  eel:   { sc: .78, glow: '170,90,255', eye: '#e2b8ff', body: ['#3a2a5a', '#120a20'], tent: 3, tc: '#1a1030', tl: 'rgba(200,140,255,.55)' },
  shell: { sc: 1.3, glow: '255,150,60', eye: '#ffc070', body: ['#5a4030', '#1e140c'], tent: 6, tc: '#2a1a10', tl: 'rgba(255,170,90,.45)' },
};
function drawMonster(m) {
  const st = MSTYLE[m.type] || MSTYLE.eater;
  const [x, y] = iso(m.x, m.y), s = ISO.s * st.sc, w = Math.sin(T * (m.type === 'eel' ? 6 : 3) + m.wob);
  ctx.save();
  // 水下荧光
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, 46 * s); g.addColorStop(0, `rgba(${st.glow},.35)`); g.addColorStop(1, `rgba(${st.glow},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 46 * s, 23 * s, 0, 0, 7); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // 涟漪
  for (let i = 0; i < 2; i++) { const ph = (T * .8 + i * .5 + m.wob) % 1; ctx.strokeStyle = `rgba(${st.glow},${.4 * (1 - ph)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y, (16 + ph * 30) * s, (8 + ph * 15) * s, 0, 0, 7); ctx.stroke(); }
  // 触手
  ctx.lineCap = 'round';
  for (let i = 0; i < st.tent; i++) {
    const a = i / st.tent * Math.PI * 2 + w * .25, len = (26 + (i % 2) * 8) * s;
    const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len * .5;
    ctx.strokeStyle = st.tc; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(x, y - 4 * s); ctx.quadraticCurveTo(x + Math.cos(a) * len * .6, y - 30 * s + w * 6 * s, ex, ey - 6 * s); ctx.stroke();
    ctx.strokeStyle = st.tl; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(x, y - 6 * s); ctx.quadraticCurveTo(x + Math.cos(a) * len * .6, y - 32 * s + w * 6 * s, ex, ey - 8 * s); ctx.stroke();
  }
  // 头
  const hg = ctx.createRadialGradient(x - 4 * s, y - 22 * s, 2, x, y - 12 * s, 22 * s); hg.addColorStop(0, st.body[0]); hg.addColorStop(1, st.body[1]);
  ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(x, y - 10 * s, 17 * s, 16 * s, 0, Math.PI, 0); ctx.quadraticCurveTo(x + 17 * s, y, x, y + 2 * s); ctx.quadraticCurveTo(x - 17 * s, y, x - 17 * s, y - 10 * s); ctx.fill();
  if (m.type === 'shell') { ctx.strokeStyle = 'rgba(255,190,120,.35)'; ctx.lineWidth = 2 * s; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(x + i * 7 * s, y - 14 * s, 8 * s, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } }
  ctx.shadowColor = st.eye; ctx.shadowBlur = 14; ctx.fillStyle = m.hit > 0 ? '#ffffff' : st.eye;
  ctx.beginPath(); ctx.ellipse(x - 6 * s, y - 14 * s, 3.2 * s, 2.2 * s, -.3, 0, 7); ctx.ellipse(x + 6 * s, y - 14 * s, 3.2 * s, 2.2 * s, .3, 0, 7); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; rr(ctx, x - 15 * s, y - 38 * s, 30 * s, 4 * s, 2); ctx.fill();
  ctx.fillStyle = st.eye; rr(ctx, x - 15 * s, y - 38 * s, 30 * s * Math.max(0, m.hp) / m.max, 4 * s, 2); ctx.fill();
  ctx.restore();
  m.hit = Math.max(0, m.hit - .05);
}

/* ---------- 主场景：海 + 木筏 ---------- */
function drawRaftScene(R, dt, opt = {}) {
  const tilesArr = Object.values(R.tiles);
  // 相机：根据木筏大小自动缩放
  const sc = Math.min(W / 1440, H / 860);
  const ext = tilesArr.reduce((m, t) => Math.max(m, Math.abs(t.x - t.y), Math.abs(t.x + t.y)), 1) + 1;
  const want = (opt.zoom || 1) * Math.min(210 * sc, W * .74 / (ext + 1), H * 1.15 / (ext + 1.6));
  ISO.tw = ISO.tw ? lerp(ISO.tw, want, Math.min(1, dt * 4)) : want; ISO.th = ISO.tw / 2; ISO.s = ISO.tw / 110;
  ISO.cx = W * (opt.cx || .48); ISO.cy = H * (opt.cy || .52);
  if (R.shake > 0) { ISO.cx += (Math.random() - .5) * 14 * R.shake; ISO.cy += (Math.random() - .5) * 10 * R.shake; R.shake = Math.max(0, R.shake - dt * 2.5); }
  const pal = palette(R.hourF, R.weather);
  const flow = opt.harbor ? [-.15, .05] : [-.8, -.25];
  drawWater(R, pal, dt, flow);
  if (opt.harbor) drawHarbor(R, pal);

  // 漂浮物
  if (R.debris) {
    R.debris.forEach(d => { if (!opt.still) d.gx -= dt * .35 * (R.speedMul || 1); });
    R.debris = R.debris.filter(d => d.gx > -11);
    R.debris.forEach(d => drawDebris(d, pal));
  }
  drawLandmark(R, pal);

  // 木筏阴影 & 浪花
  const sorted = tilesArr.slice().sort((a, b) => (a.x + a.y) - (b.x + b.y));
  sorted.forEach(t => { const [x, y] = iso(t.x, t.y); ctx.fillStyle = 'rgba(0,18,28,.28)'; diamond(x + 4, y + 14 * ISO.s + raftLift(R, t), 1.08); ctx.fill(); });
  drawFoam(R, sorted, pal);
  // 扩建幽灵格
  if (R.buildSel === 'deck') {
    const seen = new Set();
    sorted.forEach(t => DIRS.forEach(([dx, dy]) => {
      const x = t.x + dx, y = t.y + dy, k = tkey(x, y);
      if (seen.has(k) || R.tiles[k] || Math.abs(x) > 4 || Math.abs(y) > 4) return; seen.add(k);
      const [sx, sy] = iso(x, y), hov = R.hover && R.hover[0] === x && R.hover[1] === y;
      ctx.setLineDash([6, 5]); ctx.strokeStyle = hov ? '#f2c14e' : 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; diamond(sx, sy + raftLift(R, t), .92); ctx.stroke(); ctx.setLineDash([]);
      if (hov) { ctx.fillStyle = 'rgba(242,193,78,.18)'; ctx.fill(); }
    }));
  }
  // 甲板
  sorted.forEach(t => drawTile(R, t, raftLift(R, t), pal));
  // 超载时甲板上漫水
  if (R.load > .92) sorted.forEach(t => { const [x, y] = iso(t.x, t.y); ctx.fillStyle = rgb(pal.light, clamp((R.load - .92) * 1.6, 0, .45) * (.7 + .3 * Math.sin(T * 2 + t.x))); diamond(x, y + raftLift(R, t), .96); ctx.fill(); });
  // 悬停高亮
  if (R.buildSel && R.buildSel !== 'deck' && R.hover && R.tiles[tkey(...R.hover)]) {
    const t = R.tiles[tkey(...R.hover)], [x, y] = iso(t.x, t.y);
    ctx.strokeStyle = t.fac && R.buildSel !== 'remove' ? '#e05a4c' : '#f2c14e'; ctx.lineWidth = 3; diamond(x, y + raftLift(R, t), .96); ctx.stroke();
  }
  // 深度排序绘制：设施 + 人物
  const draws = [];
  sorted.forEach(t => { if (t.fac) { const [x, y] = iso(t.x, t.y); draws.push({ d: t.x + t.y + .01, f: () => drawFac(R, t, x, y + raftLift(R, t) - 2 * ISO.s, pal) }); } });
  const people = [];
  if (R.pl) people.push(R.pl);
  (R.crewPos || []).forEach(c => people.push(c));
  people.forEach(p => {
    const tl = R.tiles[tkey(Math.round(p.x), Math.round(p.y))] || sorted[0];
    draws.push({ d: p.x + p.y + .3, f: () => { const [x, y] = iso(p.x, p.y); drawPerson(x, y + (tl ? raftLift(R, tl) : 0) - 2 * ISO.s, p); } });
  });
  draws.sort((a, b) => a.d - b.d).forEach(o => o.f());

  // 夜晚遮罩 + 光源
  const dark = clamp(pal.dark + (R.weather === 'storm' ? .1 : 0), 0, .66);
  const lights = [];
  rFacs(R, 'lamp').forEach(t => { if (t.fac.on && pal.dark > .2) lights.push([t, 3.4, [255, 170, 80]]); });
  rFacs(R, 'stove').forEach(t => lights.push([t, 1.7, [255, 140, 60]]));
  if (R.pl) lights.push([{ x: R.pl.x, y: R.pl.y }, 1.1, [255, 200, 140]]);
  if (opt.harbor && pal.dark > .1) for (let gx = -8; gx <= 8; gx += 4) lights.push([{ x: gx, y: -2.9 }, 2.2, [255, 190, 110]]);
  if (dark > .02) {
    if (!lightCanvas) lightCanvas = document.createElement('canvas');
    const lc = lightCanvas; if (lc.width !== cv.width || lc.height !== cv.height) { lc.width = cv.width; lc.height = cv.height; }
    const l = lc.getContext('2d'); l.setTransform(DPR, 0, 0, DPR, 0, 0); l.globalCompositeOperation = 'source-over'; l.clearRect(0, 0, W, H);
    l.fillStyle = `rgba(3,8,24,${dark})`; l.fillRect(0, 0, W, H);
    l.globalCompositeOperation = 'destination-out';
    lights.forEach(([t, r]) => { const [x, y] = iso(t.x, t.y), R2 = ISO.tw * r * .6; const rg = l.createRadialGradient(x, y - 10, 0, x, y - 10, R2); rg.addColorStop(0, 'rgba(0,0,0,.95)'); rg.addColorStop(.5, 'rgba(0,0,0,.5)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = rg; l.beginPath(); l.arc(x, y - 10, R2, 0, 7); l.fill(); });
    ctx.drawImage(lc, 0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    lights.forEach(([t, r, c]) => {
      const [x, y] = iso(t.x, t.y), R2 = ISO.tw * r * .45;
      const rg = ctx.createRadialGradient(x, y - 14, 0, x, y - 14, R2); rg.addColorStop(0, rgb(c, .2 * dark * 2)); rg.addColorStop(1, rgb(c, 0)); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y - 14, R2, 0, 7); ctx.fill();
      // 水面倒影
      for (let i = 0; i < 6; i++) { const yy = y + 30 * ISO.s + i * 9 * ISO.s, ww = (14 - i * 1.6) * ISO.s * (1 + .3 * Math.sin(T * 4 + i)); ctx.fillStyle = rgb(c, .1 * dark * 2 * (1 - i / 6)); ctx.fillRect(x - ww / 2 + Math.sin(T * 3 + i) * 3, yy, ww, 2.5); }
    });
    ctx.globalCompositeOperation = 'source-over';
  }
  // 黄昏/清晨暖光
  if (pal.warm > 0) { ctx.fillStyle = `rgba(255,130,70,${pal.warm * .16})`; ctx.fillRect(0, 0, W, H); }
  // 夜光浮游生物
  if (pal.dark > .25 && !opt.harbor) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) { const x = (hash(i, 1) * W + T * 6 * (hash(i, 3) - .5) * 4 + W) % W, y = (hash(i, 2) * H + Math.sin(T * .4 + i) * 10), a = .25 + .25 * Math.sin(T * 2 + i * 1.7); ctx.fillStyle = `rgba(63,224,197,${a * .5})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + (i % 3) * .6, 0, 7); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
  }
  // 黑潮兽 / 射击 / 特效
  (R.monsters || []).forEach(m => { if (m.delay <= 0) drawMonster(m); });
  (R.shots || []).forEach(sh => { const [x0, y0] = iso(sh.x0, sh.y0), [x1, y1] = iso(sh.x1, sh.y1); ctx.strokeStyle = `rgba(255,236,170,${sh.t})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0, y0 - 28 * ISO.s); ctx.lineTo(x1, y1 - 10 * ISO.s); ctx.stroke(); sh.t -= dt * 3; });
  if (R.shots) R.shots = R.shots.filter(s => s.t > 0);
  (R.fx || []).forEach(f => {
    f.t += dt; const [x, y] = iso(f.x, f.y), k = f.t;
    if (f.type === 'float') { ctx.globalAlpha = clamp(1.4 - k, 0, 1); ctx.font = `bold ${15 * ISO.s * .8}px "PingFang SC",sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = f.col || '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText(f.txt, x, y - 50 * ISO.s - k * 30); ctx.fillText(f.txt, x, y - 50 * ISO.s - k * 30); ctx.globalAlpha = 1; }
    else { ctx.strokeStyle = f.type === 'splash' ? `rgba(220,245,255,${1 - k})` : `rgba(242,193,78,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, 20 + k * 60, 10 + k * 30, 0, 0, 7); ctx.stroke(); }
  });
  if (R.fx) R.fx = R.fx.filter(f => f.t < (f.type === 'float' ? 1.4 : 1));
  // 天气
  if (R.weather === 'rain' || R.weather === 'storm') {
    const n = R.weather === 'storm' ? 320 : 150, sl = R.weather === 'storm' ? 18 : 8;
    ctx.strokeStyle = 'rgba(190,215,235,.33)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < n; i++) { const x = (hash(i, 7) * (W + 200) + T * 260) % (W + 200) - 100, y = (hash(i, 9) * H + T * 950) % H; ctx.moveTo(x, y); ctx.lineTo(x - sl, y + 24); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(210,235,250,.3)';
    for (let i = 0; i < 30; i++) { const ph = (T * 1.5 + hash(i, 4)) % 1; const x = hash(i, 5) * W, y = hash(i, 6) * H; ctx.beginPath(); ctx.ellipse(x, y, ph * 8, ph * 4, 0, 0, 7); ctx.globalAlpha = 1 - ph; ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  if (R.weather === 'fog') { const fg = ctx.createRadialGradient(ISO.cx, ISO.cy, ISO.tw * 1.5, ISO.cx, ISO.cy, Math.max(W, H) * .7); fg.addColorStop(0, 'rgba(200,210,215,.05)'); fg.addColorStop(1, 'rgba(200,210,215,.6)'); ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H); }
  if (R.lightning > 0) { ctx.fillStyle = `rgba(230,240,255,${R.lightning * .55})`; ctx.fillRect(0, 0, W, H); R.lightning -= dt * 2.5; }
  if (R.flash > 0) { const fg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .7); fg.addColorStop(0, 'rgba(200,30,20,0)'); fg.addColorStop(1, `rgba(200,30,20,${R.flash * .45})`); ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H); R.flash = Math.max(0, R.flash - dt * 1.5); }
  // 暗角
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .78);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,6,12,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  return pal;
}

/* ---------- 城市地图（阶段一） ---------- */
const CITY = (() => {
  let s = 11; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const blds = [], trees = [], roadsH = [], roadsV = [];
  for (let y = -60; y < 700; y += 64) roadsH.push(y + (r() - .5) * 10);
  for (let x = -260; x < 1260; x += 80) roadsV.push(x + (r() - .5) * 14);
  for (let i = 0; i < roadsH.length - 1; i++) for (let j = 0; j < roadsV.length - 1; j++) {
    const x0 = roadsV[j] + 9, x1 = roadsV[j + 1] - 9, y0 = roadsH[i] + 9, y1 = roadsH[i + 1] - 9;
    if (r() < .1) { for (let k = 0; k < 6; k++) trees.push({ x: lerp(x0, x1, r()), y: lerp(y0, y1, r()), r: 6 + r() * 6 }); continue; }
    const n = 1 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const w = (x1 - x0) / n - 4, bx = x0 + k * (w + 4);
      if ([DOCK, ...DISTRICTS].some(d => Math.abs(d.x - (bx + w / 2)) < 62 && Math.abs(d.y - (y0 + y1) / 2) < 50)) { if (r() < .5) trees.push({ x: bx + w / 2, y: (y0 + y1) / 2, r: 7 }); continue; }
      const hgt = 8 + r() * (y0 < 300 ? 36 : 22);
      blds.push({ x: bx, y: y0 + r() * 6, w, d: (y1 - y0) - 6 - r() * 8, h: hgt, c: pick([[150, 148, 140], [138, 134, 128], [162, 158, 148], [128, 132, 136], [146, 136, 126], [136, 142, 136]]), roof: r() });
    }
  }
  blds.sort((a, b) => (a.y + a.d) - (b.y + b.d));
  return { blds, trees, roadsH, roadsV };
})();
function mapXf() { const sc = Math.min(W / 1000, (H - 96) / 650); return { sc, ox: (W - 1000 * sc) / 2, oy: 96 - 60 * sc }; }
function seaYAt(t, x) { return seaY(t) + Math.sin(x / 60 + T * 1.5) * 3 + Math.sin(x / 150) * 10; }
function drawCity(S, now, mouse) {
  const { sc, ox, oy } = mapXf(), P = (x, y) => [ox + x * sc, oy + y * sc];
  const hourF = 8 + S.t1 / 60, pal = palette(hourF, 'sun'), dusk = clamp((hourF - 15) / 3, 0, 1);
  const shx = (hourF - 13) * -1.6, shy = 4; // 阴影方向随太阳移动
  const ground = mix([74, 76, 74], [40, 38, 50], dusk * .5);
  ctx.fillStyle = rgb(ground); ctx.fillRect(0, 0, W, H);
  // 人行道 / 地块
  ctx.fillStyle = rgb(shade(ground, 1.18));
  for (let i = 0; i < CITY.roadsH.length - 1; i++) for (let j = 0; j < CITY.roadsV.length - 1; j++) {
    const [x0, y0] = P(CITY.roadsV[j] + 5, CITY.roadsH[i] + 5), [x1, y1] = P(CITY.roadsV[j + 1] - 5, CITY.roadsH[i + 1] - 5);
    rr(ctx, x0, y0, x1 - x0, y1 - y0, 4 * sc); ctx.fill();
  }
  // 道路中线
  ctx.strokeStyle = 'rgba(230,210,140,.22)'; ctx.lineWidth = 1.2; ctx.setLineDash([8 * sc, 8 * sc]);
  CITY.roadsH.forEach(y => { ctx.beginPath(); ctx.moveTo(0, P(0, y)[1]); ctx.lineTo(W, P(0, y)[1]); ctx.stroke(); });
  CITY.roadsV.forEach(x => { ctx.beginPath(); ctx.moveTo(P(x, 0)[0], 0); ctx.lineTo(P(x, 0)[0], H); ctx.stroke(); });
  ctx.setLineDash([]);
  // 树
  CITY.trees.forEach(t => { const [x, y] = P(t.x, t.y); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(x + shx * sc * .6, y + shy * sc * .6, t.r * sc, 0, 7); ctx.fill(); ctx.fillStyle = rgb(mix([70, 120, 70], [40, 60, 60], dusk * .5)); ctx.beginPath(); ctx.arc(x, y, t.r * sc, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(x - 2 * sc, y - 2 * sc, t.r * sc * .5, 0, 7); ctx.fill(); });
  // 建筑（斜投影 2.5D）
  const lamp = dusk > .25;
  CITY.blds.forEach(b => {
    const [x, y] = P(b.x, b.y), w = b.w * sc, d = b.d * sc, h = b.h * sc * .55;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.moveTo(x, y + d); ctx.lineTo(x + w, y + d); ctx.lineTo(x + w + shx * h * .25, y + d + shy * h * .1 + h * .3); ctx.lineTo(x + shx * h * .25, y + d + h * .3); ctx.fill();
    const c = mix(b.c, [90, 80, 110], dusk * .35);
    ctx.fillStyle = rgb(shade(c, .68)); ctx.fillRect(x, y + d - h, w, h);              // 南立面
    if (lamp) for (let wx = x + 3; wx < x + w - 4; wx += 6 * sc) for (let wy = y + d - h + 3; wy < y + d - 3; wy += 6 * sc) if (hash(wx, wy) > .62) { ctx.fillStyle = `rgba(255,200,110,${.5 + dusk * .4})`; ctx.fillRect(wx, wy, 2.4 * sc, 2.4 * sc); }
    ctx.fillStyle = rgb(c); ctx.fillRect(x, y - h, w, d);                                // 屋顶
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x, y - h, w, 2);
    if (b.roof > .6) { ctx.fillStyle = rgb(shade(c, .8)); ctx.fillRect(x + w * .2, y - h + d * .25, w * .3, d * .3); }
    else if (b.roof > .45) { ctx.fillStyle = 'rgba(60,140,160,.6)'; ctx.beginPath(); ctx.arc(x + w * .7, y - h + d * .4, Math.min(w, d) * .15, 0, 7); ctx.fill(); }
  });
  // 海水（盖在被淹的街区上，半透明）
  const sy = seaY(S.t1);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-10, H + 10);
  for (let x = -400; x <= 1400; x += 8) { const [px, py] = P(x, seaYAt(S.t1, x)); ctx.lineTo(px, py); }
  ctx.lineTo(W + 10, H + 10); ctx.closePath();
  const wg = ctx.createLinearGradient(0, P(0, sy)[1], 0, H); wg.addColorStop(0, `rgba(60,170,175,${.72})`); wg.addColorStop(.25, 'rgba(24,104,124,.86)'); wg.addColorStop(1, 'rgba(8,46,66,.96)');
  ctx.fillStyle = wg; ctx.fill();
  ctx.clip();
  ctx.strokeStyle = 'rgba(220,250,250,.18)'; ctx.lineWidth = 1.3;
  for (let i = 0; i < 90; i++) { const x = (hash(i, 1) * W + T * 10) % W, y = P(0, sy)[1] + hash(i, 2) * (H - P(0, sy)[1]); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - 3, x + 22, y); ctx.stroke(); }
  ctx.restore();
  // 海岸泡沫
  for (let k = 0; k < 2; k++) {
    ctx.beginPath(); for (let x = -400; x <= 1400; x += 8) { const [px, py] = P(x, seaYAt(S.t1, x) + k * 6 + Math.sin(T * 2 + x / 30) * 1.5); x === -400 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.strokeStyle = `rgba(240,255,255,${k ? .25 : .7})`; ctx.lineWidth = k ? 3 : 2; ctx.setLineDash(k ? [] : [10, 6]); ctx.lineDashOffset = -T * 12; ctx.stroke(); ctx.setLineDash([]);
  }
  // 路径（旅行中）
  if (S.travel) { const a = loc(S.travel.from), b = loc(S.travel.to); ctx.strokeStyle = 'rgba(242,193,78,.8)'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -T * 30; ctx.beginPath(); ctx.moveTo(...P(a.x, a.y)); ctx.lineTo(...P(b.x, b.y)); ctx.stroke(); ctx.setLineDash([]); }
  // 区域地标与标签
  [DOCK, ...DISTRICTS].forEach(d => {
    const [x, y] = P(d.x, d.y), fl = d.id !== 'dock' && S.flooded[d.id], here = S.at === d.id && !S.travel;
    const hov = mouse && Math.hypot(mouse.x - x, mouse.y - (y - 30 * sc)) < 46 * sc;
    // 地标建筑
    if (d.id === 'dock') {
      const [rx, ry] = [x, y + 6 * sc];
      ctx.fillStyle = '#7a5a3a'; ctx.save(); ctx.translate(rx, ry); ctx.rotate(-.04); ctx.fillRect(-40 * sc, -6 * sc, 80 * sc, 22 * sc); ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 1; i < 6; i++) ctx.fillRect(-40 * sc + i * 13 * sc, -6 * sc, 1.5, 22 * sc); ctx.restore();
      ctx.fillStyle = '#5a3f28'; ctx.fillRect(x - 70 * sc, y - 30 * sc, 14 * sc, 50 * sc);
    } else {
      const rc = hex(d.roof), w = 74 * sc, dd = 44 * sc, h = 30 * sc;
      ctx.globalAlpha = fl ? .5 : 1;
      ctx.fillStyle = 'rgba(210,200,170,.16)'; rr(ctx, x - 58 * sc, y - 40 * sc, 116 * sc, 80 * sc, 8 * sc); ctx.fill();
      if (hov || here) { ctx.fillStyle = 'rgba(242,193,78,.18)'; ctx.beginPath(); ctx.ellipse(x, y, 70 * sc, 48 * sc, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x - w / 2 + shx * 2, y + dd / 2, w, 8 * sc);
      ctx.fillStyle = rgb(shade([200, 192, 178], .7)); ctx.fillRect(x - w / 2, y + dd / 2 - h, w, h);
      ctx.fillStyle = rgb(mix(rc, [80, 70, 100], dusk * .3)); ctx.fillRect(x - w / 2, y - dd / 2 - h, w, dd);
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(x - w / 2, y - dd / 2 - h, w, 3);
      ctx.fillStyle = 'rgba(255,230,170,.85)'; ctx.fillRect(x - w / 2 + 6 * sc, y + dd / 2 - h + 6 * sc, w - 12 * sc, 5 * sc);
      ctx.globalAlpha = 1;
    }
    // 标签卡片
    const lx = x, ly = y - 46 * sc;
    const label = d.id === 'dock' ? '码头 · 你的木筏' : d.n;
    ctx.font = `bold ${13}px "PingFang SC",sans-serif`;
    const tw = Math.max(ctx.measureText(label).width + 44, 96), th = d.id === 'dock' ? 30 : 44;
    ctx.save(); ctx.globalAlpha = fl ? .55 : 1;
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 10;
    ctx.fillStyle = hov ? 'rgba(48,44,30,.96)' : 'rgba(22,26,30,.92)'; rr(ctx, lx - tw / 2, ly - th, tw, th, 8); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = here ? '#f2c14e' : hov ? '#c9a54a' : 'rgba(255,255,255,.12)'; ctx.lineWidth = here ? 2.5 : 1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx - 7, ly); ctx.lineTo(lx, ly + 8); ctx.lineTo(lx + 7, ly); ctx.fillStyle = hov ? 'rgba(48,44,30,.96)' : 'rgba(22,26,30,.92)'; ctx.fill();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '17px sans-serif'; ctx.fillText(d.i, lx - tw / 2 + 9, ly - th + 16);
    ctx.fillStyle = '#fff'; ctx.font = `bold 13px "PingFang SC",sans-serif`; ctx.fillText(label, lx - tw / 2 + 32, ly - th + 16);
    if (d.id !== 'dock') {
      const left = floodAt(d) - S.t1;
      ctx.font = '11px "PingFang SC",sans-serif';
      ctx.fillStyle = fl ? '#7fd' : d.flood > 1e8 ? '#9ab' : left <= 90 ? '#ff7a6a' : '#d9c48a';
      ctx.fillText(d.flood > 1e8 ? '⛰ 高地，不会被淹' : fl ? '🌊 已淹没' : `🌊 ${fmtHM(left)} 后淹没`, lx - tw / 2 + 10, ly - 12);
    }
    ctx.restore();
    // 移动耗时气泡
    if (!S.travel && d.id !== S.at && !fl) {
      const m = travelMins(S.at, d.id); ctx.font = 'bold 11px sans-serif'; const t2 = `🚶 ${m} 分钟`, w2 = ctx.measureText(t2).width + 14;
      ctx.fillStyle = hov ? '#f2c14e' : 'rgba(0,0,0,.55)'; rr(ctx, lx - w2 / 2, ly - th - 22, w2, 18, 9); ctx.fill();
      ctx.fillStyle = hov ? '#222' : '#ddd'; ctx.textAlign = 'center'; ctx.fillText(t2, lx, ly - th - 13);
    }
  });
  // 玩家
  let px, py;
  if (S.travel) { const a = loc(S.travel.from), b = loc(S.travel.to), k = clamp((now - S.travel.start) / S.travel.dur, 0, 1), e = k * k * (3 - 2 * k); [px, py] = P(lerp(a.x, b.x, e), lerp(a.y, b.y, e)); }
  else[px, py] = P(loc(S.at).x + 34, loc(S.at).y + 8);
  const sv = ISO.s; ISO.s = 1.15; drawPerson(px, py, { col: [70, 80, 96], hood: true, pose: S.travel ? 'walk' : 'stand' }); ISO.s = sv;
  // 光线：清晨暖、黄昏橙紫
  if (hourF < 10) { ctx.fillStyle = `rgba(255,200,140,${(10 - hourF) / 2 * .1})`; ctx.fillRect(0, 0, W, H); }
  if (dusk > 0) { ctx.fillStyle = `rgba(255,120,60,${dusk * .14})`; ctx.fillRect(0, 0, W, H); ctx.fillStyle = `rgba(40,20,70,${dusk * .22})`; ctx.fillRect(0, 0, W, H); }
  // 云影
  CLOUDS.forEach(c => { c.x += c.v * .016; if (c.x > 1.4) { c.x = -.4; c.y = Math.random(); } const x = c.x * W, y = c.y * H, r = c.r * W * .8; const cg = ctx.createRadialGradient(x, y, 0, x, y, r); cg.addColorStop(0, 'rgba(0,0,0,.12)'); cg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = cg; ctx.fillRect(x - r, y - r, r * 2, r * 2); });
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .4, W / 2, H / 2, Math.max(W, H) * .8);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}
function cityHit(mouse) {
  const { sc, ox, oy } = mapXf();
  return [DOCK, ...DISTRICTS].find(d => Math.hypot(mouse.x - (ox + d.x * sc), mouse.y - (oy + d.y * sc - 30 * sc)) < 46 * sc);
}

/* ---------- 标题画面 ---------- */
const TITLE_R = (() => {
  const tiles = {};
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) tiles[tkey(x, y)] = { x, y, hp: 100, fac: null };
  tiles['1,0'] = { x: 1, y: 0, hp: 100, fac: null }; tiles['2,0'] = { x: 2, y: 0, hp: 100, fac: null };
  tiles['-1,-1'].fac = { t: 'sail', on: true }; tiles['1,1'].fac = { t: 'lamp', on: true }; tiles['1,-1'].fac = { t: 'storage', on: true };
  tiles['-1,1'].fac = { t: 'rain', on: true }; tiles['2,0'].fac = { t: 'netf', on: true }; tiles['0,-1'].fac = { t: 'stove', on: true };
  return { tiles, weather: 'cloud', hourF: 21, wind: .5, water: 30, pl: { x: .2, y: .5, col: [40, 44, 52], hood: true }, crewPos: [], monsters: [], debris: Array.from({ length: 6 }, () => newDebris(true)), sinkPx: 0, load: .5 };
})();
function drawTitle(dt) { TITLE_R.hourF = 20.6; drawRaftScene(TITLE_R, dt, { cx: .68, cy: .56, zoom: .85 }); }
