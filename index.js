import { Vector } from "vectorious";
import { Sphere } from "./primitives";
import { Ray } from "./math";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//Scene definitions
const white = new Vector([255, 255, 255]);
const green = new Vector([75, 255, 175]);
const red = new Vector([255, 125, 125]);
const greenSphere = new Sphere(new Vector([0.75, 0.25, -2]), 0.5, green);
const redSphere = new Sphere(new Vector([-2.5, 0, -3]), 1, red);
const whiteSphere = new Sphere(new Vector([0, -0.75, -5]), 1.5, white);
const spheres = [greenSphere, redSphere, whiteSphere];
const light = new Vector([3, 2, 2]);

//Screen definitions
const camera = new Vector([0, 0, 2]);
const screenWidth = canvas.width;
const screenHeight = canvas.height;
const aspectRatio = screenWidth / screenHeight;
const screen = {
  topLeft: new Vector([-1 * aspectRatio, 1, 0]),
  bottomRight: new Vector([1 * aspectRatio, -1, 0])
};
const uv = Vector.subtract(screen.bottomRight, screen.topLeft);

function trace(ray, breakEarly = false) {
  //Returns nearest intersected point and primitive for ray
  let distance = Number.MAX_VALUE;
  let point = null;
  let primitive = null;
  for (let sphere of spheres) {
    const intersection = sphere.intersect(ray);

    if (intersection !== undefined) {
      let intersectionDistance = Vector.subtract(
        intersection,
        camera
      ).magnitude();
      if (intersectionDistance < distance) {
        distance = intersectionDistance;
        point = intersection;
        primitive = sphere;
        //Return the first intersection even if it's not the nearest
        if (breakEarly) {
          return [point, primitive];
        }
      }
    }
  }
  return [point, primitive];
}

function shade(point, normal, primitive, ray) {
  //Calculate Lambertian reflectance / diffuse
  const toLight = Vector.subtract(light, point).normalize();
  const lambertian = Math.max(0, normal.dot(toLight));
  const color = Vector.scale(primitive.color, lambertian);

  //Calculate specular reflection using Blinn-Phong
  const toCamera = Vector.scale(ray.direction, -1);
  const halfVector = Vector.add(toLight, toCamera).scale(0.5);
  const specular = Math.max(0, halfVector.dot(normal)) ** 16;
  color.add(Vector.scale(white, specular));
  return color;
}

for (let y = 0; y < screenHeight; y++) {
  for (let x = 0; x < screenWidth; x++) {
    //Construct ray from camera to pixel plane
    const u = uv.x * x / screenWidth;
    const v = uv.y * y / screenHeight;
    const direction = Vector.add(screen.topLeft, new Vector([u, v, 0]))
      .subtract(camera)
      .normalize();
    const ray = new Ray(camera, direction);

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
      const toLight = Vector.subtract(light, point).normalize();
      const shadowRay = new Ray(point, toLight);
      const [shadowedPoint, shadowedPrimitive] = trace(shadowRay, true);
      if (shadowedPoint !== null) {
        color.scale(0.25);
      }

      //Shade pixel
      context.fillStyle = `rgb(${color.x}, ${color.y}, ${color.z})`;
      context.fillRect(x, y, 1, 1);
    } else {
      context.fillStyle = "rgb(75, 75, 75)";
      context.fillRect(x, y, 1, 1);
    }
  }
}
