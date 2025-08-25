import { dev } from "$app/environment";
import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";

export const DOMAIN = dev ? "http://localhost:5173" : "https://git.ane.jp.net";
export const ACTIVE_FOLDER = dev ? "./debug-data" : "/home/AZKi/gitSystem";

mkdirSync(ACTIVE_FOLDER, { recursive: true });
export const db = new Database(path.join(ACTIVE_FOLDER, "database.db"));

db.exec(`
CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    authorUsername TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contributors (
    -- whatever...
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contributorUsername TEXT NOT NULL,
    repository INTEGER NOT NULL,
    FOREIGN KEY (repository) REFERENCES repositories (id) ON DELETE CASCADE
);
`);
