import { AuthorizationList } from "$lib/server/authorizations";
import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import AuthAPI from "node-aneauthapi";
import { DOMAIN } from "$lib/server/db";

export const GET: RequestHandler = async ({ params, cookies }) => {
  const req = AuthorizationList[params.reqCode];
  if (!req) return error(400);
  /*** 
   * document.cookie = `AuthToken=${json.session}; SameSite=Lax; Path=/`;
        document.cookie = `AccountInfo=${btoa(JSON.stringify(json.accountInfo))}; SameSite=Lax; Path=/`;
        */
  const result = await AuthAPI.getAuthorizationRequest(req.sharedSecret);

  if (result.sessionStatus == "AUTHORIZED") {
    cookies.set("AuthToken", result.session, {
      sameSite: "lax",
      path: "/",
      secure: false,
      httpOnly: false,
    });
    cookies.set(
      "AccountInfo",
      Buffer.from(
        JSON.stringify(await AuthAPI.getSignedAccount(result.session))
      ).toString("base64"),
      {
        sameSite: "lax",
        path: "/",
        secure: false,
        httpOnly: false,
      }
    );

    return redirect(
      302,
      `${DOMAIN}${
        req.urlToReturnTo.startsWith("/")
          ? req.urlToReturnTo
          : "/" + req.urlToReturnTo
      }`
    );
  }
  return error(401, "Still waiting for authorization!");
};
