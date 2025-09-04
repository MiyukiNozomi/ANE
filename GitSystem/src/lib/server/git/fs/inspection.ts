import { GIT_USER_HOME_FOLDER } from "$env/static/private";
import type { Project } from "$lib/server/db";
import path from "path";
import Git from "..";
import { existsSync, statSync } from "fs";

export type GitFSFile = {
  mode: string;
  isFile: boolean;
  hash: string;
  filename: string;
  filepath: string;
};

export type Commit = {
  hash: string;
  author: string;
  date: string;
  message: string;
  age: string;
};

async function getProjectFileList(
  userProject: Project,
  branch: string,
  parentPath: string
): Promise<Array<GitFSFile>> {
  let gitFileList = (
    await Git.bridge.runImmediate(
      getPhysicalProjectLocation(userProject),
      "ls-tree",
      "-r",
      "-t",
      branch
    )
  )
    .toString()
    .split("\n");

  return gitFileList
    .map((v) => {
      let optionsLength = v.indexOf("\t");

      let options = v.substring(0, optionsLength).split(" ");
      let mode = options[0];
      let isFile = options[1] == "blob";
      let hash = options[2];

      let filepath = v.substring(optionsLength + 1);

      if (
        filepath == parentPath ||
        !filepath.startsWith(parentPath) ||
        filepath.substring(parentPath.length + 1).includes("/")
      )
        return undefined;

      let lastSlash = filepath.lastIndexOf("/");
      let filename =
        lastSlash != -1 ? filepath.substring(lastSlash + 1) : filepath;

      return {
        filename,
        filepath,
        hash,
        isFile,
        mode,
      };
    })
    .filter((v) => v != undefined)
    .sort((a, b) => Number(a.isFile) - Number(b.isFile));
}

async function getProjectFileContent(
  userProject: Project,
  branch: string,
  filepath: string
) {
  const gitFileList = (
    await Git.bridge.runImmediate(
      getPhysicalProjectLocation(userProject),
      "ls-tree",
      "-r",
      "--name-only",
      "-t",
      branch
    )
  )
    .toString()
    .split("\n");

  if (!gitFileList.includes(filepath)) return null;

  return await Git.bridge.runImmediate(
    getPhysicalProjectLocation(userProject),
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
  getProjectFileContent,
  getBranches,
  getProjectFileList,
  getPhysicalProjectLocation,
};
