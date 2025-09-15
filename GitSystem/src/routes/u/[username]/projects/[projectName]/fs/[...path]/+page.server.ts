import { getUserProject } from "$lib/server/db";
import type { GitFile } from "$lib/server/git/fs/branch";
import { error, redirect } from "@sveltejs/kit";
import AuthAPI from "node-aneauthapi";
import path from "path";
import type { PageServerLoad } from "./$types";
import { SUPPORTED_LANGUAGES_BY_EXTENSION } from "$lib/shared/constants";
import { RepositoryInfo } from "$lib/server/git";

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

  const repo = await RepositoryInfo.of(project);
  const branchInfo = repo?.branch(activeBranch);

  let directoryEntry = await branchInfo?.getFileList(params.path);
  let individualFile: GitFile | undefined;

  if (!directoryEntry || !branchInfo) {
    directoryEntry = await branchInfo?.getFileList(path.dirname(params.path));
    individualFile = directoryEntry?.children.find(v => v.filepath == params.path);
    if (!directoryEntry || !individualFile)
      return error(404);

    const extension = path.extname(individualFile.filename).substring(1);

    if (!(SUPPORTED_LANGUAGES_BY_EXTENSION as Record<string, string>)[extension])
      return redirect(
        308,
        `/u/${project.authorUsername}/projects/${project.name}/fs-raw/${params.path}`
      );
  }

  return {
    profile,
    project,
    directoryEntry,

    filename: path.basename(params.path),
    individualFile,
  };
}) satisfies PageServerLoad;
