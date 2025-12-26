import Database from "better-sqlite3";
import { DATABASE_FILE } from "./constants";
import { mkdirSync, readdirSync } from "node:fs";
import {
  type Account,
  type Session,
  type ThirdPartySessionRequest,
} from "./schema";
import { dirname } from "node:path";
import { AUTHORIZATION_REQUEST_EXPIRATION } from "./keystores";
import { GenericDatabaseTable } from "./ANEDB";

mkdirSync(dirname(DATABASE_FILE), { recursive: true });
const sqlite = Database(DATABASE_FILE);

export const db = {
  accounts: new GenericDatabaseTable<Account>(
    "Accounts",
    sqlite,
    {},
    {
      creationStatement: `
    id INTEGER PRIMARY KEY,
    displayName TEXT,

    username TEXT NOT NULL,
    passwordHash TEXT NOT NULL,

    totpSecret TEXT,
    recoveryKey TEXT,

    isAdmin BOOLEAN DEFAULT FALSE,
    
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now')) -- unix time (seconds)`,
      extraRequiredColumns: [],
    },
  ),
  sessions: new GenericDatabaseTable<Session>(
    "Sessions",
    sqlite,
    {
      onQueryResult: async (result) => {
        if (result && Date.now() / 1000 - result.createdAt > result.expiresIn) {
          console.log(
            "Drop session: ",
            result,
            " expired for ",
            Date.now() - result.createdAt,
            " seconds.",
          );
          await db.sessions.delete({ id: result.id });
          return null;
        } else if (result) {
          // this is because no native boolean type in SQLite, its just an integer alias.
          result.isThirdPartySession = result.isThirdPartySession
            ? true
            : false;
        }
        return result;
      },
    },
    {
      creationStatement: ` id TEXT PRIMARY KEY,

    userId INTEGER NOT NULL,
    isThirdPartySession BOOLEAN DEFAULT TRUE,

    createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
    FOREIGN KEY (userId) REFERENCES Accounts (id)`,
      extraRequiredColumns: [
        {
          columnName: "expiresIn",
          creationStatement: "ADD COLUMN expiresIn INTEGER NOT NULL",
        },
      ],
    },
  ),
  thirdPartyRequests: new GenericDatabaseTable<ThirdPartySessionRequest>(
    "ThirdPartySessionRequest",
    sqlite,
    {
      onQueryResult: async (obj) => {
        if (
          obj &&
          Date.now() / 1000 - obj.createdAt > AUTHORIZATION_REQUEST_EXPIRATION
        ) {
          console.log(
            "Drop authRequest: ",
            obj,
            " expired for ",
            Date.now() - obj.createdAt,
            " seconds.",
          );
          await db.thirdPartyRequests.delete({ id: obj.id });
          return null;
        }
        return obj;
      },
    },
    {
      creationStatement: `
    id TEXT PRIMARY KEY,
    sharedSecret TEXT NOT NULL,
    
    realm TEXT NOT NULL,

    -- NOT ACTUALLY A WEBHOOK, JUST A REDIRECT URL.
    webhookURL TEXT,
    
    sessionId TEXT DEFAULT NULL,
    
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
    FOREIGN KEY (sessionId) REFERENCES Sessions(id)`,
      extraRequiredColumns: [],
    },
  ),
};
