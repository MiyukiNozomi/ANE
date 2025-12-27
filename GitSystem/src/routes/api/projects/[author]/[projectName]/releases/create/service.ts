import type { ClientSideAccount } from "$lib/ANEAuthAPI/apiTypes";
import type { GitAPIError, GitAPIOk } from "$lib/server/api/types";
import { db, type Project } from "$lib/server/db";
import { getPhysicalReleasesLocation, RepositoryInfo } from "$lib/server/git";
import { error, json } from "@sveltejs/kit";
import { execSync } from "child_process";
import { createWriteStream, mkdirSync, rmSync } from "fs";
import { join, resolve } from "path";
import { Readable } from "stream";

export async function createProjectReleaseService(
  accountInfo: ClientSideAccount,
  project: Project,
  formData: FormData,
) {
  const markdownText = formData.get("markdownDesc");
  if (!markdownText || typeof markdownText != "string")
    return error(400, "Missing markdown description.");

  const releaseId = await db.releases.insert({
    repositoryId: project.id,
    contributorUsername: accountInfo.name,
    markdownText,
  });

  const physicalReleasePath = getPhysicalReleasesLocation(project, releaseId);
  mkdirSync(physicalReleasePath, { recursive: true });

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
}
