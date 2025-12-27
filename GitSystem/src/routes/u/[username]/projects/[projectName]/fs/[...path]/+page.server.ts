import type { GitFile } from "$lib/server/git/fs/branch";
import { error, redirect } from "@sveltejs/kit";
import path from "path";
import type { PageServerLoad } from "./$types";
import { SUPPORTED_LANGUAGES_BY_EXTENSION } from "$lib/shared/constants";
import { RepositoryInfo } from "$lib/server/git";
import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import { dev } from "$app/environment";
import { getUserProject } from "$lib/server/db/tools";
import mime from "mime-types";

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

  // just in case
  if (params.path == "/" || params.path.length == 0)
    return redirect(
      308,
      `/u/${project.authorUsername}/projects/${project.name}/`,
    );

  const repo = await RepositoryInfo.of(project);
  const branchInfo = repo?.branch(activeBranch);

  let directoryEntry = await branchInfo?.getFileList(params.path);
  let individualFile: GitFile | undefined;
  let isImage = false;

  if (!directoryEntry || !branchInfo) {
    directoryEntry = await branchInfo?.getFileList(path.dirname(params.path));
    individualFile = directoryEntry?.children.find(
      (v) => v.filepath == params.path,
    );
    if (!directoryEntry || !individualFile) return error(404);

    const extension = path.extname(individualFile.filename).substring(1);

    if (
      !(SUPPORTED_LANGUAGES_BY_EXTENSION as Record<string, string>)[extension]
    ) {
      const lMimeType = await mime.lookup(individualFile.filename);
      if (typeof lMimeType == "string" && lMimeType.startsWith("image")) {
        isImage = true;
      } else {
        return redirect(
          308,
          `/u/${project.authorUsername}/projects/${project.name}/fs-raw/${params.path}`,
        );
      }
    }
  }

  return {
    profile,
    project,
    activeBranch,
    directoryEntry,

    currentReadmeFile: directoryEntry.children.find(
      (v) => v.filename == "README.md" && v.isFile,
    ),

    filename: path.basename(params.path),
    isImage,
    individualFile,
  };
}) satisfies PageServerLoad;
