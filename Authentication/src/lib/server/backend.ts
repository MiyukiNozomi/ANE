/******************
 *  KEEP ALL BELOW SYNCHRONIZED WITH AUTH DAEMON!
 */

import type { LocalResponse } from "$lib/client-api";
import type { BackendResponse } from "./backend-types";

export enum DB_Errors {
    ALREADY_EXISTS = "ALREADY_EXISTS",
    DOES_NOT_EXIST = "DOES_NOT_EXIST",

    INCORRECT_PASSWORD = "INCORRECT_PASSWORD",

    TWO_FACTOR_REQUIRED = "TWO_FACTOR_REQUIRED",
    INCORRECT_TWO_FACTOR = "INCORRECT_TWO_FACTOR",
    INCORRECT_BACKUP_CODE = "INCORRECT_BACKUP_CODE",

    EXPIRED_OR_MISSING_SESSION = "EXPIRED_OR_MISSING_SESSION",

    OK = "OK",
}

export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 32;

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 200;

export function isUsernameValid(username: string): boolean {
    const usernameRegex = /^[A-Za-z0-9_]+$/;
    return usernameRegex.test(username);
}

export function translateDatabaseError(dbError: DB_Errors) {
    switch (dbError) {
        case DB_Errors.ALREADY_EXISTS:
            return "An account with that name already exists.";
        case DB_Errors.DOES_NOT_EXIST:
            return "That account does not exist.";
        case DB_Errors.INCORRECT_PASSWORD:
            return "Incorrect password for account.";
        case DB_Errors.INCORRECT_TWO_FACTOR:
            return "Incorrect 2FA code.";
        case DB_Errors.INCORRECT_BACKUP_CODE:
            return "Incorrect backup code.";
        case DB_Errors.EXPIRED_OR_MISSING_SESSION:
            return "Invalid session.";
        case DB_Errors.TWO_FACTOR_REQUIRED:
        case DB_Errors.OK:
        default:
            return "Unknown error (" + dbError + ").";
    }
}

/** helper function */
export function asLocalResponse<T>(backendRes: BackendResponse<T>) {
    if (backendRes.error) {
        return {
            ...backendRes,
            translatedError: translateDatabaseError(backendRes.error)
        } satisfies LocalResponse<T>;
    }
    return {
        ...backendRes
    } satisfies LocalResponse<T>;
}