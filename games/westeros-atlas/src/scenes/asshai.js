// Asshai-by-the-Shadow - restrained and eerie. Book anchors (thin): a very old city of dark stone on the shore beneath "the Shadow",
// with a harbour, shadowbinders and warlocks, partly empty and ruined. Everything else is interpretation; deliberately sparse.
// Polish pass: blue-black basalt with cold-teal rim light, twisted-tier warlock spires and stepped windowless blocks, terraced
// streets, a curved breakwater beacon, drifting pale motes, sea-mist banks, sickly overcast light with a teal night glow.
import * as K from '../kit/index.js';
const { THREE, Batch, tri, flat, glow } = K;

const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
const GEO = {};
const geo = (k, f) => GEO[k] || (GEO[k] = f().toNonIndexed());
const shardG = () => geo('shard', () => new THREE.ConeGeometry(1, 1, 5, 1).translate(0, 0.5, 0));
const frustG = (top) => geo(`fr${top}`, () => new THREE.CylinderGeometry(top, 1, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0)); // 4-sided tapered block
const cylG = (seg, top) => geo(`cyl${seg}|${top}`, () => new THREE.CylinderGeometry(top, 1, 1, seg, 1).translate(0, 0.5, 0));
const boxG = () => geo('box', () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
function part(b, mat, g, x, y, z, sx, sy, sz, rx, ry, rz, color) {
  _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _m4.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); b.addGeometry(mat, g, _m4, color);
}
const vary = (r, hex, a = 0.12) => { _c.set(hex); const k = 1 + (r() - 0.5) * 2 * a; return _c.clone().multiplyScalar(k); };

/** Drifting additive motes (GPU-animated, one draw call). */
function motes(bounds, n, { color = 0xa8e4d8, size = 60, h = 14, rise = 0.6, seed = 3, heightAt = () => 0 } = {}) {
  const r = K.rng(seed), pos = new Float32Array(n * 3), sd = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = r.range(bounds[0], bounds[2]), z = r.range(bounds[1], bounds[3]); pos.set([x, heightAt(x, z) + 1.5, z], i * 3); sd[i] = r(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: K.shared.uTime, uColor: { value: new THREE.Color(color) }, uSize: { value: size }, uH: { value: h }, uRise: { value: rise } },
    vertexShader: `attribute float aSeed; uniform float uTime,uSize,uH,uRise; varying float vA; void main(){ float t=uTime*0.15+aSeed*20.0; vec3 p=position; p.x+=sin(t*1.3+aSeed*9.0)*5.0; p.z+=cos(t*1.1+aSeed*5.0)*5.0; float f=fract(uTime*0.02*uRise+aSeed); p.y+=f*uH+sin(t*0.9)*1.2; vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=min(uSize*(0.5+aSeed)/max(1.0,-mv.z),22.0); vA=sin(f*3.14159)*(0.55+0.45*sin(uTime*1.3+aSeed*40.0)); }`,
    fragmentShader: `uniform vec3 uColor; varying float vA; void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.0,d); gl_FragColor=vec4(uColor,a*a*vA*0.9); }` });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 6; return pts;
}


