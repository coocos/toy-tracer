import { Vector } from "./math";
import constants from "./constants";

export class Material {
  /**
   * Returns a new Material
   *
   * @param {Vector} color - material color
   * @param {Number} glossiness - material glossiness / shininess
   * @param {Number} reflectivity - amount of reflectivity between 0 and 1
   * @param {Number} transparency - amount of refractivity between 0 and 1
   */
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

  /**
   * Serializes the material into a basic object
   *
   * @return {Object} object
   */
  serialize() {
    return {
      color: this.color.toArray(),
      glossiness: this.glossiness,
      reflectivity: this.reflectivity,
      transparency: this.transparency
    };
  }

  /**
   * Deserializes an object into a new Material
   *
   * @param {Object} material - material object
   */
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
  /**
   * Construct a new Sphere
   *
   * @param {Vector} position - sphere position
   * @param {Number} radius - radius of the sphere
   * @param {Material} material - surface material
   */
  constructor(position, radius, material = new Material()) {
    this.position = position;
    this.radius = radius;
    this.material = material;
  }

  /**
   * Returns the surface normal of the sphere at a given point
   *
   * @param {Vector} point - surface point
   * @return {Vector} surface normal
   */
  normal(point) {
    return point.subtract(this.position).normalize();
  }

  /**
   * Deserializes a basic object into a new Sphere
   *
   * @param {Array} position - sphere position
   * @param {Number} radius - radius of the sphere
   * @param {Object} material - material object
   */
  static deserialize(position, radius, material) {
    return new Sphere(
      new Vector(...position),
      radius,
      Material.deserialize(material)
    );
  }

  /**
   * Serializes the sphere into a basic object
   *
   * @return {Object} object
   */
  serialize() {
    return {
      type: "Sphere",
      position: this.position.toArray(),
      radius: this.radius,
      material: this.material.serialize()
    };
  }

  /**
   * Intersects the ray with the sphere and returns the intersection if one exists
   *
   * @param {Ray} ray
   * @return {Vector} intersection point
   */
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
  /**
   * Constructs a new Plane
   *
   * @param {Vector} position - a point on the plane
   * @param {Vector} normal - surface normal
   * @param {Object} material - material object
   * @param {Boolean checkered - whether the plane is checkered or not
   */
  constructor(position, normal, material = new Material(), checkered = false) {
    this.position = position;
    this.surfaceNormal = normal;
    this.material = material;
    this.checkered = checkered;
  }

  /**
   * Returns the surface normal of the plane at a given point
   *
   * @param {Vector} point - surface point
   * @return {Vector} surface normal
   */
  normal(point) {
    return this.surfaceNormal;
  }

  /**
   * Deserializes an object into a new Plane
   *
   * @param {Array} position - a point on the plane
   * @param {Array} normal - surface normal
   * @param {Object} material - material object
   * @param {Boolean checkered - whether the plane is checkered or not
   * @return {Plane} plane
   */
  static deserialize(position, normal, material, checkered) {
    return new Plane(
      new Vector(...position),
      new Vector(...normal),
      Material.deserialize(material),
      checkered
    );
  }

  /**
   * Serializes the plane into a basic object
   *
   * @return {Object} object
   */
  serialize() {
    return {
      type: "Plane",
      position: this.position.toArray(),
      normal: this.surfaceNormal.toArray(),
      checkered: this.checkered,
      material: material.serialize()
    };
  }

  /**
   * Intersects the ray with the plane and returns the intersection if one exists
   *
   * @param {Ray} ray
   * @return {Vector} intersection point
   */
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
  /**
   * Constructs a new Rectangle
   *
   * @param {Vector} position - position of the rectangle
   * @param {Vector} normal - rectangle surface normal
   * @param {Number} size - size of the rectangle
   * @param {Material} material - rectangle material
   */
  constructor(position, normal, size, material = new Material()) {
    super(position, normal, material);
    this.size = size;
  }

  /**
   * Returns the surface normal of the rectangle at a given point.
   *
   * Note that the surface normal of a rectangle is the same at all
   * points of the rectangle.
   *
   * @param {Vector} point - surface point
   * @return {Vector} surface normal
   */
  normal(point) {
    return this.surfaceNormal;
  }

  /**
   * Deserializes a basic object into a new Rectangle
   *
   * @param {Vector} position - position of the rectangle
   * @param {Vector} normal - rectangle surface normal
   * @param {Number} size - size of the rectangle
   * @param {Material} material - rectangle material
   */
  static deserialize(position, normal, size, material) {
    return new Rectangle(
      new Vector(...position),
      new Vector(...normal),
      size,
      Material.deserialize(material)
    );
  }

  /**
   * Returns a random point on the rectangle
   *
   * @return {Vector} random point on the rectangle
   */
  randomPoint() {
    const cross = Vector.randomUnitVector()
      .cross(this.surfaceNormal)
      .normalize()
      .scale(this.size);
    return this.position.add(cross);
  }

  /**
   * Serializes the rectangle into a basic object
   *
   * @return {Object} object
   */
  serialize() {
    return {
      type: "Rectangle",
      position: this.position.toArray(),
      normal: this.surfaceNormal.toArray(),
      size: this.size,
      material: material.serialize()
    };
  }

  /**
   * Intersects the ray with the rectangle and returns the intersection if one exists
   *
   * @param {Ray} ray
   * @return {Vector} intersection point
   */
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
