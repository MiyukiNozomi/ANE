import { IncomingMessage, ServerResponse } from "http";
import { HandleFunc } from "..";
import { shouldNotRateLimit } from "./ratelimit";

export async function securityMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: HandleFunc
) {
  if (!shouldNotRateLimit(req)) {
    res.writeHead(429);
    return res.end();
  }

  // just in case i forget to put LFI protection in a microservice
  if (!req.url || req.url.includes("..") || req.url.includes("%00")) {
    console.log("Request has been denied!");
    res.writeHead(403);
    res.write(
      "俺の返答はこれだ：NO（ノー）だ。マジでNO、消え失せろ！てか、お前ボットか？だったら…くたばれ！"
    );
    return res.end();
  }

  return await next(req, res);
}
