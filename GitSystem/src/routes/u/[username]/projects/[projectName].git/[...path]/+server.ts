import { getUserProject } from "$lib/server/db";
import Git from "$lib/server/git";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, request, url }) => {
  const project = await getUserProject(params.username, params.projectName);

  if (!project) return error(404);

  // TODO.. private repositories?

  return await Git.handleGitRequest("get", project, request, url, params.path);
};

export const POST: RequestHandler = async ({
  locals,
  params,
  request,
  url,
}) => {
  if (!locals.session)
    // Nope.
    return new Response(null, {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="ANE"`,
      },
    });

  const accountInfo = locals.session.accountInfo;

  const project = await getUserProject(params.username, params.projectName);

  if (!project) return error(404, "Not found.");

  if (
    project.authorUsername != accountInfo.name &&
    // AneAUTH has case-insensitive usernames, so we'll keep up that part of the implementation..
    !project.contributors.find(
      (v) =>
        v.contributorUsername.toLowerCase() == accountInfo.name.toLowerCase()
    )
  )
    return error(403, "You do not have write-access to this repository."); // Also nope!

  console.log("Got pushes into " + project.authorUsername + "#" + project.name);
  return await Git.handleGitRequest("post", project, request, url, params.path);
};
