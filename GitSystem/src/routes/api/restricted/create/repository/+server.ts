import z from "zod";
import type { RequestHandler } from "./$types";
import {
  REPOSITORY_DESCRIPTION_MAX,
  REPOSITORY_NAME_MAX,
  REPOSITORY_NAME_MIN,
} from "$lib/shared/constants";
import { error, json } from "@sveltejs/kit";
import git from "$lib/server/git";

const requestData = z.object({
  name: z.string().min(REPOSITORY_NAME_MIN).max(REPOSITORY_NAME_MAX),
  description: z.string().max(REPOSITORY_DESCRIPTION_MAX),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.session?.accountInfo) return error(401);
  if (!locals.session.accountInfo.isAdmin) return error(403);

  const data = requestData.safeParse(await request.json());
  if (data.error) {
    return error(400);
  }

  const { name, description } = data.data;

  const gitError = await git.createNewRepository(
    locals.session.accountInfo,
    name,
    description
  );

  if (gitError)
    return json({
      ok: false,
      message: gitError,
    });

  return json({
    ok: true,
  });
};
