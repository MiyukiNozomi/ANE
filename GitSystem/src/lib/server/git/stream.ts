import { PassThrough } from "stream";

/**
 * Converts a Web ReadableStream into a Node.js Readable stream.
 * Unfortunately,
 * someone thought that having multiple declarations of streams that are completely incompatible with each other to be a good idea.
 */
export function webStreamToNodeStream(
  webStream: ReadableStream
): NodeJS.ReadableStream {
  const nodeStream = new PassThrough();
  const reader = webStream.getReader();

  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        nodeStream.write(value);
      }
    } catch (err) {
      nodeStream.destroy(err as Error);
    } finally {
      nodeStream.end();
    }
  })();

  return nodeStream;
}
