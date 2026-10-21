/* 《浮垣记》插画：全部在浏览器里用画布逐像素画出来，不依赖任何外部图片。
   ART.scene(n) 返回一个 <canvas>，放进页面后会在可见时自动绘制。 */
const ART = (() => {
  const TAU = Math.PI * 2;
  const W0 = 1600, H0 = 900;

  /* ------------------------------------------------ 基础工具 */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function makeNoise(seed) {
    const r = rng(seed), perm = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; [perm[i], perm[j]] = [perm[j], perm[i]]; }
    const p = new Uint8Array(512); for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
    const g = new Float32Array(256); for (let i = 0; i < 256; i++) g[i] = r();
    function n2(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), X = xi & 255, Y = yi & 255;
      const a = g[p[X + p[Y]]], b = g[p[X + 1 + p[Y]]], c = g[p[X + p[Y + 1]]], d = g[p[X + 1 + p[Y + 1]]];
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function fbm(x, y, o = 5) { let s = 0, a = .5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += a * n2(x * f + i * 17.3, y * f - i * 9.1); n += a; f *= 2.02; a *= .5; } return s / n; }
    function ridged(x, y, o = 5) { let s = 0, a = .5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += a * (1 - Math.abs(n2(x * f, y * f) * 2 - 1)); n += a; f *= 2.1; a *= .5; } return s / n; }
    return { n2, fbm, ridged };
  }
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  const hex = h => { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const col = c => typeof c === "string" ? hex(c) : c;
  const css = (c, a = 1) => { c = col(c); return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; };
  const mixc = (a, b, t) => { a = col(a); b = col(b); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
  const R = (r, a, b) => a + (b - a) * r();
  const newCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; };

  function vgrad(ctx, y0, y1, stops) { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c, a]) => g.addColorStop(o, css(c, a == null ? 1 : a))); return g; }
  function hgrad(ctx, x0, x1, stops) { const g = ctx.createLinearGradient(x0, 0, x1, 0); stops.forEach(([o, c, a]) => g.addColorStop(o, css(c, a == null ? 1 : a))); return g; }
  function sky(ctx, stops) { ctx.fillStyle = vgrad(ctx, 0, H0, stops); ctx.fillRect(0, 0, W0, H0); }
  function glow(ctx, x, y, r, c, a = 1, op = "lighter") {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, css(c, a)); g.addColorStop(.25, css(c, a * .45)); g.addColorStop(.6, css(c, a * .12)); g.addColorStop(1, css(c, 0));
    ctx.save(); ctx.globalCompositeOperation = op; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
  }
  function blurCanvas(c, k) {
    const t = newCanvas(c.width / k, c.height / k), tg = t.getContext("2d"); tg.imageSmoothingQuality = "high"; tg.drawImage(c, 0, 0, t.width, t.height);
    const t2 = newCanvas(t.width / 2, t.height / 2), t2g = t2.getContext("2d"); t2g.imageSmoothingQuality = "high"; t2g.drawImage(t, 0, 0, t2.width, t2.height);
    const o = newCanvas(c.width, c.height), og = o.getContext("2d"); og.imageSmoothingQuality = "high"; og.drawImage(t2, 0, 0, c.width, c.height); return o;
  }
  /* 在单独的图层上画，再统一加雾、模糊，做出空气透视 */
  function layer(ctx, draw, o = {}) {
    const W = ctx.canvas.width, H = ctx.canvas.height, s = W / W0;
    const c = newCanvas(W, H), g = c.getContext("2d"); g.setTransform(s, 0, 0, s, 0, 0); draw(g);
    g.globalCompositeOperation = "source-atop";
    if (o.tint) { g.fillStyle = css(o.tint[0], o.tint[1]); g.fillRect(0, 0, W0, H0); }
    if (o.fog) { const [c0, y0, y1, a0, a1] = o.fog; g.fillStyle = vgrad(g, y0, y1, [[0, c0, a0], [1, c0, a1]]); g.fillRect(0, 0, W0, H0); }
    g.globalCompositeOperation = "source-over";
    const src = o.blur ? blurCanvas(c, o.blur) : c;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; if (o.op) ctx.globalCompositeOperation = o.op; ctx.drawImage(src, 0, 0); ctx.restore();
  }

  /* 逐像素体积：给一个密度函数，按光线方向算明暗，画出有体积的云、雾、水汽 */
  function field(ctx, bbox, dens, o) {
    const [bx, by, bw, bh] = bbox, s = ctx.canvas.width / W0, q = o.q || .75, fm = o.fade ? Math.min(bw, bh) * o.fade : 0;
    const w = Math.max(8, Math.round(bw * s * q)), h = Math.max(8, Math.round(bh * s * q));
    const c = newCanvas(w, h), g = c.getContext("2d"), img = g.createImageData(w, h), D = img.data;
    const [lx, ly] = o.light || [-30, -30], th = o.th == null ? .5 : o.th, soft = o.soft || .12, gain = o.gain || 3.2;
    const L = col(o.lit), S = col(o.shade), RM = col(o.rim || o.lit), A = o.alpha == null ? 1 : o.alpha, rimAmt = o.rimAmt == null ? .5 : o.rimAmt;
    const B = o.bottom ? col(o.bottom[0]) : null;
    for (let j = 0; j < h; j++) {
      const Y = by + (j + .5) / h * bh;
      for (let i = 0; i < w; i++) {
        const X = bx + (i + .5) / w * bw, ef = fm ? sm(0, fm, Math.min(X - bx, bx + bw - X)) * sm(0, fm, Math.min(Y - by, by + bh - Y)) : 1;
        if (ef <= 0) continue;
        const d = dens(X, Y) * ef, a = sm(th, th + soft, d);
        if (a <= .004) continue;
        const d2 = dens(X + lx, Y + ly) * ef;
        let b = clamp(.58 + (d - d2) * gain, 0, 1);
        let r = S[0] + (L[0] - S[0]) * b, gg = S[1] + (L[1] - S[1]) * b, bb = S[2] + (L[2] - S[2]) * b;
        const edge = (1 - sm(th, th + soft * 3, d)) * b * rimAmt;
        r += (RM[0] - r) * edge; gg += (RM[1] - gg) * edge; bb += (RM[2] - bb) * edge;
        if (B) { const t = sm(o.bottom[1], o.bottom[2], Y) * o.bottom[3] * (1 - b * .5); r += (B[0] - r) * t; gg += (B[1] - gg) * t; bb += (B[2] - bb) * t; }
        const k = (j * w + i) * 4; D[k] = r; D[k + 1] = gg; D[k + 2] = bb; D[k + 3] = a * A * 255;
      }
    }
    g.putImageData(img, 0, 0);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; if (o.op) ctx.globalCompositeOperation = o.op; ctx.drawImage(c, bx, by, bw, bh); ctx.restore();
  }
  /* 堆积云：一组高斯团块 + 噪声细节 */
  function cumulusFn(N, cx, base, w, h, seed) {
    const r = rng(seed), blobs = [];
    for (let i = 0; i < 16; i++) {
      const up = Math.pow(r(), .75), x = cx + (r() - .5) * w * (1 - up * .55), y = base - up * h * .82;
      blobs.push([x, y, (w * .1 + r() * w * .13) * (1 - up * .35)]);
    }
    return (X, Y) => {
      let d = 0; for (const [x, y, rr] of blobs) { const dx = X - x, dy = (Y - y) * 1.1; d += Math.exp(-(dx * dx + dy * dy) / (rr * rr)); }
      d = Math.min(d, 1.6) * .62 + (N.fbm(X * .011, Y * .011, 5) - .5) * .7;
      return d * sm(base + 20, base - 30, Y);
    };
  }
  function cumulus(ctx, N, cx, base, w, h, seed, o) { field(ctx, [cx - w * .95, base - h * 1.4, w * 1.9, h * 1.6], cumulusFn(N, cx, base, w, h, seed), Object.assign({ th: .42, soft: .14, fade: .12, q: .9 }, o)); }
  function cloudSea(ctx, N, top, o, x0 = 0, x1 = W0, carve) {
    field(ctx, [x0, top - 70, x1 - x0, H0 - top + 70], (X, Y) => {
      const v = clamp((Y - top) / (H0 - top), 0, 1), k = 1 / (.18 + v);
      const edge = sm(top - 40, top + 45, Y + (N.fbm(X * .006, 3.3, 4) - .5) * 70);
      const bil = N.fbm(X * .0035 * k + 11, k * 2.2, 5), fine = N.fbm(X * .012 * k, Y * .03, 3);
      let d = edge * (.48 + .62 * bil + .18 * (fine - .5));
      return carve ? d * carve(X, Y) : d;
    }, Object.assign({ th: .5, soft: .14, light: [-26, -30], gain: 4.2, q: .8 }, o));
  }
  function stratus(ctx, N, y0, y1, o, fx = .0016, fy = .011) {
    field(ctx, [-40, y0, W0 + 80, y1 - y0], (X, Y) => N.fbm(X * fx + 5, Y * fy, 6) * sm(y0, y0 + (y1 - y0) * .35, Y) * sm(y1, y1 - (y1 - y0) * .35, Y) * 1.35, Object.assign({ th: .42, soft: .2 }, o));
  }
  /* 岩石纹理（在调用前先 clip） */
  function rockTex(ctx, N, bbox, dark, light, alpha = .5, f = .02, q = .5) {
    const [bx, by, bw, bh] = bbox;
    const s = ctx.canvas.width / W0, w = Math.max(8, Math.round(bw * s * q)), h = Math.max(8, Math.round(bh * s * q));
    const c = newCanvas(w, h), g = c.getContext("2d"), img = g.createImageData(w, h), D = img.data, Dk = col(dark), Lt = col(light);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = bx + (i + .5) / w * bw, Y = by + (j + .5) / h * bh;
      const v = N.ridged(X * f, Y * f * 1.6, 5), v2 = N.fbm(X * f * 4, Y * f * 4, 3);
      const t = clamp((v - .5) * 2.2 + (v2 - .5), -1, 1), k = (j * w + i) * 4, cc = t > 0 ? Lt : Dk;
      D[k] = cc[0]; D[k + 1] = cc[1]; D[k + 2] = cc[2]; D[k + 3] = Math.abs(t) * alpha * 255;
    }
    g.putImageData(img, 0, 0); ctx.drawImage(c, bx, by, bw, bh);
  }
  function ridge(ctx, N, o) {
    const { y, amp, f = .004, x0 = -10, x1 = W0 + 10, bottom = H0 + 10, oct = 5, off = 0 } = o;
    const p = new Path2D(); p.moveTo(x0, bottom); let minY = 1e9;
    for (let X = x0; X <= x1; X += 4) { const Y = y - (N.fbm(X * f + off, off * .3, oct) - .3) * amp - (o.shape ? o.shape(X) : 0); minY = Math.min(minY, Y); p.lineTo(X, Y); }
    p.lineTo(x1, bottom); p.closePath();
    ctx.fillStyle = vgrad(ctx, minY, bottom, o.grad); ctx.fill(p);
    if (o.tex) { ctx.save(); ctx.clip(p); rockTex(ctx, N, [x0, minY, x1 - x0, bottom - minY], o.tex[0], o.tex[1], o.tex[2] || .35, o.tex[3] || .012); ctx.restore(); }
    return p;
  }
  /* 浮空岛：草顶 + 岩石底 + 地层纹 + 垂根 */
  function island(ctx, N, cx, cy, w, o = {}) {
    const h = w * (o.depth || .62), seedOff = cx * .013;
    const under = new Path2D(); under.moveTo(cx - w / 2, cy);
    const n = 30;
    for (let i = 1; i < n; i++) {
      const t = i / n, prof = Math.pow(Math.sin(Math.PI * Math.pow(t, o.lean || 1)), 1.15), jag = (N.fbm(t * 6 + seedOff, cy * .01, 4) - .5) * w * .28;
      under.lineTo(cx - w / 2 + w * t + jag * .15, cy + prof * h + jag * prof);
    }
    under.lineTo(cx + w / 2, cy); under.closePath();
    ctx.fillStyle = hgrad(ctx, cx - w / 2, cx + w / 2, [[0, o.rockLit || "#A88E76"], [.45, o.rock || "#7B6656"], [1, o.rockShade || "#3F3438"]]); ctx.fill(under);
    ctx.save(); ctx.clip(under);
    ctx.fillStyle = vgrad(ctx, cy, cy + h, [[0, "#000000", 0], [1, o.deep || "#1E1A24", .75]]); ctx.fillRect(cx - w, cy, w * 2, h * 1.2);
    rockTex(ctx, N, [cx - w / 2, cy, w, h * 1.1], o.rockShade || "#3F3438", o.rockLit || "#C4AA90", .38, 7 / w * 3);
    ctx.strokeStyle = css(o.rockLit || "#C4AA90", .25); ctx.lineWidth = Math.max(.6, w / 260);
    for (let k = 1; k < 6; k++) { ctx.beginPath(); for (let X = cx - w / 2; X <= cx + w / 2; X += w / 40) { const Y = cy + k * h * .12 + (N.fbm(X * .02, k * 3.1, 3) - .5) * h * .1; X === cx - w / 2 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); } ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = css(o.rockShade || "#3F3438", .7); ctx.lineWidth = Math.max(.6, w / 300);
    const r = rng(cx | 0);
    for (let i = 0; i < 9; i++) { const x = cx + (r() - .5) * w * .55, yy = cy + h * (.35 + r() * .45) * Math.sin(Math.PI * (.5 + (x - cx) / w)); ctx.beginPath(); ctx.moveTo(x, yy); ctx.bezierCurveTo(x + R(r, -8, 8), yy + h * .15, x + R(r, -10, 10), yy + h * .28, x + R(r, -6, 6), yy + h * R(r, .3, .55)); ctx.stroke(); }
    const capH = w * .085;
    ctx.fillStyle = vgrad(ctx, cy - capH, cy + capH, [[0, o.grassLit || "#B7CF86"], [.6, o.grass || "#7FA35E"], [1, o.soil || "#5C4A3B"]]);
    ctx.beginPath(); ctx.ellipse(cx, cy, w / 2, capH, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = css(o.grassLit || "#DCEAB4", .7); ctx.lineWidth = Math.max(.8, w / 200);
    ctx.beginPath(); ctx.ellipse(cx, cy, w / 2, capH, 0, Math.PI * 1.05, Math.PI * 1.75); ctx.stroke();
    return { top: cy - capH * .4, cap: capH, under };
  }
  /* 尖塔：圆柱明暗、锥顶瓦纹、拱窗、阳台；三种样式混着用 */
  function tower(ctx, x, base, w, h, P, r) {
    const style = r(), top = base - h, tv = r() * .45, tw = P.tone || "#C9A27A";
    ctx.fillStyle = hgrad(ctx, x - w / 2, x + w / 2, [[0, mixc(P.wallLit, tw, tv * .5)], [.3, mixc(P.wall, tw, tv)], [.75, mixc(P.wallShade, tw, tv * .6)], [1, P.wallShade]]);
    ctx.fillRect(x - w / 2, top, w, h);
    if (w > 14) {
      ctx.strokeStyle = css(P.wallShade, .18); ctx.lineWidth = .6;
      for (let y = top + w * .5; y < base; y += w * .32) { ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.stroke(); }
      ctx.fillStyle = css(P.wallShade, .35); ctx.fillRect(x - w / 2, top, w, w * .12);
    }
    if (w > 10 && r() < .35) { const by = top + h * R(r, .2, .45); ctx.fillStyle = hgrad(ctx, x - w * .7, x + w * .7, [[0, P.wallLit], [1, P.wallShade]]); ctx.fillRect(x - w * .66, by, w * 1.32, w * .14); ctx.fillStyle = css(P.wallShade, .7); for (let k = -3; k <= 3; k++) ctx.fillRect(x + k * w * .2 - .5, by + w * .14, 1, w * .2); }
    let apex;
    if (style < .62) {
      const rh = w * (1.4 + r() * .8), ov = w * .14; apex = top - rh;
      const p = new Path2D(); p.moveTo(x - w / 2 - ov, top); p.quadraticCurveTo(x - w * .22, top - rh * .42, x, apex); p.quadraticCurveTo(x + w * .22, top - rh * .42, x + w / 2 + ov, top); p.closePath();
      ctx.fillStyle = hgrad(ctx, x - w / 2, x + w / 2, [[0, P.roofLit], [.4, P.roof], [1, P.roofShade]]); ctx.fill(p);
      if (w > 12) { ctx.save(); ctx.clip(p); ctx.strokeStyle = css(P.roofShade, .35); ctx.lineWidth = .7; for (let k = 1; k < 7; k++) { const yy = top - rh * k / 7, hw = (w / 2 + ov) * (1 - k / 7.5); ctx.beginPath(); ctx.moveTo(x - hw, yy + rh * .02); ctx.quadraticCurveTo(x, yy + rh * .06, x + hw, yy + rh * .02); ctx.stroke(); } ctx.restore(); }
    } else if (style < .86) {
      const rh = w * (.9 + r() * .5); apex = top - rh;
      ctx.fillStyle = P.roofLit; ctx.beginPath(); ctx.moveTo(x - w * .58, top); ctx.lineTo(x, apex); ctx.lineTo(x, top); ctx.fill();
      ctx.fillStyle = P.roofShade; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, apex); ctx.lineTo(x + w * .58, top); ctx.fill();
    } else {
      apex = top - w * .62;
      ctx.fillStyle = hgrad(ctx, x - w / 2, x + w / 2, [[0, P.roofLit], [.45, P.roof], [1, P.roofShade]]); ctx.beginPath(); ctx.ellipse(x, top, w * .55, w * .62, 0, Math.PI, TAU); ctx.fill();
    }
    if (w > 8) { ctx.strokeStyle = css(P.roofShade, .9); ctx.lineWidth = Math.max(.7, w * .04); ctx.beginPath(); ctx.moveTo(x, apex); ctx.lineTo(x, apex - w * .45); ctx.stroke(); }
    if (w > 10) for (let k = 1; k < h / (w * 1.25) - .5; k++) {
      const lit = r() < (P.litWin || .1), wy = top + k * w * 1.25, ww = w * .2, wh = w * .42, wx = x - w * .18;
      ctx.fillStyle = lit ? css(P.winLit || "#FFD58A", .95) : css(P.win, .8);
      ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx, wy + ww / 2); ctx.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); ctx.lineTo(wx + ww, wy + wh); ctx.fill();
      if (lit) glow(ctx, wx + ww / 2, wy + wh / 2, w * .9, P.winLit || "#FFD58A", .35);
    }
  }
  function city(ctx, seed, x0, x1, base, hmin, hmax, wmin, wmax, P, jitter = 30) {
    const r = rng(seed); let x = x0; const list = [];
    while (x < x1) { const w = R(r, wmin, wmax), cluster = .55 + .9 * Math.pow(r(), 1.6); list.push([x, base + R(r, 0, jitter), w, R(r, hmin, hmax) * cluster]); x += w * R(r, .7, 1.7); }
    list.sort((a, b) => a[1] - b[1]).forEach(([x, b, w, h], i) => {
      tower(ctx, x, b, w, h, P, r);
      const nx = list[i + 1];
      if (nx && r() < .18 && w > 12) { const y = b - Math.min(h, nx[3]) * R(r, .3, .6), x1b = nx[0]; ctx.strokeStyle = css(P.wallShade, .8); ctx.lineWidth = w * .12; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.quadraticCurveTo((x + x1b) / 2, y + w * .5, x1b - nx[2] / 2, y); ctx.stroke(); }
    });
  }
  /* 人影（小比例剪影，带一点轮廓光） */
  function figure(ctx, kind, x, y, s, c, rim) {
    const p = new Path2D();
    const head = (hx, hy, hr) => { p.moveTo(hx + hr, hy); p.arc(hx, hy, hr, 0, TAU); };
    if (kind === "stand" || kind === "elf") { head(x, y - 30 * s, 4.3 * s); p.moveTo(x - 6 * s, y - 25 * s); p.lineTo(x + 6 * s, y - 25 * s); p.lineTo(x + 7.5 * s, y); p.lineTo(x - 7.5 * s, y); p.closePath(); }
    if (kind === "elf") { p.moveTo(x - 3.5 * s, y - 31 * s); p.lineTo(x - 11 * s, y - 36 * s); p.lineTo(x - 4 * s, y - 28 * s); p.moveTo(x + 3.5 * s, y - 31 * s); p.lineTo(x + 11 * s, y - 36 * s); p.lineTo(x + 4 * s, y - 28 * s); }
    if (kind === "sit") { head(x, y - 21 * s, 4 * s); p.moveTo(x - 5 * s, y - 16 * s); p.lineTo(x + 5 * s, y - 16 * s); p.lineTo(x + 12 * s, y); p.lineTo(x - 12 * s, y); p.closePath(); }
    if (kind === "stout") { head(x, y - 23 * s, 4.8 * s); p.moveTo(x - 10 * s, y - 18 * s); p.lineTo(x + 10 * s, y - 18 * s); p.lineTo(x + 11.5 * s, y); p.lineTo(x - 11.5 * s, y); p.closePath(); }
    if (kind === "cloak") { head(x, y - 30 * s, 4.3 * s); p.moveTo(x - 6 * s, y - 25 * s); p.lineTo(x + 6 * s, y - 25 * s); p.lineTo(x + 7 * s, y); p.lineTo(x - 7 * s, y); p.closePath(); }
    if (kind === "rider") {
      p.ellipse(x, y - 16 * s, 15 * s, 6.5 * s, 0, 0, TAU); p.moveTo(x + 11 * s, y - 20 * s); p.lineTo(x + 20 * s, y - 31 * s); p.lineTo(x + 24 * s, y - 29 * s); p.lineTo(x + 17 * s, y - 17 * s); p.closePath();
      [-11, -6, 6, 11].forEach(d => { p.rect(x + d * s - .9 * s, y - 12 * s, 1.8 * s, 12 * s); });
      head(x - 2 * s, y - 42 * s, 3.6 * s); p.moveTo(x - 7 * s, y - 38 * s); p.lineTo(x + 3 * s, y - 38 * s); p.lineTo(x + 4 * s, y - 20 * s); p.lineTo(x - 8 * s, y - 20 * s); p.closePath();
    }
    ctx.fillStyle = css(c); ctx.fill(p);
    if (rim) { ctx.save(); ctx.clip(p); ctx.translate(rim[1] * s, -1.2 * s); ctx.globalCompositeOperation = "source-atop"; ctx.strokeStyle = css(rim[0], .9); ctx.lineWidth = 1.6 * s; ctx.stroke(p); ctx.restore(); }
    return p;
  }
  function cloakFlow(ctx, x, y, s, c) { ctx.fillStyle = css(c); ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 25 * s); ctx.bezierCurveTo(x + 10 * s, y - 24 * s, x + 22 * s, y - 16 * s, x + 30 * s, y - 6 * s); ctx.lineTo(x + 8 * s, y - 2 * s); ctx.closePath(); ctx.fill(); }
  function birds(ctx, r, n, x, y, w, h, c = "#FFFFFF", sz = 12) {
    ctx.strokeStyle = css(c, .9); ctx.lineCap = "round";
    for (let i = 0; i < n; i++) { const bx = x + R(r, 0, w), by = y + R(r, 0, h), k = sz * R(r, .55, 1.2), fl = R(r, .3, .8); ctx.lineWidth = k * .16; ctx.beginPath(); ctx.moveTo(bx - k, by - k * fl * .3); ctx.quadraticCurveTo(bx - k * .45, by - k * fl, bx, by); ctx.quadraticCurveTo(bx + k * .45, by - k * fl, bx + k, by - k * fl * .3); ctx.stroke(); }
  }
  function motes(ctx, r, n, x, y, w, h, c, rmax, glowAmt = .6) {
    for (let i = 0; i < n; i++) { const mx = x + R(r, 0, w), my = y + R(r, 0, h), mr = R(r, .4, rmax); ctx.fillStyle = css(c, R(r, .4, 1)); ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill(); if (mr > rmax * .65 && glowAmt) glow(ctx, mx, my, mr * 7, c, glowAmt * .5); }
  }
  function stars(ctx, r, n, h) { for (let i = 0; i < n; i++) { const x = R(r, 0, W0), y = Math.pow(r(), 1.4) * h, s = Math.pow(r(), 3) * 1.8 + .3; ctx.fillStyle = css("#FFFFFF", R(r, .35, 1)); ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill(); if (s > 1.5) glow(ctx, x, y, s * 6, "#CFE3FF", .4); } }
  let grainTile = null;
  function finish(ctx, o = {}) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const b = blurCanvas(ctx.canvas, 12); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = o.bloom == null ? .28 : o.bloom; ctx.drawImage(b, 0, 0);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(W / 2, H * .46, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .72);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, css(o.vigCol || "#0A1428", o.vig == null ? .32 : o.vig)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (!grainTile) { grainTile = newCanvas(160, 160); const gg = grainTile.getContext("2d"), im = gg.createImageData(160, 160), r = rng(9); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } gg.putImageData(im, 0, 0); }
    ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = o.grain == null ? .07 : o.grain; ctx.fillStyle = ctx.createPattern(grainTile, "repeat"); ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* 常用的云色 */
  const DAY = { lit: "#FFFDF8", shade: "#9FB6D3", rim: "#FFFFFF" };

  /* ================================================ 十三幅场景 */
  const S = [];

  S[0] = (ctx) => { // 序章：信鹭
    const N = makeNoise(100), r = rng(100);
    sky(ctx, [[0, "#5E9AD2"], [.45, "#A8CDEB"], [.8, "#E6F0F7"], [1, "#F6F2EA"]]);
    glow(ctx, 1260, 180, 420, "#FFF6E0", .55, "screen");
    stratus(ctx, N, 70, 260, { lit: "#FFFFFF", shade: "#B9CDE2", light: [30, -20], alpha: .7 });
    cumulus(ctx, N, 290, 560, 560, 330, 11, Object.assign({}, DAY, { light: [30, -30], bottom: ["#8EA6C6", 470, 560, .5] }));
    cumulus(ctx, N, 1360, 520, 480, 280, 12, Object.assign({}, DAY, { light: [30, -30], bottom: ["#8EA6C6", 430, 520, .5] }));
    layer(ctx, g => { island(g, N, 1120, 560, 170, {}); island(g, N, 470, 640, 90, {}); island(g, N, 1450, 660, 70, {}); }, { fog: ["#CFE0EF", 500, 760, .35, .55] });
    cloudSea(ctx, N, 700, { lit: "#FFFFFF", shade: "#AFC3DA", rim: "#FFFFFF" });
    // 信鹭
    ctx.save(); ctx.translate(760, 330); ctx.rotate(-.12);
    const wing = (dir) => { const p = new Path2D(); p.moveTo(0, 0); p.bezierCurveTo(dir * 70, -50, dir * 170, -110, dir * 330, -96); p.bezierCurveTo(dir * 250, -60, dir * 190, -30, dir * 120, -6); p.bezierCurveTo(dir * 80, 8, dir * 40, 14, 0, 16); p.closePath(); return p; };
    [-1, 1].forEach(d => { const p = wing(d); ctx.fillStyle = hgrad(ctx, 0, d * 330, [[0, "#F4F6F9"], [.7, "#FFFFFF"], [1, "#DCE4EE"]]); ctx.fill(p); ctx.save(); ctx.clip(p); ctx.strokeStyle = css("#B9C7D8", .55); ctx.lineWidth = 1.2; for (let k = 0; k < 12; k++) { ctx.beginPath(); ctx.moveTo(d * (110 + k * 18), -20 - k * 6); ctx.lineTo(d * (140 + k * 18), -60 - k * 4); ctx.stroke(); } ctx.restore(); });
    ctx.fillStyle = vgrad(ctx, -10, 40, [[0, "#FFFFFF"], [1, "#C9D5E2"]]); ctx.beginPath(); ctx.ellipse(0, 14, 72, 21, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(58, 4); ctx.quadraticCurveTo(92, -6, 106, 2); ctx.quadraticCurveTo(92, 12, 60, 20); ctx.fill();
    ctx.fillStyle = "#E39A4C"; ctx.beginPath(); ctx.moveTo(104, 1); ctx.lineTo(124, 5); ctx.lineTo(104, 8); ctx.fill();
    ctx.fillStyle = "#1F2A36"; ctx.beginPath(); ctx.arc(92, 4, 2.2, 0, TAU); ctx.fill();
    ctx.fillStyle = "#EEF2F6"; ctx.beginPath(); ctx.moveTo(-64, 16); ctx.lineTo(-118, 34); ctx.lineTo(-62, 26); ctx.fill();
    ctx.fillStyle = hgrad(ctx, -8, 12, [[0, "#E2A55E"], [1, "#9C6430"]]); ctx.fillRect(-8, 30, 20, 8);
    ctx.restore();
    birds(ctx, r, 5, 980, 160, 360, 140, "#FFFFFF", 13);
    finish(ctx, { bloom: .3, vig: .22 });
  };

  S[1] = (ctx) => { // 坠石：晨光里的千塔
    const N = makeNoise(201), r = rng(201);
    sky(ctx, [[0, "#5D8FC6"], [.3, "#9DC0E2"], [.62, "#F2D7B6"], [.8, "#FBE4C0"], [1, "#FCEBD2"]]);
    glow(ctx, 330, 610, 560, "#FFE7B8", .8, "screen");
    stratus(ctx, N, 60, 330, { lit: "#FFF4E2", shade: "#B4B6D2", rim: "#FFE2B8", light: [-40, 8], alpha: .85 });
    cumulus(ctx, N, 1290, 560, 700, 360, 21, { lit: "#FFF2DD", shade: "#B9AFC8", rim: "#FFD9A6", light: [-40, 6], bottom: ["#A99DB8", 470, 560, .45] });
    const pal = { wallLit: "#F2E3D2", wall: "#D7C2AF", wallShade: "#9C8577", roofLit: "#F6B57A", roof: "#E0884A", roofShade: "#9A5534", win: "#6E5A55", winLit: "#FFD38A", litWin: .08 };
    layer(ctx, g => city(g, 2101, -30, 1660, 830, 110, 240, 14, 22, pal, 20), { fog: ["#F5DEC0", 560, 840, .7, .55], blur: 3 });
    stratus(ctx, N, 600, 760, { lit: "#FFFFFF", shade: "#E9D3BF", rim: "#FFF1DD", light: [-40, 6], alpha: .95 }, .0022, .02);
    layer(ctx, g => city(g, 2102, -30, 1660, 900, 170, 380, 22, 34, pal, 30), { fog: ["#F3DBBF", 600, 900, .45, .2] });
    stratus(ctx, N, 760, 880, { lit: "#FFFFFF", shade: "#E7D1BD", rim: "#FFF1DD", light: [-40, 6], alpha: .95 }, .0024, .022);
    layer(ctx, g => city(g, 2103, -60, 1120, 980, 260, 470, 34, 52, pal, 40), {});
    // 前景高塔
    const P1 = { wallLit: "#EADBC9", wall: "#C8B19C", wallShade: "#7E6A5E", roofLit: "#F2A866", roof: "#D27A3E", roofShade: "#8A4729" };
    const tp = new Path2D(); tp.rect(1215, 300, 170, 640);
    ctx.fillStyle = hgrad(ctx, 1215, 1385, [[0, P1.wallLit], [.35, P1.wall], [1, P1.wallShade]]); ctx.fill(tp);
    ctx.save(); ctx.clip(tp); rockTex(ctx, N, [1215, 300, 170, 640], "#6F5B50", "#F5E8D8", .32, .03); ctx.strokeStyle = css("#8B7466", .35); ctx.lineWidth = 1; for (let y = 320; y < 940; y += 22) { ctx.beginPath(); ctx.moveTo(1215, y); ctx.lineTo(1385, y); ctx.stroke(); } ctx.restore();
    ctx.fillStyle = "#3D3236"; [[1260, 420], [1300, 560], [1260, 700]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y + 40); ctx.lineTo(x, y + 12); ctx.quadraticCurveTo(x + 11, y, x + 22, y + 12); ctx.lineTo(x + 22, y + 40); ctx.fill(); });
    ctx.fillStyle = hgrad(ctx, 1190, 1410, [[0, "#E7D5C2"], [1, "#8E7868"]]); ctx.fillRect(1188, 296, 224, 16);
    { const rp = new Path2D(); rp.moveTo(1192, 298); rp.quadraticCurveTo(1250, 230, 1300, 120); rp.quadraticCurveTo(1350, 230, 1408, 298); rp.closePath(); ctx.fillStyle = hgrad(ctx, 1192, 1408, [[0, P1.roofLit], [.45, P1.roof], [1, P1.roofShade]]); ctx.fill(rp); ctx.save(); ctx.clip(rp); ctx.strokeStyle = css(P1.roofShade, .4); ctx.lineWidth = 1; for (let k = 1; k < 9; k++) { const yy = 298 - k * 20, hw = 108 * (1 - k / 9.3); ctx.beginPath(); ctx.moveTo(1300 - hw, yy + 4); ctx.quadraticCurveTo(1300, yy + 12, 1300 + hw, yy + 4); ctx.stroke(); } ctx.restore(); ctx.strokeStyle = "#7A3F24"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1300, 120); ctx.lineTo(1300, 84); ctx.stroke(); }
    glow(ctx, 1215, 400, 240, "#FFD9A2", .35, "screen");
    figure(ctx, "sit", 1268, 296, 1.7, "#3E4A5C", ["#FFD7A4", -1.2]);
    ctx.fillStyle = hgrad(ctx, 1276, 1288, [[0, "#E7A660"], [1, "#9B612F"]]); ctx.fillRect(1276, 262, 11, 12);
    ctx.strokeStyle = css("#FFFFFF", .55); ctx.lineWidth = 1.6; [[1279, 0], [1285, 1]].forEach(([x, k]) => { ctx.beginPath(); ctx.moveTo(x, 258); ctx.bezierCurveTo(x - 8 + k * 14, 244, x + 6 - k * 10, 232, x + k * 4, 218); ctx.stroke(); });
    birds(ctx, r, 9, 520, 150, 640, 260, "#FFFFFF", 15);
    finish(ctx, { bloom: .32, vig: .26, vigCol: "#3A2410" });
  };

  S[2] = (ctx) => { // 沉渊：云海裂开
    const N = makeNoise(302), r = rng(302);
    sky(ctx, [[0, "#3E7BB8"], [.4, "#88B7DE"], [.6, "#D9E7F1"], [1, "#F2EEE6"]]);
    glow(ctx, 1420, 300, 520, "#FFE3B8", .6, "screen");
    cumulus(ctx, N, 260, 500, 640, 360, 31, { lit: "#FFE8CC", shade: "#8DA0C2", rim: "#FFD6A0", light: [40, -14], bottom: ["#7E8FB3", 420, 500, .5] });
    cumulus(ctx, N, 1360, 470, 660, 400, 32, { lit: "#FFEBD2", shade: "#90A3C4", rim: "#FFD9A6", light: [40, -14], bottom: ["#7E8FB3", 380, 470, .5] });
    // 裂口底下的海和陆地
    const cl = X => 560 + (X - 500) * .2 + Math.sin(X * .004) * 18, wid = X => sm(470, 900, X) * (40 + (X - 470) * .17);
    const rift = new Path2D(); rift.moveTo(470, cl(470)); for (let X = 470; X <= 1640; X += 10) rift.lineTo(X, cl(X) - wid(X)); for (let X = 1640; X >= 470; X -= 10) rift.lineTo(X, cl(X) + wid(X)); rift.closePath();
    ctx.save(); ctx.clip(rift);
    ctx.fillStyle = vgrad(ctx, 480, 900, [[0, "#1F6FA6"], [1, "#0D3D68"]]); ctx.fillRect(400, 400, 1300, 600);
    field(ctx, [460, 440, 1200, 460], (X, Y) => N.fbm(X * .006 + 9, Y * .016, 6) + sm(500, 1500, X) * .05, { th: .53, soft: .03, lit: "#8FA86A", shade: "#4F6B3E", rim: "#C9B98A", light: [12, -10], gain: 6, rimAmt: .8 });
    field(ctx, [460, 440, 1200, 460], (X, Y) => N.ridged(X * .02, Y * .05, 4) * sm(.53, .6, N.fbm(X * .006 + 9, Y * .016, 6)), { th: .72, soft: .1, lit: "#E7E0CF", shade: "#5E5644", light: [10, -6], gain: 5 });
    for (let i = 0; i < 120; i++) { const x = R(r, 900, 1600), y = cl(x) + R(r, -wid(x), wid(x)); ctx.strokeStyle = css("#FFFFFF", R(r, .1, .5)); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + R(r, 6, 20), y); ctx.stroke(); }
    glow(ctx, 1300, 760, 160, "#FFF6E0", .5);
    ctx.restore();
    cloudSea(ctx, N, 520, { lit: "#FFF6EA", shade: "#A3B3CC", rim: "#FFE6C4", light: [30, -16], bottom: ["#7E90AF", 700, 900, .4] }, 0, W0, (X, Y) => { const d = Math.abs(Y - cl(X)) - wid(X); return sm(-6, 46, d); });
    // 断喙岩
    const crag = new Path2D(); crag.moveTo(-10, 910); crag.lineTo(-10, 640); crag.bezierCurveTo(80, 600, 160, 560, 230, 520); crag.lineTo(290, 476); crag.lineTo(332, 470); crag.lineTo(372, 500); crag.bezierCurveTo(420, 560, 470, 650, 520, 910); crag.closePath();
    ctx.fillStyle = hgrad(ctx, 0, 520, [[0, "#1C222C"], [.75, "#2F3743"], [1, "#4B4F57"]]); ctx.fill(crag);
    ctx.save(); ctx.clip(crag); rockTex(ctx, N, [-10, 460, 540, 460], "#0D1117", "#7C7E85", .45, .02); ctx.strokeStyle = css("#FFCF98", .6); ctx.lineWidth = 3; ctx.stroke(crag); ctx.restore();
    cloakFlow(ctx, 318, 472, 1.9, "#8B3A27"); figure(ctx, "cloak", 318, 472, 1.9, "#1F242C", ["#FFC992", 1.2]);
    ctx.strokeStyle = "#1F242C"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(302, 472); ctx.lineTo(296, 396); ctx.stroke();
    // 灰鹞号
    ctx.save(); ctx.translate(560, 660); ctx.rotate(.12);
    ctx.fillStyle = hgrad(ctx, -70, 70, [[0, "#6A5442"], [1, "#2E241E"]]); ctx.beginPath(); ctx.moveTo(-74, 0); ctx.lineTo(70, 0); ctx.quadraticCurveTo(58, 22, 30, 24); ctx.lineTo(-50, 24); ctx.quadraticCurveTo(-70, 18, -74, 0); ctx.fill();
    ctx.fillStyle = "#B07A3A"; ctx.fillRect(-60, 18, 120, 4);
    ctx.fillStyle = vgrad(ctx, -90, 0, [[0, "#F4EDE1"], [1, "#CBBFAE"]]); ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(-4, -92); ctx.quadraticCurveTo(30, -50, 40, -4); ctx.fill(); ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(-10, -70); ctx.quadraticCurveTo(-36, -36, -46, -6); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = css("#2A2A30", .55); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(548, 668); ctx.lineTo(600, 760); ctx.stroke();
    birds(ctx, r, 4, 720, 200, 320, 120, "#FFFFFF", 12);
    finish(ctx, { bloom: .3, vig: .3 });
  };

  S[3] = (ctx) => { // 领航师：一人石的灯
    const N = makeNoise(403), r = rng(403);
    sky(ctx, [[0, "#050D1C"], [.45, "#10264A"], [.75, "#1E4675"], [1, "#2F5C8A"]]);
    stars(ctx, r, 420, 600);
    field(ctx, [0, 120, W0, 360], (X, Y) => N.fbm(X * .003, Y * .006, 5) * sm(120, 260, Y) * sm(480, 340, Y) * 1.3, { th: .5, soft: .3, lit: "#5FB7E8", shade: "#1A3B66", light: [0, 0], alpha: .22, op: "lighter" });
    ctx.strokeStyle = css("#9CC2E4", .16); ctx.lineWidth = 1.4; ctx.setLineDash([4, 10]); [[300, 1000, 1500, 520], [300, 1060, 1250, 420]].forEach(([x, y, a, b]) => { ctx.beginPath(); ctx.ellipse(x, y, a, b, 0, 0, TAU); ctx.stroke(); }); ctx.setLineDash([]);
    cloudSea(ctx, N, 660, { lit: "#4F7DB0", shade: "#0F2342", rim: "#86B9E6", light: [-40, -20], bottom: ["#081428", 760, 900, .6] });
    motes(ctx, r, 260, 0, 600, W0, 300, "#8ED4FF", 2.2, .5);
    glow(ctx, 1430, 690, 300, "#F2A85A", .55, "screen");
    layer(ctx, g => city(g, 4031, 1320, 1540, 700, 26, 80, 6, 11, { wallLit: "#3A3E58", wall: "#262A40", wallShade: "#151827", roofLit: "#4A3E48", roof: "#2E2632", roofShade: "#1B1620", win: "#1B1620", winLit: "#FFC47A", litWin: .6 }, 6), { fog: ["#F2A85A", 600, 710, .25, .1] });
    // 一人石
    island(ctx, N, 640, 562, 230, { grass: "#2F3E50", grassLit: "#6E89A8", soil: "#1D2532", rock: "#2A3140", rockLit: "#56637A", rockShade: "#0E121B", deep: "#070A10", depth: .5 });
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = hgrad(ctx, 690, 1600, [[0, "#FFE7B4", .22], [1, "#FFE7B4", 0]]); ctx.beginPath(); ctx.moveTo(668, 368); ctx.lineTo(1600, 232); ctx.lineTo(1600, 440); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.strokeStyle = hgrad(ctx, 652, 670, [[0, "#C9B37A"], [1, "#5E4E2E"]]); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(660, 556); ctx.lineTo(664, 384); ctx.stroke();
    ctx.fillStyle = "#3B3226"; ctx.fillRect(644, 352, 40, 8); ctx.fillStyle = "#FFF1CC"; ctx.fillRect(648, 360, 32, 26); ctx.fillStyle = "#3B3226"; ctx.fillRect(644, 386, 40, 6); ctx.beginPath(); ctx.moveTo(644, 352); ctx.lineTo(664, 334); ctx.lineTo(684, 352); ctx.fill();
    glow(ctx, 664, 373, 260, "#FFE2A8", .9); glow(ctx, 664, 373, 70, "#FFFFFF", .9);
    figure(ctx, "sit", 600, 556, 1.25, "#0A0F18", ["#FFD99C", 1.2]); figure(ctx, "stand", 712, 556, 1.3, "#0A0F18", ["#FFD99C", -1.2]);
    ctx.strokeStyle = css("#C8D2DC", .6); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(712, 528); ctx.quadraticCurveTo(690, 548, 662, 552); ctx.stroke();
    finish(ctx, { bloom: .38, vig: .4, vigCol: "#02060E", grain: .08 });
  };

  S[4] = (ctx) => { // 涡眼
    const N = makeNoise(504), r = rng(504), cx = 880, cy = 300;
    sky(ctx, [[0, "#9CC5E8"], [1, "#E6F1FA"]]);
    field(ctx, [0, 0, W0, H0], (X, Y) => {
      const dx = X - cx, dy = (Y - cy) * 1.75, rr = Math.sqrt(dx * dx + dy * dy) + 1, th = Math.atan2(dy, dx), u = th + 2.4 * Math.log(rr);
      const band = .5 + .5 * Math.sin(u * 3 + N.fbm(rr * .006 + Math.cos(th) * 1.3, Math.sin(th) * 1.3 + 4, 3) * 5);
      return sm(150, 330, rr) * (.38 + .55 * band) * (.55 + .7 * N.fbm(Math.cos(u) * 2 + rr * .004, Math.sin(u) * 2, 5));
    }, { th: .38, soft: .16, lit: "#FFFFFF", shade: "#87AAD0", rim: "#FFFFFF", light: [-26, -30], gain: 3.6, bottom: ["#6E92BC", 500, 900, .25] });
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 240); g.addColorStop(0, css("#6FA9DE", .9)); g.addColorStop(1, css("#9CC5E8", 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, 260, 160, 0, 0, TAU); ctx.fill();
    // 衡塔
    for (let i = 0; i < 11; i++) {
      const y = 650 - i * 44, w = 330 - i * 27, x0 = cx - w / 2, x1 = cx + w / 2;
      ctx.fillStyle = hgrad(ctx, x0, x1, [[0, "#FFFFFF"], [.45, "#EEF3F8"], [1, "#A9BCD0"]]); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1 - 10, y - 44); ctx.lineTo(x0 + 10, y - 44); ctx.fill();
      ctx.fillStyle = css("#7F97B1", .5); ctx.fillRect(x0, y - 4, w, 4);
      ctx.fillStyle = css("#5E7591", .55); for (let x = x0 + 14; x < x1 - 14; x += 16) ctx.fillRect(x, y - 30, 5, 14);
    }
    for (let i = 0; i < 9; i++) { const x = cx + R(r, -80, 80), b = 190 + R(r, 0, 40), h = R(r, 60, 150); ctx.fillStyle = hgrad(ctx, x - 6, x + 6, [[0, "#FFFFFF"], [1, "#B9C9DA"]]); ctx.beginPath(); ctx.moveTo(x - 6, b); ctx.lineTo(x, b - h); ctx.lineTo(x + 6, b); ctx.fill(); }
    ctx.fillStyle = hgrad(ctx, cx - 7, cx + 7, [[0, "#FFFFFF"], [1, "#C3D2E2"]]); ctx.beginPath(); ctx.moveTo(cx - 7, 170); ctx.lineTo(cx, 20); ctx.lineTo(cx + 7, 170); ctx.fill();
    glow(ctx, cx, 400, 260, "#FFFFFF", .25, "screen");
    // 涡城屋顶
    layer(ctx, g2 => { for (let i = 0; i < 360; i++) { const y = R(r, 646, 800), sp = 270 + (y - 646) * 2.6, x = R(r, cx - sp, cx + sp), w = R(r, 9, 22) * (1 + (y - 646) / 300); const hh = w * .5; g2.fillStyle = hgrad(g2, x, x + w, [[0, "#E2E0D8"], [1, "#A8A39A"]]); g2.fillRect(x + 1, y, w - 2, w * .45); g2.fillStyle = hgrad(g2, x, x + w, [[0, "#E07A55"], [1, "#9C4630"]]); g2.beginPath(); g2.moveTo(x - 1, y + 1); g2.lineTo(x + w / 2, y - hh); g2.lineTo(x + w + 1, y + 1); g2.fill(); } }, { fog: ["#DCEAF6", 640, 820, .55, .15] });
    stratus(ctx, N, 600, 700, { lit: "#FFFFFF", shade: "#C2D4E6", light: [-26, -20], alpha: .85 }, .003, .03);
    // 前景悬崖与骑者
    const cliff = new Path2D(); cliff.moveTo(1020, 910); cliff.lineTo(1110, 760); cliff.lineTo(1160, 718); cliff.lineTo(1610, 690); cliff.lineTo(1610, 910); cliff.closePath();
    ctx.fillStyle = vgrad(ctx, 690, 900, [[0, "#D6B57B"], [.25, "#A9824F"], [1, "#5E4630"]]); ctx.fill(cliff);
    ctx.save(); ctx.clip(cliff); rockTex(ctx, N, [1020, 690, 590, 220], "#4A3624", "#F0D9A8", .45, .025); ctx.restore();
    ctx.strokeStyle = css("#FFF0CC", .8); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(1160, 718); ctx.lineTo(1610, 690); ctx.stroke();
    figure(ctx, "rider", 1300, 708, 1.8, "#2A241F", ["#FFE9C2", -1.4]);
    finish(ctx, { bloom: .3, vig: .24 });
  };

  S[5] = (ctx) => { // 放风
    const N = makeNoise(605), r = rng(605);
    sky(ctx, [[0, "#3E8BD0"], [.5, "#8DC2EA"], [1, "#E6F3FB"]]);
    cumulus(ctx, N, 230, 330, 520, 300, 51, Object.assign({}, DAY, { light: [0, -30], bottom: ["#8FA8C9", 260, 330, .45] }));
    cumulus(ctx, N, 1400, 280, 520, 280, 52, Object.assign({}, DAY, { light: [0, -30], bottom: ["#8FA8C9", 220, 280, .45] }));
    cumulus(ctx, N, 820, 760, 900, 260, 53, Object.assign({}, DAY, { light: [0, -30] }));
    cloudSea(ctx, N, 780, DAY);
    const L = island(ctx, N, 380, 560, 470, { depth: .7 });
    ctx.fillStyle = hgrad(ctx, 300, 430, [[0, "#E8DECF"], [1, "#9C8F7E"]]); ctx.fillRect(300, 512, 130, 44); ctx.fillStyle = hgrad(ctx, 290, 440, [[0, "#9C7556"], [1, "#5C3F2C"]]); ctx.beginPath(); ctx.moveTo(288, 514); ctx.lineTo(365, 474); ctx.lineTo(442, 514); ctx.fill(); ctx.fillStyle = "#3A2C24"; ctx.fillRect(352, 530, 22, 26);
    const Rt = island(ctx, N, 1220, 500, 640, { depth: .65 });
    for (let i = 0; i < 30; i++) { const x = 940 + i * 19 + R(r, -6, 6), y = 470 - R(r, 0, 26), rr = R(r, 13, 21); ctx.fillStyle = css("#3E6B3A"); ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.fill(); ctx.fillStyle = css("#7FAE5E"); ctx.beginPath(); ctx.arc(x - rr * .25, y - rr * .3, rr * .65, 0, TAU); ctx.fill(); for (let k = 0; k < 4; k++) { ctx.fillStyle = "#F2C94C"; ctx.beginPath(); ctx.arc(x + R(r, -rr * .6, rr * .6), y + R(r, -rr * .4, rr * .6), 2.4, 0, TAU); ctx.fill(); } }
    ctx.fillStyle = "#33404F"; for (let i = 0; i < 40; i++) { const left = i < 16; const x = left ? R(r, 430, 600) : R(r, 910, 1010), y = left ? 552 : 492; figure(ctx, "stand", x, y + R(r, -2, 2), .45, "#34414F"); }
    ctx.strokeStyle = css("#7A6A5C", .9); ctx.lineWidth = 1.6; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(565, 548); ctx.bezierCurveTo(640, 470, 720, 410, 794, 356); ctx.stroke(); ctx.setLineDash([]);
    glow(ctx, 800, 320, 120, "#FFFFFF", .5, "screen");
    figure(ctx, "elf", 800, 356, 1.7, "#3B4757", ["#FFFFFF", -1]);
    ctx.strokeStyle = "#3B4757"; ctx.lineWidth = 3.4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(790, 312); ctx.lineTo(764, 292); ctx.moveTo(810, 312); ctx.lineTo(836, 292); ctx.stroke();
    ctx.fillStyle = "#E3A04C"; ctx.beginPath(); ctx.arc(796, 360, 3.5, 0, TAU); ctx.fill(); glow(ctx, 796, 360, 14, "#FFD27A", .8);
    birds(ctx, r, 5, 720, 220, 200, 70, "#FFFFFF", 11);
    finish(ctx, { bloom: .26, vig: .2 });
  };

  S[6] = (ctx) => { // 压舱人：矿道深处
    const N = makeNoise(706), r = rng(706);
    ctx.fillStyle = "#0B0908"; ctx.fillRect(0, 0, W0, H0);
    const vx = 820, vy = 400;
    const back = new Path2D(); back.moveTo(600, 200); back.lineTo(1040, 210); back.lineTo(1010, 640); back.lineTo(630, 640); back.closePath();
    { const g = ctx.createRadialGradient(vx, 430, 10, vx, 430, 300); g.addColorStop(0, "#2A4A6A"); g.addColorStop(.5, "#141A24"); g.addColorStop(1, "#0B0908"); ctx.fillStyle = g; ctx.fill(back); } glow(ctx, vx, 430, 220, "#3E86C0", .35);
    const wall = (pts, g0, g1, lit) => { const p = new Path2D(); p.moveTo(...pts[0]); pts.slice(1).forEach(q => p.lineTo(...q)); p.closePath(); ctx.fillStyle = g0; ctx.fill(p); ctx.save(); ctx.clip(p); rockTex(ctx, N, [0, 0, W0, H0], "#050403", lit, .5, .011); if (g1) { ctx.fillStyle = g1; ctx.fillRect(0, 0, W0, H0); } ctx.restore(); return p; };
    const L = wall([[0, 0], [600, 200], [630, 640], [0, 900]], hgrad(ctx, 0, 630, [[0, "#3C3027"], [1, "#1A1511"]]), null, "#9A8068");
    const Rw = wall([[1600, 0], [1040, 210], [1010, 640], [1600, 900]], hgrad(ctx, 1010, 1600, [[0, "#2A211B"], [1, "#6A4A30"]]), null, "#D8A070");
    wall([[0, 0], [1600, 0], [1040, 210], [600, 200]], vgrad(ctx, 0, 210, [[0, "#140F0C"], [1, "#2A221C"]]), null, "#7A6656");
    const F = wall([[0, 900], [630, 640], [1010, 640], [1600, 900]], vgrad(ctx, 640, 900, [[0, "#2E2620"], [1, "#4A3A2E"]]), null, "#B0947A");
    { const g = ctx.createRadialGradient(vx, 430, 120, vx, 430, 420); g.addColorStop(0, "rgba(11,9,8,0)"); g.addColorStop(.55, "rgba(11,9,8,.35)"); g.addColorStop(1, "rgba(11,9,8,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W0, H0); }
    ctx.strokeStyle = css("#5A4636", .4); ctx.lineWidth = 1.2; for (let k = 1; k < 9; k++) { const t = k / 9; ctx.beginPath(); ctx.moveTo(630 - t * 630, 640 + t * 260); ctx.lineTo(1010 + t * 590, 640 + t * 260); ctx.stroke(); }
    function cluster(x, y, s, bright, ang) { for (let i = 0; i < 7; i++) { const a = ang + R(r, -.7, .7), l = s * R(r, .5, 1.2), w = l * .28; ctx.save(); ctx.translate(x + R(r, -s * .3, s * .3), y + R(r, -s * .2, s * .2)); ctx.rotate(a); const p = new Path2D(); p.moveTo(0, -w / 2); p.lineTo(l * .8, -w / 2); p.lineTo(l, 0); p.lineTo(l * .8, w / 2); p.lineTo(0, w / 2); p.closePath(); ctx.fillStyle = hgrad(ctx, 0, l, [[0, bright ? "#2E6E9E" : "#1E3446"], [.7, bright ? "#9FE0FF" : "#4E6E86"], [1, bright ? "#E6FAFF" : "#7A92A6"]]); ctx.globalAlpha = bright ? .95 : .7; ctx.fill(p); ctx.restore(); } if (bright) glow(ctx, x, y, s * 2.2, "#6FC8F8", .45); }
    [[1180, 120, 46, 1, 2.4], [1320, 260, 38, 0, 2.8], [1460, 520, 52, 1, 3.4], [1120, 560, 30, 0, 3.6], [980, 240, 26, 1, 2.2], [700, 230, 24, 0, .9], [420, 90, 40, 0, .6], [1240, 760, 36, 0, -1.8], [880, 640, 22, 1, -1.5]].forEach(c => cluster(...c));
    ctx.save(); ctx.transform(1, .16, 0, 1, 0, 0);
    for (let i = 0; i < 42; i++) { const col = i % 7, row = Math.floor(i / 7), x = 110 + col * 58 + R(r, -5, 5), y = 150 + row * 74 - col * 4 + R(r, -5, 5), a = R(r, -.06, .06); ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = css("#000000", .35); ctx.fillRect(-19, -24, 40, 52); ctx.fillStyle = vgrad(ctx, -26, 26, [[0, "#E8DCC0"], [1, "#B7A684"]]); ctx.fillRect(-21, -26, 40, 52); ctx.strokeStyle = css("#4A3C2E", .65); ctx.lineWidth = 1.2; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-15, -18 + k * 7); ctx.lineTo(R(r, 0, 13), -18 + k * 7); ctx.stroke(); } ctx.fillStyle = "#6A4A30"; ctx.beginPath(); ctx.arc(-1, -23, 2, 0, TAU); ctx.fill(); ctx.restore(); }
    ctx.restore();
    ctx.save(); ctx.fillStyle = css("#000", .35); ctx.fill(L); ctx.restore();
    glow(ctx, 1250, 470, 520, "#FF9A48", .42, "screen"); glow(ctx, 1250, 470, 40, "#FFE2A8", .9);
    ctx.fillStyle = "#2A1A10"; ctx.fillRect(1244, 476, 12, 60); ctx.fillStyle = "#FFB45A"; ctx.beginPath(); ctx.moveTo(1240, 476); ctx.quadraticCurveTo(1250, 440, 1256, 456); ctx.quadraticCurveTo(1262, 468, 1260, 476); ctx.fill();
    ctx.save(); ctx.translate(820, 400); ctx.rotate(-.05);
    { const side = new Path2D(); side.moveTo(-216, 46); side.lineTo(236, 28); side.lineTo(236, 70); side.lineTo(-216, 92); side.closePath(); ctx.fillStyle = vgrad(ctx, 28, 92, [[0, "#3A302A"], [1, "#16110E"]]); ctx.fill(side); ctx.save(); ctx.clip(side); rockTex(ctx, N, [-230, 20, 480, 80], "#0A0807", "#8A7868", .5, .05); ctx.restore(); }
    const slab = new Path2D(); slab.moveTo(-230, -16); slab.lineTo(220, -30); slab.lineTo(236, 28); slab.lineTo(-216, 46); slab.closePath();
    ctx.fillStyle = vgrad(ctx, -30, 46, [[0, "#7A6E64"], [1, "#2A221E"]]); ctx.fill(slab); ctx.save(); ctx.clip(slab); rockTex(ctx, N, [-240, -40, 480, 90], "#1A1512", "#B8A898", .5, .04); ctx.restore();
    ctx.fillStyle = vgrad(ctx, 70, 96, [[0, "#8FD6FF", .0], [1, "#8FD6FF", .6]]); ctx.beginPath(); ctx.moveTo(-216, 86); ctx.lineTo(236, 66); ctx.lineTo(236, 74); ctx.lineTo(-216, 96); ctx.fill();
    ctx.restore(); glow(ctx, 820, 450, 200, "#8FD6FF", .3);
    motes(ctx, r, 160, 560, 440, 520, 260, "#E6D6BE", 1.6, 0);
    for (let i = 0; i < 4; i++) figure(ctx, "stout", 650 + i * 46, 690 + i * 4, 1.1, "#1E1714", ["#FF9A48", 1.2]);
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = vgrad(ctx, 120, 680, [[0, "#9FE6FF", 0], [1, "#9FE6FF", .6]]); ctx.fillRect(813, 120, 5, 560); ctx.restore(); glow(ctx, 815, 640, 60, "#BFF0FF", .6);
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = vgrad(ctx, 760, 900, [[0, "#9FE6FF", .5], [1, "#9FE6FF", 0]]); ctx.fillRect(868, 760, 4, 140); ctx.restore();
    figure(ctx, "elf", 815, 770, 3, "#C9D6E2", ["#FFFFFF", -1.2]);
    ctx.strokeStyle = "#C9D6E2"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(825, 700); ctx.lineTo(852, 652); ctx.stroke();
    ctx.fillStyle = "#E39A4C"; ctx.beginPath(); ctx.arc(788, 712, 8, 0, TAU); ctx.fill(); glow(ctx, 788, 712, 34, "#FFC87A", .7);
    figure(ctx, "stout", 870, 790, 3.1, "#4A4E56", ["#FFB46E", 1.6]);
    ctx.strokeStyle = "#4A4E56"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(850, 728); ctx.lineTo(826, 702); ctx.moveTo(890, 728); ctx.lineTo(840, 704); ctx.stroke();
    finish(ctx, { bloom: .38, vig: .55, vigCol: "#000000", grain: .09 });
  };

  S[7] = (ctx) => { // 白衣：白岛崖沿的铁环
    const N = makeNoise(807), r = rng(807);
    sky(ctx, [[0, "#8FA5BA"], [.42, "#CBD5DE"], [1, "#ECEEEF"]]);
    glow(ctx, 480, 190, 420, "#FFFFFF", .8, "screen"); glow(ctx, 480, 190, 70, "#FFFFFF", .9, "screen");
    stratus(ctx, N, 20, 320, { lit: "#FBFBFA", shade: "#A3B1C0", rim: "#FFFFFF", light: [-34, -10], alpha: .9 });
    layer(ctx, g => city(g, 8071, -40, 820, 1000, 60, 160, 10, 20, { wallLit: "#BDB3AA", wall: "#9E938A", wallShade: "#6E6560", roofLit: "#A88676", roof: "#86695A", roofShade: "#5A4538", win: "#4A4440" }, 50), { fog: ["#DCE2E7", 700, 1000, .78, .5], blur: 3 });
    stratus(ctx, N, 600, 900, { lit: "#FFFFFF", shade: "#C3CDD6", light: [-34, -20], alpha: .95 }, .0022, .011);
    const edge = X => 640 - (X - 120) * .2 + (N.fbm(X * .012, 4, 3) - .5) * 16;
    const cliff = new Path2D(); cliff.moveTo(120, edge(120)); for (let X = 120; X <= 1624; X += 6) cliff.lineTo(X, edge(X));
    cliff.lineTo(1624, 910); cliff.lineTo(980, 910); cliff.bezierCurveTo(700, 860, 380, 760, 120, edge(120)); cliff.closePath();
    ctx.fillStyle = vgrad(ctx, 300, 910, [[0, "#F7F6F2"], [.35, "#D9D7D0"], [.75, "#A6A49D"], [1, "#77756F"]]); ctx.fill(cliff);
    ctx.save(); ctx.clip(cliff);
    ctx.fillStyle = hgrad(ctx, 120, 1620, [[0, "#FFFFFF", .25], [1, "#5E5C58", .25]]); ctx.fillRect(100, 300, 1540, 620);
    rockTex(ctx, N, [100, 300, 1540, 620], "#6E6C66", "#FFFFFF", .42, .012);
    ctx.lineWidth = 1.2;
    for (let k = 1; k < 14; k++) { ctx.strokeStyle = css(k % 3 ? "#8C8A84" : "#FFFFFF", k % 3 ? .35 : .45); ctx.beginPath(); for (let X = 120; X <= 1624; X += 10) { const Y = edge(X) + k * 22 + (N.fbm(X * .008, k, 3) - .5) * 14; X === 120 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); } ctx.stroke(); }
    ctx.strokeStyle = css("#6A6863", .45); for (let i = 0; i < 26; i++) { const x = R(r, 300, 1600), y = edge(x) + R(r, 10, 60); ctx.lineWidth = R(r, .8, 2); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + R(r, -14, 14), y + R(r, 60, 220)); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = css("#FFFFFF", .95); ctx.lineWidth = 3; ctx.beginPath(); for (let X = 120; X <= 1624; X += 6) { X === 120 ? ctx.moveTo(X, edge(X)) : ctx.lineTo(X, edge(X)); } ctx.stroke();
    for (let i = 0; i < 15; i++) {
      const t = i / 14, X = 250 + t * 1300, sc = .65 + t * 1.15, Y = edge(X), lift = i === 9 ? 190 * sc : 0;
      ctx.strokeStyle = "#3D4249"; ctx.lineWidth = 2.4 * sc; ctx.beginPath(); ctx.arc(X, Y + 7 * sc, 5 * sc, 0, TAU); ctx.stroke();
      const fx = X + 16 * sc, fy = Y - lift;
      ctx.strokeStyle = css("#5A6068", .95); ctx.lineWidth = 1.3 * sc; ctx.beginPath(); ctx.moveTo(X, Y + 2 * sc);
      if (lift) ctx.lineTo(fx, fy - 16 * sc); else ctx.quadraticCurveTo(X + 6 * sc, Y - 2 * sc, fx, fy - 16 * sc); ctx.stroke();
      if (!lift) { ctx.fillStyle = css("#5E5C58", .25); ctx.beginPath(); ctx.ellipse(fx + 6 * sc, Y + 1, 9 * sc, 2.4 * sc, 0, 0, TAU); ctx.fill(); }
      ctx.save(); if (lift) { ctx.translate(fx, fy); ctx.rotate(.18); ctx.translate(-fx, -fy); glow(ctx, fx, fy - 18 * sc, 60 * sc, "#FFFFFF", .55, "screen"); }
      figure(ctx, "stand", fx + 2 * sc, fy + 1, 1.7 * sc, "#8A9097");
      figure(ctx, "stand", fx, fy, 1.7 * sc, "#FCFCFA", ["#AEB6BF", 1.8]);
      ctx.fillStyle = css("#D4D9DE", .9); ctx.fillRect(fx - 9 * sc, fy - 34 * sc, 2.4 * sc, 30 * sc);
      ctx.restore();
    }
    const bx = 560, by = 760;
    ctx.fillStyle = vgrad(ctx, by - 120, by, [[0, "#C8833F", 0], [1, "#C8833F", .35]]); ctx.fillRect(bx + 3, by - 120, 6, 120);
    ctx.fillStyle = hgrad(ctx, bx, bx + 14, [[0, "#E7A660"], [1, "#8E5A2A"]]); ctx.fillRect(bx, by, 13, 11);
    finish(ctx, { bloom: .26, vig: .3, vigCol: "#2A323C", grain: .06 });
  };

  S[8] = (ctx) => { // 栖霞：坠落
    const N = makeNoise(908), r = rng(908);
    sky(ctx, [[0, "#3F4A7A"], [.4, "#B66E7C"], [.66, "#EE9A5E"], [1, "#F8CE92"]]);
    glow(ctx, 1150, 520, 520, "#FFD08A", .6, "screen");
    cumulus(ctx, N, 1240, 360, 760, 360, 81, { lit: "#FFD8AE", shade: "#7E6589", rim: "#FFE2B8", light: [-30, 14], bottom: ["#5E4C70", 280, 360, .5] });
    ctx.save(); ctx.translate(520, 500); ctx.rotate(.15); ctx.translate(-520, -500);
    island(ctx, N, 520, 500, 780, { grass: "#9E8B5A", grassLit: "#E8C98E", rock: "#7A5A48", rockLit: "#D19A72", rockShade: "#3A2A30", deep: "#1E1520" });
    city(ctx, 9081, 240, 800, 500, 40, 120, 13, 22, { wallLit: "#F2DCC2", wall: "#D6B89A", wallShade: "#8E6C5C", roofLit: "#E98A5E", roof: "#B85A3E", roofShade: "#6E3024", win: "#5A3A34", winLit: "#FFD38A", litWin: .25 }, 10);
    ctx.restore();
    for (let i = 0; i < 40; i++) { const x = R(r, 150, 900), y = R(r, 560, 880), w = R(r, 8, 46); ctx.save(); ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = vgrad(ctx, y - w * 3, y, [[0, "#C9A48A", 0], [1, "#C9A48A", .35]]); ctx.fillRect(x + w * .2, y - w * 3, w * .6, w * 3); ctx.restore(); ctx.fillStyle = hgrad(ctx, x, x + w, [[0, "#9C7258"], [1, "#3A2A26"]]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + R(r, -6, 6)); ctx.lineTo(x + w * .7, y + w * .8); ctx.lineTo(x + w * .1, y + w * .6); ctx.fill(); }
    cloudSea(ctx, N, 770, { lit: "#FFE4C6", shade: "#B48A8E", rim: "#FFF0DA", light: [-30, -20] });
    ctx.save(); ctx.translate(1180, 760); ctx.rotate(Math.PI - .35);
    ctx.fillStyle = hgrad(ctx, -80, 80, [[0, "#5A4436"], [1, "#22191A"]]); ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(80, 0); ctx.quadraticCurveTo(64, 28, 30, 30); ctx.lineTo(-56, 30); ctx.quadraticCurveTo(-78, 22, -80, 0); ctx.fill();
    ctx.fillStyle = "#EADCC6"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -100); ctx.quadraticCurveTo(36, -56, 46, -4); ctx.fill(); ctx.restore();
    field(ctx, [1040, 720, 300, 140], (X, Y) => N.fbm(X * .02, Y * .03, 4) * sm(860, 770, Y) * 1.3, { th: .45, soft: .2, lit: "#FFE8CE", shade: "#C29A9A", light: [-20, -20] });
    ctx.save(); ctx.translate(1340, 250); ctx.rotate(-.3); ctx.fillStyle = "#F7F5F0"; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.lineTo(24, 11); ctx.lineTo(-24, 11); ctx.fill(); ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -54); ctx.lineTo(26, -8); ctx.fill(); ctx.restore();
    glow(ctx, 1196, 600, 40, "#FFFFFF", .5); birds(ctx, rng(5), 1, 1180, 600, 10, 10, "#FFFFFF", 24);
    finish(ctx, { bloom: .32, vig: .34, vigCol: "#1E1028" });
  };

  S[9] = (ctx) => { // 会合节
    const N = makeNoise(1009), r = rng(1009);
    sky(ctx, [[0, "#141E42"], [.5, "#3E3F70"], [.75, "#9C6A7C"], [1, "#E8A46E"]]);
    stars(ctx, r, 260, 420);
    cloudSea(ctx, N, 700, { lit: "#6E86C0", shade: "#1D2A52", rim: "#A8C4F2", light: [-40, -20], bottom: ["#0E1530", 780, 900, .5] });
    motes(ctx, r, 200, 0, 680, W0, 220, "#8FC9F2", 2.2, .5);
    const isl = [[980, 420, 70], [1080, 384, 92], [1190, 352, 0], [1300, 362, 112], [1420, 402, 84], [1525, 452, 62]];
    isl.forEach(([x, y, w]) => { if (w) island(ctx, N, x, y, w, { grass: "#2E3E58", grassLit: "#55709A", soil: "#1A2234", rock: "#2A3046", rockLit: "#4E5878", rockShade: "#0E1220", deep: "#05070E" }); });
    const cliff = new Path2D(); cliff.moveTo(-10, 910); cliff.lineTo(-10, 520); cliff.lineTo(470, 540); cliff.bezierCurveTo(500, 640, 510, 760, 540, 910); cliff.closePath(); ctx.fillStyle = hgrad(ctx, 0, 540, [[0, "#141826"], [1, "#2A2E44"]]); ctx.fill(cliff);
    city(ctx, 10091, -10, 470, 545, 70, 230, 18, 30, { wallLit: "#3A3E58", wall: "#272A40", wallShade: "#16182A", roofLit: "#5A4250", roof: "#3A2C36", roofShade: "#1E1620", win: "#1A1622", winLit: "#FFC67E", litWin: .5 }, 8);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    isl.forEach(([x, y, w], i) => {
      if (w) for (let k = 0; k < 10; k++) { const lx = x + R(r, -w / 2.4, w / 2.4), ly = y - R(r, 2, 12); ctx.fillStyle = css("#FFD08A", .95); ctx.beginPath(); ctx.arc(lx, ly, 2, 0, TAU); ctx.fill(); glow(ctx, lx, ly, 10, "#FFB866", .5); }
      if (w && i < 5) {
        const sx = 470, sy = 560 - i * 16, mx = (sx + x) / 2, my = y - 130, ex = x - w / 2, ey = y;
        ctx.lineCap = "round";
        [[14, .08], [6, .22], [2.4, .9]].forEach(([lw, a]) => { ctx.strokeStyle = css("#F6EEDB", a); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke(); });
        for (let k = 1; k < 16; k++) { const t = k / 16, bx = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * mx + t * t * ex, by = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * my + t * t * ey; ctx.fillStyle = css("#FFB15E", 1); ctx.beginPath(); ctx.arc(bx, by - 6, 2.6, 0, TAU); ctx.fill(); glow(ctx, bx, by - 6, 16, "#FFA24E", .55); }
      }
    });
    ctx.restore();
    ctx.strokeStyle = css("#FFD08A", .25); ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.ellipse(1190, 352, 54, 9, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    motes(ctx, r, 160, 0, 320, 470, 240, "#FFC27A", 2.2, .5);
    finish(ctx, { bloom: .4, vig: .38, vigCol: "#05081A" });
  };

  S[10] = (ctx) => { // 听风台
    const N = makeNoise(1110), r = rng(1110);
    sky(ctx, [[0, "#081428"], [1, "#22406A"]]);
    stars(ctx, r, 300, 520);
    field(ctx, [780, -20, 860, 940], (X, Y) => sm(820, 1060, X + (N.fbm(Y * .006, 3, 4) - .5) * 160) * (.5 + .7 * N.fbm(X * .004 - Y * .002, Y * .012 + X * .003, 6)), { th: .45, soft: .14, lit: "#D3E1EE", shade: "#2E4A6E", rim: "#FFFFFF", light: [-34, -6], gain: 4 });
    ctx.fillStyle = vgrad(ctx, 200, 700, [[0, "#050A14", 0], [.5, "#050A14", .9], [1, "#050A14", 0]]); ctx.fillRect(1078, 200, 10, 500);
    for (let i = 1; i < 8; i++) { ctx.strokeStyle = css("#9FD0F2", .55 - i * .06); ctx.lineWidth = 1.4; ctx.setLineDash([6, 9]); ctx.beginPath(); ctx.ellipse(700, 980, i * 110, i * 44, 0, Math.PI, TAU); ctx.stroke(); } ctx.setLineDash([]);
    island(ctx, N, 560, 700, 440, { grass: "#2F3C50", grassLit: "#6A82A6", soil: "#1A2230", rock: "#2C3446", rockLit: "#5A6886", rockShade: "#0C1018", deep: "#05070C" });
    const t = new Path2D(); t.rect(470, 250, 180, 450); ctx.fillStyle = hgrad(ctx, 470, 650, [[0, "#9AA4B4"], [.35, "#6E7888"], [1, "#2E3442"]]); ctx.fill(t);
    ctx.save(); ctx.clip(t); rockTex(ctx, N, [470, 250, 180, 450], "#1A1E28", "#C9D2DE", .38, .03); ctx.strokeStyle = css("#1E2430", .45); for (let y = 270; y < 700; y += 20) { ctx.beginPath(); ctx.moveTo(470, y); ctx.lineTo(650, y); ctx.stroke(); } ctx.restore();
    ctx.fillStyle = hgrad(ctx, 456, 664, [[0, "#B5BDC9"], [1, "#4A5262"]]); ctx.fillRect(456, 230, 208, 24);
    for (let i = 0; i < 14; i++) { const x = 486 + (i % 7) * 24, y = 280 + Math.floor(i / 7) * 34, rr = i % 3 ? 5 : 8; ctx.fillStyle = "#070B12"; ctx.beginPath(); ctx.ellipse(x, y, rr, rr * 1.3, 0, 0, TAU); ctx.fill(); }
    glow(ctx, 560, 226, 120, "#FFD9A0", .25);
    figure(ctx, "sit", 560, 230, 1.3, "#0A0F18", ["#9FC8EA", 1.2]);
    birds(ctx, rng(4), 1, 920, 320, 10, 10, "#FFFFFF", 22); glow(ctx, 930, 316, 40, "#FFFFFF", .3);
    motes(ctx, r, 90, 0, 480, W0, 420, "#7FC4F0", 1.8, .4);
    finish(ctx, { bloom: .34, vig: .45, vigCol: "#020610" });
  };

  S[11] = (ctx) => { // 鲸歌：被吸走的萤潮
    const N = makeNoise(1211), r = rng(1211), cx = 800, cy = 340;
    sky(ctx, [[0, "#010205"], [.5, "#081830"], [1, "#163E68"]]);
    stars(ctx, r, 220, 520);
    field(ctx, [0, 0, W0, 640], (X, Y) => { const dx = X - cx, dy = (Y - cy) * 2.3, rr = Math.hypot(dx, dy) + 1, th = Math.atan2(dy, dx), u = th + 1.9 * Math.log(rr); return (.5 + .5 * Math.cos(u * 2)) * sm(760, 60, rr) * (.45 + .8 * N.fbm(Math.cos(th) * 2 + rr * .006, Math.sin(th) * 2, 5)); },
      { th: .2, soft: .45, lit: "#86D8FF", shade: "#14345E", light: [0, 0], alpha: .6, op: "lighter" });
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let k = 0; k < 4; k++) for (let i = 0; i < 700; i++) {
      const t = i / 700, rr = 30 + Math.pow(t, 1.1) * 950, th = k * Math.PI / 2 - 1.9 * Math.log(rr) + R(r, -.18, .18) * (1 + t);
      const x = cx + rr * Math.cos(th), y = cy + rr * Math.sin(th) / 2.3 + R(r, -6, 6);
      if (y > 640) continue;
      const s = R(r, .5, 2.2) * (1.2 - t * .6); ctx.fillStyle = css("#B8ECFF", (1 - t) * R(r, .4, 1)); ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
    }
    ctx.restore(); glow(ctx, cx, cy, 300, "#7FD4FF", .45); glow(ctx, cx, cy, 60, "#E6FAFF", .9);
    cloudSea(ctx, N, 600, { lit: "#4E8CC8", shade: "#0A1D36", rim: "#A6E0FF", light: [0, -34], bottom: ["#04101E", 740, 900, .55] });
    motes(ctx, r, 260, 0, 590, W0, 260, "#9FE0FF", 2.2, .45);
    function whale(x, y, w, fog) {
      const h = w * .2, p = new Path2D(); p.moveTo(x, y + 2); p.bezierCurveTo(x + w * .15, y - h * .9, x + w * .5, y - h * 1.15, x + w * .72, y - h * .7); p.bezierCurveTo(x + w * .85, y - h * .4, x + w * .95, y - h * .1, x + w, y + 2); p.closePath();
      ctx.fillStyle = vgrad(ctx, y - h * 1.1, y, [[0, mixc("#1B3A5C", "#3E6E9E", fog)], [1, mixc("#050C16", "#2E5884", fog)]]); ctx.fill(p);
      ctx.save(); ctx.clip(p); rockTex(ctx, N, [x, y - h * 1.2, w, h * 1.3], "#02060C", "#5E8FB8", .3 * (1 - fog), .03);
      for (let i = 0; i < 26; i++) { const sx = x + R(r, .12, .88) * w, sy = y - R(r, .1, .7) * h; ctx.fillStyle = css("#8FA6B8", .55); ctx.beginPath(); ctx.arc(sx, sy, R(r, .8, 2.4) * w / 400, 0, TAU); ctx.fill(); }
      ctx.restore();
      ctx.strokeStyle = css("#9FE0FF", .7 * (1 - fog * .6)); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + w * .08, y - h * .35); ctx.bezierCurveTo(x + w * .22, y - h * .95, x + w * .5, y - h * 1.12, x + w * .7, y - h * .72); ctx.stroke();
      for (let i = 0; i < 9; i++) { const t = .2 + i * .065; glow(ctx, x + w * t, y - h * (.55 + Math.sin(t * Math.PI) * .25), 7 + w / 90, "#A8EEFF", .8 * (1 - fog * .5)); }
      glow(ctx, x + w * .5, y + 2, w * .55, "#B8E8FF", .12, "screen");
    }
    whale(1080, 690, 300, .55); whale(120, 700, 260, .45); whale(560, 720, 480, .15);
    ctx.fillStyle = "#06101C"; ctx.beginPath(); ctx.moveTo(1380, 700); ctx.bezierCurveTo(1395, 650, 1410, 610, 1400, 590); ctx.bezierCurveTo(1440, 600, 1490, 590, 1520, 560); ctx.bezierCurveTo(1500, 600, 1450, 625, 1418, 628); ctx.bezierCurveTo(1415, 650, 1405, 680, 1400, 702); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = css("#9FE0FF", .6); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(1400, 590); ctx.bezierCurveTo(1440, 600, 1490, 590, 1520, 560); ctx.stroke();
    const crest = X => 840 - Math.sin(X / 1600 * Math.PI) * 150 - (N.fbm(X * .008, 2, 4) - .5) * 50;
    const rp = new Path2D(); rp.moveTo(-10, 910); for (let X = -10; X <= 1610; X += 6) rp.lineTo(X, crest(X)); rp.lineTo(1610, 910); rp.closePath();
    ctx.fillStyle = vgrad(ctx, 680, 910, [[0, "#13202E"], [1, "#020408"]]); ctx.fill(rp);
    ctx.save(); ctx.clip(rp); rockTex(ctx, N, [-10, 680, 1620, 230], "#000000", "#3E5A76", .45, .016); ctx.restore();
    ctx.strokeStyle = css("#8FD6FF", .55); ctx.lineWidth = 2.2; ctx.beginPath(); for (let X = -10; X <= 1610; X += 6) X === -10 ? ctx.moveTo(X, crest(X)) : ctx.lineTo(X, crest(X)); ctx.stroke();
    for (let i = 0; i < 420; i++) {
      const x = R(r, 0, 1600), base = crest(x) + 6, far = (crest(x) - 690) / 160, h = R(r, 40, 170) * (1 - far * .3), lean = R(r, -26, 26), bend = R(r, -8, 8), rust = r() < .16;
      ctx.strokeStyle = rust ? "#3A2418" : "#0A1018"; ctx.lineWidth = R(r, 1.4, 3.6);
      ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + lean * .5 + bend, base - h * .5, x + lean, base - h); ctx.stroke();
      ctx.fillStyle = rust ? "#4A2C1C" : "#0E151F"; ctx.beginPath(); ctx.moveTo(x + lean - 5, base - h + 12); ctx.lineTo(x + lean, base - h - 8); ctx.lineTo(x + lean + 5, base - h + 12); ctx.lineTo(x + lean, base - h + 6); ctx.fill();
      if (r() < .18) { ctx.strokeStyle = css("#2A3A4C", .8); ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x + lean * .8, base - h * .8); ctx.bezierCurveTo(x + lean + 20, base - h * .5, x + lean + 10, base - h * .2, x + lean + R(r, 0, 30), base); ctx.stroke(); }
      if (r() < .3) { ctx.strokeStyle = css("#8FD6FF", .35); ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x + lean * .6, base - h * .6); ctx.lineTo(x + lean, base - h); ctx.stroke(); }
    }
    ctx.save(); ctx.translate(250, 628); ctx.fillStyle = "#050A12"; ctx.beginPath(); ctx.moveTo(-52, 0); ctx.lineTo(52, 0); ctx.lineTo(36, 17); ctx.lineTo(-36, 17); ctx.fill(); ctx.fillRect(-1.6, -58, 3.2, 58); ctx.restore();
    glow(ctx, 268, 616, 90, "#FFE4A8", .8); glow(ctx, 268, 616, 14, "#FFFFFF", .95); glow(ctx, 268, 660, 70, "#FFD48A", .25, "screen");
    finish(ctx, { bloom: .46, vig: .5, vigCol: "#000000", grain: .08 });
  };

  S[12] = (ctx) => { // 忆雨
    const N = makeNoise(1312), r = rng(1312);
    sky(ctx, [[0, "#6A93C2"], [1, "#A9C6E2"]]);
    field(ctx, [0, -20, W0, 440], (X, Y) => { const hole = Math.hypot((X - 800) / 300, (Y - 80) / 90) + (N.fbm(X * .01, Y * .02, 4) - .5) * .9; return (.75 + .45 * N.fbm(X * .004, Y * .012, 6)) * sm(.8, 1.4, hole) * sm(420, 250, Y); }, { th: .45, soft: .12, lit: "#9EA6AE", shade: "#454C55", rim: "#C9D2DA", light: [0, 26], gain: 3.5, bottom: ["#3A4048", 220, 400, .45] });
    ctx.fillStyle = vgrad(ctx, 300, 900, [[0, "#7E8A93", 0], [.12, "#8B969E", .85], [.5, "#B3BEB9", .55], [1, "#C9D2C6", 0]]); ctx.fillRect(0, 300, W0, 600);
    // 倒插的山
    const m = new Path2D(); m.moveTo(560, 120); for (let X = 560; X <= 1040; X += 10) m.lineTo(X, 110 - (N.fbm(X * .02, 1, 3) - .5) * 30); for (let k = 0; k <= 40; k++) { const t2 = k / 40, xx = 1040 + (802 - 1040) * t2, yy = 120 + (670 - 120) * Math.pow(t2, .9); m.lineTo(xx + (N.fbm(t2 * 9, 7, 4) - .5) * 70 * (1 - t2 * .7), yy); } for (let k = 0; k <= 40; k++) { const t2 = k / 40, xx = 802 + (560 - 802) * t2, yy = 670 + (120 - 670) * (1 - Math.pow(1 - t2, 1.1)); m.lineTo(xx + (N.fbm(t2 * 9, 3, 4) - .5) * 70 * (.3 + t2 * .7), yy); } m.closePath();
    ctx.fillStyle = hgrad(ctx, 560, 1040, [[0, "#6E6A64"], [.45, "#4A4744"], [1, "#22201F"]]); ctx.fill(m);
    ctx.save(); ctx.clip(m); rockTex(ctx, N, [560, 100, 480, 580], "#121110", "#A39C92", .5, .018);
    for (let i = 0; i < 46; i++) { const t = R(r, .08, .85), x = 800 + R(r, -1, 1) * (1 - t) * 230, y = 130 + t * 500; ctx.fillStyle = "#0B0A0A"; ctx.beginPath(); ctx.ellipse(x, y, R(r, 4, 10), R(r, 3, 7), 0, 0, TAU); ctx.fill(); }
    ctx.restore();
    for (let i = 0; i < 70; i++) { const x = R(r, 520, 1080), y = R(r, 160, 640), s2 = R(r, 2, 12); ctx.fillStyle = css("#3A3734", R(r, .5, .95)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s2, y + s2 * .3); ctx.lineTo(x + s2 * .6, y + s2); ctx.closePath(); ctx.fill(); }
    glow(ctx, 802, 650, 180, "#8FDCFF", .7); glow(ctx, 802, 660, 40, "#FFFFFF", .8);
    // 山谷
    layer(ctx, g => { ridge(g, N, { y: 690, amp: 140, f: .003, grad: [[0, "#7FA081"], [1, "#4D6A4B"]], off: 3 }); }, { fog: ["#C2CCC4", 560, 780, .6, .2] });
    const vg = ctx.createRadialGradient(820, 780, 20, 820, 780, 420); vg.addColorStop(0, css("#C8F28E", .85)); vg.addColorStop(1, css("#6FA65A", 0));
    ridge(ctx, N, { y: 780, amp: 90, f: .004, grad: [[0, "#5E8E4E"], [1, "#2F4E2B"]], off: 7, tex: ["#1E3420", "#9CC27E", .25, .02] });
    ctx.fillStyle = vg; ctx.fillRect(400, 640, 840, 260);
    ctx.strokeStyle = css("#B9D8E6", .7); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1600, 820); ctx.bezierCurveTo(1300, 860, 1060, 800, 900, 850); ctx.stroke();
    const hill = new Path2D(); hill.moveTo(-10, 910); hill.lineTo(-10, 600); hill.bezierCurveTo(120, 560, 220, 540, 300, 556); hill.bezierCurveTo(370, 572, 430, 660, 480, 910); hill.closePath(); ctx.fillStyle = vgrad(ctx, 540, 900, [[0, "#4E7A44"], [1, "#203820"]]); ctx.fill(hill); ctx.save(); ctx.clip(hill); rockTex(ctx, N, [-10, 540, 490, 370], "#142414", "#8CB872", .25, .02); ctx.restore();
    const tw = new Path2D(); tw.moveTo(208, 560); tw.lineTo(212, 446); tw.lineTo(226, 440); tw.lineTo(240, 452); tw.lineTo(256, 438); tw.lineTo(276, 446); tw.lineTo(280, 560); tw.closePath(); ctx.fillStyle = hgrad(ctx, 208, 280, [[0, "#A59D90"], [1, "#4E4840"]]); ctx.fill(tw); ctx.save(); ctx.clip(tw); rockTex(ctx, N, [200, 430, 90, 140], "#2A2622", "#E2DACB", .45, .05); ctx.restore();
    figure(ctx, "stand", 236, 440, .85, "#1E2A20", ["#E6F2DE", -1]);
    ctx.strokeStyle = "#5B4A3A"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(262, 440); ctx.lineTo(262, 414); ctx.stroke(); [[262, 412], [267, 416], [258, 416]].forEach(([x, y]) => { ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill(); });
    ctx.lineCap = "round";
    for (let i = 0; i < 900; i++) { const x = R(r, -100, 1650), y = R(r, 150, 900), l = R(r, 14, 34), gold = i % 41 === 0; ctx.strokeStyle = gold ? css("#FFC879", .95) : css("#DDE7EE", R(r, .18, .45)); ctx.lineWidth = gold ? 2.2 : 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - l * .2, y + l); ctx.stroke(); if (gold) glow(ctx, x - l * .1, y + l * .5, 16, "#FFC879", .6); }
    finish(ctx, { bloom: .3, vig: .3, vigCol: "#1A2228" });
  };

  /* ------------------------------------------------ 绘制调度：按需、可见时才画、画过的缓存起来 */
  const cache = new Map();
  function render(n, w) {
    const key = n + "@" + w; if (cache.has(key)) return cache.get(key);
    const c = newCanvas(w, Math.round(w * H0 / W0)), ctx = c.getContext("2d");
    ctx.setTransform(w / W0, 0, 0, w / W0, 0, 0);
    try { S[n](ctx); } catch (e) { console.error("插画绘制出错", n, e); }
    cache.set(key, c); return c;
  }
  const queue = []; let busy = false;
  function pump() {
    if (busy || !queue.length) return; busy = true;
    const el = queue.shift();
    setTimeout(() => {
      if (el.isConnected && !el.dataset.done) {
        const want = Math.min(1600, Math.max(400, Math.ceil(el.getBoundingClientRect().width * Math.min(2, window.devicePixelRatio || 1))));
        const w = want > 1100 ? 1600 : want > 700 ? 1000 : 640;
        const src = render(+el.dataset.n, w);
        el.width = src.width; el.height = src.height; el.getContext("2d").drawImage(src, 0, 0); el.dataset.done = "1"; el.classList.add("painted");
      }
      busy = false; pump();
    }, 16);
  }
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); queue.push(e.target); pump(); } }), { rootMargin: "300px" }) : null;
  function mount(root = document) { root.querySelectorAll("canvas.art:not([data-seen])").forEach(c => { c.dataset.seen = "1"; if (io) io.observe(c); else { queue.push(c); pump(); } }); }
  new MutationObserver(() => mount()).observe(document.documentElement, { childList: true, subtree: true });

  function scene(n) {
    const t = typeof STORIES !== "undefined" && STORIES[n] ? STORIES[n].title : "";
    return `<canvas class="art" data-n="${n}" width="160" height="90" role="img" aria-label="${t}插画"></canvas>`;
  }

  /* 人物印章（不变） */
  function seal(name, race) {
    const c = RACE[race] || RACE["垣民"], ch = name[0];
    return `<svg viewBox="0 0 96 96" role="img" aria-label="${name}"><circle cx="48" cy="48" r="46" fill="${c.c}"/><circle cx="48" cy="48" r="40" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/>
      <text x="48" y="52" text-anchor="middle" dominant-baseline="middle" font-family="Kaiti SC,STKaiti,KaiTi,serif" font-size="46" fill="#fff">${ch}</text>
      <text x="48" y="84" text-anchor="middle" font-family="Songti SC,serif" font-size="10" fill="#fff" opacity=".9">${race}</text></svg>`;
  }
  return { scene, seal, mount, render };
})();
