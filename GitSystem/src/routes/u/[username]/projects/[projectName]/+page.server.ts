import { getUserProject } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { RepositoryInfo } from "$lib/server/git";
import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import { dev } from "$app/environment";

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
    activeBranch: activeBranch,
    branchlist: Object.keys(repo!.branches).filter((v) => v != activeBranch),
    filelist: await branchInfo.getFileList(),
    commitCount: await branchInfo.getCommitCount(),

    hasMarkdownFile: (await branchInfo.getFile("README.md")) != null,
  };
}) satisfies PageServerLoad;
