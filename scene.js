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
