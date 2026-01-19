import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { RepositoryInfo } from "$lib/server/git";
import { searchAnyOf } from "$lib/server/searching";

export const load = (async ({ request, url }) => {
  const query = url.searchParams.get("s") ?? url.searchParams.get("query");

  if (!query) return redirect(302, "/");

  return {
    query,
    searchResults: await searchAnyOf(query),
  };
}) satisfies PageServerLoad;
