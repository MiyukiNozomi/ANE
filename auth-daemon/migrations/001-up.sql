PRAGMA integrity_check;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,

    displayName TEXT DEFAULT NULL,

    name TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    
    totpSecret TEXT, /* null if the person lacks TOTP*/
    recoveryEmail TEXT,

    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')) -- unix time (seconds)
);

CREATE TABLE IF NOT EXISTS sessions  (
    id TEXT PRIMARY KEY,
    
    user_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
    
    FOREIGN KEY (user_id) REFERENCES users (id)
);