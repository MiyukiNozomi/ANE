import { getUserProject } from "$lib/server/db";
import GitFS from "$lib/server/git/fs";
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

  const repo = await GitFS.RepositoryInfo.of(project);
  const branchInfo = repo.ofBranch(activeBranch);

  if (!branchInfo) {
    return error(404);
  }

  return {
    profile,
    project,
    filelist: await branchInfo.getFileList(""),
    commitCount: await branchInfo.getCommitCount(),

    hasMarkdownFile: (await branchInfo.getFile("README.md")) != null,
  };
}) satisfies PageServerLoad;
