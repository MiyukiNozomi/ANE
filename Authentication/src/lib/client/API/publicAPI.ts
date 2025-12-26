import https from "https";
import type {
  ClientSideAccount,
  APIResponse,
  AuthorizationRequest,
  AuthorizationRequestStatus,
} from "./apiTypes";
import { dev } from "$app/environment";

function invokeAuthAPI<T>(
  endpoint: string,
  payload: any | FormData,
  sessionToken?: string,
  requestMethod: "POST" | "PUT" | "GET" = "POST",
) {
  return new Promise<APIResponse<T> | null>((resolve, reject) => {
    let headers: Record<string, string> = {};
    if (payload) headers["content-type"] = "application/json";
    if (sessionToken) headers["authorization"] = "Bearer " + sessionToken;

    const req = https.request(
      {
        hostname: "auth.ane.jp.net",
        path: `/api/${endpoint}`,
        headers,
        method: requestMethod,
      },
      (res) => {
        const errorOrResolve = (err: any) => {
          console.log("Error: ", err);
          return resolve(null);
        };
        let data = new Array<Buffer>();

        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("error", errorOrResolve);

        res.on("end", () => {
          const buffStr = Buffer.concat(data).toString();
          if (res.statusCode != 200)
            errorOrResolve({
              status: res.statusCode,
              message: Buffer.concat(data).toString(),
            });
          else resolve(JSON.parse(buffStr));
        });
      },
    );

    if (payload) req.write(JSON.stringify(payload));

    req.end();
  });
}

export async function getSignedAccount(authToken: string) {
  return await invokeAuthAPI<ClientSideAccount>(
    "accounts/me",
    undefined,
    authToken,
    "GET",
  );
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
