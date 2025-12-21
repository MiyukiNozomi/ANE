/***
 *
 *  Professional level documentation right there
 *
 * ID = this is automatic, always a random UUID.
 * createdAt = also automatic, unix time of INSERTION DATE.
 * updatedAt = also automatic, unix time of last UPDATE.
 * expiresIn = also automatic, time in milliseconds of when to expire
 *
 */

export interface User {
  id: string;

  displayName: string | null;

  username: string;
  passwordHash: string;

  totpSecret: string | null;
  totpBackupCode: string | null;

  createdAt: number;
  updatedAt: number;

  capabilities: string[];
}

export interface Session {
  id: string;
  userId: string;
  isThirdPartySession: boolean;
  realmName: string;

  // Automatic by the way, when set the DatabaseStore will automatically nuke it next time its read.
  expiresIn: number;

  createdAt: number;
  updatedAt: number;
}

export interface ThirdPartySessionRequest {
  id: string;
  sharedSecret: string;
  realm: string;

  sessionId: string | null;

  redirectURL: string | null;

  // Automatic by the way, when set the DatabaseStore will automatically nuke it next time its read.
  expiresIn: number;

  createdAt: number;
  updatedAt: number;
}

export interface TwoFactorSetupInformation {
  id: string;

  totpSecret: string;
  userId: string;

  createdAt: number;
  updatedAt: number;
}

export type Schema = {
  User: User;
  Session: Session;
  ThirdPartySessionRequest: ThirdPartySessionRequest;
  TwoFactorSetupInformation: TwoFactorSetupInformation;
};
