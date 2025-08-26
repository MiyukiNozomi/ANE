import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/backend-api";
import { text } from "@sveltejs/kit";
import { redirectToLoginPage } from "$lib/server/tools";

export const load = (async ({ locals, request }) => {
  if (!locals.account) return redirectToLoginPage(request.url);
  return {};
}) satisfies PageServerLoad;
