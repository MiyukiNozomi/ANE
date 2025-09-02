import { GIT_USER_HOME_FOLDER } from "$env/static/private";
import { existsSync, mkdirSync } from "fs";
import type { AccountInfo } from "node-aneauthapi";
import path from "path";
import Git from ".";

export function getPhysicalProjectLocation(project: {
  name: string;
  authorUsername: string;
}) {
  return path.join(GIT_USER_HOME_FOLDER, project.authorUsername, project.name);
}

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

  const outputPath = getPhysicalProjectLocation({
    name: name,
    authorUsername: author.name,
  });

  if (existsSync(outputPath)) return "This repository already exists.";

  mkdirSync(outputPath, {
    recursive: true,
  });

  Git.bridge.run(outputPath, "init", "--bare", "--initial-branch=master");
}
