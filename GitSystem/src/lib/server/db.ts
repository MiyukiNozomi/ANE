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
    
    displayName TEXT DEFAULT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    authorUsername TEXT NOT NULL,

    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')) -- unix time (seconds)
);

CREATE TABLE IF NOT EXISTS contributors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    contributorUsername TEXT NOT NULL,
    repository INTEGER NOT NULL,
    
    FOREIGN KEY (repository) REFERENCES repositories (id) ON DELETE CASCADE,

    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')) -- unix time (seconds)
);
`);
