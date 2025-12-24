import type { ClientSideAccount, APIResponse } from "./apiTypes";

const DOMAIN = "https://auth.ane.jp.net";

export async function invokeAuthAPI<T>(
  endpoint: string,
  payload: any | FormData,
  sessionToken?: string,
  requestMethod: "POST" | "PUT" = "POST",
): Promise<APIResponse<T> | null> {
  try {
    const res = await fetch("https://auth.ane.jp.net/api/" + endpoint, {
      method: requestMethod,
      headers: {
        authorization: "Bearer " + sessionToken,
      },
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    if (res.status != 200) return null;
    return (await res.json()) as APIResponse<T>;
  } catch (err) {
    return null;
  }
}

export function getSignedAccount(authToken: string) {
  return invokeAuthAPI<ClientSideAccount>("accounts/me", {}, authToken);
}
