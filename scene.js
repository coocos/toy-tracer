import { Vector } from "vectorious";
import { Sphere } from "./primitives";
import constants from "./constants";

export default {
  light: new Vector([3, 2, 2]),
  primitives: [
    new Sphere(new Vector([0.75, 0.25, -2]), 0.5, constants.green),
    new Sphere(new Vector([-2.5, 0, -3]), 1, constants.red),
    new Sphere(new Vector([0, -0.75, -5]), 1.5, constants.white)
  ]
};
