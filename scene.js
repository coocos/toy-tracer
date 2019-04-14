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
  light: new Vector([0, 0, 2]),
  primitives: [
    new Sphere(new Vector([1.25, 0, -2]), 0.5, {
      color: constants.green,
      reflectivity: 1.0
    }),
    new Sphere(new Vector([0, 0, -2]), 0.5, { color: constants.red }),
    new Sphere(new Vector([-1.25, 0, -2]), 0.5, {
      color: constants.white,
      reflectivity: 1.0
    }),
    new Sphere(new Vector([0, -1.25, -2]), 0.5, {
      color: constants.red,
      reflectivity: 1.0
    }),
    new Sphere(new Vector([0, 1.25, -2]), 0.5, {
      color: constants.white,
      reflectivity: 1.0
    })
  ]
};
