import os from "os";
import path from "path";

export const IS_DEV_MODE = process.argv.includes("--dev");
export const DEFAULT_CDN_FOLDER = "./default";
export const CURRENT_STORAGE_FOLDER = IS_DEV_MODE
  ? "./storage"
  : path.join(os.homedir(), "/storage");

export const PORT = 3000;
export const MAX_AGE = "max-age=302800";

export type ImageScales = {
  path: string;
  w: number;
  h: number;
};
