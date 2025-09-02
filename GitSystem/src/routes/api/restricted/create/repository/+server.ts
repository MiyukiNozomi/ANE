import { registerRepository } from "$lib/server/db";
import {
  GIT_OBJECT_NAME_MAX,
  GIT_OBJECT_NAME_MIN,
  REPOSITORY_DESCRIPTION_MAX,
} from "$lib/shared/constants";
import { error, json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";
import { createNewRepositoryService } from "./service";

const requestData = z.object({
  name: z.string().min(GIT_OBJECT_NAME_MIN).max(GIT_OBJECT_NAME_MAX),
  description: z.string().max(REPOSITORY_DESCRIPTION_MAX),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.session?.accountInfo) return error(401);
  if (!locals.session.accountInfo.isAdmin) return error(403);

  const data = requestData.safeParse(await request.json());
  if (data.error) {
    return json({ ok: false, message: data.error.message });
  }

  const { name, description } = data.data;

  const gitError = await createNewRepositoryService(
    locals.session.accountInfo,
    name,
    description
  );

  if (gitError)
    return json({
      ok: false,
      message: gitError,
    });

  await registerRepository(name, description, locals.session.accountInfo.name);

  return json({
    ok: true,
  });
};
