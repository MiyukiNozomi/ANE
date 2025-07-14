import { appendFileSync, existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { ErrorsFile, LogFile } from "./constants";

if (existsSync(LogFile)) {
    const f = readFileSync(LogFile).toString().split("\n");
    log("[WARN] Cleanup process initiated.");

    let final = "";
    for (let line of f) {
        const lowercased = line.toLowerCase();
        if (!lowercased.includes("warn") && !lowercased.includes("error"))
            continue;
        final += line + "\n";
    }

    writeFileSync(ErrorsFile, final);
    rmSync(LogFile);
}

export function log(...b: any[]) {
    let t = b.map(t => t + "").join(" ");
    let msg = (new Date()).toISOString() + ": " + t;
    appendFileSync(LogFile, msg + "\n");
    console.log(msg);
}