import Database from "better-sqlite3";
import { DATABASE_FILE } from "./constants";
import { mkdirSync, readdirSync } from "node:fs";
import {
  applySchema,
  type Account,
  type Session,
  type ThirdPartySessionRequest,
} from "./schema";
import { dirname } from "node:path";
import { AUTHORIZATION_REQUEST_EXPIRATION } from "./keystores";

mkdirSync(dirname(DATABASE_FILE), { recursive: true });
const sqlite = Database(DATABASE_FILE);

applySchema(sqlite);

const findAccountByNameQuery = sqlite.prepare(
  "SELECT * FROM Accounts WHERE username = ?",
);
const findAccountByIdQuery = sqlite.prepare(
  "SELECT * FROM Accounts WHERE id = ?",
);
const updateAccountDisplayName = sqlite.prepare(
  "UPDATE Accounts SET displayName = ? WHERE id = ?",
);
const insertAccountStatement = sqlite.prepare(
  "INSERT INTO Accounts(username, passwordHash) VALUES (?, ?)",
);

const findSessionByIdQuery = sqlite.prepare(
  "SELECT * FROM Sessions WHERE id = ?",
);
const insertSessionStatement = sqlite.prepare(
  "INSERT INTO Sessions(id, userId, expiresIn, isThirdPartySession) VALUES (?, ?, ?, ?)",
);
const deleteSessionStatement = sqlite.prepare(
  "DELETE FROM Sessions WHERE id = ?",
);

const findAuthorizationRequestByIdQuery = sqlite.prepare(
  "SELECT * FROM ThirdPartySessionRequest WHERE id = ?",
);
const findAuthorizationRequestBySecret = sqlite.prepare(
  "SELECT * FROM ThirdPartySessionRequest WHERE sharedSecret = ?",
);
const updateAuthorizationSessionId = sqlite.prepare(
  "UPDATE ThirdPartySessionRequest SET sessionId = ? WHERE id = ?",
);
const insertAuthorizationRequestStatement = sqlite.prepare(
  "INSERT INTO ThirdPartySessionRequest(id, sharedSecret, realm, webhookURL) VALUES(?, ?, ?, ?)",
);
const deleteAuthorizationRequestById = sqlite.prepare(
  "DELETE FROM ThirdPartySessionRequest WHERE id = ?",
);

export const db = {
  accounts: {
    ofId: async (id: number) =>
      (findAccountByIdQuery.all(id)[0] as Account | undefined) ?? null,
    ofName: async (username: string) =>
      (findAccountByNameQuery.all(username)[0] as Account | undefined) ?? null,
    insert: async (data: { username: string; passwordHash: string }) =>
      Number(
        insertAccountStatement.run(data.username, data.passwordHash)
          .lastInsertRowid,
      ),
    updateDisplayName: async (id: number, displayName: string) =>
      updateAccountDisplayName.run(displayName, id),
  },
  sessions: {
    ofId: async (id: string) => {
      let obj =
        (findSessionByIdQuery.all(id)[0] as Session | undefined) ?? null;
      if (obj && Date.now() / 1000 - obj.createdAt > obj.expiresIn) {
        console.log(
          "Drop session: ",
          obj,
          " expired for ",
          Date.now() - obj.createdAt,
          " seconds.",
        );
        deleteSessionStatement.run(id);
        return null;
      } else if (obj) {
        // this is because no native boolean type in SQLite, its just an integer alias.
        obj.isThirdPartySession = obj.isThirdPartySession ? true : false;
      }
      return obj;
    },
    delete: async (id: string) => deleteSessionStatement.run(id),
    insert: async (data: {
      id: string;
      userId: number;
      expiresIn: number;
      isThirdPartySession: boolean;
    }) => {
      insertSessionStatement.run(
        data.id,
        data.userId,
        data.expiresIn,
        data.isThirdPartySession ? 1 : 0,
      );
    },
  },
  thirdPartyRequests: {
    ofId: async (id: string) => {
      let obj =
        (findAuthorizationRequestByIdQuery.all(id)[0] as
          | ThirdPartySessionRequest
          | undefined) ?? null;
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
        deleteAuthorizationRequestById.run(id);
        return null;
      }
      return obj;
    },
    ofSecret: async (secret: string) => {
      let obj =
        (findAuthorizationRequestBySecret.all(secret)[0] as
          | ThirdPartySessionRequest
          | undefined) ?? null;
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
        deleteAuthorizationRequestById.run(obj.id);
        return null;
      }
      return obj;
    },
    updateSession: async (id: string, sessionId: string) =>
      updateAuthorizationSessionId.run(sessionId, id),
    insert: async (
      id: string,
      sharedSecret: string,
      realm: string,
      webhookURL: string | null,
    ) => {
      return insertAuthorizationRequestStatement.run(
        id,
        sharedSecret,
        realm,
        webhookURL,
      );
    },
    delete: async (id: string) => deleteAuthorizationRequestById.run(id),
  },
};
