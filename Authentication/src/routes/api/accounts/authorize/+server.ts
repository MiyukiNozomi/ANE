import type { APIError, APIOk } from "$lib/client/API/apiTypes";
import { db } from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";
import { createSession } from "$lib/server/keystores";

let requestData = z.object({
  ticketId: z.string(),
  rememberMe: z.boolean(),
});

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.session) return error(401);
  if (locals.session.session.isThirdPartySession) return error(403);

  const data = requestData.safeParse(await request.json());
  if (data.error) return error(400);

  const { ticketId, rememberMe } = data.data;

  let authRequest = await db.thirdPartyRequests.ofId(ticketId);
  if (!authRequest)
    return json({
      error: "ERR_THIRD_PARTY_REQUEST_MISSING_OR_DENIED",
    } satisfies APIError);

  if (authRequest.sessionId != null)
    return json({
      error: "ERR_THIRD_PARTY_REQUEST_ALREADY_AUTHORIZED",
    } satisfies APIError);

  const session = await createSession(
    locals.session.account.id,
    rememberMe ? "REMEMBER_ME_READONLY" : "READONLY",
  );

  await db.thirdPartyRequests.updateSession(ticketId, session.id);
  return json({ data: true } satisfies APIOk);
};
