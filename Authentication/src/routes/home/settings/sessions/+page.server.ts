import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/services";
import { redirectToLoginPage } from "$lib/server/tools";

export const load = (async ({ locals, request }) => {
  if (!locals.sessionToken) return redirectToLoginPage(request.url);

  const sessions = await Backend.getSessions(locals.sessionToken);

  if ("error" in sessions) {
    return error(500, sessions.error);
  }

  return sessions.object;
}) satisfies PageServerLoad;
