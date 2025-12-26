import Database from "better-sqlite3";
import { GenericDatabaseTable } from "./ANEDBLib";

const sqlite3 = Database("./test.db");

export interface Account {
  id: number;
  displayName: string | null;
  username: string;
  passwordHash: string;
  totpSecret: string | null;
  recoveryKey: string | null;
  isAdmin: boolean;
  createdAt: number;
  expiresIn: number;
}

const db = {
  users: new GenericDatabaseTable<Account>(
    "Users",
    sqlite3,
    {
      onQueryResult: (v) => {
        console.log("I HAVE BEEN CALLED.");
        return v;
      },
    },
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
      extraRequiredColumns: [
        {
          columnName: "expiresIn",
          creationStatement: "ADD COLUMN expiresIn INTEGER NOT NULL",
        },
      ],
    },
  ),
};

db.users.insert({
  username: "gay",
  passwordHash: "betaaaaa",
  expiresIn: 3191591168198198916,
});

console.log(
  db.users.whereFirst({
    username: "gay",
  }),
);

db.users.update({
  where: {
    id: 4,
  },
  data: {
    displayName: "I AM DUMB",
  },
});

db.users.delete({
  id: 5,
});
