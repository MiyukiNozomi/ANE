import type { CropperProperties } from "./index.svelte";

export function drawCropper(
  cropperProperties: CropperProperties,
  decodedImage: HTMLImageElement | undefined,
  cropperCanvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  if (decodedImage && cropperCanvas.parentElement) {
    let parentElementSize = cropperCanvas.parentElement.clientWidth;

    if (decodedImage.width > decodedImage.height) {
      let aspect = decodedImage.height / decodedImage.width;

      cropperProperties.iw = parentElementSize;
      cropperProperties.ih = aspect * parentElementSize;
    } else {
      let aspect = decodedImage.width / decodedImage.height;

      cropperProperties.iw = aspect * parentElementSize;
      cropperProperties.ih = parentElementSize;
    }

    cropperCanvas.width = cropperProperties.iw;
    cropperCanvas.height = cropperProperties.ih;

    ctx.drawImage(
      decodedImage,
      0,
      0,
      cropperProperties.iw,
      cropperProperties.ih
    );

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, cropperProperties.iw, cropperProperties.ih);
    ctx.restore();

    // draw the cropper
    if (cropperProperties.scale == -1) {
      cropperProperties.scale = Math.min(
        cropperProperties.iw,
        cropperProperties.ih
      );

      // If we're on a phone, the resize button should be larger.
      cropperProperties.buttonSize =
        cropperProperties.scale /
        (window.screen.height > window.screen.width ? 6 : 10);
    }

    const cropperRadii = cropperProperties.scale / 2;

    ctx.save();
    ctx.beginPath();
    /*ctx.clearRect(
      cropperProperties.posX,
      cropperProperties.posY,
      cropperProperties.scale,
      cropperProperties.scale
    );*/
    ctx.arc(
      cropperProperties.posX + cropperRadii,
      cropperProperties.posY + cropperRadii,
      cropperRadii,
      0,
      Math.PI * 2
    );
    ctx.clip();
    ctx.drawImage(
      decodedImage,
      0,
      0,
      cropperProperties.iw,
      cropperProperties.ih
    );
    ctx.restore();

    ctx.strokeStyle = "#ffffff88";

    const lineWidth = 1;
    ctx.lineWidth = lineWidth * 2;

    ctx.beginPath();
    ctx.arc(
      cropperProperties.posX + cropperRadii,
      cropperProperties.posY + cropperRadii,
      cropperRadii,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    const buttonRadii = cropperProperties.buttonSize / 2;

    ctx.beginPath();
    ctx.arc(
      cropperProperties.posX + cropperProperties.scale - buttonRadii,
      cropperProperties.posY + cropperProperties.scale - buttonRadii,
      buttonRadii,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else {
    cropperCanvas.width = 1;
    cropperCanvas.height = 1;

    cropperProperties.scale = -1;
    cropperProperties.posX = 0;
    cropperProperties.posY = 0;

    cropperProperties.buttonSize = 0;
    cropperProperties.iw = 0;
    cropperProperties.ih = 0;
  }
}
