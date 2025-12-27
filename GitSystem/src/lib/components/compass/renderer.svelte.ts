import { Constelations } from "./constelations.svelte";

let bgStarted = false;
function startBg({ canvas }: { canvas: HTMLCanvasElement }) {
  if (bgStarted) return;
  bgStarted = true;
  if (!canvas) return;
  let ctx = canvas.getContext("2d");

  // background
  let bgFadeProgress = 0.0;

  let bgRotation = 0.0;
  let bgRotationSpeed = 0.0;

  // compass
  let compassProgress = 0.0;
  let compassApproachSpeed = 0.0;

  let compassRotation = 0.0;
  let compassRotationSpeed = 0.0;

  let constellations = new Constelations(canvas, ctx!);

  const bgFunc = () => {
    if (readyCounter < totalElementsToLoad)
      return console.log(
        "Ready counter is ",
        readyCounter,
        " (still not ready)",
      );
    if (!canvas) return console.error("Missing canvas!");
    if (!ctx) return console.error("Browser not supported!");
    if (!backgroundImage || !compassImage)
      return console.error("Not fully loaded!");

    console.log("Background started.");
    const drawRotatedImage = (
      image: HTMLImageElement,
      x: number,
      y: number,
      degrees: number,
      iw?: number,
      ih?: number,
    ) => {
      const radians = degrees * (Math.PI / 180);
      const imageWidth = iw ?? image.width;
      const imageHeight = ih ?? image.height;

      const cx = imageWidth / 2;
      const cy = imageHeight / 2;

      ctx.save();
      ctx.translate(x, y); // Move origin to desired center
      ctx.rotate(radians); // Rotate canvas around new origin
      ctx.drawImage(image, -cx, -cy, imageWidth, imageHeight); // Draw image centered at origin
      ctx.restore();
    };

    canvas!.width = window.screen.width;
    canvas!.height = window.screen.height;

    ctx.fillStyle = "#1A1F21";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    constellations.render();

    const centerX = canvas!.width / 2;
    const centerY = canvas!.height / 2;

    // rendering the background
    ctx.globalAlpha = Math.min(1.0, bgFadeProgress);

    const bgSize = Math.max(canvas!.width, canvas!.height);

    drawRotatedImage(
      backgroundImage,
      centerX,
      centerY,
      bgRotation,
      bgSize,
      bgSize,
    );
    bgRotation += bgRotationSpeed;

    if (bgFadeProgress < 1.0) {
      bgFadeProgress += 0.002;
      bgRotationSpeed += 0.00009;
    }

    // rendering the compass
    let scale = 6.0 - compassProgress * 5;

    ctx.globalAlpha = 1.0;

    const compassSize = Math.max(canvas!.width, canvas!.height) * scale;

    drawRotatedImage(
      compassImage,
      centerX,
      centerY,
      compassRotation,
      compassSize,
      compassSize,
    );

    compassRotation += compassRotationSpeed;

    if (compassProgress < 1.0) {
      compassProgress += compassApproachSpeed;
      compassApproachSpeed += 0.00005;
      compassRotationSpeed += 0.0015;
    }

    setTimeout(() => window.requestAnimationFrame(bgFunc), 5);
  };

  bgFunc();
}
