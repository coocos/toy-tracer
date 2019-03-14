import { Vector } from "vectorious";

export class Sphere {
  constructor(position, radius) {
    this.position = position;
    this.radius = radius;
  }
  intersect(ray) {
    let toSphere = Vector.subtract(this.position, ray.origin);
    let projection = toSphere.dot(ray.direction);

    //Sphere is behind the ray
    if (projection < 0.0) {
      return false;
    }

    let sphereDistance = toSphere.magnitude();
    let distance = Math.sqrt(sphereDistance ** 2 - projection ** 2);
    if (distance > this.radius) {
      return false;
    }

    let h = this.radius ** 2 - distance ** 2;
    if (h < 0) {
      return false;
    }
    h = Math.sqrt(h);

    let firstIntersection = sphereDistance - h;
    let secondIntersection = sphereDistance + h;
    let firstPoint = Vector.add(
      ray.origin,
      Vector.scale(ray.direction, firstIntersection)
    );
    let secondPoint = Vector.add(
      ray.origin,
      Vector.scale(ray.direction, secondIntersection)
    );

    const fromPointToRay = Vector.subtract(firstPoint, ray.origin).normalize();

    if (ray.direction.dot(fromPointToRay)) {
      return true;
    } else {
      return true;
    }
  }
}

export class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
}
