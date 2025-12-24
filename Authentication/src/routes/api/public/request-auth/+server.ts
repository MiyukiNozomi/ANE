import type {
  APIResponse,
  AuthorizationRequest,
} from "$lib/client/API/apiTypes";
import { db } from "$lib/server/db";
import {
  genSharedSecretForThirdParty,
  genThirdPartyIDTicket,
} from "$lib/server/keystores";
import {
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
} from "$lib/shared/safetyConstants";
import { error, json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";

let requestData = z.object({
  realm: z.string().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH),
  webhookURL: z.string().optional(),
});

export const POST: RequestHandler = async ({ request }) => {
  const data = requestData.safeParse(await request.json());
  if (data.error) return error(400);

  const token = genThirdPartyIDTicket();
  const sharedSecret = genSharedSecretForThirdParty();

  const { realm, webhookURL } = data.data;

  await db.thirdPartyRequests.insert(
    token,
    sharedSecret,
    realm,
    webhookURL ?? null,
  );

  return json({
    data: {
      authorizationURL: `https://auth.ane.jp.net/sign/towards/${token}`,
      id: token,
      sharedSecret,
    },
  } satisfies APIResponse<AuthorizationRequest>);
};
