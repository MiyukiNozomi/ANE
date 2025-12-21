import { Backend } from "$lib/server/services";
import { error, json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";

let requestData = z.object({
  recoveryKey: z.string().max(256),
});

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.sessionToken) {
    return error(401);
  }

  const obj = await requestData.safeParse(await request.json());
  if (!obj.success) {
    console.log(obj.error);
    return error(400);
  }

  const { recoveryKey } = obj.data;

  const res = await Backend.disable2FASupport(recoveryKey, locals.sessionToken);
  if (dev) console.log(res);
  return json(res);
};
