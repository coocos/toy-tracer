export class Vector {
  constructor(arr) {
    this.x = arr[0];
    this.y = arr[1];
    this.z = arr[2];
  }

  static subtract(vec1, vec2) {
    return new Vector([vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z]);
  }

  static scale(vec, scalar) {
    return new Vector([vec.x * scalar, vec.y * scalar, vec.z * scalar]);
  }

  static add(vec1, vec2) {
    return new Vector([vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z]);
  }

  subtract(vec) {
    this.x = this.x - vec.x;
    this.y = this.y - vec.y;
    this.z = this.z - vec.z;
    return this;
  }

  add(vec) {
    this.x = this.x + vec.x;
    this.y = this.y + vec.y;
    this.z = this.z + vec.z;
    return this;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  scale(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  normalize() {
    const magnitude = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    return new Vector([
      this.x / magnitude,
      this.y / magnitude,
      this.z / magnitude
    ]);
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
    const projection = Vector.scale(normal, this.direction.dot(normal) * -2);
    return projection.add(this.direction);
  }
}
