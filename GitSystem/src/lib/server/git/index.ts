import path from "path";
import { GIT_USER_HOME_FOLDER } from "$env/static/private";
import { existsSync, statSync } from "fs";

export function getPhysicalProjectLocation(project: {
  name: string;
  authorUsername: string;
}) {
  const pth = path.join(
    GIT_USER_HOME_FOLDER,
    project.authorUsername,
    project.name
  );

  if (!existsSync(pth) || !statSync(pth).isDirectory())
    throw new Error("Repository " + pth + " does not exist.");

  return pth;
}

export * from "./bridge";
export * from "./fs";