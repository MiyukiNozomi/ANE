import { dev } from "$app/environment";
import { AuthorizationList } from "$lib/server/authorizations";
import { DOMAIN } from "$lib/server/db";
import { redirect, type RequestHandler } from "@sveltejs/kit";
import AuthAPI from "node-aneauthapi";

export const GET: RequestHandler = async ({ request, url }) => {
  const req = await AuthAPI.createAuthorizationRequest(
    dev ? "ANE GitSystem (dev mode)" : "ANE GitSystem",
    `${DOMAIN}/sign/transfer-back/[reqCode]`
  );

  AuthorizationList[req["request-code"]] = {
    ...req,
    creationDate: Date.now(),
    urlToReturnTo: url.searchParams.get("ref") ?? "/",
  };

  return redirect(
    302,
    "https://auth.ane.jp.net/sign/authorize/" + req["request-code"]
  );
};
