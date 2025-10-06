import { getUserProject } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import AuthAPI from "node-aneauthapi";
import type { PageServerLoad } from "./$types";
import { RepositoryInfo } from "$lib/server/git";

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
    activeBranch: activeBranch,
    branchlist: Object.keys(repo!.branches).filter(v => v != activeBranch),
    filelist: await branchInfo.getFileList(),
    commitCount: await branchInfo.getCommitCount(),

    hasMarkdownFile: (await branchInfo.getFile("README.md")) != null,
  };
}) satisfies PageServerLoad;
