import type { RequestHandler } from "./$types";

import { dev } from "$app/environment";
import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import type { GitAPIError, GitAPIOk } from "$lib/server/api/types";
import { createRelease, getUserProject } from "$lib/server/db";
import { getPhysicalReleasesLocation, RepositoryInfo } from "$lib/server/git";
import { error, json } from "@sveltejs/kit";
import { execSync } from "child_process";
import { createWriteStream, mkdirSync, rmSync } from "fs";
import { join, resolve } from "path";
import { Readable } from "stream";

export const PUT: RequestHandler = async ({ locals, params, request }) => {
  // Ensure we're actually signed in.
  if (!locals.session) return error(404);

  const profileReq = await getAccountByName(params.author);
  if (!profileReq || profileReq.error) {
    if (dev) console.log(profileReq);
    return error(404);
  }

  const profile = profileReq.data!;
  const project = await getUserProject(profile.name, params.projectName);

  if (!project) {
    return error(404);
  }

  const accountInfo = locals.session.accountInfo;

  if (
    project.authorUsername != accountInfo.name &&
    // AneAUTH has case-insensitive usernames, so we'll keep up that part of the implementation..
    !project.contributors.find(
      (v) =>
        v.contributorUsername.toLowerCase() == accountInfo.name.toLowerCase(),
    )
  )
    return error(403, "You do not have write-access to this repository."); // Also nope!

  const formData = await request.formData();

  const markdownText = formData.get("markdownDesc");
  if (!markdownText || typeof markdownText != "string")
    return error(400, "Missing markdown description.");

  const releaseId = await createRelease(
    project.id,
    locals.session.accountInfo.name,
    markdownText,
  );

  const physicalReleasePath = getPhysicalReleasesLocation(project, releaseId);
  mkdirSync(physicalReleasePath, { recursive: true });

  // clone into a tar.zst
  let repoInfo = await RepositoryInfo.of(project);
  if (!repoInfo)
    return error(500, "Error! does not physically exist: " + project.name);
  let branch =
    repoInfo.branch("master") ??
    repoInfo.branch("main") ??
    repoInfo.branches[0];
  if (!branch)
    return json({
      error: "ERR_NO_REPOSITORY_TREE",
    } satisfies GitAPIError);

  const clonePath = join(physicalReleasePath, "temp");
  if (!(await branch.cloneFilesOnlyInto(clonePath))) {
    return json({
      error: "ERR_CLONE_FAILED",
    } satisfies GitAPIError);
  }

  execSync(
    `tar -a -cf ${resolve(join(physicalReleasePath, "sources.tgz"))} -C ${resolve(clonePath)} .`,
    { stdio: "inherit" },
  );
  rmSync(clonePath, { recursive: true });
  const artifacts = formData.getAll("artifacts[]");
  if (
    (
      await Promise.all(
        artifacts.map((artifact) => {
          return new Promise<Boolean>((resolve) => {
            if (artifact instanceof File) {
              const writeStream = createWriteStream(
                join(physicalReleasePath, artifact.name),
              );
              writeStream.on("error", () => resolve(false));
              writeStream.on("finish", () => resolve(true));
              Readable.fromWeb(artifact.stream() as any).pipe(writeStream);
            }
          });
        }),
      )
    ).find((v) => !v)
  ) {
    return json({
      error: "ERR_UPLOAD_FAILED",
    } satisfies GitAPIError);
  }

  return json({ data: true } satisfies GitAPIOk);
};
