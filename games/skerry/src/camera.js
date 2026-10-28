import * as THREE from 'three';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Tilted three-quarter view that drifts to keep the island framed until the player takes over.
export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.target = new THREE.Vector3();
    this.goal = new THREE.Vector3();
    this.dist = this.goalDist = 15;
    this.az = this.goalAz = 0;
    this.polar = 0.9;
    this.userMoved = false;
    this.userZoomed = false;
    this.spin = 0;
  }

  // Distance that fits the island plus its ring of open slots, in both directions of the screen.
  fitDist(radius) {
    const r = radius + 1.2;
    const vf = (this.camera.fov * Math.PI) / 360;
    const hf = Math.atan(Math.tan(vf) * this.camera.aspect);
    const vDist = (r * Math.cos(this.polar)) / Math.tan(vf) + r * 1.15; // ground is foreshortened vertically
    const hDist = (r - 0.4) / Math.tan(hf);
    return clamp(Math.max(vDist, hDist, 11), 11, 60);
  }

  frame(center, radius, force = false) {
    // on tall screens, aim a little above centre so the island clears the dock
    const nudge = this.camera.aspect < 0.8 ? 1.2 : 0;
    if (force || !this.userMoved) this.goal.set(center.x + Math.sin(this.az) * nudge, 0, center.z + Math.cos(this.az) * nudge);
    if (force || !this.userZoomed) this.goalDist = this.fitDist(radius);
    if (force) { this.userMoved = false; this.userZoomed = false; }
  }

  pan(dx, dy, viewH) {
    const k = (2 * this.dist * Math.tan((this.camera.fov * Math.PI) / 360)) / viewH;
    const rx = Math.cos(this.az), rz = -Math.sin(this.az);
    const fx = -Math.sin(this.az), fz = -Math.cos(this.az);
    const ox = -dx * k * rx + dy * k * 1.45 * fx;
    const oz = -dx * k * rz + dy * k * 1.45 * fz;
    this.goal.x += ox; this.goal.z += oz;
    this.target.x += ox; this.target.z += oz;
    this.userMoved = true;
  }

  zoom(f) {
    this.goalDist = clamp(this.goalDist * f, 6, 60);
    this.userZoomed = true;
  }

  turn(steps) { this.goalAz += steps * (Math.PI / 6); }

  update(dt) {
    const k = 1 - Math.exp(-dt * 5);
    this.goalAz += this.spin * dt;
    this.target.lerp(this.goal, k);
    this.dist += (this.goalDist - this.dist) * k;
    this.az += (this.goalAz - this.az) * k;
    const s = Math.sin(this.polar) * this.dist;
    this.camera.position.set(this.target.x + s * Math.sin(this.az), Math.cos(this.polar) * this.dist, this.target.z + s * Math.cos(this.az));
    this.camera.lookAt(this.target.x, -0.3, this.target.z);
  }
}
