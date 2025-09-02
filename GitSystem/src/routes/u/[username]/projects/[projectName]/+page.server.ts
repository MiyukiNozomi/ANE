import AuthAPI from "node-aneauthapi";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { getUserProject } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ params, request, url }) => {
  const profile = await AuthAPI.getAccountByName(params.username);
  if (!profile) return error(404);

  const project = await getUserProject(profile.name, params.projectName);

  if (!project) {
    return error(404);
  }

  return {
    profile,
    project,
  };
}) satisfies PageServerLoad;
