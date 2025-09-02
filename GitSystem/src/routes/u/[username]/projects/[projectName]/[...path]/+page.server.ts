import AuthAPI from "node-aneauthapi";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { getUserProject } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import GitFS from "$lib/server/git/fs";

export const load = (async ({ params, request, url }) => {
  const profile = await AuthAPI.getAccountByName(params.username);
  if (!profile) return error(404);

  const project = await getUserProject(profile.name, params.projectName);

  if (!project) {
    return error(404);
  }

  const filelist = await GitFS.getFileList(
    project,
    url.searchParams.get("branch") ?? "master",
    params.path
  );

  console.log(filelist);

  const r = await GitFS.getFileContent(project, "master", "potato.txt");
  console.log(r?.toString());

  return {
    profile,
    project,
    filelist,
  };
}) satisfies PageServerLoad;
