import AuthAPI from "node-aneauthapi";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import z from "zod";
import { AuthorizationList } from "$lib/server/authorizations";

let requestData = z.object({
  "request-code": z.string(),
});

export const POST: RequestHandler = async ({ locals, request }) => {
  const parseResult = requestData.safeParse(await request.json());
  if (!parseResult.success) {
    console.log(parseResult.error);
    return error(400);
  }

  const data = parseResult.data!;
  const info = AuthorizationList[data["request-code"]];
  if (!info) return error(401);

  const status = await AuthAPI.getAuthorizationRequest(info.sharedSecret);

  if (status.sessionStatus == "AUTHORIZED") {
    return json({
      accountInfo: await AuthAPI.getSignedAccount(status.session),
      session: status.session,
      sessionStatus: status.sessionStatus,
    });
  }

  return json({
    sessionStatus: status.sessionStatus,
  });
};
