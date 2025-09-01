import * as http from "http";
import * as https from "https";

let isProduction = false;

/**
 * Namespace containing all the public features of the Anemachi Authorization API
 *
 *
 */
namespace AuthAPI {
  export type DataOrErrorResponse<T> = {
    error?: string;
    data?: T;
  };
  export type AuthorizationRequest = {
    sharedSecret: string;
    realm: string;
    "request-code": string;
    redirectURL?: string;
  };

  export type AuthorizationRequestStatus = {
    reqCode: string;
    realm: string;
    createdAt: number;
    /*** This will be an empty string if sessionStatus == AWAITING_AUTHORIZATION */
    session: string;
    sessionStatus: "AUTHORIZED" | "AWAITING_AUTHORIZATION";
    redirectURL?: string;
  };

  export type AccountInfo = {
    id: number;
    displayName: string;
    name: string;
    createdAt: number;

    isAdmin: boolean;
    isDonator: boolean;
  };

  function newRawRequest(
    endpoint: string,
    authToken: string | undefined,
    hasPayload: boolean,
    clb: (res: http.IncomingMessage) => void
  ): http.ClientRequest {
    let headers: Record<string, string> = {};
    if (hasPayload) headers["content-type"] = "application/json";
    if (authToken) headers["authorization"] = "Bearer " + authToken;

    if (isProduction) {
      return http.request(
        {
          hostname: "127.0.0.1",
          port: 4000,
          path: `/api/${endpoint}`,
          headers,
          method: "POST",
        },
        clb
      );
    }

    return https.request(
      {
        hostname: "auth.ane.jp.net",
        path: `/api/${endpoint}`,
        headers,
        method: "POST",
      },
      clb
    );
  }

  function invokeAuthAPI<T>(
    endpoint: string,
    payload: any,
    authtoken?: string
  ) {
    return new Promise<T & { error?: any }>((resolve, reject) => {
      let headers: Record<string, string> = {};
      if (payload) headers["content-type"] = "application/json";
      if (authtoken) headers["authorization"] = "Bearer " + authtoken;

      const req = newRawRequest(
        endpoint,
        authtoken,
        typeof payload == "object" && payload != null,
        (res) => {
          let data = new Array<Buffer>();

          res.on("data", (chunk) => {
            data.push(chunk);
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
                    buffStr
                )
              );
            else resolve(JSON.parse(buffStr) as T & { error?: any });
          });
        }
      );

      if (payload) req.write(JSON.stringify(payload));

      req.end();
    });
  }

  /**
   * Switches AuthAPI to production mode.
   * Instead of contacting the rate-limited public version of "auth.ane.jp.net",
   * it will use the local instance of the auth microservice at 127.0.0.1:4000.
   * ... which is only accessible within the server's LAN.
   * */
  export function ANEInternal__productionMode() {
    isProduction = true;
  }

  /**
   * Creates a new Authorization Request
   *
   * The URL to be given for the request-code field is in the following format:
   * https://auth.ane.jp.net/sign/authorize/<insert request-code here>
   *
   * @param realm the name of the application
   * @param redirectURL The URL to redirect the user back to.
   * @returns the authorization token used by the user
   */
  export async function createAuthorizationRequest(
    realm: string,
    redirectURL?: string
  ) {
    const sharedSecret = crypto.randomUUID();

    const res = await invokeAuthAPI<{ "request-code": string }>(
      "authorizations/new",
      {
        sharedSecret,
        realm,
        redirectURL,
      }
    );

    if (res.error) throw new Error("API Error: " + res.error);

    return {
      sharedSecret,
      realm,
      "request-code": res["request-code"],
      redirectURL,
    } satisfies AuthorizationRequest;
  }

  /**
   *
   * Please note it will *NOT* return the session token if requested by the authorization request code.
   *
   * @param sharedSecret The shared secret from the created authorization request.
   * @returns the status of a requested authorization.
   *
   * @see createAuthorizationRequest
   */
  export async function getAuthorizationRequest(
    sharedSecret: string
  ): Promise<AuthorizationRequestStatus> {
    const res = await invokeAuthAPI<AuthorizationRequestStatus>(
      "authorizations/get-status",
      {
        sharedSecret,
      }
    );

    if (res.error) throw new Error("API Error: " + res.error);
    return res;
  }

  /**
   * @param authToken the authorization token.
   * @returns the account holder information of the provided auth token.
   */
  export async function getSignedAccount(authToken: string) {
    const res = await invokeAuthAPI<AccountInfo>(
      "signed/me",
      undefined,
      authToken
    );
    if (res.error) throw new Error("API Error: " + res.error);
    return res;
  }

  /**
   * Deletes a session.
   * @returns An {ok: true}. any other errors can be seen as a bug.
   */
  export async function eraseSession(authToken: string) {
    const res = await invokeAuthAPI<any>(
      "signed/session/delete-self",
      undefined,
      authToken
    );
    if (res.error) throw new Error("API Error: " + res.error);
    return res;
  }

  /**
   * @returns The account holder of said ID.
   */
  export async function getAccountById(
    accountId: number
  ): Promise<AccountInfo | null> {
    const res = await invokeAuthAPI<DataOrErrorResponse<AccountInfo>>(
      "get-account",
      { accountId }
    );
    if (res.error == "DOES_NOT_EXIST") return null;
    else if (res.error) throw new Error("API Error: " + res.error);
    return res.data!;
  }

  /**
   * @returns The account holder of said username.
   */
  export async function getAccountByName(
    username: string
  ): Promise<AccountInfo | null> {
    const res = await invokeAuthAPI<DataOrErrorResponse<AccountInfo>>(
      "get-account",
      { username }
    );
    if (res.error == "DOES_NOT_EXIST") return null;
    else if (res.error) throw new Error("API Error: " + res.error);

    return res.data!;
  }

  /**
   * @params requestCode The request code.
   * @returns A formatted authorization request URL.
   */
  export function formatURL(requestCode: string) {
    return `https://auth.ane.jp.net/sign/authorize/${requestCode}`;
  }
}

export = AuthAPI;
