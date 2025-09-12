import { getUserProject } from "$lib/server/db";
import GitFS from "$lib/server/git/fs";
import type { GitFSFile } from "$lib/server/git/fs/inspection";
import { error, redirect } from "@sveltejs/kit";
import AuthAPI from "node-aneauthapi";
import path from "path";
import type { PageServerLoad } from "./$types";
import { SUPPORTED_LANGUAGES_BY_EXTENSION } from "$lib/shared/constants";

export const load = (async ({ params, url }) => {
  const activeBranch = url.searchParams.get("branch") ?? "master";

  const profile = await AuthAPI.getAccountByName(params.username);
  if (!profile) return error(404);

  const project = await getUserProject(profile.name, params.projectName);

  if (!project) {
    return error(404);
  }

  // just in case
  if (params.path == "/" || params.path.length == 0)
    return redirect(
      308,
      `/u/${project.authorUsername}/projects/${project.name}/`
    );

  const repo = await GitFS.RepositoryInfo.of(project);
  const branchInfo = repo.ofBranch(activeBranch);
  const filelist = await branchInfo?.getFileList(params.path);

  if (!filelist || !branchInfo) {
    return error(404);
  }

  let individualFile: GitFSFile | undefined = undefined;
  if (filelist.length == 0) {
    // ok, clearly it exists and isn't a directory.
    const file = await branchInfo.getFile(params.path);
    if (!file) return error(404); // definitely impossible to happen, but still.

    const extension = path.extname(file.filename).substring(1);

    if (!SUPPORTED_LANGUAGES_BY_EXTENSION[extension])
      return redirect(
        308,
        `/u/${project.authorUsername}/projects/${project.name}/fs-raw/${params.path}`
      );

    individualFile = file;
  }

  return {
    profile,
    project,
    filelist,

    filename: path.basename(params.path),
    individualFile,
  };
}) satisfies PageServerLoad;
