import { log } from "console";
import { gatewayError, writeGatewayError } from "./responses";
import http from "http";

export function redirectTraffic(host: string, localPort: number, req: http.IncomingMessage, res: http.ServerResponse) {
    try {
        if (!req.url || !req.url.startsWith("/"))
            req.url = '/' + (req.url ?? "");

        const proxyReq = http.request(
            {
                hostname: '127.0.0.1',
                port: localPort,
                path: req.url,
                method: req.method,
                headers: req.headers,
            },
            (proxyRes) => {
                log("[response] [" + host + "] Reply for " + req.method + " " + req.url + " was " + proxyRes.statusCode);
                res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                proxyRes.pipe(res, { end: true });
            }
        );

        req.pipe(proxyReq, { end: true });

        proxyReq.on('error', (err) => {
            log("[response-error] Got an error! " + err);
            gatewayError(502, "Local server (at host '" + host + "') did not reply or is non-existant", req, res);
        });
    } catch (err) {
        log("[response-error] Got an exception! " + err);
        return writeGatewayError(500, "Internal error when contacting host '" + host + "' (exception thrown).", req, res);
    }
}