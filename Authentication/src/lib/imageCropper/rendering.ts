export type CropperProperties = {
  posX: number;
  posY: number;
  scale: number;
  iw: number;
  ih: number;

  buttonSize: number;
};

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
      cropperProperties.buttonSize = cropperProperties.scale / 8;
    }

    ctx.save();
    ctx.beginPath();
    ctx.clearRect(
      cropperProperties.posX,
      cropperProperties.posY,
      cropperProperties.scale,
      cropperProperties.scale
    );
    ctx.rect(
      cropperProperties.posX,
      cropperProperties.posY,
      cropperProperties.scale,
      cropperProperties.scale
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

    ctx.strokeRect(
      cropperProperties.posX + lineWidth,
      cropperProperties.posY + lineWidth,
      cropperProperties.scale - ctx.lineWidth,
      cropperProperties.scale - ctx.lineWidth
    );

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      cropperProperties.posX +
        cropperProperties.scale -
        cropperProperties.buttonSize,
      cropperProperties.posY +
        cropperProperties.scale -
        cropperProperties.buttonSize,
      cropperProperties.buttonSize,
      cropperProperties.buttonSize
    );
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
