
import { log } from "./logging";
import { gatewayError, writeGatewayError } from "./responses";
import http from "http";

export function redirectTraffic(host: string, localPort: number, req: http.IncomingMessage, res: http.ServerResponse) {
    try {
        if (!req.url || !req.url.startsWith("/"))
            req.url = '/' + (req.url ?? "");
        const requestMethod = (req.method ?? "get").toLowerCase();

        const proxyReq = http.request(
            {
                hostname: '127.0.0.1',
                port: localPort,
                path: req.url,
                method: requestMethod,
                headers: req.headers,
            },
            (proxyRes) => {
                log("[response] [" + host + "] Reply for " + requestMethod + " " + req.url + " was " + proxyRes.statusCode);
                proxyRes.headers["server"] = "Hoshimachi Anemachi";
                res.writeHead(proxyRes.statusCode ?? 500, proxyRes.headers);
                proxyRes.pipe(res, { end: true });
            }
        );
        proxyReq.on('error', (err) => {
            log("[response-error] Got an error! " + err);
            gatewayError(502, "Local server (at host '" + host + "') did not reply or is non-existant", req, res);
        });

        if (requestMethod == "post" || requestMethod == "put") {
            req.pipe(proxyReq, { end: true });
        } else {
            proxyReq.end();
        }
    } catch (err) {
        log("[response-error] Got an exception! " + err);
        return writeGatewayError(500, "Internal error when contacting host '" + host + "' (exception thrown).", req, res);
    }
}