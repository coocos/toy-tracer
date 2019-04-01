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
    console.log("Received scene");
    scene = deserialize(data.scene);
  } else if (data.screen) {
    console.log("Received screen");
    screen = {
      topLeft: new Vector(data.screen.topLeft),
      bottomRight: new Vector(data.screen.bottomRight)
    };
    resolution = {
      width: data.resolution.width,
      height: data.resolution.height
    };
  } else if (data.bucket) {
    console.log("Received render command");
    render(
      data.bucket.x[0],
      data.bucket.y[0],
      data.bucket.x[1],
      data.bucket.y[1]
    );
  }
};

function trace(ray, breakEarly = false) {
  //Returns nearest intersected point and primitive for ray
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
        //Return the first intersection even if it's not the nearest
        if (breakEarly) {
          return [point, closestPrimitive];
        }
      }
    }
  }
  return [point, closestPrimitive];
}

function shade(point, normal, primitive, ray) {
  //Calculate Lambertian reflectance / diffuse
  const toLight = Vector.subtract(scene.light, point).normalize();
  const lambertian = Math.max(0, normal.dot(toLight));
  const color = Vector.scale(primitive.color, lambertian);

  //Calculate specular reflection using Blinn-Phong
  const toCamera = Vector.scale(ray.direction, -1);
  const halfVector = Vector.add(toLight, toCamera).scale(0.5);
  const specular = Math.max(0, halfVector.dot(normal)) ** 16;
  color.add(Vector.scale(constants.white, specular));
  return color;
}

function create_screen_ray(x, y) {
  const uv = Vector.subtract(screen.bottomRight, screen.topLeft);
  const u = uv.x * x / resolution.width;
  const v = uv.y * y / resolution.height;
  const direction = Vector.add(screen.topLeft, new Vector([u, v, 0]))
    .subtract(camera)
    .normalize();
  return new Ray(camera, direction);
}

function render(x0, y0, x1, y1) {
  const rays = {};
  const screen = {};
  console.log("Creating screen rays");

  //Construct ray from camera to pixel plane
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (rays[x] == undefined) {
        rays[x] = {};
        screen[x] = {};
      }
      rays[x][y] = create_screen_ray(x, y);
    }
  }

  console.log("Tracing scene");
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      //Construct ray from camera to pixel plane
      const ray = rays[x][y];
      const [point, primitive] = trace(ray);

      //Shade intersected primitive
      if (primitive !== null) {
        const normal = primitive.normal(point);
        const color = shade(point, normal, primitive, ray);

        //Calculate if point reflects another object in the scene
        const reflectedRay = new Ray(point, ray.reflect(normal));
        const [reflectedPoint, reflectedPrimitive] = trace(reflectedRay, true);
        if (reflectedPoint !== null) {
          const reflectedNormal = reflectedPrimitive.normal(reflectedPoint);
          const reflectedColor = shade(
            reflectedPoint,
            reflectedNormal,
            reflectedPrimitive,
            reflectedRay
          );
          color.scale(0.5).add(reflectedColor.scale(0.5));
        }

        //Check if point is shadowed
        const toLight = Vector.subtract(scene.light, point).normalize();
        const shadowRay = new Ray(point, toLight);
        const [shadowedPoint, shadowedPrimitive] = trace(shadowRay, true);
        if (shadowedPoint !== null) {
          color.scale(0.25);
        }
        screen[x][y] = `rgb(${color.x}, ${color.y}, ${color.z})`;
      } else {
        screen[x][y] = "rgb(75, 75, 75)";
      }
    }

    // Update render progress
    if (y % 16 == 0) {
      postMessage({
        bucket: screen
      });
    }
  }

  console.log("Done rendering");
  postMessage({
    bucket: screen
  });
}
