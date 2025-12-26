import type { ClientSideAccount } from "$lib/ANEAuthAPI/apiTypes";
import { getUserProject, registerRepository } from "$lib/server/db";
import { getPhysicalProjectLocation, RepositoryInfo } from "$lib/server/git";
import bridge from "$lib/server/git/bridge";
import { existsSync, mkdirSync } from "fs";

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

  mkdirSync(outputPath, {
    recursive: true,
  });
  await registerRepository(name, description, author.name);

  bridge.runImmediate(outputPath, "init", "--bare", "--initial-branch=master");
  bridge.runImmediate(outputPath, "symbolic-ref", "HEAD", "refs/heads/master");

  await RepositoryInfo.onServerInit();
}
