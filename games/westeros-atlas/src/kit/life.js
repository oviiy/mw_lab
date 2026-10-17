// Ambient life & weather. Everything here is GPU-animated or pooled so it costs almost nothing per frame.
import * as THREE from 'three';
import { rng as makeRng, pointAlong, polyLength } from './util.js';
import { shared, dimAtNight } from './materials.js';
import { spriteTexture } from './textures.js';

/** Camera-following precipitation. kind: snow | rain | ash. Returns Points/LineSegments with .setAmount(0..1). */
export function weather(kind = 'snow', { count = 4000, box = 120 } = {}) {
  const r = makeRng(kind.length * 31);
  const geo = new THREE.BufferGeometry();
  const rain = kind === 'rain';
  const n = count;
  const seed = new Float32Array(n * (rain ? 2 : 1) * 3), end = new Float32Array(n * (rain ? 2 : 1));
  for (let i = 0; i < n; i++) {
    const s = [r(), r(), r()];
    for (let k = 0; k < (rain ? 2 : 1); k++) { const o = (i * (rain ? 2 : 1) + k); seed[o * 3] = s[0]; seed[o * 3 + 1] = s[1]; seed[o * 3 + 2] = s[2]; end[o] = k; }
  }
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(seed.length), 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
  geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: shared.uTime, uBox: { value: box }, uAmount: { value: 1 }, uCam: { value: new THREE.Vector3() }, uColor: { value: new THREE.Color(kind === 'rain' ? 0xb8c7d8 : kind === 'ash' ? 0x9a948c : 0xffffff) }, uSize: { value: kind === 'snow' ? 3.4 : 2.2 }, uFall: { value: kind === 'rain' ? 70 : kind === 'ash' ? 3 : 7 }, uRain: { value: rain ? 1 : 0 }, uSway: { value: kind === 'snow' ? 1 : 0.2 } },
    vertexShader: `
      attribute vec3 aSeed; attribute float aEnd; uniform float uTime, uBox, uAmount, uSize, uFall, uRain, uSway; uniform vec3 uCam; varying float vA;
      void main(){
        vec3 p = aSeed * uBox;
        float fall = uFall * uTime;
        p.y = mod(p.y - fall, uBox);
        p.x += sin(uTime*0.7 + aSeed.z*40.0) * 2.5 * uSway + uTime * 1.5 * uSway;
        p.z += cos(uTime*0.5 + aSeed.x*40.0) * 2.0 * uSway;
        vec3 w = vec3(mod(p.x - uCam.x + uBox*0.5, uBox) + uCam.x - uBox*0.5, p.y + uCam.y - uBox*0.35, mod(p.z - uCam.z + uBox*0.5, uBox) + uCam.z - uBox*0.5);
        if (uRain > 0.5 && aEnd > 0.5) w.y += 2.2; if (uRain > 0.5 && aEnd > 0.5) w.x += 0.25;
        vec4 mv = viewMatrix * vec4(w, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (60.0 / max(1.0, -mv.z));
        vA = step(aSeed.y, uAmount) * (1.0 - smoothstep(uBox*0.25, uBox*0.5, length(w - uCam)));
      }`.replace('step(aSeed.y, uAmount)', 'step(aSeed.x, uAmount)'),
    fragmentShader: `uniform vec3 uColor; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = rainFlag() ? 0.5 : smoothstep(0.5, 0.1, d); gl_FragColor = vec4(uColor, a * vA * 0.85); }`.replace('rainFlag()', 'false'),
  });
  const obj = rain ? new THREE.LineSegments(geo, mat) : new THREE.Points(geo, mat);
  if (rain) mat.fragmentShader = `uniform vec3 uColor; varying float vA; void main(){ gl_FragColor = vec4(uColor, 0.35 * vA); }`;
  obj.frustumCulled = false; obj.renderOrder = 5;
  obj.userData.kind = kind;
  obj.userData.setAmount = (a) => { mat.uniforms.uAmount.value = a; obj.visible = a > 0.01; };
  obj.userData.follow = (cam) => mat.uniforms.uCam.value.copy(cam.position);
  obj.visible = false;
  return obj;
}

