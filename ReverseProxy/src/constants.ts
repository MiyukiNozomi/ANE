import { readFileSync } from "fs";
import Sys from "./logging";

export const IS_PREBUILD_SCRIPT = process.argv.includes("prebuild");
export const IS_DEV_MODE = process.argv.includes("--dev");

export const DATABASE_FILE = IS_DEV_MODE
  ? "./proxyASN.db"
  : "/home/AZKi/proxyASN.db";

export const DOMAIN_NAME = "ane.jp.net";

if (IS_PREBUILD_SCRIPT) {
  Sys.println(
    "⚠️ You are running the prebuild script! if this is a false alarm, things will go really bad! ⚠️"
  );
}

export const SSLConfig =
  IS_DEV_MODE || IS_PREBUILD_SCRIPT
    ? null
    : {
        cert: readFileSync("./ssl/fullchain.pem"),
        key: readFileSync("./ssl/privkey.pem"),
      };
