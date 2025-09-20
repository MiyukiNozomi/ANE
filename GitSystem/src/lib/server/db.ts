import { dev } from "$app/environment";
import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";

export const DOMAIN = dev ? "http://localhost:5173" : "https://git.ane.jp.net";
export const ACTIVE_FOLDER = dev ? "./debug-data" : "/home/AZKi/gitSystem";

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

export type Project = Repository & { contributors: Contributor[] };

mkdirSync(ACTIVE_FOLDER, { recursive: true });
export const db = new Database(path.join(ACTIVE_FOLDER, "database.db"));

db.exec(`
CREATE TABLE IF NOT EXISTS repositories (
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

CREATE TABLE IF NOT EXISTS contributors (
    id INTEGER PRIMARY KEY,
    
    contributorUsername TEXT NOT NULL,
    repositoryId INTEGER NOT NULL,

    hasWriteAccess BOOLEAN DEFAULT FALSE,
       
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
 
    FOREIGN KEY (repositoryId) REFERENCES repositories (id) ON DELETE CASCADE
);
`);

export async function getAllProjects() {
  const stmt = db.prepare("SELECT name, authorUsername FROM repositories").all() as Array<{ name: string, authorUsername: string }>;

  let projects = new Array<Project>();

  for (const info of stmt) {
    const p = await getUserProject(info.authorUsername, info.name);
    if (!p) throw new Error("Uhh.. bug?");
    projects.push(p);
  }

  return projects;
}

export async function registerRepository(
  name: string,
  description: string,
  authorUsername: string
) {
  const stmt = db.prepare(`INSERT INTO repositories (
    name,
    description,
    authorUsername
    ) VALUES (?, ?, ?)`);

  stmt.run(name, description, authorUsername);
}

export async function getUserProject(
  authorUsername: string,
  projectName: string
): Promise<Project | null> {
  const stmt = db.prepare(
    `SELECT * FROM repositories WHERE authorUsername = ? AND name = ?`
  );

  const project = stmt.all(authorUsername, projectName)[0] as Repository;

  if (!project) return null;

  let contributors = db
    .prepare("SELECT * FROM contributors WHERE repositoryId = ?")
    .all(project["id"] as number) as Contributor[];

  contributors.unshift({
    id: -1,
    contributorUsername: authorUsername,
    created_at: project.created_at,
    hasWriteAccess: true,
    repositoryId: project.id
  });

  return {
    ...project,
    contributors,
  };
}
