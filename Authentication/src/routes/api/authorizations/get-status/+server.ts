import z from "zod";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { MAX_SECRET_LENGTH, MIN_SECRET_LENGTH } from "$lib/shared/safety";
import { Backend } from "$lib/server/services";

let requestData = z.object({
  sharedSecret: z
    .string()
    .min(MIN_SECRET_LENGTH)
    .max(MAX_SECRET_LENGTH)
    .optional(),
  authRequestCode: z.string().optional(),
});

export const POST: RequestHandler = async ({ locals, request }) => {
  const obj = await requestData.safeParse(await request.json());
  if (!obj.success) {
    console.log(obj.error);
    return error(400);
  }

  const { sharedSecret, authRequestCode } = obj.data;
  if (!sharedSecret && !authRequestCode) return error(400);

  const res = await Backend.getAuthorizationStatus(
    sharedSecret
      ? {
          sharedSecret,
        }
      : {
          id: authRequestCode!,
        },
  );
  if (dev) console.log(res);
  return json(res);
};
