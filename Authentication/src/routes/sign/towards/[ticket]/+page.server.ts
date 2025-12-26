import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load = (async ({ locals, request, params }) => {
  if (!locals.session)
    return redirect(
      302,
      "/sign?for=" + encodeURIComponent(new URL(request.url).pathname),
    );

  const authRequest = await db.thirdPartyRequests.whereFirst({
    id: params.ticket,
  });
  if (!authRequest) return error(400);

  return {
    authRequest: {
      ...authRequest,
      sharedSecret: undefined,
    },
  };
}) satisfies PageServerLoad;
