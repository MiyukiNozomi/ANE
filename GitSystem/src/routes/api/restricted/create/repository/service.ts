import type { ClientSideAccount } from "$lib/ANEAuthAPI/apiTypes";
import { DEFAULT_REPOSITORY_INIT } from "$lib/server/constants";
import { getUserProject, registerRepository } from "$lib/server/db";
import { getPhysicalProjectLocation, RepositoryInfo } from "$lib/server/git";
import bridge from "$lib/server/git/bridge";
import { cpSync, existsSync, mkdirSync } from "fs";
import path from "path";

export async function createNewRepositoryService(
  author: ClientSideAccount,
  name: string,
  description: string,
): Promise<string | undefined> {
  if (!author.isAdmin)
    throw new Error("Author is not an admin! this is a bug!");

  if (!bridge.isNameValid(name)) {
    return "Invalid repository name.";
  }

  if (await getUserProject(author.name, name)) {
    return "Repository already exists";
  }

  const outputPath = getPhysicalProjectLocation({
    name: name,
    authorUsername: author.name,
  });

  if (existsSync(outputPath)) return "This repository already exists.";

  cpSync(DEFAULT_REPOSITORY_INIT, outputPath, { recursive: true });
  await registerRepository(name, description, author.name);

  await RepositoryInfo.onServerInit();
}
