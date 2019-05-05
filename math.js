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
}

export class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }

  /**
   * Reflects ray around a normal
   *
   * @param {Vector} normal - normal to reflect ray around
   */
  reflect(normal) {
    // To understand how this works see for example: https://www.3dkingdoms.com/weekly/weekly.php?a=2
    const projection = normal.scale(this.direction.dot(normal) * -2);
    return projection.add(this.direction);
  }

  /**
   * Refracts ray using a surface normal
   *
   * @param {Vector} normal - surface normal
   */
  refract(normal) {
    if (this.direction.dot(normal) < 0) {
      return normal.scale(-1);
    } else {
      return normal;
    }
  }
}
