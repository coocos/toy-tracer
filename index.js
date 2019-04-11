import { Vector } from "vectorious";
import { Ray } from "./math";
import scene, { serialize, deserialize } from "./scene";
import constants from "./constants";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Screen definition
const camera = new Vector([0, 0, 2]);
const screenWidth = canvas.width;
const screenHeight = canvas.height;
const aspectRatio = screenWidth / screenHeight;
const screen = {
  topLeft: new Vector([-1 * aspectRatio, 1, 0]),
  bottomRight: new Vector([1 * aspectRatio, -1, 0])
};

/**
 * Spawns multiple WebWorkers for rendering the scene. Each worker will
 * compute pixel colors for a single vertical slice of the canvas.
 *
 * @param {Number} workerCount - amount of workers to spawn
 */
function spawnWorkers(workerCount = navigator.hardwareConcurrency || 1) {
  const verticalSlice = Math.floor(screenHeight / workerCount);
  for (let i = 0; i < workerCount; i++) {
    // Post render tasks to WebWorkers
    const worker = new Worker("worker.js");
    worker.onmessage = ({ data }) => {
      for (const [x, ys] of Object.entries(data.bucket)) {
        for (const [y, color] of Object.entries(ys)) {
          context.fillStyle = color;
          context.fillRect(x, y, 1, 1);
        }
      }
      console.log(`Rendering took ${new Date() - renderStartTime} ms`);
    };
    worker.postMessage({
      screen: {
        topLeft: screen.topLeft.toArray(),
        bottomRight: screen.bottomRight.toArray()
      },
      resolution: {
        width: canvas.width,
        height: canvas.height
      }
    });
    worker.postMessage({ scene: serialize(scene) });
    const renderStartTime = new Date();
    worker.postMessage({
      bucket: {
        x: [0, screenWidth],
        y: [i * verticalSlice, i * verticalSlice + verticalSlice]
      }
    });
  }
}

spawnWorkers();
