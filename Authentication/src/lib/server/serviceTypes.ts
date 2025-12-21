import type { Session, ThirdPartySessionRequest, User } from "./db/schema";

export type APIResponse<T> =
  | {
      error:
        | "ERR_NOT_ALLOWED"
        | "ERR_BAD_CREDENTIALS"
        | "ERR_ACCOUNT_EXISTS"
        | "ERR_UNKNOWN_ACCOUNT"
        | "ERR_INCORRECT_PASSWORD"
        | "ERR_INCORRECT_ONETIME_PASSWORD"
        | "ERR_INCORRECT_RECOVERY_CODE"
        | "ERR_TWOFACTOR_REQUIRED"
        | "ERR_TWOFACTOR_ALREADY_ENABLED"
        | "ERR_TWOFACTOR_REQUEST_MISSING"
        | "ERR_TWOFACTOR_NOT_ENABLED"
        | "ERR_REQUEST_EXISTS"
        | "ERR_REQUEST_MISSING";
    }
  | {
      object: T;
    };

export type EmptyButOkResponse = { ok: true };

export type UserSessionInfo = {
  accountInfo: AccountInfo;
  session: Session;
};

export type AccountInfo = Omit<
  User,
  "passwordHash" | "totpSecret" | "totpBackupCode"
> & {
  passwordHash?: string | null;
  totpSecret?: string | null;
  totpBackupCode?: string | null;
};

export type AccountSecurityInfo = {
  has2FA: boolean;
};

export type TwoFactorStep1Start = {
  "shared-secret": string;
};

export type TwoFactorStepFinish = {
  "recovery-key": string;
};

export type GetSessionsInfo = {
  sessions: Session[];
};

export type AuthorizationRequestCreationInfo = {
  "request-code": string;
};

export type AuthorizationStatus = Omit<
  ThirdPartySessionRequest,
  "sessionId" | "sharedSecret"
> & {
  sessionId: string | null;
  sharedSecret: undefined;

  authStatus: "AUTHORIZED" | "AWAITING_AUTHORIZATION";
};
