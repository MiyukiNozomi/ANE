
import { readFileSync } from "fs";

import http from "http";
import https from "https";
import { DomainName, SSLConfig } from "./constants";
import { redirectTraffic } from "./redirect";
import { CORSCheck, gatewayError } from "./responses";
import { log } from "./logging";

let mappings = new Map<string, number>();
export let NoCORSCheckList = new Array<string>();

{
    const confLines = readFileSync("./rules.conf").toString().split("\n").filter(v => v.trim().length > 0 && !v.trim().startsWith("#"));
    for (let line of confLines) {
        console.log(line);
        let ii = line.indexOf("=");
        let domain = line.substring(0, ii);
        let values = line.substring(ii + 1);
        let valuesArray = values.split(",");

        let port = parseInt(valuesArray[0]);

        if (isNaN(port))
            throw ("You moron! port was NOT a number for '" + domain + "': " + line.substring(ii + 1) + "recheck configuration!");

        if (values.includes("no-cors-check")) {
            log("Mapping for " + domain + " has CORS protection disabled, this isn't critical, but take note.");
            NoCORSCheckList.push(domain);
        }
        mappings.set(domain, port);
    }
    log("Loaded mappings: " + confLines);
}

const handleFunc = function (req: http.IncomingMessage, res: http.ServerResponse) {
    let targetHost = req.headers.host;

    if (req.url?.startsWith("/@")) {
        let hostnamePath = req.url.substring(2);
        targetHost = hostnamePath.includes("/") ? hostnamePath.substring(0, hostnamePath.indexOf("/")) : hostnamePath;
        req.url = req.url.substring(targetHost.length + 2);
    } else if (targetHost && targetHost.includes(`.${DomainName}`)) {
        targetHost = targetHost.substring(0, targetHost.indexOf(`.${DomainName}`));
    }
    targetHost = targetHost ?? "<root>";

    log("[request]", "[" + targetHost + "]", req.method, req.url);

    if (req.headers["origin"] && CORSCheck(res, targetHost, req.headers["origin"])) {
        // CORSCheck already handles errors like this anyway
        return;
    }

    let localPort = mappings.get(targetHost);
    if (!localPort) {
        return gatewayError(504, "Unregistered gateway host: '" + targetHost + "' (not found in mappings).", req, res);
    }

    redirectTraffic(targetHost, localPort, req, res);
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
