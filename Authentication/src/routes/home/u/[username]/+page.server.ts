import { Backend } from "$lib/server/services";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, request, params }) => {
  const account = await Backend.getAccount({ username: params.username });
  if ("error" in account) return error(404);

  console.log(account);

  return { homeAccountInfo: account.object };
}) satisfies PageServerLoad;
