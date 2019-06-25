import { expect } from "chai";
import { Ray, Vector } from "../src/math";
import { Sphere, Material } from "../src/primitives";

describe("Sphere", () => {
  it("should map constructor arguments to attributes", () => {
    const position = new Vector(0, 0, 0);
    const color = new Vector(255, 0, 0);
    const radius = 5;

    const sphere = new Sphere(position, radius, { color });
    expect(sphere.position).to.equal(position);
    expect(sphere.radius).to.equal(radius);
    expect(sphere.material.color).to.equal(color);
  });
  it("should return correct normal", () => {
    const position = new Vector(0, 0, 0);
    const color = new Vector(255, 0, 0);
    const radius = 5;
    const sphere = new Sphere(position, radius, { color });

    const topPoint = new Vector(0, 5, 0);
    expect(sphere.normal(topPoint).toArray()).to.deep.equal([0, 1, 0]);
    const bottomPoint = new Vector(0, -5, 0);
    expect(sphere.normal(bottomPoint).toArray()).to.deep.equal([0, -1, 0]);
    const sidePoint = new Vector(5, 0, 0);
    expect(sphere.normal(sidePoint).toArray()).to.deep.equal([1, 0, 0]);
  });
  it("should serialize to JSON", () => {
    const position = new Vector(0, 0, 0);
    const color = new Vector(255, 0, 0);
    const radius = 5;
    const sphere = new Sphere(position, radius, new Material(color));
    expect(sphere.serialize()).to.deep.equal({
      type: "Sphere",
      position: position.toArray(),
      radius: radius,
      material: {
        color: color.toArray(),
        glossiness: 0,
        reflectivity: 0,
        transparency: 0,
        checkered: false
      }
    });
  });
  it("should deserialize to an object", () => {
    const position = new Vector(1, 2, 3);
    const radius = 10;
    const color = new Vector(125, 255, 125);
    const glossiness = 16;
    const reflectivity = 0.9;
    const sphere = Sphere.deserialize(position.toArray(), radius, {
      color: color.toArray(),
      glossiness,
      reflectivity
    });
    expect(sphere.position.toArray()).to.deep.equal(position.toArray());
    expect(sphere.radius).to.deep.equal(radius);
    expect(sphere.material.color.toArray()).to.deep.equal(color.toArray());
    expect(sphere.material.glossiness).to.equal(glossiness);
    expect(sphere.material.reflectivity).to.equal(reflectivity);
  });
  it("should return intersection between ray and itself", () => {
    const position = new Vector(0, 0, 0);
    const color = new Vector(255, 0, 0);
    const radius = 1;
    const sphere = new Sphere(position, radius, { color });
    const ray = new Ray(new Vector(0, 0, -5), new Vector(0, 0, 1));
    expect(sphere.intersect(ray).toArray()).to.deep.equal([0, 0, -1]);
  });
  it("should return intersection when ray is inside the sphere", () => {
    const position = new Vector(0, 0, 0);
    const color = new Vector(255, 0, 0);
    const radius = 3;
    const sphere = new Sphere(position, radius, { color });
    let ray = new Ray(new Vector(0, 0, 0), new Vector(0, 0, 1));
    expect(sphere.intersect(ray).toArray()).to.deep.equal([0, 0, 3]);

    ray = new Ray(new Vector(0, 0, 0), new Vector(0, 0, -1));
    expect(sphere.intersect(ray).toArray()).to.deep.equal([0, 0, -3]);
  });
  it("should return undefined when ray does not intersect the sphere", () => {
    const position = new Vector(0, 0, 3);
    const color = new Vector(255, 0, 0);
    const radius = 1;
    const sphere = new Sphere(position, radius, { color });
    const ray = new Ray(new Vector(0, 0, 0), new Vector(0, 0, -1));
    expect(sphere.intersect(ray)).to.equal(undefined);
  });
});
