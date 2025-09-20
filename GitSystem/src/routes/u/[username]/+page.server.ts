import AuthAPI from "node-aneauthapi";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { getContributingProjects, getOwnedProjects } from "$lib/server/db";

export const load = (async ({ params, request }) => {
  const profile = await AuthAPI.getAccountByName(params.username);
  if (!profile) return error(404);

  const projects = await getOwnedProjects(profile.name);
  const involvedProjects = await getContributingProjects(profile.name);

  return {
    profile,
    projects,
    involvedProjects
  };
}) satisfies PageServerLoad;
