// Base for everything that lives in the world and can be drawn depth-sorted.
export class Entity {
  constructor(kind) { this.kind = kind; this.id = 0; this.x = 0; this.y = 0; this.r = 8; this.removed = false; }
  get sortY() { return this.y; }
  update() {}
  draw() {}
}
