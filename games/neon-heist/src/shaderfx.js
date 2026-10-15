import * as THREE from 'three';
import { B, W, N } from './util.js';
import { VD } from './viaduct.js';

// Shared uniforms driven from City.update().
export const FX = { night: { value: 0 }, time: { value: 0 } };

/* ---------- height fog: thicker near the ground, thinner up the towers ---------- */
export function installHeightFog() {
  const C = THREE.ShaderChunk;
  C.fog_pars_vertex = '#ifdef USE_FOG\n varying float vFogDepth; varying float vFogH;\n#endif';
  C.fog_vertex = `#ifdef USE_FOG
    vFogDepth = - mvPosition.z;
    vFogH = ( inverse( viewMatrix ) * vec4( mvPosition.xyz, 1.0 ) ).y; // works for meshes, instances, points and sprites
  #endif`;
  C.fog_pars_fragment = `#ifdef USE_FOG
    uniform vec3 fogColor; varying float vFogDepth; varying float vFogH;
    #ifdef FOG_EXP2
      uniform float fogDensity;
    #else
      uniform float fogNear; uniform float fogFar;
    #endif
  #endif`;
  C.fog_fragment = `#ifdef USE_FOG
    #ifdef FOG_EXP2
      float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
    #else
      float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
      float hFog = exp( - max( vFogH, 0.0 ) * 0.02 );
      fogFactor = clamp( fogFactor * ( 0.5 + 0.5 * hFog ) + hFog * 0.32 * smoothstep( fogNear * 0.35, fogFar, vFogDepth ), 0.0, 1.0 );
    #endif
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
  #endif`;
}

/* ---------- analytic street lamps + interior-mapped windows ---------- */
const LAMP_GLSL = () => `
uniform float uNight; uniform float uTime;
varying vec3 vWP; varying vec3 vWN;
float h12(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec3 lampAt(vec3 h, vec3 p, vec3 n){
  vec3 L = h - p; float d2 = dot(L, L), d = sqrt(d2); L /= d;
  float win = clamp(1.0 - pow(d / 27.0, 4.0), 0.0, 1.0);
  return vec3(max(dot(n, L), 0.0) * smoothstep(0.12, 0.55, L.y) * win * win / (1.0 + d2 / 45.0));
}
vec3 streetLamps(vec3 p, vec3 n){
  vec3 acc = vec3(0.0);
  if (p.y < 8.0) {
    vec2 c = floor(p.xz / ${B.toFixed(1)} + 0.5) * ${B.toFixed(1)};
    for (int k = 0; k < 4; k++) {
      vec2 s = vec2(k == 0 || k == 2 ? -1.0 : 1.0, k < 2 ? -1.0 : 1.0);
      vec2 corner = c + s * 12.0;
      if (corner.x > 0.0 && corner.x < ${W.toFixed(1)} && corner.y > 0.0 && corner.y < ${W.toFixed(1)}) acc += lampAt(vec3(c.x + s.x * 10.8, 8.15, c.y + s.y * 10.8), p, n);
    }
    // mid-block lamps: one per road segment at 74 m along, alternating sides
    for (int a = 0; a < 2; a++) {
      vec2 q = a == 0 ? p.xz : p.zx;                       // q.x along the road, q.y across
      float k = floor(q.y / ${B.toFixed(1)} + 0.5), i = floor((q.x - 14.0) / ${B.toFixed(1)});
      if (i < 0.0 || i > ${(N - 1).toFixed(1)} || k < 0.0 || k > ${N.toFixed(1)} || (a == 1 && i == 8.0)) continue;
      float sd = mod(i + k, 2.0) > 0.5 ? 1.0 : -1.0, across = k * ${B.toFixed(1)} + sd * 12.0;
      if (across < 0.0 || across > ${W.toFixed(1)}) continue;
      vec2 h = vec2(i * ${B.toFixed(1)} + 74.0, k * ${B.toFixed(1)} + sd * 10.3);
      acc += lampAt(a == 0 ? vec3(h.x, 8.15, h.y) : vec3(h.y, 8.15, h.x), p, n);
    }
  } else if (abs(p.z - ${VD.zc.toFixed(1)}) < 30.0) {
    float kf = floor((p.x - ${(VD.xb + 20).toFixed(1)}) / 40.0 + 0.5);
    for (int j = -1; j <= 1; j++) {
      float k = kf + float(j);
      if (k < 0.0 || k > 23.0 || k == 12.0) continue;
      float s = mod(k, 2.0) > 0.5 ? 1.0 : -1.0;
      acc += lampAt(vec3(${(VD.xb + 20).toFixed(1)} + k * 40.0, ${(VD.y + 8).toFixed(1)}, ${VD.zc.toFixed(1)} + s * 5.0), p, n);
    }
  }
  return acc * vec3(1.0, 0.68, 0.38) * 2.3 * uNight;
}`;

