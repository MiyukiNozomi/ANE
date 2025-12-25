import { dev } from "$app/environment";
import { createAuthorizationRequest } from "$lib/ANEAuthAPI/publicAPI";
import { AuthorizationList } from "$lib/server/authorizations";
import { DOMAIN } from "$lib/server/db";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request, url }) => {
  const req = await createAuthorizationRequest(
    dev ? "ANE GitSystem (dev mode)" : "ANE GitSystem",
    `${DOMAIN}/sign/transfer-back/[reqCode]`,
  );

  if (!req || req?.error) {
    return error(
      500,
      req?.error ??
        "Could not contact ANE Auth API (is auth.ane.jp.net down?).",
    );
  }

  const authRequest = req.data!;

  AuthorizationList[authRequest.id] = {
    ...authRequest,
    creationDate: Date.now(),
    urlToReturnTo: url.searchParams.get("ref") ?? "/",
  };

  console.log(authRequest);
  return redirect(302, authRequest.authorizationURL);
};
