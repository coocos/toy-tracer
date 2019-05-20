import { Vector } from "./math";
import constants from "./constants";

export class Material {
  constructor(
    color = constants.WHITE,
    glossiness = 0,
    reflectivity = 0,
    transparency = 0
  ) {
    this.color = color;
    this.glossiness = glossiness;
    this.reflectivity = reflectivity;
    this.transparency = transparency;
  }

  serialize() {
    return {
      color: this.color.toArray(),
      glossiness: this.glossiness,
      reflectivity: this.reflectivity,
      transparency: this.transparency
    };
  }

  static deserialize({ color, glossiness, reflectivity, transparency }) {
    return new Material(
      new Vector(...color),
      glossiness,
      reflectivity,
      transparency
    );
  }
}

export class Sphere {
  constructor(position, radius, material = new Material()) {
    this.position = position;
    this.radius = radius;
    this.material = material;
  }
  normal(point) {
    return point.subtract(this.position).normalize();
  }
  static deserialize(position, radius, material) {
    return new Sphere(
      new Vector(...position),
      radius,
      Material.deserialize(material)
    );
  }
  serialize() {
    return {
      type: "Sphere",
      position: this.position.toArray(),
      radius: this.radius,
      material: this.material.serialize()
    };
  }
  intersect(ray) {
    let toSphere = this.position.subtract(ray.origin);
    let projection = toSphere.dot(ray.direction);

    // Sphere is behind the ray
    if (projection < 0) {
      return;
    }

    let sphereDistance = toSphere.magnitude();
    let distance = Math.sqrt(sphereDistance ** 2 - projection ** 2);
    if (distance > this.radius) {
      return;
    }
    let h = Math.sqrt(this.radius ** 2 - distance ** 2);

    let firstIntersection = projection - h;
    let secondIntersection = projection + h;

    // Both intersections are behind the ray
    if (firstIntersection < 0 && secondIntersection < 0) {
      return;
    }

    let firstPoint = ray.origin.add(ray.direction.scale(firstIntersection));
    let secondPoint = ray.origin.add(ray.direction.scale(secondIntersection));

    // Both intersections are valid, return the closest one
    if (firstIntersection > 0 && secondIntersection > 0) {
      return firstIntersection < secondIntersection ? firstPoint : secondPoint;
    } else if (secondIntersection > 0) {
      // Second intersection is hit (happens when ray origin is inside the sphere)
      return secondPoint;
      // First intersection is hit (happens when ray origin is inside the sphere)
    } else if (firstIntersection > 0) {
      return firstPoint;
    }
  }
}

export class Plane {
  constructor(position, normal, material = new Material(), checkered = false) {
    this.position = position;
    this.surfaceNormal = normal;
    this.material = material;
    this.checkered = checkered;
  }
  normal(point) {
    return this.surfaceNormal;
  }
  static deserialize(position, normal, material, checkered) {
    return new Plane(
      new Vector(...position),
      new Vector(...normal),
      Material.deserialize(material),
      checkered
    );
  }
  serialize() {
    return {
      type: "Plane",
      position: this.position.toArray(),
      normal: this.surfaceNormal.toArray(),
      checkered: this.checkered,
      material: material.serialize()
    };
  }
  intersect(ray) {
    // See https://samsymons.com/blog/math-notes-ray-plane-intersection/
    // for an explanation of how to derive the ray-plane intersection point
    const denominator = ray.direction.dot(this.surfaceNormal);
    if (Math.abs(denominator) < constants.epsilon) {
      return;
    }
    const numerator = this.position
      .subtract(ray.origin)
      .dot(this.surfaceNormal);
    const distance = numerator / denominator;

    // If distance is negative then the plane is behind the ray
    if (distance >= 0) {
      return ray.origin.add(ray.direction.scale(distance));
    }
  }
}

export class Rectangle extends Plane {
  constructor(position, normal, size, material = new Material()) {
    super(position, normal, material);
    this.size = size;
  }
  normal(point) {
    return this.surfaceNormal;
  }
  static deserialize(position, normal, size, material) {
    return new Rectangle(
      new Vector(...position),
      new Vector(...normal),
      size,
      Material.deserialize(material)
    );
  }
  serialize() {
    return {
      type: "Rectangle",
      position: this.position.toArray(),
      normal: this.surfaceNormal.toArray(),
      size: this.size,
      material: material.serialize()
    };
  }
  intersect(ray) {
    const intersection = super.intersect(ray);
    if (intersection === undefined) {
      return;
    }

    if (
      Math.abs(intersection.x - this.position.x) < this.size &&
      Math.abs(intersection.y - this.position.y) < this.size &&
      Math.abs(intersection.z - this.position.z) < this.size
    ) {
      return intersection;
    }
  }
}
