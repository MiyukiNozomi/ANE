import { Backend } from "$lib/server/services";
import { error, json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from "$lib/shared/safety";
import { dev } from "$app/environment";

let requestData = z.object({
  displayName: z.string().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH),
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

  const { displayName } = obj.data;

  const res = await Backend.setDisplayName(displayName, locals.sessionToken);
  if (dev) console.log(res);
  return json(res);
};
