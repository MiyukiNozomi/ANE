import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  USERNAME_SAFETY_REGEX,
} from "$lib/shared/safety";
import { argon2id, hash, verify } from "argon2";
import { db } from "./db";
import type {
  AccountSecurityInfo,
  AccountInfo,
  UserSessionInfo,
  TwoFactorStep1Start,
  TwoFactorStepFinish,
  AuthorizationStatus,
  GetSessionsInfo,
  APIResponse,
  EmptyButOkResponse,
  AuthorizationRequestCreationInfo,
} from "./serviceTypes";
import { TimeBasedOTP } from "./totp";
import type { User } from "./db/schema";

export namespace Backend {
  // Utilities
  export function userToAccountInfo(user: User): AccountInfo {
    return {
      ...user,
      passwordHash: null,
      totpBackupCode: null,
      totpSecret: null,
    } satisfies AccountInfo;
  }

  export async function createUserToken(
    userId: string,
    tokenType: "ROOT" | "API" | "API_REMEMBER_ME",
    realmName?: string,
  ): Promise<APIResponse<UserSessionInfo>> {
    let acc = db.of("User").fetch(userId);
    if (!acc) return { error: "ERR_UNKNOWN_ACCOUNT" };

    let expiresIn = 24 * 60 * 60 * 1000; // A day.
    if (tokenType == "API")
      expiresIn *= 7; // a week.
    else if (tokenType == "API_REMEMBER_ME") expiresIn *= 30; // a month

    // so we got around 70 * 8 bits of entropy.. good enoguh
    let sessionToken = TimeBasedOTP.genAuthToken();

    // insertion doesnt allows us to set the ID so...
    let session = db.of("Session").update({
      id: sessionToken,
      expiresIn,
      userId,
      isThirdPartySession: tokenType != "ROOT",
      realmName: realmName ?? "ANE Root Access",
      createdAt: Date.now(),
      updatedAt: 0,
    });

    return {
      object: {
        session,
        accountInfo: userToAccountInfo(acc),
      },
    };
  }

  // Actual API implementations..
  // Input parameter handling is NOT done here! check individual +server.ts files on routes/api
  // For ratelimiting, see ANE ReverseProxy on repo root.

  export async function getAccount(
    query: { username: string } | { userId: string },
  ): Promise<APIResponse<AccountInfo>> {
    let account =
      "userId" in query
        ? db.of("User").fetch(query.userId)
        : db.with("User", (store) => store.fetch(store.queryFirst(query)));

    if (!account) return { error: "ERR_UNKNOWN_ACCOUNT" };
    return {
      object: userToAccountInfo(account),
    };
  }

  export async function newAuthorizationRequest(
    sharedSecret: string,
    realm: string,
    redirectURL?: string,
  ): Promise<APIResponse<AuthorizationRequestCreationInfo>> {
    if (db.of("ThirdPartySessionRequest").queryFirst({ sharedSecret })) {
      return { error: "ERR_REQUEST_EXISTS" };
    }

    let { id } = db.of("ThirdPartySessionRequest").insert({
      sharedSecret,
      redirectURL: redirectURL ?? null,
      realm: realm,
      sessionId: null,

      expiresIn: 5 * 60 * 1000, // 5 minutes
    });

    return { object: { "request-code": id } };
  }

  export async function getAuthorizationStatus(
    req: { id: string } | { sharedSecret: string },
  ): Promise<APIResponse<AuthorizationStatus>> {
    let authStatus = db.with("ThirdPartySessionRequest", (t) =>
      t.fetch(t.queryFirst(req)),
    );
    if (!authStatus) {
      return { error: "ERR_REQUEST_MISSING" };
    }

    let responseObject = {
      ...authStatus,
      // Yeet out that... cant risk that going through.
      sharedSecret: undefined,
      authStatus: Boolean(authStatus.sessionId)
        ? "AUTHORIZED"
        : "AWAITING_AUTHORIZATION",
    } satisfies AuthorizationStatus;

    // For security purposes, we null out session information
    // if requesting from the request code.
    // Since the request code is the view-only read ticket.
    // TODO: do we really need this weird system?
    // actually, screw it.
    if ("id" in req) {
      responseObject.sessionId = null;
    }

    return {
      object: responseObject,
    };
  }

