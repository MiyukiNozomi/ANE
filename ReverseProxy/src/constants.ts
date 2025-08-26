import { mkdirSync, readFileSync } from "fs";
import { homedir } from "os";
import path, { join } from "path";

export const IS_DEV_MODE = process.argv.includes("--dev");

export const LOG_FOLDER = IS_DEV_MODE
  ? "./logs"
  : join(homedir(), "proxy-logs");

mkdirSync(LOG_FOLDER, {
  recursive: true,
});

export const ERRORS_FILE = path.join(LOG_FOLDER, "/errors.txt");
export const DATABASE_FILE = IS_DEV_MODE
  ? "./proxyASN.db"
  : path.join(homedir(), "proxyASN.db");

export const DOMAIN_NAME = "ane.jp.net";

export const SSLConfig = IS_DEV_MODE
  ? null
  : {
      cert: readFileSync("./ssl/fullchain.pem"),
      key: readFileSync("./ssl/privkey.pem"),
    };
