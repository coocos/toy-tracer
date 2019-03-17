import { Vector } from "vectorious";

export class Sphere {
  constructor(position, radius, color) {
    this.position = position;
    this.radius = radius;
    this.color = color;
  }
  normal(point) {
    return Vector.subtract(point, this.position).normalize();
  }
  intersect(ray) {
    let toSphere = Vector.subtract(this.position, ray.origin);
    let projection = toSphere.dot(ray.direction);

    //Sphere is behind the ray
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
    let firstPoint = Vector.add(
      ray.origin,
      Vector.scale(ray.direction, firstIntersection)
    );
    const fromPointToRay = Vector.subtract(firstPoint, ray.origin).normalize();

    if (ray.direction.dot(fromPointToRay)) {
      return firstPoint;
    } else {
      let secondPoint = Vector.add(
        ray.origin,
        Vector.scale(ray.direction, secondIntersection)
      );
      return secondPoint;
    }
  }
}

export class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }

  reflect(normal) {
    //Returns the direction vector of the ray reflected around a normal.

    //To understand how this works see for example: https://www.3dkingdoms.com/weekly/weekly.php?a=2
    const projection = Vector.scale(normal, this.direction.dot(normal) * -2);
    return projection.add(this.direction);
  }
}
