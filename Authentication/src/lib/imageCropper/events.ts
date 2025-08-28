import type { CropperProperties } from "./index.svelte";

function touchObjectAsMousePos(cropperCanvas: HTMLCanvasElement, touch: Touch) {
  const canvasRect = cropperCanvas.getBoundingClientRect();

  const offsetX = touch.pageX - canvasRect.left;
  const offsetY = touch.pageY - canvasRect.top;

  return { offsetX, offsetY };
}

export function registerEvents(
  cropperProperties: CropperProperties,
  cropperCanvas: HTMLCanvasElement
) {
  let mouseX = 0,
    mouseY = 0;
  let mouseDragStartOffsetX = 0;
  let mouseDragStartOffsetY = 0;

  let dragging = false;
  let scaling = false;

  const onDragStart = () => {
    if (cropperProperties.disabled) return;

    let right = cropperProperties.posX + cropperProperties.scale;
    let bottom = cropperProperties.posY + cropperProperties.scale;

    if (
      mouseX >= right - cropperProperties.buttonSize &&
      mouseX <= right &&
      mouseY >= bottom - cropperProperties.buttonSize &&
      mouseY <= bottom
    ) {
      // this if statement means we're touching the button.
      // because of this, mouseDragStartOffset should actually refer
      // to the position inside of the button.
      scaling = true;
      dragging = false;

      mouseDragStartOffsetX = mouseX - right;
      mouseDragStartOffsetY = mouseY - bottom;
      return;
    }

    dragging = true;
    scaling = false;

    mouseDragStartOffsetX = mouseX - cropperProperties.posX;
    mouseDragStartOffsetY = mouseY - cropperProperties.posY;
  };

  const onDragMove = (e: { offsetX: number; offsetY: number }) => {
    if (cropperProperties.disabled) return;

    mouseX = e.offsetX;
    mouseY = e.offsetY;

    if (scaling) {
      cropperProperties.scale = Math.max(
        mouseX - mouseDragStartOffsetX - cropperProperties.posX,
        mouseY - mouseDragStartOffsetY - cropperProperties.posY
      );

      const maxAvailableScale = Math.min(
        cropperProperties.iw - cropperProperties.posX,
        cropperProperties.ih - cropperProperties.posY
      );

      // first we ensure it's not bigger than the actual drawn region
      cropperProperties.scale = Math.min(
        cropperProperties.scale,
        maxAvailableScale
      );
      // then ensure it's not too small
      cropperProperties.scale = Math.max(
        cropperProperties.scale,
        Math.min(cropperProperties.iw, cropperProperties.ih) / 4
      );
      return;
    }

    if (!dragging) return;
    // console.log("dragging ", mouseDragStartOffsetX, mouseDragStartOffsetY);
    cropperProperties.posX = mouseX - mouseDragStartOffsetX;
    cropperProperties.posY = mouseY - mouseDragStartOffsetY;

    cropperProperties.posX = Math.min(
      Math.max(cropperProperties.posX, 0),
      cropperProperties.iw - cropperProperties.scale
    );
    cropperProperties.posY = Math.min(
      Math.max(cropperProperties.posY, 0),
      cropperProperties.ih - cropperProperties.scale
    );
  };

  const onDragEnd = () => {
    if (cropperProperties.disabled) return;

    scaling = false;
    dragging = false;
  };

  cropperCanvas.addEventListener("mousemove", onDragMove);
  cropperCanvas.addEventListener("mousedown", onDragStart);
  cropperCanvas.addEventListener("mouseup", onDragEnd);
  cropperCanvas.addEventListener("mouseleave", onDragEnd);

  cropperCanvas.addEventListener("touchstart", (e) => {
    const touch = e.touches.item(0);
    if (!touch) return;

    onDragMove(touchObjectAsMousePos(cropperCanvas, touch));
    onDragStart();
  });

  cropperCanvas.addEventListener("touchmove", (e) => {
    const touch = e.touches.item(0);
    if (!touch) return;

    onDragMove(touchObjectAsMousePos(cropperCanvas, touch));
  });

  cropperCanvas.addEventListener("touchcancel", onDragEnd);
  cropperCanvas.addEventListener("touchend", onDragEnd);
}
