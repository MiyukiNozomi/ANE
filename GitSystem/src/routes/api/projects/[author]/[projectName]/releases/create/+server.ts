import type { RequestHandler } from "./$types";

import { dev } from "$app/environment";
import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import { getUserProject, isUserContributor } from "$lib/server/db/tools";
import { error } from "@sveltejs/kit";
import { createProjectReleaseService } from "./service";

export const PUT: RequestHandler = async ({ locals, params, request }) => {
  // Ensure we're actually signed in.
  if (!locals.session) return error(401);

  const profileReq = await getAccountByName(params.author);
  if (!profileReq || profileReq.error) {
    if (dev) console.log(profileReq);
    return error(401);
  }

  const profile = profileReq.data!;
  const project = await getUserProject(profile.name, params.projectName);

  if (!project) {
    return error(404);
  }

  if (!isUserContributor(project, locals.session.accountInfo))
    return error(403, "You do not have write-access to this repository."); // Also nope!

  const formData = await request.formData();
  return await createProjectReleaseService(
    locals.session.accountInfo,
    project,
    formData,
  );
};
