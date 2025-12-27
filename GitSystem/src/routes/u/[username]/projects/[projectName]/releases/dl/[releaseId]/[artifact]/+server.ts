import { getPhysicalReleasesLocation } from "$lib/server/git";
import { join } from "path";
import type { RequestHandler } from "./$types";
import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import { dev } from "$app/environment";
import { createReadStream, existsSync } from "fs";
import mime from "mime-types";
import { Readable } from "stream";
import { error } from "@sveltejs/kit";
import { getUserProject } from "$lib/server/db/tools";

export const GET: RequestHandler = async ({ params, locals }) => {
  const profileReq = await getAccountByName(params.username);
  if (!profileReq || profileReq.error) {
    if (dev) console.log(profileReq);
    return error(404);
  }

  const profile = profileReq.data!;
  const project = await getUserProject(profile.name, params.projectName);
  const relId = parseInt(params.releaseId);

  if (!project || isNaN(relId)) {
    return error(404);
  }

  const pth = join(
    getPhysicalReleasesLocation(project, relId),
    params.artifact,
  );

  if (!existsSync(pth)) return error(404);

  const mimeType = mime.lookup(pth);
  let headers: Record<string, string> = {};
  headers["content-type"] =
    typeof mimeType == "string" ? mimeType : "application/octet-stream";

  return new Response(Readable.toWeb(createReadStream(pth)) as ReadableStream, {
    headers,
  });
};
