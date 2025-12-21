import z from "zod";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { Backend } from "$lib/server/services";
import { dev } from "$app/environment";

let requestData = z.object({
  name: z.string(),
});

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.sessionToken) return error(401);
  if (locals.session?.isThirdPartySession) return error(403);

  const obj = await requestData.safeParse(await request.json());
  if (!obj.success) {
    console.log(obj.error);
    return error(400);
  }

  const { name } = obj.data;

  const res = await Backend.createUserToken(locals.account!.id, "API", name);
  if (dev) console.log(res);
  return json(res);
};
