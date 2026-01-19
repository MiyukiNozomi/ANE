import { dev } from "$app/environment";
import { DB_FILE_NAME } from "$lib/server/constants";
import Database from "better-sqlite3";
import { GenericDatabaseTable } from "../ANEDB";

export const DOMAIN = dev ? "http://localhost:5173" : "https://git.ane.jp.net";

export type Repository = {
  id: number;
  displayName: string | null;
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

const sqlite = new Database(DB_FILE_NAME);
export const db = {
  repositories: new GenericDatabaseTable<Repository>(
    "Repositories",
    sqlite,
    {},
    {
      creationStatement: `
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
`,
      extraRequiredColumns: [],
    },
  ),
  contributors: new GenericDatabaseTable<Contributor>(
    "Contributors",
    sqlite,
    {},
    {
      creationStatement: `
    id INTEGER PRIMARY KEY,
    
    contributorUsername TEXT NOT NULL,
    repositoryId INTEGER NOT NULL,

    hasWriteAccess BOOLEAN DEFAULT FALSE,
       
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
 
    FOREIGN KEY (repositoryId) REFERENCES Repositories (id) ON DELETE CASCADE`,
      extraRequiredColumns: [],
    },
  ),
  releases: new GenericDatabaseTable<ProjectRelease>(
    "Releases",
    sqlite,
    {},
    {
      creationStatement: `
    id INTEGER PRIMARY KEY,
    
    contributorUsername TEXT NOT NULL,
    repositoryId INTEGER NOT NULL,

    markdownText TEXT NOT NULL,
       
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
    FOREIGN KEY (repositoryId) REFERENCES Repositories (id) ON DELETE CASCADE`,
      extraRequiredColumns: [],
    },
  ),
};
