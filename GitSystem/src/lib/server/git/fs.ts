import { GIT_USER_HOME_FOLDER } from "$env/static/private";
import path from "path";
import type { Project } from "../db";
import Git from ".";
import type { AccountInfo } from "node-aneauthapi";

export type GitFSFile = {
  mode: string;
  isFile: boolean;
  hash: string;
  filename: string;
  filepath: string;
};

export type Commit = {
  hash: string;
  author: AccountInfo | null;
  date: string;
  email: string;
  message: string;
  commitDate: string;
  age: string;
};

export function getPhysicalProjectLocation(project: {
  name: string;
  authorUsername: string;
}) {
  return path.join(GIT_USER_HOME_FOLDER, project.authorUsername, project.name);
}

export async function getFileList(
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

export async function getFileContent(
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

export async function getCommits(project: Project, branch: string) {
  const gitCommitList = await Git.bridge.runImmediate(
    getPhysicalProjectLocation(project),
    "log",
    `--pretty=format:"Commit: %h%nAuthor: %an <%ae>%nDate: %ad%nMessage: %s%n\t\r\n"`
  );

  console.log(gitCommitList);
  return [];
}

const GitFS = {
  getPhysicalProjectLocation,
  getFileList,
  getFileContent,
  getCommits,
};
export default GitFS;
