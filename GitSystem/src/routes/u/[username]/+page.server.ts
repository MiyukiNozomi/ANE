import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { getContributingProjects, getOwnedProjects } from "$lib/server/db";
import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import { dev } from "$app/environment";

export const load = (async ({ params, request }) => {
  const profileReq = await getAccountByName(params.username);
  if (!profileReq || profileReq.error) {
    if (dev) console.log(profileReq);
    return error(404);
  }

  const profile = profileReq.data!;

  const projects = await getOwnedProjects(profile.name);
  const involvedProjects = await getContributingProjects(profile.name);

  return {
    profile,
    projects,
    involvedProjects,
  };
}) satisfies PageServerLoad;
