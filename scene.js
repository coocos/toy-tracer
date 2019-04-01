import { Vector } from "vectorious";
import { Sphere } from "./primitives";
import constants from "./constants";

export function serialize(scene) {
  // Serializes scene scene into a JSON serializable object
  return {
    light: scene.light.toArray(),
    primitives: scene.primitives.map(primitive => primitive.serialize())
  };
}

export function deserialize(scene) {
  // Deserializes scene into a scene object
  return {
    light: new Vector(scene.light),
    primitives: scene.primitives.map(primitive =>
      Sphere.deserialize(...Object.values(primitive))
    )
  };
}

export default {
  light: new Vector([3, 2, 2]),
  primitives: [
    new Sphere(new Vector([0.75, 0.25, -2]), 0.5, constants.green),
    new Sphere(new Vector([-2.5, 0, -3]), 1, constants.red),
    new Sphere(new Vector([0, -0.75, -5]), 1.5, constants.white)
  ]
};
