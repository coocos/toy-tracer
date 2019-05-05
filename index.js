import { Vector, Ray } from "./math";
import { serialize, deserialize } from "./scene";
import constants from "./constants";

// babel-polyfill is unfortunately needed for parcel
// to play nice with async / await
import "babel-polyfill";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Screen definition
const screenWidth = canvas.width;
const screenHeight = canvas.height;
const aspectRatio = screenWidth / screenHeight;
const screen = {
  topLeft: new Vector(-1 * aspectRatio, 1, 0),
  bottomRight: new Vector(1 * aspectRatio, -1, 0)
};

/**
 * Returns a settings object containing settings like
 * the scene to render.
 *
 * @return {object} rendering options
 */
function readSettings() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    sceneName: urlParams.get("scene"),
    supersampling: urlParams.has("supersampling")
  };
}

/**
 * Spawns multiple WebWorkers for rendering the scene. Each worker will
 * compute pixel colors for a single vertical slice of the canvas.
 *
 * @param {Number} workerCount - amount of workers to spawn
 */
async function spawnWorkers(workerCount = navigator.hardwareConcurrency || 1) {
  const settings = readSettings();

  const scene = await (await fetch(`${settings.sceneName}.json`)).json();

  const verticalSlice = Math.floor(screenHeight / workerCount);
  for (let i = 0; i < workerCount; i++) {
    const worker = new Worker("worker.js");

    // Render updates from worker to canvas
    worker.onmessage = ({ data }) => {
      for (const [x, ys] of Object.entries(data.bucket)) {
        for (const [y, color] of Object.entries(ys)) {
          context.fillStyle = color;
          context.fillRect(x, y, 1, 1);
        }
      }
      console.log(`Rendering took ${new Date() - renderStartTime} ms`);
    };

    // Post scene definition to worker
    worker.postMessage({
      screen: {
        topLeft: screen.topLeft.toArray(),
        bottomRight: screen.bottomRight.toArray()
      },
      resolution: {
        width: canvas.width,
        height: canvas.height
      },
      supersampling: settings.supersampling
    });
    worker.postMessage({ scene });
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
