import { SimplexNoise2D } from "./simplexNoise";

self.onmessage = (event: { data: { canvas: OffscreenCanvas } }) => {
  const { canvas } = event.data;

  let ctx = canvas.getContext("2d");
  if (!ctx || !canvas) return;

  let noise = new SimplexNoise2D();

  const simpleFilter = (
    x: number,
    y: number,
    layerCount: number = 1,
    persistence: number = 0.5,
    baseRoughness: number = 1,
    strength: number = 0.5,
    roughness: number = 2,
  ) => {
    let noiseValue = 0;
    let frequency = baseRoughness;
    let amplitude = 1;

    for (let i = 0; i < layerCount; i++) {
      let v = noise.evaluate(x * frequency, y * frequency);

      noiseValue += (v + 1) * 0.5 * amplitude;
      frequency *= roughness;
      amplitude *= persistence;
    }

    return noiseValue * strength;
  };

  let colorPoints = new Array<{
    x: number;
    y: number;
    color: number[];
  }>();

  const genColor = () => {
    let array = new Array<number>();

    let maximumPower = 255;
    for (let i = 0; i < 3; i++) {
      let val = Math.floor(Math.random() * Math.max(maximumPower, 10));
      array.push(val);
      maximumPower -= val;
    }

    return Math.random() < 0.5 ? array : array.reverse();
  };

  const alphaBlend = (alpha: number, source: number, dest: number) =>
    Math.min(alpha * source + (1.0 - alpha) * dest, 255);

  const max = 8;

  for (let i = 0; i < max; i++) {
    colorPoints.push({
      x: Math.random(),
      y: Math.random(),
      color: genColor(),
    });
  }

  console.log(
    "[NebulosaRenderer] Generating for",
    canvas.width,
    "by",
    canvas.height,
    "pixels.",
  );

  let startTime = Date.now();

  for (let i = 0; i < canvas.width; i++) {
    for (let j = 0; j < canvas.height; j++) {
      let n = simpleFilter(i, j, 4, 0.05, 0.002, 0.25, 0.25);

      let currentColor = [255, 255, 255];

      for (let pi = 0; pi < colorPoints.length; pi++) {
        let p = colorPoints[pi];
        let px = p.x;
        let py = p.y;
        let pColor = p.color;

        let magnitude = 1 / Math.sqrt(i * i + j * j);

        let ni = i * magnitude;
        let nj = j * magnitude;

        let dx = (px - ni) * (px - ni);
        let dy = (py - nj) * (py - nj);

        let distance = Math.sqrt(dx * dx + dy * dy) * 0.02;
        if (isNaN(distance)) continue;

        currentColor[0] = alphaBlend(distance, currentColor[0], pColor[0]);
        currentColor[1] = alphaBlend(distance, currentColor[1], pColor[1]);
        currentColor[2] = alphaBlend(distance, currentColor[2], pColor[2]);
      }

      ctx.fillStyle = `rgba(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]}, ${n})`;
      ctx.fillRect(i, j, 1, 1);
    }
  }

  console.log(
    "[NebulosaRenderer] Work is complete after",
    Date.now() - startTime,
    " ms.",
  );
  self.postMessage({ ok: true });
};

export {};
