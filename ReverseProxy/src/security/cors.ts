import http from "http";
import { NoCORSCheckList } from "../config";
import { DOMAIN_NAME } from "../constants";

export function CORSCheck(
  res: http.ServerResponse,
  desiredHost: string,
  calleeHost: string
) {
  if (NoCORSCheckList.includes(desiredHost)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "false");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD");
    return false;
  }

  if (calleeHost.endsWith(DOMAIN_NAME)) {
    res.setHeader("Access-Control-Allow-Origin", calleeHost);
  } else {
    res.writeHead(403, "text/plain");
    res.write(`You're attempting to a request from hostname ${calleeHost} which is not allowed.
Either ensure you're sending the Host header (if you're trying to use my API from something like Java or cURL)
Or verify the URL you're using, note you should not access my web server through it's IP address directly, this reverse proxy wont
know where to take your request.

If you saw this error while accessing my current domain, it means I screwed up somewhere.
Contact me through miyuki@${DOMAIN_NAME} or at the discord 'miyukinozomi'`);
    res.end();
    return true;
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, HEAD");
  return false;
}
