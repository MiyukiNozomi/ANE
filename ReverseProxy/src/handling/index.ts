import { IncomingMessage, ServerResponse } from "http";
import { DOMAIN_NAME } from "../constants";
import { mappings } from "../config";
import { writeGatewayError } from "./responses";
import { CORSCheck } from "../security/cors";
import { redirectTraffic } from "./redirect";
import Sys from "../logging";

export async function finalHandling(req: IncomingMessage, res: ServerResponse) {
  let targetHost = req.headers.host;

  if (req.url?.startsWith("/@")) {
    let hostnamePath = req.url.substring(2);
    targetHost = hostnamePath.includes("/")
      ? hostnamePath.substring(0, hostnamePath.indexOf("/"))
      : hostnamePath;
    req.url = req.url.substring(targetHost.length + 2);
  } else if (targetHost && targetHost.includes(`.${DOMAIN_NAME}`)) {
    targetHost = targetHost.substring(0, targetHost.indexOf(`.${DOMAIN_NAME}`));
  }

  // This check still has to be done here, we don't search the targetHost until the last stage anyway.
  if (
    targetHost &&
    req.headers["origin"] &&
    CORSCheck(res, targetHost, req.headers["origin"])
  ) {
    return;
  }

  targetHost = targetHost ?? "<root>";

  Sys.println("[request] maps to '" + targetHost + "'");

  let localPort = mappings.get(targetHost);
  if (!localPort) {
    return writeGatewayError(
      504,
      "Unregistered gateway host: '" +
        targetHost +
        "' (not found in mappings).",
      req,
      res
    );
  }

  let statusCode = await redirectTraffic(targetHost, localPort, req, res);
  if (statusCode == 429 && req.socket.remoteAddress) {
    // uhh.. what are we supposed to do here?
    // probably something but.. meh
    // flagSpammer(req);
  }
}