/** Camera-facing smoke/mist billboards (one instanced draw, no point-size cap). emitters: [[x,y,z],...] */
function bbSmoke(emitters, { per = 8, size = 80, rise = 100, spread = 10, color = 0x303030, opacity = 0.5, speed = 0.05, seed = 1 } = {}) {
  const r = K.rng(seed), n = emitters.length * per, base = new Float32Array(n * 3), sd = new Float32Array(n);
  emitters.forEach((e, i) => { for (let k = 0; k < per; k++) { const o = i * per + k; base.set(e, o * 3); sd[o] = (k + r() * 0.5) / per; } });
  const g = new THREE.PlaneGeometry(1, 1); const ig = new THREE.InstancedBufferGeometry(); ig.index = g.index; ig.attributes.position = g.attributes.position; ig.attributes.uv = g.attributes.uv;
  ig.setAttribute('aBase', new THREE.InstancedBufferAttribute(base, 3)); ig.setAttribute('aSeed', new THREE.InstancedBufferAttribute(sd, 1)); ig.instanceCount = n;
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    uniforms: { uTime: K.shared.uTime, uMap: { value: K.spriteTexture() }, uColor: { value: new THREE.Color(color) }, uSize: { value: size }, uRise: { value: rise }, uSpread: { value: spread }, uOpacity: { value: opacity }, uSpeed: { value: speed } },
    vertexShader: `attribute vec3 aBase; attribute float aSeed; uniform float uTime,uSize,uRise,uSpread,uOpacity,uSpeed; varying vec2 vUv; varying float vA; void main(){ float t=fract(uTime*uSpeed+aSeed); vec3 p=aBase; p.y+=t*uRise; p.x+=sin(aSeed*50.0+t*2.0)*uSpread*t+t*uSpread*0.6; p.z+=cos(aSeed*30.0+t*1.5)*uSpread*t*0.6; vec4 mv=viewMatrix*vec4(p,1.0); float s=uSize*(0.35+t*1.1)*(0.8+0.4*fract(aSeed*7.0)); mv.xy+=position.xy*s; gl_Position=projectionMatrix*mv; vUv=uv; vA=sin(t*3.14159)*uOpacity; }`,
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uColor; varying vec2 vUv; varying float vA; void main(){ float a=texture2D(uMap,vUv).a; gl_FragColor=vec4(uColor,a*vA); }` });
  const mesh = new THREE.Mesh(ig, m); mesh.frustumCulled = false; mesh.renderOrder = 4; return mesh;
}

export default {
  build(ctx) {
    const q = ctx.q, root = ctx.root;
    const heightAt = (x, z) => {
      const coast = -70 + Math.sin(z * 0.02) * 16 + K.fbm(z * 0.02, 2, 2, 3) * 20;
      const land = K.smoothstep(coast - 3, coast + 9, x);
      let h = -7 + land * 9.6 + land * K.smoothstep(0, 200, x) * 14 + (K.fbm(x * 0.02, z * 0.02, 3, 7) - 0.5) * 5 * land * K.smoothstep(-20, 70, x);   // inland noise is faded near the shore so no pits flood with foam
      h += K.smoothstep(240, 420, x) * (K.fbm(x * 0.008, z * 0.008, 3, 9) * 120 + 30); // the Shadow: black mountain wall
      return h;
    };
    const H = heightAt;
    // ---- terrain: blue-black basalt, paler wind-scoured ridges, wet-black shore, dim cold tint high on the Shadow
    const dk = new THREE.Color(0x24272e), dk2 = new THREE.Color(0x3a404a), wet = new THREE.Color(0x101418), cold = new THREE.Color(0x4a5a62), c = new THREE.Color();
    root.add(K.terrain({ size: 1100, seg: q.seg(200), heightAt: H, kind: 'rock', scale: 14, colorAt: (x, z, h, s) => {
      const n = K.fbm(x * 0.02, z * 0.02, 3, 3), n2 = K.fbm(x * 0.09, z * 0.09, 2, 11);
      c.copy(dk).lerp(dk2, K.clamp(n * 1.2, 0, 1)).multiplyScalar(0.85 + 0.3 * n2);
      c.lerp(cold, K.clamp(s * 2.6, 0, 0.7) * 0.8);
      if (h > 60) c.lerp(wet, K.smoothstep(60, 160, h) * 0.5);
      if (h < 0.8) c.lerp(wet, 0.75 * K.clamp((0.8 - h) / 1.4, 0, 1) + 0.1);
      return c; } }));
    const wat = K.water({ w: 900, d: 1300, seg: q.seg(100), level: 0, heightAt: H, deep: 0x080f14, shallow: 0x1f3a40, opacity: 0.96, choppy: 0.3, speed: 0.35, center: [-320, 0] });
    root.add(wat); ctx.registerWater(wat);

    // ---- materials: near-white tints, colour in the per-part colour
    const blk = tri('slate', { color: 0xe8ecf2, scale: 6, snow: false, rough: 0.55, bump: 0.8 }), blk2 = tri('stone', { color: 0xe0e4ec, scale: 7, snow: false, bump: 1.0 }), cobble = tri('cobble', { color: 0x58606a, scale: 6, snow: false, bump: 0.9 });
    const winG = glow(0x9fd8cc, 1.0), lampG = glow(0xb8f0e0, 1.3), woodM = tri('wood', { color: 0x6a6460, scale: 4, snow: false });
    const rockM = tri('rock', { color: 0xc8ccd4, scale: 8, snow: false, bump: 1.2 });
    const b = new Batch(), rb = new Batch(), R = K.rng(81);
    const SLATES = [0x5c6270, 0x6a7080, 0x4e5460, 0x727886, 0x585e6a];

    // ---- harbour: long black quay with mooring posts and pale lamps, curved breakwaters ending in beacon towers
    b.box(blk2, -40, 0.2, 0, 6, 3.2, 190, 0, 0x4a4e58); b.box(blk2, -40, 3.4, 0, 6.6, 0.5, 190, 0, 0x6a707c);
    for (let z = -92; z <= 92; z += 8) { b.cyl(blk, -43.2, 3.8, z, 0.45, 1.0, { seg: 6, color: 0x2c3038 }); }
    for (let i = -4; i <= 4; i++) { K.pier(b, -40, 1.2, i * 20, { len: 26, w: 3.5, ry: Math.PI, mat: woodM, color: 0x484440 }); b.cyl(blk, -43.5, 3.7, i * 20 + 10, 0.2, 3.6, { seg: 5, color: 0x2a2e34 }); b.sphere(lampG, -43.5, 7.4, i * 20 + 10, 0.55, { seg: 6 }); }
    for (const sg of [-1, 1]) {
      const arm = Array.from({ length: 8 }, (_, i) => [-46 - i * 4.5, sg * (84 + i * 4 + i * i * 0.35)]);
      K.wall(b, arm, { h: 5.5, t: 4.5, mat: blk2, capMat: blk2, heightAt: H, crenel: false, sink: 4, color: 0x484c56 });
      const tz = arm[7][1], tx = arm[7][0];
      b.cyl(blk2, tx, -2, tz, 5.2, 24, { top: 0.74, seg: 8, color: 0x50545e }); b.cyl(blk, tx, 21, tz, 4.2, 1.1, { top: 1.3, seg: 8, color: 0x2e323a }); b.cone(blk, tx, 22, tz, 4.3, 7, { seg: 8, color: 0x3a3e48 });
      b.sphere(lampG, tx, 24.2, tz, 0.9, { seg: 6 }); // beacon
    }

    // ---- avenue, streets and terrace walls climbing toward the Shadow
    const ave = K.smoothPath([[-38, 0], [20, -6], [90, 4], [160, 0]], 8); b.ribbon(cobble, ave, 8, H, 0.18, 0x7a828c); b.ribbon(cobble, ave.filter((_, i) => i % 2 === 0), 8.8, H, 0.1, 0x30343c);
    const side = [[[10, -90], [30, -40], [20, 20], [40, 80]], [[70, -80], [90, -30], [100, 40], [80, 90]]]; side.forEach((s) => b.ribbon(cobble, K.smoothPath(s, 6), 4.5, H, 0.15, 0x666e78));
    const sidePaths = side.map((s) => K.smoothPath(s, 6));
    const nearFast = (x, z) => K.distToPolyline(x, z, ave).d < 7 || sidePaths.some((s) => K.distToPolyline(x, z, s).d < 5);
    for (const tx of [34, 74, 118]) for (const sg of [-1, 1]) { const pts = Array.from({ length: 7 }, (_, i) => [tx + Math.sin(i * 0.8 + tx) * 4, sg * (14 + i * 14)]); K.wall(b, pts, { h: 4, t: 2.4, mat: blk2, capMat: blk2, heightAt: H, crenel: false, sink: 4, color: 0x464a54 }); }

    // ---- the dense dark town: stepped windowless blocks, vaulted halls, tapered needles - thinning as it climbs
    const keepOut = [[60, -40, 22], [90, 60, 20], [100, 0, 20], [10, 60, 18], [120, -60, 20], [140, 80, 34]];
    const pts = K.scatter({ rng: K.rng(81), count: q.dens(260), bounds: [-30, -110, 150, 110], minDist: 8.4, avoid: (x, z) => nearFast(x, z) || keepOut.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr), accept: (x, z) => K.noise2(x * 0.06, z * 0.06, 4) > 0.2 && H(x, z) > 1.6 });
    const placed = [];
    for (const [x, z] of pts) {
      const y = H(x, z), kind = R(), ry = Math.round(R() * 4) * (Math.PI / 2) + R.range(-0.08, 0.08), col = vary(R, R.pick(SLATES), 0.1);
      const w = R.range(4.5, 8.5), d = R.range(4.5, 8.5) * R.range(1, 1.3), h = R.range(4, 9) * (1.3 - K.smoothstep(-20, 150, x) * 0.5);
      if (kind < 0.42) { // stepped block, two setbacks, flat or pointed cap
        part(b, blk2, boxG(), x, y - 1.4, z, w, h + 1.4, d, 0, ry, 0, col);
        part(b, blk2, boxG(), x, y + h, z, w * 0.72, h * 0.5, d * 0.72, 0, ry, 0, vary(R, 0x6a7080, 0.1));
        if (R() < 0.5) part(b, blk, frustG(0.0), x, y + h * 1.5, z, w * 0.62, 4 + R() * 3, d * 0.62, 0, ry, 0, 0x30343c);
        else part(b, blk, boxG(), x, y + h * 1.5, z, w * 0.8, 0.5, d * 0.8, 0, ry, 0, 0x2c3038);
      } else if (kind < 0.7) { // needle: tapered four-sided shaft with a spire
        const nh = h * 1.9 + 4; part(b, blk2, frustG(0.45), x, y - 1.4, z, w * 0.55 / 1.414, nh + 1.4, d * 0.55 / 1.414, 0, ry, 0, col);
        part(b, blk, frustG(0.0), x, y + nh, z, w * 0.3 / 1.414, 5, d * 0.3 / 1.414, 0, ry, 0, 0x2c3038);
        if (R() < 0.5) b.box(winG, x + Math.sin(ry) * d * 0.21, y + nh * 0.55, z + Math.cos(ry) * d * 0.21, 0.28, 1.8, 0.1, ry);
      } else if (kind < 0.88) { // low vaulted hall: half-cylinder roof along its length
        part(b, blk2, boxG(), x, y - 1.4, z, w, h * 0.55 + 1.4, d * 1.2, 0, ry, 0, col);
        part(b, blk, cylG(10, 1), x - Math.sin(ry) * d * 0.6, y + h * 0.55, z - Math.cos(ry) * d * 0.6, w * 0.5, d * 1.2, w * 0.5, Math.PI / 2, ry, 0, vary(R, 0x30343c, 0.1));
      } else { // low square dome on a drum
        part(b, blk2, boxG(), x, y - 1.4, z, w, h * 0.6 + 1.4, w, 0, ry, 0, col);
        b.dome(blk, x, y + h * 0.6, z, w * 0.46, { seg: 10, sy: 0.9, color: 0x383c46 });
      }
      if (R() < 0.12) b.box(winG, x + Math.sin(ry) * (d / 2 + 0.05), y + h * 0.4, z + Math.cos(ry) * (d / 2 + 0.05), 0.35, 1.3, 0.1, ry); // the rare lit slit
      placed.push({ x, z, h });
    }

    // ---- towers of the shadowbinders and warlocks: twisted tiers climbing to needle tips with a cold flame
    const tw = [[60, -40, 58], [90, 60, 48], [100, 0, 66], [10, 60, 36], [120, -60, 44]];
    tw.forEach(([x, z, h], i) => {
      const y = H(x, z), tiers = Math.round(h / 3.6);
      part(b, blk2, cylG(8, 0.8), x, y - 4, z, 8, 6, 8, 0, 0, 0, 0x30343c);
      for (let k = 0; k < tiers; k++) { const t = k / tiers, w = (9 - 6.2 * t) * (1 + 0.05 * Math.sin(k * 1.7)); part(b, blk2, boxG(), x, y + 2 + k * 3.45, z, w, 3.5, w, 0, k * 0.2 + i, 0, vary(R, k % 3 ? 0x52586a : 0x424856, 0.08)); }
      part(b, blk, shardG(), x, y + 2 + tiers * 3.45, z, 2.6, 14, 2.6, 0, 0, 0, 0x2a2e36);
      b.box(winG, x, y + 2 + tiers * 3.45 * 0.35, z + 3.4, 0.4, 2.2, 0.15, 0); b.sphere(lampG, x, y + 2 + tiers * 3.45 + 15, z, 0.8, { seg: 6 });
    });

    // ---- ruined quarter: roofless shells with snapped crowns, rubble, a few standing columns
    const rq = [140, 80];
    for (let i = 0; i < 20; i++) {
      const x = rq[0] + (K.noise2(i, 1, 7) - 0.5) * 56 + (i % 5) * 3, z = rq[1] + (K.noise2(i, 2, 8) - 0.5) * 56, y = H(x, z), w = 5 + (i % 4) * 1.2, a = i * 1.3;
      part(b, blk2, boxG(), x, y - 0.8, z, w, 2 + (i % 5), 0.9, R.range(-0.04, 0.04), a, R.range(-0.05, 0.08), vary(R, 0x484e5a, 0.15));
      part(b, blk2, boxG(), x + Math.cos(a) * w * 0.5, y - 0.8, z - Math.sin(a) * w * 0.5, 0.9, 1.5 + (i % 3) * 1.3, 4.5, 0, a, 0, vary(R, 0x444a56, 0.15));
      if (i % 3 === 0) { part(b, blk2, cylG(8, 0.82), x + 3, y - 1, z + 4, 1.1, 7 + (i % 4) * 2, 1.1, 0, 0, 0, 0x5a606c); part(b, blk, shardG(), x + 3, y + 5 + (i % 4) * 2, z + 4, 0.9, 2.4, 0.9, 0.3, 0, 0.2, 0x30343c); }
      else if (i % 3 === 1) part(b, blk2, cylG(8, 0.9), x - 4, y + 0.5, z + 2, 1.0, 5, 1.0, 0, a, Math.PI / 2 - 0.1, 0x4c525e); // fallen
    }
    // ---- stair-terrace and the broken gate at the foot of the Shadow
    for (let k = 0; k < 14; k++) { const x = 146 + k * 1.9, y = H(x, 0); b.box(blk2, x, y - 1.2 + k * 0.18, 0, 2.1, 1.7, 17 - k * 0.2, 0, vary(R, 0x484e58, 0.08)); }
    for (const s of [-1, 1]) { const y = H(168, s * 9); b.cyl(blk2, 168, y - 1.5, s * 9, 3.4, 4, { top: 0.9, seg: 8, color: 0x444a54 }); b.cyl(blk2, 168, y + 2.5, s * 9, 2.7, 21, { top: 0.82, seg: 8, color: 0x50565f }); b.cyl(blk, 168, y + 23, s * 9, 3.2, 1.2, { top: 1.1, seg: 8, color: 0x30343c }); }
    { const y = H(168, 0); b.box(blk2, 168, y + 21, -4.5, 5, 3, 10.5, 0, 0x424852); part(b, blk2, boxG(), 168, y + 23, 5, 5, 2.8, 8, 0, 0.1, 0.5, 0x3e444e); part(b, blk2, boxG(), 171, y - 0.4, 8, 5, 3, 7, 0.1, 0.3, 0.1, 0x3a404a); } // half the lintel is down
    root.add(b.build({}));

    // ---- the Shadow: tall jagged black spires on the mountain wall, receding into the fog
    { const rr = K.rng(7); for (let i = 0; i < q.dens(70); i++) {
        const x = rr.range(236, 440), z = rr.range(-300, 300), y = H(x, z), hs = rr.range(24, 84), r = rr.range(7, 20), lean = rr.range(0.02, 0.18), la = rr() * 6.283;
        part(rb, rockM, shardG(), x, y - 5, z, r, hs, r * rr.range(0.7, 1.2), Math.sin(la) * lean, rr() * 6, Math.cos(la) * lean, vary(rr, 0x15171d, 0.25));
        for (let k = 0; k < 2; k++) { const a2 = la + (k ? 2.4 : -2.2) + rr() * 0.6, d = r * 0.7; part(rb, rockM, shardG(), x + Math.cos(a2) * d, y - 4, z + Math.sin(a2) * d, r * rr.range(0.3, 0.55), hs * rr.range(0.45, 0.8), r * rr.range(0.3, 0.55), Math.sin(a2) * 0.25, rr() * 6, Math.cos(a2) * 0.25, vary(rr, 0x1a1d24, 0.25)); }
      } }
    root.add(rb.build({ shadow: false }));

    // ---- life: sea mist, chimney-less smoke, dark sails, pale lights, drifting motes, crows
    const mist = []; for (let i = 0; i < 26; i++) mist.push([-190 + (i % 7) * 32, 0.8, -190 + i * 15]);
    root.add(bbSmoke(mist, { per: 5, size: 40, rise: 10, spread: 14, color: 0x6a7e84, opacity: 0.22, speed: 0.03, seed: 2 }));
    root.add(K.smoke(placed.filter((_, i) => i % 18 === 0).map((p) => [p.x, H(p.x, p.z) + p.h + 3, p.z]), { color: 0x7a7e84, size: 14, rise: 12, opacity: 0.14 }));
    const ships = [['junk', -100, -50, 0.4], ['galley', -120, 30, 1.8], ['junk', -90, 110, 3]].map(([tp, x, z, ry]) => { const s = K.ship(tp, { len: 18, hull: 0x1c1a18, sail: 0x2a2c34, sailColor2: 0x3a3030 }); s.position.set(x, 0.1, z); s.rotation.y = ry; s.userData.b = x; root.add(s); return s; });
    ctx.onUpdate((dt, t) => ships.forEach((s, i) => { K.animateShip(s, t, i * 2); s.position.x = s.userData.b + Math.sin(t * 0.05 + i) * 3; }));
    const lampPos = [[-43.5, 7.6, -80], [-43.5, 7.6, -40], [-43.5, 7.6, 0], [-43.5, 7.6, 40], [-43.5, 7.6, 80], ...tw.map(([x, z, h]) => [x, H(x, z) + 2 + Math.round(h / 3.6) * 3.45 + 15, z])];
    const fire = K.fires(lampPos, { size: 5, light: 0, color: 0xaad8d0 }); root.add(fire); ctx.onUpdate((dt, t) => fire.userData.update(t));
    const bl = [[-62 - 31, 24], [100, 0]].map(([x, z], i) => { const l = new THREE.PointLight(0x9fe4d4, q.low ? 0 : 1700, 110, 1.6); l.position.set(i ? 100 : -43, i ? H(100, 0) + 72 : 9, i ? 0 : 0); if (!q.low) root.add(l); return l; });
    ctx.onUpdate((dt, t) => bl.forEach((l, i) => { l.intensity = q.low ? 0 : 1500 + 220 * Math.sin(t * 1.7 + i * 3) * Math.sin(t * 0.6 + i); }));
    root.add(motes([-40, -120, 150, 120], q.dens(120), { heightAt: H, h: 16, seed: 3 }));
    root.add(motes([130, 50, 170, 110], q.dens(50), { heightAt: H, h: 10, seed: 5, size: 70 }));
    const crows = K.birds({ center: [90, 70, 0], radius: 70, count: q.dens(8), color: 0x0a0a0c, size: 1.3, spreadY: 16, seed: 22 }); root.add(crows); ctx.onUpdate((dt, t) => crows.userData.update(t));
    const cl = K.clouds({ y: 220, extent: 900, count: 14, opacity: 0.5, color: 0x3a3e48 }); root.add(cl); ctx.onUpdate((dt) => cl.userData.update(dt));

    const lm = (x, z, r, dy = 0) => ({ pos: [x, H(x, z) + dy, z], r });
    return {
      radius: 300, center: [60, 0, 0], minDistance: 20,
      hero: { pos: [-120, 85, -110], target: [60, 16, 0] },
      climate: { atmos: 'day', weather: 'clear', snow: 0, tint: {
        dawn: { az: 4.0, top: 0x2a3640, horizon: 0x8a9a98, fog: 0x56666a, fogD: 0.0024, sunC: 0xb8d0cc, sunI: 1.2, hemiSky: 0x7a8c94, hemiGround: 0x28303a, hemiI: 0.95 },
        day: { top: 0x3c4a54, horizon: 0x8ea0a2, fog: 0x62727a, fogD: 0.0022, sunI: 1.35, elev: 0.3, az: 4.0, hemiSky: 0x9aaab4, hemiGround: 0x2a323a, hemiI: 1.15, sunC: 0xcfe0e0 },
        dusk: { top: 0x141a24, horizon: 0x56707a, fog: 0x2c3c44, fogD: 0.0022, sunC: 0x9ab8c0, sunI: 1.2, hemiSky: 0x607890, hemiGround: 0x1c242c, hemiI: 0.95 },
        night: { top: 0x04070c, horizon: 0x1c3238, fog: 0x0e1a20, fogD: 0.0026, sunC: 0x84a8c8, sunI: 1.3, hemiSky: 0x4c6a88, hemiGround: 0x18222c, hemiI: 1.7, exposure: 1.3 },
      } },
      landmarks: { 'black-harbour': lm(-40, 0, 30, 10), 'dark-stone-streets': lm(40, 0, 30, 12), 'warlock-towers': lm(100, 0, 20, 70), 'ruined-quarter': lm(rq[0], rq[1], 30, 8), 'the-shadow': lm(300, 0, 60, 100), 'pale-lights': lm(60, -40, 14, 50) },
    };
  },
};
