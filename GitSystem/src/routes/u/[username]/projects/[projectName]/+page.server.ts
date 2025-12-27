import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { RepositoryInfo } from "$lib/server/git";
import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import { dev } from "$app/environment";
import { db } from "$lib/server/db";
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
    console.log("Missing Project: " + project);
    return error(404);
  }

  const repo = await RepositoryInfo.of(project);
  const branchInfo = repo?.branch(activeBranch);

  if (!branchInfo) {
    console.log("Missing branches: " + branchInfo);
    return error(404);
  }

  const releases = await db.releases.where({ repositoryId: project.id });
  return {
    profile,
    project,
    releaseCount: releases.length,
    activeBranch: activeBranch,
    branchlist: Object.keys(repo!.branches).filter((v) => v != activeBranch),
    filelist: await branchInfo.getFileList(),
    commitCount: await branchInfo.getCommitCount(),

    hasMarkdownFile: (await branchInfo.getFile("README.md")) != null,
  };
}) satisfies PageServerLoad;