const WINDOW_GLSL = `
vec3 roomLight(vec2 uvc, float glass){
  if (abs(vWN.y) > 0.5) return vec3(0.0);   // roofs / tops share this material
  vec2 cu = uvc * 8.0, cell = floor(cu), f = fract(cu);
  float h = h12(cell + vColor.rg * 97.0 + vWN.xz * 13.7);
  float lit = step(fract(h * 13.1 + uTime * 0.0005), 0.36);
  vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), vWN) + vec3(1e-5));
  vec3 V = normalize(vWP - cameraPosition);
  vec3 rd = vec3(dot(V, T) / 4.0, V.y / 3.5, max(dot(V, -vWN), 0.02) / 4.0);
  rd.x = sign(rd.x) * max(abs(rd.x), 1e-4); rd.y = sign(rd.y) * max(abs(rd.y), 1e-4);
  vec3 tq = vec3((rd.x > 0.0 ? 1.0 - f.x : -f.x) / rd.x, (rd.y > 0.0 ? 1.0 - f.y : -f.y) / rd.y, 1.0 / rd.z);
  float t = min(min(tq.x, tq.y), tq.z); vec3 hp = vec3(f, 0.0) + rd * t;
  vec3 wall = mix(vec3(0.85, 0.78, 0.66), mix(vec3(0.62, 0.7, 0.78), vec3(0.78, 0.74, 0.7), fract(h * 3.7)), fract(h * 5.3));
  vec3 rc;
  if (t == tq.z) { rc = wall; if (hp.y < 0.32 && abs(hp.x - fract(h * 9.1) * 0.6 - 0.2) < 0.22) rc = mix(vec3(0.25, 0.18, 0.14), vec3(0.2, 0.26, 0.34), fract(h * 2.9)); }
  else if (t == tq.y) rc = rd.y > 0.0 ? vec3(1.15) * (1.0 - 0.6 * length(hp.xz - vec2(0.5))) : vec3(0.3, 0.22, 0.16);
  else rc = wall * 0.72;
  rc *= mix(1.0, 0.55, hp.z);
  vec3 tint = fract(h * 7.3) > 0.8 ? vec3(0.72, 0.85, 1.05) : vec3(1.0, 0.78, 0.52);
  return glass * rc * (tint * lit * uNight * 0.6 + 0.07 * (1.0 - uNight) + 0.015);
}`;

// opts.lamps: add street-lamp light; opts.windows: replace baked window glow with per-window rooms.
export function patchMaterial(mat, opts = {}) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uNight = FX.night; sh.uniforms.uTime = FX.time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
    let inj = '';
    if (opts.windows) inj += 'totalEmissiveRadiance += roomLight(vMapUv, 1.0 - smoothstep(0.08, 0.2, texture2D(roughnessMap, vRoughnessMapUv).g));\n';
    if (opts.lamps) inj += 'totalEmissiveRadiance += diffuseColor.rgb * streetLamps(vWP, normalize(vWN));\n';
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', LAMP_GLSL() + (opts.windows ? WINDOW_GLSL : '') + '\nvoid main() {')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + inj);
  };
  mat.customProgramCacheKey = () => 'fx' + (opts.lamps ? 'L' : '') + (opts.windows ? 'W' : '');
  return mat;
}
