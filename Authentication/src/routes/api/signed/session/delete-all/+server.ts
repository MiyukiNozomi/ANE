import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Backend } from "$lib/server/services";
import { dev } from "$app/environment";

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.sessionToken) return error(401);

  const res = await Backend.deleteAllSessions(locals.sessionToken);
  if (dev) console.log(res);
  return json(res);
};
