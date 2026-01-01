import { dev } from "$app/environment";
import { loadContributors } from "$lib/server/db/tools";
import { db, type Project, type Repository } from "../../db";
import { RepositoryBranch } from "./branch";
import { loadRepository } from "./loader";

// Holds a reference count of how many writes to the same repository.
export let RepositoriesBeingWritten: Record<string, number> = {};

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

  public static async revalidate() {
    (await db.repositories.where({})).forEach((v) => this.of(v));
  }

  public static async onServerInit() {
    const projects = await Promise.all(
      (await db.repositories.where({})).map(async (v) => ({
        ...v,
        contributors: await loadContributors(v),
      })),
    );
    const loadPromises = projects.map((p) =>
      loadRepository(p).then((repo) => [p.id, repo] as const),
    );
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
          " has had it's cache invalidated (RELOADING).",
      );
  }

  public static async of(project: Repository): Promise<RepositoryInfo | null> {
    if (
      RepositoriesBeingWritten[project.id.toString()] ||
      RepositoriesBeingWritten[project.id.toString()] > 0
    ) {
      console.warn(
        "Someone tried to read project " +
          project.authorUsername +
          "/" +
          project.name +
          " during a modification!",
      );
      return null;
    }

    if (!this.infoCache[project.id]) {
      try {
        console.warn(
          `${project.authorUsername}#${project.name}: Got a cache miss! likely a new repository (or it had changes.)`,
        );
        this.infoCache[project.id] = await loadRepository({
          ...project,
          contributors: await loadContributors(project),
        });
      } catch (err) {
        console.error(err);
        console.warn(
          `${project.authorUsername}#${project.name}: Oops, failed to load.`,
        );
      }
    }

    return this.infoCache[project.id] ?? null;
  }
}
