import { Vector } from "./math";
import { Sphere, Plane } from "./primitives";
import constants from "./constants";

export function serialize(scene) {
  // Serializes scene scene into a JSON serializable object
  return {
    camera: scene.camera.toArray(),
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
    camera: new Vector(...scene.camera),
    light: new Vector(...scene.light),
    primitives: scene.primitives.map(({ type, ...primitive }) => {
      return new typeToConstructor[type].deserialize(
        ...Object.values(primitive)
      );
    })
  };
}
