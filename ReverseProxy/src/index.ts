import http, { IncomingMessage, ServerResponse } from "http";
import https from "https";
import { SSLConfig } from "./constants";
import { finalHandling } from "./handling";
import { maintenanceMiddleware } from "./maintenance";
import { securityMiddleware } from "./security";
import Sys from "./logging";
import { initASN } from "./security/asn";
import { execSync } from "child_process";

if (!process.setuid) throw "Wrong platform buddy!";

export type HandleFunc = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<any>;

export type MiddlewareFunction = (
  req: IncomingMessage,
  res: ServerResponse,
  func: HandleFunc
) => Promise<any>;

const middlewares = [securityMiddleware, maintenanceMiddleware];

async function runMiddlewares(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  finalHandler: HandleFunc
) {
  let ii = 0;

  Sys.println(
    "[" + req.socket.remoteAddress + "] " + encodeURI(req.method ?? "GET") + " " + encodeURI(req.url ?? '/')
  );

  const next = async () => {
    const mw = middlewares[ii++];

    if (mw) {
      await mw(req, res, next);
    } else {
      await finalHandler(req, res);
    }
  };

  await next();
}

const handleFunc: HandleFunc = async (req, res) =>
  await runMiddlewares(req, res, finalHandling);

const httpServer = http.createServer(handleFunc);
httpServer.on("listening", () =>
  Sys.println("[HTTP] Router has been launched.")
);

// SSLConfig == null means development mode
// if SSLConfig cannot the certificate, the program will crash way before this if-statement.
if (!SSLConfig) {
  httpServer.listen(6060);
  console.log("NOTE! router is at 6060 (DEVELOPMENT MODE)");
  initASN();
} else {
  const httpsServer = https.createServer(SSLConfig, handleFunc);

  httpsServer.on("listening", () =>
    Sys.println("[HTTPS] Router has been launched.")
  );

  httpServer.listen(80);
  httpsServer.listen(443);

  Sys.println("Servers listening! downgrading permissions to AZKi.");
  process.setuid("AZKi");
  Sys.println("Whoami? " + execSync("whoami") + "!");

  initASN();
}
