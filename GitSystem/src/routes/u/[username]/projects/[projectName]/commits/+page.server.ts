import { RepositoryInfo } from "$lib/server/git";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import { dev } from "$app/environment";
import { getUserProject } from "$lib/server/db/tools";

export const load = (async ({ params, url }) => {
  const activeBranch = url.searchParams.get("branch") ?? "master";

  const profileReq = await getAccountByName(params.username);
  if (!profileReq || profileReq.error) {
    if (dev) console.log(profileReq);
    return error(404);
  }

  const profile = profileReq.data!;
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
    commits: Object.values(branchInfo.commits),
  };
}) satisfies PageServerLoad;
