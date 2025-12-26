import { dev } from "$app/environment";
import { mkdirSync } from "fs";

export const ACTIVE_FOLDER = dev
  ? "./debug-data"
  : "/service/storage/gitSystem";
export const DB_FILE_NAME = ACTIVE_FOLDER + "/gitSystem.db";
export const GIT_USER_HOME_FOLDER = ACTIVE_FOLDER + "/users/";

mkdirSync(ACTIVE_FOLDER, { recursive: true });
