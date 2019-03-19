import { Vector } from "vectorious";
import { Sphere } from "./primitives";
import { Ray } from "./math";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//Scene definitions
const white = new Vector([255, 255, 255]);
const red = new Vector([255, 125, 125]);
const whiteSphere = new Sphere(new Vector([0, 0, -2]), 1, white);
const redSphere = new Sphere(new Vector([-1.5, 0, -3]), 1, red);
const spheres = [whiteSphere, redSphere];
const light = new Vector([0, 0, 2]);

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

for (let y = 0; y < screenHeight; y++) {
  for (let x = 0; x < screenWidth; x++) {
    //Construct ray from camera to pixel plane
    const u = uv.x * x / screenWidth;
    const v = uv.y * y / screenHeight;
    const direction = Vector.add(screen.topLeft, new Vector([u, v, 0]))
      .subtract(camera)
      .normalize();
    const ray = new Ray(camera, direction);

    const distance = Number.MAX_VALUE;
    const point = null;
    const primitive = null;

    //Find the closest intersection
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
        }
      }
    }

    //Shade intersected primitive
    if (primitive !== null) {
      const normal = primitive.normal(point);

      //Calculate Lambertian reflectance / diffuse
      const toLight = Vector.subtract(light, point).normalize();
      const lambertian = Math.max(0, normal.dot(toLight));
      const color = Vector.scale(primitive.color, lambertian);

      //Calculate specular reflection using Blinn-Phong
      const toCamera = Vector.scale(ray.direction, -1);
      const halfVector = Vector.add(toLight, toCamera).scale(0.5);
      const specular = Math.max(0, halfVector.dot(normal)) ** 16;
      color.add(Vector.scale(white, specular));

      //Shade pixel
      context.fillStyle = `rgb(${color.x}, ${color.y}, ${color.z})`;
      context.fillRect(x, y, 1, 1);
    } else {
      context.fillStyle = "rgb(75, 75, 75)";
      context.fillRect(x, y, 1, 1);
    }
  }
}
