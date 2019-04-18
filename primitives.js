import { Vector } from "./math";

export class Sphere {
  constructor(
    position,
    radius,
    { color, glossiness = 1024.0, reflectivity = 0.0 }
  ) {
    this.position = position;
    this.radius = radius;
    this.material = {
      color,
      glossiness,
      reflectivity
    };
  }
  normal(point) {
    return point.subtract(this.position).normalize();
  }
  static deserialize(position, radius, material) {
    return new Sphere(new Vector(...position), radius, {
      color: new Vector(...material.color),
      glossiness: material.glossiness,
      reflectivity: material.reflectivity
    });
  }
  serialize() {
    return {
      position: this.position.toArray(),
      radius: this.radius,
      material: {
        color: this.material.color.toArray(),
        glossiness: this.material.glossiness,
        reflectivity: this.material.reflectivity
      }
    };
  }
  intersect(ray) {
    let toSphere = this.position.subtract(ray.origin);
    let projection = toSphere.dot(ray.direction);

    // Sphere is behind the ray
    if (projection < 0.0) {
      return;
    }

    let sphereDistance = toSphere.magnitude();
    let distance = Math.sqrt(sphereDistance ** 2 - projection ** 2);
    if (distance > this.radius) {
      return;
    }

    let h = this.radius ** 2 - distance ** 2;
    if (h < 0) {
      return;
    }
    h = Math.sqrt(h);

    let firstIntersection = sphereDistance - h;
    let secondIntersection = sphereDistance + h;
    let firstPoint = ray.origin.add(ray.direction.scale(firstIntersection));
    const fromPointToRay = firstPoint.subtract(ray.origin).normalize();

    if (ray.direction.dot(fromPointToRay)) {
      return firstPoint;
    } else {
      let secondPoint = ray.origin.add(ray.direction.scale(secondIntersection));
      return secondPoint;
    }
  }
}
