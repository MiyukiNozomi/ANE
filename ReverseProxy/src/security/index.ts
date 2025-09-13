import { IncomingMessage, ServerResponse } from "http";
import { HandleFunc } from "..";
import { shouldNotRateLimit } from "./ratelimit";
import { DOMAIN_NAME, IS_DEV_MODE } from "../constants";

export async function securityMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: HandleFunc
) {
  if (!IS_DEV_MODE && !(req.headers['host'] ?? "").includes(DOMAIN_NAME)) {
    res.writeHead(400, {
      'content-type': 'text/plain',
      'x-reason': 'ANE restriction: proper host header required'
    });
    res.write("Host Not Allowed or Missing");
    return res.end();
  }

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
