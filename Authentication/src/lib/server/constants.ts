import { DEVMODE } from "$env/static/private";
import path from "path";

export const PROFILE_PICTURE_STORE_FOLDER = DEVMODE
  ? "./debug-storage/profilepictures"
  : path.join("/service/storage/profilepictures");
export const DATABASE_FILE = DEVMODE
  ? "./debug-storage/ane.db"
  : path.join("/service/storage/ane.db");
