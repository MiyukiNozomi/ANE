import { exists, mkdirSync, readFileSync } from "fs";

export let LogFolder = "~/proxy-logs";

if (process.argv.includes("--dev")) {
    LogFolder = "./logs";
}

mkdirSync(LogFolder, {
    recursive: true
});

export const ErrorsFile = LogFolder + "/errors.txt";
export const LogFile = LogFolder + "/log.txt";
export const DomainName = "ane.jp.net";

export const SSLConfig = process.argv.includes("--dev") ? null : {
    cert: readFileSync("./ssl/fullchain.pem"),
    key: readFileSync("./ssl/privkey.pem")
};