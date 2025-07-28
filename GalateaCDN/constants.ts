import os from "os";
import path from "path";

export const DEFAULT_CDN_FOLDER = "./default";
export const CURRENT_STORAGE_FOLDER = process.argv.includes("--dev") ? "./storage" : path.join(os.homedir(), "/storage");
