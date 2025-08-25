import { readFileSync } from "fs";

import http from "http";
import https from "https";
import { DomainName, SSLConfig } from "./constants";
import { redirectTraffic } from "./redirect";
import { CORSCheck, gatewayError, writeGatewayError } from "./responses";
import { log } from "./logging";
import { MaintenanceMode, mappings } from "./config";

export const HOUR_IN_MILLISECONDS = 3600000;
export const MAX_REQUISITIONS = 200;
export const REQUISITIONS_FOR_BANNING = 250;

let requestCounter: Record<
  string,
  {
    count: number;
    startTime: number;
  }
> = {};
let bannedIPs = new Array<string>();

setInterval(() => {
  const keys = Object.keys(requestCounter);

  for (const key of keys) {
    delete requestCounter[key];
  }
}, HOUR_IN_MILLISECONDS);

const handleFunc = async function (
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  if (bannedIPs.includes(req.socket.remoteAddress ?? "")) {
    return req.socket.destroy();
  }

  let requestCount = -1;
  if (req.socket.remoteAddress) {
    let counterInfo = requestCounter[req.socket.remoteAddress];

    if (
      !counterInfo ||
      Date.now() - counterInfo.startTime > HOUR_IN_MILLISECONDS
    ) {
      counterInfo = requestCounter[req.socket.remoteAddress] = {
        count: 0,
        startTime: Date.now(),
      };
    }

    requestCount = counterInfo.count++;

    if (requestCount > REQUISITIONS_FOR_BANNING) {
      bannedIPs.push(req.socket.remoteAddress);
      delete requestCounter[req.socket.remoteAddress];
      log("[ratelimit] IP has been banned: " + req.socket.remoteAddress);
      return res.end();
    }

    if (requestCount > MAX_REQUISITIONS) {
      log(
        "[request]",
        "[Counter " +
          requestCount +
          "] " +
          req.method +
          " " +
          req.url +
          " -- rate limited (not processing it)"
      );
      res.writeHead(429);
      return res.end();
    }
  }

  // extra feature...
  if (MaintenanceMode) {
    if (req.method?.toLowerCase() != "get") {
      res.writeHead(503, { "content-type": "application/json" });
      res.write(JSON.stringify({ message: "Maintenance mode." }));
    } else {
      res.writeHead(503, { "content-type": "text/html" });
      res.write(readFileSync("./maintenance.html"));
    }
    return res.end();
  }

  let targetHost = req.headers.host;

  if (req.url?.startsWith("/@")) {
    let hostnamePath = req.url.substring(2);
    targetHost = hostnamePath.includes("/")
      ? hostnamePath.substring(0, hostnamePath.indexOf("/"))
      : hostnamePath;
    req.url = req.url.substring(targetHost.length + 2);
  } else if (targetHost && targetHost.includes(`.${DomainName}`)) {
    targetHost = targetHost.substring(0, targetHost.indexOf(`.${DomainName}`));
  }
  targetHost = targetHost ?? "<root>";

  log(
    "[request]",
    "[" + targetHost + "] [Counter " + requestCount + "]",
    req.method,
    req.url
  );

  if (
    req.headers["origin"] &&
    CORSCheck(res, targetHost, req.headers["origin"])
  ) {
    // CORSCheck already handles errors like this anyway
    return;
  }

  let localPort = mappings.get(targetHost);
  if (!localPort) {
    return gatewayError(
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
    // That's bad, and we're immediately placing a hard limit on the individual:
    requestCounter[req.socket.remoteAddress].count = MAX_REQUISITIONS + 1;
    log(
      "[ratelimit] IP " +
        req.socket.remoteAddress +
        " has been ordered by microservice '" +
        targetHost +
        "' to be ratelimited."
    );
  }
};

const httpServer = http.createServer(handleFunc);
httpServer.on("listening", () => log("[HTTP] Router has been launched."));

// SSLConfig == null means development mode
// if SSLConfig cannot the certificate, the program will crash way before this if-statement.
if (!SSLConfig) {
  httpServer.listen(6060);
  console.log("NOTE! router is at 6060 (DEVELOPMENT MODE)");
} else {
  const httpsServer = https.createServer(SSLConfig, handleFunc);

  httpsServer.on("listening", () => log("[HTTPS] Router has been launched."));

  httpServer.listen(80);
  httpsServer.listen(443);
}
