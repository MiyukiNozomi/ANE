import type { ClientSideAccount } from "$lib/ANEAuthAPI/apiTypes";
import { db, type Project, type Repository } from ".";

export async function getContributingProjects(authorUsername: string) {
  const contributions = await db.contributors.where({
    contributorUsername: authorUsername,
  });

  let projects = new Array<Project>();

  for (const info of contributions) {
    const p = await getProjectById(info.repositoryId);
    if (p) projects.push(p);
  }

  return projects;
}

export async function loadContributors(repository: Repository) {
  let contributors = await db.contributors.where({
    repositoryId: repository.id,
  });

  contributors.unshift({
    id: -1,
    contributorUsername: repository.authorUsername,
    created_at: repository.created_at,
    hasWriteAccess: true,
    repositoryId: repository.id,
  });

  return contributors;
}

export async function getProjectById(id: number): Promise<Project | null> {
  const project = await db.repositories.whereFirst({ id });
  if (!project) return null;
  return {
    ...project,
    contributors: await loadContributors(project),
  };
}

export async function getUserProject(
  authorUsername: string,
  projectName: string,
): Promise<Project | null> {
  const project = await db.repositories.whereFirst({
    authorUsername,
    name: projectName,
  });
  if (!project) return null;
  return {
    ...project,
    contributors: await loadContributors(project),
  };
}

export function isUserContributor(
  project: Project,
  accountInfo: ClientSideAccount,
) {
  return (
    project.authorUsername == accountInfo.name ||
    // AneAUTH has case-insensitive usernames, so we'll keep up that part of the implementation..
    project.contributors.find(
      (v) =>
        v.contributorUsername.toLowerCase() == accountInfo.name.toLowerCase(),
    )
  );
}
