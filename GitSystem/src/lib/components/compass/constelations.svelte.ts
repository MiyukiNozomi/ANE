import { SimplexNoise2D } from "./simplexNoise";

// TODO
export class Constelations {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private noise: SimplexNoise2D;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.noise = new SimplexNoise2D();
  }

  public render() {}
}
