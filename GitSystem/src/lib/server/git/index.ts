import { GIT_USER_HOME_FOLDER } from "$lib/server/constants";
import path from "path";

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
