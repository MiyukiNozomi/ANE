import Sys from "../logging";
import { writeGatewayError, writeGatewayErrorNoClose } from "./responses";
import http from "http";

// TODO.. add support for web sockets?

const HeaderBlacklist = [
  "access-control-allow-credentials",
  "access-control-allow-headers",
  "access-control-allow-methods",
  "access-control-allow-origin",
  "access-control-expose-headers",
  "access-control-max-age",
  "access-control-request-headers",
  "access-control-request-method",
  // go on, try it bitch.
  // ..although, nothing downstream uses these headers.. who knows.
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-http-method-override",
] as const satisfies readonly (keyof http.IncomingHttpHeaders)[];

export async function redirectTraffic(
  host: string,
  localPort: number,
  req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  const promise = new Promise<number>((resolve) => {
    if (!req.url || !req.url.startsWith("/")) req.url = "/" + (req.url ?? "");
    const requestMethod = (req.method ?? "get").toLowerCase();

    // we used to blindly re-pass this. now we're only passing very specific headers.
    let safeInboundHeaders = { ...req.headers };

    for (const pH of HeaderBlacklist) {
      if (safeInboundHeaders[pH]) delete safeInboundHeaders[pH];
    }

    const proxyReq = http.request(
      {
        hostname: "10.0.1." + localPort,
        port: 3000,
        path: req.url,
        method: requestMethod,
        headers: safeInboundHeaders,
      },
      (proxyRes) => {
        Sys.error(
          "[response] [" +
            host +
            "] Reply for " +
            requestMethod +
            " " +
            req.url +
            " was " +
            proxyRes.statusCode,
        );
        proxyRes.headers["server"] = "Hoshimachi Anemachi";

        let safeOutboundHeaders = proxyRes.headers;

        for (const pH of HeaderBlacklist) {
          if (safeOutboundHeaders[pH]) delete safeOutboundHeaders[pH];
        }

        res.writeHead(proxyRes.statusCode ?? 500, safeOutboundHeaders);
        proxyRes.pipe(res, { end: true });

        resolve(proxyRes.statusCode ?? 500);
      },
    );
    proxyReq.on("error", (err) => {
      Sys.error("[response-error] Got an error! " + err);
      writeGatewayError(
        502,
        "Local server (at host '" +
          host +
          "') did not reply or is non-existant",
        req,
        res,
      );
      resolve(502);
    });

    if (
      requestMethod == "post" ||
      requestMethod == "put" ||
      requestMethod == "delete"
    ) {
      req.pipe(proxyReq, { end: true });
    } else {
      proxyReq.end();
    }
  });

  try {
    return await promise;
  } catch (err) {
    Sys.error("[response-error] Got an exception! " + err);
    return writeGatewayErrorNoClose(
      500,
      "Internal error when contacting host '" + host + "' (exception thrown).",
      req,
      res,
    );
  }
}
