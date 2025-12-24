import { browser } from "$app/environment";
import type { ClientSideAccount, APIResponse } from "./apiTypes";

export async function invokeAPI<T>(
  endpoint: string,
  payload: any | FormData,
  requestMethod: "POST" | "PUT" = "POST",
): Promise<APIResponse<T> | null> {
  try {
    const res = await fetch("/api/" + endpoint, {
      method: requestMethod,
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    if (res.status != 200) return null;
    return (await res.json()) as APIResponse<T>;
  } catch (err) {
    return null;
  }
}

export async function invalidateSession() {
  console.log(await invokeAPI<any>("signed/session/delete-self", undefined));
  document.cookie = `AuthToken=CLEARLY_INVALID; SameSite=Lax; Path=/`;
  document.cookie = `AccountInfo=CLEARLY_INVALID; SameSite=Lax; Path=/`;
}

export function getAccountInfo(): ClientSideAccount | null {
  const cookie = getCookie("AccountInfo");
  if (cookie == null || cookie.length == 0) return null;
  try {
    return JSON.parse(atob(cookie)) as ClientSideAccount;
  } catch (err) {
    console.error("AccountInfo cookie is likely not JSON, error: ", err);
    return null;
  }
}

export function setClientSideAccountInfo(accountInfo: ClientSideAccount) {
  document.cookie = `AccountInfo=${btoa(
    JSON.stringify(accountInfo),
  )}; SameSite=Lax; Path=/`;
}

export function getCookie(name: string) {
  if (!browser) return null;
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key.toLowerCase() === name.toLowerCase()) {
      return decodeURIComponent(value);
    }
  }
  return null; // Return null if the cookie is not found
}
