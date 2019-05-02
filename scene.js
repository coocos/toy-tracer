import { Vector } from "./math";
import { Sphere, Plane } from "./primitives";
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
  const typeToConstructor = {
    Sphere,
    Plane
  };
  return {
    light: new Vector(...scene.light),
    primitives: scene.primitives.map(({ type, ...primitive }) => {
      return new typeToConstructor[type].deserialize(
        ...Object.values(primitive)
      );
    })
  };
}

export default {
  light: new Vector(0, 0, 0),
  primitives: [
    new Plane(new Vector(1.5, 0, 0), new Vector(-1, 0, 0), {
      color: constants.red
    }),
    new Plane(new Vector(0, 0, -6), new Vector(0, 0, 1), {
      color: constants.white
    }),
    new Plane(new Vector(0, 1.5, 0), new Vector(0, -1, 0), {
      color: constants.white
    }),
    new Plane(new Vector(0, -1.5, 0), new Vector(0, 1, 0), {
      color: constants.white
    }),
    new Plane(new Vector(-1.5, 0, 0), new Vector(1, 0, 0), {
      color: constants.blue
    }),
    new Sphere(new Vector(0, -0.5, -3), 1, {
      color: constants.white,
      glossiness: 16,
      reflectivity: 1.0
    }),
    new Sphere(new Vector(-1, -1, -2), 0.25, {
      color: constants.red,
      glossiness: 19,
      reflectivity: 0.9
    }),
    new Sphere(new Vector(1, -1, -1.5), 0.25, {
      color: constants.blue,
      reflectivity: 0.9
    })
  ]
};
