import { dev } from "$app/environment";
import type { Project, Repository } from "$lib/server/db";
import path from "path";
import Git from "..";
import {
  getPhysicalProjectLocation,
  getProjectFileReadStream,
} from "./inspection";

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
  date: string;
  message: string;
  age: string;
};

export class BranchFS {
  private branchName: string;
  private repository: Project;

  /** this is a mapping of Directories, not files.*/
  private filelistCache: Record<string, GitFile>;
  private commitCount: number;

  constructor(branchName: string, repository: Project) {
    this.branchName = branchName;
    this.repository = repository;

    this.commitCount = 0;
    this.filelistCache = {};
    this.filelistCache['.'] = {
      children: [],
      filename: "<root>",
      filepath: ".",
      hash: "NULL",
      isFile: false,
      mode: "NULL",
      size: -1
    };
  }

  /***
   * This internal function is used to load up properties of this class.
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

    const pathnames = (
      await Git.bridge.runImmediate(
        getPhysicalProjectLocation(this.repository),
        "ls-tree",
        "-l",
        "-r",
        "-t",
        this.branchName
      )
    )
      .toString()
      .split("\n");

    for (const v of pathnames) {
      let tabIndex = v.indexOf('\t');
      let options = v.substring(0, tabIndex).split(" ").map(v => v.trim()).filter(v => v.length > 0);
      if (options.length == 0) continue; // could be EOF though

      if (options.length < 3 || tabIndex == -1) throw new Error(`
  Server has failed to start: git ls-tree -l -r -t ${this.branchName} did not match the following format:
  mode blob|tree hash fsize\t<pathname>
  
  Miyuki! Verify your commits and production environment.

  Git has given: ${JSON.stringify(options)}
`);


      let filepath = v.substring(tabIndex + 1).trim();
      let filename = path.basename(filepath);
      let parentPath = path.dirname(filepath);

      let thisEntryInfo: GitFile;
      {
        let mode = options[0];
        let isFile = options[1] == "blob";
        let hash = options[2];
        let size = parseInt(options[3]);
        size = isNaN(size /* size may be '-' for dirs */) ? 0 : size;

        thisEntryInfo = {
          filename,
          filepath,
          hash,
          isFile,
          mode,
          size,

          children: []
        }
      }

      let parentDir = this.filelistCache[parentPath];
      if (!parentDir) throw new Error("Out of order? could not get parent directory cache of " + filepath + " (parent " + parentPath + ")");
      parentDir.children.push(thisEntryInfo);

      if (!thisEntryInfo.isFile) {
        this.filelistCache[filepath] = thisEntryInfo;
      }
    }


    Object.values(this.filelistCache).forEach(v => v.children.sort((a, b) => Number(a.isFile) - Number(b.isFile)));
  }

  public async getFileList(pathname: string = '.') {
    const cache = this.filelistCache[pathname.endsWith('/') ? pathname.substring(0, pathname.length - 1) : pathname];
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
    console.log(filename, parentFolderCache);
    return parentFolderCache.children.find(v => v.filename == filename);
  }

  public async createReadStream(file: GitFile) {
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
   * TODO Note: this cannot be easily cached like the filelist, consider finding another way of doing this.
   *            Another possibility would be caching.. but maybe it would be better to have this function run at RepositoryInfo leve?
   * 
   * Anyway, actual documentation now:
   * 
   * This file is intended to give a commit list that should be loaded... lazily.
   * It only loads 100 if desiredFile is undefined, 1 if desiredFile is present.
   * Use beforehash to load the previous list of commits after a certain commit.
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
