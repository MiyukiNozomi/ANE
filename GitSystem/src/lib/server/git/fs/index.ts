import { dev } from "$app/environment";
import { getAllProjects, type Project } from "../../db";
import { RepositoryBranch } from "./branch";
import { loadRepository } from "./loader";

export class RepositoryInfo {
  public repository: Project;
  public branches: Record<string, RepositoryBranch>;

  constructor(repository: Project, branches: Record<string, RepositoryBranch>) {
    this.repository = repository;
    this.branches = branches;
  }

  public branch(branch: string): RepositoryBranch | null {
    return this.branches[branch] ?? null;
  }

  /**
   * Holds a global cache of repository information.
   */
  private static infoCache: Record<number, RepositoryInfo> = {};

  public static async onServerInit() {
    const projects = await getAllProjects();
    const loadPromises = projects.map(p => loadRepository(p).then(repo => [p.id, repo] as const));
    const loaded = await Promise.all(loadPromises);
    this.infoCache = Object.fromEntries(loaded);
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

    this.infoCache[project.id] = await loadRepository(project);
  }

  public static async of(project: Project): Promise<RepositoryInfo | null> {
    if (!this.infoCache[project.id]) {
      try {
        console.warn(`${project.authorUsername}#${project.name}: Got a cache miss! likely a new repository`);
        this.infoCache[project.id] = await loadRepository(project);
      } catch (err) {
        console.error(err);
        console.warn(`${project.authorUsername}#${project.name}: Oops, failed to load.`);
      }
    }

    return this.infoCache[project.id] ?? null;
  }
}