/** Chimney / cooking smoke: pooled rising puffs at emitter positions [[x,y,z],...]. */
export function smoke(emitters, { perStack = 6, color = 0xcfcfcf, rise = 14, size = 22, opacity = 0.35, spread = 3 } = {}) {
  const r = makeRng(emitters.length + 7);
  const n = emitters.length * perStack;
  const base = new Float32Array(n * 3), seed = new Float32Array(n);
  emitters.forEach((e, i) => { for (let k = 0; k < perStack; k++) { const o = i * perStack + k; base.set(e, o * 3); seed[o] = k / perStack + r() * 0.08; } });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(base, 3)); geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: shared.uTime, uMap: { value: spriteTexture() }, uColor: { value: dimAtNight(new THREE.Color(color)) }, uRise: { value: rise }, uSize: { value: size }, uOpacity: { value: opacity }, uSpread: { value: spread } },
    vertexShader: `attribute float aSeed; uniform float uTime, uRise, uSize, uSpread; varying float vA; void main(){ float t = fract(uTime*0.12 + aSeed); vec3 p = position; p.y += t*uRise; p.x += sin(aSeed*50.0 + t*3.0)*uSpread*t + t*uSpread; p.z += cos(aSeed*30.0 + t*2.0)*uSpread*t*0.5; vec4 mv = modelViewMatrix * vec4(p,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * (0.3+t) * (60.0/max(1.0,-mv.z)); vA = sin(t*3.14159); }`,
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uColor; uniform float uOpacity; varying float vA; void main(){ vec4 s = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(uColor, s.a * vA * uOpacity); }`,
  });
  const p = new THREE.Points(geo, mat); p.frustumCulled = false; p.renderOrder = 4; return p;
}

/** Flickering fire billboards at [[x,y,z],...]. Optionally one shared point light that follows the first. */
export function fires(positions, { size = 9, light = 0, color = 0xffa040, intensity = 40 } = {}) {
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(positions.length * 3), seed = new Float32Array(positions.length);
  positions.forEach((p, i) => { arr.set(p, i * 3); seed[i] = i * 1.37 + 0.5; });
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3)); geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: shared.uTime, uMap: { value: spriteTexture('fire') }, uSize: { value: size } },
    vertexShader: `attribute float aSeed; uniform float uTime, uSize; varying float vF; void main(){ vF = 0.75 + 0.25*sin(uTime*11.0 + aSeed*5.0) * sin(uTime*7.3 + aSeed); vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * vF * (60.0/max(1.0,-mv.z)); }`,
    fragmentShader: `uniform sampler2D uMap; varying float vF; void main(){ vec4 s = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(s.rgb * vF, s.a * vF); }`,
  });
  const g = new THREE.Group(); const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 6; g.add(pts);
  const lights = [];
  for (let i = 0; i < Math.min(light, positions.length); i++) { const l = new THREE.PointLight(color, intensity, 40, 1.6); l.position.set(...positions[i]); l.userData.base = intensity; g.add(l); lights.push(l); }
  g.userData.update = (t) => lights.forEach((l, i) => { l.intensity = l.userData.base * (0.85 + 0.15 * Math.sin(t * 9 + i * 2) * Math.sin(t * 5.3 + i)); });
  return g;
}

/** Soaring birds (gulls, ravens, crows) circling a centre. Returns {mesh, update(t)}. */
export function birds({ center = [0, 60, 0], radius = 80, count = 14, speed = 0.12, color = 0xf2f2f2, size = 1.4, spreadY = 18, seed = 5 } = {}) {
  const r = makeRng(seed);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.6, -2.2, 0.25, -0.4, 0, 0, -0.4, 0, 0, 0.6, 0, 0, -0.4, 2.2, 0.25, -0.4].map((v) => v * 0.55), 3));
  g.computeVertexNormals();
  const m = new THREE.InstancedMesh(g, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }), count);
  const data = Array.from({ length: count }, () => ({ a: r() * 6.28, rad: radius * r.range(0.5, 1.1), y: center[1] + r.range(-spreadY, spreadY), sp: speed * r.range(0.7, 1.3), ph: r() * 6, cx: center[0] + r.range(-radius * 0.3, radius * 0.3), cz: center[2] + r.range(-radius * 0.3, radius * 0.3) }));
  const o = new THREE.Object3D();
  const update = (t) => {
    data.forEach((d, i) => {
      const a = d.a + t * d.sp;
      o.position.set(d.cx + Math.cos(a) * d.rad, d.y + Math.sin(t * 0.6 + d.ph) * 3, d.cz + Math.sin(a) * d.rad);
      o.rotation.set(0, -a, Math.sin(t * 5 + d.ph) * 0.35 + 0.2); o.scale.setScalar(size);
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  };
  m.frustumCulled = false; update(0);
  m.userData.update = update;
  return m;
}

/** Tiny instanced townsfolk walking along polylines [[x,z],...] (ground via heightAt). */
export function walkers({ paths, heightAt = () => 0, count = 40, rng = makeRng(9), speed = [1.2, 2.2], colors = [0x7a5c3a, 0x4d5a6a, 0x8a3b32, 0x57603a, 0x6a6a6a], height = 1.7, lift = 0.12 }) {
  const geo = new THREE.CapsuleGeometry(0.32, height - 0.64, 3, 6); geo.translate(0, height / 2, 0);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 1 }), count);
  const lens = paths.map(polyLength);
  const data = Array.from({ length: count }, (_, i) => { const p = Math.floor(rng() * paths.length); return { p, s: rng() * lens[p], v: rng.range(speed[0], speed[1]) * (rng() < 0.5 ? -1 : 1), off: rng.range(-1.2, 1.2) }; });
  data.forEach((d, i) => mesh.setColorAt(i, new THREE.Color(rng.pick(colors))));
  const o = new THREE.Object3D();
  const update = (t) => {
    data.forEach((d, i) => {
      let s = (d.s + t * d.v) % (lens[d.p] * 2); if (s < 0) s += lens[d.p] * 2;
      const u = s > lens[d.p] ? lens[d.p] * 2 - s : s; // ping-pong
      const q = pointAlong(paths[d.p], u);
      const nx = Math.cos(q.angle) * d.off, nz = -Math.sin(q.angle) * d.off;
      const x = q.x + nx, z = q.z + nz;
      o.position.set(x, heightAt(x, z) + lift + Math.abs(Math.sin(t * 5 + i)) * 0.06, z);
      o.rotation.y = q.angle + (s > lens[d.p] ? Math.PI : 0); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  mesh.frustumCulled = false; mesh.castShadow = false; update(0);
  mesh.userData.update = update;
  return mesh;
}

/** Waving banners (instanced). items: [{x,y,z,w,h,color,ry,color2}] */
export function banners(items, { pole = true } = {}) {
  const grp = new THREE.Group();
  const geo = new THREE.PlaneGeometry(1, 1, 6, 2); geo.translate(0.5, -0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide, vertexColors: false });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = shared.uTime;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n float wv = sin(uTime*3.0 + position.x*5.0 + instanceMatrix[3].x*0.3) * 0.12 * position.x; transformed.z += wv; transformed.y += sin(uTime*2.3 + position.x*4.0)*0.02*position.x;');
  };
  const m = new THREE.InstancedMesh(geo, mat, items.length);
  const o = new THREE.Object3D(); const c = new THREE.Color();
  items.forEach((it, i) => {
    o.position.set(it.x, it.y, it.z); o.rotation.set(0, it.ry || 0, 0); o.scale.set(it.w ?? 3, it.h ?? 5, 1); o.updateMatrix();
    m.setMatrixAt(i, o.matrix); m.setColorAt(i, c.set(it.color ?? 0x8a1f1f));
    if (pole) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, (it.h ?? 5) + 1.2, 5), new THREE.MeshStandardMaterial({ color: 0x3a2a1c }));
      p.position.set(it.x, it.y - (it.h ?? 5) / 2 + 0.2, it.z); grp.add(p);
    }
  });
  m.frustumCulled = false; grp.add(m); return grp;
}

/** Slow cloud shadows / drifting wisps not needed; simple drifting cloud layer. */
export function clouds({ y = 220, extent = 900, count = 18, seed = 4, color = 0xffffff, opacity = 0.55 } = {}) {
  const r = makeRng(seed);
  const grp = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ map: spriteTexture(), transparent: true, opacity, depthWrite: false, fog: false, color }); dimAtNight(mat.color);
  for (let i = 0; i < count; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(r.range(160, 340), r.range(60, 120)), mat);
    s.rotation.x = -Math.PI / 2; s.position.set(r.range(-extent, extent), y + r.range(-20, 30), r.range(-extent, extent)); s.userData.v = r.range(1.5, 4);
    grp.add(s);
  }
  grp.userData.update = (dt) => grp.children.forEach((c) => { c.position.x += c.userData.v * dt; if (c.position.x > extent) c.position.x = -extent; });
  return grp;
}
