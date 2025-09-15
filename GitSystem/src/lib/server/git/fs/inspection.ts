import { GIT_USER_HOME_FOLDER } from "$env/static/private";
import type { Project } from "$lib/server/db";
import path from "path";
import Git from "..";
import { existsSync, statSync } from "fs";

async function getProjectFileReadStream(
  userProject: Project,
  branch: string,
  filepath: string
) {
  return await Git.bridge.runWithPayload(
    "git",
    getPhysicalProjectLocation(userProject),
    null,
    "--no-pager",
    "show",
    "--no-notes",
    "--encoding=UTF-8",
    `${branch}:${filepath}`
  );
}

async function getBranches(project: Project) {
  const gitCommitList = await Git.bridge.runImmediate(
    getPhysicalProjectLocation(project),
    `--no-pager`,
    `branch`,
    `--format=%(refname:short)`
  );

  return gitCommitList
    .toString()
    .split("\n")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function getPhysicalProjectLocation(project: {
  name: string;
  authorUsername: string;
}) {
  const pth = path.join(
    GIT_USER_HOME_FOLDER,
    project.authorUsername,
    project.name
  );

  if (!existsSync(pth) || !statSync(pth).isDirectory())
    throw new Error("Repository " + pth + " does not exist.");

  return pth;
}

export {
  getBranches,
  getProjectFileReadStream,
  getPhysicalProjectLocation,
};
