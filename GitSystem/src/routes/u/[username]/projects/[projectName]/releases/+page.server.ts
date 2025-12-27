import { dev } from "$app/environment";
import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { readdirSync } from "fs";
import { getPhysicalReleasesLocation } from "$lib/server/git";
import { db } from "$lib/server/db";
import { getUserProject } from "$lib/server/db/tools";

export const load = (async ({ params, url }) => {
  const profileReq = await getAccountByName(params.username);
  if (!profileReq || profileReq.error) {
    if (dev) console.log(profileReq);
    return error(404);
  }

  const profile = profileReq.data!;
  const project = await getUserProject(profile.name, params.projectName);

  if (!project) {
    return error(404);
  }

  return {
    profile,
    project,
    releases: (await db.releases.where({ repositoryId: project.id })).map(
      (v) => {
        return {
          ...v,
          localFiles: readdirSync(getPhysicalReleasesLocation(project, v.id)),
        };
      },
    ),
  };
}) satisfies PageServerLoad;
