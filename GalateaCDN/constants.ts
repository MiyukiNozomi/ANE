import os from "os";
import path from "path";

export const DEFAULT_CDN_FOLDER = "./default";
export const CURRENT_STORAGE_FOLDER = process.argv.includes("--dev")
  ? path.join(__dirname, "./storage")
  : path.join(os.homedir(), "/storage");

export const PORT = 3000;
export const MAX_AGE = "max-age=302800";
