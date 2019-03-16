import { Vector } from "vectorious";
import { Ray, Sphere } from "./primitives";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const camera = new Vector([0, 0, 2]);
const sphere = new Sphere(new Vector([0, 0, -2]), 1);
const sphereColor = new Vector(new Uint8Array([255, 255, 255]));
const light = new Vector([0, 0, 2]);

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
    const u = uv.x * x / screenWidth;
    const v = uv.y * y / screenHeight;
    const direction = Vector.add(screen.topLeft, new Vector([u, v, 0]))
      .subtract(camera)
      .normalize();

    const ray = new Ray(camera, direction);
    const point = sphere.intersect(ray);
    if (point !== undefined) {
      const normal = sphere.normal(point);
      const surfaceToLight = Vector.subtract(light, point).normalize();
      const lambertian = Math.max(0, normal.dot(surfaceToLight));
      const color = Vector.scale(sphereColor, lambertian);
      context.fillStyle = `rgb(${color.x}, ${color.y}, ${color.z})`;
      context.fillRect(x, y, 1, 1);
    } else {
      context.fillStyle = "rgb(75, 75, 75)";
      context.fillRect(x, y, 1, 1);
    }
  }
}
