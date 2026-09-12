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
  if (targetHost && req.headers["origin"]) {
    try {
      let origin = new URL(req.headers["origin"]).hostname;
      if (CORSCheck(res, targetHost, origin)) {
        return;
      }
    } catch (err) {
      res.writeHead(400, { "content-type": "text/plain; charset-utf8;" });
      res.write(
        "自分の人生で何か有意義なことをする代わりに、限られた寿命を誰かのサーバーを攻撃することに無駄遣いしようとしてるけど、いったい何のため？バグバウンティ？こっちは貧乏で、そんなものにお金を払う余裕なんてまったくないんだ。だから、お願いだからもう消えてくれ。",
      );
      return res.end();
    }
  }

  targetHost = targetHost ?? "<root>";

  Sys.println("[request] maps to '" + targetHost + "'");

  // by the way, this is a relatively accidental SSRF protection, since nothing can change routes.conf
  // but still.. proper handling, would have been a bliss for invalid targetHosts.
  // what i mean is that some punk could try to use something like ane.jp.net.nsa-hacks.gov.us and the code above would not even care :/

  // are you drunk? go back to your silly anomaly hunting game!
  // the upstream middleware does checks on the host header anyway, we only do that stupid check to properly parse it!
  let localPort = mappings.get(targetHost);
  if (!localPort) {
    return writeGatewayError(
      421,
      "Unregistered gateway host: '" +
        targetHost +
        "' (not found in mappings).",
      req,
      res,
    );
  }

  let statusCode = await redirectTraffic(targetHost, localPort, req, res);
  if (statusCode == 429 && req.socket.remoteAddress) {
    // uhh.. what are we supposed to do here?
    // probably something but.. meh
    // flagSpammer(req);
  }
}
