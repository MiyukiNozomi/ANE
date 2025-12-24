import { error, json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";

import type {
  APIError,
  APIResponse,
  AuthorizationRequestStatus,
  AuthorizationRequestStatusString,
} from "$lib/client/API/apiTypes";

import { db } from "$lib/server/db";
import type { Session } from "$lib/server/schema";

let requestData = z.union([
  z.object({
    id: z.string(),
  }),
  z.object({
    sharedSecret: z.string(),
  }),
]);

export const POST: RequestHandler = async ({ request }) => {
  const data = requestData.safeParse(await request.json());
  if (data.error) return error(400);

  let authRequest =
    "id" in data.data
      ? await db.thirdPartyRequests.ofId(data.data.id)
      : await db.thirdPartyRequests.ofSecret(data.data.sharedSecret);

  if (!authRequest) {
    return json({
      error: "ERR_THIRD_PARTY_REQUEST_MISSING_OR_DENIED",
    } satisfies APIError);
  }

  let session: Session | null =
    authRequest.sessionId != null
      ? await db.sessions.ofId(authRequest.sessionId)
      : null;

  let status: AuthorizationRequestStatusString = Boolean(session)
    ? "AUTHORIZED"
    : "AWAITING";

  if (!("sharedSecret" in data.data)) {
    session = null;
  }

  return json({
    data: {
      session,
      status,
    },
  } satisfies APIResponse<AuthorizationRequestStatus>);
};
