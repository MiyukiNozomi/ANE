import { getUserProject } from "$lib/server/db";
import { RepositoryInfo } from "$lib/server/git";
import { error } from "@sveltejs/kit";
import AuthAPI from "node-aneauthapi";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, url }) => {
  const activeBranch = url.searchParams.get("branch") ?? "master";

  const profile = await AuthAPI.getAccountByName(params.username);
  if (!profile) return error(404);

  const project = await getUserProject(profile.name, params.projectName);

  if (!project) {
    return error(404);
  }

  const repo = await RepositoryInfo.of(project);
  const branchInfo = repo?.branch(activeBranch);

  if (!branchInfo) {
    return error(404);
  }

  return {
    profile,
    project,
    commits: branchInfo.commits
  };
}) satisfies PageServerLoad;
