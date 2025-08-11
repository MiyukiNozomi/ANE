import { browser } from "$app/environment";
import type { AccountInfo } from "node-aneauthapi";

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
