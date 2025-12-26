import { dev } from "$app/environment";
import { DB_FILE_NAME } from "$lib/server/constants";
import Database from "better-sqlite3";

export const DOMAIN = dev ? "http://localhost:5173" : "https://git.ane.jp.net";

export type Repository = {
  id: number;
  displayName: string;
  name: string;
  description: string;
  authorUsername: string;
  created_at: number;

  /** 0 means == not forked. */
  parentRepositoryId: number;
};

export type Contributor = {
  id: number;
  contributorUsername: string;
  repositoryId: number;
  created_at: number;

  hasWriteAccess: boolean;
};

export type ProjectRelease = {
  id: number;
  contributorUsername: string;
  repositoryId: number;

  markdownText: string;
  created_at: number;
};

export type Project = Repository & { contributors: Contributor[] };

export const db = new Database(DB_FILE_NAME);

db.exec(`
CREATE TABLE IF NOT EXISTS Repositories (
    id INTEGER PRIMARY KEY,
    
    displayName TEXT DEFAULT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    authorUsername TEXT NOT NULL,

    /** is this repository a fork of another?
     * repository ID if yes
     */
    parentRepositoryId INTEGER DEFAULT NULL,

    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')) -- unix time (seconds)
);

CREATE TABLE IF NOT EXISTS Contributors (
    id INTEGER PRIMARY KEY,
    
    contributorUsername TEXT NOT NULL,
    repositoryId INTEGER NOT NULL,

    hasWriteAccess BOOLEAN DEFAULT FALSE,
       
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
 
    FOREIGN KEY (repositoryId) REFERENCES Repositories (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Releases (
    id INTEGER PRIMARY KEY,
    
    contributorUsername TEXT NOT NULL,
    repositoryId INTEGER NOT NULL,

    markdownText TEXT NOT NULL,
       
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
    FOREIGN KEY (repositoryId) REFERENCES Repositories (id) ON DELETE CASCADE
);
`);

export async function getAllProjects() {
  const stmt = db
    .prepare("SELECT name, authorUsername FROM Repositories")
    .all() as Array<{ name: string; authorUsername: string }>;

  let projects = new Array<Project>();

  for (const info of stmt) {
    const p = await getUserProject(info.authorUsername, info.name);
    if (!p) throw new Error("Uhh.. bug?");
    projects.push(p);
  }

  return projects;
}

export async function getOwnedProjects(authorUsername: string) {
  const stmt = db
    .prepare(
      "SELECT name, authorUsername FROM Repositories WHERE authorUsername = ?",
    )
    .all(authorUsername) as Array<{ name: string; authorUsername: string }>;

  let projects = new Array<Project>();

  for (const info of stmt) {
    const p = await getUserProject(info.authorUsername, info.name);
    if (!p) throw new Error("Uhh.. bug?");
    projects.push(p);
  }

  return projects;
}

export async function getContributingProjects(authorUsername: string) {
  const stmt = db
    .prepare(
      "SELECT repositoryId FROM Contributors WHERE contributorUsername = ?",
    )
    .all(authorUsername) as Array<{ repositoryId: number }>;

  let projects = new Array<Project>();

  for (const info of stmt) {
    const p = await getProjectById(info.repositoryId);
    if (!p) throw new Error("Uhh.. bug?");
    projects.push(p);
  }

  return projects;
}

export async function registerRepository(
  name: string,
  description: string,
  authorUsername: string,
) {
  const stmt = db.prepare(`INSERT INTO Repositories (
    name,
    description,
    authorUsername
    ) VALUES (?, ?, ?)`);

  stmt.run(name, description, authorUsername);
}

export async function getProjectById(id: number): Promise<Project | null> {
  const stmt = db.prepare(`SELECT * FROM Repositories WHERE id = ?`);

  const project = stmt.all(id)[0] as Repository;

  if (!project) return null;

  let contributors = db
    .prepare("SELECT * FROM Contributors WHERE repositoryId = ?")
    .all(project["id"] as number) as Contributor[];

  contributors.unshift({
    id: -1,
    contributorUsername: project.authorUsername,
    created_at: project.created_at,
    hasWriteAccess: true,
    repositoryId: project.id,
  });

  return {
    ...project,
    contributors,
  };
}

export async function getUserProject(
  authorUsername: string,
  projectName: string,
): Promise<Project | null> {
  const stmt = db.prepare(
    `SELECT * FROM Repositories WHERE authorUsername = ? AND name = ?`,
  );

  const project = stmt.all(authorUsername, projectName)[0] as Repository;

  if (!project) return null;

  let contributors = db
    .prepare("SELECT * FROM Contributors WHERE repositoryId = ?")
    .all(project["id"] as number) as Contributor[];

  contributors.unshift({
    id: -1,
    contributorUsername: authorUsername,
    created_at: project.created_at,
    hasWriteAccess: true,
    repositoryId: project.id,
  });

  return {
    ...project,
    contributors,
  };
}

/** returns the ID of the release information. */
export async function createRelease(
  repoId: number,
  contributorUsername: string,
  markdownDescription: string,
) {
  return db
    .prepare(
      `INSERT INTO Releases(repositoryId, contributorUsername, markdownText) VALUES (?, ?, ?)`,
    )
    .run(repoId, contributorUsername, markdownDescription).lastInsertRowid;
}

export async function getReleasesOf(repoId: number): Promise<ProjectRelease[]> {
  return db
    .prepare(`SELECT * FROM Releases WHERE repositoryId = ?`)
    .all(repoId) as ProjectRelease[];
}
