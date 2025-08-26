import { readFileSync } from "fs";

export const IS_DEV_MODE = process.argv.includes("--dev");

export const DATABASE_FILE = IS_DEV_MODE
  ? "./proxyASN.db"
  : "/home/AZKi/proxyASN.db";

export const DOMAIN_NAME = "ane.jp.net";

export const SSLConfig = IS_DEV_MODE
  ? null
  : {
      cert: readFileSync("./ssl/fullchain.pem"),
      key: readFileSync("./ssl/privkey.pem"),
    };
