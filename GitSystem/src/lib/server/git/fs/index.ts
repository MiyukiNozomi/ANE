import { GIT_USER_HOME_FOLDER } from "$env/static/private";
import path from "path";
import { type Project } from "../../db";
import { BranchFS } from "./branch";
import { getBranches, getPhysicalProjectLocation } from "./inspection";

class RepositoryInfo {
  public repository: Project;
  public branches: Array<string>;
  public branchFS: Record<string, BranchFS>;

  private constructor(repository: Project, branches: Array<string>) {
    this.repository = repository;
    this.branchFS = {};
    this.branches = branches;
  }

  private async __it__load() {
    for (const v of this.branches) {
      this.branchFS[v] = new BranchFS(v, this.repository);
      await this.branchFS[v].__it__load();
    }
  }

  public ofBranch(branch: string) {
    const bfs = this.branchFS[branch];
    if (!bfs) return null;
    return bfs;
  }

  /**
   * Holds a global cache of repository information;
   * Delete an entry (by the project ID) to make it "dirty"
   */
  public static infoCache: Record<number, RepositoryInfo>;

  public static async of(project: Project) {
    if (this.infoCache == undefined) this.infoCache = {};
    if (this.infoCache[project.id]) return this.infoCache[project.id];

    const branches = await getBranches(project);
    const info = new RepositoryInfo(project, branches);

    await info.__it__load();

    this.infoCache[project.id] = info;

    return info;
  }
}

const GitFS = {
  getPhysicalProjectLocation,
  RepositoryInfo,
};
export default GitFS;
