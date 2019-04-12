import { Vector } from "vectorious";
import { deserialize } from "./scene";
import { Ray } from "./math";
import constants from "./constants";

let scene;
let screen;
let resolution;
const camera = new Vector([0, 0, 2]);

onmessage = function({ data }) {
  if (data.scene) {
    scene = { ...scene, ...deserialize(data.scene) };
  } else if (data.screen) {
    screen = {
      topLeft: new Vector(data.screen.topLeft),
      bottomRight: new Vector(data.screen.bottomRight)
    };
    resolution = {
      width: data.resolution.width,
      height: data.resolution.height
    };
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
  const uv = Vector.subtract(screen.bottomRight, screen.topLeft);
  const u = uv.x * x / resolution.width;
  const v = uv.y * y / resolution.height;
  const direction = Vector.add(screen.topLeft, new Vector([u, v, 0]))
    .subtract(camera)
    .normalize();
  return new Ray(camera, direction);
}

function createScreenRays(x0, y0, x1, y1) {
  const rays = {};
  // Construct ray from camera to pixel plane
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (rays[x] == undefined) {
        rays[x] = {};
      }
      rays[x][y] = createScreenRay(x, y);
    }
  }
  return rays;
}

/**
 * Returns whether point is shadowed or not
 *
 * @param {Vector} point
 * @return {boolean} True if shadowed, false if not
 */
function isShadowed(point, scene) {
  const ray = new Ray(point, Vector.subtract(scene.light, point).normalize());
  for (let primitive of scene.primitives) {
    if (primitive.intersect(ray) !== undefined) {
      return true;
    }
  }
  return false;
}

/**
 * Computes point color using Phong lighting model
 *
 * @param {Vector} point Point to compute color for
 * @param {Vector} normal Surface normal
 * @param {Primitive} primitive Primitive the point belongs to
 * @param {Ray} ray Viewing ray
 * @return {Vector} RGB vector
 */
function shade(point, normal, primitive, ray) {
  // Calculate Lambertian reflectance / diffuse
  const toLight = Vector.subtract(scene.light, point).normalize();
  const lambertian = Math.max(0, normal.dot(toLight));
  const color = Vector.scale(primitive.color, lambertian);

  // Calculate specular reflection using Blinn-Phong
  const toCamera = Vector.scale(ray.direction, -1);
  const halfVector = Vector.add(toLight, toCamera).scale(0.5);
  const specular = Math.max(0, halfVector.dot(normal)) ** 16;
  color.add(Vector.scale(constants.white, specular));
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
      let intersectionDistance = Vector.subtract(
        intersection,
        camera
      ).magnitude();
      if (intersectionDistance < distance) {
        distance = intersectionDistance;
        point = intersection;
        closestPrimitive = primitive;
      }
    }
  }
  return [point, closestPrimitive];
}

/**
 * Recursively ray traces the scene and returns the color of the
 * point intersected by the ray
 *
 * @param ray {Ray} Ray to trace
 * @param depth {number} Recursion depth, i.e. amount of reflection bounces
 * @return {Vector} Color of the intersected point
 */
function trace(ray, depth = 2) {
  let finalColor = new Vector([0, 0, 0]);
  if (depth == 0) {
    return finalColor;
  }

  const [point, primitive] = intersect(ray);

  // Shade intersected primitive
  if (primitive !== null) {
    const normal = primitive.normal(point);
    const color = shade(point, normal, primitive, ray);

    // Calculate if point reflects another object in the scene
    const reflectedRay = new Ray(point, ray.reflect(normal));
    const reflectedColor = trace(reflectedRay, depth - 1);
    if (reflectedColor !== undefined) {
      color.scale(0.5).add(reflectedColor.scale(0.5));
    }

    // Make shadowed points darker
    if (isShadowed(point, scene)) {
      color.scale(0.25);
    }
    finalColor = color;
  }
  return finalColor;
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
  const rays = createScreenRays(x0, y0, x1, y1);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const ray = rays[x][y];
      const color = trace(ray);
      if (bucket[x] === undefined) {
        bucket[x] = {};
      }
      bucket[x][y] = `rgb(${color.x}, ${color.y}, ${color.z})`;
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
