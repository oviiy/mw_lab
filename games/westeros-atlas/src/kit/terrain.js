// Heightfield terrain + animated water. Terrain is a function: heightAt(x,z) so every other system can
// conform to it (roads, walls, houses, trees) without raycasts.
import * as THREE from 'three';
import { tri, shared } from './materials.js';

/**
 * opts: { size (world units, square) | w,d, seg, heightAt(x,z), colorAt(x,z,h,slope)->THREE.Color|hex, kind, tint, center:[x,z] }
 * returns Mesh; mesh.userData.heightAt
 */
export function terrain({ size = 600, w, d, seg = 160, heightAt, colorAt, kind = 'rock', scale = 14, center = [0, 0], rough = 0.95 }) {
  const W = w || size, D = d || size;
  const sx = Math.max(1, seg), sz = Math.max(1, Math.round(seg * (D / W)));
  const g = new THREE.PlaneGeometry(W, D, sx, sz);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + center[0], z = pos.getZ(i) + center[1];
    pos.setXYZ(i, pos.getX(i) + center[0], heightAt(x, z), pos.getZ(i) + center[1]);
  }
  g.computeVertexNormals();
  const nor = g.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = pos.getY(i);
    const slope = 1 - nor.getY(i);
    c.set(colorAt ? colorAt(x, z, h, slope) : 0x808080);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mesh = new THREE.Mesh(g, tri(kind, { scale, rough, color: 0xffffff }));
  mesh.receiveShadow = true;
  mesh.userData.heightAt = heightAt;
  return mesh;
}

/** Animated water with shoreline foam derived from the terrain heightfield. */
export function water({ size = 900, w, d, level = 0, heightAt = () => -5, seg = 140, deep = 0x0d3a52, shallow = 0x3f9aa0, foam = 0xffffff, center = [0, 0], opacity = 0.94, speed = 1, choppy = 1 }) {
  const W = w || size, D = d || size;
  const sx = Math.max(1, seg), sz = Math.max(1, Math.round(seg * (D / W)));
  const g = new THREE.PlaneGeometry(W, D, sx, sz);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  const depth = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + center[0], z = pos.getZ(i) + center[1];
    pos.setXYZ(i, x, level, z);
    depth[i] = Math.max(0, level - heightAt(x, z));
  }
  g.setAttribute('depth', new THREE.BufferAttribute(depth, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: shared.uTime, uDeep: { value: new THREE.Color(deep) }, uShallow: { value: new THREE.Color(shallow) }, uFoam: { value: new THREE.Color(foam) },
      uSky: { value: new THREE.Color(0x9ab7d0) }, uSun: { value: new THREE.Vector3(0.4, 0.8, 0.3) }, uFogColor: { value: new THREE.Color(0x9ab7d0) }, uFogDensity: { value: 0.0015 },
      uOpacity: { value: opacity }, uSpeed: { value: speed }, uChoppy: { value: choppy }, uLight: { value: 1 },
    },
    vertexShader: `attribute float depth; varying float vDepth; varying vec3 vW; void main(){ vDepth = depth; vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `
      uniform float uTime, uOpacity, uSpeed, uChoppy, uLight, uFogDensity; uniform vec3 uDeep, uShallow, uFoam, uSky, uSun, uFogColor;
      varying float vDepth; varying vec3 vW;
      float h(vec2 p){ return sin(p.x*0.9+uTime*uSpeed*1.3)*0.5 + sin(p.y*1.2-uTime*uSpeed)*0.5 + sin((p.x+p.y)*0.55+uTime*uSpeed*0.7)*0.5; }
      void main(){
        vec2 p = vW.xz * 0.35;
        float e = 0.08;
        vec2 grad = vec2(h(p+vec2(e,0.))-h(p-vec2(e,0.)), h(p+vec2(0.,e))-h(p-vec2(0.,e))) / (2.*e) * 0.06 * uChoppy;
        vec3 n = normalize(vec3(-grad.x, 1.0, -grad.y));
        vec3 V = normalize(cameraPosition - vW);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        float d = clamp(vDepth / 7.0, 0.0, 1.0);
        vec3 base = mix(uShallow, uDeep, pow(d, 0.7));
        vec3 R = reflect(-V, n);
        float spec = pow(max(dot(R, normalize(uSun)), 0.0), 90.0) * 0.9;
        vec3 col = mix(base, uSky, fres * 0.55) * uLight + vec3(spec) * uLight;
        float foamLine = smoothstep(1.25, 0.0, vDepth) * (0.55 + 0.45 * sin(vDepth*9.0 - uTime*uSpeed*1.6 + vW.x*0.3));
        float brk = 0.5 + 0.5 * sin(vW.x*0.83 + uTime*0.6) * sin(vW.z*1.07 - uTime*0.45) + 0.25 * sin((vW.x - vW.z)*2.3 + uTime);
        foamLine *= mix(0.15, 0.85, clamp(brk, 0.0, 1.0)) * 0.7; // broken, softer surf instead of hard white rings
        col = mix(col, uFoam * uLight, clamp(foamLine, 0.0, 0.85));
        float a = uOpacity * mix(0.55, 1.0, smoothstep(0.0, 1.2, vDepth));
        float fd = length(vW - cameraPosition);
        float fog = 1.0 - exp(-uFogDensity*uFogDensity*fd*fd);
        col = mix(col, uFogColor, fog);
        gl_FragColor = vec4(col, a);
      }`,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.renderOrder = 2;
  mesh.userData.isWater = true;
  return mesh;
}

/** Cheap lakes/moats/canals: a flat water quad with the same shader (depth fixed). */
export function waterPatch(opts) {
  const m = water({ ...opts, heightAt: () => opts.level - (opts.depth ?? 4), seg: opts.seg ?? 4 });
  return m;
}
