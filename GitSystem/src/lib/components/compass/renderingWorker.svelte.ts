export let renderingWorkers = new Array<Worker>();

export function createRenderingWorkerPromise(
  targetWorkerModule: typeof import("*?worker"),
  targetCanvas: HTMLCanvasElement | null | undefined,
  customSetup?: () => void,
) {
  return new Promise<void>(async (resolve, reject) => {
    const workerInstance = new targetWorkerModule.default();

    workerInstance.onmessage = (r) => {
      if (r.data.ok) {
        resolve();
      }
    };
    workerInstance.onerror = (err) => reject(err);

    targetCanvas!.width = window.screen.width;
    targetCanvas!.height = window.screen.height;

    if (customSetup) customSetup();
    const offscreen = targetCanvas!.transferControlToOffscreen();
    workerInstance.postMessage({ canvas: offscreen }, [offscreen]);
  });
}
