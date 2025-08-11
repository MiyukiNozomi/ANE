import AuthAPI from "node-aneauthapi";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { AuthorizationList } from "$lib/server/authorizations";

export const POST: RequestHandler = async ({ locals, request }) => {
  const r = await AuthAPI.createAuthorizationRequest("ANE Git Laboratory");

  AuthorizationList[r["request-code"]] = { ...r, creationDate: Date.now() };

  return json({
    rawRequestCode: r["request-code"],
    "request-url": AuthAPI.formatURL(r["request-code"]),
  });
};
