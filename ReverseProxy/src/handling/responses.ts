import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import http from "http";
import Sys from "../logging";

export function replaceAll(msg: string, t: string, s: string) {
  while (msg.includes(t)) msg = msg.replace(t, s);
  return msg;
}

export function writeGatewayErrorNoClose(
  code: number,
  message: string,
  req: http.IncomingMessage,
  res: http.ServerResponse,

  containRayId = true
) {
  const isAPIEndpoint = (req.method ?? "post").toLowerCase() != "get";

  let rayid = "<not allowed for response>";
  if (containRayId) {
    rayid = replaceAll(randomUUID(), "-", "");
    Sys.error(
      "[response-error] RayID for error is " + rayid + " message is " + message
    );
  }

  if (isAPIEndpoint) {
    res.write(
      JSON.stringify({
        error: true,
        message,
        rayid,
      })
    );
  } else {
    let html = readFileSync("./message.html").toString();
    html = replaceAll(html, "%title", code + "");
    html = replaceAll(html, "%message", message);
    html = replaceAll(html, "%rayid", rayid);
    res.write(html);
  }

  return code;
}

export function writeGatewayError(
  code: number,
  message: string,
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  const isPost = (req.method ?? "post").toLowerCase() == "post";

  if (!res.headersSent) {
    res.writeHead(code, {
      "content-type": isPost ? "application/json" : "text/html",
    });
  } else {
    Sys.fatal("[shit-implementation]", "Idiot! headers already sent!");
  }

  writeGatewayErrorNoClose(code, message, req, res);
  res.end();
  return code;
}
