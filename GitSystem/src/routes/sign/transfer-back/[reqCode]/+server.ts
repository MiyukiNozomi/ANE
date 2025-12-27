import { AuthorizationList } from "$lib/server/authorizations";
import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { DOMAIN } from "$lib/server/db";
import {
  getAuthorizationRequest,
  getSignedAccount,
} from "$lib/ANEAuthAPI/publicAPI";

export const GET: RequestHandler = async ({ params, cookies }) => {
  const req = AuthorizationList[params.reqCode];
  if (!req) return error(400);

  const result = await getAuthorizationRequest({
    sharedSecret: req.sharedSecret,
  });

  if (!result || result.error) {
    return error(500, result?.error ?? "Could not contact auth.ane.jp.net!");
  }

  const reqStatus = result.data!;

  if (reqStatus.status == "AUTHORIZED") {
    const signedAccountReq = await getSignedAccount(reqStatus.session!.id);
    if (!signedAccountReq || signedAccountReq.error)
      return error(
        500,
        signedAccountReq?.error ?? "ANE AuthAPI may be out of order.",
      );

    cookies.set("AuthToken", reqStatus.session!.id, {
      sameSite: "lax",
      path: "/",
      secure: false,
      httpOnly: false,
    });
    cookies.set(
      "AccountInfo",
      Buffer.from(JSON.stringify(signedAccountReq.data)).toString("base64"),
      {
        sameSite: "lax",
        path: "/",
        secure: false,
        httpOnly: false,
      },
    );

    return redirect(
      302,
      `${DOMAIN}${
        req.urlToReturnTo.startsWith("/")
          ? req.urlToReturnTo
          : "/" + req.urlToReturnTo
      }`,
    );
  }
  return error(401, "Still waiting for authorization!");
};
