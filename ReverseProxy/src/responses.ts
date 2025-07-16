
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import http from "http";
import { DomainName } from "./constants";
import { NoCORSCheckList } from ".";
import { log } from "./logging";

export function CORSCheck(res: http.ServerResponse, desiredHost: string, calleeHost: string) {
    if (NoCORSCheckList.includes(desiredHost)) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Credentials", "false");
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD");
        return false;
    }

    if (calleeHost.endsWith(DomainName)) {
        res.setHeader("Access-Control-Allow-Origin", calleeHost);
    } else {
        res.writeHead(403, "text/plain");
        res.write(`You're attempting to a request from hostname ${calleeHost} which is not allowed.
Either ensure you're sending the Host header (if you're trying to use my API from something like Java or cURL)
Or verify the URL you're using, note you should not access my web server through it's IP address directly, this reverse proxy wont
know where to take your request.

If you saw this error while accessing my current domain, it means I screwed up somewhere.
Contact me through miyuki@${DomainName} or at the discord 'miyukinozomi'`);
        res.end();
        return true;
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, HEAD");
    return false;
}

export function replaceAll(msg: string, t: string, s: string) {
    while (msg.includes(t))
        msg = msg.replace(t, s);
    return msg;
}

export function writeGatewayError(code: number, message: string, req: http.IncomingMessage, res: http.ServerResponse) {
    const isAPIEndpoint = (req.method ?? "post").toLowerCase() != "get";

    const rayid = replaceAll(randomUUID(), "-", "");
    log("[response-error] RayID for error is " + rayid);
    log("[response-error] Message is " + message);

    if (isAPIEndpoint) {
        res.write(JSON.stringify({
            error: true,
            message,
            rayid
        }));
    } else {
        let html = readFileSync("./message.html").toString();
        html = replaceAll(html, "%title", code + "");
        html = replaceAll(html, "%message", message);
        html = replaceAll(html, "%rayid", rayid);
        res.write(html);
    }

}

export function gatewayError(code: number, message: string, req: http.IncomingMessage, res: http.ServerResponse) {
    const isPost = (req.method ?? "post").toLowerCase() == "post";

    if (!res.headersSent) {
        res.writeHead(code, {
            "content-type": isPost ? "application/json" : "text/html"
        });
    } else {
        log("[shit-implementation] [error]", "Idiot! headers already sent!");
    }

    writeGatewayError(code, message, req, res);
    return res.end();
}