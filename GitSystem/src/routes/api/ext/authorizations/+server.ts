import z from "zod";
import AuthAPI from "node-aneauthapi";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
  const r = await AuthAPI.createAuthorizationRequest("ANE Git Laboratory");
  return json({
    "request-url": AuthAPI.formatURL(r["request-code"]),
  });
};
