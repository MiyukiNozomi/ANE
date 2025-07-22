import type { BackendResponse } from "./server/backend-types";

export type LocalResponse<T> =
    { translatedError?: string } & BackendResponse<T>;

export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 32;

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 200;

export function isUsernameValidClientCheck(username: string): boolean {
    const usernameRegex = /^[A-Za-z0-9_]+$/;
    return usernameRegex.test(username);
}

export async function invokeAPI<T>(endpoint: string, payload: any): Promise<LocalResponse<T> | null> {
    try {
        const res = await fetch("/api/" + endpoint, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        if (res.status != 200)
            return null;
        return await res.json() as LocalResponse<T>;
    } catch (err) {
        return null;
    }
}