import type { PageServerLoad } from "./$types";
import { redirectToLoginPage } from "$lib/server/tools";

export const load = (async ({ locals, request }) => {
  if (!locals.account) return redirectToLoginPage(request.url);
  return {};
}) satisfies PageServerLoad;
