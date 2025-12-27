import type { ClientSideAccount } from "$lib/ANEAuthAPI/apiTypes";
import type { GitAPIResponse } from "$lib/server/api/types";
import { DEFAULT_REPOSITORY_INIT } from "$lib/server/constants";
import { db } from "$lib/server/db";
import { getUserProject } from "$lib/server/db/tools";
import { getPhysicalProjectLocation, RepositoryInfo } from "$lib/server/git";
import bridge from "$lib/server/git/bridge";
import { cpSync, existsSync } from "fs";

export async function createNewRepositoryService(
  author: ClientSideAccount,
  name: string,
  description: string,
): Promise<GitAPIResponse<any> | undefined> {
  if (!author.isAdmin)
    throw new Error("Author is not an admin! this is a bug!");

  if (!bridge.isNameValid(name)) {
    return {
      error: "ERR_BAD_REPOSITORY_NAME",
    };
  }

  const outputPath = getPhysicalProjectLocation({
    name: name,
    authorUsername: author.name,
  });

  if ((await getUserProject(author.name, name)) || existsSync(outputPath)) {
    return {
      error: "ERR_REPOSITORY_ALREADY_EXISTS",
    };
  }

  cpSync(DEFAULT_REPOSITORY_INIT, outputPath, { recursive: true });
  await db.repositories.insert({
    name,
    description,
    authorUsername: author.name,
  });

  await RepositoryInfo.onServerInit();
}
