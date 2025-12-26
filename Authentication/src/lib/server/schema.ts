import type { ClientSideAccount } from "$lib/client/API/apiTypes";

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
