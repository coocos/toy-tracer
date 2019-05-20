import { expect } from "chai";
import { Ray, Vector } from "./math";
import { Rectangle, Material } from "./primitives";

describe("Rectangle", () => {
  it("should map constructor arguments to attributes", () => {
    const position = new Vector(0, 0, 0);
    const normal = new Vector(0, 1, 0);
    const color = new Vector(255, 0, 0);
    const size = 5;

    const rectangle = new Rectangle(position, normal, size, { color });
    expect(rectangle.position).to.equal(position);
    expect(rectangle.size).to.equal(size);
    expect(rectangle.material.color).to.equal(color);
  });
  it("should return intersection when ray intersects rectangle", () => {
    const position = new Vector(0, 0, 5);
    const normal = new Vector(0, 0, -1);
    const color = new Vector(255, 0, 0);
    const size = 5;

    const rectangle = new Rectangle(position, normal, size, { color });
    let ray = new Ray(new Vector(0, 0, 0), new Vector(0, 0, 1));
    let intersection = rectangle.intersect(ray);

    expect(intersection.toArray()).to.deep.equal([0, 0, 5]);

    ray = new Ray(new Vector(4, 0, 0), new Vector(0, 0, 1));
    intersection = rectangle.intersect(ray);
    expect(intersection.toArray()).to.deep.equal([4, 0, 5]);
  });
  it("should return undefined when ray does not intersect rectangle", () => {
    const position = new Vector(0, 0, 5);
    const normal = new Vector(0, 0, -1);
    const color = new Vector(255, 0, 0);
    const size = 5;

    const rectangle = new Rectangle(position, normal, size, { color });
    const ray = new Ray(new Vector(5.5, 0, 0), new Vector(0, 0, 1));

    const intersection = rectangle.intersect(ray);
    expect(intersection).to.be.undefined;
  });
});
