import z from "zod";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { Backend } from "$lib/server/backend-api";
import {
  MAX_REALM_LENGTH,
  MAX_SECRET_LENGTH,
  MIN_REALM_LENGTH,
  MIN_SECRET_LENGTH,
} from "$lib/server/backend";
import { dev } from "$app/environment";

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
  if ((await Backend.getAuthorizationStatus(sharedSecret))?.data) {
    return json({
      error: "Duplicate Requisition!",
    });
  }

  const res = await Backend.newAuthorizationRequest(
    sharedSecret,
    realm,
    redirectURL
  );

  if (!res || res.error) return error(500);

  if (dev) console.log(res.data);

  return json(res.data!);
};
