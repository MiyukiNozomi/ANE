import type {
  AccountSession,
  ClientSessionInfo,
} from "$lib/client/API/apiTypes";
import { randomBytes } from "crypto";
import { db } from "./db";
import { accountToClientInfo } from "./schema";

export const SESSION_TOKEN_LENGTH = 72;

export type SessionTypes = "ROOT" | "READONLY" | "REMEMBER_ME_READONLY";

export const ROOT_TOKEN_EXPIRITATION = 24 * 60 * 60;
export const READONLY_TOKEN_EXPIRITATION = 7 * 24 * 60 * 60;
export const REMEMBER_ME_TOKEN_EXPIRITATION = 30 * 24 * 60 * 60;

// 5 minutes
export const AUTHORIZATION_REQUEST_EXPIRATION = 5 * 60 * 60;

export async function createSessionWithAccountInfo(
  userId: number,
  sessionType: SessionTypes,
) {
  let account = await db.accounts.whereFirst({ id: userId });
  if (!account) return null;

  return {
    accountInfo: accountToClientInfo(account),
    sessionInfo: await createSession(userId, sessionType),
  } satisfies AccountSession;
}

export async function createSession(userId: number, sessionType: SessionTypes) {
  let token = base32Encode(randomBytes(SESSION_TOKEN_LENGTH)).replaceAll(
    "\=",
    "",
  );

  await db.sessions.insert({
    id: token,
    userId: userId,
    isThirdPartySession: sessionType != "ROOT",
    expiresIn:
      sessionType == "ROOT"
        ? ROOT_TOKEN_EXPIRITATION
        : sessionType == "READONLY"
          ? READONLY_TOKEN_EXPIRITATION
          : REMEMBER_ME_TOKEN_EXPIRITATION,
  });

  return {
    id: token,
    userId: userId,
  } satisfies ClientSessionInfo;
}

export function genSharedSecretForThirdParty() {
  return base32Encode(randomBytes(42));
}

export function genThirdPartyIDTicket() {
  return base32Encode(randomBytes(16)).replaceAll("\=", "");
}

export function genRecoveryKey() {
  return base32Encode(randomBytes(80));
}

export function genTotpSecret() {
  return base32Encode(randomBytes(61));
}

export function base32Encode(buffer: Buffer) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let output = "";

  for (let byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  while (bits.length % 5 !== 0) {
    bits += "0";
  }

  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5);
    const index = parseInt(chunk, 2);
    output += alphabet[index];
  }

  while (output.length % 8 !== 0) {
    output += "=";
  }

  return output;
}

export function base32Decode(base32: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let output = [];

  base32 = base32.replace(/=+$/, "").toUpperCase();

  for (let char of base32) {
    const val = alphabet.indexOf(char);
    if (val === -1) throw new Error("Invalid Base32 character.");
    bits += val.toString(2).padStart(5, "0");
  }

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    output.push(parseInt(bits.substring(i, i + 8), 2));
  }

  return Buffer.from(output);
}
