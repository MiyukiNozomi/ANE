import type { ClientSideAccount } from "$lib/client/API/apiTypes";
import type Database from "better-sqlite3";

export interface Account {
  id: number;
  displayName: string | null;
  username: string;
  passwordHash: string;
  totpSecret: string | null;
  recoveryKey: string | null;
  isAdmin: boolean;
  createdAt: number;
}

export interface Session {
  id: string;
  userId: number;
  expiresIn: number;
  isThirdPartySession: boolean;
  createdAt: number;
}

export interface ThirdPartySessionRequest {
  id: string;
  sharedSecret: string;
  realm: string;
  webhookURL: string | null;
  sessionId: string | null;
  createdAt: number;
}

export function accountToClientInfo(acc: Account): ClientSideAccount {
  return {
    id: acc.id,
    displayName: acc.displayName,
    name: acc.username,
    isAdmin: acc.isAdmin,
    createdAt: acc.createdAt,
  };
}

export function applySchema(sqlite: Database.Database) {
  sqlite.exec(`
CREATE TABLE IF NOT EXISTS Accounts (
    id INTEGER PRIMARY KEY,
    displayName TEXT,

    username TEXT NOT NULL,
    passwordHash TEXT NOT NULL,

    totpSecret TEXT,
    recoveryKey TEXT,

    isAdmin BOOLEAN DEFAULT FALSE,
    
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now')) -- unix time (seconds)
);

CREATE TABLE IF NOT EXISTS Sessions (
    id TEXT PRIMARY KEY,

    userId INTEGER NOT NULL,
    isThirdPartySession BOOLEAN DEFAULT TRUE,

    createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
    FOREIGN KEY (userId) REFERENCES Accounts (id)
);
CREATE TABLE IF NOT EXISTS ThirdPartySessionRequest (
    id TEXT PRIMARY KEY,
    sharedSecret TEXT NOT NULL,
    
    realm TEXT NOT NULL,

    -- NOT ACTUALLY A WEBHOOK, JUST A REDIRECT URL.
    webhookURL TEXT,
    
    sessionId TEXT DEFAULT NULL,
    
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
    FOREIGN KEY (sessionId) REFERENCES Sessions(id)
);
`);

  applyIfColumnNotExists(
    sqlite,
    "Sessions",
    "expiresIn",
    "ADD COLUMN expiresIn INTEGER NOT NULL",
  );
}

/**** this function is not using prepared statements, please do not pass user input here */
function applyIfColumnNotExists(
  sqlite: Database.Database,
  table: string,
  column: string,
  migration: string,
) {
  // Get list of columns in the table
  const columns: { name: string }[] = (
    sqlite.pragma(`table_info(${table})`) as any
  ).map((row: any) => ({ name: row.name }));

  const columnExists = columns.some((col) => col.name === column);

  if (!columnExists) {
    console.log(
      `Column "${column}" not found in table "${table}". Applying migration...`,
    );
    sqlite.exec(`ALTER TABLE ${table} ${migration}`);
    console.log(`Migration applied: ALTER TABLE ${table} ${migration}`);
  } else {
    console.log(
      `Column "${column}" already exists in table "${table}". Skipping migration.`,
    );
  }
}
