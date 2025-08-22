import { dev } from "$app/environment";
import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";

export const DOMAIN = dev ? "http://localhost:5173" : "https://git.ane.jp.net";
export const ACTIVE_FOLDER = dev ? "./debug-data" : "/home/AZKi/gitSystem";

mkdirSync(ACTIVE_FOLDER, { recursive: true });
export const db = new Database(path.join(ACTIVE_FOLDER, "database.db"));
