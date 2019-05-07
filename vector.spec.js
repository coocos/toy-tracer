import { expect } from "chai";
import { Vector } from "./math";

describe("Vector operation", () => {
  it("should add two vectors", () => {
    const vec1 = new Vector(1, 2, 3);
    const vec2 = new Vector(2, 3, 4);
    const added = vec1.add(vec2);
    expect(added.x).to.equal(3);
    expect(added.y).to.equal(5);
    expect(added.z).to.equal(7);
  });
  it("should subtract two vectors", () => {
    const vec1 = new Vector(1, 2, 3);
    const vec2 = new Vector(2, 3, 4);
    const subtracted = vec1.subtract(vec2);
    expect(subtracted.x).to.equal(-1);
    expect(subtracted.y).to.equal(-1);
    expect(subtracted.z).to.equal(-1);
  });
  it("should multiply vector by a scalar", () => {
    const vec = new Vector(1, 2, 3);
    const scaled = vec.scale(2);
    expect(scaled.x).to.equal(2);
    expect(scaled.y).to.equal(4);
    expect(scaled.z).to.equal(6);
  });
  it("should return the vector magnitude", () => {
    const vec = new Vector(1, 2, 3);
    const magnitude = vec.magnitude();
    expect(magnitude).to.equal(Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2));
  });
  it("should return the vector components as an array", () => {
    const vec = new Vector(1, 2, 3);
    expect(vec.toArray()).to.deep.equal([1, 2, 3]);
  });
  it("should normalize the vector", () => {
    const vec = new Vector(1, 2, 3);
    const expected = new Vector(
      1 / vec.magnitude(),
      2 / vec.magnitude(),
      3 / vec.magnitude()
    );
    const normalized = vec.normalize();
    expect(normalized.x).to.equal(expected.x);
    expect(normalized.y).to.equal(expected.y);
    expect(normalized.z).to.equal(expected.z);
  });
  it("should compute the dot product", () => {
    const vec1 = new Vector(1, 2, 3);
    const vec2 = new Vector(2, 3, 4);
    expect(vec1.dot(vec2)).to.equal(1 * 2 + 2 * 3 + 3 * 4);
  });
});
