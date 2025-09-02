import { GIT_USER_HOME_FOLDER } from "$env/static/private";
import { existsSync, mkdirSync } from "fs";
import type { AccountInfo } from "node-aneauthapi";
import path from "path";
import git from ".";
import Git from ".";

export async function createNewRepository(
  author: AccountInfo,
  name: string,
  description: string
): Promise<string | undefined> {
  if (!author.isAdmin)
    throw new Error("Author is not an admin! this is a bug!");

  if (!Git.bridge.isNameValid(name)) {
    return "Invalid repository name.";
  }

  const outputPath = path.join(GIT_USER_HOME_FOLDER, author.name, name);

  if (existsSync(outputPath)) return "This repository already exists.";

  mkdirSync(outputPath, {
    recursive: true,
  });

  Git.bridge.run(outputPath, "init", "--bare", "--initial-branch=master");
}
