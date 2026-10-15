// Post-processing: HDR render → sanitize → bloom → 80s grade (cool fluorescent green-white,
// smoky haze veil, contrast, vignette, grain; panic pushes contrast and a red cast) →
// OutputPass (tone mapping + sRGB).
//
// Usage (main.js):
//   import { createPostFX } from './postfx.js';
//   const fx = createPostFX(renderer, scene, camera, preset);
//   addEventListener('resize', () => fx.setSize(innerWidth, innerHeight));   // after renderer.setSize
//   // each frame, instead of renderer.render(scene, camera):
//   fx.setPanic(playing ? sim.panic : 0);
//   fx.render(dt);
//
// Quality 'low' returns a passthrough that just calls renderer.render. The composer follows
// renderer.getPixelRatio() on its own, so FrameGovernor keeps working unchanged.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

// Replace NaN/Inf and clamp HDR so a single bad pixel can't blow the bloom chain up into
// black or white squares.
const SanitizeShader = {
  uniforms: { tDiffuse: { value: null }, uMax: { value: 24 } },
  vertexShader: VERT,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uMax; varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      bvec4 bad = bvec4(isnan(c.r) || c.r != c.r, isnan(c.g) || c.g != c.g, isnan(c.b) || c.b != c.b, isnan(c.a) || c.a != c.a);
      c = vec4(bad.r ? 0.0 : c.r, bad.g ? 0.0 : c.g, bad.b ? 0.0 : c.b, bad.a ? 1.0 : c.a);
      c.rgb = clamp(c.rgb, vec3(0.0), vec3(uMax));
      gl_FragColor = c;
    }`,
};

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null }, uTime: { value: 0 }, uPanic: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) }, uVignette: { value: 0.32 }, uGrain: { value: 0.04 },
  },
  vertexShader: VERT,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uTime, uPanic, uVignette, uGrain; uniform vec2 uRes;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      // Cool-white fluorescent balance with a faint green spike, slightly desaturated.
      c = mix(vec3(l), c, 0.9 + uPanic * 0.3);
      c *= vec3(0.95, 1.02, 0.97);
      // Smoke/haze veil: lifts the blacks toward a grey-green and softens the shadows.
      c = c * 0.94 + vec3(0.016, 0.021, 0.018) * (1.0 - uPanic * 0.4);
      c += vec3(0.004, 0.007, 0.005) * (1.0 - smoothstep(0.0, 0.1, l));
      // Contrast around mid-grey in log space; panic adds punch and a red cast.
      vec3 lc = log2(max(c, vec3(1e-5)) / 0.18);
      c = 0.18 * exp2(lc * (1.05 + uPanic * 0.2));
      c = mix(c, c * vec3(1.22, 0.84, 0.8), uPanic * 0.55);
      // Vignette (aspect-correct), slightly stronger in a panic.
      vec2 d = vUv - 0.5; d.x *= uRes.x / uRes.y;
      float v = smoothstep(1.05, 0.3, length(d));
      c *= mix(1.0 - uVignette - uPanic * 0.12, 1.0, v);
      // Animated grain, scaled for perceptual evenness.
      float n = hash(floor(vUv * uRes) + fract(uTime * 7.31) * 113.0) - 0.5;
      c += n * uGrain * (sqrt(max(l, 0.0)) + 0.015);
      gl_FragColor = vec4(max(c, vec3(0.0)), 1.0);
    }`,
};

export function createPostFX(renderer, scene, camera, quality) {
  if (!quality || quality.name === 'low') {
    return { render() { renderer.render(scene, camera); }, setSize() {}, setPanic() {}, composer: null };
  }
  const size = renderer.getSize(new THREE.Vector2());
  let pr = renderer.getPixelRatio();
  const rt = new THREE.WebGLRenderTarget(Math.floor(size.x * pr), Math.floor(size.y * pr), {
    type: THREE.HalfFloatType,
    samples: renderer.capabilities.isWebGL2 === false ? 0 : 4,
  });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(pr);
  composer.setSize(size.x, size.y);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new ShaderPass(SanitizeShader));
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), quality.name === 'high' ? 0.42 : 0.36, 0.55, 0.92);
  composer.addPass(bloom);
  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);
  composer.addPass(new OutputPass());
  let w = size.x, h = size.y, panic = 0, t = 0;
  const setSize = (W, H) => {
    w = W; h = H;
    composer.setSize(W, H);
    grade.uniforms.uRes.value.set(W * pr, H * pr);
  };
  setSize(w, h);
  return {
    composer, bloom, grade,
    render(dt = 1 / 60) {
      const now = renderer.getPixelRatio();
      if (now !== pr) { pr = now; composer.setPixelRatio(pr); setSize(w, h); }
      t += dt;
      grade.uniforms.uTime.value = t;
      grade.uniforms.uPanic.value = panic;
      bloom.strength = (quality.name === 'high' ? 0.42 : 0.36) + panic * 0.15;
      composer.render(dt);
    },
    setSize,
    setPanic(p) { panic = Math.max(0, Math.min(1, p || 0)); },
  };
}
