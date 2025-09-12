import { dev } from "$app/environment";
import type { Project, Repository } from "$lib/server/db";
import path from "path";
import Git from "..";
import {
  getPhysicalProjectLocation,
  getProjectFileContent,
  getProjectFileList,
  getProjectFileReadStream,
  type Commit,
  type GitFSFile,
} from "./inspection";

export type GitFileWithMetadata = GitFSFile & {
  lastCommit?: Commit;
};

export class BranchFS {
  private branchName: string;
  private repository: Project;

  private pathnames: string[];
  private filelistCache: Record<string, GitFileWithMetadata[]>;
  private commitCount: number;

  constructor(branchName: string, repository: Project) {
    this.branchName = branchName;
    this.repository = repository;

    this.commitCount = 0;
    this.pathnames = [];
    this.filelistCache = {};
  }

  /*** This function is used to load up properties of this class.
   * Since i cannot ignore async or force it to be synchronous inside of the constructor.
   */
  public async __it__load() {
    this.commitCount = parseInt(
      (
        await Git.bridge.runImmediate(
          getPhysicalProjectLocation(this.repository),
          `rev-list`,
          `--count`,
          this.branchName
        )
      ).toString()
    );

    this.pathnames = (
      await Git.bridge.runImmediate(
        getPhysicalProjectLocation(this.repository),
        "ls-tree",
        "--name-only",
        "-r",
        "-t",
        this.branchName
      )
    )
      .toString()
      .split("\n")
      .map((v) => v.trim());
  }

  public async getFileList(pathname: string) {
    if (pathname.endsWith("/"))
      pathname = pathname.substring(0, pathname.length - 1);
    if (!this.pathnames.includes(pathname) && pathname.length > 0) return null;

    if (dev) console.log("Pathname exists: " + pathname);

    let cache = this.filelistCache[pathname];

    if (!cache) {
      if (dev) console.log("Directory not yet cached: " + pathname);

      const fileList = await getProjectFileList(
        this.repository,
        this.branchName,
        pathname
      );

      cache = new Array();
      for (const v of fileList) {
        cache.push({
          ...v,
          lastCommit: (await this.getCommits(undefined, pathname))[0],
        } satisfies GitFileWithMetadata);
      }

      if (dev) console.log("Cache has been updated for " + pathname);

      this.filelistCache[pathname] = cache;
    } else if (dev) {
      console.log("Cache used for " + pathname);
    }

    return cache;
  }

  public async getFile(pathname: string) {
    if (!this.pathnames.includes(pathname)) {
      return null;
    }

    const filename = path.basename(pathname);
    const parentDir = path.dirname(pathname);

    const directoryListing = await this.getFileList(
      parentDir == "." ? "" : parentDir
    );
    const thisFileInstance = directoryListing?.find(
      (v) => v.filename == filename
    );

    if (!thisFileInstance) return null; // This is HIGHLY Unlikely to happen, considering we should only fall into this function if getFileList has
    // previously returned a non-null array of 0 elements.
    //Still, there could be the possibility of this occuring somehow, and we don't want to take any chances

    return thisFileInstance;
  }

  public async createReadStream(file: GitFSFile) {
    if (!this.pathnames.includes(file.filepath)) return null; // unlikely but could happen if it's from another branch and doesn't exists here

    return await getProjectFileReadStream(
      this.repository,
      this.branchName,
      file.filepath
    );
  }

  /***
   * Kind of hacky, but as BUNGiE developers
   * would say in 2006: doesn't matter if its hacky as long as the players are having fun.
   *
   * TODO: make it unhacky
   *
   * Note: if desiredFile is not undefined, the number of commits will be at maximum 1.
   */
  public async getCommits(beforeHash?: string, desiredFile?: string) {
    const lineSeparator = "Kv!LN";
    const separator =
      "---------------------------------------------------------------";

    let parameters = [
      "--no-pager",
      "log",
      `--max-count=${desiredFile ? 1 : 100}`,
      `--pretty=format:${lineSeparator}hash: %h%n${lineSeparator}author: %an <%ae>%n${lineSeparator}date: %ad%n${lineSeparator}message: %s%n${lineSeparator}age: %cr${separator}`,
      this.branchName,
    ];

    if (beforeHash && beforeHash.match(/^[a-fA-F0-9]+$/))
      parameters.push(beforeHash);

    if (desiredFile) {
      parameters.push("--", desiredFile);
    }

    const gitCommitList = (
      await Git.bridge.runImmediate(
        getPhysicalProjectLocation(this.repository),
        ...parameters
      )
    )
      .toString()
      .split(separator)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    let commits = new Array<Commit>();

    gitCommitList.forEach((v) => {
      let lines = v.split(lineSeparator).map((v) => v.trim());

      let commit: Record<string, Date | string> = {};
      for (const line of lines) {
        const ii = line.indexOf(":");
        if (ii == -1) continue;

        const key = line.substring(0, ii).trim().toLowerCase();
        const value = line.substring(ii + 1).trim();

        commit[key] = key == "date" ? new Date(value) : value;
      }

      commits.push(commit as Commit);
    });

    return commits;
  }

  public getCommitCount() {
    return this.commitCount;
  }
}
