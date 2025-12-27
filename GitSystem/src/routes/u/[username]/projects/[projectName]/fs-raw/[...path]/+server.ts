import { error } from "@sveltejs/kit";
import mime from "mime-types";
import { Readable } from "stream";
import type { RequestHandler } from "./$types";
import { RepositoryInfo } from "$lib/server/git";
import { dev } from "$app/environment";
import { getAccountByName } from "$lib/ANEAuthAPI/publicAPI";
import { getUserProject } from "$lib/server/db/tools";

export const GET: RequestHandler = async ({ params, url }) => {
  const activeBranch = url.searchParams.get("branch") ?? "master";

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

  const repo = await RepositoryInfo.of(project);
  const branchInfo = repo?.branch(activeBranch);
  const file = await branchInfo?.getFile(params.path);

  if (!branchInfo || !file || !file.isFile) return error(404);

  const readStream = await branchInfo!.createReadStream(file);
  if (!readStream) return error(500, "Could not create read stream.");

  const mimeType = mime.lookup(file.filename);
  let headers: Record<string, string> = {};
  headers["content-type"] =
    typeof mimeType == "string" ? mimeType : "application/octet-stream";
  headers["cache-control"] = "max-age=240";

  return new Response(Readable.toWeb(readStream) as ReadableStream, {
    headers,
  });
};
