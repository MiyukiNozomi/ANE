import path from "path";
import { existsSync, statSync } from "fs";
import { GIT_USER_HOME_FOLDER } from "$lib/server/constants";

export function getPhysicalProjectLocation(project: {
  name: string;
  authorUsername: string;
}) {
  const pth = path.join(
    GIT_USER_HOME_FOLDER,
    project.authorUsername,
    "projects",
    project.name,
  );

  if (!existsSync(pth) || !statSync(pth).isDirectory())
    throw new Error("Repository " + pth + " does not exist.");

  return pth;
}

export function getPhysicalReleasesLocation(
  project: {
    name: string;
    authorUsername: string;
  },
  id: number | bigint,
) {
  const pth = path.join(
    GIT_USER_HOME_FOLDER,
    project.authorUsername,
    "releases",
    project.name,
    id.toString(),
  );

  return pth;
}

export * from "./bridge";
export * from "./fs";
