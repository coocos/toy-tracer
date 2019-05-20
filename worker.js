import { deserialize } from "./scene";
import { Vector, Ray } from "./math";
import constants from "./constants";

let scene;
let screen;
let resolution;
let settings;
let camera;

onmessage = function({ data }) {
  if (data.scene) {
    scene = deserialize(data.scene);
  } else if (data.screen) {
    screen = {
      topLeft: new Vector(...data.screen.topLeft),
      bottomRight: new Vector(...data.screen.bottomRight)
    };
    resolution = {
      width: data.resolution.width,
      height: data.resolution.height
    };
    settings = data.settings;
  } else if (data.bucket) {
    render(
      data.bucket.x[0],
      data.bucket.y[0],
      data.bucket.x[1],
      data.bucket.y[1]
    );
  }
};

function createScreenRay(x, y) {
  const uv = screen.bottomRight.subtract(screen.topLeft);
  const u = uv.x * x / resolution.width;
  const v = uv.y * y / resolution.height;
  const direction = screen.topLeft
    .add(new Vector(u, v, 0))
    .subtract(scene.camera)
    .normalize();
  return new Ray(scene.camera, direction);
}

function createScreenRays(x0, y0, x1, y1, supersampling = false) {
  const rays = {};
  // Construct ray from camera to pixel plane
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (rays[x] == undefined) {
        rays[x] = {};
      }
      // In supersampling create 4 rays per each pixel
      if (supersampling) {
        rays[x][y] = [
          createScreenRay(x - 0.25, y - 0.25),
          createScreenRay(x + 0.25, y - 0.25),
          createScreenRay(x - 0.25, y + 0.25),
          createScreenRay(x + 0.25, y + 0.25)
        ];
      } else {
        rays[x][y] = createScreenRay(x, y);
      }
    }
  }
  return rays;
}

/**
 * Returns whether point is shadowed or not
 *
 * @param {Object} Intersection object
 * @return {boolean} True if shadowed, false if not
 */
