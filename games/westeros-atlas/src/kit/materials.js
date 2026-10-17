// World-space (triplanar) textured materials. Works on merged batches AND instanced meshes, so a wall
// reads as one continuous stone surface regardless of how it was assembled. Colour = tint x texture x vertex colour.
import * as THREE from 'three';
import { texture } from './textures.js';

/** Uniforms shared by every kit material (snow cover, night glow, time). */
export const shared = {
  uSnow: { value: 0 },
  uTime: { value: 0 },
};
const cache = new Map();
const glowMats = [];

export function tri(kind = 'stone', opts = {}) {
  const { color = 0xffffff, scale = 6, rough = 0.92, metal = 0, snow = true, emissive = 0, side = THREE.FrontSide, flat = false, bump = 0.9 } = opts;
  const key = `tri|${kind}|${color}|${scale}|${rough}|${metal}|${snow}|${emissive}|${side}|${flat}|${bump}`;
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, vertexColors: true, side, flatShading: flat });
  if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = 0.6; }
  const tex = texture(kind);
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTri = { value: tex };
    sh.uniforms.uTriScale = { value: 1 / scale };
    sh.uniforms.uSnow = shared.uSnow;
    sh.uniforms.uSnowOn = { value: snow ? 1 : 0 };
    sh.uniforms.uBump = { value: bump };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNor;')
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        vec3 wn_ = objectNormal;
        #ifdef USE_INSTANCING
          wn_ = mat3(instanceMatrix) * wn_;
        #endif
        vWNor = normalize(mat3(modelMatrix) * wn_);`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wp_ = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp_ = instanceMatrix * wp_;
        #endif
        vWPos = (modelMatrix * wp_).xyz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNor;\nuniform sampler2D uTri;\nuniform float uTriScale;\nuniform float uSnow;\nuniform float uSnowOn;\nuniform float uBump;\nfloat hgt_ = 0.5; float sn_ = 0.0;')
      .replace('#include <map_fragment>', `
        vec3 nrmW_ = normalize(vWNor);
        vec3 bw_ = pow(abs(nrmW_), vec3(4.0)); bw_ /= (bw_.x + bw_.y + bw_.z + 1e-4);
        vec3 tx_ = texture2D(uTri, vWPos.zy * uTriScale).rgb;
        vec3 ty_ = texture2D(uTri, vWPos.xz * uTriScale).rgb;
        vec3 tz_ = texture2D(uTri, vWPos.xy * uTriScale).rgb;
        vec3 tcol_ = tx_ * bw_.x + ty_ * bw_.y + tz_ * bw_.z;
        // large-scale tonal drift + two detail octaves break up repetition
        vec3 mac_ = texture2D(uTri, vWPos.xz * uTriScale * 0.11 + vWPos.y * 0.013).rgb;
        vec3 det_ = texture2D(uTri, (vWPos.xz + vWPos.yy) * uTriScale * 2.7).rgb;
        tcol_ *= mix(vec3(0.82), vec3(1.12), mac_.r) * mix(vec3(0.9), vec3(1.08), det_.g);
        hgt_ = dot(tcol_, vec3(0.333));
        // ground-contact darkening + soft height gradient (cheap ambient occlusion feel)
        float ao_ = mix(0.62, 1.0, smoothstep(-1.0, 5.0, vWPos.y)) * mix(1.0, 1.08, smoothstep(5.0, 40.0, vWPos.y));
        diffuseColor.rgb *= tcol_ * ao_;
        float sn_ = smoothstep(0.45, 0.85, nrmW_.y) * uSnow * uSnowOn;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.94, 1.0) * (0.92 + 0.08 * hgt_), sn_);`)
      .replace('#include <normal_fragment_maps>', `
        {
          vec3 dpdx_ = dFdx(-vViewPosition), dpdy_ = dFdy(-vViewPosition);
          float dhx_ = dFdx(hgt_), dhy_ = dFdy(hgt_);
          vec3 r1_ = cross(dpdy_, normal), r2_ = cross(normal, dpdx_);
          float det2_ = dot(dpdx_, r1_);
          vec3 grad_ = sign(det2_) * (dhx_ * r1_ + dhy_ * r2_);
          normal = normalize(abs(det2_) * normal - uBump * grad_ * (1.0 - sn_ * 0.8));
        }`);
  };
  m.customProgramCacheKey = () => key;
  cache.set(key, m);
  return m;
}

/** Plain vertex-coloured standard material (no texture). */
export function flat(color = 0xffffff, opts = {}) {
  const { rough = 0.9, metal = 0, side = THREE.FrontSide, emissive = 0, flatShading = true, transparent = false, opacity = 1 } = opts;
  const key = `flat|${color}|${rough}|${metal}|${side}|${emissive}|${flatShading}|${transparent}|${opacity}`;
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, vertexColors: true, side, flatShading, transparent, opacity });
  if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = 0.5; }
  cache.set(key, m);
  return m;
}

/** Unlit-ish emissive material for windows, braziers, lanterns. Brightens at night via setNight(). */
export function glow(color = 0xffc870, strength = 1) {
  const key = `glow|${color}|${strength}`;
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, fog: true });
  m.userData.base = new THREE.Color(color); m.userData.strength = strength;
  m.color.copy(m.userData.base).multiplyScalar(0.18);
  glowMats.push(m); cache.set(key, m);
  return m;
}
const dimColors = []; // [Color, baseColor] pairs for unlit things (clouds, smoke) that must darken at night
/** Register an unlit colour so it darkens with the night factor (clouds, smoke, mist). */
export function dimAtNight(color) { dimColors.push([color, color.clone()]); return color; }
export function setNight(n) {
  for (const m of glowMats) m.color.copy(m.userData.base).multiplyScalar(0.14 + 1.25 * n * m.userData.strength);
  for (const [c, base] of dimColors) c.copy(base).multiplyScalar(1 - 0.78 * n);
}

export function basic(color = 0xffffff, opts = {}) {
  const key = `basic|${color}|${JSON.stringify(opts)}`;
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.MeshBasicMaterial({ color, vertexColors: true, ...opts });
  cache.set(key, m); return m;
}

export function disposeAllMaterials() { /* materials are shared across scenes on purpose */ }
export const M = { tri, flat, glow, basic, setNight };
