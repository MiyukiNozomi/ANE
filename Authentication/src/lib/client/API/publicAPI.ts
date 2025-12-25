import https from "https";
import type {
  ClientSideAccount,
  APIResponse,
  AuthorizationRequest,
  AuthorizationRequestStatus,
} from "./apiTypes";
export function invokeAuthAPI<T>(
  endpoint: string,
  payload: any | FormData,
  sessionToken?: string,
  requestMethod: "POST" | "PUT" = "POST",
): Promise<APIResponse<T> | null> {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: "auth.ane.jp.net",
        path: `/api/${endpoint}`,
        method: requestMethod,
        headers: {
          Authorization: sessionToken ? `Bearer ${sessionToken}` : "",
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            resolve(null);
            return;
          }
          resolve(JSON.parse(body));
        });
      },
    );

    req.on("error", () => resolve(null));
    req.write(data);
    req.end();
  });
}

export async function getSignedAccount(authToken: string) {
  return await invokeAuthAPI<ClientSideAccount>("accounts/me", {}, authToken);
}

export async function getAccountByName(username: string) {
  return await invokeAuthAPI<ClientSideAccount>("accounts/getinfo", {
    username,
  });
}

export async function createAuthorizationRequest(
  realm: String,
  webhookURL: string | undefined,
) {
  return await invokeAuthAPI<AuthorizationRequest>("public/request-auth", {
    realm,
    webhookURL,
  });
}

export async function getAuthorizationRequest(
  query:
    | {
        sharedSecret: string;
      }
    | { id: string },
) {
  return await invokeAuthAPI<AuthorizationRequestStatus>(
    "public/get-request-status",
    query,
  );
}
