import { expect } from "chai";
import { Ray, Vector } from "./math";

describe("Ray", () => {
  it("should reflect around normal", () => {
    const origin = new Vector(0, 0, 0);
    const direction = new Vector(1, -1, 0).normalize();
    const ray = new Ray(origin, direction);

    const normal = new Vector(0, 1, 0);
    const reflected = ray.reflect(normal);
    expect(reflected.x).to.equal(direction.x);
    expect(reflected.y).to.equal(-direction.y);
  });
});