function isShadowed({ point, normal, primitive }, scene) {
  const fromPointToLight = scene.light.position.subtract(point);
  const ray = new Ray(
    point.add(normal.scale(constants.EPSILON)),
    fromPointToLight.normalize()
  );

  for (let other of scene.primitives) {
    // Object cannot shadow itself or be shadowed by the light source
    if (other === primitive || other === scene.light.primitive) {
      continue;
    }

    const intersection = other.intersect(ray);
    if (intersection !== undefined) {
      const distanceToIntersection = point.subtract(intersection).magnitude();

      // If the intersection distance is further away than the
      // distance to the light then there is no shadowing
      if (distanceToIntersection < fromPointToLight.magnitude()) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Computes amount of ambient occlusion
 *
 * @param {Object} Intersection object
 * @return {Number} Amount of occlusion ranging between 0 to 1
 */
function computeAmbientOcclusion({ point, normal }, samples) {
  let hits = 0;

  for (let i = 0; i < samples; i++) {
    // Stop ambient occlusion computation if half the samples have
    // been traced without a single meaningful occlusion
    if (i > samples / 2 && hits === 0) {
      return 1;
    }

    let hemisphereNormal = Vector.randomUnitVector();
    // Generated normal is away from the hemisphere so flip it
    if (hemisphereNormal.dot(normal) < 0) {
      hemisphereNormal = hemisphereNormal.scale(-1);
    }
    const ray = new Ray(
      point.add(hemisphereNormal.scale(constants.EPSILON)),
      hemisphereNormal
    );
    const intersection = intersect(ray);
    if (intersection.primitive === null) {
      continue;
    }
    const distance = point.subtract(intersection.point).magnitude();
    if (distance < constants.AMBIENT_OCCLUSION_MAX_DISTANCE) {
      // Weigh ambient occlusion strength according to distance
      hits += 1 - distance / constants.AMBIENT_OCCLUSION_MAX_DISTANCE;
    }
  }
  return 1 - hits / samples;
}

/**
 * Computes point color using Phong lighting model
 *
 * @param {Object} Intersection object
 * @param {Ray} ray Viewing ray
 * @return {Vector} RGB vector
 */
function shade({ point, normal, primitive }, ray) {
  // Calculate Lambertian reflectance / diffuse
  const toLight = scene.light.position.subtract(point).normalize();
  const lambertian = Math.max(0, normal.dot(toLight));

  let color = primitive.material.color.scale(lambertian);

  // Horizontal checkered textures for planes
  if (primitive.checkered) {
    const x = Math.floor(point.x * 2);
    const z = Math.floor(point.z * 2);
    if ((x % 2 && z % 2 == 0) || (z % 2 && x % 2 == 0)) {
      color = color.scale(0.5);
    }
  }

  // Calculate specular reflection using Blinn-Phong
  if (primitive.material.glossiness > 0) {
    const toCamera = ray.direction.scale(-1);
    const halfVector = toLight.add(toCamera).scale(0.5);
    const specular =
      Math.max(0, halfVector.dot(normal)) ** primitive.material.glossiness;
    return color.add(constants.WHITE.scale(specular));
  }

  return color;
}

/**
 * Returns the closest intersected point and primitive for ray
 *
 * @param {Ray} ray The ray to use for intersection calculation
 * @return {Array} Array containing point and primitive
 */
function intersect(ray) {
  // Returns nearest intersected point and primitive for ray
  let distance = Number.MAX_VALUE;
  let point = null;
  let closestPrimitive = null;
  for (let primitive of scene.primitives) {
    const intersection = primitive.intersect(ray);

    if (intersection !== undefined) {
      let intersectionDistance = intersection.subtract(ray.origin).magnitude();
      if (intersectionDistance < distance) {
        distance = intersectionDistance;
        point = intersection;
        closestPrimitive = primitive;
      }
    }
  }
  return {
    point,
    primitive: closestPrimitive,
    normal: closestPrimitive === null ? null : closestPrimitive.normal(point)
  };
}

/**
 * Recursively ray traces the scene and returns the color of the
 * point intersected by the ray
 *
 * @param ray {Ray} Ray to trace
 * @param depth {number} Recursion depth, i.e. amount of reflection bounces
 * @return {Vector} Color of the intersected point
 */
function trace(ray, depth = 4) {
  if (depth == 0) {
    return;
  }

  const intersection = intersect(ray);

  // Shade intersected primitive
  if (intersection.primitive !== null) {
    // Light source does not need to be shaded
    if (intersection.primitive === scene.light.primitive) {
      return constants.WHITE;
    }

    let color = shade(intersection, ray);

    // Calculate if point reflects another object in the scene
    if (intersection.primitive.material.reflectivity > 0) {
      const reflectedRay = new Ray(
        intersection.point.add(intersection.normal.scale(constants.EPSILON)),
        ray.reflect(intersection.normal)
      );
      const reflectedColor = trace(reflectedRay, depth - 1);
      if (reflectedColor !== undefined) {
        color = color
          .scale(1 - intersection.primitive.material.reflectivity)
          .add(
            reflectedColor.scale(intersection.primitive.material.reflectivity)
          );
      }
    }

    if (intersection.primitive.material.transparency > 0) {
      let refractedDirection = ray.refract(intersection.normal);
      if (refractedDirection !== undefined) {
        const refractedRay = new Ray(
          intersection.point.add(refractedDirection.scale(constants.EPSILON)),
          refractedDirection
        );
        const refractedColor = trace(refractedRay, depth - 1);
        if (refractedColor !== undefined) {
          color = color
            .scale(1 - intersection.primitive.material.transparency)
            .add(
              refractedColor.scale(intersection.primitive.material.transparency)
            );
        }
      }
    }

    // Make shadowed points darker
    if (isShadowed(intersection, scene)) {
      color = color.scale(0.5);
    }

    // Compute ambient occlusion
    if (settings.ambientOcclusionSamples > 0) {
      const ambientOcclusionFactor = computeAmbientOcclusion(
        intersection,
        settings.ambientOcclusionSamples
      );
      if (ambientOcclusionFactor < 1) {
        color = color.scale(ambientOcclusionFactor);
      }
    }

    return color;
  }
}

/**
 * Computes pixel colors for all pixels in the passed bounding box
 *
 * @param {number} x0 Top left corner x-coordinate
 * @param {number} y0 Top left corner y-coordinate
 * @param {number} x1 Bottom right corner x-coordinate
 * @param {number} y1 Bottom right corner y-coordinate
 */
function render(x0, y0, x1, y1) {
  let bucket = {};
  const rays = createScreenRays(x0, y0, x1, y1, settings.supersampling);
  const backgroundColor = new Vector(175, 175, 175);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (bucket[x] === undefined) {
        bucket[x] = {};
      }

      const ray = rays[x][y];

      // Supersampling requires averaging multiple rays per pixel
      if (Array.isArray(ray)) {
        let color = new Vector(0, 0, 0);
        for (let r of ray) {
          color = color.add(trace(r) || backgroundColor);
        }
        color = color.scale(1 / ray.length);
        bucket[x][y] = `rgb(${color.x}, ${color.y}, ${color.z})`;
      } else {
        const color = trace(ray) || backgroundColor;
        bucket[x][y] = `rgb(${color.x}, ${color.y}, ${color.z})`;
      }
    }

    // Update render progress
    if (y % 16 == 0) {
      postMessage({
        bucket
      });
      // Clear bucket between updates
      bucket = {};
    }
  }

  // Final render progress update
  postMessage({
    bucket
  });
}