  /**
    Registers a user, returns a string error on failure.
  */
  export async function register(
    username: string,
    password: string,
  ): Promise<APIResponse<UserSessionInfo>> {
    if (
      !USERNAME_SAFETY_REGEX.test(username) ||
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      return { error: "ERR_BAD_CREDENTIALS" };
    }

    if (db.of("User").queryFirst({ username }))
      return { error: "ERR_ACCOUNT_EXISTS" };

    let { id } = db.of("User").insert({
      capabilities: [],
      displayName: username,
      username,
      passwordHash: await hash(password, { type: argon2id }),
      totpBackupCode: null,
      totpSecret: null,
    });

    return await createUserToken(id, "ROOT");
  }

  export async function login(
    username: string,
    password: string,
    twoFactorCode?: string,
  ): Promise<APIResponse<UserSessionInfo>> {
    if (
      !USERNAME_SAFETY_REGEX.test(username) ||
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      return { error: "ERR_BAD_CREDENTIALS" };
    }

    let acc = db.with("User", (t) => t.fetch(t.queryFirst({ username })));
    if (!acc) return { error: "ERR_UNKNOWN_ACCOUNT" };

    if (!verify(password, acc.passwordHash)) {
      return { error: "ERR_INCORRECT_PASSWORD" };
    }

    if (acc.totpSecret) {
      if (!twoFactorCode) {
        return { error: "ERR_TWOFACTOR_REQUIRED" };
      } else if (!TimeBasedOTP.verify(twoFactorCode, acc.totpSecret, 2)) {
        return { error: "ERR_INCORRECT_ONETIME_PASSWORD" };
      }
    }

    return await createUserToken(acc.id, "ROOT");
  }

  /**
       Logged in endpoints
   */
  export async function twoFactorEnableStep1(
    userId: string,
  ): Promise<APIResponse<TwoFactorStep1Start>> {
    const acc = db.of("User").fetch(userId);

    if (!acc) return { error: "ERR_UNKNOWN_ACCOUNT" };
    if (acc.totpSecret) return { error: "ERR_TWOFACTOR_ALREADY_ENABLED" };

    const { totpSecret } = db.of("TwoFactorSetupInformation").insert({
      totpSecret: TimeBasedOTP.genSecret(),
      userId: acc.id,
    });

    return {
      object: {
        "shared-secret": totpSecret,
      },
    };
  }

  export async function twoFactorEnableFinalStep(
    twofactorCode: string,
    authToken: string,
  ): Promise<APIResponse<TwoFactorStepFinish>> {
    let session = db.of("Session").fetch(authToken);
    if (!session) return { error: "ERR_BAD_CREDENTIALS" };
    if (session.isThirdPartySession) return { error: "ERR_NOT_ALLOWED" };

    let acc = db.of("User").fetch(session.userId);
    if (!acc) return { error: "ERR_UNKNOWN_ACCOUNT" };

    const step1Info = db.with("TwoFactorSetupInformation", (t) =>
      t.fetch(t.queryFirst({ userId: acc.id })),
    );
    if (!step1Info) return { error: "ERR_TWOFACTOR_REQUEST_MISSING" };

    if (!TimeBasedOTP.verify(twofactorCode, step1Info.totpSecret)) {
      return { error: "ERR_INCORRECT_ONETIME_PASSWORD" };
    }

    acc.totpBackupCode = TimeBasedOTP.genRecoveryKey();
    db.of("User").update(acc);

    db.of("TwoFactorSetupInformation").delete(step1Info.id);

    db.with("Session", (table) => {
      table.queryAll({ userId: acc.id }).forEach((sessionId) => {
        if (sessionId !== authToken) {
          table.delete(sessionId);
        }
      });
    });

    return {
      object: {
        "recovery-key": acc.totpBackupCode,
      },
    };
  }

  export async function disable2FASupport(
    recoveryKey: string,
    authToken: string,
  ): Promise<APIResponse<EmptyButOkResponse>> {
    let session = db.of("Session").fetch(authToken);
    if (!session) return { error: "ERR_BAD_CREDENTIALS" };
    if (session.isThirdPartySession) return { error: "ERR_NOT_ALLOWED" };
    let acc = db.of("User").fetch(session.userId);
    if (!acc) return { error: "ERR_UNKNOWN_ACCOUNT" };
    if (!acc.totpSecret) return { error: "ERR_TWOFACTOR_NOT_ENABLED" };

    if (acc.totpBackupCode == recoveryKey) {
      acc.totpSecret = null;
      db.of("User").update(acc);
      return { object: { ok: true } };
    }
    return { error: "ERR_INCORRECT_RECOVERY_CODE" };
  }

