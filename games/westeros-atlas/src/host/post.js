// Post-processing: HDR render target (MSAA) -> optional soft bloom -> tone map/sRGB -> film grade (contrast, split-tone, vignette, grain).
// Created lazily per quality tier; 'low' bypasses the composer entirely.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uVig: { value: 0.32 }, uSat: { value: 1.08 }, uContrast: { value: 1.07 }, uGrain: { value: 0.025 }, uWarm: { value: new THREE.Vector3(1.0, 0.82, 0.58) }, uCool: { value: new THREE.Vector3(0.45, 0.62, 0.95) }, uWarmAmt: { value: 0.5 }, uCoolAmt: { value: 0.5 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime, uVig, uSat, uContrast, uGrain, uWarmAmt, uCoolAmt; uniform vec3 uWarm, uCool; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      c = (c - 0.5) * uContrast + 0.5;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, uSat);
      c += uCool * (1.0 - smoothstep(0.0, 0.55, l)) * 0.07 * uCoolAmt;       // cool shadows
      c += uWarm * smoothstep(0.45, 1.0, l) * 0.06 * uWarmAmt;                // warm highlights
      float d = length((vUv - 0.5) * vec2(1.15, 1.0));
      c *= 1.0 - uVig * smoothstep(0.38, 0.92, d);
      c += (hash(vUv * 1500.0 + fract(uTime)) - 0.5) * uGrain;
      gl_FragColor = vec4(max(c, 0.0), 1.0);
    }`,
};

export class Post {
  constructor(renderer, scene, camera) {
    this.renderer = renderer; this.scene = scene; this.camera = camera; this.mode = 'none'; this.composer = null;
  }
  /** mode: 'none' | 'grade' | 'full' */
  setMode(mode, w, h, pr) {
    if (mode === this.mode && this.composer) { this.setSize(w, h, pr); return; }
    this.dispose(); this.mode = mode; if (mode === 'none') return;
    const size = new THREE.Vector2(w, h);
    const rt = new THREE.WebGLRenderTarget(w * pr, h * pr, { type: THREE.HalfFloatType, samples: mode === 'full' ? 4 : 2 });
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    if (mode === 'full') { this.bloom = new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.32, 0.7, 0.88); this.composer.addPass(this.bloom); }
    this.composer.addPass(new OutputPass());
    this.grade = new ShaderPass(GradeShader); this.composer.addPass(this.grade);
    this.setSize(w, h, pr);
  }
  setSize(w, h, pr) { if (!this.composer) return; this.composer.setPixelRatio(pr); this.composer.setSize(w, h); }
  /** drive grading from the atmosphere state */
  applyAtmosphere(s) {
    if (!this.grade) return; const u = this.grade.uniforms;
    u.uWarmAmt.value = 1 - s.night * 0.8; u.uCoolAmt.value = 0.4 + s.night * 0.9; u.uVig.value = 0.3 + s.night * 0.12;
    if (this.bloom) { this.bloom.strength = 0.26 + s.night * 0.5; this.bloom.threshold = 0.9 - s.night * 0.25; }
  }
  render(time) { if (this.grade) this.grade.uniforms.uTime.value = time; this.composer.render(); }
  dispose() { if (this.composer) { this.composer.dispose?.(); this.composer = null; } this.bloom = null; this.grade = null; this.mode = 'none'; }
}
