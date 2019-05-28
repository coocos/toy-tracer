import { Vector } from "./math";
import { Sphere, Plane, Rectangle } from "./primitives";
import constants from "./constants";

/**
 * Serializes scene object into a JSON serializable object
 *
 * @param {Object} scene definition object
 */
export function serialize(scene) {
  return {
    camera: scene.camera.toArray(),
    light: {
      position: scene.light.position.toArray(),
      normal: scene.light.normal.toArray(),
      ...scene.light
    },
    primitives: scene.primitives.map(primitive => primitive.serialize())
  };
}

/**
 * Deserializes scene from a JSON serialized object to an
 * object where all Vectors are proper Vector instead of
 * just arrays
 *
 * @param {Object} scene definition object
 */
export function deserialize(scene) {
  // Deserializes scene into a scene object
  const typeToConstructor = {
    Sphere,
    Plane,
    Rectangle
  };
  const deserialized = {
    camera: new Vector(...scene.camera),
    light: {
      ...scene.light,
      position: new Vector(...scene.light.position),
      normal: new Vector(...scene.light.normal)
    },
    primitives: scene.primitives.map(({ type, ...primitive }) => {
      return new typeToConstructor[type].deserialize(
        ...Object.values(primitive)
      );
    })
  };

  // Add a rectangle to the scene to visualize the area light
  if (deserialized.light.type === "area") {
    const areaLight = new Rectangle(
      deserialized.light.position,
      deserialized.light.normal,
      deserialized.light.size
    );
    deserialized.primitives.push(areaLight);
    deserialized.light.primitive = areaLight;
  }

  return deserialized;
}
