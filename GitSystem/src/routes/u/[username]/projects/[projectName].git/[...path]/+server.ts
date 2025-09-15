import { getUserProject } from "$lib/server/db";
import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { handleGitRequest } from "$lib/server/git/gitHttp";
import { RepositoryInfo } from "$lib/server/git";

const GitHandler: RequestHandler = async ({ locals, params, request, url }) => {
  // Prevent web browsers from... web browsing.
  if (!request.headers.get("user-agent")?.includes("git")) {
    return redirect(302, url.pathname.replace(".git", ""));
  }

  // Ensure we're actually signed in.
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

  if (request.method == "POST" && request.body) {
    // invalidate cache on confirmed PUSH.. not so confirmed actually.
    // TODO: check if there really was a change in the repository's commit count before the update.
    RepositoryInfo.invalidateCache(project);
  }

  return await handleGitRequest(
    // just to ensure this will always be either a post or get
    request.method == "POST" ? "post" : "get",
    project,
    request,
    url,
    params.path
  );
};

export const GET = GitHandler;
export const POST = GitHandler;
