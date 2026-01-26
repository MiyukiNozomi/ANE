type Star = {
  x: number;
  y: number;
};

type ConstellationStar = Star & {
  nextStars: ConstellationStar[];
  wasDrawn: boolean;
};

export function computeStarGenerationBoundingBox() {
  return {
    xRadii: Math.floor(Math.random() * 120),
    yRadii: Math.floor(Math.random() * 120),
  };
}

function createStar(
  canvas: OffscreenCanvas,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
) {
  if (minX < 0) {
    maxX += Math.abs(minX);
    minX = 0;
  }
  if (maxX > canvas.width) {
    minX -= canvas.width - maxX;
    maxX = canvas.width;
  }
  if (maxY > canvas.height) {
    minY -= canvas.height - maxY;
    maxY = canvas.height;
  }
  if (minY < 0) {
    maxY += Math.abs(minY);
    minY = 0;
  }
  return {
    x: minX + Math.floor(Math.random() * (maxX - minX)),
    y: minY + Math.floor(Math.random() * (maxY - minY)),
  } satisfies Star;
}

function createConstellation(canvas: OffscreenCanvas) {
  return createConstellationMember(
    canvas,
    null,
    Math.floor(Math.random() * 24),
  );
}

function createConstellationMember(
  canvas: OffscreenCanvas,
  lastStar: ConstellationStar | null,
  maxDepth: number,
  depth = 0,
) {
  if (!lastStar) {
    lastStar = {
      ...createStar(canvas, 0, canvas.width, 0, canvas.height),
      nextStars: [],
      wasDrawn: false,
    };
  }

  const boundingBox = computeStarGenerationBoundingBox();

  const currentStar = {
    ...createStar(
      canvas,
      lastStar.x - boundingBox.xRadii,
      lastStar.x + boundingBox.xRadii,
      lastStar.y - boundingBox.yRadii,
      lastStar.y + boundingBox.yRadii,
    ),
    nextStars: [],
    wasDrawn: false,
  } satisfies ConstellationStar;
  lastStar.nextStars.push(currentStar);

  if (depth >= maxDepth) return lastStar;

  let isBranching = Math.random() < 0.3;
  createConstellationMember(canvas, currentStar, maxDepth, depth + 1);
  if (isBranching)
    createConstellationMember(canvas, currentStar, maxDepth, depth + 1);

  return lastStar;
}

function drawStar(ctx: OffscreenCanvasRenderingContext2D, star: Star) {
  ctx.fillStyle = "#ffffff45";
  ctx.beginPath();
  ctx.arc(star.x, star.y, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawRecursive(
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D,
  star: ConstellationStar,
) {
  if (!star.wasDrawn) {
    drawStar(ctx, star);

    ctx.strokeStyle = "#ffffff12";
    star.nextStars.forEach((v) => {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();
    });
  }

  star.wasDrawn = true;
  star.nextStars.forEach((v) => drawRecursive(canvas, ctx, v));
}

self.onmessage = (event: { data: { canvas: OffscreenCanvas } }) => {
  const { canvas } = event.data;

  let ctx = canvas.getContext("2d");
  if (!ctx || !canvas) return;

  console.log(
    "[ConstellationsRenderer] Generating for",
    canvas.width,
    "by",
    canvas.height,
    "pixels.",
  );

  let startTime = Date.now();

  const maxConstellations = 3 + Math.floor(Math.random() * 24);

  for (let i = 0; i < maxConstellations; i++) {
    const constellation = createConstellation(canvas);
    drawRecursive(canvas, ctx, constellation);
  }

  const maxRandomStars = Math.floor(Math.random() * 320);
  for (let d = 0; d < maxRandomStars; d++)
    drawStar(ctx, createStar(canvas, 0, canvas.width, 0, canvas.height));

  console.log(
    "[ConstellationsRenderer] Work is complete after",
    Date.now() - startTime,
    " ms.",
  );
  self.postMessage({ ok: true });
};

export {};
