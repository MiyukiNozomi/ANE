import path from "path";
import type { RepositoryInfo } from ".";
import bridge from "../bridge";
import { getPhysicalProjectLocation } from "..";

export type GitFile = {
  mode: string;
  hash: string;
  filename: string;
  filepath: string;
  size: number;
  isFile: boolean;
  children: GitFile[];
};

export type Commit = {
  hash: string;
  author: string;
  authorEmail: string;
  date: string;
  message: string;
  age: string;
};

/**
 * Represents a repository's branch in-memory
 * 
 * @see loader.ts for how this is loaded.
 */
export class RepositoryBranch {
  public repository: RepositoryInfo;

  public branchName: string;

  /** 
   * This is NOT the number of commits in this.commits, instead
   * it's the FULL count of commits this branch has.
   * 
   * @see RepositoryBranch#commits
   */
  public commitCount: number;

  /** this is a mapping of Directories, not files.*/
  public filelistCache: Record<string, GitFile>;

  /** 
   * list of commits this branch has received. 
   * Has a maximum of loader.ts#MAXIMUM_COMMIT_COUNT_TO_LOAD, which is why
   * it's length is not the same as RepositoryBranch#commitCount.
   */
  public commits: Array<Commit>;

  constructor(repository: RepositoryInfo, branchName: string, commitCount: number) {
    this.repository = repository;
    this.branchName = branchName;
    this.commitCount = commitCount;
    this.commits = new Array();
    this.filelistCache = {
      '.': {
        children: [],
        filename: "<root>",
        filepath: ".",
        hash: "NULL",
        isFile: false,
        mode: "NULL",
        size: 0
      }
    };
  }

  public async getFileList(pathname: string = '.') {
    const normalizedPath = path.normalize(pathname).replace(/\/+$/, '');
    const cache = this.filelistCache[normalizedPath];
    if (!cache) {
      return null;
    }
    return cache;
  }

  public async getFile(pathname: string) {
    const dirname = path.dirname(pathname);
    const parentFolderCache = this.filelistCache[dirname];
    if (!parentFolderCache) {
      return null;
    }

    const filename = path.basename(pathname);
    return parentFolderCache.children.find(v => v.filename == filename);
  }

  public async createReadStream(file: GitFile) {
    try {
      return await bridge.runWithPayload(
        "git",
        getPhysicalProjectLocation(this.repository.repository),
        null,
        "--no-pager",
        "show",
        "--no-notes",
        "--encoding=UTF-8",
        `${this.branchName}:${file.filepath}`
      );
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public getCommitCount() {
    return this.commitCount;
  }
}