  export async function getSecurityInfo(
    authToken: string,
  ): Promise<APIResponse<AccountSecurityInfo>> {
    let session = db.of("Session").fetch(authToken);
    if (!session) return { error: "ERR_BAD_CREDENTIALS" };
    if (session.isThirdPartySession) return { error: "ERR_NOT_ALLOWED" };
    let acc = db.of("User").fetch(session.userId);
    if (!acc) return { error: "ERR_UNKNOWN_ACCOUNT" };

    db.of("User").update(acc);

    return {
      object: {
        has2FA: Boolean(acc.totpSecret),
      },
    };
  }

  export async function setDisplayName(
    displayname: string,
    authToken: string,
  ): Promise<APIResponse<AccountInfo>> {
    if (
      displayname.length > MAX_USERNAME_LENGTH ||
      displayname.length < MIN_USERNAME_LENGTH
    )
      return { error: "ERR_BAD_CREDENTIALS" };

    let session = db.of("Session").fetch(authToken);
    if (!session) return { error: "ERR_BAD_CREDENTIALS" };
    if (session.isThirdPartySession) return { error: "ERR_NOT_ALLOWED" };
    let acc = db.of("User").fetch(session.userId);
    if (!acc) return { error: "ERR_UNKNOWN_ACCOUNT" };

    acc.displayName = displayname;
    db.of("User").update(acc);

    return await getAccount({ userId: acc.id });
  }

  /**
      Account session management
     */
  export async function getSessions(
    authToken: string,
  ): Promise<APIResponse<GetSessionsInfo>> {
    let session = db.of("Session").fetch(authToken);
    if (!session) return { error: "ERR_BAD_CREDENTIALS" };
    if (session.isThirdPartySession) return { error: "ERR_NOT_ALLOWED" };
    let acc = db.of("User").fetch(session.userId);
    if (!acc) return { error: "ERR_UNKNOWN_ACCOUNT" };

    let sessions = db
      .with("Session", (sessionsTable) => {
        return sessionsTable
          .queryAll({ userId: acc.id })
          .map((v) => sessionsTable.fetch(v));
      })
      .filter((v) => v != null);

    return {
      object: {
        sessions,
      },
    };
  }

  export async function deleteSingleSession(
    sessionToken: string,
  ): Promise<APIResponse<EmptyButOkResponse>> {
    let session = db.of("Session").fetch(sessionToken);
    if (!session) return { error: "ERR_BAD_CREDENTIALS" };

    let acc = db.of("User").fetch(session.userId);
    if (!acc) return { error: "ERR_UNKNOWN_ACCOUNT" };

    if (session.userId != acc.id) return { error: "ERR_NOT_ALLOWED" };

    db.of("Session").delete(session.id);
    return { object: { ok: true } };
  }

  export async function deleteAllSessions(
    authToken: string,
  ): Promise<APIResponse<EmptyButOkResponse>> {
    let session = db.of("Session").fetch(authToken);
    if (!session) return { error: "ERR_BAD_CREDENTIALS" };
    if (session.isThirdPartySession) return { error: "ERR_NOT_ALLOWED" };
    let acc = db.of("User").fetch(session.userId);
    if (!acc) return { error: "ERR_UNKNOWN_ACCOUNT" };

    db.with("Session", (table) => {
      table.queryAll({ userId: acc.id }).forEach((v) => table.delete(v));
    });
    return { object: { ok: true } };
  }

  export async function authorize(
    authRequestCode: string,
    rememberMe: boolean,
    authToken: string,
  ): Promise<APIResponse<EmptyButOkResponse>> {
    let session = db.of("Session").fetch(authToken);
    if (!session) return { error: "ERR_BAD_CREDENTIALS" };
    if (session.isThirdPartySession) return { error: "ERR_NOT_ALLOWED" };

    let req = db.of("ThirdPartySessionRequest").fetch(authRequestCode);
    if (!req) return { error: "ERR_REQUEST_MISSING" };

    let tk = await createUserToken(
      session.userId,
      rememberMe ? "API" : "API_REMEMBER_ME",
      req.realm,
    );
    if ("error" in tk) return tk;

    req.sessionId = tk.object.session.id;
    return { object: { ok: true } };
  }

  export async function getSessionAccount(
    authToken: string,
  ): Promise<APIResponse<AccountInfo>> {
    let session = db.of("Session").fetch(authToken);
    if (!session) return { error: "ERR_BAD_CREDENTIALS" };
    return await getAccount({ userId: session.userId });
  }
}
