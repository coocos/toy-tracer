export class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  subtract(vec) {
    return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z);
  }

  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z);
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  scale(scalar) {
    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  normalize() {
    const magnitude = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    return new Vector(
      this.x / magnitude,
      this.y / magnitude,
      this.z / magnitude
    );
  }

  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  /**
   * Returns a random unit vector. Vectors are randomly picked
   * from a pool of precomputed unit vectors for performancer reasons.
   *
   * @return {Vector} Random unit vector
   */
  static randomUnitVector() {
    return randomUnitVectors[
      Math.floor(Math.random() * randomUnitVectors.length)
    ];
  }
}

/**
 * Returns random number between -1 and 1
 * @return {Number} random number between -1 and 1
 */
function randomValue(range = 1) {
  return Math.random() * (Math.random() > 0.5 ? -range : range);
}

// An array of precomputed random unit vectors
const randomUnitVectors = (() => {
  const vectors = [];
  while (vectors.length < 512) {
    vectors.push(
      new Vector(randomValue(), randomValue(), randomValue()).normalize()
    );
  }
  return vectors;
})();

export class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }

  /**
   * Reflects ray around a normal. See Scratchapixel for the
   * explanation of how to derive the mathematical equations for
   * computing the reflected ray:
   *
   * https://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-shading/reflection-refraction-fresnel
   *
   * @param {Vector} normal - normal to reflect ray around
   * @return {Vector} Ray direction after reflection
   */
  reflect(normal) {
    const projection = normal.scale(this.direction.dot(normal) * -2);
    return projection.add(this.direction);
  }

  /**
   * Refracts ray using a surface normal. See Scratchapixel for the
   * explanation of how to derive the mathematical equations for
   * computing the refracted ray:
   *
   * https://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-shading/reflection-refraction-fresnel
   *
   * @param {Vector} normal - surface normal
   * @return {Vector} Ray direction after refraction
   */
  refract(normal, refractionIndex = 1.5) {
    let angle = this.direction.dot(normal);
    let refractionIndex1 = 1; // Refraction index of air
    let refractionIndex2 = refractionIndex;
    angle = Math.min(1, Math.max(-1, angle));
    if (angle < 0) {
      angle = Math.abs(angle);
    } else {
      // Ray hits the surface from the inside so flip everything
      let temp = refractionIndex1;
      refractionIndex1 = refractionIndex2;
      refractionIndex2 = temp;
      normal = normal.scale(-1);
    }

    const refractionRatio = refractionIndex1 / refractionIndex2;
    const k = 1 - refractionRatio ** 2 * (1 - angle ** 2);

    // If k is negative then total internal reflection prevents refraction
    if (k >= 0) {
      return this.direction
        .scale(refractionRatio)
        .add(normal.scale(angle * refractionRatio - Math.sqrt(k)));
    }
  }
}
