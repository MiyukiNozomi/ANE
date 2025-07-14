import { readFileSync } from "fs";

export const ErrorsFile = "./logs/errors.txt";
export const LogFile = "./logs/log.txt";
export const DomainName = "ane.jp.net";

export const SSLConfig = process.argv.includes("--dev") ? null : {
    cert: readFileSync("./ssl/fullchain.pem"),
    key: readFileSync("./ssl/privkey.pem")
};