import { Vector } from "vectorious";

export class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }

  reflect(normal) {
    // To understand how this works see for example: https://www.3dkingdoms.com/weekly/weekly.php?a=2
    const projection = Vector.scale(normal, this.direction.dot(normal) * -2);
    return projection.add(this.direction);
  }
}
