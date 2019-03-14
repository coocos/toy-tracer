import { Vector } from "vectorious";

export class Sphere {
  constructor(position, radius) {
    this.position = position;
    this.radius = radius;
  }
  intersect(ray) {
    let distance = 0;
    while (distance < 10) {
      const point = Vector.add(
        ray.origin,
        Vector.scale(ray.direction, distance)
      );
      if (point.subtract(this.position).magnitude() < this.radius) {
        return true;
      }
      distance += 0.25;
    }
    return false;
  }
}

export class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
}
