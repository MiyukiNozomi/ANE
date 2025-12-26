import https from "https";
import type {
  ClientSideAccount,
  APIResponse,
  AuthorizationRequest,
  AuthorizationRequestStatus,
} from "./apiTypes";

function invokeAuthAPI<T>(
  endpoint: string,
  payload: any | FormData,
  sessionToken?: string,
  requestMethod: "POST" | "PUT" | "GET" = "POST",
) {
  return new Promise<APIResponse<T>>((resolve, reject) => {
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
        let data = new Array<Buffer>();

        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("error", (err) => {
          reject(
            new Error(
              "Got an error: " +
                JSON.stringify(err) +
                " when contacting " +
                endpoint,
            ),
          );
        });

        res.on("end", () => {
          const buffStr = Buffer.concat(data).toString();
          if (res.statusCode != 200)
            reject(
              new Error(
                "Got a Non-200 status code: " +
                  res.statusCode +
                  " when contacting " +
                  endpoint +
                  "\n " +
                  buffStr,
              ),
            );
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
