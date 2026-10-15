import * as THREE from 'three';
import { G } from './state.js';
import { clamp, damp, dampAngle, rand } from './util.js';

export const CAM_MODES = ['chase', 'far', 'hood'];
const v = new THREE.Vector3();

export class CameraRig {
  constructor(camera) {
    this.camera = camera; this.yaw = 0; this.pitch = 0.3; this.mode = 0; this.kickV = 0;
    this.pos = new THREE.Vector3(); this.look = new THREE.Vector3(); this.fov = 62; this.inited = false; this.freeLook = 0; this.fwd = new THREE.Vector3();
  }
  cycle() { this.mode = (this.mode + 1) % CAM_MODES.length; return CAM_MODES[this.mode]; }
  kick(a) { this.kickV += a; }
  forward() { return this.camera.getWorldDirection(this.fwd); }

  // Walk the camera in from the target until it clears any building.
  clip(tx, ty, tz, px, py, pz) {
    const city = G.city;
    for (let i = 1; i <= 10; i++) {
      const t = i / 10, x = tx + (px - tx) * t, y = ty + (py - ty) * t, z = tz + (pz - tz) * t;
      if (y < 0.35 || y < city.heightAt(x, z) + 0.2) { const k = Math.max(0.1, (i - 1.6) / 10); return [tx + (px - tx) * k, Math.max(0.5, ty + (py - ty) * k), tz + (pz - tz) * k]; }
    }
    return [px, Math.max(0.5, py), pz];
  }

  update(dt, lx, ly, lookRecent, intro) {
    const pl = G.player, car = pl.car, cam = this.camera;
    if (intro) {
      const a = G.time * 0.12, r = 38;
      this.pos.set(pl.x + Math.cos(a) * r, 15 + Math.sin(G.time * 0.3) * 2, pl.z + Math.sin(a) * r); cam.position.copy(this.pos); cam.lookAt(pl.x, 2, pl.z);
      this.yaw = a + Math.PI; cam.fov = 55; cam.updateProjectionMatrix(); return;
    }
    const sens = pl.zoom ? 0.3 : 1;
    this.yaw += lx * 0.0024 * sens; this.pitch = clamp(this.pitch + ly * 0.0019 * sens - this.kickV, -0.22, 1.2); this.kickV *= 0.5;
    let tx, ty, tz, dist, shoulder = 0, fov = 62;
    if (car) {
      const speed = Math.abs(car.fw);
      if (lookRecent) this.freeLook = 1.6; else this.freeLook = Math.max(0, this.freeLook - dt);
      if (this.freeLook <= 0) {
        const vel = Math.hypot(car.vx, car.vz) > 5 && car.fw > 0 ? Math.atan2(car.vz, car.vx) : car.a;
        this.yaw = dampAngle(this.yaw, car.fw < -3 ? car.a + Math.PI : vel * 0.45 + car.a * 0.55, 4.2, dt);
        this.pitch = damp(this.pitch, this.mode === 1 ? 0.5 : 0.24, 2.5, dt);
      }
      const mode = CAM_MODES[this.mode];
      if (mode === 'hood') {
        const ca = Math.cos(car.a), sa = Math.sin(car.a);
        tx = car.x + ca * 0.9; tz = car.z + sa * 0.9; ty = 1.25 + car.y;
        const fx = Math.cos(this.yaw), fz = Math.sin(this.yaw);
        this.pos.set(tx, ty + 0.15, tz); cam.position.lerp(this.pos, 1);
        cam.lookAt(tx + fx * 20, 1.1 - (this.pitch - 0.24) * 8, tz + fz * 20); cam.fov = 70 + Math.min(16, speed * 0.4); cam.updateProjectionMatrix(); this.applyShake(); return;
      }
      tx = car.x; ty = 1.2 + car.def.h * 0.35 + car.y; tz = car.z;
      dist = (mode === 'far' ? 12 : 5.6) + car.def.len * 0.45 + Math.min(3.5, speed * 0.08); fov = 62 + Math.min(20, speed * 0.42);
    } else {
      const aim = G.input.mouse[0] || G.input.mouse[2] || pl.aimT > 0;
      tx = pl.x; ty = 1.55 + pl.jumpY * 0.6; tz = pl.z; dist = aim ? 3.3 : pl.sprint ? 5.4 : 4.6; shoulder = aim ? 0.9 : 0.5; fov = aim ? 54 : pl.sprint ? 66 : 60;
      if (pl.zoom) { dist = 1.2; shoulder = 0.1; fov = 20; }
      if (pl.inside) { dist *= 0.6; shoulder *= 0.6; }
    }
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch), cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    let px = tx - cy * cp * dist + -sy * shoulder, py = ty + sp * dist + 0.4, pz = tz - sy * cp * dist + cy * shoulder;
    [px, py, pz] = this.clip(tx, ty, tz, px, py, pz);
    if (!this.inited) { this.pos.set(px, py, pz); this.inited = true; }
    const k = car ? 12 : 22; this.pos.x = damp(this.pos.x, px, k, dt); this.pos.y = damp(this.pos.y, py, k, dt); this.pos.z = damp(this.pos.z, pz, k, dt);
    cam.position.copy(this.pos);
    // aim point: far ahead along the view yaw/pitch so the crosshair matches the shot direction
    cam.lookAt(this.pos.x + cy * cp * 30 - 0 * sy, this.pos.y - sp * 30, this.pos.z + sy * cp * 30);
    this.fov = damp(this.fov, fov, pl.zoom ? 14 : 5, dt); cam.fov = this.fov; cam.updateProjectionMatrix();
    this.applyShake();
  }
  applyShake() {
    const s = G.fx.shake; if (s <= 0.01) return;
    this.camera.position.x += rand(-1, 1) * s * 0.35; this.camera.position.y += rand(-1, 1) * s * 0.35; this.camera.position.z += rand(-1, 1) * s * 0.35;
  }
}
