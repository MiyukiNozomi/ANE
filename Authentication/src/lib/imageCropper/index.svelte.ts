import { registerEvents } from "./events";
import { drawCropper } from "./rendering";
export type CropperProperties = {
  posX: number;
  posY: number;
  scale: number;
  iw: number;
  ih: number;

  buttonSize: number;

  disabled: boolean;
};
export class ImageCropper {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private properties: CropperProperties;

  private decodedImage: HTMLImageElement | undefined;

  public constructor(canvas: HTMLCanvasElement) {
    this.decodedImage = $state();
    this.canvas = canvas;
    this.properties = {
      posX: 0,
      posY: 0,
      scale: 0,

      iw: 0,
      ih: 0,

      buttonSize: 0,

      disabled: false,
    };

    const ctx = canvas.getContext("2d");

    if (!ctx)
      throw new Error(
        "This web browser does not support a 2D canvas rendering context."
      );
    this.ctx = ctx;

    registerEvents(this.properties, canvas);
  }

  public createRenderer() {
    const gameLoop = () => {
      drawCropper(this.properties, this.decodedImage, this.canvas, this.ctx);
      setTimeout(() => window.requestAnimationFrame(gameLoop), 20);
    };

    gameLoop();
  }

  public hasImage() {
    return this.decodedImage != undefined;
  }

  public setImage(img: HTMLImageElement | undefined) {
    this.decodedImage = img;
    this.properties.disabled = false;
  }

  public async getTranscodedImage() {
    if (!this.decodedImage)
      throw "Found a bug: decodedImage == null in getTranscodedImage function";

    const tmpCanvas = document.createElement("canvas");
    const ctx = tmpCanvas.getContext("2d");

    if (!ctx)
      throw "Browser not supported: HTMLCanvasElemented#getContext returned NULL.";

    this.properties.disabled = true;

    const physicalProperties = {
      posX:
        (this.properties.posX / this.properties.iw) * this.decodedImage.width,
      posY:
        (this.properties.posY / this.properties.ih) * this.decodedImage.height,
      scale:
        (this.properties.scale /
          Math.min(this.properties.iw, this.properties.ih)) *
        Math.min(this.decodedImage.width, this.decodedImage.height),
    };

    tmpCanvas.width = physicalProperties.scale;
    tmpCanvas.height = physicalProperties.scale;

    console.log(physicalProperties);

    ctx.drawImage(
      this.decodedImage,
      -physicalProperties.posX,
      -physicalProperties.posY
    );

    return new Promise<Blob | null>((resolve) => {
      tmpCanvas.toBlob(resolve);
    });
  }
}
