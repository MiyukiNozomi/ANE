import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { invokeGitCGIScript } from "./service";
import { RepositoriesBeingWritten, RepositoryInfo } from "$lib/server/git";
import { getUserProject, isUserContributor } from "$lib/server/db/tools";

const GitHandler: RequestHandler = async ({ locals, params, request, url }) => {
  if (!locals.session)
    return new Response(null, {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="ANE"`,
      },
    });

  const project = await getUserProject(params.username, params.projectName);

  if (!project) return error(404, "Not found.");

  if (!isUserContributor(project, locals.session.accountInfo))
    return error(403, "You do not have write-access to this repository."); // Also nope!

  console.log(
    "Got pushes into " + project.authorUsername + "#" + project.name + " from ",
    locals.session,
  );

  // TODO: check if there really was a change in the repository's commit count before the update.

  // Lock repository
  let count = RepositoriesBeingWritten[project.id.toString()] ?? 0;
  if (count > 0) {
    return new Response(
      "Repository is currently busy, wait a while before running operations.",
      {
        status: 423,
        headers: {
          "Retry-After": "120",
        },
      },
    );
  }

  count++;
  RepositoriesBeingWritten[project.id.toString()] = count;
  RepositoryInfo.invalidateCache(project);

  console.log("REQUEST ", request.method, params);
  console.log("Repository locked: ", project.authorUsername, "#", project.name);
  const response = await invokeGitCGIScript(params, request, project);

  count = RepositoriesBeingWritten[project.id.toString()] ?? 0;
  RepositoriesBeingWritten[project.id.toString()] = count - 1;
  console.log(
    "Repository unlocked: ",
    project.authorUsername,
    "#",
    project.name,
  );
  return response;
};

export const GET = GitHandler;
export const POST = GitHandler;
