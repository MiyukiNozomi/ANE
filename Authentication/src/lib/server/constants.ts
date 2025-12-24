import path from "path";
import os from "os";

const DEVMODE = os.userInfo().username.toLowerCase() != "azki";
console.log("Dev? ", DEVMODE);

export const PROFILE_PICTURE_STORE_FOLDER = DEVMODE
  ? "./debug-storage/profilepictures"
  : path.join("/service/storage/profilepictures");
export const DATABASE_FILE = DEVMODE
  ? "./debug-storage/ane.db"
  : path.join("/service/storage/ane.db");
