import z from "zod";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { Backend } from "$lib/server/services";
import { dev } from "$app/environment";
import {
  MAX_REALM_LENGTH,
  MAX_SECRET_LENGTH,
  MIN_REALM_LENGTH,
  MIN_SECRET_LENGTH,
} from "$lib/shared/safety";

const requestData = z.object({
  sharedSecret: z.string().min(MIN_SECRET_LENGTH).max(MAX_SECRET_LENGTH),
  realm: z.string().min(MIN_REALM_LENGTH).max(MAX_REALM_LENGTH),
  redirectURL: z.string().max(MAX_SECRET_LENGTH).optional(),
});

export const POST: RequestHandler = async ({ request }) => {
  const obj = await requestData.safeParse(await request.json());
  if (!obj.success) {
    console.log(obj.error.message);
    return error(400);
  }

  const { sharedSecret, realm, redirectURL } = obj.data;

  const res = await Backend.newAuthorizationRequest(
    sharedSecret,
    realm,
    redirectURL,
  );
  if (dev) console.log(res);
  return json(res);
};
