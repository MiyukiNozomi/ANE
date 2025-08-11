import AuthAPI from "node-aneauthapi";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load = (async ({ params, request }) => {
  const profile = await AuthAPI.getAccountByName(params.username);
  if (!profile) return error(404);

  return {
    profile,
  };
}) satisfies PageServerLoad;
