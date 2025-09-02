import Git from "$lib/server/git";
import GitFS from "$lib/server/git/fs";
import { existsSync, mkdirSync } from "fs";
import type { AccountInfo } from "node-aneauthapi";

export async function createNewRepositoryService(
  author: AccountInfo,
  name: string,
  description: string
): Promise<string | undefined> {
  if (!author.isAdmin)
    throw new Error("Author is not an admin! this is a bug!");

  if (!Git.bridge.isNameValid(name)) {
    return "Invalid repository name.";
  }

  const outputPath = GitFS.getPhysicalProjectLocation({
    name: name,
    authorUsername: author.name,
  });

  if (existsSync(outputPath)) return "This repository already exists.";

  mkdirSync(outputPath, {
    recursive: true,
  });

  Git.bridge.runImmediate(
    outputPath,
    "init",
    "--bare",
    "--initial-branch=master"
  );
}
