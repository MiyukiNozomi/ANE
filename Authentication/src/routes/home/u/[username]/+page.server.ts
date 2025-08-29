import { Backend } from "$lib/server/backend-api";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, request, params }) => {
  const account = await Backend.getAccount(params.username);
  if (!account || account.error) return error(404);

  console.log(account);

  return { homeAccountInfo: account.data! };
}) satisfies PageServerLoad;
