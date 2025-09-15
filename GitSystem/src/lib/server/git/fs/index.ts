import { dev } from "$app/environment";
import { getAllProjects, type Project } from "../../db";
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
   * Holds a global cache of repository information.
   */
  public static infoCache: Record<number, RepositoryInfo> = {};

  public static async onServerInit() {
    const l = await getAllProjects()
    for (const p of l) {
      await this.of(p);
    }
  }

  public static async invalidateCache(project: Project) {
    delete this.infoCache[project.id];
    if (dev)
      console.log(
        "Project " +
        project.authorUsername +
        "#" +
        project.name +
        " has had it's cache invalidated (RELOADING)."
      );

    // immediately load this fucker back up before someone tries to request it
    await this.of(project);
  }

  public static async of(project: Project) {
    if (this.infoCache[project.id]) return this.infoCache[project.id];

    console.log("LOAD ", project.authorUsername + "#" + project.name);

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
