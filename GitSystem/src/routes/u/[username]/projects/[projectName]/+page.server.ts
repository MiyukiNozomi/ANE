import AuthAPI from "node-aneauthapi";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { getUserProject } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import GitFS from "$lib/server/git/fs";

export const load = (async ({ params, request, url }) => {
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
    filelist: await branchInfo.getFileList("/"),
    commitCount: await branchInfo.getCommitCount(),
  };
}) satisfies PageServerLoad;
