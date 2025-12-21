import z from "zod";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { Backend } from "$lib/server/services";
import { dev } from "$app/environment";

let requestData = z.object({
  authRequestCode: z.string(),
  rememberMe: z.boolean(),
});

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.sessionToken) return error(401);

  const obj = await requestData.safeParse(await request.json());
  if (!obj.success) {
    console.log(obj.error);
    return error(400);
  }

  const { authRequestCode, rememberMe } = obj.data;

  const res = await Backend.authorize(
    authRequestCode,
    rememberMe,
    locals.sessionToken,
  );

  if (dev) console.log(res);
  return json(res);
};
