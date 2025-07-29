import { browser } from "$app/environment";
import type { AccountInfo, BackendResponse } from "./server/backend-types";

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

export async function invalidateSession() {
    console.log(
        await invokeAPI<any>(
            "signed/session/delete-self",
            undefined,
        ));
    document.cookie = `AuthToken=CLEARLY_INVALID; SameSite=Lax; Path=/`;
    document.cookie = `AccountInfo=CLEARLY_INVALID; SameSite=Lax; Path=/`;
}

export function getAccountInfo(): AccountInfo | null {
    const cookie = getCookie("AccountInfo");
    if (cookie == null || cookie.length == 0) return null;
    try {
        return JSON.parse(atob(cookie)) as AccountInfo;
    } catch (err) {
        console.error("AccountInfo cookie is likely not JSON, error: ", err);
        return null;
    }
}

export function getCookie(name: string) {
    if (!browser) return null;
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key.toLowerCase() === name.toLowerCase()) {
            return decodeURIComponent(value);
        }
    }
    return null; // Return null if the cookie is not found
}